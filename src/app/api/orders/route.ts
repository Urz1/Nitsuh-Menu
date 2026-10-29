import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { MOCK_RESTAURANT_NITSUH } from '@/lib/data-provider';
import { Order } from '@/types/database';

export const dynamic = 'force-dynamic';

function isUuid(val?: string | null): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawRestaurantId = searchParams.get('restaurantId') || MOCK_RESTAURANT_NITSUH.id;

    if (!hasNeon()) {
      return NextResponse.json([]);
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json([]);
    }

    // Resolve restaurant ID if a slug was passed
    let restaurantId = rawRestaurantId;
    if (!isUuid(restaurantId)) {
      const rest = await sql`
        SELECT id FROM public.restaurants WHERE slug = ${rawRestaurantId} LIMIT 1
      `;
      if (rest && rest.length > 0) {
        restaurantId = rest[0].id;
      } else {
        restaurantId = MOCK_RESTAURANT_NITSUH.id;
      }
    }

    const rows = await sql`
      SELECT * FROM public.orders
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const mapped: Order[] = rows.map((r: any) => ({
      id: r.id,
      restaurant_id: r.restaurant_id,
      table_number: r.table_number,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
      subtotal: Number(r.subtotal || 0),
      tax: Number(r.tax || 0),
      total: Number(r.total || 0),
      status: r.status,
      notes: r.notes || undefined,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, table_number, items, subtotal, tax, total, notes, status } = body;

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    let resolvedRestaurantId = restaurant_id || MOCK_RESTAURANT_NITSUH.id;
    if (!isUuid(resolvedRestaurantId)) {
      const rest = await sql`
        SELECT id FROM public.restaurants WHERE slug = ${resolvedRestaurantId} LIMIT 1
      `;
      if (rest && rest.length > 0) {
        resolvedRestaurantId = rest[0].id;
      } else {
        resolvedRestaurantId = MOCK_RESTAURANT_NITSUH.id;
      }
    }

    const jsonItems = JSON.stringify(items || []);
    const cleanSubtotal = Number(subtotal || 0);
    const cleanTax = Number(tax || 0);
    const cleanTotal = Number(total || 0);
    const orderStatus = status || 'pending';

    const inserted = await sql`
      INSERT INTO public.orders (
        restaurant_id,
        table_number,
        items,
        subtotal,
        tax,
        total,
        status,
        notes,
        created_at,
        updated_at
      ) VALUES (
        ${resolvedRestaurantId},
        ${table_number || 'Table 1'},
        ${jsonItems}::jsonb,
        ${cleanSubtotal},
        ${cleanTax},
        ${cleanTotal},
        ${orderStatus},
        ${notes || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    if (!inserted || inserted.length === 0) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const r = inserted[0];
    const order: Order = {
      id: r.id,
      restaurant_id: r.restaurant_id,
      table_number: r.table_number,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
      subtotal: Number(r.subtotal || 0),
      tax: Number(r.tax || 0),
      total: Number(r.total || 0),
      status: r.status,
      notes: r.notes || undefined,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 });
    }

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const updated = await sql`
      UPDATE public.orders
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const r = updated[0];
    const order: Order = {
      id: r.id,
      restaurant_id: r.restaurant_id,
      table_number: r.table_number,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
      subtotal: Number(r.subtotal || 0),
      tax: Number(r.tax || 0),
      total: Number(r.total || 0),
      status: r.status,
      notes: r.notes || undefined,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
