// Stage card parts by role (content JSON screen.stage.top / middle / bottom, each with a kind).
// Every template fills the card through this, so content is always distributed by role across
// the card height (top, middle, bottom) and never lands as one text block in the middle.
import { h, nextId } from '../util.js';
import { icon } from '../icons.js';
import { avatar } from '../avatar.js';

// Fill zones.slots from screen.stage. Returns refs for the parts a template drives:
//   options: the option container, fields: the field container, action: the action slot
//   (bottom right), privacyId: id of the privacy line (inputs point aria-describedby at it).
export function renderStage(ctx, { cardClass = '' } = {}) {
  const { screen, zones } = ctx;
  if (cardClass) zones.card.classList.add(...cardClass.split(' '));
  const refs = { options: null, fields: null, action: null, privacyId: null, link: null };
  for (const role of ['top', 'middle', 'bottom']) {
    const part = screen.stage?.[role];
    if (part) zones.slots[role].append(renderPart(part, ctx, refs));
  }
  return refs;
}

function renderPart(part, ctx, refs) {
  const { content, ui } = ctx;
  switch (part.kind) {
    case 'character': {
      const ch = content.characters[part.character];
      return h('div', { class: 'w-character' },
        avatar(ch, { ui, label: part.label || ch.label }),
        h('div', { class: 'w-bubbles' }, (part.bubbles || []).map((b) => h('p', { class: 'w-bubble' }, b))));
    }
    case 'line':
      return h('p', { class: 'w-line' }, part.icon ? icon(part.icon, { size: 28 }) : null, h('span', {}, part.text));
    case 'question':
      return h('p', { class: 'w-question' }, part.text);
    case 'options': {
      refs.options = h('div', { class: 'w-options', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { arrange: part.arrange || 'row' } });
      if (!part.link) return refs.options;
      refs.link = h('div', { class: 'w-linkrow' });
      return h('div', { class: 'w-options-block' }, refs.options, refs.link);
    }
    case 'fields':
      refs.fields = h('div', { class: 'w-fields', dataset: { arrange: part.arrange || 'stack' } });
      return refs.fields;
    case 'privacy': {
      refs.privacyId = nextId('w-privacy');
      refs.action = h('div', { class: 'w-action' });
      return h('div', { class: 'w-actionbar' },
        h('p', { class: 'w-privacy', id: refs.privacyId }, icon(part.icon || 'shield', { size: 24 }), h('span', {}, part.text)),
        refs.action);
    }
    case 'action':
      refs.action = h('div', { class: 'w-action' });
      return h('div', { class: 'w-actionbar w-actionbar-end' }, refs.action);
    default:
      return h('div', {});
  }
}

// Arrow keys move focus inside an option group (Tab still reaches every option).
// cols = 1 per row for a row layout (Left/Up back, Right/Down on), 2 for the 2x2 grid.
export function arrowNav(container, cols) {
  container.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: cols > 1 ? -cols : -1, ArrowDown: cols > 1 ? cols : 1 }[e.key];
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
