// DEV-ONLY demo screen (?demo=1, optional &fb=hint|correct|wrong|neutral|pause).
// Shows each feedback row state on a static stand-in for S03, so P0 can be checked before the
// templates exist. Every string is taken from the content JSON. P1 replaces this screen.
import { h } from './util.js';
import { icon } from './icons.js';
import { applyTerms } from './tooltip.js';

export const DEMO_STATES = ['hint', 'correct', 'wrong', 'neutral', 'pause'];

export const demo = {
  mount({ content, ui, zones, state }) {
    const s03 = content.screens.find((s) => s.id === 'S03');
    const s20 = content.screens.find((s) => s.id === 'S20');
    const ch1 = content.chapters.find((c) => c.id === s03.chapter);
    const fb = DEMO_STATES.includes(state) ? state : 'hint';
    const chosen = fb === 'correct' ? ['b', 'd'] : fb === 'wrong' ? ['a'] : [];

    zones.instruction.textContent = s03.instruction;
    const top = s03.stage.top;
    zones.slots.top.append(h('p', { class: 'w-line' }, icon(top.icon, { size: 28 }), h('span', {}, top.text)));
    zones.slots.middle.append(h('div', { class: 'w-demo-grid' }, s03.options.map((o) => {
      const result = chosen.includes(o.id) ? (o.correct ? 'correct' : 'wrong') : (chosen.length ? 'dim' : '');
      return h('div', { class: 'w-demo-option', dataset: { result } },
        icon(o.icon, { size: 28 }),
        h('span', {}, o.label),
        result === 'correct' ? icon('check', { size: 22, className: 'w-demo-mark' }) : result === 'wrong' ? icon('x', { size: 22, className: 'w-demo-mark' }) : null);
    })));
    applyTerms(zones.card, s03.terms, content.tooltips);

    const cont = [{ id: 'continue', label: ui.buttons.continue, primary: true, onClick: () => {} }];
    const byId = (id) => s03.options.find((o) => o.id === id);
    const q1 = s20.steps[0].rows[0];
    const states = {
      hint: { state: 'hint', text: s03.hint },
      correct: { pages: [{ state: 'correct', text: byId('b').feedback }, { state: 'correct', text: byId('d').feedback }], actions: cont },
      wrong: { state: 'wrong', text: byId('a').feedback },
      neutral: { state: 'neutral', text: q1.feedback.yes, actions: cont },
      pause: { state: 'pause', text: ch1.pauseMarker, actions: cont },
    };
    zones.setFeedback(states[fb]);
    return { unmount() {} };
  },
};
