// Text-fit pass (work-order P4.1, fix 2; P5.1 fix 2 adds the speaker's reserved spot). The engine
// runs it on every screen render, after every layer or state change, and whenever the slide's
// scale changes. Every visible text box must
//   1. wrap inside the stage (nothing runs past the right edge),
//   2. stay above the footer strip,
//   3. never sit under an image, video or iframe that paints on top of it,
//   4. never sit under the speaker control (its footprint in slide units comes in as an obstacle).
// Remedies, in Dor's order: (a) a box wider than the stage is clamped so its text wraps; (b) the
// font shrinks 1px at a time, all runs together, down to a floor of 14px (stage units); (c) still
// covered at the floor: a covering picture moves down below the text (and shrinks if it would cross
// the footer). Under the speaker, text shrinks at most 10% (a long title loses a pixel or two and
// wraps clear); if that is not enough its object moves away at full size. Text is never hidden.
// Slide objects that paint something and would sit under the speaker give way before the text is
// measured: a picture or video shrinks a little towards its bottom-left corner (its text neighbours
// stay put); a filled shape, card or button moves left when there is room on the stage, else down
// above the footer. Whatever sits on a moved object (its text, a label on a card) moves with it;
// whatever it lands on moves out of its way, the same direction. Full-stage backgrounds and side
// panels stay where they are, and so do objects whose position an interaction owns.
// A box whose text is taller than its declared height but has free space below simply grows: the
// original player never clipped text either. Overlays are respected: media in a layer does not count
// against text in the base slide (a popup card over the slide is design), and media the timeline
// hides later (the demo video on screen 28 plays over the labels, then goes) is left alone while it
// shows. Every change is recorded, so each pass starts again from the original geometry.
const STAGE_W = 960, STAGE_H = 540, MARGIN = 10, FLOOR = 14, GAP = 6, TOL = 1.5;
const SOFT = 0.9;      // under the speaker, text shrinks to this share of its size at most before its object moves instead
const BACKDROP = 0.95; // spanning this share of the stage's width or height: a background or side panel, never moved
const FIXED = '.footer, .small-logo, .drag-item, .drop-target, .slider, .slider-thumb, .slider-track';

export function fitScreen(screen, opts = {}) {
  if (!screen || !screen.isConnected) return;
  const reg = screen.__fit || (screen.__fit = { boxes: new Map(), pos: new Map(), size: new Map() });
  restore(reg);
  const obstacles = (opts.obstacles || []).filter(Boolean);

  const vis = (el) => el.getClientRects().length > 0;
  const pos = (el) => { let x = 0, y = 0, e = el; while (e && e !== screen) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; };
  const rectOf = (el) => { const p = pos(el); return { x: p.x, y: p.y, w: el.offsetWidth, h: el.offsetHeight }; };
  const scopeOf = (el) => el.closest('.layer') || screen;
  const inter = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > TOL && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > TOL;
  const near = (r) => ({ x: r.x - GAP, y: r.y - GAP, w: r.w + 2 * GAP, h: r.h + 2 * GAP }); // text keeps a small clearance from what covers it
  const union = (a, b) => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };

  const footer = screen.querySelector('.footer');
  const bottom = footer && vis(footer) ? rectOf(footer).y : STAGE_H;

  // (0) the speaker's reserved spot: pictures under it shrink, other painted objects move away; text is handled in fitBox
  if (obstacles.length) {
    const all = items();
    for (const o of obstacles) for (const it of all) if (!it.moved && it.painted && inter(it.rect, near(o))) { if (it.picture) shrinkAway(it, o); else shift(it, o, all); }
  }

  const media = [];
  for (const el of screen.querySelectorAll('.obj')) {
    if (!vis(el) || el.dataset.transient || el.closest('.footer, .small-logo')) continue;
    const direct = Array.from(el.children).find(c => /^(IMG|VIDEO|IFRAME)$/.test(c.tagName));
    if (direct || el.querySelector(':scope > svg image')) media.push({ el, rect: rectOf(el), scope: scopeOf(el), pushed: false });
  }

  const boxes = Array.from(screen.querySelectorAll('.txtbox, .txt')).filter(el => vis(el) && !el.closest('.footer') && el.textContent.replace(/​/g, '').trim());
  for (const box of boxes) fitBox(box);

  function fitBox(box) {
    const orig = remember(reg, box);
    const scope = scopeOf(box);
    let bp = pos(box);
    // (a) a box that runs past the stage is clamped so its text wraps (slide 31's subtitle is 1215 wide)
    if (bp.x + box.offsetWidth > STAGE_W + 2) box.style.width = Math.max(60, STAGE_W - MARGIN - bp.x) + 'px';
    const soft = Math.max(FLOOR, orig.base * SOFT);
    let size = orig.base, moved = false;
    for (let i = 0; i < 80; i++) {
      bp = pos(box); // the box's object may have moved
      const R = contentRect(box, bp, screen);
      if (!R) return;
      const outside = R.x + R.w > STAGE_W + 0.5 || R.y + R.h > bottom - 0.5 || box.scrollWidth > box.clientWidth + 1;
      const covering = media.filter(m => m.scope === scope && !m.el.contains(box) && (box.compareDocumentPosition(m.el) & Node.DOCUMENT_POSITION_FOLLOWING) && inter(R, near(m.rect)));
      const under = obstacles.filter(o => inter(R, near(o))); // the speaker sits above every layer
      if (!outside && !covering.length && !under.length) break;
      // under the speaker only: past the small shrink, the text's object moves away at full size
      if (under.length && !outside && !covering.length && !moved && size <= soft + 1e-6) { moved = true; size = orig.base; scaleText(orig, 1); moveAway(box, under[0]); continue; }
      if (size > FLOOR) { size = Math.max(FLOOR, size - 1); scaleText(orig, size / orig.base); continue; }
      // (c) at the floor and still covered: the picture gives way; under the speaker, the text's object moves away
      for (const m of covering) pushDown(m, R.y + R.h + GAP);
      if (under.length && !moved) moveAway(box, under[0]);
      break;
    }
    grow(box, orig);
  }
  function moveAway(box, o) {
    const top = box.closest('.screen > .obj, .layer > .obj') || box;
    const all = items();
    const it = all.find(x => x.el === top);
    if (it) shift(it, o, all);
  }

  function pushDown(m, top) {
    const dy = top - m.rect.y;
    if (dy <= 0 || m.pushed) return;
    m.pushed = true;
    rememberPos(reg, m.el); rememberSize(reg, m.el);
    m.el.style.top = ((parseFloat(m.el.style.top) || 0) + dy) + 'px';
    let { w, h } = m.rect;
    const room = bottom - top;
    if (h > room) { const s = Math.max(0.2, room / h); w *= s; h *= s; sizeMedia(m.el, w, h); }
    m.rect = { x: m.rect.x, y: top, w, h };
    for (const n of media) if (n !== m && !n.pushed && n.scope === m.scope && n.rect.y >= m.rect.y - dy && inter(m.rect, n.rect)) pushDown(n, m.rect.y + m.rect.h + GAP);
  }

  /* ---- slide objects and the speaker's spot ---- */
  // Top-level slide objects (base slide and open layers) with the rectangle they visibly paint:
  // pictures, media, inputs, filled or stroked vector art, box fills, plus their text's line boxes.
  function items() {
    const out = [];
    for (const el of screen.querySelectorAll(':scope > .obj, :scope > .layer > .obj')) {
      if (!vis(el) || el.matches(FIXED) || el.dataset.transient) continue;
      const r = rectOf(el);
      if (r.w >= BACKDROP * STAGE_W || r.h >= BACKDROP * STAGE_H) continue;
      const painted = paintedRect(el), text = textRect(el);
      const rect = painted && text ? union(painted, text) : (painted || text);
      const picture = Array.from(el.children).some(c => /^(IMG|VIDEO|IFRAME)$/.test(c.tagName)) || !!el.querySelector(':scope > svg image');
      if (rect) out.push({ el, rect, painted: !!painted, picture, scope: scopeOf(el), moved: false });
    }
    return out;
  }
  // A picture under the speaker shrinks towards its bottom-left corner, just enough for its right
  // edge to clear the speaker's left or its top to clear the speaker's bottom, whichever is less.
  function shrinkAway(it, o) {
    const r = it.rect, el = it.el;
    const sx = (o.x - GAP - r.x) / r.w, sy = (r.y + r.h - (o.y + o.h + GAP)) / r.h;
    const s = Math.max(0.2, Math.min(1, Math.max(sx, sy)));
    if (s >= 1) return;
    rememberPos(reg, el); rememberSize(reg, el);
    const w = r.w * s, h = r.h * s;
    el.style.top = ((parseFloat(el.style.top) || 0) + (r.h - h)) + 'px';
    sizeMedia(el, w, h);
    it.rect = { x: r.x, y: r.y + r.h - h, w, h }; it.moved = true;
  }
  function paintedRect(el) {
    let u = null;
    for (const o of [el, ...el.querySelectorAll('.obj')]) {
      if (!vis(o)) continue;
      const kids = Array.from(o.children);
      const paints = kids.some(c => /^(IMG|VIDEO|IFRAME|INPUT)$/.test(c.tagName) || (c.tagName === 'svg' && c.querySelector('image, [fill]:not([fill="none"]), [stroke]:not([stroke="none"])')))
        || (o.style.background && o.style.background !== 'transparent') || o.style.border;
      if (paints) { const r = rectOf(o); u = u ? union(u, r) : r; }
    }
    return u;
  }
  function textRect(el) {
    let u = null;
    for (const tb of el.querySelectorAll('.txtbox, .txt')) {
      if (!vis(tb) || !tb.textContent.replace(/​/g, '').trim()) continue;
      const R = contentRect(tb, pos(tb), screen);
      if (R) u = u ? union(u, R) : R;
    }
    return u;
  }
  // Move `it` clear of the rectangle `o`: left if it then stays on the stage, else down if it stays
  // above the footer (the first of those that lands on nothing new wins), else the shorter way.
  function shift(it, o, all) {
    const r = it.rect;
    const dl = r.x + r.w - (o.x - GAP), dd = o.y + o.h + GAP - r.y;
    const left = { dx: -dl, dy: 0, ok: r.x - dl >= MARGIN }, down = { dx: 0, dy: dd, ok: r.y + r.h + dd <= bottom - GAP };
    const others = all.filter(n => n !== it && n.scope === it.scope && !inter(n.rect, r)); // not what is drawn on it already
    const clear = (c) => !others.some(n => inter({ x: r.x + c.dx, y: r.y + c.dy, w: r.w, h: r.h }, near(n.rect)));
    const fits = [left, down].filter(c => c.ok);
    const pick = fits.find(clear) || fits[0] || (dl <= dd ? left : down);
    move(it, pick.dx, pick.dy);
    follow(it, r, all);
  }
  // Whatever sat mostly inside `it` before it moved (its text, a label on its card) moves with it by
  // the same amount; whatever it has newly landed on moves out of its way, in the move's direction.
  // A neighbour that merely touched it by design is left alone. Once each.
  function follow(it, old, all) {
    const dx = it.rect.x - old.x, dy = it.rect.y - old.y, dir = dx ? 'left' : 'down';
    for (const n of all) if (n !== it && !n.moved && n.scope === it.scope && inside(n.rect, old)) { const was = n.rect; move(n, dx, dy); follow(n, was, all); }
    for (const n of all) {
      if (n === it || n.moved || n.scope !== it.scope || inter(n.rect, old) || !inter(n.rect, near(it.rect))) continue;
      const amount = dir === 'left' ? n.rect.x + n.rect.w - (it.rect.x - GAP) : it.rect.y + it.rect.h + GAP - n.rect.y;
      if (amount <= 0) continue;
      const was = n.rect; move(n, dir === 'left' ? -amount : 0, dir === 'down' ? amount : 0); follow(n, was, all);
    }
  }
  function move(it, dx, dy) {
    it.moved = true;
    rememberPos(reg, it.el);
    if (dx) it.el.style.left = ((parseFloat(it.el.style.left) || 0) + dx) + 'px';
    if (dy) it.el.style.top = ((parseFloat(it.el.style.top) || 0) + dy) + 'px';
    it.rect = { x: it.rect.x + dx, y: it.rect.y + dy, w: it.rect.w, h: it.rect.h };
  }
}

/* ---- measuring ---- */
// Union of the text's own line boxes, in stage units. Measured relative to the box itself so a
// running entrance animation (translate/scale on the wrapper) does not skew it.
function contentRect(box, bp, screen) {
  const br = box.getBoundingClientRect();
  if (!br.width) return null;
  if (rotated(box, screen)) return { x: bp.x, y: bp.y, w: box.offsetWidth, h: box.offsetHeight };
  const k = box.offsetWidth / br.width;
  let u = null;
  for (const p of parts(box)) {
    const range = document.createRange(); range.selectNodeContents(p);
    for (const r of range.getClientRects()) {
      if (r.width < 0.5 || r.height < 0.5) continue;
      const l = { x: bp.x + (r.left - br.left) * k, y: bp.y + (r.top - br.top) * k, r: bp.x + (r.right - br.left) * k, b: bp.y + (r.bottom - br.top) * k };
      u = u ? { x: Math.min(u.x, l.x), y: Math.min(u.y, l.y), r: Math.max(u.r, l.r), b: Math.max(u.b, l.b) } : l;
    }
  }
  return u ? { x: u.x, y: u.y, w: u.r - u.x, h: u.b - u.y } : null;
}
const parts = (box) => box.classList.contains('txtbox') ? Array.from(box.children).filter(c => c.tagName === 'P') : [box];
// at least half of rectangle n lies inside rectangle r
function inside(n, r) { const ix = Math.max(0, Math.min(n.x + n.w, r.x + r.w) - Math.max(n.x, r.x)), iy = Math.max(0, Math.min(n.y + n.h, r.y + r.h) - Math.max(n.y, r.y)); return ix * iy >= 0.5 * n.w * n.h; }
function rotated(el, screen) {
  for (let e = el; e && e !== screen; e = e.parentElement) {
    const t = getComputedStyle(e).transform;
    if (t && t !== 'none') { const m = /matrix\(([^)]+)\)/.exec(t); if (m) { const [a, b] = m[1].split(',').map(Number); if (Math.abs(b) > 0.001 || Math.abs(a - 1) > 0.2) return true; } }
  }
  return false;
}

/* ---- changing ---- */
function remember(reg, box) {
  let o = reg.boxes.get(box);
  if (o) return o;
  const ps = parts(box).map(p => ({ el: p, css: p.style.cssText, size: parseFloat(p.style.fontSize) || parseFloat(getComputedStyle(p).fontSize), lh: parseFloat(p.style.lineHeight) || 0, mt: parseFloat(p.style.marginTop) || 0, mb: parseFloat(p.style.marginBottom) || 0,
    spans: Array.from(p.querySelectorAll('span')).filter(s => s.style.fontSize).map(s => ({ el: s, css: s.style.cssText, size: parseFloat(s.style.fontSize) })) }));
  o = { css: box.style.cssText, parts: ps, base: Math.max(...ps.map(p => p.size), 1) };
  reg.boxes.set(box, o);
  return o;
}
function scaleText(o, k) {
  for (const p of o.parts) {
    p.el.style.fontSize = (p.size * k) + 'px';
    if (p.lh) p.el.style.lineHeight = (p.lh * k) + 'px';
    if (p.mt) p.el.style.marginTop = (p.mt * k) + 'px';
    if (p.mb) p.el.style.marginBottom = (p.mb * k) + 'px';
    for (const s of p.spans) s.el.style.fontSize = (s.size * k) + 'px';
  }
}
// a box whose text is taller than its declared height grows to hold it, keeping the text where it was
function grow(box, o) {
  const extra = box.scrollHeight - box.clientHeight;
  if (extra <= 1) return;
  const jc = getComputedStyle(box).justifyContent;
  const top = parseFloat(box.style.top) || 0;
  if (jc === 'center') box.style.top = (top - extra / 2) + 'px';
  else if (jc === 'flex-end' || jc === 'end') box.style.top = (top - extra) + 'px';
  box.style.height = box.scrollHeight + 'px';
}
// Only the properties the pass changes are recorded (position, size), never a whole cssText: a
// show/hide after the first pass must survive the next pass's restore.
function rememberPos(reg, el) { if (!reg.pos.has(el)) reg.pos.set(el, { left: el.style.left, top: el.style.top }); }
function rememberSize(reg, el) {
  if (reg.size.has(el)) return;
  const svg = el.querySelector(':scope > svg');
  reg.size.set(el, { width: el.style.width, height: el.style.height, svg, w: svg && svg.getAttribute('width'), h: svg && svg.getAttribute('height') });
}
function sizeMedia(el, w, h) {
  el.style.width = w + 'px'; el.style.height = h + 'px';
  const svg = el.querySelector(':scope > svg');
  if (svg) { svg.setAttribute('width', w); svg.setAttribute('height', h); }
}
function restore(reg) {
  for (const [box, o] of reg.boxes) {
    if (!box.isConnected) { reg.boxes.delete(box); continue; }
    box.style.cssText = o.css;
    for (const p of o.parts) { p.el.style.cssText = p.css; for (const s of p.spans) s.el.style.cssText = s.css; }
  }
  for (const [el, o] of reg.pos) {
    if (!el.isConnected) { reg.pos.delete(el); continue; }
    el.style.left = o.left; el.style.top = o.top;
  }
  for (const [el, o] of reg.size) {
    if (!el.isConnected) { reg.size.delete(el); continue; }
    el.style.width = o.width; el.style.height = o.height;
    if (o.svg) { o.svg.setAttribute('width', o.w); o.svg.setAttribute('height', o.h); }
  }
}
