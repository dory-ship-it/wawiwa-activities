// (Noy, 10 Nov 2026: "the text ran out of the screen and out of its frame; check every screen"):
// every screen in every state of tools/states.mjs (arrival, opened, answered, wrong, done), at three sizes.
// Reports
//  1. content that sticks out of the white panel it belongs to (a child box past the panel's edge),
//  1b. two blocks of the screen over each other ("no object may sit on another"), or a block on the nav row,
//  2. text past the stage edges, or under the top bar / into the Previous-Next row.
// Usage: node tools/check-overflow.mjs [--only=S05,K1]
import puppeteer from 'puppeteer-core';
import { chromePath } from './lib.mjs';
import { startServer } from './serve.mjs';
import { STATES, sleep } from './states.mjs';

const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const SIZES = [[1280, 720], [1024, 576], [1920, 950]];
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars', '--mute-audio'] });
const NOMOTION = '*{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}';

const measure = (page) => page.evaluate(() => {
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
      // by design: a card's caret points out of the card at the node it belongs to (O2, K1, S11); and a line
      // inside a scroller of the panel (the video transcript) is scrolled, not out of it
      if (el.matches('.w-map-caret, .d-dim-caret, .d-goal-caret')) continue;
      let scrolled = false;
      for (let e = el.parentElement; e && e !== p; e = e.parentElement) if (/auto|scroll/.test(getComputedStyle(e).overflowY)) scrolled = true;
      if (scrolled) continue;
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
    if (w > 4 * k && h > 0.5 * k) out.push(`overlap: ${name(blocks[i])} / ${name(blocks[j])}`); // (DM: any vertical overlap counts; S06's closing card once sat 3 px on the cards)
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
    // a line scrolled out of its scroller (the video transcript) is not painted
    let box = null;
    for (let e = n.parentElement; e && e !== main; e = e.parentElement) if (/auto|scroll/.test(getComputedStyle(e).overflowY)) { box = e.getBoundingClientRect(); break; }
    for (const r of rg.getClientRects()) {
      if (!r.width) continue;
      if (box && (r.bottom > box.bottom + 1 || r.top < box.top - 1)) continue;
      const t = n.textContent.trim().slice(0, 30);
      if (r.left < S.left - 1 || r.right > S.right + 1 || r.bottom > S.bottom + 1) out.push(`text off stage: "${t}"`);
      else if (bar && r.top < bar.bottom - 1) out.push(`text under bar: "${t}"`);
      else if (nav.some((b) => r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom)) out.push(`text on nav button: "${t}"`);
    }
  }
  return [...new Set(out)].slice(0, 6);
});

const report = [];
let bad = 0, n = 0;
for (const [W, H] of SIZES) {
  for (const [id, state, act] of STATES.filter(([sid]) => !only.length || only.includes(sid))) {
    // each state from a fresh load in its own context (the lesson as a learner sees it, nothing saved before).
    // After a few hundred pages one load sometimes never settles (the template's test-fit met the same): such
    // a load is tried once more in a fresh context.
    let ctx, page;
    for (let attempt = 1; ; attempt++) {
      ctx = await browser.createBrowserContext();
      page = await ctx.newPage();
      await page.setBypassCSP(true); // (the no-motion style tag below; the page's CSP allows no inline styles)
      await page.setViewport({ width: W, height: H });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      try {
        await page.goto(`${base}?reset=1&screen=${id}`, { waitUntil: id.startsWith('V') ? 'load' : 'networkidle0' });
        await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded', { timeout: 15000 });
        break;
      } catch (e) {
        await ctx.close().catch(() => {});
        if (attempt >= 2 || e.name !== 'TimeoutError') throw e;
        console.log(`note ${W}x${H} ${id} ${state}: load timed out, tried once more`);
      }
    }
    await page.addStyleTag({ content: NOMOTION });
    try { await act(page); } catch (e) { bad++; report.push(`${W}x${H} ${id} ${state}: could not reach the state (${e.message})`); }
    await page.mouse.move(0, 0);
    await sleep(250);
    const m = await measure(page);
    n++;
    if (m.length) { bad++; report.push(`${W}x${H} ${id} ${state}: ${m.join(' | ')}`); }
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log(report.join('\n') || 'no overflow');
console.log(`check-overflow: ${n} screen states at ${SIZES.map((s) => s.join('x')).join(', ')}; ${bad} problem state(s)`);
process.exit(bad ? 1 : 0);
