// Chapters menu (approved look, R2-menu-open): a 380 px panel from the left over a grey scrim,
// role dialog, aria-modal, focus trapped, Escape closes, focus returns to the rail menu button.
// Panel: close button, "Module 1 · Lesson 4", lesson title, % complete with a thin teal bar, the
// chapter list (status icon, title, Done; the current chapter on teal-tint; no times), and a footer
// rows of text buttons: Lesson goals (O3's goals), Lesson 1 cases (new tab), Help, Start over.
// Also the in-page dialog used for Help, the Start over confirm and the resume prompt
// (never window.confirm).
import { h, fmt, resolveLink, trapTab, focusables } from './util.js';
import { icon, statusMark } from './icons.js';

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

export function createMenu(stage, content, { zones, getMenu, onChapter, onStartOver }) {
  const ui = content.ui;
  const m = ui.menu;
  let opener = null;
  let open = false;

  const closeBtn = h('button', { class: 'w-panel-close', type: 'button', 'aria-label': m.close, onclick: () => close() }, icon('x', { size: 22 }));
  const title = h('h2', { class: 'w-panel-title', id: 'w-menu-title' }, content.lesson.title);
  const pctText = h('span', { class: 'w-panel-pct' });
  const barFill = h('span', { class: 'w-panel-bar-fill' });
  const bar = h('div', { class: 'w-panel-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': m.progressLabel }, barFill);
  const list = h('ol', { class: 'w-chapters' });
  const goalsBtn = h('button', { class: 'w-panel-link', type: 'button', dataset: { action: 'goals' }, onclick: () => showGoals() }, m.goals);
  // the Lesson 1 cases (class practice) in a new tab; left out when content has no URL
  const casesHref = resolveLink(content, '@links.lesson1Cases');
  const casesLink = casesHref ? h('a', { class: 'w-panel-link', href: casesHref, target: '_blank', rel: 'noopener noreferrer', dataset: { action: 'lesson1Cases' } },
    h('span', {}, m.lesson1Cases), icon('external-link', { size: 14 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')')) : null;
  const helpBtn = h('button', { class: 'w-panel-link', type: 'button', dataset: { action: 'help' }, onclick: () => showHelp() }, m.help);
  const startOverBtn = h('button', { class: 'w-panel-link w-startover', type: 'button', dataset: { action: 'startover' }, onclick: () => confirmStartOver() }, m.startOver);

  const panel = h('div', { class: 'w-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': m.title },
    h('div', { class: 'w-panel-head' }, closeBtn, h('span', { class: 'w-panel-kicker' }, m.kicker)),
    title,
    h('div', { class: 'w-panel-progress' }, h('div', { class: 'w-panel-progress-line' }, pctText), bar),
    list,
    h('div', { class: 'w-panel-foot' },
      h('div', { class: 'w-panel-row' }, goalsBtn, casesLink), // the lesson's resources
      h('div', { class: 'w-panel-row' }, helpBtn, startOverBtn)));
  const overlay = h('div', { class: 'w-menu-overlay', hidden: true }, h('div', { class: 'w-menu-scrim', onclick: () => close() }), panel);
  stage.append(overlay);

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    trapTab(e, panel);
  });

  // model: { percent, chapters: [{ n, title, status, meta, label, clickable, current }] }
  function render() {
    const model = getMenu();
    pctText.textContent = fmt(m.complete, { p: model.percent });
    barFill.style.width = model.percent + '%';
    bar.setAttribute('aria-valuenow', String(model.percent));
    list.replaceChildren(...model.chapters.map((c) => h('li', {},
      h('button', { class: 'w-chapter', type: 'button', dataset: { status: c.status, chapter: String(c.n) }, 'aria-label': c.label,
        'aria-current': c.current ? 'step' : null, 'aria-disabled': c.clickable ? null : 'true',
        onclick: () => { if (c.clickable) { close(false); onChapter(c.n); } } },
      statusMark(c.status),
      h('span', { class: 'w-chapter-title' }, c.title),
      h('span', { class: 'w-chapter-meta' }, c.meta)))));
  }

  const inertShell = (on) => { zones.rail.inert = on; zones.main.inert = on; zones.footer.inert = on; };

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

  // the lesson's goals (O3's content), read only: the short label and the full goal
  function showGoals() {
    const list = h('ol', { class: 'w-dialog-list w-goals-list' }, getMenu().goals.map((g) => h('li', {},
      h('span', { class: 'w-goals-title' }, g.label),
      h('span', { class: 'w-goals-sub' }, g.text))));
    openDialog(stage, { text: m.goals, note: m.goalsIntro, body: list, opener: goalsBtn, inert: [panel], actions: closeAction });
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
