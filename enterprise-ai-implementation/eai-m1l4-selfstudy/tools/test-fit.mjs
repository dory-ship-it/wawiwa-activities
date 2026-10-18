// Fit and layout harness (P1.5 version). Adapted from
// genai-for-marketing/s1-ai-awareness/tools/test-fit.mjs: tiny static server + puppeteer-core +
// the machine's Chrome. Mouse-driven (the keyboard walk is tools/walk.mjs).
//   1. load and scale at 1280x720, 1920x1080, 1024x576: stage inside the window, no scrollbars,
//      the shell in place (rail 64 px, main, footer 64 px), no console errors
//   2. every slice screen in every band state, at 1280x720 and 1024x576: the band never overlaps the
//      screen's content, its width equals its interaction area and it sits directly under it,
//      nothing clipped, contrast of every text/background pair, no text under 14 px, targets 44 px
//   3. the open menu and its dialogs: the same contrast, size and target checks
// Usage: npm run test:fit
// Chrome: set CHROME_PATH, or a stock Google Chrome / Chromium install is found on its own.
import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';

const SIZES = [[1280, 720], [1024, 576]];
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
const pairs = new Map(); // every text/background pair seen, for the report

async function open(query, [w, h] = [1280, 720]) {
  const page = await browser.newPage();
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + query, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function measure(page, what) {
  await page.mouse.move(0, 0); // no hover state in the measure
  const m = await page.evaluate(measureLayout);
  for (const [k, v] of Object.entries(m.contrast)) if (!pairs.has(k)) pairs.set(k, v);
  const [good, detail] = layoutVerdict(m);
  expect(good, `${what}: ${detail}`);
}

/* ---- 1. load, scale, shell ---- */
console.log('\n1. load and fit');
for (const size of [[1280, 720], [1920, 1080], [1024, 576]]) {
  const page = await open('?reset=1', size);
  const r = await page.evaluate(() => {
    const stage = document.querySelector('.w-stage');
    const s = stage.getBoundingClientRect();
    const k = s.width / 1280;
    const box = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return [b.left - s.left, b.top - s.top, b.width, b.height].map((v) => Math.round(v / k)); };
    return { k, sw: s.width, sh: s.height, left: s.left, top: s.top,
      scroll: document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight,
      rail: box('.w-rail'), main: box('.w-main'), footer: box('.w-footer'),
      removed: ['.w-segments', '.w-topbar', '.w-readout', '.w-minutes'].filter((sel) => document.querySelector(sel)) };
  });
  const [w, h] = size;
  const want = Math.min(w / 1280, h / 720);
  expect(Math.abs(r.k - want) < 0.01 && r.left >= -0.5 && r.top >= -0.5 && r.left + r.sw <= w + 0.5 && r.top + r.sh <= h + 0.5, `${w}x${h}: stage scaled ${r.k.toFixed(3)} and inside the window`);
  expect(!r.scroll, `${w}x${h}: no scrollbars`);
  expect(r.rail.join() === '0,0,64,656' && r.main.join() === '64,0,1216,656' && r.footer.join() === '0,656,1280,64',
    `${w}x${h}: shell in place (rail ${r.rail.join(',')}, main ${r.main.join(',')}, footer ${r.footer.join(',')})`);
  expect(!r.removed.length, `${w}x${h}: no segmented bar, top bar, screen readout or minutes in the player${r.removed.length ? ' (' + r.removed.join(', ') + ')' : ''}`);
  expect(!page.errors.length, `${w}x${h}: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
  await page.close();
}

/* ---- 2. every screen in every band state ---- */
console.log('\n2. screens and band states');
const click = (page, sel) => page.click(sel);
const STATES = [
  ['S01', 'hint', async () => {}],
  ['S01', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S01', 'correct', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="b"]'); }],
  ['S02', 'hint', async () => {}],
  ['S02', 'notice', async (p) => click(p, '[data-action="save"]')],
  ['S02', 'saved', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries');
    await p.type('.w-input[data-store="L4_CASE_PROBLEM"]', 'Today reps write call summaries by hand, and it hurts because notes reach the CRM a day late and nobody can find them again.');
    await click(p, '[data-action="save"]');
  }],
  ['FT1', 'idle', async () => {}],
  ['FT1', 'wrong', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['FT1', 'correct + routes', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S03', 'hint', async () => {}],
  ['S03', 'two selected', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="c"]'); }],
  ['S03', 'not quite', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="c"]'); await click(p, '[data-action="check"]'); }],
  ['S03', 'one of two', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="b"]'); await click(p, '[data-action="check"]'); }],
  ['S03', 'correct', async (p) => { await click(p, '.w-opt[data-id="b"]'); await click(p, '.w-opt[data-id="d"]'); await click(p, '[data-action="check"]'); }],
  ['S03', 'pause marker', async (p) => { await click(p, '.w-opt[data-id="b"]'); await click(p, '.w-opt[data-id="d"]'); await click(p, '[data-action="check"]'); await click(p, '.w-next'); }],
  ['V1', 'placeholder', async () => {}],
];
for (const size of SIZES) {
  for (const [id, state, act] of STATES) {
    const page = await open(`?reset=1&screen=${id}`, size);
    await act(page);
    await measure(page, `${id} ${state} ${size.join('x')}`);
    expect(!page.errors.length, `${id} ${state} ${size.join('x')}: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
    await page.close();
  }
}

/* ---- 3. menu and dialogs ---- */
console.log('\n3. menu and dialogs');
for (const size of SIZES) {
  const page = await open('?reset=1&screen=S03', size);
  await click(page, '.w-rail-menu');
  await measure(page, `menu open ${size.join('x')}`);
  for (const action of ['resources', 'help', 'startover']) {
    await click(page, `.w-panel [data-action="${action}"]`);
    await measure(page, `menu dialog "${action}" ${size.join('x')}`);
    await page.keyboard.press('Escape');
  }
  expect(!page.errors.length, `menu ${size.join('x')}: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
  await page.close();
}

console.log('\n  text/background pairs rendered (ratio, needed):');
for (const [k, v] of [...pairs.entries()].sort()) console.log(`       ${k.padEnd(34)} ${v.ratio.toFixed(2).padStart(5)}:1  >= ${v.need}  e.g. "${v.sample.replace('text:', '')}"`);

await browser.close();
server.close();
console.log(fails.length ? `\ntest:fit FAILED (${fails.length})` : '\ntest:fit passed');
process.exit(fails.length ? 1 : 0);
