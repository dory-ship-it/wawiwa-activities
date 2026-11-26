// tiers: the four levels of data sensitivity as a scale from open to closed (EAI M2 L3, H0; deck slide 14). Round 4
// (26 Nov 2026, Noy approved the sketch in planning/prototypes/round4.html, "darker: the see-through cards read less
// well"). A learn screen on the plain dark ground. A bar from open to closed, then the four tiers left to right, each a
// solid card: a drawing of a place that closes more (an open shelf, a cabinet, a locked door, a vault), the name, what
// is in it, and where an AI tool may run on it. The slide's line closes it. The tiers come in once, left to right;
// none with reduced motion or a revisit. Presentation: Next is open.
// Content: label, instruction, scale { open, closed }, runLabel, tiers [{ id, name, examples, run, draw }], keyLine.
import { h, reducedMotion } from '../src/util.js?v=044f9db2';
import { glyph } from '../src/icons.js?v=044f9db2';
import { layout } from '../src/templates/stage.js?v=044f9db2';

const NS = 'http://www.w3.org/2000/svg';
const DRAW = {
  shelf: '<path d="M6 6v66M86 6v66M6 28h80M6 52h80"/><rect x="14" y="10" width="8" height="18" class="f"/><rect x="25" y="13" width="8" height="15" class="f"/><rect x="50" y="34" width="8" height="18" class="f"/><rect x="61" y="36" width="10" height="16" class="f"/>',
  cabinet: '<rect x="14" y="4" width="64" height="70" rx="4"/><path d="M14 27h64M14 50h64M38 15h16M38 38h16M38 61h16"/>',
  door: '<rect x="20" y="4" width="52" height="70" rx="3"/><rect x="38" y="34" width="18" height="14" rx="3" class="f"/><path d="M41 34v-6a6 6 0 0 1 12 0v6"/>',
  vault: '<rect x="10" y="4" width="72" height="70" rx="8"/><circle cx="46" cy="39" r="18"/><path d="M46 21v36M28 39h36M33 26l26 26M59 26L33 52"/>',
};
const drawing = (name) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 92 78'); s.setAttribute('class', 'm-tier-draw'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = DRAW[name] || ''; return s; };

export const tiers = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const later = (el, ms) => { if (!still) { el.classList.add('m-tier-in'); el.style.setProperty('--d', ms + 'ms'); } return el; };
    const scale = later(h('div', { class: 'm-tier-scale', 'aria-hidden': 'true' }, h('span', {}, screen.scale.open), h('span', {}, screen.scale.closed)), 100);
    const cards = screen.tiers.map((t, i) => later(h('li', { class: 'm-tier', dataset: { tier: t.id } },
      drawing(t.draw), h('h2', { class: 'm-tier-name' }, t.name), h('p', { class: 'm-tier-ex' }, t.examples),
      h('p', { class: 'm-tier-run' }, h('span', {}, screen.runLabel), h('b', {}, t.run))), 400 + i * 450));
    const key = screen.keyLine ? later(h('p', { class: 'm-tier-key' }, screen.keyLine), 400 + screen.tiers.length * 450 + 200) : null;
    layout(ctx, 'tiers',
      h('div', { class: 'w-focus-head' }, h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)), zones.instruction),
      h('div', { class: 'm-tier-wrap' }, scale, h('ol', { class: 'm-tiers' }, cards), key));
    zones.setHintVisible(false);
    return { unmount() {} };
  },
};
