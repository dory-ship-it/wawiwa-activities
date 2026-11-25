// flowCompare: two regions' flows side by side, then a tool added to the broken one (EAI M2 L3, C1; deck slide 5:
// "Automating a flawed workflow just makes the flaw run faster"). A learn screen on the dark ground.
// Two lanes, each: its name, its steps as boxes with arrows, the result at the end. One button adds the tool to the
// second lane (a lit box); its result changes, and the key line opens under the lanes. Next after the button.
// Motion: the tool box drops into the lane once; none with reduced motion.
// Content: label (the key pill), lanes [{ name, steps: [text], result, tone }], add { button, step, result }, keyLine.
import { h, reducedMotion } from '../src/util.js?v=c6cdc63e';
import { glyph, icon } from '../src/icons.js?v=c6cdc63e';
import { art } from './art.js?v=c6cdc63e';
import { layout } from '../src/templates/stage.js?v=c6cdc63e';

export const flowCompare = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    // design pass (24 Nov 2026): each region is a route: its name with a pin, the steps as stations on one line, and the
    // result as the route's large end mark (the comparison reads from the two results, 14 minutes against 11 hours)
    const arrow = () => h('span', { class: 'm-flow-arrow', 'aria-hidden': 'true' });
    const station = (text, cls = '') => h('li', { class: 'm-flow-step ' + cls }, h('i', { class: 'm-flow-dot', 'aria-hidden': 'true' }), h('span', {}, text));
    const lanes = screen.lanes.map((l) => {
      const result = h('b', { class: 'm-flow-result', dataset: { tone: l.tone || 'good' } }, l.result);
      const steps = h('ol', { class: 'm-flow-steps' }, l.steps.map((s) => station(s)), h('li', { class: 'm-flow-end' }, art('clock', 26), result));
      // round 3 (25 Nov 2026, C1's new example): the payments as dots along the lane, a few of them wrong (red). Still at
      // first; once the tool is added they run, faster, three times, and the wrong ones go out with them: the flaw
      // running faster, shown rather than said
      const stream = screen.stream ? h('div', { class: 'm-flow-stream', 'aria-hidden': 'true' }, Array.from({ length: screen.stream.dots }, (_, k) => {
        const d = h('i', { dataset: { bad: String(screen.stream.bad.includes(k)) } });
        d.style.setProperty('--k', String(k));
        return d;
      })) : null;
      return { l, steps, result, el: h('div', { class: 'm-flow-lane', dataset: { tone: l.tone || 'good' } }, h('span', { class: 'm-flow-name' }, art('pin', 24), h('span', {}, l.name)), steps, stream) };
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
      const box = h('li', { class: 'm-flow-step m-flow-tool' }, h('i', { class: 'm-flow-dot', 'aria-hidden': 'true' }, art(screen.add.art || 'agent', 22)), h('span', {}, screen.add.step));
      const end = target.steps.querySelector('.m-flow-end');
      end.before(box);
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
