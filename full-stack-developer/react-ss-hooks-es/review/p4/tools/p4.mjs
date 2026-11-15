// P4: axe-core on every state of a practice page, and the embed height by the repo rule.
// Built from review/p3/tools/shots.mjs (same states, same clicks). Needs puppeteer-core and axe-core,
// so copy it into the throwaway lab folder and run it there:
//   node p4.mjs <path to react-ss-hooks-es> <page folder> [lang]
// axe: the page alone at its design size 1000 x 560, every state (fresh, each wrong answer, right,
// every tab of a code card), rules for WCAG 2.0/2.1/2.2 A and AA plus best practice.
// Embed height (wawiwa-activities/CLAUDE.md): the page in an iframe 100% wide in a column 1000 and
// 760 px wide, the frame as tall as needed; the height of the visible card at each width; the taller + 16.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import vm from 'node:vm';

const [lesson, pageDir, lang = 'es'] = process.argv.slice(2);
if (!lesson || !pageDir) { console.error('usage: node p4.mjs <path to react-ss-hooks-es> <page folder> [lang]'); process.exit(1); }
const file = lang === 'es' ? 'index.html' : `index.${lang}.html`;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };
const AXE = readFileSync(join(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf8');

const sb = { window: {} };
vm.runInNewContext(readFileSync(join(lesson, pageDir, `strings.${lang}.js`), 'utf8'), sb);
const P = sb.window.RH_PAGE;

// One state = the screen it is on (0-based) and how that screen was answered.
const states = [];
P.screens.forEach((s, at) => {
  const add = (label, how, extra = {}) => states.push({ label: `${at + 1} ${s.type} ${label}`, at, how, ...extra });
  if (s.type === 'choice' || s.type === 'multi' || s.type === 'order') {
    add('fresh', null, { open: false }); add('wrong', 'wrong', { want: 'no', open: false }); add('right', 'right', { want: 'ok', open: true, shot: true });
  } else if (s.type === 'paste') {
    add('fresh', null, { open: false });
    add('nothing known', 'none', { want: 'none', open: false });
    add('half of it', 'part', { want: 'other', open: true });
    if (s.missing) add('a line missing', 'missing', { want: 'missing', open: true });
    add('repeats with a count', 'counted', { want: 'ok', open: true });
    add('repeats shown once', 'once', { want: 'ok', open: true });
    add('right', 'right', { want: 'ok', open: true, shot: true });
  } else if (s.type === 'value') {
    add('fresh', null, { open: false });
    s.hints.forEach((h, k) => add('hint ' + (k + 1), { value: h.any ? 'xyz 7' : h.when[0] }, { want: 'hint', open: true }));
    if (s.other && !s.hints.some((h) => h.any)) add('other', { value: 'xyz 7' }, { want: 'other', open: false });
    add('right', 'right', { want: 'ok', open: true, shot: true });
  } else if (s.type === 'solution') {
    (Array.isArray(s.code) ? s.code : [s.code]).forEach((c, k) => add(c.file, { tab: k }, { shot: k === 0 }));
  } else add('', null, { shot: true });
});

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  if (url.pathname === '/__wrap') {
    const w = +url.searchParams.get('w'), n = +url.searchParams.get('n'), h = Math.round(w * 560 / 1000);
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    res.end(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#0D1626}iframe{display:block;border:0;width:${w}px;height:${h}px;margin:0 0 16px}iframe:last-child{margin:0}</style>` +
      Array.from({ length: n }, () => `<iframe src="/${pageDir}/${file}"></iframe>`).join(''));
    return;
  }
  const p = normalize(join(lesson, decodeURIComponent(url.pathname)));
  if (!p.startsWith(normalize(lesson)) || !existsSync(p) || !statSync(p).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-first-run', '--user-data-dir=' + join(process.cwd(), '.chrome-profile-p4')],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const fail = (msg) => { failed++; console.log('  FAIL  ' + msg); };

// Runs inside the page: answers the visible screen in the way asked. Clicks only, as a learner would.
const answer = (how) => {
  const scr = document.querySelector('.screen:not([hidden])'), type = scr.dataset.type;
  const q = (s) => [...scr.querySelectorAll(s)];
  if (!how) return;
  if (type === 'choice') (how === 'wrong' ? q('.opt:not([data-ok])')[0] : scr.querySelector('.opt[data-ok]')).click();
  if (type === 'multi') { (how === 'wrong' ? [q('.opt:not([data-ok])')[0]] : q('.opt[data-ok]')).forEach((b) => b.click()); scr.querySelector('[data-check]').click(); }
  if (type === 'order') {
    if (how === 'wrong') q('.pool .pk').forEach((b) => b.click());
    else scr.querySelector('[data-answer]').dataset.answer.split(' ').forEach((v) => scr.querySelector('.pool .pk[data-v="' + v + '"]').click());
  }
  if (type === 'paste') {
    const d = scr.querySelector('[data-known]'), known = d.dataset.known.split('\n'), exp = d.dataset.expected.split(' ').map(Number);
    const line = (k) => 'File.jsx:9 ' + known[k];
    let text = exp.map(line).join('\n');
    if (how === 'none') text = 'hello\n[vite] connected.';
    if (how === 'part') text = exp.slice(0, 3).map(line).join('\n');
    if (how === 'missing') text = exp.filter((k) => k === 0).map(line).join('\n');
    // As Chrome shows a repeated line: once, with a count in front. And the same with the count lost.
    const runs = exp.reduce((a, k) => { if (a.length && a[a.length - 1][0] === k) a[a.length - 1][1]++; else a.push([k, 1]); return a; }, []);
    if (how === 'counted') text = runs.map(([k, n]) => (n > 1 ? n : '') + line(k)).join('\n');
    if (how === 'once') text = runs.map(([k]) => line(k)).join('\n');
    scr.querySelector('textarea').value = text;
    scr.querySelector('[data-compare]').click();
  }
  if (type === 'value') {
    const f = scr.querySelector('form');
    f.querySelector('input').value = how === 'right' ? (f.dataset.expected.split('\n')[0] || '"Vale"') : how.value;
    f.requestSubmit();
  }
  if (type === 'solution' && how.tab !== undefined && scr.querySelector('[data-tab]')) scr.querySelector('[data-tab="' + how.tab + '"]').click();
};
const forward = () => document.querySelector('.screen:not([hidden]) [data-next]').click();
const prepare = async (f, st) => {
  for (let i = 0; i < st.at; i++) { await f.evaluate(answer, 'right'); await f.evaluate(forward); }
  await f.evaluate(answer, st.how);
  await sleep(40);
  await f.evaluate(() => document.fonts.ready);
};

const seed = (page) => page.evaluateOnNewDocument(() => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });

// 1. axe on every state
const found = new Map(), review = new Map();
let runs = 0;
for (const st of states) {
  const page = await browser.newPage();
  await seed(page);
  await page.setViewport({ width: 1000, height: 560 });
  await page.goto(`${base}/${pageDir}/${file}`, { waitUntil: 'networkidle0' });
  await prepare(page.mainFrame(), st);
  await page.evaluate(AXE);
  const r = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })
    .then((x) => ({ v: x.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1).join(' ')) })), inc: x.incomplete.map((v) => v.id), incd: x.incomplete.flatMap((v) => v.nodes.map((n) => v.id + ' ' + n.target.join(' ') + ' :: ' + ((n.any[0] || {}).message || ''))), pass: x.passes.length, ver: axe.version })));
  runs++;
  for (const d of r.incd) { const k = d.replace(/#[0-9a-f]{6}/gi, '#').replace(/[\d.]+:1/g, 'N:1'); if (!review.has(k)) review.set(k, d); }
  for (const v of r.v) { const k = v.id; if (!found.has(k)) found.set(k, { ...v, states: [] }); found.get(k).states.push(st.label); }
  console.log(`  axe ${r.ver}  ${st.label.padEnd(34)} violations ${r.v.length}  passes ${r.pass}${r.inc.length ? '  needs review: ' + [...new Set(r.inc)].join(',') : ''}`);
  await page.close();
}
console.log(`\n## ${pageDir} (${lang}): axe on ${runs} states, ${found.size} distinct violation(s)`);
console.log(`  axe "needs review" (axe could not decide; not violations), distinct:`);
for (const d of review.values()) console.log('    ' + d);
for (const v of found.values()) { failed++; console.log(`  FAIL  ${v.id} (${v.impact}): ${v.help}\n        in: ${v.states.join('; ')}\n        ${v.nodes.slice(0, 4).join('\n        ')}`); }

// 2. embed height
{
  const out = [];
  for (const col of [1000, 760]) {
    const page = await browser.newPage();
    await page.setViewport({ width: col, height: 1600 });
    await page.setContent(`<!doctype html><style>body{margin:0}</style><iframe src="${base}/${pageDir}/${file}" style="display:block;border:0;width:100%;height:1500px"></iframe>`, { waitUntil: 'networkidle0' });
    const f = page.frames().find((x) => x !== page.mainFrame());
    await f.evaluate(() => document.fonts.ready);
    const m = await f.evaluate(() => { const c = document.querySelector('.canvas').getBoundingClientRect(); return { w: c.width, h: c.height, docW: innerWidth, font: document.fonts.check('400 16px Assistant') }; });
    out.push(m.h);
    console.log(`  embed column ${col}: frame width ${m.docW}, card ${m.w.toFixed(1)} x ${m.h.toFixed(1)} px, Assistant loaded ${m.font}`);
    await page.close();
  }
  console.log(`  embedHeight = ceil(max(${out.map((x) => x.toFixed(1)).join(', ')})) + 16 = ${Math.ceil(Math.max(...out)) + 16}`);
}
await browser.close();
server.close();
console.log(`\n${failed} failed checks`);
process.exit(failed ? 1 : 0);
