#!/usr/bin/env python3
"""Narration for the launch film: a female voice (Kokoro TTS, voice af_heart), placed on the cuts.

    .venv/bin/pip install -r audio/requirements.txt
    # model files (once): kokoro-v1.0.onnx + voices-v1.0.bin from
    # https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 → audio/models/
    .venv/bin/python audio/voice.py     # → out/voiceover.wav (48 kHz stereo, 15.000 s)
    .venv/bin/python audio/sound.py     # mixes the voice over the sound design, ducking under it

To use a human recording instead, replace out/voiceover.wav with a 15 s 48 kHz WAV that has the
lines at the same times, and re-run sound.py.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from scipy import signal

SR = 48_000
DUR = 15.0
HERE = Path(__file__).resolve().parent
MODELS = HERE / "models"
OUT = HERE.parent / "out"
VOICE = "af_heart"

# (start of speech in seconds, line, speed). Timed to the picture in ../film.js.
LINES = [
    (2.55, "We build websites, online stores, and digital tools.", 1.0),  # headline rolls
    (5.75, "Designed to perform. Priced before we start.", 1.0),  # site → pricing
    (10.05, "Fixed price. Before work begins.", 1.05),  # the statement
    (12.20, "Ozen Digital. Let's talk about your project.", 1.05),  # end card
]


def main():
    import soundfile as sf  # noqa: F401  (kokoro_onnx dependency)
    from kokoro_onnx import Kokoro

    k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
    track = np.zeros(int(DUR * SR))
    for t0, text, speed in LINES:
        a, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
        a = signal.resample_poly(np.asarray(a, dtype=np.float64), SR, sr)
        nz = np.where(np.abs(a) > 0.01 * np.max(np.abs(a)))[0]
        a = a[max(nz[0] - int(0.02 * SR), 0) : nz[-1] + int(0.12 * SR)]  # trim to the speech
        a *= np.clip(np.arange(len(a)) / (0.005 * SR), 0, 1) * np.clip((len(a) - np.arange(len(a))) / (0.03 * SR), 0, 1)
        i0 = int(round((t0 - 0.02) * SR))
        if i0 + len(a) > len(track):
            raise ValueError(f"line at {t0}s runs past the end of the film")
        track[i0 : i0 + len(a)] += a
        print(f"{t0:6.2f}–{t0 + len(a) / SR:5.2f}s  {text}")
    stereo = np.vstack([track, track]).T.astype(np.float32)
    OUT.mkdir(parents=True, exist_ok=True)
    import soundfile

    soundfile.write(OUT / "voiceover.wav", stereo, SR, subtype="PCM_24")
    print(OUT / "voiceover.wav")
    return 0


if __name__ == "__main__":
    sys.exit(main())
