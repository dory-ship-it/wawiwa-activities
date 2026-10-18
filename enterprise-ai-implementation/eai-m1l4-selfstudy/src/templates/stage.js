// Layout parts shared by the templates (approved look, P1.5). Each template builds its own layout
// (editorial, memo, work, form, wide, plain) inside zones.main from these parts, then places the shell's
// logo, instruction h1 and feedback band where its artboard puts them.
// The interaction area carries data-interaction; the band sits directly under it at its width.
import { h, nextId } from '../util.js';
import { icon } from '../icons.js';

// layout(ctx, name, ...children): set main's layout and fill it
export function layout(ctx, name, ...children) {
  ctx.zones.main.dataset.layout = name;
  ctx.zones.main.append(...children.flat().filter(Boolean));
}

// A screen image slot: content image object { src, alt, prompt, temp, position }.
// src null = nothing is drawn (never a grey box); temp images are marked data-temp for the check.
export function picture(image, className) {
  if (!image || !image.src) return null;
  const img = h('img', { class: 'w-photo ' + (className || ''), src: image.src, alt: image.alt || '', dataset: { temp: image.temp ? 'true' : 'false' } });
  if (image.position) img.style.objectPosition = image.position;
  return img;
}

// Small label with a short turquoise rule before it (S03, S02, placeholder)
export const ruleLabel = (text, className = '') => h('p', { class: ('w-label ' + className).trim() }, h('span', { class: 'w-rule', 'aria-hidden': 'true' }), h('span', {}, text));

// Privacy line (shield icon + text) with an id inputs point aria-describedby at
export function privacyLine(part) {
  const id = nextId('w-privacy');
  return { id, el: h('p', { class: 'w-privacy', id }, icon(part.icon || 'shield', { size: 20 }), h('span', {}, part.text)) };
}

// Progress dots (S04 cards, S08 rounds): done = teal fill, current = teal ring, to come = grey ring.
// One role img with a text label ("Card 2 of 5"); set(current, doneCount).
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
