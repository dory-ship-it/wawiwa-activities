// Video template (V1, V2), "Hybrid cinematic" look. FX2 A: a page, not a full-bleed film: under the
// Kit 13 bar, on a clean dark ground (no chapter photo, nothing to distract from the film),
//   column   the heading block (the instruction as the h1, the meta line: the film's title only (FX3: no
//            length, no number of stops; the player bar still shows the time),
//            "Watch for: ..."), the film in a bounded 16:9 frame, and the player bar BELOW the picture,
//            attached to the frame and as wide (play / pause, time, the track with one ringed disc per
//            stop, CC, volume, transcript). One caption line block inside the picture, bottom centre.
//   side     closed: the column is centred, the frame about 60% of the stage width. The transcript open:
//            the column moves left (frame about 55%), the transcript panel right (about 40%), as high as
//            the frame and the bar, scrolling inside, the current cue marked. At a stop the stop panel
//            takes the transcript's place (the transcript closes while it is open).
//   ready    the film's first frame and a large Play disc on the picture.
//   stop     playback (or a seek) reaching an unanswered stop pauses the film: the picture stays, uncovered;
//            the panel right holds "Stop 1 of 2" + time chip, the question, the answers, "Show me how" and
//            "Resume video" (locked, grey with a lock, until the right answer), and the band. The player bar
//            stays, inert. Resume plays on and brings the transcript back as it was. Next stays locked until
//            the film ends and every stop is answered. First attempt per stop on the tracking bus.
// Everything is read from the content: media.src, media.captions[0].src (WebVTT, parsed here),
// media.duration, stops[].t. Swapping the real film in is a change of those paths and times only.
// Seeking forward never passes the part already watched or the next unanswered stop (the slider
// clamps, a polite note says why).
import { h, fmt, nextId } from '../util.js?v=d1af4854';
import { glyph, icon } from '../icons.js?v=d1af4854';
import { letter } from '../tracking/index.js?v=d1af4854';
import { layout, sheet, glassKicker, arrowNav, paintAnswer } from './stage.js?v=d1af4854';
import { targetSteps } from '../ghost.js?v=d1af4854';
import { checkButton } from './decision.js?v=d1af4854';

const SEEK_STEP = 5, SEEK_PAGE = 15, AT_STOP = 0.05, AT_END = 0.3;
// FX4 (Dor): playback speed in the player bar, 1 to 2, kept for the session (every video plays at the
// learner's last choice; sessionStorage when allowed, else this page's memory). Stops still pause the film
// at any speed: the check runs on every timeupdate and a stop sets the time back to its own mark.
const SPEEDS = [1, 1.25, 1.5, 2];
let sessionRate = null;
const readRate = () => { if (sessionRate) return sessionRate; try { const r = Number(sessionStorage.getItem('l4-speed')); if (SPEEDS.includes(r)) return r; } catch { /* storage blocked */ } return 1; };
const keepRate = (r) => { sessionRate = r; try { sessionStorage.setItem('l4-speed', String(r)); } catch { /* storage blocked */ } };
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
  scene: () => 'plain', // a clean dark ground behind the film (Noy, FX2): no chapter photo

  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const v = ui.video, media = screen.media, stops = screen.stops || [];
    const duration = media.duration;
    const answered = new Set();
    let cues = [], ended = false, done = false, atStop = null, trWasOpen = false;

    /* ---- the heading block ---- */
    // v2 V1: the film's title stays its label only (screen.showTitle false: the film's own title card shows it)
    const meta = screen.showTitle === false ? null : h('p', { class: 'w-video-meta' }, h('span', { class: 'w-video-title' }, screen.title));
    const guiding = h('p', { class: 'w-guiding' }, h('b', {}, screen.guidingLabel || v.guiding), ' ', screen.guidingQuestion);
    const head = h('div', { class: 'w-video-head' }, zones.instruction, meta, guiding);

    /* ---- the frame: the film (its first frame until it plays), the large Play disc, the caption ---- */
    const vid = h('video', { class: 'w-video', src: media.src, poster: media.poster || null, preload: 'auto', playsinline: true, tabindex: '-1', 'aria-label': screen.title, dataset: { started: 'false' } });
    const caption = h('p', { class: 'w-caption', hidden: true });
    const bigPlay = h('button', { class: 'w-bigplay', type: 'button', 'aria-label': v.play, dataset: { action: 'bigplay' } }, glyph('watch', { size: 48 }));
    const frame = h('div', { class: 'w-frame' }, vid, bigPlay, caption);

    /* ---- player bar, under the picture ---- */
    const playBtn = h('button', { class: 'w-play-btn', type: 'button', 'aria-label': v.play, dataset: { action: 'play' } }, glyph('watch', { size: 28.16 }));
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
    const muteBtn = tool('w-mute', v.mute, glyph('g-volume', { size: 25.6 }), false);
    const trBtn = tool('w-tr', v.transcript, glyph('learn', { size: 25.6 }), false); // closed until the learner opens it
    const limitNote = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    // FX5 (Noy): the speed as a gear icon that opens a small menu above it (YouTube style): Normal, 1.25,
    // 1.5, 2; the chosen one is ticked; a small badge on the gear shows any speed other than Normal
    let rate = readRate();
    const badge = h('span', { class: 'w-speed-badge', 'aria-hidden': 'true' });
    const speedBtn = h('button', { class: 'w-tool w-speed', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', dataset: { action: 'speed' } },
      icon('gauge', { size: 25.6 }), badge); // FX7 (Noy): a speed icon (a speedometer), not a gear
    const items = SPEEDS.map((x) => h('button', { class: 'w-speed-item', type: 'button', role: 'menuitemradio', 'aria-checked': 'false', dataset: { rate: String(x) } },
      h('span', { class: 'w-speed-tick', 'aria-hidden': 'true' }, glyph('g-check', { size: 16 })), h('span', {}, x === 1 ? v.speedNormal : fmt(v.speedChip, { x }))));
    const menu = h('div', { class: 'w-speed-menu', role: 'menu', 'aria-label': v.speedMenu, hidden: true }, h('p', { class: 'w-speed-head', 'aria-hidden': 'true' }, v.speedMenu), items);
    const speedWrap = h('div', { class: 'w-speed-wrap' }, menu, speedBtn);
    const applyRate = () => {
      vid.defaultPlaybackRate = rate; vid.playbackRate = rate;
      badge.textContent = rate === 1 ? '' : fmt(v.speedChip, { x: rate });
      speedBtn.setAttribute('aria-label', fmt(v.speed, { x: rate }));
      items.forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.rate) === rate)));
    };
    const openMenu = (on) => {
      menu.hidden = !on;
      speedBtn.setAttribute('aria-expanded', String(on));
      if (on) (items.find((b) => b.getAttribute('aria-checked') === 'true') || items[0]).focus();
    };
    speedBtn.addEventListener('click', () => openMenu(menu.hidden));
    items.forEach((b) => b.addEventListener('click', () => { rate = Number(b.dataset.rate); keepRate(rate); applyRate(); openMenu(false); speedBtn.focus(); }));
    menu.addEventListener('keydown', (e) => {
      const i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.stopPropagation(); openMenu(false); speedBtn.focus(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
    });
    const outside = (e) => { if (!menu.hidden && !speedWrap.contains(e.target)) openMenu(false); };
    document.addEventListener('pointerdown', outside, true);
    vid.addEventListener('loadedmetadata', applyRate); // (a new source resets the rate in some browsers)
    applyRate();
    const controls = h('div', { class: 'w-controls', role: 'group', 'aria-label': v.controls }, playBtn, timeText, seek, speedWrap, ccBtn, muteBtn, trBtn, limitNote);
    const col = h('div', { class: 'w-player-col' }, head, frame, controls);

    /* ---- transcript (the light panel, right) ---- */
    const trList = h('div', { class: 'w-transcript-list' });
    const transcript = h('aside', { class: 'w-transcript', 'aria-label': v.transcript, hidden: true }, h('h2', { class: 'w-transcript-head' }, v.transcript), trList);

    /* ---- stop panel (right, in the transcript's place) ---- */
    const kicker = h('div', { class: 'w-stop-kicker' });
    const stopQ = h('h2', { class: 'w-stop-q', id: nextId('w-stop-q'), tabindex: '-1' });
    const stopOpts = h('div', { class: 'w-options w-ans-list w-ans-cols-1', role: 'group', 'aria-labelledby': stopQ.id, dataset: { interaction: '' } });
    arrowNav(stopOpts);
    const stopTools = h('div', { class: 'w-card-tools w-stop-tools' });
    const resume = h('button', { class: 'w-btn w-btn-action w-resume', type: 'button', dataset: { action: 'resume' } },
      glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }), glyph('watch', { size: 24.32, className: 'w-resume-play' }), h('span', {}, v.resume));
    const stopPanel = sheet('w-stop-panel', kicker, stopQ, stopOpts, stopTools);
    let ghost = null; // the ghost hand of the open stop (type "stop": it sweeps over the answers)
    const stopView = h('div', { class: 'w-stop-view', hidden: true }, stopPanel);

    const player = h('div', { class: 'w-player', dataset: { side: 'closed', phase: 'ready' } }, col, transcript, stopView);
    layout(ctx, 'video', player);
    // the transcript or a stop: the column moves left (frame.css sizes it from main's data-side)
    const setSide = (side) => { player.dataset.side = side; zones.main.dataset.side = side; };
    setSide('closed');

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
      // QA1: the caption moves off the film's own labels: the first media.captionPlaces range the cue
      // overlaps names its place (top, top-left, top-right, bottom-left); none = bottom centre
      const place = k >= 0 ? (media.captionPlaces || []).find((p) => cues[k].start < p.to && cues[k].end > p.from) : null;
      if (place) caption.dataset.place = place.place; else delete caption.dataset.place;
      caption.hidden = k < 0 || ccBtn.getAttribute('aria-pressed') !== 'true' || !!atStop;
      [...trList.children].forEach((p, i) => {
        const on = i === k;
        if ((p.dataset.active === 'true') === on) return;
        p.dataset.active = String(on);
        if (on) { p.setAttribute('aria-current', 'true'); trList.scrollTop = Math.max(0, p.offsetTop - trList.offsetTop - 12); } else p.removeAttribute('aria-current');
      });
      const playing = !vid.paused && !vid.ended;
      if (playing || t > 0) { vid.dataset.started = 'true'; player.dataset.phase = 'playing'; }
      playBtn.setAttribute('aria-label', playing ? v.pause : v.play);
      playBtn.replaceChildren(glyph(playing ? 'g-pause' : 'watch', { size: 28.16 }));
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
    muteBtn.addEventListener('click', () => { flip(muteBtn); vid.muted = muteBtn.getAttribute('aria-pressed') === 'true'; muteBtn.replaceChildren(glyph(vid.muted ? 'g-muted' : 'g-volume', { size: 25.6 })); });
    function showTranscript(on) {
      trBtn.setAttribute('aria-pressed', String(on));
      transcript.hidden = !on;
      setSide(on ? 'open' : 'closed');
      render();
    }
    trBtn.addEventListener('click', () => showTranscript(trBtn.getAttribute('aria-pressed') !== 'true'));

    /* ---- stops ---- */
    // FX4: the reason a locked Resume gives, beside it (gone once Resume opens)
    const resumeWhy = h('span', { class: 'w-check-why w-resume-why', 'aria-hidden': 'true' }, ui.videoResumeNote);
    function setResume(locked) {
      resumeWhy.hidden = !locked;
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
      kicker.replaceChildren(glassKicker('watch', fmt(v.stopKicker, { i: i + 1, n: stops.length }), mmss(s.t)));
      stopQ.textContent = s.question;
      let chosen = -1, right = false, tries = 0;
      const max = 1; // FX5 (Noy): one try on a choice question, then the right answer and why
      const btns = s.options.map((o, k) => h('button', { class: 'w-opt w-ans', type: 'button', dataset: { id: o.id, letter: letter(k) } },
        h('span', { class: 'w-opt-mark w-ans-mark' }), h('span', { class: 'w-opt-label' }, o.label)));
      stopOpts.replaceChildren(...btns);
      const paint = (k, res) => btns.forEach((b, j) => paintAnswer(b, j === k ? res : '', ui));
      // FX7: select, then Check (one try); Resume takes Check's place once the stop is answered
      let pick = -1;
      const check = checkButton(ui, ui.buttons.check, () => { if (pick >= 0) commit(pick); }, ui.checkWhy.one || fmt(ui.checkWhy.pick, { n: 1 }));
      btns.forEach((b, k) => b.addEventListener('click', () => {
        if (right || b.getAttribute('aria-disabled') === 'true') return;
        pick = k;
        btns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === k)));
        check.disabled = false;
      }));
      function commit(k) {
        if (right || k === chosen) return;
        chosen = k;
        btns.forEach((x) => x.removeAttribute('aria-pressed'));
        tries += 1;
        const o = s.options[k];
        ctx.answer({ trackingId: s.tracking.id, response: letter(k), result: o.correct ? 'correct' : 'wrong' });
        if (!o.correct && tries >= max) {
          // the right answer marked (the wrong pick keeps its cross) and explained, Resume opens
          const r = s.options.findIndex((x) => x.correct);
          btns.forEach((x, j) => paintAnswer(x, j === r ? 'correct' : j === k ? 'wrong' : '', ui));
          zones.setFeedback({ state: 'wrong', verdict: ui.feedback.revealed, text: s.options[r].feedback });
        } else {
          paint(k, o.correct ? 'correct' : 'wrong');
          zones.setFeedback({ state: o.correct ? 'correct' : 'wrong', text: o.feedback });
          if (!o.correct) return;
        }
        right = true;
        answered.add(s.id);
        ctx.flags.set('stops', [...answered]);
        btns.forEach((x) => x.setAttribute('aria-disabled', 'true'));
        check.hidden = true;
        resume.hidden = false;
        setResume(false);
        resume.focus();
      }
      stopPanel.append(zones.band);
      stopTools.replaceChildren(resumeWhy, check, resume);
      resume.hidden = true; // (until the stop is answered: Check stands in its place)
      // FX4: the locked Resume has its reason on screen, beside it (in the tools row: the panel keeps its height)
      zones.setFeedback({ state: 'hint', text: '' });
      setResume(true);
      resumeWhy.hidden = true; // (FX7: Check carries the reason now, "Choose one first")
      ctx.need(ui.footer.need.stop);
      // the transcript closes while the stop is open (its state comes back after Resume)
      trWasOpen = trBtn.getAttribute('aria-pressed') === 'true';
      transcript.hidden = true;
      stopView.hidden = false;
      setSide('stop');
      controls.inert = true;
      controls.dataset.stop = 'true';
      render();
      stopQ.focus({ preventScroll: true });
      // (FX4: a stop is a plain choice: no hand over its answers, no "Show me how")
      if (screen.ghost && screen.ghost.type !== 'stop') {
        // FX1 B1: the sweep over the answers with "Pick one" (the content's target), "Show me how" beside Resume
        ghost = ctx.ghost({ type: screen.ghost.type, chip: ui.ghost.pickOne, steps: () => targetSteps(stopView, screen.ghost.target) });
        if (screen.ghost.showMe) stopTools.prepend(ghost.button);
      }
    }
    resume.addEventListener('click', () => {
      if (!atStop || resume.dataset.locked === 'true') return;
      atStop = null;
      ctx.need(ui.footer.need.video);
      if (ghost) { ghost.cancel(); ghost.button.remove(); ghost = null; }
      stopTools.replaceChildren();
      stopView.hidden = true;
      controls.inert = false;
      delete controls.dataset.stop;
      showTranscript(trWasOpen);
      vid.play().catch(() => {});
      playBtn.focus();
    });

    // coming back to an unfinished film (QA 26 Oct 2026): the stops already answered stay answered, and
    // the film is cued at the last of them instead of 0:00 (Play starts there; seeking back stays free)
    const lastDone = ctx.revisit ? null : stops.filter((s) => (ctx.flags.get('stops') || []).includes(s.id)).pop();
    if (lastDone) {
      stops.slice(0, stops.indexOf(lastDone) + 1).forEach((s) => answered.add(s.id));
      reached = lastDone.t;
      const cue = () => { vid.currentTime = lastDone.t; render(); };
      if (vid.readyState >= 1) cue(); else vid.addEventListener('loadedmetadata', cue, { once: true });
    }
    render();
    if (ctx.revisit) { stops.forEach((s) => answered.add(s.id)); done = true; ctx.unlockNext({ focus: false }); render(); }
    return { unmount() { document.removeEventListener('pointerdown', outside, true); vid.pause(); vid.removeAttribute('src'); vid.load(); delete zones.main.dataset.side; } };
  },
};
