// DM M2 L2: the states of every screen, driven with the mouse (the kit's tools/test-fit.mjs, check-overflow.mjs
// and shots.mjs read this list through tools/states.mjs; the keyboard walk is tests/walk.mjs).
// STATES: [screen id, state name, async (page) => {}], each from a fresh ?reset=1&screen=ID load.
// The first state of a screen is its arrival. The helpers for the kit's screen types: tools/state-helpers.mjs.
import { shift, sleep, click, clickAll, noNewTab, openWorkbook, deck, pick, tile, dimension, allGoals, playUntil, toStop, toEnd, stop, resume, pick2, nextRound, rounds2, row, audioAt, audioEnd, fields, doCheck, go } from '../tools/state-helpers.mjs';

export async function allTiles(p, ga = false) {
  await tile(p, 1, ['y']);
  await tile(p, 2, ['web', 'social']);
  await tile(p, 3, ga ? ['web', 'brand', 'ga'] : ['web', 'brand']);
  await tile(p, 4);
}
// S06: mark every card (gaps: the card numbers marked Gap)
export async function allCards(p, gaps = []) {
  for (let n = 1; n <= 6; n++) await click(p, `.d-qc[data-card="${n}"] [data-action="${gaps.includes(n) ? 'gap' : 'can'}"]`);
}
export async function allDimensions(p) {
  await dimension(p, 0);
  for (let i = 1; i < 8; i++) { await click(p, '[data-action="allDimensions"]'); await click(p, '[data-action="explore"]'); }
}
// the result and the end need the lesson's scored questions behind them (kit 0.1.0: the score comes from the
// questions along the lesson, not from the check alone): the questions before the check are answered in the state
// (all right, or all wrong), then the check is answered on screen
export async function seedAlong(p, right) {
  await p.evaluate((r) => {
    const L = window.__l4;
    for (const s of L.content.screens) if (s.template !== 'check') for (const t of [...(s.tracking || []), ...(s.stops || []).map((x) => x.tracking)]) if (t?.scored) L.state.a[t.id] = (r ? 'x' : 'y') + '|' + (r ? 'c' : 'w');
  }, right);
}
export async function resultAfter(p, ids, right = true) { await seedAlong(p, right); await go(p, 'CHK'); await doCheck(p, ids); await go(p, 'CHKR'); }
export async function endAfter(p, ids, right = true) { await seedAlong(p, right); await go(p, 'CHK'); await doCheck(p, ids); await p.evaluate(() => window.__l4.finishLesson()); await go(p, 'END'); }
const ALL_RIGHT = ['b', 'b', 'c', 'b', 'b'], TWO_RIGHT = ['a', 'b', 'c', 'a', 'a'];

export const STATES = [
  /* Opening */
  ['O1', 'title', async () => {}],
  ['O2', 'today open', shift],
  ['O2', 'component 1 open', async (p) => { await shift(p); await click(p, '.w-map-tab[data-station="c1"]'); }],
  ['O2', 'component 4 open', async (p) => { await shift(p); await click(p, '.w-map-tab[data-station="c4"]'); }],
  ['O3', 'rows closed', shift],
  ['O3', 'one row open', async (p) => { await shift(p); await click(p, '.d-bring-btn[data-row="map"]'); }],
  ['O3', 'all rows open', async (p) => { await shift(p); for (const r of ['map', 'sheet', 'agent']) await click(p, `.d-bring-btn[data-row="${r}"]`); }],
  ['WB0', 'before', async () => {}],
  ['WB0', 'opened', openWorkbook],
  /* Where are we? */
  ['W3', 'opener', async () => {}],
  ['CALL', 'ringing', async () => {}],
  ['CALL', 'on the call', async (p) => { await click(p, '[data-action="callAnswer"]'); await audioAt(p, 12); }],
  ['CALL', 'ended', async (p) => { await click(p, '[data-action="callAnswer"]'); await audioEnd(p); }],
  // (Noy, 26 Nov 2026) the bar's sound button, pressed: the lesson's sound effects muted
  ['CALL', 'sound muted', async (p) => { await click(p, '.w-bar-sound'); }],
  ['S05', 'four tiles', shift],
  ['S05', 'tile 1 open', async (p) => { await shift(p); await click(p, '.d-tile-head[data-tile="1"]'); }],
  ['S05', 'tile 1 answered, proof', async (p) => { await shift(p); await click(p, '.d-tile-head[data-tile="1"]'); await click(p, '.d-chip[data-value="y"]'); }],
  ['S05', 'tile 2 open, chips', async (p) => { await shift(p); await tile(p, 1, ['y']); await click(p, '.d-tile-head[data-tile="2"]'); await click(p, '.d-chip[data-value="web"]'); }],
  ['S05', 'tile 3 open, all chips', async (p) => { await shift(p); await click(p, '.d-tile-head[data-tile="3"]'); for (const v of ['web', 'social', 'mail', 'brand', 'ga']) await click(p, `.d-chip[data-value="${v}"]`); }],
  ['S05', 'tile 4 open', async (p) => { await shift(p); await tile(p, 1, ['y']); await tile(p, 2, ['none']); await tile(p, 3, ['web', 'social', 'mail', 'brand', 'ga']); await click(p, '.d-tile-head[data-tile="4"]'); }],
  ['S05', 'done, no analytics', async (p) => { await shift(p); await allTiles(p, false); }],
  ['S05', 'done, with analytics', async (p) => { await shift(p); await allTiles(p, true); }],
  ['S06', 'six cards', shift],
  ['S06', 'three marked', async (p) => { await shift(p); await click(p, '.d-qc[data-card="1"] [data-action="can"]'); await click(p, '.d-qc[data-card="2"] [data-action="gap"]'); await click(p, '.d-qc[data-card="5"] [data-action="can"]'); }],
  ['S06', 'done, with gaps', async (p) => { await shift(p); await allCards(p, [2, 4]); }],
  ['S06', 'done, no gap', async (p) => { await shift(p); await allCards(p); }],
  ['WB1', 'before', async () => {}],
  ['WB1', 'opened', openWorkbook],
  ['VK1', 'ready', async () => {}],
  ['VK1', 'ended', async (p) => { await toEnd(p); }],
  ['K1', 'map', shift],
  ['K1', 'map, node 1 selected', async (p) => { await shift(p); await p.evaluate(() => document.querySelectorAll('.d-dim-node')[0].click()); }],
  ['K1', 'map, node 2 selected', async (p) => { await shift(p); await p.evaluate(() => document.querySelectorAll('.d-dim-node')[1].click()); }],
  ['K1', 'map, node 8 selected', async (p) => { await shift(p); await p.evaluate(() => document.querySelectorAll('.d-dim-node')[7].click()); }],
  ['K1', 'detail 1', async (p) => { await shift(p); await dimension(p, 0); }],
  ['K1', 'detail 2', async (p) => { await shift(p); await dimension(p, 1); }],
  ['K1', 'detail 4', async (p) => { await shift(p); await dimension(p, 3); }],
  ['K1', 'detail 7', async (p) => { await shift(p); await dimension(p, 6); }],
  ['K1', 'detail 8, all explored', async (p) => { await shift(p); await allDimensions(p); }],
  ['K1', 'map again, all explored', async (p) => { await shift(p); await allDimensions(p); await click(p, '[data-action="allDimensions"]'); }],
  ['S07', 'start', shift],
  ['S07', 'one right', async (p) => { await shift(p); await deck(p, ['value']); }],
  ['S07', 'one wrong', async (p) => { await shift(p); await deck(p, ['insight']); }],
  ['S07', 'two wrong, shown', async (p) => { await shift(p); await deck(p, ['insight', 'value', 'value', 'insight', 'value', 'insight', 'insight']); }],
  ['S07', 'done', async (p) => { await shift(p); await deck(p, ['value', 'insight', 'value', 'insight', 'value', 'insight']); }],
  ['WB2', 'before', async () => {}],
  ['WB2', 'opened', openWorkbook],
  ['K2', 'five questions', async () => {}],
  ['K2', 'end of chapter', async (p) => click(p, '.w-next')],
  /* Our goals */
  ['W4', 'opener', async () => {}],
  ['S11', 'five cards', shift],
  ['S11', 'card 1 open', async (p) => { await shift(p); await click(p, '.d-goal[data-goal="sales"]'); }],
  ['S11', 'card 5 open, key line', async (p) => { await shift(p); await click(p, '.d-goal[data-goal="information"]'); }],
  ['S11', 'all open', async (p) => { await shift(p); await allGoals(p); }],
  ['S11B', 'question', async () => {}],
  ['S11B', 'picked', async (p) => click(p, '.w-opt[data-id="a"]')],
  ['S11B', 'wrong a', async (p) => pick(p, 'a')],
  ['S11B', 'wrong b', async (p) => pick(p, 'b')],
  ['S11B', 'right', async (p) => pick(p, 'c')],
  ['V1', 'ready', async () => {}],
  ['V1', 'playing', async (p) => { await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 2); await click(p, '[data-action="bigplay"]'); await sleep(700); await p.evaluate(() => document.querySelector('.w-video').pause()); }],
  ['V1', 'transcript open', async (p) => { await click(p, '.w-tr'); }],
  // kit 0.1.0: the speed menu with 0.5 and 0.75 (Noy, 23 Nov 2026)
  ['V1', 'speed menu open', async (p) => { await click(p, '[data-action="speed"]'); }],
  ['V1', 'speed 0.5', async (p) => { await click(p, '[data-action="speed"]'); await click(p, '.w-speed-item[data-rate="0.5"]'); }],
  ['V1', 'stop 1', toStop],
  ['V1', 'stop 1 wrong', async (p) => stop(p, 'a')],
  ['V1', 'stop 1 right', async (p) => stop(p, 'b')],
  ['V1', 'stop 2 wrong', async (p) => { await stop(p, 'b'); await resume(p); await stop(p, 'a'); }],
  ['V1', 'stop 2 right', async (p) => { await stop(p, 'b'); await resume(p); await stop(p, 'b'); }],
  ['V1', 'ended', async (p) => { await stop(p, 'b'); await resume(p); await stop(p, 'b'); await resume(p); await toEnd(p); }],
  ['WB3', 'before', async () => {}],
  ['WB3', 'opened', openWorkbook],
  ['K3', 'key line', async () => {}],
  /* From analysis to a work plan */
  ['W5', 'opener', async () => {}],
  ['S14', 'eight challenges', async () => {}],
  ['S14', 'two marked', async (p) => { await click(p, '.d2-cl-row[data-item="c3"]'); await click(p, '.d2-cl-row[data-item="c6"]'); }],
  ['S14', 'done', async (p) => { await click(p, '.d2-cl-row[data-item="c1"]'); await click(p, '.d2-cl-row[data-item="c6"]'); await click(p, '[data-action="done"]:not([disabled])'); }],
  ['S15', 'rows closed', shift],
  ['S15', 'three open', async (p) => { await shift(p); for (const r of ['ppc', 'social', 'aff']) await click(p, `.d2-rt-ch[data-row="${r}"]`); }],
  ['S15', 'all open', async (p) => { await shift(p); await clickAll(p, '.d2-rt-ch'); }],
  ['S15B', 'round 1', async () => {}],
  ['S15B', 'round 1 picked', async (p) => click(p, '.d2-opt[data-id="a"]')],
  ['S15B', 'round 1 wrong', async (p) => pick2(p, 'a')],
  ['S15B', 'round 1 right', async (p) => pick2(p, 'b')],
  ['S15B', 'round 2 wrong', async (p) => { await pick2(p, 'b'); await nextRound(p); await pick2(p, 'c'); }],
  ['S15B', 'round 3 right, done', async (p) => rounds2(p, ['b', 'a', 'c'])],
  ['S16', 'ready', async () => {}],
  ['S16', 'transcript open', async (p) => { await click(p, '.w-tr'); }],
  ['S16', 'ended', async (p) => { await toEnd(p); }],
  ['S17', 'only the areas', shift],
  ['S17', 'two columns', async (p) => { await shift(p); for (const c of ['status', 'goal']) await click(p, `.d2-b-head[data-column="${c}"]`); }],
  ['S17', 'all columns', async (p) => { await shift(p); for (const c of ['status', 'goal', 'gap', 'action', 'budget']) await click(p, `.d2-b-head[data-column="${c}"]`); }],
  ['S17C', 'question 1', async () => {}],
  ['S17C', 'question 1 wrong', async (p) => pick2(p, 'a')],
  ['S17C', 'question 1 right', async (p) => pick2(p, 'b')],
  ['S17C', 'question 2 right', async (p) => { await pick2(p, 'b'); await nextRound(p); await pick2(p, 'b'); }],
  ['S17C', 'question 2 wrong', async (p) => { await pick2(p, 'b'); await nextRound(p); await pick2(p, 'c'); }],
  ['S17C', 'question 3 wrong, done', async (p) => rounds2(p, ['b', 'b', 'c'])],
  ['WB4', 'before', async () => {}],
  ['WB4', 'opened', openWorkbook],
  /* Simulations */
  ['W6', 'opener', async () => {}],
  ['S20', 'case', async () => {}],
  ['S20', 'picked', async (p) => click(p, '.d2-opt[data-id="ppc"]')],
  ['S20', 'answer, wrong pick', async (p) => pick2(p, 'ppc')],
  ['S20', 'answer, right pick', async (p) => pick2(p, 'seo')],
  ['S22', 'case', async () => {}],
  ['S22', 'answer, wrong pick', async (p) => pick2(p, 'seo')],
  ['S22', 'answer, right pick', async (p) => pick2(p, 'ppc')],
  ['S24', 'case', async () => {}],
  ['S24', 'answer, wrong pick', async (p) => pick2(p, 'ppc')],
  ['S24', 'answer, right pick', async (p) => pick2(p, 'social')],
  ['K5', 'two columns', async () => {}],
  ['S26', 'ready', async () => {}],
  ['S26', 'speed 0.5', async (p) => { for (let i = 0; i < 4; i++) await click(p, '[data-action="audioSpeed"]'); }],
  ['S26', 'observation 1', async (p) => audioAt(p, 8)],
  ['S26', 'observation 4, the question', async (p) => audioAt(p, 35.3)],
  ['S26', 'ended', audioEnd],
  ['S26B', 'question', async () => {}],
  ['S26B', 'chosen', async (p) => click(p, '.d2-poll-opt[data-id="unsure"]')],
  /* The marketing funnel */
  ['W7', 'opener', async () => {}],
  ['V2', 'ready', async () => {}],
  ['V2', 'stop 1', toStop],
  ['V2', 'stop 1 wrong', async (p) => stop(p, 'a')],
  ['V2', 'stop 1 right', async (p) => stop(p, 'c')],
  ['V2', 'stop 2 wrong', async (p) => { await stop(p, 'c'); await resume(p); await stop(p, 'a'); }],
  ['V2', 'stop 2 right', async (p) => { await stop(p, 'c'); await resume(p); await stop(p, 'b'); }],
  ['V2', 'ended', async (p) => { await stop(p, 'c'); await resume(p); await stop(p, 'b'); await resume(p); await toEnd(p); }],
  ['S28', 'six sales', async () => {}],
  ['S28', 'seven sales', async (p) => click(p, '[data-action="more"]')],
  ['S28', 'a hundred sales', async (p) => { await p.evaluate(() => { const i = document.querySelector('.d2-step-input'); i.value = '100'; i.dispatchEvent(new Event('change', { bubbles: true })); }); }],
  ['S30', 'round 1', async () => {}],
  ['S30', 'round 1 row picked', async (p) => click(p, '.d2-dt-src[data-id="a"]')],
  ['S30', 'round 1 wrong', async (p) => row(p, 'a')],
  ['S30', 'round 1 right', async (p) => row(p, 'b')],
  ['S30', 'round 2 wrong', async (p) => { await row(p, 'b'); await nextRound(p); await row(p, 'b'); }],
  ['S30', 'no media cost note', async (p) => click(p, '[data-action="dot"]')],
  ['S30', 'round 3 right, done', async (p) => { await row(p, 'b'); await nextRound(p); await row(p, 'd'); await nextRound(p); await row(p, 'd'); }],
  ['S32', 'two columns', shift],
  ['S32', 'channels open', async (p) => { await shift(p); await click(p, '.d2-ig-el[data-el="channels"]'); }],
  ['S32', 'audience open', async (p) => { await shift(p); await click(p, '.d2-ig-el[data-el="audience"]'); }],
  ['S32', 'four opened, measure open', async (p) => { await shift(p); for (const e of ['ads', 'geo', 'messages', 'measure']) await click(p, `.d2-ig-el[data-el="${e}"]`); }],
  ['S32B', 'rows empty', async () => {}],
  ['S32B', 'two wrong', async (p) => fields(p, { a: 2, b: 1, c: 4, d: 3 })],
  ['S32B', 'two wrong twice, shown', async (p) => { await fields(p, { a: 2, b: 1, c: 4, d: 3 }); await fields(p, { b: 1, c: 4 }); }],
  ['S32B', 'all right', async (p) => fields(p, { a: 2, b: 4, c: 1, d: 3 })],
  ['S33', 'question', async () => {}],
  ['S33', 'immediate goals', async (p) => click(p, '.d2-poll-opt[data-id="now"]')],
  ['S33', 'long-term goals', async (p) => click(p, '.d2-poll-opt[data-id="long"]')],
  ['K6', 'quote', async () => {}],
  ['K6', 'end of chapter', async (p) => click(p, '.w-next')],
  /* Wrap-up */
  ['W8', 'opener', async () => {}],
  ['CHK', 'question 1', async () => {}],
  ['CHK', 'question 1 picked', async (p) => click(p, '.w-kc-opt[data-id="b"]')],
  ['CHK', 'question 5', async (p) => doCheck(p, ALL_RIGHT.slice(0, 4), 5)],
  ['CHK', 'review, answer 1 right', async (p) => doCheck(p, ALL_RIGHT)],
  ['CHK', 'review, answer 1 wrong', async (p) => doCheck(p, TWO_RIGHT)],
  ['CHKR', 'passed', async (p) => resultAfter(p, ALL_RIGHT)],
  ['CHKR', 'not passed, three missed', async (p) => resultAfter(p, TWO_RIGHT, false)],
  ['CHKR', 'not passed, all missed', async (p) => resultAfter(p, ['a', 'a', 'a', 'a', 'a'], false)],
  ['S35', 'sentence one', async () => {}],
  ['S35', 'all four', async (p) => { for (let i = 0; i < 3; i++) await click(p, '[data-action="more"]'); }],
  ['S36', 'before', async () => {}],
  ['S36', 'opened', openWorkbook],
  ['S38', 'question', async () => {}],
  ['S38', 'chosen', async (p) => click(p, '.d2-poll-opt[data-id="c2"]')],
  ['END', 'passed', async (p) => endAfter(p, ALL_RIGHT)],
  ['END', 'not passed', async (p) => endAfter(p, TWO_RIGHT, false)],
];
