import { NextResponse } from 'next/server';
import { requireOwnerSession, hashPassword } from '@/lib/server-auth';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { StaffAccount } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireOwnerSession();
    if (!hasNeon()) {
      return NextResponse.json([]);
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json([]);
    }

    const rows = await sql`
      SELECT 
        id, 
        restaurant_id, 
        full_name AS name, 
        username, 
        phone, 
        email, 
        role, 
        is_active, 
        created_at, 
        updated_at
      FROM public.staff_users
      WHERE role = 'staff' AND restaurant_id = ${session.restaurantId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(rows || []);
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch staff accounts' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireOwnerSession();
    const body = await request.json();
    const { name, username, passwordOrPin, phone, email } = body as {
      name?: string;
      username?: string;
      passwordOrPin?: string;
      phone?: string;
      email?: string;
    };

    if (!name || !username || !passwordOrPin) {
      return NextResponse.json(
        { error: 'Staff name, username, and password / PIN are required' },
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

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanName = name.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : `${cleanUsername}@staff.nitsuh.internal`;
    const cleanPhone = phone ? phone.trim() : null;

    // Check if username is already taken
    const existing = await sql`
      SELECT id FROM public.staff_users 
      WHERE (LOWER(username) = ${cleanUsername} OR LOWER(email) = ${cleanEmail})
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'This username or email is already taken by another account.' },
        { status: 409 }
      );
    }

    // Securely hash the staff password or PIN
    const passwordHash = await hashPassword(passwordOrPin);

    const inserted = await sql`
      INSERT INTO public.staff_users (
        restaurant_id,
        full_name,
        username,
        email,
        phone,
        role,
        password_hash,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${session.restaurantId},
        ${cleanName},
        ${cleanUsername},
        ${cleanEmail},
        ${cleanPhone},
        'staff',
        ${passwordHash},
        true,
        NOW(),
        NOW()
      )
      RETURNING 
        id, 
        restaurant_id, 
        full_name AS name, 
        username, 
        phone, 
        email, 
        role, 
        is_active, 
        created_at, 
        updated_at
    `;

    if (!inserted || inserted.length === 0) {
      return NextResponse.json({ error: 'Failed to create staff account' }, { status: 500 });
    }

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to create staff member' }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireOwnerSession();
    const body = await request.json();
    const { id, name, username, phone, email, is_active, newPasswordOrPin } = body as {
      id?: string;
      name?: string;
      username?: string;
      phone?: string;
      email?: string;
      is_active?: boolean;
      newPasswordOrPin?: string;
    };

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    // Fetch existing staff row
    const existing = await sql`
      SELECT * FROM public.staff_users 
      WHERE id = ${id} AND restaurant_id = ${session.restaurantId}
      LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
    }

    const current = existing[0];
    let newHash = current.password_hash;
    if (newPasswordOrPin && newPasswordOrPin.trim().length >= 4) {
      newHash = await hashPassword(newPasswordOrPin.trim());
    }

    const updatedName = name !== undefined ? name.trim() : current.full_name;
    const updatedUsername = username !== undefined ? username.trim().toLowerCase().replace(/\s+/g, '_') : current.username;
    const updatedPhone = phone !== undefined ? phone.trim() : current.phone;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const updatedActive = is_active !== undefined ? Boolean(is_active) : current.is_active;

    const updatedRows = await sql`
      UPDATE public.staff_users
      SET
        full_name = ${updatedName},
        username = ${updatedUsername},
        phone = ${updatedPhone},
        email = ${updatedEmail},
        is_active = ${updatedActive},
        password_hash = ${newHash},
        updated_at = NOW()
      WHERE id = ${id} AND restaurant_id = ${session.restaurantId}
      RETURNING 
        id, 
        restaurant_id, 
        full_name AS name, 
        username, 
        phone, 
        email, 
        role, 
        is_active, 
        created_at, 
        updated_at
    `;

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json({ error: 'Staff account update failed' }, { status: 500 });
    }

    return NextResponse.json(updatedRows[0]);
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Staff update failed' }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireOwnerSession();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    await sql`
      DELETE FROM public.staff_users
      WHERE id = ${id} AND restaurant_id = ${session.restaurantId} AND role = 'staff'
    `;

    return NextResponse.json({ success: true, message: 'Staff member deleted' });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to delete staff member' }, { status });
  }
}
