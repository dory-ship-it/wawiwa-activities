// Silent placeholder videos for the player until the real films exist (R2).
// Usage: node tools/make-placeholder-video.mjs
// For every video screen whose media.temp is true, writes ONLY into assets/video/temp/:
//   <id>-placeholder.mp4     navy frame, white "<ID> placeholder", a running clock; media.duration long
//   <id>-placeholder.en.vtt  captions from production.segments: each segment's narration split into
//                            sentences, timed in proportion to their words inside the segment
// Lengths, stop times and narration come from content/l4-slice.json (storyboard v2). The real film
// replaces both files by changing media.src and media.captions[0].src (and temp: false).
// Needs ffmpeg on PATH. Never touches video/ or assets/video/v1.*, v2.* (the film pipeline).
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { ROOT } from './serve.mjs';

const TEMP_DIR = 'assets/video/temp/';
const FONT = 'C\\:/Windows/Fonts/arialbd.ttf';
const content = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const secs = (mmss) => { const [m, s] = String(mmss).split(':').map(Number); return m * 60 + s; };
const stamp = (t) => {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
};

function vtt(screen) {
  const segs = screen.production.segments;
  const lines = ['WEBVTT', '', `NOTE placeholder captions for ${screen.id} from the storyboard narration (temp)`, ''];
  segs.forEach((seg, i) => {
    const from = secs(seg.time), to = i + 1 < segs.length ? secs(segs[i + 1].time) : screen.media.duration;
    const sentences = seg.narration.split(/(?<=[.?!])\s+/).filter(Boolean);
    const words = sentences.map((x) => x.split(/\s+/).length);
    const total = words.reduce((a, b) => a + b, 0);
    let t = from;
    sentences.forEach((text, k) => {
      const end = k === sentences.length - 1 ? to : t + ((to - from) * words[k]) / total;
      lines.push(`${screen.id}-${seg.n}-${k + 1}`, `${stamp(t)} --> ${stamp(end)}`, text, '');
      t = end;
    });
  });
  return lines.join('\n');
}

function mp4(screen, out) {
  const label = `${screen.id} placeholder`;
  const filter = [
    `drawtext=fontfile='${FONT}':text='${label}':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2-40`,
    `drawtext=fontfile='${FONT}':text='%{eif\\:floor(t/60)\\:d}\\:%{eif\\:mod(floor(t)\\,60)\\:d\\:2}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2+50`,
  ].join(',');
  const script = join(mkdtempSync(join(tmpdir(), 'l4-ph-')), 'filter.txt');
  writeFileSync(script, filter);
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0x255777:s=1280x720:r=10:d=${screen.media.duration}`,
    '-/vf', script, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out];
  const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed for ' + screen.id);
}

for (const s of content.screens.filter((x) => x.template === 'video' && x.media?.temp)) {
  for (const p of [s.media.src, s.media.captions[0].src]) if (!p.startsWith(TEMP_DIR)) throw new Error(`${s.id}: ${p} is not under ${TEMP_DIR}`);
  mkdirSync(join(ROOT, dirname(s.media.src)), { recursive: true });
  writeFileSync(join(ROOT, s.media.captions[0].src), vtt(s));
  mp4(s, join(ROOT, s.media.src));
  console.log(`${s.id}: ${s.media.src} (${s.media.length}, stops at ${s.stops.map((x) => x.t + 's').join(', ')}), ${s.media.captions[0].src}`);
}
