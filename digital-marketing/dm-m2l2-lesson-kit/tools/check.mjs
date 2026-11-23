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
// 15. version stamp: every link to the code and content carries the current ?v= (tools/stamp.mjs)
// 16. the coach (CO1, offline): no network code and no proxy URL in src/coach; every slice screen has
//     coach.kind with its opening line in ui.coach.lines; S21 locked with no tip; a copied tip is the
//     screen's hint word for word, a drafted tip (tipDrafted) at most 20 words; the grounding pack exists.
//     CO2: the only URL in src/coach is the live coach page (live.js), every kind maps to a live screen
//     type, and the CSP frames only that page's origin
// 17. the lesson's own rules (tests/check.mjs, when the lesson has one)
// 18. the kit (kit:sync): every kit file is the kit's copy, unedited (kit.lock.json); src/ and tools/ hold kit
//     files only; no stylesheet styles a screen by id; no kit code names one of this lesson's screen ids; every
//     screen.styles option exists in a stylesheet the lesson loads; the score comes from scored questions
// Kit tool: the lesson's paths and ids come from kit.json (tools/kit.mjs).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, KIT, CONTENT_PATH, configureSrc, importLesson } from './kit.mjs';

await configureSrc();
const { SCREEN_TYPES } = await import('../src/coach/live.js');
const fails = [];
const ok = (msg) => console.log('  ok   ' + msg);
const fail = (msg) => { fails.push(msg); console.log('  FAIL ' + msg); };

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const read = (p) => readFileSync(p, 'utf8');

/* 1. content parses */
const contentPath = CONTENT_PATH;
let content;
try { content = JSON.parse(read(contentPath)); ok(KIT.content + ' parses'); }
catch (e) { fail(KIT.content + ' does not parse: ' + e.message); finish(); }
const LESSON = await importLesson('check.mjs'); // the lesson's own rules and contrast pairs, if any

/* 2. slice ids exist */
const ids = new Set(content.screens.map((s) => s.id));
const missing = content.lesson.slice.filter((id) => !ids.has(id));
missing.length ? fail('slice ids missing from screens[]: ' + missing.join(', ')) : ok(`all ${content.lesson.slice.length} slice ids exist in screens[]`);
for (const c of content.chapters) for (const id of c.screens) if (!ids.has(id)) fail(`chapter ${c.id} lists unknown screen ${id}`);

/* 3. no em or en dash */
// the code and styles the lesson runs: the kit's src/, the lesson's own templates/ and lesson.css
const srcFiles = [...walk(join(ROOT, 'src')), ...(existsSync(join(ROOT, 'templates')) ? walk(join(ROOT, 'templates')) : []), ...(existsSync(join(ROOT, 'lesson.css')) ? [join(ROOT, 'lesson.css')] : [])];
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
const frameCss = read(join(ROOT, 'src', 'base.css'));
// the profile and the lesson may add tokens in their own :root blocks (their only hex values)
const profileCss = read(join(ROOT, 'src', 'profiles', KIT.profile + '.css'));
const lessonCss = existsSync(join(ROOT, 'lesson.css')) ? read(join(ROOT, 'lesson.css')) : '';
const rootBlocks = (css) => [...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]).join('\n');
const allTokens = tokensCss + '\n' + rootBlocks(profileCss) + '\n' + rootBlocks(lessonCss);
const tok = (name) => (allTokens.match(new RegExp(`--${name}:\\s*([^;]+);`)) || [])[1]?.trim();
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
  ['wl-white', 'wl-wash-ground', 4.5, 'FX3: headings and lines straight on the dark Focus wash'],
  ['wl-white', 'wl-red', 3, 'Next label (large text: 18.7px bold), O1 Start (23px bold)'],
  ['wl-white', 'wl-navy', 3, 'check on navy (graphic)'],
  ['wl-white', 'wl-teal', 3, 'check on teal (graphic)'],
  ['wl-white', 'wl-error', 3, 'cross on red (graphic)'],
  ['wl-navy', 'wl-white', 3, 'focus ring, selected border, markers (UI)'],
  ['wl-teal', 'wl-white', 3, 'correct border (UI)'],
  ['wl-error', 'wl-white', 3, 'wrong border (UI)'],
  ['wl-turquoise', 'wl-white', 2, 'current-step ring (decorative; the label is bold and the state is in aria-current)'],
  ['wl-turquoise', 'wl-o1-ground', 3, 'FX2 G END: "complete" in the brand accent on the dark photo (76.8px, large text)'],
  ['wl-white', 'wl-coach-head', 4.5, 'CO1: "Wawiwa AI Coach" and the close mark on the panel header'],
  ['wl-coach-sub', 'wl-coach-head', 4.5, 'CO1: "Chapter N · verb" under the coach title'],
  ['wl-body-ink', 'wl-white', 4.5, 'CO1: coach bubble text'],
  ['wl-white', 'wl-navy', 4.5, 'CO1: learner bubble text'],
  ['wl-coach-notice', 'wl-coach-notice-bg', 4.5, 'CO1: notice bubble'],
  ['wl-coach-chip', 'wl-white', 4.5, 'CO1: chip text'],
  ['wl-coach-meta', 'wl-coach-ground', 4.5, 'CO1: the privacy line under the input'],
  ['wl-ink', 'wl-white', 4.5, 'CO1: the first-use hint "Stuck? Ask me."'],
  ['wl-navy', 'wl-white', 4.5, 'CO1: "Got it"'],
  ['wl-white', 'wl-stage-ground', 4.5, 'headings and lines on the dark stage ground'],
  ['wl-aqua-text', 'wl-stage-ground', 4.5, 'labels on the dark stage ground'],
  ['wl-glass-text', 'wl-stage-ground', 4.5, 'glass text on the dark stage ground'],
  ['wl-o1-ground', 'wl-turquoise', 4.5, 'a number or icon on a turquoise square'],
  ['wl-teal-ink', 'wl-ivory', 4.5, 'a card kicker on ivory'],
  // the lesson's own pairs (its profile tokens, its screens): tests/check.mjs export pairs
  ...(LESSON?.pairs || []),
];
console.log('\n  contrast (text / background, ratio, needed, use)');
for (const [fg, bg, need, use] of PAIRS) {
  const r = ratio(hex(fg), hex(bg));
  const line = `${('--' + fg).padEnd(14)} on ${('--' + bg).padEnd(16)} ${r.toFixed(2).padStart(5)}:1  >= ${need}  ${use}`;
  r >= need ? ok(line) : fail(line);
}
// turquoise is never text on a light ground (it is the glass card's icon colour, and a ring; FX2 G: the
// END keyword on the dark photo, large text, the pair above)
const turquoiseText = [...frameCss.matchAll(/([^{}]+)\{([^}]*[^-]color:\s*var\(--wl-turquoise\)[^}]*)\}/g)].map((m) => m[1].trim()).filter((sel) => !/glass|\.w-tr\[|\.w-end-accent/.test(sel));
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
// (Kit, 23 Nov 2026; STANDARD 1.2) no stylesheet styles a screen by id, neither the kit's nor the lesson's: the same id is
// another screen in another lesson (EAI's S15 is not DM's S15). A screen's own look is an option (screen.styles).
{
  const css = srcFiles.filter((p) => p.endsWith('.css'));
  const stray = css.flatMap((p) => [...new Set(stripComments(read(p)).match(/data-screen\s*[~|^$*]?=/g) || [])].map(() => relative(ROOT, p)));
  stray.length ? fail('a stylesheet styles a screen by id (use screen.styles): ' + [...new Set(stray)].join(', ')) : ok(`no stylesheet styles a screen by id (${css.length} stylesheets)`);
  // every option a screen names exists in a stylesheet the lesson loads
  const loaded = css.map(read).join('\n');
  const missing = content.screens.flatMap((s) => [].concat(s.styles || []).filter((n) => !loaded.includes(`data-styles~="${n}"`)).map((n) => `${s.id} "${n}"`));
  missing.length ? fail('screen.styles options with no rule in the kit, the profile or lesson.css: ' + missing.join(', '))
    : ok(`screen.styles: ${content.screens.filter((s) => s.styles).map((s) => s.id + ' ' + [].concat(s.styles).join('+')).join(', ') || 'none used'}; each exists`);
  // the kit's code never names one of this lesson's screen ids (a lesson's own templates/ may)
  const kitJs = walk(join(ROOT, 'src')).filter((p) => p.endsWith('.js'));
  const named = kitJs.flatMap((p) => { const code = stripComments(read(p)); return content.screens.filter((s) => new RegExp(`['"\`]${s.id}['"\`]`).test(code)).map((s) => `${relative(ROOT, p)} ${s.id}`); });
  named.length ? fail('kit code names a screen id of this lesson: ' + named.join(', ')) : ok(`no kit module names a screen id (${kitJs.length} modules)`);
}

/* 8. boot fallback copy */
const html = read(join(ROOT, 'index.html'));
const fb = Object.fromEntries([...html.matchAll(/data-key="(\w+)">([^<]*)</g)].map((m) => [m[1], m[2]]));
const bootOk = Object.entries(content.ui.boot).every(([k, v]) => fb[k] === v) && Object.keys(fb).length === Object.keys(content.ui.boot).length;
bootOk ? ok('index.html boot fallback equals ui.boot') : fail('index.html boot fallback differs from ui.boot');

/* 9. word counts (the counting lives in src/review/words.js, shared with the review mode) */
// FX4: a practice screen at most 35 words with its answer options not counted, a presentation screen 45;
// every hint and feedback line at most 20 (the rule and the counting in words.js)
const { MAX_FEEDBACK_FX4: MAX_FEEDBACK_WORDS, words, screenViews: allViews, screenFeedback, isPractice, limitOf, standardLimit } = await import('../src/review/words.js');
const screenViews = (x, c) => allViews(x, c, { options: !isPractice(x) });
// PP1: an adaptive screen counts once per level (core, then each variant merged over the screen, its
// name marked [support] / [stretch]); a variant may carry its own wordLimit
const { variantOf, LEVELS } = await import('../src/adapt.js');
const levelsOf = (s) => [['', s], ...Object.keys(s.variants || {}).map((lv) => [lv, variantOf(s, lv)])];
const tag = (name, lv) => (lv ? `${name} [${lv}]` : name);
// one entry per view the learner sees at once: [name, strings on screen, the screen's wordLimit]
const views = content.screens.flatMap((s) => levelsOf(s).flatMap(([lv, x]) => screenViews(x, content).map(([n, l]) => [tag(n, lv), l, limitOf(x)])));
// FX4: no allowances any more (wordLimit is gone from the content): every view fits its screen's limit
let wordFails = 0;
for (const [name, list, cap] of views) {
  const n = list.reduce((sum, t) => sum + words(t), 0);
  if (n > cap) { wordFails++; fail(`${name}: ${n} on-screen words (max ${cap})`); }
}
if (!wordFails) ok(`on-screen words within the limit in all ${views.length} screen views (practice 35 without the answer options, presentation 45): ${views.map(([n, l]) => n + ' ' + l.reduce((s, t) => s + words(t), 0)).join(', ')}`);
// DM M2 L2: screens whose slide text is kept word for word by the work order state their own limit
// (screen.words: { max, why }); each is listed here for Noy, with its fullest view (not a failure)
const allowed = content.screens.filter((s) => s.words);
allowed.filter((s) => !(s.words.max > standardLimit(s)) || !s.words.why).forEach((s) => fail(`${s.id}: words needs max above the standard ${standardLimit(s)} and a reason (why)`));
if (allowed.length) {
  console.log(`  WARNING ${allowed.length} screens over the standard word budget by the work order (slide text kept word for word; Noy decides):`);
  for (const s of allowed) {
    const most = Math.max(...screenViews(s, content).map(([, l]) => l.reduce((n, t) => n + words(t), 0)));
    console.log(`          ${s.id}: ${most} words in its fullest view (standard ${standardLimit(s)}, allowed ${s.words.max}): ${s.words.why}`);
  }
}
// the key line: one sentence of the trainer's, at most 15 words, at most one per screen view
const keyByScreen = content.screens.map((s) => { const list = []; (function c(v) { if (Array.isArray(v)) v.forEach(c); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (k === 'keyLine' && typeof x === 'string') list.push(x); else c(x); } })(s); return [s.id, list]; }).filter(([, l]) => l.length);
// (a slide's own line kept word for word may be longer: screen.keyLineWhy says so, listed as a WARNING)
const whyOf = (id) => content.screens.find((s) => s.id === id).keyLineWhy;
const longKey = keyByScreen.flatMap(([id, l]) => l.filter((t) => words(t) > 15 && !whyOf(id)).map((t) => `${id}: ${words(t)} words`));
keyByScreen.filter(([id, l]) => whyOf(id) && l.some((t) => words(t) > 15)).forEach(([id]) => console.log(`  WARNING ${id}: key line over 15 words: ${whyOf(id)}`));
const manyKey = keyByScreen.filter(([, l]) => l.length > 1).map(([id, l]) => `${id}: ${l.length} key lines`);
longKey.length || manyKey.length ? fail('key lines: ' + [...longKey, ...manyKey].join('; '))
  : ok(`key lines: ${keyByScreen.length} screens, one each, at most 15 words (${keyByScreen.map(([id, l]) => id + ' ' + words(l[0])).join(', ')})`);
const feedbackLines = [
  // a chapter's pause marker counts even when its last screen is not in content yet
  ...content.chapters.filter((c) => c.pauseMarker && !ids.has(c.screens[c.screens.length - 1])).map((c) => [`${c.id} pauseMarker`, c.pauseMarker]),
  ...content.screens.flatMap((s) => levelsOf(s).flatMap(([lv, x]) => screenFeedback(x, content).map(([k, v]) => [tag(k, lv), v]))),
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
  // (FX3: a final "b" = an item's second version, S21)
  if (!t || !new RegExp(`^${KIT.idPrefix}[A-Z0-9]+_\\d+b?$`).test(t.id)) { metaFail(`${where}: missing or malformed id (${KIT.idPrefix}<screen>_<n>)`); continue; }
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
  // (FX2 D: S17 cases and S18A fields keep the sort's matching pattern, "card.column")
  if (s.template === 'sort' || s.template === 'sortDeck' || s.variant === 'cases' || s.variant === 'fields') return s.cards.map((c) => `${c.id ?? c.n}.${c.column}`).join(',');
  if (s.template === 'bpmn' && s.variant === 'label') return s.labels.map((l) => `${l.code}.${l.target}`).join(',');
  if (s.variant === 'tiles') return s.tiles.filter((x) => x.correct).map((x) => String(x.n)).join(',');
  // NL3 flags: the map's flagged fields in number order; the line's flags as one-character code.step
  if (s.template === 'flags') return s.variant === 'map' ? s.map.filter((x) => x.correct).map((x) => String(x.n)).join(',') : s.flags.map((f) => `${f.code}.${f.target}`).join(',');
  if (s.variant === 'pair') return letters(s.situations.find((x) => x.trackingId === t.id)?.options || []);
  if (s.template === 'check') {
    const it = s.items.flatMap((x) => [x, ...(x.b ? [{ ...x, ...x.b }] : [])]).find((x) => x.trackingId === t.id); // FX3: version b too
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
  ...(s.items || []).flatMap((it) => [[s.id, it.trackingId], ...(it.b ? [[s.id, it.b.trackingId]] : [])]),
  ...(s.step2?.field ? [[s.id, s.step2.field.trackingId]] : []),
]);
// The score (Noy, 23 Nov 2026; STANDARD 1.2, 1.5): every lesson gives one, from the scored questions spread along
// the lesson (tracking scored: true, graded only, on slice screens); pass mark 80; one attempt, no retake (a
// completion.retake true is the EAI pilot's older rule: a WARNING). completion.scoredScreens, if kept, limits the count.
const comp = content.lesson.completion || {};
const inSlice = new Set(content.lesson.slice);
// (a check item's second version, version b, only shows on a retake: one attempt counts version a)
const scored = interactions.filter(([s, t]) => t?.scored && (t.version || 'a') === 'a' && inSlice.has(s.id) && (!comp.scoredScreens || comp.scoredScreens.includes(s.id)));
const neutralScored = interactions.filter(([, t]) => t?.scored && t.result === 'neutral');
if (neutralScored.length) metaFail('a neutral interaction is marked scored (neutral questions never count): ' + neutralScored.map(([, t]) => t.id).join(', '));
if (!scored.length) metaFail('completion: no scored question in the lesson (every lesson gives a score from its questions: mark them scored: true)');
else if (comp.passMark !== 80) metaFail(`completion: pass mark ${comp.passMark} (the standard is 80)`);
else ok(`score: ${scored.length} scored questions on ${new Set(scored.map(([s]) => s.id)).size} screens along the lesson (${[...new Set(scored.map(([s]) => s.id))].join(', ')}), pass mark ${comp.passMark}, ${comp.retake ? 'retake ALLOWED' : 'one attempt, no retake'}`);
if (comp.retake) console.log('  WARNING completion.retake is true: the standard is one attempt, no retake (Noy, 23 Nov 2026)');
if (comp.scoredScreens) console.log(`  WARNING completion.scoredScreens limits the score to ${comp.scoredScreens.join(', ')} (the standard: the questions along the lesson)`);
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
const ALLOWED = [...allTokens.matchAll(/--wl-[\w-]+:\s*(#[0-9A-Fa-f]{6})\s*;/g)].map((m) => m[1].toUpperCase());
let hexHits = 0;
// (a profile's or the lesson's own :root block is where its tokens are defined: its hex values are the tokens)
for (const f of srcFiles.filter((p) => /\.(css|js)$/.test(p) && !p.endsWith('tokens.css'))) {
  read(f).replace(/:root\s*\{[^}]*\}/g, (m) => m.replace(/[^\n]/g, ' ')).split('\n').forEach((line, i) => {
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
  // the film's cue file decides the duration and the stops (media.cues): the content must equal it, never a typed time
  if (m.cues) {
    if (!existsSync(join(ROOT, m.cues))) { mediaFails++; fail(`${s.id}: cue file missing ${m.cues}`); }
    else {
      const cue = JSON.parse(read(join(ROOT, m.cues)));
      const want = (s.stops || []).map((x) => cue.stops.find((y) => y.id === x.cueId)?.t);
      if (cue.duration !== m.duration || want.join() !== ts.join()) { mediaFails++; fail(`${s.id}: duration ${m.duration} and stops ${ts.join(', ')} differ from ${m.cues} (${cue.duration}; ${want.join(', ')})`); }
    }
  }
}
if (!mediaFails) ok(`${videos.length} videos: media and captions exist, stop times in order (${videos.map((s) => s.id + ' ' + s.stops.map((x) => x.t + 's').join('/')).join(', ')})`);
// a film whose captions were written from the script and not checked against its audio (media.captionsDraft)
const draftCaps = videos.filter((s) => s.media?.captionsDraft);
if (draftCaps.length) {
  console.log(`  WARNING ${draftCaps.length} film(s) with DRAFT captions (written from the production script, not checked against the audio; replace with the film's own captions):`);
  draftCaps.forEach((s) => console.log(`          ${s.id}: ${s.media.captions[0].src}`));
}
if (tempMedia.length) {
  console.log(`  WARNING ${tempMedia.length} temp video files in use (silent placeholders from tools/make-placeholder-video.mjs, replace with the films):`);
  tempMedia.forEach((t) => console.log('          ' + t));
}

/* 13. image slots */
const slots = content.screens.flatMap((s) => [
  ...(s.image ? [[s.id, s.image]] : []),
  ...(s.cases || []).map((c) => [`${s.id} ${c.id}`, c.image]),
  ...(s.situations || []).filter((x) => x.image).map((x) => [`${s.id} ${x.id}`, x.image]), // FX1 E4: S06's stills
  ...(s.tiles || []).filter((x) => x.image).map((x) => [`${s.id} tile ${x.n}`, x.image]), // DM S05: the deck's own screenshot
]);
let imgFails = 0;
const temps = [];
// DM M2 L2: a placeholder (temp: true) needs its generator prompt file; a real picture taken from the deck
// (temp: false) names its source instead (image.source: the slide and the picture's name)
// (kit: a lesson whose photos are recorded in one photo manifest names it in kit.json "photoManifest" (STANDARD 1.9:
// generator, settings, prompt, seed and crop); then a final photo needs no source of its own)
const MANIFEST = KIT.photoManifest && existsSync(join(ROOT, KIT.photoManifest));
if (KIT.photoManifest && !MANIFEST) fail(`kit.json photoManifest ${KIT.photoManifest} does not exist`);
const promptOk = (img) => (img.temp ? !!img.prompt && existsSync(join(ROOT, img.prompt)) : !!img.source || MANIFEST || (!!img.prompt && existsSync(join(ROOT, img.prompt))));
for (const [where, img] of slots) {
  if (!img || !('src' in img) || !('alt' in img) || !('prompt' in img) || typeof img.temp !== 'boolean') { imgFails++; fail(`${where}: image needs src, alt, prompt, temp`); continue; }
  if (img.src && !existsSync(join(ROOT, img.src))) { imgFails++; fail(`${where}: image file missing ${img.src}`); }
  if (!img.alt || !img.alt.trim()) { imgFails++; fail(`${where}: image has no alt text`); }
  if (!promptOk(img)) { imgFails++; fail(`${where}: ${img.temp ? 'prompt file missing ' + img.prompt : 'a real picture needs its source'}`); }
  if (img.temp) temps.push(`${where}: ${img.src}`);
}
if (!imgFails) ok(`all ${slots.length} image slots have a file, alt text, and a prompt file (placeholders) or a source (deck pictures): ${slots.map(([w]) => w).join(', ')}`);
// the scene photos: one per chapter with screens (Stage photo, Focus wash) and a screen's own; paths in the content
const photos = [...content.chapters.filter((c) => c.screens.length).map((c) => [c.id, c.photo]), ...content.screens.filter((s) => s.photo).map((s) => [s.id, s.photo])];
const badPhotos = photos.filter(([, p]) => !p || !p.src || !existsSync(join(ROOT, p.src)) || typeof p.temp !== 'boolean' || !promptOk(p));
badPhotos.length ? badPhotos.forEach(([w]) => fail(`${w}: photo missing, its file missing, or no prompt file (placeholder) / source (deck picture)`)) : ok(`${photos.length} scene photos exist, each with its prompt file or source (${[...new Set(photos.map(([, p]) => p.src.split('/').pop()))].join(', ')})`);
[...new Set(photos.filter(([, p]) => p && p.temp).map(([, p]) => p.src))].forEach((src) => temps.push(`photo: ${src} (${photos.filter(([, p]) => p.src === src).map(([w]) => w).join(', ')})`));
// no text in images is a rule for the generator; here: every prompt file says so
// (a picture with a source, a screenshot or a deck picture, is not generated: its notes file may describe text)
const prompts = [...new Set([...slots.map(([, i]) => i), ...photos.map(([, p]) => p)].filter((i) => i && !i.source).map((i) => i.prompt).filter(Boolean))];
const noRule = prompts.filter((p) => existsSync(join(ROOT, p)) && !/no text/i.test(read(join(ROOT, p))));
noRule.length ? fail('prompt files without the "no text in the image" rule: ' + noRule.join(', ')) : ok(`${prompts.length} prompt files, each with the "no text in the image" rule`);
// every screen in a chapter names its step for the top bar: a verb and an icon from icons.js (FX3: any
// icon of the set, not only the glyphs); within a chapter no two steps share a verb or an icon
const noStep = content.chapters.flatMap((c) => c.screens).filter((id) => { const s = content.screens.find((x) => x.id === id); return s && !(s.step && (s.step.join || (s.step.verb && ICON_NAMES.includes(s.step.icon)))); });
noStep.length ? fail('screens without a step (verb + icon): ' + noStep.join(', ')) : ok('every chapter screen names its step (verb + icon)');
// (DM M2 L2: the workbook stops are one step by design, the same word and icon every time, so the learner
// recognises it: they are left out of the comparison)
const sameStep = content.chapters.flatMap((c) => {
  const steps = c.screens.map((id) => content.screens.find((x) => x.id === id)).filter((s) => s && s.template !== 'workbookStop').map((s) => s.step).filter((st) => st && !st.join);
  const dup = (k) => steps.map((st) => st[k]).filter((v, i, a) => a.indexOf(v) !== i);
  return [...dup('verb'), ...dup('icon')].map((v) => `${c.title}: ${v}`);
});
sameStep.length ? fail('steps repeated within a chapter: ' + sameStep.join(', ')) : ok('the steps of each chapter all differ (verb and icon)');
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

/* 15. version stamp (FX1): every link to the lesson's code and content carries the current ?v= (a hash
   of those files), so a push is never served from a browser's cache; stale or missing: npm run stamp */
{
  const { stampedFiles, linksOf, currentVersion } = await import('./stamp.mjs');
  const want = '?v=' + currentVersion();
  const bad = stampedFiles().flatMap((f) => linksOf(read(f)).filter((l) => l.stamp !== want).map((l) => `${relative(ROOT, f)}: ${l.path}${l.stamp || ' (no stamp)'}`));
  const n = stampedFiles().reduce((s, f) => s + linksOf(read(f)).length, 0);
  bad.length ? fail(`version stamp stale or missing (run npm run stamp; want ${want}): ${bad.slice(0, 5).join(', ')}${bad.length > 5 ? ` and ${bad.length - 5} more` : ''}`)
    : ok(`version stamp ${want} on all ${n} links (pages, imports)`);
  // the content is not stamped: every fetch of it must ask the server again (cache: 'no-cache')
  // (kit: the content's name is in kit.json; src/engine.js loadContent fetches kit.json, then the content)
  const fetches = stampedFiles().flatMap((f) => [...read(f).matchAll(/fetch\(new URL\([^)]*(?:kit\.json|c\.content)[^)]*\)\)?[^;]*/g)].map((m) => [relative(ROOT, f), m[0]]));
  const cached = fetches.filter(([, s]) => !s.includes("cache: 'no-cache'"));
  cached.length || !fetches.length ? fail('content fetch without cache: \'no-cache\': ' + (cached.map(([f]) => f).join(', ') || 'none found'))
    : ok(`the content is fetched fresh (cache: 'no-cache') in ${fetches.map(([f]) => f).join(', ')}`);
}

/* 16. the coach: no network code and no URL at all in src/coach (the live coach page is kit.json coach.url,
   framed only, never fetched); the CSP frames that page's origin only ('none' without one); every slice
   screen has its kind and one tip */
{
  const coachFiles = srcFiles.filter((f) => relative(ROOT, f).startsWith(join('src', 'coach')) && f.endsWith('.js'));
  const NET = /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|\bimport\s*\(/;
  const net = coachFiles.filter((f) => NET.test(stripComments(read(f))));
  const urls = coachFiles.flatMap((f) => (stripComments(read(f)).match(/https?:\/\/[^'"`\s)]*/g) || []).map((u) => [relative(ROOT, f), u]));
  const proxy = [...srcFiles, join(ROOT, 'index.html'), contentPath].filter((f) => /proxy|workers\.dev|\.lambda-url\./i.test(read(f)));
  // the live coach page: kit.json coach.url, a Wawiwa GitHub Pages page (framed, never fetched); empty = offline tips
  const COACH_URL = KIT.coach?.url || '';
  const urlOk = !COACH_URL || /^https:\/\/dory-ship-it\.github\.io\/wawiwa-activities\/[\w/-]+\/$/.test(COACH_URL);
  net.length || urls.length || proxy.length || !urlOk || !coachFiles.some((f) => f.endsWith('transport.js'))
    ? fail(`coach: network code in ${net.map((f) => relative(ROOT, f)).join(', ') || '-'}; URLs ${urls.map(([f, u]) => f + ' ' + u).join(', ') || '-'}; proxy URL in ${proxy.map((f) => relative(ROOT, f)).join(', ') || '-'}${urlOk ? '' : '; kit.json coach.url is not a wawiwa-activities page: ' + COACH_URL}`)
    : ok(`coach: no network code and no URL in ${coachFiles.length} src/coach files (one transport, ask()); the live page ${COACH_URL || '(none: offline tips)'} from kit.json; no proxy URL in src, index.html or content`);
  const frameSrc = COACH_URL ? new URL(COACH_URL).origin : "'none'";
  const CSP = `default-src 'self'; img-src 'self' data:; media-src 'self'; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; frame-src ${frameSrc}; object-src 'none'; base-uri 'self'; form-action 'none'`;
  const csp = read(join(ROOT, 'index.html')).match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
  csp === CSP ? ok(`CSP: frame-src ${frameSrc} (the live coach), the rest strict`) : fail(`CSP is ${csp}`);
  const lines = content.ui.coach?.lines || {};
  const slice = content.lesson.slice.map((id) => content.screens.find((s) => s.id === id));
  const bad = [];
  for (const s of slice) {
    const c = s.coach;
    if (!c || !c.kind) { bad.push(`${s.id} no coach.kind`); continue; }
    if (!SCREEN_TYPES[c.kind]) bad.push(`${s.id} kind ${c.kind} is not a known kind`);
    if (c.kind === 'locked') { if (c.tip) bad.push(`${s.id} is locked and has a tip`); continue; } // the scored check: no hints (and no opening line: the coach is locked)
    if (!lines[c.kind]) bad.push(`${s.id} kind ${c.kind} has no opening line`);
    if (!c.tip) bad.push(`${s.id} no tip`);
    else if (c.tipDrafted) { if (words(c.tip) > 20) bad.push(`${s.id} drafted tip ${words(c.tip)} words`); }
    else if (c.tip !== s.hint) bad.push(`${s.id} tip is not its hint word for word`);
  }
  if (!slice.some((s) => s.id === content.ui.coach.demoOn)) bad.push(`ui.coach.demoOn ${content.ui.coach.demoOn} is not a slice screen`);
  bad.length ? fail('coach content: ' + bad.join('; '))
    : ok(`coach: every slice screen has its kind and one tip (${slice.filter((s) => s.coach.tipDrafted).length} drafted, ${slice.filter((s) => s.coach.tip && !s.coach.tipDrafted).length} copied from the hint), at most 20 words`);
}

/* 17. the lesson's own rules (tests/check.mjs export default (content, { ok, fail, words, ROOT, KIT })) */
if (LESSON?.default) await LESSON.default(content, { ok, fail, words, ROOT, KIT, read });
else ok('no lesson rules of its own (tests/check.mjs)');

/* 18. the kit: every kit file is the kit's copy (kit.lock.json), src/ and tools/ hold kit files only */
{
  const lockPath = join(ROOT, 'kit.lock.json');
  if (!existsSync(lockPath)) fail('kit.lock.json missing: run npm run kit:sync');
  else {
    const lock = JSON.parse(read(lockPath));
    const norm = (s) => s.replace(/\r\n/g, '\n').replace(/\?v=[0-9a-f]{8}/g, '');
    const hashOf = (p) => createHash('sha1').update(/\.(js|mjs|css|html|json|md|txt)$/.test(p) ? norm(readFileSync(p, 'utf8')) : readFileSync(p)).digest('hex').slice(0, 12);
    const edited = Object.entries(lock.files).filter(([p, h]) => !existsSync(join(ROOT, p)) || hashOf(join(ROOT, p)) !== h).map(([p]) => p);
    const extra = [...walk(join(ROOT, 'src')), ...walk(join(ROOT, 'tools'))].map((p) => relative(ROOT, p).replace(/\\/g, '/')).filter((p) => !(p in lock.files));
    const v = KIT.kit === lock.kit && KIT.profile === lock.profile;
    edited.length || extra.length || !v
      ? fail(`kit files: ${edited.length ? 'edited or missing in this lesson (fix it in _selfstudy-kit, then npm run kit:sync): ' + edited.join(', ') : ''}${extra.length ? '; not from the kit (a lesson file goes in templates/, tests/ or lesson.css): ' + extra.join(', ') : ''}${v ? '' : `; kit.json asks for ${KIT.kit} ${KIT.profile}, the copy is ${lock.kit} ${lock.profile}`}`)
      : ok(`kit ${lock.kit}, profile ${lock.profile}: all ${Object.keys(lock.files).length} kit files are the kit's own copy, nothing else in src/ and tools/`);
  }
}

finish();
function finish() {
  console.log(fails.length ? `\ncheck FAILED (${fails.length})` : '\ncheck passed');
  process.exit(fails.length ? 1 : 0);
}
