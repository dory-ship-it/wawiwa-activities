// NL2 side by side (extends compare-nl1.mjs): each approved Chapter 2 frame of
// planning/design-reference/hybrid-cinematic/screens-intro-ch2.html (frames 24 to 45), plus the
// O2 and S01 frames after the NL1 fixes (frames 2 to 4, 6 to 8), rendered with the module's own
// self-hosted fonts (Google Fonts blocked), next to the built screen in the same state, both at 1280x720.
// Output: review/nl2/compare/NN-<screen>-<state>-pair.png (NN = the frame's number on the canvas,
// reference left, build right); with --parts also -ref.png and -built.png.
// Usage: node tools/compare-nl2.mjs [--parts] [frame numbers, e.g. 27 28 29]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const OUT = join(ROOT, 'review', 'nl2', 'compare');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).map(Number).filter(Boolean);
const parts = process.argv.includes('--parts');

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- the build: one recipe per frame ---- */
const click = (p, sel) => p.click(sel);
const rest = (p) => p.mouse.move(5, 300);
// a first-use ghost hand starts ~600 ms after the screen settles: let it start, then stop it with a key
const stopGhost = async (p) => { await p.waitForSelector('.w-ghost', { timeout: 2500 }).catch(() => {}); await p.keyboard.press('Shift'); await wait(50); };
// the ghost hand: wait until it shows, let it reach its first target (in 150 ms, move 450 ms, tap),
// then freeze every animation where it is
async function atGhost(p, ms = 640) {
  await p.waitForSelector('.w-ghost', { timeout: 12000 });
  await wait(ms);
  await p.evaluate(() => document.getAnimations().forEach((a) => (a.animationName === 'w-push' ? a.finish() : a.pause())));
}
const settle = (p) => p.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch { /* infinite: none here */ } }));
// a mouse drag from the centre of one element to the centre of another (the build's pointer drag)
async function drag(p, from, to) {
  const a = await (await p.$(from)).boundingBox(), b = await (await p.$(to)).boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  for (let i = 1; i <= 8; i++) await p.mouse.move(a.x + a.width / 2 + ((b.x + b.width / 2) - (a.x + a.width / 2)) * i / 8, a.y + a.height / 2 + ((b.y + b.height / 2) - (a.y + a.height / 2)) * i / 8);
  await p.mouse.up();
  await wait(450); // a returned card slides back
}
const S08B = { trigger: 'A rep finishes a sales call', steps: 'Rep types notes by hand; the manager reads them two days later', output: 'A call summary, to the sales manager' };
// [frame number, screen, state, recipe]
const FRAMES = [
  [2, 'O2', 'ghost', async (p) => atGhost(p)],
  [3, 'O2', 'lesson1-open', async (p) => { await stopGhost(p); await click(p, '.w-map-tab[data-station="l1"]'); await rest(p); }],
  [4, 'O2', 'side-menu', async (p) => { await stopGhost(p); await click(p, '.w-bar-menu'); await p.mouse.move(700, 600); }],
  [6, 'S01', 'ghost', async (p) => atGhost(p)],
  [7, 'S01', 'correct', async (p) => { await stopGhost(p); await click(p, '.w-opt[data-id="b"]'); await rest(p); }],
  [8, 'S01', 'wrong', async (p) => { await stopGhost(p); await click(p, '.w-opt[data-id="a"]'); await rest(p); }],
  [24, 'W2', 'guess', async (p) => { await click(p, '.w-guess[data-id="a"]'); await rest(p); }],
  [25, 'K2', 'key-idea', async () => {}],
  [26, 'K2', 'hr-case-on', async (p) => { await click(p, '[data-action="caseToggle"]'); await rest(p); }],
  [27, 'S04', 'ghost', async (p) => atGhost(p)],
  [28, 'S04', 'wrong-drop', async (p) => { await stopGhost(p); await drag(p, '[data-action="card"]', '.w-drop[data-column="a"]'); await drag(p, '[data-action="card"]', '.w-drop[data-column="a"]'); await rest(p); }],
  [29, 'S04', 'correct-drop', async (p) => { await stopGhost(p); await drag(p, '[data-action="card"]', '.w-drop[data-column="a"]'); await drag(p, '[data-action="card"]', '.w-drop[data-column="b"]'); await rest(p); }],
  [30, 'S05a', 'bpmn', async () => {}],
  [31, 'S05b', 'ghost', async (p) => atGhost(p)],
  [32, 'S05b', 'correct', async (p) => { await stopGhost(p); await drag(p, '.w-label-card[data-label="gateway"]', '.w-target[data-target="b"]'); await rest(p); }],
  [33, 'S05b', 'wrong', async (p) => { await stopGhost(p); await drag(p, '.w-label-card[data-label="gateway"]', '.w-target[data-target="b"]'); await drag(p, '.w-label-card[data-label="event"]', '.w-target[data-target="a"]'); await rest(p); }],
  [34, 'S06', 'situation1', async () => {}],
  [35, 'S06', 'situation1-correct', async (p) => { await click(p, '.w-opt[data-id="a"]'); await rest(p); }],
  [36, 'S06', 'situation2-wrong', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '[data-action="nextSituation"]'); await wait(700); await click(p, '.w-situation-now .w-opt[data-id="a"]'); await rest(p); }],
  [37, 'S07', 'ghost', async (p) => atGhost(p)],
  [38, 'S07', 'three-opened', async (p) => { await stopGhost(p); for (const n of [1, 2, 3]) await click(p, `.w-tile[data-n="${n}"]`); await rest(p); }],
  [39, 'S07', 'question', async (p) => { await stopGhost(p); for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); await p.keyboard.press('Escape'); await rest(p); }],
  [40, 'S07', 'correct', async (p) => { await stopGhost(p); for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); await p.keyboard.press('Escape'); await click(p, '.w-tile[data-n="8"]'); await rest(p); }],
  [41, 'S08', 'round1', async () => {}],
  [42, 'S08', 'round1-correct', async (p) => { await click(p, '.w-opt[data-id="b"]'); await rest(p); }],
  [43, 'S08', 'round2-wrong', async (p) => { await click(p, '.w-opt[data-id="b"]'); await click(p, '[data-action="nextRound"]'); await click(p, '.w-opt[data-id="a"]'); await rest(p); }],
  [44, 'S08B', 'input', async () => {}],
  [45, 'S08B', 'saved', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_TRIGGER"]', S08B.trigger);
    await p.type('.w-input[data-store="L4_CASE_STEPS"]', S08B.steps);
    await p.type('.w-input[data-store="L4_CASE_OUTPUT"]', S08B.output);
    await click(p, '[data-action="save"]'); await rest(p);
  }],
];

async function built([, id, state, act]) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await act(page);
  if (!/ghost/.test(state)) { await wait(1500); await settle(page); }
  const png = await page.screenshot({ type: 'png' });
  await context.close();
  return png;
}

/* ---- the reference: the canvas with the module's fonts ---- */
const fontsCss = readFileSync(join(ROOT, 'src', 'fonts.css'), 'utf8').replace(/url\(\.\.\//g, `url(${BASE}`);
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

for (const f of FRAMES) {
  const [n, id, state] = f;
  if (only.length && !only.includes(n)) continue;
  const name = `${String(n).padStart(2, '0')}-${id}-${state}`;
  const scr = (await ref.$$('figure.it .scr'))[n - 1];
  await scr.scrollIntoView();
  const refPng = await scr.screenshot({ type: 'png' });
  const buildPng = await built(f);
  if (parts) { writeFileSync(join(OUT, name + '-ref.png'), refPng); writeFileSync(join(OUT, name + '-built.png'), buildPng); }
  const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
  await pairPage.setContent(`<body style="margin:0;background:#333;font:14px Arial;color:#fff"><div style="display:flex;gap:20px;padding:0 0 4px"><span style="width:1280px">${name} · reference (frame)</span><span>build</span></div>`
    + `<div style="display:flex;gap:20px"><img src="${b64(refPng)}" width="1280" height="720"><img src="${b64(buildPng)}" width="1280" height="720"></div></body>`);
  await pairPage.screenshot({ path: join(OUT, name + '-pair.png'), clip: { x: 0, y: 0, width: 2580, height: 744 } });
  console.log('  ' + name);
}
await browser.close();
server.close();
