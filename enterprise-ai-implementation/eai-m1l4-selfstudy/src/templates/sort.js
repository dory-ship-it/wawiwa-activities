// Sort template (S04), layout "wide": one card at a time. The deck (progress dots + the current card)
// sits on top, the columns below in process order; a placed card becomes a small chip in its column.
// Keyboard and mouse alike: select the card (a toggle button), then a column (buttons, arrow keys
// move between them). Per-card feedback in the band: right = "Placed." (or the card's own line) and
// the next card comes up; wrong = the column's feedback, the card stays selected for another try.
// Tracking: one matching interaction when the last card is placed; the response records each
// card's FIRST column ("1.a,2.b,..."), the result is correct only if every first placement was.
import { h, fmt } from '../util.js';
import { icon } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { layout, progressDots, arrowNav } from './stage.js';

export const sort = {
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    const cards = screen.cards;
    const trackingId = screen.tracking[0].id;
    const dots = progressDots(cards.length, (i, n) => fmt(ui.progress.card, { i, n }));
    const cardNum = h('span', { class: 'w-sort-num', 'aria-hidden': 'true' });
    const cardText = h('span', { class: 'w-sort-text' });
    const cardMark = h('span', { class: 'w-opt-mark' });
    const cardBtn = h('button', { class: 'w-sort-card', type: 'button', 'aria-pressed': 'false', dataset: { action: 'card' } }, cardNum, cardText, cardMark);

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
    const colRow = h('div', { class: 'w-sort-cols', role: 'group', 'aria-labelledby': 'w-instruction' }, cols.map((x) => x.el));
    arrowNav(colRow, { selector: '.w-sort-target' });

    layout(ctx, 'wide', zones.logo,
      h('div', { class: 'w-wide' },
        zones.instruction,
        h('div', { class: 'w-sort', dataset: { interaction: '' } }, h('div', { class: 'w-deck' }, dots.el, cardBtn), colRow),
        zones.band));
    zones.setFeedback({ state: 'hint', text: screen.hint });

    let i = 0, selected = false, done = false;
    const first = {};

    const markWrong = (col) => cols.forEach((x) => {
      x.target.dataset.result = x === col ? 'wrong' : '';
      x.target.querySelector('.w-opt-mark').replaceChildren(x === col ? icon('x', { size: 16, label: ui.feedback.wrongPrefix }) : '');
    });
    const select = (on) => {
      selected = on;
      cardBtn.setAttribute('aria-pressed', String(on));
      cardMark.replaceChildren(on ? icon('check', { size: 16 }) : '');
      cols.forEach((x) => { if (on) x.target.removeAttribute('aria-disabled'); else x.target.setAttribute('aria-disabled', 'true'); });
    };
    const chip = (card) => h('li', { class: 'w-sort-chip' }, card.text);
    const showCard = () => {
      cardNum.textContent = String(cards[i].n);
      cardText.textContent = cards[i].text;
      dots.set(i, i);
      select(false);
    };
    const finish = (focus) => {
      done = true;
      dots.set(cards.length - 1, cards.length);
      select(false);
      cardBtn.dataset.done = 'true';
      cardBtn.inert = true;
      ctx.complete();
      ctx.unlockNext({ focus });
    };

    cardBtn.addEventListener('click', () => { if (!done) { markWrong(null); select(!selected); } });

    cols.forEach((col) => col.target.addEventListener('click', () => {
      if (done || !selected) return;
      const card = cards[i];
      const id = col.c.id;
      if (!(card.n in first)) first[card.n] = id;
      if (id !== card.column) {
        markWrong(col);
        zones.setFeedback({ state: 'wrong', text: card.feedback[id] || card.feedback.wrong });
        return; // the card stays selected: another column is one key away
      }
      markWrong(null);
      col.chips.append(chip(card));
      zones.setFeedback({ state: 'correct', text: card.feedback.correct });
      i += 1;
      if (i < cards.length) { showCard(); cardBtn.focus(); return; }
      const response = cards.map((c) => `${c.n}.${first[c.n]}`).join(',');
      ctx.answer({ trackingId, response, result: cards.every((c) => first[c.n] === c.column) ? 'correct' : 'wrong' });
      finish(true);
    }));

    showCard();
    if (ctx.revisit) {
      cards.forEach((c) => cols.find((x) => x.c.id === c.column).chips.append(chip(c)));
      i = cards.length - 1;
      zones.setFeedback({ state: 'correct', text: cards[i].feedback.correct });
      finish(false);
    }
    return { unmount() {} };
  },
};
