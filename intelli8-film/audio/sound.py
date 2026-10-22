#!/usr/bin/env python3
"""intelli8 App film: sound design (no music), synthesised in code.

Brief: no musical instruments. So there are no melodies, chords, drums, beats or tuned tones.
Every sound here is built from filtered noise and short transients (no oscillators): air,
whooshes, glints, clicks, ticks, pops and impacts, plus a quiet room-tone bed. Each sound is
placed on a visual event, so the motion itself sets the rhythm.

    python3 -m venv .venv && .venv/bin/pip install -r ../launch-film/audio/requirements.txt
    .venv/bin/python audio/sound.py      # → out/intelli8-app-sound.wav + out/sound-cues.json
    node render.mjs --mux                # attach it to the film

Deterministic: each sound draws from its own seeded noise stream.

Cues follow the picture (film.js): air and texture for the hook, an airy draw for the 8 and a pop
for its heart, a bloom as the dark Measure section opens, eight bright glints for the scale's
contacts, then the app: taps, pushes, scroll detents, segment ticks, a PDF flight and the landing.
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
DUR = 30.0
N = int(SR * DUR)
SEED = 20261013

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out"

# ---------------------------------------------------------------------------- cue sheet
# Times in seconds from ../film.js: tween starts, and where motion visibly lands or peaks
# (derived from its easing curves and checked against frame differences of the render).

# Picture events (seconds), from film.js.
CUE = {
    "card": 0.0,  # weight card on screen
    "same": 0.4,  # "Same weight."
    "weeks": (1.05, 3.1),  # week ticker running
    "different": 1.9,  # "Different story." — the insight
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
    "segments": (12.95, 0.216),  # body parts fill: first time, spacing (5 parts)
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
    "slider": (24.0, 24.9),  # goal slider travels
    "line": (24.55, 25.4),  # history line draws
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


def design():
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

    # ---- hook: the card arrives, the weeks rustle by, the insight lands
    reseed("hook")
    put("fx", whoosh(0.5, peak=0.2, f0=600, f1=2600, pan0=0.3, pan1=0.45, width_oct=1.4), CUE["card"], gain=0.3, send=0.2)
    swish(CUE["same"] + 0.1, pan=-0.45)
    w0, w1 = CUE["weeks"]
    put("fx", filt(glint(w1 - w0, pan0=0.25, pan1=0.45, density=34.0), "lowpass", 6500), w0, gain=0.22, send=0.25)
    ev(w0, "week ticker: soft granular rustle (no per-week ticks, so no pulse)")
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


# Stem levelling: sparse effects are levelled by their loudest 400 ms; the room tone by gated
# loudness; clicks by peak. Only the differences matter: the mix is normalised afterwards.
STEM_MOMENTARY = {"impact": -14.0, "fx": -17.5, "sig": -18.0}
STEM_PEAK_DBFS = {"ui": -11.0}
STEM_LUFS = {"amb": -38.0}
REVERB_LUFS = -26.0

TARGET_LUFS = -15.0
VO_LUFS = -16.0  # narration level relative to the effects before normalisation
VO_DUCK_DB = -8.0  # effects dip this much while the narrator speaks
VOICEOVER = OUT / "voiceover.wav"  # narration on the same timing, when there is one
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
    buses, rev, events = design()
    out, gains = master(buses, rev)
    wav = OUT / "intelli8-app-sound.wav"
    write_wav24(wav, out)
    report = {
        "file": wav.name,
        "content": "sound design only — no music, no instruments, no tuned tones",
        "sample_rate": SR,
        "duration": DUR,
        "integrated_lufs": round(lufs(out), 2),
        "true_peak_dbtp": round(true_peak(out), 2),
        "stem_gain_db": {k: round(20 * np.log10(v), 2) for k, v in gains.items()},
        "events": sorted(events, key=lambda e: e["t"]),
    }
    (OUT / "sound-cues.json").write_text(json.dumps(report, indent=2))
    print(f"{wav}  {report['integrated_lufs']} LUFS  {report['true_peak_dbtp']} dBTP")
    return 0


if __name__ == "__main__":
    sys.exit(main())
