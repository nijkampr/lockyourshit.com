import { expect, test } from '@playwright/test';
import personalities from '../../site/js/personalities/index.js';
import { lines, open, preview, state } from './helpers.js';

personalities.forEach((persona, index) => {
  test(`${persona.id} plays through and says its first line`, async ({ page }) => {
    await page.addInitScript((roll) => {
      Math.random = () => roll;
    }, (index + 0.5) / personalities.length);
    await open(page);
    await preview(page);

    const firstLine = persona.lines.find((line) => line.text.trim()).text.trim().split('{')[0].trim();
    let said = false;
    for (let spent = 0; spent < 6 * 60 * 1000; spent += 10000) {
      if ((await page.locator('html').getAttribute('data-state')) === 'notice') break;
      said ||= (await lines(page)).includes(firstLine);
      await page.clock.runFor(10000);
    }
    await state(page, 'notice');
    expect(said, `"${firstLine}" never showed`).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-persona', persona.id);
  });
});
