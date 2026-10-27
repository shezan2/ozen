# intelli8 App film

A 30-second product film for the **intelli8 App** ([intelli8.ai](https://intelli8.ai)). Like the
Ozen launch film next door, it is built as code: one HTML composition where every frame is a pure
function of time, rendered frame by frame to video.

**Output:** `out/intelli8-app.mp4` (1920×1080), `out/intelli8-app-9x16.mp4` (1080×1920, Reels/Stories) and
`out/intelli8-app-4x5.mp4` (1080×1350, feed): 60 fps, H.264 + AAC, 30.000 s, with sound design (no music, no
instruments) at −15 LUFS / −1.5 dBTP.

The same folder holds two more films built the same way: the **Body Composition Scale** film
(`scale.html`, site sections rebuilt as cards in `cards/`) and the **IAM** team-platform film (`iam.html`, the
dashboard rebuilt in `iam/`). Render them with `node render.mjs --film scale` / `--film iam`.

## The cut

| Time | Beat |
| --- | --- |
| 0.0 – 4.6 | **Hook.** "Same weight. *Different story.*" Week 1 and Week 6 side by side, both 68.0 kg; Week 6's body, drawn like the app's Segmental Analysis, turns from fat-led (orange) to muscle-led (green) segment by segment while body fat falls (24.8 → 23.2%) and muscle rises (48.2 → 49.3 kg). An illustrative person, not the app's demo user. |
| 4.6 – 8.4 | **Brand.** The ribbon 8 draws itself and its heart pops in, then the mark flies into the app's welcome screen. "See what changed." Get started is tapped. |
| 8.4 – 12.0 | **Measure.** The button opens into the dark section: "Stand steady. Hold the bar. *See more.*" The scale's eight contacts light, feet and then hands. |
| 12.0 – 15.6 | **Results.** "Fat, muscle, *every segment.*" Your Results fills its body diagram part by part, with a callout for each segment. Save my results is tapped. |
| 15.6 – 19.2 | **Dashboard.** "See your latest trends." The tiles settle and the sparklines draw. View full report is tapped. |
| 19.2 – 23.2 | **Report.** "The detail behind the summary." The Full Report scrolls while a counter runs to 24 measures. Save as PDF sends it to a coach. |
| 23.2 – 26.6 | **Goals + History.** Two phones: the goal slider travels and the body-fat trend draws. |
| 26.6 – 30.0 | **End.** "See what changed. *Fat, muscle, every segment.*" The app with the scale, Google Play and the iOS TestFlight beta, the S$98 scale, and the wellness disclaimer. |

## Brand sources

Everything is matched to screenshots of intelli8.ai:

- **Palette:** cream `#F5F4EE`, sage `#E0E7E1`, green-charcoal `#232C2B`, ink `#1E2430`, forest green
  `#3C7260`, mint `#AED2C0`. Inside the app: background `#F3F2F7` and navy `#295976`.
- **Type:** Manrope (headlines, tight tracking), DM Sans (body), JetBrains Mono (eyebrows). Inter stands
  in for the app's SF Pro.
- **Logo:** `assets/logo8.js` redraws the ribbon 8 as vector so it can draw itself. It is an
  approximation of the official artwork, which should replace it when available.
- **Scale:** `assets/scale.png` is cut out of the site's product render.
- **App screens:** rebuilt in HTML/CSS from the site's real app screens (with the site's demo data), in
  `screens/`. Each screen is its own file, previewable alone: `node screens/shot.mjs dashboard out.png 1`.

The copy stays within the site's own claims: BIA readings are estimates for general wellness, not a
diagnosis. The iOS app is in TestFlight beta (Google Play is live), as the site says.

## Sound

`audio/sound.py` builds the sound design from filtered noise and transients, with no oscillators, music
or instruments. A tonality check finds 0% tonal frames and no periodic beat. Evenly spaced runs were
broken up on purpose: for example, the eight contacts light in two uneven groups.

`audio/voice.py` holds each film's narration script, timed to the picture (`SCRIPTS`); the ElevenLabs prompts
are in `audio/ELEVENLABS.md`. To add a voiceover, put the take of the whole script in
`audio/takes/<film>/script.mp3` and run:

```bash
.venv/bin/python audio/voice.py --film app   # → out/voiceover-app.wav, fitted to the beats
.venv/bin/python audio/sound.py --film app   # mixes it over the sound design
node render.mjs --film app --mux             # re-attach the sound, no re-render (add --format 9x16 / 4x5)
```

## Render

```bash
node render.mjs                    # 1920×1080 · 60 fps · motion blur → out/intelli8-app.mp4
node render.mjs --format 9x16      # vertical → out/intelli8-app-9x16.mp4 (also 4x5)
node render.mjs --stills 3.2,14.0  # review stills → out/stills-app/
```

Options are the same as `../launch-film/render.mjs` (`--sub`, `--shutter`, `--grain`, `--crf`, `--mux`,
`--format`), plus `--film app|scale|iam`. Layouts per shape live in `formats/` (positions in `<id>.js`, CSS
scoped under `html.f-<id>`); 9:16 keeps everything readable inside Instagram's safe area.
