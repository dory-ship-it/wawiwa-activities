// reveal: a slide's labelled parts opened one at a time, in the slide's own order (EAI M2 L3, E3: the Sales
// spotlight of deck slide 8, kept from the slide: problem, solution, stack, ROI, watch-out). A learn screen on the
// dark ground. Each part is a row: its label, then its line. "Next part" sits where the next row will open; after the
// last one the key line shows and Next unlocks. Not tracked.
// Content: label (the key pill), parts [{ label, text }], button (a ui.buttons key), keyLine.
import { h, reducedMotion } from '../src/util.js?v=f95774b5';
import { glyph } from '../src/icons.js?v=f95774b5';
import { layout } from '../src/templates/stage.js?v=f95774b5';

export const reveal = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const live = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
    const rows = screen.parts.map((p, i) => h('li', { class: 'm-part-row', hidden: true },
      h('span', { class: 'm-part-n', 'aria-hidden': 'true' }, String(i + 1)),
      h('span', { class: 'm-part-label' }, p.label), h('span', { class: 'm-part-text' }, p.text)));
    const btn = h('button', { class: 'm-why-btn', type: 'button', dataset: { action: 'part' } }, h('span', {}, ui.buttons[screen.button] || 'Next part'));
    const slot = h('li', { class: 'm-part-slot' }, btn);
    const key = h('p', { class: 'm-flow-key', hidden: true }, screen.keyLine);
    const list = h('ol', { class: 'm-parts-list', 'aria-label': screen.label }, rows, slot);
    const head = h('div', { class: 'w-focus-head' },
      h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)), zones.instruction);
    layout(ctx, 'reveal', head, h('div', { class: 'm-parts-wrap' }, list, key), live);
    zones.setHintVisible(false);
    let shown = 0;
    const open = (el, anim) => { el.hidden = false; if (anim && !reducedMotion()) el.classList.add('m-enter'); };
    const finish = (focus) => { slot.remove(); key.hidden = false; ctx.complete(); ctx.unlockNext({ focus }); };
    btn.addEventListener('click', () => {
      const el = rows[shown++];
      open(el, true);
      el.after(slot);
      live.textContent = el.textContent;
      if (shown === rows.length) finish(true); else btn.focus();
    });
    if (ctx.revisit) { rows.forEach((r) => open(r, false)); shown = rows.length; finish(false); }
    else { open(rows[0], false); shown = 1; rows[0].after(slot); ctx.need(ui.footer.need.reveal); }
    return { unmount() {} };
  },
};
