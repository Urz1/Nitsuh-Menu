'use client';

import React from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, CheckCircle2, Globe, Monitor, HelpCircle } from 'lucide-react';
import { triggerHaptic } from '@/lib/utils';
import Image from 'next/image';
import { Language } from '@/lib/translations';
import { usePWAInstall } from '@/context/PWAInstallContext';

interface PWAInstallPromptProps {
  locale?: Language | string;
}

export function PWAInstallPrompt({ locale = 'en' }: PWAInstallPromptProps) {
  const {
    isStandalone,
    isDismissed,
    isInstalled,
    isIOS,
    deferredPrompt,
    promptInstall,
    dismissFloatingPrompt,
    showIOSGuide,
    closeIOSGuide,
    showBrowserGuide,
    closeBrowserGuide,
  } = usePWAInstall();

  const isAm = locale === 'am';

  const handleInstallClick = async () => {
    triggerHaptic(12);
    await promptInstall();
  };

  const handleDismiss = () => {
    triggerHaptic(10);
    dismissFloatingPrompt();
  };

  // Condition to show the floating banner:
  // Not standalone, not dismissed, not already installed, and either has deferredPrompt or is iOS
  const showFloatingBanner = !isStandalone && !isDismissed && !isInstalled && (Boolean(deferredPrompt) || isIOS);

  return (
    <>
      {/* 1. Floating PWA Install Bar */}
      {showFloatingBanner && (
        <aside
          aria-label="Install App"
          className="fixed bottom-[74px] md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#FAF6F0]/95 dark:bg-[#1A1412]/95 backdrop-blur-md border border-amber-300/60 dark:border-amber-700/50 rounded-2xl p-3.5 shadow-xl animate-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white shadow-xs border border-stone-200 dark:border-stone-700 flex-shrink-0">
              <Image
                src="/icons/icon-192x192.png"
                alt="Nitsuh App"
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                  {isAm ? 'ንፁህ አፕሊኬሽን ጫን' : 'Install Nitsuh Menu'}
                </h4>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Smartphone className="w-2.5 h-2.5" />
                  <span>PWA</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-1 mt-0.5">
                {isAm
                  ? 'ያለ ኢንተርኔት በፍጥነት ሜኑውን ለመክፈት'
                  : 'Instant offline access & fullscreen menu'}
              </p>
            </div>

            {/* Action & Close */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAm ? 'ጫን' : 'Install'}</span>
              </button>
              <button
                onClick={handleDismiss}
                aria-label="Dismiss app install banner"
                className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. iOS Safari Step-by-Step Guide Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={closeIOSGuide}
        >
          <div
            className="w-full sm:max-w-md bg-[#FAF6F0] dark:bg-[#1A1412] rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-xs border border-stone-200 flex items-center justify-center">
                  <Image src="/icons/icon-192x192.png" alt="Nitsuh Icon" width={36} height={36} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {isAm ? 'በአይፎን (iOS) ላይ መጫኛ' : 'Install on iPhone & iPad'}
                  </h3>
                  <p className="text-xs text-stone-500">Nitsuh Cafe & Restaurant</p>
                </div>
              </div>
              <button
                onClick={closeIOSGuide}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer"
                aria-label="Close iOS guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isAm
                ? 'ይህን ድረ-ገጽ ልክ እንደ አፕሊኬሽን በስልክዎ መነሻ ገጽ (Home Screen) ላይ ለመጨመር እነዚህን 3 ቀላል ደረጃዎች ይከተሉ፡'
                : 'Follow these 3 quick steps in Safari to add Nitsuh Menu directly to your home screen:'}
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100">1. {isAm ? 'የማጋሪያ ምልክቱን ይጫኑ' : 'Tap the Share button'}</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px]">
                    {isAm ? 'በሳፋሪ ታችኛው ክፍል የሚገኘውን ምልክት ይንኩ' : 'Located in Safari’s bottom toolbar'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    2. {isAm ? 'ወደ መነሻ ገጽ ጨምር' : 'Select "Add to Home Screen"'}
                  </span>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px]">
                    {isAm ? 'ዝርዝሩን ወደ ታች ዝቅ በማድረግ ይምረጡ' : 'Scroll down the share sheet and tap Add to Home Screen'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    3. {isAm ? '"ጨምር" የሚለውን ይጫኑ' : 'Tap "Add" in top-right'}
                  </span>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px]">
                    {isAm ? 'አፕሊኬሽኑ በስልክዎ ላይ ተዘጋጅቷል!' : 'Nitsuh Menu will now open as a standalone app!'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={closeIOSGuide}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold active:scale-95 transition-transform cursor-pointer"
            >
              {isAm ? 'ገባኝ / ተረዳሁ' : 'Got it!'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Browser / Desktop Instructions Modal */}
      {showBrowserGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={closeBrowserGuide}
        >
          <div
            className="w-full sm:max-w-md bg-[#FAF6F0] dark:bg-[#1A1412] rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-xs border border-stone-200 flex items-center justify-center">
                  <Image src="/icons/icon-192x192.png" alt="Nitsuh Icon" width={36} height={36} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {isAm ? 'አፕሊኬሽኑን በብሮውዘር ላይ መጫን' : 'Install via Browser'}
                  </h3>
                  <p className="text-xs text-stone-500">Nitsuh Cafe & Restaurant</p>
                </div>
              </div>
              <button
                onClick={closeBrowserGuide}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer"
                aria-label="Close browser guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="text-xs flex-1">
                  <h5 className="font-bold text-stone-900 dark:text-stone-100 mb-0.5">
                    {isAm ? 'በኮምፒውተር (Chrome / Edge / Brave)' : 'On Desktop (Chrome, Edge, Brave)'}
                  </h5>
                  <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    {isAm
                      ? 'በአድራሻ አሞሌው (URL bar) በስተቀኝ በኩል የሚገኘውን የመጫኛ ምልክት (Install ⊕) ይጫኑ ወይም ሜኑ (⋮) -> "Install Nitsuh Menu" የሚለውን ይምረጡ።'
                      : 'Click the Install icon (⊕) on the right side of your browser address bar, or click Menu (⋮) and select "Install Nitsuh Menu".'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-xs flex-1">
                  <h5 className="font-bold text-stone-900 dark:text-stone-100 mb-0.5">
                    {isAm ? 'በአንድሮይድ ስልክ (Android Chrome)' : 'On Android'}
                  </h5>
                  <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    {isAm
                      ? 'ከላይ በስተቀኝ ያሉትን ሶስት ነጥቦች (⋮) ተጭነው "Install app" ወይም "Add to Home screen" የሚለውን ይምረጡ።'
                      : 'Tap the three dots (⋮) in the top-right corner of Chrome and choose "Install app" or "Add to Home screen".'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={closeBrowserGuide}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold active:scale-95 transition-transform cursor-pointer"
            >
              {isAm ? 'ተረድቻለሁ' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
