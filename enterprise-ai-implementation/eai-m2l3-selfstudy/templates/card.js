// card: the learner's Opportunity Card (EAI M2 L3). Round 3 (25 Nov 2026, Noy approved the prototype in
// planning/prototypes/round3.html): a real card that comes out of a folder and slides to the centre every time the
// lesson returns to it, so the learner knows they are back at their own card. Refs: a stepper form (DNB), a 3D folder.
//   the tab      "Your Opportunity Card", like a file tab
//   the steps    left pane: the card's steps in the lesson's order (your pain, category and tools, root cause and
//                people, data sensitivity, the opportunity); done ones ticked, the current one lit
//   the paper    right pane: the learner's pain, one short line per step already done, then only the current step's
//                question (the h1) and its fields, and Save
// No ids, no "fills in" labels, no empty fields of later steps on screen (Noy: "messy, too much text").
// Shared parts live in content.card: { title, back, painLabel, painFallback, steps [{ id, label, rows }],
// rows [{ id, label, store }], library { label } }. A screen: variant "build", cardStep (the current step id), intro
// (the line over the card), fill [{ row, kind: text|select, options, placeholder, maxLength, trackingId, library }],
// save, feedback. cardDoc() is also used by tenCards (B3), with no current step: the card as it starts.
import { h, reducedMotion } from '../src/util.js?v=044f9db2';
import { glyph, icon } from '../src/icons.js?v=044f9db2';
import { layout } from '../src/templates/stage.js?v=044f9db2';

export function cardDoc(ctx, { current = null, head = null, body = [] } = {}) {
  const C = ctx.content.card;
  const R = Object.fromEntries(C.rows.map((r) => [r.id, r]));
  const val = (id) => ctx.store.get(R[id].store);
  const ci = C.steps.findIndex((s) => s.id === current);
  const stepState = (s, i) => (current ? (i < ci ? 'done' : i === ci ? 'now' : 'next') : (i === 0 ? 'done' : 'next'));
  const steps = h('ol', { class: 'm-oc-steps' }, C.steps.map((s, i) => {
    const st = stepState(s, i);
    return h('li', { class: 'm-oc-step', dataset: { state: st }, 'aria-current': st === 'now' ? 'step' : null },
      h('i', { 'aria-hidden': 'true' }, st === 'done' ? glyph('g-check-b', { size: 15 }) : String(i + 1)),
      h('span', {}, s.label));
  }));
  const pain = val('pain') || C.painFallback;
  // the steps already done (not the pain, which has its own box): one short line each
  const doneLines = (current ? C.steps.slice(1, ci) : []).flatMap((s) => s.rows.filter((r) => val(r))
    .map((r) => h('p', { class: 'm-oc-done' }, h('b', {}, R[r].label + ':'), ' ', val(r))));
  const paper = h('div', { class: 'm-oc-paper' },
    h('div', { class: 'm-oc-pain' }, h('span', {}, C.painLabel), h('p', {}, pain)),
    doneLines.length ? h('div', { class: 'm-oc-dones' }, doneLines) : null,
    head, body);
  return h('article', { class: 'm-oc', 'aria-label': C.title },
    h('div', { class: 'm-oc-tab' }, h('b', { 'aria-hidden': 'true' }), C.title),
    h('div', { class: 'm-oc-body' }, h('div', { class: 'm-oc-side' }, steps), paper));
}

// the folder the card slides out of (drawn in CSS)
export const folder = () => h('div', { class: 'm-oc-folder', 'aria-hidden': 'true' },
  h('i', { class: 'f-tab' }), h('i', { class: 'f-back' }), h('i', { class: 'f-p1' }), h('i', { class: 'f-p2' }), h('i', { class: 'f-p3' }), h('i', { class: 'f-front' }));

export const card = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const C = ctx.content.card;
    const R = Object.fromEntries(C.rows.map((r) => [r.id, r]));
    const controls = [];
    const fields = (screen.fill || []).map((f) => {
      const id = 'm-card-' + f.row;
      const input = f.kind === 'select'
        ? h('select', { class: 'm-card-input', id }, h('option', { value: '' }, f.placeholder || ''), f.options.map((o) => h('option', { value: o }, o)))
        : h('input', { class: 'm-card-input', id, type: 'text', maxlength: String(f.maxLength || 140), placeholder: f.placeholder || '', autocomplete: 'off' });
      input.value = ctx.store.get(R[f.row].store) || '';
      controls.push({ r: R[f.row], f, input });
      const lib = f.library && C.library ? h('a', { class: 'm-oc-lib', href: ctx.content.links?.library || 'library/', target: '_blank', rel: 'noopener' },
        icon('external-link', { size: 18 }), h('span', {}, C.library.label)) : null;
      return h('div', { class: 'm-oc-field' }, h('label', { for: id }, R[f.row].label), lib ? h('div', { class: 'm-oc-inrow' }, input, lib) : input);
    });
    const save = h('button', { class: 'm-oc-save', type: 'button', dataset: { action: 'save' } }, ui.buttons[screen.save] || 'Save');
    const doc = cardDoc(ctx, { current: screen.cardStep,
      head: zones.instruction,
      body: [h('div', { class: 'm-oc-fields', dataset: { n: String(fields.length) } }, fields), h('div', { class: 'm-oc-foot' }, h('div', { class: 'm-oc-band' }, zones.band), save)] });
    // round 3 (Noy: "you don't get to see the card's animation"): the line opens large in the centre with the folder
    // under it; a moment later the card rises out of the folder, and the line moves to its small place at the top
    const still = reducedMotion() || ctx.revisit;
    const introText = screen.intro || C.back;
    const scene = h('div', { class: 'm-oc-scene' + (still ? '' : ' m-oc-in') }, still ? null : folder(), doc);
    const intro = still ? null : h('p', { class: 'm-oc-intro', 'aria-hidden': 'true' }, introText);
    layout(ctx, 'ocard', h('p', { class: 'm-oc-back' + (still ? '' : ' m-oc-back-later') }, introText), intro, scene);
    zones.setHintVisible(false);
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const filled = () => controls.every((c) => c.input.value.trim());
    const fill = () => { save.disabled = !filled(); };
    controls.forEach((c) => c.input.addEventListener(c.f.kind === 'select' ? 'change' : 'input', fill));
    fill();
    const saved = (focus) => { zones.setFeedback({ state: 'neutral', tone: 'correct', text: screen.feedback.saved }); ctx.unlockNext({ focus }); };
    save.addEventListener('click', () => {
      if (!filled()) { zones.setFeedback({ state: 'notice', text: screen.feedback.empty }); return; }
      controls.forEach((c) => {
        const v = c.input.value.trim();
        ctx.store.set(c.r.store, v);
        ctx.answer({ trackingId: c.f.trackingId, response: v, result: 'neutral' });
      });
      ctx.complete();
      saved(true);
    });
    if (ctx.revisit) saved(false);
    else ctx.need(ui.footer.need.card);
    return { unmount() {} };
  },
};
