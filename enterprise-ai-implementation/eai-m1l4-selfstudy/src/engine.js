// Engine: fixed 1280x720 stage scaled to fit, routing by screen id from lesson.slice, screen
// lifecycle (mount, unmount), focus management, the footer Previous / Next, the rail and menu
// models, resume prompt hook.
// Stage scaling adapted from genai-for-marketing/s1-ai-awareness/src/engine.js (layout(), the
// fit-to-container math): one fixed stage, transform: scale(), letterboxed on white.
// All learner-facing text comes from content/l4-slice.json.
import { h, fmt } from './util.js';
import { createZones } from './zones.js';
import { createMenu, openDialog } from './menu.js';
import { initTooltips, applyTerms } from './tooltip.js';
import { loadState, saveState, clearState, emptyState, decode } from './state.js';
import { decision } from './templates/decision.js';
import { input } from './templates/input.js';
import { sort } from './templates/sort.js';
import { explorer } from './templates/explorer.js';
import { video } from './templates/video.js';
import { handoff } from './templates/handoff.js';
import { check } from './templates/check.js';
import { createTracking } from './tracking/index.js';

const STAGE_W = 1280, STAGE_H = 720;
const STAGE_W_MAX = 1600; // a wide window widens the stage up to this (about 2.2:1); wider still is letterboxed
const NARROW_BELOW = 900; // window narrower than this: show the "best on a computer" note above the stage
const NOTE_H = 40;
const MAX_TEXT = 250;     // fill-in responses are trimmed and capped (SCORM 1.2 safe)

const TEMPLATES = { decision, input, sort, explorer, video, handoff, check };

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
    window.__l4 = lesson; // test hook (tools/test-fit.mjs and tools/walk.mjs drive it)
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
    this.totalMinutes = this.chapters.reduce((sum, c) => sum + (c.minutes || 0), 0);
    this.current = null;
    this.mounted = null;
    this.onNext = null;      // what the unlocked Next does on this screen (null = finish)
    this.pauseShown = false; // the chapter-end pause marker was shown on this screen
    this.shownAt = 0;
    const q = new URLSearchParams(location.search);
    this.tracking = createTracking({ debug: q.get('debug') === '1', force: q.get('tracking') });

    this.note = h('p', { class: 'w-small-note', hidden: true }, this.ui.smallScreenNote);
    this.stage = h('div', { class: 'w-stage' });
    root.replaceChildren(this.note, this.stage);
    initTooltips(this.stage);

    this.zones = createZones(this.stage, content, {
      onMenu: (btn) => this.menu.open(btn),
      onChapter: (n) => this.goChapter(n),
      onPrev: () => this.prev(),
      onNext: () => this.nextAction(),
    });
    this.menu = createMenu(this.stage, content, {
      zones: this.zones,
      getMenu: () => this.menuModel(),
      onChapter: (n) => this.goChapter(n),
      onStartOver: () => this.startOver(),
    });

    // SCORM 1.2: the LMS holds the state (suspend_data, lesson_location); local mode: localStorage
    const lms = this.tracking.init();
    this.lms = !!lms.ok;
    if (this.lms) {
      this.state = lms.suspend ? decode(lms.suspend) : emptyState();
      if (!this.state.s && lms.location && this.screens[lms.location]) this.state.s = lms.location;
      this.zones.setSaved(true);
    } else {
      const { state, ok } = loadState();
      this.state = state;
      this.zones.setSaved(ok);
    }

    this.layout();
    new ResizeObserver(() => this.layout()).observe(root);
  }

  /* ---- stage scaling: 720 px high, 1280 to 1600 px wide to fill the window, scale to fit, never
     scroll. A wide window widens the stage: the rail stays left, the footer spans the width and
     the 1216 px content column (main) is centred (--w-stage-w in frame.css). ---- */
  layout() {
    const W = this.root.clientWidth, H = this.root.clientHeight;
    if (!W || !H) return;
    const narrow = W < NARROW_BELOW;
    this.note.hidden = !narrow;
    const top0 = narrow ? NOTE_H : 0;
    const availH = H - top0;
    const scale = Math.max(0.05, Math.min(W / STAGE_W, availH / STAGE_H));
    const stageW = Math.round(Math.min(STAGE_W_MAX, Math.max(STAGE_W, W / scale)));
    this.stage.style.setProperty('--w-stage-w', stageW + 'px');
    const left = (W - stageW * scale) / 2;
    const top = top0 + (availH - STAGE_H * scale) / 2;
    this.stage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
    this.scale = scale;
  }

  start() {
    const q = new URLSearchParams(location.search);
    if (q.get('reset') === '1') { clearState(); this.state = emptyState(); }
    const jump = q.get('screen');
    if (jump && this.screens[jump] && this.slice.includes(jump)) { this.go(jump); return; }
    // resume: the saved place (localStorage, or suspend_data / lesson_location from the LMS)
    const s = this.state.s;
    if (s && this.slice.includes(s) && (this.state.d.length || s !== this.slice[0])) {
      this.go(s);
      openDialog(this.stage, {
        text: this.ui.resumePrompt,
        inert: [this.zones.rail, this.zones.main, this.zones.footer],
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
    this.onNext = null;
    this.pauseShown = false;
    this.state.s = id;
    this.persist();
    this.zones.instruction.textContent = screen.instruction;
    this.zones.setNext(true, this.lockedWhy(screen));
    this.zones.setPrev(this.slice.indexOf(id) > 0);
    const tpl = TEMPLATES[screen.template];
    if (!tpl) throw new Error('no template ' + screen.template + ' for ' + id);
    const done = this.doneSet();
    this.shownAt = performance.now();
    this.mounted = tpl.mount({
      screen, content: this.content, ui: this.ui, zones: this.zones,
      revisit: done.has(id),            // revisiting a completed screen: show the earlier answer, read-only
      complete: () => this.complete(id),
      next: () => this.next(),
      goTo: (to) => this.go(to),
      // Next in the footer: unlock (red), optionally with its own action (FT1 wrong = the route)
      unlockNext: ({ focus: f = false, onNext = null } = {}) => { this.onNext = onNext; this.zones.setNext(false); if (f) this.zones.nextBtn.focus(); },
      lockNext: (why = null) => { this.onNext = null; this.zones.setNext(true, why || this.lockedWhy(screen)); },
      answer: (a) => this.answer(id, a),
      firstAnswer: (trackingId) => this.firstAnswer(trackingId),
      store: { get: (key) => this.state.f[key] ?? '', set: (key, value) => { this.state.f[key] = value; } },
      // small per-screen flags kept in suspend data (handoff opened / back, checkbox, chosen chip, ...)
      flags: { get: (key) => this.state.g[id]?.[key], set: (key, value) => { (this.state.g[id] ||= {})[key] = value; this.persist(); } },
      flagsOf: (screenId) => this.state.g[screenId] || {},
      chapter: this.chapters.find((c) => c.id === screen.chapter),
      setRoute: (route) => this.setRoute(id, route),
      score: () => this.score(),
      finishLesson: () => this.finishLesson(),
      finished: () => !!this.state.fin,
    });
    applyTerms(this.zones.main, screen.terms, this.content.tooltips);
    this.renderRail();
    if (focus) this.zones.instruction.focus({ preventScroll: true });
  }

  // why Next is locked on this screen (its aria-label), by variant, then template
  lockedWhy(screen) {
    const l = this.ui.footer.locked;
    return l[screen.variant] || l[screen.template] || l.default;
  }

  nextAction() {
    if (this.onNext) this.onNext();
    else this.finish(this.current);
  }

  /* ---- score (S21) and the end of the lesson ---- */
  // First attempts of the scored interactions only (lesson.completion.scoredScreens): x right of n,
  // raw 0 to 100.
  score() {
    const ids = this.content.lesson.completion.scoredScreens.flatMap((sid) => (this.screens[sid]?.tracking || []).filter((t) => t.scored).map((t) => t.id));
    const x = ids.filter((tid) => this.firstAnswer(tid)?.result === 'correct').length;
    return { x, n: ids.length, raw: ids.length ? Math.round((100 * x) / ids.length) : null };
  }

  // Finish (S22): passed / failed against the pass mark (completed when nothing is scored), once.
  finishLesson() {
    const c = this.content.lesson.completion;
    const sc = this.score();
    const status = sc.n ? (sc.raw >= c.passMark ? 'passed' : 'failed') : c.statusWhenNoScoredItems;
    this.state.fin = status;
    this.tracking.emit({ kind: 'finish', status, score: sc.raw, passMark: c.passMark });
    this.persist();
    return { status, ...sc };
  }

  // After the last screen of a chapter the first Next shows the chapter's pause marker in the band
  // (Next stays unlocked, focus stays on it); the second Next moves on. Other screens go straight on.
  finish(id) {
    const screen = this.screens[id];
    const chapter = this.chapters.find((c) => c.id === screen.chapter);
    if (!screen.endOfChapter || !chapter || !chapter.pauseMarker || this.pauseShown) { this.next(); return; }
    this.pauseShown = true;
    this.zones.setFeedback({ state: 'pause', text: chapter.pauseMarker });
    this.zones.nextBtn.focus();
  }

  /* ---- answers and the tracking bus ---- */
  // a = { trackingId, response, result }. The first attempt per interaction id emits 'answer' (and
  // is kept in state.a); every later attempt emits 'retry' (count in state.x). Returns the kind.
  answer(screenId, { trackingId, response, result }) {
    const meta = this.trackingMeta(screenId, trackingId);
    const type = meta?.type || 'choice';
    if (type === 'fill-in') response = String(response ?? '').trim().slice(0, MAX_TEXT);
    const latencyMs = Math.round(performance.now() - this.shownAt);
    if (!(trackingId in this.state.a)) {
      this.state.a[trackingId] = (type === 'fill-in' ? '' : response) + '|' + result.charAt(0);
      // the interaction's content metadata goes along for the SCORM adapter (correct response, weighting)
      this.tracking.emit({ kind: 'answer', trackingId, type, response, result, latencyMs, correctResponse: meta?.correctResponse ?? null, scored: !!meta?.scored });
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
    this.state.r[screenId] = route;
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

  prev() {
    const i = this.slice.indexOf(this.current);
    if (i > 0) this.go(this.slice[i - 1]);
  }

  // Mark a screen done. First answers are kept by answer() and never overwritten (and, from P4,
  // never re-reported to SCORM).
  complete(id) {
    if (!this.state.d.includes(id)) this.state.d.push(id);
    this.persist();
    this.renderRail();
  }

  // A completed chapter opens at its first screen; the chapter in progress opens where the learner is.
  goChapter(n) {
    const c = this.chapters.find((x) => x.n === n);
    if (!c || !c.screens.length) return;
    const fi = this.frontierIndex();
    const here = fi < this.slice.length && c.screens.includes(this.slice[fi]) ? this.slice[fi] : c.screens[0];
    this.go(here);
  }

  startOver() {
    clearState();
    this.state = emptyState();
    this.go(this.slice[0]);
  }

  // every change: to the LMS (suspend_data, lesson_location) in SCORM mode, else to localStorage;
  // the Saved indicator shows whether the last write was accepted
  persist() {
    const sent = this.tracking.persist(this.state);
    this.zones.setSaved(this.lms ? sent : saveState(this.state));
  }

  /* ---- progress model (rail and menu) ---- */
  // Done screens, plus the screens a fast-track jump skipped (route "skip"): they count as done,
  // so the chapter completes with its landing screen.
  doneSet() { return new Set([...this.state.d, ...this.skippedScreens()]); }

  skippedScreens() {
    return this.chapters.flatMap((c) => {
      if (!c.fastTrack || this.state.r[c.fastTrack.card] !== 'skip') return [];
      const from = c.screens.indexOf(c.fastTrack.card), to = c.screens.indexOf(c.fastTrack.landing);
      return from >= 0 && to > from ? c.screens.slice(from + 1, to) : [];
    });
  }

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

  progress() {
    const done = this.doneSet();
    const fi = this.frontierIndex();
    const frontierChapter = fi < this.slice.length ? this.screens[this.slice[fi]].chapter : null;
    const minutesDone = [...done].reduce((sum, id) => sum + (this.screens[id]?.minutes || 0), 0);
    const percent = Math.min(100, Math.round((100 * minutesDone) / this.totalMinutes));
    const chapters = this.chapters.map((c) => {
      const status = this.chapterStatus(c, done, frontierChapter);
      return { c, status, clickable: status === 'done' || status === 'current' };
    });
    return { percent, chapters, frontierChapter };
  }

  renderRail() {
    const p = this.progress();
    const viewChapter = this.screens[this.current]?.chapter;
    let frontier = p.chapters.findIndex((x) => x.status === 'current');
    if (frontier < 0) frontier = p.chapters.reduce((last, x, i) => (x.status === 'done' ? i : last), 0);
    this.zones.setRail({
      percent: p.percent,
      frontier,
      chapters: p.chapters.map(({ c, status, clickable }) => ({
        n: c.n, status, clickable, viewing: c.id === viewChapter,
        label: fmt(this.ui.rail.dot, { title: c.title, status: this.ui.rail.status[status] }),
      })),
    });
  }

  // the S01B pick: { screen, picked (option id or ''), chapter (the chapter id that builds it) }
  goalFocus() {
    const screen = this.content.screens.find((s) => s.variant === 'goals');
    if (!screen) return null;
    const picked = this.state.f[screen.store] || '';
    return { screen, picked, chapter: screen.options.find((o) => o.id === picked)?.chapter || null };
  }

  menuModel() {
    const p = this.progress();
    const m = this.ui.menu;
    const goal = this.goalFocus();
    // no times in the menu: chapter minutes only weigh the % complete; the chapter that builds the
    // outcome marked hardest on S01B carries "Your focus"
    return {
      percent: p.percent,
      goals: goal ? goal.screen.options.map((o) => ({ label: o.label, sub: o.sub, picked: o.id === goal.picked })) : [],
      chapters: p.chapters.map(({ c, status, clickable }) => {
        const focus = !!goal && goal.chapter === c.id;
        return {
          n: c.n, title: c.title, status, clickable, current: c.id === p.frontierChapter, focus,
          meta: status === 'done' ? m.done : '',
          label: fmt(focus ? m.focusLabel : m.chapterLabel, { title: c.title, status: this.ui.rail.status[status] }),
        };
      }),
    };
  }
}
