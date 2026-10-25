// MD1-W screenshots: the Stage screens with the MD1 chapter photos (main state), plus S04 and S16 for
// the Focus wash. Output: review/md1w/screens/<NN>-<ID>[-WxH].png, or --out=DIR.
// Usage: node tools/shots-md1w.mjs [IDs] [--size=WxH] [--out=DIR]
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
const passed = (p) => p.evaluate(() => { const s = window.__l4.state; Object.assign(s.a, { L4_S21_1: 'c|c', L4_S21_2: 'b|c', L4_S21_3: 'a|c', L4_S21_4: 'd|c', L4_S21_5: '5,6|c' }); s.k = { n: 1, s: 100, p: 1 }; s.d.push('S21'); window.__l4.go('END'); });

const SHOTS = [['O1'], ['S01'], ['W1'], ['W2'], ['W3'], ['W4'], ['S14'], ['S15'], ['S18'], ['S22'], ['END', passed], ['S04'], ['S16']];
const dir = resolve(ROOT, opt('out', join('review', 'md1w', 'screens')));
mkdirSync(dir, { recursive: true });
let n = 0;
for (const [id, act] of SHOTS) {
  n++;
  if (only.length && !only.includes(id)) continue;
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
  await page.keyboard.press('Shift');
  await wait(400);
  const name = `${String(n).padStart(2, '0')}-${id}${size[0] === 1280 ? '' : '-' + size.join('x')}.png`;
  await page.screenshot({ path: join(dir, name) });
  console.log(`  ${name}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await context.close();
}
await browser.close();
server.close();
