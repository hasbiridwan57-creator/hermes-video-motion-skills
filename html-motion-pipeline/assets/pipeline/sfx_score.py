"""SFX prosedural untuk video Function Calling — mengikuti waktu suara (words.json).
Render: python3 sfx_score.py  → public/sfx.wav
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
# sfx engine tinggal di skill procedural-sfx/scripts
SKILL_SFX = os.path.expanduser("~/.hermes/profiles/claude-code/skills/procedural-sfx/scripts")
sys.path.insert(0, SKILL_SFX)
from sfx.synth import blip, chime, click, impact, pop, riser, whoosh, scratch

words = json.load(open(os.path.join(HERE, "assets/words.json")))
OUT = os.path.join(HERE, "public/sfx.wav")
DURATION = 44.6
TARGET_LUFS = -16.0   # VO di depan, SFX lebih kalem

def at(word, idx=0):
    """waktu kata ke-idx setelah kata `word` pertama yang cocok."""
    hits = [w for w in words if w["w"].lower().startswith(word.lower())]
    return hits[idx]["s"] if len(hits) > idx else 0.0

def score(mix, tl):
    put = mix.put
    # HOOK (0.0): agent muncul + ikon cuaca
    put(0.02, whoosh(0.7, 220, 1500, peak=0.35), 0.10)
    put(at("pinter"), blip(392, dur=0.35, tau=0.1), 0.10)
    put(at("cuaca"), pop(700, 320), 0.18, -0.3)
    # MASALAH (4.4): tool abu, tanda tanya
    put(at("nggak"), whoosh(0.5, 900, 250, peak=0.4), 0.12)
    put(at("ngomong"), blip(196, dur=0.4, tau=0.12), 0.12)
    # SOLUSI (9.4): pita FUNCTION CALLING
    put(at("Solusinya") - 0.05, whoosh(0.6, 500, 3000, peak=0.55), 0.16)
    put(at("Function") , chime([587.33, 880.0, 1174.66], dur=1.2, tau=0.5), 0.12)
    put(at("Function") + 0.02, click(2000), 0.14)
    # DEFINISI (12.5): garis draw-on agent->tool
    put(at("Gampangnya") + 0.1, scratch(1.0), 0.09, 0.1)
    put(at("tombol"), pop(900, 420), 0.20, 0.3)
    put(at("tombol") + 0.02, blip(523.25, dur=0.4, tau=0.12), 0.12, 0.3)
    # KREDIBILITAS (18.1): kartu bukti + logo
    put(at("bukan") - 0.05, whoosh(0.45, 2600, 700, peak=0.5), 0.14, -0.3)
    for i, w in enumerate(["Open", "Anthropic", "Google"]):
        put(at(w), pop(1000 + i * 160, 460 + i * 70), 0.22, -0.35 + i * 0.35)
        put(at(w) + 0.01, blip([783.99, 880.0, 987.77][i], dur=0.45, tau=0.12), 0.10, -0.35 + i * 0.35)
    # ALUR (23.2): agent memilih tool + packet data
    put(at("Alurnya") + 0.05, click(1700), 0.16)
    put(at("milih"), whoosh(0.4, 400, 2400, peak=0.4), 0.10, -0.2)
    put(at("kirim"), riser(0.9, 500, 3600), 0.10)
    # MOMEN ISTIMEWA (27.94): tool jalan -> hasil balik
    put(at("Terus", 1) - 0.04, impact(), 0.30)
    put(at("Terus", 1) - 0.06, whoosh(0.35, 3500, 700, peak=0.8), 0.16)
    put(at("balik"), chime([523.25, 783.99, 1046.5], dur=1.4, tau=0.6), 0.14)
    # CONTOH (32.8): end-to-end
    put(at("Misal"), pop(800, 380), 0.16, -0.4)
    put(at("panggil"), whoosh(0.35, 600, 2800, peak=0.45), 0.10)
    put(at("ambil"), click(1900), 0.12)
    put(at("jawab"), blip(659.25, dur=0.5, tau=0.14), 0.12)
    # PENUTUP (39.1): ringkasan
    put(at("Jadi") - 0.05, whoosh(0.7, 300, 1800, peak=0.4), 0.10)
    put(at("sesuatu") - 0.1, chime([587.33, 880.0, 1174.66, 1479.98], dur=1.8, tau=0.7), 0.12)
    put(at("sesuatu") + 0.05, click(2200), 0.10)

if __name__ == "__main__":
    from sfx.mix import Mix
    mix = Mix(DURATION, seed=7)
    score(mix, words)
    st = mix.master(target_lufs=TARGET_LUFS)
    mix.write(OUT)
    print(f"wrote {OUT}: {DURATION}s, {mix.count} sounds, {st['lufs']:.1f} LUFS, peak {st['peak_db']:.1f} dBFS")
