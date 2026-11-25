// tenCards: "Every pain becomes a card. No exceptions." (EAI M2 L3, B3; deck slide 4, the card format of slide 17).
// Redesign 24 Nov 2026 (Noy: crack the idea with a graphic, not a form). A learn screen on the dark ground.
// Beat 1: the learner's top ten pains from Lesson 2 as a list (their own pain from "Before you start" on line 1, the
// other nine as lines they hold in their notes). One button turns the list into cards: each line leaves the list and
// a card lands in a fan, ten in all. Beat 2: card 1 comes forward and opens: the Opportunity Card, the learner's pain
// already on it, its four parts still empty; the other nine stay as a stack beside it ("in the workbook").
// The motion is the idea itself (a pain becomes a card), once; reduced motion and a revisit show the end state.
// Content: list { title, mine, others }, button, cardTitle, cardId, painLabel, parts [{ art, title }], stack, line,
// fallback (when the learner wrote no pain).
import { h, reducedMotion } from '../src/util.js?v=34b6caae';
import { icon } from '../src/icons.js?v=34b6caae';
import { layout } from '../src/templates/stage.js?v=34b6caae';
import { art } from './art.js?v=34b6caae';

// a custom property set through the CSSOM (the page's CSP allows no style attribute)
const prop = (el, name, value) => { el.style.setProperty(name, value); return el; };

export const tenCards = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const pain = ctx.store.get('ownPain') || screen.fallback;

    // beat 1: the list
    const rows = Array.from({ length: 10 }, (_, i) => h('li', { class: 'm-tc-row', dataset: { mine: String(i === 0) } },
      h('span', { class: 'm-tc-n' }, String(i + 1).padStart(2, '0')),
      i === 0 ? h('span', { class: 'm-tc-text' }, pain) : prop(h('span', { class: 'm-tc-bar', 'aria-hidden': 'true' }), '--w', [72, 58, 80, 64, 50, 76, 60, 68, 54][i - 1] + '%')));
    const list = h('section', { class: 'm-tc-list', 'aria-label': screen.list.title },
      h('h2', { class: 'm-tc-list-h' }, art('topTen', 22), h('span', {}, screen.list.title)),
      h('ol', {}, rows),
      h('p', { class: 'w-sr-only' }, screen.list.others));
    const btn = h('button', { class: 'm-why-btn m-tc-btn', type: 'button', dataset: { action: 'cards' } }, icon('spark', { size: 22 }), h('span', {}, screen.button));

    // the fan: ten blank cards (beat 1's landing place, then the stack of nine)
    const fan = h('div', { class: 'm-tc-fan', 'aria-hidden': 'true' },
      Array.from({ length: 10 }, (_, i) => prop(h('span', { class: 'm-tc-mini' }, h('i'), h('i')), '--i', String(i))));

    // beat 2: card 1, open
    const card = h('article', { class: 'm-tc-card', 'aria-label': screen.cardTitle + ' ' + screen.cardId, hidden: true },
      h('header', { class: 'm-tc-band' }, art('card', 22), h('b', {}, screen.cardTitle), h('span', { class: 'm-tc-id' }, screen.cardId)),
      h('div', { class: 'm-tc-pain' }, h('span', { class: 'm-tc-label' }, screen.painLabel), h('p', {}, pain)),
      // round 2 (Noy: dashed boxes read as "answer me"): each part is a quiet preview, its name and two faint lines,
      // like the blank lines on the small cards; nothing in it looks clickable or fillable
      h('ul', { class: 'm-tc-parts' }, screen.parts.map((p) => h('li', {}, h('span', { class: 'm-tc-part-h' }, p.title),
        h('i', { 'aria-hidden': 'true' }), h('i', { 'aria-hidden': 'true' })))));
    const stackNote = h('p', { class: 'm-tc-stack-note', hidden: true }, screen.stack);
    const line = h('p', { class: 'm-flow-key m-tc-line', hidden: true }, screen.line);

    const live = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
    const stage = h('div', { class: 'm-tc', dataset: { beat: '1' } }, list, h('div', { class: 'm-tc-right' }, fan, btn, stackNote), card);
    layout(ctx, 'tenCards', h('div', { class: 'w-focus-head m-tc-head' }, zones.instruction), stage, line, live);
    zones.setHintVisible(false);

    const open = (focus) => {
      stage.dataset.beat = '3';
      card.hidden = false; stackNote.hidden = false; line.hidden = false;
      live.textContent = screen.cardTitle + ' ' + screen.cardId + '. ' + screen.painLabel + ': ' + pain + '. ' + screen.line;
      ctx.complete();
      ctx.unlockNext({ focus });
    };
    const turn = () => {
      btn.hidden = true;
      if (still) { open(true); return; }
      stage.dataset.beat = '2';           // rows leave, the fan fills card by card (CSS, staggered)
      timer = setTimeout(() => open(true), 1900); // then card 1 comes forward
    };
    let timer = 0;
    btn.addEventListener('click', turn);
    if (ctx.revisit) { btn.hidden = true; open(false); } else ctx.need(ui.footer.need.tenCards);
    return { unmount() { clearTimeout(timer); } };
  },
};
