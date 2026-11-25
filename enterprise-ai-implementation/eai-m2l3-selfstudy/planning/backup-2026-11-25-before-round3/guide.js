// guide: what the use-case library is, and how to use it (EAI M2 L3, E1). Round 3 (25 Nov 2026, Noy: "first a short
// build-up on what the library is, then a screen recording, even with no words, of how you search it, and a big clear
// button to open it"). Left: the heading, then three short points that come in one after another (once; none with
// reduced motion or a revisit), then "Open the library" (new tab). Right: the silent recording of the library page
// (filters, the cases, the spotlights, the download), with its controls; it plays once on arrival, muted.
// Presentation: Next is open (the next screen sends the learner to the library).
// Content: eyebrow, points [{ art, text }], video { src, poster, label, alt }, open { label, href }.
import { h, reducedMotion } from '../src/util.js?v=34b6caae';
import { icon } from '../src/icons.js?v=34b6caae';
import { layout, focusHead } from '../src/templates/stage.js?v=34b6caae';
import { art } from './art.js?v=34b6caae';

export const guide = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const points = h('ol', { class: 'm-lib-points' }, screen.points.map((p, i) => {
      const li = h('li', { class: still ? '' : 'm-lib-in' }, h('span', { class: 'm-lib-art', 'aria-hidden': 'true' }, art(p.art, 28)), h('span', {}, p.text));
      li.style.setProperty('--d', (250 + i * 650) + 'ms');
      return li;
    }));
    const open = h('a', { class: 'm-lib-open', href: ctx.content.links?.library || screen.open.href, target: '_blank', rel: 'noopener' },
      h('span', {}, screen.open.label), icon('external-link', { size: 22 }));
    const v = screen.video;
    const video = h('video', { class: 'm-lib-video', src: v.src, poster: v.poster, controls: '', muted: '', playsinline: '', preload: 'metadata', 'aria-label': v.alt });
    video.muted = true;
    if (!still) video.addEventListener('loadeddata', () => { video.play().catch(() => {}); }, { once: true });
    layout(ctx, 'libguide',
      h('div', { class: 'm-lib-left' }, focusHead(screen.eyebrow, 'overview', zones.instruction), points, open),
      h('figure', { class: 'm-lib-right' }, h('figcaption', {}, v.label), video));
    zones.setHintVisible(false);
    return { unmount() { video.pause(); } };
  },
};
