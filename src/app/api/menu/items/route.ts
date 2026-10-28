import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { getMenuItems } from '@/lib/data-provider';
import { MenuItem } from '@/types/database';

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

export async function POST(request: Request) {
  try {
    const item = (await request.json()) as Partial<MenuItem> & { restaurant_id: string; id: string };
    if (!item.restaurant_id || !item.id) {
      return NextResponse.json({ error: 'restaurant_id and id required' }, { status: 400 });
    }

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        let resolvedCategoryId = item.category_id;
        if (resolvedCategoryId) {
          const catCheck = await sql`SELECT id FROM public.categories WHERE id = ${resolvedCategoryId} LIMIT 1`;
          if (!catCheck || catCheck.length === 0) {
            const fallbackCat = await sql`
              SELECT id FROM public.categories 
              WHERE restaurant_id = ${item.restaurant_id} 
              ORDER BY sort_order ASC 
              LIMIT 1
            `;
            if (fallbackCat && fallbackCat.length > 0) {
              resolvedCategoryId = fallbackCat[0].id;
            } else {
              resolvedCategoryId = 'cat_breakfast_10';
            }
          }
        } else {
          const fallbackCat = await sql`
            SELECT id FROM public.categories 
            WHERE restaurant_id = ${item.restaurant_id} 
            ORDER BY sort_order ASC 
            LIMIT 1
          `;
          resolvedCategoryId = fallbackCat && fallbackCat.length > 0 ? fallbackCat[0].id : 'cat_breakfast_10';
        }

        const rows = await sql`
          INSERT INTO public.items (
            id, restaurant_id, category_id, name, name_am, name_so, name_es,
            description, description_am, description_so, description_es,
            price, image_url, tags, allergens, spice_level, calories,
            custom_badge, is_available, is_chefs_pick, is_fasting, is_draft,
            is_archived, sort_order, created_at, updated_at
          ) VALUES (
            ${item.id},
            ${item.restaurant_id},
            ${resolvedCategoryId},
            ${item.name || 'Dish'},
            ${item.name_am || null},
            ${item.name_so || null},
            ${item.name_es || null},
            ${item.description || null},
            ${item.description_am || null},
            ${item.description_so || null},
            ${item.description_es || null},
            ${Number(item.price || 0)},
            ${item.image_url || null},
            ${item.tags || []},
            ${item.allergens || []},
            ${item.spice_level ?? 0},
            ${item.calories ?? null},
            ${item.custom_badge || null},
            ${item.is_available ?? true},
            ${item.is_chefs_pick ?? false},
            ${Boolean(item.tags?.includes('fasting'))},
            ${item.is_draft ?? false},
            ${item.is_archived ?? false},
            ${item.sort_order ?? 0},
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            name_am = EXCLUDED.name_am,
            name_so = EXCLUDED.name_so,
            name_es = EXCLUDED.name_es,
            description = EXCLUDED.description,
            description_am = EXCLUDED.description_am,
            description_so = EXCLUDED.description_so,
            description_es = EXCLUDED.description_es,
            price = EXCLUDED.price,
            image_url = EXCLUDED.image_url,
            tags = EXCLUDED.tags,
            allergens = EXCLUDED.allergens,
            spice_level = EXCLUDED.spice_level,
            calories = EXCLUDED.calories,
            custom_badge = EXCLUDED.custom_badge,
            is_available = EXCLUDED.is_available,
            is_chefs_pick = EXCLUDED.is_chefs_pick,
            is_fasting = EXCLUDED.is_fasting,
            is_draft = EXCLUDED.is_draft,
            is_archived = EXCLUDED.is_archived,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW()
          RETURNING *
        `;
        if (rows && rows.length > 0) {
          return NextResponse.json(rows[0]);
        }
      }
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Failed to save item:', error);
    return NextResponse.json({ error: error.message || 'Save item failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    if (!itemId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        await sql`DELETE FROM public.items WHERE id = ${itemId}`;
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: error.message || 'Delete item failed' }, { status: 500 });
  }
}
