'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Category, MenuItem } from '@/types/database';
import { DietaryFilter } from '@/types/menu';
import { Language, CATEGORY_TRANSLATIONS, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';
import { Leaf, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryScrollSpyBarProps {
  categories: Category[];
  items?: MenuItem[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  itemCounts?: Record<string, number>;
  totalItemsCount?: number;
  activeFilter: DietaryFilter;
  onToggleFasting: () => void;
  onToggleOnOffer?: () => void;
  hasOffers?: boolean;
  offersCount?: number;
  onOpenFilterSheet: () => void;
  activeFilterCount?: number;
  locale?: Language | string;
}

/**
 * Dynamically resolves category cover image:
 * 1. Owner's explicit category image (from database / admin console)
 * 2. Studio isolated category cutout (app-icon style like reference)
 * 3. Dynamic lookup from dish items if available
 * 4. General culinary fallback
 */
function getCategoryPhoto(cat: Category, items: MenuItem[] = []): string {
  // 1. Owner-controlled explicit image (highest precedence)
  if (cat.image_url && cat.image_url.trim()) {
    return cat.image_url;
  }

  const combined = `${cat.name || ''} ${cat.name_am || ''} ${cat.id || ''}`.toLowerCase();

  // 2. Studio isolated food cutout assets matching reference aesthetic
  if (combined.includes('burger') || combined.includes('በርገር')) {
    return '/images/categories/burger.jpg';
  }
  if (combined.includes('pizza') || combined.includes('ፒዛ')) {
    return '/images/categories/pizza.jpg';
  }
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
    return '/images/categories/dessert.jpg';
  }
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
    return '/images/categories/hot-drink.jpg';
  }
  if (
    combined.includes('ice') ||
    combined.includes('iced') ||
    combined.includes('cold') ||
    combined.includes('ቀዝቃዛ')
  ) {
    return '/images/categories/iced-drink.jpg';
  }
  if (
    combined.includes('juice') ||
    combined.includes('shake') ||
    combined.includes('smoothie') ||
    combined.includes('ጭማቂ')
  ) {
    return '/images/categories/juice.jpg';
  }
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
    return '/images/categories/breakfast.jpg';
  }
  if (
    combined.includes('sandwich') ||
    combined.includes('club') ||
    combined.includes('ሳንድዊች')
  ) {
    return '/images/categories/sandwich.jpg';
  }
  if (
    combined.includes('wrap') ||
    combined.includes('shawarma') ||
    combined.includes('roll') ||
    combined.includes('ሻዋርማ')
  ) {
    return '/images/categories/wrap.jpg';
  }
  if (
    combined.includes('snack') ||
    combined.includes('wing') ||
    combined.includes('fries') ||
    combined.includes('ስናክ')
  ) {
    return '/images/categories/snacks.jpg';
  }
  if (
    combined.includes('bread') ||
    combined.includes('baget') ||
    combined.includes('dabo') ||
    combined.includes('ዳቦ')
  ) {
    return '/images/dishes/gebis-baget-26.jpg';
  }

  // 3. Dynamic lookup: find first dish belonging to this category with an image
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

  // 4. Default authentic banquet feast cutout
  return '/images/categories/all.jpg';
}

function formatCategoryLabel(cat: Category, locale: string): string {
  if (locale === 'am') {
    return cat.name_am || cat.name.split('/')[1]?.trim() || cat.name;
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
  onToggleOnOffer,
  hasOffers = false,
  offersCount = 0,
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

  const handleScrollLeft = () => {
    triggerHaptic(6);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    triggerHaptic(6);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-transparent border-0 select-none transition-colors">
      {/* 1. Quick Fasting 1-Tap Toggle */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-1 pb-0.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            onToggleFasting();
          }}
          className={`h-7 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 shadow-xs ${
            isFastingActive
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-[#1E1815] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/50'
          }`}
          title={isAm ? 'የጾም ምግቦች ብቻ' : 'Fasting dishes (meat & dairy free)'}
          aria-label={isAm ? 'የጾም ምግቦች' : 'Fasting dishes'}
        >
          <Leaf className={`w-3.5 h-3.5 ${isFastingActive ? 'fill-current text-white' : 'text-emerald-500'}`} />
          <span>{isAm ? 'የጾም' : 'Fasting'}</span>
          {isFastingActive && <Check className="w-3 h-3 stroke-[3px]" />}
        </button>
      </div>

      {/* 2. Horizontal Scrollable Circular Food Avatars (Airy Studio Cutout Style) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative group/cat-strip">
        {/* Desktop Prev Button (Hidden on mobile) */}
        <button
          type="button"
          onClick={handleScrollLeft}
          className="hidden md:flex absolute left-2 top-8 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#1E1815] border border-stone-200/80 dark:border-stone-800 shadow-md text-stone-700 dark:text-stone-300 items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/cat-strip:opacity-100 cursor-pointer"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-2"
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
              className={`relative w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full p-[2px] transition-all duration-200 bg-white dark:bg-[#1E1815] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
                activeCategoryId === 'all'
                  ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-[var(--background)]'
                  : 'border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#1E1815]">
                <Image
                  src="/images/categories/all.jpg"
                  alt="All Menu"
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </div>
            <span
              className={`text-[11px] sm:text-xs mt-1.5 font-semibold text-center leading-tight line-clamp-2 max-w-[68px] sm:max-w-[76px] min-h-[26px] flex items-center justify-center transition-colors ${
                activeCategoryId === 'all'
                  ? 'text-red-600 font-bold'
                  : 'text-stone-700/80 dark:text-stone-300 group-hover:text-stone-950 dark:group-hover:text-stone-100'
              }`}
            >
              {isAm ? 'ሁሉም' : 'All'}
            </span>
          </button>

          {/* Individual Category Circular Avatars with Studio Cutout Imagery */}
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
                  className={`relative w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full p-[2px] transition-all duration-200 bg-white dark:bg-[#1E1815] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
                    isActive
                      ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-[var(--background)]'
                      : 'border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#1E1815]">
                    <Image
                      src={photoUrl}
                      alt={displayName}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
                <span
                  className={`text-[11px] sm:text-xs mt-1.5 font-semibold text-center leading-tight line-clamp-2 max-w-[68px] sm:max-w-[76px] min-h-[26px] flex items-center justify-center transition-colors ${
                    isActive
                      ? 'text-red-600 font-bold'
                      : 'text-stone-700/80 dark:text-stone-300 group-hover:text-stone-950 dark:group-hover:text-stone-100'
                  }`}
                >
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Next Button (Hidden on mobile) */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="hidden md:flex absolute right-2 top-8 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#1E1815] border border-stone-200/80 dark:border-stone-800 shadow-md text-stone-700 dark:text-stone-300 items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/cat-strip:opacity-100 cursor-pointer"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
