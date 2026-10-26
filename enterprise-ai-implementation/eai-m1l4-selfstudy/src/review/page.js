// review.html: the whole lesson at a glance. Built at runtime from content/l4-slice.json (no generated
// file to keep in sync): one row per chapter in order, each screen a live thumbnail (an iframe of
// index.html?screen=ID&review=1 at 1280 x 720, scaled to 25%), loaded only when it nears the viewport.
// Under each: id, template, word count (red over 45). A click opens the screen full size in review
// mode in a new tab. Filters: All, one chapter, Over word limit. Review-only strings live here.
import { h, chapterNo, resolveChapterRefs } from '../util.js?v=2d9f5392';
import { reviewOrder } from '../engine.js?v=2d9f5392';
import { screenWords, MAX_SCREEN_WORDS, MAX_FEEDBACK_WORDS } from './words.js?v=2d9f5392';

const root = document.getElementById('review');
const res = await fetch(new URL('../../content/l4-slice.json', import.meta.url), { cache: 'no-cache' }); // asked fresh on every load
const content = resolveChapterRefs(await res.json()); // FX3: "{ch5}" -> 6, as in the lesson
const screens = Object.fromEntries(content.screens.map((s) => [s.id, s]));
const order = reviewOrder(content);

// chapters in order, then a row for any screen no chapter lists
const listed = new Set(content.chapters.flatMap((c) => c.screens));
const groups = [
  ...content.chapters.map((c) => ({ key: c.id, label: `Chapter ${chapterNo(content, c.id)} · ${c.title}`, short: `${chapterNo(content, c.id)} ${c.title}`, minutes: c.minutes, ids: c.screens.filter((id) => screens[id]) })),
  { key: 'none', label: 'Not in a chapter', short: 'No chapter', ids: order.filter((id) => !listed.has(id)) },
].filter((g) => g.ids.length);

// lazy thumbnails: an iframe gets its src when its frame comes within 400 px of the viewport
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  load(e.target);
}), { rootMargin: '400px 0px' });
function load(frame) {
  io.unobserve(frame);
  const f = frame.querySelector('iframe');
  if (f.getAttribute('src')) return;
  f.addEventListener('load', () => { frame.dataset.state = 'loaded'; }, { once: true });
  f.src = f.dataset.src;
}

const cards = new Map();
const card = (id) => {
  const s = screens[id];
  const w = screenWords(s, content);
  const over = w.over || w.longFeedback > 0;
  const url = `index.html?screen=${encodeURIComponent(id)}&review=1`;
  const tip = [...w.views.map((v) => `${v.name}: ${v.n} words`), ...w.feedback.filter((f) => f.over).map((f) => `${f.name}: ${f.n} words (max ${MAX_FEEDBACK_WORDS})`)].join('\n');
  const frame = h('div', { class: 'rv-frame', dataset: { state: 'waiting' } },
    h('iframe', { title: `${id} thumbnail`, 'data-src': url, tabindex: '-1', 'aria-hidden': 'true' }));
  const words = h('span', { class: 'rv-meta-words', dataset: { over: String(over) } },
    `${w.max} w` + (w.longFeedback ? ` · ${w.longFeedback} long` : ''));
  const a = h('a', { class: 'rv-card', id, href: url, target: '_blank', rel: 'noopener', title: tip, dataset: { over: String(over), chapter: s.chapter || 'none' },
    'aria-label': `${id}, ${s.template}, ${w.max} words${over ? ', over the limit' : ''}. Opens full size in a new tab.` },
    frame,
    h('span', { class: 'rv-meta' }, h('span', { class: 'rv-meta-id' }, id), h('span', { class: 'rv-meta-tpl' }, s.template + (s.variant ? ' / ' + s.variant : '')), words));
  io.observe(frame);
  cards.set(id, { a, frame, over });
  return a;
};

const sections = groups.map((g) => h('section', { class: 'rv-chapter', dataset: { group: g.key }, 'aria-labelledby': 'rv-g-' + g.key },
  h('h2', { class: 'rv-chapter-head', id: 'rv-g-' + g.key }, g.label, h('span', {}, `${g.ids.length} screens` + (g.minutes ? ` · ${g.minutes} min` : ''))),
  h('div', { class: 'rv-row' }, g.ids.map(card))));
const overCount = [...cards.values()].filter((c) => c.over).length;

// filters
const filters = [{ key: 'all', label: 'All' }, ...groups.map((g) => ({ key: g.key, label: g.short })), { key: 'over', label: `Over word limit (${overCount})` }];
const empty = h('p', { class: 'rv-empty', hidden: true }, `No screen is over ${MAX_SCREEN_WORDS} words or has a line over ${MAX_FEEDBACK_WORDS}.`);
const buttons = filters.map((f) => h('button', { class: 'rv-filter', type: 'button', 'aria-pressed': String(f.key === 'all'), dataset: { kind: f.key }, onclick: () => apply(f.key) }, f.label));
function apply(key) {
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === key)));
  sections.forEach((sec) => {
    const g = sec.dataset.group;
    let shown = 0;
    sec.querySelectorAll('.rv-card').forEach((a) => {
      const on = key === 'all' || key === g || (key === 'over' && a.dataset.over === 'true');
      a.hidden = !on;
      if (on) shown++;
    });
    sec.hidden = !shown;
  });
  empty.hidden = !(key === 'over' && !overCount);
}

document.title = `L4 review · ${content.lesson.title}`;
root.append(
  h('header', { class: 'rv-head' },
    h('h1', { class: 'rv-title' }, `L4 review · ${content.lesson.title}`),
    h('p', { class: 'rv-summary' }, `${order.length} screens · ${groups.length} rows · `, h('b', { dataset: { over: String(overCount > 0) } }, `${overCount} over the word limit`),
      ` · content ${content.lesson.contentVersion}`),
    h('div', { class: 'rv-filters', role: 'group', 'aria-label': 'Filter screens' }, buttons)),
  h('main', { class: 'rv-main' }, sections, empty));

// review.html#S04 (the toolbar's Overview link): load and show that screen's card
const target = cards.get(decodeURIComponent(location.hash.slice(1)));
if (target) { load(target.frame); target.a.scrollIntoView({ block: 'center' }); }
