// FX8 self-check: every screen beside its design (Noy's "L4 Screens Intro to Ch2" frames for Intro to
// Chapter 3, planning/fx8-board for Chapters 4 to 7), design left, build right, in pages of 4 rows.
// The design frames are rendered PNGs (one folder per board, files 01.png ...); the build shots come from
// tools/shots-fx7-screens.mjs (review/fx7/1280x720).
// Usage: node tools/compare-fx8.mjs <intro-ch2 frames dir> <fx8 board frames dir>  -> review/fx8/compare-<n>.png
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { ROOT } from './serve.mjs';

const [introDir, boardDir] = process.argv.slice(2);
const A = { O1: 1, O2: 2, O3: 5, S01: 6, S02: 9, W1: 13, V1: 15, K1: 20, S03: 21, W2: 24, K2: 25, S04: 27, S05a: 30, S05b: 31, S06: 34, S07: 37, S08: 41, S08B: 44 };
const B = { W3: 1, V2: 2, S09: 3, S10: 5, S11: 7, S12: 8, S12B: 10, W4: 12, S13: 13, S14: 15, S15: 16, K4: 17, S16: 18, S17: 19, S17B: 20, S18A: 21, S18: 22, S18B: 23, S19A: 24, S19B: 25, S19C: 26, S20: 27, S20B: 28, S21: 29, S21R: 30, S22: 31, END: 32 };
const content = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const order = content.chapters.flatMap((c) => c.screens);
const shots = join(ROOT, 'review', 'fx7', '1280x720');
const out = join(ROOT, 'review', 'fx8');
mkdirSync(out, { recursive: true });
const b64 = (p) => (existsSync(p) ? 'data:image/png;base64,' + readFileSync(p).toString('base64') : '');
const rows = order.map((id) => {
  const d = A[id] ? join(introDir, String(A[id]).padStart(2, '0') + '.png') : B[id] ? join(boardDir, String(B[id]).padStart(2, '0') + '.png') : null;
  return { id, design: d ? b64(d) : '', build: b64(join(shots, id + '.png')) };
});
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1340, height: 100 });
const per = 4;
for (let p = 0; p * per < rows.length; p++) {
  const part = rows.slice(p * per, (p + 1) * per);
  const html = part.map((r) => `<section><h2>${r.id}</h2><div>${r.design ? `<img src="${r.design}">` : '<p>no design frame</p>'}${r.build ? `<img src="${r.build}">` : '<p>no shot</p>'}</div></section>`).join('');
  await page.setContent(`<style>body{margin:0;background:#222;font:16px Arial;color:#fff}section{padding:8px 10px}h2{margin:0 0 4px;font-size:16px}div{display:grid;grid-template-columns:1fr 1fr;gap:10px}img{width:100%;display:block}p{margin:0;padding:40px;background:#333}</style>${html}`);
  await page.screenshot({ path: join(out, `compare-${p + 1}.png`), fullPage: true });
}
await browser.close();
console.log(`${Math.ceil(rows.length / per)} compare sheets in ${out}`);
