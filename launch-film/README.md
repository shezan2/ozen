# Ozen Digital launch film

A 15-second launch spot for [ozendigital.co](https://ozendigital.co), built as code: a single HTML
composition where every frame is a pure function of time, rendered frame by frame to video.

**Output:** `out/ozen-launch-15s.mp4`: 1920×1080, 60 fps, H.264 + 320 kbps AAC stereo, 15.000 s,
with an original score mastered to −14 LUFS / −1.5 dBTP. The score is also in
`out/ozen-launch-15s-score.wav` (48 kHz, 24-bit) for editing, with its cue sheet in `out/score-cues.json`.

## The cut

| Time | Beat |
| --- | --- |
| 0.0 – 1.9 | **The mark.** The ÖZEN wordmark assembles on cream: the compass-O spins in, the umlaut bars drop along the italic slant, ZEN wipes on, and a cobalt sheen passes over it. The site's periwinkle footer glow rises behind. |
| 1.95 – 4.5 | **The statement.** The cobalt hero card rises like a sheet with the site's nav and the line "We build *websites. / online stores. / digital tools.*" |
| 4.55 – 7.5 | **The product.** The camera pulls back to reveal the hero is the live site in a browser at ozendigital.co. The page scrolls to pricing, the figures count up (From $500, $80/mo, $150/mo), and the cards lift off the page. |
| 7.55 – 9.7 | **The flow.** The enquiry form slides in ("What do you need help with?"), a cursor picks *Custom Website*, progress fills to 20%, and a "We reply within 24 hours" chip pops in. |
| 9.6 – 11.6 | **The promise.** "Fixed price. *Before work begins.*" with proof points and a Get a Quote button, which gets clicked… |
| 11.58 – 15.0 | **The end card.** …and the button opens into the cobalt end card: the white wordmark, "Let's talk about your project.", ozendigital.co and the service line. |

## Soundtrack

An original score and sound design, synthesised entirely in code (`audio/score.py`, numpy + scipy).
There are no samples and no licences: everything is oscillators and filtered noise, so Ozen owns it outright.

- **Locked to picture.** The groove is 120 BPM, anchored so its beats land on the sheet landing (2.475),
  the "Fixed price." statement (9.975) and the end-card hit (11.975). One 3/4 bar keeps the grid aligned.
  Whooshes peak where the motion peaks (wipe, sheet, pull-back, page scroll, form, UI exit, expansion),
  and the clicks land on the cursor presses.
- **Harmony.** F major: Fmaj9 → Dm9 → B♭maj9 → Gm9 → C9sus4, which resolves to C7 as the option is
  selected, then B♭maj9 → C9sus4 → Fmaj9 home on the end card.
- **Sonic logo.** F5–C6–A5 on a clean FM bell, one note per logo-build event (the mark lands, the first
  umlaut bar lands, the ZEN wipe completes). It plays in the intro and again, in the same rhythm, as the
  end-card logo rebuilds.
- **Arc.** A spacious intro (−19 LUFS), a lift on the sheet, the groove, a dip for the break, a breakdown
  under the statement, and the end card as the loudest moment (−9 LUFS momentary). It decays on its own by
  14.8 s.
- **Translation.** Bass and impacts carry harmonics so they read on phone speakers. Mono-safe
  (decorrelated stereo, no delay tricks). The true-peak ceiling leaves headroom for AAC.

Regenerate and re-attach it (no video re-render needed):

```bash
python3 -m venv launch-film/.venv && launch-film/.venv/bin/pip install -r launch-film/audio/requirements.txt
launch-film/.venv/bin/python launch-film/audio/score.py   # → out/ozen-launch-15s-score.wav
node launch-film/render.mjs --mux                          # attach it to out/ozen-launch-15s.mp4
```

Cue times live in the `CUE` dict at the top of `score.py`. If the picture's timing changes, update
them there.

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
node launch-film/render.mjs --mux                # re-attach the score without re-rendering
```

A full render muxes `out/ozen-launch-15s-score.wav` automatically when it exists.

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
