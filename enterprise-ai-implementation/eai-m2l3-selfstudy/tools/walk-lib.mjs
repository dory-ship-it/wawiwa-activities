// Kit tool: the helpers of a keyboard-only walk (Puppeteer drives Tab, Shift+Tab, arrows, Enter, Space, Escape and
// digits only; the films are sped up for the test, nothing else). A lesson's own walk (tests/walk.mjs, run by
// npm run walk / npm run test:scorm through tools/walk.mjs) imports these and walks its own path: on every
// screen focus lands on the instruction heading, Next is locked with its reason as its aria-label before the task
// is done and unlocked after (presentation screens: never locked), the feedback card equals the content, and the
// layout checks of tools/lib.mjs pass.
// --scorm: the same path against the mock SCORM 1.2 API (tools/scorm-mock.js).
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, measureLayout, layoutVerdict } from './lib.mjs';
import { KIT, readContent, configureSrc } from './kit.mjs';
export { ROOT, KIT, configureSrc };

export const SCORM = process.argv.includes('--scorm');
export const MOCK = readFileSync(join(ROOT, 'tools', 'scorm-mock.js'), 'utf8');
export const C = readContent();
export const UI = C.ui;
export const S = Object.fromEntries(C.screens.map((s) => [s.id, s]));
export const fails = [];
export const ok = (m) => console.log('  ok   ' + m);
export const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
export const expect = (cond, m) => (cond ? ok(m) : fail(m));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const server = await startServer(0);
export const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
export const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars', '--mute-audio'] });

export async function open(query, { lms = null } = {}) {
  const page = await browser.newPage();
  if (lms) await page.evaluateOnNewDocument(`${MOCK}\n;window.installScormMock(${JSON.stringify(lms)});`);
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); // every assertion sees the settled state
  await page.goto(BASE + query, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  return page;
}

/* ---------- keyboard helpers ---------- */
export const press = async (p, key, n = 1) => { for (let i = 0; i < n; i++) await p.keyboard.press(key); };
export const shiftTab = async (p) => { await p.keyboard.down('Shift'); await p.keyboard.press('Tab'); await p.keyboard.up('Shift'); };
export const isActive = (p, sel) => p.evaluate((s) => !!document.activeElement && document.activeElement.matches(s), sel);
// Tab (or Shift+Tab) until the focused element matches sel
export async function tabTo(p, sel, { back = false, max = 60 } = {}) {
  for (let i = 0; i < max; i++) {
    if (await isActive(p, sel)) return true;
    if (back) await shiftTab(p); else await press(p, 'Tab');
  }
  const hit = await isActive(p, sel);
  if (!hit) fail(`keyboard could not reach ${sel}`);
  return hit;
}
export const act = async (p, sel, key = 'Enter', opts) => { if (await tabTo(p, sel, opts)) await press(p, key); };
export const text = (p, sel) => p.evaluate((s) => document.querySelector(s)?.textContent.trim() ?? null, sel);
export const nextState = (p) => p.evaluate(() => { const n = document.querySelector('.w-next'); return { locked: n.dataset.locked === 'true', aria: n.getAttribute('aria-disabled'), label: n.getAttribute('aria-label'), focused: document.activeElement === n }; });
export const events = (p) => p.evaluate(() => window.__l4.tracking.events);
// the feedback card: the content's own message is kept in data-text and data-verdict
export const band = (p) => p.evaluate(() => {
  const r = document.querySelector('.w-band'), s = r.querySelector('.w-strip');
  const on = r.dataset.strip === 'on';
  return { state: r.dataset.state, on, verdict: on ? (s.dataset.verdict || '') : '', text: on ? (s.dataset.text || '').trim() : '', live: r.querySelector('.w-band-live')?.getAttribute('aria-live') };
});
export async function expectBand(p, what, { state, text: want, verdict = '' }) {
  const b = await band(p);
  expect(b.on && b.state === state && b.verdict === verdict && b.text === want && b.live === 'polite',
    `${what}: feedback card ${b.state}${b.verdict ? ' "' + b.verdict + '"' : ''} "${b.text}"` + (b.text !== want ? ` (want "${want}")` : ''));
}
export async function expectLayout(p, what) {
  await p.mouse.move(0, 0);
  const [good, detail] = layoutVerdict(await p.evaluate(measureLayout));
  expect(good, `${what}: layout ${good ? 'fits' : detail}`);
  // no code value printed as text (an empty child rendered as the word "null")
  const stray = await p.evaluate(() => (document.querySelector('.w-main').innerText.match(/\b(null|undefined|NaN|\[object Object\])\b/g) || []).join(', '));
  if (stray) fail(`${what}: "${stray}" printed on screen`);
}
// a new screen: the right id, focus on its h1, Next locked with its reason (or open: a presentation screen)
export async function arrive(p, id) {
  await p.waitForFunction((x) => window.__l4.current === x, { timeout: 5000 }, id).catch(() => {});
  const r = await p.evaluate(() => ({ id: window.__l4.current, focus: document.activeElement?.id, text: document.activeElement?.textContent }));
  const n = await nextState(p);
  const s = S[id];
  const L = UI.footer.locked;
  const why = L[s.locked] || L[s.variant] || L[s.template] || L.default;
  const nextOk = s.template === 'title' ? true : s.presentation ? !n.locked && n.aria === null : n.locked && n.aria === 'true' && n.label === why;
  expect(r.id === id && r.focus === 'w-instruction' && r.text === s.instruction && nextOk,
    `${id}: focus on the heading "${r.text}", Next ${s.presentation ? 'open (presentation)' : `locked "${n.label}"`}` + (r.id !== id ? ` (on ${r.id})` : '') + (!nextOk ? ' (Next state wrong)' : ''));
  await press(p, 'Shift'); // any key stops a ghost hand; Shift does nothing else
  await expectLayout(p, id);
}
export async function expectOpen(p, what, { focused = null } = {}) {
  const n = await nextState(p);
  expect(!n.locked && n.aria === null && n.label === null && (focused === null || n.focused === focused), `${what}: Next unlocked${focused ? ' and focused' : ''}`);
}
export const goNext = async (p) => { await act(p, '.w-next'); };

// Press a key on a focused new-tab link: returns the URL the new tab opened at, closes the tab and brings
// the lesson back to the front (the lesson itself must not move).
export async function newTabFrom(p, key = 'Enter') {
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
// a workbook stop: the link opens the live workbook in a new tab, the lesson stays, Next opens
export async function workbookStop(p, id) {
  await arrive(p, id);
  const img = await p.evaluate(() => { const i = document.querySelector('.d-wb-img'); return { src: i?.getAttribute('src'), alt: i?.alt, w: i?.naturalWidth }; });
  await tabTo(p, '[data-action="open"]');
  const a = await p.evaluate(() => { const l = document.activeElement; return { target: l.target, rel: l.rel, href: l.href, name: l.textContent.trim() }; });
  const url = await newTabFrom(p);
  const here = await p.evaluate(() => window.__l4.current);
  expect(url.startsWith(C.links.workbook) && a.href === C.links.workbook && a.target === '_blank' && /noopener/.test(a.rel) && a.name.includes(UI.newTabNote) && here === id,
    `${id}: "${UI.buttons.openWorkbook}" opened ${url || '(no tab)'} in a new tab (rel ${a.rel}, says "${UI.newTabNote}"), the lesson stayed on ${here}`);
  expect(img.src === S[id].image.src && img.alt === S[id].image.alt && img.w > 0, `${id}: the workbook picture ${img.src} (alt "${img.alt}")`);
  await expectBand(p, `${id} opened`, { state: 'notice', text: S[id].openFeedback });
  await expectOpen(p, id);
  if (S[id].presentation) {
    const small = await p.evaluate(() => ({ cls: document.querySelector('[data-action="open"]').className, again: document.querySelector('.d-wb-again span')?.textContent, line: document.querySelector('.d-wb-line').textContent }));
    expect(/d-wb-open-s/.test(small.cls) && small.again === S[id].again && small.line === S[id].line, `${id}: sends the learner back to the open tab ("${small.line.slice(0, 34)}..."); "${small.again}" with the small link`);
  }
  await expectLayout(p, `${id} opened`);
  await goNext(p);
}
// tests only: play the film muted and fast to the next stop or the end
export async function fast(p, done, what) {
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  let last = -1;
  for (let i = 0; i < 90; i++) {
    if (await p.evaluate(done)) return true;
    last = await p.evaluate((prev) => {
      const v = document.querySelector('.w-video');
      if (document.querySelector('.w-stop-view').hidden && !v.ended && (v.paused || Math.abs(v.currentTime - prev) < 0.01)) { v.pause(); v.currentTime = v.currentTime; v.muted = true; v.playbackRate = 4; v.play().catch(() => {}); }
      return v.currentTime;
    }, last);
    await wait(500);
  }
  fail(`${what} not reached`);
  return false;
}

// the end of a run: close everything, print the verdict, exit 1 on any failure
export async function finishRun(name) {
  await browser.close();
  server.close();
  console.log(fails.length ? `\n${name} FAILED (${fails.length})` : `\n${name} passed`);
  process.exit(fails.length ? 1 : 0);
}
