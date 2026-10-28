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
import { h, fmt } from '../util.js?v=6b628c2e';
import { glyph } from '../icons.js?v=6b628c2e';
import { layout } from './stage.js?v=6b628c2e';
import { dragDrop } from '../drag.js?v=6b628c2e';
import { checkButton } from './decision.js?v=6b628c2e';

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
    // FX1 E2 (B2): every drop places the flag as it is (no mark); with the tray empty, Check: the right
    // flags turn solid teal with a check, the wrong ones go back to the tray, each with its line (shown
    // again when it is picked up); attempt 2 the same; after it the flags still wrong move to the right
    // places with a check, the closing line explains, and Next unlocks.
    // state: 'pending' | 'right' | 'shown' (the S05b states)
    const at = {};
    function place(f, t, state) {
      t.el.dataset.placed = state;
      t.el.inert = true;
      const chip = h('span', { class: 'w-target-placed', dataset: { state } }, state === 'pending' ? null : h('span', { class: 'w-placed-disc w-placed-disc-s' }, glyph('g-check-b', { size: 12.8 })), f.text || screen.flagLabel);
      if (t.chip) t.chip.replaceWith(chip); else t.el.append(chip);
      t.home = t.home || (t.chip && t.chip.classList.contains('w-target-chip') ? t.chip : null); // the line's "Drop here" chip
      t.chip = chip;
      cards[screen.flags.indexOf(f)].hidden = true;
      at[f.id] = t.id;
    }
    function unplace(f, line) {
      const t = targets.find((x) => x.id === at[f.id]);
      delete t.el.dataset.placed;
      t.el.inert = false;
      if (t.home) { t.chip.replaceWith(t.home); t.chip = t.home; } else { t.chip.remove(); t.chip = null; }
      const c = cards[screen.flags.indexOf(f)];
      c.hidden = false;
      c.dataset.line = line;
      delete at[f.id];
    }
    const max = ctx.revisit ? 0 : screen.attempts || 2;
    let tries = 0;
    const check = checkButton(ui, ui.buttons.check, () => doCheck());
    if (!ctx.revisit) { zones.setTool(check); zones.setAttempts(1, max); }
    const inTray = () => cards.filter((c) => !c.hidden);
    cards.forEach((c) => ['pointerdown', 'focus'].forEach((ev) => c.addEventListener(ev, () => { if (c.dataset.line && tries) zones.setFeedback({ state: 'wrong', text: c.dataset.line }); })));
    function dropOn(c, tid) {
      const f = byCard.get(c);
      if (!(f.id in first)) first[f.id] = tid;
      place(f, targets.find((t) => t.id === tid), 'pending');
      const next = inTray()[0];
      if (next) { next.focus({ preventScroll: true }); if (!tries) zones.setFeedback({ state: 'hint', text: screen.hint }); }
      else { check.disabled = false; zones.setFeedback({ state: 'hint', text: screen.hint }); check.focus({ preventScroll: true }); }
      return 'placed';
    }
    const responseOf = (pick) => (type === 'matching' ? screen.flags.map((x) => `${x.code}.${pick[x.id]}`).join(',')
      : screen.flags.map((x) => Number(pick[x.id])).sort((a, b) => a - b).join(','));
    const allRight = (pick) => screen.flags.every((x) => isRight(x, pick[x.id])) && new Set(screen.flags.map((x) => pick[x.id])).size === screen.flags.length;
    function doCheck() {
      if (inTray().length) return;
      tries += 1;
      const pick = { ...at };
      if (tries === 1) ctx.answer({ trackingId, response: responseOf(first), result: allRight(first) ? 'correct' : 'wrong' });
      else ctx.answer({ trackingId, response: responseOf(pick), result: allRight(pick) ? 'correct' : 'wrong' });
      const wrong = screen.flags.filter((f) => !isRight(f, pick[f.id]));
      screen.flags.filter((f) => !wrong.includes(f)).forEach((f) => place(f, targets.find((t) => t.id === pick[f.id]), 'right'));
      if (!wrong.length) { done(true); return; }
      if (tries >= max) {
        // the right places still free (map: a key field no right flag holds; line: the flag's own step)
        const taken = new Set(screen.flags.filter((f) => !wrong.includes(f)).map((f) => pick[f.id]));
        const free = map ? screen.map.filter((x) => x.correct && !taken.has(String(x.n))).map((x) => String(x.n)) : null;
        wrong.forEach((f, i) => { unplace(f, ''); delete cards[screen.flags.indexOf(f)].dataset.line; place(f, targets.find((t) => t.id === (map ? free[i] : f.target)), 'shown'); });
        done(true, true);
        return;
      }
      wrong.forEach((f) => unplace(f, lineFor(f, pick[f.id])));
      check.disabled = true;
      zones.setAttempts(tries + 1, max);
      zones.setFeedback({ state: 'wrong', text: lineFor(wrong[0], pick[wrong[0].id]) });
      cards[screen.flags.indexOf(wrong[0])].focus({ preventScroll: true });
    }
    // as the drops on S04 and S05b: the closing line alone; after the last attempt it explains the places shown
    function done(focus, revealed = false) {
      zones.setTool();
      zones.setFeedback(revealed ? { state: 'neutral', verdict: ui.feedback.revealedPlaces, text: screen.feedbackCorrect } : { state: 'correct', verdict: '', text: screen.feedbackCorrect });
      ctx.complete();
      ctx.unlockNext({ focus });
    }

    if (ctx.revisit) {
      const keys = map ? screen.map.filter((x) => x.correct).map((x) => String(x.n)) : screen.flags.map((f) => f.target);
      screen.flags.forEach((f, i) => place(f, targets.find((t) => t.id === keys[i]), 'right'));
      done(false);
    }
    return { unmount() {} };
  },
};
