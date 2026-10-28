// Tracking: the event bus and the adapter (PRD section 7, P4).
// Adapter: a SCORM 1.2 API on the parent or opener chain = scorm12; otherwise local.
// ?tracking=scorm12|none forces one (scorm12 still needs an API to talk to).
// Event kinds (emit):
//   answer  first attempt of an interaction: { kind, trackingId, type, response, result, latencyMs,
//           correctResponse, scored, at }  -> one cmi.interactions.n in SCORM
//   retry   any later attempt:               { kind, trackingId, type, response, result, attempt, latencyMs, at }
//           -> suspend data only
//   route   fast-track route chosen:         { kind, screen, route, at } -> suspend data only
//   score   a knowledge-check attempt ends (NL4): { kind, score, passed, attempt, at } -> score.raw
//           (the latest attempt) and, once passed, lesson_status passed (sticky)
//   finish  the lesson is finished (S22):    { kind, status, score, passMark, attempt, at } -> status and score
// response: option letters in on-screen order ("b", "b,d"; NL4: S21 sends the option's id, so a
// shuffled retake still reports "c" for the same answer), "1.a,2.b" for matching, the trimmed
// text for fill-in (max 250). result: correct | wrong | neutral.
// A retake of the check (NL4) clears the check's first answers: each item's first answer in the new
// attempt is an 'answer' again (one more cmi.interactions entry per item and attempt).
// persist(): the encoded state to suspend_data and the screen to lesson_location (SCORM) on every
// change. ?debug=1 logs every call to the console (calls keeps them for the tests).
import { encode } from '../state.js?v=6b628c2e';
import { findAPI, createScorm12 } from './scorm12.js?v=6b628c2e';
import { createLocal } from './local.js?v=6b628c2e';

export function createTracking({ debug = false, force = null, off = false } = {}) {
  const events = [];
  const listeners = new Set();
  const calls = [];
  const log = (line) => {
    calls.push(line);
    if (debug) console.log('[tracking]', line);
  };
  // review mode (?review=1): the bus still records events (tests read them), but no adapter exists,
  // so nothing reaches an LMS and nothing is saved
  if (off) {
    return {
      mode: 'off', events, calls,
      emit(e) { const ev = { ...e, at: new Date().toISOString() }; events.push(ev); for (const fn of listeners) fn(ev); return ev; },
      on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      init() { return { ok: false }; },
      persist() { return true; },
      setFinished() {},
      terminate() {},
    };
  }
  const api = force === 'none' ? null : findAPI();
  const adapter = api ? createScorm12(api, { log }) : createLocal({ log });
  let resume = { ok: false };
  let lastOk = true;

  function emit(e) {
    const ev = { ...e, at: new Date().toISOString() };
    events.push(ev);
    if (debug) console.log('[tracking]', JSON.stringify(ev));
    for (const fn of listeners) fn(ev);
    if (ev.kind === 'answer' || ev.kind === 'score' || ev.kind === 'finish') adapter.record(ev);
    return ev;
  }

  return {
    mode: adapter.mode,
    emit,
    events,
    calls,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    // LMS launch data: { ok, entry, status, suspend, location } (ok false in local mode)
    init() {
      resume = adapter.init();
      const done = () => adapter.terminate();
      window.addEventListener('pagehide', done);
      window.addEventListener('beforeunload', done);
      return resume;
    },
    // the state to the LMS; returns whether it was accepted (local mode: true)
    persist(state) {
      try { lastOk = adapter.save(encode(state), state.s || ''); } catch (e) { log('persist failed ' + e.message); lastOk = false; }
      return lastOk;
    },
    // NL4: whether the lesson is finished (from the state, read at launch): exit "" only then
    setFinished(f) { adapter.setFinished(f); },
    terminate() { adapter.terminate(); },
  };
}

// Option letters in on-screen order: index 0 = a.
export const letter = (i) => String.fromCharCode(97 + i);
