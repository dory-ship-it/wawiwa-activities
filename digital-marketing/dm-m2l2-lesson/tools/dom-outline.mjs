// Prints the element tree of a screen's main area (classes, 5 levels), to style a template without
// guessing its structure. Usage: node tools/dom-outline.mjs S10 [depth]
import puppeteer from 'puppeteer-core';
import { chromePath } from './lib.mjs';
import { startServer } from './serve.mjs';

const id = process.argv[2] || 'S10';
const depth = Number(process.argv[3] || 5);
const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto(`http://127.0.0.1:${server.address().port}/?review=1&screen=${id}`, { waitUntil: 'networkidle0' });
const tree = await page.evaluate((d) => {
  const walk = (el, n, pad) => {
    if (n > d) return '';
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).map((c) => '.' + c).join('') : '';
    const txt = el.children.length ? '' : ' "' + (el.textContent || '').trim().slice(0, 30) + '"';
    let s = pad + el.tagName.toLowerCase() + cls + txt + '\n';
    if (el.tagName === 'svg') return s;
    for (const c of el.children) s += walk(c, n + 1, pad + '  ');
    return s;
  };
  return walk(document.querySelector('.w-main'), 0, '');
}, depth);
console.log(tree);
await browser.close();
server.close();
