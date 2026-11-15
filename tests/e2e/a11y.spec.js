import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { open, pressEscape, preview, previewToNotice } from './helpers.js';

test.use({ bypassCSP: true });

async function violations(page) {
  await page.clock.resume();
  const { violations: found } = await new AxeBuilder({ page }).analyze();
  return found.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(' | ')}`);
}

test('landing has no accessibility violations', async ({ page }) => {
  await open(page);
  expect(await violations(page)).toEqual([]);
});

test('the notice has no accessibility violations', async ({ page }) => {
  await open(page);
  await previewToNotice(page);
  expect(await violations(page)).toEqual([]);
});

test('the exit card has no accessibility violations', async ({ page }) => {
  await open(page);
  await preview(page);
  await pressEscape(page);
  await page.clock.runFor(5000);
  expect(await violations(page)).toEqual([]);
});

test('the 404 page has no accessibility violations', async ({ page }) => {
  await page.goto('/404.html');
  expect(await violations(page)).toEqual([]);
});
