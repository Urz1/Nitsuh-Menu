'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, Flame } from 'lucide-react';
import { triggerHaptic } from '@/lib/utils';
import { Language } from '@/lib/translations';

interface BannerSlide {
  id: string;
  badge: { en: string; am: string };
  title: { en: string; am: string };
  description: { en: string; am: string };
  cta: { en: string; am: string };
  imageUrl: string;
  bgGradient: string;
  accentColor: string;
  targetCategoryId: string;
}

// 100% Authentic Slides Grounded in Nitsuh's Real Menu
const AUTHENTIC_HERO_SLIDES: BannerSlide[] = [
  {
    id: 'slide-breakfast-ful',
    badge: {
      en: 'MORNING SIGNATURES',
      am: 'ትኩስ የጠዋት ቁርስ',
    },
    title: {
      en: 'AUTHENTIC FUL SPECIAL',
      am: 'ትኩስ ፉል ስፔሻል እና ጨጨብሳ',
    },
    description: {
      en: 'Slow-simmered fava beans seasoned with spiced butter, eggs, diced tomatoes & fresh bread.',
      am: 'ቀንዎን በሚያረካ ፉል ስፔሻል፣ ቅቤ የገባበት ጨጨብሳ እና ትኩስ መኪያቶ ይጀምሩ።',
    },
    cta: {
      en: 'Explore Breakfast',
      am: 'ቁርስ ይመልከቱ',
    },
    imageUrl: '/images/dishes/ful-special.jpg',
    bgGradient: 'from-[#4A200B] via-[#6E3010] to-[#2E1205]',
    accentColor: '#F59E0B',
    targetCategoryId: 'cat-breakfast',
  },
  {
    id: 'slide-nitsuh-burger',
    badge: {
      en: 'SIGNATURE SPECIAL',
      am: 'ልዩ የበርገር ምርጫ',
    },
    title: {
      en: 'NITSUH SPECIAL BURGER',
      am: 'ንፁህ ስፔሻል በርገር',
    },
    description: {
      en: 'Handcrafted double beef patty, melted double cheese, fried egg, house mayo & golden fries.',
      am: 'ድርብ ስጋ፣ ድርብ ቺዝ፣ እንቁላል፣ የቤት ማዮኔዝ እና ጥርት ያለ ፍሬንች ፍራይስ።',
    },
    cta: {
      en: 'Explore Burgers',
      am: 'በርገር ይመልከቱ',
    },
    imageUrl: '/images/categories/burger.jpg',
    bgGradient: 'from-[#5A200A] via-[#7B2E10] to-[#2E1005]',
    accentColor: '#E65100',
    targetCategoryId: 'cat-burger',
  },
  {
    id: 'slide-pizza-artisan',
    badge: {
      en: 'OVEN FRESH',
      am: 'ትኩስ ከምድጃ',
    },
    title: {
      en: 'HANDCRAFTED ARTISAN PIZZAS',
      am: 'ጣፋጭ የእጅ ስራ ፒዛዎች',
    },
    description: {
      en: 'Baked fresh in our kitchen with rich tomato sauce, melted mozzarella cheese & savory toppings.',
      am: 'በኩሽናችን ትኩስ ሆነው በሞዛሬላ ቺዝ፣ ምርጥ ቲማቲም ሶስ እና ልዩ ቅመሞች የተጋገሩ።',
    },
    cta: {
      en: 'Explore Pizzas',
      am: 'ፒዛዎችን ይመልከቱ',
    },
    imageUrl: '/images/categories/pizza.jpg',
    bgGradient: 'from-[#7A1C0E] via-[#9E2612] to-[#3B0C05]',
    accentColor: '#C11221',
    targetCategoryId: 'cat-pizza',
  },
  {
    id: 'slide-sweets-bakery',
    badge: {
      en: 'HANDCRAFTED SWEETS',
      am: 'ጣፋጮች እና ኬኮች',
    },
    title: {
      en: 'PASTRIES & TORTAS BY KG',
      am: 'ጣፋጭ ኬኮች እና ኬክ በኪሎ',
    },
    description: {
      en: 'Fresh mini custard cakes, donuts, croissants, and celebration tortas by the kilogram.',
      am: 'በየቀኑ የሚጋገሩ ሚኒ ኬኮች፣ ዶናት፣ ክሮሳንት እና ለዝግጅት የሚሆኑ ኬኮች በኪሎ።',
    },
    cta: {
      en: 'Explore Desserts',
      am: 'ጣፋጮችን ይመልከቱ',
    },
    imageUrl: '/images/categories/dessert.jpg',
    bgGradient: 'from-[#48121E] via-[#631828] to-[#24080F]',
    accentColor: '#E11D48',
    targetCategoryId: 'cat-desserts',
  },
];

import { Offer } from '@/types/database';

interface HeroFoodBannerProps {
  locale?: Language | string;
  offers?: Offer[];
  onSelectCategory?: (categoryId: string) => void;
}

export function HeroFoodBanner({ locale = 'en', offers = [], onSelectCategory }: HeroFoodBannerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const lang = (locale as 'en' | 'am') || 'en';
  const validLang = lang === 'am' ? 'am' : 'en';

  // Construct dynamic slides: combine live active offers from database with authentic product showcases
  const slides = React.useMemo<BannerSlide[]>(() => {
    const liveOfferSlides: BannerSlide[] = (offers || [])
      .filter((o) => !o.is_paused && o.status === 'live')
      .slice(0, 3)
      .map((o) => ({
        id: `slide-offer-${o.id}`,
        badge: {
          en: o.badge_text || 'SPECIAL OFFER',
          am: 'ልዩ ቅናሽ',
        },
        title: {
          en: o.title,
          am: o.title,
        },
        description: {
          en: o.description || 'Exclusive limited-time special offer at Nitsuh Cafe & Restaurant.',
          am: o.description || 'ልዩ የቅናሽ ምርጫ በንፁህ ካፌ እና ሬስቶራንት።',
        },
        cta: {
          en: o.banner_link_text || 'View Offer',
          am: 'ቅናሹን ይመልከቱ',
        },
        imageUrl: '/images/categories/burger.jpg',
        bgGradient: 'from-[#6B1800] via-[#8B2200] to-[#3A0A00]',
        accentColor: '#F59E0B',
        targetCategoryId: 'offers',
      }));

    return liveOfferSlides.length > 0 ? [...liveOfferSlides, ...AUTHENTIC_HERO_SLIDES] : AUTHENTIC_HERO_SLIDES;
  }, [offers]);

  // Keep currentIdx valid if slides change
  useEffect(() => {
    if (currentIdx >= slides.length) {
      setCurrentIdx(0);
    }
  }, [slides.length, currentIdx]);

  // Clear any legacy dismissed flag from previous sessions so banner always displays
  useEffect(() => {
    try {
      sessionStorage.removeItem('nitsuh_hero_banner_dismissed');
    } catch {
      // ignore
    }
  }, []);

  // Auto-advance slides every 5.5s
  useEffect(() => {
    const startTimer = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % slides.length);
      }, 5500);
    };

    startTimer();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length]);

  const activeSlide = slides[currentIdx] || slides[0] || AUTHENTIC_HERO_SLIDES[0];

  const handleAction = () => {
    triggerHaptic(12);
    if (onSelectCategory && activeSlide.targetCategoryId) {
      onSelectCategory(activeSlide.targetCategoryId);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        // Swiped left
        triggerHaptic(6);
        setCurrentIdx((prev) => (prev + 1) % slides.length);
      } else if (diff < -45) {
        // Swiped right
        triggerHaptic(6);
        setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full px-3.5 sm:px-6 lg:px-8 pt-3 pb-1 select-none">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleAction}
        className={`relative overflow-hidden rounded-3xl md:rounded-4xl bg-gradient-to-br ${activeSlide.bgGradient} p-4 sm:p-6 md:p-8 lg:p-10 text-white shadow-xl cursor-pointer transition-all duration-500 active:scale-[0.99] border border-white/10`}
      >
        {/* Subtle decorative glow & circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 md:w-80 md:h-80 bg-white/10 rounded-full blur-2xl md:blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 md:w-64 md:h-64 bg-black/20 rounded-full blur-xl md:blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4 md:gap-8">
          {/* Left Text Column */}
          <div className="flex-1 min-w-0 pr-1 md:pr-4">
            {/* Kicker badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3.5 md:py-1 rounded-full bg-black/35 backdrop-blur-xs border border-white/15 text-[10px] md:text-xs font-extrabold tracking-wider uppercase text-amber-300 mb-1.5 md:mb-3 shadow-2xs">
              <Flame className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-amber-400" />
              <span>{activeSlide.badge[validLang]}</span>
            </div>

            {/* Big Bold Headline */}
            <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight uppercase line-clamp-2 text-white drop-shadow-xs">
              {activeSlide.title[validLang]}
            </h2>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm md:text-base text-white/85 mt-1 md:mt-2 line-clamp-2 md:line-clamp-3 leading-relaxed font-medium max-w-2xl">
              {activeSlide.description[validLang]}
            </p>

            {/* CTA Button */}
            <div className="mt-3 md:mt-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2.5 rounded-full bg-red-600 text-white font-extrabold text-xs md:text-sm shadow-lg hover:bg-red-700 active:scale-95 transition-all border border-white/25">
                <span>{activeSlide.cta[validLang]}</span>
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white text-red-600 flex items-center justify-center">
                  <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 stroke-[3]" />
                </span>
              </span>
            </div>
          </div>

          {/* Right Hero Food Showcase */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-3xl md:rounded-4xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.4)] ring-2 md:ring-4 ring-white/25 bg-white/5 transition-transform duration-300">
              <Image
                src={activeSlide.imageUrl}
                alt={activeSlide.title.en}
                fill
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 224px, 256px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-1 border-t border-white/10">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(6);
                setCurrentIdx(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIdx === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
