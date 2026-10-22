/* segments: intelli8.ai's "Segmental body mapping" row on cream. The dark rounded card (598 × 520) holds
 * the front-view figure: a grey head, the deeper green trunk, mint-to-green arms and legs, the faint floor
 * ellipse, five white-ringed contact dots and thin leader lines out to the five segment labels, with the
 * front-view footnote. The copy column sits at its right: "Eight electrodes. / Five body segments."
 *
 *   p 0.00-0.20  the card's content fades up dim: glow, floor, figure and dots at ~35 % light, no labels
 *   p 0.00-0.18  eyebrow;  0.02-0.30  headline lines rise out of their masks (0.06 apart)
 *   p 0.20-0.38  paragraph, line by line;  0.30-0.42  fine print
 *   p 0.22-0.85  the five segments light in order: right arm, left arm, trunk, right leg, left leg
 *                (each window 0.19 long, starting 0.11 apart). In each: the segment brightens to full
 *                colour with a brief halo and flash, its contact dot swells and sends one ring outward,
 *                its leader line draws from the dot to the label, then the label title and lines enter.
 *                The head, floor ellipse and background glow brighten with the segments.
 *   p 0.82-0.95  footnote
 *
 * opts.seg    -1..4 (default -1): emphasise one segment for a close-up (0 right arm, 1 left arm,
 *             2 trunk, 3 right leg, 4 left leg): the others (shape, dot, line, label) and the head dim to
 *             ~45 %, the chosen one keeps a soft halo.
 * opts.focus  0-1 (default 1 when seg is set): eases that emphasis in (E.inOut).
 *
 * anchors (card px): card, figure, seg0..seg4 (each segment's shape), label0..label4 (title + lines),
 * plus dot0..dot4, head, footnote, eyebrow, headline, para, fine, copy.
 */
(() => {
  // ---------- geometry, in card px (the SVG's viewBox is the dark card, 1:1) ----------
  const CARD = { x: 0, y: 0, w: 598, h: 520 };
  const MID = 299;
  const HEAD = { cx: 299, cy: 90.3, r: 22 };
  const FLOOR = { cx: 299, cy: 415.4, rx: 65.3, ry: 7.9 };

  // Paths as command lists so the left side can be mirrored about the figure's centre line.
  const R_ARM = [
    ["M", 260.6, 134.1],
    ["L", 267.4, 162.5],
    ["L", 250.3, 242.5],
    ["A", 11, 11, 0, 0, 1, 228.8, 238.5],
    ["L", 243.2, 150],
    ["C", 244.1, 140.8, 247.5, 134.6, 253.6, 134.1],
    ["Z"],
  ];
  const R_LEG = [
    ["M", 269.4, 254.5],
    ["L", 296.0, 259.4],
    ["L", 291.6, 325],
    ["L", 289.7, 388],
    ["C", 289.6, 400.5, 286.4, 407, 279, 407],
    ["L", 267.5, 407],
    ["C", 263.5, 407, 261.6, 405.5, 261.5, 402],
    ["L", 261.5, 399],
    ["C", 261.5, 396.5, 262.2, 394.5, 263.0, 392.5],
    ["L", 268.4, 322],
    ["Z"],
  ];
  const TRUNK = [
    ["M", 264.6, 134],
    ["L", 278.8, 123.9],
    ["A", 58, 58, 0, 0, 1, 319.2, 123.9],
    ["L", 333.4, 134],
    ["L", 326, 205],
    ["L", 329, 243],
    ["A", 80, 80, 0, 0, 1, 269, 243],
    ["L", 272, 205],
    ["Z"],
  ];
  const mirror = (cmds) =>
    cmds.map(([k, ...v]) => {
      if (k === "A") return [k, v[0], v[1], v[2], v[3], 1 - v[4], 2 * MID - v[5], v[6]];
      return [k, ...v.map((n, i) => (i % 2 === 0 ? 2 * MID - n : n))];
    });
  const pathD = (cmds) => cmds.map(([k, ...v]) => k + v.map((n) => +n.toFixed(2)).join(" ")).join(" ");

  // In the order they light. side: which label column (L = left, R = right).
  const SEGS = [
    { key: "rarm", name: "Right arm", cmds: R_ARM, kind: "limb", side: "L", dot: [244, 179.9],
      line: [[244, 179.9], [216.6, 179.9], [200.0, 158], [182.5, 158]],
      lines: ["Muscle and fat", "estimates for your", "right arm."], top: 133 },
    { key: "larm", name: "Left arm", cmds: mirror(R_ARM), kind: "limb", side: "R", dot: [354, 179.9],
      line: [[354, 179.9], [381.4, 179.9], [398.0, 158], [415.5, 158]],
      lines: ["Muscle and fat", "estimates for your left", "arm."], top: 133 },
    { key: "trunk", name: "Trunk", cmds: TRUNK, kind: "trunk", side: "R", dot: [310.8, 227.8],
      line: [[310.8, 227.7], [380.7, 227.7], [398.2, 254.5], [415.5, 254.5]],
      lines: ["Muscle and fat", "estimates for your", "torso."], top: 234.5 },
    { key: "rleg", name: "Right leg", cmds: R_LEG, kind: "limb", side: "L", dot: [280.1, 348],
      line: [[280.1, 348], [232.4, 348], [213.1, 370.85], [182.5, 370.85]],
      lines: ["Muscle and fat", "estimates for your", "right leg."], top: 349.25 },
    { key: "lleg", name: "Left leg", cmds: mirror(R_LEG), kind: "limb", side: "R", dot: [317.9, 348],
      line: [[317.9, 348], [366.1, 348], [385.4, 370.85], [415.5, 370.85]],
      lines: ["Muscle and fat", "estimates for your left", "leg."], top: 349.25 },
  ];
  const LBL_X = { L: 40.5, R: 409 };
  const LBL_H = 24 + 6.3 + 3 * 21; // title line + gap + three 21 px lines (segments.css)
  const polyLen = (pts) => pts.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]), 0);

  // Bounding box of a command list (control points included: the shapes' curves stay inside them).
  function cmdBox(cmds, pad = 0.5) {
    const xs = [], ys = [];
    for (const [k, ...v] of cmds) {
      if (k === "Z") continue;
      if (k === "A") {
        xs.push(v[5]); ys.push(v[6]);
        continue;
      }
      for (let i = 0; i < v.length; i += 2) { xs.push(v[i]); ys.push(v[i + 1]); }
    }
    return { xs, ys, pad };
  }

  // Timeline constants
  const SEG_T0 = 0.22, SEG_STEP = 0.11, SEG_DUR = 0.19;
  const DIM = 0.35; // light of an unlit segment
  const FOCUS_DIM = 0.45; // light of the others when one segment is emphasised

  let instances = 0;

  I8.cards.segments = {
    size: [1098, 520],
    bg: "cream",
    build(root, c) {
      const { clamp, lerp, prog, E, rise, enter } = c;
      root.classList.add("card-segments");
      const uid = `sg${++instances}`;

      const shapeFill = (s) => (s.kind === "trunk" ? "" : `fill="url(#${uid}-limb)"`);
      const svg = `
        <svg class="sg-svg" viewBox="0 0 598 520" width="598" height="520" aria-hidden="true">
          <defs>
            <linearGradient id="${uid}-limb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#bfe1d0"/>
              <stop offset="1" stop-color="#7cad95"/>
            </linearGradient>
            <filter id="${uid}-halo" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7"/>
            </filter>
          </defs>
          <ellipse class="sg-floor" cx="${FLOOR.cx}" cy="${FLOOR.cy}" rx="${FLOOR.rx}" ry="${FLOOR.ry}"/>
          <g class="sg-lines">
            ${SEGS.map((s) => `<path class="sg-line" d="M${s.line.map((q) => q.join(" ")).join(" L")}"/>`).join("")}
          </g>
          <g class="sg-halos">
            ${SEGS.map((s) => `<path class="sg-halo" d="${pathD(s.cmds)}" filter="url(#${uid}-halo)"/>`).join("")}
          </g>
          <circle class="sg-head" cx="${HEAD.cx}" cy="${HEAD.cy}" r="${HEAD.r}"/>
          <circle class="sg-shade sg-head-shade" cx="${HEAD.cx}" cy="${HEAD.cy}" r="${HEAD.r}"/>
          ${[0, 1, 3, 4, 2]
            .map((i) => {
              const s = SEGS[i], d = pathD(s.cmds);
              return `<g class="sg-seg" data-i="${i}">
                <path class="${s.kind === "trunk" ? "sg-trunk" : "sg-limb"}" d="${d}" ${shapeFill(s)}/>
                <path class="sg-flash" d="${d}"/>
                <path class="sg-shade" d="${d}"/>
              </g>`;
            })
            .join("")}
          ${SEGS.map(
            (s) => `<g class="sg-dotg">
              <circle class="sg-ring" cx="${s.dot[0]}" cy="${s.dot[1]}" r="5"/>
              <circle class="sg-dot" cx="${s.dot[0]}" cy="${s.dot[1]}" r="4"/>
            </g>`
          ).join("")}
        </svg>`;

      root.innerHTML = `
        <div class="sg-card">
          <div class="sg-content">
            <div class="sg-glow"></div>
            ${svg}
            ${SEGS.map(
              (s, i) => `<div class="sg-lbl sg-lbl-${s.side}" data-i="${i}" style="left:${LBL_X[s.side]}px;top:${s.top}px">
                <b>${s.name}</b>${s.lines.map((t) => `<span>${t}</span>`).join("")}
              </div>`
            ).join("")}
            <p class="sg-foot">Front view: your right side appears on the left of the diagram.</p>
          </div>
        </div>

        <div class="eyebrow sg-eye">Segmental body mapping</div>
        <h2 class="hl sg-hl">
          <span class="mask"><span class="line">Eight electrodes.</span></span>
          <span class="mask"><span class="line">Five body segments.</span></span>
        </h2>
        <p class="sg-para">
          <span>A four-electrode design takes a feet-to-feet reading. intelli8</span>
          <span>adds hand contacts, capturing impedance across both arms,</span>
          <span>the trunk and both legs to estimate muscle and fat</span>
          <span>distribution in each region.</span>
        </p>
        <p class="sg-fine">
          <span>Multi-frequency BIA supports a segmental report. Readings are informational</span>
          <span>estimates, not diagnostic measurements.</span>
        </p>
      `;

      const $ = (s) => root.querySelector(s);
      const $$ = (s) => Array.from(root.querySelectorAll(s));
      const segG = [];
      $$(".sg-seg").forEach((g) => (segG[+g.dataset.i] = g));
      const el = {
        content: $(".sg-content"),
        glow: $(".sg-glow"),
        svg: $(".sg-svg"),
        floor: $(".sg-floor"),
        head: $(".sg-head"),
        headShade: $(".sg-head-shade"),
        lines: $$(".sg-line"),
        halos: $$(".sg-halo"),
        flash: segG.map((g) => g.querySelector(".sg-flash")),
        shade: segG.map((g) => g.querySelector(".sg-shade")),
        dotG: $$(".sg-dotg"),
        dots: $$(".sg-dot"),
        rings: $$(".sg-ring"),
        lbl: $$(".sg-lbl"),
        lblT: $$(".sg-lbl").map((n) => n.querySelector("b")),
        lblL: $$(".sg-lbl").map((n) => Array.from(n.querySelectorAll("span"))),
        foot: $(".sg-foot"),
        eye: $(".sg-eye"),
        hl: $(".sg-hl"),
        hlLines: $$(".sg-hl .line"),
        para: $$(".sg-para > span"),
        fine: $$(".sg-fine > span"),
      };
      const lineLen = SEGS.map((s) => polyLen(s.line));

      // ---------- anchors ----------
      const r2 = (r) => ({ x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.w.toFixed(2), h: +r.h.toFixed(2) });
      const union = (...rs) => {
        const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
        const x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
        return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      };
      // A shape's box: the SVG's own bbox when laid out, else its command points (+ half the stroke).
      const segPaths = segG.map((g) => g.querySelector("path"));
      const shapeBox = (i) => {
        let b = null;
        try {
          const bb = segPaths[i].getBBox();
          if (bb.width > 0) b = { x: bb.x - 0.5, y: bb.y - 0.5, w: bb.width + 1, h: bb.height + 1 };
        } catch (e) { /* not rendered */ }
        if (b) return b;
        const { xs, ys, pad } = cmdBox(SEGS[i].cmds);
        // Arcs bulge past their end points: the arm caps (r 11) and the trunk's top and bottom.
        const extra = SEGS[i].kind === "trunk" ? [[0, 119.5], [0, 249.6]] : SEGS[i].key.endsWith("arm") ? [[0, 251.8]] : [];
        for (const [, y] of extra) ys.push(y);
        const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
        return { x: x0, y: y0, w: Math.max(...xs) + pad - x0, h: Math.max(...ys) + pad - y0 };
      };
      // HTML boxes in card px (the dark card sits at the card origin).
      const rect = (n, fb) =>
        n && n.offsetWidth ? { x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight } : fb;
      const anchors = { card: { ...CARD } };
      const segBoxes = SEGS.map((s, i) => r2(shapeBox(i)));
      const headBox = { x: HEAD.cx - HEAD.r, y: HEAD.cy - HEAD.r, w: 2 * HEAD.r, h: 2 * HEAD.r };
      const floorBox = { x: FLOOR.cx - FLOOR.rx - 0.5, y: FLOOR.cy - FLOOR.ry - 0.5, w: 2 * FLOOR.rx + 1, h: 2 * FLOOR.ry + 1 };
      anchors.figure = r2(union(headBox, floorBox, ...segBoxes));
      anchors.head = r2(headBox);
      SEGS.forEach((s, i) => {
        anchors[`seg${i}`] = segBoxes[i];
        // Labels: their CSS position (offset* would round it), laid-out height when available.
        anchors[`label${i}`] = r2({ x: LBL_X[s.side], y: s.top, w: 148.5, h: LBL_H });
        anchors[`dot${i}`] = r2({ x: s.dot[0] - 5.2, y: s.dot[1] - 5.2, w: 10.4, h: 10.4 });
      });
      anchors.footnote = r2(rect(el.foot, { x: 0, y: 461, w: 598, h: 18 }));
      anchors.eyebrow = r2(rect(el.eye, { x: 638, y: 104, w: 160, h: 14 }));
      anchors.headline = r2(rect(el.hl, { x: 638, y: 131, w: 420, h: 99 }));
      anchors.para = r2(rect($(".sg-para"), { x: 638, y: 253, w: 450, h: 112 }));
      anchors.fine = r2(rect($(".sg-fine"), { x: 638, y: 380, w: 430, h: 40 }));
      anchors.copy = r2(union(anchors.eyebrow, anchors.headline, anchors.para, anchors.fine));

      const f4 = (n) => n.toFixed(4);
      const bell = (k) => Math.sin(Math.PI * clamp(k)) ** 2;

      function seek(p, opts = {}) {
        p = clamp(+p || 0);
        const seg = opts.seg === undefined || opts.seg === null || opts.seg === "" ? -1 : Math.round(+opts.seg);
        const hasSeg = seg >= 0 && seg <= 4;
        const focus = hasSeg ? E.inOut(clamp(opts.focus === undefined || opts.focus === "" ? 1 : +opts.focus || 0)) : 0;

        // ---------- the card's content fades up dim ----------
        const up = E.out(prog(p, 0, 0.2));
        el.content.style.opacity = f4(up);
        el.svg.style.transform = `translateY(${((1 - E.glide(prog(p, 0, 0.24))) * 10).toFixed(2)}px)`;

        // ---------- segments ----------
        let litSum = 0;
        SEGS.forEach((s, i) => {
          const a = SEG_T0 + SEG_STEP * i;
          const t = (p - a) / SEG_DUR; // local 0..1
          const g = (x) => a + SEG_DUR * x; // local → global p
          const lit = E.inOut(prog(t, 0, 0.32));
          litSum += lit;
          const others = hasSeg && i !== seg ? lerp(1, FOCUS_DIM, focus) : 1;
          const light = lerp(DIM, 1, lit) * others;

          el.shade[i].style.opacity = f4(1 - light);
          el.flash[i].style.opacity = f4(0.2 * bell(prog(t, 0.04, 0.62)) * others);
          const selHalo = hasSeg && i === seg ? 0.28 * focus : 0;
          el.halos[i].style.opacity = f4(Math.max(0.5 * bell(prog(t, 0.04, 0.8)), selHalo));

          // Contact dot: dim with its segment, swells as it lights and sends one ring outward.
          const dk = E.inOut(prog(t, 0.04, 0.26));
          const swell = 1 + 0.28 * bell(prog(t, 0.06, 0.42));
          el.dotG[i].style.opacity = f4(lerp(0.45, 1, dk) * others);
          el.dots[i].setAttribute("r", (4 * swell).toFixed(3));
          const rk = prog(t, 0.12, 0.66);
          el.rings[i].setAttribute("r", lerp(5, 17, E.out(rk)).toFixed(3));
          el.rings[i].style.opacity = f4(rk > 0 && rk < 1 ? 0.85 * (1 - rk) ** 1.6 * Math.min(1, rk * 8) : 0);

          // Leader line: from the dot out to the label.
          const lk = E.inOut(prog(t, 0.22, 0.62));
          el.lines[i].style.strokeDasharray = `${lineLen[i].toFixed(2)} ${(lineLen[i] + 2).toFixed(2)}`;
          el.lines[i].style.strokeDashoffset = (lineLen[i] * (1 - lk)).toFixed(2);
          el.lines[i].style.opacity = f4(lk > 0 ? others : 0);

          // Label: title, then its lines.
          enter(el.lblT[i], p, g(0.48), g(0.88), 8);
          el.lblL[i].forEach((ln, j) => enter(ln, p, g(0.56 + 0.05 * j), g(0.9 + 0.05 * j), 8));
          el.lbl[i].style.opacity = f4(others);
        });
        const litFrac = litSum / SEGS.length;

        // Head, floor and glow brighten with the figure.
        const rest = hasSeg ? lerp(1, FOCUS_DIM + 0.1, focus) : 1;
        const headLight = lerp(DIM, 1, litFrac) * rest;
        el.headShade.style.opacity = f4(1 - headLight);
        el.head.style.opacity = "1";
        el.floor.style.opacity = f4(lerp(0.5, 1, litFrac) * rest);
        el.glow.style.opacity = f4(lerp(0.55, 1, litFrac) * lerp(1, 0.8, focus));

        // ---------- footnote ----------
        enter(el.foot, p, 0.82, 0.95, 8);

        // ---------- copy column ----------
        enter(el.eye, p, 0, 0.18, 10);
        el.hlLines.forEach((ln, i) => rise(ln, p, 0.02 + 0.06 * i, 0.24 + 0.06 * i));
        el.para.forEach((ln, i) => enter(ln, p, 0.2 + 0.025 * i, 0.305 + 0.025 * i, 12));
        el.fine.forEach((ln, i) => enter(ln, p, 0.3 + 0.02 * i, 0.4 + 0.02 * i, 10));
      }

      return { seek, anchors };
    },
  };
})();
