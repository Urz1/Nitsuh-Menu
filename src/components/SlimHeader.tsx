'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/database';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';
import Image from 'next/image';

interface SlimHeaderProps {
  restaurant: Restaurant;
  locale: Language;
  onLocaleChange: (lang: Language) => void;
  onLogoTap?: () => void;
}

export function SlimHeader({
  restaurant,
  locale,
  onLocaleChange,
  onLogoTap,
}: SlimHeaderProps) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const [isAnimating, setIsAnimating] = useState(false);

  // Playful occasional micro-animation on logo
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 900);
      return () => clearTimeout(timer);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleTapLogo = () => {
    triggerHaptic(15);
    setIsAnimating(false);
    requestAnimationFrame(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 900);
    });
    if (onLogoTap) {
      onLogoTap();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const greeting =
    locale === 'am'
      ? 'ሰላም፣ እንኳን ደህና መጡ! 👋'
      : locale === 'so'
        ? 'Ku soo dhawoow Nitsuh! 👋'
        : 'Hello, Food Lover! 👋';

  return (
    <header className="bg-transparent border-0 transition-colors select-none pt-2 pb-1">
      <div className="max-w-4xl mx-auto px-3.5 flex items-center justify-between gap-2.5">
        {/* Left: App-Style Rounded Square Brand Icon */}
        <button
          type="button"
          onClick={handleTapLogo}
          title={`${restaurant.name} • Tap to scroll to top`}
          aria-label={`${restaurant.name} logo`}
          className="w-11 h-11 bg-white rounded-2xl shadow-xs border border-stone-200/70 flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90 transition-transform overflow-hidden p-1.5"
        >
          <Image
            src={restaurant.logo_url || '/images/brand/nitsuh-gold-squircle.svg'}
            alt={restaurant.name}
            width={32}
            height={32}
            className="w-full h-full object-cover pointer-events-none rounded-xl"
            unoptimized
          />
        </button>

        {/* Center: Welcoming Persona + Brand Name + Branch */}
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-semibold text-stone-500 leading-none truncate">
            {greeting}
          </p>
          <h1 className="font-black text-base sm:text-lg tracking-wider text-red-600 font-brand uppercase leading-tight mt-0.5 truncate">
            {restaurant.name}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 font-medium">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{restaurant.is_open ? t.openNow : t.closed}</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="truncate">
              {restaurant.branch_name ? restaurant.branch_name.split('—')[0].trim() : 'Cafeteria & Bakery'}
            </span>
          </div>
        </div>

        {/* Right: Floating White Language Switcher Pill */}
        <div className="flex items-center bg-white border border-stone-200/70 rounded-full p-0.5 text-xs font-bold shadow-xs flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onLocaleChange('en');
            }}
            className={`px-2 py-1 rounded-full transition-all text-xs font-bold ${
              locale === 'en'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            aria-label="Switch to English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onLocaleChange('am');
            }}
            className={`px-2 py-1 rounded-full transition-all text-xs font-bold ${
              locale === 'am'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            aria-label="Switch to Amharic"
          >
            አማ
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onLocaleChange('so');
            }}
            className={`px-1.5 py-1 rounded-full transition-all text-[11px] font-bold ${
              locale === 'so'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            aria-label="Switch to Somali"
          >
            SO
          </button>
        </div>
      </div>
    </header>
  );
}
