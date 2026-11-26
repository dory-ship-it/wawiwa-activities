// prep: "Before you start" (EAI M2 L3, O3). The bridge from Lessons 1 and 2 (Noy, 23 Nov 2026: the opening must
// say what the learner did until now and where today's material comes from). One screen, two halves on the light
// "do" ground:
//   left   "Who you met": the NorthRiver people of Lesson 1 (initials, name, role), read only, with a link to the
//          persona cards (new tab) for a learner who wants the details or needs more pains
//   right  what to have open (the learner's own notes, each with the lesson it comes from), then one field: the
//          pain the learner follows through the lesson (the thread, PLAN-v2), and Save. Next after Save.
// Tracking: one neutral fill-in (the pain, trimmed), kept under screen.field.store for later screens and the coach.
// Content: people { title, items: [{ initials, name, role }], link: { label, href } }, have [{ icon, label, from }],
// field { label, store, trackingId, maxLength, placeholder }, save (a ui.buttons key), feedback { saved, empty }.
import { h } from '../src/util.js?v=044f9db2';
import { glyph, icon } from '../src/icons.js?v=044f9db2';
import { art } from './art.js?v=044f9db2';
import { layout, focusHead } from '../src/templates/stage.js?v=044f9db2';
import { field } from '../src/templates/input.js?v=044f9db2';

export const prep = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const announcer = h('p', { class: 'w-sr-only', 'aria-live': 'polite' });

    const people = h('section', { class: 'm-prep-card m-prep-people', 'aria-labelledby': 'm-prep-people-h' },
      h('div', { class: 'm-prep-card-head' },
        h('h2', { id: 'm-prep-people-h' }, screen.people.title),
        screen.people.link ? h('a', { class: 'm-prep-link', href: screen.people.link.href, target: '_blank', rel: 'noopener' },
          h('span', {}, screen.people.link.label), icon('external-link', { size: 16 })) : null),
      // round 3 (25 Nov 2026, Noy: the building read as unrelated): the people you met as a phone's contacts list, a
      // coloured initials circle, the name and the role on each row, so it reads at once as "people you were in
      // contact with". Read only.
      h('ul', { class: 'm-contacts' }, screen.people.items.map((p, i) => h('li', { class: 'm-contact', dataset: { tone: String(i % 5) } },
        h('span', { class: 'm-avatar', 'aria-hidden': 'true' }, p.initials),
        h('span', { class: 'm-person' }, h('b', {}, p.name), h('span', {}, p.role))))));

    // the field's help line (Noy, 23 Nov 2026): this pain goes with the learner through the lesson
    const helpId = 'm-prep-help';
    const f = field(screen.field, ctx, screen.field.help ? helpId : null, announcer);
    const help = screen.field.help ? h('p', { class: 'm-prep-help', id: helpId }, icon('route', { size: 20 }), h('span', {}, screen.field.help)) : null;
    const save = h('button', { class: 'm-prep-save', type: 'button', dataset: { action: 'save' } }, ui.buttons[screen.save] || 'Save');
    const fill = () => { save.disabled = !f.input.value.trim(); };
    f.input.addEventListener('input', fill);
    fill();
    // the field and Save on one line (Noy, 23 Nov 2026): the label above, the counter under the field
    const inputRow = h('div', { class: 'm-input-row' });
    f.input.replaceWith(inputRow);
    inputRow.append(f.input, save);
    const have = h('section', { class: 'm-prep-card m-prep-have', 'aria-labelledby': 'm-prep-have-h' },
      h('div', { class: 'm-prep-card-head' }, h('h2', { id: 'm-prep-have-h' }, screen.haveTitle)),
      h('ul', { class: 'm-have' }, screen.have.map((x) => h('li', {},
        h('span', { class: 'm-have-icon', 'aria-hidden': 'true' }, x.art ? art(x.art, 34) : icon(x.icon, { size: 22 })),
        h('b', {}, x.label), h('span', { class: 'm-have-from' }, x.from)))),
      h('div', { class: 'm-prep-thread' }, f.el, help),
      zones.band);

    layout(ctx, 'prep', focusHead(screen.eyebrow, 'overview', zones.instruction), h('div', { class: 'm-prep' }, people, have), announcer);
    zones.setHintVisible(false);
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const saved = (focus) => { zones.setFeedback({ state: 'neutral', tone: 'correct', text: screen.feedback.saved }); ctx.unlockNext({ focus }); };
    save.addEventListener('click', () => {
      const v = f.input.value.trim();
      if (!v) { zones.setFeedback({ state: 'notice', text: screen.feedback.empty }); f.input.focus(); return; }
      ctx.store.set(screen.field.store, v);
      ctx.answer({ trackingId: screen.field.trackingId, response: v, result: 'neutral' });
      ctx.complete();
      saved(true);
    });
    f.input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !save.disabled) { e.preventDefault(); save.click(); } });
    if (ctx.revisit) saved(false);
    return { unmount() {} };
  },
};
