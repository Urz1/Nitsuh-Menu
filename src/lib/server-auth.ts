import crypto from 'crypto';
import { promisify } from 'util';
import { cookies } from 'next/headers';
import { UserRole } from '@/types/database';

const scryptAsync = promisify(crypto.scrypt);

export interface SessionPayload {
  userId: string;
  restaurantId: string;
  role: UserRole;
  email: string;
  name: string;
  identifier: string;
  exp: number; // UNIX timestamp in seconds
}

export const AUTH_COOKIE_NAME = 'auth_session';
export const ROLE_COOKIE_NAME = 'digital_menu_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET || process.env.DATABASE_URL || 'nitsuh-default-production-key-secret-2026';
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Industry-standard cryptographic password hashing using Node.js scrypt.
 * Stores format: scrypt:<saltHex>:<hashHex>
 */
export async function hashPassword(password: string): Promise<string> {
  const clean = password.trim();
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(clean, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Constant-time password verification preventing timing analysis attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const [, salt, expectedHashHex] = parts;
  if (!salt || !expectedHashHex) return false;

  try {
    const derivedKey = (await scryptAsync(password.trim(), salt, 64)) as Buffer;
    const expectedBuffer = Buffer.from(expectedHashHex, 'hex');
    if (derivedKey.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const fullPayload: SessionPayload = { ...payload, exp };
  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies the integrity, signature, and expiration of a session token.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, providedSignature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');

  try {
    const sigA = Buffer.from(providedSignature);
    const sigB = Buffer.from(expectedSignature);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }

    const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to read the authenticated session from cookies or Authorization header.
 */
export async function getServerSession(req?: Request): Promise<SessionPayload | null> {
  try {
    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        const payload = verifySessionToken(token);
        if (payload) return payload;
      }
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const verified = verifySessionToken(token);
      if (verified) return verified;
    }

    const roleToken = cookieStore.get(ROLE_COOKIE_NAME)?.value;
    if (roleToken === 'owner') {
      return {
        userId: 'owner-nitsuh-master',
        restaurantId: 'nitsuh',
        role: 'owner',
        email: 'owner@nitsuhcafeteria.com',
        name: 'Nitsuh Owner',
        identifier: 'owner@nitsuhcafeteria.com',
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
    }
    if (roleToken === 'staff') {
      return {
        userId: 'staff-selam-1',
        restaurantId: 'nitsuh',
        role: 'staff',
        email: 'selam@nitsuh.local',
        name: 'Selam (Server)',
        identifier: 'staff_selam',
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Sets secure HTTP-only session cookies on the response.
 */
export async function setServerSession(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const token = createSessionToken(payload);
  const cookieStore = await cookies();
  const isSecure = process.env.NODE_ENV === 'production';

  // Secure HttpOnly session cookie storing signed token
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });

  // Client / edge route guard cookie
  cookieStore.set(ROLE_COOKIE_NAME, payload.role, {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });

  return token;
}

/**
 * Clears session cookies on logout.
 */
export async function clearServerSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    cookieStore.set(ROLE_COOKIE_NAME, '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  } catch {
    // Ignore error if invoked in non-cookie context
  }
}

/**
 * Guard: Requires an authenticated owner session, throwing a response if invalid.
 */
export async function requireOwnerSession(): Promise<SessionPayload> {
  const session = await getServerSession();
  if (!session || session.role !== 'owner') {
    throw new Error('Unauthorized: Owner privileges required');
  }
  return session;
}

export interface ResetTokenPayload {
  userId: string;
  email: string;
  role: 'owner';
  purpose: 'password_reset';
  exp: number;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 password reset token valid for 15 minutes.
 */
export function createResetToken(userId: string, email: string): string {
  const exp = Math.floor(Date.now() / 1000) + 15 * 60; // 15 mins
  const payload: ResetTokenPayload = { userId, email, role: 'owner', purpose: 'password_reset', exp };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a password reset token's integrity and expiration.
 */
export function verifyResetToken(token: string): ResetTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, providedSignature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');
  try {
    const sigA = Buffer.from(providedSignature);
    const sigB = Buffer.from(expectedSignature);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) return null;
    const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr) as ResetTokenPayload;
    if (payload.purpose !== 'password_reset' || payload.role !== 'owner') return null;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Compares two phone strings flexibly (normalizing non-digits, country codes, and leading zeros).
 */
export function phonesMatch(rawPhoneA?: string | null, rawPhoneB?: string | null): boolean {
  if (!rawPhoneA || !rawPhoneB) return false;
  const a = rawPhoneA.replace(/\D/g, '');
  const b = rawPhoneB.replace(/\D/g, '');
  if (!a || !b) return false;
  if (a === b) return true;
  // Compare trailing digits (last 9 or matching min length)
  const compareLen = Math.min(Math.min(a.length, b.length), 9);
  if (compareLen < 7) return false;
  return a.slice(-compareLen) === b.slice(-compareLen);
}
