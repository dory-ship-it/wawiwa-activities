// FX8: a screenshot mid-drag (the card held over a column), to check it stays above the columns.
// Usage: node tools/shot-drag.mjs [S09] [column index]  -> review/fx8/drag-<id>.png
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const id = process.argv[2] || 'S09';
const col = Number(process.argv[3] || 1);
const out = join(ROOT, 'review', 'fx8');
mkdirSync(out, { recursive: true });
const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto(`http://127.0.0.1:${server.address().port}/?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 2500));
const box = (sel, i = 0) => page.evaluate((s, n) => { const r = document.querySelectorAll(s)[n].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel, i);
const a = await box('.w-sdeck .w-card, .w-sdeck button');
const b = await box('.w-drop', col);
await page.mouse.move(a.x, a.y);
await page.mouse.down();
for (let k = 1; k <= 12; k++) { await page.mouse.move(a.x + ((b.x - a.x) * k) / 12, a.y + ((b.y - 30 - a.y) * k) / 12); await new Promise((r) => setTimeout(r, 16)); }
await new Promise((r) => setTimeout(r, 200));
await page.screenshot({ path: join(out, `drag-${id}.png`) });
await page.mouse.up();
await browser.close();
server.close();
console.log('drag shot', join(out, `drag-${id}.png`));
