import React from 'react';
import { ThemeStyleConfig } from '../types';

export interface CategoryItem {
  id: string;
  nameEn: string;
  nameUr: string;
  emoji: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', nameEn: 'All Dishes', nameUr: 'تمام دسترخوان', emoji: '🔥' },
  { id: 'sajji', nameEn: 'Balochi Sajji', nameUr: 'خاص بلوچی سجی', emoji: '🍗' },
  { id: 'combos', nameEn: 'Family Deals', nameUr: 'فیملی کمبو ڈیلز', emoji: '👑' },
  { id: 'karahi', nameEn: 'Desi Karahi', nameUr: 'شنواری کڑاہی', emoji: '🥘' },
  { id: 'mutton', nameEn: 'Mutton Roasts', nameUr: 'مٹن پکوان و کڑاہی', emoji: '🥩' },
  { id: 'beef', nameEn: 'Beef Specialties', nameUr: 'بیف بہاری و کباب', emoji: '🍢' },
  { id: 'bbq', nameEn: 'Charcoal BBQ', nameUr: 'سیخ کباب و تکہ', emoji: '🔥' },
  { id: 'daal', nameEn: 'Daal Makhni', nameUr: 'دال ماش و چنا تڑکہ', emoji: '🍲' },
  { id: 'tandoor', nameEn: 'Fresh Tandoor', nameUr: 'تندوری نان و سلاد', emoji: '🫓' },
  { id: 'drinks', nameEn: 'Cold Drinks', nameUr: 'ٹھنڈی بوتلیں و مشروبات', emoji: '🥤' },
];

interface CategoryFilterBarProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  theme: ThemeStyleConfig;
  countsByCategory: Record<string, number>;
}

/**
 * FLOATING CATEGORY CONTROLLER ROW (ZERO LAYOUT MUTATIONS)
 * Positioned directly above the main catalog stream.
 * Smooth animation anchor scrolling strictly without hiding or altering any page segments.
 */
export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  theme,
  countsByCategory,
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);

    // Smooth Anchor Scrolling without mutating or hiding any page segments
    const targetElementId = categoryId === 'all' ? 'menu' : `category-${categoryId}`;
    const element = document.getElementById(targetElementId);

    if (element) {
      const navbarOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgSurface,
        borderColor: theme.borderSubtle,
      }}
      className="sticky top-16 z-30 w-full border-b py-2.5 px-4 sm:px-6 shadow-sm backdrop-blur-md transition-colors select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Horizontal Smooth Scrollable Tabs Container */}
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x py-1 w-full overscroll-x-contain"
          role="tablist"
          aria-label="Menu Categories / مینو کیٹیگریز"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = countsByCategory[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  backgroundColor: isActive ? theme.accent : theme.bgCard,
                  color: isActive ? theme.accentText : theme.textPrimary,
                  borderColor: isActive ? theme.accent : theme.borderStrong,
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${
                  isActive ? 'shadow-md font-bold' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <span className="text-sm">{cat.emoji}</span>
                <span>{cat.nameEn}</span>
                <span className="font-urdu text-[11px] opacity-90">{cat.nameUr}</span>
                {cat.id !== 'all' && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-mono ${
                      isActive ? 'bg-black/20 text-white' : 'bg-black/10 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
