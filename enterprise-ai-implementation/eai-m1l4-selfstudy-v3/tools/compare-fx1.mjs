// FX1: the new top bar beside the Kit 13 reference (planning/design-reference/hybrid-cinematic/
// theme-kit13-topbar.html): the kit's W1 frame (Stage) and K1 frame (Focus), each drawn 1280 wide,
// against the built W1 and K1 at 1280x720. Each pair: the reference's bar strip above the built one.
// Output: review/fx1/compare/<name>-pair.png
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const dir = join(ROOT, 'review', 'fx1', 'compare');
mkdirSync(dir, { recursive: true });
const BAR_H = 130; // the bar (97.28) and a strip of what is under it

// the kit's frames: [index of the .scr in the kit page, the built screen, name]
const PAIRS = [[2, 'W1', 'stage-W1'], [1, 'K1', 'focus-K1']];

async function refShot(i) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + 'planning/design-reference/hybrid-cinematic/theme-kit13-topbar.html', { waitUntil: 'networkidle0' });
  const clip = await page.evaluate((i) => {
    document.querySelectorAll('[hidden]').forEach((e) => e.removeAttribute('hidden'));
    const scr = document.querySelectorAll('.scr')[i];
    const fig = scr.closest('.frame');
    Object.assign(fig.style, { width: '1280px', maxWidth: 'none' });
    Object.assign(scr.style, { width: '1280px', maxWidth: 'none' });
    scr.scrollIntoView();
    const r = scr.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: 1280, height: 130 }; // page coordinates
  }, i);
  await new Promise((r) => setTimeout(r, 300));
  const buf = await page.screenshot({ clip: { ...clip, height: BAR_H } });
  await page.close();
  return buf;
}
async function builtShot(id) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE}index.html?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await page.keyboard.press('Shift');
  await page.mouse.move(2, 300);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: BAR_H } });
  await page.close();
  return buf;
}
for (const [i, id, name] of PAIRS) {
  const [ref, built] = [await refShot(i), await builtShot(id)];
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: BAR_H * 2 + 56, deviceScaleFactor: 1 });
  const img = (b) => 'data:image/png;base64,' + b.toString('base64');
  await page.setContent(`<body style="margin:0;font:600 14px Arial;background:#222;color:#fff">
    <div style="height:28px;line-height:28px;padding:0 8px">reference: theme-kit13-topbar.html (${name.split('-')[0]})</div><img src="${img(ref)}" style="display:block">
    <div style="height:28px;line-height:28px;padding:0 8px">built: ${id} at 1280x720</div><img src="${img(built)}" style="display:block"></body>`);
  await page.screenshot({ path: join(dir, `${name}-pair.png`) });
  console.log('  ' + name + '-pair.png');
  await page.close();
}
await browser.close();
server.close();
