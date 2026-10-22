// Intro and Chapter 1 presentation templates, "Hybrid cinematic" look (NL1), frames in
// planning/design-reference/hybrid-cinematic/screens-intro-ch2.html:
//   title      (O1)  the only dark screen: O1's photo under its veil, no bar or footer. Logo top left;
//                    programme and lesson line, h1, the quote with a turquoise mark, "Start the lesson".
//   moduleMap  (O2)  Focus: "Where we are" and h1; five lesson stations on a line (ARIA tabs: arrow
//                    keys move, Enter or Space opens, roving tabindex), each a disc (done = navy check,
//                    today = turquoise ring with its number and a "Today" chip, to come = outline) with
//                    its lesson and title; the open lesson's line in a card whose caret follows it.
//                    Today's lesson is open on arrival. Ghost hand type "tabs" (the station the content
//                    names, once).
//   goals      (O3)  Focus: the deliverable in a figure card, five numbered goal tiles; the full goal in
//                    a glass tooltip above the tile on hover or focus.
//   warmup     (W1)  Stage: the question on a glass card over the photo (bulb, "Warm-up", "Not scored");
//                    the panel holds "Make your best guess." and the answers as a radio group. Any pick
//                    is neutral (navy outline and dot, no right or wrong colours); the pick can change.
//                    Next after a pick. One neutral interaction; a later pick goes out as a retry.
//   concept    (K1)  Focus: the "Key idea" pill, h1, one line; two figure cards with an arrow between
//                    them, their line drawings draw on (1.2 s); the evidence line and source at the foot.
//   keyParts   (K2)  Focus: the K1 head, three numbered figure cards on a line (arrows between); the case
//                    toggle top right adds each card's case line.
//   keyColumns (K4)  NL3, by analogy (no frame): the K1 head, two figure cards side by side, no arrow:
//                    "Good fit" in teal ink, "Poor fit" in K1's grey; each lists its kinds of step (the
//                    term in bold, its line after it) with a check or a cross mark.
// Title, module map, goals and key idea are presentation screens (screen.presentation): the engine
// marks them done on arrival, so Next never locks. All text comes from the content.
import { h } from '../util.js';
import { glyph } from '../icons.js';
import { scaleOf } from '../ghost.js';
import { letter } from '../tracking/index.js';
import { layout, sheet, glassKicker, arrowNav, focusHead, splitFirst, buildUp } from './stage.js';

/* ---------- title (O1) ---------- */
export const title = {
  scene: () => 'title',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const start = h('button', { class: 'w-btn w-start', type: 'button', dataset: { action: 'start' }, onclick: () => ctx.next() },
      h('span', {}, ui.buttons[screen.start]), glyph('g-arrow-o1', { size: 25.6 }));
    // the quote mark is drawn, so the typographic marks around the content's quote are left out
    const quote = String(screen.quote || '').replace(/^[“"]+|[”"]+$/g, '');
    layout(ctx, 'title',
      h('img', { class: 'w-o1-logo', src: 'assets/logo/wawiwa-logo.png', alt: ui.logoAlt, width: '271', height: '102' }),
      h('section', { class: 'w-o1-body' },
        h('p', { class: 'w-title-program' }, [screen.program, screen.kicker].filter(Boolean).join(' · ')),
        zones.instruction,
        h('div', { class: 'w-o1-quote' }, glyph('g-quote', { size: 33.28 }), h('p', { class: 'w-title-quote' }, quote)),
        h('div', { class: 'w-title-actions' }, start)));
    return { unmount() {} };
  },
};

/* ---------- moduleMap (O2) ---------- */
const PITCH = 215.04, STATION_W = 204.8; // 16.8cqw and 16cqw at 1280
export const moduleMap = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const mm = ui.moduleMap;
    const stations = screen.stations;
    const today = Math.max(0, stations.findIndex((st) => st.status === 'today'));
    const panelId = 'w-map-panel';
    const caret = h('i', { class: 'w-map-caret', 'aria-hidden': 'true' });
    const panelText = h('p', { class: 'w-map-panel-text' });
    const panel = h('section', { class: 'w-map-panel', id: panelId, role: 'tabpanel', tabindex: '0' }, caret, panelText);

    const tabs = stations.map((st, i) => {
      const isToday = st.status === 'today';
      const disc = h('span', { class: 'w-map-disc', 'aria-hidden': 'true' }, st.status === 'done' ? glyph('g-check', { size: 40.96 }) : st.n || String(i + 1));
      const tab = h('button', { class: 'w-map-tab', type: 'button', role: 'tab', id: 'w-map-tab-' + st.id, 'aria-selected': 'false', 'aria-controls': panelId, tabindex: '-1',
        dataset: { station: st.id, status: st.status } },
        isToday ? h('span', { class: 'w-map-today', 'aria-hidden': 'true' }, mm.today) : null,
        disc,
        h('span', { class: 'w-map-labels' }, h('b', { class: 'w-map-kicker' }, st.kicker), h('span', { class: 'w-map-title' }, st.title)),
        h('span', { class: 'w-sr-only' }, ', ' + mm.status[st.status]));
      tab.style.left = i * PITCH + 'px';
      return { st, tab, disc };
    });
    // the line: navy from the first station to today's, then the stone line to the last one
    const centre = (i) => i * PITCH + STATION_W / 2;
    const lineDone = h('i', { class: 'w-map-line w-map-line-done', 'aria-hidden': 'true' });
    const lineNext = h('i', { class: 'w-map-line', 'aria-hidden': 'true' });
    Object.assign(lineDone.style, { left: centre(0) + 'px', width: centre(today) - centre(0) + 'px' });
    Object.assign(lineNext.style, { left: centre(today) + 'px', width: centre(stations.length - 1) - centre(today) + 'px' });
    const list = h('div', { class: 'w-map-tabs', role: 'tablist', 'aria-label': mm.label }, lineDone, lineNext, tabs.map((x) => x.tab));
    list.style.width = (stations.length - 1) * PITCH + STATION_W + 'px';
    const openIndex = () => tabs.findIndex((x) => x.tab.getAttribute('aria-selected') === 'true');
    function open(i, { focus = false } = {}) {
      tabs.forEach((x, j) => { x.tab.setAttribute('aria-selected', String(i === j)); x.tab.tabIndex = i === j ? 0 : -1; });
      const st = stations[i];
      panel.setAttribute('aria-labelledby', tabs[i].tab.id);
      panel.dataset.station = st.id;
      panelText.textContent = st.text;
      // the caret sits under the open station (the card is 10.24 px wider than the line of stations)
      caret.style.left = centre(i) + 5.12 - 11.52 + 'px';
      if (focus) tabs[i].tab.focus();
    }
    // arrow keys move the focus (and the tab stop); Enter or Space opens (manual activation)
    list.addEventListener('keydown', (e) => {
      const i = tabs.findIndex((x) => x.tab === document.activeElement);
      if (i < 0) return;
      const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      const k = (j + tabs.length) % tabs.length;
      tabs.forEach((x, n) => { x.tab.tabIndex = n === k ? 0 : -1; });
      tabs[k].tab.focus();
    });
    // FX1 D1: the first station not open shows a small "Click to open" cue until any station is opened
    const cueAt = tabs.findIndex((x) => x.st.status !== 'today' && !x.st.open);
    const cue = cueAt >= 0 && !ctx.revisit ? h('span', { class: 'w-map-cue', 'aria-hidden': 'true' }, mm.clickToOpen) : null;
    if (cue) tabs[cueAt].tab.prepend(cue);
    tabs.forEach((x, i) => x.tab.addEventListener('click', () => { cue?.remove(); open(i); }));
    // stations not opened keep the selected one reachable by Tab when focus left the list
    list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) tabs.forEach((x, n) => { x.tab.tabIndex = n === openIndex() ? 0 : -1; }); });

    const home = Math.max(0, stations.findIndex((st) => st.open));
    open(home);
    // the ghost hand shows the first click once, on the station the content names (O2: Lesson 1);
    // it taps it (that lesson opens), then today's lesson opens again. The frame has no "Show me" here.
    if (screen.ghost) ctx.ghost({
      type: screen.ghost.type,
      // the fingertip rests on the disc's upper right, as in the frame (8 px right of its centre, 6 px under its top)
      steps: () => { const i = Math.max(0, stations.findIndex((st) => st.id === screen.ghost.target)); const d = tabs[i].disc;
        return [{ point: () => { const r = d.getBoundingClientRect(), k = scaleOf(d); return { x: r.left + r.width / 2 + 8 * k, y: r.top + 6 * k }; }, tap: () => open(i), hold: 700 }]; },
      restore: () => open(home),
    });

    layout(ctx, 'map',
      focusHead(screen.eyebrow, 'overview', zones.instruction, screen.line ? h('p', { class: 'w-concept-text' }, screen.line) : null),
      h('div', { class: 'w-map' }, list),
      panel);
    // FX1 D1: the build-up, once: the line draws, the stations come in one by one, then the open card;
    // "Today" gets one soft pulse (no ghost hand on O2)
    if (!ctx.revisit) {
      const t = buildUp([[lineDone, 'line'], [lineNext, 'line'], ...tabs.map((x) => x.tab), panel], { start: 100, step: 200 });
      buildUp([[tabs[today].tab.querySelector('.w-map-today'), 'pulse'], cue], { start: t, step: 0 });
    }
    return { unmount() {} };
  },
};

/* ---------- goals (O3) ---------- */
// FX1 D2: the goal tiles are buttons (ARIA tabs, as O2's stations: arrow keys move, Enter or Space
// opens); the selected goal's full wording shows in a detail card under the tiles, its caret under
// the tile (O2's card). Tile 1 is open on arrival. No tooltip over the heading. Build-up once.
export const goals = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const d = screen.deliverable;
    const [lead, rest] = splitFirst(d.text);
    const panelId = 'w-goal-panel';
    const caret = h('i', { class: 'w-map-caret', 'aria-hidden': 'true' });
    const panelText = h('p', { class: 'w-map-panel-text' });
    const panel = h('section', { class: 'w-map-panel w-goal-panel', id: panelId, role: 'tabpanel', tabindex: '0' }, caret, panelText);
    const tiles = screen.goals.map((g, i) => h('button', { class: 'w-goal', type: 'button', role: 'tab', id: 'w-goal-tab-' + g.id, 'aria-selected': 'false', 'aria-controls': panelId, tabindex: '-1', dataset: { goal: g.id } },
      h('span', { class: 'w-goal-num', 'aria-hidden': 'true' }, String(i + 1)), h('b', { class: 'w-goal-label' }, g.label)));
    const list = h('div', { class: 'w-goals', role: 'tablist', 'aria-labelledby': 'w-instruction' }, tiles);
    function open(i, focus = false) {
      tiles.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panel.setAttribute('aria-labelledby', tiles[i].id);
      panel.dataset.goal = screen.goals[i].id;
      panelText.textContent = screen.goals[i].text;
      // the caret under the open tile (positions read once the tiles are laid out)
      requestAnimationFrame(() => { caret.style.left = tiles[i].offsetLeft + tiles[i].offsetWidth / 2 - 11.52 + 'px'; });
      if (focus) tiles[i].focus();
    }
    list.addEventListener('keydown', (e) => {
      const i = tiles.indexOf(document.activeElement);
      if (i < 0) return;
      const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tiles.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      const k = (j + tiles.length) % tiles.length;
      tiles.forEach((t, n) => { t.tabIndex = n === k ? 0 : -1; });
      tiles[k].focus();
    });
    list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) tiles.forEach((t) => { t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1; }); });
    tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
    const deliverable = h('section', { class: 'w-deliverable', 'aria-label': d.label || null },
      h('span', { class: 'w-deliverable-icon' }, glyph(d.icon || 'write', { size: 28.16 })),
      h('p', { class: 'w-deliverable-text' }, d.label ? h('span', { class: 'w-sr-only' }, d.label + ': ') : null,
        h('b', {}, lead), rest ? [' ', h('span', { class: 'w-deliverable-next' }, rest)] : null));
    layout(ctx, 'goals', focusHead(screen.eyebrow, 'goals', zones.instruction), deliverable, list, panel);
    open(0);
    if (!ctx.revisit) buildUp([deliverable, ...tiles, panel], { start: 100, step: 180 });
    return { unmount() {} };
  },
};

/* ---------- warmup (W1) ---------- */
export const warmup = {
  scene: () => 'stage',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const p = screen.panel;
    const trackingId = screen.tracking[0].id;
    const btns = screen.options.map((o) => h('button', { class: 'w-guess w-ans', type: 'button', role: 'radio', 'aria-checked': 'false', dataset: { id: o.id } },
      h('span', { class: 'w-guess-ring w-ans-mark', 'aria-hidden': 'true' }), h('span', { class: 'w-guess-label' }, o.label), h('span', { class: 'w-guess-tag w-sr-only' })));
    const group = h('div', { class: 'w-guesses w-ans-list', role: 'radiogroup', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } }, btns);
    arrowNav(group, { selector: '.w-guess' });
    layout(ctx, 'warmup',
      h('section', { class: 'w-glass w-glass-top w-warmup-panel' }, glassKicker('guess', p.title, p.chip), zones.instruction),
      sheet('right w-sheet-44', h('p', { class: 'w-sheet-title' }, ui.warmup.prompt), group, zones.band));
    zones.setHintVisible(false); // the frame shows no hint line: the hint stays for screen readers
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const show = (i, focus) => {
      btns.forEach((b, j) => {
        b.setAttribute('aria-checked', String(i === j));
        b.querySelector('.w-guess-tag').textContent = i === j ? ui.warmup.guess : '';
      });
      zones.setFeedback({ state: 'guess', verdict: screen.feedback.verdict, text: screen.feedback.text });
      ctx.unlockNext({ focus });
    };
    btns.forEach((b, i) => b.addEventListener('click', () => {
      if (b.getAttribute('aria-checked') === 'true') return; // the same guess again is not a new answer
      ctx.answer({ trackingId, response: letter(i), result: 'neutral' });
      ctx.flags.set('p', screen.options[i].id);
      ctx.complete();
      show(i, true);
    }));
    const was = screen.options.findIndex((o) => o.id === ctx.flags.get('p'));
    if (was >= 0) show(was, false);
    return { unmount() {} };
  },
};

/* ---------- concept (K1) ---------- */
// the two line drawings of the frame (viewBox 400 x 110), drawn on when the screen opens
const DRAW = {
  mess: '<circle cx="18" cy="70" r="11"/><path d="M29 70c25-45 45 45 70 0s35-55 60 5 35 35 55-25 30-25 45 30 25 15 40-15 15 0 25 5"/><circle cx="385" cy="70" r="10" stroke-width="5"/>',
  lean: '<circle cx="18" cy="70" r="11"/><path d="M29 70h56"/><rect x="85" y="48" width="84" height="44" rx="8"/><path d="M169 70h52"/><rect x="221" y="48" width="84" height="44" rx="8"/><path d="M305 70h70"/><circle cx="385" cy="70" r="10" stroke-width="5"/>',
  heads: '<path d="M330 22l20 14-20 14z"/><path d="M350 22l20 14-20 14z"/>',
};
function drawing(kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-fig-draw draw');
  svg.setAttribute('viewBox', '0 0 400 110');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<g class="w-fig-lines">${DRAW[kind] || DRAW.lean}</g><g class="w-fig-heads">${DRAW.heads}</g>`;
  return svg;
}

export const concept = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const ev = screen.evidence;
    const [evHead, evRest] = String(ev.text).includes(': ') ? [ev.text.slice(0, ev.text.indexOf(': ') + 1), ev.text.slice(ev.text.indexOf(': ') + 2)] : ['', ev.text];
    const figs = screen.figures.map((f) => h('figure', { class: 'w-fig', dataset: { kind: f.kind }, role: 'img', 'aria-label': f.alt },
      h('div', { class: 'w-fig-text' }, f.label ? h('span', { class: 'w-fig-label' }, f.label) : null, h('b', { class: 'w-fig-caption' }, f.caption)),
      drawing(f.kind)));
    layout(ctx, 'concept',
      h('div', { class: 'w-focus-head' },
        h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)),
        zones.instruction,
        h('p', { class: 'w-concept-text' }, screen.text)),
      h('div', { class: 'w-figs' }, figs[0], glyph('g-arrow-long', { size: 38.4, className: 'w-figs-arrow' }), figs.slice(1)),
      h('p', { class: 'w-evidence' }, h('span', {}, evHead ? [h('b', {}, evHead), ' '] : null, evRest), h('span', { class: 'w-evidence-source' }, ev.source)));
    return { unmount() {} };
  },
};

/* ---------- keyColumns (K4) ---------- */
// The K1 head over two figure cards (K1's teal "lean" and grey "mess" kinds): the column's name as the
// caption, then its items, each with a check (good fit) or a cross (poor fit) disc. Not tracked; a
// presentation screen (Next never locked).
export const keyColumns = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const cols = screen.columns.map((c) => h('figure', { class: 'w-fig w-kcol', dataset: { kind: c.kind, column: c.id } },
      h('figcaption', { class: 'w-fig-caption' }, c.title),
      h('ul', { class: 'w-kcol-list' }, c.items.map((it) => h('li', {},
        h('span', { class: 'w-kcol-mark', 'aria-hidden': 'true' }, glyph(c.kind === 'lean' ? 'g-check-b' : 'g-cross', { size: 14.08 })),
        h('span', {}, h('b', {}, it.term + (it.text ? ':' : '')), it.text ? ' ' + it.text : null))))));
    layout(ctx, 'concept',
      h('div', { class: 'w-focus-head' },
        h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)),
        zones.instruction,
        h('p', { class: 'w-concept-text' }, screen.text)),
      h('div', { class: 'w-figs w-figs-two' }, cols));
    return { unmount() {} };
  },
};

/* ---------- keyParts (K2) ---------- */
// The K1 head (pill, h1, one line) over three numbered figure cards on a line with arrows between
// them. The case toggle (an outline button, top right, aria-pressed) adds a divider and the case
// line in teal ink under each card. Not tracked; a presentation screen.
export const keyParts = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const cases = screen.parts.map((p) => h('div', { class: 'w-part-case', id: 'w-case-' + p.id, hidden: true },
      h('span', { class: 'w-part-case-label' }, screen.caseLabel), h('b', { class: 'w-part-case-text' }, p.case)));
    const cards = screen.parts.map((p, i) => h('figure', { class: 'w-part', dataset: { part: p.id } },
      h('span', { class: 'w-part-num', 'aria-hidden': 'true' }, String(i + 1)),
      h('div', { class: 'w-part-body' }, h('b', { class: 'w-part-title' }, p.title), h('span', { class: 'w-part-text' }, p.text)),
      cases[i]));
    const toggle = h('button', { class: 'w-case-toggle', type: 'button', 'aria-pressed': 'false', 'aria-controls': cases.map((c) => c.id).join(' '), dataset: { action: 'caseToggle' } },
      screen.caseToggle);
    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(on));
      cases.forEach((c) => { c.hidden = !on; });
    });
    const row = [];
    cards.forEach((c, i) => row.push(i ? glyph('g-arrow-long', { size: 38.4, className: 'w-parts-arrow' }) : null, c));
    // FX1 E1: the toggle under the cards, full width (an outline button with a soft turquoise ring that
    // pulses twice, once, after the build-up: card, then arrow, one by one). Next stays unlocked.
    layout(ctx, 'concept',
      h('div', { class: 'w-focus-head' },
        h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)),
        zones.instruction,
        h('p', { class: 'w-concept-text' }, screen.text)),
      h('div', { class: 'w-parts-wrap' }, h('div', { class: 'w-parts' }, row), toggle));
    if (!ctx.revisit) {
      const t = buildUp(row.filter(Boolean), { start: 150, step: 200 });
      toggle.classList.add('w-pulse-twice');
      toggle.style.setProperty('--b-delay', t + 'ms');
    }
    return { unmount() {} };
  },
};
