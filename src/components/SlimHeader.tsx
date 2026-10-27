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

  return (
    <header className="bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors select-none">
      <div className="max-w-4xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Identity: Logo + Name + Status */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleTapLogo}
            title={`${restaurant.name} • Tap to scroll to top`}
            aria-label={`${restaurant.name} logo`}
            className={`relative w-9 h-9 rounded-xl overflow-hidden shadow-xs flex-shrink-0 cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-90 ${
              isAnimating ? 'animate-logo-playful' : ''
            }`}
          >
            <Image
              src={restaurant.logo_url || '/images/brand/nitsuh-gold-squircle.svg'}
              alt={restaurant.name}
              width={36}
              height={36}
              className="w-full h-full object-cover pointer-events-none"
              unoptimized
            />
            {/* Shimmer sweep */}
            <span
              className={`absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full ${
                isAnimating ? 'animate-logo-sheen' : ''
              }`}
            />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base leading-tight truncate text-[var(--foreground)] font-brand">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-medium">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></span>
                <span>{restaurant.is_open ? t.openNow : t.closed}</span>
              </span>
              <span className="text-neutral-300 dark:text-neutral-700 select-none">•</span>
              <span className="text-[11px] truncate">
                {restaurant.branch_name ? restaurant.branch_name.split('—')[0].trim() : 'Cafeteria & Bakery'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Language Toggle (EN | አማ | SO) */}
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-full p-0.5 text-xs font-bold shadow-2xs flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onLocaleChange('en');
            }}
            className={`px-2.5 py-1 rounded-full transition-all text-xs font-bold ${
              locale === 'en'
                ? 'bg-[var(--primary)] text-white shadow-2xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
            className={`px-2.5 py-1 rounded-full transition-all text-xs font-bold ${
              locale === 'am'
                ? 'bg-[var(--primary)] text-white shadow-2xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
            className={`px-2 py-1 rounded-full transition-all text-[11px] font-bold ${
              locale === 'so'
                ? 'bg-[var(--primary)] text-white shadow-2xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
