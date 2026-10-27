#!/usr/bin/env python3
"""Build demo/intelli8-demo.html: one self-contained page (fonts, app screens, scale render and the
preview sound inlined), so it renders the same anywhere and never falls back to another font.

    python3 demo/build.py            # → demo/intelli8-demo.html
"""
from __future__ import annotations

import base64
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "demo" / "demo.src.html"
OUT = ROOT / "demo" / "intelli8-demo.html"
SOUND = ROOT / "out" / "intelli8-demo-sound.wav"

FONTS = [  # family, file, weight range
    ("Manrope", "Manrope.woff2", "200 800"),
    ("DM Sans", "DMSans.woff2", "100 1000"),
    ("JetBrains Mono", "JetBrainsMono.woff2", "100 800"),
    ("Inter", "Inter.woff2", "100 900"),
]


def b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()


def fonts() -> str:
    return "\n".join(
        f'@font-face {{ font-family: "{fam}"; src: url(data:font/woff2;base64,{b64(ROOT / "assets/fonts" / f)}) '
        f'format("woff2"); font-weight: {w}; font-display: block; }}'
        for fam, f, w in FONTS
    )


def css(rel: str) -> str:
    text = (ROOT / rel).read_text()
    # the screens declare their own Inter face by relative URL; the inlined one above replaces it
    return re.sub(r"@font-face\s*\{[^}]*\}", "", text)


def audio_attr() -> str:
    if not SOUND.exists():
        return ""
    with tempfile.TemporaryDirectory() as tmp:  # the mp4 muxer needs a seekable file, not a pipe
        m4a = Path(tmp) / "sound.m4a"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(SOUND), "-c:a", "aac", "-b:a", "128k", str(m4a)], check=True)
        return f' src="data:audio/mp4;base64,{b64(m4a)}"'


def main():
    page = SRC.read_text()
    page = page.replace("/*@fonts*/", fonts())
    page = re.sub(r"/\*@css ([^*]+)\*/", lambda m: css(m.group(1).strip()), page)
    page = re.sub(r"/\*@js ([^*]+)\*/", lambda m: (ROOT / m.group(1).strip()).read_text(), page)
    page = re.sub(r"/\*@png ([^*]+)\*/", lambda m: "data:image/png;base64," + b64(ROOT / m.group(1).strip()), page)
    page = page.replace('<audio id="snd" preload="auto"><!--@audio--></audio>', f'<audio id="snd" preload="auto"{audio_attr()}></audio>')
    leftover = re.findall(r"/\*@\w+[^*]*\*/|<!--@\w+-->", page)
    if leftover:
        raise SystemExit(f"unreplaced markers: {leftover}")
    OUT.write_text(page)
    print(f"{OUT.relative_to(ROOT)}  {OUT.stat().st_size / 1e6:.2f} MB{'  (with sound)' if SOUND.exists() else ''}")


if __name__ == "__main__":
    main()
