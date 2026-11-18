/* ============================================================
   RESEP: "TYPING PROMPT" — animasi inti untuk tema coding/AI.
   Efek: prompt diketik huruf-demi-huruf + kursor berkedip, lalu
   "app" merespons (elemen berubah/muncul). Ini yang membuat tema
   vibe-coding/prompting terasa nyata, bukan sekadar teks statis.
   Tempel ke timeline GSAP utama. Semua selector contoh di bawah.
   ============================================================ */

export function buildTypingPrompt(tl, opts) {
  const {
    at = 0,                 // detik mulai
    promptText = 'ubah warna header jadi oranye',
    charDelay = 0.055,      // jeda antar huruf (kecil = cepat)
    txtSel = '#ptxt',       // elemen penampung teks prompt
    caretSel = '#caret',    // elemen kursor berkedip
    onTyped,                // callback: dipanggil setelah ketikan selesai (detik)
  } = opts;

  // kosongkan dulu, lalu isi progresif per-huruf
  tl.set(txtSel, { textContent: '' }, at);
  promptText.split('').forEach((ch, i) => {
    tl.call(() => { document.querySelector(txtSel).textContent = promptText.slice(0, i + 1); },
      null, at + 1.6 + i * charDelay);
  });
  // kursor kedip selama mengetik
  tl.fromTo(caretSel, { opacity: 1 }, { opacity: 0, duration: .3, repeat: 9, yoyo: true, ease: 'none' }, at + .2);

  if (onTyped) onTyped(at + 1.6 + promptText.length * charDelay);
}

/* Pakai (lihat 09-vibe-coding/index.html SK4 untuk contoh penuh):
   buildTypingPrompt(tl, { at: 27.6, promptText: 'ubah warna header jadi oranye',
     txtSel: '#s4ptxt', caretSel: '#s4caret' });
   Lalu app "merespons": elemen berubah warna/atribut, muncul toast perbaikan,
   iterasi lanjutan. Pola siklusnya:
     app tergambar -> prompt diketik -> app berubah -> error -> perbaiki -> iterasi
*/
