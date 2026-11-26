// whys: the 5-Whys as a shaft that goes down from the pain to its root (EAI M2 L3, F1; deck slide 12).
// A learn screen on the dark ground (STANDARD 1.6: dark = learn). The pain sits at the surface; each press
// of "Why?" opens the next level one step deeper, marked by a large W and its number. After the last why
// the root lights up at the bottom of the shaft (the only glow, at that card's edge) and Next unlocks.
// The button always sits where the next level will appear, so the eye and the hand stay on the shaft.
// Motion shows the method itself (going one level deeper), once per level, none with reduced motion.
// Not tracked: nothing is graded here (the learner's own 5-Whys is the next practice screen).
// Content: label (the key pill), cardField (which field of the learner's card this fills), surface
// { label, text }, whys [text], root { label, text }, button (a ui.buttons key).
// Kit candidate: written for this lesson's templates/; noted in _selfstudy-kit/REPORT.md for the catalog.
import { h, reducedMotion } from '../src/util.js?v=044f9db2';
import { glyph } from '../src/icons.js?v=044f9db2';
import { layout } from '../src/templates/stage.js?v=044f9db2';

export const whys = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    // practice: the levels' right answers are the chain (screen.levels[i].options, the correct one)
    if (screen.variant === 'practice') screen.whys = screen.levels.map((l) => l.options.find((o) => o.correct).label);
    const total = screen.whys.length;
    const still = reducedMotion();
    let shown = 0;

    const live = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });
    const level = (i, text) => h('li', { class: 'm-why', dataset: { depth: String(i + 1) } },
      h('span', { class: 'm-why-badge', 'aria-hidden': 'true' }, h('b', {}, 'W'), h('small', {}, String(i + 1))),
      h('span', { class: 'm-why-q' }, ui.buttons[screen.button] || 'Why?'),
      h('span', { class: 'm-why-text' }, text));
    const levels = screen.whys.map((t, i) => level(i, t));
    const root = h('li', { class: 'm-why-root', hidden: true },
      h('span', { class: 'm-root-label' }, glyph('g-check-b', { size: 17.92 }), h('span', {}, screen.root.label)),
      h('b', { class: 'm-root-text' }, screen.root.text));
    const surface = h('li', { class: 'm-why-surface' },
      h('span', { class: 'm-surface-label' }, screen.surface.label), h('b', { class: 'm-surface-text' }, screen.surface.text));
    levels.forEach((l) => { l.hidden = true; });
    const btn = h('button', { class: 'm-why-btn', type: 'button', dataset: { action: 'why' } },
      h('span', { class: 'm-why-btn-w', 'aria-hidden': 'true' }, 'W'), h('span', {}, ui.buttons[screen.button] || 'Why?'));
    const slot = h('li', { class: 'm-why-slot' }, btn);
    const shaft = h('ol', { class: 'm-shaft', 'aria-label': screen.label }, surface, ...levels, slot, root);

    const head = h('div', { class: 'w-focus-head' },
      h('div', { class: 'm-head-row' },
        h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)),
        screen.cardField ? h('p', { class: 'm-card-field' }, h('span', { class: 'm-card-icon', 'aria-hidden': 'true' }), h('span', {}, screen.cardField)) : null,
        // round 3 (Noy: "shouldn't it say this is an example?"): whose case this is, before the heading (eye order),
        // on the chips' row so the shaft keeps its place
        screen.context ? h('p', { class: 'm-context-line m-context-inrow' }, screen.context) : null),
      zones.instruction);
    // the depth gauge: the slide's own words, "from symptom to root cause"
    const gauge = screen.depth ? h('div', { class: 'm-depth', 'aria-hidden': 'true' }, h('span', {}, screen.depth.top), h('i'), h('span', {}, screen.depth.bottom)) : null;
    layout(ctx, 'whys', head, h('div', { class: 'm-shaft-wrap' }, gauge, shaft), live);
    zones.setHintVisible?.(false);

    const reveal = (el) => {
      el.hidden = false;
      if (!still) { el.classList.add('m-enter'); el.addEventListener('animationend', () => el.classList.remove('m-enter'), { once: true }); }
    };
    const finish = (focus) => {
      slot.remove();
      reveal(root);
      if (!still) root.classList.add('m-root-lit');
      live.textContent = screen.root.label + ': ' + screen.root.text;
      ctx.complete();
      ctx.unlockNext({ focus });
    };
    // practice (F2): at each level the learner picks the next "why" from two; one try per level. A right pick
    // opens the level; a wrong one opens it too, with the right answer, marked "Not quite", and the why of it in
    // the feedback card. One graded interaction for the whole chain: the picks in order, right only if all were.
    if (screen.variant === 'practice') {
      const picks = [];
      const choices = h('div', { class: 'm-why-choices', role: 'group', 'aria-label': ui.buttons[screen.button] || 'Why?' });
      btn.replaceWith(h('span', { class: 'm-why-btn-w m-why-ask', 'aria-hidden': 'true' }, 'W'), h('span', { class: 'm-why-q' }, ui.buttons[screen.button] || 'Why?'), choices);
      const paint = () => {
        const lv = screen.levels[shown];
        choices.replaceChildren(...lv.options.map((o) => {
          const b = h('button', { class: 'm-why-choice', type: 'button', dataset: { id: o.id } }, o.label);
          b.addEventListener('click', () => choose(o));
          return b;
        }));
      };
      const choose = (o) => {
        const lv = screen.levels[shown];
        picks.push(o.id);
        const el = levels[shown++];
        if (!o.correct) { el.dataset.result = 'wrong'; zones.setFeedback({ state: 'wrong', verdict: ui.feedback.revealed, text: lv.why }); }
        else zones.setFeedback({ state: 'correct', text: lv.why });
        reveal(el);
        el.after(slot);
        slot.dataset.depth = String(shown + 1);
        if (shown === total) {
          const right = screen.levels.every((l, i) => l.options.find((x) => x.id === picks[i])?.correct);
          ctx.answer({ trackingId: screen.tracking[0].id, response: picks.join(','), result: right ? 'correct' : 'wrong' });
          finish(true);
        } else { paint(); choices.querySelector('button').focus(); }
      };
      layout(ctx, 'whys', h('div', { class: 'w-float m-why-band' }, zones.band));
      if (ctx.revisit) { levels.forEach((l) => { l.hidden = false; }); shown = total; levels[total - 1].after(slot); finish(false); }
      else { paint(); slot.dataset.depth = '1'; ctx.need(ui.footer.need.whysPractice); }
      return { unmount() {} };
    }

    btn.addEventListener('click', () => {
      if (shown >= total) return;
      const el = levels[shown++];
      reveal(el);
      live.textContent = el.querySelector('.m-why-text').textContent;
      el.after(slot); // the button moves one level down, to where the next answer will open
      slot.dataset.depth = String(shown + 1);
      if (shown === total) finish(true); else btn.focus();
      if (shown < total) ctx.need(ui.footer.need.whys);
    });

    if (ctx.revisit) { levels.forEach((l) => { l.hidden = false; }); shown = total; levels[total - 1].after(slot); finish(false); }
    else { slot.dataset.depth = '1'; ctx.need(ui.footer.need.whys); }
    return { unmount() {} };
  },
};
