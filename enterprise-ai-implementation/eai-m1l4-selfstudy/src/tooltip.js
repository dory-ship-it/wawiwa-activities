// Tooltips: dotted-underline glossary terms and the progress-bar segment tips.
// Shown on hover or keyboard focus, hidden on Escape, linked with aria-describedby.
// One tip box per stage, positioned in stage px (the stage is scaled as a whole).
import { h, nextId } from './util.js';

let tipBox = null;
let stageEl = null;
let owner = null;

export function initTooltips(stage) {
  stageEl = stage;
  tipBox = h('div', { class: 'w-tip', role: 'tooltip', id: 'w-tip-live', hidden: true });
  stage.append(tipBox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && owner) { e.stopPropagation(); hide(); } }, true);
}

// Attach a tip to any element. The text is also kept in a hidden description node so
// screen readers read it through aria-describedby even when the tip is not shown
// (describe: false when the element's own label already says the same). container: where the
// hidden description goes (default: right after the element); a term inside a heading puts it
// outside, so the heading's own text stays the heading.
export function attachTip(el, text, { describe = true, container = null } = {}) {
  let desc = null;
  if (describe) {
    const id = nextId('w-desc');
    desc = h('span', { id, class: 'w-sr-only' }, text);
    if (container) container.append(desc); else el.after(desc);
    const prev = el.getAttribute('aria-describedby');
    el.setAttribute('aria-describedby', prev ? prev + ' ' + id : id);
  }
  const show = () => showFor(el, text);
  el.addEventListener('mouseenter', show);
  el.addEventListener('focus', show);
  el.addEventListener('mouseleave', () => { if (document.activeElement !== el) hide(el); });
  el.addEventListener('blur', () => hide(el));
  return desc;
}

function showFor(el, text) {
  if (!tipBox) return;
  owner = el;
  tipBox.textContent = text;
  tipBox.hidden = false;
  const s = stageEl.getBoundingClientRect();
  const scale = s.width / stageEl.offsetWidth || 1;
  const r = el.getBoundingClientRect();
  const x = (r.left - s.left + r.width / 2) / scale;
  const below = (r.bottom - s.top) / scale + 8;
  const w = tipBox.offsetWidth, ht = tipBox.offsetHeight;
  const left = Math.max(12, Math.min(stageEl.offsetWidth - w - 12, x - w / 2));
  const top = below + ht > stageEl.offsetHeight - 8 ? (r.top - s.top) / scale - ht - 8 : below;
  tipBox.style.left = left + 'px';
  tipBox.style.top = top + 'px';
}

export function hide(el) {
  if (!tipBox || (el && owner !== el)) return;
  tipBox.hidden = true;
  owner = null;
}

// Underline the first occurrence of each term (case-insensitive) inside root's text and give it
// its definition from content.tooltips. Each term is marked once per screen.
export function applyTerms(root, terms = [], tooltips = {}) {
  for (const term of terms) {
    const def = tooltips[term];
    if (!def) continue;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('.w-term, .w-sr-only, button, input, textarea') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const needle = term.toLowerCase();
    let node;
    while ((node = walker.nextNode())) {
      const i = node.nodeValue.toLowerCase().indexOf(needle);
      if (i < 0) continue;
      const after = node.splitText(i);
      after.splitText(term.length);
      const span = h('span', { class: 'w-term', tabindex: '0' }, after.nodeValue);
      after.replaceWith(span);
      attachTip(span, def, { container: root });
      break;
    }
  }
}
