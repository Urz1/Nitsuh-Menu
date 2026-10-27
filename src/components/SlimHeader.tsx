'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/database';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';

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
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Detect current theme mode on mount
  useEffect(() => {
    const current =
      document.documentElement.getAttribute('data-mode') ||
      (typeof window !== 'undefined' && localStorage.getItem('nitsuh-theme-mode')) ||
      'light';
    setThemeMode(current === 'dark' ? 'dark' : 'light');
  }, []);

  const handleToggleTheme = () => {
    triggerHaptic(12);
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    const root = document.documentElement;
    root.setAttribute('data-mode', next);
    if (next === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('nitsuh-theme-mode', next);
    } catch {
      // ignore
    }
  };

  const handleTapLogo = () => {
    triggerHaptic(15);
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
      <div className="max-w-4xl mx-auto px-3.5 flex items-center justify-between gap-2">
        {/* Left: Full Brand Logo Lockup + Greeting + Live Status */}
        <div className="min-w-0 flex-1 flex flex-col items-start">
          <p className="text-[10px] sm:text-[11px] font-semibold text-stone-500 dark:text-stone-400 leading-none truncate mb-1">
            {greeting}
          </p>

          <button
            type="button"
            onClick={handleTapLogo}
            title={`${restaurant.name} • Tap to scroll to top`}
            aria-label={`${restaurant.name} logo`}
            className="cursor-pointer active:scale-95 transition-transform flex items-center"
          >
            {/* Light Mode Official Full Logo */}
            <Image
              src="/images/brand/nitsuh-full-logo.png"
              alt={restaurant.name}
              width={130}
              height={44}
              className="h-8 sm:h-9 w-auto object-contain dark:hidden pointer-events-none"
              priority
            />
            {/* Dark Mode Official Full Logo (Crisp warm-white typography) */}
            <Image
              src="/images/brand/nitsuh-full-logo-dark.png"
              alt={restaurant.name}
              width={130}
              height={44}
              className="h-8 sm:h-9 w-auto object-contain hidden dark:block pointer-events-none"
              priority
            />
          </button>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-1">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{restaurant.is_open ? t.openNow : t.closed}</span>
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="truncate">
              {restaurant.branch_name ? restaurant.branch_name.split('—')[0].trim() : 'Cafeteria & Bakery'}
            </span>
          </div>
        </div>

        {/* Right Controls: Dark/Light Mode Toggle + Floating Language Switcher Pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Quick Sun/Moon Theme Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#1E1815] border border-stone-200/70 dark:border-stone-800 text-stone-600 dark:text-amber-400 flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Floating Language Switcher Pill */}
          <div className="flex items-center bg-white dark:bg-[#1E1815] border border-stone-200/70 dark:border-stone-800 rounded-full p-0.5 text-xs font-bold shadow-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onLocaleChange('en');
              }}
              className={`px-2 py-1 rounded-full transition-all text-xs font-bold ${
                locale === 'en'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
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
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
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
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              aria-label="Switch to Somali"
            >
              SO
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
