/**
 * Generates the placeholder photography the site ships with.
 *
 * Every slot on the site expects a real photograph. Until those arrive, this
 * writes a distinct, on-brand placeholder per slot so layouts hold their shape
 * and no two pages share an image path. Delete a file and drop the real
 * photograph in at the same path to replace it.
 *
 *   node scripts/generate-placeholders.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "images");

const INK = "#141416";
const INK_DEEP = "#0b0b0c";
const LIME = "#57e64b";

/** @type {{file: string, w: number, h: number, label: string, angle: number, warm?: boolean}[]} */
const slots = [
  { file: "hero-coaching.jpg", w: 2400, h: 1500, label: "Hero · Myo coaching a client", angle: 22, corner: true },
  { file: "method-hero.jpg", w: 1600, h: 1067, label: "Method · the three hours", angle: 8 },
  { file: "method-session.jpg", w: 1400, h: 1050, label: "Method · a working set", angle: 34 },
  { file: "method-eating-out.jpg", w: 1200, h: 1500, label: "Method · eating out", angle: 15, warm: true },
  { file: "travel-hawker-lunch.jpg", w: 1200, h: 1500, label: "Travel · hawker lunch", angle: 48, warm: true },
  { file: "about-myo.jpg", w: 1200, h: 1500, label: "About · portrait of Myo", angle: 12 },
  { file: "about-gym.jpg", w: 1600, h: 1067, label: "About · the gym floor", angle: 40 },
  { file: "pricing-session.jpg", w: 1600, h: 1067, label: "Pricing · a session in progress", angle: 28 },
  { file: "contact-session.jpg", w: 1600, h: 1067, label: "Contact · first session", angle: 18 },
];

/** @type {{id: string, before: string, after: string}[]} */
const pairs = [
  { id: "recomposition", before: "83kg · before", after: "82kg · after" },
  { id: "ten-kilos", before: "85kg · before", after: "75kg · after" },
  { id: "five-percent", before: "Month 1 · before", after: "Month 5 · after" },
];

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c],
  );
}

function svg({ w, h, label, angle, warm = false, tint = 0, corner = false }) {
  const base = tint ? INK_DEEP : INK;
  const accent = warm ? "#f2a81d" : LIME;
  const glyph = Math.round(Math.min(w, h) * 0.14);
  const labelSize = Math.round(Math.min(w, h) * 0.032);
  const noteSize = Math.round(Math.min(w, h) * 0.024);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${tint ? INK : INK_DEEP}"/>
    </linearGradient>
    <pattern id="p" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
      <rect width="46" height="46" fill="none"/>
      <rect width="23" height="46" fill="${accent}" fill-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#p)"/>
  ${
    corner
      ? `<text x="${w - 40}" y="${h - 40}" text-anchor="end" font-family="DejaVu Sans, sans-serif"
        font-size="${noteSize}" fill="#ffffff" fill-opacity="0.3">${escapeXml(label)} — placeholder</text>`
      : ""
  }
  <g transform="translate(${w / 2}, ${h / 2 - glyph * 0.35})" ${corner ? 'opacity="0"' : ""}>
    <rect x="${-glyph}" y="${-glyph * 0.72}" width="${glyph * 2}" height="${glyph * 1.44}" rx="${glyph * 0.12}"
          fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="${Math.max(2, glyph * 0.045)}"/>
    <circle cx="${-glyph * 0.42}" cy="${-glyph * 0.26}" r="${glyph * 0.16}" fill="${accent}" fill-opacity="0.55"/>
    <path d="M ${-glyph} ${glyph * 0.44} L ${-glyph * 0.2} ${-glyph * 0.16} L ${glyph * 0.32} ${glyph * 0.3} L ${glyph * 0.62} ${glyph * 0.04} L ${glyph} ${glyph * 0.44} Z"
          fill="${accent}" fill-opacity="0.4"/>
  </g>
  ${
    corner
      ? ""
      : `<text x="${w / 2}" y="${h / 2 + glyph * 1.3}" text-anchor="middle" font-family="DejaVu Sans, sans-serif"
        font-size="${labelSize}" font-weight="bold" fill="#ffffff" fill-opacity="0.85">${escapeXml(label)}</text>
  <text x="${w / 2}" y="${h / 2 + glyph * 1.3 + labelSize * 1.6}" text-anchor="middle" font-family="DejaVu Sans, sans-serif"
        font-size="${noteSize}" fill="#ffffff" fill-opacity="0.42">Placeholder — replace with the real photograph</text>`
  }
</svg>`);
}

async function write(file, options) {
  const target = path.join(OUT, file);
  await mkdir(path.dirname(target), { recursive: true });
  await sharp(svg(options)).jpeg({ quality: 82, progressive: true }).toFile(target);
  console.log("wrote", path.relative(process.cwd(), target));
}

await mkdir(OUT, { recursive: true });

for (const slot of slots) {
  await write(slot.file, slot);
}

for (const [index, pair] of pairs.entries()) {
  const angle = 20 + index * 25;
  await write(`transformations/${pair.id}-before.jpg`, {
    w: 900,
    h: 1200,
    label: pair.before,
    angle,
    tint: 1,
  });
  await write(`transformations/${pair.id}-after.jpg`, {
    w: 900,
    h: 1200,
    label: pair.after,
    angle: angle + 12,
  });
}
