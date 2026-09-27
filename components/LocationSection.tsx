import React, { useState } from 'react';
import { 
  MapPin, Navigation, Car, ExternalLink, Check, Copy, Compass, 
  Building2, GraduationCap, BookOpen, ShoppingBag, HeartPulse, Tag, Wrench, ShieldCheck, Bike
} from 'lucide-react';
import { ThemeStyleConfig } from '../types';
import { LOCAL_LANDMARK_PINS, LandmarkPin } from '../constants/locationData';

interface LocationSectionProps {
  theme: ThemeStyleConfig;
  hotlineFormatted: string;
  hotlineWhatsappRaw: string;
  landmarks?: LandmarkPin[];
  onSelectLandmarkForOrder?: (landmark: string) => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  theme,
  hotlineFormatted,
  hotlineWhatsappRaw,
  landmarks = LOCAL_LANDMARK_PINS,
  onSelectLandmarkForOrder,
}) => {
  const activeLandmarks = landmarks && landmarks.length > 0 ? landmarks : LOCAL_LANDMARK_PINS;
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<string>(activeLandmarks[0]?.id || 'kasur-road');

  const getPinIcon = (category: string) => {
    switch (category) {
      case 'bank':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'school':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'store':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'health':
        return <HeartPulse className="w-3.5 h-3.5" />;
      case 'auto':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'road':
      default:
        return <Navigation className="w-3.5 h-3.5" />;
    }
  };

  const handleCopyLandmark = (pin: LandmarkPin) => {
    navigator.clipboard.writeText(`${pin.nameEn} (${pin.nameUr}), near Dogar Sajji & Restaurant`);
    setCopiedPin(pin.id);
    setSelectedPin(pin.id);
    if (onSelectLandmarkForOrder) {
      onSelectLandmarkForOrder(`${pin.nameEn} (${pin.nameUr})`);
    }
    setTimeout(() => setCopiedPin(null), 2500);
  };

  // Google Maps directions URL for Dogar Sajji, Kasur Road
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Dogar Sajji & Restaurant, Main Sarak, Kasur Road, Faiz E Aam Road'
  )}`;

  return (
    <section id="location" className="space-y-6 scroll-mt-24">
      {/* Section Header */}
      <div 
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b"
        style={{ borderColor: theme.borderSubtle }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600">
              <MapPin className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Prime Location & Local Delivery Zone
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Find Dogar Sajji & Local Landmarks
          </h2>
          <p className="text-base font-bold font-urdu text-amber-600 mt-1" dir="rtl">
            مین سڑک / قصور روڈ، متصل مہر کفیل آٹو اور سندھ بینک — آسان ترین رسائی
          </p>
        </div>

        {/* 5 KM RADIUS PROMINENT BANNER BADGE */}
        <div 
          style={{
            backgroundColor: '#059669', // Emerald accent
            color: '#ffffff',
          }}
          className="px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-3 shrink-0 self-start sm:self-auto border border-emerald-400/40"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider">
                Free Delivery within a 5 KM Radius
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-emerald-800 font-extrabold">
                0 Rs FEE
              </span>
            </div>
            <p className="text-xs font-urdu text-emerald-100 font-medium mt-0.5" dir="rtl">
              5 کلومیٹر کے دائرے میں گرم کھانے کی فری ہوم ڈلیوری
            </p>
          </div>
        </div>
      </div>

      {/* Main Location Architecture Container */}
      <div
        style={{
          backgroundColor: theme.bgSurface,
          borderColor: theme.borderStrong,
        }}
        className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-8"
      >
        {/* Top Landmark Pins Strip: Fluid, curved border chips mapping 9 specific pins */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-500" />
                <span>9 Verified Local Landmark Pins / قریبی اہم مقامات و نشانات</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any landmark chip to verify proximity or lock into your delivery order
              </p>
            </div>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              Tap chip to select / کاپی کریں
            </span>
          </div>

          {/* Fluid Curved Border Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {activeLandmarks.map((pin) => {
              const isSelected = selectedPin === pin.id;
              const isCopied = copiedPin === pin.id;

              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => handleCopyLandmark(pin)}
                  style={{
                    backgroundColor: isSelected ? theme.bgCard : theme.bgSurface,
                    borderColor: isSelected ? theme.accent : theme.borderSubtle,
                    color: theme.textPrimary,
                  }}
                  className={`group relative p-3 rounded-2xl border text-left transition-all duration-200 hover:shadow-md hover:border-amber-500 flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected ? 'ring-2 ring-amber-500/40 shadow-xs' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div 
                      style={{
                        backgroundColor: isSelected ? theme.accent : theme.bgCard,
                        color: isSelected ? theme.accentText : theme.textSecondary,
                      }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-300/30 transition-colors"
                    >
                      {getPinIcon(pin.category)}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate group-hover:text-amber-600 transition-colors">
                          {pin.nameEn}
                        </span>
                      </div>
                      <span className="text-[11px] font-urdu text-amber-600 block mt-0.5" dir="rtl">
                        {pin.nameUr}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-500 font-medium">
                      {pin.distanceEstimate}
                    </span>
                    <div 
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
                        isCopied ? 'bg-emerald-500 text-white' : 'bg-slate-200/50 text-slate-400 group-hover:bg-amber-500 group-hover:text-white'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3 h-3" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Street Orientation & Route Canvas */}
        <div 
          style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
          className="rounded-2xl border p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Easy Parking & Wide Boulevard Access</span>
            </div>
            <h4 className="text-lg font-extrabold tracking-tight">
              Located on Main Sarak / Kasur Road at Faiz E Aam Junction
            </h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Spacious roadside frontage with hassle-free dine-in parking, fast motorcycle pickup counters, and direct connection from Sindh Bank, Mehar Kafeel Auto, and Green Plus Pharmacy.
            </p>
            <p className="text-xs font-urdu text-amber-600 font-semibold" dir="rtl">
              کسٹمرز کے لیے کشادہ روڈ سائیڈ پارکنگ، فوری کوریئر پک اپ کاؤنٹر اور فیملی ڈائننگ ہال۔
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0 w-full md:w-auto">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentText,
              }}
              className="px-5 py-3 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Navigation className="w-4 h-4" />
              <span>View Directions</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-75" />
            </a>

            <a
              href={`https://wa.me/${hotlineWhatsappRaw}?text=${encodeURIComponent(
                'Salam Dogar Sajji, please share your exact live Google Maps location pin.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
              className="px-4 py-3 rounded-xl border text-xs font-semibold hover:opacity-85 transition-opacity flex items-center justify-center gap-2 text-center"
            >
              <span>Get WhatsApp Pin</span>
              <span className="font-urdu text-[11px]">لوکیشن منگوائیں</span>
            </a>
          </div>
        </div>

        {/* EXTRA UTILITY CHIPS: Bottom semantic layout strings */}
        <div 
          style={{ borderColor: theme.borderSubtle }}
          className="pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-medium"
        >
          {/* Utility Chip 1: Valet Parking Available */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 text-slate-700 border border-slate-300/40">
            <Car className="w-4 h-4 text-amber-600" />
            <span className="font-bold">Valet parking available</span>
            <span className="text-slate-400">|</span>
            <span className="font-urdu text-slate-600">مع ولیٹ پارکنگ سہولت دستیاب ہے</span>
          </div>

          {/* Utility Chip 2: Functional outward-linking anchor action label for "View Directions" */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-bold cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>View Directions</span>
            <ExternalLink className="w-3 h-3 text-blue-500" />
            <span className="text-blue-300">|</span>
            <span className="font-urdu text-blue-800 text-[11px]">گوگل میپس پر راستہ دیکھیں</span>
          </a>

          {/* Utility Chip 3: Hot Food Dispatch Hotline */}
          <div className="text-slate-500 text-xs flex items-center gap-1">
            <span>Direct Orders:</span>
            <strong className="text-amber-600 font-mono">{hotlineFormatted}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};
