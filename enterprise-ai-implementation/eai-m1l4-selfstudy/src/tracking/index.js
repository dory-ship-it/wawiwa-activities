// Tracking event bus. P1 STUB: templates report answers here; P4 plugs the SCORM 1.2 adapter
// (and the local adapter with the ?debug=1 panel) into setAdapter().
// Event kinds:
//   answer  first attempt of an interaction: { kind, trackingId, type, response, result, latencyMs, at }
//   retry   any later attempt:               { kind, trackingId, type, response, result, attempt, latencyMs, at }
//   route   fast-track route chosen:         { kind, screen, route, at }
// response: option letters in on-screen order ("b", "b,d"), or the trimmed text for fill-in (max 250).
// result: correct | wrong | neutral.
export function createTracking({ debug = false } = {}) {
  const events = [];
  const listeners = new Set();
  let adapter = null;

  function emit(e) {
    const ev = { ...e, at: new Date().toISOString() };
    events.push(ev);
    if (debug) console.log('[tracking]', JSON.stringify(ev));
    for (const fn of listeners) fn(ev);
    if (adapter && adapter.record) adapter.record(ev);
    return ev;
  }

  return {
    emit,
    events,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    setAdapter(a) { adapter = a; },
  };
}

// Option letters in on-screen order: index 0 = a.
export const letter = (i) => String.fromCharCode(97 + i);
