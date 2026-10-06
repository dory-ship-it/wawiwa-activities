// Entrance / exit animations, from the original's tween data (fade, fly-in, grow, wipe, motion path).
const WIPE = { fromtop: 'inset(0 0 100% 0)', frombottom: 'inset(100% 0 0 0)', fromleft: 'inset(0 100% 0 0)', fromright: 'inset(0 0 0 100%)' };

export function playAnim(el, a, base = { x: 0, y: 0 }, reverse = false) {
  if (!a) return null;
  const opts = { duration: a.ms || 500, easing: a.easing || 'linear', fill: 'both' };
  let kf;
  switch (a.type) {
    case 'alpha': kf = [{ opacity: a.from / 100 }, { opacity: a.to / 100 }]; break;
    case 'slide': kf = [{ transform: `translate(${a.dx}px, ${a.dy}px)` }, { transform: 'translate(0px, 0px)' }]; break;
    case 'scale': kf = [{ transform: `scale(${a.from})` }, { transform: 'scale(1)' }]; break;
    case 'wipe': kf = [{ clipPath: WIPE[a.direction] || WIPE.fromtop }, { clipPath: 'inset(0 0 0 0)' }]; break;
    case 'move': kf = [{ transform: `translate(${a.from.x - base.x}px, ${a.from.y - base.y}px)` }, { transform: `translate(${a.to.x - base.x}px, ${a.to.y - base.y}px)` }]; break;
    default: return null;
  }
  if (reverse) kf.reverse();
  return el.animate(kf, opts);
}
