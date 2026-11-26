// One-off (26 Nov 2026): the H3 podcast from its 15 ElevenLabs takes (assets/audio/h3-takes), the DM S26 way: edge
// silence trimmed, joined with a breath between lines, loudnorm -16 LUFS, mono mp3 96 kbps; the cues and the captions
// timed from the takes; the content's media block updated (temp: false). Run from the lesson folder. Needs ffmpeg.
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = 'assets/audio/h3-takes';
// the takes in script order (two "And the ..." lines: the earlier one is line 5)
const order = ['tts_Befor', 'tts_Four_', 'tts_Who_m', 'tts_In_so', 'tts_And_t_20261126_094527', 'tts_Which', 'tts_If_th', 'tts_So_th', 'tts_Who_c', 'tts_When_', 'tts_And_t_20261126_094531', 'tts_Who_s', 'tts_Name_', 'tts_Is_th', 'tts_No._M'];
let files = readdirSync(dir);
if (!existsSync(join(dir, 'h3-01.mp3'))) {
  order.forEach((p, i) => { const f = files.find((x) => x.startsWith(p)); if (!f) throw new Error('missing take ' + p); renameSync(join(dir, f), join(dir, `h3-${String(i + 1).padStart(2, '0')}.mp3`)); });
}
const ff = (args) => { const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); };
const dur = (f) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout.trim());
const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse';
const LEAD = 0.5, GAP = 0.6, TAIL = 0.8;
const C = JSON.parse(readFileSync('content/m2l3.json', 'utf8'));
const s = C.screens.find((x) => x.id === 'H3');
const script = s.podcast.script;
let t = LEAD;
const items = [];
const parts = [];
script.forEach((l, i) => {
  const src = join(dir, `h3-${String(i + 1).padStart(2, '0')}.mp3`), out = join(dir, `t${i + 1}.wav`);
  ff(['-i', src, '-af', trim, '-ac', '1', '-ar', '44100', out]);
  const d = dur(out);
  items.push({ t: +t.toFixed(2), end: +(t + d).toFixed(2), voice: l.voice, obs: l.obs ?? null, text: l.text });
  parts.push(out);
  t += d + GAP;
});
const total = +(t - GAP + TAIL).toFixed(2);
// the timeline: lead silence, each take, a breath between, a tail
const inputs = [], filters = [];
parts.forEach((p, i) => { inputs.push('-i', p); filters.push(`[${i}]adelay=${Math.round(items[i].t * 1000)}|${Math.round(items[i].t * 1000)}[a${i}]`); });
const mix = parts.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${parts.length}:normalize=0,apad=whole_dur=${total},atrim=0:${total},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
ff([...inputs, '-filter_complex', filters.join(';') + ';' + mix, '-map', '[out]', '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', 'assets/audio/h3.mp3']);
const real = +dur('assets/audio/h3.mp3').toFixed(2);
const stamp = (x) => `${String(Math.floor(x / 3600)).padStart(2, '0')}:${String(Math.floor((x % 3600) / 60)).padStart(2, '0')}:${(x % 60).toFixed(3).padStart(6, '0')}`;
writeFileSync('assets/audio/h3.cues.json', JSON.stringify({ id: 'h3', duration: real, temp: false, items }, null, 2) + '\n');
writeFileSync('assets/audio/h3.en.vtt', ['WEBVTT', '', ...items.flatMap((it, i) => [String(i + 1), `${stamp(it.t)} --> ${stamp(it.end)}`, `<v ${it.voice}>${it.text}`, ''])].join('\n'));
s.media = { $comment: 'Recorded 26 Nov 2026 with ElevenLabs (eleven_multilingual_v2), the DM S26 settings: voice A "Laura - a top narration voice" (GZ4PpFJV8ikEGUtBrjK7, the course voice, speed 0.85), voice B "Roger - Laid-Back, Casual, Resonant" (CwhRBWXzGAHq8TQ4Fs17, speed 0.9); stability 0.50, similarity 0.80, style 0.15. One take per script line (assets/audio/h3-takes), edge silence trimmed, a 0.6 s breath between lines, loudnorm -16 LUFS, mono mp3 96 kbps (planning/_build-h3-audio.mjs). No music.',
  src: 'assets/audio/h3.mp3', captions: [{ lang: 'en', label: 'English', src: 'assets/audio/h3.en.vtt' }], cues: 'assets/audio/h3.cues.json', duration: real, length: `${Math.floor(real / 60)}:${String(Math.round(real % 60)).padStart(2, '0')}`, temp: false };
writeFileSync('content/m2l3.json', JSON.stringify(C, null, 2) + '\n');
parts.forEach((p) => { try { spawnSync('cmd', ['/c', 'del', p.replace(/\//g, '\\')]); } catch { /* keep */ } });
console.log('h3.mp3', real, 's,', items.length, 'lines');
