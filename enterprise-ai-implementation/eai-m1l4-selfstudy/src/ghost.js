// The ghost hand (NL1, the frames' hand): a semi-transparent white hand with an ink outline and a
// soft teal ripple that shows an interaction once. It only draws: it never selects,
// checks or tracks anything (a step's tap() may change what is shown, e.g. open a tab, and the
// restore() callback puts it back). aria-hidden; the written instruction always stays.
//   createGhost(stage, { ui, steps, restore, seen, onPlay }) -> { button, play, cancel }
//     steps()   -> [{ el, tap? } | { point }] the targets in order, read when the demo starts
//                  (point() -> { x, y } in window px, for a spot that is not an element); a step's
//                  carry (an element) is grabbed there and moves with the hand to the later steps
//   targetSteps(scope, target) -> the steps for the target the content names (screen.ghost.target,
//     one name or a list), so the hand never points at an answer:
//       "options-gap"     the gap between the first two options (on no option; stacked: its right end)
//       "options-centre"  the centre of all the options (a 2x2 grid or a row of four: between cards)
//       "below-panel"     just under the panel, at its left edge (S01): it slides down the gutter
//       "gutter-left"     in the gutter left of the panel, level with the answers (S03)
//       "gutter-low"      in the gutter left of the panel, under the answers (V1, V2 stops)
//       "check"           the Check button
//       "options-sweep"   FX1 B1 (choice screens): two steps, from just above the first option down
//                         to just under the last one; the hand sweeps over every option and taps
//                         nothing (with a "Pick one" chip, createGhost's chip)
//       anything else     a CSS selector inside scope
//     A step's sweep (true) moves there without a tap; its type ({ el, text }) types the text into
//     that field after the tap, one character at a time (restore() puts the field back).
//     The three gutter targets come in from above ("slides down"), never crossing an answer.
//     Templates keep their position-based steps only for a screen with no target.
//     seen      false: plays ~600 ms after the screen settles; true: only after 8 s without input
//     button    the "Show me" text button (the template places it next to its instruction)
// Timing: in ~150 ms, then per step a 450 ms move, a tap with a ripple, a short hold; out by 3 s.
// Any pointer or key input stops it at once. prefers-reduced-motion: no motion, a static hand and
// arrow at the first target for 3 s.
import { h, reducedMotion } from './util.js?v=6ec78d4a';
import { glyph } from './icons.js?v=6ec78d4a';

const SETTLE = 600, IDLE = 8000, STATIC = 3000;
const MOVE = 450, TAP = 140, HOLD = 260, IN = 150, OUT = 200;
const HAND = 58.88; // 4.6cqw
const TIP = { x: 26, y: 7.4 }; // the fingertip inside the hand (stage px)

let active = null; // the demo on screen now (one at a time)

export function stopGhost() { if (active) active.stop(); }

// the stage's scale at an element (window px per stage px)
export const scaleOf = (el) => { const st = el.closest('.w-stage'); return st ? st.getBoundingClientRect().width / st.offsetWidth || 1 : 1; };

const OPTION = '.w-opt';
const GAP_INSET = 48; // window px from the options' right edge (stacked options)
export function targetSteps(scope, target) {
  const opts = () => [...scope.querySelectorAll(OPTION)].filter((el) => el.getClientRects().length);
  const zones = {
    'options-gap': () => {
      const [a, b] = opts().map((el) => el.getBoundingClientRect());
      if (!a || !b) return null;
      // one under the other: the gap's right end, where the hand's body (down and right of the
      // fingertip) covers no option text; side by side: the middle of the gap
      const stacked = b.top >= a.bottom - 1;
      return stacked ? { x: a.right - GAP_INSET, y: (a.bottom + b.top) / 2 } : { x: (a.right + b.left) / 2, y: (a.top + a.bottom) / 2 };
    },
    'options-centre': () => {
      const rs = opts().map((el) => el.getBoundingClientRect());
      if (!rs.length) return null;
      const l = Math.min(...rs.map((r) => r.left)), r = Math.max(...rs.map((x) => x.right));
      const t = Math.min(...rs.map((x) => x.top)), b = Math.max(...rs.map((x) => x.bottom));
      return { x: (l + r) / 2, y: (t + b) / 2 };
    },
    // the panel's gutters, in window px (k = the stage's scale): the hand's box sits 2.4cqw left of
    // the panel (its fingertip about 7 px left of the edge), or its left edge on the panel's edge
    'below-panel': () => { const P = panel(); return P && { x: P.r.left + TIP.x * P.k, y: P.r.bottom + 22.7 * P.k }; },
    'gutter-left': () => { const P = panel(), A = optsBox(); return P && A && { x: P.r.left - 7.3 * P.k, y: (A.top + A.bottom) / 2 }; },
    'gutter-low': () => { const P = panel(), A = optsBox(); return P && A && { x: P.r.left - 4.7 * P.k, y: A.bottom + 45 * P.k }; },
  };
  const panel = () => {
    const el = scope.querySelector('.w-sheet');
    const st = scope.closest('.w-stage');
    if (!el || !st) return null;
    return { r: el.getBoundingClientRect(), k: st.getBoundingClientRect().width / st.offsetWidth || 1 };
  };
  const optsBox = () => {
    const rs = opts().map((el) => el.getBoundingClientRect());
    return rs.length ? { top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) } : null;
  };
  const FROM_ABOVE = ['below-panel', 'gutter-left', 'gutter-low'];
  // the sweep line: the right part of stacked options, the middle of a grid (between its columns), the
  // gap after the first card of a single row (QA1: the middle of a row of three ran down a card's text)
  const sweepX = () => {
    const rs = opts().map((el) => el.getBoundingClientRect());
    if (!rs.length) return null;
    const l = Math.min(...rs.map((r) => r.left)), r = Math.max(...rs.map((x) => x.right));
    if (!rs.some((x) => x.left > l + 1)) return r - GAP_INSET;
    const row = rs.every((x) => Math.abs(x.top - rs[0].top) < 2);
    if (row && rs.length % 2) { const [a, b] = [...rs].sort((p, q) => p.left - q.left); return (a.right + b.left) / 2; }
    return (l + r) / 2;
  };
  return (Array.isArray(target) ? target : [target]).flatMap((name) => {
    if (name === 'options-sweep') {
      const k = () => scaleOf(scope);
      return [
        { point: () => { const A = optsBox(), x = sweepX(); return A && x !== null && { x, y: A.top - 14 * k() }; }, from: 'above', sweep: true, hold: 60 },
        { point: () => { const A = optsBox(), x = sweepX(); return A && x !== null && { x, y: A.bottom + 18 * k() }; }, sweep: true, slow: true, hold: 1100 },
      ];
    }
    if (zones[name]) return { point: zones[name], from: FROM_ABOVE.includes(name) ? 'above' : null };
    return { el: name === 'check' ? scope.querySelector('[data-action="check"]') : scope.querySelector(name) };
  });
}

// chip: a short label that travels with the hand (FX1 B1: "Pick one" on the choice screens)
export function createGhost(stage, { ui, steps, restore = null, seen = false, chip = null, onPlay = () => {} }) {
  let timer = null, played = false, cancelled = false;
  const button = h('button', { class: 'w-showme', type: 'button', dataset: { action: 'showMe' } }, glyph('g-hand', { size: 24.32 }), h('span', {}, ui.buttons.showMe));
  // the click that presses "Show me" also stops a running demo first (pointerdown), then replays
  button.addEventListener('click', () => { if (!cancelled) play(); });

  const clear = () => { clearTimeout(timer); timer = null; };
  const idleReset = () => { clear(); if (!played && !cancelled) timer = setTimeout(play, IDLE); };
  function play() {
    clear();
    if (cancelled) return;
    played = true;
    document.removeEventListener('pointerdown', idleReset, true);
    document.removeEventListener('keydown', idleReset, true);
    onPlay();
    stopGhost();
    active = run(stage, steps(), restore, chip);
  }
  if (seen) {
    // a seen type: only after 8 s without input (any input restarts the wait)
    document.addEventListener('pointerdown', idleReset, true);
    document.addEventListener('keydown', idleReset, true);
    idleReset();
  } else {
    timer = setTimeout(play, SETTLE);
  }
  return {
    button,
    play,
    cancel() {
      cancelled = true;
      clear();
      document.removeEventListener('pointerdown', idleReset, true);
      document.removeEventListener('keydown', idleReset, true);
    },
  };
}

// the demo types into a field, one character at a time (never announced: only the value is shown)
const TYPE_MS = 45;
async function typeInto(el, text, stopped) {
  for (let n = 1; n <= text.length; n++) {
    if (stopped()) return;
    el.value = text.slice(0, n);
    el.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, TYPE_MS));
  }
}

// One run of the demo. Returns { stop }.
function run(stage, list, restore, chipOf) {
  const chip = typeof chipOf === 'function' ? chipOf() : chipOf; // (a function: the chip of the moment, S07)
  const targets = list.filter((s) => (s.el && s.el.isConnected) || (s.point && s.point()));
  const ripple = h('span', { class: 'w-ghost-ripple' });
  // the chip shows only once the hand has reached its last step (QA1: travelling with the hand, it
  // covered the options' text on the way)
  const chipEl = chip ? h('span', { class: 'w-ghost-chip' }, chip) : null;
  if (chipEl) chipEl.style.opacity = '0'; // (CSSOM, not a style attribute: the page's CSP blocks those)
  const hand = h('div', { class: 'w-ghost', 'aria-hidden': 'true' }, ripple, glyph('g-hand', { size: HAND, className: 'w-ghost-hand' }), chipEl);
  let done = false;
  const anims = [];
  const stop = () => {
    if (done) return;
    done = true;
    anims.forEach((a) => a.cancel());
    hand.remove();
    document.removeEventListener('pointerdown', stop, true);
    document.removeEventListener('keydown', stop, true);
    if (restore) restore();
    if (active && active.stop === stop) active = null;
  };
  const me = { stop };
  if (!targets.length) { done = true; return me; }
  document.addEventListener('pointerdown', stop, true);
  document.addEventListener('keydown', stop, true);

  // stage px of a step: its element's centre, or its point (the stage is scaled as a whole)
  const s = stage.getBoundingClientRect();
  const k = s.width / stage.offsetWidth || 1;
  const at = (step) => {
    let p = step.point && step.point();
    if (!p) { const r = step.el.getBoundingClientRect(); p = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    return { x: (p.x - s.left) / k, y: (p.y - s.top) / k };
  };
  const place = (p) => `translate(${p.x - TIP.x}px, ${p.y - TIP.y}px)`;
  stage.append(hand);

  if (reducedMotion()) {
    hand.classList.add('w-ghost-static');
    if (chipEl) chipEl.style.opacity = '1';
    hand.append(glyph('g-arrow', { size: 28.16, className: 'w-ghost-arrow' }));
    hand.style.transform = place(at(targets[0]));
    setTimeout(stop, STATIC);
    return me;
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const anim = (el, frames, opts) => { const a = el.animate(frames, { fill: 'forwards', ...opts }); anims.push(a); return a.finished.catch(() => {}); };
  (async () => {
    const first = at(targets[0]);
    // in from below right, or (a gutter target) from above: the hand slides down the gutter
    let from = targets[0].from === 'above' ? { x: first.x, y: first.y - 150 } : { x: first.x + 70, y: first.y + 80 };
    hand.style.transform = place(from);
    await anim(hand, [{ opacity: 0, transform: place(from) }, { opacity: 1, transform: place(from) }], { duration: IN });
    // a step with carry (an element) grabs it there: it moves with the hand to the next steps, and slides
    // back home as the hand leaves (the sort deck: the card dragged down, stopping above the columns)
    let carried = null;
    const shift = (p) => `translate(${p.x - carried.origin.x}px, ${p.y - carried.origin.y}px)`;
    for (const step of targets) {
      if (done) return;
      const to = at(step);
      const easing = 'cubic-bezier(.3,.7,.3,1)';
      const move = step.slow ? MOVE * 3 : MOVE; // a sweep over the options moves slowly enough to follow
      if (carried) anim(carried.el, [{ transform: shift(from) }, { transform: shift(to) }], { duration: move, easing });
      await anim(hand, [{ opacity: 1, transform: place(from) }, { opacity: 1, transform: place(to) }], { duration: move, easing: step.slow ? 'ease-in-out' : easing });
      if (done) return;
      if (!step.sweep) {
        anim(ripple, [{ opacity: 0.55, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 420, easing: 'ease-out' });
        await anim(hand, [{ transform: place(to) + ' scale(1)' }, { transform: place(to) + ' scale(.88)' }, { transform: place(to) + ' scale(1)' }], { duration: TAP });
      }
      if (done) return;
      if (chipEl && step === targets[targets.length - 1]) anim(chipEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
      if (step.tap) step.tap();
      if (step.type) await typeInto(step.type.el, step.type.text, () => done);
      if (step.carry) carried = { el: step.carry, origin: to };
      await wait(step.hold ?? HOLD);
      from = to;
    }
    if (done) return;
    if (carried) anim(carried.el, [{ transform: shift(from) }, { transform: 'none' }], { duration: OUT + 100 });
    await anim(hand, [{ opacity: 1, transform: place(from) }, { opacity: 0, transform: place(from) }], { duration: OUT });
    stop();
  })();
  return me;
}
