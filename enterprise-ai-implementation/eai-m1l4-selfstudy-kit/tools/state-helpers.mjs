// Kit tool: helpers that drive the kit's screen types with the mouse, for a lesson's list of screen states
// (tests/states.mjs in the lesson: STATES = [screen id, state name, async (page) => {}], each from a fresh
// ?reset=1&screen=ID load; the first state of a screen is its arrival). tools/states.mjs hands the list to
// tools/test-fit.mjs, tools/check-overflow.mjs and tools/shots.mjs.
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
// K1: open the detail view of dimension i (0 to 7) from the map
export async function dimension(p, i) {
  await p.evaluate((k) => document.querySelectorAll('.d-dim-node')[k].click(), i);
  await click(p, '[data-action="explore"]');
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
export const clickAll = (p, sel) => p.evaluate((s) => document.querySelectorAll(s).forEach((b) => b.click()), sel);
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
export const go = async (p, id) => { await p.evaluate((x) => window.__l4.go(x), id); await p.waitForFunction((x) => window.__l4.current === x, {}, id); };
// V2 (the placeholder): as V1
