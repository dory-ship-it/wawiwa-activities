// Input template (S02, S08B; the S18 and S19 fields reuse the field builder), "Hybrid cinematic" look:
// a Focus panel. Context line, the heading with "Show me" beside it, the hint as the line under it,
// the labelled fields side by side (maxlength and a live {n} / {max} counter, announced to screen
// readers only from COUNTER_ANNOUNCE_AT characters on), then one row: "Open Homework 1" (new tab),
// the help question as a button with its answer in a glass tooltip, the privacy line and Save; the
// feedback strip at the panel's foot. S08B (arrange "chain", no hint): the heading alone, the three
// fields on one line with arrows between them (each as wide as its field's width, default 1), the
// privacy line and Save. NL3 S12B: the chain with its hint line; S17B (arrange "pair"): the two fields
// side by side, the learner's Chapter 2 steps read-only under the context line (stage.top.show).
// Save is always enabled:
//   a required field empty  -> feedback.empty in the neutral strip (its first sentence as the head);
//                              a field marked optional may stay empty (S12B Date)
//   all filled              -> values stored under each field's store key, one fill-in answer per
//                              field on the tracking bus, feedback.saved, Next unlocks
import { h, fmt, nextId, resolveLink } from '../util.js';
import { glyph } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { layout, sheet, contextLine, privacyLine, showMe, splitFirst } from './stage.js';
import { targetSteps, scaleOf } from '../ghost.js';

const COUNTER_ANNOUNCE_AT = 230;

export const input = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    // the privacy line, or (S17B, kind "note") the screen's note in its place; none: Save sits at the right alone
    const privacy = screen.stage.bottom ? privacyLine(screen.stage.bottom) : null;
    const announcer = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const controls = screen.fields.map((f) => field(f, ctx, privacy?.id, announcer));
    const save = h('button', { class: 'w-btn w-btn-action' + (privacy ? '' : ' w-btn-end'), type: 'button', dataset: { action: 'save' }, onclick: () => doSave() }, ui.buttons.save);
    // the earlier homework in a new tab when content has its URL; the help line's question is a
    // button, its answer the tooltip (one string in the content, split at the question mark)
    const mid = screen.stage.middle || {};
    const href = mid.link ? resolveLink(ctx.content, mid.link) : null;
    const hw = href ? h('a', { class: 'w-btn w-btn-ghost', href, target: '_blank', rel: 'noopener noreferrer', dataset: { action: 'homework1' } },
      h('span', {}, ui.buttons.openHomework1), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')')) : null;
    const [question, answer] = mid.help ? splitFirst(mid.help.text) : ['', ''];
    const help = mid.help ? h('button', { class: 'w-btn w-btn-ghost w-help-btn', type: 'button', dataset: { action: 'homeworkHelp' } }, question) : null;

    // the ghost hand taps the first field (the frame shows it with the focus border); "Show me" replays it
    const first = controls[0]?.input;
    const g = screen.ghost && !ctx.revisit ? ctx.ghost({ type: screen.ghost.type,
      // the fingertip rests on the field's left part (92 x 41 px in, the frame), never on another control
      steps: () => targetSteps(zones.main, screen.ghost.target).map((s) => (s.el ? { point: () => { const r = s.el.getBoundingClientRect(), k = scaleOf(s.el); return { x: r.left + 92 * k, y: r.top + 41 * k }; },
        tap: () => s.el.classList.add('w-ghost-on'), hold: 900 } : s)),
      restore: () => first?.classList.remove('w-ghost-on') }) : null;

    // S08B (arrange "chain"): the fields on one line with an arrow between each two
    const chain = screen.arrange === 'chain';
    const fieldEls = chain ? controls.flatMap((c, i) => [i ? h('span', { class: 'w-chain-arrow', 'aria-hidden': 'true' }, glyph('g-arrow', { size: 30.72 })) : null, c.el]) : controls.map((c) => c.el);
    const fields = h('div', { class: 'w-fields' + (chain ? ' w-fields-chain' : screen.arrange === 'pair' ? ' w-fields-pair' : '') }, fieldEls, announcer);
    if (chain) fields.style.gridTemplateColumns = screen.fields.map((f) => `minmax(0, ${f.width || 1}fr)`).join(' auto ');
    // S17B: what the learner wrote before (read-only), under the context line
    const shown = screen.stage.top?.show ? h('p', { class: 'w-shown' }, h('span', {}, ctx.store.get(screen.stage.top.show) || ui.record.empty)) : null;
    layout(ctx, 'focus',
      sheet('focus',
        contextLine(screen.stage.top?.text),
        shown,
        screen.hint ? [h('div', { class: 'w-head-row' }, zones.instruction, g && screen.ghost.showMe ? g.button : null), h('p', { class: 'w-subline' }, screen.hint)] : zones.instruction,
        h('div', { class: 'w-form-task', dataset: { interaction: '' } },
          fields,
          h('div', { class: 'w-actionbar' }, hw, help, privacy?.el, save)),
        zones.band));

    // the help answer as the button's glass tooltip (and its description), once the button is in place
    if (help && answer) attachTip(help, answer, { side: 'below-left', width: 384 });

    const showSaved = (focus) => {
      zones.setFeedback({ state: 'neutral', tone: 'correct', text: screen.feedback.saved });
      ctx.unlockNext({ focus });
    };

    function doSave() {
      const values = controls.map((c) => c.input.value.trim());
      if (values.some((v, i) => !v && !screen.fields[i].optional)) { zones.setFeedback({ state: 'notice', text: screen.feedback.empty }); return; }
      controls.forEach((c, i) => { c.input.value = values[i]; c.input.dispatchEvent(new Event('input')); }); // show what was stored
      screen.fields.forEach((f, i) => ctx.store.set(f.store, values[i]));
      screen.fields.forEach((f, i) => ctx.answer({ trackingId: f.trackingId, response: values[i], result: 'neutral' }));
      ctx.complete();
      showSaved(true);
    }

    // the hint is the line under the heading: the band keeps it for screen readers only
    zones.setHintVisible(false);
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
  const el = h('div', { class: 'w-field' + (f.multiline ? ' w-field-multi' : '') }, h('label', { class: 'w-field-label', for: id }, f.label), input, counter);
  return { el, input };
}
