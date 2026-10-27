/* Your Results — shown right after a weigh-in.
 *
 * Title, three headline tiles (weight · body fat · muscle), the Segmental Analysis card (body
 * diagram + per-segment list), All Metrics and the frosted footer with "Save my results".
 * No tab bar on this screen (as in the app).
 *
 * seek(p, { seg = -1, focus = 1 })
 *   0.00–0.25  title rises in (0–0.12); tiles rise in one after another (0.03–0.25) while their
 *              numbers count up to the reading
 *   0.17–0.28  Segmental Analysis card, its title and the neutral figure (head, neck, hips, L/R)
 *   0.25–0.70  segments in order left arm → right arm → trunk → left leg → right leg, 0.09 each:
 *              outline draws, fill rises from the bottom, tiny labels fade in; the matching list
 *              line slides in at the same moment
 *   0.62–0.72  "All Metrics" caption + card; rows stagger in 0.65–0.90
 *   0.85–1.00  "Save my results" rises in (0.85–0.97), the note under it (0.89–1)
 *   seg   0..4 emphasises one segment (0 left arm, 1 right arm, 2 trunk, 3 left leg, 4 right leg):
 *         its part glows, saturates and grows slightly, its list line stays full; other parts and
 *         lines dim. -1 = none. focus (0..1, default 1) scales the emphasis so the film can ease it.
 */
(() => {
  // Segment geometry in screen points (390 × 844), measured from the app screenshot.
  // ly nudges the two tiny labels from the part's centre (the app sets the leg labels a bit higher).
  const SEGS = [
    { label: "Left arm", kg: "3.2", fat: "14.2", lean: false, x: 55.75, y: 293.75, w: 24, h: 53.5, rx: 10, ly: 0 },
    { label: "Right arm", kg: "3.1", fat: "14.8", lean: false, x: 137.25, y: 293.75, w: 24, h: 53.5, rx: 10, ly: 0 },
    { label: "Trunk", kg: "28.4", fat: "19.1", lean: true, x: 84.5, y: 291.5, w: 48, h: 65.25, rx: 7, ly: 0.3 },
    { label: "Left leg", kg: "9.8", fat: "20.3", lean: false, x: 83.75, y: 370, w: 20.5, h: 83.5, rx: 9.5, ly: -2.3 },
    { label: "Right leg", kg: "9.6", fat: "21.1", lean: false, x: 112.75, y: 370, w: 20.5, h: 83.5, rx: 9.5, ly: -2.3 },
  ];
  const TILES = [
    { cls: "w", caps: "Weight", v: 72.4, d: 2, from: 60, unit: "kg" },
    { cls: "f", caps: "Body Fat", v: 18.2, d: 1, from: 10, unit: "%" },
    { cls: "m", caps: "Muscle", v: 58.1, d: 1, from: 50, unit: "kg" },
  ];
  const METRICS = [
    ["BMI", "22.8"],
    ["Body Water", "60.1%"], // the same reading as the Dashboard and the Report (the site's screenshots disagree)
    ["Visceral Fat", "7"],
    ["Bone Mass", "4.0 kg"], // = the Report's bone mass 5.5% of 72.40 kg
  ];
  let uid = 0; // unique SVG ids per instance (set once at build time, never read by seek)

  I8.screens.results = (root, h) => {
    const { clamp, lerp, prog, ease } = h;
    const id = `rs${++uid}`;
    root.classList.add("scr-results");

    const kind = (s) => (s.lean ? "lean" : "fat");
    const rect = (s) => `x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx}"`;
    const parts = SEGS.map(
      (s, i) => `<g class="part ${kind(s)}">
          <rect class="back" ${rect(s)}/>
          <g class="vis">
            <rect class="halo" ${rect(s)} filter="url(#${id}-soft)"/>
            <rect class="fill" ${rect(s)} clip-path="url(#${id}-c${i})"/>
            <rect class="edge" ${rect(s)}/>
          </g>
        </g>`
    ).join("");
    const labels = SEGS.map((s) => {
      const cx = s.x + s.w / 2, cy = s.y + s.h / 2 + s.ly;
      return `<g class="lab ${kind(s)}">
          <text class="m" x="${cx}" y="${(cy + 0.35).toFixed(2)}">${s.kg}kg</text>
          <text class="f" x="${cx}" y="${(cy + 9.4).toFixed(2)}">${s.fat}% fat</text>
        </g>`;
    }).join("");
    const clips = SEGS.map(
      (s, i) => `<clipPath id="${id}-c${i}"><rect x="${s.x - 2}" y="${s.y - 2}" width="${s.w + 4}" height="${s.h + 4}"/></clipPath>`
    ).join("");

    root.innerHTML =
      h.status() +
      `<div class="title">Your Results</div>
       <div class="tiles">${TILES.map(
         (t) => `<div class="tile ${t.cls}"><div class="caps">${t.caps}</div><div class="val"><span class="num">${t.v.toFixed(t.d)}</span><span class="unit">${t.unit}</span></div></div>`
       ).join("")}</div>
       <div class="card seg">
         <div class="card-title">Segmental Analysis</div>
         <svg class="body" width="190" height="270" viewBox="16 209 190 270">
           <defs>${clips}<filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
           <g class="figure">
             <rect class="neutral" x="103.5" y="278" width="10" height="16" rx="2"/>
             <rect class="neutral" x="84.5" y="345" width="48" height="25.5" rx="5"/>
             <ellipse class="neutral" cx="108.75" cy="266.5" rx="13.75" ry="14"/>
             <text class="lr" x="44.75" y="309.2">L</text>
             <text class="lr" x="172.5" y="309.2">R</text>
           </g>
           ${parts}
           ${labels}
         </svg>
         <div class="seglist">${SEGS.map(
           (s) => `<div class="sl ${kind(s)}"><div class="sl-lab">${s.label}</div><div class="sl-val"><b>${s.kg} kg</b><span>${s.fat}% fat</span></div></div>`
         ).join("")}</div>
       </div>
       <div class="am-cap card-title">All Metrics</div>
       <div class="card am">${METRICS.map(
         ([k, v]) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span><span class="tag">Normal</span></div>`
       ).join("")}</div>
       <div class="foot">
         <div class="btn primary">Save my results</div>
         <div class="note">Your reading is ready — save it to track progress over time.</div>
       </div>` +
      h.home();

    // Cached lookups (no per-frame state).
    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];
    const title = $(".title");
    const tiles = $$(".tile").map((el, i) => ({ el, num: el.querySelector(".num"), t: TILES[i] }));
    const segCard = $(".card.seg");
    const segTitle = segCard.querySelector(".card-title");
    const figure = $(".figure");
    const labs = $$(".lab");
    const lines = $$(".sl");
    const P = $$(".part").map((g, i) => {
      const s = SEGS[i];
      const edge = g.querySelector(".edge");
      return {
        s,
        g,
        cx: s.x + s.w / 2,
        cy: s.y + s.h / 2,
        back: g.querySelector(".back"),
        vis: g.querySelector(".vis"),
        halo: g.querySelector(".halo"),
        fill: g.querySelector(".fill"),
        edge,
        draw: h.drawable(edge),
        clip: root.querySelector(`#${id}-c${i} rect`),
        lab: labs[i],
        line: lines[i],
      };
    });
    const amCap = $(".am-cap");
    const am = $(".card.am");
    const rows = $$(".card.am .row");
    const btn = $(".foot .btn");
    const note = $(".foot .note");

    const f3 = (v) => v.toFixed(3);
    const show = (el, k, dx, dy, alpha = k) => {
      el.style.opacity = f3(alpha);
      el.style.transform = k >= 1 ? "none" : `translate(${((1 - k) * dx).toFixed(2)}px, ${((1 - k) * dy).toFixed(2)}px)`;
    };

    return {
      seek(p, { seg = -1, focus = 1 } = {}) {
        p = clamp(+p || 0);

        // Title + tiles: 0–0.25
        show(title, ease.glide(prog(p, 0, 0.12)), 0, 10);
        tiles.forEach(({ el, num, t }, i) => {
          const t0 = 0.03 + i * 0.045;
          show(el, ease.glide(prog(p, t0, t0 + 0.13)), 0, 14);
          num.textContent = lerp(t.from, t.v, ease.out(prog(p, t0, 0.25))).toFixed(t.d);
        });

        // Segmental card + neutral figure: 0.17–0.28
        show(segCard, ease.glide(prog(p, 0.17, 0.27)), 0, 16);
        segTitle.style.opacity = f3(ease.out(prog(p, 0.18, 0.26)));
        figure.style.opacity = f3(ease.out(prog(p, 0.2, 0.28)));

        // Segments: 0.25–0.70, 0.09 each; seg emphasis on top
        const fi = Math.round(seg);
        const amt = fi >= 0 && fi < P.length ? clamp(+focus) : 0;
        P.forEach((q, i) => {
          const t0 = 0.25 + i * 0.09, t1 = t0 + 0.09;
          const kStroke = ease.inOut(prog(p, t0, t0 + 0.06));
          const kFill = ease.out(prog(p, t0 + 0.025, t1));
          const kLab = ease.out(prog(p, t0 + 0.05, t1));
          const kLine = ease.glide(prog(p, t0 + 0.02, t1));
          const on = i === fi ? amt : 0; // this part is the emphasised one
          const dim = amt > 0 && i !== fi ? amt : 0; // another part is emphasised

          q.draw(kStroke);
          q.edge.style.opacity = kStroke > 0 ? "1" : "0";
          q.edge.style.strokeWidth = (1.5 + 0.7 * on).toFixed(2);
          const fh = (q.s.h + 4) * kFill;
          q.clip.setAttribute("y", (q.s.y + q.s.h + 2 - fh).toFixed(2));
          q.clip.setAttribute("height", fh.toFixed(2));
          q.fill.style.filter = on > 0 ? `saturate(${(1 + 1.2 * on).toFixed(3)})` : "none";
          q.halo.style.opacity = f3(0.55 * on * kFill);
          // Dimmed parts fade over an opaque card-white backing so the hips don't show through.
          q.back.style.opacity = dim > 0 && kStroke > 0 ? "1" : "0";
          q.vis.style.opacity = f3(1 - 0.6 * dim);

          const tf = on > 0 ? `translate(${q.cx} ${q.cy}) scale(${(1 + 0.06 * on).toFixed(4)}) translate(${-q.cx} ${-q.cy})` : "";
          q.g.setAttribute("transform", tf);
          q.lab.setAttribute("transform", tf);
          q.lab.style.opacity = f3(kLab * (1 - 0.6 * dim));
          show(q.line, kLine, 8, 0, kLine * (1 - 0.65 * dim));
        });

        // All Metrics: caption + card 0.62–0.72, rows 0.65–0.90
        const kc = ease.glide(prog(p, 0.62, 0.72));
        show(amCap, kc, 0, 8);
        show(am, kc, 0, 12);
        rows.forEach((r, i) => {
          const t0 = 0.65 + i * 0.05;
          show(r, ease.glide(prog(p, t0, t0 + 0.1)), 0, 6);
        });

        // Footer: button 0.85–0.97, note 0.89–1
        show(btn, ease.glide(prog(p, 0.85, 0.97)), 0, 18);
        show(note, ease.glide(prog(p, 0.89, 1)), 0, 8);
      },
    };
  };
})();
