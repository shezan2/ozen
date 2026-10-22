/* compare: intelli8.ai "Why weight alone misses recomposition." Three cards (weight-only scale,
 * feet-only path, the forest-green intelli8 hand-and-foot card), the comparison table and the
 * not-an-accuracy-claim footnote, at the site's own size on cream.
 *
 *   p 0.00-0.20  headline lines rise out of their masks (line 2 from 0.06)
 *   p 0.12-0.42  cards rise, staggered 0.07 (card, then eyebrow, title, body lines); the intelli8
 *                card lands as a pale shell and its green fill sweeps in from its left edge
 *                (0.29-0.42), its white copy entering behind the sweep (to 0.46)
 *   p 0.40-0.50  header row: its rule draws left to right, then the three column heads
 *   p 0.46-0.86  rows, one per 0.10: the row's rule draws, the label enters, then the three cells
 *                left to right; the intelli8 cell last, with a small pop
 *   p 0.86-0.96  footnote, line by line
 *
 * opts.focus 0-1 (default 0): dims everything but the intelli8 card and the intelli8 table column to
 *            40% and lays a very soft green band behind that column.
 *
 * anchors (card px): heading, card0, card1, card2, table, col (the intelli8 column band, header to
 * last row), plus footnote.
 */
(() => {
  const W = 1098;
  // Three 1fr cards with 16 px gaps, edges snapped to the half pixel as the site paints them.
  const CARD = { y: 142, h: 266 };
  const CARD_X = [0, 371.5, 742.5];
  const CARD_W = [355.5, 355, 355.5];
  // Table: text columns, header line, row pitch (56 px row + 1 px rule).
  const COL_X = [0, 306, 558, 785.5];
  const HEAD_Y = 442.3; // header text line box (12/20)
  const HEAD_RULE = 472;
  const ROW_Y = 489.5; // first row's text line box (14/24)
  const PITCH = 57;
  const BAND = { x: 769, y: 431, w: W - 769, h: 701 - 431 };
  const FOOT = { y: 717.3, h: 40 };

  const CARDS = [
    {
      eb: "WEIGHT-ONLY SCALE",
      ti: "One number, two stories",
      tx: [
        "If you lose fat and gain muscle, the number",
        "may barely move. Weight alone cannot say",
        "which is happening, so progress can look like",
        "a plateau.",
      ],
    },
    {
      eb: "FEET-ONLY MEASUREMENT PATH",
      ti: "A feet-to-feet reading",
      tx: [
        "Four-electrode scales send current through",
        "the legs and trunk and typically estimate the",
        "upper body. Useful for whole-body trends,",
        "with less arm context.",
      ],
    },
    {
      eb: "intelli8 HAND-AND-FOOT PATH",
      ti: "Segmental context",
      tx: [
        "Eight contacts measure through both arms,",
        "both legs and the trunk, so you can compare",
        "sides and follow regional change alongside",
        "your whole-body trend. The app then keeps",
        "the history and lets you share a PDF with a",
        "coach.",
      ],
    },
  ];
  const HEAD = ["Weight-only", "Four-electrode", "intelli8 eight-electrode"];
  const ROWS = [
    ["Contacts", "None for composition", "Feet only", "Four foot and four hand"],
    ["Fat and muscle estimates", "No", "Yes, feet-to-feet", "Yes, multi-frequency BIA"],
    ["Arm and trunk readings", "No", "Typically estimated", "Through hand contacts"],
    ["Left and right comparison", "No", "Limited", "Arms and legs, side by side"],
  ];
  const NOTE = [
    "This compares the type of information each design provides. It is not an accuracy claim; all BIA values are estimates affected by hydration,",
    "meals and exercise.",
  ];

  const f2 = (n) => +n.toFixed(2);
  const px = (n) => `${f2(n)}px`;

  I8.cards.compare = {
    size: [W, 760],
    bg: "cream",
    build(root, c) {
      const { clamp, lerp, prog, E, rise, blur } = c;
      root.classList.add("card-compare");

      const cardHTML = (d, i) => {
        const copy = `
            <div class="eyebrow c-eb">${d.eb}</div>
            <h3 class="c-ti">${d.ti}</h3>
            <p class="c-tx">${d.tx.map((t) => `<span>${t}</span>`).join("")}</p>`;
        return i < 2
          ? `<div class="c-card c-c${i}" style="left:${px(CARD_X[i])};width:${px(CARD_W[i])}"><div class="c-face"></div>${copy}</div>`
          : `<div class="c-card c-c${i}" style="left:${px(CARD_X[i])};width:${px(CARD_W[i])}"><div class="c-face"></div>
               <div class="c-fill"><div class="c-in">${copy}</div></div></div>`;
      };
      // A table rule in two pieces, split at the intelli8 band, so focus can dim the part outside it.
      const ruleHTML = (y, cls) =>
        `<div class="c-rule ${cls} a" style="left:0;top:${px(y)};width:${px(BAND.x)}"></div>` +
        `<div class="c-rule ${cls} b" style="left:${px(BAND.x)};top:${px(y)};width:${px(W - BAND.x)}"></div>`;

      root.innerHTML = `
        <h2 class="hl c-hl">
          <span class="mask"><span class="line">Why weight alone misses</span></span>
          <span class="mask"><span class="line">recomposition.</span></span>
        </h2>
        ${CARDS.map(cardHTML).join("")}
        <div class="c-band" style="left:${px(BAND.x)};top:${px(BAND.y)};width:${px(BAND.w)};height:${px(BAND.h)}"></div>
        ${HEAD.map((t, j) => `<div class="c-th${j === 2 ? " g" : ""}" style="left:${px(COL_X[j + 1])};top:${px(HEAD_Y)}">${t}</div>`).join("")}
        ${ruleHTML(HEAD_RULE, "hd")}
        ${ROWS.map(
          (row, r) =>
            row
              .map(
                (t, j) =>
                  `<div class="c-td${j === 0 ? " lab" : j === 3 ? " g" : ""}" style="left:${px(COL_X[j])};top:${px(ROW_Y + r * PITCH)}">${t}</div>`
              )
              .join("") + ruleHTML(HEAD_RULE + (r + 1) * PITCH, `r${r}`)
        ).join("")}
        <p class="fine c-fn">${NOTE.map((t) => `<span>${t}</span>`).join("")}</p>
      `;

      const $ = (s) => root.querySelector(s);
      const $$ = (s, n = root) => Array.from(n.querySelectorAll(s));
      const cards = [0, 1, 2].map((i) => {
        const card = $(`.c-c${i}`);
        return {
          card,
          face: card.querySelector(".c-face"),
          fill: card.querySelector(".c-fill"),
          eb: card.querySelector(".c-eb"),
          ti: card.querySelector(".c-ti"),
          tx: $$(".c-tx > span", card),
        };
      });
      const el = {
        hl: $(".c-hl"),
        lines: $$(".c-hl .line"),
        band: $(".c-band"),
        th: $$(".c-th"),
        hdRule: [$(".c-rule.hd.a"), $(".c-rule.hd.b")],
        rows: ROWS.map((_, r) => ({
          cells: $$(".c-td").slice(r * 4, r * 4 + 4),
          rule: [$(`.c-rule.r${r}.a`), $(`.c-rule.r${r}.b`)],
        })),
        fn: $$(".c-fn > span"),
      };

      // ---------- anchors (layout px; measured once before the first seek, constants as fallback) ----------
      const R0 = root.getBoundingClientRect();
      const s0 = root.offsetWidth ? R0.width / root.offsetWidth : 1;
      const rect = (n, fb) => {
        if (!n || !n.offsetWidth || !s0) return fb;
        const r = n.getBoundingClientRect();
        return { x: f2((r.left - R0.left) / s0), y: f2((r.top - R0.top) / s0), w: f2(r.width / s0), h: f2(r.height / s0) };
      };
      const lineW = el.lines.map((ln) => (ln.offsetWidth ? ln.getBoundingClientRect().width / s0 : 0));
      const hlR = rect(el.hl, { x: 0, y: 7.6, w: 520, h: 96 });
      const heading = { x: hlR.x, y: hlR.y, w: f2(Math.max(...lineW) || hlR.w), h: hlR.h };
      const tableTop = BAND.y;
      const anchors = {
        heading,
        card0: rect(cards[0].card, { x: CARD_X[0], y: CARD.y, w: CARD_W[0], h: CARD.h }),
        card1: rect(cards[1].card, { x: CARD_X[1], y: CARD.y, w: CARD_W[1], h: CARD.h }),
        card2: rect(cards[2].card, { x: CARD_X[2], y: CARD.y, w: CARD_W[2], h: CARD.h }),
        table: { x: 0, y: tableTop, w: W, h: f2(HEAD_RULE + ROWS.length * PITCH + 1 - tableTop) },
        col: rect(el.band, { ...BAND }),
        footnote: rect($(".c-fn"), { x: 0, y: FOOT.y, w: 766, h: FOOT.h }),
      };

      // Fade + lift + blur, with an opacity multiplier (focus dimming) and an optional scale.
      function show(n, k, dy, mul = 1, sc = 1) {
        n.style.opacity = clamp(k * mul).toFixed(4);
        n.style.transform = `translateY(${f2((1 - k) * dy)}px)` + (sc !== 1 ? ` scale(${sc.toFixed(4)})` : "");
        n.style.filter = blur((1 - k) * 4);
      }
      const ease = (p, a, b) => E.glide(prog(p, a, b));
      // A rule pair drawn left to right as one line; the part outside the band takes the dim.
      function draw(pair, k, dim) {
        const x = k * W;
        const ka = clamp(x / BAND.x);
        const kb = clamp((x - BAND.x) / (W - BAND.x));
        pair[0].style.transform = `scaleX(${ka.toFixed(4)})`;
        pair[0].style.opacity = (ka > 0 ? dim : 0).toFixed(4);
        pair[1].style.transform = `scaleX(${kb.toFixed(4)})`;
        pair[1].style.opacity = (kb > 0 ? 1 : 0).toFixed(4);
      }
      // The intelli8 card's green sweep: a soft-edged mask moving from the card's left edge.
      const SOFT = 56;
      function sweep(n, k) {
        let m = "none";
        if (k <= 0) m = "linear-gradient(90deg, transparent 0, transparent 100%)";
        else if (k < 1) {
          const x = lerp(0, CARD_W[2] + SOFT, k);
          m = `linear-gradient(90deg, #000 ${f2(x - SOFT)}px, transparent ${f2(x)}px)`;
        }
        n.style.webkitMaskImage = m;
        n.style.maskImage = m;
      }

      function seek(p, opts = {}) {
        p = clamp(+p || 0);
        const focus = clamp(+opts.focus || 0);
        const dim = 1 - 0.6 * focus;

        // ---------- headline ----------
        el.lines.forEach((ln, i) => rise(ln, p, 0.06 * i, 0.14 + 0.06 * i));
        el.hl.style.opacity = dim.toFixed(4);

        // ---------- cards ----------
        cards.forEach((cd, i) => {
          const s = 0.12 + 0.07 * i;
          const mul = i < 2 ? dim : 1;
          show(cd.card, ease(p, s, s + 0.16), 28, mul);
          if (i < 2) {
            show(cd.eb, ease(p, s + 0.025, s + 0.145), 8);
            show(cd.ti, ease(p, s + 0.035, s + 0.155), 8);
            cd.tx.forEach((ln, j) => show(ln, ease(p, s + 0.045 + 0.008 * j, s + 0.165 + 0.008 * j), 8));
          } else {
            // The shell lands, then the green sweeps across it and the white copy follows the edge.
            const k = E.sheet(prog(p, 0.29, 0.42));
            sweep(cd.fill, k);
            cd.face.style.opacity = (1 - prog(k, 0.85, 1)).toFixed(4);
            show(cd.eb, ease(p, 0.32, 0.41), 8);
            show(cd.ti, ease(p, 0.335, 0.425), 8);
            cd.tx.forEach((ln, j) => show(ln, ease(p, 0.345 + 0.008 * j, 0.425 + 0.008 * j), 8));
          }
        });

        // ---------- table ----------
        const present = ease(p, 0.4, 0.5);
        el.band.style.opacity = (focus * present).toFixed(4);
        draw(el.hdRule, E.sheet(prog(p, 0.4, 0.5)), dim);
        el.th.forEach((n, j) => show(n, ease(p, 0.41 + 0.015 * j, 0.47 + 0.015 * j), 8, j < 2 ? dim : 1));
        el.rows.forEach((row, r) => {
          const t = 0.46 + 0.1 * r;
          draw(row.rule, E.sheet(prog(p, t, t + 0.07)), dim);
          const [lab, c1, c2, c3] = row.cells;
          show(lab, ease(p, t + 0.005, t + 0.06), 8, dim);
          show(c1, ease(p, t + 0.02, t + 0.075), 8, dim);
          show(c2, ease(p, t + 0.03, t + 0.085), 8, dim);
          // The intelli8 cell: last, a touch more lift and a small pop.
          const k3 = prog(p, t + 0.042, t + 0.1);
          show(c3, E.glide(k3), 11, 1, lerp(0.94, 1, E.pop(k3)));
        });

        // ---------- footnote ----------
        el.fn.forEach((ln, i) => show(ln, ease(p, 0.86 + 0.015 * i, 0.945 + 0.015 * i), 8, dim));
      }

      return { seek, anchors };
    },
  };
})();
