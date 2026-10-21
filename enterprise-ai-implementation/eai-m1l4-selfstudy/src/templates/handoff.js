// Handoff template (S19), a Focus panel (styled by analogy; the screen's image waits for the media track).
//   brief   the activity title with its time chip, the instruction, four numbered steps, the coach
//           line and "Open workbook": a real link to the EXISTING workbook (content links, new tab,
//           rel noopener noreferrer). After it is opened the band says so and "I'm back" appears.
//   return  "I'm back" switches to the return state: its title, the metric field (250 max, counter),
//           the privacy line and Save. Empty Save = the hint as a notice; saved = the field's answer on
//           the tracking bus (fill-in, neutral), the band's saved line, Next.
// Opened and back are flags in suspend data, so a reload or LMS resume comes back to the right state.
import { h, resolveLink } from '../util.js';
import { icon, glyph } from '../icons.js';
import { layout, sheet, privacyLine } from './stage.js';
import { field } from './input.js';

export const handoff = {
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    const brief = screen.states.brief, back = screen.states.return;
    const href = resolveLink(content, screen.handoff.href);
    const top = brief.stage.top;

    /* ---- brief ---- */
    const title = h('p', { class: 'w-handoff-title' }, h('span', {}, top.text));
    const chip = top.chip ? h('p', { class: 'w-time-chip' }, h('span', {}, top.chip.text)) : null;
    const steps = h('ol', { class: 'w-steps' }, brief.stage.middle.items.map((s) => h('li', {}, h('span', { class: 'w-step-n', 'aria-hidden': 'true' }, String(s.n)), h('span', {}, s.text))));
    const coach = privacyLine(brief.stage.bottom);
    const open = h('a', { class: 'w-btn w-btn-action w-open', href, target: '_blank', rel: screen.handoff.rel, dataset: { action: 'open' } },
      h('span', {}, ui.buttons.open), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')'));
    const backBtn = h('button', { class: 'w-btn w-btn-ghost', type: 'button', dataset: { action: 'back' }, hidden: true }, ui.buttons.back);
    const briefTask = h('div', { class: 'w-handoff-task', dataset: { interaction: '' } }, steps, h('div', { class: 'w-actionbar' }, coach.el, h('div', { class: 'w-action' }, open, backBtn))); // Open workbook first (primary), then I'm back
    const briefView = h('div', { class: 'w-handoff-view' }, h('div', { class: 'w-handoff-head' }, title, chip), briefTask);

    /* ---- return ---- */
    const rTitle = h('p', { class: 'w-handoff-title' }, h('span', {}, back.stage.top.text));
    const privacy = privacyLine(back.stage.bottom);
    const announcer = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const f = back.fields[0];
    const ctl = field(f, ctx, privacy.id, announcer);
    const save = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'save' } }, ui.buttons.save);
    const returnTask = h('div', { class: 'w-handoff-task w-form-task', dataset: { interaction: '' } }, ctl.el, announcer, h('div', { class: 'w-actionbar' }, privacy.el, save));
    const returnView = h('div', { class: 'w-handoff-view', hidden: true }, h('div', { class: 'w-handoff-head' }, rTitle), returnTask);

    layout(ctx, 'focus', sheet('focus w-col-handoff', zones.instruction, briefView, returnView));

    const showBrief = () => {
      briefView.hidden = false; returnView.hidden = true;
      briefView.append(zones.band);
      zones.setFeedback({ state: 'hint', text: screen.hint });
      if (ctx.flags.get('o')) opened(false);
    };
    function opened(announce) {
      backBtn.hidden = false;
      if (announce) zones.setFeedback({ state: 'notice', text: brief.openFeedback });
    }
    function showReturn(focus) {
      briefView.hidden = true; returnView.hidden = false;
      returnView.append(zones.band);
      zones.setFeedback({ state: 'notice', text: back.backFeedback });
      if (focus) ctl.input.focus();
    }
    function saved(focus) {
      zones.setFeedback({ state: 'neutral', tone: 'correct', text: back.savedFeedback });
      ctx.unlockNext({ focus });
    }

    open.addEventListener('click', () => { ctx.flags.set('o', 1); opened(true); }); // the link itself opens the new tab
    backBtn.addEventListener('click', () => { ctx.flags.set('b', 1); showReturn(true); });
    save.addEventListener('click', () => {
      const v = ctl.input.value.trim();
      if (!v) { zones.setFeedback({ state: 'notice', text: back.emptyFeedback || screen.hint }); return; }
      ctl.input.value = v;
      ctl.input.dispatchEvent(new Event('input'));
      ctx.store.set(f.store, v);
      ctx.answer({ trackingId: f.trackingId, response: v, result: 'neutral' });
      ctx.complete();
      saved(true);
    });

    if (ctx.revisit) { showReturn(false); saved(false); }
    else if (ctx.flags.get('b')) showReturn(false);
    else showBrief();
    return { unmount() {} };
  },
};
