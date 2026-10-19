// The ghost hand (Round 4, ref R4-O2-module): a semi-transparent white hand pointer with a navy
// outline and a soft teal ripple that shows an interaction once. It only draws: it never selects,
// checks or tracks anything (a step's tap() may change what is shown, e.g. open a tab, and the
// restore() callback puts it back). aria-hidden; the written instruction always stays.
//   createGhost(stage, { ui, steps, restore, seen, onPlay }) -> { button, play, cancel }
//     steps()   -> [{ el, tap? }] the targets in order, read when the demo starts
//     seen      false: plays ~600 ms after the screen settles; true: only after 8 s without input
//     button    the "Show me" text button (the template places it next to its instruction)
// Timing: in ~150 ms, then per step a 450 ms move, a tap with a ripple, a short hold; out by 3 s.
// Any pointer or key input stops it at once. prefers-reduced-motion: no motion, a static hand and
// arrow at the first target for 3 s.
import { h, reducedMotion } from './util.js';
import { icon } from './icons.js';

const SETTLE = 600, IDLE = 8000, STATIC = 3000;
const MOVE = 450, TAP = 140, HOLD = 260, IN = 150, OUT = 200;
const TIP = { x: 21, y: 5 }; // the fingertip inside the 56 px pointer icon

let active = null; // the demo on screen now (one at a time)

export function stopGhost() { if (active) active.stop(); }

export function createGhost(stage, { ui, steps, restore = null, seen = false, onPlay = () => {} }) {
  let timer = null, played = false, cancelled = false;
  const button = h('button', { class: 'w-link w-showme', type: 'button', dataset: { action: 'showMe' } }, ui.buttons.showMe);
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
    active = run(stage, steps(), restore);
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

// One run of the demo. Returns { stop }.
function run(stage, list, restore) {
  const targets = list.filter((s) => s.el && s.el.isConnected);
  const ripple = h('span', { class: 'w-ghost-ripple' });
  const hand = h('div', { class: 'w-ghost', 'aria-hidden': 'true' }, ripple, icon('pointer', { size: 56, className: 'w-ghost-hand' }));
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

  // stage px of an element's centre (the stage is scaled as a whole)
  const s = stage.getBoundingClientRect();
  const k = s.width / stage.offsetWidth || 1;
  const at = (el) => { const r = el.getBoundingClientRect(); return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height / 2) / k }; };
  const place = (p) => `translate(${p.x - TIP.x}px, ${p.y - TIP.y}px)`;
  stage.append(hand);

  if (reducedMotion()) {
    hand.classList.add('w-ghost-static');
    hand.append(icon('arrow-right', { size: 28, className: 'w-ghost-arrow' }));
    hand.style.transform = place(at(targets[0].el));
    setTimeout(stop, STATIC);
    return me;
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const anim = (el, frames, opts) => { const a = el.animate(frames, { fill: 'forwards', ...opts }); anims.push(a); return a.finished.catch(() => {}); };
  (async () => {
    const first = at(targets[0].el);
    let from = { x: first.x + 70, y: first.y + 80 };
    hand.style.transform = place(from);
    await anim(hand, [{ opacity: 0, transform: place(from) }, { opacity: 1, transform: place(from) }], { duration: IN });
    for (const step of targets) {
      if (done) return;
      const to = at(step.el);
      await anim(hand, [{ opacity: 1, transform: place(from) }, { opacity: 1, transform: place(to) }], { duration: MOVE, easing: 'cubic-bezier(.3,.7,.3,1)' });
      if (done) return;
      anim(ripple, [{ opacity: 0.55, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 420, easing: 'ease-out' });
      await anim(hand, [{ transform: place(to) + ' scale(1)' }, { transform: place(to) + ' scale(.88)' }, { transform: place(to) + ' scale(1)' }], { duration: TAP });
      if (done) return;
      if (step.tap) step.tap();
      await wait(step.hold ?? HOLD);
      from = to;
    }
    if (done) return;
    await anim(hand, [{ opacity: 1, transform: place(from) }, { opacity: 0, transform: place(from) }], { duration: OUT });
    stop();
  })();
  return me;
}
