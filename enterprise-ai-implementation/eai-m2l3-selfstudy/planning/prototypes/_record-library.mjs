// E1's silent demo of the library page (Noy, 25 Nov 2026: "a screen recording, even with no words, that shows how
// you use it and search"). A visible cursor filters by department, then by category, scrolls through the cases and the
// spotlights, and ends on the download button. Writes assets/video/e1-library-demo.webm (then converted to mp4).
// Run from the lesson folder: node planning/prototypes/_record-library.mjs
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath() });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto(`http://127.0.0.1:${server.address().port}/library/index.html`, { waitUntil: 'networkidle0' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await page.evaluate(() => {
  const c = document.createElement('div');
  c.id = 'demo-cursor';
  c.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 3l14 8-6 1.6L9 19z" fill="#16293A" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  Object.assign(c.style, { position: 'fixed', left: '640px', top: '420px', zIndex: 99999, pointerEvents: 'none', transition: 'left .7s cubic-bezier(.3,.7,.2,1), top .7s cubic-bezier(.3,.7,.2,1)' });
  document.body.append(c);
  const st = document.createElement('style');
  st.textContent = '.demo-ring{position:fixed;z-index:99998;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;border:3px solid #5AB3AA;pointer-events:none;animation:dr .5s ease-out forwards}@keyframes dr{from{transform:scale(.4);opacity:1}to{transform:scale(1.4);opacity:0}}';
  document.head.append(st);
});
const moveTo = async (sel, text) => {
  const box = await page.evaluate((s, t) => {
    const el = [...document.querySelectorAll(s)].find((x) => !t || x.textContent.includes(t)) || document.querySelector(s);
    el.scrollIntoView({ block: 'nearest' });
    const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, sel, text);
  await page.evaluate(({ x, y }) => { const c = document.getElementById('demo-cursor'); c.style.left = x - 4 + 'px'; c.style.top = y - 3 + 'px'; }, box);
  await sleep(800);
  return box;
};
const tap = async (sel, text) => {
  const box = await moveTo(sel, text);
  await page.evaluate(({ x, y }) => { const r = document.createElement('div'); r.className = 'demo-ring'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.append(r); setTimeout(() => r.remove(), 600); }, box);
  await page.evaluate((s, t) => { const el = [...document.querySelectorAll(s)].find((x) => !t || x.textContent.includes(t)); el?.click(); }, sel, text);
  await sleep(1100);
};
const scrollBy = async (y) => { await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), y); await sleep(1300); };

const rec = await page.screencast({ path: join(ROOT, 'assets/video/e1-library-demo.webm') });
await sleep(900);
await tap('#fdept .chip', 'Finance');
await tap('#fcat .chip', 'Document');
await scrollBy(260);
await tap('#fcat .chip', 'All');
await scrollBy(520);
await page.evaluate(() => document.getElementById('spots').scrollIntoView({ behavior: 'smooth', block: 'start' })); await sleep(1800);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(1200);
const dl = await moveTo('#dl');
await page.evaluate(({ x, y }) => { const r = document.createElement('div'); r.className = 'demo-ring'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.append(r); }, dl);
await sleep(1500);
await rec.stop();
await browser.close(); server.close();
console.log('ok');
