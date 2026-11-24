// A silent placeholder for the podcast (S26) until the real audio exists.
// Usage: node tools/make-placeholder-audio.mjs
// For every podcast screen whose media.temp is true, writes the three files the screen names (media.src,
// media.captions[0].src, media.cues) from the script in the content (podcast.script):
//   p1.mp3        silence, media.duration long
//   p1.en.vtt     one caption per script line, timed in proportion to its words
//   p1.cues.json  { id, duration, items: [{ t, end, voice, obs, text }] }: what is being said when (the player
//                 shows the caption and highlights the observation from it)
// The real audio replaces the three files with the same names and shapes (then media.temp: false and
// media.duration from the cue file). Needs ffmpeg on PATH.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './serve.mjs';

const { readContent } = await import('./kit.mjs');
const content = readContent();
const stamp = (t) => `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}:${(t % 60).toFixed(3).padStart(6, '0')}`;
const count = (s) => s.split(/\s+/).filter(Boolean).length;

for (const s of content.screens.filter((x) => x.template === 'podcast' && x.media?.temp)) {
  const m = s.media, script = s.podcast.script;
  const LEAD = 1, GAP = 0.6; // a second of air before the first line, a breath between lines
  const speak = m.duration - LEAD - 1 - GAP * (script.length - 1);
  const total = script.reduce((n, l) => n + count(l.text), 0);
  let t = LEAD;
  const items = script.map((l) => {
    const end = t + (speak * count(l.text)) / total;
    const it = { t: Math.round(t * 100) / 100, end: Math.round(end * 100) / 100, voice: l.voice, obs: l.obs ?? null, text: l.text };
    t = end + GAP;
    return it;
  });
  mkdirSync(join(ROOT, dirname(m.src)), { recursive: true });
  writeFileSync(join(ROOT, m.cues), JSON.stringify({ id: basename(m.src, '.mp3'), duration: m.duration, temp: true, items }, null, 2) + '\n');
  writeFileSync(join(ROOT, m.captions[0].src), ['WEBVTT', '', `NOTE placeholder captions for ${s.id} from the script in the content (temp)`, '',
    ...items.flatMap((it, i) => [String(i + 1), `${stamp(it.t)} --> ${stamp(it.end)}`, `<v ${it.voice}>${it.text}`, ''])].join('\n'));
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(m.duration), '-c:a', 'libmp3lame', '-b:a', '32k', join(ROOT, m.src)], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed for ' + s.id);
  console.log(`${s.id}: ${m.src} (${m.length}, silent), ${m.captions[0].src}, ${m.cues} (${items.length} lines)`);
}
