// SCORM 1.2 adapter (PRD section 7, P4). API discovery walk and identity guard copied from
// Practice Studio engine/passback.js (parent chain, then opener chain; 1.2 only here).
//   init       LMSInitialize; reads cmi.core.entry, cmi.suspend_data, cmi.core.lesson_location and
//              lesson_status; sets incomplete on a first launch only (never downgrades).
//   record     first attempts only (the engine sends one 'answer' per interaction id): one
//              cmi.interactions.n per id with id, type, student_response, result, latency, time,
//              weighting (1 scored, 0 practice) and correct_responses.0.pattern when there is one.
//              PK1: from ev.report (src/tracking/describe.js): id = the interaction id + the question
//              in words, type fill-in, the response and the pattern as text; ev.lms false = not sent.
//              NL4: a retake of the check sends each item again (one more entry per item and attempt).
//              'score' (an attempt of the check ends) sets score raw / min / max (the latest attempt)
//              and, once an attempt passed, lesson_status passed; never back down from passed.
//              'finish' sets score raw / min / max and passed, or incomplete below the pass mark.
//              PK1: lesson_status is only ever "incomplete" or "passed" (never "failed" or "completed").
//   save       suspend_data and lesson_location on every change; exit always "suspend" (PK1: one
//              attempt per learner; the LMS keeps suspend_data, so a learner below 80 can come back
//              and retake the check, and a learner who passed comes back to their own work).
//   terminate  session_time, exit, commit and LMSFinish, once (pagehide / beforeunload).
// Commits are throttled to one per 2 s and flushed on finish and exit. Every call is checked with
// LMSGetLastError, logged, and never throws into the page. No identity element is ever touched.
const IDENTITY_FIELDS = /student_id|student_name|learner_id|learner_name/i;
const COMMIT_EVERY_MS = 2000;
const MAX_RESPONSE = 250;
const STATUSES = ['incomplete', 'passed']; // PK1: the only lesson_status values this module ever sets

function scanChain(win) {
  let hops = 0;
  while (win && hops < 8) {
    try {
      if (win.API) return win.API;
    } catch { return null; } // cross-origin wall: stop this chain
    if (win.parent && win.parent !== win) { win = win.parent; hops++; } else break;
  }
  return null;
}
export function findAPI(root = window) {
  return scanChain(root) || (root.opener ? scanChain(root.opener) : null);
}

const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
// CMITimespan HHHH:MM:SS.SS
export function timespan(ms) {
  const t = Math.max(0, ms) / 1000;
  const h = Math.min(9999, Math.floor(t / 3600)), m = Math.floor((t % 3600) / 60), s = t % 60;
  return `${pad(h, 4)}:${pad(m)}:${s.toFixed(2).padStart(5, '0')}`;
}
// CMITime HH:MM:SS (local clock)
const clock = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
// SCORM 1.2 student_response: fill-in trimmed, no control characters, at most 250; choice and
// matching are already single lowercase identifiers ("b", "4,7", "1.a,2.b")
const cleanResponse = (type, v) => {
  const s = String(v ?? '');
  return type === 'fill-in' ? s.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, MAX_RESPONSE) : s.toLowerCase();
};

export function createScorm12(api, { log = () => {} } = {}) {
  let initialized = false, terminated = false, finished = false, passed = false, lastCommit = 0, pending = null;
  const started = Date.now();
  // PK1 (Noy, 1 Nov 2026, after the Blossom test): one attempt per learner that keeps everything, so
  // exit is always "suspend", also once finished and passed. Blossom starts a new, empty attempt after an
  // exit "" (a learner coming back would lose their case notes); "passed" is what marks it completed.
  const exitNow = () => 'suspend';
  const guard = (el, v) => {
    if (IDENTITY_FIELDS.test(el)) throw new Error('identity_field_refused ' + el);
    if (el === 'cmi.core.lesson_status' && v !== undefined && !STATUSES.includes(String(v))) throw new Error('status_refused ' + v);
    return el;
  };
  const err = (what) => {
    try {
      const code = String(api.LMSGetLastError());
      if (code && code !== '0') { log(`${what} error ${code} ${api.LMSGetErrorString(code)}`); return false; }
    } catch { /* an LMS without error calls */ }
    return true;
  };
  const get = (el) => { try { const v = api.LMSGetValue(guard(el)); err('get ' + el); log(`get ${el} = ${String(v).slice(0, 60)}`); return v == null ? '' : String(v); } catch (e) { log('get failed ' + e.message); return ''; } };
  const set = (el, v) => { try { const r = api.LMSSetValue(guard(el, v), String(v)); log(`set ${el} = ${String(v).slice(0, 60)}`); return String(r) === 'true' && err('set ' + el); } catch (e) { log('set failed ' + e.message); return false; } };
  const commitNow = () => { clearTimeout(pending); pending = null; lastCommit = Date.now(); try { const r = String(api.LMSCommit('')) === 'true'; log('commit ' + r); return r && err('commit'); } catch { return false; } };
  const commit = () => {
    const wait = COMMIT_EVERY_MS - (Date.now() - lastCommit);
    if (wait <= 0) return commitNow();
    if (!pending) pending = setTimeout(commitNow, wait);
    return true;
  };

  return {
    mode: 'scorm12',
    init() {
      try { initialized = String(api.LMSInitialize('')) === 'true'; } catch { initialized = false; }
      log('initialize ' + initialized);
      if (!initialized) return { ok: false };
      const entry = get('cmi.core.entry');
      const status = get('cmi.core.lesson_status');
      const suspend = get('cmi.suspend_data');
      const location = get('cmi.core.lesson_location');
      if (!status || status === 'not attempted') set('cmi.core.lesson_status', 'incomplete');
      finished = false; // the engine says, from state.fin in suspend_data (setFinished), never from the status
      passed = status === 'passed'; // sticky: a later finish below the pass mark stays passed
      commitNow();
      return { ok: true, entry, status, suspend, location };
    },
    setFinished(f) { finished = !!f; },
    record(ev) {
      if (!initialized || terminated) return;
      if (ev.kind === 'answer') {
        if (ev.lms === false) { log('not reported ' + ev.trackingId); return; } // PK1: lesson.lmsReport.skip
        // PK1: readable in the LMS report: the id carries the question, the answers are words (fill-in)
        const r = ev.report;
        const type = r ? 'fill-in' : ev.type;
        const n = Number(get('cmi.interactions._count')) || 0;
        const p = `cmi.interactions.${n}.`;
        set(p + 'id', r ? r.id : ev.trackingId);
        set(p + 'type', type);
        set(p + 'student_response', cleanResponse(type, r ? r.response : ev.response));
        // PK1: an item with no right answer (free text, polls) sends no result: Blossom marks "neutral"
        // with the same X as "wrong" (result is optional in SCORM 1.2)
        if (ev.result === 'correct' || ev.result === 'wrong') set(p + 'result', ev.result);
        set(p + 'latency', timespan(ev.latencyMs || 0));
        set(p + 'time', clock());
        set(p + 'weighting', ev.scored ? '1' : '0');
        const pattern = r ? r.correct : ev.correctResponse;
        if (pattern != null) set(p + 'correct_responses.0.pattern', cleanResponse(type, pattern));
        commit();
      } else if (ev.kind === 'score') {
        if (ev.score != null) {
          set('cmi.core.score.min', '0');
          set('cmi.core.score.max', '100');
          set('cmi.core.score.raw', String(ev.score));
        }
        if (ev.passed) { set('cmi.core.lesson_status', 'passed'); passed = true; }
        commitNow();
      } else if (ev.kind === 'finish') {
        if (ev.score != null) {
          set('cmi.core.score.min', '0');
          set('cmi.core.score.max', '100');
          set('cmi.core.score.raw', String(ev.score));
        }
        if (ev.status === 'passed') passed = true;
        set('cmi.core.lesson_status', passed ? 'passed' : 'incomplete');
        finished = true;
        set('cmi.core.exit', exitNow());
        commitNow();
      }
    },
    save(suspend, location) {
      if (!initialized || terminated) return false;
      const a = set('cmi.suspend_data', suspend);
      const b = set('cmi.core.lesson_location', location || '');
      if (exitNow()) set('cmi.core.exit', 'suspend');
      return commit() && a && b;
    },
    terminate() {
      if (!initialized || terminated) return;
      terminated = true;
      set('cmi.core.session_time', timespan(Date.now() - started));
      set('cmi.core.exit', exitNow());
      commitNow();
      try { api.LMSFinish(''); } catch { /* LMS already gone */ }
      log('finish');
    },
  };
}
