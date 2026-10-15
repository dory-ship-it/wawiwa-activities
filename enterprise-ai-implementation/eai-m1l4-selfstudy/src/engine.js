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
import { demo } from './demo.js';

const STAGE_W = 1280, STAGE_H = 720;
const NARROW_BELOW = 900; // window narrower than this: show the "best on a computer" note above the stage
const NOTE_H = 40;
const NOT_IN_PILOT_WEIGHT = 0.6; // progress segment width for a chapter with no screens in the slice

// Templates arrive in P1 to P3; until then every slice screen mounts the placeholder.
const TEMPLATES = {};

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
    this.mounted = tpl.mount({
      screen, content: this.content, ui: this.ui, zones: this.zones,
      revisit: done.has(id),            // revisiting a completed screen: show the earlier answer, read-only
      answer: this.state.a[id] ?? null, // first answer stored for this screen (P1 templates read it)
      complete: (answer) => this.complete(id, answer),
      next: () => this.next(),
    });
    applyTerms(this.zones.card, screen.terms, this.content.tooltips);
    this.renderProgress();
    if (focus) this.zones.instruction.focus({ preventScroll: true });
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

  // Mark a screen done. The first answer is kept; a revisit never overwrites it (and, from P4,
  // never re-reports to SCORM).
  complete(id, answer) {
    if (!this.state.d.includes(id)) this.state.d.push(id);
    if (answer !== undefined && answer !== null && !(id in this.state.a)) this.state.a[id] = answer;
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
  doneSet() { return new Set(this.state.d); }

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
      const label = fmt(pb.segmentLabel, { n: c.n, title: c.title, status: pb.status[status] });
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
    return {
      title: vc ? vc.title : '',
      readout: fmt(pb.readout, { n: vc ? vc.n : 0, max: this.maxChapter, i: this.slice.indexOf(this.current) + 1, total: this.slice.length }),
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
      n: c.n, title: c.title, minutes: c.minutes,
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
