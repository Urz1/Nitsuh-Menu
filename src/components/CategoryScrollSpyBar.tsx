'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Category } from '@/types/database';
import { DietaryFilter } from '@/types/menu';
import { Language, CATEGORY_TRANSLATIONS, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';
import { SlidersHorizontal, Leaf, Check } from 'lucide-react';

interface CategoryScrollSpyBarProps {
  categories: Category[];
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

// Realistic dish image mapping for every category
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  all: '/images/dishes/roasted-chicken.jpg',
  'cat-burgers': '/images/dishes/special-burger.jpg',
  'cat-pizzas': '/images/dishes/woodfired-pizza.jpg',
  'cat-breakfast': '/images/dishes/chechebisa-51.jpg',
  'cat-soft-cake': '/images/dishes/opera-cake-5.jpg',
  'cat-bread': '/images/dishes/gebis-baget-26.jpg',
  'cat-snack-menu': '/images/dishes/fried-chicken-wings-70.jpg',
  'cat-hot-beverage': '/images/dishes/macchiato-77.jpg',
  'cat-juice': '/images/dishes/fresh-mango-juice.jpg',
  'cat-cold-drinks': '/images/dishes/ice-coffee-111.jpg',
  'cat-lunch-dinner': '/images/dishes/1-2-roasted-chicken-141.jpg',
  'cat-mendi': '/images/dishes/special-mendi.jpg',
  'cat-half-half': '/images/dishes/keywot-and-fitfit-143.jpg',
  'cat-wraps': '/images/dishes/chicken-shewarma-148.jpg',
  'cat-fasting-lunch': '/images/dishes/fasting-agelegil-151.jpg',
  fasting: '/images/dishes/fasting-agelegil-151.jpg',
};

function getCategoryPhoto(catId: string, name?: string): string {
  if (CATEGORY_IMAGE_MAP[catId]) return CATEGORY_IMAGE_MAP[catId];
  const lower = (name || '').toLowerCase();
  if (lower.includes('burger')) return '/images/dishes/special-burger.jpg';
  if (lower.includes('pizza')) return '/images/dishes/woodfired-pizza.jpg';
  if (lower.includes('cake') || lower.includes('pastry')) return '/images/dishes/opera-cake-5.jpg';
  if (lower.includes('bread') || lower.includes('dabo')) return '/images/dishes/gebis-baget-26.jpg';
  if (lower.includes('snack') || lower.includes('wing')) return '/images/dishes/fried-chicken-wings-70.jpg';
  if (lower.includes('breakfast') || lower.includes('qurs')) return '/images/dishes/chechebisa-51.jpg';
  if (lower.includes('coffee') || lower.includes('beverage') || lower.includes('tea')) return '/images/dishes/macchiato-77.jpg';
  if (lower.includes('juice') || lower.includes('shake')) return '/images/dishes/fresh-mango-juice.jpg';
  if (lower.includes('mendi')) return '/images/dishes/special-mendi.jpg';
  if (lower.includes('fasting') || lower.includes('tsom')) return '/images/dishes/fasting-agelegil-151.jpg';
  if (lower.includes('wrap') || lower.includes('shawarma')) return '/images/dishes/chicken-shewarma-148.jpg';
  return '/images/dishes/special-burger.jpg';
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
            const photoUrl = getCategoryPhoto(cat.id, cat.name);

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
