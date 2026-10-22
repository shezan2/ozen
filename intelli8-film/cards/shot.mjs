#!/usr/bin/env node
/* Screenshot one site card through cards/harness.html at its native size.
 *
 *   node cards/shot.mjs <card> <out.png> [p=1] [key=value ...]     e.g. scale=2 (device scale), bg=dark
 */
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const [name, out, p = "1", ...extra] = process.argv.slice(2);
if (!name || !out) {
  console.error("usage: node cards/shot.mjs <card> <out.png> [p] [key=value ...]");
  process.exit(1);
}
const qs = new URLSearchParams({ card: name, p });
let scale = 1;
for (const kv of extra) {
  const [k, v] = kv.split("=");
  if (k === "scale") scale = Number(v);
  else qs.set(k, v);
}
const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: scale });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(pathToFileURL(join(here, "harness.html")).href + "?" + qs);
await page.evaluate(() => window.harnessReady);
const [w, h] = await page.evaluate(() => window.cardSize);
await page.screenshot({ path: resolve(out), clip: { x: 0, y: 0, width: w, height: h } });
await browser.close();
if (errors.length) {
  console.error("page errors:\n" + errors.join("\n"));
  process.exit(2);
}
console.log(resolve(out));
