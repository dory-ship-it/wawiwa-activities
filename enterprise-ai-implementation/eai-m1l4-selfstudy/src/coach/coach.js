// The Wawiwa AI Coach (CO1, offline mode): a launcher in the top bar on every screen and a chat panel
// that docks left or right inside the stage (stage px; the stage scales as a whole):
//   launcher  in the bar right after the chapter name: a 56 px white disc, the robot face, 3 px turquoise
//             ring; locked on the knowledge check (S21: 60% opacity, grey ring, a lock badge)
//   panel     340 wide, 536 high (Noy: to the foot of the page), top 96, 24 from the left (dock l, the
//             default, by the launcher) or the right (dock r): y 96 to 632, so it never covers the bar or
//             reaches Previous / Next. Above main and the footer, below the menu and dialogs. A non-modal
//             dialog; Escape closes it and the focus goes back to the launcher. Drag it by the grip (it
//             snaps to the nearer dock) or press Arrow Left / Right on the grip.
//   demo      once, on the goals screen (ui.coach.demoOn): the launcher pulses, the panel opens by itself
//             with one line, closes, and "Stuck? Ask me." stays beside the launcher with "Got it". Any key
//             or click ends the demo at once. Reduced motion: only the "Stuck? Ask me." bubble.
// Offline only, kept short (Noy, 26 Oct 2026: no text that is not needed): the panel shows the screen
// type's opening line and one chip, "What do I do here?"; the chip is the learner's message, and the coach
// answers with the screen's tip (content: screen.coach.tip, copied from the screen's hint or drafted).
// The input row and its privacy line belong to the live coach (shown only in the review page's live
// states, thinking and cap). transport.ask() answers { offline: true } until the live run.
// Never reported: no SCORM call, no interaction. The coach keeps two things in the lesson state, in
// memory only (they go out with the lesson's next regular save): the dock (state.g.cd = 'r', left is
// the default and left out) and the demo (letter 'a' in state.h; 'c' is the choice ghost's).
// Nothing the learner types is kept anywhere. Review mode (?review=1) writes nothing; ?coach=hint |
// open | tip | right | thinking | cap | demo shows that state on load (the review page's coach row).
// No learner-facing text here: every string arrives from content ui.coach.
import { h, reducedMotion } from '../util.js?v=96dc38c7';
import { glyph } from '../icons.js?v=96dc38c7';
import { ask } from './transport.js?v=96dc38c7';

const HINT_CODE = 'a';
const TOP = 96, BOTTOM = 632; // the panel's box in stage px
const DEMO = { wait: 900, pulse: 1100, shown: 2600 }; // ms: before the pulse, pulse to open, open to close

export function createCoach(stage, content, { zones, review = false, thumb = false, preview = null, demoScreen = null, getState }) {
  const ui = content.ui.coach;
  let screen = null;
  let open = false;
  let run = 0;        // the panel's current fill; a later fill (or a screen change) drops an older one
  let previewed = false;
  let demo = null;    // the running demo: { timers, stop }

  /* ---- launcher ---- */
  const lockBadge = h('span', { class: 'w-coach-lock', 'aria-hidden': 'true', hidden: true }, glyph('g-lock', { size: 14 }));
  const launcher = h('button', { class: 'w-coach-launcher', type: 'button', 'aria-label': ui.open, 'aria-expanded': 'false', 'aria-controls': 'w-coach-panel',
    onclick: () => { if (demo) { stopDemo(); openPanel(); } else if (open) close(); else openPanel(); } }, glyph('coach', { size: 46 }), lockBadge);
  zones.bar.querySelector('.w-bar-chapter').after(launcher);

  /* ---- panel ---- */
  const grip = h('button', { class: 'w-coach-grip', type: 'button', 'aria-label': ui.grip }, glyph('g-grip', { size: 10 }));
  const closeBtn = h('button', { class: 'w-coach-close', type: 'button', 'aria-label': ui.close, onclick: () => close() }, glyph('g-close', { size: 20 }));
  const head = h('div', { class: 'w-coach-head' }, grip,
    h('span', { class: 'w-coach-ava-head', 'aria-hidden': 'true' }, glyph('coach', { size: 28 })),
    h('p', { class: 'w-coach-title', id: 'w-coach-title' }, ui.title), closeBtn);
  const log = h('div', { class: 'w-coach-log', role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions' });
  const tipChip = h('button', { class: 'w-coach-chip', type: 'button', dataset: { action: 'coachTip' }, onclick: () => giveTip() }, ui.tipChip);
  const chips = h('div', { class: 'w-coach-chips' }, tipChip);
  // the live coach's input row (review page only in CO1: thinking, cap)
  const input = h('input', { class: 'w-coach-input', type: 'text', 'aria-label': ui.inputLabel, placeholder: ui.offlinePlaceholder, autocomplete: 'off', maxlength: '300', disabled: true });
  const send = h('button', { class: 'w-coach-send', type: 'button', 'aria-label': ui.send, disabled: true }, h('span', { class: 'w-coach-send-disc' }, glyph('g-arrow', { size: 18 })));
  const live = h('div', { class: 'w-coach-live' }, h('div', { class: 'w-coach-row', dataset: { off: 'true' } }, input, send),
    h('p', { class: 'w-coach-privacy' }, glyph('g-lock', { size: 12 }), h('span', {}, ui.privacy)));
  const foot = h('div', { class: 'w-coach-foot' }, chips, live);
  const dockNote = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
  const panel = h('section', { class: 'w-coach-panel', id: 'w-coach-panel', role: 'dialog', 'aria-labelledby': 'w-coach-title', tabindex: '-1', hidden: true, dataset: { dock: 'l' } },
    head, log, foot, dockNote);

  /* ---- "Stuck? Ask me." beside the launcher ---- */
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

  // the panel's messages for this screen. mode: 'offline' (CO1: the opening line and the tip chip),
  // 'tip' (the chip already pressed), 'thinking' and 'cap' (the live coach, review page only), 'demo'
  // (the goals screen's demo: one line, nothing to press)
  function fill(mode = 'offline') {
    run++;
    log.removeAttribute('aria-busy');
    log.replaceChildren();
    foot.dataset.mode = ['thinking', 'cap'].includes(mode) ? 'live' : 'tips';
    if (locked()) { foot.hidden = true; log.append(notice(ui.locked)); return; }
    if (mode === 'demo') { foot.hidden = true; log.append(coachMsg(ui.demo)); return; }
    log.append(coachMsg(ui.lines[kind()] || ui.lines.practice));
    if (mode === 'thinking') { log.setAttribute('aria-busy', 'true'); log.append(learnerMsg(ui.reviewQuestion), thinking()); }
    if (mode === 'cap') { log.append(learnerMsg(ui.reviewQuestion), notice(ui.cap)); if (tip()) log.append(coachMsg(tip())); }
    chips.hidden = !tip() || mode !== 'offline';
    foot.hidden = foot.dataset.mode === 'tips' && chips.hidden;
    if (mode === 'tip') giveTip({ focus: false });
  }

  // the chip: the learner's message, then the coach's tip (offline: the screen's own tip)
  async function giveTip({ focus = true } = {}) {
    const my = run;
    chips.hidden = true;
    foot.hidden = true;
    log.append(learnerMsg(ui.tipChip));
    const answer = await ask({ screen: screen.id, kind: kind(), question: null });
    if (my !== run || !open) return;
    if (answer?.offline && tip()) log.append(coachMsg(tip()));
    if (focus && !thumb) panel.focus({ preventScroll: true }); // the chip is gone: the dialog keeps the focus
  }

  function openPanel({ focus = true, mode = 'offline' } = {}) {
    stopDemo();
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

  /* ---- "Stuck? Ask me." and the demo ---- */
  function showHint() {
    hint.style.left = launcher.offsetLeft + 'px';
    hint.hidden = false;
  }
  function hideHint() { hint.hidden = true; }

  // the goals screen, once: pulse, the panel opens by itself with one line, closes; then the hint stays.
  // The learner's first key or click ends it at once (the hint stays).
  function playDemo() {
    if (reducedMotion() || thumb) { showHint(); return; }
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const stop = (e) => {
      if (e && (launcher.contains(e.target) || panel.contains(e.target))) return; // the learner took over the coach
      const shown = open && panel.dataset.demo === 'true';
      stopDemo();
      if (shown) close(false);
      showHint();
    };
    demo = { timers, stop };
    document.addEventListener('keydown', stop, true);
    document.addEventListener('pointerdown', stop, true);
    at(DEMO.wait, () => { launcher.dataset.demo = 'pulse'; });
    at(DEMO.wait + DEMO.pulse, () => {
      delete launcher.dataset.demo;
      open = true;
      panel.hidden = false;
      panel.dataset.demo = 'true';
      launcher.setAttribute('aria-expanded', 'true');
      fill('demo');
    });
    at(DEMO.wait + DEMO.pulse + DEMO.shown, () => { stopDemo(); close(false); showHint(); });
  }
  function stopDemo() {
    if (!demo) return;
    demo.timers.forEach(clearTimeout);
    document.removeEventListener('keydown', demo.stop, true);
    document.removeEventListener('pointerdown', demo.stop, true);
    demo = null;
    delete launcher.dataset.demo;
    delete panel.dataset.demo;
  }

  /* ---- every screen ---- */
  // show(screen): called by the engine after each new screen and its bar
  function show(s) {
    screen = s;
    if (demo) { stopDemo(); if (open) close(false); }
    hideHint();
    const isLocked = locked();
    launcher.dataset.locked = String(isLocked);
    launcher.setAttribute('aria-label', isLocked ? ui.openLocked : ui.open);
    lockBadge.hidden = !isLocked;
    panel.dataset.dock = dockOf();
    if (open) fill();
    // review page: the state asked for in the URL, once (nothing is written)
    if (review && preview && !previewed) {
      previewed = true;
      if (preview === 'hint') showHint();
      else if (preview === 'demo') { open = true; panel.hidden = false; launcher.setAttribute('aria-expanded', 'true'); fill('demo'); }
      else if (['open', 'tip', 'right', 'thinking', 'cap'].includes(preview)) {
        if (preview === 'right') panel.dataset.dock = 'r';
        openPanel({ focus: false, mode: preview === 'right' ? 'offline' : preview });
      }
      return;
    }
    const st = getState();
    if (!review && s.id === demoScreen && !(st.h || '').includes(HINT_CODE)) {
      st.h = (st.h || '') + HINT_CODE;
      playDemo();
    }
  }

  return { show, open: openPanel, close, setDock, isOpen: () => open, launcher, panel, hint };
}
