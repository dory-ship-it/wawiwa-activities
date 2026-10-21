// Sort deck (NL2, frames S04; NL3 reuses it for S09, S16, S17, S18A), on the Focus wash, no panel:
//   head     the instruction (h1) left, "Show me" right
//   deck     ONE card at a time, centred, with up to two offset cards behind it (the cards still to
//            come; they cover the card only) and the counter ("1 of 5") under it
//   strip    the off-panel feedback strip between the deck and the columns
//   columns  dashed drop columns (title + one-line subtitle), fixed from the top so they grow
//            downwards with the placed cards (white, teal border, teal check disc)
// Drag and drop, click to pick up then click a column, or the keyboard (src/drag.js). A right drop
// stays in its column with a check and the next card comes up; a wrong drop returns to the deck with
// that card's feedback for that column. The ghost hand (first use) grabs the card and drags it down,
// stopping above the columns; "Show me" replays it.
// Tracking: one matching interaction when the last card is placed; the response records each card's
// FIRST column ("1.a,2.b,..."), correct only if every first placement was right.
import { h, fmt } from '../util.js';
import { glyph } from '../icons.js';
import { layout } from './stage.js';
import { dragDrop } from '../drag.js';

const keyOf = (c) => String(c.id ?? c.n);

export const sortDeck = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const cards = screen.cards;
    const trackingId = screen.tracking[0].id;
    const first = {};
    let i = 0, done = false;

    /* ---- columns ---- */
    const cols = screen.columns.map((c) => {
      const placed = h('ul', { class: 'w-drop-cards', 'aria-label': c.label });
      const el = h('div', { class: 'w-drop', dataset: { column: c.id } },
        h('b', { class: 'w-drop-title' }, c.label), c.sub ? h('span', { class: 'w-drop-sub' }, c.sub) : null, placed);
      return { id: c.id, el, name: c.label, placed };
    });
    const colRow = h('div', { class: 'w-drops' }, cols.map((x) => x.el));
    colRow.style.gridTemplateColumns = `repeat(${cols.length}, minmax(0, 1fr))`;

    /* ---- deck ---- */
    const text = h('span', { class: 'w-deck-text' });
    const helpId = 'w-deck-help';
    const card = h('button', { class: 'w-deck-card', type: 'button', 'aria-pressed': 'false', 'aria-describedby': helpId, dataset: { action: 'card' } },
      glyph('g-grip', { size: 12.8, className: 'w-grip' }), text);
    const under = [h('i', { class: 'w-deck-under w-deck-under-2' }), h('i', { class: 'w-deck-under w-deck-under-1' })];
    const stack = h('div', { class: 'w-deck-stack' }, under, card);
    const counter = h('p', { class: 'w-deck-count', 'aria-hidden': 'true' });
    const live = h('span', { class: 'w-sr-only', 'aria-live': 'polite' });
    const help = h('span', { class: 'w-sr-only', id: helpId }, fmt(ui.drag.help, { n: cols.length }));

    const dd = dragDrop({ ui, live, targets: cols, nameOf: () => cards[i].text, onDrop: (_, col) => dropOn(col) });
    dd.add(card);

    // the ghost hand: it grabs the card (its lower right) and drags it down, stopping above the columns
    const g = !ctx.revisit && screen.ghost ? ctx.ghost({ type: screen.ghost.type,
      steps: () => {
        const k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
        const r = card.getBoundingClientRect(), top = colRow.getBoundingClientRect().top;
        const grab = { x: r.left + 0.854 * r.width, y: r.top + 0.682 * r.height };
        return [{ point: () => grab, carry: card, hold: 120 }, { point: () => ({ x: grab.x, y: grab.y + (top - 8 * k - r.bottom) }), hold: 700 }];
      } }) : null;

    layout(ctx, 'sort-deck',
      h('div', { class: 'w-task-head' }, zones.instruction, g && screen.ghost.showMe ? g.button : null),
      h('div', { class: 'w-sdeck', dataset: { interaction: '' } }, stack, counter, help, live),
      h('div', { class: 'w-float w-float-deck' }, zones.band),
      colRow);
    zones.setHintVisible(false); // the frame shows no hint line: the hint stays for screen readers
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const chip = (c) => h('li', { class: 'w-placed' }, h('span', { class: 'w-placed-disc', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 15.36 })), h('span', {}, c.text));
    function show() {
      const c = cards[i];
      text.textContent = c.text;
      counter.textContent = fmt(ui.progress.deck, { i: i + 1, n: cards.length });
      card.setAttribute('aria-label', fmt(ui.progress.card, { i: i + 1, n: cards.length }) + ': ' + c.text);
      const left = cards.length - i - 1; // cards still to come sit behind this one (two at most)
      under.forEach((u, k) => { u.hidden = left < 2 - k; });
    }
    function dropOn(colId) {
      const c = cards[i], k = keyOf(c);
      if (!(k in first)) first[k] = colId;
      if (colId !== c.column) {
        zones.setFeedback({ state: 'wrong', text: c.feedback[colId] || c.feedback.wrong });
        return 'returned';
      }
      cols.find((x) => x.id === colId).placed.append(chip(c));
      zones.setFeedback({ state: 'correct', verdict: '', text: c.feedback.correct });
      if (i < cards.length - 1) { i += 1; show(); card.focus({ preventScroll: true }); return 'placed'; }
      ctx.answer({ trackingId, response: cards.map((x) => `${keyOf(x)}.${first[keyOf(x)]}`).join(','), result: cards.every((x) => first[keyOf(x)] === x.column) ? 'correct' : 'wrong' });
      finish(true);
      return 'placed';
    }
    function finish(focus) {
      done = true;
      stack.dataset.done = 'true';
      card.inert = true;
      cols.forEach((x) => { x.el.inert = true; });
      ctx.complete();
      ctx.unlockNext({ focus });
    }

    show();
    if (ctx.revisit) {
      cards.forEach((c) => cols.find((x) => x.id === c.column).placed.append(chip(c)));
      i = cards.length - 1;
      show();
      zones.setFeedback({ state: 'correct', verdict: '', text: cards[i].feedback.correct });
      finish(false);
    }
    return { unmount() { done = true; } };
  },
};
