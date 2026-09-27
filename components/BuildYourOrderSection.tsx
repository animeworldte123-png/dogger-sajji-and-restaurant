import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Utensils, 
  Check, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  Send, 
  ChevronDown,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { CartItem, ThemeStyleConfig } from '../types';
import { formatCustomBuiltOrderReceipt, openNativeWhatsApp } from '../utils/whatsapp';

interface BuildYourOrderSectionProps {
  theme: ThemeStyleConfig;
  hotlineWhatsappRaw: string;
  onAddToCart?: (item: CartItem) => void;
}

type ProteinType = 'chicken' | 'mutton' | 'beef';
type CookingStyleType = 'sajji' | 'karahi' | 'grill';
type PortionType = 'full' | 'half';

interface SideItemOption {
  id: string;
  nameEn: string;
  nameUr: string;
  price: number;
  emoji: string;
}

/**
 * STRICT AUTHENTIC MENU DATA RESTRICTION:
 * No fictional nodes. Sides match exact catalog prices from initialData.
 */
const SIDES_OPTIONS: SideItemOption[] = [
  { id: 'roghni-naan', nameEn: 'Original Roghni Naan', nameUr: 'روغنی نان خاص', price: 70, emoji: '🫓' },
  { id: 'plain-roti', nameEn: 'Plain Roti', nameUr: 'سادہ تندوری روٹی', price: 25, emoji: '🥖' },
  { id: 'fresh-salad', nameEn: 'Fresh Salad', nameUr: 'تازہ سلاد', price: 100, emoji: '🥗' },
  { id: 'regular-drink', nameEn: 'Regular Soft Drink', nameUr: 'ریگولر سوفٹ ڈرنک', price: 100, emoji: '🥤' },
  { id: 'jumbo-drink', nameEn: '1.5L Jumbo Soft Drink', nameUr: '1.5 لیٹر جمبو بوتل', price: 220, emoji: '🍾' },
];

/**
 * AUTHENTIC PRICE MATRIX [Protein][CookingStyle][Portion]
 * Strictly grounded in real restaurant catalog pricing:
 * - Chicken Sajji: F 1980, H 1050
 * - Chicken Karahi: F 3400, H 1750 (Desi Murgh Karahi)
 * - Chicken Grill: F 700, H 350 (Chicken Boti Plate)
 * - Mutton Karahi: F 3600, H 1900 (Mutton Karahi)
 * - Mutton Sajji: F 3600, H 1900
 * - Mutton Grill: F 800, H 400 (Malai Boti Plate)
 * - Beef Seekh/Kabab: F 2350, H 1250 (Beef Kabab Plate)
 * - Beef Karahi: F 2500, H 1300 (Beef Curry)
 * - Beef Grill: F 2350, H 1250 (Beef Tikka Boti)
 */
const PRICE_MATRIX: Record<ProteinType, Record<CookingStyleType, Record<PortionType, number>>> = {
  chicken: {
    sajji: { full: 1980, half: 1050 },
    karahi: { full: 3400, half: 1750 },
    grill: { full: 700, half: 350 },
  },
  mutton: {
    sajji: { full: 3500, half: 1900 },
    karahi: { full: 3500, half: 1900 },
    grill: { full: 800, half: 400 },
  },
  beef: {
    sajji: { full: 2400, half: 1250 },
    karahi: { full: 2500, half: 1300 },
    grill: { full: 2350, half: 1250 },
  },
};

export const BuildYourOrderSection: React.FC<BuildYourOrderSectionProps> = ({
  theme,
  hotlineWhatsappRaw,
  onAddToCart,
}) => {
  // Collapsed by default to prevent layout overload
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Configurator Selections
  const [protein, setProtein] = useState<ProteinType>('chicken');
  const [cookingStyle, setCookingStyle] = useState<CookingStyleType>('sajji');
  const [portion, setPortion] = useState<PortionType>('full');
  const [selectedSideCounts, setSelectedSideCounts] = useState<Record<string, number>>({
    'roghni-naan': 1,
    'fresh-salad': 1,
  });
  const [addedNotice, setAddedNotice] = useState(false);

  // Step 1: Protein Metadata (Strictly 3 authentic options)
  const proteinOptions = [
    {
      id: 'chicken' as ProteinType,
      nameEn: 'Premium Chicken',
      nameUr: 'چکن خاص / دیسی',
      descEn: 'Whole farm-fresh grain-fed chicken',
      emoji: '🍗',
      badge: 'Popular / مقبول',
    },
    {
      id: 'mutton' as ProteinType,
      nameEn: 'Mutton Specialties',
      nameUr: 'مٹن اسپیشل',
      descEn: 'Prime baby mutton cuts cooked to tenderness',
      emoji: '🥩',
      badge: 'Royal / شاہی دسترخوان',
    },
    {
      id: 'beef' as ProteinType,
      nameEn: 'Beef Seekh Kababs',
      nameUr: 'بیف سیخ کباب',
      descEn: 'Fresh hand-minced charcoal seekh kebabs',
      emoji: '🍖',
      badge: 'Charcoal Prime / خالص بیف',
    },
  ];

  // Step 2: Cooking Method Metadata (Strictly 3 authentic styles)
  const cookingStyleOptions = [
    {
      id: 'sajji' as CookingStyleType,
      nameEn: 'Charcoal Sajji Roast',
      nameUr: 'کوئلہ سجی روسٹ',
      descEn: 'Slow 35-min Balochi rock-salt woodfire roast',
      icon: '🔥',
    },
    {
      id: 'karahi' as CookingStyleType,
      nameEn: 'Desi Karahi Style',
      nameUr: 'روایتی دیسی کڑاہی',
      descEn: 'Sautéed in fresh butter, ginger & tomatoes',
      icon: '🍲',
    },
    {
      id: 'grill' as CookingStyleType,
      nameEn: 'Smokey Hot Grill',
      nameUr: 'انگارہ ہاٹ گرل',
      descEn: 'Skewered over open charcoal embers',
      icon: '🍢',
    },
  ];

  // Price calculations
  const basePrice = PRICE_MATRIX[protein][cookingStyle][portion];

  const sidesBreakdown = useMemo(() => {
    return Object.entries(selectedSideCounts)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const option = SIDES_OPTIONS.find((s) => s.id === id);
        const price = option ? option.price : 0;
        return {
          id,
          name: option ? option.nameEn : id,
          nameUr: option ? option.nameUr : '',
          quantity: count,
          unitPrice: price,
          subtotal: price * count,
        };
      });
  }, [selectedSideCounts]);

  const sidesSubtotal = useMemo(() => {
    return sidesBreakdown.reduce((sum, item) => sum + item.subtotal, 0);
  }, [sidesBreakdown]);

  const grandTotal = basePrice + sidesSubtotal;

  const selectedProtein = proteinOptions.find((p) => p.id === protein)!;
  const selectedCookingStyle = cookingStyleOptions.find((s) => s.id === cookingStyle)!;
  const portionTitle = portion === 'full' ? 'Full Serving (مکمل فل)' : 'Half Serving (ہاف سرونگ)';

  const toggleSide = (id: string) => {
    setSelectedSideCounts((prev) => {
      const current = prev[id] || 0;
      return {
        ...prev,
        [id]: current > 0 ? 0 : 1,
      };
    });
  };

  const updateSideCount = (id: string, delta: number) => {
    setSelectedSideCounts((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [id]: next,
      };
    });
  };

  // Direct Mobile WhatsApp Forwarding
  const handleDirectWhatsAppCheckout = () => {
    const sidesTextList = sidesBreakdown.map((s) => `${s.quantity}x ${s.name}`).join(', ');
    const receiptMessage = formatCustomBuiltOrderReceipt(
      `${selectedProtein.nameEn} (${selectedProtein.nameUr})`,
      `${selectedCookingStyle.nameEn} (${selectedCookingStyle.nameUr})`,
      portion === 'full' ? 'Full Serving' : 'Half Serving',
      sidesTextList,
      grandTotal,
      basePrice,
      sidesBreakdown
    );

    // Deep native mobile application launch protocol
    openNativeWhatsApp(hotlineWhatsappRaw, receiptMessage);
  };

  // Add Custom Item to Cart Drawer
  const handleAddCustomMealToCart = () => {
    if (!onAddToCart) return;

    const cartAddOns = sidesBreakdown.map((s) => ({
      addOnId: s.id,
      nameEn: s.name,
      nameUr: s.nameUr,
      price: s.unitPrice,
      quantity: s.quantity,
    }));

    const customCartItem: CartItem = {
      id: `custom-build-${Date.now()}`,
      menuItemId: `custom-${protein}-${cookingStyle}`,
      nameEn: `Custom: ${selectedProtein.nameEn} (${selectedCookingStyle.nameEn})`,
      nameUr: `کسٹم: ${selectedProtein.nameUr} (${selectedCookingStyle.nameUr})`,
      portion: portion,
      unitPrice: basePrice,
      quantity: 1,
      selectedAddOns: cartAddOns,
      specialInstructions: `Custom Assembly: ${selectedProtein.nameEn} + ${selectedCookingStyle.nameEn} [${portion === 'full' ? 'Full' : 'Half'}]`,
    };

    onAddToCart(customCartItem);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 transition-all">
      {/* ========================================================================= */}
      {/* 1. COMPACT COLLAPSIBLE ENTRY BUTTON (WITH DESI EMOJIS & 50/50 TYPOGRAPHY)  */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: theme.bgSurface,
          borderColor: theme.borderStrong,
        }}
        className="rounded-2xl sm:rounded-3xl border shadow-lg overflow-hidden transition-all duration-300"
      >
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full p-4 sm:p-5 text-left cursor-pointer transition-colors duration-200 hover:bg-amber-500/5 flex items-center justify-between gap-4 select-none group"
          aria-expanded={isExpanded}
        >
          {/* Main Desi Emoji Heading & Subtitle */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform">
              🔥 🍗
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-500 transition-colors">
                  Build Your Custom Meal Box
                </span>
                <span className="text-slate-400 font-bold hidden sm:inline">/</span>
                <span className="text-sm sm:text-base font-extrabold font-urdu text-amber-500" dir="rtl">
                  اپنا کھانا خود تیار کریں
                </span>
                <span className="text-amber-400 text-sm">✨</span>
              </div>
              <p style={{ color: theme.textSecondary }} className="text-xs mt-0.5 truncate font-medium">
                Step-by-step modular meat assembly • Live price calculator & instant native WhatsApp order
              </p>
            </div>
          </div>

          {/* Right Action Badge & Accordion Toggle Icon */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExpanded ? 'Collapse Menu' : 'Open Configurator'}</span>
            </span>

            <div
              className={`w-9 h-9 rounded-full bg-black/30 border border-white/15 flex items-center justify-center text-white transition-transform duration-500 ${
                isExpanded ? 'rotate-180 bg-amber-500 text-slate-950 border-amber-500' : 'rotate-0'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* ========================================================================= */}
        {/* 2. SMOOTH ACCORDION TRANSITION CONTAINER (MAX-HEIGHT EXPANSION)           */}
        {/* ========================================================================= */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-[3500px] opacity-100 border-t' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
          style={{ borderColor: theme.borderSubtle }}
        >
          <div className="p-4 sm:p-7 space-y-8">
            
            {/* Header badges inside drawer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: theme.borderSubtle }}>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-500 font-bold uppercase tracking-wider">
                  Authentic Lahore Kitchen
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400 font-urdu" dir="rtl">
                  خالص دیسی ذائقہ
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Daily Halal</span>
                </span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Fresh Charcoal Roast</span>
                </span>
              </div>
            </div>

            {/* Configurator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              
              {/* LEFT 8 COLS: STEPS 1 TO 4 */}
              <div className="lg:col-span-8 space-y-7">
                
                {/* ----------------------------------------------------------------- */}
                {/* STEP 1: PROTEIN SELECTION                                         */}
                {/* ----------------------------------------------------------------- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        1
                      </span>
                      <h4 className="text-sm font-black tracking-tight">
                        Step 1: Protein Selection / گوشت کا انتخاب
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-amber-500 font-mono">
                      {selectedProtein.nameEn}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {proteinOptions.map((p) => {
                      const isSelected = protein === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProtein(p.id)}
                          style={{
                            backgroundColor: isSelected ? theme.bgCard : theme.bgSurface,
                            borderColor: isSelected ? theme.accent : theme.borderSubtle,
                          }}
                          className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                            isSelected ? 'ring-2 ring-amber-500/40 shadow-lg scale-[1.01]' : 'hover:border-amber-500/40'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="text-2xl">{p.emoji}</span>
                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full border border-slate-500" />
                            )}
                          </div>

                          <div>
                            <span className="text-sm font-black text-white block">{p.nameEn}</span>
                            <span className="text-xs font-bold font-urdu text-amber-500 block mt-0.5" dir="rtl">
                              {p.nameUr}
                            </span>
                            <p style={{ color: theme.textSecondary }} className="text-[10px] mt-1 line-clamp-1">
                              {p.descEn}
                            </p>
                          </div>

                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                            {p.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* STEP 2: COOKING METHOD SELECTION                                  */}
                {/* ----------------------------------------------------------------- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        2
                      </span>
                      <h4 className="text-sm font-black tracking-tight">
                        Step 2: Cooking Method Selection / پکانے کا طریقہ
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-amber-500 font-mono">
                      {selectedCookingStyle.nameEn}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {cookingStyleOptions.map((s) => {
                      const isSelected = cookingStyle === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setCookingStyle(s.id)}
                          style={{
                            backgroundColor: isSelected ? theme.bgCard : theme.bgSurface,
                            borderColor: isSelected ? theme.accent : theme.borderSubtle,
                          }}
                          className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                            isSelected ? 'ring-2 ring-amber-500/40 shadow-lg scale-[1.01]' : 'hover:border-amber-500/40'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="text-2xl">{s.icon}</span>
                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full border border-slate-500" />
                            )}
                          </div>

                          <div>
                            <span className="text-sm font-black text-white block">{s.nameEn}</span>
                            <span className="text-xs font-bold font-urdu text-amber-500 block mt-0.5" dir="rtl">
                              {s.nameUr}
                            </span>
                            <p style={{ color: theme.textSecondary }} className="text-[10px] mt-1 line-clamp-2">
                              {s.descEn}
                            </p>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-amber-500">
                            From Rs. {PRICE_MATRIX[protein][s.id].half} (Half)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* STEP 3: PORTION MATRIX SELECTION                                  */}
                {/* ----------------------------------------------------------------- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        3
                      </span>
                      <h4 className="text-sm font-black tracking-tight">
                        Step 3: Portion Matrix Selection / مقدار و پورشن
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-amber-500 font-mono">
                      {portionTitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPortion('full')}
                      style={{
                        backgroundColor: portion === 'full' ? theme.bgCard : theme.bgSurface,
                        borderColor: portion === 'full' ? theme.accent : theme.borderSubtle,
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        portion === 'full' ? 'ring-2 ring-amber-500/40 shadow-md' : 'opacity-85'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">Full Serving</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[10px] font-bold">
                            مکمل فل
                          </span>
                        </div>
                        <p style={{ color: theme.textSecondary }} className="text-xs">
                          Family sized portion (Ideal for 3–4 persons)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-amber-500 font-bold block">Rs.</span>
                        <span className="text-lg font-black text-white">
                          {PRICE_MATRIX[protein][cookingStyle].full.toLocaleString()}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPortion('half')}
                      style={{
                        backgroundColor: portion === 'half' ? theme.bgCard : theme.bgSurface,
                        borderColor: portion === 'half' ? theme.accent : theme.borderSubtle,
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        portion === 'half' ? 'ring-2 ring-amber-500/40 shadow-md' : 'opacity-85'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">Half Serving</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[10px] font-bold">
                            ہاف سرونگ
                          </span>
                        </div>
                        <p style={{ color: theme.textSecondary }} className="text-xs">
                          Couple portion (Ideal for 1–2 persons)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-amber-500 font-bold block">Rs.</span>
                        <span className="text-lg font-black text-white">
                          {PRICE_MATRIX[protein][cookingStyle].half.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* STEP 4: SIDES SELECTION (STRICTLY FROM CORE RESTAURANT CATALOG)   */}
                {/* ----------------------------------------------------------------- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        4
                      </span>
                      <h4 className="text-sm font-black tracking-tight">
                        Step 4: Sides Selection / تندوری روٹی، سلاد و مشروبات
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">
                      + Rs. {sidesSubtotal.toLocaleString()} Sides
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SIDES_OPTIONS.map((side) => {
                      const count = selectedSideCounts[side.id] || 0;
                      const isChecked = count > 0;
                      return (
                        <div
                          key={side.id}
                          style={{
                            backgroundColor: isChecked ? theme.bgCard : theme.bgSurface,
                            borderColor: isChecked ? theme.borderStrong : theme.borderSubtle,
                          }}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isChecked ? 'border-amber-500/40 shadow-xs' : 'opacity-85'
                          }`}
                        >
                          <div
                            onClick={() => toggleSide(side.id)}
                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none"
                          >
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? 'bg-amber-500 border-amber-500 text-slate-950'
                                  : 'border-slate-500 bg-transparent'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{side.emoji}</span>
                                <span className="text-xs font-bold truncate text-white">{side.nameEn}</span>
                              </div>
                              <span className="text-[11px] font-urdu text-amber-500 block truncate" dir="rtl">
                                {side.nameUr}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black text-amber-500">
                              Rs. {side.price}
                            </span>

                            {isChecked && (
                              <div className="flex items-center gap-1 bg-black/30 rounded-lg p-0.5 border border-white/10">
                                <button
                                  type="button"
                                  onClick={() => updateSideCount(side.id, -1)}
                                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-xs font-bold text-white cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold font-mono text-white">
                                  {count}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateSideCount(side.id, 1)}
                                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-xs font-bold text-white cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT 4 COLS: STICKY DYNAMIC BILLING CALCULATOR & DIRECT WHATSAPP ACTION */}
              <div className="lg:col-span-4 sticky top-20 space-y-4">
                <div
                  style={{
                    backgroundColor: theme.bgCard,
                    borderColor: theme.borderStrong,
                  }}
                  className="p-5 rounded-3xl border shadow-xl space-y-5"
                >
                  {/* Header Box */}
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.borderSubtle }}>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500">
                        <Utensils className="w-4 h-4" />
                      </span>
                      <div>
                        <h5 className="text-sm font-black tracking-tight text-white">Recipe & Bill Summary</h5>
                        <span className="text-[10px] font-urdu text-amber-500 font-semibold" dir="rtl">
                          حتمی بل اور تفصیل
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-[10px] font-black uppercase">
                      Live Calculated
                    </span>
                  </div>

                  {/* Explicit Parameter Breakdown Rows */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>{selectedProtein.emoji}</span>
                        <div>
                          <span className="font-bold block text-white">{selectedProtein.nameEn}</span>
                          <span className="text-[10px] text-slate-400 font-urdu">{selectedProtein.nameUr}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-400 text-right">Selected</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>{selectedCookingStyle.icon}</span>
                        <div>
                          <span className="font-bold block text-white">{selectedCookingStyle.nameEn}</span>
                          <span className="text-[10px] text-slate-400 font-urdu">{selectedCookingStyle.nameUr}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-400 text-right">Method</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>⚖️</span>
                        <div>
                          <span className="font-bold block text-white">{portion === 'full' ? 'Full Serving' : 'Half Serving'}</span>
                          <span className="text-[10px] text-slate-400 font-urdu">{portion === 'full' ? 'مکمل فل' : 'ہاف سرونگ'}</span>
                        </div>
                      </div>
                      <span className="font-bold font-mono text-white">Rs. {basePrice.toLocaleString()}</span>
                    </div>

                    {/* Sides Subtotal Rows */}
                    {sidesBreakdown.length > 0 && (
                      <div className="pt-2 border-t border-dashed space-y-1.5" style={{ borderColor: theme.borderSubtle }}>
                        <span className="text-[11px] font-bold text-slate-400 block">Sides & Drinks:</span>
                        {sidesBreakdown.map((s) => (
                          <div key={s.id} className="flex items-center justify-between text-[11px] text-slate-300">
                            <span>{s.quantity}x {s.name}</span>
                            <span className="font-mono font-bold text-amber-500">Rs. {s.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-white/5 text-emerald-400">
                          <span>Sides Subtotal:</span>
                          <span className="font-mono">Rs. {sidesSubtotal.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aggregated Net Total Sum Display */}
                  <div
                    style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderSubtle }}
                    className="p-4 rounded-2xl border space-y-1"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-400">Aggregated Net Total:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-amber-500 font-bold">Rs.</span>
                        <span className="text-2xl font-black text-amber-500 tabular-nums">
                          {grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Deep link calls native WhatsApp application on mobile with pre-filled line items.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-1">
                    {/* PRIMARY ACTION: DEEP NATIVE WHATSAPP ROUTING */}
                    <button
                      type="button"
                      onClick={handleDirectWhatsAppCheckout}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Send className="w-4 h-4 fill-current text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      <span>Direct Mobile WhatsApp Checkout</span>
                      <span className="font-urdu text-xs font-bold shrink-0">(فوری واٹس ایپ)</span>
                    </button>

                    {/* OPTIONAL CART TRAY */}
                    {onAddToCart && (
                      <button
                        type="button"
                        onClick={handleAddCustomMealToCart}
                        style={{ borderColor: theme.borderStrong }}
                        className="w-full py-2.5 px-4 rounded-2xl border bg-white/5 hover:bg-white/10 active:scale-[0.98] font-bold text-xs text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                        <span>{addedNotice ? '✓ Custom Meal Added!' : '+ Add Custom Dish to Tray'}</span>
                      </button>
                    )}
                  </div>

                  {/* Protocol Verification Note */}
                  <div className="text-[10px] text-center text-slate-400 pt-1">
                    <span>Protocol: </span>
                    <span className="font-mono font-bold text-amber-500">whatsapp://send?phone=923009346628</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
