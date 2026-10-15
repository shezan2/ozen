/* Ozen Digital — 15 second launch film.
 *
 * Every frame is a pure function of time: seek(t) sets the full visual state, so the film
 * previews in real time in a browser and renders frame-accurately (render.mjs drives
 * window.film.seek and captures each frame).
 *
 * Beats
 *   0.00  The mark — ÖZEN assembles on cream with the periwinkle footer glow
 *   1.95  The statement — cobalt hero rises: "We build websites / online stores / digital tools."
 *   4.55  The product — camera pulls back to the live site, scrolls to pricing, cards lift off
 *   7.55  The flow — enquiry form, cursor picks "Custom Website", progress fills
 *   9.60  The promise — "Fixed price. Before work begins." + proof points + Get a Quote
 *  11.58  The end card — the button opens into the cobalt card: logo, line, URL
 */
(() => {
  "use strict";

  const QUERY = new URLSearchParams(location.search);
  // Output format (formats/<id>.js): ?format=9x16 or 4x5; the default is the 16:9 film.
  const FORMAT = QUERY.get("format") || "16x9";
  const F = (window.OZEN_FORMATS || {})[FORMAT];
  if (!F) throw new Error(`Unknown format "${FORMAT}" (expected one of ${Object.keys(window.OZEN_FORMATS || {})})`);
  const W = F.width;
  const H = F.height;
  const DURATION = 15;
  const FPS = 60;
  const RENDER = QUERY.has("render");
  // ?debug={"browser":{…}} overrides a pose — handy for framing experiments.
  const DEBUG = (() => {
    try {
      return JSON.parse(QUERY.get("debug") || "{}");
    } catch {
      return {};
    }
  })();
  if (RENDER) document.documentElement.classList.add("render");
  document.documentElement.classList.add(`f-${FORMAT}`);

  /* ---------------------------------------------------------------- math & easing */

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));

  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (u) => ((ax * u + bx) * u + cx) * u;
    const sy = (u) => ((ay * u + by) * u + cy) * u;
    const dx = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return (p) => {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      let u = p;
      for (let i = 0; i < 8; i++) {
        const e = sx(u) - p;
        const d = dx(u);
        if (Math.abs(e) < 1e-6) return sy(u);
        if (Math.abs(d) < 1e-6) break;
        u -= e / d;
      }
      let lo = 0, hi = 1;
      u = p;
      for (let i = 0; i < 30; i++) {
        const x = sx(u);
        if (Math.abs(x - p) < 1e-6) break;
        if (x < p) lo = u; else hi = u;
        u = (lo + hi) / 2;
      }
      return sy(u);
    };
  }

  const E = {
    linear: (p) => p,
    outCubic: (p) => 1 - (1 - p) ** 3,
    inCubic: (p) => p ** 3,
    inOutCubic: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
    inQuart: (p) => p ** 4,
    inOutQuart: (p) => (p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2),
    outExpo: (p) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p)),
    inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    glide: bezier(0.16, 1, 0.3, 1), // long, soft deceleration — the house ease
    dolly: bezier(0.72, 0, 0.16, 1), // camera moves: considered start, long settle
    sheet: bezier(0.66, 0, 0.24, 1), // the cobalt sheet rising over the mark
    lift: bezier(0.34, 1.32, 0.64, 1), // tiny overshoot for UI pops
  };

  const tw = (t, t0, t1, a, b, e = E.glide) => lerp(a, b, e(prog(t, t0, t1)));

  // Keyframes: [[time, value], [time, value, ease], …]; ease belongs to the segment
  // arriving at that key. Values may be numbers or flat objects of numbers.
  function kf(t, keys) {
    const mix = (a, b, p) => {
      if (typeof a === "number") return lerp(a, b, p);
      const o = {};
      for (const k in a) o[k] = lerp(a[k], b[k] ?? a[k], p);
      return o;
    };
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, ease = E.inOutCubic] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        return mix(v0, v1, ease(prog(t, t0, t1)));
      }
    }
    return keys[keys.length - 1][1];
  }

  // Deterministic per-frame noise for grain placement.
  const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  /* ---------------------------------------------------------------- style helpers */

  const $ = (id) => document.getElementById(id);

  function tf(el, o = {}) {
    const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, sx = 1, sy = 1, center = false } = o;
    el.style.transform =
      (center ? "translate(-50%, -50%) " : "") +
      `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, ${z.toFixed(3)}px) ` +
      `rotateX(${rx.toFixed(4)}deg) rotateY(${ry.toFixed(4)}deg) rotateZ(${rz.toFixed(4)}deg) ` +
      `scale(${(s * sx).toFixed(5)}, ${(s * sy).toFixed(5)})`;
  }
  const op = (el, v) => (el.style.opacity = clamp(v).toFixed(4));
  const blur = (el, px) => (el.style.filter = px > 0.04 ? `blur(${px.toFixed(2)}px)` : "none");
  const display = (el, on) => (el.style.display = on ? "" : "none");

  /* ---------------------------------------------------------------- brand pieces */

  const LOGO = window.OZEN_LOGO;
  const ITALIC = 0.42; // dx/dy of the wordmark's italic stems

  function buildLogo(host, width, fill, sheen) {
    const height = (width * LOGO.h) / LOGO.w;
    host.style.width = `${width}px`;
    host.style.height = `${height}px`;
    const piece = (cls, d) => {
      const div = document.createElement("div");
      div.className = `piece ${cls}`;
      div.innerHTML = `<svg viewBox="0 0 ${LOGO.w} ${LOGO.h}"><path fill="${fill}" fill-rule="evenodd" d="${d}"/></svg>`;
      host.appendChild(div);
      return div;
    };
    const k = width / LOGO.w;
    const mark = piece("mark", LOGO.mark);
    mark.style.transformOrigin = `${LOGO.markCenter[0] * k}px ${LOGO.markCenter[1] * k}px`;
    const bars = LOGO.bars.map((d) => piece("bar", d));
    const zen = piece("zen", LOGO.zen);
    let sheenEl = null;
    if (sheen) {
      sheenEl = document.createElement("div");
      sheenEl.className = "sheen";
      const all = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.w} ${LOGO.h}"><path fill-rule="evenodd" d="${LOGO.mark}${LOGO.bars.join("")}${LOGO.zen}"/></svg>`;
      const uri = `url("data:image/svg+xml;utf8,${encodeURIComponent(all)}")`;
      sheenEl.style.webkitMaskImage = uri;
      sheenEl.style.maskImage = uri;
      host.appendChild(sheenEl);
    }
    return { host, mark, bars, zen, sheen: sheenEl, width, height };
  }

  // Slanted soft-edge wipe that follows the italic stems.
  const WIPE_ANGLE = 90 + (Math.atan(ITALIC) * 180) / Math.PI;
  function wipe(el, p) {
    if (p >= 1) {
      el.style.webkitMaskImage = "none";
      el.style.maskImage = "none";
      return;
    }
    const edge = lerp(-14, 104, p);
    const m = `linear-gradient(${WIPE_ANGLE}deg, #000 ${edge.toFixed(2)}%, transparent ${(edge + 9).toFixed(2)}%)`;
    el.style.webkitMaskImage = m;
    el.style.maskImage = m;
  }

  // The ÖZEN build: compass-O spins in, umlaut bars drop along the slant, ZEN wipes on.
  function animateLogo(lg, t, t0, pace = 1) {
    const at = (s) => t0 + s * pace;
    const pm = prog(t, at(0), at(1.15));
    op(lg.mark, E.outCubic(prog(t, at(0), at(0.42))));
    tf(lg.mark, { s: lerp(0.58, 1, E.glide(pm)), rz: lerp(-150, 0, E.glide(pm)) });
    blur(lg.mark, lerp(16, 0, E.outCubic(prog(t, at(0), at(0.72)))));

    lg.bars.forEach((b, i) => {
      const p = prog(t, at(0.46 + i * 0.09), at(1.12 + i * 0.09));
      op(b, E.outCubic(clamp(p * 2.4)));
      tf(b, { x: lerp(44 * ITALIC, 0, E.glide(p)), y: lerp(-44, 0, E.glide(p)) });
    });

    wipe(lg.zen, E.inOutCubic(prog(t, at(0.28), at(1.2))));
    tf(lg.zen, { x: lerp(60, 0, E.glide(prog(t, at(0.28), at(1.5)))) });
    blur(lg.zen, lerp(9, 0, E.outCubic(prog(t, at(0.28), at(0.95)))));
  }

  // Cobalt → periwinkle mesh, sampled from the site's hero panels; drifts slowly.
  function cobalt(t, seed = 0) {
    const a = t * 0.42 + seed;
    const p1 = [98 + 5 * Math.sin(a), 102 + 4 * Math.cos(a * 0.8)];
    const p2 = [-3 + 6 * Math.sin(a * 0.7 + 1), -6 + 5 * Math.cos(a * 0.9)];
    const p3 = [50 + 10 * Math.sin(a * 0.5 + 2), 2 + 3 * Math.cos(a * 0.6)];
    const p4 = [40 + 12 * Math.sin(a * 0.6 + 3), 106];
    const f = (v) => v.toFixed(2);
    return [
      `radial-gradient(40% 58% at ${f(p1[0])}% ${f(p1[1])}%, rgba(218,227,249,0.98) 0%, rgba(176,200,245,0.88) 26%, rgba(118,165,236,0.4) 58%, rgba(80,140,230,0) 100%)`,
      `radial-gradient(46% 70% at ${f(p2[0])}% ${f(p2[1])}%, rgba(66,122,232,0.95) 0%, rgba(60,112,226,0.5) 45%, rgba(58,110,224,0) 100%)`,
      `radial-gradient(58% 62% at ${f(p3[0])}% ${f(p3[1])}%, rgba(24,52,150,0.95) 0%, rgba(27,57,158,0.55) 45%, rgba(27,57,158,0) 100%)`,
      `radial-gradient(52% 55% at ${f(p4[0])}% ${f(p4[1])}%, rgba(54,132,229,0.85) 0%, rgba(54,132,229,0) 100%)`,
      "linear-gradient(170deg, #2244b0 0%, #2552bd 45%, #2c66cf 100%)",
    ].join(",");
  }

  /* ---------------------------------------------------------------- build */

  const el = {
    stage: $("stage"),
    s1: $("s1"), s3: $("s3"), s4: $("s4"), s5: $("s5"),
    s1glow: $("s1-glow"), s3glow: $("s3-glow"), s4glow: $("s4-glow"),
    rig: $("rig"), browser: $("browser"), bview: $("bview"), page: $("page"),
    hero: $("hero"), heroBg: $("hero-bg"), nav: $("nav"), hl1: $("hl-1"),
    chrome: document.querySelector("#browser .chrome"),
    words: Array.from($("roller").children),
    pricing: $("pricing"), poplayer: $("poplayer"),
    info: $("info"), form: $("form"), chip: $("chip"), chipRing: $("chip-ring"),
    pct: $("pct"), bar: $("bar"), optWeb: $("opt-web"), tick: $("tick"),
    st1: $("st-1"), st2: $("st-2"), proof: Array.from($("proof").children), cta: $("cta"),
    endcard: $("endcard"), endBg: $("end-bg"), endContent: $("end-content"),
    endLine: $("end-line"), endUrl: $("end-url"), endCta: $("end-cta"),
    endServices: Array.from($("end-services").children),
    cursor: $("cursor"), grain: $("grain"),
  };

  // Frame size and the format's box sizes (film.css reads these variables).
  Object.assign(el.stage.style, { width: `${W}px`, height: `${H}px` });
  const vars = { "--bw": F.browser.w, "--bh": F.browser.h, "--hero-h": F.heroH, "--headline": F.headlineSize, "--card-w": F.card.w, "--card-h": F.card.h };
  for (const [k, v] of Object.entries(vars)) el.stage.style.setProperty(k, `${v}px`);

  const logo1 = buildLogo($("s1-logo"), F.logo1.w, "#111111", true);
  logo1.host.style.left = `${(W - F.logo1.w) / 2}px`;
  logo1.host.style.top = `${(H - logo1.height) / 2 + F.logo1.dy}px`;
  if (logo1.sheen) logo1.sheen.style.backgroundImage = "none";

  const navLogo = buildLogo($("nav-logo"), 124, "#ffffff", false);
  navLogo.host.style.position = "relative";

  // End card: the content box is the card at full size, so its layout holds while it opens.
  const ENDCARD = { x: F.endCard.inset, y: F.endCard.inset, w: W - 2 * F.endCard.inset, h: H - 2 * F.endCard.inset, r: F.endCard.r };
  Object.assign(el.endContent.style, {
    width: `${ENDCARD.w}px`,
    height: `${ENDCARD.h}px`,
    margin: `${-ENDCARD.h / 2}px 0 0 ${-ENDCARD.w / 2}px`,
  });
  const endLogo = buildLogo($("end-logo"), F.endLogo.w, "#ffffff", false);
  endLogo.host.style.left = `${(ENDCARD.w - F.endLogo.w) / 2}px`;
  endLogo.host.style.top = `${F.endLogo.top}px`;

  // The Get a Quote button, which the end card opens out of.
  const CTA = { x: W / 2 - F.cta.w / 2, y: F.cta.top, w: F.cta.w, h: F.cta.h, r: 12 };
  Object.assign(el.cta.style, { top: `${CTA.y}px`, width: `${CTA.w}px`, height: `${CTA.h}px`, marginLeft: `${-CTA.w / 2}px` });

  const PLANS = [
    { title: "Your website", pre: "From $", value: 500, post: "", desc: "One-off. We agree the features in a consultation and send a fixed price before any work starts." },
    { title: "Ozen Care", pre: "$", value: 80, post: "/mo", desc: "Hosting, security and maintenance, plus one revision a month." },
    { title: "Ozen Care Plus", pre: "$", value: 150, post: "/mo", desc: "Everything in Ozen Care, plus the client portal: enquiry inbox, content editing and automations." },
  ];
  const CARD = F.card;
  const SCROLL_TO = F.scrollTo; // brings the pricing row into view
  Object.assign(el.pricing.style, { left: `${CARD.x0}px`, top: `${CARD.pageY}px` });

  // Flat cards sit in the page's pricing row; their pop-out twins sit at the same spot on the
  // browser (56 px of chrome + the row's scrolled position) so they can lift off it in 3D.
  function planCard(plan, i, pop) {
    const c = document.createElement("div");
    c.className = `pcard${pop ? " pop obj-card" : ""}`;
    c.innerHTML = `<h3>${plan.title}</h3><div class="price">${plan.pre}${plan.value}${plan.post}</div><p>${plan.desc}</p>`;
    const col = i % CARD.cols;
    const row = Math.floor(i / CARD.cols);
    c.style.left = `${(pop ? CARD.x0 : 0) + col * (CARD.w + CARD.gap)}px`;
    c.style.top = `${(pop ? 56 + CARD.pageY + SCROLL_TO : 0) + row * (CARD.h + CARD.gap)}px`;
    return c;
  }
  const flatCards = PLANS.map((p, i) => el.pricing.appendChild(planCard(p, i, false)));
  const popCards = PLANS.map((p, i) => el.poplayer.appendChild(planCard(p, i, true)));
  const popPrices = popCards.map((c) => c.querySelector(".price"));
  const flatPrices = flatCards.map((c) => c.querySelector(".price"));

  /* ---------------------------------------------------------------- poses */

  // The hero card: browser.w - 32 wide, its top 72 px into the browser (56 chrome + 16 inset).
  const HERO_W = F.browser.w - 32;
  const HERO_DY = 72 + F.heroH / 2 - F.browser.h / 2; // hero centre below the browser's centre
  // Browser framing where the hero card fills the frame edge to edge.
  const HERO_FILL = Math.max(H / F.heroH, W / HERO_W);
  const FULL = { x: 0, y: -HERO_DY * HERO_FILL, z: 0, rx: 0, ry: 0, rz: 0, s: HERO_FILL };
  // While the sheet rises the hero card spans the frame width exactly, so its own rounded
  // corners lead the rise; it then grows to full bleed. The card's top edge stays at y=0.
  const HERO_SPAN = W / HERO_W;
  const RISE = { ...FULL, y: -H / 2 - (72 - F.browser.h / 2) * HERO_SPAN, s: HERO_SPAN };

  const eased = (keys) => keys.map(([t, v, e]) => [t, v, e && E[e]]);
  const browserKeys = [
    [1.95, RISE],
    [2.55, FULL, E.sheet],
    [4.55, { ...FULL, s: HERO_FILL * F.heroPush }, E.inOutSine],
    ...eased(F.browserKeys),
  ];
  const formKeys = eased(F.formKeys);
  const infoKeys = eased(F.infoKeys);
  const chipKeys = eased(F.chipKeys);

  /* ---------------------------------------------------------------- cursor */

  let stageScale = 1;
  function pointOf(node, fx = 0.5, fy = 0.5) {
    const r = node.getBoundingClientRect();
    const s = el.stage.getBoundingClientRect();
    return [(r.left + r.width * fx - s.left) / stageScale, (r.top + r.height * fy - s.top) / stageScale];
  }
  // Quadratic arc between two points with a gentle sideways bow.
  function arc(a, b, p, bow = 0.18) {
    const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bow;
    const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bow;
    const u = 1 - p;
    return [u * u * a[0] + 2 * u * p * mx + p * p * b[0], u * u * a[1] + 2 * u * p * my + p * p * b[1]];
  }
  function placeCursor(xy, scale, alpha) {
    op(el.cursor, alpha);
    el.cursor.style.display = alpha > 0.001 ? "" : "none";
    // The pointer tip sits at (3.4, 2.5) inside the 34×44 glyph.
    el.cursor.style.transform = `translate(${(xy[0] - 3.4).toFixed(2)}px, ${(xy[1] - 2.5).toFixed(2)}px) scale(${scale.toFixed(4)})`;
  }

  /* ---------------------------------------------------------------- scenes */

  function sceneMark(t) {
    const on = t < 2.6;
    display(el.s1, on);
    if (!on) return;

    // Footer glow rises in, then drifts.
    tf(el.s1glow, { y: tw(t, 0, 1.9, 340, 0, E.glide) + 10 * Math.sin(t * 1.3) });
    op(el.s1glow, tw(t, 0, 1.4, 0, 1, E.outCubic));

    animateLogo(logo1, t, 0.12);

    // Cobalt sheen passes across the ink once the mark has settled.
    const ps = prog(t, 1.32, 2.05);
    if (ps > 0 && ps < 1) {
      const x = lerp(-30, 130, E.inOutSine(ps));
      logo1.sheen.style.backgroundImage =
        `linear-gradient(${WIPE_ANGLE}deg, rgba(49,104,216,0) ${x - 16}%, rgba(49,104,216,0.95) ${x}%, rgba(140,177,246,0.9) ${x + 3}%, rgba(49,104,216,0) ${x + 16}%)`;
    } else {
      logo1.sheen.style.backgroundImage = "none";
    }

    // Slow push in, then the cobalt sheet rises and the logo recedes under it.
    const exit = prog(t, 1.95, 2.6);
    tf(logo1.host, {
      y: lerp(0, -150, E.inCubic(exit)),
      s: tw(t, 0, 2.2, 0.965, 1.0, E.outCubic) * lerp(1, 0.94, E.inCubic(exit)),
    });
    op(logo1.host, 1 - E.inQuart(exit) * 0.9);
  }

  function sceneProduct(t) {
    const on = t >= 1.94 && t < 10.3;
    display(el.s3, on);
    if (!on) return;

    // 2 · The cobalt sheet rises over the mark.
    const rise = prog(t, 1.95, 2.55);
    el.s3.style.transform = `translateY(${lerp(H + 20, 0, E.sheet(rise)).toFixed(2)}px)`;
    el.hero.style.borderRadius = `${lerp(40, 24, E.sheet(rise)).toFixed(2)}px`;
    // Until the sheet has landed only the hero card may show — no page, chrome or shadow.
    const landed = t >= 2.55;
    el.bview.style.background = el.page.style.background = landed ? "" : "transparent";
    el.chrome.style.visibility = landed ? "" : "hidden";
    el.browser.style.boxShadow = landed ? "" : "none";

    el.heroBg.style.background = cobalt(t, 0.6);

    // Nav and the rolling statement.
    const pn = prog(t, 2.45, 3.05);
    op(el.nav, E.outCubic(pn));
    tf(el.nav, { y: lerp(-18, 0, E.glide(pn)) });

    const p1 = prog(t, 2.42, 3.2);
    tf(el.hl1, { y: lerp(185, 0, E.glide(p1)) });
    blur(el.hl1, lerp(6, 0, E.outCubic(p1)));

    const SWAP = [2.62, 3.3, 3.95]; // entry time of each word
    el.words.forEach((w, i) => {
      const tin = SWAP[i];
      const tout = SWAP[i + 1];
      const pin = prog(t, tin, tin + 0.62);
      let y = lerp(118, 0, E.glide(pin));
      let a = E.outCubic(clamp(pin * 2));
      let b = lerp(8, 0, E.outCubic(pin));
      if (tout !== undefined) {
        const pout = prog(t, tout - 0.06, tout + 0.36);
        y += lerp(0, -112, E.inOutCubic(pout));
        a *= 1 - E.inCubic(pout);
        b += lerp(0, 10, E.inCubic(pout));
      }
      tf(w, { y: (y / 100) * F.headlineSize * 1.14 });
      op(w, a);
      blur(w, b);
    });

    // 3 · Pull back from the hero to the site in a browser, in 3D.
    const pose = { ...kf(t, browserKeys), ...(DEBUG.browser || {}) };
    tf(el.browser, { ...pose, center: true });

    // Page scroll to pricing.
    const scroll = tw(t, 5.38, 6.18, 0, SCROLL_TO, E.dolly);
    tf(el.page, { y: scroll });

    // Prices count up as the row scrolls into view; then the cards lift off the page plane.
    PLANS.forEach((plan, i) => {
      const v = Math.round(lerp(0, plan.value, E.outCubic(prog(t, 5.62 + i * 0.07, 6.5 + i * 0.07))));
      flatPrices[i].textContent = popPrices[i].textContent = `${plan.pre}${v}${plan.post}`;
    });
    const lifted = t >= 6.12;
    flatCards.forEach((c) => (c.style.visibility = lifted ? "hidden" : "visible"));
    popCards.forEach((c, i) => {
      c.style.display = lifted ? "" : "none";
      if (!lifted) return;
      const p = E.glide(prog(t, 6.12 + i * 0.08, 7.1 + i * 0.08));
      const z = lerp(0, 120 + i * 42, p);
      tf(c, { z, y: lerp(0, -16 - i * 6, p), rx: lerp(0, -4, p) });
      c.style.boxShadow =
        `0 1px 0 rgba(255,255,255,.7) inset, ` +
        `0 ${(z * 0.5).toFixed(1)}px ${(z * 0.9).toFixed(1)}px -${(z * 0.22).toFixed(1)}px rgba(27,58,158,${(0.1 + p * 0.26).toFixed(3)}), ` +
        `0 ${(z * 0.16).toFixed(1)}px ${(z * 0.3).toFixed(1)}px -${(z * 0.12).toFixed(1)}px rgba(17,17,17,${(p * 0.14).toFixed(3)})`;
    });

    // Depth of field: the site softens as the enquiry flow takes focus.
    const dof = tw(t, 7.6, 8.3, 0, 3.2, E.inOutSine);
    blur(el.bview, dof);
    popCards.forEach((c) => blur(c, dof));
    blur(el.chrome, dof);

    // 3b · Enquiry flow.
    const formOn = t >= 7.55;
    display(el.form, formOn);
    display(el.info, t >= 7.65);
    display(el.chip, t >= 9.12);
    if (formOn) tf(el.form, { ...kf(t, formKeys), center: true });
    if (t >= 7.65) {
      tf(el.info, { ...kf(t, infoKeys), center: true });
      blur(el.info, tw(t, 8.2, 8.7, 0, 2.2, E.inOutSine));
    }
    if (t >= 9.12) {
      tf(el.chip, { ...kf(t, chipKeys), center: true });
      op(el.chip, tw(t, 9.12, 9.36, 0, 1, E.outCubic));
      const ring = ((t - 9.2) % 0.9) / 0.9;
      el.chipRing.style.transform = `scale(${lerp(0.6, 1.9, E.outCubic(ring)).toFixed(3)})`;
      op(el.chipRing, (1 - ring) * 0.7);
    }

    // Selection + progress.
    const sel = prog(t, 8.98, 9.26);
    const press = Math.sin(Math.PI * prog(t, 8.86, 9.06));
    el.optWeb.style.transform = `scale(${(1 - press * 0.025).toFixed(4)})`;
    el.optWeb.style.borderColor = `rgba(37,81,190,${(0.06 + sel * 0.94).toFixed(3)})`;
    el.optWeb.style.background = `color-mix(in srgb, #2551be ${(sel * 7).toFixed(2)}%, #fbfaf8)`;
    el.optWeb.style.color = sel > 0.5 ? "#1b3a9e" : "#1d1d1d";
    op(el.tick, sel);
    el.tick.style.transform = `scale(${lerp(0.4, 1, E.lift(sel)).toFixed(3)})`;
    const fill = tw(t, 9.05, 9.6, 0, 20, E.glide);
    el.bar.style.width = `${fill.toFixed(3)}%`;
    el.pct.textContent = `${Math.round(fill)}%`;

    // Exit: the whole rig scrolls up and away.
    const out = prog(t, 9.6, 10.1);
    tf(el.rig, { y: lerp(0, F.rigExit, E.inCubic(out)) });
    blur(el.rig, lerp(0, 12, E.inCubic(out)));
    op(el.rig, 1 - E.inOutSine(out));

    op(el.s3glow, landed ? 0.75 : 0);
    tf(el.s3glow, { y: 8 * Math.sin(t * 1.1) });
  }

  function scenePromise(t) {
    const on = t >= 9.7 && t < 12.65;
    display(el.s4, on);
    if (!on) return;
    op(el.s4glow, (t < 10.3 ? 0 : 0.75) * (1 - E.inOutSine(prog(t, 11.66, 12.26))));
    tf(el.s4glow, { y: 8 * Math.sin(t * 1.1) });

    const fade = 1 - E.inCubic(prog(t, 11.68, 12.1));
    const sink = lerp(0, -24, E.inCubic(prog(t, 11.62, 12.16)));

    [el.st1, el.st2].forEach((n, i) => {
      const p = prog(t, 10.0 + i * 0.16, 10.83 + i * 0.16);
      tf(n, { y: lerp(205, 0, E.glide(p)) + sink });
      blur(n, lerp(8, 0, E.outCubic(p)));
      op(n, fade);
    });

    el.proof.forEach((n, i) => {
      const p = prog(t, 10.45 + i * 0.05, 11.07 + i * 0.05);
      tf(n, { y: lerp(26, 0, E.glide(p)) + sink * 0.6 });
      op(n, E.outCubic(p) * fade);
    });

    const pc = prog(t, 10.75, 11.27);
    const press = Math.sin(Math.PI * prog(t, 11.43, 11.61));
    tf(el.cta, { y: lerp(28, 0, E.glide(pc)), s: lerp(0.94, 1, E.glide(pc)) * (1 - press * 0.05) });
    // At 11.5 the end card takes over the button's exact rect (same ink, same label).
    op(el.cta, t < 11.58 ? E.outCubic(pc) : 0);
  }

  function sceneEnd(t) {
    const on = t >= 11.58;
    display(el.s5, on);
    if (!on) return;

    // The Get a Quote button opens into the cobalt end card.
    const ctaRect = CTA;
    const p = E.dolly(prog(t, 11.58, 12.3));
    const r = {
      x: lerp(ctaRect.x, ENDCARD.x, p),
      y: lerp(ctaRect.y, ENDCARD.y, p),
      w: lerp(ctaRect.w, ENDCARD.w, p),
      h: lerp(ctaRect.h, ENDCARD.h, p),
      r: lerp(ctaRect.r, ENDCARD.r, p),
    };
    Object.assign(el.endcard.style, {
      left: `${r.x.toFixed(2)}px`,
      top: `${r.y.toFixed(2)}px`,
      width: `${r.w.toFixed(2)}px`,
      height: `${r.h.toFixed(2)}px`,
      borderRadius: `${r.r.toFixed(2)}px`,
    });
    el.endBg.style.background = cobalt(t, 2.1);
    op(el.endBg, tw(t, 11.64, 12.16, 0, 1, E.inOutSine));
    const pl0 = prog(t, 11.58, 11.8);
    op(el.endCta, 1 - E.outCubic(pl0));
    blur(el.endCta, lerp(0, 6, E.inCubic(pl0)));
    display(el.endCta, pl0 < 1);

    animateLogo(endLogo, t, 12.08, 0.82);
    const push = tw(t, 12.1, 15, 1, 1.035, E.inOutSine);
    tf(el.endContent, { s: push });

    const pl = prog(t, 12.68, 13.4);
    tf(el.endLine, { y: lerp(34, 0, E.glide(pl)) });
    op(el.endLine, E.outCubic(pl));
    blur(el.endLine, lerp(6, 0, E.outCubic(pl)));

    const pu = prog(t, 12.94, 13.6);
    el.endUrl.style.transform = `translateX(-50%) translateY(${lerp(26, 0, E.glide(pu)).toFixed(2)}px)`;
    op(el.endUrl, E.outCubic(pu));

    el.endServices.forEach((n, i) => {
      const p = prog(t, 13.25 + i * 0.045, 13.95 + i * 0.045);
      tf(n, { y: lerp(16, 0, E.glide(p)) });
      op(n, E.outCubic(p));
    });
  }

  function sceneCursor(t) {
    // Beat 3b: enter from lower right, glide to "Custom Website", click.
    if (t >= 8.0 && t < 9.7) {
      const target = pointOf(el.optWeb, 0.36, 0.56);
      const from = F.cursor.formFrom;
      const p = E.dolly(prog(t, 8.05, 8.84));
      const xy = arc(from, target, p, -0.12);
      const press = Math.sin(Math.PI * prog(t, 8.86, 9.06));
      const a = tw(t, 8.0, 8.25, 0, 1, E.outCubic) * (1 - E.inCubic(prog(t, 9.4, 9.68)));
      placeCursor(xy, 1 - press * 0.14, a);
      return;
    }
    // Beat 4: to the Get a Quote button, click.
    if (t >= 10.85 && t < 12.05) {
      const target = [W / 2 + F.cursor.ctaAt[0], CTA.y + F.cursor.ctaAt[1]];
      const from = F.cursor.ctaFrom;
      const p = E.dolly(prog(t, 10.89, 11.41));
      const xy = arc(from, target, p, 0.1);
      const press = Math.sin(Math.PI * prog(t, 11.43, 11.61));
      const a = tw(t, 10.85, 11.07, 0, 1, E.outCubic) * (1 - E.outCubic(prog(t, 11.65, 11.89)));
      placeCursor(xy, 1 - press * 0.14, a);
      return;
    }
    placeCursor([0, 0], 1, 0);
  }

  function grain(t) {
    const f = Math.floor(t * FPS);
    el.grain.style.transform = `translate(${Math.round(hash(f) * 64 - 32)}px, ${Math.round(hash(f + 0.5) * 64 - 32)}px)`;
  }

  /* ---------------------------------------------------------------- driver */

  function seek(t) {
    t = clamp(t, 0, DURATION);
    sceneMark(t);
    sceneProduct(t);
    scenePromise(t);
    sceneEnd(t);
    sceneCursor(t);
    grain(t);
    if (F.adjust) F.adjust(t, { el, E, W, H, clamp, lerp, prog, tw, kf, tf, op, blur, display });
  }

  const ready = (async () => {
    const faces = [
      ['400 64px "Newsreader"', "Aa"], ['500 64px "Newsreader"', "Aa"], ['italic 400 64px "Newsreader"', "Aa"],
      ['500 64px "Ozen Figures"', "0123456789"], ['400 20px "Geist"', "Aa"], ['500 20px "Geist"', "Aa"],
    ];
    await Promise.all(faces.map(([font, text]) => document.fonts.load(font, text)));
    await document.fonts.ready;
    await new Promise((res) => {
      const img = new Image();
      img.onload = img.onerror = res;
      img.src = "assets/grain.png";
    });
    seek(0);
  })();

  window.film = { seek, ready, duration: DURATION, fps: FPS, width: W, height: H, format: FORMAT };

  /* ---------------------------------------------------------------- preview player */

  if (RENDER) return;

  const ui = { play: $("play"), scrub: $("scrub"), clock: $("clock") };
  let playing = true;
  let t0 = null;
  let tNow = 0;

  function fit() {
    const k = Math.min(innerWidth / W, (innerHeight - 76) / H);
    stageScale = k;
    const ox = (innerWidth - W * k) / 2;
    const oy = Math.max(8, (innerHeight - 76 - H * k) / 2);
    Object.assign(el.stage.style, { position: "absolute", left: "0px", top: "0px" });
    el.stage.style.transform = `translate(${ox}px, ${oy}px) scale(${k})`;
  }
  addEventListener("resize", fit);
  fit();

  function frame(now) {
    if (playing) {
      if (t0 === null) t0 = now - tNow * 1000;
      tNow = ((now - t0) / 1000) % DURATION;
    }
    seek(tNow);
    ui.scrub.value = String(Math.round(tNow * FPS));
    ui.clock.textContent = `${tNow.toFixed(2)} / ${DURATION.toFixed(2)}`;
    requestAnimationFrame(frame);
  }
  ui.play.addEventListener("click", () => {
    playing = !playing;
    t0 = null;
    ui.play.textContent = playing ? "❚❚" : "▶";
  });
  ui.scrub.addEventListener("input", () => {
    playing = false;
    ui.play.textContent = "▶";
    tNow = Number(ui.scrub.value) / FPS;
  });
  addEventListener("keydown", (e) => {
    if (e.code === "Space") ui.play.click();
  });
  ready.then(() => requestAnimationFrame(frame));
})();
