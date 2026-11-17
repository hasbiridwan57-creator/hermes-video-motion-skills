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
  version: "1.1.0"
  author: Hasbi workflow (digabung dari bang-motion + motion-format + html-motion-pipeline)
  updated: "2026-11-17"
---

# Motion Explainer Master — alur baku video bersuara via chat

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
   elemen, subtitle aman dari zona UI bawah (Reels/TikTok ≈360px).
8. **Render**: cek ±8 dtk → user dengar/lihat → render penuh → MP4.

## Hukum wajib (ringkas dari bang-motion + motion-format)
1. **Video, bukan slide.** Kamera/dunia bergerak; adegan berganti karena dunia bergerak,
   bukan `<section>` di-fade. Satu subjek/benang merah visual bertahan.
2. **Deterministik.** Semua visual = fungsi murni `t`/`tl.time()`. Nol `Math.random()`
   tanpa benar-benar, `Date`, `performance.now`.
3. **Gaya dari tema, bukan starter/referensi.** Referensi = ritme, bukan kulit. Dua video
   berbeda beda di ≥3 dari: palet, font, latar, tanda tangan gerak. **Kecuali seri
   (Part 1,2,…): wajib konsisten.**
4. **Teks hidup, latar tunduk.** Sentence case; tanda baca hanya bila mengubah arti/irama;
   kontras kuat; latar tidak flat satu warna.
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

## Penyerahan
- `index.html`/`scene.html` terbuka via `file://` (klik dua kali), autoplay + loop,
  tanpa player di layar, `?debug=1` untuk scrub.
- MP4: lapor path, durasi, 1–2 hal yang mungkin mau direvisi.
- Hapus frame/PNG mentah & shots setelah kirim (storage terbatas).

## Pembelajaran proyek VIDEO 4 (9router + Hermes + Claude Code)

Video terakhir (50.52 dtk, 9:16, flat-motion 2D edu-tech) menyumbang pola yang
teruji dan pitfall baru. Gunakan bila user minta "video kayak yang kemarin".

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
