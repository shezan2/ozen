/* intelli8 Body Composition Scale — 34 second product film.
 *
 * Every frame is a pure function of time: seek(t) sets the whole picture (render.mjs --film scale
 * drives window.film.seek). The site's sections are rebuilt as cards (cards/*.js); this file mounts
 * them, times them and moves the camera between them.
 *
 * Beats
 *   0.0  Hook — weight-only scale: "One number. Two stories."
 *   4.2  Reveal — "See your progress. In fat and muscle." The scale rises, its display wakes
 *   8.5  Dive through the black glass into the contacts: four for your feet, four for your hands
 *  11.3  The dark frame folds into the segment card: "Eight electrodes. Five body segments."
 *  15.3  Scroll on: "Why weight alone misses recomposition." — the comparison
 *  19.6  Dark section: "Stand steady. Hold the bar. See more." — the four steps
 *  23.9  The built-in display: weight plus six more readings
 *  27.2  Specifications
 *  29.4  End — the hero again with where to buy, S$98, and the safety line
 */
(() => {
  "use strict";

  const QUERY = new URLSearchParams(location.search);
  const FORMAT = QUERY.get("format") || "16x9";
  if (FORMAT !== "16x9") throw new Error(`The scale film has no "${FORMAT}" layout yet`);
  const W = 1920;
  const H = 1080;
  const DURATION = 34;
  const FPS = 60;
  const RENDER = QUERY.has("render");
  if (RENDER) document.documentElement.classList.add("render");
  document.documentElement.classList.add(`f-${FORMAT}`);

  /* ---------------------------------------------------------------- math & easing */

  const { clamp, lerp, prog, bezier } = I8.c;
  const E = {
    linear: (p) => p,
    out: (p) => 1 - (1 - p) ** 3,
    in: (p) => p ** 3,
    inOut: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
    sine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    glide: bezier(0.16, 1, 0.3, 1), // the house ease: long, soft settle
    dolly: bezier(0.72, 0, 0.16, 1), // camera moves
    sheet: bezier(0.66, 0, 0.24, 1), // panels rising
    pop: bezier(0.34, 1.4, 0.64, 1),
  };
  const tw = (t, t0, t1, a, b, e = E.glide) => lerp(a, b, e(prog(t, t0, t1)));

  /* ---------------------------------------------------------------- style helpers */

  const $ = (id) => document.getElementById(id);
  const op = (el, v) => (el.style.opacity = clamp(v).toFixed(4));
  const show = (el, on) => (el.style.display = on ? "block" : "none");
  const blurf = (px) => (px > 0.05 ? `blur(${px.toFixed(2)}px)` : "none");
  // A masked line rising into place (the site's headline reveal).
  function rise(el, t, t0, dur = 0.8, exitAt = 1e9, exitDur = 0.45) {
    const p = E.glide(prog(t, t0, t0 + dur));
    const q = E.in(prog(t, exitAt, exitAt + exitDur));
    const hgt = el.offsetHeight || 100;
    el.style.transform = `translateY(${((1 - p) * 1.15 - q * 1.15) * hgt}px)`;
    el.style.filter = blurf((1 - p) * 6 + q * 4);
  }
  // Fade + small lift.
  function enter(el, t, t0, dur = 0.7, dy = 24, exitAt = 1e9, exitDur = 0.4) {
    const p = E.glide(prog(t, t0, t0 + dur));
    const q = E.in(prog(t, exitAt, exitAt + exitDur));
    el.style.transform = `translateY(${((1 - p) * dy - q * dy).toFixed(2)}px)`;
    el.style.filter = blurf((1 - p) * 4 + q * 3);
    op(el, p * (1 - q));
  }
  // Camera: translate + scale about the stage centre.
  const cam = (el, x = 0, y = 0, s = 1) =>
    (el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`);

  /* ---------------------------------------------------------------- cards */

  // Mount a site card into a camera, centred on (cx, cy) at scale s. Cards still being built show a
  // labelled placeholder so the cut can be timed before they land.
  function mount(name, parent, { cx = W / 2, cy = H / 2, s = 1, size } = {}) {
    const wrap = document.createElement("div");
    wrap.className = "cardwrap";
    const root = document.createElement("div");
    root.className = "i8c";
    wrap.appendChild(root);
    parent.appendChild(wrap);
    const def = I8.cards[name];
    const [w, h] = def ? def.size : size || [1098, 640];
    Object.assign(root.style, { width: `${w}px`, height: `${h}px` });
    let api;
    if (def) api = def.build(root, I8.c);
    else {
      root.innerHTML = `<div class="placeholder">${name}</div>`;
      api = { seek() {}, anchors: {} };
    }
    const card = { name, wrap, root, w, h, api, ready: !!def, x: 0, y: 0, s: 1 };
    place(card, cx, cy, s);
    return card;
  }
  function place(card, cx, cy, s) {
    card.s = s;
    card.x = cx - (card.w * s) / 2;
    card.y = cy - (card.h * s) / 2;
    card.wrap.style.transform = `translate(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px) scale(${s})`;
  }
  // An anchor rect of a card in stage px (before the scene camera), or the whole card.
  function anchor(card, key) {
    const a = (card.api.anchors || {})[key] || { x: 0, y: 0, w: card.w, h: card.h };
    return { x: card.x + a.x * card.s, y: card.y + a.y * card.s, w: a.w * card.s, h: a.h * card.s };
  }

  /* ---------------------------------------------------------------- build */

  const stage = $("stage");
  Object.assign(stage.style, { width: `${W}px`, height: `${H}px` });

  const sc = {
    hook: $("s-hook"), reveal: $("s-reveal"), contacts: $("s-contacts"), segments: $("s-segments"),
    compare: $("s-compare"), steps: $("s-steps"), display: $("s-display"), specs: $("s-specs"), end: $("s-end"),
  };
  const cm = {
    hook: $("c-hook"), reveal: $("c-reveal"), contacts: $("c-contacts"), segments: $("c-segments"),
    compare: $("c-compare"), steps: $("c-steps"), display: $("c-display"), specs: $("c-specs"), end: $("c-end"),
  };
  // Cards measure their SVG paths while building, so every scene is laid out (display: block) first.
  for (const s of Object.values(sc)) show(s, true);

  const COMPARE_S = 1.55;
  const card = {
    hook: mount("hook", cm.hook, { s: 1.5, size: [1100, 620] }),
    reveal: mount("hero", cm.reveal, { s: 1.42, cy: 560, size: [1098, 700] }),
    segments: mount("segments", cm.segments, { s: 1.62, size: [1098, 520] }),
    compare: mount("compare", cm.compare, { s: COMPARE_S, size: [1098, 760] }),
    steps: mount("steps", cm.steps, { s: 1.32, size: [1098, 780] }),
    display: mount("display", cm.display, { s: 1.55, size: [1100, 640] }),
    specs: mount("specs", cm.specs, { s: 1.34, size: [1098, 770] }),
    end: mount("hero", cm.end, { s: 1.3, cy: 500, size: [1098, 700] }),
  };
  // The comparison is taller than the frame: the camera scrolls from its top to its bottom.
  const compareTop = 70;
  const compareBottom = H - 64 - card.compare.h * COMPARE_S;

  const el = {
    ctScale: $("ct-scale"), ctContacts: $("ct-contacts"), ctScan: $("ct-scan"), ctCopy: $("ct-copy"),
    ctEye: document.querySelector("#ct-copy .eyebrow"), ctL: [$("ct-l1"), $("ct-l2")], ctBody: $("ct-body"),
    enPrice: $("en-price"), enFine: $("en-fine"),
  };

  // The eight contacts on the front render (image px of assets/scale-front.png, 783 × 980): four foot
  // plates, then the two hand pads on the bar (each pad is a hand's pair).
  const IMG = [783, 980];
  const CONTACTS = [
    { r: [80, 183, 171, 455] }, // left foot, front
    { r: [79, 587, 171, 860] }, // left foot, heel
    { r: [546, 147, 658, 447] }, // right foot, front
    { r: [547, 593, 658, 893] }, // right foot, heel
    { r: [233, 47, 330, 83], pad: true }, // left hand
    { r: [368, 33, 470, 70], pad: true }, // right hand
  ];
  // When each lights (s). Feet in an uneven run, then the hands: matches audio/sound.py (scale cues).
  const CONTACT_AT = [9.42, 9.53, 9.68, 9.76, 10.22, 10.36];
  const contactEls = CONTACTS.map(({ r, pad }) => {
    const [x0, y0, x1, y1] = r;
    const box = {
      left: `${(x0 / IMG[0]) * 100}%`, top: `${(y0 / IMG[1]) * 100}%`,
      width: `${((x1 - x0) / IMG[0]) * 100}%`, height: `${((y1 - y0) / IMG[1]) * 100}%`,
    };
    const glow = document.createElement("i");
    const ring = document.createElement("b");
    if (pad) glow.className = "pad";
    Object.assign(glow.style, box);
    Object.assign(ring.style, box);
    if (pad) ring.style.borderRadius = "14px";
    el.ctContacts.append(glow, ring);
    return { glow, ring };
  });

  // End layout: the price line and the fine print sit under the hero's copy column.
  Object.assign(el.enPrice.style, { left: "150px", top: "968px" });
  Object.assign(el.enFine.style, { left: "150px", top: "1022px", width: "1620px" });

  /* ---------------------------------------------------------------- timing */

  // [in, out] window of each scene (s); scenes overlap during transitions.
  const WIN = {
    hook: [0, 4.95],
    reveal: [4.2, 9.1],
    contacts: [8.75, 11.98],
    segments: [11.3, 16.05],
    compare: [15.3, 20.35],
    steps: [19.6, 24.55],
    display: [23.9, 27.95],
    specs: [27.2, 30.15],
    end: [29.4, DURATION],
  };
  const live = (k, t) => t >= WIN[k][0] && t < WIN[k][1];
  // A scene rising over the previous one like a section scrolling up (rounded top while moving).
  function sheet(scene, t, t0, t1) {
    const p = E.sheet(prog(t, t0, t1));
    scene.style.transform = `translateY(${((1 - p) * H).toFixed(2)}px)`;
    const r = (1 - p) * 56;
    scene.style.borderRadius = r > 0.5 ? `${r.toFixed(1)}px ${r.toFixed(1)}px 0 0` : "0";
    scene.style.boxShadow = p < 1 ? `0 -30px 80px rgba(0, 0, 0, ${(0.18 * (1 - p)).toFixed(3)})` : "none";
  }
  const reset = (scene) => {
    scene.style.transform = "none";
    scene.style.borderRadius = "0";
    scene.style.boxShadow = "none";
    scene.style.clipPath = "none";
    scene.style.opacity = "1";
    scene.style.filter = "none";
  };

  /* ---------------------------------------------------------------- scenes */

  function sceneHook(t) {
    show(sc.hook, live("hook", t));
    if (!live("hook", t)) return;
    reset(sc.hook);
    card.hook.api.seek(prog(t, 0.1, 4.1));
    // Hold, then lift away as the sage section rises over it.
    const q = E.in(prog(t, 4.2, 4.9));
    cam(cm.hook, 0, -140 * q, 1 + 0.02 * prog(t, 0, 4.2));
    cm.hook.style.filter = blurf(q * 6);
  }

  function sceneReveal(t) {
    show(sc.reveal, live("reveal", t));
    if (!live("reveal", t)) return;
    reset(sc.reveal);
    sheet(sc.reveal, t, 4.2, 4.95);
    card.reveal.api.seek(prog(t, 4.55, 8.0), { cta: 0, float: t });
    // Slow push, then the dive: the camera falls into the black plate between the electrodes.
    const sc0 = anchor(card.reveal, "scale");
    const fx = sc0.x + sc0.w * 0.46, fy = sc0.y + sc0.h * 0.79; // plain plate under the icon legend
    const d = E.in(prog(t, 8.45, 9.05));
    const push = 1 + 0.03 * prog(t, 4.6, 8.45);
    const s = push * (1 + 15 * d);
    // The camera scales about the stage centre; the dive point drifts to the centre as it grows.
    const gx = lerp(W / 2 + push * (fx - W / 2), W / 2, E.inOut(d));
    const gy = lerp(H / 2 + push * (fy - H / 2), H / 2, E.inOut(d));
    cam(cm.reveal, gx - W / 2 - s * (fx - W / 2), gy - H / 2 - s * (fy - H / 2), s);
    cm.reveal.style.filter = blurf(d * 10);
  }

  function sceneContacts(t) {
    show(sc.contacts, live("contacts", t));
    if (!live("contacts", t)) return;
    reset(sc.contacts);
    // Arrive out of the black glass, then fold into the segment card's dark panel.
    sc.contacts.style.opacity = E.out(prog(t, 8.75, 9.12)).toFixed(4);
    const into = tw(t, 8.8, 9.9, 1.06, 1, E.glide);
    cam(cm.contacts, 0, 0, into * (1 + 0.015 * prog(t, 9.9, 11.3)));
    enter(el.ctScale, t, 8.8, 0.9, 30, 11.15, 0.35);

    el.ctEye.style.opacity = "1";
    enter(el.ctEye, t, 9.15, 0.6, 14, 11.1, 0.3);
    rise(el.ctL[0], t, 9.3, 0.8, 11.1, 0.35);
    rise(el.ctL[1], t, 10.05, 0.8, 11.14, 0.35);
    enter(el.ctBody, t, 10.5, 0.7, 18, 11.18, 0.3);

    contactEls.forEach(({ glow, ring }, i) => {
      const t0 = CONTACT_AT[i];
      const on = E.out(prog(t, t0, t0 + 0.22));
      const settle = 1 - 0.35 * E.out(prog(t, t0 + 0.22, t0 + 0.9));
      op(glow, on * settle * (1 - prog(t, 11.1, 11.4)));
      const pr = prog(t, t0, t0 + 0.75);
      const grow = 1 + 0.32 * E.out(pr);
      ring.style.transform = `scale(${grow.toFixed(4)})`;
      op(ring, pr > 0 && pr < 1 ? (1 - pr) * 0.85 : 0);
    });
    // The measurement: a soft band sweeps up the plate once all eight are in contact.
    const ps = prog(t, 10.6, 11.15);
    el.ctScan.style.top = `${lerp(100, -22, E.inOut(ps)).toFixed(2)}%`;
    op(el.ctScan, Math.sin(Math.PI * ps) * 0.9);

    // Fold: the whole dark frame shrinks onto the dark card of the segment section.
    const f = E.dolly(prog(t, 11.3, 11.95));
    if (f > 0) {
      const r = anchor(card.segments, "card");
      const inset = [lerp(0, r.y, f), lerp(0, W - r.x - r.w, f), lerp(0, H - r.y - r.h, f), lerp(0, r.x, f)];
      sc.contacts.style.clipPath = `inset(${inset.map((v) => `${v.toFixed(2)}px`).join(" ")} round ${(28 * card.segments.s * f).toFixed(2)}px)`;
    }
  }

  function sceneSegments(t) {
    show(sc.segments, live("segments", t));
    if (!live("segments", t)) return;
    reset(sc.segments);
    card.segments.api.seek(prog(t, 11.85, 15.4));
    // Page scroll into the comparison.
    const s = E.dolly(prog(t, 15.3, 16.0));
    cam(cm.segments, 0, -H * s, 1 + 0.02 * prog(t, 11.9, 15.3));
  }

  function sceneCompare(t) {
    show(sc.compare, live("compare", t));
    if (!live("compare", t)) return;
    reset(sc.compare);
    const s = E.dolly(prog(t, 15.3, 16.0));
    const scroll = lerp(0, compareBottom - compareTop, E.inOut(prog(t, 17.0, 19.2)));
    sc.compare.style.transform = `translateY(${((1 - s) * H).toFixed(2)}px)`;
    // the card is mounted centred; move it so its top sits at compareTop, then scroll
    cam(cm.compare, 0, compareTop - card.compare.y + scroll - 30 * E.in(prog(t, 19.6, 20.3)), 1);
    card.compare.api.seek(prog(t, 15.75, 19.4), { focus: E.inOut(prog(t, 19.2, 19.9)) });
  }

  function sceneSteps(t) {
    show(sc.steps, live("steps", t));
    if (!live("steps", t)) return;
    reset(sc.steps);
    sheet(sc.steps, t, 19.6, 20.3);
    card.steps.api.seek(prog(t, 19.95, 23.1), { step: t < 22.2 ? -1 : lerp(0, 3, E.inOut(prog(t, 22.2, 23.9))) });
    const out = E.in(prog(t, 23.9, 24.5));
    cam(cm.steps, -170 * out, 0, 1 + 0.02 * prog(t, 20.3, 23.9));
    sc.steps.style.opacity = (1 - out).toFixed(4);
  }

  function sceneDisplay(t) {
    show(sc.display, live("display", t));
    if (!live("display", t)) return;
    reset(sc.display);
    const p = E.glide(prog(t, 23.95, 24.75));
    op(sc.display, p);
    card.display.api.seek(prog(t, 24.1, 27.4));
    cam(cm.display, 170 * (1 - p), 0, 1 + 0.02 * prog(t, 24.5, 27.9));
  }

  function sceneSpecs(t) {
    show(sc.specs, live("specs", t));
    if (!live("specs", t)) return;
    reset(sc.specs);
    sheet(sc.specs, t, 27.2, 27.9);
    card.specs.api.seek(prog(t, 27.45, 29.35));
    const out = E.dolly(prog(t, 29.4, 30.1));
    cam(cm.specs, 0, -H * 0.4 * out, 1 + 0.015 * prog(t, 27.9, 29.4));
    sc.specs.style.opacity = (1 - E.in(prog(t, 29.7, 30.1))).toFixed(4);
  }

  function sceneEnd(t) {
    show(sc.end, live("end", t));
    if (!live("end", t)) return;
    reset(sc.end);
    const p = E.dolly(prog(t, 29.4, 30.1));
    sc.end.style.transform = `translateY(${((1 - p) * H * 0.6).toFixed(2)}px)`;
    card.end.api.seek(prog(t, 29.65, 32.0), { cta: E.glide(prog(t, 31.0, 32.2)), float: t });
    cam(cm.end, 0, 0, 1 + 0.015 * prog(t, 30.1, DURATION));
    enter(el.enPrice, t, 31.6, 0.8, 18);
    enter(el.enFine, t, 32.1, 0.8, 10);
  }

  /* ---------------------------------------------------------------- driver */

  function seek(t) {
    t = clamp(t, 0, DURATION);
    sceneHook(t);
    sceneReveal(t);
    sceneContacts(t);
    sceneSegments(t);
    sceneCompare(t);
    sceneSteps(t);
    sceneDisplay(t);
    sceneSpecs(t);
    sceneEnd(t);
  }

  const ready = (async () => {
    const faces = ['700 64px "Manrope"', '400 20px "DM Sans"', '500 20px "DM Sans"', '400 20px "JetBrains Mono"', '400 20px "Inter"'];
    await Promise.all(faces.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) => (img.complete ? null : new Promise((res) => (img.onload = img.onerror = res)))),
    );
    seek(0);
  })();

  window.film = { seek, ready, duration: DURATION, fps: FPS, width: W, height: H, format: FORMAT, card };

  /* ---------------------------------------------------------------- preview player */

  if (RENDER) return;
  const ui = { play: $("play"), scrub: $("scrub"), clock: $("clock") };
  ui.scrub.max = String(DURATION * FPS);
  let playing = true, t0 = null, tNow = 0;
  function fit() {
    const k = Math.min(innerWidth / W, (innerHeight - 76) / H);
    stage.style.transform = `translate(${(innerWidth - W * k) / 2}px, ${Math.max(8, (innerHeight - 76 - H * k) / 2)}px) scale(${k})`;
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
    ui.clock.textContent = tNow.toFixed(2);
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
  addEventListener("keydown", (e) => e.code === "Space" && ui.play.click());
  ready.then(() => requestAnimationFrame(frame));
})();
