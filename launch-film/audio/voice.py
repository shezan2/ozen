#!/usr/bin/env python3
"""Narration for the launch film: a female voice (Kokoro TTS), phrased and placed on the picture's
beats, then finished with a broadcast voice chain so it sounds produced rather than synthetic.

    .venv/bin/pip install -r audio/requirements.txt
    # model files (once): kokoro-v1.0.onnx + voices-v1.0.bin from
    # https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 → audio/models/
    .venv/bin/python audio/voice.py                 # → out/voiceover.wav (48 kHz stereo, 15.000 s)
    .venv/bin/python audio/voice.py --voice af_kore # try another voice (or a blend: "af_heart*0.6+af_bella*0.4")
    .venv/bin/python audio/sound.py                 # mixes it over the sound design

To use a human recording instead, replace out/voiceover.wav with a 15 s 48 kHz WAV on the same timing
and re-run sound.py.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.ndimage import uniform_filter1d

SR = 48_000
DUR = 15.0
N = int(SR * DUR)
HERE = Path(__file__).resolve().parent
MODELS = HERE / "models"
OUT = HERE.parent / "out"
DEFAULT_VOICE = "af_heart*0.5+af_kore*0.5"  # warm blend; scored highest for naturalness (UTMOS ≈ 4.5)

# Each line is spoken as one utterance so it keeps natural intonation, then cut at its word
# boundaries so each phrase lands on its own beat: (text, anchor seconds). A phrase starts at its
# anchor, or just after the previous phrase if that runs long. Anchors are visual beats in ../film.js.
LINES = [  # (speed, phrases)
    (1.0, [("Websites.", 2.62), ("Online stores.", 3.30), ("Digital tools.", 3.95)]),  # words roll in
    (0.95, [("Designed to perform.", 4.85), ("Priced before we start.", 6.12)]),  # pull-back, pricing lifts
    (0.95, [("Fixed price.", 9.90), ("Before work begins.", 10.70)]),  # promise words rise from 10.0
    (1.0, [("Ozen Digital.", 12.05), ("Let's talk about your project.", 13.15)]),  # end-card mark builds
]
GAP = 0.10  # minimum breath between lines (inside a line the take keeps its own pauses)
HARD_LIMITS = {6: 11.86, 8: 14.78}  # phrase index (counting across lines) → must end by (hit at 11.91; fade from 14.8)


def db(x):
    return 10 ** (np.asarray(x, dtype=float) / 20)


def peaking(x, f0, gain_db, q):
    a_, w = 10 ** (gain_db / 40), 2 * np.pi * f0 / SR
    al = np.sin(w) / (2 * q)
    b = np.array([1 + al * a_, -2 * np.cos(w), 1 - al * a_])
    a = np.array([1 + al / a_, -2 * np.cos(w), 1 - al / a_])
    return signal.lfilter(b / a[0], a / a[0], x, axis=-1)


def shelf_high(x, f0, gain_db):
    a_, w = 10 ** (gain_db / 40), 2 * np.pi * f0 / SR
    al = np.sin(w) / 2 * np.sqrt(2)
    c = np.cos(w)
    b = np.array([a_ * ((a_ + 1) + (a_ - 1) * c + 2 * np.sqrt(a_) * al), -2 * a_ * ((a_ - 1) + (a_ + 1) * c), a_ * ((a_ + 1) + (a_ - 1) * c - 2 * np.sqrt(a_) * al)])
    a = np.array([(a_ + 1) - (a_ - 1) * c + 2 * np.sqrt(a_) * al, 2 * ((a_ - 1) - (a_ + 1) * c), (a_ + 1) - (a_ - 1) * c - 2 * np.sqrt(a_) * al])
    return signal.lfilter(b / a[0], a / a[0], x, axis=-1)


def envelope(x, attack, release):
    """Peak-ish envelope follower (one-pole attack/release) on |x|."""
    a_a, a_r = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    y = np.abs(x)
    out = np.empty_like(y)
    e = 0.0
    for i, v in enumerate(y):
        e = a_a * e + (1 - a_a) * v if v > e else a_r * e + (1 - a_r) * v
        out[i] = e
    return out


def broadcast_chain(x):
    """Warmth, de-box, presence/air, de-ess, 3:1 compression, gentle saturation."""
    x = signal.sosfilt(signal.butter(2, 75, "highpass", fs=SR, output="sos"), x)
    x = peaking(x, 180, 1.5, 0.8)  # warmth
    x = peaking(x, 420, -2.0, 1.2)  # take out the box
    x = peaking(x, 3500, 2.0, 0.9)  # presence
    x = shelf_high(x, 9000, 1.5)  # air
    # de-esser: duck the 5–9 kHz band when it gets hot relative to the voice
    band = signal.sosfilt(signal.butter(2, [5000, 9000], "bandpass", fs=SR, output="sos"), x)
    eb = envelope(band, 0.001, 0.05)
    ev = envelope(x, 0.005, 0.1) + 1e-9
    over = np.clip(eb / ev / 0.35, 1, None)
    x = x - band * (1 - 1 / over**0.7)
    # compression: 3:1 above the speech's typical level, 5 ms / 120 ms
    env = envelope(x, 0.005, 0.12) + 1e-9
    thr = np.percentile(env[env > env.max() * 0.05], 60)
    gain = np.where(env > thr, (thr / env) ** (1 - 1 / 3), 1.0)
    x = x * uniform_filter1d(gain, int(0.003 * SR))
    # gentle analogue-style saturation, blended
    sat = np.tanh(2.0 * x / (np.max(np.abs(x)) + 1e-9)) * np.max(np.abs(x)) / 2.0
    x = 0.8 * x + 0.2 * sat
    return x / (np.max(np.abs(x)) + 1e-9) * 0.7


def room(x, rt=0.45, wet_db=-19.0):
    """Short, soft room so the voice sits in a space instead of floating dry."""
    rng = np.random.default_rng(7)
    n = int(rt * 1.6 * SR)
    t = np.arange(n) / SR
    decay = 10 ** (-3 * t / rt)
    irs = []
    for _ in range(2):
        ir = rng.standard_normal(n) * decay
        ir = signal.sosfilt(signal.butter(2, [300, 6000], "bandpass", fs=SR, output="sos"), ir)
        irs.append(np.pad(ir, (int(0.012 * SR), 0)))
    wet = np.vstack([signal.oaconvolve(x, ir)[: len(x)] for ir in irs])
    wet *= db(wet_db) * np.sqrt(np.mean(x**2)) / (np.sqrt(np.mean(wet**2)) + 1e-12)
    return np.vstack([x, x]) + wet


def trim(a):
    nz = np.where(np.abs(a) > 0.01 * np.max(np.abs(a)))[0]
    a = a[max(nz[0] - int(0.015 * SR), 0) : nz[-1] + int(0.06 * SR)]
    n = len(a)
    return a * np.clip(np.arange(n) / (0.004 * SR), 0, 1) * np.clip((n - np.arange(n)) / (0.03 * SR), 0, 1)


def logmel(a, hop=480, n_fft=1024, bands=40):
    """Log-mel frames (10 ms hop), mean-normalised: enough to align two takes of the same words."""
    _, _, z = signal.stft(a, SR, nperseg=n_fft, noverlap=n_fft - hop, boundary=None, padded=False)
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    edges = 700 * (10 ** (np.linspace(mel(60), mel(8000), bands + 2) / 2595) - 1)
    freqs = np.linspace(0, SR / 2, z.shape[0])
    fb = np.array([np.clip(np.minimum((freqs - lo) / (c - lo), (hi - freqs) / (hi - c)), 0, None) for lo, c, hi in zip(edges, edges[1:], edges[2:])])
    f = np.log(fb @ np.abs(z) ** 2 + 1e-8).T
    return f - f.mean(0)


def dtw_path(x, y):
    """Classic DTW on cosine distance; returns the path as (i, j) frame pairs."""
    xn = x / (np.linalg.norm(x, axis=1, keepdims=True) + 1e-9)
    yn = y / (np.linalg.norm(y, axis=1, keepdims=True) + 1e-9)
    c = 1 - xn @ yn.T
    acc = np.full((len(x) + 1, len(y) + 1), np.inf)
    acc[0, 0] = 0
    for i in range(1, len(x) + 1):
        row, prev = acc[i], acc[i - 1]
        for j in range(1, len(y) + 1):
            row[j] = c[i - 1, j - 1] + min(prev[j - 1], prev[j], row[j - 1])
    i, j, path = len(x), len(y), []
    while i > 0 and j > 0:
        path.append((i - 1, j - 1))
        k = np.argmin([acc[i - 1, j - 1], acc[i - 1, j], acc[i, j - 1]])
        i, j = (i - 1, j - 1) if k == 0 else (i - 1, j) if k == 1 else (i, j - 1)
    return path[::-1]


def split(line, separate):
    """Cut a whole-line take into phrases at the same word boundaries as the separate takes:
    DTW-align the line against the separate phrases laid end to end, map each join across,
    then snap the cut to the quietest point within 40 ms."""
    gap = np.zeros(int(0.05 * SR))
    ref = np.concatenate([p for s in separate for p in (s, gap)][:-1])
    joins = np.cumsum([len(s) + len(gap) for s in separate[:-1]]) - len(gap) // 2
    path = dtw_path(logmel(ref), logmel(line))
    env = uniform_filter1d(np.abs(line), int(0.01 * SR))
    cuts = []
    for jn in joins:
        f = jn // 480
        g = np.mean([j for i, j in path if i == f]) * 480
        lo, hi = int(max(g - 0.04 * SR, 0)), int(min(g + 0.04 * SR, len(line) - 1))
        cuts.append(lo + int(np.argmin(env[lo:hi])))
    return np.split(line, cuts)


def render(voice: str):
    from kokoro_onnx import Kokoro

    k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
    style = voice
    if "+" in voice or "*" in voice:  # blend: "a*0.6+b*0.4"
        style = sum(float(w) * k.get_voice_style(n) for n, w in (p.split("*") for p in voice.split("+")))

    def say(text, speed):
        a, sr = k.create(text, voice=style, speed=speed, lang="en-us")
        return signal.resample_poly(np.asarray(a, dtype=np.float64), SR, sr)

    track = np.zeros(N)
    placed = []
    t_free = 0.0
    i = 0
    for speed, line in LINES:
        whole = trim(say(" ".join(t for t, _ in line), speed))
        pieces = split(whole, [trim(say(t, speed)) for t, _ in line]) if len(line) > 1 else [whole]
        # Each phrase starts on its anchor, or straight on from the one before (keeping the take's
        # own pause), whichever is later; the first waits for a breath after the previous line.
        starts, ends, t = [], [], t_free + GAP
        for (_, anchor), a in zip(line, pieces):
            starts.append(max(anchor, t))
            t = starts[-1] + len(a) / SR
            ends.append(t)
        # If a phrase would overrun its limit, pull the whole line earlier (never into the last one).
        over = max([ends[j] - HARD_LIMITS[i + j] for j in range(len(line)) if i + j in HARD_LIMITS] + [0])
        if over > 0:
            if starts[0] - over < t_free + GAP - 1e-6:
                raise ValueError(f"line {line[0][0]!r}… runs {over:.2f}s past its limit")
            starts, ends = [x - over for x in starts], [x - over for x in ends]
        for (text, _), a, start, end in zip(line, pieces, starts, ends):
            n = len(a)
            a = a * np.clip(np.arange(n) / (0.003 * SR), 0, 1) * np.clip((n - np.arange(n)) / (0.003 * SR), 0, 1)
            i0 = int(round(start * SR))
            track[i0 : i0 + n] += a[: N - i0]
            placed.append((start, end, text))
        t_free = ends[-1]
        i += len(line)
    return track, placed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--out", default=str(OUT / "voiceover.wav"))
    args = ap.parse_args()

    dry, placed = render(args.voice)
    st = room(broadcast_chain(dry))
    st *= np.clip(np.arange(N) / (0.01 * SR), 0, 1)
    import soundfile

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    soundfile.write(args.out, (st.T / (np.max(np.abs(st)) + 1e-9) * 0.8).astype(np.float32), SR, subtype="PCM_24")
    for s, e, text in placed:
        print(f"{s:6.2f}–{e:5.2f}s  {text}")
    print(args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
