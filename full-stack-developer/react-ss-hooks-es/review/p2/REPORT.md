# P2 REPORT: React Hooks self-study (Spanish): the five films as content

13 Nov 2026 · Fable · committed locally in two repos, nothing pushed, nothing rendered with voice, nothing published.

## בעברית (לדור)

- **מה נעשה:** חמשת הסרטים בספרדית נכתבו כקובצי תוכן בסטודיו הווידאו, נרשמו, וסרט הבדיקה של המנוע נמחק. שום קובץ מנוע (`.tsx` של המנוע או סקריפט) לא נגע.
- **הקוד בסרטים:** הועתק מהטיוטה של P0 ולא הוקלד מחדש. בדיקה אוטומטית מאשרת שכל שורת קוד, כל פאנל פלט וכל כרטיס תרגול זהים לטיוטה.
- **הקלדה חיה:** לכל אחד מ-25 צעדי הקוד נבחרו בכוונה השורות שמוקלדות. לפני ההקלדה תמיד רואים קוד שלם (בלוקים שלמים). ה-planner רץ נקי על חמשת הסרטים, בלי אף אזהרה של "הקלדה בלי קול".
- **אורכים לפי חישוב ה-planner (לא רינדור):** 127.8, 155.8, 136.7, 128.4 ו-160.8 שניות. סך הכול 709.5 שניות, כלומר 11.8 דקות. היעד היה 10 עד 12 דקות, וכל סרט בין 2 ל-3 דקות.
- **שש שורות שונות מהטיוטה:** חמש שורות קריינות וכתובית אחת. כולן שונו בגלל מראה ההקלדה, והן רשומות למטה עם הנוסח הקודם.
- **מה לא נעשה:** רינדור עם קול ב-GitHub Actions. הוא דורש push, והוא שלך. האורכים האמיתיים יהיו ידועים רק אחרי הריצה.
- **מה לא נבדק:** אף אחד לא שמע את הסרטים ואף אחד לא ראה אותם בתנועה. ראיתי 15 תמונות בודדות בלי קול, שלוש מכל סרט. הספרדית לא עברה הגהה של דובר.
- **מחכה לך:**
  1. להריץ את פקודת ה-push שלמטה. היא מפעילה לבד את "Voice and render" על חמשת הסרטים (7,553 תווי קריינות ב-ElevenLabs).
  2. לצפות בחמשת הסרטים לפני כל פרסום.
  3. שלוש ההחלטות מסעיף 9 ב-Storyboard עדיין פתוחות, וגם שאלות ה-SME (S5, S10, S11). הסרטים נבנו לפי ה-Storyboard כמו שהוא. הפירוט בסעיף "Open questions".
  4. שאלת עיצוב אחת חדשה בסרט 5 (למטה, "Design questions").
- **שים לב:** ה-`main` המקומי של `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video` מקדים את GitHub ב-commit אחד של תיעוד (`d542141`). הענף החדש נחתך ממנו וכולל אותו, כך שהריצה לא תלויה בו.
- **איפה זה שמור:**
  - הסרטים: commit `061a2b4` בענף `content/react-hooks-es`, בתיקייה `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video`. לא נדחף ולא מוזג ל-`main`.
  - הדוח והתמונות: commit ב-`/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities`, בתיקייה `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es/review/p2`. לא נדחף.
- **הצעד הבא:** אתה דוחף וצופה. אחרי האישור שלך: P3 (התרגולים) על Fable. שום דבר לא עולה ל-Vimeo בלי אישור שלך.

פקודה אחת (דוחפת את ענף הסרטים ואת הדוח):

```bash
git -C "/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video" push -u origin content/react-hooks-es && git -C "/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities" push
```

## English

### Done

1. **Five content files** in `wawiwa-video/src/content/`, poured from `planning/films-draft.es.json` by a script, so the code is copied and never retyped:

   | Film | Content file | Composition |
   |---|---|---|
   | F1 useState | `aifs-react-hooks-t1-usestate-es.json` | `AIFS-ReactHooks-T1-UseState-ES` |
   | F2 useEffect: cuándo se ejecuta | `aifs-react-hooks-t2-useeffect-es.json` | `AIFS-ReactHooks-T2-UseEffect-ES` |
   | F3 useEffect: limpieza | `aifs-react-hooks-t3-cleanup-es.json` | `AIFS-ReactHooks-T3-Cleanup-ES` |
   | F4 useRef | `aifs-react-hooks-t4-useref-es.json` | `AIFS-ReactHooks-T4-UseRef-ES` |
   | F5 Hooks personalizados | `aifs-react-hooks-t5-custom-hooks-es.json` | `AIFS-ReactHooks-T5-CustomHooks-ES` |

2. **Voice and rate, as P1 decided.** Every file: `voiceId` Angie (`eeTcHFmLuUzCOHvnwvdr`), `charsPerSecond` 13, `voice` `{stability 0.5, style 0.15, similarity_boost 0.8, speed 1.06}`. The old voice id appears in none of them.
3. **Registered** in `aifsFilms` in `src/Root.tsx` and as five rows in `deliverables.json` → `videos`: `program` `aifs`, `status` `awaiting-approval`, `vimeo` null. The style row `styles.aifs` was not touched.
4. **The engine test film is deleted**, as its `hold` note said: content file, `videos` row, `aifsFilms` entry. `docs/code-beat.md` now says so and records two things learned (below).
5. **Badge** `CASO FICTICIO` on every film (Valeria and Foco are invented), and a `_source` note in each file naming the lab component every code card ran as.

### How `typed` was chosen

The rule from `docs/code-beat.md`: what is on screen before the typing is believable code, whole blocks, and the typed characters are about as many as the narration's. Beat numbers are the planner's (first beat is 0).

| Film · beat | Card | Typed lines (characters) | On screen before the typing |
|---|---|---|---|
| F1 · 2 | `Foco.jsx`, the `let` counter | 2, 5–8 (113) | The empty component: `function`, `return`, `<div>` |
| F1 · 4 | `Foco.jsx`, with `useState` | 1, 2, 4 (79) | The component with its `<p>`, no state yet |
| F1 · 5 | same card | 8–10 (63) | adds the button |
| F1 · 6 | toggle | 1, 2, 5–7 (160) | `return ( <div> </div> );` |
| F1 · 7 | same card | 8 (35) | adds the conditional line |
| F2 · 2 | `useEffect` skeleton | 1–3 (54) | An empty file |
| F2 · 4 | fetch, no array | 3–7 (133) | The state line |
| F2 · 6 | fetch, with `[]` | 8, 9 (78) | State and the finished effect; the beat points at `}, []);` and types the `return` |
| F2 · 8 | title effect | 1–3 (76) | An empty file |
| F3 · 1 | timer, no cleanup | 4–7 (72) | State and an empty effect |
| F3 · 3 | the same card, again | none | The whole card; the beat points at `console.log('tic')` |
| F3 · 5 | timer with cleanup | 3–9 (135) | The effect with its first `console.log` (as in the P1 test film) |
| F3 · 6 | same card | none | points at the updater line |
| F3 · 7 | scroll listener | 2–4 (161) | An empty effect |
| F4 · 2 | `NuevaTarea.jsx` | 4, 10 (92) | The import and the empty component |
| F4 · 3 | same card | 5–7, 11 (103) | adds `handleFocus` and the button |
| F4 · 4 | previous value, `let` | 2–8 (103) | The state line |
| F4 · 5 | previous value, `useRef` | 2, 5, 8 (131) | State and an empty effect |
| F5 · 2 | `useDocumentTitle` | 1–6, 8 (138) | The comment `// en Foco.jsx` |
| F5 · 4 | `useLocalStorage` | 2–9 (184) | The empty function |
| F5 · 5 | same card | 10–13 (139) | adds the effect and the `return` |
| F5 · 6 | `Saludo.jsx` | 1, 2 (56) | The `return` block |
| F5 · 7 | `useDataApi` | 2–4, 17 (163) | The function with its effect, without the three states (see "Design questions") |
| F5 · 8 | same card | 10 (52) | The original, without the `res.ok` check |
| F5 · 9 | same card | 15 (36) | The chain without `.finally` |

### What differs from the draft, and why

Code lines, `hl`, output panels and practice-card text are identical to the draft (checked by script). These six lines differ:

| Film · beat | Draft | Now | Why |
|---|---|---|---|
| F1 · 2 `say` | Su primer intento usa una variable normal. Hace clic tres veces, y la pantalla sigue diciendo cero. | Su primer intento usa una variable normal, y un botón que le suma uno. Hace clic tres veces, y la pantalla sigue diciendo cero. | The beat types the variable and the button; the line now covers both and gives the typing time. |
| F2 · 5 caption | fetch → setPartner → render → fetch → … | fetch, setPartner, render… y otra vez fetch. | No arrows in body text (house writing rule), and the arrow glyph is outside the caption font's subset, so it could differ between this Mac and CI. |
| F5 · 2 `say` | …mueve el efecto del título a useDocumentTitle, y… | …mueve el efecto del título a una función nueva, useDocumentTitle, y… | The beat types a whole small hook; three more words keep the typing at a natural pace. |
| F5 · 4 `say` | …una sola vez, al crear el estado. | …una sola vez, al crear el estado. Si no hay nada, o si la lectura falla, usa el valor inicial. | The beat types the `try`/`catch` block, which the draft never mentioned. The added sentence is what lines 5 and 7 do (measured in P0: a broken value falls back to the initial one). |
| F5 · 7 `say` | Recibe una URL y devuelve tres cosas: … | Recibe una URL, guarda tres estados y los devuelve juntos: … | The beat types the three `useState` lines and the `return`. |
| F5 · 8 `say` | A las cuatro, Valeria prueba una URL equivocada, y no aparece ningún error. fetch solo falla cuando no hay red: un cuatro cero cuatro llega como una respuesta normal. Por eso ahora revisa la propiedad ok de la respuesta. | A las cuatro, Valeria agrega una línea. Había probado una URL equivocada, y no apareció ningún error: fetch solo falla cuando no hay red, y un cuatro cero cuatro llega como respuesta normal. Ahora revisa la propiedad ok. | Typing starts when a beat starts. In the draft's order the fix would be typed in the beat's first seconds, and the voice reaches it only in the last sentence. Same facts, reordered. |

One structural change: **F3 beat 3** is `sameCard` in the draft, but a caption stands between it and its card, and the planner refuses a `sameCard` beat that does not follow a code beat. It now brings the same card again (copied lines, `"typed": []`) and points at line 5.

Layout options set (data, not design): caption sizes; `width` and `colFlex` on the two tables; `guardLine: null` on all five practice cards; `titleSize` 56, 52 and 64 on the practice cards of F3, F4 and F5.

### Numbers

| | | How |
|---|---|---|
| F1 useState | 3,834 frames, 127.8 s | planner arithmetic at 13 chars/s, not a render |
| F2 useEffect: cuándo se ejecuta | 4,675 frames, 155.8 s | same |
| F3 useEffect: limpieza | 4,101 frames, 136.7 s | same |
| F4 useRef | 3,852 frames, 128.4 s | same |
| F5 Hooks personalizados | 4,823 frames, 160.8 s | same |
| **Total** | **21,285 frames, 709.5 s, 11.8 min** | target 10 to 12 min; P0 estimated 11.0 min at the English rate |
| Narration to be read by ElevenLabs | 7,553 characters | sum of the `say` lines |
| Longest `say` line | 220 characters (F5 beat 8) | the frame is sized for about 220 |
| Code beats | 25, none flagged by the planner | `npm run plan` on each file |
| Real lengths with voice | not measured | needs the "Voice and render" run |

### Checked

- `npx tsc --noEmit` passes.
- `npm run plan` runs clean on all five films: no beat is flagged for typing with no voice.
- The CI guards of "Voice and render" pass when run locally with the workflow's own `jq` and `grep` lines: every row is registered, every content file exists, the programme has a style row, no picture is referenced.
- `npm run clean:audio` before the commit: nothing to clean.
- By script: every code card, `hl`, output panel and practice card equals the draft; no `say` line is over 220 characters; no arrow or em dash in any `say` or caption.
- 15 silent stills, three per film, rendered locally and looked at (`stills/` in this folder): the two tables show every cell whole, the 78-character line and the 18-line file fit, the three long practice-card titles fit on one line, the badge and labels are right.

### Not checked

- **Sound.** No voice was generated. Nobody has heard a line; Claude cannot hear. Whether the rate of 13 holds on full films is known only from the run's "TIMING WARNINGS".
- **Motion.** Stills only. Nobody has watched the typing, the camera or the output panels play.
- **Spanish proofreading by a speaker.** The six changed lines are mine and have had no second reader. P4 has a proofreading pass.
- **The snippets were not run again.** They are byte-identical to what P0 ran, which is why I did not rerun them.
- **"Publish to Vimeo" skipping a `hold` row** is still tested only locally (P1). It no longer matters for these films: no row carries a `hold` now.

### Design questions (not decided here)

1. **F5 beat 7, `useDataApi`.** The narration is about the three states and the `return`, so those are typed. That leaves the effect on screen from the start, before the states it uses exist (still `…T5-CustomHooks-ES-b07-f2716.jpg`). It is whole code, but it is twelve lines nobody typed or explained. A cleaner build would add one beat that types and explains the effect; that adds roughly 15 seconds to the longest film and new narration, which is a storyboard change, so I did not do it. Dor decides after watching.
2. **F5 practice card.** Its narration is one short line, so the card with two tasks is on screen for 212 frames (7 s). If that reads as too short, the fix is a longer `say` on that beat.
3. **`status`.** The work-order and the studio skill say `awaiting-approval`; the comment at the top of `deliverables.json` lists `awaiting-upload | published | retired`. I used `awaiting-approval`. No script tells the two apart (both mean "not published").

### Open questions from P0 (checked in the files: none is answered)

| # | Question | Does it change a film? |
|---|---|---|
| Q1 | A Rise text line under the intro video (film first, then practice). | No. It is a Rise text for Cowork. |
| Q2 | May the practices show a solution, given "films never reveal answers"? | Not the films as built: they follow D3 and D10 (different data from the tasks where possible). It decides P3. |
| S5 | Previous value read from a ref during render (lint warning). Keep the classic pattern? | Yes: F4 beats 4 to 6 show it. A change is a data edit and a re-render. |
| S10 | A race when the URL changes. Add an `ignore` flag? | No. It is not in F5; it concerns the P-5 solution. |
| S11 | `setState` at the top of the effect in `useDataApi` (lint warning). Keep? | Yes: F5 beats 7 to 9 show it. A change is a data edit and a re-render. |

The films were built on the storyboard as written. If the SME answers S5 or S11 differently, the affected cards change in the content file only.

### For Dor: rendering and watching

1. Paste the push command above. The push of the branch starts "Voice and render" by itself, on the five films (they are the only rows not published).
2. When the run ends, the five MP4s are under **Artifacts** on the run page. Read the run's "TIMING WARNINGS": a line that overruns its beat means the rate of 13 is too high for it.
3. Watch all five before anything is published. "Publish to Vimeo" is a separate, manual step and was not run.

### For the next phases

- **P3** has not started. It needs Q2 answered.
- **The plugin's video skill** (`wawiwa-content-os/skills/wawiwa-video/references/lesson-films.md`) still does not list the `code` beat, `typed`, or the `aifs` style. That is a plugin change with its own version bump, not part of P2.
- **Not registered as practices yet:** `videos[].practice` and `activity` are null on the five rows until P3 builds the practice pages.

---

## עדכון, 15 בנובמבר 2026: חמשת הסרטים רונדרו עם קול

דור דחף את הענף `content/react-hooks-es`. הריצה "Voice and render" מספר 43692109951 עברה על כל חמשת הסרטים, בקול Angie. שום דבר לא פורסם.

| סרט | אורך אמיתי (נמדד בקובץ) | אזהרות תזמון |
|---|---|---|
| F1 useState | 127.8 שניות | אין |
| F2 useEffect: cuándo se ejecuta | 155.9 שניות | אין |
| F3 useEffect: limpieza | 136.7 שניות | 4 שורות (2, 5, 7, 9) |
| F4 useRef | 128.4 שניות | אין |
| F5 Hooks personalizados | 160.8 שניות | 2 שורות (8, 11) |
| **סך הכול** | **709.6 שניות, 11.8 דקות** | 6 מתוך 54 שורות |

- **האורכים** זהים לחישוב של ה-planner, כצפוי: ה-planner קובע את אורך הסרט, והקול נכנס לתוכו.
- **שש השורות** ארוכות מהזמן שתוכנן להן ב-0.34 עד 0.71 שניות (10 עד 22 פריימים). הקול מסתיים בתוך ההפסקה שבסוף הצעד, לא אחריה. לא נבדק אם הכתובית יורדת לפני שהקול מסתיים בשורות האלה.
- **קצב הדיבור האמיתי** (תווים לשנייה, לפי קובצי הכתוביות): ממוצע 13.8 עד 14.7 לסרט; השורה האיטית ביותר 11.8. הקצב 13 מחזיק ב-48 מתוך 54 שורות.
- **התיקון** הוא נתון בקובץ התוכן (להאריך את הצעד או לקצר את השורה) ורינדור חוזר. מומלץ לעשות אותו יחד עם ההערות של דור אחרי הצפייה, בריצה אחת.
- **לא נבדק:** Claude לא שמע את הסרטים ולא צפה בהם בתנועה. דור עוד לא צפה.
- **הקבצים** (לא ב-git): `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/out/react-hooks-es-run-43692109951/`

## Update, 15 Nov 2026: the five films are rendered with voice

Dor pushed branch `content/react-hooks-es`. "Voice and render" run 43692109951 passed on all five films, voice Angie. Nothing was published.

| Film | Real length (measured on the file) | Timing warnings |
|---|---|---|
| F1 useState | 127.8 s | none |
| F2 useEffect: cuándo se ejecuta | 155.9 s | none |
| F3 useEffect: limpieza | 136.7 s | 4 lines (cues 2, 5, 7, 9) |
| F4 useRef | 128.4 s | none |
| F5 Hooks personalizados | 160.8 s | 2 lines (cues 8, 11) |
| **Total** | **709.6 s, 11.8 min** | 6 of 54 lines |

- **The lengths** equal the planner's arithmetic, as expected: the planner fixes the film's length and the voice is placed inside it.
- **The six lines** run 0.34 to 0.71 s (10 to 22 frames) longer than the time planned for them. The voice ends inside the pause at the end of the beat, not after it. Whether the caption leaves before the voice ends on those lines was not checked.
- **The real speaking rate** (characters a second, from the caption files): 13.8 to 14.7 on average per film; the slowest line is 11.8. The rate of 13 holds on 48 of 54 lines.
- **The fix** is data in the content file (a longer beat or a shorter line) and a re-render. Best done together with Dor's notes after he watches, in one run.
- **Not checked:** Claude did not hear the films or watch them in motion. Dor has not watched yet.
- **The files** (not in git): `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/out/react-hooks-es-run-43692109951/`

---

## עדכון, 15 בנובמבר 2026: דור אישר את הסרטים, והתיקון לשש השורות

- **אישור:** דור אישר את חמשת הסרטים ואת המראה של תרגול P-1 (הוא כתב "מאושר", וכשנשאל בחר "הסרטים וגם P-1").
- **שתי החלטות נוספות שלו:** לתקן את שש השורות ולרנדר שוב; ולהשאיר את סרט 5 כמו שהוא (בלי צעד הסבר נוסף ל-`useDataApi`).
- **מה נמצא:** רצועת הכתוביות מציגה שורה רק למשך הזמן שתוכנן לה. בשש השורות הקול המשיך 0.3 עד 0.7 שניות אחרי שהכתובית כבר ירדה.
- **התיקון הוא במנוע, לא בתוכן** (commit `4d08de9`, ענף `engine/caption-holds-voice` של wawiwa-video, מוזג לענף `content/react-hooks-es` ב-`0130dda`): שלב הקול מאריך רק את הכתובית של שורה כזו, עד סוף הקול ועוד 6 פריימים, ולעולם לא מעבר לסוף הצעד שלה. הצעדים, המצלמה ואורך הסרטים לא משתנים. אף קובץ תוכן לא שונה.
- **נבדק** על התוכנית האמיתית של חמשת הסרטים ועל אורכי הקול שנמדדו בריצה 43692109951: הכתובית מוארכת בשש השורות האלה ובשורה אחת בסרט 1 (חריגה קטנה מתחת לסף האזהרה); אין כתובית קצרה מהקול שלה, אין חפיפה עם השורה הבאה, ואין כתובית שנמשכת מעבר לצעד. `tsc` עובר, ו-planner על חמשת הסרטים נותן אותה תוצאה.
- **לא נבדק:** התיקון לא רץ עדיין ב-GitHub Actions, ואף אחד לא צפה בתוצאה. זה ייבדק בריצה הבאה, אחרי ה-push של דור.
- **משפיע גם על** כל סרט שיעור אחר שבנוי מ-`beats[]`, אבל רק כשמרנדרים אותו מחדש עם קול. סרטים שכבר פורסמו לא משתנים.
- **ממצא נוסף, לא תוקן:** "Publish to Vimeo" מקריא את הקול מחדש ולא משתמש בהקראה השמורה של "Voice and render". כלומר הסרט שעולה ל-Vimeo הוא הקראה חדשה באותו קול, לא הקובץ שדור צפה בו. כך זה עובד בכל סרטי הסטודיו עד היום.

## Update, 15 Nov 2026: Dor approved the films, and the fix for the six lines

- **Approval:** Dor approved the five films and the look of practice P-1 (he wrote "מאושר", and when asked chose "the films and P-1").
- **Two more decisions of his:** fix the six lines and render again; leave film 5 as it is (no extra beat explaining `useDataApi`).
- **What was found:** the caption band shows a line only for the time planned for it. On the six lines the voice went on for 0.3 to 0.7 s after the caption had gone.
- **The fix is in the engine, not in the content** (commit `4d08de9`, branch `engine/caption-holds-voice` of wawiwa-video, merged into `content/react-hooks-es` as `0130dda`): the voice pass lengthens only that line's caption, to the end of the voice plus 6 frames, never past the end of its beat. Beats, camera and film lengths do not change. No content file was changed.
- **Checked** on the five films' real plans and the voice lengths measured in run 43692109951: the caption is lengthened on those six lines and on one line of film 1 (a small overrun under the warning threshold); no caption is shorter than its voice, none overlaps the next line, none runs past its beat. `tsc` passes, and the planner gives the same result on the five films.
- **Not checked:** the fix has not run in GitHub Actions yet, and nobody has watched the result. The next run, after Dor's push, is that check.
- **It also affects** every other lesson film built from `beats[]`, but only when one is rendered again with voice. Published films do not change.
- **Another finding, not fixed:** "Publish to Vimeo" reads the voice again and does not use the saved reading from "Voice and render". So the film that goes to Vimeo is a new reading in the same voice, not the file Dor watched. This is how every studio film has been published so far.
