// R5 review screenshots (wide windows) into review/r5/<tag>/: S01, S05, S16, S19 at 1920x950 and
// 1536x730. Usage: node tools/shots-r5.mjs before | after | extra
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const TAG = process.argv[2] || 'after';
const OUT = join(ROOT, 'review', 'r5', TAG);
mkdirSync(OUT, { recursive: true });
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });

// "extra": the other layouts (memo, work, form, video play and stop) at 1920x950 and 2560x1080
const EXTRA = TAG === 'extra';
const SIZES = EXTRA ? [[1920, 950], [2560, 1080]] : [[1920, 950], [1536, 730]];
const toStop = async (p) => {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  await p.waitForSelector('.w-stop-view:not([hidden])', { timeout: 60000 });
  await new Promise((r) => setTimeout(r, 400));
};
const SCREENS = EXTRA ? [
  ['FT1', async () => {}],
  ['S03', async () => {}],
  ['S02', async () => {}],
  ['S21', async () => {}],
  ['V1', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['V1', toStop, '-stop'],
] : [
  ['S01', async () => {}],
  ['S05', async () => {}],
  ['S16', async (p) => { await p.click('.w-tray-card[data-card="1"]'); await p.click('.w-sort-target[data-column="a"]'); }],
  ['S19', async (p) => {
    await p.evaluate(() => document.querySelector('[data-action="open"]').addEventListener('click', (e) => e.preventDefault(), { capture: true }));
    await p.click('[data-action="open"]');
  }],
];
for (const [w, hgt] of SIZES) {
  for (const [id, act, suffix = ''] of SCREENS) {
    const p = await browser.newPage();
    await p.setViewport({ width: w, height: hgt, deviceScaleFactor: 1 });
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.goto(`${BASE}?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
    await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
    await act(p);
    await p.mouse.move(2, hgt - 2);
    await new Promise((r) => setTimeout(r, 150));
    const name = `${id.toLowerCase()}${suffix}-${w}x${hgt}.png`;
    await p.screenshot({ path: join(OUT, name) });
    console.log(`  shot r5/${TAG}/${name}`);
    await p.close();
  }
}
await browser.close();
server.close();
