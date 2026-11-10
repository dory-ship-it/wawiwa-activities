// FX8 board: Chapters 3 to 7 (W3 to END) drawn in the language of Noy's "L4 Screens Intro to Ch2" artifact
// (the spec), plus the decisions approved after it (FX7: Kit 13 translucent bar, feedback bubble under the
// answers, Your answer / Right answer tags, select then Check). Static mock-ups, no src/ change.
// Screens are authored in stage px at 1280 x 720 and converted to cqw (1cqw = 12.8px) so every frame scales.
// Usage: node planning/fx8-board/build.mjs  -> planning/fx8-board/index.html
import { writeFileSync } from 'node:fs';

const C = {
  stone: '#F7F5F1', ivory: '#FBFAF7', white: '#FFFFFF', ink: '#16293A', text2: '#33414B', muted: '#55626C',
  line: '#E2DED6', lineStrong: '#CFC8BB', dash: '#B9B2A5', navy: '#255777', turq: '#5AB3AA', teal: '#3E868F',
  tealInk: '#2F6A72', correctBg: '#DCEEEC', correctHead: '#1E4E55', error: '#CC0000', errorBg: '#FBEAEA',
  errorHead: '#A30000', neutralBg: '#E7E4DD', neutralLine: '#8A98A2', keypill: '#E1EFEE', chip: '#CFE6E4',
  cardLine: '#DAD5CC', idle: '#6A7680', body: '#111A20', fb: '#1B2B36', aqua: '#9FD3CD', glassText: '#E6EEF2',
};
const U = 'font-family:var(--ui)';

// ---------- icons (24 grid, stroke) ----------
const P = {
  guess: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
  watch: '<path d="M9 7.2v9.6l7.8-4.8z" fill="currentColor"/>',
  sort: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M10.5 7h3.5a3 3 0 0 1 3 3v1.5M15 9.5l2 2 2-2"/>',
  decide: '<path d="M9.3 9a2.7 2.7 0 1 1 3.8 2.5c-.7.3-1.1 1-1.1 1.8v.6"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/>',
  gauge: '<path d="M4.5 16a8 8 0 1 1 15 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1.3" fill="currentColor"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  write: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  scope: '<circle cx="5.5" cy="12" r="2.5"/><circle cx="18.5" cy="12" r="2.5"/><path d="M8 12h8"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  learn: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  arrows: '<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>',
  map: '<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M20 20l-5-5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  checkc: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16.3 9.5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3"/>',
  finish: '<path d="M5 21V4M5 4h13v9H5"/><path d="M9 4v9M13 4v9M5 8.5h13"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  ruler: '<path d="M3.5 15.5l12-12 5 5-12 12z"/><path d="M8 11l2 2M11 8l2 2M14 5l2 2"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  x: '<path d="M7 7l10 10M17 7L7 17"/>',
  arrow: '<path d="M4 12h15M14 6l6 6-6 6"/>',
  speech: '<path d="M4 5h16v11H9l-5 4z"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  scissors: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 18M8 15.5L20 6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  robot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/><circle cx="12" cy="3.5" r="1"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  pdf: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M8.5 16v-4h1.3a1.2 1.2 0 0 1 0 2.4H8.5M13 12v4h.8a2 2 0 0 0 0-4z"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
  hourglass: '<path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/>',
  printer: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  grip: '<g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></g>',
  hand: '<path d="M9 11V4.6a1.6 1.6 0 0 1 3.2 0V10m0-1.2a1.6 1.6 0 0 1 3.2 0V10m0-.6a1.6 1.6 0 0 1 3.2 0v1.2m0 0a1.4 1.4 0 0 1 2.8 0V15a6.3 6.3 0 0 1-6.3 6.3h-1.8a6.3 6.3 0 0 1-4.9-2.3L4.4 15.4a1.5 1.5 0 0 1 2.3-2L9 15.5V11"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.8-3.4 3-5 5.5-5s4.7 1.6 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14c2.4 0 4 1.4 4.6 4"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
  tag: '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8.5 8.5-9 9z"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/>',
  zap: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
};
const ic = (n, size, color, sw = 1.9, extra = '') => `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;flex:none;color:${color}${extra}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const quoteMark = (w, color = C.turq) => `<svg viewBox="0 0 40 30" style="width:${w}px;display:block;flex:none" aria-hidden="true"><path d="M0 30V17C0 7 6 1 16 0v6c-5 1-8 5-8 10h8v14zm22 0V17c0-10 6-16 16-17v6c-5 1-8 5-8 10h8v14z" fill="${color}"/></svg>`;

// ---------- chapters ----------
const CH = {
  ch3: { n: 4, title: 'HR demo', photo: 'ch4-hr-demo.jpg', pos: '30% 40%', steps: [['Guess', 'guess'], ['Watch', 'watch'], ['Sort', 'sort'], ['Decide', 'decide'], ['Measure', 'gauge'], ['Flag', 'flag'], ['Write', 'write']] },
  ch4: { n: 5, title: 'Critical eye', photo: 'ch5-critical-eye.jpg', pos: '65% 50%', steps: [['Guess', 'guess'], ['Scope', 'scope'], ['Record', 'doc'], ['Ask', 'decide'], ['Learn', 'learn'], ['Sort', 'sort'], ['Spot', 'eye'], ['Write', 'write']] },
  ch5: { n: 6, title: 'Build yours', photo: 'ch6-build-yours.jpg', pos: '35% 50%', steps: [['Match', 'arrows'], ['Decide', 'decide'], ['Write', 'write'], ['Map', 'map'], ['Review', 'search']] },
  ch6: { n: 7, title: 'Wrap-up', photo: 'ch7-wrap-up.jpg', pos: '40% 50%', steps: [['Check', 'checkc'], ['Score', 'gauge'], ['Reflect', 'key'], ['Finish', 'finish']] },
};

// ---------- chrome ----------
function bar(ch, cur) {
  const c = CH[ch];
  const steps = c.steps.map(([label, icon], i) => {
    const done = i < cur, now = i === cur;
    const disc = done
      ? `<span style="width:34.56px;height:34.56px;border-radius:50%;background:${C.navy};display:grid;place-items:center">${ic('check', 18, '#fff', 3)}</span>`
      : now
        ? `<span style="width:34.56px;height:34.56px;border-radius:50%;background:#fff;box-shadow:0 0 0 3.8px ${C.turq},0 0 0 9px rgba(90,179,170,.25);display:grid;place-items:center">${ic(icon, 19, C.tealInk)}</span>`
        : `<span style="width:34.56px;height:34.56px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.4);display:grid;place-items:center">${ic(icon, 18, 'rgba(255,255,255,.75)')}</span>`;
    const link = i ? `<i style="flex:1;min-width:14px;height:3px;margin-top:16px;background:${i <= cur ? C.navy : 'rgba(255,255,255,.3)'}"></i>` : '';
    return `${link}<span style="display:flex;flex-direction:column;align-items:center;gap:5px;width:62px"><span>${disc}</span><span style="font:${now ? 700 : 500} 14px var(--ui);color:${now ? '#fff' : 'rgba(255,255,255,.82)'};white-space:nowrap">${label}</span></span>`;
  }).join('');
  return `<div style="position:absolute;left:0;right:0;top:0;height:80.64px;background:rgba(12,28,40,.42);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.14);z-index:4;display:flex;align-items:center;padding:0 23px;gap:15px">
  <span class="logo" role="img" aria-label="Wawiwa" style="width:84px"></span><span style="width:1px;height:38px;background:rgba(255,255,255,.25)"></span>
  <span aria-label="Chapters menu" style="display:grid;gap:5px;padding:8px"><i style="width:27px;height:3px;background:#fff"></i><i style="width:27px;height:3px;background:#fff"></i><i style="width:27px;height:3px;background:#fff"></i></span>
  <span style="display:grid;line-height:1.15"><span style="font:500 14px var(--ui);color:rgba(255,255,255,.82)">Chapter ${c.n} of 7</span><b style="font:800 20px var(--ui);color:#fff">${c.title}</b></span>
  <span style="margin-left:auto;display:flex;align-items:flex-start">${steps}</span></div>`;
}
function foot(next = 'on', label = 'Next') {
  const nx = next === 'off'
    ? `<span style="display:inline-flex;align-items:center;gap:8px;font:700 18px var(--ui);color:#fff;padding:10px 26px;border-radius:9px;background:${C.neutralLine}">${ic('lock', 17, '#fff', 2.2)}${label}</span>`
    : next === 'none' ? '' : `<span style="font:700 18px var(--ui);color:#fff;padding:10px 33px;border-radius:9px;background:${C.tealInk}">${label}</span>`;
  return `<div style="position:absolute;left:23px;right:23px;bottom:18px;display:flex;justify-content:space-between;align-items:center;z-index:4"><span style="font:600 18px var(--ui);color:${C.navy};background:#fff;border:1px solid ${C.lineStrong};padding:10px 23px;border-radius:9px">Previous</span>${nx}</div>`;
}
function ground(kind, ch, opt = {}) {
  const c = CH[ch];
  const photo = opt.photo || c.photo, pos = opt.pos || c.pos, mir = opt.mirror ? 'transform:scaleX(-1);' : '';
  if (kind === 'stage') return `<div class="push" style="position:absolute;inset:0;background:url(img/${photo}) ${pos}/cover no-repeat;${mir}"></div>${opt.shade === false ? '' : '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,20,30,.35),rgba(8,20,30,0) 45%,rgba(8,20,30,.25))"></div>'}`;
  return `<div style="position:absolute;inset:-40px;background:url(img/${photo}) ${pos}/cover no-repeat;${mir}filter:blur(14px) saturate(1)"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(247,245,241,.62),rgba(247,245,241,.46) 60%,rgba(247,245,241,.54))"></div>`;
}
const frame = (bg, inner) => `<div class="scr" style="background:${bg}">${inner}</div>`;

// ---------- parts ----------
const kicker = (icon, text, pill = true) => pill
  ? `<span style="display:inline-flex;align-items:center;gap:9px;font:700 17px var(--ui);color:${C.tealInk};background:${C.keypill};border-radius:26px;padding:6px 16px 6px 11px">${ic(icon, 22, C.tealInk)}${text}</span>`
  : `<span style="display:inline-flex;align-items:center;gap:9px;font:700 17px var(--ui);color:${C.tealInk}">${ic(icon, 22, C.tealInk)}${text}</span>`;
const h1 = (t, size = 44, extra = '') => `<div style="font:800 ${size}px/1.06 var(--ui);color:${C.ink};letter-spacing:-.8px;${extra}">${t}</div>`;
const lead = (t, extra = '') => `<div style="font:400 21px/1.45 var(--ui);color:${C.text2};${extra}">${t}</div>`;
const card = (inner, extra = '') => `<div style="background:#fff;border:1px solid ${C.line};border-radius:18px;box-shadow:0 15px 31px rgba(15,42,61,.12);${extra}">${inner}</div>`;
const chipNS = (dark) => `<span style="font:600 14px var(--ui2);background:${dark ? C.turq : C.chip};color:${dark ? '#0B1E2A' : C.correctHead};border-radius:5px;padding:2px 10px">Not scored</span>`;
function radio(state) {
  if (state === 'right') return `<span style="width:29px;height:29px;border-radius:50%;flex:none;display:grid;place-items:center;background:${C.teal}">${ic('check', 17, '#fff', 3.2)}</span>`;
  if (state === 'wrong') return `<span style="width:29px;height:29px;border-radius:50%;flex:none;display:grid;place-items:center;background:${C.error}">${ic('x', 17, '#fff', 3.2)}</span>`;
  if (state === 'sel') return `<span style="width:29px;height:29px;border-radius:50%;flex:none;display:grid;place-items:center;border:2.5px solid ${C.navy}"><i style="width:14px;height:14px;border-radius:50%;background:${C.navy}"></i></span>`;
  return `<span style="width:29px;height:29px;border-radius:50%;flex:none;border:2.5px solid ${C.navy}"></span>`;
}
function ans(label, state = '', opt = {}) {
  const border = state === 'right' ? `3px solid ${C.teal}` : state === 'wrong' ? `3px solid ${C.error}` : state === 'sel' ? `3px solid ${C.navy}` : `1px solid ${C.cardLine}`;
  const pad = state && state !== 'dim' ? '12px 17px' : '14px 19px';
  const tag = state === 'right' ? `<span style="margin-left:auto;font:700 14px var(--ui2);color:${C.correctHead};white-space:nowrap">Right answer</span>` : state === 'wrong' ? `<span style="margin-left:auto;font:700 14px var(--ui2);color:${C.errorHead};white-space:nowrap">Your answer</span>` : '';
  const sub = opt.sub ? `<span style="display:block;font:400 16px var(--ui2);color:${C.muted};margin-top:2px">${opt.sub}</span>` : '';
  const lead = opt.letter ? `<span style="width:31px;height:31px;border-radius:8px;flex:none;display:grid;place-items:center;font:800 16px var(--ui);color:${C.navy};background:#EEF3F6">${opt.letter}</span>` : opt.icon ? `<span style="width:40px;height:40px;border-radius:10px;flex:none;display:grid;place-items:center;background:${C.keypill}">${ic(opt.icon, 22, C.tealInk)}</span>` : radio(state);
  return `<div style="display:flex;align-items:center;gap:15px;padding:${pad};border-radius:11px;background:#fff;border:${border};min-height:${opt.h || 58}px;font:600 20px/1.3 var(--ui);color:${C.body};${opt.extra || ''}">${opt.letter || opt.icon ? (state === 'right' || state === 'wrong' ? radio(state) : lead) : lead}<span>${label}${sub}</span>${tag}</div>`;
}
function bubble(kind, verdict, text, extra = '') {
  const col = kind === 'wrong' ? C.errorHead : kind === 'right' ? C.correctHead : C.ink;
  const icon = kind === 'wrong' ? `<span style="width:30px;height:30px;border-radius:50%;flex:none;display:grid;place-items:center;background:${C.error}">${ic('x', 17, '#fff', 3)}</span>` : kind === 'right' ? `<span style="width:30px;height:30px;border-radius:50%;flex:none;display:grid;place-items:center;background:${C.teal}">${ic('check', 17, '#fff', 3)}</span>` : ic('guess', 30, C.grey || '#4A5862');
  return `<div style="position:relative;margin-top:22px;padding:14px 22px 16px 18px;border-radius:16px;background:${C.neutralBg};display:flex;gap:14px;align-items:flex-start;${extra}"><i style="position:absolute;left:32px;top:-9px;width:18px;height:18px;background:${C.neutralBg};transform:rotate(45deg)"></i>${icon}<div><b style="display:block;font:800 21px/1.25 var(--ui);color:${col}">${verdict}</b><div style="font:400 18px/1.45 var(--ui);color:${C.fb};margin-top:2px">${text}</div></div></div>`;
}
const btn = (label, kind = 'primary', icon = '') => kind === 'primary'
  ? `<span style="display:inline-flex;align-items:center;gap:9px;font:700 18px var(--ui);color:#fff;background:${C.navy};padding:11px 24px;border-radius:9px">${label}${icon ? ic(icon, 19, '#fff', 2.2) : ''}</span>`
  : kind === 'check' ? `<span style="display:inline-flex;align-items:center;gap:8px;font:700 18px var(--ui);color:#fff;background:${C.tealInk};padding:10px 30px;border-radius:9px">${label}</span>`
  : `<span style="display:inline-flex;align-items:center;gap:9px;font:700 17px var(--ui);color:${C.navy};background:#fff;border:2px solid ${C.navy};padding:8px 18px;border-radius:9px">${icon ? ic(icon, 19, C.navy, 2) : ''}${label}</span>`;
const showMe = () => btn('Show me', 'ghost', 'hand');
const handCursor = (x, y, size = 56) => `<svg viewBox="0 0 24 24" style="position:absolute;left:${x}px;top:${y}px;width:${size}px;z-index:7;filter:drop-shadow(0 4px 6px rgba(0,0,0,.3))" aria-hidden="true"><path d="${P.hand.match(/d="([^"]+)"/)[1]}" fill="rgba(255,255,255,.88)" stroke="${C.ink}" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
const glass = (inner, pos) => `<div style="position:absolute;${pos};padding:26px 30px;border-radius:16px;background:rgba(10,22,32,.64);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);z-index:2">${inner}</div>`;
const panel = (inner, pos) => `<div style="position:absolute;${pos};border-radius:18px;background:${C.ivory};padding:30px 32px;box-shadow:0 25px 64px rgba(0,0,0,.28);display:flex;flex-direction:column;z-index:2">${inner}</div>`;
const field = (label, value, opt = {}) => `<div style="display:grid;gap:7px;${opt.extra || ''}"><span style="font:700 17px var(--ui);color:${C.ink}">${label}${opt.optional ? ` <span style="font:400 15px var(--ui2);color:${C.muted}">optional</span>` : ''}</span><div style="min-height:${opt.h || 52}px;padding:13px 16px;border-radius:10px;background:#fff;border:${opt.focus ? `3px solid ${C.navy}` : `1px solid ${C.cardLine}`};font:400 18px/1.4 var(--ui);color:${value ? C.body : C.idle}">${value || opt.ph || ''}</div>${opt.count ? `<span style="justify-self:end;font:400 14px var(--ui2);color:${C.muted}">${opt.count}</span>` : ''}</div>`;
const privacy = (t = 'Leave out names and identifying details.') => `<span style="display:inline-flex;align-items:center;gap:8px;font:500 16px var(--ui2);color:${C.muted}">${ic('shield', 19, C.muted)}${t}</span>`;
const yourCase = () => `<span style="display:inline-flex;align-items:center;gap:8px;font:700 15px var(--ui);color:${C.navy};background:#EEF3F6;border-radius:6px;padding:4px 11px">${ic('write', 16, C.navy, 2)}Your case</span>`;
const dropCol = (title, sub, extra = '', inner = '') => `<div style="border:2.5px dashed ${C.dash};border-radius:16px;padding:18px 20px;min-height:150px;background:rgba(255,255,255,.62);${extra}"><b style="display:block;font:800 22px/1.15 var(--ui);color:${C.ink}">${title}</b>${sub ? `<div style="font:400 16px var(--ui2);color:${C.muted};margin-top:4px">${sub}</div>` : ''}${inner}</div>`;
const placed = (t, ok = true) => `<div style="margin-top:12px;display:flex;align-items:center;gap:10px;padding:9px 12px;background:#fff;border:2px solid ${ok ? C.teal : C.error};border-radius:10px;font:600 16px/1.3 var(--ui);color:${C.body}">${radio(ok ? 'right' : 'wrong').replace(/29px/g, '22px').replace(/width:17px;height:17px/g, 'width:13px;height:13px')}${t}</div>`;
const deck = (text, count, opt = {}) => `<div style="position:absolute;left:50%;top:${opt.top || 196}px;transform:translateX(-50%);width:${opt.w || 440}px;z-index:${opt.z || 3}">
  <div style="position:absolute;inset:0;transform:translate(12px,12px);background:#fff;border:1px solid ${C.line};border-radius:15px"></div>
  <div style="position:absolute;inset:0;transform:translate(6px,6px);background:#fff;border:1px solid ${C.line};border-radius:15px"></div>
  <div style="position:relative;background:#fff;border:2.5px solid ${C.navy};border-radius:15px;padding:20px 24px;display:flex;gap:15px;align-items:center;box-shadow:0 15px 31px rgba(15,42,61,.16)">${ic('grip', 22, C.neutralLine)}<span><span style="display:block;font:800 25px/1.25 var(--ui);color:${C.ink}">${text}</span>${opt.tag ? `<span style="display:block;font:500 16px var(--ui2);color:${C.muted};margin-top:3px">${opt.tag}</span>` : ''}</span></div>
  <div style="text-align:center;font:500 16px var(--ui2);color:${C.text2};margin-top:24px">${count}</div></div>`;
const disc = (n, kind = 'navy', d = 34) => kind === 'navy'
  ? `<span style="width:${d}px;height:${d}px;border-radius:50%;flex:none;display:grid;place-items:center;font:800 ${Math.round(d * .47)}px var(--ui);color:#fff;background:${C.navy}">${n}</span>`
  : `<span style="width:${d}px;height:${d}px;border-radius:50%;flex:none;display:grid;place-items:center;font:700 ${Math.round(d * .45)}px var(--ui);color:${C.idle};background:#fff;border:1px solid ${C.lineStrong}">${n}</span>`;

// ---------- screens ----------
const S = [];
const add = (chapter, id, caption, note, html) => S.push({ chapter, id, caption, note, html });

// ===== Chapter 4 · HR demo =====
const warmup = (ch, cur, q, ctx, opts, picked, fb, gOpt) => frame('#0F2A3D', ground('stage', ch, gOpt) + bar(ch, cur)
  + glass(`<div style="display:flex;align-items:center;gap:11px">${ic('guess', 27, C.turq)}<span style="font:700 18px var(--ui);color:#fff">Warm-up</span>${chipNS(true)}</div>
  <div style="font:800 37px/1.15 var(--ui);color:#fff;margin-top:15px;letter-spacing:-.5px">${q}</div>${ctx ? `<div style="font:500 18px/1.4 var(--ui);color:${C.glassText};margin-top:12px">${ctx}</div>` : ''}`, 'left:44px;top:118px;width:540px')
  + panel(`<div style="font:800 27px var(--ui);color:${C.ink};margin-bottom:17px">Make your best guess.</div><div style="display:grid;gap:12px">${opts.map((o, i) => ans(o, picked === i ? 'sel' : '')).join('')}</div>${fb ? bubble('neutral', 'Hold that thought.', fb) : ''}`, `right:31px;top:${fb ? 150 : 196}px;width:580px`)
  + foot(fb ? 'on' : 'off'));

add('ch3', 'W3', 'Warm-up · Stage · guess made', 'Same Stage frame as W1 and W2: the photo stays sharp, the question sits on dark glass, only the answers are in the panel. The neutral bubble appears under the answers.',
  warmup('ch3', 0, 'May a salary question go into a public AI tool?', 'An employee asks HR about their own salary.', ['Yes, if the name is removed', "Only with the employee's consent", 'No, it holds confidential details'], 2, 'This chapter tags every source by how sensitive it is.', { pos: '20% 40%' }));

add('ch3', 'V2', 'Video · Stage · ready', 'As V1: the film fills the stage, the guiding question on glass, one big play button. No cream panel around the video.',
  frame('#0F2A3D', `<div class="push" style="position:absolute;inset:0;background:url(img/ch4-hr-demo.jpg) 30% 40%/cover no-repeat"></div><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,20,30,.45),rgba(8,20,30,.1) 60%)"></div>` + bar('ch3', 1)
  + glass(`<div style="display:flex;align-items:center;gap:11px">${ic('watch', 22, C.turq)}<span style="font:700 18px var(--ui);color:#fff">Video</span><span style="font:600 14px var(--ui2);background:${C.turq};color:#0B1E2A;border-radius:5px;padding:2px 10px">2:48</span></div>
  <div style="font:800 34px/1.15 var(--ui);color:#fff;margin-top:13px">Mapping the HR case</div><div style="font:500 18px/1.45 var(--ui);color:${C.glassText};margin-top:11px"><b style="color:${C.aqua}">Watch for:</b> how do you turn about 90 messy requests a month into a map you can check later?</div><div style="font:500 16px var(--ui2);color:rgba(255,255,255,.85);margin-top:12px">Answer the three questions when it stops.</div>`, 'left:44px;top:118px;width:520px')
  + `<div style="position:absolute;left:900px;top:290px;width:118px;height:118px;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center;box-shadow:0 0 0 12px rgba(90,179,170,.35);z-index:2"><svg viewBox="0 0 24 24" style="width:52px;margin-left:8px"><path d="M6 4v16l14-8z" fill="${C.tealInk}"/></svg></div>`
  + `<div style="position:absolute;left:44px;right:44px;bottom:84px;display:flex;align-items:center;gap:16px;color:#fff;z-index:2">${ic('watch', 22, '#fff')}<span style="font:500 16px var(--ui2)">0:00 / 2:48</span><span style="flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.35);position:relative"><i style="position:absolute;left:28%;top:-5px;width:15px;height:15px;border-radius:50%;background:#fff"></i><i style="position:absolute;left:48%;top:-5px;width:15px;height:15px;border-radius:50%;background:#fff"></i><i style="position:absolute;left:71%;top:-5px;width:15px;height:15px;border-radius:50%;background:#fff"></i></span><span style="font:700 14px var(--ui2);background:${C.turq};color:#0B1E2A;border-radius:4px;padding:2px 7px">CC</span>${ic('gauge', 24, '#fff')}</div>`
  + foot('off')));

// S09 sort: idle with Show me; and the drag state (card above the columns)
const s09cols = [['Source', 'A document the work depends on'], ['Owner', 'The role that keeps it current'], ['Sensitivity', 'Its level, PUBLIC to RESTRICTED'], ['Not Field 5', 'Belongs elsewhere on the map']];
const s09 = (state) => frame(C.stone, ground('focus', 'ch3') + bar('ch3', 2)
  + `<div style="position:absolute;left:52px;right:52px;top:108px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px"><div>${kicker('sort', 'Field 5 · Sources, owners, sensitivity', false)}<div style="margin-top:8px">${h1('Drag each card to its part of Field 5.', 36)}</div></div>${showMe()}</div>`
  + (state === 'drag'
    ? `<div style="position:absolute;left:258px;top:356px;width:330px;z-index:6;transform:rotate(-3deg)"><div style="background:#fff;border:2.5px solid ${C.navy};border-radius:15px;padding:16px 20px;display:flex;gap:13px;align-items:center;box-shadow:0 28px 44px rgba(15,42,61,.32)">${ic('grip', 20, C.neutralLine)}<span style="font:800 23px/1.25 var(--ui);color:${C.ink}">HR manager</span></div></div><div style="position:absolute;left:50%;top:236px;transform:translateX(-50%);font:500 16px var(--ui2);color:${C.text2}">3 of 6</div>`
    : deck('Vacation policy', '1 of 6', { top: 214, tag: 'A document HR answers from' }))
  + `<div style="position:absolute;left:52px;right:52px;bottom:84px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">${s09cols.map(([t, s], i) => dropCol(t, s, state === 'drag' && i === 1 ? `border-color:${C.navy};background:rgba(238,243,246,.95);box-shadow:0 0 0 4px rgba(37,87,119,.15)` : '', state === 'drag' && i === 0 ? placed('Vacation policy') + placed('Overtime policy') : '')).join('')}</div>`
  + (state === 'drag' ? '' : handCursor(690, 262)) + foot('off'));
add('ch3', 'S09', 'Sort · Focus · first card', 'Rise-style deck as S04: the photo wash shows around everything, white cards float on it. The kicker names Field 5 so the learner knows what the columns belong to.', s09('idle'));
add('ch3', 'S09', 'Sort · while dragging', 'Fix: the card you drag is lifted above the columns (larger shadow, slight tilt) and never slides behind them. The column under it lights up navy.', s09('drag'));

// S10 Field 7
const s10 = (picked) => frame(C.stone, ground('focus', 'ch3') + bar('ch3', 3)
  + `<div style="position:absolute;left:64px;top:110px;width:560px">${kicker('decide', 'Fields 6 and 7 · the HR map', false)}<div style="margin-top:10px">${h1('Choose what to write in Field 7.', 40)}</div>
  <div style="margin-top:22px;display:flex;gap:14px;align-items:flex-start;background:#fff;border-radius:16px;padding:18px 20px;box-shadow:0 15px 31px rgba(15,42,61,.12)"><span style="width:44px;height:44px;border-radius:50%;background:${C.navy};display:grid;place-items:center;flex:none">${ic('speech', 22, '#fff')}</span><div style="font:600 20px/1.4 var(--ui);color:${C.ink}">HR keeps no record of answers given or corrected.</div></div></div>`
  + card(`<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid ${C.line}"><span style="display:flex;align-items:center;gap:10px;font:800 19px var(--ui);color:${C.ink}">${ic('map', 22, C.tealInk)}HR map</span><span style="font:500 15px var(--ui2);color:${C.muted}">AS-IS · 8 fields</span></div>
  <div style="padding:16px 22px;display:grid;gap:12px"><div style="display:flex;gap:14px;align-items:flex-start">${disc(6, 'navy', 34)}<div><b style="font:700 18px var(--ui);color:${C.ink}">Existing controls</b><div style="font:400 18px var(--ui);color:${C.text2}">no formal control</div><span style="font:500 14px var(--ui2);color:${C.muted}">from the video, stop 3</span></div></div>
  <div style="display:flex;gap:14px;align-items:flex-start">${disc(7, picked ? 'navy' : 'idle', 34)}<div style="flex:1"><b style="font:700 18px var(--ui);color:${C.ink}">Gaps</b><div style="margin-top:6px;min-height:52px;border-radius:10px;padding:12px 14px;font:600 18px/1.35 var(--ui);${picked ? `background:${C.correctBg};color:${C.correctHead};border:2px solid ${C.teal}` : `border:2.5px dashed ${C.dash};color:${C.idle};font-weight:400`}">${picked ? 'Unclear how many answers were wrong' : 'Your choice lands here'}</div></div></div></div>`, 'position:absolute;right:64px;top:118px;width:500px')
  + `<div style="position:absolute;left:64px;right:64px;top:${picked ? 400 : 420}px;display:grid;grid-template-columns:1fr 1fr;gap:14px">${[['Staff think wrong answers are rare', ''], ['AI will catch wrong answers later', ''], ['Unclear how many answers were wrong', picked ? 'right' : ''], ['Leave it empty until data exists', '']].map(([l, s]) => ans(l, s)).join('')}</div>`
  + (picked ? `<div style="position:absolute;left:64px;right:64px;top:540px">${bubble('right', 'Correct.', 'Field 7 now tells you what to investigate before Lesson 5, and what not to build on yet.', 'margin-top:0')}</div>` : '')
  + foot(picked ? 'on' : 'off', picked ? 'Next' : 'Next'));
add('ch3', 'S10', 'Decision · Focus · the map card', 'The question is drawn as a piece of the HR map: Field 6 filled, Field 7 an empty slot. The chosen answer drops into the slot, so the learner sees the field being written.', s10(false));
add('ch3', 'S10', 'Decision · correct', 'Right answer tagged, the slot filled in teal, the bubble under the answers.', s10(true));

// S11 metric with a live meter
const s11 = (pick) => {
  const opts = [['HR time on repeats: significant improvement within 3 months', [0, 0, 1]], ['Employees feel HR answers repeat questions faster', [0, 0, 0]], ['HR time on repeats: down to 20% within 3 months', [0, 1, 1]], ['HR time on repeats: ~35% now, 20% in 3 months', [1, 1, 1]]];
  const checks = opts[pick][1];
  const slot = (label, icon, on) => `<div style="display:grid;justify-items:center;gap:8px;padding:14px 8px;border-radius:14px;${on ? `background:${C.correctBg};border:2px solid ${C.teal}` : `background:#fff;border:2px dashed ${C.dash}`}"><span style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:${on ? C.teal : '#F1EFEA'}">${on ? ic('check', 24, '#fff', 3) : ic(icon, 23, C.idle)}</span><b style="font:700 17px var(--ui);color:${on ? C.correctHead : C.muted}">${label}</b></div>`;
  return frame(C.stone, ground('focus', 'ch3') + bar('ch3', 4)
    + `<div style="position:absolute;left:64px;top:110px;width:680px">${kicker('gauge', 'Field 8 · Success metric', false)}<div style="margin-top:10px">${h1('Pick the strongest success metric.', 40)}</div><div style="display:grid;gap:12px;margin-top:22px">${opts.map(([l], i) => ans(l, i === pick ? 'sel' : '', { h: 60 })).join('')}</div></div>`
    + card(`<div style="padding:22px 24px"><div style="display:flex;align-items:center;gap:10px">${ic('search', 24, C.tealInk)}<b style="font:800 21px var(--ui);color:${C.ink}">Checkable later?</b></div><div style="font:400 16px/1.4 var(--ui2);color:${C.muted};margin-top:6px">Three months from now, could someone check it?</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px">${slot('Baseline', 'ruler', checks[0])}${slot('Target', 'flag', checks[1])}${slot('Date', 'calendar', checks[2])}</div>
    <div style="margin-top:16px;font:700 18px var(--ui);color:${checks.every(Boolean) ? C.correctHead : C.text2}">${checks.filter(Boolean).length} of 3 parts</div></div>`, 'position:absolute;right:64px;top:170px;width:390px')
    + foot('off', 'Next').replace(/<span style="display:inline-flex;align-items:center;gap:8px;font:700 18px[^]*?Next<\/span>/, btn('Check', 'check')));
};
add('ch3', 'S11', 'Decision · Focus · a line picked', 'The meter on the right fills as the learner picks: each line lights up the parts it has (here 3 of 3). It teaches the rule before Check, without giving away the verdict.', s11(3));

// S12 risk flag: click-to-flag, clear goal and a counter
const s12map = [['Name', 'Repeat HR questions'], ['Trigger', 'WhatsApp, email, or in person'], ['Steps', 'Receive, check, answer or escalate'], ['Handoffs', 'HR staff to HR manager, beyond policy'], ['Sources', 'Four policies; owner HR manager; INTERNAL'], ['Controls', 'No formal control: staff judgment'], ['Gaps', 'Errors uncounted; no single handoff channel'], ['Metric', '~35% of HR time now, 20% in 3 months']];
const s12 = (flagged) => frame(C.stone, ground('focus', 'ch3') + bar('ch3', 5)
  + `<div style="position:absolute;left:64px;right:64px;top:106px;display:flex;justify-content:space-between;align-items:flex-end;gap:24px"><div><div style="font:500 17px var(--ui2);color:${C.text2}">Your HR map is complete: all eight fields from this chapter.</div><div style="margin-top:6px">${h1('Where could the question get lost?', 38)}</div><div style="font:400 20px/1.4 var(--ui);color:${C.text2};margin-top:8px">Click the <b style="color:${C.ink}">two fields</b> that show the handoff and its risk. Each click places a flag.</div></div>
  <div style="display:flex;align-items:center;gap:12px;background:#fff;border-radius:14px;padding:12px 18px;box-shadow:0 10px 24px rgba(15,42,61,.12);flex:none"><span style="display:flex;gap:6px">${[0, 1].map((i) => `<span style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;${i < flagged.length ? `background:${C.error}` : `border:2px dashed ${C.dash}`}">${ic('flag', 21, i < flagged.length ? '#fff' : C.idle, 2.2)}</span>`).join('')}</span><span style="font:700 18px var(--ui);color:${C.ink}">${flagged.length} of 2 flags</span></div></div>`
  + `<div style="position:absolute;left:64px;right:64px;top:300px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">${s12map.map(([t, x], i) => {
    const on = flagged.includes(i + 1);
    return `<div style="position:relative;background:#fff;border-radius:14px;padding:14px 16px;min-height:118px;${on ? `border:3px solid ${C.error};box-shadow:0 0 0 5px rgba(204,0,0,.12)` : `border:1px solid ${C.line};box-shadow:0 8px 18px rgba(15,42,61,.08)`}">
    <div style="display:flex;align-items:center;gap:10px">${disc(i + 1, 'navy', 30)}<b style="font:800 18px var(--ui);color:${C.ink}">${t}</b>${on ? `<span style="margin-left:auto;width:32px;height:32px;border-radius:50%;background:${C.error};display:grid;place-items:center">${ic('flag', 17, '#fff', 2.2)}</span>` : ''}</div><div style="font:400 16px/1.4 var(--ui);color:${C.text2};margin-top:8px">${x}</div></div>`;
  }).join('')}</div>`
  + (flagged.length ? '' : handCursor(470, 420)) + foot('off'));
add('ch3', 'S12', 'Flag · Focus · idle', 'Fix for "unclear what to do": the heading asks a plain question, the line under it says exactly what to click and how many, and a counter shows the two flags still to place. No dragging: one click puts a flag on a field, a second click takes it off.', s12([]));
add('ch3', 'S12', 'Flag · one flag placed', 'The flagged field gets a red frame and a flag; the counter shows 1 of 2. Check appears in the bottom row once both flags are placed.', s12([4]));

const s12b = (saved) => frame(C.stone, ground('focus', 'ch3') + bar('ch3', 6)
  + card(`<div style="padding:30px 36px"><div style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;gap:10px;align-items:center">${yourCase()}<span style="font:500 16px var(--ui2);color:${C.muted}">Goes into Field 8 of your workbook in Chapter 6</span></div>${ic('gauge', 30, C.tealInk)}</div>
  <div style="margin-top:12px">${h1('Set one success metric for your case.', 36)}</div><div style="font:400 18px var(--ui);color:${C.text2};margin-top:6px">A rough number is fine. You refine it in Chapter 6.</div>
  <div style="display:grid;grid-template-columns:1.6fr 40px 1fr 40px 1fr;align-items:end;gap:6px;margin-top:22px">${field('Baseline', saved ? 'About 2 days to a summary' : '', { ph: 'Today, e.g. about 2 days to a summary', count: saved ? '25 / 80' : '0 / 80', focus: !saved })}<span style="padding-bottom:40px;display:grid;place-items:center">${ic('arrow', 26, C.navy)}</span>${field('Target', saved ? 'Same day' : '', { ph: 'e.g. same day', count: saved ? '8 / 80' : '0 / 80' })}<span style="padding-bottom:40px;display:grid;place-items:center">${ic('arrow', 26, C.navy)}</span>${field('Date', saved ? 'Within 3 months' : '', { ph: 'e.g. within 3 months', optional: true, count: saved ? '15 / 40' : '0 / 40' })}</div>
  <div style="display:flex;justify-content:flex-end;align-items:center;gap:18px;margin-top:14px">${privacy()}${btn('Save', 'check')}</div>
  ${saved ? bubble('right', 'Saved.', 'It comes back in Chapter 6, ready to refine.') : ''}</div>`, `position:absolute;left:96px;right:96px;top:${saved ? 118 : 150}px`)
  + foot(saved ? 'on' : 'off', saved ? 'Next' : 'Save to continue'));
add('ch3', 'S12B', 'Write · Focus · your case', 'As S02 and S08B: one white card on the wash with a "Your case" tag. Baseline, Target and Date read left to right with arrows, as a metric is read.', s12b(false));
add('ch3', 'S12B', 'Write · saved', 'Saved bubble under the card; Next opens.', s12b(true));

// ===== Chapter 5 · Critical eye =====
add('ch4', 'W4', 'Warm-up · Stage · idle', 'Stage frame again, with this chapter\'s photo turned so the person faces the panel.',
  warmup('ch4', 0, 'Which decision needs clear human judgment, not AI?', '', ['Deciding whether a customer is eligible', 'Summarizing a long request in three lines', 'Tagging a request by its topic'], -1, '', { mirror: true, pos: '65% 50%' }));

// S13 scope line
const s13line = ['Employee sends a question', 'HR staff open the inbox', 'HR staff check the topic', 'Question reaches the HR manager', 'Employee gets an answer'];
const s13icons = ['mail', 'inbox', 'tag', 'users', 'checkc'];
const s13 = (start) => frame(C.stone, ground('focus', 'ch4') + bar('ch4', 1)
  + `<div style="position:absolute;left:64px;right:64px;top:110px">${kicker('scope', 'Process boundaries', false)}<div style="margin-top:10px">${h1(start ? 'Now click where it ends.' : 'Click where the HR process starts.', 40)}</div><div style="font:400 20px var(--ui);color:${C.text2};margin-top:8px">Look for what starts it from outside, and who picks up the result.</div></div>`
  + `<div style="position:absolute;left:64px;right:64px;top:417px;height:6px;border-radius:3px;background:${C.lineStrong}"></div>`
  + `<div style="position:absolute;left:64px;right:64px;top:330px;display:grid;grid-template-columns:repeat(5,1fr);gap:18px">${s13line.map((t, i) => {
    const isStart = start && i === 0;
    return `<div style="display:grid;justify-items:center;gap:12px">
    <div style="height:34px">${isStart ? `<span style="display:inline-flex;align-items:center;gap:6px;font:800 16px var(--ui);color:#fff;background:${C.teal};border-radius:8px;padding:5px 12px">${ic('flag', 17, '#fff', 2.4)}START</span>` : ''}</div>
    <span style="width:84px;height:84px;border-radius:50%;display:grid;place-items:center;background:${isStart ? C.teal : '#fff'};border:${isStart ? 'none' : `2px solid ${C.navy}`};box-shadow:0 8px 18px rgba(15,42,61,.14)">${ic(s13icons[i], 40, isStart ? '#fff' : C.navy)}</span>
    <div style="background:#fff;border-radius:14px;padding:18px 14px;min-height:140px;width:100%;text-align:center;${isStart ? `border:3px solid ${C.teal}` : `border:1px solid ${C.line}`};box-shadow:0 8px 18px rgba(15,42,61,.08)"><span style="font:600 14px var(--ui2);color:${C.muted}">Step ${i + 1}</span><div style="font:700 21px/1.3 var(--ui);color:${C.ink};margin-top:6px">${t}</div></div></div>`;
  }).join('')}</div>`
  + (start ? '' : handCursor(176, 436)) + foot('off'));
add('ch4', 'S13', 'Scope · Focus · idle', 'The five steps sit on one line, like a process, with an icon each. One click marks the start; the heading then changes to "Now click where it ends". Clicking replaces the drag of Start and End chips.', s13(false));
add('ch4', 'S13', 'Scope · start marked', 'The start step turns teal with a START tag. Check comes after the end is marked.', s13(true));

// S14 handoff diagram
const s14 = frame(C.stone, ground('focus', 'ch4') + bar('ch4', 2)
  + `<div style="position:absolute;left:64px;top:108px;width:560px">${kicker('doc', 'Field 4 · Handoffs', false)}<div style="margin-top:10px">${h1('Choose what the map must record at this handoff.', 36)}</div></div>`
  + card(`<div style="padding:18px 22px"><div style="font:600 17px/1.4 var(--ui);color:${C.text2}">A question exceeds policy. It goes to the HR manager, who is away.</div>
  <div style="display:grid;grid-template-columns:1fr 110px 1fr;align-items:center;margin-top:18px;padding-bottom:6px">
  <div style="display:grid;justify-items:center;gap:8px"><span style="width:80px;height:80px;border-radius:50%;background:${C.navy};display:grid;place-items:center">${ic('person', 30, '#fff')}</span><b style="font:700 17px var(--ui);color:${C.ink}">HR staff</b></div>
  <div style="display:grid;justify-items:center;gap:4px">${ic('mail', 28, C.navy)}<svg viewBox="0 0 70 10" style="width:70px"><path d="M0 5h60" stroke="${C.navy}" stroke-width="2.5" stroke-dasharray="5 5"/><path d="M58 0l10 5-10 5z" fill="${C.navy}"/></svg></div>
  <div style="display:grid;justify-items:center;gap:8px;opacity:.55"><span style="position:relative;width:80px;height:80px;border-radius:50%;background:#C9CED2;display:grid;place-items:center">${ic('person', 30, '#fff')}<span style="position:absolute;right:-12px;top:-8px;font:700 14px var(--ui2);color:#fff;background:${C.muted};border-radius:5px;padding:1px 7px">Away</span></span><b style="font:700 17px var(--ui);color:${C.ink}">HR manager</b></div></div></div>`, 'position:absolute;right:64px;top:106px;width:500px')
  + `<div style="position:absolute;left:64px;right:64px;top:352px;display:grid;grid-template-columns:1fr 1fr;gap:16px">${[['A rule naming a backup manager', ''], ['From whom, to whom, what passes, if unavailable', 'right'], ['Nothing: the manager knows the history', ''], ['An AI agent to reroute questions', '']].map(([l, s]) => ans(l, s, { h: 64 })).join('')}</div>`
  + `<div style="position:absolute;left:64px;right:64px;top:520px">${bubble('right', 'Correct.', 'Field 4 records sender, receiver, what passes and the away case; Field 7 records that nobody covers it.', 'margin-top:0')}</div>` + foot('on'));
add('ch4', 'S14', 'Decision · Focus · correct', 'The situation is drawn: the question travels from HR staff to a greyed-out HR manager marked Away. Answers 2 x 2 under it, the bubble under the answers.', s14);

// S15 bottleneck
const s15 = frame(C.stone, ground('focus', 'ch4') + bar('ch4', 3)
  + `<div style="position:absolute;left:64px;top:108px;width:540px">${kicker('learn', 'New case · from your Lesson 1 booklet')}<div style="margin-top:14px">${h1('Course feedback', 40)}</div><div style="font:400 20px/1.45 var(--ui);color:${C.text2};margin-top:8px">One step: the coordinator prints and reads all feedback by hand.</div>
  ${card(`<div style="padding:18px 22px;display:flex;align-items:center;gap:18px"><span style="width:66px;height:66px;border-radius:16px;background:${C.errorBg};display:grid;place-items:center;flex:none">${ic('hourglass', 34, C.errorHead)}</span><div><div style="font:800 40px/1 var(--ui);color:${C.errorHead}">3 to 4 hours</div><div style="font:500 17px var(--ui2);color:${C.muted};margin-top:4px">per course, on one step</div></div></div>
  <div style="border-top:1px solid ${C.line};padding:14px 22px;display:flex;align-items:center;gap:10px">${['Collect', 'Print', 'Read by hand', 'Report'].map((t, i) => `<span style="font:600 15px var(--ui);padding:6px 11px;border-radius:7px;${i === 2 ? `background:${C.errorBg};color:${C.errorHead};border:2px solid ${C.error}` : `background:#F1EFEA;color:${C.text2}`}">${t}</span>${i < 3 ? ic('arrow', 16, C.muted, 2) : ''}`).join('')}</div>`, 'margin-top:20px')}</div>`
  + panel(`<div style="font:800 26px/1.2 var(--ui);color:${C.ink};margin-bottom:16px">Choose the first question to ask about this bottleneck.</div><div style="display:grid;gap:12px">${['Why did this step form, and is it needed?', 'Which AI tool summarizes feedback fastest?', 'How many more coordinators can we hire?'].map((l, i) => ans(l, i === 0 ? 'sel' : '')).join('')}</div><div style="margin-top:auto;display:flex;justify-content:flex-end">${btn('Check', 'check')}</div>`, 'right:44px;top:118px;bottom:84px;width:560px')
  + foot('none'));
add('ch4', 'S15', 'Decision · Focus · picked', 'A new case gets its own face: the 3 to 4 hours as a big number, and the four steps with the slow one marked. The question and answers sit in the ivory panel on the right.', s15);

// K4 key columns
const k4item = (icon, t, s, good) => `<div style="display:flex;gap:16px;align-items:center;padding:17px 18px;border-radius:12px;background:${good ? '#F2F8F7' : '#F6F4F0'}"><span style="width:44px;height:44px;border-radius:50%;flex:none;display:grid;place-items:center;background:${good ? C.teal : '#8A98A2'}">${ic(icon, 22, '#fff', 2.2)}</span><div><b style="font:700 19px var(--ui);color:${C.ink}">${t}</b>${s ? `<div style="font:400 16px var(--ui2);color:${C.muted}">${s}</div>` : ''}</div></div>`;
add('ch4', 'K4', 'Key idea · Focus', 'Like K1: two drawn columns side by side. Good fit in teal with a check, Poor fit in grey with a cross, an icon per kind so the three good fits are easy to recall in S16.',
  frame(C.stone, ground('focus', 'ch4') + bar('ch4', 4)
  + `<div style="position:absolute;left:64px;right:64px;top:108px">${kicker('learn', 'Key idea · Where AI fits')}<div style="margin-top:14px">${h1('Three good fits, and the rest', 44)}</div>${lead('Otherwise, a person decides.', 'margin-top:6px')}</div>`
  + `<div style="position:absolute;left:64px;right:64px;top:286px;display:grid;grid-template-columns:1.15fr 1fr;gap:22px">
  ${card(`<div style="padding:20px 22px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">${ic('checkc', 28, C.tealInk)}<b style="font:800 24px var(--ui);color:${C.tealInk}">Good fit</b></div><div style="display:grid;gap:10px">${k4item('arrows', 'Unstructured to structured', 'text in, data out', true)}${k4item('zap', 'Low-risk decision points', 'reversible, watched', true)}${k4item('users', 'Handoffs with delay or loss', 'AI records what passes', true)}</div></div>`)}
  ${card(`<div style="padding:20px 22px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">${ic('x', 28, C.grey || '#4A5862', 2.4)}<b style="font:800 24px var(--ui);color:#4A5862">Poor fit</b></div><div style="display:grid;gap:10px">${k4item('alert', 'Money or rights at stake', '', false)}${k4item('sort', 'A disorganized process', '', false)}${k4item('help', 'Map says "unclear"', '', false)}</div></div>`)}</div>` + foot('on')));

// S16 sort with good-fit bins
const s16 = frame(C.stone, ground('focus', 'ch4') + bar('ch4', 5)
  + `<div style="position:absolute;left:52px;right:52px;top:108px;display:flex;align-items:flex-start;justify-content:space-between"><div>${kicker('sort', 'What goes in, and what is at stake?', false)}<div style="margin-top:8px">${h1('Drag each card to a good-fit kind, or to Poor fit.', 34)}</div></div>${showMe()}</div>`
  + `<div style="position:absolute;left:600px;top:350px;width:330px;z-index:6;transform:rotate(3deg)"><div style="background:#fff;border:2.5px solid ${C.navy};border-radius:15px;padding:16px 20px;display:flex;gap:13px;align-items:center;box-shadow:0 28px 44px rgba(15,42,61,.32)">${ic('grip', 20, C.neutralLine)}<span style="font:800 22px/1.25 var(--ui);color:${C.ink}">Decide a financial refund</span></div></div><div style="position:absolute;left:50%;top:240px;transform:translateX(-50%);font:500 16px var(--ui2);color:${C.text2}">2 of 6</div>`
  + `<div style="position:absolute;left:52px;right:52px;bottom:84px;display:grid;grid-template-columns:1fr 1fr 1fr 1.6fr;gap:16px">
  ${[['Unstructured to structured', 'arrows'], ['Low-risk decision', 'zap'], ['Handoff delay or loss', 'users']].map(([t, icn], i) => `<div style="border:2.5px dashed ${C.teal};border-radius:16px;padding:16px 18px;min-height:160px;background:rgba(242,248,247,.9)"><span style="width:38px;height:38px;border-radius:50%;background:${C.teal};display:grid;place-items:center">${ic(icn, 20, '#fff', 2.2)}</span><b style="display:block;font:800 19px/1.2 var(--ui);color:${C.tealInk};margin-top:10px">${t}</b>${i === 0 ? placed('Sort incoming messages by topic') : ''}</div>`).join('')}
  <div style="border:2.5px dashed ${C.navy};border-radius:16px;padding:16px 18px;min-height:160px;background:rgba(238,243,246,.96);box-shadow:0 0 0 4px rgba(37,87,119,.15)"><span style="width:38px;height:38px;border-radius:50%;background:#8A98A2;display:grid;place-items:center">${ic('x', 20, '#fff', 2.6)}</span><b style="display:block;font:800 19px var(--ui);color:#4A5862;margin-top:10px">Poor fit</b><div style="font:400 15px var(--ui2);color:${C.muted}">money or rights, disorder, "unclear"</div></div></div>` + foot('off'));
add('ch4', 'S16', 'Sort · while dragging', 'The three good-fit columns carry K4\'s icons in teal; Poor fit is wider and grey. The dragged card stays above the columns, the target column lights up.', s16);

// S17 case file + mistakes
const s17 = frame(C.stone, ground('focus', 'ch4') + bar('ch4', 6)
  + `<div style="position:absolute;left:64px;top:108px;width:470px">${kicker('eye', 'Five mapping mistakes', false)}<div style="margin-top:10px">${h1('Read the case, then pick the mistake it shows.', 34)}</div>
  <div style="position:relative;margin-top:22px"><div style="position:absolute;inset:0;transform:translate(10px,10px) rotate(1.5deg);background:#fff;border-radius:16px;border:1px solid ${C.line}"></div>
  <div style="position:relative;background:#fff;border-radius:16px;border:1px solid ${C.line};box-shadow:0 15px 31px rgba(15,42,61,.14);padding:20px 24px"><div style="display:flex;align-items:center;justify-content:space-between"><span style="display:inline-flex;align-items:center;gap:8px;font:800 17px var(--ui);color:${C.navy}">${ic('file', 21, C.navy)}Case 1 of 5</span><span style="display:flex;gap:6px">${[1, 0, 0, 0, 0].map((d) => `<i style="width:12px;height:12px;border-radius:50%;${d ? `background:${C.navy}` : `border:2px solid ${C.lineStrong}`}"></i>`).join('')}</span></div>
  <div style="font:700 25px/1.35 var(--ui);color:${C.ink};margin-top:14px">Fields 6 and 7 are blank: the map was due within the hour.</div></div></div></div>`
  + `<div style="position:absolute;left:580px;right:64px;top:118px;display:grid;gap:10px">${[['Ideal, not actual', 'maps how it should work, not a normal day', 'eye'], ['No clear goal', 'drawn with no question to answer', 'help'], ['Rushed mapping', 'hard fields skipped to finish fast', 'clock'], ['Not updated', 'the process changed, the map did not', 'calendar'], ['Automating a broken process', 'speeds up a process nobody fixed', 'zap']].map(([l, s, icn], i) => ans(l, i === 2 ? 'right' : '', { sub: s, icon: icn, h: 70 })).join('')}
  ${bubble('right', 'Correct.', 'Controls and gaps hold the findings, so skipping them leaves Lesson 5 nothing to protect against.', 'margin-top:6px')}</div>` + foot('on', 'Next case'));
add('ch4', 'S17', 'Cases · Focus · case 1 correct', 'The case is a file card with a 5-dot progress; the five mistakes are tiles with their own icons, reused later in S20B. One case at a time.', s17);

const s17b = frame(C.stone, ground('focus', 'ch4') + bar('ch4', 7)
  + card(`<div style="padding:28px 36px"><div style="display:flex;gap:10px;align-items:center">${yourCase()}<span style="font:500 16px var(--ui2);color:${C.muted}">Not on your map: Lesson 5 starts from this note</span></div>
  <div style="margin-top:12px">${h1('Name one step that could fit AI and one for a person.', 34)}</div>
  <div style="margin-top:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font:600 16px var(--ui2);color:${C.muted}">Your steps from Chapter 3:</span>${['Rep types notes by hand', 'Manager reads them two days later'].map((t) => `<span style="font:600 16px var(--ui);color:${C.ink};background:#F1EFEA;border-radius:7px;padding:5px 12px">${t}</span>`).join('')}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:20px">
  <div style="border-radius:14px;background:#F2F8F7;padding:16px 18px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="width:38px;height:38px;border-radius:50%;background:${C.teal};display:grid;place-items:center">${ic('spark', 20, '#fff', 2)}</span><b style="font:800 20px var(--ui);color:${C.tealInk}">Could fit AI</b></div>${field('', '', { ph: 'e.g. Sort by topic', count: '0 / 100', focus: true }).replace('<span style="font:700 17px var(--ui);color:#16293A"></span>', '')}</div>
  <div style="border-radius:14px;background:#F6F4F0;padding:16px 18px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="width:38px;height:38px;border-radius:50%;background:${C.navy};display:grid;place-items:center">${ic('person', 20, '#fff', 2)}</span><b style="font:800 20px var(--ui);color:${C.navy}">Stays with a person</b></div>${field('', '', { ph: 'e.g. Approve exceptions', count: '0 / 100' }).replace('<span style="font:700 17px var(--ui);color:#16293A"></span>', '')}</div></div>
  <div style="display:flex;justify-content:flex-end;align-items:center;gap:18px;margin-top:16px">${privacy('No names or identifying details.')}${btn('Save', 'check')}</div></div>`, 'position:absolute;left:96px;right:96px;top:150px')
  + foot('off', 'Save to continue'));
add('ch4', 'S17B', 'Write · Focus · your case', 'Two coloured halves: teal for AI (spark icon), navy for a person. The learner\'s own steps from Chapter 3 sit on top as chips to choose from.', s17b);

// ===== Chapter 6 · Build yours =====
const s18a = frame(C.stone, ground('focus', 'ch5') + bar('ch5', 0)
  + `<div style="position:absolute;left:64px;right:64px;top:106px;display:flex;justify-content:space-between;align-items:flex-end"><div>${kicker('arrows', 'Same eight fields, different case', false)}<div style="margin-top:8px">${h1('Choose the card for each field.', 38)}</div></div><span style="display:inline-flex;align-items:center;gap:8px;font:700 16px var(--ui);color:${C.tealInk};background:${C.keypill};border-radius:20px;padding:6px 14px">${ic('learn', 19, C.tealInk)}Lesson 1 case: sales call summaries</span></div>`
  + `<div style="position:absolute;left:64px;top:236px;width:420px;display:grid;gap:12px">${[['A', 'Unclear whether reps see a problem', 1], ['B', 'A sales call ends', 1], ['C', 'An AI tool drafts each call summary', 0], ['D', 'The rep updates the CRM, often late', 0]].map(([l, t, used]) => `<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:12px;background:#fff;border:1px solid ${C.cardLine};box-shadow:0 8px 16px rgba(15,42,61,.08);${used ? 'opacity:.45' : ''}"><span style="width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font:800 17px var(--ui);color:#fff;background:${C.navy}">${l}</span><span style="font:600 19px/1.3 var(--ui);color:${C.body}">${t}</span></div>`).join('')}</div>`
  + `<div style="position:absolute;left:520px;right:64px;top:236px;display:grid;gap:12px">${[[2, 'Field 2: Trigger', 'What starts it', 'B · A sales call ends'], [3, 'Field 3: Steps', 'Who does what', ''], [7, 'Field 7: Gaps', 'What is missing or unclear', 'A · Unclear whether reps see a problem'], ['–', 'Not AS-IS', 'Not true today', '']].map(([n, t, s, v]) => `<div style="display:grid;grid-template-columns:44px 1fr 1.25fr;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;background:#fff;border:1px solid ${C.line}">${n === '–' ? `<span style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#F1EFEA">${ic('x', 17, C.muted, 2.6)}</span>` : disc(n, 'navy', 34)}<div><b style="font:700 18px var(--ui);color:${C.ink}">${t}</b><div style="font:400 15px var(--ui2);color:${C.muted}">${s}</div></div><div style="min-height:48px;border-radius:10px;padding:11px 14px;font:600 16px/1.3 var(--ui);${v ? `background:#EEF3F6;color:${C.navy};border:2px solid ${C.navy}` : `border:2.5px dashed ${C.dash};color:${C.idle};font-weight:400`}">${v || 'Choose a card'}</div></div>`).join('')}</div>`
  + `<div style="position:absolute;right:64px;bottom:84px">${btn('Check', 'check').replace(C.tealInk, C.neutralLine)}</div>` + foot('none'));
add('ch5', 'S18A', 'Match · Focus · two placed', 'Cards on the left, the four fields on the right with an empty slot each. A used card fades. Check stays grey until all four slots are filled.', s18a);

add('ch5', 'S18', 'Decision · Stage', 'Stage with this chapter\'s photo (someone working on their own map). The coach line sits on glass with the robot, the choice in the panel.',
  frame('#0F2A3D', ground('stage', 'ch5', { mirror: true, pos: '35% 50%' }) + bar('ch5', 1)
  + glass(`<div style="display:flex;align-items:center;gap:12px">${ic('robot', 32, C.turq)}<span style="font:700 18px var(--ui);color:#fff">Before you start</span></div><div style="font:800 33px/1.2 var(--ui);color:#fff;margin-top:14px">The workbook has a live AI coach that reads what you type.</div>`, 'left:44px;bottom:96px;width:500px')
  + panel(`<div style="font:800 28px/1.15 var(--ui);color:${C.ink};margin-bottom:17px">Choose what you write in the workbook.</div><div style="display:grid;gap:12px">${[['Your real map, with names and policy titles', 'wrong'], ['Roles instead of names, no identifying details', ''], ['Your real map, with Field 5 left empty', '']].map(([l, s]) => ans(l, s)).join('')}</div>${bubble('wrong', 'Not quite.', 'Names and internal policy now sit in an AI tool. Personal, employee or financial details are CONFIDENTIAL: keep them out.')}`, 'right:31px;top:118px;width:590px')
  + foot('off')));

const s18b = frame(C.stone, ground('focus', 'ch5') + bar('ch5', 2)
  + card(`<div style="padding:30px 38px;display:grid;grid-template-columns:120px 1fr;gap:28px;align-items:start"><span style="width:110px;height:110px;border-radius:24px;background:${C.keypill};display:grid;place-items:center">${ic('shield', 58, C.tealInk, 1.6)}</span><div>
  <div style="display:flex;gap:10px;align-items:center">${yourCase()}<span style="font:500 16px var(--ui2);color:${C.muted}">From the start of the lesson</span></div><div style="margin-top:10px">${h1('Check your case title, then save it.', 36)}</div><div style="font:400 18px var(--ui);color:${C.text2};margin-top:6px">A general name, e.g. Sales call summaries. No client or person names.</div>
  <div style="margin-top:18px;width:520px">${field('Case title, generalized', 'Sales call summaries', { count: '20 / 60', focus: true })}</div>
  <div style="display:flex;align-items:center;gap:12px;margin-top:14px;font:600 18px var(--ui);color:${C.ink}"><span style="width:28px;height:28px;border-radius:7px;background:${C.navy};display:grid;place-items:center">${ic('check', 18, '#fff', 3)}</span>I removed names and identifying details from my notes.</div>
  <div style="display:flex;justify-content:flex-end;align-items:center;gap:18px;margin-top:10px">${btn('Save', 'check')}</div></div></div>`, 'position:absolute;left:96px;right:96px;top:172px')
  + foot('off', 'Save to continue'));
add('ch5', 'S18B', 'Write · Focus · ready to save', 'A privacy screen with a privacy face: the shield as the card\'s icon, the title field and the tick box together.', s18b);

add('ch5', 'S19A', 'Handoff · Focus · brief', 'The workbook appears in a laptop frame so it reads as a real place to go to; the three steps beside it as a numbered path.',
  frame(C.stone, ground('focus', 'ch5') + bar('ch5', 3)
  + `<div style="position:absolute;left:64px;top:118px;width:470px"><div style="display:flex;align-items:center;gap:12px">${kicker('map', 'Your workbook')}<span style="display:inline-flex;align-items:center;gap:6px;font:600 15px var(--ui2);color:${C.text2};background:#fff;border-radius:16px;padding:5px 12px">${ic('clock', 17, C.text2)}About 40 min</span></div><div style="margin-top:14px">${h1('What you will do now', 44)}</div>${lead('The workbook holds your own process map. Lesson 5 starts from it.', 'margin-top:8px')}
  <div style="display:grid;gap:0;margin-top:22px">${['Fill eight fields as the process runs today', 'Keep AI ideas off the map', 'Export your PDF'].map((t, i) => `<div style="display:flex;gap:16px;align-items:flex-start"><div style="display:grid;justify-items:center">${disc(i + 1, 'navy', 40)}${i < 2 ? `<i style="width:3px;height:26px;background:${C.lineStrong}"></i>` : ''}</div><span style="font:700 20px/1.3 var(--ui);color:${C.ink};padding-top:7px">${t}</span></div>`).join('')}</div></div>`
  + `<div style="position:absolute;left:580px;right:52px;top:150px"><div style="background:#1D2B35;border-radius:18px 18px 0 0;padding:14px 14px 0"><div style="height:340px;border-radius:6px 6px 0 0;background:url(img/s19a-workbook.jpg) 50% 0/cover no-repeat"></div></div><div style="height:20px;background:#C9CED2;border-radius:0 0 22px 22px;margin:0 -28px;box-shadow:0 22px 40px rgba(15,42,61,.25)"></div></div>` + foot('on')));

add('ch5', 'S19B', 'Handoff · Focus · open the workbook', 'One clear action: the big Open workbook button. Under it, the eight fields as a strip, with the four your notes fill (1, 2, 3, 8) marked, and the three copy cards.',
  frame(C.stone, ground('focus', 'ch5') + bar('ch5', 3)
  + `<div style="position:absolute;left:64px;right:64px;top:108px;display:flex;justify-content:space-between;align-items:center"><div>${h1('Open the workbook and map your case.', 40)}<div style="font:400 19px var(--ui);color:${C.text2};margin-top:6px">Unknown? Write 'unclear'. It is a valid answer.</div></div><span style="display:inline-flex;align-items:center;gap:12px;font:800 22px var(--ui);color:#fff;background:${C.navy};padding:16px 28px;border-radius:12px;box-shadow:0 12px 26px rgba(37,87,119,.35)">Open workbook${ic('ext', 22, '#fff', 2.2)}</span></div>`
  + card(`<div style="padding:16px 20px"><div style="font:700 16px var(--ui2);color:${C.muted};margin-bottom:10px">The workbook's eight fields</div><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px">${['Process name', 'Trigger', 'Steps and role owners', 'Handoffs', 'Sources, owners, sensitivity', 'Existing controls', 'Gaps and unclear points', 'Success metric'].map((t, i) => { const mine = [0, 1, 2, 7].includes(i); return `<div style="border-radius:10px;padding:12px;min-height:124px;${mine ? `background:${C.correctBg};border:2px solid ${C.teal}` : `background:#F6F4F0;border:1px solid ${C.line}`}">${disc(i + 1, mine ? 'navy' : 'idle', 26)}<div style="font:600 16px/1.25 var(--ui);color:${C.ink};margin-top:8px">${t}</div></div>`; }).join('')}</div><div style="font:500 15px var(--ui2);color:${C.tealInk};margin-top:8px">Your notes fill the four marked fields.</div></div>`, 'position:absolute;left:64px;right:64px;top:250px')
  + `<div style="position:absolute;left:64px;right:64px;top:486px"><div style="font:700 17px var(--ui);color:${C.ink};margin-bottom:10px">Copy into the workbook</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${[['Field 1', 'Case title: Sales call summaries'], ['Fields 2 and 3', 'Trigger: A rep finishes a sales call'], ['Field 8', 'Baseline: About 2 days']].map(([c, t]) => `<div style="display:flex;align-items:center;gap:12px;background:#fff;border-radius:12px;padding:16px 16px;border:1px solid ${C.line};box-shadow:0 8px 16px rgba(15,42,61,.08)"><div style="flex:1"><span style="font:700 14px var(--ui2);color:${C.tealInk};background:${C.keypill};border-radius:5px;padding:2px 8px">${c}</span><div style="font:500 16px/1.3 var(--ui);color:${C.text2};margin-top:6px">${t}</div></div><span style="font:700 15px var(--ui);color:${C.navy};border:2px solid ${C.navy};border-radius:8px;padding:5px 12px">Copy</span></div>`).join('')}</div></div>`
  + foot('off')));

add('ch5', 'S19C', 'Handoff · Stage · back', 'Welcome back on Stage: the chapter photo (someone at their laptop) and a short check-in panel with a PDF badge and two large answers.',
  frame('#0F2A3D', ground('stage', 'ch5', { mirror: true, pos: '35% 50%' }) + bar('ch5', 3)
  + glass(`<div style="display:flex;align-items:center;gap:12px">${ic('map', 28, C.turq)}<span style="font:700 18px var(--ui);color:#fff">Your workbook</span></div><div style="font:800 33px/1.2 var(--ui);color:#fff;margin-top:12px">Welcome back.</div><div style="font:500 18px/1.45 var(--ui);color:${C.glassText};margin-top:8px">The export is in the workbook's Mission report, its last step.</div>`, 'left:44px;bottom:96px;width:470px')
  + panel(`<div style="display:grid;justify-items:center;text-align:center;padding:16px 0"><span style="width:104px;height:104px;border-radius:24px;background:${C.keypill};display:grid;place-items:center">${ic('pdf', 56, C.tealInk, 1.6)}</span><div style="margin-top:20px">${h1('Did you export your PDF?', 40)}</div><div style="font:400 19px var(--ui);color:${C.text2};margin-top:8px">Lesson 5 starts from it.</div>
  <div style="display:flex;gap:16px;margin-top:28px"><span style="display:inline-flex;align-items:center;gap:10px;font:800 20px var(--ui);color:#fff;background:${C.navy};padding:14px 44px;border-radius:11px">${ic('check', 22, '#fff', 3)}Yes</span><span style="font:700 20px var(--ui);color:${C.navy};background:#fff;border:2px solid ${C.navy};padding:12px 36px;border-radius:11px">Not yet</span></div></div>`, 'right:31px;top:150px;width:560px')
  + foot('off')));
add('ch5', 'S20', 'Self-check · Focus · answering', 'A PDF beside three questions, each with its own icon and a Yes / Not yet switch. "Not yet" opens one line of what to fix.',
  frame(C.stone, ground('focus', 'ch5') + bar('ch5', 4)
  + `<div style="position:absolute;left:64px;top:150px;width:300px"><div style="background:#fff;border-radius:10px;box-shadow:0 18px 34px rgba(15,42,61,.18);padding:18px;transform:rotate(-2deg)"><div style="display:flex;align-items:center;gap:8px">${ic('pdf', 24, C.errorHead)}<b style="font:700 15px var(--ui);color:${C.ink}">my-process-map.pdf</b></div>${[90, 70, 84, 60, 78, 66, 88, 54, 72, 80, 58].map((w) => `<i style="display:block;height:8px;border-radius:4px;background:#ECE9E3;margin-top:12px;width:${w}%"></i>`).join('')}</div><div style="font:600 17px var(--ui);color:${C.text2};margin-top:22px;text-align:center">Keep your PDF open.</div></div>`
  + `<div style="position:absolute;left:420px;right:64px;top:118px"><div style="display:flex;justify-content:space-between;align-items:baseline">${h1('Check your map against three questions.', 34)}<span style="display:inline-flex;align-items:center;gap:6px;font:700 16px var(--ui);color:${C.navy}">Reopen workbook${ic('arrow', 17, C.navy, 2.2)}</span></div>
  <div style="display:grid;gap:16px;margin-top:26px">${[['person', 'Does every step name who does it?', 'yes'], ['clock', 'Does Field 4 cover an unavailable receiver?', 'not'], ['ruler', 'Can a number show the metric improved?', '']].map(([icn, q, a]) => `<div style="background:#fff;border-radius:14px;border:1px solid ${C.line};padding:20px 20px;box-shadow:0 8px 16px rgba(15,42,61,.08)"><div style="display:flex;align-items:center;gap:14px"><span style="width:48px;height:44px;border-radius:50%;background:#EEF3F6;display:grid;place-items:center;flex:none">${ic(icn, 22, C.navy)}</span><span style="flex:1;font:700 21px/1.3 var(--ui);color:${C.ink}">${q}</span><span style="display:flex;border:2px solid ${C.navy};border-radius:9px;overflow:hidden"><span style="font:700 16px var(--ui);padding:7px 18px;${a === 'yes' ? `background:${C.navy};color:#fff` : `color:${C.navy}`}">Yes</span><span style="font:700 16px var(--ui);padding:7px 16px;border-left:2px solid ${C.navy};${a === 'not' ? `background:${C.navy};color:#fff` : `color:${C.navy}`}">Not yet</span></span></div>${a === 'not' ? `<div style="margin:12px 0 0 58px;padding:10px 14px;border-radius:10px;background:${C.neutralBg};font:400 17px/1.4 var(--ui);color:${C.fb}"><b>Fix it in the workbook and export again.</b> A handoff with no plan stalls. Add what happens, or record it as a gap.</div>` : ''}</div>`).join('')}</div></div>` + foot('off')));

add('ch5', 'S20B', 'Reflect · Focus · picked', 'The same five mistake tiles and icons as S17, so the learner recognises them. The "before Lesson 5" line becomes a three-item checklist.',
  frame(C.stone, ground('focus', 'ch5') + bar('ch5', 4)
  + `<div style="position:absolute;left:64px;right:64px;top:108px">${kicker('eye', 'The five mistakes from Chapter 5 · any pick is fine', false)}<div style="margin-top:8px">${h1('Which mistake is your map most at risk of?', 38)}</div></div>`
  + `<div style="position:absolute;left:64px;right:64px;top:250px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px">${[['Ideal, not actual', 'maps how it should work', 'eye'], ['No clear goal', 'no question to answer', 'help'], ['Rushed mapping', 'hard fields skipped', 'clock'], ['Not updated', 'the process changed', 'calendar'], ['Automating a broken process', 'speeds up what nobody fixed', 'zap']].map(([t, s, icn], i) => `<div style="background:#fff;border-radius:14px;padding:20px 18px;min-height:196px;${i === 2 ? `border:3px solid ${C.navy};box-shadow:0 14px 28px rgba(15,42,61,.16)` : `border:1px solid ${C.line}`}"><span style="width:44px;height:44px;border-radius:12px;background:${i === 2 ? C.navy : C.keypill};display:grid;place-items:center">${ic(icn, 23, i === 2 ? '#fff' : C.tealInk)}</span><b style="display:block;font:800 20px/1.25 var(--ui);color:${C.ink};margin-top:14px">${t}</b><div style="font:400 16px/1.35 var(--ui2);color:${C.muted};margin-top:4px">${s}</div></div>`).join('')}</div>`
  + `<div style="position:absolute;left:64px;right:64px;top:474px">${bubble('neutral', 'In your workbook:', 'reopen Fields 6 and 7, the ones skipped first.', 'margin-top:0;margin-left:0')}</div>`
  + `<div style="position:absolute;left:64px;right:64px;top:588px;display:flex;align-items:center;gap:22px;font:600 17px var(--ui);color:${C.ink}"><span style="font:700 16px var(--ui2);color:${C.muted}">Before Lesson 5</span>${['Every field filled', 'Metric measurable', 'No invented answers'].map((t) => `<span style="display:inline-flex;align-items:center;gap:8px">${ic('checkc', 22, C.tealInk)}${t}</span>`).join('')}</div>` + foot('on')));

// ===== Chapter 7 · Wrap-up =====
add('ch6', 'S21', 'Knowledge check · Focus · question 1', 'The question is the heading, as approved for the check. Six dots show the progress; A to D answers 2 x 2. No feedback until the end.',
  frame(C.stone, ground('focus', 'ch6') + bar('ch6', 0)
  + `<div style="position:absolute;left:64px;right:64px;top:110px"><div style="display:flex;justify-content:space-between;align-items:center"><span style="display:inline-flex;align-items:center;gap:9px;font:700 17px var(--ui);color:${C.tealInk}">${ic('checkc', 22, C.tealInk)}Knowledge check · Question 1 of 6</span><span style="display:flex;gap:8px">${[1, 0, 0, 0, 0, 0].map((d) => `<i style="width:34px;height:7px;border-radius:4px;background:${d ? C.navy : 'rgba(22,41,58,.15)'}"></i>`).join('')}</span></div>
  <div style="margin-top:22px;display:flex;gap:16px;align-items:flex-start"><span style="width:52px;height:52px;border-radius:14px;background:#fff;display:grid;place-items:center;flex:none;box-shadow:0 8px 16px rgba(15,42,61,.1)">${ic('speech', 26, C.navy)}</span><div><div style="font:500 18px var(--ui2);color:${C.text2}">Lesson 1 case: customer service</div>${h1('Field 4 says "Rep to department." What is missing?', 38, 'margin-top:4px')}</div></div></div>`
  + `<div style="position:absolute;left:64px;right:64px;top:352px;display:grid;grid-template-columns:1fr 1fr;gap:16px">${[['A', 'A rule that reps must route correctly'], ['B', 'The AI tool that will route requests'], ['C', 'What passes, and what if nobody is available'], ['D', 'Nothing more: the department sees the request']].map(([l, t], i) => ans(t, i === 2 ? 'sel' : '', { letter: l, h: 82, extra: i === 2 ? `border:3px solid ${C.navy}` : '' })).join('')}</div>`
  + `<div style="position:absolute;right:64px;top:560px">${btn('Next question', 'check')}</div>` + foot('none')));

const ring = (p) => { const r = 70, cdash = 2 * Math.PI * r; return `<svg viewBox="0 0 170 170" style="width:170px;height:170px"><circle cx="85" cy="85" r="${r}" fill="none" stroke="#ECE9E3" stroke-width="14"/><circle cx="85" cy="85" r="${r}" fill="none" stroke="${C.teal}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${cdash * p / 100} ${cdash}" transform="rotate(-90 85 85)"/><text x="85" y="96" text-anchor="middle" style="font:800 40px var(--ui);fill:${C.ink}">${p}</text></svg>`; };
add('ch6', 'S21R', 'Result · Focus · passed with one miss', 'The score ring on its own card; missed items as rows with a "Review" link to the chapter that teaches them. Retake sits under the list.',
  frame(C.stone, ground('focus', 'ch6') + bar('ch6', 1)
  + card(`<div style="padding:30px;display:grid;justify-items:center;text-align:center">${ring(83)}<span style="margin-top:14px;display:inline-flex;align-items:center;gap:7px;font:700 16px var(--ui);color:${C.correctHead};background:${C.correctBg};border-radius:16px;padding:5px 14px">${ic('check', 17, C.correctHead, 3)}Passed</span><div style="font:600 18px/1.4 var(--ui);color:${C.text2};margin-top:12px">You can map a process and judge where AI fits.</div></div>`, 'position:absolute;left:64px;top:140px;width:340px;padding:12px 0')
  + `<div style="position:absolute;left:446px;right:64px;top:118px">${h1('5 of 6 right (83 of 100). Pass mark: 80.', 34)}<div style="font:700 17px var(--ui);color:${C.ink};margin-top:30px">Worth a second look</div>
  <div style="display:grid;gap:10px;margin-top:10px">${[['Field 7 unknowns', "Why 'unclear' is valid", 'Review Chapter 4']].map(([a, b, c]) => `<div style="display:flex;align-items:center;gap:14px;background:#fff;border-radius:12px;border:1px solid ${C.line};padding:18px 18px"><span style="width:42px;height:42px;border-radius:50%;background:${C.errorBg};display:grid;place-items:center">${ic('x', 18, C.errorHead, 2.6)}</span><div style="flex:1"><b style="font:700 18px var(--ui);color:${C.ink}">${a}</b><div style="font:400 15px var(--ui2);color:${C.muted}">${b}</div></div><span style="display:inline-flex;align-items:center;gap:6px;font:700 16px var(--ui);color:${C.navy}">${c}${ic('arrow', 17, C.navy, 2.2)}</span></div>`).join('')}
  <div style="font:700 17px var(--ui);color:${C.ink};margin-top:14px">Right</div><div style="display:flex;flex-wrap:wrap;gap:10px">${['Handoff parts', 'Good fits for AI', 'Baseline, target, date', 'Source owners', 'The HR map'].map((x) => `<span style="display:inline-flex;align-items:center;gap:8px;font:600 17px var(--ui);color:${C.correctHead};background:rgba(255,255,255,.85);border-radius:20px;padding:7px 14px">${ic('check', 17, C.tealInk, 3)}${x}</span>`).join('')}</div></div>
  <div style="margin-top:26px">${btn('Retake the check', 'ghost')}</div></div>` + foot('on')));

add('ch6', 'S22', 'Reflect · Stage · a takeaway picked', 'The closing screen goes back to Stage: the chapter photo (a full map on the wall) with three takeaway tiles, each with its icon.',
  frame('#0F2A3D', ground('stage', 'ch6', { pos: '30% 50%' }) + bar('ch6', 2)
  + panel(`<div style="font:500 17px var(--ui2);color:${C.muted}">What your map proves</div><div style="font:800 30px/1.15 var(--ui);color:${C.ink};margin:6px 0 18px">Pick the takeaway your map proves most.</div><div style="display:grid;gap:12px">${[['Mapping is a condition, not bureaucracy', 'key'], ["'Unclear' is a legitimate answer", 'help'], ['Not every bottleneck needs acceleration', 'scissors']].map(([l, icn], i) => ans(l, i === 1 ? 'sel' : '', { icon: icn, h: 66, extra: i === 1 ? `border:3px solid ${C.navy}` : '' })).join('')}</div>${bubble('neutral', 'A diagnostic result.', 'Not a failure of the mapper. Your Field 7 lists what to investigate first.')}`, 'right:31px;top:118px;width:600px')
  + foot('on')));

add('ch6', 'END', 'End · Stage, dark', 'The one dark screen at the end, mirroring O1: the lesson closes where it opened.',
  frame('#0B1E2A', `<div class="push" style="position:absolute;inset:0;background:url(img/o1-lanes-office.jpg) 60% 50%/cover no-repeat"></div><div style="position:absolute;inset:0;background:rgba(8,20,30,.62)"></div>
  <div style="position:absolute;left:64px;top:56px"><span class="logo" role="img" aria-label="Wawiwa" style="width:115px"></span></div>
  <div style="position:absolute;left:64px;bottom:96px;width:760px"><div style="font:600 17px var(--ui2);color:${C.aqua};letter-spacing:.06em">Process Modeling and Workflow Mapping · Module 1 · Lesson 4</div><div style="font:800 70px/1.02 var(--ui);color:#fff;letter-spacing:-2px;margin-top:14px">Lesson complete</div>
  <span style="display:inline-flex;align-items:center;gap:8px;margin-top:20px;font:700 17px var(--ui);color:#0B1E2A;background:${C.turq};border-radius:18px;padding:5px 16px">${ic('check', 18, '#0B1E2A', 3)}Passed</span>
  <div style="display:flex;gap:14px;align-items:flex-start;margin-top:24px">${quoteMark(30)}<span style="font:600 25px/1.35 var(--ui);color:${C.glassText}">Next: Lesson 5 in class. Bring your map PDF.</span></div>
  <div style="margin-top:28px;display:flex;gap:14px"><span style="display:inline-flex;align-items:center;gap:10px;background:#fff;color:${C.navy};font:700 19px var(--ui);padding:13px 26px;border-radius:9px">Open homework${ic('ext', 19, C.navy, 2.2)}</span></div></div>` + foot('none').replace(/background:#fff;border:1px solid #CFC8BB/, 'background:rgba(255,255,255,.9);border:1px solid #CFC8BB')));

// ---------- page ----------
const toCqw = (html) => html.replace(/(-?\d*\.?\d+)px/g, (_, n) => `${+(n / 12.8).toFixed(3)}cqw`);
const CHT = { ch3: 'Chapter 4 · HR demo', ch4: 'Chapter 5 · Critical eye', ch5: 'Chapter 6 · Build yours', ch6: 'Chapter 7 · Wrap-up' };
let body = '';
for (const ch of Object.keys(CHT)) {
  const items = S.filter((s) => s.chapter === ch);
  body += `<section class="ch" id="${ch}"><h2>${CHT[ch]}</h2><p class="sub">Chapter photo: ${CH[ch].photo}. Steps: ${CH[ch].steps.map((s) => s[0]).join(' · ')}.</p><div class="grid">`
    + items.map((s) => `<figure class="it" id="${s.id}-${items.indexOf(s)}"><figcaption><b>${s.id}</b><span>${s.caption}</span></figcaption><div class="fit"><div class="frame">${toCqw(s.html)}</div></div><p class="cap">${s.note}</p></figure>`).join('')
    + '</div></section>';
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>L4 Screens Ch3–Wrap-up</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap">
<style>
:root{color-scheme:light;--navy:#255777;--ink:#16293A;--page:#F5F7F8;--bar:#FFFFFF;--line:#DCE3E7;--muted:#4D5D68;--ui:"Assistant",Arial,sans-serif;--ui2:"Roboto",Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--page);color:var(--ink);font-family:var(--ui);font-size:16px;line-height:1.6}
.logo{display:inline-block;aspect-ratio:271/102;background:url(img/wawiwa-logo.png) center/contain no-repeat}
.scr{container-type:inline-size;aspect-ratio:16/9;width:100%;position:relative;overflow:hidden;border-radius:10px;border:1px solid var(--line);font-family:var(--ui);line-height:1.6;color:#111A20}
.scr *{box-sizing:border-box}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--navy:#8CC3E0;--ink:#E8EEF2;--page:#10171D;--bar:#18222A;--line:#2A3640;--muted:#A9B6C0}}
:root[data-theme="dark"]{color-scheme:dark;--navy:#8CC3E0;--ink:#E8EEF2;--page:#10171D;--bar:#18222A;--line:#2A3640;--muted:#A9B6C0}
@media (prefers-reduced-motion:no-preference){.push{animation:push 1.4s cubic-bezier(.2,.7,.2,1) both}}
@keyframes push{from{transform:scale(1.06)}to{transform:none}}
.wrap{max-width:1180px;margin:0 auto;padding:0 16px}
.top{position:sticky;top:0;z-index:5;background:var(--bar);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding-block:12px 6px}
.ttl h1{font:800 22px/1.2 var(--ui);color:var(--navy);margin:0}.ttl p{margin:0;font:400 14px var(--ui2);color:var(--muted)}
.view{margin-left:auto;display:flex;gap:6px}
.view button{font:600 15px var(--ui);border:1px solid var(--line);background:var(--bar);color:var(--navy);border-radius:8px;padding:9px 16px;cursor:pointer;min-height:44px}
.view button[aria-pressed="true"]{background:var(--navy);color:var(--page);border-color:var(--navy)}
.nav{display:flex;gap:18px;flex-wrap:wrap;padding-block:0 10px;font:600 15px var(--ui)}.nav a{color:var(--navy)}
.intro{padding:22px 0 0;max-width:90ch;color:var(--muted);font-size:15px}.intro b{color:var(--ink)}
.ch{padding-block:28px 8px}.ch h2{font:800 32px/1.1 var(--ui);color:var(--navy);margin:0;letter-spacing:-.5px}
.sub{margin:4px 0 18px;color:var(--muted);font-size:15px}
.grid{display:grid;gap:34px}.it{margin:0;min-width:0}
.it figcaption{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;margin-bottom:8px;font:400 14px var(--ui2);color:var(--muted)}
.it figcaption b{font:800 18px var(--ui);color:var(--ink)}
.fit{overflow-x:auto}.frame{width:100%}body.full .wrap{max-width:none}body.full .frame{width:1280px}
.cap{font:400 15px/1.5 var(--ui2);color:var(--muted);margin:8px 0 0;max-width:90ch}
</style></head><body>
<header class="top"><div class="wrap"><span class="logo" role="img" aria-label="Wawiwa" style="width:96px"></span><div class="ttl"><h1>L4 screens · Chapters 4 to 7</h1><p>The continuation of "L4 Screens Intro to Ch2", in the same parts. Each frame renders at 1280×720 in the 100% view.</p></div>
<div class="view" role="group" aria-label="View"><button id="v-fit" aria-pressed="true">Fit</button><button id="v-full" aria-pressed="false">100%</button></div></div>
<nav class="wrap nav">${Object.entries(CHT).map(([k, v]) => `<a href="#${k}">${v}</a>`).join('')}</nav></header>
<main class="wrap"><p class="intro"><b>What carries over from the Intro to Ch2 board:</b> the photo on every screen (sharp on Stage, a soft wash on Focus), white cards floating on it, the heading as the instruction, the step bar, Show me and the hand. <b>What carries over from the 8 Nov decisions:</b> the translucent dark bar, the feedback bubble under the answers, the "Your answer" and "Right answer" tags, select then Check. <b>Fixes in this round:</b> the dragged card stays above the columns (S09, S16), Risk flag says plainly what to click (S12), and S13 marks start and end by clicking.</p>${body}</main>
<script>const f=document.getElementById('v-fit'),u=document.getElementById('v-full');function set(full){document.body.classList.toggle('full',full);f.setAttribute('aria-pressed',String(!full));u.setAttribute('aria-pressed',String(full));}f.onclick=()=>set(false);u.onclick=()=>set(true);</script>
</body></html>`;
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log(S.length + ' frames');
