/* Card registry and motion helpers for the site cards (cards/<name>.js + .css).
 *
 *   I8.cards.compare = {
 *     size: [1098, 700],                       // native CSS px (the site's layout size)
 *     bg: "cream",                             // page colour it is designed on: cream | sage | dark
 *     build(root, c) {                         // root: an .i8c element of that size; c = I8.c helpers
 *       root.classList.add("card-compare");
 *       root.innerHTML = `...`;
 *       return { seek(p, opts) { ... } };      // p in [0, 1]; pure function of (p, opts)
 *     },
 *   };
 *
 * The film calls seek every frame in any order, so it must not keep state, use timers or randomness.
 */
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (u) => ((ax * u + bx) * u + cx) * u;
    const sy = (u) => ((ay * u + by) * u + cy) * u;
    return (p) => {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      let lo = 0, hi = 1, u = p;
      for (let i = 0; i < 40; i++) {
        const x = sx(u);
        if (Math.abs(x - p) < 1e-6) break;
        if (x < p) lo = u; else hi = u;
        u = (lo + hi) / 2;
      }
      return sy(u);
    };
  }
  // The film's easing set: use glide for most entrances, sheet for panels, pop for small overshoots.
  const E = {
    linear: (p) => p,
    out: (p) => 1 - (1 - p) ** 3,
    in: (p) => p ** 3,
    inOut: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
    glide: bezier(0.16, 1, 0.3, 1),
    sheet: bezier(0.66, 0, 0.24, 1),
    pop: bezier(0.34, 1.4, 0.64, 1),
  };

  const op = (el, v) => (el.style.opacity = clamp(v).toFixed(4));
  const blur = (px) => (px > 0.05 ? `blur(${px.toFixed(2)}px)` : "none");
  // A headline line rising out of its .mask, between local progress a and b.
  function rise(el, p, a, b) {
    const k = E.glide(prog(p, a, b));
    el.style.transform = `translateY(${((1 - k) * 112).toFixed(2)}%)`;
    el.style.filter = blur((1 - k) * 5);
  }
  // Fade in with a small lift (dy px) between a and b.
  function enter(el, p, a, b, dy = 18) {
    const k = E.glide(prog(p, a, b));
    el.style.opacity = k.toFixed(4);
    el.style.transform = `translateY(${((1 - k) * dy).toFixed(2)}px)`;
    el.style.filter = blur((1 - k) * 4);
  }
  // Reveal a stroked path from its start: const d = drawable(pathEl) once (while rendered), then d(p).
  function drawable(path) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    return (p) => (path.style.strokeDashoffset = `${(len * (1 - clamp(p))).toFixed(2)}`);
  }
  // Count a number from a to b with d decimals.
  const count = (a, b, k, d = 1) => lerp(a, b, k).toFixed(d);

  window.I8 = window.I8 || {};
  I8.cards = I8.cards || {};
  I8.c = { clamp, lerp, prog, bezier, E, op, blur, rise, enter, drawable, count };
})();
