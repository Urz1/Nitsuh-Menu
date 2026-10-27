'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';

interface StickySearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  locale?: Language | string;
  placeholder?: string;
}

export function StickySearchBar({
  searchQuery,
  onSearchChange,
  locale = 'en',
  placeholder,
}: StickySearchBarProps) {
  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  const isAm = currentLocale === 'am';

  const defaultPlaceholder = isAm
    ? 'ፉል፣ ጥብስ፣ ኬክ ወይም መጠጦችን ይፈልጉ...'
    : 'Search foul, tibs, pastries, juices...';

  return (
    <div className="bg-[var(--card)]/95 backdrop-blur-md px-3.5 py-2 border-b border-[var(--border)] transition-colors">
      <div className="max-w-4xl mx-auto relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          // Minimum 16px text on mobile (text-base) prevents iOS Safari auto-zooming
          className="w-full h-10 pl-10 pr-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-base sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 placeholder:text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
          aria-label="Search menu"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              onSearchChange('');
            }}
            className="absolute right-3 w-5 h-5 rounded-full bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors active:scale-90"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
