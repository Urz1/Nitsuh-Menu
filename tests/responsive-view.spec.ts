import { test, expect } from '@playwright/test';

test.describe('Responsive Customer Dining Experience across Viewports', () => {
  test('1. Desktop/PC Viewport (1440x900): Expansive luxury layout with 4-column dish grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/nitsuh');

    // Wait for hydration and dishes to render
    await expect(page.locator('h1, h2:has-text("Breakfast /  breakfast"), h2:has-text("Breakfast / ቁርስ")').first()).toBeVisible({ timeout: 10000 });

    // Desktop top navigation is visible in SlimHeader
    const desktopNav = page.locator('nav[aria-label="Desktop primary navigation"]');
    await expect(desktopNav).toBeVisible();

    // Floating mobile bottom navigation is HIDDEN on desktop
    const mobileBottomNav = page.locator('nav[aria-label="Bottom Navigation"]');
    await expect(mobileBottomNav).toBeHidden();

    // Hero food promo billboard is wide, centered, and balanced
    const heroBanner = page.locator('aside:has-text("OFF"), [class*="bg-gradient-to-br"]').first();
    await expect(heroBanner).toBeVisible();

    // Dish grid has 4 columns on desktop
    const dishCards = page.locator('article');
    await expect(dishCards.first()).toBeVisible();
    const count = await dishCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify grid styling on desktop
    const gridContainer = page.locator('#menu-items-anchor .grid').first();
    await expect(gridContainer).toBeVisible();
    await expect(gridContainer).toHaveClass(/lg:grid-cols-4/);

    // Open dish detail modal and verify desktop centering
    await dishCards.first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.sm\\:max-w-2xl, .md\\:max-w-3xl').first()).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('2. Tablet Viewport (768x1024): Clean 3-column dish grid', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/nitsuh');

    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });

    // Grid container has responsive sm:grid-cols-3
    const gridContainer = page.locator('#menu-items-anchor .grid').first();
    await expect(gridContainer).toBeVisible();
    await expect(gridContainer).toHaveClass(/sm:grid-cols-3/);

    // SlimHeader and StickySearchBar stretch gracefully
    const searchBar = page.locator('input[placeholder*="favorite dish"]');
    await expect(searchBar).toBeVisible();
  });

  test('3. Mobile Viewport (390x844): Authentic 2-column mobile experience', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/nitsuh');

    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });

    // Grid container uses grid-cols-2 base on mobile
    const gridContainer = page.locator('#menu-items-anchor .grid').first();
    await expect(gridContainer).toBeVisible();
    await expect(gridContainer).toHaveClass(/grid-cols-2/);

    // Bottom navigation bar is strictly VISIBLE and docked on mobile
    const bottomNav = page.locator('nav[aria-label="Bottom Navigation"]');
    await expect(bottomNav).toBeVisible();

    // Desktop top navigation is strictly HIDDEN on mobile
    const desktopNav = page.locator('nav[aria-label="Desktop primary navigation"]');
    await expect(desktopNav).toBeHidden();
  });
});
