import { chromium } from 'playwright-core';

// ============================================================
// AUDIT CENTERING VERTIKAL — deteksi konten yang "menggantung di atas".
// Masalah: semua anak .hero memakai position:absolute -> flexbox center
// tidak berefek, sehingga 2/3 bawah frame kosong (konten menumpuk di 1/3 atas).
// Solusi terukur: ukur bounding konten tiap scene, hitung deviasi dari titik
// tengah ideal (960 utk kanvas 1080x1920). Deviasi > 250px = perlu perbaikan.
// ============================================================

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const H = 1920, W = 1080;
const IDEAL_CENTER = H / 2;      // 960
const MAX_DEV = 250;             // px toleransi dari titik tengah
// sampling: 1 titik per scene (di saat elemen paling lengkap)
const SAMPLES = [3, 10, 17, 30, 45, 52.5, 58];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto('file://' + process.cwd() + '/index.html?t=0', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);

let issues = 0;
console.log(`\n${'scene'.padEnd(8)}${'y0'.padEnd(7)}${'y1'.padEnd(7)}${'center'.padEnd(8)}${'dev'.padEnd(7)}status`);
console.log('-'.repeat(48));

for (const t of SAMPLES) {
  await page.evaluate(tt => {
    const tl = window.__tl; if (tl) tl.time(tt, false);
    const w = window.__updateSub; if (w) w(tt);
  }, t);
  await page.waitForTimeout(180);
  const shot = await page.screenshot({ type: 'png' });

  // analisis piksel: konten = piksel yang jauh dari kraft/background
  const res = await page.evaluate(() => {
    const vis = [...document.querySelectorAll('.scene')].find(s => {
      const cs = getComputedStyle(s);
      return cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5;
    });
    if (!vis) return null;
    // ambil bounding semua elemen teks/hero yang terlihat (bukan subtitle)
    let y0 = Infinity, y1 = -Infinity;
    const HH = 1920; // tinggi kanvas, hardcode agar tersedia di dalam page context
    vis.querySelectorAll('*').forEach(e => {
      if (e.id === 'sub' || e.closest('#sub')) return;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (parseFloat(cs.opacity) < 0.15) return;
      const b = e.getBoundingClientRect();
      if (b.width < 8 || b.height < 8) return;
      // abaikan elemen dekoratif full-height (tape, vignette)
      if (b.height > HH * 0.9) return;
      y0 = Math.min(y0, b.top); y1 = Math.max(y1, b.bottom);
    });
    return y0 === Infinity ? null : { y0: Math.round(y0), y1: Math.round(y1) };
  });

  if (!res) { console.log(`t=${t}  kosong — scene tidak terdeteksi`); issues++; continue; }
  const c = Math.round((res.y0 + res.y1) / 2);
  const dev = Math.abs(c - IDEAL_CENTER);
  const ok = dev <= MAX_DEV;
  if (!ok) issues++;
  console.log(`t=${String(t).padEnd(6)}${res.y0}${''.padEnd(6 - String(res.y0).length)}${res.y1}${''.padEnd(6 - String(res.y1).length)}${c}${''.padEnd(7 - String(c).length)}${dev}${''.padEnd(6 - String(dev).length)}${ok ? 'OK' : '⚠  GANTUNG'}`);
}

console.log('-'.repeat(48));
console.log(`TOTAL scene gantung: ${issues}/${SAMPLES.length}`);
console.log(issues === 0 ? '✓ Semua konten ter-center vertikal.' : '⚠  Ada konten di luar batas — perbaiki layout jadi flow terpusat (jangan semua anak position:absolute).');
await browser.close();
process.exit(0);
