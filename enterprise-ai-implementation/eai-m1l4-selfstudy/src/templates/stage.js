// Layout parts shared by the templates (approved look, P1.5). Each template builds its own layout
// (editorial, memo, work, form, plain) inside zones.main from these parts, then places the shell's
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

// Arrow keys move focus inside an option group (Tab still reaches every option): Left/Up back,
// Right/Down on.
export function arrowNav(container) {
  container.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (!step) return;
    const items = [...container.querySelectorAll('.w-opt')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const j = i + step;
    if (j < 0 || j >= items.length) return;
    e.preventDefault();
    items[j].focus();
  });
}
