// Word counts by the storyboard rule, shared by tools/check.mjs (the build check) and the review
// mode (src/review/toolbar.js, review.html), so both always show the same numbers.
//   on-screen words per screen view at most 45; every hint, feedback line and pause marker at most 25;
//   the instruction line (h1), buttons and the memo's header label are excluded.
// Pure functions over the content JSON: no DOM, no Node.
export const MAX_SCREEN_WORDS = 45, MAX_FEEDBACK_WORDS = 25;

export const words = (s) => String(s ?? '').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
const sum = (list) => list.reduce((n, t) => n + words(t), 0);

// on-screen text of one stage (top / middle / bottom), whatever the kind
const stageText = (stage = {}) => Object.values(stage).flatMap((p) => [p.eyebrow, p.text, p.label, p.context, p.chip?.text, p.help?.text, ...(p.bubbles || []), ...(p.items || []).map((x) => x.text)]);
const fieldText = (fields = []) => fields.flatMap((f) => [f.label, f.placeholder]);
// an explain band (NL3): its label and items, or its one term and definition
const bandText = (b) => (!b ? [] : b.items ? [b.label, ...b.items.flatMap((x) => (typeof x === 'object' ? [x.term, x.text] : [x]))] : [b.term, b.text]);

// One entry per view the learner sees at once on screen s: [name, strings on screen]
export function screenViews(s, content) {
  if (s.template === 'video') return [[s.id, [s.title, s.guidingQuestion]], ...(s.stops || []).map((st) => [`${s.id} ${st.id}`, [st.question, ...st.options.map((o) => o.label)]])];
  if (s.template === 'handoff') {
    // NL4 S19 (document view): the brief, the workbook preview's eight field names, the four copy cards
    // (their names, part names and field chips; the learner's own text not counted), the return line
    const partText = (c) => [c.label, c.chip, ...(content.screens.find((x) => x.id === c.from)?.fields || []).map((f) => f.label)];
    return [[s.id, [s.eyebrow, s.chip, ...s.steps.map((x) => x.text), s.hint, ...s.preview.fields, s.copyCards.label, ...s.copyCards.cards.flatMap(partText), s.returnLine, s.privacy.text]]];
  }
  // NL4 S20: the context line, the three questions (and the fix line); S20B: the five mistakes with their definitions, the note
  if (s.variant === 'selfcheck') return [[s.id, [...stageText(s.stage), ...s.rows.map((r) => r.text), s.fixLine]]];
  if (s.variant === 'risk') return [[s.id, [s.hint, ...s.options.flatMap((o) => [o.label, o.sub]), s.strip]]];
  // NL4 S21R, its fullest state (not passed, all five missed): the chip, its line, each missed item's
  // stem and line (FX2 H1: the short stem; the "Review Chapter N" links are buttons, excluded as everywhere)
  if (s.template === 'result') {
    const check = content.screens.find((x) => x.id === s.from);
    // (FX3: version b's short stems, stemB, counted as their own state)
    const missedView = (b) => [s.notPassed.chip, s.notPassed.text, ...s.missed.flatMap((m) => { const it = check.items.find((x) => x.id === m.item); return [(b && m.stemB) || m.stem || it.stem || it.instruction, m.text]; })];
    return [[`${s.id} passed`, [s.passed.chip, s.passed.text]],
      [`${s.id} not passed`, missedView(false)], [`${s.id} not passed, version b`, missedView(true)]];
  }
  // FX2 G END: the line under the big line, the status chip and its hint, the next-step line (logo, h1, link excluded)
  if (s.template === 'end') return [[`${s.id} passed`, [s.sub, s.passed.chip, s.next]], [`${s.id} not passed`, [s.sub, s.notPassed.chip, s.notPassed.hint, s.next]]];
  // R2 templates
  if (s.variant === 'fill') return [[s.id, [s.situation.text, ...s.fieldRows.flatMap((f) => [f.label, f.value]), ...s.options.map((o) => o.label)]]];
  if (s.variant === 'metric') return [[s.id, [s.context, ...bandText(s.band), s.field.label, ...s.options.map((o) => o.label), s.slotsTitle, ...s.slots.map((x) => x.label)]]];
  // R3 templates
  // (FX3: each item's version b too)
  if (s.template === 'check') return s.items.flatMap((it) => [it, ...(it.b ? [{ ...it, ...it.b, id: it.id + 'b' }] : [])])
    .map((it) => [`${s.id} ${it.id}`, it.kind === 'tiles' ? it.tiles.flatMap((t) => [String(t.n), t.text]) : [it.stem, ...it.options.map((o) => o.label)]]);
  // (NL4: the bridge line stays on the case card over the photo in both steps)
  if (s.variant === 'close') return [[`${s.id} step1`, [s.step2.bridge.text, ...s.options.map((o) => o.label)]], [`${s.id} step2`, [s.step2.bridge.text, s.step2.homework.text]]];
  if (s.variant === 'pick') return s.tiles.map((t) => [`${s.id} tile ${t.n} open`, [...s.tiles.flatMap((x) => [String(x.n), x.title]), s.question, t.text]]);
  if (s.template === 'bpmn') {
    const dg = content.diagrams[s.diagram];
    const drawn = [...dg.lanes.map((l) => l.label), ...dg.nodes.map((n) => n.label), ...dg.edges.map((e) => e.label)];
    if (s.variant === 'key') return [[s.id, [s.label, s.text, ...drawn, ...s.key.map((k) => k.text)]]];
    // labels: the drop chips until each label is placed (then the label sits there): the label texts once
    return [[s.id, [...drawn, ...s.labels.map((l) => l.text)]]];
  }
  if (s.variant === 'tiles') {
    const nums = s.tiles.map((t) => String(t.n));
    // NL2: the open tile shows its title and definition; when answering, the question is the heading
    // (excluded) and its hint the line under it
    return [...s.tiles.map((t) => [`${s.id} tile ${t.n} open`, [...nums, ...s.tiles.map((x) => x.title), t.back]]),
      [`${s.id} answering`, [...nums, ...s.tiles.map((t) => t.title), s.questionHint]]];
  }
  // Round 4 templates (instruction h1 and buttons excluded, as everywhere)
  if (s.template === 'title') return [[s.id, [s.program, s.kicker, s.quote]]];
  if (s.template === 'moduleMap') {
    // the open lesson's panel shows its own line only (its title already sits on the open tab)
    const stations = s.stations.flatMap((x) => [x.kicker, x.title]);
    return s.stations.map((x) => [`${s.id} ${x.id} open`, [s.eyebrow, s.line, ...stations, content.ui.moduleMap.today, x.text]]);
  }
  if (s.template === 'goals') return [[s.id, [s.eyebrow, s.deliverable.label, s.deliverable.text, ...s.goals.map((g) => g.label)]]];
  if (s.template === 'warmup') return [[s.id, [s.panel.title, s.panel.chip, s.panel.text, s.panel.foot, ...s.options.map((o) => o.label)]]];
  if (s.template === 'concept') return [[s.id, [s.label, s.topic, s.text, ...s.figures.flatMap((f) => [f.chip, f.caption]), s.evidence.text, s.evidence.source]]];
  // NL2 templates
  // sort deck: every placed card stays on screen in its column, with the current card on the deck
  // (NL3: with the field chip, the explain band and the hint line when the screen shows them)
  // (FX2 B: a placed card shows its own text)
  if (s.template === 'sortDeck') return [[s.id, [s.header, ...bandText(s.band), s.hintShown ? s.hint : '', ...s.columns.flatMap((c) => [c.label, c.sub]), ...s.cards.map((c) => c.text)]]];
  // FX2 D1 S17: one case at a time, with the hint and the five mistakes (name and definition)
  if (s.variant === 'cases') return s.cards.map((c) => [`${s.id} case ${c.id}`, [s.hint, c.text, ...s.options.flatMap((o) => [o.label, o.sub])]]);
  // FX2 D2 S18A: the case chip, the hint, the four fields with their lines, every card chosen
  if (s.variant === 'fields') return [[s.id, [s.header, s.hint, ...s.columns.flatMap((c) => [c.label, c.sub]), ...s.cards.map((c) => c.text)]]];
  if (s.template === 'keyParts') {
    const base = [s.label, s.text, ...s.parts.flatMap((p) => [p.title, p.text])];
    return [[s.id, base], [`${s.id} case on`, [...base, ...s.parts.flatMap((p) => [s.caseLabel, p.case])]]];
  }
  // NL3 K4: the head and both columns
  if (s.template === 'keyColumns') return [[s.id, [s.label, s.text, ...s.columns.flatMap((c) => [c.title, ...c.items.flatMap((it) => [it.term, it.text])])]]];
  // NL3 flags: the full map (every field) or the process line, and the flags (placed ones sit on their target)
  if (s.template === 'flags') {
    const flags = s.flags.map((f) => f.text || s.flagLabel);
    return [[s.id, s.variant === 'map' ? [s.context, ...s.map.flatMap((f) => [String(f.n), f.title, f.text]), ...flags] : [...s.line.flatMap((x) => [String(x.n), x.text]), ...flags]]];
  }
  // NL2: one situation at a time (the solved ones as done cards), the rounds with their rules band
  if (s.variant === 'pair') return s.situations.map((x, k) => [`${s.id} ${x.id}`, [x.hint, s.answerLabel, x.text, ...x.options.flatMap((o) => [o.label, o.sub]),
    ...s.situations.slice(0, k).flatMap((d) => [d.doneLabel, d.options.find((o) => o.correct).label])]]);
  if (s.variant === 'rounds') return s.rounds.map((r) => [`${s.id} ${r.id}`, [s.rules.label, ...s.rules.items, r.badge, r.line, s.hint, ...s.options.map((o) => o.label)]]);
  // (NL3 S14, S15: with the explain band and S14's handoff visual on the case card)
  const visual = s.visual ? [s.visual.from, s.visual.to, s.visual.away] : [];
  // (NL4: S18B's checkbox line; the "Your case" card shows the learner's own title, not counted)
  return [[s.id, [...bandText(s.band), ...visual, ...stageText(s.stage), ...(s.options || []).map((o) => o.label), ...fieldText(s.fields), s.checkbox, ...(s.cases || []).map((c) => c.label)]]];
}

// Every hint, feedback line and pause marker on screen s (pause marker: its chapter's, on the last
// screen of the chapter): [name, text]
export function screenFeedback(s, content) {
  const ch = content.chapters.find((c) => c.id === s.chapter);
  const pause = ch && ch.pauseMarker && ch.screens[ch.screens.length - 1] === s.id ? [[`${ch.id} pauseMarker`, ch.pauseMarker]] : [];
  return [
    ...pause,
    [`${s.id} hint`, s.hint],
    ...(s.options || []).map((o) => [`${s.id} option ${o.id}`, o.feedback]),
    ...Object.entries(s.feedback || {}).map(([k, v]) => [`${s.id} feedback.${k}`, v]),
    [`${s.id} feedbackCorrect`, s.feedbackCorrect],
    ...(s.stops || []).flatMap((st) => st.options.map((o) => [`${s.id} ${st.id} option ${o.id}`, o.feedback])),
    ...Object.entries(s.states || {}).flatMap(([k, st]) => Object.entries(st).filter(([f, v]) => /Feedback$/.test(f) && typeof v === 'string').map(([f, v]) => [`${s.id} ${k}.${f}`, v])),
    ...(s.rows || []).flatMap((r) => Object.entries(r.feedback).map(([k, v]) => [`${s.id} ${r.id} ${k}`, v])),
    [`${s.id} fixLine`, s.fixLine], [`${s.id} openFeedback`, s.openFeedback], [`${s.id} returnLine`, s.returnLine],
    ...(s.template === 'result' ? [[`${s.id} passed`, s.passed.text], [`${s.id} notPassed`, s.notPassed.text], ...s.missed.map((m) => [`${s.id} missed ${m.item}`, m.text])] : []),
    [`${s.id} questionHint`, s.questionHint],
    ...(s.cards || []).flatMap((c) => Object.entries(c.feedback).map(([k, v]) => [`${s.id} card ${c.id ?? c.n} ${k}`, v])),
    ...(s.hotspots || []).map((x) => [`${s.id} hotspot ${x.id}`, x.feedback]),
    ...(s.legend || []).map((g) => [`${s.id} legend ${g.id}`, g.text]),
    ...(s.tiles || []).map((t) => [`${s.id} tile ${t.n}`, t.feedback]),
    ...(Array.isArray(s.map) ? s.map : []).map((f) => [`${s.id} field ${f.n}`, f.feedback]),
    ...(s.flags || []).flatMap((f) => Object.entries(f.feedback || {}).map(([k, v]) => [`${s.id} flag ${f.id} ${k}`, v])),
    ...(s.situations || []).flatMap((x) => x.options.map((o) => [`${s.id} ${x.id} option ${o.id}`, o.feedback])),
    ...(s.rounds || []).flatMap((r) => Object.entries(r.feedback).map(([k, v]) => [`${s.id} ${r.id} option ${k}`, v])),
    ...Object.entries(s.step2?.feedback || {}).map(([k, v]) => [`${s.id} step2.${k}`, v]),
    ...(s.items || []).flatMap((it) => [it, ...(it.b ? [{ ...it, ...it.b, id: it.id + 'b' }] : [])]) // FX3: version b too
      .flatMap((it) => [...(it.options || []).map((o) => [`${s.id} ${it.id} option ${o.id}`, o.feedback]), ...(it.tiles || []).map((t) => [`${s.id} ${it.id} tile ${t.n}`, t.feedback])]),
  ].filter(([, v]) => typeof v === 'string' && v);
}

// One screen's summary for the review toolbar and page:
//   { views: [{ name, n }], max, over, limit, feedback: [{ name, text, n, over }], longFeedback }
// over: max above 45 (an approved wordLimit allowance is shown, but the screen still counts as over)
export function screenWords(s, content) {
  const views = screenViews(s, content).map(([name, list]) => ({ name, n: sum(list) }));
  const max = Math.max(0, ...views.map((v) => v.n));
  const feedback = screenFeedback(s, content).map(([name, text]) => ({ name, text, n: words(text), over: words(text) > MAX_FEEDBACK_WORDS }));
  return { views, max, over: max > MAX_SCREEN_WORDS, limit: s.wordLimit || null, feedback, longFeedback: feedback.filter((f) => f.over).length };
}
