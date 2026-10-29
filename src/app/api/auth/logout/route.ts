import { NextResponse } from 'next/server';
import { clearServerSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearServerSession();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
