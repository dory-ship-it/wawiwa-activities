// Decision template (PRD sections 5 and 6). Variants:
//   single     (S01)  click an option = answer; wrong = retry; Continue only after correct
//   challenge  (FT1)  one attempt; routes by result (routing.correctFirstTry / wrong / skipped)
//   multi      (S03)  select exactly `select` cards, Check, paged feedback, wrong ones deselected
//   selfcheck  (S20)  P3 STUB: built in P3 (rows with Yes / Not yet, then chips); until then the
//                     screen mounts the dev placeholder so the slice stays walkable
// Option cards: icon top, label below; the chosen card takes the state colour plus a check or
// cross mark with a state word (never colour alone); the others dim (grey layer on the card).
import { h } from '../util.js';
import { icon } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { letter } from '../tracking/index.js';
import { renderStage, arrowNav } from './stage.js';
import { placeholder } from './placeholder.js';

export const decision = {
  mount(ctx) {
    const variant = ctx.screen.variant;
    if (variant === 'selfcheck') return placeholder.mount(ctx); // P3 STUB
    const run = { single, challenge, multi }[variant];
    if (!run) throw new Error('decision: unknown variant ' + variant);
    const refs = renderStage(ctx, { cardClass: 'w-tpl-decision w-var-' + variant });
    ctx.zones.setFeedback({ state: 'hint', text: ctx.screen.hint });
    return run(ctx, refs) || { unmount() {} };
  },
};

/* ---------- option cards ---------- */
function optionCards(ctx, refs, { checkbox = false } = {}) {
  const { screen, content, ui } = ctx;
  return screen.options.map((o, i) => {
    const label = h('span', { class: 'w-opt-label' }, labelWithTerm(o, content.tooltips));
    const btn = h('button', { class: 'w-opt', type: 'button', dataset: { id: o.id, letter: letter(i) }, 'aria-pressed': checkbox ? 'false' : null },
      icon(o.icon, { size: 28, className: 'w-opt-icon' }), label, h('span', { class: 'w-opt-mark' }));
    refs.options.append(btn);
    // a term inside a button: no nested focusable; the definition goes on the card itself
    // (aria-describedby plus the tip on hover or focus), with a visible info dot
    if (o.term && content.tooltips[o.term]) attachTip(btn, content.tooltips[o.term]);
    if (checkbox) btn.querySelector('.w-opt-mark').dataset.box = 'true';
    return btn;
  });
}

function labelWithTerm(o, tooltips) {
  if (!o.term || !tooltips[o.term]) return o.label;
  const i = o.label.toLowerCase().indexOf(o.term.toLowerCase());
  if (i < 0) return o.label;
  return [o.label.slice(0, i), h('span', { class: 'w-term-static' }, o.label.slice(i, i + o.term.length)), o.label.slice(i + o.term.length),
    icon('info', { size: 20, className: 'w-opt-info' })];
}

// result: 'correct' | 'wrong' | 'dim' | '' (plain); selected only matters for the multi variant
function paint(btn, result, ui) {
  btn.dataset.result = result;
  const mark = btn.querySelector('.w-opt-mark');
  if (result === 'correct') mark.replaceChildren(icon('check', { size: 20, label: ui.feedback.correctPrefix }));
  else if (result === 'wrong') mark.replaceChildren(icon('x', { size: 20, label: ui.feedback.wrongPrefix }));
  else mark.replaceChildren(mark.dataset.box && btn.getAttribute('aria-pressed') === 'true' ? icon('check', { size: 18 }) : '');
}

const lock = (btns) => btns.forEach((b) => b.setAttribute('aria-disabled', 'true'));
const cols = (refs) => (refs.options.dataset.arrange === 'grid-2x2' ? 2 : 1);

/* ---------- single (S01) ---------- */
function single(ctx, refs) {
  const { screen, ui, zones } = ctx;
  const btns = optionCards(ctx, refs);
  arrowNav(refs.options, cols(refs));
  const trackingId = screen.tracking[0].id;
  let solved = false, chosen = -1;

  const show = (i) => btns.forEach((b, j) => paint(b, j === i ? (screen.options[i].correct ? 'correct' : 'wrong') : 'dim', ui));
  const solve = (i, focus) => {
    solved = true;
    show(i);
    lock(btns);
    const cont = zones.setFeedback({ state: 'correct', text: screen.options[i].feedback,
      actions: [{ id: 'continue', label: ui.buttons.continue, primary: true, onClick: () => ctx.finish() }] });
    if (focus) cont.focus();
  };

  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (solved || i === chosen) return; // the same wrong card again is not a new attempt
    chosen = i;
    const o = screen.options[i];
    ctx.answer({ trackingId, response: letter(i), result: o.correct ? 'correct' : 'wrong' });
    if (o.correct) { ctx.complete(); solve(i, true); return; }
    show(i); // wrong: chosen card red, the others dim but stay operable for the retry
    zones.setFeedback({ state: 'wrong', text: o.feedback });
  }));

  if (ctx.revisit) solve(screen.options.findIndex((o) => o.correct), false);
}

/* ---------- challenge (FT1) ---------- */
function challenge(ctx, refs) {
  const { screen, ui, zones } = ctx;
  const btns = optionCards(ctx, refs);
  arrowNav(refs.options, cols(refs));
  const trackingId = screen.tracking[0].id;
  const routing = screen.routing;
  const linkKey = screen.stage.bottom.link;
  let answered = false;

  const skip = h('button', { class: 'w-link', type: 'button', dataset: { action: linkKey }, onclick: () => go(routing.skipped) }, ui.buttons[linkKey]);
  refs.link.append(skip);

  function go(r) { ctx.setRoute(r.route); ctx.complete(); ctx.goTo(r.to); }

  function outcome(i, focus) {
    answered = true;
    const o = screen.options[i];
    btns.forEach((b, j) => paint(b, j === i ? (o.correct ? 'correct' : 'wrong') : 'dim', ui));
    lock(btns);
    skip.hidden = true;
    const actions = o.correct
      ? routing.correctFirstTry.choices.map((c, k) => ({ id: c.button, label: ui.buttons[c.button], primary: k === 0, onClick: () => go(c) }))
      : [{ id: routing.wrong.button, label: ui.buttons[routing.wrong.button], primary: true, onClick: () => go(routing.wrong) }];
    const first = zones.setFeedback({ state: o.correct ? 'correct' : 'wrong', text: o.feedback, actions });
    if (focus) first.focus();
  }

  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (answered) return; // one attempt (screen.attempts)
    ctx.answer({ trackingId, response: letter(i), result: screen.options[i].correct ? 'correct' : 'wrong' });
    outcome(i, true);
  }));

  // revisit after an answer: show it again with its routes (a skipped challenge stays open)
  const first = ctx.firstAnswer(trackingId);
  if (first) outcome(first.response.charCodeAt(0) - 97, false);
}

/* ---------- multi (S03) ---------- */
function multi(ctx, refs) {
  const { screen, ui, zones } = ctx;
  const need = screen.select;
  const btns = optionCards(ctx, refs, { checkbox: true });
  arrowNav(refs.options, cols(refs));
  const trackingId = screen.tracking[0].id;
  const keys = screen.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  const selected = new Set();
  let solved = false, marked = false;

  const check = h('button', { class: 'w-btn w-btn-primary', type: 'button', dataset: { action: 'check' }, disabled: true, onclick: () => doCheck() },
    ui.buttons[screen.stage.bottom.action]);
  refs.action.append(check);

  function update() {
    const full = selected.size >= need;
    btns.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(selected.has(i)));
      if (!marked || !b.dataset.result) paint(b, '', ui);
      if (full && !selected.has(i)) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    });
    check.disabled = selected.size !== need;
  }

  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (solved || btn.getAttribute('aria-disabled') === 'true') return;
    if (marked) { marked = false; btns.forEach((b) => paint(b, '', ui)); } // the next action clears the last Check's marks
    if (selected.has(i)) selected.delete(i); else selected.add(i);
    update();
  }));

  const pagesFor = (list) => list.map((i) => ({ state: screen.options[i].correct ? 'correct' : 'wrong', text: screen.options[i].feedback }));

  function solve(focus) {
    solved = true;
    keys.forEach((i) => selected.add(i));
    btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(keys.includes(i))); paint(b, keys.includes(i) ? 'correct' : 'dim', ui); });
    lock(btns);
    check.disabled = true;
    zones.slots.bottom.hidden = true; // Check is done: the grid takes the card height, no empty strip
    const cont = zones.setFeedback({ pages: pagesFor(keys),
      actions: [{ id: 'continue', label: ui.buttons.continue, primary: true, onClick: () => ctx.finish() }] });
    if (focus) cont.focus();
  }

  function doCheck() {
    if (solved || selected.size !== need) return;
    const chosen = [...selected].sort((a, b) => a - b);
    const right = chosen.length === keys.length && chosen.every((i) => keys.includes(i));
    ctx.answer({ trackingId, response: chosen.map(letter).join(','), result: right ? 'correct' : 'wrong' });
    if (right) { ctx.complete(); solve(true); return; }
    // any wrong: every chosen card shows its state, the wrong ones are deselected, try again
    chosen.forEach((i) => paint(btns[i], screen.options[i].correct ? 'correct' : 'wrong', ui));
    chosen.filter((i) => !screen.options[i].correct).forEach((i) => selected.delete(i));
    marked = true;
    update();
    zones.setFeedback({ pages: pagesFor(chosen) });
    const pagerNext = zones.feedbackRow.querySelector('.w-pager:not([hidden]) button:not([disabled])');
    (pagerNext || btns[chosen.find((i) => !screen.options[i].correct)]).focus();
  }

  if (ctx.revisit) solve(false);
}
