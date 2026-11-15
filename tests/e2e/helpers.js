import { expect } from '@playwright/test';

export const GONE_FOR = (14 * 60 + 32) * 1000;
export const ARMING = 3000;
export const GRACE = 5000;

export const pinPersonality = (page) => page.addInitScript(() => {
  Math.random = () => 0.01;
});

// Fake clock, voice off, and a record of everything that should never happen.
export async function open(page, path = '/') {
  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__violations = [...(window.__violations ?? []), `${event.violatedDirective} ${event.blockedURI}`];
    });
  });
  await page.clock.install({ time: 0 });
  await page.goto(path);
  await page.clock.pauseAt(1000);
  await page.locator('#voice').click();
  await expect(page.locator('#voice')).toHaveAttribute('aria-pressed', 'false');
  return problems;
}

export const state = (page, expected) => expect(page.locator('html')).toHaveAttribute('data-state', expected);

export const lines = (page) => page.locator('#lines').textContent();

export async function arm(page) {
  await page.locator('#arm').click();
  await state(page, 'arming');
  await page.waitForTimeout(400);
}

// Arm, walk away for `awayFor` ms in total (click to first input), then come back.
export async function armAndReturn(page, awayFor = GONE_FOR) {
  await arm(page);
  await page.clock.runFor(ARMING + GRACE);
  await page.clock.runFor(awayFor - ARMING - GRACE);
  await page.keyboard.press('KeyA');
  await state(page, 'awake');
}

// Fullscreen is granted in real time, outside the fake clock. Escape pressed before
// it settles is eaten by the browser, so wait for it.
export async function preview(page) {
  await page.locator('#preview').click();
  await state(page, 'awake');
  await page.waitForTimeout(400);
}

export async function previewToNotice(page) {
  await preview(page);
  await page.keyboard.press('ArrowRight');
  await state(page, 'notice');
}

// In fullscreen the browser may eat Escape and report it as a fullscreenchange,
// which WebKit delivers in real time, outside the fake clock.
export async function pressEscape(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.clock.runFor(100);
}

// Advance the fake clock until #lines shows `text`.
export async function playUntil(page, text, limit = 60000) {
  for (let spent = 0; spent < limit; spent += 250) {
    if ((await lines(page)).includes(text)) return;
    await page.clock.runFor(250);
  }
  throw new Error(`"${text}" never appeared in #lines within ${limit} ms`);
}

// Let a preview play to its natural end, no skipping.
export async function playToNotice(page, limit = 6 * 60 * 1000) {
  for (let spent = 0; spent < limit; spent += 10000) {
    if ((await page.locator('html').getAttribute('data-state')) === 'notice') return;
    await page.clock.runFor(10000);
  }
  await state(page, 'notice');
}
