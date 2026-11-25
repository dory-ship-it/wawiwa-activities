// One-off: E1 with motion on: the left side first, the video and its button later.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath(), args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?reset=1&live=0&screen=E1`);
const t0 = Date.now();
for (const at of [600, 1800, 3600]) { await sleep(at - (Date.now() - t0)); await page.screenshot({ path: join(ROOT, `planning/shots-r3b/e1-${at}.png`) }); }
await browser.close(); server.close();
console.log('ok');
