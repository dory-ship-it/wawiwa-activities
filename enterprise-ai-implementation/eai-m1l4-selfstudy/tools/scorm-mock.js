// A mock SCORM 1.2 API (window.API) for tests and a manual run (tools/scorm-mock.html).
// It records every call and enforces the SCORM 1.2 run-time rules this lesson relies on:
//   LMSInitialize first, LMSFinish once; element names; vocabularies (lesson_status, exit,
//   interaction type and result); CMITimespan / CMITime formats; score 0 to 100; suspend_data at
//   most 4096; lesson_location and student_response at most 255; interactions written in order
//   (n = _count); choice / matching responses in 1.2 identifier form; and NO identity element
//   (student_id, student_name): any read or write of one is recorded as a violation.
// Install: installScormMock({ 'cmi.core.entry': 'resume', 'cmi.suspend_data': '...', ... })
// Report:  window.__scormMock.report() -> { data, calls, errors, identity, initialized, finished }
(function (root) {
  'use strict';
  var STATUS = ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'];
  var EXIT = ['', 'suspend', 'logout', 'time-out'];
  var TYPES = ['true-false', 'choice', 'fill-in', 'matching', 'performance', 'sequencing', 'likert', 'numeric'];
  var RESULTS = ['correct', 'wrong', 'unanticipated', 'neutral'];
  var TIMESPAN = /^\d{2,4}:\d{2}:\d{2}(\.\d{1,2})?$/;
  var TIME = /^\d{2}:\d{2}:\d{2}(\.\d{1,2})?$/;
  var IDENTITY = /student_id|student_name|learner_id|learner_name/i;
  var CHOICE = /^[0-9a-z](,[0-9a-z])*$/;
  var MATCHING = /^[0-9a-z]\.[0-9a-z](,[0-9a-z]\.[0-9a-z])*$/;

  function install(init) {
    var data = Object.assign({ 'cmi.core.entry': 'ab-initio', 'cmi.core.lesson_status': 'not attempted', 'cmi.suspend_data': '',
      'cmi.core.lesson_location': '', 'cmi.core.student_id': 'MOCK-ID', 'cmi.core.student_name': 'Mock, Learner' }, init || {});
    var count = 0, initialized = false, finished = false, last = '0';
    var calls = [], errors = [], identity = [];
    function fail(msg) { errors.push(msg); last = '405'; return 'false'; }
    function checkInteraction(el, v) {
      var m = /^cmi\.interactions\.(\d+)\.(.+)$/.exec(el);
      if (!m) return 'element ' + el;
      var n = Number(m[1]), f = m[2];
      if (n > count) return 'interaction ' + n + ' out of order (count ' + count + ')';
      if (n === count) count++;
      var type = data['cmi.interactions.' + n + '.type'];
      if (f === 'id') return /^[^\s]{1,255}$/.test(v) ? '' : 'id ' + v;
      if (f === 'type') return TYPES.indexOf(v) >= 0 ? '' : 'type ' + v;
      if (f === 'result') return RESULTS.indexOf(v) >= 0 || /^-?\d+(\.\d+)?$/.test(v) ? '' : 'result ' + v;
      if (f === 'latency') return TIMESPAN.test(v) ? '' : 'latency ' + v;
      if (f === 'time') return TIME.test(v) ? '' : 'time ' + v;
      if (f === 'weighting') return /^-?\d+(\.\d+)?$/.test(v) ? '' : 'weighting ' + v;
      if (f === 'student_response' || f === 'correct_responses.0.pattern') {
        if (v.length > 255) return f + ' over 255';
        if (type === 'choice' && !CHOICE.test(v)) return f + ' not a 1.2 choice response: ' + v;
        if (type === 'matching' && !MATCHING.test(v)) return f + ' not a 1.2 matching response: ' + v;
        return '';
      }
      return 'interaction field ' + f;
    }
    function check(el, v) {
      if (el === 'cmi.core.lesson_status') return STATUS.indexOf(v) >= 0 ? '' : 'lesson_status ' + v;
      if (el === 'cmi.core.exit') return EXIT.indexOf(v) >= 0 ? '' : 'exit ' + v;
      if (el === 'cmi.core.session_time') return TIMESPAN.test(v) ? '' : 'session_time ' + v;
      if (/^cmi\.core\.score\.(raw|min|max)$/.test(el)) return /^\d+(\.\d+)?$/.test(v) && Number(v) >= 0 && Number(v) <= 100 ? '' : el + ' ' + v;
      if (el === 'cmi.suspend_data') return v.length <= 4096 ? '' : 'suspend_data ' + v.length + ' chars';
      if (el === 'cmi.core.lesson_location') return v.length <= 255 ? '' : 'lesson_location over 255';
      if (el.indexOf('cmi.interactions.') === 0) return checkInteraction(el, v);
      return 'element not settable here: ' + el;
    }
    var api = {
      LMSInitialize: function () { calls.push('LMSInitialize'); if (initialized) return fail('LMSInitialize twice'); initialized = true; last = '0'; return 'true'; },
      LMSFinish: function () { calls.push('LMSFinish'); if (!initialized || finished) return fail('LMSFinish without a session'); finished = true; last = '0'; return 'true'; },
      LMSCommit: function () { calls.push('LMSCommit'); if (!initialized || finished) return fail('LMSCommit outside the session'); last = '0'; return 'true'; },
      LMSGetValue: function (el) {
        calls.push('get ' + el);
        if (IDENTITY.test(el)) identity.push('get ' + el);
        if (!initialized || finished) { fail('get outside the session ' + el); return ''; }
        last = '0';
        if (el === 'cmi.interactions._count') return String(count);
        return data[el] == null ? '' : String(data[el]);
      },
      LMSSetValue: function (el, v) {
        v = String(v);
        calls.push('set ' + el + ' = ' + v.slice(0, 80));
        if (IDENTITY.test(el)) { identity.push('set ' + el); return fail('identity element ' + el); }
        if (!initialized || finished) return fail('set outside the session ' + el);
        var problem = check(el, v);
        if (problem) return fail(problem);
        data[el] = v;
        last = '0';
        return 'true';
      },
      LMSGetLastError: function () { return last; },
      LMSGetErrorString: function (c) { return 'mock error ' + c; },
      LMSGetDiagnostic: function (c) { return 'mock diagnostic ' + c; },
    };
    root.API = api;
    root.__scormMock = { report: function () { return { data: data, calls: calls, errors: errors, identity: identity, initialized: initialized, finished: finished, count: count }; } };
    return api;
  }
  root.installScormMock = install;
  if (root.SCORM_MOCK_INIT) install(root.SCORM_MOCK_INIT);
})(typeof window !== 'undefined' ? window : this);
