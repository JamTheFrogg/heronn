// node render-loops.mjs [hero-loop|ambient-loop ...]  -> public/video/<name>.mp4/.webm/-poster.webp
// Frame i is drawn at t = i/FPS; the loop period T = FRAMES/FPS, so frame FRAMES would equal frame 0 (seamless).
import fs from 'node:fs'; import { execFileSync } from 'node:child_process'; import { start } from './serve.mjs';
const FPS = 30, SECONDS = { 'hero-loop': 12, 'ambient-loop': 12 };
const Q = { 'hero-loop': { crf: 24, vp9: 36 }, 'ambient-loop': { crf: 21, vp9: 31 } }; // soft gradients need more bits against banding
const OUT = new URL('./public/video/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SECONDS);
const s = await start(); const p = await s.browser.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(s.url + '/loops.html'); await p.waitForFunction(() => window.ready);
for (const name of names) {
  const T = SECONDS[name], F = T * FPS, dir = `/tmp/frames-${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const only = process.env.FRAMES ? process.env.FRAMES.split(',').map(Number) : null;
  for (let i = 0; i <= F; i++) { // includes frame F (== frame 0) for the seam check; not encoded
    if (only && !only.includes(i)) continue;
    const url = await p.evaluate(([n, t, T]) => window.draw(n, t, T), [name, i / FPS, T]);
    fs.writeFileSync(`${dir}/${String(i).padStart(4, '0')}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  if (only) { console.log(name, 'preview frames in', dir); continue; }
  fs.renameSync(`${dir}/${String(F).padStart(4, '0')}.png`, `/tmp/${name}-seam.png`);
  const inp = ['-y', '-v', 'error', '-framerate', String(FPS), '-i', `${dir}/%04d.png`];
  execFileSync('ffmpeg', [...inp, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(Q[name].crf), '-tune', 'film', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', OUT + name + '.mp4']);
  execFileSync('ffmpeg', [...inp, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(Q[name].vp9), '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', OUT + name + '.webm']);
  execFileSync('python3', ['-c', `from PIL import Image; Image.open('${dir}/0000.png').convert('RGB').save('${OUT}${name}-poster.webp', quality=82, method=6)`]);
  console.log(name, fs.statSync(OUT + name + '.mp4').size, fs.statSync(OUT + name + '.webm').size);
}
await s.close();
