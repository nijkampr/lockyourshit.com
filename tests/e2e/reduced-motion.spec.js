import { expect, test } from '@playwright/test';
import { lines, open, playToNotice, preview } from './helpers.js';

test.use({ reducedMotion: 'reduce' });

test('lines appear whole instead of typing, and the run still reaches the notice', async ({ page }) => {
  await open(page);
  await preview(page);

  let text = '';
  for (let spent = 0; spent < 5000 && !text.includes('h'); spent += 20) {
    await page.clock.runFor(20);
    text = await lines(page);
  }
  expect(text).toContain('hello?');

  await playToNotice(page);
  await expect(page.locator('#receipt-clock')).toHaveText('14:32');
});
