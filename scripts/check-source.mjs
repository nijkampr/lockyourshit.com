// Checks site/ against the promises in ADR-0005 and the design rules: CSP, no inline code,
// no external URLs, the never-list APIs, forbidden CSS, the five colours, one keydown listener.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const site = path.join(root, 'site');
const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.md', '.xml', '.webmanifest']);

const requiredCsp =
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'">`;

const allowedUrlPrefixes = [
  /^https:\/\/lockyourshit\.com(?![\w-]|\.\w)/,
  /^https:\/\/github\.com\/nijkampr\/lockyourshit\.com(?![\w-])/,
];
const svgNamespace = 'http://www.w3.org/2000/svg';

const neverList = [
  ['fetch', /\bfetch\s*\(/],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['sendBeacon', /\bsendBeacon\b/],
  ['EventSource', /\bEventSource\b/],
  ['document.cookie', /\bdocument\.cookie\b/],
  ['sessionStorage', /\bsessionStorage\b/],
  ['indexedDB', /\bindexedDB\b/],
  ['serviceWorker', /\bserviceWorker\b/],
  ['navigator.keyboard', /\bnavigator\.keyboard\b/],
  ['requestPointerLock', /\brequestPointerLock\b/],
  ['wakeLock', /\bwakeLock\b/],
  ['IdleDetector', /\bIdleDetector\b/],
  ['getDisplayMedia', /\bgetDisplayMedia\b/],
  ['getUserMedia', /\bgetUserMedia\b/],
  ['clipboard.read', /\bclipboard\.read/],
  ['Notification', /\bNotification\b/],
  ['geolocation', /\bgeolocation\b/],
  ['beforeunload', /\bbeforeunload\b/],
  ['window.open', /\bwindow\.open\b/],
  ['.download =', /\.download\s*=(?!=)/],
  ['eval(', /\beval\s*\(/],
  ['new Function', /\bnew\s+Function\b/],
  ['innerHTML', /\binnerHTML\b/],
  ['outerHTML', /\bouterHTML\b/],
  ['insertAdjacentHTML', /\binsertAdjacentHTML\b/],
  ['document.write', /\bdocument\.write/],
  ['setAttribute style', /setAttribute\(\s*['"]style['"]/],
  ['history.pushState', /\bpushState\b/],
  ['history.replaceState', /\breplaceState\b/],
];

const forbiddenCss = [
  ['gradient(', /gradient\s*\(/],
  ['box-shadow', /box-shadow/],
  ['text-shadow', /text-shadow/],
  ['filter:', /(?<![\w-])filter\s*:/],
  ['backdrop-filter', /backdrop-filter/],
  ['transition', /(?<![\w-])transition/],
  ['!important', /!\s*important/],
  ['blur(', /blur\s*\(/],
];

const allowedColours = new Set(['#000000', '#000', '#0b0b0c', '#f4f1ea', '#8c8c8c', '#ff2d8a']);
const allowedColourKeywords = new Set(['transparent', 'currentcolor', 'inherit', 'none']);

const problems = [];

function listFiles(directory) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function report(file, line, rule, found) {
  problems.push(`${file}:${line}  ${rule}  ${found}`);
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function blankKeepingNewlines(text) {
  return text.replace(/[^\n]/g, ' ');
}

function stripBlockComments(text, pattern) {
  return text.replace(pattern, blankKeepingNewlines);
}

function stripJsComments(text) {
  let out = '';
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') {
        out += next ?? '';
        i++;
      } else if (c === quote || (c === '\n' && quote !== '`')) {
        quote = null;
      }
    } else if (c === '/' && next === '/') {
      while (i + 1 < text.length && text[i + 1] !== '\n') i++;
    } else if (c === '/' && next === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        if (text[i] === '\n') out += '\n';
        i++;
      }
      i++;
    } else {
      out += c;
      if (c === '"' || c === "'" || c === '`') quote = c;
    }
  }
  return out;
}

function forEachMatch(text, pattern, callback) {
  for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))) {
    callback(match, lineAt(text, match.index));
  }
}

function coloursNotAllowed(value) {
  const found = [];
  for (const [literal] of value.matchAll(/#[0-9a-fA-F]{3,8}(?![\w-])/g)) {
    if (!allowedColours.has(literal.toLowerCase())) found.push(literal);
  }
  for (const [call] of value.matchAll(/(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/gi)) {
    found.push(call);
  }
  for (const [name] of value.matchAll(/(?<![\w-])(?:white|black|red|blue|green|pink|purple|gray|grey|yellow|orange)(?![\w-])/gi)) {
    if (!allowedColourKeywords.has(name.toLowerCase())) found.push(name);
  }
  return found;
}

const files = listFiles(site)
  .filter((file) => textExtensions.has(path.extname(file)))
  .map((file) => ({ file, name: relative(file), ext: path.extname(file), text: readFileSync(file, 'utf8') }));

function requireCsp(name) {
  const file = path.join(root, name);
  if (!existsSync(file)) return false;
  if (!readFileSync(file, 'utf8').includes(requiredCsp)) report(name, 1, 'csp-present', 'exact CSP meta tag not found');
  return true;
}

if (!requireCsp('site/index.html')) report('site/index.html', 0, 'csp-present', 'file is missing');
if (existsSync(path.join(site, '404.html'))) requireCsp('site/404.html');

for (const { name, ext, text } of files) {
  if (ext === '.html') {
    const markup = stripBlockComments(text, /<!--[\s\S]*?-->/g);
    forEachMatch(markup, /<script\b(?![^>]*\bsrc\s*=)[^>]*>/i, (m, line) => report(name, line, 'no-inline-script-or-style', m[0]));
    forEachMatch(markup, /<style\b/i, (m, line) => report(name, line, 'no-inline-script-or-style', m[0]));
    forEachMatch(markup, /\sstyle\s*=/i, (m, line) => report(name, line, 'no-inline-script-or-style', 'style attribute'));
    forEachMatch(markup, /\son[a-z]+\s*=\s*["']/i, (m, line) => report(name, line, 'no-inline-script-or-style', `handler attribute${m[0].trimEnd()}`));
  }

  forEachMatch(text, /https?:\/\/[^\s"'<>()`]+/, (m, line) => {
    const url = m[0];
    if (url === svgNamespace && (ext === '.svg' || ext === '.html')) return;
    if (allowedUrlPrefixes.some((prefix) => prefix.test(url))) return;
    report(name, line, 'external-urls', url);
  });
  forEachMatch(text, /\b(?:src|href)\s*=\s*["']\/\/[^"']*/i, (m, line) => report(name, line, 'external-urls', m[0]));
  forEachMatch(text, /url\(\s*["']?\/\/[^)]*/i, (m, line) => report(name, line, 'external-urls', m[0]));

  forEachMatch(text, /\b(?:TODO|FIXME|XXX)\b/, (m, line) => report(name, line, 'no-todo', m[0]));
}

const scriptFiles = files.filter(({ name, ext }) => name.startsWith('site/js/') && ext === '.js');
let keydownListeners = 0;
let consoleMessages = 0;

for (const { name, text } of scriptFiles) {
  const code = stripJsComments(text);

  forEachMatch(code, /\b(?:import|export)\b\s*(?:\(\s*)?(?:[\w*{}\s,$]*?\bfrom\s*)?(['"])([^'"\n]+)\1/, (m, line) => {
    const specifier = m[2];
    if (!specifier.startsWith('./') && !specifier.startsWith('../')) report(name, line, 'bare-imports', specifier);
  });

  for (const [label, pattern] of neverList) {
    forEachMatch(code, pattern, (m, line) => report(name, line, 'never-list', label));
  }

  if (name !== 'site/js/main.js') {
    forEachMatch(code, /\blocalStorage\b/, (m, line) => report(name, line, 'local-storage-one-file', 'localStorage outside main.js'));
  }

  forEachMatch(code, /\bconsole\.(?:log|debug|warn|error)\b/, (m, line) => report(name, line, 'no-console-log', m[0]));

  forEachMatch(code, /\bconsole\.info\b/, (m, line) => {
    consoleMessages++;
    if (consoleMessages > 1) report(name, line, 'one-console-message', 'the hello in main.js is the only one');
  });

  // The one stored number goes through STORAGE_KEY, and nothing else touches storage.
  forEachMatch(code, /\blocalStorage\.(\w+)\(\s*([^,)]*)/, (m, line) => {
    if (!['getItem', 'setItem'].includes(m[1]) || m[2].trim() !== 'STORAGE_KEY') {
      report(name, line, 'one-storage-key', `localStorage.${m[1]}(${m[2]})`);
    }
  });
  forEachMatch(code, /\bconst STORAGE_KEY\s*=\s*(['"])([^'"]*)\1/, (m, line) => {
    if (m[2] !== 'lys.caught') report(name, line, 'one-storage-key', `STORAGE_KEY is ${m[2]}`);
  });

  // Keys are counted, never read: event.key may only be compared with Escape or ArrowRight.
  forEachMatch(code, /\.(?:key|code|keyCode|which|charCode)\b(?!\s*===\s*'(?:Escape|ArrowRight)')/, (m, line) => {
    report(name, line, 'keys-never-read', `${m[0]} used for something other than spotting Escape or ArrowRight`);
  });

  forEachMatch(code, /['"]keydown['"]/, (m, line) => {
    keydownListeners++;
    if (keydownListeners > 1) report(name, line, 'keydown-listeners', `keydown listener number ${keydownListeners}, max 1`);
  });
}

for (const { name, ext, text } of files.filter(({ name, ext }) => name.startsWith('site/css/') && ext === '.css')) {
  const css = stripBlockComments(text, /\/\*[\s\S]*?\*\//g);

  for (const [label, pattern] of forbiddenCss) {
    forEachMatch(css, pattern, (m, line) => report(name, line, 'css-forbidden', label));
  }

  forEachMatch(css, /border(?:-[a-z]+)*-radius\s*:\s*([^;}]*)/, (m, line) => {
    const value = m[1].trim();
    if (!['0', '0px', '2px'].includes(value)) report(name, line, 'css-forbidden', `border-radius: ${value}`);
  });

  forEachMatch(css, /(?<![\w-])animation(?:-timing-function)?\s*:\s*([^;}]*)/, (m, line) => {
    const value = m[1].trim();
    if (value === 'none') return;
    if (/\b(?:ease|ease-in|ease-out|ease-in-out)\b|cubic-bezier/.test(value) || !/steps\(|\blinear\b/.test(value)) {
      report(name, line, 'css-forbidden', `animation timing must be steps() or linear: ${value}`);
    }
  });

  forEachMatch(css, /:\s*([^;{}]+)(?=[;}])/, (m, line) => {
    for (const colour of coloursNotAllowed(m[1])) report(name, line, 'css-colours', colour);
  });
}

for (const { name, text } of files.filter(({ ext }) => ext === '.svg')) {
  forEachMatch(text, /(?<![\w-])(?:fill|stroke|stop-color|flood-color|color)\s*[=:]\s*["']?([^"';>]+)/, (m, line) => {
    for (const colour of coloursNotAllowed(m[1])) report(name, line, 'css-colours', colour);
  });
}

const securityTxt = path.join(site, '.well-known', 'security.txt');
if (existsSync(securityTxt)) {
  const name = relative(securityTxt);
  const text = readFileSync(securityTxt, 'utf8');
  const expires = text.match(/^Expires:\s*(\S+)/m);
  const expiry = expires && /^\d{4}-\d{2}-\d{2}/.test(expires[1]) ? new Date(expires[1]) : null;
  if (!expiry || Number.isNaN(expiry.getTime())) {
    report(name, 1, 'security-txt-expiry', 'no Expires line with an ISO date');
  } else {
    const daysLeft = (expiry.getTime() - Date.now()) / 86_400_000;
    if (daysLeft <= 30 || daysLeft >= 366) report(name, lineAt(text, expires.index), 'security-txt-expiry', `expires in ${Math.floor(daysLeft)} days, want 31 to 365`);
  }
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`${problems.length} problems`);
  process.exit(1);
}
console.log('ok: check-source');
