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
import { h, fmt, reducedMotion } from '../util.js?v=e59b9691';
import { glyph } from '../icons.js?v=e59b9691';
import { layout } from './stage.js?v=e59b9691';
import { dragDrop } from '../drag.js?v=e59b9691';
// (FX5: no Check here any more)
// import { checkButton } from './decision.js?v=e59b9691';

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
      // FX4 (Dor): no separate "Drop here" slots; the whole step (its flag place above the box, and the
      // box) is one large drop target. An empty, invisible placeholder keeps the flag's place.
      const steps = screen.line.map((s) => {
        const chip = h('span', { class: 'w-target-chip w-target-empty', 'aria-hidden': 'true' });
        const box = h('div', { class: 'w-line-step' }, h('span', { class: 'w-step-n', 'aria-hidden': 'true' }, String(s.n)), h('span', {}, s.text));
        const el = h('div', { class: 'w-target w-line-cell', dataset: { target: String(s.n) } }, h('div', { class: 'w-line-slot' }, chip), box);
        return { id: String(s.n), el, chip, box, name: fmt(ui.drag.stepName, { n: s.n, text: s.text }) };
      });
      const row = [];
      steps.forEach((s, i) => row.push(i ? h('span', { class: 'w-line-arrow', 'aria-hidden': 'true' }, glyph('g-arrow', { size: 23.04 })) : null, s.el));
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

    // FX1 B1: the ghost hand grabs the first flag in the tray and drags it toward the card, stopping
    // before it gets there (it drops nothing, points at no field or step); "Show me how" replays it
    const g = !ctx.revisit ? ctx.ghost({ type: screen.ghost?.type || 'flag',
      steps: () => {
        const c = cards.find((x) => !x.hidden);
        if (!c) return [];
        const r = c.getBoundingClientRect(), b = card.getBoundingClientRect();
        const grab = { x: r.left + 0.8 * r.width, y: r.top + 0.45 * r.height };
        // 55% of the way to the card's right edge, level with the flag: it ends in the gap beside the card
        const aim = { x: b.right + (grab.x - b.right) * 0.45, y: grab.y };
        return [{ point: () => grab, carry: c, hold: 120 }, { point: () => aim, hold: 800 }];
      } }) : null;

    layout(ctx, 'flags',
      h('div', { class: 'w-task-head' }, h('div', {}, screen.context ? h('p', { class: 'w-context' }, screen.context) : null, zones.instruction), h('span', { class: 'w-head-tools' }, g ? g.button : null)),
      h('div', { class: 'w-board w-board-flags', dataset: { interaction: '', variant: screen.variant } },
        card,
        h('div', { class: 'w-flag-side' }, tray, h('div', { class: 'w-float w-float-side' }, zones.band)),
        h('span', { class: 'w-sr-only', id: helpId }, fmt(ui.drag[screen.dragHelp], { n: targets.length })), live));
    zones.setHintVisible(false); // as on S05b: the hint stays for screen readers
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const isRight = (f, tid) => (map ? !!screen.map.find((x) => String(x.n) === tid)?.correct : f.target === tid);
    const lineFor = (f, tid) => (map ? screen.map.find((x) => String(x.n) === tid).feedback : f.feedback[tid] || f.feedback.other);
    // FX5 (Noy, 8 Nov 2026): every drop is judged at once, as the sort; no Check. A right drop: the
    // target turns solid teal with the flag and a check, and its line; a wrong one: red with a cross for
    // a moment, then the flag goes back to the tray, and the line says why. A flag dropped wrong twice
    // moves to a right place (dashed). A click on a field or a step places the next flag in the tray (no
    // need to pick it up first; dragging works as before).
    const at = {}, misses = {};
    let over = false;
    function place(f, t, state) {
      t.el.dataset.placed = state;
      t.el.inert = true;
      const chip = h('span', { class: 'w-target-placed', dataset: { state } }, h('span', { class: 'w-placed-disc w-placed-disc-s' }, glyph(state === 'wrong' ? 'g-cross' : 'g-check-b', { size: 12.8 })), f.text || screen.flagLabel);
      if (t.chip) t.chip.replaceWith(chip); else t.el.append(chip);
      t.home = t.home || (t.chip && t.chip.classList.contains('w-target-chip') ? t.chip : null);
      t.chip = chip;
      cards[screen.flags.indexOf(f)].hidden = true;
      at[f.id] = t.id;
      markActive();
    }
    function unplace(f) {
      const t = targets.find((x) => x.id === at[f.id]);
      delete t.el.dataset.placed;
      t.el.inert = false;
      if (t.home) { t.chip.replaceWith(t.home); t.chip = t.home; } else { t.chip.remove(); t.chip = null; }
      cards[screen.flags.indexOf(f)].hidden = false;
      delete at[f.id];
      markActive();
    }
    const inTray = () => cards.filter((c) => !c.hidden);
    // the next flag a click places is marked in the tray, and the targets show they can take it
    function markActive() {
      const next = over ? null : inTray()[0];
      cards.forEach((c) => { c.dataset.active = String(c === next); });
      targets.forEach((x) => { x.el.dataset.ready = String(!!next && !x.el.inert); });
    }
    let lastDrop = 0; // (the click that ends a drag's or a picked flag's drop must not place a second flag)
    targets.forEach((x) => x.el.addEventListener('click', () => {
      if (over || x.el.inert || dd.picked() || performance.now() - lastDrop < 120) return;
      const next = inTray()[0];
      if (next) dropOn(next, x.id);
    }));
    // a free right place for a flag moved there after two misses (map: a key field nobody holds)
    const freeFor = (fl) => (map ? String(screen.map.find((x) => x.correct && !Object.values(at).includes(String(x.n))).n) : fl.target);
    function dropOn(c, tid) {
      if (over) return 'returned';
      lastDrop = performance.now();
      const fl = byCard.get(c);
      if (!(fl.id in first)) first[fl.id] = tid;
      const tg = targets.find((x) => x.id === tid);
      if (isRight(fl, tid)) {
        place(fl, tg, 'right');
        zones.setFeedback({ state: 'correct', text: lineFor(fl, tid) });
      } else if ((misses[fl.id] = (misses[fl.id] || 0) + 1) >= 2) {
        // (a flag still flashing red on that place goes back to the tray first)
        const to = freeFor(fl);
        const occ = screen.flags.find((x) => x !== fl && at[x.id] === to);
        if (occ) unplace(occ);
        place(fl, targets.find((x) => x.id === to), 'shown');
        zones.setFeedback({ state: 'neutral', verdict: ui.feedback.revealedPlaces, text: screen.feedbackCorrect });
      } else {
        place(fl, tg, 'wrong');
        zones.setFeedback({ state: 'wrong', text: lineFor(fl, tid) });
        setTimeout(() => { if (at[fl.id] === tid && tg.chip?.dataset.state === 'wrong') unplace(fl); }, reducedMotion() ? 0 : 750);
        return 'placed';
      }
      if (screen.flags.every((x) => at[x.id] && tgState(x) !== 'wrong')) done(true);
      else inTray()[0]?.focus({ preventScroll: true });
      return 'placed';
    }
    const tgState = (x) => targets.find((y) => y.id === at[x.id])?.el.dataset.placed;
    const responseOf = (pick) => (type === 'matching' ? screen.flags.map((x) => `${x.code}.${pick[x.id]}`).join(',')
      : screen.flags.map((x) => Number(pick[x.id])).sort((p, q) => p - q).join(','));
    const allRight = (pick) => screen.flags.every((x) => isRight(x, pick[x.id])) && new Set(screen.flags.map((x) => pick[x.id])).size === screen.flags.length;
    function done(focus) {
      over = true;
      markActive();
      if (!ctx.revisit) {
        const clean = allRight(first);
        ctx.answer({ trackingId, response: responseOf(first), result: clean ? 'correct' : 'wrong' });
        if (!clean) ctx.answer({ trackingId, response: responseOf(at), result: 'correct' });
        zones.setFeedback(clean ? { state: 'correct', verdict: '', text: screen.feedbackCorrect } : { state: 'neutral', verdict: ui.feedback.revealedPlaces, text: screen.feedbackCorrect });
      } else zones.setFeedback({ state: 'correct', verdict: '', text: screen.feedbackCorrect });
      ctx.complete();
      ctx.unlockNext({ focus });
    }
    markActive();

    if (ctx.revisit) {
      const keys = map ? screen.map.filter((x) => x.correct).map((x) => String(x.n)) : screen.flags.map((f) => f.target);
      screen.flags.forEach((f, i) => place(f, targets.find((t) => t.id === keys[i]), 'right'));
      done(false);
    }
    return { unmount() {} };
  },
};
