// Shared by tools/test-fit.mjs and tools/walk.mjs: Chrome lookup and the in-page layout measure.
import { existsSync } from 'node:fs';

export const MAX_GAP_RATIO = 0.25; // no vertical gap inside the stage card above 25% of its height

export function chromePath() {
  const cands = [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  const found = cands.find((p) => existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to the browser executable.');
  return found;
}

// Runs inside the page: page.evaluate(measureLayout). All numbers in stage px.
// Collects every painted box (text runs, icons, images, form controls, anything with a background
// or a border) inside the stage card, then reports:
//   overlaps   card content reaching into the feedback row
//   outside    card content outside the card box (would be clipped by the card)
//   clipped    text cut off inside its own box (zones, buttons, options, fields)
//   fbOverflow feedback text running outside the feedback row
//   maxGap     the largest empty vertical band inside the card (card edges included), and its ratio
export function measureLayout() {
  const stage = document.querySelector('.w-stage');
  const s = stage.getBoundingClientRect();
  const k = s.width / 1280;
  const box = (r) => ({ top: (r.top - s.top) / k, bottom: (r.bottom - s.top) / k, left: (r.left - s.left) / k, right: (r.right - s.left) / k });
  const visible = (el) => {
    if (!el || el.closest('.w-sr-only, [hidden]')) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  };
  const name = (el) => (el.getAttribute('class') || el.tagName.toLowerCase()).split(' ')[0];
  const card = document.querySelector('.w-card'), fb = document.querySelector('.w-feedback');
  const C = box(card.getBoundingClientRect()), F = box(fb.getBoundingClientRect());

  const boxes = [];
  for (const el of card.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase();
    if (el.closest('svg') && tag !== 'svg') continue;
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el);
    const painted = tag === 'svg' || ['img', 'input', 'textarea', 'button'].includes(tag) || cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
      || ['Top', 'Right', 'Bottom', 'Left'].some((side) => parseFloat(cs['border' + side + 'Width']) > 0);
    if (painted) boxes.push({ what: name(el), ...box(r) });
  }
  const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim() || !visible(n.parentElement)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) if (r.width && r.height) boxes.push({ what: 'text:' + n.nodeValue.trim().slice(0, 24), ...box(r) });
  }

  const overlaps = boxes.filter((b) => b.bottom > F.top + 0.5 && b.right > F.left && b.left < F.right).map((b) => b.what);
  const outside = boxes.filter((b) => b.top < C.top - 0.5 || b.bottom > C.bottom + 0.5 || b.left < C.left - 0.5 || b.right > C.right + 0.5).map((b) => b.what);
  const TEXT_BOXES = '.w-instruction, .w-fb-live, .w-btn, .w-link, .w-opt, .w-opt-label, .w-line, .w-question, .w-bubble, .w-privacy, .w-field-label, .w-counter, .w-avatar-label, .w-badge, .w-pager-label';
  const clipped = [...document.querySelectorAll(TEXT_BOXES)].filter((el) => visible(el) && getComputedStyle(el).display !== 'inline'
    && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)).map(name);
  const fbRange = document.createRange();
  fbRange.selectNodeContents(fb.querySelector('.w-fb-live'));
  const fbOverflow = [...fbRange.getClientRects()].some((r) => { const b = box(r); return b.top < F.top - 0.5 || b.bottom > F.bottom + 0.5; });

  const spans = boxes.map((b) => [Math.max(C.top, b.top), Math.min(C.bottom, b.bottom)]).filter(([a, z]) => z > a).sort((x, y) => x[0] - y[0]);
  let cursor = C.top, maxGap = 0;
  for (const [a, z] of spans) { maxGap = Math.max(maxGap, a - cursor); cursor = Math.max(cursor, z); }
  maxGap = Math.max(maxGap, C.bottom - cursor);
  const cardH = C.bottom - C.top;
  return { cardH, maxGap: Math.round(maxGap), gapRatio: maxGap / cardH, overlaps, outside, clipped, fbOverflow };
}
