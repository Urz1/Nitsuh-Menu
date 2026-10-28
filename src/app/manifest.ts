import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nitsuh Cafe & Restaurant — Digital Menu',
    short_name: 'Nitsuh Menu',
    description: 'Official digital menu for Nitsuh Cafe & Restaurant. Browse authentic handcrafted burgers, artisan pizzas, fresh pastries & drinks with table service.',
    start_url: '/?utm_source=pwa',
    id: 'nitsuh-digital-menu-app',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'portrait',
    background_color: '#FAF6F0',
    theme_color: '#C11221',
    categories: ['food', 'shopping', 'lifestyle'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Browse Menu',
        short_name: 'Menu',
        description: 'Explore full digital menu',
        url: '/?utm_source=pwa_shortcut',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Staff & Admin Console',
        short_name: 'Admin',
        description: 'Manage menu items, orders & settings',
        url: '/admin?utm_source=pwa_shortcut',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
