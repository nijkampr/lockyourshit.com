import assert from 'node:assert/strict';
import { test } from 'node:test';
import personalities from '../../site/js/personalities/index.js';
import * as shared from '../../site/js/script.js';

// The panic rule (docs/BRIEF.md): the laptop never claims anything a real attacker
// would plausibly do. These words would make someone call the service desk.
const PANIC = [
  'password', 'upload', 'transfer', 'payment', 'bank', 'wire', 'encrypt', 'ransom',
  'hacked', 'virus', 'malware', 'leaked', 'exfiltrate', 'sent your',
];

const allLines = [
  ...personalities.flatMap((persona) => persona.lines.map((line) => [persona.id, line])),
  ...shared.awakening('seconds', 1).map((line) => ['awakening', line]),
  ...shared.awakening('overnight', 5).map((line) => ['awakening', line]),
  ...shared.closer.map((line) => ['closer', line]),
  ...shared.release.map((line) => ['release', line]),
  ...shared.exit.map((line) => ['exit', line]),
  ...shared.nags.map(({ line }) => ['nag', line]),
  ['mashing', shared.mashing],
];

test('every personality is well formed', () => {
  const ids = personalities.map((persona) => persona.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  for (const persona of personalities) {
    assert.ok(persona.lines.length >= 4, `${persona.id} has at least four lines`);
    assert.equal(typeof persona.voice.rate, 'number', `${persona.id} sets a rate`);
    assert.equal(typeof persona.voice.pitch, 'number', `${persona.id} sets a pitch`);
  }
});

test('every line has text and only known fields', () => {
  const fields = new Set(['text', 'say', 'pause', 'cps', 'before']);
  for (const [who, line] of allLines) {
    assert.equal(typeof line.text, 'string', `${who}: ${JSON.stringify(line)}`);
    for (const key of Object.keys(line)) assert.ok(fields.has(key), `${who}: unknown field ${key}`);
    if (line.before) assert.ok(['think', 'still', 'stutter'].includes(line.before), `${who}: ${line.before}`);
  }
});

test('the panic rule holds', () => {
  for (const [who, line] of allLines) {
    const words = `${line.text} ${line.say ?? ''}`.toLowerCase();
    for (const word of PANIC) assert.ok(!words.includes(word), `${who} says "${word}": ${line.text}`);
  }
});

test('the laptop stays calm and dashless', () => {
  for (const [who, line] of allLines) {
    const words = `${line.text} ${line.say ?? ''}`;
    assert.ok(!words.includes('!'), `${who} raises its voice: ${line.text}`);
    assert.ok(!/[\u2013\u2014]/.test(words), `${who} uses a dash: ${line.text}`);
  }
});
