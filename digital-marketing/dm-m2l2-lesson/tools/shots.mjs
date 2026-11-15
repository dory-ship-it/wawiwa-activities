// Review screenshots: every screen state of tools/states.mjs at 1280 x 720 (the lesson as a learner
// sees it: locked Next, the hand stopped, no motion).
// Usage: node tools/shots.mjs [--out=planning/shots-p1] [--arrival] [S05 K1 ...]
//   --arrival  only the first state of each screen
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';
import { STATES, sleep } from './states.mjs';

const args = process.argv.slice(2);
const out = join(ROOT, (args.find((a) => a.startsWith('--out=')) || '--out=planning/shots-p1').slice(6));
const only = args.filter((a) => !a.startsWith('--'));
const arrival = args.includes('--arrival');
mkdirSync(out, { recursive: true });
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const seen = new Set();
let n = 0;
const errors = [];
for (const [id, state, act] of STATES) {
  if (only.length && !only.includes(id)) continue;
  if (arrival && seen.has(id)) continue;
  seen.add(id);
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${id} ${state}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${id} ${state}: ${m.text()}`); });
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${base}?reset=1&screen=${id}`, { waitUntil: id.startsWith('V') ? 'load' : 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  try { await act(page); } catch (e) { errors.push(`${id} ${state}: ${e.message}`); }
  await page.mouse.move(640, 5);
  await sleep(450);
  const k = String(++n).padStart(2, '0');
  await page.screenshot({ path: join(out, `${k}-${id}-${state.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`) });
  await ctx.close();
}
await browser.close();
server.close();
console.log(`${n} screenshots in ${out}`);
if (errors.length) { console.log('errors:\n  ' + errors.join('\n  ')); process.exit(1); }
