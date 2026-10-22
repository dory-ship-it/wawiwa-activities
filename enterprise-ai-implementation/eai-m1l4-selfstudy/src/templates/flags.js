// Flags template (NL3, built by analogy with S05b: no frame yet), on the Focus wash, no panel. The
// S05b board: a white figure card on the left, the flags in a tray on the right (smaller sort-deck
// cards: grip, flag, name), the off-panel strip under the tray. The flags are dragged onto drop
// targets in the card (src/drag.js: pointer, click, keyboard 1 to n + Enter). Variants:
//   map   (S12)  the full HR map: the eight fields in two columns, each field a drop target. Two
//                identical risk flags, each onto one of the fields that show the handoff risk (any
//                order). A right drop: the field turns solid teal with the flag and a check, that
//                field's line in the strip; a wrong drop: the flag returns, still picked up, with the
//                field's line. Both placed: the closing line, Next.
//   line  (S13)  the process line: five numbered steps joined by arrows, a "Drop here" slot above each.
//                A Start flag and an End flag, each with its own step; a wrong drop returns the flag,
//                still picked up, with that flag's line for that step (or its general line).
// Tracking: one interaction when the last flag is placed, from each flag's FIRST drop:
//   choice (map)     the first fields, in number order ("4,7"), correct only if both were right
//   matching (line)  the flag's one-character code and its first step ("s.1,e.5"), SCORM 1.2 matching
import { h, fmt } from '../util.js';
import { glyph } from '../icons.js';
import { layout } from './stage.js';
import { dragDrop } from '../drag.js';

export const flags = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const map = screen.variant === 'map';
    const trackingId = screen.tracking[0].id;
    const type = screen.tracking[0].type;
    const first = {};

    /* ---- the figure card and its drop targets ---- */
    let card, targets;
    if (map) {
      const rows = screen.map.map((f) => {
        const el = h('div', { class: 'w-target w-map-field', dataset: { target: String(f.n) } },
          h('span', { class: 'w-step-n', 'aria-hidden': 'true' }, String(f.n)),
          h('div', { class: 'w-map-text' }, h('b', {}, f.title), h('span', {}, f.text)));
        return { id: String(f.n), el, chip: null, name: fmt(ui.drag.fieldName, { n: f.n, title: f.title }), f };
      });
      // two columns: Fields 1 to 4, then 5 to 8 (the reading order follows the numbers)
      const half = Math.ceil(rows.length / 2);
      card = h('div', { class: 'w-map-card' }, h('div', { class: 'w-map-col' }, rows.slice(0, half).map((r) => r.el)), h('div', { class: 'w-map-col' }, rows.slice(half).map((r) => r.el)));
      targets = rows;
    } else {
      const steps = screen.line.map((s) => {
        const chip = h('span', { class: 'w-target-chip', 'aria-hidden': 'true' }, screen.dropLabel);
        const el = h('div', { class: 'w-target w-line-slot', dataset: { target: String(s.n) } }, chip);
        const box = h('div', { class: 'w-line-step' }, h('span', { class: 'w-step-n', 'aria-hidden': 'true' }, String(s.n)), h('span', {}, s.text));
        return { id: String(s.n), el, chip, box, name: fmt(ui.drag.stepName, { n: s.n, text: s.text }) };
      });
      const row = [];
      steps.forEach((s, i) => row.push(i ? h('span', { class: 'w-line-arrow', 'aria-hidden': 'true' }, glyph('g-arrow', { size: 23.04 })) : null,
        h('div', { class: 'w-line-cell' }, s.el, s.box)));
      card = h('div', { class: 'w-line-card' }, h('div', { class: 'w-line' }, row.filter(Boolean)));
      targets = steps;
    }
    card.setAttribute('role', 'group');
    card.setAttribute('aria-labelledby', 'w-instruction');

    /* ---- the flags ---- */
    const live = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const helpId = 'w-flags-help';
    const flagName = (f, i) => f.text || fmt(ui.drag.flagName, { item: screen.flagLabel, i: i + 1, n: screen.flags.length });
    const cards = screen.flags.map((f, i) => h('button', { class: 'w-label-card w-flag-card', type: 'button', 'aria-pressed': 'false', 'aria-describedby': helpId, 'aria-label': flagName(f, i), dataset: { flag: f.id } },
      glyph('g-grip', { size: 12.8, className: 'w-grip' }), glyph('start', { size: 25.6, className: 'w-flag-icon' }), h('span', {}, f.text || screen.flagLabel)));
    const byCard = new Map(cards.map((c, i) => [c, screen.flags[i]]));
    const tray = h('div', { class: 'w-label-tray w-flag-tray', role: 'group', 'aria-labelledby': 'w-instruction' }, cards);
    const dd = dragDrop({ ui, live, targets, nameOf: (c) => c.getAttribute('aria-label'), onDrop: (c, tid) => dropOn(c, tid), picked: ui.drag.pickedPlace });
    cards.forEach((c) => dd.add(c));

    layout(ctx, 'flags',
      h('div', { class: 'w-task-head w-task-head-col' }, screen.context ? h('p', { class: 'w-context' }, screen.context) : null, zones.instruction),
      h('div', { class: 'w-board w-board-flags', dataset: { interaction: '', variant: screen.variant } },
        card,
        h('div', { class: 'w-flag-side' }, tray, h('div', { class: 'w-float w-float-side' }, zones.band)),
        h('span', { class: 'w-sr-only', id: helpId }, fmt(ui.drag[screen.dragHelp], { n: targets.length })), live));
    zones.setHintVisible(false); // as on S05b: the hint stays for screen readers
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const isRight = (f, tid) => (map ? !!screen.map.find((x) => String(x.n) === tid)?.correct : f.target === tid);
    const lineFor = (f, tid) => (map ? screen.map.find((x) => String(x.n) === tid).feedback : f.feedback[tid] || f.feedback.other);
    function place(f, t) {
      t.el.dataset.placed = 'true';
      t.el.inert = true;
      const chip = h('span', { class: 'w-target-placed' }, h('span', { class: 'w-placed-disc w-placed-disc-s' }, glyph('g-check-b', { size: 12.8 })), f.text || screen.flagLabel);
      if (t.chip) t.chip.replaceWith(chip); else t.el.append(chip);
      t.chip = chip;
      const c = cards[screen.flags.indexOf(f)];
      c.hidden = true;
      placed.add(f.id);
    }
    const placed = new Set();
    const left = () => screen.flags.length - placed.size;
    function dropOn(c, tid) {
      const f = byCard.get(c);
      if (!(f.id in first)) first[f.id] = tid;
      if (!isRight(f, tid)) { zones.setFeedback({ state: 'wrong', text: lineFor(f, tid) }); return 'kept'; }
      place(f, targets.find((t) => t.id === tid));
      if (left()) {
        // the first flag in place: the field's own line (map), or the verdict alone (line)
        zones.setFeedback(map ? { state: 'correct', verdict: '', text: lineFor(f, tid) } : { state: 'correct' });
        tray.querySelector('.w-flag-card:not([hidden])').focus({ preventScroll: true });
        return 'placed';
      }
      const response = type === 'matching' ? screen.flags.map((x) => `${x.code}.${first[x.id]}`).join(',')
        : screen.flags.map((x) => Number(first[x.id])).sort((a, b) => a - b).join(',');
      const right = screen.flags.every((x) => isRight(x, first[x.id])) && new Set(screen.flags.map((x) => first[x.id])).size === screen.flags.length;
      ctx.answer({ trackingId, response, result: right ? 'correct' : 'wrong' });
      done(true);
      return 'placed';
    }
    function done(focus) {
      zones.setFeedback({ state: 'correct', verdict: '', text: screen.feedbackCorrect }); // as the drops on S04 and S05b: the line alone
      ctx.complete();
      ctx.unlockNext({ focus });
    }

    if (ctx.revisit) {
      const keys = map ? screen.map.filter((x) => x.correct).map((x) => String(x.n)) : screen.flags.map((f) => f.target);
      screen.flags.forEach((f, i) => place(f, targets.find((t) => t.id === keys[i])));
      done(false);
    }
    return { unmount() {} };
  },
};
