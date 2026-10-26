// Drag and drop onto drop targets (NL2), shared by the sort deck (S04; S09, S16, S17, S18A in NL3) and the
// label task (S05b). Three ways to place a card, all ending in the template's onDrop:
//   pointer   press a card and drag it: it follows the pointer (in stage px: the stage is scaled as a
//             whole); the target under the pointer lights up; release over a target drops it there,
//             anywhere else the card slides back
//   click     a press without a drag picks the card up (aria-pressed); a click on a target drops it
//             (the single-pointer alternative to dragging, WCAG 2.5.7)
//   keyboard  on a focused card, 1 to n chooses a target, Enter drops on it, Escape cancels; Enter or
//             Space with no target chosen picks the card up or puts it down
// Every step is announced in the live region (strings from ui.drag). Cards and targets are elements
// the template owns; this module only moves a card and marks states:
//   card[aria-pressed]   picked up          card.w-dragging   following the pointer
//   target[data-over]    under the pointer  target[data-chosen]  chosen by key
// onDrop(card, target) -> 'placed' (the template has moved the card), 'returned' (slide back, put
// down) or 'kept' (slide back, still picked up).
import { fmt, reducedMotion } from './util.js?v=a6a1e898';

const SLOP = 4; // window px before a press becomes a drag
const BACK_MS = 300;

// picked: the announcement when a card is picked up (default ui.drag.picked, "choose a column";
// places on a diagram or a map say ui.drag.pickedPlace)
export function dragDrop({ ui, live, targets, nameOf, onDrop, picked: pickedLine = ui.drag.picked }) {
  let picked = null, chosen = null, drag = null;
  const say = (text) => { live.textContent = ''; live.textContent = text; };
  const stageScale = (el) => { const st = el.closest('.w-stage'); return st ? st.getBoundingClientRect().width / st.offsetWidth || 1 : 1; };
  const setChosen = (t) => { chosen = t; targets.forEach((x) => { x.el.dataset.chosen = String(x === t); }); };
  const setOver = (t) => targets.forEach((x) => { x.el.dataset.over = String(x === t); });
  const pick = (card) => {
    if (picked && picked !== card) picked.setAttribute('aria-pressed', 'false');
    picked = card;
    if (card) card.setAttribute('aria-pressed', 'true');
    setChosen(null);
    targets.forEach((x) => { x.el.dataset.armed = String(!!card); });
  };
  // the card slides back from where it was let go (no motion with reduced motion)
  const slideBack = (card) => {
    const t = card.style.transform;
    card.style.transform = '';
    card.classList.remove('w-dragging');
    if (t && !reducedMotion()) card.animate([{ transform: t }, { transform: 'none' }], { duration: BACK_MS, easing: 'cubic-bezier(.2,.7,.2,1)' });
  };
  function drop(card, t) {
    const result = onDrop(card, t.id);
    setOver(null);
    if (result === 'placed') { card.style.transform = ''; card.classList.remove('w-dragging'); pick(null); return; }
    slideBack(card);
    if (result === 'kept') pick(card); else pick(null);
    // the feedback strip (its own live region) says what happened: nothing more to announce here
  }
  const inRect = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
  // a target's "Drop here" chip counts as the target too (S05b: the chip sits on the place's edge, half
  // outside it; QA 26 Oct 2026, drops on it fell through to the diagram)
  const dropChip = (t) => (t.chip && t.chip.classList.contains('w-target-chip') ? t.chip : null);
  const hitAt = (x, y) => targets.find((t) => !t.el.inert && (inRect(t.el, x, y) || (dropChip(t) && inRect(dropChip(t), x, y)))) || null;

  function add(card) {
    card.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || card.inert || card.getAttribute('aria-disabled') === 'true') return;
      drag = { card, x: e.clientX, y: e.clientY, k: stageScale(card), moved: false, id: e.pointerId };
      card.setPointerCapture(e.pointerId);
    });
    card.addEventListener('pointermove', (e) => {
      if (!drag || drag.card !== card) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < SLOP) return;
      if (!drag.moved) { drag.moved = true; card.classList.add('w-dragging'); pick(card); }
      card.style.transform = `translate(${dx / drag.k}px, ${dy / drag.k}px)`;
      setOver(hitAt(e.clientX, e.clientY));
    });
    const end = (e, cancelled) => {
      if (!drag || drag.card !== card) return;
      const d = drag;
      drag = null;
      if (!d.moved) return; // a click: handled below
      const t = cancelled ? null : hitAt(e.clientX, e.clientY);
      card.dataset.dragged = 'true'; // the click that follows a drag is not a pick
      if (t) drop(card, t);
      else { setOver(null); slideBack(card); pick(null); say(ui.drag.cancelled); }
    };
    card.addEventListener('pointerup', (e) => end(e, false));
    card.addEventListener('pointercancel', (e) => end(e, true));
    card.addEventListener('click', () => {
      if (card.dataset.dragged === 'true') { delete card.dataset.dragged; return; }
      if (card.inert || card.getAttribute('aria-disabled') === 'true') return;
      if (picked === card) { pick(null); say(ui.drag.cancelled); return; }
      pick(card);
      say(fmt(pickedLine, { item: nameOf(card), n: targets.length }));
    });
    card.addEventListener('keydown', (e) => {
      if (card.inert || card.getAttribute('aria-disabled') === 'true') return;
      const n = Number(e.key);
      if (n >= 1 && n <= targets.length && !targets[n - 1].el.inert) {
        e.preventDefault();
        if (picked !== card) pick(card);
        setChosen(targets[n - 1]);
        say(fmt(ui.drag.chosen, { target: targets[n - 1].name }));
      } else if (e.key === 'Enter' && chosen && picked === card) {
        e.preventDefault();
        drop(card, chosen);
      } else if (e.key === 'Escape' && picked === card) {
        e.preventDefault();
        e.stopPropagation();
        pick(null);
        say(ui.drag.cancelled);
      }
      // Enter or Space with no target chosen: the button's click (pick up / put down)
    });
  }
  targets.forEach((t) => {
    const onClick = () => { if (picked && !t.el.inert) drop(picked, t); };
    t.el.addEventListener('click', onClick);
    // a chip outside the target element takes the click as well (inside it, the click reaches the target anyway)
    if (dropChip(t) && !t.el.contains(t.chip)) t.chip.addEventListener('click', onClick);
  });
  return { add, pick, picked: () => picked, say };
}
