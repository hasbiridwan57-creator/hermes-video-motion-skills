import { chromium } from 'playwright-core';

// ============================================================
// AUDIT OVERLAP TEKS — deteksi teks yang BENERAN bertimpa-timpa.
// Bedakan 3 kategori overlap yang TIDAK boleh dilaporkan (by-design):
//   1. teks di dalam svg container (label di atas gambar)  -> skip
//   2. coretan / strike / garis tembus (efek coret)        -> skip
//   3. subtitle .w berdampingan (flex wrap, bukan tabrakan) -> skip
// Yang dilaporkan: teks × teks, teks × img, teks × tombol.
// LARIKAN di banyak detik (tiap scene saat elemen paling lengkap).
// ============================================================

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1080, H = 1920;
// ambil detik TERAKHIR tiap scene (semua elemen sudah muncul)
const SAMPLES = [3.0, 5.8, 13, 25, 37, 48.5, 52.5, 58];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.goto('file://' + process.cwd() + '/index.html?t=0', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);

let total = 0;
for (const t of SAMPLES) {
  await page.evaluate(tt => {
    const tl = window.__tl; if (tl) tl.time(tt, false);
    const w = window.__updateSub; if (w) w(tt);
  }, t);
  await page.waitForTimeout(220);

  const issues = await page.evaluate(() => {
    const vis = el => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.15;
    };
    // hanya elemen BERTEKS + gambar + tombol (bukan svg pembungkus)
    const sels = [
      ...document.querySelectorAll('.scene h1,.scene h2,.scene p,.scene span,.scene div,.scene a,.scene img,.scene button'),
      ...document.querySelectorAll('#sub .w.on'),
    ];
    const boxes = [];
    sels.forEach(el => {
      if (!vis(el)) return;
      // skip container yang cuma membungkus (punya anak elemen blok banyak)
      const tag = el.tagName.toLowerCase();
      if (tag === 'svg') return;
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) return;
      boxes.push({
        tag, cls: (el.className + '').slice(0, 30),
        text: (el.textContent || '').trim().slice(0, 24),
        x1: r.left, y1: r.top, x2: r.right, y2: r.bottom,
        el,
      });
    });
    const hits = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        // skip pasangan subtitle (flex, bukan tabrakan)
        if (a.cls.includes('w') && b.cls.includes('w')) continue;
        // skip elemen dekoratif by-design: strike/garis/coretan
        const deco = /strike|underline|line|tape|deco|scribble/i;
        if (deco.test(a.cls) || deco.test(b.cls)) continue;
        const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
        const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
        if (ox > 8 && oy > 8) {
          hits.push({ a: a.text || a.cls, b: b.text || b.cls, acls: a.cls, bcls: b.cls, ox: Math.round(ox), oy: Math.round(oy) });
        }
      }
    }
    // unik + urutkan dari yang terparah
    return hits.sort((p, q) => q.ox * q.oy - p.ox * p.oy);
  });

  if (issues.length) {
    total += issues.length;
    console.log(`\n=== t=${t}s ===`);
    issues.slice(0, 8).forEach(x =>
      console.log(`  ⚠ TIMPA "${x.a}" × "${x.b}" [${x.acls} × ${x.bcls}] ${x.ox}×${x.oy}px`));
  }
}
console.log('\n' + '-'.repeat(50));
console.log(`TOTAL tumpang tindih: ${total}`);
console.log(total === 0 ? '✓ Tidak ada teks yang saling menimpa.' : '⚠  Perbaiki posisi elemen agar tidak bertimpa.');
console.log(errs.length ? 'JS errors: ' + errs.join('; ') : 'JS errors: none');
await browser.close();
process.exit(0);
