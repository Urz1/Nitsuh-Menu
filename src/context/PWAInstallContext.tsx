'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isStandalone: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  showIOSGuide: boolean;
  showBrowserGuide: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'manual' | 'installed' | 'unsupported'>;
  dismissFloatingPrompt: () => void;
  openIOSGuide: () => void;
  closeIOSGuide: () => void;
  openBrowserGuide: () => void;
  closeBrowserGuide: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export function PWAInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showBrowserGuide, setShowBrowserGuide] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    // 2. Check if dismissed in this session
    try {
      const dismissed = sessionStorage.getItem('nitsuh_pwa_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // Storage unavailable
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isAppleDevice);

    // 4. Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(true);
      try {
        sessionStorage.setItem('nitsuh_pwa_dismissed', 'true');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual' | 'installed' | 'unsupported'> => {
    if (isStandalone || isInstalled) {
      return 'installed';
    }

    if (isIOS) {
      setShowIOSGuide(true);
      return 'manual';
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        return choice.outcome;
      } catch (err) {
        console.warn('PWA install prompt error:', err);
        setShowBrowserGuide(true);
        return 'manual';
      }
    }

    // No direct event captured (e.g. desktop browser, Chrome where prompt was dismissed, or unsupported browser)
    setShowBrowserGuide(true);
    return 'manual';
  }, [deferredPrompt, isIOS, isInstalled, isStandalone]);

  const dismissFloatingPrompt = useCallback(() => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('nitsuh_pwa_dismissed', 'true');
    } catch {}
  }, []);

  const openIOSGuide = useCallback(() => setShowIOSGuide(true), []);
  const closeIOSGuide = useCallback(() => setShowIOSGuide(false), []);
  const openBrowserGuide = useCallback(() => setShowBrowserGuide(true), []);
  const closeBrowserGuide = useCallback(() => setShowBrowserGuide(false), []);

  const isInstallable = Boolean(deferredPrompt || isIOS || (!isStandalone && !isInstalled));

  return (
    <PWAInstallContext.Provider
      value={{
        deferredPrompt,
        isInstallable,
        isStandalone,
        isInstalled,
        isIOS,
        isDismissed,
        showIOSGuide,
        showBrowserGuide,
        promptInstall,
        dismissFloatingPrompt,
        openIOSGuide,
        closeIOSGuide,
        openBrowserGuide,
        closeBrowserGuide,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}

const defaultPWAContext: PWAInstallContextType = {
  deferredPrompt: null,
  isInstallable: false,
  isStandalone: false,
  isInstalled: false,
  isIOS: false,
  isDismissed: false,
  showIOSGuide: false,
  showBrowserGuide: false,
  promptInstall: async () => 'unsupported',
  dismissFloatingPrompt: () => {},
  openIOSGuide: () => {},
  closeIOSGuide: () => {},
  openBrowserGuide: () => {},
  closeBrowserGuide: () => {},
};

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  return context || defaultPWAContext;
}
