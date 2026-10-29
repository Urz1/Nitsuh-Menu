import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { hashPassword, setServerSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!hasNeon()) {
      return NextResponse.json({ hasOwner: true, restaurantName: 'Nitsuh Cafe & Restaurant' });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ hasOwner: true, restaurantName: 'Nitsuh Cafe & Restaurant' });
    }

    const owners = await sql`
      SELECT COUNT(*)::int AS count 
      FROM public.staff_users 
      WHERE role = 'owner'
    `;

    const restaurant = await sql`
      SELECT id, name, slug FROM public.restaurants LIMIT 1
    `;

    const hasOwner = owners && owners.length > 0 && owners[0].count > 0;
    const restaurantName = restaurant && restaurant[0] ? restaurant[0].name : 'Nitsuh Cafe & Restaurant';

    return NextResponse.json({ hasOwner, restaurantName });
  } catch (error: any) {
    console.error('Setup check error:', error);
    return NextResponse.json({ error: error.message || 'Failed to check setup status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password } = body as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email address, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    // Ensure no owner exists already
    const existingOwners = await sql`
      SELECT id FROM public.staff_users WHERE role = 'owner' LIMIT 1
    `;

    if (existingOwners && existingOwners.length > 0) {
      return NextResponse.json(
        { error: 'An owner account is already registered. Please sign in.' },
        { status: 403 }
      );
    }

    // Get restaurant ID
    const restaurants = await sql`
      SELECT id FROM public.restaurants LIMIT 1
    `;
    const restaurantId = restaurants && restaurants[0] ? restaurants[0].id : 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // Hash password securely with scrypt
    const passwordHash = await hashPassword(password);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone ? phone.trim() : null;

    const inserted = await sql`
      INSERT INTO public.staff_users (
        restaurant_id,
        email,
        username,
        phone,
        full_name,
        role,
        password_hash,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${restaurantId},
        ${cleanEmail},
        ${cleanEmail.split('@')[0]},
        ${cleanPhone},
        ${cleanName},
        'owner',
        ${passwordHash},
        true,
        NOW(),
        NOW()
      )
      RETURNING id, restaurant_id, email, username, phone, full_name, role
    `;

    if (!inserted || inserted.length === 0) {
      return NextResponse.json({ error: 'Failed to create owner account' }, { status: 500 });
    }

    const newOwner = inserted[0];

    // Establish secure session cookie
    const token = await setServerSession({
      userId: newOwner.id,
      restaurantId: newOwner.restaurant_id,
      role: 'owner',
      email: newOwner.email,
      name: newOwner.full_name,
      identifier: newOwner.email,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Owner account provisioned successfully',
      user: {
        id: newOwner.id,
        name: newOwner.full_name,
        email: newOwner.email,
        phone: newOwner.phone,
        role: newOwner.role,
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

    res.cookies.set('digital_menu_session', 'owner', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return res;
  } catch (error: any) {
    console.error('Setup registration error:', error);
    return NextResponse.json({ error: error.message || 'Setup registration failed' }, { status: 500 });
  }
}
