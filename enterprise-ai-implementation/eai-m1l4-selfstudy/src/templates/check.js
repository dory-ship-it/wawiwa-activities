// Knowledge check template (S21), layout "wide": scored items one at a time, item dots top right.
//   items 1 to 4  the stem (scenario icon) and four options 2x2 with letter badges; a click answers.
//   item 5        eight tiles in two columns of four: select two, then Check in the band.
// Wrong = the calm wrong mark and the option's line, retry allowed; right = "Next question" in the
// band. ONLY THE FIRST ATTEMPT COUNTS: the engine keeps it per interaction id (later tries go out as
// retries), and the result card counts first attempts: "x of 5 on first try. Pass mark: 4 of 5."
// The score (0 to 100) and passed / failed are set at Finish (S22), from the same first attempts.
import { h, fmt } from '../util.js';
import { icon } from '../icons.js';
import { letter } from '../tracking/index.js';
import { layout, progressDots, arrowNav } from './stage.js';

export const check = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const items = screen.items;
    const dots = progressDots(items.length, (i, n) => fmt(ui.progress.question, { i, n }));
    const body = h('div', { class: 'w-kc-body', dataset: { interaction: '' } });
    layout(ctx, 'wide', zones.logo,
      h('div', { class: 'w-wide' }, h('div', { class: 'w-kc-head' }, zones.instruction, dots.el), body, zones.band));

    const mark = (btn, result) => {
      btn.dataset.result = result;
      btn.querySelector(':scope > .w-opt-mark').replaceChildren(result === 'correct' ? icon('check', { size: 16, label: ui.feedback.correctPrefix })
        : result === 'wrong' ? icon('x', { size: 16, label: ui.feedback.wrongPrefix }) : '');
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
      if (k === items.length - 1) { result(true); return; }
      (go || focusTarget)?.focus();
    }

    /* ---- items 1 to 4 ---- */
    function choiceItem(it, k) {
      let chosen = -1, solved = false;
      const btns = it.options.map((o, i) => h('button', { class: 'w-opt w-kc-opt', type: 'button', dataset: { id: o.id, letter: letter(i) } },
        h('span', { class: 'w-kc-letter', 'aria-hidden': 'true' }, letter(i).toUpperCase()), h('span', { class: 'w-opt-label' }, o.label), h('span', { class: 'w-opt-mark' })));
      const group = h('div', { class: 'w-kc-grid', role: 'group', 'aria-labelledby': 'w-kc-stem' }, btns);
      arrowNav(group);
      body.replaceChildren(h('p', { class: 'w-situation-line w-kc-stem', id: 'w-kc-stem' }, icon(it.icon || 'speech', { size: 24 }), h('span', {}, it.stem)), group);
      btns.forEach((b, i) => b.addEventListener('click', () => {
        if (solved || i === chosen) return;
        chosen = i;
        const o = it.options[i];
        ctx.answer({ trackingId: it.trackingId, response: letter(i), result: o.correct ? 'correct' : 'wrong' });
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
      const btns = it.tiles.map((t) => h('button', { class: 'w-opt w-pick-tile w-kc-tile', type: 'button', 'aria-pressed': 'false', dataset: { n: String(t.n) } },
        h('span', { class: 'w-tile-num', 'aria-hidden': 'true' }, String(t.n)), h('span', { class: 'w-opt-label' }, t.text), h('span', { class: 'w-opt-mark' })));
      const group = h('div', { class: 'w-kc-tiles', role: 'group', 'aria-labelledby': 'w-instruction' }, btns);
      arrowNav(group, { selector: '.w-kc-tile', cols: 2 });
      body.replaceChildren(group);
      const checkBtn = h('button', { class: 'w-btn w-btn-action', type: 'button', dataset: { action: 'check' }, disabled: true }, ui.buttons.check);
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
        zones.setFeedback({ state: 'wrong', verdict: rightCount === 1 && keys.length === 2 ? ui.feedback.oneOfTwo : ui.feedback.wrongPrefix, text: it.tiles[wrong[0]].feedback });
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
