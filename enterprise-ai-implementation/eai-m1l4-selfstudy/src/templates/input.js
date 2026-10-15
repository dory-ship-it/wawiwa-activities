// Input template (S02; the S19 return state reuses the field builder in P3).
// Labelled fields with maxlength, a live {n}/{max} counter (announced to screen readers only from
// COUNTER_ANNOUNCE_AT characters on), a privacy line, and Save that is always enabled:
//   any field empty on Save -> feedback.empty in the neutral notice tone (not an error colour)
//   all filled              -> values stored under each field's store key, one fill-in answer per
//                              field on the tracking bus, feedback.saved, Continue appears
import { h, fmt, nextId } from '../util.js';
import { renderStage } from './stage.js';

const COUNTER_ANNOUNCE_AT = 230;

export const input = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const refs = renderStage(ctx, { cardClass: 'w-tpl-input' });
    const announcer = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const controls = screen.fields.map((f) => field(f, ctx, refs, announcer));
    refs.fields.append(...controls.map((c) => c.el), announcer);

    const save = h('button', { class: 'w-btn w-btn-primary', type: 'button', dataset: { action: 'save' }, onclick: () => doSave() }, ui.buttons.save);
    refs.action.append(save);

    const showSaved = (focus) => {
      save.className = 'w-btn w-btn-secondary'; // Continue is now the one primary action
      const cont = zones.setFeedback({ state: 'neutral', text: screen.feedback.saved,
        actions: [{ id: 'continue', label: ui.buttons.continue, primary: true, onClick: () => ctx.finish() }] });
      if (focus) cont.focus();
    };

    function doSave() {
      const values = controls.map((c) => c.input.value.trim());
      if (values.some((v) => !v)) { zones.setFeedback({ state: 'notice', text: screen.feedback.empty }); return; }
      controls.forEach((c, i) => { c.input.value = values[i]; c.input.dispatchEvent(new Event('input')); }); // show what was stored
      screen.fields.forEach((f, i) => ctx.store.set(f.store, values[i]));
      screen.fields.forEach((f, i) => ctx.answer({ trackingId: f.trackingId, response: values[i], result: 'neutral' }));
      ctx.complete();
      showSaved(true);
    }

    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (ctx.revisit) showSaved(false); // saved text comes back in the fields; still editable
    return { unmount() {} };
  },
};

function field(f, ctx, refs, announcer) {
  const { ui } = ctx;
  const id = nextId('w-field'), counterId = nextId('w-counter');
  const max = f.maxLength;
  const attrs = { class: 'w-input', id, maxlength: String(max), placeholder: f.placeholder || null, autocomplete: 'off',
    'aria-describedby': [counterId, refs.privacyId].filter(Boolean).join(' '), dataset: { store: f.store } };
  const input = f.multiline ? h('textarea', { ...attrs, rows: '3' }) : h('input', { ...attrs, type: 'text' });
  input.value = ctx.store.get(f.store);
  const counter = h('span', { class: 'w-counter', id: counterId });
  const count = () => {
    const n = input.value.length;
    counter.textContent = fmt(ui.counter, { n, max });
    if (n >= COUNTER_ANNOUNCE_AT) announcer.textContent = counter.textContent;
  };
  input.addEventListener('input', count);
  count();
  const el = h('div', { class: 'w-field' }, h('label', { class: 'w-field-label', for: id }, f.label), input, counter);
  return { el, input };
}
