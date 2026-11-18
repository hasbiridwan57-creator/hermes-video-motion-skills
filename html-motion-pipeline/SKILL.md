---
name: html-motion-pipeline
description: >-
  Pipeline HTML→MP4 untuk video explainer 9:16 bersuara (gaya flat-motion 2D ala
  akun edu-tech di Reels/TikTok) — sudah teruji memproduksi video "Apa itu
  Function Calling?" (44.6s, 1080×1920, VO + 31 SFX tersinkron). Pakai skill ini
  saat user minta video explainer motion-graphic 9:16 dengan voiceover sendiri,
  subtitle per kata, diagram node↔tool yang beranimasi, dan output MP4 final.
  Sumber suara = file VO user (bukan TTS), diperlambat via ffmpeg atempo bila perlu.
license: internal
metadata:
  author: Hermes (Hasbi workflow)
  version: "1.1.0"
---

# HTML Motion Pipeline (9:16 explainer, VO + SFX → MP4)

Alur teruji. Setiap langkah punya perintah siap-pakai di `assets/pipeline/`.
Referensi implementasi lengkap: `assets/pipeline/index.fc-reference.html` (proyek
Function Calling — salin lalu ganti kontennya, jangan tulis dari nol).

## Kenapa pipeline ini
- **Deterministik**: timeline GSAP `paused`, di-seek per frame → MP4 = pratinjau.
- **VO user sendiri** (file ElevenLabs/mic), bukan TTS; tempo dikendalikan.
- **Audit layout otomatis** mendeteksi teks keluar kanvas & menabrak elemen —
  wajib lulus sebelum render penuh (menghemat render 1338 frame).
- **Garis penghubung rapi**: anchor di tepi node, di lapisan belakang (lihat
  Pitfall #1).

## Prinsip utama (ini intinya)
**Visual melayani naskah & VO, bukan sebaliknya.**
1. Semua yang tampil di layar **wajib ada di naskah & diucapkan VO**. Elemen yang menarik
   tapi tak dinarasikan → buang, sebagus apapun.
2. Sebaliknya, tiap ide/kalimat penting di naskah **wajib punya gambar sendiri** yang muncul
   saat frasa itu diucapkan. Kalimat yang cuma jadi teks diam = adegan "sepi" → tambah visual.
3. **Banyak adegan tidak masalah** — yang penting tiap adegan mengikuti VO & naskah.
4. **Lebih banyak gambar & animasi = lebih baik** (lebih hidup). Jangan pelit menambah visual;
   kekayaan visual itu nilai tambah, bukan kelemahan.
5. Urutan & timing visual = **urutan & timing penyebutan di VO** (dari timestamp transkripsi),
   bukan logika sendiri.
6. Kualitas detail visual ikut dijaga: ikon jelas terbaca sebagai apa maksudnya, elemen
   seimbang & tak melayang.

## Alur (ikut urutannya)

| # | Langkah | Output |
|---|---|---|
| 1 | Ambil VO user + pecah per segmen (jeda napas) | `meta.json` |
| 2 | Atur tempo VO via `ffmpeg atempo` + sisip jeda; pilih varian | `vo.wav` |
| 3 | Transkrip per-kata (`faster-whisper`, `pip install faster-whisper`) | `assets/words.json` |
| 4 | Bangun `index.html` (8 adegan mengikuti timing VO) + `sfx_score.py` | HTML + SFX WAV |
| 5 | Mix VO + SFX → `public/full_mix.mp3` | audio final |
| 6 | **Audit layout** (`audit2.mjs` + `audit_s2.mjs`) — wajib 0 overflow | laporan |
| 7 | Render frame (`render_frames.mjs`) → 1338 PNG | `frames/` |
| 8 | Encode (`encode.sh`) → MP4 | `public/*.mp4` |
| 9 | **Cek visual MP4 final** — ekstrak frame dari MP4, analisis via vision | konfirmasi bersih |

## Setup sekali
```
cd <proyek>
npm init -y && npm install playwright-core gsap
pip install faster-whisper   # untuk transkrip per kata
# butuh: Google Chrome (/Applications/Google Chrome.app), ffmpeg
```

## Pipeline scripts
`assets/pipeline/`:
- `render_frames.mjs` — seek timeline per frame, screenshot 1080×1920 @30fps.
- `snap.mjs` — potret detik tertentu (`node snap.mjs 1.0 6.5 17.5`) untuk cek visual.
- `audit2.mjs` — cek SEMUA scene: teks keluar kanvas / masuk zona UI bawah (>1560px) / tabrakan.
- `audit_s2.mjs` — audit 1 scene (`sc2`) di banyak detik (deteksi reveal terlalu dini, mepet tepi).
- `audit_overlap.mjs` — **deteksi teks yang BENERAN bertimpa-timpa** (teks×teks, teks×img,
  teks×tombol). Cerdas membedakan tabrakan nyata vs. yang *by-design*: label di dalam svg
  container, coretan/strike/garis tembus, subtitle flex berdampingan → tidak dilaporkan.
  Jalankan `node assets/pipeline/audit_overlap.mjs` → target `TOTAL tumpang tindih: 0`.
- `audit_center.mjs` — **deteksi konten yang "menggantung di atas"** (2/3 bawah kosong).
  Ukur bounding konten tiap scene, hitung deviasi dari titik tengah ideal (y≈960 utk 1920px).
  Deviasi > 250px = ⚠ GANTUNG. Jalankan `node assets/pipeline/audit_center.mjs`.
- `typing-prompt.js` — **resep animasi "typing prompt"** (inti tema coding/AI): prompt diketik
  huruf-demi-huruf + kursor berkedip, lalu app merespons (ubah warna → error → perbaiki → iterasi).
  Contoh penuh: repo video `09-vibe-coding/index.html` adegan SK4.
- `encode.sh` — ffmpeg → H.264 yuv420p CRF18 + AAC 192k + `+faststart`.
- `sfx_score.py` — skor SFX prosedural tersinkron ke timing kata.
- `index.fc-reference.html` — implementasi lengkap (copy & ganti konten).

## Konvensi HTML (di `index.fc-reference.html`)
- `#stage` 1080×1920, dot-grid bg; `#world` (rig kamera, scale halus per adegan);
  adegan = `.scene` (visibility hidden, di-show/hide via timeline).
- **Subtitle per kata**: `assets/words.json` → kelompokkan jadi chunk ≤4 kata,
  satu chunk = satu `.line` (position:absolute, ditumpuk supaya tak memperluas box),
  kata aktif `.on`, kata kunci `.key` (amber). Posisi **390px dari bawah**
  (aman dari UI Reels/TikTok yang menutup ~360px bawah).
- **Garis penghubung**: fungsi `link(svg,idA,idB)` menghitung anchor di TEPI node
  (`edge`/`edgeT`) — garis TIDAK keluar dari pusat logo. SVG `.wires` ditaruh
  **sebagai anak pertama `.scene`** (z-index:0) supaya di belakang kartu (z-index:2).
  Kurva halus (bow ≤26px), warna abu `#7A8188` 8px; garis aktif `.hot` amber 15px.
- **Logo agent**: `OPENCLAW_SVG` inline (lobster merah), dipasang ke setiap
  `.node.dark` berisi `🤖` otomatis. Ganti bila ingin identitas lain.
- GSAP deterministik: timeline `paused`, expose `window.__tl` & `window.__updateSub`.
  Mode `?t=<detik>` untuk snapshot statis (headless), `?debug` untuk scrub manual.

## Pemicu (trigger)
User menyebut frasa **"pipeline motion explainer"**, atau meminta "video motion
explainer 9:16", atau bilang "kayak video Function Calling kemarin" → load skill ini.
Bukan `motion-format` / `bang-motion` (skill lain). VO user **selalu dikirim sebagai
file** tiap sesi — skill ini menyimpan CARA KERJA, bukan aset audio/konten.

## Pitfalls (jangan ulangi)
1. **Garis menembus logo/teks** → pastikan: (a) SVG wires jadi anak pertama scene,
   (b) `z-index:0` wires vs `z-index:2` kartu, (c) anchor pakai `link()` di tepi.
2. **Subtitle menutup kartu / masuk zona UI** → satu baris 1 tumpuk (absolute),
   max 4 kata/chunk, bottom ≥390px.
3. **`window.tl` undefined saat render** → nama yang di-expose harus `window.__tl`
   (pakai `__`), else 74% frame jadi identik/statis. Cek: `md5 frames/* | uniq -c`.
4. **Render background di-restart** → pastikan tidak ada `render_frames` lama jalan
   (`pgrep -fl render_frames`) sebelum render baru; hapus `frames/` sebelum mulai.
5. **Audit DOM bukan pengganti cek visual MP4.** Audit mendeteksi overflow & tabrakan
   bounding-box, tapi TIDAK mendeteksi garis menembus logo / teks menutup kartu —
   itu cuma terlihat di piksel final. Setelah encode, ekstrak frame kunci dari MP4
   (`ffmpeg -ss <t> -i out.mp4 -frames:v 1 f.png`) lalu analisis via vision_analyze.
6. **Konten "menggantung di atas" (2/3 bawah kosong).** Ini paling sering lolos karena
   audit biasa hanya cek overflow, bukan keseimbangan. Penyebab: semua anak `.hero`
   pakai `position:absolute` → flexbox `justify-content:center` TIDAK berefek pada
   mereka. Solusi: jadikan anak-anak `.hero` alur normal (block/flex flow), hanya
   elemen overlap (badge/coretan/penanda) yang tetap absolute. WAJIB jalankan
   `audit_center.mjs` — deviasi center > 250px = gagal.
7. **Visual tak mengikuti naskah (paling merusak).** Jangan anggap adegan "sudah" hanya
   karena animasinya jalan. Contoh nyata: grafik korelasi & grafik usia tampil di layar
   padahal VO tak pernah menyebutnya. Audit wajib-naskah sebelum render: (a) ekstrak
   transkripsi VO + timestamp per kata (`words.json`), (b) petakan "frasa ini muncul jam
   berapa di layar?", (c) elemen yang tampil tapi tak ada di naskah → hapus; frasa naskah
   yang cuma jadi teks diam → tambahkan visual. Urutan visual = urutan penyebutan di VO.
8. **Render OOM (Mac 8GB).** Chromium menumpuk memori saat mencetak ratusan screenshot →
   crash di tengah ("Target page closed"). Solusi: restart browser tiap ±400 frame +
   resume otomatis (lewati frame yang sudah ada & >20KB). Jangan render 2500+ frame dalam
   satu sesi browser.
9. **Frame lama tercampur setelah revisi.** Jika hanya sebagian adegan direvisi dan hanya
   frame rentang itu dihapus, `frames/` jadi campur (mis. 2770 file padahal butuh 2574).
   Paling aman: hapus seluruh `frames/` sebelum render penuh. Kalau resume, verifikasi
   jumlah file = TOTAL frame sebelum encode.
10. **Emoji lolos dari audit DOM.** User minta tanpa emoji — kalau tak dicek otomatis, emoji
    bisa lolos karena audit bounding-box tak melihat jenis karakter. Sebelum render, jalankan
    regex Python cari karakter emoji; kalau ketemu → ganti SVG inline. Ikon selalu SVG.
    `re.findall(r'[\U0001F300-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F]', html)` → wajib 0.
11. **Ikon & detail visual wajib terbaca pada UKURAN TAMPILNYA — audit DOM & audit layout
    tak menangkap "ikonnya nggak jelas".** Sebuah SVG bisa punya bentuk yang benar di kode
    tapi pada ukuran render (mis. ikon 180px dalam diagram) tampak seperti benda lain: ikon
    otak dengan outline terbuka terbaca sebagai awan/bunga, bukan otak. **Fix:** sebelum
    render penuh, ekstrak frame dari MP4 lalu perbesar (crop) ikon/diagram kunci dan nilai
    via vision_analyze — "apakah ini jelas terbaca sebagai X?". Kalau ambigu, sederhanakan
    bentuk (siluet utuh > outline terbuka) dan perbesar ukurannya. Audit bounding-box hanya
    cek posisi, bukan keterbacaan bentuk.
12. **Elemen perbandingan seimbang (bar/kolom A-vs-B) wajib satu grup visual.** Bar yang
    "melayang" di luar kartu induknya (posisi absolut terpisah) melanggar keseimbangan &
    rentan menimpa elemen lain saat konten berubah tinggi. Kasus nyata: bar otot atrofi/kuat
    melayang di luar kartu gym, lalu menabrak kartu. **Fix:** masukkan tiap bar ke DALAM
    kartu/sel kolomnya sendiri; beda panjang bar itu disengaja (panjang = besaran), tapi
    lebar kartu & baseline harus sama. Cek via audit_overlap setelah tiap revisi layout.
13. **Teks bertimpa padahal terlihat "cuma sedikit".** Jangan andalkan mata; pakai
   `audit_overlap.mjs` yang ukur bounding-box nyata. Tanda `?` raksasa, angka besar
   dekoratif, atau judul panjang sering menimpa teks lain tanpa disadari.
14. **Tema coding/AI terasa mati tanpa animasi ketik.** Teks statis tidak menyampaikan
   cara kerja vibe coding. Pakai resep `typing-prompt.js`: prompt diketik per-huruf +
   kursor kedip + app merespons (ubah warna → error → perbaiki → iterasi).
15. **Logo/ikon dari web**: unduh SVG resmi (CDN jsDelivr / repo GitHub brand), lalu
   **inline sebagai teks** di HTML — jangan `<img src>` ke file eksternal, agar render
   headless tak bergantung jaringan. Strip animasi SMIL agar output deterministik.

## Aturan suara (user Hasbi)
- VO produksi **harus suara user sendiri** (file ElevenLabs yang dikirim), bukan TTS.
- SFX prosedural via skill `procedural-sfx` (tanpa kredit ElevenLabs).
- Hapus frame mentah & file bantu (`frames/`, `shots/`, `*.wav` per-segmen) setelah
  MP4 terkirim — storage MacBook terbatas.
