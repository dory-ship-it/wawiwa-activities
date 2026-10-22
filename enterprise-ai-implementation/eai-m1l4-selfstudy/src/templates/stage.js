// Layout parts shared by the templates, "Hybrid cinematic" look (NL1). One builder per repeated part
// of the frames (planning/design-reference/hybrid-cinematic/screens-intro-ch2.html):
//   sheet        the ivory panel: Stage = right of the photo, Focus = centred on the photo wash. It hugs
//                its content and is vertically centred between the bar and the footer; the band (hint
//                row and feedback strip) goes last in it, the strip flush to its bottom edges
//   glassKicker  the dark glass card's first row: task icon, label, turquoise chip
//   focusHead    a Focus screen's head: small teal label with its icon, then the h1
//   contextLine  the panel's first line (body copy above the heading)
//   answers      the white answer cards with their marker (radio circle, or a rounded square for
//                multi-select), and paint() for their selected / correct / wrong states
//   showMe       the "Show me" outline button with the hand
// Each template builds its own layout inside zones.main from these parts; layout() names it.
import { h, nextId } from '../util.js';
import { glyph } from '../icons.js';

// layout(ctx, name, ...children): set main's layout and fill it
export function layout(ctx, name, ...children) {
  ctx.zones.main.dataset.layout = name;
  ctx.zones.main.append(...children.flat().filter(Boolean));
}

// sheet('right w-sheet-46', ...children) or sheet('focus', ...): the panel
export const sheet = (kind, ...children) => h('section', { class: 'w-sheet ' + kind.split(' ').map((k) => (k.startsWith('w-') ? k : 'w-sheet-' + k)).join(' ') }, children);

export const glassKicker = (iconName, label, chip) => h('div', { class: 'w-glass-kicker' },
  glyph(iconName, { size: 28.16 }), h('span', { class: 'w-glass-label' }, label), chip ? h('span', { class: 'w-chip-dark' }, chip) : null);

export const focusHead = (eyebrow, iconName, instruction, ...more) => h('div', { class: 'w-focus-head' },
  eyebrow ? h('p', { class: 'w-eyebrow' }, glyph(iconName, { size: 23.04 }), h('span', {}, eyebrow)) : null, instruction, more);

export const contextLine = (text, extra = null) => (text ? h('p', { class: 'w-context' }, extra || text) : null);

// "First sentence. The rest." -> ['First sentence.', 'The rest.']
export const splitFirst = (t) => { const m = /^(.+?[.?!])\s+(\S[\s\S]*)$/.exec(String(t || '')); return m ? [m[1], m[2]] : [String(t || ''), '']; };

export const showMe = (label) => h('button', { class: 'w-showme', type: 'button', dataset: { action: 'showMe' } }, glyph('g-hand', { size: 24.32 }), h('span', {}, label));

// the answer card's marker states. result: 'correct' | 'wrong' | '' (plain; a pressed multi card
// shows its check). The marker carries the state word for screen readers.
export function paintAnswer(btn, result, ui) {
  btn.dataset.result = result;
  const mark = btn.querySelector('.w-opt-mark');
  if (!mark) return;
  if (result === 'correct') mark.replaceChildren(glyph('g-check-b', { size: 17.92, label: ui.feedback.correctPrefix }));
  else if (result === 'wrong') mark.replaceChildren(glyph('g-cross', { size: 16.64, label: ui.feedback.wrongPrefix }));
  else mark.replaceChildren(btn.getAttribute('aria-pressed') === 'true' ? glyph('g-check-b', { size: 17.92 }) : '');
}

// A screen image slot: content image object { src, alt, prompt, temp, position }.
// src null = nothing is drawn (never a grey box); temp images are marked data-temp for the check.
export function picture(image, className) {
  if (!image || !image.src) return null;
  const img = h('img', { class: 'w-photo ' + (className || ''), src: image.src, alt: image.alt || '', dataset: { temp: image.temp ? 'true' : 'false' } });
  if (image.position) img.style.objectPosition = image.position;
  return img;
}

// The explain band (the S08 frames' rules band): a white rounded band, its teal label, then numbered
// items. An item is a string (S08's three rules) or { term, text } (NL3: the term in bold, its
// definition after it; such a band lays its items out in a grid, each wrapping inside its cell);
// chain: true puts an arrow between the items (S11: Baseline, Target, Date). A band of a single
// item without a label (S14, S15: one definition) is the term and its definition on one line.
export function explainBand(b) {
  if (!b.items) {
    return h('p', { class: 'w-rules w-rules-def' }, h('b', { class: 'w-rules-label' }, b.term + ':'), ' ', h('span', {}, b.text));
  }
  const defs = b.items.some((x) => typeof x === 'object');
  const items = b.items.map((x, i) => h('span', { class: 'w-rule' }, h('span', { class: 'w-rule-n', 'aria-hidden': 'true' }, String(i + 1)),
    typeof x === 'object' ? h('span', { class: 'w-rule-body' }, h('b', {}, x.term + ':'), ' ', x.text) : x));
  const row = [];
  items.forEach((el, i) => row.push(i && b.chain ? glyph('g-arrow', { size: 19.2, className: 'w-rule-arrow' }) : null, el));
  const list = defs ? h('div', { class: 'w-rules-items', dataset: { n: String(items.length), chain: b.chain ? 'true' : null } }, row) : row;
  return h('div', { class: 'w-rules' + (defs ? ' w-rules-grid' : '') }, h('b', { class: 'w-rules-label' }, b.label), list);
}

// Small label line (the panel's lead-in on screens styled by analogy)
export const ruleLabel = (text, className = '') => h('p', { class: ('w-label ' + className).trim() }, h('span', {}, text));

// Privacy line (the frames' lock + text) with an id inputs point aria-describedby at; a part of kind
// "note" (NL3 S17B) is the same line without the lock
export function privacyLine(part) {
  const id = nextId('w-privacy');
  return { id, el: h('p', { class: 'w-privacy', id }, part.kind === 'note' ? null : glyph('g-lock', { size: 19.2 }), h('span', {}, part.text)) };
}

// Progress dots (S04 cards, S08 rounds, S21 items): done = teal fill, current = teal ring, to come =
// outline. One role img with a text label ("Card 2 of 5"); set(current, doneCount).
export function progressDots(n, labelOf) {
  const dots = Array.from({ length: n }, () => h('span', { class: 'w-dot-s' }));
  const el = h('div', { class: 'w-dots', role: 'img' }, dots);
  const set = (current, done) => {
    dots.forEach((d, i) => { d.dataset.state = i < done ? 'done' : i === current ? 'current' : ''; });
    el.setAttribute('aria-label', labelOf(Math.min(current, n - 1) + 1, n));
  };
  set(0, 0);
  return { el, set };
}

// FX1 B3: a presentation screen builds up on entry, once (not on a revisit): each element comes in
// `step` ms after the one before it (150 to 250), from `start`; a line ("line") draws from the left; a
// "pulse" element gets one soft ring. None with reduced motion (frame.css). Returns the time after the last.
export function buildUp(items, { start = 0, step = 200 } = {}) {
  let t = start;
  items.filter(Boolean).forEach((it) => {
    const [el, kind] = Array.isArray(it) ? it : [it, 'in'];
    if (!el) return;
    el.classList.add(kind === 'line' ? 'w-build-line' : kind === 'pulse' ? 'w-pulse-once' : 'w-build');
    el.style.setProperty('--b-delay', t + 'ms');
    t += kind === 'line' ? 300 : step;
  });
  return t;
}

// Arrow keys move focus inside an option group (Tab still reaches every option): Left/Up back,
// Right/Down on.
// cols > 1: a grid, Up/Down move by a row.
export function arrowNav(container, { selector = '.w-opt', cols = 1 } = {}) {
  container.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -1, ArrowUp: -cols, ArrowRight: 1, ArrowDown: cols }[e.key];
    if (!step) return;
    const items = [...container.querySelectorAll(selector)].filter((el) => !el.closest('[inert]'));
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const j = i + step;
    if (j < 0 || j >= items.length) return;
    e.preventDefault();
    items[j].focus();
  });
}
