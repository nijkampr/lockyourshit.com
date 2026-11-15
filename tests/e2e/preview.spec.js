import { expect, test } from '@playwright/test';
import { open, previewToNotice, state } from './helpers.js';

test('preview wakes the laptop at once, labels itself and stores nothing', async ({ page }) => {
  await open(page);
  await page.locator('#preview').click();
  await state(page, 'awake');
  await expect(page.locator('html')).toHaveAttribute('data-preview', '');
  await expect(page.locator('.preview-label')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await state(page, 'notice');
  await expect(page.locator('#receipt-clock')).toHaveText('14:32');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
