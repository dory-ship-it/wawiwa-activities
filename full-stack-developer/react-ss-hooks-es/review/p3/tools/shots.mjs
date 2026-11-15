// P3: screenshots of a practice at 680 and 1100 px wide, the fit checks and a keyboard-only pass.
// Needs puppeteer-core, so copy it into the throwaway lab folder and run it there:
//   node shots.mjs <path to react-ss-hooks-es> <page folder> [lang] [check]
// With `check` as the last word it runs the checks only and writes no image.
// The page is loaded inside an iframe with the embed's 1000:560 ratio, as Rise shows it, on the
// Rise block colour. Every state is one frame.
// The states come from the page's own strings: every screen fresh, answered wrong in each way the
// page knows, and answered right; every tab of a code card. All of them are checked for fit.
// The image holds one frame per screen (its answered state), stacked.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import vm from 'node:vm';

const [lesson, pageDir, lang = 'es', mode = 'shots'] = process.argv.slice(2);
if (!lesson || !pageDir) { console.error('usage: node shots.mjs <path to react-ss-hooks-es> <page folder> [lang] [check]'); process.exit(1); }
const file = lang === 'es' ? 'index.html' : `index.${lang}.html`;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };

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
  args: ['--no-first-run', '--user-data-dir=' + join(process.cwd(), '.chrome-profile')],
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
// The check-in shuffles its options: the same order in every run, so the images can be compared.
const seed = (page) => page.evaluateOnNewDocument(() => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });

for (const w of [680, 1100]) {
  const h = Math.round(w * 560 / 1000);
  for (const pass of ['check', 'shot']) {
    const list = pass === 'check' ? states : states.filter((s) => s.shot);
    if (pass === 'shot' && mode === 'check') continue;
    const page = await browser.newPage();
    await seed(page);
    const outside = [], errors = [];
    page.on('request', (r) => { if (!r.url().startsWith(base)) outside.push(r.url()); });
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
    await page.setViewport({ width: w, height: list.length * h + (list.length - 1) * 16, deviceScaleFactor: pass === 'shot' ? 2 : 1 });
    await page.goto(`${base}/__wrap?w=${w}&n=${list.length}`, { waitUntil: 'networkidle0' });
    const frames = page.frames().filter((f) => f !== page.mainFrame());
    if (pass === 'shot') {
      for (let k = 0; k < list.length; k++) await prepare(frames[k], list[k]);
      const out = join(lesson, 'review', 'p3', `${pageDir.split('-')[0]}-${w}${lang === 'es' ? '' : '.' + lang}.png`);
      await page.screenshot({ path: out });
      console.log(`  wrote ${out} (${list.length} frames)`);
      await page.close();
      continue;
    }
    console.log(`\n## ${pageDir} (${lang}) at ${w} px wide: frame ${w} x ${h}, ${list.length} states`);
    let tight = null;
    for (let k = 0; k < list.length; k++) {
      const f = frames[k], st = list[k];
      await prepare(f, st);
      const m = await f.evaluate(() => {
        const main = document.getElementById('main'), scr = document.querySelector('.screen:not([hidden])');
        const canvas = document.querySelector('.canvas').getBoundingClientRect();
        const seen = (e) => e.getClientRects().length > 0;
        const clipped = [...scr.querySelectorAll('.codebox li .t')].filter((t) => seen(t) && t.scrollWidth > t.clientWidth).length;
        const cut = [...scr.querySelectorAll('.btn, .opt, .copy, .tab, .pk, .ch, .rl')].concat([...document.querySelectorAll('.nm, .steps')]).filter((e) => seen(e) && e.scrollWidth > e.clientWidth + 1).length;
        const box = [...scr.querySelectorAll('.fb[data-fb], .fb[data-k]')].filter(seen)[0];
        const li = [...scr.querySelectorAll('.codebox li:not(.bl)')].filter(seen)[0];
        const next = scr.querySelector('[data-next]');
        return {
          screen: scr.id, scale: getComputedStyle(document.documentElement).getPropertyValue('--s').trim(),
          need: Math.ceil(scr.scrollHeight), have: main.clientHeight - parseFloat(getComputedStyle(main).paddingTop) - parseFloat(getComputedStyle(main).paddingBottom), clipped, cut,
          wide: scr.scrollWidth > scr.clientWidth + 1,
          canvas: [Math.round(canvas.left), Math.round(canvas.top), Math.round(canvas.width), Math.round(canvas.height)],
          // The code font counts as loaded when the weight this screen uses is (inline code in bold text uses 500 only)
          fonts: [document.fonts.check('400 16px Assistant'), document.fonts.check('700 16px Assistant'), document.fonts.check('400 12px "JetBrains Mono"') || document.fonts.check('500 12px "JetBrains Mono"')],
          next: next ? (next.disabled ? 'locked' : 'open') : 'none',
          mine: scr.querySelectorAll('.mine .ch').length, expected: scr.querySelectorAll('.rows .ch').length,
          box: box ? (box.dataset.fb || (box.classList.contains('ok') ? 'ok' : 'no')) : null,
          codePx: li ? +(parseFloat(getComputedStyle(li).fontSize) * li.getBoundingClientRect().width / li.offsetWidth).toFixed(1) : null,
        };
      });
      if (!tight || m.have - m.need < tight.room) tight = { room: m.have - m.need, label: st.label };
      console.log(`  ${st.label.padEnd(34)} content ${String(m.need).padStart(3)} of ${m.have} px  next ${m.next.padEnd(6)} box ${String(m.box).padEnd(7)}${m.codePx ? ' code ' + m.codePx + ' px' : ''}`);
      if (m.need > m.have) fail(`${st.label}: content is ${m.need - m.have} px taller than the screen area`);
      if (m.wide) fail(`${st.label}: content is wider than the screen area`);
      if (m.clipped) fail(`${st.label}: ${m.clipped} code line(s) wider than the card`);
      if (m.cut) fail(`${st.label}: ${m.cut} control(s) with cut text`);
      if (m.fonts.includes(false)) fail(`${st.label}: a font did not load (${m.fonts})`);
      if (m.canvas[2] !== w || Math.abs(m.canvas[3] - h) > 1 || m.canvas[0] !== 0) fail(`${st.label}: canvas does not fill the frame (${m.canvas})`);
      if ('want' in st && m.box !== st.want) fail(`${st.label}: the feedback shown is "${m.box}", expected "${st.want}"`);
      // The way on opens only after an answer the page knows (right, or a wrong one it has a hint for).
      if ('open' in st && m.next !== 'none' && (m.next === 'open') !== st.open) fail(`${st.label}: the next button is ${m.next}`);
      if (st.how === 'counted' && m.mine !== m.expected) fail(`${st.label}: ${m.mine} chips shown for ${m.expected} expected lines`);
    }
    console.log(`  scale ${(w / 1000).toFixed(2)}; least room left: ${tight.room} px (${tight.label})`);
    if (outside.length) fail(`requests outside the page's own folder: ${outside.join(', ')}`); else console.log('  requests outside the lesson folder: 0');
    if (errors.length) fail(`console errors: ${errors.join(' | ')}`); else console.log('  console errors: 0');
    await page.close();
  }
}

// Keyboard only, at the design size: every screen is reached and answered with Tab, Enter and typing.
{
  const page = await browser.newPage();
  await seed(page);
  await page.setViewport({ width: 1000, height: 560 });
  await page.goto(`${base}/${pageDir}/${file}`, { waitUntil: 'networkidle0' });
  const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await page.keyboard.press(k); await sleep(35); } };
  const on = (sel) => page.evaluate((s) => { const a = document.activeElement; return !!a && a.matches('.screen:not([hidden]) ' + s); }, sel);
  // Tab until the focus is on the control wanted (at most 60 presses: the focus goes round the page)
  const reach = async (sel) => { for (let i = 0; i < 60; i++) { if (await on(sel)) return true; await key('Tab'); } return false; };
  const info = () => page.evaluate(() => {
    const scr = document.querySelector('.screen:not([hidden])'), d = scr.querySelector('[data-known]'), f = scr.querySelector('form');
    return {
      id: scr.id, type: scr.dataset.type, index: [...document.querySelectorAll('.screen')].indexOf(scr),
      order: scr.querySelector('[data-answer]') ? scr.querySelector('[data-answer]').dataset.answer.split(' ') : null,
      paste: d ? d.dataset.expected.split(' ').map((k) => d.dataset.known.split('\n')[+k]) : null,
      value: f ? (f.dataset.expected.split('\n')[0] || '"Vale"') : null,
      marks: scr.querySelectorAll('.opt[data-ok]').length, tabs: scr.querySelectorAll('[data-tab]').length,
    };
  });
  console.log(`\n## ${pageDir} (${lang}): keyboard only`);
  const total = P.screens.length;
  let ok = true;
  const must = (cond, msg) => { if (!cond) { ok = false; fail('keyboard, ' + msg); } return cond; };
  for (let n = 0; n < total && ok; n++) {
    const s = await info();
    must(s.index === n, `screen ${n + 1} is not the one shown (${s.id})`);
    if (n > 0) must(await on('.ins'), `${s.id}: the focus is not on the heading when the screen opens`);
    let steps = '';
    if (s.type === 'choice') {
      must(await reach('.opt[data-ok]'), `${s.id}: Tab does not reach the right option`); await key('Enter');
      steps = 'Tab to the option, Enter';
    } else if (s.type === 'multi') {
      for (let i = 0; i < s.marks; i++) { must(await reach('.opt[data-ok][aria-pressed="false"]'), `${s.id}: Tab does not reach an option`); await key('Space'); }
      must(await reach('[data-check]'), `${s.id}: Tab does not reach Check`); await key('Enter');
      steps = `Tab and Space on ${s.marks} option(s), Enter on Check`;
    } else if (s.type === 'order') {
      for (const v of s.order) { must(await reach(`.pool .pk[data-v="${v}"]`), `${s.id}: Tab does not reach a line`); await key('Enter'); }
      steps = `Tab and Enter on ${s.order.length} lines`;
    } else if (s.type === 'paste') {
      must(await reach('textarea'), `${s.id}: Tab does not reach the paste box`);
      for (const l of s.paste) { await page.keyboard.type(l); await key('Enter'); }
      must(await reach('[data-compare]'), `${s.id}: Tab does not reach Compare`); await key('Enter');
      steps = `typed ${s.paste.length} lines, Enter on Compare`;
    } else if (s.type === 'value') {
      must(await reach('input'), `${s.id}: Tab does not reach the field`);
      await page.keyboard.type(s.value); await key('Enter');
      steps = 'typed the answer, Enter';
    } else if (s.type === 'solution' && s.tabs) {
      must(await reach('[data-tab="1"]'), `${s.id}: Tab does not reach the second file`); await key('Enter');
      must(await page.evaluate(() => !document.querySelector('.screen:not([hidden]) ol[data-pane="1"]').hidden), `${s.id}: Enter on the second file did not show it`);
      must(await reach('.copy:not([hidden])'), `${s.id}: Tab does not reach Copy`);
      steps = 'Tab to the second file, Enter, Tab to Copy';
    }
    if (s.type === 'takeaway') {
      must(await reach('[data-restart]'), `${s.id}: Tab does not reach Start again`); await key('Enter');
      const back = await info();
      must(back.index === 0 && await on('.ins'), `${s.id}: Start again did not return to screen 1`);
      const clean = await page.evaluate(() => !document.querySelector('.opt[disabled], .opt.is-ok, .opt.is-no, .opt[aria-pressed="true"], .slot .pk, .fb[data-fb]:not([hidden]), .fb[data-k]:not([hidden])') &&
        [...document.querySelectorAll('input, textarea')].every((e) => e.value === '') && [...document.querySelectorAll('[data-next][disabled]')].length > 0);
      must(clean, 'Start again did not clear the answers');
      steps = 'Tab to Start again, Enter: back on screen 1, answers cleared';
    } else {
      if (['choice', 'multi', 'order'].includes(s.type)) must(await on('[data-next]'), `${s.id}: after the right answer the focus is not on the next button`);
      must(await reach('[data-next]:not([disabled])'), `${s.id}: Tab does not reach the next button`); await key('Enter');
    }
    if (ok) console.log(`  keyboard  ${String(n + 1).padStart(2)} ${s.type.padEnd(9)} ${steps || 'Tab to the button, Enter'}`);
  }
  await page.close();
}

await browser.close();
server.close();
console.log(`\n${failed} failed checks`);
process.exit(failed ? 1 : 0);
