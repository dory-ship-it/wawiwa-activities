// One-off: frames of planning/prototypes/round4.html, each stage replayed and shot at a chosen moment. Run from the lesson folder.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/planning/prototypes/round4.html`;
const browser = await puppeteer.launch({ executablePath: chromePath() });
const page = await browser.newPage();
await page.setViewport({ width: 1340, height: 900 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = join(ROOT, 'planning/prototypes/r4');
mkdirSync(out, { recursive: true });
await page.goto(url, { waitUntil: 'networkidle0' });
const SHOTS = [['h0', 3000], ['h1', 1900], ['h2', 2600], ['h3', 0], ['h4', 3500], ['i1', 0], ['i2', 1900], ['i2', 4600], ['j1', 6500], ['j2', 0], ['k1', 0], ['k2', 0], ['k3', 2900]];
for (const [id, ms] of SHOTS) {
  await page.evaluate((i) => { const s = document.getElementById(i); s.scrollIntoView(); s.classList.remove('play'); void s.offsetWidth; s.classList.add('play'); }, id);
  await sleep(ms + 100);
  await (await page.$('#' + id)).screenshot({ path: join(out, `${id}-${ms}.png`) });
}
await browser.close(); server.close();
console.log('ok');
