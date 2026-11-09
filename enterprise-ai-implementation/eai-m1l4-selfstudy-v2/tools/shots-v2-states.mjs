// v2 self-check: screenshots of screens after the learner acts (learner mode, reduced motion), for the
// states the arrival shots (shots-fx7-screens.mjs) do not show.
// Usage: node tools/shots-v2-states.mjs  -> review/v2-states/<id>-<state>.png
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const out = join(ROOT, 'review', 'v2-states');
mkdirSync(out, { recursive: true });
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars', '--mute-audio'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = async (p, sel) => { await p.waitForSelector(sel, { visible: true }); await p.click(sel); await sleep(250); };
const deck = async (p, cols) => { for (const c of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${c}"]`); } };

const STATES = [
  ['S01', 'picked', (p) => click(p, '.w-opt[data-id="a"]')],
  ['O2', 'l1-open', async (p) => { await p.keyboard.press('Shift'); await click(p, '.w-map-tab[data-station="l1"]'); }],
  ['S03', 'wrong-drop', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['metric']); }],
  ['S03', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['map', 'metric', 'map', 'metric', 'map', 'metric']); }],
  ['S02', 'saved', async (p) => { await p.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries'); await p.type('textarea', 'Today reps write call notes by hand.'); await click(p, '[data-action="save"]'); }],
];
for (const [id, name, act] of STATES) {
  const context = await browser.createBrowserContext();
  const p = await context.newPage();
  await p.setViewport({ width: 1280, height: 720 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(`${base}?screen=${id}`, { waitUntil: 'networkidle0' });
  await sleep(600);
  try { await act(p); } catch (e) { console.log(id, name, 'FAILED', e.message); }
  await sleep(500);
  await p.screenshot({ path: join(out, `${id}-${name}.png`) });
  console.log(id, name, 'ok');
  await context.close();
}
await browser.close();
server.close();
