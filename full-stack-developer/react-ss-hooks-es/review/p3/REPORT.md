# P3 REPORT: React Hooks self-study (Spanish): the five practices and the check-in are built

15 Nov 2026 · Fable · committed locally on `main` of wawiwa-activities, nothing pushed.
Dor approved the look of P-1 on 15 Nov 2026 (his words in the main session: "מאושר", and then the option "הסרטים וגם P-1"). P-2 to P-5 and the check-in are built in that look. The first part of this phase (the taste gate, P-1 only) is commit `f8fed4d`.

## בעברית (לדור)

- **מה נבנה:** ארבעת התרגולים הנוספים (P-2 useEffect, P-3 Limpieza, P-4 useRef, P-5 Hooks personalizados) וה-check-in, בספרדית ובאנגלית, באותו מראה שאישרת ב-P-1. כל הטקסט נמצא בקובצי `strings`, והדפים נוצרים מהם באותו סקריפט build.
- **מה לראות:** צילום אחד לכל דף, מסך אחרי מסך מלמעלה למטה, ברוחב 680 וברוחב 1100. כולם בתיקייה `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es/review/p3/`:
  - קבצים ברוחב 680: `p2-680.png`, `p3-680.png`, `p4-680.png`, `p5-680.png`, `checkin-680.png`
  - קבצים ברוחב 1100: `p2-1100.png`, `p3-1100.png`, `p4-1100.png`, `p5-1100.png`, `checkin-1100.png`
  - הצילומים של P-1 שאישרת (`p1-680.png`, `p1-1100.png`) לא הוחלפו.
- **מה נבדק ועבר (נמדד):**
  - כל כרטיסי הקוד רצו באפליקציית Vite + React אמיתית, בשתי השפות: 26 כרטיסים, 156 בדיקות, 0 כשלים. הבדיקה קוראת את התשובה הצפויה מאותו קובץ טקסט, כך שטקסט שמבטיח משהו שהקוד לא עושה נכשל.
  - כל מצב של כל מסך (ריק, תשובה שגויה, תשובה נכונה, כל לשונית של קוד) נכנס למסגרת ברוחב 680 וברוחב 1100, בשתי השפות. אין בקשות מחוץ לתיקייה ואין שגיאות בקונסול.
  - אפשר לעבור כל דף מההתחלה עד הסוף במקלדת בלבד.
  - אין חריגה ממגבלות המילים של ה-Storyboard.
- **תיקון תוכן אחד מול ה-Storyboard:** ב-P-3 מסך 2, ההסבר לתשובה השגויה "להוסיף `[handleResize]` למערך" לא היה מדויק. הרצתי את הקוד: הדף נשבר עם השגיאה handleResize is not defined. כתבתי את ההסבר לפי מה שנמדד. הנוסח המקורי שמור בהערה בקובץ הטקסט, ואפשר להחזיר אותו בשורה אחת.
- **איפה סטיתי מה-Storyboard או הוספתי משהו** (פירוט באנגלית, בסעיף "Departures and additions"). אלה ההחלטות שכדאי שתעבור עליהן:
  1. תרגול P-2: מסך 3 ("הוראות + הדבקה") פוצל לשני מסכים, כמו בדף ה-Node של נוי, כי הוא לא נכנס למסך אחד. לכן ב-P-2 יש 8 מסכים ולא 7.
  2. סדר התשובות: ב-P-2 עד P-5 קבעתי סדר קבוע שבו התשובה הנכונה לא תמיד ראשונה. ב-check-in הסדר מתערבב בכל כניסה, כמו שה-Storyboard מבקש. את P-1 לא שיניתי.
  3. משפטים קצרים שהוספתי כי ל-Storyboard אין נוסח בשבילם (כותרות למסכי ההדבקה, הודעות "לא נמצא" ו"לא תואם", שורת החזרה של P-5). הרשימה המלאה למטה.
  4. משוב בלי הסבר: במקומות שבהם ה-Storyboard לא נותן הסבר לתשובה, מוצג רק «Correcto.» או «Incorrecto.». הרשימה למטה, למקרה שה-SME ירצה להוסיף נוסח.
  5. כרטיסי קוד: שמות ועימוד שונים מקובצי המעבדה של P0 כדי להיכנס לכרטיס (אותה התנהגות, נמדד שוב). כרטיס עם שורות ארוכות מקבל עמודה רחבה יותר, וכרטיס עם כמה קבצים מקבל לשוניות.
  6. תרגול P-5: בפתרון אין רכיב שמשתמש ב-`useDataApi` (ה-Storyboard מונה שלושה קבצים). אולי כדאי להוסיף.
- **מה לא נבדק:**
  - הפורמט המדויק שבו Chrome מעתיק את הקונסול. מסכי ההדבקה (P-2 מסך 4, P-3 מסך 5) נבדקו עם טקסט שאני הרכבתי, לא עם העתקה אמיתית מ-DevTools. צריך לבדוק פעם אחת ביד ב-P4.
  - בדיקת axe-core, הטמעה אמיתית ב-Rise, מדידת `embedHeight`, הגהה של דובר ספרדית וזמן לומד. כולם שייכים ל-P4.
- **השאלות הפתוחות (Q1, S5, S10, S11):** בניתי לפי ה-Storyboard כמו שהוא. הטבלה למטה אומרת אילו מסכים ישתנו בכל תשובה.
- **עוד לא נעשה:**
  - רישום התרגולים ב-`/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json` והרצת `npm run pages` שם. לא נגעתי בתיקייה הזאת בשלב הזה.
  - שלב P4 כולו.
- **סקיל או תדריך:** אחרי P4 כדאי להוסיף לפלאגין wawiwa-content-os תיאור של הפורמט הזה (תרגול מקובצי strings עם build משותף ושמונה סוגי מסכים), ו-Cowork יקבל את טבלת ההטמעה. כרגע לא צריך.
- **איפה זה שמור:** commit מקומי ב-`main` של `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities`. לא נדחף.
- **הצעד הבא:** אתה עובר על הצילומים ועל שש הנקודות למעלה. אחר כך P4.

פקודה אחת (פותחת את חמשת הדפים החדשים בדפדפן, מהדיסק, בלי push):

```bash
cd "/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es" && open p2-useeffect/index.html p3-limpieza/index.html p4-useref/index.html p5-hooks-propios/index.html checkin/index.html
```

## English

### Done

Six pages, each from its own `strings.es.js` and `strings.en.js` through `shared/build.mjs`:

| Page | Folder | Screens | Screen types, in order |
|---|---|---|---|
| P-1 useState (approved) | `p1-usestate/` | 5 | choice, steps, value, solution, takeaway |
| P-2 useEffect | `p2-useeffect/` | 8 | multi, multi, steps (with Copy), paste, steps, value, solution, takeaway |
| P-3 Limpieza | `p3-limpieza/` | 8 | choice, choice, steps, order, paste, choice, solution (2 files), takeaway |
| P-4 useRef | `p4-useref/` | 7 | multi, choice, steps, steps, value, solution (2 files), takeaway |
| P-5 Hooks personalizados | `p5-hooks-propios/` | 10 | choice (2 files), choice, steps, value, choice, choice, steps, value, solution (3 files), takeaway |
| Check-in | `checkin/` | 6 | five choice items, closing screen |

- **Engine:** `shared/practice.js` now has all eight screen types of storyboard 4.2. New in this part: `multi`, `order`, `paste`; a code card with several files (the file names are buttons in the card's title bar); a wider code column for cards with lines of 60 to 70 characters; the small line after the step name («Paso 1 · Predice: ¿cuándo se ejecuta?»); the check-in mode (no step pills, «Pregunta 2 de 5», options shuffled on every visit).
- **Text:** every learner-facing word is in the strings files. `practice.js` and `build.mjs` hold none.
- **Solution (Q2):** on every practice the solution is its own screen, reached only through «Ver solución», after the learner answered the screen before it.
- **P-1:** its strings did not change. Its two generated pages changed by one tag (each option's text now sits in a `<span>`, needed for options that mix code and words); its fit numbers are the same as at the gate, and its two approved screenshots were left as they are.

### Checks run (measured, 15 Nov 2026)

| Check | Result |
|---|---|
| Code cards run (section 7 of the work-order) | 26 cards (13 screens with code, Spanish and English), 156 checks, 0 failed. React 19.3.1, Vite 8.3.8, StrictMode on, headless Chrome. What each card showed: the table in `review/p3/snippet-check/README.md`; raw output: `review/p3/snippet-check/output.txt` |
| Texts against the code | The tests read what they expect from the same strings: the paste screens' expected lines, the value screens' expected answers, the right options, the order screen's answer. All agree with what ran |
| Fit at 680 px (frame 680 x 381) and 1100 px (frame 1100 x 616) | every state of every screen (fresh, each wrong answer the page knows, right answer, every file of a code card), both languages: content fits, no code line wider than its card, no cut text on a control, canvas fills the frame. Least room left at the design size: P-1 17 px, P-2 20 px, P-3 20 px, P-4 38 px, P-5 7 px (the `useDataApi.js` solution), check-in 78 px. Raw output: `review/p3/fit-output.txt` |
| Feedback and the way on | in each state the box shown is the one expected, and the next button is locked or open as designed |
| Requests outside the lesson folder | 0 on every page |
| Console errors | 0 on every page |
| Keyboard only | every screen of every page reached and answered with Tab, Space, Enter and typing; the focus lands on the heading when a screen opens and on the next button after a right answer; «Empezar de nuevo» returns to screen 1 with the answers cleared |
| Word limits (storyboard 4.1) | no warning printed by the build, in either language |
| Lint of the card files | the Vite template's oxlint, exit code 0, warnings only where the pages already say so: `RefVsState.jsx` and `PreviousValue.jsx` («Cannot access refs during render», the words the P-4 note quotes) and `useDataApi.js` («set-state-in-effect», the words the P-5 note quotes). No finding on any other card. The other lines in the file are the test's own variants. Raw output: `review/p3/snippet-check/lint-output.txt` |
| Code size on screen | 8.5 px at 680 wide, 13.7 px at 1100 wide (unchanged from P-1) |

**Not checked, not measured:**

- The text Chrome really gives when the console is selected and copied. The paste screens were tested with text I composed (each line with a file reference in front, with a repeat count in front, and with the repeat shown once). A learner's real copy has not been pasted into them. One manual try in P4.
- axe-core, the page inside a real Rise block, `embedHeight` by the repo rule, a native Spanish proofreading pass, learner time, any phone width (all P4).
- Verified in headless Chrome, not in the app's preview pane, because that needs a row in `.claude/launch.json`, which this phase leaves alone.

### One content correction against the storyboard

P-3 screen 2, the wrong option «Agregar `[handleResize]` al arreglo». The storyboard's feedback is «`handleResize` se crea en cada efecto; eso no quita el listener viejo.» I ran the card with that change: `handleResize` lives inside the effect, so the array cannot see it and the page stops with "handleResize is not defined" (raw output, both languages). The feedback now says that: «`handleResize` solo existe dentro del efecto. En el arreglo da el error «handleResize is not defined» y la página se rompe.» The storyboard's sentence is kept in a comment beside it in `p3-limpieza/strings.es.js`. `planning/STORYBOARD.md` itself was not edited (another session owns it).

### Departures and additions

Where the storyboard says nothing, or what it says does not fit one screen. Each is easy to change in the strings.

1. **P-2 screen 3 is two screens.** The storyboard has one screen of type "steps + paste". Four steps, an 18-line code card with Copy, a paste box and the comparison do not fit 1000 x 560. Built as the Node page does it: a run screen (steps and the card), then a paste screen. P-2 has 8 screens. Step 4 became «Copia la consola: la pegas en la siguiente pantalla.» (storyboard: «Copia la consola y pégala aquí.»).
2. **Order of the options.** The storyboard lists the right answer first almost everywhere. P-2 to P-5: a fixed order in the strings, with the right answer in different places. Check-in: listed right-first in the strings and shuffled on every visit, as the storyboard asks. P-1: unchanged (3, 6, 0).
3. **Text I wrote, because a screen needs it and the storyboard has none** (Spanish; the English files carry the same):
   - Shared labels: «Revisa cada opción e inténtalo de nuevo.» (multi, under «Incorrecto.»), «Quita una línea e inténtalo de nuevo.» (order), «Consola», «quitar», «Tu consola», «Comparar», «Lo esperado», «Lo que pegaste», «Coincide.», «No se encontró salida.», «Pregunta … de …», «Archivos» (screen readers only).
   - P-2: heading of the run screen «Ejecuta el componente en Cursor y mira la consola.»; heading of the paste screen «Pega aquí tu consola y compárala con lo esperado.»; row labels «Al montar», «Clic en +1», «2 letras»; «Recarga, haz un clic en +1, escribe 2 letras y copia toda la consola.» (pasted lines do not match); «Copia toda la consola, con las líneas A, B y C, y pégala de nuevo.» (no known line found). The three option texts are the three lines the component prints.
   - P-3: «Haz clic en las líneas en ese orden.» added to the order question; heading of the paste screen «Pega tu consola completa, desde la recarga.»; row labels «Al cargar», «Al ocultar», «Al mostrar»; «Recarga, espera 3 segundos, oculta, muestra y copia toda la consola.» (pasted lines do not match).
   - P-4: «Lo medido es 4. Compara tu código con la solución.» for any number other than 4, 5 or undefined, so the learner is not left with no reply.
   - P-5: the return line «Continúa abajo con la autoevaluación.» (P-2 to P-4 reuse P-1's «Continúa abajo con el siguiente video.»).
4. **Feedback with a verdict only.** Where the storyboard gives no explanation, the box shows «Correcto.» or «Incorrecto.» alone:
   - right answers: P-2 screen 6 (the name), P-3 screen 2, P-4 screen 5, P-5 screens 4 and 8, the paste screen of P-2 («Coincide.», with the StrictMode note beside it);
   - wrong options: P-4 screen 2 (both), P-5 screen 2 (both), P-5 screen 6 («Nada: `fetch` nunca falla»), and every wrong option of the check-in (its one explanation per item shows with the right answer).
5. **Code cards differ in form from the P0 lab files; all were run again.**
   - `ThreeEffects.jsx` (P-2): each effect on one line, so 18 lines fit beside the question; its longest line is 70 characters, which is what the wide card holds.
   - `WindowSize.jsx` (P-3): the lab name `ResizeNoCleanup` would give the answer away.
   - `RefVsState.jsx` (P-4): `count` / `setCount`, the same names as the screen before it; the render counter of the lab file is left out.
   - `FocusInput.jsx` (P-4): named as the step asks (the lab file is `FocusTask`).
   - `Timer.jsx` + `App.jsx` (P-3), `Greeting.jsx` (P-5): default exports, no test ids; the greeting's `<input>` is on four lines.
   - Every solution file starts with its imports.
6. **Layouts added.** A card with a line of 60 to 70 characters takes two thirds of the width (P-2 screens 1 to 3, P-4 screens 2 and 6, P-5 screens 1 and 9). A solution card too tall to sit under its heading takes the full height with the heading beside it (P-5 screen 9 only). Several files in one card are tabs (P-3 screen 7, P-4 screen 6, P-5 screens 1 and 9).
7. **What opens the next screen.** choice, multi, order: only the right answer. value: the expected answer or any wrong one the page has a hint for; on P-2 screen 6, P-4 screen 5 and P-5 screen 4 that is any typed answer, so a learner whose build differs can still reach the solution (Q2: "after the learner answered"). paste: once the page finds at least one console line it knows, matching or not.
8. **Paste comparison.** Chrome shows a repeated console line once with a count. A count at the start of a line is read as that many lines, and two equal lines in a row count as one when the pasted text is compared. So on P-2, typing 3 letters instead of 2 still matches.
9. **P-5 has two rounds.** It holds two tasks, so the step pills go 1, 1, 2, 3 and then back to 1, 1, 2, 3 (screens 5 to 8), as the storyboard orders the screens.
10. **P-5 solution has no component that uses `useDataApi`.** The storyboard lists `useLocalStorage`, the greeting and `useDataApi`. The hook was run through a test-only component. A fourth file would fit as a tab; not added.
11. **Check-in.** The intro line sits in the header under the title (no start screen). The closing screen has the line «Terminaste la lección.» and «Empezar de nuevo», nothing else.
12. **Lint.** `RefVsState.jsx` (P-4 screen 2) reads `refClicks.current` while rendering, on purpose: it is the demonstration. P0's lint flags it with the same rule as the previous-value pattern (SME question S5).

The seven design questions of the taste gate (heading font, scaling up, option order in P-1, when «Ver solución» opens, added words, the reformatted P-1 card, empty space on short screens) were covered by Dor's approval of the look as built; the gate report is in commit `f8fed4d`.

### Open questions from the storyboard: which screens change

Built on the storyboard as written. Screen numbers are the built ones (P-2 has 8).

| Question | Screens that would change |
|---|---|
| **Q1** (order: film then practice, or exercises first) | The return line on the last screen of every practice: P-1 screen 5, P-2 screen 8, P-3 screen 8, P-4 screen 7, P-5 screen 10. Nothing else. |
| **S5** (previous value: keep reading the ref during render, or keep it in state) | P-4 screen 4 (the task steps), screen 5 (the expected value and its hints), screen 6 (the `PreviousValue.jsx` solution and its lint note); possibly the wording of screen 7. P-4 screen 2 also reads a ref during render, as a demonstration. |
| **S10** (add an `ignore` flag for a URL that changes mid-request) | P-5 screen 9 (the `useDataApi.js` solution). |
| **S11** (`setIsLoading(true)` / `setError(null)` at the top of the effect, or the lint-clean alternative) | P-5 screen 9 (the solution and its note) and P-5 screen 5 (the prediction about leaving out `setError(null)`), which would need rewriting if the alternative is taught. |

P-1, P-2, P-3 and the check-in do not depend on S5, S10 or S11.

### Still to do

- Register the six pages in `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json` and run `npm run pages` there (rule in `wawiwa-activities/CLAUDE.md`). Not done: this phase does not touch that repo.
- P4: axe-core, `embedHeight` at 1000 and 760 px, one real console paste into P-2 and P-3, the proofreading pass, timing one practice, the embed table. By construction the frame is 1000 x 560; the embed code is not final until P4 measures it.
- The pages go live under `https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/` only after Dor pushes `main` and the Pages deploy succeeds. They are not embedded anywhere.

### How to rebuild and recheck

From `full-stack-developer/react-ss-hooks-es/`:

```bash
for p in p1-usestate p2-useeffect p3-limpieza p4-useref p5-hooks-propios checkin; do node shared/build.mjs $p && node shared/build.mjs $p en; done
```

The snippet check and the screenshots need a throwaway Vite app outside the repo: `review/p3/snippet-check/README.md`, and the header of `review/p3/tools/shots.mjs` (`node shots.mjs <lesson folder> <page folder> [lang] [check]`).
