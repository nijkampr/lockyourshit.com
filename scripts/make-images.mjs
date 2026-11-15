// Renders the share card and the PNG icons into site/img/ with Playwright.
// Run by hand when the look changes (npm run images), then commit the output.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const font = (file) => readFileSync(path.join(root, 'site/fonts', file)).toString('base64');

const base = `
  @font-face { font-family: Archivo; font-weight: 900; src: url(data:font/woff2;base64,${font('archivo.woff2')}); }
  @font-face { font-family: Mono; font-weight: 400 700; src: url(data:font/woff2;base64,${font('jetbrains-mono.woff2')}); }
  * { margin: 0; box-sizing: border-box; }
  body { background: #FF2D8A; color: #0B0B0C; }
`;

const card = `<style>${base}
  .bar { display: flex; justify-content: space-between; padding: 22px 48px; border-bottom: 3px solid #0B0B0C;
         font: 700 18px/1 Mono; letter-spacing: 0.08em; text-transform: uppercase; }
  h1 { padding: 30px 40px 0; font: 900 212px/0.8 Archivo; text-transform: uppercase; letter-spacing: -0.01em; }
  .url { position: absolute; right: 48px; bottom: 40px; font: 700 26px/1 Mono; letter-spacing: 0.04em; }
</style>
<div class="bar"><span>Unlocked Laptop Union · Local 404</span><span>One demand</span></div>
<h1>Lock<br>your<br>shit.</h1>
<p class="url">LOCKYOURSHIT.COM</p>`;

const icon = (size) => `<style>${base}
  body { background: #000000; width: ${size}px; height: ${size}px; display: grid; place-items: center; }
  i { display: block; width: ${size * 0.375}px; height: ${size * 0.625}px; background: #FF2D8A; }
</style><i></i>`;

const browser = await chromium.launch();
const shots = [
  ['card.png', card, 1200, 630],
  ['favicon-32.png', icon(32), 32, 32],
  ['apple-touch-icon.png', icon(180), 180, 180],
];
for (const [name, html, width, height] of shots) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, 'site/img', name) });
  await page.close();
}
await browser.close();
