/* 4:5 portrait (Instagram/Facebook/LinkedIn feed). STARTER VALUES copied from 16x9 — to be laid out for this frame.
 * Layout for one output format: every number film.js needs that depends on the frame's shape.
 * Times are shared by all formats (the sound is cut to them), so keyframe times must not change;
 * only poses, sizes and positions differ. Easing names refer to E in film.js. CSS for the format
 * lives in formats/<id>.css, scoped under html.f-<id>. */
(window.OZEN_FORMATS ||= {})["4x5"] = {
  width: 1080,
  height: 1350,

  logo1: { w: 900, dy: -8 }, // opening wordmark: width, nudge from centre

  // The site in a browser. The chrome is 56 px; the hero card sits 16 px in, browser.w - 32 wide.
  browser: { w: 1600, h: 1000 },
  heroH: 860,
  headlineSize: 140, // "We build websites." (px); the roller travel is scaled from it
  heroPush: 1.028, // slow push on the full-bleed hero before the pull-back

  // Pricing cards on the page: card size, grid, left inset, top of the row on the page.
  card: { w: 464, h: 392, gap: 24, cols: 3, x0: 80, pageY: 1040 },
  scrollTo: -790, // page scroll (px) that brings the pricing row into view

  // Browser poses from the pull-back on (the rise and full-bleed hero are derived from heroH).
  browserKeys: [
    [5.55, { x: -30, y: 34, z: 0, rx: 14, ry: -9, rz: 2.4, s: 0.74 }, "dolly"],
    [7.55, { x: -64, y: 22, z: 70, rx: 12, ry: -15, rz: 2.6, s: 0.75 }, "inOutSine"],
    [8.25, { x: -470, y: -20, z: -420, rx: 10, ry: -22, rz: 2.6, s: 0.75 }, "dolly"],
    [9.75, { x: -500, y: -30, z: -470, rx: 10, ry: -24, rz: 2.7, s: 0.75 }, "linear"],
  ],
  formKeys: [
    [7.55, { x: 1500, y: 120, z: 160, rx: 8, ry: -38, rz: 2, s: 1 }],
    [8.3, { x: 230, y: 40, z: 90, rx: 5, ry: -9, rz: -0.4, s: 1 }, "glide"],
    [9.75, { x: 205, y: 30, z: 120, rx: 4, ry: -6, rz: -0.6, s: 1 }, "linear"],
  ],
  infoKeys: [
    [7.65, { x: -1400, y: 40, z: -120, rx: 6, ry: 26, rz: 0, s: 1 }],
    [8.4, { x: -500, y: 150, z: -150, rx: 6, ry: 14, rz: 0.6, s: 1 }, "glide"],
    [9.75, { x: -520, y: 142, z: -150, rx: 6, ry: 15, rz: 0.6, s: 1 }, "linear"],
  ],
  chipKeys: [
    [9.12, { x: 580, y: -360, z: 260, rx: 0, ry: -6, rz: 0, s: 0.6 }],
    [9.62, { x: 560, y: -300, z: 260, rx: 0, ry: -6, rz: 0, s: 1 }, "lift"],
    [9.75, { x: 556, y: -306, z: 260, rx: 0, ry: -6, rz: 0, s: 1 }, "linear"],
  ],
  rigExit: -820, // the product rig scrolls up and away by this much

  cta: { top: 760, w: 268, h: 76 }, // "Get a Quote" button; the end card opens out of it
  endLogo: { w: 760, top: 286 }, // within the end card's content box
  endCard: { inset: 24, r: 36 },
  cursor: {
    formFrom: [1720, 1150], // enters from here to pick "Custom Website"
    ctaFrom: [1640, 1160], // and from here to click "Get a Quote"
    ctaAt: [46, 46], // click point, from the button's centre-x and top
  },

  // Optional: (t, ctx) => {} runs after every seek for format-specific touches.
  adjust: null,
};
