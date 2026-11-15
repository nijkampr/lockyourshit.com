import { expect, test } from '@playwright/test';
import { ARMING, GONE_FOR, GRACE, armAndReturn, open, pinPersonality, state } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await pinPersonality(page);
  await open(page);
});

test('arming counts down 3 seconds, then waits', async ({ page }) => {
  await page.locator('#arm').click();
  await state(page, 'arming');
  await page.clock.runFor(ARMING - 100);
  await state(page, 'arming');
  await page.clock.runFor(100);
  await state(page, 'armed');
});

test('keys and mouse moves during the grace period do nothing', async ({ page }) => {
  await page.locator('#arm').click();
  await page.clock.runFor(ARMING + 100);
  await state(page, 'armed');
  await page.keyboard.press('KeyA');
  await page.mouse.move(100, 100);
  await page.mouse.move(700, 500, { steps: 10 });
  await page.clock.runFor(GRACE - 500);
  await state(page, 'armed');
});

test('a 5 px jitter after the grace period does nothing, a real move wakes it', async ({ page }) => {
  await page.locator('#arm').click();
  await page.clock.runFor(ARMING + GRACE + 100);
  await page.mouse.move(400, 400);
  await page.mouse.move(405, 400);
  await page.mouse.move(400, 402);
  await page.clock.runFor(1000);
  await state(page, 'armed');
  await page.mouse.move(600, 400, { steps: 10 });
  await state(page, 'awake');
});

test('14 min 32 s away gives a 14:32 receipt that counts the emails', async ({ page }) => {
  await armAndReturn(page, GONE_FOR);
  await page.keyboard.press('ArrowRight');
  await state(page, 'notice');
  await expect(page.locator('#receipt-clock')).toHaveText('14:32');
  await expect(page.locator('#receipt-body')).toContainText('sent 14 emails as you');
});
