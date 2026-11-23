// DM M2 L2: the keyboard-only walk of the whole lesson (O1 to END), run by the kit's tools/walk.mjs (npm run walk;
// npm run test:scorm = the same path against the mock SCORM 1.2 API). The helpers and the checks every walk makes are
// the kit's (tools/walk-lib.mjs); the path and what each screen must show are this lesson's.
// Also: the chapters menu and the coach by keyboard, a workbook link opening in a new tab while the lesson keeps its
// place, a reload that comes back with the resume prompt, and (kit 0.1.0) the score from the questions along the
// lesson: this path answers 9 of the 24 scored questions wrong, so it ends under the pass mark: failed, no retake.
import { SCORM, MOCK, C, UI, S, fails, ok, fail, expect, wait, browser, open, press, shiftTab, isActive, tabTo, act, text, nextState, events, band, expectBand, expectLayout, arrive, expectOpen, goNext, newTabFrom, workbookStop, fast, finishRun, configureSrc } from '../tools/walk-lib.mjs';

/* ---------- the path ---------- */
console.log(SCORM ? '\nmain path in an LMS (mock SCORM 1.2 API)' : '\nmain path, keyboard only');
// (18 Nov 2026: the live coach is wired) ?live=0: the walk runs without the network, on the coach's offline tips
const page = await open('?reset=1&live=0', { lms: SCORM ? {} : null });
if (SCORM) expect(await page.evaluate(() => window.__l4.tracking.mode) === 'scorm12', 'SCORM: the API is found, the scorm12 adapter runs');

/* Opening */
await arrive(page, 'O1');
{
  const o = await page.evaluate(() => ({ kicker: document.querySelector('.w-title-program').textContent, quote: document.querySelector('.w-title-quote').textContent, sub: !!document.querySelector('.w-title-sub'), footer: getComputedStyle(document.querySelector('.w-footer')).display }));
  expect(o.kicker === S.O1.kicker && S.O1.quote.includes(o.quote) && !o.sub, `O1: "${o.kicker}", the quote, no subtitle`);
  await act(page, '[data-action="start"]');
}
await arrive(page, 'O2');
{
  // the four components as tabs: arrows move, Enter opens; today's (03) is open on arrival
  await tabTo(page, '.w-map-tab');
  const open0 = await page.evaluate(() => document.querySelector('.w-map-tab[aria-selected="true"]').dataset.station);
  for (const st of S.O2.stations) {
    await press(page, 'Home');
    await press(page, 'ArrowRight', S.O2.stations.indexOf(st));
    await press(page, 'Enter');
    const t = await text(page, '.w-map-panel-text');
    expect(t === st.text, `O2: ${st.n} ${st.kicker} opens "${t}"`);
  }
  // (Noy, 15 Nov 2026) the number shows once, in the disc; under it the name only
  const twice = await page.evaluate(() => [...document.querySelectorAll('.w-map-labels')].some((l) => /\d/.test(l.textContent)));
  expect(!twice, 'O2: no number under a disc (the number is in the disc only)');
  const marks = await page.evaluate(() => [...document.querySelectorAll('.w-map-tab')].map((b) => b.dataset.status).join());
  expect(open0 === 'c3' && marks === 'done,done,today,next' && !(await page.$('.w-map-cue')), `O2: 03 open on arrival, statuses ${marks}, no "later" chip`);
  await expectLayout(page, 'O2 04 open');
  await goNext(page);
}
await arrive(page, 'O3');
{
  const closed = await page.evaluate(() => [...document.querySelectorAll('.d-bring-out')].map((o) => o.textContent.trim()).join('|'));
  expect(closed === Array(3).fill(UI.dm.rowClosed).join('|') && !(await page.$('.d-bring input, .d-bring textarea')), 'O3: the three right cells are hidden on arrival, no input field');
  for (const [i, r] of S.O3.rows.entries()) {
    await act(page, `.d-bring-btn[data-row="${r.id}"]`);
    const out = await page.evaluate((k) => { const o = document.querySelectorAll('.d-bring-out')[k]; return { text: (o.querySelector('.d-bring-becomes, .d-keyline p')?.textContent || ''), key: !!o.querySelector('.d-keyline'), expanded: o.previousElementSibling.getAttribute('aria-expanded') }; }, i);
    expect(out.text === (r.keyLine || r.becomes) && out.key === !!r.keyLine && out.expanded === 'true', `O3 row ${i + 1}: opens "${out.text}"${r.keyLine ? ' (the key line)' : ''}`);
    const n = await nextState(page);
    expect(n.locked === (i < 2), `O3: Next ${i < 2 ? 'still locked' : 'unlocked'} after ${i + 1} of 3 rows`);
  }
  await expectLayout(page, 'O3 all rows open');
  await goNext(page);
}
await workbookStop(page, 'WB0');

/* Where are we? */
await arrive(page, 'W3');
{
  const o = await page.evaluate(() => ({ num: document.querySelector('.d-opener-num')?.textContent, label: document.querySelector('.d-opener-label')?.textContent, points: [...document.querySelectorAll('.w-stop-body b')].map((b) => b.textContent).join(' · '), mins: /\bmin/i.test(document.querySelector('.w-main').textContent) }));
  const icons = await page.evaluate(() => document.querySelectorAll('.w-stops[data-icons="true"] .w-stop-icon svg').length);
  expect(o.num === '3' && o.points === '' && icons === S.W3.points.length && !o.mins, `W3: the number ${o.num}, "${o.label}", ${icons} icons without words, no minutes`);
  await goNext(page);
}
await arrive(page, 'CALL');
{
  // the client's call (22 Nov 2026): the phone rings, Answer starts the recording, its lines appear as they are said
  const s = S.CALL;
  const start = await page.evaluate(() => ({ state: document.querySelector('.d2-call-phone').dataset.state, who: document.querySelector('.d2-call-who').textContent, shown: [...document.querySelectorAll('.d2-call-line')].filter((p) => !p.hidden).length }));
  expect(start.state === 'ringing' && start.who === s.call.caller && start.shown === 0, `CALL: the phone rings, "${start.who}" on its screen, no line of the call shown yet`);
  await expectLayout(page, 'CALL ringing');
  await page.waitForFunction(() => document.querySelector('.d2-audio').readyState >= 1);
  await act(page, '[data-action="callAnswer"]');
  await page.evaluate(() => { const a = document.querySelector('.d2-audio'); a.muted = true; a.currentTime = a.duration - 0.4; a.play(); });
  await page.waitForFunction(() => document.querySelector('.w-next').dataset.locked === 'false', { timeout: 15000 }).catch(() => {});
  const end = await page.evaluate(() => ({ state: document.querySelector('.d2-call-phone').dataset.state, lines: [...document.querySelectorAll('.d2-call-line')].filter((p) => !p.hidden).map((p) => p.textContent) }));
  expect(end.state === 'ended' && JSON.stringify(end.lines) === JSON.stringify(s.call.script), `CALL: the call ended, all ${end.lines.length} lines of the client are on screen`);
  await expectOpen(page, 'CALL heard to the end');
  await expectLayout(page, 'CALL ended');
  await goNext(page);
}
await arrive(page, 'S05');
{
  const tiles = S.S05.tiles;
  const answers = { 1: ['y'], 2: ['web', 'social'], 3: ['web', 'brand'], 4: [] };
  for (const t of tiles) {
    await act(page, `.d-tile-head[data-tile="${t.n}"]`);
    const one = await page.evaluate(() => document.querySelectorAll('.d-tile[data-open="true"]').length);
    const done0 = await page.evaluate(() => { const b = document.querySelector('.d-tile[data-open="true"] [data-action="tileDone"]'); return { off: b.disabled, label: b.textContent.trim() }; });
    expect(one === 1 && (t.kind === 'text' ? !done0.off : done0.off && done0.label === UI.dm.chooseFirst), `S05 tile ${t.n}: one tile open, Done ${done0.off ? `locked "${done0.label}"` : 'ready'}`);
    for (const v of answers[t.n]) await act(page, `.d-tile[data-open="true"] .d-chip[data-value="${v}"]`, 'Space');
    if (t.n === 1) {
      await page.waitForFunction(() => { const i = document.querySelector('.d-tile-proof img'); return i && i.complete && i.naturalWidth > 0; }, { timeout: 5000 }).catch(() => {}); // the picture loads when the tile opens
      const proof = await page.evaluate(() => { const f = document.querySelector('.d-tile-proof'); return { shown: !f.hidden, cap: f.querySelector('figcaption').textContent, img: f.querySelector('img').naturalWidth }; });
      expect(proof.shown && proof.cap === t.note && proof.img > 0, `S05 tile 1: after the answer, the Google Analytics screenshot and "${proof.cap}"`);
      await expectLayout(page, 'S05 tile 1 answered');
    }
    if (t.n === 2) {
      // "None yet" stands alone: it clears the others, and another chip clears it
      await act(page, '.d-tile[data-open="true"] .d-chip[data-value="none"]', 'Space');
      const only = await page.evaluate(() => [...document.querySelectorAll('.d-tile[data-open="true"] .d-chip[aria-pressed="true"]')].map((b) => b.dataset.value).join());
      await act(page, '.d-tile[data-open="true"] .d-chip[data-value="web"]', 'Space', { back: true });
      await act(page, '.d-tile[data-open="true"] .d-chip[data-value="social"]', 'Space');
      const two = await page.evaluate(() => [...document.querySelectorAll('.d-tile[data-open="true"] .d-chip[aria-pressed="true"]')].map((b) => b.dataset.value).join());
      expect(only === 'none' && two === 'web,social', `S05 tile 2: "None yet" alone (${only}), then ${two}`);
    }
    await act(page, '.d-tile[data-open="true"] [data-action="tileDone"]');
    const st = await page.evaluate((n) => { const el = document.querySelector(`.d-tile-head[data-tile="${n}"]`).closest('.d-tile'); return { done: el.dataset.done, open: el.dataset.open, sum: el.querySelector('.d-tile-sum').textContent }; }, t.n);
    expect(st.done === 'true' && st.open === 'false' && st.sum.length > 0, `S05 tile ${t.n}: closed with a check and "${st.sum}"`);
  }
  const end = await page.evaluate(() => ({ key: document.querySelector('.d-closing .d-keyline p')?.textContent, line: document.querySelector('.d-closing-line')?.textContent || '', hidden: document.querySelector('.d-closing').hidden }));
  expect(!end.hidden && end.key === S.S05.closing.keyLine && end.line === S.S05.closing.ifMissing.text, `S05 done: the key line "${end.key}" and, without Google Analytics, "${end.line}"`);
  await expectOpen(page, 'S05', { focused: true });
  await expectLayout(page, 'S05 done');
  await goNext(page);
}
await arrive(page, 'S06');
{
  const gaps = [2];
  await tabTo(page, '.d-qc[data-card="1"] [data-action="can"]');
  for (const c of S.S06.cards) {
    const onIt = await isActive(page, `.d-qc[data-card="${c.n}"] [data-action="can"]`);
    const focus = await page.evaluate(() => [...document.querySelectorAll('.d-qc')].map((el) => el.dataset.focus[0] + (el.querySelector('.d-qc-actions').hidden ? '' : '+')).join(' '));
    const wantFocus = S.S06.cards.map((x) => (x.n < c.n ? 'd' : x.n === c.n ? 'a+' : 'w')).join(' ');
    expect(focus === wantFocus, `S06 card ${c.n} in focus alone, with the only buttons (${focus})`);
    if (gaps.includes(c.n)) await press(page, 'Tab'); // from "I can answer" to "Gap"
    await press(page, 'Enter');
    const got = await page.evaluate((n) => { const el = document.querySelector(`.d-qc[data-card="${n}"]`); return { state: el.dataset.state, where: el.querySelector('.d-qc-where')?.lastChild.textContent, chip: el.querySelector('.d-qc-chip')?.textContent.trim() }; }, c.n);
    expect(onIt && got.state === (gaps.includes(c.n) ? 'g' : 'c') && got.where === c.where, `S06 card ${c.n}: "${got.chip}", then "${got.where}"`);
  }
  const end = await page.evaluate(() => ({ key: document.querySelector('.d-closing .d-keyline p')?.textContent, line: document.querySelector('.d-closing-line')?.textContent || '' }));
  expect((await text(page, '.d-band-line')) === S.S06.band && end.key === S.S06.closing.keyLine && end.line === S.S06.closing.ifGap, `S06 done: "${end.key}" and, with a gap, "${end.line}"`);
  await expectOpen(page, 'S06', { focused: true });
  await expectLayout(page, 'S06 done');
  await goNext(page);
}
await workbookStop(page, 'WB1');
await arrive(page, 'VK1');
{
  // the V4 film before the map (22 Nov 2026): no stops, Next opens when the film ends
  const s = S.VK1;
  const head = await page.evaluate(() => ({ title: !!document.querySelector('.w-video-title'), label: document.querySelector('.w-video').getAttribute('aria-label') }));
  expect(!head.title && head.label === s.title, `VK1: the film is named "${head.label}" for screen readers, no title line on screen`);
  await page.waitForFunction(() => document.querySelector('.w-video').readyState >= 2);
  await act(page, '[data-action="bigplay"]');
  await fast(page, () => document.querySelector('.w-next').dataset.locked === 'false', 'VK1 end');
  expect(await page.evaluate(() => document.querySelector('.w-stop-view').hidden), 'VK1: the film ran to its end with no stop');
  await expectOpen(page, 'VK1 ended');
  await goNext(page);
}
await arrive(page, 'K1');
{
  const dims = S.K1.dimensions;
  const first = await page.evaluate(() => ({ kicker: document.querySelector('.d-dim-card .d-dim-kicker').textContent, nums: [...document.querySelectorAll('.d-dim-disc')].some((d) => /\d/.test(d.textContent)), icons: document.querySelectorAll('.d-dim-disc svg').length }));
  expect(first.kicker === `${dims[0].n} · ${dims[0].name}` && !first.nums && first.icons >= 8, `K1 map: eight icon nodes without numbers, the card shows "${first.kicker}"`);
  // arrows move along the nodes; Enter selects
  await tabTo(page, '.d-dim-node');
  await press(page, 'ArrowRight', 2);
  await press(page, 'Enter');
  const third = await page.evaluate(() => ({ kicker: document.querySelector('.d-dim-card .d-dim-kicker').textContent, q: document.querySelector('.d-dim-cardq').textContent }));
  expect(third.kicker === `${dims[2].n} · ${dims[2].name}` && third.q === dims[2].question, `K1 map: arrows and Enter open "${third.kicker}" with its question`);
  await press(page, 'ArrowLeft', 2);
  await press(page, 'Enter');
  await act(page, '[data-action="explore"]');
  for (const [i, d] of dims.entries()) {
    const v = await page.evaluate(() => ({ focus: document.activeElement?.className, q: document.querySelector('.d-dim-q').textContent, kicker: document.querySelector('.d-dim-detail .d-dim-kicker').textContent,
      chips: [...document.querySelectorAll('.d-dim-chips li')].map((x) => x.textContent), insight: document.querySelector('.d-dim-insight').textContent, key: document.querySelector('.d-dim-map .d-keyline p').textContent, flow: document.querySelectorAll('.d-dim-step').length,
      current: document.querySelector('.d-dim-list') ? 'list' : null, next: document.querySelector('.d-dim-detail .d-dim-next') ? 'link' : null }));
    const wantNext = null; // (20 Nov 2026) the detail has one control, "All dimensions"; the map picks the next dimension
    expect(v.focus === 'd-dim-q' && v.q === d.question && v.kicker === `${d.n} · ${d.name}` && v.chips.join('|') === d.values.join('|') && v.insight === d.insight && v.key === S.K1.keyLine && v.flow === 3 && v.current === null && v.next === wantNext,
      `K1 detail ${d.n}: focus on the question, no list of names, three steps, values [${v.chips.join(', ')}], the insight, the key line under the map, no Next link`);
    const n = await nextState(page);
    expect(n.locked === (i < dims.length - 1), `K1: Next ${i < dims.length - 1 ? 'still locked' : 'unlocked'} after ${i + 1} of 8`);
    if (i === 0) await expectLayout(page, 'K1 detail 01');
    if (dims[i + 1]) {
      await act(page, '[data-action="allDimensions"]', 'Enter', { back: true });
      const card = await page.evaluate(() => document.querySelector('.d-dim-card .d-dim-kicker').textContent);
      expect(card === `${dims[i + 1].n} · ${dims[i + 1].name}`, `K1: back on the map, the card is on "${card}"`);
      await act(page, '[data-action="explore"]');
    }
  }
  await expectLayout(page, 'K1 detail 08');
  await act(page, '[data-action="allDimensions"]', 'Enter', { back: true });
  const map = await page.evaluate(() => ({ view: document.querySelector('.w-main').dataset.view, visited: document.querySelectorAll('.d-dim-node[data-visited="true"]').length, focus: document.activeElement?.dataset.dim }));
  expect(map.view === 'map' && map.visited === 8 && map.focus === dims[7].id, `K1: back on the map, ${map.visited} nodes with a check, focus on the node left`);
  await goNext(page);
}
await arrive(page, 'S07');
{
  const s = S.S07, cols = s.columns.map((c) => c.id);
  const band0 = await text(page, '.d-band-line');
  expect(band0 === s.band, `S07: the explain line "${band0}"`);
  const drop = async (col) => { await tabTo(page, '[data-action="card"]'); await press(page, String(cols.indexOf(col) + 1)); await press(page, 'Enter'); };
  // the first card into the wrong column: red for a moment, it says why and goes back to the deck
  const c1 = s.cards[0];
  await drop(cols.find((c) => c !== c1.column));
  await expectBand(page, 'S07 wrong drop', { state: 'wrong', text: c1.feedback.wrong, verdict: UI.feedback.oneMoreTry || UI.feedback.wrongPrefix });
  const fb = await page.evaluate(() => { const m = document.querySelector('.w-main').getBoundingClientRect(), f = document.querySelector('.w-strip').getBoundingClientRect(), d = document.querySelector('.w-drops').getBoundingClientRect(); const n = document.querySelector('.w-next').getBoundingClientRect(); return { below: f.top >= d.bottom - 1, gap: Math.round(m.bottom - f.bottom), above: f.bottom <= n.top }; });
  // (Noy, round 3) at the bottom of the screen, under the columns, and above the height of Previous / Next
  expect(fb.below && fb.above && fb.gap < 110, `S07: the feedback card at the bottom of the screen, under the columns and above Previous / Next (${fb.gap}px from the foot)`);
  await expectLayout(page, 'S07 wrong drop');
  // then every card right (the first one comes back last)
  for (const c of [...s.cards.slice(1), c1]) await drop(c.column);
  const piles = await page.evaluate(() => [...document.querySelectorAll('.w-drop')].map((d) => [...d.querySelectorAll('.w-placed')].map((x) => x.dataset.state + ':' + x.querySelector('.w-placed-tag')?.textContent).join('|')));
  const tagsOk = s.cards.every((c) => piles[cols.indexOf(c.column)].includes('right:' + c.tag));
  expect(tagsOk, `S07: every card in its column with its tag (${s.cards.filter((c) => c.column === 'value').length} values, ${s.cards.filter((c) => c.column === 'insight').length} insights)`);
  await expectBand(page, 'S07 done', { state: 'neutral', text: '', verdict: UI.feedback.allPlacedNow });
  await expectOpen(page, 'S07', { focused: true });
  await expectLayout(page, 'S07 done');
  await goNext(page);
}
await workbookStop(page, 'WB2');
await arrive(page, 'K2');
{
  const k = await page.evaluate(() => ({ qs: [...document.querySelectorAll('.d-qlist li')].map((li) => li.lastChild.textContent), board: [...document.querySelectorAll('.d-board-node')].map((n) => n.dataset.status).join() }));
  expect(k.qs.join('|') === S.K2.questions.join('|') && k.board === 'done,done,done,next' && (await text(page, '.d-close-note')) === S.K2.line, `K2: the five questions, the board ${k.board} (03 ticked), "${S.K2.line}"`);
  await goNext(page);
}

/* Our goals */
await arrive(page, 'W4');
{
  const num = await text(page, '.d-opener-num');
  expect(num === '4', 'W4: the number 4');
  await goNext(page);
}
await arrive(page, 'S11');
{
  await tabTo(page, '.d-goal');
  for (const [i, g] of S.S11.goals.entries()) {
    await press(page, 'Enter');
    const v = await page.evaluate(() => ({ text: document.querySelector('.d-goal-text').textContent, key: document.querySelector('.d-goal-panel .d-keyline p')?.textContent || null }));
    expect(v.text === g.text && v.key === (g.keyLine || null), `S11 ${g.n} ${g.title}: "${v.text}"${v.key ? ` and the key line "${v.key}"` : ''}`);
    const n = await nextState(page);
    expect(n.locked === (i < 4), `S11: Next ${i < 4 ? 'still locked' : 'unlocked'} after ${i + 1} of 5`);
    if (i < 4) await press(page, 'ArrowRight');
  }
  await expectLayout(page, 'S11 Information open');
  await goNext(page);
}
await arrive(page, 'S11B');
{
  const s = S.S11B;
  const hand = await page.$('.w-ghost');
  expect((await text(page, '.w-context')) === s.stage.top.text, `S11B: the context line "${s.stage.top.text}"`);
  await act(page, '.w-opt[data-id="a"]');
  await act(page, '[data-action="check"]');
  const marks = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.w-opt')].map((b) => [b.dataset.id, b.dataset.result || ''])));
  expect(!hand && marks.a === 'wrong' && marks.c === 'correct' && marks.b === '', `S11B: one try; "More sales" marked wrong, the right answer marked (${JSON.stringify(marks)}), no ghost hand`);
  await expectBand(page, 'S11B wrong', { state: 'wrong', text: s.options[0].feedback, verdict: UI.feedback.revealed });
  await expectOpen(page, 'S11B', { focused: true });
  await expectLayout(page, 'S11B wrong');
  await goNext(page);
}
await arrive(page, 'V1');
{
  const s = S.V1;
  const head = await page.evaluate(() => ({ title: !!document.querySelector('.w-video-title'), guiding: !!document.querySelector('.w-guiding'), label: document.querySelector('.w-video').getAttribute('aria-label') }));
  expect(!head.title && !head.guiding && head.label === s.title, `V1: no title line and no "Watch for" line on screen; the film is named "${head.label}" for screen readers`);
  await page.waitForFunction(() => document.querySelector('.w-video').readyState >= 2);
  await act(page, '[data-action="bigplay"]');
  for (const [i, st] of s.stops.entries()) {
    await fast(page, () => !document.querySelector('.w-stop-view').hidden, `V1 stop ${i + 1}`);
    const at = await page.evaluate(() => ({ t: document.querySelector('.w-video').currentTime, q: document.querySelector('.w-stop-q').textContent, focus: document.activeElement?.className, paused: document.querySelector('.w-video').paused }));
    expect(Math.abs(at.t - st.t) < 0.6 && at.q === st.question && at.paused && /w-stop-q/.test(at.focus), `V1 stop ${i + 1}: paused at ${at.t.toFixed(1)}s, focus on "${at.q}"`);
    const pickId = i === 0 ? 'b' : 'a'; // stop 1 right, stop 2 wrong (one try, then the right answer)
    const o = st.options.find((x) => x.id === pickId);
    await act(page, `.w-stop-view .w-opt[data-id="${pickId}"]`);
    await act(page, '.w-stop-view [data-action="check"]');
    await expectBand(page, `V1 stop ${i + 1} ${o.correct ? 'right' : 'wrong'}`, o.correct ? { state: 'correct', text: o.feedback, verdict: UI.feedback.correctPrefix } : { state: 'wrong', text: o.feedback, verdict: UI.feedback.revealed });
    await expectLayout(page, `V1 stop ${i + 1} answered`);
    expect(await isActive(page, '[data-action="resume"]'), `V1 stop ${i + 1}: focus on "${UI.video.resume}"`);
    await press(page, 'Enter');
  }
  await fast(page, () => document.querySelector('.w-next').dataset.locked === 'false', 'V1 end');
  await expectOpen(page, 'V1 ended');
  await goNext(page);
}
await workbookStop(page, 'WB3');
await arrive(page, 'K3');
{
  const k = await page.evaluate(() => ({ key: document.querySelector('.d-keyline-xl p').textContent, line: document.querySelector('.d-close-line').textContent, board: [...document.querySelectorAll('.d-board-node')].map((n) => n.dataset.status).join() }));
  expect(k.key === S.K3.keyLine && k.line === S.K3.line && k.board === 'done,done,done,done', `K3: the key line, the board ${k.board} (all four), "${k.line}"`);
  await goNext(page);
}

/* ---------- Phase 2: chapters 4 to 7 ---------- */
// a graded question of dm2.js: the option, then Check; the feedback card and the marks
async function answer2(p, what, options, id, { sel = '.d2-opt', wrongText = null, marked = true } = {}) {
  const o = options.find((x) => x.id === id), right = options.find((x) => x.correct);
  await act(p, `${sel}[data-id="${id}"]`, ' ');
  await act(p, '[data-action="check"]');
  const marks = await p.evaluate((s) => Object.fromEntries([...document.querySelectorAll(s)].map((b) => [b.dataset.id, b.dataset.state || ''])), sel);
  if (marked) expect(marks[right.id] === 'right' && (o.correct || marks[id] === 'wrong'), `${what}: one try; ${o.correct ? 'right' : 'wrong, the right answer marked'} (${JSON.stringify(marks)})`);
  await expectBand(p, what, o.correct ? { state: 'correct', text: o.feedback, verdict: UI.feedback.correctPrefix } : { state: 'wrong', text: wrongText ?? o.feedback, verdict: UI.feedback.revealed });
  await expectLayout(p, what);
}
const opener = async (p, id) => { await arrive(p, id); expect(await p.evaluate(() => !!document.querySelector('.d-opener-num svg') && document.querySelectorAll('.w-stop').length > 0), `${id}: the opener with its icon in the square and the icons under the line`); await goNext(p); };

/* From analysis to a work plan */
await opener(page, 'W5');
await arrive(page, 'S14');
{
  const s = S.S14;
  expect((await page.$$('.d2-cl-row')).length === 8 && (await page.evaluate(() => document.querySelector('[data-action="done"]').disabled)), 'S14: the eight challenges of the slide as a list, Done waits for a mark');
  await act(page, '.d2-cl-row[data-item="c3"]', ' ');
  await act(page, '.d2-cl-row[data-item="c6"]');
  await act(page, '[data-action="done"]');
  expect((await text(page, '.d2-cl-closing .d-keyline p')) === s.closing.keyLine && (await text(page, '.d2-cl-closing .d-closing-line')) === s.closing.line, `S14: the closing card: "${s.closing.keyLine}" and "${s.closing.line}"`);
  await expectOpen(page, 'S14', { focused: true });
  await expectLayout(page, 'S14 done');
  await goNext(page);
}
await arrive(page, 'S15');
{
  const s = S.S15;
  for (const [i, r] of s.rows.entries()) {
    await act(page, `.d2-rt-ch[data-row="${r.id}"]`);
    const n = await nextState(page);
    if (i === 0 || i === 8) expect(n.locked === (i < 8), `S15: Next ${i < 8 ? 'still locked' : 'unlocked'} after ${i + 1} of 9`);
  }
  const cells = await page.evaluate(() => [...document.querySelectorAll('.d2-rt-does')].map((x) => x.lastChild.textContent));
  expect(s.rows.every((r, i) => cells[i] === r.does) && (await text(page, '.d2-rt-foot .d-keyline p')) === s.keyLine, 'S15: all nine middle cells open with the slide\'s wording, the key line under the table');
  await expectLayout(page, 'S15 all open');
  await goNext(page);
}
await arrive(page, 'S15B');
{
  const R = S.S15B.situations, picks = ['b', 'b', 'c'];
  for (const [k, r] of R.entries()) {
    expect((await text(page, '.d2-q')) === r.text, `S15B round ${k + 1}: "${r.text}"`);
    await answer2(page, `S15B round ${k + 1}`, r.options, picks[k]);
    if (k < 2) { expect(await isActive(page, '[data-action="nextRound"]'), `S15B round ${k + 1}: focus on "${UI.buttons.nextRound}"`); await press(page, 'Enter'); }
  }
  await expectOpen(page, 'S15B', { focused: true });
  await goNext(page);
}
await arrive(page, 'S16');
{
  // S16 is the V3 film (22 Nov 2026): no stops, Next opens when the film ends
  const s = S.S16;
  const head = await page.evaluate(() => ({ title: !!document.querySelector('.w-video-title'), label: document.querySelector('.w-video').getAttribute('aria-label') }));
  expect(!head.title && head.label === s.title, `S16: the film is named "${head.label}" for screen readers, no title line on screen`);
  await page.waitForFunction(() => document.querySelector('.w-video').readyState >= 2);
  await act(page, '[data-action="bigplay"]');
  await fast(page, () => document.querySelector('.w-next').dataset.locked === 'false', 'S16 end');
  expect(await page.evaluate(() => document.querySelector('.w-stop-view').hidden), 'S16: the film ran to its end with no stop');
  await expectOpen(page, 'S16 ended');
  await goNext(page);
}
await arrive(page, 'S17');
{
  const s = S.S17;
  expect(await page.evaluate(() => [...document.querySelectorAll('.d2-b td')].every((td) => td.dataset.filled !== 'true')), 'S17: only the Area column is filled on arrival');
  for (let i = 1; i <= 5; i++) {
    await act(page, '.d2-b-head[data-state="next"]');
    const n = await nextState(page);
    if (i === 1 || i === 5) expect(n.locked === (i < 5), `S17: Next ${i < 5 ? 'still locked' : 'unlocked'} after column ${i} of 5`);
  }
  const t = await page.evaluate(() => ({ cells: [...document.querySelectorAll('.d2-b tbody tr:not(.d2-b-total)')].map((tr) => [...tr.children].map((c) => c.textContent)), total: document.querySelector('.d2-b-total td:last-child').textContent, chips: [...document.querySelectorAll('.d2-b-chip')].map((c) => c.textContent) }));
  expect(JSON.stringify(t.cells) === JSON.stringify(s.rows) && t.total === s.total.value && t.chips.join('|') === s.columns.slice(1).map((c) => c.chip).join('|'), `S17: the table as on the slide, total ${t.total}, a source chip under each header`);
  await expectLayout(page, 'S17 all columns');
  await goNext(page);
}
await arrive(page, 'S17C');
{
  const R = S.S17C.situations, picks = ['a', 'b', 'a'];
  expect((await text(page, '.d2-lead')) === S.S17C.lead, `S17C: "${S.S17C.lead}"`);
  for (const [k, r] of R.entries()) {
    const right = r.options.find((o) => o.correct);
    await answer2(page, `S17C question ${k + 1}`, r.options, picks[k], { wrongText: right.label });
    const chat = await page.evaluate(() => [...document.querySelectorAll('.d2-msg')].map((m) => m.dataset.who + ':' + m.querySelector('p span').textContent));
    const want = [`client:${r.text}`, `you:${r.options.find((o) => o.id === picks[k]).label}`, ...(picks[k] === right.id ? [] : [`client:${r.why}`])];
    expect(JSON.stringify(chat) === JSON.stringify(want), `S17C question ${k + 1}: the chat is ${chat.length} lines${picks[k] === right.id ? '' : ', the client pushes back'}`);
    if (k < 2) await act(page, '[data-action="nextRound"]');
  }
  await expectOpen(page, 'S17C', { focused: true });
  await goNext(page);
}
await workbookStop(page, 'WB4');

/* Simulations */
await opener(page, 'W6');
for (const [id, pickId] of [['S20', 'ppc'], ['S22', 'ppc'], ['S24', 'social']]) {
  const s = S[id];
  await arrive(page, id);
  expect((await page.$$('.d2-file .d2-facts .d2-fact-text')).length === s.facts.length && (await text(page, '.d2-case-second')) === s.second, `${id}: the case file (${s.facts.length} lines), the two questions of the slide`);
  await answer2(page, `${id} answer`, s.options, pickId, { marked: false });
  expect((await page.evaluate(() => document.querySelector('.d2-yours').dataset.state)) === (s.options.find((o) => o.id === pickId).correct ? 'right' : 'wrong'), `${id}: one try, the learner's answer marked beside the answer`);
  const a = await page.evaluate(() => ({ title: document.querySelector('.d2-answer-title').textContent, bullets: [...document.querySelectorAll('.d2-answer .d2-bullets li')].map((x) => x.textContent), key: document.querySelector('.d2-answer .d-keyline p').textContent, options: !!document.querySelector('.d2-opts') }));
  expect(a.title === s.answer.title && JSON.stringify(a.bullets) === JSON.stringify(s.answer.bullets) && a.key === s.answer.keyLine && !a.options, `${id}: "${a.title}" takes the place of the answers, with its key line`);
  await expectOpen(page, id, { focused: true });
  await goNext(page);
}
await arrive(page, 'K5');
await goNext(page);
await arrive(page, 'S26');
{
  const s = S.S26;
  const tr = await page.evaluate(() => [...document.querySelectorAll('.d2-pod-tr p')].map((x) => x.textContent.replace(/^\d*[^:]+: /, '')));
  expect(JSON.stringify(tr) === JSON.stringify(s.podcast.script.map((l) => l.text)), `S26: the transcript holds the whole script (${tr.length} lines)`);
  await page.waitForFunction(() => document.querySelector('.d2-audio').readyState >= 1);
  await act(page, '[data-action="audioPlay"]');
  await page.evaluate(() => { const a = document.querySelector('.d2-audio'); a.muted = true; a.currentTime = 31.4; }); // (22 Nov 2026: the audio is 1:00; observation 4 is spoken from 29.18 s to 33.6 s)
  await wait(700);
  const now = await page.evaluate(() => ({ cap: document.querySelector('.d2-tr-line[data-now="true"]')?.textContent || '', obs: document.querySelector('.d2-tr-line[data-now="true"]')?.dataset.obs, locked: document.querySelector('.w-next').dataset.locked }));
  expect(now.obs === '4' && now.cap.length > 0 && now.locked === 'true', `S26: inside observation 4's line, observation ${now.obs} is highlighted, the line being spoken reads "${now.cap}", Next still locked`);
  await page.evaluate(() => { const a = document.querySelector('.d2-audio'); a.currentTime = a.duration - 0.4; a.play(); });
  await page.waitForFunction(() => document.querySelector('.w-next').dataset.locked === 'false', { timeout: 15000 }).catch(() => {});
  await expectOpen(page, 'S26 heard to the end');
  await expectLayout(page, 'S26 ended');
  await goNext(page);
}
await arrive(page, 'S26B');
{
  await act(page, '.d2-poll-opt[data-id="disagree"]', ' ');
  await expectBand(page, 'S26B', { state: 'neutral', text: S.S26B.feedback.any });
  await expectOpen(page, 'S26B');
  await goNext(page);
}

/* The marketing funnel */
await opener(page, 'W7');
await arrive(page, 'V2');
{
  const s = S.V2;
  await page.waitForFunction(() => document.querySelector('.w-video').readyState >= 2);
  await act(page, '[data-action="bigplay"]');
  for (const [i, st] of s.stops.entries()) {
    await fast(page, () => !document.querySelector('.w-stop-view').hidden, `V2 stop ${i + 1}`);
    const pickId = 'b'; // stop 1 wrong (600), stop 2 right
    const o = st.options.find((x) => x.id === pickId);
    expect((await text(page, '.w-stop-q')) === st.question, `V2 stop ${i + 1}: "${st.question}"`);
    await act(page, `.w-stop-view .w-opt[data-id="${pickId}"]`);
    await act(page, '.w-stop-view [data-action="check"]');
    await expectBand(page, `V2 stop ${i + 1} ${o.correct ? 'right' : 'wrong'}`, o.correct ? { state: 'correct', text: o.feedback, verdict: UI.feedback.correctPrefix } : { state: 'wrong', text: o.feedback, verdict: UI.feedback.revealed });
    await expectLayout(page, `V2 stop ${i + 1} answered`);
    await press(page, 'Enter');
  }
  await fast(page, () => document.querySelector('.w-next').dataset.locked === 'false', 'V2 end');
  await expectOpen(page, 'V2 ended');
  await goNext(page);
}
await arrive(page, 'S28');
{
  const counts = () => page.evaluate(() => [...document.querySelectorAll('.d2-fn-count')].map((x) => x.textContent).join(' > '));
  expect((await counts()) === '1,000 > 80 > 20 > 6', `S28: six sales worked backwards (${await counts()})`);
  await act(page, '[data-action="more"]');
  expect((await counts()) === '1,167 > 93 > 23 > 7', `S28: seven sales (${await counts()})`);
  await expectOpen(page, 'S28 after one change');
  await expectLayout(page, 'S28 changed');
  await goNext(page);
}
await arrive(page, 'S30');
{
  const R = S.S30.situations, picks = ['b', 'd', 'a'];
  for (const [k, r] of R.entries()) {
    expect((await page.evaluate(() => document.querySelector('.d2-dt').dataset.col)) === String(r.column), `S30 round ${k + 1}: "${r.text}", column ${S.S30.head[r.column]} highlighted`);
    await answer2(page, `S30 round ${k + 1}`, r.options, picks[k], { sel: '.d2-dt-src' });
    if (k < 2) await act(page, '[data-action="nextRound"]');
  }
  await act(page, '[data-action="dot"]', 'Enter', { back: true });
  expect((await page.evaluate(() => { const n = document.querySelector('.d2-dt-note'); return n.hidden ? null : n.textContent; })) === S.S30.dotNote, `S30: a "·" cell says "${S.S30.dotNote}"`);
  expect((await text(page, '.d2-dt-side .d-keyline p')) === S.S30.keyLine, 'S30: the slide\'s bottom line as the key line after round 3');
  await expectOpen(page, 'S30');
  await expectLayout(page, 'S30 done');
  await goNext(page);
}
await arrive(page, 'S32');
{
  const s = S.S32;
  for (const [i, id] of ['channels', 'ads', 'geo', 'measure'].entries()) {
    await act(page, `.d2-ig-el[data-el="${id}"]`);
    const r = s.right.find((x) => x.id === id);
    const v = await page.evaluate(() => ({ cap: document.querySelector('.d2-ig-cap-text').textContent, lit: [...document.querySelectorAll('.d2-ig-src[data-lit="true"]')].map((x) => x.dataset.src).sort().join(), lines: document.querySelectorAll('.d2-ig-lines path[data-lit="true"]').length }));
    expect(v.cap === r.text && v.lit === [...r.from].sort().join() && v.lines === r.from.length, `S32 ${r.title}: "${v.cap}", from ${v.lit} (${v.lines} line${v.lines > 1 ? 's' : ''} lit)`);
    const n = await nextState(page);
    if (i >= 2) expect(n.locked === (i < 3), `S32: Next ${i < 3 ? 'still locked' : 'unlocked'} after ${i + 1} elements`);
  }
  await expectLayout(page, 'S32 four open');
  await goNext(page);
}
await arrive(page, 'S32B');
{
  for (const [row, n] of Object.entries({ a: 2, b: 4, c: 1, d: 3 })) await page.select(`.w-field-select[data-row="${row}"]`, String(n));
  await act(page, '[data-action="check"]');
  await expectBand(page, 'S32B', { state: 'correct', text: UI.feedback.allPlaced, verdict: UI.feedback.correctPrefix });
  await expectLayout(page, 'S32B right');
  await goNext(page);
}
await arrive(page, 'S33');
{
  const s = S.S33;
  expect((await page.$$('.d2-slide-list li')).length === 0 && (await page.$$('.d2-duel-opt')).length === 2, 'S33: two cards to choose between, the slide\'s lines wait for the choice');
  await act(page, '.d2-poll-opt[data-id="now"]', ' ');
  await expectBand(page, 'S33', { state: 'neutral', text: s.options[0].feedback });
  expect((await text(page, '.d2-poll-after .d-keyline p')) === s.keyLine && (await page.$$('.d2-poll-after .d2-slide-list li')).length === s.list.length, `S33: after the choice, the slide's ${s.list.length} lines and the key line "${s.keyLine}"`);
  await expectLayout(page, 'S33 chosen');
  await goNext(page);
}
await arrive(page, 'K6');
expect((await text(page, '.d-keyline-xl p')) === S.K6.keyLine && !(await page.$('.d-board')), 'K6: the closing quote, no board');
await goNext(page);

/* Wrap-up */
await opener(page, 'W8');
{
  const s = S.CHK, picks = ['b', 'b', 'c', 'b', 'a']; // four right of five: 80, the pass mark
  await page.waitForFunction(() => window.__l4.current === 'CHK');
  await press(page, 'Shift');
  for (const [k, it] of s.items.entries()) {
    const head = await page.evaluate(() => ({ h: document.querySelector('#w-instruction').textContent, n: document.querySelectorAll('.w-kc-opt').length, coach: document.querySelector('.w-coach-launcher')?.getAttribute('aria-label') }));
    expect(head.h === it.stem && head.n === it.options.length, `CHK item ${k + 1}: "${it.stem.slice(0, 50)}..." (${head.n} answers)`);
    if (k === 0) { expect(head.coach === UI.coach.openLocked, `CHK: the coach is locked ("${head.coach}")`); await expectLayout(page, 'CHK item 1'); }
    await act(page, `.w-kc-opt[data-id="${picks[k]}"]`);
    await act(page, `[data-action="${k < 4 ? 'nextQuestion' : 'check'}"]`);
    if (k < 4) expect(!(await band(page)).on, `CHK item ${k + 1}: no feedback during the check`);
  }
  await expectOpen(page, 'CHK finished (the review of the answers)');
  await expectLayout(page, 'CHK review');
  await goNext(page);
  await page.waitForFunction(() => window.__l4.current === 'CHKR');
  const r = await page.evaluate(() => ({ h: document.querySelector('#w-instruction').textContent, chip: document.querySelector('.w-result-chip').textContent.trim(), missed: [...document.querySelectorAll('.w-missed-item')].map((x) => x.dataset.item || x.textContent).length, links: [...document.querySelectorAll('.w-review-link')].map((x) => x.textContent.trim()) }));
  // kit 0.1.0: the score is the lesson's (all 24 scored questions, 9 answered wrong on this path: 15 of 24, 63):
  // under the pass mark; the one check item missed (5) with its review link; no "Retake now" (one attempt)
  const retake = await page.$('[data-action="retake"]');
  expect(r.h === 'You got 15 of 24 right.' && r.chip === S.CHKR.notPassed.chip && r.missed === 1 && r.links.length === 1 && !retake,
    `CHKR: "${r.h}" ${r.chip}, ${r.missed} missed check item with its link "${r.links[0]}", no retake button`);
  await expectLayout(page, 'CHKR not passed');
  await goNext(page);
}
await arrive(page, 'S35');
{
  for (let i = 0; i < 3; i++) await act(page, '[data-action="more"]');
  const v = await page.evaluate(() => ({ shown: [...document.querySelectorAll('.d2-stage')].filter((x) => !x.hidden).map((x) => x.lastChild.textContent), board: [...document.querySelectorAll('.d-board-node')].map((n) => n.dataset.status).join() }));
  expect(JSON.stringify(v.shown) === JSON.stringify(S.S35.stages) && v.board === 'done,done,done,done', 'S35: the four sentences of the slide, the board with all four ticked');
  await expectLayout(page, 'S35 all four');
  await goNext(page);
}
await arrive(page, 'S36');
{
  const s = S.S36;
  const steps = await page.evaluate(() => [...document.querySelectorAll('.d2-home-steps li')].map((li) => li.lastChild.textContent));
  expect(JSON.stringify(steps) === JSON.stringify(s.steps) && (await text(page, '.d2-home-body > .d-keyline p')) === s.keyLine, 'S36: the five instructions of the slide as one list, the key line under it');
  await tabTo(page, '[data-action="open"]');
  const a = await page.evaluate(() => { const l = document.activeElement; return { target: l.target, rel: l.rel, href: l.href }; });
  const url = await newTabFrom(page);
  expect(url.startsWith(C.links.homework) && a.href === C.links.homework && a.target === '_blank' && /noopener/.test(a.rel), `S36: "${UI.buttons.openHomework}" opened ${url || '(no tab)'} in a new tab`);
  await expectBand(page, 'S36 opened', { state: 'notice', text: s.openFeedback });
  await expectOpen(page, 'S36');
  await expectLayout(page, 'S36 opened');
  await goNext(page);
}
await arrive(page, 'S38');
{
  const s = S.S38;
  await act(page, '.d2-poll-opt[data-id="c2"]', ' ');
  const v = await page.evaluate(() => ({ title: document.querySelector('.d2-nextup h2').textContent, lines: [...document.querySelectorAll('.d2-nextup p')].map((x) => x.textContent), fin: window.__l4.state.fin }));
  expect(v.title === s.after.title && v.lines[0] === s.after.text && v.lines[1] === s.after.coach && v.fin === 'failed', `S38: then "${v.title}", "${v.lines[1]}"; the lesson is finished (${v.fin})`);
  await expectOpen(page, 'S38');
  await expectLayout(page, 'S38 chosen');
  await goNext(page);
}
{
  await page.waitForFunction(() => window.__l4.current === 'END');
  const e = await page.evaluate(() => ({ h: document.querySelector('#w-instruction').textContent, chip: document.querySelector('.w-end-chip').textContent.trim(), link: document.querySelector('.w-end-link')?.href, next: getComputedStyle(document.querySelector('.w-next')).display }));
  expect(e.h.replace(/\s+/g, ' ').trim() === S.END.instruction && e.chip === S.END.notPassed.chip && !(await page.$('.w-end-hint')) && e.link === C.links.homework, `END: "${e.h.replace(/\s+/g, ' ').trim()}", ${e.chip}, the home practice link`);
  await expectLayout(page, 'END');
}

/* ---------- tracking: one first-attempt event per interaction, nothing from the neutral tasks ---------- */
console.log('\ntracking events');
const IDS = C.screens.flatMap((s) => [...(s.tracking || []), ...(s.stops || []).map((st) => st.tracking)]).map((x) => x.id);
// kit 0.1.0: every graded question along the lesson is scored (the film stops too)
const SCORED = C.screens.flatMap((s) => [...(s.tracking || []), ...(s.stops || []).map((st) => st.tracking)]).filter((x) => x.scored).map((x) => x.id);
{
  const ev = await events(page);
  const answers = ev.filter((e) => e.kind === 'answer');
  const got = Object.fromEntries(answers.map((e) => [e.trackingId, `${e.type}:${e.response}:${e.result}`]));
  expect(answers.length === IDS.length && IDS.every((id) => got[id]), `${answers.length} first-attempt events: ${Object.entries(got).map(([k, v]) => k + ' ' + v).join(' | ')}`);
  expect(got.M2L2_S07_1?.startsWith('matching:') && got.M2L2_S07_1.endsWith(':wrong') && got.M2L2_S11B_1 === 'choice:a:wrong' && got.M2L2_V1_1 === 'choice:b:correct' && got.M2L2_V1_2 === 'choice:a:wrong' && got.M2L2_S32B_1 === 'matching:1.c,2.a,3.d,4.b:correct',
    'the first answers as walked: S07 matching wrong (one miss), S11B a wrong, V1 stop 1 b correct, stop 2 a wrong, S32B matching correct');
  expect(answers.every((e) => e.scored === SCORED.includes(e.trackingId)) && SCORED.length === 24 && ev.filter((e) => e.kind === 'retry').map((e) => e.trackingId).join() === 'M2L2_S07_1', 'the 24 graded questions along the lesson are scored (the check\'s five among them), the neutral tasks are not; the one retry is the S07 card placed again');
  const g2 = Object.fromEntries(answers.map((e) => [e.trackingId, e.result]));
  expect(['M2L2_S15B_2', 'M2L2_S17C_1', 'M2L2_S20_1', 'M2L2_V2_1', 'M2L2_S30_3', 'M2L2_CHK_5'].every((id) => g2[id] === 'wrong') && answers.filter((e) => e.result === 'wrong').length === 9, `the wrong answers as walked (${answers.filter((e) => e.result === 'wrong').map((e) => e.trackingId.slice(5)).join(', ')})`);
  expect(!ev.some((e) => /S14|S26|S28|S33|S38/.test(e.trackingId || '')), 'S14, S26B, S28, S33 and S38 are neutral: no tracking event');
  const fin = ev.filter((e) => e.kind === 'finish');
  expect(fin.length === 1 && fin[0].status === 'failed' && fin[0].score === 63, `one finish event: ${fin[0]?.status}, score ${fin[0]?.score} (15 of 24, under the pass mark of 80: failed, Noy 23 Nov 2026)`);
  expect(!ev.some((e) => /S05|S06/.test(e.trackingId || '')), 'S05 and S06 are neutral: no tracking event');
  const st = await page.evaluate(() => window.__l4.state);
  expect(st.g.S05?.a && st.g.S06?.c && st.g.K1?.v?.length === 8 && st.d.length === C.lesson.slice.length, `the neutral answers live in the state only (S05 ${JSON.stringify(st.g.S05.a)}, S06 ${JSON.stringify(st.g.S06.c)}); ${st.d.length} screens done`);
  expect(!page.errors.length, 'no console errors on the whole path' + (page.errors.length ? ': ' + page.errors.slice(0, 4).join(' | ') : ''));
}

if (SCORM) {
  await scormChecks(page);
  await finishRun('test:scorm');
}

/* ---------- the chapters menu and the coach, keyboard only ---------- */
console.log('\nmenu and coach');
{
  await act(page, '.w-bar-menu', 'Enter', { back: true });
  const m = await page.evaluate(() => ({ open: !document.querySelector('.w-menu-overlay').hidden, rows: [...document.querySelectorAll('.w-chapter')].map((b) => b.dataset.status + ':' + b.querySelector('.w-chapter-title').textContent), title: document.querySelector('.w-panel-title').textContent }));
  expect(m.open && m.title === C.lesson.title && m.rows.length === C.chapters.length && m.rows.every((r) => r.startsWith('done:')),
    `menu: ${m.rows.length} chapters (${m.rows.join(', ')})`);
  await expectLayout(page, 'menu open');
  await press(page, 'Escape');
  expect(await isActive(page, '.w-bar-menu') && await page.evaluate(() => document.querySelector('.w-menu-overlay').hidden), 'menu: Escape closes it, focus back on the menu button');
  // a done chapter opens from the menu
  await press(page, 'Enter');
  await act(page, '.w-chapter[data-chapter="1"]');
  expect(await page.evaluate(() => window.__l4.current) === 'W3', 'menu: "Where are we?" opens at its first screen');
  await page.evaluate(() => window.__l4.go('S06'));
  await act(page, '.w-coach-launcher', 'Enter', { back: true });
  await act(page, '[data-action="coachTip"]');
  const co = await page.evaluate(() => ({ open: !document.querySelector('.w-coach-panel').hidden, bubbles: [...document.querySelectorAll('.w-coach-bubble')].map((b) => b.textContent), frame: !!document.querySelector('.w-coach-panel iframe') }));
  expect(co.open && co.bubbles[0] === UI.coach.lines.practice && co.bubbles[co.bubbles.length - 1] === S.S06.coach.tip && !co.frame, `coach on S06: "${co.bubbles[0]}", then the tip "${co.bubbles[co.bubbles.length - 1]}" (offline, no live frame)`);
  await expectLayout(page, 'S06 coach open');
  await press(page, 'Escape');
  expect(await isActive(page, '.w-coach-launcher'), 'coach: Escape closes it, focus back on the launcher');
  // a done task is shown as it was left
  const back = await page.evaluate(() => ({ marked: document.querySelectorAll('.d-qc[data-state="c"], .d-qc[data-state="g"]').length, closing: !document.querySelector('.d-closing').hidden, locked: document.querySelector('.w-next').dataset.locked }));
  expect(back.marked === 6 && back.closing && back.locked === 'false', 'S06 again: the six marks and the closing card are back, Next open');
}

/* ---------- resume: a reload comes back to the saved place ---------- */
console.log('\nresume');
{
  await page.evaluate(() => window.__l4.go('K1'));
  const r = await open('');
  const b = await r.evaluate(() => ({ at: window.__l4.current, dialog: document.querySelector('.w-dialog-text')?.textContent, visited: document.querySelectorAll('.d-dim-node[data-visited="true"]').length }));
  expect(b.at === 'K1' && b.dialog === UI.resumePrompt && b.visited === 8, `reload: back on ${b.at} with "${b.dialog}", the eight explored dimensions kept`);
  await press(r, 'Enter');
  expect(!(await r.$('.w-dialog')) && !r.errors.length, 'resume: Enter on Resume closes the prompt, no console errors');
  await r.close();
}

await finishRun('walk');

/* ---------- SCORM 1.2 (npm run test:scorm) ---------- */
// The SCORM data after the whole path, then a relaunch (entry=resume with the saved suspend data).
async function scormChecks(p) {
  console.log('\nSCORM 1.2 data');
  const evs = await p.evaluate(() => window.__l4.tracking.events.filter((e) => e.kind === 'answer').map((e) => ({ t: e.trackingId, report: e.report, result: e.result })));
  const m = await p.evaluate(() => { window.__l4.tracking.terminate(); return window.__scormMock.report(); });
  const d = m.data;
  expect(!m.errors.length, `SCORM: every call valid for SCORM 1.2 (${m.calls.length} calls)` + (m.errors.length ? ': ' + m.errors.slice(0, 5).join(' | ') : ''));
  expect(!m.identity.length, 'SCORM: no identity element read or written (student_id, student_name)' + (m.identity.length ? ': ' + m.identity.join(', ') : ''));
  const rows = Array.from({ length: m.count }, (_, n) => {
    const g = (f) => d[`cmi.interactions.${n}.${f}`];
    return { id: g('id'), type: g('type'), response: g('student_response'), result: g('result'), latency: g('latency'), time: g('time'), weighting: g('weighting'), pattern: g('correct_responses.0.pattern') };
  });
  const tidOf = (lmsId) => IDS.filter((t) => lmsId.startsWith(t)).sort((a, b) => b.length - a.length)[0];
  expect(rows.length === IDS.length && IDS.every((t) => rows.filter((r) => tidOf(r.id) === t).length === 1), `SCORM: ${rows.length} interactions, each sent once (${rows.map((r) => tidOf(r.id)).join(', ')})`);
  // the template's adapter (PK1): each row is the event's report, the question in the id and the answers in
  // words, sent as fill-in so an LMS report can be read; result, latency, time and weighting 0 (practice)
  const clean = (s) => String(s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 250);
  const bad = rows.filter((r) => { const e = evs.find((x) => x.t === tidOf(r.id));
    return !e || r.id !== e.report.id || r.type !== 'fill-in' || r.response !== clean(e.report.response) || r.pattern !== clean(e.report.correct) || r.weighting !== (SCORED.includes(e.t) ? '1' : '0')
      || !['correct', 'wrong'].includes(r.result) || r.result !== e.result || !r.latency || !r.time || r.id.length > 255 || /\s/.test(r.id) || r.response.length > 250; });
  expect(!bad.length, 'SCORM: every interaction carries its question in the id, the answer and the correct answer in words, its result, latency, time and weighting (1 for the five items of the check, 0 for practice)' + (bad.length ? ': ' + bad.map((r) => r.id).join(', ') : ''));
  rows.forEach((r) => console.log(`  note ${r.id} | ${r.result} | answered "${r.response.slice(0, 70)}${r.response.length > 70 ? '...' : ''}"`));
  expect(m.statuses.length && m.statuses.slice(0, -1).every((s) => s === 'incomplete') && m.statuses[m.statuses.length - 1] === 'failed' && d['cmi.core.lesson_status'] === 'failed' && String(d['cmi.core.score.raw']) === '63' && d['cmi.core.exit'] === 'suspend',
    `SCORM: lesson_status ${d['cmi.core.lesson_status']} (incomplete until the finish, then failed under 80: ${m.statuses.join(', ')}), score.raw ${d['cmi.core.score.raw']} (min ${d['cmi.core.score.min']}, max ${d['cmi.core.score.max']}), exit "${d['cmi.core.exit']}"`);
  expect(/^\d{4}:\d{2}:\d{2}\.\d{2}$/.test(d['cmi.core.session_time'] || '') && m.finished, `SCORM: session_time ${d['cmi.core.session_time']}, LMSFinish once`);
  const susp = d['cmi.suspend_data'] || '';
  await configureSrc();
  const { decode } = await import('../src/state.js');
  const st = decode(susp);
  expect(susp.length < 4096 && st.s === 'END' && st.d.length === C.lesson.slice.length && st.g.S05?.a && st.g.S06?.c && Object.keys(st.a).length === IDS.length,
    `SCORM: suspend_data ${susp.length} chars (limit 4096): the place, ${st.d.length} done screens, ${Object.keys(st.a).length} first answers, the S05 and S06 answers (kept here only, never an interaction)`);
  expect(d['cmi.core.lesson_location'] === 'END', `SCORM: lesson_location "${d['cmi.core.lesson_location']}" = the saved place`);

  console.log('\nSCORM relaunch (entry=resume)');
  const r = await open('', { lms: { 'cmi.core.entry': 'resume', 'cmi.suspend_data': susp, 'cmi.core.lesson_location': d['cmi.core.lesson_location'], 'cmi.core.lesson_status': d['cmi.core.lesson_status'] } });
  const back = await r.evaluate(() => ({ at: window.__l4.current, dialog: !!document.querySelector('.w-dialog [data-action="resume"]'), done: window.__l4.state.d.length, mock: window.__scormMock.report() }));
  expect(back.at === 'END' && back.done === C.lesson.slice.length, `SCORM resume: lands on ${back.at}${back.dialog ? ' with the resume prompt' : ''}, ${back.done} screens done`);
  expect(back.mock.data['cmi.core.lesson_status'] === 'failed' && !back.mock.errors.length && back.mock.count === 0, 'SCORM resume: lesson_status stays failed (one attempt, no retake), no interaction written again');
  await press(r, 'Enter');
  const tiles = await r.evaluate(() => { window.__l4.go('S05'); return [...document.querySelectorAll('.d-tile-sum')].map((x) => x.textContent).join(' | '); });
  expect(tiles.split(' | ').every((t) => t.length > 0), `SCORM resume: S05 shows the saved answers (${tiles})`);
  const again = await r.evaluate(() => { window.__l4.go('S11B'); return { marks: [...document.querySelectorAll('.w-opt')].map((b) => b.dataset.result || '-').join(), count: window.__scormMock.report().count }; });
  expect(again.count === 0, `SCORM resume: a done question is read-only (${again.marks}), nothing is sent twice`);
  await r.close();
}
