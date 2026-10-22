/* IAM pane: Athlete profile — Tomás Ferreira, SLEEP tab: sleep tiles, sleep-need context, Sleep Duration vs
 * Required bar chart.
 *
 *   I8.iam.panes.sleep(pane, h) → { seek(p, opts) }      (sidebar active: "Roster")
 *
 * Rebuilt from intelli8.ai "Sleep and load" · "Sleep quality, debt and efficiency" (header, tiles, context
 * card) and · "Sleep need versus actual" (context grid, bar chart; the page scrolled down). The red
 * "ACTIVE RISK FLAGS" banner of the demo is left out on purpose (ad compliance); everything below it moves
 * up by the banner's height. Nightly bars were traced from the reference (Sep 3 → Oct 2, 30 nights, Oct 1
 * has no recording) — fixed data, no randomness.
 *
 * Timeline over p (pure function of p and opts):
 *   0.00–0.15  header: Back to Roster, name + ACTIVE, email/sync, body stats, Defenders chip, "Last 30 Days"
 *              pill, tabs; the SLEEP underline grows 0.08–0.15
 *   0.05–0.35  four tiles rise in (staggered 0.03); values count up (Sleep debt and Avg duration count in
 *              minutes shown as h:mm), coloured underlines draw left → right
 *   0.30–0.50  "Sleep need & recording context" card (0.30–0.38), then its 8 cells (0.33–0.49, staggered),
 *              values counting
 *   0.32–0.52  page scrolls down 480 px to the reference framing (context card + chart)
 *   0.38–0.48  "Sleep Duration vs Required" card fades in (title, copy, axes, legend)
 *   0.45–1.00  bars grow from the baseline, left → right; each night's Needed bar trails its Actual bar
 *   0.52–0.62  "Sleep Duration Trend" card (cut off at the bottom, as in the reference) fades in
 *
 * opts (optional):
 *   scroll   0..1 — override the page scroll (0 = top: header, tiles, context card, chart title at the
 *            bottom; 1 = scrolled to the context card + chart as in the reference). Default: automatic.
 */
(() => {
  const svg = (d, w = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    back: svg(`<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>`),
    cal: svg(`<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`),
    calDays: svg(
      `<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>`
    ),
    ruler: svg(
      `<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>`
    ),
    scale: svg(
      `<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>`
    ),
    heart: svg(
      `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`
    ),
    chev: svg(`<path d="m6 9 6 6 6-6"/>`),
    info: svg(`<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>`, 1.8),
  };

  // Nightly hours, Sep 3 (index 0) → Oct 2 (index 29); null = no recording (Oct 1).
  // prettier-ignore
  const ACTUAL = [8.07,8.02,7.63,7.10,8.40,8.28,7.92,8.57,7.35,6.88,6.16,7.37,7.26,7.10,7.42,6.55,6.81,7.47,6.77,6.33,7.08,6.92,6.80,7.19,6.66,6.92,6.77,6.99,null,7.63];
  // prettier-ignore
  const NEEDED = [7.95,7.86,7.90,8.57,8.23,7.86,8.51,8.55,8.67,8.89,9.16,9.27,9.53,10.20,10.19,10.09,10.12,10.03,10.02,10.14,10.08,10.58,10.02,10.10,10.12,10.02,10.02,10.35,null,10.08];
  const N = ACTUAL.length;
  const dayLabel = (i) => (i < 28 ? `Sep ${3 + i}` : `Oct ${i - 27}`);
  const TICKS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 29];

  // Chart geometry, card-relative px (card 1140 × 412), measured from the reference.
  const CW = 1140, CH = 412;
  const AX = 65, YT = 112, YB = 332.5; // y axis x, 12h and 0h y
  const XEND = 1104;
  const X0 = 69, DX = 34.65, BW = 10, GAP = 5; // first Actual bar x, px per night, bar width, pair gap
  const PPH = (YB - YT) / 12;

  const TILES = [
    { key: "debt", label: "Sleep Debt", sub: "Cumulative 7-day deficit", to: 768, fmt: "hm" },
    { key: "avg", label: "Avg Sleep Duration", sub: "", to: 436, fmt: "hm" },
    { key: "eff", label: "Sleep Efficiency", sub: "", to: 93, fmt: "pct" },
    { key: "cons", label: "Sleep Consistency", sub: "% regularity of sleep timing", to: 59, fmt: "pct" },
  ];
  const CELLS = [
    ["Baseline need", 474, " min"],
    ["Debt need", 89, " min"],
    ["Strain need", 11, " min"],
    ["Nap adjustment", -2, " min"],
    ["Time in bed", 472, " min"],
    ["Disturbances", 10, " / night"],
    ["No-data time", 0, " min"],
    ["Nap duration", 2, " min"],
  ];
  const hm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

  function chart() {
    const Y = (v) => YB - v * PPH;
    const ys = [12, 10, 8, 6, 4, 2, 0];
    const grid = ys
      .filter((v) => v > 0)
      .map((v) => `<line class="gr" x1="${AX}" x2="${XEND}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/>`)
      .join("");
    const yl = ys
      .map(
        (v) =>
          `<line x1="${AX - 5}" x2="${AX}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="yl" x="${AX - 7}" y="${(Y(v) + (v === 12 ? 3.5 : 0)).toFixed(1)}">${v}h</text>`
      )
      .join("");
    const xl = TICKS.map((i) => {
      const cx = (X0 + i * DX + BW + GAP / 2).toFixed(1);
      return `<line x1="${cx}" x2="${cx}" y1="${YB}" y2="${YB + 6}"/><text class="xl" x="${cx}" y="${YB + 11.5}">${dayLabel(i)}</text>`;
    }).join("");
    const bars = ACTUAL.map((a, i) => {
      if (a == null) return "";
      const x = X0 + i * DX;
      return `<rect class="ba" data-i="${i}" x="${x.toFixed(2)}" y="${YB}" width="${BW}" height="0" rx="2.5"/><rect class="bn" data-i="${i}" x="${(x + BW + GAP).toFixed(2)}" y="${YB}" width="${BW}" height="0" rx="2.5"/>`;
    }).join("");
    return `
      <svg class="plot" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}">
        <defs><clipPath id="sl-clip"><rect x="0" y="0" width="${CW}" height="${YB}"/></clipPath></defs>
        <g class="axes">${grid}${yl}${xl}<path class="ax" d="M${AX} ${YT - 4} V${YB} H${XEND}"/></g>
        <g class="bars" clip-path="url(#sl-clip)">${bars}</g>
      </svg>
      <div class="legend"><span class="la"><i></i>Actual</span><span class="ln"><i></i>Needed</span></div>`;
  }

  I8.iam.panes.sleep = (pane, h) => {
    const { clamp, lerp, prog, ease } = h;
    pane.classList.add("pane-sleep");
    pane.innerHTML = `
      <div class="sl">
        <div class="hd">
          <div class="back">${IC.back}<span>Back to Roster</span></div>
          <div class="nm"><span>Tomás Ferreira</span><span class="badge">ACTIVE</span></div>
          <div class="meta m1"><span>tomas.ferreira@u23-demo.test</span><span class="ic">${IC.cal}Last Sync: Oct 2, 4:42 PM</span></div>
          <div class="meta m2"><span class="ic">${IC.ruler}177 cm</span><span class="ic">${IC.scale}74.0 kg</span><span class="ic hr">${IC.heart}Max HR: 203 bpm</span></div>
          <div class="chip">Defenders</div>
          <div class="days">${IC.calDays}<span>Last 30 Days</span>${IC.chev}</div>
          <i class="rule"></i>
        </div>
        <div class="tabs">
          <span>Overview</span><span>Recovery &amp; HRV</span><span class="on">Sleep<i></i></span><span>Strain</span><span>Workouts</span>
        </div>
        <div class="tiles">
          ${TILES.map(
            (t) => `
            <div class="tile ${t.key}">
              <div class="tl">${t.label}${IC.info}</div>
              <div class="tv">${t.fmt === "hm" ? hm(t.to) : `${t.to}%`}</div>
              ${t.sub ? `<div class="ts">${t.sub}</div>` : ""}
              <i class="ul"></i>
            </div>`
          ).join("")}
        </div>
        <div class="card ctx">
          <div class="ct">Sleep need &amp; recording context</div>
          <div class="cc">Average wearable sleep-need drivers and overnight recording context for this window.</div>
          <div class="grid">
            ${CELLS.map(([l, v, u]) => `<div class="cell"><div class="lb">${l}</div><div class="vl"><b>${v}</b>${u}</div></div>`).join("")}
          </div>
        </div>
        <div class="card dur">
          <div class="ct">Sleep Duration vs Required</div>
          <div class="cc">Actual sleep achieved vs wearable sleep target (baseline + strain + debt + nap adjustment). Bars below the green line indicate a nightly shortfall.</div>
          ${chart()}
        </div>
        <div class="card trend">
          <div class="ct">Sleep Duration Trend</div>
          <div class="range"><span class="nr">Normal range</span><span>7d</span><span>14d</span><span class="on">28d</span></div>
          <div class="cc">Each night's sleep against the athlete's normal range from the previous 28 days.</div>
        </div>
      </div>`;

    const $ = (s) => pane.querySelector(s);
    const $$ = (s) => [...pane.querySelectorAll(s)];
    const sl = $(".sl");
    const head = [
      [$(".back"), 0.0],
      [$(".nm"), 0.015],
      [$(".m1"), 0.03],
      [$(".m2"), 0.04],
      [$(".chip"), 0.05],
      [$(".days"), 0.045],
      [$(".tabs"), 0.06],
    ];
    const rule = $(".hd .rule");
    const tabLine = $(".tabs .on i");
    const tiles = $$(".tile").map((el, k) => ({
      el,
      val: el.querySelector(".tv"),
      ul: el.querySelector(".ul"),
      t: TILES[k],
      t0: 0.05 + 0.03 * k,
    }));
    const ctx = $(".card.ctx");
    const ctxHead = [ctx.querySelector(".ct"), ctx.querySelector(".cc")];
    const cells = $$(".cell").map((el, k) => ({ el, b: el.querySelector("b"), v: CELLS[k][1], t0: 0.33 + 0.012 * k }));
    const dur = $(".card.dur");
    const trend = $(".card.trend");
    const bars = $$(".bars rect").map((el) => {
      const i = +el.dataset.i;
      const need = el.classList.contains("bn");
      const v = need ? NEEDED[i] : ACTUAL[i];
      const s = 0.45 + i * 0.0128 + (need ? 0.02 : 0);
      return { el, hgt: v * PPH, s };
    });
    const SCROLL = 480;

    const show = (el, a, dy = 0) => {
      el.style.opacity = a.toFixed(3);
      el.style.transform = dy ? `translateY(${dy.toFixed(2)}px)` : "none";
    };

    return {
      seek(p, opts = {}) {
        p = clamp(p);

        // Page scroll
        const s = typeof opts.scroll === "number" ? clamp(opts.scroll) : ease.inOut(prog(p, 0.32, 0.52));
        sl.style.transform = `translateY(${(-SCROLL * s).toFixed(2)}px)`;

        // Header
        for (const [el, t0] of head) {
          const a = ease.out(prog(p, t0, t0 + 0.08));
          show(el, a, lerp(10, 0, a));
        }
        rule.style.transform = `scaleX(${ease.inOut(prog(p, 0.02, 0.13)).toFixed(4)})`;
        tabLine.style.transform = `scaleX(${ease.out(prog(p, 0.08, 0.15)).toFixed(4)})`;

        // Tiles
        for (const t of tiles) {
          const a = ease.out(prog(p, t.t0, t.t0 + 0.08));
          show(t.el, a, lerp(14, 0, a));
          const c = ease.out(prog(p, t.t0 + 0.02, t.t0 + 0.2));
          const n = Math.round(t.t.to * c);
          t.val.textContent = t.t.fmt === "hm" ? hm(n) : `${n}%`;
          t.ul.style.transform = `scaleX(${ease.inOut(prog(p, t.t0 + 0.06, t.t0 + 0.21)).toFixed(4)})`;
        }

        // Context card + cells
        const ca = ease.out(prog(p, 0.3, 0.38));
        show(ctx, ca, lerp(16, 0, ca));
        ctxHead.forEach((el, k) => {
          const a = ease.out(prog(p, 0.31 + 0.015 * k, 0.37 + 0.015 * k));
          show(el, a, lerp(6, 0, a));
        });
        for (const c of cells) {
          const a = ease.out(prog(p, c.t0, c.t0 + 0.07));
          show(c.el, a, lerp(10, 0, a));
          const n = Math.round(c.v * ease.out(prog(p, c.t0 + 0.01, c.t0 + 0.08)));
          c.b.textContent = String(n === 0 ? 0 : n);
        }

        // Chart card + bars
        const da = ease.out(prog(p, 0.38, 0.48));
        show(dur, da, lerp(18, 0, da));
        for (const b of bars) {
          const g = b.hgt * ease.out(prog(p, b.s, b.s + 0.14));
          b.el.setAttribute("y", (YB - g).toFixed(2));
          b.el.setAttribute("height", (g > 0 ? g + 3 : 0).toFixed(2));
        }

        // Next card peeking in at the bottom
        const ta = ease.out(prog(p, 0.52, 0.62));
        show(trend, ta, lerp(14, 0, ta));
      },
    };
  };
})();
