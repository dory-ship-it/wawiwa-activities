// P3 taste gate: screenshots of a practice at 680 and 1100 px wide, and the fit checks.
// Needs puppeteer-core, so copy it into the throwaway lab folder and run it there:
//   node shots.mjs <path to react-ss-hooks-es> <page folder> [lang] [check]
// With `check` as the last word it runs the checks only and writes no image.
// The page is loaded inside an iframe with the embed's 1000:560 ratio, as Rise shows it, on the
// Rise block colour. Every state is one frame; the frames are stacked into one image per width.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const [lesson, pageDir, lang = 'es', mode = 'shots'] = process.argv.slice(2);
if (!lesson || !pageDir) { console.error('usage: node shots.mjs <path to react-ss-hooks-es> <page folder> [lang]'); process.exit(1); }
const file = lang === 'es' ? 'index.html' : `index.${lang}.html`;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };

// States to show, in order. `answer` is typed on a value screen; `pick` is the option index on a choice screen.
const STATES = {
  'p1-usestate': [
    { label: '1 fresh', do: [] },
    { label: '1 wrong option', do: [{ pick: 1 }] },
    { label: '1 right option', do: [{ pick: 1 }, { pick: 0 }] },
    { label: '2 task', do: [{ pick: 0 }, { next: 1 }] },
    { label: '3 other answer', do: [{ pick: 0 }, { next: 2 }, { answer: lang === 'es' ? 'sí' : 'yes' }] },
    { label: '3 expected answer', do: [{ pick: 0 }, { next: 2 }, { answer: 'no' }] },
    { label: '4 solution', do: [{ pick: 0 }, { next: 2 }, { answer: 'no' }, { next: 1 }] },
    { label: '5 takeaway', do: [{ pick: 0 }, { next: 2 }, { answer: 'no' }, { next: 2 }] },
  ],
};
const states = STATES[pageDir];
if (!states) { console.error('no states listed for ' + pageDir); process.exit(1); }

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  if (url.pathname === '/__wrap') {
    const w = +url.searchParams.get('w'), h = Math.round(w * 560 / 1000);
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    res.end(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#0D1626}iframe{display:block;border:0;width:${w}px;height:${h}px;margin:0 0 16px}iframe:last-child{margin:0}</style>` +
      states.map(() => `<iframe src="/${pageDir}/${file}"></iframe>`).join(''));
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

for (const w of [680, 1100]) {
  const h = Math.round(w * 560 / 1000);
  const total = states.length * h + (states.length - 1) * 16;
  const page = await browser.newPage();
  const outside = [], errors = [];
  page.on('request', (r) => { if (!r.url().startsWith(base)) outside.push(r.url()); });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.setViewport({ width: w, height: total, deviceScaleFactor: 2 });
  await page.goto(`${base}/__wrap?w=${w}`, { waitUntil: 'networkidle0' });
  const frames = page.frames().filter((f) => f !== page.mainFrame());
  console.log(`\n## ${pageDir} (${lang}) at ${w} px wide: frame ${w} x ${h}, ${frames.length} states`);

  for (let k = 0; k < states.length; k++) {
    const f = frames[k], st = states[k];
    for (const a of st.do) {
      if ('pick' in a) await f.evaluate((i) => document.querySelectorAll('.screen:not([hidden]) .opt')[i].click(), a.pick);
      if ('next' in a) for (let n = 0; n < a.next; n++) await f.evaluate(() => document.querySelector('.screen:not([hidden]) [data-next]').click());
      if ('answer' in a) await f.evaluate((v) => { const s = document.querySelector('.screen:not([hidden])'); s.querySelector('input').value = v; s.querySelector('form').requestSubmit(); }, a.answer);
      await sleep(30);
    }
    await f.evaluate(() => document.fonts.ready);
    const m = await f.evaluate(() => {
      const main = document.getElementById('main'), scr = document.querySelector('.screen:not([hidden])');
      const canvas = document.querySelector('.canvas').getBoundingClientRect();
      const clipped = [...scr.querySelectorAll('.codebox li .t')].filter((t) => t.scrollWidth > t.clientWidth).length;
      const cut = [...scr.querySelectorAll('.btn, .opt, .copy, .nm, .steps')].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
      return {
        screen: scr.id, scale: getComputedStyle(document.documentElement).getPropertyValue('--s').trim(),
        need: Math.ceil(scr.scrollHeight), have: main.clientHeight - parseFloat(getComputedStyle(main).paddingTop) - parseFloat(getComputedStyle(main).paddingBottom), clipped, cut,
        canvas: [Math.round(canvas.left), Math.round(canvas.top), Math.round(canvas.width), Math.round(canvas.height)],
        fonts: ['400 16px Assistant', '700 16px Assistant', '400 12px "JetBrains Mono"'].map((x) => document.fonts.check(x)),
        btnNext: (() => { const b = scr.querySelector('[data-next]'); return b ? (b.disabled ? 'disabled' : 'enabled') : 'none'; })(),
        codePx: (() => { const li = scr.querySelector('.codebox li'); return li ? +(parseFloat(getComputedStyle(li).fontSize) * li.getBoundingClientRect().width / li.offsetWidth).toFixed(1) : null; })(),
      };
    });
    console.log(`  ${st.label.padEnd(18)} ${m.screen.padEnd(11)} scale ${m.scale}  content ${m.need} of ${m.have} px  next ${m.btnNext}${m.codePx ? '  code ' + m.codePx + ' px' : ''}`);
    if (m.need > m.have) fail(`${st.label}: content is ${m.need - m.have} px taller than the screen area`);
    if (m.clipped) fail(`${st.label}: ${m.clipped} code line(s) wider than the card`);
    if (m.cut) fail(`${st.label}: ${m.cut} control(s) with cut text`);
    if (m.fonts.includes(false)) fail(`${st.label}: a font did not load (${m.fonts})`);
    if (m.canvas[2] !== w || Math.abs(m.canvas[3] - h) > 1 || m.canvas[0] !== 0) fail(`${st.label}: canvas does not fill the frame (${m.canvas})`);
  }
  if (outside.length) fail(`requests outside the page's own folder: ${outside.join(', ')}`); else console.log('  requests outside the lesson folder: 0');
  if (errors.length) fail(`console errors: ${errors.join(' | ')}`); else console.log('  console errors: 0');
  const out = join(lesson, 'review', 'p3', `${pageDir.split('-')[0]}-${w}${lang === 'es' ? '' : '.' + lang}.png`);
  if (mode !== 'check') { await page.screenshot({ path: out }); console.log('  wrote ' + out); }
  await page.close();
}

// Keyboard only, at the design size: every screen is reached and answered with Tab, Enter and typing.
if (pageDir === 'p1-usestate') {
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 560 });
  await page.goto(`${base}/${pageDir}/${file}`, { waitUntil: 'networkidle0' });
  const where = () => page.evaluate(() => { const a = document.activeElement, s = document.querySelector('.screen:not([hidden])'); return s.id + ' > ' + (a.className || a.tagName) ; });
  const expect = async (label, want) => { const got = await where(); if (got !== want) fail(`keyboard, ${label}: focus is on "${got}", expected "${want}"`); else console.log(`  keyboard  ${label.padEnd(34)} ${got}`); };
  const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await page.keyboard.press(k); await sleep(40); } };
  console.log(`\n## ${pageDir} (${lang}): keyboard only`);
  await key('Tab'); await expect('Tab reaches the first option', 's-predice > opt');
  await key('Tab'); await key('Enter'); await expect('wrong option keeps the focus', 's-predice > opt is-no');
  await key('Tab', 2); await expect('Continue is disabled, Tab skips it', 's-predice > BODY');
  await key('Tab'); await key('Enter'); await expect('right option moves to Continue', 's-predice > btn');
  await key('Enter'); await expect('screen 2 opens on its heading', 's-ejecuta > ins');
  await key('Tab'); await key('Enter'); await expect('screen 3 opens on its heading', 's-compara > ins');
  await key('Tab'); await page.keyboard.type('No.'); await key('Enter'); await expect('Enter in the field checks it', 's-compara > INPUT');
  await key('Tab', 2); await expect('Tab reaches the solution button', 's-compara > btn');
  await key('Enter'); await expect('screen 4 opens on its heading', 's-solucion > ins');
  await key('Tab'); await expect('Tab reaches Copy', 's-solucion > copy');
  await key('Tab'); await key('Enter'); await expect('screen 5 opens on its heading', 's-resumen > ins');
  await key('Tab'); await key('Enter'); await expect('start again returns to screen 1', 's-predice > ins');
  const clean = await page.evaluate(() => { const s = document.getElementById('s-predice'); return !s.querySelector('.opt[disabled], .opt.is-ok, .opt.is-no, .fb:not([hidden])') && s.querySelector('[data-next]').disabled && document.querySelector('#s-compara input').value === ''; });
  if (!clean) fail('keyboard: start again did not clear the answers'); else console.log('  keyboard  start again cleared the answers');
  await page.close();
}

await browser.close();
server.close();
console.log(`\n${failed} failed checks`);
process.exit(failed ? 1 : 0);
