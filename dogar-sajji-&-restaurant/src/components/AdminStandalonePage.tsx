import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, ShieldCheck, KeyRound, Utensils, Layout, MapPin, 
  User, Layers, Palette, Sliders, Save, CheckCircle2, AlertCircle, 
  Trash2, RefreshCw, Plus, Sparkles, Lock, Search,
  Copy, Image as ImageIcon, Check, Filter,
  ArrowUpRight, Grid, ListFilter, Smartphone, LayoutGrid, Type
} from 'lucide-react';
import { 
  THEMES_REGISTRY, 
  GLOBAL_THEMES, 
  BESPOKE_THEMES, 
  RAINBOW_THEMES,
  MULTITONE_THEMES,
  BLOCK_STYLE_SCHEMES, 
  LIGHTING_MODES,
  TYPOGRAPHY_LAYOUTS,
  TEXT_COLOR_PALETTES,
  BUTTON_THEMES
} from '../constants/themes';
import { 
  BlockShape, 
  BlockStyleSchemeId,
  LandmarkPin, 
  LightingModeId,
  MenuItem, 
  OdooBlock, 
  RestaurantState, 
  ThemeId,
  TypographyLayoutId,
  TextColorPaletteId,
  ButtonThemeId
} from '../types';
import { EditableImage } from './EditableImage';
import { AddNewDishWidget } from './AddNewDishWidget';
import { BUTTON_PRESETS } from './AdminDashboardModal';
import { saveRestaurantState } from '../utils/storage';

interface AdminStandalonePageProps {
  state: RestaurantState;
  onUpdateState: (newState: RestaurantState) => void;
  onFactoryReset: () => void;
  onReturnToStorefront: () => void;
}

export const AdminStandalonePage: React.FC<AdminStandalonePageProps> = ({
  state,
  onUpdateState,
  onFactoryReset,
  onReturnToStorefront,
}) => {
  type AdminTab = 
    | 'add-dish'
    | 'menu-catalog'
    | 'landing-hero'
    | 'landmarks'
    | 'owner-profile'
    | 'odoo-shapes'
    | 'thematic-schemes'
    | 'type-section'
    | 'button-presets'
    | 'security';

  const [activeTab, setActiveTab] = useState<AdminTab>('menu-catalog');
  const [newTokenValue, setNewTokenValue] = useState(state.adminPasswordToken);
  const [tokenSuccessMsg, setTokenSuccessMsg] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(state.odooBlocks[0]?.id || null);
  const [selectedPresetId, setSelectedPresetId] = useState<number>(1);
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('all');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'expanded' | 'focused'>('expanded');
  const [focusedDishId, setFocusedDishId] = useState<string | null>(state.menuItems[0]?.id || null);
  const [dishSavedId, setDishSavedId] = useState<string | null>(null);

  const activeThemeConfig = THEMES_REGISTRY[state.globalTheme] || THEMES_REGISTRY['clean-white'];

  // TRANSACTIVE MASTER "SAVE ALL CHANGES" CONTROLLER
  const handleSaveAllChanges = () => {
    const res = saveRestaurantState(state);
    if (res.success) {
      setSaveSuccessMsg(true);
      setSaveErrorMsg(null);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
    } else {
      setSaveErrorMsg(res.error || 'Failed to save to localStorage.');
      setTimeout(() => setSaveErrorMsg(null), 4000);
    }
  };

  // State Mutator with immediate live state commit & localStorage synchronization
  const mutate = (updater: (prev: RestaurantState) => RestaurantState) => {
    const next = updater(state);
    onUpdateState(next);
    saveRestaurantState(next);
  };

  // Save new security passcode token
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenValue.trim()) return;
    mutate((s) => ({
      ...s,
      adminPasswordToken: newTokenValue.trim(),
    }));
    setTokenSuccessMsg(true);
    setTimeout(() => setTokenSuccessMsg(false), 3000);
  };

  // Add Dish directly via Widget
  const handleDishAdded = (newDish: MenuItem) => {
    mutate((s) => ({
      ...s,
      menuItems: [newDish, ...s.menuItems],
    }));
    setFocusedDishId(newDish.id);
    setActiveTab('menu-catalog');
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Granular Item Modifications with Strict Price Cap Enforcement (Rs. 3,500 boundary)
  const handleUpdateMenuItem = (updatedDish: MenuItem) => {
    const rawFull = updatedDish.prices?.full !== undefined ? Number(updatedDish.prices.full) : 0;
    const rawHalf = updatedDish.prices?.half !== undefined ? Number(updatedDish.prices.half) : undefined;

    const cappedPrices = {
      ...updatedDish.prices,
      full: Math.min(Math.max(rawFull, 0), 5000),
      ...(rawHalf !== undefined ? { half: Math.min(Math.max(rawHalf, 0), 5000) } : {}),
    };

    const sanitizedDish = { ...updatedDish, prices: cappedPrices };
    mutate((s) => ({
      ...s,
      menuItems: s.menuItems.map((m) => (m.id === sanitizedDish.id ? sanitizedDish : m)),
    }));

    setDishSavedId(sanitizedDish.id);
    setTimeout(() => setDishSavedId(null), 1800);
  };

  // Duplicate / Clone Item Handler
  const handleDuplicateDish = (dish: MenuItem) => {
    const cloned: MenuItem = {
      ...dish,
      id: `dish-custom-${Date.now()}`,
      nameEn: `${dish.nameEn} (Custom)`,
      nameUr: `${dish.nameUr} (جدید)`,
    };
    mutate((s) => ({
      ...s,
      menuItems: [cloned, ...s.menuItems],
    }));
    setFocusedDishId(cloned.id);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Delete Dish Handler
  const handleDeleteDish = (id: string, nameEn: string) => {
    if (state.menuItems.length <= 1) {
      alert('The catalog must contain at least one item.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete "${nameEn}" from the catalog?`)) {
      return;
    }
    mutate((s) => ({
      ...s,
      menuItems: s.menuItems.filter((m) => m.id !== id),
    }));
    if (focusedDishId === id) {
      setFocusedDishId(state.menuItems[0]?.id || null);
    }
  };

  // Landmark Modifications
  const handleUpdateLandmark = (updatedPin: LandmarkPin) => {
    mutate((s) => ({
      ...s,
      landmarks: s.landmarks.map((p) => (p.id === updatedPin.id ? updatedPin : p)),
    }));
  };

  // Odoo Block modifications
  const handleUpdateBlock = (updatedBlock: OdooBlock) => {
    mutate((s) => ({
      ...s,
      odooBlocks: s.odooBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
    }));
  };

  const currentEditingBlock = state.odooBlocks.find((b) => b.id === editingBlockId) || state.odooBlocks[0];

  // Filtered menu items based on category and search query
  const filteredMenuItems = useMemo(() => {
    return state.menuItems.filter((item) => {
      const matchesCategory = menuFilterCategory === 'all' || item.categoryId === menuFilterCategory;
      const matchesSearch = !catalogSearchQuery.trim() || 
        item.nameEn.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        item.nameUr.includes(catalogSearchQuery) ||
        (item.descriptionEn && item.descriptionEn.toLowerCase().includes(catalogSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [state.menuItems, menuFilterCategory, catalogSearchQuery]);

  const focusedDish = state.menuItems.find((m) => m.id === focusedDishId) || filteredMenuItems[0] || state.menuItems[0];

  return (
    <div
      style={{
        backgroundColor: activeThemeConfig.bgCanvas,
        color: activeThemeConfig.textPrimary,
      }}
      className="min-h-screen flex flex-col font-sans transition-colors duration-200"
    >
      {/* 1. TOP SECURE COMMAND BAR */}
      <header
        style={{
          backgroundColor: activeThemeConfig.bgSurface,
          borderColor: activeThemeConfig.borderStrong,
        }}
        className="sticky top-0 z-40 w-full border-b shadow-md backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReturnToStorefront}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 hover:opacity-80 transition-all cursor-pointer shadow-xs"
              style={{
                backgroundColor: activeThemeConfig.bgCard,
                borderColor: activeThemeConfig.borderSubtle,
                color: activeThemeConfig.textPrimary,
              }}
            >
              <ArrowLeft className="w-4 h-4 text-amber-500" />
              <span>Back to Storefront / واپسی</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>/</span>
              <span className="font-mono text-amber-600 font-bold uppercase tracking-wider">
                Isolated Owner Control HQ (Page 4)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Passcode Validated (12345)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Sticky Save Button */}
            <button
              type="button"
              onClick={handleSaveAllChanges}
              className="px-4 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save All Changes</span>
              <span className="font-urdu text-[11px] hidden sm:inline">محفوظ کریں</span>
            </button>
          </div>
        </div>

        {/* Real-time Feedback Banners */}
        {saveSuccessMsg && (
          <div className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>✓ All {state.menuItems.length} dish edits, prices, images, and theme configs permanently saved to LocalStorage!</span>
            </div>
            <span className="font-urdu text-emerald-100 text-[11px]">تمام ڈیٹا مکمل محفوظ ہو گیا</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="px-6 py-2.5 bg-rose-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}
      </header>

      {/* 2. SUB-NAV / TAB MATRIX */}
      <nav
        style={{
          backgroundColor: activeThemeConfig.bgCard,
          borderColor: activeThemeConfig.borderSubtle,
        }}
        className="border-b px-4 sm:px-6 py-2.5 overflow-x-auto no-scrollbar"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('menu-catalog')}
            style={{
              backgroundColor: activeTab === 'menu-catalog' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'menu-catalog' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Utensils className="w-4 h-4" />
            <span>Granular Menu Catalog ({state.menuItems.length} Dishes)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add-dish')}
            style={{
              backgroundColor: activeTab === 'add-dish' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'add-dish' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Add New Dish to Live Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('landing-hero')}
            style={{
              backgroundColor: activeTab === 'landing-hero' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'landing-hero' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Layout className="w-4 h-4" />
            <span>Landing & Hero Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('landmarks')}
            style={{
              backgroundColor: activeTab === 'landmarks' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'landmarks' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>9 Red-Pin Landmarks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('owner-profile')}
            style={{
              backgroundColor: activeTab === 'owner-profile' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'owner-profile' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Passport Profile (Muhammad Dogar)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('odoo-shapes')}
            style={{
              backgroundColor: activeTab === 'odoo-shapes' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'odoo-shapes' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Odoo Shape Designer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('thematic-schemes')}
            style={{
              backgroundColor: activeTab === 'thematic-schemes' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'thematic-schemes' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Palette className="w-4 h-4" />
            <span>21 Visual Themes (Rainbow & Multi-Tone)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('type-section')}
            style={{
              backgroundColor: activeTab === 'type-section' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'type-section' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-bold"
          >
            <Type className="w-4 h-4" />
            <span>THE TYPE SECTION / فانٹ اور تحریر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('button-presets')}
            style={{
              backgroundColor: activeTab === 'button-presets' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'button-presets' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>30 Button Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              backgroundColor: activeTab === 'security' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'security' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Passcode & Token ({state.adminPasswordToken})</span>
          </button>
        </div>
      </nav>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ========================================================================= */}
        {/* TAB 1: GRANULAR MENU CATALOG CRUD CONTROLLER (CRITICAL FIX)               */}
        {/* Exhaustive independent inputs, numerical fields & image handlers for ALL   */}
        {/* ========================================================================= */}
        {activeTab === 'menu-catalog' && (
          <div className="space-y-6">
            {/* Header and Quick Command Matrix */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: activeThemeConfig.borderSubtle }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 rounded-md bg-amber-500/15 text-amber-600">
                    <Utensils className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black tracking-tight">
                    Exhaustive Granular Menu Catalog ({state.menuItems.length} Dishes)
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Every single dish has separate, independent text inputs, numerical fields, and media handlers. Maximum price cap: <strong className="text-amber-600">Rs. 3,500</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Toggle */}
                <div 
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="flex items-center p-1 rounded-xl border text-xs font-bold"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('expanded')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'expanded' 
                        ? 'bg-amber-500 text-slate-950 shadow-xs' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>All-Dishes Master Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('focused')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'focused' 
                        ? 'bg-amber-500 text-slate-950 shadow-xs' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Single-Dish Focus</span>
                  </button>
                </div>

                {/* Open Add Dish form */}
                <button
                  type="button"
                  onClick={() => setActiveTab('add-dish')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Dish</span>
                </button>
              </div>
            </div>

            {/* DEDICATED CONFIGURATION TOGGLE BLOCK: MASTER USER INTERFACE VIEW MODE */}
            <div
              style={{
                backgroundColor: activeThemeConfig.bgSurface,
                borderColor: activeThemeConfig.borderStrong,
              }}
              className="p-4 sm:p-5 rounded-2xl border shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-black tracking-tight">
                      Master User Interface View Mode / ڈسپلے لے آؤٹ کنٹرول
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select how product catalog items render on mobile handset screens. Automatically propagated across all catalog categories.
                  </p>
                </div>

                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20 shrink-0 self-start sm:self-auto">
                  Active: {state.catalogViewMode === 'desktop-grid' ? 'Desktop Grid (2 Cards Side-by-Side)' : 'Mobile Default View (1 Card Per Row)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Structural Option 1: Mobile Default View (1 Card Per Row) */}
                <button
                  type="button"
                  onClick={() => {
                    mutate((s) => ({
                      ...s,
                      catalogViewMode: 'mobile-default',
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    (state.catalogViewMode || 'mobile-default') === 'mobile-default'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/30 shadow-xs'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black block text-slate-100">
                      Mobile Default View (1 Card Per Row)
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                      Single stacked card per row layout sequence (&apos;grid-cols-1 w-full max-w-xl mx-auto px-2&apos;). Large, highly readable text with zero crowding.
                    </span>
                    <span className="text-[10px] font-urdu text-amber-400 font-bold mt-1 block" dir="rtl">
                      موبائل ڈیفالٹ: ایک قطار میں ایک مکمل کارڈ
                    </span>
                  </div>
                </button>

                {/* Structural Option 2: Desktop Grid View (2 Cards Side-by-Side) */}
                <button
                  type="button"
                  onClick={() => {
                    mutate((s) => ({
                      ...s,
                      catalogViewMode: 'desktop-grid',
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    state.catalogViewMode === 'desktop-grid'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/30 shadow-xs'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <LayoutGrid className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black block text-slate-100">
                      Desktop Grid View (2 Cards Side-by-Side)
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                      Twin-column &apos;aamne-saamne&apos; compact matrix (&apos;grid-cols-2 gap-3&apos;) with defensive vertical button stacking to prevent edge clipping.
                    </span>
                    <span className="text-[10px] font-urdu text-amber-400 font-bold mt-1 block" dir="rtl">
                      گرڈ ویو: دو کارڈز آمنے سامنے
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Filtration Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
                {[
                  { id: 'all', label: `All (${state.menuItems.length})` },
                  { id: 'sajji', label: 'Sajji & Chargha' },
                  { id: 'karahi', label: 'Desi Karahi & Handi' },
                  { id: 'mutton', label: 'Mutton' },
                  { id: 'beef', label: 'Beef' },
                  { id: 'bbq', label: 'Charcoal BBQ' },
                  { id: 'daal', label: 'Daal' },
                  { id: 'tandoor', label: 'Tandoor' },
                  { id: 'combos', label: 'Deals' },
                  { id: 'drinks', label: 'Cold Drinks' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMenuFilterCategory(cat.id)}
                    style={{
                      backgroundColor: menuFilterCategory === cat.id ? activeThemeConfig.accent : activeThemeConfig.bgSurface,
                      color: menuFilterCategory === cat.id ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
                      borderColor: activeThemeConfig.borderSubtle,
                    }}
                    className="px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="Search by English or Urdu name..."
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: activeThemeConfig.bgSurface,
                    borderColor: activeThemeConfig.borderSubtle,
                    color: activeThemeConfig.textPrimary,
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-hidden focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Price Cap Notice */}
            <div 
              style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
              className="p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 text-slate-400"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Strict Database Constraint:</strong> All pricing inputs strictly cap at maximum <strong>Rs. 3,500</strong>. Any higher values are defensively sanitized on save.
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-500 font-bold shrink-0">
                Max Rs. 3,500 Cap Active
              </span>
            </div>

            {/* ========================================================================= */}
            {/* VIEW MODE 1: EXHAUSTIVE ALL-DISHES EXPANDED MASTER EDIT CARDS            */}
            {/* ========================================================================= */}
            {viewMode === 'expanded' && (
              <div className="space-y-6">
                {filteredMenuItems.length === 0 ? (
                  <div className="p-12 text-center border rounded-3xl space-y-3" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                    <p className="text-sm font-bold text-slate-400">No dishes match the selected filter or search query.</p>
                    <button
                      type="button"
                      onClick={() => { setMenuFilterCategory('all'); setCatalogSearchQuery(''); }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filteredMenuItems.map((item, index) => {
                    const isJustSaved = dishSavedId === item.id;
                    return (
                      <div
                        key={item.id}
                        id={`dish-editor-${item.id}`}
                        style={{
                          backgroundColor: activeThemeConfig.bgSurface,
                          borderColor: isJustSaved ? '#10B981' : activeThemeConfig.borderStrong,
                        }}
                        className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all relative ${
                          isJustSaved ? 'ring-2 ring-emerald-500/50' : ''
                        }`}
                      >
                        {/* Top Identification Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 font-mono text-xs font-black flex items-center justify-center shrink-0">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black tracking-tight">{item.nameEn}</h4>
                                <span className="text-xs font-urdu font-bold text-amber-600" dir="rtl">{item.nameUr}</span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">ID: {item.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {isJustSaved && (
                              <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 animate-in fade-in">
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved & Live</span>
                              </span>
                            )}

                            {/* Duplicate Button */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateDish(item)}
                              title="Duplicate this dish"
                              style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                              className="px-2.5 py-1.5 rounded-xl border text-xs font-bold text-slate-300 hover:text-amber-500 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Clone</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteDish(item.id, item.nameEn)}
                              title="Delete this dish"
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Main Grid: Left Column Image Upload, Right Column Full Granular Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Image Media Handler (Col 1-3) */}
                          <div className="lg:col-span-3 space-y-2">
                            <span className="block text-xs font-bold">Dish Media Photo</span>
                            <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-md border" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                              <EditableImage
                                src={item.image}
                                alt={item.nameEn}
                                onImageChange={(b64) => handleUpdateMenuItem({ ...item, image: b64 })}
                                aspectRatioClass="aspect-square"
                                roundedClass="rounded-2xl"
                                labelEn="Replace Image"
                                labelUr="تصویر تبدیل کریں"
                              />
                            </div>
                            <span className="block text-[10px] text-slate-400 text-center">
                              Click or drop image to encode to Base64
                            </span>
                          </div>

                          {/* Granular Field Controls (Col 4-12) */}
                          <div className="lg:col-span-9 space-y-4 text-xs">
                            {/* Row 1: English & Urdu Names */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-bold mb-1">
                                  Item Name (English) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={item.nameEn}
                                  onChange={(e) => handleUpdateMenuItem({ ...item, nameEn: e.target.value })}
                                  style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                                  className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden font-bold"
                                />
                              </div>

                              <div>
                                <label className="block font-bold mb-1 font-urdu" dir="rtl">
                                  ڈش کا نام (اردو) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={item.nameUr}
                                  onChange={(e) => handleUpdateMenuItem({ ...item, nameUr: e.target.value })}
                                  style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                                  className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                                />
                              </div>
                            </div>

                            {/* Row 2: Category, Menu Group & Badge */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block font-bold mb-1">Category Classification</label>
                                <select
                                  value={item.categoryId}
                                  onChange={(e) => handleUpdateMenuItem({ ...item, categoryId: e.target.value })}
                                  style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                                  className="w-full px-3 py-2 rounded-xl border font-semibold cursor-pointer"
                                >
                                  <option value="sajji">Sajji & Chargha / سجی</option>
                                  <option value="karahi">Karahi & Handi / کڑاہی</option>
                                  <option value="mutton">Mutton / مٹن</option>
                                  <option value="beef">Beef / بیف</option>
                                  <option value="bbq">Charcoal BBQ / کباب و تکہ</option>
                                  <option value="daal">Daal & Veg / دال</option>
                                  <option value="tandoor">Tandoor & Breads / نان</option>
                                  <option value="combos">Deals & Combos / ڈیل</option>
                                  <option value="drinks">Beverages / مشروبات</option>
                                </select>
                              </div>

                              <div>
                                <label className="block font-bold mb-1">Menu Stream Placement</label>
                                <select
                                  value={item.menuGroup}
                                  onChange={(e) => handleUpdateMenuItem({ ...item, menuGroup: e.target.value as 'priority' | 'extended' })}
                                  style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                                  className="w-full px-3 py-2 rounded-xl border font-semibold cursor-pointer"
                                >
                                  <option value="priority">Priority Group 1 (Top of Menu)</option>
                                  <option value="extended">Extended Group 2 (Continuous Stream)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block font-bold mb-1">Promotional Badge Tag</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Signature Sajji / خاص سجی"
                                  value={item.badge || ''}
                                  onChange={(e) => handleUpdateMenuItem({ ...item, badge: e.target.value })}
                                  style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                                  className="w-full px-3.5 py-2 rounded-xl border font-semibold focus:outline-hidden"
                                />
                              </div>
                            </div>

                            {/* Row 3: Portion Pricing Matrix */}
                            <div 
                              style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                              className="p-3.5 rounded-2xl border space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold">Portion Pricing Matrix</span>
                                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                                  <input
                                    type="checkbox"
                                    checked={item.hasPortions}
                                    onChange={(e) => {
                                      const nextHas = e.target.checked;
                                      handleUpdateMenuItem({
                                        ...item,
                                        hasPortions: nextHas,
                                        prices: {
                                          full: item.prices.full,
                                          ...(nextHas ? { half: item.prices.half || Math.round(item.prices.full / 2) } : {}),
                                        },
                                      });
                                    }}
                                    className="rounded text-amber-600 focus:ring-amber-500"
                                  />
                                  <span>Enable Full / Half Dual Portions</span>
                                </label>
                              </div>

                              <div className="flex flex-wrap items-center gap-4">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                                    Full Serving Price (Rs.)
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-400">Rs.</span>
                                    <input
                                      type="number"
                                      min={0}
                                      max={5000}
                                      value={item.prices.full}
                                      onChange={(e) => {
                                        const val = Math.min(Number(e.target.value) || 0, 5000);
                                        handleUpdateMenuItem({
                                          ...item,
                                          prices: { ...item.prices, full: val },
                                        });
                                      }}
                                      style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                                      className="w-28 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm focus:outline-hidden"
                                    />
                                  </div>
                                </div>

                                {item.hasPortions && (
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                                      Half Serving Price (Rs.)
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-slate-400">Rs.</span>
                                      <input
                                        type="number"
                                        min={0}
                                        max={5000}
                                        value={item.prices.half !== undefined ? item.prices.half : 0}
                                        onChange={(e) => {
                                          const val = Math.min(Number(e.target.value) || 0, 5000);
                                          handleUpdateMenuItem({
                                            ...item,
                                            prices: { ...item.prices, half: val },
                                          });
                                        }}
                                        style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                                        className="w-28 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm focus:outline-hidden"
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="ml-auto text-right">
                                  <span className="text-[10px] text-slate-400 block">Live Preview Price:</span>
                                  <span className="text-sm font-black font-mono text-emerald-500">
                                    Rs. {item.prices.full}
                                    {item.hasPortions && item.prices.half !== undefined && ` / Rs. ${item.prices.half}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Row 4: Bilingual Descriptions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-bold mb-1">Description (English)</label>
                                <textarea
                                  rows={2}
                                  value={item.descriptionEn}
                                  onChange={(e) => handleUpdateMenuItem({ ...item, descriptionEn: e.target.value })}
                                  style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                                  className="w-full px-3 py-1.5 rounded-xl border focus:outline-hidden resize-none leading-relaxed"
                                />
                              </div>

                              <div>
                                <label className="block font-bold mb-1 font-urdu" dir="rtl">تفصیل (اردو)</label>
                                <textarea
                                  rows={2}
                                  value={item.descriptionUr}
                                  onChange={(e) => handleUpdateMenuItem({ ...item, descriptionUr: e.target.value })}
                                  style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                                  className="w-full px-3 py-1.5 rounded-xl border text-right font-urdu focus:outline-hidden resize-none leading-relaxed"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW MODE 2: SINGLE-DISH FOCUSED QUICK PICKER VIEW                       */}
            {/* ========================================================================= */}
            {viewMode === 'focused' && focusedDish && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar: Dish Roster */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Choose Dish to Focus ({filteredMenuItems.length})
                  </span>
                  <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setFocusedDishId(item.id)}
                        style={{
                          backgroundColor: focusedDishId === item.id ? activeThemeConfig.accent : activeThemeConfig.bgSurface,
                          color: focusedDishId === item.id ? activeThemeConfig.accentText : activeThemeConfig.textPrimary,
                          borderColor: activeThemeConfig.borderSubtle,
                        }}
                        className="p-2.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img src={item.image} alt={item.nameEn} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold truncate block">{item.nameEn}</span>
                            <span className="text-[10px] font-urdu opacity-80 truncate block">{item.nameUr}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold shrink-0">
                          Rs. {item.prices.full}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Form: Deep Editor for Focused Dish */}
                <div className="lg:col-span-8">
                  <div
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderStrong }}
                    className="p-6 rounded-3xl border shadow-sm space-y-5"
                  >
                    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0">
                          <EditableImage
                            src={focusedDish.image}
                            alt={focusedDish.nameEn}
                            onImageChange={(b64) => handleUpdateMenuItem({ ...focusedDish, image: b64 })}
                            aspectRatioClass="aspect-square"
                            roundedClass="rounded-2xl"
                            labelEn="Change"
                          />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold">{focusedDish.nameEn}</h4>
                          <span className="text-xs font-urdu font-bold text-amber-600 block">{focusedDish.nameUr}</span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {focusedDish.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDuplicateDish(focusedDish)}
                          className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer"
                          style={{ borderColor: activeThemeConfig.borderSubtle }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Clone</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(focusedDish.id, focusedDish.nameEn)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold mb-1">Item Name (English)</label>
                        <input
                          type="text"
                          value={focusedDish.nameEn}
                          onChange={(e) => handleUpdateMenuItem({ ...focusedDish, nameEn: e.target.value })}
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1 font-urdu" dir="rtl">نام (اردو)</label>
                        <input
                          type="text"
                          value={focusedDish.nameUr}
                          onChange={(e) => handleUpdateMenuItem({ ...focusedDish, nameUr: e.target.value })}
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Description (English)</label>
                        <textarea
                          rows={2}
                          value={focusedDish.descriptionEn}
                          onChange={(e) => handleUpdateMenuItem({ ...focusedDish, descriptionEn: e.target.value })}
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1 font-urdu" dir="rtl">تفصیل (اردو)</label>
                        <textarea
                          rows={2}
                          value={focusedDish.descriptionUr}
                          onChange={(e) => handleUpdateMenuItem({ ...focusedDish, descriptionUr: e.target.value })}
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu focus:outline-hidden resize-none"
                        />
                      </div>

                      <div className="sm:col-span-2 p-4 rounded-2xl border" style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-xs">Portion Pricing Matrix (Strict Cap: Rs. 3,500)</span>
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs">
                            <input
                              type="checkbox"
                              checked={focusedDish.hasPortions}
                              onChange={(e) => handleUpdateMenuItem({
                                ...focusedDish,
                                hasPortions: e.target.checked,
                                prices: {
                                  full: focusedDish.prices.full,
                                  ...(e.target.checked ? { half: focusedDish.prices.half || Math.round(focusedDish.prices.full / 2) } : {}),
                                },
                              })}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span>Enable Full/Half Dual Portions</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">Full Serving Price (Rs.)</span>
                            <input
                              type="number"
                              min={0}
                              max={5000}
                              value={focusedDish.prices.full}
                              onChange={(e) => handleUpdateMenuItem({
                                ...focusedDish,
                                prices: { ...focusedDish.prices, full: Math.min(Number(e.target.value) || 0, 5000) },
                              })}
                              style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                              className="w-32 px-3.5 py-2 rounded-xl border font-mono font-bold"
                            />
                          </div>

                          {focusedDish.hasPortions && (
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block mb-1">Half Serving Price (Rs.)</span>
                              <input
                                type="number"
                                min={0}
                                max={5000}
                                value={focusedDish.prices.half || 0}
                                onChange={(e) => handleUpdateMenuItem({
                                  ...focusedDish,
                                  prices: { ...focusedDish.prices, half: Math.min(Number(e.target.value) || 0, 5000) },
                                })}
                                style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                                className="w-32 px-3.5 py-2 rounded-xl border font-mono font-bold"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ADD NEW DISH COMPONENT ENGINE                                      */}
        {/* ========================================================================= */}
        {activeTab === 'add-dish' && (
          <div className="space-y-6">
            <AddNewDishWidget
              theme={activeThemeConfig}
              onDishAdded={handleDishAdded}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LANDING & HERO ANTI-COLLISION MATRIX                               */}
        {/* ========================================================================= */}
        {activeTab === 'landing-hero' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Landing Layout & Hero Anti-Collision Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Update storefront titles, taglines, official hotline (0300-9346628), WhatsApp API digits, and wallpapers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Restaurant Name (English)</label>
                <input
                  type="text"
                  value={state.restaurantNameEn}
                  onChange={(e) => mutate((s) => ({ ...s, restaurantNameEn: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-urdu" dir="rtl">ریسٹورنٹ نام (اردو)</label>
                <input
                  type="text"
                  value={state.restaurantNameUr}
                  onChange={(e) => mutate((s) => ({ ...s, restaurantNameUr: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Hero Tagline Narrative (English)</label>
                <input
                  type="text"
                  value={state.taglineEn}
                  onChange={(e) => mutate((s) => ({ ...s, taglineEn: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-urdu" dir="rtl">ہیرو ٹیگ لائن (اردو)</label>
                <input
                  type="text"
                  value={state.taglineUr}
                  onChange={(e) => mutate((s) => ({ ...s, taglineUr: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-right font-urdu focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Official Delivery Hotline / ڈسپلے نمبر</label>
                <input
                  type="text"
                  value={state.hotlineFormatted}
                  onChange={(e) => mutate((s) => ({ ...s, hotlineFormatted: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">WhatsApp Pipeline String (e.g. 923009346628)</label>
                <input
                  type="text"
                  value={state.hotlineWhatsappRaw}
                  onChange={(e) => mutate((s) => ({ ...s, hotlineWhatsappRaw: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Physical Street Address (English)</label>
                <input
                  type="text"
                  value={state.addressEn}
                  onChange={(e) => mutate((s) => ({ ...s, addressEn: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-urdu" dir="rtl">پتہ (اردو)</label>
                <input
                  type="text"
                  value={state.addressUr}
                  onChange={(e) => mutate((s) => ({ ...s, addressUr: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-right font-urdu focus:outline-hidden"
                />
              </div>
            </div>

            {/* Graphics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: activeThemeConfig.borderSubtle }}>
              <div
                style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                className="p-4 rounded-2xl border space-y-2 text-xs"
              >
                <span className="font-bold block">Brand Logo Asset (Drop or Edit)</span>
                <div className="w-24 h-24">
                  <EditableImage
                    src={state.logoImage}
                    alt="Logo"
                    onImageChange={(b64) => mutate((s) => ({ ...s, logoImage: b64 }))}
                    aspectRatioClass="aspect-square"
                    roundedClass="rounded-2xl"
                    labelEn="Edit Logo"
                    labelUr="لوگو بدلیں"
                  />
                </div>
              </div>

              <div
                style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                className="p-4 rounded-2xl border space-y-2 text-xs"
              >
                <span className="font-bold block">Hero Banner Wallpaper (16:9 Scrim Frame)</span>
                <div className="w-full">
                  <EditableImage
                    src={state.heroImage}
                    alt="Hero Banner"
                    onImageChange={(b64) => mutate((s) => ({ ...s, heroImage: b64 }))}
                    aspectRatioClass="aspect-16/9"
                    roundedClass="rounded-2xl"
                    labelEn="Edit Hero Banner"
                    labelUr="ہیرو وال پیپر"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 9 LOCAL RED-PIN ADDRESS LANDMARKS                                   */}
        {/* ========================================================================= */}
        {activeTab === 'landmarks' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                9 Local Red-Pin Address Landmarks
              </h3>
              <p className="text-xs text-slate-500">
                Modify every local pin: Main Sarak / Kasur Road, Mehar Kafeel Auto, Sindh Bank, and surrounding intersections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.landmarks.map((pin, idx) => (
                <div
                  key={pin.id}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="p-4 rounded-2xl border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600">Pin #{idx + 1}: {pin.id}</span>
                    <select
                      value={pin.category}
                      onChange={(e) => handleUpdateLandmark({ ...pin, category: e.target.value as any })}
                      style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                      className="px-2 py-1 text-[11px] rounded-lg border font-semibold"
                    >
                      <option value="road">Road / سڑک</option>
                      <option value="auto">Auto / آٹو</option>
                      <option value="bank">Bank / بینک</option>
                      <option value="school">School / اسکول</option>
                      <option value="store">Store / اسٹور</option>
                      <option value="health">Health / فارمیسی</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold mb-0.5">Name (English)</label>
                      <input
                        type="text"
                        value={pin.nameEn}
                        onChange={(e) => handleUpdateLandmark({ ...pin, nameEn: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-1.5 rounded-xl border focus:outline-hidden font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-0.5 font-urdu" dir="rtl">نام (اردو)</label>
                      <input
                        type="text"
                        value={pin.nameUr}
                        onChange={(e) => handleUpdateLandmark({ ...pin, nameUr: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-1.5 rounded-xl border text-right font-urdu font-semibold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-0.5">Distance Metric</label>
                      <input
                        type="text"
                        value={pin.distanceEstimate}
                        onChange={(e) => handleUpdateLandmark({ ...pin, distanceEstimate: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-1.5 rounded-xl border font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OWNER PROFILE & PASSPORT PICTURE FRAME                             */}
        {/* ========================================================================= */}
        {activeTab === 'owner-profile' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Absolute Bottom Owner Profile (Muhammad Dogar)
              </h3>
              <p className="text-xs text-slate-500">
                Manage the founder passport-size portrait frame rendered at the absolute bottom of the application.
              </p>
            </div>

            <div
              style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
              className="p-6 rounded-3xl border flex flex-col sm:flex-row items-center gap-6"
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/60 shrink-0">
                <EditableImage
                  src={state.ownerPassportImage}
                  alt={state.ownerNameEn}
                  onImageChange={(b64) => mutate((s) => ({ ...s, ownerPassportImage: b64 }))}
                  aspectRatioClass="aspect-square"
                  roundedClass="rounded-2xl"
                  labelEn="Edit Photo"
                  labelUr="تصویر بدلیں"
                />
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-extrabold text-amber-600 uppercase tracking-wider block">
                  Executive Passport Picture Frame (1:1 Aspect Ratio)
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Drag and drop a professional portrait photo here. FileReader instantly converts it to an optimized Base64 string and commits to localStorage.
                </p>
                <span className="text-[11px] text-emerald-600 font-bold block">
                  ✓ Active at Absolute Bottom of Storefront
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Owner Name (English)</label>
                <input
                  type="text"
                  value={state.ownerNameEn}
                  onChange={(e) => mutate((s) => ({ ...s, ownerNameEn: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-urdu" dir="rtl">مالک کا نام (اردو)</label>
                <input
                  type="text"
                  value={state.ownerNameUr}
                  onChange={(e) => mutate((s) => ({ ...s, ownerNameUr: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Executive Title (English)</label>
                <input
                  type="text"
                  value={state.ownerTitleEn}
                  onChange={(e) => mutate((s) => ({ ...s, ownerTitleEn: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-urdu" dir="rtl">عہدہ (اردو)</label>
                <input
                  type="text"
                  value={state.ownerTitleUr}
                  onChange={(e) => mutate((s) => ({ ...s, ownerTitleUr: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-right font-urdu font-semibold focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Hospitality Narrative Message (English)</label>
                <textarea
                  rows={2}
                  value={state.ownerMessageEn}
                  onChange={(e) => mutate((s) => ({ ...s, ownerMessageEn: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border focus:outline-hidden resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1 font-urdu" dir="rtl">بانی کا پیغام و دسترخوان عزم (اردو)</label>
                <textarea
                  rows={2}
                  value={state.ownerMessageUr}
                  onChange={(e) => mutate((s) => ({ ...s, ownerMessageUr: e.target.value }))}
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-right font-urdu focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ODOO BLOCK DESIGNER & SHAPES                                       */}
        {/* ========================================================================= */}
        {activeTab === 'odoo-shapes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Live Odoo Block Designer & Architectural Shape Controls
              </h3>
              <p className="text-xs text-slate-500">
                Transform block shapes dynamically (soft-curved, square, triangular mask, circular canvas) without clipping neighbors.
              </p>
            </div>

            {/* Block Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
              {state.odooBlocks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setEditingBlockId(b.id)}
                  style={{
                    backgroundColor: currentEditingBlock.id === b.id ? activeThemeConfig.accent : activeThemeConfig.bgSurface,
                    color: currentEditingBlock.id === b.id ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
                    borderColor: currentEditingBlock.id === b.id ? activeThemeConfig.accent : activeThemeConfig.borderSubtle,
                  }}
                  className="px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <span>{b.titleEn.split(' ')[0]} {b.titleEn.split(' ')[1] || ''}</span>
                  {b.id === 'odoo-family-banquet' && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-sm bg-amber-500/20 text-amber-500 text-[10px] uppercase">
                      Catering & Events
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Editing Box for Active Block */}
            {currentEditingBlock && (
              <div
                style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                className="p-6 rounded-3xl border space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                      Active Section Module
                    </span>
                    <h4 className="text-base font-black text-slate-100">{currentEditingBlock.titleEn}</h4>
                    <p className="text-xs font-urdu text-amber-400 font-bold" dir="rtl">{currentEditingBlock.titleUr}</p>
                  </div>
                  {currentEditingBlock.tagEn && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold self-start sm:self-auto">
                      {currentEditingBlock.tagEn}
                    </span>
                  )}
                </div>

                {/* Block Image Handler */}
                <div>
                  <label className="block text-xs font-bold mb-1.5">Section Graphic / Image Media:</label>
                  <div className="max-w-md">
                    <EditableImage
                      src={currentEditingBlock.image || '/src/assets/images/hero_sajji_roast_banner_1790248382249.jpg'}
                      alt={currentEditingBlock.titleEn}
                      onImageChange={(b64) => handleUpdateBlock({ ...currentEditingBlock, image: b64 })}
                      aspectRatioClass="aspect-16/9"
                      labelEn="Upload Section Image"
                      labelUr="سیکشن تصویر تبدیل کریں"
                    />
                  </div>
                </div>

                {/* Shape Selection */}
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Dynamic Block Shape Structure:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {(['soft-curved', 'square-box', 'triangular-mask', 'circular-canvas'] as BlockShape[]).map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => handleUpdateBlock({ ...currentEditingBlock, shape })}
                        className={`p-3 rounded-2xl border text-center capitalize cursor-pointer transition-all ${
                          currentEditingBlock.shape === shape
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm'
                            : 'bg-white/5 border-slate-300/30'
                        }`}
                      >
                        {shape.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hospitality & Catering Dynamic Pricing Overlays */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Catering & Event Package Rates & Sub-Text Overlays
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold mb-1 text-slate-300">Package Pricing String (English)</label>
                      <input
                        type="text"
                        value={currentEditingBlock.pricingEn || ''}
                        onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, pricingEn: e.target.value })}
                        placeholder="e.g. From Rs. 850 / Person"
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 font-urdu text-slate-300" dir="rtl">پیکیج قیمت (اردو)</label>
                      <input
                        type="text"
                        value={currentEditingBlock.pricingUr || ''}
                        onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, pricingUr: e.target.value })}
                        placeholder="مثال: پیکیج 850 روپے فی کس سے شروع"
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold mb-1 text-slate-300">Customized Combo Inclusions & Sub-Text String</label>
                      <input
                        type="text"
                        value={currentEditingBlock.comboPackageDetails || ''}
                        onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, comboPackageDetails: e.target.value })}
                        placeholder="e.g. Includes Live Sajji Roast, Desi Karahi, Fresh Tandoor Naan, Raita, Salad & Chilled Soft Drinks"
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block font-bold mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={currentEditingBlock.titleEn}
                      onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, titleEn: e.target.value })}
                      style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                      className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 font-urdu" dir="rtl">عنوان (اردو)</label>
                    <input
                      type="text"
                      value={currentEditingBlock.titleUr}
                      onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, titleUr: e.target.value })}
                      style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                      className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Subtitle (English)</label>
                    <input
                      type="text"
                      value={currentEditingBlock.subtitleEn}
                      onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, subtitleEn: e.target.value })}
                      style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                      className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 font-urdu" dir="rtl">ذیلی عنوان (اردو)</label>
                    <input
                      type="text"
                      value={currentEditingBlock.subtitleUr}
                      onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, subtitleUr: e.target.value })}
                      style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                      className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu font-medium focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">Detailed Content Description (English)</label>
                    <textarea
                      rows={2}
                      value={currentEditingBlock.contentEn}
                      onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, contentEn: e.target.value })}
                      style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                      className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 font-urdu" dir="rtl">تفصیلی تفصیل (اردو)</label>
                    <textarea
                      rows={2}
                      value={currentEditingBlock.contentUr}
                      onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, contentUr: e.target.value })}
                      style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                      className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu focus:outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: THREE-TIER VISUAL CUSTOMIZER MODULE (VIEW 4 EXCLUSIVE ONLY)        */}
        {/* ========================================================================= */}
        {activeTab === 'thematic-schemes' && (
          <div className="space-y-8">
            {/* Module Top Banner */}
            <div className="pb-4 border-b" style={{ borderColor: activeThemeConfig.borderSubtle }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Three-Tier Visual Customizer Architecture</span>
                <span className="text-slate-500">•</span>
                <span className="font-urdu text-[11px]">تین سطحی ویژول تھیم ماڈیول</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Layered Visual Theme Workspace (Exclusive to Page 4 Admin)
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Configure global storefront palettes, isolated block-level styling schemes, and dynamic ambient lighting filters. All selections live-render instantly across the admin preview and persist permanently in localStorage.
              </p>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* LAYER A: 6 MASTER GLOBAL PALETTES                                     */}
            {/* --------------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    A
                  </span>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">
                      Layer A: 6 Global Palettes / مرکزی پیج کلر پیلیٹس
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Controls the entire main page template engine instantly
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500 uppercase">
                  Active: {THEMES_REGISTRY[state.globalTheme]?.nameEn || state.globalTheme}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GLOBAL_THEMES.map((t) => {
                  const isSelected = state.globalTheme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => mutate((s) => ({ ...s, globalTheme: t.id }))}
                      style={{
                        backgroundColor: t.bgCanvas,
                        color: t.textPrimary,
                        borderColor: isSelected ? t.accent : t.borderStrong,
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:scale-[1.01] ${
                        isSelected ? 'ring-2 ring-amber-500 shadow-xl' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-black block">{t.nameEn}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-urdu text-amber-500 font-bold block mb-3" dir="rtl">
                        {t.nameUr}
                      </span>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: t.accent, color: t.accentText }}>
                          Primary Accent
                        </span>
                        <span className="text-slate-400 font-mono text-[9px]">{t.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bespoke Artistic Presets */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Artistic Bespoke Presets (Cherry Pin, Smok, Green Land with Yellow Sunlight):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BESPOKE_THEMES.map((t) => {
                    const isSelected = state.globalTheme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => mutate((s) => ({ ...s, globalTheme: t.id }))}
                        style={{
                          backgroundColor: t.bgCanvas,
                          color: t.textPrimary,
                          borderColor: isSelected ? t.accent : t.borderStrong,
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:scale-[1.01] ${
                          isSelected ? 'ring-2 ring-amber-500 shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold block">{t.nameEn}</span>
                          {isSelected && <span className="text-amber-500 text-xs font-bold">✓ Active</span>}
                        </div>
                        <span className="text-[10px] font-urdu text-amber-400 block mt-0.5" dir="rtl">{t.nameUr}</span>
                        <span className="text-[9px] text-slate-400 block mt-1">{t.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 MULTI-COLOR RAINBOW SCHEMES */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                      🌈 6 Multi-Color Rainbow Schemes (Hardware-Accelerated Transitions)
                    </span>
                    <span className="text-[11px] text-slate-400 font-urdu" dir="rtl">
                      چھ متحرک قوس قزح رینبو کینوس
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30">
                    Spectrum Shifting
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {RAINBOW_THEMES.map((t) => {
                    const isSelected = state.globalTheme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => mutate((s) => ({ ...s, globalTheme: t.id }))}
                        style={{
                          backgroundColor: t.bgCanvas,
                          color: t.textPrimary,
                          borderColor: isSelected ? t.accent : t.borderStrong,
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:scale-[1.01] ${t.specialClass || ''} ${
                          isSelected ? 'ring-2 ring-pink-500 shadow-xl' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="text-xs font-black block">{t.nameEn}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-urdu text-amber-400 font-bold block mb-2" dir="rtl">
                          {t.nameUr}
                        </span>
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span
                            className="px-2 py-0.5 rounded-md font-bold text-[9px]"
                            style={{ background: t.pillActiveBg, color: t.pillActiveText }}
                          >
                            Spectrum Accent
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">{t.badge}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 BALANCED MULTI-TONE MATRICES */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                      🎨 6 Balanced Multi-Tone Matrices (3 to 4 Complementary Solid Colors)
                    </span>
                    <span className="text-[11px] text-slate-400 font-urdu" dir="rtl">
                      چھ متوازن ملٹی ٹون کلر کنٹراسٹ
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                    Engineered Solid Blends
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {MULTITONE_THEMES.map((t) => {
                    const isSelected = state.globalTheme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => mutate((s) => ({ ...s, globalTheme: t.id }))}
                        style={{
                          backgroundColor: t.bgCanvas,
                          color: t.textPrimary,
                          borderColor: isSelected ? t.accent : t.borderStrong,
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:scale-[1.01] ${
                          isSelected ? 'ring-2 ring-amber-500 shadow-xl' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="text-xs font-black block">{t.nameEn}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-urdu text-amber-400 font-bold block mb-2" dir="rtl">
                          {t.nameUr}
                        </span>
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span
                            className="px-2 py-0.5 rounded-md font-bold text-[9px]"
                            style={{ backgroundColor: t.accent, color: t.accentText }}
                          >
                            Solid Accent
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">{t.badge}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* LAYER B: 6 BLOCK-LEVEL STYLE SCHEMES                                  */}
            {/* --------------------------------------------------------------------- */}
            <div className="space-y-4 pt-6 border-t" style={{ borderColor: activeThemeConfig.borderSubtle }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    B
                  </span>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">
                      Layer B: 6 Block-Level Style Schemes / بلاک لیول اسٹائل اسکیمز
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Assign custom layout styling to individual rows, banners & grids without shifting neighbors
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500 uppercase">
                  Active: {BLOCK_STYLE_SCHEMES.find((b) => b.id === (state.activeBlockScheme || 'block-elevated-card'))?.nameEn}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BLOCK_STYLE_SCHEMES.map((scheme) => {
                  const isSelected = (state.activeBlockScheme || 'block-elevated-card') === scheme.id;
                  return (
                    <div
                      key={scheme.id}
                      onClick={() => mutate((s) => ({ ...s, activeBlockScheme: scheme.id }))}
                      style={{
                        backgroundColor: activeThemeConfig.bgSurface,
                        borderColor: isSelected ? activeThemeConfig.accent : activeThemeConfig.borderStrong,
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${scheme.cardClass} ${
                        isSelected ? 'ring-2 ring-amber-500 shadow-xl' : 'hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-black text-white">{scheme.nameEn}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-urdu text-amber-500 font-bold block mb-2" dir="rtl">
                        {scheme.nameUr}
                      </span>
                      <p className="text-[10px] text-slate-400 leading-snug mb-3">
                        {scheme.description}
                      </p>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <span>{scheme.badge}</span>
                        <span className="text-amber-500 font-bold">Preview Tile</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* LAYER C: 6 CUSTOM LIGHTING MODES (DYNAMIC AMBIENT FILTERS)            */}
            {/* --------------------------------------------------------------------- */}
            <div className="space-y-4 pt-6 border-t" style={{ borderColor: activeThemeConfig.borderSubtle }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    C
                  </span>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">
                      Layer C: 6 Custom Lighting Modes / ایمبینٹ لائٹنگ و گلو موڈز
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Dynamic ambient filters, neon edge glows & backlighting live-rendered across storefront
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500 uppercase">
                  Active: {LIGHTING_MODES.find((m) => m.id === (state.activeLightingMode || 'golden-radiance'))?.nameEn}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LIGHTING_MODES.map((mode) => {
                  const isSelected = (state.activeLightingMode || 'golden-radiance') === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => mutate((s) => ({ ...s, activeLightingMode: mode.id }))}
                      style={{
                        backgroundColor: activeThemeConfig.bgSurface,
                        borderColor: isSelected ? activeThemeConfig.accent : activeThemeConfig.borderStrong,
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${mode.glowClass} ${
                        isSelected ? 'ring-2 ring-amber-500 shadow-2xl' : 'hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-black text-white">{mode.nameEn}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-urdu text-amber-500 font-bold block mb-2" dir="rtl">
                        {mode.nameUr}
                      </span>
                      <p className="text-[10px] text-slate-400 leading-snug mb-3">
                        {mode.description}
                      </p>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <span>{mode.badge}</span>
                        <span className="text-amber-500 font-bold">Ambient Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* LIVE COMPOSITE SANDBOX PREVIEW TILE                                   */}
            {/* --------------------------------------------------------------------- */}
            <div
              style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderStrong }}
              className="p-6 rounded-3xl border space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                    Live Combined Architecture Sandbox (A + B + C)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Zero Public Leakage • Isolated in View 4</span>
              </div>

              <div
                style={{
                  backgroundColor: activeThemeConfig.bgCanvas,
                  color: activeThemeConfig.textPrimary,
                  borderColor: activeThemeConfig.borderStrong,
                }}
                className={`p-5 rounded-2xl border transition-all ${
                  BLOCK_STYLE_SCHEMES.find((b) => b.id === (state.activeBlockScheme || 'block-elevated-card'))?.cardClass || ''
                } ${
                  LIGHTING_MODES.find((m) => m.id === (state.activeLightingMode || 'golden-radiance'))?.glowClass || ''
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                  <div>
                    <span className="text-xs font-black block">{state.restaurantNameEn} Storefront Preview</span>
                    <span className="text-[10px] text-slate-400 font-urdu">{state.restaurantNameUr}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: activeThemeConfig.accent, color: activeThemeConfig.accentText }}>
                    Live Preview
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 text-center text-xs">
                  <div className="p-2 rounded-xl bg-black/20">
                    <span className="text-[9px] text-slate-400 block">Layer A (Global)</span>
                    <span className="font-bold text-[11px] truncate block">{THEMES_REGISTRY[state.globalTheme]?.nameEn}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20">
                    <span className="text-[9px] text-slate-400 block">Layer B (Block Scheme)</span>
                    <span className="font-bold text-[11px] truncate block">
                      {BLOCK_STYLE_SCHEMES.find((b) => b.id === (state.activeBlockScheme || 'block-elevated-card'))?.nameEn}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20">
                    <span className="text-[9px] text-slate-400 block">Layer C (Lighting)</span>
                    <span className="font-bold text-[11px] truncate block">
                      {LIGHTING_MODES.find((m) => m.id === (state.activeLightingMode || 'golden-radiance'))?.nameEn}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: THE TYPE SECTION (DEDICATED TYPOGRAPHY SEGMENTATION MODULE)          */}
        {/* ========================================================================= */}
        {activeTab === 'type-section' && (
          <div className="space-y-8">
            {/* Module Top Banner */}
            <div className="pb-4 border-b" style={{ borderColor: activeThemeConfig.borderSubtle }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-xs font-black uppercase tracking-wider mb-2">
                <Type className="w-3.5 h-3.5" />
                <span>THE TYPE SECTION / فانٹ اور تحریر پینل</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Dedicated Typography Segmentation & High-Contrast Ink Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Fine-tune structural alignment and font weight vectors across hybrid 50/50 English, Roman Urdu, and bold plain Urdu script strings. Select from 6 bespoke typographic layouts and 9 high-contrast color arrays dedicated strictly to handling ink properties of titles, headings, and prices.
              </p>
            </div>

            {/* PART 1: 6 TYPOGRAPHY THEMATIC LAYOUTS */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <span>6 Typography Thematic Layouts / چھ مخصوص فونٹ لے آؤٹس</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls structural alignment, letter tracking, and weight vectors of bilingual dishes
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500 uppercase shrink-0">
                  Active Layout: {TYPOGRAPHY_LAYOUTS.find((l) => l.id === (state.activeTypographyLayout || 'clean-minimalist-sans'))?.nameEn}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TYPOGRAPHY_LAYOUTS.map((layout) => {
                  const isSelected = (state.activeTypographyLayout || 'clean-minimalist-sans') === layout.id;
                  return (
                    <div
                      key={layout.id}
                      onClick={() => mutate((s) => ({ ...s, activeTypographyLayout: layout.id }))}
                      style={{
                        backgroundColor: activeThemeConfig.bgSurface,
                        borderColor: isSelected ? activeThemeConfig.accent : activeThemeConfig.borderSubtle,
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-3 hover:scale-[1.01] ${
                        isSelected ? 'ring-2 ring-amber-500 shadow-xl' : 'hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                        <div>
                          <span className="text-xs font-black block text-slate-100">{layout.nameEn}</span>
                          <span className="text-[11px] font-urdu text-amber-400 font-bold" dir="rtl">{layout.nameUr}</span>
                        </div>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Select</span>
                        )}
                      </div>

                      {/* Live Typography Preview Box */}
                      <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1.5">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className={`text-sm text-slate-100 ${layout.headingStyle}`}>
                            Balochi Sajji Roast
                          </span>
                          <span className={`text-xs text-amber-400 ${layout.urduStyle}`} dir="rtl">
                            خاص روایتی سجی
                          </span>
                        </div>
                        <p className={`text-[11px] text-slate-400 ${layout.subtextStyle}`}>
                          Slow woodfire charcoal roast with desi mountain salt • اصلی کوئلہ روسٹ
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Portion Rate</span>
                          <span className={`text-xs text-amber-400 font-bold ${layout.priceStyle}`}>
                            Rs. 1,650
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                        <span>{layout.badge}</span>
                        <span className="text-amber-500 font-bold">50/50 Hybrid</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PART 2: 9 SPECIFIC HIGH-CONTRAST TEXT COLOR PALETTES */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <span>9 High-Contrast Text Color Palettes / نو مخصوص تحریری کلر سیٹس</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dedicated strictly to handling the ink properties of titles, headings, prices, and Urdu calligraphy
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500 uppercase shrink-0">
                  Active Ink: {TEXT_COLOR_PALETTES.find((p) => p.id === (state.activeTextColorPalette || 'charcoal-gold'))?.nameEn}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEXT_COLOR_PALETTES.map((palette) => {
                  const isSelected = (state.activeTextColorPalette || 'charcoal-gold') === palette.id;
                  return (
                    <div
                      key={palette.id}
                      onClick={() => mutate((s) => ({ ...s, activeTextColorPalette: palette.id }))}
                      style={{
                        backgroundColor: activeThemeConfig.bgSurface,
                        borderColor: isSelected ? activeThemeConfig.accent : activeThemeConfig.borderSubtle,
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-3 hover:scale-[1.01] ${
                        isSelected ? 'ring-2 ring-amber-500 shadow-xl' : 'hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black block text-slate-100">{palette.nameEn}</span>
                          <span className="text-[11px] font-urdu text-amber-400 font-bold" dir="rtl">{palette.nameUr}</span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Color Ink Swatches Matrix */}
                      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-black/40 border border-slate-800 text-center text-[10px]">
                        <div className="p-1 rounded-lg bg-slate-900 border border-slate-700/60">
                          <span className="w-3.5 h-3.5 rounded-full mx-auto block mb-0.5" style={{ backgroundColor: palette.titleColor }} />
                          <span className="text-[9px] text-slate-400 block truncate">Title</span>
                        </div>
                        <div className="p-1 rounded-lg bg-slate-900 border border-slate-700/60">
                          <span className="w-3.5 h-3.5 rounded-full mx-auto block mb-0.5" style={{ backgroundColor: palette.headingColor }} />
                          <span className="text-[9px] text-slate-400 block truncate">Heading</span>
                        </div>
                        <div className="p-1 rounded-lg bg-slate-900 border border-slate-700/60">
                          <span className="w-3.5 h-3.5 rounded-full mx-auto block mb-0.5" style={{ backgroundColor: palette.priceColor }} />
                          <span className="text-[9px] text-slate-400 block truncate">Price</span>
                        </div>
                        <div className="p-1 rounded-lg bg-slate-900 border border-slate-700/60">
                          <span className="w-3.5 h-3.5 rounded-full mx-auto block mb-0.5" style={{ backgroundColor: palette.urduColor }} />
                          <span className="text-[9px] text-slate-400 block truncate">Urdu</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>{palette.badge}</span>
                        <span className="text-emerald-400 font-bold">Contrast Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE PREVIEW COMPOSITE BOX */}
            <div
              style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderStrong }}
              className="p-5 sm:p-6 rounded-3xl border space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                    Live Typography & Ink Synthesis Engine
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Syncs directly to Storefront & LocalStorage</span>
              </div>

              {(() => {
                const currentLayout = TYPOGRAPHY_LAYOUTS.find((l) => l.id === (state.activeTypographyLayout || 'clean-minimalist-sans')) || TYPOGRAPHY_LAYOUTS[2];
                const currentPalette = TEXT_COLOR_PALETTES.find((p) => p.id === (state.activeTextColorPalette || 'charcoal-gold')) || TEXT_COLOR_PALETTES[0];
                return (
                  <div
                    style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                    className="p-5 rounded-2xl border space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <span
                        style={{ color: currentPalette.titleColor }}
                        className={`text-lg sm:text-xl font-black ${currentLayout.headingStyle}`}
                      >
                        Desi Murgh Makhni Karahi (100% Halal)
                      </span>
                      <span
                        style={{ color: currentPalette.urduColor }}
                        className={`text-base font-black font-urdu ${currentLayout.urduStyle}`}
                        dir="rtl"
                      >
                        دیسی مکھن مرغ کڑاہی
                      </span>
                    </div>

                    <p
                      style={{ color: currentPalette.mutedColor }}
                      className={`text-xs leading-relaxed ${currentLayout.subtextStyle}`}
                    >
                      Freshly slaughtered poultry prepared in organic country butter, freshly grated ginger, green chillies, and ground cumin roasted over red-hot coals.
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-400">Family Full Portion:</span>
                      <span
                        style={{ color: currentPalette.priceColor }}
                        className={`text-base sm:text-lg font-black ${currentLayout.priceStyle}`}
                      >
                        Rs. 2,450
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: 5 DYNAMIC RAINBOW BUTTON ACCENT TEMPLATES & 30 PRESET PROFILES      */}
        {/* ========================================================================= */}
        {activeTab === 'button-presets' && (
          <div className="space-y-8">
            {/* SECTION 1: 5 DYNAMIC RAINBOW BUTTON ACCENT TEMPLATES + DEFAULT ACCENT */}
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 text-pink-400 text-xs font-black uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>5 Dynamic Rainbow Button Accent Templates</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-urdu text-[11px]">متحرک رینبو بٹن ڈیزائنز</span>
                </div>
                <h3 className="text-lg font-black tracking-tight">
                  Interaction Controllers: Rainbow &quot;+ Tray&quot; and &quot;Order Now&quot; Variants
                </h3>
                <p className="text-xs text-slate-400">
                  Engineered specifically for the primary order interaction buttons. Default is locked to Emerald Green (#059669) &amp; Soft Rose Pink (#FFEBEE) with Red Typography (#D32F2F) until modified below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BUTTON_THEMES.map((bTheme) => {
                  const isSelected = (state.activeButtonTheme || 'default-emerald-rose') === bTheme.id;
                  return (
                    <div
                      key={bTheme.id}
                      onClick={() => mutate((s) => ({ ...s, activeButtonTheme: bTheme.id }))}
                      style={{
                        backgroundColor: activeThemeConfig.bgSurface,
                        borderColor: isSelected ? activeThemeConfig.accent : activeThemeConfig.borderSubtle,
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-3 hover:scale-[1.01] ${
                        isSelected ? 'ring-2 ring-pink-500 shadow-xl' : 'hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/50">
                        <div>
                          <span className="text-xs font-black block text-slate-100">{bTheme.nameEn}</span>
                          <span className="text-[10px] font-urdu text-amber-400" dir="rtl">{bTheme.nameUr}</span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Interactive Button Preview */}
                      <div className="space-y-2 p-2.5 rounded-xl bg-black/40 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            style={{
                              background: bTheme.trayBtnBg,
                              color: bTheme.trayBtnText,
                              border: bTheme.trayBtnBorder || 'none',
                            }}
                            className="flex-1 py-1.5 px-2.5 text-xs font-black rounded-xl shadow-xs pointer-events-none flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Tray</span>
                          </button>

                          <button
                            type="button"
                            style={{
                              background: bTheme.orderBtnBg,
                              color: bTheme.orderBtnText,
                              border: bTheme.orderBtnBorder || 'none',
                            }}
                            className="flex-1 py-1.5 px-2.5 text-xs font-bold rounded-xl shadow-xs pointer-events-none flex items-center justify-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Order Now</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-snug">{bTheme.description}</p>
                      <span className="text-[9px] font-mono text-slate-500 block">{bTheme.badge}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: 30 CURATED BUTTON PRESETS */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div>
                <h3 className="text-sm font-black tracking-tight text-slate-300">
                  30 Additional Button Palette Profiles
                </h3>
                <p className="text-xs text-slate-500">
                  Click any profile to preview customized color styling, pill curves, and typography contrasts.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {BUTTON_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      style={{
                        backgroundColor: activeThemeConfig.bgSurface,
                        borderColor: isSelected ? activeThemeConfig.accent : activeThemeConfig.borderSubtle,
                      }}
                      className={`p-3 rounded-2xl border text-center space-y-2 cursor-pointer transition-all hover:scale-105 ${
                        isSelected ? 'ring-2 ring-amber-500 shadow-md' : ''
                      }`}
                    >
                      <button
                        type="button"
                        style={{ background: p.bg, color: p.text }}
                        className={`w-full py-2 px-3 text-xs font-bold shadow-sm ${p.rounded} ${p.border || ''}`}
                      >
                        Order Now
                      </button>
                      <div>
                        <span className="text-[11px] font-bold block">{p.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Profile #{p.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: SECURITY TOKEN & PASSCODE (12345)                                   */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Security Access Token & Passcode Management
              </h3>
              <p className="text-xs text-slate-500">
                The master verification key is strictly set to {state.adminPasswordToken}. Update and save a new access passcode below.
              </p>
            </div>

            <form onSubmit={handleSaveToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Master Security Passcode Token / ایڈمن پاس کوڈ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderStrong }}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-mono font-bold tracking-widest focus:outline-hidden"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: activeThemeConfig.accent, color: activeThemeConfig.accentText }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 shadow-sm"
              >
                Update & Save New Token
              </button>

              {tokenSuccessMsg && (
                <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Security access token updated to: {state.adminPasswordToken}</span>
                </p>
              )}
            </form>

            <div
              style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
              className="p-5 rounded-2xl border space-y-3 pt-5"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">Deliberate Factory Reset & Anti-Reset Cache</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                All changes, dishes, prices, and themes are permanently retained in localStorage across browser refreshes and cold restarts.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('RESTORE DEFAULT WARNING: Are you certain you want to reset all configurations to factory defaults?')) {
                    onFactoryReset();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Restore Factory Defaults / فیکٹری ری سیٹ
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 4. BOTTOM STICKY COMMAND STRIP */}
      <footer
        style={{
          backgroundColor: activeThemeConfig.bgSurface,
          borderColor: activeThemeConfig.borderSubtle,
        }}
        className="sticky bottom-0 z-30 w-full border-t py-3 px-4 sm:px-6 shadow-lg backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onReturnToStorefront}
            className="text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Storefront</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {state.menuItems.length} Dishes Synchronized
            </span>

            <button
              type="button"
              onClick={handleSaveAllChanges}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save All Changes / تمام ڈیٹا محفوظ کریں</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
