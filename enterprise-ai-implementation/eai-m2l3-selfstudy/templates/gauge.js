// gauge: integration feasibility for one NorthRiver opportunity (EAI M2 L3, H4; deck slide 16). Round 4 (26 Nov 2026,
// Noy approved the sketch). The light ground. Left: the opportunity, then the slide's four dimensions as rows, each
// scored 0, 1 or 2, or "Ask IT" when the case does not say (that gap is the lesson: you close it in discovery, before
// the card goes to prioritisation). Where the case says something, its fact sits on the row (Lin: no SSO). Right: a
// gauge whose needle moves to the sum, how many rows are still open, and a "time to ship" bar that stretches from
// six weeks towards six months as the score drops. When every row has an answer, the feedback card says what the case
// gives and what it leaves to IT. Not scored (a neutral fill-in of the four choices).
// Content: label, instruction, oppLabel, opportunity, ask (the "Ask IT" label), rows [{ id, name, question, fact, expect }]
// (expect: a number or "ask"), max, scoreLabel, openLine ({n}), timeLabel, ticks [from, to], keyLine, feedback { done, off }.
import { h, fmt, reducedMotion } from '../src/util.js?v=044f9db2';
import { glyph } from '../src/icons.js?v=044f9db2';
import { layout } from '../src/templates/stage.js?v=044f9db2';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };

export const gauge = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const max = screen.max || 8;
    const picks = {};
    const rows = screen.rows.map((r) => {
      const opts = [0, 1, 2, 'ask'].map((v) => h('button', { class: 'm-ga-opt' + (v === 'ask' ? ' m-ga-ask' : ''), type: 'button', role: 'radio', 'aria-checked': 'false', dataset: { v: String(v) } },
        v === 'ask' ? screen.ask : String(v)));
      const group = h('div', { class: 'm-ga-seg', role: 'radiogroup', 'aria-labelledby': 'm-ga-' + r.id }, opts);
      opts.forEach((o) => o.addEventListener('click', () => {
        picks[r.id] = o.dataset.v;
        opts.forEach((x) => x.setAttribute('aria-checked', String(x === o)));
        update();
      }));
      return { r, opts, el: h('li', { class: 'm-ga-row' }, h('div', {}, h('h2', { id: 'm-ga-' + r.id }, r.name),
        h('p', { class: r.fact ? 'm-ga-fact' : '' }, r.fact || r.question)), group) };
    });

    // the gauge: a half circle, the filled arc and the needle at the sum
    const svg = svgEl('svg', { viewBox: '0 0 300 170', class: 'm-ga-svg', 'aria-hidden': 'true' });
    const ARC = 'M20 150 A130 130 0 0 1 280 150';
    svg.append(svgEl('path', { d: ARC, class: 'm-ga-track', pathLength: '100' }));
    const fillArc = svgEl('path', { d: ARC, class: 'm-ga-fill', pathLength: '100' });
    const needle = svgEl('g', { class: 'm-ga-needle' });
    needle.append(svgEl('path', { d: 'M150 150 L44 150' }));
    svg.append(fillArc, needle, svgEl('circle', { cx: '150', cy: '150', r: '10', class: 'm-ga-hub' }));
    const num = h('b', { class: 'm-ga-num' });
    const open = h('p', { class: 'm-ga-open' });
    const fill = h('i', { class: 'm-ga-time-fill' });
    const right = h('div', { class: 'm-ga-right' },
      h('div', { class: 'm-ga-dial' }, svg, h('p', { class: 'm-ga-score' }, num, h('span', {}, ' / ' + max)), h('p', { class: 'm-ga-cap' }, screen.scoreLabel), open),
      h('div', { class: 'm-ga-time' }, h('p', { class: 'm-ga-time-label' }, screen.timeLabel), h('div', { class: 'm-ga-track2' }, fill),
        h('p', { class: 'm-ga-ticks' }, h('span', {}, screen.ticks[0]), h('span', {}, screen.ticks[1]))),
      h('p', { class: 'm-ga-key' }, screen.keyLine));
    if (still) right.classList.add('m-ga-still');

    function update() {
      const vals = rows.map((x) => picks[x.r.id]);
      const known = vals.filter((v) => v !== undefined && v !== 'ask').map(Number);
      const sum = known.reduce((a, b) => a + b, 0);
      const openN = rows.length - known.length;
      num.textContent = String(sum);
      open.textContent = openN ? fmt(screen.openLine, { n: openN }) : '';
      const frac = sum / max;
      needle.style.transform = `rotate(${Math.round(frac * 180)}deg)`;
      fillArc.style.strokeDasharray = `${Math.max(0.01, frac * 100)} 100`;
      // the time bar: long when the score is low, longer still for every row nobody has answered
      const w = Math.min(96, 18 + (1 - frac) * 62 + openN * 4);
      fill.style.width = w + '%';
      right.dataset.level = frac >= 0.75 ? 'high' : frac >= 0.4 ? 'mid' : 'low';
      const all = vals.every((v) => v !== undefined);
      if (all && !ctx.revisit) {
        ctx.answer({ trackingId: screen.tracking[0].id, response: rows.map((x) => `${x.r.id}:${picks[x.r.id]}`).join(','), result: 'neutral' });
        const off = rows.filter((x) => String(x.r.expect) !== picks[x.r.id]);
        zones.setFeedback({ state: 'neutral', tone: off.length ? 'notice' : 'correct', text: screen.feedback.done + (off.length ? ' ' + screen.feedback.off : '') });
        ctx.complete();
        ctx.unlockNext({ focus: false });
      }
    }

    layout(ctx, 'gauge',
      h('div', { class: 'w-focus-head' }, h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)), zones.instruction),
      h('div', { class: 'm-ga' }, h('div', { class: 'm-ga-left' }, h('p', { class: 'm-ga-opp' }, h('span', {}, screen.oppLabel), screen.opportunity),
        h('ol', { class: 'm-ga-rows' }, rows.map((x) => x.el))), right),
      h('div', { class: 'w-float d-float m-float' }, zones.band)); // the feedback card between Previous and Next
    zones.setHintVisible(false);
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (ctx.revisit) {
      rows.forEach((x) => { picks[x.r.id] = String(x.r.expect); x.opts.forEach((o) => o.setAttribute('aria-checked', String(o.dataset.v === String(x.r.expect)))); });
      update();
      zones.setFeedback({ state: 'neutral', tone: 'correct', text: screen.feedback.done });
      ctx.unlockNext({ focus: false });
    } else {
      update();
      ctx.need(ui.footer.need.gauge);
    }
    return { unmount() {} };
  },
};
