// Sort template, tray mode only: S18A, a Focus panel (styled by analogy). NL3 retired its deck mode:
// S04, S09, S16 and S17 use the sort deck (src/templates/sortdeck.js); S18A moves there in NL4, and
// this template goes with it.
//   tray (S18A)  every card at once in a tray under the columns; a placed card leaves the tray (its
//                slot keeps its place, nothing moves) and becomes a chip in its column.
// Keyboard and mouse alike: select a card (a toggle button), then a column (buttons, arrow keys
// move between them). Per-card feedback in the band: right = the card's line, wrong = the column's
// feedback (or the card's one wrong line); a wrong card stays selected for another try.
// Columns: screen.columns (2 to 5, any ids); cards: screen.cards keyed by id (or n). An optional
// screen.header label sits above the columns.
// Tracking: one matching interaction when the last card is placed; the response records each
// card's FIRST column ("1.a,2.b,..."), correct only if every first placement was.
import { h } from '../util.js?v=1e11956b';
import { icon } from '../icons.js?v=1e11956b';
import { attachTip } from '../tooltip.js?v=1e11956b';
import { layout, sheet, arrowNav, ruleLabel } from './stage.js?v=1e11956b';

const keyOf = (c) => String(c.id ?? c.n);

export const sort = {
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    const cards = screen.cards;
    const trackingId = screen.tracking[0].id;
    const first = {};
    let selected = null, done = false;

    /* ---- columns ---- */
    const cols = screen.columns.map((c) => {
      const label = c.term && content.tooltips[c.term] ? h('span', { class: 'w-term-static' }, c.label) : c.label;
      const target = h('button', { class: 'w-sort-target', type: 'button', 'aria-disabled': 'true', dataset: { column: c.id } },
        h('span', { class: 'w-sort-label' }, label), h('span', { class: 'w-opt-mark' }));
      if (c.term && content.tooltips[c.term]) attachTip(target, content.tooltips[c.term]);
      const chips = h('ul', { class: 'w-sort-chips', 'aria-label': c.label });
      const el = h('div', { class: 'w-sort-col', dataset: { bin: c.id } }, target, chips);
      // the whole bin is the drop area for the mouse; the name button stays the keyboard target
      el.addEventListener('click', (e) => { if (!target.contains(e.target)) target.click(); });
      return { c, target, chips, el };
    });
    const colRow = h('div', { class: 'w-sort-cols', role: 'group', 'aria-labelledby': 'w-instruction' }, cols.map((x) => x.el));
    colRow.style.gridTemplateColumns = `repeat(${cols.length}, minmax(0, 1fr))`;
    arrowNav(colRow, { selector: '.w-sort-target' });

    /* ---- the tray: one button per card ---- */
    const mark = () => h('span', { class: 'w-opt-mark' });
    const items = cards.map((c) => ({ c, btn: h('button', { class: 'w-sort-card w-tray-card', type: 'button', 'aria-pressed': 'false', dataset: { action: 'card', card: keyOf(c) } },
      c.n ? h('span', { class: 'w-sort-num', 'aria-hidden': 'true' }, String(c.n)) : null, h('span', { class: 'w-sort-text' }, c.text), mark()) }));
    const trayEl = h('div', { class: 'w-tray', role: 'group', 'aria-labelledby': 'w-instruction' }, items.map((it) => it.btn));
    arrowNav(trayEl, { selector: '.w-tray-card' });

    layout(ctx, 'focus',
      sheet('focus w-sheet-wide w-sheet-tray',
        screen.header ? ruleLabel(screen.header) : null,
        zones.instruction,
        h('div', { class: 'w-sort w-sort-tray', dataset: { interaction: '' } }, colRow, trayEl),
        zones.band));
    zones.setFeedback({ state: 'hint', text: screen.hint });

    /* ---- state ---- */
    const markWrong = (col) => cols.forEach((x) => {
      x.target.dataset.result = x === col ? 'wrong' : '';
      x.target.querySelector('.w-opt-mark').replaceChildren(x === col ? icon('x', { size: 16, label: ui.feedback.wrongPrefix }) : '');
    });
    const press = (btn, on) => { btn.setAttribute('aria-pressed', String(on)); btn.querySelector(':scope > .w-opt-mark').replaceChildren(on ? icon('check', { size: 16 }) : ''); };
    const select = (it) => {
      if (selected) press(selected.btn, false);
      selected = it;
      if (it) press(it.btn, true);
      cols.forEach((x) => { if (it) x.target.removeAttribute('aria-disabled'); else x.target.setAttribute('aria-disabled', 'true'); });
    };
    const chip = (c) => h('li', { class: 'w-sort-chip' }, c.text);
    // reserve the chip lists' final height (measured with every chip in place) so nothing moves later
    cols.forEach((x) => x.chips.append(...cards.filter((c) => c.column === x.c.id).map(chip)));
    const tallest = Math.max(...cols.map((x) => x.chips.getBoundingClientRect().height)) / (zones.main.getBoundingClientRect().height / zones.main.offsetHeight || 1);
    cols.forEach((x) => { x.chips.replaceChildren(); x.chips.style.minHeight = Math.ceil(tallest) + 'px'; });
    const remaining = () => items.filter((it) => !it.placed);
    const place = (it) => {
      it.placed = true;
      cols.find((x) => x.c.id === it.c.column).chips.append(chip(it.c));
      it.btn.dataset.placed = 'true';
      it.btn.inert = true;
    };
    const finish = (focus) => {
      done = true;
      select(null);
      ctx.complete();
      ctx.unlockNext({ focus });
    };

    items.forEach((it) => it.btn.addEventListener('click', () => { if (!done && !it.placed) { markWrong(null); select(selected === it ? null : it); } }));

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
      if (remaining().length) { remaining()[0].btn.focus(); return; }
      const response = cards.map((x) => `${keyOf(x)}.${first[keyOf(x)]}`).join(',');
      ctx.answer({ trackingId, response, result: cards.every((x) => first[keyOf(x)] === x.column) ? 'correct' : 'wrong' });
      finish(true);
    }));

    if (ctx.revisit) {
      items.forEach(place);
      zones.setFeedback({ state: 'correct', text: cards[cards.length - 1].feedback.correct });
      finish(false);
    }
    return { unmount() {} };
  },
};
