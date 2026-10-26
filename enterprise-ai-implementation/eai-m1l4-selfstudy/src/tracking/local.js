// Local adapter (no LMS: GitHub Pages preview, local runs). Same interface as scorm12.js; the state
// itself lives in localStorage (src/state.js). It only records the SCORM 1.2 calls that would have
// been made (dev log lines, prefixed "local:"), so ?debug=1 doubles as a tracking review.
import { timespan } from './scorm12.js?v=bd7ed3c4';

export function createLocal({ log = () => {} } = {}) {
  let n = 0;
  const started = Date.now();
  return {
    mode: 'local',
    init() { log('local: initialize (localStorage)'); return { ok: false }; },
    record(ev) {
      if (ev.kind === 'answer') {
        log(`local: cmi.interactions.${n} = ${ev.trackingId} | ${ev.type} | ${String(ev.response).slice(0, 40)} | ${ev.result} | weighting=${ev.scored ? 1 : 0}`);
        n += 1;
      } else if (ev.kind === 'score') {
        log(`local: cmi.core.score.raw=${ev.score}${ev.passed ? ' | cmi.core.lesson_status=passed' : ''} (attempt ${ev.attempt})`);
      } else if (ev.kind === 'finish') {
        log(`local: cmi.core.score.raw=${ev.score} | cmi.core.lesson_status=${ev.status} | cmi.core.exit=""`);
      }
    },
    setFinished() {},
    save(suspend, location) { log(`local: cmi.suspend_data (${suspend.length}) | cmi.core.lesson_location=${location}`); return true; },
    terminate() { log(`local: cmi.core.session_time=${timespan(Date.now() - started)} | LMSFinish`); },
  };
}
