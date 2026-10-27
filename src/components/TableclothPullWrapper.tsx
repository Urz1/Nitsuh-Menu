'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';

interface TableclothPullWrapperProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  className?: string;
  locale?: string;
}

export const TableclothPullWrapper: React.FC<TableclothPullWrapperProps> = ({
  children,
  onRefresh,
  className = '',
  locale = 'en',
}) => {
  // Drag and animation states
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSnapping, setIsSnapping] = useState<boolean>(false);
  const [isEntering, setIsEntering] = useState<boolean>(true);
  const [handVisible, setHandVisible] = useState<boolean>(true);
  const [refreshTriggered, setRefreshTriggered] = useState<boolean>(false);

  // References to keep touch gesture tracking accurate without re-render lag
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isTouchActiveRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // 1. PAGE LOAD ENTRANCE ANIMATION (The Hand pulls the tablecloth into place)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Check if reduced motion is requested
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsEntering(false);
      setHandVisible(false);
      return;
    }

    // Start with tablecloth slightly displaced downwards
    setDragOffset(115);
    setHandVisible(true);
    setIsEntering(true);

    // Initial brief hold, then smoothly pull tablecloth into exact position
    const pullTimer = setTimeout(() => {
      // Pull upward to 0px (resting position)
      setDragOffset(0);

      // Once arrived at resting position (~850ms), hand releases and slides up
      const releaseTimer = setTimeout(() => {
        triggerHaptic(12);
        setIsEntering(false);

        // Hand slides upward out of screen
        const hideHandTimer = setTimeout(() => {
          setHandVisible(false);
        }, 400);

        return () => clearTimeout(hideHandTimer);
      }, 850);

      return () => clearTimeout(releaseTimer);
    }, 120);

    return () => clearTimeout(pullTimer);
  }, []);

  // ---------------------------------------------------------------------------
  // 2. INTERACTIVE DRAG-BACK (User pulls tablecloth down / drags back)
  // ---------------------------------------------------------------------------
  const handleTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    // Only allow pulling when scrolled to the very top
    if (window.scrollY > 4 || isEntering) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    currentYRef.current = clientY;
    isTouchActiveRef.current = true;
    setRefreshTriggered(false);
  }, [isEntering]);

  const handleTouchMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isTouchActiveRef.current || isEntering) return;
    if (window.scrollY > 4) {
      isTouchActiveRef.current = false;
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    currentYRef.current = clientY;
    const rawDeltaY = clientY - startYRef.current;

    // Only activate on downward drag
    if (rawDeltaY > 0) {
      // Prevent default browser rubber-band / page reload while dragging the tablecloth
      if (e.cancelable && 'touches' in e) {
        e.preventDefault();
      }

      setIsDragging(true);
      setHandVisible(true);

      // Organic tension curve: logarithmic / exponential dampening
      const dampened = Math.min(160, Math.pow(rawDeltaY, 0.82) * 1.4);
      dragOffsetRef.current = dampened;
      setDragOffset(dampened);

      // Haptic threshold pulse
      if (dampened > 85 && !refreshTriggered) {
        setRefreshTriggered(true);
        triggerHaptic(15);
      } else if (dampened <= 85 && refreshTriggered) {
        setRefreshTriggered(false);
      }
    } else {
      // If user drags back up past origin
      setIsDragging(false);
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
  }, [isEntering, refreshTriggered]);

  const handleTouchEnd = useCallback(() => {
    if (!isTouchActiveRef.current) return;
    isTouchActiveRef.current = false;

    const currentOffset = dragOffsetRef.current;
    setIsDragging(false);
    setIsSnapping(true);

    // If pulled past the refresh threshold
    if (currentOffset > 85) {
      triggerHaptic(20);
      if (onRefresh) {
        onRefresh();
      }
    }

    // Elastic spring recoil back to resting position
    setDragOffset(0);
    dragOffsetRef.current = 0;

    // After spring completes, slide hand back up off-screen
    setTimeout(() => {
      setIsSnapping(false);
      setHandVisible(false);
      setRefreshTriggered(false);
    }, 450);
  }, [onRefresh]);

  // Attach global touch & pointer listeners for seamless interaction (touch & desktop mouse)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, input, a, [role="button"]')) return;
      handleTouchStart(e);
    };
    const onTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const onTouchEnd = () => handleTouchEnd();

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return; // Only left click
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, input, a, [role="button"]')) return;
      handleTouchStart(e);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (isTouchActiveRef.current) handleTouchMove(e);
    };
    const onPointerUp = () => {
      if (isTouchActiveRef.current) handleTouchEnd();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);

      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Compute hand position:
  // When dragOffset is 0 and not entering, hand is tucked at translateY(-220px)
  // As dragOffset increases, the hand pulls down in sync
  const handTranslateY = isEntering
    ? dragOffset - 50 // during entrance: grips the top of the tablecloth
    : isDragging || isSnapping
      ? -160 + dragOffset * 1.15
      : -240;

  const handOpacity = isEntering
    ? 1
    : isDragging || isSnapping
      ? Math.min(1, Math.max(0, (dragOffset - 8) / 25))
      : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-x-hidden ${className}`}
      style={{ touchAction: window?.scrollY <= 2 && isDragging ? 'none' : 'auto' }}
    >
      {/* ------------------------------------------------------------------- */}
      {/* 3D TABLECLOTH HAND & WRINKLES OVERLAY                               */}
      {/* ------------------------------------------------------------------- */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none"
        style={{
          width: 'min(420px, 92vw)',
          transform: `translateX(-50%) translateY(${handTranslateY}px)`,
          opacity: handVisible ? handOpacity : 0,
          transition: isDragging
            ? 'none'
            : isEntering
              ? 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease-out'
              : 'transform 420ms cubic-bezier(0.175, 0.885, 0.32, 1.25), opacity 350ms ease-out',
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      >
        {/* Realistic 3D Hand Pinching Cloth Asset */}
        <div className="relative w-full aspect-square max-w-[340px] drop-shadow-md">
          <Image
            src="/tablecloth-hand.webp"
            alt=""
            fill
            sizes="340px"
            priority
            className="object-contain"
          />
        </div>

        {/* Subtle dynamic status pill when dragged near threshold */}
        {isDragging && dragOffset > 40 && (
          <div
            className={`-mt-6 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-md border transition-all ${
              refreshTriggered
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] scale-105'
                : 'bg-[var(--card)]/90 text-[var(--foreground)] border-[var(--border)]'
            }`}
          >
            {refreshTriggered
              ? locale === 'am'
                ? '✓ ዝርዝሩን ለማደስ ይልቀቁ'
                : '✓ Release to refresh'
              : locale === 'am'
                ? 'ጠረጴዛውን ወደ ታች ይጎትቱ'
                : 'Pull down tablecloth'}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TABLECLOTH MENU CANVAS (The page itself, moved by the hand)         */}
      {/* ------------------------------------------------------------------- */}
      <div
        style={{
          transform:
            dragOffset !== 0 || isEntering
              ? `translateY(${dragOffset}px)`
              : undefined,
          transition: isDragging
            ? 'none'
            : isEntering
              ? 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 420ms cubic-bezier(0.175, 0.885, 0.32, 1.25)',
          willChange: isDragging || isEntering || isSnapping ? 'transform' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};
