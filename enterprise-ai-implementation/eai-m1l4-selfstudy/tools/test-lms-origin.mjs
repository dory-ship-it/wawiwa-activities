// PK1 A4: the live coach when the lesson runs inside an LMS, i.e. from an origin that is neither
// 127.0.0.1 (the other tests) nor the coach page's (dory-ship-it.github.io). Usage, after npm run package:
//   node tools/test-lms-origin.mjs [--ask]
// The SCORM zip is unpacked to a temp folder, the dev mock (tools/scorm-mock.*) is added next to it, and
// both are served at http://lms.test:<port> (Chrome maps lms.test to 127.0.0.1), so the mock "LMS" and
// the lesson share one origin as in SCORM Cloud or Blossom. The coach page is the REAL one (network).
// Records: the frame loads and says ready from the LMS origin; the page takes the lesson's context;
// --ask: one fixed question, the proxy's answer (and the Origin the proxy sees); S21 hides the frame;
// a blocked coach page falls back to the offline tips; the mock's SCORM log stays clean.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, copyFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { ROOT } from './serve.mjs';
import { chromePath, COACH_URL, COACH_ORIGIN } from './lib.mjs';

const ASK = process.argv.includes('--ask');
const ZIP = join(ROOT, 'dist', 'eai-m1l4-selfstudy-scorm12.zip');
if (!existsSync(ZIP)) { console.error('no package: run npm run package first'); process.exit(1); }
const DIR = join(tmpdir(), 'eai-m1l4-lms-origin');
rmSync(DIR, { recursive: true, force: true });
mkdirSync(join(DIR, 'tools'), { recursive: true });
execFileSync('tar', ['-xf', ZIP, '-C', DIR]);
for (const f of ['scorm-mock.html', 'scorm-mock.js', 'scorm-mock-start.js']) copyFileSync(join(ROOT, 'tools', f), join(DIR, 'tools', f));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8', '.xml': 'application/xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(DIR, p));
  if (!file.startsWith(DIR) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).on('error', () => res.destroy()).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const LMS = `http://lms.test:${server.address().port}`;

const fails = [];
const expect = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const note = (m) => console.log('  note ' + m);
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true,
  args: ['--no-first-run', '--disable-extensions', `--host-resolver-rules=MAP lms.test 127.0.0.1`] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch({ block = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.proxyCalls = [];
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  if (block) {
    await page.setRequestInterception(true);
    page.on('request', (r) => (r.url().startsWith(COACH_ORIGIN + '/') ? r.abort() : r.continue()));
  }
  page.on('response', (r) => { if (/workers\.dev/.test(r.url()) && r.request().method() === 'POST') page.proxyCalls.push({ status: r.status(), origin: r.request().headers().origin || '(none)' }); });
  await page.goto(LMS + '/tools/scorm-mock.html', { waitUntil: 'load' });
  const lesson = await (await page.waitForSelector('iframe')).contentFrame();
  await lesson.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded', { timeout: 20000 });
  return { page, lesson };
}
const coachFrame = (page) => page.frames().find((f) => f.url() === COACH_URL);
const panelState = (lesson) => lesson.evaluate(() => {
  const f = document.querySelector('.w-coach-frame');
  const log = document.querySelector('.w-coach-panel .w-coach-log, .w-coach-panel [class*="log"]');
  return { frame: !!f, frameShown: !!f && !f.hidden, offline: [...document.querySelectorAll('.w-coach-bubble')].map((b) => b.textContent).join(' | ').slice(0, 160), logShown: !!log && !log.hidden };
});

console.log(`\nA4: the lesson at ${LMS} (mock LMS, same origin), the coach page at ${COACH_ORIGIN}`);
{
  const { page, lesson } = await launch();
  expect(await lesson.evaluate(() => window.__l4.tracking.mode === 'scorm12' && location.origin), `lesson runs in scorm12 mode at ${await lesson.evaluate(() => location.origin)}`);
  await lesson.evaluate(() => window.__l4.go('S04'));
  await lesson.click('.w-coach-launcher');
  let st;
  for (let i = 0; i < 20; i++) { await wait(500); st = await panelState(lesson); if (st.frameShown || !st.frame) break; }
  const ready = await lesson.evaluate(() => !!document.querySelector('.w-coach-frame') && !document.querySelector('.w-coach-frame').hidden);
  expect(ready, `S04: coach frame loaded and READY from the LMS origin (${ready ? 'live page shown' : 'fell back: ' + st.offline})`);
  const cf = coachFrame(page);
  if (cf) {
    await wait(800);
    const inside = await cf.evaluate(() => {
      const ta = document.querySelector('textarea, input[type="text"]');
      return { text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200), input: !!ta && !ta.disabled && ta.offsetParent !== null };
    });
    expect(inside.input, `coach page took the lesson's context (an input to ask is shown): "${inside.text.slice(0, 120)}..."`);
    if (ASK && inside.input) {
      await cf.type('textarea, input[type="text"]', 'What should I look for on this screen?');
      await cf.evaluate(() => { const i = document.querySelector('textarea, input[type="text"]'); i.form ? i.form.requestSubmit() : null; });
      for (let i = 0; i < 40 && !page.proxyCalls.length; i++) await wait(500);
      await wait(4000);
      const after = await cf.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
      const pc = page.proxyCalls[0];
      expect(pc && pc.status === 200, `--ask: the proxy answered ${pc ? pc.status : 'nothing'} (Origin sent: ${pc ? pc.origin : '-'})`);
      note('answer excerpt: ' + after.slice(-220));
    } else if (!ASK) note('live answer not asked (run with --ask to send one fixed question to the proxy)');
  }
  await lesson.evaluate(() => window.__l4.go('S21'));
  await wait(300);
  const s21 = await panelState(lesson);
  const lockedText = await lesson.evaluate(() => document.querySelector('.w-coach-panel')?.innerText.replace(/\s+/g, ' ').slice(0, 120));
  expect(s21.frame && !s21.frameShown, `S21: the coach frame is hidden (still mounted); the panel shows: "${lockedText}"`);
  const m = await page.evaluate(() => window.__scormMock.report());
  expect(!m.errors.length && m.statuses.every((s) => s === 'incomplete' || s === 'passed'), `SCORM mock: no errors, statuses ${[...new Set(m.statuses)].join(', ')}`);
  expect(!page.errors.length, 'no page errors' + (page.errors.length ? ': ' + page.errors.join(' | ') : ''));
  await page.close();
}

console.log('\nA4: the coach page blocked (as if the LMS network or a CSP stopped it)');
{
  const { page, lesson } = await launch({ block: true });
  await lesson.evaluate(() => window.__l4.go('S04'));
  await lesson.click('.w-coach-launcher');
  await wait(9500); // READY_MS 8 s, then the fallback
  const st = await panelState(lesson);
  expect(!st.frame && st.offline.length > 0, `blocked: the frame is gone after 8 s and the offline tip shows ("${st.offline.slice(0, 90)}")`);
  await page.close();
}

await browser.close();
server.close();
console.log(fails.length ? `\ntest-lms-origin FAILED (${fails.length})` : '\ntest-lms-origin passed');
process.exit(fails.length ? 1 : 0);
