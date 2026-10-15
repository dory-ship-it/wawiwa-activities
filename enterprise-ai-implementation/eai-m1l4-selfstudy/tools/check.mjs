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
    if (/[–—]/.test(line)) { dashHits++; fail(`dash (U+2013/U+2014) in ${relative(ROOT, f)}:${i + 1}`); }
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

finish();
function finish() {
  console.log(fails.length ? `\ncheck FAILED (${fails.length})` : '\ncheck passed');
  process.exit(fails.length ? 1 : 0);
}
