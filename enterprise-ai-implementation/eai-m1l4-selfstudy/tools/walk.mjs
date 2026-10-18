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
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';

const SHOTS = process.argv.includes('--shots');
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

async function open(query) {
  const page = await browser.newPage();
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
console.log('\nmain path (debug=1)');
const page = await open('?reset=1&debug=1');
await expectNewScreen(page, 'S01', 'start');
await expectBand(page, 'S01 before action', { state: 'hint', text: S.S01.hint, unlocked: false, lockedWhy: UI.footer.locked.single });
expect(await page.evaluate(() => document.querySelector('.w-prev').getAttribute('aria-disabled') === 'true'), 'S01: Previous disabled on the first screen');
const img = await page.evaluate(() => { const i = document.querySelector('.w-photo-column'); return { alt: i?.alt, temp: i?.dataset.temp, loaded: i?.naturalWidth > 0 }; });
expect(img.alt === S.S01.image.alt && img.temp === 'true' && img.loaded, `S01 image slot: alt from content, temp image loaded (${S.S01.image.src})`);
await expectLayout(page, 'S01 hint');
await shot(page, 's01-hint.png');

// rail at the start
let rl = await rail(page);
expect(rl.dots.map((d) => d.status).join() === 'current,locked,notInPilot,notInPilot,notInPilot,locked,notInPilot' && rl.pct === '0%' && rl.line === 0,
  `rail at start: ${rl.dots.map((d) => d.status).join(' ')}, ${rl.pct}, teal line ${rl.line}px`);
expect(rl.dots[0].label === `${CH.ch0.title}, ${UI.rail.status.current}` && rl.dots[0].current === 'step' && rl.dots[1].disabled === 'true' && rl.dots[1].label === `${CH.ch1.title}, ${UI.rail.status.locked}`,
  `rail labels: "${rl.dots[0].label}" (aria-current step), "${rl.dots[1].label}" (aria-disabled)`);
await tabTo(page, '.w-dot[data-chapter="1"]', { back: true });
const tip = await page.evaluate(() => { const t = document.querySelector('.w-tip'); return t.hidden ? '' : t.textContent; });
await press(page, 'Enter');
expect(await screen(page) === 'S01' && tip === rl.dots[1].label, `rail: a future chapter is announced ("${tip}") and Enter on it does nothing`);
await press(page, 'Escape');

// menu: open, trap, Escape
await tabTo(page, '.w-rail-menu', { back: true });
await press(page, 'Enter');
let menu = await page.evaluate(() => ({
  open: !document.querySelector('.w-menu-overlay').hidden, inPanel: document.querySelector('.w-panel').contains(document.activeElement), focus: document.activeElement.className,
  role: document.querySelector('.w-panel').getAttribute('role'), modal: document.querySelector('.w-panel').getAttribute('aria-modal'), expanded: document.querySelector('.w-rail-menu').getAttribute('aria-expanded'),
  kicker: document.querySelector('.w-panel-kicker').textContent, title: document.querySelector('.w-panel-title').textContent,
  pct: document.querySelector('.w-panel-pct').textContent, left: document.querySelector('.w-panel-left').textContent,
  list: [...document.querySelectorAll('.w-chapter')].map((c) => c.dataset.status + ':' + c.querySelector('.w-chapter-meta').textContent + (c.getAttribute('aria-current') ? '*' : '')),
}));
expect(menu.open && menu.inPanel && menu.focus === 'w-panel-close' && menu.role === 'dialog' && menu.modal === 'true' && menu.expanded === 'true',
  'Enter on the rail menu button opens the menu (dialog, aria-modal), focus on Close');
expect(menu.kicker === UI.menu.kicker && menu.title === C.lesson.title && menu.pct === '0% complete' && menu.left === '3 h left'
  && menu.list.join() === 'current:7 min left*,locked:9 min,notInPilot:22 min,notInPilot:19 min,notInPilot:26 min,locked:1 h 22 min,notInPilot:15 min',
  `menu: "${menu.kicker}", "${menu.pct}", "${menu.left}", chapters ${menu.list.join(' | ')}`);
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

// S02
await expectNewScreen(page, 'S02', 'S01 Next');
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
expect(s02.counters.join() === `${TITLE.length + 3}/250,${PROBLEM.length}/250` && s02.max.join() === '250,250' && s02.described && s02.labelled,
  `S02 fields: labelled, maxlength 250, live counters ${s02.counters.join(' and ')}, aria-describedby counter + privacy line`);
await tabTo(page, '[data-action="save"]');
await press(page, 'Enter');
await expectBand(page, 'S02 saved', { state: 'neutral', text: S.S02.feedback.saved, unlocked: true });
const saved = await page.evaluate(() => ({ rail: document.querySelector('.w-saved-text').textContent, f: window.__l4.state.f }));
expect(saved.rail === UI.saved && saved.f.L4_CASE_TITLE === TITLE && saved.f.L4_CASE_PROBLEM === PROBLEM, `S02 saved: rail "${saved.rail}", values stored trimmed under L4_CASE_TITLE and L4_CASE_PROBLEM`);
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
expect(memo.head === S.FT1.memo.label && memo.label === S.FT1.memo.label && memo.heads === 1,
  `FT1 memo header: the plain label "${memo.head}" from the content, no From / To line`);
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
expect(skipped.r === 'skip' && skipped.v1 && rl.dots[0].status === 'done' && rl.dots[1].status === 'current' && rl.dots[1].current === 'step' && rl.line === 52 && rl.pct === '7%',
  `rail in chapter 1: route "${skipped.r}", skipped V1 counts as done, Entry ${rl.dots[0].status}, Why map ${rl.dots[1].status}, teal line ${rl.line}px, ${rl.pct}`);
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
await expectBand(page, 'S03 Next: chapter-end pause marker', { state: 'pause', text: CH.ch1.pauseMarker, unlocked: true });
expect(await isActive(page, '.w-next') && await screen(page) === 'S03', 'pause marker: still on S03, focus on Next');
await expectLayout(page, 'S03 pause marker');
await press(page, 'Enter');
await expectNewScreen(page, 'S19', 'pause marker Next');

// menu navigation from S19
await tabTo(page, '.w-rail-menu', { back: true });
await press(page, 'Enter');
menu = await page.evaluate(() => ({ pct: document.querySelector('.w-panel-pct').textContent, list: [...document.querySelectorAll('.w-chapter')].map((c) => c.dataset.status + ':' + c.querySelector('.w-chapter-meta').textContent + (c.getAttribute('aria-current') ? '*' : '')) }));
expect(menu.pct === '9% complete' && menu.list.join() === 'done:Done,done:Done,notInPilot:22 min,notInPilot:19 min,notInPilot:26 min,current:1 h 22 min left*,notInPilot:15 min',
  `menu at S19: "${menu.pct}", ${menu.list.join(' | ')}`);
await expectLayout(page, 'menu open');
await shot(page, 'menu-open.png');
await tabTo(page, '.w-chapter[data-chapter="0"]');
await press(page, 'Enter');
await expectNewScreen(page, 'S01', 'menu: Enter on the completed chapter Entry');
await expectBand(page, 'S01 revisit', { state: 'correct', text: opt('S01', 'b').feedback, unlocked: true });
await tabTo(page, '.w-next');
await press(page, 'Enter');
await expectNewScreen(page, 'S02', 'Next from the S01 revisit');
await tabTo(page, '.w-prev', { back: true });
await press(page, 'Enter');
await expectNewScreen(page, 'S01', 'Previous from S02');
await tabTo(page, '.w-dot[data-chapter="5"]', { back: true });
await press(page, 'Enter');
await expectNewScreen(page, 'S19', 'rail: Enter on the chapter in progress opens where the learner is');

const ev = await events(page);
const first = (id) => ev.filter((e) => e.kind === 'answer' && e.trackingId === id);
const IDS = ['L4_S01_1', 'L4_S02_1', 'L4_S02_2', 'L4_FT1_1', 'L4_S03_1'];
expect(IDS.every((id) => first(id).length === 1) && ev.filter((e) => e.kind === 'answer').length === IDS.length,
  `bus: exactly one first-attempt event per id (${IDS.map((id) => id + ' ' + first(id).length).join(', ')})`);
const f = Object.fromEntries(IDS.map((id) => [id, first(id)[0]]));
expect(f.L4_S01_1.response === 'a' && f.L4_S01_1.result === 'wrong' && f.L4_S02_1.response === TITLE && f.L4_S02_1.result === 'neutral' && f.L4_S02_1.type === 'fill-in'
  && f.L4_FT1_1.response === 'b' && f.L4_FT1_1.result === 'correct' && f.L4_S03_1.response === 'a,b' && f.L4_S03_1.result === 'wrong',
  `bus: first responses ${IDS.map((id) => id + '=' + JSON.stringify(f[id].response.slice(0, 20)) + '/' + f[id].result).join(', ')}`);
const retries = ev.filter((e) => e.kind === 'retry').map((e) => `${e.trackingId}=${e.response}/${e.result}`);
expect(retries.join() === 'L4_S01_1=b/correct,L4_S03_1=b,d/correct', `bus: retries as retry events (${retries.join(', ')})`);
expect(!page.errors.length, 'main path: no console errors' + (page.errors.length ? ': ' + page.errors.join(' | ') : ''));
await page.close();

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
