// Checks the size budgets from docs/design/DESIGN-DIRECTION.md on raw bytes.
// The page runs on someone else's laptop on someone else's network, so weight matters.
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const site = path.join(root, 'site');

const KB = 1024;
const notOnLandingPage = ['img/card.png', 'img/apple-touch-icon.png', '404.html', 'robots.txt', 'humans.txt', 'CNAME'];

const problems = [];
const rows = [];

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

const files = listFiles(site).map((file) => ({
  name: path.relative(site, file).split(path.sep).join('/'),
  bytes: statSync(file).size,
}));

function total(list) {
  return list.reduce((sum, file) => sum + file.bytes, 0);
}

function checkCap(rule, label, actual, cap) {
  rows.push([label, actual, cap]);
  if (actual > cap) problems.push(`site/:0  ${rule}  ${label} is ${actual}, cap ${cap}`);
}

const stylesheet = files.filter((file) => file.name === 'css/style.css');
checkCap('css-size', 'css/style.css', total(stylesheet), 14 * KB);

const scripts = files.filter((file) => file.name.startsWith('js/') && file.name.endsWith('.js'));
checkCap('js-size', 'js/**/*.js', total(scripts), 36 * KB);

const fonts = files.filter((file) => file.name.startsWith('fonts/') && file.name.endsWith('.woff2'));
checkCap('font-count', 'fonts/*.woff2 (files)', fonts.length, 2);
checkCap('font-size', 'fonts/*.woff2 (bytes)', total(fonts), 90 * KB);

for (const image of files.filter((file) => file.name.startsWith('img/'))) {
  checkCap('image-size', image.name, image.bytes, image.name === 'img/card.png' ? 60 * KB : 20 * KB);
}

const landingPage = files.filter(
  (file) => !notOnLandingPage.includes(file.name) && !file.name.startsWith('.well-known/'),
);
checkCap('landing-size', 'landing page total', total(landingPage), 256000);

const width = Math.max(...rows.map(([label]) => label.length));
for (const [label, actual, cap] of rows) {
  console.log(`${label.padEnd(width)}  ${String(actual).padStart(7)} / ${String(cap).padStart(6)}`);
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`${problems.length} problems`);
  process.exit(1);
}
console.log('ok: check-budgets');
