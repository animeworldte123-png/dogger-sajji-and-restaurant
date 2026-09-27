import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles, CheckCircle2, Phone } from 'lucide-react';
import { ThemeStyleConfig } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface OwnerProfileSectionProps {
  ownerNameEn: string;
  ownerNameUr: string;
  ownerTitleEn: string;
  ownerTitleUr: string;
  ownerMessageEn: string;
  ownerMessageUr: string;
  ownerPassportImage: string;
  hotlineFormatted: string;
  theme: ThemeStyleConfig;
  onUpdateOwnerImage?: (b64: string) => void;
  onOpenAdmin: () => void;
}

export const OwnerProfileSection: React.FC<OwnerProfileSectionProps> = ({
  ownerNameEn,
  ownerNameUr,
  ownerTitleEn,
  ownerTitleUr,
  ownerMessageEn,
  ownerMessageUr,
  ownerPassportImage,
  hotlineFormatted,
  theme,
  onOpenAdmin,
}) => {
  return (
    <section
      aria-label="Founder & Master Owner Profile / تعارف بانی و مالک"
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderStrong,
        color: theme.textPrimary,
      }}
      className="w-full border-t py-12 px-4 sm:px-6 relative overflow-hidden transition-colors"
    >
      {/* Decorative ambient radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
        
        {/* 1. CRISP SQUARE PASSPORT SIZE PICTURE FRAME */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative p-1.5 rounded-3xl bg-linear-to-br from-amber-500/60 via-amber-700/30 to-amber-900/60 shadow-2xl border border-amber-500/40">
            {/* Square passport photo frame with strict dimensions */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-900 relative shadow-inner">
              <OptimizedImage
                src={ownerPassportImage}
                alt={`${ownerNameEn} - Owner & Founder`}
                className="w-full h-full object-cover select-none"
                loading="lazy"
                decoding="async"
                shimmerVariant="amber"
                fallbackTitleEn={ownerNameEn}
                fallbackTitleUr={ownerNameUr}
              />
            </div>

            {/* Official Verification Badge */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 fill-current text-slate-950" />
              <span>Owner & Founder</span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-400 mt-4 tracking-wider uppercase">
            Official Passport Record
          </span>
        </div>

        {/* 2. OWNER NARRATIVE & HOSPITALITY COMMITMENT */}
        <div className="flex-1 text-center md:text-left space-y-3.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Executive Leadership</span>
              </span>
              <span className="text-xs text-slate-400 font-urdu" dir="rtl">
                قیادت و سربراہی
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 justify-center md:justify-start">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                {ownerNameEn}
              </h3>
              <span className="text-xl sm:text-2xl font-bold font-urdu text-amber-600" dir="rtl">
                {ownerNameUr}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 justify-center md:justify-start text-xs font-semibold text-slate-500">
              <span>{ownerTitleEn}</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-urdu text-amber-600/90" dir="rtl">
                {ownerTitleUr}
              </span>
            </div>
          </div>

          {/* Bilingual Hospitality Ethos Quote */}
          <div
            style={{
              backgroundColor: theme.bgSurface,
              borderColor: theme.borderSubtle,
            }}
            className="p-4 rounded-2xl border space-y-2 text-xs leading-relaxed text-left"
          >
            <p style={{ color: theme.textSecondary }} className="font-medium">
              "{ownerMessageEn}"
            </p>
            <p className="font-urdu text-amber-600 font-semibold text-[13px] text-right" dir="rtl">
              "{ownerMessageUr}"
            </p>
          </div>

          {/* Bottom Trust Markers */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Zabihah Halal Certified</span>
              <span className="font-urdu text-[11px]">حلال مصدقہ</span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <Award className="w-4 h-4" />
              <span>Direct Hotline: {hotlineFormatted}</span>
            </div>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-[11px] font-semibold text-slate-400 hover:text-amber-600 transition-colors ml-auto cursor-pointer"
            >
              Management Portal ⚙️
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
