// Tiny static server + browser launcher shared by render scripts.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright-core';
const root = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json' };
export async function start() {
  const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
  });
  await new Promise(r => server.listen(0, r));
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  return { url: `http://127.0.0.1:${server.address().port}`, browser, close: async () => { await browser.close(); server.close(); } };
}
