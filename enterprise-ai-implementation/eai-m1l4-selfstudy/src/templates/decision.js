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
//   safety     (S18)  editorial: step 1 three option rows; once right, step 2 in the same column: the case
//                     title (pre-filled from S02, 250 max), the privacy line, a checkbox and Save.
//   selfcheck  (S20)  layout "wide", two steps, all neutral: three question rows with Yes / Not yet
//                     toggles (Next opens step 2), then five chips, any one; "Reopen workbook" link.
//   close      (S22)  editorial, two steps: three takeaway cards (any one), then the bridge and homework
//                     lines with Open homework (new tab), Download my lesson record and Finish lesson.
// State is never colour alone: a check or cross mark with a label, the verdict word in the band.
import { h, fmt, resolveLink } from '../util.js';
import { icon } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { letter } from '../tracking/index.js';
import { layout, picture, ruleLabel, arrowNav, progressDots, privacyLine } from './stage.js';
import { field } from './input.js';

export const decision = {
  mount(ctx) {
    const variant = ctx.screen.variant;
    const run = { single, challenge, multi, pair, rounds, fill, metric, bounds, safety, selfcheck, close }[variant];
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
    // a still from V1 as a reminder of each case: a picture only, so no play badge
    h('figure', { class: 'w-case', dataset: { video: c.video || '', segment: String(c.segment ?? '') } },
      h('div', { class: 'w-still' }, picture(c.image, 'w-photo-still')),
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

// the editorial frame for the R3 screens: header logo, image column, the right column's parts
function editorial(ctx, ...parts) {
  layout(ctx, 'editorial',
    h('header', { class: 'w-header' }, ctx.zones.logo),
    h('div', { class: 'w-editorial' }, picture(ctx.screen.image, 'w-photo-column'), h('section', { class: 'w-col' }, ...parts)));
}
const newTabLink = (ctx, href, label, action, cls = 'w-btn w-btn-ghost') => h('a', { class: cls, href, target: '_blank', rel: 'noopener noreferrer', dataset: { action } },
  h('span', {}, label), icon('external-link', { size: 16 }), h('span', { class: 'w-sr-only' }, ' (' + ctx.ui.newTabNote + ')'));

/* ---------- safety (S18), editorial, two steps ---------- */
function safety(ctx) {
  const { screen, ui, zones } = ctx;
  const s2 = screen.step2;
  const { group, btns } = options(ctx, 'row');
  const privacy = privacyLine(s2.privacy);
  const announcer = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
  const ctl = field(s2.field, ctx, privacy.id, announcer);
  const box = h('input', { class: 'w-checkbox', type: 'checkbox', id: 'w-s18-box' });
  const boxLabel = h('label', { class: 'w-checkline', for: box.id }, box, icon('shield', { size: 20 }), h('span', {}, s2.checkbox));
  const save = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'save' } }, ui.buttons.save);
  const step2 = h('div', { class: 'w-form-task w-safety-form', dataset: { interaction: '' }, hidden: true }, ctl.el, announcer, privacy.el, h('div', { class: 'w-actionbar' }, boxLabel, save));
  editorial(ctx,
    h('p', { class: 'w-statement w-statement-icon' }, icon(screen.stage.top.icon || 'lock', { size: 26 }), h('span', {}, screen.stage.top.text)),
    zones.instruction, group, step2, zones.band);
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const toStep2 = (focus) => { group.hidden = true; step2.hidden = false; if (focus) ctl.input.focus(); };
  const saved = (focus) => { save.className = 'w-btn w-btn-ghost'; zones.setFeedback({ state: 'neutral', text: s2.feedback.saved }); ctx.unlockNext({ focus }); };
  const q = rowQuestion(ctx, btns, screen.options, {
    trackingId: () => screen.tracking[0].id,
    isRight: (o) => o.correct,
    feedbackOf: (o) => o.feedback,
    onRight: (i, focus) => { zones.setFeedback({ state: 'correct', text: screen.options[i].feedback }); toStep2(focus); },
  });
  save.addEventListener('click', () => {
    const v = ctl.input.value.trim();
    if (!box.checked) { zones.setFeedback({ state: 'notice', text: s2.feedback.unticked }); return; }
    if (!v) { zones.setFeedback({ state: 'notice', text: s2.feedback.empty }); return; }
    ctl.input.value = v;
    ctl.input.dispatchEvent(new Event('input'));
    ctx.store.set(s2.field.store, v); // the one stored case title (S02 wrote it first)
    ctx.flags.set('box', 1);
    ctx.answer({ trackingId: s2.field.trackingId, response: v, result: 'neutral' });
    ctx.complete();
    saved(true);
  });
  if (ctx.revisit) { q.solve(screen.options.findIndex((o) => o.correct), false); box.checked = !!ctx.flags.get('box'); saved(false); }
}

/* ---------- selfcheck (S20), wide, two steps, neutral ---------- */
function selfcheck(ctx) {
  const { screen, ui, zones, content } = ctx;
  const [s1, s2] = screen.steps;
  const ans = { ...(ctx.flags.get('ans') || {}) };
  const keep = () => ctx.flags.set('ans', { ...ans });
  const reopen = newTabLink(ctx, resolveLink(content, '@links.workbook'), ui.buttons[s1.link], 'reopen', 'w-link w-reopen');

  const rows = s1.rows.map((r) => {
    const qid = 'w-sc-' + r.id;
    const toggles = s1.choices.map((c) => h('button', { class: 'w-toggle', type: 'button', 'aria-pressed': 'false', dataset: { choice: c } }, ui.buttons[c]));
    const el = h('div', { class: 'w-check-row', dataset: { row: r.id } }, icon(r.icon, { size: 24 }), h('p', { class: 'w-check-q', id: qid }, r.text),
      h('div', { class: 'w-toggles', role: 'group', 'aria-labelledby': qid }, toggles));
    return { r, el, toggles };
  });
  const step1 = h('div', { class: 'w-selfcheck', dataset: { interaction: '' } }, rows.map((x) => x.el));
  const chips = s2.chips.map((c, i) => {
    const btn = h('button', { class: 'w-chip', type: 'button', 'aria-pressed': 'false', dataset: { chip: c.id, letter: letter(i) } }, labelWithTerm(c, content.tooltips));
    if (c.term && content.tooltips[c.term]) attachTip(btn, content.tooltips[c.term]);
    return { c, btn };
  });
  const chipRow = h('div', { class: 'w-chips', role: 'group', 'aria-labelledby': 'w-instruction' }, chips.map((x) => x.btn));
  arrowNav(chipRow, { selector: '.w-chip' });
  const step2 = h('div', { class: 'w-selfcheck2', dataset: { interaction: '' }, hidden: true }, chipRow,
    h('p', { class: 'w-strip' }, icon('check-circle', { size: 20 }), h('span', {}, s2.strip)));
  layout(ctx, 'wide', zones.logo, h('div', { class: 'w-wide' }, zones.instruction, step1, step2, zones.band, h('div', { class: 'w-link-row' }, reopen)));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const press = (list, on) => list.forEach((b) => b.setAttribute('aria-pressed', String(b === on)));
  function toStep2(focus) {
    step1.hidden = true;
    step2.hidden = false;
    ctx.lockNext(ui.footer.locked.chips);
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (focus) chips[0].btn.focus();
  }
  const allAnswered = () => s1.rows.every((r) => ans[r.id]);
  rows.forEach((x) => x.toggles.forEach((t, i) => t.addEventListener('click', () => {
    const c = s1.choices[i];
    press(x.toggles, t);
    zones.setFeedback({ state: 'neutral', text: x.r.feedback[c] });
    ctx.answer({ trackingId: x.r.trackingId, response: letter(i), result: 'neutral' });
    const was = allAnswered();
    ans[x.r.id] = c;
    keep();
    if (!was && allAnswered()) ctx.unlockNext({ focus: true, onNext: () => toStep2(true) });
  })));
  chips.forEach((x, i) => x.btn.addEventListener('click', () => {
    press(chips.map((y) => y.btn), x.btn);
    zones.setFeedback({ state: 'neutral', text: x.c.feedback });
    ctx.answer({ trackingId: s2.trackingId, response: letter(i), result: 'neutral' });
    const first = !ans.chip;
    ans.chip = x.c.id;
    keep();
    if (first) { ctx.complete(); ctx.unlockNext({ focus: true }); }
  }));

  // coming back (revisit or resume): the earlier answers are shown again
  rows.forEach((x) => { const k = s1.choices.indexOf(ans[x.r.id]); if (k >= 0) press(x.toggles, x.toggles[k]); });
  if (ans.chip) press(chips.map((y) => y.btn), chips.find((y) => y.c.id === ans.chip)?.btn);
  if (ctx.revisit || ans.chip) { toStep2(false); const c = chips.find((y) => y.c.id === ans.chip); if (c) zones.setFeedback({ state: 'neutral', text: c.c.feedback }); ctx.unlockNext({ focus: false }); }
  else if (allAnswered()) ctx.unlockNext({ focus: false, onNext: () => toStep2(true) });
}

/* ---------- close (S22), editorial, two steps ---------- */
function close(ctx) {
  const { screen, ui, zones, content } = ctx;
  const s2 = screen.step2;
  const cards = screen.options.map((o, i) => h('button', { class: 'w-opt w-takeaway', type: 'button', 'aria-pressed': 'false', dataset: { id: o.id, letter: letter(i) } },
    icon(o.icon, { size: 28, className: 'w-takeaway-icon' }), h('span', { class: 'w-opt-label' }, o.label)));
  const step1 = h('div', { class: 'w-takeaways', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } }, cards);
  arrowNav(step1);
  const homework = newTabLink(ctx, resolveLink(content, s2.homework.href), ui.buttons.openHomework, 'homework');
  const download = h('button', { class: 'w-btn w-btn-ghost', type: 'button', dataset: { action: 'download' } }, icon('document', { size: 18 }), h('span', {}, ui.buttons.downloadRecord));
  const finish = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'finish' } }, ui.buttons.finishLesson);
  const line = (part) => h('p', { class: 'w-close-line' }, icon(part.icon, { size: 22 }), h('span', {}, part.text));
  const step2 = h('div', { class: 'w-close2', dataset: { interaction: '' }, hidden: true }, line(s2.bridge), line(s2.homework),
    h('div', { class: 'w-close-actions' }, homework, download, finish));
  editorial(ctx, zones.instruction, step1, step2, zones.band);
  zones.setFeedback({ state: 'hint', text: screen.hint });

  let confirm = false;
  function toStep2(focus) {
    step1.hidden = true;
    step2.hidden = false;
    ctx.lockNext(ui.footer.locked.last);
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (focus) homework.focus();
  }
  function done(focus) {
    finish.setAttribute('aria-disabled', 'true');
    zones.setFeedback({ state: 'neutral', text: ui.finished });
    ctx.lockNext(ui.footer.locked.last);
    if (focus) finish.focus();
  }
  cards.forEach((b, i) => b.addEventListener('click', () => {
    cards.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    zones.setFeedback({ state: 'neutral', text: screen.options[i].feedback });
    ctx.answer({ trackingId: screen.tracking[0].id, response: letter(i), result: 'neutral' });
    ctx.flags.set('take', screen.options[i].id);
    ctx.unlockNext({ focus: true, onNext: () => toStep2(true) });
  }));
  homework.addEventListener('click', () => ctx.flags.set('hw', 1));
  download.addEventListener('click', () => {
    const a = h('a', { href: URL.createObjectURL(new Blob([lessonRecord(ctx)], { type: 'text/html' })), download: ui.record.fileName, hidden: true });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    ctx.flags.set('dl', 1);
    zones.setFeedback({ state: 'neutral', text: s2.feedback.download });
  });
  finish.addEventListener('click', () => {
    if (ctx.finished()) return;
    if (!ctx.flags.get('dl') && !confirm) { confirm = true; zones.setFeedback({ state: 'notice', text: s2.feedback.finishConfirm }); return; }
    ctx.finishLesson();
    ctx.complete();
    done(true);
  });

  const took = ctx.flags.get('take');
  if (took) cards.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.id === took)));
  if (ctx.finished()) { toStep2(false); done(false); }
  else if (took) ctx.unlockNext({ focus: false, onNext: () => toStep2(true) });
}

// The downloadable lesson record (S22): a small self-contained HTML page with the case title, the
// metric, the self-check answers and the knowledge check score. Every label comes from ui.record.
function lessonRecord(ctx) {
  const { ui, content } = ctx;
  const r = ui.record;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const s20 = content.screens.find((s) => s.id === 'S20');
  const ans = ctx.flagsOf('S20').ans || {};
  const sc = ctx.score();
  const val = (v) => esc(v || r.empty);
  const rows = s20.steps[0].rows.map((q) => `<tr><td>${esc(q.text)}</td><td>${val(ans[q.id] && ui.buttons[ans[q.id]])}</td></tr>`).join('');
  const chip = s20.steps[1].chips.find((c) => c.id === ans.chip);
  const score = sc.raw === null ? r.empty : fmt(r.scoreLine, { x: sc.x, n: sc.n, p: sc.raw, pass: content.lesson.completion.passMark });
  return `<!DOCTYPE html><html lang="${esc(content.lesson.lang)}"><head><meta charset="UTF-8"><title>${esc(r.heading)}: ${esc(content.lesson.title)}</title>`
    + '<style>body{font:16px/1.5 Assistant,Arial,sans-serif;color:#000000;max-width:720px;margin:40px auto;padding:0 20px}h1,h2{color:#255777}'
    + 'td{padding:6px 12px 6px 0;vertical-align:top;border-bottom:1px solid #D8D8D8}table{border-collapse:collapse;width:100%}</style></head><body>'
    + `<h1>${esc(r.heading)}</h1><p>${esc(content.lesson.program)} · ${esc(content.lesson.module)} · ${esc(content.lesson.title)}</p>`
    + `<p>${esc(r.date)}: ${esc(new Date().toISOString().slice(0, 10))}</p>`
    + `<h2>${esc(r.caseTitle)}</h2><p>${val(ctx.store.get('L4_CASE_TITLE'))}</p>`
    + `<h2>${esc(r.metric)}</h2><p>${val(ctx.store.get('L4_METRIC'))}</p>`
    + `<h2>${esc(r.selfCheck)}</h2><table>${rows}<tr><td>${esc(r.risk)}</td><td>${val(chip && chip.label)}</td></tr></table>`
    + `<h2>${esc(r.score)}</h2><p>${esc(score)}</p></body></html>`;
}
