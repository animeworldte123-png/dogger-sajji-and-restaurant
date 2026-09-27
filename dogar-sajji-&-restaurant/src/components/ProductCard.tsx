import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Phone, Clock, Sparkles } from 'lucide-react';
import { 
  MenuItem, 
  ThemeStyleConfig,
  TypographyLayoutConfig,
  TextColorPaletteConfig,
  ButtonThemeConfig 
} from '../types';
import { formatStandardItemReceipt, openNativeWhatsApp } from '../utils/whatsapp';

interface ProductCardProps {
  item: MenuItem;
  theme: ThemeStyleConfig;
  hotlineWhatsappRaw?: string;
  onOpenDetails: (item: MenuItem, portion: 'full' | 'half') => void;
  onDirectAdd: (item: MenuItem, portion: 'full' | 'half') => void;
  onImageUpdate?: (newBase64: string) => void;
  typography?: TypographyLayoutConfig;
  textColorPalette?: TextColorPaletteConfig;
  buttonTheme?: ButtonThemeConfig;
}

/**
 * HIGH-FIDELITY MOBILE-OPTIMIZED FOOD PREVIEW CARD
 * Strictly implements defensive button compaction for 2-column mobile grid view (aamne-saamne):
 * - Graphic food preview image frame with dark gradient overlay & prep badge
 * - 50% English + 50% Bold Stylized Urdu calligraphy typography
 * - Curved segmented toggle pill indicators ("Full" / "Half") scaled cleanly
 * - Re-engineered card footer: 'flex flex-col gap-1.5 w-full mt-3 sm:flex-row sm:items-center sm:justify-between'
 * - Vertical stacking on mobile with 100% width buttons ('w-full py-1.5 px-2 text-xs')
 * - Zero visual overflow, zero element clipping, zero horizontal layout shifts
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  theme,
  hotlineWhatsappRaw = '923009346628',
  onOpenDetails,
  onDirectAdd,
  typography,
  textColorPalette,
  buttonTheme,
}) => {
  const [selectedPortion, setSelectedPortion] = useState<'full' | 'half'>(
    item.hasPortions ? (item.defaultPortion || 'full') : 'full'
  );

  const currentPrice = item.hasPortions
    ? (selectedPortion === 'half' && item.prices.half !== undefined
        ? item.prices.half
        : item.prices.full)
    : item.prices.full;

  const handleDirectWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const receipt = formatStandardItemReceipt(
      item.nameEn,
      selectedPortion,
      1,
      '',
      currentPrice,
      currentPrice
    );
    openNativeWhatsApp(hotlineWhatsappRaw, receipt);
  };

  return (
    <div
      onClick={() => onOpenDetails(item, selectedPortion)}
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderSubtle,
        color: theme.textPrimary,
      }}
      className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl md:rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-amber-500/50 cursor-pointer select-none w-full"
    >
      {/* 1. ORIGINAL BEAUTIFUL FOOD PREVIEW IMAGE FRAME (Compact Responsive Viewport) */}
      <div className="relative h-28 sm:h-40 md:h-48 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={item.image}
          alt={item.nameEn}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Ambient Dark Gradient Layer for Pristine Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {item.badge ? (
            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md sm:rounded-lg bg-amber-500 text-slate-950 shadow-md truncate max-w-[65%]">
              {item.badge}
            </span>
          ) : item.isPopular ? (
            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md sm:rounded-lg bg-amber-500 text-slate-950 shadow-md flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Popular</span>
            </span>
          ) : (
            <span />
          )}

          {item.prepTime && (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md sm:rounded-lg bg-black/60 text-slate-200 backdrop-blur-sm border border-white/10 flex items-center gap-1 shrink-0">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>{item.prepTime}</span>
            </span>
          )}
        </div>

        {/* Bottom Image Title Overlay (Bilingual) */}
        <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2.5 sm:left-3 sm:right-3 pointer-events-none">
          <div className="flex items-baseline justify-between gap-1">
            <span
              style={{ color: textColorPalette?.titleColor || '#FFFFFF' }}
              className={`text-xs sm:text-sm md:text-base font-black drop-shadow-md truncate ${typography?.headingStyle || ''}`}
            >
              {item.nameEn}
            </span>
            <span
              style={{ color: textColorPalette?.urduColor || '#F59E0B' }}
              className={`text-[11px] sm:text-xs md:text-sm font-extrabold font-urdu drop-shadow-md shrink-0 ${typography?.urduStyle || ''}`}
              dir="rtl"
            >
              {item.nameUr}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT & BILINGUAL DESCRIPTIONS */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-2 sm:gap-3">
        <div className="space-y-0.5 sm:space-y-1">
          <p style={{ color: theme.textSecondary }} className={`text-[11px] sm:text-xs leading-snug line-clamp-2 ${typography?.subtextStyle || ''}`}>
            {item.descriptionEn}
          </p>
          <p style={{ color: theme.textMuted }} className="text-[10px] sm:text-[11px] font-urdu leading-snug line-clamp-1" dir="rtl">
            {item.descriptionUr}
          </p>
        </div>

        {/* 3. PORTION TOGGLES & PRICE DISPLAY */}
        <div className="pt-2 border-t space-y-2" style={{ borderColor: theme.borderSubtle }}>
          <div className="flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
            {item.hasPortions && item.prices.half !== undefined ? (
              /* Segmented Curved Toggle Pills for Full / Half (Zero Layout Shifting) */
              <div
                style={{
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.borderSubtle,
                }}
                className="inline-flex p-0.5 rounded-lg border text-[10px] sm:text-xs font-bold shrink-0"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPortion('full');
                  }}
                  style={{
                    backgroundColor: selectedPortion === 'full' ? theme.accent : 'transparent',
                    color: selectedPortion === 'full' ? theme.accentText : theme.textSecondary,
                  }}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-colors cursor-pointer font-bold"
                >
                  <span>Full</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPortion('half');
                  }}
                  style={{
                    backgroundColor: selectedPortion === 'half' ? theme.accent : 'transparent',
                    color: selectedPortion === 'half' ? theme.accentText : theme.textSecondary,
                  }}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-colors cursor-pointer font-bold"
                >
                  <span>Half</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: theme.textMuted }}>
                <span className="font-semibold truncate">Standard</span>
              </div>
            )}

            {/* High-Contrast Price Display */}
            <div className="text-right shrink-0">
              <span style={{ color: theme.textMuted }} className="text-[9px] block uppercase font-bold tracking-wider">
                Price
              </span>
              <div className="flex items-baseline justify-end gap-0.5">
                <span
                  style={{ color: textColorPalette?.priceColor || '#F59E0B' }}
                  className="text-[10px] sm:text-xs font-bold"
                >
                  Rs.
                </span>
                <span
                  style={{ color: textColorPalette?.priceColor || theme.textPrimary }}
                  className={`text-sm sm:text-base md:text-lg font-black tracking-tight tabular-nums ${typography?.priceStyle || ''}`}
                >
                  {currentPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 4. DEFENSIVE RE-ENGINEERED CARD FOOTER WRAPPER (ZERO VISUAL OVERFLOW) */}
          <div
            className="flex flex-col gap-1.5 w-full mt-3 sm:flex-row sm:items-center sm:justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Direct Instant Add to Cart Tray (Primary Action) */}
            <button
              type="button"
              onClick={() => onDirectAdd(item, selectedPortion)}
              style={
                buttonTheme
                  ? {
                      background: buttonTheme.trayBtnBg,
                      color: buttonTheme.trayBtnText,
                      border: buttonTheme.trayBtnBorder || 'none',
                    }
                  : {
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }
              }
              className="w-full sm:w-auto py-1.5 px-2 sm:px-3 text-xs font-black rounded-lg sm:rounded-xl shadow-xs hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add</span>
            </button>

            {/* Direct Mobile WhatsApp Order Hotline Button */}
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              style={
                buttonTheme
                  ? {
                      background: buttonTheme.orderBtnBg,
                      color: buttonTheme.orderBtnText,
                      border: buttonTheme.orderBtnBorder || 'none',
                    }
                  : undefined
              }
              className={`w-full sm:w-auto py-1.5 px-2 text-xs font-bold rounded-lg sm:rounded-xl transition-transform active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-1.5 order-2 sm:order-2 ${
                !buttonTheme ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''
              }`}
              title="Direct Mobile WhatsApp Order (0300-9346628)"
            >
              <Phone className="w-3 h-3 text-white" />
              <span>WhatsApp</span>
            </button>

            {/* Customization Drawer Trigger (Addons) */}
            <button
              type="button"
              onClick={() => onOpenDetails(item, selectedPortion)}
              style={{
                backgroundColor: theme.bgSurface,
                color: theme.textPrimary,
                borderColor: theme.borderStrong,
              }}
              title="Customize with drinks, raita & addons / لوازمات"
              className="w-full sm:w-auto py-1.5 px-2 sm:px-2.5 text-xs font-bold rounded-lg sm:rounded-xl border hover:opacity-85 transition-all flex items-center justify-center gap-1.5 cursor-pointer order-3 sm:order-1"
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Addons</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
