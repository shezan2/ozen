/* IAM pane: Active Roster — the athlete table with wearable status, group chips, recovery, strain,
 * risk flags and last-sync freshness. Measured against the intelli8.ai "Roster with data flags" screen
 * (reference frame scaled to 1440 × 900).
 *
 *   I8.iam.panes.roster(pane, h) → { seek(p, opts) }      (sidebar active: "Roster")
 *
 * Timeline over p (pure function of p and opts):
 *   0.00–0.15  title + subtitle fade up (0–0.11), SYNC ALL / ADD ATHLETE buttons follow (0.04–0.15)
 *   0.10–0.25  table card rises in with the search field and the column header
 *   0.20–0.85  rows slide in from the right, staggered top → bottom (each 0.14 long); the recovery %
 *              counts up from 0 in its colour, the risk flag / CLEAR pops in at the end of the row
 *
 * opts (optional, all pure):
 *   stale  0..1  highlights the Pieter van Aken row — soft yellow row tint and outline around the
 *                stale-data flag ("STALE 3 days ago"); linear, ease it on the caller side
 *
 * Compliance: the demo data's "ILL" risk flag is shown as "LOW" (low recovery).
 */
(() => {
  const svg = (d, w = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    sync: svg(`<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>`, 2),
    userPlus: svg(`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>`, 2),
    search: svg(`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`, 2),
    sort: svg(`<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>`, 2),
    active: svg(`<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`, 2.2),
    clock: svg(`<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`, 2),
    check: `<svg viewBox="0 0 7 8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M.9 4.6 2.6 6.6 6.1 1.2"/></svg>`,
    dots: svg(`<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>`, 2.4),
  };

  // name, group, recovery %, strain, strain is live (clock), risk ["clear" | [text, tone, note]], sync
  const ROWS = [
    ["Matteo Rinaldi", "Goalkeepers", 89, "7.3", 1, "clear"],
    ["Jonas Lindqvist", "Goalkeepers", 75, "7.0", 1, "clear"],
    ["Pieter van Aken", "Goalkeepers", 30, "13.2", 0, ["LOW", "red", "as of 30 Sep"], "stale"],
    ["Lukas Brenner", "Defenders", 67, "6.4", 1, "clear"],
    ["Tomás Ferreira", "Defenders", 63, "7.8", 1, ["SLP", "mint"]],
    ["Oliver Hartley", "Defenders", 72, "7.1", 1, "clear"],
    ["Mikkel Sørensen", "Defenders", 76, "6.8", 1, "clear"],
    ["Adrien Moreau", "Defenders", 84, "7.3", 1, "clear"],
    ["Nico Varga", "Defenders", 48, "7.4", 1, "clear"],
    ["Luca Benedetti", "Midfielders", 56, "7.2", 1, "clear"],
    ["Elias Kowalski", "Midfielders", 58, "7.1", 1, "clear"],
    ["Hugo Lambert", "Midfielders", 3, "6.3", 1, ["LOW", "red"]],
    // cut off by the bottom edge of the pane, as on the reference
    ["Rafael Duarte", "Midfielders", 71, "7.5", 1, "clear"],
  ];
  const STALE_ROW = 2;
  const tone = (v) => (v >= 67 ? "green" : v >= 34 ? "yellow" : "red");

  const risk = (r) =>
    r === "clear"
      ? `<span class="clear">${IC.check}CLEAR</span>`
      : `<span class="rflag ${r[1]}">${r[0]}</span>${r[2] ? `<span class="asof">${r[2]}</span>` : ""}`;

  const row = ([name, group, rec, strain, live, r, sync], i) => `
    <div class="tr" data-i="${i}">
      <span class="c-name">${name}</span>
      <span class="c-wear"><span class="badge">${IC.active}ACTIVE</span></span>
      <span class="c-group"><span class="chip">${group}</span></span>
      <span class="c-rec ${tone(rec)}" data-v="${rec}">${rec}%</span>
      <span class="c-strain${live ? "" : " past"}">${strain}${live ? IC.clock : ""}</span>
      <span class="c-risk">${risk(r)}</span>
      <span class="c-sync">${sync === "stale" ? `<b>STALE</b> 3 days ago` : "1 minute ago"}</span>
      <span class="c-act">${IC.sync}</span>
      <span class="c-more">${IC.dots}</span>
    </div>`;

  I8.iam.panes.roster = (pane, h) => {
    const { clamp, lerp, prog, ease } = h;
    pane.classList.add("pane-roster");
    pane.innerHTML = `
      <div class="rs">
        <div class="head">
          <div class="titles">
            <div class="h1">Active Roster</div>
            <div class="sub">Manage athletes and view individual daily metrics.</div>
          </div>
          <div class="btns">
            <div class="btn ghost">${IC.sync}<span>SYNC ALL</span></div>
            <div class="btn solid">${IC.userPlus}<span>ADD ATHLETE</span></div>
          </div>
        </div>
        <div class="card">
          <div class="search">${IC.search}<span>Search roster...</span></div>
          <div class="thead">
            <span class="h-name">Athlete${IC.sort}</span>
            <span class="h-wear">Wearable</span>
            <span class="h-group">Groups</span>
            <span class="h-rec">${IC.sort}Recovery</span>
            <span class="h-strain">${IC.sort}Strain</span>
            <span class="h-risk">Risk${IC.sort}</span>
            <span class="h-sync">${IC.sort}Last Sync</span>
          </div>
          <div class="rows">
            ${ROWS.map(row).join("")}
            <div class="stale-hl"></div>
          </div>
        </div>
      </div>`;

    const $ = (s) => pane.querySelector(s);
    const titles = $(".head .titles");
    const btns = [...pane.querySelectorAll(".head .btn")];
    const card = $(".card");
    const inner = [$(".search"), $(".thead")];
    const hl = $(".stale-hl");
    const rows = [...pane.querySelectorAll(".rows .tr")].map((el) => {
      const rec = el.querySelector(".c-rec");
      return { el, rec, v: +rec.dataset.v, pop: el.querySelector(".c-risk"), sync: el.querySelector(".c-sync") };
    });
    const text = (el, s) => {
      if (el.textContent !== s) el.textContent = s;
    };
    const rise = (el, q, dy) => {
      el.style.opacity = q.toFixed(3);
      el.style.transform = q >= 1 ? "" : `translateY(${((1 - q) * dy).toFixed(2)}px)`;
    };

    return {
      seek(p, opts = {}) {
        p = clamp(p);

        // Title block and buttons: 0–0.15
        rise(titles, ease.out(prog(p, 0, 0.11)), 10);
        btns.forEach((el, i) => rise(el, ease.out(prog(p, 0.03 + i * 0.01, 0.14 + i * 0.01)), 10));

        // Table card: 0.10–0.25 (search + header settle slightly after the card)
        rise(card, ease.out(prog(p, 0.1, 0.22)), 18);
        inner.forEach((el, i) => rise(el, ease.out(prog(p, 0.13 + i * 0.02, 0.23 + i * 0.02)), 6));

        // Rows: 0.20–0.85, each 0.14 long, top → bottom
        const n = rows.length;
        let staleA = 0;
        rows.forEach(({ el, rec, v, pop }, i) => {
          const t0 = 0.2 + i * ((0.85 - 0.2 - 0.14) / (n - 1));
          const q = prog(p, t0, t0 + 0.14);
          const a = ease.out(prog(q, 0, 0.75));
          if (i === STALE_ROW) staleA = a;
          el.style.opacity = a.toFixed(3);
          el.style.transform = a >= 1 ? "" : `translateX(${((1 - a) * 26).toFixed(2)}px)`;
          text(rec, `${Math.round(v * ease.out(prog(q, 0.08, 0.92)))}%`);
          const f = ease.out(prog(q, 0.55, 1));
          pop.style.opacity = f.toFixed(3);
          pop.style.transform = f >= 1 ? "" : `scale(${lerp(0.82, 1, f).toFixed(3)})`;
        });

        // Stale-data highlight on Pieter van Aken
        const s = clamp(+opts.stale || 0);
        hl.style.opacity = (s * staleA).toFixed(3);
      },
    };
  };
})();
