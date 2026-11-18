---
name: video-motion
description: >-
  SOP induk untuk bikin video motion/explainer bersuara via chat (9:16 Reels/TikTok,
  16:9 YouTube, 1:1 feed) — menggabungkan alur kerja Motion Format (brief→gaya→naskah→
  suara→adegan→render), hukum sinematik Bang Motion (video bukan slide, deterministik,
  gaya dari tema), dan pipeline HTML→MP4 teruji (html-motion-pipeline: faster-whisper,
  SFX prosedural, CDP render, audit layout, subtitle aman Reels). Gunakan bila user
  minta video motion/explainer/animasi/promo, atau "kayak video sebelumnya" — walau
  tidak menyebut "motion graphic".
metadata:
  version: "1.2.0"
  author: Hasbi workflow (digabung dari bang-motion + motion-format + html-motion-pipeline)
  updated: "2026-11-17"
---

# Video Motion — alur baku video bersuara via chat

Alur induk. Tiga sumber punya peran masing-masing — **jangan dibaca semua setiap proyek**,
panggil sesuai fase:

| Fase | Sumber aturan | Skill |
|---|---|---|
| Brief, gaya, naskah, VO, urutan kerja via chat | motion-format | `skill_view('motion-format')` |
| Hukum desain & sinematik (video≠slide, deterministik, gaya dari tema, jebakan) | bang-motion | `skill_view('bang-motion')` |
| Pipeline teknis render (whisper, SFX, CDP frame, audit, subtitle aman) | html-motion-pipeline | `skill_view('html-motion-pipeline')` |

## Kapan pakai yang mana
- **Gaya spesifik ada resepnya** (isometrik, kartun cel, sejarah-3D, promo produk, dll.)
  → pakai mesin **motion-format** (`mf.py`) + resep gayanya.
- **Explainer flat-motion 2D / diagram estafet / tech-explainer** (kayak video Function
  Calling) → pakai **html-motion-pipeline** (arsitektur GSAP + render CDP), patuhi hukum
  desain **bang-motion**.
- **Promo/opener/bumper/kinetic type** → **bang-motion** sebagai sumber hukum + arsitektur.

## MULAI DI SINI — gerbang urutan (jangan lewati)

**Sebelum menulis SATU baris pun** (HTML, naskah, VO) untuk tugas video:
1. `skill_view('video-motion')` dulu — lalu sub-skill sesuai fase (tabel di atas).
2. **RISET DULU kalau topiknya butuh fakta/jurus nyata** (topik edukasi, "cara X",
   perbandingan, berita): kumpulkan poin kunci + hook kuat dari sumber beneran
   (`web_search`/`web_extract`) SEBELUM menyusun naskah — jangan mengarang isi dari
   ingatan. Lihat `references/topik-riset.md` untuk cara memilih & memvariasikan angle.
3. **URUTAN KERJA mengikuti user, bukan tabel fase di atas.** Urutan default dokumen
   adalah brief→gaya→naskah, TAPI user Hasbi sering sengaja membaliknya: **riset topik →
   pilih topik → naskah → BARU brief gaya.** Kalo user bilang "mulai dari topik/naskah
   dulu, baru brief", patuhi itu — jangan tawarkan gaya atau tunjuk draft naskah sebelum
   topik disepakati. Kunci setiap fase lewat ACC user (pilih 1 dari opsi) sebelum lanjut.
4. **Adegan 1 uji visual + ACC dulu, baru VO & adegan lainnya.** Jangan pernah bangun
   seluruh video (semua adegan + render MP4) sebelum adegan 1 disetujui user.
5. **Jangan bawa beban project lama.** Tiap video = folder baru & mulai dari brief
   bersih; user sering minta "lupakan project sebelumnya, riset dari awal".

**PITFALL (mahal):** Membangun dari ingatan/insting alih-alih membaca sub-skill
menghasilkan **deck slide** — tiap adegan jadi `<section>` yang di-fade in-out. Ini
melanggar Hukum #1 dan butuh render penuh (~9 menit) sebelum kelihatan "ancur".
Baca bang-motion DULU; mulai dari `index.fc-reference.html`, jangan tulis dari nol.

## Alur baku (adaptif — pakai bagian yang relevan)

1. **Brief 5 hal** (motion-format): apa, topik+bahan, untuk siapa, durasi, rasio+subtitle.
   Tanya maksimal 1×, sisanya default.
2. **Gaya** — user sebut → langsung pakai; belum → tawarkan 3 + 1 rekomendasi. Tulis
   `gaya.md` (palet hex + sumber, font, latar, tanda tangan gerak, 1 hal pembeda).
   **Latar tidak default gelap.** Gaya dari tema/brand, bukan dari starter/referensi.
3. **Gambar uji adegan 1** (±8 dtk, mutu final) → potret → tampilkan → user setuju.
4. **Naskah per adegan** → `naskah.md`. Atau bila user rekam sendiri: minta file VO.
5. **VO + timing**
   - User rekam sendiri (ElevenLabs dsb.): proses filenya. **Transkripsi + timestamp per
     kata** via faster-whisper (pipeline). Terlalu cepat → tawarkan varian tempo
     (0.75/0.90/0.97) pilih satu.
   - Via ElevenLabs API: klip per adegan, tes adegan 1 dulu. Jangan buang kredit tanpa izin.
   - Sinkron kalimat pakai jeda napas (`silencedetect`).
6. **Bangun semua adegan** — waktu adegan mengikuti waktu VO. Bangun 2–3 → potret →
   perbaiki → ulangi. Beri "detail lagi" di adegan terlemah. Nol error JS.
7. **AUDIT LAYOUT SEBELUM RENDER** (wajib, lihat pipeline): 0 overflow, tak menabrak
   elemen, subtitle aman dari zona UI bawah (Reels/TikTok ≈360px). **Plus 0 frame
   kosong** — cek tiap adegan pada frame awalnya (t0..t0+0.5): elemen konten
   (non-subtitle) WAJIB sudah opacity>0. Audit DOM yang hanya cek tabrakan/overflow
   TIDAK menangkap ini (lihat Gotcha #6).
7b. **AUDIT GERAK SEBELUM SERAHKAN (wajib, terpisah dari audit layout).** Audit layout
   & "frame kosong" hanya membuktikan KONTEN ADA, bukan VIDEO BERGERAK — video stasis
   (deck slide mati) lolos keduanya lalu gagal total di mata user. Ukur gerak nyata:
   ekstrak dua frame dari MP4 final di tengah SATU adegan (bukan lintas adegan, mis
   t dan t+0.4) → hitung rata-rata selisih piksel absolut `mean(|A-B|)`.
   **mean diff < 1.0 = adegan itu STASIS, tolak.** Tiap adegan wajib lolos — ada
   konten + ada gerak antar-frame adalah dua gate berbeda; lolos yang satu bukan
   lolos yang lain. (Lihat Gotcha #12.)
8. **Render**: cek ±8 dtk → user dengar/lihat → render penuh → MP4.

## Hukum wajib (ringkas dari bang-motion + motion-format)
1. **Video, bukan slide.** Kamera/dunia bergerak; adegan berganti karena dunia bergerak,
   bukan `<section>` di-fade. Satu subjek/benang merah visual bertahan.
2. **Deterministik.** Semua visual = fungsi murni `t`/`tl.time()`. Nol `Math.random()`
   tanpa benar-benar, `Date`, `performance.now`.
3. **Gaya dari tema, bukan starter/referensi.** Referensi = ritme, bukan kulit. Dua video
   berbeda beda di ≥3 dari: palet, font, latar, tanda tangan gerak. **Kecuali seri
   (Part 1,2,…): wajib konsisten.**
   - **Jangan mengkloning layout video sebelumnya.** Mengganti palet/font saja, lalu
     memakai struktur `<judul di atas> + <gambar kecil> + <kartu bawah>` yang sama,
     tetap terlihat "sama banget" bagi user — beda warna bukan beda desain. Saat mulai
     video baru (bukan seri), rombak KOMPOSISI tiap adegan, jangan hanya recolor template.
   - **Beri tiap adegan SATU fokus besar (satu hero) di band tengah, tanpa elemen yang
     bertindih.** User menolak layout ramai/bertumpuk. Susun hero di area tengah, sisanya
     pendukung di bawah/tepi — jangan dua-tiga blok sama besarnya berdempetan.
4. **Teks hidup, latar tunduk.** Sentence case; tanda baca hanya bila mengubah arti/irama;
   kontras kuat; latar tidak flat satu warna.
   - **Teks jangan mepet frame.** Teks lebar (`width:100%` + `text-align:center`) dgn font
     besar (≥56px) bisa menyentuh/menempel tepi kiri-kanan. User menolak ini ("mepet mepet
     frame banget"). Beri padding samping minimal 50px ATAU ganti `width:100%` jadi
     `left:50px; right:50px` untuk tiap teks satu-baris besar. Verifikasi via DOM:
     bounding-box teks wajib punya jarak ≥40px dari kiri & kanan kanvas.
5. **Hook bergerak sejak frame 0.** Momen penting diberi waktu ±2,5 dtk.
6. **Subtitle per kata** untuk 9:16; kata kunci berwarna aksen; di zona aman.
7. **Fakta di layar = fakta di naskah.** Tidak mengarang angka.
8. **Garis penghubung** (diagram node): SVG di lapisan **paling bawah** scene, anchor
   **tepi-ke-tepi** (bukan pusat logo), kurva halus — tak pernah menembus ikon/teks.
9. **Logo identitas** = aset asli user/brand (ambil dari web bila perlu), bukan emoji generik.

## Verifikasi (kamu tak bisa menonton — hanya melihat FRAME)
- Potret detik kunci via `snap.mjs` (pipeline) / `mf.py potret` (motion-format).
- Susun contact sheet → nilai: teks kepotong? tumpang tindih? garis menembus? masih slide?
- **Audit layout via DOM** (`getBoundingClientRect`) sebelum render penuh.
- MP4 hanya saat export final — bukan alat pengecekan.
- **Audit "frame kosong" via analisis piksel** (andal bila vision backend mati): ekstrak
  frame dari MP4 tiap 0.25 dtk, hitung % piksel gelap (lum<100) di zona scene (y 200–1300).
  Frame dgn <0.5% = adegan hampir kosong. Kalau frame "paling minim" jatuh tepat di
  `t0` tiap adegan → ada jeda kosong di awal adegan (Gotcha #6). Bisa juga via DOM:
  hitung elemen non-subtitle dgn opacity>0 di t0 & t0+0.1 tiap adegan.

## Penyerahan
- `index.html`/`scene.html` terbuka via `file://` (klik dua kali), autoplay + loop,
  tanpa player di layar, `?debug=1` untuk scrub.
- MP4: lapor path, durasi, 1–2 hal yang mungkin mau direvisi.
- Hapus frame/PNG mentah & shots setelah kirim (storage terbatas).

## Resep flat-motion 2D (proyek edu-tech)

Pola teruji untuk explainer flat-motion 2D edu-tech. Gunakan bila user minta
"video kayak yang kemarin" atau meminta format yang sama.

### Struktur project tunggal (alternatif ringkas)

Bila tak pakai toolchain `mf.py` motion-format, satu folder project cukup:
```
PROJECT/
  index.html       # SEMUA scene + subtitle + script GSAP (SCENES[]/CHUNKS[])
  render.mjs       # playwright-core seek per frame → PNG → ffmpeg mux VO → MP4
  snap.mjs         # snapshot statis utk debug layout
  transcribe.py    # faster-whisper word-timestamp
  gaya.md  vo_words.json  package.json
  assets/audio/vo.mp3     assets/logos/*.png|svg
```

### Subtitle per-kata sinkron Whisper (WAJIB)

- **Jangan hitung timing proporsional** dari durasi VO — meleset 1–3 detik dan
  subtitle ga sinkron. Timing HANYA dari `vo_words.json` (output faster-whisper).
- Setup: `python3 -m venv .venv && .venv/bin/pip install faster-whisper`, lalu
  `.venv/bin/python transcribe.py assets/audio/vo.mp3 vo_words.json`.
- Config Whisper: model `small`, `language="id"`, `word_timestamps=True`,
  `vad_filter=True`, `int8` (CPU).
- **Decode audio manual** via ffmpeg ke numpy float32 — hindari bug `av`
  version mismatch di faster-whisper.
- Whisper kadang miss kata di akhir: cek energi audio 3 detik terakhir
  (`ffmpeg astats`), bila ada suara tambahkan word manual di `vo_words.json`.
- Koreksi teks salah dengar (ChatGPT/Gemini/nama brand) TAPI jangan ubah timing.
- Pecah jadi chunk pendek: **max 3 kata / ≤34 karakter** biar muat 1 baris.
- **Mode tampil subtitle = tanya / default dari preferensi user.** Dua pola berbeda:
  (a) **per-baris + highlight kata aktif** (klasik, semua kata di baris terlihat, kata
  yang dibaca menyala) — cocok untuk penonton yang mau baca kalimat utuh; (b) **satu
  kata besar muncul sendiri tiap dibaca, sisanya hidden** — lebih dramatis, tiap kata
  pop masuk. User Hasbi di proyek 9:16 terakhir minta eksplisit pola (b) padahal sudah
  dibangun (a) — pastikan mode ini disepakati di fase gaya/brief, bukan setelah render.
  Implementasi (b): satu elemen `.w` per kata, `position:absolute` bertumpuk di tengah
  zona subtitle, hanya kata yang `t∈[start-0.04, end+0.08]` diberi `.on` (opacity 1 +
  scale pop), lainnya opacity 0. Jangan pakai array-literal untuk lookup warna kunci
  (`KEYMAP[WORDS.indexOf([a,b,c])]` TIDAK pernah match — array baru tiap kali) —
  pakai index numerik langsung `KEYMAP[i]`.

### Pemetaan batas adegan dari timing Whisper

Setelah transkripsi, jangan tebak di mana adegan berganti — turunkan dari timestamp:

1. Baca `vo_words.json`, temukan index kata yang MEMULAI tiap segmen naskah
   (mis. adegan "Peran" mulai di kata `Pertama,`; adegan "Konteks" mulai di
   kata `Kedua,`).
2. `t0` tiap adegan = `start` kata pertamanya; `dur` = `t0` adegan berikutnya
   dikurangi `t0` adegan ini; adegan terakhir berjalan sampai akhir VO.
3. Kalau naskah memakai penanda urutan ("Pertama/Kedua/Ketiga/Keempat"), itu
   batas adegan paling andal — sinkron secara alami dengan penekanan suara.
4. Koreksi salah-dengar di teks chunk (mis. "point-point"→"poin-poin") TANPA
   mengubah angka `start`/`end`.

Cara ini membuat pergantian adegan jatuh tepat pada jeda napas pembicara.

### Zona subtitle aman TikTok/Reels

- Zona aman: **1340–1560px dari atas** (= bottom ~360px) pada kanvas 1080×1920.
  UI TikTok/Reels menutup ~360px bawah.
- Sebelum render, audit DOM: pastikan TIDAK ADA elemen scene lain masuk zona itu.
  Kalau nabrak, naikkan/geser elemen scene — jangan turunkan zona subtitle.
- Verifikasi lintas-titik: ekstrak frame dari MP4 final di detik kunci lalu
  analisis via vision, pastikan subtitle 1 baris & sinkron.

### Gotchas render & bridge

1. **Render foreground > 420 dtk timeout** → selalu `background=true` +
   `notify_on_complete`, lalu poll jumlah frame di `frames/`.
2. **Hapus `frames/` sebelum render baru** — resume mencampur frame basi.
3. **Logo asli inline lokal**, bukan CDN — render headless tak boleh tergantung
   jaringan. Unduh PNG/SVG resmi ke `assets/logos/` lalu pakai path relatif.
4. **Logo RGB (bukan transparan)** → CSS `object-fit:cover` + `border-radius`
   biar tidak tampak kotak/aneh.
5. **Bridge claude-code-telegram** kadang error `unrecognized_model` → kalau
   begitu, jalankan render langsung via terminal, jangan lewat bridge.
6. **Frame kosong di awal tiap adegan (JEBAKAN GSAP fade).** Audit DOM tabrakan/
   overflow TIDAK menangkap ini. Bila elemen pembuka tiap adegan di-tween dari
   `autoAlpha:0` mulai di `t0` (atau `t0+delay`), frame pertama adegan (t0..t0+0.3)
   jadi kosong — hanya subtitle. Terparah t=0 (thumbnail preview TikTok/Reels) kosong
   karena subtitle pun belum keluar. **Fix:** (a) fade-in kontainer adegan mulai
   `t0-0.15` (overlap crossfade); (b) delay elemen PEMBUKA tiap adegan = `t0-0.15`
   (bukan `t0`/`t0+0.15`); (c) frame 0 = hook WAJIB sudah opacity penuh tanpa fade.
   Verifikasi: hitung elemen non-subtitle dgn opacity>0 di t0 & t0+0.1 tiap adegan
   (analisis piksel %gelap di zona scene juga bisa, via ffmpeg per frame).
8. **Jangan pakai kamera pan-y besar antar panel (konten terdorong keluar layar).**
   Bila tiap adegan sudah `inset:0` penuh dan tampil bergantian, TIDAK perlu menggeser
   `#world` dengan `y:-360 … -1180` tiap adegan untuk "bergerak". Offet kumulatif besar
   mendorong konten adegan berikutnya ke ATAS hingga keluar viewport → adegan tampak
   kosong / elemen "hilang", dan subtitle ikut kena kalau `#sub` masih di dalam
   `#world`. **Fix:** tiap adegan pakai push-zoom halus saja (`scale` 1.0→1.04, tanpa
   `y`), dan `#sub` taruh sebagai anak `#stage` (di LUAR `#world`) supaya tak ikut
   kamera. Perbaikan layout harus lewat penempatan elemen per-adegan, bukan offset
   kamera. Verifikasi via analisis piksel: tiap titik audit wajib `hero(y250–1250)>0.3%`
   dan `bawah(y1660+)<1.5%`.

9. **`position:absolute` pada anak `.hero` MENGHANCURKAN centering vertikal — biang
   "ga rapih / ada yang tertimpa".** Memberi `.hero{display:flex;justify-content:center}`
   TIDAK memusatkan anak yang `position:absolute` (mereka keluar dari alur flex) —
   konten menggantung di atas (`top:` kecil) dan dua-pertiga bawah kosong, sering
   diikuti elemen absolut yang menimpa satu sama lain. **Fix:** jadikan anak utama tiap
   adegan ALUR NORMAL (flex kolom, `gap`, `text-align:center`) supaya ikut terpusat;
   simpan `position:absolute` HANYA untuk elemen yang memang harus overlap (coretan
   strike, badge V2, tanda `?`). Ukur buktinya: ekstrak frame tiap titik audit dari
   MP4 → cari rentang baris ber-konten (piksel ink `lum<135`, abaikan ~6% tepi atas
   demi vignette) → `center=(y0+y1)/2` wajib dekat `960` (deviasi <~230) di kanvas
   1080×1920. Deviasi besar = konten gantung, BUKAN kesalahan pengukuran.

10. **Nilai layout dari bounding-box nyata, bukan statistik piksel — dan `vision_analyze`
   bisa gagal memuat screenshot.** `vision_analyze` di sesi desktop kadang menolak
   gambar yang justru ada di disk (file valid, PNG terbaca, tetap "tidak bisa dianalisis")
   — jangan berputar-putar menunggunya. Bangun **detektor overlap mekanis** (`node
   audit_overlap.mjs`): kumpulkan `getBoundingClientRect()` semua elemen ber-teks yang
   terlihat di tiap titik waktu, tandai pasangan dengan irisan >6px. Buang false-positive
   dengan aturan: lewati pasangan teks×svg-container (teks memang di dalam papan/
   gelembung), anak-dalam-orangtua (`contains`), dan coretan by-design (strike). Hasil
   akhir yang dituntut: **0 overlap teks×teks di seluruh titik audit** — angka ini, bukan
   "% piksel terisi", yang membuktikan tak ada yang bertimpa. Piksel hanya untuk cek
   frame kosong / center vertikal.

11. **Dua tween GSAP pada properti sama = yang belakangan menang diam-diam.** Bila
   fade-in dan fade-out adegan dipasang lewat satu fungsi `show(i)` yang juga
   memicu `show(i+1)`, dua `.to({autoAlpha})` bertabrakan dan fade-out salah sasaran
   (mematikan adegan BARU, bukan yang keluar). Gejala: adegan tak pernah hilang,
   banyak adegan tumpuk opacity 1 bersamaan. **Fix:** pisahkan jadi dua loop terpisah
   — satu loop fade-in semua adegan, satu loop fade-out adegan sebelum pengganti —
   lalu verifikasi per titik: di setiap `t` hanya BOLEH 1 adegan opacity>0.05.

12. **Adegan bisa punya KONTEN tapi NOL GERAK — dan audit layout bilang "aman".**
   Audit tabrakan/overflow + cek "0 frame kosong" keduanya membandingkan STATE TUNGGAL
   (ada elemen / pixel non-blank), jadi video deck-slide yang mati (tiap `<section>`
   di-fade lalu DIAM 5–9 dtk) lolos keduanya. User melihatnya "gaada animasi, kosong".
   Penyebab umum: objek di-tween sekali lalu ditinggal diam (tween masuk bukan gerak
   berkelanjutan), atau FX latar (blob/dot/breathing) amplitudonya kecil sekali sampai
   tak kelihatan di render. **Ukur gerak, jangan asumsikan.** Ekstrak dua frame di
   tengah adegan dan hitung mean selisih piksel absolut:
   ```bash
   for t in 4.0 4.4; do ffmpeg -y -ss $t -i final.mp4 -frames:v 1 m_$t.png; done
   python3 -c "from PIL import Image;import numpy as np;\
   a=np.asarray(Image.open('m_4.0.png').convert('L'),float);\
   b=np.asarray(Image.open('m_4.4.png').convert('L'),float);\
   print(round(np.abs(a-b).mean(),2))"
   ```
   **mean diff < 1.0 = STASIS, tolak** (harusnya puluhan kalau ada gerak nyata).
   Tiap adegan wajib dicek. Fix: beri gerak berkelanjutan yang terlihat — objek melayang/
   berputar pelan, ikon berdenyut, angka berjalan, kamera push-zoom (scale 1.0→1.04),
   partikel naik — dan kencangkan amplitudo FX sampai lolos ambang ini, bukan sekadar
   "ada di kode". Gerak = fungsi murni `t` (Hukum #2), bukan tween sekali-jalan.

 13. **Satu error JS membunuh SEMUA adegan — gejalanya "semua scene `visibility:hidden`",
  bukan error di layar.** Fungsi `anchor(a,b)` di-build-time menerima STRING selector
  (`'#hub5'`) lalu langsung memanggil `a.getBoundingClientRect()` → `TypeError:
  getBoundingClientRect is not a function` → seluruh script mati → timeline tak pernah
  dibuat, SEMUA `.scene` tetap `hidden` (default CSS), dan `render.mjs` diam-diam
  menghasilkan 1278 frame KOSONG (kertas polos) karena `tl.time(t)` no-op tanpa error.
  **Cek selalu error console SEBELUM render:**
  `page.on('pageerror', e => console.log('PAGEERROR', e.message))` + cek
  `window.__tl` ada (`tl.time(t)` mengembalikan angka, bukan `no tl`). Bila __tl tak
  terbentuk, hentikan render — jangan buang 9 menit utk frame kosong. Perbaikan di
  kasus ini: bungkus selector dgn `$()` sebelum akses DOM method. Pola umum: fungsi
  util yang menerima selector string JANGAN dipaksa panggil DOM method langsung.

  14. **CSS `@keyframes` TIDAK ikut seek timeline GSAP — render frame-per-frame jadi
  non-deterministik.** Gerak berkelanjutan yang enak dipakai untuk "tambah animasi"
  (float, pulse, ring) paling gampang ditulis sebagai CSS `animation:` — TAPI ia jalan
  di jam dinding browser, bukan fungsi `tl.time(t)`. `render.mjs` yang seek `tl.time(t)`
  lalu screenshot TIDAK mengendalikan posisi keyframe CSS → frame hasil render bisa
  tidak sinkron dengan preview, dan melanggar Hukum #2 (deterministik) untuk render
  batch. **Fix:** untuk gerak yang HARUS akurat di render, pakai tween GSAP pada
  timeline (bisa di-seek). CSS `@keyframes` aman HANYA untuk gerak ambient yang tak
  perlu presisi (glow, partikel latar) DAN bila render meng capture pada waktu nyata
  (bukan seek). Bila ragu, gerak konten = GSAP; gerak latar = CSS boleh.

### Cleanup post-delivery (aman)

```bash
rm -rf frames shots frames_dbg out
rm -f slow.wav "index 2.html" _chunks_new.txt preview_*.png
```
**JANGAN dihapus** (dipakai video berikutnya, hemat install ulang):
`index.html` (template), `render.mjs`/`snap.mjs`/`transcribe.py` (pipeline),
`gaya.md`/`vo_words.json`, `assets/`, `node_modules/`, `.venv/`.

## Referensi proyek teruji
Video "Apa itu Function Calling" (9:16, 44.6 dtk) = contoh pipeline flat-motion 2D.
`index.fc-reference.html` ada di skill html-motion-pipeline.
Video "9router + Hermes + Claude Code" (9:16, 50.52 dtk) = contoh terbaru;
template project: `~/Documents/remotion-videos/VIDEO 4/`.

## Distribusi lintas mesin

Skill ini dan 3 dependensinya (`bang-motion`, `motion-format`,
`html-motion-pipeline`) tersedia sebagai salinan di:
`https://github.com/hasbiridwan57-creator/hermes-video-motion-skills`

Untuk menyinkronkan ke mesin lain (mis. VPS), clone repo itu ke folder skills
Hermes di mesin tujuan, lalu restart Hermes. Catatan: salinan GitHub adalah
snapshot — perubahan skill di MacBook tidak otomatis masuk ke repo; harus
di-commit dan di-push manual setelah mengedit.
