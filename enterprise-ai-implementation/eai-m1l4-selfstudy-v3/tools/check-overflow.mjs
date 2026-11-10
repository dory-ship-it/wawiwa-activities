// v3 (Noy, 10 Nov 2026: "the text ran out of the screen and out of its frame; check every screen"):
// every screen, on arrival and after a wrong answer, at three sizes. Reports
//  1. content that sticks out of the white panel it belongs to (a child box past the panel's edge),
//  2. text past the stage edges, or under the top bar / into the Previous-Next row.
// Usage: node tools/check-overflow.mjs [--only=S10,S12]
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const SIZES = [[1280, 720], [1024, 576], [1920, 950]];
const content = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const order = content.chapters.flatMap((c) => c.screens).filter((id) => !only.length || only.includes(id));
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars', '--mute-audio'] });
const page = await browser.newPage();
await page.setBypassCSP(true);
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOMOTION = '*{animation-duration:0s!important;animation-delay:0s!important;transition:none!important} .w-review-bar,[class*="w-rv-"]{display:none!important}';

const measure = () => page.evaluate(() => {
  const st = document.querySelector('.w-stage');
  const S = st.getBoundingClientRect();
  const k = S.height / 720;
  const bar = st.querySelector('.w-bar')?.getBoundingClientRect();
  const nav = [...st.querySelectorAll('.w-footer button, .w-nav button, [data-action="next"], [data-action="prev"]')].map((b) => b.getBoundingClientRect()).filter((r) => r.width);
  const out = [];
  const vis = (el) => { const c = getComputedStyle(el); return c.visibility !== 'hidden' && c.display !== 'none' && Number(c.opacity) > 0.05 && !el.closest('[hidden], .w-sr-only, .w-coach, .w-menu, dialog'); };
  const name = (el) => String((el.className?.baseVal ?? el.className) || el.tagName).split(' ')[0];
  // 1. panels: an element with its own light background and a shadow or border, holding text
  const main = st.querySelector('.w-main');
  if (!main) return out;
  const panels = [...main.querySelectorAll('*')].filter((el) => {
    const c = getComputedStyle(el);
    const bg = c.backgroundColor.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    const light = bg.length >= 3 && bg[0] > 200 && bg[1] > 200 && bg[2] > 200 && (bg[3] ?? 1) > 0.8;
    const r = el.getBoundingClientRect();
    return light && c.boxShadow !== 'none' && r.width > 300 * k && r.height > 120 * k && vis(el) && c.overflow === 'visible';
  });
  for (const p of panels) {
    const P = p.getBoundingClientRect();
    for (const el of p.querySelectorAll('*')) {
      if (!vis(el) || getComputedStyle(el).position === 'fixed' || el.closest('.w-float, .w-tip, .w-ghost, [class*="hand"]')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const o = Math.max(P.top - r.top, r.bottom - P.bottom, P.left - r.left, r.right - P.right) / k;
      if (o > 2) out.push(`out of panel ${name(p)}: ${name(el)} by ${Math.round(o)}px`);
    }
  }
  // 1b. (Noy: "no object may sit on another") the screen's blocks never overlap: the main's own children,
  // and the cards/panels one level in, against each other and against the Previous / Next buttons
  const blocks = [...main.children, ...[...main.children].flatMap((c) => [...c.children])]
    .filter((el) => vis(el) && el.getBoundingClientRect().width > 40 * k && el.getBoundingClientRect().height > 24 * k && getComputedStyle(el).position === 'absolute');
  for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
    const a = blocks[i].getBoundingClientRect(), b = blocks[j].getBoundingClientRect();
    if (blocks[i].contains(blocks[j]) || blocks[j].contains(blocks[i])) continue;
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (w > 4 * k && h > 4 * k) out.push(`overlap: ${name(blocks[i])} / ${name(blocks[j])}`);
  }
  // (the video player's box is full width, its film sits between Previous and Next: skip the box)
  for (const el of [...main.children].filter((e) => vis(e) && !e.matches('.w-player'))) {
    const a = el.getBoundingClientRect();
    if (nav.some((b) => a.right > b.left + 4 && a.left < b.right - 4 && a.bottom > b.top + 4 && a.top < b.bottom - 4)) out.push(`on nav row: ${name(el)}`);
  }
  // 2. text past the stage, under the bar, or into the nav row
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim() || !vis(n.parentElement)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const r of rg.getClientRects()) {
      if (!r.width) continue;
      const t = n.textContent.trim().slice(0, 30);
      if (r.left < S.left - 1 || r.right > S.right + 1 || r.bottom > S.bottom + 1) out.push(`text off stage: "${t}"`);
      else if (bar && r.top < bar.bottom - 1) out.push(`text under bar: "${t}"`);
      else if (nav.some((b) => r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom)) out.push(`text on nav button: "${t}"`);
    }
  }
  return [...new Set(out)].slice(0, 6);
});

const report = [];
let bad = 0;
for (const [W, H] of SIZES) {
  await page.setViewport({ width: W, height: H });
  for (const id of order) {
    const s = content.screens.find((x) => x.id === id);
    await page.goto(`${base}?review=1&screen=${id}`, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: NOMOTION });
    await sleep(350);
    const m = await measure();
    if (m.length) { bad++; report.push(`${W}x${H} ${id} arrival: ${m.join(' | ')}`); }
    if (s.template === 'decision') {
      await page.goto(`${base}?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
      await page.addStyleTag({ content: NOMOTION });
      await sleep(300);
      await page.evaluate((sid) => {
        const v = window.__l4?.view(sid) || {};
        const btns = [...document.querySelectorAll('.w-main .w-opt')];
        const list = v.options || v.situations?.[0]?.options || [];
        const wrong = btns.findIndex((b) => { const o = list.find((x) => x.id === b.dataset.id); return o && !o.correct; });
        (btns[wrong] || btns[0])?.click();
        document.querySelector('[data-action="check"]')?.click();
      }, id);
      await sleep(450);
      const a = await measure();
      if (a.length) { bad++; report.push(`${W}x${H} ${id} after: ${a.join(' | ')}`); }
    }
  }
}
await browser.close();
server.close();
console.log(report.join('\n') || 'no overflow');
console.log(`check-overflow: ${bad} problem state(s)`);
process.exit(bad ? 1 : 0);
