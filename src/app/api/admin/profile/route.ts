import { NextResponse } from 'next/server';
import { getServerSession, verifyPassword, hashPassword } from '@/lib/server-auth';
import { getNeon, hasNeon } from '@/lib/neon/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasNeon()) {
      return NextResponse.json({
        id: session.userId,
        name: session.name,
        email: session.email,
        phone: '',
        role: session.role,
      });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const rows = await sql`
      SELECT id, full_name AS name, email, phone, username, role, updated_at
      FROM public.staff_users
      WHERE id = ${session.userId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, currentPassword, newPassword } = body as {
      name?: string;
      email?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    // Get current record
    const rows = await sql`
      SELECT id, password_hash, full_name, email, phone, username, role
      FROM public.staff_users
      WHERE id = ${session.userId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const current = rows[0];

    // If changing password, verify current password
    let updatedHash = current.password_hash;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }
      const isCurrentValid = await verifyPassword(currentPassword, current.password_hash);
      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }
      updatedHash = await hashPassword(newPassword);
    }

    const updatedName = name !== undefined ? name.trim() : current.full_name;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const updatedPhone = phone !== undefined ? phone.trim() : current.phone;

    const updated = await sql`
      UPDATE public.staff_users
      SET
        full_name = ${updatedName},
        email = ${updatedEmail},
        phone = ${updatedPhone},
        password_hash = ${updatedHash},
        updated_at = NOW()
      WHERE id = ${session.userId}
      RETURNING id, full_name AS name, email, phone, username, role, updated_at
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Profile update failed' }, { status: 500 });
  }
}
