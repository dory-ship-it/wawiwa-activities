// Sort deck (NL2, frames S04; NL3 S09, S16; FX2: S17 and S18A left it for the decision template), on
// the Focus wash, no panel:
//   head     the instruction (h1) left; right the field chip (S09) and "Show me how"; the hint as the
//            line under the heading when the content shows it (S16)
//   deck     ONE card at a time, centred (FX3: left when there is no explain band), with up to two offset cards behind it (the cards still to
//            come; they cover the card only) and the counter ("1 of 5") under it
//   strip    the off-panel feedback strip, beside the deck on its right (NL3: the frames put it
//            between the deck and the columns, where it covered the counter of a two-line card;
//            critical detail 4 wants the counter always visible); above it the attempt marker and
//            Check (FX1); an explain band (S09: the four sensitivity levels) on the deck's other side
//   columns  dashed drop columns (title + one-line subtitle or definition), fixed from the top
//            (32.2cqw) so they grow downwards with the placed cards; lower only when the deck, the
//            strip or the band would reach them (from the tallest card, strip and band of the screen,
//            measured once and again when the fonts are in). Nothing moves while the learner sorts.
// Drag and drop, click to pick up then click a column, or the keyboard (src/drag.js).
// FX1 E2 "check after all": every drop places the card in its column as it is (white, no mark) and
// the next card comes up. With the deck empty, Check unlocks. Check: the right cards get their teal
// border and check; the wrong ones go back to the deck, each with its line for the column it was in
// (shown when it comes up). Attempt 2 the same. After attempt 2 the cards still wrong move to their
// right columns with a check (a button that shows the card's explanation in the strip), and Next
// unlocks. The attempt marker shows "Attempt 1 of 2". The ghost hand (first use) grabs the card and
// drags it down, stopping above the columns; "Show me how" replays it.
// Tracking: one matching interaction at the first Check; the response records each card's FIRST
// column ("1.a,2.b,..."), correct only if every first placement was right. Later Checks are retries.
import { h, fmt } from '../util.js?v=d9c03a25';
import { glyph } from '../icons.js?v=d9c03a25';
import { layout, explainBand } from './stage.js?v=d9c03a25';
import { dragDrop } from '../drag.js?v=d9c03a25';
import { checkButton } from './decision.js?v=d9c03a25';

const keyOf = (c) => String(c.id ?? c.n);
const COLS_TOP = 222.72, GAP = 15.36; // stage px in main (FX2 B: higher than the frames' 32.2cqw, the columns hold the cards' text)

export const sortDeck = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const cards = screen.cards;
    const trackingId = screen.tracking[0].id;
    const max = ctx.revisit ? 0 : screen.attempts || 2;
    const first = {};   // key -> the first column (attempt 1)
    const at = {};      // key -> the column it sits in now
    const ok = new Set(); // keys confirmed right by a Check (or shown)
    let queue = cards.map((_, k) => k), qi = 0, tries = 0, done = false;

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
    // FX3: with no explain band (S04, S16) the deck sits left, under the heading, and the strip takes the
    // wide space beside it: fewer lines, so the columns come up close to the deck
    const band = screen.band ? h('div', { class: 'w-deck-band' }, explainBand(screen.band)) : null;
    const deck = h('div', { class: 'w-sdeck' + (band ? '' : ' w-sdeck-left'), dataset: { interaction: '' } }, stack, counter, help, live);
    const float = h('div', { class: 'w-float w-float-beside' + (band ? '' : ' w-float-wide') }, zones.band);
    const check = checkButton(ui, ui.buttons.check, () => doCheck());

    const cur = () => cards[queue[qi]];
    const dd = dragDrop({ ui, live, targets: cols, nameOf: () => cur().text, onDrop: (_, col) => dropOn(col) });
    dd.add(card);

    // the ghost hand: it grabs the card (its lower right) and drags it down, stopping above the columns
    const g = !ctx.revisit ? ctx.ghost({ type: screen.ghost?.type || 'drag',
      steps: () => {
        if (stack.dataset.done === 'true') return [];
        const k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
        const r = card.getBoundingClientRect(), top = colRow.getBoundingClientRect().top;
        const grab = { x: r.left + 0.854 * r.width, y: r.top + 0.682 * r.height };
        return [{ point: () => grab, carry: card, hold: 120 }, { point: () => ({ x: grab.x, y: grab.y + (top - 8 * k - r.bottom) }), hold: 700 }];
      } }) : null;

    const side = h('span', { class: 'w-head-tools' }, screen.header ? h('span', { class: 'w-field-chip w-head-chip' }, screen.header) : null, g ? g.button : null);
    layout(ctx, 'sort-deck',
      h('div', { class: 'w-task-head' + (screen.hintShown ? ' w-task-head-col' : '') },
        screen.hintShown ? h('div', {}, zones.instruction, h('p', { class: 'w-task-sub' }, screen.hint)) : zones.instruction, side),
      band, deck, float, colRow);
    zones.setHintVisible(false); // the frame shows no hint line: the hint stays for screen readers (S16: the line under the heading)
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (!ctx.revisit) { zones.setTool(check); zones.setAttempts(1, max); }

    /* ---- the places of the strip and the columns, from the tallest card and the tallest strip ---- */
    function place() {
      const k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
      const y = (el) => (el.getBoundingClientRect().bottom - zones.main.getBoundingClientRect().top) / k;
      const now = text.textContent;
      let cardH = 0;
      for (const c of cards) { text.textContent = c.text; cardH = Math.max(cardH, card.getBoundingClientRect().height / k); }
      text.textContent = now;
      const deckBottom = y(counter) + (cardH - card.getBoundingClientRect().height / k);
      // a hidden copy of the strip (with the attempt row and Check), filled with each line it can show (never announced)
      const probe = zones.band.cloneNode(true);
      probe.setAttribute('aria-hidden', 'true');
      probe.querySelectorAll('[aria-live]').forEach((el) => el.removeAttribute('aria-live'));
      Object.assign(probe.style, { position: 'absolute', left: '0', right: '0', top: '0', visibility: 'hidden' });
      probe.dataset.strip = 'on';
      probe.dataset.empty = 'false';
      float.append(probe);
      const lines = cards.flatMap((c) => Object.entries(c.feedback).map(([key, t]) => [key === 'correct' ? ui.feedback.revealedPlaces : ui.feedback.wrongPrefix, t]));
      lines.push([ui.feedback.correctPrefix, ui.feedback.allPlaced]);
      let stripH = 0;
      for (const [head, t] of lines) {
        probe.querySelector('.w-band-verdict').textContent = head ? head + ' ' : '';
        probe.querySelector('.w-band-text').textContent = t;
        stripH = Math.max(stripH, probe.getBoundingClientRect().height / k);
      }
      probe.remove();
      const top = deck.offsetTop; // the strip's top edge level with the card's
      float.style.top = top + 'px';
      colRow.style.top = Math.max(COLS_TOP, Math.max(deckBottom, top + stripH, band ? y(band) : 0) + GAP) + 'px';
    }
    place();
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (!done || ctx.revisit) place(); });

    // a placed card shows its own text, small, up to two lines (FX2 B: it replaces the "Card n" token).
    // state: 'pending' (placed, not checked yet: no mark), 'right' (teal border, check), 'shown' (moved
    // there after the last attempt: the check, and a button that shows its explanation).
    // Any number of cards may land in one column: a column that would reach Previous / Next turns dense
    // (one line per card, the rest of the text cut with an ellipsis; the whole text for screen readers).
    const chips = {};
    function chip(c, state) {
      const label = h('span', { class: 'w-placed-text' }, c.text);
      const disc = state === 'pending' ? null : h('span', { class: 'w-placed-disc', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 15.36 }));
      const body = state === 'shown'
        ? h('button', { class: 'w-placed-explain', type: 'button', dataset: { action: 'explain' }, onclick: () => zones.setFeedback({ state: 'neutral', verdict: ui.feedback.revealedPlaces, text: c.feedback.correct }) }, disc, label)
        : [disc, label];
      return h('li', { class: 'w-placed', dataset: { state, card: keyOf(c) } }, body);
    }
    function put(c, colId, state) {
      const key = keyOf(c);
      chips[key]?.remove();
      chips[key] = chip(c, state);
      cols.find((x) => x.id === colId).placed.append(chips[key]);
      fitColumns();
    }
    // a column's foot stays clear of Previous / Next (72.32 = the footer's 17.92 + 44 + a 10.4 gap)
    function fitColumns() {
      const limit = zones.main.offsetHeight - 72.32;
      cols.forEach((x) => {
        delete x.el.dataset.dense;
        if (colRow.offsetTop + x.el.offsetTop + x.el.offsetHeight > limit) x.el.dataset.dense = 'true';
      });
    }
    // done: every card in its right column, in card order within it
    const showAll = () => cards.forEach((c) => put(c, c.column, chips[keyOf(c)]?.dataset.state === 'shown' ? 'shown' : 'right'));

    function show() {
      const left = queue.length - qi; // this card and the ones still to come
      if (left <= 0) { stack.dataset.done = 'true'; card.inert = true; counter.textContent = ''; return; }
      stack.dataset.done = 'false';
      card.inert = false;
      const c = cur();
      text.textContent = c.text;
      counter.textContent = fmt(ui.progress.deck, { i: qi + 1, n: queue.length });
      card.setAttribute('aria-label', fmt(ui.progress.card, { i: qi + 1, n: queue.length }) + ': ' + c.text);
      under.forEach((u, k) => { u.hidden = left - 1 < 2 - k; }); // cards still to come sit behind this one (two at most)
      // attempt 2: a card that came back shows its line for the column it was in
      if (tries && at[keyOf(c)]) zones.setFeedback({ state: 'wrong', text: c.feedback[at[keyOf(c)]] || c.feedback.wrong });
    }
    function dropOn(colId) {
      const c = cur(), k = keyOf(c);
      if (!(k in first)) first[k] = colId;
      at[k] = colId;
      put(c, colId, 'pending');
      qi += 1;
      show();
      if (qi >= queue.length) {
        check.disabled = false;
        zones.setFeedback({ state: 'hint', text: screen.hint });
        check.focus({ preventScroll: true });
      } else {
        if (!tries) zones.setFeedback({ state: 'hint', text: screen.hint });
        card.focus({ preventScroll: true });
      }
      return 'placed';
    }
    function doCheck() {
      if (done || qi < queue.length) return;
      tries += 1;
      const wrong = queue.filter((n) => at[keyOf(cards[n])] !== cards[n].column);
      queue.forEach((n) => { if (!wrong.includes(n)) { ok.add(keyOf(cards[n])); put(cards[n], cards[n].column, 'right'); } });
      if (tries === 1) ctx.answer({ trackingId, response: cards.map((x) => `${keyOf(x)}.${first[keyOf(x)]}`).join(','), result: cards.every((x) => first[keyOf(x)] === x.column) ? 'correct' : 'wrong' });
      else ctx.answer({ trackingId, response: cards.map((x) => `${keyOf(x)}.${at[keyOf(x)]}`).join(','), result: wrong.length ? 'wrong' : 'correct' });
      if (!wrong.length) { zones.setFeedback({ state: 'correct', text: ui.feedback.allPlaced }); finish(true); return; }
      if (tries >= max) {
        // the last attempt: the cards still wrong move to their right columns with a check
        wrong.forEach((n) => put(cards[n], cards[n].column, 'shown'));
        zones.setFeedback({ state: 'neutral', verdict: ui.feedback.revealedPlaces, text: cards[wrong[0]].feedback.correct });
        finish(true);
        return;
      }
      // back to the deck: the wrong cards, each with its line when it comes up
      wrong.forEach((n) => { chips[keyOf(cards[n])]?.remove(); delete chips[keyOf(cards[n])]; });
      queue = wrong;
      qi = 0;
      check.disabled = true;
      zones.setAttempts(tries + 1, max);
      show();
      card.focus({ preventScroll: true });
    }
    function finish(focus) {
      showAll();
      done = true;
      stack.dataset.done = 'true';
      card.inert = true; // nothing left to drop (the columns stay reachable: a shown card explains itself)
      colRow.dataset.done = 'true';
      zones.setTool();
      ctx.complete();
      ctx.unlockNext({ focus });
    }

    show();
    if (ctx.revisit) {
      cards.forEach((c) => put(c, c.column, 'right'));
      zones.setFeedback({ state: 'correct', text: ui.feedback.allPlaced });
      finish(false);
    }
    return { unmount() { done = true; } };
  },
};
