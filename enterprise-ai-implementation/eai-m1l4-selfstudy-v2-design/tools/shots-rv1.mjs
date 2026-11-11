// RV1 review screenshots into review/rv1/: the review page at 1600x900 (top, scrolled, the "Over word
// limit" filter), S04 in ?review=1 with the toolbar (and its word panel), O2 / O3 / K1 after the cuts,
// the S03 ghost hand on its neutral target, V1 with its poster. Usage: node tools/shots-rv1.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const OUT = join(ROOT, 'review', 'rv1');
mkdirSync(OUT, { recursive: true });
const server = await startServer(0);
const ORIGIN = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(name, path, act = async () => {}, { size = [1280, 720], motion = false } = {}) {
  const p = await browser.newPage();
  await p.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: motion ? 'no-preference' : 'reduce' }]);
  await p.goto(ORIGIN + path, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => document.fonts.status === 'loaded');
  await act(p);
  await p.screenshot({ path: join(OUT, name) });
  console.log('  shot rv1/' + name);
  await p.close();
}
const lesson = (p) => p.waitForFunction(() => window.__l4);
const noHand = async (p) => { await lesson(p); await wait(900); await p.keyboard.press('Shift'); await p.mouse.move(5, 715); await wait(100); };
// every thumbnail in view rendered
const thumbs = async (p) => {
  await p.waitForSelector('.rv-card');
  await p.waitForFunction(() => [...document.querySelectorAll('.rv-frame')].filter((f) => { const r = f.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && f.closest('.rv-card:not([hidden])'); })
    .every((f) => f.dataset.state === 'loaded'), { timeout: 60000 });
  await wait(1500); // the screens inside settle (fonts, images, entry motion)
};

await shot('review-top.png', 'review.html', thumbs, { size: [1600, 900] });
await shot('review-scrolled.png', 'review.html', async (p) => { await p.waitForSelector('.rv-card'); await p.evaluate(() => document.getElementById('rv-g-ch3').scrollIntoView()); await p.evaluate(() => window.scrollBy(0, -70)); await thumbs(p); }, { size: [1600, 900] });
await shot('review-over.png', 'review.html', async (p) => { await p.waitForSelector('.rv-card'); await p.click('.rv-filter[data-kind="over"]'); await thumbs(p); }, { size: [1600, 900] });
await shot('s04-review.png', 'index.html?screen=S04&review=1', async (p) => { await p.waitForSelector('.rv-bar'); await p.mouse.move(5, 715); });
await shot('s04-review-words.png', 'index.html?screen=S04&review=1', async (p) => { await p.waitForSelector('.rv-bar'); await p.click('.rv-words'); });
await shot('o2.png', 'index.html?reset=1&screen=O2', noHand);
await shot('o3.png', 'index.html?reset=1&screen=O3', lesson);
await shot('k1.png', 'index.html?reset=1&screen=K1', lesson);
await shot('s03-hand.png', 'index.html?reset=1&screen=S03', async (p) => {
  await p.waitForSelector('.w-ghost', { timeout: 4000 });
  await wait(850); // on the first target: the centre of the four cards, on none of them
}, { motion: true });
await shot('s03-hand-check.png', 'index.html?reset=1&screen=S03', async (p) => {
  await p.waitForSelector('.w-ghost', { timeout: 4000 });
  await wait(1700); // on the second target: Check
}, { motion: true });
await shot('v1-poster.png', 'index.html?reset=1&screen=V1', async (p) => { await lesson(p); await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); });
await shot('v1-stop1-hand.png', 'index.html?reset=1&screen=V1', async (p) => {
  await lesson(p);
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  await p.waitForSelector('.w-stop-view:not([hidden])', { timeout: 60000 });
  await p.waitForSelector('.w-ghost', { timeout: 4000 });
}); // reduced motion: the static hand and arrow sit on the target for 3 s
await browser.close();
server.close();
