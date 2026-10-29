import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import {
  hashPassword,
  setServerSession,
  createResetToken,
  verifyResetToken,
  phonesMatch,
} from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, identifier, phone, verificationToken, newPassword } = body as {
      action?: 'verify' | 'reset';
      identifier?: string;
      phone?: string;
      verificationToken?: string;
      newPassword?: string;
    };

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
    }
    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Failed to connect to database' }, { status: 500 });
    }

    // -------------------------------------------------------------------------
    // ACTION 1: VERIFY OWNER IDENTITY
    // -------------------------------------------------------------------------
    if (action === 'verify' || (!verificationToken && !newPassword)) {
      if (!identifier || !phone) {
        return NextResponse.json(
          { error: 'Both registered owner email/username and phone number are required.' },
          { status: 400 }
        );
      }

      const cleanId = identifier.trim().toLowerCase();

      // Query active owners from Neon DB
      const owners = await sql`
        SELECT id, restaurant_id, email, username, phone, full_name, role, is_active
        FROM public.staff_users
        WHERE role = 'owner'
      `;

      if (!owners || owners.length === 0) {
        return NextResponse.json(
          { error: 'No registered owner account found in the system.' },
          { status: 404 }
        );
      }

      // Check for match: email OR username matches identifier, AND phone matches
      const matchedOwner = owners.find((owner) => {
        const matchesEmail = Boolean(owner.email && owner.email.trim().toLowerCase() === cleanId);
        const matchesUser = Boolean(owner.username && owner.username.trim().toLowerCase() === cleanId);
        const matchesPhone = phonesMatch(owner.phone, phone);
        return (matchesEmail || matchesUser) && matchesPhone;
      });

      if (!matchedOwner) {
        return NextResponse.json(
          {
            error:
              'Owner verification failed. The provided email/username and phone number do not match the registered owner account.',
          },
          { status: 401 }
        );
      }

      if (matchedOwner.is_active === false) {
        return NextResponse.json(
          { error: 'This owner account is inactive. Please contact support.' },
          { status: 403 }
        );
      }

      const resetToken = createResetToken(matchedOwner.id, matchedOwner.email);
      const maskedPhone = matchedOwner.phone
        ? matchedOwner.phone.slice(-3).padStart(matchedOwner.phone.length, '•')
        : '••••';

      return NextResponse.json({
        verified: true,
        message: 'Owner identity confirmed! You may now create your new password.',
        ownerName: matchedOwner.full_name || 'Owner',
        email: matchedOwner.email,
        phoneEnding: matchedOwner.phone ? matchedOwner.phone.slice(-3) : '',
        maskedPhone,
        verificationToken: resetToken,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: RESET PASSWORD (via verificationToken or direct credentials)
    // -------------------------------------------------------------------------
    let ownerId: string | null = null;

    if (verificationToken) {
      const payload = verifyResetToken(verificationToken);
      if (!payload) {
        return NextResponse.json(
          { error: 'Verification session has expired or is invalid. Please verify your details again.' },
          { status: 401 }
        );
      }
      ownerId = payload.userId;
    } else if (identifier && phone) {
      // Direct 1-step reset
      const cleanId = identifier.trim().toLowerCase();
      const owners = await sql`
        SELECT id, restaurant_id, email, username, phone, full_name, role, is_active
        FROM public.staff_users
        WHERE role = 'owner'
      `;
      const matchedOwner = owners.find((owner) => {
        const matchesEmail = Boolean(owner.email && owner.email.trim().toLowerCase() === cleanId);
        const matchesUser = Boolean(owner.username && owner.username.trim().toLowerCase() === cleanId);
        const matchesPhone = phonesMatch(owner.phone, phone);
        return (matchesEmail || matchesUser) && matchesPhone;
      });

      if (!matchedOwner) {
        return NextResponse.json(
          { error: 'Owner verification failed. Credentials do not match the registered owner.' },
          { status: 401 }
        );
      }
      ownerId = matchedOwner.id;
    } else {
      return NextResponse.json(
        { error: 'Invalid request: Verification token or credentials required.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Cryptographically hash the new password using scrypt
    const newHash = await hashPassword(newPassword);

    // Update public.staff_users table in Neon PostgreSQL
    const updatedUsers = await sql`
      UPDATE public.staff_users
      SET 
        password_hash = ${newHash},
        updated_at = NOW()
      WHERE id = ${ownerId} AND role = 'owner'
      RETURNING id, restaurant_id, full_name, email, username, phone, role
    `;

    if (!updatedUsers || updatedUsers.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update owner record in database.' },
        { status: 500 }
      );
    }

    const updatedUser = updatedUsers[0];

    // Establish immediate authenticated session cookie
    const token = await setServerSession({
      userId: updatedUser.id,
      restaurantId: updatedUser.restaurant_id,
      role: 'owner',
      email: updatedUser.email,
      name: updatedUser.full_name || 'Owner',
      identifier: updatedUser.username || updatedUser.email,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Password successfully updated! Redirecting to owner dashboard...',
      user: {
        id: updatedUser.id,
        restaurant_id: updatedUser.restaurant_id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        username: updatedUser.username,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
      token,
    });

    // Explicitly set cookie headers on response for maximum browser compatibility
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
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while resetting the owner password.' },
      { status: 500 }
    );
  }
}
