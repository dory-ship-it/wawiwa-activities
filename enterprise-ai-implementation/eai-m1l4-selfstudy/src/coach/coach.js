// The Wawiwa AI Coach (CO1, offline mode): a launcher in the top bar on every screen and a chat panel
// that docks left or right inside the stage (stage px; the stage scales as a whole):
//   launcher  in the bar right after the chapter name: a 56 px white disc, the robot face, 3 px turquoise
//             ring; locked on the knowledge check (S21: 60% opacity, grey ring, a lock badge)
//   panel     340 wide, as high as its content (at most 536), top 96, 24 from the left (dock l) or the
//             right (dock r): y 96 to 632, so it never covers the bar or reaches Previous / Next. Above
//             main and the footer, below the menu and dialogs. A non-modal dialog; Escape closes it and
//             the focus goes back to the launcher. Drag it by the grip (it snaps to the nearer dock) or
//             press Arrow Left / Right on the grip.
//   hint      once, on the first screen after O1: "Stuck? Ask me." beside the launcher, with "Got it"
// Offline only: the panel shows the screen type's opening line, then (transport.js answers
// { offline: true }) the offline notice and the screen's tip (content: screen.coach.tip, copied from
// the screen's hint or drafted). The input stays disabled and the chips hidden until the live run.
// Never reported: no SCORM call, no interaction. The coach keeps two things in the lesson state, in
// memory only (they go out with the lesson's next regular save): the dock (state.g.cd = 'r', left is
// the default and left out) and the first-use hint (letter 'a' in state.h; 'c' is the choice ghost's).
// Nothing the learner types is kept anywhere. Review mode (?review=1) writes nothing; ?coach=hint |
// open | right | thinking | cap shows that state on load (the review page's coach row).
// No learner-facing text here: every string arrives from content ui.coach.
import { h, fmt, chapterNo } from '../util.js?v=aad36f0b';
import { glyph } from '../icons.js?v=aad36f0b';
import { ask } from './transport.js?v=aad36f0b';

const HINT_CODE = 'a';
const TOP = 96, BOTTOM = 632, SIDE = 24; // the panel's box in stage px

export function createCoach(stage, content, { zones, review = false, thumb = false, preview = null, hintScreen = null, getState }) {
  const ui = content.ui.coach;
  let screen = null;
  let open = false;
  let run = 0;        // the panel's current fill; a later fill (or a screen change) drops an older one
  let previewed = false;

  /* ---- launcher ---- */
  const lockBadge = h('span', { class: 'w-coach-lock', 'aria-hidden': 'true', hidden: true }, glyph('g-lock', { size: 14 }));
  const launcher = h('button', { class: 'w-coach-launcher', type: 'button', 'aria-label': ui.open, 'aria-expanded': 'false', 'aria-controls': 'w-coach-panel',
    onclick: () => (open ? close() : openPanel()) }, glyph('coach', { size: 46 }), lockBadge);
  zones.bar.querySelector('.w-bar-chapter').after(launcher);

  /* ---- panel ---- */
  const grip = h('button', { class: 'w-coach-grip', type: 'button', 'aria-label': ui.grip }, glyph('g-grip', { size: 10 }));
  const sub = h('p', { class: 'w-coach-sub' });
  const closeBtn = h('button', { class: 'w-coach-close', type: 'button', 'aria-label': ui.close, onclick: () => close() }, glyph('g-close', { size: 20 }));
  const head = h('div', { class: 'w-coach-head' }, grip,
    h('span', { class: 'w-coach-ava-head', 'aria-hidden': 'true' }, glyph('coach', { size: 28 })),
    h('div', { class: 'w-coach-titles' }, h('p', { class: 'w-coach-title', id: 'w-coach-title' }, ui.title), sub), closeBtn);
  const log = h('div', { class: 'w-coach-log', role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions' });
  const chips = h('div', { class: 'w-coach-chips', hidden: true });
  const input = h('input', { class: 'w-coach-input', type: 'text', 'aria-label': ui.inputLabel, placeholder: ui.offlinePlaceholder, autocomplete: 'off', maxlength: '300', disabled: true });
  const send = h('button', { class: 'w-coach-send', type: 'button', 'aria-label': ui.send, disabled: true }, h('span', { class: 'w-coach-send-disc' }, glyph('g-arrow', { size: 18 })));
  const row = h('div', { class: 'w-coach-row', dataset: { off: 'true' } }, input, send);
  const foot = h('div', { class: 'w-coach-foot' }, chips, row,
    h('p', { class: 'w-coach-privacy' }, glyph('g-lock', { size: 12 }), h('span', {}, ui.privacy)));
  const dockNote = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
  const panel = h('section', { class: 'w-coach-panel', id: 'w-coach-panel', role: 'dialog', 'aria-labelledby': 'w-coach-title', tabindex: '-1', hidden: true, dataset: { dock: 'l' } },
    head, log, foot, dockNote);

  /* ---- first-use hint ---- */
  const hint = h('div', { class: 'w-coach-hint', hidden: true },
    h('p', {}, ui.hint), h('button', { class: 'w-coach-gotit', type: 'button', onclick: () => { hideHint(); launcher.focus(); } }, ui.gotIt));
  // after the bar: Tab goes launcher, panel, hint, then the screen
  zones.bar.after(panel, hint);

  /* ---- messages ---- */
  const coachMsg = (text, ...extra) => h('div', { class: 'w-coach-msg', dataset: { from: 'coach' } },
    h('span', { class: 'w-coach-ava', 'aria-hidden': 'true' }, glyph('coach', { size: 20 })), h('p', { class: 'w-coach-bubble' }, text, ...extra));
  const learnerMsg = (text) => h('div', { class: 'w-coach-msg', dataset: { from: 'you' } }, h('p', { class: 'w-coach-bubble' }, text));
  const notice = (text) => h('div', { class: 'w-coach-msg', dataset: { from: 'notice' } }, h('p', { class: 'w-coach-notice' }, text));
  const thinking = () => coachMsg(h('span', { class: 'w-coach-dots', role: 'img', 'aria-label': ui.thinking }, h('i'), h('i'), h('i')));

  const kind = () => screen?.coach?.kind || 'practice';
  const locked = () => kind() === 'locked';
  const tip = () => screen?.coach?.tip || '';

  // the panel's messages for this screen. mode: 'offline' (the live run's fallback, the only mode of
  // CO1), 'thinking' and 'cap' (review page only until the live run)
  async function fill(mode = 'offline') {
    const my = ++run;
    log.removeAttribute('aria-busy');
    log.replaceChildren();
    foot.hidden = locked();
    if (locked()) { log.append(notice(ui.locked)); return; }
    log.append(coachMsg(ui.lines[kind()] || ui.lines.practice));
    if (mode === 'thinking') { log.setAttribute('aria-busy', 'true'); log.append(learnerMsg(ui.reviewQuestion), thinking()); return; }
    if (mode === 'cap') { log.append(learnerMsg(ui.reviewQuestion), notice(ui.cap)); if (tip()) log.append(coachMsg(tip())); return; }
    const answer = await ask({ screen: screen.id, kind: kind(), question: null });
    if (my !== run || !answer?.offline) return;
    if (tip()) log.append(notice(ui.offline), coachMsg(tip()));
  }

  function openPanel({ focus = true, mode = 'offline' } = {}) {
    hideHint();
    open = true;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    fill(mode);
    if (focus && !thumb) panel.focus({ preventScroll: true });
  }

  function close(returnFocus = true) {
    if (!open) return;
    open = false;
    run++;
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    if (returnFocus && !thumb) launcher.focus({ preventScroll: true });
  }

  /* ---- dock ---- */
  const dockOf = () => (getState().g?.cd === 'r' ? 'r' : 'l');
  function setDock(side, announce = false) {
    panel.dataset.dock = side;
    if (!review) {
      const g = getState().g;
      if (side === 'r') g.cd = 'r'; else delete g.cd;
    }
    if (announce) dockNote.textContent = side === 'r' ? ui.dockedRight : ui.dockedLeft;
  }

  grip.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setDock(e.key === 'ArrowRight' ? 'r' : 'l', true); }
  });
  // drag by the grip: the panel follows the pointer (kept inside the stage and y 96 to 632), then
  // snaps to the dock on the side its centre is on
  grip.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    grip.setPointerCapture?.(e.pointerId);
    const S = stage.getBoundingClientRect();
    const k = S.height / 720, stageW = S.width / k;
    const P = panel.getBoundingClientRect();
    const left0 = (P.left - S.left) / k, top0 = (P.top - S.top) / k, w = P.width / k, ht = P.height / k;
    const x0 = e.clientX, y0 = e.clientY;
    let dx = 0, dy = 0;
    panel.dataset.dragging = 'true';
    const move = (ev) => {
      dx = Math.min(stageW - w - left0, Math.max(-left0, (ev.clientX - x0) / k));
      dy = Math.min(BOTTOM - ht - top0, Math.max(TOP - top0, (ev.clientY - y0) / k));
      panel.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
      panel.style.transform = '';
      delete panel.dataset.dragging;
      setDock(left0 + dx + w / 2 > stageW / 2 ? 'r' : 'l', true);
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  });

  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  });

  /* ---- first-use hint ---- */
  function showHint() {
    hint.style.left = launcher.offsetLeft + 'px';
    hint.hidden = false;
  }
  function hideHint() { hint.hidden = true; }

  /* ---- every screen ---- */
  // show(screen, chapter): called by the engine after each new screen and its bar
  function show(s, chapter) {
    screen = s;
    hideHint();
    const isLocked = locked();
    launcher.dataset.locked = String(isLocked);
    launcher.setAttribute('aria-label', isLocked ? ui.openLocked : ui.open);
    lockBadge.hidden = !isLocked;
    sub.textContent = fmt(ui.sub, { n: chapterNo(content, chapter?.id), verb: s.step?.verb || '' });
    panel.dataset.dock = dockOf();
    if (open) fill();
    // review page: the state asked for in the URL, once (nothing is written)
    if (review && preview && !previewed) {
      previewed = true;
      if (preview === 'hint') showHint();
      else if (['open', 'right', 'thinking', 'cap'].includes(preview)) {
        if (preview === 'right') panel.dataset.dock = 'r';
        openPanel({ focus: false, mode: preview === 'right' ? 'offline' : preview });
      }
      return;
    }
    const st = getState();
    if (!review && s.id === hintScreen && !(st.h || '').includes(HINT_CODE)) {
      st.h = (st.h || '') + HINT_CODE;
      showHint();
    }
  }

  return { show, open: openPanel, close, setDock, isOpen: () => open, launcher, panel, hint };
}
