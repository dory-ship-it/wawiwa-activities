// survive: the course's decision screen (the kit's decision template, variant single, one panel: the same screen as
// EAI M1 L4 S18) with one addition (EAI M2 L3, B2; deck slide 3). Round 2 of the chapter 2 redesign (24 Nov 2026,
// Noy: the floating cards and the quote at the top right broke the eye order and the template). Everything on the
// screen is the template's: the context line, the heading, the stacked answers, Check, one try, the feedback card.
// The addition sits inside that feedback card once the answer is checked: the chain of the right answer, four links
// (Pain, Person, Words, Meeting) that light one by one, and one line naming what stands behind it. One chain only,
// whatever the learner picked. The motion shows the idea (tracing back), once; none with reduced motion or a revisit.
// Content: everything the decision template's single variant reads, plus chain { label, links [text], trace }.
import { h, reducedMotion } from '../src/util.js?v=34b6caae';
import { glyph } from '../src/icons.js?v=34b6caae';
import { decision } from '../src/templates/decision.js?v=34b6caae';

export const survive = {
  scene: (screen) => decision.scene(screen),
  mount(ctx) {
    const { screen, zones } = ctx;
    const c = screen.chain;
    const still = reducedMotion() || ctx.revisit;
    const links = h('ol', { class: 'm-ch-links' }, c.links.map((label, i) => {
      const li = h('li', { class: 'm-ch-link' }, h('i', { 'aria-hidden': 'true' }, glyph('g-check-b', { size: 14 })), h('span', {}, label));
      li.style.setProperty('--d', (200 + i * 240) + 'ms');
      return li;
    }));
    const chain = h('div', { class: 'm-ch' + (still ? '' : ' m-ch-anim') },
      h('div', { class: 'm-ch-row' }, h('p', { class: 'm-ch-label' }, c.label), links), h('p', { class: 'm-ch-trace' }, c.trace));

    // the template's feedback card: the chain joins it when it shows an answer, and leaves it otherwise
    const strip = zones.band.querySelector('.w-strip-body');
    const sync = () => {
      const on = zones.band.dataset.strip === 'on' && ['correct', 'wrong'].includes(zones.band.dataset.state);
      if (on && !chain.isConnected) {
        strip.append(chain);
        // the panel stays centred with its feedback card (the template's own shift, now with the chain in the card)
        const sheet = zones.band.closest('.w-sheet');
        const card = zones.band.querySelector('.w-strip');
        if (sheet && card) sheet.style.setProperty('--fb-shift', (card.offsetHeight + 15.36) / 2 + 'px');
      } else if (!on && chain.isConnected) chain.remove();
    };
    const watch = new MutationObserver(sync);
    watch.observe(zones.band, { attributes: true, attributeFilter: ['data-strip', 'data-state'] });

    const inner = decision.mount(ctx) || { unmount() {} };
    sync();
    return { unmount() { watch.disconnect(); chain.remove(); inner.unmount?.(); } };
  },
};
