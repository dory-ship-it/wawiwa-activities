// flowCompare: two regions' flows side by side, then a tool added to the broken one (EAI M2 L3, C1; deck slide 5:
// "Automating a flawed workflow just makes the flaw run faster"). A learn screen on the dark ground.
// Two lanes, each: its name, its steps as boxes with arrows, the result at the end. One button adds the tool to the
// second lane (a lit box); its result changes, and the key line opens under the lanes. Next after the button.
// Motion: the tool box drops into the lane once; none with reduced motion.
// Content: label (the key pill), lanes [{ name, steps: [text], result, tone }], add { button, step, result }, keyLine.
import { h, reducedMotion } from '../src/util.js?v=f95774b5';
import { glyph, icon } from '../src/icons.js?v=f95774b5';
import { layout } from '../src/templates/stage.js?v=f95774b5';

export const flowCompare = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const arrow = () => h('span', { class: 'm-flow-arrow', 'aria-hidden': 'true' }, glyph('g-arrow', { size: 20 }));
    const lanes = screen.lanes.map((l) => {
      const result = h('b', { class: 'm-flow-result', dataset: { tone: l.tone || 'good' } }, l.result);
      const steps = h('ol', { class: 'm-flow-steps' }, l.steps.map((s, i) => [i ? arrow() : null, h('li', { class: 'm-flow-step' }, s)]), arrow(), h('li', { class: 'm-flow-end' }, result));
      return { l, steps, result, el: h('div', { class: 'm-flow-lane', dataset: { tone: l.tone || 'good' } }, h('span', { class: 'm-flow-name' }, l.name), steps) };
    });
    const key = h('p', { class: 'm-flow-key', hidden: true }, screen.keyLine);
    const btn = h('button', { class: 'm-why-btn m-flow-btn', type: 'button', dataset: { action: 'add' } }, icon('spark', { size: 22 }), h('span', {}, ui.buttons[screen.add.button] || screen.add.button));
    const live = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
    const head = h('div', { class: 'w-focus-head' },
      h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)), zones.instruction);
    layout(ctx, 'flow', head, h('div', { class: 'm-flow' }, lanes.map((x) => x.el), h('div', { class: 'm-flow-foot' }, btn, key)), live);
    zones.setHintVisible(false);

    const target = lanes[lanes.length - 1];
    const add = (focus) => {
      if (btn.hidden) return;
      const box = h('li', { class: 'm-flow-step m-flow-tool' }, icon('spark', { size: 18 }), h('span', {}, screen.add.step));
      const end = target.steps.querySelector('.m-flow-end');
      end.before(box, arrow());
      if (!reducedMotion() && focus) box.classList.add('m-enter');
      target.result.textContent = screen.add.result;
      target.el.dataset.added = 'true';
      btn.hidden = true;
      key.hidden = false;
      live.textContent = screen.add.result + ' ' + screen.keyLine;
      ctx.complete();
      ctx.unlockNext({ focus });
    };
    btn.addEventListener('click', () => add(true));
    if (ctx.revisit) add(false); else ctx.need(ui.footer.need.flowCompare);
    return { unmount() {} };
  },
};
