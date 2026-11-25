// EAI M2 L3: the states of every screen, driven with the mouse (the kit's tools/test-fit.mjs, check-overflow.mjs
// and shots.mjs read this list through tools/states.mjs; the keyboard walk is tests/walk.mjs).
// STATES: [screen id, state name, async (page) => {}], each from a fresh ?reset=1&screen=ID load.
import { shift, click, deck, pick, tile, toEnd, toStop, stop, sleep } from '../tools/state-helpers.mjs';
const voices = (picks) => async (p) => { await shift(p); for (let i = 0; i < picks.length; i++) { await click(p, `.m-mt-role-btn[data-role="${picks[i]}"]`); if (i < picks.length - 1) await click(p, '[data-action="nextVoice"]'); } };

const whys = (n) => async (p) => { await shift(p); for (let i = 0; i < n; i++) await click(p, '[data-action="why"]'); };
const nextSit = (p) => click(p, '[data-action="nextSituation"]');
const pairs = (ids) => async (p) => { await shift(p); for (let i = 0; i < ids.length; i++) { await pick(p, ids[i]); if (i < ids.length - 1) await nextSit(p); } };
const parts = (n) => async (p) => { await shift(p); for (let i = 0; i < n; i++) await click(p, '[data-action="part"]'); };
const practice = (ids) => async (p) => { await shift(p); for (const id of ids) await click(p, `.m-why-choice[data-id="${id}"]`); await sleep(300); };
const fish = (pairsList) => async (p) => { await shift(p); for (const [n, bone] of pairsList) { await click(p, `.m-fish-card[data-n="${n}"]`); await click(p, `.m-fish-target[data-bone="${bone}"]`); } };
const fillCard = (values) => async (p) => {
  await shift(p); await sleep(2800);
  await p.evaluate((v) => document.querySelectorAll('.m-card-input').forEach((el, i) => { el.value = el.tagName === 'SELECT' ? el.options[1].value : v[i] || 'Month-end close takes 14 days, three systems to reconcile'; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input')); }), values);
  await click(p, '[data-action="save"]');
};

export const STATES = [
  /* Opening */
  ['O1', 'title', async () => {}],
  ['O2', 'today open', shift],
  ['O2', 'lesson 1 open', async (p) => { await shift(p); await click(p, '.w-map-tab[data-station="l1"]'); }],
  ['O2', 'lesson 6 open', async (p) => { await shift(p); await click(p, '.w-map-tab[data-station="l6"]'); }],
  ['O3', 'empty', shift],
  ['O3', 'saved', async (p) => { await shift(p); await p.type('.m-prep-thread input', 'Month-end close takes 14 days'); await click(p, '[data-action="save"]'); }],
  /* Every pain becomes a card */
  ['B1', 'arrival', shift],
  ['B1', 'the stop', async (p) => { await shift(p); await toStop(p); }],
  ['B1', 'stop answered', async (p) => { await shift(p); await stop(p, 'a'); }],


  ['B3', 'the list', shift],
  ['B3', 'the card', async (p) => { await shift(p); await click(p, '[data-action="cards"]'); await sleep(2800); }],
  /* Process before tool */
  ['C0', 'first idea', shift],
  ['C0', 'all ideas', async (p) => { await shift(p); await click(p, '[data-action="idea"]'); await click(p, '[data-action="idea"]'); await sleep(600); }],
  ['C1', 'two lanes', shift],
  ['C1', 'agent added', async (p) => { await shift(p); await click(p, '[data-action="add"]'); await sleep(900); }],
  ['C2', 'situation 1', shift],
  ['C2', 'situation 1 wrong', async (p) => { await shift(p); await pick(p, 'b'); }],
  ['C2', 'all three', async (p) => { await pairs(['a', 'b', 'c'])(p); await sleep(1300); }],
  /* The four categories */

  ['D1', 'the board', async (p) => { await shift(p); await sleep(1800); }],
  ['D2', 'arrival', shift],
  ['D2', 'one wrong drop', async (p) => { await shift(p); await deck(p, ['agent']); }],
  ['D2', 'all placed', async (p) => { await shift(p); await deck(p, ['doc', 'pr', 'agent', 'auto', 'agent', 'bi']); }],
  /* The use-case library */

  ['E1', 'points', async (p) => { await shift(p); await sleep(3800); }],
  ['E2', 'situation 1', shift],
  ['E2', 'all three', async (p) => { await pairs(['a', 'b', 'b'])(p); await sleep(1300); }],
  ['E3', 'first part', shift],
  ['E3', 'the guess', parts(3)],
  ['E3', 'all parts', async (p) => { await parts(3)(p); await click(p, '.m-why-choice[data-id="b"]'); await click(p, '[data-action="part"]'); }],
  ['E4', 'intro', async (p) => { await shift(p); await sleep(700); }],
  ['E4', 'empty rows', async (p) => { await shift(p); await sleep(3000); }],
  ['E4', 'saved', fillCard(['', 'Month-end close acceleration: RPA plus Power BI'])],
  /* Find the root cause */
  ['F0', 'parts', shift],
  ['F0', 'case lines on', async (p) => { await shift(p); await click(p, '[data-action="caseToggle"]'); }],
  ['F1', 'the pain only', shift],
  ['F1', 'two whys', whys(2)],
  ['F1', 'the root', whys(5)],
  ['F2', 'level 1', shift],
  ['F2', 'one wrong', practice(['b'])],
  ['F2', 'the root', practice(['a', 'b', 'a', 'b'])],
  ['F3', 'the fish', async (p) => { await shift(p); await sleep(3500); }],
  ['F4', 'arrival', shift],
  ['F5', 'arrival', shift],
  ['F5', 'one wrong', fish([[1, 'tools']])],
  ['F5', 'all placed', fish([[1, 'people'], [2, 'process'], [3, 'tools'], [4, 'data']])],
  ['F6', 'arrival', shift],
  ['F6', 'wrong', async (p) => { await shift(p); await pick(p, 'a'); }],
  ['F6', 'right', async (p) => { await shift(p); await pick(p, 'b'); }],
  /* Who hurts? */

  ['G1', 'first voice', shift],
  ['G1', 'one answered', voices(['pain'])],
  ['G1', 'the sentence', async (p) => { await voices(['pain', 'funds', 'pain', 'funds', 'pain', 'pain'])(p); await click(p, '[data-action="nextVoice"]'); }],
  ['G2', 'empty rows', async (p) => { await shift(p); await sleep(3000); }],
  ['G2', 'saved', fillCard(['Ownership of the close was never formalized', 'Henrik, finance analyst', 'Sarah Chen, CFO'])],
];
