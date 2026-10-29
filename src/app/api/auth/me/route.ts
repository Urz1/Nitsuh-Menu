import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-auth';
import { getNeon, hasNeon } from '@/lib/neon/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    if (!hasNeon()) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.userId,
          restaurant_id: session.restaurantId,
          name: session.name,
          email: session.email,
          identifier: session.identifier,
          role: session.role,
        },
      });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ authenticated: true, user: session });
    }

    const users = await sql`
      SELECT id, restaurant_id, email, username, phone, full_name, role, is_active
      FROM public.staff_users
      WHERE id = ${session.userId}
      LIMIT 1
    `;

    if (!users || users.length === 0 || users[0].is_active === false) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const u = users[0];
    return NextResponse.json({
      authenticated: true,
      user: {
        id: u.id,
        restaurant_id: u.restaurant_id,
        name: u.full_name,
        email: u.email,
        username: u.username,
        phone: u.phone,
        role: u.role,
      },
    });
  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
