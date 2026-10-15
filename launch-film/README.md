# Ozen Digital launch film

A 15-second launch spot for [ozendigital.co](https://ozendigital.co), built as code: a single HTML
composition where every frame is a pure function of time, rendered frame by frame to video.

**Output:** `out/ozen-launch-15s.mp4`: 1920×1080, 60 fps, H.264 + 320 kbps AAC stereo, 15.000 s,
with original sound design (no music) and narration at −15 LUFS / −1.5 dBTP. The sound is also in
`out/ozen-launch-15s-sound.wav` (48 kHz, 24-bit) for editing, with its cue sheet in `out/sound-cues.json`.

## The cut

| Time | Beat |
| --- | --- |
| 0.0 – 1.9 | **The mark.** The ÖZEN wordmark assembles on cream: the compass-O spins in, the umlaut bars drop along the italic slant, ZEN wipes on, and a cobalt sheen passes over it. The site's periwinkle footer glow rises behind. |
| 1.95 – 4.5 | **The statement.** The cobalt hero card rises like a sheet with the site's nav and the line "We build *websites. / online stores. / digital tools.*" |
| 4.55 – 7.5 | **The product.** The camera pulls back to reveal the hero is the live site in a browser at ozendigital.co. The page scrolls to pricing, the figures count up (From $500, $80/mo, $150/mo), and the cards lift off the page. |
| 7.55 – 9.7 | **The flow.** The enquiry form slides in ("What do you need help with?"), a cursor picks *Custom Website*, progress fills to 20%, and a "We reply within 24 hours" chip pops in. |
| 9.6 – 11.6 | **The promise.** "Fixed price. *Before work begins.*" with proof points and a Get a Quote button, which gets clicked… |
| 11.58 – 15.0 | **The end card.** …and the button opens into the cobalt end card: the white wordmark, "Let's talk about your project.", ozendigital.co and the service line. |

## Sound

Sound design only: **no music and no musical instruments.** There are no melodies, chords, drums,
beats or tuned tones. Every sound in `audio/sound.py` is built in code from filtered noise and short
transients (there are no oscillators): air, whooshes, glints, clicks, ticks, pops, impacts and a quiet room tone.
Nothing is sampled, so Ozen owns it outright.

- **Locked to picture.** Each sound sits on a visual event, so the motion itself sets the rhythm.
  The whooshes peak where the motion peaks (wipe, sheet, pull-back, page scroll, form, UI exit,
  expansion), the clicks land on the cursor presses, and impacts mark the sheet landing, the
  statement and the end card. The end card is the loudest moment.
- **Sonic signature.** A swirl as the compass-O spins in, a soft magnetic "thock" as it lands, two
  precise ticks for the umlaut bars, and an airy swish across the ZEN wipe. The end card repeats it in
  the same rhythm as the logo rebuilds.
- **Checked for tonality.** A persistent-tone detector (narrow spectral peaks lasting over 64 ms) finds
  0% tonal frames, against 83% for a musical score. Onset analysis finds no periodic beat.
- **Delivery.** −15 LUFS integrated with a −1.5 dBTP ceiling (it stays under −1 dBTP after AAC
  encoding), and mono-safe (decorrelated stereo).

- **Narration.** A warm female voice (Kokoro TTS, an even blend of `af_heart` and `af_kore`) reads
  four lines: "Websites. Online stores. Digital tools." (each word on its roll-in, from 2.62 s) ·
  "Designed to perform. Priced before we start." (5.2 s) · "Fixed price. Before work begins." (9.9 s,
  finishing before the 11.91 s hit) · "Ozen Digital. Let's talk about your project." (12.05 s, as
  the end-card mark builds). Each line is spoken as one take so the intonation runs through it.
  The take is cut at its word boundaries (DTW-aligned against the phrases read separately) so a
  phrase can wait for its beat. The voice then goes through a broadcast chain (EQ, de-esser, 3:1
  compression, light saturation, a short room). `audio/voice.py` writes `out/voiceover.wav`, and
  the effects dip 8 dB under it. To use a human recording, replace that WAV (15 s, 48 kHz, same
  timing) and re-run `sound.py`. Model files go in `audio/models/` (links in `voice.py`).

Regenerate and re-attach it (no video re-render needed):

```bash
python3 -m venv launch-film/.venv && launch-film/.venv/bin/pip install -r launch-film/audio/requirements.txt
launch-film/.venv/bin/python launch-film/audio/voice.py   # → out/voiceover.wav (narration)
launch-film/.venv/bin/python launch-film/audio/sound.py   # → out/ozen-launch-15s-sound.wav
node launch-film/render.mjs --mux                          # attach it to out/ozen-launch-15s.mp4
```

Cue times live in the `CUE` dict at the top of `sound.py`. If the picture's timing changes, update them there.

## Brand sources

Everything is matched to the live site (from a screen recording of ozendigital.co):

- **Palette:** cream canvas `#F9F7F5`, card `#F1EFEA`, ink `#111`, cobalt mesh sampled from the hero
  panels (`#1B3A9E` → `#2551BE` → `#317ADD`), periwinkle highlight `#8CB1F6`.
- **Type:** Newsreader for headlines, Geist for UI and body copy. The site uses old-style figures
  (`$5oo`, `$8o/mo`), so the digits come from Source Serif 4 with old-style figures baked in
  (`assets/fonts/figures-oldstyle.woff2`, layered under Newsreader via `unicode-range`).
- **Logo:** `assets/ozen-wordmark.svg` / `assets/logo.js`, vector-traced from the site's footer
  wordmark and split into mark, umlaut bars and letters so each can animate on its own.

All fonts are SIL Open Font License; the licence texts are in `assets/fonts/`.

## Preview

Serve the folder and open it in a browser. It plays in real time with a scrubber (space toggles
play/pause):

```bash
npx serve launch-film     # then open the printed URL
```

## Render

Needs ffmpeg and Playwright's Chromium (`npm i -D playwright && npx playwright install chromium`).

```bash
node launch-film/render.mjs                      # final: 4-sample motion blur, film grain
node launch-film/render.mjs --sub 1 --grain 0    # fast draft
node launch-film/render.mjs --stills 3.2,7.0     # review stills → out/stills/
node launch-film/render.mjs --mux                # re-attach the sound without re-rendering
```

A full render muxes `out/ozen-launch-15s-sound.wav` automatically when it exists.

| Option | Default | Meaning |
| --- | --- | --- |
| `--sub` | 4 | Motion-blur samples per frame (1 = off) |
| `--shutter` | 0.5 | Shutter as a fraction of the frame (0.5 = 180°) |
| `--grain` | 4 | Temporal luma grain added at encode (0 = off) |
| `--scale` | 1 | Device scale. 2 renders at 4K and downsamples for extra crispness |
| `--workers` | CPU count (max 4) | Parallel Chromium instances |
| `--crf` | 16 | x264 quality (lower = larger; 16 ≈ 17 Mbps, visually lossless with grain) |

Frames render in parallel chunks to lossless intermediates, then one final encode produces
BT.709 `yuv420p` H.264 with `+faststart`.

## Editing

- Copy lives in `index.html`. Pricing plans are in `PLANS` in `film.js`.
- Timing is in `film.js`: each scene function (`sceneMark`, `sceneProduct`, `scenePromise`,
  `sceneEnd`, `sceneCursor`) reads `t` in seconds. The camera poses are the keyframe arrays
  (`browserKeys`, `formKeys`, …).
- `?debug={"browser":{…}}` on the URL (or `--debug` on `render.mjs`) overrides the browser pose
  for framing experiments.
