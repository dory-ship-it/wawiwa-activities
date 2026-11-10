// V1 photo-cut renderer: loads film.html with timeline.json + photo.json and screenshots every frame with
// the machine's Chrome, piping the frames straight into ffmpeg (silent H.264). make.py adds the voice.
// Usage (from the module folder):
//   node video/v1/render.mjs preview 2,40,61.2,170   stills to review/p2/v1-<t>.png
//   node video/v1/render.mjs full                    video/v1/out/silent.mp4, poster, out/status.json
// Missing images render as labelled placeholders, and status.json marks the cut as a draft.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, ROOT } from '../../tools/serve.mjs';
import { chromePath } from '../../tools/lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'out');
const timeline = JSON.parse(readFileSync(join(HERE, 'timeline.json'), 'utf8'));
const photo = JSON.parse(readFileSync(join(HERE, 'photo.json'), 'utf8'));
const missing = photo.shots.filter((s) => !existsSync(join(ROOT, s.img))).map((s) => s.id);
if (missing.length) console.log(`placeholders for ${missing.length} missing images: ${missing.join(', ')}`);

const [mode = 'preview', arg = '2'] = process.argv.slice(2);
const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${server.address().port}/video/v1/film.html`, { waitUntil: 'networkidle0' });
const plan = await page.evaluate((f) => window.setFilm(f), { timeline, photo, missing });
if (errors.length) throw new Error(errors.join('\n'));

console.log('shots (id, start, seconds on screen):');
for (const [id, s, d] of plan.shots) console.log(`  ${id} ${String(s).padStart(7)} ${String(d).padStart(6)}${d > 8.5 && id !== '00' ? '  long' : d < 5 ? '  short' : ''}`);
console.log('keywords (text, from, to):');
for (const [k, a, b] of plan.keys) console.log(`  ${String(a).padStart(7)} ${String(b).padStart(7)}  ${k}`);

const shot = async (t, type = 'png', quality) => {
  await page.evaluate((x) => window.renderAt(x), t);
  return page.screenshot({ type, quality, optimizeForSpeed: true });
};

if (mode === 'preview') {
  mkdirSync(join(ROOT, 'review', 'p2'), { recursive: true });
  for (const t of arg.split(',').map(Number)) {
    writeFileSync(join(ROOT, 'review', 'p2', `v1-${t}.png`), await shot(t));
    console.log(`review/p2/v1-${t}.png`);
  }
} else {
  mkdirSync(OUT, { recursive: true });
  // optional second argument: render only up to this time (seconds), for a partial cut
  const end = Number(process.argv[3]) || timeline.duration;
  const fps = timeline.fps, n = Math.round(Math.min(end, timeline.duration) * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', String(fps), join(OUT, 'silent.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg exit ' + c)) : res())));
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await shot(i / fps, 'jpeg', 94);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 250 === 0) console.log(`frame ${i}/${n}  ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  ff.stdin.end();
  await done;
  writeFileSync(join(OUT, 'poster.jpg'), await shot(2.0, 'jpeg', 90));
  writeFileSync(join(OUT, 'status.json'), JSON.stringify({ frames: n, missing, draft: missing.length > 0 || n < Math.round(timeline.duration * fps) }, null, 1));
  console.log(`video/v1/out/silent.mp4 (${n} frames) ${missing.length ? 'DRAFT with placeholders' : 'all images present'}`);
}
await browser.close();
server.close();
