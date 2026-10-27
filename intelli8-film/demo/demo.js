/* intelli8 Body Composition Scale — 60 s product demo (explainer-default style).
 *
 * Beat sheet (seconds · what happens · sound — sound is noise-based effects only, no music):
 *   0.30  "Introducing" fades up                                        · soft air swell
 *   1.70  the silk brand gradient sweeps in                             · wide whoosh
 *   2.20  the ribbon 8 draws, heart pops 3.15, wordmark 3.0, line 3.35  · airy swirl, pop, thock
 *   4.60  dissolve                                                      · small whoosh
 *   4.95  "Your scale shows one number." · push 5.7 · highlight 6.75    · swish, push whoosh, brush
 *   7.90  a weight-only readout, 72.4 kg · pull back 9.0                · thock, whoosh
 *   9.25  "Body fat ?" and "Muscle ?" chips, left empty                 · two soft pops
 *  10.35  "Eight contacts. Hands and feet." · push 11.0 · hl 12.0       · swish, whoosh, brush
 *  13.10  the scale, close on the foot plates: they light 13.6–14.12    · four uneven glints
 *  14.30  the camera glides up to the bar; the hand pads light 15.42    · whoosh, two glints
 *  15.90  pull back to the whole scale; chip "8 contacts · 5 segments"  · whoosh, pop
 *  17.90  push into the built-in display as it wakes 18.55              · whoosh, flicker crackle
 *  19.75  "Fat and muscle, in every segment." · push 20.4 · hl 21.4     · swish, whoosh, brush
 *  22.50  Your Results up close: five segments fill 23.3–27.5           · five soft fills
 *  27.50  pull back to the whole screen; tap Save my results 30.05      · whoosh, click
 *  30.75  "24 measures. One clear report." · push 31.4 · hl 32.4        · swish, whoosh, brush
 *  33.50  the Full Report: bars grow 34.0–35.9, it scrolls 36.3–39.0    · rising air, detents
 *  39.60  glide to Save as PDF, tap 39.85; PDF → "Shared with your coach" · click, pop, glint
 *  41.45  "Follow the change over time." · push 42.1 · hl 43.1          · swish, whoosh, brush
 *  44.20  History: the body-fat line draws 44.6–47.2, pull back 47.2    · drawn whoosh, glints
 *  50.20  silk again: "Track your [body fat / muscle / progress] at home."   · whoosh, two flicks
 *  54.00  "Know more than your weight." · highlight 54.6                · soft impact
 *  56.40  end card: intelli8 · Body Composition Scale · S$98 · intelli8.ai, the safety line · thock
 *
 * The page contract: window.VIDEO = {w, h, duration} and window.seek(t), a pure function of time.
 */
(() => {
  "use strict";
  const Q = new URLSearchParams(location.search);
  const RENDER = Q.has("render");
  if (RENDER) document.documentElement.classList.add("render");
  const W = 1920, H = 1080, DUR = 60;

  /* ------------------------------------------------------------ helpers (from the skill) */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => ((x = clamp(x)), x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lin = (x) => clamp(x);
  const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
  function spring(t, w = 14, z = 0.82) {
    if (t <= 0) return 0;
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }
  const kf = (keys) => (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [a, va] = keys[i - 1], [b, vb, e = ease] = keys[i];
      if (t <= b) return lerp(va, vb, e((t - a) / (b - a)));
    }
    return keys[keys.length - 1][1];
  };
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const show = (n, on) => (n.style.display = on ? "block" : "none");
  const op = (n, v) => (n.style.opacity = clamp(v).toFixed(4));
  const blur = (px) => (px > 0.05 ? `blur(${px.toFixed(2)}px)` : "none");
  // A camera frames scene point (cx, cy) at the stage centre at scale s.
  const aim = (cam, cx, cy, s) =>
    (cam.style.transform = `translate(${(W / 2 - cx * s).toFixed(2)}px, ${(H / 2 - cy * s).toFixed(2)}px) scale(${s.toFixed(5)})`);
  // Fixed jitter table (no Math.random anywhere).
  const rng = (s) => () => ((s = (s + 0x6d2b79f5) | 0), (s = Math.imul(s ^ (s >>> 15), 1 | s)), (s ^= s + Math.imul(s ^ (s >>> 7), 61 | s)), ((s ^ (s >>> 14)) >>> 0) / 4294967296);

  const stage = $("#stage");
  const scenes = []; // { layer, tIn, tOut, seek(t) }
  // A scene is visible from tIn until its dissolve (tOut … tOut + DISS) has finished.
  const DISS = 0.38;
  function scene(tIn, tOut, build) {
    const layer = el("div", "layer");
    stage.appendChild(layer);
    show(layer, true); // laid out while building, so screens can measure themselves
    const s = { layer, tIn, tOut, seek: () => {} };
    s.seek = build(layer, s) || s.seek;
    scenes.push(s);
    return s;
  }

  /* ------------------------------------------------------------ silk brand gradient (drawn once) */
  function silkURL() {
    const cw = 1300, ch = 750, c = document.createElement("canvas");
    c.width = cw; c.height = ch;
    const g = c.getContext("2d"), img = g.createImageData(cw, ch), d = img.data;
    const cream = [245, 244, 238], sage = [224, 231, 225], mint = [174, 210, 192], green = [60, 114, 96], white = [255, 255, 255];
    const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    const A = (-28 * Math.PI) / 180, ca = Math.cos(A), sa = Math.sin(A);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const u = (x * ca - y * sa) / cw + 0.35; // along the diagonal
        const v = (x * sa + y * ca) / ch; // across it
        const fold = 0.5 + 0.5 * Math.sin(u * 7.2 + Math.sin(v * 3.1 + u * 1.7) * 1.4);
        const fold2 = 0.5 + 0.5 * Math.sin(u * 15.0 + v * 2.2 + Math.sin(u * 4.0) * 0.8);
        const sheen = Math.pow(0.5 + 0.5 * Math.sin(u * 11.0 - v * 1.3 + 0.6), 6);
        const g0 = clamp((u - 0.05) / 0.95);
        let col = mix(cream, sage, Math.pow(g0, 0.9) * 0.95);
        col = mix(col, mint, fold * 0.42 * g0);
        col = mix(col, green, Math.pow(fold * fold2, 2.2) * 0.38 * Math.pow(g0, 1.5));
        col = mix(col, white, sheen * 0.22 * (1 - g0 * 0.5));
        const i = (y * cw + x) * 4;
        d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL("image/jpeg", 0.95);
  }

  /* ------------------------------------------------------------ title lines */
  // One short sentence, small and centred; words fade up, the camera pushes in until the line spans ~75% of the
  // frame, and one phrase gets a soft brand-green box sweeping in behind it.
  function title(text, hl, T) {
    return scene(T.in, T.out, (layer) => {
      const cam = el("div", "cam");
      const line = el("div", "tline");
      cam.appendChild(line);
      layer.appendChild(cam);
      const words = text.split(" ");
      const hlWords = hl.split(" ");
      const start = words.findIndex((w, i) => words.slice(i, i + hlWords.length).join(" ") === hl);
      const box = el("div", "hlbox");
      line.appendChild(box);
      const spans = words.map((w, i) => {
        const s = el("span", "word", w);
        line.appendChild(s);
        if (i < words.length - 1) line.appendChild(document.createTextNode(" "));
        return s;
      });
      let sMax = 3, bx = 0, bw = 0, by = 0, bh = 0;
      const measure = () => {
        const lw = line.offsetWidth;
        sMax = (0.75 * W) / lw;
        const a = spans[start], b = spans[start + hlWords.length - 1];
        bx = a.offsetLeft - 4; bw = b.offsetLeft + b.offsetWidth - a.offsetLeft + 8;
        by = a.offsetTop + 2; bh = a.offsetHeight - 2;
        Object.assign(box.style, { left: `${bx}px`, top: `${by}px`, width: `${bw}px`, height: `${bh}px` });
      };
      measurers.push(measure);
      const sc = (t) => kf([[T.in, 1], [T.push[0], 1], [T.push[1], sMax, ease], [T.out + DISS, sMax * 1.035, lin]])(t);
      return (t) => {
        const s = sc(t);
        aim(cam, W / 2, H / 2, s);
        spans.forEach((sp, i) => {
          const k = out3(seg(t, T.words + i * 0.075, T.words + i * 0.075 + 0.5));
          sp.style.opacity = k.toFixed(4);
          sp.style.transform = `translateY(${((1 - k) * 8).toFixed(2)}px)`;
          sp.style.filter = blur((1 - k) * 4);
        });
        box.style.transform = `scaleX(${ease(seg(t, T.hl[0], T.hl[1])).toFixed(4)})`;
      };
    });
  }
  const measurers = [];

  /* ------------------------------------------------------------ build */
  const SILK = silkURL();

  // 0 · Introducing
  scene(0, 1.62, (layer) => {
    const t1 = el("div", "tline intro", "Introducing");
    layer.appendChild(t1);
    return (t) => {
      const k = out3(seg(t, 0.3, 0.95));
      op(t1, k);
      t1.style.transform = `translate(-50%, -50%) translateY(${((1 - k) * 10).toFixed(2)}px) scale(${lerp(1, 1.06, seg(t, 0.3, 2.0)).toFixed(4)})`;
    };
  });

  // 1 · Brand moment: the silk sweeps in, the 8 draws, the name settles
  scene(1.6, 4.6, (layer) => {
    const silk = el("img", "silk");
    silk.src = SILK;
    const lock = el("div", "lockup",
      `<div class="mark">${I8.logo8({ id: "open", size: 132 })}</div><div class="name">intelli8</div><div class="sub">Body Composition Scale</div>`);
    layer.append(silk, lock);
    const svg = $(".logo8", lock), name = $(".name", lock), sub = $(".sub", lock);
    return (t) => {
      const p = ease(seg(t, 1.7, 2.65));
      const xt = lerp(-900, W + 300, p);
      layer.style.clipPath = p < 1 ? `polygon(0 0, ${xt.toFixed(1)}px 0, ${(xt - 700).toFixed(1)}px 100%, 0 100%)` : "none";
      silk.style.transform = `translate(${(-60 * seg(t, 1.6, 5.0)).toFixed(2)}px, ${(20 * seg(t, 1.6, 5.0)).toFixed(2)}px)`;
      I8.logo8Draw(svg, ease(seg(t, 2.2, 3.3)), seg(t, 3.05, 3.3));
      const kn = out3(seg(t, 3.0, 3.6)), ks = out3(seg(t, 3.35, 3.9));
      op(name, kn); name.style.transform = `translateY(${((1 - kn) * 14).toFixed(2)}px)`;
      op(sub, ks); sub.style.transform = `translateY(${((1 - ks) * 10).toFixed(2)}px)`;
      lock.style.transform = `translate(-50%, -50%) scale(${lerp(1, 1.04, seg(t, 2.0, 5.0)).toFixed(4)})`;
    };
  }).cut = true;

  // 2 · The ask: one number
  title("Your scale shows one number.", "one number.", { in: 4.6, words: 4.95, push: [5.7, 7.0], hl: [6.75, 7.25], out: 7.9 });
  scene(7.9, 10.15, (layer) => {
    const cam = el("div", "cam");
    const card = el("div", "readout", `<div class="cap">WEIGHT</div><div class="num">72.4<span>kg</span></div>`);
    const c1 = el("div", "qchip", `Body fat <b>?</b>`), c2 = el("div", "qchip", `Muscle <b>?</b>`);
    cam.append(card, c1, c2);
    layer.appendChild(cam);
    measurers.push(() => {
      const w1 = c1.offsetWidth, w2 = c2.offsetWidth, gap = 24, x0 = 960 - (w1 + w2 + gap) / 2;
      c1.style.left = `${x0}px`; c2.style.left = `${x0 + w1 + gap}px`;
    });
    const cx = kf([[7.9, 960], [9.0, 960], [9.9, 960, ease]]);
    const cy = kf([[7.9, 452], [9.0, 452], [9.9, 512, ease]]);
    const sc = kf([[7.9, 1.42], [9.0, 1.5, lin], [9.9, 1.24, ease], [10.6, 1.22, lin]]);
    return (t) => {
      aim(cam, cx(t), cy(t), sc(t));
      const k = out3(seg(t, 7.9, 8.35));
      card.style.transform = `translateY(${((1 - k) * 20).toFixed(2)}px)`;
      [c1, c2].forEach((c, i) => {
        const kc = spring(t - (9.25 + i * 0.25), 12, 0.95);
        op(c, clamp(kc * 1.4));
        c.style.transform = `translateY(${((1 - kc) * -36).toFixed(2)}px)`;
      });
    };
  });

  /* ------------------------------------------------------------ the scale's built-in display */
  // The product render's display shows its own demo numbers (58.80 kg …). They are replaced with the app's
  // reading (72.40 kg, 18.2 % fat …) so the scale and the app agree. Made once at load, on canvases:
  //   OFF  the render with every lit element on the glass removed (filled in from the glass around it, so
  //        only the glass and its reflection are left), so the display can be asleep and then wake;
  //   ON   the glass as the render shows it, minus its digits (and the % after BMI and visceral fat), with
  //        the reading drawn as seven-segment digits.
  // Geometry is measured on the render deskewed by PHI about (CX, CY); u, v are that frame's pixels.
  const DISP = (() => {
    const PHI = (-3.1 * Math.PI) / 180, CX = 356, CY = 316, cs = Math.cos(PHI), sn = Math.sin(PHI);
    const BOX = { x: 250, y: 140, w: 210, h: 350 }; // render px holding the whole glass
    const CONTENT = [262, 155, 447, 469]; // u0 v0 u1 v1: the lit area inside the glass
    // [cell u lefts], v top, cell w, h, stroke, point after cell index, value ("" = blank cell), % to remove
    const GROUPS = [
      { u: [292, 330, 369], last: 407, v: 197, w: 30, h: 71, t: 5, pt: 1, val: "72.40" },
      { u: [295, 310, 325], v: 339, w: 11, h: 35, t: 2.4, pt: 1, val: "18.2" }, // body fat %
      { u: [293, 308, 323], v: 383, w: 11, h: 35, t: 2.4, pt: 1, val: "80.2" }, // muscle %: 58.1 / 72.4 kg
      { u: [291, 306, 321], v: 426, w: 11, h: 35, t: 2.4, pt: 1, val: "60.1" }, // body water %
      { u: [385, 400, 415], v: 341, w: 11, h: 35, t: 2.4, pt: 1, val: "22.8", pct: [429, 362, 440, 378] }, // BMI
      { u: [383, 398, 413], v: 385, w: 11, h: 35, t: 2.4, pt: 1, val: "5.5" }, // bone mass %: 4.0 / 72.4 kg
      { u: [381, 396, 411], v: 428, w: 11, h: 35, t: 2.4, pt: 1, val: "7.0", pct: [423, 451, 435, 467] }, // visceral fat level
    ];
    for (const g of GROUPS) if (g.last) g.u.push(g.last);
    const off = el("canvas"), on = el("canvas");
    off.width = 783; off.height = 980; on.width = BOX.w; on.height = BOX.h;
    const toUV = (x, y) => [CX + (x - CX) * cs + (y - CY) * sn, CY - (x - CX) * sn + (y - CY) * cs];
    // grey-level opening (min then max over a square window), per channel, on a w × h RGBA buffer
    function opening(src, w, h, r) {
      const pass = (a, horiz, fn) => {
        const o = new Float32Array(a.length);
        for (let c = 0; c < 3; c++)
          for (let j = 0; j < (horiz ? h : w); j++)
            for (let i = 0; i < (horiz ? w : h); i++) {
              let m = fn === Math.min ? 1e9 : -1e9;
              for (let k = Math.max(0, i - r); k <= Math.min((horiz ? w : h) - 1, i + r); k++) {
                const p = horiz ? (j * w + k) * 4 + c : (k * w + j) * 4 + c;
                m = fn(m, a[p]);
              }
              o[horiz ? (j * w + i) * 4 + c : (i * w + j) * 4 + c] = m;
            }
        return o;
      };
      return pass(pass(pass(pass(src, true, Math.min), false, Math.min), true, Math.max), false, Math.max);
    }
    const SEGS = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
    function digit(g, ch, x, y, w, h, t) {
      const gap = Math.max(0.7, t * 0.28), m = h / 2;
      const hs = (x0, x1, yc) => [[x0, yc], [x0 + t / 2, yc - t / 2], [x1 - t / 2, yc - t / 2], [x1, yc], [x1 - t / 2, yc + t / 2], [x0 + t / 2, yc + t / 2]];
      const vs = (xc, y0, y1) => [[xc, y0], [xc + t / 2, y0 + t / 2], [xc + t / 2, y1 - t / 2], [xc, y1], [xc - t / 2, y1 - t / 2], [xc - t / 2, y0 + t / 2]];
      const P = {
        a: hs(x + gap, x + w - gap, y + t / 2), g: hs(x + gap, x + w - gap, y + m), d: hs(x + gap, x + w - gap, y + h - t / 2),
        f: vs(x + t / 2, y + gap, y + m - gap), b: vs(x + w - t / 2, y + gap, y + m - gap),
        e: vs(x + t / 2, y + m + gap, y + h - gap), c: vs(x + w - t / 2, y + m + gap, y + h - gap),
      };
      for (const s of SEGS[ch] || "") {
        g.beginPath();
        P[s].forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.fill();
      }
    }
    async function build() {
      const img = new Image();
      img.src = SCALE_PNG;
      await img.decode();
      const g = off.getContext("2d");
      g.drawImage(img, 0, 0);
      const id = g.getImageData(BOX.x, BOX.y, BOX.w, BOX.h), src = id.data;
      const W2 = BOX.w, H2 = BOX.h, NP = W2 * H2;
      // lit = anything drawn on the glass: thin bright features (white top-hat), colour, or near-white
      const plate = opening(src, W2, H2, 8);
      const lit = new Uint8Array(NP), old = new Float32Array(NP);
      const inRect = (u, v, r, pad) => u >= r[0] - pad && u <= r[2] + pad && v >= r[1] - pad && v <= r[3] + pad;
      for (let j = 0; j < H2; j++)
        for (let i = 0; i < W2; i++) {
          const p = j * W2 + i, [u, v] = toUV(BOX.x + i + 0.5, BOX.y + j + 0.5);
          const inside = inRect(u, v, CONTENT, 0) && !(u < 281 && v < 166) || (v > 380 && v < 469 && u >= 258 && u < 262); // not the rim at top left; the lower icons sit further left
          const r = src[p * 4], gg = src[p * 4 + 1], b = src[p * 4 + 2];
          const top = Math.max(r - plate[p * 4], gg - plate[p * 4 + 1], b - plate[p * 4 + 2]);
          const hi = Math.max(r, gg, b), chroma = hi - Math.min(r, gg, b);
          lit[p] = inside && (top > 10 || chroma > 28 || hi > 115) ? 1 : 0;
          for (const G of GROUPS) {
            const q = [G.u[0] - 2, G.v - 2.5, G.u[G.u.length - 1] + G.w + (G.t > 3 ? 3.5 : 2), G.v + G.h + 2.5];
            if (inRect(u, v, q, 0) || (G.pct && inRect(u, v, G.pct, 1))) old[p] = 1;
          }
        }
      // grow (max) and soften (mean) a mask over 3 × 3 neighbourhoods
      const filt3 = (m, max) => {
        const o = new Float32Array(NP);
        for (let j = 0; j < H2; j++)
          for (let i = 0; i < W2; i++) {
            let s = 0, n = 0, mx = 0;
            for (let dj = -1; dj <= 1; dj++)
              for (let di = -1; di <= 1; di++) {
                if (j + dj < 0 || j + dj >= H2 || i + di < 0 || i + di >= W2) continue;
                const q = m[(j + dj) * W2 + i + di];
                s += q; n++; mx = Math.max(mx, q);
              }
            o[j * W2 + i] = max ? mx : s / n;
          }
        return o;
      };
      const unknown = filt3(filt3(lit, true), true); // lit, grown by 2 px so the glows go too
      // OFF: fill the unknown pixels from the glass around them (harmonic fill, over-relaxed Gauss-Seidel),
      // starting from a normalised blur of the known pixels
      const fill = Float32Array.from(src);
      const R = 10;
      for (let j = 0; j < H2; j++)
        for (let i = 0; i < W2; i++) {
          const p = j * W2 + i;
          if (!unknown[p]) continue;
          const acc = [0, 0, 0];
          let n = 0;
          for (let dj = -R; dj <= R; dj += 2)
            for (let di = -R; di <= R; di += 2) {
              const y = j + dj, x = i + di;
              if (y < 0 || y >= H2 || x < 0 || x >= W2 || unknown[y * W2 + x]) continue;
              for (let c = 0; c < 3; c++) acc[c] += src[(y * W2 + x) * 4 + c];
              n++;
            }
          for (let c = 0; c < 3; c++) fill[p * 4 + c] = n ? acc[c] / n : 0;
        }
      const holes = [];
      for (let j = 1; j < H2 - 1; j++) for (let i = 1; i < W2 - 1; i++) if (unknown[j * W2 + i]) holes.push(j * W2 + i);
      for (let it = 0; it < 260; it++)
        for (const p of holes)
          for (let c = 0; c < 3; c++) {
            const k = p * 4 + c, avg = (fill[k - 4] + fill[k + 4] + fill[k - W2 * 4] + fill[k + W2 * 4]) / 4;
            fill[k] += 1.85 * (avg - fill[k]);
          }
      const litS = filt3(filt3(unknown, false), false), oldS = filt3(filt3(filt3(old, true), false), false);
      const offD = g.createImageData(W2, H2), onD = g.createImageData(W2, H2);
      for (let p = 0; p < NP; p++)
        for (let c = 0; c < 4; c++) {
          const sv = src[p * 4 + c], o = c === 3 ? 255 : lerp(sv, fill[p * 4 + c], litS[p]);
          offD.data[p * 4 + c] = o;
          onD.data[p * 4 + c] = c === 3 ? 255 : lerp(sv, o, oldS[p]);
        }
      g.putImageData(offD, BOX.x, BOX.y);
      const h = on.getContext("2d");
      h.putImageData(onD, 0, 0);
      // the reading, as lit segments with a faint glow, in the deskewed frame
      h.setTransform(cs, sn, -sn, cs, CX - CX * cs + CY * sn - BOX.x, CY - CX * sn - CY * cs - BOX.y);
      h.fillStyle = "#f2f5f4";
      for (const G of GROUPS) {
        h.shadowColor = "rgba(235, 245, 242, 0.55)";
        h.shadowBlur = G.t * 1.1;
        const chars = G.val.replace(".", "").padStart(G.u.length, " ");
        [...chars].forEach((ch, k) => digit(h, ch, G.u[k], G.v, G.w, G.h, G.t));
        const px = G.u[G.pt] + G.w + (G.u[G.pt + 1] - G.u[G.pt] - G.w) / 2, ps = G.t * 1.05;
        h.fillRect(px - ps / 2, G.v + G.h - ps, ps, ps);
      }
    }
    return { off, on, box: BOX, build };
  })();

  // 3 · Eight contacts: the real scale, close up
  title("Eight contacts. Hands and feet.", "Hands and feet.", { in: 10.15, words: 10.35, push: [11.0, 12.3], hl: [12.0, 12.5], out: 13.1 });
  scene(13.1, 19.6, (layer) => {
    const cam = el("div", "cam");
    const sc0 = el("div", "scale");
    sc0.innerHTML = `<div class="shadow"></div>`;
    DISP.off.className = "render-img";
    DISP.on.className = "lit";
    Object.assign(DISP.on.style, { left: `${DISP.box.x}px`, top: `${DISP.box.y}px` });
    sc0.append(DISP.off, DISP.on);
    // the eight contacts: four foot plates, then the two hand pads (a hand's pair each), image px
    const C = [
      { r: [79, 587, 171, 860], t: 13.6 }, { r: [547, 593, 658, 893], t: 13.78 },
      { r: [80, 183, 171, 455], t: 14.0 }, { r: [546, 147, 658, 447], t: 14.12 },
      { r: [233, 47, 330, 83], t: 15.42, pad: true }, { r: [368, 33, 470, 70], t: 15.6, pad: true },
    ];
    const glows = C.map(({ r, pad }) => {
      const box = { left: `${r[0]}px`, top: `${r[1]}px`, width: `${r[2] - r[0]}px`, height: `${r[3] - r[1]}px` };
      const tint = el("div", `tint${pad ? " pad" : ""}`), halo = el("div", `halo${pad ? " pad" : ""}`);
      Object.assign(tint.style, box); Object.assign(halo.style, box);
      sc0.append(tint, halo);
      return { tint, halo };
    });
    const chip = el("div", "chip", `<span class="k"><span class="lc">intelli8</span> body composition scale</span><b>8 contacts · 5 body segments</b>`);
    Object.assign(chip.style, { left: "470px", top: "905px" });
    sc0.appendChild(chip);
    cam.appendChild(sc0);
    layer.appendChild(cam);
    const cx = kf([[13.1, 380], [14.3, 372, lin], [15.3, 351, ease], [15.9, 351, lin], [17.1, 391, ease], [17.9, 391, lin], [19.0, 356, ease], [20.0, 352, lin]]);
    const cy = kf([[13.1, 770], [14.3, 735, lin], [15.3, 110, ease], [15.9, 104, lin], [17.1, 488, ease], [17.9, 488, lin], [19.0, 316, ease], [20.0, 312, lin]]);
    const sc = kf([[13.1, 1.5], [14.3, 1.58, lin], [15.3, 1.62, ease], [15.9, 1.66, lin], [17.1, 0.98, ease], [17.9, 1.0, lin], [19.0, 1.72, ease], [20.0, 1.76, lin]]);
    // the display wakes with a short, fixed flicker
    const FLICK = [[18.55, 0.35], [18.6, 1], [18.66, 0.15], [18.72, 0.6], [18.8, 0]];
    return (t) => {
      aim(cam, cx(t), cy(t), sc(t));
      C.forEach((c, i) => {
        const on = out3(seg(t, c.t, c.t + 0.25)) * (1 - 0.3 * seg(t, c.t + 0.3, c.t + 1.3));
        op(glows[i].tint, on * 0.85);
        const pr = seg(t, c.t, c.t + 0.8);
        op(glows[i].halo, on * (1 - 0.5 * pr));
        glows[i].halo.style.transform = `scale(${lerp(1, 1.06, out3(pr)).toFixed(4)})`;
      });
      let g = 1;
      for (const [tk, v] of FLICK) if (t >= tk) g = v;
      op(DISP.on, 1 - g);
      const kc = spring(t - 17.0, 13, 0.9);
      op(chip, clamp(kc * 1.5));
      chip.style.transform = `translateY(${((1 - kc) * 24).toFixed(2)}px) scale(${lerp(0.94, 1, kc).toFixed(4)})`;
    };
  });

  // Phone scenes share one build: the app screen in a phone frame at the scene origin (screen inset 14 px).
  function phoneScene(name, tIn, tOut, build) {
    return scene(tIn, tOut, (layer, s) => {
      const cam = el("div", "cam");
      const phone = el("div", "phone");
      const screen = el("div", "screen");
      const root = el("div", "app");
      screen.appendChild(root); phone.appendChild(screen); cam.appendChild(phone); layer.appendChild(cam);
      const api = I8.screens[name](root, I8.h);
      const rect = (sel) => {
        const n = $(sel, root);
        let x = 0, y = 0, m = n;
        while (m && m !== root) { x += m.offsetLeft; y += m.offsetTop; m = m.offsetParent; }
        return { x: x + 14, y: y + 14, w: n.offsetWidth, h: n.offsetHeight, cx: x + 14 + n.offsetWidth / 2, cy: y + 14 + n.offsetHeight / 2 };
      };
      return build({ cam, phone, root, api, rect, layer });
    });
  }
  // Tap: a soft touch that arrives, dips and leaves a ripple.
  function tapper(parent) {
    const dot = el("div", "tap"), ring = el("div", "ripple");
    parent.append(dot, ring);
    return (t, x, y, tap) => {
      const vis = seg(t, tap - 0.35, tap - 0.12) * (1 - seg(t, tap + 0.35, tap + 0.6));
      show(dot, vis > 0.001); show(ring, t >= tap && t < tap + 0.6);
      Object.assign(dot.style, { left: `${x}px`, top: `${y}px` });
      Object.assign(ring.style, { left: `${x}px`, top: `${y}px` });
      const dip = Math.sin(Math.PI * seg(t, tap - 0.06, tap + 0.16));
      op(dot, vis);
      dot.style.transform = `scale(${(1 - 0.18 * dip).toFixed(4)})`;
      const pr = seg(t, tap, tap + 0.6);
      ring.style.transform = `scale(${lerp(0.6, 2.2, out3(pr)).toFixed(4)})`;
      op(ring, (1 - pr) * 0.9);
    };
  }

  // 4 · Every segment: Your Results, up close
  title("Fat and muscle, in every segment.", "every segment.", { in: 19.6, words: 19.75, push: [20.4, 21.7], hl: [21.4, 21.9], out: 22.5 });
  phoneScene("results", 22.5, 30.6, ({ cam, api, rect }) => {
    const card = rect(".card.seg"), btn = rect(".foot .btn");
    const tap = tapper(cam);
    const p = kf([[22.5, 0.16], [23.3, 0.25, lin], [27.5, 0.7, lin], [29.7, 1.0, lin]]);
    const cx = kf([[22.5, card.cx - 46], [27.5, card.cx + 34, lin], [28.9, 209, ease], [31.0, 209, lin]]);
    // the frame's top edge sits just under the three headline tiles, so no number is cut in half
    const cy = kf([[22.5, card.y + 189], [27.5, card.y + 189, lin], [28.9, 436, ease], [31.0, 436, lin]]);
    const sc = kf([[22.5, 2.7], [27.5, 2.86, lin], [28.9, 1.12, ease], [31.0, 1.15, lin]]);
    return (t) => {
      aim(cam, cx(t), cy(t), sc(t));
      api.seek(p(t), {});
      tap(t, btn.cx, btn.cy, 30.05);
    };
  });

  // 5 · One clear report
  title("24 measures. One clear report.", "One clear report.", { in: 30.6, words: 30.75, push: [31.4, 32.7], hl: [32.4, 32.9], out: 33.5 });
  phoneScene("report", 33.5, 41.3, ({ cam, api, rect }) => {
    const bars = rect(".view .card"), pdfBtn = rect(".foot .pdf");
    const tap = tapper(cam);
    const chipA = el("div", "pchip", `<i>PDF</i><div><b>Full Report</b>Sep 24, 2026 · 24 measures</div>`);
    const chipB = el("div", "pchip", `<i class="c">C</i><div><b>Shared with your coach</b>Full Report · Sep 24, 2026</div>`);
    const scrim = el("div", "scrim"); // the report dims behind the PDF while it is made and shared
    cam.append(scrim, chipA, chipB);
    const max = () => api.maxScroll || 1200;
    const p = kf([[33.5, 0.06], [34.0, 0.12, lin], [35.9, 0.62, lin], [36.4, 1.0, lin]]);
    const cx = kf([[33.5, bars.cx], [35.9, bars.cx, lin], [36.6, 209, ease], [39.0, 209, lin], [39.6, pdfBtn.cx - 40, ease], [41.7, pdfBtn.cx - 44, lin]]);
    const cy = kf([[33.5, bars.cy], [35.9, bars.cy + 6, lin], [36.6, 436, ease], [39.0, 436, lin], [39.6, pdfBtn.cy - 70, ease], [41.7, pdfBtn.cy - 76, lin]]);
    const sc = kf([[33.5, 2.7], [35.9, 2.8, lin], [36.6, 1.16, ease], [39.0, 1.19, lin], [39.6, 2.2, ease], [41.7, 2.26, lin]]);
    return (t) => {
      aim(cam, cx(t), cy(t), sc(t));
      api.seek(p(t), { scroll: max() * ease(seg(t, 36.3, 39.0)), press: seg(t, 39.8, 40.12) });
      tap(t, pdfBtn.cx, pdfBtn.cy, 39.85);
      // the PDF rises out of the button, then it is shared
      const ka = spring(t - 40.2, 12, 0.92), swap = ease(seg(t, 40.85, 41.1));
      const x = pdfBtn.cx - 150, y = pdfBtn.cy - 120 - 60 * ka;
      for (const [c, o] of [[chipA, 1 - swap], [chipB, swap]]) {
        Object.assign(c.style, { left: `${x.toFixed(1)}px`, top: `${y.toFixed(1)}px` });
        op(c, clamp(ka * 1.4) * o);
        c.style.transform = `scale(${lerp(0.85, 1, ka).toFixed(4)})`;
        show(c, t >= 40.2);
      }
      op(scrim, clamp(ka * 1.4) * 0.78);
      show(scrim, t >= 40.2);
    };
  });

  // 6 · Over time
  title("Follow the change over time.", "over time.", { in: 41.3, words: 41.45, push: [42.1, 43.4], hl: [43.1, 43.6], out: 44.2 });
  phoneScene("history", 44.2, 50.2, ({ cam, api, rect }) => {
    const ch = rect(".card.chart");
    const p = kf([[44.2, 0.12], [44.6, 0.2, lin], [47.2, 0.7, lin], [49.4, 1.0, lin]]);
    const cx = kf([[44.2, ch.x + 105], [47.2, ch.x + ch.w - 105, lin], [48.4, 209, ease], [50.6, 209, lin]]);
    const cy = kf([[44.2, ch.cy + 18], [47.2, ch.cy + 18, lin], [48.4, 436, ease], [50.6, 436, lin]]);
    const sc = kf([[44.2, 3.5], [47.2, 3.5, lin], [48.4, 1.12, ease], [50.6, 1.15, lin]]);
    return (t) => {
      aim(cam, cx(t), cy(t), sc(t));
      api.seek(p(t), {});
    };
  });

  // 7 · Closer on the silk: a rotating use, then the tagline
  scene(50.2, 59.9, (layer) => {
    const silk = el("img", "silk");
    silk.src = SILK;
    layer.appendChild(silk);
    return (t) => {
      silk.style.transform = `translate(${(-80 * seg(t, 50.2, 60)).toFixed(2)}px, ${(26 * seg(t, 50.2, 60)).toFixed(2)}px)`;
    };
  }).noFade = true;
  const USES = ["body fat", "muscle", "progress"];
  scene(50.45, 53.6, (layer) => {
    const big = el("div", "big",
      `Track your <span class="rot"><span class="hlbox"></span>${USES.map((u) => `<span class="opt">${u}</span>`).join("")}</span> at home.`);
    layer.appendChild(big);
    const rot = $(".rot", big), box = $(".hlbox", big), opts = [...big.querySelectorAll(".opt")];
    let widths = [];
    measurers.push(() => { widths = opts.map((o) => o.offsetWidth); });
    const SW = [51.75, 52.7]; // swaps to "muscle", then "progress"
    return (t) => {
      const k = out3(seg(t, 50.55, 51.1));
      op(big, k);
      big.style.filter = blur((1 - k) * 6);
      big.style.transform = `translate(-50%, -50%) scale(${lerp(0.985, 1.03, seg(t, 50.5, 54)).toFixed(4)})`;
      let w = widths[0];
      opts.forEach((o, i) => {
        // option i shows between its swap-in and the next swap-out
        const tin = i === 0 ? -1 : SW[i - 1], tout = i < SW.length ? SW[i] : 1e9;
        const a = ease(seg(t, tin, tin + 0.35)), b = ease(seg(t, tout, tout + 0.35));
        const y = i === 0 ? -b : (1 - a) - b;
        o.style.transform = `translateY(${(y * 105).toFixed(2)}%)`;
        op(o, i === 0 ? 1 - b : Math.min(a, 1 - b));
      });
      for (let i = 0; i < SW.length; i++) w = lerp(w, widths[i + 1], ease(seg(t, SW[i], SW[i] + 0.35)));
      rot.style.width = `${w.toFixed(2)}px`;
      box.style.width = `${(w + 20).toFixed(2)}px`;
    };
  });
  scene(53.95, 56.3, (layer) => {
    const big = el("div", "big", `Know <span class="hlw"><span class="hlbox"></span><span class="lbl">more than your weight.</span></span>`);
    layer.appendChild(big);
    const box = $(".hlbox", big);
    return (t) => {
      const k = out3(seg(t, 54.0, 54.5));
      op(big, k);
      big.style.filter = blur((1 - k) * 6);
      big.style.transform = `translate(-50%, -50%) scale(${lerp(0.985, 1.03, seg(t, 54, 56.6)).toFixed(4)})`;
      box.style.transform = `scaleX(${ease(seg(t, 54.6, 55.15)).toFixed(4)})`;
    };
  });

  // 8 · End card
  scene(56.3, 60.5, (layer) => {
    const wrap = el("div", "end");
    wrap.innerHTML =
      `<div class="lockup"><div class="mark">${I8.logo8({ id: "end", size: 112 })}</div><div class="name">intelli8</div></div>` +
      `<div class="cta"><div class="p">Body Composition Scale · S$98</div><div class="u">intelli8.ai</div></div>` +
      `<p class="fine">BIA readings are estimates for general wellness, not a diagnosis. Do not use with implanted electronic medical devices such as pacemakers. App screens show demo data.</p>`;
    layer.appendChild(wrap);
    I8.logo8Draw($(".logo8", wrap), 1, 1);
    const lock = $(".lockup", wrap), cta = $(".cta", wrap), fine = $(".fine", wrap);
    return (t) => {
      const a = out3(seg(t, 56.4, 57.1)), b = out3(seg(t, 56.85, 57.45)), c = out3(seg(t, 57.2, 57.8));
      op(lock, a); lock.style.transform = `translate(-50%, -50%) translateY(${((1 - a) * 16).toFixed(2)}px) scale(${lerp(1, 1.03, seg(t, 56.4, 60)).toFixed(4)})`;
      op(cta, b); cta.style.transform = `translateX(-50%) translateY(${((1 - b) * 12).toFixed(2)}px)`;
      op(fine, c);
    };
  });

  /* ------------------------------------------------------------ driver */
  // Cross-dissolves: the incoming layer fades up over the outgoing one while that one fades out with a blur.
  // (A scene with .cut reveals itself, like the silk wipe; one with .noFade stays until the end.)
  function seek(t) {
    t = clamp(t, 0, DUR - 1e-6);
    for (const s of scenes) {
      const on = t >= s.tIn && t < s.tOut + DISS;
      show(s.layer, on);
      if (!on) continue;
      const fin = s.tIn > 0 && !s.cut ? ease(seg(t, s.tIn, s.tIn + DISS)) : 1;
      const d = s.noFade ? 0 : seg(t, s.tOut, s.tOut + DISS);
      op(s.layer, fin * (1 - ease(d)));
      s.layer.style.filter = blur(d * 8);
      s.seek(t);
    }
  }

  (async () => {
    const faces = ['600 32px "Manrope"', '700 64px "Manrope"', '400 20px "DM Sans"', '500 20px "DM Sans"', '500 16px "JetBrains Mono"', '400 16px "Inter"', '600 16px "Inter"', '200 30px "Inter"'];
    await Promise.all(faces.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
    await Promise.all([...document.images].map((im) => (im.complete ? null : new Promise((r) => (im.onload = im.onerror = r)))));
    await DISP.build();
    for (const m of measurers) m();
    window.VIDEO = { w: W, h: H, duration: DUR };
    window.seek = seek;
    seek(0);
    if (RENDER) return;

    // Preview: scaled to the window, with the soundtrack (if one was embedded) as the clock.
    const ui = { play: $("#play"), scrub: $("#scrub"), clock: $("#clock") }, snd = $("#snd");
    ui.scrub.max = String(DUR * 100);
    const fit = () => {
      const k = Math.min(innerWidth / W, (innerHeight - 76) / H);
      stage.style.transform = `translate(${(innerWidth - W * k) / 2}px, ${Math.max(8, (innerHeight - 76 - H * k) / 2)}px) scale(${k})`;
    };
    addEventListener("resize", fit);
    fit();
    let playing = false, t0 = 0, base = 0;
    const now = () => (playing ? (snd && snd.src ? snd.currentTime : base + (performance.now() - t0) / 1000) % DUR : base);
    const play = () => { playing = true; t0 = performance.now(); if (snd && snd.src) { snd.currentTime = base; snd.play(); } ui.play.textContent = "❚❚"; };
    const pause = () => { base = now(); playing = false; if (snd && snd.src) snd.pause(); ui.play.textContent = "▶"; };
    ui.play.addEventListener("click", () => (playing ? pause() : play()));
    ui.scrub.addEventListener("input", () => { pause(); base = Number(ui.scrub.value) / 100; });
    addEventListener("keydown", (e) => e.code === "Space" && ui.play.click());
    (function loop() {
      const t = now();
      seek(t);
      ui.scrub.value = String(Math.round(t * 100));
      ui.clock.textContent = t.toFixed(2);
      requestAnimationFrame(loop);
    })();
  })();
})();
