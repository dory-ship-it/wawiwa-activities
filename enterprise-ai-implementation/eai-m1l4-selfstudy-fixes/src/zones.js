// The shell of every screen, "Hybrid cinematic" look (NL1, planning/design-reference/hybrid-cinematic),
// in stage px (the stage is 720 high, 1280 to 1600 wide, scaled as a whole):
//   scene   the whole stage, behind everything: the chapter photo below the bar (Stage mode, push-in
//           once), the blurred photo under a stone veil (Focus mode), or O1's photo under its veil
//   bar     y 0 to 80.64, every screen (FX2 C: O1 and END too): logo | menu button | chapter name;
//           right, the chapter's steps (disc + verb; done / current / next)
//   main    y 80.64 to 720, the screen's own layout
//   footer  Previous bottom-left, Next bottom-right, floating over main (O1: none; END: Previous only)
// Parts a template places inside its layout: the instruction h1 (tabindex -1, focus lands here on
// every new screen) and the band: the hint row (hint text, the band's tool such as Check or Resume)
// and the feedback strip (aria-live polite) flush to the bottom edges of the panel it sits in.
// No learner-facing text here: every string arrives from the content JSON.
import { h, fmt, reducedMotion } from './util.js?v=e59b9691';
import { glyph, icon } from './icons.js?v=e59b9691';

const TONE = { correct: 'correct', neutral: 'neutral', wrong: 'wrong', notice: 'neutral', guess: 'neutral', partial: 'neutral', pause: 'neutral' };
const LEAD = { correct: 'g-ok-disc', wrong: 'g-no-disc', neutral: 'guess' };
// "Saved. Your case comes back ..." -> ["Saved.", "Your case comes back ..."]: a message without a
// verdict word shows its first sentence as the strip's head (the frames' S02 strips)
const splitHead = (t) => { const m = /^(.+?[.?!])\s+(\S[\s\S]*)$/.exec(t || ''); return m ? [m[1], m[2]] : [t || '', '']; };

export function createZones(stage, content, { onMenu, onPrev, onNext, onWrong = () => {} }) {
  const ui = content.ui;

  /* ---- scene ---- */
  const scene = h('div', { class: 'w-scene', 'aria-hidden': 'true' });
  let lastScene = '';
  // mode: 'stage' | 'focus' | 'title' (O1) | 'end' (FX2 END: O1's photo and veil, the footer shown) |
  // 'plain' (FX2 A: the video, the dark Stage ground with no photo, so nothing distracts from the film);
  // photo: { src, position, mirror } from the content (chapter or screen; mirror: true flips it left to
  // right, QA1: the people out from under a card). The bar is on every screen, dark on every scene
  // (FX3: the Focus wash too, now a dark veil in the bar's tone).
  function setScene(mode, photo) {
    stage.dataset.scene = mode;
    stage.dataset.bar = 'dark';
    const key = mode + '|' + (photo?.src || '') + (photo?.mirror ? '|mirror' : '');
    if (key === lastScene) return; // the same photo in the same mode stays still (push-in once)
    lastScene = key;
    const layer = (cls) => {
      const el = h('div', { class: cls, dataset: photo?.mirror ? { mirror: 'true' } : {} });
      if (photo?.src) { el.style.backgroundImage = `url("${photo.src}")`; el.style.backgroundPosition = photo.position || '50% 50%'; }
      return el;
    };
    if (mode === 'focus') scene.replaceChildren(layer('w-wash-photo'), h('div', { class: 'w-wash-veil' }));
    // FX5: the other looks of a task screen
    else if (mode === 'band') scene.replaceChildren(layer('w-band-photo'), h('div', { class: 'w-band-veil' }));
    else if (mode === 'split') scene.replaceChildren(layer('w-split-photo'));
    else if (mode === 'light') scene.replaceChildren();
    else if (mode === 'plain') scene.replaceChildren(); // FX2 A (Noy): the video on a clean ground, no photo
    else if (mode === 'title' || mode === 'end') scene.replaceChildren(layer('w-scene-photo w-scene-full w-push'), h('div', { class: 'w-o1-veil' }));
    else scene.replaceChildren(layer('w-scene-photo w-push'));
  }

  /* ---- top bar ---- */
  const menuBtn = h('button', { class: 'w-bar-menu', type: 'button', 'aria-label': ui.rail.openMenu, 'aria-haspopup': 'dialog', 'aria-expanded': 'false',
    onclick: () => onMenu(menuBtn) }, h('i'), h('i'), h('i'));
  // FX1 (Kit 13): "Chapter N of 7" (small) above the chapter name
  const chapterOf = h('span', { class: 'w-bar-of' });
  const chapterTitle = h('span', { class: 'w-bar-title' });
  const chapterName = h('p', { class: 'w-bar-chapter' }, chapterOf, chapterTitle);
  const steps = h('ol', { class: 'w-steps-bar', 'aria-label': ui.rail.steps });
  const savedText = h('span', { class: 'w-saved-text' });
  const saved = h('span', { class: 'w-saved', role: 'status', hidden: true }, savedText);
  const bar = h('nav', { class: 'w-bar', 'aria-label': ui.rail.label },
    h('img', { class: 'w-bar-logo', src: 'assets/logo/wawiwa-logo.png', alt: ui.logoAlt, width: '271', height: '102' }),
    h('span', { class: 'w-bar-rule', 'aria-hidden': 'true' }), menuBtn, chapterName, saved, steps);

  // model: { chapter: title, of: "Chapter 2 of 7", steps: [{ verb, icon, state: done | current | next }] }
  function setBar(model) {
    chapterOf.textContent = model.of || '';
    chapterOf.hidden = !model.of;
    chapterTitle.textContent = model.chapter || '';
    const items = [];
    model.steps.forEach((s, i) => {
      if (i) items.push(h('li', { class: 'w-step-link', 'aria-hidden': 'true', dataset: { state: s.state === 'next' ? 'next' : 'done' } }));
      // FX3: any icon of the set (a glyph or a Lucide icon), so the steps of a chapter can all differ
      // (FX4: the discs and their icons and checks about 1.5x)
      const disc = h('span', { class: 'w-step-disc' }, s.state === 'done' ? glyph('g-check', { size: 27.84 }) : icon(s.icon, { size: s.state === 'current' ? 29.76 : 27.84 }));
      items.push(h('li', { class: 'w-step', dataset: { state: s.state }, 'aria-current': s.state === 'current' ? 'step' : null },
        disc, h('span', { class: 'w-step-label' }, s.verb), h('span', { class: 'w-sr-only' }, ', ' + ui.rail.stepStatus[s.state])));
    });
    steps.replaceChildren(...items);
  }

  /* ---- main, logo (kept for templates that still ask for it), instruction ---- */
  const main = h('main', { class: 'w-main' });
  const logo = h('img', { class: 'w-logo', src: 'assets/logo/wawiwa-logo.png', alt: ui.logoAlt, width: '271', height: '102' });
  const instruction = h('h1', { class: 'w-instruction', id: 'w-instruction', tabindex: '-1' });

  /* ---- band: hint row + feedback strip ---- */
  // FX4 (Dor's pilot): the hint is not printed; a small "Hint" link opens it (the text in the row beside it)
  const hintText = h('span', { class: 'w-hint-text', id: 'w-hint-text', hidden: true });
  const hintLink = h('button', { class: 'w-hint-link', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'w-hint-text', dataset: { action: 'hint' } },
    glyph('guess', { size: 19.2 }), h('span', {}, ui.buttons.hint || 'Hint'));
  const bHint = h('span', { class: 'w-band-hint', 'aria-live': 'polite' }, hintLink, hintText);
  const openHint = (on) => { hintText.hidden = !on; hintLink.setAttribute('aria-expanded', String(on)); hintLink.hidden = on; };
  hintLink.addEventListener('click', () => openHint(true));
  const bTool = h('div', { class: 'w-band-tool' });
  // FX1 B2: the attempt marker (two small discs, "Attempt 1 of 2") before the band's tool
  const bTries = h('p', { class: 'w-attempts', hidden: true });
  const row = h('div', { class: 'w-band-row' }, bHint, bTries, bTool);
  const sIcon = h('span', { class: 'w-strip-icon' });
  const bSr = h('span', { class: 'w-sr-only' });
  const bVerdict = h('strong', { class: 'w-band-verdict' });
  const bText = h('span', { class: 'w-band-text' });
  const bLive = h('p', { class: 'w-band-live', 'aria-live': 'polite', 'aria-atomic': 'true' }, bSr, bVerdict, bText);
  const bActions = h('div', { class: 'w-band-actions' });
  const strip = h('div', { class: 'w-strip' }, sIcon, h('div', { class: 'w-strip-body' }, bLive), bActions);
  const band = h('div', { class: 'w-band', dataset: { state: 'hint', strip: 'off' } }, row, strip);

  const refresh = () => {
    // FX5 (Noy, 8 Nov 2026): no hints on screen at all; the hint stays for screen readers only
    const hintShown = false;
    hintLink.hidden = true;
    bHint.classList.add('w-sr-only');
    hintText.hidden = false;
    // (a template may place the attempt marker elsewhere, e.g. S06's situation card: then it is not the row's)
    row.hidden = !hintShown && !bTool.children.length && (bTries.hidden || bTries.parentElement !== row);
    band.dataset.empty = String(row.hidden && band.dataset.strip === 'off');
  };

  // setFeedback({ state, text, verdict, actions, tone }). state: hint | idle | notice | correct | wrong |
  // neutral | guess | partial | pause. hint sets the row's hint line (no strip); every other state
  // shows the strip in its tone: correct teal, wrong red, the rest stone. tone 'correct' gives a
  // neutral answer the teal strip (a save: the frames' S02 "Saved.").
  // actions: [{ id, label, onClick }] secondary buttons in the strip (FT routes, Next round).
  // open: true shows a hint row's text at once, with no link (a reason, not a hint: the video stop's
  // "The video continues after the right answer.")
  function setFeedback({ state = 'hint', text = '', verdict = null, actions = [], tone: toneOf = null, open = false } = {}) {
    band.dataset.state = state;
    if (state === 'hint' || state === 'idle') {
      const t = state === 'hint' ? text || '' : '';
      // the same hint again keeps its open / closed state; a new one starts closed
      if (hintText.textContent !== t || open) openHint(open);
      hintText.textContent = t;
      hintLink.hidden = !t || open || !hintText.hidden;
      band.dataset.strip = 'off';
      bSr.textContent = ''; bVerdict.textContent = ''; bText.textContent = '';
      bActions.replaceChildren();
      refresh();
      placeCard();
      return null;
    }
    const tone = toneOf || TONE[state] || 'neutral';
    if (state === 'wrong') onWrong();
    // FX4: a wrong answer always leaves one more try (the last wrong one reveals the answer instead)
    const wrongHead = ui.feedback.oneMoreTry || ui.feedback.wrongPrefix;
    let head = verdict ?? (state === 'correct' ? ui.feedback.correctPrefix : state === 'wrong' ? wrongHead : null);
    let line = text || '';
    if (head === null) [head, line] = splitHead(line);
    strip.dataset.tone = tone;
    sIcon.replaceChildren(glyph(LEAD[tone], { size: 33.28 }));
    const sr = state === 'correct' ? ui.feedback.srCorrect : state === 'wrong' ? ui.feedback.srWrong : ['neutral', 'guess', 'partial'].includes(state) ? ui.feedback.srNeutral : '';
    bSr.textContent = sr ? sr + ' ' : '';
    bVerdict.textContent = head ? head + ' ' : '';
    bVerdict.hidden = !head;
    bText.textContent = line;
    // the message as the content wrote it (the head is display only), for tools/walk.mjs
    strip.dataset.verdict = verdict ?? (state === 'correct' ? ui.feedback.correctPrefix : state === 'wrong' ? wrongHead : '');
    strip.dataset.text = text || '';
    bText.hidden = !line;
    bActions.replaceChildren(...actions.map((a) => h('button', { class: 'w-btn w-btn-ghost', type: 'button', onclick: a.onClick, dataset: { action: a.id || '' } }, a.label)));
    band.dataset.strip = 'on';
    refresh();
    placeCard();
    // the strip slides up 8 px in 320 ms, each time it changes (none with reduced motion)
    strip.classList.remove('w-strip-in');
    if (!reducedMotion()) { void strip.offsetWidth; strip.classList.add('w-strip-in'); }
    return bActions.querySelector('button');
  }
  // FX5 (Noy: "separate the feedback from the question box"): in a panel the feedback is its own card,
  // hanging under the panel; the panel moves up by half the card, so the two stay centred together
  function placeCard() {
    const sheet = band.closest('.w-sheet');
    if (!sheet) return;
    const on = band.dataset.strip === 'on';
    sheet.dataset.fb = on ? 'on' : 'off';
    sheet.style.setProperty('--fb-shift', on ? (strip.offsetHeight + 15.36) / 2 + 'px' : '0px');
  }
  // the band's persistent tool (Check, Resume, Skip): stays through state changes until the screen goes
  // (a Check with a reason line brings it along, just before the button)
  const setTool = (...els) => { bTool.replaceChildren(...els.flatMap((e) => (e && e.why ? [e.why, e] : [e])).filter(Boolean)); refresh(); };
  // a screen whose frame shows no hint line keeps the hint for screen readers only
  // FX4: every screen offers its hint behind the link (no template prints a hint any more), so this is
  // always on; the calls stay
  const setHintVisible = (on) => { band.dataset.hint = 'on'; refresh(); };
  // FX1 B2: setAttempts(i, n) shows "Attempt i of n" with n small discs (the first i filled);
  // setAttempts(null) hides it
  // FX4 (Dor's pilot): no attempt marker any more; a first wrong answer says "Not quite. One more try."
  // in the strip instead. The calls stay, so templates need no change; the marker never shows.
  function setAttempts(i, n = 2) {
    i = null;
    bTries.hidden = !i;
    if (i) {
      bTries.dataset.attempt = String(i);
      bTries.replaceChildren(h('span', { class: 'w-attempt-discs', 'aria-hidden': 'true' },
        Array.from({ length: n }, (_, k) => h('i', { dataset: { used: String(k < i) } }))), h('span', {}, fmt(ui.attempts.label, { i, n })));
    }
    refresh();
  }

  /* ---- footer ---- */
  const prevBtn = h('button', { class: 'w-prev', type: 'button', dataset: { action: 'previous' }, onclick: () => { if (prevBtn.getAttribute('aria-disabled') !== 'true') onPrev(); } },
    h('span', {}, ui.footer.previous));
  const nextLock = glyph('g-lock', { size: 17.92, className: 'w-next-lock' });
  const nextText = h('span', {}, ui.footer.next);
  // FX5 (Noy): the reason line beside a locked Next opens only after the learner presses it twice
  let lockedPresses = 0;
  const nextBtn = h('button', { class: 'w-next', type: 'button', dataset: { action: 'next' }, onclick: () => {
    if (nextBtn.dataset.locked !== 'true') { onNext(); return; }
    lockedPresses += 1;
    if (lockedPresses >= 2) setNeed(needText, true);
  } }, nextLock, nextText);
  let needText = '';
  // NL4: "Back to the check" (a review link from S21R opened an earlier screen), beside Previous
  let backFn = null;
  const backChip = h('button', { class: 'w-backchip', type: 'button', hidden: true, dataset: { action: 'backToCheck' }, onclick: () => backFn?.() },
    icon('chevron-left', { size: 19.2 }), h('span', {}));
  // FX4 (Dor's pilot): a visible line beside Next. Locked: what is still missing ("Open the 5 remaining
  // fields."); unlocked: what comes next ("Up next: Label"). aria-hidden: Next's own aria-label says why
  // it is locked, and the feedback strip announces the result.
  const nextWhy = h('p', { class: 'w-next-why', 'aria-hidden': 'true', hidden: true });
  const nextWrap = h('div', { class: 'w-next-wrap' }, nextWhy, nextBtn);
  const footer = h('footer', { class: 'w-footer' }, prevBtn, backChip, nextWrap);

  stage.append(scene, bar, main, footer); // the bar first: the reading and Tab order follow the screen top down

  // Next: locked = grey with a lock, aria-disabled, its aria-label says why; unlocked = red.
  // label: the locked button's own words (FX1 D4, S02: "Save to continue"); unlocked it reads Next
  // line: the visible line beside Next (setNeed changes it later without touching the lock)
  function setNext(locked, why = '', label = null, line = '') {
    const was = nextBtn.dataset.locked;
    nextText.textContent = locked && label ? label : ui.footer.next;
    nextBtn.dataset.locked = String(locked);
    nextLock.style.display = locked ? '' : 'none';
    if (locked) { nextBtn.setAttribute('aria-disabled', 'true'); nextBtn.setAttribute('aria-label', why || ui.footer.locked.default); }
    else { nextBtn.removeAttribute('aria-disabled'); nextBtn.removeAttribute('aria-label'); }
    setNeed(line, locked);
    stage.dataset.done = String(!locked); // FX4: a finished screen no longer offers its hint
    // FX4: Next visibly turns on: one soft ring the moment it unlocks (none with reduced motion)
    nextBtn.classList.remove('w-next-on');
    if (was === 'true' && !locked && !reducedMotion()) { void nextBtn.offsetWidth; nextBtn.classList.add('w-next-on'); }
  }
  // FX5: the line is kept (needText) but shows only while Next is locked and after two presses on it;
  // nothing shows beside an open Next ("Up next" is gone)
  function setNeed(line, locked = nextBtn.dataset.locked === 'true') {
    if (locked) needText = line || '';
    const show = locked && lockedPresses >= 2 && !!needText;
    nextWhy.textContent = show ? needText : '';
    nextWhy.hidden = !show;
    nextWhy.dataset.state = 'locked';
  }
  // setBack(label, fn): the chip shown with its label; setBack(null): hidden
  function setBack(label, fn) {
    backChip.hidden = !label;
    backChip.lastElementChild.textContent = label || '';
    backFn = label ? fn : null;
  }
  function setPrev(enabled) {
    if (enabled) prevBtn.removeAttribute('aria-disabled'); else prevBtn.setAttribute('aria-disabled', 'true');
  }

  function setSaved(ok) {
    // shown only when saving fails: a working save needs no badge
    saved.dataset.ok = ok ? 'true' : 'false';
    saved.hidden = ok;
    savedText.textContent = ok ? ui.saved : ui.notSaved;
  }

  function clearScreen() {
    lockedPresses = 0; needText = ''; // FX5: a new screen starts with no reason line
    main.replaceChildren();
    main.removeAttribute('data-layout');
    delete main.dataset.phase;
    delete main.dataset.composed;
    delete band.dataset.hint;
    if (bTries.parentElement !== row) row.insertBefore(bTries, bTool); // back in the band row for the next screen
    setAttempts(null);
    setTool();
    setFeedback({ state: 'hint', text: '' });
  }

  return { scene, bar, main, footer, logo, instruction, band, attempts: bTries, menuBtn, nextBtn, nextWhy, prevBtn, setScene, setFeedback, setTool, setHintVisible, setAttempts, setNext, setNeed, setPrev, setBack, setBar, setSaved, clearScreen };
}
