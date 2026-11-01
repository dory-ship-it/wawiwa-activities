// FX1 screenshots: the changed screens, main state only, at 1280x720 (--size=1600x900 for another
// window). Output: review/fx1/screens/<NN>-<ID>-<state>.png (NN = the order below), or --out=DIR.
// --motion keeps motion on (the build-ups and the ghost hand); the default is reduced motion.
// Usage: node tools/shots-fx1.mjs [IDs] [--size=WxH] [--out=DIR] [--motion]
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith('--'));
const opt = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3);
const size = opt('size', '1280x720').split('x').map(Number);
const motion = argv.includes('--motion');
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const click = (p, sel) => p.click(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const SKETCH = (p) => p.evaluate(() => { Object.assign(window.__l4.state.f, { L4_CASE_TRIGGER: 'A rep finishes a sales call', L4_CASE_STEPS: 'Rep types notes by hand; the manager reads them two days later and asks follow-up questions by phone', L4_CASE_OUTPUT: 'A call summary, to the sales manager' }); });
const deck = async (p, cols) => { for (const c of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${c}"]`); } };
const flag = async (p, f, t) => { await click(p, `.w-flag-card[data-flag="${f}"]`); await click(p, `.w-target[data-target="${t}"]`); };
const toStop = async (p) => {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  await p.waitForSelector('.w-stop-view:not([hidden])', { timeout: 60000 });
};
const ghost = async (p, ms = 1400) => { if (await p.$('[data-action="showMe"]')) { await click(p, '[data-action="showMe"]'); await wait(ms); } };

export const SHOTS = [
  ['O1', 'title', async () => {}],
  ['O2', 'start', async () => {}],
  ['O3', 'goal-1-open', async () => {}],
  ['S01', 'show-me-how', async (p) => ghost(p, 1900)],
  ['S02', 'start', async () => {}],
  ['V1', 'ready', async (p) => { await p.waitForFunction(() => document.querySelector('.w-video')?.readyState >= 1); }],
  ['V2', 'stop-1', async (p) => { await toStop(p); }],
  ['V2', 'transcript-open', async (p) => {
    await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 2 && document.querySelectorAll('.w-tline').length > 0);
    await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 8; return v.play().then(() => new Promise((r) => setTimeout(r, 2200))).then(() => v.pause()); });
    await click(p, '.w-tr');
  }],
  ['K2', 'start', async () => {}],
  ['K2', 'hr-case', async (p) => click(p, '[data-action="caseToggle"]')],
  ['S04', 'checked', async (p) => { await deck(p, ['a', 'c', 'a', 'b', 'a']); await click(p, '[data-action="check"]'); }],
  ['S04', 'revealed', async (p) => { await deck(p, ['a', 'c', 'a', 'b', 'a']); await click(p, '[data-action="check"]'); await deck(p, ['a', 'b']); await click(p, '[data-action="check"]'); }],
  ['S05b', 'show-me-how', async (p) => ghost(p, 1300)],
  ['S06', 'situation-1', async () => {}],
  ['S07', 'tiles', async () => {}],
  ['S07', 'question-wrong', async (p) => { for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); await click(p, '.w-tile[data-n="7"]'); }],
  ['S11', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S01', 'revealed', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="c"]'); }],
  ['S08', 'round-1', async () => {}],
  ['S08', 'round-1-right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S10', 'attempt-2', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S12', 'checked', async (p) => { await flag(p, 'r1', '3'); await flag(p, 'r2', '7'); await click(p, '[data-action="check"]'); }],
  ['S14', 'stage', async () => {}],
  ['S17B', 'start', async (p) => { await SKETCH(p); await p.evaluate(() => window.__l4.go('S17B')); }],
];

// any other screen named on the command line: its start state
only.filter((id) => !SHOTS.some((s) => s[0] === id)).forEach((id) => SHOTS.push([id, 'start', async () => {}]));
const dir = resolve(ROOT, opt('out', join('review', 'fx1', 'screens')));
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
  if (!motion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: /^V\d/.test(id) ? 'load' : 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  if (motion) await wait(1600); else await page.keyboard.press('Shift'); // any key stops a ghost hand
  await act(page);
  if (!/show-me/.test(state)) { await page.mouse.move(2, 300); await wait(300); }
  const name = `${String(n).padStart(2, '0')}-${id}-${state}${size[0] === 1280 ? '' : '-' + size.join('x')}.png`;
  await page.screenshot({ path: join(dir, name) });
  console.log(`  ${name}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await context.close();
}
await browser.close();
server.close();
