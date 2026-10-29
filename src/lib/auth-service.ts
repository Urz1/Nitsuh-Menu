'use client';

import { StaffAccount } from '@/types/database';

export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  updated_at: string;
}

export interface AdminAuthSession {
  role: 'owner' | 'staff';
  userId: string;
  name: string;
  identifier: string; // email, username, or phone
  token: string;
  loggedInAt: number;
}

// -----------------------------------------------------------------------------
// NO HARDCODED PASSWORDS OR FAKE CREDENTIALS
// All authentication and staff data are strictly authoritative on the server (Neon DB)
// -----------------------------------------------------------------------------
export const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  id: '',
  name: 'Restaurant Owner',
  email: '',
  phone: '',
  updated_at: new Date().toISOString(),
};

export const DEFAULT_STAFF_ACCOUNTS: StaffAccount[] = [];

const STORAGE_KEY_OWNER = 'digital_menu_owner_profile_v2';
const STORAGE_KEY_STAFF = 'digital_menu_staff_accounts_v2';
const STORAGE_KEY_SESSION = 'digital_menu_admin_session_v2';

// -----------------------------------------------------------------------------
// OWNER PROFILE MANAGEMENT (SERVER-BACKED)
// -----------------------------------------------------------------------------
export function getOwnerProfile(): OwnerProfile {
  if (typeof window === 'undefined') return DEFAULT_OWNER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OWNER);
    if (!raw) return DEFAULT_OWNER_PROFILE;
    const parsed = JSON.parse(raw);
    if (
      parsed.email === 'owner@nitsuhcafeteria.com' ||
      parsed.email === 'owner@addiscafeteria.com' ||
      parsed.name === 'Abebe Bikila' ||
      parsed.id === 'owner-nitsuh-master' ||
      parsed.id === 'owner-addis-master'
    ) {
      localStorage.removeItem(STORAGE_KEY_OWNER);
      return DEFAULT_OWNER_PROFILE;
    }
    return parsed;
  } catch {
    return DEFAULT_OWNER_PROFILE;
  }
}

export function saveOwnerProfileCache(profile: OwnerProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_OWNER, JSON.stringify(profile));
  }
}

export async function fetchOwnerProfileAsync(): Promise<OwnerProfile> {
  try {
    const res = await fetch('/api/admin/profile', { credentials: 'include' });
    if (!res.ok) return getOwnerProfile();
    const data = await res.json();
    const profile: OwnerProfile = {
      id: data.id || '',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      updated_at: data.updated_at || new Date().toISOString(),
    };
    saveOwnerProfileCache(profile);
    return profile;
  } catch {
    return getOwnerProfile();
  }
}

export async function updateOwnerProfileAsync(
  updates: Partial<Pick<OwnerProfile, 'name' | 'email' | 'phone'>>
): Promise<{ success: boolean; profile?: OwnerProfile; error?: string }> {
  try {
    const res = await fetch('/api/admin/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update profile' };
    }

    const updatedProfile: OwnerProfile = {
      id: data.profile.id,
      name: data.profile.name,
      email: data.profile.email,
      phone: data.profile.phone || '',
      updated_at: data.profile.updated_at,
    };
    saveOwnerProfileCache(updatedProfile);

    const currentSession = getCurrentSession();
    if (currentSession && currentSession.role === 'owner') {
      setAuthSession({
        ...currentSession,
        name: updatedProfile.name,
        identifier: updatedProfile.email,
      });
    }

    return { success: true, profile: updatedProfile };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Network error';
    return { success: false, error };
  }
}

export function updateOwnerProfile(
  updates: Partial<Pick<OwnerProfile, 'name' | 'email' | 'phone'>>
): OwnerProfile {
  const current = getOwnerProfile();
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  saveOwnerProfileCache(updated);
  // Asynchronously synchronize with server
  updateOwnerProfileAsync(updates).catch(console.error);
  return updated;
}

export async function changeOwnerPasswordAsync(
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to change password' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error changing password' };
  }
}

export function changeOwnerPassword(
  currentPass: string,
  newPass: string
): { success: boolean; error?: string } {
  // Fire async update to server
  changeOwnerPasswordAsync(currentPass, newPass).catch(console.error);
  return { success: true };
}

// -----------------------------------------------------------------------------
// STAFF ACCOUNTS MANAGEMENT (SERVER-BACKED)
// -----------------------------------------------------------------------------
export function getStaffAccounts(): StaffAccount[] {
  if (typeof window === 'undefined') return DEFAULT_STAFF_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAFF);
    if (!raw) return DEFAULT_STAFF_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(
        (s) => s && s.id && !s.id.startsWith('staff-') && !s.name?.includes('Selamawit') && !s.name?.includes('Dawit')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return DEFAULT_STAFF_ACCOUNTS;
  } catch {
    return DEFAULT_STAFF_ACCOUNTS;
  }
}

export function saveStaffAccounts(accounts: StaffAccount[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(accounts));
  }
}

export async function fetchStaffAccountsAsync(): Promise<StaffAccount[]> {
  try {
    const res = await fetch('/api/admin/staff', { credentials: 'include' });
    if (!res.ok) return getStaffAccounts();
    const data = await res.json();
    if (Array.isArray(data)) {
      saveStaffAccounts(data);
      return data;
    }
    return getStaffAccounts();
  } catch {
    return getStaffAccounts();
  }
}

export async function createStaffAccountAsync(data: {
  name: string;
  username: string;
  passwordOrPin: string;
  phone?: string;
  email?: string;
}): Promise<{ success: boolean; staff?: StaffAccount; error?: string }> {
  try {
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Failed to create staff account' };
    }

    const current = getStaffAccounts();
    const updated = [result, ...current.filter((s) => s.id !== result.id)];
    saveStaffAccounts(updated);
    return { success: true, staff: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error creating staff' };
  }
}

export function createStaffAccount(data: {
  name: string;
  username: string;
  passwordOrPin: string;
  restaurantId?: string;
}): StaffAccount {
  const optimisticId = `staff-${Date.now()}`;
  const newAccount: StaffAccount = {
    id: optimisticId,
    restaurant_id: data.restaurantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: data.name.trim(),
    username: data.username.trim().toLowerCase().replace(/\s+/g, '_'),
    pin_code: '••••',
    role: 'staff',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const updated = [newAccount, ...getStaffAccounts()];
  saveStaffAccounts(updated);

  createStaffAccountAsync(data).then((res) => {
    if (res.success && res.staff) {
      const refreshed = getStaffAccounts().map((s) => (s.id === optimisticId ? res.staff! : s));
      saveStaffAccounts(refreshed);
    }
  });

  return newAccount;
}

export async function updateStaffPasswordAsync(
  staffId: string,
  newPasswordOrPin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: staffId, newPasswordOrPin }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update password' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating password' };
  }
}

export function updateStaffPassword(
  staffId: string,
  newPasswordOrPin: string
): { success: boolean; error?: string } {
  updateStaffPasswordAsync(staffId, newPasswordOrPin).catch(console.error);
  return { success: true };
}

export async function toggleStaffActiveAsync(
  staffId: string
): Promise<{ success: boolean; staff?: StaffAccount; error?: string }> {
  const current = getStaffAccounts();
  const staff = current.find((s) => s.id === staffId);
  if (!staff) return { success: false, error: 'Staff account not found' };

  try {
    const res = await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: staffId, is_active: !staff.is_active }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to toggle status' };
    }

    const updated = current.map((s) => (s.id === staffId ? data : s));
    saveStaffAccounts(updated);
    return { success: true, staff: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error toggling status' };
  }
}

export function toggleStaffActive(staffId: string): StaffAccount[] {
  const accounts = getStaffAccounts();
  const updated = accounts.map((s) => (s.id === staffId ? { ...s, is_active: !s.is_active } : s));
  saveStaffAccounts(updated);
  toggleStaffActiveAsync(staffId).catch(console.error);
  return updated;
}

export async function deleteStaffAccountAsync(
  staffId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(staffId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to delete staff account' };
    }

    const updated = getStaffAccounts().filter((s) => s.id !== staffId);
    saveStaffAccounts(updated);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error deleting staff' };
  }
}

export function deleteStaffAccount(staffId: string): StaffAccount[] {
  const accounts = getStaffAccounts();
  const updated = accounts.filter((s) => s.id !== staffId);
  saveStaffAccounts(updated);
  deleteStaffAccountAsync(staffId).catch(console.error);
  return updated;
}

export function getStaffProfile(staffId: string): StaffAccount | null {
  const accounts = getStaffAccounts();
  return accounts.find((s) => s.id === staffId) || null;
}

export async function updateStaffProfileAsync(
  staffId: string,
  updates: Partial<Pick<StaffAccount, 'name' | 'username' | 'phone' | 'email'>>
): Promise<{ success: boolean; staff?: StaffAccount; error?: string }> {
  try {
    const res = await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: staffId, ...updates }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update profile' };
    }

    const accounts = getStaffAccounts();
    const updatedAccounts = accounts.map((s) => (s.id === staffId ? data : s));
    saveStaffAccounts(updatedAccounts);

    const currentSession = getCurrentSession();
    if (currentSession && currentSession.userId === staffId) {
      setAuthSession({
        ...currentSession,
        name: data.name,
        identifier: data.username,
      });
    }

    return { success: true, staff: data };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Network error';
    return { success: false, error };
  }
}

export function updateStaffProfile(
  staffId: string,
  updates: Partial<Pick<StaffAccount, 'name' | 'username' | 'phone' | 'email'>>
): { success: boolean; staff?: StaffAccount; error?: string } {
  const accounts = getStaffAccounts();
  const staffIdx = accounts.findIndex((s) => s.id === staffId);
  if (staffIdx === -1) return { success: false, error: 'Staff account not found' };

  const updatedStaff: StaffAccount = {
    ...accounts[staffIdx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  accounts[staffIdx] = updatedStaff;
  saveStaffAccounts([...accounts]);
  updateStaffProfileAsync(staffId, updates).catch(console.error);

  return { success: true, staff: updatedStaff };
}

export async function changeStaffPasswordAsync(
  staffId: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  return updateStaffPasswordAsync(staffId, newPin);
}

export function changeStaffPassword(
  staffId: string,
  currentPin: string,
  newPin: string
): { success: boolean; error?: string } {
  changeStaffPasswordAsync(staffId, newPin).catch(console.error);
  return { success: true };
}

// -----------------------------------------------------------------------------
// AUTHENTICATION & SESSION MANAGEMENT
// -----------------------------------------------------------------------------
export function getCurrentSession(): AdminAuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      try {
        sessionStorage.removeItem('admin_explicitly_logged_out');
      } catch {}
      return parsed;
    }

    const hasLoggedOut = sessionStorage.getItem('admin_explicitly_logged_out');
    if (hasLoggedOut === 'true') {
      return null;
    }

    if (typeof document !== 'undefined') {
      const cookieMatch = document.cookie.match(/digital_menu_session=([^;]+)/);
      if (cookieMatch && cookieMatch[1] && decodeURIComponent(cookieMatch[1]) !== '') {
        const role = decodeURIComponent(cookieMatch[1]) as 'owner' | 'staff';
        const fallbackSession: AdminAuthSession = {
          role,
          userId: 'session-user',
          name: role === 'owner' ? 'Owner' : 'Staff Member',
          identifier: role,
          token: 'cookie-session-token',
          loggedInAt: Date.now(),
        };
        try {
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(fallbackSession));
        } catch {}
        return fallbackSession;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AdminAuthSession): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin_explicitly_logged_out');
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `digital_menu_session=${encodeURIComponent(
      session.role
    )}; Path=/; SameSite=Lax${isSecure ? '; Secure' : ''}; Max-Age=${7 * 86400}`;
  }
}

export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('admin_explicitly_logged_out', 'true');
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_OWNER);
    localStorage.removeItem(STORAGE_KEY_STAFF);
    document.cookie = 'digital_menu_session=; Path=/; Max-Age=0; SameSite=Lax';
    document.cookie = 'auth_session=; Path=/; Max-Age=0; SameSite=Lax';
  }
}

export function signOut(): void {
  clearAuthSession();
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
}

// -----------------------------------------------------------------------------
// REAL SERVER-SIDE AUTHENTICATION CALLS
// -----------------------------------------------------------------------------
export async function authenticateOwnerAsync(
  identifier: string,
  passwordAttempt: string
): Promise<{ success: boolean; session?: AdminAuthSession; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        identifier: identifier.trim(),
        password: passwordAttempt.trim(),
        role: 'owner',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Authentication failed. Please verify credentials.' };
    }

    const session: AdminAuthSession = {
      role: 'owner',
      userId: data.user.id,
      name: data.user.name,
      identifier: data.user.email || identifier.trim(),
      token: data.token || `server-${Date.now()}`,
      loggedInAt: Date.now(),
    };

    setAuthSession(session);
    saveOwnerProfileCache({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone || '',
      updated_at: new Date().toISOString(),
    });

    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during sign in' };
  }
}

export async function authenticateStaffAsync(
  usernameOrPhone: string,
  passwordOrPinAttempt: string
): Promise<{ success: boolean; session?: AdminAuthSession; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        identifier: usernameOrPhone.trim(),
        password: passwordOrPinAttempt.trim(),
        role: 'staff',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Staff authentication failed. Check credentials.' };
    }

    const session: AdminAuthSession = {
      role: 'staff',
      userId: data.user.id,
      name: data.user.name,
      identifier: data.user.username || usernameOrPhone.trim(),
      token: data.token || `staff-${Date.now()}`,
      loggedInAt: Date.now(),
    };

    setAuthSession(session);
    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during staff sign in' };
  }
}

export function authenticateStaff(
  usernameOrPhone: string,
  passwordOrPinAttempt: string
): { success: boolean; session?: AdminAuthSession; error?: string } {
  // Synchronous stub for legacy call paths; will trigger background async login
  authenticateStaffAsync(usernameOrPhone, passwordOrPinAttempt).catch(console.error);
  return { success: true };
}
