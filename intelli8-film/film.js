/* intelli8 App — 30 second product film.
 *
 * Every frame is a pure function of time: seek(t) sets the whole picture, so the film previews in a
 * browser and renders frame-accurately (render.mjs drives window.film.seek).
 *
 * Beats
 *   0.0  Hook — "Same weight. Different story.": weight holds at 68.0 kg for six weeks while body
 *        fat falls and muscle rises
 *   4.6  Brand — the 8 draws itself, then becomes the app's welcome screen; Get started
 *   8.4  Measure — "Stand steady. Hold the bar. See more.": the scale's eight contacts light up
 *  12.0  Results — "Fat, muscle, every segment.": the body diagram fills, segment callouts
 *  15.6  Dashboard — "See your latest trends."
 *  19.2  Report — "The detail behind the summary.": 24 measures scroll; Save as PDF → coach
 *  23.2  Goals + History — two phones side by side
 *  26.6  End — "See what changed.", the app and the scale, where to get it
 */
(() => {
  "use strict";

  const QUERY = new URLSearchParams(location.search);
  const FORMAT = QUERY.get("format") || "16x9";
  const F = (window.I8_FORMATS || {})[FORMAT];
  if (!F) throw new Error(`Unknown format "${FORMAT}"`);
  const W = F.width;
  const H = F.height;
  const DURATION = 30;
  const FPS = 60;
  const RENDER = QUERY.has("render");
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
    return (p) => {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      let lo = 0, hi = 1, u = p;
      for (let i = 0; i < 40; i++) {
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
    out: (p) => 1 - (1 - p) ** 3,
    in: (p) => p ** 3,
    inOut: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
    sine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    glide: bezier(0.16, 1, 0.3, 1), // the house ease: long, soft settle
    dolly: bezier(0.72, 0, 0.16, 1), // camera moves
    sheet: bezier(0.66, 0, 0.24, 1), // panels rising
    pop: bezier(0.34, 1.4, 0.64, 1), // small overshoot
  };
  const tw = (t, t0, t1, a, b, e = E.glide) => lerp(a, b, e(prog(t, t0, t1)));

  /* ---------------------------------------------------------------- style helpers */

  const $ = (id) => document.getElementById(id);
  const op = (el, v) => (el.style.opacity = clamp(v).toFixed(4));
  const show = (el, on) => (el.style.display = on ? "block" : "none");
  const blur = (el, px) => (el.style.filter = px > 0.05 ? `blur(${px.toFixed(2)}px)` : "none");
  const move = (el, x, y, s = 1, extra = "") =>
    (el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})${extra}`);
  const at = (el, [x, y]) => Object.assign(el.style, { left: `${x}px`, top: `${y}px` });

  // A masked line rising into place (the site's headline reveal).
  function rise(el, t, t0, dur = 0.8, exitAt = 1e9, exitDur = 0.45) {
    const p = E.glide(prog(t, t0, t0 + dur));
    const q = E.in(prog(t, exitAt, exitAt + exitDur));
    const hgt = el.offsetHeight || 100;
    // 1.45 line heights clears descenders and their blur from the mask (1.15 left a smudge after an exit)
    el.style.transform = `translateY(${((1 - p) * 1.45 - q * 1.45) * hgt}px)`;
    blur(el, (1 - p) * 6 + q * 4);
  }
  // Fade + small lift.
  function enter(el, t, t0, dur = 0.7, dy = 24, exitAt = 1e9, exitDur = 0.4) {
    const p = E.glide(prog(t, t0, t0 + dur));
    const q = E.in(prog(t, exitAt, exitAt + exitDur));
    el.style.transform = `translateY(${((1 - p) * dy - q * dy).toFixed(2)}px)`;
    op(el, p * (1 - q));
  }

  /* ---------------------------------------------------------------- build */

  const stage = $("stage");
  Object.assign(stage.style, { width: `${W}px`, height: `${H}px` });

  const el = {
    hook: $("s-hook"), brand: $("s-brand"), measure: $("s-measure"), app: $("s-app"), end: $("s-end"),
    hkEye: $("hk-eye"), hkHead: $("hk-head"), hkL1: $("hk-l1"), hkL2: $("hk-l2"), hkCards: $("hk-cards"),
    brMark: $("br-mark"), brWord: $("br-word"), brCopy: $("br-copy"), brL1: $("br-l1"), brBody: $("br-body"),
    brEye: document.querySelector("#br-copy .eyebrow"),
    msCopy: $("ms-copy"), msL: [$("ms-l1"), $("ms-l2"), $("ms-l3")], msBody: $("ms-body"),
    msScale: $("ms-scale"), msContacts: $("ms-contacts"), msChip: $("ms-chip"),
    apCopy: $("ap-copy"), apCount: $("ap-count"), apCountN: $("ap-countn"), apCountLabel: document.querySelector("#ap-count span"), apCallouts: $("ap-callouts"),
    apCoach: $("ap-coach"), apPdf: $("ap-pdf"), apCap1: $("ap-cap1"), apCap2: $("ap-cap2"),
    enCopy: $("en-copy"), enL: [$("en-l1"), $("en-l2"), $("en-l3")], enLock: $("en-lock"), enStores: $("en-stores"),
    enPrice: $("en-price"), enScale: $("en-scale"), enFine: $("en-fine"),
    phMain: $("ph-main"), phGoals: $("ph-goals"), phHist: $("ph-hist"), phEnd: $("ph-end"),
    wipe: $("wipe"), tap: $("tap"),
  };

  // Static layout from the format.
  at(el.hkEye, F.hook.eyebrow);
  at(el.hkHead, F.hook.head);
  el.hkHead.style.setProperty("--hsize", `${F.hook.headSize}px`);
  // Hook: Week 1 and Week 6 cards, each with the app's segment figure (geometry from screens/results.js,
  // in screen points). Orange = fat-led segment, green = muscle-led, as in the app's Segmental Analysis.
  const HSEGS = [
    { x: 84.5, y: 291.5, w: 48, h: 65.25, rx: 7 }, // trunk
    { x: 55.75, y: 293.75, w: 24, h: 53.5, rx: 10 }, // left arm
    { x: 137.25, y: 293.75, w: 24, h: 53.5, rx: 10 }, // right arm
    { x: 83.75, y: 370, w: 20.5, h: 83.5, rx: 9.5 }, // left leg
    { x: 112.75, y: 370, w: 20.5, h: 83.5, rx: 9.5 }, // right leg
  ];
  const FIG_S = F.hook.cards.fig || 1.85; // figure scale (pt → px)
  // An illustrative person, deliberately not the app's demo user (Alex, 72.40 kg, whose weight falls over these
  // weeks in History): the same weight, about 1.1 kg of fat swapped for 1.1 kg of muscle.
  const HOOK = { kg: "68.0", fat: [24.8, 23.2], mus: [48.2, 49.3] };
  const hcard = (week, fat, mus, arrows) => {
    const c = document.createElement("div");
    c.className = "hcard";
    c.style.width = `${F.hook.cards.w}px`;
    c.innerHTML =
      `<i class="ring"></i>` +
      `<div class="wtop"><span class="mono">Week ${week}</span><span class="mono dim">Weight</span></div>` +
      `<div class="wnum"><b>${HOOK.kg}</b><span>kg</span></div>` +
      `<svg class="hfig" width="${(117 * FIG_S).toFixed(1)}" height="${(210 * FIG_S).toFixed(1)}" viewBox="50 248 117 210">` +
      `<rect class="neutral" x="103.5" y="278" width="10" height="16" rx="2"/>` +
      `<rect class="neutral" x="84.5" y="345" width="48" height="25.5" rx="5"/>` +
      `<ellipse class="neutral" cx="108.75" cy="266.5" rx="13.75" ry="14"/>` +
      HSEGS.map((g) => `<rect class="seg" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="${g.rx}"/>`).join("") +
      `</svg>` +
      `<div class="wrows">` +
      `<div class="wrow"><span>Body fat</span><b>${fat}</b><i>${arrows ? "▼" : ""}</i></div>` +
      `<div class="wrow"><span>Muscle</span><b>${mus}</b><i>${arrows ? "▲" : ""}</i></div>` +
      `</div>`;
    el.hkCards.appendChild(c);
    return {
      c, ring: c.querySelector(".ring"), segs: Array.from(c.querySelectorAll(".seg")),
      vals: Array.from(c.querySelectorAll(".wrow b")), arrows: Array.from(c.querySelectorAll(".wrow i")),
    };
  };
  const hkA = hcard(1, `${HOOK.fat[0]}%`, `${HOOK.mus[0]} kg`, false);
  const hkB = hcard(6, `${HOOK.fat[0]}%`, `${HOOK.mus[0]} kg`, true);
  const hkSame = document.createElement("div");
  hkSame.className = "hsame";
  hkSame.textContent = "=";
  el.hkCards.appendChild(hkSame);
  const hkKey = document.createElement("div");
  hkKey.className = "hkey";
  hkKey.innerHTML = `<span><i class="fat"></i>Fat-led segment</span><span><i class="lean"></i>Muscle-led segment</span>`;
  el.hkCards.appendChild(hkKey);
  {
    const { x, y, w, gap } = F.hook.cards;
    at(el.hkCards, [x, y]);
    hkB.c.style.left = `${w + gap}px`;
    hkA.c.style.left = "0px";
    const numY = hkA.c.querySelector(".wnum b").offsetTop + 34; // the numbers' visual middle
    at(hkSame, [w + gap / 2 - 32, numY]);
    el.hkCards.style.width = `${2 * w + gap}px`;
    el.hkCards.style.height = `${hkA.c.offsetHeight}px`;
    Object.assign(hkKey.style, { top: `${hkA.c.offsetHeight + 26}px`, width: `${2 * w + gap}px` });
  }
  at(el.brCopy, F.brand.copy);
  el.brCopy.style.width = `${F.brand.copyWidth}px`;
  el.brBody.style.marginTop = "30px";
  el.brEye.style.marginBottom = "26px";
  Object.assign(el.msScale.style, { left: `${F.measure.scale.x}px`, top: `${F.measure.scale.y}px`, width: `${F.measure.scale.w}px` });
  at(el.msChip, F.measure.chip);
  at(el.apCopy, F.app.copy);
  el.apCopy.style.width = `${F.app.copyWidth}px`;
  at(el.apCount, F.app.counter);
  at(el.apCoach, F.app.coach);
  at(el.apCap1, F.pair.cap1);
  at(el.apCap2, F.pair.cap2);
  at(el.enCopy, F.end.copy);
  Object.assign(el.enScale.style, { left: `${F.end.scale.x}px`, top: `${F.end.scale.y}px`, width: `${F.end.scale.w}px` });
  at(el.enFine, F.end.fine);

  // The big 8 and the small one in the end lockup.
  el.brMark.innerHTML = I8.logo8({ id: "big", size: F.brand.markSize });
  const bigSvg = el.brMark.querySelector("svg");
  const markH = (F.brand.markSize * 186) / 128;
  at(el.brMark, [F.brand.mark[0] - F.brand.markSize / 2, F.brand.mark[1] - markH / 2]);
  el.brMark.style.transformOrigin = "50% 50%";
  el.brWord.style.left = `${F.brand.word[0]}px`;
  el.brWord.style.top = `${F.brand.word[1]}px`;
  document.querySelector("#en-lock .badge8").innerHTML = `intelli${I8.logo8({ id: "lock", size: 40 })}`;
  I8.logo8Draw(document.querySelector("#en-lock .logo8"), 1, 1);

  // Scale contacts (fractions of the scale image): four foot plates, then two per handle pad.
  const CONTACTS = [
    [0.401, 0.451], [0.801, 0.593], [0.208, 0.645], [0.623, 0.804],
    [0.622, 0.078], [0.662, 0.093], [0.736, 0.114], [0.776, 0.128],
  ];
  const CONTACT_AT = [0, 0.1, 0.22, 0.3, 0.52, 0.59, 0.71, 0.77]; // seconds after the first (audio/sound.py)
  // Your Results builds over this window (s); its five segments light at 0.25 + 0.09 i of it (audio/sound.py).
  const RESULTS = [12.15, 14.55];
  const dots = CONTACTS.map(([fx, fy]) => {
    const i = document.createElement("i");
    i.style.left = `${fx * 100}%`;
    i.style.top = `${fy * 100}%`;
    el.msContacts.appendChild(i);
    return i;
  });

  // App copy for each beat (built here so the beats can overlap in time).
  const COPY = {
    results: { eye: "Segmental body mapping", lines: ["Fat, muscle,", "every segment."], green: 1,
      body: "Eight electrodes read both arms, both legs and your trunk." },
    dash: { eye: "01 · Dashboard", lines: ["See your", "latest trends."], green: -1,
      body: "Weight, body fat and muscle come together the moment you open the app." },
    report: { eye: "Report detail · 24 measures", lines: ["The detail behind", "the summary."], green: -1, body: "" },
  };
  el.apCopy.innerHTML = "";
  const copyEls = {};
  for (const [k, c] of Object.entries(COPY)) {
    const box = document.createElement("div");
    box.style.position = "absolute";
    box.style.width = `${F.app.copyWidth}px`;
    box.innerHTML =
      `<div class="eyebrow">${c.eye}</div>` +
      `<div class="headline sm">${c.lines.map((l, i) => `<span class="mask"><span class="${i === c.green ? "green" : ""}">${l}</span></span>`).join("")}</div>` +
      (c.body ? `<p class="body">${c.body}</p>` : "");
    el.apCopy.appendChild(box);
    copyEls[k] = {
      eye: box.querySelector(".eyebrow"),
      lines: Array.from(box.querySelectorAll(".mask > span")),
      body: box.querySelector(".body"),
    };
  }

  // Segment callouts beside the phone during Results.
  const SEGMENTS = [
    ["Left arm", "3.2 kg", "14.2% fat", false],
    ["Right arm", "3.1 kg", "14.8% fat", false],
    ["Trunk", "28.4 kg", "19.1% fat", true],
    ["Left leg", "9.8 kg", "20.3% fat", false],
    ["Right leg", "9.6 kg", "21.1% fat", false],
  ];
  const callouts = SEGMENTS.map(([name, kg, fat, lean], i) => {
    const c = document.createElement("div");
    c.className = "callout";
    c.innerHTML = `<i class="dot${lean ? " lean" : ""}"></i><span>${name}</span><b>${kg}</b><em class="${lean ? "lean" : ""}">${fat}</em>`;
    c.style.left = `${F.app.callouts.x}px`;
    c.style.top = `${F.app.callouts.y + i * F.app.callouts.gap}px`;
    el.apCallouts.appendChild(c);
    return c;
  });

  /* ---------------------------------------------------------------- phones & screens */

  const PH = { w: 418, h: 872, pad: 14 };
  function makeScreens(host, names) {
    const out = {};
    for (const n of names) {
      const root = document.createElement("div");
      root.className = "app";
      host.appendChild(root);
      const make = I8.screens[n];
      if (make) out[n] = { root, api: make(root, I8.h) };
      else {
        root.innerHTML = `<div style="display:grid;place-items:center;height:100%;font:600 22px Inter;color:#999">${n}</div>`;
        out[n] = { root, api: { seek() {} } };
      }
    }
    return out;
  }
  // Screens measure their SVG paths as they build, which needs the phones rendered (seek hides them).
  for (const ph of document.querySelectorAll(".phone")) ph.style.display = "block";
  const main = makeScreens($("ph-main-screen"), ["welcome", "results", "dashboard", "report"]);
  const goals = makeScreens($("ph-goals-screen"), ["goals"]).goals;
  const hist = makeScreens($("ph-hist-screen"), ["history"]).history;
  const endScr = makeScreens($("ph-end-screen"), ["dashboard"]).dashboard;

  function placePhone(ph, { x, y, s = 1, o = 1, r = 0, ry = 0 }) {
    show(ph, o > 0.002);
    if (o <= 0.002) return;
    op(ph, o);
    ph.style.transform =
      `translate(${(x - PH.w / 2).toFixed(2)}px, ${(y - PH.h / 2).toFixed(2)}px) ` +
      (ry ? `perspective(2600px) rotateY(${ry.toFixed(3)}deg) ` : "") +
      `rotate(${r.toFixed(3)}deg) scale(${s.toFixed(5)})`;
  }
  // A point on the phone's screen (screen pt) → stage px, for an unrotated phone placed at (x, y, s).
  const onStage = (pose, sx, sy) => [
    pose.x + (sx + PH.pad - PH.w / 2) * pose.s,
    pose.y + (sy + PH.pad - PH.h / 2) * pose.s,
  ];

  // iOS push: `from` slides left and dims, `to` slides in from the right.
  function push(from, to, p) {
    const e = E.dolly(p);
    from.root.style.transform = `translateX(${(-30 * e).toFixed(2)}%)`;
    from.root.style.filter = e > 0.01 ? `brightness(${(1 - 0.12 * e).toFixed(3)})` : "none";
    to.root.style.transform = `translateX(${(100 * (1 - e)).toFixed(2)}%)`;
    to.root.style.boxShadow = e < 1 ? "-20px 0 40px rgba(0,0,0,0.12)" : "none";
  }

  /* ---------------------------------------------------------------- scenes */

  // Segment colours: fat-led (orange) → muscle-led (green), from the app's palette (screens/app.css).
  // (a little deeper than the app's fills, so the change reads at a glance)
  const SEG_FAT = { fill: [244, 214, 180], stroke: [196, 135, 75] };
  const SEG_LEAN = { fill: [196, 230, 207], stroke: [62, 149, 92] };
  const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(",")})`;
  function paintSeg(r, k, filled = 1) {
    r.style.fill = mix([251, 250, 246], mix(SEG_FAT.fill, SEG_LEAN.fill, k).match(/\d+/g).map(Number), filled);
    r.style.stroke = mix([217, 215, 207], mix(SEG_FAT.stroke, SEG_LEAN.stroke, k).match(/\d+/g).map(Number), filled);
  }
  // Week 6: four of five segments turn muscle-led as "Different story." lands (uneven, like real progress).
  const FLIP_AT = [1.98, 2.17, 2.31, 2.52, null]; // trunk, left arm, right arm, left leg; right leg stays
  function sceneHook(t) {
    const on = t < 4.8;
    show(el.hook, on);
    if (!on) return;
    const exit = prog(t, 4.2, 4.75);
    el.hook.style.transform = `translateY(${(-120 * E.in(exit)).toFixed(2)}px)`;
    op(el.hook, 1 - E.in(exit) * 0.6);

    enter(el.hkEye, t, 0.05, 0.6, 16);
    rise(el.hkL1, t, 0.4);
    rise(el.hkL2, t, 1.9);
    // Week 1 opens centred on the frame, then glides right to make room for the headline; a slow push
    // on the pair of cards runs through the whole beat.
    const { x: cx, w: cw } = F.hook.cards;
    const centred = W / 2 - (cx + cw / 2);
    const glide = E.dolly(prog(t, 0.15, 0.95));
    el.hkCards.style.transform =
      `translateX(${(centred * (1 - glide)).toFixed(2)}px) scale(${lerp(1, 1.035, E.sine(prog(t, 0, 4.2))).toFixed(5)})`;

    // Week 1 is on screen from the first frame (the feed shows frame 0); its body fills in at once.
    const pa = E.glide(prog(t, -0.3, 0.6));
    hkA.c.style.transform = `translateY(${((1 - pa) * 40).toFixed(2)}px)`;
    op(hkA.c, lerp(0.75, 1, pa) * (1 - 0.25 * E.inOut(prog(t, 2.0, 2.6))));
    hkA.segs.forEach((r, i) => paintSeg(r, 0, E.out(prog(t, -0.45 + i * 0.07, -0.1 + i * 0.07))));

    // Week 6 slides in beside it: the same weight.
    const pb = E.glide(prog(t, 0.75, 1.45));
    hkB.c.style.transform = `translateX(${((1 - pb) * 90).toFixed(2)}px)`;
    op(hkB.c, pb);
    const ps = E.pop(prog(t, 1.22, 1.52));
    hkSame.style.transform = `scale(${ps.toFixed(4)})`;
    op(hkSame, clamp(ps * 2) * (1 - 0.7 * E.inOut(prog(t, 2.0, 2.6))));

    // …and underneath, it changes.
    hkB.segs.forEach((r, i) => {
      const k = FLIP_AT[i] === null ? 0 : E.inOut(prog(t, FLIP_AT[i], FLIP_AT[i] + 0.32));
      paintSeg(r, k, 1);
      const pop = FLIP_AT[i] === null ? 0 : Math.sin(Math.PI * prog(t, FLIP_AT[i], FLIP_AT[i] + 0.32));
      r.style.transform = `scale(${(1 + 0.07 * pop).toFixed(4)})`;
    });
    const pv = E.inOut(prog(t, 1.98, 2.85));
    hkB.vals[0].textContent = `${lerp(HOOK.fat[0], HOOK.fat[1], pv).toFixed(1)}%`;
    hkB.vals[1].textContent = `${lerp(HOOK.mus[0], HOOK.mus[1], pv).toFixed(1)} kg`;
    hkB.arrows.forEach((a) => op(a, prog(t, 2.55, 2.85)));
    op(hkB.ring, 0.55 * E.inOut(prog(t, 2.0, 2.6)));
    enter(hkKey, t, 2.6, 0.6, 10);
  }

  function sceneBrand(t) {
    const on = t >= 4.15 && t < 8.7;
    show(el.brand, on);
    show(el.brMark, t >= 4.15 && t < 6.8); // outside the brand section now, so hidden explicitly
    if (!on) return;
    // The sage sheet rises over the hook.
    el.brand.style.transform = `translateY(${lerp(H + 20, 0, E.sheet(prog(t, 4.15, 4.75))).toFixed(2)}px)`;

    // The 8 draws, the wordmark settles, then the mark flies into the phone's welcome screen.
    I8.logo8Draw(bigSvg, E.inOut(prog(t, 4.75, 5.85)), prog(t, 5.6, 5.95));
    const pose = F.brand.phone;
    const fly = E.dolly(prog(t, 6.0, 6.75));
    const [tx, ty] = onStage(pose, 195, 350); // the welcome screen's mark centre (measured)
    const s = lerp(1, (96 * pose.s) / F.brand.markSize, fly);
    move(el.brMark, (tx - F.brand.mark[0]) * fly, (ty - F.brand.mark[1]) * fly, s);
    op(el.brMark, 1 - prog(t, 6.62, 6.78));
    const pw = E.glide(prog(t, 5.35, 5.95));
    el.brWord.style.transform = `translate(-50%, ${((1 - pw) * 26 - 40 * E.in(prog(t, 5.95, 6.3))).toFixed(2)}px)`;
    op(el.brWord, pw * (1 - prog(t, 5.95, 6.25)));

    // Copy.
    enter(el.brEye, t, 6.55, 0.7, 14);
    rise(el.brL1, t, 6.7);
    enter(el.brBody, t, 7.0, 0.7, 18);
  }

  const MEASURE_ON = 8.55;
  function sceneMeasure(t) {
    const on = t >= MEASURE_ON - 0.05 && t < 12.4;
    show(el.measure, on);
    if (!on) return;
    const exit = E.dolly(prog(t, 11.75, 12.35));
    el.measure.style.transform = `translateY(${(-H * exit).toFixed(2)}px)`;

    el.msL.forEach((n, i) => rise(n, t, 8.7 + i * 0.16));
    enter(el.msBody, t, 9.35, 0.8, 18);

    const ps = E.glide(prog(t, 8.6, 9.6));
    el.msScale.style.transform = `translateY(${((1 - ps) * 90 - exit * 140).toFixed(2)}px)`;
    op(el.msScale, ps);
    // Feet first, then hands, in two uneven groups (no even pulse); each pops, then breathes.
    dots.forEach((d, i) => {
      const t0 = 9.55 + CONTACT_AT[i];
      const p = prog(t, t0, t0 + 0.35);
      const breathe = 1 + 0.12 * Math.sin((t - t0) * 6) * prog(t, t0 + 0.35, t0 + 0.6);
      d.style.transform = `scale(${(E.pop(p) * breathe).toFixed(4)})`;
      op(d, p);
    });
    enter(el.msChip, t, 10.75, 0.7, 20);
  }

  const welcomeMark = main.welcome.root.querySelector(".mark");
  // The big 8 flies into the phone, so it travels on its own layer above the phones (film.css #br-mark).
  stage.appendChild(el.brMark);

  // Main phone: welcome (brand) → results → dashboard → report.
  function sceneMainPhone(t) {
    const S = main;
    for (const k in S) show(S[k].root, false);
    if (t < 6.0 || t >= 23.7 || (t >= 8.6 && t < 11.9)) {
      placePhone(el.phMain, { x: 0, y: 0, o: 0 });
      return;
    }
    if (t < 8.6) {
      // Brand: fades in as the mark lands, then the tap on Get started.
      const pose = F.brand.phone;
      const p = E.glide(prog(t, 6.05, 6.75));
      placePhone(el.phMain, { ...pose, s: pose.s * lerp(0.92, 1, p), o: p });
      show(S.welcome.root, true);
      S.welcome.root.style.transform = "none";
      S.welcome.api.seek(lerp(0.62, 1, prog(t, 6.2, 7.2)), { press: prog(t, 7.78, 8.02) });
      // The screen's own 8 takes over exactly as the flying mark lands (sceneBrand fades it 6.62–6.78),
      // so there is only ever one 8 on screen.
      welcomeMark.style.opacity = prog(t, 6.62, 6.78).toFixed(4);
      return;
    }
    // App section.
    const pose = F.app.phone;
    const pin = E.glide(prog(t, 11.95, 12.75));
    const [x0, x1] = F.app.exitT || [23.15, 23.65]; // a format may leave a little earlier if the pair shares its column
    const out = E.in(prog(t, x0, x1));
    placePhone(el.phMain, {
      x: pose.x + out * (F.app.exit || [-900, 0])[0], // leaves for Goals + History (format: away from the pair)
      y: pose.y + (1 - pin) * 260 + out * (F.app.exit || [-900, 0])[1],
      s: pose.s * lerp(0.94, 1, pin),
      o: E.out(prog(t, 11.95, 12.25)), // opaque early: a phone slides in, it doesn't ghost in
      r: lerp(-2.5, 0, pin) - out * 6,
    });
    if (t < 15.5) {
      show(S.results.root, true);
      S.results.root.style.transform = "none";
      S.results.root.style.filter = "none";
      S.results.api.seek(prog(t, RESULTS[0], RESULTS[1]), { seg: -1, press: prog(t, 15.2, 15.45) });
    } else if (t < 15.9) {
      show(S.results.root, true);
      show(S.dashboard.root, true);
      S.results.api.seek(1, {});
      S.dashboard.api.seek(prog(t, 15.55, 18.2), {});
      push(S.results, S.dashboard, prog(t, 15.5, 15.9));
    } else if (t < 19.0) {
      show(S.dashboard.root, true);
      S.dashboard.root.style.transform = "none";
      S.dashboard.root.style.boxShadow = "none";
      S.dashboard.api.seek(prog(t, 15.55, 18.2), { press: prog(t, 18.7, 18.95) });
    } else if (t < 19.4) {
      show(S.dashboard.root, true);
      show(S.report.root, true);
      S.dashboard.api.seek(1, {});
      S.report.api.seek(prog(t, 19.1, 20.2), { scroll: 0 });
      push(S.dashboard, S.report, prog(t, 19.0, 19.4));
    } else {
      show(S.report.root, true);
      S.report.root.style.transform = "none";
      S.report.root.style.boxShadow = "none";
      const max = S.report.api.maxScroll || 1500;
      S.report.api.seek(prog(t, 19.1, 20.2), {
        scroll: max * E.inOut(prog(t, 19.9, 22.0)),
        press: prog(t, 22.15, 22.4),
      });
    }
  }

  function sceneApp(t) {
    const on = t >= 11.7 && t < 26.9;
    show(el.app, on);
    if (!on) return;
    const exit = E.in(prog(t, 26.4, 26.85));
    op(el.app, 1 - exit);

    // Copy blocks: in, then out as the next beat starts.
    const beats = [["results", 12.35, 15.5], ["dash", 15.75, 18.95], ["report", 19.35, 23.1]];
    for (const [k, t0, t1] of beats) {
      const c = copyEls[k];
      enter(c.eye, t, t0, 0.6, 14, t1, 0.35);
      c.lines.forEach((n, i) => rise(n, t, t0 + 0.1 + i * 0.12, 0.8, t1 + i * 0.05, 0.4));
      if (c.body) enter(c.body, t, t0 + 0.45, 0.7, 18, t1, 0.35);
    }

    // Results: one callout per segment, in the order the diagram fills.
    callouts.forEach((c, i) => {
      const t0 = lerp(RESULTS[0], RESULTS[1], 0.25 + i * 0.09);
      const p = E.glide(prog(t, t0, t0 + 0.6));
      const q = E.in(prog(t, 15.3 + i * 0.04, 15.65 + i * 0.04));
      c.style.transform = `translateX(${((1 - p) * -60 + q * 60).toFixed(2)}px)`;
      op(c, p * (1 - q));
    });

    // Report: the measure counter, then the PDF goes to the coach.
    const pc = prog(t, 19.9, 22.0);
    enter(el.apCount, t, 19.75, 0.6, 20, 23.05, 0.35);
    const measures = Math.round(24 * E.sine(pc));
    el.apCountN.textContent = String(measures);
    el.apCountLabel.textContent = measures === 1 ? "measure" : "measures";
    const pf = prog(t, 22.4, 23.0);
    show(el.apPdf, pf > 0 && pf < 1);
    if (pf > 0 && pf < 1) {
      const pose = F.app.phone;
      const [sx, sy] = onStage(pose, 290, 700);
      const e = E.dolly(pf);
      const tx = F.app.coach[0] + 30, ty = F.app.coach[1] - 40;
      const x = lerp(sx, tx, e), y = lerp(sy, ty, e) - Math.sin(Math.PI * e) * 160;
      el.apPdf.style.left = `${(x - F.app.coach[0] - 75).toFixed(2)}px`;
      el.apPdf.style.top = `${(y - F.app.coach[1] - 98).toFixed(2)}px`;
      el.apPdf.style.transform = `scale(${lerp(0.5, 0.42, e) * (1 + Math.sin(Math.PI * e) * 0.5)}) rotate(${lerp(-4, 8, e)}deg)`;
    }
    enter(el.apCoach, t, 22.8, 0.6, 20, 23.25, 0.35);

    // Goals + History.
    const pg = E.glide(prog(t, 23.35, 24.15));
    const ph = E.glide(prog(t, 23.55, 24.35));
    const gp = F.pair.goals, hp = F.pair.hist;
    const og = E.out(prog(t, 23.35, 23.62)), oh = E.out(prog(t, 23.55, 23.82));
    placePhone(el.phGoals, { x: gp.x, y: gp.y + (1 - pg) * 320 + exit * 40, s: gp.s, o: og * (1 - exit), r: lerp(4, 0, pg) });
    placePhone(el.phHist, { x: hp.x, y: hp.y + (1 - ph) * 320 + exit * 40, s: hp.s, o: oh * (1 - exit), r: lerp(-4, 0, ph) });
    if (pg > 0) goals.api.seek(prog(t, 23.45, 25.2), {});
    if (ph > 0) hist.api.seek(prog(t, 23.65, 25.7), {});
    enter(el.apCap1, t, 23.75, 0.7, 20, 26.3, 0.3);
    enter(el.apCap2, t, 23.95, 0.7, 20, 26.3, 0.3);
  }

  function sceneEnd(t) {
    const on = t >= 26.4;
    show(el.end, on);
    placePhone(el.phEnd, { x: 0, y: 0, o: 0 });
    if (!on) return;
    op(el.end, E.out(prog(t, 26.4, 26.8)));
    enter(el.enLock, t, 26.6, 0.7, 16);
    el.enL.forEach((n, i) => rise(n, t, 26.75 + i * 0.14));
    enter(el.enStores, t, 27.6, 0.7, 20);
    enter(el.enPrice, t, 27.85, 0.7, 14);
    enter(el.enFine, t, 28.1, 0.8, 10);
    const pp = E.glide(prog(t, 26.7, 27.6));
    const pose = F.end.phone;
    placePhone(el.phEnd, { x: pose.x, y: pose.y + (1 - pp) * 200, s: pose.s * (1 + 0.025 * prog(t, 27.6, 30)), o: pp });
    endScr.api.seek(1, {});
    const psc = E.glide(prog(t, 27.0, 27.9));
    el.enScale.style.transform = `translateY(${((1 - psc) * 80).toFixed(2)}px)`;
    op(el.enScale, psc);
  }

  // Tap ripple (the welcome button) and the dark wipe that opens out of it into Measure.
  function sceneTransitions(t) {
    const pose = F.brand.phone;
    const [bx, by] = onStage(pose, 195, 744);
    const pt = prog(t, 7.78, 8.15);
    show(el.tap, pt > 0 && pt < 1);
    if (pt > 0 && pt < 1) {
      el.tap.style.left = `${bx}px`;
      el.tap.style.top = `${by}px`;
      el.tap.style.transform = `scale(${lerp(0.3, 1.4, E.out(pt)).toFixed(4)})`;
      op(el.tap, Math.sin(Math.PI * pt) * 0.9);
    }
    const pw = prog(t, 8.02, 8.62);
    show(el.wipe, pw > 0 && t < MEASURE_ON + 0.08);
    if (pw > 0) {
      const e = E.dolly(pw);
      const bw = 346 * pose.s, bh = 56 * pose.s;
      const r = { x: lerp(bx - bw / 2, 0, e), y: lerp(by - bh / 2, 0, e), w: lerp(bw, W, e), h: lerp(bh, H, e) };
      Object.assign(el.wipe.style, {
        left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`,
        borderRadius: `${lerp(14 * pose.s, 0, e)}px`,
        background: `color-mix(in srgb, #295976 ${((1 - E.out(pw)) * 100).toFixed(1)}%, #232c2b)`,
      });
    }
  }

  /* ---------------------------------------------------------------- driver */

  function seek(t) {
    t = clamp(t, 0, DURATION);
    for (const ph of [el.phMain, el.phGoals, el.phHist, el.phEnd]) show(ph, false); // scenes show their own
    sceneHook(t);
    sceneBrand(t);
    sceneMeasure(t);
    sceneApp(t);
    sceneMainPhone(t);
    sceneEnd(t);
    sceneTransitions(t);
  }

  const ready = (async () => {
    const faces = ['700 64px "Manrope"', '400 20px "DM Sans"', '400 20px "JetBrains Mono"', '400 20px "Inter"', '600 20px "Inter"', '300 20px "Inter"'];
    await Promise.all(faces.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
    await new Promise((res) => {
      const img = new Image();
      img.onload = img.onerror = res;
      img.src = "assets/scale.png";
    });
    seek(0);
  })();

  window.film = { seek, ready, duration: DURATION, fps: FPS, width: W, height: H, format: FORMAT };

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
