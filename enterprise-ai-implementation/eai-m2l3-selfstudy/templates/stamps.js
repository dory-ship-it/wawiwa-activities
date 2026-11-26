// stamps: sort NorthRiver documents into the four sensitivity tiers by stamping them (EAI M2 L3, H1; deck slide 14).
// Round 4 (26 Nov 2026, Noy approved the sketch: "stamps instead of a drag"). The light ground:
//   left    the pile still to stamp (how many are left)
//   centre  one document, large: where it comes from, what it is, one line on what is in it; under it the four stamps
//   right   four trays, one per tier, where stamped documents land
// Press a stamp: judged at once, as on the Fishbone (F5). Right: the stamp comes down, its mark lands on the document,
// the document goes to its tray, the next one comes. Wrong: the feedback says why, the document stays; a second miss
// stamps it with the right tier ("the answer was ..."). One graded matching interaction: each document's first stamp
// ("1.public,2.internal,..."). Motion none with reduced motion.
// Content: label, instruction, from (the pile line, {n}), stampsLabel, tiers [{ id, name }], docs [{ n, kind, title, line,
// tier, feedback: { correct, wrong } }], closing, hint.
import { h, fmt, reducedMotion } from '../src/util.js?v=044f9db2';
import { glyph } from '../src/icons.js?v=044f9db2';
import { layout } from '../src/templates/stage.js?v=044f9db2';

export const stamps = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const T = Object.fromEntries(screen.tiers.map((t) => [t.id, t]));
    const first = {}, misses = {};
    let k = 0, busy = false;

    const pileN = h('b', { class: 'm-st-left' });
    const pile = h('div', { class: 'm-st-pile', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), pileN);
    const kind = h('span', { class: 'm-st-kind' });
    const title = h('h2', { class: 'm-st-title', id: 'm-st-title' });
    const line = h('p', { class: 'm-st-line' });
    const mark = h('span', { class: 'm-st-mark', 'aria-hidden': 'true', hidden: true });
    const doc = h('article', { class: 'm-st-doc', 'aria-labelledby': 'm-st-title' }, kind, title, line, h('div', { class: 'm-st-rules', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), mark);
    const btns = screen.tiers.map((t) => h('button', { class: 'm-st-stamp', type: 'button', dataset: { tier: t.id } },
      h('i', { class: 'm-st-handle', 'aria-hidden': 'true' }), h('i', { class: 'm-st-foot', 'aria-hidden': 'true' }), h('span', {}, t.name)));
    const row = h('div', { class: 'm-st-stamps', role: 'group', 'aria-label': screen.stampsLabel }, btns);
    const trays = Object.fromEntries(screen.tiers.map((t) => [t.id, h('ul', { class: 'm-st-in' })]));
    const trayList = h('ul', { class: 'm-st-trays', 'aria-label': screen.traysLabel }, screen.tiers.map((t) => h('li', { class: 'm-st-tray', dataset: { tier: t.id } },
      h('b', {}, t.name), trays[t.id])));
    const live = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
    const head = h('div', { class: 'w-focus-head' }, h('p', { class: 'w-key-label' }, glyph('sort', { size: 23.04 }), h('span', {}, screen.label)), zones.instruction);
    layout(ctx, 'stamps', head, h('div', { class: 'm-st' }, pile, h('div', { class: 'm-st-centre' }, doc, row), trayList),
      h('div', { class: 'w-float d-float m-float' }, zones.band), live); // the feedback card floats between Previous and Next (the kit's DM band)
    zones.setHintVisible(false);
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const show = () => {
      const d = screen.docs[k];
      kind.textContent = d.kind; title.textContent = d.title; line.textContent = d.line;
      mark.hidden = true; delete mark.dataset.tier;
      doc.classList.remove('m-st-out');
      if (!still) { doc.classList.remove('m-st-new'); void doc.offsetWidth; doc.classList.add('m-st-new'); }
      const left = screen.docs.length - k - 1;
      pileN.textContent = left ? fmt(screen.from, { n: left }) : '';
      pile.dataset.left = String(Math.min(left, 3));
      btns.forEach((b) => { b.disabled = false; b.dataset.result = ''; });
    };
    const file = (d) => trays[d.tier].append(h('li', {}, glyph('g-check-b', { size: 14 }), h('span', {}, d.title)));
    const done = () => {
      const response = screen.docs.map((d) => `${d.n}.${first[d.n]}`).join(',');
      const right = screen.docs.every((d) => first[d.n] === d.tier);
      if (!ctx.revisit) ctx.answer({ trackingId: screen.tracking[0].id, response, result: right ? 'correct' : 'wrong' });
      doc.hidden = true; row.hidden = true; pile.hidden = true;
      trayList.parentElement.dataset.done = 'true'; // the four trays alone, centred
      zones.setFeedback({ state: 'correct', text: screen.closing });
      ctx.complete();
      ctx.unlockNext({ focus: !ctx.revisit });
    };
    // the stamp comes down, its mark lands, the document goes to its tray, the next one comes
    const land = (d, btn, revealed) => {
      busy = true;
      btns.forEach((b) => { b.disabled = true; });
      mark.textContent = T[d.tier].name; mark.dataset.tier = d.tier; mark.hidden = false;
      if (!still) { btn.classList.remove('m-st-press'); void btn.offsetWidth; btn.classList.add('m-st-press'); }
      const next = () => {
        file(d); k += 1; busy = false;
        if (k >= screen.docs.length) done(); else { show(); btns[0].focus(); }
      };
      if (still) { setTimeout(next, revealed ? 1400 : 700); return; }
      setTimeout(() => doc.classList.add('m-st-out'), revealed ? 1500 : 900);
      setTimeout(next, revealed ? 2100 : 1500);
    };
    const press = (btn) => {
      if (busy || btn.disabled) return;
      const d = screen.docs[k], tier = btn.dataset.tier;
      first[d.n] ??= tier;
      if (tier === d.tier) {
        btn.dataset.result = 'correct';
        zones.setFeedback({ state: 'correct', text: d.feedback.correct }); live.textContent = d.feedback.correct;
        land(d, btn, false);
        return;
      }
      misses[d.n] = (misses[d.n] || 0) + 1;
      btn.dataset.result = 'wrong';
      if (misses[d.n] >= 2) {
        zones.setFeedback({ state: 'wrong', verdict: ui.feedback.revealed, text: d.feedback.wrong }); live.textContent = d.feedback.wrong;
        const right = btns.find((b) => b.dataset.tier === d.tier);
        right.dataset.result = 'correct';
        land(d, right, true);
      } else {
        btn.disabled = true;
        zones.setFeedback({ state: 'wrong', text: d.feedback.wrong }); live.textContent = d.feedback.wrong;
      }
    };
    btns.forEach((b) => b.addEventListener('click', () => press(b)));

    if (ctx.revisit) { screen.docs.forEach(file); done(); return { unmount() {} }; }
    show();
    ctx.need(ui.footer.need.stamps);
    // the hand, on arrival: it points at the stamps (it presses nothing)
    ctx.ghost({ type: 'choice', steps: () => [{ el: row, hold: 900 }] });
    return { unmount() {} };
  },
};
