// Keyboard-only walk through the slice in the approved look (P1.5). Puppeteer drives Tab, Shift+Tab,
// arrows, Enter, Space, Escape and typing only (one separate mouse check: a clicked wrong card shows
// no focus ring; its screenshot is s01-wrong.png). Covers the top bar's steps (NL1), the menu (open,
// navigate, Escape), the Intro (O1 title, O2 module map tabs, O3 goals, S01, S02), Chapter 1 (W1 neutral
// warm-up, V1 with its stops, K1 key idea, S03 wrong then right), the ghost hand (shown once, any key
// stops it, it never selects or tracks), then every later chapter. Asserts on every state:
//   the band equals the content JSON (state, verdict word, text, route buttons); Next locked (with
//   the reason as its aria-label) before the right answer or the save, unlocked and focused after;
//   focus lands on the instruction heading on each new screen; FT2 to FT4 routes land on the right screen;
//   the band never overlaps the screen's content and keeps its interaction area's width; nothing
//   clipped; contrast, text size and targets; one first-attempt tracking event per interaction id.
// Usage: npm run walk                 checks only
//        npm run walk -- --shots      checks + screenshots into review/p1.5/
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';
import { resolveChapterRefs, chapterNo } from '../src/util.js';

const SHOTS = process.argv.includes('--shots');
// --scorm (npm run test:scorm): the main path runs against the mock SCORM 1.2 API (tools/scorm-mock.js),
// then the SCORM data is checked and a relaunch with entry=resume must land on the saved place
const SCORM = process.argv.includes('--scorm');
const MOCK = readFileSync(join(ROOT, 'tools', 'scorm-mock.js'), 'utf8');
const OUT = join(ROOT, 'review', 'p1.5');
// FX3: the content as the lesson shows it ("{ch5}" -> 6)
const C = resolveChapterRefs(JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8')));
const UI = C.ui;
const S = Object.fromEntries(C.screens.map((s) => [s.id, s]));
const CH = Object.fromEntries(C.chapters.map((c) => [c.id, c]));
const opt = (sid, id) => S[sid].options.find((o) => o.id === id);
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));

const server = await startServer(0);
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const BASE = ORIGIN + '/index.html';
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
if (SHOTS) mkdirSync(OUT, { recursive: true });

async function open(query, { lms = null, motion = false } = {}) {
  const page = await browser.newPage();
  if (lms) await page.evaluateOnNewDocument(`${MOCK}\n;window.installScormMock(${JSON.stringify(lms)});`);
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  // reduced motion: no transitions, so every assertion and screenshot sees the settled state
  // (motion: true only for the ghost hand's animated demo)
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: motion ? 'no-preference' : 'reduce' }]);
  await page.goto(BASE + query, { waitUntil: /screen=V\d/.test(query) ? 'load' : 'networkidle0' }); // a film keeps a range request open
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  return page;
}
const shot = async (page, name) => { if (SHOTS) { await page.screenshot({ path: join(OUT, name) }); console.log('       shot ' + name); } };
// R1 (Chapter 2) screenshots go to review/r1/
const OUT_R1 = join(ROOT, 'review', 'r1');
if (SHOTS) mkdirSync(OUT_R1, { recursive: true });
const shotR1 = async (page, name) => { if (SHOTS) { await page.screenshot({ path: join(OUT_R1, name) }); console.log('       shot r1/' + name); } };
// R2 (Chapters 3 and 4, the video player) screenshots go to review/r2/
const OUT_R2 = join(ROOT, 'review', 'r2');
if (SHOTS) mkdirSync(OUT_R2, { recursive: true });
const shotR2 = async (page, name) => { if (SHOTS) { await page.mouse.move(5, 700); await page.screenshot({ path: join(OUT_R2, name) }); console.log('       shot r2/' + name); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// R3 (Chapters 5 and 6) screenshots go to review/r3/
const OUT_R3 = join(ROOT, 'review', 'r3');
if (SHOTS) mkdirSync(OUT_R3, { recursive: true });
const shotR3 = async (page, name) => { if (SHOTS) { await page.mouse.move(5, 700); await page.screenshot({ path: join(OUT_R3, name) }); console.log('       shot r3/' + name); } };

// Press a key on a focused new-tab link: returns the URL the new tab opened at, closes the tab and
// brings the lesson back to the front (the lesson itself must not move).
async function newTabFrom(p, key = 'Enter') {
  const created = new Promise((resolve) => browser.once('targetcreated', resolve));
  await press(p, key);
  const t = await Promise.race([created, wait(5000).then(() => null)]);
  let url = t ? t.url() : '';
  for (let i = 0; t && i < 20 && (!url || url === 'about:blank'); i++) { await wait(100); url = t.url(); }
  const tp = t ? await t.page().catch(() => null) : null;
  if (tp) await tp.close().catch(() => {});
  await p.bringToFront();
  return url;
}

// Where the ghost hand points now (its ripple centre, = the fingertip): whether that spot is on an
// option, and how far it is from the point the content's target names (src/ghost.js targetSteps:
// options-gap = between the first two options, options-centre = the centre of all the options).
async function ghostSpot(p, target) {
  return p.evaluate((target) => {
    const g = document.querySelector('.w-ghost-ripple')?.getBoundingClientRect();
    if (!g) return null;
    const c = { x: g.left + g.width / 2, y: g.top + g.height / 2 };
    const rs = [...document.querySelectorAll('.w-opt')].filter((el) => el.getClientRects().length).map((el) => el.getBoundingClientRect());
    const onOption = rs.some((o) => c.x >= o.left && c.x <= o.right && c.y >= o.top && c.y <= o.bottom);
    let want;
    const sheet = document.querySelector('.w-sheet:not([hidden])');
    const st = document.querySelector('.w-stage');
    const k = st.getBoundingClientRect().width / st.offsetWidth;
    const P = sheet?.getBoundingClientRect();
    const top = Math.min(...rs.map((r) => r.top)), bottom = Math.max(...rs.map((r) => r.bottom));
    // FX1 B1: the sweep starts just above the first option (the static hand with reduced motion), on the
    // options' right part (stacked) or their middle (a grid)
    if (target === 'options-sweep' || target === 'options-sweep-end') {
      const l = Math.min(...rs.map((r) => r.left)), r = Math.max(...rs.map((x) => x.right));
      want = { x: rs.some((x) => x.left > l + 1) ? (l + r) / 2 : r - 48, y: target === 'options-sweep' ? top - 14 * k : bottom + 18 * k };
    } else if (target === 'below-panel') want = { x: P.left + 26 * k, y: P.bottom + 22.7 * k };
    else if (target === 'gutter-left') want = { x: P.left - 7.3 * k, y: (top + bottom) / 2 };
    else if (target === 'gutter-low') want = { x: P.left - 4.7 * k, y: bottom + 45 * k };
    else if (target === 'options-gap') {
      const [a, b] = rs;
      want = b.top >= a.bottom - 1 ? { x: a.right - 48, y: (a.bottom + b.top) / 2 } : { x: (a.right + b.left) / 2, y: (a.top + a.bottom) / 2 };
    } else {
      want = { x: (Math.min(...rs.map((r) => r.left)) + Math.max(...rs.map((r) => r.right))) / 2, y: (Math.min(...rs.map((r) => r.top)) + Math.max(...rs.map((r) => r.bottom))) / 2 };
    }
    return { onOption, off: Math.round(Math.hypot(c.x - want.x, c.y - want.y)) };
  }, target);
}

// Sort, tray mode: select a tray card (Space), then a column (Enter), keyboard only.
// reselect: false when the card is still selected after a wrong column.

// The video player, keyboard only: play (time runs, caption = the marked transcript line), captions
// toggle, then for each stop: End on the seek slider stops exactly at the next open stop (never past
// it), the stop view opens with Resume locked; a wrong option, then the right one; Resume plays on.
// After the last stop End reaches the end and Next unlocks. Leaves focus on Next.
async function videoRun(p, id, { shotPlaying = null, shotStop = null, shotWrong = null, ghost = false } = {}) {
  const V = S[id];
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1 && document.querySelectorAll('.w-tline').length > 0);
  // FX2 A: the heading block (h1, the meta line, "Watch for:"), the film in a bounded frame, the player bar
  // under the picture (attached, as wide, not over it), on a clean ground (no photo)
  const head = await p.evaluate(() => {
    const f = document.querySelector('.w-frame').getBoundingClientRect(), c = document.querySelector('.w-controls').getBoundingClientRect();
    return { meta: document.querySelector('.w-video-meta').textContent, h1: document.querySelector('.w-video-head .w-instruction')?.textContent,
      guiding: document.querySelector('.w-guiding').textContent, src: document.querySelector('.w-video').getAttribute('src'),
      poster: document.querySelector('.w-video').getAttribute('poster'), markers: [...document.querySelectorAll('.w-seek-stop')].map((m) => parseFloat(m.style.left).toFixed(2)).join(),
      bar: Math.abs(c.top - f.bottom) < 1 && Math.abs(c.width - f.width) < 1 && Math.abs(c.left - f.left) < 1, ratio: f.width / f.height,
      centred: Math.abs((f.left + f.right) / 2 - window.innerWidth / 2) < 2, plain: document.querySelector('.w-stage').dataset.scene === 'plain' && !document.querySelector('.w-scene-photo') };
  });
  const wantMeta = V.title; // FX3: the title only (no length, no number of stops)
  expect(head.meta === wantMeta && head.h1 === V.instruction && head.guiding === `${V.guidingLabel || UI.video.guiding} ${V.guidingQuestion}` && head.src === V.media.src && head.poster === (V.media.poster || null)
    && head.markers === V.stops.map((s) => ((100 * s.t) / V.media.duration).toFixed(2)).join(),
  `${id}: heading block (h1, "${head.meta}", guiding question), video ${head.src} and poster ${head.poster} from content, one marker per stop on the timeline`);
  expect(head.bar && Math.abs(head.ratio - 16 / 9) < 0.01 && head.centred && head.plain, `${id}: a centred 16:9 frame, the player bar under it as wide, a clean ground (no photo)`);
  const trClosed = await p.evaluate(() => document.querySelector('.w-transcript').hidden && document.querySelector('.w-tr').getAttribute('aria-pressed') === 'false' && document.querySelector('.w-player').dataset.side === 'closed');
  await tabTo(p, '.w-tr');
  await press(p, 'Enter');
  const trOpen = await p.evaluate(() => {
    const f = document.querySelector('.w-frame').getBoundingClientRect(), t = document.querySelector('.w-transcript').getBoundingClientRect(), c = document.querySelector('.w-controls').getBoundingClientRect();
    return !document.querySelector('.w-transcript').hidden && document.querySelector('.w-tr').getAttribute('aria-pressed') === 'true' && document.querySelector('.w-player').dataset.side === 'open'
      && t.left >= f.right && Math.abs(t.top - f.top) < 1 && Math.abs(t.bottom - c.bottom) < 1;
  });
  expect(trClosed && trOpen, `${id}: the transcript starts closed; the button opens it right of the frame, as high as the frame and the bar`);
  await tabTo(p, '[data-action="play"]', { back: true });
  await press(p, 'Enter');
  // a real film can open on a title card: wait for the first caption (V1 speaks from 0:04)
  await p.waitForFunction(() => document.querySelector('.w-video').currentTime > 1 && !document.querySelector('.w-caption').hidden && document.querySelector('.w-caption').textContent, { timeout: 15000 }).catch(() => {});
  await wait(300);
  const pl = await p.evaluate(() => {
    const v = document.querySelector('.w-video'), cap = document.querySelector('.w-caption'), line = document.querySelector('.w-tline[aria-current="true"]');
    return { t: v.currentTime, paused: v.paused, cap: cap.hidden ? '' : cap.textContent, line: line ? line.lastChild.textContent : '', label: document.querySelector('[data-action="play"]').getAttribute('aria-label') };
  });
  expect(pl.t > 0.5 && !pl.paused && pl.cap && pl.cap === pl.line && pl.label === UI.video.pause,
    `${id} playing: time ${pl.t.toFixed(1)}s, caption "${pl.cap}" = the marked transcript line, button now "${pl.label}"`);
  if (shotPlaying) await shotR2(p, shotPlaying);
  await tabTo(p, '.w-cc');
  await press(p, 'Enter');
  const ccOff = await p.evaluate(() => document.querySelector('.w-caption').hidden && document.querySelector('.w-cc').getAttribute('aria-pressed') === 'false');
  await press(p, 'Enter');
  expect(ccOff && await p.evaluate(() => document.querySelector('.w-cc').getAttribute('aria-pressed') === 'true'), `${id}: the captions toggle hides and shows the caption (aria-pressed)`);
  await tabTo(p, '[data-action="play"]', { back: true });
  await press(p, 'Enter'); // pause
  for (let k = 0; k < V.stops.length; k++) {
    const stop = V.stops[k];
    await noSkipAhead(p, `${id} before stop ${k + 1}`);
    await fastPlay(p);
    await p.waitForSelector('.w-stop-view:not([hidden])', { timeout: 60000 });
    const st = await p.evaluate(() => ({ t: document.querySelector('.w-video').currentTime, q: document.querySelector('.w-stop-q').textContent, label: document.querySelector('.w-stop-kicker .w-glass-label').textContent,
      focus: document.activeElement.classList.contains('w-stop-q'), locked: document.querySelector('[data-action="resume"]').getAttribute('aria-disabled'),
      lockLabel: document.querySelector('[data-action="resume"]').getAttribute('aria-label'), paused: document.querySelector('.w-stop-kicker .w-chip-dark').textContent,
      tr: document.querySelector('.w-transcript').hidden, bar: !document.querySelector('.w-controls').hidden && document.querySelector('.w-controls').inert,
      // FX2 A4: the stop panel beside the picture: the frame and its bar uncovered
      clear: (() => { const P = document.querySelector('.w-stop-panel').getBoundingClientRect();
        return ['.w-frame', '.w-controls'].every((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.right <= P.left + 0.5; }); })() }));
    expect(Math.abs(st.t - stop.t) < 0.1, `${id} stop ${k + 1}: playback pauses at ${st.t.toFixed(2)}s = the stop (${stop.t}s)`);
    expect(st.q === stop.question && st.focus && st.locked === 'true' && st.lockLabel === UI.video.resumeLocked
      && st.label === UI.video.stopKicker.replace('{i}', k + 1).replace('{n}', V.stops.length) && st.paused === mmssW(stop.t) && st.tr && st.bar && st.clear,
    `${id} stop ${k + 1}: the panel "${st.label}" with the time chip ${st.paused} beside the picture (frame and bar uncovered), the transcript closed, question focused, Resume locked, the bar inert`);
    if (k === 0 && shotStop) await shotR2(p, shotStop);
    if (k === 0 && ghost) {
      // the ghost hand demonstrates the stop once: it points at the content's target (between the
      // first two options, on none of them) and selects nothing; a key removes it
      await p.waitForSelector('.w-ghost', { timeout: 3000 }).catch(() => {});
      const gh = await p.evaluate(() => ({ on: !!document.querySelector('.w-ghost'), showMe: !!document.querySelector('.w-stop-view [data-action="showMe"]'),
        marked: [...document.querySelectorAll('.w-stop-view .w-opt')].filter((b) => b.dataset.result).length }));
      const spot = await ghostSpot(p, V.ghost.target);
      await press(p, 'Shift');
      const gone = await p.evaluate(() => !document.querySelector('.w-ghost'));
      expect(gh.on && gh.showMe && !gh.marked && gone, `${id} stop 1 ghost hand: shown ("Show me how" on the stop card, FX1 B1), no option marked, a key removes it`);
      expect(V.ghost.target && spot && !spot.onOption && spot.off <= 2, `${id} stop 1 ghost hand: points at "${V.ghost.target}" (${spot?.off}px off), on no option`);
    }
    const wrongI = stop.options.findIndex((o) => !o.correct), rightI = stop.options.findIndex((o) => o.correct);
    await tabTo(p, `.w-stop-view .w-opt[data-id="${stop.options[wrongI].id}"]`);
    await press(p, 'Enter');
    await expectBand(p, `${id} stop ${k + 1} ${stop.options[wrongI].id}`, { state: 'wrong', text: stop.options[wrongI].feedback, unlocked: false, lockedWhy: UI.footer.locked.video });
    expect(await p.evaluate(() => document.querySelector('[data-action="resume"]').getAttribute('aria-disabled') === 'true'), `${id} stop ${k + 1} wrong: Resume stays locked`);
    if (k === 0) await expectLayout(p, `${id} stop wrong`);
    if (k === 0 && shotWrong) await shotR2(p, shotWrong);
    await press(p, rightI > wrongI ? 'ArrowDown' : 'ArrowUp', Math.abs(rightI - wrongI));
    await press(p, 'Enter');
    await expectBand(p, `${id} stop ${k + 1} ${stop.options[rightI].id}`, { state: 'correct', text: stop.options[rightI].feedback, unlocked: false });
    expect(await isActive(p, '[data-action="resume"]') && await p.evaluate(() => !document.querySelector('[data-action="resume"]').hasAttribute('aria-disabled')),
      `${id} stop ${k + 1} right: Resume unlocked and focused`);
    await press(p, 'Enter');
    await wait(400);
    const back = await p.evaluate(() => ({ view: document.querySelector('.w-stop-view').hidden, tr: !document.querySelector('.w-transcript').hidden, playing: !document.querySelector('.w-video').paused, focus: document.activeElement.dataset.action }));
    expect(back.view && back.tr && back.playing && back.focus === 'play', `${id} stop ${k + 1}: Resume closes the stop panel, the transcript comes back open as it was, the video plays on, focus on Play / Pause`);
    await press(p, 'Enter'); // pause
  }
  await noSkipAhead(p, `${id} after the last stop`);
  expect(await p.evaluate(() => document.querySelector('.w-next').dataset.locked === 'true'), `${id}: Next stays locked until the video is watched to the end`);
  await fastPlay(p);
  await p.waitForFunction(() => document.querySelector('.w-next').dataset.locked === 'false', { timeout: 60000 });
  expect(await isActive(p, '.w-next'), `${id}: every stop answered and the end reached: Next unlocked and focused`);
}
// End on the seek bar moves no further than the part already watched (never to a stop or the end)
async function noSkipAhead(p, where) {
  const before = await p.evaluate(() => document.querySelector('.w-video').currentTime);
  await tabTo(p, '.w-seek');
  await press(p, 'End');
  await wait(200);
  const r = await p.evaluate(() => ({ t: document.querySelector('.w-video').currentTime, note: document.querySelector('.w-controls [aria-live]').textContent, stop: !document.querySelector('.w-stop-view').hidden }));
  expect(r.t <= before + 0.5 && !r.stop && r.note === UI.video.seekAhead, `${where}: End on the seek bar stays at ${r.t.toFixed(1)}s, the part already watched ("${r.note}")`);
}
// tests only: play muted at 16x to reach the next stop or the end quickly
async function fastPlay(p) {
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
}
const mmssW = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const press = async (page, key, n = 1) => { for (let i = 0; i < n; i++) await page.keyboard.press(key); };
const shiftTab = async (page) => { await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift'); };
const isActive = (page, sel) => page.evaluate((s) => !!document.activeElement && document.activeElement.matches(s), sel);
// Tab (or Shift+Tab) until the focused element matches sel
async function tabTo(page, sel, { back = false, max = 40 } = {}) {
  for (let i = 0; i < max; i++) {
    if (await isActive(page, sel)) return true;
    if (back) await shiftTab(page); else await press(page, 'Tab');
  }
  const hit = await isActive(page, sel);
  if (!hit) fail(`keyboard could not reach ${sel}`);
  return hit;
}
// NL1: the band is the panel's hint row (the hint, the tool) and its feedback strip; the strip keeps
// the content's own message in data-text and data-verdict (its head is display only)
const band = (page) => page.evaluate(() => {
  const r = document.querySelector('.w-band'), s = r.querySelector('.w-strip');
  const hint = r.dataset.state === 'hint' || r.dataset.state === 'idle';
  return { state: r.dataset.state, verdict: hint ? '' : (s.dataset.verdict || ''), text: hint ? r.querySelector('.w-band-hint').textContent.trim() : (s.dataset.text || '').trim(),
    actions: [...r.querySelectorAll('.w-band-actions button')].map((b) => b.dataset.action), tool: [...r.querySelectorAll('.w-band-tool button')].map((b) => b.dataset.action),
    live: (hint ? r.querySelector('.w-band-hint') : r.querySelector('.w-band-live'))?.getAttribute('aria-live') };
});
const nextState = (page) => page.evaluate(() => { const n = document.querySelector('.w-next'); return { locked: n.dataset.locked === 'true', aria: n.getAttribute('aria-disabled'), label: n.getAttribute('aria-label') }; });
const screen = (page) => page.evaluate(() => window.__l4.current);
const opts = (page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.w-opt')].map((b) => [b.dataset.id, (b.dataset.result || '') + (b.getAttribute('aria-pressed') === 'true' ? '+pressed' : '')])));
const events = (page) => page.evaluate(() => window.__l4.tracking.events);
// the top bar (NL1): the chapter's name and its steps; the chapters' status from the progress model
const bar = (page) => page.evaluate(() => ({
  chapter: document.querySelector('.w-bar-title').textContent, of: document.querySelector('.w-bar-of').textContent,
  steps: [...document.querySelectorAll('.w-step')].map((s) => s.dataset.state + (s.getAttribute('aria-current') ? '*' : '') + ':' + s.querySelector('.w-step-label').textContent),
  status: window.__l4.progress().chapters.map((x) => x.status), pct: window.__l4.progress().percent,
}));

// band equals the JSON: state, verdict word, text, route buttons; Next locked or not
async function expectBand(page, what, { state, text, verdict = null, unlocked, actions = null, lockedWhy = null }) {
  const r = await band(page);
  const n = await nextState(page);
  const v = verdict ?? (state === 'correct' ? UI.feedback.correctPrefix : state === 'wrong' ? UI.feedback.wrongPrefix : '');
  const nextOk = unlocked ? (!n.locked && n.aria === null && n.label === null) : (n.locked && n.aria === 'true' && (!lockedWhy || n.label === lockedWhy));
  expect(r.state === state && r.verdict === v && r.text === text && r.live === 'polite' && nextOk && (!actions || actions.join() === r.actions.join()),
    `${what}: band ${r.state}${r.verdict ? ' "' + r.verdict + '"' : ''} text matches JSON${r.actions.length ? ' [' + r.actions.join(', ') + ']' : ''}, Next ${n.locked ? 'locked "' + n.label + '"' : 'unlocked'}`
    + (r.text !== text ? ` (got "${r.text}")` : '') + (!nextOk ? ' (Next state wrong)' : ''));
}
async function expectLayout(page, what) {
  const [good, detail] = layoutVerdict(await page.evaluate(measureLayout));
  expect(good, `${what}: ${detail}`);
}
// heading: the heading as shown when the screen fills its instruction in (NL4 S21R: the score line)
async function expectNewScreen(page, id, what, { heading = S[id].instruction } = {}) {
  const r = await page.evaluate(() => ({ id: window.__l4.current, focus: document.activeElement?.id, text: document.activeElement?.textContent }));
  expect(r.id === id && r.focus === 'w-instruction' && r.text === heading, `${what}: on ${id}, focus on the instruction heading "${r.text}"`);
}

/* ---------- main path ---------- */
console.log(SCORM ? '\nmain path in an LMS (mock SCORM 1.2 API)' : '\nmain path (debug=1)');
const page = await open('?reset=1&debug=1', { lms: SCORM ? {} : null });
if (SCORM) expect(await page.evaluate(() => window.__l4.tracking.mode) === 'scorm12', 'SCORM: the API is found, the scorm12 adapter runs');

// O1 title (dark): the Kit 13 bar (FX2 C: on every screen; its logo is the screen's), no footer; "Start the lesson" goes on
await expectNewScreen(page, 'O1', 'start');
const o1 = await page.evaluate(() => ({ footer: getComputedStyle(document.querySelector('.w-footer')).display, bar: !!document.querySelector('.w-bar').getClientRects().length,
  dark: document.querySelector('.w-stage').dataset.bar === 'dark', ownLogo: !!document.querySelector('.w-main img[src*="logo"]'),
  scene: document.querySelector('.w-stage').dataset.scene, photo: document.querySelector('.w-scene-photo')?.style.backgroundImage || '',
  quote: document.querySelector('.w-title-quote').textContent, program: document.querySelector('.w-title-program').textContent, start: document.querySelector('[data-action="start"]').textContent }));
expect(o1.footer === 'none' && o1.bar && o1.dark && !o1.ownLogo && o1.scene === 'title' && o1.photo.includes(S.O1.photo.src) && S.O1.quote.includes(o1.quote) && o1.program === S.O1.program + ' · ' + S.O1.kicker && o1.start === UI.buttons[S.O1.start],
  `O1: dark title scene with O1's photo under the dark Kit 13 bar (no logo of its own), no footer; programme line, quote (its marks drawn) and "${o1.start}" from content`);
await expectLayout(page, 'O1');
await tabTo(page, '[data-action="start"]');
await press(page, 'Enter');

// O2 module map: tabs by keyboard, L4 open on arrival, Next never locked; the ghost hand once on Lesson 1
await expectNewScreen(page, 'O2', 'O1 "Start the lesson"');
const tabState = () => page.evaluate(() => ({ sel: [...document.querySelectorAll('.w-map-tab')].map((t) => t.getAttribute('aria-selected') === 'true' ? t.dataset.station : '').join(''),
  panel: document.querySelector('.w-map-panel').dataset.station, text: document.querySelector('.w-map-panel-text').textContent, all: document.querySelector('.w-map-panel').textContent,
  role: document.querySelector('.w-map-tabs').getAttribute('role') }));
let mapTabs = await tabState();
expect(mapTabs.sel === 'l4' && mapTabs.panel === 'l4' && mapTabs.role === 'tablist' && mapTabs.text === S.O2.stations[2].text && mapTabs.all === mapTabs.text && !(await nextState(page)).locked,
  `O2: tablist, Lesson 4 open on arrival, the panel holds its line only ("${mapTabs.text}"), Next unlocked (presentation screen)`);
// FX1 D1: no ghost hand on O2; the "Click to open" cue on the first station not open, until one is opened
await wait(1200);
const o2cue = await page.evaluate(() => ({ ghost: !!document.querySelector('.w-ghost'), cue: document.querySelector('.w-map-cue')?.closest('.w-map-tab')?.dataset.station, text: document.querySelector('.w-map-cue')?.textContent,
  built: document.querySelectorAll('.w-map-tab.w-build').length }));
expect(!o2cue.ghost && o2cue.cue === 'l1' && o2cue.text === UI.moduleMap.clickToOpen && o2cue.built === S.O2.stations.length && await page.evaluate(() => document.querySelector('.w-map-panel').dataset.station === 'l4'),
  `O2: no ghost hand, "${o2cue.text}" on Lesson 1, the ${o2cue.built} stations build up one by one, Lesson 4 stays open`);
await expectLayout(page, 'O2');
await tabTo(page, '.w-map-tab[data-station="l4"]');
await press(page, 'ArrowLeft', 2);
expect(await isActive(page, '.w-map-tab[data-station="l1"]') && (await tabState()).panel === 'l4', 'O2: arrow keys move the focus along the stations without opening them');
await press(page, 'Enter');
mapTabs = await tabState();
expect(mapTabs.sel === 'l1' && mapTabs.panel === 'l1' && mapTabs.text === S.O2.stations[0].text && await page.evaluate(() => !document.querySelector('.w-map-cue')),
  `O2: Enter opens Lesson 1 ("${mapTabs.text}"), the "Click to open" cue is gone`);
await press(page, 'End');
await press(page, ' ');
expect((await tabState()).panel === 'l6', 'O2: End then Space opens Lesson 6');
await tabTo(page, '.w-next');
await press(page, 'Enter');

// O3 goals: deliverable, five tiles, the full goal as the tile's tip on keyboard focus
await expectNewScreen(page, 'O3', 'O2 Next');
const o3 = await page.evaluate(() => ({ d: document.querySelector('.w-deliverable-text').textContent, label: !!document.querySelector('.w-deliverable-label'), tiles: [...document.querySelectorAll('.w-goal-label')].map((t) => t.textContent) }));
expect(o3.d === S.O3.deliverable.text && o3.label === !!S.O3.deliverable.label && o3.tiles.join() === S.O3.goals.map((g) => g.label).join() && !(await nextState(page)).locked,
  `O3: deliverable (label ${o3.label ? 'shown' : 'none'}) and ${o3.tiles.length} goal tiles from content, Next unlocked`);
// FX1 D2: the tiles are tabs; goal 1 open on arrival, its full wording in the card under the tiles, no tooltip
const goalCard = () => page.evaluate(() => ({ text: document.querySelector('.w-goal-panel .w-map-panel-text').textContent, goal: document.querySelector('.w-goal-panel').dataset.goal,
  sel: [...document.querySelectorAll('.w-goal')].filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.dataset.goal).join(), tip: !!document.querySelector('.w-tip:not([hidden])') }));
let g3 = await goalCard();
expect(g3.goal === 'g1' && g3.sel === 'g1' && g3.text === S.O3.goals[0].text && !g3.tip, `O3: goal 1 open on arrival, its full goal in the card under the tiles ("${g3.text}"), no tooltip`);
await tabTo(page, '.w-goal[data-goal="g1"]');
await press(page, 'ArrowRight', 4);
await press(page, 'Enter');
g3 = await goalCard();
expect(g3.goal === 'g5' && g3.text === S.O3.goals[4].text && !g3.tip, `O3: arrows then Enter open goal 5 ("${g3.text}")`);
await expectLayout(page, 'O3');
await tabTo(page, '.w-next');
await press(page, 'Enter');

await expectNewScreen(page, 'S01', 'O3 Next');
await expectBand(page, 'S01 before action', { state: 'hint', text: S.S01.hint, unlocked: false, lockedWhy: UI.footer.locked.single });
const img = await page.evaluate(() => ({ scene: document.querySelector('.w-stage').dataset.scene, photo: document.querySelector('.w-scene-photo')?.style.backgroundImage || '',
  quote: document.querySelector('.w-quote-glass .w-quote-1')?.textContent, attrib: document.querySelector('.w-quote-glass .w-attrib')?.textContent }));
expect(img.scene === 'stage' && img.photo.includes(CH.ch0.photo.src) && img.quote === S.S01.stage.top.bubbles.at(-1) && await page.evaluate(() => document.querySelector('.w-sheet .w-context').textContent) === S.S01.stage.top.context && img.attrib === S.S01.stage.top.label + ' · ' + UI.fictionalBadge,
  `S01 Stage: the chapter photo (${CH.ch0.photo.src}), Dana's quote on glass with "${img.attrib}", the context line in the third person`);
await expectLayout(page, 'S01 hint');
await shot(page, 's01-hint.png');

// the top bar at the start: the chapter's name and its steps from content (done / current / to come)
let rl = await bar(page);
const stepsOf = (c) => CH[c].screens.map((id) => S[id].step.verb);
expect(rl.chapter === CH.ch0.title && rl.steps.join() === stepsOf('ch0').map((v, i) => (i < 3 ? 'done:' : i === 3 ? 'current*:' : 'next:') + v).join()
  && rl.status.join() === 'current,locked,locked,locked,locked,locked,locked' && rl.pct === 3,
  `top bar at S01: "${rl.chapter}", steps ${rl.steps.join(' ')} (aria-current on the current step); chapters ${rl.status.join(' ')}, ${rl.pct}%`);
// FX1 (Kit 13): "Chapter 1 of 7" above the name; on Stage the photo runs behind the dark bar
const kit = await page.evaluate(() => { const b = getComputedStyle(document.querySelector('.w-bar')); const p = document.querySelector('.w-scene-photo').getBoundingClientRect(); return { bg: b.backgroundColor, top: p.top }; });
expect(rl.of === 'Chapter 1 of 7' && kit.bg === 'rgba(12, 28, 40, 0.42)' && kit.top <= 0,
  `top bar (Kit 13) on Stage: "${rl.of}" above the name, the bar ${kit.bg} over the photo (photo top ${Math.round(kit.top)})`);

// menu: open, trap, Escape
await tabTo(page, '.w-bar-menu', { back: true });
await press(page, 'Enter');
let menu = await page.evaluate(() => ({
  open: !document.querySelector('.w-menu-overlay').hidden, inPanel: document.querySelector('.w-panel').contains(document.activeElement), focus: document.activeElement.className,
  role: document.querySelector('.w-panel').getAttribute('role'), modal: document.querySelector('.w-panel').getAttribute('aria-modal'), expanded: document.querySelector('.w-bar-menu').getAttribute('aria-expanded'),
  title: document.querySelector('.w-panel-title').textContent, extras: document.querySelectorAll('.w-panel-pct, .w-panel-bar, .w-chapter-meta, [data-action="goals"], [data-action="lesson1Cases"]').length,
  links: [...document.querySelectorAll('.w-panel-foot button')].map((b) => b.dataset.action).join(),
  list: [...document.querySelectorAll('.w-chapter')].map((c) => c.dataset.status + ':' + c.querySelector('.w-menu-disc').textContent + ':' + c.querySelector('.w-chapter-title').textContent + (c.getAttribute('aria-current') ? '*' : '')),
}));
expect(menu.open && menu.inPanel && menu.focus === 'w-panel-close' && menu.role === 'dialog' && menu.modal === 'true' && menu.expanded === 'true',
  'Enter on the bar\'s menu button opens the menu (dialog, aria-modal), focus on Close');
expect(menu.title === C.lesson.title && !menu.extras && menu.links === 'help,startover'
  && menu.list.join() === C.chapters.map((c, i) => (i ? 'locked' : 'current') + ':' + (c.n + 1) + ':' + c.title + (i ? '' : '*')).join(),
  `menu: "${menu.title}", the seven chapters with their status only (numbered, no %, times or resources), foot ${menu.links}: ${menu.list.join(' | ')}`);
let trapped = true;
for (let i = 0; i < 30; i++) { await press(page, 'Tab'); trapped = trapped && await page.evaluate(() => document.querySelector('.w-panel').contains(document.activeElement)); }
for (let i = 0; i < 8; i++) { await shiftTab(page); trapped = trapped && await page.evaluate(() => document.querySelector('.w-panel').contains(document.activeElement)); }
expect(trapped, 'menu: focus stays trapped (30 Tab, 8 Shift+Tab)');
await tabTo(page, '.w-panel [data-action="help"]');
await press(page, 'Enter');
const help = await page.evaluate(() => ({ items: document.querySelectorAll('.w-dialog .w-help li').length, focus: document.activeElement.dataset.action }));
await press(page, 'Escape');
expect(help.items === UI.help.length && help.focus === 'close' && await isActive(page, '.w-panel [data-action="help"]'), `menu Help: ${help.items} lines in a dialog, Escape returns focus to Help`);
await tabTo(page, '.w-panel [data-action="startover"]');
await press(page, 'Enter');
const confirm = await page.evaluate(() => document.querySelector('.w-dialog')?.getAttribute('role') === 'alertdialog' && document.activeElement.dataset.action === 'cancel');
await press(page, 'Escape');
expect(confirm && await isActive(page, '.w-panel [data-action="startover"]'), 'menu Start over: in-page confirm, focus on Cancel, Escape cancels');
await press(page, 'Escape');
expect(await page.evaluate(() => document.querySelector('.w-menu-overlay').hidden && document.activeElement.classList.contains('w-bar-menu')
  && document.querySelector('.w-bar-menu').getAttribute('aria-expanded') === 'false'), 'Escape closes the menu, focus returns to the menu button');

// S01: wrong then right
const attemptOf = (p) => p.evaluate(() => { const a = document.querySelector('.w-attempts'); return a && !a.hidden && a.getClientRects().length ? a.textContent : ''; });
expect(await attemptOf(page) === UI.attempts.label.replace('{i}', 1).replace('{n}', 2) && await page.evaluate(() => document.querySelector('.w-quote-glass .w-card-tools [data-action="showMe"]')?.textContent) === UI.buttons.showMe,
  'S01: "Show me how" and "Attempt 1 of 2" on the quote\'s glass card (FX1 B1, B2; the panel is at its 41cqw limit)');
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S01 wrong (a)', { state: 'wrong', text: opt('S01', 'a').feedback, unlocked: false });
let o = await opts(page);
expect(o.a === 'wrong' && o.b === '' && o.c === '' && await attemptOf(page) === 'Attempt 2 of 2', `S01 wrong: the chosen card is marked wrong, the others stay plain, "Attempt 2 of 2" (${JSON.stringify(o)})`);
await expectLayout(page, 'S01 wrong');
expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'), 'S01 wrong by keyboard: the focus ring shows on the card');
await press(page, 'ArrowDown');
expect(await isActive(page, '.w-opt[data-id="b"]'), 'S01 ArrowDown moves focus to option b');
await press(page, 'Enter');
await expectBand(page, 'S01 correct (b)', { state: 'correct', text: opt('S01', 'b').feedback, unlocked: true });
expect(await isActive(page, '.w-next'), 'S01 correct: focus moves to Next');
await expectLayout(page, 'S01 correct');
await shot(page, 's01-correct.png');
await press(page, 'Enter');

// S02
await expectNewScreen(page, 'S02', 'S01 Next');
const s02top = await page.evaluate(() => { const a = document.querySelector('[data-action="homework1"]'), q = document.querySelector('[data-action="homeworkHelp"]');
  const tip = (q.getAttribute('aria-describedby') || '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
  return { label: document.querySelector('.w-open-head .w-context').textContent, help: q.textContent + ' ' + tip, sub: document.querySelector('.w-subline').textContent, hw1: a ? a.href : null, target: a?.target }; });
expect(s02top.label === S.S02.stage.top.text && s02top.help === S.S02.stage.middle.help.text && s02top.sub === S.S02.hint && s02top.hw1 === C.links.homework1 && (!s02top.hw1 || s02top.target === '_blank'),
  `S02: context line, the hint under the heading, the help question as a button with its answer as the tooltip, ${C.links.homework1 ? 'Open Homework 1 link' : 'no Homework 1 link (links.homework1 is null)'}`);
await expectBand(page, 'S02 before action', { state: 'hint', text: S.S02.hint, unlocked: false, lockedWhy: UI.footer.locked.input });
// FX1 D4: the context line and heading above the panel; Save the primary filled button, locked until
// both fields have text; the locked Next reads "Save to continue"
const s02lock = () => page.evaluate(() => ({ save: document.querySelector('[data-action="save"]').disabled, cls: document.querySelector('[data-action="save"]').className,
  next: document.querySelector('.w-next').textContent.trim(), above: !document.querySelector('.w-sheet').contains(document.querySelector('.w-instruction')) }));
let s02l = await s02lock();
expect(s02l.save && s02l.cls.includes('w-btn-primary') && s02l.next === S.S02.lockedNext && s02l.above,
  `S02: heading above the panel, Save primary and locked while the fields are empty, the locked Next reads "${s02l.next}"`);
await expectLayout(page, 'S02 empty');
const TITLE = 'Sales call summaries', PROBLEM = 'Today reps write call summaries by hand, and it hurts because notes reach the CRM a day late.';
await tabTo(page, '.w-input[data-store="L4_CASE_TITLE"]', { back: true });
await page.keyboard.type('  ' + TITLE + ' ');
expect((await s02lock()).save, 'S02: one field filled, Save still locked');
await press(page, 'Tab');
expect(await isActive(page, '.w-input[data-store="L4_CASE_PROBLEM"]'), 'S02 Tab moves to the second field');
await page.keyboard.type(PROBLEM);
const s02 = await page.evaluate(() => ({
  counters: [...document.querySelectorAll('.w-counter')].map((c) => c.textContent),
  max: [...document.querySelectorAll('.w-input')].map((i) => i.maxLength),
  described: [...document.querySelectorAll('.w-input')].every((i) => i.getAttribute('aria-describedby').split(' ').every((id) => document.getElementById(id))),
  labelled: [...document.querySelectorAll('.w-input')].every((i) => document.querySelector(`label[for="${i.id}"]`)),
}));
const cnt = (n, max) => UI.counter.replace('{n}', n).replace('{max}', max);
expect(s02.counters.join() === `${cnt(TITLE.length + 3, 60)},${cnt(PROBLEM.length, 250)}` && s02.max.join() === '60,250' && s02.described && s02.labelled,
  `S02 fields: labelled, maxlength 60 (title) and 250 (problem), live counters ${s02.counters.join(' and ')}, aria-describedby counter + privacy line`);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S02 saved', { state: 'neutral', text: S.S02.feedback.saved, unlocked: true });
expect(await page.evaluate(() => document.querySelector('.w-next').textContent.trim()) === UI.footer.next, 'S02 saved: Next reads "Next" again');
const saved = await page.evaluate(() => ({ badge: document.querySelector('.w-saved').hidden, f: window.__l4.state.f }));
expect(saved.badge && saved.f.L4_CASE_TITLE === TITLE && saved.f.L4_CASE_PROBLEM === PROBLEM, 'S02 saved: no "Not saved" badge in the bar (shown only when saving fails), values stored trimmed under L4_CASE_TITLE and L4_CASE_PROBLEM');
expect(await isActive(page, '.w-next'), 'S02 saved: focus moves to Next');
await expectLayout(page, 'S02 saved');
await shot(page, 's02.png');
await press(page, 'Enter');

// W1 warm-up: a neutral guess (no right or wrong marks), the guess can change (a retry), Next after a pick
await expectNewScreen(page, 'W1', 'S02 Next');
await expectBand(page, 'W1 before action', { state: 'hint', text: S.W1.hint, unlocked: false, lockedWhy: UI.footer.locked.warmup });
const w1 = await page.evaluate(() => ({ role: document.querySelector('.w-guesses').getAttribute('role'), panel: document.querySelector('.w-warmup-panel').textContent,
  skip: !!document.querySelector('[data-action="skipChallenge"]') }));
const w1p = await page.evaluate(() => document.querySelector('.w-sheet-title')?.textContent);
expect(w1.role === 'radiogroup' && w1.panel.includes(S.W1.panel.title) && w1.panel.includes(S.W1.panel.chip) && w1.panel.includes(S.W1.instruction) && w1p === UI.warmup.prompt && !w1.skip,
  `W1: the question on the glass card ("${S.W1.panel.title}", "${S.W1.panel.chip}"), the panel "${w1p}" and a radio group, no Skip`);
await expectLayout(page, 'W1 hint');
await shot(page, 'w1.png');
await tabTo(page, '.w-guess[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'W1 guess a', { state: 'guess', verdict: S.W1.feedback.verdict, text: S.W1.feedback.text, unlocked: true });
await tabTo(page, '.w-guess[data-id="a"]', { back: true });
await press(page, 'ArrowDown');
await press(page, ' ');
const guess = await page.evaluate(() => [...document.querySelectorAll('.w-guess')].map((b) => b.getAttribute('aria-checked') + ':' + b.querySelector('.w-guess-tag').textContent + ':' + (b.dataset.result || '')).join('|'));
expect(guess === `false::|true:${UI.warmup.guess}:|false::` && await isActive(page, '.w-next'), `W1: the guess moved to b ("${UI.warmup.guess}"), no right or wrong marks, focus on Next (${guess})`);
await expectLayout(page, 'W1 guess');
await press(page, 'Enter');

// V1 with its "Watch for" line; the ghost hand shows at stop 1 (any key removes it)
await expectNewScreen(page, 'V1', 'W1 Next');
expect(await page.evaluate(() => document.querySelector('.w-guiding b').textContent) === S.V1.guidingLabel, `V1: "${S.V1.guidingLabel}" line above the player`);
await videoRun(page, 'V1', { ghost: true });
await press(page, 'Enter'); // Next

// K1 key idea: presentation screen, the figures carry their meaning in their labels
await expectNewScreen(page, 'K1', 'V1 Next');
const k1 = await page.evaluate(() => ({ bg: document.querySelector('.w-stage').dataset.scene, label: document.querySelector('.w-key-label').textContent,
  ev: document.querySelector('.w-evidence').textContent,
  figs: [...document.querySelectorAll('.w-fig')].map((f) => f.getAttribute('role') + ':' + f.getAttribute('aria-label')), caps: [...document.querySelectorAll('.w-fig-caption')].map((c) => c.textContent) }));
expect(k1.bg === 'focus' && k1.label === S.K1.label + (S.K1.topic ? '· ' + S.K1.topic : '') && k1.ev === S.K1.evidence.text + S.K1.evidence.source && k1.figs.join() === S.K1.figures.map((f) => 'img:' + f.alt).join() && k1.caps.join() === S.K1.figures.map((f) => f.caption).join() && !(await nextState(page)).locked,
  `K1: key idea on the ${k1.bg} wash, "${k1.label}" pill, two figures (role img with the meaning as label), Next unlocked`);
await expectLayout(page, 'K1');
await shot(page, 'k1.png');
await tabTo(page, '.w-next');
await press(page, 'Enter');

// S03 and the top bar in chapter 1 (no skipping: V1 was watched)
await expectNewScreen(page, 'S03', 'K1 Next');
rl = await bar(page);
expect(rl.chapter === CH.ch1.title && rl.steps.join() === stepsOf('ch1').map((v, i) => (i < 3 ? 'done:' : 'current*:') + v).join() && rl.status[0] === 'done' && rl.status[1] === 'current' && rl.pct === 12, // NL4: Chapters 5 and 6 at 57 and 15 minutes (the total from 193 to 168)
  `top bar in chapter 1: "${rl.chapter}", steps ${rl.steps.join(' ')}; ${CH.ch0.title} ${rl.status[0]}, ${CH.ch1.title} ${rl.status[1]}, ${rl.pct}%`);
// the ghost hand on S03 never selects or checks anything, and tracks nothing
const s03g = await page.evaluate(async () => {
  for (let i = 0; i < 30 && !document.querySelector('.w-ghost'); i++) await new Promise((r) => setTimeout(r, 100));
  const shown = !!document.querySelector('.w-ghost');
  await new Promise((r) => setTimeout(r, 300));
  return { shown, hidden: document.querySelector('.w-ghost')?.getAttribute('aria-hidden'), seen: window.__l4.state.h,
    pressed: [...document.querySelectorAll('.w-opt')].filter((b) => b.getAttribute('aria-pressed') === 'true').length,
    check: document.querySelector('[data-action="check"]').disabled, ev: window.__l4.tracking.events.filter((e) => e.trackingId === 'L4_S03_1').length,
    showMe: document.querySelector('[data-action="showMe"]')?.textContent, icon: !!document.querySelector('[data-action="showMe"] svg') };
});
const s03spot = await ghostSpot(page, S.S03.ghost.target);
expect(s03spot && !s03spot.onOption && s03spot.off <= 2, `S03 ghost hand: points at "${S.S03.ghost.target}" (${s03spot?.off}px off), on no card`);
await press(page, 'Shift');
expect(s03g.shown && s03g.hidden === 'true' && s03g.seen.includes('s') && !s03g.pressed && s03g.check && !s03g.ev && await page.evaluate(() => !document.querySelector('.w-ghost')),
  `S03 ghost hand: shown once (aria-hidden, seen types "${s03g.seen}"), selects no card, Check stays disabled, no tracking; a key removes it`);
expect(s03g.showMe === UI.buttons.showMe && s03g.icon, `S03: "${s03g.showMe}" beside the heading (FX1 B1: every practice screen)`);
await expectBand(page, 'S03 before action', { state: 'hint', text: S.S03.hint, unlocked: false, lockedWhy: UI.footer.locked.multi });
const s03ctx = await page.evaluate(() => ({ ctx: document.querySelector('.w-sheet .w-context').textContent, cases: document.querySelectorAll('.w-case').length }));
expect(s03ctx.ctx === S.S03.stage.top.text && !s03ctx.cases, 'S03: the context line from content; no video-case stills (left out in the frame)');
await expectLayout(page, 'S03 hint');
await shot(page, 'rail-ch1.png');
const term = await page.evaluate(() => {
  const d = document.querySelector('.w-opt[data-id="d"]');
  const desc = (d.getAttribute('aria-describedby') || '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
  return { desc, dotted: !!d.querySelector('.w-term-static'), nested: d.querySelectorAll('a, button, input, [tabindex]').length };
});
expect(term.desc === C.tooltips['Success metric'] && term.dotted && !term.nested, 'S03 term on the "No success metric" card: aria-describedby definition, dotted underline, no nested focusable');
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, ' ');
await press(page, 'ArrowRight');
await press(page, ' ');
o = await opts(page);
expect(o.a === '+pressed' && o.b === '+pressed' && await page.evaluate(() => !document.querySelector('[data-action="check"]').disabled), 'S03 Space selects a, ArrowRight + Space selects b, Check enabled at 2');
await press(page, 'ArrowRight');
await press(page, ' ');
expect(!(await opts(page)).c.includes('pressed'), 'S03 a third card cannot be selected while two are');
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
await expectBand(page, 'S03 Check a + b', { state: 'partial', verdict: UI.feedback.oneOfTwo, text: opt('S03', 'a').feedback, unlocked: false });
o = await opts(page);
expect(o.a === 'wrong' && o.b === 'correct+pressed' && await isActive(page, '.w-opt[data-id="a"]'),
  'S03 after Check: a red and deselected, b teal and kept ("One of two." in the neutral strip), focus on a');
await expectLayout(page, 'S03 one of two');
await shot(page, 's03-one-of-two.png');
await tabTo(page, '.w-opt[data-id="d"]');
await press(page, ' ');
o = await opts(page);
expect(o.a === '' && o.b === '+pressed' && o.d === '+pressed', `S03 retry: marks cleared, b and d selected (${JSON.stringify(o)})`);
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
await expectBand(page, 'S03 Check b + d', { state: 'correct', text: S.S03.feedbackCorrect, unlocked: true });
o = await opts(page);
expect(o.b === 'correct+pressed' && o.d === 'correct+pressed' && o.a === '' && o.c === '' && await isActive(page, '.w-next') && !(await band(page)).tool.length,
  'S03 right: both keys teal, Check gone, focus on Next');
await expectLayout(page, 'S03 correct');
await shot(page, 's03-correct.png');
await press(page, 'Enter');

const SKETCH = { trigger: 'A rep finishes a sales call', steps: 'Rep types notes by hand; the manager reads them two days later', output: 'A call summary, to the sales manager' };
const METRIC_PARTS = { baseline: 'About 2 days from call to summary', target: 'Same day', date: 'within 3 months' };
const NOTES = { aifit: 'Sort call notes by topic', human: 'Approve a discount for a key account' };
/* ---------- Chapter 2 (NL2, storyboard v3): every interaction wrong then right, keyboard only ---------- */
console.log('\nchapter 2 (keyboard)');
// W2 warm-up: a neutral guess, as W1
await expectNewScreen(page, 'W2', 'S03 Next (no pause marker: one Next moves on)');
await expectBand(page, 'W2 before action', { state: 'hint', text: S.W2.hint, unlocked: false, lockedWhy: UI.footer.locked.warmup });
rl = await bar(page);
expect(rl.chapter === CH.ch2.title && rl.of === 'Chapter 3 of 7' && rl.steps.map((s) => s.split(':')[1]).join() === 'Guess,Learn,Sort,Read,Label,Decide,Explore,Spot,Sketch' && rl.steps[0].startsWith('current*'),
  `top bar in chapter 2: "${rl.of}" "${rl.chapter}", steps ${rl.steps.join(' ')}`);
expect(await page.evaluate(() => document.querySelector('.w-warmup-panel').textContent).then((t) => t.includes(S.W2.instruction) && t.includes(S.W2.panel.chip)),
  'W2: the question on the glass card with "Not scored"');
await expectLayout(page, 'W2 hint');
await tabTo(page, '.w-guess[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'W2 guess a', { state: 'guess', verdict: S.W2.feedback.verdict, text: S.W2.feedback.text, unlocked: true });
expect(await isActive(page, '.w-next'), 'W2 guess: focus on Next');
await press(page, 'Enter');

// K2 key idea: three parts, the HR case toggle (aria-pressed), Next never locked
await expectNewScreen(page, 'K2', 'W2 Next');
const k2 = () => page.evaluate(() => ({ pressed: document.querySelector('[data-action="caseToggle"]').getAttribute('aria-pressed'),
  titles: [...document.querySelectorAll('.w-part-title')].map((x) => x.textContent).join(),
  cases: [...document.querySelectorAll('.w-part-case')].map((x) => (x.hidden ? '' : x.querySelector('.w-part-case-text').textContent)).join() }));
let kk = await k2();
expect(kk.pressed === 'false' && kk.titles === S.K2.parts.map((p) => p.title).join() && kk.cases === ',,' && !(await nextState(page)).locked,
  `K2: three parts (${kk.titles}), the HR case hidden, Next unlocked (presentation screen)`);
await expectLayout(page, 'K2');
await tabTo(page, '[data-action="caseToggle"]');
await press(page, 'Enter');
kk = await k2();
expect(kk.pressed === 'true' && kk.cases === S.K2.parts.map((p) => p.case).join(), `K2 toggle: aria-pressed true, each card shows its HR case line (${kk.cases})`);
await expectLayout(page, 'K2 HR case on');
await tabTo(page, '.w-next');
await press(page, 'Enter');

// S04 sort deck: the ghost hand (first drag), then the keyboard: 1 to 3 chooses, Enter drops, Escape cancels
await expectNewScreen(page, 'S04', 'K2 Next');
await expectBand(page, 'S04 before action', { state: 'hint', text: S.S04.hint, unlocked: false, lockedWhy: UI.footer.locked.sortDeck });
await page.waitForSelector('.w-ghost', { timeout: 3000 }).catch(() => {});
const s04g = await page.evaluate(() => ({ hand: !!document.querySelector('.w-ghost'), showMe: !!document.querySelector('.w-task-head [data-action="showMe"]'), ev: window.__l4.tracking.events.filter((e) => e.trackingId === 'L4_S04_1').length }));
await press(page, 'Shift');
expect(s04g.hand && s04g.showMe && !s04g.ev && await page.evaluate(() => !document.querySelector('.w-ghost')), 'S04 ghost hand: shown on first use, "Show me" beside the heading, nothing tracked; a key stops it');
const deckState = () => page.evaluate(() => ({ text: document.querySelector('.w-deck-text').textContent, count: document.querySelector('.w-deck-count').textContent,
  placed: [...document.querySelectorAll('.w-drop-cards')].map((u) => u.children.length).join(), chosen: [...document.querySelectorAll('.w-drop')].map((d) => (d.dataset.chosen === 'true' ? 'x' : '-')).join(''),
  pressed: document.querySelector('[data-action="card"]').getAttribute('aria-pressed'), live: document.querySelector('.w-sdeck [aria-live]').textContent }));
let ds = await deckState();
expect(ds.text === S.S04.cards[0].text && ds.count === '1 of 5' && ds.placed === '0,0,0', `S04 start: card 1 "${ds.text}", "${ds.count}", the columns empty`);
await expectLayout(page, 'S04 start');
await tabTo(page, '[data-action="card"]');
await press(page, '2');
ds = await deckState();
expect(ds.chosen === '-x-' && ds.pressed === 'true' && ds.live === UI.drag.chosen.replace('{target}', S.S04.columns[1].label), `S04 key 2: Steps chosen and announced ("${ds.live}")`);
await press(page, 'Escape');
ds = await deckState();
expect(ds.chosen === '---' && ds.pressed === 'false' && ds.live === UI.drag.cancelled && await isActive(page, '[data-action="card"]'), 'S04 Escape cancels (announced), focus stays on the card');
// FX1 E2 (check after all): every drop places the card as it is (no mark, no verdict), the next card
// comes up; Check unlocks with the deck empty; the wrong cards return with their line; attempt 2
const checkState = () => page.evaluate(() => { const c = document.querySelector('[data-action="check"]'); return c ? (c.disabled ? 'locked' : 'open') : 'none'; });
await press(page, '2');
await press(page, 'Enter');
await expectBand(page, 'S04 card 1 in Steps (placed, not checked)', { state: 'hint', text: S.S04.hint, unlocked: false });
ds = await deckState();
expect(ds.text === S.S04.cards[1].text && ds.count === '2 of 5' && ds.placed === '0,1,0' && await page.evaluate(() => !!document.querySelector('.w-placed[data-state="pending"]')) && await checkState() === 'locked' && await isActive(page, '[data-action="card"]'),
  'S04 a drop: the card sits in Steps unmarked, card 2 comes up and takes the focus, Check locked until the deck is empty');
const COL = { a: 1, b: 2, c: 3 };
for (const card of S.S04.cards.slice(1)) { await press(page, String(COL[card.column])); await press(page, 'Enter'); }
expect(await checkState() === 'open' && await isActive(page, '[data-action="check"]') && await attemptOf(page) === 'Attempt 1 of 2', 'S04 deck empty: Check unlocked and focused, "Attempt 1 of 2"');
await press(page, 'Enter');
await expectBand(page, 'S04 Check (card 1 wrong)', { state: 'wrong', text: S.S04.cards[0].feedback.b, unlocked: false });
ds = await deckState();
expect(ds.text === S.S04.cards[0].text && ds.count === '1 of 1' && ds.placed === '1,2,1' && await attemptOf(page) === 'Attempt 2 of 2' && await isActive(page, '[data-action="card"]'),
  `S04 after Check: the right cards keep their check (${ds.placed}), card 1 is back on the deck with its line for Steps, "Attempt 2 of 2", focus on the card`);
// NL3 follow-up (critical detail 4): the counter of a two-line card stays visible while the strip shows
const s04vis = await page.evaluate(() => {
  const c = document.querySelector('.w-deck-count').getBoundingClientRect(), s = document.querySelector('.w-float .w-strip').getBoundingClientRect(), t = document.querySelector('.w-deck-text').getClientRects().length;
  const lines = Math.round(document.querySelector('.w-deck-text').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('.w-deck-text')).lineHeight));
  return { lines, clear: c.right <= s.left || c.left >= s.right || c.bottom <= s.top || c.top >= s.bottom, t };
});
expect(s04vis.lines === 2 && s04vis.clear, `S04 a two-line card (${s04vis.lines} lines) with the wrong strip: the counter "${ds.count}" stays clear of the strip`);
await expectLayout(page, 'S04 wrong');
await press(page, '1');
await press(page, 'Enter');
await press(page, 'Enter'); // Check (focused)
ds = await deckState();
await expectBand(page, 'S04 attempt 2 right', { state: 'correct', text: UI.feedback.allPlaced, unlocked: true });
expect(ds.placed === '2,2,1' && await page.evaluate(() => document.querySelectorAll('.w-placed[data-state="right"]').length === 5) && await isActive(page, '.w-next'), `S04 done: placed per column ${ds.placed}, every card checked, Next unlocked and focused`);
await expectLayout(page, 'S04 done');
await press(page, 'Enter');

// S05a key idea: the BPMN diagram with three numbered markers and the key
await expectNewScreen(page, 'S05a', 'S04 Next');
const s05a = await page.evaluate(() => ({ markers: document.querySelectorAll('.w-bpmn-marker').length, key: [...document.querySelectorAll('.w-bpmn-key li p')].map((p) => p.textContent).join('|'),
  gate: [...document.querySelectorAll('.w-bpmn-label')].map((x) => x.textContent).join(), alt: document.querySelector('.w-bpmn').getAttribute('aria-label') }));
expect(s05a.markers === 3 && s05a.key === S.S05a.key.map((k) => k.text).join('|') && s05a.gate.includes('Within policy?') && s05a.alt === C.diagrams.hr.alt && !(await nextState(page)).locked,
  'S05a: three markers, the key from content, the gateway "Within policy?", the diagram as an image with its description, Next unlocked');
await expectLayout(page, 'S05a');
await tabTo(page, '.w-next');
await press(page, 'Enter');

// S05b labels onto the diagram: Event wrong then right (it stays picked up), then the other two
await expectNewScreen(page, 'S05b', 'S05a Next');
await expectBand(page, 'S05b before action', { state: 'hint', text: S.S05b.hint, unlocked: false, lockedWhy: UI.footer.locked.label });
await page.waitForSelector('.w-ghost', { timeout: 3000 }).catch(() => {});
expect(await page.evaluate(() => !!document.querySelector('.w-ghost') && !!document.querySelector('.w-task-head [data-action="showMe"]')), 'S05b ghost hand: shown on the first label task, "Show me" beside the heading');
await press(page, 'Shift');
const lbl = (id) => S.S05b.labels.find((l) => l.id === id);
// NL3 follow-up: the places are named by position for screen readers, never by shape (the shapes are the answers)
const s05bNames = await page.evaluate(() => document.querySelector('.w-bpmn').getAttribute('aria-label'));
const SHAPES = /diamond|circle|swimlane|gateway|event/i;
expect(!S.S05b.targets.some((t) => SHAPES.test(t.name)) && !SHAPES.test(s05bNames) && s05bNames === S.S05b.diagramAlt,
  `S05b: the three places and the diagram's description name positions, no shapes ("${S.S05b.targets.map((t) => t.name).join('", "')}")`);
await tabTo(page, '.w-label-card[data-label="event"]');
await press(page, '1');
expect(await page.evaluate(() => document.querySelector('.w-board > .w-sr-only[aria-live]').textContent) === UI.drag.chosen.replace('{target}', S.S05b.targets[0].name), 'S05b key 1: the place is announced by its position');
await press(page, 'Enter');
// FX1 E2: placed as it is (no mark), the label leaves the tray; all three placed, then Check
await expectBand(page, 'S05b Event on the lane (placed)', { state: 'hint', text: S.S05b.hint, unlocked: false });
expect(await page.evaluate(() => document.querySelector('.w-label-card[data-label="event"]').hidden && document.querySelector('.w-target[data-target="a"]').dataset.placed === 'pending')
  && await isActive(page, '.w-label-card[data-label="swimlane"]'), 'S05b a drop: the label sits on the place unmarked, it leaves the tray, focus on the next label');
await press(page, '2');
await press(page, 'Enter');
await press(page, '3');
await press(page, 'Enter');
expect(await isActive(page, '[data-action="check"]'), 'S05b tray empty: focus on Check');
await press(page, 'Enter');
await expectBand(page, 'S05b Check (all three wrong)', { state: 'wrong', text: lbl('swimlane').feedback.wrong, unlocked: false });
expect(await page.evaluate(() => [...document.querySelectorAll('.w-label-card')].every((c) => !c.hidden) && !document.querySelector('.w-target[data-placed]')) && await attemptOf(page) === 'Attempt 2 of 2' && await isActive(page, '.w-label-card[data-label="swimlane"]'),
  'S05b after Check: the three labels are back in the tray, the first one\'s line in the strip, "Attempt 2 of 2"');
await expectLayout(page, 'S05b wrong');
await press(page, '1');
await press(page, 'Enter');
await press(page, '2');
await press(page, 'Enter');
await press(page, '3');
await press(page, 'Enter');
await press(page, 'Enter'); // Check
await expectBand(page, 'S05b done', { state: 'correct', verdict: '', text: UI.feedback.allPlaced, unlocked: true });
expect(await page.evaluate(() => [...document.querySelectorAll('.w-target')].every((t) => t.dataset.placed === 'right')) && await isActive(page, '.w-next'), 'S05b attempt 2 right: every place solid teal with its label and a check, Next unlocked and focused');
await expectLayout(page, 'S05b done');
await press(page, 'Enter');

// S06 one situation at a time: wrong then right, "Next situation", wrong then right
await expectNewScreen(page, 'S06', 'S05b Next');
const sit = (k, id) => S.S06.situations[k].options.find((o) => o.id === id);
const sitState = () => page.evaluate(() => ({ kicker: document.querySelector('.w-situation-now .w-sit-kicker').textContent, done: document.querySelectorAll('.w-sit-done').length, hint: document.querySelector('.w-hintline').textContent }));
let st6 = await sitState();
expect(st6.kicker === 'Situation 1 of 2' && !st6.done && st6.hint === S.S06.situations[0].hint, `S06: "${st6.kicker}", its hint under the heading`);
await expectBand(page, 'S06 before action', { state: 'hint', text: S.S06.situations[0].hint, unlocked: false, lockedWhy: UI.footer.locked.pair });
await tabTo(page, '.w-opt[data-id="b"]');
await press(page, 'Enter');
await expectBand(page, 'S06 situation 1 b', { state: 'wrong', text: sit(0, 'b').feedback, unlocked: false });
await press(page, 'ArrowLeft');
await press(page, 'Enter');
await expectBand(page, 'S06 situation 1 a', { state: 'correct', text: sit(0, 'a').feedback, unlocked: false, actions: ['nextSituation'] });
expect(await isActive(page, '[data-action="nextSituation"]'), `S06 situation 1 right: focus on "${UI.buttons.nextSituation}"`);
await expectLayout(page, 'S06 situation 1 right');
await press(page, 'Enter');
st6 = await sitState();
expect(st6.kicker === 'Situation 2 of 2' && st6.done === 1 && st6.hint === S.S06.situations[1].hint && await isActive(page, '.w-situation-now .w-opt[data-id="a"]'),
  'S06: situation 1 becomes a small done card, situation 2 comes in with its hint, focus on its first answer');
await press(page, 'Enter');
await expectBand(page, 'S06 situation 2 a', { state: 'wrong', text: sit(1, 'a').feedback, unlocked: false });
await expectLayout(page, 'S06 situation 2 wrong');
await press(page, 'ArrowRight');
await press(page, 'Enter');
await expectBand(page, 'S06 situation 2 b', { state: 'correct', text: sit(1, 'b').feedback, unlocked: true });
expect(await isActive(page, '.w-next'), 'S06 both right: Next unlocked and focused');
await press(page, 'Enter');

// S07 eight tiles: open each (one at a time, the counter), then the question
await expectNewScreen(page, 'S07', 'S06 Next');
await expectBand(page, 'S07 before action', { state: 'hint', text: S.S07.hint, unlocked: false, lockedWhy: UI.footer.locked.tiles });
await page.waitForSelector('.w-ghost', { timeout: 3000 }).catch(() => {});
expect(await page.evaluate(() => !!document.querySelector('.w-ghost') && !!document.querySelector('.w-task-head [data-action="showMe"]') && !document.querySelector('.w-tile[data-open="true"]')),
  'S07 ghost hand: shown once, "Show me how" beside the heading, no tile counts as opened');
await press(page, 'Shift');
const tileState = () => page.evaluate(() => ({ open: [...document.querySelectorAll('.w-tile')].filter((t) => t.dataset.open === 'true').map((t) => t.dataset.n).join(),
  done: [...document.querySelectorAll('.w-tile-disc')].filter((d) => d.querySelector('svg')).length, sub: document.querySelector('.w-task-sub').textContent, h1: document.querySelector('#w-instruction').textContent }));
let ts = await tileState();
expect(ts.sub === '0/8' && !ts.open, `S07: counter "${ts.sub}", every tile closed`);
await tabTo(page, '.w-tile[data-n="1"]');
for (let n = 1; n <= 8; n++) {
  await press(page, 'Enter');
  ts = await tileState();
  if (ts.open !== String(n) || (n < 8 && ts.sub !== `${n}/8`) || (n < 8 && ts.done !== n - 1)) fail(`S07 tile ${n}: open "${ts.open}", counter "${ts.sub}", done ${ts.done}`);
  if (n === 3) await expectLayout(page, 'S07 three opened');
  if (n < 8) await press(page, 'ArrowRight');
}
ts = await tileState();
expect(ts.h1 === S.S07.question && ts.sub === S.S07.questionHint && ts.open === '8', `S07: after all eight the heading is the question ("${ts.h1}"), tile 8 stays open to read`);
await expectBand(page, 'S07 question unlocked', { state: 'hint', text: S.S07.questionHint, unlocked: false });
await press(page, 'Escape');
ts = await tileState();
expect(!ts.open && await page.evaluate(() => [...document.querySelectorAll('.w-tile-mark')].every((m) => getComputedStyle(m).display !== 'none')), 'S07 Escape closes the open tile; every tile shows its answer marker');
await expectLayout(page, 'S07 question');
await press(page, 'ArrowLeft');
await press(page, 'Enter');
await expectBand(page, 'S07 answer 7', { state: 'wrong', text: S.S07.tiles[6].feedback, unlocked: false });
await press(page, 'ArrowRight');
await press(page, 'Enter');
await expectBand(page, 'S07 answer 8', { state: 'correct', text: S.S07.tiles[7].feedback, unlocked: true });
expect(await isActive(page, '.w-next'), 'S07 right: Next unlocked and focused');
await expectLayout(page, 'S07 correct');
await press(page, 'Enter');

// S08 three rounds under the rules band
await expectNewScreen(page, 'S08', 'S07 Next');
await expectBand(page, 'S08 before action', { state: 'hint', text: S.S08.hint, unlocked: false, lockedWhy: UI.footer.locked.rounds });
// FX1 E6: the three rules are three icon cards (the answers), the map line in the map strip under them
expect(await page.evaluate(() => [...document.querySelectorAll('.w-rule-card .w-rule-name')].map((n) => n.textContent).join('|')) === S.S08.rules.items.join('|')
  && await page.evaluate(() => !document.querySelector('.w-rules') && !!document.querySelector('.w-map-strip .w-round-line')), 'S08: the three rule cards from content, the map line in the map strip, no rules band');
const roundState = () => page.evaluate(() => ({ badge: document.querySelector('.w-field-chip').textContent, line: document.querySelector('.w-round-line').textContent, count: document.querySelector('.w-round-count').textContent }));
for (let k = 0; k < S.S08.rounds.length; k++) {
  const R = S.S08.rounds[k];
  const rs = await roundState();
  expect(rs.badge === R.badge && rs.line === `“${R.line}”` && rs.count === `Round ${k + 1} of 3`, `S08 round ${k + 1}: chip "${rs.badge}", the line in quotes, "${rs.count}"`);
  if (k === 0) {
    await tabTo(page, '.w-opt[data-id="a"]');
    await press(page, 'Enter');
    await expectBand(page, 'S08 round 1 a', { state: 'wrong', text: R.feedback.a, unlocked: false });
    await expectLayout(page, 'S08 round 1 wrong');
    await press(page, 'ArrowDown');
  } else {
    expect(await isActive(page, '.w-opt[data-id="a"]'), `S08 round ${k + 1}: focus on the first rule`);
    await press(page, 'ArrowDown', { a: 0, b: 1, c: 2 }[R.correct]);
  }
  await press(page, 'Enter');
  const last = k === S.S08.rounds.length - 1;
  await expectBand(page, `S08 round ${k + 1} right`, { state: 'correct', text: R.feedback[R.correct], unlocked: last, actions: last ? [] : ['nextRound'] });
  expect(await page.evaluate((c) => [...document.querySelectorAll('.w-rule-card')].filter((b) => b.dataset.lit === 'true').map((b) => b.dataset.id).join(), R.correct) === R.correct, `S08 round ${k + 1} right: the broken rule's card lights up`);
  if (!last) { expect(await isActive(page, '[data-action="nextRound"]'), `S08 round ${k + 1} right: focus on "${UI.buttons.nextRound}"`); await press(page, 'Enter'); }
}
expect(await isActive(page, '.w-next'), 'S08 round 3 right: Next unlocked and focused');
await expectLayout(page, 'S08 round 3 right');
await press(page, 'Enter');

// S08B the case sketch: Save locked while empty (NL4 E1), then the three parts, Save
await expectNewScreen(page, 'S08B', 'S08 Next');
await expectBand(page, 'S08B before action', { state: 'hint', text: '', unlocked: false, lockedWhy: UI.footer.locked.input });
await filledSave(page, 'S08B');
await tabTo(page, '.w-input[data-store="L4_CASE_TRIGGER"]', { back: true });
await page.keyboard.type(SKETCH.trigger);
await press(page, 'Tab');
await page.keyboard.type(SKETCH.steps);
await press(page, 'Tab');
await page.keyboard.type(SKETCH.output);
const s08b = await page.evaluate(() => ({ counters: [...document.querySelectorAll('.w-counter')].map((c) => c.textContent).join(), max: [...document.querySelectorAll('.w-input')].map((i) => i.maxLength).join(), arrows: document.querySelectorAll('.w-chain-arrow').length }));
expect(s08b.max === '120,250,120' && s08b.arrows === 2 && s08b.counters === `${cnt(SKETCH.trigger.length, 120)},${cnt(SKETCH.steps.length, 250)},${cnt(SKETCH.output.length, 120)}`,
  `S08B: three fields on a line with two arrows, maxlength 120 / 250 / 120, counters ${s08b.counters}`);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S08B saved', { state: 'neutral', text: S.S08B.feedback.saved, unlocked: true });
const sk = await page.evaluate(() => window.__l4.state.f);
expect(sk.L4_CASE_TRIGGER === SKETCH.trigger && sk.L4_CASE_STEPS === SKETCH.steps && sk.L4_CASE_OUTPUT === SKETCH.output && await isActive(page, '.w-next'), 'S08B saved: stored under L4_CASE_TRIGGER / _STEPS / _OUTPUT, focus on Next');
await expectLayout(page, 'S08B saved');
await press(page, 'Enter');

/* ---------- Chapters 3 and 4 (R2): every interaction wrong then right, the V2 stops, seek blocked ---------- */
console.log('\nchapters 3 and 4 (keyboard)');
// W3 warm-up (NL3: replaces FT3 and its routing): a neutral guess, as W1 and W2
await expectNewScreen(page, 'W3', 'S08B Next (no pause marker)');
rl = await bar(page);
expect(rl.status[2] === 'done' && rl.status[3] === 'current' && rl.chapter === CH.ch3.title, `after chapter 2: Toolkit ${rl.status[2]}, HR demo ${rl.status[3]}, the bar shows "${rl.chapter}", ${rl.pct}%`);
expect(rl.steps.map((s) => s.split(':')[1]).join() === stepsOf('ch3').join() && rl.steps[0].startsWith('current*'), `top bar in chapter 3: steps ${rl.steps.join(' ')}`);
await expectBand(page, 'W3 before action', { state: 'hint', text: S.W3.hint, unlocked: false, lockedWhy: UI.footer.locked.warmup });
expect(await page.evaluate(() => document.querySelector('.w-warmup-panel').textContent).then((t) => t.includes(S.W3.instruction) && t.includes(S.W3.panel.chip)) && !(await page.evaluate(() => document.querySelector('.w-memo'))),
  'W3: the question on the glass card with "Not scored", no fast-track memo');
await expectLayout(page, 'W3 hint');
await tabTo(page, '.w-guess[data-id="c"]');
await press(page, 'Enter');
await expectBand(page, 'W3 guess c', { state: 'guess', verdict: S.W3.feedback.verdict, text: S.W3.feedback.text, unlocked: true });
expect(await isActive(page, '.w-next'), 'W3 guess: focus on Next');
await press(page, 'Enter');

// V2: play, captions and transcript, three stops (each wrong then right), seek never past an open stop
await expectNewScreen(page, 'V2', 'W3 Next');
const v2Next = await nextState(page);
expect(v2Next.locked && v2Next.label === UI.footer.locked.video && !(await page.evaluate(() => !!document.querySelector('.w-main .w-band'))),
  `V2 before play: no band in the play view, Next locked "${v2Next.label}"`);
await videoRun(page, 'V2', { shotPlaying: 'v2-playing.png', shotWrong: 'v2-stop-wrong.png' });
await press(page, 'Enter'); // Next

// S09 sort deck (NL3) with the explain band beside the deck: card 1 wrong then right, the rest right
await expectNewScreen(page, 'S09', 'V2 Next');
const card = (sid, k) => S[sid].cards.find((c) => String(c.id ?? c.n) === String(k));
await deckRun(page, 'S09', { wrong: 'b', band: true });

// The sort deck by keyboard (S09, S16, S17; S04 has its own steps above): the band, the counter
// never under the strip, the first card dropped on the wrong column (it returns, its line in the
// strip), then on its own; the other cards placed with 1 to n + Enter; Next unlocked and focused.
// NL4 E1 / E2 on an input screen: the filled navy Save, locked while a required field is empty; the
// locked Next reads "Save to continue"; the "Your case" card at the top of the panel shows the case title
async function filledSave(p, sid) {
  const r = await p.evaluate(() => { const s = document.querySelector('[data-action="save"]');
    return { save: s.disabled, primary: s.classList.contains('w-btn-primary'), next: document.querySelector('.w-next').textContent.trim(), card: document.querySelector('.w-sheet .w-case-slim')?.textContent }; });
  expect(r.save && r.primary && r.next === S[sid].lockedNext && r.card === TITLE,
    `${sid}: the "Your case" card ("${r.card}"), the filled Save locked while empty, the locked Next reads "${r.next}"`);
}

async function deckRun(p, sid, { wrong, band: withBand = false }) {
  const Sx = S[sid];
  await expectBand(p, `${sid} before action`, { state: 'hint', text: Sx.hint, unlocked: false, lockedWhy: UI.footer.locked.sortDeck });
  await press(p, 'Shift'); // a seen ghost hand waits 8 s; nothing to stop, nothing tracked
  const head = await p.evaluate(() => ({ chip: document.querySelector('.w-head-chip')?.textContent || '', sub: document.querySelector('.w-task-sub')?.textContent || '',
    band: document.querySelector('.w-deck-band')?.textContent || '', cols: [...document.querySelectorAll('.w-drop')].map((d) => d.querySelector('.w-drop-title').textContent + '|' + (d.querySelector('.w-drop-sub')?.textContent || '')).join(';') }));
  const wantBand = withBand ? Sx.band.label + Sx.band.items.map((x, k) => `${k + 1}${x.term}: ${x.text}`).join('') : ''; // the numbers stay in the DOM (aria-hidden, not drawn beside the deck)
  expect(head.chip === (Sx.header || '') && head.sub === (Sx.hintShown ? Sx.hint : '') && head.band.replace(/\s+/g, ' ') === wantBand.replace(/\s+/g, ' ')
    && head.cols === Sx.columns.map((c) => c.label + '|' + (c.sub || '')).join(';'),
    `${sid}: head${Sx.header ? ' with the field chip "' + Sx.header + '"' : ''}${Sx.hintShown ? ', the hint under the heading' : ''}${withBand ? ', the explain band beside the deck' : ''}, ${Sx.columns.length} columns from content`);
  await tabTo(p, '[data-action="card"]');
  const COLS = Object.fromEntries(Sx.columns.map((c, k) => [c.id, String(k + 1)]));
  const c1 = Sx.cards[0];
  // FX1 E2: card 1 on the wrong column, the rest right; Check; card 1 comes back with its line
  await press(p, COLS[wrong]);
  await press(p, 'Enter');
  await expectBand(p, `${sid} card 1 on ${wrong} (placed)`, { state: 'hint', text: Sx.hint, unlocked: false });
  for (const c of Sx.cards.slice(1)) { await press(p, COLS[c.column]); await press(p, 'Enter'); }
  expect(await isActive(p, '[data-action="check"]'), `${sid} deck empty: focus on Check`);
  await press(p, 'Enter');
  await expectBand(p, `${sid} Check, card 1 on ${wrong}`, { state: 'wrong', text: c1.feedback[wrong] || c1.feedback.wrong, unlocked: false });
  const vis = await p.evaluate(() => {
    const c = document.querySelector('.w-deck-count').getBoundingClientRect(), s = document.querySelector('.w-float .w-strip').getBoundingClientRect();
    return { text: document.querySelector('.w-deck-text').textContent, count: document.querySelector('.w-deck-count').textContent, clear: c.right <= s.left || c.left >= s.right || c.bottom <= s.top || c.top >= s.bottom };
  });
  expect(vis.text === c1.text && vis.count === '1 of 1' && vis.clear && await attemptOf(p) === 'Attempt 2 of 2' && await isActive(p, '[data-action="card"]'),
    `${sid} after Check: card 1 back on the deck with its line, the counter "${vis.count}" visible beside the strip, "Attempt 2 of 2", focus on the card`);
  await expectLayout(p, `${sid} wrong`);
  await press(p, COLS[c1.column]);
  await press(p, 'Enter');
  await press(p, 'Enter'); // Check
  await expectBand(p, `${sid} done`, { state: 'correct', text: UI.feedback.allPlaced, unlocked: true });
  const placed = await p.evaluate(() => [...document.querySelectorAll('.w-drop-cards')].map((u) => u.children.length).join());
  expect(placed === Sx.columns.map((col) => Sx.cards.filter((c) => c.column === col.id).length).join() && await isActive(p, '.w-next'), `${sid} done: placed per column ${placed}, Next unlocked and focused`);
  await expectLayout(p, `${sid} done`);
  await press(p, 'Enter');
}

// FX2 D1 (S17), keyboard: one case at a time; case 1 on a wrong mistake (its line, "Attempt 2 of 2"),
// then the right one and "Next case"; the other cases right on the first pick; Next after the last
async function casesRun(p, sid, { wrong }) {
  const Sx = S[sid];
  await expectBand(p, `${sid} before action`, { state: 'hint', text: Sx.hint, unlocked: false, lockedWhy: UI.footer.locked.cases });
  await press(p, 'Shift');
  for (const [k, c] of Sx.cards.entries()) {
    const head = await p.evaluate(() => ({ kicker: document.querySelector('.w-case-now .w-sit-kicker').textContent, text: document.querySelector('.w-case-now-text').textContent,
      opts: [...document.querySelectorAll('.w-opt')].map((b) => b.dataset.id).join() }));
    expect(head.kicker === UI.progress.caseOf.replace('{i}', k + 1).replace('{n}', Sx.cards.length) && head.text === c.text && head.opts === Sx.options.map((o) => o.id).join(),
      `${sid} case ${k + 1}: "${head.kicker}", the case "${head.text.slice(0, 30)}...", the ${Sx.options.length} mistakes as answer cards`);
    if (k === 0) {
      await tabTo(p, `.w-opt[data-id="${wrong}"]`);
      await press(p, 'Enter');
      await expectBand(p, `${sid} case 1 on ${wrong}`, { state: 'wrong', text: c.feedback.wrong, unlocked: false });
      expect(await attemptOf(p) === 'Attempt 2 of 2', `${sid} case 1 wrong: "Attempt 2 of 2"`);
      await expectLayout(p, `${sid} wrong`);
    }
    await tabTo(p, `.w-opt[data-id="${c.column}"]`);
    await press(p, 'Enter');
    const last = k === Sx.cards.length - 1;
    await expectBand(p, `${sid} case ${k + 1} right`, { state: 'correct', text: c.feedback.correct, unlocked: last });
    if (last) break;
    expect(await isActive(p, '[data-action="nextCase"]'), `${sid} case ${k + 1} right: focus on "${UI.buttons.nextCase}"`);
    await press(p, 'Enter');
  }
  expect(await isActive(p, '.w-next'), `${sid} done: Next unlocked and focused`);
  await expectLayout(p, `${sid} done`);
  await press(p, 'Enter');
}

// FX2 D2 (S18A), keyboard: the four rows (a select each) reached by Tab; two cards swapped, Check (the
// first wrong row's line, "Attempt 2 of 2"), the swap undone, Check: every field right, Next
async function fieldsRun(p, sid) {
  const Sx = S[sid];
  await expectBand(p, `${sid} before action`, { state: 'hint', text: Sx.hint, unlocked: false, lockedWhy: UI.footer.locked.fields });
  const rows = await p.evaluate(() => [...document.querySelectorAll('.w-wb-field')].map((r) => r.querySelector('.w-wb-label').textContent + '|' + r.querySelector('.w-wb-sub').textContent
    + '|' + [...r.querySelectorAll('option')].map((o) => o.textContent).join('/')).join(';'));
  // FX3: the cards as a lettered list (A to D) before the rows; each select lists the same letter and text
  const L = (i) => String.fromCharCode(65 + i);
  const list = await p.evaluate(() => [...document.querySelectorAll('.w-card-list .w-card-item')].map((li) => li.querySelector('.w-kc-letter').textContent + '|' + li.lastElementChild.lastChild.textContent).join(';'));
  expect(rows === Sx.columns.map((c) => `${c.label}|${c.sub}|${[UI.chooseCard, ...Sx.cards.map((x, i) => `${L(i)}. ${x.text}`)].join('/')}`).join(';') && await p.evaluate(() => document.querySelector('[data-action="check"]').disabled)
    && list === Sx.cards.map((x, i) => `${L(i)}|${x.text}`).join(';'),
    `${sid}: the ${Sx.cards.length} cards as a lettered list (${list}); ${Sx.columns.length} workbook rows from content, each a select of the same lettered cards; Check locked`);
  const key = (c) => String(c.id ?? c.n);
  const pick = { ...Object.fromEntries(Sx.cards.map((c) => [c.column, key(c)])) };
  [pick.a, pick.b] = [pick.b, pick.a]; // card 1 in row b, card 2 in row a
  for (const c of Sx.columns) { await tabTo(p, `select[data-row="${c.id}"]`); await p.select(`select[data-row="${c.id}"]`, pick[c.id]); }
  expect(await p.evaluate(() => !document.querySelector('[data-action="check"]').disabled), `${sid}: every row filled, Check unlocked`);
  await tabTo(p, '[data-action="check"]');
  await press(p, 'Enter');
  const owner = (col) => Sx.cards.find((c) => c.column === col);
  await expectBand(p, `${sid} Check, two rows wrong`, { state: 'wrong', text: owner('a').feedback.wrong, unlocked: false });
  const marks = await p.evaluate(() => [...document.querySelectorAll('.w-wb-field')].map((r) => r.dataset.result).join());
  expect(marks === 'wrong,wrong,correct,correct' && await attemptOf(p) === 'Attempt 2 of 2' && await isActive(p, 'select[data-row="a"]'),
    `${sid} after Check: rows ${marks}, "Attempt 2 of 2", focus on the first wrong row`);
  await expectLayout(p, `${sid} wrong`);
  await p.select('select[data-row="a"]', key(owner('a')));
  await p.select('select[data-row="b"]', key(owner('b')));
  await tabTo(p, '[data-action="check"]');
  await press(p, 'Enter');
  await expectBand(p, `${sid} done`, { state: 'correct', text: UI.feedback.allPlaced, unlocked: true });
  expect(await isActive(p, '.w-next'), `${sid} done: Next unlocked and focused`);
  await expectLayout(p, `${sid} done`);
  await press(p, 'Enter');
}

// S10 fill Field 7
await expectNewScreen(page, 'S10', 'S09 Next');
await expectBand(page, 'S10 before action', { state: 'hint', text: S.S10.hint, unlocked: false, lockedWhy: UI.footer.locked.fill });
await tabTo(page, '.w-opt[data-id="d"]');
await press(page, 'Enter');
await expectBand(page, 'S10 d', { state: 'wrong', text: opt('S10', 'd').feedback, unlocked: false });
expect(await page.evaluate(() => document.querySelector('.w-field-slot').textContent) === opt('S10', 'd').label, 'S10: the chosen line goes into the Field 7 slot');
await press(page, 'ArrowLeft');
await press(page, 'Enter');
await expectBand(page, 'S10 c', { state: 'correct', text: opt('S10', 'c').feedback, unlocked: true });
await expectLayout(page, 'S10 right');
await shotR2(page, 's10.png');
await press(page, 'Enter');

// S11 metric with the three slots
await expectNewScreen(page, 'S11', 'S10 Next');
const slotState = () => page.evaluate(() => [...document.querySelectorAll('.w-slot')].map((x) => x.dataset.on).join());
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S11 a', { state: 'wrong', text: opt('S11', 'a').feedback, unlocked: false });
expect(await slotState() === 'false,false,true', `S11 a: Checkable later? Baseline / Target / Date = ${await slotState()}`);
await expectLayout(page, 'S11 wrong');
await shotR2(page, 's11.png');
await press(page, 'ArrowDown', 3);
await press(page, 'Enter');
await expectBand(page, 'S11 d', { state: 'correct', text: opt('S11', 'd').feedback, unlocked: true });
expect(await slotState() === 'true,true,true', 'S11 d: all three slots light up');
await press(page, 'Enter');

// S12 the full map, two risk flags by keyboard: flag 1 on Field 3 (wrong, it stays picked up), then
// on Field 4; flag 2 on Field 7
await expectNewScreen(page, 'S12', 'S11 Next');
const fieldOf = (n) => S.S12.map.find((t) => t.n === n);
await expectBand(page, 'S12 before action', { state: 'hint', text: S.S12.hint, unlocked: false, lockedWhy: UI.footer.locked.map });
const s12 = await page.evaluate(() => ({ context: document.querySelector('.w-task-head .w-context').textContent, fields: [...document.querySelectorAll('.w-map-field')].map((f) => f.dataset.target + ':' + f.querySelector('b').textContent).join(),
  flags: [...document.querySelectorAll('.w-flag-card')].map((c) => c.getAttribute('aria-label')).join('|') }));
expect(s12.context === S.S12.context && s12.fields === S.S12.map.map((f) => f.n + ':' + f.title).join() && s12.flags === 'Risk flag 1 of 2|Risk flag 2 of 2',
  `S12: "${s12.context}", the eight fields in reading order, two flags ("${s12.flags}")`);
await tabTo(page, '.w-flag-card[data-flag="r1"]');
await press(page, '3');
expect(await page.evaluate(() => document.querySelector('.w-board > .w-sr-only[aria-live]').textContent) === UI.drag.chosen.replace('{target}', UI.drag.fieldName.replace('{n}', 3).replace('{title}', 'Steps')), 'S12 key 3: "Field 3, Steps chosen" announced');
await press(page, 'Enter');
// FX1 E2: placed as it is, then flag 2 on Field 7, Check: flag 1 comes back with Field 3's line
await expectBand(page, 'S12 flag 1 on Field 3 (placed)', { state: 'hint', text: S.S12.hint, unlocked: false });
expect(await page.evaluate(() => document.querySelector('.w-map-field[data-target="3"]').dataset.placed === 'pending' && document.querySelector('.w-flag-card[data-flag="r1"]').hidden) && await isActive(page, '.w-flag-card[data-flag="r2"]'),
  'S12 a drop: Field 3 holds the flag unmarked, the flag leaves the tray, focus on the second flag');
await press(page, '7');
await press(page, 'Enter');
expect(await isActive(page, '[data-action="check"]'), 'S12 both flags placed: focus on Check');
await press(page, 'Enter');
await expectBand(page, 'S12 Check, flag 1 on Field 3', { state: 'wrong', text: fieldOf(3).feedback, unlocked: false });
expect(await page.evaluate(() => !document.querySelector('.w-flag-card[data-flag="r1"]').hidden && !document.querySelector('.w-map-field[data-target="3"]').dataset.placed && document.querySelector('.w-map-field[data-target="7"]').dataset.placed === 'right')
  && await attemptOf(page) === 'Attempt 2 of 2' && await isActive(page, '.w-flag-card[data-flag="r1"]'),
  'S12 after Check: Field 7 teal with its check, flag 1 back in the tray with Field 3\'s line, "Attempt 2 of 2"');
await expectLayout(page, 'S12 wrong');
await press(page, '4');
await press(page, 'Enter');
await press(page, 'Enter'); // Check
await expectBand(page, 'S12 both flags right', { state: 'correct', verdict: '', text: S.S12.feedbackCorrect, unlocked: true });
expect(await isActive(page, '.w-next'), 'S12 both flags placed: Next unlocked and focused');
await expectLayout(page, 'S12 done');
await press(page, 'Enter');

// S12B the learner's own metric: empty Save, Baseline and Target only (Date may stay empty), then all three
await expectNewScreen(page, 'S12B', 'S12 Next');
await expectBand(page, 'S12B before action', { state: 'hint', text: S.S12B.hint, unlocked: false, lockedWhy: UI.footer.locked.input });
const s12b = await page.evaluate(() => ({ max: [...document.querySelectorAll('.w-input')].map((i) => i.maxLength + (i.tagName === 'INPUT' ? 'i' : 't')).join(), sub: document.querySelector('.w-subline').textContent,
  ctx: document.querySelector('.w-sheet .w-context').textContent, arrows: document.querySelectorAll('.w-chain-arrow').length }));
expect(s12b.max === '80i,80i,40i' && s12b.sub === S.S12B.hint && s12b.ctx === S.S12B.stage.top.text && s12b.arrows === 2,
  `S12B: "${s12b.ctx}", the hint under the heading, Baseline / Target / Date on one line (maxlength ${s12b.max})`);
await filledSave(page, 'S12B');
await tabTo(page, '.w-input[data-store="L4_CASE_BASELINE"]', { back: true });
await page.keyboard.type(METRIC_PARTS.baseline);
expect(await page.evaluate(() => document.querySelector('[data-action="save"]').disabled), 'S12B: Baseline only, Save still locked (Target is required, Date may stay empty)');
await tabTo(page, '.w-input[data-store="L4_CASE_TARGET"]');
await page.keyboard.type(METRIC_PARTS.target);
await press(page, 'Tab');
await page.keyboard.type(METRIC_PARTS.date);
await expectLayout(page, 'S12B typed');
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S12B saved', { state: 'neutral', text: S.S12B.feedback.saved, unlocked: true });
const mf = await page.evaluate(() => window.__l4.state.f);
expect(mf.L4_CASE_BASELINE === METRIC_PARTS.baseline && mf.L4_CASE_TARGET === METRIC_PARTS.target && mf.L4_CASE_DATE === METRIC_PARTS.date && await isActive(page, '.w-next'),
  'S12B saved: stored under L4_CASE_BASELINE / _TARGET / _DATE, focus on Next');
await expectLayout(page, 'S12B saved');
await press(page, 'Enter');

// W4 warm-up (NL3: replaces FT4 and its routing)
await expectNewScreen(page, 'W4', 'S12B Next (no pause marker)');
rl = await bar(page);
expect(rl.status[3] === 'done' && rl.status[4] === 'current' && rl.chapter === CH.ch4.title && rl.steps.map((s) => s.split(':')[1]).join() === stepsOf('ch4').join(),
  `after chapter 3: HR demo ${rl.status[3]}, Critical eye ${rl.status[4]}, steps ${rl.steps.join(' ')}`);
await expectBand(page, 'W4 before action', { state: 'hint', text: S.W4.hint, unlocked: false, lockedWhy: UI.footer.locked.warmup });
await expectLayout(page, 'W4 hint');
await tabTo(page, '.w-guess[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'W4 guess a', { state: 'guess', verdict: S.W4.feedback.verdict, text: S.W4.feedback.text, unlocked: true });
await press(page, 'Enter');

// S13 the Start and End flags by keyboard: Start on step 2 (wrong, its own line), then step 1; End on
// step 4 (wrong, its own line), then step 5
await expectNewScreen(page, 'S13', 'W4 Next');
const flagOf = (id) => S.S13.flags.find((f) => f.id === id);
await expectBand(page, 'S13 before action', { state: 'hint', text: S.S13.hint, unlocked: false, lockedWhy: UI.footer.locked.line });
const s13 = await page.evaluate(() => ({ steps: [...document.querySelectorAll('.w-line-step')].map((s) => s.textContent).join('|'), slots: document.querySelectorAll('.w-line-slot .w-target-chip').length,
  flags: [...document.querySelectorAll('.w-flag-card')].map((c) => c.getAttribute('aria-label')).join() }));
expect(s13.steps === S.S13.line.map((x) => x.n + x.text).join('|') && s13.slots === 5 && s13.flags === 'Start,End', `S13: the five steps with a "${S.S13.dropLabel}" slot each, the flags ${s13.flags}`);
await tabTo(page, '.w-flag-card[data-flag="start"]');
await press(page, '2');
expect(await page.evaluate(() => document.querySelector('.w-board > .w-sr-only[aria-live]').textContent) === UI.drag.chosen.replace('{target}', UI.drag.stepName.replace('{n}', 2).replace('{text}', S.S13.line[1].text)),
  'S13 key 2: "Step 2, HR staff open the inbox chosen" announced');
await press(page, 'Enter');
// FX1 E2: Start on 2 and End on 4 placed as they are; Check: both come back, each with its own line
expect(await page.evaluate(() => document.querySelector('.w-target[data-target="2"] .w-target-placed')?.textContent === 'Start') && await isActive(page, '.w-flag-card[data-flag="end"]'),
  'S13 Start placed on step 2 (unmarked), focus on the End flag');
await press(page, '4');
await press(page, 'Enter');
await press(page, 'Enter'); // Check
await expectBand(page, 'S13 Check, Start on step 2', { state: 'wrong', text: flagOf('start').feedback[2], unlocked: false });
await expectLayout(page, 'S13 wrong');
await tabTo(page, '.w-flag-card[data-flag="end"]');
expect((await band(page)).text === flagOf('end').feedback[4] && await attemptOf(page) === 'Attempt 2 of 2', 'S13 the End flag back in the tray: picked up, its own line for step 4; "Attempt 2 of 2"');
await tabTo(page, '.w-flag-card[data-flag="start"]', { back: true });
await press(page, '1');
await press(page, 'Enter');
await press(page, '5');
await press(page, 'Enter');
await press(page, 'Enter'); // Check
await expectBand(page, 'S13 both flags right', { state: 'correct', verdict: '', text: S.S13.feedbackCorrect, unlocked: true });
expect(await isActive(page, '.w-next'), 'S13 done: Next unlocked and focused');
await expectLayout(page, 'S13 done');
await press(page, 'Enter');

// S14, S15 on Stage: the case card (band, situation, S14's visual), the panel right; wrong then right
for (const [id, wrongId, moves, rightId] of [['S14', 'd', ['ArrowUp', 2], 'b'], ['S15', 'b', ['ArrowUp', 1], 'a']]) {
  await expectNewScreen(page, id, `${id} reached`);
  const st = await page.evaluate(() => ({ scene: document.querySelector('.w-stage').dataset.scene, band: document.querySelector('.w-case-card .w-rules').textContent, line: document.querySelector('.w-case-line').textContent,
    vis: document.querySelector('.w-hv')?.getAttribute('aria-label') || '', eyebrow: document.querySelector('.w-case-card .w-label')?.textContent || '' }));
  expect(st.scene === 'stage' && st.band === `${S[id].band.term}: ${S[id].band.text}` && st.line === S[id].stage.top.text && st.vis === (S[id].visual?.alt || '') && st.eyebrow === (S[id].stage.top.eyebrow || ''),
    `${id} Stage: the case card with "${st.band}"${st.eyebrow ? ', the eyebrow' : ''}, the situation${st.vis ? ', the handoff visual (role img)' : ''}`);
  await expectBand(page, `${id} before action`, { state: 'hint', text: S[id].hint, unlocked: false, lockedWhy: UI.footer.locked.single });
  await tabTo(page, `.w-opt[data-id="${wrongId}"]`);
  await press(page, 'Enter');
  await expectBand(page, `${id} ${wrongId}`, { state: 'wrong', text: opt(id, wrongId).feedback, unlocked: false });
  await expectLayout(page, `${id} wrong`);
  await press(page, moves[0], moves[1]);
  await press(page, 'Enter');
  await expectBand(page, `${id} ${rightId}`, { state: 'correct', text: opt(id, rightId).feedback, unlocked: true });
  await expectLayout(page, `${id} right`);
  await press(page, 'Enter');
}

// K4 key idea: two columns, Next never locked, nothing tracked
await expectNewScreen(page, 'K4', 'S15 Next');
const k4 = await page.evaluate(() => ({ cols: [...document.querySelectorAll('.w-kcol')].map((c) => c.dataset.kind + ':' + c.querySelector('.w-fig-caption').textContent + ':' + c.querySelectorAll('li').length).join(),
  items: [...document.querySelectorAll('.w-kcol li')].map((li) => li.textContent).join('|') }));
const wantK4 = S.K4.columns.flatMap((c) => c.items.map((it) => it.term + (it.text ? ': ' + it.text : ''))).join('|');
expect(k4.cols === 'lean:Good fit:3,mess:Poor fit:3' && k4.items === wantK4 && !(await nextState(page)).locked && !(await events(page)).some((e) => e.screen === 'K4'),
  `K4: "Good fit" (teal) and "Poor fit" (grey), three items each from content, Next unlocked (presentation screen)`);
await expectLayout(page, 'K4');
await tabTo(page, '.w-next');
await press(page, 'Enter');

// S16, S17 sort decks (NL3): S16 with its hint under the heading, Poor fit wider; S17 read, then sort
await expectNewScreen(page, 'S16', 'K4 Next');
await deckRun(page, 'S16', { wrong: 'b' });
await expectNewScreen(page, 'S17', 'S16 Next');
await casesRun(page, 'S17', { wrong: '5' });

// S17B the learner's notes: the Chapter 2 steps read-only, empty Save, both fields, Save
await expectNewScreen(page, 'S17B', 'S17 Next');
await expectBand(page, 'S17B before action', { state: 'hint', text: '', unlocked: false, lockedWhy: UI.footer.locked.input });
const s17b = await page.evaluate(() => { const ps = [...document.querySelectorAll('.w-actionbar .w-privacy')];
  return { shown: document.querySelector('.w-shown').textContent, note: ps[0]?.textContent, lock: !!ps[0]?.querySelector('svg'), privacy: ps[1]?.textContent, privacyLock: !!ps[1]?.querySelector('svg'),
    max: [...document.querySelectorAll('.w-input')].map((i) => i.maxLength).join(), inputs: document.querySelectorAll('.w-shown input, .w-shown textarea').length }; });
expect(s17b.shown === SKETCH.steps && s17b.note === S.S17B.stage.bottom.text && !s17b.lock && s17b.privacy === S.S17B.stage.privacy.text && s17b.privacyLock && s17b.max === '100,100' && !s17b.inputs,
  `S17B: the Chapter 2 steps read-only ("${s17b.shown}"), the note (no lock) and G1's privacy line ("${s17b.privacy}", lock) beside Save, two fields of 100`);
await filledSave(page, 'S17B');
await tabTo(page, '.w-input[data-store="L4_CASE_AIFIT"]', { back: true });
await page.keyboard.type(NOTES.aifit);
await press(page, 'Tab');
await page.keyboard.type(NOTES.human);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S17B saved', { state: 'neutral', text: S.S17B.feedback.saved, unlocked: true });
const nf = await page.evaluate(() => window.__l4.state.f);
expect(nf.L4_CASE_AIFIT === NOTES.aifit && nf.L4_CASE_HUMAN === NOTES.human && await isActive(page, '.w-next'), 'S17B saved: stored under L4_CASE_AIFIT / _HUMAN, focus on Next');
await expectLayout(page, 'S17B saved');
await press(page, 'Enter');

/* ---------- Chapters 5 and 6 (NL4, storyboard v3): sort deck, Stage decision, S18B, S19 copy cards, self-check, risk, check, result, finish ---------- */
console.log('\nchapters 5 and 6 (keyboard)');
await expectNewScreen(page, 'S18A', 'S17B Next');
rl = await bar(page);
expect(rl.status.slice(0, 5).every((s) => s === 'done') && rl.status[5] === 'current', `after chapter 4: chapters 0 to 4 done, Build yours ${rl.status[5]}, ${rl.pct}%`);
const steps5 = await page.evaluate(() => [...document.querySelectorAll('.w-steps-bar .w-step-label')].map((s) => s.textContent).join(' · '));
expect(steps5 === 'Match · Decide · Write · Map · Review',`Chapter 5 steps in the bar: ${steps5}`);
// S18A (FX2 D2): the workbook rows, card 1 in Steps and card 2 in Trigger, Check, then right
await fieldsRun(page, 'S18A');

// S18: Stage; FX3: one panel over the chapter photo (the coach line, the heading, the answers, the band with
// Show me how and the attempts); a wrong then the right answer
await expectNewScreen(page, 'S18', 'S18A Next');
const s18 = await page.evaluate(() => { const pan = document.querySelector('.w-sheet-one'); return { scene: document.querySelector('.w-stage').dataset.scene, card: pan?.querySelector('.w-context')?.textContent,
  inPanel: !!pan && ['.w-instruction', '.w-ans-list, [role="radiogroup"]', '.w-band', '.w-attempts', '.w-showme'].every((s) => pan.querySelector(s)), cards: document.querySelectorAll('.w-case-card').length, step2: !!document.querySelector('.w-safety-form, .w-input') }; });
expect(s18.scene === 'stage' && s18.card === S.S18.stage.top.text && s18.inPanel && !s18.cards && !s18.step2, `S18 on Stage, one panel: "${s18.card}", heading, answers, band, attempts and Show me how in it; no case card; no case-title step (moved to S18B)`);
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S18 a', { state: 'wrong', text: opt('S18', 'a').feedback, unlocked: false, lockedWhy: UI.footer.locked.single });
await press(page, 'ArrowDown');
await press(page, 'Enter');
await expectBand(page, 'S18 b', { state: 'correct', text: opt('S18', 'b').feedback, unlocked: true });
await expectLayout(page, 'S18 right');
await press(page, 'Enter');

// S18B: the case title pre-filled (S02), the "Your case" card, Save without the box, an emptied field locks Save, then Save
await expectNewScreen(page, 'S18B', 'S18 Next');
await expectBand(page, 'S18B before action', { state: 'hint', text: S.S18B.hint, unlocked: false, lockedWhy: UI.footer.locked.input });
const s18b = await page.evaluate(() => ({ value: document.querySelector('.w-input').value, card: document.querySelector('.w-case-slim')?.textContent, box: document.querySelector('.w-checkbox').checked,
  save: document.querySelector('[data-action="save"]').disabled, primary: document.querySelector('[data-action="save"]').classList.contains('w-btn-primary'), next: document.querySelector('.w-next').textContent.trim() }));
expect(s18b.value === TITLE && s18b.card === TITLE && !s18b.box && !s18b.save && s18b.primary && s18b.next === S.S18B.lockedNext,
  `S18B: the case title pre-filled ("${s18b.value}"), the "Your case" card shows it, the box unticked, the filled Save, Next reads "${s18b.next}"`);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S18B Save without the box', { state: 'notice', text: S.S18B.feedback.unticked, unlocked: false });
expect(await isActive(page, '.w-checkbox'), 'S18B: the focus moves to the checkbox');
await press(page, ' ');
await tabTo(page, '.w-input', { back: true });
await page.keyboard.down('Control'); await press(page, 'a'); await page.keyboard.up('Control'); await press(page, 'Backspace');
expect(await page.evaluate(() => document.querySelector('[data-action="save"]').disabled), 'S18B: the field emptied, Save locked');
await page.keyboard.type(TITLE);
await expectLayout(page, 'S18B typed');
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S18B saved', { state: 'neutral', text: S.S18B.feedback.saved, unlocked: true });
expect(await page.evaluate(() => window.__l4.state.g.S18B?.box === 1 && window.__l4.state.f.L4_CASE_TITLE), 'S18B saved: the box kept in suspend data, the title stored');
await press(page, 'Enter');

// S19: document view, four read-only copy cards, Copy (clipboard, then the blocked-clipboard fallback), the workbook preview, Open workbook unlocks Next
await expectNewScreen(page, 'S19', 'S18B Next');
await expectBand(page, 'S19 before action', { state: 'hint', text: S.S19.hint, unlocked: false, lockedWhy: UI.footer.locked.openWorkbook });
const s19 = await page.evaluate(() => ({
  cards: [...document.querySelectorAll('.w-copy-card')].map((c) => c.dataset.card + '=' + c.querySelector('.w-field-chip').textContent + '=' + [...c.querySelectorAll('.w-sketch-row')].map((r) => r.querySelector('dt').textContent + r.querySelector('dd').textContent).join('|')),
  disabled: [...document.querySelectorAll('[data-action="copy"]')].filter((b) => b.disabled).length,
  preview: [...document.querySelectorAll('.w-wb-rows li')].map((li) => (li.dataset.notes === 'true' ? '*' : '') + li.querySelector('span').textContent).join('|'),
  ret: document.querySelector('.w-return-line').textContent, chip: document.querySelector('.w-time-chip').textContent, inputs: document.querySelectorAll('.w-copy-card input, .w-copy-card textarea').length }));
const wantCards = [`case=${S.S19.copyCards.cards[0].chip}=Case title:${TITLE}|The problem today:${PROBLEM}`,
  `sketch=${S.S19.copyCards.cards[1].chip}=Trigger:${SKETCH.trigger}|Steps:${SKETCH.steps}|Output:${SKETCH.output}`,
  `metric=${S.S19.copyCards.cards[2].chip}=Baseline:${METRIC_PARTS.baseline}|Target:${METRIC_PARTS.target}|Date:${METRIC_PARTS.date}`,
  `notes=${S.S19.copyCards.cards[3].chip}=Could fit AI:${NOTES.aifit}|Stays with a person:${NOTES.human}`];
expect(s19.cards.join('\n') === wantCards.join('\n') && !s19.disabled && !s19.inputs, `S19: four read-only copy cards from S02, S08B, S12B, S17B, each with its field chip, every Copy enabled`);
expect(s19.preview === S.S19.preview.fields.map((n, i) => (S.S19.preview.fromNotes.includes(i + 1) ? '*' : '') + n).join('|') && s19.ret === S.S19.returnLine && s19.chip === S.S19.chip,
  `S19: the workbook preview's eight rows (Fields 1, 2, 3, 8 marked), the return line, the "${s19.chip}" chip`);
const link = await page.evaluate(() => { const a = document.querySelector('[data-action="open"]'); return { href: a.href, target: a.target, rel: a.rel }; });
expect(link.href === C.links.workbook && link.target === '_blank' && /noopener/.test(link.rel), `S19 Open workbook: a link to the existing workbook (${link.href}), target _blank, rel "${link.rel}"`);
await page.browserContext().overridePermissions(new URL(page.url()).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
await page.bringToFront(); // the clipboard needs the page focused (the earlier new tabs took it)
await tabTo(page, '[data-action="copy"][data-card="case"]', { back: true });
await press(page, 'Enter');
await wait(200);
const clip = await page.evaluate(async () => { let text = null; try { text = await navigator.clipboard.readText(); } catch (e) { text = 'read failed: ' + e.message; }
  return { text, label: document.querySelector('[data-action="copy"][data-card="case"]').textContent, focus: document.hasFocus(), active: document.activeElement?.dataset.card }; });
expect(String(clip.text).replace(/\r\n/g, '\n') === `Case title: ${TITLE}\nThe problem today: ${PROBLEM}` && clip.label === UI.buttons.copied, // (Windows' clipboard gives CRLF back)
  `S19 Copy: the case card's text on the clipboard, the button reads "${clip.label}"` + (clip.label === UI.buttons.copied ? '' : ` (clipboard "${clip.text}", page focused ${clip.focus}, focus on ${clip.active})`));
// the clipboard blocked (an LMS iframe without permission): the card's text is selected, "Press Ctrl+C"
await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('blocked')) } }));
await tabTo(page, '[data-action="copy"][data-card="sketch"]');
await press(page, 'Enter');
await wait(200);
const fb = await page.evaluate(() => ({ sel: String(window.getSelection()), label: document.querySelector('[data-action="copy"][data-card="sketch"]').textContent }));
expect(fb.sel.includes(SKETCH.trigger) && fb.sel.includes(SKETCH.output) && fb.label === UI.copyKeys, `S19 Copy with the clipboard blocked: the sketch's rows selected, the button reads "${fb.label}"`);
await expectBand(page, 'S19 Copy fallback', { state: 'notice', text: UI.copyFallback + '.', unlocked: false });
await tabTo(page, '[data-action="open"]');
const tabUrl = await newTabFrom(page);
expect(tabUrl === C.links.workbook && await screen(page) === 'S19', `S19: Enter opened a new tab at ${tabUrl}; the module stays on S19`);
await expectBand(page, 'S19 opened', { state: 'notice', text: S.S19.openFeedback, unlocked: true });
expect(await page.evaluate(() => window.__l4.state.g.S19?.o === 1), 'S19: opened kept in suspend data');
await expectLayout(page, 'S19 opened');
await tabTo(page, '.w-next');
await press(page, 'Enter');

// S20: the checklist, one row changed (a retry, still neutral), the fix line while any is Not yet, Next
await expectNewScreen(page, 'S20', 'S19 Next');
await expectBand(page, 'S20 before action', { state: 'hint', text: S.S20.hint, unlocked: false, lockedWhy: UI.footer.locked.selfcheck });
const row = (id) => S.S20.rows.find((r) => r.id === id);
for (const [q, c] of [['q1', 'notYet'], ['q1', 'yes'], ['q2', 'yes'], ['q3', 'notYet']]) {
  await tabTo(page, `.w-check-row[data-row="${q}"] [data-choice="${c}"]`, { back: c === 'yes' && q === 'q1' });
  await press(page, 'Enter');
  await expectBand(page, `S20 ${q} ${c}`, { state: 'neutral', text: row(q).feedback[c], unlocked: q === 'q3' });
}
const s20 = await page.evaluate(() => ({ marks: [...document.querySelectorAll('.w-check-row')].map((r) => r.dataset.answer).join(), fix: !document.querySelector('.w-fix-line').hidden && document.querySelector('.w-fix-line').textContent }));
expect(s20.marks === 'yes,yes,notYet' && s20.fix === S.S20.fixLine && await isActive(page, '.w-next'), `S20: the checklist marks ${s20.marks}, the fix line "${s20.fix}", Next unlocked and focused`);
await expectLayout(page, 'S20 answered');
await press(page, 'Enter');

// S20B: read the five mistakes, pick one (neutral), the fix in the strip
await expectNewScreen(page, 'S20B', 'S20 Next');
await expectBand(page, 'S20B before action', { state: 'hint', text: S.S20B.hint, unlocked: false, lockedWhy: UI.footer.locked.chips });
const subs = await page.evaluate(() => [...document.querySelectorAll('.w-opt-sub')].map((x) => x.textContent).join('|'));
expect(subs === S.S20B.options.map((o) => o.sub).join('|'), 'S20B: each mistake with its one-line definition');
await tabTo(page, '.w-opt[data-id="ideal"]');
await press(page, 'ArrowDown', 2);
await press(page, 'Enter');
await expectBand(page, 'S20B rushed', { state: 'neutral', text: opt('S20B', 'rushed').feedback, unlocked: true });
await expectLayout(page, 'S20B picked');
await press(page, 'Enter');

// S21: item 1 wrong then right (the wrong first answer counts), items 2 to 5 right first: 4 of 5; Next to S21R
await expectNewScreen(page, 'S21', 'S20B Next');
const steps6 = await page.evaluate(() => [...document.querySelectorAll('.w-steps-bar .w-step-label')].map((s) => s.textContent).join(' · '));
expect(steps6 === 'Check · Score · Reflect · Finish',`Chapter 6 steps in the bar: ${steps6}`);
const item = (k) => S.S21.items[k];
const iopt = (k, id) => item(k).options.find((o) => o.id === id);
await tabTo(page, '.w-kc-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S21 item 1 a', { state: 'wrong', text: iopt(0, 'a').feedback, unlocked: false, lockedWhy: UI.footer.locked.check });
await expectLayout(page, 'S21 item 1 wrong');
await press(page, 'ArrowRight', 2);
await press(page, 'Enter');
await expectBand(page, 'S21 item 1 c (retry)', { state: 'correct', text: iopt(0, 'c').feedback, unlocked: false, actions: ['nextQuestion'] });
for (const [k, key] of [[1, 'b'], [2, 'a'], [3, 'd']]) {
  await press(page, 'Enter'); // Next question
  const dots = await page.evaluate(() => document.querySelector('.w-kc-head .w-dots').getAttribute('aria-label'));
  expect(dots === `Question ${k + 1} of 5` && await isActive(page, '.w-kc-opt[data-id="a"]'), `S21 item ${k + 1}: "${dots}", focus on option A`);
  const idx = { a: 0, b: 1, c: 2, d: 3 }[key];
  if (idx) await press(page, 'ArrowRight', idx);
  await press(page, 'Enter');
  await expectBand(page, `S21 item ${k + 1} ${key}`, { state: 'correct', text: iopt(k, key).feedback, unlocked: false });
}
await press(page, 'Enter');
expect(await page.evaluate(() => document.querySelector('#w-instruction').textContent) === item(4).instruction, `S21 item 5: the heading reads "${item(4).instruction}"`);
await expectBand(page, 'S21 item 5 hint', { state: 'hint', text: item(4).hint, unlocked: false });
for (const n of [5, 6]) { await tabTo(page, `.w-kc-tile[data-n="${n}"]`); await press(page, ' '); }
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
const scoreEv = (await events(page)).filter((e) => e.kind === 'score');
expect(await isActive(page, '.w-next') && scoreEv.length === 1 && scoreEv[0].score === 80 && scoreEv[0].passed && scoreEv[0].attempt === 1 && (await page.evaluate(() => window.__l4.score())).raw === 80,
  `S21 done: Next focused; the attempt's score from first answers only: ${scoreEv[0]?.score} (passed ${scoreEv[0]?.passed}, attempt ${scoreEv[0]?.attempt})`);
await press(page, 'Enter');

// S21R: passed: the score line, the ring, "Passed", no retake, Next open
await expectNewScreen(page, 'S21R', 'S21 Next', { heading: '4 of 5 on first try (80 of 100). Pass mark: 80.' });
const r21 = await page.evaluate(() => ({ h: document.querySelector('#w-instruction').textContent, chip: document.querySelector('.w-result-chip').textContent, line: document.querySelector('.w-result-line').textContent,
  ring: document.querySelector('.w-ring').getAttribute('aria-label'), retake: !!document.querySelector('[data-action="retake"]'), missed: document.querySelectorAll('.w-missed-item').length, next: document.querySelector('.w-next').dataset.locked }));
expect(r21.h === '4 of 5 on first try (80 of 100). Pass mark: 80.' && r21.chip === S.S21R.passed.chip && r21.line === S.S21R.passed.text && r21.ring === '80 of 100' && !r21.retake && !r21.missed && r21.next === 'false',
  `S21R passed: "${r21.h}", "${r21.chip}", the ring "${r21.ring}", no retake, no missed list, Next open`);
await expectLayout(page, 'S21R passed');
await tabTo(page, '.w-next');
await press(page, 'Enter');

// S22: Stage, the bridge line on the case card; a takeaway, step 2: homework in a new tab, the downloaded record, Finish = passed
await expectNewScreen(page, 'S22', 'S21R Next');
const s22 = await page.evaluate(() => ({ scene: document.querySelector('.w-stage').dataset.scene, bridge: document.querySelector('.w-bridge-card')?.textContent }));
expect(s22.scene === 'stage' && s22.bridge === S.S22.step2.bridge.text, `S22 on Stage: the bridge line on the case card ("${s22.bridge}")`);
await tabTo(page, '.w-takeaway[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S22 takeaway a', { state: 'neutral', text: opt('S22', 'a').feedback, unlocked: true });
await expectLayout(page, 'S22 step 1');
await press(page, 'Enter');
expect(await isActive(page, '[data-action="homework"]'), 'S22 step 2: focus on Open homework');
await expectBand(page, 'S22 step 2', { state: 'hint', text: S.S22.hint, unlocked: false, lockedWhy: UI.footer.locked.finish });
const hwUrl = await newTabFrom(page);
expect(hwUrl === C.links.homework, `S22 Open homework: a new tab at ${hwUrl}`);
const dlDir = mkdtempSync(join(tmpdir(), 'l4-record-'));
const cdp = await page.createCDPSession();
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dlDir });
await tabTo(page, '[data-action="download"]');
await press(page, 'Enter');
await expectBand(page, 'S22 download', { state: 'neutral', text: S.S22.step2.feedback.download, unlocked: false });
let rec = '';
for (let i = 0; i < 30 && !rec; i++) { await wait(200); try { rec = readFileSync(join(dlDir, UI.record.fileName), 'utf8'); } catch {} }
expect(rec.includes(TITLE) && rec.includes(UI.record.sketch) && rec.includes(SKETCH.steps) && rec.includes(SKETCH.output) && rec.includes(UI.record.metric) && rec.includes(METRIC_PARTS.baseline) && rec.includes(METRIC_PARTS.target) && rec.includes(METRIC_PARTS.date)
  && rec.includes('4 of 5 on first try (80 of 100), attempt 1') && rec.includes(opt('S20B', 'rushed').label) && rec.includes(UI.buttons.notYet) && rec.includes(UI.record.notes) && rec.includes(NOTES.aifit) && rec.includes(NOTES.human),
  `S22 lesson record downloaded (${UI.record.fileName}, ${rec.length} bytes): case title, sketch, notes, first metric (Chapter 3), self-check, risk, score with the attempt`);
await tabTo(page, '[data-action="finish"]');
await press(page, 'Enter');
await expectBand(page, 'S22 finished', { state: 'neutral', text: UI.finished, unlocked: true }); // FX2 G: Next opens END
const fin = (await events(page)).filter((e) => e.kind === 'finish');
expect(fin.length === 1 && fin[0].status === 'passed' && fin[0].score === 80, `S22 Finish (after the download, no confirm): lesson status ${fin[0]?.status}, score ${fin[0]?.score}`);
await expectLayout(page, 'S22 finished');

// FX2 G: END, the closing screen: the bar, the logo, "Lesson complete", the status chip (no score), the
// next line and S22's homework link; Previous only; nothing tracked, the finish status unchanged
const evBefore = (await events(page)).length;
expect(await isActive(page, '.w-next'), 'S22 finished: focus on Next');
await press(page, 'Enter');
await expectNewScreen(page, 'END', 'S22 Next');
const endS = await page.evaluate(() => ({ scene: document.querySelector('.w-stage').dataset.scene, bar: !!document.querySelector('.w-bar').getClientRects().length,
  logo: !!document.querySelector('.w-end-logo'), h1: document.querySelector('.w-instruction').textContent, accent: document.querySelector('.w-end-accent')?.textContent,
  sub: document.querySelector('.w-end-sub').textContent, chip: document.querySelector('.w-end-chip').textContent, hint: !!document.querySelector('.w-end-hint'),
  next: document.querySelector('.w-end-next-line').textContent, hw: document.querySelector('.w-end-link')?.getAttribute('href'),
  nextBtn: !!document.querySelector('.w-next').getClientRects().length, prev: !!document.querySelector('.w-prev').getClientRects().length,
  digits: /\d+ of \d+|\d+%/.test(document.querySelector('.w-end').textContent) }));
expect(endS.scene === 'end' && endS.bar && endS.logo && endS.h1 === S.END.instruction && endS.accent === S.END.accent && endS.sub === S.END.sub && endS.chip === S.END.passed.chip && !endS.hint
  && endS.next === S.END.next && endS.hw === C.links.homework && !endS.nextBtn && endS.prev && !endS.digits,
  `END: dark photo, the bar, the logo, "${endS.h1}" ("${endS.accent}" in turquoise), "${endS.chip}" (no score), the next line and S22's homework link; Previous only`);
const evAfter = await events(page);
expect(evAfter.length === evBefore && !evAfter.slice(evBefore).length && await page.evaluate(() => window.__l4.state.fin) === 'passed', 'END: nothing tracked, the finish status stays "passed"');
await expectLayout(page, 'END passed');

// revisits: read-only, the right state shown, Next unlocked (S22: finished, the last screen)
for (const id of ['W2', 'S04', 'S05b', 'S06', 'S07', 'S08', 'S08B', 'W3', 'V2', 'S09', 'S10', 'S11', 'S12', 'S12B', 'W4', 'S13', 'S14', 'S15', 'S16', 'S17', 'S17B', 'S18A', 'S18', 'S18B', 'S19', 'S20', 'S20B', 'S21', 'S21R', 'S22']) {
  await page.evaluate((x) => window.__l4.go(x), id);
  const b = S[id].template === 'video' ? null : await band(page), n = await nextState(page);
  const want = { W2: 'guess', W3: 'guess', W4: 'guess', S12B: 'neutral', S17B: 'neutral', S08B: 'neutral', S18B: 'neutral', S19: 'hint', S20: 'hint', S20B: 'neutral', S21: 'idle', S21R: 'idle', S22: 'neutral' }[id] || 'correct';
  const nextOk = !n.locked; // FX2 G: S22 finished opens END
  expect((!b || b.state === want) && nextOk, `${id} revisit: the earlier state comes back${b ? ' (band ' + b.state + ')' : ' (stops answered, seek free)'}, ${id === 'S22' ? 'finished, Next unlocked (to END)' : 'Next unlocked'}`);
}
await page.evaluate(() => window.__l4.go('S19'));

// menu: every chapter done
await tabTo(page, '.w-bar-menu', { back: true });
await press(page, 'Enter');
menu = await page.evaluate(() => ({ pct: window.__l4.progress().percent, list: [...document.querySelectorAll('.w-chapter')].map((c) => c.dataset.status + ':' + (c.querySelector('.w-menu-disc svg') ? 'check' : c.querySelector('.w-menu-disc').textContent)) }));
expect(menu.pct === 100 && menu.list.every((x) => x === 'done:check') && menu.list.length === 7, `menu at the end (${menu.pct}%): all 7 chapters done, each a navy check`);
await expectLayout(page, 'menu open');
await shot(page, 'menu-open.png');
await tabTo(page, '.w-chapter[data-chapter="0"]');
await press(page, 'Enter');
await expectNewScreen(page, 'O1', `menu: Enter on the completed chapter ${CH.ch0.title}`);
await tabTo(page, '[data-action="start"]');
await press(page, 'Enter');
await expectNewScreen(page, 'O2', 'Start from the O1 revisit');
await tabTo(page, '.w-prev', { back: true });
await press(page, 'Enter');
await expectNewScreen(page, 'O1', 'Previous from O2');
await page.evaluate(() => window.__l4.go('W1'));
expect(await page.evaluate(() => document.querySelector('.w-guess[aria-checked="true"]')?.dataset.id) === 'b' && !(await nextState(page)).locked, 'W1 revisit: the kept guess (b) is shown, Next unlocked');
await page.evaluate(() => window.__l4.go('S01'));
await tabTo(page, '.w-bar-menu', { back: true });
await press(page, 'Enter');
await tabTo(page, '.w-chapter[data-chapter="5"]');
await press(page, 'Enter');
await expectNewScreen(page, 'S18A', 'menu: Enter on the completed chapter 5 opens its first screen');

const ev = await events(page);
const first = (id) => ev.filter((e) => e.kind === 'answer' && e.trackingId === id);
const IDS_CH34 = ['L4_W3_1', 'L4_V2_1', 'L4_V2_2', 'L4_V2_3', 'L4_S09_1', 'L4_S10_1', 'L4_S11_1', 'L4_S12_1', 'L4_S12B_1', 'L4_S12B_2', 'L4_S12B_3', 'L4_W4_1', 'L4_S13_1', 'L4_S14_1', 'L4_S15_1', 'L4_S16_1', 'L4_S17_1', 'L4_S17B_1', 'L4_S17B_2'];
const IDS_CH56 = ['L4_S18A_1', 'L4_S18_1', 'L4_S18_2', 'L4_S20_1', 'L4_S20_2', 'L4_S20_3', 'L4_S20_4', 'L4_S21_1', 'L4_S21_2', 'L4_S21_3', 'L4_S21_4', 'L4_S21_5', 'L4_S22_1'];
const IDS_CH2 = ['L4_W2_1', 'L4_S04_1', 'L4_S05B_1', 'L4_S06_1', 'L4_S06_2', 'L4_S07_1', 'L4_S08_1', 'L4_S08_2', 'L4_S08_3', 'L4_S08B_1', 'L4_S08B_2', 'L4_S08B_3'];
const IDS = ['L4_S01_1', 'L4_S02_1', 'L4_S02_2', 'L4_W1_1', 'L4_S03_1', ...IDS_CH2, ...IDS_CH34, ...IDS_CH56, 'L4_V1_1', 'L4_V1_2'];
expect(IDS.every((id) => first(id).length === 1) && ev.filter((e) => e.kind === 'answer').length === IDS.length,
  `bus: exactly one first-attempt event per id (${IDS.map((id) => id + ' ' + first(id).length).join(', ')})`);
const f = Object.fromEntries(IDS.map((id) => [id, first(id)[0]]));
expect(f.L4_S01_1.response === 'a' && f.L4_S01_1.result === 'wrong' && f.L4_S02_1.response === TITLE && f.L4_S02_1.result === 'neutral' && f.L4_S02_1.type === 'fill-in'
  && f.L4_W1_1.response === 'a' && f.L4_W1_1.result === 'neutral' && f.L4_W1_1.type === 'choice' && f.L4_S03_1.response === 'a,b' && f.L4_S03_1.result === 'wrong'
  && f.L4_V1_1.response === 'a' && f.L4_V1_1.result === 'wrong' && f.L4_V1_2.response === 'b' && f.L4_V1_2.result === 'wrong',
  `bus: first responses ${IDS.slice(0, 5).map((id) => id + '=' + JSON.stringify(f[id].response.slice(0, 20)) + '/' + f[id].result).join(', ')}`);
const ch2 = IDS_CH2.map((id) => `${id}=${f[id].response}/${f[id].result}/${f[id].type}`).join(' ');
const ch34 = IDS_CH34.map((id) => `${id}=${f[id].response}/${f[id].result}`).join(' ');
expect(ch34 === 'L4_W3_1=c/neutral L4_V2_1=a/wrong L4_V2_2=b/wrong L4_V2_3=a/wrong L4_S09_1=1.b,2.a,3.b,4.c,5.d,6.d/wrong L4_S10_1=d/wrong L4_S11_1=a/wrong '
  + `L4_S12_1=3,7/wrong L4_S12B_1=${METRIC_PARTS.baseline}/neutral L4_S12B_2=${METRIC_PARTS.target}/neutral L4_S12B_3=${METRIC_PARTS.date}/neutral `
  + 'L4_W4_1=a/neutral L4_S13_1=s.2,e.4/wrong L4_S14_1=d/wrong L4_S15_1=b/wrong L4_S16_1=1.b,2.d,3.b,4.d,5.d,6.c/wrong L4_S17_1=a.5,b.1,c.5,d.4,e.2/wrong '
  + `L4_S17B_1=${NOTES.aifit}/neutral L4_S17B_2=${NOTES.human}/neutral`,
  `bus, chapters 3 and 4 first attempts: ${ch34}`);
const ch56 = IDS_CH56.map((id) => `${id}=${f[id].response}/${f[id].result}`).join(' ');
expect(ch56 === `L4_S18A_1=3.c,1.b,4.d,2.a/wrong L4_S18_1=a/wrong L4_S18_2=${TITLE}/neutral L4_S20_1=b/neutral L4_S20_2=a/neutral L4_S20_3=b/neutral `
  + 'L4_S20_4=c/neutral L4_S21_1=a/wrong L4_S21_2=b/correct L4_S21_3=a/correct L4_S21_4=d/correct L4_S21_5=5,6/correct L4_S22_1=a/neutral', `bus, chapters 5 and 6 first attempts: ${ch56}`);
expect(ch2 === 'L4_W2_1=a/neutral/choice L4_S04_1=1.b,2.b,3.a,4.b,5.c/wrong/matching L4_S05B_1=s.b,g.c,e.a/wrong/matching L4_S06_1=b/wrong/choice L4_S06_2=a/wrong/choice '
  + `L4_S07_1=7/wrong/choice L4_S08_1=a/wrong/choice L4_S08_2=c/correct/choice L4_S08_3=a/correct/choice L4_S08B_1=${SKETCH.trigger}/neutral/fill-in L4_S08B_2=${SKETCH.steps}/neutral/fill-in L4_S08B_3=${SKETCH.output}/neutral/fill-in`, `bus, chapter 2 first attempts: ${ch2}`);
const retries = ev.filter((e) => e.kind === 'retry').map((e) => `${e.trackingId}=${e.response}/${e.result}`);
// FX1 E2: the second Check of a deck, label or flag screen goes out as a retry (the placement then)
expect(retries.join() === 'L4_S01_1=b/correct,L4_W1_1=b/neutral,L4_V1_1=b/correct,L4_V1_2=a/correct,L4_S03_1=b,d/correct'
  + ',L4_S04_1=1.a,2.b,3.a,4.b,5.c/correct,L4_S05B_1=s.a,g.b,e.c/correct,L4_S06_1=a/correct,L4_S06_2=b/correct,L4_S07_1=8/correct,L4_S08_1=b/correct'
  + ',L4_V2_1=b/correct,L4_V2_2=a/correct,L4_V2_3=b/correct,L4_S09_1=1.a,2.a,3.b,4.c,5.d,6.d/correct,L4_S10_1=c/correct,L4_S11_1=d/correct'
  + ',L4_S12_1=4,7/correct,L4_S13_1=s.1,e.5/correct,L4_S14_1=b/correct,L4_S15_1=a/correct'
  + ',L4_S16_1=1.a,2.d,3.b,4.d,5.d,6.c/correct,L4_S17_1=a.3,b.1,c.5,d.4,e.2/correct'
  + ',L4_S18A_1=3.c,1.a,4.d,2.b/correct,L4_S18_1=b/correct,L4_S20_1=a/neutral,L4_S21_1=c/correct',
  `bus: retries as retry events (${retries.join(', ')})`);
expect(!page.errors.length, 'main path: no console errors' + (page.errors.length ? ': ' + page.errors.join(' | ') : ''));
if (SCORM) await scormChecks(page, IDS);
if (SCORM) await scormRetake();
await page.close();
if (SCORM) { await browser.close(); server.close(); console.log(fails.length ? `\ntest:scorm FAILED (${fails.length})` : '\ntest:scorm passed'); process.exit(fails.length ? 1 : 0); }

// NL4: the check in an LMS: attempt 1 below the pass mark, a finish (failed), a retake that passes.
// Each attempt appends its five interactions; score.raw is the latest attempt; passed is sticky and
// reaches the LMS at the end of the passing attempt.
async function scormRetake() {
  console.log('\nSCORM: knowledge check retake');
  const p = await open('?reset=1&screen=S21', { lms: {} });
  // FX3: version a on attempt 1, version b on the retake (its own items and interaction ids)
  const answerAll = async (pick, v = 'a') => {
    const items = S.S21.items.map((it) => (v === 'b' ? { ...it, ...it.b } : it));
    for (let k = 0; k < 4; k++) {
      const o = items[k].options.find(pick);
      await p.click(`.w-kc-opt[data-id="${o.id}"]`);
      if (!o.correct) await p.click(`.w-kc-opt[data-id="${items[k].options.find((x) => x.correct).id}"]`);
      await p.click('[data-action="nextQuestion"]');
    }
    const keys = items[4].tiles.filter((x) => x.correct).map((x) => x.n), miss = items[4].tiles.find((x) => !x.correct).n;
    for (const n of pick({ correct: true }) ? keys : [keys[0], miss]) await p.click(`.w-kc-tile[data-n="${n}"]`);
    await p.click('[data-action="check"]');
    if (!pick({ correct: true })) { await p.click(`.w-kc-tile[data-n="${keys[1]}"]`); await p.click('[data-action="check"]'); }
  };
  await answerAll((o) => !o.correct);
  let m = await p.evaluate(() => window.__scormMock.report());
  expect(m.data['cmi.core.score.raw'] === '0' && m.data['cmi.core.lesson_status'] === 'incomplete' && m.count === 5,
    `SCORM attempt 1 (0 of 5): score.raw ${m.data['cmi.core.score.raw']}, lesson_status ${m.data['cmi.core.lesson_status']}, ${m.count} interactions`);
  await p.evaluate(() => window.__l4.go('S22'));
  await p.click('.w-takeaway[data-id="a"]'); await p.click('.w-next'); await p.click('[data-action="finish"]'); await p.click('[data-action="finish"]');
  m = await p.evaluate(() => window.__scormMock.report());
  expect(m.data['cmi.core.lesson_status'] === 'failed' && m.data['cmi.core.score.raw'] === '0', `SCORM finish below 80: lesson_status ${m.data['cmi.core.lesson_status']}, score.raw ${m.data['cmi.core.score.raw']}`);
  await p.evaluate(() => window.__l4.go('S21R'));
  await p.click('[data-action="retake"]');
  await answerAll((o) => o.correct, 'b');
  m = await p.evaluate(() => window.__scormMock.report());
  const ids = Array.from({ length: m.count }, (_, n) => m.data[`cmi.interactions.${n}.id`] + '=' + m.data[`cmi.interactions.${n}.result`]).join(',');
  // attempt 1's five (version a), the S22 takeaway, attempt 2's five (version b: L4_S21_1b ...)
  const s21 = ids.split(',').filter((x) => x.startsWith('L4_S21_'));
  expect(m.data['cmi.core.score.raw'] === '100' && m.data['cmi.core.lesson_status'] === 'passed' && m.count === 11 && s21.length === 10
    && s21.slice(0, 5).every((x) => /^L4_S21_\d=/.test(x)) && s21.slice(5).every((x) => /^L4_S21_\db=correct$/.test(x)) && !m.errors.length,
    `SCORM retake (5 of 5): score.raw ${m.data['cmi.core.score.raw']} (the latest attempt), lesson_status ${m.data['cmi.core.lesson_status']}, ${m.count} interactions (${ids})`);
  const susp = m.data['cmi.suspend_data'] || '';
  expect(/"k":\{"n":2,"p":1,"s":100\}|"k":\{[^}]*"n":2[^}]*\}/.test(susp), `SCORM suspend_data keeps the attempt (${(/"k":\{[^}]*\}/.exec(susp) || [''])[0]})`);
  await p.close();
}

// The SCORM data after the whole lesson, then a relaunch (entry=resume with the saved suspend data).
async function scormChecks(p, ids) {
  console.log('\nSCORM 1.2 data');
  const m = await p.evaluate(() => { window.__l4.tracking.terminate(); return window.__scormMock.report(); });
  const d = m.data;
  expect(!m.errors.length, `SCORM: every call valid for SCORM 1.2 (${m.calls.length} calls)` + (m.errors.length ? ': ' + m.errors.slice(0, 5).join(' | ') : ''));
  expect(!m.identity.length, 'SCORM: no identity element read or written (student_id, student_name)' + (m.identity.length ? ': ' + m.identity.join(', ') : ''));
  const rows = Array.from({ length: m.count }, (_, n) => {
    const g = (f) => d[`cmi.interactions.${n}.${f}`];
    return { id: g('id'), type: g('type'), response: g('student_response'), result: g('result'), latency: g('latency'), time: g('time'), weighting: g('weighting'), pattern: g('correct_responses.0.pattern') };
  });
  const metaOf = (id) => C.screens.flatMap((s) => [...(s.tracking || []), ...(s.stops || []).map((x) => x.tracking)]).find((t) => t.id === id);
  const once = rows.length === ids.length && new Set(rows.map((r) => r.id)).size === ids.length && ids.every((id) => rows.some((r) => r.id === id));
  expect(once, `SCORM: ${rows.length} interactions, each id written once (${ids.length} in the lesson)`);
  const bad = rows.filter((r) => { const t = metaOf(r.id); return !t || r.type !== t.type || r.weighting !== (t.scored ? '1' : '0') || (t.correctResponse !== null && r.pattern !== String(t.correctResponse).toLowerCase())
    || (t.correctResponse === null && r.pattern !== undefined) || !r.latency || !r.time || (t.result === 'neutral' && r.result !== 'neutral'); });
  expect(!bad.length, 'SCORM: every interaction carries type, response, result, latency, time, weighting (1 for the 5 scored), correct pattern from the content' + (bad.length ? ': ' + bad.map((r) => r.id).join(', ') : ''));
  const free = rows.filter((r) => r.type === 'fill-in');
  const wantFree = ids.filter((id) => metaOf(id)?.type === 'fill-in').length;
  expect(free.length === wantFree && free.every((r) => r.response.length <= 250 && r.result === 'neutral'),
    `SCORM: ${free.length} fill-in responses (case title twice: S02 and S18B, problem, the three-part sketch, the S12B metric, the S17B notes; NL4: no S19 metric), at most 250 chars, neutral`);
  expect(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '80' && d['cmi.core.score.min'] === '0' && d['cmi.core.score.max'] === '100' && d['cmi.core.exit'] === '',
    `SCORM: lesson_status ${d['cmi.core.lesson_status']}, score.raw ${d['cmi.core.score.raw']} (0 to 100, from S21 first attempts), exit "${d['cmi.core.exit']}"`);
  expect(/^\d{4}:\d{2}:\d{2}\.\d{2}$/.test(d['cmi.core.session_time'] || '') && m.finished, `SCORM: session_time ${d['cmi.core.session_time']}, LMSFinish once`);
  const susp = d['cmi.suspend_data'] || '';
  const { decode, encode } = await import('../src/state.js');
  const full = decode(susp);
  // every free-text field full: each store key at its own field's maxlength (NL3: S02's title and
  // problem, the three-part sketch, the S12B metric, the S17B notes; NL4: S18B's title, no S19 metric)
  const maxOf = {};
  for (const s of C.screens) for (const f of [...(s.fields || []), ...Object.values(s.states || {}).flatMap((st) => st.fields || []), ...(s.step2?.field ? [s.step2.field] : [])]) if (f.store) maxOf[f.store] = Math.max(maxOf[f.store] || 0, f.maxLength);
  for (const k of Object.keys(maxOf)) full.f[k] = 'x'.repeat(maxOf[k]);
  const fullLen = encode(full).length;
  expect(susp.length < 4096 && fullLen < 4096, `SCORM: suspend_data ${susp.length} chars after the whole lesson; ${fullLen} with all ${Object.keys(maxOf).length} free-text fields full (each at its maxlength; limit 4096)`);
  expect(d['cmi.core.lesson_location'] === full.s, `SCORM: lesson_location "${d['cmi.core.lesson_location']}" = the saved place`);

  console.log('\nSCORM relaunch (entry=resume)');
  const r = await open('', { lms: { 'cmi.core.entry': 'resume', 'cmi.suspend_data': susp, 'cmi.core.lesson_location': d['cmi.core.lesson_location'], 'cmi.core.lesson_status': d['cmi.core.lesson_status'] } });
  const back = await r.evaluate(() => ({ at: window.__l4.current, dialog: !!document.querySelector('.w-dialog [data-action="resume"]'), title: window.__l4.state.f.L4_CASE_TITLE,
    metric: window.__l4.state.f.L4_CASE_BASELINE, done: window.__l4.state.d.length, mock: window.__scormMock.report() }));
  expect(back.at === d['cmi.core.lesson_location'] && back.dialog && back.title === TITLE && back.metric && back.done === full.d.length,
    `SCORM resume: lands on ${back.at} with the resume prompt, ${back.done} screens done, case title and the S12B metric back`);
  expect(back.mock.data['cmi.core.lesson_status'] === 'passed' && !back.mock.errors.length && back.mock.count === 0,
    'SCORM resume: lesson_status stays passed (never downgraded), no interaction written again');
  await r.close();
}

/* ---------- S01 wrong card by mouse: the frame's wrong card, no focus ring ---------- */
// The one mouse check in this walk: a click must not leave the keyboard focus ring on the card.
console.log('\nS01 wrong card (mouse click)');
{
  const p = await open('?reset=1&screen=S01');
  await p.click('.w-opt[data-id="a"]');
  await p.mouse.move(5, 300); // off the card: no hover state in the check or the screenshot
  const r = await p.evaluate(() => {
    const row = document.querySelector('.w-opt[data-id="a"]');
    const cs = getComputedStyle(row);
    const mark = row.querySelector('.w-opt-mark');
    const ms = getComputedStyle(mark);
    return { focused: document.activeElement === row, visible: row.matches(':focus-visible'), outline: cs.outlineStyle, bg: cs.backgroundColor, color: cs.color,
      label: getComputedStyle(row.querySelector('.w-opt-label')).color, border: cs.borderTopWidth + ' ' + cs.borderTopColor, markBg: ms.backgroundColor, markColor: ms.color,
      x: mark.querySelector('svg')?.getAttribute('aria-label'), w: Math.round(mark.querySelector('svg')?.getBoundingClientRect().width || 0),
      others: [...document.querySelectorAll('.w-opt:not([data-id="a"])')].map((b) => b.dataset.result || '-').join() };
  });
  expect(r.focused && !r.visible && r.outline === 'none', `S01 click: the card has focus but no focus ring (outline ${r.outline})`);
  expect(r.bg === 'rgb(255, 255, 255)' && r.color === 'rgb(17, 26, 32)' && r.label === 'rgb(17, 26, 32)' && /^3(\.2)?px rgb\(204, 0, 0\)$/.test(r.border) /* .25cqw; Chrome draws it on whole device pixels */,
    `S01 wrong card: dark text on white, a 3.2px #CC0000 border (${r.border})`);
  expect(r.markBg === 'rgb(204, 0, 0)' && r.markColor === 'rgb(255, 255, 255)' && r.x === UI.feedback.wrongPrefix && r.w === 17 && r.others === '-,-',
    `S01 wrong card: the filled red marker with a white X (${r.w}px, label "${r.x}"), the other cards plain`);
  await expectBand(p, 'S01 wrong by mouse', { state: 'wrong', text: opt('S01', 'a').feedback, unlocked: false });
  await expectLayout(p, 'S01 wrong by mouse');
  await shot(p, 's01-wrong.png');
  await p.close();
}

/* ---------- ghost hand with motion: the S03 demo, on target, any pointer input stops it at once ---------- */
console.log('\nghost hand (motion)');
{
  const p = await open('?reset=1&screen=S03', { motion: true });
  await p.waitForSelector('.w-ghost', { timeout: 3000 }).catch(() => {});
  // FX1 B1: the sweep down over the cards ends just under them and holds there with its "Pick two" chip
  await wait(2400);
  const spot = await ghostSpot(p, 'options-sweep-end');
  const chip = await p.evaluate(() => document.querySelector('.w-ghost-chip')?.textContent);
  const mid = { hand: !!spot, off: spot ? spot.off : -1, onOption: spot ? spot.onOption : true };
  await p.mouse.click(700, 690); // a pointer press anywhere (between Previous and Next)
  const after = await p.evaluate(() => ({ hand: !!document.querySelector('.w-ghost'), pressed: document.querySelectorAll('.w-opt[aria-pressed="true"]').length, ev: window.__l4.tracking.events.length }));
  expect(mid.hand && mid.off >= 0 && mid.off <= 2 && !mid.onOption && chip === UI.ghost.pickTwo && !after.hand && !after.pressed && !after.ev,
    `ghost hand: the sweep ends under the cards (${mid.off}px off) with "${chip}", on no card, tapping none; a pointer press stops it at once, nothing selected or tracked`);
  // a seen type plays only after 8 s without input
  await p.evaluate(() => window.__l4.go('S03'));
  await wait(1500);
  const early = await p.evaluate(() => !!document.querySelector('.w-ghost'));
  expect(!early, 'ghost hand, seen type: no demo within 1.5 s of arriving (it waits for 8 s without input)');
  expect(!p.errors.length, 'ghost hand: no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}

/* ---------- NL2 drag and drop by pointer: S04 drag (a wrong drop returns), S05b click to pick up ---------- */
console.log('\ndrag and drop (pointer)');
{
  const p = await open('?reset=1&screen=S04', { motion: true });
  // the ghost hand (motion): it grabs the card and carries it down, then any pointer input stops it and the card is home
  await p.waitForSelector('.w-ghost', { timeout: 3000 });
  await wait(1000);
  const mid = await p.evaluate(() => ({ moved: getComputedStyle(document.querySelector('[data-action="card"]')).transform !== 'none', ev: window.__l4.tracking.events.length }));
  await p.mouse.click(700, 690);
  await wait(100);
  const after = await p.evaluate(() => ({ hand: !!document.querySelector('.w-ghost'), card: getComputedStyle(document.querySelector('[data-action="card"]')).transform }));
  expect(mid.moved && !mid.ev && !after.hand && after.card === 'none', 'S04 ghost hand: it carries the card down; a pointer press stops it at once and the card is back, nothing tracked');
  const centre = async (sel) => { const b = await (await p.$(sel)).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  const dragTo = async (sel, release = true) => {
    const a = await centre('[data-action="card"]'), b = await centre(sel);
    await p.mouse.move(a.x, a.y); await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(a.x + (b.x - a.x) * i / 10, a.y + (b.y - a.y) * i / 10);
    const over = await p.evaluate((s) => document.querySelector(s).dataset.over, sel);
    if (release) await p.mouse.up();
    return over;
  };
  const over = await dragTo('.w-drop[data-column="c"]');
  await wait(400);
  // FX1 E2: a drop places the card in that column as it is (checked later), card 2 comes up
  await expectBand(p, 'S04 card 1 dragged onto Output (placed)', { state: 'hint', text: S.S04.hint, unlocked: false });
  const back = await p.evaluate(() => ({ t: document.querySelector('[data-action="card"]').style.transform, text: document.querySelector('.w-deck-text').textContent,
    placed: document.querySelector('.w-drop[data-column="c"] .w-placed')?.dataset.state, count: document.querySelector('.w-deck-count').textContent }));
  expect(over === 'true' && !back.t && back.text === S.S04.cards[1].text && back.placed === 'pending' && back.count === '2 of 5',
    'S04 pointer drag: the column under the card lights up; the drop places it there unmarked, card 2 comes up');
  // let go outside any column: the card slides back, nothing is answered
  const a = await centre('[data-action="card"]');
  await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x + 300, a.y + 10, { steps: 6 }); await p.mouse.up();
  await wait(400);
  expect(await p.evaluate(() => !document.querySelector('[data-action="card"]').style.transform && window.__l4.tracking.events.length === 0), 'S04 a drop outside the columns: the card returns, nothing tracked');
  expect(!p.errors.length, 'S04 pointer: no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}
{
  const p = await open('?reset=1&screen=S05b');
  await p.keyboard.press('Shift');
  await p.click('.w-label-card[data-label="gateway"]');
  const picked = await p.evaluate(() => ({ pressed: document.querySelector('.w-label-card[data-label="gateway"]').getAttribute('aria-pressed'), armed: document.querySelector('.w-target').dataset.armed }));
  await p.click('.w-target[data-target="b"]');
  await expectBand(p, 'S05b click Gateway, click its target (placed)', { state: 'hint', text: S.S05b.hint, unlocked: false });
  expect(picked.pressed === 'true' && picked.armed === 'true' && await p.evaluate(() => document.querySelector('.w-target[data-target="b"]').dataset.placed === 'pending'),
    'S05b click alternative (no dragging): a click picks the label up (the places pulse, turquoise), a click on a target drops it there');
  await expectLayout(p, 'S05b one placed');
  expect(!p.errors.length, 'S05b pointer: no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}

/* ---------- NL3 flags by pointer: S12 (fields) and S13 (steps), drag a flag; a drop outside returns it ---------- */
async function flagDrag(id, flagId, wrongT, rightT, wrongText, rightText) {
  const p = await open(`?reset=1&screen=${id}`, { motion: true });
  const centre = async (sel) => { const b = await (await p.$(sel)).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  const drag = async (to) => {
    const a = await centre(`.w-flag-card[data-flag="${flagId}"]`), b = to ? await centre(`.w-target[data-target="${to}"]`) : null;
    await p.mouse.move(a.x, a.y); await p.mouse.down();
    const end = b || { x: a.x, y: a.y + 120 }; // below the flag: no target there (S12: the side column, S13: under the tray)
    for (let i = 1; i <= 10; i++) await p.mouse.move(a.x + (end.x - a.x) * i / 10, a.y + (end.y - a.y) * i / 10);
    const over = to ? await p.evaluate((t) => document.querySelector(`.w-target[data-target="${t}"]`).dataset.over, to) : null;
    await p.mouse.up();
    await wait(400);
    return over;
  };
  await drag(null);
  expect(await p.evaluate((f) => !document.querySelector(`.w-flag-card[data-flag="${f}"]`).style.transform && !window.__l4.tracking.events.length, flagId), `${id} pointer: a drop outside the targets returns the flag, nothing tracked`);
  // FX1 E2: a drop places the flag there as it is (its line comes at Check)
  const over = await drag(wrongT);
  await expectBand(p, `${id} flag dragged onto ${wrongT} (placed)`, { state: 'hint', text: S[id].hint, unlocked: false });
  expect(over === 'true' && await p.evaluate((t) => document.querySelector(`.w-target[data-target="${t}"]`).dataset.placed === 'pending', wrongT),
    `${id} pointer: the target under the flag lights up; the drop places the flag there unmarked (its line "${(wrongText || '').slice(0, 30)}..." waits for Check)`);
  await expectLayout(p, `${id} one flag placed by pointer`);
  expect(!p.errors.length, `${id} pointer: no console errors` + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}
await flagDrag('S12', 'r2', '8', '7', S.S12.map[7].feedback, S.S12.map[6].feedback);
await flagDrag('S13', 'end', '3', '5', S.S13.flags[1].feedback[3], '');

/* ---------- S03 both wrong: "Not quite." ---------- */
console.log('\nS03 both wrong');
{
  const p = await open('?reset=1&screen=S03');
  await tabTo(p, '.w-opt[data-id="a"]');
  await press(p, ' ');
  await press(p, 'ArrowRight', 2);
  await press(p, ' ');
  await tabTo(p, '[data-action="check"]');
  await press(p, 'Enter');
  await expectBand(p, 'S03 Check a + c', { state: 'wrong', text: opt('S03', 'a').feedback, unlocked: false });
  const oo = await opts(p);
  expect(oo.a === 'wrong' && oo.c === 'wrong' && oo.b === '' && oo.d === '', `S03 both wrong: verdict "${UI.feedback.wrongPrefix}", feedback of the first wrong card, both red`);
  await expectLayout(p, 'S03 not quite');
  await p.close();
}

/* ---------- FX1 B2: two attempts used up: the right answer is shown, Next unlocks, the first attempt is tracked ---------- */
console.log('\ntwo attempts used up (S01, S04)');
{
  const p = await open('?reset=1&debug=1&screen=S01');
  await p.keyboard.press('Shift');
  await p.click('.w-opt[data-id="a"]');
  await p.click('.w-opt[data-id="c"]');
  await expectBand(p, 'S01 second wrong attempt', { state: 'neutral', verdict: UI.feedback.revealed, text: opt('S01', 'b').feedback, unlocked: true });
  const oo = await opts(p);
  const ev = (await events(p)).filter((e) => e.trackingId === 'L4_S01_1').map((e) => `${e.kind}:${e.response}/${e.result}`).join();
  expect(oo.b === 'correct' && oo.c === 'wrong' && oo.a === '' && ev === 'answer:a/wrong,retry:c/wrong',
    `S01 after two wrong attempts: the right answer marked and explained ("${UI.feedback.revealed}", neutral strip), Next unlocked; tracked: ${ev}`);
  await expectLayout(p, 'S01 revealed');
  await p.close();
}
{
  const p = await open('?reset=1&debug=1&screen=S04');
  await p.keyboard.press('Shift');
  const deck = async (cols) => { for (const c of cols) { await p.click('[data-action="card"]'); await p.click(`.w-drop[data-column="${c}"]`); } };
  await deck(['b', 'b', 'a', 'b', 'c']);
  await p.click('[data-action="check"]');
  await deck(['c']);
  await p.click('[data-action="check"]');
  const r = await p.evaluate(() => ({ shown: [...document.querySelectorAll('.w-placed[data-state="shown"]')].map((x) => x.closest('.w-drop').dataset.column + x.dataset.card).join(),
    right: document.querySelectorAll('.w-placed[data-state="right"]').length }));
  await expectBand(p, 'S04 after attempt 2', { state: 'neutral', verdict: UI.feedback.revealedPlaces, text: S.S04.cards[0].feedback.correct, unlocked: true });
  await p.click('.w-placed[data-state="shown"] [data-action="explain"]');
  expect(r.shown === 'a1' && r.right === 4 && (await band(p)).text === S.S04.cards[0].feedback.correct,
    `S04 after attempt 2: card 1 moved to Trigger with a check (shown), its explanation in the strip (also on a click), Next unlocked`);
  await expectLayout(p, 'S04 shown');
  await p.close();
}

/* ---------- NL3: no fast-track cards left (FT1 to FT4 are the W1 to W4 warm-ups) ---------- */
console.log('\nno fast-track cards');
expect(!C.screens.some((s) => s.variant === 'challenge' || s.routing) && !C.chapters.some((c) => c.fastTrack) && !C.lesson.slice.some((id) => /^FT/.test(id)),
  'no fast-track card, routing or chapter fast track left in the content (W1 to W4 replace FT1 to FT4)');

/* ---------- NL4 S21 all first answers wrong: S21R not passed, review links, finish failed, retake (shuffled) passes for good ---------- */
console.log('\nS21 first attempts wrong, S21R, S22 finish failed, retake');
{
  const p = await open('?reset=1&screen=S21');
  for (const [k, wrongId, rightId] of [[0, 'a', 'c'], [1, 'a', 'b'], [2, 'b', 'a'], [3, 'a', 'd']]) {
    await tabTo(p, `.w-kc-opt[data-id="${wrongId}"]`);
    await press(p, 'Enter');
    await tabTo(p, `.w-kc-opt[data-id="${rightId}"]`, { back: rightId < wrongId });
    await press(p, 'Enter');
    await expectBand(p, `S21 item ${k + 1} retry right`, { state: 'correct', text: S.S21.items[k].options.find((o) => o.id === rightId).feedback, unlocked: false });
    await tabTo(p, '[data-action="nextQuestion"]');
    await press(p, 'Enter');
  }
  for (const n of [5, 7]) { await tabTo(p, `.w-kc-tile[data-n="${n}"]`); await press(p, ' '); }
  await tabTo(p, '[data-action="check"]');
  await press(p, 'Enter');
  await expectBand(p, 'S21 item 5 tiles 5 + 7', { state: 'partial', verdict: UI.feedback.oneOfTwo, text: S.S21.items[4].tiles[6].feedback, unlocked: false });
  await expectLayout(p, 'S21 item 5 one of two');
  await tabTo(p, '.w-kc-tile[data-n="6"]', { back: true });
  await press(p, ' ');
  await tabTo(p, '[data-action="check"]');
  await press(p, 'Enter');
  const sc = await p.evaluate(() => window.__l4.score());
  expect(sc.raw === 0 && await isActive(p, '.w-next'), `S21: every item fixed on retry, score ${sc.raw}: only first attempts count; Next focused`);
  await press(p, 'Enter');
  // S21R not passed: the five missed items, each with its line and review link; Retake now; Next still open
  await expectNewScreen(p, 'S21R', 'S21 Next (attempt 1, 0 of 5)', { heading: '0 of 5 on first try (0 of 100). Pass mark: 80.' });
  const r = await p.evaluate(() => ({ h: document.querySelector('#w-instruction').textContent, chip: document.querySelector('.w-result-chip').textContent,
    missed: [...document.querySelectorAll('.w-missed-item')].map((li) => li.dataset.item + '>' + li.querySelector('[data-action="review"]').dataset.screen + ':' + li.querySelector('.w-missed-line').textContent + ':' + li.querySelector('[data-action="review"]').textContent).join('|'),
    retake: !!document.querySelector('[data-action="retake"]'), next: document.querySelector('.w-next').dataset.locked }));
  const wantMissed = S.S21R.missed.map((m) => `${m.item}>${m.screen}:${m.text}:${S.S21R.reviewLabel.replace('{n}', chapterNo(C, S[m.screen].chapter))}`).join('|');
  expect(r.h === '0 of 5 on first try (0 of 100). Pass mark: 80.' && r.chip === S.S21R.notPassed.chip && r.missed === wantMissed && r.retake && r.next === 'false',
    `S21R not passed: "${r.h}", "${r.chip}", five missed items with their review links, Retake now, Next open`);
  await expectLayout(p, 'S21R not passed');
  // a review link: the screen opens with "Back to the check" in the footer; Next there keeps it; the chip comes back
  await tabTo(p, '[data-action="review"][data-screen="S11"]');
  await press(p, 'Enter');
  const chip1 = await p.evaluate(() => ({ at: window.__l4.current, chip: !document.querySelector('[data-action="backToCheck"]').hidden && document.querySelector('[data-action="backToCheck"]').textContent }));
  await p.evaluate(() => window.__l4.go('S12'));
  const chip2 = await p.evaluate(() => !document.querySelector('[data-action="backToCheck"]').hidden);
  await p.click('[data-action="backToCheck"]');
  const chip3 = await p.evaluate(() => ({ at: window.__l4.current, hidden: document.querySelector('[data-action="backToCheck"]').hidden }));
  expect(chip1.at === 'S11' && chip1.chip === UI.buttons.backToCheck && chip2 && chip3.at === 'S21R' && chip3.hidden,
    `"Review Chapter ${chapterNo(C, S.S11.chapter)}" opens S11 with "${chip1.chip}" in the footer, it stays on the next screen, and brings the learner back to S21R (then it goes)`);
  // finish below 80: failed
  await p.evaluate(() => window.__l4.go('S22'));
  await tabTo(p, '.w-takeaway[data-id="c"]');
  await press(p, 'Enter');
  await press(p, 'Enter'); // Next: step 2
  await tabTo(p, '[data-action="finish"]');
  await press(p, 'Enter');
  await expectBand(p, 'S22 Finish without download', { state: 'notice', text: S.S22.step2.feedback.finishConfirm, unlocked: false });
  expect(!(await p.evaluate(() => window.__l4.tracking.events.some((e) => e.kind === 'finish'))), 'S22: the first Finish without a download only asks to confirm');
  await expectLayout(p, 'S22 finish confirm');
  await press(p, 'Enter');
  const fin = (await p.evaluate(() => window.__l4.tracking.events)).filter((e) => e.kind === 'finish');
  expect(fin.length === 1 && fin[0].status === 'failed' && fin[0].score === 0, `S22 second Finish: lesson status ${fin[0]?.status}, score ${fin[0]?.score}`);
  // back to the check: Retake now, a new attempt with the options in a new order, every first answer right
  await p.evaluate(() => window.__l4.go('S21R'));
  await tabTo(p, '[data-action="retake"]');
  await press(p, 'Enter');
  await expectNewScreen(p, 'S21', 'Retake now');
  // FX3: the retake shows version b (its own stems, options and interaction ids), options shuffled
  const B = S.S21.items.map((it) => ({ ...it, ...it.b }));
  const order = await p.evaluate(() => [...document.querySelectorAll('.w-kc-opt')].map((b) => b.dataset.id).join(''));
  const stem1 = await p.evaluate(() => document.querySelector('.w-kc-stem').textContent);
  expect(order !== 'abcd' && stem1 === B[0].stem && await p.evaluate(() => window.__l4.state.k.n === 2 && !window.__l4.state.a.L4_S21_1 && !window.__l4.state.d.includes('S21R')),
    `Retake: attempt 2, the answers cleared, version b ("${stem1}"), item 1's options in a new order (${order})`);
  for (const k of [0, 1, 2, 3]) {
    const right = B[k].options.find((o) => o.correct).id;
    await tabTo(p, `.w-kc-opt[data-id="${right}"]`);
    await press(p, 'Enter');
    await expectBand(p, `S21 retake item ${k + 1}b right`, { state: 'correct', text: B[k].options.find((o) => o.id === right).feedback, unlocked: false });
    await tabTo(p, '[data-action="nextQuestion"]'); await press(p, 'Enter');
  }
  const h5 = await p.evaluate(() => document.querySelector('#w-instruction').textContent + '|' + [...document.querySelectorAll('.w-kc-tile .w-opt-label')].map((t) => t.textContent).join('/'));
  expect(h5 === B[4].instruction + '|' + B[4].tiles.map((t) => t.text).join('/'), `S21 retake item 5b: "${B[4].instruction}", the eight lines of the sales map`);
  for (const n of B[4].tiles.filter((t) => t.correct).map((t) => t.n)) { await tabTo(p, `.w-kc-tile[data-n="${n}"]`, { back: true }); await press(p, ' '); }
  await tabTo(p, '[data-action="check"]');
  await press(p, 'Enter');
  const ev = await p.evaluate(() => window.__l4.tracking.events);
  const ans = (id) => ev.filter((e) => e.kind === 'answer' && e.trackingId === id).map((e) => e.response + '/' + e.result).join();
  const scores = ev.filter((e) => e.kind === 'score').map((e) => `${e.score}/${e.passed}/${e.attempt}`).join();
  expect(ans('L4_S21_1') === 'a/wrong' && ans('L4_S21_1b') === 'b/correct' && ans('L4_S21_5b') === '3,5/correct' && scores === '0/false/1,100/true/2' && await p.evaluate(() => window.__l4.state.fin === 'passed' && window.__l4.state.k.p === 1),
    `retake: version a's ids on attempt 1 (L4_S21_1 ${ans('L4_S21_1')}), version b's on attempt 2 (L4_S21_1b ${ans('L4_S21_1b')}, L4_S21_5b ${ans('L4_S21_5b')}); scores ${scores}; the lesson now passed for good (state.fin passed)`);
  await press(p, 'Enter');
  const r2 = await p.evaluate(() => ({ chip: document.querySelector('.w-result-chip').textContent, retake: !!document.querySelector('[data-action="retake"]') }));
  expect(r2.chip === S.S21R.passed.chip && !r2.retake, `S21R after the retake: "${r2.chip}", no retake`);
  // a third attempt alternates back to version a
  const stem3 = await p.evaluate(() => { window.__l4.state.k.n = 3; window.__l4.state.d = window.__l4.state.d.filter((x) => x !== 'S21'); window.__l4.go('S21'); return document.querySelector('.w-kc-stem').textContent; });
  expect(stem3 === S.S21.items[0].stem, `attempt 3: version a again ("${stem3}")`);
  expect(!p.errors.length, 'S21 / S21R / S22 run: no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}

/* ---------- NL4 S19 with nothing written: "Not filled in", Copy disabled; Next stays locked until Open workbook ---------- */
console.log('\nS19 empty');
{
  const p = await open('?reset=1&screen=S19');
  const r = await p.evaluate(() => ({ empty: [...document.querySelectorAll('.w-copy-rows dd')].every((d) => d.dataset.empty === 'true' && d.textContent === document.querySelector('.w-copy-rows dd').textContent),
    text: document.querySelector('.w-copy-rows dd').textContent, disabled: [...document.querySelectorAll('[data-action="copy"]')].every((b) => b.disabled) }));
  expect(r.empty && r.text === UI.record.empty && r.disabled, `S19 with nothing written: every part reads "${r.text}", every Copy disabled`);
  await expectBand(p, 'S19 empty', { state: 'hint', text: S.S19.hint, unlocked: false, lockedWhy: UI.footer.locked.openWorkbook });
  await expectLayout(p, 'S19 empty');
  await p.close();
}

/* ---------- V1 in the player: stops, seek blocked, end ---------- */
console.log('\nV1 player (keyboard)');
{
  const p = await open('?reset=1&screen=V1');
  await expectNewScreen(p, 'V1', 'V1 start');
  await expectLayout(p, 'V1 play view');
  await videoRun(p, 'V1', { shotStop: 'v1-stop.png' });
  const ev = (await p.evaluate(() => window.__l4.tracking.events)).filter((e) => e.trackingId?.startsWith('L4_V1_')).map((e) => `${e.kind}:${e.trackingId}=${e.response}/${e.result}`);
  expect(ev.join() === 'answer:L4_V1_1=a/wrong,retry:L4_V1_1=b/correct,answer:L4_V1_2=b/wrong,retry:L4_V1_2=a/correct', `bus, V1 stops: ${ev.join(', ')}`);
  expect(!p.errors.length, 'V1: no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}

// (the P1.5 artboard comparisons are retired: tools/compare-nl1.mjs sets the NL1 frames side by side)

await browser.close();
server.close();
console.log(fails.length ? `\nwalk FAILED (${fails.length})` : '\nwalk passed');
process.exit(fails.length ? 1 : 0);
