// V1 motion cut renderer: film2.html + motion.json + timeline.json, frames piped into ffmpeg, then the
// narration (out/voice.wav from make.py) and the music bed (out/music.wav from music.py) mixed in,
// with the music ducked under the voice. Renders motion.json's range only.
// Usage (from the module folder):
//   node video/v1/render2.mjs preview 45,52,66     stills to review/p2/m-<t>.png
//   node video/v1/render2.mjs full                 the whole range -> assets/video/<id>.mp4 (+ master, vtt, cues, poster)
//   $env:FILM="v2"; node video/v1/render2.mjs ...  same for video/v2
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, ROOT } from '../../tools/serve.mjs';
import { chromePath } from '../../tools/lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// film folder: FILM=v2 renders video/v2 with the same engine (film2.html lives here in video/v1)
const FD = join(HERE, '..', process.env.FILM || 'v1');
const OUT = join(FD, 'out');
const timeline = JSON.parse(readFileSync(join(FD, 'timeline.json'), 'utf8'));
const motion = JSON.parse(readFileSync(join(FD, 'motion.json'), 'utf8'));
const ID = timeline.id;
const missing = motion.shots.flatMap((s) => [s.img, s.video]).filter((p) => p && !existsSync(join(ROOT, p)));
if (missing.length) console.log('not on disk (images fall back, clips skipped):', missing.join(', '));

const [mode = 'preview', arg = ''] = process.argv.slice(2);
const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${server.address().port}/video/v1/film2.html`, { waitUntil: 'networkidle0' });
const plan = await page.evaluate((f) => window.setFilm(f), { timeline, motion, missing });
if (errors.length) throw new Error(errors.join('\n'));
const [from, to] = plan.range;
console.log(`range ${from.toFixed(2)} to ${to.toFixed(2)} s`);
for (const [img, s, e, tag] of plan.shots) console.log(`  ${s.toFixed(2).padStart(7)} ${(e - s).toFixed(2).padStart(6)}  ${tag === 'VIDEO' ? 'clip ' : ''}${img}`);

const shot = async (t, type = 'png', quality) => {
  await page.evaluate((x) => window.renderAt(x), t);
  if (errors.length) throw new Error(errors.join('\n'));
  return page.screenshot({ type, quality, optimizeForSpeed: true });
};

if (mode === 'preview') {
  for (const t of arg.split(',').map(Number)) {
    writeFileSync(join(ROOT, 'review', 'p2', `m-${ID}-${t}.png`), await shot(t));
    console.log(`review/p2/m-${ID}-${t}.png`);
  }
} else {
  mkdirSync(OUT, { recursive: true });
  const fps = timeline.fps, n = Math.round((to - from) * fps), silent = join(OUT, 'motion-silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg exit ' + c)) : res())));
  for (let i = 0; i < n; i++) {
    const buf = await shot(from + i / fps, 'jpeg', 94);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 250 === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end();
  await done;
  // voice + music: music ducked under the voice, short fades at the cut edges
  const whole = from === 0 && Math.abs(to - timeline.duration) < 0.01;
  const dur = (to - from).toFixed(3), dest = whole ? join(ROOT, 'assets', 'video', `${ID}-master.mp4`) : join(ROOT, 'review', 'p2', `${ID}-motion-sample.mp4`);
  const fc = `[1:a]atrim=start=${from}:duration=${dur},asetpts=PTS-STARTPTS,aformat=channel_layouts=stereo,asplit[v1][v2];` +
    `[2:a]atrim=start=${from}:duration=${dur},asetpts=PTS-STARTPTS,volume=0.55[m];` +
    `[m][v1]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=500[md];` +
    `[md][v2]amix=inputs=2:normalize=0,afade=t=in:d=0.6,afade=t=out:st=${(to - from - 0.8).toFixed(2)}:d=0.8[a]`;
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', join(OUT, 'voice.wav'), '-i', existsSync(join(OUT, 'music.wav')) ? join(OUT, 'music.wav') : join(HERE, 'out', 'music.wav'),
    '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', dest], { stdio: 'inherit' });
  if (r.status) throw new Error('mux failed');
  if (whole) {
    // the player's companions: VTT from the narration, cue file with the stops, poster from the title card
    const ts = (x) => { const ms = Math.round(x * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
    const vtt = ['WEBVTT', ''].concat(timeline.captions.flatMap((c) => [c.id, `${ts(c.start)} --> ${ts(c.end)}`, c.text, '']));
    writeFileSync(join(ROOT, 'assets', 'video', `${ID}.en.vtt`), vtt.join('\n'));
    const cues = { id: ID, duration: timeline.duration, fps: timeline.fps, stops: timeline.stops.map((s) => ({ id: s.id, t: s.t })), segments: timeline.segments.map((s) => ({ n: s.n, t: s.t })) };
    writeFileSync(join(ROOT, 'assets', 'video', `${ID}.cues.json`), JSON.stringify(cues, null, 1) + '\n');
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '2.5', '-i', dest, '-frames:v', '1', '-q:v', '3', join(ROOT, 'assets', 'video', `${ID}-poster.jpg`)]);
    // the lesson copy: smaller file, same picture (crf 27), the master stays next to it
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', dest, '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', join(ROOT, 'assets', 'video', `${ID}.mp4`)]);
  }
  console.log(`${whole ? `assets/video/${ID}.mp4 (+ master, vtt, cues, poster)` : `review/p2/${ID}-motion-sample.mp4`} (${dur} s)`);
}
await browser.close();
server.close();
