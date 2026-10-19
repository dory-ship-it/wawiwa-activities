// The shell of every screen (approved look, P1.5), in stage px:
//   rail      x 0 to 64, y 0 to 656    menu button, one dot per chapter, % done, Saved
//   main      1216 x 656 (x 64 to 1280, centred on a wider stage) the screen's own layout (built by its template)
//   footer    y 656 to 720             Previous left, Next right (locked grey or unlocked red)
// Parts a template places inside its layout: the logo, the instruction h1 (tabindex -1, focus lands
// here on every new screen) and the feedback band (aria-live polite, directly under the interaction,
// the width of the interaction area; its height is reserved so nothing moves when it changes).
// No learner-facing text here: every string arrives from the content JSON.
import { h, fmt } from './util.js';
import { icon, statusMark } from './icons.js';
import { attachTip, hide as hideTip } from './tooltip.js';

// notice = a message that is not an answer result (S02 empty Save): hint look, no state word.
const BAND_ICON = { hint: 'info', notice: 'info', neutral: 'check', pause: 'pause' };

export function createZones(stage, content, { onMenu, onChapter, onPrev, onNext }) {
  const ui = content.ui;

  /* ---- rail ---- */
  const menuBtn = h('button', { class: 'w-rail-menu', type: 'button', 'aria-label': ui.rail.openMenu, 'aria-haspopup': 'dialog', 'aria-expanded': 'false',
    onclick: () => onMenu(menuBtn) }, icon('rail-menu', { size: 22 }));
  const lineAll = h('span', { class: 'w-rail-line', 'aria-hidden': 'true' });
  const lineDone = h('span', { class: 'w-rail-line w-rail-line-done', 'aria-hidden': 'true' });
  const dots = h('ol', { class: 'w-rail-dots' });
  const percent = h('span', { class: 'w-rail-pct' });
  const savedText = h('span', { class: 'w-saved-text' });
  const saved = h('span', { class: 'w-saved', role: 'status' }, icon('check', { size: 16 }), savedText);
  const rail = h('nav', { class: 'w-rail', 'aria-label': ui.rail.label },
    menuBtn,
    h('div', { class: 'w-rail-track' }, lineAll, lineDone, dots),
    h('div', { class: 'w-rail-foot' }, h('p', { class: 'w-rail-done' }, percent, h('span', { class: 'w-rail-done-word' }, ui.rail.done)), saved));

  /* ---- main, logo, instruction ---- */
  const main = h('main', { class: 'w-main' });
  const logo = h('img', { class: 'w-logo', src: 'assets/logo/wawiwa-logo.png', alt: ui.logoAlt, width: '133', height: '50' });
  const instruction = h('h1', { class: 'w-instruction', id: 'w-instruction', tabindex: '-1' });

  /* ---- feedback band ---- */
  const bIcon = h('span', { class: 'w-band-icon' });
  const bSr = h('span', { class: 'w-sr-only' });
  const bVerdict = h('strong', { class: 'w-band-verdict' });
  const bText = h('span', { class: 'w-band-text' });
  const bLive = h('p', { class: 'w-band-live', 'aria-live': 'polite', 'aria-atomic': 'true' }, bSr, bVerdict, bText);
  const bActions = h('div', { class: 'w-band-actions' });
  const bTool = h('div', { class: 'w-band-tool' });
  const band = h('div', { class: 'w-band', dataset: { state: 'hint' } }, bIcon, bLive, bActions, bTool);

  // setFeedback({ state, text, verdict, actions }). state: hint | notice | correct | wrong | neutral | pause.
  // correct and wrong carry a verdict word (default ui.feedback.correctPrefix / wrongPrefix).
  // actions: [{ id, label, onClick }] secondary buttons in the band (FT1 routes); Next lives in the footer.
  function setFeedback({ state = 'hint', text = '', verdict = null, actions = [] } = {}) {
    band.dataset.state = state;
    const name = BAND_ICON[state];
    bIcon.replaceChildren(name ? icon(name, { size: 22 }) : '');
    bIcon.hidden = !name || !text;
    const v = verdict ?? (state === 'correct' ? ui.feedback.correctPrefix : state === 'wrong' ? ui.feedback.wrongPrefix : '');
    const sr = state === 'correct' ? ui.feedback.srCorrect : state === 'wrong' ? ui.feedback.srWrong : state === 'neutral' ? ui.feedback.srNeutral : '';
    bSr.textContent = sr ? sr + ' ' : '';
    bVerdict.textContent = v ? v + ' ' : '';
    bVerdict.hidden = !v;
    bText.textContent = text || '';
    bActions.replaceChildren(...actions.map((a) => h('button', { class: 'w-btn w-btn-ghost', type: 'button', onclick: a.onClick, dataset: { action: a.id || '' } }, a.label)));
    return bActions.querySelector('button');
  }
  // the band's persistent tool (Check, Skip): stays through state changes until the screen goes
  const setTool = (...els) => bTool.replaceChildren(...els);

  /* ---- footer ---- */
  const prevBtn = h('button', { class: 'w-prev', type: 'button', dataset: { action: 'previous' }, onclick: () => { if (prevBtn.getAttribute('aria-disabled') !== 'true') onPrev(); } },
    icon('chevron-left', { size: 18 }), h('span', {}, ui.footer.previous));
  const nextLock = icon('lock', { size: 16, className: 'w-next-lock' });
  const nextBtn = h('button', { class: 'w-next', type: 'button', dataset: { action: 'next' }, onclick: () => { if (nextBtn.dataset.locked !== 'true') onNext(); } },
    nextLock, h('span', {}, ui.footer.next));
  const footer = h('footer', { class: 'w-footer' }, prevBtn, h('span', { class: 'w-footer-gap' }), nextBtn);

  stage.append(rail, main, footer);

  // Next: locked = grey with a lock, aria-disabled, its aria-label says why; unlocked = red.
  function setNext(locked, why = '') {
    nextBtn.dataset.locked = String(locked);
    nextLock.style.display = locked ? '' : 'none';
    if (locked) { nextBtn.setAttribute('aria-disabled', 'true'); nextBtn.setAttribute('aria-label', why || ui.footer.locked.default); }
    else { nextBtn.removeAttribute('aria-disabled'); nextBtn.removeAttribute('aria-label'); }
  }
  function setPrev(enabled) {
    if (enabled) prevBtn.removeAttribute('aria-disabled'); else prevBtn.setAttribute('aria-disabled', 'true');
  }

  /* ---- rail model ---- */
  // model: { percent, frontier (index of the in-progress chapter), chapters: [{ n, status, label, clickable, viewing }] }
  const DOT_PITCH = 52; // 44 px button + 8 px gap
  function setRail(model) {
    hideTip();
    percent.textContent = fmt(ui.rail.percent, { p: model.percent });
    dots.replaceChildren(...model.chapters.map((c) => {
      const btn = h('button', { class: 'w-dot', type: 'button', dataset: { status: c.status, chapter: String(c.n) }, 'aria-label': c.label,
        'aria-current': c.viewing ? 'step' : null, 'aria-disabled': c.clickable ? null : 'true',
        onclick: () => { if (c.clickable) onChapter(c.n); } }, statusMark(c.status));
      attachTip(btn, c.label, { describe: false });
      return h('li', {}, btn);
    }));
    lineAll.style.height = (model.chapters.length - 1) * DOT_PITCH + 'px';
    lineDone.style.height = Math.max(0, model.frontier) * DOT_PITCH + 'px';
  }

  function setSaved(ok) {
    // shown only when saving fails: a working save needs no badge
    saved.dataset.ok = ok ? 'true' : 'false';
    saved.hidden = ok;
    savedText.textContent = ok ? ui.saved : ui.notSaved;
  }

  function clearScreen() {
    main.replaceChildren();
    main.removeAttribute('data-layout');
    setTool();
    setFeedback({ state: 'hint', text: '' });
  }

  return { rail, main, footer, logo, instruction, band, menuBtn, nextBtn, prevBtn, setFeedback, setTool, setNext, setPrev, setRail, setSaved, clearScreen };
}
