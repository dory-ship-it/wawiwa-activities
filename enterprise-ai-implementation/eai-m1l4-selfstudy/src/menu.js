// Menu: a modal side panel (role dialog, aria-modal, focus trapped, Escape closes, focus returns
// to the Menu button) with the chapter map, resources, help and Start over.
// Also the in-page dialog used for the Start over confirm and the resume prompt (never window.confirm).
import { h, fmt, resolveLink, trapTab, focusables } from './util.js';
import { icon } from './icons.js';

const STATUS_ICON = { done: 'check', current: 'map', locked: 'lock', notInPilot: 'lock' };

// In-page modal dialog. actions: [{ id, label, primary, onClick(close) }].
// inert: elements made inert while open. Returns { close, root }.
export function openDialog(stage, { text, note = null, actions = [], opener = null, inert = [] }) {
  const textEl = h('p', { class: 'w-dialog-text', id: 'w-dialog-text' }, text);
  const noteEl = note ? h('p', { class: 'w-dialog-note', id: 'w-dialog-note' }, note) : null;
  const box = h('div', { class: 'w-dialog', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'w-dialog-text', 'aria-describedby': note ? 'w-dialog-note' : null },
    textEl, noteEl, h('div', { class: 'w-dialog-actions' }));
  const overlay = h('div', { class: 'w-dialog-overlay' }, box);
  const wasInert = inert.map((el) => el.inert);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    overlay.remove();
    inert.forEach((el, i) => { el.inert = wasInert[i]; });
    if (opener && opener.isConnected) opener.focus();
  };
  const row = box.querySelector('.w-dialog-actions');
  for (const a of actions) {
    row.append(h('button', { class: 'w-btn ' + (a.primary ? 'w-btn-primary' : 'w-btn-secondary'), type: 'button', dataset: { action: a.id || '' }, onclick: () => a.onClick(close) }, a.label));
  }
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); const cancel = actions.find((a) => a.cancel); if (cancel) cancel.onClick(close); else close(); }
    trapTab(e, box);
  });
  inert.forEach((el) => { el.inert = true; });
  stage.append(overlay);
  // focus the safe choice first: the cancel action if there is one, else the first button
  const first = [...row.children].find((b, i) => actions[i].cancel) || row.firstElementChild;
  first?.focus();
  return { close, root: overlay };
}

export function createMenu(stage, content, { zones, getMap, onGoScreen, onStartOver }) {
  const ui = content.ui;
  const m = ui.menu;
  let opener = null;
  let open = false;

  const title = h('h2', { class: 'w-panel-title', id: 'w-menu-title' }, m.title);
  const closeBtn = h('button', { class: 'w-btn w-btn-secondary w-panel-close', type: 'button', onclick: () => close() }, icon('x', { size: 20 }), ui.buttons.close);
  const mapList = h('ol', { class: 'w-chapters' });
  const resources = h('ul', { class: 'w-resources' }, (ui.resources || []).map((r) => {
    const href = resolveLink(content, r.href);
    if (!href) return h('li', { class: 'w-resource w-resource-off' }, icon('lock', { size: 18 }), h('span', {}, r.label), r.note ? h('span', { class: 'w-muted' }, r.note) : null);
    return h('li', { class: 'w-resource' },
      h('a', { href, target: r.newTab ? '_blank' : null, rel: r.newTab ? 'noopener noreferrer' : null },
        r.label, r.newTab ? h('span', { class: 'w-newtab' }, icon('external-link', { size: 16 }), h('span', { class: 'w-newtab-text' }, ui.newTabNote)) : null));
  }));
  const help = h('ul', { class: 'w-help' }, (ui.help || []).map((line) => h('li', {}, line)));
  const startOverBtn = h('button', { class: 'w-btn w-btn-secondary w-startover', type: 'button', onclick: () => confirmStartOver() }, icon('rotate-ccw', { size: 20 }), m.startOver);

  const panel = h('div', { class: 'w-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'w-menu-title' },
    h('div', { class: 'w-panel-head' }, title, closeBtn),
    h('div', { class: 'w-panel-body' },
      h('section', { class: 'w-panel-section', 'aria-labelledby': 'w-menu-map' }, h('h3', { id: 'w-menu-map' }, m.chapterMap), mapList),
      h('section', { class: 'w-panel-section', 'aria-labelledby': 'w-menu-res' }, h('h3', { id: 'w-menu-res' }, m.resources), resources),
      h('section', { class: 'w-panel-section', 'aria-labelledby': 'w-menu-help' }, h('h3', { id: 'w-menu-help' }, m.help), help),
      h('div', { class: 'w-panel-section' }, startOverBtn)));
  const overlay = h('div', { class: 'w-menu-overlay', hidden: true }, h('div', { class: 'w-menu-scrim', onclick: () => close() }), panel);
  stage.append(overlay);

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    trapTab(e, panel);
  });

  function renderMap() {
    const statusWord = { done: m.done, current: m.current, locked: m.locked, notInPilot: m.notInPilot };
    mapList.replaceChildren(...getMap().map((c) => {
      const screens = c.screens.length ? h('ul', { class: 'w-screens', 'aria-label': fmt(m.screensOf, { title: c.title }) }, c.screens.map((s) => {
        const inner = [h('span', { class: 'w-screen-mark' }, s.done ? icon('check', { size: 16 }) : null), h('span', { class: 'w-screen-label' }, s.label),
          s.done ? h('span', { class: 'w-sr-only' }, ', ' + m.screenDone) : null];
        return h('li', { class: 'w-screen', dataset: { done: String(s.done), here: String(s.here) } },
          s.clickable
            ? h('button', { class: 'w-screen-btn', type: 'button', 'aria-current': s.here ? 'page' : null, onclick: () => { close(false); onGoScreen(s.id); } }, inner)
            : h('span', { class: 'w-screen-btn', 'aria-disabled': 'true' }, inner));
      })) : null;
      return h('li', { class: 'w-chapter', dataset: { status: c.status } },
        h('div', { class: 'w-chapter-head' },
          h('span', { class: 'w-chapter-icon' }, icon(STATUS_ICON[c.status] || 'lock', { size: 18 })),
          h('span', { class: 'w-chapter-name' }, h('span', { class: 'w-chapter-n' }, fmt(ui.chapterLabel, { n: c.n })), ' ', h('strong', {}, c.title)),
          h('span', { class: 'w-chapter-min' }, fmt(m.minutes, { m: c.minutes })),
          h('span', { class: 'w-chapter-status' }, statusWord[c.status])),
        screens);
    }));
  }

  function openMenu(from) {
    opener = from || zones.menuBtn;
    renderMap();
    overlay.hidden = false;
    open = true;
    zones.topbar.inert = true;
    zones.main.inert = true;
    zones.menuBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }

  function close(returnFocus = true) {
    if (!open) return;
    overlay.hidden = true;
    open = false;
    zones.topbar.inert = false;
    zones.main.inert = false;
    zones.menuBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus && opener) opener.focus();
  }

  function confirmStartOver() {
    openDialog(stage, {
      text: ui.startOverConfirm,
      note: ui.startOverLmsNote,
      opener: startOverBtn,
      inert: [panel],
      actions: [
        { id: 'cancel', label: ui.buttons.cancel, cancel: true, onClick: (done) => done() },
        { id: 'startover', label: ui.buttons.startOver, primary: true, onClick: (done) => { done(); close(false); onStartOver(); } },
      ],
    });
  }

  return { open: openMenu, close, isOpen: () => open, panel, focusables: () => focusables(panel) };
}
