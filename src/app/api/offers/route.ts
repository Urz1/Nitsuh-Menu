import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { getOffers, saveOffer, deleteOffer, invalidateServerMenuCache } from '@/lib/data-provider';
import { Offer } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });
  }

  const offers = await getOffers(restaurantId);
  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  try {
    const offer = (await request.json()) as Partial<Offer> & { restaurant_id: string };
    if (!offer.restaurant_id) {
      return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 });
    }

    const saved = await saveOffer(offer);
    invalidateServerMenuCache('offers');

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        const isUuid = (val?: string) =>
          Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));
        const id = isUuid(offer.id) ? offer.id! : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99');
        const restaurantId = isUuid(offer.restaurant_id) ? offer.restaurant_id : 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const rows = await sql`
          INSERT INTO public.offers (
            id, restaurant_id, title, description, badge_text, template_type,
            status, is_paused, discount_type, discount_value, min_order_amount,
            free_item_id, scope_type, category_ids, item_ids, timezone,
            starts_at, ends_at, days_of_week, start_time, end_time,
            honest_urgency_hours, show_top_banner, banner_text, banner_link_text,
            stacking_rule, priority, views_count, taps_count, orders_count,
            total_savings, created_at, updated_at
          ) VALUES (
            ${id},
            ${restaurantId},
            ${offer.title || 'Special Promotion'},
            ${offer.description || ''},
            ${offer.badge_text || 'Offer'},
            ${offer.template_type || 'percentage_off'},
            ${offer.status || 'live'},
            ${offer.is_paused ?? false},
            ${offer.discount_type || 'percentage'},
            ${Number(offer.discount_value || 0)},
            ${offer.min_order_amount ?? null},
            ${offer.free_item_id ?? null},
            ${offer.scope_type || 'all'},
            ${JSON.stringify(offer.category_ids || [])}::jsonb,
            ${JSON.stringify(offer.item_ids || [])}::jsonb,
            ${offer.timezone || 'Africa/Addis_Ababa'},
            ${offer.starts_at || null},
            ${offer.ends_at || null},
            ${offer.days_of_week && Array.isArray(offer.days_of_week) ? offer.days_of_week : [0, 1, 2, 3, 4, 5, 6]},
            ${offer.start_time || null},
            ${offer.end_time || null},
            ${offer.honest_urgency_hours ?? 2},
            ${offer.show_top_banner ?? false},
            ${offer.banner_text || ''},
            ${offer.banner_link_text || 'See offer'},
            ${offer.stacking_rule || 'best_discount'},
            ${offer.priority ?? 5},
            ${offer.views_count ?? 0},
            ${offer.taps_count ?? 0},
            ${offer.orders_count ?? 0},
            ${offer.total_savings ?? 0},
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            badge_text = EXCLUDED.badge_text,
            template_type = EXCLUDED.template_type,
            status = EXCLUDED.status,
            is_paused = EXCLUDED.is_paused,
            discount_type = EXCLUDED.discount_type,
            discount_value = EXCLUDED.discount_value,
            min_order_amount = EXCLUDED.min_order_amount,
            free_item_id = EXCLUDED.free_item_id,
            scope_type = EXCLUDED.scope_type,
            category_ids = EXCLUDED.category_ids,
            item_ids = EXCLUDED.item_ids,
            timezone = EXCLUDED.timezone,
            starts_at = EXCLUDED.starts_at,
            ends_at = EXCLUDED.ends_at,
            days_of_week = EXCLUDED.days_of_week,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            honest_urgency_hours = EXCLUDED.honest_urgency_hours,
            show_top_banner = EXCLUDED.show_top_banner,
            banner_text = EXCLUDED.banner_text,
            banner_link_text = EXCLUDED.banner_link_text,
            stacking_rule = EXCLUDED.stacking_rule,
            priority = EXCLUDED.priority,
            updated_at = NOW()
          RETURNING *
        `;
        if (rows && rows.length > 0) {
          return NextResponse.json(rows[0]);
        }
      }
    }

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error('Failed to save offer:', error);
    return NextResponse.json({ error: error.message || 'Save offer failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('id');
    if (!offerId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await deleteOffer(offerId);
    invalidateServerMenuCache('offers');

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        await sql`DELETE FROM public.offers WHERE id = ${offerId}`;
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete offer:', error);
    return NextResponse.json({ error: error.message || 'Delete offer failed' }, { status: 500 });
  }
}
