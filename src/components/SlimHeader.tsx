'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/database';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import Image from 'next/image';
import { Sun, Moon, Utensils, Tag, Heart, Info, ShoppingBag } from 'lucide-react';
import { BottomNavTab } from './BottomNavBar';

interface SlimHeaderProps {
  restaurant: Restaurant;
  locale: Language;
  onLocaleChange: (lang: Language) => void;
  onLogoTap?: () => void;
  activeTab?: BottomNavTab;
  onTabChange?: (tab: BottomNavTab) => void;
  offersCount?: number;
  favoritesCount?: number;
  cartCount?: number;
  cartSubtotal?: number;
  currencySymbol?: string;
  onOpenCart?: () => void;
  onOpenInfo?: () => void;
}

export function SlimHeader({
  restaurant,
  locale,
  onLocaleChange,
  onLogoTap,
  activeTab = 'menu',
  onTabChange,
  offersCount = 0,
  favoritesCount = 0,
  cartCount = 0,
  cartSubtotal = 0,
  currencySymbol = 'ETB',
  onOpenCart,
  onOpenInfo,
}: SlimHeaderProps) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const isAm = locale === 'am';
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

  return (
    <header className="bg-transparent border-0 transition-colors select-none pt-2.5 pb-1">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5">
        {/* Left: Brand Logo Lockup with Inline Live Status */}
        <div className="min-w-0 flex items-center gap-2.5">
          <h1 className="m-0 p-0 leading-none flex items-center">
            <button
              type="button"
              onClick={handleTapLogo}
              title={`${restaurant.name} • Tap to scroll to top`}
              aria-label={`${restaurant.name} logo`}
              className="cursor-pointer active:scale-95 transition-transform flex items-center py-0.5"
            >
              <span className="sr-only">{restaurant.name}</span>
              {/* Light Mode Official Full Logo */}
              <Image
                src="/images/brand/nitsuh-full-logo.png"
                alt={restaurant.name}
                width={124}
                height={42}
                className="h-8 sm:h-9 w-auto object-contain dark:hidden pointer-events-none"
                priority
              />
              {/* Dark Mode Official Full Logo */}
              <Image
                src="/images/brand/nitsuh-full-logo-dark.png"
                alt={restaurant.name}
                width={124}
                height={42}
                className="h-8 sm:h-9 w-auto object-contain hidden dark:block pointer-events-none"
                priority
              />
            </button>
          </h1>

          {/* Inline Live Status Pill */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
              restaurant.is_open
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25'
                : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                restaurant.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{restaurant.is_open ? t.openNow : t.closed}</span>
          </span>
        </div>

        {/* Center: Desktop Navigation Links (Hidden on mobile) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Desktop primary navigation">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onTabChange('menu');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{isAm ? 'ሜኑ' : 'Menu'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onTabChange('offers');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isAm ? 'ቅናሾች' : 'Offers'}</span>
              {offersCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'offers' ? 'bg-white text-red-600' : 'bg-amber-400 text-black'
                  }`}
                >
                  {offersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onTabChange('favorites');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{isAm ? 'የተወደዱ' : 'Saved'}</span>
              {favoritesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'favorites'
                      ? 'bg-white text-red-600'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            {onOpenInfo && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onOpenInfo();
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{isAm ? 'ስለ ካፌው' : 'About'}</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Controls: Desktop Cart + Dark/Light Mode + Language Switcher */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Desktop Cart Button */}
          {onOpenCart && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onOpenCart();
              }}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
              aria-label="View Order Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {cartCount > 0
                  ? `${cartCount} • ${formatMoney(cartSubtotal, currencySymbol)}`
                  : isAm
                  ? 'ትዕዛዝ'
                  : 'My Order'}
              </span>
            </button>
          )}

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
          </div>
        </div>
      </div>
    </header>
  );
}
