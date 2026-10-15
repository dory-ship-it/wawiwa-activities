// DEV-ONLY stand-in for every slice screen until the P1 to P3 templates exist.
// Shows the screen's top line (from the content JSON), the hint in the feedback row and a
// Continue that marks the screen done, so routing, progress and the menu can be walked in P0.
import { h } from '../util.js';
import { icon } from '../icons.js';

export const placeholder = {
  mount({ screen, ui, zones, complete, next }) {
    const top = screen.stage?.top || screen.states?.brief?.stage?.top || null;
    zones.card.classList.add('w-card-placeholder');
    zones.slots.top.append(h('p', { class: 'w-dev-badge' }, screen.id));
    if (top && top.text) zones.slots.middle.append(h('p', { class: 'w-line' }, top.icon ? icon(top.icon, { size: 28 }) : null, h('span', {}, top.text)));
    zones.setFeedback({
      state: 'hint', text: screen.hint,
      actions: [{ id: 'continue', label: ui.buttons.continue, primary: true, onClick: () => { complete(); next(); } }],
    });
    return { unmount() {} };
  },
};
