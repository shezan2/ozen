#!/usr/bin/env python3
"""Ozen Digital launch film: sound design (no music), synthesised in code.

Brief: no musical instruments. So there are no melodies, chords, drums, beats or tuned tones.
Every sound here is built from filtered noise and short transients (no oscillators): air,
whooshes, glints, clicks, ticks, pops and impacts, plus a quiet room-tone bed. Each sound is
placed on a visual event, so the motion itself sets the rhythm.

    python3 -m venv .venv && .venv/bin/pip install -r audio/requirements.txt
    .venv/bin/python audio/sound.py      # → out/ozen-launch-15s-sound.wav + out/sound-cues.json
    .venv/bin/python audio/sound.py --hook   # hook cut → out/ozen-launch-15s-hook-sound.wav
    node render.mjs --mux                # attach it to the film

Deterministic: each sound draws from its own seeded noise stream.

Logo sound cues (intro and end card): a swirl as the compass-O spins in, a soft magnetic
"thock" as it lands, two precise ticks as the umlaut bars land, and an airy swish across the
ZEN wipe. The end card repeats the same four sounds as the logo rebuilds.

Hook cut (--hook): the film opens on "Tired of quotes / that keep growing?" instead of the logo,
so the intro cues become an air lift for each line, a soft pop as the quote total appears, and fine
ticks that quicken as the total climbs, like a meter running.
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
DUR = 15.0
N = int(SR * DUR)
SEED = 20261013

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out"

# ---------------------------------------------------------------------------- cue sheet
# Times in seconds from ../film.js: tween starts, and where motion visibly lands or peaks
# (derived from its easing curves and checked against frame differences of the render).
CUE = {
    "mark_spin": 0.12,  # compass-O starts spinning in
    "mark_land": 0.49,  # compass-O settles (90% of its rotation)
    "bar_land": (0.76, 0.85),  # umlaut bars land
    "wipe": (0.40, 1.32),  # ZEN wipe; peak speed 0.86
    "sheen": (1.32, 2.05),  # cobalt sheen; crosses the logo 1.47–1.90
    "sheet": (1.95, 2.55),  # cobalt sheet rises; peak speed 2.22
    "sheet_land": 2.475,  # sheet lands
    "words": (2.62, 3.30, 3.95),  # "websites." / "online stores." / "digital tools."
    "pullback": (4.55, 5.55),  # camera pulls back; peak speed 5.00
    "scroll": (5.38, 6.18),  # page scrolls to pricing; peak speed 5.74
    "cards": (6.12, 6.20, 6.28),  # pricing cards lift (staggered)
    "form_in": 7.55,  # enquiry form slides in from the right; peak 7.64
    "info_in": 7.65,  # info card slides in from the left; peak 7.76
    "click1": 8.958,  # cursor press on "Custom Website" (press peak 8.96)
    "select": 8.98,  # option turns cobalt, tick pops
    "fill": (9.05, 9.60),  # progress bar fills to 20%
    "chip": 9.14,  # "We reply within 24 hours" chip pops
    "exit": (9.60, 10.10),  # UI rig scrolls up and away; visible motion peaks 9.81–9.87
    "statement": (10.04, 10.20),  # "Fixed price." / "Before work begins." first visible
    "cta": 10.75,  # Get a Quote button appears
    "click2": 11.51,  # cursor press on Get a Quote (press peak 11.52)
    "expand": (11.58, 12.30),  # button opens into the end card; peak speed 11.90
    "end_hit": 11.91,  # on the bloom: the card expansion's peak motion
    "end_spin": 12.08,  # end-card mark starts spinning in
    "end_mark": 12.39,  # end-card mark settles (90% of its rotation)
    "end_bars": (12.60, 12.68),  # end-card umlaut bars land
    "end_wipe": (12.31, 13.06),  # end-card ZEN wipe; peak speed 12.69
    "end_text": (12.68, 12.94),  # "Let's talk about your project." / ozendigital.co pill
}

# ---------------------------------------------------------------------------- helpers

_rng = np.random.default_rng(SEED)


HOOK = "--hook" in sys.argv  # the hook cut (film.js ?hook): opens on the worry instead of the logo
HOOK_CUE = {
    "lines": (0.10, 0.26),  # "Tired of quotes" / "that keep growing?" start rising
    "meter": 0.52,  # quote total pops in
    "count": (0.62, 1.90),  # total climbs $2,400 → $6,150 (ease-in cubic)
}


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

    def logo_cues(spin, land, bars, wipe, label=""):
        """Logo sound cues: swirl → thock → tick tick → swish."""
        put("sig", swirl((land - spin) + 0.06), spin, gain=0.75, send=0.35)
        put("sig", thock(1.0), land, gain=1.0, send=0.5)
        for t, p in zip(bars, (-0.25, -0.12)):
            put("sig", tick(), t, pan=p, gain=0.55, send=0.4)
        w0, w1 = wipe
        wd = (w1 - w0) + 0.12
        put("sig", whoosh(wd, peak=0.45, f0=900, f1=5200, pan0=-0.55, pan1=0.55, width_oct=1.2), w0, gain=0.55, send=0.2)
        ev(spin, f"logo cue: swirl{label}")
        ev(land, f"logo cue: thock{label}")
        for t in bars:
            ev(t, f"logo cue: tick{label}")
        ev(w0 + 0.45 * wd, f"logo cue: swish crest{label}")

    # ---- room tone under everything (fades in, drops away at the very end)
    reseed("ambience")
    put("amb", ambience(DUR, lambda u: np.clip(u / 0.04, 0, 1) * (1 - 0.6 * np.clip((u - 0.9) / 0.08, 0, 1))), 0.0)

    if HOOK:
        # ---- hook intro: air lifts for the two lines, a pop for the quote total, quickening ticks
        reseed("hook")
        for t, (a, b, p, g) in zip(HOOK_CUE["lines"], ((650, 3600, -0.15, 0.55), (850, 4300, 0.1, 0.45))):
            put("fx", whoosh(0.55, peak=0.36, f0=a, f1=b, pan0=p, pan1=p + 0.15, width_oct=1.4), t - 0.04, gain=g, send=0.25)
            ev(t - 0.04 + 0.36 * 0.55, "hook line air lift")
        put("ui", pop(0.09), HOOK_CUE["meter"], gain=0.5, send=0.2)
        ev(HOOK_CUE["meter"], "quote total pops in")
        m0, m1 = HOOK_CUE["count"]
        for i, t in enumerate(meter_ticks(m0, m1, 2400, 6150, 120)):
            put("ui", filt(tick(0.7), "lowpass", 6500), t, pan=0.05, gain=0.16 + 0.08 * min(1, i / 20))
        ev(m0, "meter ticks (quickening with the count)")
    else:
        # ---- intro: the logo sound cues, then a glint across the sheen
        reseed("intro")
        logo_cues(CUE["mark_spin"], CUE["mark_land"], CUE["bar_land"], CUE["wipe"])
        put("fx", glint(0.5), 1.435, gain=0.45, send=0.4)
        ev(1.435 + 0.25, "sheen glint (L→R)")

    # ---- the sheet rises: noise riser + upward whoosh, landing impact
    reseed("sheet")
    put("fx", riser(CUE["sheet_land"] - 1.15, f0=500, f1=7000, curve=2.6), 1.15, gain=0.45)
    sh0, sh1 = CUE["sheet"]
    sd = sh1 - sh0 + 0.05
    put("fx", whoosh(sd, peak=0.39, f0=180, f1=2400, width_oct=1.6), sh0, gain=0.85, send=0.15)
    put("fx", pressure(sd + 0.1, peak=0.45), sh0, gain=0.5)
    ev(sh0 + 0.39 * sd, "sheet whoosh crest")
    put("fx", reverse_swell(0.5), CUE["sheet_land"] - 0.5, gain=0.35)
    put("impact", impact(0.6), CUE["sheet_land"], gain=0.6, send=0.5)
    ev(CUE["sheet_land"], "impact: sheet lands")

    # ---- words roll in: a small swish for each
    reseed("words")
    for t, (a, b, d, p) in zip(CUE["words"], ((1400, 4200, 0.34, -0.35), (1250, 3600, 0.30, -0.28), (1550, 4600, 0.38, -0.40))):
        put("fx", whoosh(d, peak=0.28, f0=a, f1=b, pan0=p, pan1=p + 0.2, width_oct=1.3), t - 0.03, gain=0.35, send=0.15)
        ev(t - 0.03 + 0.28 * d, "word swish")

    # ---- pull-back: big airy camera move with a low pressure swell
    reseed("pullback")
    put("fx", whoosh(1.15, peak=0.41, f0=220, f1=1800, pan0=-0.5, pan1=0.5, width_oct=1.8), 4.50, gain=0.8, send=0.15)
    put("fx", pressure(1.2, peak=0.42), 4.45, gain=0.55)
    ev(4.50 + 0.41 * 1.15, "pull-back whoosh crest")

    # ---- page scroll: whoosh plus soft wheel detents following the scroll speed
    reseed("scroll")
    s0, s1 = CUE["scroll"]
    put("fx", whoosh(0.8, peak=0.45, f0=1500, f1=350, pan0=0.2, pan1=-0.2, width_oct=1.4), s0, gain=0.45)
    ev(s0 + 0.45 * 0.8, "page-scroll whoosh crest")
    for t in scroll_ticks(s0, s1):
        put("ui", filt(tick(0.8), "lowpass", 7000), t, pan=0.1, gain=0.22)
    ev(s0, "scroll wheel detents (speed-following)")

    # ---- cards lift: three soft air puffs, building
    reseed("cards")
    for t, p, g in zip(CUE["cards"], (-0.4, 0.0, 0.4), (0.4, 0.5, 0.6)):
        put("fx", whoosh(0.42, peak=0.22, f0=500, f1=2200, pan0=p, pan1=p, width_oct=1.5), t, gain=g, send=0.2)
        ev(t, "card lift air")

    # ---- form + info cards slide in (opposite directions)
    reseed("form")
    put("fx", whoosh(0.62, peak=0.25, f0=1600, f1=420, pan0=0.75, pan1=0.1), CUE["form_in"] - 0.06, gain=0.6)
    put("fx", whoosh(0.55, peak=0.25, f0=1300, f1=380, pan0=-0.75, pan1=-0.15), CUE["info_in"] - 0.05, gain=0.35)
    ev(CUE["form_in"] - 0.06 + 0.25 * 0.62, "form whoosh crest (R→L)")
    put("fx", pressure(0.7, peak=0.45), 7.55, gain=0.4)
    ev(7.55 + 0.45 * 0.7, "browser recede pressure")

    # ---- the click, the selection, the progress fill, the chip
    reseed("ui")
    put("ui", ui_click(1.0), CUE["click1"], pan=0.3, gain=0.9, send=0.15)
    ev(CUE["click1"], "click: Custom Website")
    put("fx", whoosh(0.22, peak=0.2, f0=2200, f1=5000, pan0=0.3, pan1=0.3, width_oct=1.2), CUE["select"], gain=0.3, send=0.2)
    ev(CUE["select"], "selection air")
    f0_, f1_ = CUE["fill"]
    put("fx", whoosh(0.28, peak=0.15, f0=1200, f1=5000, pan0=0.1, pan1=0.35, width_oct=1.2), f0_ - 0.01, gain=0.18)
    put("ui", pop(), CUE["chip"], pan=0.55, gain=0.55, send=0.25)
    ev(CUE["chip"], "chip pop")

    # ---- the UI scrolls away: riser + upward whoosh into the statement impact
    reseed("break")
    put("fx", riser(CUE["statement"][0] - 9.475, f0=700, f1=9000, curve=2.2), 9.475, gain=0.4)
    e0, e1 = CUE["exit"]
    put("fx", whoosh(e1 - e0, peak=0.36, f0=300, f1=3600, width_oct=1.5), e0, gain=0.55)
    ev(e0 + 0.36 * (e1 - e0), "UI-exit whoosh crest")
    put("fx", reverse_swell(0.5), CUE["statement"][0] - 0.5, gain=0.4)
    put("impact", impact(0.6), CUE["statement"][0], gain=0.6, send=0.5)
    ev(CUE["statement"][0], "impact: 'Fixed price.'")
    put("fx", glint(0.3, pan0=-0.3, pan1=0.3, density=90.0), CUE["statement"][1], gain=0.3, send=0.35)
    ev(CUE["statement"][1], "glint on 'Before work begins.'")
    put("fx", whoosh(0.3, peak=0.25, f0=900, f1=2600, width_oct=1.3), CUE["cta"], gain=0.25, send=0.15)
    ev(CUE["cta"], "Get a Quote appears")

    # ---- Get a Quote click, the build, the end-card hit
    reseed("finale")
    put("ui", ui_click(1.3), CUE["click2"], pan=0.05, gain=1.0, send=0.2)
    ev(CUE["click2"], "click: Get a Quote")
    put("fx", riser(CUE["end_hit"] - 10.975 - 0.05, f0=400, f1=11000, curve=2.8), 10.975, gain=0.55)
    x0, _ = CUE["expand"]
    put("fx", whoosh(0.62, peak=0.52, f0=260, f1=3200, width_oct=2.0), x0, gain=0.7, send=0.15)
    put("fx", pressure(0.7, peak=0.5), x0, gain=0.6)
    ev(x0 + 0.52 * 0.62, "expansion whoosh crest")
    put("fx", reverse_swell(0.7), CUE["end_hit"] - 0.75, gain=0.5)
    imp = impact(1.3)
    k0 = int((CUE["end_spin"] - 0.03 - CUE["end_hit"]) * SR)  # get out of the way of the reprise
    kn = int(0.03 * SR)
    imp[:, k0 : k0 + kn] *= np.linspace(1, db(-9), kn)
    imp[:, k0 + kn :] *= db(-9)
    put("impact", imp, CUE["end_hit"], gain=1.0, send=0.35)
    ev(CUE["end_hit"], "impact: end card")

    # ---- the end card: the same logo cues as the logo rebuilds, then air
    reseed("end")
    logo_cues(CUE["end_spin"], CUE["end_mark"], CUE["end_bars"], CUE["end_wipe"], label=" (reprise)")
    put("fx", whoosh(0.4, peak=0.3, f0=1200, f1=3500, width_oct=1.2), CUE["end_text"][0], gain=0.22, send=0.2)
    put("fx", whoosh(0.32, peak=0.3, f0=1500, f1=4200, width_oct=1.2), CUE["end_text"][1], gain=0.18, send=0.2)

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
VOICEOVER = OUT / "voiceover.wav"  # from audio/voice.py (or a human recording on the same timing)
if HOOK and (OUT / "voiceover-hook.wav").exists():  # narration with the spoken hook line
    VOICEOVER = OUT / "voiceover-hook.wav"
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
    mix *= 0.5 + 0.5 * np.cos(np.pi * np.clip((t - 14.8) / 0.2, 0, 1))  # tail into silence at 15.0

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
    wav = OUT / ("ozen-launch-15s-hook-sound.wav" if HOOK else "ozen-launch-15s-sound.wav")
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
    (OUT / ("sound-cues-hook.json" if HOOK else "sound-cues.json")).write_text(json.dumps(report, indent=2))
    print(f"{wav}  {report['integrated_lufs']} LUFS  {report['true_peak_dbtp']} dBTP")
    return 0


if __name__ == "__main__":
    sys.exit(main())
