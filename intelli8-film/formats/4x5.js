/* 4:5 feed (Instagram, Facebook): 1080 × 1350.
 * Layout for one output format: every position and size film.js reads that depends on the frame's
 * shape. Times are shared by every format (the sound and the narration are cut to them), so only
 * poses, sizes and positions live here. Positions are stage pixels; phone positions are the phone's
 * centre (the phone is 418 × 872 at s = 1). Type sizes for the format live in formats/4x5.css,
 * scoped under html.f-4x5.
 *
 * The frame is seen at ~380 px wide in a feed, so every beat stacks: copy across the top on one left
 * edge (x = 80), the product below it at about twice its 16:9 share of the frame. Copy keeps 80 px
 * from the sides and everything readable keeps at least 50 px from every edge. */
(window.I8_FORMATS ||= {})["4x5"] = {
  width: 1080,
  height: 1350,

  // Hook: eyebrow and the two-line headline over Week 1 | Week 6 at the copy's width.
  hook: {
    eyebrow: [80, 120],
    head: [80, 175],
    headSize: 120, // "Different story." ≈ 765 px
    cards: { x: 80, y: 472, w: 448, gap: 24, fig: 1.7 },
  },

  // Brand: the 8 draws centred, then flies straight down into the welcome screen of a centred phone;
  // the copy rises above the phone.
  brand: {
    mark: [540, 590],
    markSize: 360,
    word: [540, 930],
    phone: { x: 540, y: 838, s: 1.04 },
    copy: [80, 80],
    copyWidth: 920,
  },

  // Measure: the three-line headline over the scale; the chip in the empty corner under its platform.
  measure: {
    scale: { x: 320, y: 540, w: 700 },
    chip: [80, 1170],
  },

  // App: copy across the top, the phone below on the right; the left column under the copy carries the
  // body copy, the segment callouts, the measure counter and the coach chip.
  app: {
    exit: [0, -1900], // the report phone leaves upward, clear of the Goals + History phones rising below
    phone: { x: 791, y: 862, s: 1 },
    copy: [80, 80],
    copyWidth: 920,
    counter: [80, 520],
    coach: [80, 1160],
    callouts: { x: 80, y: 540, gap: 104 },
  },

  // Goals + History: two phones side by side under their captions.
  pair: {
    goals: { x: 300, y: 800, s: 1.05 },
    hist: { x: 780, y: 800, s: 1.05 },
    cap1: [80, 110],
    cap2: [560, 110],
  },

  // End: lockup, headline, stores and price on the left; the phone on the right with the scale behind it.
  end: {
    copy: [80, 80],
    phone: { x: 822, y: 940, s: 0.86 },
    scale: { x: 260, y: 800, w: 440 },
    fine: [80, 1236],
  },
};
