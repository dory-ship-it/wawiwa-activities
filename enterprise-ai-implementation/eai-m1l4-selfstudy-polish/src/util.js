// Small DOM and string helpers shared by every module.

// h('button', { class: 'x', onclick: fn }, child, 'text', ...) builds an element.
// Attributes with null, undefined or false are skipped; true sets an empty attribute.
export function h(tag, attrs = {}, ...children) {
  const svg = tag === 'svg' || tag === 'path';
  const el = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// fmt('Screen {i} of {n}', { i: 3, n: 7 }) -> 'Screen 3 of 7'. Unknown keys stay as written.
export function fmt(str, vars = {}) {
  return String(str ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

// FX3: every chapter number on screen comes from one source, the chapter's place in content.chapters
// (index + 1: Intro = 1 ... Wrap-up = 7). chapterNo(content, 'ch5') -> 6.
export const chapterNo = (content, id) => content.chapters.findIndex((c) => c.id === id) + 1;
// "{ch5}" in any content string -> that chapter's number, once on load (the lesson and review.html), so
// no chapter number is typed in the text. An unknown chapter id stays as written.
export function resolveChapterRefs(content) {
  const fix = (v) => {
    if (typeof v === 'string') return v.replace(/\{(ch\d+)\}/g, (m, id) => (chapterNo(content, id) ? String(chapterNo(content, id)) : m));
    if (Array.isArray(v)) return v.map(fix);
    if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = fix(v[k]); return v; }
    return v;
  };
  return fix(content);
}

// '@links.workbook' -> the URL in content.links; anything else is returned as is.
export function resolveLink(content, href) {
  if (typeof href !== 'string' || !href.startsWith('@links.')) return href;
  return content.links?.[href.slice(7)] ?? null;
}

export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let uid = 0;
export const nextId = (prefix) => `${prefix}-${++uid}`;

// Tab-reachable elements inside a container, in DOM order.
export function focusables(root) {
  return [...root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.closest('[hidden], [inert]') && el.getClientRects().length > 0);
}

// Keep Tab and Shift+Tab inside a dialog.
export function trapTab(e, root) {
  if (e.key !== 'Tab') return;
  const list = focusables(root);
  if (!list.length) { e.preventDefault(); return; }
  const first = list[0], last = list[list.length - 1];
  if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
