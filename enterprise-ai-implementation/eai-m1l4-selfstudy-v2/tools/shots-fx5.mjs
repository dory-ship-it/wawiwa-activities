// FX5 screenshots (Noy's review round): learner mode, 1280 x 720, into review/fx5/.
// Usage: node tools/shots-fx5.mjs [ID ...]   (no ids: every state below)
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const OUT = join(ROOT, 'review', process.env.SHOTS_DIR || 'fx5');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const js = (fn, ...a) => page.evaluate(fn, ...a);
const open = async (id) => { await page.goto(`${base}/index.html?live=0&reset=1&screen=${id}`, { waitUntil: 'load' }); await page.waitForFunction((x) => window.__l4?.current === x, {}, id); await sleep(700); };
const still = () => page.keyboard.press('Shift'); // any key stops the hand
let n = 0;
const shot = async (name) => { await sleep(450); n += 1; await page.screenshot({ path: join(OUT, `${String(n).padStart(2, '0')}-${name}.png`) }); };
// a wrong option by the content (single / multi / pair / rounds / fill / metric)
const wrongOpt = () => js(() => { const L = window.__l4, s = L.view(L.current); const o = (s.options || []).find((x) => !x.correct) || {}; const b = document.querySelector(`.w-main .w-opt[data-id="${o.id}"]`) || document.querySelector('.w-main .w-opt'); b.click(); });
// sort: drop the deck's card on a column (wrong = not its own)
const sortDrop = (wrong) => js((w) => { const L = window.__l4, s = L.view(L.current); const card = document.querySelector('.w-deck-card'); const c = s.cards.find((x) => card.textContent.includes(x.text)); const col = w ? s.columns.find((x) => x.id !== c.column).id : c.column; card.click(); document.querySelector(`.w-drop[data-column="${col}"]`).click(); }, wrong);

const STATES = {
  S02: async () => { await open('S02'); await still(); await shot('S02'); },
  S03: async () => { await open('S03'); await shot('S03-start'); await js(() => { const b = document.querySelectorAll('.w-main .w-opt'); b[0].click(); b[1].click(); }); await shot('S03-two-picked'); await js(() => document.querySelector('[data-action="check"]').click()); await shot('S03-one-try-revealed'); },
  S04: async () => { await open('S04'); await sleep(2600); await shot('S04-hand'); await still(); await sortDrop(true); await sleep(150); await shot('S04-wrong-drop'); await sleep(900); await sortDrop(false); await sortDrop(false); await shot('S04-two-right'); },
  S05a: async () => { await open('S05a'); await sleep(1800); await shot('S05a'); },
  S05b: async () => { await open('S05b'); await sleep(2000); await shot('S05b-hand'); await still(); await js(() => { const c = document.querySelector('.w-label-card[data-label="swimlane"]'); c.click(); document.querySelector('.w-target[data-target="a"]').click(); }); await shot('S05b-right'); },
  S06: async () => { await open('S06'); await sleep(1500); await shot('S06'); await js(() => document.querySelector('.w-main .w-opt[data-id="b"]').click()); await shot('S06-one-try'); },
  S07: async () => { await open('S07'); await still(); await js(() => [...document.querySelectorAll('.w-tile')].forEach((x) => x.click())); await shot('S07-question'); },
  S08: async () => { await open('S08'); await shot('S08'); await wrongOpt(); await shot('S08-one-try'); },
  S10: async () => { await open('S10'); await shot('S10'); await wrongOpt(); await shot('S10-one-try'); },
  S11: async () => { await open('S11'); await shot('S11'); await wrongOpt(); await shot('S11-one-try'); },
  S12: async () => { await open('S12'); await sleep(2000); await shot('S12-hand'); await still(); await js(() => document.querySelector('.w-target[data-target="3"]').click()); await sleep(150); await shot('S12-wrong'); },
  S13: async () => { await open('S13'); await still(); await shot('S13'); await js(() => document.querySelector('.w-target[data-target="1"]').click()); await shot('S13-start-placed'); },
  S14: async () => { await open('S14'); await shot('S14'); await wrongOpt(); await shot('S14-one-try'); },
  S15: async () => { await open('S15'); await shot('S15'); },
  S16: async () => { await open('S16'); await still(); await shot('S16'); },
  S17: async () => { await open('S17'); await shot('S17'); },
  S17B: async () => { await open('S17B'); await still(); await shot('S17B'); },
  S20: async () => { await open('S20'); await shot('S20'); },
  V1: async () => { await open('V1'); await js(() => document.querySelector('.w-speed').click()); await shot('V1-speed-menu'); },
  O2: async () => { await open('O2'); await sleep(1500); await shot('O2-hand'); },
  W1: async () => { await open('W1'); await shot('W1'); await js(() => document.querySelector('.w-guess').click()); await shot('W1-guess'); },
  S01: async () => { await open('S01'); await shot('S01'); await wrongOpt(); await shot('S01-one-try'); },
  S18: async () => { await open('S18'); await shot('S18'); },
  S18A: async () => { await open('S18A'); await shot('S18A'); },
  S19C: async () => { await open('S19C'); await shot('S19C'); },
  S20B: async () => { await open('S20B'); await shot('S20B'); },
  S21: async () => { await open('S21'); await shot('S21'); },
  S22: async () => { await open('S22'); await shot('S22'); },
  S12B: async () => { await open('S12B'); await still(); await shot('S12B'); },
  NEXT: async () => { await open('S10'); await js(() => { const n = document.querySelector('.w-next'); n.click(); n.click(); }); await shot('next-pressed-twice'); },
};
for (const [id, run] of Object.entries(STATES)) { if (only.length && !only.includes(id)) continue; try { await run(); } catch (e) { errors.push(id + ': ' + e.message); } }
console.log(`${n} shots in review/fx5/`, errors.length ? '\nERRORS: ' + errors.join(' | ') : '');
await browser.close();
server.close();
