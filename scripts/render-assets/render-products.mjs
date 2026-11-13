// node render-products.mjs [key ...]   -> public/products/<key>.webp, <key>@600.webp, hero-family.webp
import fs from 'node:fs'; import { execFileSync } from 'node:child_process'; import { start } from './serve.mjs';
const OUT = new URL('./public/products/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const HERO = [ // key, size(bounding radius), x, z, rotY
  ['bullet', 8.5, -20, -3, 0.25], ['solar-camera', 11, 0, -10, 0.05], ['cube', 5.6, -6, 9, 0.1], ['doorbell', 7.2, 15, 1, -0.2], ['dome', 5.5, 7, 13, 0]];
const s = await start(); const p = await s.browser.newPage();
p.on('console', (m) => m.type() === 'error' && console.log('page:', m.text())); p.on('pageerror', (e) => console.log('pageerror', e.message));
await p.goto(s.url + '/products.html'); await p.waitForFunction(() => window.ready);
const keys = process.argv.slice(2).length ? process.argv.slice(2) : [...await p.evaluate(async () => Object.keys((await import('./models.js')).MODELS)), 'hero-family'];
const N = +(process.env.N || 40);
for (const k of keys) {
  const t = Date.now();
  const url = k === 'hero-family' ? await p.evaluate(([L, n]) => window.hero(L, 2400, 1350, n), [HERO, N]) : await p.evaluate(([k, n]) => window.shot(k, 1200, n), [k, N]);
  const png = `/tmp/${k}.png`; fs.writeFileSync(png, Buffer.from(url.split(',')[1], 'base64'));
  execFileSync('python3', ['webp.py', png, OUT + k + '.webp', k === 'hero-family' ? '0' : '600']);
  console.log(k, ((Date.now() - t) / 1000).toFixed(1) + 's');
}
await s.close();
