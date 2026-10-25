import { NextResponse } from 'next/server';
import { getMenuItems } from '@/lib/data-provider';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });
  }

  const items = await getMenuItems(restaurantId);
  return NextResponse.json(items);
}
