// Decision template (PRD sections 5 and 6), approved look (P1.5). Variants and their layouts:
//   single     (S01)  layout "editorial" (R2A): image column left; eyebrow, two quotes, attribution,
//                     instruction and three numbered hairline rows right, band under the rows.
//                     Click an option = answer; wrong = retry; Next unlocks only after the right one.
//   challenge  (FT1)  layout "memo" (R2B): image top left with the memo card over it; instruction and
//                     hint left, three option cards right, band under the cards (Skip in it before an
//                     answer, the route buttons after). One attempt; routes by result.
//   multi      (S03)  layout "work" (R2D): label and instruction left, the video-case stills right,
//                     the process line with one marker per option, four cards in a row, the band
//                     under them with Check inside. One band per attempt, no paging.
//   selfcheck  (S20)  P3 STUB: mounts the dev placeholder so the slice stays walkable.
// State is never colour alone: a check or cross mark with a label, the verdict word in the band.
import { h } from '../util.js';
import { icon } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { letter } from '../tracking/index.js';
import { layout, picture, ruleLabel, arrowNav } from './stage.js';
import { placeholder } from './placeholder.js';

export const decision = {
  mount(ctx) {
    const variant = ctx.screen.variant;
    if (variant === 'selfcheck') return placeholder.mount(ctx); // P3 STUB
    const run = { single, challenge, multi }[variant];
    if (!run) throw new Error('decision: unknown variant ' + variant);
    return run(ctx) || { unmount() {} };
  },
};

/* ---------- option buttons ---------- */
// kind: 'row' (numbered hairline row, S01), 'card' (numbered card with a radio ring, FT1),
// 'check' (text card with a checkbox mark, S03)
function options(ctx, kind) {
  const { screen, content } = ctx;
  const group = h('div', { class: 'w-options w-options-' + kind, role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } });
  const btns = screen.options.map((o, i) => {
    const label = h('span', { class: 'w-opt-label' }, labelWithTerm(o, content.tooltips));
    const num = kind === 'check' ? null : h('span', { class: 'w-opt-num', 'aria-hidden': 'true' }, String(i + 1));
    const tail = kind === 'row' ? icon('chevron-right', { size: 20, className: 'w-opt-chev' }) : null;
    const mark = h('span', { class: 'w-opt-mark' });
    const btn = kind === 'card'
      ? h('button', { class: 'w-opt w-opt-card', type: 'button', dataset: { id: o.id, letter: letter(i) } }, h('span', { class: 'w-opt-top' }, num, mark), label)
      : h('button', { class: 'w-opt w-opt-' + kind, type: 'button', dataset: { id: o.id, letter: letter(i) }, 'aria-pressed': kind === 'check' ? 'false' : null }, num, label, tail, mark);
    group.append(btn);
    // a term inside a button: no nested focusable; the definition goes on the button itself
    // (aria-describedby plus the tip on hover or focus), with a visible info dot
    if (o.term && content.tooltips[o.term]) attachTip(btn, content.tooltips[o.term]);
    return btn;
  });
  arrowNav(group);
  return { group, btns };
}

function labelWithTerm(o, tooltips) {
  if (!o.term || !tooltips[o.term]) return o.label;
  const i = o.label.toLowerCase().indexOf(o.term.toLowerCase());
  if (i < 0) return o.label;
  return [o.label.slice(0, i), h('span', { class: 'w-term-static' }, o.label.slice(i, i + o.term.length)), o.label.slice(i + o.term.length),
    icon('info', { size: 18, className: 'w-opt-info' })];
}

// result: 'correct' | 'wrong' | '' (plain). The mark carries the state word for screen readers.
function paint(btn, result, ui) {
  btn.dataset.result = result;
  const mark = btn.querySelector('.w-opt-mark');
  if (result === 'correct') mark.replaceChildren(icon('check', { size: 16, label: ui.feedback.correctPrefix }));
  else if (result === 'wrong') mark.replaceChildren(icon('x', { size: 16, label: ui.feedback.wrongPrefix }));
  else mark.replaceChildren(btn.getAttribute('aria-pressed') === 'true' ? icon('check', { size: 16 }) : '');
}

const lock = (btns) => btns.forEach((b) => b.setAttribute('aria-disabled', 'true'));

/* ---------- single (S01), layout editorial ---------- */
function single(ctx) {
  const { screen, ui, zones, content } = ctx;
  const top = screen.stage.top;
  const ch = content.characters[top.character];
  const { group, btns } = options(ctx, 'row');
  const bubbles = top.bubbles || [];
  const attribution = [top.label || ch.label, ch.fictional ? ui.fictionalBadge : null].filter(Boolean).join(' · ');

  layout(ctx, 'editorial',
    h('header', { class: 'w-header' }, zones.logo),
    h('div', { class: 'w-editorial' },
      picture(screen.image, 'w-photo-column'),
      h('section', { class: 'w-col' },
        top.eyebrow ? h('p', { class: 'w-eyebrow' }, top.eyebrow) : null,
        h('blockquote', { class: 'w-quote' }, bubbles.map((b, i) => h('p', { class: i === 0 ? 'w-quote-1' : 'w-quote-2' }, '“' + b + '”'))),
        h('p', { class: 'w-attrib' }, h('span', { class: 'w-rule', 'aria-hidden': 'true' }), h('span', {}, attribution)),
        zones.instruction,
        group,
        zones.band)));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const trackingId = screen.tracking[0].id;
  let solved = false, chosen = -1;
  const show = (i) => btns.forEach((b, j) => paint(b, j === i ? (screen.options[i].correct ? 'correct' : 'wrong') : '', ui));
  const solve = (i, focus) => {
    solved = true;
    show(i);
    lock(btns);
    zones.setFeedback({ state: 'correct', text: screen.options[i].feedback });
    ctx.unlockNext({ focus });
  };

  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (solved || i === chosen) return; // the same wrong row again is not a new attempt
    chosen = i;
    const o = screen.options[i];
    ctx.answer({ trackingId, response: letter(i), result: o.correct ? 'correct' : 'wrong' });
    if (o.correct) { ctx.complete(); solve(i, true); return; }
    show(i); // wrong: the chosen row turns red, the others stay operable for the retry
    zones.setFeedback({ state: 'wrong', text: o.feedback });
  }));

  if (ctx.revisit) solve(screen.options.findIndex((o) => o.correct), false);
}

/* ---------- challenge (FT1), layout memo ---------- */
function challenge(ctx) {
  const { screen, ui, zones } = ctx;
  const { group, btns } = options(ctx, 'card');
  const trackingId = screen.tracking[0].id;
  const routing = screen.routing;
  const memo = screen.memo || {};
  let answered = false;

  const skip = h('button', { class: 'w-link', type: 'button', dataset: { action: screen.stage.bottom.link }, onclick: () => go(routing.skipped) }, ui.buttons[screen.stage.bottom.link]);

  layout(ctx, 'memo',
    picture(screen.image, 'w-photo-memo'),
    zones.logo,
    h('article', { class: 'w-memo', 'aria-label': memo.label || null },
      memo.label ? h('p', { class: 'w-memo-head' }, memo.label) : null,
      h('p', { class: 'w-memo-line' }, screen.stage.top.text),
      h('p', { class: 'w-memo-q' }, screen.stage.middle.text),
      h('span', { class: 'w-memo-rule', 'aria-hidden': 'true' })),
    h('div', { class: 'w-memo-left' },
      zones.instruction,
      h('p', { class: 'w-hintline' }, icon('info', { size: 20 }), h('span', {}, screen.hint))),
    h('div', { class: 'w-memo-right' }, group, zones.band));
  zones.setFeedback({ state: 'idle' });
  zones.setTool(skip);

  function go(r) { ctx.setRoute(r.route); ctx.complete(); ctx.goTo(r.to); }

  function outcome(i, focus) {
    answered = true;
    const o = screen.options[i];
    btns.forEach((b, j) => paint(b, j === i ? (o.correct ? 'correct' : 'wrong') : '', ui));
    lock(btns);
    zones.setTool(); // Skip is gone once answered
    if (o.correct) {
      const first = zones.setFeedback({ state: 'correct', text: o.feedback,
        actions: routing.correctFirstTry.choices.map((c) => ({ id: c.button, label: ui.buttons[c.button], onClick: () => go(c) })) });
      ctx.lockNext(ui.footer.locked.route);
      if (focus) first.focus();
    } else {
      zones.setFeedback({ state: 'wrong', text: o.feedback });
      ctx.unlockNext({ focus, onNext: () => go(routing.wrong) });
    }
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

/* ---------- multi (S03), layout work ---------- */
function multi(ctx) {
  const { screen, ui, zones } = ctx;
  const need = screen.select;
  const { group, btns } = options(ctx, 'check');
  const trackingId = screen.tracking[0].id;
  const keys = screen.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  const selected = new Set();
  let solved = false, marked = false;

  // the process line: one marker per option, in the same columns as the cards
  const markers = screen.options.map(() => h('span', { class: 'w-marker' }, h('span', { class: 'w-marker-box' }), h('span', { class: 'w-marker-stem' })));
  const setMarker = (i, state) => {
    markers[i].dataset.state = state;
    markers[i].firstChild.replaceChildren(state === 'correct' ? icon('check', { size: 14 }) : state === 'wrong' ? icon('x', { size: 14 }) : '');
  };
  const cases = (screen.cases || []).map((c) =>
    // the still will open V1 at its case (c.video, c.segment) once the player exists (P3); no control until then
    h('figure', { class: 'w-case', dataset: { video: c.video || '', segment: String(c.segment ?? '') } },
      h('div', { class: 'w-still' }, picture(c.image, 'w-photo-still'), h('span', { class: 'w-play', 'aria-hidden': 'true' }, icon('play', { size: 16 }))),
      h('figcaption', {}, c.label)));

  layout(ctx, 'work',
    zones.logo,
    h('div', { class: 'w-work-head' }, ruleLabel(screen.stage.top.text), zones.instruction),
    cases.length ? h('div', { class: 'w-cases' }, cases) : null,
    h('div', { class: 'w-work-task' },
      h('div', { class: 'w-process', 'aria-hidden': 'true' }, h('span', { class: 'w-process-line' }), markers),
      group,
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const check = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'check' }, disabled: true, onclick: () => doCheck() },
    ui.buttons[screen.stage.bottom.action]);
  zones.setTool(check);

  function update() {
    const full = selected.size >= need;
    btns.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(selected.has(i)));
      if (!marked || !b.dataset.result) paint(b, '', ui);
      if (full && !selected.has(i)) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      setMarker(i, b.dataset.result || (selected.has(i) ? 'selected' : ''));
    });
    check.disabled = selected.size !== need;
  }

  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (solved || btn.getAttribute('aria-disabled') === 'true') return;
    if (marked) { marked = false; btns.forEach((b) => paint(b, '', ui)); } // the next action clears the last Check's marks
    if (selected.has(i)) selected.delete(i); else selected.add(i);
    update();
  }));

  function solve(focus) {
    solved = true;
    keys.forEach((i) => selected.add(i));
    btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(keys.includes(i))); paint(b, keys.includes(i) ? 'correct' : '', ui); setMarker(i, keys.includes(i) ? 'correct' : ''); });
    lock(btns);
    zones.setTool(); // Check is done
    zones.setFeedback({ state: 'correct', text: keys.map((i) => screen.options[i].feedback).join(' ') });
    ctx.unlockNext({ focus });
  }

  function doCheck() {
    if (solved || selected.size !== need) return;
    const chosen = [...selected].sort((a, b) => a - b);
    const rightCount = chosen.filter((i) => keys.includes(i)).length;
    const right = rightCount === keys.length && chosen.length === keys.length;
    ctx.answer({ trackingId, response: chosen.map(letter).join(','), result: right ? 'correct' : 'wrong' });
    if (right) { ctx.complete(); solve(true); return; }
    // any wrong: every chosen card shows its state, the wrong ones are deselected, try again.
    // One band: the verdict for the attempt and the feedback of the first wrong card chosen.
    chosen.forEach((i) => paint(btns[i], screen.options[i].correct ? 'correct' : 'wrong', ui));
    const wrong = chosen.filter((i) => !screen.options[i].correct);
    wrong.forEach((i) => selected.delete(i));
    marked = true;
    update();
    zones.setFeedback({ state: 'wrong', verdict: rightCount === 1 && keys.length === 2 ? ui.feedback.oneOfTwo : ui.feedback.wrongPrefix, text: screen.options[wrong[0]].feedback });
    btns[wrong[0]].focus();
  }

  if (ctx.revisit) solve(false);
}
