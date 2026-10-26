import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | string | undefined | null = 0, currencySymbol: string = "ETB"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const safeAmount = typeof num === "number" && !isNaN(num) ? num : 0;
  if (currencySymbol === "ETB" || currencySymbol === "Br") {
    const formatted = Number.isInteger(safeAmount) ? safeAmount.toLocaleString() : safeAmount.toFixed(2);
    return `${formatted} ${currencySymbol}`;
  }
  return `${currencySymbol}${safeAmount.toFixed(2)}`;
}

export function triggerHaptic(duration: number = 12): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Haptics not supported or permitted
    }
  }
}

/**
 * Optimizes a Cloudinary image URL on the fly by injecting dynamic CDN transformation parameters:
 * - f_auto: Serves modern formats (AVIF / WebP) matching client browser capabilities
 * - q_auto: Intelligent perceptually lossless compression (cuts weight by 50-70%)
 * - w_${width},c_limit: Automatically scales down payload to the exact mobile display size
 */
export function getOptimizedCloudinaryUrl(url?: string | null, width: number = 400): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || url.includes('/f_auto,')) {
    return url;
  }
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
}

const ICON_NAME_TO_EMOJI: Record<string, string> = {
  coffee: '☕',
  breakfast: '☕',
  burger: '🍔',
  pizza: '🍕',
  flame: '🍕',
  clubsandwich: '🥪',
  sandwich: '🥪',
  wrap: '🌯',
  chicken: '🍗',
  salad: '🥗',
  pasta: '🍝',
  mojito: '🍹',
  softdrinks: '🥤',
  drinks: '🥤',
  juices: '🧃',
  shakes: '🍦',
  hotdrinks: '☕',
  iceddrink: '🧊',
  ice: '🧊',
  desserts: '🍰',
  cake: '🍰',
  dessertskg: '🎂',
  utensilscrossed: '🍽️',
  utensils: '🍽️',
};

/**
 * Ensures category icons always render as vibrant, universal food emojis
 * instead of raw component string names like "UtensilsCrossed" or "Coffee".
 */
export function formatCategoryIcon(icon?: string | null, categoryName?: string): string {
  if (!icon) return '🍽️';
  const trimmed = icon.trim();
  // If it's already an emoji, return as-is
  if (/\p{Extended_Pictographic}/u.test(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.toLowerCase().replace(/[^a-z]/g, '');
  if (ICON_NAME_TO_EMOJI[normalized]) {
    return ICON_NAME_TO_EMOJI[normalized];
  }
  if (categoryName) {
    const catNorm = categoryName.toLowerCase().replace(/[^a-z]/g, '');
    for (const [key, emoji] of Object.entries(ICON_NAME_TO_EMOJI)) {
      if (catNorm.includes(key)) return emoji;
    }
  }
  return '🍽️';
}


