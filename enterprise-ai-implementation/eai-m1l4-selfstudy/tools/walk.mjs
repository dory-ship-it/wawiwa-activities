// Keyboard-only walk through the P1 slice screens (kept for P5). Puppeteer drives Tab, Shift+Tab,
// arrows, Enter, Space and typing only: no mouse events. Asserts on every state:
//   Continue absent before the right answer (or save), present after; feedback row text equals the
//   content JSON; focus lands on the instruction heading on each new screen; FT1 routes land on the
//   right screen; no stage card content overlaps the feedback row (bounding boxes), no text clipped,
//   no empty band in the card over 25%; one first-attempt tracking event per interaction id.
// Usage: npm run walk                 checks only
//        npm run walk -- --shots      checks + screenshots and the avatar test into review/p1/
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, measureLayout, MAX_GAP_RATIO } from './lib.mjs';

const SHOTS = process.argv.includes('--shots');
const OUT = join(ROOT, 'review', 'p1');
const C = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const UI = C.ui;
const S = Object.fromEntries(C.screens.map((s) => [s.id, s]));
const opt = (sid, id) => S[sid].options.find((o) => o.id === id);
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
if (SHOTS) mkdirSync(OUT, { recursive: true });

async function open(query) {
  const page = await browser.newPage();
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  // reduced motion: no colour transitions, so every assertion and screenshot sees the settled state
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + query, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  return page;
}
const shot = async (page, name) => { if (SHOTS) { await page.screenshot({ path: join(OUT, name) }); console.log('       shot ' + name); } };
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
const row = (page) => page.evaluate(() => {
  const r = document.querySelector('.w-feedback');
  const pager = r.querySelector('.w-pager');
  return { state: r.dataset.state, prefix: r.querySelector('.w-fb-prefix').textContent.trim(), text: r.querySelector('.w-fb-text').textContent.trim(),
    actions: [...r.querySelectorAll('.w-fb-actions button')].map((b) => b.dataset.action), pager: pager.hidden ? '' : pager.querySelector('.w-pager-label').textContent,
    icon: !r.querySelector('.w-fb-icon').hidden };
});
const screen = (page) => page.evaluate(() => window.__l4.current);
const opts = (page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.w-opt')].map((b) => [b.dataset.id, (b.dataset.result || '') + (b.getAttribute('aria-pressed') === 'true' ? '+pressed' : '')])));
const events = (page) => page.evaluate(() => window.__l4.tracking.events);

// feedback row equals the JSON: state, the state word, the text, and whether Continue is there
async function expectRow(page, what, { state, text, cont, actions = null, pager = null }) {
  const r = await row(page);
  const prefix = state === 'correct' ? UI.feedback.correctPrefix : state === 'wrong' ? UI.feedback.wrongPrefix : '';
  const hasCont = r.actions.includes('continue');
  expect(r.state === state && r.prefix === prefix && r.text === text && hasCont === cont && (!actions || actions.join() === r.actions.join()) && (pager === null || r.pager === pager),
    `${what}: row ${r.state}${r.prefix ? ' "' + r.prefix + '"' : ''} text matches JSON, Continue ${hasCont ? 'present' : 'absent'}${r.actions.length ? ' [' + r.actions.join(', ') + ']' : ''}${r.pager ? ', ' + r.pager : ''}`
    + (r.text !== text ? ` (got "${r.text}")` : ''));
}
async function expectLayout(page, what) {
  const m = await page.evaluate(measureLayout);
  const bad = [...m.overlaps, ...m.outside];
  expect(!bad.length && !m.fbOverflow && !m.clipped.length && m.gapRatio <= MAX_GAP_RATIO,
    `${what}: no overlap with the feedback row, nothing clipped, largest band ${Math.round(m.gapRatio * 100)}%` + (bad.length || m.clipped.length ? ` (${bad.concat(m.clipped).join(', ')})` : '') + (m.fbOverflow ? ' (feedback text overflows the row)' : ''));
}
async function expectNewScreen(page, id, what) {
  const r = await page.evaluate(() => ({ id: window.__l4.current, focus: document.activeElement?.id, text: document.activeElement?.textContent }));
  expect(r.id === id && r.focus === 'w-instruction' && r.text === S[id].instruction, `${what}: on ${id}, focus on the instruction heading "${r.text}"`);
}

/* ---------- main path: S01 wrong then right, S02 empty then saved, FT1 right + jump, S03 ---------- */
console.log('\nmain path (debug=1)');
const page = await open('?reset=1&debug=1');
await expectNewScreen(page, 'S01', 'start');
await expectRow(page, 'S01 before action', { state: 'hint', text: S.S01.hint, cont: false });
await expectLayout(page, 'S01 hint');
await shot(page, 's01-hint.png');

await tabTo(page, '.w-opt[data-id="a"]');
await press(page, 'Enter');
await expectRow(page, 'S01 wrong (a)', { state: 'wrong', text: opt('S01', 'a').feedback, cont: false });
let o = await opts(page);
expect(o.a === 'wrong' && o.b === 'dim' && o.c === 'dim', `S01 wrong: chosen card wrong, others dim (${JSON.stringify(o)})`);
await expectLayout(page, 'S01 wrong');
await shot(page, 's01-wrong-a.png');

await press(page, 'ArrowRight'); // arrow keys move between the options
expect(await isActive(page, '.w-opt[data-id="b"]'), 'S01 ArrowRight moves focus to option b');
await press(page, 'Enter');
await expectRow(page, 'S01 correct (b)', { state: 'correct', text: opt('S01', 'b').feedback, cont: true });
expect(await isActive(page, '[data-action="continue"]'), 'S01 correct: focus on Continue');
await expectLayout(page, 'S01 correct');
await shot(page, 's01-correct.png');
await press(page, 'Enter');

await expectNewScreen(page, 'S02', 'S01 Continue');
await expectRow(page, 'S02 before action', { state: 'hint', text: S.S02.hint, cont: false });
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectRow(page, 'S02 empty Save', { state: 'notice', text: S.S02.feedback.empty, cont: false });
await expectLayout(page, 'S02 empty');
await shot(page, 's02-empty.png');
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
expect(s02.counters.join() === `${TITLE.length + 3}/250,${PROBLEM.length}/250` && s02.max.join() === '250,250' && s02.described && s02.labelled,
  `S02 fields: labelled, maxlength 250, live counters ${s02.counters.join(' and ')}, aria-describedby counter + privacy line`);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectRow(page, 'S02 saved', { state: 'neutral', text: S.S02.feedback.saved, cont: true });
const saved = await page.evaluate(() => ({ top: document.querySelector('.w-saved-text').textContent, f: window.__l4.state.f }));
expect(saved.top === UI.saved && saved.f.L4_CASE_TITLE === TITLE && saved.f.L4_CASE_PROBLEM === PROBLEM,
  `S02 saved: top bar "${saved.top}", values stored trimmed under L4_CASE_TITLE and L4_CASE_PROBLEM`);
expect(await isActive(page, '[data-action="continue"]'), 'S02 saved: focus on Continue');
await expectLayout(page, 'S02 saved');
await shot(page, 's02-saved.png');
await press(page, 'Enter');

await expectNewScreen(page, 'FT1', 'S02 Continue');
await expectRow(page, 'FT1 before action', { state: 'hint', text: S.FT1.hint, cont: false });
await expectLayout(page, 'FT1 hint');
await shot(page, 'ft1-hint.png');
await tabTo(page, '.w-opt[data-id="b"]');
await press(page, 'Enter');
const routeBtns = S.FT1.routing.correctFirstTry.choices.map((c) => c.button);
await expectRow(page, 'FT1 right first try', { state: 'correct', text: opt('FT1', 'b').feedback, cont: false, actions: routeBtns });
expect(await page.evaluate(() => [...document.querySelectorAll('.w-fb-actions button')].map((b) => b.textContent).join('|')) === routeBtns.map((k) => UI.buttons[k]).join('|')
  && await isActive(page, `[data-action="${routeBtns[0]}"]`), `FT1 right: buttons "${routeBtns.map((k) => UI.buttons[k]).join('" and "')}", focus on the first`);
await expectLayout(page, 'FT1 correct');
await shot(page, 'ft1-correct.png');
await press(page, 'Enter'); // Jump to the last task

await expectNewScreen(page, 'S03', 'FT1 "Jump to the last task"');
const skip = await page.evaluate(() => ({ r: window.__l4.state.r, v1: window.__l4.doneSet().has('V1'), fill: document.querySelector('.w-seg[data-chapter="1"] .w-seg-fill').style.width }));
expect(skip.r === 'skip' && skip.v1 && Math.abs(parseFloat(skip.fill) - 200 / 3) < 0.1, `FT1 jump: route "${skip.r}", skipped V1 counts as done, chapter 1 bar filled ${parseFloat(skip.fill).toFixed(1)}% (no hole)`);
await expectRow(page, 'S03 before action', { state: 'hint', text: S.S03.hint, cont: false });
const term = await page.evaluate(() => {
  const d = document.querySelector('.w-opt[data-id="d"]');
  const desc = (d.getAttribute('aria-describedby') || '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
  return { desc, dot: !!d.querySelector('.w-opt-info'), underline: d.querySelector('.w-term-static')?.textContent, nested: d.querySelectorAll('a, button, input, [tabindex]').length };
});
expect(term.desc === C.tooltips['Success metric'] && term.dot && term.underline && !term.nested,
  `S03 term on the "No success metric" card: aria-describedby definition, info dot, dotted "${term.underline}", no nested focusable`);
await expectLayout(page, 'S03 hint');
await tabTo(page, '.w-opt[data-id="a"]');
await press(page, ' ');
await press(page, 'ArrowRight');
await press(page, ' ');
o = await opts(page);
const checkOn = await page.evaluate(() => !document.querySelector('[data-action="check"]').disabled);
expect(o.a === '+pressed' && o.b === '+pressed' && checkOn, `S03 Space selects a, ArrowRight + Space selects b (aria-pressed), Check enabled at 2`);
await press(page, 'ArrowDown');
expect(await isActive(page, '.w-opt[data-id="d"]'), 'S03 grid: ArrowDown moves from b to d');
await press(page, 'ArrowLeft');
expect(await isActive(page, '.w-opt[data-id="c"]'), 'S03 grid: ArrowLeft moves from d to c');
await press(page, ' ');
o = await opts(page);
expect(!o.c.includes('pressed'), 'S03 a third card cannot be selected while two are');
await expectLayout(page, 'S03 selected');
await shot(page, 's03-selected.png');
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
await expectRow(page, 'S03 Check a + b, page 1', { state: 'wrong', text: opt('S03', 'a').feedback, cont: false, pager: '1 of 2' });
o = await opts(page);
expect(o.a === 'wrong' && o.b === 'correct+pressed', `S03 after Check: a marked wrong and deselected, b marked correct and kept (${JSON.stringify(o)})`);
await expectLayout(page, 'S03 feedback 1 of 2');
await shot(page, 's03-feedback-1of2.png');
expect(await isActive(page, '.w-pager button[aria-label="' + UI.feedback.nextFeedback + '"]'), 'S03 focus on the feedback Next button');
await press(page, 'Enter');
await expectRow(page, 'S03 paged Next', { state: 'correct', text: opt('S03', 'b').feedback, cont: false, pager: '2 of 2' });
expect(await isActive(page, '.w-pager button[aria-label="' + UI.feedback.prevFeedback + '"]'), 'S03 last page: focus moves to Previous (Next is disabled)');
await press(page, 'Enter');
await expectRow(page, 'S03 paged Previous', { state: 'wrong', text: opt('S03', 'a').feedback, cont: false, pager: '1 of 2' });
await tabTo(page, '.w-opt[data-id="d"]', { back: true });
await press(page, ' ');
o = await opts(page);
expect(o.a === '' && o.b === '+pressed' && o.d === '+pressed', `S03 retry: marks cleared, b and d selected (${JSON.stringify(o)})`);
await tabTo(page, '[data-action="check"]');
await press(page, 'Enter');
await expectRow(page, 'S03 Check b + d', { state: 'correct', text: opt('S03', 'b').feedback, cont: true, pager: '1 of 2' });
o = await opts(page);
expect(o.b === 'correct+pressed' && o.d === 'correct+pressed' && o.a === 'dim' && o.c === 'dim', `S03 right: both keys teal, others dim (${JSON.stringify(o)})`);
expect(await isActive(page, '[data-action="continue"]'), 'S03 right: focus on Continue');
await tabTo(page, '.w-pager button[aria-label="' + UI.feedback.nextFeedback + '"]', { back: true });
await press(page, 'Enter');
await expectRow(page, 'S03 right, page 2', { state: 'correct', text: opt('S03', 'd').feedback, cont: true, pager: '2 of 2' });
await press(page, 'Enter');
await expectRow(page, 'S03 right, back to page 1', { state: 'correct', text: opt('S03', 'b').feedback, cont: true, pager: '1 of 2' });
await expectLayout(page, 'S03 correct');
await tabTo(page, '[data-action="continue"]');
await press(page, 'Enter');
const ch1 = C.chapters.find((c) => c.id === 'ch1');
await expectRow(page, 'S03 Continue: chapter-end pause marker', { state: 'pause', text: ch1.pauseMarker, cont: true, pager: '' });
expect(await isActive(page, '[data-action="continue"]') && await screen(page) === 'S03', 'pause marker: still on S03, focus on Continue');
await expectLayout(page, 'S03 pause marker');
await shot(page, 's03-pause-marker.png');
await press(page, 'Enter');
await expectNewScreen(page, 'S19', 'pause marker Continue');

const ev = await events(page);
const first = (id) => ev.filter((e) => e.kind === 'answer' && e.trackingId === id);
const IDS = ['L4_S01_1', 'L4_S02_1', 'L4_S02_2', 'L4_FT1_1', 'L4_S03_1'];
expect(IDS.every((id) => first(id).length === 1) && ev.filter((e) => e.kind === 'answer').length === IDS.length,
  `bus: exactly one first-attempt event per id (${IDS.map((id) => id + ' ' + first(id).length).join(', ')})`);
const f = Object.fromEntries(IDS.map((id) => [id, first(id)[0]]));
expect(f.L4_S01_1.response === 'a' && f.L4_S01_1.result === 'wrong' && f.L4_S02_1.response === TITLE && f.L4_S02_1.result === 'neutral' && f.L4_S02_1.type === 'fill-in'
  && f.L4_FT1_1.response === 'b' && f.L4_FT1_1.result === 'correct' && f.L4_S03_1.response === 'a,b' && f.L4_S03_1.result === 'wrong',
  `bus: first responses ${IDS.map((id) => id + '=' + JSON.stringify(f[id].response.slice(0, 20)) + '/' + f[id].result).join(', ')}`);
const shape = IDS.every((id) => ['trackingId', 'type', 'response', 'result', 'latencyMs', 'at'].every((k) => k in f[id]) && f[id].latencyMs >= 0 && !isNaN(Date.parse(f[id].at)));
expect(shape, 'bus: every first-attempt event carries trackingId, type, response, result, latencyMs, at');
const retries = ev.filter((e) => e.kind === 'retry').map((e) => `${e.trackingId}=${e.response}/${e.result}`);
expect(retries.join() === 'L4_S01_1=b/correct,L4_S03_1=b,d/correct', `bus: retries as retry events (${retries.join(', ')})`);
expect(!page.errors.length, 'main path: no console errors' + (page.errors.length ? ': ' + page.errors.join(' | ') : ''));
await page.close();

/* ---------- FT1 side paths ---------- */
console.log('\nFT1 paths');
async function ft1Path(name, keys, { to, route, answer }) {
  const p = await open('?reset=1&screen=FT1');
  await expectNewScreen(p, 'FT1', `${name}: start`);
  await keys(p);
  const r = await p.evaluate(() => ({ id: window.__l4.current, route: window.__l4.state.r, ev: window.__l4.tracking.events }));
  const answers = r.ev.filter((e) => e.kind === 'answer').map((e) => e.trackingId + '=' + e.response + '/' + e.result);
  expect(r.id === to && r.route === route && answers.join() === (answer || ''), `${name}: lands on ${r.id}, route "${r.route}", answer events [${answers.join(', ')}]`);
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
  await expectRow(p, 'FT1 wrong (c)', { state: 'wrong', text: opt('FT1', 'c').feedback, cont: true });
  const o2 = await opts(p);
  expect(o2.c === 'wrong' && o2.a === 'dim' && o2.b === 'dim' && await isActive(p, '[data-action="continue"]')
    && await p.evaluate(() => getComputedStyle(document.querySelector('[data-action="skipChallenge"]')).visibility === 'hidden'),
  'FT1 wrong: one attempt, options locked, Skip link gone, focus on Continue');
  await expectLayout(p, 'FT1 wrong');
  await shot(p, 'ft1-wrong.png');
  await press(p, 'Enter');
}, { to: 'V1', route: 'full', answer: 'L4_FT1_1=c/wrong' });
await ft1Path('FT1 "Skip challenge"', async (p) => {
  await tabTo(p, '[data-action="skipChallenge"]');
  await press(p, 'Enter');
}, { to: 'V1', route: 'full', answer: '' });

/* ---------- avatar slot with a temporary local test image (content stays avatar.src null) ---------- */
console.log('\navatar slot');
{
  const maker = await browser.newPage();
  await maker.setViewport({ width: 600, height: 600 });
  // a synthetic test image: navy and turquoise shapes, no face, no real person
  await maker.setContent('<body style="margin:0"><div style="width:600px;height:600px;background:linear-gradient(135deg,#255777,#5AB3AA);display:grid;place-items:center">'
    + '<div style="width:260px;height:260px;border-radius:50%;background:#E8F3F2;opacity:.85"></div></div></body>');
  const img = await maker.screenshot({ type: 'jpeg', quality: 80 });
  await maker.close();
  const TEST_SRC = 'assets/avatars/__walk-test-image.jpg'; // served from memory only, never written to disk
  const p = await browser.newPage();
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(e.message));
  await p.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.setRequestInterception(true);
  p.on('request', (req) => {
    const url = req.url();
    if (url.endsWith('/content/l4-slice.json')) {
      const c = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
      c.characters.dana.avatar.src = TEST_SRC;
      req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(c) });
    } else if (url.endsWith(TEST_SRC)) req.respond({ status: 200, contentType: 'image/jpeg', body: img });
    else req.continue();
  });
  await p.goto(BASE + '?reset=1', { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => window.__l4 && document.querySelector('.w-avatar-img')?.complete);
  const a = await p.evaluate(() => {
    const el = document.querySelector('.w-avatar-img');
    const r = el.getBoundingClientRect();
    return { alt: el.alt, fit: getComputedStyle(el).objectFit, w: Math.round(r.width), h: Math.round(r.height), loaded: el.naturalWidth > 0, badge: document.querySelector('.w-badge')?.textContent };
  });
  expect(a.loaded && a.alt === C.characters.dana.avatar.alt && a.fit === 'cover' && a.w === 120 && a.h === 120 && a.badge === UI.fictionalBadge,
    `avatar with src set: image ${a.w}x${a.h}, object-fit ${a.fit}, alt from content, badge "${a.badge}"`);
  await expectLayout(p, 'S01 with avatar image');
  await shot(p, 's01-avatar-test-image.png');
  await p.close();
  const ph = await open('?reset=1');
  const pr = await ph.evaluate(() => { const el = document.querySelector('.w-avatar-ph'); return { role: el?.getAttribute('role'), label: el?.getAttribute('aria-label'), initial: el?.textContent }; });
  expect(C.characters.dana.avatar.src === null && pr.role === 'img' && pr.label === C.characters.dana.avatar.alt && pr.initial === 'D',
    `avatar.src null in content: placeholder circle "${pr.initial}", role img, alt from content`);
  await ph.close();
}

await browser.close();
server.close();
console.log(fails.length ? `\nwalk FAILED (${fails.length})` : '\nwalk passed');
process.exit(fails.length ? 1 : 0);
