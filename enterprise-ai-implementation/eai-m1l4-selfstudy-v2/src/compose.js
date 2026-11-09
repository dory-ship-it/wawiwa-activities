// FX7 (Noy, 8 Nov 2026, approved mock-ups planning/fx7-mockups/v4.html + v6-light): the original
// "Hybrid cinematic" look, rearranged. Every question screen is laid out again over the stage:
//   media  the left zone: the screen's photo full-bleed behind it (src/zones.js scene "fx7photo": nothing
//          sits on the photo but the translucent bar), or the video cases as a film strip on the blurred
//          chapter photo ("cases"); none on a wide screen
//   panel  one cream panel docked right at full height: the head (a quote, the context, the instruction),
//          the task (the answers or fields), the feedback as a message under them, and the bottom row
//          (Previous; Check or Save, which turns into Next in the same place; src/fx7.css)
// The media kind (fx7Media): "cases" when the screen has video cases, "wide" when its task needs the
// whole width (screen.look "wide"), else "photo". Screens this composer does not take (sorts, labels,
// flags, tiles, key ideas, the module map, S18A, S19A, S19B) sit in one wide cream panel on the blurred
// chapter photo (stage[data-fx7="wide"]); the title, the video and the end keep their own scenes.
// The templates are untouched: the composer only moves their elements (the references they keep stay valid).
import { h } from './util.js?v=77a89e51';

const COMPOSED = { decision: true, input: true, warmup: true, handoff: true, check: true };
const HEAD = '.w-context, .w-label, .w-head-row, .w-instruction, .w-case-row, .w-handoff-head, .w-kc-head, .w-round-top, .w-open-head, .w-glass, .w-case-card, .w-q-chip';

export const composes = (screen) => COMPOSED[screen.template] && screen.look !== 'none';
export const fx7Media = (screen) => (screen.look === 'wide' ? 'wide' : screen.cases?.some((c) => c.image?.src) ? 'cases' : 'photo');

export function compose(main, screen) {
  const media = fx7Media(screen);
  const sheet = main.querySelector('.w-sheet');
  if (!sheet) return null;
  // the head: what stands outside the panel (a quote, a case card, S02's head), then the panel's own head
  // parts, in the content's order (the approved frames: the quote, the context, then the instruction)
  const outside = [...main.children].filter((el) => el !== sheet && !el.contains(sheet));
  const wrap = [...main.children].find((el) => el !== sheet && el.contains(sheet)); // S02's .w-open
  const opened = wrap ? [...wrap.children].filter((el) => el !== sheet) : [];
  const inside = [...sheet.children].filter((el) => el.matches(HEAD));
  const head = h('div', { class: 'w-x-head' }, [...outside, ...opened, ...inside]);
  const panel = h('section', { class: 'w-x-panel' }, head, sheet);
  const comp = h('div', { class: 'w-x', dataset: { media, layout: main.dataset.layout || '' } });
  if (media === 'cases') {
    comp.append(h('div', { class: 'w-x-film' }, screen.cases.filter((c) => c.image?.src).map((c) => {
      const img = h('img', { src: c.image.src, alt: c.image.alt || '' });
      if (c.image.position) img.style.objectPosition = c.image.position; // (CSSOM: the strict CSP allows it)
      return h('figure', { class: 'w-x-case' }, img, h('figcaption', {}, c.label));
    })));
  }
  comp.append(panel);
  main.replaceChildren(comp);
  main.dataset.composed = media;
  return comp;
}
