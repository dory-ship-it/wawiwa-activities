// The states of every Phase 1 screen, driven with the mouse (shared by tools/test-fit.mjs,
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
  for (let i = 1; i < 8; i++) await click(p, '[data-action="nextDimension"]');
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
  ['K3', 'end of this part', async (p) => click(p, '.w-next')],
];
