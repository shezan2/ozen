# Narration takes for the intelli8 films (ElevenLabs)

One take per film, the whole script in one generation. `audio/voice.py --film <film>` cuts the take at its
pauses, fits each line to its beat (speeding up by at most 1.2× with pitch kept, if needed) and writes
`out/voiceover-<film>.wav`; `audio/sound.py --film <film>` then mixes it over the sound design.

Save each take as `audio/takes/<film>/script.mp3` (app, scale, iam).

## Settings (all three films)

- **Model:** Eleven v3 (audio tags work there; on Multilingual v2, delete the bracketed tags).
- **Voice:** one voice for all three films, so the brand sounds the same everywhere. Recommended:
  **Katherine – Calm Luxury Narrator** (warm, unhurried, premium; you already used it). Alternatives: any calm,
  mid-pitch female narrator with a clean studio sound.
- **Stability:** Natural (about 50%). **Similarity:** 80%. **Style exaggeration:** 0. **Speed:** 1.0.
- Generate 3–4 takes and keep the one with the clearest pauses between lines and no rushed endings.

**How to write it:** every line on its own paragraph, with `[long pause]` between lines (the cutter finds the
lines by those pauses, so they must be clearly longer than the commas). "intelli8" is written *Intelli-eight*
so it is said as one word.

## App film (30 s) — `audio/takes/app/script.mp3`

```
[warm, calm] Your weight can stay the same, while what's underneath changes.
[long pause]
[confident] Meet Intelli-eight. See what changed.
[long pause]
Step on, and hold the bar. Eight contacts read your whole body.
[long pause]
See fat and muscle in every segment.
[long pause]
Your trends, the moment you open the app.
[long pause]
Twenty-four measures, one clear report, ready to share with your coach.
[long pause]
[warm] Set a goal, and follow the change.
[long pause]
[confident, warm] Intelli-eight. Know more than your weight.
```

## Body Composition Scale film (34 s) — `audio/takes/scale/script.mp3`

```
[calm, thoughtful] Your scale shows one number. But it can hide two different stories.
[long pause]
[warm, confident] The Intelli-eight Body Composition Scale. In fat and muscle.
[long pause]
Four for your feet, four for your hands.
[long pause]
Eight electrodes. Five body segments.
[long pause]
Weight alone can miss recomposition. Hand contacts add the detail.
[long pause]
[calm] Stand steady. Hold the bar. See more.
[long pause]
Weight, plus six more readings, right on the display.
[long pause]
Designed for a fuller picture.
[long pause]
[confident, warm] Intelli-eight. Know more than your weight.
```

## IAM team platform film (30 s) — `audio/takes/iam/script.mp3`

```
[calm, focused] Twenty athletes. Who needs a check-in today?
[long pause]
[confident] I-A-M, from Intelli-eight. See the whole team, support each person.
[long pause]
Readiness and recovery, in one view.
[long pause]
Match readiness, at a glance.
[long pause]
WHOOP and Polar ready, and built to scale to more.
[long pause]
Each athlete, against their own HRV baseline.
[long pause]
Sleep need versus actual, with training load.
[long pause]
[warm] I-A-M. Context for a better-informed check-in.
```
