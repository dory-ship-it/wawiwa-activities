// CO1: the Wawiwa AI Coach (offline mode) on its own. Usage: npm run test:coach
//   1. static: src/coach has no network code (fetch, XMLHttpRequest, WebSocket, EventSource,
//      sendBeacon, dynamic import, a URL) and transport.ask() answers { offline: true }; every slice
//      screen has a coach block (S21 locked with no tip, a tip everywhere else); the grounding pack is there
//   2. SCORM: with the mock 1.2 API, using the coach (open: the opening line and the chip; the chip:
//      the learner's question and the tip; dock switch by keyboard and by drag, close, Escape) makes no
//      LMSSetValue and no LMSCommit call, and no network request at all
//   3. S21 locked (60% launcher, lock badge, only the notice, no tip, no chip); S21R unlocked
//   4. suspend_data with the dock set (g.cd = 'r'): under 4096 on a heavy state, and the dock
//      comes back on resume
//   5. nothing typed is kept: offline there is no input row (it stays disabled); review mode writes no
//      dock and no demo letter
//   6. where it opens: with no side picked, the left dock on every slice screen; a right dock the learner
//      picks stays on later screens
//   7. the demo on the goals screen: opens by itself with one line, closes, the hint stays; once; a key
//      ends it; none with reduced motion
import puppeteer from 'puppeteer-core';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';
import { resolveChapterRefs } from '../src/util.js';

const C = resolveChapterRefs(JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8')));
const UI = C.ui.coach;
const MOCK = readFileSync(join(ROOT, 'tools', 'scorm-mock.js'), 'utf8');
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));

/* ---- 1. static ---- */
console.log('\n1. static');
const coachDir = join(ROOT, 'src', 'coach');
const files = readdirSync(coachDir).filter((f) => f.endsWith('.js'));
const NET = /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|\bimport\s*\(|https?:\/\//;
const netHits = files.filter((f) => NET.test(readFileSync(join(coachDir, f), 'utf8').replace(/\/\/.*$/gm, '')));
expect(files.includes('transport.js') && !netHits.length, `src/coach (${files.join(', ')}): no fetch, XHR, WebSocket, EventSource, beacon, dynamic import or URL${netHits.length ? ' (in ' + netHits.join(', ') + ')' : ''}`);
const { ask } = await import('../src/coach/transport.js');
const answer = await ask({ screen: 'S04', kind: 'practice', question: 'test' });
expect(answer && answer.offline === true && Object.keys(answer).length === 1, `transport.ask() answers ${JSON.stringify(answer)}`);
const noBlock = C.lesson.slice.filter((id) => !C.screens.find((s) => s.id === id)?.coach?.kind);
const S21 = C.screens.find((s) => s.id === 'S21');
const noTip = C.screens.filter((s) => s.id !== 'S21' && !s.coach?.tip).map((s) => s.id);
expect(!noBlock.length && S21.coach.kind === 'locked' && !S21.coach.tip && !noTip.length, `every slice screen has coach.kind; S21 locked with no tip; a tip on every other screen${noBlock.length || noTip.length ? ' (missing: ' + [...noBlock, ...noTip].join(', ') + ')' : ''}`);
const copied = C.screens.filter((s) => s.coach?.tip && !s.coach.tipDrafted);
const notWord = copied.filter((s) => s.coach.tip !== s.hint).map((s) => s.id);
expect(!notWord.length, `${copied.length} tips are the screen's hint word for word${notWord.length ? ' (not: ' + notWord.join(', ') + ')' : ''}`);
const drafted = C.screens.filter((s) => s.coach?.tipDrafted);
const long = drafted.filter((s) => s.coach.tip.trim().split(/\s+/).length > 20 || /[–—]/.test(s.coach.tip)).map((s) => s.id);
expect(!long.length, `${drafted.length} drafted tips: 20 words or fewer, no dashes${long.length ? ' (not: ' + long.join(', ') + ')' : ''}`);
const unknownKind = C.screens.filter((s) => s.coach && s.coach.kind !== 'locked' && !UI.lines[s.coach.kind]).map((s) => s.id);
expect(!unknownKind.length, `every coach.kind has its opening line in ui.coach.lines${unknownKind.length ? ' (not: ' + unknownKind.join(', ') + ')' : ''}`);
expect(existsSync(join(ROOT, 'content', 'coach', 'grounding-pack.md')), 'content/coach/grounding-pack.md is there (not read at runtime)');
const csp = readFileSync(join(ROOT, 'index.html'), 'utf8').match(/connect-src ([^;]+);/)?.[1];
expect(csp === "'self'", `index.html CSP connect-src stays ${csp}`);

/* ---- browser ---- */
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
async function open(query, { lms = null } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.close = (closePage => async () => { await closePage().catch(() => {}); await context.close().catch(() => {}); })(page.close.bind(page));
  if (lms) await page.evaluateOnNewDocument(`${MOCK}\n;window.installScormMock(${JSON.stringify(lms)});`);
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + query, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  return page;
}
const settle = (p) => p.evaluate(() => new Promise((r) => setTimeout(r, 30)));
const panelState = (p) => p.evaluate(() => {
  const panel = document.querySelector('.w-coach-panel');
  return { open: !panel.hidden, dock: panel.dataset.dock, msgs: [...panel.querySelectorAll('.w-coach-msg')].map((m) => m.dataset.from + ':' + m.textContent.trim()),
    foot: !panel.querySelector('.w-coach-foot').hidden, focus: document.activeElement?.className || '' };
});

/* ---- 2. SCORM: no API call, no request while the coach is used ---- */
console.log('\n2. SCORM and network');
{
  const p = await open('?screen=S04', { lms: {} });
  const calls = () => p.evaluate(() => window.__scormMock.report().calls.filter((c) => c.startsWith('set ') || c === 'LMSCommit').length);
  const requests = [];
  p.on('request', (r) => requests.push(r.url()));
  await p.keyboard.press('Shift'); // any key stops a ghost hand (its first play is saved: h)
  // the screen's own saves are done, and their commit (the adapter commits at most every 2 s)
  await settle(p); await p.evaluate(() => new Promise((r) => setTimeout(r, 2500)));
  const before = await calls();
  await p.click('.w-coach-launcher');
  await settle(p);
  const s1 = await panelState(p);
  const tip = C.screens.find((s) => s.id === 'S04').coach.tip;
  const chip0 = await p.evaluate(() => { const c = document.querySelector('.w-coach-chip'); return !!c && !c.closest('[hidden]') && c.textContent; });
  await p.click('.w-coach-chip'); await settle(p);
  const s1b = await panelState(p);
  expect(s1.open && s1.msgs.join('|') === `coach:${UI.lines.practice}` && chip0 === UI.tipChip && s1b.msgs.join('|') === [`coach:${UI.lines.practice}`, `you:${UI.tipChip}`, `coach:${tip}`].join('|') && !s1b.foot,
    `S04 open: only "${UI.lines.practice}" and the chip "${chip0}"; the chip asks, the coach answers with the tip, the chip goes`);
  await p.focus('.w-coach-grip');
  await p.keyboard.press('ArrowRight');
  const kRight = (await panelState(p)).dock;
  // drag the grip to the left half: it snaps to the left dock
  const g = await p.$eval('.w-coach-grip', (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x - 300, g.y + 40, { steps: 6 }); await p.mouse.move(g.x - 700, g.y + 40, { steps: 6 }); await p.mouse.up();
  const dragged = (await panelState(p)).dock;
  await p.keyboard.press('Escape');
  const s2 = await panelState(p);
  await p.click('.w-coach-launcher'); await settle(p);
  await p.click('.w-coach-close');
  const after = await calls();
  if (after !== before) console.log('       calls: ' + (await p.evaluate(() => window.__scormMock.report().calls.filter((c) => c.startsWith('set ') || c === 'LMSCommit'))).slice(before).join(' / ').slice(0, 600));
  const ownRequests = requests.filter((u) => !/\.(woff2|jpg|png|mp4|vtt)(\?|$)/.test(u));
  expect(kRight === 'r' && dragged === 'l' && !s2.open && s2.focus.includes('w-coach-launcher'), `dock: Arrow Right -> ${kRight}, drag left -> ${dragged}; Escape closes, focus on the launcher`);
  expect(after === before, `no LMSSetValue / LMSCommit while the coach is used (${before} before, ${after} after)`);
  expect(!ownRequests.length, `no network request while the coach is used${ownRequests.length ? ': ' + ownRequests.join(', ') : ''}`);
  expect(!p.errors.length, 'no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
}

/* ---- 3. S21 locked, S21R unlocked ---- */
console.log('\n3. locked on the check');
{
  const p = await open('?reset=1&screen=S21');
  const l = await p.evaluate(() => { const b = document.querySelector('.w-coach-launcher'); const cs = getComputedStyle(b);
    return { locked: b.dataset.locked, opacity: cs.opacity, ring: cs.borderTopColor, badge: !b.querySelector('.w-coach-lock').hidden, label: b.getAttribute('aria-label') }; });
  await p.click('.w-coach-launcher'); await settle(p);
  const s = await panelState(p);
  expect(l.locked === 'true' && l.opacity === '0.6' && l.ring === 'rgb(138, 151, 159)' && l.badge && l.label === UI.openLocked, `S21 launcher locked: opacity ${l.opacity}, ring ${l.ring}, lock badge, "${l.label}"`);
  expect(s.open && s.msgs.join('|') === `notice:${UI.locked}` && !s.foot, `S21 panel: only "${UI.locked}", no tip, no input`);
  await p.evaluate(() => window.__l4.go('S21R')); await settle(p);
  const r = await p.evaluate(() => document.querySelector('.w-coach-launcher').dataset.locked);
  const s2 = await panelState(p);
  expect(r === 'false' && s2.foot && s2.msgs.join('|') === `coach:${UI.lines.review}`, `S21R unlocked: "${UI.lines.review}" and the tip chip back`);
  await p.close();
}

/* ---- 4. suspend_data with the dock set, and resume ---- */
console.log('\n4. suspend_data and resume');
{
  const p = await open('?screen=S04', { lms: {} });
  await p.click('.w-coach-launcher'); await settle(p);
  await p.focus('.w-coach-grip'); await p.keyboard.press('ArrowRight');
  await p.evaluate(() => window.__l4.next()); // the lesson's own save carries the dock
  const sd = await p.evaluate(() => window.__scormMock.report().data['cmi.suspend_data']);
  // a heavy state: every screen done, every interaction answered, every stored field at its max length
  const heavy = await p.evaluate(async () => {
    const { encode } = await import(document.querySelector('script[type="module"]').src.replace(/main\.js.*/, 'state.js'));
    const l = window.__l4, st = structuredClone(l.state);
    st.d = [...l.slice];
    for (const s of l.content.screens) {
      for (const t of [...(s.tracking || []), ...(s.stops || []).map((x) => x.tracking).filter(Boolean)]) st.a[t.id] = (t.type === 'fill-in' ? '' : 'a,b') + '|c';
      for (const f of s.fields || []) if (f.store) st.f[f.store] = 'x'.repeat(f.maxLength || 120);
    }
    st.k = { n: 3, s: 100, p: 1 }; st.fin = 'passed'; st.h = 'tvsyidloa';
    const without = structuredClone(st); delete without.g.cd;
    try { return { withCd: encode({ ...st, g: { ...st.g, cd: 'r' } }).length, without: encode(without).length }; } catch (e) { return { error: e.message }; }
  });
  expect(sd.includes('"cd":"r"') && sd.length < 4096, `suspend_data after the dock switch: ${sd.length} chars, holds "cd":"r"`);
  expect(!heavy.error && heavy.withCd < 4096 && heavy.withCd - heavy.without <= 15, // ,"g":{"cd":"r"} at most
    heavy.error ? `heavy state: ${heavy.error}` : `heavy state: ${heavy.withCd} chars with cd, ${heavy.without} without (+${heavy.withCd - heavy.without}), under 4096`);
  await p.close();
  const q = await open('', { lms: { 'cmi.core.entry': 'resume', 'cmi.suspend_data': sd } });
  const resumeBtn = await q.$('.w-dialog [data-action="resume"]');
  if (resumeBtn) await resumeBtn.click();
  await q.click('.w-coach-launcher'); await settle(q);
  expect((await panelState(q)).dock === 'r', 'relaunch with entry=resume: the coach opens on the right dock');
  await q.close();
}

/* ---- 5. nothing typed is kept; review mode writes nothing ---- */
console.log('\n5. nothing kept');
{
  const p = await open('?reset=1&screen=S02');
  await p.click('.w-coach-launcher'); await settle(p);
  const i = await p.evaluate(() => { const el = document.querySelector('.w-coach-input'); const shown = (x) => !!x.getClientRects().length;
    return { disabled: el.disabled, input: shown(el), privacy: shown(document.querySelector('.w-coach-privacy')), chip: shown(document.querySelector('.w-coach-chip')) }; });
  expect(i.disabled && !i.input && !i.privacy && i.chip, `offline: no input row and no privacy line shown (the input stays disabled), only the chip`);
  await p.close();
  const r = await open('?review=1&screen=O2');
  await r.click('.w-coach-launcher'); await settle(r);
  await r.focus('.w-coach-grip'); await r.keyboard.press('ArrowRight');
  const st = await r.evaluate(() => ({ cd: window.__l4.state.g.cd, h: window.__l4.state.h, hint: document.querySelector('.w-coach-hint').hidden, ls: Object.keys(localStorage).length }));
  expect(st.cd === undefined && !st.h.includes('a') && st.hint && st.ls === 0, `review mode: no dock, no hint letter, no first-use hint, localStorage empty (${st.ls} keys)`);
  await r.close();
}

/* ---- 6. where it opens: on the left, by the launcher, on every screen until the learner moves it
   (Noy, 26 Oct 2026: left is the more intuitive side); a right dock stays on later screens ---- */
console.log('\n6. left by default');
{
  const notLeft = [];
  for (const id of C.lesson.slice) {
    const p = await open(`?reset=1&screen=${id}`);
    await p.keyboard.press('Shift'); // any key stops a ghost hand
    await p.click('.w-coach-launcher'); await settle(p);
    const r = await p.evaluate(() => ({ dock: document.querySelector('.w-coach-panel').dataset.dock, cd: window.__l4.state.g.cd }));
    if (r.dock !== 'l' || r.cd !== undefined) notLeft.push(`${id} ${r.dock}`);
    await p.close();
  }
  expect(!notLeft.length, `no side picked: all ${C.lesson.slice.length} screens open the coach on the left${notLeft.length ? ' (not: ' + notLeft.join(', ') + ')' : ''}`);
  const p = await open('?reset=1&screen=S04');
  await p.click('.w-coach-launcher'); await settle(p);
  await p.focus('.w-coach-grip'); await p.keyboard.press('ArrowRight');
  const picked = [];
  for (const id of ['S05a', 'S05b', 'S09', 'K4']) { await p.evaluate((x) => window.__l4.go(x), id); await settle(p); picked.push(await p.evaluate(() => document.querySelector('.w-coach-panel').dataset.dock)); }
  expect(picked.every((d) => d === 'r'), `the learner's right dock stays on S05a, S05b, S09, K4 (${picked.join(', ')})`);
  await p.close();
}
/* ---- 7. the demo on the goals screen: once, short, any key ends it ---- */
console.log('\n7. demo');
{
  const openMotion = async (q) => { const p = await open(q); await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]); await p.reload({ waitUntil: 'networkidle0' }); await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded'); return p; };
  const look = (p) => p.evaluate(() => ({ open: !document.querySelector('.w-coach-panel').hidden, hint: !document.querySelector('.w-coach-hint').hidden,
    msgs: [...document.querySelectorAll('.w-coach-panel .w-coach-msg')].map((m) => m.textContent.trim()).join('|'), h: window.__l4.state.h }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const demoOn = UI.demoOn;
  let p = await openMotion(`?reset=1&screen=${demoOn}`);
  const t0 = await look(p);
  await wait(2400);
  const t1 = await look(p);
  await wait(3000);
  const t2 = await look(p);
  expect(!t0.open && t1.open && t1.msgs === UI.demo && !t2.open && t2.hint && t2.h.includes('a'), `${demoOn}: the coach opens by itself with "${UI.demo}", closes, then "${UI.hint}" stays (h ${t2.h})`);
  await p.evaluate((x) => { window.__l4.go('S01'); window.__l4.go(x); }, demoOn);
  await wait(2600);
  expect(!(await look(p)).open, `${demoOn} again: no second demo`);
  await p.close();
  p = await openMotion(`?reset=1&screen=${demoOn}`);
  await wait(2400);
  await p.keyboard.press('Tab');
  const k = await look(p);
  expect(!k.open && k.hint, 'a key during the demo ends it at once; the hint stays');
  expect(!p.errors.length, 'demo: no console errors' + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
  await p.close();
  p = await open(`?reset=1&screen=${demoOn}`); // reduced motion
  await wait(2600);
  const rm = await look(p);
  expect(!rm.open && rm.hint, 'reduced motion: no demo, only the hint');
  await p.close();
  // QA2: a learner who opened the coach on an earlier screen gets no demo; a panel they left open stays theirs
  p = await openMotion('?reset=1&screen=O2');
  await p.click('.w-coach-launcher'); await settle(p);
  const line = (await look(p)).msgs;
  await p.evaluate((x) => window.__l4.go(x), demoOn);
  await wait(2400);
  const f1 = await look(p);
  await wait(3000);
  const f2 = await look(p);
  expect(f1.open && f2.open && f1.msgs !== UI.demo && f2.msgs !== UI.demo && !f2.hint && f2.h.includes('a') && line,
    `coach opened on O2: no demo on ${demoOn}, the panel stays open with the screen's own line, no hint (h ${f2.h})`);
  await p.close();
}
await browser.close();
server.close();
console.log(fails.length ? `\ntest:coach FAILED (${fails.length})` : '\ntest:coach passed');
process.exit(fails.length ? 1 : 0);
