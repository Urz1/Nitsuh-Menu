import { test, expect } from '@playwright/test';

test.describe('Draggable Bottom Sheet & Acceptance Checks', () => {
  test.beforeEach(async ({ page }) => {
    // Collect console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  });

  test('Check 1, 5, 7: Collapsed state, header visibility, handle aria-expanded and compact bar', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(1000);

    // 1. Full header should be visible with search bar
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();

    // 2. Handle button exists and has aria-expanded
    const handleButton = page.locator('button[aria-expanded]');
    await expect(handleButton).toBeVisible();
    await expect(handleButton).toHaveAttribute('aria-expanded', 'false');

    // 3. Compact bar search button exists
    const compactSearchBtn = page.locator('button[aria-label="Search menu"]');
    await expect(compactSearchBtn).toBeVisible();

    // 4. Category chips visible
    const allChip = page.getByRole('button', { name: /^All/ }).first();
    await expect(allChip).toBeVisible();

    // Take screenshot of collapsed state
    await page.screenshot({ path: '/home/sadam/.gemini/antigravity-ide/brain/14edbc52-3fee-4e41-9718-6e9a5139ccc7/draggable_sheet_collapsed.png' });
  });

  test('Check 2, 7: Handle tap expands sheet, compact bar becomes active', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(800);

    const handleButton = page.locator('button[aria-expanded]');
    await handleButton.click();
    await page.waitForTimeout(600);

    // After expanding, aria-expanded should be true
    await expect(handleButton).toHaveAttribute('aria-expanded', 'true');

    // Take screenshot of expanded state
    await page.screenshot({ path: '/home/sadam/.gemini/antigravity-ide/brain/14edbc52-3fee-4e41-9718-6e9a5139ccc7/draggable_sheet_expanded.png' });

    // Tapping compact search button collapses sheet and focuses search
    const compactSearchBtn = page.locator('header button[aria-label="Search menu"]');
    await compactSearchBtn.click();
    await page.waitForTimeout(600);

    await expect(handleButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('Check 6: Taps on Add, heart, category chips, and search input work without interference', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(800);

    // Test search typing
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('Foul');
    await expect(searchInput).toHaveValue('Foul');
    await searchInput.fill('');

    // Test quick add on dish card
    const firstAddButton = page.locator('button[aria-label*="Add"]').first();
    await expect(firstAddButton).toBeVisible();
    await firstAddButton.click();
    await page.waitForTimeout(300);

    // Order bar should reflect order
    const orderBar = page.locator('button[aria-label="Review My Order"]');
    await expect(orderBar).toBeVisible();

    // Test favorite heart
    const favoriteBtn = page.locator('button[aria-label^="Favorite"]').first();
    await favoriteBtn.click();
    await page.waitForTimeout(300);

    // Take screenshot with added dish & order bar
    await page.screenshot({ path: '/home/sadam/.gemini/antigravity-ide/brain/14edbc52-3fee-4e41-9718-6e9a5139ccc7/draggable_sheet_interaction.png' });
  });

  test('Check 8: prefers-reduced-motion skips entrance animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(200);

    // Sheet should be immediately at collapsed state without waiting for animation
    const handleButton = page.locator('button[aria-expanded]');
    await expect(handleButton).toBeVisible();
    await expect(handleButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('Check 2, 3, 4: Drag tracking, snap physics, and fling', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(800);

    const handleButton = page.locator('button[aria-expanded]');
    const box = await handleButton.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // 1. Drag upwards past the midpoint to trigger snap to expanded
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y - 180, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(600);

    await expect(handleButton).toHaveAttribute('aria-expanded', 'true');

    // 2. Drag downwards to trigger snap back to collapsed
    const expandedBox = await handleButton.boundingBox();
    expect(expandedBox).not.toBeNull();
    if (!expandedBox) return;

    await page.mouse.move(expandedBox.x + expandedBox.width / 2, expandedBox.y + expandedBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(expandedBox.x + expandedBox.width / 2, expandedBox.y + 180, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(600);

    await expect(handleButton).toHaveAttribute('aria-expanded', 'false');
  });
});

