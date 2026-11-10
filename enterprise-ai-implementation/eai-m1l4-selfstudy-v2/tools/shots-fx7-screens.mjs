// FX7: every screen at 1280 x 720 (and 1600 x 900 with --wide): a screenshot on arrival (review mode) and,
// for the one-answer choice screens, after a wrong answer + Check (learner mode); reports any panel content
// that runs into the panel's bottom row or out of the panel.
// Usage: node tools/shots-fx7-screens.mjs [--wide] [--only=S01,S03]  -> review/fx7/<size>/<id>[-after].png
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const wide = process.argv.includes('--wide');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const [W, H] = wide ? [1600, 900] : [1280, 720];
const out = join(ROOT, 'review', 'fx7', `${W}x${H}`);
mkdirSync(out, { recursive: true });
const content = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const order = content.chapters.flatMap((c) => c.screens);
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H });
await page.setBypassCSP(true); // (the test's own style tag only: no motion, no review toolbar)
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// what runs past the panel's content area (composed: the panel minus its bottom row; wide: main minus the
// footer row), in stage px
const measure = () => page.evaluate(() => {
  const st = document.querySelector('.w-stage');
  const k = st.getBoundingClientRect().height / 720;
  const panel = document.querySelector('.w-x-panel');
  const box = panel || document.querySelector('.w-main');
  const b = box.getBoundingClientRect();
  const limit = b.bottom - (panel ? 74 : 0) * k;
  const skip = (el) => el.closest('.w-band-row, .w-footer, .w-x-film, [hidden]') || getComputedStyle(el).position === 'fixed';
  let worst = 0, who = '';
  for (const el of box.querySelectorAll('*')) {
    if (skip(el)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const over = Math.max((r.bottom - limit) / k, (r.right - b.right) / k, (b.left - r.left) / k);
    if (over > worst + 0.5) { worst = over; who = (el.className?.baseVal ?? el.className) || el.tagName; }
  }
  return { fx7: st.dataset.fx7 || '', over: Math.round(worst), who: String(who).slice(0, 60) };
});

const report = [];
for (const id of order) {
  if (only.length && !only.includes(id)) continue;
  const s = content.screens.find((x) => x.id === id);
  await page.goto(`${base}?review=1&screen=${id}`, { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: '*{animation-duration:0s!important;animation-delay:0s!important;transition:none!important} .w-review-bar,[class*="w-rv-"]{display:none!important}' });
  await sleep(500);
  const m = await measure();
  await page.screenshot({ path: join(out, `${id}.png`) });
  report.push(`${id.padEnd(5)} ${s.template.padEnd(10)} ${(m.fx7 || '-').padEnd(10)} ${m.over > 0 ? 'OVER ' + m.over + 'px ' + m.who : 'ok'}`);
  // the state after a wrong answer: the one-answer choice screens (select, Check)
  if (s.template === 'decision' && ['single', 'fill', 'metric', 'multi', 'pair', 'rounds', 'cases'].includes(s.variant)) {
    await page.goto(`${base}?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: '*{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}' });
    await sleep(400);
    await page.evaluate((sid) => {
      const L = window.__l4, v = L.view(sid);
      const btns = [...document.querySelectorAll('.w-main .w-opt')];
      const list = v.options || v.situations?.[0]?.options || [];
      const wrong = btns.findIndex((b) => { const o = list.find((x) => x.id === b.dataset.id); return o && !o.correct; });
      if (v.variant === 'multi') { btns[wrong].click(); btns[btns.findIndex((b) => list.find((x) => x.id === b.dataset.id)?.correct)].click(); }
      else (btns[wrong] || btns[0])?.click();
      document.querySelector('[data-action="check"]')?.click();
    }, id);
    await sleep(500);
    const a = await measure();
    await page.screenshot({ path: join(out, `${id}-after.png`) });
    report.push(`${''.padEnd(5)} ${'  after'.padEnd(10)} ${''.padEnd(10)} ${a.over > 0 ? 'OVER ' + a.over + 'px ' + a.who : 'ok'}`);
  }
}
await browser.close();
server.close();
console.log(report.join('\n'));
console.log(`shots in ${out}`);
