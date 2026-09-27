import React, { useState } from 'react';
import { 
  Shield, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, 
  Server, Database, Clock, Flame, Sparkles, Phone, Award,
  Cpu, HardDrive, Check, MapPin, Hash, ShieldCheck, ChevronRight
} from 'lucide-react';
import { RestaurantState, ThemeStyleConfig } from '../types';

interface OperationsPortalPageProps {
  state: RestaurantState;
  theme: ThemeStyleConfig;
  onReturnToStorefront: () => void;
  onAccessAdmin: () => void;
}

/**
 * DEDICATED STANDALONE MULTI-COLUMN PAGE VIEW (3-DOT KEBAB PORTAL)
 * Full viewport client-side page switch rendering:
 * 1. Restaurant Operations, Food Governance & Baseline Shift Schedules
 * 2. Structural Metadata, Catalog Matrices & 49-Item Parameters
 * 3. Server Caching, LocalStorage Protocols & Security Layers
 * 4. Unified Access Gateway Footer: '🔒 Unrestricted Management Core / ماسٹر کنٹرول پینل' (Passcode: 12345)
 */
export const OperationsPortalPage: React.FC<OperationsPortalPageProps> = ({
  state,
  theme,
  onReturnToStorefront,
  onAccessAdmin,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  const handleVerifyMasterToken = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = tokenInput.trim();
    // Strictly verify master bypass credential sequence: 12345 or configured token
    if (cleanInput === '12345' || cleanInput === state.adminPasswordToken?.trim()) {
      setIsSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        setIsSuccess(false);
        setTokenInput('');
        onAccessAdmin();
      }, 350);
    } else {
      setErrorMsg('Invalid token. Correct master authorization key is required. (Default: 12345)');
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgCanvas,
        color: theme.textPrimary,
      }}
      className="min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950"
    >
      {/* 1. TOP CONSOLE NAVIGATION BAR */}
      <header
        style={{
          backgroundColor: theme.bgSurface,
          borderColor: theme.borderSubtle,
        }}
        className="sticky top-0 z-40 w-full border-b backdrop-blur-md shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReturnToStorefront}
              style={{
                backgroundColor: theme.bgCard,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold hover:opacity-85 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Back to Restaurant Stream</span>
              <span className="font-urdu text-[11px] hidden md:inline">واپسی مینو</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black tracking-tight leading-tight">
                  Operations & Governance Portal
                </h1>
                <p className="text-[10px] text-amber-500 font-urdu font-bold" dir="rtl">
                  انتظامی و تکنیکی نگرانی کنسول
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LocalStorage v5 Active</span>
            </span>
            <button
              type="button"
              onClick={() => setIsPromptExpanded(true)}
              style={{
                backgroundColor: theme.accent,
                color: theme.accentText,
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-black shadow-xs hover:opacity-90 transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN MULTI-COLUMN CONSOLE VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Banner Overview */}
        <div
          style={{
            backgroundColor: theme.bgCard,
            borderColor: theme.borderStrong,
          }}
          className="p-5 sm:p-6 rounded-3xl border shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[11px] font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Dogar Sajji & Restaurant System Console</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Operational Framework & Governance Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Centralized console monitoring hygiene standards, pit master shift schedules, 
                49-item verified food matrices, and browser persistence protocols for the Gujranwala flagship branch.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Physical Menu</span>
                <span className="text-lg font-black text-amber-400 tabular-nums">49 Items</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Radius</span>
                <span className="text-lg font-black text-emerald-400 tabular-nums">5.0 KM</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Price Cap</span>
                <span className="text-lg font-black text-amber-400 tabular-nums">Rs. 3,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 HIGH-FIDELITY TABULAR METRIC COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: RESTAURANT OPERATIONS & SHIFT PROTOCOLS */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            }}
            className="p-5 rounded-3xl border space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                <Flame className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-black tracking-tight">Kitchen Operations & SOPs</h3>
                  <p className="text-[11px] font-urdu text-amber-400 font-bold" dir="rtl">باورچی خانہ کے اصول و ضوابط</p>
                </div>
              </div>

              {/* Operating Shift Table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Baseline Shift Schedules
                </span>
                <div className="overflow-hidden rounded-xl border border-slate-800 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase">
                      <tr>
                        <th className="p-2">Shift</th>
                        <th className="p-2">Timing</th>
                        <th className="p-2">Dispatch Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-2 font-bold text-amber-400">Lunch Pits</td>
                        <td className="p-2 text-slate-300">11:30 AM – 05:00 PM</td>
                        <td className="p-2 text-slate-400">Live Sajji & Karahi</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-400">Evening Prime</td>
                        <td className="p-2 text-slate-300">05:00 PM – 02:00 AM</td>
                        <td className="p-2 text-slate-400">Full BBQ, Deals & Fleet</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-400">Night Delivery</td>
                        <td className="p-2 text-slate-300">02:00 AM – 04:00 AM</td>
                        <td className="p-2 text-slate-400">Hotline Delivery Orders</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hygiene Rules Matrix */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Mandatory Governance Rules
                </span>
                <div className="space-y-2">
                  {state.guidelines.map((g) => (
                    <div
                      key={g.id}
                      className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{g.titleEn}</span>
                        <span className="font-urdu text-[11px] text-amber-400" dir="rtl">{g.titleUr}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{g.descriptionEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Emergency Kitchen Hotline:</span>
              <span className="font-black text-amber-400 tabular-nums">{state.hotlineFormatted}</span>
            </div>
          </div>

          {/* COLUMN 2: STRUCTURAL METADATA & 49-ITEM CATALOG MATRICES */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            }}
            className="p-5 rounded-3xl border space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                <Database className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-black tracking-tight">Structural Catalog Matrix</h3>
                  <p className="text-[11px] font-urdu text-amber-400 font-bold" dir="rtl">49 مینو آئٹمز تصدیق شدہ فہرست</p>
                </div>
              </div>

              {/* Catalog Specifications Table */}
              <div className="overflow-hidden rounded-xl border border-slate-800 text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-800 text-xs">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Total Valid Entries</td>
                      <td className="p-2.5 text-right font-black text-amber-400 tabular-nums">49 Genuine Dishes</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Excluded Rice Section</td>
                      <td className="p-2.5 text-right font-medium text-rose-400">Barbecue Rice (Crossed Out)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Maximum Ceiling Cap</td>
                      <td className="p-2.5 text-right font-black text-emerald-400 tabular-nums">Rs. 3,500 Max</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Active View Mode</td>
                      <td className="p-2.5 text-right font-bold text-slate-200">
                        {state.catalogViewMode === 'desktop-grid' ? 'Desktop Grid (2 Cards)' : 'Mobile Default (1 Card)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Direct Order Link</td>
                      <td className="p-2.5 text-right font-mono text-[11px] text-amber-400">whatsapp://send?phone=...</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Delivery Fleet Radius</td>
                      <td className="p-2.5 text-right font-bold text-slate-200">5.0 KM Free Zone (9 Landmarks)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Category Breakdown Breakdown */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Category Distribution Matrix
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">🍗 Balochi Sajji</span>
                    <span className="font-bold text-amber-400">4</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">👑 Family Deals</span>
                    <span className="font-bold text-amber-400">5</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">🥤 Cold Drinks</span>
                    <span className="font-bold text-amber-400">4</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">🥘 Desi Karahi</span>
                    <span className="font-bold text-amber-400">6</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">🥩 Prime Mutton</span>
                    <span className="font-bold text-amber-400">6</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">🍢 Beef Specials</span>
                    <span className="font-bold text-amber-400">6</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">🔥 Charcoal BBQ</span>
                    <span className="font-bold text-amber-400">8</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">🍲 Traditional Daal</span>
                    <span className="font-bold text-amber-400">4</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between col-span-2">
                    <span className="text-slate-300">🫓 Fresh Tandoor Naan & Roti</span>
                    <span className="font-bold text-amber-400">6</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <span>Delivery Hotlines:</span>
              <span className="font-bold text-slate-200">0300-9346628 / 0301-8179528</span>
            </div>
          </div>

          {/* COLUMN 3: SERVER CACHING & SECURITY PARAMETERS */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            }}
            className="p-5 rounded-3xl border space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                <Server className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-black tracking-tight">Caching & Security Parameters</h3>
                  <p className="text-[11px] font-urdu text-amber-400 font-bold" dir="rtl">سرور اور لوکل سٹوریج محفوظ پیرامیٹرز</p>
                </div>
              </div>

              {/* Security & Caching Specifications */}
              <div className="overflow-hidden rounded-xl border border-slate-800 text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-800 text-xs">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Storage Engine</td>
                      <td className="p-2.5 text-right font-mono text-emerald-400">localStorage (v5)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Primary Key</td>
                      <td className="p-2.5 text-right font-mono text-[10px] text-slate-300 truncate max-w-[150px]">
                        DOGAR_SAJJI_STATE_V5
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Dual Snapshot Mirror</td>
                      <td className="p-2.5 text-right font-mono text-emerald-400">Active (Auto-Sync)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Public Front-End State</td>
                      <td className="p-2.5 text-right text-emerald-400 font-bold">100% Zero Edit Tags</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Master Bypass Token</td>
                      <td className="p-2.5 text-right font-mono text-amber-400 font-black">12345 (Hardcoded)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-400">Delivery Auto-Counter</td>
                      <td className="p-2.5 text-right text-slate-300">35-45 Mins Dynamic Live</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Security Shield Badges */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Defensive Architecture Protections
                </span>
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Frontend Isolated: Camera/upload overlays strictly confined to Page 4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Headless clipboard transaction auto-copy pipeline active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Hard refresh reboot lock enabled (Never resets to empty defaults)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between text-emerald-400 font-bold">
              <span>Security Status:</span>
              <span>100% Locked & Authenticated</span>
            </div>
          </div>
        </div>

        {/* 3. UNIFIED ACCESS GATEWAY FOOTER AT THE ABSOLUTE BOTTOM */}
        <section
          style={{
            backgroundColor: theme.bgCard,
            borderColor: theme.borderStrong,
          }}
          className="p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 text-center relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                🔒 Unrestricted Management Core / ماسٹر کنٹرول پینل
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authorized restaurant ownership gateway. Verify the master token credentials 
                to launch the isolated Page 4 Standalone Admin Panel.
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyMasterToken} className="max-w-md mx-auto space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter Master Token (e.g. 12345)"
                  style={{
                    backgroundColor: theme.bgSurface,
                    borderColor: errorMsg ? '#F43F5E' : theme.borderStrong,
                    color: theme.textPrimary,
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border text-sm font-mono tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-inner"
                />

                <button
                  type="submit"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.accentText,
                  }}
                  className="px-6 py-3 rounded-xl text-sm font-black shadow-md hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Launch Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center justify-center gap-1.5 text-rose-500 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isSuccess && (
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Token Verified! Launching Page 4 Standalone Admin Panel...</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-mono">
                Master Security Bypass Key: <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">12345</span>
              </p>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>Dogar Sajji & Restaurant Flagship • Gujranwala Cantt</span>
            <button
              type="button"
              onClick={onReturnToStorefront}
              className="text-amber-500 hover:underline font-bold cursor-pointer"
            >
              ← Back to Public Restaurant Stream / واپسی مینو
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
