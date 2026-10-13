#!/usr/bin/env node
/*
 * Renders the launch film frame by frame with headless Chromium and encodes it with ffmpeg.
 *
 *   node render.mjs                      # 1920×1080 · 60fps · motion blur → out/ozen-launch-15s.mp4
 *   node render.mjs --stills 1.2,3.4     # review stills → out/stills/
 *   node render.mjs --sub 1              # no motion blur (fast draft)
 *
 * Options: --fps 60  --sub 4 (motion-blur samples per frame)  --shutter 0.5 (180°)
 *          --scale 1 (device scale; 2 = supersampled)  --workers 4  --crf 12  --grain 4  --out <file>
 *
 * Needs Playwright (npm i -D playwright, or a global install on NODE_PATH) and ffmpeg.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { cpus } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright not found. Install it with `npm i -D playwright` (or put a global install on NODE_PATH).");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "1"]);
    return acc;
  }, []),
);

const FPS = Number(args.fps ?? 60);
const SUB = Math.max(1, Number(args.sub ?? 4));
const SHUTTER = Number(args.shutter ?? 0.5);
const SCALE = Number(args.scale ?? 1);
const WORKERS = Math.max(1, Number(args.workers ?? Math.min(4, cpus().length)));
const CRF = String(args.crf ?? 12);
const OUT = resolve(here, args.out ?? "out/ozen-launch-15s.mp4");
const URL = pathToFileURL(join(here, "index.html")).href + "?render" + (args.debug ? `&debug=${encodeURIComponent(args.debug)}` : "");
const GRAIN = Number(args.grain ?? 4); // temporal luma grain added at encode (0 = off)

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE });
  await page.goto(URL);
  await page.evaluate(() => window.film.ready);
  return page;
}

async function grab(page, t) {
  await page.evaluate((x) => window.film.seek(x), t);
  return page.screenshot({ type: "png", animations: "allow", caret: "initial" });
}

function launch() {
  return chromium.launch({
    args: ["--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none", "--hide-scrollbars"],
  });
}

async function stills(times) {
  const dir = resolve(here, "out/stills");
  mkdirSync(dir, { recursive: true });
  const browser = await launch();
  const page = await openPage(browser);
  for (const t of times) {
    const buf = await grab(page, t);
    const file = join(dir, `t${t.toFixed(2).padStart(5, "0")}.png`);
    writeFileSync(file, buf);
    console.log(file);
  }
  await browser.close();
}

function ffmpeg(argv) {
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => p.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
  return { stdin: p.stdin, done };
}

async function renderChunk(browser, frames, file, onFrame) {
  const page = await openPage(browser);
  const filters = [];
  if (SCALE !== 1) filters.push("scale=1920:1080:flags=lanczos");
  if (SUB > 1) {
    filters.push(`tmix=frames=${SUB}:weights='${Array(SUB).fill(1).join(" ")}'`);
    filters.push(`select='eq(mod(n\\,${SUB})\\,${SUB - 1})'`);
    filters.push(`setpts=N/(${FPS}*TB)`);
  }
  const ff = ffmpeg([
    "-f", "image2pipe", "-framerate", String(FPS * SUB), "-c:v", "png", "-i", "-",
    ...(filters.length ? ["-vf", filters.join(",")] : []),
    "-r", String(FPS), "-c:v", "libx264rgb", "-qp", "0", "-preset", "ultrafast", file,
  ]);
  for (const f of frames) {
    for (let k = 0; k < SUB; k++) {
      const offset = SUB > 1 ? ((k + 0.5) / SUB - 0.5) * SHUTTER : 0;
      const t = Math.max(0, (f + offset) / FPS);
      const buf = await grab(page, t);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    }
    onFrame();
  }
  ff.stdin.end();
  await ff.done;
  await page.close();
}

async function film() {
  const total = Math.round(15 * FPS);
  const tmp = resolve(here, "out/.chunks");
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  mkdirSync(dirname(OUT), { recursive: true });

  const per = Math.ceil(total / WORKERS);
  const chunks = Array.from({ length: WORKERS }, (_, w) => {
    const frames = [];
    for (let f = w * per; f < Math.min(total, (w + 1) * per); f++) frames.push(f);
    return { frames, file: join(tmp, `chunk${w}.mkv`) };
  }).filter((c) => c.frames.length);

  const started = Date.now();
  let done = 0;
  const tick = () => {
    done++;
    if (done % 30 === 0 || done === total) {
      const el = (Date.now() - started) / 1000;
      process.stdout.write(`\r${done}/${total} frames · ${el.toFixed(0)}s elapsed · ~${((el / done) * (total - done)).toFixed(0)}s left   `);
    }
  };

  const browsers = await Promise.all(chunks.map(() => launch()));
  await Promise.all(chunks.map((c, i) => renderChunk(browsers[i], c.frames, c.file, tick)));
  await Promise.all(browsers.map((b) => b.close()));
  process.stdout.write("\n");

  const list = join(tmp, "list.txt");
  writeFileSync(list, chunks.map((c) => `file '${c.file}'`).join("\n"));
  const enc = ffmpeg([
    "-f", "concat", "-safe", "0", "-i", list,
    "-vf", [
      "scale=out_color_matrix=bt709:out_range=tv",
      "format=yuv444p",
      ...(GRAIN > 0 ? [`noise=c0s=${GRAIN}:c0f=t+u`] : []),
      "format=yuv420p",
    ].join(","),
    "-c:v", "libx264", "-preset", "slow", "-crf", CRF, "-tune", "film",
    "-x264-params", "aq-mode=3:deblock=-1,-1",
    "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-movflags", "+faststart", "-r", String(FPS), OUT,
  ]);
  enc.stdin.end();
  await enc.done;
  if (!args["keep-chunks"]) rmSync(tmp, { recursive: true, force: true });
  console.log(`${OUT} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
}

if (args.stills) {
  await stills(String(args.stills).split(",").map(Number));
} else {
  if (!existsSync(join(here, "index.html"))) throw new Error("index.html missing");
  await film();
}
