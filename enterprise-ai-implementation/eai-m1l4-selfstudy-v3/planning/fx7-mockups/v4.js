// FX7 round 3: the original "Hybrid cinematic" look, rearranged. The photo is full-bleed and keeps
// its own zone (nothing on it but the translucent bar); the work sits in one cream panel docked on
// the right; feedback rises from the panel's bottom like Duolingo's, the answers stay visible above.
// Planning only. Learner text from content/l4-slice.json (S01, S03).
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  decide: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  user: '<path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M18 16v.01"/><path d="M18 13a2 2 0 0 1 .5 3.9"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const IMG = '../../assets/img/';

function bar(ch, name, steps, cur) {
  const s = steps.map(([label, icon], i) => {
    const st = i < cur ? 'done' : i === cur ? 'cur' : 'todo';
    return `<li class="${st}"><span class="d">${ic(i < cur ? 'check' : icon)}</span><span class="l">${label}</span></li>`;
  }).join('<li class="cn" aria-hidden="true"></li>');
  return `<div class="v3-bar"><img class="logo" src="../../assets/logo/wawiwa-logo.png" alt="Wawiwa"><span class="dv"></span>
    <button class="burger" aria-label="Chapters">${ic('menu')}</button>
    <div class="chap"><span>Chapter ${ch} of 7</span><b>${name}</b></div><ol class="v3-steps">${s}</ol></div>`;
}
const INTRO = [['Start', 'flag'], ['Overview', 'map'], ['Goals', 'target'], ['Decide', 'decide'], ['Write', 'pencil']];
const WHYMAP = [['Guess', 'bulb'], ['Watch', 'play'], ['Learn', 'book'], ['Decide', 'decide']];

// round 4: the feedback is a card right under the answers (where the eye is), not stuck to the bottom;
// Check turns into Next in the same place.
// round 6 (Noy: the light card still looks like an answer): a message, not a row. The verdict is its
// own heading line and the why sits under it; a notch points up at the answers; no border.
const fb = (kind, verdict, why) => `<div class="v4-fb ${kind}" role="status"><p class="fb-v"><span class="vi">${ic(kind === 'right' ? 'check' : 'x')}</span><b>${verdict}</b></p><p class="fb-w">${why}</p></div>`;
const NEXT = `<button class="v3-next pulse">Next ${ic('right')}</button>`;
const bottom = (btn) => `<div class="v3-bottom"><button class="v3-prev">${ic('left')}Previous</button>${btn}</div>`;

/* ---------- S01 ---------- */
const S01_OPTS = [['a', 'Shortlist three chatbot vendors'], ['b', 'Map how a request flows today'], ['c', 'Survey employees on what they want']];
function s01(after) {
  const opts = S01_OPTS.map(([id, label]) => {
    const st = !after ? '' : id === 'a' ? 'wrong' : id === 'b' ? 'right' : 'dim';
    const tag = st === 'wrong' ? `<em>Your answer</em>` : st === 'right' ? `<em>Right answer</em>` : '';
    const mark = st === 'wrong' ? `<span class="rd fill">${ic('x')}</span>` : st === 'right' ? `<span class="rd fill">${ic('check')}</span>` : '<span class="rd"></span>';
    return `<button class="v3-opt ${st}">${mark}<span class="t">${label}</span>${tag}</button>`;
  }).join('');
  return `<div class="stage v3 stage-photo">
    <img class="v3-photo" src="${IMG}dana.jpg" alt="" style="object-position:22% 40%">
    ${bar(1, 'Intro', INTRO, 3)}
    <section class="v3-panel">
      <div class="v3-body">
        <blockquote class="v3-quote"><span class="qm" aria-hidden="true">“</span><p>Put a chatbot on the HR inbox. Live next month?</p><cite>Dana, HR director · Fictional character</cite></blockquote>
        <p class="v3-ctx">Dana gets about 90 requests a month, most of them repeat questions.</p>
        <h1 class="v3-instr">Choose your first move.</h1>
        <div class="v3-opts">${opts}</div>
        ${after ? fb('wrong', 'Not quite.', 'A chatbot on an unmapped flow only speeds up whatever is broken, so map the flow first.') : ''}
      </div>
      ${bottom(after ? NEXT : `<button class="v3-check locked">${ic('lock')}Choose one first</button>`)}
    </section>
  </div>`;
}

/* ---------- S03 ---------- */
const S03_OPTS = [['a', 'Unclear problem', 'help'], ['b', 'Unmapped process', 'route'], ['c', 'Unidentified end user', 'user'], ['d', 'No success metric', 'ruler']];
function s03(after) {
  const opts = S03_OPTS.map(([id, label, icon]) => {
    let st = '';
    if (!after) st = (id === 'a' || id === 'b') ? 'picked' : '';
    else st = id === 'a' ? 'wrong' : (id === 'b' || id === 'd') ? 'right' : 'dim';
    const box = st === 'picked' ? `<span class="bx on">${ic('check')}</span>` : st === 'wrong' ? `<span class="bx fill">${ic('x')}</span>` : st === 'right' ? `<span class="bx fill">${ic('check')}</span>` : '<span class="bx"></span>';
    // round 5 (Noy: the dashed answer confused): both right answers look the same, solid teal
    const tag = st === 'wrong' ? '<em>Your answer</em>' : st === 'right' ? '<em>Right answer</em>' : '';
    return `<button class="v3-opt tile ${st}">${box}${ic(icon, 'oi')}<span class="t">${label}</span>${tag}</button>`;
  }).join('');
  return `<div class="stage v3 stage-film">
    <img class="v4-wash" src="${IMG}l4/md1/ch2-why-map.jpg" alt="">
    <div class="v3-film">
      <figure><img src="${IMG}s03-case1.jpg" alt=""><figcaption>${ic('play')}Video case · car company, 1980s</figcaption></figure>
      <figure><img src="${IMG}s03-case2.jpg" alt=""><figcaption>${ic('play')}Video case · fintech, 2024 to 2025</figcaption></figure>
    </div>
    ${bar(2, 'Why map', WHYMAP, 3)}
    <section class="v3-panel">
      <div class="v3-body">
        <p class="v3-ctx top">Four causes of AI project failure, from Lesson 1.</p>
        <h1 class="v3-instr">Select the two causes both cases warn against.</h1>
        <div class="v3-opts">${opts}</div>
        ${after ? fb('wrong', 'Not quite.', 'Both cases changed once someone saw the real flow, and both were checked by numbers.') : ''}
      </div>
      ${bottom(after ? NEXT : `<button class="v3-check">Check</button>`)}
    </section>
  </div>`;
}

const SCREENS = [
  { id: 'S01', title: 'S01, מסך עם דמות', fn: s01, caps: ['לפני: עדיין לא נבחרה תשובה', 'אחרי Check, תשובה שגויה'] },
  { id: 'S03', title: 'S03, מסך עם שני מקרים', fn: s03, caps: ['לפני: נבחרו שתיים, Check פעיל', 'אחרי Check'] },
];
document.body.classList.add(`fb-${new URLSearchParams(location.search).get('fb') || 'dark'}`);
document.getElementById('mocks').innerHTML = SCREENS.map((s) => `
  <section class="mock" id="m-${s.id}"><h2>${s.title}</h2>
    <div class="duo">
      <div><p class="cap">${s.caps[0]}</p><div class="frame" id="f-${s.id}-before"><div dir="ltr" lang="en">${s.fn(false)}</div></div></div>
      <div><p class="cap">${s.caps[1]}</p><div class="frame" id="f-${s.id}-after"><div dir="ltr" lang="en">${s.fn(true)}</div></div></div>
    </div></section>`).join('');
function fit() {
  document.querySelectorAll('.frame').forEach((f) => {
    const k = f.clientWidth / 1280;
    f.style.height = `${720 * k}px`;
    f.querySelector('.stage').style.transform = `scale(${k})`;
  });
}
addEventListener('resize', fit);
fit();
