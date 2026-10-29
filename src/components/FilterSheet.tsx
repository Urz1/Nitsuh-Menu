'use client';

import React from 'react';
import {
  X,
  SlidersHorizontal,
  Tag,
  Leaf,
  ChefHat,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Award,
  ArrowDownAZ,
  Check,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { DietaryFilter, SortOrder } from '@/types/menu';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: DietaryFilter;
  onFilterChange: (filter: DietaryFilter) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  layout: 'grid' | 'list';
  onLayoutChange: (layout: 'grid' | 'list') => void;
  offersCount?: number;
  locale?: Language | string;
}

export function FilterSheet({
  isOpen,
  onClose,
  activeFilter,
  onFilterChange,
  sortOrder,
  onSortChange,
  layout,
  onLayoutChange,
  offersCount = 0,
  locale = 'en',
}: FilterSheetProps) {
  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  const isAm = currentLocale === 'am';

  const DIETARY_OPTIONS: { id: DietaryFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'fasting', label: isAm ? 'የጾም (Fasting)' : t.filterFasting, icon: Leaf },
    { id: 'chefsPick', label: isAm ? 'የሼፍ ምርጥ' : t.filterChefsPick, icon: ChefHat },
  ];

  const SORT_OPTIONS: { id: SortOrder; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'featured', label: isAm ? 'ተመራጭ እና ታዋቂ' : t.sortFeatured, icon: Award },
    { id: 'price-asc', label: isAm ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : t.sortPriceAsc, icon: ArrowDownNarrowWide },
    { id: 'price-desc', label: isAm ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : t.sortPriceDesc, icon: ArrowUpNarrowWide },
    { id: 'name-asc', label: isAm ? 'በፊደል ቅደም ተከተል' : t.sortNameAsc, icon: ArrowDownAZ },
  ];

  const activeCount =
    (activeFilter !== 'all' ? 1 : 0) + (sortOrder !== 'featured' ? 1 : 0);

  const handleReset = () => {
    triggerHaptic(10);
    onFilterChange('all');
    onSortChange('featured');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] bg-[var(--card)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-bold text-base text-[var(--foreground)] font-brand">
              {isAm ? 'አጣራ እና ደርድር' : 'Filters & Sorting'}
            </h3>
            {activeCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {activeCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-2 py-1 rounded-md"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isAm ? 'አጽዳ' : 'Reset'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
          {/* 1. Offers Toggle */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2 block">
              {isAm ? 'ልዩ ቅናሾች' : 'Promotions & Deals'}
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onFilterChange(activeFilter === 'onOffer' ? 'all' : 'onOffer');
              }}
              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all active:scale-[0.99] ${
                activeFilter === 'onOffer'
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] font-bold'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] font-medium hover:border-[var(--foreground)]/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeFilter === 'onOffer'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--card)] text-amber-500 border border-[var(--border)]'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[var(--foreground)]">
                    {isAm ? 'በቅናሽ ላይ ያሉ ምግቦች' : 'Dishes On Offer'}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {isAm ? 'የተቀነሱ ዋጋ ያላቸው ምግቦች ብቻ' : 'Show only dishes with active discounts'}
                  </p>
                </div>
              </div>

              {activeFilter === 'onOffer' && (
                <Check className="w-4 h-4 text-[var(--primary)]" />
              )}
            </button>
          </div>

          {/* 2. Dietary Choices */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5 block">
              {isAm ? 'የምግብ ዓይነት እና ጾም' : 'Dietary Preferences'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = activeFilter === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      onFilterChange(isSelected ? 'all' : opt.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] font-bold shadow-2xs'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] font-medium hover:border-[var(--foreground)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                        }`}
                      />
                      <span className="text-xs truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Sort Options */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5 block">
              {isAm ? 'አደራደር' : 'Sort Order'}
            </span>
            <div className="space-y-1.5">
              {SORT_OPTIONS.map((sort) => {
                const Icon = sort.icon;
                const isSelected = sortOrder === sort.id;

                return (
                  <button
                    key={sort.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      onSortChange(sort.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] font-medium hover:border-[var(--foreground)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                        }`}
                      />
                      <span className="text-xs">{sort.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Display Layout */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5 block">
              {isAm ? 'የእይታ ዓይነት' : 'Card Layout'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onLayoutChange('grid');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all active:scale-95 ${
                  layout === 'grid'
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white font-bold'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] font-medium'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{isAm ? 'ሰሌዳ (Grid)' : 'Grid (2 columns)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onLayoutChange('list');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all active:scale-95 ${
                  layout === 'list'
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white font-bold'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] font-medium'
                }`}
              >
                <List className="w-4 h-4" />
                <span>{isAm ? 'ዝርዝር (List)' : 'List (1 column)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full text-white font-bold text-sm shadow-md transition-transform active:scale-[0.98]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isAm ? 'ውጤቶችን አሳይ' : 'Apply & View Menu'}
          </button>
        </div>
      </div>
    </div>
  );
}
