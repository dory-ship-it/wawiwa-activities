// Engine: fixed 1280x720 stage scaled to fit, routing by screen id from lesson.slice, screen
// lifecycle (mount, unmount), the scene (Stage / Focus photo), focus management, the footer Previous /
// Next, the top bar's steps and the menu model, resume prompt hook.
// Stage scaling adapted from genai-for-marketing/s1-ai-awareness/src/engine.js (layout(), the
// fit-to-container math): one fixed stage, transform: scale(), letterboxed on white.
// All learner-facing text comes from content/l4-slice.json.
// ?review=1 (review mode, for the team, see review.html): Next never locks, Previous / Next walk every
// screen of every chapter in order, nothing is tracked or saved (no SCORM calls, no localStorage
// writes; the state lives in memory and starts empty), and a slim review toolbar (src/review/) shows
// the screen's id, template, chapter and word count. Works with ?screen=ID.
import { h, fmt, chapterNo, resolveChapterRefs } from './util.js?v=7fdf6fcd';
import { createZones } from './zones.js?v=7fdf6fcd';
import { createMenu, openDialog } from './menu.js?v=7fdf6fcd';
import { initTooltips, applyTerms } from './tooltip.js?v=7fdf6fcd';
import { loadState, saveState, clearState, emptyState, decode } from './state.js?v=7fdf6fcd';
import { decision } from './templates/decision.js?v=7fdf6fcd';
import { input } from './templates/input.js?v=7fdf6fcd';
import { sortDeck } from './templates/sortdeck.js?v=7fdf6fcd';
import { bpmn } from './templates/bpmn.js?v=7fdf6fcd';
import { flags } from './templates/flags.js?v=7fdf6fcd';
import { explorer } from './templates/explorer.js?v=7fdf6fcd';
import { video } from './templates/video.js?v=7fdf6fcd';
import { handoff } from './templates/handoff.js?v=7fdf6fcd';
import { check } from './templates/check.js?v=7fdf6fcd';
import { result } from './templates/result.js?v=7fdf6fcd';
import { end } from './templates/end.js?v=7fdf6fcd';
import { title, moduleMap, goals, warmup, concept, keyParts, keyColumns } from './templates/intro.js?v=7fdf6fcd';
import { createGhost, stopGhost } from './ghost.js?v=7fdf6fcd';
import { compose, composes } from './compose.js?v=7fdf6fcd';
import { createTracking } from './tracking/index.js?v=7fdf6fcd';
import { describe } from './tracking/describe.js?v=7fdf6fcd';
import { createCoach } from './coach/coach.js?v=7fdf6fcd';
import { LEVELS, JOURNEYS, tally, levelAt, variantOf } from './adapt.js?v=7fdf6fcd';

const STAGE_W = 1280, STAGE_H = 720;
const STAGE_W_MAX = 1600; // a wide window widens the stage up to this (about 2.2:1); wider still is letterboxed
const NARROW_BELOW = 900; // window narrower than this: show the "best on a computer" note above the stage
const NOTE_H = 40;
const MAX_TEXT = 250;     // fill-in responses are trimmed and capped (SCORM 1.2 safe)

const TEMPLATES = { decision, input, sortDeck, bpmn, flags, explorer, video, handoff, check, result, end, title, moduleMap, goals, warmup, concept, keyParts, keyColumns };

export async function boot(root) {
  // no-cache: the browser asks the server every time whether the content changed (tools/stamp.mjs)
  const res = await fetch(new URL('../content/l4-slice.json', import.meta.url), { cache: 'no-cache' });
  if (!res.ok) throw new Error('content/l4-slice.json HTTP ' + res.status);
  const content = resolveChapterRefs(await res.json()); // FX3: "{ch5}" -> 6
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

// review order: every screen of every chapter in chapter order, then any screen no chapter lists
export function reviewOrder(content) {
  const ids = new Set(content.screens.map((s) => s.id));
  const listed = content.chapters.flatMap((c) => c.screens).filter((id) => ids.has(id));
  return [...new Set([...listed, ...content.screens.map((s) => s.id)])];
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
    this.ghosts = [];
    this.onNext = null;      // what the unlocked Next does on this screen (null = finish)
    this.pauseShown = false; // the chapter-end pause marker was shown on this screen
    this.shownAt = 0;
    this.backTo = null;      // NL4: the check screen a "Review Chapter N" link came from (S21R)
    const q = new URLSearchParams(location.search);
    this.review = q.get('review') === '1';
    // a review thumbnail (an iframe on review.html) never takes the focus from the page around it
    this.thumb = this.review && window.self !== window.top;
    // Previous / Next order: the slice; in review mode every screen, chapter by chapter
    this.order = this.review ? reviewOrder(content) : this.slice;
    this.toolbar = null;
    this.tracking = createTracking({ debug: q.get('debug') === '1', force: q.get('tracking'), off: this.review });
    // PP1 QA switches, only with ?review=1 or ?debug=1: ?level= forces one level on every adaptive
    // screen, ?path=1..5 forces a journey (its two levels)
    const qa = this.review || q.get('debug') === '1';
    this.forced = { level: qa && LEVELS.includes(q.get('level')) ? q.get('level') : null, path: qa ? JOURNEYS[q.get('path')] || null : null };
    this.checkpoints = content.lesson.adapt?.checkpoints || [];
    // PK1: interactions kept in the lesson but never sent to the LMS (lesson.lmsReport.skip)
    this.lmsSkip = new Set(content.lesson.lmsReport?.skip || []);

    this.note = h('p', { class: 'w-small-note', hidden: true }, this.ui.smallScreenNote);
    this.stage = h('div', { class: 'w-stage' });
    root.replaceChildren(this.note, this.stage);
    initTooltips(this.stage);

    this.zones = createZones(this.stage, content, {
      onMenu: (btn) => this.menu.open(btn),
      onPrev: () => this.prev(),
      onNext: () => this.nextAction(),
      // FX4: a first wrong answer brings "Show me how" out on screens that have one
      onWrong: () => this.ghosts.forEach((g) => g.reveal && g.reveal()),
    });
    this.menu = createMenu(this.stage, content, {
      zones: this.zones,
      getMenu: () => this.menuModel(),
      onChapter: (n) => this.goChapter(n),
      onStartOver: () => this.startOver(),
    });
    // CO1: the Wawiwa AI Coach (offline tips), launcher in the bar on every screen; never tracked.
    // CO2: live (Dor's coach page framed in the panel) except in review mode and with ?live=0 (the tests
    // that run without the network)
    this.coach = createCoach(this.stage, content, { zones: this.zones, review: this.review, thumb: this.thumb, preview: q.get('coach'),
      demoScreen: content.ui.coach.demoOn, live: !this.review && q.get('live') !== '0', getState: () => this.state });

    // SCORM 1.2: the LMS holds the state (suspend_data, lesson_location); local mode: localStorage
    const lms = this.tracking.init();
    this.lms = !!lms.ok;
    if (this.review) {
      // review mode: a fresh state in memory, so every screen shows as a first visit; storage untouched
      this.state = emptyState();
      this.zones.setSaved(true);
    } else if (this.lms) {
      this.state = lms.suspend ? decode(lms.suspend) : emptyState();
      if (!this.state.s && lms.location && this.screens[lms.location]) this.state.s = lms.location;
      // NL4: "passed" can reach the LMS before the finish (S21R), so the adapter learns from the state,
      // not from lesson_status, whether the lesson is finished (PK1: exit "" only once finished and passed)
      this.tracking.setFinished(!!this.state.fin);
      this.zones.setSaved(true);
    } else {
      const { state, ok } = loadState();
      this.state = state;
      this.zones.setSaved(ok);
    }

    // FX4: S19 became S19A, S19B and S19C. A state saved on the old S19 (the pilot's suspend_data) carries
    // over to S19B, the screen that kept S19's job (the "opened" flag, done, the saved place)
    if (!this.screens.S19 && this.screens.S19B) {
      const st = this.state;
      if (st.s === 'S19') st.s = 'S19B';
      if (st.g?.S19 && !st.g.S19B) { st.g.S19B = st.g.S19; delete st.g.S19; }
      if (Array.isArray(st.d) && st.d.includes('S19')) st.d = st.d.map((x) => (x === 'S19' ? 'S19B' : x));
    }

    this.layout();
    new ResizeObserver(() => this.layout()).observe(root);
  }

  /* ---- stage scaling: 720 px high, 1280 to 1600 px wide to fill the window, scale to fit, never
     scroll. A wide window widens the stage: the bar, main and the footer span it, the scene photo covers it,
     and each layout spreads into the extra width (--w-stage-w and --w-x in frame.css). ---- */
  layout() {
    const fullW = this.root.clientWidth, fullH = this.root.clientHeight;
    if (!fullW || !fullH) return;
    // FX4 (Dor's Blossom shots, clipped on the left): fit into the part of this frame that is really
    // visible. In an LMS the page may sit in an iframe larger than the window or inside a clipping
    // container; same-origin parents (Blossom serves the package from its own origin) tell us where.
    const vis = this.visibleBox(fullW, fullH);
    const W = vis.w, H = vis.h;
    const narrow = W < NARROW_BELOW;
    this.note.hidden = !narrow;
    this.note.style.left = vis.x + 'px';
    this.note.style.width = W + 'px';
    this.note.style.right = 'auto';
    this.note.style.top = vis.y + 'px';
    const top0 = narrow ? NOTE_H : 0;
    const availH = H - top0;
    const scale = Math.max(0.05, Math.min(W / STAGE_W, availH / STAGE_H));
    const stageW = Math.round(Math.min(STAGE_W_MAX, Math.max(STAGE_W, W / scale)));
    this.stage.style.setProperty('--w-stage-w', stageW + 'px');
    const left = vis.x + (W - stageW * scale) / 2;
    const top = vis.y + top0 + (availH - STAGE_H * scale) / 2;
    this.stage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
    this.scale = scale;
  }

  // The visible part of this page's viewport, in its own px: { x, y, w, h }. Walks up the same-origin
  // frames: each parent's viewport and every clipping ancestor (overflow not visible) of the iframe.
  // Cross-origin parents (or none) leave the whole viewport.
  visibleBox(W, H) {
    let box = { l: 0, t: 0, r: W, b: H };
    try {
      let win = window, dx = 0, dy = 0; // dx, dy: this page's origin in win's coordinates
      while (win !== win.top && win.frameElement) {
        const fe = win.frameElement, pw = win.parent;
        const fr = fe.getBoundingClientRect();
        dx += fr.left + fe.clientLeft; dy += fr.top + fe.clientTop;
        const clip = (l, t, r, b) => { box = { l: Math.max(box.l, l - dx), t: Math.max(box.t, t - dy), r: Math.min(box.r, r - dx), b: Math.min(box.b, b - dy) }; };
        const de = pw.document.documentElement;
        clip(0, 0, de.clientWidth || pw.innerWidth, de.clientHeight || pw.innerHeight);
        for (let el = fe.parentElement; el && el !== de; el = el.parentElement) {
          const cs = pw.getComputedStyle(el);
          if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const r = el.getBoundingClientRect(); clip(r.left + el.clientLeft, r.top + el.clientTop, r.left + el.clientLeft + el.clientWidth, r.top + el.clientTop + el.clientHeight); }
        }
        // the next level up measures in the grandparent's coordinates
        win = pw;
        if (!this.watched?.has(pw)) {
          (this.watched ||= new Set()).add(pw);
          pw.addEventListener('resize', () => this.layout());
          pw.addEventListener('scroll', () => this.layout(), true);
        }
      }
    } catch { box = { l: 0, t: 0, r: W, b: H }; } // cross-origin: the whole viewport
    // a box too small to use (a frame scrolled almost out of view) falls back to the whole viewport
    if (box.r - box.l < 160 || box.b - box.t < 90) box = { l: 0, t: 0, r: W, b: H };
    return { x: box.l, y: box.t, w: box.r - box.l, h: box.b - box.t };
  }

  start() {
    const q = new URLSearchParams(location.search);
    if (this.review) {
      // any screen by id, the first screen otherwise; no resume prompt, no reset of the saved state.
      // The toolbar is a dynamic import: src/review/ stays out of the SCORM package (no toolbar there).
      const jump = q.get('screen');
      this.go(jump && this.screens[jump] ? jump : this.order[0]);
      import('./review/toolbar.js?v=7fdf6fcd').then((m) => { this.toolbar = m.createToolbar(this); this.toolbar.show(this.current); }).catch(() => {});
      return;
    }
    if (q.get('reset') === '1') { clearState(); this.state = emptyState(); }
    const jump = q.get('screen');
    if (jump && this.screens[jump] && this.slice.includes(jump)) { this.go(jump); return; }
    // resume: the saved place (localStorage, or suspend_data / lesson_location from the LMS)
    // (the title screen completes on arrival, so "done screens" alone does not mean the learner went on)
    let s = this.state.s;
    // PK1: finished below the pass mark (state.fin, not lesson_status): a resume at S22 or END opens the
    // check's result instead, where "Retake now" is
    const kr = this.content.screens.find((x) => x.template === 'result')?.id;
    if (this.state.fin && !this.state.k?.p && kr && this.slice.includes(kr) && this.order.indexOf(s) > this.order.indexOf(kr)) s = kr;
    if (s && this.slice.includes(s) && s !== this.slice[0]) {
      this.go(s);
      openDialog(this.stage, {
        text: this.ui.resumePrompt,
        inert: [this.zones.bar, this.zones.main, this.zones.footer],
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
    if (!this.screens[id]) return;
    this.reachCheckpoints(id);
    const screen = this.view(id); // PP1: the variant of the learner's level (core when none)
    this.unmount();
    this.current = id;
    this.onNext = null;
    this.pauseShown = false;
    this.state.s = id;
    this.persist();
    this.zones.instruction.textContent = screen.instruction;
    this.zones.setNext(!this.review, this.lockedWhy(screen), screen.lockedNext, this.review ? '' : this.needLine(screen)); // review mode: never locked
    this.zones.setPrev(this.order.indexOf(id) > 0);
    // NL4: a "Review Chapter N" link on S21R opens an earlier screen with "Back to the check" in the
    // footer; the chip stays while the learner looks around and goes once they are back at the check
    if (this.backTo && (id === this.backTo || id === this.content.screens.find((s) => s.id === this.backTo)?.from)) this.backTo = null;
    this.zones.setBack(this.backTo ? this.ui.buttons.backToCheck : null, () => this.go(this.backTo));
    const tpl = TEMPLATES[screen.template];
    if (!tpl) throw new Error('no template ' + screen.template + ' for ' + id);
    // the scene: Stage (the chapter photo under the bar), Focus (the photo wash) or O1's dark title
    // scene, chosen by the template; the photo is the screen's own (O1) or its chapter's
    const chapter = this.chapters.find((c) => c.id === screen.chapter);
    // FX5 (Noy: "the photo always the background, every screen the same"): a Focus screen may take another
    // look from the content (screen.look): 'band' (the photo as a band at the top), 'split' (the photo on
    // the left, the task on a light ground right), 'light' (a clean light ground, no photo)
    const mode = tpl.scene ? tpl.scene(screen) : 'focus';
    // (FX6: any other look, e.g. "none" for a wide task, stands on the light ground)
    const sceneLook = screen.look ? (['band', 'split', 'light'].includes(screen.look) ? screen.look : 'light') : null;
    this.zones.setScene(mode === 'focus' && sceneLook ? sceneLook : mode, screen.photo || chapter?.photo || null);
    // QA1: the next screen's photo loads now, so it is there when that screen opens (no dark gap)
    const after = this.screens[this.order[this.order.indexOf(id) + 1]];
    const afterPhoto = after && (after.photo || this.chapters.find((c) => c.id === after.chapter)?.photo);
    if (afterPhoto?.src && !this.thumb) new Image().src = afterPhoto.src;
    const done = this.doneSet();
    this.shownAt = performance.now();
    this.mounted = tpl.mount({
      screen, content: this.content, ui: this.ui, zones: this.zones,
      revisit: done.has(id),            // revisiting a completed screen: show the earlier answer, read-only
      complete: () => this.complete(id),
      next: () => this.next(),
      goTo: (to) => this.go(to),
      // Next in the footer: unlock (red), optionally with its own action (FT1 wrong = the route)
      // (review mode: Next stays unlocked and always walks on in order, so both only keep the focus move)
      // FX4: unlocked, the line beside Next says what comes next ("Up next: Label"); a template's own
      // line (upNext) wins, e.g. S22's takeaway that leads to step 2 of the same screen
      unlockNext: ({ focus: f = false, onNext = null, upNext = null } = {}) => { if (!this.review) this.onNext = onNext; this.zones.setNext(false, '', null, upNext ?? this.upNextLine(id)); if (f) this.zones.nextBtn.focus(); },
      lockNext: (why = null, line = null) => { if (this.review) return; this.onNext = null; this.zones.setNext(true, why || this.lockedWhy(screen), screen.lockedNext, line ?? this.needLine(screen)); },
      // FX4: the visible line beside a locked Next, when the template knows more ("Open the 5 remaining fields.")
      need: (line) => { if (!this.review && this.zones.nextBtn.dataset.locked === 'true') this.zones.setNeed(line); },
      answer: (a) => this.answer(id, a),
      firstAnswer: (trackingId) => this.firstAnswer(trackingId),
      store: { get: (key) => this.state.f[key] ?? '', set: (key, value) => { this.state.f[key] = value; } },
      // small per-screen flags kept in suspend data (handoff opened / back, checkbox, chosen chip, ...)
      flags: { get: (key) => this.state.g[id]?.[key], set: (key, value) => { (this.state.g[id] ||= {})[key] = value; this.persist(); } },
      flagsOf: (screenId) => this.state.g[screenId] || {},
      chapter,
      setRoute: (route) => this.setRoute(id, route),
      score: () => this.score(),
      // NL4 knowledge check attempts (S21, S21R): the attempt number, the state kept for it, the end of
      // an attempt, a retake, and a review link that comes back here
      attempt: () => this.state.k?.n || 1,
      checkVersion: () => this.checkVersion(), // FX3: 'a' or 'b'
      checkState: () => ({ n: 1, s: null, p: 0, ...(this.state.k || {}) }),
      checkDone: () => this.checkDone(),
      retake: () => this.retakeCheck(),
      reviewGo: (to) => { this.backTo = id; this.go(to); },
      finishLesson: () => this.finishLesson(),
      finished: () => !!this.state.fin,
      // the ghost hand (src/ghost.js): a once-per-interaction-type demo with a "Show me" replay
      ghost: (opts) => this.ghostFor(opts),
    });
    // FX6 (Noy): a question screen is laid out again over the whole stage, on a light ground, its photo
    // framed and never under an object (src/compose.js)
    if (composes(screen)) {
      const photo = screen.photo || chapter?.photo || null;
      if (compose(this.zones.main, screen, photo)) this.zones.setScene('light', null);
    }
    // presentation screens (title, module map, goals, key idea) never lock Next: done on arrival
    if (screen.presentation) { this.complete(id); this.zones.setNext(false); }
    applyTerms(this.zones.main, screen.terms, this.content.tooltips);
    this.renderBar();
    this.coach.show(screen, chapter);
    if (this.toolbar) this.toolbar.show(id);
    if (focus && !this.thumb) this.zones.instruction.focus({ preventScroll: true });
  }

  // why Next is locked on this screen (its aria-label): the screen's own key (NL4: S19, S20B), by
  // variant, then template
  lockedWhy(screen) {
    const l = this.ui.footer.locked;
    return l[screen.locked] || l[screen.variant] || l[screen.template] || l.default;
  }

  // FX4: the short visible line beside a locked Next (ui.footer.need), by the same keys
  needLine(screen) {
    const l = this.ui.footer.need || {};
    return screen.needLine || l[screen.locked] || l[screen.variant] || l[screen.template] || l.default || '';
  }

  // FX4: the line beside an unlocked Next: the next screen's step ("Up next: Label"), or its chapter when
  // the next screen opens a new one ("Up next: Chapter 4, HR demo")
  upNextLine(id) {
    const f = this.ui.footer;
    if (this.screens[id].upNext) return this.screens[id].upNext; // a screen's own line (S19B)
    const i = this.order.indexOf(id);
    const nx = this.screens[this.order[i + 1]];
    if (!nx || !f.upNext) return '';
    if (nx.step?.join && nx.chapter === this.screens[id].chapter) return ''; // the same step goes on: nothing new to name
    if (nx.chapter !== this.screens[id].chapter) {
      const c = this.chapters.find((x) => x.id === nx.chapter);
      return c ? fmt(f.upNextChapter, { n: chapterNo(this.content, c.id), title: c.title }) : '';
    }
    // a step shared with the screen before (step.join) takes that screen's verb
    const ids = this.chapters.find((c) => c.id === nx.chapter)?.screens || [];
    let k = ids.indexOf(nx.id);
    while (k > 0 && this.screens[ids[k]]?.step?.join) k -= 1;
    const verb = this.screens[ids[k]]?.step?.verb;
    return verb ? fmt(f.upNext, { what: verb }) : '';
  }

  nextAction() {
    if (this.review) this.next();
    else if (this.onNext) this.onNext();
    else this.finish(this.current);
  }

  /* ---- score (S21) and the end of the lesson ---- */
  // FX3: the knowledge check's version for this attempt: a on the first, b on a retake, then a, b, ...
  checkVersion() { return (this.state.k?.n || 1) % 2 ? 'a' : 'b'; }

  // First attempts of the scored interactions only (lesson.completion.scoredScreens): x right of n,
  // raw 0 to 100. FX3: only this attempt's version (a tracking entry without a version is version a).
  // QZ1: completion.pointsPerItem gives each right answer that many points, capped at 100 (S21: 20
  // each over six items, so 4 of 6 reaches the pass mark of 80); without it, raw is the percentage.
  score() {
    const c = this.content.lesson.completion;
    const v = this.checkVersion();
    const ids = c.scoredScreens.flatMap((sid) => (this.screens[sid]?.tracking || []).filter((t) => t.scored && (t.version || 'a') === v).map((t) => t.id));
    const x = ids.filter((tid) => this.firstAnswer(tid)?.result === 'correct').length;
    const raw = !ids.length ? null : c.pointsPerItem ? Math.min(100, c.pointsPerItem * x) : Math.round((100 * x) / ids.length);
    return { x, n: ids.length, raw };
  }

  // NL4: the end of a knowledge-check attempt (the last S21 item done). The attempt's score is the
  // latest (state.k.s, score.raw in SCORM); an attempt at or over the pass mark makes the lesson passed
  // for good (state.k.p, sticky): the LMS gets "passed" now, and a later finish stays passed.
  checkDone() {
    const c = this.content.lesson.completion;
    const sc = this.score();
    const k = this.state.k = { n: 1, p: 0, ...(this.state.k || {}), s: sc.raw };
    if (sc.raw !== null && sc.raw >= c.passMark) k.p = 1;
    if (k.p && this.state.fin) this.state.fin = 'passed';
    this.tracking.emit({ kind: 'score', score: sc.raw, passed: !!k.p, attempt: k.n });
    this.persist();
    return { ...sc, passed: !!k.p, attempt: k.n };
  }

  // NL4 "Retake now": a new attempt of the whole check, at once. The check's answers are cleared, so
  // each item's first answer in the new attempt goes out again as an answer (SCORM: one more
  // cmi.interactions entry per item and attempt); S21 and S21R are no longer done.
  retakeCheck() {
    const k = this.state.k = { n: 1, s: null, p: 0, ...(this.state.k || {}) };
    k.n += 1;
    const ids = this.content.lesson.completion.scoredScreens.flatMap((sid) => (this.screens[sid]?.tracking || []).map((t) => t.id));
    ids.forEach((tid) => { delete this.state.a[tid]; delete this.state.x[tid]; });
    const again = new Set([...this.content.lesson.completion.scoredScreens, ...this.content.screens.filter((s) => this.content.lesson.completion.scoredScreens.includes(s.from)).map((s) => s.id)]);
    this.state.d = this.state.d.filter((sid) => !again.has(sid));
    this.backTo = null;
    this.persist();
    this.go(this.content.lesson.completion.scoredScreens[0]);
  }

  // Finish (S22): passed once any attempt reached the pass mark (sticky), incomplete otherwise (PK1:
  // never "failed" or "completed", so the LMS keeps the suspend data and the learner can come back to
  // retake); the score is the latest attempt's. state.fin (truthy) is what says the lesson was finished.
  finishLesson() {
    const c = this.content.lesson.completion;
    const sc = this.score();
    const passed = !!this.state.k?.p || (sc.raw !== null && sc.raw >= c.passMark);
    const status = passed ? 'passed' : c.statusWhenNotPassed;
    this.state.fin = status;
    this.tracking.emit({ kind: 'finish', status, score: sc.raw, passMark: c.passMark, attempt: this.state.k?.n || 1 });
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
      // PK1: and what an LMS report shows (the question and the answers in words; lms false = not sent)
      const correctResponse = meta?.correctResponse ?? null;
      this.tracking.emit({ kind: 'answer', trackingId, type, response, result, latencyMs, correctResponse, scored: !!meta?.scored,
        lms: !this.lmsSkip.has(trackingId), report: describe(this.view(screenId), trackingId, { type, response, correctResponse }, this.ui) });
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
    const s = this.view(screenId); // PP1: the shown variant's correct response
    const all = [...(s.tracking || []), ...(s.stops || []).map((x) => x.tracking)];
    return all.find((t) => t && t.id === trackingId) || null;
  }

  /* ---- PP1 personal path (src/adapt.js): silent, never shown to the learner ---- */
  // the screen as this learner sees it: its chapter's level picks the variant
  view(id) {
    const s = this.screens[id];
    return s && s.variants ? variantOf(s, this.levelFor(s.chapter)) : s;
  }

  // a chapter's level: a QA switch first, then the frozen level, else core
  levelFor(chapterId) {
    const i = this.checkpoints.findIndex((cp) => cp.chapter === chapterId);
    if (i < 0) return 'core';
    return this.forced.level || this.forced.path?.[i] || this.state.p?.[this.checkpoints[i].key] || 'core';
  }

  // Entering a checkpoint's chapter (or any later one: a resume or a jump) sets its level once, from the
  // first answers in state.a, and records it as one neutral, unscored interaction (L4_PATH_C4 / _C5).
  // Its type is fill-in: SCORM 1.2 allows a choice response of single characters only ("a", "b,d"), and
  // the level goes to the LMS as its word (support, core, stretch).
  // Review mode sets nothing (its state is in memory; the QA switches choose the variant).
  reachCheckpoints(id) {
    if (this.review) return;
    const ci = (cid) => this.chapters.findIndex((c) => c.id === cid);
    const here = ci(this.screens[id].chapter);
    this.checkpoints.forEach((cp, i) => {
      if (here < ci(cp.chapter) || this.state.p?.[cp.key]) return;
      const prev = i ? this.state.p?.[this.checkpoints[i - 1].key] || 'core' : null;
      const level = this.forced.level || this.forced.path?.[i] || levelAt(cp, tally(cp.items, (tid) => this.firstAnswer(tid)), prev);
      this.state.p = { ...(this.state.p || {}), [cp.key]: level };
      this.tracking.emit({ kind: 'answer', trackingId: cp.trackingId, type: 'fill-in', response: level, result: 'neutral', latencyMs: 0, correctResponse: null, scored: false,
        lms: !this.lmsSkip.has(cp.trackingId), report: null });
    });
  }

  setRoute(screenId, route) {
    this.state.r[screenId] = route;
    this.tracking.emit({ kind: 'route', screen: screenId, route });
    this.persist();
  }

  unmount() {
    if (this.mounted && this.mounted.unmount) this.mounted.unmount();
    this.mounted = null;
    this.ghosts.forEach((g) => g.cancel());
    this.ghosts = [];
    stopGhost();
    this.zones.clearScreen();
  }

  // The ghost hand for one interaction on this screen. The first time a type (tabs, stop, pickTwo)
  // appears it plays ~600 ms after the screen settles; once the type is seen it plays only after 8 s
  // without input. One letter per seen type is kept in state.h (suspend data). Returns { button, cancel }.
  ghostFor({ type, steps, restore = null, chip = null, delay = null }) {
    const code = { tabs: 't', stop: 'v', pickTwo: 's', copy: 'y' }[type] || type.charAt(0); // NL4: S19's Copy (y)
    // FX5 (Noy, 8 Nov 2026): the hand plays on arrival, on every screen that has one (the choice screens
    // have none), and "Show me how" replays it
    const seen = false;
    const g = createGhost(this.stage, { ui: this.ui, steps, restore, seen, chip, delay,
      onPlay: () => { if (!(this.state.h || '').includes(code)) { this.state.h = (this.state.h || '') + code; this.persist(); } } });
    this.ghosts.push(g);
    return g;
  }

  next() {
    const i = this.order.indexOf(this.current);
    if (i >= 0 && i < this.order.length - 1) this.go(this.order[i + 1]);
    else this.zones.setFeedback({ state: 'pause', text: this.ui.sliceEnd });
  }

  prev() {
    const i = this.order.indexOf(this.current);
    if (i > 0) this.go(this.order[i - 1]);
  }

  // Mark a screen done. First answers are kept by answer() and never overwritten (and, from P4,
  // never re-reported to SCORM).
  complete(id) {
    if (!this.state.d.includes(id)) this.state.d.push(id);
    this.persist();
    this.renderBar();
  }

  // A completed chapter opens at its first screen; the chapter in progress opens where the learner is.
  goChapter(n) {
    const c = this.chapters.find((x) => x.n === n);
    if (!c || !c.screens.length) return;
    if (this.review) { this.go(c.screens[0]); return; }
    const fi = this.frontierIndex();
    const here = fi < this.slice.length && c.screens.includes(this.slice[fi]) ? this.slice[fi] : c.screens[0];
    this.go(here);
  }

  startOver() {
    if (!this.review) clearState();
    this.state = emptyState();
    this.backTo = null;
    this.go(this.order[0]);
  }

  // every change: to the LMS (suspend_data, lesson_location) in SCORM mode, else to localStorage;
  // the Saved indicator shows whether the last write was accepted. Review mode: nothing is written.
  persist() {
    if (this.review) return;
    const sent = this.tracking.persist(this.state);
    this.zones.setSaved(this.lms ? sent : saveState(this.state));
  }

  /* ---- progress model (top bar and menu) ---- */
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
      // review mode: every chapter with screens opens from the menu
      return { c, status, clickable: this.review ? c.screens.length > 0 : status === 'done' || status === 'current' };
    });
    return { percent, chapters, frontierChapter };
  }

  // The top bar: the viewed chapter's name and its steps. Each screen names its step (verb + icon key)
  // in the content; a screen with step.join shares the step of the screen before it. Steps before
  // the current one are done, so are later ones whose screens are all done; the rest are to come.
  renderBar() {
    const screen = this.screens[this.current];
    const chapter = screen && this.chapters.find((c) => c.id === screen.chapter);
    if (!chapter) return;
    const groups = [];
    chapter.screens.filter((sid) => this.screens[sid]).forEach((sid) => {
      const st = this.screens[sid].step || {};
      if (st.join && groups.length) groups[groups.length - 1].ids.push(sid);
      else groups.push({ verb: st.verb || '', icon: st.icon || 'decide', ids: [sid] });
    });
    const done = this.doneSet();
    const ci = groups.findIndex((g) => g.ids.includes(this.current));
    this.zones.setBar({
      chapter: chapter.title,
      of: fmt(this.ui.rail.chapterOf, { n: chapterNo(this.content, chapter.id), total: this.chapters.length }),
      steps: groups.map((g, i) => ({ verb: g.verb, icon: g.icon,
        state: i === ci ? 'current' : i < ci || g.ids.every((sid) => done.has(sid)) ? 'done' : 'next' })),
    });
  }
  // the side menu: each chapter's status only (no times, no % in the look; minutes still weigh progress())
  menuModel() {
    const p = this.progress();
    const m = this.ui.menu;
    return {
      chapters: p.chapters.map(({ c, status, clickable }) => ({
        n: c.n, no: chapterNo(this.content, c.id), title: c.title, status, clickable, current: c.id === p.frontierChapter,
        label: fmt(m.chapterLabel, { title: c.title, status: this.ui.rail.status[status] }),
      })),
    };
  }
}
