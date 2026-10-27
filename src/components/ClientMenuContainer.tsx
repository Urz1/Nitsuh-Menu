'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Restaurant, Category, MenuItem, ItemOption, Offer, DishReview, RestaurantReviewSettings, DishReviewStats } from '@/types/database';
import { CartItem, DietaryFilter, SortOrder } from '@/types/menu';
import { MenuHeader } from './MenuHeader';
import { MenuControlBar } from './MenuControlBar';
import { SlimHeader } from './SlimHeader';
import { StickySearchBar } from './StickySearchBar';
import { CategoryScrollSpyBar } from './CategoryScrollSpyBar';
import { HeroFoodBanner } from './HeroFoodBanner';
import { BottomNavBar, BottomNavTab } from './BottomNavBar';
import { FilterSheet } from './FilterSheet';
import { RestaurantInfoModal } from './RestaurantInfoModal';
import { CategoryTabs } from './CategoryTabs';
import { FilterBar } from './FilterBar';
import { ItemCard } from './ItemCard';
import { ItemDetailModal } from './ItemDetailModal';
import { CalmOfferBanner } from './CalmOfferBanner';
import { ReviewModal } from './ReviewModal';
import { OrderBar } from './OrderBar';
import { OrderSummarySheet } from './OrderSummarySheet';
import { ServerCardModal } from './ServerCardModal';
import { ServiceAssistanceModal } from './ServiceAssistanceModal';
import { SettingsModal } from './SettingsModal';
import { AllergenLegendModal } from './AllergenLegendModal';
import { QrModal } from './QrModal';
import { applyThemeTokensToDOM } from './ThemeManager';
import { createClient } from '@/lib/supabase/client';
import { subscribeSync } from '@/lib/sync-channel';
import {
  getMenuItems,
  getMenuCategories,
  getStoredRestaurant,
  createServiceRequest,
  recordOfferInteraction,
  MOCK_OFFERS_NITSUH,
  MOCK_REVIEWS_NITSUH,
  DEFAULT_REVIEW_SETTINGS_NITSUH,
  submitDishReview,
  reportDishReview,
} from '@/lib/data-provider';
import {
  evaluateOfferSchedule,
  evaluateItemPricing,
  evaluateCartPricing,
  ItemPricingResult,
  CartPricingResult,
} from '@/lib/pricing-engine';
import { calculateDishReviewStats } from '@/lib/review-engine';
import { triggerHaptic, formatCategoryIcon } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUp, Share2, QrCode, Info, Tag, Clock, X, WifiOff, Lock, ChevronDown, Compass, BookOpen, Search, Heart, MapPin, ExternalLink, Utensils } from 'lucide-react';
import { Language, TRANSLATIONS, CATEGORY_TRANSLATIONS } from '@/lib/translations';

interface ClientMenuContainerProps {
  restaurant: Restaurant;
  categories: Category[];
  initialItems: MenuItem[];
  initialOffers?: Offer[];
  initialReviews?: DishReview[];
  initialReviewSettings?: RestaurantReviewSettings;
  initialTable?: string;
}

export function ClientMenuContainer({
  restaurant: initialRestaurant,
  categories: initialCategories,
  initialItems,
  initialOffers,
  initialReviews,
  initialReviewSettings,
  initialTable,
}: ClientMenuContainerProps) {
  // Restaurant state (updated live via sync / realtime / cache)
  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant);

  useEffect(() => {
    // Check if there are locally stored design/restaurant updates
    const stored = getStoredRestaurant(initialRestaurant.slug);
    if (stored) {
      setRestaurant(stored);
      applyThemeTokensToDOM(stored.theme_config);
    } else if (initialRestaurant.theme_config) {
      applyThemeTokensToDOM(initialRestaurant.theme_config);
    }
  }, [initialRestaurant]);

  useEffect(() => {
    if (restaurant.theme_config) {
      applyThemeTokensToDOM(restaurant.theme_config);
    }
  }, [restaurant.theme_config]);

  // Categories state (updated live via sync / realtime)
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Items state (updated in real-time via Supabase Realtime)
  const [items, setItems] = useState<MenuItem[]>(initialItems || []);

  // Sync client-side on mount from Supabase / cache to guarantee exact parity with Admin console
  useEffect(() => {
    getMenuItems(restaurant.id).then((freshItems) => {
      if (Array.isArray(freshItems)) {
        setItems(freshItems);
      }
    });
    getMenuCategories(restaurant.id).then((freshCats) => {
      if (freshCats && freshCats.length > 0) {
        setCategories(freshCats);
      }
    });
  }, [restaurant.id]);

  // Keep state updated if server props re-evaluate
  useEffect(() => {
    if (Array.isArray(initialItems)) {
      setItems(initialItems);
    }
  }, [initialItems]);

  // Offers state (updated in real-time via Supabase Realtime)
  const [offers, setOffers] = useState<Offer[]>(initialOffers || []);

  // Reviews & Settings state
  const [reviews, setReviews] = useState<DishReview[]>(initialReviews || []);
  const [reviewSettings] = useState<RestaurantReviewSettings>(
    initialReviewSettings || DEFAULT_REVIEW_SETTINGS_NITSUH
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewModalItem, setReviewModalItem] = useState<MenuItem | null>(null);
  const [sessionToken, setSessionToken] = useState<string>('guest-session-default');

  useEffect(() => {
    try {
      let token = localStorage.getItem('guest_review_session_token');
      if (!token) {
        token = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('guest_review_session_token', token);
      }
      setSessionToken(token);
    } catch {
      // Storage fallback
    }
  }, []);

  // Periodic clock tick for honest urgency & automatic offer start/expiry without refresh
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // PWA Offline detection
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // User state
  const [tableNumber, setTableNumber] = useState<string>(
    initialTable || ''
  );
  const [locale, setLocale] = useState<Language>('en');
  const [layout, setLayout] = useState<'list' | 'grid'>(
    restaurant.theme_config?.defaultLayout || 'list'
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<DietaryFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured');
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState<'continuous' | 'focused'>('continuous');

  // Favorites & Cart (Session memory)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals state
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<BottomNavTab>('menu');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
  const [isServerCardOpen, setIsServerCardOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleTabChange = (tab: BottomNavTab) => {
    setActiveTab(tab);
    if (tab === 'menu') {
      if (activeFilter === 'onOffer' || activeFilter === 'favorites') {
        setActiveFilter('all');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'offers') {
      setActiveFilter('onOffer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'favorites') {
      setActiveFilter('favorites');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'info') {
      setIsInfoModalOpen(true);
    }
  };

  // Initialize session storage on mount
  useEffect(() => {
    try {
      const savedFavs = sessionStorage.getItem(`favs_${restaurant.id}`);
      if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));

      const savedCart = sessionStorage.getItem(`cart_${restaurant.id}`);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      // Storage access check
    }
  }, [restaurant.id]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manual scroll reference
  const isManualScrollRef = useRef(false);

  // ---------------------------------------------------------------------------
  // INSTANT MULTI-TAB & PLATFORM-WIDE SYNCHRONIZATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = subscribeSync((event) => {
      if (event.type === 'ITEM_UPDATED') {
        setItems((prev) =>
          prev.map((item) => (item.id === event.item.id ? { ...item, ...event.item } : item))
        );
      } else if (event.type === 'ITEM_DELETED') {
        setItems((prev) => prev.filter((item) => item.id !== event.itemId));
      } else if (event.type === 'OFFER_UPDATED') {
        setOffers((prev) => {
          const idx = prev.findIndex((o) => o.id === event.offer.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = event.offer;
            return copy;
          }
          return [event.offer, ...prev];
        });
      } else if (event.type === 'CATEGORY_UPDATED') {
        setCategories((prev) => {
          const idx = prev.findIndex((c) => c.id === event.category.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = event.category;
            return copy;
          }
          return [...prev, event.category];
        });
      } else if (event.type === 'CATEGORY_DELETED') {
        setCategories((prev) => prev.filter((c) => c.id !== event.categoryId));
      } else if (event.type === 'CATEGORIES_REFRESH') {
        getMenuCategories(restaurant.id).then((cats) => {
          if (cats && cats.length > 0) setCategories(cats);
        });
      } else if (event.type === 'REVIEW_SUBMITTED') {
        setReviews((prev) => {
          if (prev.some((r) => r.id === event.review.id)) return prev;
          return [event.review, ...prev];
        });
      } else if (event.type === 'REVIEW_UPDATED') {
        setReviews((prev) =>
          prev.map((r) => (r.id === event.review.id ? { ...r, ...event.review } : r))
        );
      } else if (event.type === 'RESTAURANT_UPDATED') {
        if (!event.restaurant.slug || event.restaurant.slug === initialRestaurant.slug || event.restaurant.id === initialRestaurant.id) {
          setRestaurant(event.restaurant);
          applyThemeTokensToDOM(event.restaurant.theme_config);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // SUPABASE REALTIME: STREAM ITEMS & OFFERS INSTANTLY
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co') {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`menu-realtime-${restaurant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as MenuItem;
            setItems((prev) =>
              prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            );
            showToast(`Item updated: ${updated.name}`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOffer = payload.new as Offer;
            setOffers((prev) => [newOffer, ...prev]);
            showToast(`New offer live: ${newOffer.title}`);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Offer;
            setOffers((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id;
            setOffers((prev) => prev.filter((o) => o.id !== oldId));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRev = payload.new as DishReview;
            setReviews((prev) => [newRev, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRev = payload.new as DishReview;
            setReviews((prev) =>
              prev.map((r) => (r.id === updatedRev.id ? { ...r, ...updatedRev } : r))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    triggerHaptic(12);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Review Submissions
  const handlePostReview = async (data: {
    item_id: string;
    rating: number;
    tags: string[];
    comment?: string;
    photo_url?: string;
    honeypot?: string;
    submissionDurationMs: number;
  }) => {
    const res = await submitDishReview({
      ...data,
      restaurant_id: restaurant.id,
      session_token: sessionToken,
      table_number: tableNumber,
    });
    if (res.success && res.review) {
      setReviews((prev) => [res.review!, ...prev]);
      showToast('Thank you for rating this dish!');
    }
    return res;
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    await reportDishReview(reviewId, reason);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: 'reported', report_count: r.report_count + 1 } : r
      )
    );
    showToast('Review reported for moderation.');
  };

  // ---------------------------------------------------------------------------
  // 3-REVIEW THRESHOLD STATS MAPPING
  // ---------------------------------------------------------------------------
  const reviewStatsMap = useMemo(() => {
    const map = new Map<string, DishReviewStats>();
    for (const item of items) {
      map.set(
        item.id,
        calculateDishReviewStats(reviews, item.id, reviewSettings.min_reviews_threshold)
      );
    }
    return map;
  }, [items, reviews, reviewSettings.min_reviews_threshold]);
  // ---------------------------------------------------------------------------
  const restaurantTimezone = (restaurant.slug === 'nitsuh' || restaurant.slug === 'addis') ? 'Africa/Addis_Ababa' : 'UTC';

  // Evaluate which offers are currently active
  const activeOffers = useMemo(() => {
    return offers.filter((offer) => {
      const schedule = evaluateOfferSchedule(offer, currentTime, offer.timezone || restaurantTimezone);
      return schedule.isActive;
    });
  }, [offers, currentTime, restaurantTimezone]);

  // Single top calm banner: maximum of ONE calm banner at the top of the menu
  const bannerOffer = useMemo(() => {
    return activeOffers.find((o) => o.show_top_banner) || null;
  }, [activeOffers]);

  // Record view on top banner if shown
  useEffect(() => {
    if (bannerOffer) {
      recordOfferInteraction(bannerOffer.id, 'view').catch(() => { });
    }
  }, [bannerOffer]);

  // Item pricing evaluation map
  const itemPricingMap = useMemo(() => {
    const map = new Map<string, ItemPricingResult>();
    for (const item of items) {
      const result = evaluateItemPricing(item, activeOffers, {
        currentTime,
        timezone: restaurantTimezone,
      });
      map.set(item.id, result);
    }
    return map;
  }, [items, activeOffers, currentTime, restaurantTimezone]);

  // Items lookup map
  const itemsMap = useMemo(() => {
    return new Map(items.map((i) => [i.id, i]));
  }, [items]);

  // Evaluate Cart Pricing (Line-by-line savings, applied offers, free items, tax mode)
  const cartPricing = useMemo(() => {
    return evaluateCartPricing(cart, activeOffers, restaurant.tax_rate, {
      currentTime,
      timezone: restaurantTimezone,
      menuItemsMap: itemsMap,
      taxMode: restaurant.tax_mode || 'inclusive',
      currencySymbol: restaurant.currency || 'ETB',
    });
  }, [
    cart,
    activeOffers,
    restaurant.tax_rate,
    restaurant.tax_mode,
    restaurant.currency,
    currentTime,
    restaurantTimezone,
    itemsMap,
  ]);

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    options: ItemOption[],
    notes: string
  ) => {
    const addonsTotal = options.reduce((sum, o) => sum + Number(o.price || 0), 0);
    // Use effective unit price from pricing evaluation
    const pricing = itemPricingMap.get(item.id);
    const basePrice = pricing?.hasOffer ? pricing.finalPrice : item.price;
    const unitPrice = basePrice + addonsTotal;
    const optKey = options.map((o) => o.name).sort().join('|');

    // If an offer was applied, record analytics tap/order
    if (pricing?.appliedOffer) {
      recordOfferInteraction(pricing.appliedOffer.id, 'tap', pricing.savings * quantity).catch(() => { });
    }

    setCart((prev) => {
      const existing = prev.find(
        (c) => c.item.id === item.id && c.notes === notes && c.options.map((o) => o.name).sort().join('|') === optKey
      );

      let nextCart: CartItem[];
      if (existing) {
        nextCart = prev.map((c) =>
          c.cartId === existing.cartId ? { ...c, quantity: c.quantity + quantity } : c
        );
      } else {
        nextCart = [
          ...prev,
          {
            cartId: `${Date.now()}-${Math.random()}`,
            item,
            quantity,
            options,
            notes,
            unitPrice,
          },
        ];
      }

      sessionStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(nextCart));
      return nextCart;
    });

    showToast(`Added to your order: ${item.name}`);
  };

  const handleUpdateCartQty = (cartId: string, delta: number) => {
    setCart((prev) => {
      const nextCart = prev
        .map((entry) => {
          if (entry.cartId === cartId) {
            const newQty = entry.quantity + delta;
            return newQty > 0 ? { ...entry, quantity: newQty } : null;
          }
          return entry;
        })
        .filter(Boolean) as CartItem[];

      sessionStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const handleClearOrder = () => {
    setCart([]);
    sessionStorage.removeItem(`cart_${restaurant.id}`);
  };

  // Item ID -> total quantity in cart for immediate visual feedback on cards
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cart) {
      map.set(c.item.id, (map.get(c.item.id) || 0) + c.quantity);
    }
    return map;
  }, [cart]);

  const handleDecrementItem = (item: MenuItem) => {
    triggerHaptic(10);
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.id === item.id);
      if (idx === -1) return prev;
      const entry = prev[idx];
      let nextCart: CartItem[];
      if (entry.quantity > 1) {
        nextCart = prev.map((c, i) => (i === idx ? { ...c, quantity: c.quantity - 1 } : c));
      } else {
        nextCart = prev.filter((_, i) => i !== idx);
      }
      sessionStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      sessionStorage.setItem(`favs_${restaurant.id}`, JSON.stringify([...next]));
      return next;
    });
  };

  // Submit Call Server / Request
  const handleRequestService = async (type: 'waiter' | 'water' | 'cutlery' | 'bill') => {
    await createServiceRequest({
      restaurant_id: restaurant.id,
      table_number: tableNumber,
      request_type: type,
    });

    const labels: Record<string, string> = {
      waiter: 'Server assistance requested!',
      water: 'Water refill requested!',
      cutlery: 'Extra napkins and cutlery requested!',
      bill: 'The check has been requested!',
    };

    showToast(tableNumber ? `${labels[type]} for ${tableNumber}` : labels[type]);
  };

  // Banner action handler: smoothly jumps to dishes on offer
  const handleSeeOffer = (offer: Offer) => {
    recordOfferInteraction(offer.id, 'tap').catch(() => { });
    setActiveFilter('onOffer');
    setActiveCategoryId('offers');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Filtered & Sorted items computation
  // Filtered & Sorted items computation (Continuous scroll across all categories)
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.name_es && i.name_es.toLowerCase().includes(q)) ||
          i.description.toLowerCase().includes(q) ||
          (i.tags && i.tags.join(' ').toLowerCase().includes(q)) ||
          (i.allergens && i.allergens.join(' ').toLowerCase().includes(q))
      );
    }

    // Dietary & Special Filters
    if (activeFilter === 'onOffer' || activeCategoryId === 'offers') {
      result = result.filter((i) => itemPricingMap.get(i.id)?.hasOffer);
    } else if (activeFilter === 'fasting') {
      result = result.filter(
        (i) =>
          i.tags?.includes('fasting') ||
          i.tags?.includes('tsom') ||
          (i as any).is_fasting ||
          i.category_id?.includes('fasting') ||
          i.category_id === 'cat-fasting-lunch'
      );
    } else if (activeFilter === 'chefsPick') {
      result = result.filter((i) => i.is_chefs_pick);
    } else if (activeFilter === 'favorites') {
      result = result.filter((i) => favorites.has(i.id));
    } else if (activeFilter !== 'all') {
      result = result.filter((i) => i.tags?.includes(activeFilter));
    }

    // Sorting
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => {
        const priceA = itemPricingMap.get(a.id)?.finalPrice ?? a.price;
        const priceB = itemPricingMap.get(b.id)?.finalPrice ?? b.price;
        return priceA - priceB;
      });
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => {
        const priceA = itemPricingMap.get(a.id)?.finalPrice ?? a.price;
        const priceB = itemPricingMap.get(b.id)?.finalPrice ?? b.price;
        return priceB - priceA;
      });
    } else if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [items, searchQuery, activeFilter, sortOrder, favorites, itemPricingMap]);

  // Categories displayed on screen (filtered by active category or all)
  const displayedCategories = useMemo(() => {
    if (activeCategoryId === 'all') {
      return categories;
    }
    return categories.filter((c) => c.id === activeCategoryId);
  }, [categories, activeCategoryId]);

  // Gentle pairing recommendations for "Goes well with"
  const pairingItems = useMemo(() => {
    return items.filter(
      (i) =>
        i.category_id === 'cat-drinks' ||
        i.category_id === 'cat-juices' ||
        i.category_id === 'cat-desserts' ||
        i.category_id === 'cat-snacks' ||
        i.category_id === 'cat-starters'
    );
  }, [items]);

  // Category item counts for clear information scent in tabs
  const itemCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.id] = items.filter((i) => i.category_id === cat.id).length;
    }
    return counts;
  }, [categories, items]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-full max-w-lg mx-auto bg-[#FAF6F0] dark:bg-[#14100E] min-h-screen relative flex flex-col pb-28 md:shadow-2xl md:border md:border-stone-200/70 dark:md:border-stone-800/80 md:rounded-[36px] md:my-4 md:overflow-hidden transition-colors">
      {/* 0. PWA GRACEFUL OFFLINE BANNER */}
      {isOffline && (
        <div
          data-testid="pwa-offline-banner"
          className="sticky top-0 z-50 bg-[#161822]/95 backdrop-blur-md border-b border-amber-500/40 px-4 py-2 text-xs flex items-center justify-between text-amber-200 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>You're offline — showing cached menu and offline cart</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            Offline Mode
          </span>
        </div>
      )}

      {/* 1. UNIFIED SLIM STICKY HEADER & INLINE SEARCH SYSTEM */}
      <div className="sticky top-0 z-40 bg-[#FAF6F0]/95 dark:bg-[#14100E]/95 backdrop-blur-md">
        {/* 1.1 Slim Header: App-like persona with welcoming greeting */}
        <SlimHeader
          restaurant={restaurant}
          locale={locale}
          onLocaleChange={(newLocale) => {
            setLocale(newLocale);
            showToast(
              newLocale === 'am'
                ? 'ቋንቋ ወደ አማርኛ ተቀይሯል'
                : newLocale === 'so'
                  ? 'Af-Soomaali ayaa loo beddelay'
                  : 'Switched to English'
            );
          }}
          onLogoTap={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />

        {/* 1.2 Sticky Search & Filter: Inline search pill + filter button matching reference */}
        <StickySearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          locale={locale}
          onOpenFilter={() => setIsFilterSheetOpen(true)}
          activeFilterCount={
            (activeFilter !== 'all' ? 1 : 0) + (sortOrder !== 'featured' ? 1 : 0)
          }
        />
      </div>

      {/* 2. RELATABLE HERO FOOD PROMO BANNER (KFC-style appetizing billboard carousel) */}
      <HeroFoodBanner
        locale={locale}
        onSelectCategory={(catId) => {
          triggerHaptic(12);
          setActiveCategoryId(catId);
          const anchor = document.getElementById('menu-items-anchor');
          if (anchor) {
            const headerOffset = 180;
            const elementPosition = anchor.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
          }
        }}
      />

      {/* 3. STICKY REALISTIC CIRCULAR FOOD CATEGORY FILTER (Unified Cream Canvas) */}
      <div className="sticky top-[108px] z-30 bg-[#FAF6F0]/95 dark:bg-[#14100E]/95 backdrop-blur-md">
        <CategoryScrollSpyBar
          categories={categories}
          items={items}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(id) => {
            triggerHaptic(8);
            setActiveCategoryId(id);
            if (id === 'all') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              const anchor = document.getElementById('menu-items-anchor');
              if (anchor) {
                const headerOffset = 180;
                const elementPosition = anchor.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
              }
            }
          }}
          itemCounts={itemCountsByCategory}
          totalItemsCount={items.length}
          activeFilter={activeFilter}
          onToggleFasting={() => {
            const nextFilter = activeFilter === 'fasting' ? 'all' : 'fasting';
            setActiveFilter(nextFilter);
            if (nextFilter === 'fasting') {
              showToast(locale === 'am' ? 'የጾም ምግቦች ብቻ ተመርጠዋል' : 'Showing fasting dishes (meat & dairy free)');
            }
          }}
          onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
          activeFilterCount={
            (activeFilter !== 'all' ? 1 : 0) + (sortOrder !== 'featured' ? 1 : 0)
          }
          locale={locale}
        />
      </div>

      {/* 4. MAIN MENU ITEMS */}
      <main id="menu-items-anchor" className="px-4 py-4 flex-1">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-[var(--muted)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3 shadow-xs">
              {items.length === 0 ? (
                <Utensils className="w-6 h-6 text-[var(--primary)]" />
              ) : activeFilter === 'onOffer' || activeCategoryId === 'offers' ? (
                <Tag className="w-6 h-6 text-amber-500" />
              ) : activeFilter === 'favorites' ? (
                <Heart className="w-6 h-6 text-rose-500" />
              ) : (
                <Search className="w-6 h-6 text-[var(--muted)]" />
              )}
            </div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {items.length === 0
                ? 'No dishes on the menu yet'
                : activeFilter === 'onOffer' || activeCategoryId === 'offers'
                ? (TRANSLATIONS[locale]?.noActiveOffers || 'No active offers right now')
                : activeFilter === 'favorites'
                  ? (TRANSLATIONS[locale]?.noFavoritesSaved || 'No favorites saved yet')
                  : (TRANSLATIONS[locale]?.noMatchingDishes || 'No matching dishes found')}
            </h3>
            <p className="text-xs mt-1 max-w-xs mx-auto">
              {items.length === 0
                ? 'Your Neon database is active and connected. Add dishes in the Admin Console to display them here.'
                : activeFilter === 'onOffer'
                ? (TRANSLATIONS[locale]?.noActiveOffersHint || 'Check back soon for upcoming happy hours and chef specials')
                : (TRANSLATIONS[locale]?.adjustFilterHint || 'Try adjusting your search or clearing your active filters')}
            </p>
            {items.length === 0 ? (
              <a
                href="/admin"
                className="inline-block mt-4 px-5 py-2 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Go to Admin Console →
              </a>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                  setActiveCategoryId(categories[0]?.id || '');
                }}
                className="mt-4 px-5 py-2 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {TRANSLATIONS[locale]?.resetFilters || 'Reset Filters'}
              </button>
            )}
          </div>
        ) : activeFilter !== 'all' || activeCategoryId === 'offers' || searchQuery.trim().length > 0 ? (
          // Filtered list / Offers view
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                {activeFilter === 'onOffer' || activeCategoryId === 'offers' ? (
                  <Tag className="w-4 h-4 text-[var(--primary)]" />
                ) : (
                  <Compass className="w-4 h-4 text-[var(--primary)]" />
                )}
                <h2 className="text-base font-bold text-[var(--foreground)] font-brand">
                  {activeFilter === 'onOffer' || activeCategoryId === 'offers'
                    ? `${TRANSLATIONS[locale]?.dishesOnOfferCount || 'Dishes on Offer'} (${filteredItems.length})`
                    : `${TRANSLATIONS[locale]?.resultsCount || 'Results'} (${filteredItems.length})`}
                </h2>
              </div>

              {activeOffers.length > 0 && (activeFilter === 'onOffer' || activeCategoryId === 'offers') && (
                <span className="text-[11px] text-[var(--muted)]">
                  {activeOffers.length} {activeOffers.length === 1 ? 'deal running' : 'deals running'}
                </span>
              )}
            </div>

            <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  pricingResult={itemPricingMap.get(item.id)}
                  reviewStats={reviewStatsMap.get(item.id)}
                  currencySymbol={restaurant.currency}
                  logoUrl={restaurant.logo_url}
                  isFavorite={favorites.has(item.id)}
                  cartQuantity={cartQuantityMap.get(item.id) || 0}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenDetails={setSelectedDetailItem}
                  onQuickAdd={(i) => handleAddToCart(i, 1, [], '')}
                  onDecrement={handleDecrementItem}
                  layout={layout}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ) : (
          <>
            {/* Category-grouped sections (continuous stream for scroll-spy) */}
            {displayedCategories.map((cat, catIdx) => {
              const catItems = filteredItems.filter((i) => i.category_id === cat.id);
              if (catItems.length === 0) return null;

              const displayName =
                CATEGORY_TRANSLATIONS[cat.id]?.[locale]?.name ||
                (locale === 'am' && cat.name_am) ||
                (locale === 'so' && cat.name_so) ||
                (locale === 'es' && cat.name_es) ||
                cat.name;
              const displayDesc =
                CATEGORY_TRANSLATIONS[cat.id]?.[locale]?.description ||
                (locale === 'am' && cat.description_am) ||
                (locale === 'so' && cat.description_so) ||
                (locale === 'es' && cat.description_es) ||
                cat.description;

              return (
                <section key={cat.id} id={`cat-${cat.id}`} className="mb-10 scroll-mt-56">
                  <div className="mb-3 flex items-baseline justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--foreground)] font-brand flex items-center gap-2">
                        <span>{formatCategoryIcon(cat.icon, cat.name)}</span>
                        <span>{displayName}</span>
                      </h2>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{displayDesc}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--muted)]">
                      {catItems.length} {catItems.length === 1 ? 'dish' : 'dishes'}
                    </span>
                  </div>

                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
                    {catItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        pricingResult={itemPricingMap.get(item.id)}
                        reviewStats={reviewStatsMap.get(item.id)}
                        currencySymbol={restaurant.currency || 'ETB'}
                        logoUrl={restaurant.logo_url}
                        isFavorite={favorites.has(item.id)}
                        cartQuantity={cartQuantityMap.get(item.id) || 0}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenDetails={setSelectedDetailItem}
                        onQuickAdd={(i) => handleAddToCart(i, 1, [], '')}
                        onDecrement={handleDecrementItem}
                        layout={layout}
                        locale={locale}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Quick button to view all categories when a single category is filtered */}
            {activeCategoryId !== 'all' && (
              <div className="mt-4 mb-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setActiveCategoryId('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] font-bold text-xs hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95 transition-all shadow-xs"
                >
                  <Utensils className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>{locale === 'am' ? 'ሁሉንም ምግቦች አሳይ' : 'Show All Categories'} ({items.length})</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 5. FLOATING BOTTOM ORDER BAR */}
      <OrderBar
        totalItems={totalCartCount}
        subtotal={cartPricing.netSubtotal}
        totalSavings={cartPricing.totalSavings}
        currencySymbol={restaurant.currency || 'ETB'}
        locale={locale}
        onOpenOrderSheet={() => setIsOrderSheetOpen(true)}
      />

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => {
            triggerHaptic(10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-20 right-4 z-30 w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] shadow-lg flex items-center justify-center hover:bg-[var(--border)] transition-transform active:scale-95"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* 6. FOOTER */}
      <footer className="px-5 pt-8 pb-36 sm:pb-28 border-t border-[var(--border)] text-center text-xs text-[var(--muted)] flex flex-col gap-3 mt-auto">
        <h3 className="font-bold text-sm text-[var(--foreground)] font-brand">
          {restaurant.name}
        </h3>
        <p>{restaurant.hours}</p>
        {restaurant.google_maps_url ? (
          <a
            href={restaurant.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-[var(--primary)] hover:underline font-semibold"
            title="Open Nitsuh Cafe & Bakery on Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{restaurant.address}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ) : (
          <p>{restaurant.address}</p>
        )}
        <div className="flex justify-center gap-4 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
          <button onClick={() => setIsQrModalOpen(true)} className="inline-flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" />
            <span>{tableNumber ? (TRANSLATIONS[locale]?.tableQr || 'Table QR') : (TRANSLATIONS[locale]?.menuQr || 'Menu QR')}</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: restaurant.name,
                  text: restaurant.tagline,
                  url: window.location.href,
                }).catch(() => { });
              } else {
                setIsQrModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{TRANSLATIONS[locale]?.shareMenu || 'Share Menu'}</span>
          </button>
          <button onClick={() => setIsLegendModalOpen(true)} className="inline-flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>{TRANSLATIONS[locale]?.allergenGuide || 'Allergen Guide'}</span>
          </button>
        </div>
        <div className="pt-3 border-t border-[var(--border)]/50 mt-1 flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-[var(--muted)]/60">
          <Link
            href="/admin"
            className="hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[var(--border)]/30"
          >
            <Lock className="w-3 h-3 opacity-70" />
            <span>{TRANSLATIONS[locale]?.staffOwnerPortal || 'Staff & Owner Portal'}</span>
          </Link>
          <span className="hidden sm:inline-block opacity-40">•</span>
          <span className="inline-flex items-center gap-1">
            <span>Powered by</span>
            <a
              href="https://www.rhizantech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--muted)]/80 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-0.5 underline underline-offset-2 decoration-[var(--border)] hover:decoration-current"
              title="Rhizantech - Web & Digital Solutions"
            >
              <span>Rhizantech</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </span>
        </div>
      </footer>

      {/* 7. MODALS & BOTTOM SHEETS */}
      <ItemDetailModal
        item={selectedDetailItem}
        pricingResult={selectedDetailItem ? itemPricingMap.get(selectedDetailItem.id) : undefined}
        reviewStats={selectedDetailItem ? reviewStatsMap.get(selectedDetailItem.id) : undefined}
        dishReviews={
          selectedDetailItem
            ? reviews.filter((r) => r.item_id === selectedDetailItem.id && r.status === 'published')
            : []
        }
        pairingRecommendations={pairingItems}
        allItems={items}
        currencySymbol={restaurant.currency}
        logoUrl={restaurant.logo_url}
        onClose={() => setSelectedDetailItem(null)}
        onAddToCart={handleAddToCart}
        onQuickAddPairing={(pairing) => handleAddToCart(pairing, 1, [], '')}
        onOpenReviewModal={() => {
          setReviewModalItem(selectedDetailItem);
          setIsReviewModalOpen(true);
        }}
        onReportReview={handleReportReview}
        locale={locale}
      />

      {/* Review Submission Modal (< 15 seconds) */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        item={reviewModalItem}
        availableTags={reviewSettings.available_tags}
        locale={locale}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewModalItem(null);
        }}
        onSubmitReview={handlePostReview}
      />

      <OrderSummarySheet
        isOpen={isOrderSheetOpen}
        onClose={() => setIsOrderSheetOpen(false)}
        cart={cart}
        cartPricing={cartPricing}
        currencySymbol={restaurant.currency || 'ETB'}
        taxRate={restaurant.tax_rate}
        tableNumber={tableNumber}
        locale={locale}
        onUpdateQty={handleUpdateCartQty}
        onClearOrder={handleClearOrder}
        onShowWaiterCard={() => setIsServerCardOpen(true)}
        onCallServer={() => setIsServiceModalOpen(true)}
      />

      <ServerCardModal
        isOpen={isServerCardOpen}
        onClose={() => setIsServerCardOpen(false)}
        cart={cart}
        tableNumber={tableNumber}
        restaurantName={restaurant.name}
        currencySymbol={restaurant.currency || 'ETB'}
        taxRate={restaurant.tax_rate}
        locale={locale}
      />

      <ServiceAssistanceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        tableNumber={tableNumber}
        onRequestService={handleRequestService}
        locale={locale}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        locale={locale}
        onLocaleChange={(loc: string) => setLocale(loc as Language)}
        wifiInfo={restaurant.wifi_config}
      />

      <AllergenLegendModal
        isOpen={isLegendModalOpen}
        onClose={() => setIsLegendModalOpen(false)}
        locale={locale}
      />

      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        restaurantName={restaurant.name}
        tableNumber={tableNumber}
        locale={locale}
      />

      {/* Category Directory Modal / Drawer */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsCategoryDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--border)] p-5 shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250">
            <div className="w-12 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)] font-brand flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--primary)]" />
                  <span>{TRANSLATIONS[locale]?.browseCategories || 'Menu Directory'}</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {categories.length} categories • {items.length} dishes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close category directory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Directory Cards */}
            <div className="overflow-y-auto flex-1 mt-3 flex flex-col gap-2 pr-1">
              {/* All Categories Option (Lists entire menu) */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  setActiveCategoryId('all');
                  if (activeFilter === 'onOffer') setActiveFilter('all');
                  setIsCategoryDrawerOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${activeCategoryId === 'all' && activeFilter !== 'onOffer'
                    ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.08)] shadow-xs font-bold'
                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted)]'
                  }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[var(--primary)]">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-bold truncate ${activeCategoryId === 'all' && activeFilter !== 'onOffer'
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--foreground)]'
                        }`}
                    >
                      {TRANSLATIONS[locale]?.allCategories || 'All Categories'}
                    </div>
                    <div className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">
                      {items.length} {locale === 'am' ? 'ምግቦች በሙሉ' : 'total dishes across all categories'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] flex-shrink-0 ml-2">
                  {items.length}
                </span>
              </button>

              {activeOffers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(12);
                    setActiveCategoryId('offers');
                    setActiveFilter('onOffer');
                    setIsCategoryDrawerOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${activeCategoryId === 'offers' || activeFilter === 'onOffer'
                      ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--background)] hover:border-amber-400'
                    }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-amber-500">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 truncate">
                        {TRANSLATIONS[locale]?.specialOffer || 'Special Offers & Deals'}
                      </div>
                      <div className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">
                        {activeOffers.length} {activeOffers.length === 1 ? 'deal live right now' : 'deals live right now'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300 flex-shrink-0 ml-2">
                    {activeOffers.length}
                  </span>
                </button>
              )}
              {categories.map((cat) => {
                const isSelected = activeCategoryId === cat.id && activeFilter !== 'onOffer';
                const translatedName =
                  CATEGORY_TRANSLATIONS[cat.id]?.[locale]?.name ||
                  (locale === 'am' && cat.name_am) ||
                  (locale === 'so' && cat.name_so) ||
                  (locale === 'es' && cat.name_es) ||
                  cat.name;
                const translatedDesc =
                  CATEGORY_TRANSLATIONS[cat.id]?.[locale]?.description ||
                  (locale === 'am' && cat.description_am) ||
                  (locale === 'so' && cat.description_so) ||
                  (locale === 'es' && cat.description_es) ||
                  cat.description;
                const count = itemCountsByCategory[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      setActiveCategoryId(cat.id);
                      if (activeFilter === 'onOffer') setActiveFilter('all');
                      setIsCategoryDrawerOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${isSelected
                        ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.08)] shadow-xs'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted)]'
                      }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{formatCategoryIcon(cat.icon, cat.name)}</span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-bold truncate ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                            }`}
                        >
                          {translatedName}
                        </div>
                        <div className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">
                          {translatedDesc}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] flex-shrink-0 ml-2">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 8. MOBILE BOTTOM NAVIGATION BAR */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        offersCount={activeOffers.length}
        favoritesCount={favorites.size}
        cartCount={totalCartCount}
        onOpenCart={() => setIsOrderSheetOpen(true)}
        locale={locale}
      />

      {/* 9. UNIFIED FILTER & SORT BOTTOM SHEET */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        activeFilter={activeFilter}
        onFilterChange={(newFilter) => {
          setActiveFilter(newFilter);
          if (newFilter === 'onOffer') setActiveTab('offers');
          else if (newFilter === 'favorites') setActiveTab('favorites');
          else setActiveTab('menu');
        }}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        layout={layout}
        onLayoutChange={setLayout}
        offersCount={activeOffers.length}
        locale={locale}
      />

      {/* 10. CONSOLIDATED RESTAURANT INFO SHEET (WIFI, HOURS, ALLERGENS, MAP, THEME) */}
      <RestaurantInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        restaurant={restaurant}
        tableNumber={tableNumber}
        locale={locale}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--foreground)] text-[var(--background)] px-4 py-2.5 rounded-full text-xs font-bold shadow-xl animate-toast flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
