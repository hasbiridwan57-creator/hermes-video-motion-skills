# Hermes Video Motion Skills

Koleksi skill [Hermes Agent](https://hermes-agent.nousresearch.com) untuk bikin video motion/explainer 9:16 (Reels/TikTok/Shorts), 16:9 (YouTube), atau 1:1 (feed).

## Isi

| Skill | Peran |
|---|---|
| `video-motion` | SOP induk — orkestrasi semua fase (brief → gaya → naskah → VO → render). Mulai dari sini. |
| `bang-motion` | Hukum desain motion sinematik (anti-PPT, style brief, 7 hukum). MIT. |
| `motion-format` | Alur kerja + 7 resep gaya + mesin render + ElevenLabs. |
| `html-motion-pipeline` | Pipeline teknis HTML→MP4 (faster-whisper, CDP render, audit layout, subtitle per-kata). |

## Cara pakai di Hermes

Clone repo ini ke folder skills Hermes:

```bash
cd ~/.hermes/profiles/<profile>/skills   # atau ~/.hermes/skills
git clone https://github.com/hasbiridwan57-creator/hermes-video-motion-skills.git .
```

Lalu load skill induknya di chat:

```
load skill video-motion
```

## Catatan lisensi

- `video-motion` dan `html-motion-pipeline` — buatan saya, bebas dipakai.
- `bang-motion` — MIT (by Bang Tutorial).
- `motion-format` — berisi karya dari seri berbayar "Motion Format" milik pembuatnya.
  Disertakan hanya untuk pemakaian pribadi pemilik lisensi. Bila Anda bukan pembeli,
  mohon hormati lisensi aslinya dan jangan gunakan/redistribusikan folder tersebut.
