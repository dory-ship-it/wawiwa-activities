// PP1 screenshots: the eight adaptive screens on each level, main state only (as the screen opens,
// the ghost hand stopped). Output: review/pp1/screens/<id>-<n>-<level>[-WxH].png (n: 1 support, 2 core,
// 3 stretch, so a folder listing reads in order).
// Usage: node tools/shots-pp1.mjs [S11 ...] [--size=WxH]
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith('--'));
const opt = (k, d) => (argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3);
const size = opt('size', '1280x720').split('x').map(Number);
const ids = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8')).screens.filter((s) => s.variants).map((s) => s.id);
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const dir = resolve(ROOT, join('review', 'pp1', 'screens'));
mkdirSync(dir, { recursive: true });
for (const id of ids.filter((x) => !only.length || only.includes(x))) {
  for (const [n, level] of [[1, 'support'], [2, 'core'], [3, 'stretch']]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`${BASE}index.html?reset=1&debug=1&level=${level}&screen=${id}`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
    await page.keyboard.press('Shift'); // any key stops a ghost hand
    await page.mouse.move(2, 300);
    await wait(400);
    const file = `${id}-${n}-${level}${size[0] === 1280 ? '' : '-' + size.join('x')}.png`;
    await page.screenshot({ path: join(dir, file) });
    console.log(`  ${file}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
    await context.close();
  }
}
await browser.close();
server.close();
