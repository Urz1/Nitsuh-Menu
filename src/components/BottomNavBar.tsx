import React from 'react';
import { Utensils, Tag, Heart, Info, ShoppingBag } from 'lucide-react';
import { Language } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';

export type BottomNavTab = 'menu' | 'offers' | 'orders' | 'favorites' | 'info';

interface BottomNavBarProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  offersCount?: number;
  favoritesCount?: number;
  cartCount?: number;
  onOpenCart?: () => void;
  locale?: Language | string;
}

export function BottomNavBar({
  activeTab,
  onTabChange,
  offersCount = 0,
  favoritesCount = 0,
  cartCount = 0,
  onOpenCart,
  locale = 'en',
}: BottomNavBarProps) {
  const isAm = locale === 'am';

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-white/95 dark:bg-[#1E1815]/95 backdrop-blur-md border-t border-x border-stone-200/60 dark:border-stone-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] select-none transition-colors rounded-t-3xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Bottom Navigation"
    >
      <div className="w-full h-16 px-4 flex items-center justify-between relative">
        {/* 1. Menu Tab */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            onTabChange('menu');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-95 ${
            activeTab === 'menu'
              ? 'text-red-600 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
          }`}
          aria-label="Menu"
        >
          <Utensils className={`w-5 h-5 ${activeTab === 'menu' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] tracking-tight leading-none mt-0.5">
            {isAm ? 'ሜኑ' : 'Menu'}
          </span>
        </button>

        {/* 2. Offers Tab */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            onTabChange('offers');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-95 relative ${
            activeTab === 'offers'
              ? 'text-red-600 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
          }`}
          aria-label="Offers"
        >
          <div className="relative">
            <Tag className={`w-5 h-5 ${activeTab === 'offers' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            {offersCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white bg-red-600 flex items-center justify-center shadow-xs">
                {offersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight leading-none mt-0.5">
            {isAm ? 'ቅናሾች' : 'Offers'}
          </span>
        </button>

        {/* 3. Center Elevated Floating Red Cart/Orders Button (KFC App Signature Style) */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(12);
              if (onOpenCart) {
                onOpenCart();
              } else {
                onTabChange('orders');
              }
            }}
            className="w-13 h-13 -mt-6 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-lg border-4 border-[#FAF6F0] dark:border-[#14100E] active:scale-90 transition-transform relative cursor-pointer hover:bg-red-700"
            aria-label="View Order / Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.4px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
                {cartCount}
              </span>
            )}
          </button>
          <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 tracking-tight leading-none mt-1">
            {isAm ? 'ትዕዛዝ' : 'Orders'}
          </span>
        </div>

        {/* 4. Saved / Favorites Tab */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            onTabChange('favorites');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-95 relative ${
            activeTab === 'favorites'
              ? 'text-red-600 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
          }`}
          aria-label="Saved Dishes"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'fill-current text-red-600 stroke-[2px]' : 'stroke-[1.8px]'}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white bg-red-600 flex items-center justify-center shadow-xs">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight leading-none mt-0.5">
            {isAm ? 'ተወዳጆች' : 'Saved'}
          </span>
        </button>

        {/* 5. Info Tab */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            onTabChange('info');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-95 ${
            activeTab === 'info'
              ? 'text-red-600 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
          }`}
          aria-label="Info"
        >
          <Info className={`w-5 h-5 ${activeTab === 'info' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] tracking-tight leading-none mt-0.5">
            {isAm ? 'መረጃ' : 'Info'}
          </span>
        </button>
      </div>
    </nav>
  );
}
