// Explorer template. One variant (the S05 diagram explorer is gone: NL2 splits it into S05a and S05b,
// src/templates/bpmn.js; NL3 moves S12 to the flags template, src/templates/flags.js):
//   tiles   (S07)  NL2: on the Focus wash, a 4 x 2 grid of tiles that open in place; after all eight the
//                  heading becomes the question and the tiles answer it (one question, wrong = retry).
// Tracking: tiles = the field number of the first answer. Retries as retry events.
import { h, fmt } from '../util.js';
import { glyph } from '../icons.js';
import { layout, arrowNav, paintAnswer } from './stage.js';

export const explorer = {
  mount(ctx) {
    const run = { tiles }[ctx.screen.variant];
    if (!run) throw new Error('explorer: unknown variant ' + ctx.screen.variant);
    return run(ctx) || { unmount() {} };
  },
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
