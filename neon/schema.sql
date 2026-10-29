-- =============================================================================
-- NITSUH DIGITAL MENU: NEON SERVERLESS POSTGRESQL SCHEMA
-- Fully compatible with Neon (neon.tech) serverless driver & standard pg
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANTS (Multi-tenant master table)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(60),
    logo_letter VARCHAR(4) DEFAULT 'N',
    logo_url TEXT,
    tagline TEXT,
    currency VARCHAR(8) DEFAULT 'ETB',
    currency_code VARCHAR(8) DEFAULT 'ETB',
    default_table VARCHAR(32) DEFAULT 'Table 1',
    hours TEXT DEFAULT 'Mon – Sun: 6:30 AM – 11:00 PM',
    address TEXT,
    google_maps_url TEXT,
    announcement TEXT,
    is_open BOOLEAN DEFAULT true,
    tax_rate NUMERIC(4, 3) DEFAULT 0.150,
    tax_mode VARCHAR(16) DEFAULT 'inclusive',
    theme_config JSONB DEFAULT '{
      "primaryColor": "#E8590C",
      "primaryHover": "#D9480F",
      "accentColor": "#F76707",
      "fontFamily": "serif",
      "borderRadius": "md",
      "defaultMode": "light",
      "defaultLayout": "grid",
      "cardStyle": "elevated",
      "imageSize": "standard",
      "priceStyle": "accented",
      "badgeStyle": "vibrant"
    }'::jsonb,
    wifi_config JSONB DEFAULT '{
      "ssid": "Nitsuh-Guest",
      "password": "tastethevibes"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STAFF USERS & ROLES
CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(64),
    phone VARCHAR(32),
    pin VARCHAR(8),
    password_hash TEXT,
    full_name VARCHAR(120),
    role VARCHAR(32) DEFAULT 'staff' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_am VARCHAR(100),
    name_so VARCHAR(100),
    name_es VARCHAR(100),
    icon VARCHAR(16) DEFAULT '🍽️',
    image_url TEXT,
    description TEXT,
    description_am TEXT,
    description_so TEXT,
    description_es TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS public.items (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id VARCHAR(64) REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(120) NOT NULL,
    name_am VARCHAR(120),
    name_so VARCHAR(120),
    name_es VARCHAR(120),
    description TEXT,
    description_am TEXT,
    description_so TEXT,
    description_es TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    spice_level INT DEFAULT 0,
    calories INT,
    custom_badge VARCHAR(40),
    is_available BOOLEAN DEFAULT true,
    is_chefs_pick BOOLEAN DEFAULT false,
    is_fasting BOOLEAN DEFAULT false,
    is_draft BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ITEM OPTIONS / ADDONS
CREATE TABLE IF NOT EXISTS public.item_options (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_am VARCHAR(100),
    price NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_number VARCHAR(32) NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_number VARCHAR(32) NOT NULL,
    request_type VARCHAR(64) NOT NULL,
    notes TEXT,
    status VARCHAR(32) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. OFFERS & HAPPY HOUR DISCOUNTS
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    badge_text VARCHAR(40) DEFAULT 'Offer',
    badge_color VARCHAR(16) DEFAULT '#E8590C',
    template_type VARCHAR(32) DEFAULT 'percentage_off' NOT NULL,
    status VARCHAR(16) DEFAULT 'live' NOT NULL,
    is_paused BOOLEAN DEFAULT false NOT NULL,
    discount_type VARCHAR(16) DEFAULT 'percentage' NOT NULL,
    discount_value NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    free_item_id VARCHAR(64),
    scope_type VARCHAR(20) DEFAULT 'items' NOT NULL,
    timezone VARCHAR(64) DEFAULT 'Africa/Addis_Ababa' NOT NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    days_of_week INT[] DEFAULT ARRAY[0,1,2,3,4,5,6]::INT[],
    start_time VARCHAR(16),
    end_time VARCHAR(16),
    honest_urgency_hours INT DEFAULT 2,
    show_top_banner BOOLEAN DEFAULT false NOT NULL,
    banner_text VARCHAR(160),
    banner_link_text VARCHAR(40) DEFAULT 'See offer',
    stacking_rule VARCHAR(32) DEFAULT 'best_discount' NOT NULL,
    priority INT DEFAULT 0 NOT NULL,
    category_ids JSONB DEFAULT '[]'::jsonb,
    item_ids JSONB DEFAULT '[]'::jsonb,
    views_count INT DEFAULT 0 NOT NULL,
    taps_count INT DEFAULT 0 NOT NULL,
    orders_count INT DEFAULT 0 NOT NULL,
    total_savings NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DISH REVIEWS & DINER FEEDBACK
CREATE TABLE IF NOT EXISTS public.reviews (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    item_id VARCHAR(64) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags JSONB DEFAULT '[]'::jsonb,
    comment TEXT,
    photo_url TEXT,
    session_token TEXT NOT NULL,
    table_number VARCHAR(32),
    status VARCHAR(32) DEFAULT 'published' NOT NULL,
    report_count INT DEFAULT 0 NOT NULL,
    flagged_reason TEXT,
    owner_reply TEXT,
    owner_reply_at TIMESTAMPTZ,
    owner_reply_by VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_neon_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_neon_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_neon_items_category ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_neon_items_restaurant ON public.items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_neon_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_neon_service_requests_restaurant ON public.service_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_neon_offers_restaurant ON public.offers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_neon_reviews_restaurant ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_neon_reviews_item ON public.reviews(item_id);
