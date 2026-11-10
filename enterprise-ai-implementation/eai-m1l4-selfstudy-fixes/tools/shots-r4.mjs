// R4 review screenshots (planning review fixes) into review/r4/, at 1280x720 with reduced motion.
// Usage: node tools/shots-r4.mjs
// Each shot opens its screen with the dev jump (?reset=1&screen=..) and sets up the state by clicks;
// the checks themselves live in check.mjs, test-fit.mjs and walk.mjs.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const OUT = join(ROOT, 'review', 'r4');
mkdirSync(OUT, { recursive: true });
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(query) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(BASE + query, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  return p;
}
async function shot(name, query, act = async () => {}, { mouseAway = true } = {}) {
  const p = await open(query);
  await act(p);
  if (mouseAway) await p.mouse.move(5, 700);
  await wait(150);
  await p.screenshot({ path: join(OUT, name) });
  console.log('  shot r4/' + name);
  await p.close();
}
const click = (p, sel) => p.click(sel);
const noNewTab = (p, sel) => p.evaluate((s) => document.querySelector(s).addEventListener('click', (e) => e.preventDefault(), { capture: true }), sel);

await shot('s01b.png', '?reset=1&screen=S01B');
await shot('s01b-picked.png', '?reset=1&screen=S01B', (p) => click(p, '.w-opt[data-id="e"]'));
await shot('s02.png', '?reset=1&screen=S02');
await shot('ft2.png', '?reset=1&screen=FT2');
await shot('s15.png', '?reset=1&screen=S15');
await shot('s16-start.png', '?reset=1&screen=S16');
await shot('s16-card-selected.png', '?reset=1&screen=S16', (p) => click(p, '.w-tray-card[data-card="2"]'));
await shot('s16-placed.png', '?reset=1&screen=S16', async (p) => { await click(p, '.w-tray-card[data-card="1"]'); await click(p, '.w-sort-col[data-bin="a"]'); });
await shot('s18a.png', '?reset=1&screen=S18A', async (p) => { await click(p, '.w-tray-card[data-card="1"]'); await click(p, '.w-sort-col[data-bin="a"]'); });
await shot('s19.png', '?reset=1&screen=S19', async (p) => { await noNewTab(p, '[data-action="open"]'); await click(p, '[data-action="open"]'); });
await shot('s21-item1.png', '?reset=1&screen=S21');
await shot('s21-item5.png', '?reset=1&screen=S21', async (p) => {
  for (const k of ['c', 'b', 'a', 'd']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
});
await shot('s20-reminder.png', '?reset=1&screen=S20', async (p) => {
  await p.evaluate(() => { window.__l4.state.f.L4_GOAL_FOCUS = 'e'; window.__l4.go('S20'); });
  for (const q of ['q1', 'q2', 'q3']) await click(p, `.w-check-row[data-row="${q}"] [data-choice="yes"]`);
  await click(p, '.w-next');
});
await shot('rail-tooltip.png', '?reset=1&screen=S03', async (p) => { await p.focus('.w-dot[data-chapter="2"]'); });
await shot('menu-focus.png', '?reset=1&screen=S01B', async (p) => { await click(p, '.w-opt[data-id="e"]'); await click(p, '.w-rail-menu'); });
await shot('menu-goals.png', '?reset=1&screen=S01B', async (p) => { await click(p, '.w-opt[data-id="e"]'); await click(p, '.w-rail-menu'); await click(p, '[data-action="goals"]'); });
await shot('v1-stop.png', '?reset=1&screen=V1', async (p) => {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  await p.waitForSelector('.w-stop-view:not([hidden])', { timeout: 60000 });
  await wait(500);
});

await browser.close();
server.close();
