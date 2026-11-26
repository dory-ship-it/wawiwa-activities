// One-off (round 4 fixes): with motion on: E1 frames (slower build-up, the player), F5's hand mid-way, G1 each speaker.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = join(ROOT, 'planning/shots-r4fix/after');
const shot = (n) => page.screenshot({ path: join(out, n + '.png') });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(url + '?reset=1&live=0&screen=E1');
const t0 = Date.now();
for (const at of [900, 2600, 5200]) { await sleep(at - (Date.now() - t0)); await shot('e1-' + at); }
await page.click('.m-lib-player .w-bigplay'); await sleep(1500); await shot('e1-playing');
await page.click('.m-lib-player .w-speed'); await sleep(300); await shot('e1-speed');

await page.goto(url + '?live=0&screen=F5'); await sleep(1400);
await page.click('[data-action="showMe"]').catch(() => {}); await sleep(1500); await shot('f5-hand');

await page.goto(url + '?live=0&screen=G1'); await sleep(1500);
await page.keyboard.press('Escape');
for (let k = 1; k <= 6; k++) {
  await sleep(700); await shot('g1-voice' + k);
  await page.click('.m-mt-role-btn'); await sleep(300);
  await page.click('[data-action="nextVoice"]').catch(() => {});
}
console.log(errors.length ? errors.join('\n') : 'no page errors');
await browser.close(); server.close();
