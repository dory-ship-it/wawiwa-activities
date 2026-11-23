// EAI M1 L4: the states of every screen, driven with the mouse (from the v3 lesson's tools/test-fit.mjs). The kit's
// tools/test-fit.mjs, check-overflow.mjs and shots.mjs read this list through tools/states.mjs; the keyboard walk
// is tests/walk.mjs. STATES: [screen id, state name, async (page) => {}], each from a fresh ?reset=1&screen=ID load;
// the first state of a screen is its arrival. Kit 0.1.0: one attempt (no retake states); PP1: every adaptive screen
// on its support and stretch levels too (the page reloads with ?debug=1&level=).
import { readFileSync } from 'node:fs';
import { CONTENT_PATH, configureSrc } from '../tools/kit.mjs';
await configureSrc();
const { variantOf } = await import('../src/adapt.js');
const shift = (p) => p.keyboard.press('Shift'); // any key stops a ghost hand

// FX7/FX8: a graded choice is selected, then checked: after an answer card or a tile, Check is pressed
// when it can be (a multi-select waits for its last pick; a tile that only opens has no Check)
const click = async (page, sel) => {
  if (sel.includes('data-action="check"') && !(await page.$(sel + ':not([disabled])'))) return; // (already checked after the pick)
  await page.click(sel);
  if (/w-opt|w-tile|w-guess/.test(sel)) await page.evaluate(() => { const c = document.querySelector('[data-action="check"]:not([disabled])'); if (c && c.offsetParent) c.click(); });
};
const BASE_STATES = [
  ['S01', 'hint', async () => {}],
  ['S01', 'picked, today chips', async (p) => click(p, '.w-opt[data-id="a"]')], // v2: a neutral pick on the own case
  ['S01', 'picked today', async (p) => click(p, '.w-opt[data-id="d"]')],
  // V3-1: Intro and Chapter 1 (Round 4)
  ['O1', 'title', async () => {}],
  ['O2', 'L4 open', async (p) => p.keyboard.press('Shift')], // any key stops the ghost hand
  ['O2', 'L1 open', async (p) => click(p, '.w-map-tab[data-station="l1"]')],
  ['O3', 'deliverable', async () => {}], // v2: the deliverable pair (slide 4)
  ['W1', 'statement', async () => {}], // v2: the dark statement opener (slide 6)
  ['K1', 'key idea', async () => {}],
  ['S02', 'hint', async () => {}],
  ['S02', 'one field, Save locked', async (p) => p.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries')],
  ['S02', 'saved', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_TITLE"]', 'Sales call summaries');
    await p.type('.w-input[data-store="L4_CASE_PROBLEM"]', 'Today reps write call summaries by hand, and it hurts because notes reach the CRM a day late and nobody can find them again.');
    await click(p, '[data-action="save"]');
  }],
  ['S03', 'start', async (p) => p.keyboard.press('Shift')], // v2: sort the film's facts (slide 31)
  ['S03', 'card picked up', async (p) => { await p.keyboard.press('Shift'); await click(p, '[data-action="card"]'); }],
  ['S03', 'wrong drop', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['metric']); }],
  ['S03', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['map', 'metric', 'map', 'metric', 'map', 'metric']); }],
  ['V1', 'play view', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['V1', 'transcript open', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); await click(p, '.w-tr'); }],
  ['V1', 'stop, wrong', async (p) => { await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="a"]'); }],
  ['V1', 'stop, right', async (p) => { await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="b"]'); }],
  // NL2: Chapter 2 (storyboard v3)
  ['W2', 'opener', async () => {}], // v2: the chapter opener (slide 9)
  ['K2', 'key idea', async () => {}],
  ['K2', 'HR case on', async (p) => click(p, '[data-action="caseToggle"]')],
  ['S04', 'start', async (p) => p.keyboard.press('Shift')], // any key stops the ghost hand
  ['S04', 'card picked up', async (p) => { await p.keyboard.press('Shift'); await click(p, '[data-action="card"]'); }],
  // FX5: every drop is judged at once (no Check): a wrong drop flashes red with its line, a right one stays
  ['S04', 'wrong drop', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['c']); }],
  ['S04', 'two right', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'b']); }],
  ['S04', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'b', 'a', 'b', 'b', 'c']); }],
  ['S05a', 'key idea', async () => {}],
  ['S05b', 'start', async (p) => p.keyboard.press('Shift')],
  ['S05b', 'wrong drop', async (p) => { await p.keyboard.press('Shift'); await labels(p, [['event', 'a']]); }],
  ['S05b', 'one right', async (p) => { await p.keyboard.press('Shift'); await labels(p, [['swimlane', 'a']]); }],
  ['S05b', 'done', async (p) => { await p.keyboard.press('Shift'); await labels(p, [['swimlane', 'a'], ['gateway', 'b'], ['event', 'c']]); }],
  ['S06', 'hint', async () => {}],
  ['S06', 'situation 1 wrong', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S06', 'situation 1 right', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S06', 'situation 2 wrong', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '[data-action="nextSituation"]'); await click(p, '.w-situation-now .w-opt[data-id="a"]'); }],
  ['S06', 'both right', async (p) => { await click(p, '.w-opt[data-id="a"]'); await click(p, '[data-action="nextSituation"]'); await click(p, '.w-situation-now .w-opt[data-id="b"]'); }],
  ['S07', 'tile 5 open', async (p) => { await p.keyboard.press('Shift'); await click(p, '.w-tile[data-n="5"]'); }],
  ['S07', 'all eight opened', async (p) => { await p.keyboard.press('Shift'); for (let n = 1; n <= 8; n++) await click(p, `.w-tile[data-n="${n}"]`); }], // v2: no question
  ['S08', 'round 1 wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S08', 'round 1 right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S08', 'round 3 right', async (p) => {
    for (const k of ['b', 'c']) { await click(p, `.w-opt[data-id="${k}"]`); await click(p, '[data-action="nextRound"]'); }
    await click(p, '.w-opt[data-id="a"]');
  }],
  ['S08B', 'hint', async () => {}],
  ['S08B', 'one part, Save locked', async (p) => p.type('.w-input[data-store="L4_CASE_TRIGGER"]', 'A sales call ends')],
  ['S08B', 'saved, full', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_TRIGGER"]', 'A request form arrives from a sales rep after every customer call, by email');
    await p.type('.w-input[data-store="L4_CASE_STEPS"]', 'The rep writes notes by hand, the team lead checks them, the sales manager reads them two days later and asks follow-up questions by phone');
    await p.type('.w-input[data-store="L4_CASE_OUTPUT"]', 'A call summary in the CRM, to the sales manager and the account team');
    await click(p, '[data-action="save"]');
  }],
  // NL3: Chapters 3 and 4 (storyboard v3)
  ['W3', 'opener', async () => {}], // v2: the chapter opener (slide 15)
  ['W5', 'opener', async () => {}], // v2: new, Build yours (slide 35)
  ['W6', 'opener', async () => {}], // v2: new, Wrap-up (slide 39)
  ['K3', 'key idea', async () => {}], // v2: new, slide 38
  ['V2', 'play view', async (p) => { await p.waitForFunction(() => document.querySelectorAll('.w-tline').length > 0); }],
  ['V2', 'stop 3, wrong', async (p) => {
    for (const k of ['b', 'a']) { await toStop(p); await click(p, `.w-stop-view .w-opt[data-id="${k}"]`); await click(p, '[data-action="resume"]'); }
    await toStop(p); await click(p, '.w-stop-view .w-opt[data-id="a"]');
  }],
  ['V2', 'ended', async (p) => {
    for (const k of ['b', 'a', 'b']) { await toStop(p); await click(p, `.w-stop-view .w-opt[data-id="${k}"]`); await click(p, '[data-action="resume"]'); }
    await playUntil(p, () => document.querySelector('.w-next').dataset.locked === 'false', 'video end');
  }],
  ['S09', 'start', async (p) => p.keyboard.press('Shift')],
  ['S09', 'wrong drop', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['b']); }],
  ['S09', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['a', 'a', 'b', 'c', 'd', 'd']); }],
  ['S10', 'wrong', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S10', 'right', async (p) => click(p, '.w-opt[data-id="c"]')],
  ['S11', 'wrong', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S11', 'right', async (p) => click(p, '.w-opt[data-id="d"]')],
  ['S12', 'start', async () => {}],
  ['S12', 'wrong click', async (p) => click(p, '.w-target[data-target="3"]')],
  ['S12', 'one right', async (p) => click(p, '.w-target[data-target="4"]')],
  ['S12', 'both right', async (p) => { await click(p, '.w-target[data-target="4"]'); await click(p, '.w-target[data-target="7"]'); }],
  ['S12B', 'hint', async () => {}],
  ['S12B', 'Baseline only, Save locked', async (p) => p.type('.w-input[data-store="L4_CASE_BASELINE"]', 'About 2 days')],
  ['S12B', 'saved, full', async (p) => {
    await p.type('.w-input[data-store="L4_CASE_BASELINE"]', 'About two working days from the call to a summary in the CRM, by our own count');
    await p.type('.w-input[data-store="L4_CASE_TARGET"]', 'The same working day for nine summaries out of ten, checked on a weekly sample');
    await p.type('.w-input[data-store="L4_CASE_DATE"]', 'Within three months of the pilot start');
    await click(p, '[data-action="save"]');
  }],
  ['W4', 'opener', async () => {}], // v2: the chapter opener (the warm-up retired)
  ['S13', 'start', async () => {}],
  // v2: seven steps, the HR process from 2 to 6; the feedback under the clicked step (the first and last ones too)
  ['S13', 'start wrong', async (p) => click(p, '.w-target[data-target="3"]')],
  ['S13', 'start wrong, first step', async (p) => click(p, '.w-target[data-target="1"]')],
  ['S13', 'start placed', async (p) => click(p, '.w-target[data-target="2"]')],
  ['S13', 'end wrong, last step', async (p) => { await click(p, '.w-target[data-target="2"]'); await click(p, '.w-target[data-target="7"]'); }],
  ['S13', 'both right', async (p) => { await click(p, '.w-target[data-target="2"]'); await click(p, '.w-target[data-target="6"]'); }],
  // v2: the handoff record, four of six (multi)
  ['S14', 'hint', async () => {}],
  ['S14', 'four picked', async (p) => { for (const id of ['a', 'b', 'c', 'd']) await click(p, `.w-opt[data-id="${id}"]`); }],
  ['S14', 'checked, one wrong', async (p) => { for (const id of ['a', 'b', 'c', 'e']) await click(p, `.w-opt[data-id="${id}"]`); await click(p, '[data-action="check"]'); }],
  ['S14', 'checked, right', async (p) => { for (const id of ['a', 'b', 'c', 'd']) await click(p, `.w-opt[data-id="${id}"]`); await click(p, '[data-action="check"]'); }],
  ['S15', 'hint', async () => {}],
  ['S15', 'wrong', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S15', 'right', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['K4', 'key idea', async () => {}],
  ['S16', 'start', async (p) => p.keyboard.press('Shift')],
  ['S16', 'card picked up', async (p) => { await p.keyboard.press('Shift'); await click(p, '[data-action="card"]'); }],
  ['S16', 'wrong drop', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['poor']); }], // v2: two columns
  ['S16', 'done', async (p) => { await p.keyboard.press('Shift'); await deck(p, ['good', 'poor', 'good', 'poor', 'poor', 'good']); }],
  // FX2 D1: S17 one case at a time, the mistakes as answer cards
  ['S17', 'case 1', async (p) => p.keyboard.press('Shift')],
  ['S17', 'case 1 wrong', async (p) => { await p.keyboard.press('Shift'); await click(p, '.w-opt[data-id="1"]'); }],
  ['S17', 'case 1 revealed', async (p) => { await p.keyboard.press('Shift'); await click(p, '.w-opt[data-id="1"]'); await click(p, '.w-opt[data-id="2"]'); }],
  ['S17', 'case 5 (longest) wrong', async (p) => { await p.keyboard.press('Shift'); await cases(p, ['3', '1', '5', '4']); await click(p, '.w-opt[data-id="5"]'); }],
  ['S17', 'done', async (p) => { await p.keyboard.press('Shift'); await cases(p, ['3', '1', '5', '4']); await click(p, '.w-opt[data-id="2"]'); }],
  ['S17B', 'hint', async () => {}],
  ['S17B', 'one field, Save locked', async (p) => p.type('.w-input[data-store="L4_CASE_AIFIT"]', 'Sort notes by topic')],
  ['S17B', 'saved, full, long steps', async (p) => {
    await p.evaluate(() => { window.__l4.state.f.L4_CASE_STEPS = 'Steps and who does them '.repeat(11).slice(0, 250); window.__l4.go('S17B'); });
    await p.type('.w-input[data-store="L4_CASE_AIFIT"]', 'Sort the incoming call notes by topic and by account before the sales manager reads them');
    await p.type('.w-input[data-store="L4_CASE_HUMAN"]', 'Approve a discount or an exception for a key account, with the account history');
    await click(p, '[data-action="save"]');
  }],
  // NL4: Chapters 5 and 6 (storyboard v3)
  // FX2 D2: S18A the workbook rows with a select each (row: card)
  ['S18A', 'rows', async () => {}],
  ['S18A', 'checked, two wrong', async (p) => { await fields(p, { a: '1', b: '3', c: '2', d: '4' }); await click(p, '[data-action="check"]'); }],
  ['S18A', 'shown after attempt 2', async (p) => { await fields(p, { a: '1', b: '3', c: '2', d: '4' }); await click(p, '[data-action="check"]'); await fields(p, { b: '4' }); await click(p, '[data-action="check"]'); }],
  ['S18A', 'done', async (p) => { await fields(p, { a: '1', b: '2', c: '3', d: '4' }); await click(p, '[data-action="check"]'); }],
  ['S18', 'hint', async () => {}],
  ['S18', 'wrong (longest line)', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S18', 'right', async (p) => click(p, '.w-opt[data-id="b"]')],
  ['S18B', 'hint, long title', async (p) => { await p.evaluate(() => { window.__l4.state.f.L4_CASE_TITLE = 'Summaries of sales calls for key accounts in the north region'.slice(0, 60); window.__l4.go('S18B'); }); }],
  ['S18B', 'unticked', async (p) => { await p.type('.w-input', 'Sales call summaries'); await click(p, '[data-action="save"]'); }],
  ['S18B', 'saved', async (p) => { await p.type('.w-input', 'Sales call summaries'); await click(p, '.w-checkbox'); await click(p, '[data-action="save"]'); }],
  // FX4: S19 is S19A (brief), S19B (open, the copy cards), S19C (back: Yes / Not yet)
  ['S19A', 'brief', async () => {}],
  ['S19B', 'nothing written', async () => {}],
  ['S19B', 'every note full', async (p) => { await fullNotes(p); }],
  ['S19B', 'opened, every note full', async (p) => { await fullNotes(p); await noNewTab(p, '[data-action="open"]'); await click(p, '[data-action="open"]'); }],
  ['S19C', 'question', async () => {}],
  ['S19C', 'not yet', async (p) => { await noNewTab(p, '[data-action="reopen"]'); await click(p, '[data-action="pdfNotYet"]'); }],
  ['S19C', 'yes', async (p) => click(p, '[data-action="pdfYes"]')],
  ['S19B', 'copy blocked, every note full', async (p) => {
    await fullNotes(p);
    await p.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('blocked')) } }));
    await click(p, '[data-action="copy"][data-card="sketch"]'); await new Promise((r) => setTimeout(r, 200));
  }],
  ['S20', 'row answered', async (p) => click(p, '.w-check-row[data-row="q1"] [data-choice="notYet"]')],
  ['S20', 'all answered, fix line', async (p) => { for (const [q, c] of [['q1', 'yes'], ['q2', 'notYet'], ['q3', 'yes']]) await click(p, `.w-check-row[data-row="${q}"] [data-choice="${c}"]`); }],
  ['S20B', 'hint', async () => {}],
  ['S20B', 'picked (longest fix)', async (p) => click(p, '.w-opt[data-id="automating"]')],
  // QZ2: a pick only selects; Next question sends it with no feedback; after the last item, the review
  ['S21', 'item 1 picked', async (p) => click(p, '.w-kc-opt[data-id="b"]')],
  ['S21', 'item 5 picked (QZ1, the source owner)', async (p) => {
    for (const k of ['c', 'b', 'a', 'd']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
    await click(p, '.w-kc-opt[data-id="a"]');
  }],
  ['S21', 'tiles picked', async (p) => {
    for (const k of ['c', 'b', 'a', 'd', 'b']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
    await click(p, '.w-kc-tile[data-n="5"]'); await click(p, '.w-kc-tile[data-n="1"]');
  }],
  ['S21', 'review, item 1 wrong', async (p) => {
    for (const k of ['a', 'b', 'a', 'd', 'b']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
    await click(p, '.w-kc-tile[data-n="5"]'); await click(p, '.w-kc-tile[data-n="6"]'); await click(p, '[data-action="check"]');
  }],
  ['S21', 'review, tiles one of two', async (p) => {
    for (const k of ['c', 'b', 'a', 'd', 'b']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
    await click(p, '.w-kc-tile[data-n="5"]'); await click(p, '.w-kc-tile[data-n="1"]'); await click(p, '[data-action="check"]');
    for (let i = 0; i < 5; i++) await click(p, '[data-action="nextAnswer"]');
  }],
  ['S21', 'review, tiles right (both lines)', async (p) => {
    for (const k of ['c', 'b', 'a', 'd', 'b']) { await click(p, `.w-kc-opt[data-id="${k}"]`); await click(p, '[data-action="nextQuestion"]'); }
    await click(p, '.w-kc-tile[data-n="5"]'); await click(p, '.w-kc-tile[data-n="6"]'); await click(p, '[data-action="check"]');
    for (let i = 0; i < 5; i++) await click(p, '[data-action="nextAnswer"]');
  }],
  ['S21R', 'not passed, all six missed', async (p) => { await attempt(p, { L4_S21_1: 'a|w', L4_S21_2: 'a|w', L4_S21_3: 'b|w', L4_S21_4: 'a|w', L4_S21_6: 'a|w', L4_S21_5: '5,7|w' }, { n: 1, s: 0, p: 0 }); }],
  ['S21R', 'passed', async (p) => { await attempt(p, { L4_S21_1: 'c|c', L4_S21_2: 'b|c', L4_S21_3: 'a|c', L4_S21_4: 'd|c', L4_S21_6: 'a|w', L4_S21_5: '3,6|w' }, { n: 1, s: 80, p: 1 }, true); }],
  ['S14', 'back to the check', async (p) => { await attempt(p, { L4_S21_1: 'a|w' }, { n: 1, s: 0, p: 0 }); await click(p, '[data-action="review"][data-screen="S14"]'); }],
  ['S22', 'takeaway', async (p) => click(p, '.w-takeaway[data-id="b"]')],
  // FX4: Finish no longer asks for the record first (one click finishes and opens END), so step 2 is the state to measure
  ['S22', 'step 2', async (p) => { await click(p, '.w-takeaway[data-id="a"]'); await click(p, '.w-next'); }],
  ['S22', 'record downloaded', async (p) => { await click(p, '.w-takeaway[data-id="a"]'); await click(p, '.w-next'); await click(p, '[data-action="download"]'); }],
  // FX2 G: the closing screen, passed and not passed yet
  ['END', 'passed', async (p) => { await attempt(p, { L4_S21_1: 'c|c', L4_S21_2: 'b|c', L4_S21_3: 'a|c', L4_S21_4: 'd|c', L4_S21_6: 'b|c', L4_S21_5: '5,6|c' }, { n: 1, s: 100, p: 1 }, true); await p.evaluate(() => window.__l4.go('END')); }],
  ['END', 'not passed yet', async (p) => { await attempt(p, { L4_S21_1: 'a|w' }, { n: 1, s: 0, p: 0 }); await p.evaluate(() => window.__l4.go('END')); }],
];

// NL4: every note the S19 copy cards show, at its field's maxlength
async function fullNotes(p) {
  await p.evaluate(() => { const f = window.__l4.state.f; Object.assign(f, { L4_CASE_TITLE: 't'.repeat(60), L4_CASE_PROBLEM: 'The problem today '.repeat(14).slice(0, 250),
    L4_CASE_TRIGGER: 'Trigger text '.repeat(10).slice(0, 120), L4_CASE_STEPS: 'Steps and who does them '.repeat(11).slice(0, 250), L4_CASE_OUTPUT: 'Output text '.repeat(11).slice(0, 120),
    L4_CASE_BASELINE: 'b'.repeat(80), L4_CASE_TARGET: 't'.repeat(80), L4_CASE_DATE: 'd'.repeat(40), L4_CASE_AIFIT: 'Could fit AI '.repeat(8).slice(0, 100), L4_CASE_HUMAN: 'Stays with a person '.repeat(6).slice(0, 100) }); window.__l4.go('S19B'); });
}
// NL4: an attempt of the check (first answers, the attempt state), then S21R. Kit 0.1.0: the score is the lesson's,
// so the questions before the check are answered in the state too: all right (along = true) or all wrong
async function attempt(p, answers, k, along = false) {
  await p.evaluate((a, kk, r) => {
    const L = window.__l4, s = L.state;
    for (const sc of L.content.screens) if (sc.template !== 'check') for (const t of [...(sc.tracking || []), ...(sc.stops || []).map((x) => x.tracking)]) if (t?.scored) s.a[t.id] = r ? 'x|c' : 'y|w';
    Object.assign(s.a, a); s.k = kk; s.d.push('S21'); L.go('S21R');
  }, answers, k, along);
}
// the flags (S12, S13): click a flag, then its target
async function flag(p, f, t) { await click(p, `.w-target[data-target="${t}"]`); } // FX8: no tray; a click places the next flag (S13: Start, then End)
// S05b: click a label, then its place, per pair
async function labels(p, pairs) { for (const [l, t] of pairs) { await click(p, `.w-label-card[data-label="${l}"]`); await click(p, `.w-target[data-target="${t}"]`); } }
// FX2 D1 (S17): the right mistake for each case given, then "Next case"
async function cases(p, picks) { for (const k of picks) { await click(p, `.w-opt[data-id="${k}"]`); await click(p, '[data-action="nextCase"]'); } }
// FX2 D2 (S18A): a card chosen in each row given ({ row: card })
async function fields(p, rows) { for (const [r, c] of Object.entries(rows)) await p.select(`select[data-row="${r}"]`, c); }
// the sort deck: click the card, then a column, once per column given
async function deck(p, cols) { for (const col of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${col}"]`); } }
// links that open a new tab: keep the test inside the module (the tab itself is checked in walk.mjs)
async function noNewTab(p, sel) { await p.evaluate((s) => document.querySelector(s).addEventListener('click', (e) => e.preventDefault(), { capture: true }), sel); }
// the video player: no seeking ahead of what was watched, so play muted at 16x to the next stop
async function fastPlay(p) {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
}
// Headless Chrome at a 2560x1080 window sometimes stalls a 16x video (fully buffered, time stuck;
// 1x plays normally). When the time stops moving, re-seek to the same point (it resets the decoder)
// and play on at 4x, until done() is true. Report where it got to if it never is.
async function playUntil(p, done, what) {
  await fastPlay(p);
  let last = -1;
  for (let i = 0; i < 60; i++) {
    if (await p.evaluate(done)) return;
    last = await p.evaluate((prev) => {
      const v = document.querySelector('.w-video');
      if (document.querySelector('.w-stop-view').hidden && !v.ended && (v.paused || Math.abs(v.currentTime - prev) < 0.01)) {
        v.pause(); v.currentTime = v.currentTime; v.muted = true; v.playbackRate = 4; v.play().catch(() => {});
      }
      return v.currentTime;
    }, last);
    await new Promise((r) => setTimeout(r, 1000));
  }
  const at = await p.evaluate(() => { const v = document.querySelector('.w-video'); return `t ${v.currentTime.toFixed(1)}, paused ${v.paused}, readyState ${v.readyState}, error ${v.error?.code ?? 'none'}`; });
  throw new Error(`${what} not reached in 60 s: ${at}`);
}
const toStop = (p) => playUntil(p, () => !document.querySelector('.w-stop-view').hidden, 'video stop');

/* PP1: the adaptive screens' states on each level (support and stretch; core is in the list above) */
const longest = (list, text) => [...list].sort((a, b) => text(b).length - text(a).length)[0];
function levelStates(x) {
  if (x.variant === 'cases') {
    const picks = x.cards.map((c) => c.column);
    const miss = (k) => x.options.find((o) => o.id !== picks[k]).id;
    return [['case 1', shift], ['case 1 wrong', async (p) => { await shift(p); await click(p, `.w-opt[data-id="${miss(0)}"]`); }],
      ['last case wrong', async (p) => { await shift(p); await cases(p, picks.slice(0, -1)); await click(p, `.w-opt[data-id="${miss(picks.length - 1)}"]`); }],
      ['done', async (p) => { await shift(p); await cases(p, picks.slice(0, -1)); await click(p, `.w-opt[data-id="${picks[picks.length - 1]}"]`); }]];
  }
  // v2 (S14): pick n of six, then Check
  if (x.variant === 'multi') {
    const keys = x.options.filter((o) => o.correct).map((o) => o.id);
    const wrong = longest(x.options.filter((o) => !o.correct), (o) => o.feedback).id;
    const pick = async (p, ids) => { for (const id of ids) await click(p, `.w-opt[data-id="${id}"]`); await click(p, '[data-action="check"]'); };
    return [['hint', async () => {}], ['checked, one wrong (longest line)', async (p) => pick(p, [...keys.slice(0, -1), wrong])], ['checked, right', async (p) => pick(p, keys)]];
  }
  if (x.template === 'decision') {
    const right = x.options.find((o) => o.correct).id;
    const wrongs = x.options.filter((o) => !o.correct).sort((a, b) => b.feedback.length - a.feedback.length).map((o) => o.id);
    return [['hint', async () => {}], ['wrong (longest line)', async (p) => click(p, `.w-opt[data-id="${wrongs[0]}"]`)], ['right', async (p) => click(p, `.w-opt[data-id="${right}"]`)],
      ['revealed after two wrong', async (p) => { await click(p, `.w-opt[data-id="${wrongs[0]}"]`); await click(p, `.w-opt[data-id="${wrongs[1]}"]`); }]];
  }
  if (x.template === 'sortDeck') {
    const cols = x.cards.map((c) => c.column);
    const ids = x.columns.map((c) => c.id); // (v2: S16 has two columns, good and poor)
    return [['start', shift], ['checked, wrong back', async (p) => { await shift(p); await deck(p, cols.map((c) => (c === ids[0] ? ids[1] : ids[0]))); await click(p, '[data-action="check"]'); }],
      ['done', async (p) => { await shift(p); await deck(p, cols); await click(p, '[data-action="check"]'); }]];
  }
  if (x.template === 'flags') {
    const [t1, t2] = x.map.filter((f) => f.correct).map((f) => String(f.n));
    const wrong = String(longest(x.map.filter((f) => !f.correct), (f) => f.feedback).n);
    return [['start', async () => {}], ['checked, one back (longest line)', async (p) => { await flag(p, 'r1', t1); await flag(p, 'r2', wrong); await click(p, '[data-action="check"]'); }],
      ['both right', async (p) => { await flag(p, 'r1', t1); await flag(p, 'r2', t2); await click(p, '[data-action="check"]'); }]];
  }
  return [];
}
const ADAPTIVE = JSON.parse(readFileSync(CONTENT_PATH, 'utf8')).screens.filter((s) => s.variants);
const levelUp = (level) => async (p) => {
  const u = new URL(p.url()); u.searchParams.set('debug', '1'); u.searchParams.set('level', level);
  await p.goto(u.href, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
};
const LEVEL_STATES = ADAPTIVE.flatMap((s) => ['support', 'stretch'].flatMap((lv) => levelStates(variantOf(s, lv)).map(([name, act]) => [s.id, `[${lv}] ${name}`, async (p) => { await levelUp(lv)(p); await act(p); }])));
export const STATES = [...BASE_STATES, ...LEVEL_STATES];
