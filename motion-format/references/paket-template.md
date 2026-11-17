# Paket Template Motion — panduan untuk Claude

Paket tambahan skill **Motion Format**: 12 template motion siap pakai di `assets/template/`.
Tiap template satu berkas HTML (GSAP, satu timeline, deterministik) yang sudah punya gaya, gerak,
dan efek suara. Pekerjaanmu **mengisi `CONFIG`**, bukan mendesain ulang.

## Kapan dipakai

User menyebut "template", "Paket Template", atau meminta salah satu jenis di tabel bawah
(logo reveal, intro, lower third, tombol subscribe, hook Reels, promo, end screen, transisi, dst.).
Untuk permintaan ini **lewati alur 3 konsep** (Hukum #3 di SKILL.md): template sudah punya gaya.
Kalau user meminta sesuatu yang tidak ada template-nya, kerjakan dengan alur biasa dari starter.

## Daftar template

| Berkas | Untuk apa | Rasio bawaan | Lama | Isian utama di CONFIG |
|---|---|---|---|---|
| `01-logo-reveal.html` | logo/nama brand muncul | 16:9 | 5 dtk | `nama`, `titik`, `tagline`, `logo`, `logoSaja` |
| `02-intro-kanal.html` | pembuka video: kata-kata melesat lalu nama kanal | 16:9 | ±6 dtk | `kata` (1–4), `nama`, `tagline`, `logo` |
| `03-judul-bab.html` | kartu pembuka tiap bagian video | 16:9 | 4 dtk | `nomor`, `label`, `judul`, `sub` |
| `04-lower-third.html` | papan nama di bawah layar | 16:9 | 1,4 + `tahan` + 0,9 | `nama`, `jabatan`, `posisi`, `tahan` |
| `05-subscribe.html` | tombol subscribe ditekan + lonceng | 16:9 | ±5,6 dtk | `nama`, `keterangan`, `tombol`, `tombolSudah`, `logo`, `posisi`, `tahan` |
| `06-hook-reels.html` | pembuka 3 detik pertama Reels | 9:16 | 4 dtk | `angka`, `atas`, `sela`, `bawah` |
| `07-daftar-poin.html` | judul + 2–5 poin bernomor | 16:9 | mengikuti jumlah poin | `judul`, `poin[]`, `jeda` |
| `08-quote.html` | kutipan kata demi kata + stabilo | 9:16 | mengikuti panjang | `kutipan`, `oleh`, `peran`, `tahan` |
| `09-promo.html` | flash sale / diskon | 16:9 | 5 dtk | `judul`, `stempel`, `stempelKecil`, `info` |
| `10-cta-follow.html` | penutup Reels: ajakan follow | 9:16 | 5,5 dtk | `ajakan`, `akun`, `tombol`, `tombolSudah`, `catatan`, `logo` |
| `11-end-screen.html` | layar akhir YouTube (2 bingkai video + subscribe) | 16:9 | `durasi` (5–20) | `judul`, `labelKiri`, `labelKanan`, `nama`, `tombol`, `logo`, `durasi` |
| `12-transisi.html` | tiga pita warna menyapu, adegan berganti | 16:9 | ±2,7 dtk | `klipA`, `klipB`, `arah`, `tahanAwal`, `tahanAkhir` |

Semua template bisa **16:9 dan 9:16**: ubah `CONFIG.rasio`. Tata letak menyesuaikan sendiri.
`galeri.html` di folder yang sama menampilkan semuanya sekaligus.

## Cara kerja (ikuti urutan ini)

1. **Tanyakan yang kurang dalam SATU pertanyaan** (dengan nilai bawaan): teksnya apa, rasio mana,
   ada logo atau tidak, warna brand. Kalau user sudah memberi cukup, langsung kerjakan.
2. **Buat folder proyek baru** (bukan di dalam folder skill), lalu salin:
   - template → `index.html`
   - folder `assets/template/sfx/` → `sfx/` di folder proyek (efek suara dipanggil lewat `sfx/…`)
   - logo/foto/video user → `assets/img/` atau `assets/`
3. **Ubah hanya blok `CONFIG`** di bagian atas `index.html` (bertanda "UBAH DI SINI").
   Jangan mengubah bagian kit (`KIT` di CSS dan JS). Gerak hanya diubah kalau user memintanya,
   dan itu ada di fungsi `build(tl, c, k)` di bagian paling bawah.
4. **Periksa**: buka `index.html`. `?debug=1` memunculkan panel geser waktu, `?t=2.5` berhenti di
   detik 2,5, `?rasio=9:16` mencoba rasio lain tanpa mengubah berkas. Potret detik kunci dan cek:
   teks tidak terpotong, logo terlihat, warna terbaca.
5. **Render**: `python3 <folder-skill>/scripts/render_mp4.py <folder-proyek>` (cek 3 detik dulu
   dengan `--sampai 3`). Ukuran video mengikuti `CONFIG.rasio`.
   Butuh dua rasio → render sekali, ubah `CONFIG.rasio`, render lagi dengan `--out nama-9x16.mp4`.

## Isi CONFIG yang sama di semua template

- `rasio`: `'16:9'` atau `'9:16'`.
- Teks: tulis biasa. `*kata*` = disorot (di template yang mendukung), `\n` = ganti baris.
  Teks panjang dikecilkan otomatis supaya muat, tapi tetap sarankan kalimat pendek.
- `logo`: path gambar (PNG tanpa latar paling baik). Kosong = bentuk bawaan (bola / huruf pertama).
  Di template berfoto profil bulat (subscribe, ajakan follow, end screen) ada `latarLogo`: warna di
  belakang logo. Logo terang di atas warna terang tidak terlihat, jadi isi warna gelap bila perlu.
- `warna`: `latar`, `teks`, `aksen`, `aksen2`, `aksen3`, `tinta`. `tinta` = warna teks di atas bidang
  terang. Saat memakai warna brand user: jaga kontras `teks` terhadap `latar`, dan `tinta` terhadap `aksen`.
  Opsional: `latarTerang`, `latarGelap` (kalau tidak diisi dihitung dari `latar`).
- `font`: `judul` dan `isi` (nama Google Fonts). Mengganti font = ubah juga tautan
  `fonts.googleapis.com` di `<head>`.
- `suara`: `false` = tanpa efek suara.
- `keluar`: `true` = elemen menghilang di akhir (enak disambung ke video lain), `false` = berhenti
  di keadaan jadi.
- `latar` (di template tumpangan seperti lower third, subscribe, judul bab, ajakan follow):
  - `'bawaan'` = latar contoh milik template
  - `'assets/klip.mp4'` atau `'assets/img/foto.jpg'` = template tampil **di atas video/foto user**
    (video ikut jam timeline, jadi hasil render tetap rapi)
  - `'hijau'` = latar hijau polos, untuk dibuang (chroma key) di aplikasi edit mana pun
  - `'#141E42'` = warna polos

## Suara

Efek suara bawaan ada 8 (`sfx/`): `pop`, `klik`, `ding`, `whoosh`, `swipe`, `riser`, `impact`,
`kilau`. Semuanya dibuat Motion Format dengan rumus (bukan rekaman dan bukan dari layanan lain),
jadi bebas dipakai user di video apa pun. Dipasang di `build()` lewat `k.sfx('pop', detik, volume)`
dan otomatis ikut ter-render.

Menambah voiceover atau musik (kalau user meminta): di akhir `build()` isi
`window.AUDIO_PLAN.vo.push({ at: 0.3, src: 'assets/audio/vo1.mp3', vol: 1 })` atau
`window.AUDIO_PLAN.music = { src: 'assets/audio/music.mp3', vol: .15 }`. Cara membuat suaranya ada
di `references/suara-elevenlabs.md`.

## Menggabungkan beberapa template jadi satu video

- **Paling mudah:** render tiap template jadi MP4, lalu sambung dengan ffmpeg
  (`-f concat`) sesuai urutan: mis. hook → isi video user → ajakan follow.
- **Menyambung dua klip user:** `12-transisi.html` dengan `klipA` dan `klipB`.
- **Menumpang di video user:** isi `latar` dengan videonya (lower third, subscribe, judul bab).
  Atur `tahan` supaya template selesai sebelum video habis; panjang hasil = panjang template.

## Yang jangan dilakukan

- Jangan memindahkan gerak ke CSS animation atau `setTimeout`: semua gerak harus di timeline GSAP
  (Hukum #2), supaya render frame demi frame tetap sama.
- Jangan menaruh `repeat` bersama `stagger` angka di satu tween (seluruh rangkaian ikut berulang
  dan durasi membengkak). Pakai `stagger: { each: .1, repeat: 1, yoyo: true }`.
- Jangan menambah logo atau nama Motion Format ke video user.
