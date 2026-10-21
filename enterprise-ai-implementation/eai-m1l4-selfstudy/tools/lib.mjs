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
//   overlaps     painted boxes of the screen (outside the band and its panel) reaching into the band
//   bandWidth    NL1: the band is flush to its panel's edges: band width vs the panel's width, its left
//                offset and the gap between their bottoms (all 0)
//   outside      painted boxes of the screen outside the main area (would be clipped)
//   clipped      text cut off inside its own box
//   bandOverflow band text running outside the band
//   contrast     every visible text run: colour on its effective background, ratio and need
//                (4.5:1, or 3:1 for large text: 24px, or 18.66px bold); lowContrast = the failures.
//                Inactive controls (aria-disabled, disabled, a locked Next / Check / Resume) are exempt
//                (WCAG 1.4.3: text in an inactive user interface component)
//   small        text below 14px
//   smallTargets operable controls under 44 x 44 px
export function measureLayout() {
  const stage = document.querySelector('.w-stage');
  const s = stage.getBoundingClientRect();
  const k = s.height / 720; // the stage is 720 high, 1280 to 1600 wide
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
  const bandOn = band && main.contains(band) && visible(band) && band.dataset.empty !== 'true';
  const B = bandOn ? box(band.getBoundingClientRect()) : null;

  // painted boxes and text runs inside main (the band's own subtree excluded)
  const boxes = [];
  for (const el of main.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase();
    if (el.closest('svg') && tag !== 'svg') continue;
    if (bandOn && (band.contains(el) || el.contains(band))) continue; // the band, and the panel it sits in
    if (el.matches('.w-video')) continue; // the film is the screen's backdrop (V1, V2), like the scene photo
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

  // equal gutters (NL1): a Focus panel sits centred in main at any stage width, the same gap left and
  // right (L / R from main's edges to the panel). Stage panels and the title are placed by design.
  const layoutName = main.dataset.layout;
  const focusSheet = main.querySelector('.w-sheet-focus');
  let wide = null;
  if (focusSheet && visible(focusSheet) && !overlay) {
    const P = box(focusSheet.getBoundingClientRect());
    const L = Math.round(P.left - M.left), R = Math.round(M.right - P.right);
    wide = { L, R, strip: Math.abs(L - R) > 1, logoOk: true, logoWhy: '', col: 'focus panel (' + layoutName + ')' };
  }

  let bandWidth = null;
  if (bandOn) {
    const sheet = band.closest('.w-sheet');
    if (sheet) {
      const P = box(sheet.getBoundingClientRect());
      bandWidth = { band: Math.round(B.w), area: Math.round(P.w), gap: Math.round(P.bottom - B.bottom), left: Math.round(B.left - P.left) };
    }
  }

  const TEXT_BOXES = '.w-instruction, .w-band-live, .w-band-text, .w-band-hint, .w-btn, .w-link, .w-opt, .w-opt-label, .w-label, .w-eyebrow, .w-quote-1, .w-attrib, .w-memo-line, .w-memo-q, .w-context, .w-subline, '
    + '.w-privacy, .w-field-label, .w-counter, .w-next, .w-prev, .w-chapter-title, .w-panel-title, .w-panel-link, .w-saved, .w-step-label, .w-bar-chapter, .w-map-kicker, .w-map-title, .w-goal-label, figcaption';
  // cut off: content beyond the box. A tight heading (the frames set line-height 1.0 to 1.2) lets its
  // glyphs' content area pass the line box by up to about 0.15em with overflow visible: not cut off
  const clipped = [...document.querySelectorAll(TEXT_BOXES)].filter((el) => {
    if (!visible(el) || getComputedStyle(el).display === 'inline') return false;
    const cs = getComputedStyle(el);
    const slack = cs.overflowY === 'visible' ? Math.max(1, 0.2 * parseFloat(cs.fontSize)) : 1;
    return el.scrollHeight > el.clientHeight + slack || el.scrollWidth > el.clientWidth + 1;
  }).map(name);
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
    if (el.closest('[aria-disabled="true"], :disabled, [data-locked="true"]')) continue; // inactive control (WCAG 1.4.3)
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
    .filter((el) => visible(el) && el.getClientRects().length && !el.inert && !el.closest('[inert]') && !el.matches('.w-term')) // not rendered (O1's hidden footer): not a target
    .map((el) => ({ el, b: box(el.getBoundingClientRect()) }))
    .filter(({ b }) => b.w < 43.5 || b.h < 43.5).map(({ el, b }) => `${name(el)} ${Math.round(b.w)}x${Math.round(b.h)}`);

  return { overlaps, outside, clipped, bandOverflow, bandWidth, contrast: Object.fromEntries(contrast), lowContrast, small, smallTargets, wide };
}

// One line verdict for a measureLayout result: [ok, detail]
export function layoutVerdict(m) {
  const bad = [];
  if (m.overlaps.length) bad.push('over the band: ' + m.overlaps.join(', '));
  if (m.outside.length) bad.push('outside main: ' + m.outside.join(', '));
  if (m.clipped.length) bad.push('clipped: ' + m.clipped.join(', '));
  if (m.bandOverflow) bad.push('band text overflows the band');
  if (m.bandWidth && (Math.abs(m.bandWidth.band - m.bandWidth.area) > 1 || Math.abs(m.bandWidth.left) > 1 || Math.abs(m.bandWidth.gap) > 1))
    bad.push(`band ${m.bandWidth.band}px vs its panel ${m.bandWidth.area}px, offset ${m.bandWidth.left}, bottom gap ${m.bandWidth.gap}`);
  if (m.lowContrast.length) bad.push('contrast: ' + m.lowContrast.join('; '));
  if (m.small.length) bad.push('text under 14px: ' + m.small.join(', '));
  if (m.smallTargets.length) bad.push('targets under 44px: ' + m.smallTargets.join(', '));
  if (m.wide && m.wide.strip) bad.push(`${m.wide.col} not centred: left gap ${m.wide.L}px, right gap ${m.wide.R}px`);
  if (m.wide && !m.wide.logoOk) bad.push('logo not aligned: ' + m.wide.logoWhy);
  const side = m.wide ? `, ${m.wide.col} gaps ${m.wide.L}/${m.wide.R}${m.wide.logoWhy ? ', ' + m.wide.logoWhy : ''}` : '';
  const detail = (m.bandWidth ? `band ${m.bandWidth.band}px = panel ${m.bandWidth.area}px, flush` : 'no band') + side;
  return [!bad.length, bad.length ? bad.join(' | ') : detail];
}
