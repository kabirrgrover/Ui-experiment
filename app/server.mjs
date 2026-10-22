// Tiny static server for Databricks Apps (or any Node host).
// Serves dist/ and falls back to index.html for client routes.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), process.env.DIST || "dist");
const port = Number(process.env.DATABRICKS_APP_PORT || process.env.PORT || 8000);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json",
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  let file = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); }
  catch { file = join(root, "index.html"); }
  try {
    const body = await readFile(file);
    const cache = file.includes("/assets/") || file.includes("/static/") || file.includes("/fonts/") ? "public, max-age=31536000, immutable" : "no-cache";
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "cache-control": cache });
    res.end(body);
  } catch { res.writeHead(404).end("not found"); }
}).listen(port, () => console.log(`AI Docbuilder UI on :${port}`));
