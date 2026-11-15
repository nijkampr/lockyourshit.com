// The numbers and words the prank derives from what it measured. Pure functions,
// no DOM, so the unit tests can run them in plain Node.

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function clock(ms) {
  const total = Math.floor(ms / SECOND);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

export function spoken(ms) {
  if (ms < MINUTE) return plural(Math.floor(ms / SECOND), 'second');
  if (ms < HOUR) {
    const m = Math.floor(ms / MINUTE);
    const s = Math.floor((ms % MINUTE) / SECOND);
    return s ? `${plural(m, 'minute')} and ${plural(s, 'second')}` : plural(m, 'minute');
  }
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / MINUTE);
  return m ? `${plural(h, 'hour')} and ${plural(m, 'minute')}` : plural(h, 'hour');
}

export function tier(ms) {
  if (ms < MINUTE) return 'seconds';
  if (ms < HOUR) return 'minutes';
  if (ms < 8 * HOUR) return 'hours';
  return 'overnight';
}

export function couldHave(ms) {
  const m = Math.floor(ms / MINUTE);
  if (m < 2) return ['sent one email as you. one is enough.'];
  const extras = [
    [2, 'approved their own pull request'],
    [5, 'changed your photo to a horse'],
    [15, 'booked the big meeting room. forever.'],
    [30, `ordered ${Math.min(Math.floor(m / 2), 400)} pizzas to reception`],
    [60, 'resigned on your behalf. politely.'],
    [480, 'lived your whole day better than you did'],
  ].filter(([from]) => m >= from).map(([, line]) => line);
  return [`sent ${Math.min(m, 999)} emails as you`, ...extras.slice(-4)];
}

export function os(nav = globalThis.navigator) {
  const platform = (nav?.userAgentData?.platform || nav?.platform || '').toLowerCase();
  const agent = (nav?.userAgent || '').toLowerCase();
  if (platform.includes('mac') || (!platform && agent.includes('mac os'))) {
    return nav?.maxTouchPoints > 1 ? 'unknown' : 'mac';
  }
  if (platform.includes('win') || agent.includes('windows')) return 'windows';
  if (platform.includes('cros') || platform.includes('chrome os') || agent.includes('cros')) return 'chromeos';
  if (platform.includes('linux') || agent.includes('linux')) {
    return agent.includes('android') ? 'unknown' : 'linux';
  }
  return 'unknown';
}

const SHORTCUTS = {
  mac: { label: 'macOS', caps: [['⌃', 'control'], ['⌘', 'command'], ['Q', '']] },
  windows: { label: 'Windows', caps: [['Win', ''], ['L', '']] },
  chromeos: { label: 'ChromeOS', caps: [['Search', ''], ['L', '']] },
  linux: { label: 'Linux', caps: [['Super', ''], ['L', '']] },
};

// rows: one row of keycaps per shortcut to show. unknown systems get all four, labelled.
export function keys(system) {
  if (SHORTCUTS[system]) {
    const row = SHORTCUTS[system];
    return { phrase: row.caps.length === 3 ? 'three keys' : 'two keys', rows: [{ ...row, label: '' }] };
  }
  return { phrase: 'two keys', rows: Object.values(SHORTCUTS) };
}

export function fill(text, facts) {
  return text.replace(/\{(duration|clock|keys|count)\}/g, (token, name) => String(facts[name]));
}

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function offenceDate(date) {
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function offenceTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// A receipt row: label on the left, value pushed to the right edge.
export function receiptRow(label, value, width = 33) {
  const gap = Math.max(1, width - label.length - value.length);
  return label + ' '.repeat(gap) + value;
}
