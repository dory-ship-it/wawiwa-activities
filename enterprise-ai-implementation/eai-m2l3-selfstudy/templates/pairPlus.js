// pairPlus: the kit's decision "pair" (situations one at a time, a fork into the answers), with one addition (EAI M2 L3,
// C2 and E2; round 3, 25 Nov 2026, Noy: "the finished questions are not identical boxes, and you don't see that the
// third one is done"). When the last situation is answered, it too becomes a done box like the others, so the row ends
// as identical boxes, all ticked. The rest is the template's own (one try, the feedback card, Next).
// Three answers (C2: process, tool, or both paths) get a three-way fork in CSS (lesson.css, "three-way").
import { h } from '../src/util.js?v=c6cdc63e';
import { glyph } from '../src/icons.js?v=c6cdc63e';
import { decision } from '../src/templates/decision.js?v=c6cdc63e';

export const pairPlus = {
  scene: (screen) => decision.scene(screen),
  mount(ctx) {
    const list = ctx.screen.situations;
    let timer = 0;
    const finish = () => {
      const now = ctx.zones.main.querySelector('.w-situation-now');
      if (!now) return;
      const s = list[list.length - 1], o = s.options.find((x) => x.correct);
      now.replaceWith(h('div', { class: 'w-sit-done m-sit-last', role: 'group', 'aria-label': s.doneLabel },
        h('span', { class: 'w-sit-kicker' }, s.doneLabel),
        h('span', { class: 'w-sit-done-answer' }, h('span', { class: 'w-placed-disc', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 15.36 })), o.label)));
    };
    const c2 = Object.create(ctx);
    c2.complete = () => { ctx.complete(); clearTimeout(timer); timer = setTimeout(finish, ctx.revisit ? 0 : 900); };
    const inner = decision.mount(c2) || { unmount() {} };
    return { unmount() { clearTimeout(timer); inner.unmount?.(); } };
  },
};
