// The states of every screen, driven with the mouse (shared by tools/test-fit.mjs,
// tools/check-overflow.mjs and tools/shots.mjs; the keyboard walk is tools/walk.mjs).
// STATES: [screen id, state name, async (page) => {}], each from a fresh ?reset=1&screen=ID load.
// The first state of a screen is its arrival.
export const shift = (p) => p.keyboard.press('Shift'); // any key stops a ghost hand
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const click = async (p, sel) => { await p.waitForSelector(sel); await p.evaluate((s) => document.querySelector(s).click(), sel); };

// links that open a new tab: keep the run inside the lesson (the tab itself is checked in walk.mjs)
export async function noNewTab(p, sel) { await p.evaluate((s) => document.querySelector(s).addEventListener('click', (e) => e.preventDefault(), { capture: true }), sel); }
export async function openWorkbook(p) { await noNewTab(p, '[data-action="open"]'); await click(p, '[data-action="open"]'); }

// the sort deck: click the card, then a column, once per column given
export async function deck(p, cols) { for (const col of cols) { await click(p, '[data-action="card"]'); await click(p, `.w-drop[data-column="${col}"]`); } }

// a graded choice: pick the card, then Check
export async function pick(p, id, scope = '.w-main') { await click(p, `${scope} .w-opt[data-id="${id}"]`); await click(p, `${scope} [data-action="check"]:not([disabled])`); }

// S05: answer a tile (open it, choose, Done)
export async function tile(p, n, values = []) {
  await click(p, `.d-tile-head[data-tile="${n}"]`);
  for (const v of values) await click(p, `.d-tile[data-open="true"] .d-chip[data-value="${v}"]`);
  await click(p, '.d-tile[data-open="true"] [data-action="tileDone"]:not([disabled])');
}
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
// K1: open the detail view of dimension i (0 to 7) from the map
export async function dimension(p, i) {
  await p.evaluate((k) => document.querySelectorAll('.d-dim-node')[k].click(), i);
  await click(p, '[data-action="explore"]');
}
export async function allDimensions(p) {
  await dimension(p, 0);
  for (let i = 1; i < 8; i++) { await click(p, '[data-action="allDimensions"]'); await click(p, '[data-action="explore"]'); }
}
export async function allGoals(p) { await p.evaluate(() => document.querySelectorAll('.d-goal').forEach((b) => b.click())); }

// the video player: no seeking ahead of what was watched, so play muted and fast to the next stop
export async function playUntil(p, done, what) {
  await p.waitForFunction(() => document.querySelector('.w-video').readyState >= 1);
  await p.evaluate(() => { const v = document.querySelector('.w-video'); v.muted = true; v.playbackRate = 16; v.play(); });
  let last = -1;
  for (let i = 0; i < 90; i++) {
    if (await p.evaluate(done)) return;
    last = await p.evaluate((prev) => {
      const v = document.querySelector('.w-video');
      if (document.querySelector('.w-stop-view').hidden && !v.ended && (v.paused || Math.abs(v.currentTime - prev) < 0.01)) {
        v.pause(); v.currentTime = v.currentTime; v.muted = true; v.playbackRate = 4; v.play().catch(() => {});
      }
      return v.currentTime;
    }, last);
    await sleep(500);
  }
  const at = await p.evaluate(() => { const v = document.querySelector('.w-video'); return `t ${v.currentTime.toFixed(1)}, paused ${v.paused}, readyState ${v.readyState}, error ${v.error?.code ?? 'none'}`; });
  throw new Error(`${what} not reached in 45 s: ${at}`);
}
export const toStop = (p) => playUntil(p, () => !document.querySelector('.w-stop-view').hidden, 'video stop');
export const toEnd = (p) => playUntil(p, () => document.querySelector('.w-next').dataset.locked === 'false', 'video end');
export async function stop(p, id) { await toStop(p); await pick(p, id, '.w-stop-view'); }
export const resume = (p) => click(p, '[data-action="resume"]');

/* ---------- Phase 2 helpers (src/templates/dm2.js) ---------- */
const clickAll = (p, sel) => p.evaluate((s) => document.querySelectorAll(s).forEach((b) => b.click()), sel);
// a graded question of dm2.js: pick the option, then Check
export async function pick2(p, id) { await click(p, `.d2-opt[data-id="${id}"]`); await click(p, '[data-action="check"]:not([disabled])'); }
export const nextRound = (p) => click(p, '[data-action="nextRound"]');
export async function rounds2(p, ids) { for (let i = 0; i < ids.length; i++) { await pick2(p, ids[i]); if (i < ids.length - 1) await nextRound(p); } }
// S30: answer a round by its row
export async function row(p, id) { await click(p, `.d2-dt-src[data-id="${id}"]`); await click(p, '[data-action="check"]:not([disabled])'); }
// S26: the audio, muted; t seconds in (paused), or to its end
export async function audioAt(p, t) {
  await p.waitForFunction(() => document.querySelector('.d2-audio').readyState >= 1);
  await p.evaluate((x) => { const a = document.querySelector('.d2-audio'); a.muted = true; a.currentTime = x; a.dispatchEvent(new Event('timeupdate')); }, t);
  await sleep(300);
  await p.evaluate(() => document.querySelector('.d2-audio').dispatchEvent(new Event('timeupdate')));
}
export async function audioEnd(p) {
  await p.waitForFunction(() => document.querySelector('.d2-audio').readyState >= 1);
  await p.evaluate(() => { const a = document.querySelector('.d2-audio'); a.muted = true; a.currentTime = Math.max(0, a.duration - 0.4); a.play(); });
  await p.waitForFunction(() => document.querySelector('.w-next').dataset.locked === 'false', { timeout: 15000 });
}
// S32B: choose a card for every row (cards: row id -> card number), then Check
export async function fields(p, cards) {
  await p.evaluate((m) => { for (const [r, n] of Object.entries(m)) { const s = document.querySelector(`.w-field-select[data-row="${r}"]`); s.value = String(n); s.dispatchEvent(new Event('change', { bubbles: true })); } }, cards);
  await click(p, '[data-action="check"]:not([disabled])');
}
// the scored check: answer every item (ids: the option of each item, in order), ending on the review
export async function doCheck(p, ids, total = ids.length) {
  for (let i = 0; i < ids.length; i++) { await click(p, `.w-kc-opt[data-id="${ids[i]}"]`); await click(p, `[data-action="${i < total - 1 ? 'nextQuestion' : 'check'}"]:not([disabled])`); }
}
const go = async (p, id) => { await p.evaluate((x) => window.__l4.go(x), id); await p.waitForFunction((x) => window.__l4.current === x, {}, id); };
// the result and the end need an attempt of the check behind them
export async function resultAfter(p, ids) { await go(p, 'CHK'); await doCheck(p, ids); await go(p, 'CHKR'); }
export async function endAfter(p, ids) { await go(p, 'CHK'); await doCheck(p, ids); await p.evaluate(() => window.__l4.finishLesson()); await go(p, 'END'); }
const ALL_RIGHT = ['b', 'b', 'c', 'b', 'b'], TWO_RIGHT = ['a', 'b', 'c', 'a', 'a'];
// V2 (the placeholder): as V1

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
  ['CHKR', 'not passed, three missed', async (p) => resultAfter(p, TWO_RIGHT)],
  ['CHKR', 'not passed, all missed', async (p) => resultAfter(p, ['a', 'a', 'a', 'a', 'a'])],
  ['S35', 'sentence one', async () => {}],
  ['S35', 'all four', async (p) => { for (let i = 0; i < 3; i++) await click(p, '[data-action="more"]'); }],
  ['S36', 'before', async () => {}],
  ['S36', 'opened', openWorkbook],
  ['S38', 'question', async () => {}],
  ['S38', 'chosen', async (p) => click(p, '.d2-poll-opt[data-id="c2"]')],
  ['END', 'passed', async (p) => endAfter(p, ALL_RIGHT)],
  ['END', 'not passed', async (p) => endAfter(p, TWO_RIGHT)],
];
