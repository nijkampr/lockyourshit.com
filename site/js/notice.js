// The notice: the union's receipt, the demand, the laptop nagging from the strip,
// and noticing afterwards that the victim locked the machine. The page can't see
// the shortcut itself, only its side effects. See docs/SPEC.md section 8.

import { clock, couldHave, offenceDate, offenceTime, receiptRow } from './facts.js';
import { every, listen, wait } from './run.js';
import { nags } from './script.js';
import { clear, play } from './stage.js';

const $ = (id) => document.getElementById(id);

const BLUR_COUNTS_AFTER = 2000;
const GAP_COUNTS_AFTER = 5000;
const DECIDE_AFTER = 600;

let probablyLocked = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function renderKeys(container, shortcut) {
  container.replaceChildren(...shortcut.rows.map((row) => {
    const line = element('div', 'key-row');
    if (row.label) line.append(element('span', 'key-label', row.label));
    for (const [glyph, name] of row.caps) {
      const cap = element('kbd', 'key');
      cap.append(element('span', 'key-glyph', glyph));
      if (name) cap.append(element('span', 'key-name', name));
      line.append(cap);
    }
    return line;
  }));
}

function fillReceipt({ goneFor, armedAt, count }) {
  const when = new Date(armedAt);
  $('receipt-clock').textContent = clock(goneFor);
  $('receipt-body').textContent = [
    receiptRow('on', offenceDate(when)),
    receiptRow('at', offenceTime(when)),
    receiptRow('offences here', `${count} (that we know of)`),
    receiptRow('witnesses', 'at least one'),
    'unlocked worldwide',
    "   we don't count.",
    "   we don't track.",
    '   assume everyone.',
    '- - - - - - - - - - - - - - - - -',
    `IN ${clock(goneFor)} A STRANGER COULD HAVE`,
    '',
    ...couldHave(goneFor),
  ].join('\n');
}

async function nag(facts) {
  const strip = $('nag');
  clear(strip);
  let elapsed = 0;
  for (const { at, line } of nags) {
    await wait(at - elapsed);
    elapsed = at;
    clear(strip);
    await play(strip, [line], { facts });
  }
}

function watchForLock(onRelease) {
  let blurredAt = 0;
  let lastTick = Date.now();
  const backAfterLock = () => {
    if (probablyLocked && !document.hidden && document.hasFocus()) onRelease();
  };
  listen(document, 'visibilitychange', () => {
    if (document.hidden) probablyLocked = true;
    else backAfterLock();
  });
  listen(window, 'blur', () => {
    blurredAt = Date.now();
  });
  listen(window, 'focus', () => {
    if (blurredAt && Date.now() - blurredAt >= BLUR_COUNTS_AFTER) probablyLocked = true;
    blurredAt = 0;
    backAfterLock();
  });
  every(1000, () => {
    const now = Date.now();
    if (now - lastTick >= GAP_COUNTS_AFTER) probablyLocked = true;
    lastTick = now;
    backAfterLock();
  });
}

export function show({ goneFor, armedAt, count, shortcut, facts, onRelease }) {
  probablyLocked = false;
  fillReceipt({ goneFor, armedAt, count });
  renderKeys($('demand-keys'), shortcut);
  watchForLock(onRelease);
  return nag(facts);
}

// Fullscreen ended during the notice. Either the victim pressed Esc, or the OS
// dropped fullscreen because the machine is locking. A moment later we can tell:
// a lock leaves the page hidden or unfocused, Esc doesn't.
export async function fullscreenLost(onEscape) {
  await wait(DECIDE_AFTER);
  if (document.hidden || !document.hasFocus()) probablyLocked = true;
  else onEscape();
}
