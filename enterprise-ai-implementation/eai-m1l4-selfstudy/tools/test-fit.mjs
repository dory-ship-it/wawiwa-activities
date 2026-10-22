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
// Usage: npm run test:fit                 everything
//        node tools/test-fit.mjs S09 W3    only these screens' states (section 2), for a quick check
// Chrome: set CHROME_PATH, or a stock Google Chrome / Chromium install is found on its own.
import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';

// every screen state at these sizes; 1366x650 to 2560x1080: browser windows with their bars, stage
// widened (2560x1080 caps the stage at 1600 and letterboxes the rest)
// FX1: --sizes=1280x720,1600x900 measures only these sizes (the fast run); the full six are for packaging
const SIZE_ARG = process.argv.find((a) => a.startsWith('--sizes='));
const SIZES = SIZE_ARG ? SIZE_ARG.slice(8).split(',').map((s) => s.split('x').map(Number)) : [[1280, 720], [1024, 576], [1366, 650], [1536, 730], [1920, 950], [2560, 1080]];
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith('--'));
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
// NL3: after a few hundred pages one load sometimes never settles (S15 at 1024x576 waited 30 s for
// the fonts; alone it loads at once). Such a load is tried once more in a fresh context.
async function open(query, size = [1280, 720]) {
  try { return await openOnce(query, size); } catch (e) {
    if (e.name !== 'TimeoutError') throw e;
    console.log(`  note ${query} ${size.join('x')}: load timed out, tried once more`);
    return openOnce(query, size);
  }
}
async function openOnce(query, [w, h]) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const closePage = page.close.bind(page);
  page.close = async () => { await closePage().catch(() => {}); await context.close().catch(() => {}); };
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  try {
    await page.goto(BASE + query, { waitUntil: /screen=V\d/.test(query) ? 'load' : 'networkidle0' }); // a film keeps a range request open
    await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
    await page.evaluate(() => document.fonts.ready);
  } catch (e) { await page.close(); throw e; }
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
for (const size of ONLY.length ? [] : SIZE_ARG ? SIZES : [[1280, 720], [1920, 1080], [1024, 576], [1366, 650], [1536, 730], [1920, 950], [2560, 900], [2560, 1080]]) {
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
  ['O3', 'goal 5 open', async (p) => click(p, '.w-goal[data-goal="g5"]')],
  ['W1', 'hint', async () => {}],
  ['W1', 'guess', async (p) => click(p, '.w-guess[data-id="b"]')],
  ['K1', 'key idea', async () => {}],
  ['S02', 'hint', async () => {}],
  ['S02', 'one field, Save locked', async (p) => p.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries')],
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
  // NL2: Chapter 2 (storyboard v3)
  ['W2', 'hint', async () => {}],
  ['W2', 'guess', async (p) => click(p, '.w-guess[data-id="a"]')],
  ['K2', 'key idea', async () => {}],
  ['K2', 'HR case on', async (p) => click(p, '[data-action="caseToggle"]')],
  ['S04', 'start', async (p) => p.keyboard.press('Shift')], // any key stops the ghost hand
  ['S04', 'card picked up', async (p) => { await p.keyboard.press('Shift'); await click(p, '[data-action="card"]'); }],
  // FX1 E2: place everything, then Check
  ['S04', 'one placed', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['c']); }],
  ['S04', 'all placed', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'c', 'a', 'b', 'a']); }],
  ['S04', 'checked, two back', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'c', 'a', 'b', 'a']); await click(p, '[data-action="check"]'); }],
  ['S04', 'shown after attempt 2', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'c', 'a', 'b', 'a']); await click(p, '[data-action="check"]'); await deck(p, ['a', 'b']); await click(p, '[data-action="check"]'); }],
  ['S04', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'b', 'a', 'b', 'c']); await click(p, '[data-action="check"]'); }],
  ['S05a', 'key idea', async () => {}],
  ['S05b', 'start', async (p) => p.keyboard.press('Shift')],
  ['S05b', 'checked, wrong', async (p) => { await p.keyboard.press('Shift'); await labels(p, [['event', 'a'], ['swimlane', 'b'], ['gateway', 'c']]); await click(p, '[data-action="check"]'); }],
  ['S05b', 'shown after attempt 2', async (p) => { await p.keyboard.press('Shift'); await labels(p, [['event', 'a'], ['swimlane', 'b'], ['gateway', 'c']]); await click(p, '[data-action="check"]'); await labels(p, [['event', 'b'], ['swimlane', 'c'], ['gateway', 'a']]); await click(p, '[data-action="check"]'); }],
  ['S05b', 'done', async (p) => { await p.keyboard.press('Shift'); await labels(p, [['swimlane', 'a'], ['gateway', 'b'], ['event', 'c']]); await click(p, '[data-action="check"]'); }],
  ['S06', 'hint', async () => {}],
  ['S06', 'situation 1 wrong', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S06', 'situation 1 right', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S06', 'situation 2 wrong', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '[data-action="nextSituation"]'); await click(p, '.w-situation-now .w-opt[data-id="a"]'); }],
  ['S06', 'both right', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '[data-action="nextSituation"]'); await click(p, '.w-situation-now .w-opt[data-id="b"]'); }],
  ['S07', 'tile 5 open', async (p) => { await p.keyboard.press('Shift'); await click(p, '.w-tile[data-n="5"]'); }],
  ['S07', 'question', async (p) => { await p.keyboard.press('Shift'); for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); }],
  ['S07', 'wrong', async (p) => { await p.keyboard.press('Shift'); for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); await click(p, '.w-tile[data-n="7"]'); }],
  ['S07', 'correct', async (p) => { await p.keyboard.press('Shift'); for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); await click(p, '.w-tile[data-n="8"]'); }],
  ['S08', 'round 1 wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S08', 'round 1 right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S08', 'round 3 right', async (p) => {
    for (const k of ['b', 'c']) { await click(p, `.w-opt[data-id="${k}"]`); await click(p, '[data-action="nextRound"]'); }
    await click(p, '.w-opt[data-id="a"]');
  }],
  ['S08B', 'hint', async () => {}],
  ['S08B', 'empty save', async (p) => click(p, '[data-action="save"]')],
  ['S08B', 'saved, full', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_TRIGGER"]', 'A request form arrives from a sales rep after every customer call, by email');
    await p.type('.w-input[data-store="L4_CASE_STEPS"]', 'The rep writes notes by hand, the team lead checks them, the sales manager reads them two days later and asks follow-up questions by phone');
    await p.type('.w-input[data-store="L4_CASE_OUTPUT"]', 'A call summary in the CRM, to the sales manager and the account team');
    await click(p, '[data-action="save"]');
  }],
  // NL3: Chapters 3 and 4 (storyboard v3)
  ['W3', 'hint', async () => {}],
  ['W3', 'guess', async (p) => click(p, '.w-guess[data-id="c"]')],
  ['V2', 'play view', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['V2', 'stop 3, wrong', async (p) => {
    for (const k of ['b', 'a']) { await toStop(p); await click(p, `.w-stop-view .w-opt[data-id="${k}"]`); await click(p, '[data-action="resume"]'); }
    await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="a"]');
  }],
  ['V2', 'ended', async (p) => {
    for (const k of ['b', 'a', 'b']) { await toStop(p); await click(p, `.w-stop-view .w-opt[data-id="${k}"]`); await click(p, '[data-action="resume"]'); }
    await playUntil(p, () => document.querySelector('.w-next').dataset.locked === 'false', 'video end');
  }],
  ['S09', 'start', async (p) => p.keyboard.press('Shift')],
  ['S09', 'checked, wrong back', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['b', 'a', 'b', 'c', 'd', 'a']); await click(p, '[data-action="check"]'); }],
  ['S09', 'shown after attempt 2', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['b', 'a', 'b', 'c', 'd', 'a']); await click(p, '[data-action="check"]'); await deck(p, ['c', 'b']); await click(p, '[data-action="check"]'); }],
  ['S09', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'a', 'b', 'c', 'd', 'd']); await click(p, '[data-action="check"]'); }],
  ['S10', 'wrong', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S10', 'right', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S11', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S11', 'right', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S12', 'start', async () => {}],
  ['S12', 'flag picked up', async (p) => click(p, '.w-flag-card[data-flag="r1"]')],
  ['S12', 'one placed', async (p) => flag(p, 'r1', '3')],
  ['S12', 'checked, one back', async (p) => { await flag(p, 'r1', '3'); await flag(p, 'r2', '7'); await click(p, '[data-action="check"]'); }],
  ['S12', 'shown after attempt 2', async (p) => { await flag(p, 'r1', '3'); await flag(p, 'r2', '7'); await click(p, '[data-action="check"]'); await flag(p, 'r1', '2'); await click(p, '[data-action="check"]'); }],
  ['S12', 'both right', async (p) => { await flag(p, 'r1', '4'); await flag(p, 'r2', '7'); await click(p, '[data-action="check"]'); }],
  ['S12B', 'hint', async () => {}],
  ['S12B', 'empty save', async (p) => click(p, '[data-action="save"]')],
  ['S12B', 'saved, full', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_BASELINE"]', 'About two working days from the call to a summary in the CRM, by our own count');
    await p.type('.w-input[data-store="L4_CASE_TARGET"]', 'The same working day for nine summaries out of ten, checked on a weekly sample');
    await p.type('.w-input[data-store="L4_CASE_DATE"]', 'Within three months of the pilot start');
    await click(p, '[data-action="save"]');
  }],
  ['W4', 'hint', async () => {}],
  ['W4', 'guess', async (p) => click(p, '.w-guess[data-id="a"]')],
  ['S13', 'start', async () => {}],
  ['S13', 'start placed', async (p) => flag(p, 'start', '2')],
  ['S13', 'checked, both back', async (p) => { await flag(p, 'start', '2'); await flag(p, 'end', '4'); await click(p, '[data-action="check"]'); }],
  ['S13', 'shown after attempt 2', async (p) => { await flag(p, 'start', '2'); await flag(p, 'end', '4'); await click(p, '[data-action="check"]'); await flag(p, 'start', '3'); await flag(p, 'end', '1'); await click(p, '[data-action="check"]'); }],
  ['S13', 'both right', async (p) => { await flag(p, 'start', '1'); await flag(p, 'end', '5'); await click(p, '[data-action="check"]'); }],
  ['S14', 'hint', async () => {}],
  ['S14', 'wrong', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S14', 'right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S14', 'option a (longest line)', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S15', 'hint', async () => {}],
  ['S15', 'wrong', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S15', 'right', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['K4', 'key idea', async () => {}],
  ['S16', 'start', async (p) => p.keyboard.press('Shift')],
  ['S16', 'card picked up', async (p) => { await p.keyboard.press('Shift'); await click(p, '[data-action="card"]'); }],
  ['S16', 'checked, wrong back', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['b', 'd', 'b', 'd', 'd', 'c']); await click(p, '[data-action="check"]'); }],
  ['S16', 'shown after attempt 2', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['b', 'c', 'b', 'd', 'd', 'c']); await click(p, '[data-action="check"]'); await deck(p, ['c', 'b']); await click(p, '[data-action="check"]'); }],
  ['S16', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'd', 'b', 'd', 'd', 'c']); await click(p, '[data-action="check"]'); }],
  ['S17', 'start', async (p) => p.keyboard.press('Shift')],
  ['S17', 'longest case', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['3', '1', '5', '4']); }], // case e on the deck
  ['S17', 'checked, wrong back', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['5', '1', '3', '4', '2']); await click(p, '[data-action="check"]'); }],
  ['S17', 'shown after attempt 2', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['5', '1', '3', '4', '2']); await click(p, '[data-action="check"]'); await deck(p, ['1', '5']); await click(p, '[data-action="check"]'); }],
  ['S17', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['3', '1', '5', '4', '2']); await click(p, '[data-action="check"]'); }],
  ['S17B', 'hint', async () => {}],
  ['S17B', 'empty save', async (p) => click(p, '[data-action="save"]')],
  ['S17B', 'saved, full, long steps', async (p) => {
    await p.evaluate(() => { window.__l4.state.f.L4_CASE_STEPS = 'Steps and who does them '.repeat(11).slice(0, 250); window.__l4.go('S17B'); });
    await p.type('.w-input[data-store="L4_CASE_AIFIT"]', 'Sort the incoming call notes by topic and by account before the sales manager reads them');
    await p.type('.w-input[data-store="L4_CASE_HUMAN"]', 'Approve a discount or an exception for a key account, with the account history');
    await click(p, '[data-action="save"]');
  }],
  // R3: Chapters 5 and 6
  ['S18A', 'wrong', async (p) => { await click(p, '.w-tray-card[data-card="4"]'); await click(p, '.w-sort-target[data-column="b"]'); }],
  ['S18A', 'done', async (p) => { for (const [c, col] of [['1', 'a'], ['2', 'b'], ['3', 'c'], ['4', 'd']]) { await click(p, `.w-tray-card[data-card="${c}"]`); await click(p, `.w-sort-target[data-column="${col}"]`); } }],
  ['S18', 'wrong', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S18', 'step 2 unticked', async (p) => { await click(p, '.w-opt[data-id="b"]'); await p.type('.w-input', 'Sales call summaries'); await click(p, '[data-action="save"]'); }],
  ['S18', 'saved', async (p) => { await click(p, '.w-opt[data-id="b"]'); await p.type('.w-input', 'Sales call summaries'); await click(p, '.w-checkbox'); await click(p, '[data-action="save"]'); }],
  ['S19', 'brief', async () => {}],
  ['S19', 'brief, full sketch and notes', async (p) => {
    await p.evaluate(() => { const f = window.__l4.state.f; f.L4_CASE_TRIGGER = 'Trigger text '.repeat(10).slice(0, 120); f.L4_CASE_STEPS = 'Steps and who does them '.repeat(11).slice(0, 250); f.L4_CASE_OUTPUT = 'Output text '.repeat(11).slice(0, 120);
      f.L4_CASE_AIFIT = 'Could fit AI '.repeat(8).slice(0, 100); f.L4_CASE_HUMAN = 'Stays with a person '.repeat(6).slice(0, 100); window.__l4.go('S19'); });
  }],
  ['S19', 'opened, full sketch and notes', async (p) => {
    await p.evaluate(() => { const f = window.__l4.state.f; f.L4_CASE_TRIGGER = 'Trigger text '.repeat(10).slice(0, 120); f.L4_CASE_STEPS = 'Steps and who does them '.repeat(11).slice(0, 250); f.L4_CASE_OUTPUT = 'Output text '.repeat(11).slice(0, 120);
      f.L4_CASE_AIFIT = 'Could fit AI '.repeat(8).slice(0, 100); f.L4_CASE_HUMAN = 'Stays with a person '.repeat(6).slice(0, 100); window.__l4.state.g.S19 = { o: 1 }; window.__l4.go('S19'); });
    await noNewTab(p, '[data-action="open"]'); await click(p, '[data-action="open"]');
  }],
  ['S19', 'return, metric from S12B (full)', async (p) => {
    await p.evaluate(() => { Object.assign(window.__l4.state.f, { L4_CASE_BASELINE: 'b'.repeat(80), L4_CASE_TARGET: 't'.repeat(80), L4_CASE_DATE: 'd'.repeat(40) }); window.__l4.state.g.S19 = { o: 1, b: 1 }; window.__l4.go('S19'); });
  }],
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
// the flags (S12, S13): click a flag, then its target
async function flag(p, f, t) { await click(p, `.w-flag-card[data-flag="${f}"]`); await click(p, `.w-target[data-target="${t}"]`); }
// S05b: click a label, then its place, per pair
async function labels(p, pairs) { for (const [l, t] of pairs) { await click(p, `.w-label-card[data-label="${l}"]`); await click(p, `.w-target[data-target="${t}"]`); } }
// the sort deck: click the card, then a column, once per column given
async function deck(p, cols) { for (const col of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${col}"]`); } }
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
  for (const [id, state, act] of STATES.filter(([id]) => !ONLY.length || ONLY.includes(id))) {
    const page = await open(`?reset=1&screen=${id}`, size);
    await act(page);
    await measure(page, `${id} ${state} ${size.join('x')}`);
    expect(!page.errors.length, `${id} ${state} ${size.join('x')}: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
    await page.close();
  }
}

/* ---- 3. menu and dialogs ---- */
console.log('\n3. menu and dialogs');
for (const size of ONLY.length ? [] : SIZES) {
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
