// FX4 compare page (dev only): the same screen before (the live folder on port 8125) and after (this copy)
const BEFORE = 'http://127.0.0.1:8125/index.html';
const AFTER = '../index.html';
const content = await (await fetch('../content/l4-slice.json', { cache: 'no-cache' })).json();
const ids = content.lesson.slice;
// the new S19 screens show the old S19 on the left
const OLD = { S19A: 'S19', S19B: 'S19', S19C: 'S19' };
// what changed, per screen (Noy's quick guide; the full list is review/fx4/REPORT.md)
const NOTES = {
  _all: 'בכל מסך: Next בטורקיז + שורה לידו (מה חסר / מה הבא) · Hint מאחורי קישור · בלי נקודות ניסיונות · פס עליון גדול יותר',
  O2: 'שורת ה-PDF בסוף השיעור; טקסטים קצרים יותר',
  S01: 'בלי Show me how; בלי רמז (היה רק "Pick one")',
  S02: 'פחות מילים (35)',
  W1: 'הוראה שמתחילה בפועל', W2: 'הוראה שמתחילה בפועל', W3: 'הוראה שמתחילה בפועל; ההקשר עבר לכרטיס', W4: 'הוראה שמתחילה בפועל',
  V1: 'בקרת מהירות (1–2); בעצירה: אחרי 2 טעויות מוצגת התשובה; בלי יד רפאים מעל התשובות',
  V2: 'בקרת מהירות (1–2); בעצירה: אחרי 2 טעויות מוצגת התשובה; בלי יד רפאים מעל התשובות',
  S03: 'משפט אחד "למה" בתשובה הנכונה; Check אומר מה חסר',
  K2: 'פחות מילים', S05a: 'פחות מילים; BPMN כמונח עם הסבר',
  S04: 'לחיצה על כרטיס ואז על עמודה; תגית לכל כרטיס אחרי Check; כרטיס מסיח חדש (HR staff send the answer back)',
  S05b: 'התוויות לא מכסות את טקסט הדיאגרמה; Check אומר מה חסר',
  S06: 'הרמז מאחורי קישור', S07: 'פתיחה בלחיצה בלבד (בלי היפוך); "3 of 8 opened"; שאלה שמתחילה בפועל',
  S08: 'סבב 3 ("Don\'t fix") עם הסבר פשוט', S08B: 'שורה: לאיזה שדות במחברת זה נכנס', S09: 'תגית לכל כרטיס אחרי Check',
  S11: 'בלי תיבת ההגדרות: Baseline / Target / Date עם הסבר בריחוף', S12: 'טקסטים קצרים בשדות המפה',
  S12B: 'שורה: Field 8 במחברת', S13: 'בלי אזורי "Drop here": כל שלב הוא אזור השחרור',
  S14: 'בלי תיבת ההגדרה: handoff כמונח עם הסבר', S15: 'בלי תיבת ההגדרה: bottleneck כמונח עם הסבר',
  K4: 'פחות מילים', S16: 'תגית לכל כרטיס; ניסוח בלי מילים שמסגירות את העמודה', S17: 'משפט אחד "למה" לכל מקרה',
  S17B: 'פחות מילים', S18A: 'אחרי Check שגוי: השורות האדומות מתרוקנות + "Change the red ones, then Check."',
  S19A: 'חדש: "מה תעשו עכשיו" + צילום המחברת (משמאל: S19 הישן)', S19B: 'חדש: רק פתיחת המחברת והעתקה (משמאל: S19 הישן)',
  S19C: 'חדש: "Did you export your PDF?" (משמאל: S19 הישן)', S20: 'פחות מילים',
  S20B: 'בחירה מראה עיגול מלא; כל משוב מתחיל "In your workbook:"', S21R: 'פחות מילים',
  S22: 'ה-PDF הוא התוצר; לשלב 2 כותרת משלו; Finish ראשי; ההורדה "(optional)"',
};
const pick = document.getElementById('pick');
ids.forEach((id) => pick.append(new Option(id + (OLD[id] ? '  (חדש)' : ''), id)));
const learner = document.getElementById('learner');
const url = (base, id) => `${base}?live=0&screen=${encodeURIComponent(id)}` + (learner.checked ? '&reset=1' : '&review=1');
function show(id) {
  pick.value = id;
  document.getElementById('before').src = url(BEFORE, OLD[id] || id);
  document.getElementById('after').src = url(AFTER, id);
  document.getElementById('note').textContent = (NOTES[id] ? id + ': ' + NOTES[id] + '   ·   ' : '') + NOTES._all;
  history.replaceState(null, '', '#' + id);
}
const step = (d) => { const i = ids.indexOf(pick.value); show(ids[Math.min(ids.length - 1, Math.max(0, i + d))]); };
pick.addEventListener('change', () => show(pick.value));
learner.addEventListener('change', () => show(pick.value));
document.getElementById('prev').addEventListener('click', () => step(-1));
document.getElementById('next').addEventListener('click', () => step(1));
// the frames: the lesson at 1280 x 720, scaled to the box
const fit = () => document.querySelectorAll('.frame').forEach((f) => f.style.setProperty('--k', String(f.clientWidth / 1280)));
new ResizeObserver(fit).observe(document.querySelector('.pair'));
fit();
show(ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'S04');
