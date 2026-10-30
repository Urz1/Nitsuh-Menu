import { NextResponse } from 'next/server';
import { getNeon, hasNeon } from '@/lib/neon/client';
import { getRestaurantBySlug, MOCK_RESTAURANT_NITSUH } from '@/lib/data-provider';
import { Restaurant } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'nitsuh';

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, slug, updates } = body as {
      id?: string;
      slug?: string;
      updates: Partial<Restaurant>;
    };

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid updates payload' }, { status: 400 });
    }

    if (hasNeon()) {
      const sql = getNeon();
      if (sql) {
        // Build dynamic update query
        const restaurantSlug = slug || 'nitsuh';
        const targetId = id || MOCK_RESTAURANT_NITSUH.id;

        // Fetch current row to merge
        const existing = await sql`
          SELECT * FROM public.restaurants
          WHERE id = ${targetId} OR slug = ${restaurantSlug}
          LIMIT 1
        `;

        if (existing && existing.length > 0) {
          const row = existing[0];
          const newAddress = updates.address !== undefined ? updates.address : row.address;
          const newGoogleMapsUrl = updates.google_maps_url !== undefined ? updates.google_maps_url : row.google_maps_url;
          const newHours = updates.hours !== undefined ? updates.hours : row.hours;
          const newIsOpen = updates.is_open !== undefined ? updates.is_open : row.is_open;
          const normalizedRowName = (row.name === 'Addis Cafeteria' || row.name === 'Nitsuh Cafeteria' || row.name === 'Nitsuh Cafeteria & Bakery' || row.name === 'Nitsuh Grand Cafeteria') ? 'Nitsuh Cafe & Restaurant' : row.name;
          const newName = updates.name !== undefined ? updates.name : normalizedRowName;
          const newShortName = updates.short_name !== undefined ? updates.short_name : row.short_name;
          const newTagline = updates.tagline !== undefined ? updates.tagline : row.tagline;
          const newAnnouncement = updates.announcement !== undefined ? updates.announcement : row.announcement;
          const newCurrency = updates.currency !== undefined ? updates.currency : row.currency;
          const newCurrencyCode = updates.currency_code !== undefined ? updates.currency_code : row.currency_code;
          const newTaxRate = updates.tax_rate !== undefined ? updates.tax_rate : row.tax_rate;
          const newTaxMode = updates.tax_mode !== undefined ? updates.tax_mode : row.tax_mode;
          const newWifiConfig = updates.wifi_config !== undefined ? JSON.stringify(updates.wifi_config) : JSON.stringify(row.wifi_config || {});
          const newThemeConfig = updates.theme_config !== undefined ? JSON.stringify(updates.theme_config) : JSON.stringify(row.theme_config || {});

          const updatedRows = await sql`
            UPDATE public.restaurants
            SET
              name = ${newName},
              short_name = ${newShortName},
              tagline = ${newTagline},
              announcement = ${newAnnouncement},
              hours = ${newHours},
              address = ${newAddress},
              google_maps_url = ${newGoogleMapsUrl},
              is_open = ${newIsOpen},
              currency = ${newCurrency},
              currency_code = ${newCurrencyCode},
              tax_rate = ${newTaxRate},
              tax_mode = ${newTaxMode},
              wifi_config = ${newWifiConfig}::jsonb,
              theme_config = ${newThemeConfig}::jsonb,
              updated_at = NOW()
            WHERE id = ${row.id}
            RETURNING *
          `;

          if (updatedRows && updatedRows.length > 0) {
            const updated = updatedRows[0];
            return NextResponse.json({
              ...updated,
              tax_rate: updated.tax_rate !== undefined && updated.tax_rate !== null ? Number(updated.tax_rate) : 0.15,
            });
          }
        }
      }
    }

    return NextResponse.json({ ...MOCK_RESTAURANT_NITSUH, ...updates });
  } catch (error: any) {
    console.error('Failed to update restaurant settings:', error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
