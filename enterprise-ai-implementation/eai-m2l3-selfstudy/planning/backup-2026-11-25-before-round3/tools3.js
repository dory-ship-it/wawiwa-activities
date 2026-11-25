// tools3: three tools side by side, each shown as a small diagram of how it works (EAI M2 L3, F0, design pass 24 Nov
// 2026; replaces keyParts on this screen with the same content and the same toggle). A learn screen on the dark
// ground. Three columns divided by hairlines, no cards: the drawing (5-Whys: a chain going down to a root; Fishbone:
// a head and its bones; Pareto: a few tall bars and many short ones), the tool's name, its line. The toggle "What each
// one does" opens each column's case line under a short rule. Presentation; not tracked.
// Content (as keyParts): label, instruction, parts [{ id, title, text, case }], caseToggle, caseLabel; parts[i].draw
// names the drawing ('chain' | 'fish' | 'bars').
import { h } from '../src/util.js?v=34b6caae';
import { glyph } from '../src/icons.js?v=34b6caae';
import { layout } from '../src/templates/stage.js?v=34b6caae';

const NS = 'http://www.w3.org/2000/svg';
const DRAW = {
  chain: '<g fill="none" stroke-linecap="round" stroke-width="3"><path d="M30 14h120" class="a"/><path d="M42 14v22M60 46v22M78 78v22M96 110v22" class="l"/>'
    + '<circle cx="42" cy="40" r="7" class="n"/><circle cx="60" cy="72" r="7" class="n"/><circle cx="78" cy="104" r="7" class="n"/><circle cx="96" cy="136" r="7" class="n"/>'
    + '<path d="M50 40h70M68 72h70M86 104h52M104 136h46" class="t"/></g><circle cx="122" cy="150" r="9" class="root"/>',
  fish: '<g fill="none" stroke-linecap="round" stroke-width="3"><path d="M18 84h112" class="a"/><path d="M46 84l-16-38M78 84l-16-38M110 84l-16-38M46 84l-16 38M78 84l-16 38M110 84l-16 38" class="l"/></g>'
    + '<path d="M130 84l26-20v40z" class="root"/><g class="n"><circle cx="30" cy="44" r="5"/><circle cx="62" cy="44" r="5"/><circle cx="94" cy="44" r="5"/><circle cx="30" cy="124" r="5"/><circle cx="62" cy="124" r="5"/><circle cx="94" cy="124" r="5"/></g>',
  bars: '<rect x="20" y="30" width="22" height="110" rx="2" class="root"/><rect x="48" y="58" width="22" height="82" rx="2" class="root"/>'
    + '<rect x="76" y="104" width="22" height="36" rx="2" class="dim"/><rect x="104" y="116" width="22" height="24" rx="2" class="dim"/><rect x="132" y="126" width="22" height="14" rx="2" class="dim"/>'
    + '<path d="M14 140h146" class="a" fill="none" stroke-width="3" stroke-linecap="round"/>',
};
const drawing = (name) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 170 160'); s.setAttribute('class', 'm-t3-draw'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = DRAW[name] || ''; return s; };

export const tools3 = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, zones } = ctx;
    const cases = [];
    const cols = screen.parts.map((p, i) => {
      const c = h('p', { class: 'm-t3-case', id: 'm-t3-case-' + p.id, hidden: true }, h('span', {}, screen.caseLabel), h('b', {}, p.case));
      cases.push(c);
      return h('section', { class: 'm-t3-col', dataset: { part: p.id } },
        drawing(p.draw), h('span', { class: 'm-t3-n', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
        h('h2', { class: 'm-t3-title' }, p.title), h('p', { class: 'm-t3-text' }, p.text), c);
    });
    const toggle = h('button', { class: 'w-case-toggle m-t3-toggle', type: 'button', 'aria-pressed': 'false', 'aria-controls': cases.map((c) => c.id).join(' '), dataset: { action: 'caseToggle' } }, screen.caseToggle);
    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(on));
      cases.forEach((c) => { c.hidden = !on; });
    });
    layout(ctx, 'tools3',
      h('div', { class: 'w-focus-head' }, h('p', { class: 'w-key-label' }, glyph('learn', { size: 23.04 }), h('span', {}, screen.label)), zones.instruction),
      h('div', { class: 'm-t3-wrap' }, h('div', { class: 'm-t3' }, cols), h('div', { class: 'm-t3-foot' }, toggle)));
    zones.setHintVisible(false);
    return { unmount() {} };
  },
};
