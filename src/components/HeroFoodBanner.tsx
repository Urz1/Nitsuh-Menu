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

const HERO_SLIDES: BannerSlide[] = [
  {
    id: 'slide-combos',
    badge: {
      en: 'LIMITED TIME COMBO',
      am: 'ልዩ ጥምር አቅርቦት',
      so: 'DALAB XADDIDAN',
    },
    title: {
      en: 'CRISPY. JUICY. IRRESISTIBLE.',
      am: 'ጥርት ያለና የሚጣፍጥ በርገር',
      so: 'BURGER CARAF LEH OO MACAAN',
    },
    description: {
      en: 'Handcrafted gourmet burgers served with seasoned fries & cold drink.',
      am: 'በጥንቃቄ የተዘጋጀ ምርጥ በርገር ከቺፕስ እና ቀዝቃዛ መጠጥ ጋር።',
      so: 'Burger macaan oo lagu daray baradho shiilan iyo cabitaan qabow.',
    },
    cta: {
      en: 'Order Now',
      am: 'አሁን ይዘዙ',
      so: 'Dalbo Hadda',
    },
    imageUrl: '/images/dishes/special-burger.jpg',
    bgGradient: 'from-[#7F0E17] via-[#9B111E] to-[#40070B]',
    accentColor: '#C11221',
    targetCategoryId: 'cat-burgers',
  },
  {
    id: 'slide-pizza',
    badge: {
      en: 'AFTERNOON HAPPY HOUR',
      am: 'የከሰዓት ልዩ ቅናሽ',
      so: 'QIIMO DHIMIS GALABNIMO',
    },
    title: {
      en: 'WOOD-FIRED ARTISAN PIZZAS',
      am: 'ጣፋጭ የእንጨት ምድጃ ፒዛዎች',
      so: 'PIZZA CASRI AH OO CARAF LEH',
    },
    description: {
      en: '20% off all crispy sourdough pizzas & freshly squeezed juices.',
      am: '20% ቅናሽ በሁሉም ጣፋጭ ፒዛዎች እና ትኩስ የተፈጥሮ ጭማቂዎች ላይ።',
      so: '20% qiimo dhimis dhammaan pizza iyo cabitaannada dabiiciga ah.',
    },
    cta: {
      en: 'View Pizzas',
      am: 'ፒዛዎችን ይመልከቱ',
      so: 'Fiiri Pizzada',
    },
    imageUrl: '/images/dishes/woodfired-pizza.jpg',
    bgGradient: 'from-[#8C2C0B] via-[#B83E10] to-[#3B1104]',
    accentColor: '#D97706',
    targetCategoryId: 'cat-pizzas',
  },
  {
    id: 'slide-breakfast',
    badge: {
      en: 'MORNING SIGNATURES',
      am: 'ትኩስ የጠዋት ቁርስ',
      so: 'QURAAC CASRI AH',
    },
    title: {
      en: 'AUTHENTIC FUL & CHECHEBSA',
      am: 'ትኩስ ፉል፣ ጨጨብሳ እና መኪያቶ',
      so: 'FOOL, CHECHEBSA IYO QAXWE',
    },
    description: {
      en: 'Start your morning with rich Ethiopian breakfast & single-origin coffee.',
      am: 'ቀንዎን በሚያረካ ፉል፣ ቅቤ የገባበት ጨጨብሳ እና ምርጥ መኪያቶ ይጀምሩ።',
      so: 'Ku bilow subaxaada quraac macaan iyo qaxwe caraf leh.',
    },
    cta: {
      en: 'Explore Breakfast',
      am: 'ቁርስ ይመልከቱ',
      so: 'Fiiri Quraacda',
    },
    imageUrl: '/images/dishes/chechebisa-51.jpg',
    bgGradient: 'from-[#5F370E] via-[#7B4612] to-[#2B1806]',
    accentColor: '#F59E0B',
    targetCategoryId: 'cat-breakfast',
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
        setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 5500);
    };

    startTimer();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const activeSlide = HERO_SLIDES[currentIdx];

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
        setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
      } else if (diff < -45) {
        // Swiped right
        triggerHaptic(6);
        setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
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
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-white/95 active:scale-95 transition-transform">
                <span>{activeSlide.cta[validLang]}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </div>
          </div>

          {/* Right Image Showcase */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black/20 transform rotate-1 hover:rotate-0 transition-transform">
              <Image
                src={activeSlide.imageUrl}
                alt={activeSlide.title.en}
                fill
                sizes="(max-width: 640px) 100px, 130px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-1 border-t border-white/10">
          {HERO_SLIDES.map((slide, idx) => (
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
