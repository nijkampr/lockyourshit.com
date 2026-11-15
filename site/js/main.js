// Boot and the state machine. One attribute, data-state on <html>, decides what is
// on screen, and go() is the only thing that changes it. See docs/SPEC.md section 2.

import { countdown, enterFullscreen, keyPressed, waitForReturn } from './arm.js';
import * as facts from './facts.js';
import * as notice from './notice.js';
import personalities from './personalities/index.js';
import * as run from './run.js';
import { awakening, closer, exit, mashing, release } from './script.js';
import * as stage from './stage.js';
import * as voice from './voice.js';

const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const lines = $('lines');

const PREVIEW_GONE_FOR = (14 * 60 + 32) * 1000;
const STORAGE_KEY = 'lys.caught';
const TITLES = { landing: 'Lock your shit.', released: 'locked. good.', exited: 'you left again' };

let state = 'landing';
let inFullscreen = false;
let armedAt = 0;
let current = null;

function go(next) {
  state = next;
  root.dataset.state = next;
  delete root.dataset.ready;
  if (TITLES[next]) document.title = TITLES[next];
}

// The one thing this site stores: how often this browser has been caught.
function caughtAgain() {
  try {
    const count = (Number.parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0) + 1;
    localStorage.setItem(STORAGE_KEY, String(count));
    return count;
  } catch {
    return 1;
  }
}

function sequence(steps) {
  steps().catch((error) => {
    if (!run.wasStopped(error)) throw error;
  });
}

function leaveFullscreen() {
  inFullscreen = false;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

function halt() {
  run.stop();
  voice.hush();
  stage.expectMashing(null);
}

// Called inside the click, after go() has made the stage visible.
function startRun({ preview }) {
  enterFullscreen($('stage'), () => state !== 'landing' && state !== 'exited');
  voice.prime();
  run.begin();
  if (preview) root.dataset.preview = '';
  else delete root.dataset.preview;
}

function arm() {
  if (framed() || onPhone()) return;
  go('arming');
  startRun({ preview: false });
  armedAt = Date.now();
  sequence(async () => {
    await countdown($('countdown'));
    go('armed');
    await waitForReturn();
    await show({ goneFor: Date.now() - armedAt, count: caughtAgain() });
  });
}

function preview() {
  if (framed()) return;
  go('awake');
  startRun({ preview: true });
  armedAt = Date.now() - PREVIEW_GONE_FOR;
  sequence(() => show({ goneFor: PREVIEW_GONE_FOR, count: 1 }));
}

async function show({ goneFor, count }) {
  const shortcut = facts.keys(facts.os());
  current = {
    goneFor,
    count,
    shortcut,
    duration: facts.spoken(goneFor),
    clock: facts.clock(goneFor),
    keys: shortcut.phrase,
  };
  go('awake');
  stage.clear(lines);
  stage.expectMashing(mashing);
  await stage.play(lines, awakening(facts.tier(goneFor), count), { facts: current });

  const persona = personalities[Math.floor(Math.random() * personalities.length)];
  root.dataset.persona = persona.id;
  stage.clear(lines);
  await stage.play(lines, persona.lines, { facts: current, voice: persona.voice, cps: persona.cps });

  stage.clear(lines);
  await stage.play(lines, closer, { facts: current });
  toNotice();
}

function skip() {
  run.begin();
  voice.hush();
  stage.expectMashing(null);
  toNotice();
}

function toNotice() {
  go('notice');
  sequence(() => notice.show({
    goneFor: current.goneFor,
    armedAt,
    count: current.count,
    shortcut: current.shortcut,
    facts: current,
    onRelease: released,
  }));
}

function released() {
  if (state !== 'notice') return;
  run.begin();
  voice.hush();
  go('released');
  stage.clear(lines);
  sequence(async () => {
    await stage.play(lines, release, { facts: current });
    root.dataset.ready = '';
  });
}

function toExit() {
  halt();
  const fromNotice = state === 'notice';
  go('exited');
  leaveFullscreen();
  if (fromNotice) stage.clear(lines);
  notice.renderKeys($('exit-keys'), current.shortcut);
  run.begin();
  sequence(async () => {
    await stage.play(lines, exit, { facts: current, quiet: true });
    root.dataset.ready = '';
  });
}

function backToLanding() {
  halt();
  go('landing');
  delete root.dataset.preview;
  leaveFullscreen();
  $('arm').focus();
}

// Esc, the esc hint, or losing fullscreen. Always gets you out of whatever this is.
// Esc in fullscreen can arrive twice (fullscreenchange and keydown), and the exit
// card is already out, so it ignores both.
function leave() {
  if (state === 'landing' || state === 'exited') return;
  if (state === 'awake' || state === 'notice') toExit();
  else backToLanding();
}

async function liberate() {
  const button = $('liberate');
  try {
    await navigator.clipboard.writeText('https://lockyourshit.com');
    button.textContent = 'Copied. Go.';
    await run.wait(2000);
  } catch (error) {
    if (!run.wasStopped(error)) getSelection().selectAllChildren($('release-url'));
  } finally {
    button.textContent = 'Liberate another laptop';
  }
}

function framed() {
  return window.top !== window.self;
}

function onPhone() {
  return matchMedia('(pointer: coarse)').matches && innerWidth < 900;
}

// The only keydown listener on the site. It recognises Escape and the right arrow
// and otherwise only counts. What was typed is never looked at, kept, shown or sent.
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') return leave();
  if (event.key === 'ArrowRight' && state === 'awake') return skip();
  if (state === 'armed') keyPressed();
  if (state === 'awake') stage.countKey();
  voice.gesture();
});

addEventListener('pointerdown', () => voice.gesture());

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    inFullscreen = true;
    return;
  }
  if (!inFullscreen) return;
  inFullscreen = false;
  if (state === 'notice') sequence(() => notice.fullscreenLost(toExit));
  else leave();
});

$('arm').addEventListener('click', arm);
$('preview').addEventListener('click', preview);
$('esc-hint').addEventListener('click', leave);
$('notice-esc-hint').addEventListener('click', leave);
$('skip-hint').addEventListener('click', skip);
$('did-it').addEventListener('click', released);
$('liberate').addEventListener('click', liberate);
$('exit-back').addEventListener('click', backToLanding);
$('voice').addEventListener('click', (event) => {
  const on = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(on));
  voice.setEnabled(on);
});

if (framed()) {
  const link = document.createElement('a');
  link.href = 'https://lockyourshit.com';
  link.target = '_top';
  link.textContent = 'This only works on lockyourshit.com itself.';
  $('arm').replaceWith(link);
  $('preview').remove();
}

voice.loadVoices();

console.info([
  "looking for the catch? there isn't one.",
  'no requests. no tracking. one number in localStorage: how often this laptop got caught.',
  'the source is the whole trick: https://github.com/nijkampr/lockyourshit.com',
  'now lock your shit.',
].join('\n'));
