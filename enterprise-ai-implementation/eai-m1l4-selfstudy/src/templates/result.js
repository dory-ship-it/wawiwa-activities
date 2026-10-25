// Check result template (NL4, S21R), a Focus panel (styled by analogy): the latest attempt of the
// knowledge check (screen.from, S21).
//   left    the score ring (the visual anchor): a turquoise arc for the score out of 100, the number
//           in the middle, the pass mark as a tick on the ring
//   right   the score line as the heading ("4 of 5 on first try (80 of 100). Pass mark: 80."), the
//           Passed / Not passed yet chip and its line; below 80 the items missed on first try, each its
//           one-line stem (FX2 H1: the content's short stem), one line and a "Review Chapter N" link (it opens that screen with "Back to the check"
//           in the footer), then "Retake now" (the whole check, at once)
// Next is open either way (a presentation screen): below 80 the learner may finish as failed and come
// back to retake. Nothing is tracked here: the attempt's score went out when S21 ended (ctx.checkDone).
import { h, fmt, chapterNo } from '../util.js?v=d9c03a25';
import { glyph, icon } from '../icons.js?v=d9c03a25';
import { layout, sheet } from './stage.js?v=d9c03a25';

const R = 64, C = 2 * Math.PI * R; // the ring, in its 160 x 160 box

export const result = {
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    const check = content.screens.find((s) => s.id === screen.from);
    const pass = content.lesson.completion.passMark;
    const sc = ctx.score();
    const p = sc.raw ?? 0;
    const passed = !!ctx.checkState().p;
    zones.instruction.textContent = fmt(screen.instruction, { x: sc.x, n: sc.n, p });

    const svg = (tag, attrs) => { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); return el; };
    const ring = svg('svg', { viewBox: '0 0 160 160', class: 'w-ring-svg', 'aria-hidden': 'true' });
    const tick = (pass / 100) * 2 * Math.PI - Math.PI / 2;
    ring.append(
      svg('circle', { cx: 80, cy: 80, r: R, class: 'w-ring-track' }),
      svg('circle', { cx: 80, cy: 80, r: R, class: 'w-ring-arc', 'stroke-dasharray': `${(C * p) / 100} ${C}`, transform: 'rotate(-90 80 80)' }),
      svg('line', { x1: 80 + (R - 13) * Math.cos(tick), y1: 80 + (R - 13) * Math.sin(tick), x2: 80 + (R + 13) * Math.cos(tick), y2: 80 + (R + 13) * Math.sin(tick), class: 'w-ring-tick' }));
    const figure = h('figure', { class: 'w-ring', role: 'img', 'aria-label': fmt(screen.ringAlt, { p }), dataset: { passed: String(passed) } },
      ring, h('span', { class: 'w-ring-num', 'aria-hidden': 'true' }, String(p)));

    const verdict = passed ? screen.passed : screen.notPassed;
    const chip = h('p', { class: 'w-result-chip', dataset: { passed: String(passed) } },
      icon(passed ? 'check-circle' : 'rotate-ccw', { size: 19.2 }), h('span', {}, verdict.chip));
    const parts = [h('div', { class: 'w-result-verdict' }, chip, h('p', { class: 'w-result-line' }, verdict.text))];

    if (!passed) {
      // the items missed on the first try of this attempt, in the check's order (FX3: in this
      // attempt's version, a or b: its interaction id and its short stem, stemB for version b)
      const b = ctx.checkVersion() === 'b';
      const itemOf = (m) => { const it = check.items.find((x) => x.id === m.item); return it && b && it.b ? { ...it, ...it.b } : it; };
      const missed = screen.missed.filter((m) => {
        const it = itemOf(m);
        return it && ctx.firstAnswer(it.trackingId)?.result !== 'correct';
      });
      if (missed.length) {
        parts.push(h('ul', { class: 'w-missed' }, missed.map((m) => {
          const it = itemOf(m);
          return h('li', { class: 'w-missed-item', dataset: { item: m.item } },
            h('div', { class: 'w-missed-text' }, h('p', { class: 'w-missed-stem' }, (b && m.stemB) || m.stem || it.stem || it.instruction), h('p', { class: 'w-missed-line' }, m.text)),
            h('button', { class: 'w-link w-review-link', type: 'button', dataset: { action: 'review', screen: m.screen }, onclick: () => ctx.reviewGo(m.screen) },
              h('span', {}, fmt(screen.reviewLabel, { n: chapterNo(content, content.screens.find((s) => s.id === m.screen)?.chapter) })), glyph('g-arrow', { size: 19.2 })));
        })));
      }
      parts.push(h('div', { class: 'w-actionbar w-result-actions' },
        h('button', { class: 'w-btn w-btn-primary', type: 'button', dataset: { action: 'retake' }, onclick: () => ctx.retake() }, h('span', {}, ui.buttons.retake))));
    }

    layout(ctx, 'focus', sheet('focus w-sheet-wide w-result',
      h('div', { class: 'w-result-grid', dataset: { interaction: '' } }, figure, h('div', { class: 'w-result-body' }, zones.instruction, parts)),
      zones.band));
    zones.setFeedback({ state: 'idle' });
    return { unmount() {} };
  },
};
