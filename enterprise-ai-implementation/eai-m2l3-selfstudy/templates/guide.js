// guide: what the use-case library is, and how to use it (EAI M2 L3, E1). Round 3 (25 Nov 2026, Noy: "first the
// left side, then after a few seconds the right side with the video, then the Open the library button under the video;
// the explanation must say what the library is and what to do"). Left: the heading, one line on what the library is
// and what the learner does with it, then the three steps of using it, numbered (a real sequence). Right, a moment
// later: the silent recording of the library page, then "Open the library" (new tab) under it. Motion once; none with
// reduced motion or a revisit (then everything is there at once). Presentation: Next is open.
// Content: eyebrow, lead, steps [text], video { src, poster, label, alt }, open { label, href }, delay (ms).
import { h, reducedMotion } from '../src/util.js?v=c6cdc63e';
import { icon } from '../src/icons.js?v=c6cdc63e';
import { layout, focusHead } from '../src/templates/stage.js?v=c6cdc63e';

export const guide = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const delay = screen.delay || 2600;
    const later = (el, ms) => { if (!still) { el.classList.add('m-lib-in'); el.style.setProperty('--d', ms + 'ms'); } return el; };
    const lead = later(h('p', { class: 'm-lib-lead' }, screen.lead), 200);
    const steps = h('ol', { class: 'm-lib-steps' }, screen.steps.map((t, i) => later(h('li', {}, h('span', { class: 'm-lib-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, t)), 700 + i * 450)));
    const open = h('a', { class: 'm-lib-open', href: ctx.content.links?.library || screen.open.href, target: '_blank', rel: 'noopener' },
      h('span', {}, screen.open.label), icon('external-link', { size: 22 }));
    const v = screen.video;
    const video = h('video', { class: 'm-lib-video', src: v.src, poster: v.poster, controls: '', muted: '', playsinline: '', preload: 'auto', 'aria-label': v.alt });
    video.muted = true;
    const right = later(h('figure', { class: 'm-lib-right' }, h('figcaption', {}, v.label), video, open), delay);
    let timer = 0;
    if (!still) timer = setTimeout(() => video.play().catch(() => {}), delay + 400);
    layout(ctx, 'libguide', h('div', { class: 'm-lib-left' }, focusHead(screen.eyebrow, 'overview', zones.instruction), lead, steps), right);
    zones.setHintVisible(false);
    return { unmount() { clearTimeout(timer); video.pause(); } };
  },
};
