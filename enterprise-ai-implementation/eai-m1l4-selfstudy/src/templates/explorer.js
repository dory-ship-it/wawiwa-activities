// Explorer template, a Focus panel (styled by analogy with the frames). Variants (the S05 diagram
// explorer is gone: NL2 splits it into S05a and S05b, src/templates/bpmn.js):
//   tiles   (S07)  a 2 x 4 grid of numbered tiles that flip in place, one open at a time. After all
//                  eight were opened the question appears and the tiles become answer buttons (one
//                  question, wrong = retry, right = Next). Before that the question row is a lock icon
//                  with the content's aria-label.
//   pick    (S12)  eight field tiles left (40%), the question and a reading panel right (60%). A tile
//                  click opens its text in the panel (check mark once read) and selects it (two at most);
//                  Check in the band; one band per attempt: verdict + the first wrong tile's line, no
//                  paging; right = both key lines, Next.
// Tracking: tiles = the field number of the first answer. Retries as retry events.
import { h, nextId } from '../util.js';
import { glyph } from '../icons.js';
import { checkButton } from './decision.js';
import { layout, sheet, arrowNav } from './stage.js';

export const explorer = {
  mount(ctx) {
    const run = { tiles, pick }[ctx.screen.variant];
    if (!run) throw new Error('explorer: unknown variant ' + ctx.screen.variant);
    return run(ctx) || { unmount() {} };
  },
};

const mark = (el, result, ui) => {
  el.dataset.result = result;
  const m = el.querySelector(':scope > .w-opt-mark');
  if (m) m.replaceChildren(result === 'correct' ? glyph('g-check-b', { size: 16, label: ui.feedback.correctPrefix }) : result === 'wrong' ? glyph('g-cross', { size: 14.08, label: ui.feedback.wrongPrefix }) : '');
};

/* ---------- tiles (S07) ---------- */
function tiles(ctx) {
  const { screen, ui, zones } = ctx;
  const trackingId = screen.tracking[0].id;
  const visited = new Set();
  let phase = 'explore', solved = false, chosen = -1;

  const list = screen.tiles.map((t) => {
    const front = h('span', { class: 'w-tile-face w-tile-front' }, h('span', { class: 'w-tile-num' }, String(t.n)), h('span', { class: 'w-tile-title' }, t.title));
    const back = h('span', { class: 'w-tile-face w-tile-back', 'aria-hidden': 'true' }, h('span', { class: 'w-tile-num' }, String(t.n)), h('span', { class: 'w-tile-text' }, t.back));
    const seen = h('span', { class: 'w-tile-seen', 'aria-hidden': 'true' });
    const btn = h('button', { class: 'w-tile', type: 'button', 'aria-expanded': 'false', dataset: { n: String(t.n) } },
      h('span', { class: 'w-tile-inner' }, front, back), seen, h('span', { class: 'w-opt-mark' }));
    return { t, btn, front, back, seen };
  });
  const flip = (x, open) => {
    x.btn.dataset.open = String(open);
    if (phase === 'explore') x.btn.setAttribute('aria-expanded', String(open));
    x.front.setAttribute('aria-hidden', String(open));
    x.back.setAttribute('aria-hidden', String(!open));
  };
  const grid = h('div', { class: 'w-tiles', role: 'group', 'aria-labelledby': 'w-instruction' }, list.map((x) => x.btn));
  arrowNav(grid, { selector: '.w-tile', cols: 4 });

  const lock = h('span', { class: 'w-question-lock', role: 'img', 'aria-label': screen.lockedLabel }, glyph('g-lock', { size: 23.04 }));
  const question = h('h2', { class: 'w-question-text', id: nextId('w-question'), hidden: true }, screen.question);
  const qRow = h('div', { class: 'w-question-row', 'aria-live': 'polite' }, lock, question);

  layout(ctx, 'focus', sheet('focus w-sheet-wide', zones.instruction, h('div', { class: 'w-tiles-task', dataset: { interaction: '' } }, grid, qRow), zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const unlock = () => {
    phase = 'answer';
    lock.hidden = true;
    question.hidden = false;
    grid.setAttribute('aria-labelledby', question.id);
    list.forEach((x) => x.btn.removeAttribute('aria-expanded'));
    zones.setFeedback({ state: 'hint', text: screen.questionHint || screen.hint }); // the band now hints at the question
  };
  const toFront = () => list.forEach((x) => flip(x, false));

  list.forEach((x, i) => x.btn.addEventListener('click', () => {
    if (phase === 'explore') {
      const open = x.btn.dataset.open !== 'true';
      list.forEach((y) => { if (y !== x) flip(y, false); });
      flip(x, open);
      if (open && !visited.has(x.t.n)) {
        visited.add(x.t.n);
        x.btn.dataset.seen = 'true';
        x.seen.replaceChildren(glyph('g-check-b', { size: 16 }));
      }
      if (visited.size === list.length) unlock(); // the last tile stays open to read; any click now answers
      return;
    }
    if (solved || i === chosen) return;
    toFront();
    chosen = i;
    const right = !!x.t.correct;
    ctx.answer({ trackingId, response: String(x.t.n), result: right ? 'correct' : 'wrong' });
    list.forEach((y) => mark(y.btn, y === x ? (right ? 'correct' : 'wrong') : '', ui));
    if (!right) { zones.setFeedback({ state: 'wrong', text: x.t.feedback }); return; }
    solved = true;
    list.forEach((y) => y.btn.setAttribute('aria-disabled', 'true'));
    zones.setFeedback({ state: 'correct', text: x.t.feedback });
    ctx.complete();
    ctx.unlockNext({ focus: true });
  }));

  list.forEach((x) => flip(x, false));
  if (ctx.revisit) {
    list.forEach((x) => { visited.add(x.t.n); x.btn.dataset.seen = 'true'; x.seen.replaceChildren(glyph('g-check-b', { size: 16 })); });
    unlock();
    const k = list.findIndex((x) => x.t.correct);
    solved = true;
    chosen = k;
    mark(list[k].btn, 'correct', ui);
    list.forEach((y) => y.btn.setAttribute('aria-disabled', 'true'));
    zones.setFeedback({ state: 'correct', text: list[k].t.feedback });
    ctx.unlockNext({ focus: false });
  }
}

/* ---------- pick (S12) ---------- */
function pick(ctx) {
  const { screen, ui, zones } = ctx;
  const need = screen.select;
  const trackingId = screen.tracking[0].id;
  const keys = screen.tiles.map((t, i) => (t.correct ? i : -1)).filter((i) => i >= 0);
  const selected = new Set();
  let solved = false, marked = false;

  const question = h('h2', { class: 'w-question-text w-pick-q', id: nextId('w-pick-q') }, screen.question);
  const panelText = h('p', { class: 'w-pick-text', 'aria-live': 'polite' });
  const list = screen.tiles.map((t) => {
    const seen = h('span', { class: 'w-tile-seen', 'aria-hidden': 'true' });
    const btn = h('button', { class: 'w-opt w-pick-tile', type: 'button', 'aria-pressed': 'false', dataset: { n: String(t.n) } },
      h('span', { class: 'w-tile-num', 'aria-hidden': 'true' }, String(t.n)), h('span', { class: 'w-opt-label' }, t.title), seen, h('span', { class: 'w-opt-mark' }));
    return { t, btn, seen };
  });
  const grid = h('div', { class: 'w-pick-tiles', role: 'group', 'aria-labelledby': question.id }, list.map((x) => x.btn));
  arrowNav(grid, { selector: '.w-pick-tile', cols: 2 });
  const check = checkButton(ui, ui.buttons.check, () => doCheck());

  layout(ctx, 'focus',
    sheet('focus w-sheet-wide',
      zones.instruction,
      h('div', { class: 'w-pick', dataset: { interaction: '' } }, grid, h('div', { class: 'w-pick-side' }, question, h('div', { class: 'w-pick-panel' }, panelText))),
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  zones.setTool(check);

  const open = (x) => {
    list.forEach((y) => { y.btn.dataset.open = String(y === x); });
    panelText.textContent = x.t.text;
    x.btn.dataset.seen = 'true';
    x.seen.replaceChildren(glyph('g-check-b', { size: 16 }));
  };
  const paintOne = (x, result) => mark(x.btn, result, ui);
  function update() {
    list.forEach((x, i) => {
      x.btn.setAttribute('aria-pressed', String(selected.has(i)));
      if (!marked || !x.btn.dataset.result) paintOne(x, '');
    });
    check.disabled = selected.size !== need;
  }
  list.forEach((x, i) => x.btn.addEventListener('click', () => {
    open(x);
    if (solved) return;
    if (marked) { marked = false; list.forEach((y) => paintOne(y, '')); }
    if (selected.has(i)) selected.delete(i); else if (selected.size < need) selected.add(i);
    update();
  }));

  function solve(focus) {
    solved = true;
    selected.clear();
    keys.forEach((i) => selected.add(i));
    list.forEach((x, i) => { x.btn.setAttribute('aria-pressed', String(keys.includes(i))); paintOne(x, keys.includes(i) ? 'correct' : ''); });
    zones.setTool();
    zones.setFeedback({ state: 'correct', text: keys.map((i) => screen.tiles[i].feedback).join(' ') });
    ctx.unlockNext({ focus });
  }
  function doCheck() {
    if (solved || selected.size !== need) return;
    const chosen = [...selected].sort((a, b) => a - b);
    const rightCount = chosen.filter((i) => keys.includes(i)).length;
    const right = rightCount === keys.length;
    ctx.answer({ trackingId, response: chosen.map((i) => String(screen.tiles[i].n)).join(','), result: right ? 'correct' : 'wrong' });
    if (right) { ctx.complete(); solve(true); return; }
    chosen.forEach((i) => paintOne(list[i], screen.tiles[i].correct ? 'correct' : 'wrong'));
    const wrong = chosen.filter((i) => !screen.tiles[i].correct);
    wrong.forEach((i) => selected.delete(i));
    marked = true;
    update();
    zones.setFeedback({ state: rightCount === 1 && keys.length === 2 ? 'partial' : 'wrong', verdict: rightCount === 1 && keys.length === 2 ? ui.feedback.oneOfTwo : ui.feedback.wrongPrefix, text: screen.tiles[wrong[0]].feedback });
    list[wrong[0]].btn.focus();
  }

  const firstOpen = list.find((x) => x.t.n === screen.openFirst);
  if (firstOpen) open(firstOpen);
  if (ctx.revisit) solve(false);
}
