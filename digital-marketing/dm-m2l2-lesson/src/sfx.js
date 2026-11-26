// The lesson's sound effects (Noy, 26 Nov 2026: the CALL ring "should sound only when its screen opens, and there
// should be a mute button at the top"). Films and the podcast keep their own players and volume; this is only for
// short effects a template plays by itself (the phone ring).
//   ctx.sound(audioElement) -> { play(), stop() }   a template asks for its effect through this, never el.play()
// - It sounds only on its own screen: the engine stops every effect when the screen unmounts.
// - A browser may refuse sound before the learner's first click or key on the page (Chrome's autoplay rule: the
//   lesson opened or resumed straight on the screen, a new tab from the overview). Then the effect starts on the
//   learner's first click or key anywhere, if it is still wanted and its screen still shown. (It starts when the
//   press is released, after that click has done its work: a first press on Answer stops the ring, so it never
//   blips.)
// - Never in a review thumbnail (an iframe on review.html), so the overview stays silent.
// - The mute button (zones.js, in the top bar): muted, nothing sounds; the choice is kept in the lesson state
//   (state.m), so it holds for the session and after a relaunch.
export function createSfx({ isMuted, silent = false }) {
  let effects = [];   // the effects of the screen on view: { el, wanted }
  let waiting = false;

  const start = (fx) => {
    if (!fx.wanted || silent || isMuted()) return;
    const p = fx.el.play();
    if (p && p.catch) p.catch(() => wait());
  };
  // the first gesture anywhere starts what the browser refused
  function stopWaiting() {
    waiting = false;
    document.removeEventListener('pointerup', onGesture, true);
    document.removeEventListener('keyup', onGesture, true);
  }
  function onGesture() {
    stopWaiting();
    setTimeout(() => effects.forEach((fx) => { if (fx.wanted && fx.el.paused) start(fx); }), 0);
  }
  function wait() {
    if (waiting) return;
    waiting = true;
    document.addEventListener('pointerup', onGesture, true);
    document.addEventListener('keyup', onGesture, true);
  }

  return {
    // a template's effect on the screen being mounted
    add(el) {
      const fx = { el, wanted: false };
      effects.push(fx);
      return {
        play() { fx.wanted = true; start(fx); },
        stop() { fx.wanted = false; el.pause(); },
      };
    },
    count: () => effects.length,
    // the screen goes: every effect stops, nothing waits for a gesture any more
    clear() {
      effects.forEach((fx) => { fx.wanted = false; fx.el.pause(); });
      effects = [];
      if (waiting) stopWaiting();
    },
    // the mute button changed: silence now, or play again what is still wanted
    refresh() {
      effects.forEach((fx) => { if (isMuted() || silent) fx.el.pause(); else if (fx.wanted && fx.el.paused) start(fx); });
    },
  };
}
