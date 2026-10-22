// Build check (first version, P0). Idea from genai-for-marketing/s1-ai-awareness/tools/check.mjs.
// Usage: npm run check   (exit code 1 on any failure)
//  1. content JSON parses
//  2. every screen id in lesson.slice exists in screens[]
//  3. no em dash (U+2014) or en dash (U+2013) in content or src (or index.html); 3b. no mojibake:
//     no character of U+0590 to U+05FF in content/ or src/ (a code page 1255 write once broke it)
//  4. every icon name used in content exists in src/icons.js
//  5. the Next button (white on --wl-red) font token is at least 18.66px and bold
//  6. contrast of every text/background pair in the token table (4.5:1 text, 3:1 large text and UI)
//  7. no learner-facing sentences in src/*.js string literals (src/review/ is exempt: review-only UI
//     for the team, never in the package); no italics in src/*.css
//  8. the boot fallback copy in index.html equals ui.boot in the content file
//  9. word counts (storyboard rule): on-screen words per screen view at most 45, every hint,
//     feedback line and pause marker at most 25; instruction line, buttons and the memo's
//     header label excluded (the counting is src/review/words.js, shared with the review toolbar)
// 10. every interaction has full tracking metadata, ids are unique, graded keys match the options
// 11. no arrow glyph (U+2192) in ui strings or src: the font subset has none, use the arrow icon
// 12. hex allowlist (NL1): every hex colour in src/ is one of the --wl-* tokens in src/tokens.css
// 13. image slots: src file exists, alt set, prompt file exists; the scene photos (chapter.photo,
//     screen.photo) exist; every screen of a chapter names its step (verb + a glyph icon); a WARNING
//     lists every temp image (not a failure)
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

/* 3b. no mojibake (NL2 wrote the content once through code page 1255): no character of the Hebrew
   block U+0590 to U+05FF, and none of the sequences it leaves ("ג€" for curly quotes,
   "ֲ" before a middle dot), in content/ and src/ (text files read as UTF-8) */
const TEXT = /\.(json|js|mjs|css|html|md|vtt|txt|svg)$/i;
const textFiles = [...walk(join(ROOT, 'content')), ...srcFiles].filter((p) => TEXT.test(p));
let mojiHits = 0;
for (const f of textFiles) {
  read(f).split('\n').forEach((line, i) => {
    if (/[֐-׿]/.test(line) || line.includes('ג€') || line.includes('ֲ')) { mojiHits++; fail(`mojibake (U+0590 to U+05FF) in ${relative(ROOT, f)}:${i + 1}`); }
  });
}
if (!mojiHits) ok(`no mojibake (U+0590 to U+05FF) in ${textFiles.length} text files under content/ and src/`);

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
const ctaSize = parseFloat(tok('wl-fs-next'));
const ctaWeight = parseInt(tok('wl-fw-next'), 10);
const nextRule = (frameCss.match(/\.w-next\s*\{([^}]*)\}/) || [])[1] || '';
const redRules = [...frameCss.matchAll(/([^{}]+)\{([^}]*var\(--wl-red\)[^}]*)\}/g)].map((m) => m[1].trim());
// red: the unlocked Next, and on the title screen (O1, which has no footer) its "Start the lesson"
// button, which is the screen's Next (approved board R4-O1)
const nextOnly = redRules.length > 0 && redRules.every((sel) => /^\.w-next\[data-locked="false"\]$|^\.w-start$/.test(sel));
const unlockedRule = (frameCss.match(/\.w-next\[data-locked="false"\]\s*\{([^}]*)\}/) || [])[1] || '';
if (ctaSize >= 18.66 && ctaWeight >= 700 && /var\(--wl-fs-next\)/.test(nextRule) && !/font(-size)?\s*:/.test(unlockedRule)) ok(`Next font token ${ctaSize}px weight ${ctaWeight} (large text, white on red allowed)`);
else fail(`Next font token too small or overridden: ${ctaSize}px weight ${ctaWeight}`);
nextOnly ? ok('--wl-red is used by the unlocked Next button (and O1 Start) only') : fail('--wl-red used outside .w-next[data-locked="false"]: ' + redRules.join(', '));

/* 6. contrast */
const hex = (name) => { const v = tok(name); if (!/^#[0-9a-f]{6}$/i.test(v || '')) throw new Error('token ' + name + ' is not a hex colour'); return v; };
const lum = (c) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PAIRS = [
  ['wl-ink', 'wl-stone', 4.5, 'headings and chapter name on the ground and the bar'],
  ['wl-ink', 'wl-ivory', 4.5, 'panel headings'],
  ['wl-ink', 'wl-white', 4.5, 'card text, menu current chapter'],
  ['wl-body-ink', 'wl-white', 4.5, 'answer cards'],
  ['wl-text-2', 'wl-ivory', 4.5, 'context line, subline'],
  ['wl-text-2', 'wl-white', 4.5, 'card body copy'],
  ['wl-muted', 'wl-stone', 4.5, 'step labels'],
  ['wl-muted', 'wl-ivory', 4.5, 'hint line, counters, privacy line, menu chapters'],
  ['wl-navy', 'wl-white', 4.5, 'Previous, Save, Check, Show me'],
  ['wl-teal-ink', 'wl-stone', 4.5, 'Focus labels (Where we are, Lesson goals)'],
  ['wl-teal-ink', 'wl-keypill-bg', 4.5, 'Key idea pill'],
  ['wl-teal-ink', 'wl-white', 4.5, 'current-step icon and today number, "With mapping"'],
  ['wl-correct-head', 'wl-correct-bg', 4.5, 'correct verdict'],
  ['wl-correct-head', 'wl-chip-bg', 4.5, 'Today chip'],
  ['wl-fb-text', 'wl-correct-bg', 4.5, 'strip line, correct'],
  ['wl-error-head', 'wl-error-bg', 4.5, 'wrong verdict'],
  ['wl-fb-text', 'wl-error-bg', 4.5, 'strip line, wrong'],
  ['wl-text-2', 'wl-neutral-bg', 4.5, 'neutral verdict'],
  ['wl-fb-text', 'wl-neutral-bg', 4.5, 'strip line, neutral'],
  ['wl-grey-ink', 'wl-white', 4.5, '"Without mapping"'],
  ['wl-evidence', 'wl-stone', 4.5, 'K1 evidence line'],
  ['wl-idle-ink', 'wl-white', 4.5, 'numbers of steps and stations to come'],
  ['wl-o1-ground', 'wl-turquoise', 4.5, 'Not scored, length and CC chips on glass'],
  ['wl-white', 'wl-o1-ground', 4.5, 'text on dark glass (the darkest ground it sits on)'],
  ['wl-white', 'wl-red', 3, 'Next label (large text: 18.7px bold), O1 Start (23px bold)'],
  ['wl-white', 'wl-navy', 3, 'check on navy (graphic)'],
  ['wl-white', 'wl-teal', 3, 'check on teal (graphic)'],
  ['wl-white', 'wl-error', 3, 'cross on red (graphic)'],
  ['wl-navy', 'wl-white', 3, 'focus ring, selected border, markers (UI)'],
  ['wl-teal', 'wl-white', 3, 'correct border (UI)'],
  ['wl-error', 'wl-white', 3, 'wrong border (UI)'],
  ['wl-turquoise', 'wl-white', 2, 'current-step ring (decorative; the label is bold and the state is in aria-current)'],
];
console.log('\n  contrast (text / background, ratio, needed, use)');
for (const [fg, bg, need, use] of PAIRS) {
  const r = ratio(hex(fg), hex(bg));
  const line = `${('--' + fg).padEnd(14)} on ${('--' + bg).padEnd(16)} ${r.toFixed(2).padStart(5)}:1  >= ${need}  ${use}`;
  r >= need ? ok(line) : fail(line);
}
// turquoise is never text on a light ground (it is the glass card's icon colour, and a ring)
const turquoiseText = [...frameCss.matchAll(/([^{}]+)\{([^}]*[^-]color:\s*var\(--wl-turquoise\)[^}]*)\}/g)].map((m) => m[1].trim()).filter((sel) => !/glass|\.w-tr\[/.test(sel));
turquoiseText.length ? fail('--wl-turquoise used as text colour in frame.css: ' + turquoiseText.join(', ')) : ok('--wl-turquoise is text colour only on dark glass');
console.log('');

/* 7. no learner-facing sentences in src, no italics */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
let sentenceHits = 0;
for (const f of srcFiles.filter((p) => p.endsWith('.js') && !relative(ROOT, p).startsWith(join('src', 'review')))) {
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

/* 9. word counts (the counting lives in src/review/words.js, shared with the review mode) */
const { MAX_SCREEN_WORDS, MAX_FEEDBACK_WORDS, words, screenViews, screenFeedback } = await import('../src/review/words.js');
// one entry per view the learner sees at once: [name, strings on screen]
const views = content.screens.flatMap((s) => screenViews(s, content));
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
  // a chapter's pause marker counts even when its last screen is not in content yet
  ...content.chapters.filter((c) => c.pauseMarker && !ids.has(c.screens[c.screens.length - 1])).map((c) => [`${c.id} pauseMarker`, c.pauseMarker]),
  ...content.screens.flatMap((s) => screenFeedback(s, content)),
];
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
  if (s.template === 'sort' || s.template === 'sortDeck') return s.cards.map((c) => `${c.id ?? c.n}.${c.column}`).join(',');
  if (s.template === 'bpmn' && s.variant === 'label') return s.labels.map((l) => `${l.code}.${l.target}`).join(',');
  if (s.variant === 'tiles') return s.tiles.filter((x) => x.correct).map((x) => String(x.n)).join(',');
  // NL3 flags: the map's flagged fields in number order; the line's flags as one-character code.step
  if (s.template === 'flags') return s.variant === 'map' ? s.map.filter((x) => x.correct).map((x) => String(x.n)).join(',') : s.flags.map((f) => `${f.code}.${f.target}`).join(',');
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
const ALLOWED = [...tokensCss.matchAll(/--wl-[\w-]+:\s*(#[0-9A-Fa-f]{6})\s*;/g)].map((m) => m[1].toUpperCase());
let hexHits = 0;
for (const f of srcFiles.filter((p) => /\.(css|js)$/.test(p) && !p.endsWith('tokens.css'))) {
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
// the scene photos: one per chapter (Stage photo, Focus wash) and a screen's own (O1); paths in the content
const photos = [...content.chapters.map((c) => [c.id, c.photo]), ...content.screens.filter((s) => s.photo).map((s) => [s.id, s.photo])];
const badPhotos = photos.filter(([, p]) => !p || !p.src || !existsSync(join(ROOT, p.src)));
badPhotos.length ? badPhotos.forEach(([w]) => fail(`${w}: photo missing or its file missing`)) : ok(`${photos.length} scene photos exist (${photos.map(([w, p]) => w + ' ' + p.src.split('/').pop()).join(', ')})`);
photos.filter(([, p]) => p && p.temp).forEach(([w, p]) => temps.push(`${w} photo: ${p.src}`));
// every screen in a chapter names its step for the top bar: a verb and a glyph from icons.js
const { isGlyph } = await import('../src/icons.js');
const noStep = content.chapters.flatMap((c) => c.screens).filter((id) => { const s = content.screens.find((x) => x.id === id); return s && !(s.step && (s.step.join || (s.step.verb && isGlyph(s.step.icon)))); });
noStep.length ? fail('screens without a step (verb + glyph icon): ' + noStep.join(', ')) : ok('every chapter screen names its step (verb + glyph icon)');
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
