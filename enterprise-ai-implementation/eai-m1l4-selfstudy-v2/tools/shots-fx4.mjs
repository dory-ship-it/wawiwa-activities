// FX4 checkpoint screenshots (end of Phase 3): learner mode (no review=1), 1280 x 720, into review/fx4/.
// Usage: node tools/shots-fx4.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const OUT = join(ROOT, 'review', 'fx4');
mkdirSync(OUT, { recursive: true });
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const open = async (id) => { await page.goto(`${base}/index.html?live=0&reset=1&screen=${id}`, { waitUntil: 'load' }); await page.waitForFunction((x) => window.__l4?.current === x, {}, id); await sleep(900); };
const shot = async (name) => { await sleep(500); await page.screenshot({ path: join(OUT, name + '.png') }); console.log('review/fx4/' + name + '.png'); };
const js = (fn, ...a) => page.evaluate(fn, ...a);

// S04: the deck, then every card checked (one wrong first: the per-card line), then all right with tags
await open('S04'); await shot('01-S04-start');
await js(() => { const c = document.querySelector('.w-deck-card'); c.click(); document.querySelector('.w-drop[data-column="b"]').click(); });
await shot('02-S04-card-placed');
await js(() => { const want = window.__l4.view('S04').cards; for (let k = 0; k < 6; k++) { const card = document.querySelector('.w-deck-card:not([inert])'); if (!card) break; const c = want.find((x) => card.textContent.includes(x.text)); card.click(); document.querySelector(`.w-drop[data-column="${k === 0 ? 'b' : c.column}"]`).click(); } });
await js(() => document.querySelector('[data-action="check"]').click());
await shot('03-S04-after-check-wrong');
await js(() => { const want = window.__l4.view('S04').cards; const card = document.querySelector('.w-deck-card:not([inert])'); const c = want.find((x) => card.textContent.includes(x.text)); card.click(); document.querySelector(`.w-drop[data-column="${c.column}"]`).click(); document.querySelector('[data-action="check"]').click(); });
await shot('04-S04-done-tags');
// S07: start, three opened, the question after a wrong answer
await open('S07'); await shot('05-S07-start');
await js(() => [...document.querySelectorAll('.w-tile')].slice(0, 3).forEach((t) => t.click()));
await shot('06-S07-three-opened');
await js(() => { const t = [...document.querySelectorAll('.w-tile')]; t.slice(3).forEach((x) => x.click()); t[1].click(); });
await shot('07-S07-question-one-more-try');
// S14: start, the hint opened, one wrong, revealed after two
await open('S14'); await shot('08-S14-start');
await js(() => document.querySelector('.w-hint-link').click()); await shot('09-S14-hint-open');
await js(() => document.querySelector('.w-opt[data-id="a"]').click()); await shot('10-S14-one-more-try');
await js(() => document.querySelector('.w-opt[data-id="c"]').click()); await shot('11-S14-revealed');
// S19A, S19B (before and after Open), S19C (Not yet)
await open('S19A'); await shot('12-S19A');
await open('S19B'); await shot('13-S19B');
await js(() => { const a = document.querySelector('[data-action="open"]'); a.removeAttribute('target'); a.addEventListener('click', (e) => e.preventDefault(), { once: true }); a.click(); });
await shot('14-S19B-opened');
await open('S19C'); await shot('15-S19C');
await js(() => document.querySelector('[data-action="pdfNotYet"]').click()); await shot('16-S19C-not-yet');
// S22: step 1, a takeaway, step 2
await open('S22'); await shot('17-S22-step1');
await js(() => document.querySelector('.w-takeaway').click()); await shot('18-S22-takeaway');
await js(() => document.querySelector('.w-next').click()); await shot('19-S22-step2');

await browser.close();
server.close();
