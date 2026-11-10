// Screenshots the two V1 concept stills (P2 Part A) into review/p2/concept-1.png and concept-2.png.
// Usage: node video/v1/concepts/shoot.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from '../../../tools/serve.mjs';
import { chromePath } from '../../../tools/lib.mjs';

const OUT = join(ROOT, 'review', 'p2');
mkdirSync(OUT, { recursive: true });
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/video/v1/concepts/concepts.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
let failed = false;
try {
  for (const d of [1, 2]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await page.goto(`${base}?d=${d}`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__ready === true, { timeout: 10000 });
    // text fit: nothing clipped, nothing past the 72 px side margins, logo corner clear
    const r = await page.evaluate(() => {
      const logo = document.querySelector('.logo').getBoundingClientRect();
      const bad = [];
      for (const el of document.querySelectorAll('#stage *:not(svg *)')) {
        if (el.classList.contains('logo') || el.closest('svg')) continue;
        const b = el.getBoundingClientRect();
        if (!b.width || b.width >= 1280) continue; // full-stage layers
        if (b.right > 1208.5 || b.left < 71.5) bad.push('margin: ' + (el.textContent || el.className).trim().slice(0, 30));
        const hitsLogo = b.left < logo.right && b.right > logo.left && b.top < logo.bottom && b.bottom > logo.top;
        if (hitsLogo && b.width < 1280) bad.push('logo corner: ' + (el.textContent || el.className).trim().slice(0, 30));
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible') bad.push('clipped: ' + el.textContent.trim().slice(0, 30));
      }
      return [...new Set(bad)];
    });
    const file = join(OUT, `concept-${d}.png`);
    await page.screenshot({ path: file });
    console.log(`concept-${d}.png ${r.length || errors.length ? 'ISSUES' : 'ok'}`);
    for (const m of [...r, ...errors]) { console.log('  ' + m); failed = true; }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
