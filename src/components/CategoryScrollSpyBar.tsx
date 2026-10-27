'use client';

import React, { useRef, useEffect } from 'react';
import { Category } from '@/types/database';
import { DietaryFilter } from '@/types/menu';
import { Language, CATEGORY_TRANSLATIONS, TRANSLATIONS } from '@/lib/translations';
import { formatCategoryIcon, triggerHaptic } from '@/lib/utils';
import { SlidersHorizontal, Leaf, Check, Utensils } from 'lucide-react';

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
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  const isAm = currentLocale === 'am';
  const isFastingActive = activeFilter === 'fasting';

  // Auto-scroll the active chip into center view when activeCategoryId changes
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
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center gap-1.5 overflow-hidden">
        {/* 1. Quick Fasting Toggle Chip (1-tap Ethiopian fasting toggle) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            onToggleFasting();
          }}
          className={`flex-shrink-0 h-8 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 shadow-2xs ${
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

        {/* 2. Unified Filter Sheet Trigger */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            onOpenFilterSheet();
          }}
          className={`flex-shrink-0 h-8 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs ${
            activeFilterCount > 0
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]'
          }`}
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{isAm ? 'ማጣሪያ' : 'Filter'}</span>
          {activeFilterCount > 0 && (
            <span className="bg-black/25 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-5 w-[1px] bg-[var(--border)] flex-shrink-0 mx-0.5" />

        {/* 3. Horizontal Scrollable Category Chips (with Scroll-Spy) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {/* 'All' category chip */}
          <button
            ref={(el) => {
              chipRefs.current['all'] = el;
            }}
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onSelectCategory('all');
            }}
            className={`flex-shrink-0 h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
              activeCategoryId === 'all'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--foreground)]/30'
            }`}
          >
            <Utensils className="w-3 h-3" />
            <span>{isAm ? 'ሁሉም' : 'All'}</span>
            {totalItemsCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  activeCategoryId === 'all'
                    ? 'bg-black/20 text-white'
                    : 'bg-[var(--card)] text-[var(--muted-foreground)]'
                }`}
              >
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Individual Category Chips */}
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const count = itemCounts[cat.id] || 0;
            const displayName =
              CATEGORY_TRANSLATIONS[cat.id]?.[currentLocale]?.name ||
              (currentLocale === 'am' && cat.name_am) ||
              (currentLocale === 'so' && cat.name_so) ||
              cat.name;

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
                className={`flex-shrink-0 h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--foreground)]/30'
                }`}
              >
                <span>{formatCategoryIcon(cat.icon, cat.name)}</span>
                <span className="whitespace-nowrap">{displayName}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-[var(--card)] text-[var(--muted-foreground)]'
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
}
