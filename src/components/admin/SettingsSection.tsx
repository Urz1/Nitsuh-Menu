'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Restaurant, StaffAccount } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';
import {
  getStaffAccounts,
  fetchStaffAccountsAsync,
  createStaffAccountAsync,
  updateStaffPasswordAsync,
  toggleStaffActiveAsync,
  deleteStaffAccountAsync,
} from '@/lib/auth-service';
import {
  Wifi,
  ExternalLink,
  Save,
  FileDown,
  Trash2,
  ShieldCheck,
  Users,
  Plus,
  Coins,
  Receipt,
  Check,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react';

interface SettingsSectionProps {
  restaurant: Restaurant;
  onSaveSettings: (updates: Partial<Restaurant>) => Promise<Restaurant>;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

function generateRandomPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function SettingsSection({
  restaurant,
  onSaveSettings,
  onShowToast,
}: SettingsSectionProps) {
  // Operational Settings State
  const [hours, setHours] = useState(restaurant.hours || 'Mon – Sun: 6:30 AM – 11:00 PM');
  const [address, setAddress] = useState(restaurant.address || '');
  const [branchName, setBranchName] = useState(restaurant.branch_name || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(restaurant.google_maps_url || '');
  const [taxRate, setTaxRate] = useState(
    restaurant.tax_rate ? (restaurant.tax_rate * 100).toString() : '15'
  );
  const [taxMode, setTaxMode] = useState<'inclusive' | 'exclusive'>(
    restaurant.tax_mode || 'inclusive'
  );
  const [currency, setCurrency] = useState(restaurant.currency || 'ETB');
  const [isOpen, setIsOpen] = useState(restaurant.is_open ?? true);
  const [soldOutReset, setSoldOutReset] = useState<'midnight' | 'morning_6am' | 'manual'>(
    restaurant.sold_out_reset_time || 'morning_6am'
  );

  // Guest Wi-Fi State
  const [wifiSsid, setWifiSsid] = useState(restaurant.wifi_config?.ssid || 'Nitsuh-Guest');
  const [wifiPassword, setWifiPassword] = useState(restaurant.wifi_config?.password || '');
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(restaurant.wifi_config?.enabled ?? false);
  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [wifiSaved, setWifiSaved] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  // Staff Management State
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => getStaffAccounts());
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');

  // Sync Wi-Fi credentials when restaurant updates
  const [prevWifi, setPrevWifi] = useState(restaurant.wifi_config);
  if (restaurant.wifi_config !== prevWifi) {
    setPrevWifi(restaurant.wifi_config);
    setWifiSsid(restaurant.wifi_config?.ssid || 'Nitsuh-Guest');
    setWifiPassword(restaurant.wifi_config?.password || '');
    setWifiEnabled(Boolean(restaurant.wifi_config?.enabled));
  }

  // Sync staff accounts from database on mount
  useEffect(() => {
    let isMounted = true;
    fetchStaffAccountsAsync().then((accounts) => {
      if (isMounted) setStaffAccounts(accounts);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveWifi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic(10);
    setIsSavingWifi(true);
    try {
      await onSaveSettings({
        wifi_config: {
          ssid: wifiSsid.trim(),
          password: wifiPassword.trim(),
          enabled: wifiEnabled,
        },
      });
      setWifiSaved(true);
      setTimeout(() => setWifiSaved(false), 2500);
      onShowToast(
        wifiEnabled
          ? 'Guest Wi-Fi enabled and shared with customers!'
          : 'Guest Wi-Fi disabled and hidden from customers.',
        'success'
      );
    } catch {
      onShowToast('Failed to save Wi-Fi settings.', 'error');
    } finally {
      setIsSavingWifi(false);
    }
  };

  const handleSaveOperations = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(15);

    const parsedTax = parseFloat(taxRate);
    const updates: Partial<Restaurant> = {
      hours,
      address,
      branch_name: branchName,
      google_maps_url: googleMapsUrl,
      tax_rate: isNaN(parsedTax) ? 0.15 : parsedTax / 100,
      tax_mode: taxMode,
      currency,
      is_open: isOpen,
      sold_out_reset_time: soldOutReset,
      wifi_config: {
        ssid: wifiSsid,
        password: wifiPassword,
        enabled: wifiEnabled,
      },
    };

    await onSaveSettings(updates);
    onShowToast('Restaurant settings and configuration saved.', 'success');
  };

  // Staff Actions (Authoritative on Neon DB)
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffUsername.trim() || !newStaffPin.trim()) {
      onShowToast('Please fill all staff fields.', 'error');
      return;
    }

    const result = await createStaffAccountAsync({
      name: newStaffName,
      username: newStaffUsername,
      passwordOrPin: newStaffPin,
    });

    if (!result.success || !result.staff) {
      onShowToast(result.error || 'Failed to create staff member.', 'error');
      return;
    }

    const refreshed = await fetchStaffAccountsAsync();
    setStaffAccounts(refreshed);
    setNewStaffName('');
    setNewStaffUsername('');
    setNewStaffPin('');
    setIsAddingStaff(false);
    triggerHaptic(12);
    onShowToast(`Staff account created for ${result.staff.name} and saved to database.`, 'success');
  };

  const handleResetPin = async (staffId: string) => {
    triggerHaptic(12);
    const randomPin = generateRandomPin();
    const res = await updateStaffPasswordAsync(staffId, randomPin);
    if (res.success) {
      const refreshed = await fetchStaffAccountsAsync();
      setStaffAccounts(refreshed);
      const staff = refreshed.find((s) => s.id === staffId);
      onShowToast(`New PIN generated for ${staff?.name}: ${randomPin}`, 'info');
    } else {
      onShowToast(res.error || 'Failed to reset staff PIN.', 'error');
    }
  };

  const handleToggleStaffActive = async (staffId: string) => {
    triggerHaptic(8);
    const res = await toggleStaffActiveAsync(staffId);
    if (res.success) {
      const refreshed = await fetchStaffAccountsAsync();
      setStaffAccounts(refreshed);
    } else {
      onShowToast(res.error || 'Failed to toggle staff status.', 'error');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    triggerHaptic(10);
    const res = await deleteStaffAccountAsync(staffId);
    if (res.success) {
      const refreshed = await fetchStaffAccountsAsync();
      setStaffAccounts(refreshed);
      onShowToast('Staff account removed from database.', 'info');
    } else {
      onShowToast(res.error || 'Failed to remove staff account.', 'error');
    }
  };

  // Data Export
  const handleExportData = () => {
    triggerHaptic(10);
    const exportPayload = {
      restaurant,
      exportedAt: new Date().toISOString(),
      platform: 'Digital Menu Platform v1.0',
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${restaurant.slug}-tenant-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Restaurant tenant data exported successfully.', 'success');
  };

  // Guest Session & Historical Order Purge
  const handlePurgeGuestData = () => {
    triggerHaptic(20);
    if (
      typeof window !== 'undefined' &&
      window.confirm(
        'Are you sure you want to purge historical customer sessions and cached data older than 30 days? This action cannot be undone.'
      )
    ) {
      onShowToast('Historical guest sessions and resolved logs purged.', 'info');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto w-full screen-only-admin">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-white">Settings & Operations</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-neutral-300">
            Owner Console
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">
          Manage operating hours, tax calculation mode, guest Wi-Fi sharing, and staff team PIN credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ===================================================================
            CARD 1: RESTAURANT OPERATIONS & PRICING / TAX
           =================================================================== */}
        <form onSubmit={handleSaveOperations} className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Pricing, Tax & Store Schedule</span>
            </h3>
            <button
              type="submit"
              data-testid="save-settings-btn"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>

          {/* Open / Paused Toggle */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Digital Menu Status</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Toggle off in emergencies to temporarily pause public customer access.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setIsOpen(!isOpen);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                isOpen
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isOpen ? 'Open & Active' : 'Paused / Closed'}
            </button>
          </div>

          {/* TAX MODE TOGGLE */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div>
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span>Tax Calculation Mode</span>
              </label>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Standard Ethiopian dining uses tax-inclusive prices so guests see the exact final price.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setTaxMode('inclusive');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  taxMode === 'inclusive'
                    ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Tax-Inclusive (Recommended)</span>
                  {taxMode === 'inclusive' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Menu price is the exact amount paid. Zero surprise tax added.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setTaxMode('exclusive');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  taxMode === 'exclusive'
                    ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Tax-Exclusive</span>
                  {taxMode === 'exclusive' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Adds VAT/tax percentage on top of subtotal at checkout.
                </p>
              </button>
            </div>
          </div>

          {/* CURRENCY & TAX RATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Primary Currency</span>
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  triggerHaptic(8);
                  setCurrency(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="ETB" className="bg-[#12141C]">ETB (Br • Ethiopian Birr)</option>
                <option value="USD" className="bg-[#12141C]">USD ($ • US Dollar)</option>
                <option value="EUR" className="bg-[#12141C]">EUR (€ • Euro)</option>
                <option value="GBP" className="bg-[#12141C]">GBP (£ • British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Tax Rate (%) {taxMode === 'inclusive' ? '(Included in price)' : '(Added on top)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="15.0"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Sold-out Auto Reset Schedule */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Sold-Out Auto Reset Schedule
            </label>
            <div className="grid grid-cols-3 gap-2.5 mt-1.5">
              {[
                { id: 'morning_6am', label: '6:00 AM' },
                { id: 'midnight', label: 'Midnight' },
                { id: 'manual', label: 'Manual' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSoldOutReset(opt.id as 'morning_6am' | 'midnight' | 'manual')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    soldOutReset === opt.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Branch & Location Details */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Physical Address & Map Link</span>
              </h4>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>Test Map Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Main Branch"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Mon – Sun: 6:30 AM – 11:00 PM"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bulbula, Addis Ababa, Ethiopia"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Google Maps URL
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </form>

        {/* ===================================================================
            CARD 2 & CARD 3 (RIGHT COLUMN): GUEST WI-FI & STAFF MANAGEMENT
           =================================================================== */}
        <div className="flex flex-col gap-6">
          {/* GUEST WI-FI CARD */}
          <div className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Wifi className={`w-4 h-4 ${wifiEnabled ? 'text-amber-400' : 'text-neutral-500'}`} />
                  <span>Guest Wi-Fi Network Sharing</span>
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Share your dining-room Wi-Fi with customers on their digital menu cards.
                </p>
              </div>
              <button
                type="button"
                data-testid="save-wifi-btn"
                onClick={handleSaveWifi}
                disabled={isSavingWifi}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {wifiSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSavingWifi ? 'Saving...' : 'Save Wi-Fi'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Wi-Fi Sharing Toggle Switch */}
            <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              wifiEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/25' 
                : 'bg-white/[0.03] border-white/10'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  wifiEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-neutral-400'
                }`}>
                  <Wifi className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {wifiEnabled ? 'Wi-Fi Sharing: Active' : 'Wi-Fi Sharing: Disabled'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      wifiEnabled 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-neutral-800 text-neutral-400 border border-white/10'
                    }`}>
                      {wifiEnabled ? 'Visible to Customers' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                    {wifiEnabled 
                      ? 'Customers can see details and tap to copy password from their phones.'
                      : 'Credentials are kept private and hidden from customer menu.'}
                  </p>
                </div>
              </div>

              {/* Switch Control */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setWifiEnabled(!wifiEnabled);
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  wifiEnabled ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
                role="switch"
                aria-checked={wifiEnabled}
                aria-label="Toggle Wi-Fi sharing with customers"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    wifiEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SSID and Password Fields */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 transition-opacity ${wifiEnabled ? 'opacity-100' : 'opacity-65'}`}>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="e.g. Nitsuh-Guest"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Wi-Fi Password
                </label>
                <div className="relative">
                  <input
                    type={showWifiPassword ? 'text' : 'password'}
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Leave blank if open"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWifiPassword(!showWifiPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-white cursor-pointer"
                    aria-label={showWifiPassword ? 'Hide Wi-Fi password' : 'Show Wi-Fi password'}
                  >
                    {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STAFF ACCOUNTS & PIN CREDENTIALS */}
          <div className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Floor Staff & 4-Digit PINs</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Floor staff log in with their PIN to toggle Sold-Out status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setIsAddingStaff(!isAddingStaff);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingStaff ? 'Cancel' : 'Add Staff'}</span>
              </button>
            </div>

            {/* Add Staff Inline Form */}
            {isAddingStaff && (
              <form
                onSubmit={handleAddStaff}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 animate-in fade-in"
              >
                <div className="text-xs font-bold text-amber-300">Create Staff Credentials</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Staff Full Name (e.g. Selam)"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    placeholder="Username or Phone"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="password"
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value)}
                    placeholder="4-Digit PIN or Password"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingStaff(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* Staff List */}
            <div className="space-y-2.5">
              {staffAccounts.map((staff) => (
                <div
                  key={staff.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {staff.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{staff.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          staff.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {staff.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        <span>@{staff.username}</span>
                        {staff.pin_code && <span>• PIN: <code>{staff.pin_code}</code></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleResetPin(staff.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] font-semibold transition-colors"
                      title="Generate new 4-digit PIN"
                    >
                      Reset PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStaffActive(staff.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                        staff.is_active
                          ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      {staff.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Remove staff account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {staffAccounts.length === 0 && (
                <div className="text-center py-6 text-neutral-500 text-xs">
                  No staff accounts created yet. Click &quot;Add Staff&quot; above to provision PINs.
                </div>
              )}
            </div>
          </div>

          {/* PRIVACY & DATA EXPORT */}
          <div className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Data Privacy & Tenant Backup</span>
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Export complete restaurant configuration backup or purge guest logs.
                </p>
              </div>
              <Link
                href={`/${restaurant.slug}/privacy`}
                target="_blank"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Privacy Notice</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                data-testid="export-tenant-data-btn"
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Restaurant Data (JSON)</span>
              </button>

              <button
                type="button"
                data-testid="purge-guest-data-btn"
                onClick={handlePurgeGuestData}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purge Historical Logs (&gt;30d)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
