// card: the learner's growing Opportunity Card (EAI M2 L3; Noy, 23 Nov 2026: the card goes with the learner
// through the lesson and fills field by field). The deck's own card format (slide 17) as a document: one row per
// field, the label on the left, the learner's words on the right (from the store), empty rows shown as "Later".
//   intro    (presentation) the card as it is now, with the pain already on it; Next open
//   fill     the rows named in `fill` are inputs (text or a select) in their own row, lit; Save keeps them in the
//            store, sends one neutral fill-in per field, and unlocks Next
// Light "do" ground (dots). Content: eyebrow, line (the sentence under the h1), rows [{ id, label, store }],
// fill [{ row, kind: 'text' | 'select', options, trackingId, maxLength, placeholder }], save (a ui.buttons key),
// later (the empty row's word), feedback { saved, empty }.
import { h } from '../src/util.js?v=f95774b5';
import { glyph } from '../src/icons.js?v=f95774b5';
import { layout, focusHead } from '../src/templates/stage.js?v=f95774b5';

export const card = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const fills = Object.fromEntries((screen.fill || []).map((f) => [f.row, f]));
    const controls = [];
    const rows = screen.rows.map((r) => {
      const f = fills[r.id];
      let value;
      if (f) {
        const id = 'm-card-' + r.id;
        const input = f.kind === 'select'
          ? h('select', { class: 'm-card-input', id }, h('option', { value: '' }, f.placeholder || ''), f.options.map((o) => h('option', { value: o }, o)))
          : h('input', { class: 'm-card-input', id, type: 'text', maxlength: String(f.maxLength || 140), placeholder: f.placeholder || '', autocomplete: 'off' });
        input.value = ctx.store.get(r.store) || '';
        controls.push({ r, f, input });
        value = input;
        return h('div', { class: 'm-card-row', dataset: { state: 'now' } }, h('label', { class: 'm-card-label', for: id }, r.label), value);
      }
      const v = ctx.store.get(r.store);
      return h('div', { class: 'm-card-row', dataset: { state: v ? 'done' : 'later' } },
        h('span', { class: 'm-card-label' }, r.label),
        h('span', { class: 'm-card-value' }, v || screen.later));
    });
    const save = controls.length ? h('button', { class: 'm-prep-save', type: 'button', dataset: { action: 'save' } }, ui.buttons[screen.save] || 'Save') : null;
    const doc = h('section', { class: 'm-card-doc', 'aria-label': screen.cardTitle },
      h('div', { class: 'm-card-doc-head' }, h('span', { class: 'm-card-icon', 'aria-hidden': 'true' }), h('b', {}, screen.cardTitle)),
      h('div', { class: 'm-card-rows' }, rows),
      // the feedback and Save share the card's last row: nothing hangs under the card (no overlap with the nav row)
      save ? h('div', { class: 'm-card-foot' }, h('div', { class: 'm-card-band' }, zones.band), save) : null);
    layout(ctx, 'card', focusHead(screen.eyebrow, 'write', zones.instruction, screen.line ? h('p', { class: 'w-concept-text m-card-line' }, screen.line) : null), doc);
    zones.setHintVisible(false);
    if (!controls.length) return { unmount() {} };

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
