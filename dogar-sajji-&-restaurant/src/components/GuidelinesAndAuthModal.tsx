import React, { useState } from 'react';
import { X, Shield, Lock, ArrowRight, ShieldAlert, CheckCircle, Clock, Flame, Sparkles, AlertCircle } from 'lucide-react';
import { RestaurantGuideline, ThemeStyleConfig } from '../types';

interface GuidelinesAndAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidelines: RestaurantGuideline[];
  adminPasswordToken: string;
  onAuthenticated: () => void;
  theme: ThemeStyleConfig;
  hotlineFormatted: string;
}

export const GuidelinesAndAuthModal: React.FC<GuidelinesAndAuthModalProps> = ({
  isOpen,
  onClose,
  guidelines,
  adminPasswordToken,
  onAuthenticated,
  theme,
  hotlineFormatted,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim() === adminPasswordToken.trim()) {
      setIsSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        setIsSuccess(false);
        setTokenInput('');
        onAuthenticated();
        onClose();
      }, 400);
    } else {
      setErrorMsg('Invalid token. Correct key is required. (Default: 12345)');
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-sky-500 shrink-0" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-emerald-500 shrink-0" />;
      default:
        return <Shield className="w-5 h-5 text-amber-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        style={{
          backgroundColor: theme.bgCard,
          borderColor: theme.borderStrong,
          color: theme.textPrimary,
        }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div
          style={{ borderColor: theme.borderSubtle }}
          className="p-5 border-b flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Restaurant Guidelines & Standard Operating Procedures
              </h2>
              <p className="text-xs font-urdu text-amber-600 font-semibold" dir="rtl">
                ڈوگر سجی انتظامی اصول، حفظان صحت اور کچن معیار
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            style={{ backgroundColor: theme.bgSurface, color: theme.textSecondary }}
            className="p-2 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Management Information Guidelines Card */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="text-xs text-slate-500 leading-relaxed">
            Dogar Sajji & Restaurant maintains strictly monitored preparation ethics across all charcoal roasting pits and dispatch bays. Review our mandatory guidelines below:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {guidelines.map((g) => (
              <div
                key={g.id}
                style={{
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.borderSubtle,
                }}
                className="p-4 rounded-2xl border flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/40 shadow-xs">
                    {renderIcon(g.iconName)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-snug">{g.titleEn}</h4>
                    <p className="text-[11px] font-urdu font-semibold text-amber-600" dir="rtl">
                      {g.titleUr}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {g.descriptionEn}
                </p>
                <p className="text-[11px] font-urdu text-slate-500 leading-relaxed" dir="rtl">
                  {g.descriptionUr}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{ backgroundColor: theme.bgSurfaceHover, borderColor: theme.borderSubtle }}
            className="p-3.5 rounded-2xl border text-xs flex items-center justify-between"
          >
            <span className="text-slate-600 font-medium">
              Direct Emergency & Dispatch Hotline:
            </span>
            <span className="font-bold text-amber-600 tabular-nums">
              {hotlineFormatted}
            </span>
          </div>
        </div>

        {/* Re-Authentication Gateway Footer */}
        <div
          style={{
            backgroundColor: theme.bgSurface,
            borderColor: theme.borderStrong,
          }}
          className="p-5 border-t shrink-0"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Re-Authentication Gateway / مالک و منتظم لاگ ان
            </span>
          </div>

          <form onSubmit={handleVerifyToken} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter Passcode (Default: 12345) / پاس کوڈ درج کریں"
                  style={{
                    backgroundColor: theme.bgCard,
                    borderColor: errorMsg ? '#E11D48' : theme.borderSubtle,
                    color: theme.textPrimary,
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono tracking-widest focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentText,
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Access Dashboard</span>
                <span className="font-urdu text-[11px]">داخل ہوں</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-rose-500 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Authorized! Loading Master Owner Panel...</span>
              </div>
            )}

            <p className="text-[10px] text-slate-400">
              * Protected owner portal. Default token is <code className="bg-black/10 px-1 py-0.5 rounded font-mono">12345</code>. Can be updated dynamically inside dashboard.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
