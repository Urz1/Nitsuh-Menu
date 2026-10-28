import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { getMenuCategories } from '@/lib/data-provider';
import { Category } from '@/types/database';

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

export async function POST(request: Request) {
  try {
    const category = (await request.json()) as Partial<Category> & { restaurant_id: string };
    if (!category.restaurant_id) {
      return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 });
    }

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        const id = category.id || `cat-${Date.now()}`;
        const rows = await sql`
          INSERT INTO public.categories (
            id, restaurant_id, name, name_am, name_so, name_es,
            icon, description, description_am, description_so, description_es,
            sort_order, is_active, created_at
          ) VALUES (
            ${id},
            ${category.restaurant_id},
            ${category.name || 'New Category'},
            ${category.name_am || null},
            ${category.name_so || null},
            ${category.name_es || null},
            ${category.icon || '🍽️'},
            ${category.description || null},
            ${category.description_am || null},
            ${category.description_so || null},
            ${category.description_es || null},
            ${category.sort_order ?? 0},
            ${category.is_active ?? true},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            name_am = EXCLUDED.name_am,
            name_so = EXCLUDED.name_so,
            name_es = EXCLUDED.name_es,
            icon = EXCLUDED.icon,
            description = EXCLUDED.description,
            description_am = EXCLUDED.description_am,
            description_so = EXCLUDED.description_so,
            description_es = EXCLUDED.description_es,
            sort_order = EXCLUDED.sort_order,
            is_active = EXCLUDED.is_active
          RETURNING *
        `;
        if (rows && rows.length > 0) {
          return NextResponse.json(rows[0]);
        }
      }
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Failed to save category:', error);
    return NextResponse.json({ error: error.message || 'Save category failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');
    if (!categoryId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        await sql`DELETE FROM public.categories WHERE id = ${categoryId}`;
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: error.message || 'Delete category failed' }, { status: 500 });
  }
}
