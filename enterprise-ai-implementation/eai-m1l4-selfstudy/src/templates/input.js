// Input template (S02; the S19 return state reuses the field builder in P3), layout "form": the
// centred single column inside the shell. Label line, instruction, labelled fields with maxlength and
// a live {n}/{max} counter (announced to screen readers only from COUNTER_ANNOUNCE_AT characters on),
// the privacy line with Save, and the band under the form. Save is always enabled:
//   any field empty on Save -> feedback.empty as a notice (hint look, not an error colour)
//   all filled              -> values stored under each field's store key, one fill-in answer per
//                              field on the tracking bus, feedback.saved, Next unlocks
import { h, fmt, nextId, resolveLink } from '../util.js';
import { icon } from '../icons.js';
import { layout, ruleLabel, privacyLine } from './stage.js';

const COUNTER_ANNOUNCE_AT = 230;

export const input = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const privacy = privacyLine(screen.stage.bottom);
    const announcer = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const controls = screen.fields.map((f) => field(f, ctx, privacy.id, announcer));
    const save = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'save' }, onclick: () => doSave() }, ui.buttons.save);
    // a help line by the fields, and a new-tab link to the earlier homework when content has its URL
    const mid = screen.stage.middle || {};
    const href = mid.link ? resolveLink(ctx.content, mid.link) : null;
    const helpLine = mid.help ? h('p', { class: 'w-field-help' }, icon(mid.help.icon || 'info', { size: 20 }), h('span', {}, mid.help.text),
      href ? h('a', { class: 'w-link w-field-help-link', href, target: '_blank', rel: 'noopener noreferrer', dataset: { action: 'homework1' } },
        h('span', {}, ui.buttons.openHomework1), icon('external-link', { size: 16 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')')) : null) : null;

    layout(ctx, 'form',
      zones.logo,
      h('div', { class: 'w-form' },
        screen.stage.top?.text ? ruleLabel(screen.stage.top.text) : null,
        zones.instruction,
        h('div', { class: 'w-form-task', dataset: { interaction: '' } },
          helpLine,
          h('div', { class: 'w-fields' }, controls.map((c) => c.el), announcer),
          h('div', { class: 'w-actionbar' }, privacy.el, save)),
        zones.band));

    const showSaved = (focus) => {
      save.className = 'w-btn w-btn-ghost'; // Next is now the one action that leads on
      zones.setFeedback({ state: 'neutral', text: screen.feedback.saved });
      ctx.unlockNext({ focus });
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

// one labelled text field with its live counter (also used by S18 and S19): { el, input }
export function field(f, ctx, privacyId, announcer) {
  const { ui } = ctx;
  const id = nextId('w-field'), counterId = nextId('w-counter');
  const max = f.maxLength;
  const attrs = { class: 'w-input', id, maxlength: String(max), placeholder: f.placeholder || null, autocomplete: 'off',
    'aria-describedby': [counterId, privacyId].filter(Boolean).join(' '), dataset: { store: f.store } };
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
