#!/usr/bin/env node
/* Screenshot one IAM pane (in the dashboard shell) through iam/harness.html.
 *
 *   node iam/shot.mjs <pane> <out.png> [p=1] [key=value ...]     e.g. active=Groups
 */
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const [name, out, p = "1", ...extra] = process.argv.slice(2);
if (!name || !out) {
  console.error("usage: node iam/shot.mjs <pane> <out.png> [p] [key=value ...]");
  process.exit(1);
}
const qs = new URLSearchParams({ pane: name, p });
for (const kv of extra) {
  const [k, v] = kv.split("=");
  qs.set(k, v);
}
const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(pathToFileURL(join(here, "harness.html")).href + "?" + qs);
await page.evaluate(() => window.harnessReady);
await page.screenshot({ path: resolve(out) });
await browser.close();
if (errors.length) {
  console.error("page errors:\n" + errors.join("\n"));
  process.exit(2);
}
console.log(resolve(out));
