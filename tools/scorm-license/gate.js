/* Wawiwa licence gate for Rise SCORM (inserted by secure_rise_scorm.py). */
(function () {
  function block(msg) {
    var s = 'font-family:system-ui,Arial,sans-serif;max-width:560px;margin:15vh auto;padding:32px;text-align:center;color:#1f2937';
    document.documentElement.innerHTML = '<body style="background:#f7f7f8"><div style="' + s + '">' +
      '<h2 style="margin:0 0 12px">This course is not available</h2><p style="line-height:1.5">' + msg +
      '</p><p style="color:#6b7280;font-size:13px;margin-top:24px">Wawiwa Tech &middot; licence check</p></div></body>';
    return new Promise(function () {});
  }
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  window.__wwGate = async function (cfg, deserialize) {
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
    return deserialize(text);
  };
})();
