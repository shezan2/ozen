/* Dashboard tab: date + greeting, the weight / body-fat / muscle trend tiles, the other measurements,
 * View full report and the last-measured footer.
 *
 * seek(p, { press = 0 }):
 *   0.00–0.25  date, greeting and avatar rise in
 *   0.10–0.45  tiles fade/rise in, staggered (weight, body fat, muscle)
 *   0.15–0.55  tile numbers settle from last week's value to today's (72.50→72.40, 18.4→18.2, 58.0→58.1)
 *   0.30–0.75  sparklines draw left to right (area follows the line, end dot pops last)
 *   0.43–0.85  list card fades in (0.43–0.60); its rows slide in from the right, staggered (0.45–0.84)
 *   0.75–1.00  View full report, then the footer
 *   press (0..1) dips View full report for a tap (deepest at press = 0.5).
 */
(() => {
  let uid = 0;

  // Smooth sparkline (Catmull-Rom → cubic Bézier) through normalised points (y: 0 = top, 1 = bottom).
  function smooth(ys, w, h) {
    const pts = ys.map((y, i) => [(i / (ys.length - 1)) * w, y * h]);
    let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1.map((v) => v.toFixed(2)).join(" ")} ${c2.map((v) => v.toFixed(2)).join(" ")} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return { d, end: pts[pts.length - 1] };
  }

  const TRI_DOWN = `<svg viewBox="0 0 6 6"><path d="M0 .6h6L3 5.6z"/></svg>`;
  const TRI_UP = `<svg viewBox="0 0 6 6"><path d="M0 5.4h6L3 .4z"/></svg>`;
  const INFO = `<svg viewBox="0 0 18 18" fill="none" stroke="#8f8e93" stroke-width="1.15"><circle cx="9" cy="9" r="8.1"/><path d="M9 7.6v5.6" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="5.1" r=".95" fill="#8f8e93" stroke="none"/></svg>`;

  // Tiles. Sparkline shapes (y: 0 = top of the plot, 1 = bottom) traced from the app screen, newest at right.
  const TILES = [
    { k: "weight", label: "Weight", from: 72.5, to: 72.4, dp: 2, unit: "kg", delta: "0.10 kg", up: false, vs: true,
      w: 70, h: 29.4, ys: [0, 0.126, 0.255, 0.384, 0.504, 0.578, 0.674, 0.748, 0.823, 0.878, 0.912, 0.948, 1], t: 0.1, draw: 0.3 },
    { k: "fat", label: "Body Fat", from: 18.4, to: 18.2, dp: 1, unit: "%", delta: "0.2%", up: false,
      w: 51, h: 23, ys: [0, 0.091, 0.187, 0.298, 0.427, 0.526, 0.616, 0.686, 0.739, 0.813, 0.873, 0.941, 1], t: 0.16, draw: 0.375 },
    { k: "muscle", label: "Muscle", from: 58.0, to: 58.1, dp: 1, unit: "kg", delta: "0.1 kg", up: true,
      w: 51, h: 22.6, ys: [1, 0.895, 0.779, 0.725, 0.646, 0.544, 0.436, 0.382, 0.317, 0.198, 0.099, 0.03, 0], t: 0.22, draw: 0.45 },
  ];

  const ROWS = [
    ["BMI", "22.8"],
    ["Visceral Fat", "7"],
    ["Body Water", "60.1%"],
    ["Bone Mass", "4.0 kg"],
  ];

  I8.screens.dashboard = (root, h) => {
    root.classList.add("scr-dashboard");
    const id = `dash${++uid}`;

    const tileHTML = (t) => {
      const s = smooth(t.ys, t.w, t.h);
      const area = `${s.d} L${t.w} ${t.h} L0 ${t.h} Z`;
      return `<div class="tile t-${t.k}">
        <div class="caps">${t.label}</div>
        <div class="val"><span class="num">${h.fmt(t.to, t.dp)}</span><span class="unit">${t.unit}</span></div>
        <div class="delta">${t.up ? TRI_UP : TRI_DOWN}<span>${t.delta}</span></div>
        ${t.vs ? `<div class="vs">vs. last week</div>` : ""}
        <svg class="spark k-${t.k}" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}">
          <defs><clipPath id="${id}-${t.k}"><rect x="-4" y="-4" width="0" height="${t.h + 8}"/></clipPath></defs>
          <path class="area" d="${area}" clip-path="url(#${id}-${t.k})"/>
          <path class="line" d="${s.d}"/>
          <circle class="dot" cx="${s.end[0]}" cy="${s.end[1]}" r="0"/>
        </svg>
      </div>`;
    };

    root.innerHTML =
      h.status() +
      `<div class="date">Thursday, September 24</div>
       <div class="hello">Good evening, Alex.</div>
       <div class="avatar">A</div>
       ${TILES.map(tileHTML).join("")}
       <div class="card list">${ROWS.map(
         ([l, v]) => `<div class="row"><span>${l}</span><span class="v">${v}</span><span class="tag">Normal</span></div>`
       ).join("")}</div>
       <div class="btn primary report">View full report</div>
       <div class="foot"><span>Last measured today at 6:08 PM</span>${INFO}</div>` +
      h.tabs("dashboard") +
      h.home();

    const $ = (s) => root.querySelector(s);
    const head = [$(".date"), $(".hello"), $(".avatar")];
    const tiles = TILES.map((t) => {
      const el = $(`.t-${t.k}`);
      const line = el.querySelector(".line");
      const len = line.getTotalLength();
      // x along the line at each drawn fraction, so the area reveal tracks the pen.
      const xs = Array.from({ length: 41 }, (_, i) => line.getPointAtLength((len * i) / 40).x);
      return {
        t,
        el,
        line,
        area: el.querySelector(".area"),
        num: el.querySelector(".num"),
        draw: h.drawable(line),
        clip: el.querySelector("clipPath rect"),
        dot: el.querySelector(".dot"),
        xs,
      };
    });
    const list = $(".list");
    const rows = [...list.querySelectorAll(".row")];
    const btn = $(".report");
    const foot = $(".foot");

    const rise = (el, q, dy) => {
      el.style.opacity = q.toFixed(4);
      el.style.transform = q >= 1 ? "none" : `translateY(${((1 - q) * dy).toFixed(2)}px)`;
    };

    return {
      seek(p, { press = 0 } = {}) {
        const { prog, ease, clamp, lerp, fmt } = h;

        // Header: date, greeting, avatar rise in.
        head.forEach((el, i) => rise(el, ease.glide(prog(p, i * 0.03, 0.19 + i * 0.03)), 12));

        for (const T of tiles) {
          const { t } = T;
          // Tile fades / rises in.
          const qt = ease.glide(prog(p, t.t, t.t + 0.23));
          T.el.style.opacity = qt.toFixed(4);
          T.el.style.transform = qt >= 1 ? "none" : `translateY(${((1 - qt) * 16).toFixed(2)}px) scale(${(0.97 + 0.03 * qt).toFixed(4)})`;
          // Number settles from last week's value.
          const qn = ease.inOut(prog(p, t.t + 0.05, t.t + 0.33));
          T.num.textContent = fmt(lerp(t.from, t.to, qn), t.dp);
          // Sparkline draws in; the area follows the pen; the end dot pops.
          const qd = ease.inOut(prog(p, t.draw, t.draw + 0.3));
          T.draw(qd);
          // A zero-length dash still paints its round cap, so keep the pen hidden until it moves.
          T.line.style.visibility = qd > 0 ? "visible" : "hidden";
          T.area.style.opacity = prog(qd, 0, 0.3).toFixed(4);
          const f = qd * 40, i0 = Math.floor(f), i1 = Math.min(40, i0 + 1);
          const x = lerp(T.xs[i0], T.xs[i1], f - i0);
          T.clip.setAttribute("width", qd <= 0 ? "0" : (x + 4).toFixed(2));
          const qdot = prog(p, t.draw + 0.24, t.draw + 0.3);
          const pop = qdot <= 0 ? 0 : 1 + 0.35 * Math.sin(Math.PI * qdot);
          T.dot.setAttribute("r", (1.8 * Math.min(1, qdot * 1.6) * pop).toFixed(3));
        }

        // List card, then its rows slide in.
        const qc = ease.glide(prog(p, 0.43, 0.6));
        rise(list, qc, 14);
        rows.forEach((r, i) => {
          const q = ease.glide(prog(p, 0.45 + i * 0.065, 0.64 + i * 0.065));
          r.style.opacity = q.toFixed(4);
          r.style.transform = q >= 1 ? "none" : `translateX(${((1 - q) * 22).toFixed(2)}px)`;
        });

        // View full report (with tap dip), then the footer.
        const qb = ease.glide(prog(p, 0.75, 0.93));
        const dip = Math.sin(Math.PI * clamp(press));
        btn.style.opacity = qb.toFixed(4);
        btn.style.transform = `translateY(${((1 - qb) * 16).toFixed(2)}px) scale(${(1 - dip * 0.03).toFixed(4)})`;
        btn.style.filter = dip > 0.001 ? `brightness(${(1 - dip * 0.12).toFixed(4)})` : "none";
        rise(foot, ease.glide(prog(p, 0.82, 1)), 10);
      },
    };
  };
})();
