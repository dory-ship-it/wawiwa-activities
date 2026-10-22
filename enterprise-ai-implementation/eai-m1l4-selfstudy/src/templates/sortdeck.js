// Sort deck (NL2, frames S04; NL3 S09, S16, S17), on the Focus wash, no panel:
//   head     the instruction (h1) left, "Show me" (or the field chip, S09) right; the hint as the
//            line under the heading when the content shows it (S16)
//   deck     ONE card at a time, centred, with up to two offset cards behind it (the cards still to
//            come; they cover the card only) and the counter ("1 of 5") under it
//   strip    the off-panel feedback strip, beside the deck on its right (NL3: the frames put it
//            between the deck and the columns, where it covered the counter of a two-line card;
//            critical detail 4 wants the counter always visible); an explain band (S09: the four
//            sensitivity levels) sits on the deck's other side
//   columns  dashed drop columns (title + one-line subtitle or definition), fixed from the top
//            (32.2cqw) so they grow downwards with the placed cards (white, teal border, teal check
//            disc); lower only when the deck, the strip or the band would reach them (from the
//            tallest card, strip and band of the screen, measured once and again when the fonts are
//            in). Nothing moves while the learner sorts.
// Drag and drop, click to pick up then click a column, or the keyboard (src/drag.js). A right drop
// stays in its column with a check and the next card comes up; a wrong drop returns to the deck with
// that card's feedback for that column. The ghost hand (first use) grabs the card and drags it down,
// stopping above the columns; "Show me" replays it.
// Tracking: one matching interaction when the last card is placed; the response records each card's
// FIRST column ("1.a,2.b,..."), correct only if every first placement was right.
import { h, fmt } from '../util.js';
import { glyph } from '../icons.js';
import { layout, explainBand } from './stage.js';
import { dragDrop } from '../drag.js';

const keyOf = (c) => String(c.id ?? c.n);
const COLS_TOP = 314.88, GAP = 12.8; // stage px in main (the frames' 32.2cqw)

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
    const colRow = h('div', { class: 'w-drops', dataset: { count: String(cols.length) } }, cols.map((x) => x.el));
    // each column as wide as its width (default 1; S16's Poor fit holds three cards)
    colRow.style.gridTemplateColumns = screen.columns.map((c) => `minmax(0, ${c.width || 1}fr)`).join(' ');

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
    const deck = h('div', { class: 'w-sdeck', dataset: { interaction: '', size: screen.deckSize || null } }, stack, counter, help, live);
    const float = h('div', { class: 'w-float w-float-beside' }, zones.band);
    const band = screen.band ? h('div', { class: 'w-deck-band' }, explainBand(screen.band)) : null;

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

    const side = screen.header ? h('span', { class: 'w-field-chip w-head-chip' }, screen.header) : g && screen.ghost.showMe ? g.button : null;
    layout(ctx, 'sort-deck',
      h('div', { class: 'w-task-head' + (screen.hintShown ? ' w-task-head-col' : '') },
        screen.hintShown ? h('div', {}, zones.instruction, h('p', { class: 'w-task-sub' }, screen.hint)) : zones.instruction, side),
      band, deck, float, colRow);
    zones.setHintVisible(false); // the frame shows no hint line: the hint stays for screen readers (S16: the line under the heading)
    zones.setFeedback({ state: 'hint', text: screen.hint });

    /* ---- the places of the strip and the columns, from the tallest card and the tallest strip ---- */
    function place() {
      const k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
      const y = (el) => (el.getBoundingClientRect().bottom - zones.main.getBoundingClientRect().top) / k;
      const now = text.textContent;
      let cardH = 0;
      for (const c of cards) { text.textContent = c.text; cardH = Math.max(cardH, card.getBoundingClientRect().height / k); }
      text.textContent = now;
      const deckBottom = y(counter) + (cardH - card.getBoundingClientRect().height / k);
      // a hidden copy of the strip, filled with each line it can show (never announced)
      const probe = zones.band.cloneNode(true);
      probe.setAttribute('aria-hidden', 'true');
      probe.querySelectorAll('[aria-live]').forEach((el) => el.removeAttribute('aria-live'));
      Object.assign(probe.style, { position: 'absolute', left: '0', right: '0', top: '0', visibility: 'hidden' });
      probe.dataset.strip = 'on';
      probe.dataset.empty = 'false';
      float.append(probe);
      const lines = cards.flatMap((c) => Object.entries(c.feedback).map(([key, t]) => [key === 'correct' ? '' : ui.feedback.wrongPrefix, t]));
      let stripH = 0;
      for (const [head, t] of lines) {
        probe.querySelector('.w-band-verdict').textContent = head ? head + ' ' : '';
        probe.querySelector('.w-band-text').textContent = t;
        stripH = Math.max(stripH, probe.querySelector('.w-strip').getBoundingClientRect().height / k);
      }
      probe.remove();
      const top = deck.offsetTop; // the strip's top edge level with the card's
      float.style.top = top + 'px';
      colRow.style.top = Math.max(COLS_TOP, Math.max(deckBottom, top + stripH, band ? y(band) : 0) + GAP) + 'px';
    }
    place();
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (!done || ctx.revisit) place(); });

    // a placed card with its text; or (screen.placedLabel, S17: long cases under five columns) a short
    // name, "Case 1", with the case's text for screen readers (R2's S17 markers did the same)
    const chip = (c) => {
      const k = cards.indexOf(c) + 1;
      const label = screen.placedLabel ? [h('span', { 'aria-hidden': 'true' }, fmt(ui.progress[screen.placedLabel], { i: k })), h('span', { class: 'w-sr-only' }, c.text)] : h('span', {}, c.text);
      return h('li', { class: 'w-placed' }, h('span', { class: 'w-placed-disc', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 15.36 })), label);
    };
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
