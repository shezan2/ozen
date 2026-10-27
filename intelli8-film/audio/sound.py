#!/usr/bin/env python3
"""intelli8 films: sound design (no music), synthesised in code.

Brief: no musical instruments. So there are no melodies, chords, drums, beats or tuned tones.
Every sound here is built from filtered noise and short transients (no oscillators): air,
whooshes, glints, clicks, ticks, pops and impacts, plus a quiet room-tone bed. Each sound is
placed on a visual event, so the motion itself sets the rhythm.

    python3 -m venv .venv && .venv/bin/pip install -r ../launch-film/audio/requirements.txt
    .venv/bin/python audio/sound.py                 # App film → out/intelli8-app-sound.wav + out/sound-cues-app.json
    .venv/bin/python audio/sound.py --film scale    # Body Composition Scale film → out/intelli8-scale-sound.wav
    .venv/bin/python audio/sound.py --film demo     # 60 s scale product demo (demo/) → out/intelli8-demo-sound.wav
    node render.mjs --film scale --mux              # attach it to the film

Deterministic: each sound draws from its own seeded noise stream.

Each film has its own cue sheet and design function. App film cues follow film.js: air and texture for the hook, an airy draw for the 8 and a pop
for its heart, a bloom as the dark Measure section opens, eight bright glints for the scale's
contacts, then the app: taps, pushes, scroll detents, segment ticks, a PDF flight and the landing.
Scale film cues follow scale-film.js (SCALE below), the IAM film iam-film.js (IAM below).
"""
from __future__ import annotations

import json
import struct
import sys
import zlib
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48_000
FILMS = {"app": 30.0, "scale": 34.0, "iam": 30.0, "demo": 60.0}  # film → duration (s)
FILM = sys.argv[sys.argv.index("--film") + 1] if "--film" in sys.argv else "app"
if FILM not in FILMS:
    sys.exit(f"--film must be one of {', '.join(FILMS)}")
DUR = FILMS[FILM]
N = int(SR * DUR)
SEED = 20261013

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out"

# ---------------------------------------------------------------------------- cue sheet
# Times in seconds from ../film.js: tween starts, and where motion visibly lands or peaks
# (derived from its easing curves and checked against frame differences of the render).

# App film picture events (seconds), from film.js.
CUE = {
    "card": 0.0,  # Week 1 card on screen, centred
    "glide": (0.15, 0.95),  # it glides right as the headline arrives
    "same": 0.4,  # "Same weight."
    "week6": (0.75, 1.45),  # Week 6 card slides in beside it
    "equals": 1.3,  # "=" between the two 72.4 kg
    "different": 1.9,  # "Different story." — the insight
    "flips": [1.98, 2.17, 2.31, 2.52],  # Week 6 segments turn muscle-led (film.js FLIP_AT)
    "sheet": (4.15, 4.75),  # sage sheet rises over the hook
    "draw": (4.75, 5.85),  # the 8 draws itself
    "heart": 5.65,  # heart pops in the top loop
    "word": 5.45,  # wordmark settles
    "fly": (6.0, 6.75),  # mark flies into the phone
    "brand_head": 6.7,  # "See what changed."
    "tap1": 7.86,  # tap: Get started
    "wipe": (8.02, 8.62),  # button opens into the dark Measure section
    "measure_head": 8.7,  # three headline lines, 0.16 s apart
    "scale": (8.6, 9.6),  # scale rises
    "contacts": 9.55,  # eight contacts light: feet, then hands, in two uneven groups (CONTACT_AT)
    "chip": 10.75,  # "8 contacts · 5 body segments"
    "measure_out": (11.75, 12.35),  # dark section slides up
    "phone_in": (11.95, 12.75),  # phone rises with Your Results
    "segments": (12.75, 0.216),  # body parts fill: first time, spacing (5 parts); film.js RESULTS
    "tap2": 15.32,  # tap: Save my results
    "push1": (15.5, 15.9),  # → Dashboard
    "sparks": (16.35, 17.15),  # sparklines draw
    "tap3": 18.82,  # tap: View full report
    "push2": (19.0, 19.4),  # → Full Report
    "scroll": (19.9, 22.0),  # report scrolls; counter 0 → 24
    "tap4": 22.27,  # tap: Save as PDF
    "pdf": (22.4, 23.0),  # PDF flies to the coach
    "coach": 22.85,  # "Shared with your coach"
    "pair": (23.15, 24.35),  # main phone out, Goals + History phones rise
    "slider": (23.89, 24.68),  # goal slider travels
    "line": (24.06, 25.09),  # history line draws
    "to_end": (26.4, 26.85),  # cut to the end card
    "end_hit": 26.85,  # end card lands
    "stores": 27.6,  # where to get it
}
CONTACT_AT = [0, 0.1, 0.22, 0.3, 0.52, 0.59, 0.71, 0.77]  # seconds after the first contact (film.js)


def reseed(tag: str):
    """Give the next sound(s) their own deterministic noise stream."""
    global _rng
    _rng = np.random.default_rng([SEED, zlib.crc32(tag.encode())])


def db(x):
    return 10 ** (np.asarray(x, dtype=float) / 20)


def secs(n: int) -> np.ndarray:
    return np.arange(n) / SR


def pan_gains(p):
    th = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.cos(th), np.sin(th)


def to_stereo(x: np.ndarray, pan=0.0) -> np.ndarray:
    if x.ndim == 2:
        return x
    gl, gr = pan_gains(pan)
    return np.vstack([x * gl, x * gr])


class Bus:
    def __init__(self, name: str):
        self.name = name
        self.x = np.zeros((2, N))

    def add(self, sig: np.ndarray, t0: float, pan=0.0, gain=1.0):
        sig = to_stereo(sig, pan)
        i0 = int(round(t0 * SR))
        n = sig.shape[1]
        a, b = max(i0, 0), min(i0 + n, N)
        if b > a:
            self.x[:, a:b] += gain * sig[:, a - i0 : b - i0]


def fade_edges(x: np.ndarray, a=0.002, r=0.01) -> np.ndarray:
    n = x.shape[-1]
    na, nr = min(int(a * SR), n // 2), min(int(r * SR), n // 2)
    w = np.ones(n)
    if na:
        w[:na] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na))
    if nr:
        w[-nr:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, nr))
    return x * w


def sos(kind: str, fc, order=2):
    return signal.butter(order, fc, kind, fs=SR, output="sos")


def filt(x: np.ndarray, kind: str, fc, order=2) -> np.ndarray:
    return signal.sosfilt(sos(kind, fc, order), x, axis=-1)


def tv_filter(x: np.ndarray, kind: str, fc: np.ndarray, width_oct=1.2, block=32) -> np.ndarray:
    """Time-varying Butterworth filter, coefficients updated every `block` samples.
    Band-passes are kept at least ~1 octave wide so filtered noise never whistles."""
    x = np.atleast_2d(x)
    out = np.zeros_like(x)
    zi = None
    nyq = SR / 2
    for s in range(0, x.shape[1], block):
        e = min(s + block, x.shape[1])
        f = float(np.clip(fc[min(s + block // 2, len(fc) - 1)], 20, nyq * 0.9))
        if kind == "bandpass":
            lo = max(f / 2 ** (width_oct / 2), 20)
            hi = min(f * 2 ** (width_oct / 2), nyq * 0.95)
            c = signal.butter(2, [lo, hi], "bandpass", fs=SR, output="sos")
        else:
            c = signal.butter(2, f, kind, fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((x.shape[0], c.shape[0], 2))
        for ch in range(x.shape[0]):
            out[ch, s:e], zi[ch] = signal.sosfilt(c, x[ch, s:e], zi=zi[ch])
    return out if out.shape[0] > 1 else out[0]


def noise(n: int) -> np.ndarray:
    return _rng.standard_normal(n)


def pink(n: int) -> np.ndarray:
    spec = np.fft.rfft(_rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    p = np.fft.irfft(spec / np.sqrt(f), n)
    return p / (np.std(p) + 1e-12)


def brown(n: int) -> np.ndarray:
    spec = np.fft.rfft(_rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    p = np.fft.irfft(spec / np.maximum(f, 15.0), n)
    return p / (np.std(p) + 1e-12)


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-12)


def decay_env(n, attack, decay):
    t = secs(n)
    return (1 - np.exp(-t / attack)) * np.exp(-t / decay)


# ---------------------------------------------------------------------------- sounds (all noise)

def whoosh(dur, peak=0.5, f0=300.0, f1=2600.0, pan0=0.0, pan1=0.0, width_oct=1.3):
    """Airy pass-by: pink noise through a swept band-pass, swelling to `peak` (fraction)."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    tp = np.clip(peak, 0.05, 0.95)
    env = np.where(u < tp, np.clip(u / tp, 0, 1) ** 2.4, np.clip((1 - u) / (1 - tp), 0, 1) ** 1.6)
    x = norm(tv_filter(pink(n), "bandpass", f0 * (f1 / f0) ** u, width_oct=width_oct)) * env
    gl, gr = pan_gains(pan0 + (pan1 - pan0) * u)
    return fade_edges(np.vstack([x * gl, x * gr]), a=0.002, r=0.02)


def swirl(dur, rate0=7.0, rate1=1.2, f0=2600.0, f1=700.0, width=0.45):
    """Spinning air for the compass-O: a descending noise band whose pan circles and slows."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    rate = rate0 * (rate1 / rate0) ** u
    ph = 2 * np.pi * np.cumsum(rate) / SR
    env = np.where(u < 0.45, (u / 0.45) ** 1.5, ((1 - u) / 0.55) ** 1.3)
    x = norm(tv_filter(pink(n), "bandpass", f0 * (f1 / f0) ** u, width_oct=1.5)) * env
    x *= 1 + 0.22 * np.sin(2 * ph)  # rotating-air flutter
    gl, gr = pan_gains(width * np.sin(ph))
    return fade_edges(np.vstack([x * gl, x * gr]), a=0.003, r=0.02)


def thock(weight=1.0):
    """Soft magnetic snap-into-place: damped noise body with a low thud. Untuned."""
    n = int(0.25 * SR)
    body = filt(noise(n), "lowpass", 1400) * decay_env(n, 0.0004, 0.007)
    low = filt(noise(n), "lowpass", 160, order=2) * decay_env(n, 0.001, 0.035)
    snap = filt(noise(n), "highpass", 3500) * decay_env(n, 0.0002, 0.0012)
    return fade_edges(norm(1.0 * norm(body) + weight * norm(low) + 0.35 * norm(snap)), a=0.0002, r=0.03)


def tick(bright=1.0):
    """Precision tick: a millisecond of high-passed noise with a whisper of body."""
    n = int(0.06 * SR)
    hi = filt(noise(n), "highpass", 3000 * bright) * decay_env(n, 0.0001, 0.0011)
    mid = filt(noise(n), "bandpass", [900, 3000]) * decay_env(n, 0.0002, 0.0035)
    return fade_edges(norm(norm(hi) + 0.45 * norm(mid)), a=0.0001, r=0.01)


def glint(dur, pan0=-0.47, pan1=0.47, density=140.0):
    """A sweep of light: randomly timed grains of bright noise, panned along the sweep."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    out = np.zeros((2, n))
    rate = density * np.sin(np.pi * u) ** 2
    expected = np.cumsum(rate) / SR
    k = 0.0
    grain_n = int(0.006 * SR)
    g_env = decay_env(grain_n, 0.0002, 0.0018)
    i = 0
    while i < n - grain_n:
        k += _rng.exponential(1.0)
        idx = np.searchsorted(expected, k)
        if idx >= n - grain_n:
            break
        g = filt(noise(grain_n), "highpass", _rng.uniform(5500, 9000)) * g_env * _rng.uniform(0.4, 1.0)
        gl, gr = pan_gains(pan0 + (pan1 - pan0) * u[idx] + _rng.normal(0, 0.05))
        out[0, idx : idx + grain_n] += g * gl
        out[1, idx : idx + grain_n] += g * gr
        i = idx
    air = norm(tv_filter(noise(n), "bandpass", 6000 * (1.6 ** u), width_oct=1.4)) * np.sin(np.pi * u) ** 2 * 0.25
    gl, gr = pan_gains(pan0 + (pan1 - pan0) * u)
    out += np.vstack([air * gl, air * gr])
    return fade_edges(out / (np.max(np.abs(out)) + 1e-12), a=0.003, r=0.02)


def riser(dur, f0=400.0, f1=8000.0, curve=2.6, tail=0.006):
    """Noise-only build: decorrelated band-passed noise rising in centre frequency and level,
    with an airy high layer. No pitched content."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    env = u**curve
    fc = f0 * (f1 / f0) ** (u**1.4)
    chans = []
    for _ in range(2):
        z = norm(tv_filter(noise(n), "bandpass", fc, width_oct=1.8))
        air = norm(tv_filter(noise(n), "highpass", np.clip(fc * 1.6, 2000, 16000)))
        chans.append((0.85 * z + 0.35 * air) * env)
    return fade_edges(np.vstack(chans), a=0.01, r=tail)


def reverse_swell(dur, hp=2500.0):
    """Reverse-air swell into a hit (independent noise per channel)."""
    n = int(dur * SR)
    t = secs(n)
    env = np.exp((t - dur) / (dur * 0.28))
    st = np.vstack([filt(filt(noise(n), "highpass", hp), "lowpass", 11000) * env for _ in range(2)])
    return fade_edges(st / (np.max(np.abs(st)) + 1e-9), a=0.01, r=0.008)


def pressure(dur, peak=0.45):
    """Low air-pressure swell under big camera moves (brown noise, no tone)."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    env = np.where(u < peak, (u / peak) ** 2, ((1 - u) / (1 - peak)) ** 1.5)
    st = np.vstack([filt(pink(n), "lowpass", 160, order=2) for _ in range(2)])
    return fade_edges(st / (np.max(np.abs(st)) + 1e-9) * env, a=0.01, r=0.02)


def impact(size=1.0):
    """Noise-built hit: a sub-heavy thud, a body, a crack and a long air tail (via reverb).
    Built from filtered noise only, so it is a sound effect rather than a drum or a note."""
    dur = 0.6 + 1.6 * size
    n = int(dur * SR)
    sub = filt(pink(n), "lowpass", 95, order=2) * decay_env(n, 0.002, 0.16 + 0.22 * size)
    thud = filt(noise(n), "lowpass", 200, order=2) * decay_env(n, 0.0008, 0.05)
    body = np.vstack([filt(noise(n), "bandpass", [300, 2200]) * decay_env(n, 0.0005, 0.035) for _ in range(2)])
    crack = np.vstack([filt(noise(n), "highpass", 2500) * decay_env(n, 0.0002, 0.006) for _ in range(2)])
    tail = np.vstack([filt(noise(n), "lowpass", 900) * decay_env(n, 0.03, 0.35 * size) for _ in range(2)])
    low = norm(1.2 * norm(sub) + 0.8 * norm(thud))
    x = 1.0 * low + 0.45 * body / np.max(np.abs(body)) + 0.3 * crack / np.max(np.abs(crack)) + 0.25 * tail / np.max(np.abs(tail))
    x = np.tanh(1.3 * x) / np.tanh(1.3)
    return fade_edges(x, a=0.0003, r=0.05)


def ui_click(weight=1.0):
    """Tactile UI click from noise: a tick, a short body and a soft low thump. Untuned."""
    n = int(0.12 * SR)
    t_ = filt(filt(noise(n), "highpass", 4000), "lowpass", 11000) * decay_env(n, 0.0001, 0.0012)
    body = filt(noise(n), "bandpass", [600, 2500]) * decay_env(n, 0.0003, 0.008)
    low = filt(noise(n), "lowpass", 160, order=2) * decay_env(n, 0.001, 0.018)
    return fade_edges(norm(0.7 * norm(t_) + 0.6 * norm(body) + weight * 0.8 * norm(low)), a=0.0001, r=0.02)


def pop(dur=0.09):
    """Soft pop for the chip: a noise burst through a fast upward filter sweep."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    fc = 700 * (3200 / 700) ** np.clip(u * 3.5, 0, 1)
    x = norm(tv_filter(noise(n), "bandpass", fc, width_oct=1.3, block=16)) * decay_env(n, 0.0008, 0.018)
    x += 0.4 * filt(noise(n), "lowpass", 300) * decay_env(n, 0.001, 0.012)
    return fade_edges(norm(x), a=0.0002, r=0.01)


def ambience(dur, level_curve):
    """Quiet room tone: a low air rumble, a soft mid hush and high air, slowly drifting."""
    n = int(dur * SR)
    drift_n = int(dur * 50) + 2
    out = []
    for _ in range(2):
        low = filt(pink(n), "lowpass", 200, order=2) * 0.55
        mid = filt(pink(n), "bandpass", [250, 2500]) * 0.12
        air = filt(filt(noise(n), "highpass", 6500), "lowpass", 14000) * 0.15
        slow = np.convolve(_rng.standard_normal(drift_n), np.ones(25) / 25, mode="same")  # ~0.5 s smoothing
        d = np.interp(np.linspace(0, drift_n - 1, n), np.arange(drift_n), slow)
        out.append((low + mid + air) * db(1.5 * d / (np.std(d) + 1e-9)))
    return np.vstack(out) * level_curve(np.linspace(0, 1, n))


def meter_ticks(t0, t1, v0, v1, step, min_gap=0.045):
    """A tick each time the hook's quote total (film.js: v0→v1 on an ease-in cubic over t0–t1)
    passes another `step`, thinned to `min_gap` and jittered, so it quickens like a meter."""
    times, last = [], -1.0
    for k in range(1, int((v1 - v0) / step) + 1):
        t = t0 + (t1 - t0) * (k * step / (v1 - v0)) ** (1 / 3)
        if t - last >= min_gap:
            times.append(t + _rng.normal(0, 0.004))
            last = t
    return times


def scroll_ticks(t0, t1, max_rate=16.0):
    """Mouse-wheel detents during the page scroll: soft ticks whose rate follows the scroll
    speed, jittered so they never form a regular pulse."""
    times = []
    u = np.linspace(0, 1, 2000)
    # film.js scroll ease is dolly = cubic-bezier(.72,0,.16,1); its speed is ~ a smooth bump
    speed = np.sin(np.pi * np.clip((u - 0.08) / 0.84, 0, 1)) ** 1.6
    rate = max_rate * speed
    count = np.cumsum(rate) * (t1 - t0) / len(u)
    k = 0.6
    while k < count[-1]:
        i = np.searchsorted(count, k)
        times.append(t0 + u[min(i, len(u) - 1)] * (t1 - t0) + _rng.normal(0, 0.006))
        k += _rng.uniform(0.75, 1.25)
    return times


# ---------------------------------------------------------------------------- effects

def make_ir(rt60=2.1, length=3.2, predelay=0.012, bright_hz=8000.0, dark_hz=2800.0):
    reseed("reverb-ir")
    n = int(length * SR)
    t = secs(n)
    decay = 10 ** (-3 * t / rt60)
    ir = []
    for _ in range(2):
        w = noise(n)
        mix = np.clip(t / (rt60 * 0.6), 0, 1)
        x = (filt(w, "lowpass", bright_hz) * (1 - mix) + filt(w, "lowpass", dark_hz) * mix) * decay
        x = filt(x, "highpass", 150)
        x[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
        ir.append(x)
    ir = np.pad(np.vstack(ir), ((0, 0), (int(predelay * SR), 0)))[:, :n]
    return ir / np.sqrt(np.sum(ir**2) / 2)


def reverb(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    l_in = x[0] + 0.35 * x[1]
    r_in = x[1] + 0.35 * x[0]
    return np.vstack([signal.oaconvolve(l_in, ir[0])[:N], signal.oaconvolve(r_in, ir[1])[:N]])


# ---------------------------------------------------------------------------- metering

_K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def _kweighted_blocks(x: np.ndarray) -> np.ndarray:
    x = np.atleast_2d(x)
    y = signal.lfilter(*_K2, signal.lfilter(*_K1, x, axis=-1), axis=-1)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if y.shape[1] < blk:
        return np.array([])
    c = np.cumsum(np.pad(y**2, ((0, 0), (1, 0))), axis=1)
    starts = np.arange(0, y.shape[1] - blk + 1, hop)
    return ((c[:, starts + blk] - c[:, starts]) / blk).sum(axis=0)


def lufs(x: np.ndarray) -> float:
    """Integrated loudness, ITU-R BS.1770-4 (48 kHz coefficients), gated."""
    z = _kweighted_blocks(x)
    z = z[-0.691 + 10 * np.log10(z + 1e-20) > -70] if len(z) else z
    if not len(z):
        return -np.inf
    rel = -0.691 + 10 * np.log10(np.mean(z)) - 10
    z = z[(-0.691 + 10 * np.log10(z)) > rel]
    return float(-0.691 + 10 * np.log10(np.mean(z)))


def momentary_max(x: np.ndarray) -> float:
    z = _kweighted_blocks(x)
    return float(-0.691 + 10 * np.log10(np.max(z) + 1e-20)) if len(z) else -np.inf


def true_peak(x: np.ndarray) -> float:
    return float(20 * np.log10(np.max(np.abs(signal.resample_poly(x, 4, 1, axis=-1))) + 1e-12))


def limiter(x: np.ndarray, ceiling_db=-1.0, lookahead=0.004, release=0.09) -> np.ndarray:
    """Look-ahead brickwall limiter with 4x oversampled (true-peak) detection."""
    ceil = db(ceiling_db)
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(axis=0)
    tp = up[: (len(up) // 4) * 4].reshape(-1, 4).max(axis=1)
    tp = np.pad(tp, (0, x.shape[1] - len(tp)), mode="edge")
    req = np.minimum(1.0, ceil / np.maximum(tp, 1e-12))
    w = max(1, int(lookahead * SR))
    g = minimum_filter1d(req, size=w, origin=-(w // 2), mode="nearest")
    g = uniform_filter1d(g, size=w, origin=(w - 1) // 2, mode="nearest")
    g = np.minimum(g, req)
    a = np.exp(-1 / (release * SR))
    out = g.copy()
    for i in range(1, len(out)):
        if out[i] > out[i - 1]:
            out[i] = out[i - 1] * a + out[i] * (1 - a)
    return x * out


# ---------------------------------------------------------------------------- the design

STEMS = ("amb", "sig", "fx", "ui", "impact")


def design_app():
    buses = {k: Bus(k) for k in STEMS}
    rev = {k: Bus("rev:" + k) for k in STEMS}
    events = []

    def put(stem, x, t, pan=0.0, gain=1.0, send=0.0):
        buses[stem].add(x, t, pan=pan, gain=gain)
        if send:
            rev[stem].add(x, t, pan=pan, gain=gain * send)

    def ev(t, what):
        events.append({"t": round(float(t), 4), "event": what})

    def swish(t, d=0.34, f0=1300, f1=4000, pan=-0.3, gain=0.32):
        put("fx", whoosh(d, peak=0.28, f0=f0, f1=f1, pan0=pan, pan1=pan + 0.25, width_oct=1.3), t - 0.03, gain=gain, send=0.15)

    def click(t, label, gain=0.75, pan=0.15):
        put("ui", ui_click(1.0), t, pan=pan, gain=gain, send=0.12)
        ev(t, f"tap: {label}")

    def move(t0, t1, f0=260, f1=2000, pan0=-0.45, pan1=0.45, gain=0.7, peak=0.42, label=""):
        d = t1 - t0 + 0.08
        put("fx", whoosh(d, peak=peak, f0=f0, f1=f1, pan0=pan0, pan1=pan1, width_oct=1.6), t0, gain=gain, send=0.15)
        if label:
            ev(t0 + peak * d, label)

    # ---- room tone under everything
    reseed("ambience")
    put("amb", ambience(DUR, lambda u: np.clip(u / 0.02, 0, 1) * (1 - 0.6 * np.clip((u - 0.95) / 0.04, 0, 1))), 0.0)

    # ---- hook: Week 1, then Week 6 beside it at the same weight; its segments turn, the insight lands
    reseed("hook")
    put("fx", whoosh(0.5, peak=0.2, f0=600, f1=2600, pan0=0.0, pan1=0.2, width_oct=1.4), CUE["card"], gain=0.28, send=0.2)
    g0, g1 = CUE["glide"]
    put("fx", whoosh(g1 - g0 + 0.1, peak=0.45, f0=400, f1=1500, pan0=0.0, pan1=0.3, width_oct=1.3), g0, gain=0.3, send=0.15)
    swish(CUE["same"] + 0.1, pan=-0.45)
    k0, k1 = CUE["week6"]
    put("fx", whoosh(k1 - k0 + 0.1, peak=0.35, f0=700, f1=2200, pan0=0.75, pan1=0.45, width_oct=1.3), k0, gain=0.34, send=0.2)
    ev(k0, "Week 6 card slides in")
    put("ui", pop(0.09), CUE["equals"] + 0.06, pan=0.3, gain=0.4, send=0.25)
    ev(CUE["equals"], "= pop")
    for i, t in enumerate(CUE["flips"]):
        put("fx", whoosh(0.34, peak=0.3, f0=1500, f1=3800, pan0=0.45, pan1=0.6, width_oct=1.1), t, gain=0.15, send=0.25)
        put("fx", glint(0.2, pan0=0.45, pan1=0.6, density=110.0), t + 0.05, gain=0.1 + 0.015 * i, send=0.4)
    ev(CUE["flips"][0], "Week 6 segments turn: four soft glints, uneven")
    put("fx", pressure(0.7, peak=0.5), CUE["different"] - 0.45, gain=0.4)
    put("fx", reverse_swell(0.45), CUE["different"] - 0.42, gain=0.28)
    put("impact", impact(0.45), CUE["different"] + 0.05, gain=0.55, send=0.45)
    swish(CUE["different"] + 0.05, f0=1100, f1=3600, pan=-0.4, gain=0.3)
    ev(CUE["different"] + 0.05, "reveal: Different story.")

    # ---- the sheet rises into the brand
    reseed("sheet")
    s0, s1 = CUE["sheet"]
    put("fx", riser(s1 - s0 + 0.35, f0=500, f1=6500, curve=2.4), s0 - 0.35, gain=0.35)
    move(s0, s1, f0=180, f1=2200, pan0=0, pan1=0, gain=0.8, peak=0.4, label="sheet whoosh crest")
    put("fx", pressure(s1 - s0 + 0.1, peak=0.45), s0, gain=0.45)
    put("impact", impact(0.4), s1 - 0.04, gain=0.4, send=0.4)

    # ---- the 8 draws: airy sweep along the ribbon, heart pop, wordmark thock
    reseed("brand")
    d0, d1 = CUE["draw"]
    put("sig", swirl(d1 - d0 + 0.1, rate0=1.2, rate1=0.6, f0=1800, f1=900, width=0.5), d0, gain=0.6, send=0.35)
    ev(d0, "the 8 draws: airy sweep")
    put("ui", pop(0.1), CUE["heart"], gain=0.55, send=0.3)
    ev(CUE["heart"], "heart pop")
    put("sig", thock(0.8), CUE["word"], gain=0.6, send=0.45)
    f0_, f1_ = CUE["fly"]
    move(f0_, f1_, f0=2400, f1=900, pan0=-0.1, pan1=0.45, gain=0.45, peak=0.55, label="mark flies into the phone")
    swish(CUE["brand_head"] + 0.1, pan=-0.45)
    click(CUE["tap1"], "Get started")

    # ---- the button blooms into the dark Measure section
    reseed("wipe")
    p0, p1 = CUE["wipe"]
    move(p0, p1, f0=300, f1=2600, pan0=0.4, pan1=-0.1, gain=0.85, peak=0.45, label="bloom into Measure")
    put("fx", pressure(p1 - p0 + 0.2, peak=0.5), p0, gain=0.55)
    put("impact", impact(0.6), p1 - 0.05, gain=0.6, send=0.5)
    ev(p1 - 0.05, "impact: Measure")

    # ---- measure: headline, the scale rises, eight contacts light up, the chip
    reseed("measure")
    swish(CUE["measure_head"] + 0.05, d=0.42, pan=-0.5, gain=0.3)  # one sweep for the first two lines
    swish(CUE["measure_head"] + 0.37, d=0.3, f0=1500, f1=4600, pan=-0.45, gain=0.24)  # "See more."
    a0, a1 = CUE["scale"]
    put("fx", pressure(a1 - a0, peak=0.4), a0, gain=0.5)
    move(a0, a1 - 0.2, f0=200, f1=1400, pan0=0.3, pan1=0.35, gain=0.45, peak=0.4)
    for i, dt in enumerate(CONTACT_AT):
        t = CUE["contacts"] + dt + _rng.normal(0, 0.006)
        put("ui", filt(tick(1.1 + 0.08 * i), "highpass", 1800 + 260 * i), t, pan=0.25 + 0.03 * i, gain=0.32 + 0.02 * i, send=0.45)
        put("fx", glint(0.18, pan0=0.2, pan1=0.45, density=120.0), t, gain=0.12, send=0.4)
    ev(CUE["contacts"], "eight contact glints (feet, then hands, uneven), each brighter")
    put("fx", filt(glint(0.7, pan0=0.1, pan1=0.6, density=90.0), "highpass", 2500), CUE["contacts"] + 1.05, gain=0.2, send=0.4)
    put("ui", pop(0.09), CUE["chip"] + 0.05, gain=0.35, send=0.2)
    m0, m1 = CUE["measure_out"]
    move(m0, m1, f0=220, f1=1800, pan0=0, pan1=0, gain=0.75, peak=0.4, label="Measure slides away")

    # ---- results: the phone rises, five body parts fill with callouts, save
    reseed("results")
    q0, q1 = CUE["phone_in"]
    move(q0, q1, f0=240, f1=1600, pan0=0.4, pan1=0.3, gain=0.5, peak=0.35)
    g0, dg = CUE["segments"]
    for i, j in enumerate((0, 0.035, -0.03, 0.025, -0.02)):  # small offsets keep the five from pulsing
        t = g0 + i * dg + j
        put("ui", filt(tick(0.9), "lowpass", 7000), t, pan=0.35, gain=0.3, send=0.3)
        put("sig", thock(0.32 + 0.06 * (i == 2)), t + 0.01, gain=0.32, send=0.35)
        put("fx", whoosh(0.3, peak=0.3, f0=1500, f1=3800, pan0=0.4, pan1=0.6, width_oct=1.2), t, gain=0.16, send=0.15)
    ev(g0, "segments fill: five soft taps with callouts")
    click(CUE["tap2"], "Save my results")
    u0, u1 = CUE["push1"]
    move(u0, u1, f0=1400, f1=500, pan0=0.45, pan1=-0.15, gain=0.4, peak=0.4, label="push → Dashboard")

    # ---- dashboard: sparklines draw, view full report
    reseed("dashboard")
    k0, k1 = CUE["sparks"]
    put("fx", whoosh(k1 - k0, peak=0.6, f0=1800, f1=5200, pan0=0.15, pan1=0.5, width_oct=1.0), k0, gain=0.2, send=0.25)
    click(CUE["tap3"], "View full report")
    v0, v1 = CUE["push2"]
    move(v0, v1, f0=1400, f1=500, pan0=0.45, pan1=-0.15, gain=0.4, peak=0.4, label="push → Full Report")

    # ---- report: scroll with wheel detents, save as PDF, the PDF flies to the coach
    reseed("report")
    c0, c1 = CUE["scroll"]
    put("fx", whoosh(c1 - c0, peak=0.5, f0=1600, f1=420, pan0=0.35, pan1=0.2, width_oct=1.4), c0, gain=0.35)
    for t in scroll_ticks(c0, c1, max_rate=14.0):
        put("ui", filt(tick(0.75), "lowpass", 6500), t, pan=0.3, gain=0.18)
    ev(c0, "report scroll: detents follow the scroll speed")
    click(CUE["tap4"], "Save as PDF")
    x0, x1 = CUE["pdf"]
    move(x0, x1, f0=2600, f1=700, pan0=0.4, pan1=-0.6, gain=0.5, peak=0.45, label="PDF flight to the coach")
    put("ui", pop(0.1), CUE["coach"], gain=0.45, send=0.25)
    put("fx", glint(0.35, pan0=-0.6, pan1=-0.3, density=110.0), CUE["coach"] + 0.03, gain=0.18, send=0.4)

    # ---- goals + history
    reseed("pair")
    r0, r1 = CUE["pair"]
    move(r0, r0 + 0.5, f0=900, f1=300, pan0=0.4, pan1=-0.6, gain=0.4, peak=0.5)
    put("fx", pressure(r1 - r0, peak=0.4), r0 + 0.1, gain=0.4)
    move(r0 + 0.2, r1, f0=220, f1=1700, pan0=-0.3, pan1=0.3, gain=0.6, peak=0.45, label="Goals + History rise")
    l0, l1 = CUE["slider"]
    put("fx", whoosh(l1 - l0, peak=0.5, f0=700, f1=2600, pan0=-0.45, pan1=-0.15, width_oct=0.9), l0, gain=0.26, send=0.15)
    put("ui", filt(tick(0.8), "lowpass", 6000), l1, pan=-0.2, gain=0.3)
    ev(l0, "goal slider travels")
    h0, h1 = CUE["line"]
    put("fx", whoosh(h1 - h0, peak=0.55, f0=1500, f1=4800, pan0=0.1, pan1=0.45, width_oct=1.0), h0, gain=0.22, send=0.2)
    put("fx", glint(h1 - h0, pan0=0.1, pan1=0.45, density=22.0), h0, gain=0.14, send=0.35)
    ev(h0, "history line draws")

    # ---- end card
    reseed("end")
    e0, e1 = CUE["to_end"]
    move(e0, e1, f0=300, f1=2400, pan0=0.3, pan1=-0.2, gain=0.7, peak=0.45)
    put("fx", reverse_swell(0.6), CUE["end_hit"] - 0.62, gain=0.45)
    put("impact", impact(0.95), CUE["end_hit"], gain=1.0, send=0.4)
    ev(CUE["end_hit"], "impact: end card")
    for i in range(3):
        swish(CUE["end_hit"] + 0.08 + i * 0.14, d=0.3, pan=-0.5, gain=0.22)
    put("sig", thock(0.6), CUE["end_hit"] + 0.15, gain=0.45, send=0.5)
    put("fx", glint(0.5, pan0=-0.5, pan1=0.0, density=100.0), CUE["stores"], gain=0.2, send=0.4)
    return buses, rev, events


# Scale film picture events (seconds), from scale-film.js: card progress p maps to time linearly over
# each card's window, so card-relative timings are converted here.
def _card(t0, t1):
    return lambda p: t0 + (t1 - t0) * p


_HOOK = _card(0.1, 4.1)
_HERO = _card(4.55, 8.0)
_SEG = _card(11.85, 15.4)
_CMP = _card(15.75, 19.4)
_STEPS = _card(19.95, 23.1)
_DISP = _card(24.1, 27.4)
_SPECS = _card(27.45, 29.35)
_END = _card(29.65, 32.0)
SCALE = {
    "lcd": (_HOOK(0.0), _HOOK(0.30)),  # the weight-only LCD wakes and its digits roll to 72.4
    "lock": (_HOOK(0.33), _HOOK(0.39)),  # it blinks twice to lock
    "one": _HOOK(0.04),  # "One number."
    "split": (_HOOK(0.40), _HOOK(0.62)),  # the two story cards slide out, left and right
    "bars": (_HOOK(0.55), _HOOK(0.80)),  # their bars grow
    "two": _HOOK(0.46),  # "Two stories." — the insight
    "sheet": (4.2, 4.95),  # the sage hero section rises over the hook
    "rise": (_HERO(0.0), _HERO(0.45)),  # the scale rises and settles
    "hero_head": _HERO(0.12),  # four headline lines
    "wake": _HERO(0.33),  # the scale's display wakes
    "chip": _HERO(0.62),  # "8 contacts · 5 body segments"
    "dive": (8.45, 9.05),  # the camera falls into the black plate
    "arrive": 9.08,  # out of the glass into the dark contacts section
    "ct_head": (9.3, 10.05),  # "Four for your feet." / "Four for your hands."
    "contacts": [9.42, 9.53, 9.68, 9.76, 10.22, 10.36],  # foot plates, then the hand pads
    "scan": (10.6, 11.15),  # the measurement sweeps up the plate
    "fold": (11.3, 11.95),  # the dark frame folds into the segment card
    "seg_head": _SEG(0.02),
    "segments": [_SEG(0.22 + i * 0.126) for i in range(5)],  # five segments light up
    "page": (15.3, 16.0),  # scroll down to the comparison
    "cmp_head": _CMP(0.02),
    "cards": [_CMP(0.12), _CMP(0.21), _CMP(0.30)],  # three cards rise
    "scroll": (17.0, 19.2),  # the camera scrolls down the table
    "focus": (19.2, 19.9),  # intelli8 column emphasised
    "dark": (19.6, 20.3),  # the dark section rises
    "photo": (_STEPS(0.0), _STEPS(0.35)),
    "steps_head": _STEPS(0.08),
    "steps": [_STEPS(0.45 + i * 0.12) for i in range(4)],
    "step_hi": (22.2, 23.9),  # the active step travels 01 → 04
    "slide": (23.9, 24.5),  # across to the display
    "disp_head": _DISP(0.08),
    "digits": (_DISP(0.22), _DISP(0.38)),  # the status row and weight digits flicker on
    "readings": (_DISP(0.38), _DISP(0.84)),  # six readings light one at a time
    "sage": (27.2, 27.9),  # the specifications rise
    "rows": (_SPECS(0.10), _SPECS(0.90)),
    "to_end": (29.4, 30.1),  # the end section scrolls up
    "end_hit": 30.12,
    "cta": _END(0.0) + 1.35,  # buttons and store pills (cta 31.0 → 32.2)
    "price": 31.65,
}


def design_scale():
    buses = {k: Bus(k) for k in STEMS}
    rev = {k: Bus("rev:" + k) for k in STEMS}
    events = []
    C = SCALE

    def put(stem, x, t, pan=0.0, gain=1.0, send=0.0):
        buses[stem].add(x, t, pan=pan, gain=gain)
        if send:
            rev[stem].add(x, t, pan=pan, gain=gain * send)

    def ev(t, what):
        events.append({"t": round(float(t), 4), "event": what})

    def swish(t, d=0.34, f0=1300, f1=4000, pan=-0.3, gain=0.3):
        put("fx", whoosh(d, peak=0.28, f0=f0, f1=f1, pan0=pan, pan1=pan + 0.25, width_oct=1.3), t - 0.03, gain=gain, send=0.15)

    def move(t0, t1, f0=260, f1=2000, pan0=-0.45, pan1=0.45, gain=0.7, peak=0.42, label=""):
        d = t1 - t0 + 0.08
        put("fx", whoosh(d, peak=peak, f0=f0, f1=f1, pan0=pan0, pan1=pan1, width_oct=1.6), t0, gain=gain, send=0.15)
        if label:
            ev(t0 + peak * d, label)

    def land(t, size=0.5, gain=0.5, label=""):
        put("fx", reverse_swell(0.4), t - 0.4, gain=0.25)
        put("impact", impact(size), t, gain=gain, send=0.4)
        if label:
            ev(t, label)

    # ---- room tone: a touch more air in the dark sections
    reseed("ambience")
    put("amb", ambience(DUR, lambda u: np.clip(u / 0.02, 0, 1) * (1 - 0.6 * np.clip((u - 0.95) / 0.04, 0, 1))), 0.0)

    # ---- hook: a weight-only LCD settles, then the one number splits into two stories
    reseed("hook")
    l0, l1 = C["lcd"]
    put("fx", filt(glint(l1 - l0, pan0=0.25, pan1=0.4, density=46.0), "bandpass", [1800, 7000]), l0, gain=0.22, send=0.2)
    put("fx", whoosh(0.5, peak=0.2, f0=600, f1=2600, pan0=0.35, pan1=0.45, width_oct=1.4), l0, gain=0.24, send=0.2)
    ev(l0, "LCD wakes: digits roll as a soft electric rustle (no per-digit ticks)")
    k0, k1 = C["lock"]
    put("ui", filt(tick(0.9), "lowpass", 6000), k0, pan=0.35, gain=0.32, send=0.2)
    put("ui", filt(tick(0.75), "lowpass", 5200), k1 + 0.012, pan=0.35, gain=0.24, send=0.2)
    ev(k0, "two soft lock clicks as the reading settles")
    swish(C["one"] + 0.12, pan=-0.45)
    s0, s1 = C["split"]
    put("fx", pressure(0.6, peak=0.5), s0 - 0.35, gain=0.35)
    put("fx", whoosh(s1 - s0 + 0.1, peak=0.35, f0=900, f1=2400, pan0=0.3, pan1=-0.05, width_oct=1.3), s0, gain=0.34, send=0.2)
    put("fx", whoosh(s1 - s0 + 0.16, peak=0.4, f0=800, f1=2200, pan0=0.4, pan1=0.75, width_oct=1.3), s0 + 0.06, gain=0.3, send=0.2)
    ev(s0, "the stories split: two whooshes, left and right")
    put("impact", impact(0.4), C["two"] + 0.08, gain=0.45, send=0.45)
    swish(C["two"] + 0.08, f0=1100, f1=3600, pan=-0.4, gain=0.28)
    ev(C["two"] + 0.08, "reveal: Two stories.")
    b0, b1 = C["bars"]
    put("fx", whoosh(b1 - b0, peak=0.45, f0=1600, f1=4400, pan0=0.2, pan1=0.55, width_oct=0.9), b0, gain=0.16, send=0.2)

    # ---- the sage hero section rises; the scale arrives; its display wakes
    reseed("sheet")
    h0, h1 = C["sheet"]
    put("fx", riser(h1 - h0 + 0.35, f0=500, f1=6500, curve=2.4), h0 - 0.35, gain=0.32)
    move(h0, h1, f0=180, f1=2200, pan0=0, pan1=0, gain=0.8, peak=0.4, label="sheet whoosh crest")
    put("fx", pressure(h1 - h0 + 0.1, peak=0.45), h0, gain=0.45)
    land(h1 - 0.03, size=0.45, gain=0.42)
    reseed("hero")
    r0, r1 = C["rise"]
    put("fx", pressure(r1 - r0, peak=0.45), r0, gain=0.5)
    move(r0, r1 - 0.3, f0=200, f1=1300, pan0=0.4, pan1=0.35, gain=0.5, peak=0.45, label="the scale rises")
    put("sig", thock(0.55), r1 - 0.28, gain=0.42, send=0.45)
    swish(C["hero_head"] + 0.1, d=0.42, pan=-0.5, gain=0.3)
    swish(C["hero_head"] + 0.55, d=0.32, f0=1500, f1=4600, pan=-0.45, gain=0.22)
    put("fx", filt(glint(0.55, pan0=0.3, pan1=0.45, density=150.0), "highpass", 2600), C["wake"], gain=0.22, send=0.45)
    put("fx", reverse_swell(0.3, hp=3500), C["wake"] - 0.28, gain=0.18)
    ev(C["wake"], "display wakes: bright shimmer")
    put("ui", pop(0.09), C["chip"], gain=0.36, send=0.22)

    # ---- the dive into the black plate, out into the contacts
    reseed("dive")
    d0, d1 = C["dive"]
    put("fx", riser(d1 - d0 + 0.2, f0=300, f1=7000, curve=3.0), d0 - 0.2, gain=0.36)
    move(d0, d1, f0=2400, f1=200, pan0=0.3, pan1=0.0, gain=0.85, peak=0.7, label="dive through the glass")
    put("fx", pressure(d1 - d0 + 0.25, peak=0.75), d0, gain=0.6)
    land(C["arrive"], size=0.7, gain=0.62, label="impact: into the contacts")

    # ---- contacts: feet, then hands; the measurement sweeps up
    reseed("contacts")
    swish(C["ct_head"][0] + 0.1, d=0.38, pan=0.35, gain=0.28)
    swish(C["ct_head"][1] + 0.1, d=0.32, f0=1500, f1=4600, pan=0.4, gain=0.24)
    for i, t in enumerate(C["contacts"]):
        hand = i >= 4
        put("ui", filt(tick(1.05 + 0.08 * i), "highpass", 1700 + 300 * i), t, pan=-0.25 + 0.08 * i, gain=0.3 + 0.025 * i, send=0.45)
        put("fx", glint(0.2 if not hand else 0.32, pan0=-0.3, pan1=0.0, density=130.0), t, gain=0.12 + 0.05 * hand, send=0.4)
    ev(C["contacts"][0], "six contact glints: four foot plates (uneven), then both hand pads")
    c0, c1 = C["scan"]
    put("fx", whoosh(c1 - c0 + 0.1, peak=0.55, f0=900, f1=5200, pan0=-0.25, pan1=-0.2, width_oct=0.8), c0, gain=0.26, send=0.3)
    put("fx", filt(glint(c1 - c0, pan0=-0.3, pan1=-0.15, density=70.0), "highpass", 3000), c0, gain=0.14, send=0.4)
    ev(c0, "measurement sweep")
    f0_, f1_ = C["fold"]
    move(f0_, f1_, f0=2200, f1=500, pan0=0.0, pan1=-0.3, gain=0.6, peak=0.55, label="dark frame folds into the card")
    put("sig", thock(0.6), f1_ - 0.02, gain=0.45, send=0.4)

    # ---- segments: five soft fills, uneven, no ticks (they would pulse)
    reseed("segments")
    swish(C["seg_head"] + 0.1, d=0.42, pan=0.45, gain=0.28)
    for i, (t, j) in enumerate(zip(C["segments"], (0, 0.05, -0.04, 0.03, -0.02))):
        put("fx", whoosh(0.42, peak=0.35, f0=1400, f1=3600, pan0=-0.35 + 0.12 * i, pan1=-0.2 + 0.12 * i, width_oct=1.0), t + j, gain=0.16 + 0.02 * (i == 2), send=0.3)
        put("fx", glint(0.22, pan0=-0.4 + 0.12 * i, pan1=-0.25 + 0.12 * i, density=90.0), t + j + 0.04, gain=0.1, send=0.45)
    ev(C["segments"][0], "five segments light: soft airy fills with glints")

    # ---- page scroll to the comparison; cards; the camera scrolls the table
    reseed("compare")
    p0, p1 = C["page"]
    move(p0, p1, f0=1500, f1=300, pan0=0.0, pan1=0.0, gain=0.62, peak=0.45, label="page scroll")
    swish(C["cmp_head"] + 0.12, d=0.42, pan=-0.45, gain=0.26)
    for i, t in enumerate(C["cards"]):
        put("fx", whoosh(0.4, peak=0.35, f0=500, f1=1600, pan0=-0.4 + 0.4 * i, pan1=-0.35 + 0.4 * i, width_oct=1.2), t + (0, 0.03, -0.02)[i], gain=0.2, send=0.15)
    put("fx", whoosh(0.5, peak=0.5, f0=1200, f1=3800, pan0=0.3, pan1=0.5, width_oct=1.0), C["cards"][2] + 0.15, gain=0.16, send=0.25)
    q0, q1 = C["scroll"]
    put("fx", whoosh(q1 - q0, peak=0.5, f0=1400, f1=420, pan0=0.1, pan1=0.0, width_oct=1.4), q0, gain=0.28)
    for t in scroll_ticks(q0, q1, max_rate=12.0):
        put("ui", filt(tick(0.7), "lowpass", 6200), t, pan=0.2, gain=0.15)
    ev(q0, "table scroll: detents follow the scroll speed")
    z0, z1 = C["focus"]
    put("fx", reverse_swell(z1 - z0, hp=1800), z0, gain=0.2)

    # ---- the dark section: photo, headline, four steps
    reseed("steps")
    k0, k1 = C["dark"]
    put("fx", riser(k1 - k0 + 0.3, f0=500, f1=6000, curve=2.4), k0 - 0.3, gain=0.28)
    move(k0, k1, f0=180, f1=2000, pan0=0, pan1=0, gain=0.78, peak=0.4, label="dark section rises")
    put("fx", pressure(k1 - k0 + 0.1, peak=0.45), k0, gain=0.45)
    land(k1 + 0.02, size=0.55, gain=0.48)
    put("fx", whoosh(C["photo"][1] - C["photo"][0], peak=0.4, f0=300, f1=1500, pan0=-0.45, pan1=-0.4, width_oct=1.3), C["photo"][0], gain=0.3, send=0.2)
    swish(C["steps_head"] + 0.15, d=0.42, pan=0.4, gain=0.26)
    swish(C["steps_head"] + 0.62, d=0.3, f0=1500, f1=4600, pan=0.45, gain=0.22)
    for i, (t, j) in enumerate(zip(C["steps"], (0, 0.04, -0.03, 0.02))):
        put("ui", filt(tick(0.7), "lowpass", 5000 + 400 * i), t + j, pan=0.4, gain=0.15, send=0.25)
    a0, a1 = C["step_hi"]
    put("fx", whoosh(a1 - a0, peak=0.5, f0=900, f1=2800, pan0=0.35, pan1=0.45, width_oct=0.9), a0, gain=0.15, send=0.2)
    m0, m1 = C["slide"]
    move(m0, m1, f0=1600, f1=500, pan0=0.4, pan1=-0.5, gain=0.5, peak=0.5, label="across to the display")

    # ---- the built-in display: flicker on, then six readings shimmer in
    reseed("display")
    swish(C["disp_head"] + 0.12, d=0.42, pan=0.4, gain=0.26)
    g0, g1 = C["digits"]
    for j, (dt, gn) in enumerate(((0.0, 0.2), (0.07, 0.12), (0.16, 0.24))):  # three uneven flickers
        put("fx", filt(glint(0.08, pan0=-0.3, pan1=-0.25, density=400.0), "highpass", 3500), g0 + dt, gain=gn, send=0.3)
    put("fx", filt(glint(g1 - g0, pan0=-0.3, pan1=-0.2, density=160.0), "highpass", 2500), g0 + 0.18, gain=0.16, send=0.4)
    ev(g0, "display flickers on")
    e0, e1 = C["readings"]
    put("fx", filt(glint(e1 - e0, pan0=-0.35, pan1=0.35, density=60.0), "bandpass", [2200, 9000]), e0, gain=0.22, send=0.45)
    put("fx", whoosh(e1 - e0, peak=0.55, f0=1600, f1=4800, pan0=-0.3, pan1=0.35, width_oct=0.8), e0, gain=0.13, send=0.25)
    ev(e0, "six readings: one continuous shimmer, no per-reading ticks")

    # ---- specifications
    reseed("specs")
    y0, y1 = C["sage"]
    put("fx", riser(y1 - y0 + 0.3, f0=500, f1=6000, curve=2.4), y0 - 0.3, gain=0.26)
    move(y0, y1, f0=180, f1=2000, pan0=0, pan1=0, gain=0.72, peak=0.4, label="specifications rise")
    land(y1 + 0.02, size=0.45, gain=0.4)
    w0, w1 = C["rows"]
    put("fx", filt(glint(w1 - w0, pan0=0.15, pan1=0.4, density=30.0), "lowpass", 6500), w0, gain=0.2, send=0.25)
    put("fx", whoosh(w1 - w0, peak=0.4, f0=1200, f1=2800, pan0=0.2, pan1=0.4, width_oct=1.2), w0, gain=0.12)

    # ---- end
    reseed("end")
    n0, n1 = C["to_end"]
    move(n0, n1, f0=300, f1=2400, pan0=0.0, pan1=0.0, gain=0.7, peak=0.45)
    put("fx", reverse_swell(0.6), C["end_hit"] - 0.62, gain=0.42)
    put("impact", impact(0.95), C["end_hit"], gain=1.0, send=0.4)
    ev(C["end_hit"], "impact: end")
    swish(C["end_hit"] + 0.25, d=0.42, pan=-0.5, gain=0.24)
    swish(C["end_hit"] + 0.95, d=0.32, f0=1500, f1=4600, pan=-0.45, gain=0.2)
    put("ui", pop(0.1), C["cta"], gain=0.4, send=0.25)
    put("fx", glint(0.5, pan0=-0.5, pan1=0.0, density=100.0), C["cta"] + 0.15, gain=0.18, send=0.4)
    put("sig", thock(0.6), C["price"], gain=0.42, send=0.5)
    ev(C["price"], "price lands")
    return buses, rev, events


# IAM film picture events (seconds), from iam-film.js.
IAM = {
    "chips": (0.15, 1.3),  # twenty chips pop in as a diagonal wave
    "l1": 0.3,  # "Twenty athletes."
    "rings": (1.5, 2.45),  # readiness rings sweep across the squad
    "l2": 1.7,  # "Who needs a check-in today?" — the question
    "hugo": (2.7, 3.2),  # Hugo's chip lifts, the rest dim
    "tip": 2.95,  # tooltip pops
    "sheet": (3.55, 4.25),  # the dark IAM section rises
    "in_head": 4.35,  # IAM. / See the whole team, support each person.
    "window": (4.5, 5.6),  # the dashboard window rises
    "to_work": (7.15, 8.05),  # the window glides to its working pose, intro copy leaves
    "build": (7.6, 9.2),  # command center tiles count up
    "zoom": (9.75, 10.4),  # closer look at the priority roster
    "unzoom": (10.55, 11.0),
    "clicks": [10.9, 14.5, 18.1],  # cursor clicks: Match Readiness, Roster, Sander Vos
    "views": [11.15, 14.75, 18.35, 21.95],  # view copy changes
    "readiness": (12.0, 13.4),  # athlete cards drop into their tiers
    "rest": (13.5, 14.0),  # focus on Consider Resting
    "roster": (15.2, 16.8),  # roster rows
    "hrv": (18.9, 20.4),  # HRV chart draws
    "sleep": (22.1, 23.6),  # sleep bars
    "athlete_to_sleep": (21.8, 22.15),
    "out": (25.35, 25.95),  # the window leaves
    "end_hit": 26.12,
    "ctas": 26.95,
    "site": 27.25,
}


def design_iam():
    buses = {k: Bus(k) for k in STEMS}
    rev = {k: Bus("rev:" + k) for k in STEMS}
    events = []
    C = IAM

    def put(stem, x, t, pan=0.0, gain=1.0, send=0.0):
        buses[stem].add(x, t, pan=pan, gain=gain)
        if send:
            rev[stem].add(x, t, pan=pan, gain=gain * send)

    def ev(t, what):
        events.append({"t": round(float(t), 4), "event": what})

    def swish(t, d=0.34, f0=1300, f1=4000, pan=-0.3, gain=0.3):
        put("fx", whoosh(d, peak=0.28, f0=f0, f1=f1, pan0=pan, pan1=pan + 0.25, width_oct=1.3), t - 0.03, gain=gain, send=0.15)

    def move(t0, t1, f0=260, f1=2000, pan0=-0.45, pan1=0.45, gain=0.7, peak=0.42, label=""):
        d = t1 - t0 + 0.08
        put("fx", whoosh(d, peak=peak, f0=f0, f1=f1, pan0=pan0, pan1=pan1, width_oct=1.6), t0, gain=gain, send=0.15)
        if label:
            ev(t0 + peak * d, label)

    reseed("ambience")
    put("amb", ambience(DUR, lambda u: np.clip(u / 0.02, 0, 1) * (1 - 0.6 * np.clip((u - 0.95) / 0.04, 0, 1))), 0.0)

    # ---- hook: the squad appears, takes its colours, one athlete stands out
    reseed("hook")
    c0, c1 = C["chips"]
    put("fx", filt(glint(c1 - c0, pan0=0.2, pan1=0.6, density=40.0), "bandpass", [1500, 6500]), c0, gain=0.26, send=0.2)
    put("fx", whoosh(c1 - c0, peak=0.35, f0=700, f1=2200, pan0=0.25, pan1=0.6, width_oct=1.2), c0, gain=0.2, send=0.15)
    ev(c0, "squad appears: one granular wave, no per-chip pops")
    swish(C["l1"] + 0.1, pan=-0.45)
    r0, r1 = C["rings"]
    put("fx", filt(glint(r1 - r0, pan0=0.2, pan1=0.6, density=70.0), "highpass", 2600), r0, gain=0.2, send=0.4)
    put("fx", pressure(0.6, peak=0.5), C["l2"] - 0.4, gain=0.35)
    put("impact", impact(0.4), C["l2"] + 0.12, gain=0.42, send=0.45)
    swish(C["l2"] + 0.1, f0=1100, f1=3600, pan=-0.4, gain=0.28)
    ev(C["l2"] + 0.12, "the question lands")
    h0, h1 = C["hugo"]
    put("fx", reverse_swell(h1 - h0, hp=2200), h0, gain=0.22)
    put("sig", thock(0.5), h1 - 0.12, gain=0.4, send=0.45)
    put("ui", pop(0.09), C["tip"], gain=0.36, send=0.22)
    ev(C["tip"], "Hugo's tooltip")

    # ---- the dark section rises; IAM; the window
    reseed("sheet")
    s0, s1 = C["sheet"]
    put("fx", riser(s1 - s0 + 0.35, f0=500, f1=6500, curve=2.4), s0 - 0.35, gain=0.32)
    move(s0, s1, f0=180, f1=2200, pan0=0, pan1=0, gain=0.8, peak=0.4, label="dark section rises")
    put("fx", pressure(s1 - s0 + 0.1, peak=0.45), s0, gain=0.45)
    put("impact", impact(0.5), s1 - 0.02, gain=0.45, send=0.4)
    swish(C["in_head"] + 0.1, d=0.42, pan=-0.5, gain=0.3)
    swish(C["in_head"] + 0.5, d=0.32, f0=1500, f1=4600, pan=-0.45, gain=0.22)
    w0, w1 = C["window"]
    put("fx", pressure(w1 - w0, peak=0.45), w0, gain=0.45)
    move(w0, w1 - 0.3, f0=200, f1=1400, pan0=0.35, pan1=0.3, gain=0.5, peak=0.45, label="the window rises")
    put("sig", thock(0.5), w1 - 0.3, gain=0.4, send=0.4)

    # ---- the working view: the window glides over, the command center fills, a closer look
    reseed("command")
    g0, g1 = C["to_work"]
    move(g0, g1, f0=1600, f1=400, pan0=0.4, pan1=0.0, gain=0.55, peak=0.5, label="window to working pose")
    b0, b1 = C["build"]
    put("fx", filt(glint(b1 - b0, pan0=0.1, pan1=0.4, density=55.0), "bandpass", [2000, 8000]), b0, gain=0.2, send=0.35)
    put("fx", whoosh(b1 - b0, peak=0.45, f0=1400, f1=4200, pan0=0.1, pan1=0.4, width_oct=0.9), b0, gain=0.12)
    ev(b0, "tiles count up: data shimmer")
    z0, z1 = C["zoom"]
    put("fx", whoosh(z1 - z0 + 0.1, peak=0.5, f0=400, f1=1600, pan0=0.1, pan1=0.2, width_oct=1.3), z0, gain=0.3, send=0.15)
    u0, u1 = C["unzoom"]
    put("fx", whoosh(u1 - u0 + 0.1, peak=0.4, f0=1500, f1=500, pan0=0.2, pan1=0.1, width_oct=1.3), u0, gain=0.22)

    # ---- clicks between views, each view's copy, and what each view builds
    reseed("views")
    for i, t in enumerate(C["clicks"]):
        put("ui", ui_click(1.0), t, pan=0.1 + 0.05 * i, gain=0.7, send=0.12)
        put("fx", whoosh(0.32, peak=0.3, f0=1800, f1=4200, pan0=0.1, pan1=0.35, width_oct=1.1), t + 0.03, gain=0.14, send=0.15)
        ev(t, f"click {i + 1}")
    for i, t in enumerate(C["views"]):
        swish(t + 0.1, d=0.38, pan=-0.5, gain=0.24 - 0.01 * i)
    q0, q1 = C["readiness"]
    put("fx", filt(glint(q1 - q0, pan0=0.0, pan1=0.5, density=36.0), "lowpass", 7000), q0, gain=0.22, send=0.3)
    put("fx", whoosh(q1 - q0, peak=0.4, f0=600, f1=1800, pan0=0.0, pan1=0.4, width_oct=1.2), q0, gain=0.14)
    ev(q0, "athlete cards drop into tiers: soft rustle")
    e0, e1 = C["rest"]
    put("fx", reverse_swell(e1 - e0, hp=2000), e0, gain=0.2)
    o0, o1 = C["roster"]
    put("fx", whoosh(o1 - o0, peak=0.5, f0=1300, f1=420, pan0=0.2, pan1=0.1, width_oct=1.4), o0, gain=0.22)
    for t in scroll_ticks(o0, o1, max_rate=11.0):
        put("ui", filt(tick(0.7), "lowpass", 6000), t, pan=0.2, gain=0.13)
    ev(o0, "roster rows: detents with the speed of the rows")
    v0, v1 = C["hrv"]
    put("fx", whoosh(v1 - v0, peak=0.55, f0=1500, f1=4800, pan0=-0.1, pan1=0.45, width_oct=1.0), v0, gain=0.22, send=0.2)
    put("fx", glint(v1 - v0, pan0=-0.1, pan1=0.45, density=24.0), v0, gain=0.14, send=0.35)
    ev(v0, "HRV chart draws")
    a0, a1 = C["athlete_to_sleep"]
    put("fx", whoosh(a1 - a0 + 0.2, peak=0.4, f0=1200, f1=500, pan0=0.3, pan1=-0.1, width_oct=1.3), a0, gain=0.3)
    y0, y1 = C["sleep"]
    put("fx", whoosh(y1 - y0, peak=0.45, f0=700, f1=2600, pan0=0.0, pan1=0.4, width_oct=0.9), y0, gain=0.2, send=0.15)
    put("fx", filt(glint(y1 - y0, pan0=0.0, pan1=0.4, density=30.0), "lowpass", 7500), y0, gain=0.14, send=0.3)

    # ---- end
    reseed("end")
    n0, n1 = C["out"]
    move(n0, n1, f0=300, f1=2400, pan0=0.3, pan1=-0.1, gain=0.65, peak=0.45)
    put("fx", reverse_swell(0.6), C["end_hit"] - 0.62, gain=0.42)
    put("impact", impact(0.9), C["end_hit"], gain=0.95, send=0.4)
    ev(C["end_hit"], "impact: end")
    swish(C["end_hit"] + 0.05, d=0.42, pan=-0.5, gain=0.24)
    put("ui", pop(0.1), C["ctas"], gain=0.4, send=0.25)
    put("fx", glint(0.5, pan0=-0.5, pan1=0.0, density=100.0), C["site"], gain=0.18, send=0.4)
    put("sig", thock(0.55), C["ctas"] + 0.05, gain=0.36, send=0.5)
    return buses, rev, events


# Scale product demo picture events (seconds), from demo/demo.js (60 s, explainer-default style).
DEMO = {
    "intro": 0.3,  # "Introducing" fades up
    "silk": (1.7, 2.65),  # the silk brand gradient wipes in
    "draw": (2.2, 3.3),  # the ribbon 8 draws itself
    "word": 3.0,  # wordmark settles
    "heart": 3.12,  # heart pops in the top loop
    # title lines: in, words, camera push, highlight sweep, dissolve out
    "titles": [
        (4.6, 4.95, (5.7, 7.0), (6.75, 7.25), 7.9),  # Your scale shows one number.
        (10.15, 10.35, (11.0, 12.3), (12.0, 12.5), 13.1),  # Eight contacts. Hands and feet.
        (19.6, 19.75, (20.4, 21.7), (21.4, 21.9), 22.5),  # Fat and muscle, in every segment.
        (30.6, 30.75, (31.4, 32.7), (32.4, 32.9), 33.5),  # 24 measures. One clear report.
        (41.3, 41.45, (42.1, 43.4), (43.1, 43.6), 44.2),  # Follow the change over time.
    ],
    "readout": 7.95,  # the weight-only readout rises in
    "readout_pull": (9.0, 9.9),
    "qchips": [9.25, 9.5],  # "Body fat ?", "Muscle ?"
    "feet": [13.6, 13.78, 14.0, 14.12],  # the four foot plates light, unevenly
    "to_bar": (14.3, 15.3),  # the camera glides up to the bar
    "pads": [15.42, 15.6],  # the hand pads light
    "scale_pull": (15.9, 17.1),
    "scale_chip": 17.0,  # "8 contacts · 5 body segments"
    "to_display": (17.9, 19.0),
    "flicker": [18.55, 18.6, 18.66, 18.72, 18.8],  # the display wakes (demo.js FLICK)
    "segments": [23.3, 24.14, 24.98, 25.82, 26.66],  # Your Results: the five segments fill
    "results_pull": (27.5, 28.9),
    "tap_save": 30.05,  # Save my results
    "bars": (33.83, 35.82),  # the report's bars grow
    "report_pull": (35.9, 36.6),
    "scroll": (36.3, 39.0),  # the report scrolls
    "to_pdf": (39.0, 39.6),
    "tap_pdf": 39.85,  # Save as PDF
    "pdf": 40.2,  # the PDF rises out of the button
    "shared": 40.85,  # → Shared with your coach
    "line": (44.6, 47.2),  # History: the body-fat line draws
    "points": [44.6, 45.49, 45.73, 45.9, 46.06, 46.28, 47.2],  # the pen reaches each weigh-in
    "history_pull": (47.2, 48.4),
    "closer": 50.2,  # silk again
    "use": 50.55,  # Track your [body fat / muscle / progress] at home.
    "swaps": [51.75, 52.7],
    "use_out": 53.6,
    "tagline": 54.0,  # Know more than your weight.
    "tag_hl": (54.6, 55.15),
    "end": 56.4,  # end card: the lockup
    "cta": 56.85,  # Body Composition Scale · S$98 · intelli8.ai
}


def design_demo():
    """Small, calm effects for a bright product demo: soft air under the camera moves, a brush under
    each highlight, uneven glints for the contacts, a crackle as the display wakes, real taps. No music:
    nothing tuned, no beat, and every repeated event is uneven in time and character."""
    buses = {k: Bus(k) for k in STEMS}
    rev = {k: Bus("rev:" + k) for k in STEMS}
    events = []
    C = DEMO

    def put(stem, x, t, pan=0.0, gain=1.0, send=0.0):
        buses[stem].add(x, t, pan=pan, gain=gain)
        if send:
            rev[stem].add(x, t, pan=pan, gain=gain * send)

    def ev(t, what):
        events.append({"t": round(float(t), 4), "event": what})

    def move(t0, t1, f0=220, f1=1600, pan0=-0.3, pan1=0.3, gain=0.5, peak=0.45, label=""):
        d = t1 - t0 + 0.1
        put("fx", whoosh(d, peak=peak, f0=f0, f1=f1, pan0=pan0, pan1=pan1, width_oct=1.6), t0, gain=gain, send=0.18)
        if label:
            ev(t0 + peak * d, label)

    def brush(t0, t1, pan=-0.35, gain=0.2):
        """A soft marker stroke for a highlight box sweeping left to right."""
        d = t1 - t0 + 0.12
        put("fx", whoosh(d, peak=0.55, f0=2400, f1=5200, pan0=pan, pan1=pan + 0.55, width_oct=0.9), t0, gain=gain, send=0.2)

    def dissolve(t, gain=0.16, pan=0.0):
        put("fx", whoosh(0.5, peak=0.4, f0=900, f1=2600, pan0=pan - 0.15, pan1=pan + 0.15, width_oct=1.3), t - 0.05, gain=gain, send=0.25)

    # ---- room tone: a soft, airy bed under everything, a touch lifted on the silk
    reseed("ambience")
    put("amb", ambience(DUR, lambda u: np.clip(u / 0.03, 0, 1) * (1 - 0.7 * np.clip((u - 0.96) / 0.035, 0, 1))), 0.0)

    # ---- open: Introducing, the silk, the 8
    reseed("open")
    put("fx", whoosh(1.1, peak=0.55, f0=500, f1=1800, pan0=-0.05, pan1=0.05, width_oct=1.5), C["intro"] - 0.2, gain=0.2, send=0.3)
    ev(C["intro"], "Introducing: a soft air swell")
    s0, s1 = C["silk"]
    put("fx", riser(0.5, f0=600, f1=4000, curve=2.4), s0 - 0.45, gain=0.14)
    move(s0, s1, f0=200, f1=2400, pan0=-0.7, pan1=0.7, gain=0.55, peak=0.45, label="silk wipes in: wide whoosh, left to right")
    put("fx", pressure(s1 - s0 + 0.3, peak=0.4), s0, gain=0.3)
    d0, d1 = C["draw"]
    put("fx", swirl(d1 - d0, rate0=5.0, rate1=1.0, f0=2800, f1=900, width=0.35), d0, gain=0.2, send=0.3)
    ev(d0, "the 8 draws: airy swirl")
    put("sig", thock(0.45), C["word"] + 0.06, gain=0.3, send=0.35)
    put("ui", pop(0.08), C["heart"], pan=0.05, gain=0.3, send=0.3)
    ev(C["heart"], "heart pop")

    # ---- the five title lines: words, push, highlight, dissolve (each a little different)
    reseed("titles")
    for i, (tin, tw, (p0, p1), (h0, h1), tout) in enumerate(C["titles"]):
        pan = (-0.25, 0.2, -0.15, 0.25, -0.2)[i]
        dissolve(tin, gain=0.12, pan=-pan)
        put("fx", whoosh(0.55, peak=0.3, f0=1500, f1=3800, pan0=pan - 0.2, pan1=pan + 0.2, width_oct=1.1), tw, gain=0.12, send=0.2)
        move(p0 - 0.05, p1, f0=170 + 20 * i, f1=1200 + 120 * i, pan0=0.0, pan1=0.0, gain=0.34, peak=0.62)
        put("fx", pressure(p1 - p0, peak=0.6), p0, gain=0.22)
        brush(h0, h1, pan=-0.35 + 0.05 * i, gain=0.2)
        ev(tw, f"title {i + 1}: words, push, highlight")

    # ---- one number: the readout, two empty chips
    reseed("readout")
    put("sig", thock(0.5), C["readout"] + 0.12, gain=0.3, send=0.3)
    move(*C["readout_pull"], f0=1400, f1=420, pan0=0.1, pan1=-0.1, gain=0.26, peak=0.5)
    for j, t in enumerate(C["qchips"]):
        put("ui", pop(0.085 + 0.01 * j), t + (0.0, 0.03)[j], pan=(-0.2, 0.25)[j], gain=(0.26, 0.22)[j], send=0.25)
    ev(C["qchips"][0], "two soft pops: Body fat ?, Muscle ?")
    dissolve(C["titles"][1][0], gain=0.14)

    # ---- the scale: feet, the bar, the hands, the whole scale, the display
    reseed("contacts")
    for i, t in enumerate(C["feet"]):
        put("ui", filt(tick(0.9 + 0.07 * i), "highpass", 1800 + 260 * i), t, pan=(-0.35, 0.3, -0.25, 0.35)[i], gain=0.2 + 0.02 * i, send=0.4)
        put("fx", glint(0.22 + 0.03 * (i % 2), pan0=(-0.4, 0.2, -0.3, 0.3)[i], pan1=(-0.2, 0.4, -0.1, 0.45)[i], density=120.0), t, gain=0.1, send=0.45)
    ev(C["feet"][0], "four foot plates: uneven glints")
    move(*C["to_bar"], f0=260, f1=1700, pan0=0.0, pan1=0.05, gain=0.36, peak=0.5, label="glide up to the bar")
    for i, t in enumerate(C["pads"]):
        put("ui", filt(tick(1.1 + 0.1 * i), "highpass", 2600 + 500 * i), t, pan=(-0.2, 0.2)[i], gain=0.24, send=0.45)
        put("fx", glint(0.34, pan0=(-0.3, 0.1)[i], pan1=(-0.1, 0.35)[i], density=140.0), t, gain=0.13, send=0.45)
    ev(C["pads"][0], "hand pads: two brighter glints")
    move(*C["scale_pull"], f0=1500, f1=360, pan0=0.05, pan1=0.0, gain=0.32, peak=0.45, label="pull back to the whole scale")
    put("ui", pop(0.09), C["scale_chip"] + 0.05, pan=0.3, gain=0.28, send=0.25)
    move(*C["to_display"], f0=240, f1=1500, pan0=0.0, pan1=0.0, gain=0.32, peak=0.55, label="push into the display")
    reseed("display")
    for j, (t, gn) in enumerate(zip(C["flicker"], (0.16, 0.24, 0.1, 0.18, 0.08))):
        put("fx", filt(glint(0.06 + 0.02 * (j % 2), pan0=-0.1, pan1=0.1, density=420.0), "highpass", 3200), t, gain=gn, send=0.3)
    put("fx", filt(glint(0.7, pan0=-0.25, pan1=0.25, density=90.0), "bandpass", [2200, 9000]), C["flicker"][-1], gain=0.12, send=0.45)
    ev(C["flicker"][0], "display wakes: a short electric crackle, then a shimmer")

    # ---- Your Results: one continuous airy fill that swells softly with each segment (no ticks: no pulse)
    reseed("results")
    a0, a1 = C["segments"][0] - 0.1, C["segments"][-1] + 0.9
    n = int((a1 - a0) * SR)
    tt = np.arange(n) / SR + a0
    swell = np.zeros(n)
    for k, (t, w) in enumerate(zip(C["segments"], (0.38, 0.3, 0.45, 0.33, 0.4))):
        tj = t + (0.0, 0.04, -0.03, 0.05, -0.02)[k]
        swell += (0.55 + 0.1 * (k % 3)) * np.exp(-0.5 * ((tt - tj - w * 0.5) / (w * 0.6)) ** 2)
    env = (0.35 + swell) * np.clip((tt - a0) / 0.4, 0, 1) * np.clip((a1 - tt) / 0.6, 0, 1)
    fc = 1400 * (3200 / 1400) ** np.clip((tt - a0) / (a1 - a0), 0, 1)
    air = np.vstack([norm(tv_filter(pink(n), "bandpass", fc * (1 + 0.04 * ch), width_oct=1.2)) * env for ch in range(2)])
    put("fx", fade_edges(air, a=0.05, r=0.1), a0, gain=0.12, send=0.35)
    for k, t in enumerate(C["segments"]):
        put("fx", glint(0.18 + 0.04 * (k % 3), pan0=-0.3 + 0.13 * k, pan1=-0.15 + 0.13 * k, density=70.0), t + (0.08, 0.12, 0.05, 0.14, 0.09)[k], gain=0.06, send=0.45)
    ev(C["segments"][0], "five segments fill: one airy texture with soft swells")
    move(*C["results_pull"], f0=1500, f1=380, pan0=0.0, pan1=0.0, gain=0.3, peak=0.45, label="pull back to the whole screen")
    put("ui", ui_click(0.9), C["tap_save"], pan=0.05, gain=0.55, send=0.12)
    ev(C["tap_save"], "tap: Save my results")

    # ---- Full Report: bars grow, it scrolls, Save as PDF, shared with the coach
    reseed("report")
    b0, b1 = C["bars"]
    put("fx", whoosh(b1 - b0, peak=0.6, f0=900, f1=3400, pan0=-0.3, pan1=0.3, width_oct=1.0), b0, gain=0.14, send=0.25)
    put("fx", filt(glint(b1 - b0, pan0=-0.3, pan1=0.3, density=40.0), "lowpass", 7000), b0 + 0.1, gain=0.08, send=0.35)
    ev(b0, "bars grow: rising air")
    move(*C["report_pull"], f0=1500, f1=400, pan0=0.0, pan1=0.0, gain=0.28, peak=0.45)
    q0, q1 = C["scroll"]
    put("fx", whoosh(q1 - q0, peak=0.5, f0=1300, f1=500, pan0=0.05, pan1=-0.05, width_oct=1.4), q0, gain=0.16)
    for t in scroll_ticks(q0 + 0.1, q1 - 0.1, max_rate=11.0):
        put("ui", filt(tick(0.7), "lowpass", 6000), t, pan=0.15, gain=0.1)
    ev(q0, "report scrolls: soft detents that follow its speed")
    move(*C["to_pdf"], f0=300, f1=1400, pan0=0.0, pan1=0.15, gain=0.26, peak=0.5)
    put("ui", ui_click(1.0), C["tap_pdf"], pan=0.2, gain=0.55, send=0.12)
    ev(C["tap_pdf"], "tap: Save as PDF")
    put("fx", whoosh(0.45, peak=0.3, f0=700, f1=2600, pan0=0.2, pan1=0.0, width_oct=1.2), C["pdf"] - 0.05, gain=0.2, send=0.25)
    put("ui", pop(0.1), C["pdf"] + 0.1, pan=0.05, gain=0.3, send=0.25)
    put("fx", glint(0.45, pan0=-0.1, pan1=0.35, density=110.0), C["shared"], gain=0.12, send=0.45)
    put("fx", whoosh(0.35, peak=0.35, f0=1800, f1=4200, pan0=-0.1, pan1=0.3, width_oct=1.0), C["shared"] - 0.03, gain=0.12, send=0.25)
    ev(C["shared"], "shared with the coach: a soft glint")

    # ---- History: the line draws, each weigh-in a tiny glint; pull back
    reseed("history")
    l0, l1 = C["line"]
    put("fx", whoosh(l1 - l0 + 0.2, peak=0.5, f0=1100, f1=2800, pan0=-0.45, pan1=0.45, width_oct=0.9), l0, gain=0.13, send=0.25)
    for k, t in enumerate(C["points"]):
        put("fx", glint(0.12 + 0.03 * (k % 3), pan0=-0.45 + 0.15 * k, pan1=-0.4 + 0.15 * k, density=60.0), t + (0.0, 0.01, -0.012, 0.015, -0.01, 0.008, 0.0)[k], gain=0.05 + 0.012 * (k % 2), send=0.4)
    ev(l0, "the line draws left to right: drawn air, tiny glints at the weigh-ins")
    move(*C["history_pull"], f0=1500, f1=380, pan0=0.0, pan1=0.0, gain=0.3, peak=0.45)

    # ---- closer on the silk, the tagline
    reseed("closer")
    move(C["closer"] - 0.1, C["closer"] + 0.7, f0=200, f1=2200, pan0=0.5, pan1=-0.5, gain=0.4, peak=0.4, label="silk again")
    put("fx", whoosh(0.5, peak=0.3, f0=1400, f1=3600, pan0=-0.2, pan1=0.2, width_oct=1.1), C["use"], gain=0.13, send=0.25)
    for j, t in enumerate(C["swaps"]):
        put("fx", whoosh(0.3 + 0.04 * j, peak=0.35, f0=2200 + 300 * j, f1=5200, pan0=0.1 - 0.2 * j, pan1=0.25 - 0.2 * j, width_oct=0.9), t - 0.02, gain=0.13, send=0.25)
    ev(C["swaps"][0], "the use word flicks over: muscle, progress")
    dissolve(C["use_out"], gain=0.12)
    put("fx", reverse_swell(0.4), C["tagline"] - 0.38, gain=0.14)
    put("impact", impact(0.32), C["tagline"] + 0.02, gain=0.32, send=0.4)
    put("fx", whoosh(0.5, peak=0.3, f0=1200, f1=3400, pan0=-0.25, pan1=0.15, width_oct=1.1), C["tagline"], gain=0.12, send=0.25)
    brush(*C["tag_hl"], pan=-0.4, gain=0.2)
    ev(C["tagline"], "tagline: a soft low hit, then the brush")

    # ---- end card
    reseed("end")
    dissolve(C["end"] - 0.1, gain=0.12)
    put("fx", reverse_swell(0.5), C["end"] - 0.3, gain=0.16)
    put("impact", impact(0.5), C["end"] + 0.2, gain=0.45, send=0.4)
    put("sig", thock(0.5), C["end"] + 0.22, gain=0.3, send=0.4)
    put("fx", whoosh(0.5, peak=0.3, f0=1300, f1=3600, pan0=-0.2, pan1=0.2, width_oct=1.1), C["cta"], gain=0.1, send=0.25)
    ev(C["end"], "end card: soft hit")
    return buses, rev, events


DESIGNS = {"app": design_app, "scale": design_scale, "iam": design_iam, "demo": design_demo}


# Stem levelling: sparse effects are levelled by their loudest 400 ms; the room tone by gated
# loudness; clicks by peak. Only the differences matter: the mix is normalised afterwards.
STEM_MOMENTARY = {"impact": -14.0, "fx": -17.5, "sig": -18.0}
STEM_PEAK_DBFS = {"ui": -11.0}
STEM_LUFS = {"amb": -38.0}
REVERB_LUFS = -26.0

TARGET_LUFS = -16.0 if FILM == "demo" else -15.0  # the demo has no narration: a calmer level
VO_LUFS = -16.0  # narration level relative to the effects before normalisation
VO_DUCK_DB = -8.0  # effects dip this much while the narrator speaks
VOICEOVER = OUT / f"voiceover-{FILM}.wav"  # narration on the same timing, when there is one (audio/voice.py)
CEILING_DBTP = -1.5


def stem_gain(name: str, x: np.ndarray) -> float:
    peak = np.max(np.abs(x))
    if peak <= 0:
        raise ValueError(f"stem '{name}' is silent")
    g = 1.0 / peak
    if name in STEM_PEAK_DBFS:
        return float(db(STEM_PEAK_DBFS[name]) * g)
    if name in STEM_MOMENTARY:
        return float(g * db(STEM_MOMENTARY[name] - momentary_max(x * g)))
    for _ in range(2):
        lv = lufs(x * g)
        if not np.isfinite(lv):
            raise ValueError(f"stem '{name}' measured silent")
        g *= float(db(STEM_LUFS[name] - lv))
    return g


def load_voiceover():
    """Narration track (48 kHz, 15 s) cleaned up: high-pass, a little presence, gentle levelling."""
    if not VOICEOVER.exists():
        return None
    import subprocess

    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(VOICEOVER), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True, check=True,
    ).stdout
    vo = np.frombuffer(raw, np.float32).reshape(-1, 2).T.astype(np.float64)
    vo = np.pad(vo, ((0, 0), (0, max(0, N - vo.shape[1]))))[:, :N]
    vo = filt(vo, "highpass", 90, order=2)
    # presence: +2 dB shelf-ish lift around 4 kHz (RBJ peaking, Q 0.8)
    a_, w = 10 ** (2.0 / 40), 2 * np.pi * 4000 / SR
    al = np.sin(w) / (2 * 0.8)
    b = np.array([1 + al * a_, -2 * np.cos(w), 1 - al * a_])
    a = np.array([1 + al / a_, -2 * np.cos(w), 1 - al / a_])
    vo = signal.lfilter(b / a[0], a / a[0], vo, axis=-1)
    # gentle levelling: 2:1 above the speech's median level, 10 ms / 150 ms
    lvl = np.sqrt(uniform_filter1d(np.mean(vo**2, axis=0), int(0.03 * SR)) + 1e-12)
    thr = np.median(lvl[lvl > np.max(lvl) * 0.05]) if np.any(lvl > 0) else 1.0
    gain = np.where(lvl > thr, (thr / lvl) ** 0.5, 1.0)
    gain = uniform_filter1d(gain, int(0.02 * SR))
    vo = vo * gain
    return vo * db(VO_LUFS - lufs(vo))


def duck_under(vo: np.ndarray) -> np.ndarray:
    """Gain curve for everything else: dips while the voice is active, smooth in and out."""
    env = np.sqrt(uniform_filter1d(np.mean(vo**2, axis=0), int(0.05 * SR)) + 1e-12)
    active = (env > np.max(env) * db(-30)).astype(float)
    active = uniform_filter1d(minimum_filter1d(active, int(0.02 * SR)), int(0.06 * SR))  # 60 ms ramps
    held = uniform_filter1d(active, int(0.25 * SR))  # widen by ~125 ms either side
    m = np.clip(np.maximum(active, held), 0, 1)
    return db(VO_DUCK_DB * m)


def master(buses, rev):
    gains = {name: stem_gain(name, bus.x) for name, bus in buses.items()}
    for name, bus in buses.items():
        bus.x *= gains[name]
    wet = reverb(sum(rev[k].x * gains[k] for k in rev), make_ir())
    wet *= db(REVERB_LUFS - lufs(wet))

    mix = sum(b.x for b in buses.values()) + wet
    vo = load_voiceover()
    if vo is not None:
        mix = mix * duck_under(vo) + vo
    mix = filt(mix, "highpass", 25, order=4)
    t = secs(N)
    mix *= np.clip(t / 0.01, 0, 1)
    mix *= 0.5 + 0.5 * np.cos(np.pi * np.clip((t - (DUR - 0.25)) / 0.25, 0, 1))  # tail into silence at the end

    out = mix
    for _ in range(5):
        out = out * db(TARGET_LUFS - lufs(out))
        out = limiter(out, ceiling_db=CEILING_DBTP - 0.1)
        if abs(lufs(out) - TARGET_LUFS) < 0.1:
            break
    return out, gains


def write_wav24(path: Path, x: np.ndarray):
    x = np.clip(x, -1, 1 - 2**-23)
    pcm = np.round(x.T * (2**23)).astype(np.int32).reshape(-1)
    b = pcm.astype("<i4").view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(b)) + b"WAVE")
        f.write(b"fmt " + struct.pack("<IHHIIHH", 16, 1, 2, SR, SR * 2 * 3, 6, 24))
        f.write(b"data" + struct.pack("<I", len(b)) + b)


def main():
    buses, rev, events = DESIGNS[FILM]()
    out, gains = master(buses, rev)
    wav = OUT / f"intelli8-{FILM}-sound.wav"
    write_wav24(wav, out)
    report = {
        "file": wav.name,
        "film": FILM,
        "content": "sound design only — no music, no instruments, no tuned tones",
        "sample_rate": SR,
        "duration": DUR,
        "integrated_lufs": round(lufs(out), 2),
        "true_peak_dbtp": round(true_peak(out), 2),
        "stem_gain_db": {k: round(20 * np.log10(v), 2) for k, v in gains.items()},
        "events": sorted(events, key=lambda e: e["t"]),
    }
    (OUT / f"sound-cues-{FILM}.json").write_text(json.dumps(report, indent=2))
    print(f"{wav}  {report['integrated_lufs']} LUFS  {report['true_peak_dbtp']} dBTP")
    return 0


if __name__ == "__main__":
    sys.exit(main())
