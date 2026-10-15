// Build check (first version, P0). Idea from genai-for-marketing/s1-ai-awareness/tools/check.mjs.
// Usage: npm run check   (exit code 1 on any failure)
//  1. content JSON parses
//  2. every screen id in lesson.slice exists in screens[]
//  3. no em dash (U+2014) or en dash (U+2013) in content or src (or index.html)
//  4. every icon name used in content exists in src/icons.js
//  5. the CTA (white on --w-red) font token is at least 18.66px and bold
//  6. contrast of every text/background pair in the token table (4.5:1 text, 3:1 large text and UI)
//  7. no learner-facing sentences in src/*.js string literals; no italics in src/*.css
//  8. the boot fallback copy in index.html equals ui.boot in the content file
//  9. word counts (storyboard rule): on-screen words per screen view at most 45, every hint,
//     feedback line and pause marker at most 25; instruction line and action buttons excluded
// 10. every interaction has full tracking metadata, ids are unique, graded keys match the options
// 11. no arrow glyph (U+2192) in ui strings or src: the font subset has none, use the arrow icon
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const ok = (msg) => console.log('  ok   ' + msg);
const fail = (msg) => { fails.push(msg); console.log('  FAIL ' + msg); };

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const read = (p) => readFileSync(p, 'utf8');

/* 1. content parses */
const contentPath = join(ROOT, 'content', 'l4-slice.json');
let content;
try { content = JSON.parse(read(contentPath)); ok('content/l4-slice.json parses'); }
catch (e) { fail('content/l4-slice.json does not parse: ' + e.message); finish(); }

/* 2. slice ids exist */
const ids = new Set(content.screens.map((s) => s.id));
const missing = content.lesson.slice.filter((id) => !ids.has(id));
missing.length ? fail('slice ids missing from screens[]: ' + missing.join(', ')) : ok(`all ${content.lesson.slice.length} slice ids exist in screens[]`);
for (const c of content.chapters) for (const id of c.screens) if (!ids.has(id)) fail(`chapter ${c.id} lists unknown screen ${id}`);

/* 3. no em or en dash */
const srcFiles = walk(join(ROOT, 'src'));
const dashFiles = [contentPath, join(ROOT, 'index.html'), ...srcFiles];
let dashHits = 0;
for (const f of dashFiles) {
  read(f).split('\n').forEach((line, i) => {
    if (/[\u2013\u2014]/.test(line)) { dashHits++; fail(`dash (U+2013/U+2014) in ${relative(ROOT, f)}:${i + 1}`); }
  });
}
if (!dashHits) ok(`no em or en dash in content, index.html and ${srcFiles.length} src files`);

/* 4. icon names */
const { ICON_NAMES } = await import('../src/icons.js');
const used = new Set();
(function collect(v) {
  if (Array.isArray(v)) v.forEach(collect);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (k === 'icon' && typeof x === 'string') used.add(x); else collect(x); }
})(content);
const unknown = [...used].filter((n) => !ICON_NAMES.includes(n));
unknown.length ? fail('icons used in content but missing in icons.js: ' + unknown.join(', ')) : ok(`all ${used.size} icon names used in content exist in icons.js`);

/* 5. CTA font token */
const tokensCss = read(join(ROOT, 'src', 'tokens.css'));
const frameCss = read(join(ROOT, 'src', 'frame.css'));
const tok = (name) => (tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`)) || [])[1]?.trim();
const ctaSize = parseFloat(tok('w-fs-button'));
const ctaWeight = parseInt(tok('w-fw-button'), 10);
const primaryRule = (frameCss.match(/\.w-btn-primary\s*\{([^}]*)\}/) || [])[1] || '';
if (ctaSize >= 18.66 && ctaWeight >= 700 && !/font(-size)?\s*:/.test(primaryRule)) ok(`CTA font token ${ctaSize}px weight ${ctaWeight} (large text, white on red allowed)`);
else fail(`CTA font token too small or overridden: ${ctaSize}px weight ${ctaWeight}`);

/* 6. contrast */
const hex = (name) => { const v = tok(name); if (!/^#[0-9a-f]{6}$/i.test(v || '')) throw new Error('token ' + name + ' is not a hex colour'); return v; };
const lum = (c) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const dimmed = mix(hex('w-white'), hex('w-grey'), 0.6); // non-chosen option card: white under a 60% grey layer, text on top
const PAIRS = [
  ['w-navy', 'w-white', 4.5, 'instruction, titles, links'],
  ['w-navy', 'w-grey', 4.5, 'titles on the card'],
  ['w-navy', 'w-neutral-tint', 4.5, 'neutral feedback'],
  ['w-ink', 'w-white', 4.5, 'body on option cards'],
  ['w-ink', 'w-grey', 4.5, 'body on the card'],
  ['w-ink', 'w-teal-tint', 4.5, 'label on a correct card'],
  ['w-ink', 'w-error-tint', 4.5, 'label on a wrong card'],
  ['w-ink', dimmed, 4.5, 'label on a dimmed card'],
  ['w-muted', 'w-white', 4.5, 'hint, counters, readout'],
  ['w-muted', 'w-grey', 4.5, 'secondary text on the card'],
  ['w-teal-text', 'w-white', 4.5, 'teal text on white'],
  ['w-teal-text', 'w-teal-tint', 4.5, 'correct feedback'],
  ['w-error', 'w-white', 4.5, 'not saved, error text'],
  ['w-error', 'w-error-tint', 4.5, 'wrong feedback'],
  ['w-white', 'w-navy', 4.5, 'tooltip, selected chip'],
  ['w-white', 'w-red', 3, 'CTA label (large text: 20px bold)'],
  ['w-white', 'w-teal', 3, 'correct icon on teal (graphic)'],
  ['w-white', 'w-error', 3, 'wrong icon on error (graphic)'],
  ['w-navy', 'w-white', 3, 'focus ring, secondary button border (UI)'],
  ['w-ui-border', 'w-white', 3, 'empty progress segment border (UI)'],
  ['w-teal', 'w-teal-tint', 3, 'correct card border (UI)'],
  ['w-error', 'w-error-tint', 3, 'wrong card border (UI)'],
  ['w-red', 'w-white', 3, 'progress marker (UI)'],
];
console.log('\n  contrast (text / background, ratio, needed, use)');
for (const [fg, bg, need, use] of PAIRS) {
  const f = fg.startsWith('#') ? fg : hex(fg), b = bg.startsWith('#') ? bg : hex(bg);
  const r = ratio(f, b);
  const line = `${(fg.startsWith('#') ? fg : '--' + fg).padEnd(16)} on ${(bg.startsWith('#') ? bg + ' (dimmed card)' : '--' + bg).padEnd(26)} ${r.toFixed(2).padStart(5)}:1  >= ${need}  ${use}`;
  r >= need ? ok(line) : fail(line);
}
const turquoiseText = /color:\s*var\(--w-turquoise\)/.test(frameCss);
turquoiseText ? fail('--w-turquoise used as text colour in frame.css') : ok('--w-turquoise never used as a text colour');
console.log('');

/* 7. no learner-facing sentences in src, no italics */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
let sentenceHits = 0;
for (const f of srcFiles.filter((p) => p.endsWith('.js'))) {
  const code = stripComments(read(f));
  for (const m of code.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) {
    const s = m[2];
    if (/\b[A-Za-z][a-z]+ [a-z]{2,} [a-z]{2,}/.test(s) && !/[<>=]/.test(s)) { sentenceHits++; fail(`English-looking string in ${relative(ROOT, f)}: ${m[0].slice(0, 70)}`); }
  }
}
if (!sentenceHits) ok('no English sentences in src/*.js string literals');
const italics = srcFiles.filter((p) => p.endsWith('.css') && /font-style:\s*italic|font:\s*italic/.test(read(p)));
italics.length ? fail('italics in ' + italics.map((p) => relative(ROOT, p)).join(', ')) : ok('no italics in src/*.css');

/* 8. boot fallback copy */
const html = read(join(ROOT, 'index.html'));
const fb = Object.fromEntries([...html.matchAll(/data-key="(\w+)">([^<]*)</g)].map((m) => [m[1], m[2]]));
const bootOk = Object.entries(content.ui.boot).every(([k, v]) => fb[k] === v) && Object.keys(fb).length === Object.keys(content.ui.boot).length;
bootOk ? ok('index.html boot fallback equals ui.boot') : fail('index.html boot fallback differs from ui.boot');

/* 9. word counts */
const MAX_SCREEN_WORDS = 45, MAX_FEEDBACK_WORDS = 25;
const words = (s) => String(s ?? '').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
// on-screen text of one stage (top / middle / bottom), whatever the kind
const stageText = (stage = {}) => Object.values(stage).flatMap((p) => [p.text, p.label, p.chip?.text, ...(p.bubbles || []), ...(p.items || []).map((x) => x.text)]);
const fieldText = (fields = []) => fields.flatMap((f) => [f.label, f.placeholder]);
// one entry per view the learner sees at once: [name, strings on screen]
const views = content.screens.flatMap((s) => {
  if (s.template === 'video') return [[s.id, [s.title, s.guidingQuestion]], ...(s.stops || []).map((st) => [`${s.id} ${st.id}`, [st.question, ...st.options.map((o) => o.label)]])];
  if (s.template === 'handoff') return Object.entries(s.states).map(([k, st]) => [`${s.id} ${k}`, [...stageText(st.stage), ...fieldText(st.fields)]]);
  if (s.variant === 'selfcheck') return s.steps.map((st) => [`${s.id} ${st.id}`, [...(st.rows || []).map((r) => r.text), ...(st.chips || []).map((c) => c.label), st.strip]]);
  return [[s.id, [...stageText(s.stage), ...(s.options || []).map((o) => o.label), ...fieldText(s.fields)]]];
});
let wordFails = 0;
for (const [name, list] of views) {
  const n = list.reduce((sum, t) => sum + words(t), 0);
  if (n > MAX_SCREEN_WORDS) { wordFails++; fail(`${name}: ${n} on-screen words (max ${MAX_SCREEN_WORDS})`); }
}
if (!wordFails) ok(`on-screen words at most ${MAX_SCREEN_WORDS} in all ${views.length} screen views (${views.map(([n, l]) => n + ' ' + l.reduce((s, t) => s + words(t), 0)).join(', ')})`);
const feedbackLines = [
  ...content.chapters.filter((c) => c.pauseMarker).map((c) => [`${c.id} pauseMarker`, c.pauseMarker]),
  ...content.screens.flatMap((s) => [
    [`${s.id} hint`, s.hint],
    ...(s.options || []).map((o) => [`${s.id} option ${o.id}`, o.feedback]),
    ...Object.entries(s.feedback || {}).map(([k, v]) => [`${s.id} feedback.${k}`, v]),
    ...(s.stops || []).flatMap((st) => st.options.map((o) => [`${s.id} ${st.id} option ${o.id}`, o.feedback])),
    ...Object.entries(s.states || {}).flatMap(([k, st]) => Object.entries(st).filter(([f, v]) => /Feedback$/.test(f) && typeof v === 'string').map(([f, v]) => [`${s.id} ${k}.${f}`, v])),
    ...(s.steps || []).flatMap((st) => [...(st.rows || []).flatMap((r) => Object.entries(r.feedback).map(([k, v]) => [`${s.id} ${r.id} ${k}`, v])),
      ...(st.chips || []).map((c) => [`${s.id} chip ${c.id}`, c.feedback])]),
  ]),
].filter(([, v]) => v);
const longFb = feedbackLines.filter(([, v]) => words(v) > MAX_FEEDBACK_WORDS);
longFb.forEach(([k, v]) => fail(`${k}: ${words(v)} words (max ${MAX_FEEDBACK_WORDS})`));
if (!longFb.length) ok(`all ${feedbackLines.length} hints, feedback lines and pause markers at most ${MAX_FEEDBACK_WORDS} words`);

/* 10. tracking metadata */
const TYPES = ['choice', 'matching', 'fill-in'], RESULTS = ['graded', 'neutral'];
const BLOOM = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
const interactions = content.screens.flatMap((s) => [...(s.tracking || []).map((t) => [s, t]), ...(s.stops || []).map((st) => [s, st.tracking, st])]);
const seen = new Set();
let metaFails = 0;
const metaFail = (m) => { metaFails++; fail(m); };
for (const [s, t, stop] of interactions) {
  const where = `${s.id} ${t?.id || '(no id)'}`;
  if (!t || !/^L4_[A-Z0-9]+_\d+$/.test(t.id)) { metaFail(`${where}: missing or malformed id`); continue; }
  if (seen.has(t.id)) metaFail(`${where}: duplicate interaction id`);
  seen.add(t.id);
  if (!TYPES.includes(t.type)) metaFail(`${where}: type "${t.type}" not one of ${TYPES.join(', ')}`);
  if (!('correctResponse' in t)) metaFail(`${where}: correctResponse missing (null when there is none)`);
  if (typeof t.scored !== 'boolean') metaFail(`${where}: scored must be true or false`);
  if (!BLOOM.includes(t.bloom)) metaFail(`${where}: bloom "${t.bloom}" not a Bloom level`);
  if (!RESULTS.includes(t.result)) metaFail(`${where}: result "${t.result}" not one of ${RESULTS.join(', ')}`);
  if (t.result === 'neutral' && t.correctResponse !== null) metaFail(`${where}: neutral interaction with a correctResponse`);
  if (t.result === 'graded') {
    const opts = (stop || s).options || [];
    const key = opts.map((o, i) => (o.correct ? String.fromCharCode(97 + i) : null)).filter(Boolean).join(',');
    if (t.correctResponse !== key) metaFail(`${where}: correctResponse "${t.correctResponse}" but the correct options are "${key}" (letters in on-screen order)`);
    if (key.includes(',') && t.multiple !== true) metaFail(`${where}: several correct options but multiple is not true`);
  }
}
// interaction ids referenced by fields, rows and chips must be declared in tracking[]
const refs = content.screens.flatMap((s) => [
  ...(s.fields || []).map((f) => [s.id, f.trackingId]),
  ...Object.values(s.states || {}).flatMap((st) => (st.fields || []).map((f) => [s.id, f.trackingId])),
  ...(s.steps || []).flatMap((st) => [...(st.rows || []).map((r) => [s.id, r.trackingId]), ...(st.trackingId ? [[s.id, st.trackingId]] : [])]),
]);
for (const [sid, id] of refs) if (!seen.has(id)) metaFail(`${sid}: ${id} is used on screen but has no tracking entry`);
if (!metaFails) ok(`all ${seen.size} interactions have full tracking metadata (${[...seen].join(', ')})`);

/* 11. arrow glyph */
const arrowIn = [...JSON.stringify(content.ui).matchAll(/\u2192/g)].length + srcFiles.filter((f) => /\u2192/.test(read(f))).length;
arrowIn ? fail('arrow glyph (U+2192) in ui strings or src: use icon("arrow-right")') : ok('no arrow glyph in ui strings or src (icon arrow-right exists)');

finish();
function finish() {
  console.log(fails.length ? `\ncheck FAILED (${fails.length})` : '\ncheck passed');
  process.exit(fails.length ? 1 : 0);
}
