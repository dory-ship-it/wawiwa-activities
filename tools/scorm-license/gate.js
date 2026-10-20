/* Wawiwa licence gate for Rise SCORM (inserted by secure_rise_scorm.py).
   __wwGate(cfg, onText): fetches the licence, decrypts cfg.ct and passes the plain course text to onText.
   Works with both Rise export formats (old: deserialize() in index.html; new 2026: __jsonp in runtime-data.js). */
(function () {
  function block(msg) {
    var s = 'font-family:system-ui,Arial,sans-serif;max-width:560px;margin:15vh auto;padding:32px;text-align:center;color:#1f2937';
    document.documentElement.innerHTML = '<body style="background:#f7f7f8"><div style="' + s + '">' +
      '<h2 style="margin:0 0 12px">This course is not available</h2><p style="line-height:1.5">' + msg +
      '</p><p style="color:#6b7280;font-size:13px;margin-top:24px">Wawiwa Tech &middot; licence check</p></div></body>';
    return new Promise(function () {});
  }
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  window.__wwGate = async function (cfg, onText) {
    var d;
    try {
      var r = await fetch(cfg.db + '/licenses/' + encodeURIComponent(cfg.id) + '.json', { cache: 'no-store' });
      if (r.status === 401 || r.status === 403) return block('The licence for this course has expired or was turned off. Please contact your program administrator.');
      if (!r.ok) throw new Error('http ' + r.status);
      d = await r.json();
    } catch (e) {
      return block('We could not verify the course licence. Please check your internet connection and reload the page.');
    }
    if (!d || d.valid !== true || !d.k) return block('The licence for this course is not active. Please contact your program administrator.');
    if (d.expiresAt && d.expiresAt < Date.now() - 86400000) return block('The licence for this course has expired. Please contact your program administrator.');
    if (d.hosts) {
      var h = location.hostname.toLowerCase();
      var ok = String(d.hosts).split(',').some(function (x) { x = x.trim().toLowerCase(); return x && (h === x || h.slice(-x.length - 1) === '.' + x); });
      if (!ok) return block('This course is licensed for a different learning platform.');
    }
    var text;
    try {
      var key = await crypto.subtle.importKey('raw', b64(d.k), 'AES-GCM', false, ['decrypt']);
      var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(cfg.iv) }, key, b64(cfg.ct));
      text = new TextDecoder().decode(plain);
    } catch (e) {
      return block('This course package does not match its licence. Please contact Wawiwa.');
    }
    try {
      fetch(cfg.db + '/launches/' + encodeURIComponent(cfg.id) + '.json', {
        method: 'POST', body: JSON.stringify({ t: { '.sv': 'timestamp' }, h: location.hostname })
      }).catch(function () {});
    } catch (e) {}
    try { countLearner(cfg); } catch (e) {}
    return onText(text);
  };
  /* Unique-learner counter: stores only a one-way hash of the LMS learner id (no name, no id), once per learner. */
  function findApi() {
    var w = window, n = 0;
    while (w && n++ < 10) {
      try { if (w.API && typeof w.API.LMSGetValue === 'function') return w.API; } catch (e) {}
      try { if (w.opener && w.opener.API && typeof w.opener.API.LMSGetValue === 'function') return w.opener.API; } catch (e) {}
      if (w === w.parent) break; w = w.parent;
    }
    return null;
  }
  function countLearner(cfg) {
    var tries = 0;
    (function attempt() {
      tries++;
      var api = findApi(), sid = '';
      try { sid = api ? String(api.LMSGetValue('cmi.core.student_id') || '') : ''; } catch (e) { sid = ''; }
      if (!sid) { if (tries < 15) setTimeout(attempt, 2000); return; }
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(cfg.id + ':' + sid)).then(function (buf) {
        var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').slice(0, 32);
        return fetch(cfg.db + '/learners/' + encodeURIComponent(cfg.id) + '/' + hex + '.json', {
          method: 'PUT', body: JSON.stringify({ t: { '.sv': 'timestamp' } })
        });
      }).catch(function () {});
    })();
  }
})();
