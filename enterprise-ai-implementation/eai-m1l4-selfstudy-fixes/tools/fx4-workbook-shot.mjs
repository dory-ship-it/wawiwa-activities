// FX4: S19A's one screenshot of the class workbook (eai-m1l4-class, a self-contained page next to this
// lesson): its top at 1280 x 800, saved as assets/img/l4/s19a-workbook.jpg. Usage: node tools/fx4-workbook-shot.mjs
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromePath } from './lib.mjs';
import { ROOT } from './serve.mjs';

const page0 = pathToFileURL(join(ROOT, '..', 'eai-m1l4-class', 'index.html')).href;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
await page.goto(page0, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: join(ROOT, 'assets', 'img', 'l4', 's19a-workbook.jpg'), type: 'jpeg', quality: 82 });
await browser.close();
console.log('saved assets/img/l4/s19a-workbook.jpg');
