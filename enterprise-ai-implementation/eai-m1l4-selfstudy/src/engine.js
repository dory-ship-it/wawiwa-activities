// Engine: fixed 1280x720 stage scaled to fit, routing by screen id from lesson.slice, screen
// lifecycle (mount, unmount), focus management, progress bar model, resume prompt hook.
// Stage scaling adapted from genai-for-marketing/s1-ai-awareness/src/engine.js (layout(), the
// fit-to-container math): one fixed stage, transform: scale(), letterboxed on white.
// All learner-facing text comes from content/l4-slice.json.
import { h, fmt } from './util.js';
import { createZones } from './zones.js';
import { createMenu, openDialog } from './menu.js';
import { initTooltips, applyTerms } from './tooltip.js';
import { loadState, saveState, clearState, emptyState } from './state.js';
import { placeholder } from './templates/placeholder.js';
import { decision } from './templates/decision.js';
import { input } from './templates/input.js';
import { createTracking } from './tracking/index.js';
import { demo } from './demo.js';

const STAGE_W = 1280, STAGE_H = 720;
const NARROW_BELOW = 900; // window narrower than this: show the "best on a computer" note above the stage
const NOTE_H = 40;
const NOT_IN_PILOT_WEIGHT = 0.6; // progress segment width for a chapter with no screens in the slice
const START_CHAPTER = 0;         // the entry chapter shows as "Start" (ui.startLabel), never "Chapter 0"
const MAX_TEXT = 250;            // fill-in responses are trimmed and capped (SCORM 1.2 safe)

// Video and handoff arrive in P2 and P3; until then those screens mount the placeholder.
const TEMPLATES = { decision, input };

export async function boot(root) {
  const res = await fetch(new URL('../content/l4-slice.json', import.meta.url));
  if (!res.ok) throw new Error('content/l4-slice.json HTTP ' + res.status);
  const content = await res.json();
  try {
    document.documentElement.lang = content.lesson.lang;
    document.documentElement.dir = content.lesson.dir;
    document.title = content.lesson.title;
    const lesson = new Lesson(root, content);
    lesson.start();
    window.__l4 = lesson; // test hook (tools/test-fit.mjs and the P0 screenshots drive it)
    return lesson;
  } catch (err) {
    err.ui = content.ui;
    throw err;
  }
}

class Lesson {
  constructor(root, content) {
    this.root = root;
    this.content = content;
    this.ui = content.ui;
    this.slice = content.lesson.slice;
    this.screens = Object.fromEntries(content.screens.map((s) => [s.id, s]));
    this.chapters = content.chapters;
    this.maxChapter = Math.max(...this.chapters.map((c) => c.n));
    this.current = null;
    this.mounted = null;
    this.demoMode = false;
    this.shownAt = 0;
    this.tracking = createTracking({ debug: new URLSearchParams(location.search).get('debug') === '1' });

    this.note = h('p', { class: 'w-small-note', hidden: true }, this.ui.smallScreenNote);
    this.stage = h('div', { class: 'w-stage' });
    root.replaceChildren(this.note, this.stage);
    initTooltips(this.stage);

    this.zones = createZones(this.stage, content, {
      onMenu: (btn) => this.menu.open(btn),
      onSegment: (n) => this.goChapter(n),
    });
    this.menu = createMenu(this.stage, content, {
      zones: this.zones,
      getMap: () => this.chapterMap(),
      onGoScreen: (id) => this.go(id),
      onStartOver: () => this.startOver(),
    });

    const { state, ok } = loadState();
    this.state = state;
    this.zones.setSaved(ok);

    this.layout();
    new ResizeObserver(() => this.layout()).observe(root);
  }

  /* ---- stage scaling: fixed 1280x720, scale to fit, letterbox white, never scroll ---- */
  layout() {
    const W = this.root.clientWidth, H = this.root.clientHeight;
    if (!W || !H) return;
    const narrow = W < NARROW_BELOW;
    this.note.hidden = !narrow;
    const top0 = narrow ? NOTE_H : 0;
    const availH = H - top0;
    const scale = Math.max(0.05, Math.min(W / STAGE_W, availH / STAGE_H));
    const left = (W - STAGE_W * scale) / 2;
    const top = top0 + (availH - STAGE_H * scale) / 2;
    this.stage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
    this.scale = scale;
  }

  start() {
    const q = new URLSearchParams(location.search);
    if (q.get('reset') === '1') { clearState(); this.state = emptyState(); }
    if (q.get('demo') === '1') { this.startDemo(q.get('fb') || 'hint'); return; }
    const jump = q.get('screen');
    if (jump && this.screens[jump] && this.slice.includes(jump)) { this.go(jump); return; }
    // resume prompt hook: real state and suspend_data arrive in P4
    const s = this.state.s;
    if (s && this.slice.includes(s) && (this.state.d.length || s !== this.slice[0])) {
      this.go(s);
      openDialog(this.stage, {
        text: this.ui.resumePrompt,
        inert: [this.zones.topbar, this.zones.main],
        opener: this.zones.instruction,
        actions: [
          { id: 'resume', label: this.ui.buttons.resume, primary: true, onClick: (close) => close() },
          { id: 'startover', label: this.ui.buttons.startOver, onClick: (close) => { close(); this.startOver(); } },
        ],
      });
      return;
    }
    this.go(this.slice[0]);
  }

  /* ---- routing and screen lifecycle ---- */
  go(id, { focus = true } = {}) {
    const screen = this.screens[id];
    if (!screen) return;
    this.unmount();
    this.current = id;
    if (!this.demoMode) { this.state.s = id; this.persist(); }
    this.zones.instruction.textContent = screen.instruction;
    const tpl = TEMPLATES[screen.template] || placeholder;
    const done = this.doneSet();
    this.shownAt = performance.now();
    this.mounted = tpl.mount({
      screen, content: this.content, ui: this.ui, zones: this.zones,
      revisit: done.has(id),            // revisiting a completed screen: show the earlier answer, read-only
      complete: () => this.complete(id),
      next: () => this.next(),
      goTo: (to) => this.go(to),
      finish: () => this.finish(id),    // chapter-end pause marker when the screen ends a chapter, else next
      answer: (a) => this.answer(id, a),
      firstAnswer: (trackingId) => this.firstAnswer(trackingId),
      store: { get: (key) => this.state.f[key] ?? '', set: (key, value) => { this.state.f[key] = value; } },
      route: () => this.state.r,
      setRoute: (route) => this.setRoute(id, route),
    });
    applyTerms(this.zones.card, screen.terms, this.content.tooltips);
    this.renderProgress();
    if (focus) this.zones.instruction.focus({ preventScroll: true });
  }

  // After the last screen of a chapter: the feedback row shows the chapter's pause marker with
  // Continue (to the next slice screen). Other screens go straight on.
  finish(id) {
    const screen = this.screens[id];
    const chapter = this.chapters.find((c) => c.id === screen.chapter);
    if (!screen.endOfChapter || !chapter || !chapter.pauseMarker) { this.next(); return; }
    const btn = this.zones.setFeedback({
      state: 'pause', text: chapter.pauseMarker,
      actions: [{ id: 'continue', label: this.ui.buttons.continue, primary: true, onClick: () => this.next() }],
    });
    btn?.focus();
  }

  /* ---- answers and the tracking bus ---- */
  // a = { trackingId, response, result }. The first attempt per interaction id emits 'answer' (and
  // is kept in state.a); every later attempt emits 'retry' (count in state.x). Returns the kind.
  answer(screenId, { trackingId, response, result }) {
    const meta = this.trackingMeta(screenId, trackingId);
    const type = meta?.type || 'choice';
    if (type === 'fill-in') response = String(response ?? '').trim().slice(0, MAX_TEXT);
    const latencyMs = Math.round(performance.now() - this.shownAt);
    if (this.demoMode) return 'answer';
    if (!(trackingId in this.state.a)) {
      this.state.a[trackingId] = (type === 'fill-in' ? '' : response) + '|' + result.charAt(0);
      this.tracking.emit({ kind: 'answer', trackingId, type, response, result, latencyMs });
      this.persist();
      return 'answer';
    }
    const attempt = (this.state.x[trackingId] || 1) + 1;
    this.state.x[trackingId] = attempt;
    this.tracking.emit({ kind: 'retry', trackingId, type, response, result, attempt, latencyMs });
    this.persist();
    return 'retry';
  }

  firstAnswer(trackingId) {
    const v = this.state.a[trackingId];
    if (typeof v !== 'string') return null;
    const [response, r] = v.split('|');
    return { response, result: r === 'c' ? 'correct' : r === 'w' ? 'wrong' : 'neutral' };
  }

  trackingMeta(screenId, trackingId) {
    const s = this.screens[screenId];
    const all = [...(s.tracking || []), ...(s.stops || []).map((x) => x.tracking)];
    return all.find((t) => t && t.id === trackingId) || null;
  }

  setRoute(screenId, route) {
    if (this.demoMode) return;
    this.state.r = route;
    this.tracking.emit({ kind: 'route', screen: screenId, route });
    this.persist();
  }

  unmount() {
    if (this.mounted && this.mounted.unmount) this.mounted.unmount();
    this.mounted = null;
    this.zones.clearScreen();
  }

  next() {
    const i = this.slice.indexOf(this.current);
    if (i >= 0 && i < this.slice.length - 1) this.go(this.slice[i + 1]);
    else this.zones.setFeedback({ state: 'pause', text: this.ui.sliceEnd });
  }

  // Mark a screen done. First answers are kept by answer() and never overwritten (and, from P4,
  // never re-reported to SCORM).
  complete(id) {
    if (this.demoMode) return;
    if (!this.state.d.includes(id)) this.state.d.push(id);
    this.persist();
    this.renderProgress();
  }

  goChapter(n) {
    const c = this.chapters.find((x) => x.n === n);
    if (c && c.screens.length) this.go(c.screens[0]);
  }

  startOver() {
    clearState();
    this.state = emptyState();
    this.go(this.slice[0]);
  }

  persist() {
    if (this.demoMode) return;
    this.zones.setSaved(saveState(this.state));
  }

  /* ---- progress model (top bar segments and menu chapter map) ---- */
  // Done screens, plus the screens a fast-track jump skipped (route "skip"): they count as done,
  // so the bar never shows a hole and the chapter completes with its landing screen.
  doneSet() { return new Set([...this.state.d, ...this.skippedScreens()]); }

  skippedScreens() {
    if (this.state.r !== 'skip') return [];
    return this.chapters.flatMap((c) => {
      if (!c.fastTrack) return [];
      const from = c.screens.indexOf(c.fastTrack.card), to = c.screens.indexOf(c.fastTrack.landing);
      return from >= 0 && to > from ? c.screens.slice(from + 1, to) : [];
    });
  }

  // The entry chapter is shown as "Start" with no number; the others keep "Chapter n".
  chapterName(c) { return c.n === START_CHAPTER ? this.ui.startLabel : c.title; }

  frontierIndex() {
    const done = this.doneSet();
    const i = this.slice.findIndex((id) => !done.has(id));
    return i < 0 ? this.slice.length : i;
  }

  chapterStatus(c, done, frontierChapter) {
    if (!c.inSlice || !c.screens.length) return 'notInPilot';
    if (c.screens.every((id) => done.has(id)) || done.has(c.screens[c.screens.length - 1])) return 'done';
    if (c.id === frontierChapter) return 'current';
    return 'locked';
  }

  progressModel() {
    const done = this.doneSet();
    const fi = this.frontierIndex();
    const frontierChapter = fi < this.slice.length ? this.screens[this.slice[fi]].chapter : null;
    const viewChapter = this.screens[this.current]?.chapter;
    const pb = this.ui.progressBar;
    const chapters = this.chapters.map((c) => {
      const status = this.chapterStatus(c, done, frontierChapter);
      const total = c.inSlice ? c.screens.length : 0;
      const clickable = status === 'done' || status === 'current';
      const label = c.n === START_CHAPTER
        ? fmt(pb.segmentLabelStart, { title: this.chapterName(c), status: pb.status[status] })
        : fmt(pb.segmentLabel, { n: c.n, title: c.title, status: pb.status[status] });
      return {
        n: c.n, total, status, clickable, label,
        done: c.screens.filter((id) => done.has(id)).length,
        weight: total || NOT_IN_PILOT_WEIGHT,
        current: c.id === viewChapter,
        marker: c.id === viewChapter ? c.screens.indexOf(this.current) : null,
        tip: status === 'locked' ? label + '\n' + pb.lockedTip : label,
      };
    });
    const vc = this.chapters.find((c) => c.id === viewChapter);
    const minutesLeft = this.slice.filter((id) => !done.has(id)).reduce((sum, id) => sum + (this.screens[id].minutes || 0), 0);
    const pos = { n: vc ? vc.n : 0, max: this.maxChapter, i: this.slice.indexOf(this.current) + 1, total: this.slice.length };
    return {
      title: vc ? this.chapterName(vc) : '',
      readout: fmt(vc && vc.n === START_CHAPTER ? pb.readoutStart : pb.readout, pos),
      minutesLeft: fmt(pb.minutesLeft, { m: minutesLeft }),
      chapters,
    };
  }

  renderProgress() { this.zones.setProgress(this.progressModel()); }

  chapterMap() {
    const done = this.doneSet();
    const fi = this.frontierIndex();
    const frontierChapter = fi < this.slice.length ? this.screens[this.slice[fi]].chapter : null;
    return this.chapters.map((c) => ({
      n: c.n, title: this.chapterName(c), start: c.n === START_CHAPTER, minutes: c.minutes,
      status: this.chapterStatus(c, done, frontierChapter),
      screens: (c.inSlice ? c.screens : []).map((id) => {
        const s = this.screens[id];
        return { id, label: s.title || s.instruction, done: done.has(id), here: id === this.current, clickable: done.has(id) || this.slice.indexOf(id) <= fi };
      }),
    }));
  }

  /* ---- dev-only demo screen (?demo=1): every feedback state and the menu, without templates ---- */
  startDemo(fbState) {
    this.demoMode = true;
    // a fixed, in-memory position for the demo: Chapter 1, at S03, everything before it done
    this.state = { ...emptyState(), d: ['S01', 'S02', 'FT1', 'V1'] };
    this.current = 'S03';
    this.setDemo(fbState);
  }

  setDemo(fbState) {
    this.unmount();
    this.mounted = demo.mount({ content: this.content, ui: this.ui, zones: this.zones, state: fbState });
    this.renderProgress();
    this.zones.instruction.focus({ preventScroll: true });
  }
}
