// NL1 helper (NL2: any of the 45 frames): the boxes of the text runs in one reference frame and in
// the built screen, side by side (stage px, rounded), so differences can be read as numbers. Usage:
//   node tools/measure-nl1.mjs <frame number 1-45> "<query>" ["<js to run in the build first>"]
// (tools/probe.mjs prints any expression on a built screen, after an optional setup script)
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';

const [n, query = 'screen=O1', pre = ''] = process.argv.slice(2);
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const runs = () => {
  const root = document.querySelector('.__m') || document.querySelector('.w-stage');
  const R = root.getBoundingClientRect();
  const out = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let t = w.nextNode(); t; t = w.nextNode()) {
    if (!t.nodeValue.trim()) continue;
    const el = t.parentElement;
    if (el.closest('.w-sr-only,[hidden]') || getComputedStyle(el).visibility === 'hidden') continue;
    const rg = document.createRange(); rg.selectNodeContents(t);
    const r = rg.getBoundingClientRect();
    if (!r.width) continue;
    const cs = getComputedStyle(el);
    out.push(`${t.nodeValue.trim().slice(0, 34).padEnd(34)} x${Math.round(r.left - R.left)} y${Math.round(r.top - R.top)} w${Math.round(r.width)} h${Math.round(r.height)} ${cs.fontWeight} ${cs.fontSize}`);
  }
  return out;
};
const fonts = readFileSync(join(ROOT, 'src', 'fonts.css'), 'utf8').replace(/url\(\.\.\//g, `url(${BASE}`);
const ref = await browser.newPage();
await ref.setViewport({ width: 1400, height: 900 });
await ref.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await ref.setRequestInterception(true);
ref.on('request', (r) => (/fonts\.(googleapis|gstatic)/.test(r.url()) ? r.abort() : r.continue()));
await ref.goto(BASE + 'planning/design-reference/hybrid-cinematic/screens-intro-ch2.html', { waitUntil: 'networkidle0' });
await ref.addStyleTag({ content: fonts + '.wrap{max-width:none!important}.frame{width:1280px!important}.scr{border:0!important}' });
await ref.evaluate((i) => document.querySelectorAll('figure.it .scr')[i].classList.add('__m'), Number(n) - 1);
await ref.evaluate(() => document.fonts.ready);
const a = await ref.evaluate(runs);
const b = await browser.newPage();
await b.setViewport({ width: 1280, height: 720 });
await b.goto(BASE + 'index.html?reset=1&' + query, { waitUntil: 'load' });
await b.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
if (pre) { await b.evaluate(pre); }
await new Promise((r) => setTimeout(r, 800));
await b.keyboard.press('Shift');
const c = await b.evaluate(runs);
console.log('--- reference'); a.forEach((x) => console.log(x));
console.log('--- build'); c.forEach((x) => console.log(x));
await browser.close(); server.close();
