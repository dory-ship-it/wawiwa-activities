// PP1 personal path test (npm run test:adapt).
//  A. the level logic (src/adapt.js) in Node: five personas, one per journey, and the edges (the
//     thresholds, missing data, a stretch or support learner who drops back, the merge of a variant)
//  B. the real engine in Chrome, local mode (?reset=1&debug=1): each of the five journeys walked end to
//     end, O1 to END (every slice screen opened in order, the graded items answered as the persona would,
//     the click screens S10, S11, S14 and S15 by clicking the variant's answers): the variant shown on
//     each adaptive screen, the two L4_PATH interactions (once each, neutral, unscored), the correct
//     response sent with the variant's answer, nothing on any screen, in the S22 record or on END that
//     names a level, and the longest suspend_data
//  C. edges on the engine: a jump past a checkpoint (menu or resume), "unanswered counts as not correct",
//     resume mid-chapter (same variant, no second L4_PATH), Back after a checkpoint, an S21R review link,
//     the QA switches only with ?debug=1 or ?review=1
// Usage: npm run test:adapt            (add --part=A to run the Node part only)
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, ROOT } from './serve.mjs';
import { chromePath } from './lib.mjs';
import { LEVELS, JOURNEYS, tally, levelAt, journeyOf, merge, variantOf } from '../src/adapt.js';

const PART = (process.argv.find((a) => a.startsWith('--part=')) || '').slice(7);
const C = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const S = Object.fromEntries(C.screens.map((s) => [s.id, s]));
const [CP1, CP2] = C.lesson.adapt.checkpoints;
const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };
const expect = (cond, m) => (cond ? ok(m) : fail(m));

// a persona: how many of each checkpoint's items it gets right on the first try (the first n right)
const PERSONAS = {
  1: { name: 'strong all through', c4: 9, c5: 4 },
  2: { name: 'strong, then slips', c4: 8, c5: 2 },
  3: { name: 'in the middle', c4: 6, c5: 4 },
  4: { name: 'unsure, then catches up', c4: 3, c5: 2 },
  5: { name: 'unsure all through', c4: 2, c5: 1 },
};
// results by tracking id: the first n correct, the rest wrong
const resultsOf = (items, n) => Object.fromEntries(items.map((id, i) => [id, i < n ? 'correct' : 'wrong']));
const firstFrom = (res) => (id) => (res[id] ? { result: res[id] } : null);

/* ---------- A. the level logic ---------- */
console.log('\nA. level logic (src/adapt.js)');
for (const [j, p] of Object.entries(PERSONAS)) {
  const c4 = levelAt(CP1, tally(CP1.items, firstFrom(resultsOf(CP1.items, p.c4))));
  const c5 = levelAt(CP2, tally(CP2.items, firstFrom(resultsOf(CP2.items, p.c5))), c4);
  expect(c4 === JOURNEYS[j][0] && c5 === JOURNEYS[j][1] && journeyOf({ c4, c5 }) === Number(j),
    `persona ${j} (${p.name}: ${p.c4}/9, then ${p.c5}/4) = ${c4} > ${c5}, journey ${journeyOf({ c4, c5 })}`);
}
const at1 = (answered, correct) => levelAt(CP1, { answered, correct });
const at2 = (prev, answered, correct) => levelAt(CP2, { answered, correct }, prev);
const cases = [
  ['CP1 9 of 9 = stretch', at1(9, 9), 'stretch'], ['CP1 8 of 9 = stretch', at1(9, 8), 'stretch'], ['CP1 7 of 9 = core', at1(9, 7), 'core'],
  ['CP1 5 of 9 = core', at1(9, 5), 'core'], ['CP1 4 of 9 = support', at1(9, 4), 'support'], ['CP1 0 of 9 = support', at1(9, 0), 'support'],
  ['CP1 5 answered, all right = core (missing data)', at1(5, 5), 'core'], ['CP1 6 answered, 6 right = core (3 unanswered count as not correct)', at1(6, 6), 'core'],
  ['CP1 6 answered, 4 right = support', at1(6, 4), 'support'], ['CP1 nothing answered = core', at1(0, 0), 'core'],
  ['CP2 stretch, 4 of 4 = stretch', at2('stretch', 4, 4), 'stretch'], ['CP2 stretch, 3 of 4 = stretch', at2('stretch', 4, 3), 'stretch'],
  ['CP2 stretch, 2 of 4 = core', at2('stretch', 4, 2), 'core'], ['CP2 stretch, 3 answered, 3 right = stretch', at2('stretch', 3, 3), 'stretch'],
  ['CP2 stretch, 2 answered = core (missing data)', at2('stretch', 2, 2), 'core'],
  ['CP2 support, 0 of 4 = support', at2('support', 4, 0), 'support'], ['CP2 support, 1 of 4 = support', at2('support', 4, 1), 'support'],
  ['CP2 support, 2 of 4 = core', at2('support', 4, 2), 'core'], ['CP2 support, 3 answered, 0 right = support', at2('support', 3, 0), 'support'],
  ['CP2 support, 2 answered, 0 right = core (missing data)', at2('support', 2, 0), 'core'],
  ['CP2 core, 4 of 4 = core', at2('core', 4, 4), 'core'], ['CP2 core, 0 of 4 = core', at2('core', 4, 0), 'core'],
];
for (const [what, got, want] of cases) expect(got === want, `${what}${got === want ? '' : ` (got ${got})`}`);
const t = tally(['A', 'B', 'C', 'D'], (id) => ({ A: { result: 'correct' }, B: { result: 'wrong' }, C: { result: 'correct' } }[id] || null));
expect(t.answered === 3 && t.correct === 2, 'tally: answered 3, correct 2 (a missing item is not answered)');
expect(journeyOf({ c4: 'core', c5: 'stretch' }) === null && journeyOf({ c4: 'stretch' }) === null, 'journeyOf: no journey for core > stretch or a missing level');
const m = merge({ a: 1, o: { x: 1, y: 2 }, list: [1, 2], keep: 'k' }, { a: 2, o: { y: 3 }, list: [9], band: null });
expect(m.a === 2 && m.o.x === 1 && m.o.y === 3 && m.list.join() === '9' && m.keep === 'k' && m.band === null, 'merge: objects key by key, arrays and values replace, null clears');
expect(variantOf(S.S11, 'core') === S.S11 && !('variants' in variantOf(S.S11, 'stretch')) && variantOf(S.S03, 'stretch') === S.S03, 'variantOf: core and a screen without variants are the screen itself; a variant drops the variants key');
expect(LEVELS.join() === 'support,core,stretch', 'three levels');

if (PART === 'A') finish();

/* ---------- B. the five journeys, end to end, on the real engine (local mode) ---------- */
const server = await startServer(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--disable-extensions', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
async function open(query, { context = null } = {}) {
  const ctx = context || await browser.createBrowserContext();
  const page = await ctx.newPage();
  page.ctx = ctx;
  page.errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') page.errors.push(msg.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(BASE + query, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__l4 && window.__l4.current);
  return page;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const go = (p, id) => p.evaluate((x) => window.__l4.go(x), id);
const pathEvents = (p) => p.evaluate(() => window.__l4.tracking.events.filter((e) => e.kind === 'answer' && /^L4_PATH_/.test(e.trackingId)).map((e) => ({ id: e.trackingId, type: e.type, response: e.response, result: e.result, scored: e.scored, correctResponse: e.correctResponse })));
// the level a screen shows, read from the page: whose hint is on screen (each level's hint differs)
const HINTS = Object.fromEntries(C.screens.filter((s) => s.variants).map((s) => [s.id, Object.fromEntries(LEVELS.map((lv) => [lv, variantOf(s, lv).hint]))]));
const shownLevel = (p, id) => p.evaluate((hints) => {
  const text = document.querySelector('.w-stage').textContent;
  return Object.entries(hints).filter(([, h]) => text.includes(h)).map(([lv]) => lv).join('+') || 'none';
}, HINTS[id]);
// FULL HIDING: nothing in the stage's markup names a level or the path
const LEAK = /\b(stretch|support|journey)\b|L4_PATH|data-level|personal path/i;
const leakOf = (p) => p.evaluate((src) => { const m = new RegExp(src, 'i').exec(document.querySelector('.w-stage').outerHTML); return m ? m[0] : null; }, LEAK.source);
// one graded item answered through the engine (as its template would): result by plan
const answer = (p, sid, tid, result, response = 'x') => p.evaluate((a, b, c, d) => window.__l4.answer(a, { trackingId: b, response: d, result: c }), sid, tid, result, response);
const screenOf = Object.fromEntries(C.screens.flatMap((s) => [...(s.tracking || []).map((x) => [x.id, s.id]), ...(s.stops || []).map((x) => [x.tracking.id, s.id])]));
const CLICK = new Set(['S10', 'S11', 'S14', 'S15']); // decision screens: the persona clicks on the page

const maxSuspend = (p) => p.evaluate(() => Math.max(0, ...window.__l4.tracking.calls.map((l) => /cmi\.suspend_data \((\d+)\)/.exec(l)).filter(Boolean).map((x) => Number(x[1]))));

console.log('\nB. the five journeys, O1 to END, local mode');
for (const [j, persona] of Object.entries(PERSONAS)) {
  const [l4, l5] = JOURNEYS[j];
  const plan = { ...resultsOf(CP1.items, persona.c4), ...resultsOf(CP2.items, persona.c5) };
  const p = await open('?reset=1&debug=1');
  const shown = {}, leaks = [], sent = [];
  for (const id of C.lesson.slice) {
    await go(p, id);
    const leak = await leakOf(p);
    if (leak) leaks.push(`${id}: "${leak}"`);
    if (S[id].variants) shown[id] = await shownLevel(p, id);
    // the graded items on this screen, as the persona answers them
    for (const tid of Object.keys(plan).filter((x) => screenOf[x] === id)) {
      const want = plan[tid];
      if (CLICK.has(id)) {
        const x = variantOf(S[id], shown[id]);
        const pick = x.options.find((o) => o.correct === (want === 'correct')).id;
        await p.click(`.w-opt[data-id="${pick}"]`);
        const ev = await p.evaluate((x) => window.__l4.tracking.events.filter((e) => e.kind === 'answer' && e.trackingId === x).pop(), tid);
        sent.push(ev && ev.result === want && ev.correctResponse === x.tracking[0].correctResponse ? null : `${id}: sent ${ev && ev.result} / ${ev && ev.correctResponse}, want ${want} / ${x.tracking[0].correctResponse}`);
      } else {
        await answer(p, id, tid, want);
      }
    }
    if (id === 'S21') { // the check, the same for everyone: all right, then its end
      for (const it of S.S21.items) await answer(p, 'S21', it.trackingId, 'correct');
      await p.evaluate(() => { window.__l4.checkDone(); window.__l4.complete('S21'); });
    }
  }
  // S22: the downloadable record, read from the blob the download makes
  await go(p, 'S22');
  await p.click('.w-takeaway[data-id="a"]');
  await p.click('.w-next');
  await p.evaluate(() => { window.__blob = null; const make = URL.createObjectURL; URL.createObjectURL = (b) => { window.__blob = b; return make.call(URL, b); }; });
  await p.click('[data-action="download"]');
  await p.waitForFunction(() => window.__blob);
  const record = await p.evaluate(() => window.__blob.text());
  await p.evaluate(() => window.__l4.finishLesson());
  await go(p, 'END');
  const endLeak = await leakOf(p);
  const ev = await pathEvents(p);
  const state = await p.evaluate(() => window.__l4.state.p);
  const suspend = await maxSuspend(p);
  const want = Object.fromEntries(C.screens.filter((s) => s.variants).map((s) => [s.id, s.chapter === CP1.chapter ? l4 : l5]));
  const wrongShown = Object.entries(want).filter(([id, lv]) => shown[id] !== lv).map(([id, lv]) => `${id} shows ${shown[id]}, want ${lv}`);
  console.log(`  journey ${j} (${persona.name}): ${l4} > ${l5}`);
  expect(!wrongShown.length, `journey ${j}: the eight adaptive screens show ${Object.entries(shown).map(([id, lv]) => id + ' ' + lv).join(', ')}${wrongShown.length ? ' (' + wrongShown.join('; ') + ')' : ''}`);
  expect(ev.length === 2 && ev[0].id === 'L4_PATH_C4' && ev[0].response === l4 && ev[1].id === 'L4_PATH_C5' && ev[1].response === l5 && ev.every((e) => e.type === 'fill-in' && e.result === 'neutral' && !e.scored && e.correctResponse === null),
    `journey ${j}: L4_PATH_C4 = ${ev[0]?.response}, L4_PATH_C5 = ${ev[1]?.response}, once each, fill-in, neutral, unscored (${ev.length} sent)`);
  expect(state && state.c4 === l4 && state.c5 === l5, `journey ${j}: state.p = ${JSON.stringify(state)}`);
  expect(!sent.filter(Boolean).length, `journey ${j}: the clicked answers went out with the shown variant's correct response${sent.filter(Boolean).length ? ': ' + sent.filter(Boolean).join('; ') : ''}`);
  expect(!leaks.length && !endLeak && !LEAK.test(record), `journey ${j}: no screen, no S22 record and no END names a level or the path${leaks.length || endLeak ? ': ' + [...leaks, endLeak].filter(Boolean).join('; ') : ''}`);
  expect(suspend > 0 && suspend < 4096, `journey ${j}: longest suspend_data ${suspend} characters (limit 4096)`);
  expect(!p.errors.length, `journey ${j}: no console errors${p.errors.length ? ': ' + p.errors.slice(0, 3).join(' | ') : ''}`);
  await p.ctx.close();
}

/* ---------- C. edges on the engine ---------- */
console.log('\nC. edges');
{
  // a jump past both checkpoints (a menu or a resume can land on S14): 5 of 9 answered = core, then core;
  // both checkpoints fire, in order, on that one screen
  const p = await open('?reset=1&debug=1');
  for (const tid of CP1.items.slice(0, 5)) await answer(p, screenOf[tid], tid, 'correct');
  await go(p, 'S14');
  const ev = await pathEvents(p);
  expect(ev.map((e) => e.id + '=' + e.response).join() === 'L4_PATH_C4=core,L4_PATH_C5=core' && (await shownLevel(p, 'S14')) === 'core',
    `jump to S14 with 5 of 9 answered: ${ev.map((e) => e.id + '=' + e.response).join(', ')}, S14 shows ${await shownLevel(p, 'S14')}`);
  await p.ctx.close();
}
{
  // 6 of 9 answered, 4 right: the 3 unanswered count as not correct = support
  const p = await open('?reset=1&debug=1');
  for (const [i, tid] of CP1.items.slice(0, 6).entries()) await answer(p, screenOf[tid], tid, i < 4 ? 'correct' : 'wrong');
  await go(p, 'W3');
  const ev = await pathEvents(p);
  expect(ev.length === 1 && ev[0].response === 'support', `6 of 9 answered, 4 right, entering W3: L4_PATH_C4 = ${ev[0]?.response} (only C4 so far: ${ev.length})`);
  await p.ctx.close();
}
{
  // resume mid-chapter: a stretch learner at S11 leaves and comes back (localStorage): same variant,
  // no second L4_PATH; then Back across the checkpoint and a retry of an S08 round change nothing
  const context = await browser.createBrowserContext();
  let p = await open('?reset=1&debug=1', { context });
  for (const tid of CP1.items) await answer(p, screenOf[tid], tid, 'correct');
  for (const id of ['W3', 'V2', 'S09', 'S10', 'S11']) await go(p, id);
  const before = await shownLevel(p, 'S11');
  await p.close();
  p = await open('?debug=1', { context });
  await wait(300);
  const dialog = await p.evaluate(() => !!document.querySelector('.w-dialog'));
  const after = await p.evaluate(() => window.__l4.current);
  const evResume = await pathEvents(p);
  expect(dialog && after === 'S11' && before === 'stretch' && (await shownLevel(p, 'S11')) === 'stretch' && !evResume.length,
    `resume at S11: the resume prompt, S11 again, stretch before and after, ${evResume.length} L4_PATH sent on the new launch`);
  await p.evaluate(() => { document.querySelector('.w-dialog [data-action="resume"]')?.click(); });
  for (let i = 0; i < 5; i++) await p.evaluate(() => window.__l4.prev()); // S11 > S10 > S09 > V2 > W3 > S08B
  await answer(p, 'S08', 'L4_S08_1', 'wrong'); // a later attempt: a retry, never a first answer
  const retry = await p.evaluate(() => window.__l4.tracking.events.filter((e) => e.trackingId === 'L4_S08_1').map((e) => e.kind).join());
  for (const id of ['W3', 'V2', 'S09']) await go(p, id);
  const s09 = await shownLevel(p, 'S09');
  const p2 = await p.evaluate(() => window.__l4.state.p);
  expect(retry === 'retry' && s09 === 'stretch' && p2.c4 === 'stretch' && !(await pathEvents(p)).length,
    `Back to Chapter 3 after the checkpoint, an S08 retry (${retry}), then forward: S09 still ${s09}, state.p.c4 ${p2.c4}, no new L4_PATH`);
  // S21R's review link: "Back to the check" mode opens the same variant
  await p.evaluate(() => { window.__l4.backTo = 'S21R'; window.__l4.go('S11'); });
  expect((await shownLevel(p, 'S11')) === 'stretch', `S21R review link to S11 (Back to the check): ${await shownLevel(p, 'S11')}`);
  await context.close();
}
{
  // the QA switches: ignored without ?debug=1 or ?review=1; ?path= in debug sets the journey
  let p = await open('?reset=1&level=stretch&path=1&screen=S11');
  const f = await p.evaluate(() => window.__l4.forced);
  expect(!f.level && !f.path && (await shownLevel(p, 'S11')) === 'core', `?level=stretch&path=1 without debug or review: ignored, S11 shows ${await shownLevel(p, 'S11')}`);
  await p.ctx.close();
  p = await open('?reset=1&debug=1&path=4&screen=S09');
  const a = await shownLevel(p, 'S09');
  await go(p, 'S16');
  const b = await shownLevel(p, 'S16');
  const ev = await pathEvents(p);
  expect(a === 'support' && b === 'core' && ev.map((e) => e.response).join() === 'support,core', `?debug=1&path=4: S09 ${a}, S16 ${b}, L4_PATH ${ev.map((e) => e.response).join(' > ')}`);
  await p.ctx.close();
  p = await open('?review=1&level=support&screen=S17');
  const r = await shownLevel(p, 'S17');
  const rv = await p.evaluate(() => ({ p: window.__l4.state.p, path: window.__l4.tracking.events.filter((e) => /^L4_PATH/.test(e.trackingId || '')).length }));
  expect(r === 'support' && !rv.p && !rv.path, `?review=1&level=support: S17 ${r}; review mode sets no level and sends no L4_PATH`);
  await p.ctx.close();
}

await browser.close();
server.close();
finish();

function finish() {
  console.log(fails.length ? `\ntest:adapt FAILED (${fails.length})` : '\ntest:adapt passed');
  process.exit(fails.length ? 1 : 0);
}
