// Video template (V1, V2), approved look R3-video-play / R3-video-stop, layout "video".
// Play view: instruction, title + "Video · length · N stops", guiding question; the player (custom
// controls: play / pause, time, a seek slider with one diamond per stop, captions, mute, transcript)
// and the transcript panel that marks the current line. Everything is read from the content: media.src,
// media.captions[0].src (WebVTT, parsed here), media.duration, stops[].t. Swapping the real film in is a
// change of those paths and times only.
// Stops: playback (or a seek) reaching an unanswered stop pauses the video and switches to the stop
// view: the paused frame left, the question right with its options and the feedback band; "Resume
// video" stays locked until the right answer. Seeking forward never passes the part already watched
// or the next unanswered stop (the slider clamps, a polite note says why). First attempt per stop on the tracking bus. Next unlocks
// when the video has ended and every stop is answered.
import { h, fmt, nextId } from '../util.js';
import { icon } from '../icons.js';
import { letter } from '../tracking/index.js';
import { layout, ruleLabel, arrowNav } from './stage.js';
import { targetSteps } from '../ghost.js';

const SEEK_STEP = 5, SEEK_PAGE = 15, AT_STOP = 0.05, AT_END = 0.3;
const mmss = (t) => { const s = Math.max(0, Math.floor(t)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// minimal WebVTT parser: [{ start, end, text }]
export function parseVTT(text) {
  const time = (s) => { const p = s.trim().split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
  return text.replace(/\r/g, '').split(/\n\n+/).map((block) => {
    const lines = block.split('\n');
    const i = lines.findIndex((l) => l.includes('-->'));
    if (i < 0) return null;
    const [a, b] = lines[i].split('-->');
    return { start: time(a), end: time(b.trim().split(/\s+/)[0]), text: lines.slice(i + 1).join(' ').trim() };
  }).filter((c) => c && c.text);
}

export const video = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const v = ui.video, media = screen.media, stops = screen.stops || [];
    const duration = media.duration;
    const answered = new Set();
    let cues = [], ended = false, done = false, atStop = null;

    /* ---- the video element (moves between the player and the stop view) ---- */
    const vid = h('video', { class: 'w-video', src: media.src, poster: media.poster || null, preload: 'auto', playsinline: true, tabindex: '-1', 'aria-label': screen.title });
    const caption = h('p', { class: 'w-caption', hidden: true });
    const frame = h('div', { class: 'w-player-frame' }, vid, caption);

    /* ---- controls ---- */
    const playBtn = h('button', { class: 'w-play-btn', type: 'button', 'aria-label': v.play, dataset: { action: 'play' } }, icon('play', { size: 18 }));
    const timeText = h('span', { class: 'w-time' });
    const fill = h('span', { class: 'w-seek-fill' });
    const thumb = h('span', { class: 'w-seek-thumb' });
    const markers = stops.map((s, i) => {
      const m = h('span', { class: 'w-seek-stop', dataset: { stop: s.id } });
      m.style.left = (100 * s.t) / duration + '%';
      m.title = fmt(v.stopMarker, { i: i + 1, t: mmss(s.t) });
      return m;
    });
    const seek = h('div', { class: 'w-seek', role: 'slider', tabindex: '0', 'aria-label': v.seek, 'aria-valuemin': '0', 'aria-valuemax': String(duration) },
      h('span', { class: 'w-seek-track' }), fill, markers, thumb);
    const toggle = (cls, label, name, pressed) => h('button', { class: 'w-tool ' + cls, type: 'button', 'aria-label': label, 'aria-pressed': String(pressed) }, icon(name, { size: 22 }));
    const ccBtn = toggle('w-cc', v.captions, 'captions', true);
    const muteBtn = toggle('w-mute', v.mute, 'volume', false);
    const trBtn = toggle('w-tr', v.transcript, 'transcript', false); // closed until the learner opens it
    const limitNote = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const controls = h('div', { class: 'w-controls', role: 'group', 'aria-label': v.controls }, playBtn, timeText, seek, ccBtn, muteBtn, trBtn, limitNote);

    /* ---- transcript ---- */
    const trList = h('div', { class: 'w-transcript-list' });
    const transcript = h('aside', { class: 'w-transcript', 'aria-label': v.transcript, hidden: true }, h('h2', { class: 'w-transcript-head' }, v.transcript), trList);

    /* ---- play view ---- */
    const meta = h('p', { class: 'w-video-meta' }, h('span', { class: 'w-video-title' }, screen.title), ' · ', fmt(v.meta, { length: media.length, n: stops.length }));
    const guiding = h('p', { class: 'w-guiding' }, h('b', {}, screen.guidingLabel || v.guiding), ' ', screen.guidingQuestion);
    const player = h('figure', { class: 'w-player' }, frame, controls);
    // transcript closed: heading and player centred; open: player left, transcript right
    const playView = h('div', { class: 'w-video-view', dataset: { transcript: 'closed' } }, h('div', { class: 'w-video-head' }, zones.instruction, meta, guiding), player, transcript);

    /* ---- stop view ---- */
    const stopFrame = h('figure', { class: 'w-stop-frame' });
    const pausedChip = h('figcaption', { class: 'w-paused' }, icon('pause', { size: 16 }), h('span', {}));
    stopFrame.append(pausedChip);
    const stopLabel = ruleLabel('');
    const stopQ = h('h2', { class: 'w-stop-q', id: nextId('w-stop-q'), tabindex: '-1' });
    const stopOpts = h('div', { class: 'w-options w-options-stack', role: 'group', 'aria-labelledby': stopQ.id, dataset: { interaction: '' } });
    arrowNav(stopOpts);
    const resumeText = h('span', {}, v.resume);
    const resumeLock = icon('lock', { size: 16 });
    const resume = h('button', { class: 'w-btn w-btn-ghost w-resume', type: 'button', dataset: { action: 'resume' } }, resumeLock, resumeText);
    const showMeSlot = h('div', { class: 'w-showme-slot' });
    const stopPanel = h('section', { class: 'w-stop-panel' }, stopLabel, h('div', { class: 'w-stop-head' }, stopQ, showMeSlot), stopOpts);
    let ghost = null; // the ghost hand of the open stop (type "stop": taps beside the options, selects nothing)
    const stopView = h('div', { class: 'w-stop-view', hidden: true }, stopFrame, stopPanel);

    layout(ctx, 'video', zones.logo, playView, stopView);

    /* ---- time, slider, captions, transcript ---- */
    // forward seeking stops at the furthest point already watched (and never passes an open stop);
    // backward is always free. A finished video (revisit) seeks freely.
    let reached = 0;
    const nextStop = () => stops.find((s) => !answered.has(s.id)) || null;
    const limit = () => (done ? duration : Math.min(reached, nextStop() ? nextStop().t : duration));
    function render() {
      const t = Math.min(vid.currentTime || 0, duration);
      timeText.textContent = `${mmss(t)} / ${mmss(duration)}`;
      fill.style.width = (100 * t) / duration + '%';
      thumb.style.left = (100 * t) / duration + '%';
      seek.setAttribute('aria-valuenow', String(Math.round(t)));
      seek.setAttribute('aria-valuetext', fmt(v.seekText, { t: mmss(t), d: mmss(duration) }));
      markers.forEach((m, i) => { m.dataset.done = String(answered.has(stops[i].id)); });
      const k = cues.findIndex((c) => t >= c.start && t < c.end);
      caption.textContent = k >= 0 ? cues[k].text : '';
      caption.hidden = k < 0 || ccBtn.getAttribute('aria-pressed') !== 'true';
      [...trList.children].forEach((p, i) => {
        const on = i === k;
        if ((p.dataset.active === 'true') === on) return;
        p.dataset.active = String(on);
        if (on) { p.setAttribute('aria-current', 'true'); trList.scrollTop = Math.max(0, p.offsetTop - trList.offsetTop - 12); } else p.removeAttribute('aria-current');
      });
      const playing = !vid.paused && !vid.ended;
      playBtn.setAttribute('aria-label', playing ? v.pause : v.play);
      playBtn.replaceChildren(icon(playing ? 'pause' : 'play', { size: 18 }));
    }
    fetch(media.captions[0].src).then((r) => (r.ok ? r.text() : '')).then((txt) => {
      cues = parseVTT(txt);
      trList.replaceChildren(...cues.map((c) => h('p', { class: 'w-tline' }, h('span', { class: 'w-tline-time' }, mmss(c.start)), c.text)));
      render();
    }).catch(() => {});

    function check() {
      const t = vid.currentTime || 0;
      const s = nextStop();
      if (s && t >= s.t - AT_STOP) { enterStop(s); return; }
      if (!s && !done && (ended || t >= duration - AT_END)) finish(true);
    }
    function finish(focus) {
      done = true;
      ctx.complete();
      ctx.unlockNext({ focus });
    }
    // seek to t, never past the next unanswered stop
    function seekTo(t) {
      const max = limit();
      if (t > max + AT_STOP) limitNote.textContent = nextStop() && Math.abs(max - nextStop().t) <= AT_STOP ? v.seekLimit : v.seekAhead;
      vid.currentTime = Math.max(0, Math.min(t, max));
      render();
    }

    vid.addEventListener('timeupdate', () => { if (!vid.seeking && !vid.paused) reached = Math.max(reached, vid.currentTime); render(); check(); });
    vid.addEventListener('seeked', () => { render(); check(); });
    vid.addEventListener('play', render);
    vid.addEventListener('pause', render);
    vid.addEventListener('ended', () => { ended = true; render(); check(); });
    vid.addEventListener('seeking', () => { if (vid.currentTime > limit() + AT_STOP) vid.currentTime = limit(); });

    playBtn.addEventListener('click', () => { if (vid.paused || vid.ended) { if (vid.ended) { ended = false; vid.currentTime = 0; } vid.play().catch(() => {}); } else vid.pause(); });
    seek.addEventListener('keydown', (e) => {
      const t = vid.currentTime || 0;
      const to = { ArrowRight: t + SEEK_STEP, ArrowUp: t + SEEK_STEP, ArrowLeft: t - SEEK_STEP, ArrowDown: t - SEEK_STEP,
        PageUp: t + SEEK_PAGE, PageDown: t - SEEK_PAGE, Home: 0, End: duration }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      seekTo(to);
    });
    const fromPointer = (e) => { const r = seek.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * duration); };
    seek.addEventListener('pointerdown', (e) => { seek.setPointerCapture(e.pointerId); fromPointer(e); });
    seek.addEventListener('pointermove', (e) => { if (seek.hasPointerCapture(e.pointerId)) fromPointer(e); });
    const flip = (btn) => btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
    ccBtn.addEventListener('click', () => { flip(ccBtn); render(); });
    muteBtn.addEventListener('click', () => { flip(muteBtn); vid.muted = muteBtn.getAttribute('aria-pressed') === 'true'; muteBtn.replaceChildren(icon(vid.muted ? 'volume-x' : 'volume', { size: 22 })); });
    trBtn.addEventListener('click', () => {
      flip(trBtn);
      transcript.hidden = trBtn.getAttribute('aria-pressed') !== 'true';
      playView.dataset.transcript = transcript.hidden ? 'closed' : 'open';
      render();
    });

    /* ---- stops ---- */
    function setResume(locked) {
      resume.dataset.locked = String(locked);
      resumeLock.style.display = locked ? '' : 'none';
      if (locked) { resume.setAttribute('aria-disabled', 'true'); resume.setAttribute('aria-label', v.resumeLocked); }
      else { resume.removeAttribute('aria-disabled'); resume.removeAttribute('aria-label'); }
    }
    function enterStop(s) {
      if (atStop) return;
      atStop = s;
      vid.pause();
      vid.currentTime = s.t;
      const i = stops.indexOf(s);
      stopFrame.prepend(vid);
      pausedChip.lastChild.textContent = fmt(v.pausedAt, { t: mmss(s.t) });
      stopLabel.lastChild.textContent = fmt(v.stopLabel, { i: i + 1, n: stops.length, title: screen.title });
      stopQ.textContent = s.question;
      let chosen = -1, right = false;
      const btns = s.options.map((o, k) => h('button', { class: 'w-opt w-opt-stack', type: 'button', dataset: { id: o.id, letter: letter(k) } },
        h('span', { class: 'w-opt-mark' }), h('span', { class: 'w-opt-label' }, o.label)));
      stopOpts.replaceChildren(...btns);
      const paint = (k, res) => btns.forEach((b, j) => {
        b.dataset.result = j === k ? res : '';
        b.querySelector('.w-opt-mark').replaceChildren(j === k && res ? icon(res === 'correct' ? 'check' : 'x', { size: 16, label: res === 'correct' ? ui.feedback.correctPrefix : ui.feedback.wrongPrefix }) : '');
      });
      btns.forEach((b, k) => b.addEventListener('click', () => {
        if (right || k === chosen) return;
        chosen = k;
        const o = s.options[k];
        ctx.answer({ trackingId: s.tracking.id, response: letter(k), result: o.correct ? 'correct' : 'wrong' });
        paint(k, o.correct ? 'correct' : 'wrong');
        zones.setFeedback({ state: o.correct ? 'correct' : 'wrong', text: o.feedback });
        if (!o.correct) return;
        right = true;
        answered.add(s.id);
        btns.forEach((x) => x.setAttribute('aria-disabled', 'true'));
        setResume(false);
        resume.focus();
      }));
      stopPanel.append(zones.band, resume);
      zones.setFeedback({ state: 'hint', text: ui.videoResumeNote });
      setResume(true);
      playView.hidden = true;
      stopView.hidden = false;
      stopQ.focus({ preventScroll: true });
      if (screen.ghost) {
        // the target the content names (V1, V2: the gap between the first two options, on none of
        // them); without one, the first option
        ghost = ctx.ghost({ type: screen.ghost.type, steps: () => (screen.ghost.target ? targetSteps(stopOpts, screen.ghost.target) : [{ el: btns[0] }]) });
        showMeSlot.replaceChildren(ghost.button);
      }
    }
    resume.addEventListener('click', () => {
      if (!atStop || resume.dataset.locked === 'true') return;
      atStop = null;
      if (ghost) { ghost.cancel(); ghost = null; showMeSlot.replaceChildren(); }
      frame.prepend(vid);
      stopView.hidden = true;
      playView.hidden = false;
      render();
      vid.play().catch(() => {});
      playBtn.focus();
    });

    render();
    if (ctx.revisit) { stops.forEach((s) => answered.add(s.id)); done = true; ctx.unlockNext({ focus: false }); render(); }
    return { unmount() { vid.pause(); vid.removeAttribute('src'); vid.load(); } };
  },
};
