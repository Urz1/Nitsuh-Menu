(globalThis as any).WebSocket = class {
  constructor() {}
  addEventListener() {}
  removeEventListener() {}
};

import { createClient } from '@supabase/supabase-js';
import { MOCK_CATEGORIES_NITSUH, MOCK_ITEMS_NITSUH, MOCK_RESTAURANT_NITSUH } from '../src/lib/data-provider';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vekhuxcaqybqkoxfknfk.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_oLod2_N8a7RgMgxmVf8Zvg_qV9kc7OR';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('--- Starting Supabase Seed ---');

  // 1. Ensure restaurant exists
  const restPayload = {
    id: MOCK_RESTAURANT_NITSUH.id,
    slug: MOCK_RESTAURANT_NITSUH.slug,
    name: MOCK_RESTAURANT_NITSUH.name,
    short_name: MOCK_RESTAURANT_NITSUH.short_name,
    logo_letter: MOCK_RESTAURANT_NITSUH.logo_letter,
    logo_url: MOCK_RESTAURANT_NITSUH.logo_url,
    tagline: MOCK_RESTAURANT_NITSUH.tagline,
    currency: MOCK_RESTAURANT_NITSUH.currency || 'ETB',
    currency_code: MOCK_RESTAURANT_NITSUH.currency_code || 'ETB',
    default_table: MOCK_RESTAURANT_NITSUH.default_table,
    hours: MOCK_RESTAURANT_NITSUH.hours,
    address: MOCK_RESTAURANT_NITSUH.address,
    announcement: MOCK_RESTAURANT_NITSUH.announcement,
    is_open: MOCK_RESTAURANT_NITSUH.is_open,
    tax_rate: MOCK_RESTAURANT_NITSUH.tax_rate,
  };
  const { error: restError } = await supabase.from('restaurants').upsert(restPayload);
  if (restError) console.error('Restaurant upsert error:', restError.message);
  else console.log('✓ Restaurant upserted');

  // 2. Upsert categories
  const catPayloads = MOCK_CATEGORIES_NITSUH.map((cat, idx) => ({
    id: cat.id,
    restaurant_id: cat.restaurant_id || MOCK_RESTAURANT_NITSUH.id,
    name: cat.name,
    name_am: (cat as any).name_am || null,
    name_so: (cat as any).name_so || null,
    name_es: cat.name_es || null,
    icon: cat.icon || '🍽️',
    description: cat.description || null,
    description_am: (cat as any).description_am || null,
    description_so: (cat as any).description_so || null,
    description_es: (cat as any).description_es || null,
    sort_order: cat.sort_order ?? idx + 1,
    is_active: cat.is_active ?? true,
  }));

  const { error: catError } = await supabase.from('categories').upsert(catPayloads);
  if (catError) console.error('Categories upsert error:', catError.message);
  else console.log(`✓ ${catPayloads.length} Categories upserted successfully`);

  // 3. Fetch existing items to protect any custom images already saved
  const { data: existingItems } = await supabase.from('items').select('id, image_url');
  const existingMap = new Map((existingItems || []).map((i) => [i.id, i.image_url]));

  // 4. Upsert menu items
  const itemPayloads = MOCK_ITEMS_NITSUH.map((item, idx) => {
    // Keep existing image if one was uploaded/customized in Supabase
    const currentImageUrl = existingMap.get(item.id) || item.image_url;

    return {
      id: item.id,
      restaurant_id: item.restaurant_id || MOCK_RESTAURANT_NITSUH.id,
      category_id: item.category_id,
      name: item.name,
      name_am: item.name_am || null,
      name_so: item.name_so || null,
      name_es: item.name_es || null,
      description: item.description || null,
      description_am: item.description_am || null,
      description_so: item.description_so || null,
      description_es: item.description_es || null,
      price: item.price,
      image_url: currentImageUrl,
      tags: item.tags || [],
      spice_level: item.spice_level ?? 0,
      is_available: item.is_available ?? true,
      is_chefs_pick: item.is_chefs_pick ?? false,
      sort_order: item.sort_order ?? idx + 1,
    };
  });

  // Upsert in batches of 25
  const batchSize = 25;
  for (let i = 0; i < itemPayloads.length; i += batchSize) {
    const batch = itemPayloads.slice(i, i + batchSize);
    const { error: itemError } = await supabase.from('items').upsert(batch);
    if (itemError) {
      console.error(`Items batch ${i}-${i + batch.length} error:`, itemError.message);
    } else {
      console.log(`✓ Seeded items ${i + 1} to ${Math.min(i + batchSize, itemPayloads.length)}`);
    }
  }

  console.log('--- Seeding Complete ---');
}

seed().catch(console.error);
