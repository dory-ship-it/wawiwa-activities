// NL1 screenshots of the screens styled by analogy (no frame yet), one per template or variant, at
// 1280x720 (and the 1600x900 spot-check of the framed screens with --wide; --ultra: 2560x1080, the
// stage at its widest, 1600).
// Output: review/nl1/analogy/<ID>-<state>.png, review/nl1/wide/<ID>.png
// Usage: node tools/shots-nl1.mjs [--wide] [IDs]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const argv = process.argv.slice(2);
const ultra = argv.includes('--ultra');
const wide = argv.includes('--wide') || ultra;
const only = argv.filter((a) => !a.startsWith('--'));
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const click = (p, sel) => p.click(sel);

const ANALOGY = [
  ['FT2', 'challenge', 'idle', async () => {}],
  ['FT2', 'challenge', 'correct-routes', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S04', 'sort-deck', 'card-selected', async (p) => click(p, '[data-action="card"]')],
  ['S04', 'sort-deck', 'wrong', async (p) => { await click(p, '[data-action="card"]'); await click(p, '.w-sort-target[data-column="c"]'); }],
  ['S05', 'explorer-diagram', 'gateway', async (p) => { await click(p, '.w-node-gateway'); for (const b of await p.$$('.w-legend-btn')) await b.click(); }],
  ['S06', 'decision-pair', 'left-right', async (p) => click(p, '.w-situation .w-opt[data-id="a"]')],
  ['S07', 'explorer-tiles', 'tile-open', async (p) => click(p, '.w-tile[data-n="5"]')],
  ['S08', 'decision-rounds', 'round1-right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S09', 'sort-tray', 'wrong', async (p) => { await click(p, '.w-tray-card[data-card="4"]'); await click(p, '.w-sort-target[data-column="a"]'); }],
  ['S10', 'decision-fill', 'right', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S11', 'decision-metric', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S12', 'explorer-pick', 'one-of-two', async (p) => { await click(p, '.w-pick-tile[data-n="4"]'); await click(p, '.w-pick-tile[data-n="3"]'); await click(p, '[data-action="check"]'); }],
  ['S13', 'decision-bounds', 'right', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S15', 'decision-single-statement', 'wrong', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S17', 'sort-deck-marker', 'idle', async () => {}],
  ['S18', 'decision-safety', 'step2', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S19', 'handoff', 'brief', async () => {}],
  ['S20', 'decision-selfcheck', 'row-answered', async (p) => click(p, '.w-check-row[data-row="q1"] [data-choice="notYet"]')],
  ['S21', 'check', 'item1-wrong', async (p) => click(p, '.w-kc-opt[data-id="b"]')],
  ['S22', 'decision-close', 'takeaway', async (p) => click(p, '.w-takeaway[data-id="b"]')],
];
const WIDE = ['O1', 'O2', 'O3', 'S01', 'S02', 'W1', 'V1', 'K1', 'S03', 'S04', 'S07'];

async function shot(id, act, size, path) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: id.startsWith('V') ? 'load' : 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await page.keyboard.press('Shift');
  await act(page);
  await page.mouse.move(2, 300);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path });
  await context.close();
}

if (wide) {
  const dir = join(ROOT, 'review', 'nl1', ultra ? 'wide-2560' : 'wide');
  mkdirSync(dir, { recursive: true });
  for (const id of WIDE.filter((x) => !only.length || only.includes(x))) { await shot(id, async () => {}, ultra ? [2560, 1080] : [1600, 900], join(dir, id + '.png')); console.log('  wide ' + id); }
} else {
  const dir = join(ROOT, 'review', 'nl1', 'analogy');
  mkdirSync(dir, { recursive: true });
  for (const [id, tpl, state, act] of ANALOGY.filter((x) => !only.length || only.includes(x[0]))) { await shot(id, act, [1280, 720], join(dir, `${id}-${tpl}-${state}.png`)); console.log('  ' + id + ' ' + state); }
}
await browser.close();
server.close();
