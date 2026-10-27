/* 9:16 vertical (Reels, Stories, TikTok, Shorts): 1080 × 1920.
 * Layout only: every position and size film.js reads that depends on the frame's shape. Times are
 * shared by every format (the sound and the narration are cut to them), so nothing here moves a beat.
 * Positions are stage pixels; phone positions are the phone's centre (the phone is 418 × 872 at s = 1,
 * its 390 × 844 screen inset 14). Format CSS lives in formats/9x16.css, scoped under html.f-9x16.
 *
 * Platform UI covers the top 14% (y < 270), the bottom 35% (y > 1250) and a strip on the right
 * (x > 960), so everything that must be read sits in x 65–1015, y 270–1250 when it matters: copy
 * stacks above the phone on one left edge (x 90), and what sat beside the phone in 16:9 (body copy,
 * segment callouts, the measure counter, the coach) moves to a column on its right. Only decorative
 * imagery (the scale, the end phone's lower half, glows) runs below y 1250. */
(() => {
  const L = 90; // the copy's left edge in every beat
  const TOP = 300; // first line of copy, clear of the top UI band

  // App phone: just below a two-line headline (top y 590), on the left edge. The lowest thing it taps
  // (Save my results, screen y 725–781) ends at y ≈ 1240, inside the safe area. The right column
  // starts after a 46 px gutter.
  const APP = { s: 0.82 };
  APP.x = L + (418 * APP.s) / 2; // 261
  APP.y = 590 + (872 * APP.s) / 2; // 948
  const COL = Math.round(L + 418 * APP.s + 46); // 479

  (window.I8_FORMATS ||= {})["9x16"] = {
    width: 1080,
    height: 1920,

    // Hook: eyebrow and two headline lines at the top, Week 1 | Week 6 beneath at the copy's width;
    // the cards end above the bottom UI band (y ≈ 1215), the legend just under them.
    hook: {
      eyebrow: [L, TOP],
      head: [L, TOP + 50],
      headSize: 120,
      cards: { x: L, y: 622, w: 438, gap: 24, fig: 1.25 },
    },

    // Brand: the 8 and the wordmark centred in the safe area; the mark then drops into the welcome
    // screen of a phone centred below the copy (Get started at y ≈ 1216, where the wipe opens).
    brand: {
      mark: [540, 700],
      markSize: 320,
      word: [540, 1010],
      phone: { x: 540, y: 948, s: 0.84 },
      copy: [L, TOP],
      copyWidth: 900,
    },

    // Measure: three headline lines, then the body and the chip down the left; the scale fills the
    // lower right, its handle bar beside "See more." and all eight contacts above y 1250.
    measure: {
      scale: { x: 430, y: 740, w: 630 },
      chip: [L, 912],
    },

    app: {
    exit: [0, -1900], // the report phone leaves upward, clear of the Goals + History phones rising below
    exitT: [23.0, 23.4], // …and early: Goals rises in the same column from 23.35
      phone: { x: APP.x, y: APP.y, s: APP.s },
      copy: [L, TOP],
      copyWidth: 900,
      counter: [COL, 660],
      coach: [COL, 1090],
      callouts: { x: COL, y: 760, gap: 94 },
    },

    // Goals + History: captions above, two phones side by side filling the width.
    pair: {
      goals: { x: L + 192, y: 864, s: 0.92 },
      hist: { x: L + 192 + 385 + 46, y: 864, s: 0.92 },
      cap1: [L, TOP],
      cap2: [L + 385 + 46, TOP],
    },

    // End: lockup, headline, stores and price down the left; the phone on the right with the scale at
    // its foot (both run on below the safe area as imagery); fine print low but above y 1700.
    end: {
      copy: [L, TOP],
      phone: { x: 790, y: 1150, s: 0.8 },
      scale: { x: 380, y: 1080, w: 430 },
      fine: [L, 1630],
    },
  };
})();
