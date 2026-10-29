import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { verifyPassword, setServerSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, role } = body as {
      identifier?: string;
      password?: string;
      role?: 'owner' | 'staff';
    };

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier (email, username, or phone) and password are required' },
        { status: 400 }
      );
    }

    if (!hasNeon()) {
      return NextResponse.json(
        { error: 'Database connection is not configured' },
        { status: 500 }
      );
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\D/g, '');

    // Query matching user in Neon DB
    const users = await sql`
      SELECT 
        id, 
        restaurant_id, 
        email, 
        username, 
        phone, 
        full_name, 
        role, 
        password_hash, 
        is_active
      FROM public.staff_users
      WHERE 
        LOWER(email) = ${cleanId}
        OR LOWER(COALESCE(username, '')) = ${cleanId}
        OR (${cleanPhone.length > 5} AND REGEXP_REPLACE(COALESCE(phone, ''), '\\D', '', 'g') = ${cleanPhone})
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No account found matching this identifier' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check account status
    if (user.is_active === false) {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Role check if specified by client tab
    if (role && user.role !== role) {
      return NextResponse.json(
        {
          error:
            role === 'owner'
              ? 'Access denied: This account does not possess owner credentials.'
              : 'Access denied: Please sign in via the Owner tab.',
        },
        { status: 403 }
      );
    }

    // Verify password hash using scrypt
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password or PIN. Access denied.' },
        { status: 401 }
      );
    }

    // Establish secure session with HttpOnly cookie
    const token = await setServerSession({
      userId: user.id,
      restaurantId: user.restaurant_id,
      role: user.role,
      email: user.email,
      name: user.full_name || user.username || 'User',
      identifier: user.username || user.email,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        restaurant_id: user.restaurant_id,
        name: user.full_name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
      token,
    });

    res.cookies.set('auth_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    res.cookies.set('digital_menu_session', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}
