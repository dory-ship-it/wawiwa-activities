// guide: what the use-case library is, and how to use it (EAI M2 L3, E1). Round 3 (25 Nov 2026, Noy: "first the
// left side, then after a few seconds the right side with the video, then the Open the library button under the video;
// the explanation must say what the library is and what to do"). Left: the heading, one line on what the library is
// and what the learner does with it, then the three steps of using it, numbered (a real sequence). Right, a moment
// later: the silent recording of the library page, then "Open the library" (new tab) under it. Motion once; none with
// reduced motion or a revisit (then everything is there at once). Presentation: Next is open.
// Round 4 (26 Nov 2026, Noy): the build-up slower; the recording never plays by itself: it sits in the lesson's own
// player (the large Play disc on the picture, then the bar under it: play / pause, time, seek, speed, sound, full
// screen), the same classes and speeds as the films (src/templates/video.js, src/speeds.js). No captions: it is silent.
// Content: eyebrow, lead, steps [text], video { src, poster, label, alt, duration }, open { label, href }, delay (ms).
import { h, fmt, reducedMotion } from '../src/util.js?v=044f9db2';
import { glyph, icon } from '../src/icons.js?v=044f9db2';
import { layout, focusHead } from '../src/templates/stage.js?v=044f9db2';
import { SPEEDS, readRate, keepRate } from '../src/speeds.js?v=044f9db2';

const mmss = (t) => { const s = Math.max(0, Math.floor(t || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// the lesson's player, small: a frame with the Play disc, the bar under it
function player(ctx, v) {
  const t = ctx.ui.video;
  const vid = h('video', { class: 'w-video', src: v.src, poster: v.poster, preload: 'metadata', playsinline: true, 'aria-label': v.alt });
  vid.muted = true; // a silent recording; the sound button stays for the habit of the player
  const bigPlay = h('button', { class: 'w-bigplay', type: 'button', 'aria-label': t.play }, glyph('watch', { size: 44 }));
  const frame = h('div', { class: 'w-frame' }, vid, bigPlay);
  const playBtn = h('button', { class: 'w-play-btn', type: 'button', 'aria-label': t.play }, glyph('watch', { size: 26 }));
  const time = h('span', { class: 'w-time' });
  const fill = h('span', { class: 'w-seek-fill' });
  const seek = h('div', { class: 'w-seek', role: 'slider', tabindex: '0', 'aria-label': t.seek, 'aria-valuemin': '0' }, h('span', { class: 'w-seek-track' }, fill));
  // speed: the films' menu (Normal, 0.5 to 2), kept for the session
  let rate = readRate();
  const badge = h('span', { class: 'w-speed-badge', 'aria-hidden': 'true' });
  const speedBtn = h('button', { class: 'w-tool w-speed', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, icon('gauge', { size: 24 }), badge);
  const items = SPEEDS.map((x) => h('button', { class: 'w-speed-item', type: 'button', role: 'menuitemradio', 'aria-checked': 'false', dataset: { rate: String(x) } },
    h('span', { class: 'w-speed-tick', 'aria-hidden': 'true' }, glyph('g-check', { size: 16 })), h('span', {}, x === 1 ? t.speedNormal : fmt(t.speedChip, { x }))));
  const menu = h('div', { class: 'w-speed-menu', role: 'menu', 'aria-label': t.speedMenu, hidden: true }, h('p', { class: 'w-speed-head', 'aria-hidden': 'true' }, t.speedMenu), items);
  const applyRate = () => {
    vid.defaultPlaybackRate = rate; vid.playbackRate = rate;
    badge.textContent = rate === 1 ? '' : fmt(t.speedChip, { x: rate });
    speedBtn.setAttribute('aria-label', fmt(t.speed, { x: rate }));
    items.forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.rate) === rate)));
  };
  const openMenu = (on) => { menu.hidden = !on; speedBtn.setAttribute('aria-expanded', String(on)); if (on) (items.find((b) => b.getAttribute('aria-checked') === 'true') || items[0]).focus(); };
  speedBtn.addEventListener('click', () => openMenu(menu.hidden));
  items.forEach((b) => b.addEventListener('click', () => { rate = Number(b.dataset.rate); keepRate(rate); applyRate(); openMenu(false); speedBtn.focus(); }));
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); openMenu(false); speedBtn.focus(); } });
  const speedWrap = h('div', { class: 'w-speed-wrap' }, menu, speedBtn);
  const outside = (e) => { if (!menu.hidden && !speedWrap.contains(e.target)) openMenu(false); };
  document.addEventListener('pointerdown', outside, true);
  vid.addEventListener('loadedmetadata', applyRate);
  applyRate();
  const muteBtn = h('button', { class: 'w-tool w-mute', type: 'button', 'aria-label': t.mute, 'aria-pressed': 'true' }, glyph('g-muted', { size: 24 }));
  muteBtn.addEventListener('click', () => { vid.muted = !vid.muted; muteBtn.setAttribute('aria-pressed', String(vid.muted)); muteBtn.replaceChildren(glyph(vid.muted ? 'g-muted' : 'g-volume', { size: 24 })); });
  const col = h('div', { class: 'm-lib-player', dataset: { phase: 'ready' } });
  const fsBtn = document.fullscreenEnabled ? h('button', { class: 'w-tool w-fs', type: 'button', 'aria-label': t.fullscreen, 'aria-pressed': 'false' }, icon('maximize', { size: 24 })) : null;
  const onFull = () => { if (!fsBtn) return; const on = document.fullscreenElement === col; fsBtn.setAttribute('aria-pressed', String(on)); fsBtn.setAttribute('aria-label', on ? t.exitFullscreen : t.fullscreen); };
  if (fsBtn) { fsBtn.addEventListener('click', () => { if (document.fullscreenElement === col) document.exitFullscreen().catch(() => {}); else col.requestFullscreen().catch(() => {}); }); document.addEventListener('fullscreenchange', onFull); }
  const controls = h('div', { class: 'w-controls', role: 'group', 'aria-label': t.controls }, playBtn, time, seek, speedWrap, muteBtn, fsBtn);
  col.append(frame, controls);

  const dur = () => (Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : v.duration || 0);
  const render = () => {
    const d = dur(), now = Math.min(vid.currentTime || 0, d || Infinity);
    time.textContent = `${mmss(now)} / ${mmss(d)}`;
    fill.style.width = (d ? (100 * now) / d : 0) + '%';
    seek.setAttribute('aria-valuemax', String(Math.round(d)));
    seek.setAttribute('aria-valuenow', String(Math.round(now)));
    const playing = !vid.paused && !vid.ended;
    if (playing || now > 0) col.dataset.phase = 'playing';
    playBtn.setAttribute('aria-label', playing ? t.pause : t.play);
    playBtn.replaceChildren(glyph(playing ? 'g-pause' : 'watch', { size: 26 }));
  };
  ['timeupdate', 'play', 'pause', 'ended', 'loadedmetadata', 'seeked'].forEach((ev) => vid.addEventListener(ev, render));
  const playPause = () => { if (vid.paused || vid.ended) { if (vid.ended) vid.currentTime = 0; vid.play().catch(() => {}); } else vid.pause(); };
  playBtn.addEventListener('click', playPause);
  bigPlay.addEventListener('click', () => { playPause(); playBtn.focus(); });
  const seekTo = (s) => { vid.currentTime = Math.max(0, Math.min(s, dur())); render(); };
  seek.addEventListener('keydown', (e) => {
    const now = vid.currentTime || 0;
    const to = { ArrowRight: now + 5, ArrowUp: now + 5, ArrowLeft: now - 5, ArrowDown: now - 5, Home: 0, End: dur() }[e.key];
    if (to === undefined) return;
    e.preventDefault(); seekTo(to);
  });
  const fromPointer = (e) => { const r = seek.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * dur()); };
  seek.addEventListener('pointerdown', (e) => { seek.setPointerCapture(e.pointerId); fromPointer(e); });
  seek.addEventListener('pointermove', (e) => { if (seek.hasPointerCapture(e.pointerId)) fromPointer(e); });
  render();
  return { el: col, stop() { vid.pause(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('fullscreenchange', onFull); if (document.fullscreenElement === col) document.exitFullscreen().catch(() => {}); } };
}

export const guide = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const delay = screen.delay || 3800;
    const later = (el, ms) => { if (!still) { el.classList.add('m-lib-in'); el.style.setProperty('--d', ms + 'ms'); } return el; };
    const lead = later(h('p', { class: 'm-lib-lead' }, screen.lead), 500);
    const steps = h('ol', { class: 'm-lib-steps' }, screen.steps.map((t, i) => later(h('li', {}, h('span', { class: 'm-lib-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, t)), 1300 + i * 750)));
    const open = h('a', { class: 'm-lib-open', href: ctx.content.links?.library || screen.open.href, target: '_blank', rel: 'noopener' },
      h('span', {}, screen.open.label), icon('external-link', { size: 22 }));
    const v = screen.video;
    const p = player(ctx, v);
    const right = later(h('figure', { class: 'm-lib-right' }, h('figcaption', {}, v.label), p.el, open), delay);
    layout(ctx, 'libguide', h('div', { class: 'm-lib-left' }, focusHead(screen.eyebrow, 'overview', zones.instruction), lead, steps), right);
    zones.setHintVisible(false);
    return { unmount() { p.stop(); } };
  },
};
