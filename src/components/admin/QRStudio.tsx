'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';
import { generateQrSvgDataUri, generateQrPngDataUrl, getQrMatrixData } from '@/lib/qr-code';
import {
  Printer,
  Download,
  Copy,
  Check,
  Wifi,
  ExternalLink,
  Layers,
  FileText,
  Smartphone,
  Info,
  Sparkles,
} from 'lucide-react';

interface QRStudioProps {
  restaurant: Restaurant;
  onSaveRestaurant?: (updates: Partial<Restaurant>) => Promise<Restaurant> | void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export type QRTemplateType = 'tent' | 'a4-4' | 'a4-6' | 'sticker' | 'a4';

export function QRStudio({ restaurant, onSaveRestaurant, onShowToast }: QRStudioProps) {
  // Template Type (defaults to 4 Large Table Tents - 4"x6" / A6 acrylic stand size)
  const [templateType, setTemplateType] = useState<QRTemplateType>('a4-4');

  // Customization Options
  const [qrColor, setQrColor] = useState<string>('#111827');
  const [includeWifi, setIncludeWifi] = useState<boolean>(Boolean(restaurant.wifi_config?.enabled));
  const [wifiSsid, setWifiSsid] = useState<string>(restaurant.wifi_config?.ssid || 'Nitsuh-Guest');
  const [wifiPassword, setWifiPassword] = useState<string>(restaurant.wifi_config?.password || '');
  const [isSavingWifi, setIsSavingWifi] = useState<boolean>(false);
  const [wifiSaved, setWifiSaved] = useState<boolean>(false);
  const [callToAction, setCallToAction] = useState<string>(
    'Scan with your phone camera to explore our fresh menu & daily specials'
  );

  // Keep Wi-Fi fields synced with restaurant updates
  useEffect(() => {
    if (restaurant.wifi_config) {
      setWifiSsid(restaurant.wifi_config.ssid || 'Nitsuh-Guest');
      setWifiPassword(restaurant.wifi_config.password || '');
      setIncludeWifi(Boolean(restaurant.wifi_config.enabled));
    }
  }, [restaurant.wifi_config?.ssid, restaurant.wifi_config?.password, restaurant.wifi_config?.enabled]);

  const handleSaveWifi = async () => {
    triggerHaptic(10);
    setIsSavingWifi(true);
    try {
      if (onSaveRestaurant) {
        await onSaveRestaurant({
          wifi_config: {
            ...restaurant.wifi_config,
            ssid: wifiSsid.trim(),
            password: wifiPassword.trim(),
            enabled: Boolean(restaurant.wifi_config?.enabled),
          },
        });
      }
      setWifiSaved(true);
      setTimeout(() => setWifiSaved(false), 2500);
      onShowToast('Guest Wi-Fi network and password saved!', 'success');
    } catch {
      onShowToast('Failed to save Wi-Fi settings', 'error');
    } finally {
      setIsSavingWifi(false);
    }
  };

  // Copy state
  const [copiedLink, setCopiedLink] = useState(false);

  // Menu URL: Clean global customer menu URL (100% table-free)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://digitalmenu.app';
  const slugPrefix = (restaurant.slug === 'nitsuh' || restaurant.slug === 'addis') ? '' : `/${restaurant.slug}`;
  const menuUrl = `${baseUrl}${slugPrefix || '/'}`;
  const logoUrl = restaurant.logo_url || 'https://res.cloudinary.com/dekmg6rhe/image/upload/v1793051284/nitsuh-menu/brand/nitsuh-logo-clean.png';

  // Instant local vector SVG QR code with embedded logo & High error correction (30% redundancy)
  const qrSvgUri = generateQrSvgDataUri(menuUrl, {
    color: qrColor,
    bgColor: '#FFFFFF',
    margin: 1,
    logoUrl,
    errorCorrectionLevel: 'H',
  });

  // Copy direct link
  const handleCopyLink = async () => {
    triggerHaptic(10);
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopiedLink(true);
      onShowToast('Menu link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      onShowToast(menuUrl, 'info');
    }
  };

  // Print trigger
  const handlePrint = () => {
    triggerHaptic(15);
    window.print();
  };

  // Download standalone Vector SVG with embedded vector QR paths and base64 logo
  const handleDownloadSvg = async () => {
    triggerHaptic(10);
    try {
      // 1. Generate crisp raw QR matrix path (pure vector XML, 100% resolution independent)
      const { path, totalSize } = getQrMatrixData(menuUrl, { margin: 1, errorCorrectionLevel: 'H' });

      // 2. Safely convert brand logo to inline base64 so SVG is 100% self-contained offline
      let base64Logo = '';
      try {
        const res = await fetch(logoUrl);
        if (res.ok) {
          const blob = await res.blob();
          base64Logo = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string) || '');
            reader.readAsDataURL(blob);
          });
        }
      } catch {
        // Fallback without embedded raster image if fetch is blocked
      }

      // XML escape text strings
      const safeName = (restaurant.name || 'Restaurant')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      const safeTagline = (restaurant.tagline || '')
        .slice(0, 60)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      const safeCta = callToAction
        .slice(0, 65)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      // Scale factors for the QR code box
      const qrBoxX = 85;
      const qrBoxY = 210;
      const qrBoxSize = 270;
      const qrScale = qrBoxSize / totalSize;

      // Center logo dimensions inside QR
      const centerShieldSize = 64;
      const centerShieldX = qrBoxX + (qrBoxSize - centerShieldSize) / 2;
      const centerShieldY = qrBoxY + (qrBoxSize - centerShieldSize) / 2;
      const centerLogoSize = 52;
      const centerLogoX = qrBoxX + (qrBoxSize - centerLogoSize) / 2;
      const centerLogoY = qrBoxY + (qrBoxSize - centerLogoSize) / 2;

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 600" width="440" height="600">
  <rect width="440" height="600" fill="#ffffff" rx="24"/>
  <!-- Outer Guide Border -->
  <rect x="12" y="12" width="416" height="576" rx="20" fill="none" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="6 6"/>
  
  <!-- Top Gold Accent Line -->
  <rect x="180" y="28" width="80" height="4" rx="2" fill="#D97706"/>
  
  <!-- Top Logo Crest -->
  <rect x="188" y="44" width="64" height="64" rx="16" fill="#ffffff" stroke="#D97706" stroke-width="1.5"/>
  ${
    base64Logo
      ? `<image href="${base64Logo}" x="194" y="50" width="52" height="52" preserveAspectRatio="xMidYMid meet"/>`
      : `<text x="220" y="84" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#D97706" text-anchor="middle">${safeName.charAt(0)}</text>`
  }
  
  <!-- Restaurant Name & Tagline -->
  <text x="220" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#111827" text-anchor="middle">${safeName}</text>
  <text x="220" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#4B5563" text-anchor="middle">${safeTagline}</text>
  
  <!-- Digital Menu Pill -->
  <rect x="145" y="166" width="150" height="26" rx="13" fill="#111827"/>
  <text x="220" y="183" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" fill="#F59E0B" text-anchor="middle" letter-spacing="1">DIGITAL MENU</text>
  
  <!-- High Contrast Center-Branded QR Box -->
  <rect x="${qrBoxX - 10}" y="${qrBoxY - 10}" width="${qrBoxSize + 20}" height="${qrBoxSize + 20}" rx="18" fill="#ffffff" stroke="#111827" stroke-width="2"/>
  
  <!-- QR Code Modules (Pure Vector Path) -->
  <g transform="translate(${qrBoxX}, ${qrBoxY}) scale(${qrScale})">
    <path d="${path.trim()}" fill="${qrColor}" shape-rendering="crispEdges"/>
  </g>
  
  <!-- Center Logo Shield on QR -->
  <rect x="${centerShieldX}" y="${centerShieldY}" width="${centerShieldSize}" height="${centerShieldSize}" rx="14" fill="#ffffff" stroke="#D97706" stroke-width="2"/>
  ${
    base64Logo
      ? `<image href="${base64Logo}" x="${centerLogoX}" y="${centerLogoY}" width="${centerLogoSize}" height="${centerLogoSize}" preserveAspectRatio="xMidYMid meet"/>`
      : `<text x="${centerShieldX + centerShieldSize / 2}" y="${centerShieldY + centerShieldSize / 2 + 8}" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#D97706" text-anchor="middle">${safeName.charAt(0)}</text>`
  }
  
  <!-- Call to action -->
  <text x="220" y="525" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="600" fill="#1F2937" text-anchor="middle">${safeCta}</text>
  ${includeWifi && wifiSsid ? `<text x="220" y="552" font-family="ui-monospace, monospace" font-size="11" fill="#6B7280" text-anchor="middle">WiFi: ${wifiSsid.replace(/&/g, '&amp;')} • Pass: ${(wifiPassword || 'none').replace(/&/g, '&amp;')}</text>` : ''}
</svg>`.trim();

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${restaurant.slug}-menu-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Standalone Vector SVG downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to export vector SVG:', err);
      onShowToast('Failed to export SVG vector', 'error');
    }
  };

  // Download high-resolution branded PNG with logo
  const handleDownloadPng = async () => {
    triggerHaptic(10);
    try {
      const qrDataUrl = await generateQrPngDataUrl(menuUrl, {
        width: 600,
        margin: 1,
        color: { dark: qrColor, light: '#ffffff' },
        logoUrl,
        errorCorrectionLevel: 'H',
      });

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1040;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top Gold Accent Bar
      ctx.fillStyle = '#D97706';
      ctx.fillRect(320, 36, 160, 6);

      const renderFinalPng = (logoImg?: HTMLImageElement) => {
        // Draw top logo frame
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(340, 60, 120, 120, 24);
        ctx.fill();
        ctx.stroke();

        if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
          ctx.drawImage(logoImg, 350, 70, 100, 100);
        } else {
          ctx.fillStyle = '#D97706';
          ctx.font = 'bold 50px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((restaurant.name || 'R').charAt(0), 400, 142);
        }

        // Header Restaurant Name
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(restaurant.name, 400, 225);

        // Subtitle / Tagline
        ctx.fillStyle = '#6B7280';
        ctx.font = '18px sans-serif';
        ctx.fillText(restaurant.tagline.slice(0, 60), 400, 260);

        // Digital Menu Badge
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.roundRect(280, 285, 240, 44, 22);
        ctx.fill();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('DIGITAL MENU', 400, 313);

        // QR Image with border
        const img = new window.Image();
        img.onload = () => {
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 4;
          ctx.strokeRect(175, 360, 450, 450);
          ctx.drawImage(img, 185, 370, 430, 430);

          // Center Logo Shield on top of QR code
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(345, 530, 110, 110, 22);
          ctx.fill();
          ctx.stroke();

          if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
            ctx.drawImage(logoImg, 355, 540, 90, 90);
          } else {
            ctx.fillStyle = '#D97706';
            ctx.font = 'bold 42px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText((restaurant.name || 'R').charAt(0), 400, 600);
          }

          // Call to action
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(callToAction.slice(0, 65), 400, 860);

          // Wi-Fi info
          if (includeWifi && wifiSsid) {
            ctx.fillStyle = '#6B7280';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(`WiFi: ${wifiSsid} • Password: ${wifiPassword || 'none'}`, 400, 915);
          }

          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${restaurant.slug}-menu-qr.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          onShowToast('Branded PNG downloaded with logo!', 'success');
        };
        img.src = qrDataUrl;
      };

      const topLogo = new window.Image();
      topLogo.crossOrigin = 'anonymous';
      let hasRendered = false;
      topLogo.onload = () => {
        if (!hasRendered) {
          hasRendered = true;
          renderFinalPng(topLogo);
        }
      };
      topLogo.onerror = () => {
        if (!hasRendered) {
          hasRendered = true;
          renderFinalPng();
        }
      };
      // Fallback timer in case image load stalls
      setTimeout(() => {
        if (!hasRendered) {
          hasRendered = true;
          renderFinalPng();
        }
      }, 2500);
      topLogo.src = logoUrl;
    } catch (err) {
      console.error('Failed to generate PNG:', err);
      onShowToast('Failed to generate PNG', 'error');
    }
  };

  // 8 uniform cards for printable A4 sheet
  const sheetCards = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6 pb-20 print:p-0 print:pb-0" data-testid="qr-studio-container">
      <div className="screen-only-admin flex flex-col gap-6 print:hidden">
        {/* 1. Header & Quick Actions (Hidden during print) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">QR Studio & Printable Displays</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Logo Embedded
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              High-resolution, beautifully branded QR codes for counter stands, printable A4 sheets, and stickers. Completely table-free.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              data-testid="qr-copy-link-btn"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              data-testid="qr-print-btn"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stand / PDF</span>
            </button>
          </div>
        </div>

        {/* 2. Controls & Live Preview Grid (Hidden in print) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
          {/* Left Column: Configuration Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Target: Direct Menu Destination */}
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  1. Menu Destination
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Global Menu URL
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-neutral-300 truncate" title={menuUrl}>
                  {menuUrl}
                </span>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
                  title="Open live customer menu"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-neutral-400">
                Customers scan to open your digital menu directly without needing any table number.
              </p>
            </div>

            {/* Template Format Selection */}
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                2. Print Template Format
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setTemplateType('tent');
                  }}
                  data-testid="template-tent-btn"
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                    templateType === 'tent'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">Counter Stand</span>
                  <span className="text-[9px] text-neutral-400 font-normal">1 Full Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setTemplateType('a4-4');
                  }}
                  data-testid="template-a4-btn"
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                    templateType === 'a4-4' || templateType === 'a4'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">4 Table Tents</span>
                  <span className="text-[9px] text-neutral-400 font-normal">2×2 Acrylic Size</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setTemplateType('a4-6');
                  }}
                  data-testid="template-a4-6-btn"
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                    templateType === 'a4-6'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">6 Table Cards</span>
                  <span className="text-[9px] text-neutral-400 font-normal">2×3 Compact</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setTemplateType('sticker');
                  }}
                  data-testid="template-sticker-btn"
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                    templateType === 'sticker'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">Stickers (6×)</span>
                  <span className="text-[9px] text-neutral-400 font-normal">Table & Box</span>
                </button>
              </div>
            </div>

            {/* Custom Options */}
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                3. Visual Styling & Wi-Fi
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Call to Action Text
                  </label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-amber-500"
                    placeholder="e.g. Scan with your phone camera to explore our menu"
                  />
                </div>

                {/* Wi-Fi toggle & inputs */}
                <div className="pt-2 border-t border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={includeWifi}
                      onChange={(e) => setIncludeWifi(e.target.checked)}
                      className="rounded border-white/10 text-amber-500 focus:ring-0 bg-white/5"
                    />
                    <span className="text-xs font-medium text-neutral-300">
                      Show Guest Wi-Fi details on printable stand
                    </span>
                  </label>

                  {includeWifi && (
                    <div className="space-y-2 pl-5 pt-1">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Guest Wi-Fi Network Name (SSID)
                        </label>
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="e.g. Nitsuh-Guest"
                          className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Guest Wi-Fi Password
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={wifiPassword}
                            onChange={(e) => setWifiPassword(e.target.value)}
                            placeholder="Leave blank if open / no password"
                            className="flex-1 h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={handleSaveWifi}
                            disabled={isSavingWifi}
                            className="px-3 h-9 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {wifiSaved ? 'Saved!' : isSavingWifi ? 'Saving...' : 'Save Wi-Fi'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Pattern Color */}
                <div className="pt-2 border-t border-white/5">
                  <label className="block text-[11px] text-neutral-400 mb-1.5">
                    QR Pattern Tint
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'Onyx Dark', value: '#111827' },
                      { label: 'Deep Amber', value: '#B45309' },
                      { label: 'Forest Green', value: '#14532D' },
                      { label: 'Burgundy Red', value: '#881337' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          triggerHaptic(5);
                          setQrColor(c.value);
                        }}
                        style={{ backgroundColor: c.value }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          qrColor === c.value ? 'border-amber-400 scale-110 shadow-sm' : 'border-transparent'
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Vector / PNG Direct Export */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  data-testid="qr-download-svg"
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SVG Vector (Logo)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  data-testid="qr-download-png"
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG Image</span>
                </button>
              </div>
            </div>

            {/* 4. Scanning Reliability Advice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-300">
                <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                <span>Reliable Scanning Advice for Owners</span>
              </div>
              <ul className="space-y-1 text-[11px] text-amber-900/90 dark:text-amber-200/90 list-disc pl-4">
                <li>
                  <strong>Center-Embedded Logo:</strong> Generated using QR Level H (30% error correction) so smartphones instantly recognize the code without scanning delays.
                </li>
                <li>
                  <strong>Minimum Size:</strong> Print at least <strong>2.5 cm (1 in)</strong> for stickers and <strong>4–5 cm (1.8 in)</strong> for display stands.
                </li>
                <li>
                  <strong>Contrast:</strong> Always keep the QR code dark on a pure white background.
                </li>
                <li>
                  <strong>Matte Finish:</strong> Use matte or satin paper. Glossy lamination reflects overhead dining lights, making camera scanning slower.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Interactive Card Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#08090C] border border-white/5 min-h-[500px]">
            <div className="text-center mb-4">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {templateType === 'tent' && 'Master Counter Stand Preview (1 Full Page)'}
                {(templateType === 'a4-4' || templateType === 'a4') && '4 Large Acrylic Table Tents (4" × 6" / A6 Sheet)'}
                {templateType === 'a4-6' && '6 Compact Dining Table Cards (2×3 Sheet)'}
                {templateType === 'sticker' && 'Table & Takeaway Stickers (6× Sheet)'}
              </span>
            </div>

            {/* TEMPLATE 1: MASTER COUNTER STAND */}
            {templateType === 'tent' && (
              <div
                data-testid="preview-tent-card"
                className="w-full max-w-sm bg-white text-black rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 flex flex-col items-center text-center transition-all relative overflow-hidden"
              >
                {/* Gold Top Accent Line */}
                <div className="w-20 h-1 bg-amber-500 rounded-full mb-4" />

                {/* Prominent Authentic Brand Logo Crest */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-md border-2 border-amber-500/30 flex items-center justify-center mb-3">
                  {/* eslint-disable-next-js/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/icons/icon-192x192.png';
                    }}
                  />
                </div>

                <h3 className="font-extrabold text-xl text-neutral-900 tracking-tight">{restaurant.name}</h3>
                {restaurant.tagline && (
                  <p className="text-xs text-neutral-500 font-medium max-w-xs mt-1 leading-snug">
                    {restaurant.tagline}
                  </p>
                )}

                {/* Digital Menu Luxury Pill */}
                <div className="my-3 px-4 py-1 rounded-full bg-neutral-900 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow-sm border border-amber-500/40">
                  DIGITAL MENU • የዲጂታል ሜኑ
                </div>

                {/* QR Code Container with Centered Logo Emblem */}
                <div className="p-3.5 bg-white rounded-2xl border-2 border-neutral-900 my-2 shadow-inner relative group">
                  {/* eslint-disable-next-js/no-img-element */}
                  <img
                    src={qrSvgUri}
                    alt="Restaurant menu QR code"
                    className="w-48 h-48 block mx-auto"
                  />

                  {/* Sharp Center Logo Overlay Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-md border-2 border-amber-500 p-1 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-js/no-img-element */}
                      <img
                        src={logoUrl}
                        alt="Emblem"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Call to action */}
                <p className="text-xs text-neutral-900 max-w-xs mt-2 font-bold">
                  በስልክዎ ካሜራ ይቃኙ • Scan with phone camera
                </p>
                <p className="text-[11px] text-neutral-600 max-w-xs mt-0.5">
                  {callToAction}
                </p>

                {/* Wi-Fi Credentials */}
                {includeWifi && wifiSsid && (
                  <div className="mt-4 pt-3 border-t border-neutral-200 w-full flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-mono">
                    <Wifi className="w-3.5 h-3.5 text-neutral-700" />
                    <span>WiFi: <strong>{wifiSsid}</strong></span>
                    {wifiPassword && (
                      <>
                        <span className="text-neutral-400">•</span>
                        <span>Pass: <strong>{wifiPassword}</strong></span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 2: 4 LARGE TABLE TENTS PREVIEW (2x2) */}
            {(templateType === 'a4-4' || templateType === 'a4') && (
              <div
                data-testid="preview-a4-4-sheet"
                className="w-full max-w-xl bg-white text-black p-5 rounded-3xl shadow-2xl border border-neutral-300"
              >
                <div className="text-center pb-3 border-b border-neutral-200 mb-3">
                  <div className="flex items-center justify-center gap-2">
                    {/* eslint-disable-next-js/no-img-element */}
                    <img src={logoUrl} alt={restaurant.name} className="w-5 h-5 object-contain" />
                    <h4 className="font-bold text-xs text-neutral-800">
                      {restaurant.name} • 4 Large Table Tents (4&quot; × 6&quot; / A6 Acrylic Stand Size)
                    </h4>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Cut along dashed lines (✂) to separate 4 luxury table tent cards
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((cardIndex) => (
                    <div
                      key={cardIndex}
                      className="p-3 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-between text-center bg-neutral-50/50 hover:bg-white transition-colors relative"
                    >
                      <div className="w-8 h-0.5 bg-amber-500 rounded-full mb-1" />
                      <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-2xs border border-amber-500/30 mb-0.5 flex items-center justify-center">
                        {/* eslint-disable-next-js/no-img-element */}
                        <img src={logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[11px] font-extrabold text-neutral-900 truncate max-w-full">
                        {restaurant.name}
                      </span>
                      <span className="px-2 py-0.5 my-1 rounded-full bg-neutral-900 text-amber-400 font-mono text-[7px] font-bold uppercase tracking-wider">
                        DIGITAL MENU • የዲጂታል ሜኑ
                      </span>

                      {/* QR with Center Logo */}
                      <div className="relative my-1 p-1 bg-white rounded-xl border border-neutral-200">
                        {/* eslint-disable-next-js/no-img-element */}
                        <img
                          src={qrSvgUri}
                          alt="Menu QR"
                          className="w-24 h-24 block mx-auto"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-6 h-6 bg-white rounded-md border border-amber-500 p-0.5 flex items-center justify-center">
                            {/* eslint-disable-next-js/no-img-element */}
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-1">
                        <p className="text-[9px] font-bold text-neutral-800 leading-tight">
                          በስልክዎ ካሜራ ይቃኙ
                        </p>
                        <p className="text-[8px] text-neutral-500 leading-tight">
                          Scan with phone camera
                        </p>
                        {includeWifi && wifiSsid && (
                          <p className="text-[7px] font-mono text-neutral-500 truncate mt-0.5">
                            WiFi: {wifiSsid}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 3: 6 COMPACT TABLE CARDS PREVIEW (2x3) */}
            {templateType === 'a4-6' && (
              <div
                data-testid="preview-a4-6-sheet"
                className="w-full max-w-xl bg-white text-black p-4 rounded-3xl shadow-2xl border border-neutral-300"
              >
                <div className="text-center pb-2 border-b border-neutral-200 mb-2.5">
                  <div className="flex items-center justify-center gap-2">
                    {/* eslint-disable-next-js/no-img-element */}
                    <img src={logoUrl} alt={restaurant.name} className="w-5 h-5 object-contain" />
                    <h4 className="font-bold text-xs text-neutral-800">
                      {restaurant.name} • 6 Compact Table Cards
                    </h4>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Cut along dashed lines (✂) to separate 6 compact dining table cards
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((cardIndex) => (
                    <div
                      key={cardIndex}
                      className="p-2 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-between text-center bg-neutral-50/50 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-4 h-4 rounded-md bg-white p-0.5 shadow-2xs border border-amber-500/30 flex items-center justify-center">
                          {/* eslint-disable-next-js/no-img-element */}
                          <img src={logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[9px] font-bold text-neutral-900 truncate max-w-[80px]">
                          {restaurant.name}
                        </span>
                      </div>
                      <span className="text-[7px] font-mono font-bold text-amber-600 uppercase tracking-tight">
                        የዲጂታል ሜኑ
                      </span>

                      {/* QR with Center Logo */}
                      <div className="relative my-0.5">
                        {/* eslint-disable-next-js/no-img-element */}
                        <img
                          src={qrSvgUri}
                          alt="Menu QR"
                          className="w-16 h-16 bg-white p-0.5 rounded-lg border border-neutral-200 block mx-auto"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-4 h-4 bg-white rounded-md border border-amber-500 p-0.5 flex items-center justify-center">
                            {/* eslint-disable-next-js/no-img-element */}
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        </div>
                      </div>

                      <span className="text-[7.5px] text-neutral-700 font-bold truncate max-w-full">
                        በስልክዎ ካሜራ ይቃኙ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 4: COMPACT STICKER PREVIEW */}
            {templateType === 'sticker' && (
              <div
                data-testid="preview-sticker-card"
                className="w-68 h-68 rounded-full bg-white text-black p-5 shadow-2xl border-4 border-neutral-900 flex flex-col items-center justify-center text-center relative"
              >
                {/* Mini Top Logo */}
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center mb-1">
                  {/* eslint-disable-next-js/no-img-element */}
                  <img src={logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900 truncate max-w-[200px]">
                  {restaurant.name}
                </span>

                {/* QR with Center Logo */}
                <div className="my-1 relative">
                  {/* eslint-disable-next-js/no-img-element */}
                  <img
                    src={qrSvgUri}
                    alt="Sticker QR code"
                    className="w-32 h-32 block mx-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-amber-500 p-0.5 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-js/no-img-element */}
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>

                <span className="px-3.5 py-0.5 rounded-full bg-neutral-900 text-amber-400 text-[10px] font-mono font-bold tracking-wider">
                  SCAN MENU • ይቃኙ
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. PRINT ONLY LAYOUT (@media print) - GUARANTEED 1-PAGE ZERO-OVERFLOW */}
      {/* ----------------------------------------------------------------------- */}
      <div id="qr-printable-sheet" className="hidden print:flex text-black bg-white w-full flex-col items-center justify-center">
        {/* TEMPLATE 1: MASTER COUNTER STAND (1 Full Page) */}
        {templateType === 'tent' && (
          <div className="w-[134mm] max-h-[238mm] mx-auto p-5 border-2 border-neutral-900 rounded-3xl flex flex-col items-center text-center bg-white my-auto box-border">
            {/* Top Gold Accent Bar */}
            <div className="w-16 h-1 bg-amber-500 rounded-full mb-2.5" />

            {/* Top Logo Crest */}
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-500/40 p-1 flex items-center justify-center mb-2 shadow-none">
              {/* eslint-disable-next-js/no-img-element */}
              <img src={logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
            </div>

            <h1 className="text-lg font-black text-neutral-900 tracking-tight leading-tight mb-0.5">{restaurant.name}</h1>
            {restaurant.tagline && (
              <p className="text-[11px] text-neutral-600 font-medium max-w-xs mb-1.5 leading-snug line-clamp-2">{restaurant.tagline}</p>
            )}

            {/* Digital Menu Luxury Pill */}
            <div className="my-1 px-4 py-0.5 rounded-full bg-neutral-900 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              DIGITAL MENU • የዲጂታል ሜኑ
            </div>

            {/* QR Code Container with Centered Logo */}
            <div className="my-2 p-3 bg-white border-2 border-neutral-900 rounded-2xl relative shadow-none">
              {/* eslint-disable-next-js/no-img-element */}
              <img
                src={qrSvgUri}
                alt="Print QR"
                className="w-[52mm] h-[52mm] block"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 bg-white rounded-xl border border-amber-500 p-1 flex items-center justify-center">
                  {/* eslint-disable-next-js/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Call to action */}
            <p className="text-[11px] text-neutral-800 max-w-xs font-bold mt-0.5">
              በስልክዎ ካሜራ ይቃኙ • Scan with phone camera
            </p>
            <p className="text-[9.5px] text-neutral-600 max-w-xs font-medium mt-0.5">
              {callToAction}
            </p>

            {/* Wi-Fi Info */}
            {includeWifi && wifiSsid && (
              <div className="mt-2.5 pt-2 border-t border-neutral-300 w-full flex items-center justify-center gap-1.5 text-[10px] text-neutral-600 font-mono">
                <span>WiFi: <strong>{wifiSsid}</strong></span>
                {wifiPassword && (
                  <>
                    <span className="text-neutral-400">•</span>
                    <span>Password: <strong>{wifiPassword}</strong></span>
                  </>
                )}
              </div>
            )}

            <p className="text-[8.5px] text-neutral-400 mt-2 font-sans">
              Fold or place in acrylic counter display stand
            </p>
          </div>
        )}

        {/* TEMPLATE 2: 4 LARGE TABLE TENTS (2x2 GRID - 4" x 6" / A6 ACRYLIC SIZE) */}
        {(templateType === 'a4-4' || templateType === 'a4') && (
          <div className="w-full max-w-[190mm] mx-auto flex flex-col justify-between py-1 box-border">
            {/* Cutting guide header */}
            <div className="text-center pb-2 border-b border-neutral-300 mb-2.5 flex-shrink-0">
              <div className="flex items-center justify-center gap-2">
                {/* eslint-disable-next-js/no-img-element */}
                <img src={logoUrl} alt={restaurant.name} className="w-5 h-5 object-contain" />
                <h1 className="text-xs font-bold text-neutral-800 tracking-tight">
                  {restaurant.name} • 4 Large Table Tents (4&quot; × 6&quot; / A6 Acrylic Stand Size)
                </h1>
              </div>
              <p className="text-[9px] text-neutral-500 mt-0.5">
                Cut along dashed lines (✂) to place inside acrylic table stands or counter displays
              </p>
            </div>

            {/* 2 columns x 2 rows = 4 large vertical cards */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[1, 2, 3, 4].map((cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-2 border-dashed border-neutral-300 rounded-2xl p-3.5 bg-white flex flex-col items-center justify-between text-center h-[110mm] max-h-[110mm] box-border relative overflow-hidden"
                >
                  {/* Subtle scissor cutting marks on corners */}
                  <div className="absolute top-1 left-2 text-[8px] text-neutral-400 font-mono select-none">✂ - - -</div>
                  <div className="absolute top-1 right-2 text-[8px] text-neutral-400 font-mono select-none">- - - ✂</div>

                  {/* Top: Gold accent + Brand Logo + Title */}
                  <div className="flex flex-col items-center w-full">
                    <div className="w-10 h-0.5 bg-amber-500 rounded-full mb-1" />
                    <div className="w-7 h-7 rounded-xl bg-white border border-amber-500/40 p-0.5 flex items-center justify-center mb-0.5">
                      {/* eslint-disable-next-js/no-img-element */}
                      <img src={logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-extrabold text-[12px] text-neutral-900 tracking-tight truncate max-w-[85mm] leading-tight">
                      {restaurant.name}
                    </span>
                    <div className="mt-0.5 px-3 py-0.5 rounded-full bg-neutral-900 text-amber-400 font-mono text-[8px] font-bold uppercase tracking-wider">
                      DIGITAL MENU • የዲጂታል ሜኑ
                    </div>
                  </div>

                  {/* Center: High-contrast QR with center logo badge */}
                  <div className="my-1 relative p-1.5 bg-white rounded-xl border border-neutral-200">
                    {/* eslint-disable-next-js/no-img-element */}
                    <img
                      src={qrSvgUri}
                      alt="Menu QR"
                      className="w-[44mm] h-[44mm] block"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 bg-white rounded-lg border border-amber-500 p-0.5 flex items-center justify-center shadow-xs">
                        {/* eslint-disable-next-js/no-img-element */}
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Bilingual Call to action & Wi-Fi */}
                  <div className="w-full flex flex-col items-center">
                    <p className="text-[10px] font-bold text-neutral-800 leading-tight">
                      በስልክዎ ካሜራ ይቃኙ
                    </p>
                    <p className="text-[8.5px] text-neutral-600 font-medium leading-tight mt-0.5">
                      Scan with phone camera to view menu
                    </p>

                    {includeWifi && wifiSsid && (
                      <div className="mt-1 pt-0.5 border-t border-neutral-200 w-full flex items-center justify-center gap-1.5 text-[8px] text-neutral-600 font-mono">
                        <span>WiFi: <strong>{wifiSsid}</strong></span>
                        {wifiPassword && (
                          <>
                            <span className="text-neutral-300">•</span>
                            <span>Pass: <strong>{wifiPassword}</strong></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEMPLATE 3: 6 COMPACT TABLE CARDS (2x3 GRID) */}
        {templateType === 'a4-6' && (
          <div className="w-full max-w-[190mm] mx-auto flex flex-col justify-between py-1 box-border">
            {/* Cutting guide header */}
            <div className="text-center pb-1.5 border-b border-neutral-300 mb-2 flex-shrink-0">
              <div className="flex items-center justify-center gap-2">
                {/* eslint-disable-next-js/no-img-element */}
                <img src={logoUrl} alt={restaurant.name} className="w-4 h-4 object-contain" />
                <h1 className="text-xs font-bold text-neutral-800 tracking-tight">
                  {restaurant.name} • 6 Compact Table Display Cards
                </h1>
              </div>
              <p className="text-[9px] text-neutral-500 mt-0.5">
                Cut along dotted lines (✂) to place on individual dining tables
              </p>
            </div>

            {/* 2 columns x 3 rows = 6 compact vertical cards */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {[1, 2, 3, 4, 5, 6].map((cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-2 border-dashed border-neutral-300 rounded-xl p-2 bg-white flex flex-col items-center justify-between text-center h-[74mm] max-h-[74mm] box-border relative overflow-hidden"
                >
                  {/* Subtle scissor cutting marks on corners */}
                  <div className="absolute top-0.5 left-1.5 text-[7px] text-neutral-400 font-mono select-none">✂ - -</div>
                  <div className="absolute top-0.5 right-1.5 text-[7px] text-neutral-400 font-mono select-none">- - ✂</div>

                  {/* Top: Logo + Restaurant Name + Mini Badge */}
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-4 h-4 rounded-md bg-white border border-amber-500/30 p-0.5 flex items-center justify-center">
                        {/* eslint-disable-next-js/no-img-element */}
                        <img src={logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="font-extrabold text-[10.5px] text-neutral-900 truncate max-w-[70mm] leading-tight">
                        {restaurant.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-amber-400 font-mono text-[7px] font-bold uppercase tracking-wider">
                      DIGITAL MENU • የዲጂታል ሜኑ
                    </span>
                  </div>

                  {/* Center: QR Code with Logo Badge */}
                  <div className="my-0.5 relative p-1 bg-white rounded-lg border border-neutral-200">
                    {/* eslint-disable-next-js/no-img-element */}
                    <img
                      src={qrSvgUri}
                      alt="Menu QR"
                      className="w-[34mm] h-[34mm] block"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-7 h-7 bg-white rounded-md border border-amber-500 p-0.5 flex items-center justify-center shadow-xs">
                        {/* eslint-disable-next-js/no-img-element */}
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Bilingual Call to action */}
                  <div className="w-full flex flex-col items-center">
                    <p className="text-[8.5px] font-bold text-neutral-800 leading-tight">
                      በስልክዎ ካሜራ ይቃኙ • Scan to explore
                    </p>
                    {includeWifi && wifiSsid && (
                      <p className="text-[7px] font-mono text-neutral-500 truncate mt-0.5">
                        WiFi: <strong>{wifiSsid}</strong> {wifiPassword ? `• Pass: ${wifiPassword}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEMPLATE 4: 6 CIRCULAR STICKERS (2x3 GRID) */}
        {templateType === 'sticker' && (
          <div className="w-full max-w-[190mm] mx-auto flex flex-col justify-between py-1 box-border">
            {/* Cutting guide header */}
            <div className="text-center pb-1.5 border-b border-neutral-300 mb-2 flex-shrink-0">
              <div className="flex items-center justify-center gap-2">
                {/* eslint-disable-next-js/no-img-element */}
                <img src={logoUrl} alt={restaurant.name} className="w-4 h-4 object-contain" />
                <h1 className="text-xs font-bold text-neutral-800 tracking-tight">
                  {restaurant.name} • 6 Table & Takeaway QR Stickers
                </h1>
              </div>
              <p className="text-[9px] text-neutral-500 mt-0.5">
                Peel or cut along circular borders for table corners, bar tops, and takeout packaging
              </p>
            </div>

            {/* 2 columns x 3 rows = 6 stickers */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="w-[74mm] h-[74mm] mx-auto rounded-full border-2 border-dashed border-neutral-400 flex flex-col items-center justify-center text-center p-2.5 bg-white box-border relative"
                >
                  <div className="w-6 h-6 mb-0.5 flex items-center justify-center">
                    {/* eslint-disable-next-js/no-img-element */}
                    <img src={logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
                  </div>
                  <h2 className="text-[9.5px] font-black uppercase tracking-wider text-neutral-900 truncate max-w-[60mm] mb-0.5">
                    {restaurant.name}
                  </h2>
                  <div className="my-0.5 relative">
                    {/* eslint-disable-next-js/no-img-element */}
                    <img
                      src={qrSvgUri}
                      alt="Print Sticker QR"
                      className="w-[32mm] h-[32mm] block"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 bg-white rounded-md border border-amber-500 p-0.5 flex items-center justify-center">
                        {/* eslint-disable-next-js/no-img-element */}
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[7.5px] font-mono font-bold bg-neutral-900 text-amber-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    SCAN MENU • ይቃኙ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
