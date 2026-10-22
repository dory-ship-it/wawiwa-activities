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
    // the brief's read-only sketch (S08B): its heading and the three part names (the learner's own text not counted)
    const sketchText = (st) => (st.sketch ? [st.sketch.label, ...(content.screens.find((x) => x.id === st.sketch.from)?.fields || []).map((f) => f.label)] : []);
    return Object.entries(s.states).map(([k, st]) => [`${s.id} ${k}`, [...stageText(st.stage), ...fieldText(st.fields), ...sketchText(st)]]);
  }
  if (s.variant === 'selfcheck') return s.steps.map((st) => [`${s.id} ${st.id}`, [...(st.rows || []).map((r) => r.text), ...(st.chips || []).map((c) => c.label), st.strip]]);
  // R1 templates, each in its fullest state
  // sort: placed cards stay on screen as chips, so every card counts, unless the chips are markers
  // without text (S17: one case on screen at a time); then the longest case counts
  if (s.template === 'sort') {
    const cardText = s.chipStyle === 'marker' ? [s.cards.map((c) => c.text).sort((a, b) => words(b) - words(a))[0]] : s.cards.map((c) => c.text);
    return [[s.id, [s.header, ...s.columns.map((c) => c.label), ...cardText]]];
  }
  // R2 templates
  if (s.variant === 'fill') return [[s.id, [s.situation.text, ...s.fieldRows.flatMap((f) => [f.label, f.value]), ...s.options.map((o) => o.label)]]];
  if (s.variant === 'metric') return [[s.id, [...bandText(s.band), s.field.label, ...s.options.map((o) => o.label), s.slotsTitle, ...s.slots.map((x) => x.label)]]];
  // R3 templates
  if (s.variant === 'safety') return [[`${s.id} step1`, [s.stage.top.text, ...s.options.map((o) => o.label)]],
    [`${s.id} step2`, [s.stage.top.text, s.step2.field.label, s.step2.privacy.text, s.step2.checkbox]]];
  if (s.template === 'check') return s.items.map((it) => [`${s.id} ${it.id}`, it.kind === 'tiles' ? it.tiles.flatMap((t) => [String(t.n), t.text]) : [it.stem, ...it.options.map((o) => o.label)]]);
  if (s.variant === 'close') return [[`${s.id} step1`, s.options.map((o) => o.label)], [`${s.id} step2`, [s.step2.bridge.text, s.step2.homework.text]]];
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
  if (s.template === 'sortDeck') return [[s.id, [s.header, ...bandText(s.band), s.hintShown ? s.hint : '', ...s.columns.flatMap((c) => [c.label, c.sub]), ...s.cards.map((c) => c.text)]]];
  if (s.template === 'keyParts') {
    const base = [s.label, s.text, ...s.parts.flatMap((p) => [p.title, p.text])];
    return [[s.id, base], [`${s.id} case on`, [...base, ...s.parts.flatMap((p) => [s.caseLabel, p.case])]]];
  }
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
  return [[s.id, [...bandText(s.band), ...visual, ...stageText(s.stage), ...(s.options || []).map((o) => o.label), ...fieldText(s.fields), ...(s.cases || []).map((c) => c.label)]]];
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
    ...(s.steps || []).flatMap((st) => [...(st.rows || []).flatMap((r) => Object.entries(r.feedback).map(([k, v]) => [`${s.id} ${r.id} ${k}`, v])),
      ...(st.chips || []).map((c) => [`${s.id} chip ${c.id}`, c.feedback])]),
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
    ...(s.items || []).flatMap((it) => [...(it.options || []).map((o) => [`${s.id} ${it.id} option ${o.id}`, o.feedback]), ...(it.tiles || []).map((t) => [`${s.id} ${it.id} tile ${t.n}`, t.feedback])]),
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
