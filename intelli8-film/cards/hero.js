/* hero: the top of intelli8.ai on sage. "See your progress. In fat and muscle." with the front-view
 * scale render and its "8 contacts · 5 body segments" chip.
 *
 *   p 0.00-0.45  the scale rises ~80 px into place with a perspective settle (rotateX 10° → 0, a
 *                -2.5° rotateZ settle); its wide green-tinted contact shadow grows under it
 *   p 0.08-0.30  eyebrow
 *   p 0.12-0.55  headline lines rise out of their masks, staggered 0.07
 *   p 0.30-0.50  the display wakes: the dark "off" glass fades out with a faint bloom
 *   p 0.50-0.66  paragraph, line by line
 *   p 0.58-0.74  chip pops in at the scale's lower right
 *
 * opts.cta   0-1 (default 1): buttons, then store pills, then the caption enter, staggered over cta.
 *            0 hides them, so the film can show the reveal first and bring them in at the end.
 * opts.float seconds (default 0): slow idle drift of the scale (±4 px, sine) so a held frame breathes.
 *
 * anchors (card px): scale (image rect), glass (display glass), headline, cta, plus eyebrow, para,
 * buttons, stores, caption, chip.
 */
(() => {
  // The render, resolved next to this script so the card works from cards/harness.html and the film.
  const SRC = (() => {
    try {
      return new URL("../assets/scale-front.png", document.currentScript.src).href;
    } catch (e) {
      return "../assets/scale-front.png";
    }
  })();

  // assets/scale-front.png is 783 × 980; on the site it is drawn at half size (1 image px = 0.5 CSS px).
  const IMG = { w: 783, h: 980 };
  const SCALE = { x: 605, y: 156, w: 391.5, h: 490 };
  const K = SCALE.w / IMG.w;
  // The display glass in image px: a slightly perspective quad with rounded corners.
  const GQ = [[261, 151], [446, 139], [446, 474.5], [261, 479]];
  const GBOX = { x: 261, y: 139, w: 185, h: 340 };
  // The glass's own reflection (the lighter wedge on the left), image px.
  const REFL = [[250, 130], [388, 130], [338.5, 490], [250, 490]];

  const f2 = (n) => +n.toFixed(2);
  // A quad with rounded corners (radius r, image px).
  function roundQuad(q, r) {
    const n = q.length;
    let d = "";
    for (let i = 0; i < n; i++) {
      const p0 = q[(i + n - 1) % n], p1 = q[i], p2 = q[(i + 1) % n];
      const a = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const b = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const s = [p1[0] + ((p0[0] - p1[0]) * r) / a, p1[1] + ((p0[1] - p1[1]) * r) / a];
      const e = [p1[0] + ((p2[0] - p1[0]) * r) / b, p1[1] + ((p2[1] - p1[1]) * r) / b];
      d += `${i ? "L" : "M"}${f2(s[0])},${f2(s[1])} Q${p1[0]},${p1[1]} ${f2(e[0])},${f2(e[1])} `;
    }
    return d + "Z";
  }
  // Grow a quad by g px around its centre (covers the lit content's anti-aliased edge).
  const grow = (q, g) => {
    const cx = q.reduce((s, p) => s + p[0], 0) / q.length, cy = q.reduce((s, p) => s + p[1], 0) / q.length;
    return q.map(([x, y]) => [x + Math.sign(x - cx) * g, y + Math.sign(y - cy) * g]);
  };

  let instances = 0;
  const ARROW_R = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6h10M6.6 1.6 11 6l-4.4 4.4"/></svg>`;
  const ARROW_D = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1 6l5 5 5-5"/></svg>`;

  I8.cards.hero = {
    size: [1098, 700],
    bg: "sage",
    build(root, c) {
      const { clamp, lerp, prog, E, rise, enter, blur } = c;
      root.classList.add("card-hero");
      const glassPath = roundQuad(grow(GQ, 1), 9);
      root.innerHTML = `
        <div class="h-shadow"></div>
        <div class="h-scale">
          <img src="${SRC}" alt="intelli8 Body Composition Scale" draggable="false" />
          <svg viewBox="0 0 ${IMG.w} ${IMG.h}" aria-hidden="true">
            <defs>
              <clipPath id="h-glass-clip"><path d="${glassPath}"/></clipPath>
              <linearGradient id="h-refl" gradientUnits="userSpaceOnUse" x1="0" y1="${GBOX.y}" x2="0" y2="${GBOX.y + GBOX.h}">
                <stop offset="0" stop-color="#474747"/>
                <stop offset="0.32" stop-color="#373737"/>
                <stop offset="0.56" stop-color="#282828"/>
                <stop offset="0.8" stop-color="#1d1d1d"/>
                <stop offset="1" stop-color="#0d0d0d"/>
              </linearGradient>
            </defs>
            <g class="h-off" clip-path="url(#h-glass-clip)">
              <rect x="${GBOX.x - 4}" y="${GBOX.y - 4}" width="${GBOX.w + 8}" height="${GBOX.h + 8}" fill="#030303"/>
              <polygon points="${REFL.map((p) => p.join(",")).join(" ")}" fill="url(#h-refl)"/>
            </g>
          </svg>
          <div class="h-bloom"></div>
        </div>
        <div class="h-chip">
          <i>intelli8 BODY COMPOSITION SCALE</i>
          <b>8 contacts · 5 body segments</b>
        </div>

        <div class="eyebrow h-eye">Know more than your weight</div>
        <h1 class="hl h-hl">
          <span class="mask"><span class="line">See your</span></span>
          <span class="mask"><span class="line">progress.</span></span>
          <span class="mask"><span class="line accent">In fat and</span></span>
          <span class="mask"><span class="line accent">muscle.</span></span>
        </h1>
        <p class="h-para">
          <span>The intelli8 Body Composition Scale uses eight hand-</span>
          <span>and-foot electrodes to follow fat and muscle across both</span>
          <span>arms, both legs and trunk, then turns each measurement</span>
          <span>into a detailed intelli8 App report.</span>
        </p>
        <div class="h-btn h-buy">Buy now ${ARROW_R}</div>
        <div class="h-btn h-how">How it measures ${ARROW_D}</div>
        <div class="h-store h-gp"><span>Get it on</span><b>Google Play</b></div>
        <div class="h-store h-tf"><span>iOS beta on</span><b>TestFlight</b></div>
        <p class="h-cap">Google Play downloads are live. Join the iOS beta through TestFlight<br />while App Store review is pending.</p>
      `;
      // Scope the SVG ids to this instance (the film mounts the hero twice).
      const uid = `hero${++instances}`;
      root.querySelector("clipPath").id = `${uid}-clip`;
      root.querySelector("linearGradient").id = `${uid}-refl`;
      root.querySelector(".h-off").setAttribute("clip-path", `url(#${uid}-clip)`);
      root.querySelector(".h-off polygon").setAttribute("fill", `url(#${uid}-refl)`);

      const $ = (s) => root.querySelector(s);
      const $$ = (s) => Array.from(root.querySelectorAll(s));
      const el = {
        shadow: $(".h-shadow"),
        scale: $(".h-scale"),
        off: $(".h-off"),
        bloom: $(".h-bloom"),
        chip: $(".h-chip"),
        eye: $(".h-eye"),
        hl: $(".h-hl"),
        lines: $$(".h-hl .line"),
        para: $$(".h-para > span"),
        buy: $(".h-buy"),
        how: $(".h-how"),
        gp: $(".h-gp"),
        tf: $(".h-tf"),
        cap: $(".h-cap"),
      };

      // The TestFlight pill sits after the Google Play pill.
      el.tf.style.left = `${el.gp.offsetWidth ? f2(el.gp.getBoundingClientRect().width / (root.getBoundingClientRect().width / root.offsetWidth || 1)) + 12 : 171.5}px`;

      // Bloom: over the glass, in scale-element px.
      Object.assign(el.bloom.style, {
        left: `${f2(GBOX.x * K - 8)}px`,
        top: `${f2(GBOX.y * K - 8)}px`,
        width: `${f2(GBOX.w * K + 16)}px`,
        height: `${f2(GBOX.h * K + 16)}px`,
      });
      // The contact shadow: a soft green-tinted slab behind the scale body (image px 6-781 × 70-962).
      const SH = { x: SCALE.x + 10 * K, y: SCALE.y + 78 * K, w: 766 * K, h: 880 * K };
      Object.assign(el.shadow.style, {
        left: `${f2(SH.x)}px`,
        top: `${f2(SH.y)}px`,
        width: `${f2(SH.w)}px`,
        height: `${f2(SH.h)}px`,
      });

      // ---------- anchors (layout px, measured once; fall back to the CSS numbers if not laid out) ----------
      // Measured before the first seek (no transforms yet), relative to the card and in card px even
      // when the film has the card scaled.
      const R0 = root.getBoundingClientRect();
      const s0 = root.offsetWidth ? R0.width / root.offsetWidth : 1;
      const rect = (n, fb) => {
        if (!n || !n.offsetWidth || !s0) return fb;
        const r = n.getBoundingClientRect();
        return { x: f2((r.left - R0.left) / s0), y: f2((r.top - R0.top) / s0), w: f2(r.width / s0), h: f2(r.height / s0) };
      };
      const union = (...rs) => {
        const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
        const x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
        return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      };
      const buy = rect(el.buy, { x: 0, y: 514.5, w: 129, h: 48 });
      const how = rect(el.how, { x: 140, y: 514.5, w: 186, h: 48 });
      const gp = rect(el.gp, { x: 0, y: 586, w: 159.5, h: 62 });
      const tf = rect(el.tf, { x: 171.5, y: 586, w: 138.5, h: 62 });
      const cap = rect(el.cap, { x: 0, y: 660.5, w: 377, h: 40 });
      const hlR = rect(el.hl, { x: 0, y: 45.5, w: 298, h: 286 });
      const anchors = {
        scale: { ...SCALE },
        glass: { x: SCALE.x + GBOX.x * K, y: SCALE.y + GBOX.y * K, w: GBOX.w * K, h: GBOX.h * K },
        eyebrow: rect(el.eye, { x: 0, y: 11, w: 189.5, h: 14 }),
        headline: hlR,
        para: rect($(".h-para"), { x: 0, y: 354.5, w: 476, h: 128 }),
        buttons: union(buy, how),
        stores: union(gp, tf),
        caption: cap,
        cta: union(buy, how, gp, tf, cap),
        chip: rect(el.chip, { x: 850.5, y: 610.5, w: 215.5, h: 58 }),
      };

      function seek(p, opts = {}) {
        p = clamp(+p || 0);
        const ctaK = opts.cta === undefined ? 1 : clamp(+opts.cta || 0);
        const ft = +opts.float || 0;

        // ---------- scale ----------
        const k = E.glide(prog(p, 0, 0.45));
        const kz = E.glide(prog(p, 0.04, 0.5));
        const fade = E.out(prog(p, 0, 0.18));
        const drift = 4 * Math.sin((2 * Math.PI * ft) / 7.5);
        const driftX = 1.2 * Math.sin((2 * Math.PI * ft) / 11.3 + 0.8);
        const ty = 80 * (1 - k) + drift;
        el.scale.style.transform =
          `perspective(1400px) translate(${driftX.toFixed(2)}px, ${ty.toFixed(2)}px) ` +
          `rotateX(${(10 * (1 - k)).toFixed(3)}deg) rotateZ(${(-2.5 * (1 - kz)).toFixed(3)}deg)`;
        el.scale.style.opacity = fade.toFixed(4);
        el.scale.style.filter = blur((1 - fade) * 4);

        // The shadow grows in as the scale arrives; it lightens a touch when the scale drifts up.
        const ks = E.glide(prog(p, 0.02, 0.5));
        const sScale = lerp(0.78, 1, ks) * (1 + drift * 0.002);
        el.shadow.style.transform = `translate(${(driftX * 0.5).toFixed(2)}px, ${(10 + 46 * (1 - ks) + drift * 0.35).toFixed(2)}px) scale(${sScale.toFixed(4)})`;
        el.shadow.style.opacity = (0.54 * ks * (1 + drift * 0.012)).toFixed(4);
        el.shadow.style.filter = `blur(${(56 - 18 * (1 - ks)).toFixed(2)}px)`;

        // ---------- display wakes ----------
        const w = prog(p, 0.3, 0.5);
        el.off.style.opacity = (1 - E.inOut(w)).toFixed(4);
        const bl = Math.sin(Math.PI * clamp(prog(p, 0.32, 0.56))) ** 2;
        el.bloom.style.opacity = (0.28 * bl).toFixed(4);

        // ---------- copy ----------
        enter(el.eye, p, 0.08, 0.3, 10);
        el.lines.forEach((ln, i) => rise(ln, p, 0.12 + 0.07 * i, 0.34 + 0.07 * i));
        el.para.forEach((ln, i) => enter(ln, p, 0.5 + 0.015 * i, 0.615 + 0.015 * i, 12));

        // ---------- chip ----------
        const kc = prog(p, 0.58, 0.74);
        const pop = E.pop(kc);
        const chipDrift = 2.2 * Math.sin((2 * Math.PI * (ft - 0.7)) / 7.5);
        el.chip.style.opacity = E.out(prog(p, 0.58, 0.68)).toFixed(4);
        el.chip.style.transform = `translateY(${((1 - E.glide(kc)) * 12 + chipDrift).toFixed(2)}px) scale(${lerp(0.9, 1, pop).toFixed(4)})`;
        el.chip.style.filter = blur((1 - E.glide(kc)) * 3);

        // ---------- calls to action ----------
        enter(el.buy, ctaK, 0, 0.55, 14);
        enter(el.how, ctaK, 0.08, 0.63, 14);
        enter(el.gp, ctaK, 0.22, 0.77, 14);
        enter(el.tf, ctaK, 0.3, 0.85, 14);
        enter(el.cap, ctaK, 0.45, 1, 10);
      }

      return { seek, anchors };
    },
  };
})();
