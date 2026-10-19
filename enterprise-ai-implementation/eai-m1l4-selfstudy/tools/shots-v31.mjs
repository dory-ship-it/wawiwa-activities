// V3-1 review screenshots (Intro and Chapter 1, Round 4) into review/v3-1/: the screens at 1280x720,
// the Round 4 templates again at 1920x950. Usage: node tools/shots-v31.mjs
// Static shots use reduced motion and stop the ghost hand with a key; the "-hand" shots run with
// motion and are taken mid-demo.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const OUT = join(ROOT, 'review', 'v3-1');
mkdirSync(OUT, { recursive: true });
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(name, query, act = async () => {}, { size = [1280, 720], motion = false } = {}) {
  const p = await browser.newPage();
  await p.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: motion ? 'no-preference' : 'reduce' }]);
  await p.goto(BASE + query, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await act(p);
  await p.screenshot({ path: join(OUT, name) });
  console.log('  shot v3-1/' + name);
  await p.close();
}
const noHand = async (p) => { await wait(900); await p.keyboard.press('Shift'); await p.mouse.move(5, 715); await wait(100); };
const toStop = async (p) => {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  await p.waitForSelector('.w-stop-view:not([hidden])', { timeout: 60000 });
};

await shot('o1.png', '?reset=1&screen=O1');
await shot('o2.png', '?reset=1&screen=O2', noHand);
await shot('o2-hand.png', '?reset=1&screen=O2', async (p) => { await p.waitForFunction(() => document.querySelector('.w-map-panel').dataset.station === 'l5', { timeout: 4000 }); await wait(120); }, { motion: true });
await shot('o3.png', '?reset=1&screen=O3', async (p) => { await p.focus('.w-goal[data-goal="g5"]'); });
await shot('w1-before.png', '?reset=1&screen=W1');
await shot('w1-after.png', '?reset=1&screen=W1', async (p) => { await p.click('.w-guess[data-id="b"]'); await p.mouse.move(5, 715); });
await shot('v1.png', '?reset=1&screen=V1', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); });
await shot('k1.png', '?reset=1&screen=K1');
await shot('s03-hand.png', '?reset=1&screen=S03', async (p) => {
  await p.waitForSelector('.w-ghost', { timeout: 4000 });
  await wait(1250); // between the second card and Check
}, { motion: true });
await shot('v2-stop1.png', '?reset=1&screen=V2', async (p) => { await toStop(p); await noHand(p); });
for (const id of ['O1', 'O2', 'O3', 'W1', 'K1']) {
  await shot(`${id.toLowerCase()}-1920x950.png`, `?reset=1&screen=${id}`, id === 'O2' ? noHand : async () => {}, { size: [1920, 950] });
}
await browser.close();
server.close();
