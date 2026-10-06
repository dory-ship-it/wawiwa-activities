// Screen 1: cover. Background picture, title, START. START reveals the animated video layer
// (same title and footer on top), which auto-advances after 4.25 s or on click — the
// original's timeline. No PREV/NEXT on this screen, as in the original.
import { coverFooter, img } from './footer.js';

export const coverVideo = {
  hideNav: true,
  render(screen, ctx, el) {
    const { h } = ctx;
    el.appendChild(img(ctx, screen.background.image, 0, 0, 960, 540, screen.background.alt || ''));
    const title = h('h1', { class: 'txt cover-title', style: 'left:44px;top:269px;width:916px;height:113px;font-family:var(--font-calibri-bold);font-weight:normal;font-size:46px;line-height:56px;color:#fff;' });
    title.textContent = screen.title;
    el.appendChild(title);
    el.appendChild(coverFooter(ctx, screen.footer.brand, screen.footer.note));

    const start = h('button', { class: 'start-btn', type: 'button', style: 'left:353px;top:435px;width:254px;height:62px;opacity:0;' });
    start.textContent = screen.start.label;
    el.appendChild(start);

    let timers = [];
    let video = null;
    const after = (ms, fn) => timers.push(setTimeout(fn, ms));

    const begin = () => {
      start.disabled = true;
      start.style.display = 'none';
      // video layer over the picture; title + footer stay on top (the layer repeats them)
      const layer = h('div', { class: 'cover-video-layer', style: 'position:absolute;inset:0;cursor:pointer;' });
      video = h('video', { class: 'obj', style: 'left:0;top:0;width:959px;height:540px;object-fit:cover;opacity:0;transition:opacity 750ms linear;', playsinline: true, preload: 'auto', poster: ctx.asset(screen.video.poster), 'aria-label': screen.video.alt || 'Intro video' });
      video.src = ctx.asset(screen.video.src);
      video.volume = 0.75;
      layer.appendChild(video);
      el.appendChild(layer);
      title.remove(); el.appendChild(title);           // keep title above the video
      const f = el.querySelector('.footer-cover'); f.remove(); el.appendChild(f);
      requestAnimationFrame(() => { video.style.opacity = '1'; });
      // Browsers may refuse sound without a trusted gesture; then play muted so the animation still shows.
      video.play().catch(() => { video.muted = true; return video.play(); }).catch(() => { /* the timer still moves on */ });
      after(4250, () => ctx.next());
      layer.addEventListener('click', () => ctx.next(), { once: true });
    };
    start.addEventListener('click', begin);

    return {
      mount() {
        // original timeline: START fades in from 0.5 s over 0.75 s
        after(500, () => { start.style.transition = 'opacity 750ms linear'; start.style.opacity = '1'; start.focus({ preventScroll: true }); });
      },
      dispose() {
        timers.forEach(clearTimeout); timers = [];
        if (video) { try { video.pause(); video.removeAttribute('src'); video.load(); } catch { /* ignore */ } }
      },
    };
  },
};
