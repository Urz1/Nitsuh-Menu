'use client';

import React, { useState } from 'react';
import { Restaurant } from '@/types/database';
import { Language, TRANSLATIONS } from '@/lib/translations';
import {
  X,
  Wifi,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  Share2,
  Lock,
  Sun,
  Moon,
  Info,
  Download,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/utils';
import Link from 'next/link';
import { usePWAInstall } from '@/context/PWAInstallContext';

interface RestaurantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  locale?: Language | string;
  onOpenQrModal?: () => void;
  onShareMenu?: () => void;
}

export function RestaurantInfoModal({
  isOpen,
  onClose,
  restaurant,
  locale = 'en',
  onOpenQrModal,
  onShareMenu,
}: RestaurantInfoModalProps) {
  const [copiedWifi, setCopiedWifi] = useState(false);
  const { isStandalone, isInstalled, promptInstall } = usePWAInstall();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  const isAm = currentLocale === 'am';

  const handleCopyWifi = () => {
    triggerHaptic(12);
    const pass = restaurant.wifi_config?.password || '';
    if (pass && navigator.clipboard) {
      navigator.clipboard.writeText(pass);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2500);
    }
  };

  const toggleTheme = () => {
    triggerHaptic(10);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nitsuh-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nitsuh-theme', 'light');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[88vh] bg-[var(--card)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--primary)]">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[var(--foreground)] font-brand">
                {isAm ? 'ስለ ካፌው እና መረጃ' : 'Restaurant & Info'}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {restaurant.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* 1. WiFi Card (Only visible when owner enables Wi-Fi sharing) */}
          {Boolean(restaurant.wifi_config?.enabled && restaurant.wifi_config?.ssid) && (
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {isAm ? 'ነፃ ዋይፋይ' : 'Customer Wi-Fi'}
                    </span>
                    <h3 className="font-bold text-sm text-[var(--foreground)]">
                      {restaurant.wifi_config.ssid}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {isAm ? 'የይለፍ ቃል' : 'Password'}:{' '}
                      <span className="font-mono font-bold text-[var(--foreground)]">
                        {restaurant.wifi_config.password || (isAm ? 'የለም' : 'None')}
                      </span>
                    </p>
                  </div>
                </div>

                {restaurant.wifi_config.password && (
                  <button
                    onClick={handleCopyWifi}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--card)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--foreground)] border border-[var(--border)] transition-colors active:scale-95"
                  >
                    {copiedWifi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">{isAm ? 'ተገልብጧል' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span>{isAm ? 'ገልብጥ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Hours & Status */}
          <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {isAm ? 'የስራ ሰዓት' : 'Opening Hours'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{restaurant.is_open ? t.openNow : t.closed}</span>
                </span>
              </div>
              <p className="font-bold text-sm text-[var(--foreground)]">
                {restaurant.hours || 'Daily: 7:00 AM to 10:00 PM'}
              </p>
            </div>
          </div>

          {/* 3. Location & Google Maps */}
          {restaurant.address && (
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {isAm ? 'አድራሻ እና ቅርንጫፍ' : 'Location & Branch'}
                </span>
                <h4 className="font-bold text-sm text-[var(--foreground)] truncate">
                  {restaurant.branch_name || restaurant.name}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {restaurant.address}
                </p>
                {restaurant.google_maps_url && (
                  <a
                    href={restaurant.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline mt-2"
                  >
                    <span>{isAm ? 'በGoogle Maps ይመልከቱ' : 'Open in Google Maps'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 4. Quick Tools: Dark Mode, QR Share & Install App */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] transition-colors active:scale-95 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{isAm ? 'የቀን ገጽታ' : 'Light Mode'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span>{isAm ? 'የጨለማ ገጽታ' : 'Dark Mode'}</span>
                  </>
                )}
              </button>

              {onOpenQrModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenQrModal();
                  }}
                  className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] transition-colors active:scale-95 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[var(--primary)]" />
                  <span>{isAm ? 'የሜኑ QR ኮድ' : 'Menu QR'}</span>
                </button>
              )}
            </div>

            {/* Install PWA Button / Status Badge */}
            {isStandalone || isInstalled ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{isAm ? 'ንፁህ አፕሊኬሽን ተጭኗል' : 'Nitsuh App Installed'}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  {isAm ? 'ተዘጋጅቷል' : 'Ready'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic(12);
                  promptInstall();
                }}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-amber-600 text-white flex items-center justify-between text-xs font-bold shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{isAm ? 'ንፁህ አፕሊኬሽን በስልክዎ ላይ ይጫኑ' : 'Install Nitsuh Menu App'}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  {isAm ? 'አፕ ጫን' : 'Install'}
                </span>
              </button>
            )}
          </div>

          {/* 5. Admin Link */}
          <div className="text-center pt-2">
            <Link
              href="/admin"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-1 px-3 rounded-md hover:bg-[var(--surface)]"
            >
              <Lock className="w-3 h-3 opacity-60" />
              <span>{isAm ? 'የአስተዳዳሪ ፖርታል' : 'Staff & Owner Portal'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
