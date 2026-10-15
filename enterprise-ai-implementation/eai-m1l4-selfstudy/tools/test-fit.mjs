// Fit, keyboard and screenshot harness (P0 version). Adapted from
// genai-for-marketing/s1-ai-awareness/tools/test-fit.mjs: tiny static server + puppeteer-core +
// the machine's Chrome. P1 to P5 extend it to the real screens and states.
// Usage: npm run test:fit                 checks only
//        npm run test:fit -- --shots      checks + screenshots into review/p0/
// Chrome: set CHROME_PATH, or a stock Google Chrome / Chromium install is found on its own.
// P1 adds section 5: the real slice screens fit, nothing overlaps the feedback row, and no empty
// band inside the stage card is taller than 25% of the card (Noy's space-distribution rule).
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath, measureLayout, MAX_GAP_RATIO } from './lib.mjs';

const SHOTS = process.argv.includes('--shots');
const OUT = join(ROOT, 'review', 'p0');
const SIZES = [[1280, 720], [1920, 1080], [1024, 640]];
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));

const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars'] });
if (SHOTS) mkdirSync(OUT, { recursive: true });

async function open(url, [w, h] = [1280, 720], { keepStorage = false, page: reuse = null } = {}) {
  const page = reuse || await browser.newPage();
  if (!reuse) {
    page.errors = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') page.errors.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  }
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  if (!keepStorage) { /* storage is per test page; ?reset=1 clears it where needed */ }
  await page.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
  await page.evaluate(() => document.fonts.ready);
  return page;
}
const shot = async (page, name) => { if (SHOTS) { await page.screenshot({ path: join(OUT, name) }); console.log('       shot ' + name); } };
const active = (page) => page.evaluate(() => {
  const a = document.activeElement;
  return { cls: a?.className?.baseVal ?? a?.className ?? '', tag: a?.tagName, action: a?.dataset?.action || '', label: a?.getAttribute('aria-label') || a?.textContent?.trim().slice(0, 40) };
});
const press = async (page, key, n = 1) => { for (let i = 0; i < n; i++) await page.keyboard.press(key); };

/* ---- 1. load, scale, no scrollbars, zones, clipped text at three sizes ---- */
console.log('\n1. load and fit');
for (const size of SIZES) {
  const page = await open(BASE + '?demo=1&fb=correct', size);
  const r = await page.evaluate(() => {
    const stage = document.querySelector('.w-stage');
    const s = stage.getBoundingClientRect();
    const k = s.width / 1280;
    const box = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: (b.left - s.left) / k, y: (b.top - s.top) / k, w: b.width / k, h: b.height / k }; };
    const clipped = [...document.querySelectorAll('.w-instruction, .w-topbar-line, .w-fb-live, .w-demo-option, .w-line, .w-btn')]
      .filter((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1).map((el) => el.className);
    return {
      k, sw: s.width, sh: s.height, left: s.left, top: s.top,
      scroll: document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight,
      topbar: box('.w-topbar'), instruction: box('.w-instruction'), card: box('.w-card'), feedback: box('.w-feedback'), clipped,
    };
  });
  const [w, h] = size;
  const want = Math.min(w / 1280, h / 720);
  expect(Math.abs(r.k - want) < 0.01 && r.left >= -0.5 && r.top >= -0.5 && r.left + r.sw <= w + 0.5 && r.top + r.sh <= h + 0.5, `${w}x${h}: stage scaled ${r.k.toFixed(3)} and inside the window`);
  expect(!r.scroll, `${w}x${h}: no scrollbars`);
  const order = [r.topbar, r.instruction, r.card, r.feedback];
  const stacked = order.every((b, i) => i === 0 || b.y >= order[i - 1].y + order[i - 1].h - 0.5);
  expect(stacked && Math.round(r.card.x) === 179 && Math.round(r.card.w) === 922 && Math.round(r.feedback.y) === 596 && Math.round(r.feedback.h) === 96,
    `${w}x${h}: zones in place, no overlap (card ${Math.round(r.card.x)}+${Math.round(r.card.w)}, feedback y ${Math.round(r.feedback.y)})`);
  expect(!r.clipped.length, `${w}x${h}: no clipped text${r.clipped.length ? ' (' + r.clipped.join(', ') + ')' : ''}`);
  expect(!page.errors.length, `${w}x${h}: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
  if (w === 1024) { await page.goto(BASE + '?demo=1&fb=hint', { waitUntil: 'networkidle0' }); await shot(page, 'scaled-1024.png'); }
  await page.close();
}

/* ---- 2. feedback row states ---- */
console.log('\n2. feedback row states');
const EXPECT = { hint: [89, 89, 89], correct: [46, 110, 118], wrong: [204, 0, 0], neutral: [37, 87, 119], pause: [37, 87, 119] };
for (const state of Object.keys(EXPECT)) {
  const page = await open(BASE + `?demo=1&fb=${state}`);
  const r = await page.evaluate(() => {
    const row = document.querySelector('.w-feedback');
    return { state: row.dataset.state, icon: !!row.querySelector('.w-fb-icon svg'), prefix: row.querySelector('.w-fb-prefix').textContent.trim(),
      text: row.querySelector('.w-fb-text').textContent.trim(), color: getComputedStyle(row).color, live: row.querySelector('[aria-live]')?.getAttribute('aria-live'),
      pager: !row.querySelector('.w-pager').hidden, pagerLabel: row.querySelector('.w-pager-label').textContent };
  });
  const rgb = r.color.match(/\d+/g).map(Number).slice(0, 3);
  const words = r.state === 'correct' || r.state === 'wrong' ? !!r.prefix : true;
  expect(r.state === state && r.icon && r.text && words && rgb.join() === EXPECT[state].join() && r.live === 'polite',
    `${state}: icon + ${r.prefix ? 'word "' + r.prefix + '" + ' : ''}text + colour rgb(${rgb.join(',')})${r.pager ? ', paged ' + r.pagerLabel : ''}`);
  await shot(page, `demo-${state}.png`);
  await page.close();
}

/* ---- 3. keyboard: menu, focus trap, Escape, start over confirm ---- */
console.log('\n3. keyboard: menu and dialogs');
{
  const page = await open(BASE + '?demo=1&fb=hint');
  let reached = false;
  for (let i = 0; i < 25 && !reached; i++) { await press(page, 'Tab'); reached = (await active(page)).cls.includes('w-menu-btn'); }
  expect(reached, 'Tab reaches the Menu button');
  await press(page, 'Enter');
  const opened = await page.evaluate(() => !document.querySelector('.w-menu-overlay').hidden && document.querySelector('.w-panel').contains(document.activeElement)
    && document.querySelector('.w-panel').getAttribute('role') === 'dialog' && document.querySelector('.w-panel').getAttribute('aria-modal') === 'true');
  expect(opened, 'Enter opens the menu (role dialog, aria-modal) and focus moves into it');
  await shot(page, 'menu-open.png');
  let trapped = true;
  for (let i = 0; i < 40; i++) { await press(page, 'Tab'); trapped = trapped && await page.evaluate(() => document.querySelector('.w-panel').contains(document.activeElement)); }
  for (let i = 0; i < 10; i++) { await page.keyboard.down('Shift'); await press(page, 'Tab'); await page.keyboard.up('Shift'); trapped = trapped && await page.evaluate(() => document.querySelector('.w-panel').contains(document.activeElement)); }
  expect(trapped, 'focus stays trapped in the menu (40 Tab, 10 Shift+Tab)');
  await press(page, 'Escape');
  const closed = await page.evaluate(() => document.querySelector('.w-menu-overlay').hidden && document.activeElement.classList.contains('w-menu-btn'));
  expect(closed, 'Escape closes the menu and focus returns to the Menu button');
  await press(page, 'Enter');
  await page.focus('.w-startover');
  await press(page, 'Enter');
  const dlg = await page.evaluate(() => {
    const d = document.querySelector('.w-dialog');
    return d && d.getAttribute('role') === 'alertdialog' && d.getAttribute('aria-modal') === 'true' && d.contains(document.activeElement) && document.activeElement.dataset.action === 'cancel';
  });
  expect(dlg, 'Start over opens the in-page confirm (alertdialog), focus on Cancel');
  await shot(page, 'menu-startover-confirm.png');
  let dtrap = true;
  for (let i = 0; i < 6; i++) { await press(page, 'Tab'); dtrap = dtrap && await page.evaluate(() => document.querySelector('.w-dialog').contains(document.activeElement)); }
  expect(dtrap, 'focus stays trapped in the confirm');
  await page.focus('.w-dialog [data-action="cancel"]');
  await press(page, 'Enter');
  const cancelled = await page.evaluate(() => !document.querySelector('.w-dialog') && !document.querySelector('.w-menu-overlay').hidden && document.activeElement.classList.contains('w-startover'));
  expect(cancelled, 'Cancel closes the confirm, the menu stays open, focus returns to Start over');
  await page.focus('.w-startover');
  await press(page, 'Enter');
  await press(page, 'Escape');
  const escCancel = await page.evaluate(() => !document.querySelector('.w-dialog') && document.activeElement.classList.contains('w-startover'));
  expect(escCancel, 'Escape in the confirm acts as Cancel');
  expect(!page.errors.length, 'no console errors during the keyboard run' + (page.errors.length ? ': ' + page.errors.join(' | ') : ''));
  await page.close();
}

/* ---- 4. progress bar, segment buttons, chapter map, reload ---- */
console.log('\n4. progress bar and lesson navigation');
{
  const page = await open(BASE + '?reset=1');
  const prog = () => page.evaluate(() => ({
    readout: document.querySelector('.w-topbar-line').textContent,
    segs: [...document.querySelectorAll('.w-seg')].map((s) => ({ n: s.dataset.chapter, status: s.dataset.status, label: s.getAttribute('aria-label'), disabled: s.getAttribute('aria-disabled'), current: s.getAttribute('aria-current') })),
    screen: window.__l4.current,
  }));
  let p = await prog();
  expect(p.screen === 'S01' && p.segs.length === 7, `fresh start at S01, ${p.segs.length} segments: "${p.readout}"`);
  expect(/^Start/.test(p.readout) && !/Chapter 0/.test(p.readout + p.segs[0].label), `entry chapter shows as Start, no number: "${p.readout}" / "${p.segs[0].label}"`);
  expect(p.segs[0].current === 'step' && p.segs[0].status === 'current' && p.segs[5].disabled === 'true' && p.segs[2].status === 'notInPilot',
    `segment states: ch0 ${p.segs[0].status}, ch1 ${p.segs[1].status}, ch2 ${p.segs[2].status}, ch5 ${p.segs[5].status}`);
  await shot(page, 'progress-ch0.png');
  // S01 right answer, S02 saved, FT1 skipped (the walk script covers every path in detail)
  await page.click('.w-opt[data-id="b"]');
  await page.click('.w-fb-actions [data-action="continue"]');
  await page.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries');
  await page.type('.w-input[data-store="L4_CASE_PROBLEM"]', 'Today summaries take hours.');
  await page.click('[data-action="save"]');
  await page.click('.w-fb-actions [data-action="continue"]');
  await page.click('[data-action="skipChallenge"]');
  p = await prog();
  expect(p.screen === 'V1' && p.segs[0].status === 'done' && p.segs[1].status === 'current', `after S01, S02 and the FT1 skip: at V1, "${p.readout}"`);
  expect(p.segs[0].label && /completed/.test(p.segs[0].label), `screen reader label: "${p.segs[0].label}"`);
  // keyboard on the segment buttons
  await page.focus('.w-seg[data-chapter="5"]');
  const tip = await page.evaluate(() => { const t = document.querySelector('.w-tip'); return t.hidden ? '' : t.textContent; });
  expect(tip.includes('\n'), `locked segment tooltip on focus: "${tip.replace('\n', ' / ')}"`);
  await press(page, 'Enter');
  expect((await prog()).screen === 'V1', 'Enter on a locked chapter does nothing');
  await press(page, 'Escape');
  expect(await page.evaluate(() => document.querySelector('.w-tip').hidden), 'Escape hides the tooltip');
  await page.focus('.w-seg[data-chapter="0"]');
  await press(page, 'Enter');
  p = await prog();
  expect(p.screen === 'S01', 'Enter on a completed chapter jumps to its first screen (revisit)');
  const focusAfter = await page.evaluate(() => document.activeElement.classList.contains('w-instruction'));
  expect(focusAfter, 'focus moves to the instruction heading after the jump');
  await page.focus('.w-seg[data-chapter="1"]');
  await press(page, ' ');
  expect((await prog()).screen === 'FT1', 'Space on the current chapter jumps to its first screen');
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__l4);
  // move on to V1 again to set up the mid-chapter screenshot
  const resumed = await page.evaluate(() => !!document.querySelector('.w-dialog') && window.__l4.current === 'FT1' && window.__l4.state.d.length === 3);
  expect(resumed, 'reload: resume prompt shows, place (FT1) and done screens (3) kept');
  await page.click('.w-dialog [data-action="resume"]');
  await page.evaluate(() => window.__l4.go('V1'));
  await shot(page, 'progress-ch1-mid.png');
  await page.click('.w-menu-btn');
  const map = await page.evaluate(() => [...document.querySelectorAll('.w-chapter')].map((c) => c.dataset.status + ':' + c.querySelectorAll('button.w-screen-btn').length));
  expect(map.join() === 'done:2,current:2,notInPilot:0,notInPilot:0,notInPilot:0,locked:0,notInPilot:0', `menu chapter map (status:clickable screens): ${map.join(' ')}`);
  await shot(page, 'menu-chapter-map.png');
  await page.click('.w-screen-btn[data-done], .w-screen[data-done="true"] button');
  expect((await prog()).screen === 'S01', 'a completed screen in the map is clickable (revisit)');
  expect(!page.errors.length, 'no console errors during the navigation run' + (page.errors.length ? ': ' + page.errors.join(' | ') : ''));
  await page.close();
}

/* ---- 5. slice screens: fit and space distribution (P1) ---- */
console.log('\n5. slice screens: fit and space distribution');
for (const id of ['S01', 'S02', 'FT1', 'S03']) {
  for (const size of SIZES) {
    const page = await open(BASE + `?reset=1&screen=${id}`, size);
    const m = await page.evaluate(measureLayout);
    const [w, h] = size;
    expect(m.gapRatio <= MAX_GAP_RATIO, `${id} ${w}x${h}: largest empty band in the card ${m.maxGap}px = ${Math.round(m.gapRatio * 100)}% (max ${MAX_GAP_RATIO * 100}%)`);
    expect(!m.overlaps.length && !m.outside.length && !m.fbOverflow, `${id} ${w}x${h}: card content inside the card, nothing over the feedback row${m.overlaps.concat(m.outside).length ? ' (' + m.overlaps.concat(m.outside).join(', ') + ')' : ''}`);
    expect(!m.clipped.length, `${id} ${w}x${h}: no clipped text${m.clipped.length ? ' (' + m.clipped.join(', ') + ')' : ''}`);
    expect(!page.errors.length, `${id} ${w}x${h}: no console errors${page.errors.length ? ': ' + page.errors.join(' | ') : ''}`);
    await page.close();
  }
}

await browser.close();
server.close();
console.log(fails.length ? `\ntest:fit FAILED (${fails.length})` : '\ntest:fit passed');
process.exit(fails.length ? 1 : 0);
