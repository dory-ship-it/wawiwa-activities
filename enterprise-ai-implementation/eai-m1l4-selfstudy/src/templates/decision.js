// Decision template (PRD sections 5 and 6), "Hybrid cinematic" look (NL1). Variants and their layouts:
//   single     (S01)  Stage: the character's quote on dark glass over the chapter photo (bottom left),
//                     the panel right: context line, the instruction as heading, three answer cards
//                     (radio marker), the feedback strip flush to the panel's foot. Click = answer; wrong
//                     = retry; Next unlocks only after the right one. Ghost hand: below the panel.
//                     S14 and S15 (a statement instead of a character): the same panel, Focus.
//   multi      (S03)  Focus: context line, heading, four answer cards 2 x 2 (rounded-square marker),
//                     the hint and Check under them (Check locked until two are picked), the strip.
//                     One strip per attempt: "One of two." (neutral) or "Not quite." with the first
//                     wrong card's line; both right = the closing line. Ghost hand: the left gutter.
//   Styled by analogy (no frame yet; interaction and text unchanged), each in a Focus panel:
//   challenge  (FT2 to FT4)  the memo's header, line and question, the instruction, three answer cards,
//                     Skip as the band's tool before an answer, the route buttons in the strip after.
//   NL2 (the Chapter 2 frames), each in a Focus panel:
//   pair       (S06)  one situation at a time in a raised figure card, the solved one as a small done card
//                     on the left; "Next situation" in the strip after a right answer.
//   rounds     (S08)  the rules band on top; left the round, the map line in a figure card, the hint;
//                     right the three rules; "Next round" in the strip after a right answer.
//   fill       (S10)  situation line, the field rows (a pre-filled row, the active row whose slot
//                     takes the chosen line), 2 x 2 answer cards.
//   metric     (S11)  the field row, four answers, then "Checkable later?" with three slots.
//   bounds     (S13)  a strip of the process steps, three Start / End cards in a row.
//   safety     (S18)  step 1 three answers; once right, step 2 in the same panel: the case title (from
//                     S02, 250 max), the privacy line, a checkbox and Save.
//   selfcheck  (S20)  two steps, all neutral: three question rows with Yes / Not yet toggles (Next
//                     opens step 2), then five chips, any one; "Reopen workbook" link.
//   close      (S22)  two steps: three takeaway cards (any one), then the bridge and homework lines with
//                     Open homework (new tab), Download my lesson record and Finish lesson.
// State is never colour alone: a check or cross mark with a label, the verdict word in the strip.
import { h, fmt, resolveLink } from '../util.js';
import { icon, glyph } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { letter } from '../tracking/index.js';
import { layout, sheet, contextLine, ruleLabel, arrowNav, privacyLine, paintAnswer, explainBand } from './stage.js';
import { field } from './input.js';
import { targetSteps } from '../ghost.js';

const isStage = (screen) => screen.variant === 'single' && screen.stage?.top?.kind === 'character';

export const decision = {
  // S01 (a character speaks) is a Stage screen; every other decision screen is Focus
  scene: (screen) => (isStage(screen) ? 'stage' : 'focus'),
  mount(ctx) {
    const variant = ctx.screen.variant;
    const run = { single, challenge, multi, pair, rounds, fill, metric, bounds, safety, selfcheck, close }[variant];
    if (!run) throw new Error('decision: unknown variant ' + variant);
    return run(ctx) || { unmount() {} };
  },
};

/* ---------- answer cards ---------- */
// kind: 'radio' (one answer: a round marker) or 'check' (select several: a rounded-square marker,
// aria-pressed). list: the options (default screen.options); cols: 1 (stacked), 2 (2 x 2) or 3 (a
// row); interaction: false when the group sits inside a larger interaction area.
function options(ctx, kind, { list = ctx.screen.options, cols = 1, labelledby = 'w-instruction', interaction = true } = {}) {
  const { content } = ctx;
  const group = h('div', { class: `w-options w-ans-list w-ans-cols-${cols}` + (kind === 'check' ? ' w-ans-multi' : ''), role: 'group', 'aria-labelledby': labelledby, dataset: interaction ? { interaction: '' } : {} });
  const btns = list.map((o, i) => {
    const btn = h('button', { class: 'w-opt w-ans', type: 'button', dataset: { id: o.id, letter: letter(i) }, 'aria-pressed': kind === 'check' ? 'false' : null },
      h('span', { class: 'w-opt-mark w-ans-mark' }), h('span', { class: 'w-opt-label' }, labelWithTerm(o, content.tooltips)));
    group.append(btn);
    // a term inside a button: no nested focusable; the definition goes on the button itself
    // (aria-describedby plus the tip on hover or focus); the term keeps its dotted underline
    if (o.term && content.tooltips[o.term]) attachTip(btn, content.tooltips[o.term]);
    return btn;
  });
  arrowNav(group); // keys as before NL1: Left / Up back, Right / Down on, whatever the visual grid
  return { group, btns };
}

function labelWithTerm(o, tooltips) {
  if (!o.term || !tooltips[o.term]) return o.label;
  const i = o.label.toLowerCase().indexOf(o.term.toLowerCase());
  if (i < 0) return o.label;
  return [o.label.slice(0, i), h('span', { class: 'w-term-static' }, o.label.slice(i, i + o.term.length)), o.label.slice(i + o.term.length)];
}

const paint = (btn, result, ui) => paintAnswer(btn, result, ui);
const lock = (btns) => btns.forEach((b) => b.setAttribute('aria-disabled', 'true'));

// the Check button of a select-several task: locked (grey, lock) until the selection is complete
export const checkButton = (ui, label, onclick) => h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'check' }, disabled: true, onclick },
  glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }), h('span', {}, label));

/* ---------- single (S01 on Stage; S14, S15 in Focus) ---------- */
function single(ctx) {
  const { screen, ui, zones, content } = ctx;
  const top = screen.stage.top;
  const { group, btns } = options(ctx, 'radio');
  if (isStage(screen)) {
    // the character's last line is the quote on the photo; the panel's context line is the content's
    // context (S01: in the third person), or else the character's lines before the quote
    const ch = content.characters[top.character];
    const bubbles = top.bubbles || [];
    const attribution = [top.label || ch.label, ch.fictional ? ui.fictionalBadge : null].filter(Boolean).join(' · ');
    layout(ctx, 'stage-decision',
      h('figure', { class: 'w-glass w-quote-glass' },
        glyph('g-quote', { size: 51.2 }),
        h('blockquote', { class: 'w-quote' }, h('p', { class: 'w-quote-1' }, bubbles[bubbles.length - 1] || '')),
        h('figcaption', { class: 'w-attrib' }, attribution)),
      h('section', { class: 'w-sheet w-sheet-right w-sheet-46' }, contextLine(top.context ?? bubbles.slice(0, -1).join(' ')), zones.instruction, group, zones.band));
  } else {
    // a statement line (S14, S15) whose optional highlight (the hours in S15) is set in bold inside it
    const k = top.highlight ? top.text.indexOf(top.highlight) : -1;
    const statement = k < 0 ? top.text : [top.text.slice(0, k), h('b', { class: 'w-figure' }, top.highlight), top.text.slice(k + top.highlight.length)];
    layout(ctx, 'focus',
      sheet('focus', top.eyebrow ? ruleLabel(top.eyebrow) : null, contextLine(top.text, statement), zones.instruction, group, zones.band));
  }
  // S01's frame shows no hint line: the hint stays for screen readers. S14 and S15 keep it visible.
  zones.setHintVisible(!isStage(screen));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  // the ghost hand (S01): it slides down the gutter and stops under the panel, never on an answer
  if (screen.ghost && !ctx.revisit) ctx.ghost({ type: screen.ghost.type, steps: () => targetSteps(zones.main, screen.ghost.target) });

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
    if (solved || i === chosen) return; // the same wrong card again is not a new attempt
    chosen = i;
    const o = screen.options[i];
    ctx.answer({ trackingId, response: letter(i), result: o.correct ? 'correct' : 'wrong' });
    if (o.correct) { ctx.complete(); solve(i, true); return; }
    show(i); // wrong: the chosen card turns red, the others stay operable for the retry
    zones.setFeedback({ state: 'wrong', text: o.feedback });
  }));

  if (ctx.revisit) solve(screen.options.findIndex((o) => o.correct), false);
}

/* ---------- challenge (FT2 to FT4), Focus by analogy ---------- */
function challenge(ctx) {
  const { screen, ui, zones } = ctx;
  const { group, btns } = options(ctx, 'radio', { cols: 3 });
  const trackingId = screen.tracking[0].id;
  const routing = screen.routing;
  const header = fmt(ui.memo.header, { n: ctx.chapter?.n ?? '' });
  let answered = false;

  const skip = h('button', { class: 'w-link', type: 'button', dataset: { action: screen.stage.bottom.link }, onclick: () => go(routing.skipped) }, ui.buttons[screen.stage.bottom.link]);

  layout(ctx, 'focus',
    sheet('focus w-sheet-memo',
      h('article', { class: 'w-memo', 'aria-label': header },
        h('p', { class: 'w-memo-head' }, header),
        h('p', { class: 'w-memo-line' }, screen.stage.top.text),
        h('p', { class: 'w-memo-q' }, screen.stage.middle.text)),
      zones.instruction,
      group,
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
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

/* ---------- multi (S03), Focus ---------- */
function multi(ctx) {
  const { screen, ui, zones } = ctx;
  const need = screen.select;
  const { group, btns } = options(ctx, 'check', { cols: 2 });
  const trackingId = screen.tracking[0].id;
  const keys = screen.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  const selected = new Set();
  let solved = false, marked = false;

  const check = checkButton(ui, ui.buttons[screen.stage.bottom.action], () => doCheck());
  // the ghost hand (it never selects or checks anything): the target the content names (S03: it
  // slides down the left gutter beside the cards)
  if (screen.ghost && !ctx.revisit) ctx.ghost({ type: screen.ghost.type, steps: () => targetSteps(zones.main, screen.ghost.target) });

  layout(ctx, 'focus', sheet('focus', contextLine(screen.stage.top.text), zones.instruction, group, zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  zones.setTool(check);

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

  function solve(focus) {
    solved = true;
    keys.forEach((i) => selected.add(i));
    btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(keys.includes(i))); paint(b, keys.includes(i) ? 'correct' : '', ui); });
    lock(btns);
    zones.setTool(); // Check is done
    // one closing line for the pair when the content has it (S03), else each key's line
    zones.setFeedback({ state: 'correct', text: screen.feedbackCorrect || keys.map((i) => screen.options[i].feedback).join(' ') });
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
    // One strip: the verdict for the attempt and the feedback of the first wrong card chosen;
    // "One of two." is the neutral strip (the frame), "Not quite." the wrong one.
    chosen.forEach((i) => paint(btns[i], screen.options[i].correct ? 'correct' : 'wrong', ui));
    const wrong = chosen.filter((i) => !screen.options[i].correct);
    wrong.forEach((i) => selected.delete(i));
    marked = true;
    update();
    const partial = rightCount === 1 && keys.length === 2;
    zones.setFeedback({ state: partial ? 'partial' : 'wrong', verdict: partial ? ui.feedback.oneOfTwo : ui.feedback.wrongPrefix, text: screen.options[wrong[0]].feedback });
    btns[wrong[0]].focus();
  }

  if (ctx.revisit) solve(false);
  else update();
}

/* ---------- one single-choice question on answer cards (S06 situations, S08 rounds, ...) ---------- */
// Wrong = the wrong mark on the card, retry; right = rows locked, onRight(focus). The same wrong
// card again is not a new attempt. feedbackOf / isRight read the option (or the round) as needed.
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

/* ---------- pair (S06): one situation at a time, Focus ---------- */
// The heading, the situation's hint line (bulb), then a raised figure card: "Situation n of 2", the
// situation, "Your answer" and two answer cards with a second line. After a right answer the strip
// offers "Next situation": the solved situation shrinks into a small done card on the left (its
// answer with a check) and the next one comes in (no motion with reduced motion).
function pair(ctx) {
  const { screen, ui, zones } = ctx;
  const list = screen.situations;
  const hintText = h('span', {});
  const row = h('div', { class: 'w-sit-row', dataset: { interaction: '' } });
  layout(ctx, 'focus', sheet('focus w-sheet-sit', zones.instruction,
    h('p', { class: 'w-hintline' }, glyph('guess', { size: 23.04 }), hintText), row, zones.band));
  zones.setHintVisible(false); // the hint is the line under the heading

  const doneCard = (s, o) => h('div', { class: 'w-sit-done', role: 'group', 'aria-label': s.doneLabel },
    h('span', { class: 'w-sit-kicker' }, s.doneLabel),
    h('span', { class: 'w-sit-done-answer' }, h('span', { class: 'w-placed-disc', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 15.36 })), o.label));
  function show(k, { focus = false, enter = false } = {}) {
    const s = list[k];
    const textId = 'w-situation-' + s.id;
    const btns = s.options.map((o, i) => h('button', { class: 'w-opt w-ans w-ans-two', type: 'button', dataset: { id: o.id, letter: letter(i) } },
      h('span', { class: 'w-opt-mark w-ans-mark' }),
      h('span', { class: 'w-opt-label' }, h('b', {}, o.label), h('span', {}, o.sub))));
    const group = h('div', { class: 'w-options w-ans-list w-ans-cols-2', role: 'group', 'aria-labelledby': textId }, btns);
    arrowNav(group);
    const card = h('section', { class: 'w-situation-now' + (enter ? ' w-sit-in' : '') },
      h('span', { class: 'w-sit-kicker' }, fmt(ui.progress.situation, { i: k + 1, n: list.length })),
      h('b', { class: 'w-sit-text', id: textId }, s.text),
      h('span', { class: 'w-sit-kicker' }, screen.answerLabel), group);
    row.replaceChildren(...list.slice(0, k).map((x) => doneCard(x, x.options.find((o) => o.correct))), card);
    hintText.textContent = s.hint;
    zones.setFeedback({ state: 'hint', text: s.hint });
    const q = rowQuestion(ctx, btns, s.options, {
      trackingId: () => s.trackingId,
      isRight: (o) => o.correct,
      feedbackOf: (o) => o.feedback,
      onRight: (i, f) => {
        const more = k < list.length - 1;
        const go = zones.setFeedback({ state: 'correct', text: s.options[i].feedback,
          actions: more ? [{ id: 'nextSituation', label: ui.buttons.nextSituation, onClick: () => show(k + 1, { focus: true, enter: true }) }] : [] });
        if (more) { if (f) go.focus(); return; }
        ctx.complete();
        ctx.unlockNext({ focus: f });
      },
    });
    if (focus) btns[0].focus();
    return { q, s };
  }

  if (ctx.revisit) { const last = show(list.length - 1); last.q.solve(last.s.options.findIndex((o) => o.correct), false); }
  else show(0);
}

/* ---------- rounds (S08): the rules band, then one map line per round, Focus ---------- */
// The explain band on top of the panel (the three AS-IS rules, numbered); left: the round counter, the
// instruction, the map line in a figure card with its field chip, the hint; right: the three rules
// as answers. "Next round" in the strip after a right answer, Next after round 3.
function rounds(ctx) {
  const { screen, ui, zones } = ctx;
  const list = screen.rounds;
  const badge = h('span', { class: 'w-field-chip' });
  const line = h('p', { class: 'w-round-line' });
  const counter = h('p', { class: 'w-round-count' });
  const { group, btns } = options(ctx, 'radio', { interaction: false });
  let r = 0;

  layout(ctx, 'focus',
    sheet('focus',
      explainBand(screen.rules),
      h('div', { class: 'w-rounds', dataset: { interaction: '' } },
        h('div', { class: 'w-round-left' }, counter, zones.instruction, h('div', { class: 'w-round-card' }, badge, line), h('p', { class: 'w-round-hint' }, screen.hint)),
        group),
      zones.band));
  zones.setHintVisible(false); // the hint is shown in the left column

  const q = rowQuestion(ctx, btns, screen.options, {
    trackingId: () => list[r].trackingId,
    isRight: (o) => o.id === list[r].correct,
    feedbackOf: (o) => list[r].feedback[o.id],
    onRight: (i, focus) => {
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
    line.textContent = '“' + list[k].line + '”'; // the map line as a quote (the frames' curly marks)
    counter.textContent = fmt(ui.progress.round, { i: k + 1, n: list.length });
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

/* ---------- fill (S10), Focus by analogy ---------- */
function fill(ctx) {
  const { screen, zones } = ctx;
  const { group, btns } = options(ctx, 'radio', { cols: 2, interaction: false });
  const slot = h('span', { class: 'w-field-slot', 'aria-live': 'polite' });
  const rows = screen.fieldRows.map((f) => h('div', { class: 'w-field-row', dataset: { state: f.prefilled ? 'prefilled' : 'active' } },
    h('span', { class: 'w-field-name' }, f.label), f.prefilled ? h('span', { class: 'w-field-value' }, f.value) : slot));
  layout(ctx, 'focus',
    sheet('focus',
      contextLine(screen.situation.text),
      zones.instruction,
      h('div', { class: 'w-fill', dataset: { interaction: '' } },
        h('div', { class: 'w-field-rows' }, rows),
        group),
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  oneQuestion(ctx, btns, { onChoose: (i, right) => { slot.textContent = screen.options[i].label; slot.dataset.result = right ? 'correct' : 'wrong'; } });
}

/* ---------- metric (S11), Focus by analogy ---------- */
function metric(ctx) {
  const { screen, ui, zones } = ctx;
  const { group, btns } = options(ctx, 'radio', { cols: 2, interaction: false });
  const slots = screen.slots.map((s) => {
    const state = h('span', { class: 'w-sr-only' });
    const el = h('li', { class: 'w-slot', dataset: { slot: s.id } }, h('span', { class: 'w-slot-mark', 'aria-hidden': 'true' }), h('span', { class: 'w-slot-label' }, s.label), state);
    return { s, el, state };
  });
  const setSlots = (o) => slots.forEach((x) => {
    const on = !!o.checks[x.s.id];
    x.el.dataset.on = String(on);
    x.el.querySelector('.w-slot-mark').replaceChildren(glyph(on ? 'g-check-b' : 'g-cross', { size: 16 }));
    x.state.textContent = ' ' + (on ? ui.slot.on : ui.slot.off);
  });
  // NL3: the explain band on top (S08's), so the field name moves beside the heading as its chip
  layout(ctx, 'focus',
    sheet('focus',
      screen.band ? [explainBand(screen.band), h('div', { class: 'w-head-row' }, zones.instruction, h('span', { class: 'w-field-chip w-head-chip' }, screen.field.label))]
        : [ruleLabel(screen.field.label), zones.instruction],
      h('div', { class: 'w-metric', dataset: { interaction: '' } },
        group,
        h('div', { class: 'w-slots', 'aria-live': 'polite' }, h('p', { class: 'w-slots-title' }, screen.slotsTitle), h('ul', {}, slots.map((x) => x.el)))),
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  oneQuestion(ctx, btns, { onChoose: (i) => setSlots(screen.options[i]) });
}

/* ---------- bounds (S13), Focus by analogy ---------- */
function bounds(ctx) {
  const { screen, zones } = ctx;
  const steps = screen.strip.split(', ');
  const strip = h('p', { class: 'w-steps-strip' }, steps.map((s, i) => [
    i ? [h('span', { class: 'w-sr-only' }, ', '), glyph('g-arrow', { size: 19.2, className: 'w-steps-arrow' })] : null,
    h('span', { class: 'w-step-chip' }, s)]));
  const btns = screen.options.map((o, i) => h('button', { class: 'w-opt w-ans w-opt-bounds', type: 'button', dataset: { id: o.id, letter: letter(i) } },
    h('span', { class: 'w-opt-mark w-ans-mark' }),
    h('span', { class: 'w-bound' }, glyph('start', { size: 23.04, className: 'w-bound-icon' }), h('span', {}, h('b', {}, screen.startLabel), ' ', o.start)),
    h('span', { class: 'w-bound w-bound-end' }, icon('finish', { size: 23.04, className: 'w-bound-icon' }), h('span', {}, h('b', {}, screen.endLabel), ' ', o.end))));
  const group = h('div', { class: 'w-options w-ans-list w-options-bounds', role: 'group', 'aria-labelledby': 'w-instruction' }, btns);
  arrowNav(group);
  layout(ctx, 'focus', sheet('focus', zones.instruction, h('div', { class: 'w-bounds', dataset: { interaction: '' } }, strip, group), zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  oneQuestion(ctx, btns);
}

// the panel of the R3 screens that had an image column (S18, S22): a Focus panel by analogy (the
// screen's own image waits for the media track; the chapter photo is the wash behind)
function editorial(ctx, ...parts) {
  layout(ctx, 'focus', sheet('focus', ...parts));
}
const newTabLink = (ctx, href, label, action, cls = 'w-btn w-btn-ghost') => h('a', { class: cls, href, target: '_blank', rel: 'noopener noreferrer', dataset: { action } },
  h('span', {}, label), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ctx.ui.newTabNote + ')'));

/* ---------- safety (S18), Focus by analogy, two steps ---------- */
function safety(ctx) {
  const { screen, ui, zones } = ctx;
  const s2 = screen.step2;
  const { group, btns } = options(ctx, 'radio');
  const privacy = privacyLine(s2.privacy);
  const announcer = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
  const ctl = field(s2.field, ctx, privacy.id, announcer);
  const box = h('input', { class: 'w-checkbox', type: 'checkbox', id: 'w-s18-box' });
  const boxLabel = h('label', { class: 'w-checkline', for: box.id }, box, h('span', {}, s2.checkbox));
  const save = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'save' } }, ui.buttons.save);
  const step2 = h('div', { class: 'w-form-task w-safety-form', dataset: { interaction: '' }, hidden: true }, ctl.el, announcer, privacy.el, h('div', { class: 'w-actionbar' }, boxLabel, save));
  editorial(ctx,
    contextLine(screen.stage.top.text),
    zones.instruction, group, step2, zones.band);
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const toStep2 = (focus) => { group.hidden = true; step2.hidden = false; if (focus) ctl.input.focus(); };
  const saved = (focus) => { zones.setFeedback({ state: 'neutral', tone: 'correct', text: s2.feedback.saved }); ctx.unlockNext({ focus }); };
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

/* ---------- selfcheck (S20), Focus by analogy, two steps, neutral ---------- */
function selfcheck(ctx) {
  const { screen, ui, zones, content } = ctx;
  const [s1, s2] = screen.steps;
  const ans = { ...(ctx.flags.get('ans') || {}) };
  const keep = () => ctx.flags.set('ans', { ...ans });
  const reopen = newTabLink(ctx, resolveLink(content, '@links.workbook'), ui.buttons[s1.link], 'reopen', 'w-link w-reopen');

  const rows = s1.rows.map((r) => {
    const qid = 'w-sc-' + r.id;
    const toggles = s1.choices.map((c) => h('button', { class: 'w-toggle', type: 'button', 'aria-pressed': 'false', dataset: { choice: c } }, ui.buttons[c]));
    const el = h('div', { class: 'w-check-row', dataset: { row: r.id } }, h('p', { class: 'w-check-q', id: qid }, r.text),
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
    h('p', { class: 'w-note-line' }, h('span', {}, s2.strip)));
  layout(ctx, 'focus', sheet('focus', h('div', { class: 'w-head-row' }, zones.instruction, reopen), step1, step2, zones.band));
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

/* ---------- close (S22), Focus by analogy, two steps ---------- */
function close(ctx) {
  const { screen, ui, zones, content } = ctx;
  const s2 = screen.step2;
  const cards = screen.options.map((o, i) => h('button', { class: 'w-opt w-ans w-takeaway', type: 'button', 'aria-pressed': 'false', dataset: { id: o.id, letter: letter(i) } },
    h('span', { class: 'w-opt-mark w-ans-mark' }), h('span', { class: 'w-opt-label' }, o.label)));
  const step1 = h('div', { class: 'w-takeaways', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } }, cards);
  arrowNav(step1);
  const homework = newTabLink(ctx, resolveLink(content, s2.homework.href), ui.buttons.openHomework, 'homework');
  const download = h('button', { class: 'w-btn w-btn-ghost', type: 'button', dataset: { action: 'download' } }, h('span', {}, ui.buttons.downloadRecord));
  const finish = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'finish' } }, ui.buttons.finishLesson);
  const line = (part) => h('p', { class: 'w-close-line' }, h('span', {}, part.text));
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
// Chapter 2 sketch, the metric, the self-check answers and the knowledge check score. Every label
// comes from ui.record (the sketch's part names from S08B).
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
  // the Chapter 2 sketch (S08B): one row per part
  const sketch = (content.screens.find((s) => s.id === 'S08B')?.fields || []).map((f) => `<tr><td>${esc(f.label)}</td><td>${val(ctx.store.get(f.store))}</td></tr>`).join('');
  const score = sc.raw === null ? r.empty : fmt(r.scoreLine, { x: sc.x, n: sc.n, p: sc.raw, pass: content.lesson.completion.passMark });
  return `<!DOCTYPE html><html lang="${esc(content.lesson.lang)}"><head><meta charset="UTF-8"><title>${esc(r.heading)}: ${esc(content.lesson.title)}</title>`
    + '<style>body{font:16px/1.5 Assistant,Arial,sans-serif;color:#16293A;max-width:720px;margin:40px auto;padding:0 20px}h1,h2{color:#255777}'
    + 'td{padding:6px 12px 6px 0;vertical-align:top;border-bottom:1px solid #E2DED6}table{border-collapse:collapse;width:100%}</style></head><body>'
    + `<h1>${esc(r.heading)}</h1><p>${esc(content.lesson.program)} · ${esc(content.lesson.module)} · ${esc(content.lesson.title)}</p>`
    + `<p>${esc(r.date)}: ${esc(new Date().toISOString().slice(0, 10))}</p>`
    + `<h2>${esc(r.caseTitle)}</h2><p>${val(ctx.store.get('L4_CASE_TITLE'))}</p>`
    + `<h2>${esc(r.sketch)}</h2><table>${sketch}</table>`
    + `<h2>${esc(r.metric)}</h2><p>${val(ctx.store.get('L4_METRIC'))}</p>`
    + `<h2>${esc(r.selfCheck)}</h2><table>${rows}<tr><td>${esc(r.risk)}</td><td>${val(chip && chip.label)}</td></tr></table>`
    + `<h2>${esc(r.score)}</h2><p>${esc(score)}</p></body></html>`;
}
