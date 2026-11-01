// NL4 screenshots: the Chapter 5-6 screens and the FX1 follow-ups, main state only, at 1280x720
// (--size=1600x900 for another window). Output: review/nl4/screens/<NN>-<ID>-<state>.png, or --out=DIR.
// Usage: node tools/shots-nl4.mjs [IDs] [--size=WxH] [--out=DIR] [--state=a,b]
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith('--'));
const opt = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3);
const size = opt('size', '1280x720').split('x').map(Number);
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const click = (p, sel) => p.click(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// the learner's notes, as long as a real learner might write them
export const NOTES = {
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
const fill = (p, keys = Object.keys(NOTES)) => p.evaluate((n, k) => { k.forEach((x) => { window.__l4.state.f[x] = n[x]; }); }, NOTES, keys);
const regoTo = (p, id) => p.evaluate((x) => window.__l4.go(x), id);
const deck = async (p, cols) => { for (const c of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${c}"]`); } };
// an attempt of the check: first answers by item ("c|c", "a|w") and the attempt state
const attempt = (p, answers, k) => p.evaluate((a, kk) => { const s = window.__l4.state; Object.assign(s.a, a); s.k = kk; s.d.push('S21'); }, answers, k);
const MISSED = { L4_S21_1: 'a|w', L4_S21_2: 'b|c', L4_S21_3: 'b|w', L4_S21_4: 'd|c', L4_S21_5: '5,7|w' };
const ALL = { L4_S21_1: 'c|c', L4_S21_2: 'b|c', L4_S21_3: 'a|c', L4_S21_4: 'd|c', L4_S21_5: '5,6|c' };

export const SHOTS = [
  ['S18A', 'start', async () => {}],
  ['S18A', 'checked', async (p) => { await deck(p, ['a', 'c', 'c', 'd']); await click(p, '[data-action="check"]'); }],
  ['S18', 'stage', async () => {}],
  ['S18B', 'start', async (p) => { await fill(p, ['L4_CASE_TITLE']); await regoTo(p, 'S18B'); }],
  ['S18B', 'unticked', async (p) => { await fill(p, ['L4_CASE_TITLE']); await regoTo(p, 'S18B'); await click(p, '[data-action="save"]'); }],
  ['S19', 'start', async (p) => { await fill(p); await regoTo(p, 'S19'); }],
  ['S19', 'empty', async () => {}],
  ['S19', 'opened', async (p) => { await fill(p); await regoTo(p, 'S19'); await p.evaluate(() => { const a = document.querySelector('[data-action="open"]'); a.removeAttribute('target'); a.href = '#'; a.click(); }); }],
  ['S20', 'answered', async (p) => { await click(p, '[data-row="q1"] [data-choice="yes"]'); await click(p, '[data-row="q2"] [data-choice="notYet"]'); await click(p, '[data-row="q3"] [data-choice="yes"]'); }],
  ['S20B', 'picked', async (p) => click(p, '.w-opt[data-id="rushed"]')],
  ['S21', 'item-1', async () => {}],
  ['S21R', 'not-passed', async (p) => { await attempt(p, MISSED, { n: 1, s: 40, p: 0 }); await regoTo(p, 'S21R'); }],
  ['S21R', 'passed', async (p) => { await attempt(p, ALL, { n: 2, s: 100, p: 1 }); await regoTo(p, 'S21R'); }],
  ['S12', 'back-to-check', async (p) => { await attempt(p, MISSED, { n: 1, s: 40, p: 0 }); await p.evaluate(() => { const s = window.__l4.state; s.d.push('S12'); }); await regoTo(p, 'S21R'); await click(p, '[data-action="review"][data-screen="S12"]'); }],
  ['S21', 'retake-shuffled', async (p) => { await attempt(p, MISSED, { n: 1, s: 40, p: 0 }); await regoTo(p, 'S21R'); await click(p, '[data-action="retake"]'); }],
  ['S22', 'step-1', async () => {}],
  ['S22', 'step-2', async (p) => { await click(p, '.w-takeaway[data-id="a"]'); await click(p, '.w-next'); }],
  ['S02', 'case-card', async () => {}],
  ['S08B', 'case-card', async (p) => { await fill(p, ['L4_CASE_TITLE']); await regoTo(p, 'S08B'); }],
  ['S03', 'thumbs', async () => {}],
];

only.filter((id) => !SHOTS.some((s) => s[0] === id)).forEach((id) => SHOTS.push([id, 'start', async () => {}]));
const dir = resolve(ROOT, opt('out', join('review', 'nl4', 'screens')));
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
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await page.keyboard.press('Shift'); // any key stops a ghost hand
  await act(page);
  await page.mouse.move(2, 300);
  await wait(300);
  const name = `${String(n).padStart(2, '0')}-${id}-${state}${size[0] === 1280 ? '' : '-' + size.join('x')}.png`;
  await page.screenshot({ path: join(dir, name) });
  console.log(`  ${name}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await context.close();
}
await browser.close();
server.close();
