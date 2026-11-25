// One-off: two frames of G1 option B (Henrik speaking, then Sarah). Run from the lesson folder.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath() });
const page = await browser.newPage();
await page.setViewport({ width: 1340, height: 2400 });
await page.goto(`http://127.0.0.1:${server.address().port}/planning/prototypes/round3.html`, { waitUntil: 'networkidle0' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const el = await page.$('#meet');
await sleep(600); await el.screenshot({ path: join(ROOT, 'planning/prototypes/g1b-1-henrik.png') });
await page.click('#nextv'); await sleep(700); await el.screenshot({ path: join(ROOT, 'planning/prototypes/g1b-2-sarah.png') });
await browser.close(); server.close();
console.log('ok');
