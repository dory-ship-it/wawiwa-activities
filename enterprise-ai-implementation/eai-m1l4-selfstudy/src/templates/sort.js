// Sort template, layout "wide". Two modes:
//   deck (S04, S17)  one card at a time: the deck (progress dots + the current card) on top, the
//                    columns below; a placed card becomes a small chip in its column.
//   tray (S09, S16)  every card at once in a tray under the columns; a placed card leaves the tray
//                    (its slot keeps its place, nothing moves) and becomes a chip in its column.
// Keyboard and mouse alike: select a card (a toggle button), then a column (buttons, arrow keys
// move between them). Per-card feedback in the band: right = the card's line, wrong = the column's
// feedback (or the card's one wrong line); a wrong card stays selected for another try.
// Columns: screen.columns (2 to 5, any ids); cards: screen.cards keyed by id (or n). An optional
// screen.header label sits above the columns; screen.processLine draws the process line (S04).
// Tracking: one matching interaction when the last card is placed; the response records each
// card's FIRST column ("1.a,2.b,..." / "A.3,B.1,..."), correct only if every first placement was.
import { h, fmt } from '../util.js';
import { icon } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { layout, progressDots, arrowNav, ruleLabel } from './stage.js';

const keyOf = (c) => String(c.id ?? c.n);

export const sort = {
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    const cards = screen.cards;
    const tray = screen.mode === 'tray';
    const trackingId = screen.tracking[0].id;
    const first = {};
    let selected = null, done = false;

    /* ---- columns ---- */
    const cols = screen.columns.map((c) => {
      const label = c.term && content.tooltips[c.term]
        ? [h('span', { class: 'w-term-static' }, c.label), icon('info', { size: 18, className: 'w-opt-info' })]
        : c.label;
      const target = h('button', { class: 'w-sort-target', type: 'button', 'aria-disabled': 'true', dataset: { column: c.id } },
        icon(c.icon, { size: 22, className: 'w-sort-icon' }), h('span', { class: 'w-sort-label' }, label), h('span', { class: 'w-opt-mark' }));
      if (c.term && content.tooltips[c.term]) attachTip(target, content.tooltips[c.term]);
      const chips = h('ul', { class: 'w-sort-chips', 'aria-label': c.label });
      return { c, target, chips, el: h('div', { class: 'w-sort-col' }, target, chips) };
    });
    const colRow = h('div', { class: 'w-sort-cols' + (screen.processLine ? ' w-sort-process' : ''), role: 'group', 'aria-labelledby': 'w-instruction' }, cols.map((x) => x.el));
    colRow.style.gridTemplateColumns = `repeat(${cols.length}, minmax(0, 1fr))`;
    arrowNav(colRow, { selector: '.w-sort-target' });

    /* ---- cards: one deck button, or one tray button per card ---- */
    const mark = () => h('span', { class: 'w-opt-mark' });
    let deck = null;
    const items = cards.map((c) => ({ c, btn: null }));
    if (tray) {
      items.forEach((it) => {
        it.btn = h('button', { class: 'w-sort-card w-tray-card', type: 'button', 'aria-pressed': 'false', dataset: { action: 'card', card: keyOf(it.c) } },
          it.c.n ? h('span', { class: 'w-sort-num', 'aria-hidden': 'true' }, String(it.c.n)) : null, h('span', { class: 'w-sort-text' }, it.c.text), mark());
      });
    } else {
      const num = h('span', { class: 'w-sort-num', 'aria-hidden': 'true' });
      const text = h('span', { class: 'w-sort-text' });
      const btn = h('button', { class: 'w-sort-card', type: 'button', 'aria-pressed': 'false', dataset: { action: 'card' } },
        screen.deckIcon ? h('span', { class: 'w-sort-lead' }, icon(screen.deckIcon, { size: 26 })) : num, text, mark());
      const dots = progressDots(cards.length, (i, n) => fmt(ui.progress[screen.deckLabel || 'card'], { i, n }));
      deck = { btn, num, text, dots, i: 0 };
    }
    const trayEl = tray ? h('div', { class: 'w-tray', role: 'group', 'aria-labelledby': 'w-instruction' }, items.map((it) => it.btn)) : null;
    if (trayEl) arrowNav(trayEl, { selector: '.w-tray-card' });

    layout(ctx, 'wide', zones.logo,
      h('div', { class: 'w-wide' },
        zones.instruction,
        h('div', { class: 'w-sort' + (tray ? ' w-sort-tray' : ''), dataset: { interaction: '' } },
          screen.header ? ruleLabel(screen.header) : null,
          tray ? null : h('div', { class: 'w-deck' }, deck.dots.el, deck.btn),
          colRow,
          trayEl),
        zones.band));
    zones.setFeedback({ state: 'hint', text: screen.hint });

    /* ---- state ---- */
    const btnOf = (it) => (tray ? it.btn : deck.btn);
    const markWrong = (col) => cols.forEach((x) => {
      x.target.dataset.result = x === col ? 'wrong' : '';
      x.target.querySelector('.w-opt-mark').replaceChildren(x === col ? icon('x', { size: 16, label: ui.feedback.wrongPrefix }) : '');
    });
    const press = (btn, on) => { btn.setAttribute('aria-pressed', String(on)); btn.querySelector(':scope > .w-opt-mark').replaceChildren(on ? icon('check', { size: 16 }) : ''); };
    const select = (it) => {
      if (selected) press(btnOf(selected), false);
      selected = it;
      if (it) press(btnOf(it), true);
      cols.forEach((x) => { if (it) x.target.removeAttribute('aria-disabled'); else x.target.setAttribute('aria-disabled', 'true'); });
    };
    // a placed card: its text as a chip, or (chipStyle "marker", S17) a small mark with the text for
    // screen readers only, so one case at a time stays the only case text on screen
    const chip = (c) => (screen.chipStyle === 'marker'
      ? h('li', { class: 'w-sort-chip w-sort-marker' }, icon(screen.deckIcon || 'document', { size: 18 }), icon('check', { size: 16 }), h('span', { class: 'w-sr-only' }, c.text))
      : h('li', { class: 'w-sort-chip' }, c.text));
    // reserve the chip lists' final height (measured with every chip in place) so nothing moves later
    cols.forEach((x) => x.chips.append(...cards.filter((c) => c.column === x.c.id).map(chip)));
    const tallest = Math.max(...cols.map((x) => x.chips.getBoundingClientRect().height)) / (zones.main.getBoundingClientRect().height / 656 || 1);
    cols.forEach((x) => { x.chips.replaceChildren(); x.chips.style.minHeight = Math.ceil(tallest) + 'px'; });
    const remaining = () => items.filter((it) => !it.placed);
    const showDeck = () => {
      const c = items[deck.i].c;
      deck.num.textContent = c.n ? String(c.n) : '';
      deck.text.textContent = c.text;
      deck.dots.set(deck.i, deck.i);
    };
    const place = (it) => {
      it.placed = true;
      cols.find((x) => x.c.id === it.c.column).chips.append(chip(it.c));
      if (tray) { it.btn.dataset.placed = 'true'; it.btn.inert = true; }
    };
    const finish = (focus) => {
      done = true;
      select(null);
      if (deck) { deck.dots.set(cards.length - 1, cards.length); deck.btn.dataset.done = 'true'; deck.btn.inert = true; }
      ctx.complete();
      ctx.unlockNext({ focus });
    };

    if (tray) items.forEach((it) => it.btn.addEventListener('click', () => { if (!done && !it.placed) { markWrong(null); select(selected === it ? null : it); } }));
    else deck.btn.addEventListener('click', () => { if (!done) { markWrong(null); select(selected ? null : items[deck.i]); } });

    cols.forEach((col) => col.target.addEventListener('click', () => {
      if (done || !selected) return;
      const it = selected, c = it.c, id = col.c.id, k = keyOf(c);
      if (!(k in first)) first[k] = id;
      if (id !== c.column) {
        markWrong(col);
        zones.setFeedback({ state: 'wrong', text: c.feedback[id] || c.feedback.wrong });
        return; // the card stays selected: another column is one key away
      }
      markWrong(null);
      select(null);
      place(it);
      zones.setFeedback({ state: 'correct', text: c.feedback.correct });
      if (remaining().length) {
        if (tray) remaining()[0].btn.focus();
        else { deck.i += 1; showDeck(); deck.btn.focus(); }
        return;
      }
      const response = cards.map((x) => `${keyOf(x)}.${first[keyOf(x)]}`).join(',');
      ctx.answer({ trackingId, response, result: cards.every((x) => first[keyOf(x)] === x.column) ? 'correct' : 'wrong' });
      finish(true);
    }));

    if (deck) showDeck();
    if (ctx.revisit) {
      items.forEach(place);
      if (deck) { deck.i = cards.length - 1; showDeck(); }
      zones.setFeedback({ state: 'correct', text: cards[cards.length - 1].feedback.correct });
      finish(false);
    }
    return { unmount() {} };
  },
};
