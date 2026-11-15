import { expect, test } from '@playwright/test';
import { GONE_FOR, armAndReturn, open, pinPersonality, playUntil, state } from './helpers.js';

const cases = [
  { stored: '1', opener: "it's you again.", receipt: '2 (that we know of)' },
  { stored: '4', opener: '5 times.', receipt: '5 (that we know of)' },
];

for (const { stored, opener, receipt } of cases) {
  test(`a laptop caught ${stored} time(s) before remembers it`, async ({ page }) => {
    await pinPersonality(page);
    await open(page);
    await page.evaluate((count) => localStorage.setItem('lys.caught', count), stored);

    await armAndReturn(page, GONE_FOR);
    await playUntil(page, opener);
    await page.keyboard.press('ArrowRight');
    await state(page, 'notice');
    await expect(page.locator('#receipt-body')).toContainText(receipt);
  });
}
