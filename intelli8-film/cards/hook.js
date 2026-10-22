/* hook: the film's opening (about 4 s). "One number. Two stories."
 *
 *   p 0.00-0.30  the weight-only display wakes (segment test, 0.0) and rolls through readings to 72.4
 *   p 0.30-0.42  the reading blinks twice and locks
 *   p 0.00-0.18  eyebrow         p 0.04-0.30  headline line 1 rises
 *   p 0.40-0.62  story cards slide out from behind the display (A from 0.40 down-left, B from 0.42
 *                down-right; E.sheet, slight counter-rotation and 0.9 -> 1 scale)
 *   p 0.46-0.70  headline line 2  p 0.50-0.67  card rules draw   p 0.55-0.80  bars grow, values count
 *   p 0.60-0.80  lede            p 0.80-0.92  fine print
 *
 * opts: fine (default 1; 0 hides "Illustrative example.").
 */
(() => {
  const LCD = { x: 640, y: 108, w: 440, h: 170, pad: 14 };
  const CARD = { w: 210, h: 176, y: 300, ax: 640, bx: 870 };
  const COPY = { x: 0, y: 168 };

  /* ---------- seven-segment digits (face coordinates) ---------- */
  const DW = 57, DH = 102, T = 13, G = 1.7, SKEW = -6;
  const DP = 19; // the gap the decimal point sits in
  const DIGITS_X = [0, DW + 13, DW + 13 + DW + DP]; // tens, ones, tenths
  const FACE_W = LCD.w - 2 * LCD.pad, FACE_H = LCD.h - 2 * LCD.pad;
  const GROUP_W = DIGITS_X[2] + DW + 14 + 26;
  const GX = Math.round((FACE_W - GROUP_W) / 2) - 4;
  const GY = Math.round((FACE_H - DH) / 2);
  const f = (n) => +n.toFixed(2);
  function hseg(yc, x0, x1) {
    const h = T / 2;
    return [[x0, yc], [x0 + h, yc - h], [x1 - h, yc - h], [x1, yc], [x1 - h, yc + h], [x0 + h, yc + h]];
  }
  function vseg(xc, y0, y1) {
    const h = T / 2;
    return [[xc, y0], [xc + h, y0 + h], [xc + h, y1 - h], [xc, y1], [xc - h, y1 - h], [xc - h, y0 + h]];
  }
  const SEGS = {
    a: hseg(T / 2, T / 2 + G, DW - T / 2 - G),
    b: vseg(DW - T / 2, T / 2 + G, DH / 2 - G),
    c: vseg(DW - T / 2, DH / 2 + G, DH - T / 2 - G),
    d: hseg(DH - T / 2, T / 2 + G, DW - T / 2 - G),
    e: vseg(T / 2, DH / 2 + G, DH - T / 2 - G),
    f: vseg(T / 2, T / 2 + G, DH / 2 - G),
    g: hseg(DH / 2, T / 2 + G, DW - T / 2 - G),
  };
  const MAP = {
    " ": "", 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg",
    5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg",
  };
  const pts = (list, dx) => list.map(([x, y]) => `${f(x + dx)},${f(y)}`).join(" ");

  // The scale settling: a fixed sequence of readings (tens, ones, tenths) by p.
  const ROLL = [
    [0.0, null], // asleep
    [0.026, "888"], // segment test
    [0.066, " 00"],
    [0.11, " 86"],
    [0.123, "239"],
    [0.135, "462"],
    [0.147, "637"],
    [0.159, "718"],
    [0.172, "751"],
    [0.186, "736"],
    [0.201, "719"],
    [0.217, "729"],
    [0.233, "722"],
    [0.249, "726"],
    [0.265, "723"],
    [0.281, "724"],
  ];
  const reading = (p) => {
    let r = null;
    for (const [t, v] of ROLL) if (p >= t) r = v;
    return r;
  };
  // Two blinks, then locked.
  const blinkOff = (p) => (p >= 0.3 && p < 0.33) || (p >= 0.36 && p < 0.39);

  const STORIES = {
    a: { tag: "Story A", title: "Fat down, muscle up", rows: [["Fat", "▼", 1.2], ["Muscle", "▲", 1.1]] },
    b: { tag: "Story B", title: "Muscle down, fat up", rows: [["Fat", "▲", 0.8], ["Muscle", "▼", 0.9]] },
  };
  const BAR_MAX = 1.4; // kg at full track

  // Direction marks drawn as SVG (the brand fonts have no triangles).
  const tri = (dir) =>
    `<svg class="hk-ar" viewBox="0 0 8 7" width="8" height="7" aria-label="${dir === "▲" ? "up" : "down"}"><path d="${
      dir === "▲" ? "M0 7H8L4 0Z" : "M0 0H8L4 7Z"
    }"/></svg>`;

  function storyHTML(k) {
    const s = STORIES[k];
    const rows = s.rows
      .map(
        ([label, arrow, v]) => `
        <div class="hk-row">
          <div class="hk-rl"><span>${label}</span><b>${tri(arrow)}<span class="hk-v">${v.toFixed(1)}</span> kg</b></div>
          <div class="hk-track"><div class="hk-fill" style="width:${((v / BAR_MAX) * 100).toFixed(2)}%"></div></div>
        </div>`,
      )
      .join("");
    return `
      <div class="hk-story ${k}">
        <div class="hk-tag"><i></i>${s.tag}</div>
        <div class="hk-title">${s.title}</div>
        <div class="hk-rows">${rows}</div>
        <div class="hk-rule"></div>
        <div class="hk-foot"><span>Weight</span><b>72.4 kg</b></div>
      </div>`;
  }

  function digitsSVG() {
    let s = "";
    DIGITS_X.forEach((dx, i) => {
      for (const k of "abcdefg") s += `<polygon class="seg" data-d="${i}" data-s="${k}" points="${pts(SEGS[k], dx)}"/>`;
    });
    const dpx = DIGITS_X[1] + DW + (DP - T) / 2 - 1;
    s += `<rect class="seg dp" x="${f(dpx)}" y="${f(DH - T)}" width="${T}" height="${T}" rx="1.5"/>`;
    const ux = DIGITS_X[2] + DW + 14;
    s += `<text class="unit" x="${ux}" y="${DH - 1}">kg</text>`;
    return `<svg width="${FACE_W}" height="${FACE_H}" viewBox="0 0 ${FACE_W} ${FACE_H}" aria-label="72.4 kg">
      <g transform="translate(${GX} ${GY + DH}) skewX(${SKEW}) translate(0 ${-DH})">${s}</g></svg>`;
  }

  I8.cards.hook = {
    size: [1100, 620],
    bg: "cream",
    build(root, c) {
      const { E, prog, clamp, lerp } = c;
      root.classList.add("card-hook");
      root.innerHTML = `
        <div class="hk-copy">
          <div class="eyebrow hk-eye">Weight-only scale</div>
          <div class="hl hk-hl">
            <span class="mask"><span class="line">One number.</span></span>
            <span class="mask"><span class="line accent">Two stories.</span></span>
          </div>
          <p class="lede hk-lede">If you lose fat and gain muscle,<br />the number may barely move.</p>
        </div>
        ${storyHTML("a")}
        ${storyHTML("b")}
        <div class="hk-lcd"><div class="hk-face">${digitsSVG()}<div class="hk-shade"></div><div class="hk-glass"></div></div></div>
        <div class="fine hk-fine">Illustrative example.</div>`;

      const q = (s) => root.querySelector(s);
      const eye = q(".hk-eye"), hl = q(".hk-hl"), lede = q(".hk-lede"), fine = q(".hk-fine");
      const lines = Array.from(root.querySelectorAll(".hk-hl .line"));
      const lcd = q(".hk-lcd"), shade = q(".hk-shade");
      const segs = Array.from(root.querySelectorAll(".hk-face polygon.seg")).map((el) => ({
        el, d: +el.dataset.d, s: el.dataset.s,
      }));
      const dp = q(".hk-face .dp"), unit = q(".hk-face .unit");
      const cards = ["a", "b"].map((k) => {
        const el = q(`.hk-story.${k}`);
        return {
          k, el,
          rule: el.querySelector(".hk-rule"),
          fills: Array.from(el.querySelectorAll(".hk-fill")),
          vals: Array.from(el.querySelectorAll(".hk-v")),
          rl: Array.from(el.querySelectorAll(".hk-rl b")),
        };
      });

      // Anchors (card px), from layout.
      const cardX = { a: CARD.ax, b: CARD.bx };
      const hlTop = COPY.y + (hl.offsetTop || 35);
      const anchors = {
        lcd: { x: LCD.x, y: LCD.y, w: LCD.w, h: LCD.h },
        storyA: { x: CARD.ax, y: CARD.y, w: CARD.w, h: CARD.h },
        storyB: { x: CARD.bx, y: CARD.y, w: CARD.w, h: CARD.h },
        headline: { x: COPY.x, y: hlTop, w: hl.offsetWidth || 400, h: hl.offsetHeight || Math.round(66 * 0.98 * 2) },
      };

      const GHOST_ON = 0.038, GHOST_OFF = 0.02;

      function seek(p, opts = {}) {
        p = clamp(+p || 0);
        const fineOn = opts.fine === undefined ? 1 : clamp(+opts.fine);

        /* copy */
        c.enter(eye, p, 0.0, 0.18, 12);
        c.rise(lines[0], p, 0.04, 0.3);
        c.rise(lines[1], p, 0.46, 0.7);
        c.enter(lede, p, 0.6, 0.8, 16);
        c.enter(fine, p, 0.8, 0.92, 8);
        fine.style.opacity = (E.glide(prog(p, 0.8, 0.92)) * fineOn).toFixed(4);

        /* display: wake, roll, blink, lock */
        const wake = E.out(prog(p, 0.008, 0.06));
        shade.style.opacity = (1 - wake).toFixed(4);
        shade.style.display = wake >= 1 ? "none" : "block";
        const r = reading(p);
        const lit = r !== null && !blinkOff(p);
        const ghost = lerp(GHOST_OFF, GHOST_ON, wake);
        for (const g of segs) {
          const on = lit && MAP[r[g.d]].includes(g.s);
          g.el.style.opacity = (on ? 0.94 : ghost).toFixed(4);
        }
        dp.style.opacity = (lit ? 0.94 : ghost).toFixed(4);
        unit.style.opacity = (r !== null ? 0.94 : ghost).toFixed(4);
        lcd.style.transform = "none";

        /* story cards slide out from behind the display */
        const lcdCx = LCD.x + LCD.w / 2;
        const startTop = LCD.y + (LCD.h - CARD.h * 0.9) / 2 + 2;
        cards.forEach((cd, i) => {
          const t0 = 0.4 + i * 0.02;
          const k = E.sheet(prog(p, t0, 0.62));
          const dx = lcdCx - (cardX[cd.k] + CARD.w / 2);
          const dy = startTop - CARD.y;
          const rot = (i === 0 ? -1 : 1) * 2.4 * (1 - k);
          const s = lerp(0.9, 1, k);
          cd.el.style.transform =
            `translate(${((1 - k) * dx).toFixed(2)}px, ${((1 - k) * dy).toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(4)})`;
          cd.el.style.opacity = prog(p, t0, t0 + 0.012).toFixed(4);
          cd.el.style.visibility = p < t0 ? "hidden" : "visible";

          // rule draws left to right
          const rk = E.glide(prog(p, 0.5 + i * 0.03, 0.64 + i * 0.03));
          cd.rule.style.transform = `scaleX(${rk.toFixed(4)})`;

          // bars grow, values count
          cd.fills.forEach((fl, j) => {
            const a = 0.55 + i * 0.07 + j * 0.03;
            const bk = E.glide(prog(p, a, a + 0.15));
            fl.style.transform = `scaleX(${bk.toFixed(4)})`;
            const v = STORIES[cd.k].rows[j][2];
            cd.vals[j].textContent = c.count(0, v, bk, 1);
            cd.rl[j].style.opacity = E.out(prog(p, a, a + 0.06)).toFixed(4);
          });
        });
      }

      return { seek, anchors };
    },
  };
})();
