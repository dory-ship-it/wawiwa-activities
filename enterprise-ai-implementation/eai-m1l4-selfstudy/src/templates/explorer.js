// Explorer template, layout "wide". Variants:
//   diagram (S05)  a swimlane diagram drawn from the content (lanes, start / end events, step boxes,
//                  the gateway diamond, orthogonal flows) is the stage. Every part is a hotspot button:
//                  the key one ends the search (band right, all hotspots locked), the others give their
//                  feedback (band wrong, retry). Three legend buttons under the diagram open their
//                  glossary text in place. Next unlocks once the key is found and all three were opened.
//   tiles   (S07)  a 2 x 4 grid of numbered tiles that flip in place, one open at a time. After all
//                  eight were opened the question appears and the tiles become answer buttons (one
//                  question, wrong = retry, right = Next). Before that the question row is a lock icon
//                  with the content's aria-label.
// Tracking: diagram = the hotspot id of the first part chosen ("gateway", "lane", "event", "step");
// tiles = the field number of the first answer. Retries as retry events.
import { h, nextId } from '../util.js';
import { icon } from '../icons.js';
import { layout, ruleLabel, arrowNav } from './stage.js';

export const explorer = {
  mount(ctx) {
    const run = { diagram, tiles }[ctx.screen.variant];
    if (!run) throw new Error('explorer: unknown variant ' + ctx.screen.variant);
    run(ctx);
    return { unmount() {} };
  },
};

const mark = (el, result, ui) => {
  el.dataset.result = result;
  const m = el.querySelector(':scope > .w-opt-mark');
  if (m) m.replaceChildren(result === 'correct' ? icon('check', { size: 16, label: ui.feedback.correctPrefix }) : result === 'wrong' ? icon('x', { size: 16, label: ui.feedback.wrongPrefix }) : '');
};

/* ---------- diagram (S05) ---------- */
// Geometry in stage px inside the diagram box (width 1088): a lane-name column, then equal node
// columns; every node of a lane sits on the lane's centre line.
const D = { W: 1088, HEAD: 120, LANE: 88, STEP_W: 150, STEP_H: 48, GATE: 48, EVENT: 32 };
const HOTSPOT_OF = { gateway: 'gateway', start: 'event', end: 'event', step: 'step', lane: 'lane' };

function diagram(ctx) {
  const { screen, ui, zones } = ctx;
  const dg = screen.diagram;
  const trackingId = screen.tracking[0].id;
  const spots = Object.fromEntries(screen.hotspots.map((x) => [x.id, x]));
  const laneIndex = Object.fromEntries(dg.lanes.map((l, i) => [l.id, i]));
  const nCols = Math.max(...dg.nodes.map((n) => n.col)) + 1;
  const colW = (D.W - D.HEAD) / nCols;
  const H = dg.lanes.length * D.LANE;
  const pos = Object.fromEntries(dg.nodes.map((n) => {
    const half = n.kind === 'step' ? [D.STEP_W / 2, D.STEP_H / 2] : n.kind === 'gateway' ? [D.GATE / 2, D.GATE / 2] : [D.EVENT / 2, D.EVENT / 2];
    return [n.id, { x: D.HEAD + (n.col + 0.5) * colW, y: laneIndex[n.lane] * D.LANE + D.LANE / 2, hw: half[0], hh: half[1] }];
  }));

  // flows: h = straight across, vh = vertical first then across, hv = across first then vertical
  const path = (e) => {
    const a = pos[e.from], b = pos[e.to];
    const down = b.y > a.y;
    if (e.route === 'vh') return `M${a.x} ${down ? a.y + a.hh : a.y - a.hh} V${b.y} H${b.x - b.hw}`;
    if (e.route === 'hv') return `M${a.x + a.hw} ${a.y} H${b.x} V${down ? b.y - b.hh : b.y + b.hh}`;
    return `M${a.x + a.hw} ${a.y} H${b.x - b.hw}`;
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-flows');
  svg.setAttribute('viewBox', `0 0 ${D.W} ${H}`);
  svg.setAttribute('width', D.W);
  svg.setAttribute('height', H);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><marker id="w-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="w-arrow-head"/></marker></defs>'
    + dg.edges.map((e) => `<path class="w-flow" d="${path(e)}" marker-end="url(#w-arrow)"/>`).join('');

  const hotspots = [];
  const lanes = dg.lanes.map((l, i) => {
    const head = h('button', { class: 'w-lane-head', type: 'button', dataset: { hotspot: 'lane', id: l.id } }, h('span', {}, l.label), h('span', { class: 'w-opt-mark' }));
    head.style.top = i * D.LANE + 'px';
    head.style.height = D.LANE + 'px';
    hotspots.push(head);
    const row = h('div', { class: 'w-lane', 'aria-hidden': 'true' });
    row.style.top = i * D.LANE + 'px';
    row.style.height = D.LANE + 'px';
    return [row, head];
  });
  const nodes = dg.nodes.map((n) => {
    const p = pos[n.id];
    const kind = HOTSPOT_OF[n.kind];
    let btn;
    if (n.kind === 'step') {
      btn = h('button', { class: 'w-node w-node-step', type: 'button', dataset: { hotspot: kind, id: n.id } }, h('span', {}, n.label), h('span', { class: 'w-opt-mark' }));
      Object.assign(btn.style, { left: p.x - p.hw + 'px', top: p.y - p.hh + 'px', width: D.STEP_W + 'px', height: D.STEP_H + 'px' });
      hotspots.push(btn);
      return btn;
    }
    if (n.kind === 'gateway') {
      const labelId = nextId('w-gate');
      const label = h('span', { class: 'w-node-label w-gate-label', id: labelId }, n.label);
      Object.assign(label.style, { left: p.x - 110 + 'px', top: p.y - p.hh - 22 + 'px' });
      btn = h('button', { class: 'w-node w-node-gateway', type: 'button', 'aria-labelledby': labelId, dataset: { hotspot: kind, id: n.id } },
        h('span', { class: 'w-diamond', 'aria-hidden': 'true' }), h('span', { class: 'w-opt-mark' }));
      Object.assign(btn.style, { left: p.x - p.hw + 'px', top: p.y - p.hh + 'px', width: D.GATE + 'px', height: D.GATE + 'px' });
      hotspots.push(btn);
      return [label, btn];
    }
    // start / end event: the button covers its label (above, so flows can enter from below) and the circle
    btn = h('button', { class: 'w-node w-node-event', type: 'button', dataset: { hotspot: kind, id: n.id, end: n.kind === 'end' ? 'true' : 'false' } },
      h('span', { class: 'w-node-label' }, n.label), h('span', { class: 'w-event-circle', 'aria-hidden': 'true' }), h('span', { class: 'w-opt-mark' }));
    Object.assign(btn.style, { left: p.x - 64 + 'px', top: p.y - p.hh - 22 + 'px', width: '128px' });
    hotspots.push(btn);
    return btn;
  });
  const box = h('div', { class: 'w-diagram', role: 'group', 'aria-labelledby': 'w-instruction' }, lanes.map((x) => x[0]), svg, lanes.map((x) => x[1]), nodes.flat());
  box.style.height = H + 'px';
  arrowNav(box, { selector: '[data-hotspot]' });

  // legend: three disclosure buttons, the glossary text opens in place (space reserved)
  const opened = new Set();
  const legend = screen.legend.map((g) => {
    const textId = nextId('w-legend');
    const btn = h('button', { class: 'w-legend-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': textId, dataset: { legend: g.id } },
      icon(g.icon, { size: 20, className: 'w-legend-icon' }), h('span', { class: 'w-legend-label' }, g.label), h('span', { class: 'w-legend-state' }, icon('chevron-right', { size: 18 })));
    const text = h('p', { class: 'w-legend-text', id: textId, dataset: { open: 'false' } }, g.text);
    const toggle = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      text.dataset.open = String(open); // closed text keeps its space (visibility only): nothing below moves
      if (open) { opened.add(g.id); btn.dataset.seen = 'true'; btn.querySelector('.w-legend-state').replaceChildren(icon('check', { size: 18 })); }
    };
    btn.addEventListener('click', () => { toggle(btn.getAttribute('aria-expanded') !== 'true'); check(true); });
    return { g, btn, text, toggle, el: h('div', { class: 'w-legend-item' }, btn, text) };
  });

  layout(ctx, 'wide', zones.logo,
    h('div', { class: 'w-wide' },
      zones.instruction,
      h('div', { class: 'w-explore', dataset: { interaction: '' } },
        ruleLabel(dg.tag, 'w-tag'),
        box,
        h('div', { class: 'w-legend' }, legend.map((x) => x.el))),
      zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  let found = false, unlocked = false, last = null;
  function check(focus) {
    if (unlocked || !found || opened.size < legend.length) return;
    unlocked = true;
    ctx.complete();
    ctx.unlockNext({ focus });
  }
  hotspots.forEach((btn) => btn.addEventListener('click', () => {
    if (found || btn === last) return; // the same wrong part again is not a new attempt
    const spot = spots[btn.dataset.hotspot];
    ctx.answer({ trackingId, response: spot.id, result: spot.correct ? 'correct' : 'wrong' });
    hotspots.forEach((x) => mark(x, '', ui));
    last = btn;
    if (!spot.correct) { mark(btn, 'wrong', ui); zones.setFeedback({ state: 'wrong', text: spot.feedback }); return; }
    found = true;
    mark(btn, 'correct', ui);
    hotspots.forEach((x) => x.setAttribute('aria-disabled', 'true'));
    zones.setFeedback({ state: 'correct', text: spot.feedback });
    check(true);
  }));

  if (ctx.revisit) {
    const key = hotspots.find((x) => spots[x.dataset.hotspot].correct);
    found = true;
    last = key;
    mark(key, 'correct', ui);
    hotspots.forEach((x) => x.setAttribute('aria-disabled', 'true'));
    legend.forEach((x) => x.toggle(true));
    zones.setFeedback({ state: 'correct', text: spots[key.dataset.hotspot].feedback });
    check(false);
  }
}

/* ---------- tiles (S07) ---------- */
function tiles(ctx) {
  const { screen, ui, zones } = ctx;
  const trackingId = screen.tracking[0].id;
  const visited = new Set();
  let phase = 'explore', solved = false, chosen = -1;

  const list = screen.tiles.map((t) => {
    const front = h('span', { class: 'w-tile-face w-tile-front' }, h('span', { class: 'w-tile-num' }, String(t.n)), h('span', { class: 'w-tile-title' }, t.title));
    const back = h('span', { class: 'w-tile-face w-tile-back', 'aria-hidden': 'true' }, h('span', { class: 'w-tile-num' }, String(t.n)), h('span', { class: 'w-tile-text' }, t.back));
    const seen = h('span', { class: 'w-tile-seen', 'aria-hidden': 'true' });
    const btn = h('button', { class: 'w-tile', type: 'button', 'aria-expanded': 'false', dataset: { n: String(t.n) } },
      h('span', { class: 'w-tile-inner' }, front, back), seen, h('span', { class: 'w-opt-mark' }));
    return { t, btn, front, back, seen };
  });
  const flip = (x, open) => {
    x.btn.dataset.open = String(open);
    if (phase === 'explore') x.btn.setAttribute('aria-expanded', String(open));
    x.front.setAttribute('aria-hidden', String(open));
    x.back.setAttribute('aria-hidden', String(!open));
  };
  const grid = h('div', { class: 'w-tiles', role: 'group', 'aria-labelledby': 'w-instruction' }, list.map((x) => x.btn));
  arrowNav(grid, { selector: '.w-tile', cols: 4 });

  const lock = h('span', { class: 'w-question-lock', role: 'img', 'aria-label': screen.lockedLabel }, icon('lock', { size: 22 }));
  const question = h('p', { class: 'w-question-text', id: nextId('w-question'), hidden: true }, screen.question);
  const qRow = h('div', { class: 'w-question-row', 'aria-live': 'polite' }, lock, question);

  layout(ctx, 'wide', zones.logo,
    h('div', { class: 'w-wide' }, zones.instruction, h('div', { class: 'w-tiles-task', dataset: { interaction: '' } }, grid, qRow), zones.band));
  zones.setFeedback({ state: 'hint', text: screen.hint });

  const unlock = () => {
    phase = 'answer';
    lock.hidden = true;
    question.hidden = false;
    grid.setAttribute('aria-labelledby', question.id);
    list.forEach((x) => x.btn.removeAttribute('aria-expanded'));
  };
  const toFront = () => list.forEach((x) => flip(x, false));

  list.forEach((x, i) => x.btn.addEventListener('click', () => {
    if (phase === 'explore') {
      const open = x.btn.dataset.open !== 'true';
      list.forEach((y) => { if (y !== x) flip(y, false); });
      flip(x, open);
      if (open && !visited.has(x.t.n)) {
        visited.add(x.t.n);
        x.btn.dataset.seen = 'true';
        x.seen.replaceChildren(icon('check', { size: 16 }));
      }
      if (visited.size === list.length) unlock(); // the last tile stays open to read; any click now answers
      return;
    }
    if (solved || i === chosen) return;
    toFront();
    chosen = i;
    const right = !!x.t.correct;
    ctx.answer({ trackingId, response: String(x.t.n), result: right ? 'correct' : 'wrong' });
    list.forEach((y) => mark(y.btn, y === x ? (right ? 'correct' : 'wrong') : '', ui));
    if (!right) { zones.setFeedback({ state: 'wrong', text: x.t.feedback }); return; }
    solved = true;
    list.forEach((y) => y.btn.setAttribute('aria-disabled', 'true'));
    zones.setFeedback({ state: 'correct', text: x.t.feedback });
    ctx.complete();
    ctx.unlockNext({ focus: true });
  }));

  list.forEach((x) => flip(x, false));
  if (ctx.revisit) {
    list.forEach((x) => { visited.add(x.t.n); x.btn.dataset.seen = 'true'; x.seen.replaceChildren(icon('check', { size: 16 })); });
    unlock();
    const k = list.findIndex((x) => x.t.correct);
    solved = true;
    chosen = k;
    mark(list[k].btn, 'correct', ui);
    list.forEach((y) => y.btn.setAttribute('aria-disabled', 'true'));
    zones.setFeedback({ state: 'correct', text: list[k].t.feedback });
    ctx.unlockNext({ focus: false });
  }
}
