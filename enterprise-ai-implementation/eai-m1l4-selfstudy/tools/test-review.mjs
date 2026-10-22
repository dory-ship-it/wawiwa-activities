// Review mode (?review=1) and the review page (review.html). Usage: npm run test:review
//  1. a normal run writes its state; then ?review=1 walks every screen with Next (never locked),
//     answers and opens things on the way, and Previous walks back; localStorage is byte-for-byte the
//     same afterwards, and with a mock SCORM 1.2 API present review mode makes no SCORM call at all
//  2. the toolbar on every screen: id, template, chapter, word count = src/review/words.js; red over 45
//  3. ?screen=ID&review=1 opens any screen, also one outside the slice route
//  4. review.html: one card per screen in review order, every thumbnail renders its own screen,
//     the "Over word limit" filter shows exactly the screens over the rule
//  5. the SCORM package holds no review file
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';
import { screenWords } from '../src/review/words.js';

const C = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const S = Object.fromEntries(C.screens.map((s) => [s.id, s]));
const MOCK = readFileSync(join(ROOT, 'tools', 'scorm-mock.js'), 'utf8');
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// the review order, as the engine builds it
const listed = C.chapters.flatMap((c) => c.screens).filter((id) => S[id]);
const ORDER = [...new Set([...listed, ...C.screens.map((s) => s.id)])];

const server = await startServer(0);
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });

async function open(path, { size = [1280, 720], lms = null } = {}) {
  const p = await browser.newPage();
  if (lms) await p.evaluateOnNewDocument(`${MOCK}\n;window.installScormMock(${JSON.stringify(lms)});`);
  p.errors = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') p.errors.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => p.errors.push('pageerror: ' + e.message));
  await p.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(ORIGIN + path, { waitUntil: 'networkidle0' });
  return p;
}
const storage = (p) => p.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort())));
const bar = (p) => p.evaluate(() => {
  const b = document.querySelector('.rv-bar');
  return b && { screen: b.dataset.screen, id: b.querySelector('.rv-id').textContent, tpl: b.querySelector('.rv-tpl').textContent, chap: b.querySelector('.rv-chap').textContent,
    words: b.querySelector('.rv-words').textContent, over: b.querySelector('.rv-words').dataset.over, red: getComputedStyle(b.querySelector('.rv-words')).backgroundColor,
    href: b.querySelector('.rv-overview').getAttribute('href'), current: window.__l4.current, locked: document.querySelector('.w-next').dataset.locked };
});

/* ---------- 1 and 2: a real run's state, then review mode walks everything and leaves it alone ---------- */
console.log('\nreview mode: walk, toolbar, no writes');
{
  const p = await open('/index.html?reset=1&screen=S01');
  await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await p.click('.w-opt[data-id="b"]'); // a real answer: the normal run writes its state
  await wait(200);
  const before = await storage(p);
  expect(before.includes('wawiwa.eai.l4.slice') && before.includes('L4_S01_1'), 'normal run: the state with the S01 answer is in localStorage');

  await p.goto(ORIGIN + '/index.html?review=1', { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => window.__l4 && document.querySelector('.rv-bar') && document.fonts.status === 'loaded');
  const first = await bar(p);
  expect(first.current === ORDER[0] && !(await p.$('.w-dialog')), `?review=1 opens on ${first.current}, no resume prompt`);
  let walked = [], toolbarFails = [], locked = [];
  for (let i = 0; i < ORDER.length; i++) {
    const b = await bar(p);
    walked.push(b.current);
    const w = screenWords(S[b.current], C);
    const ch = C.chapters.find((c) => c.id === S[b.current].chapter);
    const want = { id: b.current, tpl: S[b.current].template + (S[b.current].variant ? ' / ' + S[b.current].variant : ''), chap: `Ch ${ch.n} · ${ch.title}`, over: String(w.over) };
    if (b.id !== want.id || b.tpl !== want.tpl || b.chap !== want.chap || !b.words.startsWith(w.max + ' words') || b.over !== want.over || b.href !== 'review.html#' + b.current
      || (w.over && b.red !== 'rgb(204, 0, 0)')) toolbarFails.push(`${b.current}: ${JSON.stringify(b)}`);
    if (b.locked !== 'false') locked.push(b.current);
    // touch the screen: the first option or card, if there is one (answers stay in memory only)
    await p.evaluate(() => { const o = document.querySelector('.w-main .w-opt, .w-main .w-guess, .w-main .w-map-tab'); if (o) o.click(); });
    // Next in the footer (O1 has no footer by design: its "Start the lesson" is its Next)
    if (i < ORDER.length - 1) { await p.click((await p.$('[data-action="start"]')) ? '[data-action="start"]' : '.w-next'); await wait(60); }
  }
  expect(walked.join() === ORDER.join(), `Next walks all ${ORDER.length} screens in chapter order (${walked.join(' ')})`);
  expect(!locked.length, 'Next never locked in review mode' + (locked.length ? ': locked on ' + locked.join(', ') : ''));
  expect(!toolbarFails.length, 'toolbar on every screen: id, template, chapter, word count from src/review/words.js, red over 45, Overview link' + (toolbarFails.length ? '\n         ' + toolbarFails.join('\n         ') : ''));
  const back = [];
  for (let i = 0; i < 4; i++) { await p.click('.w-prev'); await wait(60); back.push(await p.evaluate(() => window.__l4.current)); }
  expect(back.join() === ORDER.slice(-5, -1).reverse().join(), `Previous walks back in order (${back.join(' ')})`);
  // the menu's Start over in review mode clears memory only
  await p.evaluate(() => window.__l4.startOver());
  const after = await storage(p);
  expect(after === before, `localStorage unchanged after the review walk (${before.length} chars before and after)`);
  expect(!p.errors.length, 'review walk: no console errors' + (p.errors.length ? ': ' + p.errors.slice(0, 5).join(' | ') : ''));
  await p.close();
}

/* ---------- no SCORM calls with an LMS present ---------- */
{
  const p = await open('/index.html?review=1&screen=S01', { lms: {} });
  await p.waitForFunction(() => window.__l4 && document.querySelector('.rv-bar'));
  await p.click('.w-opt[data-id="b"]');
  await p.click('.w-next');
  await wait(200);
  const r = await p.evaluate(() => ({ mode: window.__l4.tracking.mode, report: window.__scormMock.report(), events: window.__l4.tracking.events.length }));
  expect(r.mode === 'off' && r.report.calls.length === 0 && !r.report.initialized && r.events > 0,
    `with a SCORM 1.2 API present, review mode makes ${r.report.calls.length} SCORM calls (events still on the bus: ${r.events})`);
  await p.close();
}

/* ---------- 3: any screen by id ---------- */
{
  const outside = ORDER.filter((id) => !C.lesson.slice.includes(id));
  const ids = ['S04', 'S13', 'S22', ...outside]; // NL3: S13 (the flags) in place of the gone FT3
  const got = [];
  for (const id of ids) {
    const p = await open(`/index.html?screen=${id}&review=1`);
    await p.waitForFunction(() => window.__l4 && document.querySelector('.rv-bar'));
    got.push((await bar(p)).current);
    await p.close();
  }
  expect(got.join() === ids.join(), `?screen=ID&review=1 opens ${ids.join(', ')}` + (outside.length ? '' : ' (every screen is in the slice today)'));
}

/* ---------- 4: review.html ---------- */
console.log('\nreview.html');
{
  const p = await open('/review.html', { size: [1600, 900] });
  await p.waitForSelector('.rv-card');
  const cards = await p.evaluate(() => [...document.querySelectorAll('.rv-card')].map((a) => ({ id: a.id, href: a.getAttribute('href'), target: a.target,
    words: a.querySelector('.rv-meta-words').textContent, over: a.dataset.over })));
  expect(cards.map((c) => c.id).join() === ORDER.join() && cards.every((c) => c.href === `index.html?screen=${c.id}&review=1` && c.target === '_blank'),
    `${cards.length} cards in review order, each opens index.html?screen=ID&review=1 in a new tab`);
  const wrong = cards.filter((c) => { const w = screenWords(S[c.id], C); return !c.words.startsWith(w.max + ' w') || c.over !== String(w.over || w.longFeedback > 0); });
  expect(!wrong.length, 'word counts under the thumbnails match src/review/words.js' + (wrong.length ? ': ' + wrong.map((c) => c.id).join(', ') : ''));
  const loadedEarly = await p.evaluate(() => document.querySelectorAll('.rv-frame iframe[src]').length);
  expect(loadedEarly < cards.length, `thumbnails load lazily (${loadedEarly} of ${cards.length} on arrival)`);
  // scroll through the page, then every thumbnail must show its own screen
  for (let y = 0; y < 12; y++) { await p.evaluate(() => window.scrollBy(0, 700)); await wait(250); }
  await p.waitForFunction((n) => document.querySelectorAll('.rv-frame[data-state="loaded"]').length === n, { timeout: 60000 }, cards.length).catch(() => {});
  const frames = await p.evaluate(() => [...document.querySelectorAll('.rv-card')].map((a) => {
    const f = a.querySelector('iframe');
    let cur = null, err = null, bar = null, main = 0;
    try { const w = f.contentWindow; cur = w.__l4?.current; err = !w.document.getElementById('boot-error')?.hidden; bar = !!w.document.querySelector('.rv-bar'); main = w.document.querySelector('.w-main')?.children.length || 0; } catch (e) { err = e.message; }
    return { id: a.id, cur, err, bar, main, scale: getComputedStyle(f).transform };
  }));
  const bad = frames.filter((f) => f.cur !== f.id || f.err || f.bar || !f.main);
  expect(!bad.length, `every thumbnail renders its own screen (${frames.length - bad.length} of ${frames.length}), no boot error, no toolbar inside` + (bad.length ? ': ' + JSON.stringify(bad.slice(0, 3)) : ''));
  expect(frames.every((f) => f.scale === 'matrix(0.25, 0, 0, 0.25, 0, 0)'), 'thumbnails are the 1280 x 720 stage at 25%');
  // filters
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.click('.rv-filter[data-kind="over"]');
  const overShown = await p.evaluate(() => [...document.querySelectorAll('.rv-card')].filter((a) => !a.hidden).map((a) => a.id));
  const overWant = ORDER.filter((id) => { const w = screenWords(S[id], C); return w.over || w.longFeedback > 0; });
  expect(overShown.join() === overWant.join(), `"Over word limit" shows ${overShown.join(', ') || 'none'} (expected ${overWant.join(', ') || 'none'})`);
  await p.click('.rv-filter[data-kind="ch1"]');
  const ch1 = await p.evaluate(() => [...document.querySelectorAll('.rv-card')].filter((a) => !a.hidden).map((a) => a.id));
  expect(ch1.join() === C.chapters.find((c) => c.id === 'ch1').screens.join(), `chapter filter "ch1" shows ${ch1.join(', ')}`);
  expect(!p.errors.length, 'review.html: no console errors' + (p.errors.length ? ': ' + p.errors.slice(0, 5).join(' | ') : ''));
  await p.close();
}

/* ---------- 5: the SCORM package has no review file ---------- */
console.log('\npackage');
{
  execFileSync(process.execPath, [join(ROOT, 'tools', 'package-scorm.mjs')], { cwd: ROOT, stdio: 'pipe' });
  const zip = readFileSync(join(ROOT, 'dist', 'eai-m1l4-selfstudy-scorm12.zip'));
  // the first entry is imsmanifest.xml (local header: method at 8, sizes at 18, name and extra lengths at 26, 28)
  const nameLen = zip.readUInt16LE(26), extraLen = zip.readUInt16LE(28), size = zip.readUInt32LE(18), method = zip.readUInt16LE(8);
  const body = zip.subarray(30 + nameLen + extraLen, 30 + nameLen + extraLen + size);
  const manifest = (method === 8 ? inflateRawSync(body) : body).toString('utf8');
  const names = [...manifest.matchAll(/<file href="([^"]+)"\/>/g)].map((m) => m[1]);
  const zipNames = zip.toString('latin1'); // entry names are stored as plain text in the headers
  expect(names.length > 0 && !names.some((n) => n === 'review.html' || n.startsWith('src/review/')) && !zipNames.includes('src/review/') && !zipNames.includes('review.html'),
    `SCORM package: ${names.length} files in imsmanifest.xml, none from review.html or src/review/, and none in the zip`);
}

await browser.close();
server.close();
console.log(fails.length ? `\ntest:review FAILED (${fails.length})` : '\ntest:review passed');
process.exit(fails.length ? 1 : 0);
