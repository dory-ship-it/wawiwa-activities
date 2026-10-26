// Input template (S02, S08B, S12B, S17B; NL4 S18B with its checkbox), "Hybrid cinematic" look:
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
import { h, fmt, nextId, resolveLink } from '../util.js?v=febfa1ab';
import { glyph } from '../icons.js?v=febfa1ab';
import { attachTip } from '../tooltip.js?v=febfa1ab';
import { layout, sheet, contextLine, privacyLine, showMe, splitFirst } from './stage.js?v=febfa1ab';
import { scaleOf } from '../ghost.js?v=febfa1ab';

const COUNTER_ANNOUNCE_AT = 230;

export const input = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    // the privacy line, or (S17B, kind "note") the screen's note in its place; none: Save sits at the right alone
    const privacy = screen.stage.bottom ? privacyLine(screen.stage.bottom) : null;
    const announcer = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const controls = screen.fields.map((f) => field(f, ctx, privacy?.id, announcer));
    // FX1 D4 (S02, saveWhenFilled): Save is the primary filled button, enabled once every required
    // field has text (locked = grey with a lock, as Check); otherwise the outline action, always enabled
    const primary = !!screen.saveWhenFilled;
    const save = h('button', { class: 'w-btn ' + (primary ? 'w-btn-primary' : 'w-btn-action') + (privacy ? '' : ' w-btn-end'), type: 'button', dataset: { action: 'save' }, onclick: () => doSave() },
      primary ? glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }) : null, h('span', {}, ui.buttons.save));
    // the earlier homework in a new tab when content has its URL; the help line's question is a
    // button, its answer the tooltip (one string in the content, split at the question mark)
    const mid = screen.stage.middle || {};
    const href = mid.link ? resolveLink(ctx.content, mid.link) : null;
    // FX1 D4: on S02 (headAbove) the two help controls are a small row of links under the fields
    const small = !!screen.headAbove;
    const hw = href ? h('a', { class: small ? 'w-link w-link-small' : 'w-btn w-btn-ghost', href, target: '_blank', rel: 'noopener noreferrer', dataset: { action: 'homework1' } },
      h('span', {}, ui.buttons.openHomework1), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')')) : null;
    const [question, answer] = mid.help ? splitFirst(mid.help.text) : ['', ''];
    const help = mid.help ? h('button', { class: (small ? 'w-link w-link-small' : 'w-btn w-btn-ghost') + ' w-help-btn', type: 'button', dataset: { action: 'homeworkHelp' } }, question) : null;

    // FX1 B1 / D4: the ghost hand taps each field and types its demo line (content, never stored), then
    // moves to Save and stops there without pressing it; the fields get their text back afterwards.
    // "Show me how" replays it.
    let before = null;
    const g = !ctx.revisit ? ctx.ghost({ type: screen.ghost?.type || 'input',
      steps: () => {
        before = controls.map((c) => c.input.value);
        // the fingertip rests on the field's left part (92 x 41 px in, the frame), never on another control
        const at = (el) => () => { const r = el.getBoundingClientRect(), k = scaleOf(el); return { x: r.left + Math.min(92, r.width / 3) * k, y: r.top + Math.min(41, r.height / 2) * k }; };
        return [
          ...controls.map((c, i) => ({ point: at(c.input), tap: () => { controls.forEach((x) => x.input.classList.toggle('w-ghost-on', x === c)); c.input.value = ''; c.input.dispatchEvent(new Event('input')); },
            type: screen.fields[i].demo ? { el: c.input, text: screen.fields[i].demo } : null, hold: 300 })),
          { point: () => { const r = save.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sweep: true, hold: 900 },
        ];
      },
      restore: () => controls.forEach((c, i) => { c.input.classList.remove('w-ghost-on'); if (before) { c.input.value = before[i]; c.input.dispatchEvent(new Event('input')); } }) }) : null;

    // S08B (arrange "chain"): the fields on one line with an arrow between each two
    const chain = screen.arrange === 'chain';
    const fieldEls = chain ? controls.flatMap((c, i) => [i ? h('span', { class: 'w-chain-arrow', 'aria-hidden': 'true' }, glyph('g-arrow', { size: 30.72 })) : null, c.el]) : controls.map((c) => c.el);
    const fields = h('div', { class: 'w-fields' + (chain ? ' w-fields-chain' : screen.arrange === 'pair' ? ' w-fields-pair' : '') }, fieldEls, announcer);
    if (chain) fields.style.gridTemplateColumns = screen.fields.map((f) => `minmax(0, ${f.width || 1}fr)`).join(' auto ');
    // S17B: what the learner wrote before (read-only), under the context line
    const shown = screen.stage.top?.show ? h('p', { class: 'w-shown' }, h('span', {}, ctx.store.get(screen.stage.top.show) || ui.record.empty)) : null;
    // the heading with "Show me how" on its right (FX1 B1: on every input screen)
    const head = h('div', { class: 'w-head-row w-head-q' }, zones.instruction, h('span', { class: 'w-head-tools' }, g ? g.button : null));
    const heading = [head, screen.hint ? h('p', { class: 'w-subline' }, screen.hint) : null];
    // G1: a privacy line beside the note (S17B: the note and the privacy line both stand before Save)
    const extra = screen.stage.privacy ? privacyLine(screen.stage.privacy) : null;
    // NL4 (S18B): a checkbox inside the panel, under the field; Save asks for it (feedback.unticked)
    const box = screen.checkbox ? h('input', { class: 'w-checkbox', type: 'checkbox', id: 'w-input-box' }) : null;
    const boxLine = box ? h('label', { class: 'w-checkline w-input-check', for: box.id }, box, h('span', {}, screen.checkbox)) : null;
    // NL4 E2: the slim "Your case" card at the top of the panel (the visual anchor of a form screen): the
    // write icon and the saved case title, or "Your case" while there is none
    const caseText = h('span', {});
    const setCase = () => { caseText.textContent = ctx.store.get('L4_CASE_TITLE').trim() || ui.caseCard; };
    const caseCard = screen.caseCard ? h('p', { class: 'w-case-slim' }, glyph('write', { size: 20.48 }), caseText) : null;
    if (caseCard) setCase();
    // (S02: the two help links small on the left of the same row, so the panel and its strip stay
    // between the bar and the footer; S18B: the checkbox on the left of that row)
    const task = h('div', { class: 'w-form-task', dataset: { interaction: '' } },
      fields,
      h('div', { class: 'w-actionbar' }, boxLine, small ? h('div', { class: 'w-helprow' }, hw, help) : [hw, help], privacy?.el, extra?.el, save));
    if (small) {
      // FX1 D4 (S02): the context line and the heading stand above the panel, on the wash; the panel
      // holds the fields, the small help row and the action bar, with more space between the groups
      layout(ctx, 'focus',
        h('div', { class: 'w-open' },
          h('div', { class: 'w-open-head' }, contextLine(screen.stage.top?.text), shown, heading),
          sheet('focus w-sheet-open', caseCard, task, zones.band))); // (the card at the panel's top right, beside the field labels)
    } else {
      // the card on the context line's row, at its right: the panel keeps its height
      const top = caseCard ? h('div', { class: 'w-case-row' }, contextLine(screen.stage.top?.text), caseCard) : contextLine(screen.stage.top?.text);
      layout(ctx, 'focus', sheet('focus', top, shown, heading, task, zones.band));
    }
    if (extra) controls.forEach((c) => c.input.setAttribute('aria-describedby', c.input.getAttribute('aria-describedby') + ' ' + extra.id));
    // Save enabled once every required field has text (S02)
    const fillState = () => { if (primary) save.disabled = controls.some((c, i) => !c.input.value.trim() && !screen.fields[i].optional); };
    if (primary) { controls.forEach((c) => c.input.addEventListener('input', fillState)); fillState(); }

    // the help answer as the button's glass tooltip (and its description), once the button is in place
    if (help && answer) attachTip(help, answer, { side: 'below-left', width: 384 });

    // "Saved." shows only while the fields hold what was stored: an edit brings the hint back, so a
    // change waiting for Save never reads as saved (QA 26 Oct 2026)
    let savedShown = false;
    const showSaved = (focus) => {
      zones.setFeedback({ state: 'neutral', tone: 'correct', text: screen.feedback.saved });
      savedShown = true;
      ctx.unlockNext({ focus });
    };
    controls.forEach((c, i) => c.input.addEventListener('input', () => {
      if (!savedShown || c.input.value.trim() === ctx.store.get(screen.fields[i].store)) return;
      savedShown = false;
      zones.setFeedback({ state: 'hint', text: screen.hint });
    }));

    function doSave() {
      const values = controls.map((c) => c.input.value.trim());
      if (box && !box.checked) { zones.setFeedback({ state: 'notice', text: screen.feedback.unticked }); box.focus(); return; }
      if (values.some((v, i) => !v && !screen.fields[i].optional)) { zones.setFeedback({ state: 'notice', text: screen.feedback.empty }); return; }
      controls.forEach((c, i) => { c.input.value = values[i]; c.input.dispatchEvent(new Event('input')); }); // show what was stored
      screen.fields.forEach((f, i) => ctx.store.set(f.store, values[i]));
      if (box) ctx.flags.set('box', 1);
      screen.fields.forEach((f, i) => ctx.answer({ trackingId: f.trackingId, response: values[i], result: 'neutral' }));
      if (caseCard) setCase();
      ctx.complete();
      showSaved(true);
    }

    // the hint is the line under the heading: the band keeps it for screen readers only
    zones.setHintVisible(false);
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (box) box.checked = !!ctx.flags.get('box');
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
