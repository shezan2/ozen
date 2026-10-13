#!/usr/bin/env python3
"""Ozen Digital launch film: original score and sound design, synthesised in code.

Every sound here is generated from oscillators and noise, so the track is wholly owned
(no samples, no licences). The score is locked to the picture: cue times below mirror the
timeline in ../film.js, and the groove is 120 BPM anchored so the beats land on the sheet
landing, the statement, the Get a Quote click and the end-card hit.

    python3 audio/score.py            # writes out/ozen-launch-15s-score.wav (+ cue sheet JSON)

Requires numpy and scipy. Deterministic: same code, same output.

Arc (key of F major):
    0.00  Intro, rubato   Fmaj9 pad swells in; the "sonic logo" bell motif (F–A–C) plays as
                          the ÖZEN mark and umlaut bars land; a swish follows the ZEN wipe.
    2.475 Bar 1  Dm9      Sheet lands: impact, half-time kick, word plucks on each new word.
    4.475 Bar 2  B♭maj9   Pull-back: four-on-the-floor, rolling offbeat bass, 16th arp.
    6.475 Bar 3  Gm9 3/4  Cards lift (pickup bells), form whooshes in.
    7.975 Bar 4  C9sus4   Cursor click; the sus resolves to C7 exactly as the option is picked.
    9.475        break    Riser while the UI scrolls away.
    9.975 Bar 5  B♭maj9 → C9sus4   "Fixed price." Click on beat 4, riser into…
   11.975 End    Fmaj9    …the end-card hit; the bell motif returns as the logo rebuilds.
"""
from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48_000
DUR = 15.0
N = int(SR * DUR)
RNG = np.random.default_rng(20261013)

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out"

# ---------------------------------------------------------------------------- cue sheet
# Times in seconds, taken from ../film.js (tween starts) and the easing curves (where the
# motion visibly lands or peaks). Keep these in step with the film if the timing changes.
CUE = {
    "mark_land": 0.43,  # compass-O settles (glide 85%)
    "bar_land": (0.76, 0.85),  # umlaut bars land
    "wipe": (0.40, 1.32),  # ZEN wipe; peak speed 0.86
    "sheen": (1.32, 2.05),  # cobalt sheen across the wordmark
    "sheet": (1.95, 2.55),  # cobalt sheet rises; peak speed 2.22, lands ~2.45
    "words": (2.62, 3.30, 3.95),  # "websites." / "online stores." / "digital tools."
    "pullback": (4.55, 5.55),  # camera pulls back; peak speed 5.00
    "cards": (6.12, 6.20, 6.28),  # pricing cards lift (staggered)
    "form_in": (7.55, 8.30),  # enquiry form slides in from the right
    "info_in": (7.65, 8.40),  # info card slides in from the left
    "click1": 8.94,  # cursor presses "Custom Website"
    "select": 8.98,  # option turns cobalt, tick pops
    "chip": 9.14,  # "We reply within 24 hours" chip pops
    "exit": (9.60, 10.10),  # UI rig scrolls up and away
    "statement": (10.0, 10.16),  # "Fixed price." / "Before work begins."
    "click2": 11.48,  # cursor presses Get a Quote
    "expand": (11.58, 12.30),  # button opens into the end card; peak speed 11.90, 85% at 12.01
    "end_mark": 12.34,  # end-card mark settles
    "end_bars": (12.60, 12.68),  # end-card umlaut bars land
}

BPM = 120
BEAT = 60 / BPM
GRID0 = 2.475  # first downbeat: the sheet landing


def beat(i: float) -> float:
    """Time of groove beat i (beat 0 = GRID0)."""
    return GRID0 + i * BEAT


# Bars as (first beat index, beats in bar). Bar 3 is 3/4 so bar 5 lands on the statement.
BARS = [(0, 4), (4, 4), (8, 3), (11, 4), (15, 4), (19, 6)]


def bar_start(b: int) -> float:
    return beat(BARS[b][0])


# ---------------------------------------------------------------------------- helpers

def db(x: float) -> float:
    return 10 ** (x / 20)


def midi(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


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


def delayed(x: np.ndarray, k: int) -> np.ndarray:
    """Shift right by k samples, zero-filled (never wraps the tail round to the start)."""
    if k <= 0:
        return x
    return np.concatenate([np.zeros(k), x[:-k]])


def fade_edges(x: np.ndarray, a=0.002, r=0.01) -> np.ndarray:
    """Short raised-cosine ramps so nothing starts or stops on a non-zero sample."""
    n = x.shape[-1]
    na, nr = min(int(a * SR), n // 2), min(int(r * SR), n // 2)
    w = np.ones(n)
    if na:
        w[:na] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na))
    if nr:
        w[-nr:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, nr))
    return x * w


def sos(kind: str, fc, order=2, fs=SR):
    return signal.butter(order, fc, kind, fs=fs, output="sos")


def filt(x: np.ndarray, kind: str, fc, order=2) -> np.ndarray:
    return signal.sosfilt(sos(kind, fc, order), x, axis=-1)


def tv_filter(x: np.ndarray, kind: str, fc: np.ndarray, width_oct=1.0, block=128) -> np.ndarray:
    """Time-varying Butterworth filter, coefficients updated every `block` samples.

    kind: 'lowpass' | 'highpass' | 'bandpass'. fc is a per-sample cutoff/centre array."""
    x = np.atleast_2d(x)
    out = np.zeros_like(x)
    zi = None
    nyq = SR / 2
    for s in range(0, x.shape[1], block):
        e = min(s + block, x.shape[1])
        f = float(np.clip(fc[min(s + block // 2, len(fc) - 1)], 20, nyq * 0.92))
        if kind == "bandpass":
            lo = f / 2 ** (width_oct / 2)
            hi = min(f * 2 ** (width_oct / 2), nyq * 0.95)
            c = signal.butter(2, [max(lo, 20), hi], "bandpass", fs=SR, output="sos")
        else:
            c = signal.butter(2, f, kind, fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((x.shape[0], c.shape[0], 2))
        for ch in range(x.shape[0]):
            out[ch, s:e], zi[ch] = signal.sosfilt(c, x[ch, s:e], zi=zi[ch])
    return out if out.shape[0] > 1 else out[0]


def noise(n: int) -> np.ndarray:
    return RNG.standard_normal(n)


def pink(n: int) -> np.ndarray:
    """Pink-ish noise (Voss-McCartney style via FFT shaping)."""
    w = RNG.standard_normal(n)
    spec = np.fft.rfft(w)
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    spec /= np.sqrt(f)
    p = np.fft.irfft(spec, n)
    return p / (np.std(p) + 1e-12)


def saw_bl(f: float, n: int, phase=0.0, fmax=5000.0) -> np.ndarray:
    """Band-limited sawtooth (additive), harmonics up to fmax."""
    t = secs(n)
    k_max = max(1, int(min(fmax, SR * 0.45) // f))
    out = np.zeros(n)
    w = 2 * np.pi * f * t
    for k in range(1, k_max + 1):
        out += np.sin(k * (w + phase)) / k
    return out * (2 / np.pi)


# ---------------------------------------------------------------------------- instruments

def pad_chord(notes, dur, attack=0.35, release=0.6, detune=(-8.0, 0.0, 7.0), cutoff=None, bright=1.0):
    """Warm supersaw pad: 3 detuned band-limited saws per note, spread in stereo, low-passed."""
    total = dur + release
    n = int(total * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    for j, m in enumerate(notes):
        f0 = midi(m)
        for k, c in enumerate(detune):
            f = f0 * 2 ** (c / 1200)
            s = saw_bl(f, n, RNG.uniform(0, 2 * np.pi), fmax=4200 * bright)
            p = (k - 1) * 0.55 + (0.12 if j % 2 else -0.12)
            gl, gr = pan_gains(p)
            L += s * gl
            R += s * gr
    x = np.vstack([L, R]) / (len(notes) * len(detune)) ** 0.5
    if cutoff is None:
        cutoff = np.full(n, 1800.0)
    x = tv_filter(x, "lowpass", cutoff)
    t = secs(n)
    env = np.clip(t / attack, 0, 1) ** 1.5
    rel = np.clip((total - t) / release, 0, 1)
    env = env * (0.5 - 0.5 * np.cos(np.pi * rel))
    return x * env


def fm_bell(f, dur=2.4, ratio=3.5, index=1.3, idecay=0.55, decay=1.5, sparkle=0.22):
    n = int(dur * SR)
    t = secs(n)
    mod = index * np.exp(-t / idecay) * np.sin(2 * np.pi * f * ratio * t)
    x = np.sin(2 * np.pi * f * t + mod)
    x += sparkle * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / (decay * 0.25))
    env = (1 - np.exp(-t / 0.0015)) * np.exp(-t / decay)
    return fade_edges(x * env, a=0.0005, r=0.05)


def fm_pluck(f, dur=0.6, index=1.9, idecay=0.07, decay=0.22):
    n = int(dur * SR)
    t = secs(n)
    mod = index * np.exp(-t / idecay) * np.sin(2 * np.pi * f * t)
    x = np.sin(2 * np.pi * f * t + mod)
    env = (1 - np.exp(-t / 0.001)) * np.exp(-t / decay)
    return fade_edges(x * env, a=0.0005, r=0.03)


def mallet(f, dur=1.1, decay=0.42):
    """Soft marimba-like tone: fundamental plus a fast-decaying 4th partial."""
    n = int(dur * SR)
    t = secs(n)
    x = np.sin(2 * np.pi * f * t) + 0.32 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t / 0.045)
    x += 0.12 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t / 0.012)
    env = (1 - np.exp(-t / 0.0012)) * np.exp(-t / decay)
    return fade_edges(x * env, a=0.0005, r=0.05)


def kick(vel=1.0, decay=0.30, f_hi=118.0, f_lo=47.0, sweep=0.042, click=0.22):
    n = int(0.75 * SR)
    t = secs(n)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / sweep)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / decay) * (1 - np.exp(-t / 0.0012))
    c = filt(noise(n), "highpass", 2500) * np.exp(-t / 0.0035) * click
    x = np.tanh(1.5 * (body + c)) / np.tanh(1.5)
    return fade_edges(x * vel, a=0.0003, r=0.05)


def boom(f_lo=43.65, f_hi=95.0, decay=1.4, dur=3.0):
    """Sub impact: sine sweeping down onto the root, long tail, a touch of 2nd harmonic."""
    n = int(dur * SR)
    t = secs(n)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.07)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph)
    env = (1 - np.exp(-t / 0.002)) * np.exp(-t / decay)
    return fade_edges(np.tanh(1.2 * x * env) / np.tanh(1.2), a=0.0005, r=0.3)


def hat(vel=1.0, decay=0.032):
    n = int(0.22 * SR)
    t = secs(n)
    x = filt(noise(n), "highpass", 7200, order=4)
    x += 0.5 * filt(noise(n), "bandpass", [9000, 13000])
    env = (1 - np.exp(-t / 0.0004)) * np.exp(-t / decay)
    return fade_edges(x * env * vel * 0.5, a=0.0002, r=0.02)


def snap(vel=1.0):
    """Soft finger-snap / rim: band-passed noise bursts with a hint of body."""
    n = int(0.3 * SR)
    t = secs(n)
    x = np.zeros(n)
    for k, d in enumerate((0.0, 0.007, 0.013)):
        i = int(d * SR)
        burst = filt(noise(n - i), "bandpass", [1300, 4200]) * np.exp(-secs(n - i) / (0.009 if k < 2 else 0.06))
        x[i:] += burst * (0.6 if k < 2 else 1.0)
    x += 0.25 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.018)
    return fade_edges(x * vel * 0.6, a=0.0002, r=0.05)


def bass_note(m, dur, vel=1.0):
    """Rounded bass: sine + low harmonics through gentle saturation (reads on phone speakers)."""
    n = int((dur + 0.04) * SR)
    t = secs(n)
    f = midi(m)
    x = np.sin(2 * np.pi * f * t) + 0.42 * np.sin(2 * np.pi * 2 * f * t) + 0.16 * np.sin(2 * np.pi * 3 * f * t)
    x = np.tanh(1.4 * x) / np.tanh(1.4)
    env = (1 - np.exp(-t / 0.004)) * np.exp(-t / (dur * 1.6))
    env *= np.clip((dur + 0.04 - t) / 0.04, 0, 1)
    x = filt(x * env * vel, "lowpass", 900)
    return fade_edges(x, a=0.001, r=0.02)


def sub_drone(m, dur, attack=0.4, release=0.8):
    n = int(dur * SR)
    t = secs(n)
    f = midi(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    env = np.clip(t / attack, 0, 1) ** 2 * np.clip((dur - t) / release, 0, 1) ** 1.5
    return x * env


def whoosh(dur, peak=0.55, f0=300.0, f1=2600.0, pan0=0.0, pan1=0.0, width_oct=1.3, tone=None):
    """Airy pass-by: pink noise through a swept band-pass, swelling to `peak` (fraction)."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    tp = np.clip(peak, 0.05, 0.95)
    rise = np.clip(u / tp, 0, 1) ** 2.4
    fall = np.clip((1 - u) / (1 - tp), 0, 1) ** 1.6
    env = np.where(u < tp, rise, fall)
    fc = f0 * (f1 / f0) ** u
    x = tv_filter(pink(n), "bandpass", fc, width_oct=width_oct)
    x = x / (np.max(np.abs(x)) + 1e-9) * env
    if tone:
        ph = 2 * np.pi * np.cumsum(tone[0] * (tone[1] / tone[0]) ** u) / SR
        x += 0.12 * np.sin(ph) * env
    pans = pan0 + (pan1 - pan0) * u
    gl, gr = pan_gains(pans)
    return fade_edges(np.vstack([x * gl, x * gr]), a=0.002, r=0.02)


def riser(dur, f0=300.0, f1=6000.0, pitch=(110.0, 440.0), curve=3.0, tail=0.012):
    """Noise + detuned saw sweep, exponential crescendo, ending hard at `dur`."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    env = u ** curve
    fc = f0 * (f1 / f0) ** (u ** 1.5)
    nz = tv_filter(noise(n), "bandpass", fc, width_oct=1.6)
    nz /= np.max(np.abs(nz)) + 1e-9
    fp = pitch[0] * (pitch[1] / pitch[0]) ** (u ** 1.3)
    tone = np.zeros(n)
    for c in (-11, 0, 9):
        ph = 2 * np.pi * np.cumsum(fp * 2 ** (c / 1200)) / SR
        tone += np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    tone = filt(tone / 3, "lowpass", 3500)
    x = (nz * 0.8 + tone * 0.35) * env
    out = np.vstack([x, delayed(x, 37)])  # sub-millisecond offset: width without wrap-round
    return fade_edges(out, a=0.01, r=tail)


def reverse_swell(dur, hp=2500.0):
    """Reverse-cymbal style swell into a downbeat."""
    n = int(dur * SR)
    t = secs(n)
    x = filt(noise(n), "highpass", hp, order=2)
    x = filt(x, "lowpass", 11000)
    env = np.exp((t - dur) / (dur * 0.28))
    st = np.vstack([x * env, delayed(x * env, 53)])
    return fade_edges(st / (np.max(np.abs(st)) + 1e-9), a=0.01, r=0.008)


def ui_click(bright=1.0):
    """Tactile UI click: short high 'tock' + low thump + tiny noise tick."""
    n = int(0.12 * SR)
    t = secs(n)
    tock = np.sin(2 * np.pi * 2350 * bright * t) * np.exp(-t / 0.006)
    body = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.018) * 0.7
    tick = filt(noise(n), "highpass", 5000) * np.exp(-t / 0.0012) * 0.5
    return fade_edges((tock * 0.55 + body + tick), a=0.0002, r=0.02)


def blip(f0=620.0, f1=1240.0, dur=0.16):
    """Bubble pop for the chip: quick upward pitch flick."""
    n = int(dur * SR)
    t = secs(n)
    f = f1 - (f1 - f0) * np.exp(-t / 0.012)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.045) * (1 - np.exp(-t / 0.001))
    return fade_edges(x, a=0.0003, r=0.03)


def air_bed(dur, level_curve):
    """High, quiet shimmer of filtered noise — the 'expensive' air on top of the mix."""
    n = int(dur * SR)
    x = filt(np.vstack([noise(n), noise(n)]), "highpass", 7000, order=2)
    x = filt(x, "lowpass", 15000)
    return x * level_curve(np.linspace(0, 1, n))


# ---------------------------------------------------------------------------- effects

def make_ir(rt60=2.3, length=3.4, predelay=0.014, bright_hz=7500.0, dark_hz=2600.0):
    n = int(length * SR)
    t = secs(n)
    decay = 10 ** (-3 * t / rt60)
    ir = []
    for _ in range(2):
        w = noise(n)
        bright = filt(w, "lowpass", bright_hz)
        dark = filt(w, "lowpass", dark_hz)
        mix = np.clip(t / (rt60 * 0.6), 0, 1)
        x = (bright * (1 - mix) + dark * mix) * decay
        x = filt(x, "highpass", 180)  # keep the low end dry and tight
        x[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
        ir.append(x)
    ir = np.vstack(ir)
    pd = int(predelay * SR)
    ir = np.pad(ir, ((0, 0), (pd, 0)))[:, :n]
    return ir / np.sqrt(np.sum(ir**2) / 2)


def reverb(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    l_in = x[0] + 0.35 * x[1]
    r_in = x[1] + 0.35 * x[0]
    wl = signal.oaconvolve(l_in, ir[0])[:N]
    wr = signal.oaconvolve(r_in, ir[1])[:N]
    return np.vstack([wl, wr])


def pingpong(x: np.ndarray, delay=0.375, feedback=0.34, lp=4200.0, taps=7) -> np.ndarray:
    out = np.zeros_like(x)
    d = int(delay * SR)
    src = filt(x.sum(axis=0) * 0.5, "lowpass", lp)
    src = filt(src, "highpass", 300)
    g = 1.0
    for k in range(1, taps + 1):
        g *= feedback
        ch = (k + 1) % 2
        shift = d * k
        if shift >= N:
            break
        out[ch, shift:] += src[: N - shift] * g
        src = filt(src, "lowpass", lp * 0.9)
    return out


def sidechain(times, depth=0.55, release=0.17, attack=0.004) -> np.ndarray:
    g = np.ones(N)
    t = secs(N)
    for tk in times:
        i = int(tk * SR)
        seg = t[i:] - tk
        duck = depth * (1 - np.exp(-seg / attack)) * np.exp(-seg / release)
        # ramp in over the attack so the duck itself never clicks
        g[i:] = np.minimum(g[i:], 1 - duck)
    return g


# ---------------------------------------------------------------------------- metering

_K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def lufs(x: np.ndarray) -> float:
    """Integrated loudness, ITU-R BS.1770-4 (48 kHz coefficients), gated."""
    x = np.atleast_2d(x)
    y = signal.lfilter(*_K1, x, axis=-1)
    y = signal.lfilter(*_K2, y, axis=-1)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if y.shape[1] < blk:
        return -np.inf
    starts = range(0, y.shape[1] - blk + 1, hop)
    z = np.array([np.mean(y[:, s : s + blk] ** 2, axis=1).sum() for s in starts])
    lk = -0.691 + 10 * np.log10(z + 1e-20)
    z = z[lk > -70]
    if not len(z):
        return -np.inf
    rel = -0.691 + 10 * np.log10(np.mean(z)) - 10
    z = z[(-0.691 + 10 * np.log10(z)) > rel]
    return float(-0.691 + 10 * np.log10(np.mean(z)))


def true_peak(x: np.ndarray) -> float:
    up = signal.resample_poly(x, 4, 1, axis=-1)
    return float(20 * np.log10(np.max(np.abs(up)) + 1e-12))


def limiter(x: np.ndarray, ceiling_db=-1.0, lookahead=0.004, release=0.09) -> np.ndarray:
    """Look-ahead brickwall limiter with 4x oversampled (true-peak) detection."""
    ceil = db(ceiling_db)
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(axis=0)
    tp = up[: (len(up) // 4) * 4].reshape(-1, 4).max(axis=1)
    tp = np.pad(tp, (0, x.shape[1] - len(tp)), mode="edge")
    req = np.minimum(1.0, ceil / np.maximum(tp, 1e-12))
    w = max(1, int(lookahead * SR))
    # forward-looking minimum, then a backward moving average of the same width:
    # every output sample stays at or below the gain its own peak requires.
    g = minimum_filter1d(req, size=2 * w + 1, origin=-w, mode="nearest")
    g = uniform_filter1d(g, size=w, origin=(w - 1) // 2, mode="nearest")
    g = np.minimum(g, req)
    a = np.exp(-1 / (release * SR))
    out = g.copy()
    for i in range(1, len(out)):  # slow recovery only
        if out[i] > out[i - 1]:
            out[i] = out[i - 1] * a + out[i] * (1 - a)
    return x * out


# ---------------------------------------------------------------------------- the score

CHORDS = {
    # pad voicings (upper structure) and bass root
    "Fmaj9": ([53, 57, 60, 64, 67], 29),  # F1
    "Dm9": ([50, 57, 60, 64, 65], 38),  # D2
    "Bbmaj9": ([50, 57, 60, 62, 65], 34),  # B♭1
    "Gm9": ([50, 57, 58, 62, 65], 31),  # G1
    "C9sus4": ([48, 55, 58, 62, 65], 36),  # C2
    "C7": ([48, 55, 58, 62, 64], 36),
}
ARP_TONES = {
    "Dm9": [69, 72, 76, 77],
    "Bbmaj9": [70, 74, 77, 81],
    "Gm9": [70, 74, 77, 81],
    "C9sus4": [70, 72, 77, 79],
    "C7": [70, 72, 76, 79],
}

# Harmonic timeline: (start, end, chord)
HARMONY = [
    (0.0, beat(0), "Fmaj9"),
    (beat(0), bar_start(1), "Dm9"),
    (bar_start(1), bar_start(2), "Bbmaj9"),
    (bar_start(2), bar_start(3), "Gm9"),
    (bar_start(3), beat(13), "C9sus4"),
    (beat(13), bar_start(4), "C7"),  # resolves as the option is selected (beat 13 = 8.975)
    (bar_start(4), beat(17), "Bbmaj9"),
    (beat(17), bar_start(5), "C9sus4"),
    (bar_start(5), DUR, "Fmaj9"),
]


def chord_at(t: float) -> str:
    for a, b, c in HARMONY:
        if a <= t < b:
            return c
    return HARMONY[-1][2]


def compose():
    buses = {k: Bus(k) for k in ("kick", "bass", "pad", "arp", "perc", "bells", "fx", "impact", "ui", "air")}
    rev_send = Bus("rev_send")
    dly_send = Bus("dly_send")
    events = []

    def ev(t, what):
        events.append({"t": round(float(t), 4), "event": what})

    # ---- pad: one chord region per harmony span, cross-faded; filter opens through the film
    def pad_cut(t):
        if t < GRID0:
            return 650 + 1350 * (t / GRID0) ** 1.4
        if t < bar_start(1):
            return 2000
        if t < bar_start(4) - BEAT:
            return 2200 + 900 * (t - bar_start(1)) / (bar_start(4) - bar_start(1))
        if t < bar_start(5):
            return 3000
        return 3600 - 1600 * np.clip((t - bar_start(5)) / 3.0, 0, 1)

    for a, b, c in HARMONY:
        notes, _ = CHORDS[c]
        attack = 1.1 if a == 0.0 else 0.18
        dur = b - a + 0.08
        rel = 1.6 if c == "Fmaj9" and a > 1 else 0.45
        t_abs = a + secs(int((dur + rel) * SR))
        cut = np.array([pad_cut(tt) for tt in t_abs[::128]]).repeat(128)[: len(t_abs)]
        x = pad_chord(notes, dur, attack=attack, release=rel, cutoff=cut, bright=1.15 if c == "Fmaj9" and a > 1 else 1.0)
        buses["pad"].add(x, a)
        rev_send.add(x, a, gain=0.35)

    # ---- intro: air bed, reverse swell into the mark, the sonic-logo bells, wipe swish, sheen
    buses["air"].add(air_bed(DUR, lambda u: 0.35 + 0.65 * np.clip(u * 3, 0, 1)), 0.0)
    buses["fx"].add(reverse_swell(0.42, hp=3200), CUE["mark_land"] - 0.42, gain=0.55)
    logo_bells = [(CUE["mark_land"], 77), (CUE["bar_land"][0], 81), (CUE["bar_land"][1], 84)]
    for (t, m), p in zip(logo_bells, (-0.15, 0.1, 0.3)):
        b = fm_bell(midi(m), dur=2.6, decay=1.7)
        buses["bells"].add(b, t, pan=p, gain=1.0 if m == 77 else 0.8)
        rev_send.add(b, t, pan=p, gain=0.7)
        ev(t, f"sonic logo bell {m}")
    w0, w1 = CUE["wipe"]
    buses["fx"].add(whoosh(w1 - w0 + 0.15, peak=0.48, f0=900, f1=5200, pan0=-0.7, pan1=0.7, width_oct=1.1), w0, gain=0.5)
    ev(0.86, "wipe swish (L→R)")
    s0, s1 = CUE["sheen"]
    for k, m in enumerate((84, 88, 91, 93)):  # C6 E6 G6 A6 glitter across the sheen
        t = s0 + 0.08 + k * 0.12
        g = fm_bell(midi(m), dur=1.6, index=0.8, decay=0.9, sparkle=0.35)
        buses["bells"].add(g, t, pan=-0.6 + k * 0.4, gain=0.32)
        rev_send.add(g, t, pan=-0.6 + k * 0.4, gain=0.5)
    ev(s0 + 0.08, "sheen glitter (L→R)")

    # ---- the sheet rises: riser + upward whoosh into the landing impact
    r_t0 = 1.15
    buses["fx"].add(riser(GRID0 - r_t0, f0=500, f1=7000, pitch=(87.3, 349.2), curve=2.6), r_t0, gain=0.42)
    sh0, sh1 = CUE["sheet"]
    buses["fx"].add(whoosh(sh1 - sh0 + 0.05, peak=0.45, f0=180, f1=2400, width_oct=1.6, tone=(90, 260)), sh0, gain=0.8)
    ev(2.22, "sheet whoosh peak")

    def hit(t, root_midi, size=1.0, label="impact"):
        buses["impact"].add(boom(f_lo=midi(root_midi), decay=1.1 + 0.6 * size), t, gain=size)
        burst = filt(noise(int(0.5 * SR)), "lowpass", 3500) * np.exp(-secs(int(0.5 * SR)) / 0.09)
        buses["impact"].add(fade_edges(np.vstack([burst, delayed(burst, 41)])), t, gain=0.22 * size)
        rev_send.add(np.vstack([burst, burst]), t, gain=0.5 * size)
        ev(t, label)

    hit(beat(0), 38, 0.8, "sheet lands — impact")
    buses["fx"].add(reverse_swell(0.5), beat(0) - 0.5, gain=0.35)

    # ---- drums
    kicks = []

    def add_kick(t, vel=1.0):
        buses["kick"].add(kick(vel), t)
        kicks.append(t)

    for i in (0, 2):  # bar 1: half-time
        add_kick(beat(i), 1.0 if i == 0 else 0.85)
    for i in range(4, 14):  # bars 2-3 + bar 4 up to the break: four on the floor
        add_kick(beat(i), 0.92)
    for i in range(15, 18):  # bar 5 (the click on beat 4 takes the accent)
        add_kick(beat(i), 0.95)

    # snaps on the backbeat: beats 2 & 4 (bar 3 is 3/4; beat 14 is the break; 18 is the click)
    for i in (5, 7, 9, 12, 16):
        s_ = snap(0.8)
        buses["perc"].add(s_, beat(i), pan=0.08)
        rev_send.add(s_, beat(i), gain=0.35)

    # hats: 8ths in bar 1's second half, then 16ths with offbeat accents
    def hats(t0, t1, step, accents):
        k = 0
        t = t0
        while t < t1 - 1e-6:
            vel = accents[k % len(accents)]
            buses["perc"].add(hat(vel), t, pan=0.28 if k % 2 else 0.18)
            k += 1
            t += step

    hats(beat(2) + BEAT / 2, beat(4), BEAT, [0.5])
    hats(beat(4), beat(14), BEAT / 4, [0.35, 0.22, 0.7, 0.25])
    hats(beat(15), beat(18), BEAT / 4, [0.4, 0.25, 0.75, 0.28])

    # ---- bass: sustained root in bar 1, rolling offbeat 8ths from the pull-back
    buses["bass"].add(sub_drone(CHORDS["Dm9"][1], bar_start(1) - beat(0) + 0.1, attack=0.03, release=0.25), beat(0), gain=0.9)
    for i in list(range(4, 14)) + list(range(15, 18)):  # rests under the break and the pre-drop
        t = beat(i) + BEAT / 2
        root = CHORDS[chord_at(t)][1]
        buses["bass"].add(bass_note(root, BEAT / 2 * 0.86, 0.95), t)
    # the end: long sub on F under the hit
    buses["bass"].add(sub_drone(CHORDS["Fmaj9"][1], 2.6, attack=0.01, release=1.8), bar_start(5), gain=0.75)

    # ---- word plucks: rising Dm9 chord tones as each new word rolls in
    for t, m in zip(CUE["words"], (69, 72, 76)):
        p = mallet(midi(m))
        buses["bells"].add(p, t + 0.04, pan=-0.25, gain=0.75)
        dly_send.add(p, t + 0.04, gain=0.35)
        rev_send.add(p, t + 0.04, gain=0.3)
        ev(t + 0.04, f"word pluck {m}")

    # ---- 16th arp from the pull-back to the break, and through bar 5
    def arp(t0, t1, open0, open1):
        k = 0
        t = t0
        while t < t1 - 1e-6:
            tones = ARP_TONES[chord_at(t)]
            pattern = (0, 1, 2, 3, 2, 1, 3, 1)
            m = tones[pattern[k % len(pattern)]]
            vel = (0.9, 0.45, 0.65, 0.45)[k % 4]
            u = (t - t0) / (t1 - t0)
            idx = 0.9 + (open1 - open0) * u + open0
            x = fm_pluck(midi(m), index=idx, decay=0.2)
            pan = -0.35 if k % 2 else 0.35
            buses["arp"].add(x, t, pan=pan, gain=vel)
            dly_send.add(x, t, pan=pan, gain=vel * 0.4)
            rev_send.add(x, t, gain=vel * 0.25)
            k += 1
            t += BEAT / 4

    arp(bar_start(1), beat(14), 0.2, 1.1)
    arp(bar_start(4), beat(18), 0.9, 1.5)

    # ---- pull-back: wide airy whoosh at the camera's peak speed
    p0, p1 = CUE["pullback"]
    buses["fx"].add(whoosh(1.15, peak=0.39, f0=220, f1=1800, pan0=-0.5, pan1=0.5, width_oct=1.8), p0 - 0.05, gain=0.75)
    buses["fx"].add(reverse_swell(0.6, hp=4000), bar_start(1) - 0.6, gain=0.25)
    ev(5.0, "pull-back whoosh peak")

    # ---- cards lift: three ascending bells as a pickup into bar 3
    for t, m, p in zip(CUE["cards"], (74, 77, 81), (-0.4, 0.0, 0.4)):
        b = fm_bell(midi(m), dur=1.8, index=1.0, decay=0.9)
        buses["bells"].add(b, t + 0.03, pan=p, gain=0.55)
        rev_send.add(b, t + 0.03, pan=p, gain=0.45)
        ev(t + 0.03, f"card lift bell {m}")

    # ---- form + info cards slide in (opposite directions)
    f0_, f1_ = CUE["form_in"]
    buses["fx"].add(whoosh(0.62, peak=0.25, f0=1600, f1=420, pan0=0.75, pan1=0.1), f0_ - 0.06, gain=0.6)
    i0_, _ = CUE["info_in"]
    buses["fx"].add(whoosh(0.55, peak=0.25, f0=1300, f1=380, pan0=-0.75, pan1=-0.15), i0_ - 0.05, gain=0.35)
    ev(f0_ + 0.1, "form whoosh (R→L)")

    # ---- the click, the selection resolving to C7, the chip
    buses["ui"].add(ui_click(), CUE["click1"], pan=0.3)
    ev(CUE["click1"], "click: Custom Website")
    for t, m in ((CUE["select"] + 0.02, 79), (CUE["select"] + 0.1, 84)):
        b = fm_bell(midi(m), dur=1.4, index=0.9, decay=0.7)
        buses["bells"].add(b, t, pan=0.25, gain=0.42)
        rev_send.add(b, t, pan=0.25, gain=0.35)
    ev(CUE["select"] + 0.02, "selection chime G5→C6")
    buses["ui"].add(blip(), CUE["chip"], pan=0.55, gain=0.55)
    ev(CUE["chip"], "chip pop")

    # ---- break: riser + the UI scrolling away, into the statement downbeat
    buses["fx"].add(riser(beat(15) - beat(14) + 0.02, f0=700, f1=9000, pitch=(130.8, 523.3), curve=2.2), beat(14), gain=0.38)
    e0, e1 = CUE["exit"]
    buses["fx"].add(whoosh(e1 - e0 + 0.08, peak=0.72, f0=300, f1=3600, width_oct=1.5), e0, gain=0.55)
    buses["fx"].add(reverse_swell(0.5), beat(15) - 0.5, gain=0.4)
    hit(beat(15), 34, 0.6, "statement — impact")
    s_t = CUE["statement"][1] + 0.06
    b = fm_bell(midi(84), dur=2.0, index=0.7, decay=1.1)
    buses["bells"].add(b, s_t, pan=0.2, gain=0.3)
    rev_send.add(b, s_t, pan=0.2, gain=0.45)
    ev(s_t, "accent on 'Before work begins.'")

    # ---- Get a Quote click on beat 4, then the big riser into the end card
    buses["ui"].add(ui_click(1.08), CUE["click2"], pan=0.05, gain=1.1)
    ev(CUE["click2"], "click: Get a Quote")
    buses["fx"].add(riser(bar_start(5) - beat(17), f0=400, f1=11000, pitch=(130.8, 698.5), curve=2.8), beat(17), gain=0.5)
    x0, _ = CUE["expand"]
    buses["fx"].add(whoosh(0.62, peak=0.55, f0=260, f1=3200, pan0=0.0, pan1=0.0, width_oct=2.0, tone=(120, 340)), x0, gain=0.6)
    buses["fx"].add(reverse_swell(0.7), bar_start(5) - 0.7, gain=0.5)
    ev(11.9, "expansion whoosh peak")

    # ---- the end card: big hit, shimmer chord, sonic-logo bells, long Fmaj9 tail
    add_kick(bar_start(5), 1.0)
    hit(bar_start(5), 29, 1.0, "end card — impact")
    for k, m in enumerate((65, 69, 72, 76, 79)):  # Fmaj9 shimmer
        b = fm_bell(midi(m), dur=3.0, index=1.1, decay=1.9, sparkle=0.3)
        buses["bells"].add(b, bar_start(5) + 0.012 * k, pan=-0.5 + 0.25 * k, gain=0.38)
        rev_send.add(b, bar_start(5) + 0.012 * k, pan=-0.5 + 0.25 * k, gain=0.55)
    end_bells = [(CUE["end_mark"], 77), (CUE["end_bars"][0], 81), (CUE["end_bars"][1], 84)]
    for (t, m), p in zip(end_bells, (-0.15, 0.1, 0.3)):
        b = fm_bell(midi(m), dur=2.6, decay=1.6)
        buses["bells"].add(b, t, pan=p, gain=0.9 if m == 77 else 0.75)
        rev_send.add(b, t, pan=p, gain=0.75)
        ev(t, f"sonic logo bell (reprise) {m}")

    return buses, rev_send, dly_send, kicks, events


# Relative stem loudness targets (LUFS, gated over each stem's active part). The whole mix is
# normalised afterwards, so only the differences matter.
STEM_LUFS = {
    "kick": -19.0,
    "bass": -21.0,
    "pad": -23.5,
    "arp": -28.0,
    "perc": -31.0,
    "bells": -25.0,
    "fx": -24.0,
    "impact": -21.0,
    "ui": -26.0,
    "air": -40.0,
}
TARGET_LUFS = -14.0
CEILING_DBTP = -1.0


def master(buses, rev_send, dly_send, kicks):
    gains = {}
    for name, bus in buses.items():
        lv = lufs(bus.x)
        g = db(STEM_LUFS[name] - lv) if np.isfinite(lv) else 0.0
        gains[name] = g
        bus.x *= g
    # sends follow their sources' gain staging roughly; scale returns to a fixed level
    ir = make_ir()
    wet = reverb(rev_send.x, ir)
    wet *= db(-27.0 - lufs(wet))
    dly = pingpong(dly_send.x)
    dly *= db(-31.0 - lufs(dly))

    sc = sidechain(kicks, depth=0.5)
    buses["pad"].x *= sc
    buses["bass"].x *= sidechain(kicks, depth=0.35, release=0.12)
    wet *= 0.6 + 0.4 * sc

    mix = sum(b.x for b in buses.values()) + wet + dly
    mix = filt(mix, "highpass", 26)

    # fades: tiny fade-in, cosine fade-out into exact silence at 15.000 s
    t = secs(N)
    mix *= np.clip(t / 0.01, 0, 1)
    fo = np.clip((t - 14.25) / 0.75, 0, 1)
    mix *= 0.5 + 0.5 * np.cos(np.pi * fo)

    # loudness to target, limited to the true-peak ceiling (iterate: limiting lowers loudness)
    out = mix
    for _ in range(4):
        out = out * db(TARGET_LUFS - lufs(out))
        out = limiter(out, ceiling_db=CEILING_DBTP - 0.15)
        if abs(lufs(out) - TARGET_LUFS) < 0.15:
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
    buses, rev_send, dly_send, kicks, events = compose()
    out, gains = master(buses, rev_send, dly_send, kicks)
    wav = OUT / "ozen-launch-15s-score.wav"
    write_wav24(wav, out)
    report = {
        "file": str(wav.relative_to(HERE.parent)),
        "sample_rate": SR,
        "duration": DUR,
        "bpm": BPM,
        "grid0": GRID0,
        "integrated_lufs": round(lufs(out), 2),
        "true_peak_dbtp": round(true_peak(out), 2),
        "harmony": [{"start": round(a, 3), "end": round(b, 3), "chord": c} for a, b, c in HARMONY],
        "kicks": [round(k, 4) for k in kicks],
        "events": sorted(events, key=lambda e: e["t"]),
    }
    (OUT / "score-cues.json").write_text(json.dumps(report, indent=2))
    print(f"{wav}  {report['integrated_lufs']} LUFS  {report['true_peak_dbtp']} dBTP")
    return 0


if __name__ == "__main__":
    sys.exit(main())
