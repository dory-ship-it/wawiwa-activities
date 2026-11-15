// Fit and layout harness (P1.5 version). Adapted from
// genai-for-marketing/s1-ai-awareness/tools/test-fit.mjs: tiny static server + puppeteer-core +
// the machine's Chrome. Mouse-driven (the keyboard walk is tools/walk.mjs).
//   1. load and scale at 1280x720, 1920x1080, 1024x576: stage inside the window, no scrollbars,
//      the shell in place (NL1: top bar 97.28 px, main under it, Previous / Next bottom left and
//      right), no console errors
//   2. every slice screen in every band state: the band never overlaps the screen's content, it is
//      flush to its panel's edges, nothing clipped, contrast of every text/background pair, no text
//      under 14 px, targets 44 px
//   2b. PP1: the eight adaptive screens on each level (support, core, stretch via ?debug=1&level=) in
//      their main states, the answers read from the variant shown; the same checks as 2 (a state that
//      fails on the core screen too is listed as a WARNING: core is not PP1's to change)
//   3. the open menu and its dialogs: the same contrast, size and target checks
//   4. CO1, the coach on every slice screen: the launcher in the bar (56 x 56, y 0 to 80.64, the bar's
//      parts still fit, nothing clipped), then the open panel at the left and the right dock: inside y 96
//      to 632 and 24 from its side, opaque and on top, clear of Previous / Next and the bar, and the
//      screen's layout checks with it open. CO2: with the live page (a local stub at the coach URL)
//      filling the body under the header, 340 wide to the panel's foot (hidden on S21)
// Usage: npm run test:fit                 everything
//        node tools/test-fit.mjs S09 W3    only these screens' states (sections 2 and 4), for a quick check
//        --coach                           section 4 only
// Chrome: set CHROME_PATH, or a stock Google Chrome / Chromium install is found on its own.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';
import { STATES } from './states.mjs';

// every screen state at these sizes; 1366x650 to 2560x1080: browser windows with their bars, stage
// widened (2560x1080 caps the stage at 1600 and letterboxes the rest)
// FX1: --sizes=1280x720,1600x900 measures only these sizes (the fast run); the full six are for packaging
const SIZE_ARG = process.argv.find((a) => a.startsWith('--sizes='));
// DM M2 L2: the default run is the work order's two sizes (1280x720 and 1024x576); --all adds the four wide windows
const ALL_SIZES = [[1280, 720], [1024, 576], [1366, 650], [1536, 730], [1920, 950], [2560, 1080]];
const SIZES = SIZE_ARG ? SIZE_ARG.slice(8).split(',').map((s) => s.split('x').map(Number)) : process.argv.includes('--all') ? ALL_SIZES : ALL_SIZES.slice(0, 2);
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const COACH_ONLY = process.argv.includes('--coach'); // CO1: section 4 only
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
// coach: CO2, the live coach page's local stub at the coach URL (tools/coach-stub.html; no network)
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
for (const size of ONLY.length || COACH_ONLY ? [] : SIZE_ARG ? SIZES : [[1280, 720], [1920, 1080], [1024, 576], [1366, 650], [1536, 730], [1920, 950], [2560, 900], [2560, 1080]]) {
  const page = await open('?reset=1&screen=O2', size); // the shell (O1, the title, has no footer by design)
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
  // the bar 80.64 high (FX2 C, rounded 81), main under it; Previous 23 px from the left, Next 23 px from the right, both 18 px over the foot
  const near = (a, b) => Math.abs(a - b) <= 1; // edges rounded one by one
  expect(r.bar.join() === `0,0,${stageW},81` && r.main.join() === `0,81,${stageW},639` && near(r.prev[0], 23) && near(r.next[0] + r.next[2], stageW - 23)
    && near(r.prev[1] + r.prev[3], 702) && near(r.next[1] + r.next[3], 702),
    `${w}x${h}: shell in place (bar ${r.bar.join(',')}, main ${r.main.join(',')}, Previous ${r.prev.join(',')}, Next ${r.next.join(',')})`);
  expect(!r.removed.length, `${w}x${h}: no segmented bar, top bar, screen readout or minutes in the player${r.removed.length ? ' (' + r.removed.join(', ') + ')' : ''}`);
  expect(!page.errors.length, `${w}x${h}: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
  await page.close();
}

/* ---- 2. every screen in every state (tools/states.mjs) ---- */
console.log('\n2. screens and states');
const click = async (page, sel) => { await page.waitForSelector(sel); await page.click(sel); };
for (const size of COACH_ONLY ? [] : SIZES) {
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
for (const size of ONLY.length || COACH_ONLY ? [] : SIZES) {
  const page = await open('?reset=1&screen=O3', size);
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

/* ---- 4. the coach (offline tips): the launcher on every screen, the open panel at both docks ---- */
console.log('\n4. coach');
const SLICE = JSON.parse(readFileSync(join(ROOT, 'content', 'm2l2.json'), 'utf8')).lesson.slice;
// stage-px boxes of the launcher, the bar's parts, the panel, Previous / Next; whether the panel is opaque
// and on top (the element at five points of its box is its own)
const coachBoxes = () => {
  const s = document.querySelector('.w-stage').getBoundingClientRect(), k = s.height / 720;
  const box = (el) => { if (!el || el.hidden || !el.getClientRects().length) return null; const r = el.getBoundingClientRect(); return { l: (r.left - s.left) / k, t: (r.top - s.top) / k, r: (r.right - s.left) / k, b: (r.bottom - s.top) / k }; };
  const panel = document.querySelector('.w-coach-panel');
  const P = panel.getBoundingClientRect();
  const pts = [[.5, .5], [.1, .1], [.9, .1], [.1, .9], [.9, .9]].map(([x, y]) => document.elementFromPoint(P.left + x * P.width, P.top + y * P.height));
  const bg = getComputedStyle(panel).backgroundColor;
  const bar = document.querySelector('.w-bar');
  return { stageW: s.width / k, launcher: box(document.querySelector('.w-coach-launcher')), chapter: box(document.querySelector('.w-bar-chapter')),
    steps: [...document.querySelectorAll('.w-step')].map(box), bar: box(bar), barScroll: bar.scrollWidth > bar.clientWidth + 1,
    panel: box(panel), onTop: pts.every((e) => e && panel.contains(e)), opaque: !/rgba\(.*,\s*0?\.\d+\)$/.test(bg) && bg !== 'transparent',
    frame: !!panel.querySelector('iframe'), live: window.__l4.coach.isLive(),
    foot: [...document.querySelectorAll('.w-footer > button')].filter((b) => !b.hidden && b.getClientRects().length).map(box) };
};
const meet = (a, b) => a && b && a.r > b.l + 0.5 && a.l < b.r - 0.5 && a.b > b.t + 0.5 && a.t < b.b - 0.5;
for (const size of SIZES) {
  for (const id of SLICE.filter((x) => !ONLY.length || ONLY.includes(x))) {
    const page = await open(`?reset=1&screen=${id}`, size);
    const what = `${id} ${size.join('x')}`;
    await page.keyboard.press('Shift'); // any key stops a ghost hand (and the coach's own demo)
    const c = await page.evaluate(coachBoxes);
    const L = c.launcher;
    const w = L && Math.round(L.r - L.l), hg = L && Math.round(L.b - L.t);
    const steps = c.steps.filter(Boolean);
    expect(L && w === 56 && hg === 56 && L.t >= -0.5 && L.b <= 80.64 + 0.5 && L.l >= c.chapter.r + 17.5 && steps.every((st) => !meet(L, st)) && !c.barScroll && steps.every((st) => st.r <= c.stageW - 23 + 0.5),
      `${what} launcher: ${w}x${hg} at x ${L && Math.round(L.l)}, in the bar, after the chapter name, clear of the ${steps.length} steps, the bar's parts fit`);
    for (const dock of ['l', 'r']) {
      await page.evaluate((d) => { const co = window.__l4.coach; if (!co.isOpen()) co.open({ focus: false }); co.setDock(d); }, dock);
      await page.evaluate(() => new Promise((r) => setTimeout(r, 30)));
      const o = await page.evaluate(coachBoxes);
      const P = o.panel;
      const side = dock === 'l' ? Math.abs(P.l - 24) < 1 : Math.abs(o.stageW - P.r - 24) < 1;
      expect(P && P.t >= 96 - 0.5 && P.b <= 632 + 0.5 && Math.round(P.r - P.l) === 340 && side && o.onTop && o.opaque && !o.foot.some((B) => meet(P, B)) && !meet(P, o.bar),
        `${what} panel ${dock === 'l' ? 'left' : 'right'}: x ${Math.round(P.l)} to ${Math.round(P.r)}, y ${Math.round(P.t)} to ${Math.round(P.b)}, opaque and on top, clear of the bar and Previous / Next`);
      // the live coach is not wired in this lesson: no frame, never live
      expect(!o.frame && !o.live, `${what} ${dock === 'l' ? 'left' : 'right'}: offline tips only (no live coach frame)`);
      await measure(page, `${what} coach open ${dock === 'l' ? 'left' : 'right'}`);
    }
    expect(!page.errors.length, `${what} coach: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
    await page.close();
  }
}

console.log('\n  text/background pairs rendered (ratio, needed):');
for (const [k, v] of [...pairs.entries()].sort()) console.log(`       ${k.padEnd(34)} ${v.ratio.toFixed(2).padStart(5)}:1  >= ${v.need}  e.g. "${v.sample.replace('text:', '')}"`);

await browser.close();
server.close();
console.log(fails.length ? `\ntest:fit FAILED (${fails.length})` : '\ntest:fit passed');
process.exit(fails.length ? 1 : 0);
