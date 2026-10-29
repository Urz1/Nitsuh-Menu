'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Restaurant } from '@/types/database';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';
import { Search } from 'lucide-react';

interface DraggableMenuSheetProps {
  restaurant: Restaurant;
  locale: Language;
  onLocaleChange: (lang: Language) => void;
  fullHeaderContent: React.ReactNode;
  sheetHeaderContent: React.ReactNode;
  children: React.ReactNode;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
}

export function DraggableMenuSheet({
  restaurant,
  locale,
  onLocaleChange,
  fullHeaderContent,
  sheetHeaderContent,
  children,
  searchInputRef,
  className = '',
}: DraggableMenuSheetProps) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  // Refs for layout measurement and gesture tracking
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const activeAnimationRef = useRef<{ stop: () => void } | null>(null);

  // Viewport-relative snap points
  const [expandedY, setExpandedY] = useState<number>(72);
  const [collapsedY, setCollapsedY] = useState<number>(360);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // Motion value for vertical sheet translation (starts off-screen for SSR)
  const y = useMotionValue(1200);

  // Derive normalized progress p: 0 = collapsed, 1 = expanded
  const p = useTransform(y, [collapsedY, expandedY], [0, 1]);

  // Full header linked transforms
  const headerOpacity = useTransform(p, [0, 1], [1, 0]);
  const headerScale = useTransform(p, [0, 1], [1, 0.96]);
  const headerTranslateY = useTransform(p, [0, 1], [0, -24]);

  // Compact top bar linked transform (appears near expanded position)
  const compactBarOpacity = useTransform(p, [0.6, 1], [0, 1]);

  // ---------------------------------------------------------------------------
  // 1. MEASURE VIEWPORT-RELATIVE SNAP POINTS
  // ---------------------------------------------------------------------------
  const updateSnapPoints = useCallback(() => {
    if (typeof window === 'undefined') return;

    const vh = window.innerHeight || 800;

    // Measure safe-area top
    let safeAreaTop = 0;
    try {
      const computed = getComputedStyle(document.documentElement).getPropertyValue('--safe-top');
      if (computed) safeAreaTop = parseInt(computed, 10) || 0;
    } catch {}

    const newExpandedY = safeAreaTop + 64;

    // Measure full header height with ref
    const headerHeight = headerRef.current?.offsetHeight || 160;
    const rawCollapsed = headerHeight + 16;

    // Clamp between 30% and 45% of 100dvh
    const minCollapsed = vh * 0.30;
    const maxCollapsed = vh * 0.45;
    const newCollapsedY = Math.max(minCollapsed, Math.min(maxCollapsed, rawCollapsed));

    setExpandedY(newExpandedY);
    setCollapsedY(newCollapsedY);

    return { expanded: newExpandedY, collapsed: newCollapsedY };
  }, []);

  // Recalculate snap points on mount & resize
  useEffect(() => {
    const snaps = updateSnapPoints();
    const handleResize = () => updateSnapPoints();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [updateSnapPoints]);

  // Synchronize isExpanded boolean with motion value
  useEffect(() => {
    const unsubscribe = y.on('change', (latest) => {
      const mid = (collapsedY + expandedY) / 2;
      setIsExpanded(latest < mid);
    });
    return () => unsubscribe();
  }, [y, collapsedY, expandedY]);

  // ---------------------------------------------------------------------------
  // 2. ENTRANCE ANIMATION (ON LOAD)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const snaps = updateSnapPoints() || { expanded: 72, collapsed: 360 };
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check session storage flag
    let hasEntered = false;
    try {
      hasEntered = sessionStorage.getItem('nitsuh_menu_sheet_entered_v1') === 'true';
    } catch {}

    if (hasEntered || prefersReducedMotion) {
      y.set(snaps.collapsed);
      return;
    }

    // Set server off-screen position below viewport
    const vh = window.innerHeight || 800;
    y.set(vh + 100);

    // Start 180ms after first paint
    const timer = setTimeout(() => {
      setIsInteracting(true);
      const anim = animate(y, snaps.collapsed, {
        type: 'spring',
        stiffness: 260,
        damping: 28,
        mass: 0.9,
        onComplete: () => {
          setIsInteracting(false);
          activeAnimationRef.current = null;
        },
      });
      activeAnimationRef.current = anim;

      try {
        sessionStorage.setItem('nitsuh_menu_sheet_entered_v1', 'true');
      } catch {}
    }, 180);

    return () => {
      clearTimeout(timer);
      activeAnimationRef.current?.stop();
    };
  }, [updateSnapPoints, y]);

  // ---------------------------------------------------------------------------
  // 3. SPRING RELEASE PHYSICS & SNAP FUNCTION
  // ---------------------------------------------------------------------------
  const snapTo = useCallback(
    (targetY: number) => {
      setIsInteracting(true);
      activeAnimationRef.current?.stop();

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        y.set(targetY);
        setIsInteracting(false);
        return;
      }

      const anim = animate(y, targetY, {
        type: 'spring',
        stiffness: 380,
        damping: 32,
        mass: 0.75,
        onComplete: () => {
          setIsInteracting(false);
          activeAnimationRef.current = null;
        },
      });
      activeAnimationRef.current = anim;
    },
    [y]
  );

  const touchStartY = useRef<number>(0);
  const initialMotionY = useRef<number>(0);
  const isDraggingSheet = useRef<boolean>(false);
  const wasDraggedRef = useRef<boolean>(false);
  const touchHistory = useRef<Array<{ y: number; time: number }>>([]);
  const dragSource = useRef<'handle' | 'chips' | 'grid' | null>(null);

  // Toggle between collapsed and expanded
  const handleToggleSheet = useCallback(() => {
    if (wasDraggedRef.current) return;
    triggerHaptic(10);
    const target = isExpanded ? collapsedY : expandedY;
    snapTo(target);
  }, [isExpanded, collapsedY, expandedY, snapTo]);

  // Compact bar search tap: collapse sheet and focus search input
  const handleCompactSearchClick = useCallback(() => {
    triggerHaptic(10);
    snapTo(collapsedY);
    setTimeout(() => {
      searchInputRef?.current?.focus();
    }, 250);
  }, [collapsedY, searchInputRef, snapTo]);

  const handleTouchStart = useCallback(
    (e: TouchEvent | React.TouchEvent | PointerEvent | React.PointerEvent, source: 'handle' | 'chips' | 'grid') => {
      // Interrupt running animation immediately
      if (activeAnimationRef.current) {
        activeAnimationRef.current.stop();
        activeAnimationRef.current = null;
      }

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      touchStartY.current = clientY;
      initialMotionY.current = y.get();
      isDraggingSheet.current = false;
      wasDraggedRef.current = false;
      dragSource.current = source;
      touchHistory.current = [{ y: clientY, time: Date.now() }];
    },
    [y]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent | React.TouchEvent | PointerEvent | React.PointerEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - touchStartY.current;

      // Track recent points for velocity projection
      const now = Date.now();
      touchHistory.current.push({ y: clientY, time: now });
      if (touchHistory.current.length > 5) touchHistory.current.shift();

      const scroller = scrollerRef.current;
      const isGridSource = dragSource.current === 'grid';

      // Check if gesture should control the sheet:
      // 1. From handle or chips region: always drags sheet
      // 2. When collapsed: always drags sheet
      // 3. When expanded from grid: only drags sheet if scrolled to top (scrollTop <= 0) and dragging downward (deltaY > 0)
      if (isGridSource && isExpanded) {
        if (!scroller || scroller.scrollTop > 0) {
          // Normal grid scroll continues
          return;
        }
        if (deltaY <= 0 && !isDraggingSheet.current) {
          // Swiping up while at top should scroll grid down into content
          return;
        }
      }

      // Small threshold (6px) before counting as a drag so taps aren't swallowed
      if (!isDraggingSheet.current && Math.abs(deltaY) > 6) {
        isDraggingSheet.current = true;
        wasDraggedRef.current = true;
        setIsInteracting(true);
      }

      if (!isDraggingSheet.current) return;

      // Prevent native pull-to-refresh
      if (e.cancelable) {
        e.preventDefault();
      }

      const rawTargetY = initialMotionY.current + deltaY;

      // Apply rubber-banding beyond bounds (30% resistance, capped at 40px)
      let clampedY = rawTargetY;
      if (rawTargetY < expandedY) {
        const extra = expandedY - rawTargetY;
        clampedY = expandedY - Math.min(40, extra * 0.3);
      } else if (rawTargetY > collapsedY) {
        const extra = rawTargetY - collapsedY;
        clampedY = collapsedY + Math.min(40, extra * 0.3);
      }

      y.set(clampedY);
    },
    [expandedY, collapsedY, isExpanded, y]
  );

  const handleTouchEnd = useCallback(() => {
    dragSource.current = null;
    if (!isDraggingSheet.current) {
      setIsInteracting(false);
      return;
    }

    isDraggingSheet.current = false;
    if (wasDraggedRef.current) {
      setTimeout(() => {
        wasDraggedRef.current = false;
      }, 250);
    }

    // Calculate finger velocity vy in px/s from recent history
    let vy = 0;
    if (touchHistory.current.length >= 2) {
      const first = touchHistory.current[0];
      const last = touchHistory.current[touchHistory.current.length - 1];
      const dt = (last.time - first.time) / 1000;
      if (dt > 0.002) {
        vy = (last.y - first.y) / dt;
      }
    }

    const currentY = y.get();
    const projectedTarget = currentY + vy * 0.2;

    // Snap decision:
    // 1. If |vy| > 700px/s, fling direction wins
    // 2. Otherwise snap to nearest snap point to projected landing point
    let targetSnap: number;
    if (Math.abs(vy) > 700) {
      targetSnap = vy < -700 ? expandedY : collapsedY;
    } else {
      const distToExpanded = Math.abs(projectedTarget - expandedY);
      const distToCollapsed = Math.abs(projectedTarget - collapsedY);
      targetSnap = distToExpanded < distToCollapsed ? expandedY : collapsedY;
    }

    snapTo(targetSnap);
  }, [expandedY, collapsedY, snapTo, y]);

  // Attach global touch listeners to scroller for unified handoff
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onTouchStart = (e: TouchEvent) => handleTouchStart(e, 'grid');
    const onTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const onTouchEnd = () => handleTouchEnd();

    scroller.addEventListener('touchstart', onTouchStart, { passive: true });
    scroller.addEventListener('touchmove', onTouchMove, { passive: false });
    scroller.addEventListener('touchend', onTouchEnd, { passive: true });
    scroller.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      scroller.removeEventListener('touchstart', onTouchStart);
      scroller.removeEventListener('touchmove', onTouchMove);
      scroller.removeEventListener('touchend', onTouchEnd);
      scroller.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Window pointer listeners for desktop mouse dragging
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (dragSource.current) {
        handleTouchMove(e);
      }
    };
    const onPointerUp = () => {
      if (dragSource.current) {
        handleTouchEnd();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div className={`relative w-full max-w-lg mx-auto min-h-screen bg-[var(--background)] overflow-hidden ${className}`}>
      {/* ----------------------------------------------------------------- */}
      {/* 1. COMPACT TOP BAR (Sits above the sheet at expanded position)     */}
      {/* ----------------------------------------------------------------- */}
      <motion.header
        style={{
          opacity: compactBarOpacity,
          height: `${expandedY}px`,
        }}
        className="fixed top-0 left-0 right-0 max-w-lg mx-auto z-30 px-3.5 flex items-center justify-between bg-[var(--card)] border-b border-[var(--border)] transition-colors select-none pointer-events-auto"
        aria-hidden={!isExpanded}
      >
        {/* Compact Logo & Cafe Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-[var(--border)] flex-shrink-0 bg-[var(--surface)]">
            {restaurant.logo_url ? (
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                fill
                sizes="28px"
                className="object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center font-bold text-xs text-[var(--primary)]">
                {restaurant.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="font-brand font-bold text-sm text-[var(--foreground)] truncate">
            {restaurant.name}
          </span>
        </div>

        {/* Compact Actions: Search Button (collapses sheet & focuses search) & Language Picker */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCompactSearchClick}
            className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--border)] transition-colors active:scale-95 cursor-pointer"
            aria-label="Search menu"
          >
            <Search className="w-4 h-4 text-[var(--primary)]" />
          </button>

          {/* Segmented language buttons */}
          <div className="flex items-center bg-[var(--surface)] p-0.5 rounded-lg border border-[var(--border)] text-[11px] font-semibold">
            {(['en', 'am'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onLocaleChange(lang);
                }}
                className={`px-1.5 py-0.5 rounded-md transition-colors ${
                  locale === lang
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {lang === 'en' ? 'EN' : 'አማ'}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* ----------------------------------------------------------------- */}
      {/* 2. BACKGROUND LAYER: FULL HEADER (Fixed to top of viewport)        */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        ref={headerRef}
        style={{
          opacity: headerOpacity,
          scale: headerScale,
          y: headerTranslateY,
        }}
        className="fixed top-0 left-0 right-0 max-w-lg mx-auto z-10 select-none pointer-events-auto"
      >
        {fullHeaderContent}
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. FOREGROUND LAYER: DRAGGABLE BOTTOM SHEET                        */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        ref={sheetRef}
        style={{
          y,
          willChange: isInteracting ? 'transform' : 'auto',
          height: `calc(100dvh - ${expandedY}px)`,
        }}
        className="fixed left-0 right-0 max-w-lg mx-auto z-20 bg-[var(--background)] rounded-t-[32px] border-t border-[var(--border)] flex flex-col shadow-sm select-none"
      >
        {/* Drag Pill Handle */}
        <button
          type="button"
          data-handle="true"
          onClick={handleToggleSheet}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleSheet();
            }
          }}
          onTouchStart={(e) => handleTouchStart(e, 'handle')}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            handleTouchStart(e.nativeEvent, 'handle');
          }}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? locale === 'am'
                ? 'ዝርዝሩን ሰብስብ'
                : 'Collapse menu'
              : locale === 'am'
                ? 'ዝርዝሩን ዘርጋ'
                : 'Expand menu'
          }
          style={{ touchAction: 'none' }}
          className="w-full flex justify-center items-center py-2.5 cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-t-[32px]"
        >
          <div className="w-10 h-1.5 rounded-full bg-[var(--muted-foreground)]/40 hover:bg-[var(--muted-foreground)]/70 transition-colors" />
        </button>

        {/* Sheet Header Region: Category Chips (horizontal scroll) & Banner */}
        <div
          onTouchStart={(e) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('button, input, a, [role="button"]')) return;
            handleTouchStart(e, 'chips');
          }}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const target = e.target as HTMLElement | null;
            if (target?.closest('button, input, a, [role="button"]')) return;
            handleTouchStart(e.nativeEvent, 'chips');
          }}
          style={{ touchAction: 'pan-x' }}
          className="flex-shrink-0"
        >
          {sheetHeaderContent}
        </div>

        {/* 2-Column Dish Grid Scroller */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-x-hidden px-4 py-3 pb-32"
          style={{
            overflowY: isExpanded ? 'auto' : 'hidden',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
