// Renders a Storyline vector "commandset" (from paths.js) as an inline SVG, exactly as the original
// player does: same paths, gradients, strokes and drop shadows. Text is not drawn here (it is HTML).
const NS = 'http://www.w3.org/2000/svg', XLINK = 'http://www.w3.org/1999/xlink';
let counter = 0;

export function svgFromCommandset(cs, { w, h, image }) {
  const prefix = 'v' + (++counter) + '_';
  const svg = document.createElementNS(NS, 'svg');
  // A line object has no width (or no height): the original's divider on screens 2, 4, 23 and 32 is a
  // 0x161 shape holding one <line>. A zero-sized viewBox disables rendering, so the svg keeps at least
  // 1px each way and the stroke paints through overflow:visible (P5.1 fix 5).
  const vw = Math.max(w, 1), vh = Math.max(h, 1);
  svg.setAttribute('width', vw); svg.setAttribute('height', vh);
  svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  svg.setAttribute('overflow', 'visible'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'obj-svg');
  for (const child of cs?.children || []) { const n = node(child, prefix, image); if (n) svg.appendChild(n); }
  return svg;
}

const tf = (arr) => Array.isArray(arr) ? arr.map(t => `${t.type}(${t.args.join(',')})`).join(' ') : String(arr);
const FIX = { 'stroke-linecap': { flat: 'butt' } };

function node(n, prefix, image) {
  if (!n || !n.nodeType) return null;
  if (n.nodeType === 'use' && n['data-reference-type'] === 'text') return null;
  if (n.nodeType === 'text') return null;
  const el = document.createElementNS(NS, n.nodeType);
  for (const [k, v] of Object.entries(n)) {
    if (k === 'nodeType' || k === 'children' || v === null || v === undefined) continue;
    if (k === 'className') { el.setAttribute('class', v); continue; }
    if (k === 'transform' || k === 'gradientTransform' || k === 'patternTransform') { el.setAttribute(k, tf(v)); continue; }
    if (k === 'id') { el.setAttribute('id', prefix + v); continue; }
    if (k === 'xlink:href' || k === 'href') { const ref = String(v).replace(/^#/, '#' + prefix); el.setAttributeNS(XLINK, 'xlink:href', ref); el.setAttribute('href', ref); continue; }
    if (k.startsWith('data-')) continue;
    let s = Array.isArray(v) ? v.join(' ') : String(v);
    s = s.replace(/url\(#([^)]+)\)/g, (m, id) => `url(#${prefix}${id})`);
    if (FIX[k] && FIX[k][s]) s = FIX[k][s];
    el.setAttribute(k, s);
  }
  if (n.nodeType === 'image') {
    if (!image) return null;
    el.setAttributeNS(XLINK, 'xlink:href', image.url); el.setAttribute('href', image.url);
    if (n.width == null) el.setAttribute('width', image.w);
    if (n.height == null) el.setAttribute('height', image.h);
    el.setAttribute('preserveAspectRatio', 'none');
  }
  for (const c of n.children || []) { const cn = node(c, prefix, image); if (cn) el.appendChild(cn); }
  return el;
}
