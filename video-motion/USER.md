# Profil Preferensi User (Hasbi) — untuk skill Video Motion

> **File ini WAJIB dibaca di awal setiap sesi video** (lihat instruksi di SKILL.md
> bagian "MULAI DI SINI"). Isinya keinginan, selera, dan standar Hasbi yang TIDAK
> berubah antar-proyek. Jangan tanyakan hal yang sudah tertulis di sini.

## 1. Siapa Hasbi & cara bicara

- Bahasa Indonesia **santai** ("gue/lu" boleh di chat, tapi naskah video pakai bahasa
  narator yang enak didengar umum).
- **Jangan bertanya bertubi-tubi.** Keputusan kecil putuskan sendiri + sebutkan;
  tanyakan HANYA yang benar-benar mengubah arah (rasio, durasi, latar, suara).
- Kasih **pilihan + 1 rekomendasi** saat perlu keputusan, bukan pertanyaan terbuka.
- Hasbi suka **banyak visual & adegan** — "jangan pelit scene, animasi, dan gambar".
  Kekayaan visual itu nilai tambah, bukan beban.

## 2. Latar & palet

- **Default latar: GELAP futuristik** (hampir hitam + glow neon hijau `#23FFA0`) untuk
  topik teknologi/AI/kode. BUKAN gelap PPT — pakai gradien radial + partikel ambient.
- Latar TERANG krem (`#F6F4EF`) dipakai kalau Hasbi minta eksplisit (nada dokumenter).
- Aksen merah `#FF5470` untuk kontras negatif (coretan, "gak ada", larangan).
- Ikon = **SVG inline** selalu. **0 emoji** di seluruh video (audit regex wajib 0).

## 3. Positioning (kunci kerapian — lihat juga SKILL.md Fase B)

- Band vertikal: kicker/judul atas (y≈300) · visual utama tengah (560–1250) ·
  caption bawah scene (≈1330) · subtitle TETAP (≈1460).
- Node/kolom simetris `left: 250 / 540 / 830` (pusat 540).
- Kartu A-vs-B: `width`, `top`, padding SAMA; yang beda cuma isi.
- Subtitle di luar `#world`. Semua ukuran dari `audit_overlap` + `audit_center`.

## 4. Animasi & motion

- Deterministik total (fungsi `t`, seeded RNG). **Matikan rAF sebelum `goto`.**
- Hook SUDAH penuh di frame 0 (`tl.set`, bukan fade-in) — frame 0 = thumbnail.
- Sinkron tiap beat ke timestamp kata di `vo_words.json`.
- Gerak berkelanjutan halus (drift kamera, denyut ring, counter, partikel).

## 5. Subtitle

- **Per-kata** (satu kata besar muncul pop, sisanya hidden) — default Hasbi untuk 9:16.
- Kata kunci diberi warna aksen (`.key`). Zona aman y≈1460 (aman dari UI TikTok/Reels).
- Sumber timing HANYA `vo_words.json` (faster-whisper `small`, `id`), jangan proporsional.

## 6. Suara (VO)

- **VO produksi = file Hasbi sendiri** (ElevenLabs yang dikirim), BUKAN TTS.
  Jangan pernah menghabiskan kredit ElevenLabs tanpa izin.
- SFX prosedural via skill `procedural-sfx` (bebas lisensi).
- Normalisasi `loudnorm` WAJIB sebelum Whisper.

## 7. CTA penutup (hampir selalu)

- Promosikan **grup Telegram "Diskusi Tentang AI"** di adegan terakhir.
- Elemen: logo Telegram (SVG asli) · nama grup ("Diskusi **Tentang AI**") ·
  deskripsi singkat · tombol **"LINK DI BIO"** berdenyut.
- Kalau ada logo grup asli dari user, pakai itu (logo di lingkaran, bukan kotak).

## 8. Yang membuat Hasbi kecewa (HINDARI)

- Adegan kosong / cuma subtitle / "kayak PPT" (section di-fade).
- Visual yang tidak dinarasikan VO (mengarang angka/grafik sendiri).
- Layout bertumpuk, teks mepet tepi, kartu tak seimbang, ikon emoji.
- Ikon yang tidak terbaca bentuknya (contoh: otak jadi mirip bunga/awan).
- Banyak revisi karena lompat urutan kerja — ikuti SOP Fase A→D.

## 9. Kebiasaan kerja antar-sesi

- Hasbi sering menjalankan **beberapa sesi paralel** untuk beberapa video.
  Agar konsisten: **selalu ikuti SOP `video-motion` Fase A→D** + profil ini.
- Tiap video = folder baru di `~/Documents/remotion-videos/NN-nama/`.
- Setelah MP4 dikirim & dipost: tawarkan hapus folder kerja (frames/ besar),
  TAPI konfirmasi dulu — jangan hapus MP4 final tanpa izin.
