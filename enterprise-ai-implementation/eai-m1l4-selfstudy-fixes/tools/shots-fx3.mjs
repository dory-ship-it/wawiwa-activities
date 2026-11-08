// FX3 screenshots: the screens FX3 changed, main state only, at 1280x720 (--size=1600x900 for another
// window). Output: review/fx3/screens/<NN>-<ID>-<state>.png, or --out=DIR (review/fx3/before for the
// Focus before/after pairs).
// Usage: node tools/shots-fx3.mjs [IDs] [--size=WxH] [--out=DIR] [--state=a,b]
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

// the learner's notes, as long as a real learner might write them (shots-nl4.mjs's)
const NOTES = {
  L4_CASE_TITLE: 'Sales call summaries',
  L4_CASE_PROBLEM: 'Today reps write call notes by hand after every call, and the manager gets them two days late.',
  L4_CASE_TRIGGER: 'A rep finishes a sales call',
  L4_CASE_STEPS: 'Rep types notes by hand; the manager reads them two days later and asks follow-up questions by phone',
  L4_CASE_OUTPUT: 'A call summary, to the sales manager',
  L4_CASE_BASELINE: 'About 2 days to a summary',
  L4_CASE_TARGET: 'Same day',
  L4_CASE_DATE: 'Within 3 months',
  L4_CASE_AIFIT: 'Draft the call summary from the rep notes',
  L4_CASE_HUMAN: 'Approve a discount for a key client',
};

const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith('--'));
const opt = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3);
const size = opt('size', '1280x720').split('x').map(Number);
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const click = (p, sel) => p.click(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fill = (p, keys = Object.keys(NOTES)) => p.evaluate((n, k) => { k.forEach((x) => { window.__l4.state.f[x] = n[x]; }); }, NOTES, keys);
const regoTo = (p, id) => p.evaluate((x) => window.__l4.go(x), id);
const deck = async (p, cols) => { for (const c of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${c}"]`); } };
const MISSED = { L4_S21_1: 'a|w', L4_S21_2: 'b|c', L4_S21_3: 'b|w', L4_S21_4: 'd|c', L4_S21_5: '5,7|w' };
const ALL = { L4_S21_1: 'c|c', L4_S21_2: 'b|c', L4_S21_3: 'a|c', L4_S21_4: 'd|c', L4_S21_5: '5,6|c' };
const attempt = (p, answers, k) => p.evaluate((a, kk) => { const s = window.__l4.state; Object.assign(s.a, a); s.k = kk; s.d.push('S21'); }, answers, k);
// a retake (attempt 2 = version b) at item i (0-based): the earlier items answered right
const retakeAt = async (p, i) => {
  await p.evaluate(() => { window.__l4.state.k = { n: 2, s: 40, p: 0 }; window.__l4.go('S21'); });
  for (let k = 0; k < i; k++) {
    // the right option of item k, version b (the content's own key)
    const id = await p.evaluate((kk) => window.__l4.screens.S21.items[kk].b.options.find((o) => o.correct).id, k);
    await click(p, `.w-kc-opt[data-id="${id}"]`);
    await click(p, '[data-action="nextQuestion"]');
  }
};

export const SHOTS = [
  ['S04', 'placed', async (p) => { await deck(p, ['a', 'b', 'a', 'b']); }],
  ['S16', 'placed', async (p) => { await deck(p, ['a', 'd', 'b', 'd', 'd']); }],
  ['S17', 'case-1', async () => {}],
  ['S20', 'start', async () => {}],
  ['S18A', 'rows', async () => {}],
  ['S18', 'wrong', async (p) => { await click(p, '.w-opt[data-id="a"]'); }],
  ['S19', 'full', async (p) => { await fill(p); await regoTo(p, 'S19'); }],
  ['V1', 'ready', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['V2', 'ready', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['W2', 'start', async () => {}],
  ['S21', 'item1b', async (p) => { await retakeAt(p, 0); }],
  ['S21', 'item5b', async (p) => { await retakeAt(p, 4); }],
  ['S21R', 'not-passed', async (p) => { await attempt(p, MISSED, { n: 1, s: 40, p: 0 }); await regoTo(p, 'S21R'); }],
  ['S22', 'downloaded', async (p) => { await click(p, '.w-takeaway[data-id="a"]'); await click(p, '.w-next'); await click(p, '[data-action="download"]'); }],
  ['END', 'passed', async (p) => { await attempt(p, ALL, { n: 1, s: 100, p: 1 }); await regoTo(p, 'END'); }],
  ['S02', 'saved', async (p) => { await fill(p, ['L4_CASE_TITLE', 'L4_CASE_PROBLEM']); await regoTo(p, 'S02'); await click(p, '[data-action="save"]'); }],
  ['S13', 'menu', async (p) => { await click(p, '.w-bar-menu'); }],
  ['K1', 'wash', async () => {}],
  ['review', 'header', async () => {}],
];

only.filter((id) => !SHOTS.some((s) => s[0] === id)).forEach((id) => SHOTS.push([id, 'start', async () => {}]));
const dir = resolve(ROOT, opt('out', join('review', 'fx3', 'screens')));
mkdirSync(dir, { recursive: true });
const states = argv.find((a) => a.startsWith('--state=')) ? opt('state', '').split(',') : null;
let n = 0;
for (const [id, state, act] of SHOTS) {
  n++;
  if (only.length && !only.includes(id)) continue;
  if (states && !states.includes(state)) continue;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  if (id === 'review') { // review.html: the header and the first chapter rows
    await page.goto(`${BASE}review.html`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.rv-card');
  } else {
    await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: /^V\d/.test(id) ? 'load' : 'networkidle0' });
    await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  }
  await page.keyboard.press('Shift'); // any key stops a ghost hand
  try { await act(page); } catch (e) { errors.push('act: ' + e.message); }
  await page.mouse.move(2, 300);
  await page.keyboard.press('Shift'); // a ghost hand that started late goes too
  await wait(300);
  const name = `${String(n).padStart(2, '0')}-${id}-${state}${size[0] === 1280 ? '' : '-' + size.join('x')}.png`;
  await page.screenshot({ path: join(dir, name) });
  console.log(`  ${name}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await context.close();
}
await browser.close();
server.close();
