// NL3 screenshots: every Chapter 3 and 4 screen in each of its states at 1280x720 (and S04, S05b,
// S19 for the NL2 follow-ups), plus the four-row layout numbers of the deck screens.
// Output: review/nl3/screens/<NN>-<ID>-<state>.png (NN = the order below)
// Usage: node tools/shots-nl3.mjs [IDs]    (--size=1600x900 for another window)
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith('--'));
const size = (argv.find((a) => a.startsWith('--size=')) || '--size=1280x720').slice(7).split('x').map(Number);
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const click = (p, sel) => p.click(sel);
const deck = async (p, cols) => { for (const c of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${c}"]`); } };
const flag = async (p, f, t) => { await click(p, `.w-flag-card[data-flag="${f}"]`); await click(p, `.w-target[data-target="${t}"]`); };
const type = async (p, values) => { for (const [store, v] of values) await p.type(`.w-input[data-store="${store}"]`, v); };
const SKETCH = (p) => p.evaluate(() => { Object.assign(window.__l4.state.f, { L4_CASE_TRIGGER: 'A rep finishes a sales call', L4_CASE_STEPS: 'Rep types notes by hand; the manager reads them two days later and asks follow-up questions by phone', L4_CASE_OUTPUT: 'A call summary, to the sales manager' }); });

const SHOTS = [
  // NL2 follow-ups
  ['S04', 'wrong-two-line-card', async (p) => { await deck(p, ['c']); }],
  ['S04', 'right-card-2', async (p) => { await deck(p, ['a']); }],
  ['S04', 'done', async (p) => { await deck(p, ['a', 'b', 'a', 'b', 'c']); }],
  ['S05b', 'start', async () => {}],
  // Chapter 3
  ['W3', 'start', async () => {}],
  ['W3', 'guess', async (p) => click(p, '.w-guess[data-id="c"]')],
  ['S09', 'start', async () => {}],
  ['S09', 'wrong', async (p) => { await deck(p, ['b']); }],
  ['S09', 'right', async (p) => { await deck(p, ['a']); }],
  ['S09', 'done', async (p) => { await deck(p, ['a', 'a', 'b', 'c', 'd', 'd']); }],
  ['S10', 'start', async () => {}],
  ['S10', 'wrong', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S10', 'right', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S11', 'start', async () => {}],
  ['S11', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S11', 'right', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S12', 'start', async () => {}],
  ['S12', 'picked', async (p) => click(p, '.w-flag-card[data-flag="r1"]')],
  ['S12', 'wrong', async (p) => flag(p, 'r1', '3')],
  ['S12', 'one-placed', async (p) => flag(p, 'r1', '4')],
  ['S12', 'done', async (p) => { await flag(p, 'r1', '4'); await flag(p, 'r2', '7'); }],
  ['S12B', 'start', async () => {}],
  ['S12B', 'empty', async (p) => click(p, '[data-action="save"]')],
  ['S12B', 'saved', async (p) => { await type(p, [['L4_CASE_BASELINE', 'About 2 days from call to summary'], ['L4_CASE_TARGET', 'Same day'], ['L4_CASE_DATE', 'Within 3 months']]); await click(p, '[data-action="save"]'); }],
  // Chapter 4
  ['W4', 'start', async () => {}],
  ['W4', 'guess', async (p) => click(p, '.w-guess[data-id="a"]')],
  ['S13', 'start', async () => {}],
  ['S13', 'start-on-2', async (p) => flag(p, 'start', '2')],
  ['S13', 'end-on-4', async (p) => flag(p, 'end', '4')],
  ['S13', 'start-placed', async (p) => flag(p, 'start', '1')],
  ['S13', 'done', async (p) => { await flag(p, 'start', '1'); await flag(p, 'end', '5'); }],
  ['S14', 'start', async () => {}],
  ['S14', 'wrong', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S14', 'right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S15', 'start', async () => {}],
  ['S15', 'wrong', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S15', 'right', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['K4', 'key-idea', async () => {}],
  ['S16', 'start', async () => {}],
  ['S16', 'wrong', async (p) => { await deck(p, ['b']); }],
  ['S16', 'done', async (p) => { await deck(p, ['a', 'd', 'b', 'd', 'd', 'c']); }],
  ['S17', 'start', async () => {}],
  ['S17', 'wrong', async (p) => { await deck(p, ['5']); }],
  ['S17', 'done', async (p) => { await deck(p, ['3', '1', '5', '4', '2']); }],
  ['S17B', 'start', async (p) => { await SKETCH(p); await p.evaluate(() => window.__l4.go('S17B')); }],
  ['S17B', 'empty', async (p) => { await SKETCH(p); await p.evaluate(() => window.__l4.go('S17B')); await click(p, '[data-action="save"]'); }],
  ['S17B', 'saved', async (p) => { await SKETCH(p); await p.evaluate(() => window.__l4.go('S17B')); await type(p, [['L4_CASE_AIFIT', 'Sort call notes by topic'], ['L4_CASE_HUMAN', 'Approve a discount for a key account']]); await click(p, '[data-action="save"]'); }],
  // S19 with the S12B metric and the S17B notes
  ['S19', 'brief-with-notes', async (p) => { await SKETCH(p); await p.evaluate(() => { Object.assign(window.__l4.state.f, { L4_CASE_AIFIT: 'Sort call notes by topic', L4_CASE_HUMAN: 'Approve a discount for a key account' }); window.__l4.go('S19'); }); }],
  ['S19', 'return-prefilled', async (p) => { await p.evaluate(() => { Object.assign(window.__l4.state.f, { L4_CASE_BASELINE: 'About 2 days from call to summary', L4_CASE_TARGET: 'Same day', L4_CASE_DATE: 'within 3 months' }); window.__l4.state.g.S19 = { o: 1, b: 1 }; window.__l4.go('S19'); }); }],
];

const dir = join(ROOT, 'review', 'nl3', 'screens');
mkdirSync(dir, { recursive: true });
const ids = await (async () => { const c = await (await fetch(BASE + 'content/l4-slice.json')).json(); return new Set(c.screens.map((s) => s.id)); })();
let n = 0;
for (const [id, state, act] of SHOTS) {
  n++;
  if ((only.length && !only.includes(id)) || !ids.has(id)) continue;
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
  await new Promise((r) => setTimeout(r, 300));
  const name = `${String(n).padStart(2, '0')}-${id}-${state}${size[0] === 1280 ? '' : '-' + size.join('x')}.png`;
  await page.screenshot({ path: join(dir, name) });
  console.log(`  ${name}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await context.close();
}
await browser.close();
server.close();
