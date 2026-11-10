// v3 content pass: a screenshot of every screen the wording pass changed, in the state that shows the
// changed string, at 1280 x 720, with the layout verdict (lib.mjs) per shot.
// Usage: node tools/shots-v3-content.mjs  -> review/v3-content/<id>-<state>.png
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const out = join(ROOT, 'review', 'v3-content');
mkdirSync(out, { recursive: true });
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = async (p, sel) => { await p.click(sel); await sleep(250); };
const check = async (p) => p.evaluate(() => { const c = document.querySelector('[data-action="check"]:not([disabled])'); if (c && c.offsetParent) c.click(); });
async function toStop(p) {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  await p.waitForFunction(() => !document.querySelector('.w-stop-view').hidden, { timeout: 90000 });
}
async function attempt(p, answers, k) { await p.evaluate((a, kk) => { const s = window.__l4.state; Object.assign(s.a, a); s.k = kk; s.d.push('S21'); window.__l4.go('S21R'); }, answers, k); await sleep(400); }

const SHOTS = [
  ['W3', 'arrival', ''], ['W5', 'arrival', ''], ['W6', 'arrival', ''], ['K3', 'arrival', ''],
  ['S08B', 'arrival', ''], ['S12B', 'arrival', ''], ['S18A', 'arrival', ''], ['S19B', 'arrival', ''], ['S11', 'arrival', ''],
  ['S09', 'arrival', ''], ['S09', 'stretch, card 5 kept out', '&debug=1&level=stretch', async (p) => {
    await p.keyboard.press('Shift');
    for (const col of ['a', 'a', 'b', 'c']) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${col}"]`); }
    await click(p, '[data-action="card"]'); await click(p, '.w-drop[data-column="d"]');
  }],
  ['S10', 'arrival', ''], ['S17', 'case a', ''], ['S17', 'support, case b', '&debug=1&level=support', async (p) => {
    await p.evaluate(() => { const b = [...document.querySelectorAll('.w-main .w-opt')]; b[0]?.click(); }); await check(p); await sleep(300);
    await p.evaluate(() => document.querySelector('[data-action="nextCase"], [data-action="next-case"]')?.click()); await sleep(400);
  }],
  ['S18', 'arrival', ''],
  ['S20', 'row 1 not yet', '', async (p) => click(p, '.w-check-row[data-row="q1"] [data-choice="notYet"]')],
  ['S20B', 'ideal picked', '', async (p) => { await click(p, '.w-opt[data-id="ideal"]'); await check(p); }],
  ['S20B', 'skipped picked', '', async (p) => { await p.evaluate(() => { const o = [...document.querySelectorAll('.w-opt')]; o[2]?.click(); }); await check(p); }],
  ['S21', 'item 1', ''],
  ['S21', 'item 5', '', async (p) => { for (const k of ['c', 'b', 'a', 'd']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); } }],
  ['S21R', 'not passed', '', async (p) => attempt(p, { L4_S21_1: 'a|w', L4_S21_2: 'a|w', L4_S21_3: 'b|w', L4_S21_4: 'a|w', L4_S21_6: 'a|w', L4_S21_5: '5,7|w' }, { n: 1, s: 0, p: 0 })],
  ['S22', 'unclear picked', '', async (p) => click(p, '.w-takeaway[data-id="b"]')],
  ['V2', 'stop 1', '', async (p) => toStop(p)],
  ['V2', 'stop 2, source owner picked', '', async (p) => {
    await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="b"]'); await check(p); await sleep(300);
    await click(p, '[data-action="resume"]'); await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="c"]'); await check(p);
  }],
];

const rows = [];
for (const [id, state, q, act] of SHOTS) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 1280, height: 720 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  try {
    await p.goto(`${BASE}?${act ? 'reset' : 'review'}=1&screen=${id}${q}`, { waitUntil: id.startsWith('V') ? 'load' : 'networkidle0' });
    await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
    await sleep(500);
    if (act) await act(p);
    await sleep(500);
    await p.mouse.move(0, 0);
    const [good, detail] = layoutVerdict(await p.evaluate(measureLayout));
    const file = `${id}-${state.replace(/[^a-z0-9]+/gi, '-')}.png`;
    await p.screenshot({ path: join(out, file) });
    rows.push(`${good ? 'ok  ' : 'FAIL'} ${id} ${state}${good ? '' : ': ' + detail}  -> ${file}`);
  } catch (e) { rows.push(`ERR  ${id} ${state}: ${e.message.split('\n')[0]}`); }
  await ctx.close();
}
await browser.close();
server.close();
console.log(rows.join('\n'));
