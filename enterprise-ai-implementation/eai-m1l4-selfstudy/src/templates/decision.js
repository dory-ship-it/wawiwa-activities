// Decision template (PRD sections 5 and 6), "Hybrid cinematic" look (NL1). Variants and their layouts:
//   single     (S01)  Stage: the character's quote on dark glass over the chapter photo (bottom left),
//                     the panel right: context line, the instruction as heading, three answer cards
//                     (radio marker), the feedback strip flush to the panel's foot. Click = answer; wrong
//                     = retry; Next unlocks only after the right one. Ghost hand: below the panel.
//                     NL3 S14 and S15 (a situation instead of a character; scene "stage"), by analogy:
//                     the case card on the photo, top left (a white figure card: the explain band, the
//                     eyebrow, the situation line, S14's handoff visual), the panel right (50%): the
//                     heading, the answers (four in 2 x 2), the hint, the strip.
//   multi      (S03)  Focus: context line, heading, four answer cards 2 x 2 (rounded-square marker),
//                     the hint and Check under them (Check locked until two are picked), the strip.
//                     One strip per attempt: "One of two." (neutral) or "Not quite." with the first
//                     wrong card's line; both right = the closing line. Ghost hand: the left gutter.
//   NL2 (the Chapter 2 frames), each in a Focus panel:
//   pair       (S06)  one situation at a time in a raised figure card, the solved one as a small done card
//                     on the left; "Next situation" in the strip after a right answer.
//   rounds     (S08)  the rules band on top; left the round, the map line in a figure card, the hint;
//                     right the three rules; "Next round" in the strip after a right answer.
//   fill       (S10)  situation line, the field rows (a pre-filled row, the active row whose slot
//                     takes the chosen line), 2 x 2 answer cards.
//   metric     (S11)  NL3: the explain band on top (three parts of a metric), the heading with the
//                     field chip, four answers, then "Checkable later?" with three slots.
//   NL4 (storyboard v3, Chapters 5-6):
//   S18 is a single on Stage (the case card on the chapter photo, as S14 and S15); the case title moved
//   to S18B (the input template).
//   selfcheck  (S20)  neutral: the context line, the heading with "Reopen workbook", the three questions as
//                     a checklist figure (each row's mark ticks on Yes, stays open on Not yet) with Yes /
//                     Not yet toggles; after all three, a fix line when any is Not yet; Next.
//   risk       (S20B) neutral, read then pick (S17's definitions): five answer cards, each its name and
//                     one-line definition; any one; the fix in the strip, the note line, "Reopen workbook".
//   FX2 D (fewer drags):
//   cases      (S17)  one case at a time ("Case 1 of 5"), the five mistakes as answer cards (S20B's look),
//                     two attempts per case, then the reveal; "Next case"; one matching interaction.
//   fields     (S18A) the workbook rows (S19 preview look), a select of the cards in each; Check after all,
//                     two attempts, then the reveal; one matching interaction.
//   close      (S22)  Stage: the bridge line on the case card over the chapter photo; the panel right, two
//                     steps: three takeaway cards (any one), then the homework line with Open homework
//                     (new tab), Download my lesson record and Finish lesson.
// State is never colour alone: a check or cross mark with a label, the verdict word in the strip.
import { h, fmt, resolveLink } from '../util.js?v=41429d1d';
import { glyph, icon } from '../icons.js?v=41429d1d';
import { attachTip } from '../tooltip.js?v=41429d1d';
import { letter } from '../tracking/index.js?v=41429d1d';
import { layout, sheet, contextLine, ruleLabel, arrowNav, privacyLine, paintAnswer, explainBand, buildUp, picture, progressDots } from './stage.js?v=41429d1d';
import { targetSteps } from '../ghost.js?v=41429d1d';

const isStage = (screen) => screen.variant === 'single' && screen.stage?.top?.kind === 'character';
const isCase = (screen) => screen.variant === 'single' && screen.scene === 'stage' && !isStage(screen);

export const decision = {
  // S01 (a character speaks), NL3's S14, S15 and NL4's S18 (a situation on a case card) and S22 (the
  // bridge line on the case card) are Stage screens; every other decision screen is Focus
  scene: (screen) => (isStage(screen) || screen.scene === 'stage' ? 'stage' : 'focus'),
  mount(ctx) {
    const variant = ctx.screen.variant;
    const run = { single, multi, pair, rounds, fill, metric, selfcheck, risk, cases, fields, close }[variant];
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
      h('span', { class: 'w-opt-mark w-ans-mark' }), h('span', { class: 'w-opt-label' }, labelWithTerm(o, content.tooltips),
        o.sub ? h('span', { class: 'w-opt-sub' }, o.sub) : null)); // NL4 S20B: the one-line definition under the name
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

/* ---------- FX1 B1: "Show me how" on every choice screen ---------- */
// The hand sweeps down over all the options with a small "Pick one" chip ("Pick two" on S03) and
// taps nothing. The first choice screen plays it once on arrival; later ones only after 8 s idle.
function choiceGhost(ctx, chip = ctx.ui.ghost.pickOne) {
  if (ctx.revisit) return null;
  const { screen, zones } = ctx;
  return ctx.ghost({ type: screen.ghost?.type || 'choice', chip, steps: () => targetSteps(zones.main, screen.ghost?.target || 'options-sweep') });
}
// the heading with its tools on the right (the field chip, "Show me how")
const headRow = (ctx, g, ...tools) => h('div', { class: 'w-head-row w-head-q' }, ctx.zones.instruction,
  h('span', { class: 'w-head-tools' }, tools, g ? g.button : null));

// FX1 B2: the strip after a right answer, or after the last wrong attempt (revealed: the right answer
// is marked and explained, in the neutral strip, so it never looks like the learner's own)
const rightStrip = (ctx, text, revealed, more = {}) => ctx.zones.setFeedback(revealed
  ? { state: 'neutral', verdict: ctx.ui.feedback.revealed, text, ...more }
  : { state: 'correct', text, ...more });

// the Check button of a select-several task: locked (grey, lock) until the selection is complete
export const checkButton = (ui, label, onclick) => h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'check' }, disabled: true, onclick },
  glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }), h('span', {}, label));

/* ---------- single (S01 on Stage; S14, S15 in Focus) ---------- */
function single(ctx) {
  const { screen, ui, zones, content } = ctx;
  const top = screen.stage.top;
  // four answers on a Stage panel sit 2 x 2 (S14), so the panel stays within 41cqw
  const { group, btns } = options(ctx, 'radio', { cols: isCase(screen) && screen.options.length === 4 ? 2 : 1 });
  // a statement line (S14, S15) whose optional highlight (the hours in S15) is set in bold inside it
  const k = top.highlight ? top.text.indexOf(top.highlight) : -1;
  const statement = k < 0 ? top.text : [top.text.slice(0, k), h('b', { class: 'w-figure' }, top.highlight), top.text.slice(k + top.highlight.length)];
  const g = choiceGhost(ctx);
  // FX1: on Stage the panel is at its height limit (41cqw), so "Show me how" and the attempt marker
  // sit on the card over the photo (S01: the quote's glass card; S14, S15: the case card), as at a
  // video stop; the panel keeps its heading, the answers and the strip
  const tools = () => h('div', { class: 'w-card-tools' }, g ? g.button : null, zones.attempts);
  if (isCase(screen) && screen.onePanel) {
    // FX3 (S18): one panel on the photo for the whole question: the situation line, the heading, the
    // answers, then the band (the hint, the attempt marker, "Show me how" as its tool, the feedback)
    layout(ctx, 'stage-decision',
      h('section', { class: 'w-sheet w-sheet-right w-sheet-50 w-sheet-one' }, contextLine(top.text, statement), zones.instruction, group, zones.band));
    if (g) zones.setTool(g.button);
  } else if (isCase(screen)) {
    const v = screen.visual;
    layout(ctx, 'stage-decision',
      h('figure', { class: 'w-case-card' },
        screen.band ? explainBand(screen.band) : null,
        top.eyebrow ? ruleLabel(top.eyebrow) : null,
        h('p', { class: 'w-case-line' }, statement),
        v ? h('div', { class: 'w-hv', role: 'img', 'aria-label': v.alt },
          h('span', { class: 'w-hv-box' }, v.from), glyph('g-arrow-long', { size: 38.4, className: 'w-hv-arrow' }),
          h('span', { class: 'w-hv-box w-hv-away' }, v.to, h('span', { class: 'w-hv-chip' }, v.away))) : null,
        tools()),
      h('section', { class: 'w-sheet w-sheet-right w-sheet-50' }, zones.instruction, group, zones.band));
  } else if (isStage(screen)) {
    // the character's last line is the quote on the photo; the panel's context line is the content's
    // context (S01: in the third person), or else the character's lines before the quote
    const ch = content.characters[top.character];
    const bubbles = top.bubbles || [];
    const attribution = [top.label || ch.label, ch.fictional ? ui.fictionalBadge : null].filter(Boolean).join(' · ');
    layout(ctx, 'stage-decision',
      h('figure', { class: 'w-glass w-quote-glass' },
        glyph('g-quote', { size: 51.2 }),
        h('blockquote', { class: 'w-quote' }, h('p', { class: 'w-quote-1' }, bubbles[bubbles.length - 1] || '')),
        h('figcaption', { class: 'w-attrib' }, attribution), tools()),
      h('section', { class: 'w-sheet w-sheet-right w-sheet-46' }, contextLine(top.context ?? bubbles.slice(0, -1).join(' ')), zones.instruction, group, zones.band));
  } else {
    layout(ctx, 'focus',
      sheet('focus', top.eyebrow ? ruleLabel(top.eyebrow) : null, contextLine(top.text, statement), headRow(ctx, g), group, zones.band));
  }
  // S01's frame shows no hint line: the hint stays for screen readers. S14 and S15 keep it visible.
  zones.setHintVisible(!isStage(screen));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  // one right answer; wrong = the chosen card turns red, the others stay operable for the next attempt
  oneQuestion(ctx, btns);
}

/* ---------- multi (S03), Focus ---------- */
function multi(ctx) {
  const { screen, ui, zones } = ctx;
  const need = screen.select;
  const { group, btns } = options(ctx, 'check', { cols: 2 });
  const trackingId = screen.tracking[0].id;
  const keys = screen.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  const selected = new Set();
  const max = ctx.revisit ? 0 : screen.attempts || 0;
  let solved = false, marked = false, tries = 0;

  const check = checkButton(ui, ui.buttons[screen.stage.bottom.action], () => doCheck());
  // the ghost hand (it never selects or checks anything): it sweeps over the cards with "Pick two"
  const g = choiceGhost(ctx, ui.ghost.pickTwo);

  // NL4 E2 (S03): the two video cases' stills as small thumbnails above the cards (the visual anchor)
  const thumbs = screen.cases ? h('div', { class: 'w-case-thumbs' }, screen.cases.map((c) => h('figure', { class: 'w-case-thumb' },
    picture(c.image, 'w-case-thumb-img'), h('figcaption', {}, c.label)))) : null;
  layout(ctx, 'focus', sheet('focus', contextLine(screen.stage.top.text), headRow(ctx, g), thumbs, group, zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  zones.setTool(check);
  if (max) zones.setAttempts(1, max);

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

  // revealed (FX1 B2): after the last wrong attempt the wrong picks keep their cross, the keys are marked
  function solve(focus, revealed = false, wrongPicks = []) {
    solved = true;
    keys.forEach((i) => selected.add(i));
    btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(keys.includes(i))); paint(b, keys.includes(i) ? 'correct' : wrongPicks.includes(i) ? 'wrong' : '', ui); });
    lock(btns);
    zones.setTool(); // Check is done
    // one closing line for the pair when the content has it (S03), else each key's line
    rightStrip(ctx, screen.feedbackCorrect || keys.map((i) => screen.options[i].feedback).join(' '), revealed);
    ctx.unlockNext({ focus });
  }

  function doCheck() {
    if (solved || selected.size !== need) return;
    const chosen = [...selected].sort((a, b) => a - b);
    const rightCount = chosen.filter((i) => keys.includes(i)).length;
    const right = rightCount === keys.length && chosen.length === keys.length;
    ctx.answer({ trackingId, response: chosen.map(letter).join(','), result: right ? 'correct' : 'wrong' });
    tries += 1;
    if (right) { ctx.complete(); solve(true); return; }
    if (max && tries >= max) { ctx.complete(); solve(true, true, chosen.filter((i) => !keys.includes(i))); return; }
    if (max) zones.setAttempts(tries + 1, max);
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
// Wrong = the wrong mark on the card, retry; right = rows locked, onRight(i, focus, revealed). The same
// wrong card again is not a new attempt. feedbackOf / isRight read the option (or the round) as needed.
// FX1 B2: with screen.attempts (2) the attempt marker counts the tries; after the last wrong one the
// right card is marked (the wrong one keeps its cross) and onRight runs with revealed = true. The
// first attempt is the one tracked (ctx.answer; later ones go out as retries).
function rowQuestion(ctx, btns, list, { trackingId, isRight, feedbackOf, onRight, onChoose = () => {} }) {
  const { ui, zones } = ctx;
  const max = ctx.revisit ? 0 : ctx.screen.attempts || 0;
  let solved = false, chosen = -1, tries = 0;
  const show = (i) => btns.forEach((b, j) => paint(b, j === i ? (isRight(list[i]) ? 'correct' : 'wrong') : '', ui));
  const solve = (i, focus) => { solved = true; chosen = i; show(i); lock(btns); onChoose(i, true); onRight(i, focus, false); };
  const reveal = (wrong) => {
    solved = true;
    const k = list.findIndex((o) => isRight(o));
    btns.forEach((b, j) => paint(b, j === k ? 'correct' : j === wrong ? 'wrong' : '', ui));
    lock(btns);
    onChoose(k, true);
    onRight(k, true, true);
  };
  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (solved || i === chosen) return;
    chosen = i;
    tries += 1;
    const right = isRight(list[i]);
    if (!right) onChoose(i, false);
    ctx.answer({ trackingId: trackingId(), response: letter(i), result: right ? 'correct' : 'wrong' });
    if (right) { solve(i, true); return; }
    if (max && tries >= max) { reveal(i); return; }
    show(i);
    if (max) zones.setAttempts(tries + 1, max);
    zones.setFeedback({ state: 'wrong', text: feedbackOf(list[i]) });
  }));
  if (max) zones.setAttempts(1, max);
  return {
    solve,
    reset() { solved = false; chosen = -1; tries = 0; if (max) zones.setAttempts(1, max); btns.forEach((b) => { paint(b, '', ui); b.removeAttribute('aria-disabled'); }); },
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
  layout(ctx, 'focus', sheet('focus w-sheet-sit', headRow(ctx, choiceGhost(ctx)),
    h('p', { class: 'w-hintline' }, glyph('guess', { size: 23.04 }), hintText), row, zones.band));
  zones.setHintVisible(false); // the hint is the line under the heading

  const doneCard = (s, o) => h('div', { class: 'w-sit-done', role: 'group', 'aria-label': s.doneLabel },
    h('span', { class: 'w-sit-kicker' }, s.doneLabel),
    h('span', { class: 'w-sit-done-answer' }, h('span', { class: 'w-placed-disc', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 15.36 })), o.label));
  // FX1 E4: a visual fork: the situation on top (its optional temp still beside it), a path drawn from
  // it that splits into two branches, one into each answer card; each answer card has a mini preview of
  // its format in HTML/CSS (option.preview: "table" = eight short rows; "lanes" = three lanes with a
  // diamond). The situation, the path and the answers build up on entry (none with reduced motion).
  const fork = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-sit-fork draw');
    svg.setAttribute('viewBox', '0 0 1000 40');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path d="M500 0V16H250V40"/><path d="M500 16H750V40"/>';
    return svg;
  };
  const preview = (kind) => (kind === 'lanes'
    ? h('span', { class: 'w-mini w-mini-lanes', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('b', { class: 'w-mini-dia' }))
    : h('span', { class: 'w-mini w-mini-table', 'aria-hidden': 'true' }, Array.from({ length: 8 }, () => h('i'))));
  function show(k, { focus = false, enter = false } = {}) {
    const s = list[k];
    const textId = 'w-situation-' + s.id;
    const btns = s.options.map((o, i) => h('button', { class: 'w-opt w-ans w-ans-two', type: 'button', dataset: { id: o.id, letter: letter(i) } },
      h('span', { class: 'w-opt-mark w-ans-mark' }), o.preview ? preview(o.preview) : null,
      h('span', { class: 'w-opt-label' }, h('b', {}, o.label), h('span', {}, o.sub))));
    const group = h('div', { class: 'w-options w-ans-list w-ans-cols-2', role: 'group', 'aria-labelledby': textId }, btns);
    arrowNav(group);
    const still = s.image?.src ? picture(s.image, 'w-sit-still') : null;
    const top = h('div', { class: 'w-sit-top' }, still, h('b', { class: 'w-sit-text', id: textId }, s.text));
    const path = fork();
    const card = h('section', { class: 'w-situation-now' + (enter ? ' w-sit-in' : '') },
      h('div', { class: 'w-sit-head' }, h('span', { class: 'w-sit-kicker' }, fmt(ui.progress.situation, { i: k + 1, n: list.length })), zones.attempts),
      top, path, group);
    row.replaceChildren(...list.slice(0, k).map((x) => doneCard(x, x.options.find((o) => o.correct))), card);
    if (!ctx.revisit && !k) buildUp([top, [path, 'in'], ...btns], { start: 150, step: 200 });
    hintText.textContent = s.hint;
    zones.setFeedback({ state: 'hint', text: s.hint });
    const q = rowQuestion(ctx, btns, s.options, {
      trackingId: () => s.trackingId,
      isRight: (o) => o.correct,
      feedbackOf: (o) => o.feedback,
      onRight: (i, f, revealed) => {
        const more = k < list.length - 1;
        const go = rightStrip(ctx, s.options[i].feedback, revealed,
          { actions: more ? [{ id: 'nextSituation', label: ui.buttons.nextSituation, onClick: () => show(k + 1, { focus: true, enter: true }) }] : [] });
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
// FX1 E6: less text. The three rules are three icon cards in a row at the top (the rule's short name
// from screen.rules, the option's full label for screen readers); they are the answers. The map line
// sits in a "map strip" below them (map icon, the field chip, the line). On an answer the broken
// rule's card lights up (teal ring) and the strip shows its one line. The hint and the attempt marker
// share the band's row.
function rounds(ctx) {
  const { screen, ui, zones } = ctx;
  const list = screen.rounds;
  const badge = h('span', { class: 'w-field-chip' });
  const line = h('p', { class: 'w-round-line' });
  const counter = h('p', { class: 'w-round-count' });
  const btns = screen.options.map((o, i) => h('button', { class: 'w-opt w-rule-card', type: 'button', dataset: { id: o.id, letter: letter(i) } },
    h('span', { class: 'w-rule-icon', 'aria-hidden': 'true' }, icon(o.icon, { size: 30.72 })),
    h('span', { class: 'w-rule-name', 'aria-hidden': 'true' }, screen.rules.items[i] || o.label), h('span', { class: 'w-sr-only' }, o.label),
    h('span', { class: 'w-opt-mark w-rule-mark' })));
  const group = h('div', { class: 'w-options w-rule-cards', role: 'group', 'aria-labelledby': 'w-instruction' }, btns);
  arrowNav(group);
  let r = 0;

  layout(ctx, 'focus',
    sheet('focus',
      h('div', { class: 'w-round-top' }, counter, choiceGhost(ctx)?.button),
      zones.instruction,
      h('div', { class: 'w-rounds', dataset: { interaction: '' } },
        group,
        h('figure', { class: 'w-map-strip' }, h('span', { class: 'w-map-strip-icon', 'aria-hidden': 'true' }, glyph('overview', { size: 28.16 })),
          h('div', { class: 'w-map-strip-body' }, badge, line))),
      zones.band));
  zones.setHintVisible(true); // the hint on the band's row, beside the attempt marker
  const light = (i) => btns.forEach((b, j) => { b.dataset.lit = String(j === i); });

  const q = rowQuestion(ctx, btns, screen.options, {
    trackingId: () => list[r].trackingId,
    isRight: (o) => o.id === list[r].correct,
    feedbackOf: (o) => list[r].feedback[o.id],
    onRight: (i, focus, revealed) => {
      const fb = list[r].feedback[screen.options[i].id];
      light(i);
      if (r < list.length - 1) {
        const go = rightStrip(ctx, fb, revealed, { actions: [{ id: 'nextRound', label: ui.buttons.nextRound, onClick: () => { show(r + 1); btns[0].focus(); } }] });
        if (focus) go.focus();
        return;
      }
      rightStrip(ctx, fb, revealed);
      ctx.complete();
      ctx.unlockNext({ focus });
    },
  });

  function show(k) {
    r = k;
    badge.textContent = list[k].badge;
    line.textContent = '“' + list[k].line + '”'; // the map line as a quote (the frames' curly marks)
    counter.textContent = fmt(ui.progress.round, { i: k + 1, n: list.length });
    light(-1);
    q.reset();
    zones.setFeedback({ state: 'hint', text: screen.hint });
  }

  show(0);
  if (ctx.revisit) { show(list.length - 1); q.solve(screen.options.findIndex((o) => o.id === list[r].correct), false); }
}

// One right answer on screen.options, Next after it (single, fill, metric).
function oneQuestion(ctx, btns, { onChoose } = {}) {
  const { screen } = ctx;
  const q = rowQuestion(ctx, btns, screen.options, {
    trackingId: () => screen.tracking[0].id,
    isRight: (o) => o.correct,
    feedbackOf: (o) => o.feedback,
    onChoose,
    onRight: (i, focus, revealed) => { rightStrip(ctx, screen.options[i].feedback, revealed); ctx.complete(); ctx.unlockNext({ focus }); },
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
      headRow(ctx, choiceGhost(ctx)),
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
  const g = choiceGhost(ctx);
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
      // (PP1: a variant's case line, when it has one, above the band)
      screen.context ? contextLine(screen.context) : null,
      // (S11: the heading on one line with the field chip and "Show me how" on its right; the row keeps
      // NL3's tighter margins, so the panel stays within 41cqw)
      screen.band ? [explainBand(screen.band), h('div', { class: 'w-head-row w-head-metric' }, zones.instruction, h('span', { class: 'w-head-tools' }, h('span', { class: 'w-field-chip w-head-chip' }, screen.field.label), g ? g.button : null))]
        : [ruleLabel(screen.field.label), headRow(ctx, g)],
      h('div', { class: 'w-metric', dataset: { interaction: '' } },
        group,
        h('div', { class: 'w-slots', 'aria-live': 'polite' }, h('p', { class: 'w-slots-title' }, screen.slotsTitle), h('ul', {}, slots.map((x) => x.el)))),
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });
  oneQuestion(ctx, btns, { onChoose: (i) => setSlots(screen.options[i]) });
}

const newTabLink = (ctx, href, label, action, cls = 'w-btn w-btn-ghost') => h('a', { class: cls, href, target: '_blank', rel: 'noopener noreferrer', dataset: { action } },
  h('span', {}, label), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ctx.ui.newTabNote + ')'));

/* ---------- selfcheck (S20), Focus by analogy, neutral: the three questions as a checklist ---------- */
// Each row: its mark (the checklist box: the row's icon while open or Not yet, a teal check on Yes),
// the question, Yes / Not yet. Every click answers (the first per row tracked, later ones retries).
// After all three, the fix line shows while any row is Not yet; Next unlocks (the screen is done).
function selfcheck(ctx) {
  const { screen, ui, zones, content } = ctx;
  const ans = { ...(ctx.flags.get('ans') || {}) };
  const keep = () => ctx.flags.set('ans', { ...ans });
  const reopen = newTabLink(ctx, resolveLink(content, '@links.workbook'), ui.buttons[screen.link], 'reopen', 'w-link w-reopen');

  const rows = screen.rows.map((r) => {
    const qid = 'w-sc-' + r.id;
    const toggles = screen.choices.map((c) => h('button', { class: 'w-toggle', type: 'button', 'aria-pressed': 'false', dataset: { choice: c } }, ui.buttons[c]));
    const mark = h('span', { class: 'w-check-mark', 'aria-hidden': 'true' });
    const el = h('li', { class: 'w-check-row', dataset: { row: r.id } }, mark, h('p', { class: 'w-check-q', id: qid }, r.text),
      h('div', { class: 'w-toggles', role: 'group', 'aria-labelledby': qid }, toggles));
    return { r, el, toggles, mark };
  });
  const fix = h('p', { class: 'w-fix-line', hidden: true }, icon('wrench', { size: 19.2 }), h('span', {}, screen.fixLine));
  const list = h('ol', { class: 'w-selfcheck w-checklist', dataset: { interaction: '' } }, rows.map((x) => x.el));
  layout(ctx, 'focus', sheet('focus', contextLine(screen.stage?.top?.text), h('div', { class: 'w-head-row' }, zones.instruction, reopen), list, fix, zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const allAnswered = () => screen.rows.every((r) => ans[r.id]);
  const paintRow = (x) => {
    const c = ans[x.r.id];
    x.toggles.forEach((b, i) => b.setAttribute('aria-pressed', String(screen.choices[i] === c)));
    x.el.dataset.answer = c || '';
    x.mark.replaceChildren(c === 'yes' ? glyph('g-check-b', { size: 17.92 }) : icon(x.r.icon, { size: 19.2 }));
  };
  const showFix = () => { fix.hidden = !(allAnswered() && screen.rows.some((r) => ans[r.id] === 'notYet')); };
  rows.forEach((x) => x.toggles.forEach((t, i) => t.addEventListener('click', () => {
    const c = screen.choices[i];
    zones.setFeedback({ state: 'neutral', text: x.r.feedback[c] });
    ctx.answer({ trackingId: x.r.trackingId, response: letter(i), result: 'neutral' });
    const was = allAnswered();
    ans[x.r.id] = c;
    keep();
    paintRow(x);
    showFix();
    if (!was && allAnswered()) { ctx.complete(); ctx.unlockNext({ focus: true }); }
  })));

  // coming back (revisit or resume): the earlier answers are shown again
  rows.forEach(paintRow);
  showFix();
  if (ctx.revisit || allAnswered()) ctx.unlockNext({ focus: false });
}

/* ---------- risk (S20B), Focus by analogy: read the five mistakes, pick one, neutral ---------- */
function risk(ctx) {
  const { screen, ui, zones, content } = ctx;
  const { group, btns } = options(ctx, 'radio', { cols: 2 });
  group.classList.add('w-risk');
  const reopen = newTabLink(ctx, resolveLink(content, '@links.workbook'), ui.buttons[screen.link], 'reopen', 'w-link w-reopen');
  const g = choiceGhost(ctx);
  // the note line with "Reopen workbook" on its right (the heading keeps one line)
  const note = h('div', { class: 'w-risk-note' }, h('p', { class: 'w-note-line' }, h('span', {}, screen.strip)), reopen);
  layout(ctx, 'focus', sheet('focus', headRow(ctx, g), h('p', { class: 'w-subline' }, screen.hint), group, note, zones.band));
  zones.setHintVisible(false); // the hint is the line under the heading
  zones.setFeedback({ state: 'hint', text: screen.hint });
  const press = (k) => btns.forEach((b, j) => { b.setAttribute('aria-pressed', String(j === k)); paint(b, '', ui); });
  btns.forEach((b, i) => b.addEventListener('click', () => {
    const o = screen.options[i];
    press(i);
    zones.setFeedback({ state: 'neutral', text: o.feedback });
    ctx.answer({ trackingId: screen.tracking[0].id, response: letter(i), result: 'neutral' });
    const first = !ctx.flags.get('pick');
    ctx.flags.set('pick', o.id);
    if (first) { ctx.complete(); ctx.unlockNext({ focus: true }); }
  }));
  const took = screen.options.findIndex((o) => o.id === ctx.flags.get('pick'));
  if (took >= 0) { press(took); zones.setFeedback({ state: 'neutral', text: screen.options[took].feedback }); ctx.unlockNext({ focus: false }); }
  else if (ctx.revisit) ctx.unlockNext({ focus: false });
}

/* ---------- cases (S17, FX2 D1): one case at a time, pick the mistake it shows ---------- */
// The heading with "Show me how" (the choice sweep), the case card ("Case 1 of 5", its dots, the case),
// the five mistakes as answer cards (name and one-line definition, as S20B). Two attempts per case:
// wrong = the cross and the case's line; the second wrong = the right card marked and explained
// (revealed). "Next case" in the strip; Next unlocks after the last case.
// Tracking: the one matching interaction of the old sort (same id, same pattern): when the last case
// is done, its response is each case's FIRST pick ("a.3,b.1,..."), correct only if every first pick
// was right; when any case took a second pick, one retry follows with the final picks.
function cases(ctx) {
  const { screen, ui, zones } = ctx;
  const list = screen.cards;
  const trackingId = screen.tracking[0].id;
  const max = screen.attempts || 2;
  const { group, btns } = options(ctx, 'radio', { list: screen.options, cols: 3 }); // two rows: the panel stays within 41cqw
  group.classList.add('w-risk');
  const kicker = h('p', { class: 'w-sit-kicker' });
  const dots = progressDots(list.length, (i, n) => fmt(ui.progress.caseOf, { i, n }));
  const text = h('p', { class: 'w-case-now-text' });
  const card = h('div', { class: 'w-case-now' }, h('div', { class: 'w-sit-head' }, kicker, dots.el), text);
  layout(ctx, 'focus', sheet('focus w-sheet-cases', headRow(ctx, choiceGhost(ctx)), card, group, zones.band));
  zones.setHintVisible(true);
  const first = {}, last = {};
  let r = 0, tries = 0, solved = false, chosen = -1;
  const show = (k) => {
    r = k; tries = 0; solved = false; chosen = -1;
    kicker.textContent = fmt(ui.progress.caseOf, { i: k + 1, n: list.length });
    dots.set(k, k);
    text.textContent = list[k].text;
    btns.forEach((b) => { paint(b, '', ui); b.removeAttribute('aria-disabled'); });
    zones.setAttempts(1, max);
    zones.setFeedback({ state: 'hint', text: screen.hint });
  };
  const right = (k) => screen.options.findIndex((o) => o.id === list[k].column);
  function done(k, i, revealed, focus) {
    solved = true;
    lock(btns);
    const c = list[k];
    if (k < list.length - 1) {
      const go = rightStrip(ctx, c.feedback.correct, revealed, { actions: [{ id: 'nextCase', label: ui.buttons.nextCase, onClick: () => { show(k + 1); btns[0].focus(); } }] });
      if (focus) go.focus();
      return;
    }
    dots.set(list.length, list.length);
    rightStrip(ctx, c.feedback.correct, revealed);
    // the interaction, once, when the last case is done (a revisit sends nothing)
    if (!ctx.revisit) {
      const key = (x) => String(x.id ?? x.n);
      ctx.answer({ trackingId, response: list.map((x) => `${key(x)}.${first[key(x)]}`).join(','), result: list.every((x) => first[key(x)] === x.column) ? 'correct' : 'wrong' });
      if (list.some((x) => last[key(x)] !== first[key(x)])) {
        ctx.answer({ trackingId, response: list.map((x) => `${key(x)}.${last[key(x)]}`).join(','), result: list.every((x) => last[key(x)] === x.column) ? 'correct' : 'wrong' });
      }
    }
    ctx.complete();
    ctx.unlockNext({ focus });
  }
  btns.forEach((b, i) => b.addEventListener('click', () => {
    if (solved || i === chosen) return;
    chosen = i;
    tries += 1;
    const c = list[r], key = String(c.id ?? c.n), pick = screen.options[i].id;
    if (!(key in first)) first[key] = pick;
    last[key] = pick;
    if (pick === c.column) { btns.forEach((x, j) => paint(x, j === i ? 'correct' : '', ui)); done(r, i, false, true); return; }
    if (tries >= max) {
      const k = right(r);
      btns.forEach((x, j) => paint(x, j === k ? 'correct' : j === i ? 'wrong' : '', ui));
      done(r, k, true, true);
      return;
    }
    btns.forEach((x, j) => paint(x, j === i ? 'wrong' : '', ui));
    zones.setAttempts(tries + 1, max);
    zones.setFeedback({ state: 'wrong', text: c.feedback.wrong });
  }));
  show(0);
  if (ctx.revisit) { show(list.length - 1); const k = right(r); paint(btns[k], 'correct', ui); zones.setAttempts(null); done(r, k, false, false); }
}

/* ---------- fields (S18A, FX2 D2): the workbook rows, a card chosen for each ---------- */
// The heading with the case chip, the hint line, the four cards lettered A to D (FX3), then the workbook rows (the S19 preview's look): the
// field's number, its name and line, and a select listing the cards. Check unlocks when every row has a
// card ("check after all"): right rows get the teal border and check, wrong ones the cross and the
// first wrong row's line in the strip; attempt 2 the same; after it the right cards are set in the
// rows still wrong (shown), and Next unlocks.
// Tracking: the matching interaction of the old sort (same id, same pattern "card.field"): each card's
// field = the row it was chosen in (the first such row; none = empty). First Check = the answer, the
// second = a retry.
function fields(ctx) {
  const { screen, ui, zones } = ctx;
  const cardsList = screen.cards;
  const trackingId = screen.tracking[0].id;
  const max = ctx.revisit ? 0 : screen.attempts || 2;
  const key = (c) => String(c.id ?? c.n);
  let tries = 0, done = false;
  // FX3: the four cards as a visible lettered list (A to D, the S21 letter badges) above the rows; each
  // select lists the same letter and text (the value stays the card's key, so tracking is unchanged)
  const L = (i) => letter(i).toUpperCase();
  const cardList = h('ol', { class: 'w-card-list' }, cardsList.map((c, i) => h('li', { class: 'w-card-item' },
    h('span', { class: 'w-kc-letter', 'aria-hidden': 'true' }, L(i)), h('span', {}, h('span', { class: 'w-sr-only' }, L(i) + ' '), c.text))));
  const rows = screen.columns.map((col) => {
    const sel = h('select', { class: 'w-field-select', dataset: { row: col.id }, 'aria-label': col.label + ': ' + col.sub },
      h('option', { value: '' }, ui.chooseCard), cardsList.map((c, i) => h('option', { value: key(c) }, `${L(i)}. ${c.text}`)));
    const mark = h('span', { class: 'w-opt-mark w-row-mark', 'aria-hidden': 'true' });
    const state = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const el = h('li', { class: 'w-wb-field', dataset: { row: col.id } },
      h('b', { class: 'w-wb-n', 'aria-hidden': 'true' }, col.n ? String(col.n) : glyph('g-cross', { size: 14.08 })), // "Not AS-IS": no field number
      h('span', { class: 'w-wb-name' }, h('span', { class: 'w-wb-label' }, col.label), h('span', { class: 'w-wb-sub' }, col.sub)),
      sel, mark, state);
    return { col, sel, el, mark, state };
  });
  const check = checkButton(ui, ui.buttons.check, () => doCheck());
  const head = h('div', { class: 'w-head-row w-head-q' }, zones.instruction, h('span', { class: 'w-head-tools' }, screen.header ? h('span', { class: 'w-field-chip' }, screen.header) : null));
  // (the list in a column left of the rows, read first: above them the panel ran past its 41cqw limit)
  layout(ctx, 'focus', sheet('focus w-sheet-fields', head, h('div', { class: 'w-fields-grid' }, cardList,
    h('ol', { class: 'w-wb-fields', dataset: { interaction: '' } }, rows.map((x) => x.el))), zones.band));
  zones.setHintVisible(true); // the hint on the band's row, beside the attempt marker and Check
  zones.setFeedback({ state: 'hint', text: screen.hint });
  if (!ctx.revisit) { zones.setTool(check); zones.setAttempts(1, max); }
  const ready = () => { check.disabled = done || rows.some((x) => !x.sel.value); };
  const setRow = (x, res) => {
    x.el.dataset.result = res;
    paintAnswer(x.el, res, ui);
    x.state.textContent = res === 'correct' ? ui.feedback.correctPrefix : res === 'wrong' ? ui.feedback.wrongPrefix : '';
  };
  rows.forEach((x) => x.sel.addEventListener('change', () => { if (x.el.dataset.result === 'wrong') setRow(x, ''); ready(); }));
  const cardOf = (x) => cardsList.find((c) => key(c) === x.sel.value);
  const response = () => cardsList.map((c) => `${key(c)}.${rows.find((x) => x.sel.value === key(c))?.col.id || ''}`).join(',');
  function doCheck() {
    if (done || rows.some((x) => !x.sel.value)) return;
    tries += 1;
    const wrong = rows.filter((x) => cardOf(x)?.column !== x.col.id);
    rows.forEach((x) => setRow(x, wrong.includes(x) ? 'wrong' : 'correct'));
    ctx.answer({ trackingId, response: response(), result: wrong.length ? 'wrong' : 'correct' });
    if (!wrong.length) { zones.setFeedback({ state: 'correct', text: ui.feedback.allPlaced }); finish(true); return; }
    // the line of the card that belongs in the first wrong row
    const owner = (x) => cardsList.find((c) => c.column === x.col.id);
    if (tries >= max) {
      wrong.forEach((x) => { x.sel.value = key(owner(x)); setRow(x, 'correct'); x.el.dataset.shown = 'true'; });
      zones.setFeedback({ state: 'neutral', verdict: ui.feedback.revealedPlaces, text: owner(wrong[0]).feedback.correct });
      finish(true);
      return;
    }
    zones.setAttempts(tries + 1, max);
    zones.setFeedback({ state: 'wrong', text: owner(wrong[0]).feedback.wrong });
    check.disabled = true; // a changed row unlocks it again
    wrong[0].sel.focus();
  }
  function finish(focus) {
    done = true;
    rows.forEach((x) => { x.sel.disabled = true; });
    zones.setTool();
    zones.setAttempts(null);
    ctx.complete();
    ctx.unlockNext({ focus });
  }
  if (ctx.revisit) {
    rows.forEach((x) => { x.sel.value = key(cardsList.find((c) => c.column === x.col.id)); setRow(x, 'correct'); });
    zones.setFeedback({ state: 'correct', text: ui.feedback.allPlaced });
    finish(false);
  }
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
  const step2 = h('div', { class: 'w-close2', dataset: { interaction: '' }, hidden: true }, line(s2.homework),
    h('div', { class: 'w-close-actions' }, homework, download, finish));
  // NL4: Stage. The bridge line on the case card over the chapter photo (the visual anchor, shown from
  // the start); the panel right holds the two steps
  layout(ctx, 'stage-decision',
    h('figure', { class: 'w-case-card w-bridge-card' }, h('p', { class: 'w-bridge' }, icon(s2.bridge.icon, { size: 30.72 }), h('span', { class: 'w-case-line' }, s2.bridge.text))),
    h('section', { class: 'w-sheet w-sheet-right w-sheet-50 w-close-panel' }, zones.instruction, step1, step2, zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  let confirm = false;
  // FX2 G: Next stays locked until Finish lesson, then opens the closing screen (END)
  function toStep2(focus) {
    step1.hidden = true;
    step2.hidden = false;
    ctx.lockNext(ui.footer.locked.finish);
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (focus) homework.focus();
  }
  function done(focus) {
    finish.setAttribute('aria-disabled', 'true');
    zones.setFeedback({ state: 'neutral', text: ui.finished });
    ctx.unlockNext({ focus });
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
    ctx.next(); // QA1: one action finishes the lesson and opens the closing screen (END)
  });

  const took = ctx.flags.get('take');
  if (took) cards.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.id === took)));
  if (ctx.finished()) { toStep2(false); done(false); }
  else if (took) {
    // QA1: back on the screen, the takeaway shows as picked with its line
    zones.setFeedback({ state: 'neutral', text: screen.options.find((o) => o.id === took).feedback });
    ctx.unlockNext({ focus: false, onNext: () => toStep2(true) });
  }
}

// The downloadable lesson record (S22): a small self-contained HTML page with the case title, the
// Chapter 2 sketch, the Chapter 4 notes (could fit AI / stays with a person), the first metric (S12B:
// baseline, target, date; NL4), the self-check answers (S20) and the biggest risk (S20B), the S22
// takeaway, and the knowledge check score with its attempt number (NL4). Every label comes from ui.record (the parts'
// names from the screens' fields).
function lessonRecord(ctx) {
  const { ui, content } = ctx;
  const r = ui.record;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const s20 = content.screens.find((s) => s.id === 'S20');
  const s20b = content.screens.find((s) => s.id === 'S20B');
  const ans = ctx.flagsOf('S20').ans || {};
  const sc = ctx.score();
  const val = (v) => esc(v || r.empty);
  const rows = s20.rows.map((q) => `<tr><td>${esc(q.text)}</td><td>${val(ans[q.id] && ui.buttons[ans[q.id]])}</td></tr>`).join('');
  const chip = s20b.options.find((c) => c.id === ctx.flagsOf('S20B').pick);
  // the takeaway picked on S22 (QA 26 Oct 2026)
  const take = ctx.screen.options.find((o) => o.id === ctx.flags.get('take'));
  // one row per part of a screen's fields (the S08B sketch, the S17B notes, the S12B metric)
  const rowsOf = (id) => (content.screens.find((s) => s.id === id)?.fields || []).map((f) => `<tr><td>${esc(f.label)}</td><td>${val(ctx.store.get(f.store))}</td></tr>`).join('');
  const sketch = rowsOf('S08B');
  const notes = rowsOf('S17B');
  const metric = rowsOf('S12B');
  const score = sc.raw === null ? r.empty : fmt(r.scoreLine, { x: sc.x, n: sc.n, p: sc.raw, a: ctx.attempt(), pass: content.lesson.completion.passMark });
  // the check item by item (QA1): S21R's short name for each item (stemB on a version b retake) and its
  // first answer in this attempt
  const vb = ctx.checkVersion() === 'b';
  const s21r = content.screens.find((s) => s.id === 'S21R');
  const items = sc.raw === null ? '' : content.screens.find((s) => s.id === 'S21').items.map((it) => {
    const m = s21r.missed.find((x) => x.item === it.id);
    const res = ctx.firstAnswer(vb && it.b ? it.b.trackingId : it.trackingId)?.result;
    return `<tr><td>${esc(vb && m.stemB ? m.stemB : m.stem)}</td><td>${esc(res === 'correct' ? r.itemRight : res ? r.itemMissed : r.empty)}</td></tr>`;
  }).join('');
  return `<!DOCTYPE html><html lang="${esc(content.lesson.lang)}"><head><meta charset="UTF-8"><title>${esc(r.heading)}: ${esc(content.lesson.title)}</title>`
    + '<style>body{font:16px/1.5 Assistant,Arial,sans-serif;color:#16293A;max-width:720px;margin:40px auto;padding:0 20px}h1,h2{color:#255777}'
    + 'td{padding:6px 12px 6px 0;vertical-align:top;border-bottom:1px solid #E2DED6}table{border-collapse:collapse;width:100%}</style></head><body>'
    + `<h1>${esc(r.heading)}</h1><p>${esc(content.lesson.program)} · ${esc(content.lesson.module)} · ${esc(content.lesson.title)}</p>`
    + `<p>${esc(r.date)}: ${esc(new Date().toISOString().slice(0, 10))}</p>`
    + `<h2>${esc(r.caseTitle)}</h2><p>${val(ctx.store.get('L4_CASE_TITLE'))}</p>`
    + `<h2>${esc(r.sketch)}</h2><table>${sketch}</table>`
    + `<h2>${esc(r.notes)}</h2><table>${notes}</table>`
    + `<h2>${esc(r.metric)}</h2><table>${metric}</table>`
    + `<h2>${esc(r.selfCheck)}</h2><table>${rows}<tr><td>${esc(r.risk)}</td><td>${val(chip && chip.label)}</td></tr></table>`
    + `<h2>${esc(r.takeaway)}</h2><p>${val(take && take.label)}</p>`
    + `<h2>${esc(r.score)}</h2><p>${esc(score)}</p>${items ? `<table>${items}</table>` : ''}</body></html>`;
}
