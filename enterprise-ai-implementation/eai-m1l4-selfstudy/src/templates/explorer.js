// Explorer template, a Focus panel (styled by analogy with the frames). Variants (the S05 diagram
// explorer is gone: NL2 splits it into S05a and S05b, src/templates/bpmn.js):
//   tiles   (S07)  NL2: on the Focus wash, a 4 x 2 grid of tiles that open in place; after all eight the
//                  heading becomes the question and the tiles answer it (one question, wrong = retry).
//   pick    (S12)  eight field tiles left (40%), the question and a reading panel right (60%). A tile
//                  click opens its text in the panel (check mark once read) and selects it (two at most);
//                  Check in the band; one band per attempt: verdict + the first wrong tile's line, no
//                  paging; right = both key lines, Next.
// Tracking: tiles = the field number of the first answer. Retries as retry events.
import { h, fmt, nextId } from '../util.js';
import { glyph } from '../icons.js';
import { checkButton } from './decision.js';
import { layout, sheet, arrowNav, paintAnswer } from './stage.js';

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

/* ---------- tiles (S07), on the Focus wash, no panel ---------- */
// The task head (the instruction, the counter "0/8" under it), a 4 x 2 grid of tiles: number disc,
// task icon, title. A tile opens in place (one at a time; Escape closes it): its title in teal ink
// and its definition, the selected border; an opened tile keeps a done check in its disc. After all
// eight the heading becomes the question, the counter line its hint, and every tile gets an answer
// marker (the open one stays open to read). Wrong = retry, right = Next; the strip sits under the grid.
function tiles(ctx) {
  const { screen, ui, zones } = ctx;
  const trackingId = screen.tracking[0].id;
  const visited = new Set();
  let phase = 'explore', solved = false, chosen = -1;

  const sub = h('p', { class: 'w-task-sub', 'aria-live': 'polite' });
  const list = screen.tiles.map((t) => {
    const disc = h('span', { class: 'w-tile-disc', 'aria-hidden': 'true' });
    const icon = glyph(t.icon, { size: 30.72, className: 'w-tile-icon' });
    const openTitle = h('b', { class: 'w-tile-open-title' }, t.title);
    const mark = h('span', { class: 'w-opt-mark w-tile-mark' });
    const title = h('b', { class: 'w-tile-title' }, t.title);
    const back = h('span', { class: 'w-tile-text' }, t.back);
    const btn = h('button', { class: 'w-tile', type: 'button', 'aria-expanded': 'false', dataset: { n: String(t.n) } },
      h('span', { class: 'w-tile-row' }, disc, icon, openTitle, mark), title, back);
    return { t, btn, disc };
  });
  const paintDisc = (x) => x.disc.replaceChildren(phase === 'explore' && visited.has(x.t.n) && x.btn.dataset.open !== 'true' ? glyph('g-check', { size: 19.2 }) : String(x.t.n));
  const flip = (x, open) => {
    x.btn.dataset.open = String(open);
    if (phase === 'explore') x.btn.setAttribute('aria-expanded', String(open));
    paintDisc(x);
  };
  const grid = h('div', { class: 'w-tiles', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } }, list.map((x) => x.btn));
  arrowNav(grid, { selector: '.w-tile', cols: 4 });
  grid.addEventListener('keydown', (e) => { if (e.key === 'Escape' && list.some((x) => x.btn.dataset.open === 'true')) { e.stopPropagation(); list.forEach((x) => flip(x, false)); } });

  // the ghost hand taps between the tiles once (lower left of tile 2, as in the frame), opening nothing
  if (!ctx.revisit && screen.ghost) ctx.ghost({ type: screen.ghost.type,
    steps: () => [{ point: () => { const r = list[1].btn.getBoundingClientRect(), k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1; return { x: r.left + 13.8 * k, y: r.top + 125.2 * k }; } }] });

  layout(ctx, 'tiles', h('div', { class: 'w-task-head w-task-head-col' }, zones.instruction, sub), grid, h('div', { class: 'w-float w-float-tiles' }, zones.band));
  zones.setHintVisible(false); // the frame shows no hint line: the hint stays for screen readers
  zones.setFeedback({ state: 'hint', text: screen.hint });
  const count = () => { sub.textContent = fmt(ui.progress.opened, { i: visited.size, n: list.length }); };

  const unlock = () => {
    phase = 'answer';
    grid.dataset.phase = 'answer';
    zones.instruction.textContent = screen.question;
    sub.textContent = screen.questionHint;
    list.forEach((x) => { x.btn.removeAttribute('aria-expanded'); paintDisc(x); });
    zones.setFeedback({ state: 'hint', text: screen.questionHint });
  };

  list.forEach((x, i) => x.btn.addEventListener('click', () => {
    if (phase === 'explore') {
      const open = x.btn.dataset.open !== 'true';
      list.forEach((y) => { if (y !== x) flip(y, false); });
      if (open) visited.add(x.t.n);
      flip(x, open);
      list.forEach(paintDisc);
      count();
      if (visited.size === list.length) unlock(); // the last tile stays open to read; any click now answers
      return;
    }
    if (solved || i === chosen) return;
    list.forEach((y) => flip(y, false));
    chosen = i;
    const right = !!x.t.correct;
    ctx.answer({ trackingId, response: String(x.t.n), result: right ? 'correct' : 'wrong' });
    list.forEach((y) => paintAnswer(y.btn, y === x ? (right ? 'correct' : 'wrong') : '', ui));
    if (!right) { zones.setFeedback({ state: 'wrong', text: x.t.feedback }); return; }
    solved = true;
    list.forEach((y) => y.btn.setAttribute('aria-disabled', 'true'));
    zones.setFeedback({ state: 'correct', text: x.t.feedback });
    ctx.complete();
    ctx.unlockNext({ focus: true });
  }));

  list.forEach((x) => flip(x, false));
  count();
  if (ctx.revisit) {
    list.forEach((x) => visited.add(x.t.n));
    unlock();
    const k = list.findIndex((x) => x.t.correct);
    solved = true;
    chosen = k;
    paintAnswer(list[k].btn, 'correct', ui);
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
