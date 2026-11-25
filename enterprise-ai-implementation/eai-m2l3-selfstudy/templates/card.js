// card: the learner's growing Opportunity Card (EAI M2 L3). Design pass 2 (24 Nov 2026, Noy: "a professional strategic
// business tool, not a spreadsheet"): a consulting one-pager. Each zone is built for what it holds:
//   title band   dark: the document's name, its id and the client; a ring that fills field by field
//   the problem  the process as a small tag, the PAIN as the page's headline, then a "why" connector down to the root
//                cause: the reading order of the deck's own logic (a pain, traced to its cause)
//   the people   two figures, the Pain Owner and the Owner / Sponsor, each with the name written under it
//   opportunity  the opportunity sentence, then the solution category as a coloured stamp (the lesson's category
//                code: the same colour and drawing as the categories board and the sort piles), then the tools
//   readiness    the four data-sensitivity tiers as a scale (the chosen one lit), and effort / value
// Empty fields are drawn as what they will become (a blank stamp, an unlit scale), with the chapter that fills them.
// Inputs replace the fields this screen fills. Logic unchanged: intro is a presentation; build saves the lit fields to
// the store (one neutral fill-in each) and unlocks Next.
// Content: eyebrow, line, cardTitle, cardId, client, meter, zones, why, rows [{ id, label, store, when }], tiers,
// categories [{ name, cat, art }], fill [...], save, feedback { saved, empty }, laterSr.
import { h, fmt } from '../src/util.js?v=34b6caae';
import { layout, focusHead } from '../src/templates/stage.js?v=34b6caae';
import { art } from './art.js?v=34b6caae';

const NS = 'http://www.w3.org/2000/svg';
function ring(done, total) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 44 44'); s.setAttribute('class', 'm-op-ring'); s.setAttribute('aria-hidden', 'true');
  const c = 2 * Math.PI * 18;
  s.innerHTML = `<circle cx="22" cy="22" r="18" class="bg"/><circle cx="22" cy="22" r="18" class="fg" stroke-dasharray="${(c * done / total).toFixed(1)} ${c.toFixed(1)}"/>`;
  return s;
}

export const card = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const fills = Object.fromEntries((screen.fill || []).map((f) => [f.row, f]));
    const R = Object.fromEntries(screen.rows.map((r) => [r.id, r]));
    const val = (id) => ctx.store.get(R[id].store);
    const controls = [];
    const later = (id) => h('span', { class: 'm-op-when' }, h('span', { class: 'w-sr-only' }, screen.laterSr + ' '), R[id].when);
    const input = (id) => {
      const f = fills[id]; const domId = 'm-card-' + id;
      const el = f.kind === 'select'
        ? h('select', { class: 'm-card-input', id: domId }, h('option', { value: '' }, f.placeholder || ''), f.options.map((o) => h('option', { value: o }, o)))
        : h('input', { class: 'm-card-input', id: domId, type: 'text', maxlength: String(f.maxLength || 140), placeholder: f.placeholder || '', autocomplete: 'off' });
      el.value = val(id) || '';
      controls.push({ r: R[id], f, input: el });
      return el;
    };
    // one field: its label, then an input, the learner's words, or the empty state
    const field = (id, cls) => {
      const label = fills[id] ? h('label', { class: 'm-op-label', for: 'm-card-' + id }, R[id].label) : h('span', { class: 'm-op-label' }, R[id].label);
      const body = fills[id] ? input(id) : val(id) ? h('span', { class: 'm-op-value' }, val(id)) : h('span', { class: 'm-op-line' }, later(id));
      return h('div', { class: 'm-op-field ' + (cls || ''), dataset: { state: fills[id] ? 'now' : val(id) ? 'done' : 'later', row: id } }, label, body);
    };

    const zoneHead = (id, artName) => h('h2', { class: 'm-op-zone-h', id: 'm-op-h-' + id }, art(artName, 20), h('span', {}, screen.zones[id]));
    const problem = h('section', { class: 'm-op-zone m-op-problem', 'aria-labelledby': 'm-op-h-problem' },
      zoneHead('problem', 'problem'),
      field('process', 'm-op-small'),
      field('pain', 'm-op-headline'),
      h('div', { class: 'm-op-why', 'aria-hidden': 'true' }, h('i'), h('span', {}, screen.why)),
      field('root', 'm-op-root'));
    const figure = (id, artName) => h('div', { class: 'm-op-figure', dataset: { filled: String(!!val(id) || !!fills[id]) } }, art(artName, 44), field(id, 'm-op-person'));
    const people = h('section', { class: 'm-op-zone m-op-people', 'aria-labelledby': 'm-op-h-people' },
      zoneHead('people', 'people'), figure('painOwner', 'painOwner'), figure('owner', 'sponsor'));
    const catOf = (name) => screen.categories.find((c) => c.name === name);
    const stamp = () => {
      const c = catOf(val('category'));
      if (!c) return h('span', { class: 'm-op-stamp', dataset: { cat: 'none' } }, h('span', { class: 'm-op-stamp-set', 'aria-hidden': 'true' }, screen.categories.map((x) => art(x.art, 18))), later('category'));
      return h('span', { class: 'm-op-stamp', dataset: { cat: c.cat } }, art(c.art, 22), h('b', {}, c.name));
    };
    const opportunity = h('section', { class: 'm-op-zone m-op-opp', 'aria-labelledby': 'm-op-h-opportunity' },
      zoneHead('opportunity', 'opportunity'),
      field('opportunity', 'm-op-sentence'),
      fills.category ? field('category') : h('div', { class: 'm-op-field', dataset: { row: 'category', state: val('category') ? 'done' : 'later' } }, h('span', { class: 'm-op-label' }, R.category.label), stamp()),
      field('tools'));
    const tier = val('sensitivity');
    const scale = h('ol', { class: 'm-op-scale', 'aria-label': R.sensitivity.label }, screen.tiers.map((t, i) => h('li', { dataset: { on: String(tier === t), lvl: String(i + 1) } }, h('i', { 'aria-hidden': 'true' }), h('span', {}, t))));
    const readiness = h('section', { class: 'm-op-zone m-op-ready', 'aria-labelledby': 'm-op-h-readiness' },
      zoneHead('readiness', 'readiness'),
      h('div', { class: 'm-op-field', dataset: { row: 'sensitivity', state: tier ? 'done' : 'later' } }, h('span', { class: 'm-op-label' }, R.sensitivity.label), scale, tier ? null : later('sensitivity')),
      field('effort', 'm-op-small'));

    const count = () => screen.rows.filter((r) => ctx.store.get(r.store)).length;
    const meter = h('span', { class: 'm-op-meter' });
    const paintMeter = () => meter.replaceChildren(ring(count(), screen.rows.length), h('span', {}, fmt(screen.meter, { n: count(), total: screen.rows.length })));
    paintMeter();
    const save = controls.length ? h('button', { class: 'm-prep-save', type: 'button', dataset: { action: 'save' } }, ui.buttons[screen.save] || 'Save') : null;
    const doc = h('article', { class: 'm-op', 'aria-label': screen.cardTitle },
      h('header', { class: 'm-op-band' },
        h('span', { class: 'm-op-kicker' }, screen.cardTitle), h('span', { class: 'm-op-id' }, screen.cardId),
        h('span', { class: 'm-op-client' }, screen.client), meter),
      h('div', { class: 'm-op-body' }, problem, people, opportunity, readiness),
      save ? h('div', { class: 'm-card-foot m-op-foot' }, h('div', { class: 'm-card-band' }, zones.band), save) : null);
    layout(ctx, 'card', focusHead(screen.eyebrow, 'write', zones.instruction, screen.line ? h('p', { class: 'w-concept-text m-card-line' }, screen.line) : null), doc);
    zones.setHintVisible(false);
    if (!controls.length) return { unmount() {} };

    zones.setFeedback({ state: 'hint', text: screen.hint });
    const filled = () => controls.every((c) => c.input.value.trim());
    const fill = () => { save.disabled = !filled(); };
    controls.forEach((c) => c.input.addEventListener(c.f.kind === 'select' ? 'change' : 'input', fill));
    fill();
    const saved = (focus) => { zones.setFeedback({ state: 'neutral', tone: 'correct', text: screen.feedback.saved }); ctx.unlockNext({ focus }); };
    save.addEventListener('click', () => {
      if (!filled()) { zones.setFeedback({ state: 'notice', text: screen.feedback.empty }); return; }
      controls.forEach((c) => {
        const v = c.input.value.trim();
        ctx.store.set(c.r.store, v);
        ctx.answer({ trackingId: c.f.trackingId, response: v, result: 'neutral' });
      });
      paintMeter();
      ctx.complete();
      saved(true);
    });
    if (ctx.revisit) saved(false);
    else ctx.need(ui.footer.need.card);
    return { unmount() {} };
  },
};
