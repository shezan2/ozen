/* IAM pane: Command Center (the Dashboard home) — eight 7-day KPI tiles, the Priority Action Roster,
 * the Group Comparison table and, below the fold, the HRV / Resting HR / Sleep / Recovery trend charts.
 * Measured against the intelli8.ai "Readiness at a glance" and "One command center" screens.
 *
 *   I8.iam.panes.command(pane, h) → { seek(p, opts) }      (sidebar active: "Dashboard")
 *
 * Timeline over p (pure function of p and opts):
 *   0.00–0.12  title, subtitle, "Last 7 Days" pill and grid button fade up
 *   0.05–0.45  the eight KPI tiles rise in, staggered left → right, top → bottom; each value counts up
 *              from 0 in its own format (61%, 102 ms, 48 bpm, 7:38, 11.9 …), its delta chip fades in
 *              and the coloured underline bar draws left → right
 *   0.40–0.65  Priority Action Roster (0.40–0.58) and Group Comparison (0.47–0.65) panels rise in
 *   0.55–0.95  table rows slide in, alternating between the two tables; recovery % counts up and the
 *              roster flags pop at the end of their row
 *   0.60–1.00  trend panels below the fold fade in and their charts draw (only seen with opts.scroll)
 *
 * opts (optional, all pure):
 *   scroll   0..1  scrolls the page down to the "One command center" view (trend charts in view);
 *                  linear — ease it on the caller side
 *   charts   0..1  draw progress of the trend charts (band reveal + dots); default follows p
 *   focus    "hugo" | "tomas" | "goalkeepers" | "defenders" | "forwards" | "midfielders" — dims the
 *                  other table rows and lifts this one
 *   focusP   0..1  how far the focus has gone (default 1 when focus is set)
 */
(() => {
  const svg = (d, w = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    info: svg(`<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`, 1.6),
    battery: svg(`<rect x="2" y="6" width="16" height="12" rx="2"/><path d="M22 14v-4"/>`, 1.7),
    alert: svg(`<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>`, 1.7),
    heart: svg(`<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>`, 1.7),
    moon: svg(`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`, 1.7),
    zap: svg(`<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`, 1.7),
    activity: svg(`<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>`, 1.7),
    calendar: svg(`<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>`, 1.8),
    down: svg(`<path d="m6 9 6 6 6-6"/>`, 2),
    grid: svg(`<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>`, 2),
    right: svg(`<path d="m9 18 6-6-6-6"/>`, 2),
    arrowDown: svg(`<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>`, 2.6),
    users: svg(`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, 1.7),
  };

  // Value formats used while counting up (kept identical to the finished numbers).
  const FMT = {
    pct: (v) => `${Math.round(v)}%`,
    ms: (v) => `${Math.round(v)} ms`,
    bpm: (v) => `${Math.round(v)} bpm`,
    hm: (v) => {
      const m = Math.round(v);
      return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
    },
    d1: (v) => v.toFixed(1),
    int: (v) => `${Math.round(v)}`,
  };

  // label, corner icon, icon tone, value, format, value tone, delta chip, sub line, underline bar
  const TILES = [
    { k: "Avg Recovery (7D)", icon: "battery", v: 61, f: "pct", tone: "yellow", chip: "5.4%", chipRed: true, sub: "vs previous 7 days", bar: "yellow" },
    { k: "Low Recovery %", icon: "alert", v: 7, f: "pct", sub: "of recovery readings red" },
    { k: "Avg HRV (RMSSD, 7D)", icon: "heart", v: 102, f: "ms", chip: "– 2.9 ms", sub: "vs previous 7 days" },
    { k: "Avg Resting HR (7D)", icon: "heart", v: 48, f: "bpm", chip: "– 0.2 bpm", sub: "vs previous 7 days" },
    { k: "Avg Sleep (7D)", icon: "moon", v: 458, f: "hm", chip: "– 0:09", sub: "vs previous 7 days" },
    { k: "Avg Sleep Debt (7D)", icon: "moon", itone: "bright", v: 16, f: "hm", tone: "lime", sub: "average nightly debt", bar: "lime" },
    { k: "Avg Strain (7D)", icon: "zap", itone: "blue", v: 11.9, f: "d1", tone: "lime", chip: "– 0.2", sub: "scale 0 – 21", bar: "lime" },
    { k: "Connected Athletes", icon: "activity", v: 20, f: "int", sub: "all athletes connected" },
  ];

  // Priority Action Roster: key, name, group, recovery %, tone, ACWR, flag text, flag tone
  const ROSTER = [
    ["hugo", "Hugo Lambert", "Midfielders", 3, "red", "1.01", "Low recovery", "red"],
    ["tomas", "Tomás Ferreira", "Defenders", 63, "yellow", "1.03", "Sleep debt", "green"],
  ];
  // Group Comparison: key, group, members, avg recovery %, avg strain, risk %
  const GROUPS = [
    ["goalkeepers", "Goalkeepers", 3, 62, "11.5", "6%"],
    ["defenders", "Defenders", 6, 64, "11.8", "5%"],
    ["forwards", "Forwards", 5, 66, "11.9", "0%"],
    ["midfielders", "Midfielders", 6, 54, "12.0", "5%"],
  ];
  // Rows enter alternating between the two tables.
  const ROW_ORDER = ["hugo", "goalkeepers", "tomas", "defenders", "forwards", "midfielders"];

  const DAYS = ["Sep 26", "Sep 27", "Sep 28", "Sep 29", "Sep 30", "Oct 1", "Oct 2"];
  const series = (v, lo, hi) => v.map((x, i) => ({ v: x, lo: lo[i], hi: hi[i] }));
  // Read off the reference charts (28-day normal range, last 7 days shown).
  const TRENDS = [
    {
      title: "HRV Trend", min: 96, max: 112, ticks: [96, 100, 104, 108, 112],
      values: series([103.6, 97.7, 107.4, 105.9, 96.9, 100.2, 105.6], [100.6, 100.6, 100.7, 100.6, 100.6, 100.1, 100.4], [108.0, 108.0, 108.0, 107.8, 107.8, 107.3, 107.4]),
    },
    {
      title: "Resting HR Trend", min: 46.8, max: 49.2, ticks: [46.8, 47.4, 48, 48.6, 49.2],
      values: series([47.33, 48.89, 47.33, 46.95, 48.41, 49.01, 48.19], [47.4, 47.41, 47.41, 47.42, 47.37, 47.4, 47.4], [48.24, 48.24, 48.23, 48.24, 48.21, 48.24, 48.23]),
    },
    {
      title: "Sleep Duration Trend", min: 6.4, max: 8.8, ticks: [6.4, 7, 7.6, 8.2, 8.8],
      values: series([7.7, 7.1, 8.3, 7.5, 6.8, 7.9, 7.6], [7.2, 7.2, 7.25, 7.2, 7.15, 7.2, 7.2], [8.1, 8.1, 8.05, 8.1, 8.1, 8.05, 8.1]),
    },
    {
      title: "Recovery Trend", min: 40, max: 80, ticks: [40, 50, 60, 70, 80],
      values: series([64, 52, 71, 60, 47, 66, 61], [55, 55, 56, 55, 54, 55, 55], [72, 72, 71, 72, 72, 71, 72]),
    },
  ];
  const CH = { w: 510, h: 255, pad: [36, 10, 24, 10] }; // chart box inside a trend panel

  const tile = (t, i) => `
    <div class="tile" data-i="${i}">
      <div class="t-top"><span class="t-k">${t.k}</span>${IC.info}<span class="t-ic ${t.itone || ""}">${IC[t.icon]}</span></div>
      <div class="t-val">
        <span class="v ${t.f === "pct" ? "sans" : "mono"} ${t.tone || ""}"><span class="ghost">${FMT[t.f](t.v)}</span><span class="cur"></span></span>
        ${t.chip ? `<span class="chip${t.chipRed ? " red" : ""}">${t.chipRed ? IC.arrowDown : ""}${t.chip}</span>` : ""}
      </div>
      <div class="t-sub">${t.sub}</div>
      ${t.bar ? `<i class="bar ${t.bar}"></i>` : ""}
    </div>`;

  const rosterRow = ([key, name, group, rec, tone, acwr, flag, ftone]) => `
    <div class="tr" data-row="${key}">
      <span class="who"><b>${name}</b><i>${group}</i></span>
      <span class="rec ${tone}" data-v="${rec}"></span>
      <span class="acwr">${acwr}</span>
      <span class="flags"><em class="flag ${ftone}">${flag}</em></span>
    </div>`;

  const groupRow = ([key, name, n, rec, strain, risk]) => `
    <div class="tr" data-row="${key}">
      <span class="who"><b>${IC.users}${name}</b><i>${n} members</i></span>
      <span class="rec yellow" data-v="${rec}"></span>
      <span class="num-c">${strain}</span>
      <span class="num-c">${risk}</span>
    </div>`;

  // Trend chart: the shell's band chart plus dashed gridlines, tick marks and axis labels.
  function trendChart(t) {
    const { w, h, pad } = CH;
    const [pl, pt, pb, pr] = pad;
    const Y = (v) => pt + (1 - (v - t.min) / (t.max - t.min)) * (h - pt - pb);
    const X = (i) => pl + (i / (t.values.length - 1)) * (w - pl - pr);
    const lab = (v) => `${+v.toFixed(1)}`;
    const grid = t.ticks
      .map((v) => {
        const y = Y(v).toFixed(1);
        return `${v === t.min ? "" : `<line class="gl" x1="${pl}" y1="${y}" x2="${w - pr}" y2="${y}"/>`}<line class="tk" x1="${pl - 5}" y1="${y}" x2="${pl}" y2="${y}"/><text class="yl" x="${pl - 7}" y="${y}">${lab(v)}</text>`;
      })
      .join("");
    const xs = DAYS.map((d, i) => {
      const x = X(i).toFixed(1);
      // the last label is pulled in so it ends just past its tick, as on the real chart
      const last = i === DAYS.length - 1;
      return `<line class="tk" x1="${x}" y1="${h - pb}" x2="${x}" y2="${h - pb + 5}"/><text class="xl${last ? " end" : ""}" x="${last ? (+x + 5).toFixed(1) : x}" y="${h - pb + 7}">${d}</text>`;
    }).join("");
    const chart = I8.iam.bandChart({ values: t.values, w, h, min: t.min, max: t.max, pad, band: "#22423a" });
    // gridlines sit under the band; labels and ticks on top
    return chart.replace(/<g clip-path/, `<g class="grid">${grid}${xs}</g><g clip-path`);
  }

  const trend = (t) => `
    <div class="panel trend">
      <div class="tr-head">
        <div class="p-title">${t.title}</div>
        <div class="range"><span class="nr">Normal range</span><span class="sg">7d</span><span class="sg">14d</span><span class="sg on">28d</span></div>
      </div>
      <div class="chart">${trendChart(t)}</div>
    </div>`;

  I8.iam.panes.command = (pane, h) => {
    const { clamp, lerp, prog, ease } = h;
    pane.classList.add("pane-command");
    pane.innerHTML = `
      <div class="cc">
        <div class="head">
          <div class="titles">
            <div class="h1">Command Center</div>
            <div class="sub">Real-time organisational readiness and risk distribution.</div>
          </div>
          <div class="tools">
            <div class="range-pill">${IC.calendar}<span>Last 7 Days</span>${IC.down}</div>
            <div class="grid-btn">${IC.grid}</div>
          </div>
        </div>
        <div class="kpis">${TILES.map(tile).join("")}</div>
        <div class="panels">
          <div class="panel roster">
            <div class="p-head">
              <div class="p-txt">
                <div class="p-title">Priority Action Roster</div>
                <div class="p-sub">Athletes with active risk flags — review before today's session.</div>
              </div>
              <div class="btn">View All ${IC.right}</div>
            </div>
            <div class="tbl">
              <div class="th"><span>Athlete</span><span>Recovery</span><span>ACWR</span><span>Active Flags</span></div>
              ${ROSTER.map(rosterRow).join("")}
            </div>
          </div>
          <div class="panel groups">
            <div class="p-head">
              <div class="p-txt">
                <div class="p-title">Group Comparison</div>
                <div class="p-sub">Metrics aggregated by team / group · 7-day window</div>
              </div>
            </div>
            <div class="tbl">
              <div class="th"><span>Group</span><span>Avg Recovery</span><span>Avg Strain</span><span>Risk %</span></div>
              ${GROUPS.map(groupRow).join("")}
            </div>
          </div>
        </div>
        <div class="trends">${TRENDS.map(trend).join("")}</div>
      </div>`;

    const $ = (s) => pane.querySelector(s);
    const $$ = (s) => [...pane.querySelectorAll(s)];
    const cc = $(".cc");
    const titles = $(".head .titles");
    const tools = $(".head .tools");
    const tiles = $$(".tile").map((el, i) => ({
      el,
      t: TILES[i],
      cur: el.querySelector(".cur"),
      chip: el.querySelector(".chip"),
      bar: el.querySelector(".bar"),
    }));
    const panels = [$(".panel.roster"), $(".panel.groups")];
    const rows = Object.fromEntries(
      $$(".tbl .tr").map((el) => {
        const rec = el.querySelector(".rec");
        return [el.dataset.row, { el, rec, v: +rec.dataset.v, flag: el.querySelector(".flag") }];
      }),
    );
    const trends = $$(".panel.trend").map((el) => ({
      el,
      reveal: el.querySelector(".reveal"),
      dots: [...el.querySelectorAll(".dot")],
    }));
    const text = (el, s) => {
      if (el.textContent !== s) el.textContent = s;
    };
    const rise = (el, q, dy = 12) => {
      el.style.opacity = q.toFixed(3);
      el.style.transform = q >= 1 ? "" : `translateY(${((1 - q) * dy).toFixed(2)}px)`;
    };

    return {
      seek(p, opts = {}) {
        p = clamp(p);

        // Title block
        rise(titles, ease.out(prog(p, 0, 0.12)), 10);
        rise(tools, ease.out(prog(p, 0.03, 0.14)), 10);

        // KPI tiles: 0.05–0.45, each 0.16 long, staggered
        tiles.forEach(({ el, t, cur, chip, bar }, i) => {
          const t0 = 0.05 + i * (0.24 / 7);
          const q = prog(p, t0, t0 + 0.16);
          rise(el, ease.out(prog(q, 0, 0.55)), 16);
          const c = ease.out(prog(q, 0.1, 1));
          text(cur, FMT[t.f](t.v * c));
          if (chip) chip.style.opacity = ease.out(prog(q, 0.65, 1)).toFixed(3);
          if (bar) bar.style.transform = `scaleX(${ease.inOut(prog(q, 0.35, 1)).toFixed(4)})`;
        });

        // Panels: 0.40–0.58 and 0.47–0.65
        panels.forEach((el, i) => rise(el, ease.out(prog(p, 0.4 + i * 0.07, 0.58 + i * 0.07)), 18));

        // Rows: 0.55–0.95, alternating tables
        const focus = opts.focus && rows[opts.focus] ? opts.focus : null;
        const fp = focus ? clamp(opts.focusP ?? 1) : 0;
        ROW_ORDER.forEach((key, k) => {
          const { el, rec, v, flag } = rows[key];
          const t0 = 0.55 + k * 0.05;
          const q = prog(p, t0, t0 + 0.15);
          const a = ease.out(prog(q, 0, 0.7));
          const dim = focus && key !== focus ? lerp(1, 0.3, fp) : 1;
          el.style.opacity = (a * dim).toFixed(3);
          el.style.transform = a >= 1 ? "" : `translateX(${((1 - a) * -14).toFixed(2)}px)`;
          el.classList.toggle("focus", key === focus && fp > 0);
          el.style.setProperty("--fp", (key === focus ? fp : 0).toFixed(3));
          text(rec, `${Math.round(v * ease.out(prog(q, 0.1, 0.9)))}%`);
          if (flag) {
            const f = ease.out(prog(q, 0.55, 1));
            flag.style.opacity = f.toFixed(3);
            flag.style.transform = f >= 1 ? "" : `scale(${lerp(0.85, 1, f).toFixed(3)})`;
          }
        });

        // Trend panels (below the fold)
        const chartP = clamp(opts.charts ?? prog(p, 0.65, 1));
        trends.forEach(({ el, reveal, dots }, i) => {
          rise(el, ease.out(prog(p, 0.6 + i * 0.04, 0.78 + i * 0.04)), 18);
          const cq = clamp((chartP - i * 0.04) / 0.88);
          reveal.setAttribute("width", (CH.w * ease.inOut(prog(cq, 0, 0.8))).toFixed(1));
          dots.forEach((d, j) => {
            const dq = ease.out(prog(cq, 0.1 + j * 0.1, 0.3 + j * 0.1));
            d.style.opacity = dq.toFixed(3);
            d.style.transform = dq >= 1 ? "" : `scale(${lerp(0.2, 1, dq).toFixed(3)})`;
          });
        });

        // Scroll to the "One command center" view (trend charts in view)
        const s = clamp(opts.scroll ?? 0);
        cc.style.transform = s ? `translateY(${(-440 * s).toFixed(1)}px)` : "";
      },
    };
  };
})();
