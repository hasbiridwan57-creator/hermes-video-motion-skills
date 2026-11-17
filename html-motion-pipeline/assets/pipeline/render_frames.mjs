import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const FPS = 30;
const DUR = 44.6;
const TOTAL = Math.floor(DUR * FPS);
const OUT = path.join(__dirname, 'frames');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const file = 'file://' + path.join(__dirname, 'index.html');
await page.goto(`${file}?t=0`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600); // tunggu font

for (let i = 0; i < TOTAL; i++) {
  const t = i / FPS;
  await page.evaluate((t) => {
    const tl = window.__tl; if (tl) tl.time(t, false);
    const w = window.__updateSub; if (w) w(t);
  }, t).catch(()=>{});
  if (i % 30 === 0) console.log('frame', i, 't=' + t.toFixed(2));
  await page.screenshot({ path: path.join(OUT, `f${String(i).padStart(5, '0')}.png`), type: 'png' });
}
console.log('done', TOTAL, 'frames');
await browser.close();
