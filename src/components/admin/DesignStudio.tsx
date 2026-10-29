'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Restaurant, ThemeConfig, MenuItem, Category, CustomBadge, HolidayClosure } from '@/types/database';
import { checkWcagContrast } from '@/lib/admin-engine';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { applyThemeTokensToDOM } from '@/components/ThemeManager';
import {
  Palette,
  Type,
  Layout,
  Sliders,
  Check,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ShoppingBag,
  Bell,
  Star,
  Tag,
  Heart,
  Save,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Utensils,
  Moon,
  Sun,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface DesignStudioProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  categories?: Category[];
  onSaveRestaurant: (updates: Partial<Restaurant>) => Promise<Restaurant>;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export function DesignStudio({
  restaurant,
  menuItems,
  categories = [],
  onSaveRestaurant,
  onShowToast,
}: DesignStudioProps) {
  // Active design sub-tab
  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'layout' | 'features' | 'badges' | 'messaging'>('themes');
  const [mobileStudioTab, setMobileStudioTab] = useState<'controls' | 'preview'>('controls');

  // Form State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: restaurant.theme_config?.primaryColor || '#C11221',
    primaryHover: restaurant.theme_config?.primaryHover || '#A50E1B',
    accentColor: restaurant.theme_config?.accentColor || '#F89B22',
    fontFamily: restaurant.theme_config?.fontFamily || 'serif',
    borderRadius: restaurant.theme_config?.borderRadius || 'md',
    defaultMode: restaurant.theme_config?.defaultMode || 'light',
    defaultLayout: restaurant.theme_config?.defaultLayout || 'grid',
    cardStyle: restaurant.theme_config?.cardStyle || 'elevated',
    imageSize: restaurant.theme_config?.imageSize || 'standard',
    priceStyle: restaurant.theme_config?.priceStyle || 'accented',
    badgeStyle: restaurant.theme_config?.badgeStyle || 'vibrant',
  });

  const [featureFlags, setFeatureFlags] = useState(
    restaurant.feature_flags || {
      orders_enabled: true,
      waiter_call_enabled: true,
      bill_request_enabled: true,
      offers_enabled: true,
      dietary_filters_enabled: true,
      favorites_enabled: true,
      calories_enabled: true,
    }
  );

  const [customBadges, setCustomBadges] = useState<CustomBadge[]>(
    restaurant.custom_badges || [
      { id: 'b1', name: 'House Special', color: '#E8590C' },
      { id: 'b2', name: 'Family Recipe', color: '#10B981' },
    ]
  );

  const [customLabels, setCustomLabels] = useState<Record<string, string>>(
    restaurant.custom_labels || {
      callWaiter: 'Call Waiter',
      requestBill: 'Request Bill',
      placeOrder: 'Send to Kitchen',
      soldOut: 'Sold out today',
    }
  );

  const [closedMessage, setClosedMessage] = useState(
    restaurant.closed_message || "We're currently resting! Our kitchen re-opens tomorrow at 7:00 AM."
  );

  const [holidayClosures, setHolidayClosures] = useState<HolidayClosure[]>(
    restaurant.holiday_closures || [
      { date: '2026-12-25', reason: 'Christmas Day' },
      { date: '2027-01-01', reason: 'New Year Day' },
    ]
  );

  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeColor, setNewBadgeColor] = useState('#E8590C');

  // Preview Controls: 'light' | 'dark' & 'list' | 'grid'
  const [previewThemeMode, setPreviewThemeMode] = useState<'dark' | 'light'>('light');
  const [previewLayout, setPreviewLayout] = useState<'grid' | 'list'>(() =>
    restaurant.theme_config?.defaultLayout === 'grid' ? 'grid' : 'list'
  );

  const isDark = previewThemeMode === 'dark';
  const simFontFamily =
    themeConfig.fontFamily === 'serif'
      ? "'Playfair Display', Georgia, serif"
      : themeConfig.fontFamily === 'display'
      ? "'Cinzel', 'Playfair Display', serif"
      : "var(--font-geist-sans), -apple-system, sans-serif";

  const simRadius =
    themeConfig.borderRadius === 'full'
      ? '22px'
      : themeConfig.borderRadius === 'lg'
      ? '16px'
      : themeConfig.borderRadius === 'md'
      ? '12px'
      : '6px';
  const simButtonRadius = themeConfig.borderRadius === 'full' ? '9999px' : simRadius;

  const previewItems =
    menuItems && menuItems.length > 0
      ? menuItems.slice(0, 4)
      : [
          {
            id: 'prev-1',
            name: 'House Special Pizza',
            name_am: 'የቤት ውስጥ ልዩ ፒዛ',
            description: 'Tomato sauce, melted cheese, roasted beef slices, and fresh herbs.',
            price: 1092.5,
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
            is_chefs_pick: true,
            tags: ['special'],
          },
          {
            id: 'prev-2',
            name: 'Classic Mojito',
            name_am: 'ክላሲክ ሞሂቶ',
            description: 'Fresh lemon, crushed mint leaves, sparkling spring soda, and sugar cane syrup.',
            price: 450.0,
            image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80',
            is_chefs_pick: false,
            tags: [],
          },
          {
            id: 'prev-3',
            name: 'Shiro Tegamino',
            name_am: 'ሽሮ ተጋሚኖ በቅቤ',
            description: 'Slow-simmered spiced chickpea stew served in a bubbling clay pot with warm injera.',
            price: 380.0,
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
            is_chefs_pick: false,
            tags: ['fasting'],
          },
          {
            id: 'prev-4',
            name: 'Iced Caramel Macchiato',
            name_am: 'አይስድ ካራሜል ማኪያቶ',
            description: 'Layered rich espresso, chilled whole milk, and buttery vanilla caramel drizzle.',
            price: 295.0,
            image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80',
            is_chefs_pick: true,
            tags: [],
          },
        ];

  // Sync state if restaurant prop updates
  useEffect(() => {
    if (restaurant.theme_config) {
      setThemeConfig((prev) => ({
        ...prev,
        ...restaurant.theme_config,
      }));
    }
    if (restaurant.feature_flags) {
      setFeatureFlags(restaurant.feature_flags);
    }
    if (restaurant.custom_badges) {
      setCustomBadges(restaurant.custom_badges);
    }
    if (restaurant.custom_labels) {
      setCustomLabels(restaurant.custom_labels);
    }
    if (restaurant.closed_message) {
      setClosedMessage(restaurant.closed_message);
    }
    if (restaurant.holiday_closures) {
      setHolidayClosures(restaurant.holiday_closures);
    }
  }, [restaurant]);

  // Contrast check
  const contrastCheck = checkWcagContrast(themeConfig.primaryColor, '#FFFFFF');

  const handlePrimaryColorChange = (color: string) => {
    const updated = { ...themeConfig, primaryColor: color };
    setThemeConfig(updated);
    applyThemeTokensToDOM(updated);
  };

  const handleAccentColorChange = (color: string) => {
    const updated = { ...themeConfig, accentColor: color };
    setThemeConfig(updated);
    applyThemeTokensToDOM(updated);
  };

  // 6 Ready-Made Themes
  const THEME_PRESETS: {
    id: string;
    name: string;
    description: string;
    primary: string;
    hover: string;
    accent: string;
    font: 'serif' | 'sans' | 'display';
    radius: 'sm' | 'md' | 'lg' | 'full';
  }[] = [
    {
      id: 'nitsuh',
      name: 'Nitsuh Crimson & Gold (Official)',
      description: 'Official brand palette with Crimson Red and Warm Golden Amber',
      primary: '#C11221',
      hover: '#A50E1B',
      accent: '#F89B22',
      font: 'serif',
      radius: 'md',
    },
    {
      id: 'amber',
      name: 'Artisanal Amber',
      description: 'Warm, cozy & appetizing for bistros and craft cafés',
      primary: '#E8590C',
      hover: '#D9480F',
      accent: '#F76707',
      font: 'serif',
      radius: 'md',
    },
    {
      id: 'emerald',
      name: 'Botanical Emerald',
      description: 'Fresh, organic feel for plant-forward & farm-to-table dining',
      primary: '#059669',
      hover: '#047857',
      accent: '#10B981',
      font: 'sans',
      radius: 'lg',
    },
    {
      id: 'steakhouse',
      name: 'Ruby Steakhouse',
      description: 'Sophisticated & bold for prime cuts, grills, and wine cellars',
      primary: '#E11D48',
      hover: '#BE123C',
      accent: '#F43F5E',
      font: 'serif',
      radius: 'sm',
    },
    {
      id: 'midnight',
      name: 'Midnight Velvet',
      description: 'Luxe golden accents on deep obsidian for fine dining lounges',
      primary: '#D97706',
      hover: '#B45309',
      accent: '#F59E0B',
      font: 'display',
      radius: 'md',
    },
    {
      id: 'slate',
      name: 'Nordic Slate',
      description: 'Clean, understated minimalism focused purely on gastronomy',
      primary: '#475569',
      hover: '#334155',
      accent: '#64748B',
      font: 'sans',
      radius: 'sm',
    },
    {
      id: 'terracotta',
      name: 'Mediterranean Terracotta',
      description: 'Sun-drenched coastal tones for Italian, Greek, and tapas bars',
      primary: '#EA580C',
      hover: '#C2410C',
      accent: '#FB923C',
      font: 'serif',
      radius: 'full',
    },
  ];

  const handleApplyPreset = (preset: typeof THEME_PRESETS[0]) => {
    triggerHaptic(10);
    const updatedTheme: ThemeConfig = {
      ...themeConfig,
      primaryColor: preset.primary,
      primaryHover: preset.hover,
      accentColor: preset.accent,
      fontFamily: preset.font,
      borderRadius: preset.radius,
    };
    setThemeConfig(updatedTheme);
    setCustomBadges((prev) =>
      prev.map((b, i) => (i === 0 ? { ...b, color: preset.primary } : b))
    );
    applyThemeTokensToDOM(updatedTheme);
    onShowToast(`Applied theme preset: ${preset.name}`, 'success');
  };

  const handleSaveAll = async () => {
    triggerHaptic(15);
    const updated = await onSaveRestaurant({
      theme_config: themeConfig,
      feature_flags: featureFlags,
      custom_badges: customBadges,
      custom_labels: customLabels,
      closed_message: closedMessage,
      holiday_closures: holidayClosures,
    });
    if (updated?.theme_config) {
      applyThemeTokensToDOM(updated.theme_config);
    } else {
      applyThemeTokensToDOM(themeConfig);
    }
    onShowToast('Design settings and brand configuration published.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-7xl mx-auto w-full">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white">Design Studio & Live Preview</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase">
              Interactive Preview
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customize colors, typography, layout, and feature switches with instant live phone reflection.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          data-testid="save-design-btn"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Publish Design Changes</span>
        </button>
      </div>

      {/* Mobile Toggle: Controls vs Live Phone */}
      <div className="flex lg:hidden items-center bg-[#12141C] border border-white/10 rounded-2xl p-1 gap-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            setMobileStudioTab('controls');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mobileStudioTab === 'controls'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Design Controls</span>
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            setMobileStudioTab('preview');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mobileStudioTab === 'preview'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Live Phone Preview</span>
        </button>
      </div>

      {/* Main Two-Column Layout: Controls on Left, Live Phone on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS (7 Cols) */}
        <div className={`lg:col-span-7 flex flex-col gap-5 ${mobileStudioTab === 'controls' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12141C] border border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'themes', label: 'Presets', icon: Layers },
              { id: 'colors', label: 'Colors & Contrast', icon: Palette },
              { id: 'layout', label: 'Style & Fonts', icon: Layout },
              { id: 'features', label: 'Feature Switches', icon: Sliders },
              { id: 'badges', label: 'Custom Badges', icon: Tag },
              { id: 'messaging', label: 'Labels & Hours', icon: Type },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic(8);
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === 'themes' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Ready-Made Design Themes</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Hand-crafted palettes calibrated for dining environments and accessibility.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_PRESETS.map((preset) => {
                  const isCurrent = themeConfig.primaryColor === preset.primary;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/10 shadow-md'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span className="text-xs font-bold text-white">{preset.name}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                        <span>Font: {preset.font}</span>
                        <span>•</span>
                        <span>Radius: {preset.radius}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COLORS & WCAG CONTRAST */}
          {activeTab === 'colors' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Brand Colors & WCAG 2.2 AA Contrast</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Automatic contrast ratio checking ensures elderly or visually impaired diners can read all prices and buttons.
                </p>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      data-testid="design-primary-color"
                      value={themeConfig.primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={themeConfig.primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs uppercase w-32 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Accent / Highlight Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={themeConfig.accentColor}
                      onChange={(e) => handleAccentColorChange(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={themeConfig.accentColor}
                      onChange={(e) => handleAccentColorChange(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs uppercase w-32 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Contrast Checker Warning Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  contrastCheck.passesNormal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {contrastCheck.passesNormal ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold">
                      Contrast Ratio: {contrastCheck.ratio}:1
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        contrastCheck.passesNormal
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {contrastCheck.passesNormal ? 'WCAG AA Pass' : 'Caution'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    {contrastCheck.plainWarning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STYLE & FONTS */}
          {activeTab === 'layout' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Typography & Card Styling</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Fine-tune the culinary aesthetic to match your restaurant's physical interior.
                </p>
              </div>

              {/* Typography Curated List */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Typography Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'serif', name: 'Artisanal Serif', desc: 'Playfair / Georgia' },
                    { id: 'sans', name: 'Modern Sans', desc: 'Inter / Clean' },
                    { id: 'display', name: 'Editorial Display', desc: 'Cinzel / Luxe' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setThemeConfig({ ...themeConfig, fontFamily: font.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        themeConfig.fontFamily === font.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{font.name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{font.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Roundness */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Corner Roundness
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {(['sm', 'md', 'lg', 'full'] as const).map((rad) => (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => setThemeConfig({ ...themeConfig, borderRadius: rad })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold capitalize transition-all ${
                        themeConfig.borderRadius === rad
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {rad}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Style & Image Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Card Style
                  </label>
                  <select
                    value={themeConfig.cardStyle || 'elevated'}
                    onChange={(e) =>
                      setThemeConfig({ ...themeConfig, cardStyle: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="elevated" className="bg-[#12141C]">Elevated (Soft Shadow)</option>
                    <option value="bordered" className="bg-[#12141C]">Bordered (Crisp Lines)</option>
                    <option value="minimal" className="bg-[#12141C]">Minimal (Flat Clean)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Price Accent Style
                  </label>
                  <select
                    value={themeConfig.priceStyle || 'accented'}
                    onChange={(e) =>
                      setThemeConfig({ ...themeConfig, priceStyle: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="accented" className="bg-[#12141C]">Brand Color Accent</option>
                    <option value="bold-mono" className="bg-[#12141C]">Bold Monospace</option>
                    <option value="classic" className="bg-[#12141C]">Classic Subtle</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURE SWITCHES */}
          {activeTab === 'features' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Feature On/Off Switches</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Tailor the customer menu to your exact service model (e.g. view-only vs order list).
                </p>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  {
                    key: 'reviews_enabled',
                    label: 'Dish Reviews & Ratings',
                    desc: 'Allow diners to view 1-5 star reviews and leave authentic feedback.',
                  },
                  {
                    key: 'dietary_filters_enabled',
                    label: 'Dietary Filters (Fasting / የጾም)',
                    desc: 'Quick dietary pills allowing diners to filter dishes by Ethiopian Orthodox fasting.',
                  },
                  {
                    key: 'favorites_enabled',
                    label: 'Guest Favorites / Bookmarking',
                    desc: 'Allow guests to heart dishes to compare while exploring the menu.',
                  },
                  {
                    key: 'offers_enabled',
                    label: 'Promotional Offers & Combo Deals',
                    desc: 'Display automated discount badges, combo deals, and special banners.',
                  },
                  {
                    key: 'amharic_display_enabled',
                    label: 'Bilingual Amharic Titles (የአማርኛ ስሞች)',
                    desc: 'Display authentic Amharic dish names and descriptions beside English titles.',
                  },
                  {
                    key: 'calories_enabled',
                    label: 'Calorie & Nutrition Display',
                    desc: 'Display caloric estimates for health-conscious diners.',
                  },
                ].map((feat) => {
                  const isEnabled = (featureFlags as any)[feat.key] ?? true;
                  return (
                    <div
                      key={feat.key}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{feat.label}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{feat.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(8);
                          setFeatureFlags({
                            ...featureFlags,
                            [feat.key]: !isEnabled,
                          });
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 flex-shrink-0 ${
                          isEnabled ? 'bg-amber-600' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM BADGES */}
          {activeTab === 'badges' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Dish Badges</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Create custom highlights like "House Special", "Family Recipe", or "Secret Menu".
                </p>
              </div>

              {/* Add New Badge Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="Badge name (e.g. Award Winner)"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <input
                  type="color"
                  value={newBadgeColor}
                  onChange={(e) => setNewBadgeColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBadgeName.trim()) return;
                    triggerHaptic(10);
                    setCustomBadges([
                      ...customBadges,
                      {
                        id: `b-${Date.now()}`,
                        name: newBadgeName.trim(),
                        color: newBadgeColor,
                      },
                    ]);
                    setNewBadgeName('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Badge</span>
                </button>
              </div>

              {/* Badge List */}
              <div className="space-y-2 pt-2">
                {customBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: badge.color }}
                      >
                        {badge.name}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">{badge.color}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setCustomBadges(customBadges.filter((b) => b.id !== badge.id));
                      }}
                      className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MESSAGING & HOURS */}
          {activeTab === 'messaging' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Labels & Service Messaging</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Rename buttons and labels to fit your restaurant voice.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Sold-Out Badge Text
                  </label>
                  <input
                    type="text"
                    value={customLabels.soldOut || ''}
                    onChange={(e) =>
                      setCustomLabels({ ...customLabels, soldOut: e.target.value })
                    }
                    placeholder="e.g. Sold out today / ለጊዜው አልቋል"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Table Tray Action Text
                  </label>
                  <input
                    type="text"
                    value={customLabels.viewTray || ''}
                    onChange={(e) =>
                      setCustomLabels({ ...customLabels, viewTray: e.target.value })
                    }
                    placeholder="e.g. View Tray / ዝርዝር እይ"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Custom &quot;We&apos;re Closed&quot; Message
                </label>
                <textarea
                  rows={2}
                  value={closedMessage}
                  onChange={(e) => setClosedMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Scheduled Holiday Closures
                </label>
                <div className="space-y-2">
                  {holidayClosures.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono text-neutral-300">{h.date}</span>
                        <span className="text-white font-medium">({h.reason})</span>
                      </div>
                      <button
                        onClick={() =>
                          setHolidayClosures(holidayClosures.filter((_, idx) => idx !== i))
                        }
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE LIVE PHONE PREVIEW (5 Cols) */}
        <div className={`lg:col-span-5 sticky top-6 ${mobileStudioTab === 'preview' ? 'flex flex-col' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white">Live Phone Simulation</h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Layout Switcher (List vs Grid) */}
              <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setPreviewLayout('list');
                    setThemeConfig((prev) => ({ ...prev, defaultLayout: 'list' }));
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    previewLayout === 'list'
                      ? 'bg-amber-500/25 text-amber-300 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="List Layout"
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setPreviewLayout('grid');
                    setThemeConfig((prev) => ({ ...prev, defaultLayout: 'grid' }));
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    previewLayout === 'grid'
                      ? 'bg-amber-500/25 text-amber-300 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Grid Layout"
                >
                  Grid
                </button>
              </div>

              {/* Theme Mode Toggle (Light vs Dark) */}
              <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-full border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setPreviewThemeMode('light');
                  }}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                    previewThemeMode === 'light'
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setPreviewThemeMode('dark');
                  }}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                    previewThemeMode === 'dark'
                      ? 'bg-neutral-800 text-white shadow-xs border border-white/20'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>

          {/* Phone Mockup Frame */}
          <div
            data-testid="live-phone-preview"
            data-phone-simulation
            data-sim-mode={previewThemeMode}
            className="w-full max-w-[380px] mx-auto rounded-[38px] border-4 border-neutral-700 shadow-2xl overflow-hidden transition-all duration-300 relative select-none"
            style={{
              backgroundColor: isDark ? '#14100E' : '#FAF6F0',
              color: isDark ? '#FFF5EC' : '#1A1412',
              fontFamily: simFontFamily,
            }}
          >
            {/* Phone Speaker Notch */}
            <div className="pt-2 pb-1 flex justify-center bg-black/10">
              <div className="w-14 h-2 rounded-full bg-neutral-800" />
            </div>

            {/* 1. TOP NAVBAR (Authentic Brand Header matching live customer UI) */}
            <div
              className="p-3 border-b flex items-center justify-between transition-colors"
              style={{
                backgroundColor: isDark ? 'rgba(20, 16, 14, 0.98)' : 'rgba(250, 246, 240, 0.98)',
                borderColor: isDark ? '#2E2420' : '#E8DED1',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center font-bold text-white text-[11px] shadow-sm flex-shrink-0"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  {restaurant.logo_url ? (
                    <img
                      src={restaurant.logo_url}
                      alt={restaurant.name}
                      className="w-full h-full object-contain p-0.5"
                    />
                  ) : (
                    <Flame className="w-4 h-4 fill-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs font-black tracking-tight"
                      style={{ color: isDark ? '#FFF5EC' : '#1A1412' }}
                    >
                      {restaurant.name.toLowerCase().includes('nitsuh') ? 'nitsuh' : restaurant.name}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">Foods</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[8px] font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Open Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Navbar Controls */}
              <div className="flex items-center gap-1 text-[9px] font-bold">
                <div
                  className="px-2 py-0.5 rounded-full border flex items-center gap-1"
                  style={{
                    backgroundColor: isDark ? '#1E1815' : '#FFFFFF',
                    borderColor: isDark ? '#3D332C' : '#E8DED1',
                    color: isDark ? '#FFF5EC' : '#1A1412',
                  }}
                >
                  <span>EN</span>
                  <span style={{ color: isDark ? '#6B5E55' : '#C4B7AC' }}>|</span>
                  <span>አማ</span>
                </div>
              </div>
            </div>

            {/* 2. SEARCH BAR & FILTER ICON */}
            <div
              className="px-3 pt-2.5 pb-2 flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: isDark ? '#14100E' : '#FAF6F0',
              }}
            >
              <div
                className="flex-1 h-8 px-2.5 rounded-full border flex items-center gap-2 shadow-xs transition-colors"
                style={{
                  backgroundColor: isDark ? '#1E1815' : '#FFFFFF',
                  borderColor: isDark ? '#3D332C' : '#E8DED1',
                }}
              >
                <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span className="text-[10px] text-neutral-400 truncate">Search for your favorite dish...</span>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0 relative"
                style={{
                  backgroundColor: themeConfig.primaryColor,
                  borderRadius: simButtonRadius,
                }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center border border-white">
                  1
                </span>
              </button>
            </div>

            {/* SCROLLABLE INNER MENU PREVIEW AREA */}
            <div
              className="overflow-y-auto max-h-[420px] px-3 pb-3 space-y-3 transition-colors"
              style={{
                backgroundColor: isDark ? '#14100E' : '#FAF6F0',
              }}
            >
              {/* 3. HERO FOOD PROMO BILLBOARD (Exact replica of HeroFoodBanner from live customer view) */}
              <div
                className="rounded-2xl p-3.5 text-white shadow-lg overflow-hidden relative transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6B1800 0%, #8B2200 50%, #3A0A00 100%)',
                  borderRadius: simRadius,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0 pr-1 space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[8px] font-black uppercase tracking-wider">
                      🔥 25% OFF
                    </span>
                    <h5 className="text-[11px] font-black uppercase tracking-tight leading-tight line-clamp-2">
                      AFTERNOON HAPPY HOUR: 25% OFF CLASSIC MOJITO
                    </h5>
                    <p className="text-[9px] text-amber-100/80 line-clamp-2 leading-relaxed">
                      Enjoy 25% off our handcrafted Classic Mojito prepared with fresh mint and lime.
                    </p>
                    <div className="pt-1">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[9px] font-bold shadow-md"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                      >
                        <span>See offer</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 relative shadow-md border border-white/20">
                    <Image
                      src={previewItems[1]?.image_url || 'https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041074/nitsuh-menu/dishes/iciwxll5jdtr9onzkcl4.jpg'}
                      alt="Featured Offer"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Dot pagination indicator */}
                <div className="flex items-center justify-center gap-1 mt-2.5">
                  <span className="w-3.5 h-1 rounded-full bg-white" />
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                </div>
              </div>

              {/* 4. FASTING PILL FILTER */}
              <div className="flex items-center gap-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1"
                  style={{
                    backgroundColor: isDark ? '#1E1815' : '#FFFFFF',
                    borderColor: isDark ? '#3D332C' : '#E8DED1',
                    color: isDark ? '#B2A398' : '#7A6B60',
                    borderRadius: simButtonRadius,
                  }}
                >
                  <span>🌱 Fasting</span>
                </span>
              </div>

              {/* 5. CIRCULAR FOOD CATEGORY CAROUSEL (Matching live customer UI) */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                {[
                  { id: 'all', name: 'All', icon: '/images/categories/breakfast.jpg', active: false },
                  { id: 'breakfast', name: 'Breakfast', icon: '/images/categories/breakfast.jpg', active: true },
                  { id: 'burger', name: 'Burger', icon: '/images/categories/burger.jpg', active: false },
                  { id: 'pizza', name: 'Pizza', icon: '/images/categories/pizza.jpg', active: false },
                  { id: 'sandwich', name: 'Club Sandwich', icon: '/images/categories/chicken.jpg', active: false },
                  { id: 'mojito', name: 'Mojito', icon: '/images/categories/mojito.jpg', active: false },
                  { id: 'dessert', name: 'Dessert', icon: '/images/categories/dessert.jpg', active: false },
                ].map((cat) => (
                  <div key={cat.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                    <div
                      className={`w-11 h-11 rounded-full p-0.5 transition-all ${
                        cat.active ? 'ring-2 shadow-xs' : 'border'
                      }`}
                      style={{
                        boxShadow: cat.active ? `0 0 0 2px ${themeConfig.primaryColor}` : undefined,
                        borderColor: isDark ? '#3D332C' : '#E8DED1',
                      }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-800">
                        <Image
                          src={cat.icon}
                          alt={cat.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <span
                      className="text-[9px] truncate max-w-[50px] text-center"
                      style={{
                        fontWeight: cat.active ? 800 : 500,
                        color: cat.active ? themeConfig.primaryColor : (isDark ? '#B2A398' : '#7A6B60'),
                      }}
                    >
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* 6. DISHES ON OFFER SECTION */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-red-500" />
                    <span
                      className="text-[11px] font-black tracking-tight"
                      style={{ color: isDark ? '#FFF5EC' : '#1A1412' }}
                    >
                      Dishes on Offer (1)
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-400">1 deal running</span>
                </div>

                {/* Dish Cards Grid / List */}
                <div className={previewLayout === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                  {previewItems.slice(0, previewLayout === 'grid' ? 4 : 3).map((item, idx) => {
                    const isOnOffer = idx === 0 || item.id === 'prev-2';
                    const originalPrice = Number(item.price);
                    const discountedPrice = isOnOffer ? Math.round(originalPrice * 0.75 * 100) / 100 : originalPrice;

                    return (
                      <div
                        key={item.id}
                        className="sim-card border overflow-hidden flex flex-col justify-between transition-all relative"
                        style={{
                          backgroundColor:
                            themeConfig.cardStyle === 'bordered'
                              ? (isDark ? 'transparent' : '#FFFFFF')
                              : (isDark ? '#1E1815' : '#FFFFFF'),
                          borderColor:
                            themeConfig.cardStyle === 'minimal'
                              ? 'transparent'
                              : (isDark ? '#3D332C' : '#E8DED1'),
                          boxShadow:
                            themeConfig.cardStyle === 'elevated'
                              ? (isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.06)')
                              : 'none',
                          borderRadius: simRadius,
                        }}
                      >
                        {/* Food Image Container */}
                        <div className="relative w-full h-24 bg-neutral-800 overflow-hidden">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                          {/* Badge (25% OFF or Chef's Pick) */}
                          {isOnOffer ? (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                              25% OFF
                            </span>
                          ) : item.is_chefs_pick ? (
                            <span
                              className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-xs"
                              style={{ backgroundColor: themeConfig.primaryColor }}
                            >
                              Chef&apos;s Pick
                            </span>
                          ) : null}

                          {/* Heart Favorite Icon */}
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white/90">
                            <Heart className="w-3 h-3" />
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-2 flex flex-col justify-between flex-1 gap-1">
                          <div>
                            <p
                              className="sim-title text-[11px] font-bold truncate leading-tight"
                              style={{ color: isDark ? '#FFF5EC' : '#1A1412' }}
                            >
                              {item.name}
                            </p>
                            {item.name_am && (
                              <p
                                className="text-[9px] truncate"
                                style={{ color: isDark ? '#B2A398' : '#8C7B70' }}
                              >
                                {item.name_am}
                              </p>
                            )}
                          </div>

                          {/* Pricing & Add Button */}
                          <div
                            className="flex items-center justify-between pt-1 border-t mt-1"
                            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
                          >
                            <div className="flex flex-col">
                              {isOnOffer && (
                                <span className="text-[8px] line-through text-neutral-400 font-mono">
                                  {formatMoney(originalPrice, restaurant.currency)}
                                </span>
                              )}
                              <span
                                className="text-[11px] font-mono font-black"
                                style={{ color: themeConfig.primaryColor }}
                              >
                                {formatMoney(discountedPrice, restaurant.currency)}
                              </span>
                            </div>

                            <span
                              className="px-2 py-0.5 text-[9px] font-bold text-white shadow-xs"
                              style={{
                                backgroundColor: themeConfig.primaryColor,
                                borderRadius: simButtonRadius,
                              }}
                            >
                              + Add
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FLOATING BOTTOM BAR SIMULATION */}
            <div
              className="p-2 border-t flex items-center justify-between transition-colors"
              style={{
                backgroundColor: isDark ? '#1A1412' : '#F5EFEB',
                borderColor: isDark ? '#2E2420' : '#E8DED1',
              }}
            >
              <div className="flex items-center gap-1.5 pl-1 text-[10px]">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center">
                  2
                </span>
                <span className="font-bold" style={{ color: isDark ? '#FFF5EC' : '#1A1412' }}>
                  Table 4 • 1,542 ETB
                </span>
              </div>
              <span
                className="px-2.5 py-1 text-[9px] font-black text-white shadow-xs"
                style={{
                  backgroundColor: themeConfig.primaryColor,
                  borderRadius: simButtonRadius,
                }}
              >
                View Tray
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
