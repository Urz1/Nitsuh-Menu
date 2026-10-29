import { test, expect } from '@playwright/test';
import { getIntelligentPairings } from '../src/lib/recommendation-engine';
import { MenuItem } from '../src/types/database';

test.describe('Intelligent Recommendation Engine - Research & Cultural Rules', () => {
  const items: MenuItem[] = [
    { id: 'item-fasting-burger', restaurant_id: 'res-1', category_id: 'cat-burger', name: 'Fasting Burger', price: 400, description: 'Fasting patty with fries', image_url: '', tags: ['fasting'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 1 },
    { id: 'item-chicken-wings', restaurant_id: 'res-1', category_id: 'cat-chicken', name: 'Chicken Wings', price: 1000, description: 'Crispy seasoned chicken wings', image_url: '', tags: ['chicken', 'popular'], spice_level: 1, is_available: true, is_chefs_pick: true, sort_order: 2 },
    { id: 'item-special-wrap', restaurant_id: 'res-1', category_id: 'cat-wrap', name: 'Special Wrap', price: 850, description: 'Beef, chicken, cheese and house mayo in warm tortilla', image_url: '', tags: ['wrap'], spice_level: 1, is_available: true, is_chefs_pick: true, sort_order: 3 },
    { id: 'item-nitsuh-special-burger', restaurant_id: 'res-1', category_id: 'cat-burger', name: 'Nitsuh Special Burger', price: 800, description: 'Juicy double beef burger', image_url: '', tags: ['meat', 'popular'], spice_level: 0, is_available: true, is_chefs_pick: true, sort_order: 4 },
    { id: 'item-coffee-buna', restaurant_id: 'res-1', category_id: 'cat-hot-drinks', name: 'Coffee', price: 70, description: 'Single origin highland coffee', image_url: '', tags: ['beverage'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 5 },
    { id: 'item-ambo-water', restaurant_id: 'res-1', category_id: 'cat-soft-drinks', name: 'Ambo Water', price: 90, description: 'Sparkling mineral water', image_url: '', tags: ['beverage', 'fasting'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 6 },
    { id: 'item-macchiato', restaurant_id: 'res-1', category_id: 'cat-hot-drinks', name: 'Macchiato', price: 110, description: 'Highland espresso with milk foam', image_url: '', tags: ['beverage'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 7 },
    { id: 'item-soft-drink', restaurant_id: 'res-1', category_id: 'cat-soft-drinks', name: 'Soft Drink', price: 90, description: 'Chilled soft drink', image_url: '', tags: ['beverage'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 8 },
    { id: 'item-french-fries', restaurant_id: 'res-1', category_id: 'cat-snack-menu', name: 'French Fries', price: 120, description: 'Crispy golden fries', image_url: '', tags: ['snack', 'fasting'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 9 },
    { id: 'item-croissant', restaurant_id: 'res-1', category_id: 'cat-desserts', name: 'Croissant', price: 250, description: 'Flaky butter croissant', image_url: '', tags: ['bakery'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 10 },
    { id: 'item-spris', restaurant_id: 'res-1', category_id: 'cat-juices', name: 'Special Juice', price: 450, description: 'Layered fresh juice (Spris)', image_url: '', tags: ['juice', 'fasting'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 11 },
    { id: 'item-classic-mojito', restaurant_id: 'res-1', category_id: 'cat-mojito', name: 'Classic Mojito', price: 450, description: 'Lemon, mint, and crushed ice', image_url: '', tags: ['mojito'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 12 },
  ];

  test('1. Fasting Isolation Rule: Fasting dish only recommends fasting-friendly options', () => {
    const fastingBurger = items.find((i) => i.id === 'item-fasting-burger')!;
    expect(fastingBurger).toBeDefined();

    const pairings = getIntelligentPairings(fastingBurger, items);
    expect(pairings.length).toBeGreaterThan(0);

    for (const p of pairings) {
      // Must be tagged fasting or safe category/drinks
      const isFastingSafe =
        p.item.tags?.includes('fasting') ||
        p.item.category_id === 'cat-juices' ||
        p.item.category_id === 'cat-soft-drinks' ||
        p.item.id === 'item-coffee-buna' ||
        p.item.id === 'item-ambo-water';
      expect(isFastingSafe).toBe(true);
    }
  });

  test('2. Crispy Chicken Rule: Recommends Soft Drink & Shakes', () => {
    const wings = items.find((i) => i.id === 'item-chicken-wings')!;
    expect(wings).toBeDefined();

    const pairings = getIntelligentPairings(wings, items);
    expect(pairings.length).toBeGreaterThan(0);

    const ids = pairings.map((p) => p.item.id);
    expect(ids).toContain('item-soft-drink');
  });

  test('3. Wrap & Sandwich Rule: Recommends Fresh Mojito & Fruit Juices', () => {
    const wrap = items.find((i) => i.id === 'item-special-wrap')!;
    expect(wrap).toBeDefined();

    const pairings = getIntelligentPairings(wrap, items);
    const ids = pairings.map((p) => p.item.id);
    expect(ids).toContain('item-classic-mojito');
  });

  test('4. Burger Rule: Recommends French Fries as #1 Cross-Sell', () => {
    const burger = items.find((i) => i.id === 'item-nitsuh-special-burger')!;
    expect(burger).toBeDefined();

    const pairings = getIntelligentPairings(burger, items);
    expect(pairings[0].item.id).toBe('item-french-fries');
    expect(pairings[0].intentBadge).toBe('Classic Combo');
  });

  test('5. Coffee Rule: Recommends Croissant / Bakery treat', () => {
    const buna = items.find((i) => i.id === 'item-coffee-buna')!;
    expect(buna).toBeDefined();

    const pairings = getIntelligentPairings(buna, items);
    const ids = pairings.map((p) => p.item.id);
    expect(ids).toContain('item-croissant');
  });
});
