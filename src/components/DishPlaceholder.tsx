'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UtensilsCrossed } from 'lucide-react';

interface DishPlaceholderProps {
  displayName: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DishPlaceholder({
  displayName,
  logoUrl = '/images/brand/nitsuh-gold-squircle.svg',
  size = 'md',
  className = '',
}: DishPlaceholderProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const activeLogo = !logoFailed && logoUrl ? logoUrl : '/images/brand/nitsuh-gold-squircle.svg';

  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-br from-[var(--surface)] via-[var(--card)] to-[var(--surface)] text-center p-2 ${className}`}
    >
      {/* Subtle ambient brand watermark in background */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] dark:opacity-[0.07] scale-125 rotate-[-10deg]"
        aria-hidden="true"
      >
        <Image
          src="/images/brand/nitsuh-clean-emblem.svg"
          alt=""
          width={180}
          height={180}
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Centerpiece: Brand Logo + Overlapping Culinary Fork & Knife Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative inline-block">
          {/* Logo container */}
          <div
            className={`overflow-hidden shadow-xs ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-200 group-hover:scale-105 ${
              isLg
                ? 'w-14 h-14 rounded-2xl shadow-sm'
                : isSm
                  ? 'w-8 h-8 rounded-lg'
                  : 'w-10 h-10 rounded-xl'
            }`}
          >
            <Image
              src={activeLogo}
              alt="Nitsuh Brand"
              width={isLg ? 56 : isSm ? 32 : 40}
              height={isLg ? 56 : isSm ? 32 : 40}
              className="w-full h-full object-cover"
              onError={() => setLogoFailed(true)}
              unoptimized
            />
          </div>

          {/* Overlapping Culinary Fork & Knife Badge */}
          <div
            className={`absolute -bottom-1 -right-1 rounded-full flex items-center justify-center bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] shadow-2xs ${
              isLg
                ? 'w-6 h-6 border-[1.5px]'
                : isSm
                  ? 'w-4 h-4'
                  : 'w-4.5 h-4.5'
            }`}
            title="Nitsuh Kitchen Dish"
            aria-hidden="true"
          >
            <UtensilsCrossed className={isLg ? 'w-3 h-3' : isSm ? 'w-2 h-2' : 'w-2.5 h-2.5'} />
          </div>
        </div>

        {/* Dish Name */}
        <span
          className={`font-semibold text-[var(--foreground)]/90 tracking-tight line-clamp-1 max-w-full px-1.5 ${
            isLg
              ? 'mt-2.5 text-base font-bold text-[var(--foreground)]'
              : isSm
                ? 'mt-1 text-[10px]'
                : 'mt-1.5 text-[11px]'
          }`}
        >
          {displayName}
        </span>

        {/* Extra subtitle on large detail modal hero */}
        {isLg && (
          <span className="text-[11px] font-medium text-[var(--muted-foreground)] tracking-wider uppercase mt-0.5">
            Nitsuh Kitchen Dish
          </span>
        )}
      </div>
    </div>
  );
}
