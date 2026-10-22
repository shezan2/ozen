/* Full Report — the whole reading as one scrolling page, opened from the dashboard.
 *
 * Fixed header (back chevron, "Full Report", date, share icon) and fixed footer (Share, Save as PDF,
 * tab bar with Dashboard active). Between them the scroll area holds six cards: the three headline
 * bars, Fat Analysis, Weight Control, Muscle Balance, Segmental Fat Analysis and Other Measurements.
 * scroll = 0 is the screenshot's framing (the first card's top tucked just under the header).
 *
 * seek(p, { scroll = 0, press = 0 })
 *   0.10–0.60  the seven bars (Weight, Body Fat Mass, Skeletal Muscle, BMI, Body Fat, Visceral Fat,
 *              Obesity) grow from 0 to their value, one after another (each 0.26 long, 0.04 apart)
 *   scroll     content offset in pt, clamped to 0..maxScroll
 *   press      0..1 dips "Save as PDF" for a tap (deepest at 0.5)
 * api.maxScroll  how far the content scrolls (pt), measured once after layout.
 */
(() => {
  // Bar fills are the fractions of the track measured from the app screenshot.
  const BARS = [
    ["Weight", "72.40", "kg", 0.5427],
    ["Body Fat Mass", "13.20", "kg", 0.6067],
    ["Skeletal Muscle", "33.3", "kg", 0.5061],
  ];
  const FAT = [
    ["BMI", "22.8", "kg/m²", 0.5534],
    ["Body Fat", "18.2", "%", 0.6067],
    ["Visceral Fat", "7", "level", 0.3506],
    ["Obesity", "104.2", "%", 0.5701],
  ];
  const CONTROL = [
    ["Normal weight", "69.50 kg"],
    ["Weight Control", "<i>−</i>1.50 kg"],
    ["Fat mass control", "<i>−</i>1.50 kg"],
    ["Muscle control", "+0.00 kg"],
    ["Health assessment", "88.5 points", "good"],
  ];
  const MUSCLE = [
    ["Left arm", "3.20", "100.0%"],
    ["Right arm", "3.10", "96.9%"],
    ["Trunk", "28.40", "108.8%"],
    ["Left leg", "9.80", "106.5%"],
    ["Right leg", "9.60", "104.3%"],
  ];
  const SEGFAT = [
    ["Left arm", "0.50", "83.3%"],
    ["Right arm", "0.50", "83.3%"],
    ["Trunk", "5.80", "131.8%"],
    ["Left leg", "2.00", "111.1%"],
    ["Right leg", "2.00", "111.1%"],
  ];
  const OTHER = [
    ["Basal Metabolic Rate", "1712 kcal", "1565~1832"],
    ["Fat-free Body Weight", "59.20 kg", "53.30~65.20"],
    ["Subcutaneous Fat", "10.60 kg", "6.23~12.09"],
    ["Subcutaneous Fat %", "14.6%", "8.6~16.7"],
    ["Skeletal Muscle", "33.30 kg", "29.90~36.49"],
    ["Skeletal Muscle %", "46.0%", "41.3~50.4"],
    ["Muscle Mass %", "80.2%", "68.6~84.0"],
    ["Bone Mass %", "5.5%", "5.0~6.1"],
    ["Protein %", "16.2%", "14.5~17.8"],
    ["Body Water %", "60.1%", "54.1~66.2"],
    ["Metabolic Age", "27 yrs", "≤35"],
    ["Skeletal Muscle Index", "8.1", "7.0~8.6"],
  ];

  // Vertical geometry inside the cards (pt from the card's top), measured from the app screenshots.
  // A text line is placed by the centre of its capitals (Inter centres caps in its line box).
  const G = {
    title: 22.4, // card title
    bar: { pitch: 44.6, text: 22.75, bar: 40.35, after: 22.45 }, // label/value line, then its bar
    fatHead: 43.35, // Fat Analysis: rows start below the title and LOW · SUFFICIENT · HIGH (40.5)
    caps: 40.5,
    list: { top: 34, pitch: 36.375, after: 15.6 }, // Weight Control
    seg: { caps: 46.4, top: 52.25, pitch: 45.75, name: -6.9, tag: 9.6, after: 15.5 }, // segment tables
    other: { top: 34.8, pitch: 41.18, after: 15.5 },
  };
  const LINE = 18; // line box height for every text line
  const at = (c) => `top:${(c - LINE / 2).toFixed(2)}px`;
  const hair = (y) => `<b class="hr" style="top:${(y - 0.5).toFixed(2)}px"></b>`;

  const barRows = (rows, y0) =>
    rows
      .map(([label, v, unit], i) => {
        const y = y0 + i * G.bar.pitch;
        return `<div class="ln" style="${at(y + G.bar.text)}"><span>${label}</span><span class="v">${v}<em>${unit}</em></span></div>
          <div class="track" style="top:${(y + G.bar.bar - 3.5).toFixed(2)}px"><div class="fill"></div></div>`;
      })
      .join("");

  const segTable = (title, rows) => {
    const S = G.seg;
    return `<div class="ttl" style="${at(G.title)}">${title}</div>
      <div class="ln caps" style="${at(S.caps)}"><span>Segment</span><span class="mass">Mass</span><span class="pct">% of std</span></div>
      ${rows
        .map(([name, kg, pct], i) => {
          const c = S.top + (i + 0.5) * S.pitch;
          return `${hair(S.top + i * S.pitch)}
            <div class="ln name" style="${at(c + S.name)}">${name}</div>
            <div class="ln tag" style="${at(c + S.tag)}">Normal</div>
            <div class="ln seg" style="${at(c)}"><span class="mass">${kg}<em>kg</em></span><span class="pct">${pct}</span></div>`;
        })
        .join("")}`;
  };

  const height = {
    bars: BARS.length * G.bar.pitch + G.bar.after,
    fat: G.fatHead + FAT.length * G.bar.pitch + G.bar.after,
    control: G.list.top + CONTROL.length * G.list.pitch + G.list.after,
    seg: G.seg.top + 5 * G.seg.pitch + G.seg.after,
    other: G.other.top + OTHER.length * G.other.pitch + G.other.after,
  };
  const card = (cls, h, inner) => `<div class="card ${cls}" style="height:${h.toFixed(2)}px">${inner}</div>`;

  const CHEVRON = `<svg viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M8.2 1.4L1.8 7.8l6.4 6.4"/></svg>`;
  const SHARE = `<svg viewBox="0 0 15 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.6 6.3H3.3a2.5 2.5 0 0 0-2.5 2.5v5.9a2.5 2.5 0 0 0 2.5 2.5h8.4a2.5 2.5 0 0 0 2.5-2.5V8.8a2.5 2.5 0 0 0-2.5-2.5h-1.3"/><path d="M7.5 11.2V1"/><path d="M4.4 4L7.5 0.9 10.6 4"/></svg>`;

  I8.screens.report = (root, h) => {
    root.classList.add("scr-report");
    root.innerHTML =
      h.status() +
      `<div class="back">${CHEVRON}</div>
       <div class="head">Full Report</div>
       <div class="when">Sep 24, 2026 · 6:12 PM</div>
       <div class="share">${SHARE}</div>
       <div class="view"><div class="content">
         ${card("bars", height.bars, barRows(BARS, 0))}
         ${card(
           "fat",
           height.fat,
           `<div class="ttl" style="${at(G.title)}">Fat Analysis</div>
            <div class="ln caps range" style="${at(G.caps)}"><span>Low</span><span>Sufficient</span><span>High</span></div>
            ${barRows(FAT, G.fatHead)}`
         )}
         ${card(
           "control",
           height.control,
           `<div class="ttl" style="${at(G.title)}">Weight Control</div>
            ${CONTROL.map(([l, v, good], i) => {
              const y = G.list.top + i * G.list.pitch;
              return `${i ? hair(y) : ""}<div class="ln" style="${at(y + G.list.pitch / 2)}"><span>${l}</span><span class="v${good ? " good" : ""}">${v}</span></div>`;
            }).join("")}`
         )}
         ${card("muscle", height.seg, segTable("Muscle Balance", MUSCLE))}
         ${card("segfat", height.seg, segTable("Segmental Fat Analysis", SEGFAT))}
         ${card(
           "other",
           height.other,
           `<div class="ttl" style="${at(G.title)}">Other Measurements</div>
            ${OTHER.map(([l, v, r], i) => {
              const y = G.other.top + i * G.other.pitch;
              return `${i ? hair(y) : ""}<div class="ln" style="${at(y + G.other.pitch / 2)}"><span>${l}</span><span class="v">${v}</span><span class="r">${r}</span></div>`;
            }).join("")}`
         )}
       </div></div>
       <div class="foot"><div class="btn ghost">Share</div><div class="btn primary pdf">Save as PDF</div></div>` +
      h.tabs("dashboard") +
      h.home();

    const $ = (s) => root.querySelector(s);
    const view = $(".view");
    const content = $(".content");
    const fills = [...root.querySelectorAll(".fill")];
    const fracs = [...BARS, ...FAT].map((b) => b[3]);
    const pdf = $(".pdf");

    // Scroll range: content height (incl. its bottom padding) minus the visible window. Every card and
    // row has an explicit height, so this does not depend on font loading.
    const measure = () => Math.max(0, Math.round((content.offsetHeight - view.clientHeight) * 100) / 100);
    let max = measure();
    const maxScroll = () => max || (max = measure()); // re-measure if root was not laid out at build time

    return {
      get maxScroll() {
        return maxScroll();
      },
      seek(p, { scroll = 0, press = 0 } = {}) {
        const { clamp, prog, ease } = h;

        // Bars grow in turn: 0.10 + 0.04·i → +0.26.
        fills.forEach((el, i) => {
          const q = ease.out(prog(p, 0.1 + i * 0.04, 0.36 + i * 0.04));
          el.style.width = `${(fracs[i] * q * 100).toFixed(3)}%`;
          el.style.visibility = q > 0 ? "visible" : "hidden";
        });

        const s = clamp(+scroll || 0, 0, maxScroll());
        content.style.transform = `translateY(${(-s).toFixed(2)}px)`;

        const dip = Math.sin(Math.PI * clamp(press));
        pdf.style.transform = dip > 0.001 ? `scale(${(1 - dip * 0.03).toFixed(4)})` : "none";
        pdf.style.filter = dip > 0.01 ? `brightness(${(1 - dip * 0.12).toFixed(4)})` : "none";
      },
    };
  };
})();
