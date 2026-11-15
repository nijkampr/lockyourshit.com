import { test } from '@playwright/test';
import { open, pressEscape, preview, state } from './helpers.js';

const sizes = [
  { width: 1440, height: 900 },
  { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

for (const { width, height, ...context } of sizes) {
  test(`screenshots at ${width}x${height}`, async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'screenshots come from chromium only');
    const browserContext = await browser.newContext({ viewport: { width, height }, ...context });
    const page = await browserContext.newPage();
    const shoot = (name, fullPage = false) => page.screenshot({ path: `screens/${name}-${width}x${height}.png`, fullPage });

    await open(page);
    await shoot('landing', true);
    await preview(page);
    await page.clock.runFor(9000);
    await shoot('awake');
    await page.keyboard.press('ArrowRight');
    await state(page, 'notice');
    await shoot('notice');
    await page.locator('#did-it').click();
    await state(page, 'released');
    await page.clock.runFor(30000);
    await shoot('released');
    await pressEscape(page);
    await page.locator('#preview').click();
    await state(page, 'awake');
    await pressEscape(page);
    await page.clock.runFor(5000);
    await shoot('exited');

    const notFound = await browserContext.newPage();
    await notFound.goto('/404.html');
    await notFound.screenshot({ path: `screens/404-${width}x${height}.png`, fullPage: true });
    await browserContext.close();
  });
}
