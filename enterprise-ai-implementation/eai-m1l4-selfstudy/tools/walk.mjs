// Keyboard-only walk through the slice in the approved look (P1.5). Puppeteer drives Tab, Shift+Tab,
// arrows, Enter, Space, Escape and typing only (one separate mouse check: a clicked wrong row shows
// no focus ring; its screenshot is s01-wrong.png). Covers the rail, the menu (open,
// navigate, Escape), S01, S02, FT1 and its routes, S03 (wrong then right). Asserts on every state:
//   the band equals the content JSON (state, verdict word, text, route buttons); Next locked (with
//   the reason as its aria-label) before the right answer or the save, unlocked and focused after;
//   focus lands on the instruction heading on each new screen; FT1 routes land on the right screen;
//   the band never overlaps the screen's content and keeps its interaction area's width; nothing
//   clipped; contrast, text size and targets; one first-attempt tracking event per interaction id.
// Usage: npm run walk                 checks only
//        npm run walk -- --shots      checks + screenshots into review/p1.5/ (and the artboard
//                                     comparisons compare-s01.png, compare-s03.png)
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';

const SHOTS = process.argv.includes('--shots');
// --scorm (npm run test:scorm): the main path runs against the mock SCORM 1.2 API (tools/scorm-mock.js),
// then the SCORM data is checked and a relaunch with entry=resume must land on the saved place
const SCORM = process.argv.includes('--scorm');
const MOCK = readFileSync(join(ROOT, 'tools', 'scorm-mock.js'), 'utf8');
const OUT = join(ROOT, 'review', 'p1.5');
const C = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
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

async function open(query, { lms = null } = {}) {
  const page = await browser.newPage();
  if (lms) await page.evaluateOnNewDocument(`${MOCK}\n;window.installScormMock(${JSON.stringify(lms)});`);
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  // reduced motion: no transitions, so every assertion and screenshot sees the settled state
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + query, { waitUntil: 'networkidle0' });
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

// Sort, tray mode: select a tray card (Space), then a column (Enter), keyboard only.
// reselect: false when the card is still selected after a wrong column.
async function trayPlace(p, cardKey, col, { reselect = true } = {}) {
  if (reselect) { await tabTo(p, `.w-tray-card[data-card="${cardKey}"]`, { max: 60 }); await press(p, ' '); }
  await tabTo(p, `.w-sort-target[data-column="${col}"]`, { max: 60 });
  await press(p, 'Enter');
}

// The video player, keyboard only: play (time runs, caption = the marked transcript line), captions
// toggle, then for each stop: End on the seek slider stops exactly at the next open stop (never past
// it), the stop view opens with Resume locked; a wrong option, then the right one; Resume plays on.
// After the last stop End reaches the end and Next unlocks. Leaves focus on Next.
async function videoRun(p, id, { shotPlaying = null, shotStop = null, shotWrong = null } = {}) {
  const V = S[id];
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1 && document.querySelectorAll('.w-tline').length > 0);
  const head = await p.evaluate(() => ({ meta: document.querySelector('.w-video-meta').textContent, guiding: document.querySelector('.w-guiding').textContent, src: document.querySelector('.w-video').getAttribute('src'),
    markers: [...document.querySelectorAll('.w-seek-stop')].map((m) => parseFloat(m.style.left).toFixed(2)).join() }));
  const wantMeta = `${V.title} · ${UI.video.meta.replace('{length}', V.media.length).replace('{n}', V.stops.length)}`;
  expect(head.meta === wantMeta && head.guiding === `${UI.video.guiding} ${V.guidingQuestion}` && head.src === V.media.src
    && head.markers === V.stops.map((s) => ((100 * s.t) / V.media.duration).toFixed(2)).join(),
  `${id}: "${head.meta}", guiding question, video ${head.src} from content, one marker per stop on the timeline`);
  const trClosed = await p.evaluate(() => document.querySelector('.w-transcript').hidden && document.querySelector('.w-tr').getAttribute('aria-pressed') === 'false' && document.querySelector('.w-video-view').dataset.transcript === 'closed');
  await tabTo(p, '.w-tr');
  await press(p, 'Enter');
  const trOpen = await p.evaluate(() => !document.querySelector('.w-transcript').hidden && document.querySelector('.w-tr').getAttribute('aria-pressed') === 'true' && document.querySelector('.w-video-view').dataset.transcript === 'open');
  expect(trClosed && trOpen, `${id}: the transcript starts closed (player centred) and the transcript button opens it`);
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
    const st = await p.evaluate(() => ({ t: document.querySelector('.w-video').currentTime, q: document.querySelector('.w-stop-q').textContent, label: document.querySelector('.w-stop-panel .w-label').textContent,
      focus: document.activeElement.classList.contains('w-stop-q'), locked: document.querySelector('[data-action="resume"]').getAttribute('aria-disabled'),
      lockLabel: document.querySelector('[data-action="resume"]').getAttribute('aria-label'), paused: document.querySelector('.w-paused').textContent }));
    expect(Math.abs(st.t - stop.t) < 0.1, `${id} stop ${k + 1}: playback pauses at ${st.t.toFixed(2)}s = the stop (${stop.t}s)`);
    expect(st.q === stop.question && st.focus && st.locked === 'true' && st.lockLabel === UI.video.resumeLocked
      && st.label === UI.video.stopLabel.replace('{i}', k + 1).replace('{n}', V.stops.length).replace('{title}', V.title) && st.paused === UI.video.pausedAt.replace('{t}', mmssW(stop.t)),
    `${id} stop ${k + 1}: paused frame "${st.paused}", "${st.label}", question focused, Resume locked`);
    const logoOff = await p.evaluate(() => document.querySelector('.w-logo').getBoundingClientRect().left >= document.querySelector('.w-stop-frame').getBoundingClientRect().right);
    expect(logoOff, `${id} stop ${k + 1}: the Wawiwa logo sits off the paused still (top of the question panel)`);
    if (k === 0 && shotStop) await shotR2(p, shotStop);
    const wrongI = stop.options.findIndex((o) => !o.correct), rightI = stop.options.findIndex((o) => o.correct);
    await tabTo(p, `.w-opt-stack[data-id="${stop.options[wrongI].id}"]`);
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
    const back = await p.evaluate(() => ({ view: !document.querySelector('.w-video-view').hidden, playing: !document.querySelector('.w-video').paused, focus: document.activeElement.dataset.action }));
    expect(back.view && back.playing && back.focus === 'play', `${id} stop ${k + 1}: Resume returns to the player, the video plays on, focus on Play / Pause`);
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
const band = (page) => page.evaluate(() => {
  const r = document.querySelector('.w-band');
  return { state: r.dataset.state, verdict: r.querySelector('.w-band-verdict').textContent.trim(), text: r.querySelector('.w-band-text').textContent.trim(),
    actions: [...r.querySelectorAll('.w-band-actions button')].map((b) => b.dataset.action), tool: [...r.querySelectorAll('.w-band-tool button')].map((b) => b.dataset.action),
    live: r.querySelector('[aria-live]')?.getAttribute('aria-live') };
});
const nextState = (page) => page.evaluate(() => { const n = document.querySelector('.w-next'); return { locked: n.dataset.locked === 'true', aria: n.getAttribute('aria-disabled'), label: n.getAttribute('aria-label') }; });
const screen = (page) => page.evaluate(() => window.__l4.current);
const opts = (page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.w-opt')].map((b) => [b.dataset.id, (b.dataset.result || '') + (b.getAttribute('aria-pressed') === 'true' ? '+pressed' : '')])));
const events = (page) => page.evaluate(() => window.__l4.tracking.events);
const rail = (page) => page.evaluate(() => ({
  dots: [...document.querySelectorAll('.w-dot')].map((d) => ({ status: d.dataset.status, label: d.getAttribute('aria-label'), disabled: d.getAttribute('aria-disabled'), current: d.getAttribute('aria-current') })),
  pct: document.querySelector('.w-rail-pct').textContent, line: parseFloat(document.querySelector('.w-rail-line-done').style.height),
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
async function expectNewScreen(page, id, what) {
  const r = await page.evaluate(() => ({ id: window.__l4.current, focus: document.activeElement?.id, text: document.activeElement?.textContent }));
  expect(r.id === id && r.focus === 'w-instruction' && r.text === S[id].instruction, `${what}: on ${id}, focus on the instruction heading "${r.text}"`);
}

/* ---------- main path ---------- */
console.log(SCORM ? '\nmain path in an LMS (mock SCORM 1.2 API)' : '\nmain path (debug=1)');
const page = await open('?reset=1&debug=1', { lms: SCORM ? {} : null });
if (SCORM) expect(await page.evaluate(() => window.__l4.tracking.mode) === 'scorm12', 'SCORM: the API is found, the scorm12 adapter runs');
await expectNewScreen(page, 'S01', 'start');
await expectBand(page, 'S01 before action', { state: 'hint', text: S.S01.hint, unlocked: false, lockedWhy: UI.footer.locked.single });
expect(await page.evaluate(() => document.querySelector('.w-prev').getAttribute('aria-disabled') === 'true'), 'S01: Previous disabled on the first screen');
const img = await page.evaluate(() => { const i = document.querySelector('.w-photo-column'); return { alt: i?.alt, temp: i?.dataset.temp, loaded: i?.naturalWidth > 0 }; });
expect(img.alt === S.S01.image.alt && img.temp === String(S.S01.image.temp) && img.loaded,
  `S01 image slot: alt from content, ${S.S01.image.temp ? 'temp' : 'real'} image loaded (${S.S01.image.src})`);
await expectLayout(page, 'S01 hint');
await shot(page, 's01-hint.png');

// rail at the start
let rl = await rail(page);
expect(rl.dots.map((d) => d.status).join() === 'current,locked,locked,locked,locked,locked,locked' && rl.pct === '0%' && rl.line === 0,
  `rail at start: ${rl.dots.map((d) => d.status).join(' ')}, ${rl.pct}, teal line ${rl.line}px`);
expect(rl.dots[0].label === `${CH.ch0.title}, ${UI.rail.status.current}` && rl.dots[0].current === 'step' && rl.dots[1].disabled === 'true' && rl.dots[1].label === `${CH.ch1.title}, ${UI.rail.status.locked}`,
  `rail labels: "${rl.dots[0].label}" (aria-current step), "${rl.dots[1].label}" (aria-disabled)`);
await tabTo(page, '.w-dot[data-chapter="1"]', { back: true });
const tip = await page.evaluate(() => {
  const t = document.querySelector('.w-tip'), d = document.activeElement.getBoundingClientRect(), r = t.getBoundingClientRect();
  return t.hidden ? {} : { text: t.textContent, right: r.left >= d.right, level: r.top < d.bottom && r.bottom > d.top };
});
await press(page, 'Enter');
expect(await screen(page) === 'S01' && tip.text === rl.dots[1].label && tip.right && tip.level,
  `rail: keyboard focus on a dot shows its tip "${tip.text}" (title and status) right of the dot, level with it; Enter on a future chapter does nothing`);
await press(page, 'Escape');

// full screen (rail): label from content, Enter enters and leaves (the label and icon follow)
const fsOf = () => page.evaluate(() => { const b = document.querySelector('.w-rail-fs'); return { hidden: b.hidden, label: b.getAttribute('aria-label'), on: !!document.fullscreenElement }; });
const fs0 = await fsOf();
expect(fs0.hidden === !(await page.evaluate(() => document.fullscreenEnabled)) && fs0.label === UI.rail.fullscreen, `rail full screen button: "${fs0.label}", shown only where the Fullscreen API is allowed`);
if (!fs0.hidden) {
  await tabTo(page, '.w-rail-fs', { back: true });
  await press(page, 'Enter');
  await page.waitForFunction(() => !!document.fullscreenElement, { timeout: 3000 }).catch(() => {});
  const fs1 = await fsOf();
  await press(page, 'Enter');
  await page.waitForFunction(() => !document.fullscreenElement, { timeout: 3000 }).catch(() => {});
  const fs2 = await fsOf();
  expect(fs1.on && fs1.label === UI.rail.exitFullscreen && !fs2.on && fs2.label === UI.rail.fullscreen, `full screen: Enter enters ("${fs1.label}"), Enter again leaves ("${fs2.label}")`);
}

// menu: open, trap, Escape
await tabTo(page, '.w-rail-menu', { back: true });
await press(page, 'Enter');
let menu = await page.evaluate(() => ({
  open: !document.querySelector('.w-menu-overlay').hidden, inPanel: document.querySelector('.w-panel').contains(document.activeElement), focus: document.activeElement.className,
  role: document.querySelector('.w-panel').getAttribute('role'), modal: document.querySelector('.w-panel').getAttribute('aria-modal'), expanded: document.querySelector('.w-rail-menu').getAttribute('aria-expanded'),
  kicker: document.querySelector('.w-panel-kicker').textContent, title: document.querySelector('.w-panel-title').textContent,
  pct: document.querySelector('.w-panel-pct').textContent, left: !!document.querySelector('.w-panel-left'),
  links: [...document.querySelectorAll('.w-panel-foot button')].map((b) => b.dataset.action).join(),
  list: [...document.querySelectorAll('.w-chapter')].map((c) => c.dataset.status + ':' + c.querySelector('.w-chapter-meta').textContent + (c.getAttribute('aria-current') ? '*' : '')),
}));
expect(menu.open && menu.inPanel && menu.focus === 'w-panel-close' && menu.role === 'dialog' && menu.modal === 'true' && menu.expanded === 'true',
  'Enter on the rail menu button opens the menu (dialog, aria-modal), focus on Close');
expect(menu.kicker === UI.menu.kicker && menu.title === C.lesson.title && menu.pct === '0% complete' && !menu.left && menu.links === 'goals,help,startover'
  && menu.list.join() === 'current:*,locked:,locked:,locked:,locked:,locked:,locked:',
  `menu: "${menu.kicker}", "${menu.pct}", no times, footer ${menu.links}, chapters ${menu.list.join(' | ')}`);
let trapped = true;
for (let i = 0; i < 30; i++) { await press(page, 'Tab'); trapped = trapped && await page.evaluate(() => document.querySelector('.w-panel').contains(document.activeElement)); }
for (let i = 0; i < 8; i++) { await shiftTab(page); trapped = trapped && await page.evaluate(() => document.querySelector('.w-panel').contains(document.activeElement)); }
expect(trapped, 'menu: focus stays trapped (30 Tab, 8 Shift+Tab)');
await tabTo(page, '.w-panel [data-action="help"]');
await press(page, 'Enter');
const help = await page.evaluate(() => ({ items: document.querySelectorAll('.w-dialog .w-help li').length, focus: document.activeElement.dataset.action }));
await press(page, 'Escape');
expect(help.items === UI.help.length && help.focus === 'close' && await isActive(page, '.w-panel [data-action="help"]'), `menu Help: ${help.items} lines in a dialog, Escape returns focus to Help`);
const cases1 = await page.evaluate(() => { const a = document.querySelector('.w-panel [data-action="lesson1Cases"]'); return a ? { href: a.href, target: a.target, rel: a.rel, text: a.textContent } : null; });
expect(cases1 && cases1.href === C.links.lesson1Cases && cases1.target === '_blank' && /noopener/.test(cases1.rel) && cases1.text.startsWith(UI.menu.lesson1Cases),
  `menu "${UI.menu.lesson1Cases}": a new-tab link to ${cases1?.href}`);
await tabTo(page, '.w-panel [data-action="goals"]', { back: true });
await press(page, 'Enter');
const goals = await page.evaluate(() => ({ items: [...document.querySelectorAll('.w-dialog .w-goals-list li')].map((li) => li.querySelector('.w-goals-title').textContent + '|' + li.querySelector('.w-goals-sub').textContent),
  focus: document.activeElement.dataset.action, controls: document.querySelectorAll('.w-dialog .w-goals-list button, .w-dialog .w-goals-list a').length }));
await press(page, 'Escape');
expect(goals.items.join() === S.S01B.options.map((o) => o.label + '|' + o.sub).join() && goals.focus === 'close' && !goals.controls && await isActive(page, '.w-panel [data-action="goals"]'),
  `menu Lesson goals: the ${goals.items.length} outcomes with their sub-lines, read only, Escape returns focus to Lesson goals`);
await tabTo(page, '.w-panel [data-action="startover"]');
await press(page, 'Enter');
const confirm = await page.evaluate(() => document.querySelector('.w-dialog')?.getAttribute('role') === 'alertdialog' && document.activeElement.dataset.action === 'cancel');
await press(page, 'Escape');
expect(confirm && await isActive(page, '.w-panel [data-action="startover"]'), 'menu Start over: in-page confirm, focus on Cancel, Escape cancels');
await press(page, 'Escape');
expect(await page.evaluate(() => document.querySelector('.w-menu-overlay').hidden && document.activeElement.classList.contains('w-rail-menu')
  && document.querySelector('.w-rail-menu').getAttribute('aria-expanded') === 'false'), 'Escape closes the menu, focus returns to the menu button');

// S01: wrong then right
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S01 wrong (a)', { state: 'wrong', text: opt('S01', 'a').feedback, unlocked: false });
let o = await opts(page);
expect(o.a === 'wrong' && o.b === '' && o.c === '', `S01 wrong: the chosen row is marked wrong, the others stay plain (${JSON.stringify(o)})`);
await expectLayout(page, 'S01 wrong');
expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'), 'S01 wrong by keyboard: the focus ring shows on the row');
await press(page, 'ArrowDown');
expect(await isActive(page, '.w-opt[data-id="b"]'), 'S01 ArrowDown moves focus to option b');
await press(page, 'Enter');
await expectBand(page, 'S01 correct (b)', { state: 'correct', text: opt('S01', 'b').feedback, unlocked: true });
expect(await isActive(page, '.w-next'), 'S01 correct: focus moves to Next');
await expectLayout(page, 'S01 correct');
await shot(page, 's01-correct.png');
await press(page, 'Enter');

// S01B: the lesson goals, neutral single choice (any row), the pick kept for S20 and the menu
await expectNewScreen(page, 'S01B', 'S01 Next');
await expectBand(page, 'S01B before action', { state: 'hint', text: S.S01B.hint, unlocked: false, lockedWhy: UI.footer.locked.goals });
const s01b = await page.evaluate(() => ({ eyebrow: document.querySelector('.w-goals .w-eyebrow').textContent, line: document.querySelector('.w-goals-line').textContent,
  rows: [...document.querySelectorAll('.w-options-goals .w-opt')].map((b) => b.querySelector('.w-opt-label').textContent),
  tips: [...document.querySelectorAll('.w-options-goals .w-opt')].map((b) => document.getElementById(b.getAttribute('aria-describedby'))?.textContent) }));
expect(s01b.eyebrow === S.S01B.stage.top.eyebrow && s01b.line === S.S01B.stage.top.text && s01b.rows.join() === S.S01B.options.map((o) => o.label).join() && s01b.tips.join() === S.S01B.options.map((o) => o.sub).join(),
  `S01B: eyebrow "${s01b.eyebrow}", deliverable line, ${s01b.rows.length} outcome rows from content, each sub-line as the row's tip (aria-describedby)`);
await expectLayout(page, 'S01B hint');
await shot(page, 's01b.png');
await tabTo(page, '.w-opt[data-id="c"]');
await press(page, 'Enter');
await expectBand(page, 'S01B pick c', { state: 'neutral', text: S.S01B.feedback.picked, unlocked: true });
await tabTo(page, '.w-opt[data-id="c"]', { back: true });
await press(page, 'ArrowDown', 2);
await press(page, 'Enter');
o = await opts(page);
const goalKept = await page.evaluate(() => window.__l4.state.f.L4_GOAL_FOCUS);
expect(o.e === '+pressed' && o.c === '' && o.a === '' && goalKept === 'e' && await isActive(page, '.w-next'),
  `S01B: a changed pick replaces the first (no right or wrong marks), kept as L4_GOAL_FOCUS "${goalKept}", focus on Next`);
await expectBand(page, 'S01B pick e', { state: 'neutral', text: S.S01B.feedback.picked, unlocked: true });
await expectLayout(page, 'S01B picked');
await shot(page, 's01b-picked.png');
await press(page, 'Enter');

// S02
await expectNewScreen(page, 'S02', 'S01B Next');
const s02top = await page.evaluate(() => { const a = document.querySelector('[data-action="homework1"]');
  return { label: document.querySelector('.w-form .w-label').textContent, help: document.querySelector('.w-field-help > span').textContent, hw1: a ? a.href : null, target: a?.target }; });
expect(s02top.label === S.S02.stage.top.text && s02top.help === S.S02.stage.middle.help.text && s02top.hw1 === C.links.homework1 && (!s02top.hw1 || s02top.target === '_blank'),
  `S02: Homework 1 context line, help line by the fields, ${C.links.homework1 ? 'Open Homework 1 link' : 'no Homework 1 link (links.homework1 is null)'}`);
await expectBand(page, 'S02 before action', { state: 'hint', text: S.S02.hint, unlocked: false, lockedWhy: UI.footer.locked.input });
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S02 empty Save', { state: 'notice', text: S.S02.feedback.empty, unlocked: false });
await expectLayout(page, 'S02 empty');
const TITLE = 'Sales call summaries', PROBLEM = 'Today reps write call summaries by hand, and it hurts because notes reach the CRM a day late.';
await tabTo(page, '.w-input[data-store="L4_CASE_TITLE"]', { back: true });
await page.keyboard.type('  ' + TITLE + ' ');
await press(page, 'Tab');
expect(await isActive(page, '.w-input[data-store="L4_CASE_PROBLEM"]'), 'S02 Tab moves to the second field');
await page.keyboard.type(PROBLEM);
const s02 = await page.evaluate(() => ({
  counters: [...document.querySelectorAll('.w-counter')].map((c) => c.textContent),
  max: [...document.querySelectorAll('.w-input')].map((i) => i.maxLength),
  described: [...document.querySelectorAll('.w-input')].every((i) => i.getAttribute('aria-describedby').split(' ').every((id) => document.getElementById(id))),
  labelled: [...document.querySelectorAll('.w-input')].every((i) => document.querySelector(`label[for="${i.id}"]`)),
}));
expect(s02.counters.join() === `${TITLE.length + 3}/60,${PROBLEM.length}/250` && s02.max.join() === '60,250' && s02.described && s02.labelled,
  `S02 fields: labelled, maxlength 60 (title) and 250 (problem), live counters ${s02.counters.join(' and ')}, aria-describedby counter + privacy line`);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S02 saved', { state: 'neutral', text: S.S02.feedback.saved, unlocked: true });
const saved = await page.evaluate(() => ({ badge: document.querySelector('.w-saved').hidden, f: window.__l4.state.f }));
expect(saved.badge && saved.f.L4_CASE_TITLE === TITLE && saved.f.L4_CASE_PROBLEM === PROBLEM, 'S02 saved: no rail badge (shown only when saving fails), values stored trimmed under L4_CASE_TITLE and L4_CASE_PROBLEM');
expect(await isActive(page, '.w-next'), 'S02 saved: focus moves to Next');
await expectLayout(page, 'S02 saved');
await shot(page, 's02.png');
await press(page, 'Enter');

// FT1: memo, right first try, routes
await expectNewScreen(page, 'FT1', 'S02 Next');
await expectBand(page, 'FT1 before action', { state: 'idle', text: '', unlocked: false, lockedWhy: UI.footer.locked.challenge });
const memo = await page.evaluate(() => ({ head: document.querySelector('.w-memo-head').textContent, label: document.querySelector('.w-memo').getAttribute('aria-label'),
  heads: document.querySelectorAll('.w-memo-head').length, line: document.querySelector('.w-memo-line').textContent, q: document.querySelector('.w-memo-q').textContent, hint: document.querySelector('.w-hintline').textContent,
  tool: [...document.querySelectorAll('.w-band-tool button')].map((b) => b.dataset.action).join() }));
const ft1Head = UI.memo.header.replace('{n}', '1');
expect(memo.head === ft1Head && memo.label === ft1Head && memo.heads === 1 && !/^Optional challenge/.test(memo.head),
  `FT1 memo header: "${memo.head}" (ui.memo.header with the chapter number), shown once, no From / To line`);
expect(memo.line === S.FT1.stage.top.text && memo.q === S.FT1.stage.middle.text && memo.hint === S.FT1.hint && memo.tool === 'skipChallenge',
  'FT1 memo: challenge text in the memo card, hint left under the instruction, Skip in the band');
await expectLayout(page, 'FT1 memo');
await shot(page, 'ft1-memo.png');
await tabTo(page, '.w-opt[data-id="b"]');
await press(page, 'Enter');
const routeBtns = S.FT1.routing.correctFirstTry.choices.map((c) => c.button);
await expectBand(page, 'FT1 right first try', { state: 'correct', text: opt('FT1', 'b').feedback, unlocked: false, actions: routeBtns, lockedWhy: UI.footer.locked.route });
expect(await page.evaluate(() => [...document.querySelectorAll('.w-band-actions button')].map((b) => b.textContent).join('|')) === routeBtns.map((k) => UI.buttons[k]).join('|')
  && await isActive(page, `[data-action="${routeBtns[0]}"]`) && !(await band(page)).tool.length, `FT1 right: route buttons "${routeBtns.map((k) => UI.buttons[k]).join('" and "')}" in the band, focus on the first, Skip gone`);
await expectLayout(page, 'FT1 routes');
await shot(page, 'ft1-routes.png');
await press(page, 'Enter'); // Jump to the last task

// S03 and the rail in chapter 1
await expectNewScreen(page, 'S03', 'FT1 "Jump to the last task"');
rl = await rail(page);
const skipped = await page.evaluate(() => ({ r: window.__l4.state.r, v1: window.__l4.doneSet().has('V1') }));
expect(skipped.r.FT1 === 'skip' && skipped.v1 && rl.dots[0].status === 'done' && rl.dots[1].status === 'current' && rl.dots[1].current === 'step' && rl.line === 52 && rl.pct === '8%',
  `rail in chapter 1: route "${skipped.r.FT1}", skipped V1 counts as done, Entry ${rl.dots[0].status}, Why map ${rl.dots[1].status}, teal line ${rl.line}px, ${rl.pct}`);
await expectBand(page, 'S03 before action', { state: 'hint', text: S.S03.hint, unlocked: false, lockedWhy: UI.footer.locked.multi });
const cases = await page.evaluate(() => [...document.querySelectorAll('.w-case')].map((f) => ({ cap: f.querySelector('figcaption').textContent, alt: f.querySelector('img')?.alt, controls: f.querySelectorAll('button, a, [tabindex]').length })));
expect(cases.map((c) => c.cap).join() === S.S03.cases.map((c) => c.label).join() && cases.every((c, i) => c.alt === S.S03.cases[i].image.alt && !c.controls),
  `S03 video-case stills: captions "${cases.map((c) => c.cap).join('", "')}", alt from content, no control until the player exists`);
await expectLayout(page, 'S03 hint');
await shot(page, 'rail-ch1.png');
const term = await page.evaluate(() => {
  const d = document.querySelector('.w-opt[data-id="d"]');
  const desc = (d.getAttribute('aria-describedby') || '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
  return { desc, dot: !!d.querySelector('.w-opt-info'), nested: d.querySelectorAll('a, button, input, [tabindex]').length };
});
expect(term.desc === C.tooltips['Success metric'] && term.dot && !term.nested, 'S03 term on the "No success metric" card: aria-describedby definition, info dot, no nested focusable');
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
await expectBand(page, 'S03 Check a + b', { state: 'wrong', verdict: UI.feedback.oneOfTwo, text: opt('S03', 'a').feedback, unlocked: false });
o = await opts(page);
const marks = await page.evaluate(() => [...document.querySelectorAll('.w-marker')].map((m) => m.dataset.state || '-').join());
expect(o.a === 'wrong' && o.b === 'correct+pressed' && marks === 'wrong,correct,-,-' && await isActive(page, '.w-opt[data-id="a"]'),
  `S03 after Check: a red and deselected, b teal and kept, process markers ${marks}, focus on a`);
await expectLayout(page, 'S03 one of two');
await shot(page, 's03-one-of-two.png');
await tabTo(page, '.w-opt[data-id="d"]');
await press(page, ' ');
o = await opts(page);
expect(o.a === '' && o.b === '+pressed' && o.d === '+pressed', `S03 retry: marks cleared, b and d selected (${JSON.stringify(o)})`);
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
await expectBand(page, 'S03 Check b + d', { state: 'correct', text: opt('S03', 'b').feedback + ' ' + opt('S03', 'd').feedback, unlocked: true });
o = await opts(page);
expect(o.b === 'correct+pressed' && o.d === 'correct+pressed' && o.a === '' && o.c === '' && await isActive(page, '.w-next') && !(await band(page)).tool.length,
  'S03 right: both keys teal, Check gone, focus on Next');
await expectLayout(page, 'S03 correct');
await shot(page, 's03-correct.png');
await press(page, 'Enter');

/* ---------- Chapter 2 (R1): FT2 wrong, then the full chapter, every interaction wrong then right ---------- */
console.log('\nchapter 2 (keyboard)');
await expectNewScreen(page, 'FT2', 'S03 Next (no pause marker: one Next moves on)');
await expectBand(page, 'FT2 before action', { state: 'idle', text: '', unlocked: false, lockedWhy: UI.footer.locked.challenge });
const ft2 = await page.evaluate(() => ({ head: document.querySelector('.w-memo-head').textContent, line: document.querySelector('.w-memo-line').textContent,
  q: document.querySelector('.w-memo-q').textContent, img: document.querySelector('.w-photo-memo')?.getAttribute('src'), alt: document.querySelector('.w-photo-memo')?.alt }));
expect(ft2.head === UI.memo.header.replace('{n}', '2') && ft2.line === S.FT2.stage.top.text && ft2.q === S.FT2.stage.middle.text && ft2.img === S.FT2.image.src && ft2.alt === S.FT2.image.alt,
  `FT2 memo: header "${ft2.head}" (once), challenge text from content, image ${ft2.img}`);
await expectLayout(page, 'FT2 memo');
await shotR1(page, 'ft2.png');
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'FT2 wrong (a)', { state: 'wrong', text: opt('FT2', 'a').feedback, unlocked: true });
expect(await isActive(page, '.w-next'), 'FT2 wrong: Next unlocked and focused (the full chapter)');
await press(page, 'Enter');

// S04 sort: select the card, then a column
await expectNewScreen(page, 'S04', 'FT2 wrong, Next');
await expectBand(page, 'S04 before action', { state: 'hint', text: S.S04.hint, unlocked: false, lockedWhy: UI.footer.locked.sort });
const sortState = () => page.evaluate(() => ({ pressed: document.querySelector('[data-action="card"]').getAttribute('aria-pressed'), text: document.querySelector('.w-sort-text').textContent,
  dots: document.querySelector('.w-deck .w-dots').getAttribute('aria-label'), off: [...document.querySelectorAll('.w-sort-target')].map((t) => t.getAttribute('aria-disabled') === 'true').join(),
  chips: [...document.querySelectorAll('.w-sort-chips')].map((u) => u.children.length).join(), wrong: [...document.querySelectorAll('.w-sort-target')].map((t) => t.dataset.result || '-').join() }));
let ss = await sortState();
expect(ss.text === S.S04.cards[0].text && ss.dots === 'Card 1 of 5' && ss.pressed === 'false' && ss.off === 'true,true,true',
  `S04 start: card 1 "${ss.text}", "${ss.dots}", columns wait for a selected card`);
await expectLayout(page, 'S04 start');
await shotR1(page, 's04-start.png');
await tabTo(page, '[data-action="card"]');
await press(page, ' ');
ss = await sortState();
expect(ss.pressed === 'true' && ss.off === 'false,false,false', 'S04 Space selects the card (aria-pressed), the columns become active');
await press(page, 'Tab');
expect(await isActive(page, '.w-sort-target[data-column="a"]'), 'S04 Tab moves from the card to the first column');
await press(page, 'ArrowRight');
await press(page, 'Enter');
await expectBand(page, 'S04 card 1 in Steps', { state: 'wrong', text: S.S04.cards[0].feedback.b, unlocked: false });
ss = await sortState();
expect(ss.pressed === 'true' && ss.wrong === '-,wrong,-' && ss.chips === '0,0,0', 'S04 wrong: the column gets the calm wrong mark, the card stays selected');
await press(page, 'Escape'); // hide the column tip for the screenshot
await expectLayout(page, 'S04 wrong');
await shotR1(page, 's04-wrong.png');
await press(page, 'ArrowLeft');
await press(page, 'Enter');
await expectBand(page, 'S04 card 1 in Trigger', { state: 'correct', text: S.S04.cards[0].feedback.correct, unlocked: false });
ss = await sortState();
expect(await isActive(page, '[data-action="card"]') && ss.text === S.S04.cards[1].text && ss.dots === 'Card 2 of 5' && ss.chips === '1,0,0' && ss.wrong === '-,-,-',
  'S04 right: a chip in Trigger, card 2 comes up and takes the focus');
const COL = { a: 0, b: 1, c: 2 };
for (const card of S.S04.cards.slice(1)) {
  await press(page, ' ');
  await press(page, 'Tab');
  if (COL[card.column]) await press(page, 'ArrowRight', COL[card.column]);
  await press(page, 'Enter');
}
ss = await sortState();
await expectBand(page, 'S04 last card', { state: 'correct', text: S.S04.cards[4].feedback.correct, unlocked: true });
expect(ss.chips === '2,2,1' && await isActive(page, '.w-next'), `S04 done: chips per column ${ss.chips}, Next unlocked and focused`);
await expectLayout(page, 'S04 done');
await shotR1(page, 's04-done.png');
await press(page, 'Enter');

// S05 explorer diagram: hotspots, then the legend
await expectNewScreen(page, 'S05', 'S04 Next');
await expectBand(page, 'S05 before action', { state: 'hint', text: S.S05.hint, unlocked: false, lockedWhy: UI.footer.locked.diagram });
const spot = (id) => S.S05.hotspots.find((x) => x.id === id);
await tabTo(page, '.w-lane-head');
await press(page, 'Enter');
await expectBand(page, 'S05 lane band', { state: 'wrong', text: spot('lane').feedback, unlocked: false });
await press(page, 'ArrowRight', 3);
expect(await isActive(page, '.w-node-event'), 'S05 arrow keys move through the hotspots (to the start event)');
await press(page, 'Enter');
await expectBand(page, 'S05 start event', { state: 'wrong', text: spot('event').feedback, unlocked: false });
await press(page, 'ArrowRight');
await press(page, 'Enter');
await expectBand(page, 'S05 step box', { state: 'wrong', text: spot('step').feedback, unlocked: false });
await press(page, 'ArrowRight');
expect(await isActive(page, '.w-node-gateway'), 'S05 ArrowRight reaches the gateway');
await press(page, 'Enter');
await expectBand(page, 'S05 gateway', { state: 'correct', text: spot('gateway').feedback, unlocked: false, lockedWhy: UI.footer.locked.diagram });
expect(await page.evaluate(() => [...document.querySelectorAll('[data-hotspot]')].every((x) => x.getAttribute('aria-disabled') === 'true')
  && document.querySelector('.w-node-gateway').dataset.result === 'correct'), 'S05 gateway found: marked right, every hotspot locked, Next still locked (legend)');
await expectLayout(page, 'S05 gateway');
await shotR1(page, 's05-gateway.png');
await tabTo(page, '.w-legend-btn[data-legend="swimlanes"]');
for (let k = 0; k < S.S05.legend.length; k++) { if (k) await press(page, 'Tab'); await press(page, 'Enter'); }
const legend = await page.evaluate(() => [...document.querySelectorAll('.w-legend-item')].map((x) => ({ exp: x.querySelector('button').getAttribute('aria-expanded'), open: x.querySelector('.w-legend-text').dataset.open, text: x.querySelector('.w-legend-text').textContent })));
expect(legend.every((x, k) => x.exp === 'true' && x.open === 'true' && x.text === S.S05.legend[k].text) && await isActive(page, '.w-next'),
  'S05 legend: all three open in place with the glossary text, Next unlocked and focused');
await expectBand(page, 'S05 done', { state: 'correct', text: spot('gateway').feedback, unlocked: true });
await expectLayout(page, 'S05 chips');
await shotR1(page, 's05-chips.png');
await press(page, 'Enter');

// S06 two situations: left first, then right
await expectNewScreen(page, 'S06', 'S05 Next');
await expectBand(page, 'S06 before action', { state: 'hint', text: S.S06.hint, unlocked: false, lockedWhy: UI.footer.locked.pair });
const sides = () => page.evaluate(() => [...document.querySelectorAll('.w-situation')].map((x) => x.dataset.state + (x.inert ? '/inert' : '')).join());
expect(await sides() === 'open,locked/inert', 'S06: the right situation is locked (inert) until the left one is right');
const sit = (k, id) => S.S06.situations[k].options.find((o) => o.id === id);
await tabTo(page, '.w-situation .w-opt[data-id="b"]');
await press(page, 'Enter');
await expectBand(page, 'S06 left b', { state: 'wrong', text: sit(0, 'b').feedback, unlocked: false });
await press(page, 'ArrowUp');
await press(page, 'Enter');
await expectBand(page, 'S06 left a', { state: 'correct', text: sit(0, 'a').feedback, unlocked: false });
expect(await sides() === 'open,open' && await isActive(page, '.w-situation + .w-situation .w-opt[data-id="a"]'), 'S06 left right: the right situation opens and takes the focus');
await press(page, 'Enter');
await expectBand(page, 'S06 right a', { state: 'wrong', text: sit(1, 'a').feedback, unlocked: false });
await press(page, 'ArrowDown');
await press(page, 'Enter');
await expectBand(page, 'S06 right b', { state: 'correct', text: sit(1, 'b').feedback, unlocked: true });
expect(await isActive(page, '.w-next'), 'S06 both right: Next unlocked and focused');
await expectLayout(page, 'S06 done');
await shotR1(page, 's06.png');
await press(page, 'Enter');

// S07 flip tiles, then the question
await expectNewScreen(page, 'S07', 'S06 Next');
await expectBand(page, 'S07 before action', { state: 'hint', text: S.S07.hint, unlocked: false, lockedWhy: UI.footer.locked.tiles });
const tileState = () => page.evaluate(() => ({ open: [...document.querySelectorAll('.w-tile')].filter((t) => t.dataset.open === 'true').map((t) => t.dataset.n).join(),
  lock: !document.querySelector('.w-question-lock').hidden, lockLabel: document.querySelector('.w-question-lock').getAttribute('aria-label'),
  q: document.querySelector('.w-question-text').hidden ? '' : document.querySelector('.w-question-text').textContent }));
let ts = await tileState();
expect(ts.lock && ts.lockLabel === S.S07.lockedLabel && !ts.q, `S07: question locked ("${ts.lockLabel}")`);
await tabTo(page, '.w-tile[data-n="1"]');
for (let n = 1; n <= 8; n++) {
  await press(page, 'Enter');
  ts = await tileState();
  if (ts.open !== String(n)) fail(`S07 tile ${n}: open tiles "${ts.open}", expected only ${n}`);
  if (n === 7) { await expectLayout(page, 'S07 tile 7 open'); await shotR1(page, 's07-open-tile.png'); }
  if (n < 8) await press(page, 'ArrowRight');
}
ts = await tileState();
expect(!ts.lock && ts.q === S.S07.question, `S07: one tile open at a time; after all eight the question shows ("${ts.q}")`);
expect(await page.evaluate(() => document.querySelector('.w-question-text').tagName) === 'H2', 'S07: the question is an h2 in the instruction style');
await expectBand(page, 'S07 question unlocked', { state: 'hint', text: S.S07.questionHint, unlocked: false });
await expectLayout(page, 'S07 question');
await shotR1(page, 's07-question.png');
await press(page, 'ArrowLeft');
await press(page, 'Enter');
await expectBand(page, 'S07 answer 7', { state: 'wrong', text: S.S07.tiles[6].feedback, unlocked: false });
await press(page, 'ArrowRight');
await press(page, 'Enter');
await expectBand(page, 'S07 answer 8', { state: 'correct', text: S.S07.tiles[7].feedback, unlocked: true });
expect(await isActive(page, '.w-next'), 'S07 right: Next unlocked and focused');
await expectLayout(page, 'S07 correct');
await press(page, 'Enter');

// S08 three rounds
await expectNewScreen(page, 'S08', 'S07 Next');
await expectBand(page, 'S08 before action', { state: 'hint', text: S.S08.hint, unlocked: false, lockedWhy: UI.footer.locked.rounds });
const roundState = () => page.evaluate(() => ({ badge: document.querySelector('.w-field-badge').textContent, line: document.querySelector('.w-round-line').textContent, dots: document.querySelector('.w-rounds .w-dots').getAttribute('aria-label') }));
for (let k = 0; k < S.S08.rounds.length; k++) {
  const R = S.S08.rounds[k];
  const rs = await roundState();
  expect(rs.badge === R.badge && rs.line === R.line && rs.dots === `Round ${k + 1} of 3`, `S08 round ${k + 1}: badge "${rs.badge}", line from content, "${rs.dots}"`);
  if (k === 0) {
    await tabTo(page, '.w-opt[data-id="a"]');
    await press(page, 'Enter');
    await expectBand(page, 'S08 round 1 a', { state: 'wrong', text: R.feedback.a, unlocked: false });
    await expectLayout(page, 'S08 round 1 wrong');
    await shotR1(page, 's08-round1-wrong.png');
    await press(page, 'ArrowDown');
  } else {
    expect(await isActive(page, '.w-opt[data-id="a"]'), `S08 round ${k + 1}: focus on the first rule`);
    await press(page, 'ArrowDown', { a: 0, b: 1, c: 2 }[R.correct]);
  }
  await press(page, 'Enter');
  const last = k === S.S08.rounds.length - 1;
  await expectBand(page, `S08 round ${k + 1} right`, { state: 'correct', text: R.feedback[R.correct], unlocked: last, actions: last ? [] : ['nextRound'] });
  if (!last) { expect(await isActive(page, '[data-action="nextRound"]'), `S08 round ${k + 1} right: focus on "${UI.buttons.nextRound}"`); await press(page, 'Enter'); }
}
expect(await isActive(page, '.w-next'), 'S08 round 3 right: Next unlocked and focused');
await expectLayout(page, 'S08 round 3 right');
await shotR1(page, 's08-round3-right.png');
await press(page, 'Enter');

/* ---------- Chapters 3 and 4 (R2): every interaction wrong then right, the V2 stops, seek blocked ---------- */
console.log('\nchapters 3 and 4 (keyboard)');
await expectNewScreen(page, 'FT3', 'S08 Next');
rl = await rail(page);
expect(rl.dots[2].status === 'done' && rl.dots[3].status === 'current', `rail after chapter 2: Toolkit ${rl.dots[2].status}, HR demo ${rl.dots[3].status}, ${rl.pct}`);
const ft3 = await page.evaluate(() => ({ head: document.querySelector('.w-memo-head').textContent, nums: document.querySelectorAll('.w-opt-card .w-opt-num').length, img: document.querySelector('.w-photo-memo')?.getAttribute('src') }));
expect(ft3.head === UI.memo.header.replace('{n}', '3') && ft3.nums === 0 && ft3.img === S.FT3.image.src, `FT3 memo: "${ft3.head}", no numerals on the option cards, image ${ft3.img}`);
await expectLayout(page, 'FT3');
await shotR2(page, 'ft3.png');
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'FT3 wrong (a)', { state: 'wrong', text: opt('FT3', 'a').feedback, unlocked: true });
await press(page, 'Enter'); // Next = the full chapter

// V2: play, captions and transcript, three stops (each wrong then right), seek never past an open stop
await expectNewScreen(page, 'V2', 'FT3 wrong, Next');
const v2Next = await nextState(page);
expect(v2Next.locked && v2Next.label === UI.footer.locked.video && !(await page.evaluate(() => !!document.querySelector('.w-main .w-band'))),
  `V2 before play: no band in the play view, Next locked "${v2Next.label}"`);
await videoRun(page, 'V2', { shotPlaying: 'v2-playing.png', shotWrong: 'v2-stop-wrong.png' });
await press(page, 'Enter'); // Next

// S09 sort, tray mode
await expectNewScreen(page, 'S09', 'V2 Next');
await expectBand(page, 'S09 before action', { state: 'hint', text: S.S09.hint, unlocked: false, lockedWhy: UI.footer.locked.sort });
const card = (sid, k) => S[sid].cards.find((c) => String(c.id ?? c.n) === String(k));
await trayPlace(page, '1', 'b');
await expectBand(page, 'S09 card 1 in Owner', { state: 'wrong', text: card('S09', 1).feedback.wrong, unlocked: false });
await trayPlace(page, '1', 'a', { reselect: false });
await expectBand(page, 'S09 card 1 in Source', { state: 'correct', text: card('S09', 1).feedback.correct, unlocked: false });
expect(await isActive(page, '.w-tray-card[data-card="2"]') && await page.evaluate(() => getComputedStyle(document.querySelector('.w-tray-card[data-card="1"]')).visibility === 'hidden'),
  'S09: the placed card leaves the tray (its slot keeps its place), focus moves to the next card');
for (const [c, col] of [['2', 'a'], ['3', 'b'], ['4', 'c'], ['5', 'd'], ['6', 'd']]) await trayPlace(page, c, col);
await expectBand(page, 'S09 done', { state: 'correct', text: card('S09', 6).feedback.correct, unlocked: true });
expect(await isActive(page, '.w-next') && await page.evaluate(() => [...document.querySelectorAll('.w-sort-chips')].map((u) => u.children.length).join()) === '2,1,1,2', 'S09 done: chips 2,1,1,2, Next focused');
await expectLayout(page, 'S09 done');
await shotR2(page, 's09.png');
await press(page, 'Enter');

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

// S12 tiles + panel, select two, Check
await expectNewScreen(page, 'S12', 'S11 Next');
const tileAns = (n) => S.S12.tiles.find((t) => t.n === n);
expect(await page.evaluate(() => document.querySelector('.w-pick-text').textContent) === tileAns(3).text, 'S12: Field 3 is open in the panel at the start');
await tabTo(page, '.w-pick-tile[data-n="4"]');
await press(page, ' ');
expect(await page.evaluate(() => document.querySelector('.w-pick-text').textContent) === tileAns(4).text, 'S12: a tile opens its text in the panel and is selected');
await press(page, 'ArrowLeft');
await press(page, ' ');
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
await expectBand(page, 'S12 Check 3 + 4', { state: 'wrong', verdict: UI.feedback.oneOfTwo, text: tileAns(3).feedback, unlocked: false });
await expectLayout(page, 'S12 one of two');
await shotR2(page, 's12-one-of-two.png');
await tabTo(page, '.w-pick-tile[data-n="7"]');
await press(page, ' ');
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
await expectBand(page, 'S12 Check 4 + 7', { state: 'correct', text: tileAns(4).feedback + ' ' + tileAns(7).feedback, unlocked: true });
await press(page, 'Enter');

// FT4
await expectNewScreen(page, 'FT4', 'S12 Next');
await expectLayout(page, 'FT4');
await shotR2(page, 'ft4.png');
await tabTo(page, '.w-opt[data-id="c"]');
await press(page, 'Enter');
await expectBand(page, 'FT4 wrong (c)', { state: 'wrong', text: opt('FT4', 'c').feedback, unlocked: true });
await press(page, 'Enter');

// S13, S14, S15: one question each, wrong then right
for (const [id, wrongId, moves, rightId] of [['S13', 'a', ['ArrowRight', 2], 'c'], ['S14', 'd', ['ArrowUp', 2], 'b'], ['S15', 'b', ['ArrowUp', 1], 'a']]) {
  await expectNewScreen(page, id, `${id} reached`);
  await tabTo(page, `.w-opt[data-id="${wrongId}"]`);
  await press(page, 'Enter');
  await expectBand(page, `${id} ${wrongId}`, { state: 'wrong', text: opt(id, wrongId).feedback, unlocked: false });
  await expectLayout(page, `${id} wrong`);
  if (id !== 'S14') await shotR2(page, id.toLowerCase() + '.png');
  await press(page, moves[0], moves[1]);
  await press(page, 'Enter');
  await expectBand(page, `${id} ${rightId}`, { state: 'correct', text: opt(id, rightId).feedback, unlocked: true });
  if (id === 'S14') { await expectLayout(page, 'S14 right'); await shotR2(page, 's14.png'); }
  await press(page, 'Enter');
}

// S16 sort, tray of six in two rows
await expectNewScreen(page, 'S16', 'S15 Next');
await trayPlace(page, '2', 'b');
await expectBand(page, 'S16 card 2 in Low-risk', { state: 'wrong', text: card('S16', 2).feedback.wrong, unlocked: false });
await expectLayout(page, 'S16 wrong');
await shotR2(page, 's16.png');
await trayPlace(page, '2', 'd', { reselect: false });
for (const [c, col] of [['1', 'a'], ['3', 'b'], ['4', 'd'], ['5', 'd'], ['6', 'c']]) await trayPlace(page, c, col);
await expectBand(page, 'S16 done', { state: 'correct', text: card('S16', 6).feedback.correct, unlocked: true });
await press(page, 'Enter');

// S17 sort, one case at a time, five bins
await expectNewScreen(page, 'S17', 'S16 Next');
const caseState = () => page.evaluate(() => ({ text: document.querySelector('.w-sort-text').textContent, dots: document.querySelector('.w-deck .w-dots').getAttribute('aria-label') }));
let cs = await caseState();
expect(cs.text === card('S17', 'a').text && cs.dots === 'Case 1 of 5', `S17 start: case A, "${cs.dots}"`);
await tabTo(page, '[data-action="card"]');
await press(page, ' ');
await press(page, 'Tab');
await press(page, 'ArrowRight', 4);
await press(page, 'Enter');
await expectBand(page, 'S17 case A in Automating', { state: 'wrong', text: card('S17', 'a').feedback.wrong, unlocked: false });
await press(page, 'Escape');
await expectLayout(page, 'S17 wrong');
await shotR2(page, 's17-wrong.png');
await press(page, 'ArrowLeft', 2);
await press(page, 'Enter');
await expectBand(page, 'S17 case A in Rushed', { state: 'correct', text: card('S17', 'a').feedback.correct, unlocked: false });
const BIN = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
for (const k of ['b', 'c', 'd', 'e']) {
  await press(page, ' ');
  await press(page, 'Tab');
  if (BIN[card('S17', k).column]) await press(page, 'ArrowRight', BIN[card('S17', k).column]);
  await press(page, 'Enter');
}
await expectBand(page, 'S17 done', { state: 'correct', text: card('S17', 'e').feedback.correct, unlocked: true });
expect(await page.evaluate(() => [...document.querySelectorAll('.w-sort-marker')].length) === 5, 'S17 done: a marker in each bin (case text for screen readers only)');
await press(page, 'Enter');

/* ---------- Chapters 5 and 6 (R3): handoff in a new tab and back, S21 first-attempt scoring, finish ---------- */
console.log('\nchapters 5 and 6 (keyboard)');
const METRIC = 'Share of HR time on repeat questions: about 35% now, 20% within three months.';
await expectNewScreen(page, 'S18A', 'S17 Next');
rl = await rail(page);
expect(rl.dots.slice(0, 5).every((d) => d.status === 'done') && rl.dots[5].status === 'current', `rail after chapter 4: chapters 0 to 4 done, Build yours ${rl.dots[5].status}, ${rl.pct}`);
await trayPlace(page, '1', 'b');
await expectBand(page, 'S18A card 1 in Field 3', { state: 'wrong', text: card('S18A', 1).feedback.wrong, unlocked: false });
await expectLayout(page, 'S18A wrong');
await shotR3(page, 's18a.png');
await trayPlace(page, '1', 'a', { reselect: false });
for (const [c, col] of [['2', 'b'], ['3', 'c'], ['4', 'd']]) await trayPlace(page, c, col);
await expectBand(page, 'S18A done', { state: 'correct', text: card('S18A', 4).feedback.correct, unlocked: true });
await press(page, 'Enter');

// S18: step 1 wrong then right, step 2 the pre-filled case title, Save without the box, then with it
await expectNewScreen(page, 'S18', 'S18A Next');
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S18 a', { state: 'wrong', text: opt('S18', 'a').feedback, unlocked: false, lockedWhy: UI.footer.locked.safety });
await press(page, 'ArrowDown');
await press(page, 'Enter');
await expectBand(page, 'S18 b', { state: 'correct', text: opt('S18', 'b').feedback, unlocked: false });
const s18 = await page.evaluate(() => ({ focus: document.activeElement.classList.contains('w-input'), value: document.querySelector('.w-input').value, rows: !document.querySelector('.w-options-row').hidden }));
expect(s18.focus && s18.value === TITLE && !s18.rows, `S18 step 2: the case title field, pre-filled from S02 ("${s18.value}"), takes the focus`);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S18 Save without the box', { state: 'notice', text: S.S18.step2.feedback.unticked, unlocked: false });
await expectLayout(page, 'S18 step 2');
await shotR3(page, 's18.png');
await tabTo(page, '.w-checkbox', { back: true });
await press(page, ' ');
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S18 saved', { state: 'neutral', text: S.S18.step2.feedback.saved, unlocked: true });
await press(page, 'Enter');

// S19: Open workbook opens the existing workbook in a NEW TAB; "I'm back" shows the return state
await expectNewScreen(page, 'S19', 'S18 Next');
await expectBand(page, 'S19 brief', { state: 'hint', text: S.S19.hint, unlocked: false, lockedWhy: UI.footer.locked.handoff });
const link = await page.evaluate(() => { const a = document.querySelector('[data-action="open"]'); return { href: a.href, target: a.target, rel: a.rel, back: document.querySelector('[data-action="back"]').hidden }; });
expect(link.href === C.links.workbook && link.target === '_blank' && /noopener/.test(link.rel) && link.back,
  `S19 Open workbook: a link to the existing workbook (${link.href}), target _blank, rel "${link.rel}"; I'm back hidden until opened`);
await tabTo(page, '[data-action="open"]');
const tabUrl = await newTabFrom(page);
expect(tabUrl === C.links.workbook && await screen(page) === 'S19', `S19: Enter opened a new tab at ${tabUrl}; the module stays on S19`);
await expectBand(page, 'S19 opened', { state: 'notice', text: S.S19.states.brief.openFeedback, unlocked: false });
await expectLayout(page, 'S19 opened');
await shotR3(page, 's19.png');
await tabTo(page, '[data-action="back"]', { back: true });
await press(page, 'Enter');
await expectBand(page, "S19 I'm back", { state: 'notice', text: S.S19.states.return.backFeedback, unlocked: false });
expect(await isActive(page, '.w-input') && await page.evaluate(() => window.__l4.state.g.S19?.o === 1 && window.__l4.state.g.S19?.b === 1), 'S19 return state: the metric field takes the focus, opened and back kept in suspend data');
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S19 empty Save', { state: 'notice', text: S.S19.hint, unlocked: false });
await tabTo(page, '.w-input', { back: true });
await page.keyboard.type(METRIC);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S19 saved', { state: 'neutral', text: S.S19.states.return.savedFeedback, unlocked: true });
await expectLayout(page, 'S19 saved');
await press(page, 'Enter');

// S20: three rows (one changed: a retry, still neutral), Next opens step 2, a chip, then Next to S21
await expectNewScreen(page, 'S20', 'S19 Next');
const row = (id) => S.S20.steps[0].rows.find((r) => r.id === id);
for (const [q, c] of [['q1', 'notYet'], ['q1', 'yes'], ['q2', 'yes'], ['q3', 'notYet']]) {
  await tabTo(page, `.w-check-row[data-row="${q}"] [data-choice="${c}"]`, { back: c === 'yes' && q === 'q1' });
  await press(page, 'Enter');
  await expectBand(page, `S20 ${q} ${c}`, { state: 'neutral', text: row(q).feedback[c], unlocked: q === 'q3' });
  if (q === 'q1' && c === 'notYet') { await expectLayout(page, 'S20 step 1'); await shotR3(page, 's20.png'); }
}
expect(await isActive(page, '.w-next'), 'S20: after all three rows Next unlocks (it opens step 2)');
await press(page, 'Enter');
expect(await isActive(page, '.w-chip') && await page.evaluate(() => document.querySelector('.w-selfcheck').hidden), 'S20 step 2: the chips, focus on the first');
const reminder = await page.evaluate(() => document.querySelector('.w-goal-reminder')?.textContent);
expect(reminder === UI.goalReminder.replace('{goal}', S.S01B.options.find((x) => x.id === 'e').label), `S20 step 2: the S01B pick as a one-line reminder on top ("${reminder}")`);
await expectBand(page, 'S20 step 2', { state: 'hint', text: S.S20.hint, unlocked: false, lockedWhy: UI.footer.locked.chips });
await press(page, 'ArrowRight', 2);
await press(page, 'Enter');
await expectBand(page, 'S20 chip rushed', { state: 'neutral', text: S.S20.steps[1].chips[2].feedback, unlocked: true });
await expectLayout(page, 'S20 step 2');
await press(page, 'Enter');

// S21: item 1 wrong then right (the wrong first answer counts), items 2 to 5 right first: 4 of 5
await expectNewScreen(page, 'S21', 'S20 Next');
const item = (k) => S.S21.items[k];
const iopt = (k, id) => item(k).options.find((o) => o.id === id);
await tabTo(page, '.w-kc-opt[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S21 item 1 a', { state: 'wrong', text: iopt(0, 'a').feedback, unlocked: false, lockedWhy: UI.footer.locked.check });
await expectLayout(page, 'S21 item 1 wrong');
await shotR3(page, 's21.png');
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
const resultLine = await page.evaluate(() => document.querySelector('.w-kc-result-line')?.textContent);
expect(resultLine === '4 of 5 on first try. Pass mark: 4 of 5.' && await isActive(page, '.w-next'), `S21 result card: "${resultLine}" (item 1 counts as wrong although it was fixed), Next focused`);
expect((await page.evaluate(() => window.__l4.score())).raw === 80, 'S21 score from first attempts only: 80 of 100');
await expectLayout(page, 'S21 result');
await shotR3(page, 's21-result.png');
await press(page, 'Enter');

// S22: a takeaway, step 2: homework in a new tab, the downloaded record, Finish = passed
await expectNewScreen(page, 'S22', 'S21 Next');
await tabTo(page, '.w-takeaway[data-id="a"]');
await press(page, 'Enter');
await expectBand(page, 'S22 takeaway a', { state: 'neutral', text: opt('S22', 'a').feedback, unlocked: true });
await expectLayout(page, 'S22 step 1');
await shotR3(page, 's22.png');
await press(page, 'Enter');
expect(await isActive(page, '[data-action="homework"]'), 'S22 step 2: focus on Open homework');
await expectBand(page, 'S22 step 2', { state: 'hint', text: S.S22.hint, unlocked: false, lockedWhy: UI.footer.locked.last });
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
expect(rec.includes(TITLE) && rec.includes(METRIC) && rec.includes('4 of 5 on first try (80 of 100)') && rec.includes(S.S20.steps[1].chips[2].label) && rec.includes(UI.buttons.notYet),
  `S22 lesson record downloaded (${UI.record.fileName}, ${rec.length} bytes): case title, metric, self-check answers, score`);
await tabTo(page, '[data-action="finish"]');
await press(page, 'Enter');
await expectBand(page, 'S22 finished', { state: 'neutral', text: UI.finished, unlocked: false, lockedWhy: UI.footer.locked.last });
const fin = (await events(page)).filter((e) => e.kind === 'finish');
expect(fin.length === 1 && fin[0].status === 'passed' && fin[0].score === 80, `S22 Finish (after the download, no confirm): lesson status ${fin[0]?.status}, score ${fin[0]?.score}`);
await expectLayout(page, 'S22 finished');
await shotR3(page, 's22-finish.png');

// revisits: read-only, the right state shown, Next unlocked (S22: finished, the last screen)
for (const id of ['S04', 'S05', 'S06', 'S07', 'S08', 'V2', 'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18A', 'S18', 'S19', 'S20', 'S21', 'S22']) {
  await page.evaluate((x) => window.__l4.go(x), id);
  const b = S[id].template === 'video' ? null : await band(page), n = await nextState(page);
  const want = { S18: 'neutral', S19: 'neutral', S20: 'neutral', S21: 'idle', S22: 'neutral' }[id] || 'correct';
  const nextOk = id === 'S22' ? n.locked && n.label === UI.footer.locked.last : !n.locked;
  expect((!b || b.state === want) && nextOk, `${id} revisit: the earlier state comes back${b ? ' (band ' + b.state + ')' : ' (stops answered, seek free)'}, ${id === 'S22' ? 'finished, Next stays locked (last screen)' : 'Next unlocked'}`);
}
await page.evaluate(() => window.__l4.go('S19'));

// menu: every chapter done
await tabTo(page, '.w-rail-menu', { back: true });
await press(page, 'Enter');
menu = await page.evaluate(() => ({ pct: document.querySelector('.w-panel-pct').textContent, left: '', list: [...document.querySelectorAll('.w-chapter')].map((c) => c.dataset.status + ':' + c.querySelector('.w-chapter-meta').textContent + (c.getAttribute('aria-current') ? '*' : '')) }));
expect(menu.pct === '100% complete' && menu.list.every((x) => x === 'done:Done') && menu.list.length === 7, `menu at the end: "${menu.pct}", "${menu.left}", all 7 chapters done`);
await expectLayout(page, 'menu open');
await shot(page, 'menu-open.png');
await tabTo(page, '.w-chapter[data-chapter="0"]');
await press(page, 'Enter');
await expectNewScreen(page, 'S01', 'menu: Enter on the completed chapter Entry');
await expectBand(page, 'S01 revisit', { state: 'correct', text: opt('S01', 'b').feedback, unlocked: true });
await tabTo(page, '.w-next');
await press(page, 'Enter');
await expectNewScreen(page, 'S01B', 'Next from the S01 revisit');
await expectBand(page, 'S01B revisit', { state: 'neutral', text: S.S01B.feedback.picked, unlocked: true });
expect((await opts(page)).e === '+pressed', 'S01B revisit: the kept pick is shown');
await tabTo(page, '.w-prev', { back: true });
await press(page, 'Enter');
await expectNewScreen(page, 'S01', 'Previous from S01B');
await tabTo(page, '.w-dot[data-chapter="5"]', { back: true });
await press(page, 'Enter');
await expectNewScreen(page, 'S18A', 'rail: Enter on the completed chapter 5 opens its first screen');

const ev = await events(page);
const first = (id) => ev.filter((e) => e.kind === 'answer' && e.trackingId === id);
const IDS_CH34 = ['L4_FT3_1', 'L4_V2_1', 'L4_V2_2', 'L4_V2_3', 'L4_S09_1', 'L4_S10_1', 'L4_S11_1', 'L4_S12_1', 'L4_FT4_1', 'L4_S13_1', 'L4_S14_1', 'L4_S15_1', 'L4_S16_1', 'L4_S17_1'];
const IDS_CH56 = ['L4_S18A_1', 'L4_S18_1', 'L4_S18_2', 'L4_S19_1', 'L4_S20_1', 'L4_S20_2', 'L4_S20_3', 'L4_S20_4', 'L4_S21_1', 'L4_S21_2', 'L4_S21_3', 'L4_S21_4', 'L4_S21_5', 'L4_S22_1'];
const IDS = ['L4_S01_1', 'L4_S02_1', 'L4_S02_2', 'L4_FT1_1', 'L4_S03_1', 'L4_FT2_1', 'L4_S04_1', 'L4_S05_1', 'L4_S06_1', 'L4_S06_2', 'L4_S07_1', 'L4_S08_1', 'L4_S08_2', 'L4_S08_3', ...IDS_CH34, ...IDS_CH56, 'L4_S01B_1'];
expect(IDS.every((id) => first(id).length === 1) && ev.filter((e) => e.kind === 'answer').length === IDS.length,
  `bus: exactly one first-attempt event per id (${IDS.map((id) => id + ' ' + first(id).length).join(', ')})`);
const f = Object.fromEntries(IDS.map((id) => [id, first(id)[0]]));
expect(f.L4_S01_1.response === 'a' && f.L4_S01_1.result === 'wrong' && f.L4_S02_1.response === TITLE && f.L4_S02_1.result === 'neutral' && f.L4_S02_1.type === 'fill-in'
  && f.L4_FT1_1.response === 'b' && f.L4_FT1_1.result === 'correct' && f.L4_S03_1.response === 'a,b' && f.L4_S03_1.result === 'wrong'
  && f.L4_S01B_1.response === 'c' && f.L4_S01B_1.result === 'neutral' && f.L4_S01B_1.type === 'choice',
  `bus: first responses ${IDS.slice(0, 5).map((id) => id + '=' + JSON.stringify(f[id].response.slice(0, 20)) + '/' + f[id].result).join(', ')}`);
const ch2 = IDS.slice(5, 14).map((id) => `${id}=${f[id].response}/${f[id].result}/${f[id].type}`).join(' ');
const ch34 = IDS_CH34.map((id) => `${id}=${f[id].response}/${f[id].result}`).join(' ');
expect(ch34 === 'L4_FT3_1=a/wrong L4_V2_1=a/wrong L4_V2_2=b/wrong L4_V2_3=a/wrong L4_S09_1=1.b,2.a,3.b,4.c,5.d,6.d/wrong L4_S10_1=d/wrong L4_S11_1=a/wrong '
  + 'L4_S12_1=3,4/wrong L4_FT4_1=c/wrong L4_S13_1=a/wrong L4_S14_1=d/wrong L4_S15_1=b/wrong L4_S16_1=1.a,2.b,3.b,4.d,5.d,6.c/wrong L4_S17_1=a.5,b.1,c.5,d.4,e.2/wrong',
  `bus, chapters 3 and 4 first attempts: ${ch34}`);
const ch56 = IDS_CH56.map((id) => `${id}=${f[id].response}/${f[id].result}`).join(' ');
expect(ch56 === `L4_S18A_1=1.b,2.b,3.c,4.d/wrong L4_S18_1=a/wrong L4_S18_2=${TITLE}/neutral L4_S19_1=${METRIC}/neutral L4_S20_1=b/neutral L4_S20_2=a/neutral L4_S20_3=b/neutral `
  + 'L4_S20_4=c/neutral L4_S21_1=a/wrong L4_S21_2=b/correct L4_S21_3=a/correct L4_S21_4=d/correct L4_S21_5=5,6/correct L4_S22_1=a/neutral', `bus, chapters 5 and 6 first attempts: ${ch56}`);
expect(ch2 === 'L4_FT2_1=a/wrong/choice L4_S04_1=1.b,2.b,3.a,4.b,5.c/wrong/matching L4_S05_1=b/wrong/choice L4_S06_1=b/wrong/choice L4_S06_2=a/wrong/choice '
  + 'L4_S07_1=7/wrong/choice L4_S08_1=a/wrong/choice L4_S08_2=c/correct/choice L4_S08_3=a/correct/choice', `bus, chapter 2 first attempts: ${ch2}`);
const retries = ev.filter((e) => e.kind === 'retry').map((e) => `${e.trackingId}=${e.response}/${e.result}`);
expect(retries.join() === 'L4_S01_1=b/correct,L4_S01B_1=e/neutral,L4_S03_1=b,d/correct,L4_S05_1=c/wrong,L4_S05_1=d/wrong,L4_S05_1=a/correct,L4_S06_1=a/correct,L4_S06_2=b/correct,L4_S07_1=8/correct,L4_S08_1=b/correct'
  + ',L4_V2_1=b/correct,L4_V2_2=a/correct,L4_V2_3=b/correct,L4_S10_1=c/correct,L4_S11_1=d/correct,L4_S12_1=4,7/correct,L4_S13_1=c/correct,L4_S14_1=b/correct,L4_S15_1=a/correct'
  + ',L4_S18_1=b/correct,L4_S20_1=a/neutral,L4_S21_1=c/correct',
  `bus: retries as retry events (${retries.join(', ')})`);
expect(!page.errors.length, 'main path: no console errors' + (page.errors.length ? ': ' + page.errors.join(' | ') : ''));
if (SCORM) await scormChecks(page, IDS);
await page.close();
if (SCORM) { await browser.close(); server.close(); console.log(fails.length ? `\ntest:scorm FAILED (${fails.length})` : '\ntest:scorm passed'); process.exit(fails.length ? 1 : 0); }

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
  expect(free.length === 4 && free.every((r) => r.response.length <= 250 && r.result === 'neutral'), `SCORM: ${free.length} fill-in responses (case title twice, problem, metric), at most 250 chars, neutral`);
  expect(d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '80' && d['cmi.core.score.min'] === '0' && d['cmi.core.score.max'] === '100' && d['cmi.core.exit'] === '',
    `SCORM: lesson_status ${d['cmi.core.lesson_status']}, score.raw ${d['cmi.core.score.raw']} (0 to 100, from S21 first attempts), exit "${d['cmi.core.exit']}"`);
  expect(/^\d{4}:\d{2}:\d{2}\.\d{2}$/.test(d['cmi.core.session_time'] || '') && m.finished, `SCORM: session_time ${d['cmi.core.session_time']}, LMSFinish once`);
  const susp = d['cmi.suspend_data'] || '';
  const { decode, encode } = await import('../src/state.js');
  const full = decode(susp);
  for (const k of Object.keys(full.f)) full.f[k] = 'x'.repeat(250);
  const fullLen = encode(full).length;
  expect(susp.length < 4096 && fullLen < 4096, `SCORM: suspend_data ${susp.length} chars after the whole lesson; ${fullLen} with every free-text field at 250 (limit 4096)`);
  expect(d['cmi.core.lesson_location'] === full.s, `SCORM: lesson_location "${d['cmi.core.lesson_location']}" = the saved place`);

  console.log('\nSCORM relaunch (entry=resume)');
  const r = await open('', { lms: { 'cmi.core.entry': 'resume', 'cmi.suspend_data': susp, 'cmi.core.lesson_location': d['cmi.core.lesson_location'], 'cmi.core.lesson_status': d['cmi.core.lesson_status'] } });
  const back = await r.evaluate(() => ({ at: window.__l4.current, dialog: !!document.querySelector('.w-dialog [data-action="resume"]'), title: window.__l4.state.f.L4_CASE_TITLE,
    metric: window.__l4.state.f.L4_METRIC, done: window.__l4.state.d.length, mock: window.__scormMock.report() }));
  expect(back.at === d['cmi.core.lesson_location'] && back.dialog && back.title === TITLE && back.metric && back.done === full.d.length,
    `SCORM resume: lands on ${back.at} with the resume prompt, ${back.done} screens done, case title and metric back`);
  expect(back.mock.data['cmi.core.lesson_status'] === 'passed' && !back.mock.errors.length && back.mock.count === 0,
    'SCORM resume: lesson_status stays passed (never downgraded), no interaction written again');
  await r.close();
}

/* ---------- S01 wrong row by mouse: calm mark, no focus ring ---------- */
// The one mouse check in this walk: a click must not leave the keyboard focus ring on the row.
console.log('\nS01 wrong row (mouse click)');
{
  const p = await open('?reset=1&screen=S01');
  await p.click('.w-opt[data-id="a"]');
  await p.mouse.move(5, 700); // off the row: no hover state in the check or the screenshot
  const r = await p.evaluate(() => {
    const row = document.querySelector('.w-opt[data-id="a"]');
    const cs = getComputedStyle(row);
    const mark = row.querySelector('.w-opt-mark');
    const ms = getComputedStyle(mark);
    return { focused: document.activeElement === row, visible: row.matches(':focus-visible'), outline: cs.outlineStyle, bg: cs.backgroundColor, color: cs.color,
      label: getComputedStyle(row.querySelector('.w-opt-label')).color, shadow: cs.boxShadow, markBg: ms.backgroundColor, markColor: ms.color,
      x: mark.querySelector('svg')?.getAttribute('aria-label'), w: Math.round(mark.querySelector('svg')?.getBoundingClientRect().width || 0),
      others: [...document.querySelectorAll('.w-opt:not([data-id="a"])')].map((b) => b.dataset.result || '-').join() };
  });
  expect(r.focused && !r.visible && r.outline === 'none', `S01 click: the row has focus but no focus ring (outline ${r.outline})`);
  expect(r.bg === 'rgb(255, 255, 255)' && r.color === 'rgb(0, 0, 0)' && r.label === 'rgb(0, 0, 0)' && /rgb\(204, 0, 0\) 3px 0px 0px 0px inset/.test(r.shadow),
    `S01 wrong row: black text on white, 3px #CC0000 line on the left edge (${r.shadow})`);
  expect(r.markBg === 'rgba(0, 0, 0, 0)' && r.markColor === 'rgb(204, 0, 0)' && r.x === UI.feedback.wrongPrefix && r.w === 20 && r.others === '-,-',
    `S01 wrong row: small red X on the right (${r.w}px, label "${r.x}"), the other rows plain`);
  await expectBand(p, 'S01 wrong by mouse', { state: 'wrong', text: opt('S01', 'a').feedback, unlocked: false });
  await expectLayout(p, 'S01 wrong by mouse');
  await shot(p, 's01-wrong.png');
  await p.close();
}

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

/* ---------- FT1 side paths ---------- */
console.log('\nFT1 paths');
async function ft1Path(name, keys, { to, route, answer, card = 'FT1', skipped = null }) {
  const p = await open('?reset=1&screen=' + card);
  await expectNewScreen(p, card, `${name}: start`);
  await keys(p);
  const r = await p.evaluate((c) => ({ id: window.__l4.current, route: window.__l4.state.r[c], ev: window.__l4.tracking.events, done: [...window.__l4.doneSet()] }), card);
  const answers = r.ev.filter((e) => e.kind === 'answer').map((e) => e.trackingId + '=' + e.response + '/' + e.result);
  expect(r.id === to && r.route === route && answers.join() === (answer || ''), `${name}: lands on ${r.id}, route "${r.route}", answer events [${answers.join(', ')}]`);
  if (skipped) expect(skipped.every((id) => r.done.includes(id)), `${name}: the skipped screens count as done (${skipped.join(', ')})`);
  await expectNewScreen(p, to, name);
  expect(!p.errors.length, `${name}: no console errors` + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}
await ft1Path('FT1 right, "Watch the video"', async (p) => {
  await tabTo(p, '.w-opt[data-id="b"]');
  await press(p, 'Enter');
  await tabTo(p, `[data-action="${routeBtns[1]}"]`);
  await press(p, 'Enter');
}, { to: 'V1', route: 'full', answer: 'L4_FT1_1=b/correct' });
await ft1Path('FT1 wrong', async (p) => {
  await tabTo(p, '.w-opt[data-id="c"]');
  await press(p, 'Enter');
  await expectBand(p, 'FT1 wrong (c)', { state: 'wrong', text: opt('FT1', 'c').feedback, unlocked: true });
  const o2 = await opts(p);
  expect(o2.c === 'wrong' && o2.a === '' && o2.b === '' && await isActive(p, '.w-next') && !(await band(p)).tool.length,
    'FT1 wrong: one attempt, options locked, Skip gone, Next unlocked and focused');
  await expectLayout(p, 'FT1 wrong');
  await press(p, 'Enter');
}, { to: 'V1', route: 'full', answer: 'L4_FT1_1=c/wrong' });
await ft1Path('FT1 "Skip challenge"', async (p) => {
  await tabTo(p, '[data-action="skipChallenge"]');
  await press(p, 'Enter');
}, { to: 'V1', route: 'full', answer: '' });
await ft1Path('FT2 right, "Jump to the last task"', async (p) => {
  await tabTo(p, '.w-opt[data-id="b"]');
  await press(p, 'Enter');
  await expectBand(p, 'FT2 right first try', { state: 'correct', text: opt('FT2', 'b').feedback, unlocked: false, actions: ['jumpToTask', 'fullChapter'], lockedWhy: UI.footer.locked.route });
  await expectLayout(p, 'FT2 routes');
  await press(p, 'Enter');
}, { card: 'FT2', to: 'S08', route: 'skip', answer: 'L4_FT2_1=b/correct', skipped: ['S04', 'S05', 'S06', 'S07'] });
await ft1Path('FT2 right, "Take the full chapter"', async (p) => {
  await tabTo(p, '.w-opt[data-id="b"]');
  await press(p, 'Enter');
  await tabTo(p, '[data-action="fullChapter"]');
  await press(p, 'Enter');
}, { card: 'FT2', to: 'S04', route: 'full', answer: 'L4_FT2_1=b/correct' });
await ft1Path('FT2 "Skip challenge"', async (p) => {
  await tabTo(p, '[data-action="skipChallenge"]');
  await press(p, 'Enter');
}, { card: 'FT2', to: 'S04', route: 'full', answer: '' });
for (const [card, key, jump, jumpTo, skipped, full, fullTo] of [
  ['FT3', 'c', 'jumpToMap', 'S12', ['V2', 'S09', 'S10', 'S11'], 'watchDemo', 'V2'],
  ['FT4', 'a', 'jumpToTask', 'S17', ['S13', 'S14', 'S15', 'S16'], 'fullChapter', 'S13']]) {
  await ft1Path(`${card} right, "${UI.buttons[jump]}"`, async (p) => {
    await tabTo(p, `.w-opt[data-id="${key}"]`);
    await press(p, 'Enter');
    await expectBand(p, `${card} right first try`, { state: 'correct', text: opt(card, key).feedback, unlocked: false, actions: [jump, full], lockedWhy: UI.footer.locked.route });
    await press(p, 'Enter');
  }, { card, to: jumpTo, route: 'skip', answer: `L4_${card}_1=${key}/correct`, skipped });
  await ft1Path(`${card} right, "${UI.buttons[full]}"`, async (p) => {
    await tabTo(p, `.w-opt[data-id="${key}"]`);
    await press(p, 'Enter');
    await tabTo(p, `[data-action="${full}"]`);
    await press(p, 'Enter');
  }, { card, to: fullTo, route: 'full', answer: `L4_${card}_1=${key}/correct` });
  await ft1Path(`${card} "Skip challenge"`, async (p) => {
    await tabTo(p, '[data-action="skipChallenge"]');
    await press(p, 'Enter');
  }, { card, to: fullTo, route: 'full', answer: '' });
}

/* ---------- S21 all first answers wrong: retries never raise the score; S22 confirms once, failed ---------- */
console.log('\nS21 first attempts wrong, S22 finish without download');
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
  await expectBand(p, 'S21 item 5 tiles 5 + 7', { state: 'wrong', verdict: UI.feedback.oneOfTwo, text: S.S21.items[4].tiles[6].feedback, unlocked: false });
  await expectLayout(p, 'S21 item 5 one of two');
  await tabTo(p, '.w-kc-tile[data-n="6"]', { back: true });
  await press(p, ' ');
  await tabTo(p, '[data-action="check"]');
  await press(p, 'Enter');
  const line = await p.evaluate(() => document.querySelector('.w-kc-result-line')?.textContent);
  const sc = await p.evaluate(() => window.__l4.score());
  expect(line === '0 of 5 on first try. Pass mark: 4 of 5.' && sc.raw === 0, `S21: every item fixed on retry, result "${line}", score ${sc.raw}: only first attempts count`);
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
  expect(!p.errors.length, 'S21 / S22 run: no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
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

/* ---------- artboard comparisons (shots only) ---------- */
if (SHOTS) {
  console.log('\nartboard comparisons');
  // The artboards are design exports: their /_blob/ images and support.js runtime do not exist here.
  // The board's own images (kept next to the artboards) are served in place of the blobs, the local
  // fonts in place of Google Fonts; the markup renders as plain HTML without the runtime.
  const BLOBS = { '8d2be42ae36f206cf42200cd5af8b242': 'planning/design-reference/ref-team-meeting.jpg',
    dc048ae4ed0a8ee82f02cf1ceb1b9e21: 'planning/design-reference/ref-video-case-1.jpg', b16ce2f524cebca874501d9731444899: 'assets/logo/wawiwa-logo.png' };
  async function artboard(file) {
    const p = await browser.newPage();
    await p.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await p.setRequestInterception(true);
    p.on('request', (req) => {
      const u = new URL(req.url());
      const blob = u.pathname.startsWith('/_blob/') && BLOBS[u.pathname.slice(7)];
      if (blob) req.respond({ status: 200, contentType: blob.endsWith('.png') ? 'image/png' : 'image/jpeg', body: readFileSync(join(ROOT, blob)) });
      else if (u.pathname.endsWith('/support.js')) req.respond({ status: 200, contentType: 'text/javascript', body: '' });
      else if (u.host !== new URL(ORIGIN).host) req.abort();
      else req.continue();
    });
    await p.goto(`${ORIGIN}/planning/design-reference/${file}`, { waitUntil: 'networkidle0' });
    await p.addStyleTag({ url: ORIGIN + '/src/fonts.css' });
    await p.evaluate(() => document.fonts.ready);
    const png = await p.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 720 } });
    await p.close();
    return png;
  }
  async function compare(name, file, built) {
    const ref = await artboard(file);
    const ours = readFileSync(join(OUT, built));
    const p = await browser.newPage();
    await p.setViewport({ width: 2600, height: 770, deviceScaleFactor: 1 });
    const cell = (png, cap) => `<figure style="margin:0"><figcaption style="font:600 18px Arial;margin:0 0 8px">${cap}</figcaption><img style="display:block;width:1280px;height:720px;outline:1px solid #ccc" src="data:image/png;base64,${png.toString('base64')}"></figure>`;
    await p.setContent(`<body style="margin:0;padding:12px 14px;display:flex;gap:16px;background:#fff">${cell(ref, 'Artboard: planning/design-reference/' + file)}${cell(ours, 'Module: review/p1.5/' + built)}</body>`, { waitUntil: 'load' });
    await p.screenshot({ path: join(OUT, name), clip: { x: 0, y: 0, width: 2600, height: 770 } });
    await p.close();
    console.log('       shot ' + name);
  }
  await compare('compare-s01.png', 'R2A-decision-editorial.html', 's01-hint.png');
  await compare('compare-s03.png', 'R2D-work-select-two.html', 's03-one-of-two.png');
}

await browser.close();
server.close();
console.log(fails.length ? `\nwalk FAILED (${fails.length})` : '\nwalk passed');
process.exit(fails.length ? 1 : 0);
