import React, { useState } from 'react';
import { 
  X, Palette, Layers, Utensils, ShieldCheck, KeyRound, Image as ImageIcon,
  Plus, Trash2, Check, ArrowUpDown, Eye, ExternalLink, RefreshCw, Sparkles,
  Save, CheckCircle2, Sliders, Smartphone, MapPin, User, Layout, AlertCircle
} from 'lucide-react';
import { THEMES_REGISTRY, GLOBAL_THEMES, BESPOKE_THEMES } from '../constants/themes';
import { BlockShape, LandmarkPin, MenuItem, OdooBlock, RestaurantState, ThemeId } from '../types';
import { EditableImage } from './EditableImage';
import { saveRestaurantState } from '../utils/storage';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: RestaurantState;
  onUpdateState: (newState: RestaurantState) => void;
  onFactoryReset: () => void;
}

// 30 CURATED PRESET BUTTON THEME PROFILES
export interface ButtonPreset {
  id: number;
  name: string;
  bg: string;
  text: string;
  border?: string;
  glow?: string;
  rounded: string;
}

export const BUTTON_PRESETS: ButtonPreset[] = [
  { id: 1, name: 'Roast Ember', bg: '#EA580C', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 2, name: 'Royal Crimson', bg: '#BE123C', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 3, name: 'Balochi Saffron', bg: '#D97706', text: '#000000', rounded: 'rounded-xl' },
  { id: 4, name: 'Golden Sunlight', bg: '#FACC15', text: '#041811', rounded: 'rounded-xl' },
  { id: 5, name: 'Emerald Oasis', bg: '#059669', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 6, name: 'Forest Pine', bg: '#15803D', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 7, name: 'Midnight Cobalt', bg: '#1D4ED8', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 8, name: 'Deep Ocean', bg: '#0284C7', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 9, name: 'Turkish Cyan', bg: '#0891B2', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 10, name: 'Regal Purple', bg: '#7E22CE', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 11, name: 'Imperial Violet', bg: '#6D28D9', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 12, name: 'Cherry Pin Luxury', bg: '#E11D48', text: '#FFFFFF', rounded: 'rounded-full' },
  { id: 13, name: 'Sunset Coral', bg: '#F43F5E', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 14, name: 'Moody Charcoal', bg: '#374151', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 15, name: 'Pitch Noir', bg: '#0F172A', text: '#FFFFFF', rounded: 'rounded-lg' },
  { id: 16, name: 'Warm Copper', bg: '#B45309', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 17, name: 'Roasted Terracotta', bg: '#9A3412', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 18, name: 'Vintage Brass', bg: '#CA8A04', text: '#141815', rounded: 'rounded-xl' },
  { id: 19, name: 'Electric Lime', bg: '#65A30D', text: '#000000', rounded: 'rounded-xl' },
  { id: 20, name: 'Jade Mint', bg: '#10B981', text: '#022C22', rounded: 'rounded-xl' },
  { id: 21, name: 'Teal Jewel', bg: '#0F766E', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 22, name: 'Sky Breeze', bg: '#38BDF8', text: '#0C4A6E', rounded: 'rounded-xl' },
  { id: 23, name: 'Indigo Dusk', bg: '#4338CA', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 24, name: 'Fuchsia Flash', bg: '#C026D3', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 25, name: 'Rose Gold', bg: '#FB7185', text: '#4C0519', rounded: 'rounded-full' },
  { id: 26, name: 'Sand Ochre', bg: '#78350F', text: '#FFFFFF', rounded: 'rounded-lg' },
  { id: 27, name: 'Dark Olive', bg: '#365314', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 28, name: 'Slate Steel', bg: '#475569', text: '#FFFFFF', rounded: 'rounded-xl' },
  { id: 29, name: 'Smok Bistro', bg: 'rgba(255,255,255,0.15)', text: '#FFFFFF', rounded: 'rounded-xl', border: 'border-white/25' },
  { id: 30, name: 'Fire Gradient Flame', bg: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)', text: '#FFFFFF', rounded: 'rounded-2xl' },
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onFactoryReset,
}) => {
  if (!isOpen) return null;

  type AdminTab = 'branding' | 'menu' | 'landmarks' | 'owner' | 'odoo' | 'themes' | 'presets' | 'security';
  const [activeTab, setActiveTab] = useState<AdminTab>('branding');
  const [newTokenValue, setNewTokenValue] = useState(state.adminPasswordToken);
  const [tokenSuccessMsg, setTokenSuccessMsg] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(state.odooBlocks[0]?.id || null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<number>(1);
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(state.menuItems[0]?.id || null);

  const activeThemeConfig = THEMES_REGISTRY[state.globalTheme];

  // TRANSACTIVE MASTER "SAVE ALL CHANGES" SCRIPT
  const handleSaveAllChanges = () => {
    const res = saveRestaurantState(state);
    if (res.success) {
      setSaveSuccessMsg(true);
      setSaveErrorMsg(null);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
    } else {
      setSaveErrorMsg(res.error || 'Failed to save to local storage.');
      setTimeout(() => setSaveErrorMsg(null), 4000);
    }
  };

  // Direct State Mutator with instant commit
  const mutateState = (updater: (prev: RestaurantState) => RestaurantState) => {
    const next = updater(state);
    onUpdateState(next);
    saveRestaurantState(next);
  };

  // Save new security token
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenValue.trim()) return;
    mutateState((prev) => ({
      ...prev,
      adminPasswordToken: newTokenValue.trim(),
    }));
    setTokenSuccessMsg(true);
    setTimeout(() => setTokenSuccessMsg(false), 3000);
  };

  // Switch global theme
  const handleSelectGlobalTheme = (themeId: ThemeId) => {
    mutateState((prev) => ({
      ...prev,
      globalTheme: themeId,
    }));
  };

  // Odoo Block modifications
  const handleUpdateBlock = (updatedBlock: OdooBlock) => {
    mutateState((prev) => ({
      ...prev,
      odooBlocks: prev.odooBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
    }));
  };

  const handleAddNewBlock = () => {
    const newId = `odoo-custom-${Date.now()}`;
    const newBlock: OdooBlock = {
      id: newId,
      titleEn: 'New Signature Culinary Showcase',
      titleUr: 'نیا روایتی سجی دسترخوان بلاک',
      subtitleEn: 'Hand-crafted woodfire roasts prepared fresh daily',
      subtitleUr: 'روزانہ تازہ تیار شدہ دیسی مصالحہ جات کے ساتھ',
      contentEn: 'Experience the true heritage of Balochi Sajji and succulent Shinwari Karahi, cooked to perfection by veteran kitchen ustads.',
      contentUr: 'ہمارے کاریگر استاد روایتی ترکیب کے مطابق تازہ سجی اور کڑاہی تیار کرتے ہیں۔',
      shape: 'soft-curved',
      themeOverride: 'inherit',
      image: '/src/assets/images/dish_chicken_sajji_1790248406038.jpg',
      badgeEn: 'Special Feature',
      badgeUr: 'خاص فیچر',
      callToActionTextEn: 'Order on WhatsApp',
      callToActionTextUr: 'واٹس ایپ آرڈر',
      callToActionLink: 'https://wa.me/923009346628',
      isEnabled: true,
      displayOrder: state.odooBlocks.length + 1,
      tagEn: 'Bespoke Section / خصوصی سیکشن',
      tagUr: 'نیا اضافہ',
    };
    mutateState((prev) => ({
      ...prev,
      odooBlocks: [...prev.odooBlocks, newBlock],
    }));
    setEditingBlockId(newId);
  };

  const handleDeleteBlock = (id: string) => {
    if (state.odooBlocks.length <= 1) {
      alert('At least one Odoo block must remain in the layout.');
      return;
    }
    const filtered = state.odooBlocks.filter((b) => b.id !== id);
    mutateState((prev) => ({
      ...prev,
      odooBlocks: filtered,
    }));
    if (editingBlockId === id) {
      setEditingBlockId(filtered[0]?.id || null);
    }
  };

  // Landmark Modifications
  const handleUpdateLandmark = (updatedPin: LandmarkPin) => {
    mutateState((prev) => ({
      ...prev,
      landmarks: prev.landmarks.map((p) => (p.id === updatedPin.id ? updatedPin : p)),
    }));
  };

  // Menu Modifications
  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    mutateState((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((m) => (m.id === updatedItem.id ? updatedItem : m)),
    }));
  };

  const handleAddNewMenuItem = () => {
    const newId = `dish-custom-${Date.now()}`;
    const newItem: MenuItem = {
      id: newId,
      nameEn: 'New Chef Special Dish',
      nameUr: 'نیا خاص شاہی پکوان',
      categoryId: 'sajji',
      menuGroup: 'priority',
      descriptionEn: 'Prepared with 100% daily fresh halal cuts, slow charcoal roasted with secret spices.',
      descriptionUr: 'تازہ حلال ذبیحہ گوشت، دیسی مصالحوں کے ساتھ کوئلوں پر تیار شدہ۔',
      image: '/src/assets/images/dish_chicken_sajji_1790248406038.jpg',
      hasPortions: true,
      prices: { full: 1200, half: 650 },
      defaultPortion: 'full',
      prepTime: '25 min',
      badge: 'New / نیا پکوان',
      isPopular: false,
    };
    mutateState((prev) => ({
      ...prev,
      menuItems: [newItem, ...prev.menuItems],
    }));
    setEditingItemId(newId);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (state.menuItems.length <= 1) {
      alert('Menu must contain at least one item.');
      return;
    }
    mutateState((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((m) => m.id !== id),
    }));
    if (editingItemId === id) {
      setEditingItemId(state.menuItems[0]?.id || null);
    }
  };

  const currentEditingBlock = state.odooBlocks.find((b) => b.id === editingBlockId) || state.odooBlocks[0];
  const currentEditingDish = state.menuItems.find((m) => m.id === editingItemId) || state.menuItems[0];

  const filteredMenuItems = menuFilterCategory === 'all' 
    ? state.menuItems 
    : state.menuItems.filter((m) => m.categoryId === menuFilterCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        style={{
          backgroundColor: activeThemeConfig.bgCard,
          borderColor: activeThemeConfig.borderStrong,
          color: activeThemeConfig.textPrimary,
        }}
        className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl border shadow-2xl z-10 overflow-hidden"
      >
        {/* Top Header with Master Save All Changes Script Trigger */}
        <div
          style={{ borderColor: activeThemeConfig.borderSubtle }}
          className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Master Owner & Architecture Control Panel
                </h2>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600">
                  Anti-Reset Cache Active
                </span>
              </div>
              <p className="text-xs font-urdu text-amber-600 font-semibold" dir="rtl">
                ڈوگر سجی ماسٹر کنٹرول پینل — مکمل کنٹرول: مینو، ریٹس، لینڈ مارکس، پاسپورٹ فوٹو و تھیمز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Transactive Save Button */}
            <button
              type="button"
              onClick={handleSaveAllChanges}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save All Changes</span>
              <span className="font-urdu text-[11px]">محفوظ کریں</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              style={{ backgroundColor: activeThemeConfig.bgSurface, color: activeThemeConfig.textSecondary }}
              className="p-2 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transactive Confirmation Feedback Banner */}
        {saveSuccessMsg && (
          <div className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ All variations, landmarks, owner profile, and menu rates compiled safely into permanent localStorage!</span>
            </div>
            <span className="font-urdu text-emerald-100 text-[11px]">تمام تبدیلیاں کیشے میں محفوظ ہو گئیں</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to save: {saveErrorMsg}</span>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div
          style={{ borderColor: activeThemeConfig.borderSubtle, backgroundColor: activeThemeConfig.bgSurface }}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 border-b overflow-x-auto no-scrollbar shrink-0 text-xs font-semibold"
        >
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            style={{
              backgroundColor: activeTab === 'branding' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'branding' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Landing & Hero Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            style={{
              backgroundColor: activeTab === 'menu' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'menu' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu & Raw Pricing ({state.menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('landmarks')}
            style={{
              backgroundColor: activeTab === 'landmarks' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'landmarks' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>9 Red-Pin Landmarks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            style={{
              backgroundColor: activeTab === 'owner' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'owner' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Owner & Passport Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('odoo')}
            style={{
              backgroundColor: activeTab === 'odoo' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'odoo' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Odoo Shape Designer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            style={{
              backgroundColor: activeTab === 'themes' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'themes' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Thematic Schemes (6+3)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            style={{
              backgroundColor: activeTab === 'presets' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'presets' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>30 Button Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              backgroundColor: activeTab === 'security' ? activeThemeConfig.accent : 'transparent',
              color: activeTab === 'security' ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
            }}
            className="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security & Passcode</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: BRANDING, HERO & LANDING TEXT CONFIG MATRIX */}
          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  Landing Layout Titles & Raw Text Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Dynamically overwrite restaurant name strings, bilingual taglines, hotline nodes, address, and timings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Restaurant Name (English)</label>
                  <input
                    type="text"
                    value={state.restaurantNameEn}
                    onChange={(e) => mutateState((s) => ({ ...s, restaurantNameEn: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 font-urdu" dir="rtl">ریسٹورنٹ نام (اردو)</label>
                  <input
                    type="text"
                    value={state.restaurantNameUr}
                    onChange={(e) => mutateState((s) => ({ ...s, restaurantNameUr: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Hero Tagline Narrative (English)</label>
                  <input
                    type="text"
                    value={state.taglineEn}
                    onChange={(e) => mutateState((s) => ({ ...s, taglineEn: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 font-urdu" dir="rtl">ہیرو ٹیگ لائن (اردو)</label>
                  <input
                    type="text"
                    value={state.taglineUr}
                    onChange={(e) => mutateState((s) => ({ ...s, taglineUr: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border text-right font-urdu focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Delivery Hotline Display / ڈسپلے نمبر</label>
                  <input
                    type="text"
                    value={state.hotlineFormatted}
                    onChange={(e) => mutateState((s) => ({ ...s, hotlineFormatted: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border font-mono font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">WhatsApp Pipeline Digits (e.g. 923009346628)</label>
                  <input
                    type="text"
                    value={state.hotlineWhatsappRaw}
                    onChange={(e) => mutateState((s) => ({ ...s, hotlineWhatsappRaw: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border font-mono font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Physical Street Address (English)</label>
                  <input
                    type="text"
                    value={state.addressEn}
                    onChange={(e) => mutateState((s) => ({ ...s, addressEn: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 font-urdu" dir="rtl">پتہ (اردو)</label>
                  <input
                    type="text"
                    value={state.addressUr}
                    onChange={(e) => mutateState((s) => ({ ...s, addressUr: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border text-right font-urdu focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Operating Hours / سروس کے اوقات</label>
                  <input
                    type="text"
                    value={state.timingsEn}
                    onChange={(e) => mutateState((s) => ({ ...s, timingsEn: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 font-urdu" dir="rtl">اوقات (اردو)</label>
                  <input
                    type="text"
                    value={state.timingsUr}
                    onChange={(e) => mutateState((s) => ({ ...s, timingsUr: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border text-right font-urdu focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Graphic Media Overrides */}
              <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                <div
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="p-4 rounded-2xl border space-y-2"
                >
                  <span className="text-xs font-bold block">Primary Brand Logo (Drop or Edit)</span>
                  <div className="w-24 h-24">
                    <EditableImage
                      src={state.logoImage}
                      alt="Brand Logo"
                      onImageChange={(b64) => mutateState((s) => ({ ...s, logoImage: b64 }))}
                      aspectRatioClass="aspect-square"
                      roundedClass="rounded-2xl"
                      labelEn="Edit Logo"
                      labelUr="لوگو تبدیل کریں"
                    />
                  </div>
                </div>

                <div
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="p-4 rounded-2xl border space-y-2"
                >
                  <span className="text-xs font-bold block">Hero Banner Wallpaper (16:9)</span>
                  <div className="w-full">
                    <EditableImage
                      src={state.heroImage}
                      alt="Hero Banner"
                      onImageChange={(b64) => mutateState((s) => ({ ...s, heroImage: b64 }))}
                      aspectRatioClass="aspect-16/9"
                      roundedClass="rounded-2xl"
                      labelEn="Edit Hero Banner"
                      labelUr="بینر تبدیل کریں"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPREHENSIVE MENU ITEMS & RAW PRICING WORKSPACE */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                    Comprehensive Menu Management & Raw Pricing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update every dish name, portion matrix, prices, description, and photo. Changes commit immediately to localStorage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewMenuItem}
                  style={{ backgroundColor: activeThemeConfig.accent, color: activeThemeConfig.accentText }}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Food Item</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'sajji', 'combos', 'karahi', 'mutton', 'beef', 'daal', 'tandoor', 'drinks'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMenuFilterCategory(cat)}
                    style={{
                      backgroundColor: menuFilterCategory === cat ? activeThemeConfig.accent : activeThemeConfig.bgSurface,
                      color: menuFilterCategory === cat ? activeThemeConfig.accentText : activeThemeConfig.textSecondary,
                    }}
                    className="px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Dish Editor Section */}
              {currentEditingDish && (
                <div
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderStrong }}
                  className="p-4 sm:p-5 rounded-3xl border shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <EditableImage
                          src={currentEditingDish.image}
                          alt={currentEditingDish.nameEn}
                          onImageChange={(b64) => handleUpdateMenuItem({ ...currentEditingDish, image: b64 })}
                          aspectRatioClass="aspect-square"
                          roundedClass="rounded-xl"
                          labelEn="Edit"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{currentEditingDish.nameEn}</span>
                        <span className="text-[11px] font-urdu text-amber-600 block">{currentEditingDish.nameUr}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMenuItem(currentEditingDish.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Item</span>
                    </button>
                  </div>

                  {/* Form fields for current dish */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold mb-1">Item Title (English)</label>
                      <input
                        type="text"
                        value={currentEditingDish.nameEn}
                        onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, nameEn: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border focus:outline-hidden font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 font-urdu" dir="rtl">نام (اردو)</label>
                      <input
                        type="text"
                        value={currentEditingDish.nameUr}
                        onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, nameUr: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Description (English)</label>
                      <textarea
                        rows={2}
                        value={currentEditingDish.descriptionEn}
                        onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, descriptionEn: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border focus:outline-hidden resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 font-urdu" dir="rtl">تفصیل (اردو)</label>
                      <textarea
                        rows={2}
                        value={currentEditingDish.descriptionUr}
                        onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, descriptionUr: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border text-right font-urdu focus:outline-hidden resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Category & Group</label>
                      <select
                        value={currentEditingDish.categoryId}
                        onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, categoryId: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border focus:outline-hidden"
                      >
                        <option value="sajji">Balochi Sajji</option>
                        <option value="combos">Family Combos</option>
                        <option value="karahi">Desi Karahi</option>
                        <option value="mutton">Mutton Roasts</option>
                        <option value="beef">Beef Specialties</option>
                        <option value="daal">Daal Makhni</option>
                        <option value="tandoor">Fresh Tandoor</option>
                        <option value="drinks">Cold Drinks</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Preparation Time & Badge</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={currentEditingDish.prepTime || ''}
                          onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, prepTime: e.target.value })}
                          placeholder="e.g. 25-30 min"
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3 py-2 rounded-xl border focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={currentEditingDish.badge || ''}
                          onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, badge: e.target.value })}
                          placeholder="e.g. Bestseller"
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3 py-2 rounded-xl border focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">Portion Pricing Matrix / قیمت کا تعین</span>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={currentEditingDish.hasPortions}
                          onChange={(e) => handleUpdateMenuItem({ ...currentEditingDish, hasPortions: e.target.checked })}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Enable Full/Half Dual Portions</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">Full Serving Price (Rs.)</span>
                        <input
                          type="number"
                          value={currentEditingDish.prices.full}
                          onChange={(e) => handleUpdateMenuItem({
                            ...currentEditingDish,
                            prices: { ...currentEditingDish.prices, full: Number(e.target.value) || 0 },
                          })}
                          style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-32 px-3 py-1.5 rounded-xl border font-mono font-bold"
                        />
                      </div>

                      {currentEditingDish.hasPortions && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold mb-1">Half Serving Price (Rs.)</span>
                          <input
                            type="number"
                            value={currentEditingDish.prices.half || 0}
                            onChange={(e) => handleUpdateMenuItem({
                              ...currentEditingDish,
                              prices: { ...currentEditingDish.prices, half: Number(e.target.value) || 0 },
                            })}
                            style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                            className="w-32 px-3 py-1.5 rounded-xl border font-mono font-bold"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Dish List to pick which one to edit */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-400 block">Select Dish to Edit:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setEditingItemId(item.id)}
                      style={{
                        backgroundColor: editingItemId === item.id ? activeThemeConfig.accent : activeThemeConfig.bgSurface,
                        color: editingItemId === item.id ? activeThemeConfig.accentText : activeThemeConfig.textPrimary,
                        borderColor: activeThemeConfig.borderSubtle,
                      }}
                      className="p-2.5 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={item.image} alt={item.nameEn} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="text-xs font-bold truncate">{item.nameEn}</span>
                      </div>
                      <span className="text-xs font-mono font-bold tabular-nums shrink-0">
                        Rs. {item.prices.full}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 9 LOCAL RED-PIN ADDRESS LANDMARKS WORKSPACE */}
          {activeTab === 'landmarks' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  9 Local Red-Pin Address Landmarks
                </h3>
                <p className="text-xs text-slate-500">
                  Modify the 9 verified neighborhood pins displayed in the Location section and checkout system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {state.landmarks.map((pin, idx) => (
                  <div
                    key={pin.id}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="p-4 rounded-2xl border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600">Pin #{idx + 1} ({pin.id})</span>
                      <select
                        value={pin.category}
                        onChange={(e) => handleUpdateLandmark({ ...pin, category: e.target.value as any })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="px-2 py-1 text-[11px] rounded-lg border"
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
                        <label className="block text-[11px] font-semibold mb-0.5">Landmark Name (English)</label>
                        <input
                          type="text"
                          value={pin.nameEn}
                          onChange={(e) => handleUpdateLandmark({ ...pin, nameEn: e.target.value })}
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3 py-1.5 rounded-xl border focus:outline-hidden font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-0.5 font-urdu" dir="rtl">مقام کا نام (اردو)</label>
                        <input
                          type="text"
                          value={pin.nameUr}
                          onChange={(e) => handleUpdateLandmark({ ...pin, nameUr: e.target.value })}
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3 py-1.5 rounded-xl border text-right font-urdu font-medium focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-0.5">Distance Metric / فاصلہ</label>
                        <input
                          type="text"
                          value={pin.distanceEstimate}
                          onChange={(e) => handleUpdateLandmark({ ...pin, distanceEstimate: e.target.value })}
                          style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                          className="w-full px-3 py-1.5 rounded-xl border focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OWNER PROFILE & PASSPORT PICTURE FRAME WORKSPACE */}
          {activeTab === 'owner' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  Founder & Owner Profile (Muhammad Dogar)
                </h3>
                <p className="text-xs text-slate-500">
                  Configure the owner profile and passport-size picture frame rendered at the absolute bottom of the application.
                </p>
              </div>

              {/* Passport Picture Override Box */}
              <div
                style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                className="p-5 rounded-3xl border flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50 shrink-0">
                  <EditableImage
                    src={state.ownerPassportImage}
                    alt={state.ownerNameEn}
                    onImageChange={(b64) => mutateState((s) => ({ ...s, ownerPassportImage: b64 }))}
                    aspectRatioClass="aspect-square"
                    roundedClass="rounded-2xl"
                    labelEn="Edit Passport Picture"
                    labelUr="پاسپورٹ تصویر بدلیں"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-amber-600 uppercase tracking-wider block">
                    Owner Passport Photo Frame (1:1 Ratio)
                  </span>
                  <p className="text-slate-500 leading-relaxed">
                    Click the edit button or drag and drop any executive portrait here. It is automatically converted through FileReader into an optimized Base64 Data-URI and saved in localStorage.
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold block">
                    ✓ Verified Frame Active at Absolute Bottom of Site
                  </span>
                </div>
              </div>

              {/* Owner Text Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Owner Name (English)</label>
                  <input
                    type="text"
                    value={state.ownerNameEn}
                    onChange={(e) => mutateState((s) => ({ ...s, ownerNameEn: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 font-urdu" dir="rtl">مالک کا نام (اردو)</label>
                  <input
                    type="text"
                    value={state.ownerNameUr}
                    onChange={(e) => mutateState((s) => ({ ...s, ownerNameUr: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border text-right font-urdu font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Executive Title (English)</label>
                  <input
                    type="text"
                    value={state.ownerTitleEn}
                    onChange={(e) => mutateState((s) => ({ ...s, ownerTitleEn: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border font-medium focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 font-urdu" dir="rtl">عہدہ (اردو)</label>
                  <input
                    type="text"
                    value={state.ownerTitleUr}
                    onChange={(e) => mutateState((s) => ({ ...s, ownerTitleUr: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border text-right font-urdu font-medium focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Founder Hospitality Message (English)</label>
                  <textarea
                    rows={2}
                    value={state.ownerMessageEn}
                    onChange={(e) => mutateState((s) => ({ ...s, ownerMessageEn: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border focus:outline-hidden resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 font-urdu" dir="rtl">بانی کا پیغام و عزم (اردو)</label>
                  <textarea
                    rows={2}
                    value={state.ownerMessageUr}
                    onChange={(e) => mutateState((s) => ({ ...s, ownerMessageUr: e.target.value }))}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                    className="w-full px-3 py-2 rounded-xl border text-right font-urdu focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ODOO BLOCK DESIGNER & SHAPES */}
          {activeTab === 'odoo' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                    Live Odoo Block Designer & Dynamic Shape Manipulator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transform block shapes dynamically (soft-curved, square box, triangular mask, circular canvas).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewBlock}
                  style={{ backgroundColor: activeThemeConfig.accent, color: activeThemeConfig.accentText }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Odoo Block</span>
                </button>
              </div>

              {/* Block Selector Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {state.odooBlocks.map((block, idx) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => setEditingBlockId(block.id)}
                    style={{
                      backgroundColor: editingBlockId === block.id ? activeThemeConfig.accent : activeThemeConfig.bgSurface,
                      color: editingBlockId === block.id ? activeThemeConfig.accentText : activeThemeConfig.textPrimary,
                      borderColor: activeThemeConfig.borderStrong,
                    }}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    <span>Block {idx + 1}: {block.shape}</span>
                  </button>
                ))}
              </div>

              {/* Editing active block */}
              {currentEditingBlock && (
                <div
                  style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                  className="p-5 rounded-2xl border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase text-amber-600">
                      Configure: {currentEditingBlock.titleEn}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(currentEditingBlock.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Block</span>
                    </button>
                  </div>

                  {/* SHAPE CONTROLS FOR BLOCKS */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      Rendering Shape Structure / بلاک کا ڈیزائن شیپ:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                      {(['soft-curved', 'square-box', 'triangular-mask', 'circular-canvas'] as BlockShape[]).map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => handleUpdateBlock({ ...currentEditingBlock, shape })}
                          className={`p-2.5 rounded-xl border text-center capitalize cursor-pointer transition-all ${
                            currentEditingBlock.shape === shape
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-sm'
                              : 'bg-white/5 border-slate-300/40 text-slate-600'
                          }`}
                        >
                          {shape.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={currentEditingBlock.titleEn}
                        onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, titleEn: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border focus:outline-hidden font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 font-urdu" dir="rtl">عنوان (اردو)</label>
                      <input
                        type="text"
                        value={currentEditingBlock.titleUr}
                        onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, titleUr: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border text-right font-urdu font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Narrative Content (English)</label>
                      <textarea
                        rows={2}
                        value={currentEditingBlock.contentEn}
                        onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, contentEn: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border focus:outline-hidden resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 font-urdu" dir="rtl">تفصیل (اردو)</label>
                      <textarea
                        rows={2}
                        value={currentEditingBlock.contentUr}
                        onChange={(e) => handleUpdateBlock({ ...currentEditingBlock, contentUr: e.target.value })}
                        style={{ backgroundColor: activeThemeConfig.bgCard, borderColor: activeThemeConfig.borderSubtle }}
                        className="w-full px-3 py-2 rounded-xl border text-right font-urdu focus:outline-hidden resize-none"
                      />
                    </div>
                  </div>

                  {/* Block Image Selector */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold block mb-1">Block Showcase Image (Drop file or click Edit)</span>
                    <div className="w-full max-w-sm">
                      <EditableImage
                        src={currentEditingBlock.image || ''}
                        alt={currentEditingBlock.titleEn}
                        onImageChange={(b64) => handleUpdateBlock({ ...currentEditingBlock, image: b64 })}
                        aspectRatioClass="aspect-16/9"
                        roundedClass="rounded-xl"
                        labelEn="Change Block Image"
                        labelUr="تصویر بدلیں"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: THEMES (6 GLOBAL + 3 ELITE BESPOKE) */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                    6 Global Color Schemes (Default: Pure Clean White Canvas #FFFFFF)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Active: <strong className="text-amber-600">{activeThemeConfig.nameEn}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Click any global scheme to restyle the entire storefront in real-time.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {GLOBAL_THEMES.map((theme) => {
                    const isSelected = state.globalTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => handleSelectGlobalTheme(theme.id)}
                        style={{
                          backgroundColor: theme.bgCanvas,
                          color: theme.textPrimary,
                          borderColor: isSelected ? '#EA580C' : theme.borderStrong,
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:scale-[1.02] ${
                          isSelected ? 'ring-2 ring-amber-500 shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">{theme.nameEn}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-urdu text-amber-600 font-medium mb-3" dir="rtl">
                          {theme.nameUr}
                        </p>

                        <div className="flex items-center gap-2 text-[10px]">
                          <span
                            className="px-2 py-0.5 rounded-md font-bold"
                            style={{ backgroundColor: theme.accent, color: theme.accentText }}
                          >
                            Accent
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-md border"
                            style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderSubtle }}
                          >
                            Surface
                          </span>
                          <span className="ml-auto text-[10px] opacity-75">{theme.badge}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3 Elite Bespoke Master Variations */}
              <div className="pt-5 border-t" style={{ borderColor: activeThemeConfig.borderSubtle }}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                    3 Elite Bespoke Premium Custom Variations
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  1. Cherry Pin (Rose & luxury gradients) · 2. Smok (Moody translucent bistro) · 3. Green Land & Yellow Sunlight (Emerald & bright gold highlights)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {BESPOKE_THEMES.map((theme) => {
                    const isSelected = state.globalTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => handleSelectGlobalTheme(theme.id)}
                        style={{
                          backgroundColor: theme.bgCanvas,
                          color: theme.textPrimary,
                          borderColor: isSelected ? theme.accent : theme.borderStrong,
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:scale-[1.02] ${
                          isSelected ? 'ring-2 ring-amber-500 shadow-xl' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{theme.nameEn}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-urdu text-amber-400 font-medium mb-3" dir="rtl">
                          {theme.nameUr}
                        </p>

                        <div className="p-2.5 rounded-xl border text-[10px] space-y-1" style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderSubtle }}>
                          <span className="font-semibold block">{theme.badge}</span>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: theme.accent, color: theme.accentText }}>
                              Accent
                            </span>
                            <span className="font-mono text-[9px] opacity-70">
                              {theme.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: 30 PRESET BUTTON THEME PROFILES */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  30 Curated Button Preset Profiles
                </h3>
                <p className="text-xs text-slate-500">
                  Select and preview tailored button profiles, gradient styles, and curved pill forms.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {BUTTON_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
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
                        style={{
                          background: preset.bg,
                          color: preset.text,
                        }}
                        className={`w-full py-2 px-3 text-xs font-bold shadow-sm transition-all ${preset.rounded} ${preset.border || ''}`}
                      >
                        Order Now
                      </button>
                      <div>
                        <span className="text-[11px] font-bold block">{preset.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Profile #{preset.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY TOKEN & FACTORY RESET */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  Re-Authentication Access Token Management
                </h3>
                <p className="text-xs text-slate-500">
                  Update the password token protecting the 3-dot kebab re-authentication gateway (Default: 12345).
                </p>
              </div>

              <form onSubmit={handleSaveToken} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Administration Access Passcode Token / ایڈمن پاس کوڈ
                  </label>
                  <input
                    type="text"
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderStrong }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold tracking-widest focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  style={{ backgroundColor: activeThemeConfig.accent, color: activeThemeConfig.accentText }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Update & Save Passcode Token
                </button>

                {tokenSuccessMsg && (
                  <p className="text-xs text-emerald-500 font-medium">
                    ✓ Access token updated successfully to: {state.adminPasswordToken}
                  </p>
                )}
              </form>

              {/* Anti-Reset & Deliberate Factory Reset */}
              <div
                style={{ backgroundColor: activeThemeConfig.bgSurface, borderColor: activeThemeConfig.borderSubtle }}
                className="pt-5 border-t p-4 rounded-2xl border space-y-3"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold">Deliberate Factory Reset & Anti-Reset Protection</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your customized changes, landmarks, owner photo, themes, and rates are permanently preserved across browser refreshes and restarts.
                  Only an explicit, confirmed factory reset action will purge custom edits.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('RESTORE DEFAULT WARNING: Are you certain you want to purge all custom edits and reset the restaurant setup to factory defaults? This action cannot be undone.')) {
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

        </div>

        {/* Modal Footer with Master Save Button */}
        <div
          style={{ borderColor: activeThemeConfig.borderSubtle, backgroundColor: activeThemeConfig.bgSurface }}
          className="p-4 border-t flex items-center justify-between gap-3 shrink-0"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">All changes compile synchronously to localStorage</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAllChanges}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
            <span className="font-urdu text-[11px]">تمام تبدیلیاں محفوظ کریں</span>
          </button>
        </div>
      </div>
    </div>
  );
};
