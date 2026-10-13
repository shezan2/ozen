#!/usr/bin/env python3
"""Ozen Digital launch film: original score and sound design, synthesised in code.

Every sound is generated from oscillators and noise, so the track is wholly owned (no samples,
no licences). It is locked to the picture: the cue times below mirror the timeline in
../film.js, and the groove is 120 BPM anchored so its beats land on the sheet landing, the
statement and the end-card hit.

    python3 -m venv .venv && .venv/bin/pip install -r audio/requirements.txt
    .venv/bin/python audio/score.py       # → out/ozen-launch-15s-score.wav + out/score-cues.json
    node render.mjs --mux                 # attach it to the film

Deterministic: each sound draws from its own seeded noise stream, so the same code gives the
same file, and editing one sound does not re-roll the others.

Arc (F major):
    0.00   Intro, rubato  Fmaj9 pad swells in. The sonic logo — F5, C6, A5 on a clean bell —
                          plays as the compass-O lands, the first umlaut bar lands and the
                          ZEN wipe completes. An airy swish follows the wipe; a riser builds.
    2.475  Bar 1  Dm9     The sheet lands: impact. Half-time kick, sustained bass, a mallet note
                          on each new word.
    4.475  Bar 2  B♭maj9  Pull-back: four-on-the-floor, offbeat bass, 8th-note arp, offbeat hats.
    6.475  Bar 3  Gm9 3/4 Cards lift (mallets); a ghost snap leads the form in.
    7.975  Bar 4  C9sus4  16ths build. The click; the sus resolves to C7 as the option is picked.
    9.475  Break          Riser as the UI scrolls away.
    9.975  Bar 5  B♭maj9 → C9sus4   "Fixed price." Breakdown: impact, pad and bass only.
                          Click on Get a Quote, a short silence, then…
   11.975  End    Fmaj9   …the end-card hit (the loudest moment), the sonic logo again in the
                          same rhythm as the logo rebuilds, and the chord decays to silence.
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
# Keep in step with the film if its timing changes.
CUE = {
    "mark_land": 0.43,  # compass-O settles
    "bar_land": 0.76,  # first umlaut bar lands
    "wipe": (0.40, 1.32),  # ZEN wipe; peak speed 0.86, complete 1.32
    "sheen": (1.32, 2.05),  # cobalt sheen; crosses the logo 1.47–1.90
    "sheet": (1.95, 2.55),  # cobalt sheet rises; peak speed 2.22, lands ~2.45
    "words": (2.62, 3.30, 3.95),  # "websites." / "online stores." / "digital tools."
    "pullback": (4.55, 5.55),  # camera pulls back; peak speed 5.00
    "scroll": (5.38, 6.18),  # page scrolls to pricing; peak speed 5.74
    "cards": (6.12, 6.20, 6.28),  # pricing cards lift (staggered)
    "form_in": (7.55, 8.30),  # enquiry form slides in from the right; peak 7.64
    "info_in": (7.65, 8.40),  # info card slides in from the left; peak 7.76
    "click1": 8.958,  # cursor press on "Custom Website" (press peak 8.96)
    "select": 8.98,  # option turns cobalt, tick pops
    "chip": 9.14,  # "We reply within 24 hours" chip pops
    "exit": (9.60, 10.10),  # UI rig scrolls up and away; visible motion peaks 9.81–9.87
    "statement": (10.0, 10.16),  # "Fixed price." / "Before work begins."
    "click2": 11.51,  # cursor press on Get a Quote (press peak 11.52)
    "expand": (11.58, 12.30),  # button opens into the end card; peak speed 11.90, 85% at 12.01
    "end_mark": 12.34,  # end-card mark settles
    "end_bar": 12.60,  # end-card first umlaut bar lands
    "end_wipe_done": 13.06,  # end-card ZEN wipe completes (12.08 + 1.2 × 0.82)
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


def bar_of(t: float) -> int:
    return max(i for i in range(len(BARS)) if bar_start(i) <= t + 1e-6)


# ---------------------------------------------------------------------------- helpers

_rng = np.random.default_rng(SEED)


def reseed(tag: str):
    """Give the next sound(s) their own deterministic noise stream."""
    global _rng
    _rng = np.random.default_rng([SEED, zlib.crc32(tag.encode())])


def db(x):
    return 10 ** (np.asarray(x, dtype=float) / 20)


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
    return _rng.standard_normal(n)


def pink(n: int) -> np.ndarray:
    w = _rng.standard_normal(n)
    spec = np.fft.rfft(w)
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    spec /= np.sqrt(f)
    p = np.fft.irfft(spec, n)
    return p / (np.std(p) + 1e-12)


def saw_bl(f: float, n: int, phase=0.0, fmax=9000.0) -> np.ndarray:
    """Band-limited sawtooth (additive), harmonics up to fmax."""
    t = secs(n)
    k_max = max(1, int(min(fmax, SR * 0.45) // f))
    out = np.zeros(n)
    w = 2 * np.pi * f * t
    for k in range(1, k_max + 1):
        out += np.sin(k * (w + phase)) / k
    return out * (2 / np.pi)


# ---------------------------------------------------------------------------- instruments

def pad_voice(m, dur, attack, release, cutoff, detune=(-8.0, 0.0, 7.0)):
    """One pad voice: 3 detuned band-limited saws spread in stereo, low-passed, cleared below
    120 Hz so it never sits on the bass fundamentals."""
    total = dur + release
    n = int(total * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    f0 = midi(m)
    for k, c in enumerate(detune):
        s = saw_bl(f0 * 2 ** (c / 1200), n, _rng.uniform(0, 2 * np.pi))
        gl, gr = pan_gains((k - 1) * 0.55)
        L += s * gl
        R += s * gr
    x = np.vstack([L, R]) / np.sqrt(len(detune))
    x = tv_filter(x, "lowpass", cutoff)
    x = filt(x, "highpass", 120)
    t = secs(n)
    env = np.clip(t / attack, 0, 1) ** 1.5
    rel = np.clip((total - t) / release, 0, 1)
    return x * env * (0.5 - 0.5 * np.cos(np.pi * rel))


def fm_bell(f, dur=2.6, ratio=3.0, index=1.0, idecay=0.55, decay=1.5, sparkle=0.15):
    """Clean FM bell. Integer ratio keeps every partial harmonic, so it blends into the key."""
    n = int(dur * SR)
    t = secs(n)
    mod = index * np.exp(-t / idecay) * np.sin(2 * np.pi * f * ratio * t)
    x = np.sin(2 * np.pi * f * t + mod)
    x += sparkle * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / (decay * 0.25))
    env = (1 - np.exp(-t / 0.0015)) * np.exp(-t / decay)
    env *= np.clip((dur - t) / (0.45 * dur), 0, 1) ** 2  # taper the tail to zero
    return fade_edges(x * env, a=0.0005, r=0.005)


def fm_pluck(f, dur=0.6, index=1.9, idecay=0.07, decay=0.22):
    n = int(dur * SR)
    t = secs(n)
    mod = index * np.exp(-t / idecay) * np.sin(2 * np.pi * f * t)
    x = np.sin(2 * np.pi * f * t + mod)
    env = (1 - np.exp(-t / 0.001)) * np.exp(-t / decay)
    env *= np.clip((dur - t) / (0.4 * dur), 0, 1) ** 2
    return fade_edges(x * env, a=0.0005, r=0.005)


def mallet(f, dur=1.4, decay=0.42):
    """Soft marimba-like tone: fundamental plus fast-decaying upper partials."""
    n = int(dur * SR)
    t = secs(n)
    x = np.sin(2 * np.pi * f * t) + 0.32 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t / 0.045)
    x += 0.12 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t / 0.012)
    env = (1 - np.exp(-t / 0.0012)) * np.exp(-t / decay)
    env *= np.clip((dur - t) / (0.4 * dur), 0, 1) ** 2
    return fade_edges(x * env, a=0.0005, r=0.005)


def kick(vel=1.0, decay=0.16, f_hi=118.0, f_lo=47.0, sweep=0.042, click=0.40):
    """Tight kick: short low tail (so the offbeat bass speaks), a 2nd-harmonic knock and a
    click so it reads on phone speakers."""
    n = int(0.6 * SR)
    t = secs(n)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / sweep)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / decay) * (1 - np.exp(-t / 0.0012))
    body += 0.5 * np.sin(2 * ph) * np.exp(-t / 0.035)
    c = filt(noise(n), "highpass", 2500) * np.exp(-t / 0.0035) * click
    x = np.tanh(1.5 * (body + c)) / np.tanh(1.5)
    return fade_edges(x * vel, a=0.0003, r=0.05)


def boom(f_lo=87.3, f_hi=140.0, decay=1.3, dur=3.0):
    """Impact body: sine sweeping down onto the root, with harmonics so small speakers hear it."""
    n = int(dur * SR)
    t = secs(n)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.07)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
    env = (1 - np.exp(-t / 0.002)) * np.exp(-t / decay)
    env *= np.clip((dur - t) / (0.4 * dur), 0, 1) ** 2
    return fade_edges(np.tanh(1.2 * x * env) / np.tanh(1.2), a=0.0005, r=0.01)


def hat(vel=1.0, decay=0.032):
    n = int(0.22 * SR)
    t = secs(n)
    x = filt(noise(n), "highpass", 7200, order=4)
    x += 0.5 * filt(noise(n), "bandpass", [9000, 13000])
    x = filt(x, "lowpass", 12000)
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


def _harmonic_bass(f, t, partials):
    return sum(a * np.sin(2 * np.pi * k * f * t) for k, a in partials)


def bass_note(m, dur, vel=1.0):
    """Rounded bass with real upper harmonics plus a saturated layer above 150 Hz, so the line
    still reads on a phone speaker."""
    n = int((dur + 0.04) * SR)
    t = secs(n)
    x = _harmonic_bass(midi(m), t, ((1, 1.0), (2, 0.8), (3, 0.5), (4, 0.3), (5, 0.16)))
    x = np.tanh(2.0 * x) / np.tanh(2.0)
    x = x + 0.5 * filt(np.tanh(3.0 * x), "highpass", 150, order=4)
    env = (1 - np.exp(-t / 0.004)) * np.exp(-t / (dur * 1.6))
    env *= np.clip((dur + 0.04 - t) / 0.04, 0, 1)
    x = filt(x * env * vel, "lowpass", 1500)
    return fade_edges(x, a=0.001, r=0.02)


def sub_drone(m, dur, attack=0.4, release=0.8):
    n = int(dur * SR)
    t = secs(n)
    x = _harmonic_bass(midi(m), t, ((1, 1.0), (2, 0.7), (3, 0.35), (4, 0.18)))
    x = np.tanh(1.3 * x) / np.tanh(1.3)
    env = np.clip(t / attack, 0, 1) ** 2 * np.clip((dur - t) / release, 0, 1) ** 1.5
    return x * env


def whoosh(dur, peak=0.5, f0=300.0, f1=2600.0, pan0=0.0, pan1=0.0, width_oct=1.3, tone=None):
    """Airy pass-by: pink noise through a swept band-pass, swelling to `peak` (fraction)."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    tp = np.clip(peak, 0.05, 0.95)
    env = np.where(u < tp, np.clip(u / tp, 0, 1) ** 2.4, np.clip((1 - u) / (1 - tp), 0, 1) ** 1.6)
    fc = f0 * (f1 / f0) ** u
    x = tv_filter(pink(n), "bandpass", fc, width_oct=width_oct, block=32)
    x = x / (np.max(np.abs(x)) + 1e-9) * env
    if tone:
        ph = 2 * np.pi * np.cumsum(tone[0] * (tone[1] / tone[0]) ** u) / SR
        x += 0.12 * np.sin(ph) * env
    gl, gr = pan_gains(pan0 + (pan1 - pan0) * u)
    return fade_edges(np.vstack([x * gl, x * gr]), a=0.002, r=0.02)


def riser(dur, f0=300.0, f1=6000.0, pitch=(110.0, 440.0), curve=3.0, tail=0.006):
    """Decorrelated noise (one stream per channel) + a centred detuned-saw sweep, exponential
    crescendo, ending at `dur` with a short tail."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    env = u**curve
    fc = f0 * (f1 / f0) ** (u**1.5)
    nz = []
    for _ in range(2):
        z = tv_filter(noise(n), "bandpass", fc, width_oct=1.6, block=32)
        nz.append(z / (np.max(np.abs(z)) + 1e-9))
    fp = pitch[0] * (pitch[1] / pitch[0]) ** (u**1.3)
    tone = np.zeros(n)
    for c in (-11, 0, 9):
        ph = 2 * np.pi * np.cumsum(fp * 2 ** (c / 1200)) / SR
        tone += np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    tone = filt(tone / 3, "lowpass", 3500)
    out = np.vstack([(nz[0] * 0.8 + tone * 0.35) * env, (nz[1] * 0.8 + tone * 0.35) * env])
    return fade_edges(out, a=0.01, r=tail)


def reverse_swell(dur, hp=2500.0):
    """Reverse-cymbal style swell into a downbeat (independent noise per channel)."""
    n = int(dur * SR)
    t = secs(n)
    env = np.exp((t - dur) / (dur * 0.28))
    st = np.vstack([filt(filt(noise(n), "highpass", hp), "lowpass", 11000) * env for _ in range(2)])
    return fade_edges(st / (np.max(np.abs(st)) + 1e-9), a=0.01, r=0.008)


def ui_click(bright=1.0):
    """Tactile UI click: short 'tock' at D7 (the 9th of the chord under both clicks), a low
    thump and a gentle tick."""
    n = int(0.12 * SR)
    t = secs(n)
    tock = np.sin(2 * np.pi * 2349.3 * bright * t) * np.exp(-t / 0.006)
    body = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.018) * 0.7
    tick = filt(filt(noise(n), "highpass", 4000), "lowpass", 11000) * np.exp(-t / 0.0012) * 0.25
    return fade_edges(tock * 0.55 + body + tick, a=0.0002, r=0.02)


def blip(f0=659.3, f1=1318.5, dur=0.16):
    """Bubble pop for the chip, tuned E5→E6: the 3rd the sus has just resolved to."""
    n = int(dur * SR)
    t = secs(n)
    f = f1 - (f1 - f0) * np.exp(-t / 0.012)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.045) * (1 - np.exp(-t / 0.001))
    return fade_edges(x, a=0.0003, r=0.03)


def air_bed(dur, level_curve):
    """High, quiet shimmer of filtered noise — the 'air' on top of the mix."""
    n = int(dur * SR)
    x = filt(np.vstack([noise(n), noise(n)]), "highpass", 7000, order=2)
    x = filt(x, "lowpass", 15000)
    return x * level_curve(np.linspace(0, 1, n))


# ---------------------------------------------------------------------------- effects

def peaking(x: np.ndarray, f0: float, gain_db: float, q: float = 0.9) -> np.ndarray:
    """RBJ peaking EQ."""
    a_ = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * a_, -2 * np.cos(w), 1 - al * a_]
    a = [1 + al / a_, -2 * np.cos(w), 1 - al / a_]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x, axis=-1)


def make_ir(rt60=2.3, length=3.4, predelay=0.014, bright_hz=7500.0, dark_hz=2600.0):
    reseed("reverb-ir")
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
    return np.vstack([signal.oaconvolve(l_in, ir[0])[:N], signal.oaconvolve(r_in, ir[1])[:N]])


def pingpong(x: np.ndarray, delay=0.375, feedback=0.25, lp=4200.0, taps=4) -> np.ndarray:
    """Dotted-8th echoes. The first repeat is centred; later ones alternate sides."""
    out = np.zeros_like(x)
    d = int(delay * SR)
    src = filt(filt(x.sum(axis=0) * 0.5, "lowpass", lp), "highpass", 300)
    g = 1.0
    for k in range(1, taps + 1):
        g *= feedback
        shift = d * k
        if shift >= N:
            break
        if k == 1:
            out[:, shift:] += src[: N - shift] * g * 0.707
        else:
            out[k % 2, shift:] += src[: N - shift] * g
        src = filt(src, "lowpass", lp * 0.9)
    return out


def sidechain(times, depth=0.2, release=0.17, attack=0.004) -> np.ndarray:
    g = np.ones(N)
    t = secs(N)
    for tk in times:
        i = int(tk * SR)
        seg = t[i:] - tk
        duck = depth * (1 - np.exp(-seg / attack)) * np.exp(-seg / release)
        g[i:] = np.minimum(g[i:], 1 - duck)
    return g


# ---------------------------------------------------------------------------- metering

_K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def _kweighted_blocks(x: np.ndarray) -> np.ndarray:
    x = np.atleast_2d(x)
    y = signal.lfilter(*_K1, x, axis=-1)
    y = signal.lfilter(*_K2, y, axis=-1)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if y.shape[1] < blk:
        return np.array([])
    c = np.cumsum(np.pad(y**2, ((0, 0), (1, 0))), axis=1)
    starts = np.arange(0, y.shape[1] - blk + 1, hop)
    return ((c[:, starts + blk] - c[:, starts]) / blk).sum(axis=0)


def lufs(x: np.ndarray) -> float:
    """Integrated loudness, ITU-R BS.1770-4 (48 kHz coefficients), gated."""
    z = _kweighted_blocks(x)
    if not len(z):
        return -np.inf
    z = z[-0.691 + 10 * np.log10(z + 1e-20) > -70]
    if not len(z):
        return -np.inf
    rel = -0.691 + 10 * np.log10(np.mean(z)) - 10
    z = z[(-0.691 + 10 * np.log10(z)) > rel]
    return float(-0.691 + 10 * np.log10(np.mean(z)))


def momentary_max(x: np.ndarray) -> float:
    """Loudest 400 ms window (K-weighted, ungated)."""
    z = _kweighted_blocks(x)
    return float(-0.691 + 10 * np.log10(np.max(z) + 1e-20)) if len(z) else -np.inf


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
    # forward-looking minimum over [i, i+w), then a backward moving average of the same width:
    # every output sample stays at or below the gain its own peak requires.
    g = minimum_filter1d(req, size=w, origin=-(w // 2), mode="nearest")
    g = uniform_filter1d(g, size=w, origin=(w - 1) // 2, mode="nearest")
    g = np.minimum(g, req)
    a = np.exp(-1 / (release * SR))
    out = g.copy()
    for i in range(1, len(out)):  # slow recovery only
        if out[i] > out[i - 1]:
            out[i] = out[i - 1] * a + out[i] * (1 - a)
    return x * out


# ---------------------------------------------------------------------------- harmony

# Pad voicings (floor at E3/F3, no minor 2nds below C5, 2–4 common tones per change, no
# parallel 5ths) and bass roots.
CHORDS = {
    "Fmaj9": ([53, 57, 60, 64, 67], 29),  # F1
    "Dm9": ([53, 57, 60, 64, 69], 38),  # D2
    "Bbmaj9": ([53, 57, 62, 65, 72], 34),  # B♭1
    "Gm9": ([53, 58, 62, 65, 69], 31),  # G1
    "C9sus4": ([53, 58, 62, 67, 72], 36),  # C2
    "C7": ([52, 58, 62, 67, 72], 36),  # sus4 F3 → 3rd E3
    "Fmaj9_end": ([53, 57, 60, 64, 67, 72], 29),  # B♭3 falls to A3; D4 splits to C4/E4
}
ARP_TONES = {
    "Bbmaj9": [70, 74, 77, 81],  # B♭4 D5 F5 A5
    "Gm9": [67, 70, 74, 77],  # G4 B♭4 D5 F5
    "C9sus4": [70, 72, 77, 79],  # B♭4 C5 F5 G5
    "C7": [70, 72, 76, 79],  # B♭4 C5 E5 G5
}

HARMONY = [
    (0.0, beat(0), "Fmaj9"),
    (beat(0), bar_start(1), "Dm9"),
    (bar_start(1), bar_start(2), "Bbmaj9"),
    (bar_start(2), bar_start(3), "Gm9"),
    (bar_start(3), beat(13), "C9sus4"),
    (beat(13), bar_start(4), "C7"),  # resolves as the option is selected (beat 13 = 8.975)
    (bar_start(4), beat(17), "Bbmaj9"),
    (beat(17), bar_start(5), "C9sus4"),
    (bar_start(5), DUR, "Fmaj9_end"),
]
PAD_END = 13.4  # the end chord starts releasing here and has decayed by ~14.8 s


def chord_at(t: float) -> str:
    for a, b, c in HARMONY:
        if a <= t < b:
            return c
    return HARMONY[-1][2]


def pad_cut(t):
    """Pad low-pass: dark intro opening up through the film, closing again as the end decays."""
    knots_t = [0.0, GRID0, bar_start(1), bar_start(4) - BEAT, bar_start(5), bar_start(5) + 0.3, 14.5, DUR]
    knots_f = [650, 2000, 2100, 3000, 3000, 3600, 900, 900]
    return np.interp(t, knots_t, knots_f)


# ---------------------------------------------------------------------------- the score

STEMS = ("kick", "bass", "pad", "arp", "perc", "bells", "logo", "fx", "impact", "ui", "air")


def compose():
    buses = {k: Bus(k) for k in STEMS}
    rev = {k: Bus("rev:" + k) for k in STEMS}
    dly = {k: Bus("dly:" + k) for k in STEMS}
    events = []

    def put(stem, x, t, pan=0.0, gain=1.0, send_rev=0.0, send_dly=0.0):
        buses[stem].add(x, t, pan=pan, gain=gain)
        if send_rev:
            rev[stem].add(x, t, pan=pan, gain=gain * send_rev)
        if send_dly:
            dly[stem].add(x, t, pan=pan, gain=gain * send_dly)

    def ev(t, what):
        events.append({"t": round(float(t), 4), "event": what})

    # ---- pad: voice by voice, holding common tones across changes; only moving voices re-attack
    reseed("pad")
    segs, open_ = [], {}
    for i, (a, b, c) in enumerate(HARMONY):
        cur = CHORDS[c][0]
        nxt = set(CHORDS[HARMONY[i + 1][2]][0]) if i + 1 < len(HARMONY) else set()
        for m in cur:
            open_.setdefault(m, a)
            if m not in nxt:
                segs.append((m, open_.pop(m), b))
    for m, t0, t1 in segs:
        last = t1 >= DUR - 1e-6
        t1 = PAD_END if last else t1
        rel = 1.4 if last else 0.2
        attack = 1.1 if t0 == 0.0 else 0.10
        n = int((t1 - t0 + rel) * SR)
        cut = pad_cut(t0 + secs(n))
        x = pad_voice(m, t1 - t0, attack, rel, cut) / np.sqrt(5)
        put("pad", x, t0, send_rev=0.35)

    # ---- intro: air, a reverse swell into the mark, the sonic logo, the wipe swish, the sheen
    reseed("air")
    put("air", air_bed(DUR, lambda u: (0.35 + 0.65 * np.clip(u * 3, 0, 1)) * (1 - 0.8 * np.clip((u - 0.8) / 0.2, 0, 1))), 0.0)
    reseed("intro")
    put("fx", reverse_swell(0.42, hp=3200), CUE["mark_land"] - 0.42, gain=0.55)

    # The sonic logo: F5 – C6 – A5, one note per logo-build event (up a 5th, settle on the 3rd).
    logo = [(CUE["mark_land"], 77, -0.15), (CUE["bar_land"], 84, 0.15), (CUE["wipe"][1], 81, 0.0)]
    for t, m, p in logo:
        put("logo", fm_bell(midi(m), dur=3.0, index=1.0, decay=1.6), t, pan=p, gain=1.0 if m == 77 else 0.85, send_rev=0.45)
        ev(t, f"sonic logo {m}")

    w0, w1 = CUE["wipe"]
    wd = w1 - w0 + 0.15
    put("fx", whoosh(wd, peak=0.41, f0=900, f1=5200, pan0=-0.6, pan1=0.6, width_oct=1.1), w0, gain=0.5)
    ev(w0 + 0.41 * wd, "wipe swish crest (L→R)")
    put("fx", whoosh(0.62, peak=0.45, f0=5000, f1=11000, pan0=-0.47, pan1=0.47, width_oct=0.9), 1.42, gain=0.3)
    ev(1.42 + 0.45 * 0.62, "sheen shimmer (L→R)")

    # ---- the sheet rises: riser + upward whoosh into the landing impact
    reseed("sheet")
    put("fx", riser(GRID0 - 1.15, f0=500, f1=7000, pitch=(87.3, 349.2), curve=2.6), 1.15, gain=0.42)
    sh0, sh1 = CUE["sheet"]
    sd = sh1 - sh0 + 0.05
    put("fx", whoosh(sd, peak=0.39, f0=180, f1=2400, width_oct=1.6, tone=(90, 260)), sh0, gain=0.8)
    ev(sh0 + 0.39 * sd, "sheet whoosh crest")

    kicks = []

    def add_kick(t, vel=1.0, highpass=None):
        k = kick(vel)
        if highpass:
            k = filt(k, "highpass", highpass, order=4)
        put("kick", k, t)
        kicks.append(t)

    def hit(t, root_midi, size=1.0, label="impact", decay=None):
        reseed(f"hit-{label}")
        put("impact", boom(f_lo=midi(root_midi), decay=decay or (1.1 + 0.6 * size)), t, gain=size)
        nb = int(0.5 * SR)
        env = np.exp(-secs(nb) / 0.09)
        burst = np.vstack([filt(noise(nb), "lowpass", 3500) * env for _ in range(2)])
        put("impact", fade_edges(burst), t, gain=0.22 * size, send_rev=2.2)
        ev(t, label)

    hit(beat(0), 38, 0.6, "sheet lands — impact")
    put("fx", reverse_swell(0.5), beat(0) - 0.5, gain=0.35)

    # ---- drums
    reseed("drums")
    for i in (0, 2):  # bar 1: half-time
        add_kick(beat(i), 1.0 if i == 0 else 0.85)
    for i in range(4, 14):  # bars 2–4 up to the break: four on the floor (soft first one)
        add_kick(beat(i), 0.72 if i == 4 else 0.92)

    for i in (5, 7, 9, 12):  # backbeat snaps (bar 3 is 3/4; beat 14 is the break)
        put("perc", snap(0.8), beat(i), pan=0.08, send_rev=0.35)
    put("perc", snap(0.45), beat(10) + 0.75 * BEAT, pan=0.08, send_rev=0.35)  # ghost pickup into bar 4

    def hats(t0, t1, step, accents):
        k, t = 0, t0
        while t < t1 - 1e-6:
            put("perc", hat(accents[k % len(accents)]), t, pan=0.28 if k % 2 else 0.18)
            k += 1
            t += step

    hats(beat(2) + BEAT / 2, beat(4), BEAT, [0.5])  # bar 1: offbeat 8ths
    hats(beat(4) + BEAT / 2, beat(11), BEAT, [0.45])  # bars 2–3: offbeat 8ths
    hats(beat(11), beat(14), BEAT / 4, [0.35, 0.22, 0.7, 0.25])  # bar 4: 16ths build

    # ---- bass
    reseed("bass")
    put("bass", sub_drone(CHORDS["Dm9"][1], bar_start(1) - beat(0) + 0.1, attack=0.03, release=0.25), beat(0), gain=0.9)
    for i in range(4, 14):  # offbeat 8ths, bars 2–4 (rests under the break)
        t = beat(i) + BEAT / 2
        put("bass", bass_note(CHORDS[chord_at(t)][1], BEAT / 2 * 0.86, 0.95), t)
    # bar 5 breakdown: sustained roots, cut before the drop for a moment of air
    put("bass", sub_drone(CHORDS["Bbmaj9"][1], beat(17) - bar_start(4) + 0.05, attack=0.02, release=0.2), bar_start(4), gain=0.8)
    put("bass", sub_drone(CHORDS["C9sus4"][1], 11.62 - beat(17), attack=0.05, release=0.25), beat(17), gain=0.8)
    put("bass", sub_drone(CHORDS["Fmaj9"][1], 2.3, attack=0.01, release=1.5), bar_start(5), gain=0.75)

    # ---- word mallets: rising Dm9 chord tones as each new word rolls in
    reseed("words")
    for t, m in zip(CUE["words"], (69, 72, 76)):
        put("bells", mallet(midi(m)), t + 0.04, pan=-0.25, gain=0.75, send_rev=0.3, send_dly=0.3)
        ev(t + 0.04, f"word mallet {m}")

    # ---- arp: 8ths through bars 2–3, 16ths in bar 4; the pattern restarts at each barline
    reseed("arp")
    pattern = (0, 1, 2, 3, 2, 1, 3, 1)

    def arp(t0, t1, step, idx0, idx1):
        t = t0
        while t < t1 - 1e-6:
            c = chord_at(t)
            tones = ARP_TONES[c]
            kb = int(round((t - bar_start(bar_of(t))) / step))
            m = tones[pattern[kb % len(pattern)]]
            vel = (0.9, 0.5, 0.7, 0.5)[kb % 4] if step < BEAT / 2 else (0.85, 0.6)[kb % 2]
            u = (t - t0) / (t1 - t0)
            x = fm_pluck(midi(m), index=idx0 + (idx1 - idx0) * u, decay=0.2)
            pan = -0.35 if kb % 2 else 0.35
            # echo only notes that still belong to the chord one dotted-8th later
            later = CHORDS[chord_at(min(t + 0.375, DUR - 0.01))]
            fits = (m % 12) in {v % 12 for v in later[0]} | {later[1] % 12}
            put("arp", x, t, pan=pan, gain=vel, send_rev=0.25, send_dly=0.4 if fits else 0.0)
            t += step

    arp(bar_start(1), bar_start(3), BEAT / 2, 1.1, 1.6)
    arp(bar_start(3), beat(14), BEAT / 4, 1.6, 2.2)

    # ---- pull-back and page scroll
    reseed("pullback")
    put("fx", whoosh(1.15, peak=0.41, f0=220, f1=1800, pan0=-0.5, pan1=0.5, width_oct=1.8), 4.50, gain=0.75)
    ev(4.50 + 0.41 * 1.15, "pull-back whoosh crest")
    s0, s1 = CUE["scroll"]
    put("fx", whoosh(0.8, peak=0.45, f0=1500, f1=350, pan0=0.2, pan1=-0.2, width_oct=1.4), s0, gain=0.45)
    ev(s0 + 0.45 * 0.8, "page-scroll whoosh crest")

    # ---- cards lift: mallets (the UI voice), building in level
    reseed("cards")
    for (t, m, p), g in zip(zip(CUE["cards"], (74, 77, 81), (-0.4, 0.0, 0.4)), (0.6, 0.7, 0.8)):
        put("bells", mallet(midi(m), dur=1.6, decay=0.5), t + 0.03, pan=p, gain=g, send_rev=0.3)
        ev(t + 0.03, f"card lift {m}")

    # ---- form + info cards slide in (opposite directions)
    reseed("form")
    f0_, _ = CUE["form_in"]
    put("fx", whoosh(0.62, peak=0.25, f0=1600, f1=420, pan0=0.75, pan1=0.1), f0_ - 0.06, gain=0.6)
    i0_, _ = CUE["info_in"]
    put("fx", whoosh(0.55, peak=0.25, f0=1300, f1=380, pan0=-0.75, pan1=-0.15), i0_ - 0.05, gain=0.35)
    ev(f0_ - 0.06 + 0.25 * 0.62, "form whoosh crest (R→L)")

    # ---- the click, the selection (C9sus4 → C7 on the kick at 8.975), the chip
    reseed("ui")
    put("ui", ui_click(), CUE["click1"], pan=0.3)
    ev(CUE["click1"], "click: Custom Website")
    for t, m in ((CUE["select"] + 0.02, 79), (CUE["select"] + 0.1, 84)):
        put("bells", mallet(midi(m), dur=1.2, decay=0.35), t, pan=0.25, gain=0.6, send_rev=0.3)
    ev(CUE["select"] + 0.02, "selection mallets G5→C6")
    put("ui", blip(), CUE["chip"], pan=0.55, gain=0.55)
    ev(CUE["chip"], "chip pop")

    # ---- break: riser + the UI scrolling away, ending exactly on the statement downbeat
    reseed("break")
    put("fx", riser(beat(15) - beat(14), f0=700, f1=9000, pitch=(130.8, 523.3), curve=2.2), beat(14), gain=0.38)
    e0, e1 = CUE["exit"]
    put("fx", whoosh(e1 - e0, peak=0.36, f0=300, f1=3600, width_oct=1.5), e0, gain=0.55)
    ev(e0 + 0.36 * (e1 - e0), "UI-exit whoosh crest")
    put("fx", reverse_swell(0.5), beat(15) - 0.5, gain=0.4)

    # ---- bar 5: the statement — impact, then a breakdown (pad + bass only)
    add_kick(beat(15), 0.9)
    hit(beat(15), 34, 0.6, "statement — impact")
    st = CUE["statement"][1] + 0.01
    put("bells", fm_bell(midi(84), dur=2.4, index=0.8, decay=1.1), st, pan=0.2, gain=0.55, send_rev=0.45)
    ev(st, "accent on 'Before work begins.'")

    # ---- Get a Quote click, a riser that stops just short of the hit, then the end card
    reseed("finale")
    put("ui", ui_click(), CUE["click2"], pan=0.05, gain=1.1)
    ev(CUE["click2"], "click: Get a Quote")
    put("fx", riser(bar_start(5) - beat(17) - 0.05, f0=400, f1=11000, pitch=(130.8, 698.5), curve=2.8), beat(17), gain=0.5)
    x0, _ = CUE["expand"]
    put("fx", whoosh(0.62, peak=0.52, f0=260, f1=3200, width_oct=2.0, tone=(120, 340)), x0, gain=0.6)
    ev(x0 + 0.52 * 0.62, "expansion whoosh crest")
    put("fx", reverse_swell(0.7), bar_start(5) - 0.75, gain=0.5)

    add_kick(bar_start(5), 1.0, highpass=70)  # punch and click only; the boom owns the sub
    hit(bar_start(5), 41, 1.3, "end card — impact", decay=0.9 + 0.4 * 1.3)
    for k, m in enumerate((53, 60)):  # quiet low dyad under the hit — leaves room for the logo
        put("bells", fm_bell(midi(m), dur=3.0, index=0.6, decay=1.6, sparkle=0.0), bar_start(5) + 0.01 * k, pan=-0.2 + 0.4 * k, gain=0.25, send_rev=0.3)
    reprise = [(CUE["end_mark"], 77, -0.15), (CUE["end_bar"], 84, 0.15), (CUE["end_wipe_done"], 81, 0.0)]
    for t, m, p in reprise:
        put("logo", fm_bell(midi(m), dur=3.0, index=1.0, decay=1.6), t, pan=p, gain=1.1 if m == 77 else 0.95, send_rev=0.4)
        ev(t, f"sonic logo (reprise) {m}")

    return buses, rev, dly, kicks, events


# How each stem is levelled before the mix. Most use gated integrated loudness (LUFS); the
# clicks are levelled by peak and the impacts by their loudest 400 ms, because gating makes
# sparse stems behave badly. Only the differences matter: the mix is normalised afterwards.
STEM_LUFS = {
    "kick": -23.0,
    "bass": -22.0,
    "pad": -23.0,
    "arp": -28.5,
    "perc": -33.5,
    "bells": -24.5,
    "logo": -20.5,
    "fx": -24.5,
    "air": -39.0,
}
STEM_PEAK_DBFS = {"ui": -14.0}
STEM_MOMENTARY = {"impact": -16.0}
REVERB_LUFS = -25.0
DELAY_LUFS = -31.0

# Section dynamics (dB) before loudness normalisation: a spacious intro, a lift when the sheet
# lands, the groove, a dip for the break, a breakdown for the statement, and the end card as
# the loudest moment. Raised-cosine ramps between keys.
ARC = [
    (0.0, -4.0),
    (2.40, -4.0),
    (2.475, -2.0),
    (4.40, -2.0),
    (4.475, 0.0),
    (9.45, 0.0),
    (9.55, -1.5),
    (9.95, -1.0),
    (9.975, -0.5),
    (11.90, -1.0),
    (11.975, 2.5),
    (13.3, 1.5),
    (15.0, 1.5),
]

TARGET_LUFS = -14.0
CEILING_DBTP = -1.5  # leaves room for AAC encoding overshoot (spec: ≤ -1 dBTP after encode)


def arc_gain() -> np.ndarray:
    t = secs(N)
    ts = np.array([a for a, _ in ARC])
    vs = np.array([v for _, v in ARC])
    i = np.clip(np.searchsorted(ts, t, side="right") - 1, 0, len(ts) - 2)
    u = np.clip((t - ts[i]) / (ts[i + 1] - ts[i]), 0, 1)
    u = 0.5 - 0.5 * np.cos(np.pi * u)
    return db(vs[i] + (vs[i + 1] - vs[i]) * u)


def stem_gain(name: str, x: np.ndarray) -> float:
    peak = np.max(np.abs(x))
    if peak <= 0:
        raise ValueError(f"stem '{name}' is silent")
    g = 1.0 / peak  # measure at a sane scale so the -70 LUFS gate behaves
    if name in STEM_PEAK_DBFS:
        return float(db(STEM_PEAK_DBFS[name]) * g)
    if name in STEM_MOMENTARY:
        return float(g * db(STEM_MOMENTARY[name] - momentary_max(x * g)))
    for _ in range(2):  # evaluate the gate at the final scale
        lv = lufs(x * g)
        if not np.isfinite(lv):
            raise ValueError(f"stem '{name}' measured silent")
        g *= float(db(STEM_LUFS[name] - lv))
    return g


def master(buses, rev, dly, kicks):
    gains = {name: stem_gain(name, bus.x) for name, bus in buses.items()}
    for name, bus in buses.items():
        bus.x *= gains[name]

    # sends carry their stem's gain, so the send amounts in compose() mean what they say
    wet = reverb(sum(rev[k].x * gains[k] for k in rev), make_ir())
    wet *= db(REVERB_LUFS - lufs(wet))
    dl = pingpong(sum(dly[k].x * gains[k] for k in dly))
    dl *= db(DELAY_LUFS - lufs(dl))

    sc = sidechain(kicks, depth=0.2)
    buses["pad"].x = peaking(buses["pad"].x, 750, -3.5) * sc  # take the box out of the supersaws
    wet *= 0.7 + 0.3 * sc

    mix = sum(b.x for b in buses.values()) + wet + dl
    mix = filt(mix, "highpass", 30, order=4)
    mix = mix * arc_gain()

    t = secs(N)
    mix *= np.clip(t / 0.01, 0, 1)  # 10 ms fade-in
    fo = np.clip((t - 14.8) / 0.2, 0, 1)  # safety fade; the music has already decayed
    mix *= 0.5 + 0.5 * np.cos(np.pi * fo)

    out = mix
    for _ in range(5):  # loudness to target under the true-peak ceiling (limiting costs loudness)
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
    buses, rev, dly, kicks, events = compose()
    out, gains = master(buses, rev, dly, kicks)
    wav = OUT / "ozen-launch-15s-score.wav"
    write_wav24(wav, out)
    report = {
        "file": wav.name,
        "sample_rate": SR,
        "duration": DUR,
        "bpm": BPM,
        "grid0": GRID0,
        "integrated_lufs": round(lufs(out), 2),
        "true_peak_dbtp": round(true_peak(out), 2),
        "stem_gain_db": {k: round(20 * np.log10(v), 2) for k, v in gains.items()},
        "harmony": [{"start": round(a, 3), "end": round(b, 3), "chord": c} for a, b, c in HARMONY],
        "kicks": [round(k, 4) for k in kicks],
        "events": sorted(events, key=lambda e: e["t"]),
    }
    (OUT / "score-cues.json").write_text(json.dumps(report, indent=2))
    print(f"{wav}  {report['integrated_lufs']} LUFS  {report['true_peak_dbtp']} dBTP")
    return 0


if __name__ == "__main__":
    sys.exit(main())
