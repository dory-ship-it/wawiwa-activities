// Character avatar slot (PRD section 6, Characters). One 120 px circle per character:
//   avatar.src null  -> placeholder: navy circle with the white initial (role img, alt from content)
//   avatar.src set   -> the real still, object-fit cover, alt from content
// Under it the character label and, for a fictional character, the "Fictional character" badge.
import { h } from './util.js';

export function avatar(character, { ui, label = character.label } = {}) {
  const a = character.avatar || {};
  const face = a.src
    ? h('img', { class: 'w-avatar-img', src: a.src, alt: a.alt || character.name, width: '120', height: '120' })
    : h('span', { class: 'w-avatar-ph', role: 'img', 'aria-label': a.alt || character.name },
      h('span', { 'aria-hidden': 'true' }, a.placeholder?.text || character.name.charAt(0)));
  return h('figure', { class: 'w-avatar' },
    h('div', { class: 'w-avatar-circle' }, face),
    h('figcaption', { class: 'w-avatar-caption' },
      h('span', { class: 'w-avatar-label' }, label),
      character.fictional ? h('span', { class: 'w-badge' }, ui.fictionalBadge) : null));
}
