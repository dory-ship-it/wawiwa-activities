// DM Module 2 Lesson 2 templates, Phase 2 (chapters 4 to 7, deck slides 13 to 39). Each screen keeps its
// slide's structure (a list stays a list, a table a table, two columns two columns) and adds one interaction
// inside it. Styles: the "Phase 2" part of src/dm.css. All text comes from content/m2l2.json.
//   checklist    (S14)  the slide's eight challenges as a list; each row a toggle; Done. Neutral.
//   revealTable  (S15)  the slide's table, three columns; the middle cell of a row opens on click.
//   quiz         (S15B) three rounds, each its own three options; one try; Check.
//   stages       (S16)  the four stages, shown one by one, beside the slide's box. (S35: the four summary
//                       sentences beside the four-node board.) Presentation.
//   builder      (S17)  the work plan table, filled column by column from the column headers.
//   client       (S17C) a client asks, the learner picks a reply; a wrong reply gets the client's pushback.
//   caseFile     (S20, S22, S24) the case as a file on the left; the question and three answers on the right;
//                       after Check the answer slide takes the place of the answers.
//   twoCols      (K5)   two columns and one key line. Presentation.
//   podcast      (S26)  an audio player with captions and a transcript, beside the slide's seven observations;
//                       the one being read is highlighted (times from the cue file).
//   poll         (S26B, S33, S38) one neutral question; variants: plain, list (beside the slide's lines),
//                       reflect (then the next lesson's lines; it finishes the lesson).
//   funnelCalc   (S28)  the slide's four-stage funnel, counted backwards from the sales the learner sets.
//   dataTable    (S30)  the slide's report table; three rounds answered by clicking a row.
//   infographic  (S32)  research blocks left, plan elements right, connector lines between them.
//   homeStop     (S36)  the home practice: the slide's five instructions and the link (new tab).
// Graded answers go out once (ctx.answer); everything else lives in the screen's flags (suspend data).
import { h, fmt, resolveLink } from '../util.js?v=ec879c8d';
import { glyph, icon } from '../icons.js?v=ec879c8d';
import { letter } from '../tracking/index.js?v=ec879c8d';
import { layout, picture, arrowNav } from './stage.js?v=ec879c8d';
import { keyLine, boardEl, fill, headOf, floatBand, needLeft, beside } from './dm.js?v=ec879c8d';

/* ---------- shared parts ---------- */
const SVG = 'http://www.w3.org/2000/svg';
const body = (name, ...kids) => h('div', { class: 'd2 d2-' + name, dataset: { interaction: '' } }, kids);
const btn = (cls, action, ...kids) => h('button', { class: cls, type: 'button', dataset: { action } }, kids);
const finish = (ctx, focus) => { ctx.complete(); ctx.unlockNext({ focus }); };
const num = (n) => Number(n).toLocaleString('en-US');
const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

// Answer options as a radio group. lock(i): the answer is in; the right option gets its check, a wrong pick its cross.
function optionList(ctx, options, name) {
  const { ui } = ctx;
  let sel = -1, locked = false, onChange = () => {};
  const btns = options.map((o, i) => h('button', { class: 'd2-opt', type: 'button', role: 'radio', 'aria-checked': 'false', dataset: { id: o.id } },
    h('span', { class: 'd2-opt-mark', 'aria-hidden': 'true' }, letter(i).toUpperCase()), h('span', { class: 'd2-opt-label' }, o.label), h('span', { class: 'w-sr-only' })));
  const el = h('div', { class: 'd2-opts', role: 'radiogroup', 'aria-label': name }, btns);
  arrowNav(el, { selector: '.d2-opt' });
  btns.forEach((b, i) => b.addEventListener('click', () => {
    if (locked) return;
    sel = i;
    btns.forEach((x, k) => x.setAttribute('aria-checked', String(k === i)));
    onChange(i);
  }));
  return {
    el, btns,
    get sel() { return sel; },
    set onChange(f) { onChange = f; },
    lock(i) {
      locked = true;
      btns.forEach((b, k) => {
        const st = options[k].correct ? 'right' : k === i ? 'wrong' : '';
        b.setAttribute('aria-disabled', 'true');
        b.setAttribute('aria-checked', String(k === i));
        b.dataset.state = st;
        if (!st) return;
        b.firstChild.replaceChildren(glyph(st === 'right' ? 'g-check-b' : 'g-cross', { size: 15 }));
        b.lastChild.textContent = ', ' + (st === 'right' ? ui.feedback.correctPrefix : ui.feedback.wrongPrefix);
      });
    },
  };
}

// One graded question, one try: pick, then Check. was: the index answered earlier (a revisit). After the answer the
// foot shows the "next" button (next: { label, go }) when there is one.
//   list: an option list (optionList's shape); text(o, right): the feedback line; onAnswer(i): the learner's answer
function graded(ctx, { options, trackingId, list, was = null, text = (o) => o.feedback, onAnswer = () => {}, next = null }) {
  const { ui, zones } = ctx;
  const label = h('span', {});
  const check = btn('w-btn w-btn-action d2-check', 'check', glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }), label);
  const foot = h('div', { class: 'd2-foot' }, check);
  const ready = (ok) => { check.disabled = !ok; label.textContent = ok ? ui.buttons.check : ui.dm.chooseFirst; };
  const right = options.findIndex((o) => o.correct);
  function settle(i, live) {
    list.lock(i);
    const o = options[i];
    zones.setFeedback(o.correct ? { state: 'correct', text: text(o, options[right]) } : { state: 'wrong', verdict: ui.feedback.revealed, text: text(o, options[right]) });
    if (!next) { fill(foot); return; }
    const nb = btn('w-btn w-btn-action d2-nextround', 'nextRound', h('span', {}, next.label), glyph('g-arrow', { size: 19.2 }));
    nb.addEventListener('click', next.go);
    fill(foot, nb);
    if (live) nb.focus();
  }
  list.onChange = () => ready(true);
  check.addEventListener('click', () => {
    const i = list.sel;
    if (check.disabled || i < 0) return;
    ctx.answer({ trackingId, response: letter(i), result: options[i].correct ? 'correct' : 'wrong' });
    settle(i, true);
    onAnswer(i);
  });
  ready(false);
  if (was !== null && was !== undefined) settle(was, false);
  else if (ctx.revisit) settle(right, false);
  return { foot, settled: (was !== null && was !== undefined) || ctx.revisit };
}

/* ---------- checklist (S14) ---------- */
export const checklist = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const marked = new Set(ctx.flags.get('m') || []);
    const label = h('span', {});
    const doneBtn = btn('w-btn w-btn-action d2-done', 'done', glyph('g-lock', { size: 20.48, className: 'w-btn-lock' }), label);
    doneBtn.classList.add('d2-cl-done');
    const closing = h('section', { class: 'd-closing d2-cl-closing', 'aria-live': 'polite', hidden: true });
    const ready = () => { doneBtn.disabled = !marked.size; label.textContent = marked.size ? ui.buttons.done : ui.dm.chooseFirst; };
    const rows = screen.challenges.map((it) => {
      const b = h('button', { class: 'd2-cl-row', type: 'button', 'aria-pressed': String(marked.has(it.id)), dataset: { item: it.id } },
        h('span', { class: 'd2-cl-box', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 14 })), it.icon ? h('span', { class: 'd2-disc', 'aria-hidden': 'true' }, icon(it.icon, { size: 18 })) : null, h('span', { class: 'd2-cl-text' }, it.text), h('span', { class: 'd2-cl-tag' }, ui.dm.seen));
      b.addEventListener('click', () => {
        if (marked.has(it.id)) marked.delete(it.id); else marked.add(it.id);
        b.setAttribute('aria-pressed', String(marked.has(it.id)));
        ctx.flags.set('m', [...marked]);
        ready();
      });
      return h('li', {}, b);
    });
    function close(live) {
      doneBtn.hidden = true;
      fill(closing, keyLine(screen.closing.keyLine), h('p', { class: 'd-closing-line' }, screen.closing.line));
      closing.hidden = false;
      finish(ctx, live);
    }
    doneBtn.addEventListener('click', () => { if (doneBtn.disabled) return; ctx.flags.set('d', 1); close(true); });
    layout(ctx, 'dm2-checklist', headOf(ctx, screen.eyebrow), body('cl', h('ul', { class: 'd2-cl' }, rows)), doneBtn, closing, floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    ready();
    if (ctx.revisit || ctx.flags.get('d')) close(false);
    return { unmount() {} };
  },
};

/* ---------- revealTable (S15) ---------- */
export const revealTable = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const opened = new Set(ctx.revisit ? screen.rows.map((r) => r.id) : ctx.flags.get('r') || []);
    const update = (focus) => { if (opened.size === screen.rows.length) finish(ctx, focus); else needLeft(ctx, screen.rows.length - opened.size); };
    const rows = screen.rows.map((r) => {
      const outId = 'd2-rt-out-' + r.id;
      const out = h('div', { class: 'd2-rt-does', id: outId, 'aria-live': 'polite' }, h('span', { class: 'd2-rt-closed', 'aria-hidden': 'true' }, icon('eye', { size: 17 }), h('span', {}, ui.dm.hiddenCell)));
      const b = h('button', { class: 'd2-rt-ch', type: 'button', 'aria-expanded': 'false', 'aria-controls': outId, dataset: { row: r.id } }, r.icon ? h('span', { class: 'd2-disc', 'aria-hidden': 'true' }, icon(r.icon, { size: 18 })) : null, h('span', {}, r.channel));
      const el = h('div', { class: 'd2-rt-row', dataset: { open: 'false' } }, b, out, h('span', { class: 'd2-rt-chip' }, h('span', { class: 'w-sr-only' }, screen.head[2] + ': '), r.taught));
      const open = (live) => {
        if (el.dataset.open === 'true') return;
        el.dataset.open = 'true';
        b.setAttribute('aria-expanded', 'true');
        out.replaceChildren(h('span', { class: 'w-sr-only' }, screen.head[1] + ': '), r.does);
        if (!live) return;
        opened.add(r.id);
        ctx.flags.set('r', [...opened]);
        update(false);
      };
      b.addEventListener('click', () => open(true));
      out.addEventListener('click', () => open(true));
      if (opened.has(r.id)) open(false);
      return { el, out };
    });
    const table = h('div', { class: 'd2-rt', role: 'group', 'aria-labelledby': 'w-instruction' },
      h('div', { class: 'd2-rt-head', 'aria-hidden': 'true' }, screen.head.map((t) => h('span', {}, t))), rows.map((x) => x.el));
    layout(ctx, 'dm2-table', headOf(ctx, screen.eyebrow),
      body('rtwrap', table), h('div', { class: 'd2-rt-foot' }, keyLine(screen.keyLine, 'd-keyline-s'), h('p', { class: 'd2-small' }, screen.small)), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    if (!ctx.revisit && !opened.size) ctx.ghost({ type: screen.ghost?.type || 'rows', steps: () => [{ point: beside(rows[0].out, 0.1, 0.8), hold: 1100 }] });
    update(false);
    return { unmount() {} };
  },
};

/* ---------- rounds: quiz (S15B), client (S17C), dataTable (S30) share this walk ---------- */
// show(k): draws round k. The saved answers: { round id: index }.
function roundsOf(ctx, rounds, show) {
  const saved = { ...(ctx.flags.get('a') || {}) };
  const firstOpen = () => { const k = rounds.findIndex((r) => saved[r.id] === undefined); return k < 0 ? rounds.length - 1 : k; };
  const api = {
    saved,
    was: (r) => saved[r.id] ?? null,
    last: (k) => k === rounds.length - 1,
    // the learner answered round k with option i
    record(k, i) {
      saved[rounds[k].id] = i;
      ctx.flags.set('a', saved);
      if (rounds.every((r) => saved[r.id] !== undefined)) finish(ctx, api.last(k));
      else needLeft(ctx, rounds.filter((r) => saved[r.id] === undefined).length);
    },
    start() {
      const all = ctx.revisit || rounds.every((r) => saved[r.id] !== undefined);
      if (all) finish(ctx, false); else needLeft(ctx, rounds.filter((r) => saved[r.id] === undefined).length);
      show(all ? 0 : firstOpen(), false);
    },
  };
  return api;
}

export const quiz = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const R = screen.situations;
    const prog = h('p', { class: 'd2-prog' });
    const q = h('h2', { class: 'd2-q', tabindex: '-1' });
    const slot = h('div', { class: 'd2-slot' });
    let walk = null;
    function show(k, focus) {
      const r = R[k];
      prog.textContent = fmt(ui.progress.round, { i: k + 1, n: R.length });
      q.textContent = r.text;
      zones.setFeedback({ state: 'hint', text: screen.hint });
      const list = optionList(ctx, r.options, r.text);
      const g = graded(ctx, { options: r.options, trackingId: r.trackingId, list, was: walk.was(r), onAnswer: (i) => walk.record(k, i),
        next: walk.last(k) ? null : { label: ui.buttons.nextRound, go: () => show(k + 1, true) } });
      fill(slot, list.el, g.foot);
      if (focus) q.focus({ preventScroll: true });
    }
    walk = roundsOf(ctx, R, show);
    layout(ctx, 'dm2-quiz', headOf(ctx), body('center', h('section', { class: 'd2-panel d2-quiz' }, prog, q, slot)), floatBand(ctx));
    walk.start();
    return { unmount() {} };
  },
};

/* ---------- client (S17C) ---------- */
export const client = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const R = screen.situations;
    const prog = h('p', { class: 'd2-prog' });
    const chat = h('div', { class: 'd2-chat', 'aria-live': 'polite' });
    const slot = h('div', { class: 'd2-slot' });
    const msg = (who, text) => h('div', { class: 'd2-msg', dataset: { who } },
      who === 'client' ? h('span', { class: 'd2-avatar', 'aria-hidden': 'true' }, icon('person', { size: 24 })) : null,
      h('p', {}, h('b', { class: 'd2-msg-who' }, (who === 'client' ? ui.dm.client : ui.dm.youReply) + ' '), h('span', {}, text)));
    let walk = null;
    function show(k, focus) {
      const r = R[k];
      prog.textContent = fmt(ui.progress.turn, { i: k + 1, n: R.length });
      fill(chat, msg('client', r.text));
      zones.setFeedback({ state: 'hint', text: screen.hint });
      const list = optionList(ctx, r.options, r.text);
      const said = (i) => { list.el.hidden = true; chat.append(msg('you', r.options[i].label)); if (!r.options[i].correct) chat.append(msg('client', r.why)); };
      const was = walk.was(r);
      const g = graded(ctx, { options: r.options, trackingId: r.trackingId, list, was, text: (o, right) => (o.correct ? o.feedback : right.label),
        onAnswer: (i) => { said(i); walk.record(k, i); },
        next: walk.last(k) ? null : { label: ui.buttons.nextQuestion, go: () => show(k + 1, true) } });
      if (g.settled) said(was ?? r.options.findIndex((o) => o.correct));
      fill(slot, list.el, g.foot);
      if (focus) list.btns[0].focus({ preventScroll: true });
    }
    walk = roundsOf(ctx, R, show);
    const panel = h('section', { class: 'd2-panel d2-client' }, h('p', { class: 'd2-lead' }, screen.lead), prog, chat, slot);
    layout(ctx, 'dm2-client', headOf(ctx), body('center', panel), floatBand(ctx));
    walk.start();
    return { unmount() {} };
  },
};

/* ---------- stages (S16; S35 with the board) ---------- */
export const stages = {
  mount(ctx) {
    const { screen, ui } = ctx;
    const L = screen.stages.length;
    let n = ctx.revisit ? L : Math.min(L, Math.max(1, ctx.flags.get('n') || 1));
    const items = screen.stages.map((t, i) => h('li', { class: 'd2-stage', tabindex: '-1' }, h('span', { class: 'd2-stage-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, t)));
    const more = btn('w-btn d2-more', 'more', h('span', {}, ui.buttons[screen.more]), glyph('g-arrow', { size: 19.2 }));
    const paint = () => { items.forEach((li, i) => { li.hidden = i >= n; }); more.hidden = n >= L; };
    more.addEventListener('click', () => { n += 1; ctx.flags.set('n', n); paint(); (n >= L ? items[n - 1] : more).focus({ preventScroll: true }); });
    let board = null, side = null;
    if (screen.board) { board = boardEl(ctx, screen.board); side = h('div', { class: 'd-close-board d2-stage-side' }, board.el); }
    else {
      const b = screen.box;
      side = h('aside', { class: 'd2-box d2-stage-side' }, h('p', { class: 'd2-box-label' }, b.label), keyLine(b.keyLine), b.lines.map((t) => h('p', { class: 'd2-box-line' }, t)));
    }
    layout(ctx, 'dm2-stages', headOf(ctx, screen.eyebrow),
      body('stages', h('div', { class: 'd2-stage-col' }, h('ol', { class: 'd2-stage-list', 'aria-live': 'polite' }, items), more), side), floatBand(ctx));
    ctx.zones.setFeedback({ state: 'hint', text: '' });
    paint();
    return { unmount() { board?.stop(); } };
  },
};

/* ---------- builder (S17) ---------- */
export const builder = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const C = screen.columns, last = C.length - 1;
    let n = ctx.revisit ? last : Math.min(last, ctx.flags.get('n') || 0); // columns filled, not counting Area
    const heads = C.map((c, i) => {
      if (!i) return { th: h('th', { scope: 'col' }, h('span', { class: 'd2-b-name' }, c.label)) };
      const sr = h('span', { class: 'w-sr-only' });
      const b = h('button', { class: 'd2-b-head', type: 'button', dataset: { column: c.id } }, h('span', { class: 'd2-b-name' }, c.label),
        h('span', { class: 'd2-b-mark', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 12 })), sr);
      return { th: h('th', { scope: 'col' }, b, h('span', { class: 'd2-b-chip' }, c.chip)), b, sr };
    });
    const cells = screen.rows.map((r) => r.map((t, i) => (i ? h('td', {}, h('span', {}, t)) : h('th', { scope: 'row' }, t))));
    const totalCell = h('td', {}, h('span', {}, screen.total.value));
    const totalRow = h('tr', { class: 'd2-b-total' }, h('th', { scope: 'row' }, screen.total.label), C.slice(1, -1).map(() => h('td', {})), totalCell);
    const table = h('table', { class: 'd2-b' }, h('caption', { class: 'w-sr-only' }, screen.eyebrow),
      h('thead', {}, h('tr', {}, heads.map((x) => x.th))), h('tbody', {}, cells.map((r) => h('tr', {}, r)), totalRow));
    function paint() {
      heads.forEach((x, i) => {
        if (!i) return;
        const st = i <= n ? 'filled' : i === n + 1 ? 'next' : 'wait';
        x.b.dataset.state = st;
        if (st === 'next') x.b.removeAttribute('aria-disabled'); else x.b.setAttribute('aria-disabled', 'true');
        x.sr.textContent = st === 'filled' ? ', ' + ui.dm.filled : st === 'next' ? ', ' + ui.buttons.fillColumn : '';
        cells.forEach((r) => { r[i].dataset.filled = String(i <= n); });
      });
      totalCell.dataset.filled = String(n >= last);
      totalRow.dataset.filled = String(n >= last);
      if (n >= last) finish(ctx, false); else needLeft(ctx, last - n);
    }
    heads.forEach((x, i) => x.b?.addEventListener('click', () => {
      if (i !== n + 1) return;
      n = i;
      ctx.flags.set('n', n);
      paint();
      if (n < last) heads[n + 1].b.focus({ preventScroll: true }); else zones.nextBtn.focus();
    }));
    layout(ctx, 'dm2-builder', headOf(ctx, screen.eyebrow), body('builder', table), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    paint();
    if (!ctx.revisit && !n) ctx.ghost({ type: screen.ghost?.type || 'builder', steps: () => [{ point: beside(heads[1].b, 0.86, 0.9), hold: 1100 }] });
    return { unmount() {} };
  },
};

/* ---------- caseFile (S20, S22, S24) ---------- */
// (Noy, 16 Nov 2026: the screens were crowded and sat at the top) two calm views, centred. Before the answer: the case
// file beside the question. After it: the answer alone in the middle (the case folds to its title, with a button that
// shows it again), and the lines that go beyond the answer slide under the card.
export const caseFile = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const a = screen.answer;
    const second = h('p', { class: 'd2-case-second' }, screen.second);
    const slot = h('div', { class: 'd2-slot' });
    const list = optionList(ctx, screen.options, screen.instruction);
    list.el.classList.add('d2-opts-row');
    const facts = h('ul', { class: 'd2-bullets' }, screen.facts.map((t) => h('li', {}, t)));
    const toggleText = h('span', {});
    const toggle = btn('d2-file-toggle', 'showCase', icon('eye', { size: 18 }), toggleText);
    toggle.hidden = true;
    const file = h('section', { class: 'd2-file' },
      h('div', { class: 'd2-file-top' }, h('div', {}, h('p', { class: 'd2-file-kicker' }, icon('folder', { size: 18 }), h('span', {}, ui.dm.caseFile + ' · ' + screen.eyebrow)), h('h2', { class: 'd2-file-title' }, screen.title)), toggle),
      facts);
    const more = h('div', { class: 'd2-answer-more', hidden: true });
    const ask = h('div', { class: 'd2-case-ask' }, zones.instruction, second, slot);
    const el = body('case', file, ask, more);
    el.dataset.view = 'question';
    // after the answer: "answer" (the case folded) or "case" (the case open again, the answer waits)
    const view = (v) => {
      el.dataset.view = v;
      facts.hidden = v === 'answer';
      ask.hidden = v === 'case';
      more.hidden = v !== 'answer' || !more.childNodes.length;
      toggleText.textContent = v === 'case' ? ui.dm.backToAnswer : ui.dm.showCase;
      toggle.setAttribute('aria-expanded', String(v === 'case'));
    };
    toggle.addEventListener('click', () => view(el.dataset.view === 'case' ? 'answer' : 'case'));
    function reveal(i) {
      const o = screen.options[i];
      second.hidden = true;
      fill(slot, h('section', { class: 'd2-answer' },
        h('div', { class: 'd2-answer-top' }, h('h2', { class: 'd2-answer-title' }, a.title),
          h('span', { class: 'd2-yours', dataset: { state: o.correct ? 'right' : 'wrong' } }, glyph(o.correct ? 'g-check-b' : 'g-cross', { size: 13 }), h('span', {}, ui.dm.yourAnswer + ': ' + o.label))),
        h('ul', { class: 'd2-bullets' }, a.bullets.map((t) => h('li', {}, t))),
        keyLine(a.keyLine, 'd-keyline-s')));
      fill(more, a.compare ? h('div', { class: 'd2-compare' }, h('p', { class: 'd2-box-label' }, a.compare.label), h('ul', {}, a.compare.items.map((t) => h('li', {}, t)))) : null,
        a.small ? h('p', { class: 'd2-small' }, a.small) : null);
      toggle.hidden = false;
      view('answer');
    }
    const was = ctx.flags.get('a') ?? null;
    const g = graded(ctx, { options: screen.options, trackingId: screen.tracking[0].id, list, was,
      onAnswer: (i) => { ctx.flags.set('a', i); reveal(i); finish(ctx, true); } });
    fill(slot, list.el, g.foot);
    layout(ctx, 'dm2-case', el, floatBand(ctx));
    if (!g.settled) zones.setFeedback({ state: 'hint', text: screen.hint });
    else { reveal(was ?? screen.options.findIndex((o) => o.correct)); finish(ctx, false); }
    return { unmount() {} };
  },
};

/* ---------- twoCols (K5) ---------- */
export const twoCols = {
  mount(ctx) {
    const { screen, zones } = ctx;
    layout(ctx, 'dm2-cols', headOf(ctx), body('cols',
      h('div', { class: 'd2-cols' }, screen.cols.map((c) => h('section', { class: 'd2-col', dataset: { col: c.id } },
        h('span', { class: 'd2-col-icon', 'aria-hidden': 'true' }, icon(c.icon, { size: 34 })), h('h2', {}, c.title), h('p', {}, c.text)))),
      keyLine(screen.keyLine, 'd-keyline-xl')), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: '' });
    return { unmount() {} };
  },
};

/* ---------- podcast (S26) ---------- */
const SPEEDS = [1, 1.25, 1.5, 0.75];
export const podcast = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const a = ui.audio, m = screen.media;
    let cues = [], maxT = 0, heard = ctx.revisit || !!ctx.flags.get('h'), speed = 0, dur = m.duration;
    const audio = h('audio', { class: 'd2-audio', src: m.src, preload: 'metadata' });
    const playIcon = h('span', { class: 'd2-pod-playicon', 'aria-hidden': 'true' }, icon('play', { size: 30 }));
    const play = h('button', { class: 'd2-pod-play', type: 'button', 'aria-label': a.play, dataset: { action: 'audioPlay' } }, playIcon);
    const seek = h('input', { class: 'd2-pod-seek', type: 'range', min: '0', max: String(dur), step: '0.1', value: '0', 'aria-label': a.seek });
    const time = h('span', { class: 'd2-pod-time', 'aria-hidden': 'true' }, fmt(a.seekText, { t: clock(0), d: clock(dur) }));
    const speedBtn = h('button', { class: 'd2-pod-chip', type: 'button', dataset: { action: 'audioSpeed' } });
    const trBtn = h('button', { class: 'd2-pod-chip', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'd2-pod-tr', dataset: { action: 'transcript' } }, icon('transcript', { size: 17 }), h('span', {}, a.transcript));
    const cap = h('p', { class: 'd2-pod-cap', 'aria-hidden': 'true' });
    const obs = screen.observations.map((t, i) => h('li', { class: 'd2-obs', dataset: { obs: String(i + 1) } }, h('span', { class: 'd2-obs-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, t)));
    const obsList = h('ol', { class: 'd2-obs-list' }, obs);
    const transcript = h('div', { class: 'd2-pod-tr', id: 'd2-pod-tr', hidden: true, tabindex: '0', role: 'region', 'aria-label': a.transcript },
      screen.podcast.script.map((l) => h('p', {}, h('b', {}, (l.voice === 'A' ? a.voiceA : a.voiceB) + ': '), l.text)));
    const paintSpeed = () => { const x = SPEEDS[speed]; audio.playbackRate = x; speedBtn.textContent = fmt(a.speedChip, { x }); speedBtn.setAttribute('aria-label', fmt(a.speed, { x })); };
    const done = (live) => { heard = true; finish(ctx, live); };
    function tick() {
      const t = audio.currentTime;
      if (!audio.seeking) maxT = Math.max(maxT, t);
      seek.value = String(t);
      seek.setAttribute('aria-valuetext', fmt(a.seekText, { t: clock(t), d: clock(dur) }));
      time.textContent = fmt(a.seekText, { t: clock(t), d: clock(dur) });
      const c = cues.find((x) => t >= x.t && t < x.end);
      cap.textContent = c ? c.text : '';
      obs.forEach((li, i) => { li.dataset.now = String(!!c && c.obs === i + 1); });
    }
    play.addEventListener('click', () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); });
    const state = () => { const on = !audio.paused && !audio.ended; play.setAttribute('aria-label', on ? a.pause : a.play); playIcon.replaceChildren(icon(on ? 'pause' : 'play', { size: 30 })); };
    ['play', 'pause', 'ended'].forEach((e) => audio.addEventListener(e, state));
    audio.addEventListener('timeupdate', tick);
    audio.addEventListener('loadedmetadata', () => { if (Number.isFinite(audio.duration)) { dur = audio.duration; seek.max = String(dur); tick(); } });
    audio.addEventListener('ended', () => { if (!heard) { ctx.flags.set('h', 1); done(true); } });
    // no moving ahead of what was heard (as the video player), until the audio was heard once
    seek.addEventListener('input', () => {
      const want = Number(seek.value);
      if (!heard && want > maxT + 0.5) { audio.currentTime = maxT; zones.setFeedback({ state: 'notice', text: a.seekAhead }); } else audio.currentTime = want;
      tick();
    });
    speedBtn.addEventListener('click', () => { speed = (speed + 1) % SPEEDS.length; paintSpeed(); });
    trBtn.addEventListener('click', () => {
      const on = trBtn.getAttribute('aria-expanded') !== 'true';
      trBtn.setAttribute('aria-expanded', String(on));
      transcript.hidden = !on;
      obsList.hidden = on;
    });
    fetch(m.cues).then((r) => r.json()).then((j) => { cues = j.items || []; tick(); }).catch(() => {});
    const player = h('section', { class: 'd2-pod', role: 'group', 'aria-label': a.controls }, audio,
      h('div', { class: 'd2-pod-row' }, play, h('div', { class: 'd2-pod-mid' }, seek, time)),
      h('div', { class: 'd2-pod-row d2-pod-tools' }, speedBtn, trBtn),
      h('div', { class: 'd2-pod-capbox' }, h('span', { class: 'd2-box-label' }, a.captions), cap));
    layout(ctx, 'dm2-podcast', headOf(ctx, screen.eyebrow), body('podcast', player, h('div', { class: 'd2-pod-side' }, obsList, transcript)), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    paintSpeed();
    if (heard) done(false);
    return { unmount() { audio.pause(); audio.removeAttribute('src'); audio.load(); } };
  },
};

/* ---------- poll (S26B plain, S33 list, S38 reflect) ---------- */
export const poll = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const O = screen.options;
    const btns = O.map((o) => h('button', { class: 'd2-poll-opt', type: 'button', role: 'radio', 'aria-checked': 'false', dataset: { id: o.id } }, o.label));
    const group = h('div', { class: 'd2-poll-opts', role: 'radiogroup', 'aria-labelledby': 'w-instruction', dataset: { n: String(O.length) } }, btns);
    arrowNav(group, { selector: '.d2-poll-opt' });
    const after = h('div', { class: 'd2-poll-after', 'aria-live': 'polite' });
    const af = screen.after;
    function show(i, live) {
      btns.forEach((b, k) => b.setAttribute('aria-checked', String(k === i)));
      const text = O[i].feedback || screen.feedback?.any;
      if (text) zones.setFeedback({ state: 'neutral', text });
      fill(after, screen.keyLine ? keyLine(screen.keyLine, 'd-keyline-s') : null,
        af ? h('section', { class: 'd2-nextup' }, h('h2', {}, af.title), h('p', {}, af.text), h('p', { class: 'd2-nextup-coach' }, glyph('coach', { size: 26 }), h('span', {}, af.coach))) : null);
      if (live && screen.finishes && !ctx.finished()) ctx.finishLesson();
      finish(ctx, false);
    }
    btns.forEach((b, i) => b.addEventListener('click', () => { ctx.flags.set('p', O[i].id); show(i, true); }));
    const ask = h('div', { class: 'd2-poll-ask' }, screen.eyebrow ? h('p', { class: 'd-eyebrow' }, screen.eyebrow) : null,
      screen.quote ? h('blockquote', { class: 'd2-quote' }, screen.quote) : null, zones.instruction, group, after);
    const variant = screen.variant || 'plain';
    layout(ctx, 'dm2-poll', body('poll d2-poll-' + variant,
      screen.list ? h('ul', { class: 'd2-slide-list' }, screen.list.map((t) => h('li', {}, t))) : null,
      variant === 'list' ? ask : h('section', { class: 'd2-panel' }, ask)), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    const was = O.findIndex((o) => o.id === ctx.flags.get('p'));
    if (was >= 0) show(was, false); else if (ctx.revisit) finish(ctx, false);
    return { unmount() {} };
  },
};

/* ---------- funnelCalc (S28) ---------- */
export const funnelCalc = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const st = screen.stepper, S = screen.stages;
    const goalRate = S[S.length - 1].rate;
    let v = Number(ctx.flags.get('v')) || st.value, changed = ctx.revisit || !!ctx.flags.get('c');
    const counts = S.map(() => h('b', { class: 'd2-fn-count' }));
    const input = h('input', { class: 'd2-step-input', type: 'number', min: String(st.min), max: String(st.max), step: '1', value: String(v), id: 'd2-step', inputmode: 'numeric' });
    const less = h('button', { class: 'd2-step-btn', type: 'button', 'aria-label': ui.dm.fewer, dataset: { action: 'fewer' } }, icon('minus', { size: 22 }));
    const more = h('button', { class: 'd2-step-btn', type: 'button', 'aria-label': ui.dm.more, dataset: { action: 'more' } }, icon('plus', { size: 22 }));
    function paint() {
      // backwards from the sales: the impressions it takes at the goal rate, then each stage's share of them
      const imp = Math.ceil((v * 100) / goalRate - 1e-9);
      S.forEach((s, i) => { counts[i].textContent = num(i === S.length - 1 ? v : Math.round((imp * s.rate) / 100)); });
      less.disabled = v <= st.min;
      more.disabled = v >= st.max;
    }
    function set(x, live) {
      const nv = Math.min(st.max, Math.max(st.min, Math.round(Number(x)) || st.min));
      if (live && nv !== v && !changed) { changed = true; ctx.flags.set('c', 1); finish(ctx, false); }
      v = nv;
      input.value = String(v);
      if (live) ctx.flags.set('v', v);
      paint();
    }
    less.addEventListener('click', () => set(v - 1, true));
    more.addEventListener('click', () => set(v + 1, true));
    input.addEventListener('change', () => set(input.value, true));
    const funnel = h('ol', { class: 'd2-fn', 'aria-live': 'polite' }, S.map((s, i) => h('li', { class: 'd2-fn-stage', dataset: { stage: String(i + 1) } },
      h('span', { class: 'd2-fn-n', 'aria-hidden': 'true' }, s.n), h('span', { class: 'd2-fn-text' }, h('b', {}, s.name), h('span', {}, s.sub)),
      h('span', { class: 'd2-fn-rate' }, s.rate + '%'), counts[i])));
    const stepper = h('div', { class: 'd2-step' }, h('label', { class: 'd2-step-label', for: 'd2-step' }, st.label), h('div', { class: 'd2-step-row' }, less, input, more),
      h('p', { class: 'd2-small' }, screen.ratesLabel));
    layout(ctx, 'dm2-funnel', headOf(ctx, screen.eyebrow),
      body('funnel', h('div', { class: 'd2-fn-left' }, screen.lines.map((t) => h('p', { class: 'd2-fn-line' }, t)), stepper, keyLine(screen.keyLine, 'd-keyline-s')), funnel), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    paint();
    if (changed) finish(ctx, false);
    return { unmount() {} };
  },
};

/* ---------- dataTable (S30) ---------- */
export const dataTable = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const R = screen.situations;
    const prog = h('p', { class: 'd2-prog' });
    const q = h('h2', { class: 'd2-q', tabindex: '-1' });
    const slot = h('div', { class: 'd2-slot' });
    const note = h('p', { class: 'd2-dt-note', 'aria-live': 'polite', hidden: true }, screen.dotNote);
    const rowBtns = [];
    const rows = screen.rows.map((r, k) => {
      const b = h('button', { class: 'd2-dt-src', type: 'button', role: 'radio', 'aria-checked': 'false', dataset: { id: letter(k) } }, h('span', { class: 'd2-dt-radio', 'aria-hidden': 'true' }), h('span', {}, r[0]), h('span', { class: 'w-sr-only' }));
      rowBtns.push(b);
      const tr = h('tr', { dataset: { row: letter(k) } }, h('th', { scope: 'row' }, b), r.slice(1).map((t, i) => {
        if (t !== '·') return h('td', { dataset: { col: String(i + 1) } }, t);
        const dot = h('button', { class: 'd2-dt-dot', type: 'button', 'aria-label': ui.dm.noCost, dataset: { action: 'dot' } }, t);
        dot.addEventListener('click', (e) => { e.stopPropagation(); note.hidden = false; });
        return h('td', { dataset: { col: String(i + 1) } }, dot);
      }));
      tr.addEventListener('click', (e) => { if (!e.target.closest('button')) b.click(); });
      return tr;
    });
    const table = h('table', { class: 'd2-dt' }, h('caption', { class: 'w-sr-only' }, screen.eyebrow),
      h('thead', {}, h('tr', {}, screen.head.map((t, i) => h('th', { scope: 'col', dataset: { col: String(i) } }, t)))),
      h('tbody', { role: 'radiogroup', 'aria-labelledby': 'w-instruction' }, rows, h('tr', { class: 'd2-dt-total' }, screen.total.map((t, i) => (i ? h('td', { dataset: { col: String(i) } }, t) : h('th', { scope: 'row' }, t))))));
    arrowNav(table, { selector: '.d2-dt-src' });
    // the table's rows as an option list (optionList's shape), made anew for each round
    function rowList(options) {
      let sel = -1, locked = false, onChange = () => {};
      rowBtns.forEach((b, i) => {
        b.setAttribute('aria-checked', 'false'); b.removeAttribute('aria-disabled'); delete b.dataset.state; b.lastChild.textContent = ''; b.closest('tr').dataset.state = '';
        b.onclick = () => { if (locked) return; sel = i; rowBtns.forEach((x, k) => { x.setAttribute('aria-checked', String(k === i)); x.closest('tr').dataset.picked = String(k === i); }); onChange(i); };
        b.closest('tr').dataset.picked = 'false';
      });
      return { get sel() { return sel; }, set onChange(f) { onChange = f; },
        lock(i) {
          locked = true;
          rowBtns.forEach((b, k) => {
            const st = options[k].correct ? 'right' : k === i ? 'wrong' : '';
            b.setAttribute('aria-disabled', 'true'); b.setAttribute('aria-checked', String(k === i)); b.dataset.state = st; b.closest('tr').dataset.state = st; b.closest('tr').dataset.picked = 'false';
            if (st) b.lastChild.textContent = ', ' + (st === 'right' ? ui.feedback.correctPrefix : ui.feedback.wrongPrefix);
          });
        } };
    }
    let walk = null;
    function show(k, focus) {
      const r = R[k];
      prog.textContent = fmt(ui.progress.round, { i: k + 1, n: R.length });
      q.textContent = r.text;
      table.dataset.col = String(r.column);
      zones.setFeedback({ state: 'hint', text: screen.hint });
      const list = rowList(r.options);
      const g = graded(ctx, { options: r.options, trackingId: r.trackingId, list, was: walk.was(r), onAnswer: (i) => { walk.record(k, i); if (walk.last(k)) key.hidden = false; },
        next: walk.last(k) ? null : { label: ui.buttons.nextRound, go: () => show(k + 1, true) } });
      fill(slot, g.foot);
      if (focus) q.focus({ preventScroll: true });
    }
    walk = roundsOf(ctx, R, show);
    const key = keyLine(screen.keyLine, 'd-keyline-s');
    layout(ctx, 'dm2-data', headOf(ctx, screen.eyebrow), body('data', h('div', { class: 'd2-dt-wrap' }, table),
      h('section', { class: 'd2-dt-side' }, prog, q, slot, key, note)), floatBand(ctx));
    walk.start();
    key.hidden = !(ctx.revisit || R.every((r) => walk.saved[r.id] !== undefined));
    return { unmount() {} };
  },
};

/* ---------- infographic (S32) ---------- */
export const infographic = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const opened = new Set(ctx.revisit ? screen.right.map((r) => r.id) : ctx.flags.get('o') || []);
    const left = screen.left.map((l) => h('li', { class: 'd2-ig-src', dataset: { src: l.id, lit: 'false' } }, l.icon ? h('span', { class: 'd2-disc', 'aria-hidden': 'true' }, icon(l.icon, { size: 18 })) : null, h('span', { class: 'd2-ig-src-text' }, h('b', {}, l.title), l.sub ? h('span', {}, l.sub) : null)));
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'd2-ig-lines');
    svg.setAttribute('aria-hidden', 'true');
    const capTitle = h('b', { class: 'd2-ig-cap-title' });
    const capText = h('p', { class: 'd2-ig-cap-text' });
    const cap = h('section', { class: 'd2-ig-cap', 'aria-live': 'polite', dataset: { empty: 'true' } }, h('p', { class: 'd2-box-label' }, ui.dm.comesFrom), capTitle, capText);
    const lines = [];
    const right = screen.right.map((r) => {
      const sr = h('span', { class: 'w-sr-only' });
      const b = h('button', { class: 'd2-ig-el', type: 'button', 'aria-pressed': 'false', dataset: { el: r.id, opened: String(opened.has(r.id)) } }, h('span', {}, r.title),
        h('span', { class: 'd2-ig-tick', 'aria-hidden': 'true' }, glyph('g-check-b', { size: 11 })), sr);
      b.addEventListener('click', () => select(r, true));
      return { r, b, sr };
    });
    const update = () => { if (opened.size >= screen.min) finish(ctx, false); else needLeft(ctx, screen.min - opened.size); };
    function select(r, live) {
      right.forEach((x) => { x.b.setAttribute('aria-pressed', String(x.r === r)); });
      left.forEach((li) => { li.dataset.lit = String(r.from.includes(li.dataset.src)); });
      lines.forEach((ln) => ln.path.setAttribute('data-lit', String(ln.to === r.id)));
      cap.dataset.empty = 'false';
      capTitle.textContent = r.title;
      capText.textContent = r.text;
      if (!live || opened.has(r.id)) return;
      opened.add(r.id);
      ctx.flags.set('o', [...opened]);
      const x = right.find((y) => y.r === r);
      x.b.dataset.opened = 'true';
      x.sr.textContent = ', ' + ui.dm.opened;
      update();
    }
    const leftCol = h('div', { class: 'd2-ig-col' }, h('p', { class: 'd2-box-label' }, ui.dm.research), h('ul', { class: 'd2-ig-srcs' }, left));
    const rightCol = h('div', { class: 'd2-ig-col' }, h('p', { class: 'd2-box-label' }, ui.dm.plan), h('div', { class: 'd2-ig-els', role: 'group', 'aria-label': ui.dm.plan }, right.map((x) => x.b)));
    const map = h('div', { class: 'd2-ig-map' }, leftCol, svg, rightCol);
    const strip = h('p', { class: 'd2-ig-strip' }, h('b', {}, screen.strip.label), screen.strip.items.map((t) => h('span', {}, t)));
    layout(ctx, 'dm2-info', headOf(ctx, screen.eyebrow), body('info', strip, map, h('div', { class: 'd2-ig-side' }, cap, keyLine(screen.keyLine, 'd-keyline-s'))), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: screen.hint });
    // the connector lines, drawn once the columns are laid out (stage px: offsets, not screen px)
    const draw = () => {
      const mid = (el) => { let y = el.offsetHeight / 2, n = el; while (n && n !== map) { y += n.offsetTop; n = n.offsetParent; } return y; };
      const x0 = leftCol.offsetLeft + leftCol.offsetWidth, x1 = rightCol.offsetLeft;
      svg.setAttribute('viewBox', `0 0 ${map.offsetWidth} ${map.offsetHeight}`);
      svg.replaceChildren();
      lines.length = 0;
      right.forEach((x) => x.r.from.forEach((f) => {
        const a = mid(left.find((li) => li.dataset.src === f)), b = mid(x.b), c = (x1 - x0) / 2;
        const path = document.createElementNS(SVG, 'path');
        path.setAttribute('d', `M${x0} ${a} C${x0 + c} ${a} ${x1 - c} ${b} ${x1} ${b}`);
        path.setAttribute('data-lit', 'false');
        svg.append(path);
        lines.push({ path, to: x.r.id });
      }));
      const on = right.find((x) => x.b.getAttribute('aria-pressed') === 'true');
      if (on) lines.forEach((ln) => ln.path.setAttribute('data-lit', String(ln.to === on.r.id)));
    };
    requestAnimationFrame(draw);
    document.fonts?.ready.then(draw);
    update();
    if (!ctx.revisit && !opened.size) ctx.ghost({ type: screen.ghost?.type || 'elements', steps: () => [{ point: beside(right[0].b, 0.9, 0.85), hold: 1100 }] });
    return { unmount() {} };
  },
};

/* ---------- homeStop (S36) ---------- */
export const homeStop = {
  mount(ctx) {
    const { screen, ui, zones, content } = ctx;
    const open = h('a', { class: 'w-btn w-btn-primary d-wb-open', href: resolveLink(content, screen.handoff.href), target: '_blank', rel: screen.handoff.rel, dataset: { action: 'open' } },
      h('span', {}, ui.buttons.openHomework), icon('external-link', { size: 20 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')'));
    const steps = screen.steps.map((s, i) => h('li', {}, h('span', { class: 'd2-home-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, s)));
    layout(ctx, 'dm2-home', body('home', h('section', { class: 'd2-panel d2-home' },
      h('figure', { class: 'd2-home-shot' }, picture(screen.image, 'd-wb-img')),
      h('div', { class: 'd2-home-body' }, h('p', { class: 'd-eyebrow' }, screen.eyebrow), zones.instruction, h('ol', { class: 'd2-home-steps' }, steps), keyLine(screen.keyLine, 'd-keyline-s'),
        h('div', { class: 'd2-home-foot' }, open, h('p', { class: 'd2-small' }, screen.line))))), floatBand(ctx));
    zones.setFeedback({ state: 'hint', text: '' });
    const opened = (live) => { finish(ctx, false); if (live) zones.setFeedback({ state: 'notice', text: screen.openFeedback }); };
    open.addEventListener('click', () => { ctx.flags.set('o', 1); opened(true); });
    if (ctx.revisit || ctx.flags.get('o')) opened(false);
    return { unmount() {} };
  },
};
