'use client';

import React from 'react';
import Image from 'next/image';
import { MenuItem, DishReviewStats } from '@/types/database';
import { ItemPricingResult } from '@/lib/pricing-engine';
import { formatMoney, triggerHaptic, getOptimizedCloudinaryUrl } from '@/lib/utils';
import { Heart, Plus, Minus, Tag, Clock, Star, ChefHat, Salad, Sprout, Leaf, WheatOff, ShieldCheck, Flame, UtensilsCrossed } from 'lucide-react';
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
  if (combined.includes('wrap') || combined.includes('shawarma') || combined.includes('ሻዋርማ')) {
    return '/images/categories/wrap.jpg';
  }
  if (combined.includes('tibs') || combined.includes('ጥብስ')) {
    return '/images/dishes/chikina-tibs-131.jpg';
  }
  if (combined.includes('shiro') || combined.includes('ሽሮ')) {
    return '/images/dishes/shiro.jpg';
  }
  if (combined.includes('chicken') || combined.includes('ዶሮ')) {
    return '/images/dishes/1-2-roasted-chicken-141.jpg';
  }
  if (combined.includes('mendi') || combined.includes('መንዲ')) {
    return '/images/dishes/special-mendi.jpg';
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
}: ItemCardProps) {
  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  const [imageError, setImageError] = React.useState(false);

  const displayName =
    currentLocale === 'am' && item.name_am
      ? item.name_am
      : currentLocale === 'so' && item.name_so
        ? item.name_so
        : currentLocale === 'es' && item.name_es
          ? item.name_es
          : item.name;

  const displayDesc =
    currentLocale === 'am' && item.description_am
      ? item.description_am
      : currentLocale === 'so' && item.description_so
        ? item.description_so
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
      className={`group relative bg-white dark:bg-[var(--card)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
        cartQuantity > 0
          ? 'border-2 border-red-600 shadow-xs ring-1 ring-red-600/20'
          : 'border border-stone-200/80 dark:border-[var(--border)] hover:border-stone-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
      } ${
        layout === 'grid' ? 'flex flex-col p-2.5 gap-2' : 'flex gap-3 sm:gap-3.5 p-3 sm:p-3.5'
      } ${!item.is_available ? 'opacity-60' : ''}`}
    >
      {/* Thumbnail Container */}
      <div
        className={`relative flex-shrink-0 bg-stone-50 dark:bg-[var(--surface)] rounded-xl overflow-hidden border border-stone-100 dark:border-[var(--border)]/40 ${
          layout === 'grid' ? 'w-full h-32' : 'w-24 h-24 sm:w-28 sm:h-28'
        }`}
      >
        {resolvedPhoto ? (
          <Image
            src={resolvedPhoto}
            alt={displayName}
            fill
            sizes={layout === 'grid' ? '(max-width: 480px) 50vw, 220px' : '112px'}
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

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic(15);
            onToggleFavorite(item.id);
          }}
          className={`action-prevent-modal absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          aria-label={`Favorite ${displayName}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Column */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Badges (Offer / Chef's Pick / Sold Out / Urgency) */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {hasOffer && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1 shadow-2xs"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{pricingResult?.badgeText || t.specialOffer}</span>
              </span>
            )}
            {hasOffer && savings > 0 && !pricingResult?.badgeText?.toLowerCase().includes('off') && !pricingResult?.badgeText?.includes(String(Math.round(savings))) && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                {t.saveAmount} {formatMoney(savings, currencySymbol)}
              </span>
            )}
            {pricingResult?.urgencyText && (
              <span suppressHydrationWarning className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 inline-flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span suppressHydrationWarning>{pricingResult.urgencyText}</span>
              </span>
            )}
            {item.is_chefs_pick && !hasOffer && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 inline-flex items-center gap-1">
                <ChefHat className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{t.chefsPick}</span>
              </span>
            )}
            {!item.is_available && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {t.soldOut}
              </span>
            )}
            {/* 3-Review Threshold */}
            {reviewStats?.is_threshold_met && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-current text-amber-500" />
                <span>{reviewStats.average_rating.toFixed(1)}</span>
                <span className="text-[9px] opacity-75 font-normal">({reviewStats.review_count})</span>
              </span>
            )}
          </div>

          <h3
            className={`font-bold text-[var(--foreground)] leading-snug ${
              layout === 'grid' ? 'text-base truncate' : 'text-base sm:text-lg line-clamp-2'
            }`}
          >
            {displayName}
          </h3>

          {displayDesc && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
              {displayDesc}
            </p>
          )}

          {/* Dietary tags */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {item.tags?.includes('fasting') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-600 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <Salad className="w-2.5 h-2.5 text-emerald-500" /> Tsom
              </span>
            )}
            {item.tags?.includes('vegetarian') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-600 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <Sprout className="w-2.5 h-2.5 text-emerald-500" /> Veg
              </span>
            )}
            {item.tags?.includes('vegan') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-700 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <Leaf className="w-2.5 h-2.5 text-emerald-600" /> Vegan
              </span>
            )}
            {item.tags?.includes('gluten-free') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-amber-700 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <WheatOff className="w-2.5 h-2.5 text-amber-500" /> GF
              </span>
            )}
            {item.tags?.includes('halal') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-neutral-700 dark:text-neutral-300 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> Halal
              </span>
            )}
            {item.spice_level > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-rose-500 font-semibold border border-[var(--border)] inline-flex items-center gap-0.5">
                {Array.from({ length: Math.min(item.spice_level, 3) }).map((_, i) => (
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
                  {item.options && item.options.length > 0 ? 'Options' : 'Add'}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
