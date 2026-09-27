import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { THEMES_REGISTRY } from '../constants/themes';
import { BlockShape, OdooBlock, ThemeId, ThemeStyleConfig } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface OdooBlockRendererProps {
  block: OdooBlock;
  globalTheme: ThemeStyleConfig;
}

export const OdooBlockRenderer: React.FC<OdooBlockRendererProps> = ({
  block,
  globalTheme,
}) => {
  if (!block.isEnabled) return null;

  // Isolated Section Configurator: Determine effective theme for this isolated block
  const effectiveTheme: ThemeStyleConfig =
    block.themeOverride && block.themeOverride !== 'inherit' && THEMES_REGISTRY[block.themeOverride as ThemeId]
      ? THEMES_REGISTRY[block.themeOverride as ThemeId]
      : globalTheme;

  // Shape class resolution
  const shapeClassMap: Record<BlockShape, string> = {
    'soft-curved': 'shape-soft-curved',
    'square': 'shape-square',
    'square-box': 'shape-square',
    'triangular-mask': 'shape-triangular-mask',
    'circular-canvas': 'shape-circular-canvas',
  };
  const shapeClass = shapeClassMap[block.shape] || 'shape-soft-curved';

  return (
    <div className="position-locked-cell w-full">
      <div
        style={{
          backgroundColor: effectiveTheme.bgCard,
          borderColor: effectiveTheme.borderStrong,
          color: effectiveTheme.textPrimary,
        }}
        className={`w-full h-full border shadow-md flex flex-col md:flex-row items-stretch transition-all duration-300 relative overflow-hidden ${shapeClass} ${effectiveTheme.specialClass || ''}`}
      >
        {/* Subtle Theme Ambient Gradient if defined */}
        {effectiveTheme.gradientAccent && (
          <div
            className={`absolute inset-0 bg-linear-to-br ${effectiveTheme.gradientAccent} opacity-35 pointer-events-none`}
          />
        )}

        {/* Media / Image Column */}
        {block.image && (
          <div className="w-full md:w-5/12 relative shrink-0 min-h-[220px] md:min-h-full overflow-hidden bg-slate-900/10">
            <OptimizedImage
              src={block.image}
              alt={block.titleEn}
              className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-105"
              loading="lazy"
              decoding="async"
              shimmerVariant="dark"
            />

            {/* Shape Indicator / Isolated Theme Tag */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
              {block.tagEn && (
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-black/80 text-white backdrop-blur-xs shadow-xs">
                  {block.tagEn}
                </span>
              )}
              {block.themeOverride && block.themeOverride !== 'inherit' && (
                <span className="px-2 py-0.5 text-[9px] font-semibold tracking-wide rounded-md bg-amber-500 text-black shadow-xs">
                  Isolated: {THEMES_REGISTRY[block.themeOverride as ThemeId]?.nameEn || block.themeOverride}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Text & Content Column */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4 z-10">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {block.badgeEn && (
                <span
                  style={{
                    backgroundColor: effectiveTheme.bgSurface,
                    color: effectiveTheme.accent,
                    borderColor: effectiveTheme.borderSubtle,
                  }}
                  className="px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{block.badgeEn}</span>
                  <span className="font-urdu text-[11px]">{block.badgeUr}</span>
                </span>
              )}

              {/* Shape Tag */}
              <span
                style={{ color: effectiveTheme.textMuted }}
                className="text-[10px] font-mono uppercase tracking-widest hidden sm:inline"
              >
                Shape: {block.shape}
              </span>
            </div>

            {/* Titles (50/50 Architecture) */}
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight mb-1 text-balance">
              {block.titleEn}
            </h3>
            <p
              className="text-base font-bold font-urdu leading-relaxed text-amber-600 mb-2"
              dir="rtl"
            >
              {block.titleUr}
            </p>

            {/* Subtitle */}
            {block.subtitleEn && (
              <p
                style={{ color: effectiveTheme.textSecondary }}
                className="text-xs md:text-sm font-medium mb-3 italic"
              >
                {block.subtitleEn}
              </p>
            )}

            {/* Body Content */}
            <p
              style={{ color: effectiveTheme.textSecondary }}
              className="text-xs md:text-sm leading-relaxed mb-2"
            >
              {block.contentEn}
            </p>
            <p
              style={{ color: effectiveTheme.textMuted }}
              className="text-xs md:text-sm font-urdu leading-relaxed"
              dir="rtl"
            >
              {block.contentUr}
            </p>

            {/* Dynamic Pricing Overlays for Catering & Events */}
            {(block.pricingEn || block.comboPackageDetails) && (
              <div
                style={{
                  backgroundColor: effectiveTheme.bgSurface,
                  borderColor: effectiveTheme.borderSubtle,
                }}
                className="p-3 sm:p-3.5 rounded-2xl border space-y-1.5 my-2.5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  {block.pricingEn && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 block">
                        Event Package Pricing / پیکیج ریٹ
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-500">
                        {block.pricingEn}
                      </span>
                      {block.pricingUr && (
                        <span className="text-xs font-bold font-urdu block text-slate-300" dir="rtl">
                          {block.pricingUr}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {block.comboPackageDetails && (
                  <p className="text-xs font-semibold text-slate-300 border-t border-slate-700/50 pt-1.5 leading-snug">
                    <span className="text-amber-400 font-bold">Package Inclusions: </span>
                    {block.comboPackageDetails}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Call to Action */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: effectiveTheme.borderSubtle }}>
            {block.callToActionTextEn && (
              <a
                href={block.callToActionLink || '#'}
                target={block.callToActionLink?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                style={{
                  backgroundColor: effectiveTheme.accent,
                  color: effectiveTheme.accentText,
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{block.callToActionTextEn}</span>
                <span className="font-urdu text-xs">{block.callToActionTextUr}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
