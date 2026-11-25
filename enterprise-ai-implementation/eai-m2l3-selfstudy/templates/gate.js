// gate: "Process before tool" (EAI M2 L3, C0; deck slide 5). Round 3 (25 Nov 2026, Noy: the chapter opened with no
// context, and two of the slide's ideas were missing). A learn screen on the dark ground: the one question to ask of
// every pain, as the screen's big line, then the slide's three ideas, one at a time ("Next idea"), each a small drawing
// and one short line (Noy: show, don't write):
//   1 a tool on a broken process: the flaw runs faster  (a crooked path, sped up)
//   2 if a process change solves it, that is the recommendation: Process Redesign, the fifth category, at the front
//   3 in doubt, show the steering committee both paths  (a fork)
// Motion: each idea comes in once; none with reduced motion or a revisit. Next unlocks after the third idea.
// Content: label, question, ideas [{ draw: crooked|front|fork, text }], button (a ui.buttons key).
import { h, reducedMotion } from '../src/util.js?v=c6cdc63e';
import { glyph } from '../src/icons.js?v=c6cdc63e';
import { layout } from '../src/templates/stage.js?v=c6cdc63e';
import { art } from './art.js?v=c6cdc63e';

const NS = 'http://www.w3.org/2000/svg';
const svgOf = (inner) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 200 110'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'm-gate-svg'); s.innerHTML = inner; return s; };
const DRAW = {
  // a crooked path with a fast arrow on it, and the flaw (a cross) at its bend
  crooked: () => svgOf('<path class="g-path" d="M10 80 L50 80 L70 30 L100 85 L130 40 L190 40"/><path class="g-fast" d="M150 22 l14 0 m-8 -7 l8 7 l-8 7 M138 22 l6 0 M130 22 l4 0"/><g class="g-flaw"><circle cx="100" cy="85" r="11"/><path d="M95 80 l10 10 m0 -10 l-10 10"/></g>'),
  // Process Redesign at the front, four tool categories behind it
  front: () => { const d = h('div', { class: 'm-gate-front' }, h('span', { class: 'g-first' }, art('redesign', 30)), h('span', { class: 'g-rest' }, art('agent', 20), art('automation', 20), art('bi', 20), art('docai', 20))); return d; },
  // one road that forks into two paths, both lit
  fork: () => svgOf('<path class="g-path" d="M10 55 L80 55"/><path class="g-path g-lit" d="M80 55 C110 55 120 22 150 22 L190 22"/><path class="g-path g-lit" d="M80 55 C110 55 120 88 150 88 L190 88"/><circle class="g-node" cx="80" cy="55" r="7"/>'),
};

export const gate = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const ideas = screen.ideas.map((x, i) => h('li', { class: 'm-gate-idea', hidden: true, dataset: { n: String(i + 1) } },
      h('span', { class: 'm-gate-draw' }, DRAW[x.draw]()), h('p', {}, x.text)));
    const btn = h('button', { class: 'm-why-btn m-gate-btn', type: 'button', dataset: { action: 'idea' } }, h('span', {}, ui.buttons[screen.button] || 'Next idea'));
    const live = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
    const head = h('div', { class: 'w-focus-head' },
      h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)), zones.instruction);
    layout(ctx, 'gate', head, h('div', { class: 'm-gate' }, h('p', { class: 'm-gate-q' }, screen.question), h('ol', { class: 'm-gate-ideas' }, ideas), btn), live);
    zones.setHintVisible(false);
    let shown = 0;
    const show = (anim) => {
      const el = ideas[shown++];
      el.hidden = false;
      if (anim && !still) el.classList.add('m-enter');
      live.textContent = el.textContent;
      if (shown === ideas.length) { btn.hidden = true; ctx.complete(); ctx.unlockNext({ focus: anim }); }
    };
    btn.addEventListener('click', () => { show(true); if (!btn.hidden) btn.focus(); });
    if (ctx.revisit) { while (shown < ideas.length) show(false); } else { show(false); ctx.need(ui.footer.need.gate); }
    return { unmount() {} };
  },
};
