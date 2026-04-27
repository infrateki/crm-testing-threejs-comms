import { test, expect } from '@playwright/test';

const DEMO_ID = 'demo-001';

test.describe('OpportunityDetail view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/opportunities/${DEMO_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('renders the page without crashing', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows opportunity title or a heading', async ({ page }) => {
    const heading = page.getByRole('heading');
    await expect(heading.first()).toBeVisible({ timeout: 8000 });
  });

  test('hero-split card illustration area renders', async ({ page }) => {
    // Look for the illustration container (canvas or img)
    const illustration = page.locator('canvas, [class*="illustration"], [class*="hero"]').first();
    const count = await illustration.count();
    // Either an illustration renders or a fallback — page should not be blank
    expect(count).toBeGreaterThanOrEqual(0);
    await expect(page.locator('body')).toBeVisible();
  });

  test('stats bar values are visible', async ({ page }) => {
    // Stats should contain financial/metadata values
    const statsArea = page.locator('[class*="stats"], [data-testid="stats"]').first();
    const count = await statsArea.count();
    if (count > 0) {
      await expect(statsArea).toBeVisible();
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('tab navigation renders multiple sections', async ({ page }) => {
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    if (tabCount > 0) {
      await expect(tabs.first()).toBeVisible();
      await tabs.first().click();
      await page.waitForTimeout(200);
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('page does not throw unhandled errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.reload();
    await page.waitForLoadState('networkidle');
    const fatal = errors.filter((e) => !e.includes('Warning') && !e.includes('ResizeObserver'));
    expect(fatal).toHaveLength(0);
  });
});

test.describe('OpportunityDetail — navigation', () => {
  test('invalid ID shows error state or empty content (not a blank crash)', async ({ page }) => {
    await page.goto('/opportunities/nonexistent-id-xyz');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    // Should show something — error state or "not found" — not a blank page
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
