/* IAM dashboard shell and pane registry.
 *
 * A pane lives in iam/<name>.js + iam/<name>.css and registers itself:
 *
 *   I8.iam.panes.command = (pane, h) => {          // pane: the 1220 × 844 content area
 *     pane.classList.add("pane-command");
 *     pane.innerHTML = `...`;
 *     return { seek(p, opts) { ... } };            // pure function of (p, opts), p in [0, 1]
 *   };
 *
 * I8.iam.shell(root, { active }) builds the top bar and sidebar into a 1440 × 900 .iam root and
 * returns the pane element. h is I8.h (screens/app.js) plus h.iam helpers.
 */
(() => {
  const NAV = [
    ["Dashboard", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`],
    ["Groups", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.8 2.8 2.6 3 5.2"/></svg>`],
    ["Roster", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6.5 8-6.5s7.2 2.5 8 6.5"/></svg>`],
    ["Connections", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 15l6-6"/><path d="M11 6l1.5-1.5a4 4 0 0 1 5.7 5.7L16.7 11.7M13 18l-1.5 1.5a4 4 0 0 1-5.7-5.7L7.3 12.3"/></svg>`],
    ["Match Readiness", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>`],
  ];

  let built = 0; // unique gradient ids per shell
  function shell(root, { active = "Dashboard" } = {}) {
    root.classList.add("iam");
    root.innerHTML = `
      <div class="top">
        <div class="brand">intelli${I8.logo8({ id: `iam-${++built}`, size: 20 })}</div>
        <div class="powered">Powered by<b>WAAHALABS</b></div>
        <div class="user"><div><b>Head Coach</b><span>ORG_ADMIN</span></div><i>HC</i></div>
      </div>
      <div class="side">
        <div class="caps">Main menu</div>
        ${NAV.map(([n, svg]) => `<div class="nav${n === active ? " on" : ""}">${svg}<span>${n}</span></div>`).join("")}
        <div class="foot">Wearable data · Privacy</div>
      </div>
      <div class="pane"></div>`;
    for (const svg of root.querySelectorAll(".brand .logo8")) I8.logo8Draw(svg, 1, 1);
    return root.querySelector(".pane");
  }

  // Shared helpers for panes: a trend chart with a personal normal-range band and dots.
  // values: [{ v, lo, hi }] per day; returns SVG markup sized w × h with ids for animation hooks.
  function bandChart({ values, w, h, min, max, pad = [36, 10, 22, 10], dot = "#5ee0a8", band = "#1d4a3a" }) {
    const [pl, pt, pb, pr] = pad;
    const X = (i) => pl + (i / (values.length - 1)) * (w - pl - pr);
    const Y = (v) => pt + (1 - (v - min) / (max - min)) * (h - pt - pb);
    const top = values.map((d, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(d.hi).toFixed(1)}`).join(" ");
    const bot = values.map((d, i) => `L${X(values.length - 1 - i).toFixed(1)} ${Y(values[values.length - 1 - i].lo).toFixed(1)}`).join(" ");
    const dots = values
      .map((d, i) => {
        const inside = d.v >= d.lo && d.v <= d.hi;
        return `<circle class="dot" data-i="${i}" cx="${X(i).toFixed(1)}" cy="${Y(d.v).toFixed(1)}" r="${inside ? 2.6 : 4.2}" fill="${dot}" fill-opacity="${inside ? 0.55 : 1}"/>`;
      })
      .join("");
    return `<svg class="bandchart" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <clipPath id="bc-${w}-${h}-${min}"><rect class="reveal" x="0" y="0" width="${w}" height="${h}"/></clipPath>
      <g clip-path="url(#bc-${w}-${h}-${min})"><path d="${top} ${bot} Z" fill="${band}"/></g>
      <line x1="${pl}" y1="${pt}" x2="${pl}" y2="${h - pb}" stroke="rgba(255,255,255,.25)"/>
      <line x1="${pl}" y1="${h - pb}" x2="${w - pr}" y2="${h - pb}" stroke="rgba(255,255,255,.25)"/>
      ${dots}
    </svg>`;
  }

  window.I8 = window.I8 || {};
  I8.iam = I8.iam || { panes: {} };
  I8.iam.panes = I8.iam.panes || {};
  I8.iam.shell = shell;
  I8.iam.bandChart = bandChart;
})();
