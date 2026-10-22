/* intelli8 App — shared helpers for the rebuilt app screens.
 *
 * A screen lives in screens/<name>.js + screens/<name>.css and registers itself:
 *
 *   I8.screens.dashboard = (root, h) => {
 *     root.classList.add("scr-dashboard");
 *     root.innerHTML = h.status() + `...` + h.tabs("dashboard") + h.home();
 *     return { seek(p) { ... } };   // p in [0, 1]: the screen's own intro animation
 *   };
 *
 * `root` is a 390 × 844 .app element. The film calls the returned API every frame, so seek must be
 * a pure function of its arguments (no timers, no randomness, no state that depends on call order).
 */
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
  const ease = {
    out: (p) => 1 - (1 - p) ** 3,
    inOut: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
    glide: (p) => 1 - (1 - p) ** 4,
  };
  // Number with fixed decimals; counts are rounded the way the app shows them.
  const fmt = (v, d = 1) => v.toFixed(d);

  const ICON = {
    signal: `<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>`,
    wifi: `<svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.6l2.6-2.9a3.7 3.7 0 0 0-5.2 0z" fill="currentColor"/><path d="M3.3 6.4a6.6 6.6 0 0 1 9.4 0l1.6-1.8a9 9 0 0 0-12.6 0z" fill="currentColor"/><path d="M.2 3a11 11 0 0 1 15.6 0L16 2.8A13 13 0 0 0 0 2.8z" fill="currentColor"/></svg>`,
    battery: `<svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="#3fb950" stroke-opacity=".55"/><rect x="2" y="2" width="20" height="9" rx="2" fill="#3fb950"/><path d="M25 4.5v4c.9-.3 1.5-1.1 1.5-2s-.6-1.7-1.5-2z" fill="#3fb950" fill-opacity=".55"/><path d="M12.6 2.6L9.2 7h2.6l-1 3.4L14.4 6h-2.7z" fill="#fff"/></svg>`,
    dashboard: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor"/><rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/></svg>`,
    goals: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>`,
    history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 7.5V12l3 2"/></svg>`,
    profile: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="12" cy="9.5" r="3.6" fill="#fff"/><path d="M5.6 18.4a7.6 7.6 0 0 1 12.8 0A9.4 9.4 0 0 1 12 21a9.4 9.4 0 0 1-6.4-2.6z" fill="#fff"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"/></svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`,
  };

  const status = () =>
    `<div class="status"><span>9:41</span><span class="icons">${ICON.signal}${ICON.wifi}${ICON.battery}</span></div>`;
  const tabs = (active) =>
    `<div class="tabs">${["dashboard", "goals", "history", "profile"]
      .map((k) => `<div class="tab${k === active ? " on" : ""}">${ICON[k]}<span>${k[0].toUpperCase() + k.slice(1)}</span></div>`)
      .join("")}</div>`;
  const home = () => `<div class="home"></div>`;

  // A sparkline / line chart path through points scaled into a w × h box (y grows downward).
  function linePath(values, w, h, pad = 2) {
    const lo = Math.min(...values), hi = Math.max(...values);
    return values
      .map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
        const y = pad + (1 - (v - lo) / (hi - lo || 1)) * (h - 2 * pad);
        return `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }
  // Reveal a stroked path from its start: set once with the path's length, then draw(p).
  function drawable(path) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    return (p) => (path.style.strokeDashoffset = `${(len * (1 - clamp(p))).toFixed(2)}`);
  }

  window.I8 = window.I8 || {};
  I8.screens = I8.screens || {};
  I8.h = { clamp, lerp, prog, ease, fmt, ICON, status, tabs, home, linePath, drawable };
})();
