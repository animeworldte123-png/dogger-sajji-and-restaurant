import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { RestaurantState, ThemeStyleConfig } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { openNativeWhatsApp } from '../utils/whatsapp';

interface FooterSectionProps {
  state: RestaurantState;
  theme: ThemeStyleConfig;
  onUpdateGalleryImage?: (index: number, newB64: string) => void;
  onOpenGuidelines: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  state,
  theme,
  onOpenGuidelines,
}) => {
  return (
    <footer
      style={{
        backgroundColor: theme.bgSurface,
        borderColor: theme.borderStrong,
        color: theme.textPrimary,
      }}
      className="border-t pt-12 pb-16 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Custom Restaurant Media Gallery */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Restaurant Visual Gallery & Kitchen Hearth
              </h3>
              <p className="text-xs font-urdu text-amber-600 font-semibold" dir="rtl">
                ڈوگر سجی کیچن گیلری و دسترخوان کی روایتی جھلکیاں
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              Authentic Wood Charcoal Roasting & Fresh Daily Zabihah Halal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {state.galleryImages.map((imgUrl, index) => (
              <div key={index} className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900/10 border border-slate-200/50">
                <OptimizedImage
                  src={imgUrl}
                  alt={`Kitchen Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 select-none"
                  loading="lazy"
                  decoding="async"
                  shimmerVariant="dark"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3 Information Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t" style={{ borderColor: theme.borderSubtle }}>
          {/* Brand & Mission */}
          <div className="space-y-3">
            <h4 className="text-base font-bold">{state.restaurantNameEn}</h4>
            <p className="text-xs font-urdu text-amber-600 font-semibold" dir="rtl">
              {state.restaurantNameUr}
            </p>
            <p style={{ color: theme.textSecondary }} className="text-xs leading-relaxed">
              Preserving the authentic culinary heritage of Balochi charcoal roast Sajji and Peshawar Shinwari woks. Pure ingredients, daily fresh halal cuts, and zero chemical preservatives.
            </p>
          </div>

          {/* Timings & Location */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-600">
              Operating Hours & Location / اوقات و پتہ
            </h4>
            <div className="flex items-start gap-2.5" style={{ color: theme.textSecondary }}>
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{state.timingsEn}</p>
                <p className="font-urdu text-[11px] text-slate-400" dir="rtl">{state.timingsUr}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5" style={{ color: theme.textSecondary }}>
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{state.addressEn}</p>
                <p className="font-urdu text-[11px] text-slate-400" dir="rtl">{state.addressUr}</p>
              </div>
            </div>
          </div>

          {/* Hotline & Guidelines Gateway */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-600">
              Hotline Express Pipeline / ہاٹ لائن
            </h4>
            <div className="p-4 rounded-2xl border" style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}>
              <p className="text-[11px] text-slate-500 mb-1">Direct Kitchen Order Dispatch:</p>
              <a
                href={`whatsapp://send?phone=${state.hotlineWhatsappRaw}&text=Salam%2C%20I%20want%20to%20order%20from%20Dogar%20Sajji`}
                onClick={(e) => {
                  e.preventDefault();
                  openNativeWhatsApp(
                    state.hotlineWhatsappRaw,
                    'Salam, I want to order from Dogar Sajji'
                  );
                }}
                className="text-base font-extrabold text-emerald-600 flex items-center gap-2 hover:underline cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>{state.hotlineFormatted}</span>
              </a>
              <span className="text-[10px] text-slate-400 block mt-1">Available for Home Delivery & Takeaway</span>
            </div>

            <button
              type="button"
              onClick={onOpenGuidelines}
              style={{ color: theme.textSecondary }}
              className="text-xs hover:underline flex items-center gap-1.5 cursor-pointer pt-1"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>View Management Protocols & Guidelines</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{ borderColor: theme.borderSubtle, color: theme.textMuted }}
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-3"
        >
          <p>© {new Date().getFullYear()} Dogar Sajji & Restaurant. All Rights Reserved.</p>
          <p className="font-urdu text-[11px]">ڈوگر سجی اینڈ ریسٹورنٹ — خالص روایتی ذائقہ</p>
        </div>
      </div>
    </footer>
  );
};
