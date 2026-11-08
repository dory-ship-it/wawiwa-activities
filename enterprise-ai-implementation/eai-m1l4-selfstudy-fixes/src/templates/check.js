// Knowledge check template (S21), a Focus panel (styled by analogy): scored items one at a time, item dots top right.
//   choice items  four options 2x2 with letter badges.
//   tiles item    eight tiles in two columns of four: select two.
// QZ3 (Noy, 1 Nov 2026): the question itself is the heading (the stem, or the tiles item's instruction),
// the largest text; above it, small, what to do ("Choose one answer.", the tiles item's "Select two.",
// in the review "Your answers, with feedback") beside the dots. No hint line in the band.
// QZ2 (Noy, 1 Nov 2026): a real test. A click only selects (the learner may change it); "Next question"
// (on the last item "Finish the check") in the band sends that one answer, with no right or wrong shown
// and no retry. After the last item the attempt ends (ctx.checkDone: the score, passed once 80 or
// more), Next opens, and the screen turns into the review: each item again, read-only, the learner's
// answer marked right or wrong, the right answer marked, and the answer's feedback in the band ("Next
// answer" steps through). Next leads to the result screen, S21R; "Retake now" there starts a new
// attempt: the answers reset and (shuffleOnRetake) the choice items show their options in a new order,
// one per attempt (the tiles keep the HR map's line order). Responses are the options' ids, so a
// shuffled option reports the same letter as before. A revisit shows the review from the first item;
// a reload in the middle of an attempt goes on from the first item not answered yet.
// FX3: version b of every item on a retake (its own interaction ids, L4_S21_1b ...), a again after that.
import { h, fmt } from '../util.js?v=e59b9691';
import { glyph } from '../icons.js?v=e59b9691';
import { checkButton } from './decision.js?v=e59b9691';
import { letter } from '../tracking/index.js?v=e59b9691';
import { layout, sheet, progressDots, arrowNav } from './stage.js?v=e59b9691';

export const check = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    // FX3: each item has a second version (it.b: its own stem or instruction, options or tiles, and
    // trackingId); the first attempt shows version a, a retake version b, then a, b, ... (ctx.checkVersion)
    // a retake shows the choice items with their options in another order (never the first attempt's)
    const attempt = ctx.attempt();
    const versioned = screen.items.map((it) => (ctx.checkVersion() === 'b' && it.b ? { ...it, ...it.b } : it));
    const items = screen.shuffleOnRetake && attempt > 1 ? versioned.map((it, k) => (it.options ? { ...it, options: shuffled(it.options, attempt * 7 + k) } : it)) : versioned;
    const last = items.length - 1;
    const dots = progressDots(items.length, (i, n) => fmt(ui.progress.question, { i, n }));
    const body = h('div', { class: 'w-kc-body', dataset: { interaction: '' } });
    const ask = h('p', { class: 'w-kc-ask' });
    layout(ctx, 'focus',
      sheet('focus w-sheet-wide w-kc', h('div', { class: 'w-kc-head' }, ask, dots.el), zones.instruction, body, zones.band));

    const mark = (btn, result) => {
      btn.dataset.result = result;
      btn.querySelector(':scope > .w-opt-mark').replaceChildren(result === 'correct' ? glyph('g-check-b', { size: 16, label: ui.feedback.correctPrefix })
        : result === 'wrong' ? glyph('g-cross', { size: 14.08, label: ui.feedback.wrongPrefix }) : '');
    };
    const choiceButtons = (it) => it.options.map((o, i) => h('button', { class: 'w-opt w-ans w-kc-opt', type: 'button', 'aria-pressed': 'false', dataset: { id: o.id, letter: letter(i) } },
      h('span', { class: 'w-kc-letter', 'aria-hidden': 'true' }, letter(i).toUpperCase()), h('span', { class: 'w-opt-label' }, o.label), h('span', { class: 'w-opt-mark' })));
    const tileButtons = (it) => it.tiles.map((t) => h('button', { class: 'w-opt w-ans w-pick-tile w-kc-tile', type: 'button', 'aria-pressed': 'false', dataset: { n: String(t.n) } },
      h('span', { class: 'w-tile-num', 'aria-hidden': 'true' }, String(t.n)), h('span', { class: 'w-opt-label' }, t.text), h('span', { class: 'w-opt-mark' })));
    const choiceBody = (btns) => {
      const group = h('div', { class: 'w-kc-grid', role: 'group', 'aria-labelledby': 'w-instruction' }, btns);
      arrowNav(group);
      body.replaceChildren(group);
    };
    const tilesBody = (btns) => {
      const group = h('div', { class: 'w-kc-tiles', role: 'group', 'aria-labelledby': 'w-instruction' }, btns);
      arrowNav(group, { selector: '.w-kc-tile', cols: 2 });
      body.replaceChildren(group);
    };

    /* ---- the attempt: one answer per item, no feedback ---- */
    function show(k) {
      const it = items[k];
      dots.set(k, k);
      ask.textContent = it.hint || screen.instruction; // the tiles item says its own: select two
      zones.instruction.textContent = it.stem || it.instruction;
      zones.setFeedback({ state: 'hint', text: '' });
      // the band's tool sends the answer: "Next question", or "Finish the check" on the last item
      const send = checkButton(ui, k < last ? ui.buttons.nextQuestion : ui.buttons.finishCheck, null);
      send.dataset.action = k < last ? 'nextQuestion' : 'check';
      zones.setTool(send);
      (it.kind === 'tiles' ? tilesItem : choiceItem)(it, k, send);
    }
    function sent(k) {
      if (k < last) { show(k + 1); body.querySelector('button')?.focus(); return; }
      ctx.checkDone();
      ctx.complete();
      ctx.unlockNext({ focus: false });
      review(0, true);
    }

    function choiceItem(it, k, send) {
      let chosen = -1;
      const btns = choiceButtons(it);
      choiceBody(btns);
      btns.forEach((b, i) => b.addEventListener('click', () => {
        chosen = i;
        btns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
        send.disabled = false;
      }));
      send.addEventListener('click', () => {
        if (chosen < 0) return;
        const o = it.options[chosen];
        ctx.answer({ trackingId: it.trackingId, response: o.id, result: o.correct ? 'correct' : 'wrong' });
        sent(k);
      });
    }

    function tilesItem(it, k, send) {
      const need = it.select;
      const keys = it.tiles.map((t, i) => (t.correct ? i : -1)).filter((i) => i >= 0);
      const selected = new Set();
      const btns = tileButtons(it);
      tilesBody(btns);
      btns.forEach((b, i) => b.addEventListener('click', () => {
        if (selected.has(i)) selected.delete(i); else if (selected.size < need) selected.add(i);
        btns.forEach((x, j) => x.setAttribute('aria-pressed', String(selected.has(j))));
        send.disabled = selected.size !== need;
      }));
      send.addEventListener('click', () => {
        if (selected.size !== need) return;
        const chosen = [...selected].sort((a, b) => a - b);
        const ok = chosen.filter((i) => keys.includes(i)).length === keys.length;
        ctx.answer({ trackingId: it.trackingId, response: chosen.map((i) => String(it.tiles[i].n)).join(','), result: ok ? 'correct' : 'wrong' });
        sent(k);
      });
    }

    /* ---- the review: each item read-only, its answer marked, the feedback in the band ---- */
    function review(k, focus) {
      const it = items[k];
      const a = ctx.firstAnswer(it.trackingId);
      dots.set(k, items.length);
      ask.textContent = screen.reviewInstruction;
      zones.instruction.textContent = it.stem || it.instruction;
      zones.setTool();
      zones.setFeedback({ state: 'idle' }); // the attempt's hint line goes
      const actions = k < last ? [{ id: 'nextAnswer', label: ui.buttons.nextAnswer, onClick: () => review(k + 1, true) }] : [];
      let fb;
      if (it.kind === 'tiles') {
        const btns = tileButtons(it);
        tilesBody(btns);
        const picked = new Set((a?.response || '').split(',').filter(Boolean));
        it.tiles.forEach((t, i) => {
          btns[i].setAttribute('aria-disabled', 'true');
          if (picked.has(String(t.n))) mark(btns[i], t.correct ? 'correct' : 'wrong');
          else if (t.correct) mark(btns[i], 'correct'); // the right line the learner did not pick
        });
        // the band explains the errors the learner missed (all of them when every pick was right)
        const keys = it.tiles.filter((t) => t.correct);
        const missed = keys.filter((t) => !picked.has(String(t.n)));
        fb = !missed.length ? { state: 'correct', text: keys.map((t) => t.feedback).join(' ') }
          : missed.length < keys.length ? { state: 'partial', verdict: ui.feedback.oneOfTwo, text: missed.map((t) => t.feedback).join(' ') }
          : { state: 'wrong', text: missed.map((t) => t.feedback).join(' ') };
      } else {
        const btns = choiceButtons(it);
        choiceBody(btns);
        it.options.forEach((o, i) => {
          btns[i].setAttribute('aria-disabled', 'true');
          if (o.id === a?.response) { btns[i].setAttribute('aria-pressed', 'true'); mark(btns[i], o.correct ? 'correct' : 'wrong'); }
          else if (o.correct) mark(btns[i], 'correct'); // the right answer, when the learner's was wrong
        });
        const o = it.options.find((x) => x.id === a?.response);
        fb = { state: o?.correct ? 'correct' : 'wrong', text: o?.feedback || '' };
      }
      const go = zones.setFeedback({ ...fb, actions });
      if (focus) (go || body.querySelector('button'))?.focus();
    }

    // a revisit (or a reload after the last answer) opens the review; a reload mid-attempt goes on
    const next = items.findIndex((it) => !ctx.firstAnswer(it.trackingId));
    if (ctx.revisit || next < 0) {
      if (next < 0 && !ctx.revisit) ctx.checkDone();
      ctx.complete();
      ctx.unlockNext({ focus: false });
      review(0, false);
    } else show(next);
    return { unmount() {} };
  },
};

// A fixed new order per attempt and item (the same after a reload), never the original order:
// Fisher-Yates with a small seeded generator; an unchanged result is turned by one place.
function shuffled(list, seed) {
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out.every((o, i) => o === list[i]) ? [...out.slice(1), out[0]] : out;
}
