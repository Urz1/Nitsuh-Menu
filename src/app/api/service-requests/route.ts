import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { MOCK_RESTAURANT_NITSUH } from '@/lib/data-provider';
import { ServiceRequest } from '@/types/database';

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
      SELECT * FROM public.service_requests
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const mapped: ServiceRequest[] = rows.map((r: any) => ({
      id: r.id,
      restaurant_id: r.restaurant_id,
      table_number: r.table_number,
      request_type: r.request_type,
      notes: r.notes || undefined,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch service requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, table_number, request_type, notes, status } = body;

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

    const inserted = await sql`
      INSERT INTO public.service_requests (
        restaurant_id,
        table_number,
        request_type,
        notes,
        status,
        created_at
      ) VALUES (
        ${resolvedRestaurantId},
        ${table_number || 'Service'},
        ${request_type || 'waiter'},
        ${notes || null},
        ${status || 'pending'},
        NOW()
      )
      RETURNING *
    `;

    if (!inserted || inserted.length === 0) {
      return NextResponse.json({ error: 'Failed to create service request' }, { status: 500 });
    }

    const r = inserted[0];
    const serviceReq: ServiceRequest = {
      id: r.id,
      restaurant_id: r.restaurant_id,
      table_number: r.table_number,
      request_type: r.request_type,
      notes: r.notes || undefined,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(serviceReq, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service request:', error);
    return NextResponse.json({ error: error.message || 'Failed to create service request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Request ID and status required' }, { status: 400 });
    }

    if (!hasNeon()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const sql = getNeon();
    if (!sql) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const updated = await sql`
      UPDATE public.service_requests
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    const r = updated[0];
    const serviceReq: ServiceRequest = {
      id: r.id,
      restaurant_id: r.restaurant_id,
      table_number: r.table_number,
      request_type: r.request_type,
      notes: r.notes || undefined,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(serviceReq);
  } catch (error: any) {
    console.error('Error updating service request:', error);
    return NextResponse.json({ error: error.message || 'Failed to update service request' }, { status: 500 });
  }
}
