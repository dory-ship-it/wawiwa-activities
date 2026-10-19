// Build check (first version, P0). Idea from genai-for-marketing/s1-ai-awareness/tools/check.mjs.
// Usage: npm run check   (exit code 1 on any failure)
//  1. content JSON parses
//  2. every screen id in lesson.slice exists in screens[]
//  3. no em dash (U+2014) or en dash (U+2013) in content or src (or index.html)
//  4. every icon name used in content exists in src/icons.js
//  5. the Next button (white on --w-red) font token is at least 18.66px and bold
//  6. contrast of every text/background pair in the token table (4.5:1 text, 3:1 large text and UI)
//  7. no learner-facing sentences in src/*.js string literals; no italics in src/*.css
//  8. the boot fallback copy in index.html equals ui.boot in the content file
//  9. word counts (storyboard rule): on-screen words per screen view at most 45, every hint,
//     feedback line and pause marker at most 25; instruction line, buttons and the memo's
//     header label excluded
// 10. every interaction has full tracking metadata, ids are unique, graded keys match the options
// 11. no arrow glyph (U+2192) in ui strings or src: the font subset has none, use the arrow icon
// 12. hex allowlist (P1.5): every hex colour in src/ is one of the approved tokens
// 13. image slots: src file exists, alt set, prompt file exists; a WARNING lists every temp image
//     (not a failure)
// 14. fonts load offline: no Google Fonts anywhere, every @font-face file exists (Roboto 700 too)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
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

/* 5. Next font token (the only white-on-red text) */
const tokensCss = read(join(ROOT, 'src', 'tokens.css'));
const frameCss = read(join(ROOT, 'src', 'frame.css'));
const tok = (name) => (tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`)) || [])[1]?.trim();
const ctaSize = parseFloat(tok('w-fs-next'));
const ctaWeight = parseInt(tok('w-fw-next'), 10);
const nextRule = (frameCss.match(/\.w-next\s*\{([^}]*)\}/) || [])[1] || '';
const redRules = [...frameCss.matchAll(/([^{}]+)\{([^}]*var\(--w-red\)[^}]*)\}/g)].map((m) => m[1].trim());
// red: the unlocked Next, and on the title screen (O1, which has no footer) its "Start the lesson"
// button, which is the screen's Next (approved board R4-O1)
const nextOnly = redRules.length > 0 && redRules.every((sel) => /^\.w-next\[data-locked="false"\]$|^\.w-start$/.test(sel));
const unlockedRule = (frameCss.match(/\.w-next\[data-locked="false"\]\s*\{([^}]*)\}/) || [])[1] || '';
if (ctaSize >= 18.66 && ctaWeight >= 700 && /var\(--w-fs-next\)/.test(nextRule) && !/font(-size)?\s*:/.test(unlockedRule)) ok(`Next font token ${ctaSize}px weight ${ctaWeight} (large text, white on red allowed)`);
else fail(`Next font token too small or overridden: ${ctaSize}px weight ${ctaWeight}`);
nextOnly ? ok('--w-red is used by the unlocked Next button only') : fail('--w-red used outside .w-next[data-locked="false"]: ' + redRules.join(', '));

/* 6. contrast */
const hex = (name) => { const v = tok(name); if (!/^#[0-9a-f]{6}$/i.test(v || '')) throw new Error('token ' + name + ' is not a hex colour'); return v; };
const lum = (c) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PAIRS = [
  ['w-navy', 'w-white', 4.5, 'headings, statements, links, Previous'],
  ['w-navy', 'w-grey', 4.5, 'instruction and Skip on the memo ground'],
  ['w-navy', 'w-teal-tint', 4.5, 'current chapter in the menu'],
  ['w-teal-ink', 'w-white', 4.5, 'teal labels, numerals, % complete'],
  ['w-teal-ink', 'w-teal-tint', 4.5, 'correct verdict and option'],
  ['w-ink', 'w-white', 4.5, 'body, answers'],
  ['w-ink', 'w-hint', 4.5, 'pause band'],
  ['w-ink', 'w-teal-tint', 4.5, 'band text, correct and saved'],
  ['w-ink', 'w-error-tint', 4.5, 'band text, wrong'],
  ['w-ink-2', 'w-white', 4.5, 'secondary text, counters, meta'],
  ['w-ink-2', 'w-hint', 4.5, 'hint band'],
  ['w-ink-2', 'w-grey', 4.5, 'locked Next, memo hint'],
  ['w-error', 'w-error-tint', 4.5, 'wrong verdict and option'],
  ['w-error', 'w-white', 4.5, 'not saved'],
  ['w-white', 'w-navy', 4.5, 'Check, Save, tooltip'],
  ['w-white', 'w-red', 3, 'Next label (large text: 19px bold)'],
  ['w-teal', 'w-white', 3, 'FT1 numerals (large text: 40px)'],
  ['w-white', 'w-teal', 3, 'check on teal (graphic)'],
  ['w-white', 'w-error', 3, 'cross on red (graphic)'],
  ['w-navy', 'w-white', 3, 'focus ring, ghost button border (UI)'],
  ['w-ink-2', 'w-white', 3, 'input border, radio ring (UI)'],
  ['w-teal', 'w-teal-tint', 3, 'correct card border (UI)'],
  ['w-error', 'w-error-tint', 3, 'wrong card border (UI)'],
];
console.log('\n  contrast (text / background, ratio, needed, use)');
for (const [fg, bg, need, use] of PAIRS) {
  const r = ratio(hex(fg), hex(bg));
  const line = `${('--' + fg).padEnd(14)} on ${('--' + bg).padEnd(16)} ${r.toFixed(2).padStart(5)}:1  >= ${need}  ${use}`;
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
const stageText = (stage = {}) => Object.values(stage).flatMap((p) => [p.eyebrow, p.text, p.label, p.chip?.text, p.help?.text, ...(p.bubbles || []), ...(p.items || []).map((x) => x.text)]);
const fieldText = (fields = []) => fields.flatMap((f) => [f.label, f.placeholder]);
// one entry per view the learner sees at once: [name, strings on screen]
const views = content.screens.flatMap((s) => {
  if (s.template === 'video') return [[s.id, [s.title, s.guidingQuestion]], ...(s.stops || []).map((st) => [`${s.id} ${st.id}`, [st.question, ...st.options.map((o) => o.label)]])];
  if (s.template === 'handoff') return Object.entries(s.states).map(([k, st]) => [`${s.id} ${k}`, [...stageText(st.stage), ...fieldText(st.fields)]]);
  if (s.variant === 'selfcheck') return s.steps.map((st) => [`${s.id} ${st.id}`, [...(st.rows || []).map((r) => r.text), ...(st.chips || []).map((c) => c.label), st.strip]]);
  // R1 templates, each in its fullest state
  // sort: placed cards stay on screen as chips, so every card counts, unless the chips are markers
  // without text (S17: one case on screen at a time); then the longest case counts
  if (s.template === 'sort') {
    const cardText = s.chipStyle === 'marker' ? [s.cards.map((c) => c.text).sort((a, b) => words(b) - words(a))[0]] : s.cards.map((c) => c.text);
    return [[s.id, [s.header, ...s.columns.map((c) => c.label), ...cardText]]];
  }
  // R2 templates
  if (s.variant === 'fill') return [[s.id, [s.situation.text, ...s.fieldRows.flatMap((f) => [f.label, f.value]), ...s.options.map((o) => o.label)]]];
  if (s.variant === 'metric') return [[s.id, [s.field.label, ...s.options.map((o) => o.label), s.slotsTitle, ...s.slots.map((x) => x.label)]]];
  if (s.variant === 'bounds') return [[s.id, [s.strip, ...s.options.flatMap((o) => [s.startLabel, o.start, s.endLabel, o.end])]]];
  // R3 templates
  if (s.variant === 'safety') return [[`${s.id} step1`, [s.stage.top.text, ...s.options.map((o) => o.label)]],
    [`${s.id} step2`, [s.stage.top.text, s.step2.field.label, s.step2.privacy.text, s.step2.checkbox]]];
  if (s.template === 'check') return s.items.map((it) => [`${s.id} ${it.id}`, it.kind === 'tiles' ? it.tiles.flatMap((t) => [String(t.n), t.text]) : [it.stem, ...it.options.map((o) => o.label)]]);
  if (s.variant === 'close') return [[`${s.id} step1`, s.options.map((o) => o.label)], [`${s.id} step2`, [s.step2.bridge.text, s.step2.homework.text]]];
  if (s.variant === 'pick') return s.tiles.map((t) => [`${s.id} tile ${t.n} open`, [...s.tiles.flatMap((x) => [String(x.n), x.title]), s.question, t.text]]);
  if (s.variant === 'diagram') return [[s.id, [s.diagram.tag, ...s.diagram.lanes.map((l) => l.label), ...s.diagram.nodes.map((n) => n.label), ...s.legend.map((g) => g.label)]]];
  if (s.variant === 'tiles') {
    const nums = s.tiles.map((t) => String(t.n));
    return [...s.tiles.map((t) => [`${s.id} tile ${t.n} open`, [...nums, ...s.tiles.filter((x) => x !== t).map((x) => x.title), t.back]]),
      [`${s.id} answering`, [...nums, ...s.tiles.map((t) => t.title), s.question]]];
  }
  // Round 4 templates (instruction h1 and buttons excluded, as everywhere)
  if (s.template === 'title') return [[s.id, [s.program, s.kicker, s.quote]]];
  if (s.template === 'moduleMap') {
    const stations = s.stations.flatMap((x) => [x.kicker, x.title]);
    return s.stations.map((x) => [`${s.id} ${x.id} open`, [s.eyebrow, s.line, ...stations, content.ui.moduleMap.today, x.kicker, x.title, x.text]]);
  }
  if (s.template === 'goals') return [[s.id, [s.eyebrow, s.deliverable.label, s.deliverable.text, ...s.goals.map((g) => g.label)]]];
  if (s.template === 'warmup') return [[s.id, [s.panel.title, s.panel.chip, s.panel.text, s.panel.foot, ...s.options.map((o) => o.label)]]];
  if (s.template === 'concept') return [[s.id, [s.label, s.topic, s.text, ...s.figures.flatMap((f) => [f.chip, f.caption]), s.evidence.text, s.evidence.source]]];
  if (s.variant === 'pair') return [[s.id, s.situations.flatMap((x) => [x.text, ...x.options.map((o) => o.label)])]];
  if (s.variant === 'rounds') return s.rounds.map((r) => [`${s.id} ${r.id}`, [s.strip, r.badge, r.line, ...s.options.map((o) => o.label)]]);
  return [[s.id, [...stageText(s.stage), ...(s.options || []).map((o) => o.label), ...fieldText(s.fields), ...(s.cases || []).map((c) => c.label)]]];
});
// a screen may carry wordLimit { max, why } (copy approved over the rule, planning to cut): it is
// listed as a WARNING with its reason, and fails only above its own max
let wordFails = 0;
const overRule = [];
for (const [name, list] of views) {
  const n = list.reduce((sum, t) => sum + words(t), 0);
  const lim = content.screens.find((s) => s.id === name.split(' ')[0])?.wordLimit;
  if (n > MAX_SCREEN_WORDS && lim && lim.why && n <= lim.max) { overRule.push(`${name}: ${n} words (allowance ${lim.max}: ${lim.why})`); continue; }
  if (n > MAX_SCREEN_WORDS) { wordFails++; fail(`${name}: ${n} on-screen words (max ${MAX_SCREEN_WORDS})`); }
}
if (!wordFails) ok(`on-screen words at most ${MAX_SCREEN_WORDS} in all ${views.length} screen views but the allowances below (${views.map(([n, l]) => n + ' ' + l.reduce((s, t) => s + words(t), 0)).join(', ')})`);
if (overRule.length) {
  console.log(`  WARNING ${overRule.length} screen views over the ${MAX_SCREEN_WORDS}-word rule by an explicit content allowance:`);
  overRule.forEach((t) => console.log('          ' + t));
}
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
    [`${s.id} questionHint`, s.questionHint],
    ...(s.cards || []).flatMap((c) => Object.entries(c.feedback).map(([k, v]) => [`${s.id} card ${c.id ?? c.n} ${k}`, v])),
    ...(s.hotspots || []).map((x) => [`${s.id} hotspot ${x.id}`, x.feedback]),
    ...(s.legend || []).map((g) => [`${s.id} legend ${g.id}`, g.text]),
    ...(s.tiles || []).map((t) => [`${s.id} tile ${t.n}`, t.feedback]),
    ...(s.situations || []).flatMap((x) => x.options.map((o) => [`${s.id} ${x.id} option ${o.id}`, o.feedback])),
    ...(s.rounds || []).flatMap((r) => Object.entries(r.feedback).map(([k, v]) => [`${s.id} ${r.id} option ${k}`, v])),
    ...Object.entries(s.step2?.feedback || {}).map(([k, v]) => [`${s.id} step2.${k}`, v]),
    ...(s.items || []).flatMap((it) => [...(it.options || []).map((o) => [`${s.id} ${it.id} option ${o.id}`, o.feedback]), ...(it.tiles || []).map((t) => [`${s.id} ${it.id} tile ${t.n}`, t.feedback])]),
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
    const key = keyOf(s, t, stop);
    if (t.correctResponse !== key) metaFail(`${where}: correctResponse "${t.correctResponse}" but the content's key is "${key}"`);
    if (t.type === 'choice' && key.includes(',') && t.multiple !== true) metaFail(`${where}: several correct options but multiple is not true`);
  }
}
// The key the content itself defines for a graded interaction, in the response encoding:
// option letters in on-screen order; sort = "card.column" pairs; diagram = hotspot letters; tiles = numbers.
function keyOf(s, t, stop) {
  const letters = (opts) => opts.map((o, i) => (o.correct ? String.fromCharCode(97 + i) : null)).filter(Boolean).join(',');
  if (s.template === 'sort') return s.cards.map((c) => `${c.id ?? c.n}.${c.column}`).join(',');
  if (s.variant === 'diagram') return letters(s.hotspots);
  if (s.variant === 'tiles' || s.variant === 'pick') return s.tiles.filter((x) => x.correct).map((x) => String(x.n)).join(',');
  if (s.variant === 'pair') return letters(s.situations.find((x) => x.trackingId === t.id)?.options || []);
  if (s.template === 'check') {
    const it = s.items.find((x) => x.trackingId === t.id);
    if (!it) return '';
    return it.kind === 'tiles' ? it.tiles.filter((x) => x.correct).map((x) => String(x.n)).join(',') : letters(it.options);
  }
  if (s.variant === 'rounds') {
    const r = s.rounds.find((x) => x.trackingId === t.id);
    const i = r ? s.options.findIndex((o) => o.id === r.correct) : -1;
    return i < 0 ? '' : String.fromCharCode(97 + i);
  }
  return letters((stop || s).options || []);
}
// interaction ids referenced by fields, rows and chips must be declared in tracking[]
const refs = content.screens.flatMap((s) => [
  ...(s.fields || []).map((f) => [s.id, f.trackingId]),
  ...Object.values(s.states || {}).flatMap((st) => (st.fields || []).map((f) => [s.id, f.trackingId])),
  ...(s.steps || []).flatMap((st) => [...(st.rows || []).map((r) => [s.id, r.trackingId]), ...(st.trackingId ? [[s.id, st.trackingId]] : [])]),
  ...(s.situations || []).map((x) => [s.id, x.trackingId]),
  ...(s.rounds || []).map((r) => [s.id, r.trackingId]),
  ...(s.items || []).map((it) => [s.id, it.trackingId]),
  ...(s.step2?.field ? [[s.id, s.step2.field.trackingId]] : []),
]);
// the scored screens and the pass mark (S21: 5 scored items, pass 80 = 4 of 5)
const comp = content.lesson.completion;
const scored = comp.scoredScreens.flatMap((sid) => (content.screens.find((x) => x.id === sid)?.tracking || []).filter((t) => t.scored));
if (!scored.length || !(comp.passMark > 0 && comp.passMark <= 100) || interactions.some(([s, t]) => t?.scored && !comp.scoredScreens.includes(s.id)))
  metaFail(`completion: scored interactions must sit on lesson.completion.scoredScreens (${comp.scoredScreens.join(', ')}) with a pass mark`);
else ok(`scored: ${scored.length} interactions on ${comp.scoredScreens.join(', ')} (${scored.map((t) => t.id).join(', ')}), pass mark ${comp.passMark}`);
// fast-track cards: every route lands on a screen of the same chapter, the jump on its landing screen
for (const c of content.chapters.filter((x) => x.fastTrack)) {
  const card = content.screens.find((x) => x.id === c.fastTrack.card);
  const routes = card ? [...card.routing.correctFirstTry.choices, card.routing.wrong, card.routing.skipped] : [];
  if (!card || routes.some((r) => !c.screens.includes(r.to)) || !routes.some((r) => r.route === 'skip' && r.to === c.fastTrack.landing))
    metaFail(`${c.id}: fast-track card ${c.fastTrack.card} must route inside the chapter and jump to ${c.fastTrack.landing}`);
}
for (const [sid, id] of refs) if (!seen.has(id)) metaFail(`${sid}: ${id} is used on screen but has no tracking entry`);
if (!metaFails) ok(`all ${seen.size} interactions have full tracking metadata (${[...seen].join(', ')})`);

/* 11. arrow glyph */
const arrowIn = [...JSON.stringify(content.ui).matchAll(/\u2192/g)].length + srcFiles.filter((f) => /\u2192/.test(read(f))).length;
arrowIn ? fail('arrow glyph (U+2192) in ui strings or src: use icon("arrow-right")') : ok('no arrow glyph in ui strings or src (icon arrow-right exists)');

/* 12. hex allowlist: the approved tokens only */
const ALLOWED = ['#255777', '#3E868F', '#2F6A72', '#E7F2F3', '#5AB3AA', '#EE3124', '#CC0000', '#FBEAEA', '#000000', '#3F3F3F', '#F2F2F2', '#E6E6E8', '#D8D8D8', '#BFBFBF', '#FFFFFF', '#F4F7F9', '#EEF3F7'];
let hexHits = 0;
for (const f of srcFiles.filter((p) => /\.(css|js)$/.test(p))) {
  read(f).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      if (!ALLOWED.includes(m[0].toUpperCase())) { hexHits++; fail(`hex ${m[0]} not an approved token in ${relative(ROOT, f)}:${i + 1}`); }
    }
  });
}
if (!hexHits) ok(`every hex colour in src/ is an approved token (${ALLOWED.length} allowed)`);

/* 12b. video media (R2): the files the player reads exist, stops sit in order inside the video */
const videos = content.screens.filter((s) => s.template === 'video');
const tempMedia = [];
let mediaFails = 0;
for (const s of videos) {
  const m = s.media || {};
  const files = [m.src, ...(m.captions || []).map((c) => c.src)];
  files.filter((p) => !p || !existsSync(join(ROOT, p))).forEach((p) => { mediaFails++; fail(`${s.id}: media file missing ${p}`); });
  if (!(m.duration > 0) || !/^\d+:\d\d$/.test(m.length || '')) { mediaFails++; fail(`${s.id}: media.duration (seconds) and media.length (m:ss) are required`); }
  const ts = (s.stops || []).map((x) => x.t);
  if (ts.some((t, i) => !(t > 0) || t >= m.duration || (i && t <= ts[i - 1]))) { mediaFails++; fail(`${s.id}: stop times ${ts.join(', ')} must rise and sit inside ${m.duration}s`); }
  if (m.temp) tempMedia.push(...files.map((p) => `${s.id}: ${p}`));
}
if (!mediaFails) ok(`${videos.length} videos: media and captions exist, stop times in order (${videos.map((s) => s.id + ' ' + s.stops.map((x) => x.t + 's').join('/')).join(', ')})`);
if (tempMedia.length) {
  console.log(`  WARNING ${tempMedia.length} temp video files in use (silent placeholders from tools/make-placeholder-video.mjs, replace with the films):`);
  tempMedia.forEach((t) => console.log('          ' + t));
}

/* 13. image slots */
const slots = content.screens.flatMap((s) => [
  ...(s.image ? [[s.id, s.image]] : []),
  ...(s.cases || []).map((c) => [`${s.id} ${c.id}`, c.image]),
]);
let imgFails = 0;
const temps = [];
for (const [where, img] of slots) {
  if (!img || !('src' in img) || !('alt' in img) || !('prompt' in img) || typeof img.temp !== 'boolean') { imgFails++; fail(`${where}: image needs src, alt, prompt, temp`); continue; }
  if (img.src && !existsSync(join(ROOT, img.src))) { imgFails++; fail(`${where}: image file missing ${img.src}`); }
  if (!img.alt || !img.alt.trim()) { imgFails++; fail(`${where}: image has no alt text`); }
  if (!img.prompt || !existsSync(join(ROOT, img.prompt))) { imgFails++; fail(`${where}: prompt file missing ${img.prompt}`); }
  if (img.temp) temps.push(`${where}: ${img.src}`);
}
if (!imgFails) ok(`all ${slots.length} image slots have a file or null, alt text and a prompt file (${slots.map(([w]) => w).join(', ')})`);
if (temps.length) {
  console.log(`  WARNING ${temps.length} temp images in use (board references, replace before release):`);
  temps.forEach((t) => console.log('          ' + t));
}

/* 14. fonts load offline */
const fontsCss = read(join(ROOT, 'src', 'fonts.css'));
const google = [join(ROOT, 'index.html'), ...srcFiles].filter((f) => /fonts\.googleapis|fonts\.gstatic/.test(read(f)));
const faces = [...fontsCss.matchAll(/font-family:\s*"(\w+)";[^}]*font-weight:\s*(\d+);[^}]*url\(([^)]+)\)/g)].map((m) => ({ family: m[1], weight: m[2], file: join(ROOT, 'src', m[3]) }));
const missingFace = faces.filter((x) => !existsSync(x.file));
const need = ['Assistant 400', 'Assistant 600', 'Assistant 700', 'Assistant 800', 'Roboto 400', 'Roboto 500', 'Roboto 700'];
const have = faces.map((x) => `${x.family} ${x.weight}`);
const lacking = need.filter((n) => !have.includes(n));
google.length || missingFace.length || lacking.length
  ? fail(`fonts: ${google.length ? 'Google Fonts in ' + google.map((f) => relative(ROOT, f)).join(', ') + '; ' : ''}${missingFace.length ? 'missing files ' + missingFace.map((x) => relative(ROOT, x.file)).join(', ') + '; ' : ''}${lacking.length ? 'no @font-face for ' + lacking.join(', ') : ''}`)
  : ok(`fonts self-hosted, no Google Fonts: ${have.join(', ')}`);

finish();
function finish() {
  console.log(fails.length ? `\ncheck FAILED (${fails.length})` : '\ncheck passed');
  process.exit(fails.length ? 1 : 0);
}
