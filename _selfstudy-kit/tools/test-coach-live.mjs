// Kit tool (from EAI M1 L4 CO2): the live coach, the lesson's coach page (kit.json coach.url) framed in the coach
// panel. Usage: npm run test:coach-live. The screens it uses come from the content: one with a tip (kit.json
// review.coachScreen), a presentation one, the own-case screens (coach.kind own), the locked one and the one after.
// (--shots: S21 locked and the 8 s fallback into review/co2/screens). A local stub stands in for the page
// (tools/coach-stub.html, served at the coach URL by request interception: nothing reaches the network).
//   1. the frame: none before the first open; on open one iframe, src exactly the coach URL, titled, 340
//      wide under the header to the panel's foot, no border; kept across screens and closes, never reloaded
//   2. the context: after ready and on every slice screen, exactly the 10 keys with valid types and limits,
//      each screen's own values; caseNotes ("Label: text", filled fields only, at most 6000) only on
//      S02, S08B, S12B, S17B, S18B, S20B
//   3. S21 hides the frame (CO1's locked notice, screenType 'locked' sent); S21R shows it again
//   4. page to lesson: ready sends the context, close closes the panel (focus on the launcher); a message
//      from another source or another origin is ignored; Tab from the header into the frame and back;
//      Escape in the lesson still closes
//   5. SCORM: no LMSSetValue / LMSCommit while the coach is used
//   6. fallback: no ready in 8 s (and a failed load): the frame goes, CO1's offline tip shows, no error
//   7. never framed in review mode or with ?live=0
import puppeteer from 'puppeteer-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, stubCoach } from './lib.mjs';
import { KIT, readContent, configureSrc } from './kit.mjs';
await configureSrc();
const { resolveChapterRefs } = await import('../src/util.js');
const { SCREEN_TYPES, CONTEXT_MAX, caseLabels } = await import('../src/coach/live.js');
const COACH_URL = KIT.coach?.url || '';
if (!COACH_URL) { console.log('test:coach-live: the lesson has no live coach page (kit.json coach.url): nothing to test'); process.exit(0); }
const COACH_ORIGIN = new URL(COACH_URL).origin;
const CASE_KEYS = KIT.coach?.caseKeys || [];

const C = resolveChapterRefs(readContent());
const UI = C.ui.coach;
const S = Object.fromEntries(C.screens.map((s) => [s.id, s]));
const MOCK = readFileSync(join(ROOT, 'tools', 'scorm-mock.js'), 'utf8');
const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = join(ROOT, 'review', 'co2', 'screens');
const SL = C.lesson.slice;
// the own-case screens (coach.kind own: screenType case) carry caseNotes when the lesson keeps the learner's case
const CASE_SCREENS = CASE_KEYS.length ? SL.filter((id) => S[id].coach?.kind === 'own') : [];
const TIP = KIT.review?.coachScreen || SL.find((id) => S[id]?.coach?.tip);
const TIP_TYPE = SCREEN_TYPES[S[TIP].coach.kind], TIP_LINE = UI.lines[S[TIP].coach.kind];
const PRESENT = SL.find((id, i) => i > SL.indexOf(TIP) && SCREEN_TYPES[S[id].coach?.kind] === 'present' && S[id].coach?.tip);
const LOCKED = SL.find((id) => S[id].coach?.kind === 'locked');
const AFTER_LOCKED = LOCKED ? SL[SL.indexOf(LOCKED) + 1] : null;
const KEYS = ['type', 'v', 'screen', 'chapter', 'chapterTitle', 'step', 'screenType', 'note', 'tip', 'caseNotes'];
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
async function open(query, { lms = null, mode = 'ready' } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.close = ((closePage) => async () => { await closePage().catch(() => {}); await context.close().catch(() => {}); })(page.close.bind(page));
  if (lms) await page.evaluateOnNewDocument(`${MOCK}\n;window.installScormMock(${JSON.stringify(lms)});`);
  page.stub = await stubCoach(page, mode);
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + query, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  return page;
}
const settle = (p, ms = 40) => p.evaluate((t) => new Promise((r) => setTimeout(r, t)), ms);
const coachFrame = (p) => p.frames().find((f) => f.url() === COACH_URL);
const got = async (p) => (await coachFrame(p)?.evaluate(() => window.got.map((m) => ({ origin: m.origin, data: m.data })))) || [];
const waitLive = (p) => p.waitForFunction(() => window.__l4.coach.isLive(), { timeout: 5000 }).then(() => true, () => false);
const state = (p) => p.evaluate(() => {
  const panel = document.querySelector('.w-coach-panel'), frames = panel.querySelectorAll('iframe');
  const f = frames[0];
  const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
  return { open: !panel.hidden, frames: frames.length, frameShown: !!f && !f.hidden && !!f.getClientRects().length,
    src: f?.getAttribute('src'), title: f?.title, border: f && getComputedStyle(f).borderTopWidth, frame: f && box(f), head: box(panel.querySelector('.w-coach-head')), panel: box(panel),
    msgs: [...panel.querySelectorAll('.w-coach-msg')].filter((m) => m.getClientRects().length).map((m) => m.dataset.from + ':' + m.textContent.trim()),
    focus: document.activeElement === f ? 'frame' : (document.activeElement?.className || '') };
});
// a context message: exactly the 10 keys, valid types and limits; the problems, or []
function badContext(m) {
  const bad = [];
  const keys = Object.keys(m || {});
  if (keys.length !== KEYS.length || !KEYS.every((k) => keys.includes(k))) bad.push('keys ' + keys.join(','));
  if (m.type !== 'wawiwa-coach-context' || m.v !== 1) bad.push('type/v');
  if (!Number.isInteger(m.chapter) || m.chapter < 1 || m.chapter > C.chapters.length) bad.push('chapter ' + m.chapter);
  for (const [k, max] of Object.entries(CONTEXT_MAX)) if (typeof m[k] !== 'string' || m[k].length > max) bad.push(`${k} (${typeof m[k]} ${m[k]?.length})`);
  if (!/^[A-Za-z0-9]{1,12}$/.test(m.screen || '')) bad.push('screen ' + m.screen);
  if (!Object.values(SCREEN_TYPES).includes(m.screenType)) bad.push('screenType ' + m.screenType);
  return bad;
}
async function shot(p, name) {
  if (!SHOTS) return;
  mkdirSync(SHOT_DIR, { recursive: true });
  await p.mouse.move(0, 0);
  await p.screenshot({ path: join(SHOT_DIR, name) });
  console.log('       shot ' + name);
}

/* ---- 1, 4, 5: the frame on the tip screen, ready and close, foreign messages, keyboard, no SCORM call ---- */
console.log('\n1. the frame, 4. messages, 5. SCORM');
{
  const p = await open(`?reset=1&screen=${TIP}`);
  await p.keyboard.press('Shift'); // any key stops a ghost hand
  const s0 = await state(p);
  expect(s0.frames === 0 && p.stub.hits === 0, `before the first open: no iframe, no load of the coach page (${p.stub.hits})`);
  await p.click('.w-coach-launcher');
  const live = await waitLive(p);
  const s1 = await state(p);
  const fit = s1.frame && Math.round(s1.frame.w) === 340 && Math.abs(s1.frame.t - s1.head.b) < 1 && Math.abs(s1.frame.b - s1.panel.b) < 1;
  expect(s1.frames === 1 && s1.src === COACH_URL && s1.title === UI.frameTitle && s1.border === '0px' && fit && s1.frameShown && !s1.msgs.length,
    `first open: one iframe, src ${s1.src}, title "${s1.title}", ${s1.frame && Math.round(s1.frame.w)} x ${s1.frame && Math.round(s1.frame.h)} from the header to the panel's foot, border ${s1.border}; no CO1 messages`);
  const m1 = await got(p);
  expect(live && m1.length === 1 && m1[0].data.screen === TIP && m1[0].data.screenType === TIP_TYPE && !badContext(m1[0].data).length && m1[0].origin === new URL(BASE).origin,
    `ready -> one context for ${TIP} (${TIP_TYPE}), from the lesson's origin${m1[0] ? '' : ' (none)'}`);
  // foreign messages: from the lesson window itself, a wrong origin with the frame's source, the right
  // origin from another source; none closes the panel or makes the lesson send again
  await p.evaluate((origin) => {
    const f = document.querySelector('.w-coach-frame');
    window.postMessage({ type: 'wawiwa-coach-close' }, '*');
    window.postMessage({ type: 'wawiwa-coach-ready' }, '*');
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'wawiwa-coach-close' }, origin: 'https://evil.example', source: f.contentWindow }));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'wawiwa-coach-ready' }, origin: 'https://evil.example', source: f.contentWindow }));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'wawiwa-coach-close' }, origin, source: window }));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'wawiwa-coach-ready' }, origin, source: window }));
  }, COACH_ORIGIN);
  await settle(p, 100);
  const s2 = await state(p);
  const m2 = await got(p);
  expect(s2.open && m2.length === 1, `6 foreign messages (another source or origin, close and ready): ignored, panel open, no new context (${m2.length})`);
  // a ready from the frame itself: the context again
  await coachFrame(p).evaluate(() => window.parent.postMessage({ type: 'wawiwa-coach-ready' }, '*'));
  await settle(p, 100);
  const m3 = await got(p);
  expect(m3.length === 2 && m3[1].data.screen === TIP, `a ready from the page: the context is sent again (${m3.length})`);
  // keyboard: Tab from the header's close into the frame, Shift+Tab back
  await p.focus('.w-coach-close');
  await p.keyboard.press('Tab');
  const k1 = (await state(p)).focus;
  await p.keyboard.down('Shift'); await p.keyboard.press('Tab'); await p.keyboard.up('Shift');
  const k2 = (await state(p)).focus;
  expect(k1 === 'frame' && k2.includes('w-coach-close'), `Tab: close -> the frame (${k1}); Shift+Tab -> back to close (${k2})`);
  // Escape inside the page: the page says close; the panel closes, focus on the launcher
  await p.keyboard.press('Tab');
  await p.keyboard.press('Escape');
  await settle(p, 100);
  const s3 = await state(p);
  expect(!s3.open && s3.focus.includes('w-coach-launcher'), `Escape in the page: close message -> panel closed, focus on the launcher (${s3.focus})`);
  // reopen: the same frame, not reloaded; Escape in the lesson (on the grip) still closes
  const born = await coachFrame(p).evaluate(() => window.bornAt);
  await p.click('.w-coach-launcher'); await settle(p);
  const s4 = await state(p);
  const born2 = await coachFrame(p).evaluate(() => window.bornAt);
  await p.focus('.w-coach-grip'); await p.keyboard.press('Escape'); await settle(p);
  const s5 = await state(p);
  expect(s4.open && s4.frames === 1 && s4.frameShown && born === born2 && p.stub.hits === 1 && !s5.open && s5.focus.includes('w-coach-launcher'),
    `reopen: the same iframe, not reloaded (${p.stub.hits} load); Escape in the lesson closes it`);
  // closed, then a screen change: the context still goes; reopen shows the frame on the new screen
  await p.evaluate((x) => window.__l4.go(x), PRESENT); await settle(p, 100);
  const m4 = await got(p);
  expect(m4.at(-1).data.screen === PRESENT && m4.at(-1).data.screenType === 'present' && p.stub.hits === 1, `screen change with the panel closed: the context for ${PRESENT} (present) goes, no reload`);
  expect(!p.errors.length, 'no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}
// SCORM, with the mock 1.2 API: the coach alone, no screen change
{
  const p = await open(`?screen=${TIP}`, { lms: {} });
  const calls = () => p.evaluate(() => window.__scormMock.report().calls.filter((c) => c.startsWith('set ') || c === 'LMSCommit').length);
  await p.keyboard.press('Shift'); await settle(p); await wait(2500);
  const before = await calls();
  await p.click('.w-coach-launcher'); await waitLive(p);
  await coachFrame(p).evaluate(() => { document.getElementById('q').value = 'What goes in the title?'; document.querySelector('button').click(); });
  await p.keyboard.press('Escape');
  await p.click('.w-coach-launcher'); await settle(p);
  await p.click('.w-coach-close'); await wait(2500);
  const after = await calls();
  expect(after === before, `SCORM: open, ask in the page, Escape, reopen, close on ${TIP}: no LMSSetValue / LMSCommit (${before} before, ${after} after)`);
  await p.close();
}

/* ---- 2, 3: the context on every slice screen; the locked screen hides the frame ---- */
console.log('\n2. context on every screen, 3. the locked screen');
{
  const p = await open(`?reset=1&screen=${SL[0]}`);
  // the learner's own case: every field filled but the last (blank), the fourth over 6000 with the rest
  const LONG = CASE_KEYS[Math.min(3, CASE_KEYS.length - 1)], BLANK = CASE_KEYS[CASE_KEYS.length - 1];
  await p.evaluate((keys, long, blank) => {
    const f = window.__l4.state.f;
    keys.forEach((k, i) => { f[k] = `answer ${i + 1}`; });
    if (blank) f[blank] = '   ';
    if (long) f[long] = 'step '.repeat(1300);
  }, CASE_KEYS, LONG, BLANK);
  await p.click('.w-coach-launcher');
  await waitLive(p);
  const bad = [], caseOn = [], seen = [];
  let s21 = null, s21r = null, sample = null;
  for (const id of C.lesson.slice) {
    await p.evaluate((x) => window.__l4.go(x), id);
    await settle(p, 60);
    const m = (await got(p)).at(-1)?.data;
    if (!m || m.screen !== id) { bad.push(`${id}: no context`); continue; }
    seen.push(id);
    const s = S[id];
    const b = badContext(m);
    const ch = C.chapters.findIndex((c) => c.id === s.chapter) + 1;
    if (m.chapter !== ch) b.push(`chapter ${m.chapter} not ${ch}`);
    if (m.chapterTitle !== C.chapters[ch - 1].title.slice(0, 80)) b.push('chapterTitle');
    if (m.step !== (s.step?.verb || '').slice(0, 60)) b.push(`step ${m.step}`);
    if (m.screenType !== SCREEN_TYPES[s.coach.kind]) b.push(`screenType ${m.screenType} for ${s.coach.kind}`);
    if (m.tip !== (s.coach.tip || '').slice(0, 600)) b.push('tip');
    if (m.note !== '') b.push('note');
    if (b.length) bad.push(`${id}: ${b.join(', ')}`);
    if (m.caseNotes) caseOn.push(id);
    if (id === CASE_SCREENS[0]) sample = m.caseNotes;
    if (id === LOCKED) s21 = { m, st: await state(p) };
    if (id === AFTER_LOCKED) s21r = { m, st: await state(p) };
  }
  expect(!bad.length && seen.length === C.lesson.slice.length, `${seen.length} slice screens, each a context with exactly the 10 keys, valid types and limits, its own chapter, step, type and tip${bad.length ? ': ' + bad.join(' | ') : ''}`);
  expect(caseOn.join(',') === CASE_SCREENS.join(','), `caseNotes only on ${caseOn.join(', ') || 'no screen (the lesson keeps no case of the learner)'}`);
  if (CASE_KEYS.length >= 5) {
    const lab = caseLabels(C), lines = (sample || '').split('\n');
    expect(sample && sample.length === 6000 && lines[0] === `${lab[CASE_KEYS[0]]}: answer 1` && lines[1] === `${lab[CASE_KEYS[1]]}: answer 2` && lines[2] === `${lab[CASE_KEYS[2]]}: answer 3` && lines[3].startsWith(`${lab[LONG]}: step step`) && !sample.includes(`${lab[BLANK]}:`),
      `caseNotes: "Label: text" lines in order, the blank field left out, cut at 6000 (${sample?.length})`);
  }
  if (LOCKED) expect(s21 && s21.m.screenType === 'locked' && s21.m.tip === '' && s21.st.open && !s21.st.frameShown && s21.st.frames === 1 && s21.st.msgs.join('|') === `notice:${UI.locked}`,
    `${LOCKED}: screenType locked sent, the frame hidden (still mounted), CO1's notice "${UI.locked}"`);
  if (SHOTS && LOCKED) { await p.evaluate((x) => window.__l4.go(x), LOCKED); await settle(p); await shot(p, '03-locked.png'); await p.evaluate((x) => window.__l4.go(x), AFTER_LOCKED); await settle(p); }
  if (LOCKED) expect(s21r && s21r.m.screenType === SCREEN_TYPES[S[AFTER_LOCKED].coach.kind] && s21r.st.frameShown && !s21r.st.msgs.length && p.stub.hits === 1, `${AFTER_LOCKED}: the frame shown again, the same load (${p.stub.hits})`);
  if (LOCKED) {
    const launcher = await p.evaluate((x) => { window.__l4.go(x); const b = document.querySelector('.w-coach-launcher'); return { locked: b.dataset.locked, badge: !b.querySelector('.w-coach-lock').hidden }; }, LOCKED);
    expect(launcher.locked === 'true' && launcher.badge, `${LOCKED}: the launcher keeps CO1's locked look (lock badge)`);
  }
  expect(!p.errors.length, 'no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}

/* ---- 6. fallback: no ready in 8 s, a failed load ---- */
console.log('\n6. fallback');
for (const mode of ['silent', 'abort']) {
  const p = await open(`?reset=1&screen=${TIP}`, { mode });
  await p.keyboard.press('Shift');
  await p.click('.w-coach-launcher'); await settle(p);
  const early = await state(p);
  await wait(7000);
  const at7 = await state(p);
  await wait(1500);
  const s = await state(p);
  const tip = S[TIP].coach.tip;
  expect(early.frames === 1 && at7.frames === 1 && s.frames === 0 && s.open && s.msgs.join('|') === [`coach:${TIP_LINE}`, `you:${UI.tipChip}`, `coach:${tip}`].join('|'),
    `${mode}: the frame waits (7 s: still there), at 8 s it goes and CO1's offline tip shows`);
  if (mode === 'silent') await shot(p, '04-fallback-8s.png');
  await p.evaluate((x) => window.__l4.go(x), PRESENT); await settle(p);
  const n = await state(p);
  await p.click('.w-coach-close'); await p.click('.w-coach-launcher'); await settle(p);
  const r = await state(p);
  expect(n.frames === 0 && n.msgs.join('|') === `coach:${UI.lines[S[PRESENT].coach.kind]}` && r.frames === 0 && p.stub.hits === 1, `${mode}: the rest of the launch offline (${PRESENT}: line and chip; reopened: no new frame, ${p.stub.hits} load)`);
  const errs = p.errors.filter((e) => !/net::ERR_FAILED|Failed to load resource/.test(e));
  expect(!errs.length, `${mode}: no lesson error` + (errs.length ? ': ' + errs.join(' | ') : ''));
  await p.close();
}

/* ---- 7. never framed in review mode or with ?live=0 ---- */
console.log('\n7. review mode, ?live=0');
for (const q of [`?review=1&screen=${TIP}`, `?reset=1&live=0&screen=${TIP}`]) {
  const p = await open(q);
  await p.keyboard.press('Shift');
  await p.click('.w-coach-launcher'); await settle(p, 300);
  const s = await state(p);
  expect(s.open && s.frames === 0 && p.stub.hits === 0 && s.msgs.join('|') === `coach:${TIP_LINE}`, `${q}: no iframe, no load; CO1's offline panel`);
  await p.close();
}

await browser.close();
server.close();
console.log(fails.length ? `\ntest:coach-live FAILED (${fails.length})` : '\ntest:coach-live passed');
process.exit(fails.length ? 1 : 0);
