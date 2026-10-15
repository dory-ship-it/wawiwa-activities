// DEV-ONLY stand-in for the slice screens whose templates come later (V1 in P2/P3, S19 and the
// S20 self-check in P3). Shows the screen id, a dev note, the screen's top line (from the content
// JSON), the hint in the feedback row and a Continue that marks the screen done, so routing and
// progress can be walked end to end. P3 removes this file.
import { h } from '../util.js';
import { icon } from '../icons.js';

// DEV-ONLY note, not learner-facing, deliberately kept out of the content file. Remove in P3.
const DEV_NOTE = 'Built in P2/P3';

export const placeholder = {
  mount({ screen, ui, zones, complete, next }) {
    const top = screen.stage?.top || screen.states?.brief?.stage?.top || null;
    zones.card.classList.add('w-card-placeholder');
    zones.slots.top.append(h('p', { class: 'w-dev-badge' }, screen.id + ' · ' + DEV_NOTE));
    if (top && top.text) zones.slots.middle.append(h('p', { class: 'w-line' }, top.icon ? icon(top.icon, { size: 28 }) : null, h('span', {}, top.text)));
    zones.setFeedback({
      state: 'hint', text: screen.hint,
      actions: [{ id: 'continue', label: ui.buttons.continue, primary: true, onClick: () => { complete(); next(); } }],
    });
    return { unmount() {} };
  },
};
