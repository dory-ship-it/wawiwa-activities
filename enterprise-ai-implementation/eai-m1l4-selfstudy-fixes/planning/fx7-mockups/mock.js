// FX7 layout proposal: static mock-ups of 6 representative screens on the real 1280 x 720 stage.
// Planning only (not loaded by the lesson). Learner text is copied from content/l4-slice.json.
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  forms: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  vol: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/>',
  cc: '<rect width="18" height="14" x="3" y="5" rx="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  grip: '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  steps: '<path d="M10 12h11"/><path d="M10 18h11"/><path d="M10 6h11"/><path d="M4 10h2"/><path d="M4 6h1v4"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  max: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  sort: '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const hand = (cls = '') => `<svg class="hand ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 11V10a2 2 0 0 0-4 0M14 10V9a2 2 0 0 0-4 0v1M10 9.5V4a2 2 0 0 0-4 0v10M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" fill="var(--wl-hand-fill)" stroke="var(--wl-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const IMG = '../../assets/img/';

function bar(ch, name, steps, cur, dark = false) {
  const s = steps.map((label, i) => {
    const st = i < cur ? 'done' : i === cur ? 'cur' : 'todo';
    const inner = st === 'done' ? ic('check') : st === 'cur' ? '<span class="dot"></span>' : '';
    return `<li class="st ${st}"><span class="disc">${inner}</span><span class="lab">${label}</span></li>`;
  }).join('<li class="link" aria-hidden="true"></li>');
  return `<div class="bar${dark ? ' on-dark' : ''}"><img class="logo" src="../../assets/logo/wawiwa-logo.png" alt="Wawiwa"><span class="rule"></span>
    <button class="burger" aria-label="Chapters">${ic('menu')}</button>
    <div class="chap"><b>Chapter ${ch} of 7</b><span>${name}</span></div>
    <ol class="steps">${s}</ol></div>`;
}
function foot(state = {}) {
  const { kind, verdict, why, next = 'locked', dark = false } = state;
  const nextBtn = next === 'locked'
    ? `<button class="next locked" aria-disabled="true">${ic('lock')}Next</button>`
    : `<button class="next ${next === 'pulse' ? 'pulse' : ''}">Next ${ic('right')}</button>`;
  const res = kind
    ? `<div class="result ${kind}" role="status"><span class="r-ic">${ic(kind === 'right' ? 'check' : 'x')}</span><p><b>${verdict}</b> ${why}</p></div>`
    : '<div class="result"></div>';
  return `<div class="foot ${kind ? 'is-' + kind : ''}${dark ? ' on-dark' : ''}"><button class="prev">${ic('left')}Previous</button>${res}${nextBtn}</div>`;
}
const tag = (icon, text) => `<p class="steptag">${ic(icon)}${text}</p>`;

/* ---------- 1. S01: a choice with a speaker ---------- */
const s01 = () => `
${bar(1, 'Intro', ['Start', 'Overview', 'Goals', 'Decide', 'Write'], 3)}
<div class="work l-speaker">
  <figure class="portrait"><img src="${IMG}dana.jpg" alt="" style="object-position:50% 40%"></figure>
  <div class="speaker-main">
    <div class="bubble">
      <p class="q">Put a chatbot on the HR inbox. Live next month?</p>
      <p class="who"><b>Dana, HR director</b> · Fictional character</p>
    </div>
    <p class="ctx">Dana gets about 90 requests a month, most of them repeat questions.</p>
    ${tag('help', 'Decide')}
    <h1 class="instr">Choose your first move.</h1>
    <div class="opts col">
      <button class="opt is-wrong">${ic('list', 'oi')}<span>Shortlist three chatbot vendors</span><em class="mark">${ic('x')}Your answer</em></button>
      <button class="opt is-right">${ic('route', 'oi')}<span>Map how a request flows today</span><em class="mark">${ic('check')}Right answer</em></button>
      <button class="opt is-dim">${ic('forms', 'oi')}<span>Survey employees on what they want</span></button>
    </div>
  </div>
</div>
${foot({ kind: 'wrong', verdict: 'Not quite.', why: 'A chatbot on an unmapped flow only speeds up whatever is broken, so map the flow first.', next: 'pulse' })}`;

/* ---------- 2. S04: the sort ---------- */
const s04 = () => `
${bar(3, 'Toolkit', ['Guess', 'Learn', 'Sort', 'Read', 'Label', 'Decide', 'Explore', 'Spot', 'Sketch'], 2)}
<div class="work l-sort">
  <div class="sort-head">${tag('sort', 'Sort')}<h1 class="instr">Drag each HR card to its part of the process.</h1></div>
  <div class="deck">
    <div class="deck-under u2"></div><div class="deck-under u1"></div>
    <div class="card-top">${ic('grip', 'grip')}<span>An employee walks over to ask HR</span></div>
    <p class="deck-count"><b>3</b> of 6 <span class="pips"><i class="on"></i><i class="on"></i><i class="cur"></i><i></i><i></i><i></i></span></p>
    <svg class="path" viewBox="0 0 400 300" aria-hidden="true"><path d="M230 10 C 150 60, 60 150, 60 272" fill="none" stroke="var(--wl-navy)" stroke-width="2.5" stroke-dasharray="2 8" stroke-linecap="round"/></svg>
    ${hand('h-sort')}
  </div>
  <div class="bins">
    <div class="bin"><header>${ic('zap', 'bi')}<div><b>Trigger</b><span>What starts it</span></div></header>
      <div class="placed">${ic('check')}<div><span>An employee sends a question by email</span><em>Starts the work</em></div></div>
      <div class="drop">Drop here</div></div>
    <div class="bin"><header>${ic('steps', 'bi')}<div><b>Steps</b><span>The path to the result</span></div></header>
      <div class="placed">${ic('check')}<div><span>HR staff check the topic of the question</span><em>A step on the path</em></div></div>
      <div class="drop">Drop here</div></div>
    <div class="bin"><header>${ic('send', 'bi')}<div><b>Output</b><span>What comes out, and to whom</span></div></header>
      <div class="drop tall">Drop here</div></div>
  </div>
</div>
${foot({ next: 'locked' })}`;

/* ---------- 3. S11: the metric, drawn ---------- */
const s11 = () => `
${bar(4, 'HR demo', ['Guess', 'Watch', 'Sort', 'Decide', 'Measure', 'Flag', 'Write'], 4)}
<div class="work l-metric">
  <div class="m-left">
    ${tag('gauge', 'Measure · Field 8')}
    <h1 class="instr">Pick the strongest success metric.</h1>
    <div class="chart" aria-label="Your pick, drawn as a metric: no baseline, a target, a date">
      <p class="chart-title">Checkable later?</p>
      <svg viewBox="0 0 520 250" aria-hidden="true">
        <line x1="60" y1="20" x2="60" y2="200" stroke="var(--wl-line-strong)" stroke-width="2"/>
        <line x1="60" y1="200" x2="500" y2="200" stroke="var(--wl-line-strong)" stroke-width="2"/>
        <line x1="60" y1="160" x2="500" y2="160" stroke="var(--wl-line)" stroke-dasharray="3 6"/>
        <text x="50" y="165" text-anchor="end" class="ax">20%</text>
        <text x="50" y="55" text-anchor="end" class="ax">?</text>
        <path d="M110 50 C 250 60, 330 150, 430 160" fill="none" stroke="var(--wl-neutral-line)" stroke-width="3" stroke-dasharray="6 7"/>
        <circle cx="110" cy="50" r="20" fill="var(--wl-error-bg)" stroke="var(--wl-error)" stroke-width="2.5" stroke-dasharray="5 4"/>
        <text x="110" y="58" text-anchor="middle" class="qm">?</text>
        <circle cx="430" cy="160" r="14" fill="var(--wl-teal)"/>
        <path d="M424 160l4.5 4.5 8-9" stroke="var(--wl-white)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="110" y="226" text-anchor="middle" class="ax">Now</text>
        <text x="430" y="226" text-anchor="middle" class="ax ax-b">In 3 months</text>
      </svg>
      <ul class="parts">
        <li class="miss">${ic('x')}Baseline <span>missing</span></li>
        <li class="ok">${ic('check')}Target</li>
        <li class="ok">${ic('check')}Date</li>
      </ul>
    </div>
  </div>
  <div class="m-right">
    <div class="opts col tight">
      <button class="opt is-dim"><span>HR time on repeats: significant improvement within 3 months</span></button>
      <button class="opt is-dim"><span>Employees feel HR answers repeat questions faster</span></button>
      <button class="opt is-wrong"><span>HR time on repeats: down to 20% within 3 months</span><em class="mark">${ic('x')}Your answer</em></button>
      <button class="opt is-right"><span>HR time on repeats: ~35% now, 20% in 3 months</span><em class="mark">${ic('check')}Right answer</em></button>
    </div>
  </div>
</div>
${foot({ kind: 'wrong', verdict: 'Not quite.', why: 'Twenty percent, down from what? The marked one has today’s number, a target and a date.', next: 'pulse' })}`;

/* ---------- 4. S12: flag on the map ---------- */
const MAP = [
  [1, 'Name', 'Repeat HR questions'], [2, 'Trigger', 'WhatsApp, email, or in person'], [3, 'Steps', 'Receive, check, answer or escalate'], [4, 'Handoffs', 'HR staff to HR manager, beyond policy'],
  [5, 'Sources', 'Four policies; owner HR manager; INTERNAL'], [6, 'Controls', 'No formal control: staff judgment'], [7, 'Gaps', 'Errors uncounted; no single handoff channel'], [8, 'Metric', '~35% of HR time now, 20% in 3 months'],
];
const s12 = () => `
${bar(4, 'HR demo', ['Guess', 'Watch', 'Sort', 'Decide', 'Measure', 'Flag', 'Write'], 5)}
<div class="work l-flags">
  <div class="f-head">
    <div>${tag('flag', 'Flag')}<h1 class="instr">Click the two fields that show the handoff risk.</h1>
      <p class="ctx">Your HR map is complete: all eight fields from this chapter.</p></div>
    <div class="flagcount" aria-label="1 of 2 flags placed"><span class="fc on">${ic('flag')}</span><span class="fc">${ic('flag')}</span><b>1 of 2</b></div>
  </div>
  <div class="mapgrid">
    ${MAP.map(([n, t, x]) => `<button class="field${n === 4 ? ' flagged' : ''}${n === 7 ? ' hover' : ''}"><span class="fn">${n}</span><b>${t}</b><span class="fx">${x}</span>${n === 4 ? `<span class="fbadge">${ic('flag')}</span>` : ''}</button>`).join('')}
    ${hand('h-flag')}
  </div>
</div>
${foot({ next: 'locked' })}`;

/* ---------- 5. S02: your case, on a workbook sheet ---------- */
const s02 = () => `
${bar(1, 'Intro', ['Start', 'Overview', 'Goals', 'Decide', 'Write'], 4)}
<div class="work l-sheet">
  <div class="sh-left">
    ${tag('pencil', 'Write')}
    <h1 class="instr">Bring your use case from Homework 1.</h1>
    <p class="ctx">Use your Lesson 1 case, or any repeating process you know well.</p>
    <a class="doc" href="#" onclick="return false">
      <span class="doc-page">${ic('file')}</span>
      <span class="doc-txt"><b>Homework 1</b><span>Opens in a new tab</span></span>
      ${ic('ext', 'doc-ext')}
    </a>
  </div>
  <div class="sheet">
    <div class="sheet-top"><b>Your case</b><span class="thread">${ic('map')}Comes back in Chapter 6</span></div>
    <label class="fld"><span>Case title</span>
      <span class="inp typing">Sales call summ<i class="caret"></i></span><small>14 / 60</small></label>
    <label class="fld"><span>The problem today</span>
      <span class="inp area ph">Today X happens, which hurts because Y.</span><small>0 / 250</small></label>
    <div class="sheet-foot"><span class="priv">${ic('shield')}Leave out names and identifying details.</span>
      <button class="primary locked">${ic('lock')}Fill both to save</button></div>
    ${hand('h-type')}
  </div>
</div>
${foot({ next: 'locked' })}`;

/* ---------- 6. V1: a video stop ---------- */
const v1 = () => `
${bar(2, 'Why map', ['Guess', 'Watch', 'Learn', 'Decide'], 1, true)}
<div class="work l-video">
  <div class="player">
    <div class="screen"><img src="../../assets/video/v1-poster.jpg" alt=""></div>
    <div class="ctrls">
      <button aria-label="Play">${ic('play')}</button><span class="time">1:25 / 3:41</span>
      <div class="track"><i class="fill" style="width:38.4%"></i><i class="stop" style="left:38.4%"></i><i class="stop todo" style="left:77%"></i></div>
      <button aria-label="Speed">${ic('gear')}</button><button class="on" aria-label="Captions">${ic('cc')}</button><button aria-label="Volume">${ic('vol')}</button><button aria-label="Full screen">${ic('max')}</button>
    </div>
    <p class="paused">${ic('pause')}Paused for a question. The video goes on after you answer.</p>
  </div>
  <aside class="stopq">
    <p class="steptag on-panel">${ic('eye')}Question 1 of 2</p>
    <h1 class="q">The US company wants to close a five-times gap. What should it look at first?</h1>
    <div class="opts col tight">
      <button class="opt"><span>A faster system for its current payment checks</span></button>
      <button class="opt"><span>Where the 500 people’s working time goes today</span></button>
      <button class="opt"><span>The official payment procedure, as written</span></button>
    </div>
  </aside>
</div>
${foot({ next: 'locked', dark: true })}`;

const MOCKS = [
  { id: 'S01', title: '1. בחירה עם דמות שמדברת (S01, וגם S14, S15, S18, S22)', html: s01, why: [
    'דנה היא הסיבה למשימה, לכן היא מקבלת עמודת דיוקן מלאה בקצה המסך. התמונה שלמה ואין עליה כלום.',
    'הבועה שלה יוצאת מהתמונה אל המשימה. סדר הקריאה משמאל לימין: מי מבקשת, מה היא מבקשת, מה אני עושה, התשובות.',
    'התשובות הן שורות רחבות בגובה 64 עם אייקון, ולא כרטיס קטן בפינה.',
    'אחרי ניסיון אחד: "Your answer" באדום על מה שבחרתי, "Right answer" בירוק על התשובה הנכונה, ושאר האפשרויות מתעמעמות.',
    'פס התחתון נצבע כולו עם משפט "למה" אחד, ו-Next פועם לידו.',
  ] },
  { id: 'S04', title: '2. מיון (S04, S09, S16)', html: s04, why: [
    'כמו המיון של Rise: חפיסה אמיתית במרכז (רואים שיש קלפים מתחת), "3 of 6" עם נקודות, וסלים רחבים למטה עם רווח ביניהם.',
    'לכל סל יש אייקון משלו (מתחיל, שלבים, יוצא), כך שהקטגוריה נקלטת לפני שקוראים.',
    'כרטיס שהונח במקום הנכון נשאר בסל עם וי ירוק ותגית קצרה. הנחה שגויה מהבהבת באדום, ה"למה" מופיע בפס התחתון והכרטיס חוזר לחפיסה.',
    'היד והמסלול המנוקד מופיעים רק בכניסה למסך, ונעלמים בפעולה הראשונה.',
    'אין כפתור Check ואין רמז.',
  ] },
  { id: 'S11', title: '3. מדד הצלחה, מצויר (S11)', html: s11, why: [
    'ה"משהו מיוחד" ל-Baseline, Target ו-Date: הבחירה של הלומד מצוירת כגרף של לפני ואחרי.',
    'מה שחסר מופיע כעיגול מקווקו עם סימן שאלה. כאן בחרו "down to 20%", ולכן רואים שאין נקודת התחלה.',
    'שלוש התגיות מתחת לגרף מראות בדיוק מה יש ומה חסר. בלי פסקת הסבר.',
    'אותו גרף ישמש את S12B, כשהלומד כותב מדד לתהליך שלו. ככה נוצר חוט מקשר.',
  ] },
  { id: 'S12', title: '4. סימון על המפה (S12, S13, S05b)', html: s12, why: [
    'מוותרים על "לבחור דגל ואז לגרור אותו", שזה בדיוק מה שבלבל. פשוט לוחצים על שדה, והוא מקבל דגל.',
    'המונה בצד ימין ("1 of 2" עם שני דגלים) מחליף את הטקסט.',
    'המפה היא 8 שדות ממוספרים ברשת 4 על 2 לכל רוחב המסך, באותה צורה של מפת המחברת בפרק 6. ככה הלומד מזהה אותה כשהוא מגיע לשם.',
    'S13 יעבוד באותה דרך: לוחצים על השלב שבו התהליך מתחיל, ואז על השלב שבו הוא מסתיים, בשורה אחת של שלבים בסדר כרונולוגי.',
  ] },
  { id: 'S02', title: '5. כתיבה על דף מחברת (S02, S08B, S12B, S17B, S18B)', html: s02, why: [
    'מסכי הכתיבה נראים כמו דף במחברת, עם השדות עצמם, כדי שהחוט אל מפת התהליך יהיה גלוי מההתחלה ("Comes back in Chapter 6").',
    'Homework 1 הוא קובץ שנראה כמו קובץ (דף, שם, "Opens in a new tab"), ולא קישור שנראה כמו רמז.',
    'היד מקלידה דוגמה בכניסה ונעלמת כשהלומד מתחיל להקליד.',
    'Save נעול עם הסיבה כתווית ("Fill both to save"). כשאפשר ללחוץ, הוא נצבע ו-Next ייפתח אחרי השמירה.',
    'העמודה השמאלית רחבה מספיק, כך שהטקסט לא נשבר למילה בכל שורה כמו היום.',
  ] },
  { id: 'V1', title: '6. עצירה בווידאו (V1, V2)', html: v1, why: [
    'הווידאו הוא המסך היחיד על רקע כהה, כמו אולם קולנוע. ככה הרקע מאחורי הווידאו לא נראה מוזר.',
    'בעצירה הסרטון מתכווץ שמאלה, והשאלה נכנסת מימין כפאנל בהיר לכל גובה המסך. שום דבר לא יושב על הסרטון.',
    'מתחת לסרטון כתוב שהוא עצר בשביל שאלה וימשיך אחריה. בפס הזמן רואים שתי עצירות.',
    'ניסיון אחד, ואז המשוב בפס התחתון כמו בכל מסך אחר, והסרטון ממשיך.',
    'גלגל השיניים של המהירות נשאר בפס הנגן.',
  ] },
];

const root = document.getElementById('mocks');
root.innerHTML = MOCKS.map((m) => `
  <section class="mock" id="m-${m.id}">
    <h2>${m.title}</h2>
    <div class="frame"><div class="stage" dir="ltr" lang="en">${m.html()}</div></div>
    <ul class="why">${m.why.map((w) => `<li>${w}</li>`).join('')}</ul>
  </section>`).join('');

function fit() {
  document.querySelectorAll('.frame').forEach((f) => {
    const k = f.clientWidth / 1280;
    f.style.height = `${720 * k}px`;
    f.firstElementChild.style.transform = `scale(${k})`;
  });
}
addEventListener('resize', fit);
fit();
