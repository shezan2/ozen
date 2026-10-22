/* intelli8 IAM (Athlete Management) — 30 second product film for the team platform.
 *
 * Every frame is a pure function of time: seek(t) sets the whole picture (render.mjs --film iam drives
 * window.film.seek). The dashboard is rebuilt in iam/ (shell + one file per view) and shown in a window;
 * a cursor clicks between the views.
 *
 * Beats
 *   0.0  Hook — "Twenty athletes. Who needs a check-in today?": a squad of chips takes its readiness colours
 *   3.6  IAM — "See the whole team, support each person." The dashboard rises
 *   7.4  Command center
 *  11.0  Match readiness (clicked in the sidebar)
 *  14.6  Roster: WHOOP and Polar ready
 *  18.2  An athlete's personal HRV baseline (clicked in the roster)
 *  21.8  Sleep need versus actual
 *  25.4  End — Discuss IAM / Talk to WAAHA Labs, and the responsible-use line
 */
(() => {
  "use strict";

  const QUERY = new URLSearchParams(location.search);
  const FORMAT = QUERY.get("format") || "16x9";
  if (FORMAT !== "16x9") throw new Error(`The IAM film has no "${FORMAT}" layout yet`);
  const W = 1920;
  const H = 1080;
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
    out: (p) => 1 - (1 - p) ** 3,
    in: (p) => p ** 3,
    inOut: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
    sine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    glide: bezier(0.16, 1, 0.3, 1),
    dolly: bezier(0.72, 0, 0.16, 1),
    sheet: bezier(0.66, 0, 0.24, 1),
    pop: bezier(0.34, 1.4, 0.64, 1),
  };

  /* ---------------------------------------------------------------- style helpers */

  const $ = (id) => document.getElementById(id);
  const op = (el, v) => (el.style.opacity = clamp(v).toFixed(4));
  const show = (el, on) => (el.style.display = on ? "block" : "none");
  const blurf = (px) => (px > 0.05 ? `blur(${px.toFixed(2)}px)` : "none");
  function rise(el, t, t0, dur = 0.8, exitAt = 1e9, exitDur = 0.45) {
    const p = E.glide(prog(t, t0, t0 + dur));
    const q = E.in(prog(t, exitAt, exitAt + exitDur));
    const hgt = el.offsetHeight || 100;
    // 1.45 line heights clears descenders and their blur from the mask (1.15 left a smudge after an exit)
    el.style.transform = `translateY(${((1 - p) * 1.45 - q * 1.45) * hgt}px)`;
    el.style.filter = blurf((1 - p) * 6 + q * 4);
  }
  function enter(el, t, t0, dur = 0.7, dy = 24, exitAt = 1e9, exitDur = 0.4) {
    const p = E.glide(prog(t, t0, t0 + dur));
    const q = E.in(prog(t, exitAt, exitAt + exitDur));
    el.style.transform = `translateY(${((1 - p) * dy - q * dy).toFixed(2)}px)`;
    el.style.filter = blurf((1 - p) * 4 + q * 3);
    op(el, p * (1 - q));
  }

  /* ---------------------------------------------------------------- build */

  const stage = $("stage");
  const sc = { hook: $("s-hook"), iam: $("s-iam"), end: $("s-end") };
  for (const s of Object.values(sc)) show(s, true); // laid out while building (panes measure paths)

  const el = {
    hkEye: document.querySelector("#hk-copy .eyebrow"), hkL: [$("hk-l1"), $("hk-l2"), $("hk-l3")],
    hkGrid: $("hk-grid"), hkTag: $("hk-tag"),
    inCopy: $("in-copy"), inEye: document.querySelector("#in-copy .eyebrow"),
    inL: [$("in-l1"), $("in-l2"), $("in-l3"), $("in-l4")], inBody: $("in-body"),
    views: $("views"), win: $("win"), screen: $("win-screen"), cursor: $("cursor"),
    ring: document.querySelector("#cursor .ring"), cap: $("win-cap"),
    enLock: $("en-lock"), enL: [$("en-l1"), $("en-l2")], enCtas: $("en-ctas"), enSite: $("en-site"), enFine: $("en-fine"),
  };
  document.querySelector("#en-lock .badge8").innerHTML = `intelli${I8.logo8({ id: "end", size: 40 })}`;
  I8.logo8Draw(document.querySelector("#en-lock .logo8"), 1, 1);

  // Hook: twenty athletes, coloured by readiness tier (8 ready, 10 manage carefully, 1 consider resting,
  // 1 without recent data), matching the Match Readiness view.
  const SQUAD = [
    ["MR", "go"], ["JL", "care"], ["LB", "go"], ["TF", "care"], ["MS", "care"],
    ["NV", "care"], ["OH", "go"], ["HL", "rest"], ["BH", "care"], ["AM", "go"],
    ["SV", "go"], ["LC", "care"], ["GM", "none"], ["FK", "care"], ["ER", "go"],
    ["RA", "care"], ["KD", "go"], ["DW", "care"], ["PE", "care"], ["JP", "go"],
  ];
  const HUGO = 7;
  const chips = SQUAD.map(([ini, tier], i) => {
    const c = document.createElement("div");
    c.className = `chip ${tier}`;
    c.innerHTML = `<i class="ring"></i><span>${ini}</span>`;
    const col = i % 5, row = Math.floor(i / 5);
    Object.assign(c.style, { left: `${col * 140}px`, top: `${row * 140}px` });
    el.hkGrid.appendChild(c);
    return { c, ring: c.querySelector(".ring"), col, row };
  });
  const gridX = 1060, gridY = 250;
  // A tooltip under Hugo's chip (column 2, row 1), centred on it.
  const tagW = el.hkTag.offsetWidth || 330;
  Object.assign(el.hkTag.style, { left: `${gridX + 2 * 140 + 52 - tagW / 2}px`, top: `${gridY + 1 * 140 + 104 + 22}px`, zIndex: "3" });

  // The dashboard views, each a full IAM shell in the window.
  const VIEWS = [
    { pane: "command", active: "Dashboard", eye: "01 · Command center", lines: ["One view of", "the group."],
      body: "Readiness and recovery signals together, to see where a closer look may help." },
    { pane: "readiness", active: "Match Readiness", eye: "02 · Match readiness", lines: ["Readiness,", "at a glance."],
      body: "Athletes grouped by their last two days of health and recovery data." },
    { pane: "roster", active: "Roster", eye: "03 · Wearable sources", lines: ["WHOOP and", "Polar ready."],
      body: "Integration-ready, and built to scale to more wearables where authorized access is available." },
    { pane: "athlete", active: "Roster", eye: "04 · Personal context", lines: ["A personal", "HRV baseline."],
      body: "Compare HRV and resting heart rate with a person’s own recent trends." },
    { pane: "sleep", active: "Roster", eye: "05 · Sleep and recovery", lines: ["Sleep need", "versus actual."],
      body: "Sleep patterns, recovery indicators and recent training load, together." },
  ];
  // [view start, view end] (s); a view's pane builds over [start + 0.05, build end].
  const SPANS = [[7.4, 11.0], [11.0, 14.6], [14.6, 18.2], [18.2, 21.8], [21.8, 25.5]];
  const BUILD = [[4.6, 9.4], [11.05, 13.7], [14.65, 17.0], [18.25, 20.6], [21.85, 24.3]];

  for (const v of VIEWS) {
    const root = document.createElement("div");
    el.screen.appendChild(root);
    const pane = I8.iam.shell(root, { active: v.active });
    const make = I8.iam.panes[v.pane];
    let api = null;
    if (make) {
      try {
        api = make(pane, I8.h);
      } catch (e) {
        console.error(`pane ${v.pane}:`, e);
      }
    }
    if (!api) {
      pane.innerHTML = `<div class="placeholder">${v.pane}</div>`;
      api = { seek() {} };
    }
    v.root = root;
    v.api = api;
    // copy block for this view
    const box = document.createElement("div");
    box.className = "view";
    box.innerHTML =
      `<div class="eyebrow">${v.eye}</div>` +
      `<div class="headline">${v.lines.map((l, i) => `<span class="mask"><span class="${i ? "mint" : ""}">${l}</span></span>`).join("")}</div>` +
      `<p class="body">${v.body}</p>`;
    el.views.appendChild(box);
    v.box = box;
    v.eyeEl = box.querySelector(".eyebrow");
    v.lineEls = Array.from(box.querySelectorAll(".mask > span"));
    v.bodyEl = box.querySelector(".body");
  }

  // Click targets in window px, measured from the built DOM.
  function centre(root, node) {
    const r = root.getBoundingClientRect();
    const b = node.getBoundingClientRect();
    const k = r.width / 1440 || 1;
    return [(b.left - r.left + b.width / 2) / k, (b.top - r.top + b.height / 2) / k];
  }
  const navTarget = (v, name) => {
    const n = Array.from(v.root.querySelectorAll(".nav")).find((x) => x.textContent.trim() === name);
    return n ? centre(v.root, n) : [110, 120];
  };
  function textTarget(v, text, fallback) {
    const walker = document.createTreeWalker(v.root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.trim() === text) return centre(v.root, walker.currentNode.parentElement);
    }
    return fallback;
  }
  VIEWS.forEach((v, i) => v.api.seek(i === 0 ? 1 : 1, {})); // finished layout, so targets are measured in place
  const T_READY = navTarget(VIEWS[0], "Match Readiness");
  const T_ROSTER = navTarget(VIEWS[1], "Roster");
  const T_SANDER = textTarget(VIEWS[2], "Sander Vos", [420, 380]);
  // Cursor path in window px: [time, x, y]; clicks land at these times.
  const PATH = [
    [9.5, 980, 640], [10.1, 900, 560],
    [10.85, T_READY[0], T_READY[1]], [12.4, T_READY[0] + 40, T_READY[1] + 30], [13.2, 760, 520],
    [14.45, T_ROSTER[0], T_ROSTER[1]], [15.6, 620, 420],
    [18.05, T_SANDER[0] - 20, T_SANDER[1]], [19.2, 900, 620],
  ];
  const CLICKS = [10.9, 14.5, 18.1];

  // Window poses: the intro (small, right) and the working view (large, right of the copy).
  const POSE_IN = { x: 1010, y: 300, s: 0.6 };
  const POSE = { x: 640, y: 160, s: 0.84 };

  /* ---------------------------------------------------------------- scenes */

  function sceneHook(t) {
    const on = t < 4.3;
    show(sc.hook, on);
    if (!on) return;
    enter(el.hkEye, t, 0.1, 0.6, 14);
    rise(el.hkL[0], t, 0.3);
    rise(el.hkL[1], t, 1.7);
    rise(el.hkL[2], t, 1.84);
    const focus = E.inOut(prog(t, 2.7, 3.2));
    chips.forEach(({ c, ring, col, row }, i) => {
      const d = (col + row) * 0.06 + (i % 3) * 0.015;
      const p = E.pop(prog(t, 0.15 + d, 0.65 + d));
      const r = E.glide(prog(t, 1.5 + d * 1.2, 2.0 + d * 1.2));
      const hugo = i === HUGO;
      const lift = hugo ? focus : 0;
      c.style.transform = `translateY(${(-10 * lift).toFixed(2)}px) scale(${(lerp(0.6, 1, p) * (1 + 0.12 * lift)).toFixed(4)})`;
      op(c, clamp(p * 1.4) * (hugo ? 1 : 1 - 0.7 * focus));
      ring.style.transform = `scale(${lerp(1.18, 1, r).toFixed(4)})`;
      op(ring, r);
      c.style.zIndex = hugo ? "2" : "1";
    });
    // the tooltip pops rather than fades, so it never sits half-transparent over the chips
    const tp = E.pop(prog(t, 2.9, 3.25));
    el.hkTag.style.transform = `translateY(${((1 - tp) * 10).toFixed(2)}px) scale(${lerp(0.9, 1, tp).toFixed(4)})`;
    el.hkTag.style.transformOrigin = "50% 0";
    op(el.hkTag, clamp(prog(t, 2.9, 3.0)));
    // the dark IAM section rises over the hook
    const q = E.in(prog(t, 3.55, 4.25));
    sc.hook.style.transform = `translateY(${(-120 * q).toFixed(2)}px)`;
    sc.hook.style.filter = blurf(q * 5);
  }

  function placeWindow(x, y, s, o = 1) {
    el.win.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`;
    op(el.win, o);
  }

  function sceneIam(t) {
    const on = t >= 3.55 && t < 26.3;
    show(sc.iam, on);
    if (!on) return;
    // rises as a sheet over the hook
    const sp = E.sheet(prog(t, 3.55, 4.25));
    sc.iam.style.transform = `translateY(${((1 - sp) * H).toFixed(2)}px)`;
    const r = (1 - sp) * 56;
    sc.iam.style.borderRadius = r > 0.5 ? `${r.toFixed(1)}px ${r.toFixed(1)}px 0 0` : "0";

    // intro copy, then it makes room for the views
    enter(el.inEye, t, 4.2, 0.6, 14, 7.1, 0.35);
    el.inL.forEach((n, i) => rise(n, t, 4.35 + i * 0.13, 0.8, 7.1 + i * 0.04, 0.4));
    enter(el.inBody, t, 5.0, 0.7, 18, 7.15, 0.35);

    // the window: rises into the intro pose, glides to the working pose, then leaves for the end
    const up = E.glide(prog(t, 4.5, 5.6));
    const go = E.dolly(prog(t, 7.15, 8.05));
    const out = E.in(prog(t, 25.35, 25.95));
    let x = lerp(POSE_IN.x, POSE.x, go), y = lerp(POSE_IN.y + 260 * (1 - up), POSE.y, go), s = lerp(POSE_IN.s, POSE.s, go);
    // a closer look at the priority roster, then back
    const z = E.inOut(prog(t, 9.75, 10.4)) * (1 - E.inOut(prog(t, 10.55, 11.0)));
    const zf = [520, 560]; // window px of the focus point
    const zs = s * (1 + 0.2 * z);
    x -= zf[0] * (zs - s);
    y -= zf[1] * (zs - s);
    s = zs;
    y += out * 80;
    placeWindow(x, y, s * (1 - 0.04 * out), up * (1 - out));
    enter(el.cap, t, 5.6, 0.6, 10, 25.2, 0.3);
    el.cap.style.left = `${(x + 4).toFixed(1)}px`;
    el.cap.style.top = `${(y + 900 * s + 22).toFixed(1)}px`;

    // views: each pane builds, the next fades in on its click
    VIEWS.forEach((v, i) => {
      const [t0, t1] = SPANS[i];
      const fadeIn = i === 0 ? 1 : E.out(prog(t, t0 - 0.05, t0 + 0.3));
      const visible = t >= (i === 0 ? 0 : t0 - 0.05) && t < SPANS[i][1] + 0.35;
      show(v.root, visible);
      if (visible) {
        op(v.root, fadeIn);
        v.root.style.zIndex = String(i + 1);
        v.api.seek(prog(t, BUILD[i][0], BUILD[i][1]), viewOpts(i, t));
      }
      // copy
      const cin = i === 0 ? 7.75 : t0 + 0.15;
      const cout = t1 - 0.25;
      const vis = t >= cin - 0.1 && t < cout + 0.6;
      show(v.box, vis);
      if (vis) {
        v.box.style.top = `${POSE.y + 150}px`;
        enter(v.eyeEl, t, cin, 0.6, 14, cout, 0.3);
        v.lineEls.forEach((n, j) => rise(n, t, cin + 0.1 + j * 0.12, 0.8, cout + j * 0.04, 0.4));
        enter(v.bodyEl, t, cin + 0.45, 0.7, 16, cout + 0.06, 0.3);
      }
    });
    sceneCursor(t);
  }

  function viewOpts(i, t) {
    if (i === 0) return { focus: "hugo", focusP: E.inOut(prog(t, 9.95, 10.4)) * (1 - prog(t, 10.7, 10.95)) };
    if (i === 1) return { focus: "rest", focusP: E.inOut(prog(t, 13.5, 14.0)) };
    return {};
  }

  function sceneCursor(t) {
    const on = t >= PATH[0][0] - 0.3 && t < PATH[PATH.length - 1][0] + 0.4;
    show(el.cursor, on);
    if (!on) return;
    let x = PATH[0][1], y = PATH[0][2];
    for (let i = 1; i < PATH.length; i++) {
      const [ta, xa, ya] = PATH[i - 1];
      const [tb, xb, yb] = PATH[i];
      if (t <= ta) break;
      const p = E.dolly(prog(t, ta, tb));
      x = lerp(xa, xb, p);
      y = lerp(ya, yb, p);
    }
    let press = 0, ring = -1;
    for (const c of CLICKS) {
      const pc = prog(t, c - 0.08, c + 0.12);
      press = Math.max(press, Math.sin(Math.PI * pc));
      const pr = prog(t, c, c + 0.5);
      if (pr > 0 && pr < 1) ring = pr;
    }
    const fade = E.out(prog(t, PATH[0][0] - 0.3, PATH[0][0])) * (1 - prog(t, PATH[PATH.length - 1][0], PATH[PATH.length - 1][0] + 0.4));
    el.cursor.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${(1 - 0.14 * press).toFixed(4)})`;
    op(el.cursor, fade);
    if (ring >= 0) {
      el.ring.style.transform = `scale(${lerp(0.4, 1.3, E.out(ring)).toFixed(4)})`;
      op(el.ring, (1 - ring) * 0.9);
    } else op(el.ring, 0);
  }

  function sceneEnd(t) {
    const on = t >= 25.6;
    show(sc.end, on);
    if (!on) return;
    op(sc.end, E.out(prog(t, 25.6, 26.2)));
    enter(el.enLock, t, 25.85, 0.7, 16);
    el.enL.forEach((n, i) => rise(n, t, 26.05 + i * 0.14));
    enter(el.enCtas, t, 26.9, 0.7, 20);
    enter(el.enSite, t, 27.2, 0.7, 12);
    enter(el.enFine, t, 27.5, 0.8, 10);
  }

  /* ---------------------------------------------------------------- driver */

  function seek(t) {
    t = clamp(t, 0, DURATION);
    sceneHook(t);
    sceneIam(t);
    sceneEnd(t);
  }

  const ready = (async () => {
    const faces = ['700 64px "Manrope"', '400 20px "DM Sans"', '600 20px "DM Sans"', '400 20px "JetBrains Mono"', '400 20px "Inter"', '600 20px "Inter"', '800 20px "Inter"'];
    await Promise.all(faces.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
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
