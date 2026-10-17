/* 4:5 portrait (1080×1350) for in-feed placements: Instagram, Facebook and LinkedIn.
 * Layout for one output format: every number film.js needs that depends on the frame's shape.
 * Times are shared by all formats (the sound is cut to them), so keyframe times must not change;
 * only poses, sizes and positions differ. Easing names refer to E in film.js. CSS for the format
 * lives in formats/4x5.css, scoped under html.f-4x5.
 *
 * The site is shown at a narrow, mobile-like width: a portrait hero card that fills the frame for
 * the statement, a collapsed nav, and pricing as a single column of three cards. The enquiry flow
 * stacks vertically (chip, info card, form over the receding browser); the promise stacks on three
 * lines, and the end card stacks logo, line, URL and a two-row service list. Key text keeps at
 * least 60 px from every edge and is sized for a ~390 pt-wide phone feed (≈0.36×). */
(window.OZEN_FORMATS ||= {})["4x5"] = {
  width: 1080,
  height: 1350,

  logo1: { w: 780, dy: -24 }, // opening wordmark: width, nudge from centre

  // The site in a portrait browser. Chrome is 56 px; the hero card sits 16 px in, 828 wide. It is a
  // little less tall than 4:5, so it rises at frame width (×1.30) and grows to full bleed (×1.39),
  // which pushes its rounded corners out of frame, as the 16:9 hero does.
  browser: { w: 860, h: 1280 },
  heroH: 971,
  headlineSize: 126, // page px; ≈175 px in frame at full bleed
  heroPush: 1.028,

  // Pricing: one column of three cards under the intro line.
  card: { w: 764, h: 300, gap: 22, cols: 1, x0: 48, pageY: 1170 },
  scrollTo: -930, // leaves a sliver of the hero above the intro, as in 16:9

  // Pull back to the browser centred and tilted; then it recedes up and back for the enquiry flow.
  browserKeys: [
    [5.55, { x: 0, y: -14, z: 0, rx: 12, ry: -8, rz: 1.8, s: 0.85 }, "dolly"],
    [7.55, { x: -14, y: -24, z: 60, rx: 11, ry: -12, rz: 2.0, s: 0.86 }, "inOutSine"],
    [8.25, { x: -150, y: -330, z: -520, rx: 12, ry: -16, rz: 2.2, s: 0.85 }, "dolly"],
    [9.75, { x: -160, y: -350, z: -560, rx: 12, ry: -17, rz: 2.3, s: 0.85 }, "linear"],
  ],
  // The form sweeps in from the lower right and settles in the lower half of the frame.
  formKeys: [
    [7.55, { x: 900, y: 620, z: 160, rx: 10, ry: -32, rz: 3, s: 1 }],
    [8.3, { x: -6, y: 196, z: 90, rx: 5, ry: -8, rz: -0.4, s: 1 }, "glide"],
    [9.75, { x: -14, y: 190, z: 110, rx: 4, ry: -6, rz: -0.6, s: 1 }, "linear"],
  ],
  // The info card comes in from the left, tucked behind the form's top edge.
  infoKeys: [
    [7.65, { x: -1100, y: -250, z: -120, rx: 6, ry: 26, rz: 0, s: 1 }],
    [8.4, { x: -190, y: -250, z: -150, rx: 6, ry: 14, rz: 0.6, s: 1 }, "glide"],
    [9.75, { x: -200, y: -256, z: -150, rx: 6, ry: 15, rz: 0.6, s: 1 }, "linear"],
  ],
  // The chip pops in at the top, over the receding browser.
  chipKeys: [
    [9.12, { x: 176, y: -540, z: 260, rx: 0, ry: -6, rz: 0, s: 0.6 }],
    [9.62, { x: 162, y: -474, z: 260, rx: 0, ry: -6, rz: 0, s: 1 }, "lift"],
    [9.75, { x: 160, y: -478, z: 260, rx: 0, ry: -6, rz: 0, s: 1 }, "linear"],
  ],
  rigExit: -1200, // the product rig scrolls up and away by this much

  cta: { top: 1000, w: 380, h: 108 }, // "Get a Quote" under the stacked promise; the end card opens out of it
  endLogo: { w: 700, top: 330 }, // within the end card's 1032×1302 content box
  endCard: { inset: 24, r: 36 },
  cursor: {
    formFrom: [1010, 1430], // enters from below the lower-right corner to pick "Custom Website"
    ctaFrom: [980, 1430], // and again to click "Get a Quote"
    ctaAt: [70, 66], // click point, from the button's centre-x and top
  },

  // Per-frame touches for this frame shape (runs after film.js has set every frame's state).
  adjust(t, { el, E, lerp, prog }) {
    // The promise: "Before work begins." wraps to two lines here, inside one mask. film.js rises it
    // 205 px (one line's travel); a transparent band that closes as it lands hides line 1 below its
    // own slot, so each line rises into its own slot just like the 16:9 single-line masks.
    if (t >= 9.7 && t < 12.65) {
      const mask = el.st2.parentElement;
      const p = prog(t, 10.16, 10.99);
      const d = lerp(205, 0, E.glide(p)); // film.js's rise offset (no sink)
      if (d > 0.25) {
        // Band edge between line 1's descenders (145 px) and line 2's ascenders (148 px) at 150 px;
        // its lower edge is feathered by the text's blur so no blurred descender halo peeks out.
        const a = el.st2.offsetTop - mask.offsetTop + el.st2.offsetHeight / 2 - 3.5;
        const k = Math.min(d, 2 * lerp(8, 0, E.outCubic(p)));
        const m = `linear-gradient(#000 ${a}px, transparent ${a}px, transparent ${(a + d).toFixed(2)}px, #000 ${(a + d + k).toFixed(2)}px)`;
        mask.style.webkitMaskImage = mask.style.maskImage = m;
      } else {
        mask.style.webkitMaskImage = mask.style.maskImage = "none";
      }
    }
  },
};
