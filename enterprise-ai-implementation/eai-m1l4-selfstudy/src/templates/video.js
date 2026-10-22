// Video template (V1, V2), "Hybrid cinematic" look, a Stage screen: the video fills the stage under
// the top bar.
//   ready    the chapter photo (the film is shown once it plays); a glass card top left (play icon,
//            "Video", the length chip, the title, "Watch for:" and the instruction); a large Play disc
//            (the current-step disc at about 2.8x); the player bar.
//   playing  one caption line on glass above the player bar. Player bar (glass): play / pause, time,
//            the track (step-bar weight, turquoise fill, one ringed disc per stop), CC (a chip),
//            volume, transcript (kept: the media alternative; a glass panel on the right).
//   stop     playback (or a seek) reaching an unanswered stop pauses the film: the question on the
//            glass card ("Stop 1 of 2" + time chip), the answers in the panel right, the player bar
//            hidden. "Resume video" (the band's tool) stays locked (grey, lock) until the right
//            answer, then becomes the outline button with the play icon. Next stays locked until the
//            film ends and every stop is answered. First attempt per stop on the tracking bus.
// Everything is read from the content: media.src, media.captions[0].src (WebVTT, parsed here),
// media.duration, stops[].t. Swapping the real film in is a change of those paths and times only.
// Seeking forward never passes the part already watched or the next unanswered stop (the slider
// clamps, a polite note says why).
import { h, fmt, nextId } from '../util.js?v=1e11956b';
import { glyph } from '../icons.js?v=1e11956b';
import { letter } from '../tracking/index.js?v=1e11956b';
import { layout, sheet, glassKicker, arrowNav, paintAnswer } from './stage.js?v=1e11956b';
import { targetSteps } from '../ghost.js?v=1e11956b';

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
  scene: () => 'stage',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const v = ui.video, media = screen.media, stops = screen.stops || [];
    const duration = media.duration;
    const answered = new Set();
    let cues = [], ended = false, done = false, atStop = null;

    /* ---- the film: fills main (under the bar); hidden until it first plays, so the photo shows ---- */
    const vid = h('video', { class: 'w-video', src: media.src, poster: media.poster || null, preload: 'auto', playsinline: true, tabindex: '-1', 'aria-label': screen.title, dataset: { started: 'false' } });
    const caption = h('p', { class: 'w-caption', hidden: true });

    /* ---- player bar ---- */
    const playBtn = h('button', { class: 'w-play-btn', type: 'button', 'aria-label': v.play, dataset: { action: 'play' } }, glyph('watch', { size: 30.72 }));
    const timeText = h('span', { class: 'w-time' });
    const fill = h('span', { class: 'w-seek-fill' });
    const markers = stops.map((s, i) => {
      const m = h('span', { class: 'w-seek-stop', dataset: { stop: s.id } });
      m.style.left = (100 * s.t) / duration + '%';
      m.title = fmt(v.stopMarker, { i: i + 1, t: mmss(s.t) });
      return m;
    });
    const seek = h('div', { class: 'w-seek', role: 'slider', tabindex: '0', 'aria-label': v.seek, 'aria-valuemin': '0', 'aria-valuemax': String(duration) },
      h('span', { class: 'w-seek-track' }, fill, markers));
    const tool = (cls, label, child, pressed) => h('button', { class: 'w-tool ' + cls, type: 'button', 'aria-label': label, 'aria-pressed': String(pressed) }, child);
    const ccBtn = tool('w-cc', v.captions, h('span', { class: 'w-cc-chip', 'aria-hidden': 'true' }, v.ccChip), true);
    const muteBtn = tool('w-mute', v.mute, glyph('g-volume', { size: 28.16 }), false);
    const trBtn = tool('w-tr', v.transcript, glyph('learn', { size: 28.16 }), false); // closed until the learner opens it
    const limitNote = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const controls = h('div', { class: 'w-controls', role: 'group', 'aria-label': v.controls }, playBtn, timeText, seek, ccBtn, muteBtn, trBtn, limitNote);

    /* ---- transcript (glass panel, right) ---- */
    const trList = h('div', { class: 'w-transcript-list' });
    const transcript = h('aside', { class: 'w-transcript', 'aria-label': v.transcript, hidden: true }, h('h2', { class: 'w-transcript-head' }, v.transcript), trList);

    /* ---- ready card and the large Play disc ---- */
    const guiding = h('p', { class: 'w-guiding' }, h('b', {}, screen.guidingLabel || v.guiding), ' ', screen.guidingQuestion);
    const readyCard = h('section', { class: 'w-glass w-glass-top w-video-head' },
      glassKicker('watch', v.kicker, media.length), h('p', { class: 'w-video-title' }, screen.title), guiding, zones.instruction);
    const bigPlay = h('button', { class: 'w-bigplay', type: 'button', 'aria-label': v.play, dataset: { action: 'bigplay' } }, glyph('watch', { size: 64 }));
    const playView = h('div', { class: 'w-video-view', dataset: { transcript: 'closed', phase: 'ready' } }, readyCard, bigPlay, caption, transcript);

    /* ---- stop view ---- */
    const stopQ = h('h2', { class: 'w-stop-q', id: nextId('w-stop-q'), tabindex: '-1' });
    const stopTools = h('div', { class: 'w-card-tools' });
    const stopCard = h('section', { class: 'w-glass w-glass-top w-stop-card' }, glassKicker('watch', '', ''), stopQ, stopTools); // the kicker is set per stop
    const stopOpts = h('div', { class: 'w-options w-ans-list w-ans-cols-1', role: 'group', 'aria-labelledby': stopQ.id, dataset: { interaction: '' } });
    arrowNav(stopOpts);
    const resume = h('button', { class: 'w-btn w-btn-action w-resume', type: 'button', dataset: { action: 'resume' } },
      glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }), glyph('watch', { size: 24.32, className: 'w-resume-play' }), h('span', {}, v.resume));
    const stopPanel = sheet('right w-sheet-44 w-stop-panel', stopOpts);
    let ghost = null; // the ghost hand of the open stop (type "stop": it slides down the panel's gutter)
    const stopView = h('div', { class: 'w-stop-view', hidden: true }, stopCard, stopPanel);

    // FX1 C: the player bar stays on screen at a stop too (inert there: seeking waits for the answer);
    // the stop's card and panel sit above it, nothing overlaps it
    layout(ctx, 'video', vid, playView, stopView, controls);
    zones.main.dataset.transcript = 'closed';

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
      if (playing || t > 0) { vid.dataset.started = 'true'; playView.dataset.phase = 'playing'; }
      playBtn.setAttribute('aria-label', playing ? v.pause : v.play);
      playBtn.replaceChildren(glyph(playing ? 'g-pause' : 'watch', { size: 30.72 }));
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

    const playPause = () => { if (vid.paused || vid.ended) { if (vid.ended) { ended = false; vid.currentTime = 0; } vid.play().catch(() => {}); } else vid.pause(); };
    playBtn.addEventListener('click', playPause);
    bigPlay.addEventListener('click', () => { playPause(); playBtn.focus(); });
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
    muteBtn.addEventListener('click', () => { flip(muteBtn); vid.muted = muteBtn.getAttribute('aria-pressed') === 'true'; muteBtn.replaceChildren(glyph(vid.muted ? 'g-muted' : 'g-volume', { size: 28.16 })); });
    trBtn.addEventListener('click', () => {
      flip(trBtn);
      transcript.hidden = trBtn.getAttribute('aria-pressed') !== 'true';
      playView.dataset.transcript = transcript.hidden ? 'closed' : 'open';
      zones.main.dataset.transcript = playView.dataset.transcript; // FX1 C3: the film shrinks to the left
      render();
    });

    /* ---- stops ---- */
    function setResume(locked) {
      resume.dataset.locked = String(locked);
      if (locked) { resume.setAttribute('aria-disabled', 'true'); resume.setAttribute('aria-label', v.resumeLocked); }
      else { resume.removeAttribute('aria-disabled'); resume.removeAttribute('aria-label'); }
    }
    function enterStop(s) {
      if (atStop) return;
      atStop = s;
      vid.pause();
      vid.currentTime = s.t;
      const i = stops.indexOf(s);
      stopCard.querySelector('.w-glass-kicker').replaceWith(glassKicker('watch', fmt(v.stopKicker, { i: i + 1, n: stops.length }), mmss(s.t)));
      stopQ.textContent = s.question;
      let chosen = -1, right = false;
      const btns = s.options.map((o, k) => h('button', { class: 'w-opt w-ans', type: 'button', dataset: { id: o.id, letter: letter(k) } },
        h('span', { class: 'w-opt-mark w-ans-mark' }), h('span', { class: 'w-opt-label' }, o.label)));
      stopOpts.replaceChildren(...btns);
      const paint = (k, res) => btns.forEach((b, j) => paintAnswer(b, j === k ? res : '', ui));
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
      stopPanel.append(zones.band);
      // FX1 C2: Resume (and "Show me how") on the glass card, so the panel (answers + strip) stays above
      // the player bar
      stopTools.replaceChildren(resume);
      zones.setHintVisible(false); // the frame shows no hint line at a stop: the note stays for screen readers
      zones.setFeedback({ state: 'hint', text: ui.videoResumeNote });
      setResume(true);
      playView.hidden = true;
      stopView.hidden = false;
      controls.inert = true;
      controls.dataset.stop = 'true';
      stopQ.focus({ preventScroll: true });
      if (screen.ghost) {
        // FX1 B1: the sweep over the answers with "Pick one" (the content's target), "Show me how" on the card
        ghost = ctx.ghost({ type: screen.ghost.type, chip: ui.ghost.pickOne, steps: () => targetSteps(stopView, screen.ghost.target) });
        if (screen.ghost.showMe) stopTools.prepend(ghost.button);
      }
    }
    resume.addEventListener('click', () => {
      if (!atStop || resume.dataset.locked === 'true') return;
      atStop = null;
      if (ghost) { ghost.cancel(); ghost.button.remove(); ghost = null; }
      stopTools.replaceChildren();
      stopView.hidden = true;
      playView.hidden = false;
      controls.inert = false;
      delete controls.dataset.stop;
      render();
      vid.play().catch(() => {});
      playBtn.focus();
    });

    render();
    if (ctx.revisit) { stops.forEach((s) => answered.add(s.id)); done = true; ctx.unlockNext({ focus: false }); render(); }
    return { unmount() { vid.pause(); vid.removeAttribute('src'); vid.load(); } };
  },
};
