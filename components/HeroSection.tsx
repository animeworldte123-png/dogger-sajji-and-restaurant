import React from 'react';
import { Flame, Clock, Award, Phone, ArrowDown, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeStyleConfig } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { openNativeWhatsApp } from '../utils/whatsapp';

interface HeroSectionProps {
  restaurantNameEn: string;
  restaurantNameUr: string;
  taglineEn: string;
  taglineUr: string;
  hotlineFormatted: string;
  hotlineWhatsappRaw: string;
  heroImage: string;
  logoImage: string;
  theme: ThemeStyleConfig;
  onUpdateHeroImage?: (b64: string) => void;
  onUpdateLogoImage?: (b64: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  restaurantNameEn,
  restaurantNameUr,
  taglineEn,
  taglineUr,
  hotlineFormatted,
  hotlineWhatsappRaw,
  heroImage,
  logoImage,
  theme,
}) => {
  return (
    <section className="relative w-full overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] flex flex-col justify-between">
      {/* 1. ABSOLUTE FIXED BACKGROUND CANVAS & HIGH-CONTRAST SCRIM */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-950">
        <OptimizedImage
          src={heroImage}
          alt="Dogar Sajji Hero Banner"
          loading="eager"
          decoding="async"
          shimmerVariant="dark"
          className="w-full h-full object-cover object-center opacity-40 select-none pointer-events-none"
        />
        {/* Defensive multi-stop dark gradient scrim guarantees high-contrast text legibility */}
        <div className="absolute inset-0 bg-linear-to-b from-black/90 via-black/75 to-black/95 pointer-events-none" />
      </div>

      {/* 2. RELATIVE FOREGROUND LAYER WITH DEFENSIVE SPACING & GRID WRAPPERS */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-between flex-1 gap-8 text-white">
        
        {/* ROW 1: TOP BRAND FLEX ISOLATION SYSTEM & NON-COLLIDING BADGES */}
        <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/15">
          {/* ISOLATED LOGO & ESTABLISHMENT FRAMEWORK: Strict boundaries prevent layout collapse */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Logo Box with strict min/max constraints */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] max-w-[80px] min-h-[64px] max-h-[80px] rounded-2xl border-2 border-white/30 shadow-2xl bg-black/70 backdrop-blur-md overflow-hidden shrink-0 flex items-center justify-center relative">
              <OptimizedImage
                src={logoImage}
                alt="Dogar Sajji Logo"
                className="w-full h-full object-cover select-none"
                loading="lazy"
                decoding="async"
                shimmerVariant="amber"
              />
            </div>

            {/* Isolated Establishment Metadata */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-amber-400 uppercase font-mono">
                  ESTD. LAHORE
                </span>
                <span className="w-1 h-1 rounded-full bg-amber-400/60" />
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Original Heritage
                </span>
              </div>
              <span className="text-sm sm:text-base font-black tracking-tight truncate text-white">
                {restaurantNameEn}
              </span>
              <span className="text-xs sm:text-sm font-urdu text-amber-300 font-semibold" dir="rtl">
                ڈوگر سجّی اینڈ ریسٹورنٹ (قصور روڈ)
              </span>
            </div>
          </div>

          {/* ADJACENT BADGE WRAPPER: Wraps cleanly beneath or beside without vertical run-ins or text clipping */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wide uppercase shadow-lg flex items-center gap-1.5 shrink-0">
              <Flame className="w-4 h-4 fill-current text-slate-950" />
              <span>Authentic Balochi Charcoal Sajji</span>
            </span>

            <span className="px-3.5 py-1.5 rounded-full bg-black/60 border border-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shrink-0">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Daily Fresh Meat</span>
              <span className="text-slate-400">|</span>
              <span className="font-urdu text-[11px] text-amber-300">روزانہ تازہ ذبیحہ</span>
            </span>
          </div>
        </header>

        {/* ROW 2: MAIN TYPOGRAPHY & NARRATIVE GRID (COLLISION ELIMINATED) */}
        <div className="flex-1 flex flex-col justify-center py-2 sm:py-6 space-y-5 max-w-4xl">
          {/* Typography Header Blocks with Defensive Margins */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-2xl text-white text-balance">
              {restaurantNameEn}
            </h1>
            <p className="text-2xl sm:text-4xl font-extrabold font-urdu text-amber-400 drop-shadow-lg" dir="rtl">
              {restaurantNameUr}
            </p>
          </div>

          {/* Explicit Taglines in Non-Overlapping Wrappers */}
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow-sm">
              {taglineEn}
            </p>
            <p className="text-xs sm:text-sm font-urdu text-amber-200/90 font-medium leading-relaxed drop-shadow-sm" dir="rtl">
              {taglineUr}
            </p>
          </div>

          {/* Direct CTA Order & Navigation Channels */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#menu"
              style={{ backgroundColor: theme.accent, color: theme.accentText }}
              className="px-6 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-xl hover:opacity-90 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Complete Menu</span>
              <span className="font-urdu text-xs">مکمل مینو دیکھیں</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <a
              href={`whatsapp://send?phone=${hotlineWhatsappRaw}&text=${encodeURIComponent(
                'Salam Dogar Sajji, I want to place a delivery order from your hotline.'
              )}`}
              onClick={(e) => {
                e.preventDefault();
                openNativeWhatsApp(
                  hotlineWhatsappRaw,
                  'Salam Dogar Sajji, I want to place a delivery order from your hotline.'
                );
              }}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-xl transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Direct WhatsApp Hotline</span>
              <span className="font-mono text-xs font-black">{hotlineFormatted}</span>
            </a>
          </div>
        </div>

        {/* ROW 3: FOUR PROOF PILLARS & ESTABLISHMENT REPUTATION */}
        <footer className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-white/15 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-white">100% Halal Fresh</span>
              <span className="text-[10px] text-slate-300 font-urdu block">روزانہ تازہ ذبیحہ</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-white">35-Min Slow Roast</span>
              <span className="text-[10px] text-slate-300 font-urdu block">دھیمی آنچ پر پکائی</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-white">Pure Wood Charcoal</span>
              <span className="text-[10px] text-slate-300 font-urdu block">خالص کوئلے کا دھواں</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block text-white">Hotline {hotlineFormatted}</span>
              <span className="text-[10px] text-slate-300 font-urdu block">فوری ڈلیوری سروس</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
};
