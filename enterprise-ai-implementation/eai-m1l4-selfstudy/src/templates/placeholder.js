// DEV-ONLY stand-in for the slice screens whose templates come later (V1 in P2/P3, S19 and the
// S20 self-check in P3), in the shell's plain layout. Shows the screen id, a dev note, the
// instruction, the screen's top line (from the content JSON) and the hint in the band; Next is
// unlocked and marks the screen done, so routing and progress can be walked end to end.
// P3 removes this file.
import { h } from '../util.js';
import { layout } from './stage.js';

// DEV-ONLY note, not learner-facing, deliberately kept out of the content file. Remove in P3.
const DEV_NOTE = 'Built in P2/P3';

export const placeholder = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const top = screen.stage?.top || screen.states?.brief?.stage?.top || null;
    layout(ctx, 'plain',
      zones.logo,
      h('div', { class: 'w-plain', dataset: { interaction: '' } },
        h('p', { class: 'w-dev-badge' }, screen.id + ' · ' + DEV_NOTE),
        zones.instruction,
        top && top.text ? h('p', { class: 'w-plain-line' }, top.text) : null,
        zones.band));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    ctx.unlockNext({ onNext: () => { ctx.complete(); ctx.next(); } });
    return { unmount() {} };
  },
};
