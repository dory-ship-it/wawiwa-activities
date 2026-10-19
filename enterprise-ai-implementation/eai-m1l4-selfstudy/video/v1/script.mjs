// V1 script builder and validator (P2). Reads screen V1 of content/l4-slice.json and writes
// video/v1/film.json: captions sliced verbatim from the storyboard narration, `say` with the
// content sayOverrides and the pronunciation fixes below, planned timing, holds, stops, brand end.
// Narration and keywords come from the content only. Text held here: spoken-only fixes (SAY_FIXES),
// the "AI" chip label and the house brand end card.
// Timing here is the plan (about 2.5 spoken words per second); make.py (P2B) re-times from the
// real audio and writes the cue file.
// Usage: node video/v1/script.mjs           build film.json, then validate it
//        node video/v1/script.mjs --check   validate the existing film.json only
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const FILM = join(HERE, 'film.json');
const content = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const V1 = content.screens.find((s) => s.id === 'V1');
const SEGS = V1.production.segments;

// Words per caption, per segment (one idea per caption). Sums must equal each segment's word count.
const SPLIT = {
  1: [7, 16, 15],          // slow process / faster tech on top / locked in
  2: [18, 16, 9, 13],      // HBR 1990 + gloss / the principle (two halves) / ordinary computing, AI too
  3: [14, 14, 11, 11],     // case one / 500 vs about 100 / five times, close the gap / first call
  4: [16, 12, 19, 10],     // mapping found / not faster systems / rewritten / about 75 percent
  5: [11, 13, 16, 10],     // case two / 2.3 million / 700 reps / 11 min to under two
  6: [21, 11, 11, 12, 9],  // disclaimer / rehiring / simple / complex / decide
  7: [11, 18],             // admitted / hybrid model
  8: [11, 7, 18, 20],      // two cases / not bureaucratic / what separates / told in numbers
};

// Spoken-only fixes found with the Kokoro phonemizer (espeak, en-us), 15 Oct 2026:
// "1980s" reads "nineteen hundred eighty z", "1990" reads "nineteen hundred ninety".
const SAY_FIXES = { '1980s': 'nineteen eighties', '1990': 'nineteen ninety' };

const T = {
  fps: 25, size: [1280, 720], titleEnd: 4.0, wps: 2.5, minSlot: 1.6, hold: 1.2, stopInHold: 0.4,
  brandGap: 0.3, brandHold: 4.0, lead: 0.15,
};

const words = (s) => s.trim().split(/\s+/).filter(Boolean);
const r1 = (x) => Math.round(x * 10) / 10;
const ceil1 = (x) => Math.ceil(x * 10 - 1e-9) / 10;

// Spoken word count of a `say` line: numbers count as the words they are read as.
function intWords(n) {
  if (n < 20) return 1;
  if (n < 100) return n % 10 ? 2 : 1;
  if (n < 1000) return 2 + (n % 100 ? intWords(n % 100) : 0);
  return 2 + (n % 1000 ? intWords(n % 1000) : 0);
}
function spokenCount(say) {
  let n = 0;
  for (const w of words(say)) {
    const m = w.match(/(\d+)(?:\.(\d+))?/);
    if (!m) { n += 1; continue; }
    n += intWords(Number(m[1])) + (m[2] ? 1 + m[2].length : 0);
  }
  return n;
}

function applySay(text) {
  let s = text;
  const ov = V1.production.sayOverrides || {};
  for (const [k, v] of Object.entries({ ...ov, ...SAY_FIXES })) {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = /^\w/.test(k) ? new RegExp(`\\b${esc}\\b`, 'g') : new RegExp(esc, 'g');
    s = s.replace(re, k === '~' ? v + ' ' : v).replace(/\s{2,}/g, ' ');
  }
  return s;
}

function build() {
  const captions = [], holds = [], stops = [], segments = [];
  let t = T.titleEnd, k = 0;
  for (const seg of SEGS) {
    const w = words(seg.narration);
    const plan = SPLIT[seg.n];
    if (!plan) throw new Error(`no split plan for segment ${seg.n}`);
    const sum = plan.reduce((a, b) => a + b, 0);
    if (sum !== w.length) throw new Error(`segment ${seg.n}: split sums to ${sum}, narration has ${w.length} words`);
    const segStart = t;
    let i = 0;
    for (const n of plan) {
      const text = w.slice(i, i + n).join(' ');
      i += n;
      const say = applySay(text);
      const slot = Math.max(T.minSlot, ceil1(spokenCount(say) / T.wps));
      k += 1;
      captions.push({ id: 'c' + String(k).padStart(2, '0'), seg: seg.n, start: r1(t), end: r1(t + slot), text, say });
      t = r1(t + slot);
    }
    const segEnd = t;
    if (seg.stopAfter) {
      const last = captions[captions.length - 1];
      holds.push({ id: seg.stopAfter, after: last.id, start: t, end: r1(t + T.hold) });
      stops.push({ id: seg.stopAfter, t: r1(t + T.stopInHold) });
      t = r1(t + T.hold);
    }
    segments.push({ n: seg.n, start: segStart, end: segEnd, onScreen: seg.onScreen, build: seg.build });
  }
  const lastEnd = captions[captions.length - 1].end;
  const brandAt = r1(lastEnd + T.brandGap);
  return {
    id: 'v1',
    fps: T.fps,
    size: T.size,
    duration: r1(brandAt + T.brandHold),
    voice: { engine: 'kokoro-onnx', model: 'Kokoro-82M', voice: 'af_heart', speed: 1.1, lang: 'en-us', lead: T.lead,
      fitRule: 'speech + 0.2 s <= caption slot', loudnorm: 'I=-16:TP=-1.5:LRA=11', music: false, effects: false },
    planning: { wordsPerSecond: T.wps, minSlot: T.minSlot, note: 'Planned slots. make.py re-times from the real audio; the cue file comes from that placement.' },
    title: { text: V1.title, start: 0, end: T.titleEnd, color: '#255777', font: 'Assistant', weight: 800 },
    logo: { src: 'assets/logo/wawiwa-logo.png', width: 108, top: 30, right: 72, from: T.titleEnd },
    labels: { aiChip: 'AI' },
    sayFixes: SAY_FIXES,
    captions,
    holds,
    stops,
    segments,
    brandEnd: {
      at: brandAt, hold: T.brandHold, pushIn: [1.0, 1.04],
      logo: 'assets/logo/wawiwa-logo.png',
      tagline: ['Skilling', 'the World', 'for AI'],
      bar: { width: 133, height: 5, color: '#EE3124', note: '200x8 at 1920, scaled to 1280' },
      footer: 'ENTERPRISE AI IMPLEMENTATION SPECIALIST · M1 L4 · SELF-STUDY',
      narration: false,
    },
  };
}

function validate(film) {
  const fails = [];
  const ok = (m) => console.log('  ok   ' + m);
  const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
  const expect = (c, m) => (c ? ok(m) : fail(m));
  const C = film.captions;

  expect(film.id === 'v1' && film.fps === 25 && film.size[0] === 1280 && film.size[1] === 720, 'id v1, 25 fps, 1280x720');
  expect(C.length >= 25 && C.length <= 30, `caption count ${C.length} (25 to 30)`);

  // contiguous, no overlap: each caption starts where the previous ends, or where its hold ends
  const holdAfter = Object.fromEntries(film.holds.map((h) => [h.after, h]));
  expect(Math.abs(C[0].start - film.title.end) < 1e-6, `first caption starts at the end of the title card (${film.title.end} s)`);
  let gaps = 0;
  for (let i = 0; i < C.length; i++) {
    const c = C[i];
    if (!(c.end > c.start)) { fail(`${c.id} has no length`); gaps++; }
    if (i === 0) continue;
    const p = C[i - 1], h = holdAfter[p.id];
    const want = h ? h.end : p.end;
    if (h && Math.abs(h.start - p.end) > 1e-6) { fail(`hold after ${p.id} does not start at its end`); gaps++; }
    if (Math.abs(c.start - want) > 1e-6) { fail(`${c.id} starts at ${c.start}, expected ${want}`); gaps++; }
  }
  expect(gaps === 0, 'captions contiguous, no overlap (holds only after segments 3 and 6)');

  // every narration word present exactly once, in order, per segment
  let wordFails = 0;
  for (const seg of SEGS) {
    const got = C.filter((c) => c.seg === seg.n).flatMap((c) => words(c.text));
    const want = words(seg.narration);
    if (got.length !== want.length || got.some((w, i) => w !== want[i])) { fail(`segment ${seg.n}: caption words differ from the narration`); wordFails++; }
  }
  const allGot = C.flatMap((c) => words(c.text)).join(' ');
  const allWant = SEGS.flatMap((s) => words(s.narration)).join(' ');
  expect(wordFails === 0 && allGot === allWant, `all ${words(allWant).length} narration words of the 8 segments present exactly once, in order`);
  expect(C.every((c, i) => i === 0 || c.seg >= C[i - 1].seg) && new Set(C.map((c) => c.seg)).size === 8, 'captions cover segments 1 to 8 in order');

  // say: only spoken differences; shown text untouched
  expect(C.every((c) => typeof c.say === 'string' && c.say.length), 'every caption has say');
  const changed = C.filter((c) => c.say !== c.text);
  console.log(`       say differs from text in ${changed.length}: ${changed.map((c) => c.id).join(', ') || 'none'}`);

  // holds and stops
  const segLast = (n) => C.filter((c) => c.seg === n).at(-1).id;
  const h1 = film.holds.find((h) => h.id === 'stop1'), h2 = film.holds.find((h) => h.id === 'stop2');
  expect(h1 && h1.after === segLast(3) && Math.abs(h1.end - h1.start - 1.2) < 1e-6, 'stop1 hold: 1.2 s after the last caption of segment 3');
  expect(h2 && h2.after === segLast(6) && Math.abs(h2.end - h2.start - 1.2) < 1e-6, 'stop2 hold: 1.2 s after the last caption of segment 6');
  const s1 = film.stops.find((s) => s.id === 'stop1'), s2 = film.stops.find((s) => s.id === 'stop2');
  expect(s1 && h1 && Math.abs(s1.t - (h1.start + 0.4)) < 1e-6 && s1.t < h1.end, `stop1 at ${s1?.t} s = hold start + 0.4, inside the hold`);
  expect(s2 && h2 && Math.abs(s2.t - (h2.start + 0.4)) < 1e-6 && s2.t < h2.end, `stop2 at ${s2?.t} s = hold start + 0.4, inside the hold`);
  expect(s1 && s2 && s1.t < s2.t && s2.t < film.duration, 'stop1 < stop2 < duration');

  // brand end and duration
  const last = C.at(-1);
  expect(Math.abs(film.brandEnd.at - (last.end + 0.3)) < 1e-6, `brand end at ${film.brandEnd.at} s (0.3 s after the last caption)`);
  expect(Math.abs(film.duration - (film.brandEnd.at + 4.0)) < 1e-6, `duration ${film.duration} s = brand end + 4.0`);

  // segments: on-screen keywords verbatim from the content
  expect(film.segments.length === 8 && film.segments.every((s) => JSON.stringify(s.onScreen) === JSON.stringify(SEGS[s.n - 1].onScreen)), 'segment on-screen keywords match the content verbatim');

  // house rules: no em dash, nothing over the planning rate
  const raw = JSON.stringify(film);
  expect(!raw.includes(String.fromCharCode(0x2014)), 'no em dash');
  const slotFails = C.filter((c) => (c.end - c.start) + 1e-6 < Math.max(T.minSlot, spokenCount(c.say) / T.wps));
  expect(slotFails.length === 0, 'every slot allows at most 2.5 spoken words per second');

  return fails;
}

const check = process.argv.includes('--check');
let film;
if (check) film = JSON.parse(readFileSync(FILM, 'utf8'));
else {
  film = build();
  writeFileSync(FILM, JSON.stringify(film, null, 2) + '\n');
  console.log(`wrote ${FILM}`);
}

console.log('\nfilm.json check');
const fails = validate(film);
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
console.log(`\n${film.captions.length} captions; narration ${film.captions[0].start} to ${film.captions.at(-1).end} s; stops ${film.stops.map((s) => `${s.id} ${s.t} s`).join(', ')}; brand end ${film.brandEnd.at} s; duration ${film.duration} s (${mmss(film.duration)})`);
if (process.argv.includes('--list')) for (const c of film.captions) console.log(`${c.id} s${c.seg} ${c.start.toFixed(1).padStart(6)} ${c.end.toFixed(1).padStart(6)}  ${c.text}`);
if (fails.length) { console.log(`\n${fails.length} FAILED`); process.exit(1); }
console.log('\nAll checks passed.');
