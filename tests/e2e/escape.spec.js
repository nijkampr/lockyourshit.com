import { expect, test } from '@playwright/test';
import { ARMING, arm, armAndReturn, lines, open, pinPersonality, pressEscape, preview, previewToNotice, state } from './helpers.js';

test.describe('with a fake clock', () => {
  test.beforeEach(async ({ page }) => {
    await pinPersonality(page);
    await open(page);
  });

  async function stayedOnLanding(page) {
    await state(page, 'landing');
    const before = await lines(page);
    await page.clock.runFor(120000);
    await state(page, 'landing');
    expect(await lines(page)).toBe(before);
  }

  test('Escape while arming returns to the landing page for good', async ({ page }) => {
    await arm(page);
    await pressEscape(page);
    await stayedOnLanding(page);
  });

  test('Escape while armed returns to the landing page for good', async ({ page }) => {
    await arm(page);
    await page.clock.runFor(ARMING + 100);
    await state(page, 'armed');
    await pressEscape(page);
    await stayedOnLanding(page);
  });

  test('Escape while awake stops the monologue and leaves the offer standing', async ({ page }) => {
    await armAndReturn(page, 60000);
    await page.clock.runFor(2000);
    await pressEscape(page);
    await state(page, 'exited');
    await page.clock.runFor(20000);
    const text = await lines(page);
    expect(text).not.toContain('i know because i counted');
    expect(text).toContain('the offer stands.');
  });

  test('Escape in the notice exits', async ({ page }) => {
    await previewToNotice(page);
    await pressEscape(page);
    await page.clock.runFor(1000);
    await state(page, 'exited');
  });

  test('Escape after release returns to the landing page', async ({ page }) => {
    await previewToNotice(page);
    await page.locator('#did-it').click();
    await state(page, 'released');
    await pressEscape(page);
    await stayedOnLanding(page);
  });

  test('on the exit card Escape stays put and the back link goes home', async ({ page }) => {
    await preview(page);
    await page.clock.runFor(2000);
    await pressEscape(page);
    await state(page, 'exited');
    await page.clock.runFor(5000);
    await pressEscape(page);
    await state(page, 'exited');
    await page.locator('#exit-back').click();
    await stayedOnLanding(page);
  });
});

test('speech promises do not outlive their run (real time)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'real speech only matters where it is tested');
  test.setTimeout(30000);
  await page.goto('/');
  await page.locator('#preview').click();
  await state(page, 'awake');
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  await state(page, 'exited');
  const atEscape = await lines(page);
  await page.waitForTimeout(6000);
  const later = await lines(page);
  const added = later.replace(atEscape, '');
  expect(added).not.toContain("OH. you're back.");
  expect(added).not.toContain('i know because i counted');
  expect(later).not.toMatch(/none of that happened/);
});
