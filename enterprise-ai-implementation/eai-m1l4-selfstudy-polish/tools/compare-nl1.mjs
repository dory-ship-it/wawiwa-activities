// NL1 side by side: each of the 23 approved Intro and Chapter 1 frames (planning/design-reference/
// hybrid-cinematic/screens-intro-ch2.html, rendered with the module's own self-hosted fonts, Google
// Fonts blocked) next to the built screen in the same state, both at 1280x720.
// Output: review/nl1/compare/NN-<frame>-pair.png (reference left, build right); with --parts also
// -ref.png and -built.png (each 1280x720, for a pixel diff).
// Usage: node tools/compare-nl1.mjs [--parts] [frame numbers, e.g. 6 7 8]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const OUT = join(ROOT, 'review', 'nl1', 'compare');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).map(Number).filter(Boolean);
const parts = process.argv.includes('--parts');

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- the build: one recipe per frame ---- */
const click = (p, sel) => p.click(sel);
// a first-use ghost hand starts ~600 ms after the screen settles: let it start, then stop it with a key
const stopGhost = async (p) => { await p.waitForSelector('.w-ghost', { timeout: 2500 }).catch(() => {}); await p.keyboard.press('Shift'); await wait(50); };
// the ghost hand: wait until it shows, let it travel to its target (in 150 ms, move 450 ms), then
// freeze every animation where it is (the push-in is finished first, as in the frames)
async function atGhost(p, ms = 640) {
  await p.waitForSelector('.w-ghost', { timeout: 12000 });
  await wait(ms);
  await p.evaluate(() => document.getAnimations().forEach((a) => (a.animationName === 'w-push' ? a.finish() : a.pause())));
}
// every other frame: the screen as it rests (push-in, draw-on and the strip's slide finished)
const settle = (p) => p.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch { /* infinite: none here */ } }));
async function fastTo(p, cond) {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  await p.waitForFunction(cond, { timeout: 60000, polling: 50 });
}
const FRAMES = [
  ['O1', 'title', async () => {}],
  ['O2', 'ghost', async (p) => atGhost(p)],
  ['O2', 'lesson1-open', async (p) => { await stopGhost(p); await click(p, '.w-map-tab[data-station="l1"]'); await p.mouse.move(5, 300); }],
  ['O2', 'side-menu', async (p) => { await stopGhost(p); await click(p, '.w-bar-menu'); await p.mouse.move(700, 600); }],
  ['O3', 'tile3-hover', async (p) => { const b = await (await p.$('.w-goal[data-goal="g3"]')).boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); }],
  ['S01', 'ghost', async (p) => atGhost(p)],
  ['S01', 'correct', async (p) => { await stopGhost(p); await click(p, '.w-opt[data-id="b"]'); await p.mouse.move(5, 300); }],
  ['S01', 'wrong', async (p) => { await stopGhost(p); await click(p, '.w-opt[data-id="a"]'); await p.mouse.move(5, 300); }],
  ['S02', 'ghost', async (p) => atGhost(p, 1000)], // after the tap: the field shows the focus border, as in the frame
  ['S02', 'help-open', async (p) => { await stopGhost(p); const b = await (await p.$('[data-action="homeworkHelp"]')).boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); }],
  ['S02', 'save-empty', async (p) => { await stopGhost(p); await click(p, '[data-action="save"]'); await p.mouse.move(5, 300); }],
  ['S02', 'saved', async (p) => {
    await stopGhost(p);
    await p.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries');
    await p.type('.w-input[data-store="L4_CASE_PROBLEM"]', 'Today reps write call notes by hand, and it hurts because managers wait two days for a summary.');
    await click(p, '[data-action="save"]'); await p.mouse.move(5, 300);
  }],
  ['W1', 'idle', async () => {}],
  ['W1', 'guess', async (p) => { await click(p, '.w-guess[data-id="b"]'); await p.mouse.move(5, 300); }],
  ['V1', 'ready', async () => {}],
  ['V1', 'playing', async (p) => { await fastTo(p, () => document.querySelector('.w-video').currentTime >= 47); await p.evaluate(() => document.querySelector('.w-video').pause()); await p.mouse.move(5, 300); }],
  ['V1', 'stop1-ghost', async (p) => { await fastTo(p, () => !document.querySelector('.w-stop-view').hidden); await atGhost(p); }],
  ['V1', 'stop1-wrong', async (p) => { await fastTo(p, () => !document.querySelector('.w-stop-view').hidden); await stopGhost(p); await click(p, '.w-opt[data-id="a"]'); await p.mouse.move(5, 300); }],
  ['V1', 'stop1-correct', async (p) => { await fastTo(p, () => !document.querySelector('.w-stop-view').hidden); await stopGhost(p); await click(p, '.w-opt[data-id="b"]'); await p.mouse.move(5, 300); }],
  ['K1', 'key-idea', async () => {}],
  ['S03', 'ghost', async (p) => atGhost(p)],
  ['S03', 'one-of-two', async (p) => { await stopGhost(p); await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="b"]'); await click(p, '[data-action="check"]'); await p.mouse.move(5, 300); }],
  ['S03', 'correct', async (p) => { await stopGhost(p); await click(p, '.w-opt[data-id="b"]'); await click(p, '.w-opt[data-id="d"]'); await click(p, '[data-action="check"]'); await p.mouse.move(5, 300); }],
];

async function built(i) {
  const [id, , act] = FRAMES[i];
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: id.startsWith('V') ? 'load' : 'networkidle0' }); // a film keeps the network busy
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await act(page);
  if (!/ghost/.test(FRAMES[i][1])) { await wait(1500); await settle(page); }
  const png = await page.screenshot({ type: 'png' });
  await context.close();
  return png;
}

/* ---- the reference: the canvas with the module's fonts ---- */
const fontsCss = (await import('node:fs')).readFileSync(join(ROOT, 'src', 'fonts.css'), 'utf8').replace(/url\(\.\.\//g, `url(${BASE}`);
const ref = await (await browser.createBrowserContext()).newPage();
await ref.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });
await ref.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); // the canvas animates only without it: static frames
await ref.setRequestInterception(true);
ref.on('request', (r) => (/fonts\.(googleapis|gstatic)/.test(r.url()) ? r.abort() : r.continue()));
await ref.goto(`${BASE}planning/design-reference/hybrid-cinematic/screens-intro-ch2.html`, { waitUntil: 'networkidle0' });
await ref.addStyleTag({ content: fontsCss + '\n.wrap{max-width:none!important}.frame{width:1280px!important}.scr{border:0!important;border-radius:0!important}header.top{position:static!important}' });
await ref.evaluate(() => document.fonts.ready);

const pairPage = await (await browser.createBrowserContext()).newPage();
await pairPage.setViewport({ width: 2580, height: 760, deviceScaleFactor: 1 });

for (let i = 0; i < FRAMES.length; i++) {
  if (only.length && !only.includes(i + 1)) continue;
  const [id, state] = FRAMES[i];
  const name = `${String(i + 1).padStart(2, '0')}-${id}-${state}`;
  const scr = (await ref.$$('figure.it .scr'))[i];
  await scr.scrollIntoView();
  const refPng = await scr.screenshot({ type: 'png' });
  const buildPng = await built(i);
  if (parts) { writeFileSync(join(OUT, name + '-ref.png'), refPng); writeFileSync(join(OUT, name + '-built.png'), buildPng); }
  const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
  await pairPage.setContent(`<body style="margin:0;background:#333;font:14px Arial;color:#fff"><div style="display:flex;gap:20px;padding:0 0 4px"><span style="width:1280px">${name} · reference (frame)</span><span>build</span></div>`
    + `<div style="display:flex;gap:20px"><img src="${b64(refPng)}" width="1280" height="720"><img src="${b64(buildPng)}" width="1280" height="720"></div></body>`);
  await pairPage.screenshot({ path: join(OUT, name + '-pair.png'), clip: { x: 0, y: 0, width: 2580, height: 744 } });
  console.log('  ' + name);
}
await browser.close();
server.close();
