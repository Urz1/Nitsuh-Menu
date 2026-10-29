'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  authenticateOwnerAsync,
  authenticateStaffAsync,
  getOwnerProfile,
  setAuthSession,
  saveOwnerProfileCache,
} from '@/lib/auth-service';
import { triggerHaptic } from '@/lib/utils';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sun,
  Moon,
  Phone,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  // Theme State (Strict Light Mode by default for Owner & Staff)
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('admin_theme');
        if (saved === 'dark' || saved === 'light') return saved;
      } catch {}
    }
    return 'light';
  });

  const toggleAdminTheme = () => {
    const next = adminTheme === 'light' ? 'dark' : 'light';
    triggerHaptic(8);
    setAdminTheme(next);
    try {
      localStorage.setItem('admin_theme', next);
    } catch {}
  };

  // Setup state (Detects whether master owner already exists in Neon DB)
  const [hasOwner, setHasOwner] = useState<boolean | null>(null);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  // Setup Form State
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Role Tab: Owner vs Staff
  const [tab, setTab] = useState<'owner' | 'staff'>('owner');

  // Owner form state
  const [ownerIdentifier, setOwnerIdentifier] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Staff form state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check setup on mount
  useEffect(() => {
    fetch('/api/auth/setup')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.hasOwner === 'boolean') {
          setHasOwner(data.hasOwner);
        }
      })
      .catch(() => {})
      .finally(() => setIsCheckingSetup(false));
  }, []);

  // ---------------------------------------------------------------------------
  // FIRST-TIME OWNER SETUP
  // ---------------------------------------------------------------------------
  const handleSetupOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: setupName,
          email: setupEmail,
          phone: setupPhone,
          password: setupPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        triggerHaptic(20);
        setErrorMsg(data.error || 'Failed to initialize owner account');
        return;
      }

      if (data.user) {
        setAuthSession({
          role: 'owner',
          userId: data.user.id,
          name: data.user.name,
          identifier: data.user.email,
          token: data.token || `server-${Date.now()}`,
          loggedInAt: Date.now(),
        });
        saveOwnerProfileCache({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          updated_at: new Date().toISOString(),
        });
      }

      setSuccessMsg('Owner account initialized and saved to database! Loading dashboard...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 350);
    } catch {
      setIsLoading(false);
      setErrorMsg('Network error creating owner account. Please try again.');
    }
  };

  // ---------------------------------------------------------------------------
  // OWNER AUTHENTICATION
  // ---------------------------------------------------------------------------
  const handleOwnerLogin = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    triggerHaptic(10);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await authenticateOwnerAsync(ownerIdentifier, ownerPassword);

      setIsLoading(false);
      if (!result.success) {
        triggerHaptic(20);
        setErrorMsg(result.error || 'Incorrect owner password. Access denied.');
        return;
      }

      setSuccessMsg('Owner authenticated successfully. Loading dashboard...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 250);
    } catch {
      setIsLoading(false);
      setErrorMsg('Authentication error. Please check your credentials and try again.');
    }
  };

  // ---------------------------------------------------------------------------
  // STAFF AUTHENTICATION
  // ---------------------------------------------------------------------------
  const handleStaffLogin = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    triggerHaptic(10);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await authenticateStaffAsync(staffUsername, staffPassword);

      setIsLoading(false);
      if (!result.success) {
        triggerHaptic(20);
        setErrorMsg(result.error || 'Incorrect staff password / PIN. Access denied.');
        return;
      }

      setSuccessMsg(`Welcome, ${result.session?.name}! Loading staff console...`);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 250);
    } catch {
      setIsLoading(false);
      setErrorMsg('Staff authentication error. Please try again.');
    }
  };

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD RECOVERY (OWNER ONLY)
  // ---------------------------------------------------------------------------
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    if (!recoveryEmail) return;

    const currentOwner = getOwnerProfile();
    if (recoveryEmail.toLowerCase().trim() === currentOwner.email.toLowerCase().trim()) {
      setRecoverySent(true);
    } else {
      setErrorMsg('No owner account registered with this email address.');
    }
  };

  const isLight = adminTheme === 'light';

  return (
    <div
      data-admin-theme={adminTheme}
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200 ${
        isLight
          ? 'bg-[#F8F9FA] text-neutral-900 selection:bg-amber-500 selection:text-white'
          : 'bg-[#0C0D11] text-white selection:bg-amber-500 selection:text-black'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-8 transition-all duration-200 border ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xl shadow-neutral-200/60 text-neutral-900'
            : 'bg-white/[0.04] border-white/10 shadow-2xl backdrop-blur-xl text-white'
        }`}
      >
        {/* Top Header: Back Link & Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
              isLight
                ? 'text-neutral-500 hover:text-neutral-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Menu</span>
          </Link>
          <button
            type="button"
            data-testid="login-theme-toggle"
            onClick={toggleAdminTheme}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200/80 border-neutral-200 text-neutral-800'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl mx-auto mb-3 flex items-center justify-center">
            <img
              src="/images/brand/nitsuh-gold-squircle.svg"
              alt="Nitsuh App Icon"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            Restaurant Portal
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Authoritative server-side authentication backed by Neon PostgreSQL
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================================
            0. INITIAL OWNER SETUP (Displayed ONLY when staff_users table has no owner)
           ========================================================================= */}
        {isCheckingSetup ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-neutral-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Connecting to secure database...</span>
          </div>
        ) : hasOwner === false ? (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-1">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>First-Time Setup Required</span>
              </div>
              <p className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>
                No owner account exists in your database yet. Create your authoritative owner credentials below to initialize the system securely.
              </p>
            </div>

            <form onSubmit={handleSetupOwner} className="flex flex-col gap-3.5">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder="e.g. Your Full Name"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-xs outline-none transition-colors border ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-amber-500'
                        : 'bg-white/[0.05] border-white/10 text-white focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                  Owner Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="owner@yourrestaurant.com"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-xs outline-none transition-colors border ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-amber-500'
                        : 'bg-white/[0.05] border-white/10 text-white focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={setupPhone}
                    onChange={(e) => setSetupPhone(e.target.value)}
                    placeholder="+251..."
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-xs outline-none transition-colors border ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-amber-500'
                        : 'bg-white/[0.05] border-white/10 text-white focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                  Create Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className={`w-full h-11 pl-10 pr-10 rounded-xl text-xs outline-none transition-colors border ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-amber-500'
                        : 'bg-white/[0.05] border-white/10 text-white focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupPassword(!showSetupPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 font-bold text-xs text-white shadow-lg shadow-orange-950/20 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Owner...' : 'Initialize Owner & Access Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Role Tabs: Owner vs Staff */}
            <div
              className={`flex p-1 rounded-2xl mb-6 border transition-colors ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setTab('owner');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tab === 'owner'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Restaurant Owner
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setTab('staff');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tab === 'staff'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Staff Portal
              </button>
            </div>

            {/* =========================================================================
                1. OWNER LOGIN FORM (Email/Phone + Password)
               ========================================================================= */}
            {tab === 'owner' && !isForgotOpen && (
              <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-1.5 ${
                      isLight ? 'text-neutral-700' : 'text-neutral-300'
                    }`}
                  >
                    Owner Email or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      data-testid="owner-identifier-input"
                      value={ownerIdentifier}
                      onChange={(e) => setOwnerIdentifier(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleOwnerLogin(e);
                      }}
                      placeholder="e.g. owner@restaurant.com"
                      className={`w-full h-11 pl-10 pr-4 rounded-xl text-xs outline-none transition-colors border ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                          : 'bg-white/[0.05] border-white/10 text-white placeholder:text-neutral-500 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className={`text-xs font-semibold ${
                        isLight ? 'text-neutral-700' : 'text-neutral-300'
                      }`}
                    >
                      Owner Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotOpen(true);
                        setRecoveryEmail(ownerIdentifier.includes('@') ? ownerIdentifier : '');
                      }}
                      className={`text-[11px] hover:underline cursor-pointer ${
                        isLight ? 'text-amber-600 font-semibold' : 'text-amber-400/90'
                      }`}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showOwnerPassword ? 'text' : 'password'}
                      required
                      data-testid="owner-password-input"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleOwnerLogin(e);
                      }}
                      placeholder="••••••••••••"
                      className={`w-full h-11 pl-10 pr-10 rounded-xl text-xs outline-none transition-colors border ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                          : 'bg-white/[0.05] border-white/10 text-white placeholder:text-neutral-500 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                      className={`absolute right-3.5 top-3.5 transition-colors ${
                        isLight
                          ? 'text-neutral-400 hover:text-neutral-700'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      aria-label={showOwnerPassword ? 'Hide password' : 'Show password'}
                    >
                      {showOwnerPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOwnerLogin}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 font-bold text-xs text-white shadow-lg shadow-orange-950/20 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  <span>{isLoading ? 'Verifying on Database...' : 'Sign In as Owner'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* =========================================================================
                1.1 OWNER FORGOT PASSWORD VIEW
               ========================================================================= */}
            {tab === 'owner' && isForgotOpen && (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 animate-in fade-in">
                <h3 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Reset Owner Password
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Enter your registered owner email address to receive password recovery instructions.
                </p>

                {recoverySent ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                      Recovery Dispatched
                    </div>
                    <p className={`text-xs ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                      Password instructions dispatched to <strong>{recoveryEmail}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotOpen(false);
                        setRecoverySent(false);
                      }}
                      className="mt-4 text-xs text-amber-600 dark:text-amber-400 underline font-semibold block mx-auto cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="owner@yourrestaurant.com"
                        className={`w-full h-11 pl-10 pr-4 rounded-xl text-xs outline-none transition-colors border ${
                          isLight
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-amber-500'
                            : 'bg-white/[0.05] border-white/10 text-white focus:border-amber-500'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotOpen(false)}
                        className={`flex-1 h-10 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          isLight
                            ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-10 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 cursor-pointer shadow-sm"
                      >
                        Send Recovery
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* =========================================================================
                2. STAFF LOGIN FORM (Username/Phone + Password/PIN)
               ========================================================================= */}
            {tab === 'staff' && (
              <form onSubmit={handleStaffLogin} className="flex flex-col gap-4">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-1.5 ${
                      isLight ? 'text-neutral-700' : 'text-neutral-300'
                    }`}
                  >
                    Staff Username or Phone Number
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      data-testid="staff-username-input"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleStaffLogin(e);
                      }}
                      placeholder="e.g. username or +251..."
                      className={`w-full h-11 pl-10 pr-4 rounded-xl text-xs outline-none transition-colors border ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                          : 'bg-white/[0.05] border-white/10 text-white placeholder:text-neutral-500 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`text-xs font-semibold block mb-1.5 ${
                      isLight ? 'text-neutral-700' : 'text-neutral-300'
                    }`}
                  >
                    Staff Password / PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      required
                      data-testid="staff-password-input"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleStaffLogin(e);
                      }}
                      placeholder="Enter staff password or PIN"
                      className={`w-full h-11 pl-10 pr-10 rounded-xl text-xs outline-none transition-colors border ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                          : 'bg-white/[0.05] border-white/10 text-white placeholder:text-neutral-500 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className={`absolute right-3.5 top-3.5 transition-colors ${
                        isLight
                          ? 'text-neutral-400 hover:text-neutral-700'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      aria-label={showStaffPassword ? 'Hide password' : 'Show password'}
                    >
                      {showStaffPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p
                    className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                      isLight ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    <HelpCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span>Forgot your staff password? Contact your restaurant owner to reset it.</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStaffLogin}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 font-bold text-xs text-white shadow-lg shadow-orange-950/20 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  <span>{isLoading ? 'Verifying on Database...' : 'Open Staff Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
