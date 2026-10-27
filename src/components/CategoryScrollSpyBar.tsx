'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Category, MenuItem } from '@/types/database';
import { DietaryFilter } from '@/types/menu';
import { Language, CATEGORY_TRANSLATIONS, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';
import { SlidersHorizontal, Leaf, Check } from 'lucide-react';

interface CategoryScrollSpyBarProps {
  categories: Category[];
  items?: MenuItem[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  itemCounts?: Record<string, number>;
  totalItemsCount?: number;
  activeFilter: DietaryFilter;
  onToggleFasting: () => void;
  onOpenFilterSheet: () => void;
  activeFilterCount?: number;
  locale?: Language | string;
}

/**
 * Dynamically resolves category cover image:
 * 1. Owner's explicit category image (from database / admin console)
 * 2. Dish photo lookup: finds the first dish in this exact category with an image
 * 3. Smart culinary keyword semantic fallback (never a burger unless category is burgers!)
 * 4. General culinary fallback: authentic banquet feast dish
 */
function getCategoryPhoto(cat: Category, items: MenuItem[] = []): string {
  // 1. Owner-controlled explicit image (highest precedence)
  if (cat.image_url && cat.image_url.trim()) {
    return cat.image_url;
  }

  // 2. Dynamic lookup: find first dish belonging to this category with an image
  const categoryDishes = items.filter(
    (i) => i.category_id === cat.id && i.image_url && i.image_url.trim()
  );
  const activeDishWithImage = categoryDishes.find((i) => i.is_available !== false);
  if (activeDishWithImage?.image_url) {
    return activeDishWithImage.image_url;
  }
  if (categoryDishes[0]?.image_url) {
    return categoryDishes[0].image_url;
  }

  // 3. Smart semantic culinary match based on category name & translations
  const combined = `${cat.name || ''} ${cat.name_am || ''} ${cat.id || ''}`.toLowerCase();

  // Burgers ONLY if explicitly burgers
  if (combined.includes('burger') || combined.includes('በርገር')) {
    return '/images/dishes/special-burger.jpg';
  }
  // Pizzas
  if (combined.includes('pizza') || combined.includes('ፒዛ')) {
    return '/images/dishes/woodfired-pizza.jpg';
  }
  // Hot beverages, Coffee, Tea, Latte, Espresso
  if (
    combined.includes('hot') ||
    combined.includes('coffee') ||
    combined.includes('buna') ||
    combined.includes('macchiato') ||
    combined.includes('tea') ||
    combined.includes('beverage') ||
    combined.includes('latte') ||
    combined.includes('cappuccino') ||
    combined.includes('espresso') ||
    combined.includes('ትኩስ') ||
    combined.includes('ቡና')
  ) {
    return '/images/dishes/macchiato-77.jpg';
  }
  // Cold drinks, Iced drinks, Juices, Smoothies
  if (
    combined.includes('ice') ||
    combined.includes('iced') ||
    combined.includes('cold') ||
    combined.includes('juice') ||
    combined.includes('shake') ||
    combined.includes('smoothie') ||
    combined.includes('drink') ||
    combined.includes('ቀዝቃዛ') ||
    combined.includes('ጭማቂ')
  ) {
    return '/images/dishes/fresh-mango-juice.jpg';
  }
  // Desserts, Cakes, Pastries, Sweets
  if (
    combined.includes('dessert') ||
    combined.includes('cake') ||
    combined.includes('pastry') ||
    combined.includes('torta') ||
    combined.includes('croissant') ||
    combined.includes('sweet') ||
    combined.includes('ጣፋጭ') ||
    combined.includes('ኬክ')
  ) {
    return '/images/dishes/opera-cake-5.jpg';
  }
  // Breads & Bakery
  if (combined.includes('bread') || combined.includes('baget') || combined.includes('dabo') || combined.includes('ዳቦ')) {
    return '/images/dishes/gebis-baget-26.jpg';
  }
  // Breakfast
  if (
    combined.includes('breakfast') ||
    combined.includes('berak') ||
    combined.includes('qurs') ||
    combined.includes('ቁርስ') ||
    combined.includes('ful') ||
    combined.includes('chechebisa') ||
    combined.includes('egg') ||
    combined.includes('omelet')
  ) {
    return '/images/dishes/chechebisa-51.jpg';
  }
  // Snacks & Wings
  if (combined.includes('snack') || combined.includes('wing') || combined.includes('fries') || combined.includes('ስናክ')) {
    return '/images/dishes/fried-chicken-wings-70.jpg';
  }
  // Mendi
  if (combined.includes('mendi') || combined.includes('መንዲ')) {
    return '/images/dishes/special-mendi.jpg';
  }
  // Fasting
  if (combined.includes('fasting') || combined.includes('tsom') || combined.includes('የፆም') || combined.includes('vegan')) {
    return '/images/dishes/fasting-agelegil-151.jpg';
  }
  // Wraps & Shawarma
  if (combined.includes('wrap') || combined.includes('shawarma') || combined.includes('sandwich') || combined.includes('roll') || combined.includes('ሻዋርማ')) {
    return '/images/dishes/chicken-shewarma-148.jpg';
  }
  // Lunch, Dinner, Tibs, Mains
  if (
    combined.includes('lunch') ||
    combined.includes('dinner') ||
    combined.includes('tibs') ||
    combined.includes('wot') ||
    combined.includes('fitfit') ||
    combined.includes('half') ||
    combined.includes('ምሳ') ||
    combined.includes('እራት')
  ) {
    return '/images/dishes/1-2-roasted-chicken-141.jpg';
  }

  // 4. Default authentic culinary dish (roasted chicken feast platter, never a burger)
  return '/images/dishes/roasted-chicken.jpg';
}

function formatCategoryLabel(cat: Category, locale: string): string {
  if (locale === 'am') {
    return cat.name_am || cat.name.split('/')[1]?.trim() || cat.name;
  }
  if (locale === 'so' && cat.name_so) {
    return cat.name_so;
  }
  // In English or other languages, if the name is "Breakfast / ቁርስ", take the clean primary English name
  const en = cat.name.split('/')[0]?.trim() || cat.name;
  const lower = en.toLowerCase();
  if (lower === 'berak fast') return 'Breakfast';
  if (lower === 'soft cake') return 'Cakes';
  if (lower === 'snack menu') return 'Snacks';
  if (lower.includes('hot beverage')) return 'Hot Drinks';
  if (lower.includes('lunch and dinner')) return 'Mains';
  if (lower.includes('fasting lunch')) return 'Fasting';
  return en;
}

export function CategoryScrollSpyBar({
  categories,
  items = [],
  activeCategoryId,
  onSelectCategory,
  itemCounts = {},
  totalItemsCount = 0,
  activeFilter,
  onToggleFasting,
  onOpenFilterSheet,
  activeFilterCount = 0,
  locale = 'en',
}: CategoryScrollSpyBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const currentLocale = (locale as Language) || 'en';
  const isAm = currentLocale === 'am';
  const isFastingActive = activeFilter === 'fasting';

  // Auto-scroll the active circular avatar into center view on selection change
  useEffect(() => {
    const activeChip = chipRefs.current[activeCategoryId];
    if (activeChip && scrollContainerRef.current) {
      activeChip.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategoryId]);

  return (
    <div className="bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] select-none transition-colors">
      {/* 1. Quick Filters Utility Row */}
      <div className="max-w-4xl mx-auto px-3.5 pt-2 pb-1.5 flex items-center justify-between gap-2 border-b border-[var(--border)]/40">
        <div className="flex items-center gap-2">
          {/* Quick 1-tap Fasting Toggle Chip */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onToggleFasting();
            }}
            className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 shadow-2xs ${
              isFastingActive
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:border-emerald-500/50'
            }`}
            title={isAm ? 'የጾም ምግቦች ብቻ' : 'Fasting dishes (meat & dairy free)'}
            aria-label={isAm ? 'የጾም ምግቦች' : 'Fasting dishes'}
          >
            <Leaf className={`w-3.5 h-3.5 ${isFastingActive ? 'fill-current text-white' : 'text-emerald-500'}`} />
            <span>{isAm ? 'የጾም' : 'Fasting'}</span>
            {isFastingActive && <Check className="w-3 h-3 stroke-[3px]" />}
          </button>
        </div>

        {/* Filter Sheet Trigger */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            onOpenFilterSheet();
          }}
          className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs ${
            activeFilterCount > 0
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]'
          }`}
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span className="text-[11px]">{isAm ? 'ማጣሪያ' : 'Filter'}</span>
          {activeFilterCount > 0 && (
            <span className="bg-black/25 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Horizontal Scrollable Circular Food Avatars (Realistic Cutout/Photo Style) */}
      <div className="max-w-4xl mx-auto px-3">
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
        >
          {/* 'All' Circular Avatar */}
          <button
            ref={(el) => {
              chipRefs.current['all'] = el;
            }}
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onSelectCategory('all');
            }}
            className="flex-shrink-0 flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2.5px] transition-all duration-200 ${
                activeCategoryId === 'all'
                  ? 'border-2 border-[var(--primary)] shadow-sm bg-[var(--card)]'
                  : 'border-2 border-transparent hover:border-[var(--border)]'
              }`}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--surface)] shadow-2xs">
                <Image
                  src="/images/dishes/roasted-chicken.jpg"
                  alt="All Menu"
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {activeCategoryId !== 'all' && (
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                )}
              </div>
            </div>
            <span
              className={`text-[11px] sm:text-xs mt-1.5 font-bold text-center transition-colors max-w-[76px] truncate ${
                activeCategoryId === 'all'
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--foreground)]/75 group-hover:text-[var(--foreground)]'
              }`}
            >
              {isAm ? 'ሁሉም' : 'All'}
            </span>
          </button>

          {/* Individual Category Circular Avatars with Realistic Food Imagery */}
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const displayName = formatCategoryLabel(cat, currentLocale);
            const photoUrl = getCategoryPhoto(cat, items);

            return (
              <button
                key={cat.id}
                ref={(el) => {
                  chipRefs.current[cat.id] = el;
                }}
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onSelectCategory(cat.id);
                }}
                className="flex-shrink-0 flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
              >
                <div
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2.5px] transition-all duration-200 ${
                    isActive
                      ? 'border-2 border-[var(--primary)] shadow-sm bg-[var(--card)]'
                      : 'border-2 border-transparent hover:border-[var(--border)]'
                  }`}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--surface)] shadow-2xs">
                    <Image
                      src={photoUrl}
                      alt={displayName}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    )}
                  </div>
                </div>
                <span
                  className={`text-[11px] sm:text-xs mt-1.5 font-bold text-center transition-colors max-w-[76px] truncate ${
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--foreground)]/75 group-hover:text-[var(--foreground)]'
                  }`}
                >
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
