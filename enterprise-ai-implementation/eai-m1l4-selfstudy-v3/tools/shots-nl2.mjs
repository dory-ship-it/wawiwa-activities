// NL2 screenshots (extends shots-nl1.mjs): the Chapter 2 screens at 1600x900 (the stage scaled 1.25)
// and at 2560x1080 (--ultra: the stage at its widest, 1600), each in a state with its feedback, plus
// S19 with a full Chapter 2 sketch (no frame yet: styled by analogy).
// Output: review/nl2/wide/<ID>-<state>.png, review/nl2/wide-2560/..., review/nl2/analogy/S19-sketch.png
// Usage: node tools/shots-nl2.mjs [--ultra] [IDs]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const argv = process.argv.slice(2);
const ultra = argv.includes('--ultra');
const only = argv.filter((a) => !a.startsWith('--'));
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const click = (p, sel) => p.click(sel);

const SHOTS = [
  ['W2', 'guess', async (p) => click(p, '.w-guess[data-id="a"]')],
  ['K2', 'hr-case', async (p) => click(p, '[data-action="caseToggle"]')],
  ['S04', 'wrong', async (p) => { await click(p, '[data-action="card"]'); await click(p, '.w-drop[data-column="c"]'); }],
  ['S05a', 'key', async () => {}],
  ['S05b', 'one-placed', async (p) => { await click(p, '.w-label-card[data-label="gateway"]'); await click(p, '.w-target[data-target="b"]'); }],
  ['S06', 'situation2', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '[data-action="nextSituation"]'); }],
  ['S07', 'tile-open', async (p) => click(p, '.w-tile[data-n="5"]')],
  ['S08', 'round1-right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S08B', 'empty-save', async (p) => click(p, '[data-action="save"]')],
];

async function shot(id, act, size, path) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await page.keyboard.press('Shift');
  await act(page);
  await page.mouse.move(2, 300);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path });
  await context.close();
}

const dir = join(ROOT, 'review', 'nl2', ultra ? 'wide-2560' : 'wide');
mkdirSync(dir, { recursive: true });
for (const [id, state, act] of SHOTS.filter((x) => !only.length || only.includes(x[0]))) {
  await shot(id, act, ultra ? [2560, 1080] : [1600, 900], join(dir, `${id}-${state}.png`));
  console.log('  ' + id + ' ' + state);
}
if (!ultra && (!only.length || only.includes('S19'))) {
  const a = join(ROOT, 'review', 'nl2', 'analogy');
  mkdirSync(a, { recursive: true });
  await shot('S19', (p) => p.evaluate(() => {
    const f = window.__l4.state.f;
    f.L4_CASE_TRIGGER = 'A rep finishes a sales call';
    f.L4_CASE_STEPS = 'Rep types notes by hand; the manager reads them two days later';
    f.L4_CASE_OUTPUT = 'A call summary, to the sales manager';
    window.__l4.go('S19');
  }), [1280, 720], join(a, 'S19-sketch.png'));
  console.log('  S19 sketch');
}
await browser.close();
server.close();
