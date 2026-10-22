/* IAM pane: Match Readiness — athletes sorted into three tiers by their last 2 days of data.
 *
 *   I8.iam.panes.readiness(pane, h) → { seek(p, opts) }      (sidebar active: "Match Readiness")
 *
 * Timeline over p (pure function of p and opts):
 *   0.00–0.12  title, subtitle and "How tiers are assigned" fade up
 *   0.05–0.35  three summary cards rise in (staggered); counts and percentages count up
 *   0.25–0.45  column headers fade in, their underlines draw left → right
 *   0.35–1.00  athlete cards drop into their columns, row by row across the first two columns,
 *              then Hugo Lambert lands alone in "Consider Resting" (0.82–1.00)
 *
 * opts (optional, all pure):
 *   focus   "go" | "care" | "rest" | athlete key ("hugo", "tomas", …) — dims everything else
 *   focusP  0..1 how far the focus dim has gone (default 1 when focus is set)
 */
(() => {
  const svg = (d, w = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    check: svg(`<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`),
    warn: svg(`<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>`),
    bed: svg(`<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/>`),
    info: svg(`<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`),
    rec: svg(`<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`),
    strain: svg(`<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`),
    sleep: svg(`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`),
    spo2: svg(`<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>`),
  };

  const TIERS = [
    { key: "go", icon: IC.check, title: "Ready to Go Hard", n: 8, pct: 40, sub: "Strong recovery · No risk flags · Good load tolerance" },
    { key: "care", icon: IC.warn, title: "Manage Carefully", n: 10, pct: 50, sub: "Moderate recovery · Mild fatigue signals · Monitor load" },
    { key: "rest", icon: IC.bed, title: "Consider Resting", n: 1, pct: 5, sub: "Low recovery · Active risk flags · Reduce or skip load" },
  ];

  // [key, name, summary, recovery, strain, sleep, spo2, tag]
  const ATHLETES = {
    go: [
      ["matteo", "Matteo Rinaldi", "Green recovery average (72%)", 72, "11.6", "8.2", "96.2"],
      ["lukas", "Lukas Brenner", "Green recovery average (67%)", 67, "10.6", "8.2", "97.2"],
      ["oliver", "Oliver Hartley", "Green recovery average (80%)", 80, "11.8", "7.8", "98.0"],
      ["adrien", "Adrien Moreau", "Green recovery average (79%)", 79, "11.2", "7.8", "95.5"],
    ],
    care: [
      ["jonas", "Jonas Lindqvist", "Yellow recovery average (61%)", 61, "12.0", "7.5", "98.2"],
      ["tomas", "Tomás Ferreira", "Sleep debt on 1 day", 63, null, "7.7", "98.1", "sleep debt"],
      ["mikkel", "Mikkel Sørensen", "Yellow recovery average (61%)", 61, "11.8", "7.1", "98.3"],
      ["nico", "Nico Varga", "Yellow recovery average (65%)", 65, "10.5", "8.2", "95.3"],
    ],
    rest: [["hugo", "Hugo Lambert", "Red recovery today (3%)", 4, "12.0", "7.9", "94.0", "low recovery"]],
  };

  const chip = (icon, text) => `<span class="chip">${icon}<span>${text}</span></span>`;
  const card = ([key, name, summary, rec, strain, sleep, spo2, tag]) => `
    <div class="card" data-k="${key}">
      <div class="name">${name}</div>
      <div class="sum">${summary}</div>
      <div class="chips">
        ${chip(IC.rec, `${rec}% recovery`)}${strain ? chip(IC.strain, `${strain} strain`) : ""}${chip(IC.sleep, `${sleep}h sleep`)}${chip(IC.spo2, `SpO<sub>2</sub> ${spo2}%`)}
      </div>
      ${tag ? `<div class="tag">${tag}</div>` : ""}
    </div>`;

  // Order the cards land in: row by row across the first two columns, the lone third-column card last.
  const ORDER = ["matteo", "jonas", "lukas", "tomas", "oliver", "mikkel", "adrien", "nico", "hugo"];

  I8.iam.panes.readiness = (pane, h) => {
    const { clamp, lerp, prog, ease } = h;
    pane.classList.add("pane-readiness");
    pane.innerHTML = `
      <div class="rd">
        <div class="head">
          <div class="titles">
            <div class="h1">Match Readiness</div>
            <div class="sub">Athletes categorised by their last 2 days of health and recovery data.</div>
          </div>
          <div class="how">${IC.info}<span>How tiers are assigned</span></div>
        </div>
        <div class="stats">
          ${TIERS.map(
            (t) => `
            <div class="stat ${t.key}">
              <div class="ic">${t.icon}</div>
              <div><div class="n">${t.n}</div><div class="l">${t.title} · <span class="pct">${t.pct}</span>%</div></div>
            </div>`
          ).join("")}
        </div>
        <div class="cols">
          ${TIERS.map(
            (t) => `
            <div class="col ${t.key}" data-k="${t.key}">
              <div class="colhead">
                <div class="ic">${t.icon}</div>
                <div>
                  <div class="ct"><b>${t.title}</b><span class="badge">${t.n}</span></div>
                  <div class="cs">${t.sub}</div>
                </div>
                <i class="rule"></i>
              </div>
              <div class="list">${ATHLETES[t.key].map(card).join("")}</div>
            </div>`
          ).join("")}
        </div>
      </div>`;

    const $ = (s) => pane.querySelector(s);
    const $$ = (s) => [...pane.querySelectorAll(s)];
    const head = $(".head");
    const stats = $$(".stat").map((el, i) => ({ el, n: el.querySelector(".n"), pct: el.querySelector(".pct"), t: TIERS[i] }));
    const cols = $$(".col").map((el) => ({ el, key: el.dataset.k, head: el.querySelector(".colhead"), rule: el.querySelector(".rule") }));
    const cards = $$(".card").map((el) => ({ el, key: el.dataset.k, col: el.closest(".col").dataset.k, tag: el.querySelector(".tag") }));
    const byKey = Object.fromEntries(cards.map((c) => [c.key, c]));

    const show = (el, a, dy = 0, s = 1) => {
      el.style.opacity = a.toFixed(3);
      el.style.transform = dy || s !== 1 ? `translateY(${dy.toFixed(2)}px) scale(${s.toFixed(4)})` : "none";
    };

    return {
      seek(p, opts = {}) {
        p = clamp(p);

        // Title block
        const tp = ease.out(prog(p, 0, 0.12));
        show(head, tp, lerp(10, 0, tp));

        // Summary cards, staggered, counts climbing
        stats.forEach((s, i) => {
          const t0 = 0.05 + i * 0.06;
          const a = ease.out(prog(p, t0, t0 + 0.14));
          show(s.el, a, lerp(16, 0, a));
          const c = ease.inOut(prog(p, t0 + 0.02, 0.23 + i * 0.06));
          s.n.textContent = String(Math.round(lerp(0, s.t.n, c)));
          s.pct.textContent = String(Math.round(lerp(0, s.t.pct, c)));
        });

        // Column headers + underline draw
        cols.forEach((c, i) => {
          const t0 = 0.25 + i * 0.04;
          const a = ease.out(prog(p, t0, t0 + 0.12));
          show(c.head, a, lerp(8, 0, a));
          c.rule.style.transform = `scaleX(${ease.inOut(prog(p, t0 + 0.02, t0 + 0.12)).toFixed(4)})`;
        });

        // Athlete cards drop into their columns
        ORDER.forEach((k, j) => {
          const c = byKey[k];
          const last = j === ORDER.length - 1;
          const t0 = last ? 0.82 : 0.35 + j * 0.055;
          const t1 = last ? 1 : t0 + 0.15;
          const q = prog(p, t0, t1);
          const a = ease.out(clamp(q * 1.8));
          const d = ease.glide(q);
          show(c.el, a, lerp(-18, 0, d), lerp(0.97, 1, d));
          if (c.tag) {
            const tq = ease.out(prog(q, 0.55, 1));
            c.tag.style.opacity = tq.toFixed(3);
            c.tag.style.transform = `scale(${lerp(0.8, 1, tq).toFixed(4)})`;
          }
        });

        // Optional focus: dim everything but one tier or one athlete
        const f = opts.focus;
        const fp = f ? clamp(opts.focusP ?? 1) : 0;
        const dim = (on) => (on ? 1 : lerp(1, 0.28, ease.inOut(fp)));
        const tierFocus = TIERS.some((t) => t.key === f);
        const athleteCol = byKey[f]?.col;
        stats.forEach((s) => (s.el.style.filter = fp ? `opacity(${dim(!f || s.t.key === f || s.t.key === athleteCol)})` : ""));
        cols.forEach((c) => (c.head.style.filter = fp ? `opacity(${dim(c.key === f || c.key === athleteCol)})` : ""));
        cards.forEach((c) => (c.el.style.filter = fp ? `opacity(${dim(tierFocus ? c.col === f : c.key === f)})` : ""));
      },
    };
  };
})();
