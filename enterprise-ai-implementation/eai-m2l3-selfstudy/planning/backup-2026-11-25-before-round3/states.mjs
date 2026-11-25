// EAI M2 L3: the states of every screen, driven with the mouse (the kit's tools/test-fit.mjs, check-overflow.mjs
// and shots.mjs read this list through tools/states.mjs; the keyboard walk is tests/walk.mjs).
// STATES: [screen id, state name, async (page) => {}], each from a fresh ?reset=1&screen=ID load.
import { shift, click, deck, pick, tile, toEnd, sleep } from '../tools/state-helpers.mjs';

const whys = (n) => async (p) => { await shift(p); for (let i = 0; i < n; i++) await click(p, '[data-action="why"]'); };
const nextSit = (p) => click(p, '[data-action="nextSituation"]');
const pairs = (ids) => async (p) => { await shift(p); for (let i = 0; i < ids.length; i++) { await pick(p, ids[i]); if (i < ids.length - 1) await nextSit(p); } };
const parts = (n) => async (p) => { await shift(p); for (let i = 0; i < n; i++) await click(p, '[data-action="part"]'); };
const practice = (ids) => async (p) => { await shift(p); for (const id of ids) await click(p, `.m-why-choice[data-id="${id}"]`); await sleep(300); };
const fish = (pairsList) => async (p) => { await shift(p); for (const [n, bone] of pairsList) { await click(p, `.m-fish-card[data-n="${n}"]`); await click(p, `.m-fish-target[data-bone="${bone}"]`); } };
const fillCard = (values) => async (p) => {
  await shift(p);
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
  ['B1', 'ended', async (p) => { await shift(p); await toEnd(p); }],
  ['B2', 'arrival', shift],
  ['B2', 'wrong', async (p) => { await shift(p); await pick(p, 'a'); await sleep(1800); }],
  ['B2', 'right', async (p) => { await shift(p); await pick(p, 'b'); await sleep(1800); }],
  ['B3', 'the list', shift],
  ['B3', 'the card', async (p) => { await shift(p); await click(p, '[data-action="cards"]'); await sleep(2800); }],
  /* Process before tool */
  ['C1', 'two lanes', shift],
  ['C1', 'agent added', async (p) => { await shift(p); await click(p, '[data-action="add"]'); }],
  ['C2', 'situation 1', shift],
  ['C2', 'situation 1 wrong', async (p) => { await shift(p); await pick(p, 'b'); }],
  ['C2', 'all three', pairs(['a', 'b', 'b'])],
  /* The four categories */
  ['D1', 'closed', shift],
  ['D1', 'tile 4 open', async (p) => { await shift(p); for (const n of [1, 2, 3, 4]) await click(p, `.w-tile[data-n="${n}"]`); }],
  ['D2', 'arrival', shift],
  ['D2', 'one wrong drop', async (p) => { await shift(p); await deck(p, ['agent']); }],
  ['D2', 'all placed', async (p) => { await shift(p); await deck(p, ['doc', 'pr', 'agent', 'auto', 'agent', 'bi']); }],
  /* The use-case library */
  ['E1', 'step 1', shift],
  ['E1', 'step 3', async (p) => { await shift(p); await p.evaluate(() => document.querySelectorAll('.m-guide-step')[2].click()); }],
  ['E2', 'situation 1', shift],
  ['E2', 'all three', pairs(['a', 'b', 'b'])],
  ['E3', 'first part', shift],
  ['E3', 'all parts', parts(4)],
  ['E4', 'empty rows', shift],
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
  ['G1', 'arrival', shift],
  ['G1', 'all placed', async (p) => { await shift(p); await deck(p, ['pain', 'sponsor', 'pain', 'pain', 'pain', 'sponsor']); }],
  ['G2', 'empty rows', shift],
  ['G2', 'saved', fillCard(['Ownership of the close was never formalized', 'Henrik, finance analyst', 'Sarah Chen, CFO'])],
];
