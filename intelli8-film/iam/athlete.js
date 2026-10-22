/* IAM pane: Athlete profile — Sander Vos, RECOVERY & HRV tab, personal-baseline trend charts.
 *
 *   I8.iam.panes.athlete(pane, h) → { seek(p, opts) }      (sidebar active: "Roster")
 *
 * Rebuilt from intelli8.ai "Individual · Personal HRV baseline" (charts) and "Sleep and load" (athlete
 * header). Nightly values were traced from the reference screenshots (Jul 5 → Oct 2, 90 nights, the
 * night of Sep 17 has no reading) — fixed data, no randomness.
 *
 * Timeline over p (pure function of p and opts):
 *   0.00–0.20  header: Back to Roster, name + ACTIVE, email/sync, body stats, Forwards chip,
 *              "Last 30 Days" pill, tabs; the RECOVERY & HRV underline grows 0.12–0.21
 *   0.10–0.24  HRV card rises in (title, copy, Normal range 7d/14d/28d, axes)
 *   0.20–0.85  HRV normal-range band reveals left → right; each in-band dot pops as the reveal passes
 *              it (0.03), out-of-band dots land 0.012 later, larger, with a ~7 % overshoot (0.05);
 *              the last HRV dot settles at p ≈ 0.91
 *   0.30–0.56  page scrolls down 305 px (header leaves, both charts framed like the reference)
 *   0.35–0.47  Resting Heart Rate card rises in
 *   0.40–0.92  RHR band reveal + dots (last dot settles at p ≈ 0.98; everything final at p = 1)
 *
 * opts (optional):
 *   scroll   0..1 — override the page scroll (0 = top: header + HRV card, RHR card cut off below;
 *            1 = scrolled to the charts as in the reference). Default: automatic, as above.
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
  };

  // Nightly [band low, band high, value] from Jul 5 (index 0) to Oct 2 (index 89); null = no reading.
  // prettier-ignore
  const HRV = [[72.1,82.2,72.6],[72.1,82.2,76.8],[72.2,82.3,85.0],[72.0,82.3,64.5],[71.9,82.4,80.2],[71.8,82.5,84.1],[72.1,82.8,90.0],[72.2,82.9,70.5],[72.4,83.1,85.1],[72.7,83.4,79.4],[73.0,83.6,69.3],[73.0,83.6,73.3],[72.9,83.6,81.8],[72.6,83.1,67.1],[72.4,82.6,66.2],[72.2,82.2,83.7],[72.3,82.4,86.2],[72.7,82.8,83.8],[73.2,83.1,72.1],[73.3,82.9,72.4],[73.2,82.3,75.1],[72.8,81.7,64.4],[72.7,81.4,89.6],[72.4,81.2,69.0],[72.2,80.9,74.6],[72.2,80.8,74.8],[72.1,80.8,69.4],[71.9,80.6,70.0],[71.6,80.4,68.8],[71.5,80.1,76.5],[71.3,80.0,75.1],[71.5,79.9,78.5],[71.6,80.0,84.4],[71.8,80.0,77.9],[71.7,79.8,81.8],[71.7,79.5,76.8],[71.7,79.3,76.8],[71.9,79.4,85.4],[72.1,79.5,77.1],[72.2,79.3,73.2],[72.3,79.3,80.0],[72.4,79.4,82.5],[72.7,79.8,66.9],[72.8,79.8,76.1],[72.8,79.5,79.3],[72.6,79.1,71.0],[72.5,79.0,74.4],[72.3,78.8,67.1],[72.1,78.7,67.4],[71.5,78.7,56.9],[70.9,78.3,63.6],[70.3,78.0,62.0],[69.3,77.7,50.8],[67.7,77.6,45.6],[66.2,77.6,66.3],[65.2,77.4,56.8],[64.3,77.3,45.3],[63.5,77.1,75.9],[62.8,77.0,75.5],[62.6,76.8,59.0],[62.0,76.2,51.3],[61.4,75.5,72.0],[61.0,75.0,81.7],[60.8,74.6,58.8],[60.5,74.3,71.0],[60.2,73.9,83.2],[60.1,73.6,69.7],[60.1,73.6,85.1],[60.1,73.7,77.7],[60.1,74.1,93.1],[60.1,73.9,68.7],[60.1,74.1,73.8],[60.1,74.0,68.5],[60.1,74.2,72.4],[60.0,74.0,null],[60.0,74.5,95.8],[60.1,75.1,78.5],[60.4,75.6,63.9],[60.7,76.0,76.9],[61.1,76.5,80.4],[61.9,77.1,82.8],[63.1,78.0,77.6],[64.4,78.8,81.6],[65.6,79.8,81.3],[67.2,80.2,63.6],[68.1,80.3,68.0],[68.7,80.4,87.3],[68.6,80.7,75.6],[69.5,80.7,78.0],[70.1,80.8,67.7]];
  // prettier-ignore
  const RHR = [[46.6,48.0,48.3],[46.6,48.1,45.6],[46.6,48.1,46.7],[46.5,48.0,47.6],[46.5,48.0,45.9],[46.4,48.0,47.1],[46.4,48.0,47.7],[46.4,47.9,46.7],[46.3,47.8,44.0],[46.2,47.8,46.6],[46.2,47.7,48.5],[46.2,47.7,46.7],[46.1,47.6,47.9],[46.1,47.6,47.8],[46.2,47.6,46.6],[46.2,47.7,48.1],[46.2,47.7,45.4],[46.2,47.7,48.5],[46.2,47.7,47.1],[46.3,47.7,47.3],[46.3,47.7,46.8],[46.3,47.7,48.3],[46.3,47.7,47.3],[46.3,47.7,46.9],[46.3,47.7,50.2],[46.3,47.7,45.3],[46.3,47.8,48.0],[46.3,47.8,46.6],[46.4,47.8,47.4],[46.5,47.8,46.2],[46.5,47.8,46.3],[46.5,47.8,47.3],[46.5,47.8,47.1],[46.6,47.8,46.4],[46.6,47.8,46.8],[46.5,47.7,46.9],[46.5,47.7,49.2],[46.6,47.7,47.5],[46.7,47.8,49.6],[46.8,48.0,46.6],[46.8,48.0,48.5],[46.7,48.0,46.1],[46.7,48.0,50.3],[46.7,48.1,47.0],[46.7,48.1,48.6],[46.8,48.2,49.6],[46.8,48.3,50.5],[46.9,48.4,49.4],[46.9,48.6,49.4],[47.0,48.7,51.1],[47.0,48.9,50.7],[47.1,49.0,48.5],[47.1,49.1,52.5],[47.2,49.3,53.8],[47.3,49.5,49.2],[47.4,49.7,50.0],[47.5,49.8,52.4],[47.6,50.0,51.0],[47.8,50.2,49.4],[47.9,50.3,46.6],[48.0,50.3,52.1],[48.1,50.4,46.7],[48.1,50.5,48.4],[48.2,50.5,46.7],[48.1,50.5,46.4],[48.0,50.4,45.5],[47.9,50.4,48.1],[47.9,50.4,47.3],[47.8,50.4,45.7],[47.8,50.4,46.3],[47.7,50.3,48.1],[47.7,50.3,45.4],[47.6,50.3,47.0],[47.5,50.2,46.8],[47.4,50.1,null],[47.3,50.1,48.3],[47.3,50.0,46.9],[47.2,49.9,47.7],[47.2,49.8,49.5],[47.2,49.7,46.8],[47.3,49.6,47.8],[47.3,49.4,49.1],[47.3,49.2,46.5],[47.3,49.0,48.5],[47.3,48.9,49.7],[47.3,48.7,48.5],[47.3,48.6,45.3],[47.4,48.4,47.0],[47.4,48.3,47.8],[47.4,48.2,48.1]];

  // Day index → label (index 0 = Jul 5). Ticks as on the real chart: Jul 6, then every 4 days, Oct 2.
  const MONTHS = [["Jul", 5, 31], ["Aug", 1, 31], ["Sep", 1, 30], ["Oct", 1, 31]];
  const dayLabel = (i) => {
    let d = 5 + i;
    for (const [m, , len] of MONTHS) {
      if (d <= len) return `${m} ${d}`;
      d -= len;
    }
    return "";
  };
  const TICKS = [1, ...Array.from({ length: 21 }, (_, k) => 4 + 4 * k), 89];

  // Card geometry (card-relative px, measured from the reference).
  const CW = 1140, CH = 444;
  const AX = 65, X0 = 64.8, DX = 11.74; // y axis x, first night x, px per night
  const YT = 123.5, YB = 388.5; // axis top / bottom
  const XEND = X0 + 89 * DX;

  // Band edge: straight segments night to night, as the real chart draws it.
  const poly = (pts, cmd = "M") => pts.map(([x, y], i) => `${i ? "L" : cmd}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  let uid = 0;
  function chart({ key, title, copy, data, min, max, step }) {
    const id = `ath-${key}-${++uid}`;
    const X = (i) => X0 + i * DX;
    const Y = (v) => YT + ((max - v) / (max - min)) * (YB - YT);
    const top = data.map((d, i) => [X(i), Y(d[1])]);
    const bot = data.map((d, i) => [X(i), Y(d[0])]).reverse();
    const band = `${poly(top)} ${poly(bot, "L")} Z`;
    const yt = [];
    for (let v = max; v >= min - 1e-6; v -= step) yt.push(v);
    const dots = data
      .map((d, i) => {
        if (d[2] == null) return "";
        const out = d[2] < d[0] || d[2] > d[1];
        return `<circle class="${out ? "o" : "n"}" data-i="${i}" cx="${X(i).toFixed(1)}" cy="${Y(d[2]).toFixed(1)}" r="0"/>`;
      })
      .join("");
    return `
      <div class="card ${key}">
        <div class="ct">${title}</div>
        <div class="cc">${copy}</div>
        <div class="range"><span class="nr">Normal range</span><span>7d</span><span>14d</span><span class="on">28d</span></div>
        <svg class="plot" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}">
          <defs><clipPath id="${id}"><rect class="rev" x="0" y="0" width="0" height="${CH}"/></clipPath></defs>
          <g class="axes">
            ${yt
              .map(
                (v) =>
                  `<line x1="${AX - 6}" x2="${AX}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="yl" x="${AX - 9}" y="${Y(v).toFixed(1)}">${v}</text>`
              )
              .join("")}
            ${TICKS.map(
              (i) =>
                `<line x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${YB}" y2="${YB + 6}"/><text class="xl" x="${X(i).toFixed(1)}" y="${YB + 13}">${dayLabel(i)}</text>`
            ).join("")}
            <path class="ax" d="M${AX} ${YT} V${YB} H${XEND.toFixed(1)}"/>
          </g>
          <path class="band" clip-path="url(#${id})" d="${band}"/>
          <g class="dots">${dots}</g>
        </svg>
      </div>`;
  }

  I8.iam.panes.athlete = (pane, h) => {
    const { clamp, lerp, prog, ease } = h;
    pane.classList.add("pane-athlete");
    pane.innerHTML = `
      <div class="ath">
        <div class="back">${IC.back}<span>Back to Roster</span></div>
        <div class="who">
          <div class="nm"><span>Sander Vos</span><span class="badge">ACTIVE</span></div>
          <div class="meta m1"><span>sander.vos@u23-demo.test</span><span class="ic">${IC.cal}Last Sync: Oct 2, 4:42 PM</span></div>
          <div class="meta m2"><span class="ic">${IC.ruler}182 cm</span><span class="ic">${IC.scale}70.0 kg</span><span class="ic hr">${IC.heart}Max HR: 200 bpm</span></div>
          <div class="chip">Forwards</div>
        </div>
        <div class="days">${IC.calDays}<span>Last 30 Days</span>${IC.chev}</div>
        <div class="tabs">
          <span>Overview</span><span class="on">Recovery &amp; HRV<i></i></span><span>Sleep</span><span>Strain</span><span>Workouts</span>
        </div>
        ${chart({
          key: "hrv",
          title: "Heart Rate Variability Trend",
          copy: "Each night's HRV against the athlete's normal range from the previous 28 days. A dot outside the band is a bigger move than usual for this athlete.",
          data: HRV,
          min: 45,
          max: 105,
          step: 15,
        })}
        ${chart({
          key: "rhr",
          title: "Resting Heart Rate Trend",
          copy: "Each night's resting heart rate against the athlete's normal range from the previous 28 days. A rise above the band can mean fatigue or low recovery.",
          data: RHR,
          min: 42,
          max: 54,
          step: 3,
        })}
      </div>`;

    const $ = (s) => pane.querySelector(s);
    const ath = $(".ath");
    const head = [
      [$(".back"), 0.0],
      [$(".nm"), 0.02],
      [$(".m1"), 0.04],
      [$(".m2"), 0.05],
      [$(".chip"), 0.06],
      [$(".days"), 0.06],
      [$(".tabs"), 0.08],
    ];
    const underline = $(".tabs .on i");
    const charts = ["hrv", "rhr"].map((k) => {
      const card = $(`.card.${k}`);
      return {
        card,
        rev: card.querySelector(".rev"),
        dots: [...card.querySelectorAll(".dots circle")].map((el) => ({
          el,
          x: +el.getAttribute("cx"),
          out: el.classList.contains("o"),
        })),
      };
    });
    const T = [
      { in: [0.1, 0.24], rev: [0.2, 0.85] },
      { in: [0.35, 0.47], rev: [0.4, 0.92] },
    ];
    const FRONT0 = X0 - 6, FRONT1 = XEND + 6; // reveal front travels FRONT0 → FRONT1 (card px)
    const SCROLL = 305; // card top lands where the reference frames it

    const show = (el, a, dy = 0) => {
      el.style.opacity = a.toFixed(3);
      el.style.transform = dy ? `translateY(${dy.toFixed(2)}px)` : "none";
    };
    // Back-out with a small overshoot (≈ 7 %).
    const pop = (t) => {
      const c = 1.4;
      return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
    };
    // Reveal speed curve: eases in and out gently, mostly linear through the middle (and its inverse).
    const sweep = (t) => (t < 0.15 ? (t * t) / 0.255 : t > 0.85 ? 1 - ((1 - t) * (1 - t)) / 0.255 : (t - 0.075) / 0.85);
    const unsweep = (y) => (y < 0.15 ** 2 / 0.255 ? Math.sqrt(0.255 * y) : y > 1 - 0.15 ** 2 / 0.255 ? 1 - Math.sqrt(0.255 * (1 - y)) : 0.85 * y + 0.075);
    // When the front passes each dot (in p): in-band dots pop as it passes, out-of-band dots land a
    // beat later. Fixed per dot, so every dot has settled by the end of the reveal + DUR_OUT.
    const DUR_IN = 0.03, LAG_OUT = 0.012, DUR_OUT = 0.05;
    const R_IN = 3, R_OUT = 4.9; // dot radii (px), as measured on the reference
    charts.forEach((c, k) => {
      const [r0, r1] = T[k].rev;
      for (const d of c.dots) d.t = r0 + (r1 - r0) * unsweep(clamp((d.x - FRONT0) / (FRONT1 - FRONT0)));
    });

    return {
      seek(p, opts = {}) {
        p = clamp(p);

        // Page scroll
        const s = typeof opts.scroll === "number" ? clamp(opts.scroll) : ease.inOut(prog(p, 0.3, 0.56));
        ath.style.transform = `translateY(${(-SCROLL * s).toFixed(2)}px)`;

        // Header
        for (const [el, t0] of head) {
          const a = ease.out(prog(p, t0, t0 + 0.11));
          show(el, a, lerp(10, 0, a));
        }
        underline.style.transform = `scaleX(${ease.out(prog(p, 0.12, 0.21)).toFixed(4)})`;

        // Chart cards
        charts.forEach((c, k) => {
          const a = ease.out(prog(p, T[k].in[0], T[k].in[1]));
          show(c.card, a, lerp(18, 0, a));

          const r = sweep(prog(p, T[k].rev[0], T[k].rev[1]));
          const edge = lerp(FRONT0, FRONT1, r); // reveal front, card px
          c.rev.setAttribute("width", Math.max(0, edge).toFixed(1));

          for (const d of c.dots) {
            if (d.out) {
              // bigger, a beat after the front, with a small overshoot
              const t = prog(p, d.t + LAG_OUT, d.t + LAG_OUT + DUR_OUT);
              d.el.setAttribute("r", (R_OUT * (t <= 0 ? 0 : pop(t))).toFixed(2));
              d.el.style.opacity = clamp(t * 3).toFixed(3);
            } else {
              const t = prog(p, d.t - 0.004, d.t - 0.004 + DUR_IN);
              d.el.setAttribute("r", (R_IN * ease.out(t)).toFixed(2));
              d.el.style.opacity = t.toFixed(3);
            }
          }
        });
      },
    };
  };
})();
