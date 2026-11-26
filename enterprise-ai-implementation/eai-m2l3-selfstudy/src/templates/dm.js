// DM Module 2 Lesson 2 templates (Phase 1: Opening, Where are we?, Our goals). Each screen starts from
// its deck slide and only adds interaction; the look, the shell and the UX rules are the template's
// (eai-m1l4-selfstudy-v3). Styles: src/dm.css. All text comes from content/m2l2.json.
//   bring          (O3)  slide 3's table: "What you bring" | "What it becomes today". The right cell of each
//                        row is hidden until the row is clicked; Next after all three.
//   workbookStop   (WB0 to WB3) the same panel every time: the workbook picture, the heading, one line naming
//                        what to fill, "Open the workbook" (new tab). Next after the button was pressed
//                        (honour system: the lesson cannot see the workbook).
//   questionTiles  (S05) four question tiles, one open at a time (the open tile takes the space, the others
//                        shrink); an answered tile closes with a check and a short summary. Neutral.
//   questionCards  (S06) six cards, each "I can answer" or "Gap"; the card then shows where the answer lives.
//                        Neutral.
//   dimensionMap   (K1)  two views: a map of eight icon nodes on a line with a card under the selected node,
//                        and a detail view (a light list left; the question, the values as chips and the
//                        required insight right; progress dots and "Next: ..."). Next after all eight.
//   goalCards      (S11) five coloured cards in a row; a click opens the card's line under the row.
//   closing        (K2, K3) a component closes: its questions or its key line beside the four-node board,
//                        whose node gets its check (the trainer ticking the board).
// Shared parts: keyLine() (one sentence of the trainer's, in the quote style: a turquoise rule and larger
// type; at most one per screen) and boardEl() (the four components).
// Nothing here is graded or sent to the LMS: answers live in the screen's flags (suspend data) only.
import { h, fmt, resolveLink, reducedMotion } from '../util.js?v=044f9db2';
import { glyph, icon } from '../icons.js?v=044f9db2';
import { layout, sheet, picture, arrowNav } from './stage.js?v=044f9db2';

/* ---------- shared parts ---------- */
// fill(el, ...children): replaceChildren without the empty ones (replaceChildren(null) would print "null")
export const fill = (el, ...children) => el.replaceChildren(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
export const keyLine = (text, kind = '') => h('figure', { class: ('d-keyline ' + kind).trim() }, h('p', {}, text));

export const headOf = (ctx, eyebrow = null, ...more) => h('div', { class: 'd-head' }, eyebrow ? h('p', { class: 'd-eyebrow' }, eyebrow) : null, ctx.zones.instruction, more);
// the band (the hint for screen readers; a feedback card when a screen has one), centred under the task
export const floatBand = (ctx, kind = '') => h('div', { class: ('w-float d-float ' + kind).trim() }, ctx.zones.band);
// what is still missing, for the line a twice-pressed locked Next shows
export const needLeft = (ctx, n) => ctx.need(n > 0 ? fmt(n === 1 ? ctx.ui.footer.needLeft1 : ctx.ui.footer.needLeft, { n }) : '');
// the hand rests beside an element, never on its text (fx, fy: where in the element's box, 0 to 1)
export const beside = (el, fx, fy) => () => { const r = el.getBoundingClientRect(); return r.width ? { x: r.left + fx * r.width, y: r.top + fy * r.height } : null; };

// The four components on a line (slide 2). nodes: [{ id, n, title, status: done | now | next }].
// tick: the node that gets its check now, with one short pop (none with reduced motion, none on a revisit).
export function boardEl(ctx, { nodes, tick = null }) {
  const { ui } = ctx;
  const word = { done: ui.dm.boardDone, now: ui.dm.boardNow, next: ui.dm.boardNext };
  const items = nodes.map((nd) => {
    const disc = h('span', { class: 'd-board-disc', 'aria-hidden': 'true' });
    const sr = h('span', { class: 'w-sr-only' });
    const li = h('li', { class: 'd-board-node', dataset: { node: nd.id } }, disc, h('span', { class: 'd-board-name' }, nd.title), sr);
    const paint = (status) => {
      li.dataset.status = status;
      // (Noy, 16 Nov 2026: the number stays on a done component; a small check says it is done)
      fill(disc, nd.n, status === 'done' ? h('span', { class: 'd-done-badge' }, glyph('g-check-b', { size: 13 })) : null);
      sr.textContent = ', ' + word[status];
    };
    paint(nd.status);
    return { nd, li, paint };
  });
  const el = h('ol', { class: 'd-board', 'aria-label': ui.dm.boardLabel }, items.map((x) => x.li));
  const t = items.find((x) => x.nd.id === tick);
  let timer = null;
  if (t && !ctx.revisit && !reducedMotion()) {
    t.paint('now');
    timer = setTimeout(() => { t.paint('done'); t.li.classList.add('d-board-tick'); }, 900);
  }
  return { el, stop: () => clearTimeout(timer) };
}

/* ---------- bring (O3) ---------- */
export const bring = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const opened = new Set(ctx.revisit ? screen.rows.map((r) => r.id) : ctx.flags.get('r') || []);
    const update = (focus) => {
      if (opened.size === screen.rows.length) { ctx.complete(); ctx.unlockNext({ focus }); } else needLeft(ctx, screen.rows.length - opened.size);
    };
    const rows = screen.rows.map((r, i) => {
      const outId = 'd-bring-out-' + r.id;
      const out = h('div', { class: 'd-bring-out', id: outId, 'aria-live': 'polite' },
        h('span', { class: 'd-bring-closed', 'aria-hidden': 'true' }, icon('eye', { size: 20 }), h('span', {}, ui.dm.rowClosed)));
      const btn = h('button', { class: 'd-bring-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': outId, dataset: { row: r.id } },
        h('span', { class: 'd-bring-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'd-bring-text' }, r.bring));
      const el = h('div', { class: 'd-bring-row', dataset: { open: 'false' } }, btn, out);
      const open = (byLearner) => {
        if (el.dataset.open === 'true') return;
        el.dataset.open = 'true';
        btn.setAttribute('aria-expanded', 'true');
        out.replaceChildren(h('span', { class: 'w-sr-only' }, screen.head[1] + ': '), r.keyLine ? keyLine(r.keyLine) : h('p', { class: 'd-bring-becomes' }, r.becomes));
        if (!byLearner) return;
        opened.add(r.id);
        ctx.flags.set('r', [...opened]);
        update(false);
      };
      btn.addEventListener('click', () => open(true));
      out.addEventListener('click', () => open(true));
      if (opened.has(r.id)) open(false);
      return { el, out };
    });
    const table = h('div', { class: 'd-bring', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } },
      h('div', { class: 'd-bring-head', 'aria-hidden': 'true' }, h('span', {}, screen.head[0]), h('span', {}, screen.head[1])),
      rows.map((x) => x.el));
    layout(ctx, 'dm-bring', headOf(ctx, screen.eyebrow), table, floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (!ctx.revisit && !opened.size) ctx.ghost({ type: screen.ghost?.type || 'rows', steps: () => [{ point: beside(rows[0].out, 0.12, 0.72), hold: 1100 }] });
    update(false);
    return { unmount() {} };
  },
};

/* ---------- workbookStop (WB0 to WB3) ---------- */
export const workbookStop = {
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    // (Noy, 15 Nov 2026) WB0 opens the workbook: the big button, and Next waits for it. WB1 to WB3 send the
    // learner back to the tab that is already open (screen.presentation: Next is open); the same link is
    // there as a small button, with its own short line, for a learner whose tab is closed.
    const back = !!screen.presentation;
    const open = h('a', { class: back ? 'w-btn w-btn-ghost d-wb-open d-wb-open-s' : 'w-btn w-btn-primary d-wb-open', href: resolveLink(content, screen.handoff.href), target: '_blank', rel: screen.handoff.rel, dataset: { action: 'open' } },
      h('span', {}, ui.buttons.openWorkbook), icon('external-link', { size: back ? 17 : 20 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')'));
    layout(ctx, 'focus', sheet('focus wb',
      h('div', { class: 'd-wb-grid', dataset: { interaction: '' } },
        h('figure', { class: 'd-wb-shot' }, picture(screen.image, 'd-wb-img')),
        h('div', { class: 'd-wb-body' }, zones.instruction, h('p', { class: 'd-wb-line' }, screen.line),
          back ? h('p', { class: 'd-wb-again' }, screen.again ? h('span', {}, screen.again) : null, open) : open)),
      zones.band));
    zones.setFeedback({ state: 'hint', text: '' });
    const opened = (announce) => {
      ctx.complete();
      ctx.unlockNext({ focus: false });
      if (announce) zones.setFeedback({ state: 'notice', text: screen.openFeedback });
    };
    open.addEventListener('click', () => { ctx.flags.set('o', 1); opened(true); }); // the link itself opens the new tab
    if (ctx.revisit || ctx.flags.get('o')) opened(false);
    return { unmount() {} };
  },
};

/* ---------- questionTiles (S05) ---------- */
export const questionTiles = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const saved = { ...(ctx.flags.get('a') || {}) }; // tile number -> 'y' | 'n', [option ids], or 1 (read)
    const grid = h('div', { class: 'd-qt', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '', open: '', done: 'false' } });
    const closing = h('section', { class: 'd-closing', 'aria-live': 'polite', hidden: true });
    let openN = null;

    const summaryOf = (t, v) => (t.kind === 'yesno' ? (v === 'y' ? ui.buttons.yes : ui.buttons.no)
      : t.kind === 'chips' ? t.options.filter((o) => v.includes(o.id)).map((o) => o.label).join(', ') : ui.dm.tileLater);

    const tiles = screen.tiles.map((t) => {
      const bodyId = 'd-tile-body-' + t.n;
      const mark = h('span', { class: 'd-tile-mark', 'aria-hidden': 'true' }, String(t.n));
      const sum = h('span', { class: 'd-tile-sum' });
      const sr = h('span', { class: 'w-sr-only' });
      const headBtn = h('button', { class: 'd-tile-head', type: 'button', 'aria-expanded': 'false', 'aria-controls': bodyId, dataset: { tile: String(t.n) } },
        mark, h('span', { class: 'd-tile-text' }, h('span', { class: 'd-tile-q' }, t.question), sum), sr);
      const body = h('div', { class: 'd-tile-body', id: bodyId, hidden: true });
      const el = h('section', { class: 'd-tile', dataset: { open: 'false', done: 'false', kind: t.kind } }, headBtn, body);
      const doneText = h('span', {});
      const doneBtn = h('button', { class: 'w-btn w-btn-action d-tile-done', type: 'button', dataset: { action: 'tileDone' }, disabled: true },
        glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }), doneText);
      let draft = null;
      const ready = (ok) => { doneBtn.disabled = !ok; doneText.textContent = ok ? ui.buttons.done : ui.dm.chooseFirst; };

      // the tile's own answer area, built each time the tile opens (from the saved answer, if any)
      function build() {
        draft = saved[t.n] ?? null;
        let area = null, extra = null;
        if (t.kind === 'yesno') {
          const btns = [['y', ui.buttons.yes], ['n', ui.buttons.no]].map(([v, label]) => h('button', { class: 'd-chip', type: 'button', 'aria-pressed': String(draft === v), dataset: { value: v } }, label));
          extra = h('figure', { class: 'd-tile-proof', hidden: !draft }, picture(t.image, 'd-tile-img'), h('figcaption', {}, t.note));
          btns.forEach((b) => b.addEventListener('click', () => {
            draft = b.dataset.value;
            btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            extra.hidden = false;
            ready(true);
          }));
          area = h('div', { class: 'd-chips', role: 'group', 'aria-label': t.question }, btns);
        } else if (t.kind === 'chips') {
          draft = Array.isArray(draft) ? [...draft] : [];
          const btns = t.options.map((o) => h('button', { class: 'd-chip', type: 'button', 'aria-pressed': String(draft.includes(o.id)), dataset: { value: o.id } }, o.label));
          btns.forEach((b, i) => b.addEventListener('click', () => {
            const o = t.options[i], on = b.getAttribute('aria-pressed') !== 'true';
            // an "only" chip (None yet) stands alone: it clears the others, and any other chip clears it
            if (on) draft = o.only ? [o.id] : [...draft.filter((id) => !t.options.find((x) => x.id === id)?.only), o.id];
            else draft = draft.filter((id) => id !== o.id);
            btns.forEach((x, k) => x.setAttribute('aria-pressed', String(draft.includes(t.options[k].id))));
            ready(draft.length > 0);
          }));
          area = h('div', { class: 'd-chips', role: 'group', 'aria-label': t.question }, btns);
        } else {
          draft = 1;
          area = h('p', { class: 'd-tile-note' }, t.text);
        }
        // (Noy, 15 Nov 2026: an open tile without a picture looked empty) the tile's own large icon beside the
        // answers; on tile 1 the screenshot takes its place once Yes or No is chosen
        const art = t.icon ? h('span', { class: 'd-tile-art', 'aria-hidden': 'true', hidden: t.kind === 'yesno' && !!draft }, icon(t.icon, { size: 76 })) : null;
        if (art && t.kind === 'yesno') area.addEventListener('click', () => { if (draft) art.hidden = true; });
        fill(body, h('div', { class: 'd-tile-main' }, h('div', { class: 'd-tile-ask' }, area, extra), art), h('div', { class: 'd-tile-foot' }, doneBtn));
        ready(t.kind === 'text' || (Array.isArray(draft) ? draft.length > 0 : !!draft));
      }
      function paint() {
        const v = saved[t.n];
        const done = v !== undefined;
        el.dataset.done = String(done);
        mark.replaceChildren(done ? glyph('g-check-b', { size: 17.92 }) : String(t.n));
        sum.textContent = done ? summaryOf(t, v) : '';
        sr.textContent = done ? ', ' + ui.dm.tileDone : '';
      }
      doneBtn.addEventListener('click', () => {
        if (doneBtn.disabled) return;
        saved[t.n] = draft;
        ctx.flags.set('a', saved);
        paint();
        show(null);
        const next = tiles.find((x) => saved[x.t.n] === undefined);
        update(!next);
        if (next) next.headBtn.focus();
      });
      headBtn.addEventListener('click', () => show(openN === t.n ? null : t.n));
      paint();
      return { t, el, headBtn, body, build };
    });

    function show(n) {
      openN = n;
      grid.dataset.open = n === null ? '' : String(n);
      tiles.forEach((x) => {
        const on = x.t.n === n;
        x.el.dataset.open = String(on);
        x.headBtn.setAttribute('aria-expanded', String(on));
        x.body.hidden = !on;
        if (on) x.build(); else x.body.replaceChildren();
      });
      closing.hidden = n !== null || grid.dataset.done !== 'true';
    }
    function update(focus) {
      const left = tiles.filter((x) => saved[x.t.n] === undefined).length;
      if (left) { needLeft(ctx, left); return; }
      const c = screen.closing, m = c.ifMissing;
      const missing = m && !(saved[m.tile] || []).includes(m.option);
      fill(closing, keyLine(c.keyLine), missing ? h('p', { class: 'd-closing-line' }, m.text) : null);
      grid.dataset.done = 'true';
      closing.hidden = openN !== null;
      ctx.complete();
      ctx.unlockNext({ focus });
    }

    grid.append(...tiles.map((x) => x.el));
    layout(ctx, 'dm-tiles', headOf(ctx, screen.eyebrow), grid, closing, floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (!ctx.revisit && !Object.keys(saved).length) ctx.ghost({ type: screen.ghost?.type || 'tiles', steps: () => [{ point: beside(tiles[0].headBtn, 0.9, 0.78), hold: 1100 }] });
    update(false);
    return { unmount() {} };
  },
};

/* ---------- questionCards (S06) ---------- */
export const questionCards = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const saved = { ...(ctx.flags.get('c') || {}) }; // card number -> 'c' (can answer) | 'g' (gap)
    const closing = h('section', { class: 'd-closing', 'aria-live': 'polite', hidden: true });
    const cards = screen.cards.map((c) => {
      const can = h('button', { class: 'w-btn d-qc-btn', type: 'button', dataset: { action: 'can' } }, glyph('g-check-b', { size: 16 }), h('span', {}, ui.buttons.canAnswer));
      const gap = h('button', { class: 'w-btn d-qc-btn', type: 'button', dataset: { action: 'gap' } }, icon('help-circle', { size: 18 }), h('span', {}, ui.buttons.gap));
      const actions = h('div', { class: 'd-qc-actions', role: 'group', 'aria-label': c.question }, can, gap);
      const back = h('div', { class: 'd-qc-back', 'aria-live': 'polite', hidden: true });
      const el = h('article', { class: 'd-qc', dataset: { state: '', card: String(c.n) } }, h('p', { class: 'd-qc-q' }, c.question), actions, back);
      const set = (v, byLearner) => {
        el.dataset.state = v;
        actions.hidden = true;
        back.hidden = false;
        back.replaceChildren(
          h('span', { class: 'd-qc-chip' }, v === 'c' ? glyph('g-check-b', { size: 14 }) : icon('help-circle', { size: 16 }), h('span', {}, v === 'c' ? ui.buttons.canAnswer : ui.buttons.gap)),
          h('p', { class: 'd-qc-where' }, h('span', { class: 'w-sr-only' }, ui.dm.where + ': '), c.where));
        if (!byLearner) return;
        if (!reducedMotion()) el.classList.add('d-qc-flip');
        saved[c.n] = v;
        ctx.flags.set('c', saved);
        const next = cards.find((x) => !saved[x.c.n]);
        focusOn();
        update(!next);
        if (next) next.can.focus();
      };
      can.addEventListener('click', () => set('c', true));
      gap.addEventListener('click', () => set('g', true));
      if (saved[c.n]) set(saved[c.n], false);
      return { c, el, can, actions };
    });
    // (Noy, 15 Nov 2026: one question in focus at a time) the first card not marked yet is the active one: raised,
    // with its two buttons; the cards still to come are quiet (their question only); marked cards keep their result
    function focusOn() {
      const next = cards.find((x) => !saved[x.c.n]);
      cards.forEach((x) => {
        const st = saved[x.c.n] ? 'done' : x === next ? 'active' : 'wait';
        x.el.dataset.focus = st;
        x.actions.hidden = st !== 'active';
      });
    }
    focusOn();
    function update(focus) {
      const left = cards.filter((x) => !saved[x.c.n]).length;
      if (left) { needLeft(ctx, left); return; }
      const c = screen.closing;
      fill(closing, keyLine(c.keyLine), Object.values(saved).includes('g') ? h('p', { class: 'd-closing-line' }, c.ifGap) : null);
      closing.hidden = false;
      ctx.complete();
      ctx.unlockNext({ focus });
    }
    const grid = h('div', { class: 'd-qcs', dataset: { interaction: '' } }, cards.map((x) => x.el));
    layout(ctx, 'dm-cards', headOf(ctx, screen.eyebrow, screen.band ? h('p', { class: 'd-band-line' }, screen.band) : null), grid, closing, floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (!ctx.revisit && !Object.keys(saved).length) ctx.ghost({ type: screen.ghost?.type || 'cards', steps: () => [{ point: beside(cards[0].el, -0.035, 0.78), hold: 1100 }] }); // in the left gutter, level with the first card's buttons
    update(false);
    return { unmount() {} };
  },
};

/* ---------- dimensionMap (K1) ---------- */
export const dimensionMap = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const dims = screen.dimensions;
    const visited = new Set(ctx.revisit ? dims.map((d) => d.id) : ctx.flags.get('v') || []);
    let sel = -1, cur = -1;

    /* ---- view 1: the map ---- */
    const nodes = dims.map((d) => {
      const badge = h('span', { class: 'd-dim-badge', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 12 }));
      const sr = h('span', { class: 'w-sr-only' });
      const btn = h('button', { class: 'd-dim-node', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'd-dim-card', dataset: { dim: d.id, visited: 'false' } },
        h('span', { class: 'd-dim-disc', 'aria-hidden': 'true' }, icon(d.icon, { size: 30 }), badge), h('span', { class: 'd-dim-name' }, d.name), sr);
      return { btn, sr };
    });
    const track = h('div', { class: 'd-dim-track', role: 'group', 'aria-label': ui.dm.dimensions }, h('i', { class: 'd-dim-line', 'aria-hidden': 'true' }), nodes.map((x) => x.btn));
    arrowNav(track, { selector: '.d-dim-node' });
    const caret = h('i', { class: 'd-dim-caret', 'aria-hidden': 'true' });
    const cardKicker = h('p', { class: 'd-dim-kicker' });
    const cardQ = h('p', { class: 'd-dim-cardq' });
    const exploreBtn = h('button', { class: 'w-btn d-dim-explore', type: 'button', dataset: { action: 'explore' } }, h('span', {}, ui.buttons.explore), glyph('g-arrow', { size: 19.2 }));
    const card = h('section', { class: 'd-dim-card', id: 'd-dim-card', hidden: true, 'aria-live': 'polite' }, caret, h('div', { class: 'd-dim-cardtext' }, cardKicker, cardQ), exploreBtn);
    // (Noy, 20 Nov 2026) the key line is said once, under the map, not again inside each of the eight details
    const mapView = h('div', { class: 'd-dim-map', dataset: { interaction: '' } }, track, card, keyLine(screen.keyLine, 'd-keyline-s'));

    /* ---- view 2: the detail ---- */
    const backBtn = h('button', { class: 'd-dim-back', type: 'button', dataset: { action: 'allDimensions' } }, icon('chevron-left', { size: 20 }), h('span', {}, ui.buttons.allDimensions));
    const items = dims.map((d) => {
      const sr = h('span', { class: 'w-sr-only' });
      const btn = h('button', { class: 'd-dim-item', type: 'button', dataset: { dim: d.id, visited: 'false' } },
        h('span', { class: 'd-dim-tick', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 12 })), h('span', {}, d.name), sr);
      return { btn, sr };
    });
    const list = h('nav', { class: 'd-dim-list', 'aria-label': ui.dm.dimensions }, h('ol', {}, items.map((x) => h('li', {}, x.btn))));
    const dKicker = h('p', { class: 'd-dim-kicker' });
    const dQ = h('h2', { class: 'd-dim-q', tabindex: '-1' });
    const dChips = h('ul', { class: 'd-dim-chips' });
    const dInsight = h('p', { class: 'd-dim-insight' });
    const dots = dims.map(() => h('span', { class: 'd-dim-dot' }));
    const dotsEl = h('div', { class: 'd-dim-dots', role: 'img' }, dots);
    const nextText = h('span', {});
    const nextBtn = h('button', { class: 'd-dim-next', type: 'button', dataset: { action: 'nextDimension' } }, nextText, glyph('g-arrow', { size: 18 }));
    // (Noy, 20 Nov 2026: "a screen full of words, many small headings, no focus; only a Back button") one dimension,
    // one flow to read left to right: its icon and name as the title, then three steps (the question, what we see,
    // what we decide), each with its icon. The only control is "All dimensions"; the map picks the next one.
    const dIcon = h('span', { class: 'd-dim-bigicon', 'aria-hidden': 'true' });
    const step = (cls, ic, label, bodyEl) => h('section', { class: 'd-dim-step ' + cls },
      h('p', { class: 'd-dim-label' }, h('span', { class: 'd-dim-stepicon', 'aria-hidden': 'true' }, icon(ic, { size: 20 })), h('span', {}, label)), bodyEl);
    const arrow = () => h('span', { class: 'd-dim-arrow', 'aria-hidden': 'true' }, icon('chevron-right', { size: 26 }));
    const detail = h('article', { class: 'd-dim-detail d-dim-flow' }, h('div', { class: 'd-dim-title' }, dIcon, dKicker),
      h('div', { class: 'd-dim-steps' }, step('d-dim-s1', 'help-circle', ui.dm.question, dQ), arrow(), step('d-dim-s2', 'eye', ui.dm.values, dChips), arrow(), step('d-dim-s3', 'lightbulb', ui.dm.insight, dInsight)));
    // (Noy, 15 Nov 2026: "only the right side needs to stay") the list of the eight names is not shown in the
    // detail view; the dots, "Next: ..." and "All dimensions" move between dimensions. Set screen.showList to
    // bring the list back.
    const detailView = h('div', { class: 'd-dim-detailview', hidden: true, dataset: { list: String(!!screen.showList) } }, screen.showList ? list : null, detail);

    const mark = () => {
      dims.forEach((d, i) => {
        const v = visited.has(d.id);
        nodes[i].btn.dataset.visited = String(v);
        nodes[i].sr.textContent = v ? ', ' + ui.dm.visited : '';
        items[i].btn.dataset.visited = String(v);
        items[i].sr.textContent = v ? ', ' + ui.dm.visited : '';
        dots[i].dataset.state = i === cur ? 'current' : v ? 'done' : '';
      });
      dotsEl.setAttribute('aria-label', fmt(ui.progress.opened, { i: visited.size, n: dims.length }));
    };
    const update = (focus) => {
      if (visited.size === dims.length) { ctx.complete(); ctx.unlockNext({ focus }); } else needLeft(ctx, dims.length - visited.size);
    };
    function select(i) {
      sel = i;
      nodes.forEach((x, k) => x.btn.setAttribute('aria-expanded', String(k === i)));
      const d = dims[i];
      cardKicker.textContent = `${d.n} · ${d.name}`;
      cardQ.textContent = d.question;
      card.hidden = false;
      card.dataset.dim = d.id;
      // the caret under the selected node (the card spans the track's width)
      requestAnimationFrame(() => { const b = nodes[i].btn; caret.style.left = b.offsetLeft + b.offsetWidth / 2 - 11 + 'px'; });
    }
    function explore(i, focus = true) {
      cur = i;
      const d = dims[i];
      const first = !visited.has(d.id);
      visited.add(d.id);
      if (first && !ctx.revisit) ctx.flags.set('v', [...visited]);
      dKicker.textContent = `${d.n} · ${d.name}`;
      dIcon.replaceChildren(icon(d.icon, { size: 34 }));
      dQ.textContent = d.question;
      dChips.replaceChildren(...d.values.map((v) => h('li', {}, v)));
      dInsight.textContent = d.insight;
      items.forEach((x, k) => { if (k === i) x.btn.setAttribute('aria-current', 'true'); else x.btn.removeAttribute('aria-current'); });
      const nx = dims[i + 1];
      nextBtn.hidden = !nx;
      if (nx) nextText.textContent = fmt(ui.buttons.nextItem, { name: nx.name });
      mapView.hidden = true;
      detailView.hidden = false;
      backBtn.hidden = false;
      zones.main.dataset.view = 'detail';
      mark();
      update(false);
      if (focus) dQ.focus({ preventScroll: true });
    }
    function toMap() {
      detailView.hidden = true;
      mapView.hidden = false;
      backBtn.hidden = true;
      zones.main.dataset.view = 'map';
      // back on the map, the card is already on the next dimension not yet explored (the one just read, when all are)
      const from = Math.max(0, cur);
      const order = [...dims.keys()].map((k) => (from + 1 + k) % dims.length);
      const todo = order.find((k) => !visited.has(dims[k].id));
      const i = todo === undefined ? from : todo;
      cur = -1;
      mark();
      select(i);
      nodes[i].btn.focus({ preventScroll: true });
    }
    nodes.forEach((x, i) => x.btn.addEventListener('click', () => select(i)));
    items.forEach((x, i) => x.btn.addEventListener('click', () => explore(i)));
    exploreBtn.addEventListener('click', () => { if (sel >= 0) explore(sel); });
    nextBtn.addEventListener('click', () => { if (cur >= 0 && cur < dims.length - 1) explore(cur + 1); });
    backBtn.addEventListener('click', toMap);

    backBtn.hidden = true;
    layout(ctx, 'dm-dim', h('div', { class: 'd-head d-dim-head' }, backBtn, zones.instruction), mapView, detailView, floatBand(ctx));
    zones.main.dataset.view = 'map';
    zones.setFeedback({ state: 'hint', text: screen.hint });
    mark();
    update(false);
    select(0); // the first dimension's card is open on arrival (as O2 opens today's component)
    // the hand: another node, then Explore (it presses nothing)
    if (!ctx.revisit && !visited.size) ctx.ghost({ type: screen.ghost?.type || 'explore', steps: () => [{ point: beside(nodes[1].btn, 0.74, 0.3), sweep: true, hold: 500 }, { point: beside(exploreBtn, 0.5, 0.95), hold: 1000 }] });
    return { unmount() { delete zones.main.dataset.view; } };
  },
};

/* ---------- goalCards (S11) ---------- */
export const goalCards = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const goals = screen.goals;
    const opened = new Set(ctx.revisit ? goals.map((g) => g.id) : ctx.flags.get('g') || []);
    const caret = h('i', { class: 'd-goal-caret', 'aria-hidden': 'true' });
    const body = h('div', { class: 'd-goal-body' });
    const panel = h('section', { class: 'd-goal-panel', id: 'd-goal-panel', hidden: true, 'aria-live': 'polite' }, caret, body);
    const cards = goals.map((g) => {
      const sr = h('span', { class: 'w-sr-only' });
      const btn = h('button', { class: 'd-goal', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'd-goal-panel', dataset: { goal: g.id, tone: g.tone, opened: 'false' } },
        h('i', { class: 'd-goal-strip', 'aria-hidden': 'true' }), h('span', { class: 'd-goal-n', 'aria-hidden': 'true' }, g.n), h('b', { class: 'd-goal-title' }, g.title),
        h('span', { class: 'd-goal-tick', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 13 })), sr);
      return { btn, sr };
    });
    const mark = () => goals.forEach((g, i) => {
      const on = opened.has(g.id);
      cards[i].btn.dataset.opened = String(on);
      cards[i].sr.textContent = on ? ', ' + ui.dm.opened : '';
    });
    const update = (focus) => {
      if (opened.size === goals.length) { ctx.complete(); ctx.unlockNext({ focus }); } else needLeft(ctx, goals.length - opened.size);
    };
    function open(i) {
      const g = goals[i];
      cards.forEach((x, k) => x.btn.setAttribute('aria-expanded', String(k === i)));
      fill(body, h('p', { class: 'd-goal-text' }, g.text), g.keyLine ? keyLine(g.keyLine) : null);
      panel.hidden = false;
      panel.dataset.tone = g.tone;
      requestAnimationFrame(() => { const b = cards[i].btn; caret.style.left = b.offsetLeft + b.offsetWidth / 2 - 11 + 'px'; });
      if (!opened.has(g.id)) {
        opened.add(g.id);
        if (!ctx.revisit) ctx.flags.set('g', [...opened]);
        mark();
        update(false);
      }
    }
    cards.forEach((x, i) => x.btn.addEventListener('click', () => open(i)));
    const row = h('div', { class: 'd-goals', role: 'group', 'aria-labelledby': 'w-instruction' }, cards.map((x) => x.btn));
    arrowNav(row, { selector: '.d-goal' });
    layout(ctx, 'dm-goals', headOf(ctx, screen.eyebrow), h('div', { class: 'd-goalwrap', dataset: { interaction: '' } }, row, panel), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    mark();
    update(false);
    if (!ctx.revisit && !opened.size) ctx.ghost({ type: screen.ghost?.type || 'goals', steps: () => [{ point: beside(cards[0].btn, 0.8, 0.86), hold: 1100 }] });
    return { unmount() {} };
  },
};

/* ---------- closing (K2: questions, K3: keyline) ---------- */
// A presentation screen (Next never locks). The band is placed so the end of the slice can say so.
export const closing = {
  mount(ctx) {
    const { screen, zones } = ctx;
    // K6 (slide 34): the deck's closing quote alone, no board
    if (screen.variant === 'quote') {
      layout(ctx, 'dm-close', h('div', { class: 'd-close d-close-key d-close-quote' },
        h('div', { class: 'd-head' }, zones.instruction), keyLine(screen.keyLine, 'd-keyline-xl'),
        screen.line ? h('p', { class: 'd-close-line' }, screen.line) : null), floatBand(ctx, 'd-float-end'));
      zones.setFeedback({ state: 'hint', text: '' });
      return { unmount() {} };
    }
    const board = boardEl(ctx, screen.board);
    const boardCard = h('div', { class: 'd-close-board' }, board.el);
    if (screen.variant === 'keyline') {
      layout(ctx, 'dm-close', h('div', { class: 'd-close d-close-key' },
        h('div', { class: 'd-head' }, zones.instruction), keyLine(screen.keyLine, 'd-keyline-xl'), boardCard,
        screen.line ? h('p', { class: 'd-close-line' }, screen.line) : null), floatBand(ctx, 'd-float-end'));
    } else {
      layout(ctx, 'dm-close', h('div', { class: 'd-close d-close-q' },
        h('div', { class: 'd-head' }, zones.instruction),
        h('ol', { class: 'd-qlist' }, screen.questions.map((q, i) => h('li', {}, h('span', { class: 'd-qlist-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, q)))),
        // (Noy, 15 Nov 2026) under the board: what to do with the five questions (move on, or go back)
        h('div', { class: 'd-close-side' }, boardCard, screen.line ? h('p', { class: 'd-close-note' }, screen.line) : null)), floatBand(ctx, 'd-float-end'));
    }
    zones.setFeedback({ state: 'hint', text: '' });
    return { unmount() { board.stop(); } };
  },
};
