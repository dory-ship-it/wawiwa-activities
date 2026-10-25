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
import { h, fmt, reducedMotion } from './util.js?v=d9c03a25';
import { glyph, icon } from './icons.js?v=d9c03a25';

const TONE = { correct: 'correct', neutral: 'neutral', wrong: 'wrong', notice: 'neutral', guess: 'neutral', partial: 'neutral', pause: 'neutral' };
const LEAD = { correct: 'g-ok-disc', wrong: 'g-no-disc', neutral: 'guess' };
// "Saved. Your case comes back ..." -> ["Saved.", "Your case comes back ..."]: a message without a
// verdict word shows its first sentence as the strip's head (the frames' S02 strips)
const splitHead = (t) => { const m = /^(.+?[.?!])\s+(\S[\s\S]*)$/.exec(t || ''); return m ? [m[1], m[2]] : [t || '', '']; };

export function createZones(stage, content, { onMenu, onPrev, onNext }) {
  const ui = content.ui;

  /* ---- scene ---- */
  const scene = h('div', { class: 'w-scene', 'aria-hidden': 'true' });
  let lastScene = '';
  // mode: 'stage' | 'focus' | 'title' (O1) | 'end' (FX2 END: O1's photo and veil, the footer shown) |
  // 'plain' (FX2 A: the video, the dark Stage ground with no photo, so nothing distracts from the film);
  // photo: { src, position } from the content (chapter or screen). The bar is on every screen, dark
  // on every scene (FX3: the Focus wash too, now a dark veil in the bar's tone).
  function setScene(mode, photo) {
    stage.dataset.scene = mode;
    stage.dataset.bar = 'dark';
    const key = mode + '|' + (photo?.src || '');
    if (key === lastScene) return; // the same photo in the same mode stays still (push-in once)
    lastScene = key;
    const layer = (cls) => {
      const el = h('div', { class: cls });
      if (photo?.src) { el.style.backgroundImage = `url("${photo.src}")`; el.style.backgroundPosition = photo.position || '50% 50%'; }
      return el;
    };
    if (mode === 'focus') scene.replaceChildren(layer('w-wash-photo'), h('div', { class: 'w-wash-veil' }));
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
      const disc = h('span', { class: 'w-step-disc' }, s.state === 'done' ? glyph('g-check', { size: 18.56 }) : icon(s.icon, { size: s.state === 'current' ? 19.84 : 18.56 }));
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
  const bHint = h('span', { class: 'w-band-hint', 'aria-live': 'polite' });
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
    const hintShown = !!bHint.textContent && band.dataset.hint !== 'off';
    bHint.classList.toggle('w-sr-only', band.dataset.hint === 'off');
    // (a template may place the attempt marker elsewhere, e.g. S06's situation card: then it is not the row's)
    row.hidden = !hintShown && !bTool.children.length && (bTries.hidden || bTries.parentElement !== row);
    band.dataset.empty = String(row.hidden && band.dataset.strip === 'off');
  };

  // setFeedback({ state, text, verdict, actions, tone }). state: hint | idle | notice | correct | wrong |
  // neutral | guess | partial | pause. hint sets the row's hint line (no strip); every other state
  // shows the strip in its tone: correct teal, wrong red, the rest stone. tone 'correct' gives a
  // neutral answer the teal strip (a save: the frames' S02 "Saved.").
  // actions: [{ id, label, onClick }] secondary buttons in the strip (FT routes, Next round).
  function setFeedback({ state = 'hint', text = '', verdict = null, actions = [], tone: toneOf = null } = {}) {
    band.dataset.state = state;
    if (state === 'hint' || state === 'idle') {
      bHint.textContent = state === 'hint' ? text || '' : '';
      band.dataset.strip = 'off';
      bSr.textContent = ''; bVerdict.textContent = ''; bText.textContent = '';
      bActions.replaceChildren();
      refresh();
      return null;
    }
    const tone = toneOf || TONE[state] || 'neutral';
    let head = verdict ?? (state === 'correct' ? ui.feedback.correctPrefix : state === 'wrong' ? ui.feedback.wrongPrefix : null);
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
    strip.dataset.verdict = verdict ?? (state === 'correct' ? ui.feedback.correctPrefix : state === 'wrong' ? ui.feedback.wrongPrefix : '');
    strip.dataset.text = text || '';
    bText.hidden = !line;
    bActions.replaceChildren(...actions.map((a) => h('button', { class: 'w-btn w-btn-ghost', type: 'button', onclick: a.onClick, dataset: { action: a.id || '' } }, a.label)));
    band.dataset.strip = 'on';
    refresh();
    // the strip slides up 8 px in 320 ms, each time it changes (none with reduced motion)
    strip.classList.remove('w-strip-in');
    if (!reducedMotion()) { void strip.offsetWidth; strip.classList.add('w-strip-in'); }
    return bActions.querySelector('button');
  }
  // the band's persistent tool (Check, Resume, Skip): stays through state changes until the screen goes
  const setTool = (...els) => { bTool.replaceChildren(...els); refresh(); };
  // a screen whose frame shows no hint line keeps the hint for screen readers only
  const setHintVisible = (on) => { band.dataset.hint = on ? 'on' : 'off'; refresh(); };
  // FX1 B2: setAttempts(i, n) shows "Attempt i of n" with n small discs (the first i filled);
  // setAttempts(null) hides it
  function setAttempts(i, n = 2) {
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
  const nextBtn = h('button', { class: 'w-next', type: 'button', dataset: { action: 'next' }, onclick: () => { if (nextBtn.dataset.locked !== 'true') onNext(); } },
    nextLock, nextText);
  // NL4: "Back to the check" (a review link from S21R opened an earlier screen), beside Previous
  let backFn = null;
  const backChip = h('button', { class: 'w-backchip', type: 'button', hidden: true, dataset: { action: 'backToCheck' }, onclick: () => backFn?.() },
    icon('chevron-left', { size: 19.2 }), h('span', {}));
  const footer = h('footer', { class: 'w-footer' }, prevBtn, backChip, nextBtn);

  stage.append(scene, bar, main, footer); // the bar first: the reading and Tab order follow the screen top down

  // Next: locked = grey with a lock, aria-disabled, its aria-label says why; unlocked = red.
  // label: the locked button's own words (FX1 D4, S02: "Save to continue"); unlocked it reads Next
  function setNext(locked, why = '', label = null) {
    nextText.textContent = locked && label ? label : ui.footer.next;
    nextBtn.dataset.locked = String(locked);
    nextLock.style.display = locked ? '' : 'none';
    if (locked) { nextBtn.setAttribute('aria-disabled', 'true'); nextBtn.setAttribute('aria-label', why || ui.footer.locked.default); }
    else { nextBtn.removeAttribute('aria-disabled'); nextBtn.removeAttribute('aria-label'); }
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
    main.replaceChildren();
    main.removeAttribute('data-layout');
    delete band.dataset.hint;
    if (bTries.parentElement !== row) row.insertBefore(bTries, bTool); // back in the band row for the next screen
    setAttempts(null);
    setTool();
    setFeedback({ state: 'hint', text: '' });
  }

  return { scene, bar, main, footer, logo, instruction, band, attempts: bTries, menuBtn, nextBtn, prevBtn, setScene, setFeedback, setTool, setHintVisible, setAttempts, setNext, setPrev, setBack, setBar, setSaved, clearScreen };
}
