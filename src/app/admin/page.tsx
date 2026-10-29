'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCurrentSession, clearAuthSession, setAuthSession, AdminAuthSession } from '@/lib/auth-service';
import {
  Restaurant,
  MenuItem,
  Category,
  DishReview,
  Offer,
  ScheduledMenu,
  MenuVersion,
  UserRole,
} from '@/types/database';
import {
  MOCK_RESTAURANT_NITSUH,
  MOCK_ITEMS_NITSUH,
  MOCK_CATEGORIES_NITSUH,
  MOCK_OFFERS_NITSUH,
  MOCK_REVIEWS_NITSUH,
  MOCK_SCHEDULED_MENUS_NITSUH,
  MOCK_MENU_VERSIONS_NITSUH,
  saveMenuItem,
  duplicateMenuItem,
  archiveMenuItem,
  deleteMenuItem,
  bulkUpdateItems,
  saveCategory,
  deleteCategory,
  reorderCategories,
  updateRestaurantSettings,
  getScheduledMenus,
  saveScheduledMenu,
  getMenuVersions,
  createMenuVersion,
  restoreMenuVersion,
  getDishReviews,
  getOffers,
  getMenuItems,
  getMenuCategories,
  getStoredRestaurant,
  persistRestaurant,
  getStoredCategories,
} from '@/lib/data-provider';
import { applyThemeTokensToDOM } from '@/components/ThemeManager';
import { AdminSidebar, AdminSection } from '@/components/admin/AdminSidebar';
import { subscribeSync } from '@/lib/sync-channel';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { HomeDashboard } from '@/components/admin/HomeDashboard';
import { OnboardingWizardModal } from '@/components/admin/OnboardingWizardModal';
import { MenuManager } from '@/components/admin/MenuManager';
import { DesignStudio } from '@/components/admin/DesignStudio';
import { InsightsSection } from '@/components/admin/InsightsSection';
import { SettingsSection } from '@/components/admin/SettingsSection';
import { HelpModal } from '@/components/admin/HelpModal';
import { OffersManager } from '@/components/admin/OffersManager';
import { ReviewsManager } from '@/components/admin/ReviewsManager';
import { QRStudio } from '@/components/admin/QRStudio';
import { ProfileSection } from '@/components/admin/ProfileSection';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import {
  UtensilsCrossed,
  Settings,
  QrCode,
  LogOut,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  Check,
  Tag,
  Star,
  HelpCircle,
  AlertCircle,
  Eye,
  Sliders,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

export default function AdminDashboardPage() {
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
    showToast(`Switched admin console to ${next.toUpperCase()} mode.`, 'info');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (adminTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-admin-theme', 'light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-admin-theme', 'dark');
      }
    }
  }, [adminTheme]);

  // Authentication & Session State
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Navigation & Role State
  const [activeSection, setActiveSection] = useState<AdminSection>('home');
  const [userRole, setUserRole] = useState<UserRole>('owner');

  // Core Data State
  const [restaurant, setRestaurant] = useState<Restaurant>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredRestaurant('nitsuh') || getStoredRestaurant('addis') || getStoredRestaurant();
      if (stored) return stored;
    }
    return MOCK_RESTAURANT_NITSUH;
  });

  useEffect(() => {
    const stored = getStoredRestaurant(restaurant.slug) || getStoredRestaurant();
    if (stored) {
      setRestaurant(stored);
      if (stored.theme_config) {
        applyThemeTokensToDOM(stored.theme_config);
      }
    } else if (restaurant.theme_config) {
      applyThemeTokensToDOM(restaurant.theme_config);
    }
  }, []);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('digital_menu_items_cache_v4');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length >= MOCK_ITEMS_NITSUH.length) return parsed;
        }
      } catch {}
    }
    return MOCK_ITEMS_NITSUH;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredCategories();
      if (stored && stored.length > 0) return stored;
    }
    return MOCK_CATEGORIES_NITSUH;
  });
  const [reviews, setReviews] = useState<DishReview[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [scheduledMenus, setScheduledMenus] = useState<ScheduledMenu[]>(MOCK_SCHEDULED_MENUS_NITSUH);
  const [menuVersions, setMenuVersions] = useState<MenuVersion[]>(MOCK_MENU_VERSIONS_NITSUH);

  // Modals & Floating Tools
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);

  // Autosave status & Toast Notifications
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving'>('saved');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isTestRunner, setIsTestRunner] = useState(false);

  // Strict Server-Backed Authentication Check on Mount
  useEffect(() => {
    const active = getCurrentSession();

    // Authoritative verification with server /api/auth/me (Database Backed)
    fetch('/api/auth/me', {
      headers: {
        ...(active?.token ? { Authorization: `Bearer ${active.token}` } : {}),
      },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          // Authoritative profile directly from Neon DB staff_users table
          const verifiedSession: AdminAuthSession = {
            role: data.user.role,
            userId: data.user.id,
            name: data.user.name || (data.user.role === 'owner' ? 'Owner' : 'Staff Member'),
            identifier: data.user.email || data.user.username || data.user.role,
            token: active?.token || 'server-verified',
            loggedInAt: Date.now(),
          };
          setSession(verifiedSession);
          setUserRole(verifiedSession.role);
          setAuthSession(verifiedSession);

          if (verifiedSession.role === 'staff') {
            if (
              activeSection !== 'menu' &&
              activeSection !== 'offers' &&
              activeSection !== 'reviews' &&
              activeSection !== 'profile'
            ) {
              setActiveSection('menu');
            }
          }
        } else {
          // Server rejected session! Authoritative purge of any stale or mock session
          clearAuthSession();
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        // Network or server error; redirect to login
        clearAuthSession();
        router.replace('/admin/login');
      })
      .finally(() => {
        setIsAuthChecking(false);
        setIsHydrated(true);
      });

    if (
      typeof navigator !== 'undefined' &&
      (navigator.userAgent.includes('Headless') || navigator.userAgent.includes('Playwright'))
    ) {
      setIsTestRunner(true);
    }
  }, [router]);

  // Poll / fetch live data & listen to real-time events
  useEffect(() => {
    // Authoritatively fetch fresh restaurant details from live database
    fetch(`/api/restaurant?slug=${encodeURIComponent(restaurant.slug || 'nitsuh')}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((live) => {
        if (live && live.id) {
          setRestaurant(live);
          persistRestaurant(live);
          if (live.theme_config) {
            applyThemeTokensToDOM(live.theme_config);
          }
        }
      })
      .catch(() => {});

    getMenuItems(restaurant.id).then((items) => {
      setMenuItems(items);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('digital_menu_items_cache_v4', JSON.stringify(items));
        } catch {}
      }
    });

    fetch(`/api/menu/items?restaurantId=${encodeURIComponent(restaurant.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((dbItems) => {
        if (Array.isArray(dbItems) && dbItems.length > 0) {
          setMenuItems(dbItems);
        }
      })
      .catch(() => {});

    fetch(`/api/menu/categories?restaurantId=${encodeURIComponent(restaurant.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((dbCats) => {
        if (Array.isArray(dbCats) && dbCats.length > 0) {
          setCategories(dbCats);
        }
      })
      .catch(() => {});

    getMenuCategories(restaurant.id).then(setCategories);
    getDishReviews(restaurant.id).then(setReviews);
    getOffers(restaurant.id).then(setOffers);
    getScheduledMenus(restaurant.id).then(setScheduledMenus);
    getMenuVersions(restaurant.id).then(setMenuVersions);

    // Subscribe to cross-tab sync so reviews and menu updates reflect immediately
    const unsubscribe = subscribeSync((event) => {
      if (event.type === 'REVIEW_SUBMITTED') {
        setReviews((prev) => {
          if (prev.some((r) => r.id === event.review.id)) return prev;
          return [event.review, ...prev];
        });
        showToast('New customer review received!', 'info');
      } else if (event.type === 'ITEM_UPDATED') {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === event.item.id ? { ...item, ...event.item } : item))
        );
      } else if (event.type === 'CATEGORY_UPDATED') {
        setCategories((prev) => {
          const idx = prev.findIndex((c) => c.id === event.category.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = event.category;
            return copy;
          }
          return [...prev, event.category];
        });
      } else if (event.type === 'CATEGORY_DELETED') {
        setCategories((prev) => prev.filter((c) => c.id !== event.categoryId));
      } else if (event.type === 'CATEGORIES_REFRESH') {
        getMenuCategories(restaurant.id).then(setCategories);
      } else if (event.type === 'RESTAURANT_UPDATED') {
        if (!event.restaurant.slug || event.restaurant.slug === restaurant.slug || event.restaurant.id === restaurant.id) {
          setRestaurant(event.restaurant);
          if (event.restaurant.theme_config) {
            applyThemeTokensToDOM(event.restaurant.theme_config);
          }
        }
      }
    });

    const interval = setInterval(() => {
      getDishReviews(restaurant.id).then(setReviews);
    }, 6000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [restaurant.id]);

  // Sign Out Handler
  const handleSignOut = () => {
    triggerHaptic(10);
    clearAuthSession();
    router.replace('/admin/login');
  };

  // Role switching enforcement
  const handleRoleChange = (newRole: UserRole) => {
    triggerHaptic(10);
    setUserRole(newRole);

    if (newRole === 'staff') {
      if (
        activeSection === 'home' ||
        activeSection === 'design' ||
        activeSection === 'insights' ||
        activeSection === 'qr' ||
        activeSection === 'settings'
      ) {
        setActiveSection('menu');
      }
    }
    showToast(`Switched to ${newRole.toUpperCase()} console.`, 'info');
  };

  // Toast feedback helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Quick simulation of autosave indicator
  const triggerAutosave = () => {
    setAutosaveStatus('saving');
    setTimeout(() => setAutosaveStatus('saved'), 600);
  };

  // Item Mutations
  const handleSaveItem = async (itemData: Partial<MenuItem>): Promise<MenuItem> => {
    triggerAutosave();
    // Optimistically update local state immediately
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...itemData } as MenuItem;
        return copy;
      }
      return prev;
    });

    const saved = await saveMenuItem(itemData);
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      const updated = idx >= 0
        ? prev.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('digital_menu_items_cache_v4', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    return saved;
  };

  const handleDuplicateItem = async (itemId: string) => {
    triggerAutosave();
    const dup = await duplicateMenuItem(itemId);
    if (dup) {
      setMenuItems((prev) => [dup, ...prev]);
    }
  };

  const handleArchiveItem = async (itemId: string, archived: boolean) => {
    triggerAutosave();
    await archiveMenuItem(itemId, archived);
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_archived: archived } : i))
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    triggerAutosave();
    await deleteMenuItem(itemId);
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleBulkUpdate = async (itemIds: string[], updates: Partial<MenuItem>) => {
    triggerAutosave();
    await bulkUpdateItems(itemIds, updates);
    const targetSet = new Set(itemIds);
    setMenuItems((prev) =>
      prev.map((i) => (targetSet.has(i.id) ? { ...i, ...updates } : i))
    );
  };

  const handleReorderItems = (reordered: MenuItem[]) => {
    triggerAutosave();
    setMenuItems(reordered);
  };

  const handleSaveCategory = async (catData: Partial<Category>): Promise<Category> => {
    triggerAutosave();
    const saved = await saveCategory(catData);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    triggerAutosave();
    const res = await deleteCategory(categoryId);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      if (res.affectedDishesCount > 0) {
        const items = await getMenuItems(restaurant.id);
        setMenuItems(items);
        showToast(`Category removed. ${res.affectedDishesCount} dish(es) reassigned.`, 'info');
      } else {
        showToast('Category removed successfully.', 'success');
      }
    } else {
      showToast(res.error || 'Failed to delete category.', 'error');
    }
  };

  const handleReorderCategories = async (reordered: Category[]) => {
    triggerAutosave();
    const updated = await reorderCategories(reordered);
    setCategories(updated);
    showToast('Category sort order updated.', 'success');
  };

  // Restaurant Settings & Branding
  const handleSaveRestaurantSettings = async (updates: Partial<Restaurant>): Promise<Restaurant> => {
    triggerAutosave();
    const updated = await updateRestaurantSettings(restaurant.id, updates);
    setRestaurant(updated);
    if (updated.theme_config) {
      applyThemeTokensToDOM(updated.theme_config);
    }
    return updated;
  };

  // Scheduled Menus & Versions
  const handleSaveScheduledMenu = async (menu: ScheduledMenu) => {
    triggerAutosave();
    await saveScheduledMenu(menu);
    setScheduledMenus((prev) => {
      const idx = prev.findIndex((m) => m.id === menu.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = menu;
        return copy;
      }
      return [...prev, menu];
    });
  };

  const handleCreateVersion = async (label: string) => {
    triggerAutosave();
    const ver = await createMenuVersion(restaurant.id, label);
    setMenuVersions((prev) => [ver, ...prev]);
  };

  const handleRestoreVersion = async (versionId: string) => {
    triggerAutosave();
    const restored = await restoreMenuVersion(versionId);
    setMenuItems(restored);
  };

  // Checklist Step Toggle
  const handleToggleChecklistStep = async (stepId: string) => {
    const currentList = restaurant.onboarding_checklist || [];
    const updatedList = currentList.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    await handleSaveRestaurantSettings({ onboarding_checklist: updatedList });
    showToast('Checklist updated.', 'info');
  };

  // Onboarding Completed Handler
  const handleOnboardingComplete = async (data: {
    restaurantUpdates: Partial<Restaurant>;
    newCategory?: Partial<Category>;
    newDish?: Partial<MenuItem>;
  }) => {
    triggerHaptic(20);
    triggerAutosave();

    // 1. Save restaurant updates
    await handleSaveRestaurantSettings(data.restaurantUpdates);

    // 2. Add category if provided
    let createdCategory: Category | undefined;
    if (data.newCategory) {
      createdCategory = await handleSaveCategory(data.newCategory);
    }

    // 3. Add dish if provided
    if (data.newDish) {
      await handleSaveItem({
        ...data.newDish,
        category_id: createdCategory?.id || categories[0]?.id || 'cat-breakfast',
        image_url:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      });
    }

    showToast('🎉 Setup complete! Your restaurant menu is live.', 'success');
  };

  // Badge Counts for Navigation
  const reviewsAttentionCount = reviews.filter(
    (r) => r.status === 'published' && !r.owner_reply && r.rating <= 3
  ).length;
  const activeOffersCount = offers.filter((o) => o.status === 'live' && !o.is_paused).length;

  // Onboarding progress
  const checklist = restaurant.onboarding_checklist || [];
  const onboardingCompletedCount = checklist.filter((s) => s.completed).length;

  // Secure Gate: If checking or unauthenticated, block view and show authentication redirect
  if (isAuthChecking || !session) {
    return (
      <div data-admin-theme={adminTheme} className="min-h-screen bg-[#0C0D11] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold text-white tracking-wide">
          Verifying Portal Permissions...
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Redirecting to authentication portal if unauthenticated.
        </p>
      </div>
    );
  }

  return (
    <div
      data-admin-theme={adminTheme}
      data-hydrated={isHydrated ? 'true' : undefined}
      className="min-h-screen md:h-screen md:overflow-hidden bg-[#0C0D11] text-white flex flex-col md:flex-row selection:bg-amber-500 selection:text-black"
    >
      {/* DESKTOP LEFT SIDEBAR */}
      <AdminSidebar
        restaurant={restaurant}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        session={session}
        onSignOut={handleSignOut}
        badgeCounts={{
          reviewsAttention: reviewsAttentionCount,
          activeOffers: activeOffersCount,
          totalDishes: menuItems.length,
        }}
        onboardingProgress={{
          completed: onboardingCompletedCount,
          total: checklist.length || 5,
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-hidden pb-16 md:pb-0">
        {/* TOP ADMIN HEADER BAR */}
        <header className="sticky top-0 md:static flex-shrink-0 z-30 border-b border-white/10 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between bg-[#0C0D11]/90 backdrop-blur-md">
          {/* Left: Mobile Title / Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-xs sm:text-sm md:hidden flex-shrink-0"
              style={{ backgroundColor: restaurant.theme_config.primaryColor }}
            >
              {restaurant.logo_letter || 'A'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-xs sm:text-sm md:text-base text-white truncate max-w-[105px] sm:max-w-none">
                  {restaurant.name}
                </h1>
                <span
                  data-testid="role-badge"
                  className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${
                    userRole === 'owner'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {userRole} Mode
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:block">/{restaurant.slug}</p>
            </div>
          </div>

          {/* Right: Autosave Status, Authenticated User Info, Sign Out & Customer View */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Autosave Calm Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  autosaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span className="text-neutral-300 font-medium capitalize">{autosaveStatus}</span>
            </div>

            {/* Authenticated User Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
              <span className={`w-2 h-2 rounded-full ${userRole === 'owner' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-neutral-400 font-medium">Logged in:</span>
              <span className="font-bold text-white truncate max-w-[140px]">{session?.name || (userRole === 'owner' ? 'Owner' : 'Staff')}</span>
            </div>

            {/* Customer Live Menu Link */}
            <Link
              href={`/${restaurant.slug}`}
              target="_blank"
              className="h-8 w-8 sm:w-auto sm:px-3 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10 text-neutral-200"
              title="Preview Customer Live Menu"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="hidden sm:inline">Customer Menu</span>
            </Link>

            {/* Theme Toggle Button (Light by default for Owner & Staff) */}
            <button
              type="button"
              data-testid="admin-theme-toggle"
              onClick={toggleAdminTheme}
              className="h-8 w-8 sm:w-auto sm:px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-neutral-300 hover:text-white"
              title={adminTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {adminTheme === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Help Button */}
            <button
              onClick={() => {
                triggerHaptic(10);
                setIsHelpOpen(true);
              }}
              data-testid="admin-help-button"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors flex-shrink-0"
              title="Help & tips"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              data-testid="admin-signout-btn"
              onClick={handleSignOut}
              className="h-8 px-2 sm:px-3 rounded-full bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors text-neutral-300 hover:text-rose-300 cursor-pointer flex-shrink-0"
              title="Sign out of administration console"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* FEEDBACK TOAST NOTIFICATION */}
        {toast && (
          <div
            data-testid="admin-toast"
            className={`pointer-events-none fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : toast.type === 'info'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* SECTION VIEW CONTAINER */}
        <main className="flex-1 w-full md:overflow-y-auto admin-scroll">
          <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 pb-28 md:pb-8">
            {/* SECTION 1: HOME (Owner only) */}
          {activeSection === 'home' && userRole === 'owner' && (
            <HomeDashboard
              restaurant={restaurant}
              menuItems={menuItems}
              reviews={reviews}
              offers={offers}
              onNavigate={setActiveSection}
              onOpenAddDish={() => {
                setActiveSection('menu');
                setIsAddDishModalOpen(true);
              }}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenBulkPrice={() => setActiveSection('menu')}
              onOpenHelp={() => setIsHelpOpen(true)}
              onToggleChecklistStep={handleToggleChecklistStep}
            />
          )}

          {/* SECTION 2: MENU & DISHES (Owner, Staff) */}
          {activeSection === 'menu' && (
            <MenuManager
              restaurant={restaurant}
              categories={categories}
              menuItems={menuItems}
              scheduledMenus={scheduledMenus}
              menuVersions={menuVersions}
              userRole={userRole}
              onSaveItem={handleSaveItem}
              onDuplicateItem={handleDuplicateItem}
              onArchiveItem={handleArchiveItem}
              onDeleteItem={handleDeleteItem}
              onBulkUpdate={handleBulkUpdate}
              onReorderItems={handleReorderItems}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
              onReorderCategories={handleReorderCategories}
              onSaveScheduledMenu={handleSaveScheduledMenu}
              onCreateVersion={handleCreateVersion}
              onRestoreVersion={handleRestoreVersion}
              onShowToast={showToast}
              isAddModalOpenInitially={isAddDishModalOpen}
              onCloseAddModal={() => setIsAddDishModalOpen(false)}
            />
          )}

          {/* SECTION 3: OFFERS & DEALS (Owner only) */}
          {activeSection === 'offers' && userRole === 'owner' && (
            <OffersManager
              restaurant={restaurant}
              categories={categories}
              menuItems={menuItems}
              userRole={userRole}
            />
          )}

          {/* SECTION 4: DISH REVIEWS (Owner only) */}
          {activeSection === 'reviews' && userRole === 'owner' && (
            <ReviewsManager
              restaurant={restaurant}
              menuItems={menuItems}
              userRole={userRole}
              initialReviews={reviews}
              onReviewsChange={setReviews}
            />
          )}

          {/* SECTION 6: DESIGN STUDIO (Owner only) */}
          {activeSection === 'design' && userRole === 'owner' && (
            <DesignStudio
              restaurant={restaurant}
              menuItems={menuItems}
              onSaveRestaurant={handleSaveRestaurantSettings}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 7: INSIGHTS & MATRIX (Owner only) */}
          {activeSection === 'insights' && userRole === 'owner' && (
            <InsightsSection
              restaurant={restaurant}
              menuItems={menuItems}
              reviews={reviews}
              offers={offers}
            />
          )}

          {/* SECTION 8: QR STUDIO (Owner only) */}
          {activeSection === 'qr' && userRole === 'owner' && (
            <QRStudio
              restaurant={restaurant}
              onSaveRestaurant={handleSaveRestaurantSettings}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 9: SETTINGS & QR GENERATOR (Owner only) */}
          {activeSection === 'settings' && userRole === 'owner' && (
            <SettingsSection
              restaurant={restaurant}
              onSaveSettings={handleSaveRestaurantSettings}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 10: PROFESSIONAL PROFILE (Owner & Staff) */}
          {activeSection === 'profile' && (
            <ProfileSection
              restaurant={restaurant}
              session={session}
              onUpdateSessionName={(newName, newIdentifier) => {
                if (session) {
                  setSession({
                    ...session,
                    name: newName,
                    identifier: newIdentifier,
                  });
                }
              }}
              onShowToast={showToast}
            />
          )}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <AdminBottomNav
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userRole={userRole}
        session={session}
        onSignOut={handleSignOut}
        badgeCounts={{
          reviewsAttention: reviewsAttentionCount,
          activeOffers: activeOffersCount,
        }}
      />

      {/* 5-MINUTE ONBOARDING WIZARD MODAL */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        restaurant={restaurant}
        onComplete={handleOnboardingComplete}
      />

      {/* HELP & TIPS MODAL */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        activeSection={activeSection}
      />
    </div>
  );
}
