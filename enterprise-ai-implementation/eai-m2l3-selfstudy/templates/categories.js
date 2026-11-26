// categories: the solution categories, all open, as deck slide 6 shows them, with Process Redesign at the front (deck
// slide 5: "the fifth category, at the front"). EAI M2 L3, D1. Round 3 (25 Nov 2026, Noy: the slide shows four cards
// together, D1 had closed tiles; the fifth pile in D2 came from nowhere; make it attractive, a real photo per card).
// A presentation screen on the light ground, centred: the Process Redesign card first (its own look and a tag:
// before any tool), an arrow, then the four tool categories, each with its photo, its name and one line. The cards come
// in once, in reading order (the order of the decision: process first, then a tool); none with reduced motion.
// Content: instruction, cards [{ id, name, line, photo: { src, position }, tag, first }].
import { h, reducedMotion } from '../src/util.js?v=044f9db2';
import { layout } from '../src/templates/stage.js?v=044f9db2';

export const categories = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const card = (c, i) => {
      const img = h('img', { class: 'm-cat-photo', src: c.photo.src, alt: '' });
      if (c.photo.position) img.style.objectPosition = c.photo.position;
      const el = h('li', { class: 'm-cat' + (c.first ? ' m-cat-first' : ''), dataset: { cat: c.id } },
        img, c.tag ? h('span', { class: 'm-cat-tag' }, c.tag) : null,
        h('b', { class: 'm-cat-name' }, c.name), h('span', { class: 'm-cat-line' }, c.line));
      if (!still) { el.classList.add('m-cat-in'); el.style.setProperty('--d', (i === 0 ? 0 : 450 + (i - 1) * 140) + 'ms'); }
      return el;
    };
    const [first, ...rest] = screen.cards;
    const arrow = h('li', { class: 'm-cat-arrow', 'aria-hidden': 'true' }, h('i'));
    if (!still) { arrow.classList.add('m-cat-in'); arrow.style.setProperty('--d', '260ms'); }
    layout(ctx, 'categories', h('div', { class: 'm-cats-wrap' }, h('div', { class: 'w-focus-head m-cats-head' }, zones.instruction),
      h('ol', { class: 'm-cats' }, card(first, 0), arrow, rest.map((c, i) => card(c, i + 1)))));
    zones.setHintVisible(false);
    return { unmount() {} };
  },
};
