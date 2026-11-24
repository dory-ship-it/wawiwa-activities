// guide: how to use an outside page, on a real screenshot of it (EAI M2 L3, E1: the use-case library; Noy, 23 Nov
// 2026: "a short guide we photograph ourselves"). Left: the line and the numbered steps, then "Open the library"
// (new tab). Right: the screenshot with the same numbers placed on it. A step opens with its marker lit (click the
// step or the marker). Presentation: Next is open (the library is optional here; the next screen uses it).
// Content: eyebrow, text, steps [{ n, text, at: [x%, y%] }], image { src, alt }, open { label, href }.
import { h } from '../src/util.js?v=db863ef1';
import { icon } from '../src/icons.js?v=db863ef1';
import { layout, focusHead } from '../src/templates/stage.js?v=db863ef1';

export const guide = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, zones } = ctx;
    const markers = [], items = [];
    const select = (i) => {
      items.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
      markers.forEach((m, j) => { m.dataset.on = String(i === j); });
    };
    screen.steps.forEach((s, i) => {
      const b = h('button', { class: 'm-guide-step', type: 'button', 'aria-pressed': 'false' }, h('span', { class: 'm-guide-n', 'aria-hidden': 'true' }, String(s.n)), h('span', {}, s.text));
      b.addEventListener('click', () => select(i));
      items.push(b);
      // positions through the CSSOM: the lesson's CSP blocks style attributes
      const m = h('span', { class: 'm-guide-marker', 'aria-hidden': 'true' }, String(s.n));
      m.style.left = s.at[0] + '%'; m.style.top = s.at[1] + '%';
      markers.push(m);
    });
    const link = h('a', { class: 'm-guide-open', href: screen.open.href, target: '_blank', rel: 'noopener', dataset: { action: 'open' } }, h('span', {}, screen.open.label), icon('external-link', { size: 18 }));
    const shot = h('figure', { class: 'm-guide-shot' }, h('img', { src: screen.image.src, alt: screen.image.alt }), markers);
    layout(ctx, 'guide', focusHead(screen.eyebrow, 'explore', zones.instruction),
      h('div', { class: 'm-guide' },
        h('div', { class: 'm-guide-left' }, h('p', { class: 'm-guide-text' }, screen.text), h('div', { class: 'm-guide-steps' }, items), link),
        shot));
    zones.setHintVisible(false);
    select(0);
    return { unmount() {} };
  },
};
