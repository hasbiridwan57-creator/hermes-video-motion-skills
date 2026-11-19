# GAYA EMAS — Video Motion Hasbi

> **WAJIB dibaca oleh agent** di awal setiap proyek video motion, bersama `USER.md`
> (preferensi) dan `SKILL.md` (SOP). Ini referensi VISUAL — bukan cuma aturan tertulis.
>
> **Cara pakai:** jalankan `vision_analyze` pada frame di folder ini (`style-reference/`)
> sebelum mulai menulis HTML, supaya agent MELIHAT langsung target visualnya — bukan
> cuma membayangkan dari deskripsi. Ini menutup gap antara "tahu aturan" vs "lihat hasil".

## Sumber
Dari video **#11 "Perusahaan Tanpa Karyawan"** — yang Hasbi nilai **paling bagus,
minim revisi**. Frame di folder ini diambil langsung dari video finalnya.

## Frame referensi (folder ini)
- `frame-scene1-hook-hexagon.jpg` — **Adengan pembuka/hook** (detik ~6-7): judul atas
  "BAYANGIN ADA PERUSAHAAN / GAK PUNYA KARYAWAN" (navy + hijau besar), simbol kode
  `</>` hijau di tengah, caption "Tapi seluruh operasinya dijalankan kode", subtitle
  per-kata di bawah. Contoh positioning band + latar terang + ambient kode melayang.
  (Catatan: pada frame ini heksagon belum tampil — heksagon muncul sedikit setelahnya;
  frame ini dipakai sebagai acuan latar, tipografi hook, dan subtitle.)
- `frame-cta-logo-bulat.jpg` — **Adengan CTA penutup**: latar terang, logo grup
  Telegram ASLI tampil BULAT, nama grup + tombol "LINK DI BIO".

## Anotasi gaya per frame (yang membuat Hasbi bilang "ini bagus")

### Hook (scene 1 — frame acuan)
- Latar krem `#F6F4EF` dengan dot-grid samar + karakter kode melayang (ambient, bukan flat).
- Judul atas: navy gelap `#0f172a`, weight 900, letter-spacing.
- Hook besar tengah: hijau `#0a9d5e` (bukan neon — ini versi terang).
- Simbol/node tengah (contoh: `</>`): hijau, jadi fokus visual utama.
- Caption penjelas di bawah hook: abu-navy, weight lebih ringan.
- Subtitle bawah: per-kata, gelap `#0f172a`, key word hijau.
- Semua elemen punya **ruang napas** — tidak ada yang bertumpuk (lihat audit_overlap).

### CTA penutup
- Latar krem kebiruan lembut (`#F9F7F2` → `#EAF1F6`).
- Logo grup **BULAT** (clip-path circle), ukuran ±260px, drop-shadow lembut.
- Nama grup biru (`#1c6fa8`), deskripsi biru gelap, tombol biru Telegram `#2AABEE`
  dengan teks putih, handle di bawah.

## Checkpoint gaya sebelum render (WAJIB)
Setelah menulis HTML, snapshot frame kunci lalu bandingkan dengan frame emas di sini:
1. Latar terang + ambient motion (bukan flat PPT)?
2. Teks gelap di atas terang, kontras cukup?
3. Node/kolom simetris, tidak tumpang tindih?
4. Subtitle per-kata di zona aman, tidak niban UI?
5. CTA: logo bulat + nama + tombol "LINK DI BIO"?
Kalau ada yang beda dari frame emas → perbaiki SEBELUM render penuh (hemat waktu).
