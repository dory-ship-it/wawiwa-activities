// Sort deck (S04, S09, S16), FX5 (Noy, 8 Nov 2026: "look at Rise's sorting"): on the Focus wash, no panel.
//   head     the instruction (h1) left; "Show me how" right (the hand plays on arrival)
//   deck     ONE card at a time, centred, the cards still to come behind it, the count under it
//   card     the feedback card, centred under the deck (its own card, apart from the deck): only after
//            a wrong drop (the card's line for that column) and at the end
//   columns  the piles, lower, with space above them; they light up while a card is picked up
// Every drop is judged at once (no Check): a right drop stays in its pile with a teal check and its tag
// (why it belongs there); a wrong drop shows red with a cross for a moment, then the card goes to the
// back of the deck and the feedback card says why. A card dropped wrong twice moves to its right pile
// (dashed, its tag, "Here are the right places." and why). Next unlocks when every card is in its pile.
// Drag and drop, click the card then a pile, or the keyboard (src/drag.js).
// Tracking: the same one matching interaction as before, once, when the last card is placed: each card's
// FIRST pile ("1.a,2.b,..."), correct only if every first drop was right; when any card needed another
// drop, one retry follows with the final piles.
import { h, fmt, reducedMotion } from '../util.js?v=5c11803c';
import { glyph, icon } from '../icons.js?v=5c11803c';
import { layout } from './stage.js?v=5c11803c';
import { dragDrop } from '../drag.js?v=5c11803c';

const keyOf = (c) => String(c.id ?? c.n);
const COLS_TOP = 304, GAP = 17.92, WRONG_MS = 750; // stage px in main

export const sortDeck = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const cards = screen.cards;
    const trackingId = screen.tracking[0].id;
    const first = {};   // key -> the first pile
    const misses = {};  // key -> wrong drops so far
    const done = new Set(); // keys placed (right, or shown after two misses)
    let queue = cards.map((_, k) => k), qi = 0, over = false;

    /* ---- piles ---- */
    const cols = screen.columns.map((c) => {
      const placed = h('ul', { class: 'w-drop-cards', 'aria-label': c.label });
      // FX8 (the board's S16): a column with an icon (content c.icon) shows it in a disc above its name;
      // c.kind "good" / "poor" tints it (the three good-fit kinds teal, Poor fit grey)
      const el = h('div', { class: 'w-drop', dataset: { column: c.id, ...(c.kind ? { kind: c.kind } : {}) } },
        c.icon ? h('span', { class: 'w-drop-icon', 'aria-hidden': 'true' }, icon(c.icon, { size: 20.48 })) : null,
        h('b', { class: 'w-drop-title' }, c.label), c.sub ? h('span', { class: 'w-drop-sub' }, c.sub) : null, placed);
      return { id: c.id, el, name: c.label, placed };
    });
    const colRow = h('div', { class: 'w-drops', dataset: { count: String(cols.length) } }, cols.map((x) => x.el));
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
    const deck = h('div', { class: 'w-sdeck', dataset: { interaction: '' } }, stack, counter, help, live);
    const float = h('div', { class: 'w-float w-float-under' }, zones.band);

    const cur = () => cards[queue[qi]];
    const dd = dragDrop({ ui, live, targets: cols, nameOf: () => cur().text, onDrop: (_, col) => dropOn(col) });
    dd.add(card);

    // the hand (on arrival): it grabs the card and drags it down toward the piles, stopping above them
    const g = !ctx.revisit ? ctx.ghost({ type: screen.ghost?.type || 'drag',
      steps: () => {
        if (stack.dataset.done === 'true') return [];
        const k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
        const r = card.getBoundingClientRect(), top = colRow.getBoundingClientRect().top;
        const grab = { x: r.left + 0.854 * r.width, y: r.top + 0.682 * r.height };
        return [{ point: () => grab, carry: card, hold: 120 }, { point: () => ({ x: grab.x, y: grab.y + (top - 8 * k - r.bottom) }), hold: 700 }];
      } }) : null;

    layout(ctx, 'sort-deck',
      h('div', { class: 'w-task-head' }, zones.instruction, h('span', { class: 'w-head-tools' }, g ? g.button : null)),
      deck, float, colRow);
    zones.setFeedback({ state: 'hint', text: screen.hint });

    /* ---- the feedback card's place and the piles' top, from the tallest card and line (fixed while sorting) ---- */
    function place() {
      const k = zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1;
      const y = (el) => (el.getBoundingClientRect().bottom - zones.main.getBoundingClientRect().top) / k;
      const now = text.textContent;
      let cardH = 0;
      for (const c of cards) { text.textContent = c.text; cardH = Math.max(cardH, card.getBoundingClientRect().height / k); }
      text.textContent = now;
      const deckBottom = y(counter) + (cardH - card.getBoundingClientRect().height / k);
      const probe = zones.band.cloneNode(true);
      probe.setAttribute('aria-hidden', 'true');
      probe.querySelectorAll('[aria-live]').forEach((el) => el.removeAttribute('aria-live'));
      Object.assign(probe.style, { position: 'absolute', left: '0', right: '0', top: '0', visibility: 'hidden' });
      probe.dataset.strip = 'on';
      probe.dataset.empty = 'false';
      float.append(probe);
      const lines = cards.flatMap((c) => Object.values(c.feedback).map((t) => [ui.feedback.revealedPlaces, t]));
      let stripH = 0;
      for (const [head, t] of lines) {
        probe.querySelector('.w-band-verdict').textContent = head + ' ';
        probe.querySelector('.w-band-text').textContent = t;
        stripH = Math.max(stripH, probe.getBoundingClientRect().height / k);
      }
      probe.remove();
      float.style.top = deckBottom + 12.8 + 'px';
      colRow.style.top = Math.max(COLS_TOP, deckBottom + 12.8 + stripH + GAP) + 'px';
    }
    place();
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (!over || ctx.revisit) place(); });

    // a card in its pile: its text and, once judged, its tag (why). state: 'right' (teal border, check),
    // 'shown' (moved there after two misses: dashed, check; a button that explains), 'wrong' (red, cross,
    // for a moment before the card goes back to the deck)
    const chips = {};
    function chip(c, state) {
      const tag = state !== 'wrong' && c.tag ? h('span', { class: 'w-placed-tag' }, c.tag) : null;
      const label = h('span', { class: 'w-placed-body' }, h('span', { class: 'w-placed-text' }, c.text), tag);
      const disc = h('span', { class: 'w-placed-disc', 'aria-hidden': 'true' }, glyph(state === 'wrong' ? 'g-cross' : 'g-check-b', { size: state === 'wrong' ? 13 : 15.36 }));
      const sr = h('span', { class: 'w-sr-only' }, state === 'wrong' ? ' ' + ui.feedback.wrongPrefix : ' ' + ui.feedback.correctPrefix);
      const body = state === 'shown'
        ? h('button', { class: 'w-placed-explain', type: 'button', dataset: { action: 'explain' }, onclick: () => zones.setFeedback({ state: 'neutral', verdict: ui.feedback.revealedPlaces, text: c.feedback.correct }) }, disc, label, sr)
        : [disc, label, sr];
      return h('li', { class: 'w-placed', dataset: { state, card: keyOf(c) } }, body);
    }
    function put(c, colId, state) {
      const key = keyOf(c);
      chips[key]?.remove();
      chips[key] = chip(c, state);
      cols.find((x) => x.id === colId).placed.append(chips[key]);
      fitColumns();
      return chips[key];
    }
    // a pile's foot stays clear of Previous / Next (72.32 = the footer's 17.92 + 44 + a 10.4 gap)
    function fitColumns() {
      const limit = zones.main.offsetHeight - 72.32;
      cols.forEach((x) => {
        delete x.el.dataset.dense;
        if (colRow.offsetTop + x.el.offsetTop + x.placed.offsetTop + x.placed.offsetHeight + 12.8 > limit) x.el.dataset.dense = 'true';
      });
    }

    function show() {
      const left = cards.length - done.size;
      if (!over) ctx.need(left > 0 ? fmt(left === 1 ? ui.footer.needCards1 : ui.footer.needCards, { n: left }) : '');
      if (qi >= queue.length) { stack.dataset.done = 'true'; card.inert = true; counter.textContent = ''; return; }
      stack.dataset.done = 'false';
      card.inert = false;
      const c = cur();
      text.textContent = c.text;
      counter.textContent = fmt(ui.progress.deck, { i: done.size + 1, n: cards.length });
      card.setAttribute('aria-label', fmt(ui.progress.card, { i: done.size + 1, n: cards.length }) + ': ' + c.text);
      const behind = queue.length - qi - 1;
      under.forEach((u, k) => { u.hidden = behind < 2 - k; });
    }
    function dropOn(colId) {
      if (over) return 'returned';
      const n = queue[qi], c = cards[n], k = keyOf(c);
      if (!(k in first)) first[k] = colId;
      qi += 1;
      if (colId === c.column) {
        done.add(k);
        put(c, colId, 'right');
        zones.setFeedback({ state: 'hint', text: screen.hint });
      } else if ((misses[k] = (misses[k] || 0) + 1) >= 2) {
        // the second miss: the card moves to its right pile, shown, and the card explains it
        done.add(k);
        put(c, c.column, 'shown');
        zones.setFeedback({ state: 'neutral', verdict: ui.feedback.revealedPlaces, text: c.feedback.correct });
      } else {
        // a miss: red in that pile for a moment, then back to the end of the deck; the card says why
        const el = put(c, colId, 'wrong');
        setTimeout(() => { if (chips[k] === el) { el.remove(); delete chips[k]; fitColumns(); } }, reducedMotion() ? 0 : WRONG_MS);
        queue.push(n);
        zones.setFeedback({ state: 'wrong', text: c.feedback[colId] || c.feedback.wrong });
      }
      show();
      if (done.size === cards.length) finish(true);
      else card.focus({ preventScroll: true });
      return 'placed';
    }
    function finish(focus) {
      over = true;
      stack.dataset.done = 'true';
      card.inert = true;
      colRow.dataset.done = 'true';
      const clean = cards.every((x) => first[keyOf(x)] === x.column);
      if (!ctx.revisit) {
        ctx.answer({ trackingId, response: cards.map((x) => `${keyOf(x)}.${first[keyOf(x)]}`).join(','), result: clean ? 'correct' : 'wrong' });
        if (!clean) ctx.answer({ trackingId, response: cards.map((x) => `${keyOf(x)}.${x.column}`).join(','), result: 'correct' });
      }
      zones.setFeedback(clean ? { state: 'correct', text: ui.feedback.allPlaced } : { state: 'neutral', verdict: ui.feedback.allPlacedNow, text: '' });
      ctx.complete();
      ctx.unlockNext({ focus });
    }

    show();
    if (ctx.revisit) {
      cards.forEach((c) => { done.add(keyOf(c)); put(c, c.column, 'right'); });
      qi = queue.length;
      show();
      over = true;
      stack.dataset.done = 'true';
      colRow.dataset.done = 'true';
      zones.setFeedback({ state: 'correct', text: ui.feedback.allPlaced });
      ctx.unlockNext({ focus: false });
    }
    return { unmount() { over = true; } };
  },
};
