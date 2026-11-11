// FX7 round 2: three visual directions for S01, each before and after an answer, each with its own
// feedback placement. Planning only. Learner text from content/l4-slice.json (S01).
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  forms: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  decide: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const LOGO = '../../assets/logo/wawiwa-logo.png';
const DANA = '../../assets/img/dana.jpg';
const Q = 'Put a chatbot on the HR inbox. Live next month?';
const CTX = 'Dana gets about 90 requests a month, most of them repeat questions.';
const INSTR = 'Choose your first move.';
const OPTS = [['a', 'Shortlist three chatbot vendors', 'list'], ['b', 'Map how a request flows today', 'route'], ['c', 'Survey employees on what they want', 'forms']];
const WHY = 'A chatbot on an unmapped flow only speeds up whatever is broken, so map the flow first.';
const STEPS = ['Start', 'Overview', 'Goals', 'Decide', 'Write'];
const CUR = 3;

const discs = (cls) => `<ol class="${cls}">${STEPS.map((s, i) => `<li class="${i < CUR ? 'done' : i === CUR ? 'cur' : 'todo'}"><span class="d">${i < CUR ? ic('check') : ''}</span><span class="l">${s}</span></li>`).join('')}</ol>`;
const nextBtn = (open) => open ? `<button class="nx pulse">Next ${ic('right')}</button>` : `<button class="nx locked">${ic('lock')}Next</button>`;

/* ---------- A. Wawiwa e-learning (the Design System spec) + feedback attached under the answer ---------- */
function A(after) {
  const opts = OPTS.map(([id, label], i) => {
    const key = 'ABC'[i];
    let cls = '';
    if (after) cls = id === 'a' ? 'wrong' : id === 'b' ? 'right' : 'dim';
    const mark = after && id === 'a' ? `<span class="mk">${ic('x')}</span>` : after && id === 'b' ? `<span class="mk">${ic('check')}</span>` : '';
    const fb = after && id === 'a' ? `<div class="A-fb"><b>Not quite.</b> ${WHY}</div>` : '';
    return `<div class="A-optwrap"><button class="A-opt ${cls}"><span class="key">${key}</span><span class="t">${label}</span>${mark}</button>${fb}</div>`;
  }).join('');
  return `<div class="stage dA">
    <div class="A-bar"><img class="logo" src="${LOGO}" alt="Wawiwa"><button class="burger">${ic('menu')}</button>
      <div class="chap"><b>Chapter 1 of 7</b><span>Intro</span></div>${discs('A-steps')}</div>
    <div class="A-work">
      <figure class="A-photo"><img src="${DANA}" alt=""></figure>
      <div class="A-main">
        <div class="A-sit"><p class="q">${Q}</p><p class="who">Dana, HR director · Fictional character</p></div>
        <p class="A-ctx">${CTX}</p>
        <p class="A-tag">${ic('decide')}Decide</p>
        <h1 class="A-instr">${INSTR}</h1>
        <div class="A-opts">${opts}</div>
      </div>
    </div>
    <div class="A-foot"><button class="pv">${ic('left')}Previous</button>${nextBtn(after)}</div>
  </div>`;
}

/* ---------- B. Clean product + the answers collapse into the result ---------- */
function B(after) {
  const steps = `<ol class="B-steps">${STEPS.map((s, i) => `<li class="${i < CUR ? 'done' : i === CUR ? 'cur' : 'todo'}">${i < CUR ? ic('check') : ''}${s}</li>`).join('')}</ol>`;
  const rows = after
    ? `<div class="B-result">
        <div class="B-row wrong"><span class="key">${ic('x')}</span><span class="t">Shortlist three chatbot vendors</span><span class="lbl">Your answer</span></div>
        <div class="B-row right"><span class="key">${ic('check')}</span><span class="t">Map how a request flows today</span><span class="lbl">Right answer</span></div>
        <p class="B-why"><b>Not quite.</b> ${WHY}</p>
      </div>`
    : `<div class="B-rows">${OPTS.map(([id, label], i) => `<button class="B-row"><span class="key">${'ABC'[i]}</span><span class="t">${label}</span></button>`).join('')}</div>`;
  return `<div class="stage dB">
    <div class="B-bar"><img class="logo" src="${LOGO}" alt="Wawiwa"><button class="burger">${ic('menu')}</button>
      <div class="chap"><b>Chapter 1 of 7</b><span>Intro</span></div>${steps}</div>
    <div class="B-work">
      <figure class="B-photo"><img src="${DANA}" alt=""></figure>
      <div class="B-main">
        <p class="B-quote"><span class="qm" aria-hidden="true">“</span>${Q}</p>
        <p class="B-who"><b>Dana, HR director</b> · Fictional character · ${CTX}</p>
        <hr>
        <p class="B-tag">Decide</p>
        <h1 class="B-instr">${INSTR}</h1>
        ${rows}
      </div>
    </div>
    <div class="B-foot"><button class="pv">${ic('left')}Previous</button>${nextBtn(after)}</div>
  </div>`;
}

/* ---------- C. Split: a navy side for the story, white for the task + Dana answers in the chat ---------- */
function C(after) {
  const opts = OPTS.map(([id, label, icon]) => {
    let cls = '';
    if (after) cls = id === 'a' ? 'wrong' : id === 'b' ? 'right' : 'dim';
    const mark = after && id === 'a' ? `<em>${ic('x')}Your answer</em>` : after && id === 'b' ? `<em>${ic('check')}Right answer</em>` : '';
    return `<button class="C-opt ${cls}">${ic(icon, 'oi')}<span class="t">${label}</span>${mark}</button>`;
  }).join('');
  const side = after
    ? `<div class="C-person small"><img src="${DANA}" alt=""><div><b>Dana</b><span>HR director · Fictional character</span></div></div>
       <div class="C-chat">
         <p class="bub them">${Q}</p>
         <p class="bub me">Shortlist three chatbot vendors</p>
         <p class="bub them reply wrong"><span class="v">${ic('x')}Not quite.</span>${WHY}</p>
       </div>`
    : `<figure class="C-photo"><img src="${DANA}" alt=""></figure>
       <div class="C-person"><div><b>Dana</b><span>HR director · Fictional character</span></div></div>
       <div class="C-chat"><p class="bub them">${Q}</p></div>
       <p class="C-ctx">${CTX}</p>`;
  return `<div class="stage dC">
    <div class="C-bar"><img class="logo" src="${LOGO}" alt="Wawiwa"><button class="burger">${ic('menu')}</button>
      <div class="chap"><b>Chapter 1 of 7</b><span>Intro</span></div>${discs('C-steps')}</div>
    <aside class="C-side">${side}</aside>
    <div class="C-main">
      <p class="C-tag">${ic('decide')}Decide</p>
      <h1 class="C-instr">${INSTR}</h1>
      <div class="C-opts">${opts}</div>
    </div>
    <div class="C-foot"><button class="pv">${ic('left')}Previous</button>${nextBtn(after)}</div>
  </div>`;
}

const DIRS = [
  { id: 'A', title: 'כיוון A: Wawiwa e-learning, לפי מערכת העיצוב', fn: A, why: [
    'הצבעים והרכיבים מגיעים מה-Design System של Wawiwa לשיעורים דיגיטליים: רקע אפור קר (לא שמנת), פס עליון ופס תחתון בנייבי, ופס אדום דק מעל הפס התחתון.',
    'המצב (הבקשה של דנה) מופיע ככרטיס נייבי עם פס טורקיז בצד, כמו "Scenario block" במערכת.',
    'התשובות מקבלות אות (A, B, C). אחרי תשובה, הנכונה מתמלאת בטיל והשגויה באדום עם טקסט לבן, כמו "Quiz" במערכת.',
    '<b>המשוב:</b> נפתח מתחת לתשובה שבחרתי, צמוד אליה, בדיוק איפה שהעין כבר נמצאת. האפשרויות שמתחת יורדות למטה.',
  ] },
  { id: 'B', title: 'כיוון B: מוצר נקי, בסגנון חברת טכנולוגיה', fn: B, why: [
    'רקע לבן, הרבה אוויר, קווים דקים במקום כרטיסים וצללים. כמו מוצר SaaS מודרני.',
    'הבקשה של דנה היא ציטוט גדול בלי מסגרת. התשובות הן שורות עם מקש מקלדת (A, B, C), ובאמת אפשר ללחוץ עליו.',
    'התקדמות השלבים היא שורת מילים עם וי, ולא עיגולים.',
    '<b>המשוב:</b> אחרי תשובה הרשימה מתכווצת לשתי שורות, "Your answer" ו-"Right answer", ומשפט ה"למה" מופיע בגדול במקום שהתפנה. המסך הסופי מספר את כל הסיפור בשלוש שורות.',
  ] },
  { id: 'C', title: 'כיוון C: מסך מפוצל, סיפור משמאל ומשימה מימין', fn: C, why: [
    'צד שמאל בנייבי כהה מחזיק את הסיפור (הדמות, ההודעה שלה). צד ימין לבן מחזיק את המשימה. ברור מיד מה הקשר ומה לעשות.',
    'הכהה רק בצד אחד, כך שזה לא מעייף כמו מסך כהה מלא.',
    '<b>המשוב:</b> מגיע כשיחה. הבחירה שלי מופיעה כהודעה שלי, ודנה עונה עם ה"למה". התמונה מתכווצת לאווטאר כדי לפנות מקום לשיחה. על התשובות עצמן מסומן מה נכון ומה בחרתי.',
    'במסכים בלי דמות (מיון, מדד) הצד הכהה מחזיק את ההוראה וההקשר, והמשוב מופיע שם באותו מקום.',
  ] },
];

const root = document.getElementById('mocks');
root.innerHTML = DIRS.map((d) => `
  <section class="mock" id="m-${d.id}">
    <h2>${d.title}</h2>
    <div class="duo">
      <div><p class="cap">לפני תשובה</p><div class="frame" id="f-${d.id}-before"><div class="stage-wrap" dir="ltr" lang="en">${d.fn(false)}</div></div></div>
      <div><p class="cap">אחרי תשובה שגויה</p><div class="frame" id="f-${d.id}-after"><div class="stage-wrap" dir="ltr" lang="en">${d.fn(true)}</div></div></div>
    </div>
    <ul class="why">${d.why.map((w) => `<li>${w}</li>`).join('')}</ul>
  </section>`).join('');

function fit() {
  document.querySelectorAll('.frame').forEach((f) => {
    const k = f.clientWidth / 1280;
    f.style.height = `${720 * k}px`;
    f.querySelector('.stage').style.transform = `scale(${k})`;
  });
}
addEventListener('resize', fit);
fit();
