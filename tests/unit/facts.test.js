import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  clock, couldHave, fill, keys, offenceDate, offenceTime, os, receiptRow, spoken, tier,
} from '../../site/js/facts.js';

const s = 1000;
const m = 60 * s;
const h = 60 * m;

test('clock', () => {
  assert.equal(clock(0), '0:00');
  assert.equal(clock(40 * s), '0:40');
  assert.equal(clock(59_999), '0:59');
  assert.equal(clock(14 * m + 32 * s), '14:32');
  assert.equal(clock(h), '1:00:00');
  assert.equal(clock(h + 4 * m + 9 * s), '1:04:09');
  assert.equal(clock(23 * h), '23:00:00');
});

test('spoken', () => {
  assert.equal(spoken(0), '0 seconds');
  assert.equal(spoken(1 * s), '1 second');
  assert.equal(spoken(59_999), '59 seconds');
  assert.equal(spoken(m), '1 minute');
  assert.equal(spoken(m + s), '1 minute and 1 second');
  assert.equal(spoken(14 * m + 32 * s), '14 minutes and 32 seconds');
  assert.equal(spoken(h), '1 hour');
  assert.equal(spoken(h + 4 * m), '1 hour and 4 minutes');
  assert.equal(spoken(23 * h + m), '23 hours and 1 minute');
});

test('tier', () => {
  assert.equal(tier(0), 'seconds');
  assert.equal(tier(59_999), 'seconds');
  assert.equal(tier(m), 'minutes');
  assert.equal(tier(h - 1), 'minutes');
  assert.equal(tier(h), 'hours');
  assert.equal(tier(8 * h - 1), 'hours');
  assert.equal(tier(8 * h), 'overnight');
});

test('couldHave grows with time and stays short', () => {
  assert.deepEqual(couldHave(30 * s), ['sent one email as you. one is enough.']);
  assert.deepEqual(couldHave(2 * m), ['sent 2 emails as you', 'approved their own pull request']);
  assert.deepEqual(couldHave(14 * m + 32 * s), [
    'sent 14 emails as you', 'approved their own pull request', 'changed your photo to a horse',
  ]);
  const day = couldHave(9 * h);
  assert.equal(day.length, 5);
  assert.equal(day[0], 'sent 540 emails as you');
  assert.equal(day.at(-1), 'lived your whole day better than you did');
  assert.ok(day.includes('ordered 270 pizzas to reception'));
  assert.equal(couldHave(30 * h)[0], 'sent 999 emails as you');
  assert.ok(couldHave(30 * h).includes('ordered 400 pizzas to reception'));
});

test('os', () => {
  assert.equal(os({ userAgentData: { platform: 'macOS' } }), 'mac');
  assert.equal(os({ platform: 'MacIntel', maxTouchPoints: 0 }), 'mac');
  assert.equal(os({ platform: 'MacIntel', maxTouchPoints: 5 }), 'unknown');
  assert.equal(os({ userAgentData: { platform: 'Windows' } }), 'windows');
  assert.equal(os({ platform: 'Win32' }), 'windows');
  assert.equal(os({ userAgentData: { platform: 'Chrome OS' } }), 'chromeos');
  assert.equal(os({ platform: 'Linux x86_64', userAgent: 'X11; Linux x86_64' }), 'linux');
  assert.equal(os({ platform: 'Linux armv8l', userAgent: 'Linux; Android 14' }), 'unknown');
  assert.equal(os({ platform: 'iPhone', userAgent: 'iPhone OS 18' }), 'unknown');
  assert.equal(os({}), 'unknown');
});

test('keys', () => {
  assert.equal(keys('mac').phrase, 'three keys');
  assert.deepEqual(keys('mac').rows[0].caps.map(([glyph]) => glyph), ['⌃', '⌘', 'Q']);
  assert.equal(keys('windows').phrase, 'two keys');
  assert.deepEqual(keys('windows').rows[0].caps.map(([glyph]) => glyph), ['Win', 'L']);
  assert.equal(keys('unknown').rows.length, 4);
  assert.ok(keys('unknown').rows.every((row) => row.label));
});

test('fill replaces the four tokens and leaves the rest alone', () => {
  const facts = { duration: '40 seconds', clock: '0:40', keys: 'two keys', count: 3 };
  assert.equal(fill('{duration} {clock} {keys} {count} {other}', facts), '40 seconds 0:40 two keys 3 {other}');
});

test('offence date and time', () => {
  const when = new Date(2026, 10, 15, 14, 7);
  assert.equal(offenceDate(when), 'sun 15 nov 2026');
  assert.equal(offenceTime(when), '14:07');
  assert.equal(offenceTime(new Date(2026, 0, 1, 9, 5)), '09:05');
});

test('receipt rows are 33 characters when they fit', () => {
  assert.equal(receiptRow('on', 'sun 15 nov 2026').length, 33);
  assert.ok(receiptRow('on', 'sun 15 nov 2026').startsWith('on '));
  assert.equal(receiptRow('offences here', '12 (that we know of)'), 'offences here 12 (that we know of)');
});
