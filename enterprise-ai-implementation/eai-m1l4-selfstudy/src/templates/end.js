// End template (FX2 G, END after S22): a short branded closing screen in the films' end-card style,
// on the dark chapter photo under O1's veil, under the dark bar:
//   centre  the Wawiwa logo, the big line ("Lesson complete", its keyword in turquoise), the lesson and
//           module line, the status chip (Passed: turquoise with a check; Not passed yet: neutral, with
//           a one-line hint to retake from the check), no score or numbers; the next-step line and the
//           homework link (the content's, as S22's)
//   footer  Previous only: no Next
// A presentation screen: nothing is tracked, completion and status stay S22's (Finish).
import { h, resolveLink } from '../util.js?v=2d9f5392';
import { glyph, icon } from '../icons.js?v=2d9f5392';
import { layout } from './stage.js?v=2d9f5392';

export const end = {
  scene: () => 'end',
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    // the big line with its keyword in the brand accent
    const line = screen.instruction, k = screen.accent ? line.lastIndexOf(screen.accent) : -1;
    zones.instruction.replaceChildren(...(k < 0 ? [line] : [line.slice(0, k), h('span', { class: 'w-end-accent' }, screen.accent), line.slice(k + screen.accent.length)]));
    const passed = !!ctx.checkState().p;
    const st = passed ? screen.passed : screen.notPassed;
    const chip = h('p', { class: 'w-end-chip', dataset: { passed: String(passed) } },
      passed ? icon('check-circle', { size: 20.48 }) : null, h('span', {}, st.chip));
    const href = screen.homework ? resolveLink(content, screen.homework.href) : null;
    const homework = href ? h('a', { class: 'w-btn w-btn-ghost w-end-link', href, target: '_blank', rel: 'noopener noreferrer', dataset: { action: 'homework' } },
      h('span', {}, ui.buttons.openHomework), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')')) : null;
    layout(ctx, 'end', h('section', { class: 'w-end' },
      h('img', { class: 'w-end-logo', src: 'assets/logo/wawiwa-logo.png', alt: ui.logoAlt, width: '271', height: '102' }),
      zones.instruction,
      h('p', { class: 'w-end-sub' }, screen.sub),
      h('div', { class: 'w-end-status' }, chip, !passed && st.hint ? h('p', { class: 'w-end-hint' }, st.hint) : null),
      h('div', { class: 'w-end-next' }, h('p', { class: 'w-end-next-line' }, screen.next), homework)));
    zones.setFeedback({ state: 'idle' });
    zones.nextBtn.hidden = true; // Previous only
    return { unmount() { zones.nextBtn.hidden = false; } };
  },
};
