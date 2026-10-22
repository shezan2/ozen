/* History tab: large "History" title, the Body Fat % chart card (trend, metric picker, 1M · 3M · 6M · All
 * with 3M selected, smoothed area chart Aug 13 → Sep 24), the MEASUREMENT LOG list (continues under
 * the tab bar) and the tab bar (History active).
 *
 * seek(p, { press = 0 }):
 *   0.00–0.20  title (0.00–0.14), then the chart card with its header, picker and range control
 *              (0.04–0.20) rise in; axis labels and gridlines come with the card
 *   0.20–0.70  the line draws left to right (ease in-out); each hollow point pops (0.06, slight
 *              overshoot) the moment the pen reaches it; the area fill follows the pen and fades in
 *   0.60–0.75  "▼ 1.6% over 6 weeks" fades / slides in
 *   0.50–0.62  MEASUREMENT LOG caption rises in
 *   0.55–1.00  log rows, staggered (row i: 0.55 + 0.045·i → +0.18): each white cell fades up in place
 *              while its date / values / chevron slide in from the right, so the list card builds top-down
 *   press (0..1) highlights the first log row for a tap (deepest at press = 0.5).
 */
(() => {
  let uid = 0;

  // Weigh-ins, newest first: [date, time, weight kg, body fat %, muscle kg, days after the first one].
  const LOG = [
    ["Sep 24, 2026", "6:08 PM", "72.40", 18.2, "58.1", 42 + 625 / 1440],
    ["Sep 17, 2026", "7:43 AM", "72.50", 18.4, "58.0", 35],
    ["Sep 10, 2026", "7:43 AM", "72.60", 18.6, "57.8", 28],
    ["Sep 3, 2026", "7:43 AM", "72.80", 18.8, "57.7", 21],
    ["Aug 27, 2026", "7:43 AM", "73.00", 19.1, "57.5", 14],
    ["Aug 20, 2026", "7:43 AM", "73.30", 19.5, "57.4", 7],
    ["Aug 13, 2026", "7:43 AM", "73.60", 19.8, "57.2", 0],
  ];
  const SPAN = LOG[0][5];

  // Chart geometry in card-local px (the card is 358 × 260 at 16, 165), measured from the app screen.
  const CW = 358, CH = 260;
  const X0 = 35, X1 = 344.3; // first / last weigh-in
  const Y195 = 140.7, PER = 61.6; // y of 19.5 %, px per 1 %
  const xOf = (days) => X0 + (days / SPAN) * (X1 - X0);
  const yOf = (v) => Y195 + (19.5 - v) * PER;
  const GRID = [19.5, 19.0, 18.5];
  // Date ticks (midnight), label drawn just right of the tick.
  const TICKS = [["Aug 23", 9 + 977 / 1440], ["Sep 6", 23 + 977 / 1440], ["Sep 20", 37 + 977 / 1440]];

  // Smooth line (Catmull-Rom → cubic Bézier) through points.
  function smooth(pts) {
    let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1.map((v) => v.toFixed(2)).join(" ")} ${c2.map((v) => v.toFixed(2)).join(" ")} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return d;
  }

  const TRI_DOWN = `<svg viewBox="0 0 8 8"><path d="M0 .2h8L4 8z" fill="currentColor"/></svg>`;
  const CHEV_DOWN = `<svg viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.8L6 6.2l4.5-4.4"/></svg>`;
  const CHEV = `<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5L6.6 7l-5.1 5.5"/></svg>`;
  const NNBSP = " "; // iOS puts a narrow no-break space before AM / PM

  I8.screens.history = (root, h) => {
    root.classList.add("scr-history");
    const id = `hist${++uid}`;

    const pts = LOG.slice().reverse().map((r) => [xOf(r[5]), yOf(r[3])]);
    const line = smooth(pts);
    const area = `${line} L${X1} ${CH + 2} L${X0} ${CH + 2} Z`;

    root.innerHTML =
      h.status() +
      `<div class="title">History</div>
       <div class="card chart">
         <div class="metric">Body Fat %</div>
         <div class="trend">${TRI_DOWN}<span>1.6% over 6 weeks</span></div>
         <div class="pick"><span>Body Fat<br>%</span>${CHEV_DOWN}</div>
         <div class="seg"><i class="sel"></i><span>1M</span><span class="on">3M</span><span>6M</span><span>All</span></div>
         <svg class="plot" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">
           <defs>
             <linearGradient id="${id}-g" x1="0" y1="${yOf(19.8)}" x2="0" y2="${CH}" gradientUnits="userSpaceOnUse">
               <stop offset="0" stop-color="#c4874b" stop-opacity=".16"/>
               <stop offset="1" stop-color="#c4874b" stop-opacity=".12"/>
             </linearGradient>
             <clipPath id="${id}-c"><rect x="0" y="0" width="0" height="${CH}"/></clipPath>
           </defs>
           <path class="area" d="${area}" fill="url(#${id}-g)" clip-path="url(#${id}-c)"/>
           ${GRID.map((v) => `<path class="grid" d="M${X0} ${yOf(v).toFixed(2)}H${X1 + 0.7}"/>`).join("")}
           <path class="line" d="${line}"/>
           ${pts.map(([x, y]) => `<g class="pt" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><circle r="2.75"/></g>`).join("")}
         </svg>
         ${GRID.map((v) => `<div class="ylab" style="top:${(yOf(v) - 6).toFixed(2)}px">${v.toFixed(1)}</div>`).join("")}
         ${TICKS.map(([t, d]) => `<div class="xlab" style="left:${(xOf(d) + 4.5).toFixed(2)}px">${t}</div>`).join("")}
       </div>
       <div class="caps cap-log">Measurement Log</div>
       <div class="card log">${LOG.map(
         ([d, t, kg, fat, mm]) =>
           `<div class="entry"><div class="in"><div class="when">${d} · ${t.replace(" ", NNBSP)}</div><div class="vals">${kg} kg · ${fat.toFixed(1)}% · ${mm} kg</div>${CHEV}</div></div>`
       ).join("")}</div>
       <div class="edge"></div>` +
      h.tabs("history") +
      h.home();

    const $ = (s) => root.querySelector(s);
    const title = $(".title");
    const card = $(".chart");
    const trend = $(".trend");
    const linePath = $(".line");
    const len = linePath.getTotalLength();
    const draw = h.drawable(linePath);
    // x of the pen at each drawn fraction (so the fill tracks it), and the fraction at which it reaches each point.
    const N = 120;
    const xs = Array.from({ length: N + 1 }, (_, i) => linePath.getPointAtLength((len * i) / N).x);
    const reach = pts.map(([x]) => {
      let i = 0;
      while (i < N && xs[i + 1] < x) i++;
      return Math.min(1, (i + (x - xs[i]) / (xs[i + 1] - xs[i] || 1)) / N);
    });
    const areaEl = $(".area");
    const clip = $(`#${id}-c rect`);
    // p at which the pen (eased in-out over 0.2–0.7) reaches each point.
    const unease = (y) => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2);
    const dots = [...root.querySelectorAll(".pt")].map((g, i) => ({ g, base: g.getAttribute("transform"), at: 0.2 + 0.5 * unease(reach[i]) }));
    const capLog = $(".cap-log");
    const log = $(".log");
    const rows = [...log.querySelectorAll(".entry")].map((el) => ({ el, inner: el.querySelector(".in") }));

    const rise = (el, q, dy) => {
      el.style.opacity = q.toFixed(4);
      el.style.transform = q >= 1 ? "none" : `translateY(${((1 - q) * dy).toFixed(2)}px)`;
    };

    return {
      seek(p, { press = 0 } = {}) {
        const { prog, ease, clamp, lerp } = h;

        // Title, then the chart card.
        rise(title, ease.glide(prog(p, 0, 0.14)), 12);
        const qc = ease.glide(prog(p, 0.04, 0.2));
        card.style.opacity = qc.toFixed(4);
        card.style.transform = qc >= 1 ? "none" : `translateY(${((1 - qc) * 16).toFixed(2)}px) scale(${(0.98 + 0.02 * qc).toFixed(4)})`;

        // Line draws; the fill follows the pen and fades in behind it.
        const qd = ease.inOut(prog(p, 0.2, 0.7));
        draw(qd);
        linePath.style.visibility = qd > 0 ? "visible" : "hidden";
        const f = qd * N, i0 = Math.floor(f), i1 = Math.min(N, i0 + 1);
        const x = lerp(xs[i0], xs[i1], f - i0);
        clip.setAttribute("width", qd <= 0 ? "0" : (x + 0.5).toFixed(2));
        areaEl.style.opacity = ease.out(prog(qd, 0, 0.45)).toFixed(4);

        // Each point pops (slight overshoot) as the pen reaches it.
        for (const d of dots) {
          const q = prog(p, d.at, d.at + 0.06);
          const s = q <= 0 ? 0 : q >= 1 ? 1 : Math.min(1, q * 1.5) * (1 + 0.45 * Math.sin(Math.PI * q));
          d.g.setAttribute("transform", s >= 1 ? d.base : `${d.base} scale(${s.toFixed(4)})`);
          d.g.style.visibility = s > 0 ? "visible" : "hidden";
        }

        // Trend line.
        const qt = ease.glide(prog(p, 0.6, 0.75));
        trend.style.opacity = qt.toFixed(4);
        trend.style.transform = qt >= 1 ? "none" : `translateX(${((1 - qt) * -8).toFixed(2)}px)`;

        // Log caption, then the rows: each row's cell fades up in place while its text slides in from
        // the right, so the list card builds top-down.
        rise(capLog, ease.glide(prog(p, 0.5, 0.62)), 10);
        const dip = Math.sin(Math.PI * clamp(press));
        rows.forEach((r, i) => {
          const q = ease.glide(prog(p, 0.55 + i * 0.045, 0.73 + i * 0.045));
          r.el.style.opacity = Math.min(1, q * 1.6).toFixed(4);
          r.inner.style.opacity = q.toFixed(4);
          r.inner.style.transform = q >= 1 ? "none" : `translateX(${((1 - q) * 24).toFixed(2)}px)`;
          if (i === 0) r.el.style.backgroundColor = dip > 0.001 ? `rgb(${[255, 255, 255].map((c) => Math.round(c - dip * 18)).join(", ")})` : "";
        });
      },
    };
  };
})();
