import { expect, test } from '@playwright/test';
import { armAndReturn, open, state } from './helpers.js';

test('a full run sends nothing and stores one number', async ({ page, context }) => {
  await open(page);
  await page.waitForLoadState('networkidle');
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await armAndReturn(page, 2 * 60 * 1000);
  await page.keyboard.press('ArrowRight');
  await state(page, 'notice');
  await page.clock.runFor(60000);
  await page.locator('#did-it').click();
  await state(page, 'released');
  await page.clock.runFor(30000);
  await expect(page.locator('html')).toHaveAttribute('data-ready', '');

  expect(requests).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  const stored = await page.evaluate(async () => ({
    session: sessionStorage.length,
    local: Object.fromEntries(Object.entries(localStorage)),
    databases: indexedDB.databases ? await indexedDB.databases() : [],
  }));
  expect(stored.session).toBe(0);
  expect(stored.local).toEqual({ 'lys.caught': '1' });
  expect(stored.databases).toEqual([]);
});
