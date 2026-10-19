// Round 4 templates (storyboard v3, Intro and Chapter 1), refs planning/design-reference/R4-*.html.
//   title      (O1)  layout "title": no header or footer (the rail stays). Text column left (logo,
//                    programme, module and lesson, h1, rule, quote, "Start the lesson"), photo right.
//   moduleMap  (O2)  layout "present": header line; five lesson stations on a line as ARIA tabs
//                    (arrow keys move, Enter or Space opens, roving tabindex), the open lesson's panel
//                    under them. Today's lesson is open on arrival. Ghost hand type "tabs".
//   goals      (O3)  layout "present": the deliverable box, five icon tiles (the full goal as the
//                    tile's tooltip on hover or focus), appearing 150 ms apart.
//   warmup     (W1)  layout "warmup": navy panel left, the question right as a radio group. Any pick is
//                    a neutral "Your guess" (no right or wrong colours); the pick can change. Next after
//                    a pick. One neutral interaction; a later pick goes out as a retry.
//   concept    (K1)  layout "concept": "Key idea" on a light blue-grey stage, the idea in one line, two
//                    figure cards drawn in HTML / CSS (they draw on in about 1 s), an evidence line.
// Title, module map, goals and key idea are presentation screens (screen.presentation): the engine
// marks them done on arrival, so Next never locks. All text comes from the content.
import { h } from '../util.js';
import { icon, statusMark } from '../icons.js';
import { attachTip } from '../tooltip.js';
import { letter } from '../tracking/index.js';
import { layout, picture, arrowNav } from './stage.js';

// the header bar of the Round 4 screens: logo and the lesson line
const header = (ctx) => h('header', { class: 'w-header w-header-line' }, ctx.zones.logo, h('p', { class: 'w-header-text' }, ctx.ui.header));

/* ---------- title (O1) ---------- */
export const title = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const start = h('button', { class: 'w-btn w-start', type: 'button', dataset: { action: 'start' }, onclick: () => ctx.next() },
      h('span', {}, ui.buttons[screen.start]), icon('arrow-right', { size: 20 }));
    layout(ctx, 'title',
      h('section', { class: 'w-title-col' },
        zones.logo,
        h('div', { class: 'w-title-body' },
          h('p', { class: 'w-title-program' }, screen.program),
          h('p', { class: 'w-title-kicker' }, screen.kicker),
          zones.instruction,
          h('span', { class: 'w-title-rule', 'aria-hidden': 'true' }),
          h('p', { class: 'w-title-quote' }, screen.quote),
          h('div', { class: 'w-title-actions' }, start))),
      picture(screen.image, 'w-title-photo'));
    return { unmount() {} };
  },
};

/* ---------- moduleMap (O2) ---------- */
export const moduleMap = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const mm = ui.moduleMap;
    const stations = screen.stations;
    const panelId = 'w-map-panel';
    const panelIcon = h('span', { class: 'w-map-panel-icon' });
    const panelKicker = h('p', { class: 'w-map-panel-kicker' });
    const panelTitle = h('p', { class: 'w-map-panel-title' });
    const panelText = h('p', { class: 'w-map-panel-text' });
    const panel = h('section', { class: 'w-map-panel', id: panelId, role: 'tabpanel', tabindex: '0' }, panelIcon, h('div', {}, panelKicker, panelTitle, panelText));

    const tabs = stations.map((st) => {
      const today = st.status === 'today';
      const kicker = h('span', { class: 'w-map-kicker' }, st.kicker, today ? h('span', { class: 'w-map-today' }, mm.today) : null);
      const tab = h('button', { class: 'w-map-tab', type: 'button', role: 'tab', id: 'w-map-tab-' + st.id, 'aria-selected': 'false', 'aria-controls': panelId, tabindex: '-1',
        dataset: { station: st.id, status: st.status } },
        kicker, h('span', { class: 'w-map-title' }, st.title), h('span', { class: 'w-sr-only' }, ', ' + mm.status[st.status]));
      const mark = st.status === 'done' ? statusMark('done') : statusMark(today ? 'today' : 'locked');
      return { st, tab, el: h('div', { class: 'w-map-station', dataset: { status: st.status } }, mark, tab) };
    });
    const list = h('div', { class: 'w-map-tabs', role: 'tablist', 'aria-label': mm.label }, tabs.map((x) => x.el));
    const openIndex = () => tabs.findIndex((x) => x.tab.getAttribute('aria-selected') === 'true');
    function open(i, { focus = false } = {}) {
      tabs.forEach((x, j) => { x.tab.setAttribute('aria-selected', String(i === j)); x.tab.tabIndex = i === j ? 0 : -1; });
      const st = stations[i];
      panel.setAttribute('aria-labelledby', tabs[i].tab.id);
      panel.dataset.station = st.id;
      panelIcon.replaceChildren(icon(st.icon, { size: 28 }));
      panelKicker.textContent = st.status === 'today' ? st.kicker + ' · ' + mm.today : st.kicker;
      panelTitle.textContent = st.title;
      panelText.textContent = st.text;
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
    tabs.forEach((x, i) => x.tab.addEventListener('click', () => open(i)));
    // stations not opened keep the selected one reachable by Tab when focus left the list
    list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) tabs.forEach((x, n) => { x.tab.tabIndex = n === openIndex() ? 0 : -1; }); });

    const home = Math.max(0, stations.findIndex((st) => st.open));
    open(home);
    const g = screen.ghost ? ctx.ghost({
      type: screen.ghost.type,
      // tap the station named in the content: it opens, then today's lesson opens again
      steps: () => { const i = stations.findIndex((st) => st.id === screen.ghost.target); return [{ el: tabs[i].tab, tap: () => open(i), hold: 700 }]; },
      restore: () => open(home),
    }) : null;

    layout(ctx, 'present', header(ctx),
      h('div', { class: 'w-present' },
        h('p', { class: 'w-eyebrow' }, screen.eyebrow),
        h('div', { class: 'w-present-head' }, zones.instruction, g ? g.button : null),
        h('p', { class: 'w-present-line' }, screen.line),
        h('div', { class: 'w-map' }, h('span', { class: 'w-map-line', 'aria-hidden': 'true' }), list),
        panel));
    return { unmount() {} };
  },
};

/* ---------- goals (O3) ---------- */
export const goals = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const d = screen.deliverable;
    const tiles = screen.goals.map((g, i) => {
      const li = h('li', { class: 'w-goal', tabindex: '0', dataset: { goal: g.id } },
        icon(g.icon, { size: 32, className: 'w-goal-icon' }), h('span', { class: 'w-goal-label' }, g.label));
      li.style.setProperty('--i', String(i));
      return li;
    });
    layout(ctx, 'present', header(ctx),
      h('div', { class: 'w-present' },
        h('p', { class: 'w-eyebrow' }, screen.eyebrow),
        zones.instruction,
        h('section', { class: 'w-deliverable', 'aria-label': d.label },
          h('span', { class: 'w-deliverable-icon' }, icon(d.icon, { size: 28 })),
          h('div', {}, h('p', { class: 'w-deliverable-label' }, d.label), h('p', { class: 'w-deliverable-text' }, d.text))),
        h('ul', { class: 'w-goals' }, tiles)));
    // the full goal on hover or keyboard focus, and for screen readers through aria-describedby
    tiles.forEach((li, i) => attachTip(li, screen.goals[i].text));
    return { unmount() {} };
  },
};

/* ---------- warmup (W1) ---------- */
export const warmup = {
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const p = screen.panel;
    const trackingId = screen.tracking[0].id;
    const btns = screen.options.map((o) => h('button', { class: 'w-guess', type: 'button', role: 'radio', 'aria-checked': 'false', dataset: { id: o.id } },
      h('span', { class: 'w-guess-ring', 'aria-hidden': 'true' }), h('span', { class: 'w-guess-label' }, o.label), h('span', { class: 'w-guess-tag' })));
    const group = h('div', { class: 'w-guesses', role: 'radiogroup', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } }, btns);
    arrowNav(group, { selector: '.w-guess' });
    layout(ctx, 'warmup', header(ctx),
      h('div', { class: 'w-warmup' },
        h('aside', { class: 'w-warmup-panel' },
          h('span', { class: 'w-warmup-icon' }, icon(p.icon, { size: 32 })),
          h('p', { class: 'w-warmup-title' }, p.title),
          h('p', { class: 'w-warmup-chip' }, p.chip),
          h('p', { class: 'w-warmup-text' }, p.text),
          h('p', { class: 'w-warmup-foot' }, p.foot)),
        h('section', { class: 'w-warmup-main' }, zones.instruction, group, zones.band)));
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
// the two figure drawings, in stage px inside a 440 x 112 box (positions from the R4-K1 board)
const MESS = [[0, 46, -6], [82, 18, 5], [150, 60, -3], [226, 14, 8], [300, 58, -7], [372, 30, 4]];
const MESS_LINKS = 'M64 60 C 74 40, 78 36, 84 36 M146 40 C 150 70, 148 72, 152 76 M214 72 C 220 40, 222 34, 228 32 M290 34 C 296 70, 296 72, 302 74 M364 70 C 368 50, 368 46, 374 46 M400 64 C 380 110, 130 110, 110 56';
function drawing(fig) {
  const box = h('div', { class: 'w-fig-draw', 'aria-hidden': 'true' });
  if (fig.kind === 'mess') {
    MESS.forEach(([x, y, r], i) => {
      const b = h('span', { class: 'w-fig-box w-fig-box-mess' });
      Object.assign(b.style, { left: x + 'px', top: y + 'px', '--r': r + 'deg', '--i': String(i) });
      box.append(b);
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-fig-links');
    svg.setAttribute('viewBox', '0 0 440 112');
    svg.setAttribute('width', '440');
    svg.setAttribute('height', '112');
    svg.innerHTML = `<path d="${MESS_LINKS}"/>`;
    box.append(svg, h('span', { class: 'w-fig-chip' }, icon('lightning', { size: 14 }), h('span', {}, fig.chip)));
  } else {
    box.append(h('span', { class: 'w-fig-box w-fig-box-cut' }, icon('x', { size: 16 })));
    const row = h('div', { class: 'w-fig-row' });
    for (let i = 0; i < 4; i++) {
      if (i) row.append(icon('arrow-right', { size: 22, className: 'w-fig-arrow' }));
      const b = h('span', { class: 'w-fig-box w-fig-box-lean' });
      b.style.setProperty('--i', String(i));
      row.append(b);
    }
    box.append(row);
  }
  return box;
}

export const concept = {
  mount(ctx) {
    const { screen, zones } = ctx;
    const ev = screen.evidence;
    const figs = screen.figures.map((f) => h('figure', { class: 'w-fig', dataset: { kind: f.kind }, role: 'img', 'aria-label': f.alt },
      drawing(f), h('figcaption', { class: 'w-fig-caption' }, f.caption)));
    layout(ctx, 'concept', header(ctx),
      h('div', { class: 'w-concept' },
        h('p', { class: 'w-key-label' }, h('span', { class: 'w-key-icon' }, icon('key-idea', { size: 20 })),
          h('span', { class: 'w-key-word' }, screen.label), h('span', { class: 'w-key-topic' }, '· ' + screen.topic)),
        zones.instruction,
        h('p', { class: 'w-concept-text' }, screen.text),
        h('div', { class: 'w-figs' }, figs),
        h('p', { class: 'w-evidence' }, icon(ev.icon, { size: 22 }), h('span', {}, ev.text), h('span', { class: 'w-evidence-source' }, ev.source))));
    return { unmount() {} };
  },
};
