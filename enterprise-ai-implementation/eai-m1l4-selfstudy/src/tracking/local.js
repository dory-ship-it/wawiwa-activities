// Local adapter (no LMS: GitHub Pages preview, local runs). Same interface as scorm12.js; the state
// itself lives in localStorage (src/state.js). It only records the SCORM 1.2 calls that would have
// been made (dev log lines, prefixed "local:"), so ?debug=1 doubles as a tracking review.
import { timespan } from './scorm12.js?v=4fdd25d6';

export function createLocal({ log = () => {} } = {}) {
  let n = 0, finished = false, passed = false;
  const started = Date.now();
  // PK1: as scorm12.js, exit "" only once the lesson is finished and passed
  const exitNow = () => (finished && passed ? '""' : 'suspend');
  return {
    mode: 'local',
    init() { log('local: initialize (localStorage)'); return { ok: false }; },
    record(ev) {
      if (ev.kind === 'answer') {
        log(`local: cmi.interactions.${n} = ${ev.trackingId} | ${ev.type} | ${String(ev.response).slice(0, 40)} | ${ev.result} | weighting=${ev.scored ? 1 : 0}`);
        n += 1;
      } else if (ev.kind === 'score') {
        if (ev.passed) passed = true;
        log(`local: cmi.core.score.raw=${ev.score}${ev.passed ? ' | cmi.core.lesson_status=passed' : ''} (attempt ${ev.attempt})`);
      } else if (ev.kind === 'finish') {
        if (ev.status === 'passed') passed = true;
        finished = true;
        log(`local: cmi.core.score.raw=${ev.score} | cmi.core.lesson_status=${passed ? 'passed' : 'incomplete'} | cmi.core.exit=${exitNow()}`);
      }
    },
    setFinished(f) { finished = !!f; },
    save(suspend, location) { log(`local: cmi.suspend_data (${suspend.length}) | cmi.core.lesson_location=${location}`); return true; },
    terminate() { log(`local: cmi.core.session_time=${timespan(Date.now() - started)} | LMSFinish`); },
  };
}
