// One-off: frames of planning/prototypes/round3.html (the card's motion, then G1). Run from the lesson folder.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/planning/prototypes/round3.html`;
const browser = await puppeteer.launch({ executablePath: chromePath() });
const page = await browser.newPage();
await page.setViewport({ width: 1340, height: 1600 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = join(ROOT, 'planning/prototypes');
await page.goto(url, { waitUntil: 'networkidle0' });
const card = await page.$('#card-stage');
await page.evaluate(() => { const s = document.getElementById('card-stage'); s.classList.remove('play', 'rest'); void s.offsetWidth; s.classList.add('play'); });
await sleep(250); await card.screenshot({ path: join(out, 'card-1-start.png') });
await sleep(400); await card.screenshot({ path: join(out, 'card-2-mid.png') });
await sleep(1400); await card.screenshot({ path: join(out, 'card-3-end.png') });
await (await page.$('#g1-stage')).screenshot({ path: join(out, 'g1.png') });
await browser.close(); server.close();
console.log('ok');
