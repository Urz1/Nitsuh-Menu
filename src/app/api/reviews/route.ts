import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { DishReview } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  const itemId = searchParams.get('itemId');

  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 });
  }

  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        let rows;
        if (itemId) {
          rows = await sql`
            SELECT * FROM public.reviews
            WHERE restaurant_id = ${restaurantId} AND item_id = ${itemId}
            ORDER BY created_at DESC
          `;
        } else {
          rows = await sql`
            SELECT * FROM public.reviews
            WHERE restaurant_id = ${restaurantId}
            ORDER BY created_at DESC
          `;
        }

        const formatted: DishReview[] = (rows || []).map((r: any) => ({
          id: r.id,
          restaurant_id: r.restaurant_id,
          item_id: r.item_id,
          rating: Number(r.rating),
          tags: Array.isArray(r.tags)
            ? r.tags
            : typeof r.tags === 'string'
            ? (() => { try { return JSON.parse(r.tags); } catch { return []; } })()
            : [],
          comment: r.comment || undefined,
          photo_url: r.photo_url || undefined,
          session_token: r.session_token,
          table_number: r.table_number || undefined,
          status: r.status,
          report_count: Number(r.report_count || 0),
          flagged_reason: r.flagged_reason || undefined,
          owner_reply: r.owner_reply || undefined,
          owner_reply_at: r.owner_reply_at ? new Date(r.owner_reply_at).toISOString() : undefined,
          owner_reply_by: r.owner_reply_by || undefined,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));

        return NextResponse.json(formatted);
      }
    } catch (err: any) {
      console.error('Error fetching reviews from Neon:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      restaurant_id,
      item_id,
      rating,
      tags = [],
      comment,
      photo_url,
      session_token,
      table_number,
      status = 'published',
      flagged_reason,
    } = body;

    if (!restaurant_id || !item_id || !rating || !session_token) {
      return NextResponse.json(
        { error: 'restaurant_id, item_id, rating, and session_token are required' },
        { status: 400 }
      );
    }

    const reviewId = id || `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`
          INSERT INTO public.reviews (
            id, restaurant_id, item_id, rating, tags, comment,
            photo_url, session_token, table_number, status,
            report_count, flagged_reason, created_at, updated_at
          ) VALUES (
            ${reviewId}, ${restaurant_id}, ${item_id}, ${rating},
            ${JSON.stringify(tags)}, ${comment || null}, ${photo_url || null},
            ${session_token}, ${table_number || null}, ${status},
            0, ${flagged_reason || null}, NOW(), NOW()
          )
          RETURNING *
        `;

        if (rows && rows.length > 0) {
          const r = rows[0];
          const created: DishReview = {
            id: r.id,
            restaurant_id: r.restaurant_id,
            item_id: r.item_id,
            rating: Number(r.rating),
            tags: Array.isArray(r.tags)
              ? r.tags
              : typeof r.tags === 'string'
              ? JSON.parse(r.tags)
              : tags,
            comment: r.comment || undefined,
            photo_url: r.photo_url || undefined,
            session_token: r.session_token,
            table_number: r.table_number || undefined,
            status: r.status,
            report_count: Number(r.report_count || 0),
            flagged_reason: r.flagged_reason || undefined,
            owner_reply: r.owner_reply || undefined,
            owner_reply_at: r.owner_reply_at ? new Date(r.owner_reply_at).toISOString() : undefined,
            owner_reply_by: r.owner_reply_by || undefined,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          };
          return NextResponse.json(created);
        }
      }
    }

    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  } catch (err: any) {
    console.error('Error submitting review to Neon:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, id, replyText, staffName, status, reason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'id and action required' }, { status: 400 });
    }

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    if (action === 'reply') {
      const rows = await sql`
        UPDATE public.reviews
        SET
          owner_reply = ${replyText},
          owner_reply_at = NOW(),
          owner_reply_by = ${staffName || 'Staff'},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json({ success: true, review: rows[0] });
    }

    if (action === 'moderate') {
      const rows = await sql`
        UPDATE public.reviews
        SET
          status = ${status},
          flagged_reason = ${reason || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json({ success: true, review: rows[0] });
    }

    if (action === 'report') {
      const rows = await sql`
        UPDATE public.reviews
        SET
          status = 'reported',
          report_count = report_count + 1,
          flagged_reason = ${reason || 'Reported by diner'},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json({ success: true, review: rows[0] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating review in Neon:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    await sql`DELETE FROM public.reviews WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting review in Neon:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
