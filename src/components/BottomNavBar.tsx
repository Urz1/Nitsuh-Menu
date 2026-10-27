'use client';

import React from 'react';
import { Utensils, Tag, Heart, Info } from 'lucide-react';
import { Language } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';

export type BottomNavTab = 'menu' | 'offers' | 'favorites' | 'info';

interface BottomNavBarProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  offersCount?: number;
  favoritesCount?: number;
  locale?: Language | string;
}

export function BottomNavBar({
  activeTab,
  onTabChange,
  offersCount = 0,
  favoritesCount = 0,
  locale = 'en',
}: BottomNavBarProps) {
  const isAm = locale === 'am';
  const isSo = locale === 'so';

  const tabs: { id: BottomNavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'menu',
      label: isAm ? 'ሜኑ' : isSo ? 'Liiska' : 'Menu',
      icon: Utensils,
    },
    {
      id: 'offers',
      label: isAm ? 'ቅናሾች' : isSo ? 'Dalabyo' : 'Offers',
      icon: Tag,
      badge: offersCount > 0 ? offersCount : undefined,
    },
    {
      id: 'favorites',
      label: isAm ? 'ተወዳጆች' : isSo ? 'Jeceyl' : 'Saved',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'info',
      label: isAm ? 'መረጃ' : isSo ? 'Xog' : 'Info',
      icon: Info,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--border)] select-none transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Bottom Navigation"
    >
      <div className="max-w-lg mx-auto h-14 sm:h-16 px-3 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onTabChange(tab.id);
              }}
              className={`relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[var(--primary)] font-bold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium'
              }`}
              aria-selected={isActive}
              aria-label={tab.label}
            >
              {/* Subtle active pill background */}
              {isActive && (
                <span
                  className="absolute inset-x-2 -top-0.5 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8px]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] tracking-tight leading-none mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
