// FX6 (Noy, 8 Nov 2026: "you centre the content wrongly; spread it smartly over the screen; nothing on
// top of the photos; a technology lesson; free hand"): the composer. After a question screen is built,
// its parts are laid out again over the whole stage, read left to right:
//   head   the instruction (first, largest), then its context: the context line, a quote or case card,
//          the tools ("Show me how", "Reopen workbook")
//   task   the screen's panel as a white card: the answers or fields, Check, then the feedback card
//          under it
//   photo  the screen's (or its chapter's) photo, framed, never under an object
// The look (screen.look) picks the arrangement:
//   text         head left, task right, no photo
//   framed       head left with the photo framed under it, task right
//   photo        the photo as a full column on the left; head and task stacked on the right
//   photo-right  the same, the photo on the right
//   none         the screen keeps its own layout (wide tasks: S18A, S19A)
// The templates are untouched: the composer only moves their elements (the references they keep stay
// valid), and the scene behind turns light (src/engine.js).
import { h } from './util.js?v=e59b9691';

const COMPOSED = { decision: true, input: true, warmup: true, handoff: true, check: true };
const HEAD = '.w-context, .w-label, .w-head-row, .w-instruction, .w-case-row, .w-handoff-head, .w-kc-head, .w-case-thumbs, .w-round-top, .w-open-head, .w-glass, .w-case-card, .w-q-chip';

export const composes = (screen) => COMPOSED[screen.template] && screen.look !== 'none';

export function compose(main, screen, photo) {
  const look = ['text', 'framed', 'photo', 'photo-right'].includes(screen.look) ? screen.look : 'text';
  const sheet = main.querySelector('.w-sheet');
  if (!sheet) return null;
  // the head: what stands outside the panel (a quote, a case card, S02's head), then the panel's own head parts
  const outside = [...main.children].filter((el) => el !== sheet && !el.contains(sheet));
  const wrap = [...main.children].find((el) => el !== sheet && el.contains(sheet)); // S02's .w-open
  const opened = wrap ? [...wrap.children].filter((el) => el !== sheet) : [];
  const inside = [...sheet.children].filter((el) => el.matches(HEAD));
  let head = [...outside, ...opened, ...inside];
  // the instruction first (Noy: read left to right, the task first), then the rest in its order
  const lead = head.find((el) => el.matches('.w-instruction') || el.querySelector('.w-instruction'));
  if (lead) head = [lead, ...head.filter((el) => el !== lead)];
  const headCol = h('div', { class: 'w-comp-head' }, head);
  const task = h('div', { class: 'w-comp-task' }, sheet);
  let figure = null;
  if (photo?.src && look !== 'text') {
    const img = h('img', { class: 'w-comp-img', src: photo.src, alt: '', dataset: photo.mirror ? { mirror: 'true' } : {} });
    if (photo.position) img.style.objectPosition = photo.position;
    figure = h('figure', { class: 'w-comp-photo', 'aria-hidden': 'true' }, img);
  }
  const comp = h('div', { class: 'w-comp', dataset: { look: figure ? look : 'text', layout: main.dataset.layout || '' } });
  if (look === 'framed' && figure) { headCol.append(figure); comp.append(headCol, task); }
  else if (figure) {
    const stack = h('div', { class: 'w-comp-stack' }, headCol, task);
    comp.append(...(look === 'photo-right' ? [stack, figure] : [figure, stack]));
  } else comp.append(headCol, task);
  main.replaceChildren(comp);
  main.dataset.composed = comp.dataset.look;
  return comp;
}
