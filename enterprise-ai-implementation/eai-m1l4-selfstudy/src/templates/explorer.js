// Explorer template. One variant (the S05 diagram explorer is gone: NL2 splits it into S05a and S05b,
// src/templates/bpmn.js; NL3 moves S12 to the flags template, src/templates/flags.js):
//   tiles   (S07)  NL2: on the Focus wash, a 4 x 2 grid of tiles that open in place; after all eight the
//                  heading becomes the question and the tiles answer it (one question, two attempts).
// Tracking: tiles = the field number of the first answer. Retries as retry events.
import { h, fmt } from '../util.js?v=a6a1e898';
import { glyph } from '../icons.js?v=a6a1e898';
import { layout, arrowNav, paintAnswer } from './stage.js?v=a6a1e898';

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
// marker (QA1: all tiles close first). Wrong = retry, right = Next; the strip sits under the grid.
// FX1 E5: no numbers on the tiles; the task icon bigger, in a soft round tile; an opened tile shows a
// small done check in its corner; opening flips the tile to its back (none with reduced motion). The
// question: two attempts (the attempt marker under the grid), then the right tile is marked and
// explained (B2). "Show me how": the hand taps a tile that is not the answer and it opens for a
// moment (nothing counts as opened).
function tiles(ctx) {
  const { screen, ui, zones } = ctx;
  const trackingId = screen.tracking[0].id;
  const visited = new Set();
  const max = ctx.revisit ? 0 : screen.attempts || 0;
  let phase = 'explore', solved = false, chosen = -1, tries = 0;

  const sub = h('p', { class: 'w-task-sub', 'aria-live': 'polite' });
  const list = screen.tiles.map((t) => {
    const disc = h('span', { class: 'w-tile-disc', 'aria-hidden': 'true' });
    const icon = h('span', { class: 'w-tile-icon-wrap', 'aria-hidden': 'true' }, glyph(t.icon, { size: 33.28, className: 'w-tile-icon' }));
    const openTitle = h('b', { class: 'w-tile-open-title' }, t.title);
    const mark = h('span', { class: 'w-opt-mark w-tile-mark' });
    const title = h('b', { class: 'w-tile-title' }, t.title);
    const back = h('span', { class: 'w-tile-text' }, t.back);
    const btn = h('button', { class: 'w-tile', type: 'button', 'aria-expanded': 'false', dataset: { n: String(t.n) } },
      h('span', { class: 'w-tile-row' }, icon, openTitle, disc, mark), title, back);
    btn.addEventListener('animationend', () => btn.classList.remove('w-tile-flip'));
    return { t, btn, disc };
  });
  const paintDisc = (x) => x.disc.replaceChildren(phase === 'explore' && visited.has(x.t.n) && x.btn.dataset.open !== 'true' ? glyph('g-check', { size: 15.36 }) : '');
  const flip = (x, open) => {
    if (open && x.btn.dataset.open !== 'true') { x.btn.classList.remove('w-tile-flip'); void x.btn.offsetWidth; x.btn.classList.add('w-tile-flip'); }
    x.btn.dataset.open = String(open);
    if (phase === 'explore') x.btn.setAttribute('aria-expanded', String(open));
    paintDisc(x);
  };
  const grid = h('div', { class: 'w-tiles', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } }, list.map((x) => x.btn));
  arrowNav(grid, { selector: '.w-tile', cols: 4 });
  grid.addEventListener('keydown', (e) => { if (e.key === 'Escape' && list.some((x) => x.btn.dataset.open === 'true')) { e.stopPropagation(); list.forEach((x) => flip(x, false)); } });

  // the ghost hand taps a tile that is not the answer (the first one), it opens for a moment, then closes
  const demo = list.find((x) => !x.t.correct);
  let demoWas = null;
  // with the question on, the demo is the choice screens' sweep over the tiles with "Pick one" (it taps nothing)
  const sweep = () => {
    const r = grid.getBoundingClientRect(), k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
    return [{ point: () => ({ x: r.left + r.width / 2, y: r.top - 14 * k }), from: 'above', sweep: true, hold: 60 },
      { point: () => ({ x: r.left + r.width / 2, y: r.bottom + 12 * k }), sweep: true, slow: true, hold: 1100 }];
  };
  const g = !ctx.revisit ? ctx.ghost({ type: screen.ghost?.type || 'open', chip: () => (phase === 'answer' ? ui.ghost.pickOne : null),
    steps: () => (phase === 'answer' ? sweep() : !demo ? [] : [{ el: demo.btn, tap: () => { demoWas = list.find((x) => x.btn.dataset.open === 'true') || null; list.forEach((y) => flip(y, y === demo)); }, hold: 1100 }]),
    restore: () => { if (phase !== 'explore') return; list.forEach((y) => flip(y, y === demoWas)); demoWas = null; } }) : null;

  layout(ctx, 'tiles', h('div', { class: 'w-task-head' }, h('div', {}, zones.instruction, sub), h('span', { class: 'w-head-tools' }, g ? g.button : null)),
    grid, h('div', { class: 'w-float w-float-tiles' }, zones.band));
  zones.setHintVisible(false); // the frame shows no hint line: the hint stays for screen readers
  zones.setFeedback({ state: 'hint', text: screen.hint });
  const count = () => { sub.textContent = fmt(ui.progress.opened, { i: visited.size, n: list.length }); };

  const unlock = () => {
    phase = 'answer';
    grid.dataset.phase = 'answer';
    zones.instruction.textContent = screen.question;
    sub.textContent = screen.questionHint;
    list.forEach((x) => { x.btn.removeAttribute('aria-expanded'); paintDisc(x); });
    // "Show me how" moves to the row above the strip (the question takes the heading's full width)
    if (g) zones.setTool(g.button);
    zones.setFeedback({ state: 'hint', text: screen.questionHint });
    if (max) zones.setAttempts(1, max);
  };

  list.forEach((x, i) => x.btn.addEventListener('click', () => {
    if (phase === 'explore') {
      const open = x.btn.dataset.open !== 'true';
      list.forEach((y) => { if (y !== x) flip(y, false); });
      if (open) visited.add(x.t.n);
      flip(x, open);
      list.forEach(paintDisc);
      count();
      // QA1: the tiles close as the question comes (opened in order, the last one open was the answer,
      // Field 8); any click now answers
      if (visited.size === list.length) { list.forEach((y) => flip(y, false)); unlock(); }
      return;
    }
    if (solved || i === chosen) return;
    list.forEach((y) => flip(y, false));
    chosen = i;
    tries += 1;
    const right = !!x.t.correct;
    ctx.answer({ trackingId, response: String(x.t.n), result: right ? 'correct' : 'wrong' });
    list.forEach((y) => paintAnswer(y.btn, y === x ? (right ? 'correct' : 'wrong') : '', ui));
    if (!right && !(max && tries >= max)) { if (max) zones.setAttempts(tries + 1, max); zones.setFeedback({ state: 'wrong', text: x.t.feedback }); return; }
    solved = true;
    list.forEach((y) => y.btn.setAttribute('aria-disabled', 'true'));
    if (right) zones.setFeedback({ state: 'correct', text: x.t.feedback });
    else {
      // the last attempt: the right tile is marked (the chosen one keeps its cross) and explained
      const k = list.find((y) => y.t.correct);
      paintAnswer(k.btn, 'correct', ui);
      zones.setFeedback({ state: 'neutral', verdict: ui.feedback.revealed, text: k.t.feedback });
    }
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
