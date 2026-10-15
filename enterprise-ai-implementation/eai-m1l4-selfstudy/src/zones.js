// The fixed zones of every screen (PRD section 6), in stage px:
//   top bar          y 0 to 56     logo, chapter label + progress bar, Saved, Menu
//   instruction line y 64 to 112   one h1 per screen (tabindex -1, focus lands here)
//   stage card       x 179 to 1101, y 120 to 584, slots top / middle / bottom
//   feedback row     x 179 to 1101, y 596 to 692, aria-live polite, Continue at its right
// No learner-facing text here: every string arrives from the content JSON through the engine.
import { h, fmt } from './util.js';
import { icon } from './icons.js';
import { attachTip, hide as hideTip } from './tooltip.js';

// notice = a neutral-tone message that is not an answer result (S02 empty Save): no state word.
const FEEDBACK_ICON = { hint: 'info', correct: 'check', wrong: 'x', neutral: 'check', notice: 'info', pause: 'pause' };

export function createZones(stage, content, { onMenu, onSegment }) {
  const ui = content.ui;

  /* ---- top bar ---- */
  const logo = h('img', { class: 'w-logo', src: 'assets/logo/wawiwa-logo.png', alt: ui.logoAlt, width: '90', height: '34' });
  const chapterTitle = h('span', { class: 'w-chapter-title' });
  const readout = h('span', { class: 'w-readout' });
  const minutes = h('span', { class: 'w-minutes' });
  const segments = h('div', { class: 'w-segments', role: 'group', 'aria-label': ui.progressBar.label });
  const centre = h('div', { class: 'w-topbar-centre' },
    h('p', { class: 'w-topbar-line' }, chapterTitle, readout, minutes),
    segments);
  const savedText = h('span', { class: 'w-saved-text' });
  const saved = h('span', { class: 'w-saved', role: 'status' }, icon('check', { size: 18 }), savedText);
  const menuBtn = h('button', { class: 'w-btn w-btn-secondary w-menu-btn', type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', onclick: () => onMenu(menuBtn) },
    icon('menu', { size: 20 }), ui.buttons.menu);
  const topbar = h('header', { class: 'w-topbar' }, logo, centre, h('div', { class: 'w-topbar-right' }, saved, menuBtn));

  /* ---- instruction, stage card, feedback row ---- */
  const instruction = h('h1', { class: 'w-instruction', id: 'w-instruction', tabindex: '-1' });
  const slots = { top: h('div', { class: 'w-slot w-slot-top' }), middle: h('div', { class: 'w-slot w-slot-middle' }), bottom: h('div', { class: 'w-slot w-slot-bottom' }) };
  const card = h('section', { class: 'w-card' }, slots.top, slots.middle, slots.bottom);

  const fbIcon = h('span', { class: 'w-fb-icon' });
  const fbSr = h('span', { class: 'w-sr-only' });
  const fbPrefix = h('strong', { class: 'w-fb-prefix' });
  const fbText = h('span', { class: 'w-fb-text' });
  const fbLive = h('p', { class: 'w-fb-live', 'aria-live': 'polite', 'aria-atomic': 'true' }, fbSr, fbPrefix, fbText);
  const pagerLabel = h('span', { class: 'w-pager-label' });
  const prevBtn = h('button', { class: 'w-icon-btn', type: 'button', 'aria-label': ui.feedback.prevFeedback }, icon('chevron-left', { size: 20 }));
  const nextBtn = h('button', { class: 'w-icon-btn', type: 'button', 'aria-label': ui.feedback.nextFeedback }, icon('chevron-right', { size: 20 }));
  const pager = h('div', { class: 'w-pager', hidden: true }, prevBtn, pagerLabel, nextBtn);
  const actions = h('div', { class: 'w-fb-actions' });
  const feedbackRow = h('div', { class: 'w-feedback', dataset: { state: 'hint' } }, fbIcon, fbLive, pager, actions);

  const main = h('main', { class: 'w-main' }, instruction, card, feedbackRow);
  stage.append(topbar, main);

  /* ---- feedback ---- */
  let pages = [], page = 0;
  function showPage() {
    const p = pages[page];
    feedbackRow.dataset.state = p.state;
    fbIcon.replaceChildren(icon(FEEDBACK_ICON[p.state] || 'info', { size: 26 }));
    fbIcon.hidden = !p.text; // a screen with no hint shows an empty row, no icon
    const prefix = p.state === 'correct' ? ui.feedback.correctPrefix : p.state === 'wrong' ? ui.feedback.wrongPrefix : '';
    const sr = p.state === 'correct' ? ui.feedback.srCorrect : p.state === 'wrong' ? ui.feedback.srWrong : p.state === 'neutral' ? ui.feedback.srNeutral : '';
    fbSr.textContent = sr ? sr + ' ' : '';
    fbPrefix.textContent = prefix ? prefix + ' ' : '';
    fbText.textContent = p.text || '';
    pager.hidden = pages.length < 2;
    pagerLabel.textContent = fmt(ui.feedback.pagedLabel, { i: page + 1, n: pages.length });
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page === pages.length - 1;
  }
  // A pager button that becomes disabled would drop keyboard focus: hand it to the other one.
  const turn = (d, from, to) => { page += d; showPage(); if (from.disabled && document.activeElement !== to) to.focus(); };
  prevBtn.addEventListener('click', () => { if (page > 0) turn(-1, prevBtn, nextBtn); });
  nextBtn.addEventListener('click', () => { if (page < pages.length - 1) turn(1, nextBtn, prevBtn); });

  // setFeedback({ state, text }) or setFeedback({ pages: [{ state, text }, ...] }), plus
  // actions: [{ label, primary, onClick }] for the Continue slot (one primary per screen).
  function setFeedback({ state = 'hint', text = '', pages: list = null, actions: acts = [] } = {}) {
    pages = list && list.length ? list : [{ state, text }];
    page = 0;
    showPage();
    actions.replaceChildren(...acts.map((a) => h('button', {
      class: 'w-btn ' + (a.primary ? 'w-btn-primary' : 'w-btn-secondary'), type: 'button', onclick: a.onClick, dataset: { action: a.id || '' },
    }, a.label)));
    return actions.querySelector('.w-btn-primary');
  }

  /* ---- progress bar ---- */
  // model: { title, readout, minutesLeft, chapters: [{ n, weight, done, total, status, current, clickable, marker, label, tip }] }
  function setProgress(model) {
    chapterTitle.textContent = model.title;
    readout.textContent = model.readout;
    minutes.textContent = model.minutesLeft;
    hideTip();
    segments.replaceChildren();
    for (const c of model.chapters) {
      const fill = h('span', { class: 'w-seg-fill' });
      fill.style.width = (c.total ? (100 * c.done) / c.total : 0) + '%';
      const bar = h('span', { class: 'w-seg-bar' }, fill);
      if (c.marker !== null && c.total) {
        const m = h('span', { class: 'w-seg-marker' });
        m.style.left = (100 * c.marker) / c.total + '%';
        m.style.width = 100 / c.total + '%';
        bar.append(m);
      }
      const btn = h('button', {
        class: 'w-seg', type: 'button', dataset: { status: c.status, chapter: String(c.n) },
        'aria-label': c.label, 'aria-current': c.current ? 'step' : null, 'aria-disabled': c.clickable ? null : 'true',
        onclick: () => { if (c.clickable) onSegment(c.n); },
      }, bar);
      btn.style.flexGrow = String(c.weight);
      segments.append(btn);
      attachTip(btn, c.tip, { describe: c.tip !== c.label });
    }
  }

  function setSaved(ok) {
    saved.dataset.ok = ok ? 'true' : 'false';
    savedText.textContent = ok ? ui.saved : ui.notSaved;
  }

  function clearScreen() {
    for (const s of Object.values(slots)) { s.replaceChildren(); s.hidden = false; }
    card.className = 'w-card';
    setFeedback({ state: 'hint', text: '' });
  }

  return { topbar, main, instruction, card, slots, feedbackRow, menuBtn, setFeedback, setProgress, setSaved, clearScreen };
}
