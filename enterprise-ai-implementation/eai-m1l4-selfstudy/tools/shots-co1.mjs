// CO1 screenshots: the Wawiwa AI Coach, main state only. Output: review/co1/screens/<NN>-<name>[-WxH].png.
// Usage: node tools/shots-co1.mjs [names] [--size=WxH]
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith('--'));
const opt = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3);
const size = opt('size', '1280x720').split('x').map(Number);
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const openCoach = (p) => p.click('.w-coach-launcher');
const right = async (p) => { await openCoach(p); await p.focus('.w-coach-grip'); await p.keyboard.press('ArrowRight'); await p.focus('.w-coach-panel'); };
// the first-use hint shows on O2 only; on S04 it is shown as it would be there (test only)
const hint = (p) => p.evaluate(() => { const c = window.__l4.coach; c.hint.style.left = c.launcher.offsetLeft + 'px'; c.hint.hidden = false; });
const passed = (p) => p.evaluate(() => { const s = window.__l4.state; Object.assign(s.a, { L4_S21_1: 'c|c', L4_S21_2: 'b|c', L4_S21_3: 'a|c', L4_S21_4: 'd|c', L4_S21_5: '5,6|c' }); s.k = { n: 1, s: 100, p: 1 }; s.d.push('S21'); window.__l4.go('END'); });

const SHOTS = [
  ['s04-closed-hint', 'S04', hint],
  ['s04-open-left', 'S04', openCoach],
  ['s04-open-right', 'S04', right],
  ['s02-open', 'S02', openCoach],
  ['s19-open', 'S19', openCoach],
  ['s21-locked', 'S21', openCoach],
  ['end-open', 'END', async (p) => { await passed(p); await openCoach(p); }],
  ['o2-first-use-hint', 'O2', null],
];
const dir = resolve(ROOT, join('review', 'co1', 'screens'));
mkdirSync(dir, { recursive: true });
let n = 0;
for (const [name, id, act] of SHOTS) {
  n++;
  if (only.length && !only.includes(name)) continue;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await page.keyboard.press('Shift'); // any key stops a ghost hand
  if (act) await act(page);
  await page.mouse.move(2, 300);
  await wait(400);
  const file = `${String(n).padStart(2, '0')}-${name}${size[0] === 1280 ? '' : '-' + size.join('x')}.png`;
  await page.screenshot({ path: join(dir, file) });
  console.log(`  ${file}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await context.close();
}
await browser.close();
server.close();
