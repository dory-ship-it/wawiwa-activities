// A contact sheet of a folder of PNG shots (review), in pages of rows x 3 thumbnails with their names.
// Usage: node tools/contact-sheet.mjs <folder> [rows=5]  -> <folder>/_sheet-<n>.png
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromePath } from './lib.mjs';

const dir = resolve(process.argv[2]);
const rows = Number(process.argv[3] || 5);
const files = readdirSync(dir).filter((f) => f.endsWith('.png') && !f.startsWith('_'));
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 100 });
const per = rows * 3;
for (let p = 0; p * per < files.length; p++) {
  const part = files.slice(p * per, (p + 1) * per);
  const cells = part.map((f) => `<figure><img src="data:image/png;base64,${readFileSync(join(dir, f)).toString('base64')}"><figcaption>${f}</figcaption></figure>`).join('');
  await page.setContent(`<style>body{margin:0;background:#222;font:14px Arial;color:#fff}main{display:grid;grid-template-columns:repeat(3,490px);gap:10px;padding:10px}figure{margin:0}img{width:490px;display:block}figcaption{padding:3px 0}</style><main>${cells}</main>`);
  await page.screenshot({ path: join(dir, `_sheet-${p + 1}.png`), fullPage: true });
}
await browser.close();
console.log(`${Math.ceil(files.length / per)} sheets in ${dir}`);
