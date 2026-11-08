// FX4 (Dor's pilot): a learner-mode run from O1 to END that answers WRONG wherever it can, inside the
// Blossom-like player frame (tools/blossom-frame.html). Done = it reaches END and no screen ever leaves
// the learner without a way on (Next unlocks on every screen after wrong answers). Also checks on every
// screen that the stage fits the visible frame (Previous and Next inside the window).
// Usage: node tools/walk-wrong.mjs [--mode=fill|wide|tall] [--shots=DIR] [--size=1280x720]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
const mode = arg('mode', 'fill');
const shots = arg('shots', '');
const [VW, VH] = arg('size', '1280x720').split('x').map(Number);
if (shots) mkdirSync(join(ROOT, shots), { recursive: true });

const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true,
  args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: VW, height: VH, deviceScaleFactor: 1 });
browser.on('targetcreated', async (t) => { if (t.type() === 'page') { const p = await t.page(); if (p && p !== page) await p.close().catch(() => {}); } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${base}/tools/blossom-frame.html?mode=${mode}&reset=1`, { waitUntil: 'load' });
await page.waitForFunction(() => document.getElementById('lesson').contentWindow.__l4?.current);
const frame = () => page.frames().find((f) => f.url().includes('/index.html'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// runs inside the lesson frame
const F = (fn, ...a) => frame().evaluate(fn, ...a);
const state = () => F(() => {
  const L = window.__l4, s = L.view(L.current);
  const next = document.querySelector('.w-next');
  return { id: L.current, template: s.template, variant: s.variant || '', locked: next.dataset.locked === 'true', why: document.querySelector('.w-next-why')?.hidden ? '' : document.querySelector('.w-next-why')?.textContent };
});
// the stage inside the visible window: Previous and Next (and the stage's corners) in the top window's view
const fit = () => page.evaluate(() => {
  const fe = document.getElementById('lesson'), fr = fe.getBoundingClientRect();
  const doc = fe.contentDocument;
  // (a control the screen hides, O1's footer or END's Next, has no box and passes)
  const box = (sel) => { const el = doc.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); if (!r.width || !r.height) return null; return { l: r.left + fr.left, t: r.top + fr.top, r: r.right + fr.left, b: r.bottom + fr.top }; };
  const vis = { l: Math.max(0, fr.left), t: Math.max(64, fr.top), r: Math.min(innerWidth, fr.right), b: Math.min(innerHeight, fr.bottom) };
  const inside = (b) => !b || (b.l >= vis.l - 1 && b.t >= vis.t - 1 && b.r <= vis.r + 1 && b.b <= vis.b + 1);
  const stage = box('.w-stage'), prev = box('.w-prev'), next = box('.w-next');
  return { stage: inside(stage), prev: inside(prev), next: inside(next) };
});

const click = (sel) => F((s) => { const el = document.querySelector(s); if (!el) return false; el.click(); return true; }, sel);
const clickAll = (sel) => F((s) => { const els = [...document.querySelectorAll(s)]; els.forEach((e) => e.click()); return els.length; }, sel);
const stripAction = () => F(() => { const b = document.querySelector('.w-band-actions button'); if (b) { b.click(); return true; } return false; });

// one round of wrong-first answering for the screen in view; returns a short note
async function act(st) {
  const t = st.template, v = st.variant;
  if (t === 'warmup') return clickAll('.w-ans:first-of-type') && 'guess';
  if (t === 'input') {
    return F(() => {
      document.querySelectorAll('.w-input').forEach((i) => { i.value = i.value || 'Test entry'; i.dispatchEvent(new Event('input')); });
      const box = document.querySelector('.w-checkbox'); if (box && !box.checked) box.click();
      document.querySelector('[data-action="save"]').click(); return 'saved';
    });
  }
  if (t === 'video') {
    return F(async () => {
      const vid = document.querySelector('video.w-video');
      const stop = document.querySelector('.w-stop-view');
      if (stop && !stop.hidden) {
        // wrong twice (or right when only right is left), then Resume
        const L = window.__l4;
        for (let k = 0; k < 4; k++) {
          const res = document.querySelector('.w-resume');
          if (res.dataset.locked !== 'true') { res.click(); return 'stop resumed'; }
          const opts = [...document.querySelectorAll('.w-stop-view .w-opt')].filter((b) => !b.dataset.result);
          const wrong = opts.find((b) => true);
          wrong?.click();
          document.querySelector('.w-stop-view [data-action="check"]:not([disabled])')?.click(); // FX7: select, then Check
          await new Promise((r) => setTimeout(r, 120));
        }
        return 'stop';
      }
      vid.muted = true; vid.playbackRate = 16;
      if (vid.paused) await vid.play().catch(() => {});
      await new Promise((r) => setTimeout(r, 1500));
      return 'playing ' + Math.round(vid.currentTime);
    });
  }
  if (t === 'explorer') {
    return F(async () => {
      const tiles = [...document.querySelectorAll('.w-tile')];
      if (document.querySelector('.w-tiles').dataset.phase !== 'answer') { tiles.forEach((x) => x.click()); return 'opened all'; }
      const L = window.__l4, s = L.view(L.current);
      const wrong = tiles.filter((x, i) => !s.tiles[i].correct && !x.dataset.result);
      (wrong[0] || tiles[0]).click();
      document.querySelector('[data-action="check"]:not([disabled])')?.click(); // FX7: select, then Check
      return 'tile answer';
    });
  }
  if (t === 'decision' && v === 'multi') {
    return F(() => {
      const L = window.__l4, s = L.view(L.current);
      const btns = [...document.querySelectorAll('.w-ans')];
      btns.forEach((b, i) => { if (b.getAttribute('aria-pressed') === 'true') b.click(); });
      const wrong = s.options.map((o, i) => (!o.correct ? i : -1)).filter((i) => i >= 0);
      [wrong[0], s.options.findIndex((o) => o.correct)].forEach((i) => btns[i].click());
      document.querySelector('[data-action="check"]')?.click();
      return 'multi checked';
    });
  }
  if (t === 'decision' && v === 'fields') {
    return F(() => {
      const sels = [...document.querySelectorAll('.w-field-select')];
      const keys = [...sels[0].options].map((o) => o.value).filter(Boolean);
      sels.forEach((s, i) => { if (!s.value && !s.disabled) { s.value = keys[(i + 1) % keys.length]; s.dispatchEvent(new Event('change')); } });
      document.querySelector('[data-action="check"]')?.click();
      return 'fields checked';
    });
  }
  if (t === 'decision' && v === 'selfcheck') return clickAll('.w-toggle[data-choice="notYet"]') && 'not yet x3';
  if (t === 'decision' && v === 'risk') return click('.w-ans') && 'risk picked';
  if (t === 'decision' && v === 'close') {
    return F(() => {
      const take = document.querySelector('.w-takeaway');
      const step2 = document.querySelector('.w-close2');
      if (step2.hidden) { take.click(); document.querySelector('.w-next').click(); return 'takeaway'; }
      const fin = document.querySelector('[data-action="finish"]'); fin.click(); fin.click(); return 'finish x2';
    });
  }
  if (t === 'decision') {
    if (await stripAction()) return 'strip action';
    return F(() => {
      const opts = [...document.querySelectorAll('.w-main .w-opt')].filter((b) => !b.dataset.result && b.getAttribute('aria-disabled') !== 'true');
      const L = window.__l4, s = L.view(L.current);
      // prefer a wrong option by the content when it can be told (single, fill, metric)
      const list = s.options || [];
      const wrong = opts.find((b) => { const o = list.find((x) => x.id === b.dataset.id); return o && !o.correct; });
      (wrong || opts[0])?.click();
      document.querySelector('[data-action="check"]:not([disabled])')?.click(); // FX7: select, then Check
      return 'option';
    });
  }
  if (t === 'sortDeck' || t === 'bpmn' || t === 'flags') {
    return F((t) => {
      const check = document.querySelector('[data-action="check"]');
      if (check && !check.disabled) { check.click(); return 'checked'; }
      const card = t === 'sortDeck' ? document.querySelector('.w-deck-card:not([inert])') : [...document.querySelectorAll('.w-label-card')].find((c) => !c.hidden);
      const targets = [...document.querySelectorAll(t === 'sortDeck' ? '.w-drop' : '.w-target')].filter((x) => !x.inert);
      if (!card || !targets.length) return 'nothing to place';
      card.click();
      // a wrong place when one can be told: the last free target (the deck: the column after the right one)
      targets[targets.length - 1].click();
      return 'placed';
    }, t);
  }
  if (t === 'handoff' && v === 'back') {
    // "Not yet" first (the reopen link shows), then Yes
    if (await F(() => document.querySelector('.w-pdf-fix').hidden)) return click('[data-action="pdfNotYet"]') && 'pdf not yet';
    return click('[data-action="pdfYes"]') && 'pdf yes';
  }
  if (t === 'handoff') return click('[data-action="open"]') && 'opened workbook';
  if (t === 'check') {
    return F(() => {
      const tiles = [...document.querySelectorAll('.w-kc-tile')];
      if (tiles.length) { tiles.slice(0, 2).forEach((x) => { if (x.getAttribute('aria-pressed') !== 'true') x.click(); }); }
      else document.querySelector('.w-kc-opt')?.click();
      const send = document.querySelector('.w-band-tool button');
      if (send && !send.disabled) { send.click(); return 'sent'; }
      const nx = document.querySelector('.w-band-actions button'); if (nx) { nx.click(); return 'review next'; }
      return 'check';
    });
  }
  return 'nothing';
}

const log = [];
let stuck = null, steps = 0, lastId = null, sameCount = 0;
const fitFails = [];
while (steps++ < 800) {
  const st = await state();
  if (st.id !== lastId) {
    sameCount = 0; lastId = st.id;
    const f = await fit();
    if (!f.stage || !f.prev || !f.next) fitFails.push(`${st.id} stage ${f.stage} prev ${f.prev} next ${f.next}`);
    if (shots) await page.screenshot({ path: join(ROOT, shots, `${String(log.length + 1).padStart(2, '0')}-${st.id}.png`) });
    log.push({ id: st.id, notes: [] });
    // FX5: no line beside a locked Next until it is pressed twice; then its reason must show
    if (st.locked) {
      if (st.why) log[log.length - 1].notes.push('LINE BEFORE ANY PRESS');
      await F(() => { const n = document.querySelector('.w-next'); n.click(); n.click(); });
      const after2 = await state();
      if (after2.id === st.id && after2.locked && !after2.why) log[log.length - 1].notes.push('LOCKED WITHOUT A LINE');
    }
  }
  if (st.template === 'end') break;
  if (!st.locked && st.variant !== 'close') {
    // unlocked: on to the next screen
    const before = st.id;
    await click('.w-next');
    await sleep(250);
    const now = await state();
    if (now.id === before) { await click('.w-next'); await sleep(250); } // a chapter-end pause marker
    continue;
  }
  const note = await act(st);
  log[log.length - 1].notes.push(note);
  await sleep(st.template === 'video' ? 300 : 120);
  if (++sameCount > 60) { stuck = st; break; }
}
const last = await state();
console.log(log.map((x) => `${x.id.padEnd(5)} ${x.notes.join(' | ')}`).join('\n'));
console.log('\nreached:', last.id, '| fit failures:', fitFails.length ? fitFails.join('; ') : 'none', '| page errors:', errors.length ? errors.join('; ') : 'none');
const lineless = log.filter((x) => x.notes.includes('LOCKED WITHOUT A LINE')).map((x) => x.id);
if (lineless.length) console.log('locked without a visible line:', lineless.join(' '));
if (stuck) console.log('STUCK on', stuck.id, stuck.why);
await browser.close();
server.close();
process.exit(stuck || last.id !== 'END' || fitFails.length || errors.length || lineless.length ? 1 : 0);
