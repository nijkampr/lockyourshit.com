import { expect, test } from '@playwright/test';
import { open } from './helpers.js';

test('loads without console errors, page errors or CSP violations', async ({ page }) => {
  const problems = await open(page);
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
  expect(await page.evaluate(() => window.__violations ?? [])).toEqual([]);
});

test('Tab reaches the arm button', async ({ page, browserName }) => {
  await open(page);
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  for (let presses = 0; presses < 20; presses += 1) {
    await page.keyboard.press(tab);
    if (await page.locator('#arm').evaluate((node) => node === document.activeElement)) return;
  }
  throw new Error('#arm was not focused within 20 Tab presses');
});

test('the fine print for the security team is on the page', async ({ page }) => {
  await open(page);
  const fineprint = page.locator('#fineprint');
  await expect(fineprint).toBeAttached();
  await expect(fineprint).toContainText('what it sends');
  await expect(fineprint).toContainText('zero requests');
});
