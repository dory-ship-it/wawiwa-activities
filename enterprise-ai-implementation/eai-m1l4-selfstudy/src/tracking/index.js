// Tracking: the event bus and the adapter (PRD section 7, P4).
// Adapter: a SCORM 1.2 API on the parent or opener chain = scorm12; otherwise local.
// ?tracking=scorm12|none forces one (scorm12 still needs an API to talk to).
// Event kinds (emit):
//   answer  first attempt of an interaction: { kind, trackingId, type, response, result, latencyMs,
//           correctResponse, scored, at }  -> one cmi.interactions.n in SCORM
//   retry   any later attempt:               { kind, trackingId, type, response, result, attempt, latencyMs, at }
//           -> suspend data only
//   route   fast-track route chosen:         { kind, screen, route, at } -> suspend data only
//   finish  the lesson is finished (S22):    { kind, status, score, passMark, at } -> status and score
// response: option letters in on-screen order ("b", "b,d"), "1.a,2.b" for matching, the trimmed
// text for fill-in (max 250). result: correct | wrong | neutral.
// persist(): the encoded state to suspend_data and the screen to lesson_location (SCORM) on every
// change. ?debug=1 logs every call to the console (calls keeps them for the tests).
import { encode } from '../state.js?v=1e11956b';
import { findAPI, createScorm12 } from './scorm12.js?v=1e11956b';
import { createLocal } from './local.js?v=1e11956b';

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
    if (ev.kind === 'answer' || ev.kind === 'finish') adapter.record(ev);
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
    terminate() { adapter.terminate(); },
  };
}

// Option letters in on-screen order: index 0 = a.
export const letter = (i) => String.fromCharCode(97 + i);
