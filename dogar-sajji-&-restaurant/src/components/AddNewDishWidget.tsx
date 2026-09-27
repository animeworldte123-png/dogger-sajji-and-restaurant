import React, { useState, useRef } from 'react';
import { Plus, Upload, Image as ImageIcon, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem, ThemeStyleConfig } from '../types';
import { readFileAsBase64 } from '../utils/storage';

interface AddNewDishWidgetProps {
  theme: ThemeStyleConfig;
  onDishAdded: (newDish: MenuItem) => void;
}

export const AddNewDishWidget: React.FC<AddNewDishWidgetProps> = ({ theme, onDishAdded }) => {
  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [categoryId, setCategoryId] = useState('sajji');
  const [menuGroup, setMenuGroup] = useState<'priority' | 'extended'>('priority');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionUr, setDescriptionUr] = useState('');
  const [hasPortions, setHasPortions] = useState(true);
  const [fullPrice, setFullPrice] = useState<number>(1450);
  const [halfPrice, setHalfPrice] = useState<number>(790);
  const [prepTime, setPrepTime] = useState('25-30 min');
  const [badge, setBadge] = useState('Chef Choice / خاص انتخاب');
  const [isPopular, setIsPopular] = useState(true);
  const [isSignature, setIsSignature] = useState(false);
  const [imageBase64, setImageBase64] = useState<string>('/src/assets/images/dish_chicken_sajji_1790248406038.jpg');
  const [isDragging, setIsDragging] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    try {
      const b64 = await readFileAsBase64(file);
      setImageBase64(b64);
      setErrorMessage(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid image file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setErrorMessage('Please enter the English dish name.');
      return;
    }
    if (!nameUr.trim()) {
      setErrorMessage('Please enter the Urdu dish name (ڈش کا اردو نام درج کریں).');
      return;
    }
    if (fullPrice <= 0) {
      setErrorMessage('Please set a valid price.');
      return;
    }
    if (fullPrice > 3500) {
      setErrorMessage('Strict maximum boundary price cap is Rs. 3,500. Under no circumstances can prices exceed Rs. 3,500.');
      return;
    }

    const newDish: MenuItem = {
      id: `dish-custom-${Date.now()}`,
      nameEn: nameEn.trim(),
      nameUr: nameUr.trim(),
      categoryId,
      menuGroup,
      descriptionEn: descriptionEn.trim() || 'Authentic traditional recipe prepared with 100% daily fresh meat and pure desi spices.',
      descriptionUr: descriptionUr.trim() || 'خالص دیسی مسالوں اور تازہ گوشت سے تیار شدہ روایتی ڈش۔',
      image: imageBase64,
      hasPortions,
      prices: {
        full: Number(fullPrice),
        ...(hasPortions && halfPrice > 0 ? { half: Number(halfPrice) } : {}),
      },
      defaultPortion: 'full',
      prepTime: prepTime.trim() || '25 min',
      badge: badge.trim() || undefined,
      isPopular,
      isSignature,
      isExcludedFastFood: false,
    };

    onDishAdded(newDish);
    setSuccessBanner(`✓ "${nameEn}" has been injected into the live catalog!`);
    setErrorMessage(null);

    // Reset form fields
    setNameEn('');
    setNameUr('');
    setDescriptionEn('');
    setDescriptionUr('');
    setFullPrice(1500);
    setHalfPrice(800);

    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgSurface,
        borderColor: theme.borderStrong,
        color: theme.textPrimary,
      }}
      className="p-5 sm:p-7 rounded-3xl border shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4" style={{ borderColor: theme.borderSubtle }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">
              Add New Dish to Live Catalog / نیا پکوان شامل کریں
            </h3>
            <p className="text-xs text-slate-500">
              Inject custom culinary creations directly into the continuous public menu viewport.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 self-start sm:self-auto">
          ● Live Component Engine
        </span>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <span className="text-[11px] font-urdu text-emerald-100">فہرست میں اضافہ کر دیا گیا</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ROW 1: Bilingual Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold mb-1">
              Custom Dish Name (English) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Balochi Lamb Sajji"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3.5 py-2.5 rounded-xl border font-semibold focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1 font-urdu" dir="rtl">
              پکوان کا نام (اردو میں) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: شاہی بلوچی دمپخت سجی"
              value={nameUr}
              onChange={(e) => setNameUr(e.target.value)}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3.5 py-2.5 rounded-xl border text-right font-urdu font-bold focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>
        </div>

        {/* ROW 2: Category & Continuous Stream Placement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Menu Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3.5 py-2.5 rounded-xl border font-semibold focus:outline-hidden"
            >
              <option value="sajji">Balochi Charcoal Sajji (بلوچی سجی)</option>
              <option value="combos">Family Feast Combos (فیملی ڈیلز)</option>
              <option value="karahi">Shinwari Desi Karahi (شنواری کڑاہی)</option>
              <option value="mutton">Prime Mutton Roasts (مٹن چانپ و روش)</option>
              <option value="beef">Beef Bihari Specialties (بیف بہاری)</option>
              <option value="daal">Daal Makhni (دال ماش مکھنی)</option>
              <option value="tandoor">Fresh Tandoor Breads (روغنی نان)</option>
              <option value="drinks">Cold Beverages & Drinks (مشروبات)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Continuous Viewport Stack</label>
            <select
              value={menuGroup}
              onChange={(e) => setMenuGroup(e.target.value as 'priority' | 'extended')}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3.5 py-2.5 rounded-xl border font-semibold focus:outline-hidden"
            >
              <option value="priority">Group 1 Priority (Top of Continuous Stack)</option>
              <option value="extended">Group 2 Extended (Traditional Catalog Stack)</option>
            </select>
          </div>
        </div>

        {/* ROW 3: Portion Pricing Structure */}
        <div
          style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
          className="p-4 rounded-2xl border space-y-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Portion Variations & Pricing Structure</span>
            </span>
            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={hasPortions}
                onChange={(e) => setHasPortions(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>Enable Full & Half Portions (فل اور ہاف سرونگ)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-bold mb-1 text-slate-500">
                Full Serving Price / مکمل قیمت (Rs.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={fullPrice}
                onChange={(e) => setFullPrice(Number(e.target.value))}
                style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderSubtle }}
                className="w-full px-3.5 py-2 rounded-xl border font-mono font-bold text-sm focus:outline-hidden"
                required
              />
            </div>

            {hasPortions ? (
              <div>
                <label className="block text-[11px] font-bold mb-1 text-slate-500">
                  Half Serving Price / نصف قیمت (Rs.)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={halfPrice}
                  onChange={(e) => setHalfPrice(Number(e.target.value))}
                  style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderSubtle }}
                  className="w-full px-3.5 py-2 rounded-xl border font-mono font-bold text-sm focus:outline-hidden"
                />
              </div>
            ) : (
              <div className="flex items-center text-slate-400 text-xs italic">
                Single unified portion price active
              </div>
            )}
          </div>
        </div>

        {/* ROW 4: Bilingual Descriptive Strings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Localized Description (English)</label>
            <textarea
              rows={2}
              placeholder="Fresh cuts slow-roasted over acacia charcoal with mountain herbs..."
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3.5 py-2 rounded-xl border focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 font-urdu" dir="rtl">
              تفصیل و تیاری (اردو)
            </label>
            <textarea
              rows={2}
              placeholder="تازہ حلال گوشت، دیسی گھی اور کوئلوں کی دھیمی آنچ پر خاص تیاری..."
              value={descriptionUr}
              onChange={(e) => setDescriptionUr(e.target.value)}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3.5 py-2 rounded-xl border text-right font-urdu focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* ROW 5: Drag and Drop Image Capture Interface */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold">
            Dish Photographic Asset (Native Drag-and-Drop / Click-to-Attach)
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderColor: isDragging ? theme.accent : theme.borderStrong,
              backgroundColor: isDragging ? `${theme.accent}15` : theme.bgCard,
            }}
            className={`p-5 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center gap-4 cursor-pointer transition-all ${
              isDragging ? 'scale-[1.01]' : 'hover:border-amber-500'
            }`}
          >
            {/* Image Preview */}
            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md shrink-0 bg-slate-900 border border-slate-700 relative">
              <img src={imageBase64} alt="Dish Preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                <span className="font-bold">Drop your food photo here or click to browse</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP. Automatically optimized and parsed via FileReader into persistent Base64 Data-URI.
              </p>
            </div>

            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shrink-0 pointer-events-none"
            >
              Browse File
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* ROW 6: Badges & Prep time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Cooking / Prep Time</label>
            <input
              type="text"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3 py-2 rounded-xl border focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Promotional Badge Tag</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
              className="w-full px-3 py-2 rounded-xl border focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-4 pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>Popular Item</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isSignature}
                onChange={(e) => setIsSignature(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>Signature</span>
            </label>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            style={{ backgroundColor: theme.accent, color: theme.accentText }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Inject Dish into Live Catalog / لائیو مینو میں شامل کریں</span>
          </button>
        </div>
      </form>
    </div>
  );
};
