# P1 REPORT: React Hooks self-study (Spanish): video engine

12 Nov 2026 · Fable · committed locally in two repos, nothing pushed, nothing published.

## בעברית (לדור)

- **מה נעשה:** המנוע של סטודיו הווידאו יודע עכשיו להציג קוד. נוסף סוג כרטיס חדש (`code`): קוד מודפס עם מספרי שורות, שורות מודגשות ופאנל פלט לצד הקוד או מתחתיו. אין ציור של עורך, דפדפן או קונסול.
- **ארבע התשובות שלך נרשמו:** בהיר, רקע בקוד בסט חדש ל-Full Stack, מוזיקת `bed_bright`, בלי תמונות. הסט החדש הוא חדר לימוד בהיר וקריר עם פתקים על הקיר, כדי שהתוכנית לא תיראה כמו Data Analyst.
- **קול בספרדית:** לא צריך סוד חדש. בריפו כבר יש מזהה של קול ספרדי, זה שמשמש את שני סרטי הסייבר בספרדית שפורסמו, וסרט הבדיקה משתמש בו. לא נבדק: האם המבטא שלו לטיני-ניטרלי. צריך אוזן של אדם.
- **סרט בדיקה:** 24.3 שניות לפי חישוב ה-planner (ביקשת 20). הוא רשום עם `hold`, כך ש-Publish מסרב להעלות אותו.
- **מה לא נעשה:** הרצת "Voice and render" ב-GitHub Actions. היא דורשת push, ואמרת לא לדחוף. ברגע שהענף יידחף, ההרצה מתחילה לבד.
- **בדיקות שעברו:** `tsc` עובר. בדיקות הרישום של ה-CI עוברות בהרצה מקומית. 12 מתוך 12 פריימים משלושה סרטי Data Analyst זהים בייט-בייט לפני ואחרי השינוי.
- **מחכה לך:**
  1. להסתכל על התמונות בתיקייה הזו ולאשר את המראה של הסט ושל כרטיס הקוד.
  2. לדחוף את הענף `engine/code-beat` (פקודה למטה), ואז לצפות ולהקשיב לסרט הבדיקה.
  3. לפתוח תיקייה ל-AI Full Stack ב-Vimeo ולתת את המספר שלה, לפני הפרסום הראשון.
- **איפה זה שמור:**
  - המנוע: commit `ca0fd29` בענף `engine/code-beat`, בתיקייה `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video`. לא נדחף ולא מוזג ל-main.
  - הדוח והתמונות: commit ב-`/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities`. לא נדחף.
- **הצעד הבא:** P2 על Fable, אחרי שאישרת את המראה ואת הקול.

פקודה אחת לדחיפת הענף (מפעילה את "Voice and render" על סרט הבדיקה בלבד):

```bash
git -C "/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video" push -u origin engine/code-beat
```

## עדכון אחרי ה-push (12 בנובמבר 2026)

דחפת את הענף, ו-"Voice and render" רץ לבד על סרט הבדיקה והצליח (הרצה 43251183964).

- **הקול קיים בחשבון:** "Salvatore - Natural Conversations & Storyteller", מודל `eleven_multilingual_v2`. את המבטא רק אדם יכול לשפוט.
- **הגופן נטען ב-CI:** פריים מהסרט שרונדר ב-GitHub זהה במראה לפריים המקומי.
- **קצב הדיבור בספרדית נמדד:** 12.7 תווים בשנייה בממוצע (189 תווים ב-14.9 שניות, שלוש שורות קצרות בלבד). ה-planner מניח 14. כל שלוש השורות חרגו מהזמן שהוקצב להן, ב-0.2 עד 0.63 שניות.
- **המשמעות ל-P2:** בשורה ארוכה (כ-200 תווים) החריגה תהיה כ-1.5 עד 2.5 שניות לפי אותו קצב, כלומר הקריינות תימשך אחרי שהמצלמה כבר עברה לכרטיס הבא. צריך לתקן את ה-planner לפני P2. זו הערכה משלוש שורות, לא מדידה על סרט מלא.
- **הסרט עם הקול:** `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/out/ci-enginetest/out/AIFS-EngineTest-CodeBeat.mp4` (לא ב-git).

## English

### Done

1. **Style row.** Asked the four questions in `references/styles.md`. Dor's answers (12 Nov 2026): bright; places drawn in code, in a new set for Full Stack; the music carries momentum (`bed_bright`); no generated images. Written as the `aifs` row in `deliverables.json` → `styles`, with `program_titles.aifs` = "AI Full-Stack Developer".
2. **New set.** `src/story/StudySet.tsx`: a cool, bright study room with tall windows, a rail of pinned notes and a desk. The notes carry code marks and ruled lines, no words. No foreground plane, because LessonFilm places cards by arithmetic and a soft object in front would sooner or later cover code. `LessonFilm` picks the set from the style row by the content file's `programCode`.
3. **The `code` beat.** `src/story/props/CodeProps.tsx`, as specified in STORYBOARD section 3.1: JetBrains Mono, line numbers, `hl`, `output` with `tone`, `sameCard`, up to 18 lines, no editor chrome. Planner floor `code: 175` added. The contract for whoever writes content is in `wawiwa-video/docs/code-beat.md`.
4. **Spanish voice.** The secret cannot and must not be read, so I did not check it. It is not needed: a content file can name its own voice, and the repo already holds a Spanish voice id (`voiceId` in `aicy60-t0-medialiteracy-es.json` and `aicy60-t1-deepphishing-es.json`, both published). The test film uses it. Nothing for Dor to paste.
5. **Test film.** `AIFS-EngineTest-CodeBeat` (`src/content/aifs-enginetest-codebeat-es.json`): a caption, one code card with an output panel, a second step on the same card, the end card. The code and the two outputs are copied from the P0 draft (F3, lab components `Timer` and `TimerStale`); the narration is test text. Registered in `Root.tsx` and in `videos` with `hold`, so Publish refuses it.

### Decisions I made beyond the storyboard

| # | Decision | Why |
|---|---|---|
| E1 | The output panel goes beside the code or under it, chosen by which lets the camera stand closer. | The storyboard allows both. The widest line in the five films is 78 characters; beside it, an output would shrink the code. |
| E2 | A step with an output holds code and panel; a step without holds the code alone. | The code is larger whenever there is nothing next to it. |
| E3 | Code cards are framed higher than other cards (between y 132 and 856 of 1080). | A long Spanish line makes three rows of captions, which would cover line 17 of `useDataApi`, the line beat F5-8 highlights. |
| E4 | Ligatures are off. | JetBrains Mono draws `=>` as one arrow. The learner types two characters. |
| E5 | Light syntax colour (keywords, strings, comments, numbers, `use…` names). | "Typeset code". Dimmed lines stay readable. |
| E6 | The tone of an output is a coloured edge and a tick or cross. | Colour alone should not carry the meaning. |
| E7 | An arrow in an output line is drawn by the engine. | U+2192 is outside the font's Latin subset; a fallback font would differ between a Mac and CI. |
| E8 | Two options on the practice card: `guardLine` and `titleSize`. | The card draws its second line red and bold (the warning line of the data films). F4 and F5 have a second task there. Defaults are unchanged. |
| E9 | No travel sound on a `sameCard` beat. | The camera does not travel. |
| E10 | The programme code on screen is `AIFS`. | It has to match the style row's key. Changing it later is a data change in two places. |

### Numbers

| | | |
|---|---|---|
| Test film length | 730 frames, 24.3 s | planner formula; not a render with voice |
| An 18-line card on a 1080p frame | about 25 px type | computed from the card geometry, not measured on a frame |
| Existing films unchanged | 12 of 12 frames byte-identical | AIDA-SQL-L14-T3, AIDA-E2-T6, AIDA-E2-T2; main vs branch; caption, table, lookup, formula, screen, practice, end |
| `tsc` | passes | |
| CI guards (registration, content file, style row, bed) | pass | run locally with the workflow's own jq and grep lines |
| Spanish speaking rate | not measured | the planner's 14 chars/s is the English voice's |

### Pictures (this folder)

- `AIFS-EngineTest-CodeBeat-0100.jpg`, `-0330.jpg`, `-0560.jpg`: the test film (caption, code with output, second step).
- `stress-18-lines.jpg`, `stress-18-lines-with-output.jpg`: `useDataApi`, the tallest card.
- `stress-78-char-line-output-under.jpg`: the widest line, output under the code.
- `stress-practice-card-long.jpg`: the F5 practice card with `guardLine: null` and `titleSize: 64`.

The stress pictures were rendered from a temporary content file built from the P0 draft. That file was not committed.

A silent local render of the whole test film is at `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/out/AIFS-EngineTest-CodeBeat-silent-preview.mp4` (music and effects, no voice; `out/` is not in git).

### Not done / not checked

- **"Voice and render" in Actions (work-order P1 step 4).** It needs a push, and the instruction was not to push. A push of the branch starts it on the test film alone.
- **The voice.** I cannot hear. Whether the Spanish voice is neutral Latin-American, and whether it is still on the ElevenLabs account, is unknown until the run. The run fails loudly if the voice id is not on the account.
- **The font in CI.** JetBrains Mono loads from Google Fonts at render time, the same way the T8 film's fonts do. It loaded on this Mac. Not yet seen in CI.
- **Motion.** I looked at stills, not at the film playing. The camera easing between `sameCard` steps has not been watched by anyone.
- **Other composition families** (the v3 films, the cyber films) were not re-rendered. The only shared code touched is `BrightPracticeCard`, whose defaults are unchanged; the AIDA practice frames above cover it.
- **Skill references.** `references/lesson-films.md` and `references/styles.md` in the `wawiwa-content-os` plugin do not list the `code` beat or the `aifs` style. That is a plugin change with its own version bump and was not done here.

### After the push (12 Nov 2026, run 43251183964)

Dor pushed the branch. "Voice and render" started by itself on the test film and passed. This closes P1 step 4.

| | | |
|---|---|---|
| Voice on the account | "Salvatore - Natural Conversations & Storyteller", `eleven_multilingual_v2` | from the run log; the accent is for a person to judge |
| JetBrains Mono in CI | loaded | a frame of the CI render looks the same as the local still |
| Film length | 24.38 s | the rendered file |
| Spanish speaking rate | 12.7 chars/s on average (12.0, 12.4, 13.4) | 189 characters in 14.9 s, three short lines, voice speed 0.98 |
| Lines longer than their slot | 3 of 3, by 0.20 to 0.63 s | the run's timing warnings |

**What this means for P2.** The planner budgets 14 characters a second. At the measured rate a 200-character line runs about 1.5 to 2.5 s past its slot, so the voice would still be on a card after the camera has left it. The planner needs a Spanish rate before the five films are planned. This is an estimate from three short lines, not a measurement on a full film; it also moves the 11.0-minute total of the P0 estimate up by roughly a tenth for the narrated part.

The film with voice: `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/out/ci-enginetest/out/AIFS-EngineTest-CodeBeat.mp4` (not in git; the artifact on GitHub expires after 7 days).

### For P2 (content only, no TSX)

1. Each content file: `"programCode": "AIFS"`, `"lang": "es"`, `"voiceId": "wfTWLJ20rcMqvU8gIiAB"`, a `voice` block, and a `badge` that says the case is invented (the studio rule: the pill stays on in an invented case).
2. `code` beats exactly as in `films-draft.es.json` (drop `_test`). Read `wawiwa-video/docs/code-beat.md` first.
3. `practice` blocks of F4 and F5: `"guardLine": null`. Long titles ("Uso de Referencias y de useRef", "Creación de un Temporizador"): set `titleSize`, and `h` on the practice beat if the card is tall.
4. The two `table` beats (F2-4, F4-8): set `width` and `colFlex`. At the default 900 the F4 table cuts its cells off ("refClicks.curren…").
5. Register the five films in `aifsFilms` in `src/Root.tsx` and in `videos` with `"program": "aifs"`. Delete the test film: its content file, its row and its entry.
6. Keep each `say` line to about 220 characters.
7. Before any publish: `vimeoFolder` on the `aifs` style row. Without it the films land in the Vimeo library root.

### Questions for Dor

1. **The look.** Does the study room, and the code card on it, pass? (Pictures in this folder.) This is the taste gate before five films are built on it.
2. **The voice.** After the push: is the Spanish voice the right accent and pace? If not, a different voice id goes into the content files; it is not a secret.
3. **The Vimeo folder** for AI Full-Stack Developer: its number, for the style row.
4. **Merge.** The engine is on the branch `engine/code-beat`. P2 should start from it, or from `main` after it is merged. Which?
