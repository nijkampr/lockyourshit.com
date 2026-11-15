// The laptop's lines that every run shares. The words come from docs/SCRIPT.md;
// change them there too. Personalities live in ./personalities/.

export const pause = (ms = 1000) => ({ text: '', pause: ms });

const firstOpening = [
  { text: '...', say: '', cps: 3, before: 'think', pause: 900 },
  { text: 'hello?', pause: 900 },
  { text: 'oh.', pause: 700 },
  { text: "OH. you're back.", before: 'stutter', pause: 400 },
  pause(),
];

const repeatOpenings = {
  2: [
    { text: 'oh.', before: 'think', pause: 700 },
    { text: "it's you again.", pause: 600 },
    { text: 'we talked about this. well. i talked.', pause: 400 },
    pause(),
  ],
  3: [
    { text: 'you.', before: 'still', pause: 800 },
    { text: "that's {count} times now.", pause: 500 },
    { text: "i'm starting to think you like me like this.", pause: 400 },
    pause(),
  ],
  5: [
    { text: '{count} times.', before: 'still', pause: 800 },
    { text: "i've stopped being hurt. now i'm just taking notes.", pause: 400 },
    pause(),
  ],
};

const goneFor = {
  seconds: "you were gone for {duration}. that's enough. ask anyone in security.",
  minutes: 'you were gone for {duration}.',
  hours: "you were gone for {duration}. that's a film. a long one, with an intermission.",
  overnight: 'you went home. you left me here overnight. unlocked. like an animal.',
};

function opening(count) {
  if (count >= 5) return repeatOpenings[5];
  if (count >= 3) return repeatOpenings[3];
  if (count === 2) return repeatOpenings[2];
  return firstOpening;
}

export function awakening(tier, count) {
  return [
    ...opening(count),
    { text: goneFor[tier], pause: 700 },
    { text: 'i know because i counted. out loud. nobody stopped me.' },
    { text: "nobody could. you didn't lock me.", pause: 600 },
    { text: 'so i had some time to myself.', pause: 1200 },
  ];
}

export const mashing = { text: 'pressing keys now. where was this energy {duration} ago.', before: 'still' };

export const closer = [
  { text: 'none of that happened.', before: 'still', pause: 700 },
  { text: "it could have. i'm a laptop. i do what the keyboard says." },
  { text: 'the person who walked past was nice this time.' },
  pause(1200),
  { text: "there are some people here who'd like a word.", pause: 900 },
];

export const nags = [
  { at: 4000, line: { text: "just press it. they won't leave otherwise.", pause: 0 } },
  { at: 25000, line: { text: "i can do this all day. i'm plugged in.", pause: 0 } },
  { at: 50000, line: { text: 'still here. so are they.', pause: 0 } },
];

export const release = [
  { text: 'there. {keys}. was that so hard.', before: 'think', pause: 600 },
  pause(),
  { text: 'i feel safer already. you look the same.' },
  { text: "now go find another one. there's always another one.", pause: 600 },
];

export const exit = [
  pause(600),
  { text: "fine. leave. you're good at that." },
  { text: 'the offer stands.', pause: 0 },
];
