'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';

interface StickySearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  locale?: Language | string;
  placeholder?: string;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
}

export function StickySearchBar({
  searchQuery,
  onSearchChange,
  locale = 'en',
  placeholder,
  onOpenFilter,
  activeFilterCount = 0,
}: StickySearchBarProps) {
  const currentLocale = (locale as Language) || 'en';
  const isAm = currentLocale === 'am';

  const defaultPlaceholder = isAm
    ? 'ፉል፣ ጥብስ፣ ኬክ ወይም መጠጦችን ይፈልጉ...'
    : 'Search for your favorite dish...';

  return (
    <div className="bg-transparent px-3.5 py-1.5 border-0 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center gap-2.5">
        {/* White Pill Search Input on Cream Canvas */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder || defaultPlaceholder}
            className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white shadow-xs border border-stone-200/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 transition-all"
            aria-label="Search menu"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                onSearchChange('');
              }}
              className="absolute right-3 w-5 h-5 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors active:scale-90"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* White Rounded Square Filter Button on the Same Line */}
        {onOpenFilter && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenFilter();
            }}
            className={`w-11 h-11 rounded-2xl bg-white shadow-xs border flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 relative ${
              activeFilterCount > 0
                ? 'border-red-600 text-red-600 ring-2 ring-red-600/20'
                : 'border-stone-200/70 text-stone-700 hover:border-stone-400'
            }`}
            aria-label="Open Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
