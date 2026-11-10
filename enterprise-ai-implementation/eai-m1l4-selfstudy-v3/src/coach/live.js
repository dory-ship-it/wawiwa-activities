// CO2: the live coach. Dor's Practice Studio coach page, framed in the coach panel's body; the page makes
// every AI call itself (its identity gate, redaction, token cap and offline answers are its own). The
// lesson only frames it and tells it where the learner is:
//   lesson to page  { type: 'wawiwa-coach-context', v: 1, screen, chapter, chapterTitle, step, screenType,
//                   note, tip, caseNotes }, exactly these 10 keys (the page drops any other shape), after
//                   the page's ready message and on every screen change, to the page's origin only
//   page to lesson  { type: 'wawiwa-coach-ready' } once loaded, { type: 'wawiwa-coach-close' } on Esc;
//                   taken only from the frame's own window at the page's origin, anything else is ignored
// The frame is made once per launch (the panel keeps it mounted and only hides it). No ready message in
// 8 s, or a load error: the frame goes and the panel falls back to CO1's offline tips for the launch.
// No SCORM call, nothing stored: the learner's own-case fields go to the page as they are (raw: the page
// gates and redacts them), only on own-case screens. Never in review mode or with ?live=0 (the tests
// that run without the network).
import { h, chapterNo } from '../util.js?v=5c11803c';

export const COACH_URL = 'https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/eai-m1l4-coach/';
export const COACH_ORIGIN = new URL(COACH_URL).origin;
export const READY_MS = 8000;

// CO1's coach.kind to the page's screen types
export const SCREEN_TYPES = { idea: 'present', hello: 'present', warmup: 'warmup', practice: 'practice', own: 'case', workbook: 'workbook', review: 'review', locked: 'locked' };
// the learner's own case, in the order of the lesson (S02, S08B, S12B, S17B)
export const CASE_KEYS = ['L4_CASE_TITLE', 'L4_CASE_PROBLEM', 'L4_CASE_TRIGGER', 'L4_CASE_STEPS', 'L4_CASE_OUTPUT', 'L4_CASE_BASELINE', 'L4_CASE_TARGET', 'L4_CASE_DATE', 'L4_CASE_AIFIT', 'L4_CASE_HUMAN'];
// the page's limits (characters)
export const CONTEXT_MAX = { screen: 12, chapterTitle: 80, step: 60, note: 1500, tip: 600, caseNotes: 6000 };

// each case field's label: the first field in the content that stores it ("Case title", "Steps", ...)
export function caseLabels(content) {
  const out = {};
  (function walk(o) {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    if (CASE_KEYS.includes(o.store) && typeof o.label === 'string' && !out[o.store]) out[o.store] = o.label;
    Object.values(o).forEach(walk);
  })(content.screens);
  return out;
}

// the context message for a screen; fields: the lesson's stored answers (state.f)
export function buildContext(content, screen, fields, labels) {
  const cut = (s, key) => String(s ?? '').slice(0, CONTEXT_MAX[key]);
  const screenType = SCREEN_TYPES[screen.coach?.kind] || 'practice';
  const chapter = content.chapters.find((c) => c.id === screen.chapter);
  const caseNotes = screenType !== 'case' ? '' : CASE_KEYS
    .filter((k) => typeof fields[k] === 'string' && fields[k].trim())
    .map((k) => `${labels[k] || k}: ${fields[k]}`).join('\n');
  return {
    type: 'wawiwa-coach-context', v: 1,
    screen: cut(screen.id, 'screen'),
    chapter: Math.min(content.chapters.length, Math.max(1, chapterNo(content, screen.chapter))),
    chapterTitle: cut(chapter?.title, 'chapterTitle'),
    step: cut(screen.step?.verb, 'step'),
    screenType,
    note: '',
    tip: cut(screen.coach?.tip, 'tip'),
    caseNotes: cut(caseNotes, 'caseNotes'),
  };
}

// the frame, placed right after `after` (the panel header). onReady: the page answered; onClose: Esc in
// the page; onFail: no answer in time or a load error (the frame is already gone)
export function createLiveFrame(after, { title, onReady, onClose, onFail }) {
  const frame = h('iframe', { class: 'w-coach-frame', src: COACH_URL, title, referrerpolicy: 'no-referrer',
    sandbox: 'allow-scripts allow-same-origin allow-forms' });
  let ready = false, gone = false;
  const timer = setTimeout(() => fail(), READY_MS);
  function onMessage(e) {
    if (gone || e.source !== frame.contentWindow || e.origin !== COACH_ORIGIN) return;
    const type = e.data && typeof e.data === 'object' ? e.data.type : null;
    if (type === 'wawiwa-coach-ready') { ready = true; clearTimeout(timer); onReady(); }
    else if (type === 'wawiwa-coach-close') onClose();
  }
  function fail() {
    if (gone) return;
    gone = true;
    clearTimeout(timer);
    window.removeEventListener('message', onMessage);
    frame.remove();
    onFail();
  }
  window.addEventListener('message', onMessage);
  frame.addEventListener('error', fail);
  after.after(frame);
  return {
    frame,
    ready: () => ready,
    send: (ctx) => { if (ready && !gone) frame.contentWindow?.postMessage(ctx, COACH_ORIGIN); },
  };
}
