// fishbone: the Ishikawa diagram of deck slide 12, kept from the slide (the pain as the head, six bones).
//   learn  (F3, dark ground) the fish draws itself once: the head with the pain, the spine back from it, then the six
//          bones one after another, each with its name and what to look for (the booklet's lines). Presentation.
//   sort   (F5, light ground) the same fish with the case's pain; cause cards in a tray under it. Click a card, then
//          a bone (or Enter on each). Judged at once, Rise style: a right drop stays on its bone with a check; a wrong
//          one says why and goes back; two misses place it. Bones that get no card stay empty, and the closing line
//          says why. One graded matching interaction: each card's first bone ("1.people,2.process").
// Content: head, bones [{ id, name, hint }] (top three first), cards [{ n, text, bone, feedback: { correct, wrong } }],
// closing (the line after the last card), label (the key pill).
import { h, reducedMotion } from '../src/util.js?v=044f9db2';
import { glyph } from '../src/icons.js?v=044f9db2';
import { layout } from '../src/templates/stage.js?v=044f9db2';
import { dragDrop } from '../src/drag.js?v=044f9db2';

const W = 1000, H = 300, SPINE = 150;
// the bones' outer ends (label boxes) and where they meet the spine
const ENDS = [[110, 0], [370, 0], [630, 0], [110, 300], [370, 300], [630, 300]];
const JOIN = (i) => [ENDS[i][0] + 120, SPINE];

export const fishbone = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const sort = screen.variant === 'sort';
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'm-fish-svg'); svg.setAttribute('aria-hidden', 'true');
    // the drawing fills its box exactly, so the head outline and the labels (placed in %) line up at any height
    svg.setAttribute('preserveAspectRatio', 'none');
    const line = (x1, y1, x2, y2, cls) => { const l = document.createElementNS(NS, 'line'); Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => l.setAttribute(k, v)); l.setAttribute('class', cls); svg.append(l); return l; };
    // round 3 (25 Nov 2026, Noy's references): a fish you recognise at once: the tail and the head drawn as outlines,
    // the pain written inside the head; each bone's label has its own colour (CSS, by data-bone)
    const path = (d, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); svg.append(p); return p; };
    path('M58 150 L8 92 Q22 150 8 208 Z', 'm-fish-tail');
    path('M792 58 Q930 60 992 150 Q930 240 792 242 Q826 150 792 58 Z', 'm-fish-headline');
    const spine = line(54, SPINE, 800, SPINE, 'm-fish-spine');
    const boneLines = screen.bones.map((b, i) => line(ENDS[i][0] + 60, ENDS[i][1] < SPINE ? 46 : 254, ...JOIN(i), 'm-fish-bone'));
    // round 4 (26 Nov 2026, Noy: "what is the head, what are the bones?"): a small "The pain" over the head's text; the bones carry their names
    const head = h('div', { class: 'm-fish-head' }, screen.headLabel ? h('span', { class: 'm-fish-headlabel' }, screen.headLabel) : null, h('b', {}, screen.head));
    const boneEls = screen.bones.map((b, i) => {
      const placed = h('ul', { class: 'm-fish-placed' });
      const el = sort
        ? h('button', { class: 'm-fish-label m-fish-target', type: 'button', dataset: { bone: b.id, top: String(i < 3) } }, h('b', {}, b.name), placed)
        : h('div', { class: 'm-fish-label', dataset: { bone: b.id, top: String(i < 3) } }, h('b', {}, b.name), h('span', {}, b.hint));
      // positions through the CSSOM: the lesson's CSP blocks style attributes
      el.style.left = ENDS[i][0] / W * 100 + '%'; el.style.top = ENDS[i][1] / H * 100 + '%';
      return { b, el, placed };
    });
    const fish = h('div', { class: 'm-fish' }, svg, head, boneEls.map((x) => x.el));
    const headEl = h('div', { class: 'w-focus-head' },
      screen.label ? h('p', { class: 'w-key-label' }, glyph(sort ? 'sort' : 'learn', { size: 23.04 }), h('span', {}, screen.label)) : null, zones.instruction);
    const live = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });

    if (!sort) {
      layout(ctx, 'fish', headEl, h('div', { class: 'm-fish-wrap' }, fish), screen.keyLine ? h('p', { class: 'm-flow-key m-fish-key' }, screen.keyLine) : null, live);
      zones.setHintVisible(false);
      if (!still) {
        // the build-up, once: head, spine, then each bone with its label
        head.classList.add('m-enter');
        spine.classList.add('m-draw'); spine.style.animationDelay = '250ms';
        boneLines.forEach((l, i) => { l.classList.add('m-draw'); l.style.animationDelay = 700 + i * 380 + 'ms'; });
        boneEls.forEach((x, i) => { x.el.classList.add('m-fade'); x.el.style.animationDelay = 850 + i * 380 + 'ms'; });
      }
      return { unmount() {} };
    }

    // sort
    const trackingId = screen.tracking[0].id;
    const first = {}, misses = {};
    let picked = null;
    const tray = h('div', { class: 'm-fish-tray', role: 'group', 'aria-label': screen.trayLabel });
    // round 3 (Noy: "is it a drag? it does not work"): a real drag (the kit's dragDrop: pointer, click then click, keys)
    const cards = screen.cards.map((c) => {
      const b = h('button', { class: 'm-fish-card', type: 'button', 'aria-pressed': 'false', dataset: { n: String(c.n) } }, c.text);
      tray.append(b);
      return { c, b };
    });
    const place = (c, bone, right) => {
      const x = boneEls.find((y) => y.b.id === bone);
      x.placed.append(h('li', { dataset: { result: right ? 'correct' : 'placed' } }, glyph('g-check-b', { size: 14 }), h('span', {}, c.text)));
      cards.find((y) => y.c === c).b.remove();
    };
    const done = () => {
      const response = screen.cards.map((c) => `${c.n}.${first[c.n]}`).join(',');
      const right = screen.cards.every((c) => first[c.n] === c.bone);
      ctx.answer({ trackingId, response, result: right ? 'correct' : 'wrong' });
      zones.setFeedback({ state: 'correct', text: screen.closing });
      ctx.complete();
      ctx.unlockNext({ focus: true });
    };
    // a drop on a bone: judged at once (Rise style). Returns what the drag module does with the card.
    const drop = (cardEl, x) => {
      const c = cards.find((y) => y.b === cardEl).c;
      first[c.n] ??= x.b.id;
      let res;
      if (x.b.id === c.bone) { place(c, c.bone, true); zones.setFeedback({ state: 'correct', text: c.feedback.correct }); live.textContent = c.feedback.correct; res = 'placed'; }
      else {
        misses[c.n] = (misses[c.n] || 0) + 1;
        x.el.classList.add('m-flash'); setTimeout(() => x.el.classList.remove('m-flash'), 700);
        if (misses[c.n] >= 2) { place(c, c.bone, false); zones.setFeedback({ state: 'wrong', verdict: ui.feedback.revealed, text: c.feedback.wrong }); res = 'placed'; }
        else { zones.setFeedback({ state: 'wrong', text: c.feedback.wrong }); res = 'returned'; }
      }
      if (!tray.children.length) done(); else if (res === 'placed') tray.querySelector('button')?.focus();
      return res;
    };
    boneEls.forEach((x) => { x.id = x.b.id; }); // the drag module passes the target's id
    const dd = dragDrop({ ui, live, targets: boneEls, nameOf: (el) => el.textContent, onDrop: (el, id) => drop(el, boneEls.find((x) => x.id === id)), picked: ui.drag.pickedPlace || ui.drag.picked });
    cards.forEach((y) => dd.add(y.b));
    // the hand, on arrival: it takes the first cause and carries it into a bone's box (round 4, Noy: "the hand must show
    // that it goes inside"). Not the card's own bone: the hand shows the move, never the answer.
    const g = !ctx.revisit ? ctx.ghost({ type: 'drag', steps: () => {
      const first = tray.querySelector('button');
      if (!first) return [];
      const own = screen.cards.find((c) => c.text === first.textContent)?.bone;
      const box = (boneEls.find((x, i) => i === 1 && x.b.id !== own) || boneEls.find((x) => x.b.id !== own)).el.getBoundingClientRect();
      const r = first.getBoundingClientRect();
      const grab = { x: r.left + r.width * 0.8, y: r.top + r.height * 0.6 };
      return [{ point: () => grab, carry: first, hold: 120 }, { point: () => ({ x: box.left + box.width * 0.5, y: box.top + box.height * 0.62 }), hold: 900 }];
    } }) : null;
    if (g) headEl.append(h('span', { class: 'w-head-tools m-fish-tools' }, g.button));
    layout(ctx, 'fish', headEl, h('div', { class: 'm-fish-wrap m-fish-sort' }, fish, h('div', { class: 'm-fish-row' }, tray, h('div', { class: 'm-fish-bandbox' }, zones.band))), live);
    zones.setHintVisible(false);
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (ctx.revisit) { screen.cards.forEach((c) => place(c, c.bone, true)); zones.setFeedback({ state: 'correct', text: screen.closing }); ctx.unlockNext({ focus: false }); }
    else ctx.need(ui.footer.need.fishbone);
    return { unmount() {} };
  },
};
