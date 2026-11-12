# P0 REPORT: React Hooks self-study (Spanish): sources and storyboard

12 Nov 2026 · Opus 5.5, effort high · committed locally, not pushed.

## בעברית (לדור)

- **מה נעשה:** שתי התיקיות עודכנו (`git pull`, שתיהן היו מעודכנות). פקודת העבודה נשמרה בתיקיית התכנון, 16 קובצי הכתוביות ירדו, כל קטע קוד הורץ, וה-Storyboard נכתב.
- **הסרטים:** חמישה סרטים על סטודנטית בדויה בשם ולריה, שבונה במשך שבוע אפליקציה בשם Foco. לפי נוסחת ה-planner זה כ-11 דקות בסך הכול, בתוך היעד של 10 עד 12. זו הערכה ולא מדידה: הקצב של 14 תווים בשנייה נמדד על הקול האנגלי, ו-P2 ימדוד.
- **בדיקת הקוד:** כל קטע רץ ב-React 19.3 עם Vite 8 ו-StrictMode, כמו אצל הלומד.
  - במצב פיתוח, StrictMode מריץ כל effect פעמיים. לכן "רץ פעם אחת" מהסרטונים באנגלית הוא לא מה שהלומד יראה, והסרטים מסבירים את זה.
  - **תיקון לפקודת העבודה:** בסרטון 16 הקוד שעל המסך תקין (`.finally`). הבעיה האמיתית היא שאין בדיקה של `res.ok`, ולכן כתובת שגויה לא מציגה שגיאה.
- **בדיקה עוינת:** סוכן נפרד מצא 17 בעיות, למשל תשובות לתרגולים שמופיעות בסרט שלפניהם, ובדיקה שהייתה פוסלת קוד נכון. הכול תוקן ונמדד מחדש.
- **מחכה לך (3 החלטות):** סעיף 9 ב-Storyboard. בקצרה:
  - האם להוסיף שורת טקסט מתחת לסרטון הפתיחה.
  - האם התרגולים יכולים להראות פתרון.
  - העברת שלוש שאלות לראש התחום (S5, S10, S11).
- **איפה זה שמור:** commit מקומי ב-`wawiwa-activities`. לא נדחף.
- **הצעד הבא:** P1 על Fable, בריפו `wawiwa-video`. הוא ישאל אותך ארבע שאלות על הסגנון של התוכנית.

## English

### Done
1. Located the clones: `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities` and `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video`. `git pull --ff-only` in both: already up to date (`b042267`, `2c300f3`). A `.claude/launch.json` change in `wawiwa-activities` was already there before this session; it is not part of this commit.
2. Work-order saved as `planning/RUN ON OPUS - React Hooks self-study ES.md`.
3. 16 VTT files in `planning/source/` (`v01-…` to `v16-…`). The MP4s were downloaded to a temp folder only, to read the code on screen. Their durations match the work-order table. They are not committed.
4. Snippets run: `planning/snippet-check/` (see its README). Two rounds plus lint.
5. `planning/STORYBOARD.md` (decisions, story, `code` beat spec for P1, beats for 5 films, screens and Spanish text for 5 practices and the check-in, length table, SME check, Rise order, open questions).
6. `planning/films-draft.es.json`: the five films as data (beats, `say` lines, code cards with the lab component each was tested as). P2 pours this into LessonFilm content files.
7. One adversarial review (separate agent, read-only). It returned 17 findings. Every one was fixed or answered, and the unmeasured claims were measured in round 2.

### Numbers (all measured unless marked)
| | |
|---|---|
| Films, by the planner formula | F1 118 s · F2 147 s · F3 129 s · F4 121 s · F5 144 s · **total 659 s ≈ 11.0 min**. Estimate: the rate is the English voice's. |
| Code card longest | 18 lines (`useDataApi`); all others ≤ 14 |
| Snippets run | 44 components and hooks across two rounds, React 19.3.1, Vite 8.3.6, StrictMode |
| Practice time | not measured (P4) |

### SME check (full list: STORYBOARD section 6.3)
- **Changes in wording:**
  - S1, S2, S12: StrictMode in development.
  - S6: the "clear" button does not remove the key.
  - S7: the work-order's video 16 example. The code on screen is correct; only the narration is not.
- **Fixes:**
  - S8: `res.ok` and the initial `isLoading`.
  - S4: the scroll demo page cannot scroll.
- **Questions:**
  - S5: previous value read from a ref during render. Lint warning.
  - S10: race when the URL changes.
  - S11: `setState` at the top of an effect. Lint warning.

### Departures from the work-order (STORYBOARD section 1)
- **D1:** no clips from the original MP4s. They show a person's name, editor chrome and a third-party site.
- **D5:** the check-in is built in the practice shell, not in Practice Studio.
- **D9:** P-2 does not "sort" the three effects, because that would repeat the film.
- **D10:** practice predictions never repeat the film's answers.

### Not done / not checked
- I cannot hear: no voice was generated in P0.
- The planner's 14 chars/s is unverified for Spanish.
- The practice pages are not built (P3), so no screenshots yet.

### Next
P1 on Fable, in `wawiwa-video`, using STORYBOARD section 3.1. Paste:
`Read "full-stack-developer/react-ss-hooks-es/planning/RUN ON OPUS - React Hooks self-study ES.md" and run phase P1 only, in the wawiwa-video repo. Do not push, do not publish.`
