// The chapters menu (createMenu, below) and the in-page dialog used for Help, the Start over confirm
// and the resume prompt (never window.confirm).
import { h, trapTab, focusables } from './util.js?v=bd7ed3c4';
import { glyph } from './icons.js?v=bd7ed3c4';

// In-page modal dialog. actions: [{ id, label, primary, cancel, onClick(close) }].
// body: optional extra node under the text. inert: elements made inert while open. Returns { close, root }.
export function openDialog(stage, { text, note = null, body = null, actions = [], opener = null, inert = [] }) {
  const textEl = h('p', { class: 'w-dialog-text', id: 'w-dialog-text' }, text);
  const noteEl = note ? h('p', { class: 'w-dialog-note', id: 'w-dialog-note' }, note) : null;
  const box = h('div', { class: 'w-dialog', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'w-dialog-text', 'aria-describedby': note ? 'w-dialog-note' : null },
    textEl, noteEl, body, h('div', { class: 'w-dialog-actions' }));
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
    row.append(h('button', { class: 'w-btn ' + (a.primary ? 'w-btn-action' : 'w-btn-ghost'), type: 'button', dataset: { action: a.id || '' }, onclick: () => a.onClick(close) }, a.label));
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

// Side menu (NL1, frame "O2 Side menu open"): a 358 px ivory panel from the left over a navy scrim,
// role dialog, aria-modal, focus trapped, Escape closes, focus returns to the bar's menu button.
// Panel: logo and close, the lesson title, the seven chapters with their status only (done = navy
// disc and check, current = numbered turquoise ring on a white row, to come = numbered outline). No
// resources, no times, no step lists. Help and Start over stay as two small links at the foot.
export function createMenu(stage, content, { zones, getMenu, onChapter, onStartOver }) {
  const ui = content.ui;
  const m = ui.menu;
  let opener = null;
  let open = false;

  const closeBtn = h('button', { class: 'w-panel-close', type: 'button', 'aria-label': m.close, onclick: () => close() }, glyph('g-close', { size: 28.16 }));
  const title = h('h2', { class: 'w-panel-title', id: 'w-menu-title' }, content.lesson.title);
  const list = h('ol', { class: 'w-chapters' });
  const helpBtn = h('button', { class: 'w-panel-link', type: 'button', dataset: { action: 'help' }, onclick: () => showHelp() }, m.help);
  const startOverBtn = h('button', { class: 'w-panel-link w-startover', type: 'button', dataset: { action: 'startover' }, onclick: () => confirmStartOver() }, m.startOver);

  const panel = h('div', { class: 'w-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': m.title },
    h('div', { class: 'w-panel-head' }, h('img', { class: 'w-panel-logo', src: 'assets/logo/wawiwa-logo.png', alt: ui.logoAlt, width: '271', height: '102' }), closeBtn),
    title,
    list,
    h('div', { class: 'w-panel-foot' }, helpBtn, startOverBtn));
  const overlay = h('div', { class: 'w-menu-overlay', hidden: true }, h('div', { class: 'w-menu-scrim', onclick: () => close() }), panel);
  stage.append(overlay);

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    trapTab(e, panel);
  });

  // model: { chapters: [{ n, title, status, label, clickable, current }] }; the disc shows n + 1 (Intro = 1)
  function render() {
    const model = getMenu();
    list.replaceChildren(...model.chapters.map((c) => h('li', {},
      h('button', { class: 'w-chapter', type: 'button', dataset: { status: c.status, chapter: String(c.n) }, 'aria-label': c.label,
        'aria-current': c.current ? 'step' : null, 'aria-disabled': c.clickable ? null : 'true',
        onclick: () => { if (c.clickable) { close(false); onChapter(c.n); } } },
      h('span', { class: 'w-menu-disc', 'aria-hidden': 'true' }, c.status === 'done' ? glyph('g-check', { size: 16.64 }) : String(c.no)),
      h('span', { class: 'w-chapter-title' }, c.title)))));
  }

  const inertShell = (on) => { zones.bar.inert = on; zones.main.inert = on; zones.footer.inert = on; };

  function openMenu(from) {
    opener = from || zones.menuBtn;
    render();
    overlay.hidden = false;
    open = true;
    inertShell(true);
    zones.menuBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }

  function close(returnFocus = true) {
    if (!open) return;
    overlay.hidden = true;
    open = false;
    inertShell(false);
    zones.menuBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus && opener) opener.focus();
  }

  const closeAction = [{ id: 'close', label: ui.buttons.close, cancel: true, onClick: (done) => done() }];

  function showHelp() {
    openDialog(stage, { text: m.help, body: h('ul', { class: 'w-dialog-list w-help' }, (ui.help || []).map((line) => h('li', {}, line))), opener: helpBtn, inert: [panel], actions: closeAction });
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
