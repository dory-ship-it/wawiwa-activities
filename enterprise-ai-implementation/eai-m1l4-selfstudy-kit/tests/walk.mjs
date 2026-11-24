// EAI M1 L4: the keyboard walk of the whole lesson (O1 to END), run by the kit's tools/walk.mjs (npm run walk;
// npm run test:scorm = the same path against the mock SCORM 1.2 API). Kit 0.1.0 (23 Nov 2026): written again on
// the kit's walk helpers (tools/walk-lib.mjs) and driven by the content, because the v3 lesson's own walk still
// described the v1 screens (two tries, the old O3 and S01, no S14, S15 or S19A to S19C) and failed on O1 and O2
// (EAI-FIX-LIST A10). On every screen: focus on the heading, Next locked with its reason until the task is done
// (presentation screens: never locked), the screen done by keyboard with the content's right answers (three on
// purpose wrong: S10, V1 stop 1 and check item 5, each showing the why of the learner's own pick), Next unlocked,
// the layout checks of tools/lib.mjs. Then the tracking and the score (the 30 scored questions along the lesson),
// the menu and the coach by keyboard, a resume; with --scorm the SCORM data, the adapter alone in every path,
// the suspend_data worst cases and a relaunch.
import { SCORM, MOCK, C, UI, S, fails, ok, fail, expect, wait, browser, open, press, shiftTab, isActive, tabTo, act, text, nextState, events, band, expectBand, expectLayout, expectOpen, goNext, newTabFrom, fast, finishRun, configureSrc } from '../tools/walk-lib.mjs';

await configureSrc();
const { variantOf } = await import('../src/adapt.js');
const L = UI.footer.locked;
const right = (opts) => opts.find((o) => o.correct).id;
const WRONG_ON = { S10: 'a' }; // a wrong first pick on purpose (A3: the band explains the learner's own pick)
const keys = (n) => String(n);

// a new screen: the right id, focus on its h1 (its text: the content's, or the one given), Next locked with its
// reason (or open: a presentation screen, the title)
async function arrive(p, id, heading = null) {
  await p.waitForFunction((x) => window.__l4.current === x, { timeout: 8000 }, id).catch(() => {});
  const r = await p.evaluate(() => ({ id: window.__l4.current, focus: document.activeElement?.id, text: document.activeElement?.textContent.replace(/\s+/g, ' ').trim() }));
  const n = await nextState(p);
  const s = S[id];
  const why = L[s.locked] || L[s.variant] || L[s.template] || L.default;
  const want = heading ?? s.instruction;
  const nextOk = s.template === 'title' ? true : s.presentation ? !n.locked : n.locked && n.aria === 'true' && n.label === why;
  expect(r.id === id && r.focus === 'w-instruction' && r.text === want.replace(/\s+/g, ' ').trim() && nextOk,
    `${id}: focus on the heading "${r.text.slice(0, 60)}", Next ${s.presentation ? 'open (presentation)' : `locked "${n.label}"`}` + (r.id !== id ? ` (on ${r.id})` : '') + (!nextOk ? ' (Next state wrong)' : '') + (r.text !== want.replace(/\s+/g, ' ').trim() ? ` (want "${want}")` : ''));
  await press(p, 'Shift'); // any key stops a ghost hand
  await expectLayout(p, id);
}
const done = async (p, id) => { await expectOpen(p, id); await expectLayout(p, `${id} done`); };

// the screens, by template and variant (the content's right answers)
async function solve(p, id) {
  const s = S[id];
  const t = s.template, v = s.variant || '';
  if (t === 'title') { await act(p, '[data-action="start"]'); return 'start'; }
  if (s.presentation && !['handoff'].includes(t)) { await goNext(p); return 'presentation'; }
  if (t === 'input') {
    for (const f of s.fields || []) { if (await tabTo(p, `.w-input[data-store="${f.store}"]`)) await p.keyboard.type(`My ${f.label || f.store} for the walk`.slice(0, Math.max(5, (f.maxLength || 60) - 2))); }
    if (s.checkbox) await act(p, '.w-checkbox', ' ');
    await act(p, '[data-action="save"]');
    await done(p, id); await goNext(p); return 'saved';
  }
  if (t === 'decision' && ['single', 'fill', 'metric'].includes(v)) {
    const pick = WRONG_ON[id] || right(s.options);
    await act(p, `.w-main .w-opt[data-id="${pick}"]`);
    if (await p.$('.w-main [data-action="check"]:not([disabled])')) await act(p, '.w-main [data-action="check"]');
    const o = s.options.find((x) => x.id === pick);
    if (o.correct) await expectBand(p, `${id} right`, { state: 'correct', text: o.feedback, verdict: UI.feedback.correctPrefix });
    else await expectBand(p, `${id} wrong: the why of the learner's own pick (A3)`, { state: 'wrong', text: o.feedback, verdict: UI.feedback.revealed });
    await done(p, id); await goNext(p); return pick;
  }
  if (t === 'decision' && v === 'multi') {
    for (const o of s.options.filter((x) => x.correct)) await act(p, `.w-main .w-opt[data-id="${o.id}"]`);
    await act(p, '.w-main [data-action="check"]');
    await done(p, id); await goNext(p); return 'multi';
  }
  if (t === 'decision' && v === 'pair') {
    for (const [k, x] of s.situations.entries()) {
      await act(p, `.w-main ${k ? '.w-situation-now ' : ''}.w-opt[data-id="${right(x.options)}"]`);
      if (await p.$('.w-main [data-action="check"]:not([disabled])')) await act(p, '.w-main [data-action="check"]');
      if (k < s.situations.length - 1) await act(p, '[data-action="nextSituation"]');
    }
    await done(p, id); await goNext(p); return 'pair';
  }
  if (t === 'decision' && v === 'rounds') {
    for (const [k, r] of s.rounds.entries()) {
      await act(p, `.w-main .w-opt[data-id="${r.correct}"]`);
      if (await p.$('.w-main [data-action="check"]:not([disabled])')) await act(p, '.w-main [data-action="check"]');
      if (k < s.rounds.length - 1) await act(p, '[data-action="nextRound"]');
    }
    await done(p, id); await goNext(p); return 'rounds';
  }
  if (t === 'decision' && v === 'cases') {
    for (const [k, c] of s.cards.entries()) {
      await act(p, `.w-main .w-opt[data-id="${c.column}"]`);
      if (await p.$('.w-main [data-action="check"]:not([disabled])')) await act(p, '.w-main [data-action="check"]');
      if (k < s.cards.length - 1) await act(p, '[data-action="nextCase"]');
    }
    await done(p, id); await goNext(p); return 'cases';
  }
  if (t === 'decision' && v === 'fields') {
    for (const c of s.cards) { await tabTo(p, `.w-field-select[data-row="${c.column}"]`); await p.select(`.w-field-select[data-row="${c.column}"]`, String(c.id ?? c.n)); }
    await act(p, '[data-action="check"]');
    await expectBand(p, `${id} right`, { state: 'correct', text: UI.feedback.allPlaced, verdict: UI.feedback.correctPrefix });
    await done(p, id); await goNext(p); return 'fields';
  }
  if (t === 'decision' && v === 'selfcheck') {
    for (const r of s.rows) await act(p, `.w-check-row[data-row="${r.id}"] [data-choice="yes"]`);
    await done(p, id); await goNext(p); return 'selfcheck';
  }
  if (t === 'decision' && v === 'risk') {
    await act(p, `.w-main .w-opt[data-id="${s.options[0].id}"]`);
    if (await p.$('.w-main [data-action="check"]:not([disabled])')) await act(p, '.w-main [data-action="check"]');
    await done(p, id); await goNext(p); return 'neutral pick';
  }
  if (t === 'decision' && v === 'close') {
    await act(p, `.w-takeaway[data-id="${s.options[0].id}"]`);
    // (S22's lines show on its stage card, not in a band)
    const shows = (x) => p.evaluate((y) => document.querySelector('.w-stage').innerText.replace(/\s+/g, ' ').includes(y.replace(/\s+/g, ' ')), x);
    expect(await shows(s.options[0].feedback), `${id} takeaway: its line shows`);
    await press(p, 'Enter'); // Next: step 2
    expect(await isActive(p, '[data-action="homework"]'), `${id} step 2: focus on Open homework`);
    const hw = await newTabFrom(p);
    expect(hw === C.links.homework, `${id}: Open homework opened ${hw} in a new tab`);
    await act(p, '[data-action="finish"]');
    // (without the record downloaded the first Finish may ask to confirm; then the second finishes and opens END)
    if (await p.evaluate(() => window.__l4.current) !== 'END') {
      expect(await shows(s.step2.feedback.finishConfirm), `${id} Finish without the record: "${s.step2.feedback.finishConfirm}"`);
      await act(p, '[data-action="finish"]');
    }
    return 'finished';
  }
  if (t === 'sortDeck') {
    const cols = s.columns.map((c) => c.id);
    for (const c of s.cards) { await tabTo(p, '[data-action="card"]'); await press(p, keys(cols.indexOf(c.column) + 1)); await press(p, 'Enter'); await wait(700); }
    await done(p, id); await goNext(p); return 'sorted';
  }
  if (t === 'bpmn' && v === 'label') {
    const targets = s.targets.map((x) => x.id);
    for (const l of s.labels) { await tabTo(p, `.w-label-card[data-label="${l.id}"]`); await press(p, keys(targets.indexOf(l.target) + 1)); await press(p, 'Enter'); await wait(700); }
    await done(p, id); await goNext(p); return 'labelled';
  }
  if (t === 'flags') {
    const picks = v === 'map' ? s.map.filter((x) => x.correct).map((x) => x.n) : s.flags.map((f) => f.target);
    // (a placement holds input for a moment while its feedback card comes in)
    for (const n of picks) { await act(p, `.w-target[data-target="${n}"]`); await wait(700); }
    if (await p.$('[data-action="check"]:not([disabled])')) await act(p, '[data-action="check"]');
    await done(p, id); await goNext(p); return 'flagged';
  }
  if (t === 'explorer') {
    for (const tile of s.tiles) await act(p, `.w-tile[data-n="${tile.n}"]`);
    await done(p, id); await goNext(p); return 'explored';
  }
  if (t === 'video') {
    await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 2, { timeout: 20000 }).catch(() => {});
    await act(p, '[data-action="bigplay"]');
    for (const [k, st] of (s.stops || []).entries()) {
      await fast(p, () => !document.querySelector('.w-stop-view').hidden, `${id} stop ${k + 1}`);
      const pick = id === 'V1' && k === 0 ? st.options.find((o) => !o.correct).id : right(st.options);
      const o = st.options.find((x) => x.id === pick);
      await act(p, `.w-stop-view .w-opt[data-id="${pick}"]`);
      await act(p, '.w-stop-view [data-action="check"]');
      await expectBand(p, `${id} stop ${k + 1} ${o.correct ? 'right' : 'wrong (A3: the why of the learner\'s own pick)'}`, o.correct ? { state: 'correct', text: o.feedback, verdict: UI.feedback.correctPrefix } : { state: 'wrong', text: o.feedback, verdict: UI.feedback.revealed });
      await press(p, 'Enter'); // Resume
    }
    await fast(p, () => document.querySelector('.w-next').dataset.locked === 'false', `${id} end`);
    await done(p, id); await goNext(p); return 'watched';
  }
  if (t === 'handoff' && v === 'back') { await act(p, '[data-action="pdfYes"]'); await done(p, id); await goNext(p); return 'pdf yes'; }
  if (t === 'handoff') {
    if (await p.$('[data-action="open"]') && (await nextState(p)).locked) {
      await tabTo(p, '[data-action="open"]');
      const url = await newTabFrom(p);
      expect(url.startsWith(C.links.workbook), `${id}: Open workbook opened ${url} in a new tab, the lesson stayed`);
    }
    await done(p, id); await goNext(p); return 'workbook';
  }
  if (t === 'check') {
    const items = s.items;
    for (const [k, it] of items.entries()) {
      const last = k === items.length - 1;
      if (it.kind === 'tiles') for (const tl of it.tiles.filter((x) => x.correct)) await act(p, `.w-kc-tile[data-n="${tl.n}"]`, ' ');
      else await act(p, `.w-kc-opt[data-id="${k === 4 ? it.options.find((o) => !o.correct).id : right(it.options)}"]`);
      if (!last) expect(!(await band(p)).on, `${id} item ${k + 1}: no feedback during the check`);
      await act(p, `[data-action="${last ? 'check' : 'nextQuestion'}"]`);
    }
    for (let k = 0; k < items.length - 1; k++) await act(p, '[data-action="nextAnswer"]');
    await done(p, `${id} review`); await goNext(p); return 'checked';
  }
  fail(`${id}: no keyboard solver for ${t}/${v}`);
  await goNext(p);
  return 'skipped';
}

/* ---------- the path ---------- */
console.log(SCORM ? '\nmain path in an LMS (mock SCORM 1.2 API)' : '\nmain path, keyboard only');
// PP1: the walk checks the core screens (?debug=1&level=core pins the core level; the paths: npm run test:adapt)
const page = await open('?reset=1&live=0&debug=1&level=core', { lms: SCORM ? {} : null });
if (SCORM) expect(await page.evaluate(() => window.__l4.tracking.mode) === 'scorm12', 'SCORM: the API is found, the scorm12 adapter runs');
const SLICE = C.lesson.slice;
const LOG = [];
for (const id of SLICE) {
  const s = S[id];
  let heading = null;
  if (s.template === 'check') heading = s.items[0].stem;
  if (s.template === 'result') {
    const sc = await page.evaluate(() => window.__l4.score());
    heading = s.instruction.replace('{x}', sc.x).replace('{n}', sc.n).replace('{p}', sc.raw);
  }
  if (s.template === 'end') heading = s.instruction;
  await arrive(page, id, heading);
  if (s.template === 'result') {
    const r = await page.evaluate(() => ({ note: document.querySelector('.d-pass-note')?.textContent, chip: document.querySelector('.w-result-chip').textContent.trim(), retake: !!document.querySelector('[data-action="retake"]') }));
    const sc = await page.evaluate(() => window.__l4.score());
    const passed = sc.raw >= C.lesson.completion.passMark;
    expect(r.note === s.passNote.replace('{p}', sc.raw) && r.chip === s[passed ? 'passed' : 'notPassed'].chip && !r.retake,
      `${id}: the lesson's score ${sc.x} of ${sc.n}, the pass mark as a small line ("${r.note}", A6), "${r.chip}", no retake (one attempt)`);
  }
  if (s.template === 'end') {
    const e = await page.evaluate(() => ({ chip: document.querySelector('.w-end-chip').textContent.trim(), hint: !!document.querySelector('.w-end-hint'), next: !!document.querySelector('.w-next').getClientRects().length }));
    expect(e.chip === s.passed.chip && !e.hint && !e.next, `${id}: "${e.chip}", no retake hint, Previous only`);
    LOG.push(`${id} end`);
    break;
  }
  LOG.push(`${id} ${await solve(page, id)}`);
}
console.log('  note ' + LOG.join(' | '));

/* ---------- tracking and the score ---------- */
console.log('\ntracking events and the score');
const IDS = C.screens.flatMap((s) => [...(variantOf(s, 'core').tracking || []), ...(s.stops || []).map((st) => st.tracking)]).filter(Boolean).filter((t) => (t.version || 'a') === 'a').map((t) => t.id);
const SCORED = C.screens.flatMap((s) => [...(s.tracking || []), ...(s.stops || []).map((st) => st.tracking)]).filter((t) => t && t.scored && (t.version || 'a') === 'a').map((t) => t.id);
{
  const ev = await events(page);
  const answers = ev.filter((e) => e.kind === 'answer');
  const ids = answers.map((e) => e.trackingId);
  const once = ids.length === new Set(ids).size;
  const missing = IDS.filter((x) => !ids.includes(x) && !/_PATH_/.test(x));
  expect(once && !missing.length, `one first-attempt event per interaction (${answers.length}; ${missing.length ? 'missing ' + missing.join(', ') : 'none missing'})`);
  const wrong = answers.filter((e) => e.result === 'wrong').map((e) => e.trackingId);
  const wantWrong = ['L4_V1_1', 'L4_S10_1', S.S21.items[4].trackingId];
  expect(wrong.join() === wantWrong.join(), `the wrong first answers are the three on purpose (${wrong.join(', ')})`);
  expect(answers.every((e) => e.scored === SCORED.includes(e.trackingId)) && SCORED.length === 30, `${SCORED.length} scored questions along the lesson (the check's six among them), every other interaction practice`);
  const fin = ev.filter((e) => e.kind === 'finish');
  const sc = await page.evaluate(() => window.__l4.score());
  expect(sc.x === 27 && sc.n === 30 && sc.raw === 90 && fin.length === 1 && fin[0].status === 'passed' && fin[0].score === 90, `the score: ${sc.x} of ${sc.n} = ${sc.raw}; one finish event, ${fin[0]?.status} ${fin[0]?.score}`);
  expect(!page.errors.length, 'no console errors on the whole path' + (page.errors.length ? ': ' + page.errors.slice(0, 4).join(' | ') : ''));
}

if (SCORM) {
  await scormChecks(page);
  await scormOneAttempt();
  await scormStatusUnit();
  await finishRun('test:scorm');
}

/* ---------- the chapters menu and the coach, keyboard only ---------- */
console.log('\nmenu and coach');
{
  await page.evaluate((x) => window.__l4.go(x), SLICE[3]);
  await act(page, '.w-bar-menu', 'Enter', { back: true });
  const m = await page.evaluate(() => ({ open: !document.querySelector('.w-menu-overlay').hidden, rows: [...document.querySelectorAll('.w-chapter')].map((b) => b.dataset.status), title: document.querySelector('.w-panel-title').textContent }));
  expect(m.open && m.title === C.lesson.title && m.rows.length === C.chapters.length && m.rows.every((r) => r === 'done'), `menu: ${m.rows.length} chapters, all done (${m.rows.join(', ')})`);
  await expectLayout(page, 'menu open');
  await press(page, 'Escape');
  expect(await isActive(page, '.w-bar-menu') && await page.evaluate(() => document.querySelector('.w-menu-overlay').hidden), 'menu: Escape closes it, focus back on the menu button');
  const tipOn = 'S04';
  await page.evaluate((x) => window.__l4.go(x), tipOn);
  await act(page, '.w-coach-launcher', 'Enter', { back: true });
  await act(page, '[data-action="coachTip"]');
  const co = await page.evaluate(() => ({ open: !document.querySelector('.w-coach-panel').hidden, bubbles: [...document.querySelectorAll('.w-coach-bubble')].map((b) => b.textContent), frame: !!document.querySelector('.w-coach-panel iframe') }));
  expect(co.open && co.bubbles[co.bubbles.length - 1] === S[tipOn].coach.tip && !co.frame, `coach on ${tipOn}: the tip "${co.bubbles[co.bubbles.length - 1]}" (offline, live=0)`);
  await expectLayout(page, `${tipOn} coach open`);
  await press(page, 'Escape');
  expect(await isActive(page, '.w-coach-launcher'), 'coach: Escape closes it, focus back on the launcher');
}

/* ---------- resume ---------- */
console.log('\nresume');
{
  await page.evaluate(() => window.__l4.go('S12'));
  const r = await open('?live=0');
  const b = await r.evaluate(() => ({ at: window.__l4.current, dialog: document.querySelector('.w-dialog-text')?.textContent, title: window.__l4.state.f.L4_CASE_TITLE }));
  expect(b.at === 'S12' && b.dialog === UI.resumePrompt && !!b.title, `reload: back on ${b.at} with "${b.dialog}", the case title kept`);
  await press(r, 'Enter');
  expect(!(await r.$('.w-dialog')) && !r.errors.length, 'resume: Enter on Resume closes the prompt, no console errors');
  await r.close();
}
await finishRun('walk');

/* ---------- SCORM 1.2 (npm run test:scorm) ---------- */
// The SCORM data after the whole path, the suspend_data worst cases, then a relaunch (entry=resume).
async function scormChecks(p) {
  console.log('\nSCORM 1.2 data');
  const m = await p.evaluate(() => { window.__l4.tracking.terminate(); return window.__scormMock.report(); });
  const d = m.data;
  expect(!m.errors.length, `SCORM: every call valid for SCORM 1.2 (${m.calls.length} calls)` + (m.errors.length ? ': ' + m.errors.slice(0, 5).join(' | ') : ''));
  expect(!m.identity.length, 'SCORM: no identity element read or written (student_id, student_name)');
  const skip = C.lesson.lmsReport.skip;
  const rows = Array.from({ length: m.count }, (_, n) => ({ id: d[`cmi.interactions.${n}.id`], w: d[`cmi.interactions.${n}.weighting`], r: d[`cmi.interactions.${n}.result`], type: d[`cmi.interactions.${n}.type`] }));
  const sent = IDS.filter((x) => !skip.includes(x));
  const tidOf = (lmsId) => sent.filter((t) => lmsId.startsWith(t + '_')).sort((a, b) => b.length - a.length)[0];
  expect(rows.length === sent.length && sent.every((t) => rows.filter((r) => tidOf(r.id) === t).length === 1) && rows.every((r) => r.type === 'fill-in' && r.w === (SCORED.includes(tidOf(r.id)) ? '1' : '0')),
    `SCORM: ${rows.length} interactions, each sent once with the question in its id, weighting 1 for the ${SCORED.length} scored ones (${skip.join(', ')} not sent)`);
  const firstPass = m.statuses.indexOf('passed');
  expect(firstPass > 0 && m.statuses.slice(0, firstPass).every((s) => s === 'incomplete') && m.statuses.slice(firstPass).every((s) => s === 'passed') && d['cmi.core.lesson_status'] === 'passed' && d['cmi.core.score.raw'] === '90' && d['cmi.core.exit'] === 'suspend',
    `SCORM: lesson_status ${m.statuses.join(' > ')}, score.raw ${d['cmi.core.score.raw']} (27 of 30), exit "${d['cmi.core.exit']}"`);
  expect(/^\d{4}:\d{2}:\d{2}\.\d{2}$/.test(d['cmi.core.session_time'] || '') && m.finished, `SCORM: session_time ${d['cmi.core.session_time']}, LMSFinish once`);
  const susp = d['cmi.suspend_data'] || '';
  const { decode, encode } = await import('../src/state.js');
  const full = decode(susp);
  // every free-text field full: each store key at its own field's maxlength (NL3: S02's title and
  // problem, the three-part sketch, the S12B metric, the S17B notes; NL4: S18B's title, no S19 metric)
  const maxOf = {};
  for (const s of C.screens) for (const f of [...(s.fields || []), ...Object.values(s.states || {}).flatMap((st) => st.fields || []), ...(s.step2?.field ? [s.step2.field] : [])]) if (f.store) maxOf[f.store] = Math.max(maxOf[f.store] || 0, f.maxLength);
  for (const k of Object.keys(maxOf)) full.f[k] = 'x'.repeat(maxOf[k]);
  const fullLen = encode(full).length;
  expect(susp.length < 4096 && fullLen < 4096, `SCORM: suspend_data ${susp.length} chars after the whole lesson; ${fullLen} with all ${Object.keys(maxOf).length} free-text fields full (each at its maxlength; limit 4096)`);
  // PK1 B2, the worst case on top of the whole lesson: the check failed once and retaken (both versions'
  // answers kept, attempt 2, passed), both path levels set, a retry count on every interaction, and each
  // free-text field at its maxlength in text that JSON escapes ("quotes", apostrophes, commas, new lines)
  const worst = structuredClone(full);
  const allIds = C.screens.flatMap((s) => [...(s.tracking || []), ...(s.stops || []).map((x) => x.tracking)]).filter(Boolean);
  for (const t of allIds) if (!worst.a[t.id]) worst.a[t.id] = String(t.correctResponse ?? 'a').toLowerCase() + '|w';
  for (const t of allIds) worst.x[t.id] = 9;
  worst.k = { n: 2, s: 100, p: 1 }; worst.p = { c4: 'stretch', c5: 'support' }; worst.fin = 'passed';
  const heavy = (n) => 'Ben\'s "rush" order, step 2,\n'.repeat(Math.ceil(n / 27)).slice(0, n);
  for (const k of Object.keys(maxOf)) worst.f[k] = heavy(maxOf[k]);
  let worstLen, worstX = false; try { const w = encode(worst); worstLen = w.length; worstX = w.includes('"x":'); } catch (e) { worstLen = Number(/\d+$/.exec(e.message)?.[0]) || 9999; }
  // PK1: every character of every field a double quote (escaped to 2): over the limit, so the save drops
  // the retry counts, then trims the longest text from its end until it fits; nothing else is lost
  const hostile = structuredClone(worst);
  for (const k of Object.keys(maxOf)) hostile.f[k] = '"'.repeat(maxOf[k]);
  const raw = JSON.stringify(hostile).length;
  let hs = null, herr = '';
  try { hs = encode(hostile); } catch (e) { herr = e.message; }
  const hd = hs ? decode(hs) : null;
  const lost = hd ? Object.keys(maxOf).filter((k) => hd.f[k] !== hostile.f[k]).map((k) => `${k.replace('L4_CASE_', '')} ${hostile.f[k].length}>${hd.f[k].length}`) : [];
  const kept = hd && JSON.stringify([hd.s, hd.d, hd.a, hd.g, hd.k, hd.p, hd.fin]) === JSON.stringify([hostile.s, hostile.d, hostile.a, hostile.g, hostile.k, hostile.p, hostile.fin])
    && Object.keys(maxOf).every((k) => hostile.f[k].startsWith(hd.f[k]));
  expect(hs && hs.length < 4096 && kept && encode(hostile) === hs && hostile.f.L4_CASE_STEPS.length === maxOf.L4_CASE_STEPS,
    `PK1 all fields full of quotes (${raw} chars before shrinking): saved ${hs ? hs.length : herr} chars, retry counts dropped, trimmed ${lost.join(', ') || 'nothing'}; place, answers, flags, attempt, levels kept; deterministic; the state itself untouched`);
  const hostileLen = hs ? hs.length : 9999;
  expect(worstLen < 4096, `PK1 worst case: suspend_data ${worstLen} chars (margin ${4096 - worstLen}) with the check retaken, levels set, every field full of quotes, apostrophes, commas and new lines (retry counts ${worstX ? 'kept' : 'dropped, as encode does over 3800'})`);
  void hostileLen;
  expect(d['cmi.core.lesson_location'] === full.s, `SCORM: lesson_location "${d['cmi.core.lesson_location']}" = the saved place`);
  console.log('\nSCORM relaunch (entry=resume)');
  const r = await open('?live=0', { lms: { 'cmi.core.entry': 'resume', 'cmi.suspend_data': susp, 'cmi.core.lesson_location': d['cmi.core.lesson_location'], 'cmi.core.lesson_status': d['cmi.core.lesson_status'] } });
  const back = await r.evaluate(() => ({ at: window.__l4.current, done: window.__l4.state.d.length, mock: window.__scormMock.report() }));
  expect(back.at === d['cmi.core.lesson_location'] && back.done === full.d.length && back.mock.data['cmi.core.lesson_status'] === 'passed' && back.mock.count === 0,
    `SCORM resume: lands on ${back.at}, ${back.done} screens done, lesson_status stays passed, no interaction written again`);
  await r.close();
}

// one attempt, under 80: the finish reports failed with its score; a relaunch keeps everything, no retake
async function scormOneAttempt() {
  console.log('\nSCORM: one attempt, failed under 80');
  let p = await open('?reset=1&live=0&screen=S21', { lms: {} });
  const items = S.S21.items;
  for (const [k, it] of items.entries()) {
    if (it.kind === 'tiles') { const miss = it.tiles.find((x) => !x.correct).n; for (const n of [it.tiles.find((x) => x.correct).n, miss]) await p.click(`.w-kc-tile[data-n="${n}"]`); await p.click('[data-action="check"]'); }
    else { await p.click(`.w-kc-opt[data-id="${it.options.find((o) => !o.correct).id}"]`); await p.click('[data-action="nextQuestion"]'); }
    void k;
  }
  let m = await p.evaluate(() => window.__scormMock.report());
  expect(m.data['cmi.core.score.raw'] === '0' && m.data['cmi.core.lesson_status'] === 'incomplete' && m.count === 6,
    `SCORM the check done (0 of 30): score.raw ${m.data['cmi.core.score.raw']}, lesson_status ${m.data['cmi.core.lesson_status']} (incomplete until the finish), ${m.count} interactions`);
  const retake1 = await p.evaluate(() => { window.__l4.go('S21R'); return !!document.querySelector('[data-action="retake"]'); });
  await p.evaluate(() => window.__l4.go('S22'));
  await p.click('.w-takeaway[data-id="a"]'); await p.click('.w-next'); await p.click('[data-action="finish"]');
  if (await p.evaluate(() => window.__l4.current) !== 'END') await p.click('[data-action="finish"]'); // (the confirm, without the record)
  m = await p.evaluate(() => window.__scormMock.report());
  expect(!retake1 && m.data['cmi.core.lesson_status'] === 'failed' && m.data['cmi.core.score.raw'] === '0' && m.data['cmi.core.exit'] === 'suspend',
    `SCORM finish under 80: lesson_status ${m.data['cmi.core.lesson_status']}, score.raw ${m.data['cmi.core.score.raw']}, exit "${m.data['cmi.core.exit']}"; no "Retake now" on S21R`);
  const before = await p.evaluate(() => JSON.stringify({ a: window.__l4.state.a, d: window.__l4.state.d, k: window.__l4.state.k, fin: window.__l4.state.fin }));
  m = await p.evaluate(() => { window.__l4.tracking.terminate(); return window.__scormMock.report(); });
  const statuses = [...m.statuses], exits = [...m.exits];
  await p.close();
  p = await open('?live=0', { lms: { ...m.data, 'cmi.core.entry': 'resume', 'cmi.core.exit': '' } });
  const back = await p.evaluate(() => ({ at: window.__l4.current, retake: !!document.querySelector('[data-action="retake"]'),
    state: JSON.stringify({ a: window.__l4.state.a, d: window.__l4.state.d, k: window.__l4.state.k, fin: window.__l4.state.fin }), mock: window.__scormMock.report() }));
  expect(back.at === m.data['cmi.core.lesson_location'] && !back.retake && back.state === before && back.mock.data['cmi.core.lesson_status'] === 'failed' && back.mock.count === m.count, // (the relaunch carries the LMS's data: nothing new written)
    `SCORM relaunch after the failed finish: on ${back.at}, no retake, every answer kept, lesson_status stays failed` + (back.state === before ? '' : `\n    before ${before}\n    after  ${back.state}`) + ` (status ${back.mock.data['cmi.core.lesson_status']}, ${back.mock.count} written, at ${back.at} vs ${m.data['cmi.core.lesson_location']}, retake ${back.retake})`);
  expect(statuses.slice(0, -1).every((s) => s === 'incomplete') && statuses[statuses.length - 1] === 'failed' && exits.length && exits.every((x) => x === 'suspend'),
    `lesson_status incomplete until the finish, then failed (${statuses.join(' > ')}); exit always "suspend"`);
  await p.close();
}

// The adapter alone (src/tracking/scorm12.js on a recording API, in Node), every path a learner can take, with
// each LMS status at launch. Kit 0.1.0 (Noy, 23 Nov 2026: "Show failed"): incomplete until the finish, then passed
// (sticky) or failed with the score; never "completed"; exit always "suspend".
async function scormStatusUnit() {
  console.log('\nPK1: lesson_status and exit in every path (adapter unit)');
  const { createScorm12 } = await import('../src/tracking/scorm12.js');
  const run = (status, steps, fin = false) => {
    const sets = [];
    const api = { LMSInitialize: () => 'true', LMSFinish: () => 'true', LMSCommit: () => 'true', LMSGetLastError: () => '0', LMSGetErrorString: () => '',
      LMSGetValue: (el) => (el === 'cmi.core.lesson_status' ? status : el === 'cmi.interactions._count' ? '0' : ''), LMSSetValue: (el, v) => { sets.push([el, v]); return 'true'; } };
    const a = createScorm12(api);
    a.init(); a.setFinished(fin);
    for (const s of steps) s === 'save' ? a.save('x', 'S01') : a.record(s);
    a.terminate();
    return { st: sets.filter(([el]) => el === 'cmi.core.lesson_status').map(([, v]) => v), ex: sets.filter(([el]) => el === 'cmi.core.exit').map(([, v]) => v) };
  };
  const score = (s, p) => ({ kind: 'score', score: s, passed: p, attempt: 1 });
  const finish = (status, s) => ({ kind: 'finish', status, score: s, passMark: 80, attempt: 1 });
  const paths = {
    'pass then finish': ['save', score(80, true), 'save', finish('passed', 80)],
    'finish below 80': ['save', score(40, false), finish('failed', 40), 'save'],
    'check below, finish below': [score(0, false), finish('failed', 0)],
    'finish asks completed': [finish('completed', null)],
    'passed, later finish below': [score(100, true), score(20, false), finish('failed', 20)],
    'no final check, finish passed': ['save', finish('passed', 90)],
  };
  const all = [];
  for (const [name, steps] of Object.entries(paths)) for (const lms of ['not attempted', 'incomplete', 'passed', 'failed', 'completed']) {
    const r = run(lms, steps, lms === 'incomplete' && name.startsWith('finish below'));
    const passed = lms === 'passed' || steps.some((s) => s.passed || s.status === 'passed');
    const last = r.ex[r.ex.length - 1];
    const finished = steps.some((s) => s.kind === 'finish');
    const failed = !passed && steps.some((s) => s.kind === 'finish' && s.status === 'failed');
    const lastSt = r.st[r.st.length - 1];
    const want = passed ? 'passed' : failed ? 'failed' : null;
    all.push({ name, lms, ok: r.st.every((s) => ['incomplete', 'passed', 'failed'].includes(s)) && (!want || lastSt === want) && r.ex.length && r.ex.every((x) => x === 'suspend') && last === 'suspend', r });
  }
  const bad = all.filter((x) => !x.ok);
  expect(!bad.length, `${all.length} adapter paths: lesson_status incomplete, then passed (sticky) or failed at the finish, never completed; exit always "suspend"` + (bad.length ? ': ' + bad.map((x) => `${x.name} @${x.lms} ${x.r.st.join('>')} exit ${x.r.ex.join('>')}`).join(' | ') : ''));
}

