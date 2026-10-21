// Fit and layout harness (P1.5 version). Adapted from
// genai-for-marketing/s1-ai-awareness/tools/test-fit.mjs: tiny static server + puppeteer-core +
// the machine's Chrome. Mouse-driven (the keyboard walk is tools/walk.mjs).
//   1. load and scale at 1280x720, 1920x1080, 1024x576: stage inside the window, no scrollbars,
//      the shell in place (NL1: top bar 97.28 px, main under it, Previous / Next bottom left and
//      right), no console errors
//   2. every slice screen in every band state: the band never overlaps the screen's content, it is
//      flush to its panel's edges, nothing clipped, contrast of every text/background pair, no text
//      under 14 px, targets 44 px
//   3. the open menu and its dialogs: the same contrast, size and target checks
// Usage: npm run test:fit
// Chrome: set CHROME_PATH, or a stock Google Chrome / Chromium install is found on its own.
import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';

// every screen state at these sizes; 1366x650 to 2560x1080: browser windows with their bars, stage
// widened (2560x1080 caps the stage at 1600 and letterboxes the rest)
const SIZES = [[1280, 720], [1024, 576], [1366, 650], [1536, 730], [1920, 950], [2560, 1080]];
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
const pairs = new Map(); // every text/background pair seen, for the report

// Each page in its own browser context, closed with the page: after about a thousand pages in one
// browser the shared media loading stalled (the V1 film stopped buffering mid-way at 2560x1080).
async function open(query, [w, h] = [1280, 720]) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const closePage = page.close.bind(page);
  page.close = async () => { await closePage().catch(() => {}); await context.close().catch(() => {}); };
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + query, { waitUntil: /screen=V\d/.test(query) ? 'load' : 'networkidle0' }); // a film keeps a range request open
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
for (const size of [[1280, 720], [1920, 1080], [1024, 576], [1366, 650], [1536, 730], [1920, 950], [2560, 900], [2560, 1080]]) {
  const page = await open('?reset=1&screen=S01', size); // the shell (O1, the title, has no footer by design)
  const r = await page.evaluate(() => {
    const stage = document.querySelector('.w-stage');
    const s = stage.getBoundingClientRect();
    const k = s.height / 720;
    const box = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return [b.left - s.left, b.top - s.top, b.width, b.height].map((v) => Math.round(v / k)); };
    return { k, sw: s.width, sh: s.height, left: s.left, top: s.top,
      scroll: document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight,
      bar: box('.w-bar'), main: box('.w-main'), prev: box('.w-prev'), next: box('.w-next'),
      removed: ['.w-segments', '.w-topbar', '.w-readout', '.w-minutes'].filter((sel) => document.querySelector(sel)) };
  });
  const [w, h] = size;
  const want = Math.min(w / 1280, h / 720);
  // a wide window widens the stage (up to 1600) instead of leaving white bars; main takes the width right of the rail
  const stageW = Math.round(Math.min(1600, Math.max(1280, w / want)));
  expect(Math.abs(r.k - want) < 0.01 && r.left >= -0.5 && r.top >= -0.5 && r.left + r.sw <= w + 0.5 && r.top + r.sh <= h + 0.5, `${w}x${h}: stage scaled ${r.k.toFixed(3)} and inside the window`);
  expect(Math.abs(r.sw / r.k - stageW) < 1 && (stageW === 1600 || Math.abs(r.sw - w) < 2), `${w}x${h}: stage ${Math.round(r.sw / r.k)} wide, ${stageW < 1600 ? 'fills the window width' : 'capped at 1600, the rest letterboxed'}`);
  expect(!r.scroll, `${w}x${h}: no scrollbars`);
  // the bar 97.28 high (rounded 97), main under it; Previous 23 px from the left, Next 23 px from the right, both 18 px over the foot
  const near = (a, b) => Math.abs(a - b) <= 1; // edges rounded one by one
  expect(r.bar.join() === `0,0,${stageW},97` && r.main.join() === `0,97,${stageW},623` && near(r.prev[0], 23) && near(r.next[0] + r.next[2], stageW - 23)
    && near(r.prev[1] + r.prev[3], 702) && near(r.next[1] + r.next[3], 702),
    `${w}x${h}: shell in place (bar ${r.bar.join(',')}, main ${r.main.join(',')}, Previous ${r.prev.join(',')}, Next ${r.next.join(',')})`);
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
  // V3-1: Intro and Chapter 1 (Round 4)
  ['O1', 'title', async () => {}],
  ['O2', 'L4 open', async (p) => p.keyboard.press('Shift')], // any key stops the ghost hand
  ['O2', 'L1 open', async (p) => click(p, '.w-map-tab[data-station="l1"]')],
  ['O3', 'goals', async () => {}],
  ['O3', 'goal tip', async (p) => p.focus('.w-goal[data-goal="g5"]')],
  ['W1', 'hint', async () => {}],
  ['W1', 'guess', async (p) => click(p, '.w-guess[data-id="b"]')],
  ['K1', 'key idea', async () => {}],
  ['S02', 'hint', async () => {}],
  ['S02', 'notice', async (p) => click(p, '[data-action="save"]')],
  ['S02', 'saved', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries');
    await p.type('.w-input[data-store="L4_CASE_PROBLEM"]', 'Today reps write call summaries by hand, and it hurts because notes reach the CRM a day late and nobody can find them again.');
    await click(p, '[data-action="save"]');
  }],
  ['S03', 'hint', async () => {}],
  ['S03', 'two selected', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="c"]'); }],
  ['S03', 'not quite', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="c"]'); await click(p, '[data-action="check"]'); }],
  ['S03', 'one of two', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '.w-opt[data-id="b"]'); await click(p, '[data-action="check"]'); }],
  ['S03', 'correct', async (p) => { await click(p, '.w-opt[data-id="b"]'); await click(p, '.w-opt[data-id="d"]'); await click(p, '[data-action="check"]'); }],
  ['S03', 'pause marker', async (p) => { await click(p, '.w-opt[data-id="b"]'); await click(p, '.w-opt[data-id="d"]'); await click(p, '[data-action="check"]'); await click(p, '.w-next'); }],
  ['V1', 'play view', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['V1', 'transcript open', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); await click(p, '.w-tr'); }],
  ['V1', 'stop, wrong', async (p) => { await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="a"]'); }],
  ['V1', 'stop, right', async (p) => { await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="b"]'); }],
  // R1: Chapter 2
  ['FT2', 'idle', async () => {}],
  ['FT2', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['FT2', 'correct + routes', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S04', 'start', async () => {}],
  ['S04', 'card selected', async (p) => click(p, '[data-action="card"]')],
  ['S04', 'wrong', async (p) => { await click(p, '[data-action="card"]'); await click(p, '.w-sort-target[data-column="c"]'); }],
  ['S04', 'done', async (p) => { for (const col of ['a', 'b', 'a', 'b', 'c']) { await click(p, '[data-action="card"]'); await click(p, `.w-sort-target[data-column="${col}"]`); } }],
  ['S05', 'hint', async () => {}],
  ['S05', 'wrong (lane)', async (p) => click(p, '.w-lane-head')],
  ['S05', 'wrong (event)', async (p) => click(p, '.w-node-event')],
  ['S05', 'gateway + chips', async (p) => { await click(p, '.w-node-gateway'); for (const b of await p.$$('.w-legend-btn')) await b.click(); }],
  ['S06', 'hint', async () => {}],
  ['S06', 'left wrong', async (p) => click(p, '.w-situation .w-opt[data-id="b"]')],
  ['S06', 'both right', async (p) => { await click(p, '.w-situation .w-opt[data-id="a"]'); await click(p, '.w-situation + .w-situation .w-opt[data-id="b"]'); }],
  ['S07', 'tile 5 open', async (p) => click(p, '.w-tile[data-n="5"]')],
  ['S07', 'question', async (p) => { for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); }],
  ['S07', 'wrong', async (p) => { for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); await click(p, '.w-tile[data-n="7"]'); }],
  ['S07', 'correct', async (p) => { for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); await click(p, '.w-tile[data-n="8"]'); }],
  ['S08', 'round 1 wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S08', 'round 1 right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S08', 'round 3 right', async (p) => {
    for (const k of ['b', 'c']) { await click(p, `.w-opt[data-id="${k}"]`); await click(p, '[data-action="nextRound"]'); }
    await click(p, '.w-opt[data-id="a"]');
  }],
  ['S08', 'pause marker', async (p) => {
    for (const k of ['b', 'c']) { await click(p, `.w-opt[data-id="${k}"]`); await click(p, '[data-action="nextRound"]'); }
    await click(p, '.w-opt[data-id="a"]');
    await click(p, '.w-next');
  }],
  // R2: Chapters 3 and 4
  ['FT3', 'idle', async () => {}],
  ['FT3', 'correct + routes', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['V2', 'play view', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['V2', 'stop 3, wrong', async (p) => {
    for (const k of ['b', 'a']) { await toStop(p); await click(p, `.w-stop-view .w-opt[data-id="${k}"]`); await click(p, '[data-action="resume"]'); }
    await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="a"]');
  }],
  ['V2', 'ended', async (p) => {
    for (const k of ['b', 'a', 'b']) { await toStop(p); await click(p, `.w-stop-view .w-opt[data-id="${k}"]`); await click(p, '[data-action="resume"]'); }
    await playUntil(p, () => document.querySelector('.w-next').dataset.locked === 'false', 'video end');
  }],
  ['S09', 'start', async () => {}],
  ['S09', 'wrong', async (p) => { await click(p, '.w-tray-card[data-card="4"]'); await click(p, '.w-sort-target[data-column="a"]'); }],
  ['S09', 'done', async (p) => { for (const [c, col] of [['1', 'a'], ['2', 'a'], ['3', 'b'], ['4', 'c'], ['5', 'd'], ['6', 'd']]) { await click(p, `.w-tray-card[data-card="${c}"]`); await click(p, `.w-sort-target[data-column="${col}"]`); } }],
  ['S10', 'wrong', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S10', 'right', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S11', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S11', 'right', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S12', 'one of two', async (p) => { await click(p, '.w-pick-tile[data-n="4"]'); await click(p, '.w-pick-tile[data-n="3"]'); await click(p, '[data-action="check"]'); }],
  ['S12', 'correct', async (p) => { await click(p, '.w-pick-tile[data-n="4"]'); await click(p, '.w-pick-tile[data-n="7"]'); await click(p, '[data-action="check"]'); }],
  ['S12', 'pause marker', async (p) => { await click(p, '.w-pick-tile[data-n="4"]'); await click(p, '.w-pick-tile[data-n="7"]'); await click(p, '[data-action="check"]'); await click(p, '.w-next'); }],
  ['FT4', 'idle', async () => {}],
  ['FT4', 'wrong', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S13', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S13', 'right', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S14', 'wrong', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S14', 'right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S15', 'wrong', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S15', 'right', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S16', 'card selected', async (p) => click(p, '.w-tray-card[data-card="1"]')],
  ['S16', 'wrong', async (p) => { await click(p, '.w-tray-card[data-card="2"]'); await click(p, '.w-sort-target[data-column="b"]'); }],
  ['S16', 'done', async (p) => { for (const [c, col] of [['1', 'a'], ['2', 'd'], ['3', 'b'], ['4', 'd'], ['5', 'd'], ['6', 'c']]) { await click(p, `.w-tray-card[data-card="${c}"]`); await click(p, `.w-sort-target[data-column="${col}"]`); } }],
  ['S17', 'start', async () => {}],
  ['S17', 'wrong', async (p) => { await click(p, '[data-action="card"]'); await click(p, '.w-sort-target[data-column="5"]'); }],
  ['S17', 'pause marker', async (p) => {
    for (const col of ['3', '1', '5', '4', '2']) { await click(p, '[data-action="card"]'); await click(p, `.w-sort-target[data-column="${col}"]`); }
    await click(p, '.w-next');
  }],
  // R3: Chapters 5 and 6
  ['S18A', 'wrong', async (p) => { await click(p, '.w-tray-card[data-card="4"]'); await click(p, '.w-sort-target[data-column="b"]'); }],
  ['S18A', 'done', async (p) => { for (const [c, col] of [['1', 'a'], ['2', 'b'], ['3', 'c'], ['4', 'd']]) { await click(p, `.w-tray-card[data-card="${c}"]`); await click(p, `.w-sort-target[data-column="${col}"]`); } }],
  ['S18', 'wrong', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S18', 'step 2 unticked', async (p) => { await click(p, '.w-opt[data-id="b"]'); await p.type('.w-input', 'Sales call summaries'); await click(p, '[data-action="save"]'); }],
  ['S18', 'saved', async (p) => { await click(p, '.w-opt[data-id="b"]'); await p.type('.w-input', 'Sales call summaries'); await click(p, '.w-checkbox'); await click(p, '[data-action="save"]'); }],
  ['S19', 'brief', async () => {}],
  ['S19', 'opened', async (p) => { await noNewTab(p, '[data-action="open"]'); await click(p, '[data-action="open"]'); }],
  ['S19', 'return, saved', async (p) => {
    await noNewTab(p, '[data-action="open"]'); await click(p, '[data-action="open"]'); await click(p, '[data-action="back"]');
    await p.type('.w-input', 'Share of HR time on repeat questions: about 35% now, 20% within three months, checked against a weekly sample of requests.');
    await click(p, '[data-action="save"]');
  }],
  ['S20', 'row answered', async (p) => click(p, '.w-check-row[data-row="q1"] [data-choice="notYet"]')],
  ['S20', 'step 2 chip', async (p) => {
    for (const q of ['q1', 'q2', 'q3']) await click(p, `.w-check-row[data-row="${q}"] [data-choice="yes"]`);
    await click(p, '.w-next'); await click(p, '.w-chip[data-chip="automating"]');
  }],
  ['S20', 'step 2 with goal reminder', async (p) => {
    await p.evaluate(() => { window.__l4.state.f.L4_GOAL_FOCUS = 'e'; window.__l4.go('S20'); });
    for (const q of ['q1', 'q2', 'q3']) await click(p, `.w-check-row[data-row="${q}"] [data-choice="yes"]`);
    await click(p, '.w-next'); await click(p, '.w-chip[data-chip="automating"]');
  }],
  ['S21', 'item 1 wrong', async (p) => click(p, '.w-kc-opt[data-id="b"]')],
  ['S21', 'item 5 one of two', async (p) => {
    for (const k of ['c', 'b', 'a', 'd']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
    await click(p, '.w-kc-tile[data-n="5"]'); await click(p, '.w-kc-tile[data-n="1"]'); await click(p, '[data-action="check"]');
  }],
  ['S21', 'result', async (p) => {
    for (const k of ['c', 'b', 'a', 'd']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
    await click(p, '.w-kc-tile[data-n="5"]'); await click(p, '.w-kc-tile[data-n="6"]'); await click(p, '[data-action="check"]');
  }],
  ['S22', 'takeaway', async (p) => click(p, '.w-takeaway[data-id="b"]')],
  ['S22', 'finish confirm', async (p) => { await click(p, '.w-takeaway[data-id="a"]'); await click(p, '.w-next'); await click(p, '[data-action="finish"]'); }],
  ['S22', 'finished', async (p) => { await click(p, '.w-takeaway[data-id="a"]'); await click(p, '.w-next'); await click(p, '[data-action="finish"]'); await click(p, '[data-action="finish"]'); }],
];
// links that open a new tab: keep the test inside the module (the tab itself is checked in walk.mjs)
async function noNewTab(p, sel) { await p.evaluate((s) => document.querySelector(s).addEventListener('click', (e) => e.preventDefault(), { capture: true }), sel); }
// the video player: no seeking ahead of what was watched, so play muted at 16x to the next stop
async function fastPlay(p) {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
}
// Headless Chrome at a 2560x1080 window sometimes stalls a 16x video (fully buffered, time stuck;
// 1x plays normally). When the time stops moving, re-seek to the same point (it resets the decoder)
// and play on at 4x, until done() is true. Report where it got to if it never is.
async function playUntil(p, done, what) {
  await fastPlay(p);
  let last = -1;
  for (let i = 0; i < 60; i++) {
    if (await p.evaluate(done)) return;
    last = await p.evaluate((prev) => {
      const v = document.querySelector('.w-video');
      if (document.querySelector('.w-stop-view').hidden && !v.ended && (v.paused || Math.abs(v.currentTime - prev) < 0.01)) {
        v.pause(); v.currentTime = v.currentTime; v.muted = true; v.playbackRate = 4; v.play().catch(() => {});
      }
      return v.currentTime;
    }, last);
    await new Promise((r) => setTimeout(r, 1000));
  }
  const at = await p.evaluate(() => { const v = document.querySelector('.w-video'); return `t ${v.currentTime.toFixed(1)}, paused ${v.paused}, readyState ${v.readyState}, error ${v.error?.code ?? 'none'}`; });
  throw new Error(`${what} not reached in 60 s: ${at}`);
}
const toStop = (p) => playUntil(p, () => !document.querySelector('.w-stop-view').hidden, 'video stop');
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
  await click(page, '.w-bar-menu');
  await measure(page, `menu open ${size.join('x')}`);
  for (const action of ['help', 'startover']) {
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
