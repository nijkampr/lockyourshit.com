// The typing engine. Plays lines into a text area one character at a time while
// the voice reads along. A line is { text, say, pause, cps, before }, see
// docs/SPEC.md section 5. A line with empty text is a pause: only the cursor.

import { fill } from './facts.js';
import { guard, wait } from './run.js';
import { say } from './voice.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const cursor = document.createElement('span');
cursor.className = 'cursor';
cursor.setAttribute('aria-hidden', 'true');
cursor.dataset.mood = 'blink';

const setMood = (mood) => {
  cursor.dataset.mood = mood;
};

let mashLine = null;
let queued = null;
let presses = 0;

// Six key presses during the monologue earn one remark, said after the current line.
export function expectMashing(line) {
  mashLine = line;
  queued = null;
  presses = 0;
}

export function countKey() {
  presses += 1;
  if (presses === 6 && mashLine) {
    queued = mashLine;
    mashLine = null;
  }
}

export function clear(area) {
  area.replaceChildren(cursor);
  setMood('blink');
}

async function before(kind) {
  if (kind === 'think') {
    setMood('blink');
    await wait(800);
  } else if (kind === 'still') {
    setMood('solid');
    await wait(1200);
  } else if (kind === 'stutter') {
    setMood('stutter');
    await wait(480);
  }
}

function charDelay(char, cps) {
  const base = 1000 / cps;
  if ('.?:'.includes(char)) return base + 220;
  if (char === ',') return base + 120;
  return base;
}

async function playLine(area, line, { facts, voice, cps, quiet }) {
  if (line.before) await before(line.before);
  const text = fill(line.text, facts);

  if (text) {
    const paragraph = document.createElement('p');
    const typed = document.createTextNode('');
    paragraph.append(typed, cursor);
    area.append(paragraph);

    const speech = guard(quiet ? Promise.resolve() : say(fill(line.say ?? line.text, facts), voice));
    setMood('solid');
    if (reducedMotion.matches) {
      typed.data = text;
      area.scrollTop = area.scrollHeight;
      await Promise.all([speech, wait(Math.max(900, text.length * 45))]);
    } else {
      const speed = line.cps ?? cps;
      for (const char of text) {
        typed.data += char;
        area.scrollTop = area.scrollHeight;
        await wait(charDelay(char, speed));
      }
      setMood('blink');
      await speech;
    }
  }

  setMood('blink');
  await wait(line.pause ?? 500);
}

export async function play(area, lines, { facts, voice = {}, cps = 28, quiet = false } = {}) {
  const options = { facts, voice, cps, quiet };
  for (const line of lines) {
    await playLine(area, line, options);
    if (queued) {
      const remark = queued;
      queued = null;
      await playLine(area, remark, options);
    }
  }
}
