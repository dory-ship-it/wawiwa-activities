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
//   pair       (S06)  layout "wide": two situation cards side by side, the right one revealed after
//                     the left is right; two option rows under each; one band under both.
//   rounds     (S08)  layout "wide": AS-IS strip, template row (field badge + map line), round dots,
//                     three rule rows, band under them; "Next round" in the band after a right answer,
//                     Next after round 3.
//   fill       (S10)  layout "wide": situation line, the field rows (a pre-filled grey row, the active
//                     row whose slot takes the chosen line), 2x2 option cards, band under them.
//   metric     (S11)  layout "wide": the field row, four stacked option rows, then "Checkable later?"
//                     with three slots (Baseline, Target, Date) that light up for the chosen option.
//   bounds     (S13)  layout "wide": a strip of the process steps, three Start / End cards in a row.
//   S14 and S15 use single in the editorial layout with a statement line instead of the quotes.
//   selfcheck  (S20)  P3 STUB: mounts the dev placeholder so the slice stays walkable.
// State is never colour alone: a check or cross mark with a label, the verdict word in the band.
import { h, fmt } from '../util.js';
import { icon } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { letter } from '../tracking/index.js';
import { layout, picture, ruleLabel, arrowNav, progressDots } from './stage.js';
import { placeholder } from './placeholder.js';

export const decision = {
  mount(ctx) {
    const variant = ctx.screen.variant;
    if (variant === 'selfcheck') return placeholder.mount(ctx); // P3 STUB
    const run = { single, challenge, multi, pair, rounds, fill, metric, bounds }[variant];
    if (!run) throw new Error('decision: unknown variant ' + variant);
    return run(ctx) || { unmount() {} };
  },
};

/* ---------- option buttons ---------- */
// kind: 'row' (numbered hairline row, S01), 'card' (numbered card with a radio ring, FT1),
// 'check' (text card with a checkbox mark, S03). list: the options (default screen.options);
// lead: 'num' (1, 2, 3), 'icon' (the option's icon, S06 and S08 rows) or 'none'; interaction: false when the
// group sits inside a larger interaction area.
function options(ctx, kind, { list = ctx.screen.options, lead = 'num', labelledby = 'w-instruction', interaction = true } = {}) {
  const { content } = ctx;
  const group = h('div', { class: 'w-options w-options-' + kind, role: 'group', 'aria-labelledby': labelledby, dataset: interaction ? { interaction: '' } : {} });
  const btns = list.map((o, i) => {
    const label = h('span', { class: 'w-opt-label' }, labelWithTerm(o, content.tooltips));
    const num = kind === 'check' || lead === 'none' ? null : lead === 'icon'
      ? h('span', { class: 'w-opt-num w-opt-lead' }, icon(o.icon, { size: 24 }))
      : h('span', { class: 'w-opt-num', 'aria-hidden': 'true' }, String(i + 1));
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
  const { group, btns } = options(ctx, 'row');
  // top: a character's two quotes with the attribution (S01), or one statement line (S14, S15) whose
  // optional highlight (the hours in S15) is set as a large number inside the sentence
  let statement;
  if (top.kind === 'character') {
    const ch = content.characters[top.character];
    const attribution = [top.label || ch.label, ch.fictional ? ui.fictionalBadge : null].filter(Boolean).join(' · ');
    statement = [
      h('blockquote', { class: 'w-quote' }, (top.bubbles || []).map((b, i) => h('p', { class: i === 0 ? 'w-quote-1' : 'w-quote-2' }, '“' + b + '”'))),
      h('p', { class: 'w-attrib' }, h('span', { class: 'w-rule', 'aria-hidden': 'true' }), h('span', {}, attribution))];
  } else {
    const k = top.highlight ? top.text.indexOf(top.highlight) : -1;
    statement = h('p', { class: 'w-statement' + (k >= 0 ? ' w-statement-figure' : '') },
      k < 0 ? top.text : [top.text.slice(0, k), h('span', { class: 'w-figure' }, top.highlight), top.text.slice(k + top.highlight.length)]);
  }

  layout(ctx, 'editorial',
    h('header', { class: 'w-header' }, zones.logo),
    h('div', { class: 'w-editorial' },
      picture(screen.image, 'w-photo-column'),
      h('section', { class: 'w-col' },
        top.eyebrow ? h('p', { class: 'w-eyebrow' }, top.eyebrow) : null,
        statement,
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
  const { group, btns } = options(ctx, 'card', { lead: 'none' }); // no numerals: FT labels carry their own field numbers
  const trackingId = screen.tracking[0].id;
  const routing = screen.routing;
  const header = fmt(ui.memo.header, { n: ctx.chapter?.n ?? '' });
  let answered = false;

  const skip = h('button', { class: 'w-link', type: 'button', dataset: { action: screen.stage.bottom.link }, onclick: () => go(routing.skipped) }, ui.buttons[screen.stage.bottom.link]);

  layout(ctx, 'memo',
    picture(screen.image, 'w-photo-memo'),
    zones.logo,
    h('article', { class: 'w-memo', 'aria-label': header },
      h('p', { class: 'w-memo-head' }, header),
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

/* ---------- one single-choice question on hairline rows (S06 situations, S08 rounds) ---------- */
// Wrong = the calm wrong mark on the row, retry; right = rows locked, onRight(focus). The same wrong
// row again is not a new attempt. feedbackOf / isRight read the option (or the round) as needed.
function rowQuestion(ctx, btns, list, { trackingId, isRight, feedbackOf, onRight, onChoose = () => {} }) {
  const { ui, zones } = ctx;
  let solved = false, chosen = -1;
  const show = (i) => btns.forEach((b, j) => paint(b, j === i ? (isRight(list[i]) ? 'correct' : 'wrong') : '', ui));
  const solve = (i, focus) => { solved = true; chosen = i; show(i); lock(btns); onChoose(i, true); onRight(i, focus); };
  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (solved || i === chosen) return;
    chosen = i;
    const right = isRight(list[i]);
    if (!right) onChoose(i, false);
    ctx.answer({ trackingId: trackingId(), response: letter(i), result: right ? 'correct' : 'wrong' });
    if (right) { solve(i, true); return; }
    show(i);
    zones.setFeedback({ state: 'wrong', text: feedbackOf(list[i]) });
  }));
  return {
    solve,
    reset() { solved = false; chosen = -1; btns.forEach((b) => { paint(b, '', ui); b.removeAttribute('aria-disabled'); }); },
  };
}

/* ---------- pair (S06), layout wide ---------- */
function pair(ctx) {
  const { screen, zones } = ctx;
  const sides = screen.situations.map((s, k) => {
    const textId = 'w-situation-' + s.id;
    const { group, btns } = options(ctx, 'row', { list: s.options, lead: 'icon', labelledby: textId, interaction: false });
    const col = h('section', { class: 'w-situation' },
      h('div', { class: 'w-situation-card' },
        h('span', { class: 'w-situation-num', 'aria-hidden': 'true' }, String(k + 1)),
        h('p', { class: 'w-situation-text', id: textId }, s.text)),
      group,
      h('span', { class: 'w-situation-lock', 'aria-hidden': 'true' }, icon('lock', { size: 28 })));
    return { s, col, btns };
  });
  const setOpen = (side, open) => { side.col.dataset.state = open ? 'open' : 'locked'; side.col.inert = !open; };
  sides.forEach((side, k) => setOpen(side, k === 0));

  layout(ctx, 'wide', zones.logo,
    h('div', { class: 'w-wide' }, zones.instruction, h('div', { class: 'w-pair', dataset: { interaction: '' } }, sides.map((x) => x.col)), zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const questions = sides.map((side, k) => rowQuestion(ctx, side.btns, side.s.options, {
    trackingId: () => side.s.trackingId,
    isRight: (o) => o.correct,
    feedbackOf: (o) => o.feedback,
    onRight: (i, focus) => {
      zones.setFeedback({ state: 'correct', text: side.s.options[i].feedback });
      const next = sides[k + 1];
      if (next) { setOpen(next, true); if (focus) next.btns[0].focus(); return; }
      ctx.complete();
      ctx.unlockNext({ focus });
    },
  }));

  if (ctx.revisit) questions.forEach((q, k) => q.solve(sides[k].s.options.findIndex((o) => o.correct), false));
}

/* ---------- rounds (S08), layout wide ---------- */
function rounds(ctx) {
  const { screen, ui, zones } = ctx;
  const list = screen.rounds;
  const badge = h('span', { class: 'w-field-badge' });
  const line = h('p', { class: 'w-round-line' });
  const dots = progressDots(list.length, (i, n) => fmt(ui.progress.round, { i, n }));
  const { group, btns } = options(ctx, 'row', { lead: 'icon', interaction: false });
  let r = 0;

  layout(ctx, 'wide', zones.logo,
    h('div', { class: 'w-wide' },
      zones.instruction,
      h('div', { class: 'w-rounds', dataset: { interaction: '' } },
        ruleLabel(screen.strip),
        h('div', { class: 'w-template-row' }, badge, line),
        dots.el,
        group),
      zones.band));

  const q = rowQuestion(ctx, btns, screen.options, {
    trackingId: () => list[r].trackingId,
    isRight: (o) => o.id === list[r].correct,
    feedbackOf: (o) => list[r].feedback[o.id],
    onRight: (i, focus) => {
      dots.set(r, r + 1);
      const fb = list[r].feedback[screen.options[i].id];
      if (r < list.length - 1) {
        const go = zones.setFeedback({ state: 'correct', text: fb, actions: [{ id: 'nextRound', label: ui.buttons.nextRound, onClick: () => { show(r + 1); btns[0].focus(); } }] });
        if (focus) go.focus();
        return;
      }
      zones.setFeedback({ state: 'correct', text: fb });
      ctx.complete();
      ctx.unlockNext({ focus });
    },
  });

  function show(k) {
    r = k;
    badge.textContent = list[k].badge;
    line.textContent = list[k].line;
    dots.set(k, k);
    q.reset();
    zones.setFeedback({ state: 'hint', text: screen.hint });
  }

  show(0);
  if (ctx.revisit) { show(list.length - 1); q.solve(screen.options.findIndex((o) => o.id === list[r].correct), false); }
}

// One right answer on screen.options, Next after it (fill, metric, bounds).
function oneQuestion(ctx, btns, { onChoose } = {}) {
  const { screen, zones } = ctx;
  const q = rowQuestion(ctx, btns, screen.options, {
    trackingId: () => screen.tracking[0].id,
    isRight: (o) => o.correct,
    feedbackOf: (o) => o.feedback,
    onChoose,
    onRight: (i, focus) => { zones.setFeedback({ state: 'correct', text: screen.options[i].feedback }); ctx.complete(); ctx.unlockNext({ focus }); },
  });
  if (ctx.revisit) q.solve(screen.options.findIndex((o) => o.correct), false);
}

/* ---------- fill (S10), layout wide ---------- */
function fill(ctx) {
  const { screen, zones } = ctx;
  const { group, btns } = options(ctx, 'card', { lead: 'none', interaction: false });
  group.classList.add('w-options-grid2');
  const slot = h('span', { class: 'w-field-slot', 'aria-live': 'polite' });
  const rows = screen.fieldRows.map((f) => h('div', { class: 'w-field-row', dataset: { state: f.prefilled ? 'prefilled' : 'active' } },
    h('span', { class: 'w-field-name' }, f.label), f.prefilled ? h('span', { class: 'w-field-value' }, f.value) : slot));
  layout(ctx, 'wide', zones.logo,
    h('div', { class: 'w-wide' },
      zones.instruction,
      h('div', { class: 'w-fill', dataset: { interaction: '' } },
        h('p', { class: 'w-situation-line' }, icon(screen.situation.icon, { size: 24 }), h('span', {}, screen.situation.text)),
        h('div', { class: 'w-field-rows' }, rows),
        group),
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  oneQuestion(ctx, btns, { onChoose: (i, right) => { slot.textContent = screen.options[i].label; slot.dataset.result = right ? 'correct' : 'wrong'; } });
}

/* ---------- metric (S11), layout wide ---------- */
function metric(ctx) {
  const { screen, ui, zones } = ctx;
  const { group, btns } = options(ctx, 'row', { interaction: false });
  const slots = screen.slots.map((s) => {
    const state = h('span', { class: 'w-sr-only' });
    const el = h('li', { class: 'w-slot', dataset: { slot: s.id } }, h('span', { class: 'w-slot-mark', 'aria-hidden': 'true' }), h('span', { class: 'w-slot-label' }, s.label), state);
    return { s, el, state };
  });
  const setSlots = (o) => slots.forEach((x) => {
    const on = !!o.checks[x.s.id];
    x.el.dataset.on = String(on);
    x.el.querySelector('.w-slot-mark').replaceChildren(icon(on ? 'check' : 'x', { size: 16 }));
    x.state.textContent = ' ' + (on ? ui.slot.on : ui.slot.off);
  });
  layout(ctx, 'wide', zones.logo,
    h('div', { class: 'w-wide' },
      zones.instruction,
      h('div', { class: 'w-metric', dataset: { interaction: '' } },
        h('p', { class: 'w-field-row w-field-head' }, icon(screen.field.icon, { size: 22 }), h('span', { class: 'w-field-name' }, screen.field.label)),
        group,
        h('div', { class: 'w-slots', 'aria-live': 'polite' }, h('p', { class: 'w-slots-title' }, screen.slotsTitle), h('ul', {}, slots.map((x) => x.el)))),
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  oneQuestion(ctx, btns, { onChoose: (i) => setSlots(screen.options[i]) });
}

/* ---------- bounds (S13), layout wide ---------- */
function bounds(ctx) {
  const { screen, zones } = ctx;
  const steps = screen.strip.split(', ');
  const strip = h('p', { class: 'w-steps-strip' }, steps.map((s, i) => [
    i ? [h('span', { class: 'w-sr-only' }, ', '), icon('arrow-right', { size: 18, className: 'w-steps-arrow' })] : null,
    h('span', { class: 'w-step-chip' }, s)]));
  const btns = screen.options.map((o, i) => h('button', { class: 'w-opt w-opt-bounds', type: 'button', dataset: { id: o.id, letter: letter(i) } },
    h('span', { class: 'w-bound' }, icon('flag', { size: 22, className: 'w-bound-icon' }), h('span', {}, h('b', {}, screen.startLabel), ' ', o.start)),
    h('span', { class: 'w-bound w-bound-end' }, icon('finish', { size: 22, className: 'w-bound-icon' }), h('span', {}, h('b', {}, screen.endLabel), ' ', o.end)),
    h('span', { class: 'w-opt-mark' })));
  const group = h('div', { class: 'w-options w-options-bounds', role: 'group', 'aria-labelledby': 'w-instruction' }, btns);
  arrowNav(group);
  layout(ctx, 'wide', zones.logo,
    h('div', { class: 'w-wide' }, zones.instruction, h('div', { class: 'w-bounds', dataset: { interaction: '' } }, strip, group), zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  oneQuestion(ctx, btns);
}
