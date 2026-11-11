// review.html: the whole lesson at a glance. Built at runtime from content/l4-slice.json (no generated
// file to keep in sync): one row per chapter in order, each screen a live thumbnail (an iframe of
// index.html?screen=ID&review=1 at 1280 x 720, scaled to 25%), loaded only when it nears the viewport.
// Under each: id, template, word count (red over 45). A click opens the screen full size in review
// mode in a new tab. Filters: All, one chapter, Over word limit, Paths (PP1). Review-only strings live here.
import { h, chapterNo, resolveChapterRefs } from '../util.js?v=d1af4854';
import { reviewOrder } from '../engine.js?v=d1af4854';
import { screenWords, MAX_SCREEN_WORDS, MAX_FEEDBACK_WORDS } from './words.js?v=d1af4854';
import { JOURNEYS, variantOf } from '../adapt.js?v=d1af4854';

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

// FX8: the review notes (this browser only; a private window or blocked storage just keeps them for the page)
const NOTES_KEY = 'l4-review-notes';
let notes = {};
try { notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') || {}; } catch { notes = {}; }
const noteCount = h('span', { class: 'rv-note-count' });
const paintCount = () => { const n = Object.keys(notes).length; noteCount.textContent = n ? `${n} note${n === 1 ? '' : 's'}` : 'No notes yet'; };
function saveNotes() { try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch { /* storage blocked: notes stay for this page */ } paintCount(); }
paintCount();
const notesText = () => order.filter((id) => notes[id]).map((id) => `${id}: ${notes[id].trim()}`).join('\n');
const copyBtn = h('button', { class: 'rv-filter rv-copy', type: 'button', onclick: async () => {
  const text = notesText();
  if (!text) { copyBtn.textContent = 'Nothing to copy'; setTimeout(() => { copyBtn.textContent = 'Copy notes'; }, 1500); return; }
  try { await navigator.clipboard.writeText(text); copyBtn.textContent = 'Copied'; } catch { prompt('Copy the notes:', text); }
  setTimeout(() => { copyBtn.textContent = 'Copy notes'; }, 1500);
} }, 'Copy notes');

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
  // FX8 (Noy: "hard to go screen by screen and tell you what to fix"): a note box under every screen,
  // kept in this browser; "Copy notes" in the header copies them all as one text to paste in the chat
  const note = h('textarea', { class: 'rv-note', rows: '2', placeholder: `Note on ${id} (optional)`, 'aria-label': `Note on ${id}` });
  note.value = notes[id] || '';
  note.addEventListener('input', () => { if (note.value.trim()) notes[id] = note.value; else delete notes[id]; saveNotes(); });
  const cell = h('div', { class: 'rv-cell', dataset: { over: String(over), chapter: s.chapter || 'none' } }, a, note);
  cards.set(id, { a, frame, over, cell });
  return cell;
};

// CO1: one row for the Wawiwa AI Coach (offline mode): its states on S04, and S21 locked, each a thumbnail
// of index.html?screen=ID&review=1&coach=STATE (src/coach/coach.js; review mode writes nothing)
const COACH = [['O3', 'demo', 'the demo on the goals screen'], ['S04', 'hint', 'closed + hint'], ['S04', 'open', 'open: line and chip'], ['S04', 'tip', 'after the chip: the tip'],
  ['S04', 'thinking', 'thinking (live run)'], ['S04', 'cap', 'cap reached (live run)'], ['S21', 'open', 'locked on the check']];
const coachCard = ([id, state, label]) => {
  const url = `index.html?screen=${id}&review=1&coach=${state}`;
  const frame = h('div', { class: 'rv-frame', dataset: { state: 'waiting' } },
    h('iframe', { title: `${id} coach ${state} thumbnail`, 'data-src': url, tabindex: '-1', 'aria-hidden': 'true' }));
  io.observe(frame);
  return h('a', { class: 'rv-card', href: url, target: '_blank', rel: 'noopener', dataset: { coach: state, screen: id }, 'aria-label': `Coach on ${id}: ${label}. Opens full size in a new tab.` },
    frame, h('span', { class: 'rv-meta' }, h('span', { class: 'rv-meta-id' }, id), h('span', { class: 'rv-meta-tpl' }, `coach · ${label}`)));
};
const coachRow = h('section', { class: 'rv-coach', 'aria-labelledby': 'rv-g-coach' },
  h('h2', { class: 'rv-coach-head', id: 'rv-g-coach' }, 'Coach (CO1, offline)', h('span', {}, 'tips only; thinking and cap are built for the live run')),
  // CO2: review mode never frames the live page, so this row shows the offline states only
  h('p', { class: 'rv-note rv-coach-live' }, "Live chat: Dor's page, framed only in the live lesson."),
  h('div', { class: 'rv-row' }, COACH.map(coachCard)));

// PP1: the Paths view (the "Paths" filter, or review.html#paths, #paths-3 for journey 3): the adaptive
// screens in lesson order, one row per level (Stretch, Core, Support), each cell a live thumbnail of
// index.html?screen=ID&level=LEVEL&review=1; the journey selector (1 to 5) marks the screens a learner on
// that journey sees, numbered in order.
const cps = content.lesson.adapt?.checkpoints || [];
const adaptive = content.lesson.slice.filter((id) => screens[id]?.variants);
const LEVEL_ROWS = [['stretch', 'Stretch'], ['core', 'Core'], ['support', 'Support']];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pathCells = [];
const pathCell = (id, level) => {
  const s = variantOf(screens[id], level);
  const w = screenWords(s, content);
  const url = `index.html?screen=${encodeURIComponent(id)}&level=${level}&review=1`;
  const frame = h('div', { class: 'rv-frame rv-frame-sm', dataset: { state: 'waiting' } },
    h('iframe', { title: `${id} ${level} thumbnail`, 'data-src': url, tabindex: '-1', 'aria-hidden': 'true' }));
  const step = h('span', { class: 'rv-path-step', hidden: true });
  const a = h('a', { class: 'rv-card rv-path-cell', href: url, target: '_blank', rel: 'noopener', dataset: { screen: id, level, on: 'false' },
    'aria-label': `${id}, ${level}, goal ${s.goal}, ${w.max} words. Opens full size in a new tab.` },
    frame, h('span', { class: 'rv-meta' }, step, h('span', { class: 'rv-meta-id' }, id), h('span', { class: 'rv-meta-tpl' }, `${level} · ${s.goal}` + (s.pilotCopy ? ' · pilot copy' : '')),
      h('span', { class: 'rv-meta-words', dataset: { over: String(!!s.wordLimit ? w.max > s.wordLimit.max : w.over) } }, `${w.max} w`)));
  io.observe(frame);
  pathCells.push({ a, step, id, level, cp: cps.findIndex((cp) => cp.chapter === s.chapter) });
  return a;
};
const pathNote = h('p', { class: 'rv-paths-note' }, 'Pick a journey to see the eight screens its learner meets, in order.');
const journeyButtons = [...Object.entries(JOURNEYS).map(([k, [a, b]]) => [k, `${k} · ${cap(a)} > ${cap(b)}`]), ['', 'Clear']].map(([k, label]) =>
  h('button', { class: 'rv-filter', type: 'button', 'aria-pressed': 'false', dataset: { journey: k }, onclick: () => pickJourney(k) }, label));
function pickJourney(k) {
  journeyButtons.forEach((b) => b.setAttribute('aria-pressed', String(!!k && b.dataset.journey === k)));
  const levels = JOURNEYS[k];
  pathCells.forEach((c) => {
    const on = !!levels && levels[c.cp] === c.level;
    c.a.dataset.on = String(on);
    c.step.hidden = !on;
    c.step.textContent = on ? String(adaptive.indexOf(c.id) + 1) : '';
  });
  pathNote.textContent = levels
    ? `Journey ${k}: ${cap(levels[0])} in Chapter ${chapterNo(content, cps[0].chapter)}, ${levels[1]} in Chapter ${chapterNo(content, cps[1].chapter)}. Marked screens, numbered in the order the learner meets them.`
    : 'Pick a journey to see the eight screens its learner meets, in order.';
}
const pathsSection = h('section', { class: 'rv-paths', hidden: true, 'aria-labelledby': 'rv-g-paths' },
  h('h2', { class: 'rv-coach-head', id: 'rv-g-paths' }, 'Paths (PP1)', h('span', {}, `${adaptive.length} adaptive screens x 3 levels · checkpoints: ${cps.map((cp) => `${cp.trackingId} entering Chapter ${chapterNo(content, cp.chapter)}`).join(', ')}`)),
  h('div', { class: 'rv-filters rv-journeys', role: 'group', 'aria-label': 'Journey' }, journeyButtons),
  pathNote,
  h('div', { class: 'rv-paths-scroll' }, pathsGrid()));
function pathsGrid() {
  const grid = h('div', { class: 'rv-paths-grid' },
    h('span', { class: 'rv-paths-corner' }),
    adaptive.map((id) => h('span', { class: 'rv-paths-col' }, `${id} · Ch ${chapterNo(content, screens[id].chapter)} · ${screens[id].goal}`)),
    LEVEL_ROWS.flatMap(([level, label]) => [h('span', { class: 'rv-paths-row' }, label), ...adaptive.map((id) => pathCell(id, level))]));
  grid.style.setProperty('--rv-cols', String(adaptive.length)); // through the CSSOM: the CSP blocks style attributes
  return grid;
}

const sections = groups.map((g) => h('section', { class: 'rv-chapter', dataset: { group: g.key }, 'aria-labelledby': 'rv-g-' + g.key },
  h('h2', { class: 'rv-chapter-head', id: 'rv-g-' + g.key }, g.label, h('span', {}, `${g.ids.length} screens` + (g.minutes ? ` · ${g.minutes} min` : ''))),
  h('div', { class: 'rv-row' }, g.ids.map(card))));
const overCount = [...cards.values()].filter((c) => c.over).length;

// filters
const filters = [{ key: 'all', label: 'All' }, ...groups.map((g) => ({ key: g.key, label: g.short })), { key: 'over', label: `Over word limit (${overCount})` },
  ...(adaptive.length ? [{ key: 'paths', label: 'Paths' }] : [])];
const empty = h('p', { class: 'rv-empty', hidden: true }, `No screen is over ${MAX_SCREEN_WORDS} words or has a line over ${MAX_FEEDBACK_WORDS}.`);
const buttons = filters.map((f) => h('button', { class: 'rv-filter', type: 'button', 'aria-pressed': String(f.key === 'all'), dataset: { kind: f.key }, onclick: () => apply(f.key) }, f.label));
function apply(key) {
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === key)));
  sections.forEach((sec) => {
    const g = sec.dataset.group;
    let shown = 0;
    sec.querySelectorAll(':scope .rv-row > :is(.rv-cell, .rv-card)').forEach((a) => {
      const on = key === 'all' || key === g || (key === 'over' && a.dataset.over === 'true');
      a.hidden = !on;
      const inner = a.querySelector(':scope > .rv-card'); if (inner) inner.hidden = !on; // (FX8: the card inside a note cell)
      if (on) shown++;
    });
    sec.hidden = !shown;
  });
  empty.hidden = !(key === 'over' && !overCount);
  coachRow.hidden = key !== 'all';
  pathsSection.hidden = key !== 'paths';
}

document.title = `L4 review · ${content.lesson.title}`;
root.append(
  h('header', { class: 'rv-head' },
    h('h1', { class: 'rv-title' }, `L4 review · ${content.lesson.title}`),
    h('p', { class: 'rv-summary' }, `${order.length} screens · ${groups.length} rows · `, h('b', { dataset: { over: String(overCount > 0) } }, `${overCount} over the word limit`),
      ` · content ${content.lesson.contentVersion}`),
    h('div', { class: 'rv-filters', role: 'group', 'aria-label': 'Filter screens' }, buttons),
    h('div', { class: 'rv-notes-bar' }, noteCount, copyBtn)),
  h('main', { class: 'rv-main' }, sections, coachRow, pathsSection, empty));

// review.html#S04 (the toolbar's Overview link): load and show that screen's card
const hash = decodeURIComponent(location.hash.slice(1));
const target = cards.get(hash);
if (target) { load(target.frame); target.a.scrollIntoView({ block: 'center' }); }
// review.html#paths, #paths-3: the Paths view (with journey 3 marked)
const paths = /^paths(?:-([1-5]))?$/.exec(hash);
if (paths && adaptive.length) { apply('paths'); if (paths[1]) pickJourney(paths[1]); }
