/**
 * Wawiwa → Send to interactive
 * ----------------------------
 * Bound to the SME deck "Wawiwa AI for Marketing Training Session 1". Adds a menu that reads the
 * mapped slides, compares them with what the last sync saw (content/last-sync.json in the repo), and
 * opens a GitHub Pull Request that changes only content/s1.json (plus any new images under
 * assets/deck/). Dor merges; GitHub Pages deploys; the Rise embed shows the new version.
 *
 * Rule: the NEWER version wins. Only slides the SME changed since the last sync are pulled.
 * A slide he did not touch never overwrites the interactive. Changes that hit a screen kept for
 * self-study (12, 33) are still pulled, but flagged "check: replaces self-study wording".
 * New deck slides with no mapped screen are listed as "new slide, not in interactive", never added.
 *
 * Secret: a fine-grained GitHub token (this repo only, Contents + Pull requests: read/write),
 * stored in Script Properties as GITHUB_TOKEN. Dor creates and pastes it; nobody else handles it.
 */

var CONFIG = {
  repo: 'dory-ship-it/wawiwa-activities',
  base: 'main',
  dir: 'genai-for-marketing/s1-ai-awareness',
  contentFile: 'content/s1.json',
  snapshotFile: 'content/last-sync.json',
  mappingFile: 'sync/deck-mapping.json',
  imagesDir: 'assets/deck',
  apiVersion: '2022-11-28',
};

function onOpen() {
  SlidesApp.getUi().createMenu('Wawiwa')
    .addItem('Send to interactive', 'sendToInteractive')
    .addItem('Check connection', 'checkConnection')
    .addToUi();
}

/* ============================== menu actions ============================== */

function checkConnection() {
  var ui = SlidesApp.getUi();
  try {
    var mapping = readRepoJson(CONFIG.mappingFile, CONFIG.base).json;
    var deck = readDeck();
    var matched = 0;
    var byTitle = titleIndex(mapping);
    deck.forEach(function (s) { if (byTitle[norm(s.title)]) matched++; });
    ui.alert('Connection OK',
      'Repository: ' + CONFIG.repo + '\nDeck slides: ' + deck.length + '\nSlides whose title matches a screen: ' + matched +
      '\nMapped screens: ' + mapping.screens.length, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Connection problem', String(e.message || e), ui.ButtonSet.OK);
  }
}

function sendToInteractive() {
  var ui = SlidesApp.getUi();
  try {
    var result = runSync();
    if (result.pr) {
      showLink('Pull Request opened', 'Review the change list, then press Merge. The interactive updates about a minute later.', result.pr.html_url);
    } else {
      ui.alert('Nothing to send', 'No slide has changed since the last sync.', ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('Sync failed', String(e.message || e), ui.ButtonSet.OK);
    throw e;
  }
}

/* ================================ the sync ================================ */

function runSync() {
  var mappingRead = readRepoJson(CONFIG.mappingFile, CONFIG.base);
  var contentRead = readRepoJson(CONFIG.contentFile, CONFIG.base);
  var snapshotRead = readRepoJson(CONFIG.snapshotFile, CONFIG.base);
  var mapping = mappingRead.json, content = contentRead.json, snapshot = snapshotRead.json;
  var first = !snapshot.slides || Object.keys(snapshot.slides).length === 0;
  snapshot.slides = snapshot.slides || {};
  var deck = readDeck();
  var byTitle = titleIndex(mapping);
  var selfStudy = {};
  var ignored = {};
  mapping.screens.forEach(function (m) { if (m.selfStudy) selfStudy[m.n] = true; });
  (mapping.ignoreTitles || []).forEach(function (t) { ignored[norm(t)] = true; });

  var changes = [];      // { kind, n, title, key, oldText, newText, path, flag }
  var uploads = [];      // { path, bytes }
  var seenSlides = {};
  var assigned = {};     // screen n → true (for duplicate titles consumed in deck order)
  content.screens.forEach(function (sc) { idsOf(sc.deckSlideId).forEach(function () { assigned[sc.n] = true; }); });

  deck.forEach(function (slide) {
    seenSlides[slide.id] = true;
    var n = screenForSlide(content, slide, byTitle, assigned);
    if (!n) {
      if (!ignored[norm(slide.title)] && !snapshot.slides[slide.id]) changes.push({ kind: 'new-slide', index: slide.index, title: slide.title });
      return;
    }
    var screen = content.screens[n - 1];
    var snap = snapshot.slides[slide.id] || { n: n, title: slide.title, shapes: {}, images: {} };
    snap.n = n; snap.title = slide.title;
    var flag = selfStudy[n] ? 'check: replaces self-study wording' : null;

    // ---- text shapes ----
    slide.texts.forEach(function (t) {
      var prev = snap.shapes[t.id];
      if (!prev) {
        var key = matchTextKey(screen, t.text);
        snap.shapes[t.id] = { text: t.text, key: key };
        if (!first) {
          // a shape that appeared after the last sync
          if (key && norm(plainOfContent(screen.text[key])) !== norm(t.text)) {
            changes.push({ kind: 'text', n: n, title: screen.title, key: key, oldText: plainOfContent(screen.text[key]), newText: t.text, flag: flag });
            screen.text[key] = t.paragraphs;
          } else if (!key) changes.push({ kind: 'unmapped-text', n: n, title: screen.title, oldText: '', newText: t.text });
        }
        return;
      }
      if (norm(prev.text) !== norm(t.text)) {
        if (prev.key && screen.text[prev.key]) {
          changes.push({ kind: 'text', n: n, title: screen.title, key: prev.key, oldText: plainOfContent(screen.text[prev.key]), newText: t.text, flag: flag });
          screen.text[prev.key] = t.paragraphs;
        } else {
          changes.push({ kind: 'unmapped-text', n: n, title: screen.title, oldText: prev.text, newText: t.text });
        }
        prev.text = t.text;
      }
    });

    // ---- images ----
    var usedKeys = {};
    Object.keys(snap.images).forEach(function (id) { if (snap.images[id].key) usedKeys[snap.images[id].key] = true; });
    slide.images.forEach(function (im) {
      var prev = snap.images[im.id];
      if (!prev) {
        var key = nextImageKey(screen, usedKeys);
        if (key) usedKeys[key] = true;
        snap.images[im.id] = { md5: im.md5, key: key, path: null };
        if (!first) {
          var path = imagePath(n, im);
          uploads.push({ path: path, bytes: im.bytes });
          snap.images[im.id].path = path;
          if (key && screen.images[key]) { changes.push({ kind: 'image', n: n, title: screen.title, key: key, oldText: screen.images[key].src, path: path, flag: flag }); screen.images[key].src = path; }
          else changes.push({ kind: 'unmapped-image', n: n, title: screen.title, path: path });
        }
        return;
      }
      if (prev.md5 !== im.md5) {
        var path2 = imagePath(n, im);
        uploads.push({ path: path2, bytes: im.bytes });
        if (prev.key && screen.images[prev.key]) { changes.push({ kind: 'image', n: n, title: screen.title, key: prev.key, oldText: screen.images[prev.key].src, path: path2, flag: flag }); screen.images[prev.key].src = path2; }
        else changes.push({ kind: 'unmapped-image', n: n, title: screen.title, path: path2 });
        prev.md5 = im.md5; prev.path = path2;
      }
    });
    snapshot.slides[slide.id] = snap;
  });

  Object.keys(snapshot.slides).forEach(function (id) {
    if (!seenSlides[id]) { changes.push({ kind: 'removed-slide', n: snapshot.slides[id].n, title: snapshot.slides[id].title }); delete snapshot.slides[id]; }
  });

  if (!first && changes.length === 0) return { pr: null };

  snapshot.deckId = mapping.deckId;
  snapshot.syncedAt = new Date().toISOString();

  // ---- branch, files, pull request ----
  var stamp = Utilities.formatDate(new Date(), CONFIG.timeZone || 'Asia/Jerusalem', 'yyyyMMdd-HHmm');
  var branch = 'sync/s1-' + stamp;
  var baseSha = gh('GET', '/repos/' + CONFIG.repo + '/git/ref/heads/' + CONFIG.base).object.sha;
  gh('POST', '/repos/' + CONFIG.repo + '/git/refs', { ref: 'refs/heads/' + branch, sha: baseSha });
  var msg = first ? 'S1 sync: baseline from the SME deck' : 'S1 sync: ' + changes.length + ' change(s) from the SME deck';
  putRepoFile(CONFIG.contentFile, JSON.stringify(content, null, 2) + '\n', msg, branch, contentRead.sha);
  putRepoFile(CONFIG.snapshotFile, JSON.stringify(snapshot, null, 2) + '\n', msg, branch, snapshotRead.sha);
  uploads.forEach(function (u) { putRepoFile(u.path, u.bytes, msg + ' (image)', branch, null); });
  var pr = gh('POST', '/repos/' + CONFIG.repo + '/pulls', {
    title: first ? 'S1 AI Awareness: sync baseline (first run)' : 'S1 AI Awareness: ' + changes.length + ' change(s) from the SME deck',
    head: branch, base: CONFIG.base, body: prBody(changes, first, deck, content),
  });
  return { pr: pr, changes: changes };
}

/* ============================ deck reading ============================ */

function readDeck() {
  var pres = SlidesApp.getActivePresentation();
  return pres.getSlides().map(function (s, idx) {
    var shapes = s.getShapes().filter(function (sh) { try { return sh.getText && sh.getText().asString().trim().length > 0; } catch (e) { return false; } });
    var titleShape = null;
    shapes.forEach(function (sh) {
      if (titleShape) return;
      try {
        var pt = sh.getPlaceholderType();
        if (pt === SlidesApp.PlaceholderType.TITLE || pt === SlidesApp.PlaceholderType.CENTERED_TITLE) titleShape = sh;
      } catch (e) { /* not a placeholder */ }
    });
    if (!titleShape && shapes.length) titleShape = shapes[0];
    var texts = shapes.map(function (sh) { return { id: sh.getObjectId(), text: sh.getText().asString().replace(/\n+$/, ''), paragraphs: paragraphsOf(sh) }; });
    var images = s.getImages().map(function (im) {
      var blob = im.getBlob(); var bytes = blob.getBytes();
      var type = (blob.getContentType() || 'image/png').split('/')[1].replace('jpeg', 'jpg');
      return { id: im.getObjectId(), md5: md5(bytes), bytes: bytes, ext: type };
    });
    return { id: s.getObjectId(), index: idx + 1, title: titleShape ? titleShape.getText().asString().replace(/\n+$/, '').replace(/\s+/g, ' ').trim() : '', texts: texts, images: images };
  });
}

// Slides text → content paragraphs: [{ runs: [{ t, b?, color? }] }]
function paragraphsOf(shape) {
  var out = [];
  shape.getText().getParagraphs().forEach(function (p) {
    var runs = [];
    p.getRange().getRuns().forEach(function (r) {
      var t = r.asString().replace(/\n$/, '');
      if (!t) return;
      var run = { t: t };
      var st = r.getTextStyle();
      try { if (st.isBold()) run.b = true; } catch (e) { /* mixed */ }
      try {
        var c = st.getForegroundColor();
        if (c && c.getColorType() === SlidesApp.ColorType.RGB) {
          var hex = c.asRgbColor().asHexString().toUpperCase();
          if (hex !== '#000000' && hex !== '#3F3F3F') run.color = hex;
        }
      } catch (e) { /* no colour */ }
      runs.push(run);
    });
    out.push({ runs: runs.length ? runs : [{ t: '' }] });
  });
  return out;
}

/* ============================ mapping helpers ============================ */

function norm(s) {
  return String(s || '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/\u000B/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}
function idsOf(v) { return !v ? [] : (Array.isArray(v) ? v : [v]); }

function titleIndex(mapping) {
  var idx = {};
  mapping.screens.forEach(function (m) { (m.deckTitles || []).forEach(function (t) { var k = norm(t); idx[k] = idx[k] || []; idx[k].push(m.n); }); });
  return idx;
}

// Which screen does this deck slide feed? Stored ids first; otherwise match the title and store the id.
function screenForSlide(content, slide, byTitle, assigned) {
  for (var i = 0; i < content.screens.length; i++) {
    if (idsOf(content.screens[i].deckSlideId).indexOf(slide.id) >= 0) return content.screens[i].n;
  }
  var candidates = byTitle[norm(slide.title)] || [];
  for (var j = 0; j < candidates.length; j++) {
    var n = candidates[j];
    var sc = content.screens[n - 1];
    var multi = candidates.length === 1 && Object.keys(byTitle).filter(function (k) { return byTitle[k].indexOf(n) >= 0; }).length > 1; // one screen fed by several slides (7, 8)
    if (!assigned[n] || multi) {
      var ids = idsOf(sc.deckSlideId);
      if (ids.indexOf(slide.id) < 0) ids.push(slide.id);
      sc.deckSlideId = ids.length === 1 ? ids[0] : ids;
      assigned[n] = true;
      return n;
    }
  }
  return null;
}

function plainOfContent(paras) {
  if (!Array.isArray(paras)) return '';
  return paras.map(function (p) { return (p.runs || []).map(function (r) { return r.t || ''; }).join(''); }).join('\n');
}

// Find the content text key on this screen whose words match the shape's text best.
function matchTextKey(screen, text) {
  var want = norm(text);
  if (!want) return null;
  var best = null, bestScore = 0;
  Object.keys(screen.text || {}).forEach(function (key) {
    if (key.indexOf('@') >= 0 || !Array.isArray(screen.text[key])) return;
    var have = norm(plainOfContent(screen.text[key]));
    if (!have) return;
    if (have === want) { best = key; bestScore = 1; return; }
    var score = dice(words(have), words(want));
    if (score > bestScore) { bestScore = score; best = key; }
  });
  return bestScore >= 0.6 ? best : null;
}
function words(s) { var m = {}; s.split(/[^a-z0-9%]+/).forEach(function (w) { if (w) m[w] = (m[w] || 0) + 1; }); return m; }
function dice(a, b) {
  var inter = 0, na = 0, nb = 0;
  Object.keys(a).forEach(function (k) { na += a[k]; if (b[k]) inter += Math.min(a[k], b[k]); });
  Object.keys(b).forEach(function (k) { nb += b[k]; });
  return (na + nb) ? (2 * inter) / (na + nb) : 0;
}
function nextImageKey(screen, used) {
  var keys = Object.keys(screen.images || {});
  for (var i = 0; i < keys.length; i++) if (!used[keys[i]]) return keys[i];
  return null;
}
function imagePath(n, im) { return CONFIG.imagesDir + '/' + n + '-' + im.id.replace(/[^A-Za-z0-9_-]/g, '') + '-' + im.md5.slice(0, 8) + '.' + (im.ext || 'png'); }
function md5(bytes) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes).map(function (b) { var v = (b + 256) % 256; return (v < 16 ? '0' : '') + v.toString(16); }).join('');
}

/* ============================ pull request body ============================ */

function prBody(changes, first, deck, content) {
  var lines = [];
  var when = Utilities.formatDate(new Date(), CONFIG.timeZone || 'Asia/Jerusalem', 'd MMM yyyy HH:mm');
  lines.push('## S1 AI Awareness: ' + (first ? 'sync baseline' : 'changes from the SME deck') + ' (' + when + ')');
  lines.push('');
  if (first) {
    lines.push('First run. This records which deck slide feeds which screen and what the deck says today. **No screen text changes.** From now on, only slides the SME changes are pulled.');
    lines.push('');
    var mapped = content.screens.filter(function (s) { return s.deckSlideId; }).length;
    lines.push('- Screens linked to a deck slide: ' + mapped + ' of ' + content.screens.length);
    content.screens.forEach(function (s) { if (!s.deckSlideId) lines.push('- Screen ' + s.n + ' "' + s.title + '": no deck slide matched its title. Fix sync/deck-mapping.json if it should.'); });
  }
  var byScreen = {};
  changes.forEach(function (c) { if (c.n) { byScreen[c.n] = byScreen[c.n] || []; byScreen[c.n].push(c); } });
  Object.keys(byScreen).map(Number).sort(function (a, b) { return a - b; }).forEach(function (n) {
    var list = byScreen[n];
    var flag = list.filter(function (c) { return c.flag; }).length ? '  ⚠ ' + list.filter(function (c) { return c.flag; })[0].flag : '';
    lines.push('### Screen ' + n + ' · ' + (list[0].title || '') + flag);
    list.forEach(function (c) {
      if (c.kind === 'text') lines.push('- Text: "' + short(c.oldText) + '" → "' + short(c.newText) + '"');
      else if (c.kind === 'unmapped-text') lines.push('- Changed text that has no place in the interactive (not applied): "' + short(c.oldText) + '" → "' + short(c.newText) + '"');
      else if (c.kind === 'image') lines.push('- Image replaced: `' + c.path + '` (was `' + c.oldText + '`)');
      else if (c.kind === 'unmapped-image') lines.push('- New image uploaded but not placed: `' + c.path + '`');
      else if (c.kind === 'removed-slide') lines.push('- The deck slide feeding this screen was deleted. The screen is unchanged.');
    });
    lines.push('');
  });
  var newSlides = changes.filter(function (c) { return c.kind === 'new-slide'; });
  if (newSlides.length) {
    lines.push('### New slides in the deck, not in the interactive (never added automatically)');
    newSlides.forEach(function (c) { lines.push('- Slide ' + c.index + ' "' + c.title + '"'); });
    lines.push('');
  }
  lines.push('---');
  lines.push('Merge to publish. The build check must be green. Rise shows the new version about a minute after the merge; Rise itself is never touched.');
  return lines.join('\n');
}
function short(s) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > 160 ? s.slice(0, 157) + '…' : s; }

/* ============================ GitHub API ============================ */

function getToken() {
  var t = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!t) throw new Error('GITHUB_TOKEN is not set. In the Apps Script editor: Project Settings → Script Properties → add GITHUB_TOKEN.');
  return t;
}
function gh(method, path, body) {
  var res = UrlFetchApp.fetch('https://api.github.com' + path, {
    method: method,
    headers: { Authorization: 'Bearer ' + getToken(), Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': CONFIG.apiVersion },
    contentType: 'application/json',
    payload: body ? JSON.stringify(body) : undefined,
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  if (code >= 300) throw new Error('GitHub ' + method + ' ' + path + ' → ' + code + ': ' + res.getContentText().slice(0, 300));
  var text = res.getContentText();
  return text ? JSON.parse(text) : null;
}
function readRepoJson(relPath, ref) {
  var r = gh('GET', '/repos/' + CONFIG.repo + '/contents/' + CONFIG.dir + '/' + relPath + '?ref=' + encodeURIComponent(ref));
  var text = Utilities.newBlob(Utilities.base64Decode(r.content.replace(/\n/g, ''))).getDataAsString('UTF-8');
  return { json: JSON.parse(text), sha: r.sha };
}
function putRepoFile(relPath, data, message, branch, sha) {
  var bytes = typeof data === 'string' ? Utilities.newBlob(data).getBytes() : data;
  var body = { message: message, content: Utilities.base64Encode(bytes), branch: branch };
  if (sha) body.sha = sha;
  return gh('PUT', '/repos/' + CONFIG.repo + '/contents/' + CONFIG.dir + '/' + relPath, body);
}

/* ================================ UI ================================ */

function showLink(title, text, url) {
  var html = HtmlService.createHtmlOutput(
    '<div style="font:14px/1.5 Arial, sans-serif; padding:6px 2px">' + text + '<br><br><a href="' + url + '" target="_blank" rel="noopener" style="font-weight:bold">' + url + '</a></div>'
  ).setWidth(520).setHeight(130);
  SlidesApp.getUi().showModalDialog(html, title);
}
