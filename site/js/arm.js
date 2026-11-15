// Arming and waiting: fullscreen from the prankster's click, the countdown, and the
// black screen that waits for the owner's first deliberate input. See docs/SPEC.md
// sections 3 and 4.

import { listen, wait } from './run.js';

const GRACE = 5000;
const TRAVEL = 30;
const TRAVEL_WINDOW = 500;

// A refusal or a browser without the API is fine: the prank runs in the tab.
// The request settles later, so if the visitor already left, hand fullscreen back.
export function enterFullscreen(element, stillWanted) {
  try {
    element.requestFullscreen?.()
      ?.then(() => {
        if (!stillWanted()) document.exitFullscreen().catch(() => {});
      })
      .catch(() => {});
  } catch {
    // an old API that throws instead of rejecting: same as a refusal
  }
}

export async function countdown(display) {
  for (const n of ['3', '2', '1']) {
    display.textContent = n;
    await wait(1000);
  }
  display.textContent = '';
}

let poke = null;

// Key presses arrive here from the one keydown listener in main.js.
export function keyPressed() {
  poke?.();
}

// Resolves on the first deliberate input after the grace period: a key, a click,
// a touch, or enough pointer travel that it wasn't someone bumping the desk.
export async function waitForReturn() {
  await wait(GRACE);
  return new Promise((resolve) => {
    let last = null;
    let travel = [];
    const trigger = () => {
      if (document.hidden) return;
      poke = null;
      resolve();
    };
    poke = trigger;
    listen(window, 'pointerdown', trigger);
    listen(window, 'touchstart', trigger, { passive: true });
    listen(window, 'pointermove', (event) => {
      if (last) {
        travel.push([event.timeStamp, Math.abs(event.clientX - last.x) + Math.abs(event.clientY - last.y)]);
        travel = travel.filter(([at]) => event.timeStamp - at <= TRAVEL_WINDOW);
        if (travel.reduce((sum, [, distance]) => sum + distance, 0) >= TRAVEL) trigger();
      }
      last = { x: event.clientX, y: event.clientY };
    });
  });
}
