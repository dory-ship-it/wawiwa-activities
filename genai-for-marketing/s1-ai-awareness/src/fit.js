// Text-fit pass (work-order P4.1, fix 2). The engine runs it on every screen render and after every
// layer or state change. Every visible text box must
//   1. wrap inside the stage (nothing runs past the right edge),
//   2. stay above the footer strip,
//   3. never sit under an image, video or iframe that paints on top of it.
// Remedies, in Dor's order: (a) a box wider than the stage is clamped so its text wraps; (b) the
// font shrinks 1px at a time, all runs together, down to a floor of 14px (stage units); (c) still
// covered at the floor: the covering picture moves down below the text, and shrinks if it would
// otherwise cross the footer. Text is never hidden.
// A box whose text is taller than its declared height but has free space below simply grows: the
// original player never clipped text either. Overlays are respected: media in a layer does not count
// against text in the base slide (a popup card over the slide is design), and media the timeline
// hides later (the demo video on screen 28 plays over the labels, then goes) is left alone while it
// shows. Every change is recorded, so each pass starts again from the original geometry.
const STAGE_W = 960, STAGE_H = 540, MARGIN = 10, FLOOR = 14, GAP = 6, TOL = 1.5;

export function fitScreen(screen) {
  if (!screen || !screen.isConnected) return;
  const reg = screen.__fit || (screen.__fit = { boxes: new Map(), media: new Map() });
  restore(reg);

  const vis = (el) => el.getClientRects().length > 0;
  const pos = (el) => { let x = 0, y = 0, e = el; while (e && e !== screen) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; };
  const rectOf = (el) => { const p = pos(el); return { x: p.x, y: p.y, w: el.offsetWidth, h: el.offsetHeight }; };
  const scopeOf = (el) => el.closest('.layer') || screen;
  const inter = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > TOL && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > TOL;
  const near = (r) => ({ x: r.x - GAP, y: r.y - GAP, w: r.w + 2 * GAP, h: r.h + 2 * GAP }); // text keeps a small clearance from a picture over it

  const footer = screen.querySelector('.footer');
  const bottom = footer && vis(footer) ? rectOf(footer).y : STAGE_H;

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
    const bp = pos(box);
    // (a) a box that runs past the stage is clamped so its text wraps (slide 31's subtitle is 1215 wide)
    if (bp.x + box.offsetWidth > STAGE_W + 2) box.style.width = Math.max(60, STAGE_W - MARGIN - bp.x) + 'px';
    let size = orig.base;
    for (let i = 0; i < 80; i++) {
      const R = contentRect(box, bp, screen);
      if (!R) return;
      const outside = R.x + R.w > STAGE_W + 0.5 || R.y + R.h > bottom - 0.5 || box.scrollWidth > box.clientWidth + 1;
      const covering = media.filter(m => m.scope === scope && !m.el.contains(box) && (box.compareDocumentPosition(m.el) & Node.DOCUMENT_POSITION_FOLLOWING) && inter(R, near(m.rect)));
      if (!outside && !covering.length) break;
      if (size > FLOOR) { size = Math.max(FLOOR, size - 1); scaleText(orig, size / orig.base); continue; }
      // (c) at the floor and still covered: the picture gives way
      for (const m of covering) pushDown(m, R.y + R.h + GAP);
      break;
    }
    grow(box, orig);
  }

  function pushDown(m, top) {
    const dy = top - m.rect.y;
    if (dy <= 0 || m.pushed) return;
    m.pushed = true;
    rememberMedia(reg, m.el);
    m.el.style.top = ((parseFloat(m.el.style.top) || 0) + dy) + 'px';
    let { w, h } = m.rect;
    const room = bottom - top;
    if (h > room) { const s = Math.max(0.2, room / h); w *= s; h *= s; sizeMedia(m.el, w, h); }
    m.rect = { x: m.rect.x, y: top, w, h };
    for (const n of media) if (n !== m && !n.pushed && n.scope === m.scope && n.rect.y >= m.rect.y - dy && inter(m.rect, n.rect)) pushDown(n, m.rect.y + m.rect.h + GAP);
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
function rememberMedia(reg, el) {
  if (reg.media.has(el)) return;
  const svg = el.querySelector(':scope > svg');
  reg.media.set(el, { css: el.style.cssText, svg, w: svg && svg.getAttribute('width'), h: svg && svg.getAttribute('height') });
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
  for (const [el, o] of reg.media) {
    if (!el.isConnected) { reg.media.delete(el); continue; }
    el.style.cssText = o.css;
    if (o.svg) { o.svg.setAttribute('width', o.w); o.svg.setAttribute('height', o.h); }
  }
}
