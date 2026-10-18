// Shared by tools/test-fit.mjs and tools/walk.mjs: Chrome lookup and the in-page layout measure.
import { existsSync } from 'node:fs';

export function chromePath() {
  const cands = [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  const found = cands.find((p) => existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to the browser executable.');
  return found;
}

// Runs inside the page: page.evaluate(measureLayout). All numbers in stage px. Reports:
//   overlaps     painted boxes of the screen (outside the band) reaching into the feedback band
//   bandWidth    band width vs its interaction area ([data-interaction]) width, and the gap between
//                the area's bottom and the band's top (the band sits directly under the area)
//   outside      painted boxes of the screen outside the main area (would be clipped)
//   clipped      text cut off inside its own box
//   bandOverflow band text running outside the band
//   contrast     every visible text run: colour on its effective background, ratio and need
//                (4.5:1, or 3:1 for large text: 24px, or 18.66px bold); lowContrast = the failures
//   small        text below 14px
//   smallTargets operable controls under 44 x 44 px
export function measureLayout() {
  const stage = document.querySelector('.w-stage');
  const s = stage.getBoundingClientRect();
  const k = s.width / 1280;
  const box = (r) => ({ top: (r.top - s.top) / k, bottom: (r.bottom - s.top) / k, left: (r.left - s.left) / k, right: (r.right - s.left) / k, w: r.width / k, h: r.height / k });
  const visible = (el) => {
    if (!el || el.closest('.w-sr-only, [hidden]')) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0;
  };
  const name = (el) => (el.getAttribute('class') || el.tagName.toLowerCase()).split(' ')[0];
  // inside a scroll container (the video transcript), a box scrolled out of its view is not painted
  const scrolledAway = (el, r) => {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const oy = getComputedStyle(e).overflowY;
      if (oy === 'auto' || oy === 'scroll') {
        const v = e.getBoundingClientRect();
        return r.bottom <= v.top + 0.5 || r.top >= v.bottom - 0.5;
      }
    }
    return false;
  };
  const main = document.querySelector('.w-main'), band = document.querySelector('.w-band');
  const overlay = document.querySelector('.w-menu-overlay:not([hidden]), .w-dialog-overlay');
  const M = box(main.getBoundingClientRect());
  const bandOn = band && main.contains(band) && visible(band);
  const B = bandOn ? box(band.getBoundingClientRect()) : null;

  // painted boxes and text runs inside main (the band's own subtree excluded)
  const boxes = [];
  for (const el of main.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase();
    if (el.closest('svg') && tag !== 'svg') continue;
    if (bandOn && band.contains(el)) continue;
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || scrolledAway(el, r)) continue;
    const cs = getComputedStyle(el);
    const painted = tag === 'svg' || ['img', 'input', 'textarea', 'button'].includes(tag) || cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
      || ['Top', 'Right', 'Bottom', 'Left'].some((side) => parseFloat(cs['border' + side + 'Width']) > 0);
    if (painted) boxes.push({ what: name(el), ...box(r) });
  }
  const textRuns = (root, skip) => {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue.trim() || !visible(n.parentElement) || (skip && skip(n))) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width && r.height && !scrolledAway(n.parentElement, r)) out.push({ node: n, what: 'text:' + n.nodeValue.trim().slice(0, 24), ...box(r) });
    }
    return out;
  };
  boxes.push(...textRuns(main, (n) => bandOn && band.contains(n)));

  const hit = (b, R) => b.bottom > R.top + 0.5 && b.top < R.bottom - 0.5 && b.right > R.left + 0.5 && b.left < R.right - 0.5;
  const overlaps = bandOn ? boxes.filter((b) => hit(b, B)).map((b) => b.what) : [];
  const outside = boxes.filter((b) => b.top < M.top - 0.5 || b.bottom > M.bottom + 0.5 || b.left < M.left - 0.5 || b.right > M.right + 0.5).map((b) => b.what);

  let bandWidth = null;
  if (bandOn) {
    const area = [...band.parentElement.querySelectorAll(':scope > [data-interaction]')].find((el) => visible(el)) || band.closest('[data-interaction]');
    if (area) {
      const A = box(area.getBoundingClientRect());
      bandWidth = { band: Math.round(B.w), area: Math.round(A.w), gap: Math.round(B.top - (area.contains(band) ? B.top : A.bottom)), left: Math.round(B.left - A.left) };
    }
  }

  const TEXT_BOXES = '.w-instruction, .w-band-live, .w-band-text, .w-btn, .w-link, .w-opt, .w-opt-label, .w-label, .w-eyebrow, .w-quote-1, .w-quote-2, .w-attrib, .w-memo-line, .w-memo-q, .w-hintline, '
    + '.w-privacy, .w-field-label, .w-counter, .w-next, .w-prev, .w-chapter-title, .w-chapter-meta, .w-panel-title, .w-panel-link, .w-saved, .w-rail-done, figcaption';
  const clipped = [...document.querySelectorAll(TEXT_BOXES)].filter((el) => visible(el) && getComputedStyle(el).display !== 'inline'
    && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)).map(name);
  let bandOverflow = false;
  if (bandOn) for (const t of textRuns(band)) if (t.top < B.top - 0.5 || t.bottom > B.bottom + 0.5 || t.left < B.left - 0.5 || t.right > B.right + 0.5) bandOverflow = true;

  // contrast of every visible text run in the stage (on its effective background)
  const parse = (c) => { const m = c.match(/[\d.]+/g); return m ? { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] } : null; };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const bgOf = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    return layers.reverse().reduce((acc, c) => over(c, acc), { r: 255, g: 255, b: 255, a: 1 });
  };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  const contrast = new Map(), lowContrast = [], small = [];
  const scope = overlay || stage;
  for (const t of textRuns(scope)) {
    const el = t.node.parentElement;
    if (overlay && !overlay.contains(el)) continue;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
    if (size < 14) small.push(`${t.what} ${size}px`);
    const fg = parse(cs.color), bg = bgOf(el);
    const r = ratio(fg.a < 1 ? over(fg, bg) : fg, bg);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const key = `${hex(fg)} on ${hex(bg)}${large ? ' (large)' : ''}`;
    if (!contrast.has(key)) contrast.set(key, { ratio: Math.round(r * 100) / 100, need, sample: t.what });
    if (r < need) lowContrast.push(`${t.what} ${key} ${r.toFixed(2)}:1 < ${need}`);
  }

  // operable controls at least 44 x 44 (inline glossary terms inside running text excepted)
  const smallTargets = [...scope.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]')]
    .filter((el) => visible(el) && !el.inert && !el.closest('[inert]') && !el.matches('.w-term'))
    .map((el) => ({ el, b: box(el.getBoundingClientRect()) }))
    .filter(({ b }) => b.w < 43.5 || b.h < 43.5).map(({ el, b }) => `${name(el)} ${Math.round(b.w)}x${Math.round(b.h)}`);

  return { overlaps, outside, clipped, bandOverflow, bandWidth, contrast: Object.fromEntries(contrast), lowContrast, small, smallTargets };
}

// One line verdict for a measureLayout result: [ok, detail]
export function layoutVerdict(m) {
  const bad = [];
  if (m.overlaps.length) bad.push('over the band: ' + m.overlaps.join(', '));
  if (m.outside.length) bad.push('outside main: ' + m.outside.join(', '));
  if (m.clipped.length) bad.push('clipped: ' + m.clipped.join(', '));
  if (m.bandOverflow) bad.push('band text overflows the band');
  if (m.bandWidth && (Math.abs(m.bandWidth.band - m.bandWidth.area) > 1 || m.bandWidth.left !== 0 || m.bandWidth.gap < 0 || m.bandWidth.gap > 40))
    bad.push(`band ${m.bandWidth.band}px vs interaction area ${m.bandWidth.area}px, offset ${m.bandWidth.left}, gap ${m.bandWidth.gap}`);
  if (m.lowContrast.length) bad.push('contrast: ' + m.lowContrast.join('; '));
  if (m.small.length) bad.push('text under 14px: ' + m.small.join(', '));
  if (m.smallTargets.length) bad.push('targets under 44px: ' + m.smallTargets.join(', '));
  const detail = m.bandWidth ? `band ${m.bandWidth.band}px = area ${m.bandWidth.area}px, gap ${m.bandWidth.gap}px` : 'no band';
  return [!bad.length, bad.length ? bad.join(' | ') : detail];
}
