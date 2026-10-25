import { NextResponse } from 'next/server';
import { getMenuCategories } from '@/lib/data-provider';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });
  }

  const categories = await getMenuCategories(restaurantId);
  return NextResponse.json(categories);
}
