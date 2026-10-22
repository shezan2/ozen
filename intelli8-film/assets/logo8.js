/* The intelli8 "8": a multi-strand ribbon figure-eight with a heart in its top loop, redrawn as
 * vector from the app's welcome screen (approximation — swap in the official artwork when available).
 *
 * The ribbon is one centre-line path stroked as stacked bands (teal · dark · coral · dark · teal),
 * coloured by a left-to-right gradient so the left reads teal and the right coral, as in the mark.
 * The top-left → bottom-right pass is redrawn over the crossing so the strands interlace.
 * I8.logo8({ id, size }) returns SVG markup; I8.logo8Draw(svg, p) reveals the ribbon (0..1).
 */
(() => {
  const PATH =
    "M50 72 C66 60 78 47 76 28 C74 11 63 6 50 6 C37 6 26 11 24 28 C22 47 34 60 50 72 " +
    "C66 84 86 99 86 124 C86 148 70 160 50 160 C30 160 14 148 14 124 C14 99 34 84 50 72 Z";
  // The pass that sits on top at the crossing (along the 8's down-right diagonal).
  const OVER = "M36 61.5 C41 65.3 45.5 68.6 50 72 C54.5 75.4 59 78.7 64 82.5";
  const BANDS = [
    [29, "url(#{id}-teal)"],
    [23.5, "#16303a"],
    [18, "url(#{id}-coral)"],
    [11.5, "#16303a"],
    [6, "url(#{id}-teal)"],
  ];

  function logo8({ id = "i8", size = 100, heart = true } = {}) {
    const g = (d, cls) =>
      BANDS.map(([w, c]) => `<path class="${cls}" d="${d}" fill="none" stroke="${c.replace("{id}", id)}" stroke-width="${w}" stroke-linejoin="round"/>`).join("");
    return `<svg class="logo8" viewBox="-14 -10 128 186" width="${size}" height="${(size * 186) / 128}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-teal" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="92" y2="0">
      <stop offset="0" stop-color="#58aeb4"/><stop offset=".55" stop-color="#6db9bd"/><stop offset="1" stop-color="#d7867a"/>
    </linearGradient>
    <linearGradient id="${id}-coral" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="92" y2="0">
      <stop offset="0" stop-color="#6aa9ad"/><stop offset=".45" stop-color="#e2836f"/><stop offset="1" stop-color="#e9735f"/>
    </linearGradient>
    <linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g class="ribbon">${g(PATH, "rb")}</g>
  <g class="over">${g(OVER, "ov")}</g>
  <path class="rb sheen" d="${PATH}" fill="none" stroke="url(#${id}-sheen)" stroke-width="27"/>
  ${heart ? `<path class="heart" d="M50 37.5 C50 37.5 41 31.6 41 26 C41 22.6 43.5 20.6 46.2 20.6 C48 20.6 49.3 21.6 50 23 C50.7 21.6 52 20.6 53.8 20.6 C56.5 20.6 59 22.6 59 26 C59 31.6 50 37.5 50 37.5 Z" fill="#6cc3c6"/>` : ""}
</svg>`;
  }

  // Reveal the ribbon along its path (all bands together); the over-pass and heart follow.
  function logo8Draw(svg, p, heartP = p) {
    for (const path of svg.querySelectorAll(".rb")) {
      const len = path._len || (path._len = path.getTotalLength());
      path.style.strokeDasharray = `${len} ${len}`;
      path.style.strokeDashoffset = (len * (1 - Math.min(1, Math.max(0, p)))).toFixed(2);
    }
    for (const path of svg.querySelectorAll(".ov")) path.style.opacity = p > 0.62 ? 1 : 0;
    const heart = svg.querySelector(".heart");
    if (heart) {
      const h = Math.min(1, Math.max(0, heartP));
      const s = h < 1 ? 1 - Math.pow(1 - h, 3) * 1 + Math.sin(h * Math.PI) * 0.12 : 1;
      heart.style.transformOrigin = "50px 29px";
      heart.style.transform = `scale(${(h === 0 ? 0 : s).toFixed(4)})`;
      heart.style.opacity = h > 0 ? 1 : 0;
    }
  }

  window.I8 = window.I8 || {};
  I8.logo8 = logo8;
  I8.logo8Draw = logo8Draw;
})();
