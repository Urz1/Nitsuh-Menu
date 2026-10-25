import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { Agent, setGlobalDispatcher } from 'undici';
import { neon } from '@neondatabase/serverless';
import {
  MOCK_RESTAURANT_NITSUH,
  MOCK_CATEGORIES_NITSUH,
  MOCK_ITEMS_NITSUH,
  MOCK_OFFERS_NITSUH,
} from '../src/lib/data-provider';

// Configure IPv4 resolution for reliable connection
const agent = new Agent({
  connect: {
    lookup: (hostname: string, options: any, callback: any) => {
      dns.lookup(hostname, { ...options, family: 4 }, (err: any, addresses: any) => {
        callback(err, addresses);
      });
    },
  },
});
setGlobalDispatcher(agent);

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL.trim();
  if (process.env.NEON_DATABASE_URL) return process.env.NEON_DATABASE_URL.trim();
  if (process.env.NEON_DB) return process.env.NEON_DB.trim();

  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const [k, ...v] = line.split('=');
      if (k && v.length) {
        const key = k.trim();
        const val = v.join('=').trim().replace(/^["']|["']$/g, '');
        if (key === 'DATABASE_URL' || key === 'NEON_DATABASE_URL' || key === 'NEON_DB') {
          return val;
        }
      }
    }
  }
  throw new Error('DATABASE_URL, NEON_DATABASE_URL, or NEON_DB is not set in environment or .env.local');
}

async function main() {
  const dbUrl = getDatabaseUrl();
  console.log('⚡ Connecting to Neon PostgreSQL...');
  
  const sql = neon(dbUrl);

  // 1. Run Schema using sql.query on DDL statements
  console.log('📦 Applying neon/schema.sql DDL...');
  const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'neon/schema.sql'), 'utf-8');
  const statements = schemaSql
    .replace(/--.*$/gm, '')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`✓ Schema applied successfully (${statements.length} DDL statements).`);

  console.log('🏪 Upserting Nitsuh Cafeteria restaurant record...');
  await sql`
    INSERT INTO public.restaurants (
      id, slug, name, short_name, logo_letter, logo_url, tagline,
      currency, currency_code, default_table, hours, address, google_maps_url,
      announcement, is_open, tax_rate, tax_mode, theme_config, wifi_config
    ) VALUES (
      ${MOCK_RESTAURANT_NITSUH.id},
      ${MOCK_RESTAURANT_NITSUH.slug},
      ${MOCK_RESTAURANT_NITSUH.name},
      ${MOCK_RESTAURANT_NITSUH.short_name},
      ${MOCK_RESTAURANT_NITSUH.logo_letter},
      ${MOCK_RESTAURANT_NITSUH.logo_url || null},
      ${MOCK_RESTAURANT_NITSUH.tagline},
      ${MOCK_RESTAURANT_NITSUH.currency},
      ${MOCK_RESTAURANT_NITSUH.currency_code},
      ${MOCK_RESTAURANT_NITSUH.default_table},
      ${MOCK_RESTAURANT_NITSUH.hours},
      ${MOCK_RESTAURANT_NITSUH.address},
      ${MOCK_RESTAURANT_NITSUH.google_maps_url || null},
      ${MOCK_RESTAURANT_NITSUH.announcement},
      ${MOCK_RESTAURANT_NITSUH.is_open},
      ${MOCK_RESTAURANT_NITSUH.tax_rate},
      ${MOCK_RESTAURANT_NITSUH.tax_mode || 'inclusive'},
      ${JSON.stringify(MOCK_RESTAURANT_NITSUH.theme_config)},
      ${JSON.stringify(MOCK_RESTAURANT_NITSUH.wifi_config)}
    ) ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      short_name = EXCLUDED.short_name,
      tagline = EXCLUDED.tagline,
      hours = EXCLUDED.hours,
      address = EXCLUDED.address,
      google_maps_url = EXCLUDED.google_maps_url,
      announcement = EXCLUDED.announcement,
      theme_config = EXCLUDED.theme_config,
      wifi_config = EXCLUDED.wifi_config,
      updated_at = NOW();
  `;
  console.log('✓ Restaurant upserted.');

  // 3. Seed Categories
  console.log(`📂 Seeding ${MOCK_CATEGORIES_NITSUH.length} categories...`);
  for (const cat of MOCK_CATEGORIES_NITSUH) {
    await sql`
      INSERT INTO public.categories (
        id, restaurant_id, name, name_am, name_so, name_es,
        icon, description, description_am, description_so, description_es,
        sort_order, is_active
      ) VALUES (
        ${cat.id},
        ${MOCK_RESTAURANT_NITSUH.id},
        ${cat.name},
        ${cat.name_am || null},
        ${cat.name_so || null},
        ${cat.name_es || null},
        ${cat.icon || '🍽️'},
        ${cat.description || null},
        ${cat.description_am || null},
        ${cat.description_so || null},
        ${cat.description_es || null},
        ${cat.sort_order ?? 0},
        ${cat.is_active ?? true}
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        name_am = EXCLUDED.name_am,
        name_so = EXCLUDED.name_so,
        name_es = EXCLUDED.name_es,
        icon = EXCLUDED.icon,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order;
    `;
  }
  console.log('✓ Categories seeded.');

  // 4. Seed Items
  console.log(`🍲 Seeding ${MOCK_ITEMS_NITSUH.length} menu dishes...`);
  for (const item of MOCK_ITEMS_NITSUH) {
    const isFasting = Boolean((item as any).is_fasting);
    await sql`
      INSERT INTO public.items (
        id, restaurant_id, category_id, name, name_am, name_so, name_es,
        description, description_am, description_so, description_es,
        price, image_url, tags, allergens, spice_level, calories, custom_badge,
        is_available, is_chefs_pick, is_fasting, is_draft, is_archived, sort_order
      ) VALUES (
        ${item.id},
        ${MOCK_RESTAURANT_NITSUH.id},
        ${item.category_id},
        ${item.name},
        ${item.name_am || null},
        ${item.name_so || null},
        ${item.name_es || null},
        ${item.description || ''},
        ${item.description_am || null},
        ${item.description_so || null},
        ${item.description_es || null},
        ${item.price},
        ${item.image_url || null},
        ${item.tags || []},
        ${item.allergens || []},
        ${item.spice_level ?? 0},
        ${item.calories || null},
        ${item.custom_badge || null},
        ${item.is_available ?? true},
        ${item.is_chefs_pick ?? false},
        ${isFasting},
        ${item.is_draft ?? false},
        ${item.is_archived ?? false},
        ${item.sort_order ?? 0}
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        image_url = EXCLUDED.image_url,
        tags = EXCLUDED.tags,
        allergens = EXCLUDED.allergens,
        is_available = EXCLUDED.is_available,
        is_chefs_pick = EXCLUDED.is_chefs_pick,
        is_fasting = EXCLUDED.is_fasting;
    `;
  }
  console.log('✓ Menu dishes seeded.');

  // 5. Seed Offers
  console.log(`🏷️ Seeding ${MOCK_OFFERS_NITSUH.length} offers...`);
  for (const offer of MOCK_OFFERS_NITSUH) {
    const badgeColor = (offer as any).badge_color || '#E8590C';
    await sql`
      INSERT INTO public.offers (
        id, restaurant_id, title, description, badge_text, badge_color,
        template_type, status, is_paused, discount_type, discount_value,
        min_order_amount, free_item_id, scope_type, timezone, starts_at, ends_at,
        days_of_week, start_time, end_time, honest_urgency_hours, show_top_banner,
        banner_text, banner_link_text, stacking_rule, priority, category_ids, item_ids
      ) VALUES (
        ${offer.id},
        ${MOCK_RESTAURANT_NITSUH.id},
        ${offer.title},
        ${offer.description || ''},
        ${offer.badge_text || 'Offer'},
        ${badgeColor},
        ${offer.template_type || 'percentage_off'},
        ${offer.status || 'live'},
        ${offer.is_paused ?? false},
        ${offer.discount_type || 'percentage'},
        ${offer.discount_value || 0},
        ${offer.min_order_amount || 0},
        ${offer.free_item_id || null},
        ${offer.scope_type || 'all'},
        ${offer.timezone || 'Africa/Addis_Ababa'},
        ${offer.starts_at || null},
        ${offer.ends_at || null},
        ${offer.days_of_week || [0, 1, 2, 3, 4, 5, 6]},
        ${offer.start_time || null},
        ${offer.end_time || null},
        ${offer.honest_urgency_hours ?? 2},
        ${offer.show_top_banner ?? false},
        ${offer.banner_text || ''},
        ${offer.banner_link_text || 'See offer'},
        ${offer.stacking_rule || 'best_discount'},
        ${offer.priority ?? 0},
        ${JSON.stringify(offer.category_ids || [])},
        ${JSON.stringify(offer.item_ids || [])}
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        badge_text = EXCLUDED.badge_text,
        discount_value = EXCLUDED.discount_value,
        show_top_banner = EXCLUDED.show_top_banner,
        is_paused = EXCLUDED.is_paused;
    `;
  }
  console.log('✓ Offers seeded.');

  console.log('\n🎉 Neon database setup & seed completed successfully!');
}

main().catch((err) => {
  console.error('❌ Neon setup failed:', err);
  process.exit(1);
});
