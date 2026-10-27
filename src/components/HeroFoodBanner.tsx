'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/lib/utils';
import { Language } from '@/lib/translations';

interface BannerSlide {
  id: string;
  badge: { en: string; am: string; so: string };
  title: { en: string; am: string; so: string };
  description: { en: string; am: string; so: string };
  cta: { en: string; am: string; so: string };
  imageUrl: string;
  bgGradient: string;
  accentColor: string;
  targetCategoryId: string;
}

// 100% Authentic Slides Grounded in Nitsuh's Real Menu & Real Database Offers
const AUTHENTIC_HERO_SLIDES: BannerSlide[] = [
  {
    id: 'slide-breakfast-ful',
    badge: {
      en: 'MORNING SIGNATURES',
      am: 'ትኩስ የጠዋት ቁርስ',
      so: 'QURAAC CASRI AH',
    },
    title: {
      en: 'AUTHENTIC FUL SPECIAL',
      am: 'ትኩስ ፉል ስፔሻል እና ጨጨብሳ',
      so: 'FOOL GAAR AH IYO CHECHEBSA',
    },
    description: {
      en: 'Slow-simmered fava beans seasoned with spiced butter, eggs, diced tomatoes & fresh bread.',
      am: 'ቀንዎን በሚያረካ ፉል ስፔሻል፣ ቅቤ የገባበት ጨጨብሳ እና ትኩስ መኪያቶ ይጀምሩ።',
      so: 'Ku bilow subaxaada fool macaan oo lagu daray ukun, yaanyo iyo rooti cusub.',
    },
    cta: {
      en: 'Explore Breakfast',
      am: 'ቁርስ ይመልከቱ',
      so: 'Fiiri Quraacda',
    },
    imageUrl: '/images/dishes/ful-special.jpg',
    bgGradient: 'from-[#4A200B] via-[#6E3010] to-[#2E1205]',
    accentColor: '#F59E0B',
    targetCategoryId: 'cat-breakfast',
  },
  {
    id: 'slide-pizza-happy-hour',
    badge: {
      en: '20% OFF HAPPY HOUR',
      am: 'የከሰዓት 20% ቅናሽ በፒዛ',
      so: '20% QIIMO DHIMIS PIZZA',
    },
    title: {
      en: 'HANDCRAFTED ARTISAN PIZZAS',
      am: 'ጣፋጭ የእጅ ስራ ፒዛዎች',
      so: 'PIZZA CASRI AH OO CARAF LEH',
    },
    description: {
      en: 'Enjoy 20% off all artisan pizzas freshly baked in our kitchen with melted mozzarella & toppings.',
      am: 'በኩሽናችን ትኩስ ሆነው የተጋገሩ ፒዛዎች ላይ የ20% ቅናሽ ይደሰቱ።',
      so: 'Ku raaxayso 20% qiimo dhimis dhammaan pizzada cusub ee lagu dubo foornadeena.',
    },
    cta: {
      en: 'View Pizzas (20% Off)',
      am: 'ፒዛዎችን ይመልከቱ',
      so: 'Fiiri Pizzada',
    },
    imageUrl: '/images/categories/pizza.jpg',
    bgGradient: 'from-[#7A1C0E] via-[#9E2612] to-[#3B0C05]',
    accentColor: '#C11221',
    targetCategoryId: 'cat-pizzas',
  },
  {
    id: 'slide-mendi-special',
    badge: {
      en: '100 ETB OFF SPECIAL',
      am: '100 ብር ቅናሽ በመንዲ ላይ',
      so: '100 ETB QIIMO DHIMIS MENDI',
    },
    title: {
      en: 'AUTHENTIC SPECIAL MENDI',
      am: 'ልዩ ትኩስ መንዲ',
      so: 'MENDI GAAR AH OO CARAF LEH',
    },
    description: {
      en: 'Slow-cooked tender spiced meat served over aromatic basmati rice with house dipping sauces.',
      am: 'በጥንቃቄ የተዘጋጀ ለስላሳ ስጋ ከጥሩ የባስማቲ ሩዝ እና ማጣፈጫ መረቅ ጋር።',
      so: 'Hilib jilicsan oo lagu kariyey bariis caraf leh iyo suugo macaan.',
    },
    cta: {
      en: 'Order Mendi (Save 100 ETB)',
      am: 'መንዲ ይዘዙ',
      so: 'Dalbo Mendi',
    },
    imageUrl: '/images/dishes/special-mendi.jpg',
    bgGradient: 'from-[#5A380A] via-[#7A4D0E] to-[#2B1B04]',
    accentColor: '#D97706',
    targetCategoryId: 'cat-mendi',
  },
  {
    id: 'slide-cakes-bakery',
    badge: {
      en: 'BAKED FRESH DAILY',
      am: 'ትኩስ ከዳቦ ቤታችን',
      so: 'MAALIN WALBA CUSUB',
    },
    title: {
      en: 'BLACK FOREST & FRESH CAKES',
      am: 'ብላክ ፎረስት እና ለስላሳ ኬኮች',
      so: 'KEEG CUSUB IYO DAHAB',
    },
    description: {
      en: 'Handcrafted daily in our in-house pastry bakery using real cream, rich chocolate & fresh fruit.',
      am: 'በየቀኑ በእኛ ካፌ የተጋገሩ ምርጥ ኬኮች፣ ብላክ ፎረስት እና ጣፋጭ መክሰሶች።',
      so: 'Keegyo macaan oo maalin kasta lagu dubo khubarada rootiga ee Nitsuh.',
    },
    cta: {
      en: 'View Cakes & Bakery',
      am: 'ኬኮችን ይመልከቱ',
      so: 'Fiiri Keegyada',
    },
    imageUrl: '/images/dishes/black-forest-2.jpg',
    bgGradient: 'from-[#48121E] via-[#631828] to-[#24080F]',
    accentColor: '#E11D48',
    targetCategoryId: 'cat-soft-cake',
  },
];

interface HeroFoodBannerProps {
  locale?: Language | string;
  onSelectCategory?: (categoryId: string) => void;
}

export function HeroFoodBanner({ locale = 'en', onSelectCategory }: HeroFoodBannerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const lang = (locale as 'en' | 'am' | 'so') || 'en';
  const validLang = lang === 'am' || lang === 'so' ? lang : 'en';

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
        setCurrentIdx((prev) => (prev + 1) % AUTHENTIC_HERO_SLIDES.length);
      }, 5500);
    };

    startTimer();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const activeSlide = AUTHENTIC_HERO_SLIDES[currentIdx];

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
        setCurrentIdx((prev) => (prev + 1) % AUTHENTIC_HERO_SLIDES.length);
      } else if (diff < -45) {
        // Swiped right
        triggerHaptic(6);
        setCurrentIdx((prev) => (prev - 1 + AUTHENTIC_HERO_SLIDES.length) % AUTHENTIC_HERO_SLIDES.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full px-3.5 pt-3 pb-1 select-none">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleAction}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${activeSlide.bgGradient} p-4 sm:p-5 text-white shadow-xl cursor-pointer transition-all duration-500 active:scale-[0.99] border border-white/10`}
      >
        {/* Subtle decorative glow & circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-black/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Left Text Column */}
          <div className="flex-1 min-w-0 pr-1">
            {/* Kicker badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/35 backdrop-blur-xs border border-white/15 text-[10px] font-extrabold tracking-wider uppercase text-amber-300 mb-1.5 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{activeSlide.badge[validLang]}</span>
            </div>

            {/* Big Bold Headline */}
            <h2 className="text-base sm:text-xl font-black tracking-tight leading-tight uppercase font-brand line-clamp-2 text-white drop-shadow-xs">
              {activeSlide.title[validLang]}
            </h2>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm text-white/85 mt-1 line-clamp-2 leading-relaxed font-medium">
              {activeSlide.description[validLang]}
            </p>

            {/* CTA Button */}
            <div className="mt-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white font-extrabold text-xs shadow-lg hover:bg-red-700 active:scale-95 transition-all border border-white/25">
                <span>{activeSlide.cta[validLang]}</span>
                <span className="w-4 h-4 rounded-full bg-white text-red-600 flex items-center justify-center">
                  <ArrowRight className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              </span>
            </div>
          </div>

          {/* Right Hero Food Showcase */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.4)] ring-2 ring-white/25 bg-white/5 transition-transform duration-300">
              <Image
                src={activeSlide.imageUrl}
                alt={activeSlide.title.en}
                fill
                sizes="(max-width: 640px) 128px, 160px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-1 border-t border-white/10">
          {AUTHENTIC_HERO_SLIDES.map((slide, idx) => (
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
