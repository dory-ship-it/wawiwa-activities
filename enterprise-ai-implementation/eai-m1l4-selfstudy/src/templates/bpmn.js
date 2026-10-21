// BPMN template (NL2, frames S05a and S05b): the HR process as a BPMN diagram on a white figure card,
// drawn from content.diagrams (lanes, nodes, edges), on the Focus wash. Variants:
//   key    (S05a)  the K1 head (pill, h1, one line); the diagram with numbered navy markers, which
//                  appear one by one (none with reduced motion); the key on the right. Presentation
//                  screen: not tracked, Next never locked.
//   label  (S05b)  the task head (instruction, Show me); the same diagram with dashed "Drop here"
//                  targets; the labels (smaller sort-deck cards) in a tray on the right, dragged onto
//                  the targets (src/drag.js: pointer, click, keyboard 1 to 3 + Enter). A right drop: the
//                  target turns solid teal and shows the label with a check, the label leaves the tray;
//                  a wrong drop: the label returns, still picked up, with its wrong line in the
//                  off-panel strip under the tray. Ghost hand (first use): it grabs the first label
//                  and stops before the diagram; Show me replays it.
// Geometry in diagram units (the frames' 0.1cqw: 600 x 254 units = 768 x 325.12 stage px): lane rows
// 74 high from 16, node columns 97.5 apart from 145, step boxes 84 x 42, events r 14, gateway 22.
// Tracking (label): one matching interaction when the last label is placed; the response records
// each label's FIRST target ("swimlane.a,gateway.b,event.c"), correct only if every first drop was.
import { h, fmt } from '../util.js';
import { glyph } from '../icons.js';
import { layout } from './stage.js';
import { dragDrop } from '../drag.js';

const U = 1.28; // stage px per diagram unit
const G = { W: 600, H: 254, PAD: 16, LANE: 74, HEAD: 96, X0: 145, PITCH: 97.5, STEP_W: 84, STEP_H: 42, R: 14, GATE: 22 };
const px = (u) => u * U + 'px';
const SVG = 'http://www.w3.org/2000/svg';

// the diagram card: { el, box } (box = the positioned layer for markers and targets)
export function diagram(dg) {
  const laneY = Object.fromEntries(dg.lanes.map((l, i) => [l.id, G.PAD + i * G.LANE + G.LANE / 2]));
  const pos = Object.fromEntries(dg.nodes.map((n) => [n.id, { x: G.X0 + n.col * G.PITCH, y: laneY[n.lane], n }]));
  const half = (n) => (n.kind === 'step' ? [G.STEP_W / 2, G.STEP_H / 2] : n.kind === 'gateway' ? [G.GATE, G.GATE] : [G.R, G.R + (n.kind === 'end' ? 2 : 0)]);
  // flows: h = straight across, vh = down or up first then across, hv = across first then up or down
  // (to the target's edge, or to the y of the node named by joinAt, where it meets another flow)
  const path = (e) => {
    const a = pos[e.from], b = pos[e.to], [ahw, ahh] = half(a.n), [bhw, bhh] = half(b.n);
    if (e.route === 'vh') return `M${a.x} ${a.y + (b.y > a.y ? ahh : -ahh)}V${b.y}H${b.x - bhw}`;
    if (e.route === 'hv') {
      const end = e.joinAt ? pos[e.joinAt].y : b.y + (b.y > a.y ? -bhh : bhh);
      return `M${a.x + ahw} ${a.y}H${b.x}V${end}`;
    }
    return `M${a.x + ahw} ${a.y}H${b.x - bhw}`;
  };
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'w-bpmn-svg');
  svg.setAttribute('viewBox', `0 0 ${G.W} ${G.H}`);
  svg.setAttribute('aria-hidden', 'true');
  const shapes = dg.nodes.map((n) => {
    const { x, y } = pos[n.id];
    if (n.kind === 'start' || n.kind === 'end') return `<circle cx="${x}" cy="${y}" r="${G.R}" class="w-bpmn-shape" stroke-width="${n.kind === 'end' ? 6 : 2.4}"/>`;
    if (n.kind === 'gateway') return `<path d="M${x} ${y - G.GATE}l${G.GATE} ${G.GATE}-${G.GATE} ${G.GATE}-${G.GATE}-${G.GATE}z" class="w-bpmn-shape" stroke-width="2.4"/>`;
    return '';
  }).join('');
  svg.innerHTML = '<defs><marker id="w-bpmn-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="w-bpmn-head"/></marker></defs>'
    + `<g class="w-bpmn-flows">${dg.edges.map((e) => `<path d="${path(e)}" marker-end="url(#w-bpmn-ah)"/>`).join('')}</g>${shapes}`;

  const at = (el, x, y, w = null) => { Object.assign(el.style, { left: px(x), top: px(y) }); if (w !== null) el.style.width = px(w); return el; };
  const lanes = dg.lanes.map((l, i) => at(h('div', { class: 'w-bpmn-lane', dataset: { tint: l.tint ? 'true' : 'false' } }, h('span', { class: 'w-bpmn-lane-label' }, l.label)), G.PAD, G.PAD + i * G.LANE, G.W - 2 * G.PAD));
  const rule = at(h('i', { class: 'w-bpmn-rule' }), G.HEAD, G.PAD);
  rule.style.height = px(dg.lanes.length * G.LANE);
  const labels = dg.nodes.flatMap((n) => {
    const { x, y } = pos[n.id];
    if (n.kind === 'step') return [at(h('div', { class: 'w-bpmn-step' }, n.label), x - G.STEP_W / 2, y - G.STEP_H / 2, G.STEP_W)];
    // labels beside the nodes, never on a flow: the start's right of its circle, the end's above it,
    // the gateway's under its right half
    if (n.kind === 'start') return [at(h('span', { class: 'w-bpmn-label' }, n.label), x + G.R + 4, y - 7.5, 90)];
    if (n.kind === 'end') return [at(h('span', { class: 'w-bpmn-label w-bpmn-label-c' }, n.label), x - 45, y - 32, 90)];
    return [at(h('span', { class: 'w-bpmn-label' }, n.label), x + 8, y + G.GATE, 90)];
  });
  const branches = dg.edges.filter((e) => e.label).map((e) => at(h('span', { class: 'w-bpmn-branch' }, e.label), pos[e.from].x + e.labelAt[0], pos[e.from].y + e.labelAt[1]));
  const box = h('div', { class: 'w-bpmn', role: 'img', 'aria-label': dg.alt }, lanes, rule, svg, labels, branches);
  return { el: box, box };
}

export const bpmn = {
  mount(ctx) {
    return (ctx.screen.variant === 'label' ? labelTask : keyIdea)(ctx) || { unmount() {} };
  },
};

/* ---------- key (S05a) ---------- */
function keyIdea(ctx) {
  const { screen, content, zones } = ctx;
  const d = diagram(content.diagrams[screen.diagram]);
  screen.key.forEach((k, i) => {
    const m = h('span', { class: 'w-bpmn-marker', 'aria-hidden': 'true' }, String(k.n));
    Object.assign(m.style, { left: px(k.marker[0]), top: px(k.marker[1]), animationDelay: 300 + i * 450 + 'ms' });
    d.box.append(m);
  });
  const keyList = h('ol', { class: 'w-bpmn-key' }, screen.key.map((k) => {
    const c = k.text.indexOf(': ');
    return h('li', {}, h('span', { class: 'w-bpmn-key-n', 'aria-hidden': 'true' }, String(k.n)),
      h('p', {}, h('b', {}, k.text.slice(0, c + 1)), ' ' + k.text.slice(c + 2)));
  }));
  layout(ctx, 'bpmn-key',
    h('div', { class: 'w-focus-head' },
      h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)),
      zones.instruction,
      h('p', { class: 'w-concept-text' }, screen.text)),
    h('div', { class: 'w-board w-board-key' }, d.el, keyList));
}

/* ---------- label (S05b) ---------- */
function labelTask(ctx) {
  const { screen, ui, content, zones } = ctx;
  const trackingId = screen.tracking[0].id;
  const d = diagram(content.diagrams[screen.diagram]);
  const first = {};
  let left = screen.labels.length;

  const targets = screen.targets.map((t) => {
    const el = h('div', { class: 'w-target', dataset: { target: t.id } });
    Object.assign(el.style, { left: px(t.rect[0]), top: px(t.rect[1]), width: px(t.rect[2]), height: px(t.rect[3]) });
    const chip = h('span', { class: 'w-target-chip', 'aria-hidden': 'true' }, screen.dropLabel);
    Object.assign(chip.style, { left: px(t.chip[0]), top: px(t.chip[1]) });
    d.box.append(el, chip);
    return { id: t.id, el, chip, name: t.name };
  });
  const live = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
  const helpId = 'w-label-help';
  const cards = screen.labels.map((l) => h('button', { class: 'w-label-card', type: 'button', 'aria-pressed': 'false', 'aria-describedby': helpId, dataset: { label: l.id } },
    glyph('g-grip', { size: 12.8, className: 'w-grip' }), h('span', {}, l.text)));
  const tray = h('div', { class: 'w-label-tray', role: 'group', 'aria-labelledby': 'w-instruction' }, cards);
  const byCard = new Map(cards.map((c, i) => [c, screen.labels[i]]));
  const dd = dragDrop({ ui, live, targets, nameOf: (c) => byCard.get(c).text, onDrop: (c, tid) => dropOn(c, tid) });
  cards.forEach((c) => dd.add(c));

  // the ghost hand: it grabs the first label (its right part) and stops before the diagram
  const g = !ctx.revisit && screen.ghost ? ctx.ghost({ type: screen.ghost.type,
    steps: () => {
      const k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
      const c = tray.querySelector('.w-label-card:not([hidden])');
      if (!c) return [];
      const r = c.getBoundingClientRect();
      const grab = { x: r.left + 0.8725 * r.width, y: r.top + 0.39 * r.height };
      return [{ point: () => grab, carry: c, hold: 120 }, { point: () => ({ x: grab.x - 40 * k, y: grab.y + 24 * k }), hold: 700 }];
    } }) : null;

  layout(ctx, 'bpmn-label',
    h('div', { class: 'w-task-head' }, zones.instruction, g && screen.ghost.showMe ? g.button : null),
    h('div', { class: 'w-board w-board-label', dataset: { interaction: '' } },
      d.el, tray, h('span', { class: 'w-sr-only', id: helpId }, fmt(ui.drag.helpPlaces, { n: targets.length })), live,
      h('div', { class: 'w-float w-float-tray' }, zones.band)));
  zones.setHintVisible(false); // the frame shows no hint line: the hint stays for screen readers
  zones.setFeedback({ state: 'hint', text: screen.hint });

  function place(l, t) {
    t.el.dataset.placed = 'true';
    t.el.inert = true;
    t.chip.className = 'w-target-placed';
    t.chip.replaceChildren(h('span', { class: 'w-placed-disc w-placed-disc-s' }, glyph('g-check-b', { size: 12.8 })), l.text);
    t.chip.removeAttribute('aria-hidden');
    const c = cards[screen.labels.indexOf(l)];
    c.hidden = true;
    left -= 1;
  }
  function dropOn(c, tid) {
    const l = byCard.get(c);
    if (!(l.id in first)) first[l.id] = tid;
    if (tid !== l.target) { zones.setFeedback({ state: 'wrong', text: l.feedback.wrong }); return 'kept'; }
    place(l, targets.find((t) => t.id === tid));
    zones.setFeedback({ state: 'correct', verdict: '', text: l.feedback.correct });
    if (left) { tray.querySelector('.w-label-card:not([hidden])').focus({ preventScroll: true }); return 'placed'; }
    ctx.answer({ trackingId, response: screen.labels.map((x) => `${x.id}.${first[x.id]}`).join(','), result: screen.labels.every((x) => first[x.id] === x.target) ? 'correct' : 'wrong' });
    ctx.complete();
    ctx.unlockNext({ focus: true });
    return 'placed';
  }

  if (ctx.revisit) {
    screen.labels.forEach((l) => place(l, targets.find((t) => t.id === l.target)));
    const last = screen.labels[screen.labels.length - 1];
    zones.setFeedback({ state: 'correct', verdict: '', text: last.feedback.correct });
    ctx.unlockNext({ focus: false });
  }
}
