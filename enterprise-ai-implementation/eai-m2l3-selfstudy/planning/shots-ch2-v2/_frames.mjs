// One-off: frames from the middle of the chapter 2 motion (B2 chain, B3 list to cards), with a real pain typed on O3.
// Run from the lesson folder: node planning/shots-ch2-v2/_frames.mjs
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const out = join(ROOT, 'planning/shots-ch2-v2');
const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const close = () => server.close();
const browser = await puppeteer.launch({ executablePath: chromePath(), args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (name) => page.screenshot({ path: join(out, name + '.png') });

await page.goto(url + '?reset=1&live=0&screen=O3'); await sleep(900);
await page.type('.m-prep-thread input', 'Month-end close takes 14 days across three systems');
await page.click('[data-action="save"]'); await sleep(300);

await page.goto(url + '?live=0&screen=B2'); await sleep(900);
await page.click('.w-opt[data-id="b"]'); await page.click('[data-action="check"]');
await sleep(500); await shot('m1-B2-chain-building');
await sleep(1800); await shot('m2-B2-right');

await page.goto(url + '?live=0&screen=B3'); await sleep(900);
await shot('m3-B3-list-real-pain');
await page.click('[data-action="cards"]');
await sleep(700); await shot('m4-B3-turning');
await sleep(1900); await shot('m5-B3-card-real-pain');
await browser.close(); close();
console.log('frames in', out);
