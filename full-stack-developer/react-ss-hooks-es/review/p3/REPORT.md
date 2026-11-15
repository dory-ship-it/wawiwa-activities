# P3 REPORT (taste gate): React Hooks self-study (Spanish): practice P-1 built

15 Nov 2026 · Fable · committed locally on `main` of wawiwa-activities, nothing pushed. Only P-1 is built. The other four practices and the check-in wait for Dor's approval of the look.

## בעברית (לדור)

- **מה נבנה:** תרגול אחד בלבד, P-1 (useState), בספרדית ובאנגלית. כל הטקסט נמצא בקובצי `strings`, והדף נוצר מהם בסקריפט build משותף. עצרתי כאן, כמו שפקודת העבודה דורשת, כדי שתאשר את המראה לפני ארבעת התרגולים האחרים וה-check-in.
- **מה לראות (5 דקות):**
  - צילום ברוחב 680: `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es/review/p3/p1-680.png`
  - צילום ברוחב 1100: `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es/review/p3/p1-1100.png`
  - בכל צילום שמונה מצבים מלמעלה למטה: מסך 1 ריק, תשובה שגויה, תשובה נכונה, מסך 2 (המשימה), מסך 3 עם תשובה לא תואמת, מסך 3 עם התשובה הצפויה, מסך 4 (הפתרון), מסך 5 (סיכום).
  - כדי לנסות את התרגול עצמו בדפדפן, בלי push, הפקודה למטה פותחת אותו מהדיסק.
- **המראה:** הכרטיס הכהה של דפי ה-Node של נוי: לוגו, שלושת השלבים בכותרת, כרטיס קוד עם מספרי שורות, כפתור אדום, משוב בירוק, פס התקדמות למטה.
- **הפתרון:** מופיע במסך נפרד, ונפתח רק מהכפתור «Ver solución» שבמסך ההשוואה, אחרי שהלומד ענה (ההחלטה שלך ב-Q2).
- **מה נבדק ועבר:**
  - שני כרטיסי הקוד רצו באפליקציית Vite + React אמיתית, בספרדית ובאנגלית: 6 קבצים, 0 כשלים.
  - התוכן נכנס למסגרת ברוחב 680 וברוחב 1100, בשתי השפות. הגופנים נטענים, ואין אף בקשה מחוץ לתיקייה.
  - אפשר לעבור את כל התרגול במקלדת בלבד.
  - כל הטקסטים בתוך מגבלות המילים של ה-Storyboard.
- **מה לא נבדק:** axe-core (שלב P4), הטמעה אמיתית בתוך Rise, הגהה של דובר ספרדית, והזמן שלוקח ללומד. לא מדדתי אף אחד מהם.
- **גודל הקוד ברוחב 680:** האותיות בכרטיס הקוד יוצאות 8.5 פיקסלים על המסך (נמדד). זה קטן. ברוחב 1100 הן 13.7 פיקסלים.
- **שבע שאלות עיצוב שמחכות לך** (פירוט באנגלית, בסעיף "Design questions"). לא החלטתי בהן לבד מעבר למה שנדרש כדי לבנות מסך אחד:
  1. גופן הכותרות: Assistant (לפי ה-Storyboard ומערכת העיצוב) ולא Roboto כמו בדפי ה-Node.
  2. ברוחב 1100 הכרטיס גדל וממלא את המסגרת (בדפי ה-Node הוא לא גדל).
  3. סדר התשובות: ב-Storyboard התשובה הנכונה רשומה ראשונה כמעט בכל שאלה. ב-P-1 בניתי בסדר שכתוב (3, 6, 0).
  4. במסך ההשוואה, «Ver solución» נפתח אחרי כל תשובה שהדף מכיר (sí או no), גם אם היא לא הצפויה.
  5. מילים שהוספתי ואינן ב-Storyboard (תוויות וכותרות קצרות). הרשימה המלאה למטה.
  6. כרטיס הקוד במסך 1 עוצב מחדש כדי להיכנס לרוחב הכרטיס (אותה התנהגות, נבדק שוב).
  7. מסכים 2, 3 ו-5 קצרים ומשאירים שטח ריק בתחתית הכרטיס.
- **השאלות הפתוחות (Q1, S5, S10, S11):** בניתי לפי ה-Storyboard כמו שהוא. ב-P-1 רק Q1 משנה משהו: השורה האחרונה במסך 5. הטבלה המלאה למטה.
- **עוד לא נעשה:**
  - ארבעת התרגולים האחרים וה-check-in (אחרי האישור שלך).
  - רישום התרגולים ב-`/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json` והרצת `npm run pages` שם. לא נגעתי בתיקייה הזאת בשלב הזה.
  - מדידת `embedHeight` לפי הכלל של התיקייה (שלב P4).
- **סקיל או תדריך:** כרגע לא צריך. אחרי P4 כדאי להוסיף לפלאגין wawiwa-content-os תיאור של הפורמט הזה (תרגול מקובצי strings עם build משותף), ו-Cowork יקבל את טבלת ההטמעה.
- **איפה זה שמור:** commit מקומי ב-`main` של `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities`. לא נדחף.
- **הצעד הבא:** אתה מסתכל על שני הצילומים ועונה על שבע השאלות (או כותב "מאושר כמו שהוא"). אחר כך נבנים P-2 עד P-5 וה-check-in.

פקודה אחת (פותחת את התרגול בדפדפן, מהדיסק, בלי push):

```bash
open "/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p1-usestate/index.html"
```

## English

### Done

1. **P-1 useState**, five screens, as in `planning/STORYBOARD.md` section 4.3:

   | # | Type | What it is |
   |---|---|---|
   | 1 | choice | Paso 1 · Predice: the counter that calls `setCount(count + 1)` twice; options 3, 6, 0; retry allowed; Continue only after the right one; then the `c => c + 1` line |
   | 2 | steps | Paso 2 · Ejecuta en Cursor: the task word for word, four steps, «Lo construí» |
   | 3 | value | Paso 3 · Compara: type sí or no; "si" equals "sí" (trimmed, lower case, accents and a closing dot ignored) |
   | 4 | solution | `src/ShowHideMessage.jsx` with its import and Copy, and the note. Reached only through «Ver solución» on screen 3 |
   | 5 | takeaway | three points, the return line, «Empezar de nuevo» |

2. **Files** (all under `full-stack-developer/react-ss-hooks-es/`):
   - `shared/build.mjs`, `shared/practice.css`, `shared/practice.js`, `shared/strings.es.js`, `shared/strings.en.js`, `shared/fonts/` (six files copied from `fs-final-project/shared/fonts/`), `shared/wawiwa-logo.png` (copied from `fs-final-project/shared/`).
   - `p1-usestate/strings.es.js`, `p1-usestate/strings.en.js`, and the generated `p1-usestate/index.html` (Spanish) and `p1-usestate/index.en.html` (English).
   - `README.md` (how to edit, translate and rebuild).
   - `review/p3/`: this report, `p1-680.png`, `p1-1100.png`, `fit-output.txt`, `snippet-check/` (runner, README, output), `tools/shots.mjs` (retakes the screenshots and reruns the fit and keyboard checks).
3. **Text:** every learner-facing word is in the four strings files. `practice.js` and `build.mjs` hold none: the build writes all screens, options and feedback boxes into the page, and the script only shows and hides them.
4. **Engine scope:** `practice.js` has the five screen types P-1 uses (choice, steps, value, solution, takeaway). The other three in the storyboard (multi, order, paste) are not built yet; they come with P-2 and P-3 after the look is approved.

### Checks run (measured, 15 Nov 2026)

| Check | Result |
|---|---|
| Code cards run (section 7 of the work-order) | 6 card files (2 cards + the updater variant, Spanish and English), 0 failed checks. `Counter.jsx`: 0 at mount, 3 after 3 clicks; with `setCount((c) => c + 1)` twice: 6. `ShowHideMessage.jsx`: visible at mount, hidden after 1 and 3 clicks, visible after 4. No console errors or warnings. React 19.3.1, Vite 8.3.8, StrictMode on. Raw output: `review/p3/snippet-check/output.txt` |
| Lint of the card files | the Vite template's oxlint 1.93.0: exit code 0, nothing printed |
| Fit at 680 px (frame 680 x 381) and 1100 px (frame 1100 x 616) | all 8 states, both languages: content fits (tallest screen needs 407 of 424 px at the design size), no code line wider than its card, no cut button text, canvas fills the frame. Raw output: `review/p3/fit-output.txt` |
| Fonts | Assistant and JetBrains Mono load from `shared/fonts/` (checked over http and from disk) |
| Requests outside the lesson folder | 0 |
| Keyboard only | all five screens reached and answered with Tab, Enter and typing; a disabled Continue is skipped; «Empezar de nuevo» clears the answers |
| Word limits (storyboard 4.1) | Spanish: question 22 and 17 words (limit 35); feedback boxes 22, 19, 15, 10, 14 and the note 23 (limit 30); four steps of 14, 12, 3, 8 words (limit 20). English is within the limits too. The build prints a warning for any breach; none printed |
| Code size on screen | 8.5 px at 680 wide, 13.7 px at 1100 wide (12.5 px at the design size, times the scale) |

**Not checked, not measured:** axe-core (P4), the page inside a real Rise block, `embedHeight` by the repo rule (P4), a native Spanish proofreading pass (P4), learner time (P4), any phone width. I verified in headless Chrome, not in the app's preview pane, because that needs a row in `.claude/launch.json`, which this phase must leave alone.

Screenshots are taken at 2x pixel density (the 680 image is 1360 px wide, the 1100 image 2200 px), so small text looks as it does on a Retina screen.

### Design questions (the taste gate)

Each is a place where the sources disagree or say nothing. What is built is stated first; nothing here is final.

1. **Heading font.** Built: Assistant for all text, JetBrains Mono for code, which is what the storyboard says to copy from `fs-final-project/shared/` and what the design system locks for screens. The Node `-es` pages set headings, buttons and labels in Roboto. So the look is the Node look with a different heading face. Keep Assistant, or add Roboto to match Noy's pages exactly?
2. **Scaling up.** Built: one 1000 x 560 canvas scaled to the frame in both directions, as the work-order says ("fixed canvas scaled to the Rise frame") and as `fs-final-project` does. At 1100 wide everything is 10% larger. The Node pages only scale down and stop growing at 1060 px. The storyboard's wording ("scaled down with `fit()` below that") can be read either way.
3. **Order of the options.** The storyboard lists the right answer first in almost every choice screen of P-1 to P-5 (and says "shuffle on screen" only for the check-in). P-1 is built in the written order: 3, 6, 0. If every practice opens with the right answer on top, learners will notice. Options: a fixed order per question chosen in the strings file, or a shuffle on each load.
4. **When «Ver solución» opens.** Built: after any answer the page knows (sí or no). A learner whose build is wrong gets the hint and can still open the solution. The alternative is to open it only after the expected answer, as the choice screen does with Continue.
5. **Words added that are not in the storyboard.** All are in `shared/strings.es.js` or `p1-usestate/strings.es.js`:
   - header: «Práctica 1 · useState» and the line under it «Predice, ejecuta en Cursor y compara.»
   - labels: «Tu tarea», «Tu respuesta»
   - buttons: «Continuar»; «Comprobar» (in the storyboard for another screen type); «Copiar», «Copiado», «Empezar de nuevo» (from the Node pages)
   - the bold first line of a feedback box: «Correcto.» and «Incorrecto.» (the storyboard's own first words, split off as on the Node pages), and «No coincide.» for the value screen's hint, which the storyboard gives with no verdict word
   - screen titles: «Una solución posible» (screen 4), «En resumen» (screen 5)
   - the value screen's line for an answer that is neither word: «Escribe sí o no.» (taken from the question itself)
   - one wording change: the storyboard's «Correcto: 3 clics invierten…» is shown as the bold «Correcto.» and then «3 clics invierten…»
6. **The code card on screen 1.** The lab component (`DoubleClickPredict`) has an 87-character line; the card holds about 60 at the design size. Built: the same logic with the two calls in a named `handleClick`, the component called `Counter`, the button labelled «Sumar», the two `setCount` lines highlighted. It was run again (table above). The solution card likewise uses `export default` and has no test ids.
7. **Empty space.** Screens 2, 3 and 5 are short and leave the lower part of the card empty (visible in both screenshots). The Node pages do the same on their short screens. Leave it, or enlarge the text on short screens?

Smaller points, built as on the Node pages unless noted: no Back button (only «Empezar de nuevo» at the end); progress is not saved across a reload; the small "1 de 2" counter the Node pages show beside the step name is left out, because the footer already shows "1 / 5".

### Open questions from the storyboard: which screens change

Built on the storyboard as written. If the answers differ:

| Question | Screens that would change |
|---|---|
| **Q1** (order: film then practice, or exercises first) | The last line of the takeaway screen in every practice («Continúa abajo con el siguiente video.»): P-1 screen 5, P-2 screen 7, P-3 screen 8, P-4 screen 7, P-5 screen 10. In P-1 nothing else. |
| **S5** (previous value: keep reading the ref during render, or keep it in state) | P-4 screen 4 (the task steps), screen 5 (the expected value and its two hints), screen 6 (the solution code and its lint note); possibly the wording of P-4 screen 7. |
| **S10** (add an `ignore` flag for a URL that changes mid-request) | P-5 screen 9 (the `useDataApi` solution code). |
| **S11** (`setIsLoading(true)` / `setError(null)` at the top of the effect, or the lint-clean alternative) | P-5 screen 9 (the solution code and its note), and P-5 screen 5 (the prediction about leaving out `setError(null)`), which would need rewriting if the alternative is taught. |

P-1 and the check-in do not depend on S5, S10 or S11.

### Still to do

- P-2 to P-5 and the check-in, with the three remaining screen types, after Dor approves the look.
- Register the practices in `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json` and run `npm run pages` there (rule in `wawiwa-activities/CLAUDE.md`). Not done: this phase does not touch that repo.
- P4: axe-core, `embedHeight` at 1000 and 760 px, the proofreading pass, timing one practice, the embed table. By construction the frame is 1000 x 560; the embed code is not final until P4 measures it.
- The page goes live at `https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/react-ss-hooks-es/p1-usestate/` only after Dor pushes `main` and the Pages deploy succeeds. It is not embedded anywhere.

### How to rebuild and recheck

```bash
node shared/build.mjs p1-usestate && node shared/build.mjs p1-usestate en
```

Run from `full-stack-developer/react-ss-hooks-es/`. The snippet check and the screenshots need a throwaway Vite app outside the repo: `review/p3/snippet-check/README.md`, and the header of `review/p3/tools/shots.mjs`.
