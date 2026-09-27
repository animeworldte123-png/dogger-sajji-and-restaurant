import React from 'react';
import { Phone, MoreVertical, ShoppingBag, Sparkles } from 'lucide-react';
import { ThemeStyleConfig } from '../types';
import { openNativeWhatsApp } from '../utils/whatsapp';

interface TopNavbarProps {
  restaurantNameEn: string;
  hotlineFormatted: string;
  hotlineWhatsappRaw: string;
  theme: ThemeStyleConfig;
  cartCount: number;
  onOpenGuidelinesAndAuth: () => void;
  onOpenCartTray: () => void;
  onOpenPersonalizedCombo?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  restaurantNameEn,
  hotlineFormatted,
  hotlineWhatsappRaw,
  theme,
  cartCount,
  onOpenGuidelinesAndAuth,
  onOpenCartTray,
  onOpenPersonalizedCombo,
}) => {
  const hotlineTelNumber = hotlineFormatted.replace(/[^0-9]/g, '') || '03009346628';

  return (
    <header
      style={{
        backgroundColor: theme.bgSurface,
        borderColor: theme.borderSubtle,
        color: theme.textPrimary,
      }}
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Left-aligned Compact Logo & Brand Name for Mobile */}
        <div className="max-w-[40%] sm:max-w-none flex items-center shrink min-w-0">
          <a
            href="#"
            className="font-display font-black text-sm sm:text-lg lg:text-xl tracking-tight hover:opacity-90 transition-opacity truncate block"
            style={{ color: theme.textPrimary }}
            title={restaurantNameEn}
          >
            {restaurantNameEn}
          </a>
        </div>

        {/* Zone 2: Desktop clean text navigation links (hidden on mobile) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wide">
          <button
            type="button"
            onClick={() => {
              if (onOpenPersonalizedCombo) {
                onOpenPersonalizedCombo();
              }
              const menuElem = document.getElementById('menu');
              if (menuElem) {
                menuElem.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{ color: theme.textSecondary }}
            className="hover:opacity-100 transition-opacity whitespace-nowrap hover:text-amber-500 flex items-center gap-1.5 text-amber-500 font-bold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Build Order / کسٹم آرڈر</span>
          </button>
          <a
            href="#menu"
            style={{ color: theme.textSecondary }}
            className="hover:opacity-100 transition-opacity whitespace-nowrap hover:text-amber-600"
          >
            Menu / مینو
          </a>
          <a
            href="#sajji-specials"
            style={{ color: theme.textSecondary }}
            className="hover:opacity-100 transition-opacity whitespace-nowrap hover:text-amber-600"
          >
            Balochi Sajji
          </a>
          <a
            href="#odoo-blocks"
            style={{ color: theme.textSecondary }}
            className="hover:opacity-100 transition-opacity whitespace-nowrap hover:text-amber-600"
          >
            Showcase / اعزاز
          </a>
          <a
            href="#about-chef"
            style={{ color: theme.textSecondary }}
            className="hover:opacity-100 transition-opacity whitespace-nowrap hover:text-amber-600"
          >
            Heritage / تاریخ
          </a>
        </nav>

        {/* Zone 3: Actions row (Phone, Cart Tray, 3-Dot Kebab Menu) */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto shrink-0">
          {/* ICON-ONLY CALL HOTLINE CONVERSION ON MOBILE:
              Replaces the wide rectangle with a compact circular orange action bubble containing ONLY clean phone icon
              linked to 'tel:03009346628'. Frees up 75% horizontal space. */}
          <a
            href={`tel:${hotlineTelNumber}`}
            style={{
              backgroundColor: theme.accent,
              color: theme.accentText,
            }}
            className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-transform shrink-0"
            title={`Call Hotline: ${hotlineFormatted}`}
            aria-label="Call Hotline"
          >
            <Phone className="w-4 h-4" />
          </a>

          {/* TABLET / DESKTOP VIEW: Full Hotline Button */}
          <a
            href={`whatsapp://send?phone=${hotlineWhatsappRaw}&text=Hello%20Dogar%20Sajji%2C%20I%20would%20like%20to%20order`}
            onClick={(e) => {
              e.preventDefault();
              openNativeWhatsApp(hotlineWhatsappRaw, 'Hello Dogar Sajji, I would like to order');
            }}
            style={{
              backgroundColor: theme.accent,
              color: theme.accentText,
            }}
            className="hidden sm:flex px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 transition-transform active:scale-95 items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hotline:</span>
            <span className="tabular-nums">{hotlineFormatted}</span>
          </a>

          {/* Cart Tray Trigger with live badge */}
          <button
            type="button"
            onClick={onOpenCartTray}
            style={{
              backgroundColor: theme.bgCard,
              borderColor: theme.borderStrong,
              color: theme.textPrimary,
            }}
            className="relative px-2.5 sm:px-3 py-2 rounded-xl border hover:opacity-85 transition-opacity cursor-pointer flex items-center gap-1.5 shrink-0"
            aria-label="View Cart Tray"
          >
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold hidden xs:inline">Tray</span>
            {cartCount > 0 ? (
              <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] font-black rounded-full tabular-nums">
                {cartCount}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                (0)
              </span>
            )}
          </button>

          {/* 3-Dot Kebab Menu Button (Triggers Standalone Operations Portal) */}
          <button
            type="button"
            onClick={onOpenGuidelinesAndAuth}
            style={{
              backgroundColor: theme.bgCard,
              borderColor: theme.borderStrong,
              color: theme.textPrimary,
            }}
            className="p-2 sm:p-2.5 rounded-xl border hover:opacity-85 transition-opacity cursor-pointer shrink-0"
            title="Operations, Governance & Management Console / انتظامی و تکنیکی کنسول"
            aria-label="Operations, Governance & Management Console"
          >
            <MoreVertical className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
