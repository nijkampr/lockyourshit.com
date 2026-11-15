import { expect, test } from '@playwright/test';
import { armAndReturn, open, state } from './helpers.js';

// The never list from docs/adr/0005-nothing-leaves-nothing-stays.md.
test('a full run never calls an API on the never list', async ({ page }) => {
  await page.addInitScript(() => {
    const calls = [];
    window.__never = calls;
    const spy = (owner, name, label) => {
      const original = owner?.[name];
      if (typeof original !== 'function') return;
      owner[name] = function spied(...args) {
        calls.push(label);
        return original.apply(this, args);
      };
    };
    const spyConstructor = (name) => {
      if (typeof window[name] !== 'function') return;
      window[name] = new Proxy(window[name], {
        construct(target, args) {
          calls.push(`new ${name}`);
          return Reflect.construct(target, args);
        },
      });
    };

    spy(window, 'fetch', 'fetch');
    spy(XMLHttpRequest.prototype, 'open', 'XMLHttpRequest.open');
    spy(navigator, 'sendBeacon', 'sendBeacon');
    spy(Element.prototype, 'requestPointerLock', 'requestPointerLock');
    spy(navigator.keyboard, 'lock', 'keyboard.lock');
    spy(navigator.wakeLock, 'request', 'wakeLock.request');
    spy(navigator.clipboard, 'readText', 'clipboard.readText');
    spy(navigator.clipboard, 'read', 'clipboard.read');
    spy(window, 'open', 'window.open');
    spy(window.Notification, 'requestPermission', 'Notification.requestPermission');
    spy(navigator.geolocation, 'getCurrentPosition', 'geolocation.getCurrentPosition');
    spy(navigator.mediaDevices, 'getUserMedia', 'getUserMedia');
    spy(navigator.mediaDevices, 'getDisplayMedia', 'getDisplayMedia');
    for (const name of ['WebSocket', 'EventSource']) spyConstructor(name);

    const addEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function spied(type, ...rest) {
      if (type === 'beforeunload') calls.push('addEventListener beforeunload');
      return addEventListener.call(this, type, ...rest);
    };
  });
  await open(page);

  await armAndReturn(page, 3 * 60 * 1000);
  await page.keyboard.press('ArrowRight');
  await state(page, 'notice');
  await page.clock.runFor(60000);
  await page.locator('#did-it').click();
  await state(page, 'released');
  await page.clock.runFor(30000);

  expect(await page.evaluate(() => window.__never)).toEqual([]);
});
