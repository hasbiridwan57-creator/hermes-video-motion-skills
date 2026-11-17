import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const times = process.argv.slice(2).map(Number);
if (!times.length) { console.error('usage: node snap.mjs 0.5 3 7 ...'); process.exit(1); }

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 0.5 });
const file = 'file://' + path.join(__dirname, 'index.html');
for (const t of times) {
  await page.goto(`${file}?t=${t}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, `shots/t${String(t).replace('.', '_')}.png`) });
  console.log('shot t=' + t);
}
await browser.close();
