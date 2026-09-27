/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { THEMES_REGISTRY, LIGHTING_MODES, BLOCK_STYLE_SCHEMES } from './constants/themes';
import { 
  CartItem, MenuItem, RestaurantState 
} from './types';
import { 
  loadRestaurantState, saveRestaurantState, resetRestaurantStateToFactory,
  loadCustomerCart, saveCustomerCart, clearCustomerCart
} from './utils/storage';
import { TopNavbar } from './components/TopNavbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { ProductCard } from './components/ProductCard';
import { AddOnDrawerModal } from './components/AddOnDrawerModal';
import { CartTrayDrawer } from './components/CartTrayDrawer';
import { OdooBlockRenderer } from './components/OdooBlockRenderer';
import { GuidelinesAndAuthModal } from './components/GuidelinesAndAuthModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AdminStandalonePage } from './components/AdminStandalonePage';
import { OperationsPortalPage } from './components/OperationsPortalPage';
import { FooterSection } from './components/FooterSection';
import { LocationSection } from './components/LocationSection';
import { OwnerProfileSection } from './components/OwnerProfileSection';
import { BuildYourOrderSection } from './components/BuildYourOrderSection';
import { Sparkles, Flame, Utensils } from 'lucide-react';

export default function App() {
  // Anti-Reset Session Storage: synchronously loads custom array from localStorage
  const [restaurantState, setRestaurantState] = useState<RestaurantState>(() => {
    return loadRestaurantState();
  });

  // Active Category Filter for anchor highlighting
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Customer Cart: Separated and preserved independently in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return loadCustomerCart();
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Contextual Add-On & Upsell Modal Expansion Drawer
  const [activeDrawerItem, setActiveDrawerItem] = useState<{
    item: MenuItem;
    portion: 'full' | 'half';
  } | null>(null);

  // 3-Dot Kebab Menu: Guidelines & Re-Authentication Gateway Modal
  const [isGuidelinesAuthOpen, setIsGuidelinesAuthOpen] = useState<boolean>(false);

  // Dedicated Standalone View State: 'storefront' | 'portal' | 'admin'
  const [currentView, setCurrentView] = useState<'storefront' | 'portal' | 'admin'>('storefront');

  // Master Owner Control Dashboard
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);

  // Commit all state updates instantly into localStorage JSON
  const updateRestaurantState = (newState: RestaurantState) => {
    setRestaurantState(newState);
    saveRestaurantState(newState);
  };

  // Factory reset handler
  const handleFactoryReset = () => {
    const fresh = resetRestaurantStateToFactory();
    setRestaurantState(fresh);
    setIsAdminDashboardOpen(false);
  };

  // Resolve current active global theme (Default: pure clean white canvas #FFFFFF)
  const currentTheme = useMemo(() => {
    return THEMES_REGISTRY[restaurantState.globalTheme] || THEMES_REGISTRY['clean-white'];
  }, [restaurantState.globalTheme]);

  // Resolve current active lighting mode (Layer C)
  const activeLighting = useMemo(() => {
    const modeId = restaurantState.activeLightingMode || 'golden-radiance';
    return LIGHTING_MODES.find((m) => m.id === modeId) || LIGHTING_MODES[2];
  }, [restaurantState.activeLightingMode]);

  // Resolve current active block styling scheme (Layer B)
  const activeBlockScheme = useMemo(() => {
    const schemeId = restaurantState.activeBlockScheme || 'block-elevated-card';
    return BLOCK_STYLE_SCHEMES.find((b) => b.id === schemeId) || BLOCK_STYLE_SCHEMES[0];
  }, [restaurantState.activeBlockScheme]);

  // EXPLICIT EXCLUSION FILTER: Permanently remove any green-marked fast-food or non-traditional rice items
  const authenticMenuItems = useMemo(() => {
    return restaurantState.menuItems.filter(
      (item) =>
        !item.isExcludedFastFood &&
        !/burger|pizza|french fries|broast|zinger|commercial biryani/i.test(item.nameEn)
    );
  }, [restaurantState.menuItems]);

  // Product Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: authenticMenuItems.length };
    authenticMenuItems.forEach((item) => {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [authenticMenuItems]);

  // Category specific item lists for structured catalog flow
  const sajjiItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'sajji'), [authenticMenuItems]);
  const combosItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'combos'), [authenticMenuItems]);
  const drinksItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'drinks'), [authenticMenuItems]);
  const karahiItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'karahi'), [authenticMenuItems]);
  const muttonItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'mutton'), [authenticMenuItems]);
  const beefItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'beef'), [authenticMenuItems]);
  const bbqItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'bbq'), [authenticMenuItems]);
  const daalItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'daal'), [authenticMenuItems]);
  const tandoorItems = useMemo(() => authenticMenuItems.filter((i) => i.categoryId === 'tandoor'), [authenticMenuItems]);

  // Cart Actions with Isolated Cart Persistence
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.menuItemId === newItem.menuItemId && i.portion === newItem.portion
      );

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        // Merge add-ons if needed
        newItem.selectedAddOns.forEach((newAddOn) => {
          const matchAddOn = updated[existingIndex].selectedAddOns.find(
            (a) => a.addOnId === newAddOn.addOnId
          );
          if (matchAddOn) {
            matchAddOn.quantity += newAddOn.quantity;
          } else {
            updated[existingIndex].selectedAddOns.push(newAddOn);
          }
        });
      } else {
        updated = [...prev, newItem];
      }

      saveCustomerCart(updated);
      return updated;
    });
    setIsCartOpen(true);
  };

  const handleDirectAddFromCard = (item: MenuItem, portion: 'full' | 'half') => {
    const unitPrice =
      portion === 'half' && item.prices.half !== undefined
        ? item.prices.half
        : item.prices.full;

    const newCartItem: CartItem = {
      id: `${item.id}-${portion}-${Date.now()}`,
      menuItemId: item.id,
      nameEn: item.nameEn,
      nameUr: item.nameUr,
      portion: portion,
      unitPrice: unitPrice,
      quantity: 1,
      selectedAddOns: [],
    };

    handleAddToCart(newCartItem);
  };

  const handleUpdateItemQuantity = (cartItemId: string, newQuantity: number) => {
    setCartItems((prev) => {
      let updated: CartItem[];
      if (newQuantity <= 0) {
        updated = prev.filter((i) => i.id !== cartItemId);
      } else {
        updated = prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: newQuantity } : i
        );
      }
      saveCustomerCart(updated);
      return updated;
    });
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== cartItemId);
      saveCustomerCart(updated);
      return updated;
    });
  };

  const handleClearCart = () => {
    clearCustomerCart();
    setCartItems([]);
  };

  // Image Upload handler for gallery
  const handleUpdateGalleryImage = (index: number, newB64: string) => {
    const updated = [...restaurantState.galleryImages];
    updated[index] = newB64;
    updateRestaurantState({
      ...restaurantState,
      galleryImages: updated,
    });
  };

  // ---------------------------------------------------------------------------
  // VIEW MODE ROUTER: ISOLATED STANDALONE MULTI-COLUMN CONSOLE & PAGE 4 ADMIN
  // ---------------------------------------------------------------------------
  if (currentView === 'admin') {
    return (
      <AdminStandalonePage
        state={restaurantState}
        onUpdateState={updateRestaurantState}
        onFactoryReset={handleFactoryReset}
        onReturnToStorefront={() => setCurrentView('storefront')}
      />
    );
  }

  if (currentView === 'portal') {
    return (
      <OperationsPortalPage
        state={restaurantState}
        theme={currentTheme}
        onReturnToStorefront={() => setCurrentView('storefront')}
        onAccessAdmin={() => setCurrentView('admin')}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: currentTheme.bgCanvas,
        color: currentTheme.textPrimary,
      }}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${currentTheme.specialClass || ''} ${activeLighting.id !== 'minimalist-flat' ? 'relative' : ''}`}
    >
      {/* 1. TOP BAR CONTRACT WITH 3-DOT KEBAB STANDALONE PORTAL ROUTE */}
      <TopNavbar
        restaurantNameEn={restaurantState.restaurantNameEn}
        hotlineFormatted={restaurantState.hotlineFormatted}
        hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
        theme={currentTheme}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenGuidelinesAndAuth={() => setCurrentView('portal')}
        onOpenCartTray={() => setIsCartOpen(true)}
      />

      {/* 2. HERO SECTION WITH DEFENSIVE NON-COLLIDING SPACING & UNIVERSAL EDIT SELECTORS */}
      <HeroSection
        restaurantNameEn={restaurantState.restaurantNameEn}
        restaurantNameUr={restaurantState.restaurantNameUr}
        taglineEn={restaurantState.taglineEn}
        taglineUr={restaurantState.taglineUr}
        hotlineFormatted={restaurantState.hotlineFormatted}
        hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
        heroImage={restaurantState.heroImage}
        logoImage={restaurantState.logoImage}
        theme={currentTheme}
        onUpdateHeroImage={(b64) => updateRestaurantState({ ...restaurantState, heroImage: b64 })}
        onUpdateLogoImage={(b64) => updateRestaurantState({ ...restaurantState, logoImage: b64 })}
      />

      {/* 2.5 HERO-ADJACENT "BUILD YOUR ORDER" CUSTOM MEAL ASSEMBLY ENGINE (COMPACT COLLAPSIBLE) */}
      <BuildYourOrderSection
        theme={currentTheme}
        hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
        onAddToCart={(customCartItem) => handleAddToCart(customCartItem)}
      />

      {/* 3. FLOATING CATEGORY CONTROLLER ROW OVER THE HOME VIEW (ZERO LAYOUT MUTATIONS) */}
      <CategoryFilterBar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        theme={currentTheme}
        countsByCategory={categoryCounts}
      />

      {/* 4. SEAMLESS DUAL-MENU CONTINUOUS STREAM VIEWPORT STACK */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-16">
        <section id="menu" className="space-y-12 scroll-mt-28">
          {/* Main Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                  <Flame className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                  Merged 2-Page Continuous Stream Catalog
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Authentic Balochi Sajji & Shinwari Catalog
              </h2>
              <p className="text-base sm:text-lg font-extrabold font-urdu text-amber-500 mt-1" dir="rtl">
                خالص بلوچی سجی، شنواری کڑاہی اور روایتی دسترخوان — ایک ہی مسلسل لسٹ میں
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                ✓ 100% Zabihah Meat
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                Wood Charcoal Flame
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {authenticMenuItems.length} Dishes
              </span>
            </div>
          </div>

          {/* DUAL-VIEW CARD ENGINE (MOBILE 1-ROW VS PC 2-GRID):
              Controlled via the password-locked Page 4 Standalone Admin Panel.
              If 'mobile-default': forces 'grid-cols-1 w-full max-w-xl mx-auto px-2' on mobile viewports so typography stays clear and non-overlapping.
              If 'desktop-grid': renders twin-column layout ('grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2') with vertical button stacking. */}
          {(() => {
            const catalogGridClass =
              restaurantState.catalogViewMode === 'desktop-grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-xl sm:max-w-none mx-auto px-2';

            return (
              <>
                {/* GROUP 1: PRIORITY ITEMS (Main Sajji, Combos & Beverages) */}
                <div id="group1-priority" className="space-y-12">
                  {/* Category: Balochi Sajji & Chargha */}
                  <div id="category-sajji" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🍗</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Balochi Sajji & Chargha Specials
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            خاص روایتی کوئلہ روسٹ بلوچی سجی و چرغہ
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {sajjiItems.length} Dishes
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {sajjiItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category: Family Deals & Combos */}
                  <div id="category-combos" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">👑</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Family Deals & Combo Packages
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            شاہی فیملی ڈیلز اور کمبو پیکجز
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {combosItems.length} Deals
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {combosItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category: Cold Drinks & Beverages */}
                  <div id="category-drinks" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🥤</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Cold Drinks & Beverages
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            ترو تازہ ٹھنڈی بوتلیں و مشروبات
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {drinksItems.length} Items
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {drinksItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* SEAMLESS CATALOG DIVIDER */}
                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed" style={{ borderColor: currentTheme.borderStrong }} />
                  </div>
                  <div
                    style={{ backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderStrong }}
                    className="relative px-6 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-md"
                  >
                    <Utensils className="w-4 h-4 text-amber-500" />
                    <span>Page 2 Extended Traditional Catalog Follows Directly Below</span>
                    <span className="font-urdu text-[11px] text-amber-500">روایتی دیسی کڑاہی و باربی کیو فہرست</span>
                  </div>
                </div>

                {/* GROUP 2: EXTENDED TRADITIONAL DISHES */}
                <div id="group2-extended" className="space-y-12">
                  {/* Category: Desi Murgh Karahi */}
                  <div id="category-karahi" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🥘</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Desi Murgh Karahi Variants
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            خالص دیسی گھی و مکھن مرغ کڑاہی
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {karahiItems.length} Dishes
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {karahiItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category: Prime Mutton */}
                  <div id="category-mutton" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🥩</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Prime Mutton Roasts & Karahi
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            شاہی ذبیحہ مٹن کڑاہی و روایتی پکوان
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {muttonItems.length} Dishes
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {muttonItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category: Beef Specialties */}
                  <div id="category-beef" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🍢</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Beef Seekh Kababs & Bihari Boti
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            خالص بیف سیخ کباب، بہاری بوٹی و گولا کباب
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {beefItems.length} Dishes
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {beefItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category: Charcoal BBQ */}
                  <div id="category-bbq" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🔥</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Charcoal BBQ Embers & Tikka Boti
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            کوئلہ پر سینکی ہوئی چکن بوٹی، ملائی بوٹی و ریشمی کباب
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {bbqItems.length} Dishes
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {bbqItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category: Traditional Daal */}
                  <div id="category-daal" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🍲</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Traditional Daal Makhni & Tarka
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            دال ماش فرائی، دال چنا تڑکہ اور مکھنی دال
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {daalItems.length} Dishes
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {daalItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category: Fresh Tandoor */}
                  <div id="category-tandoor" className="space-y-6 scroll-mt-28">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🫓</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            Fresh Tandoor Naan & Roti
                          </h3>
                          <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
                            گرم روغنی نان، سادہ تندوری روٹی اور لوازمات
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {tandoorItems.length} Items
                      </span>
                    </div>
                    <div className={catalogGridClass}>
                      {tandoorItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          theme={currentTheme}
                          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
                          onOpenDetails={(dish, portion) => setActiveDrawerItem({ item: dish, portion })}
                          onDirectAdd={(dish, portion) => handleDirectAddFromCard(dish, portion)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </section>

        {/* 5. LOCATION & RADIUS SECTION: 9 VERIFIED LOCAL LANDMARKS & 5 KM FREE DELIVERY ZONE */}
        <LocationSection
          theme={currentTheme}
          hotlineFormatted={restaurantState.hotlineFormatted}
          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
          landmarks={restaurantState.landmarks}
        />

        {/* 6. LIVE ODOO BLOCK DESIGNER & SHAPE MANIPULATOR GRID */}
        <section id="odoo-blocks" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b" style={{ borderColor: currentTheme.borderSubtle }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Live Architectural Modules
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Craftsmanship, Hygiene & Dining Experience
              </h2>
              <p className="text-base font-bold font-urdu text-amber-600 mt-1" dir="rtl">
                اوڈو رو سیکشن بلاکس — سافٹ کریوڈ، اسکوائر، تکونی اور دائرہ نما ڈیزائن
              </p>
            </div>
          </div>

          {/* ROBUST POSITION LOCKING GRID: Changing shapes or dimensions never disrupts or collapses adjacent nodes */}
          <div className="position-locked-grid">
            {restaurantState.odooBlocks.map((block) => (
              <OdooBlockRenderer
                key={block.id}
                block={block}
                globalTheme={currentTheme}
              />
            ))}
          </div>
        </section>
      </main>

      {/* 6. FOOTER SECTION WITH RESTAURANT MEDIA GALLERY */}
      <FooterSection
        state={restaurantState}
        theme={currentTheme}
        onUpdateGalleryImage={handleUpdateGalleryImage}
        onOpenGuidelines={() => setCurrentView('portal')}
      />

      {/* 7. ABSOLUTE BOTTOM PASSPORT SIZE PICTURE FRAME: OWNER PROFILE (MUHAMMAD DOGAR) */}
      <OwnerProfileSection
        ownerNameEn={restaurantState.ownerNameEn}
        ownerNameUr={restaurantState.ownerNameUr}
        ownerTitleEn={restaurantState.ownerTitleEn}
        ownerTitleUr={restaurantState.ownerTitleUr}
        ownerMessageEn={restaurantState.ownerMessageEn}
        ownerMessageUr={restaurantState.ownerMessageUr}
        ownerPassportImage={restaurantState.ownerPassportImage}
        hotlineFormatted={restaurantState.hotlineFormatted}
        theme={currentTheme}
        onUpdateOwnerImage={(b64) => updateRestaurantState({ ...restaurantState, ownerPassportImage: b64 })}
        onOpenAdmin={() => setCurrentView('portal')}
      />

      {/* 8. FULL-SCREEN MODAL EXPANSION DRAWER (UPSELLS, DRINKS, SAUCES & WHATSAPP) */}
      {activeDrawerItem && (
        <AddOnDrawerModal
          item={activeDrawerItem.item}
          initialPortion={activeDrawerItem.portion}
          addOns={restaurantState.addOns}
          theme={currentTheme}
          hotlineFormatted={restaurantState.hotlineFormatted}
          hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
          restaurantNameEn={restaurantState.restaurantNameEn}
          restaurantNameUr={restaurantState.restaurantNameUr}
          isOpen={true}
          onClose={() => setActiveDrawerItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 9. SLIDE-OVER CART TRAY WITH 5KM DELIVERY RADIUS METER & NATIVE WHATSAPP ROUTING */}
      <CartTrayDrawer
        isOpen={isCartOpen}
        onOpen={() => setIsCartOpen(true)}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        theme={currentTheme}
        hotlineFormatted={restaurantState.hotlineFormatted}
        hotlineWhatsappRaw={restaurantState.hotlineWhatsappRaw}
        restaurantNameEn={restaurantState.restaurantNameEn}
        restaurantNameUr={restaurantState.restaurantNameUr}
        onUpdateQuantity={handleUpdateItemQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onAddToCart={handleAddToCart}
      />

      {/* 10. 3-DOT KEBAB RE-AUTHENTICATION GATEWAY PORTAL MODAL */}
      <GuidelinesAndAuthModal
        isOpen={isGuidelinesAuthOpen}
        onClose={() => setIsGuidelinesAuthOpen(false)}
        theme={currentTheme}
        hotlineFormatted={restaurantState.hotlineFormatted}
        guidelines={restaurantState.guidelines}
        adminPasswordToken={restaurantState.adminPasswordToken}
        onAuthenticated={() => {
          setIsGuidelinesAuthOpen(false);
          setCurrentView('admin'); // Seamlessly transitions to standalone Page 4 Admin Panel
        }}
      />

      {/* OPTIONAL POPUP OWNER DASHBOARD MODAL */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        state={restaurantState}
        onUpdateState={updateRestaurantState}
        onFactoryReset={handleFactoryReset}
      />
    </div>
  );
}
