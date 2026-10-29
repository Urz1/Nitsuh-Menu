'use client';

import React from 'react';
import Image from 'next/image';
import { MenuItem, DishReviewStats } from '@/types/database';
import { ItemPricingResult } from '@/lib/pricing-engine';
import { formatMoney, triggerHaptic, getOptimizedCloudinaryUrl } from '@/lib/utils';
import { Heart, Plus, Minus, Tag, Clock, Star, ChefHat, Leaf, Flame, UtensilsCrossed } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { DishPlaceholder } from './DishPlaceholder';

interface ItemCardProps {
  item: MenuItem;
  pricingResult?: ItemPricingResult;
  reviewStats?: DishReviewStats;
  currencySymbol?: string;
  logoUrl?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecrement?: (item: MenuItem) => void;
  cartQuantity?: number;
  layout?: 'list' | 'grid';
  locale?: Language | string;
  className?: string;
}

function getDishFallbackPhoto(name?: string, name_am?: string, category_id?: string): string | null {
  const combined = `${name || ''} ${name_am || ''} ${category_id || ''}`.toLowerCase();
  if (combined.includes('foul') || combined.includes('ful') || combined.includes('ፉል')) {
    return combined.includes('special') || combined.includes('ስፔሻል')
      ? '/images/dishes/ful-special.jpg'
      : '/images/dishes/full-normal-43.jpg';
  }
  if (combined.includes('checheb') || combined.includes('ጨጨብሳ')) {
    return '/images/dishes/chechebisa-51.jpg';
  }
  if (combined.includes('fetira') || combined.includes('ፈጢራ')) {
    return '/images/dishes/special-fetira.jpg';
  }
  if (combined.includes('scramble') || (combined.includes('ፍርፍር') && combined.includes('እንቁላል'))) {
    return '/images/dishes/scramble-egg-46.jpg';
  }
  if (combined.includes('omelet') || combined.includes('አምሌት')) {
    return '/images/dishes/omelet-48.jpg';
  }
  if (combined.includes('avocado toast') || combined.includes('አቮካዶ')) {
    return '/images/dishes/avocado-toast-49.jpg';
  }
  if (combined.includes('french toast') || combined.includes('ፍሬንች ቶስት')) {
    return '/images/categories/breakfast.jpg';
  }
  if (combined.includes('pan cake') || combined.includes('pancake') || combined.includes('ፓን ኬክ')) {
    return '/images/categories/dessert.jpg';
  }
  if (combined.includes('burger') || combined.includes('በርገር')) {
    return '/images/categories/burger.jpg';
  }
  if (combined.includes('pizza') || combined.includes('ፒዛ')) {
    return '/images/categories/pizza.jpg';
  }
  if (combined.includes('sandwich') || combined.includes('ሳንድች') || combined.includes('ሳንድዊች')) {
    return '/images/categories/sandwich.jpg';
  }
  if (combined.includes('wrap') || combined.includes('ሻዋርማ')) {
    return '/images/categories/wrap.jpg';
  }
  if (combined.includes('chicken') || combined.includes('ዶሮ')) {
    return '/images/categories/snacks.jpg';
  }
  if (combined.includes('pasta') || combined.includes('ፓስታ')) {
    return '/images/categories/all.jpg';
  }
  if (combined.includes('salad') || combined.includes('ሰላጣ')) {
    return '/images/categories/all.jpg';
  }
  if (combined.includes('macchiato') || combined.includes('coffee') || combined.includes('buna') || combined.includes('ቡና')) {
    return '/images/categories/hot-drink.jpg';
  }
  if (combined.includes('juice') || combined.includes('shake') || combined.includes('smoothie') || combined.includes('ጭማቂ')) {
    return '/images/categories/juice.jpg';
  }
  return null;
}

export function ItemCard({
  item,
  pricingResult,
  reviewStats,
  currencySymbol = 'ETB',
  logoUrl,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onQuickAdd,
  onDecrement,
  cartQuantity = 0,
  layout = 'list',
  locale = 'en',
  className = '',
}: ItemCardProps) {
  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  const [imageError, setImageError] = React.useState(false);

  const displayName =
    currentLocale === 'am' && item.name_am
      ? item.name_am
      : currentLocale === 'es' && item.name_es
        ? item.name_es
        : item.name;

  const displayDesc =
    currentLocale === 'am' && item.description_am
      ? item.description_am
      : currentLocale === 'es' && item.description_es
        ? item.description_es
        : item.description;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-prevent-modal')) return;
    onOpenDetails(item);
  };

  const hasOffer = pricingResult?.hasOffer ?? false;
  const originalPrice = pricingResult?.originalPrice ?? item.price;
  const finalPrice = pricingResult?.finalPrice ?? item.price;
  const savings = pricingResult?.savings ?? 0;

  const fallbackPhoto = getDishFallbackPhoto(item.name, item.name_am, item.category_id);
  const resolvedPhoto = !imageError && item.image_url ? getOptimizedCloudinaryUrl(item.image_url, 400) : fallbackPhoto;

  return (
    <article
      onClick={handleCardClick}
      className={`group relative bg-white dark:bg-[#1E1815] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg dark:hover:shadow-stone-950/40 ${
        cartQuantity > 0
          ? 'border-2 border-red-600 shadow-md ring-2 ring-red-600/20'
          : 'border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-stone-300 dark:hover:border-stone-700'
      } ${
        layout === 'grid' ? 'flex flex-col p-3 gap-2.5' : 'flex gap-3 sm:gap-3.5 p-3 sm:p-3.5'
      } ${!item.is_available ? 'opacity-60' : ''} ${className}`}
    >
      {/* Thumbnail Container */}
      <div
        className={`relative flex-shrink-0 bg-stone-50/80 dark:bg-stone-900/60 rounded-2xl overflow-hidden ${
          layout === 'grid' ? 'w-full h-36 sm:h-44 md:h-48' : 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
        }`}
      >
        {resolvedPhoto ? (
          <Image
            src={resolvedPhoto}
            alt={displayName}
            fill
            sizes={layout === 'grid' ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw' : '128px'}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <DishPlaceholder
            displayName={displayName}
            logoUrl={logoUrl}
            size={layout === 'grid' ? 'md' : 'sm'}
          />
        )}

        {/* Top-Left Pill Badge (BESTSELLER / POPULAR / SAVE 15% / FASTING) */}
        {hasOffer ? (
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
            {pricingResult?.badgeText || (currentLocale === 'am' ? 'ልዩ ቅናሽ' : 'SPECIAL')}
          </span>
        ) : item.is_chefs_pick ? (
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
            {currentLocale === 'am' ? 'የተወደደ' : 'POPULAR'}
          </span>
        ) : item.tags?.includes('fasting') ? (
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
            {currentLocale === 'am' ? 'የጾም' : 'FASTING'}
          </span>
        ) : null}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic(15);
            onToggleFavorite(item.id);
          }}
          className={`action-prevent-modal absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-red-500 text-white shadow-xs'
              : 'bg-white/80 dark:bg-[#1E1815]/80 backdrop-blur-md text-stone-600 dark:text-stone-300 hover:text-red-500 shadow-2xs border border-stone-200/50 dark:border-stone-800'
          }`}
          aria-label={`Favorite ${displayName}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Column */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3
            className={`font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-1 ${
              layout === 'grid' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
            }`}
          >
            {displayName}
          </h3>

          {displayDesc && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1 leading-relaxed">
              {displayDesc}
            </p>
          )}

          {/* Real Rating or Subtle New Dish Badge */}
          {reviewStats && reviewStats.review_count > 0 ? (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{reviewStats.average_rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">
                ({reviewStats.review_count})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-400 dark:text-stone-500">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/70 text-[10px] font-medium text-stone-600 dark:text-stone-300 border border-stone-200/50 dark:border-stone-700/40">
                <ChefHat className="w-2.5 h-2.5 text-amber-500" />
                <span>{t.newDish}</span>
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate hidden xs:inline">
                • {t.beFirstToReview}
              </span>
            </div>
          )}

          {/* Dietary tags */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {item.tags?.includes('fasting') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-600 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <Leaf className="w-2.5 h-2.5 text-emerald-500" /> {t.filterFasting || 'Fasting'}
              </span>
            )}
            {item.spice_level > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-rose-500 font-semibold border border-[var(--border)] inline-flex items-center gap-0.5" title={`Spice Level ${item.spice_level}`}>
                {Array.from({ length: Math.min(item.spice_level, 4) }).map((_, i) => (
                  <Flame key={i} className="w-2.5 h-2.5 fill-rose-500/25 text-rose-500" />
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Price & Add/Stepper Control */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]">
          <div className="flex items-baseline gap-1.5 tabular-nums">
            {hasOffer ? (
              <>
                <span className="font-extrabold text-base sm:text-lg tabular-nums" style={{ color: 'var(--primary)' }}>
                  {formatMoney(finalPrice, currencySymbol)}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] line-through tabular-nums">
                  {formatMoney(originalPrice, currencySymbol)}
                </span>
              </>
            ) : (
              <span className="font-extrabold text-base sm:text-lg tabular-nums" style={{ color: 'var(--primary)' }}>
                {formatMoney(item.price, currencySymbol)}
              </span>
            )}
          </div>

          {cartQuantity > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="action-prevent-modal flex items-center gap-1 bg-[var(--primary)] text-white rounded-full p-0.5 shadow-xs"
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onDecrement?.(item);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/20 active:scale-90 transition-transform"
                aria-label={`Remove one ${displayName}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black min-w-[16px] text-center px-0.5">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  if (item.options && item.options.length > 0) {
                    onOpenDetails(item);
                  } else {
                    onQuickAdd(item);
                  }
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/20 active:scale-90 transition-transform"
                aria-label={`Add another ${displayName}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              disabled={!item.is_available}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(18);
                if (item.options && item.options.length > 0) {
                  onOpenDetails(item);
                } else {
                  onQuickAdd(item);
                }
              }}
              className={`action-prevent-modal flex items-center justify-center text-white font-bold shadow-xs disabled:bg-neutral-400 disabled:cursor-not-allowed transition-transform active:scale-90 ${
                layout === 'grid' && (!item.options || item.options.length === 0)
                  ? 'w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 shadow-sm'
                  : 'h-8 px-2.5 sm:px-3 rounded-full gap-1 bg-red-600 hover:bg-red-700 text-xs'
              }`}
              aria-label={`Add ${displayName} to order`}
            >
              <Plus
                className={
                  layout === 'grid' && (!item.options || item.options.length === 0)
                    ? 'w-4 h-4 stroke-[2.5]'
                    : 'w-3.5 h-3.5'
                }
              />
              {!(layout === 'grid' && (!item.options || item.options.length === 0)) && (
                <span className="text-[11px] font-bold">
                  {item.options && item.options.length > 0
                    ? (currentLocale === 'am' ? 'ምርጫዎች' : 'Options')
                    : (currentLocale === 'am' ? 'አክል' : 'Add')}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
