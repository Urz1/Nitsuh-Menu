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
 * Server-side helper to read the authenticated session from cookies.
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
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
