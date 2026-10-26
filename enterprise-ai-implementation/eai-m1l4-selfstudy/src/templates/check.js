// Knowledge check template (S21), a Focus panel (styled by analogy): scored items one at a time, item dots top right.
//   items 1 to 4  the stem (scenario icon) and four options 2x2 with letter badges; a click answers.
//   item 5        eight tiles in two columns of four: select two, then Check in the band.
// Wrong = the calm wrong mark and the option's line, retry allowed; right = "Next question" in the
// band. ONLY THE FIRST ATTEMPT COUNTS: the engine keeps it per interaction id (later tries go out as
// retries). NL4: after the last item the attempt ends (ctx.checkDone: the score, passed once 80 or
// more) and Next leads to the result screen, S21R; "Retake now" there starts a new attempt: the
// answers reset and (shuffleOnRetake) items 1 to 4 show their options in a new order, one per attempt
// (item 5's tiles keep the HR map's line order). Responses are the options' ids, so a shuffled
// option reports the same letter as before. A revisit shows the result line (resultCard).
// FX3: version b of every item on a retake (its own interaction ids, L4_S21_1b ...), a again after that.
import { h, fmt } from '../util.js?v=2d9f5392';
import { glyph } from '../icons.js?v=2d9f5392';
import { checkButton } from './decision.js?v=2d9f5392';
import { letter } from '../tracking/index.js?v=2d9f5392';
import { layout, sheet, progressDots, arrowNav } from './stage.js?v=2d9f5392';

export const check = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    // FX3: each item has a second version (it.b: its own stem or instruction, options or tiles, and
    // trackingId); the first attempt shows version a, a retake version b, then a, b, ... (ctx.checkVersion)
    // a retake shows items 1 to 4 with their options in another order (never the first attempt's)
    const attempt = ctx.attempt();
    const versioned = screen.items.map((it) => (ctx.checkVersion() === 'b' && it.b ? { ...it, ...it.b } : it));
    const items = screen.shuffleOnRetake && attempt > 1 ? versioned.map((it, k) => (it.options ? { ...it, options: shuffled(it.options, attempt * 7 + k) } : it)) : versioned;
    const dots = progressDots(items.length, (i, n) => fmt(ui.progress.question, { i, n }));
    const body = h('div', { class: 'w-kc-body', dataset: { interaction: '' } });
    layout(ctx, 'focus',
      sheet('focus w-sheet-wide', h('div', { class: 'w-kc-head' }, zones.instruction, dots.el), body, zones.band));

    const mark = (btn, result) => {
      btn.dataset.result = result;
      btn.querySelector(':scope > .w-opt-mark').replaceChildren(result === 'correct' ? glyph('g-check-b', { size: 16, label: ui.feedback.correctPrefix })
        : result === 'wrong' ? glyph('g-cross', { size: 14.08, label: ui.feedback.wrongPrefix }) : '');
    };

    function show(k) {
      const it = items[k];
      dots.set(k, k);
      zones.instruction.textContent = it.instruction || screen.instruction;
      zones.setTool();
      zones.setFeedback({ state: 'hint', text: it.hint || screen.hint }); // item 5 (select two) has its own hint
      (it.kind === 'tiles' ? tilesItem : choiceItem)(it, k);
    }
    const nextAction = (k) => (k < items.length - 1
      ? [{ id: 'nextQuestion', label: ui.buttons.nextQuestion, onClick: () => { show(k + 1); body.querySelector('button')?.focus(); } }]
      : []);
    function right(k, text, focusTarget) {
      dots.set(k, k + 1);
      const go = zones.setFeedback({ state: 'correct', text, actions: nextAction(k) });
      if (k === items.length - 1) { ctx.checkDone(); ctx.complete(); ctx.unlockNext({ focus: true }); return; }
      (go || focusTarget)?.focus();
    }

    /* ---- items 1 to 4 ---- */
    function choiceItem(it, k) {
      let chosen = -1, solved = false;
      const btns = it.options.map((o, i) => h('button', { class: 'w-opt w-ans w-kc-opt', type: 'button', dataset: { id: o.id, letter: letter(i) } },
        h('span', { class: 'w-kc-letter', 'aria-hidden': 'true' }, letter(i).toUpperCase()), h('span', { class: 'w-opt-label' }, o.label), h('span', { class: 'w-opt-mark' })));
      const group = h('div', { class: 'w-kc-grid', role: 'group', 'aria-labelledby': 'w-kc-stem' }, btns);
      arrowNav(group);
      body.replaceChildren(h('p', { class: 'w-context w-kc-stem', id: 'w-kc-stem' }, h('span', {}, it.stem)), group);
      btns.forEach((b, i) => b.addEventListener('click', () => {
        if (solved || i === chosen) return;
        chosen = i;
        const o = it.options[i];
        ctx.answer({ trackingId: it.trackingId, response: o.id, result: o.correct ? 'correct' : 'wrong' });
        btns.forEach((x, j) => mark(x, j === i ? (o.correct ? 'correct' : 'wrong') : ''));
        if (!o.correct) { zones.setFeedback({ state: 'wrong', text: o.feedback }); return; }
        solved = true;
        btns.forEach((x) => x.setAttribute('aria-disabled', 'true'));
        right(k, o.feedback, b);
      }));
    }

    /* ---- item 5: select two tiles, Check ---- */
    function tilesItem(it, k) {
      const need = it.select;
      const keys = it.tiles.map((t, i) => (t.correct ? i : -1)).filter((i) => i >= 0);
      const selected = new Set();
      let solved = false, marked = false;
      const btns = it.tiles.map((t) => h('button', { class: 'w-opt w-ans w-pick-tile w-kc-tile', type: 'button', 'aria-pressed': 'false', dataset: { n: String(t.n) } },
        h('span', { class: 'w-tile-num', 'aria-hidden': 'true' }, String(t.n)), h('span', { class: 'w-opt-label' }, t.text), h('span', { class: 'w-opt-mark' })));
      const group = h('div', { class: 'w-kc-tiles', role: 'group', 'aria-labelledby': 'w-instruction' }, btns);
      arrowNav(group, { selector: '.w-kc-tile', cols: 2 });
      body.replaceChildren(group);
      const checkBtn = checkButton(ui, ui.buttons.check, null);
      zones.setTool(checkBtn);
      const update = () => {
        btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(selected.has(i))); if (!marked || !b.dataset.result) mark(b, ''); });
        checkBtn.disabled = selected.size !== need;
      };
      btns.forEach((b, i) => b.addEventListener('click', () => {
        if (solved) return;
        if (marked) { marked = false; btns.forEach((x) => mark(x, '')); }
        if (selected.has(i)) selected.delete(i); else if (selected.size < need) selected.add(i);
        update();
      }));
      checkBtn.addEventListener('click', () => {
        if (solved || selected.size !== need) return;
        const chosen = [...selected].sort((a, b) => a - b);
        const rightCount = chosen.filter((i) => keys.includes(i)).length;
        const ok = rightCount === keys.length;
        ctx.answer({ trackingId: it.trackingId, response: chosen.map((i) => String(it.tiles[i].n)).join(','), result: ok ? 'correct' : 'wrong' });
        chosen.forEach((i) => mark(btns[i], it.tiles[i].correct ? 'correct' : 'wrong'));
        if (ok) {
          solved = true;
          btns.forEach((x) => x.setAttribute('aria-disabled', 'true'));
          zones.setTool();
          right(k, keys.map((i) => it.tiles[i].feedback).join(' '));
          return;
        }
        const wrong = chosen.filter((i) => !it.tiles[i].correct);
        wrong.forEach((i) => selected.delete(i));
        marked = true;
        update();
        zones.setFeedback({ state: rightCount === 1 && keys.length === 2 ? 'partial' : 'wrong', verdict: rightCount === 1 && keys.length === 2 ? ui.feedback.oneOfTwo : ui.feedback.wrongPrefix, text: it.tiles[wrong[0]].feedback });
        btns[wrong[0]].focus();
      });
    }

    /* ---- the result card ---- */
    function result(focus) {
      const sc = ctx.score();
      dots.set(items.length - 1, items.length);
      zones.instruction.textContent = screen.instruction;
      body.replaceChildren(h('div', { class: 'w-kc-result', role: 'status' },
        h('p', { class: 'w-kc-result-line' }, fmt(screen.resultCard, { x: sc.x, n: items.length, pass: screen.passItems }))));
      ctx.complete();
      ctx.unlockNext({ focus });
    }

    if (ctx.revisit) { zones.setFeedback({ state: 'idle' }); result(false); }
    else show(0);
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
