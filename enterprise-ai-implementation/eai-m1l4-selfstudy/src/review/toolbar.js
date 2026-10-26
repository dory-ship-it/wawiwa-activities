// The review toolbar (?review=1): a slim dark strip fixed at the window's top-right, outside the
// 1280 x 720 stage, so it never reads as learner UI. It shows the screen's id, its place in the review
// order, template, chapter and word count (red over 45), with every view and every hint / feedback
// line (red over 25) in a panel on hover, focus or click, and a link back to the review page.
// Review-only strings live here, not in the content: this folder is not part of the SCORM package.
// Hidden inside an iframe (the thumbnails on review.html carry their own labels).
import { h, chapterNo } from '../util.js?v=6ec78d4a';
import { screenWords, MAX_SCREEN_WORDS, MAX_FEEDBACK_WORDS } from './words.js?v=6ec78d4a';

const CSS = new URL('./review.css?v=6ec78d4a', import.meta.url).href;

export function createToolbar(lesson) {
  if (window.self !== window.top) return { show() {} };
  if (![...document.styleSheets].some((s) => s.href === CSS)) document.head.append(h('link', { rel: 'stylesheet', href: CSS }));

  const id = h('strong', { class: 'rv-id' });
  const pos = h('span', { class: 'rv-pos' });
  const tpl = h('span', { class: 'rv-tpl' });
  const chap = h('span', { class: 'rv-chap' });
  const count = h('button', { class: 'rv-words', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'rv-words-panel' });
  const panel = h('div', { class: 'rv-panel', id: 'rv-words-panel' });
  const overview = h('a', { class: 'rv-overview', href: 'review.html' }, 'Overview');
  const bar = h('aside', { class: 'rv-bar', 'aria-label': 'Review toolbar', dataset: { review: '' } },
    h('span', { class: 'rv-tag' }, 'Review'), id, pos, tpl, chap, h('span', { class: 'rv-words-wrap' }, count, panel), overview);
  count.addEventListener('click', () => count.setAttribute('aria-expanded', String(count.getAttribute('aria-expanded') !== 'true')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') count.setAttribute('aria-expanded', 'false'); });
  document.body.append(bar);

  return {
    el: bar,
    show(screenId) {
      const s = lesson.screens[screenId];
      if (!s) return;
      const c = lesson.chapters.find((x) => x.id === s.chapter);
      const w = screenWords(s, lesson.content);
      const i = lesson.order.indexOf(screenId);
      bar.dataset.screen = screenId;
      bar.dataset.over = String(w.over || w.longFeedback > 0);
      id.textContent = screenId;
      pos.textContent = `${i + 1}/${lesson.order.length}`;
      tpl.textContent = s.template + (s.variant ? ' / ' + s.variant : '');
      chap.textContent = c ? `Ch ${chapterNo(lesson.content, c.id)} · ${c.title}` : 'No chapter';
      count.textContent = `${w.max} words` + (w.longFeedback ? ` · ${w.longFeedback} long line${w.longFeedback > 1 ? 's' : ''}` : '');
      count.dataset.over = String(w.over);
      count.dataset.long = String(w.longFeedback > 0);
      overview.href = 'review.html#' + screenId;
      panel.replaceChildren(...[
        h('p', { class: 'rv-panel-head' }, `On screen (max ${MAX_SCREEN_WORDS}; instruction and buttons not counted)`),
        h('ul', { class: 'rv-list' }, w.views.map((v) => h('li', { dataset: { over: String(v.n > MAX_SCREEN_WORDS) } }, h('b', {}, String(v.n)), ' ', v.name))),
        w.limit ? h('p', { class: 'rv-note' }, `Allowance ${w.limit.max}: ${w.limit.why}`) : null,
        h('p', { class: 'rv-panel-head' }, `Hints and feedback lines (max ${MAX_FEEDBACK_WORDS})`),
        w.feedback.length
          ? h('ul', { class: 'rv-list' }, w.feedback.map((f) => h('li', { dataset: { over: String(f.over) } }, h('b', {}, String(f.n)), ' ', f.name.replace(screenId + ' ', ''), ': ', h('span', { class: 'rv-quote' }, f.text))))
          : h('p', { class: 'rv-note' }, 'None on this screen.'),
      ].filter(Boolean));
    },
  };
}
