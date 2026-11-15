// The laptop's voice: the browser's own speech synthesis, on-device voices only,
// one short utterance per line. Remote voices would send the lines to a server,
// so a machine without a local English voice gets a silent run. Anything that
// goes wrong in here means silence, never an error on screen.

const PREFERRED = ['Samantha', 'Daniel', 'Alex', 'Microsoft Zira', 'Microsoft David', 'Microsoft Mark'];
const BASE = { rate: 0.92, pitch: 1 };
const START_CHECK = 3000;

const synth = globalThis.speechSynthesis;
let voice = null;
let enabled = true;
let verified = false;   // a line has actually started playing this run
let blocked = false;    // the browser wouldn't let us speak; silent until a retry
let retriesLeft = 1;
let lastCancel = 0;
let hushes = 0;         // a line queued before the latest hush() must not start after it

function pickVoice() {
  try {
    const local = synth.getVoices().filter((v) => v.localService && v.lang.toLowerCase().startsWith('en'));
    voice = PREFERRED.map((name) => local.find((v) => v.name.startsWith(name))).find(Boolean) || local[0] || null;
  } catch {
    voice = null;
  }
}

export function loadVoices() {
  if (!synth) return;
  pickVoice();
  synth.onvoiceschanged = pickVoice;
  // Some Safari versions never fire voiceschanged, so ask a few more times.
  let polls = 0;
  const id = setInterval(() => {
    pickVoice();
    if (voice || ++polls >= 8) clearInterval(id);
  }, 250);
}

export function setEnabled(on) {
  enabled = on;
}

function unlock() {
  try {
    const silent = new SpeechSynthesisUtterance('armed');
    silent.volume = 0;
    synth.speak(silent);
  } catch {
    blocked = true;
  }
}

// Called inside the arm click: the one moment the browser is sure to allow speech.
export function prime() {
  verified = false;
  blocked = false;
  retriesLeft = 1;
  if (enabled && synth) unlock();
}

// Called on the victim's key presses and clicks. If speech was refused earlier,
// this is a real gesture, so try once more from inside it.
export function gesture() {
  if (!blocked || retriesLeft === 0 || !synth) return;
  retriesLeft = 0;
  blocked = false;
  unlock();
}

export function hush() {
  hushes += 1;
  lastCancel = Date.now();
  try {
    synth?.cancel();
  } catch {
    // a browser that can't cancel had nothing playing
  }
}

const spokenForm = (text) => text.toLowerCase().replace(/[[\]_]/g, ' ').replace(/\s+/g, ' ').trim();

// Resolves when the line has been said, has failed, or has taken too long.
// Never rejects. A silent run resolves at once.
export function say(text, settings = {}) {
  const words = spokenForm(text);
  if (!enabled || blocked || !voice || !synth || !words) return Promise.resolve();

  const generation = hushes;
  return new Promise((resolve) => {
    let started = false;
    const timers = [];
    const finish = () => {
      timers.forEach(clearTimeout);
      resolve();
    };
    const speak = () => {
      if (generation !== hushes) return finish();
      const line = new SpeechSynthesisUtterance(words);
      line.voice = voice;
      line.lang = voice.lang;
      line.rate = settings.rate ?? BASE.rate;
      line.pitch = settings.pitch ?? BASE.pitch;
      line.onstart = () => {
        started = true;
        verified = true;
      };
      line.onend = finish;
      line.onerror = finish;
      timers.push(setTimeout(finish, words.length * 90 + 2000));
      if (!verified) {
        timers.push(setTimeout(() => {
          if (started || generation !== hushes) return;
          blocked = true;
          hush();
          finish();
        }, START_CHECK));
      }
      try {
        synth.speak(line);
      } catch {
        blocked = true;
        finish();
      }
    };
    // Safari can drop an utterance queued straight after cancel().
    const sinceCancel = Date.now() - lastCancel;
    if (sinceCancel < 100) timers.push(setTimeout(speak, 100 - sinceCancel));
    else speak();
  });
}
