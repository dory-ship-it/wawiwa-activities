# P4 REPORT: React Hooks self-study (Spanish), QA and handoff

15 Nov 2026 · Opus 5.5, effort medium · committed locally on `main` of wawiwa-activities, nothing pushed.

## בעברית (לדור)

- **מה נבדק:** כל שש הבדיקות של שלב P4 רצו על חמשת התרגולים ועל ה-check-in, בספרדית ובאנגלית. כולן עברו.
  - בדיקת axe-core: אפס הפרות. נבדקו 220 מצבי מסך (כל מסך ריק, אחרי תשובה שגויה, אחרי תשובה נכונה, וכל לשונית קוד).
  - התאמה למסגרת ברוחב 680 וברוחב 1100: הכול נכנס, בשתי השפות. אין בקשות רשת החוצה ואין שגיאות בקונסול.
  - מגבלות מילים: אין חריגה. הכי קרוב לגבול: משוב של 30 מילים מתוך 30 ב-P-4 (באנגלית).
  - טקסט מחוץ לקובצי ה-strings: אין. הבונה מוסיף רק ספרות וסימני פיסוק.
  - כל קטעי הקוד רצו שוב באפליקציית Vite + React אמיתית: 26 כרטיסים, 156 בדיקות, אפס כשלים.
  - הגהה בספרדית (פנייה ב-tú, ניקוד, ¿¡): תוקנו ארבעה דברים קטנים (פירוט באנגלית למטה). זו הגהה של Claude, לא של דובר ספרדית.
- **זמן לתרגול:** תרגול P-1 מההתחלה עד הסוף לקח ל-Claude 59 שניות. זה לא זמן של לומד: Claude יודע את התשובות וכותב קוד מיד. **זמן הלומד לא נמדד.** כדי למדוד אותו צריך אדם אחד (למשל נוי או סטודנט) שיעבור תרגול אחד עם שעון.
- **קוד ההטמעה ל-Cowork:** טבלה עם שורה לכל בלוק למטה. ההטמעה היא לפי יחס 1000:560, כמו שבחרת (Q4). הגובה לפי הכלל ב-`/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/CLAUDE.md` נמדד (576) ונשמר ברישום.
- **סדר השיעור החדש ב-Rise:** בטבלה למטה. חמשת הסרטים עוד לא ב-Vimeo, ולכן בטבלה הם מופיעים בשם הקומפוזיציה ובלי מספר Vimeo.
- **החלטה Q4 (דור, 15 בנובמבר 2026): הטמעה לפי יחס.** בדקתי: ברוחב 1000 וברוחב 760 הכרטיס ממלא את המסגרת, ואין רווח ריק. לא בדקתי בתוך Rise.
- **שאלות שעדיין פתוחות (לא נגעתי):** Q1 (שורת טקסט ב-Rise מתחת לסרטון הפתיחה), ושאלות ה-SME‏ S5, S10, S11.
- **מה עוד לא נבדק:**
  - העתקה אמיתית של הקונסול מ-Chrome DevTools לתוך מסכי ההדבקה (P-2 מסך 4, P-3 מסך 5). זה דורש יד אנושית ב-DevTools. דקה אחת.
  - הדפים בתוך בלוק Rise אמיתי.
  - הגהה של דובר ספרדית.
- **מה צריך ממך:**
  1. לעשות push ל-`main` של `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities` ב-GitHub Desktop. אחרי זה הדפים עולים לאוויר.
  2. לרשום את ששת הדפים ב-`/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json`. לא נגעתי בקובץ (סשן אחר עובד שם). השורות המדויקות כתובות למטה, בסעיף "deliverables.json rows".
  3. אחרי שתאשר את הסרטים לפרסום: מספרי Vimeo, ואז Cowork בונה את השיעור ליד הישן.
- **סקיל או תדריך:** Cowork צריך את הדוח הזה (טבלת ההטמעה וסדר השיעור). לא צריך סקיל חדש עכשיו.
- **איפה זה שמור:** commit מקומי ב-`main` של `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities`. הדוח: `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es/review/p4/REPORT.md`. לא נדחף.

## English

### Checks (measured 15 Nov 2026 unless marked otherwise)

All six pages (`p1-usestate`, `p2-useeffect`, `p3-limpieza`, `p4-useref`, `p5-hooks-propios`, `checkin`), Spanish `index.html` and English `index.en.html`. Headless Google Chrome via puppeteer-core 25.17.0, Assistant installed on this Mac and loaded by the page from `shared/fonts/`.

| Check | Result | How it was measured | Raw output |
|---|---|---|---|
| axe-core: 0 violations | **0 violations** on 220 states (12 pages). axe could not decide two things ("needs review", not violations): the arrows between the header steps (`aria-hidden`, no text), and the text of the paste box once text is pasted (background hidden by the text). The paste box was measured by hand: text #EEF3F9 on #0A121F = 16.8:1 (AA needs 4.5:1). | axe-core 4.10.2, tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice; the page alone at its design size 1000 x 560; every state the P3 fit test knows (each screen fresh, each wrong answer the page knows, right answer, every tab of a code card) | `review/p4/axe-output.txt` |
| Fit at 680 and 1100 px | **pass**, 0 failed checks on 12 pages. Least room left: P-1 17 px, P-2 20 px, P-3 20 px, P-4 38 px, P-5 7 px (the `useDataApi.js` solution), check-in 78 px. Same numbers as P3. 0 requests outside the lesson folder, 0 console errors, keyboard-only pass on every page | `review/p3/tools/shots.mjs … check` (unchanged P3 tool), frames 680 x 381 and 1100 x 616 | `review/p4/fit-output.txt` |
| Word counts | **0 over the limit.** Longest instruction 26 words (P-3, limit 35); longest feedback 30 words (P-4 English, limit 30; Spanish 29); longest step 18 words (P-3, limit 20); no screen with more than 4 steps. Words per page (Spanish): P-1 248, P-2 296, P-3 374, P-4 243, P-5 328, check-in 176 | `review/p4/tools/textcheck.mjs`, counted the way `build.mjs` counts; also `build.mjs` printed no warning on the rebuild | `review/p4/textcheck-output.txt` |
| No text outside the strings files | **pass.** Every visible text run and every `aria-label`, `alt`, `title` in the 12 generated pages is in that page's strings or the shared strings. Runs the build composes from several strings: «Paso 1 · Predice», «Pregunta 2 de 5» (the build adds only digits, «·» and «:»). `practice.js` sets only «1 / 5» (digits) and texts it reads from data attributes. The 12 pages rebuild byte-identical from the strings (checked before the fixes below) | same tool | same file |
| Spanish proofreading (tú, accents, ¿¡) | **4 small fixes, listed below.** Every question mark has its «¿», every imperative is tú (Crea, Haz, Escribe, Agrégalo, Úsalo, Cópialo, Pega), no usted forms, no missing accents found (searched the common ones: solución, página, función, aquí, después, número, botón, código, práctica, lección). The Spanish text inside the code cards was read too. This is Claude's pass, **not a native speaker's** | read every learner-facing Spanish string (272 lines) | n/a |
| Every code snippet runs | **26 cards, 156 checks, 0 failed**, Spanish and English. React 19.3.1, react-dom 19.3.1, Vite 8.3.8, StrictMode on | `review/p3/snippet-check/run-tests.mjs` (unchanged P3 tool) in the throwaway lab; `FirstUser.jsx` and `useDataApi.js` called the real JSONPlaceholder | `review/p4/snippets-output.txt` |
| Time one practice end to end | **59 seconds for P-1, by Claude. Not a learner time.** | wall clock from opening P-1 to its last screen: answered screen 1, built `ShowHideMessage.jsx` in a fresh Vite app, clicked 3 times, answered «no», opened the solution, reached the takeaway. Claude knew every answer and typed the component at once | n/a |

**Learner time: not measured.** The work-order estimate of 10 to 15 minutes per practice stays an estimate. Measuring it needs one person (Noy, or one student) doing one practice with a clock, ideally P-3 or P-5 (the longest).

After the fixes, P-3, P-4 and P-5 were rebuilt and checked again (fit, axe, text check); results in the same raw files.

### Fixes made in this phase (small, inside this folder)

| Page | Where | Before | After |
|---|---|---|---|
| P-3 | screen 5, hint when «detenido» is missing | “Temporizador detenido” | «Temporizador detenido» (the pages use «» everywhere else) |
| P-3 | screen 8, point 3 (es + en) | `s => s + 1` | `(s) => s + 1`, the form the solution and screen 6 use |
| P-4 | screen 5 question; screen 6 note | “antes”, “Cannot access refs during render” | «antes», «Cannot access refs during render» |
| P-5 | screen 3 task (es + en) | Hook personalizado: useLocalStorage: gestiona… | Hook personalizado useLocalStorage: gestiona… (two colons in one line). Same change in English |
| P-5 | screen 9 note | “set-state-in-effect” | «set-state-in-effect» |

`planning/STORYBOARD.md` was not edited; it still has the old wording of the P-5 task.

### Not checked

- **A real Chrome console copy** pasted into the paste screens (P-2 screen 4, P-3 screen 5). DevTools cannot be driven from the test; the screens were tested in P3 with composed text in Chrome's formats. One manual try, about a minute: open the P-2 run in Chrome, select the console, copy, paste into the page.
- **The pages inside a real Rise block**, and Rise's real column widths. The embed height below follows the repo rule, not a Rise measurement.
- **A native Spanish speaker's proofreading.**
- **Learner time** (above).
- Phone widths.

### Embed table for Cowork

Live only after Dor pushes `main` of wawiwa-activities and the Pages deploy succeeds.

**Embed form: a ratio box (Q4, decided by Dor on 15 Nov 2026).** The box keeps the page's 1000:560 ratio at any column width. Measured with `review/p4/tools/ratio-check.mjs` (raw: `review/p4/ratio-output.txt`): at a 1000 px column the frame is 1000 x 560 and the card fills it; at 760 px the frame is 760 x 426 and the card 760 x 425.6 (0.4 px of rounding). Not seen inside Rise.

For the record, `embedHeight` by `wawiwa-activities/CLAUDE.md`: the page in an iframe 100% wide in a column 1000 and 760 px wide, Assistant installed. The card measured 1000 x 560.0 at 1000 and 760 x 425.6 at 760; the taller is 560, plus 16 = **576**, the same for all six pages (they share one 1000 x 560 canvas). Measured with `review/p4/tools/p4.mjs`.

| # | Block | URL | Size | Title | Embed code |
|---|---|---|---|---|---|
| 1 | P-1 useState | https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p1-usestate/ | 100% wide, ratio 1000:560 | Práctica 1 · useState | `<div style="position:relative;padding:56.000% 0 0 0;"><iframe src="https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p1-usestate/" title="Práctica 1 · useState" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy"></iframe></div>` |
| 2 | P-2 useEffect | https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p2-useeffect/ | 100% wide, ratio 1000:560 | Práctica 2 · useEffect | `<div style="position:relative;padding:56.000% 0 0 0;"><iframe src="https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p2-useeffect/" title="Práctica 2 · useEffect" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy"></iframe></div>` |
| 3 | P-3 Limpieza | https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p3-limpieza/ | 100% wide, ratio 1000:560 | Práctica 3 · Limpieza | `<div style="position:relative;padding:56.000% 0 0 0;"><iframe src="https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p3-limpieza/" title="Práctica 3 · Limpieza" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy"></iframe></div>` |
| 4 | P-4 useRef | https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p4-useref/ | 100% wide, ratio 1000:560 | Práctica 4 · useRef | `<div style="position:relative;padding:56.000% 0 0 0;"><iframe src="https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p4-useref/" title="Práctica 4 · useRef" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy"></iframe></div>` |
| 5 | P-5 Hooks personalizados | https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p5-hooks-propios/ | 100% wide, ratio 1000:560 | Práctica 5 · Hooks personalizados | `<div style="position:relative;padding:56.000% 0 0 0;"><iframe src="https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p5-hooks-propios/" title="Práctica 5 · Hooks personalizados" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy"></iframe></div>` |
| 6 | Check-in | https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/checkin/ | 100% wide, ratio 1000:560 | Autoevaluación: Hooks de React | `<div style="position:relative;padding:56.000% 0 0 0;"><iframe src="https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/checkin/" title="Autoevaluación: Hooks de React" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy"></iframe></div>` |

The English pages are the same URLs with `index.en.html` at the end; they are not part of this lesson.

**Why the ratio box (Q4).** With a fixed height of 576 a 760 px column showed the card 425.6 px tall with about 150 px of empty space around it. The ratio box, already used for the GenAI for Marketing S1 player (`embedRatio` in `deliverables.json`), has none. Dor chose it on 15 Nov 2026.

### Rise lesson order for Cowork

As the work-order plans it (section 8) and the storyboard lists it (section 7). Build it next to the old lesson «Autoaprendizaje - Hooks» in the course «ESP IA Desarrollador Full-Stack - React»; the old lesson stays live until Dor approves the new one. Never delete the old lesson.

| # | Rise block | Content |
|---|---|---|
| 1 | Video | The existing Spanish intro video of the current lesson (about 12 s), kept as is |
| — | (Q1, open) | Possibly one text line under the intro video. Not decided; do not add until Dor answers Q1 |
| 2 | Text / divider | «¡COMENZAMOS!» |
| 3 | Video | F1 useState: composition `AIFS-ReactHooks-T1-UseState-ES`, Vimeo: **not published yet** (127.8 s, measured in P2) |
| 4 | Embed | P-1 useState (row 1 of the embed table) |
| 5 | Continue | |
| 6 | Video | F2 useEffect, cuándo se ejecuta: `AIFS-ReactHooks-T2-UseEffect-ES`, Vimeo: **not published yet** (155.9 s) |
| 7 | Embed | P-2 useEffect (row 2) |
| 8 | Continue | |
| 9 | Video | F3 useEffect, limpieza: `AIFS-ReactHooks-T3-Cleanup-ES`, Vimeo: **not published yet** (136.7 s) |
| 10 | Embed | P-3 Limpieza (row 3) |
| 11 | Continue | |
| 12 | Video | F4 useRef: `AIFS-ReactHooks-T4-UseRef-ES`, Vimeo: **not published yet** (128.4 s) |
| 13 | Embed | P-4 useRef (row 4) |
| 14 | Continue | |
| 15 | Video | F5 Hooks personalizados: `AIFS-ReactHooks-T5-CustomHooks-ES`, Vimeo: **not published yet** (160.8 s) |
| 16 | Embed | P-5 Hooks personalizados (row 5) |
| 17 | Continue | |
| 18 | Embed | Check-in (row 6), closes the lesson |

Film lengths are from the P2 report (measured on the rendered files, run 43692109951, before the caption fix that is being re-rendered; the fix does not change film lengths, per P2).

### deliverables.json rows (for whoever next edits wawiwa-video; not written by this phase)

Add to `practices` in `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json`. The section name is new; `make-practice-pages.mjs` places an unknown section after the known ones, or add it to `SECTION_ORDER`.

```json
{"folder": "react-ss-hooks-es/p1-usestate", "title": "Práctica 1 · useState", "code": null, "section": "AI Full-Stack Developer · Español (React)", "url": "https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p1-usestate/", "embedHeight": 576, "embedRatio": "1000:560", "superseded": false},
{"folder": "react-ss-hooks-es/p2-useeffect", "title": "Práctica 2 · useEffect", "code": null, "section": "AI Full-Stack Developer · Español (React)", "url": "https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p2-useeffect/", "embedHeight": 576, "embedRatio": "1000:560", "superseded": false},
{"folder": "react-ss-hooks-es/p3-limpieza", "title": "Práctica 3 · Limpieza", "code": null, "section": "AI Full-Stack Developer · Español (React)", "url": "https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p3-limpieza/", "embedHeight": 576, "embedRatio": "1000:560", "superseded": false},
{"folder": "react-ss-hooks-es/p4-useref", "title": "Práctica 4 · useRef", "code": null, "section": "AI Full-Stack Developer · Español (React)", "url": "https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p4-useref/", "embedHeight": 576, "embedRatio": "1000:560", "superseded": false},
{"folder": "react-ss-hooks-es/p5-hooks-propios", "title": "Práctica 5 · Hooks personalizados", "code": null, "section": "AI Full-Stack Developer · Español (React)", "url": "https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p5-hooks-propios/", "embedHeight": 576, "embedRatio": "1000:560", "superseded": false},
{"folder": "react-ss-hooks-es/checkin", "title": "Autoevaluación: Hooks de React", "code": null, "section": "AI Full-Stack Developer · Español (React)", "url": "https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/checkin/", "embedHeight": 576, "embedRatio": "1000:560", "superseded": false}
```

`embedRatio` makes `make-practice-pages.mjs` print the ratio box; `embedHeight` stays as the measured value.

To pair each film with its practice on the embed sheet, set `"activity"` on the five film rows (branch `content/react-hooks-es`, all `null` today) to the `folder` above: T1 → `react-ss-hooks-es/p1-usestate`, T2 → `react-ss-hooks-es/p2-useeffect`, T3 → `react-ss-hooks-es/p3-limpieza`, T4 → `react-ss-hooks-es/p4-useref`, T5 → `react-ss-hooks-es/p5-hooks-propios`. Then `npm run pages` and check it prints `also refreshed in …`.

### Open questions (listed, not decided)

| # | Question | Where it is defined | Screens that would change |
|---|---|---|---|
| Q1 | A Rise text line under the intro video («Mira el video de cada hook y después practica.»), since the intro says "exercises first" and the lesson runs film → practice | `planning/STORYBOARD.md` section 9 | Rise only; possibly the return line on the last screen of each practice |
| S5 | Previous value: keep reading the ref during render, or keep it in state | STORYBOARD section 6.3 | P-4 screens 4 to 6 |
| S10 | An `ignore` flag in `useDataApi` for a URL that changes mid-request | STORYBOARD section 6.3 | P-5 screen 9 |
| S11 | `setIsLoading(true)` / `setError(null)` at the top of the effect, or the lint-clean alternative | STORYBOARD section 6.3 | P-5 screens 5 and 9 |

Decided: Q4, the ratio box (Dor, 15 Nov 2026). Decided earlier and not reopened: the solution behind «Ver solución» (Dor, 15 Nov 2026); the look of P-1 and the five films (Dor, 15 Nov 2026).

### Tools and how to rerun

In the throwaway lab (outside the repo; puppeteer-core and axe-core 4.10.2 installed): `/Volumes/WawiwaPRO-G40/.cache/react-hooks-p3/hooks-lab`. Copy the tool in, `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`, then:

- axe and embed height: `node p4.mjs <path to react-ss-hooks-es> <page folder> [en]` (`review/p4/tools/p4.mjs`)
- word counts and text source: `node review/p4/tools/textcheck.mjs <path to react-ss-hooks-es>` (no packages needed)
- fit: `node shots.mjs <path> <page folder> [en] check` (`review/p3/tools/shots.mjs`)
- snippets: `node run-tests.mjs <path>` (`review/p3/snippet-check/run-tests.mjs`)
