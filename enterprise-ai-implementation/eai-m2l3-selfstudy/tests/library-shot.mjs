// Takes the screenshot for E1's guide (assets/img/library-guide.png) from the lesson's library page.
// Retake it whenever library/index.html changes (Noy, 23 Nov 2026: the guide shows our own page).
// Usage, with the lesson served (npm run serve): node tests/library-shot.mjs
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const chrome = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'].find(existsSync);
const port = JSON.parse((await import('node:fs')).readFileSync(new URL('../kit.json', import.meta.url), 'utf8')).port;
const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 1120, height: 560, deviceScaleFactor: 1.5 });
await p.goto(`http://localhost:${port}/library/`, { waitUntil: 'networkidle0' });
await p.screenshot({ path: new URL('../assets/img/library-guide.png', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') });
await b.close();
console.log('library-shot: assets/img/library-guide.png');
