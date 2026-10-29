import React from 'react';
import type { Metadata } from 'next';
import {
  getRestaurantBySlug,
  getMenuCategories,
  getMenuItems,
  getOffers,
  getDishReviews,
  getReviewSettings,
  MOCK_RESTAURANT_NITSUH,
} from '@/lib/data-provider';
import { ThemeManager } from '@/components/ThemeManager';
import { ClientMenuContainer } from '@/components/ClientMenuContainer';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ table?: string }>;
}

// -----------------------------------------------------------------------------
// DYNAMIC SEO METADATA & OPEN GRAPH PREVIEWS FOR NITSUH DIGITAL MENU
// -----------------------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  const restaurant = (await getRestaurantBySlug('nitsuh')) || (await getRestaurantBySlug('addis')) || MOCK_RESTAURANT_NITSUH;
  const title = `${restaurant.name} | Digital Menu`;
  const description = `${restaurant.tagline}. Hot & fresh fast food, burgers, pizzas, sandwiches, handcrafted sweets & desserts, and specialty coffees.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url:
            restaurant.logo_url ||
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&h=630&q=80',
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        restaurant.logo_url ||
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&h=630&q=80',
      ],
    },
  };
}

// -----------------------------------------------------------------------------
// SERVER-RENDERED ROOT PAGE: NITSUH CAFE & RESTAURANT DIGITAL MENU DIRECTLY
// -----------------------------------------------------------------------------
export default async function HomePage({ searchParams }: PageProps) {
  const { table } = await searchParams;
  const restaurant = (await getRestaurantBySlug('nitsuh')) || (await getRestaurantBySlug('addis')) || MOCK_RESTAURANT_NITSUH;

  const [categories, items, offers, reviews, reviewSettings] = await Promise.all([
    getMenuCategories(restaurant.id),
    getMenuItems(restaurant.id),
    getOffers(restaurant.id),
    getDishReviews(restaurant.id),
    getReviewSettings(restaurant.id),
  ]);

  // Schema.org Structured Data for Google Search
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.tagline,
    servesCuisine: categories.map((c) => c.name.split('/')[0].trim()).join(', '),
    telephone: '0966833177',
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressCountry: 'ET',
    },
    hasMenu: {
      '@type': 'Menu',
      name: `${restaurant.name} Full Menu`,
      hasMenuSection: categories.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.name,
        description: cat.description,
        hasMenuItem: items
          .filter((i) => i.category_id === cat.id)
          .map((item) => ({
            '@type': 'MenuItem',
            name: item.name,
            description: item.description,
            offers: {
              '@type': 'Offer',
              price: item.price.toString(),
              priceCurrency: restaurant.currency_code,
            },
          })),
      })),
    },
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />

      <ThemeManager themeConfig={restaurant.theme_config}>
        <ClientMenuContainer
          restaurant={restaurant}
          categories={categories}
          initialItems={items}
          initialOffers={offers}
          initialReviews={reviews}
          initialReviewSettings={reviewSettings}
          initialTable={table}
        />
      </ThemeManager>
    </>
  );
}
