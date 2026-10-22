// Usage: npm run build && node scripts/screenshots.mjs [route ...]
// Starts the static server, captures each route at desktop and phone width into ../screenshots/.
// Set CHROME=/path/to/chrome if Chromium isn't found automatically.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const here = fileURLToPath(new URL("..", import.meta.url));
const out = process.env.SHOT_DIR ?? join(here, "..", "screenshots");
mkdirSync(out, { recursive: true });
const PORT = Number(process.env.SHOT_PORT ?? 4791);
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/chat", "/chat?past=1", "/chat?state=drafting", "/chat?state=done", "/chat?state=done&panel=1", "/canvas", "/folders"];
const guess = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
const executablePath = process.env.CHROME ?? guess.find((p) => existsSync(p));

const server = spawn("node", ["server.mjs"], { cwd: here, env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch({ executablePath });
try {
  for (const [label, width, height] of [["desktop", 1440, 1000], ["phone", 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: label === "phone" ? 2 : 1 });
    page.on("pageerror", (e) => console.error("pageerror", e.message));
    for (const r of routes) {
      await page.goto(`http://localhost:${PORT}${r}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(Number(process.env.WAIT ?? 1200));
      const name = (r === "/" ? "street" : r.slice(1).replace(/[?&=/]+/g, "-")) + `-${label}.png`;
      await page.screenshot({ path: join(out, name), fullPage: process.env.FULL !== "0" });
      console.log("saved", name);
    }
    await page.close();
  }
} finally { await browser.close(); server.kill(); }
