// One-off: E4's opening motion with motion on (the shots tool runs with reduced motion): four frames, then G1's ring.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath() });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = join(ROOT, 'planning/shots-r3b');
await page.goto(url + '?reset=1&live=0&screen=O3'); await sleep(900);
await page.type('.m-prep-thread input', 'Month-end close takes 14 days');
await page.click('[data-action="save"]'); await sleep(300);
await page.goto(url + '?live=0&screen=E4');
for (const [ms, name] of [[500, 'm1'], [1300, 'm2'], [2100, 'm3'], [3300, 'm4']]) { await sleep(ms - (name === 'm1' ? 0 : [0, 500, 1300, 2100][['m1', 'm2', 'm3', 'm4'].indexOf(name)])); await page.screenshot({ path: join(out, `e4-${name}.png`) }); }
await page.goto(url + '?live=0&screen=G1'); await sleep(1500);
await page.keyboard.press('Shift'); await sleep(600);
await page.screenshot({ path: join(out, 'g1-ring.png') });
await browser.close(); server.close();
console.log('ok');
