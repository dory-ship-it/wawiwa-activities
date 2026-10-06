// Text-fit test (work-order P4.1, fix 2). Opens every screen, every layer, every timeline stop and
// every object state, at 980x620 (desktop) and 375 wide (phone), and fails when any text element is
//   (a) clipped: scrollWidth > clientWidth or scrollHeight > clientHeight, or it extends past the stage
//       (or into the footer strip), or
//   (b) covered: an image, video or iframe box that paints on top of it overlaps its text.
// Text drawn on top of a picture by design (a title over a photo, the table cells over the table art)
// is not a failure; pass --strict to list those too. Two further rules match the engine's fit pass:
// media in a layer is an overlay and does not count against the base slide's text, and media the
// timeline hides later (marked data-transient by the engine) is skipped while it shows.
//
//   node tools/test-fit.mjs                      all screens, both sizes; exit 1 on any failure
//   node tools/test-fit.mjs --screens 17,31      a few screens
//   node tools/test-fit.mjs --shots 17,31 --out review/p4.1 --tag before    screenshots only
//   node tools/test-fit.mjs --json out.json      also write the full result
//   node tools/test-fit.mjs --narration          also check the speaker control (fix 3) on every screen
//   node tools/test-fit.mjs --nav                also check fix 1: no slide arrows, Prev/Next from every screen
//   node tools/test-fit.mjs --changes            also list what the fit pass changed on each screen
// Chrome: set CHROME_PATH, or a stock Google Chrome / Chromium install is found on its own.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : def; };
const list = (v) => (typeof v === 'string' ? v.split(',').map(Number).filter(Boolean) : null);
const SCREENS = list(opt('screens')) || Array.from({ length: 33 }, (_, i) => i + 1);
const SHOTS = list(opt('shots'));
const OUT = opt('out', 'review');
const TAG = opt('tag', 'shot');
const STRICT = !!opt('strict', false);
const VERBOSE = !!opt('verbose', false);
const JSON_OUT = opt('json', null);
const NARRATION = !!opt('narration', false);
const CHANGES = !!opt('changes', false);   // also print what the fit pass changed (font sizes, grown boxes, moved pictures)
const NAV = !!opt('nav', false);           // fix 1: no turquoise slide arrows anywhere; Prev/Next work from every screen
const VIEWPORTS = [{ name: 'desktop', width: 980, height: 620 }, { name: 'phone', width: 375, height: 667 }];

/* ---------- a tiny static server for the folder (no python needed, works in CI) ---------- */
const MIME = { html: 'text/html; charset=utf-8', js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', mp4: 'video/mp4', mp3: 'audio/mpeg', woff: 'font/woff', woff2: 'font/woff2', vtt: 'text/vtt', ico: 'image/x-icon' };
function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[extname(file).slice(1)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

/* ---------- Chrome ---------- */
function chromePath() {
  const env = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  const cands = [env, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium', '/opt/google/chrome/chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'].filter(Boolean);
  const found = cands.find(p => existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to the browser executable.');
  return found;
}

/* ---------- in-page audit (runs inside the browser; keep it self-contained) ---------- */
const AUDIT = `(function (STRICT) {
  const STAGE_W = 960, STAGE_H = 540, TOL = 1.5;
  const screen = document.querySelector('.stage .screen');
  if (!screen) return { error: 'no screen' };
  const fails = [];
  const vis = (el) => el.isConnected && el.getClientRects().length > 0;
  const pos = (el) => { let x = 0, y = 0, e = el; while (e && e !== screen) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; };
  const rectOf = (el) => { const p = pos(el); return { x: p.x, y: p.y, w: el.offsetWidth, h: el.offsetHeight }; };
  const inter = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > TOL && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > TOL;
  const fmt = (r) => '[' + [r.x, r.y, r.w, r.h].map(v => Math.round(v)).join(',') + ']';
  const rotated = (el) => { for (let e = el; e && e !== screen; e = e.parentElement) { const t = getComputedStyle(e).transform; if (t && t !== 'none') { const m = /matrix\\(([^)]+)\\)/.exec(t); if (m) { const [a, b] = m[1].split(',').map(Number); if (Math.abs(b) > 0.001 || Math.abs(a - 1) > 0.2) return true; } } } return false; };
  const scopeOf = (el) => el.closest('.layer') || screen;
  const media = [];
  for (const el of screen.querySelectorAll('.obj')) {
    if (!vis(el) || el.dataset.transient || el.closest('.footer, .small-logo')) continue;
    const direct = Array.from(el.children).find(c => /^(IMG|VIDEO|IFRAME)$/.test(c.tagName));
    const kind = direct ? direct.tagName.toLowerCase() : (el.querySelector(':scope > svg image') ? 'svg-image' : null);
    if (!kind) continue;
    media.push({ el, kind, id: el.dataset.id || el.className, rect: rectOf(el), scope: scopeOf(el) });
  }
  const footer = screen.querySelector('.footer');
  const footerRect = footer && vis(footer) ? rectOf(footer) : null;
  const boxes = Array.from(screen.querySelectorAll('.txtbox, .txt')).filter(el => vis(el) && !el.closest('.footer'));
  let checked = 0;
  for (const box of boxes) {
    const text = box.textContent.replace(/\\u200b/g, '').trim();
    if (!text) continue;
    const br = box.getBoundingClientRect();
    if (!br.width) continue;
    checked++;
    const bp = pos(box);
    let R;
    if (rotated(box)) R = { x: bp.x, y: bp.y, w: box.offsetWidth, h: box.offsetHeight };
    else {
      const k = box.offsetWidth / br.width;
      const paras = box.classList.contains('txtbox') ? Array.from(box.querySelectorAll(':scope > p')) : [box];
      let u = null;
      for (const p of paras) {
        const range = document.createRange(); range.selectNodeContents(p);
        for (const r of range.getClientRects()) {
          if (r.width < 0.5 || r.height < 0.5) continue;
          const l = { x: bp.x + (r.left - br.left) * k, y: bp.y + (r.top - br.top) * k, r: bp.x + (r.right - br.left) * k, b: bp.y + (r.bottom - br.top) * k };
          u = u ? { x: Math.min(u.x, l.x), y: Math.min(u.y, l.y), r: Math.max(u.r, l.r), b: Math.max(u.b, l.b) } : l;
        }
      }
      if (!u) continue;
      R = { x: u.x, y: u.y, w: u.r - u.x, h: u.b - u.y };
    }
    const id = (box.closest('.obj[data-id]') || {}).dataset ? box.closest('.obj[data-id]').dataset.id : box.className;
    const fail = (kind, detail) => fails.push({ id, kind, text: text.slice(0, 40), detail });
    if (box.scrollWidth > box.clientWidth + 1) fail('clipped-width', 'scrollWidth ' + box.scrollWidth + ' > clientWidth ' + box.clientWidth);
    if (box.scrollHeight > box.clientHeight + 1) fail('clipped-height', 'scrollHeight ' + box.scrollHeight + ' > clientHeight ' + box.clientHeight);
    if (R.x < -0.5 || R.y < -0.5 || R.x + R.w > STAGE_W + 0.5 || R.y + R.h > STAGE_H + 0.5) fail('past-stage', 'text ' + fmt(R));
    if (footerRect && inter(R, footerRect)) fail('over-footer', 'text ' + fmt(R) + ' reaches the footer at y=' + Math.round(footerRect.y));
    for (const m of media) {
      if (m.el.contains(box) || box.contains(m.el) || m.scope !== scopeOf(box)) continue;
      if (!inter(R, m.rect)) continue;
      const onTop = !!(box.compareDocumentPosition(m.el) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (onTop) fail('covered-by-' + m.kind, m.id + ' ' + fmt(m.rect) + ' paints over text ' + fmt(R));
      else if (STRICT) fail('text-over-' + m.kind, 'text ' + fmt(R) + ' is drawn over ' + m.id + ' ' + fmt(m.rect));
    }
  }
  return { fails, checked, media: media.length };
})`;

// What the engine's fit pass changed on the current screen (from its own change registry).
const FIT_CHANGES = `(function () {
  const screen = document.querySelector('.stage .screen'); const reg = screen && screen.__fit; if (!reg) return [];
  const out = [];
  const idOf = (el) => { const o = el.closest('.obj[data-id]'); return o ? o.dataset.id : el.className; };
  const val = (css, prop) => { const m = new RegExp('(?:^|;)\\\\s*' + prop + ':\\\\s*([^;]+)').exec(css); return m ? m[1].trim() : ''; };
  for (const [box, o] of reg.boxes) {
    if (!box.isConnected) continue;
    const p = o.parts[0]; const now = parseFloat(p.el.style.fontSize) || p.size;
    const bits = [];
    if (Math.abs(now - p.size) > 0.01) bits.push('font ' + p.size + '→' + Math.round(now * 10) / 10 + 'px');
    if (box.style.width !== val(o.css, 'width')) bits.push('width ' + val(o.css, 'width') + '→' + box.style.width);
    if (box.style.height !== val(o.css, 'height')) bits.push('height ' + val(o.css, 'height') + '→' + box.style.height);
    if (bits.length) out.push({ id: idOf(box), what: bits.join(', '), text: box.textContent.replace(/\\u200b/g, '').trim().slice(0, 28) });
  }
  for (const [el, o] of reg.media) if (el.isConnected && el.style.cssText !== o.css) out.push({ id: idOf(el), what: 'picture moved: top ' + val(o.css, 'top') + '→' + el.style.top + (el.style.width !== val(o.css, 'width') ? ', size ' + val(o.css, 'width') + '×' + val(o.css, 'height') + '→' + el.style.width + '×' + el.style.height : ''), text: '' });
  return out;
})`;

// Walks every layer, timeline stop and state of the current screen, auditing each. Uses the engine's
// test hook (window.__s1Player) when present; without it only the base state is audited.
const ENUMERATE = `(async function (STRICT) {
  const audit = ${AUDIT};
  const fitChanges = ${FIT_CHANGES};
  const P = window.__s1Player; const inst = P && P.current && P.current.inst;
  const results = [];
  const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const settle = async () => { document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); await frame(); if (P && P.fitNow) P.fitNow(); await frame(); };
  const check = async (state) => { await settle(); results.push(Object.assign({ state }, audit(STRICT), { changes: fitChanges() })); };
  await check('base');
  if (!inst) {
    const start = document.querySelector('.start-btn');
    if (start) { start.click(); await new Promise(r => setTimeout(r, 150)); await check('after-start'); }
    return results;
  }
  const clearTimers = (L) => { for (const t of (L ? L.timers : inst.timers) || []) clearTimeout(t && t.id !== undefined ? t.id : t); if (L) L.timers = []; else inst.timers = []; };
  clearTimers(null);
  for (const e of inst.lay.timeline || []) { inst.run(e.actions, null); await check('timeline@' + e.t); }
  for (const [id, n] of inst.nodes) if (n.obj.hidden) { inst.show(id); await check('show:' + id); inst.hide(id); }
  for (const [lid, L] of inst.layers) {
    inst.showLayer(lid); clearTimers(L); await check('layer:' + lid);
    for (const e of L.def.timeline || []) { inst.run(e.actions, null); await check('layer:' + lid + '@' + e.t); }
    inst.hideLayer(lid);
  }
  for (const [id, n] of inst.nodes) {
    const names = new Set([].concat(Object.keys(n.obj.textStates || {}), Object.keys(n.obj.states || {}).filter(s => !/hover|down|visited|default/i.test(s))));
    for (const s of names) { inst.setState(id, s); await check('state:' + id + '=' + s); inst.setState(id, '_default'); }
  }
  return results;
})`;

// Fix 3: the speaker control. Returns what the screen has and does.
const NARRATION_CHECK = `(async function () {
  const P = window.__s1Player; const inst = P && P.current && P.current.inst;
  const btn = document.querySelector('.narration-btn');
  const shown = !!btn && btn.getClientRects().length > 0 && getComputedStyle(btn).display !== 'none';
  const out = { shown, expected: !!(inst && inst.lay && inst.lay.narration && inst.lay.narration.length), ids: inst && inst.lay ? (inst.lay.narration || []) : [] };
  if (!shown || !inst) return out;
  const media = out.ids.map(id => inst.media.get(id)).filter(Boolean);
  const first = media[0];
  if (!first) { out.error = 'narration ids have no media'; return out; }
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  // start it the way the learner would: the screen's own trigger, or the button
  if (!media.some(m => !m.paused)) { btn.click(); await wait(400); }
  out.playingAfterPlay = media.some(m => !m.paused && !m.ended);
  out.stateAfterPlay = btn.dataset.state; out.labelAfterPlay = btn.getAttribute('aria-label');
  await wait(300);
  const t1 = first.currentTime;
  btn.click(); await wait(200);
  out.pausedAfterClick = media.every(m => m.paused);
  out.stateAfterPause = btn.dataset.state; out.labelAfterPause = btn.getAttribute('aria-label');
  const t2 = first.currentTime;
  await wait(300);
  out.stayedPaused = Math.abs(first.currentTime - t2) < 0.05;
  btn.click(); await wait(400);
  out.resumedFromSamePoint = !first.paused && first.currentTime >= t2 - 0.05 && first.currentTime < t2 + 1.5;
  out.stateAfterResume = btn.dataset.state;
  return out;
})`;
// the keyboard part needs real key presses (a synthetic keydown does not activate a button)
const FIRST_NARRATION = `(function () { const inst = window.__s1Player.current.inst; const m = inst.media.get(inst.lay.narration[0]); return { paused: m.paused, ended: m.ended }; })()`;
async function keyboardCheck(page, nr) {
  await page.focus('.narration-btn');
  await page.keyboard.press('Space'); await new Promise(r => setTimeout(r, 200));
  nr.spacePauses = (await page.evaluate(FIRST_NARRATION)).paused;
  await page.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 300));
  const after = await page.evaluate(FIRST_NARRATION);
  nr.enterResumes = !after.paused || after.ended;
}

/* ---------- driver ---------- */
async function ready(page) {
  await page.waitForFunction(() => document.querySelector('.stage .screen') && document.fonts.status === 'loaded', { timeout: 20000 });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
}

async function main() {
  const { server, base } = await serve();
  const cache = join(root, 'node_modules', '.cache');
  mkdirSync(join(cache, 'chrome-profile'), { recursive: true }); mkdirSync(join(cache, 'tmp'), { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: chromePath(), headless: true, userDataDir: join(cache, 'chrome-profile'),
    env: { ...process.env, TMPDIR: join(cache, 'tmp') },
    args: ['--no-sandbox', '--disable-gpu', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--disable-dev-shm-usage', '--hide-scrollbars', '--no-first-run', '--disable-extensions',
      `--disk-cache-dir=${join(cache, 'chrome-cache')}`, `--crash-dumps-dir=${join(cache, 'tmp')}`, '--disable-breakpad', '--disable-crash-reporter'],
  });
  const page = await browser.newPage();
  // keep the test local and quick: no YouTube, no video/audio bytes unless the narration check needs them
  await page.setRequestInterception(true);
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(base) || (!NARRATION && /\.(mp4|mp3)(\?|$)/.test(u))) r.abort(); else r.continue(); });
  page.on('pageerror', (e) => console.error('  page error:', e.message));

  const all = []; let failures = 0, states = 0;
  try {
    if (SHOTS) {
      mkdirSync(OUT, { recursive: true });
      for (const vp of VIEWPORTS) for (const n of SHOTS) {
        await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
        await page.goto(`${base}/index.html?screen=${n}`, { waitUntil: 'load' });
        await ready(page);
        await page.evaluate(() => { const P = window.__s1Player; const inst = P && P.current && P.current.inst; if (inst) { for (const t of inst.timers) clearTimeout(t && t.id !== undefined ? t.id : t); inst.timers = []; for (const e of inst.lay.timeline || []) inst.run(e.actions, null); } document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); if (P && P.fitNow) P.fitNow(); });
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const file = join(OUT, `${TAG}-screen-${n}-${vp.name}.png`);
        await page.screenshot({ path: file });
        console.log('wrote', file);
      }
      return;
    }
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
      for (const n of SCREENS) {
        await page.goto(`${base}/index.html?screen=${n}`, { waitUntil: 'load' });
        await ready(page);
        const results = await page.evaluate(`${ENUMERATE}(${STRICT})`);
        const bad = results.flatMap(r => r.fails.map(f => ({ ...f, state: r.state })));
        states += results.length; failures += bad.length;
        all.push({ screen: n, viewport: vp.name, states: results.length, checked: results.reduce((a, r) => a + r.checked, 0), fails: bad });
        const line = `screen ${String(n).padStart(2)} ${vp.name.padEnd(7)} states ${String(results.length).padStart(3)}  text boxes checked ${String(results.reduce((a, r) => a + r.checked, 0)).padStart(4)}  failures ${bad.length}`;
        console.log(line);
        if (VERBOSE) for (const r of results) console.log(`    ${r.state}: ${r.checked} boxes, ${r.media} media`);
        for (const f of bad) console.log(`    ✗ [${f.state}] ${f.id} ${f.kind}: "${f.text}" — ${f.detail}`);
        if (CHANGES) { const seen = new Set(); for (const r of results) for (const c of r.changes || []) { const k = c.id + '|' + c.what; if (seen.has(k)) continue; seen.add(k); console.log(`    · [${r.state}] ${c.id} ${c.what}${c.text ? ' "' + c.text + '"' : ''}`); } }
        if (NARRATION) {
          const nr = await page.evaluate(`${NARRATION_CHECK}()`);
          if (nr.shown && !nr.error) await keyboardCheck(page, nr);
          const ok = nr.shown === nr.expected && (!nr.shown || (nr.playingAfterPlay && nr.pausedAfterClick && nr.stayedPaused && nr.resumedFromSamePoint && nr.spacePauses && nr.enterResumes && nr.stateAfterPlay === 'playing' && nr.stateAfterPause === 'paused' && nr.labelAfterPlay === 'Pause narration' && nr.labelAfterPause === 'Play narration'));
          if (!ok) failures++;
          all[all.length - 1].narration = nr;
          console.log(`    narration: ${nr.shown ? 'speaker shown' : 'no speaker'}${nr.expected ? ' (narrated: ' + nr.ids.join(',') + ')' : ' (not narrated)'} ${ok ? '✓' : '✗ ' + JSON.stringify(nr)}`);
        }
      }
    }
    if (NAV) {
      await page.setViewport({ width: 980, height: 620, deviceScaleFactor: 1 });
      for (const n of SCREENS) {
        await page.goto(`${base}/index.html?screen=${n}`, { waitUntil: 'load' });
        await ready(page);
        const r = await page.evaluate(async (n) => {
          const P = window.__s1Player;
          const btn = (label) => document.querySelector(`.nav-controls button[aria-label="${label}"]`);
          const shown = (b) => !!b && b.getClientRects().length > 0 && getComputedStyle(b).display !== 'none';
          const tick = () => new Promise(res => setTimeout(res, 60));
          const out = { arrows: document.querySelectorAll('.stage .screen svg path[fill="#5AB3AA"]').length, nextShown: shown(btn('Next')), prevShown: shown(btn('Previous')), submitShown: shown(btn('Submit')) };
          if (out.nextShown && n < P.total) { btn('Next').click(); await tick(); out.afterNext = P.index + 1; }
          if (out.prevShown && n > 1) { P.go(n - 1); await tick(); btn('Previous').click(); await tick(); out.afterPrev = P.index + 1; }
          return out;
        }, n);
        if (!r.nextShown && n === 1) { await page.keyboard.press('ArrowRight'); await new Promise(res => setTimeout(res, 80)); r.afterNext = await page.evaluate(() => window.__s1Player.index + 1); r.keyboard = true; }
        const gated = n === 28 && !r.nextShown && r.submitShown; // drag-drop: SUBMIT first, as in the original
        const nextOk = n === 33 || gated || r.afterNext === n + 1;
        const prevOk = n === 1 || gated || r.afterPrev === n - 1;
        const ok = r.arrows === 0 && nextOk && prevOk;
        if (!ok) failures++;
        console.log(`screen ${String(n).padStart(2)} nav      ${r.arrows ? '✗ ' + r.arrows + ' slide arrow(s) still drawn' : 'no slide arrows'}; ${gated ? 'Prev/Next hidden until SUBMIT (drag-drop, as the original)' : `Next ${nextOk ? '✓' : '✗'}${r.keyboard ? ' (START screen: keyboard →, no bar buttons, as the original)' : ''} Prev ${prevOk ? '✓' : '✗'}`}`);
      }
    }
    console.log(`\n${failures === 0 ? 'OK' : 'FAILED'}: ${SCREENS.length} screens × ${VIEWPORTS.length} sizes, ${states} states audited, ${failures} failure${failures === 1 ? '' : 's'}.`);
    if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(all, null, 1));
    process.exitCode = failures ? 1 : 0;
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
