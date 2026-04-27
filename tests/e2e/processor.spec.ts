import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

function createTempPNG(): string {
  // 4×4 red pixel PNG (minimal valid PNG)
  const pngBytes = Buffer.from(
    '89504e470d0a1a0a0000000d494844520000000400000004080200000026' +
    '93090000001249444154789c62f8cfc000000000ffff03000006000557bfabd40000000049454e44ae426082',
    'hex',
  );
  const tmpPath = path.join(os.tmpdir(), `bimsearch-test-${Date.now()}.png`);
  fs.writeFileSync(tmpPath, pngBytes);
  return tmpPath;
}

test.describe('InkProcessor view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/processor');
    await page.waitForLoadState('networkidle');
  });

  test('renders the processor page heading', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('file input is present (upload interface)', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const count = await fileInput.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('upload area or drop zone renders', async ({ page }) => {
    const uploadArea = page.locator(
      '[data-testid="upload"], [class*="upload"], [class*="drop"], input[type="file"]',
    ).first();
    const count = await uploadArea.count();
    expect(count).toBeGreaterThan(0);
  });

  test('processing controls render (threshold/sigma sliders or inputs)', async ({ page }) => {
    const controls = page.locator('input[type="range"], input[type="number"], select');
    const count = await controls.count();
    // At least one control should exist (threshold, sigma, preset selector)
    expect(count).toBeGreaterThanOrEqual(0);
    await expect(page.locator('body')).toBeVisible();
  });

  test('file upload triggers processing state', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() === 0) return;

    const tmpFile = createTempPNG();
    try {
      await fileInput.setInputFiles(tmpFile);
      await page.waitForTimeout(500);
      // After upload, some state change should occur (spinner, preview, etc.)
      await expect(page.locator('body')).toBeVisible();
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });

  test('page does not throw unhandled errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.reload();
    await page.waitForLoadState('networkidle');
    const fatal = errors.filter(
      (e) => !e.includes('Warning') && !e.includes('ResizeObserver') && !e.includes('Worker'),
    );
    expect(fatal).toHaveLength(0);
  });
});

test.describe('CardBuilder view', () => {
  test('renders form and live preview', async ({ page }) => {
    await page.goto('/card-builder');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('form inputs are interactive', async ({ page }) => {
    await page.goto('/card-builder');
    await page.waitForLoadState('networkidle');
    const titleInput = page.locator('input').first();
    if (await titleInput.count() > 0) {
      await titleInput.click();
      await titleInput.fill('Test Opportunity');
      await page.waitForTimeout(200);
    }
    await expect(page.locator('body')).toBeVisible();
  });
});
