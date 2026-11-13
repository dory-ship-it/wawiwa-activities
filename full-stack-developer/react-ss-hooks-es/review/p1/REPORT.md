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

## עדכון 13 בנובמבר 2026: דור פסל את המראה ואת הקול, והמנוע נבנה מחדש

דור צפה בסרט הבדיקה והחליט:

- **הקול נפסל.** מספר סיפורים, מסתורי ואיטי מדי. נדרש קול ניטרלי וטכני של מורה שמסביר בקצב טוב.
- **המראה נפסל.** כרטיס קוד עם שורות מסומנות נראה כמו שקף. נדרש מראה של הקלטת מסך: אדם שמקליד קוד ומסביר תוך כדי.
- **תיקיית Vimeo של AI Full Stack:** 31257432. נכתבה בשורת הסגנון `aifs`.

מה נבנה (לא נדחף, לא פורסם):

- **עורך קוד במסך מלא עם הקלדה חיה.** השורות שהקריינות מדברת עליהן מוקלדות תו אחר תו, והפלט מופיע בפאנל מעוגן אחרי שההקלדה נגמרת. העורך כללי ואינו חיקוי של מוצר אמיתי.
- **שדה חדש בקובץ התוכן:** `typed` (אילו שורות מוקלדות בכל צעד). ה-planner מתריע כשיש יותר מ-1.5 שניות של הקלדה בלי קול.
- **שתי ערכות צבע**, כהה ובהירה, לפי השדה `codeTheme` בשורת הסגנון. כרגע: כהה.
- **בדיקת קולות ("Voice audition")** שרצה ב-GitHub אחרי push: קוראת שתי שורות אמיתיות בכל קול ספרדי מועמד ומודדת את הקצב של כל אחד.

בדיקות שרצו: `tsc` עבר. 12 מתוך 12 פריימים של סרטי Data Analyst קיימים זהים בייט לבייט ל-main. סקריפט הקולות נבדק מול שרת דמה מקומי בלבד, לא מול ElevenLabs.

לא נבדק: התנועה עצמה (ראיתי תמונות בודדות, לא את הסרט), והסרט עם קול. אין צליל הקלדה.

התמונות: התיקייה `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/full-stack-developer/react-ss-hooks-es/review/p1/v2-typing`
הסרט השקט (לא ב-git): `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/out/AIFS-EngineTest-CodeBeat-typing-silent-preview.mp4`

השלכה על P2: הטיוטה של חמשת הסרטים נכתבה לכרטיס עם שורות מסומנות. ב-P2 צריך לבחור לכל צעד אילו שורות מוקלדות, כך שמה שעל המסך לפני ההקלדה הוא קוד הגיוני. ההנחיות: `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/docs/code-beat.md`

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

## 13 Nov 2026: Dor turned down the look and the voice; the engine was rebuilt

Dor watched the test film and decided:

- **The voice is out.** A storyteller, mysterious and too slow. Wanted: a neutral, technical voice, a teacher who explains at a good pace.
- **The look is out.** A code card with highlighted lines reads as a slide. Wanted: the look of a screen recording, a person typing code and explaining as they go.
- **Vimeo folder for AI Full-Stack Developer:** 31257432, now on the `aifs` style row.

What was built (not pushed, not published):

| | |
|---|---|
| Editor | Full-frame generic code editor (`src/story/props/CodeProps.tsx`). The camera stands still. Not a look-alike of a real product: no name, logo, activity bar, icon set or window buttons. |
| Live typing | New field `typed` on a code beat. Lines are typed a character at a time at about 16 a second (up to 30 to fit a beat). A line not yet typed is not on screen. |
| Output | A panel docked right or under, filled after the typing ends, a line at a time. |
| Palettes | `codeTheme` on the style row: `dark` (set now) or `light`. A still of each is in `v2-typing/`. |
| Planner | Holds a code beat long enough for its typing (budget 22 chars/s) and flags more than 1.5 s of typing with no voice. |
| Bright vignette | Off while an editor fills the frame (`vignette` prop on `BrightFilm`, absent for every other film). |
| Voice audition | `voice-audition/aifs-es.json`, `scripts/voice-audition.mjs`, workflow "Voice audition". Reads two draft lines in each candidate voice and measures characters a second. |
| Test film | Now 29.8 s, plain delivery (stability 0.5, style 0.15, speed 1.06), still the old voice until one is chosen. |

Checked: `tsc` passes; CI guards pass locally; 12 of 12 frames of existing Data Analyst films are byte-identical to `main` (same frames as on 12 Nov). The audition script ran against a local fake of the voice service only, not against ElevenLabs.

Not checked: the motion itself (single stills were looked at, not the film), and the film with voice. There is no typing sound.

Part of why the first voice sounded slow was the delivery, not only the voice: the test film had copied the cyber films' dramatic read (stability 0.32, style 0.5, speed 0.98).

### This replaces parts of "For P2" above

1. `voiceId`: not `wfTWLJ20rcMqvU8gIiAB`. Use the id Dor picks after the audition, and a plain `voice` block.
2. Code beats are no longer "exactly as in the draft". The draft marks lines with `hl`; each beat now also needs a deliberate `typed`, chosen so that what is on screen before the typing is believable code (whole blocks, not a lone opening line). Follow `wawiwa-video/docs/code-beat.md` and the planner's warnings.
3. `vimeoFolder` is set. Item 7 is done.
4. The planner's speaking rate is set after the voice is chosen, from the audition's measured pace.

Silent preview of the new look (not in git): `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/out/AIFS-EngineTest-CodeBeat-typing-silent-preview.mp4`

---

## עדכון שני, 13 בנובמבר 2026: תוצאות אחרי ה-push של דור

- **ערכת צבע:** דור בחר כהה. זו הערכה שכבר מוגדרת.
- **בדיקת הקולות** (ריצה 43421668968, עברה): 15 קולות ספרדיים קראו את אותן שתי שורות, 9 מהחשבון ו-6 מספריית ElevenLabs. כל ה-15 הוקראו; קולות הספרייה הוקראו בלי שנוספו לחשבון. הטבלה המלאה: `voice-audition-RESULTS.md` בתיקייה הזו.
- **הקצב שנמדד** (תווים בשנייה, במהירות 1.06): Salvatore הישן 12.9, Angie 13.9, Cristian 14.6, Alejandro 16.4, Daniel Yvker 9.4. המתכנן מניח 14.
- **רשימה קצרה של Claude, לפי תיאור וקצב בלבד (Claude לא שומע קולות):** Angie, Cristian, Alejandro. דור מקשיב ובוחר.
- **סרט הבדיקה עם קול** (ריצה 43421668861, עברה): 29.8 שניות, 1920 על 1080, עם פס קול. Claude ראה גיליון פריימים של הסרט המרונדר (2 פריימים בשנייה): ההקלדה מתקדמת שורה אחרי שורה, הפלט מגיע אחרי ההקלדה, וצעד ההצבעה עובד. Claude לא האזין לסרט.
- **חריגה ידועה:** עם הקול הישן הקריינות ארוכה מהזמן שהמתכנן נתן: השורה הראשונה ב-14 פריימים, השנייה ב-35 פריימים, השלישית נכנסת. בשורה השנייה הכתובית נעלמת כשנייה לפני שהקול מסיים. זה ייפתר כשקצב הדיבור במתכנן ייקבע לפי הקול שייבחר.
- **לא נעשה:** הקול עוד לא נבחר, `voiceId` לא שונה, וקצב הדיבור במתכנן לא שונה.

## Second update, 13 Nov 2026: results after Dor's push

- **Palette:** Dor chose dark. It is what the style row already says.
- **Voice audition** (run 43421668968, passed): 15 Spanish voices read the same two lines, 9 from the account and 6 from the ElevenLabs library. All 15 were read; the library voices were read without being added to the account. Full table: `voice-audition-RESULTS.md` in this folder.
- **Measured pace** (characters a second, at speed 1.06): the old Salvatore 12.9, Angie 13.9, Cristian 14.6, Alejandro 16.4, Daniel Yvker 9.4. The planner assumes 14.
- **Claude's shortlist, by label and pace only (Claude cannot hear voices):** Angie, Cristian, Alejandro. Dor listens and picks.
- **Test film with voice** (run 43421668861, passed): 29.8 s, 1920 by 1080, with a sound track. Claude looked at a contact sheet of the rendered film (2 frames a second): the typing advances line by line, the output arrives after the typing, and the pointing step works. Claude did not listen to the film.
- **Known overrun:** with the old voice the narration is longer than the time the planner gave it: the first line by 14 frames, the second by 35 frames, the third fits. On the second line the caption leaves about a second before the voice finishes. This goes away when the planner's speaking rate is set from the chosen voice.
- **Not done:** no voice is chosen, `voiceId` is unchanged, and the planner's speaking rate is unchanged.

---

## עדכון שלישי, 13 בנובמבר 2026: דור בחר את Angie

- **הקול לסרטים בספרדית:** Angie, `eeTcHFmLuUzCOHvnwvdr` (ספרדית מקסיקנית). בבדיקת הקולות נמדדה 13.9 תווים בשנייה.
- **קצב דיבור לכל סרט:** המתכנן קורא עכשיו שדה `charsPerSecond` מקובץ התוכן. סרט בלי השדה מתוכנן כמו קודם, לפי 14. כל 24 הסרטים הקיימים תוכננו מחדש בלי שום שינוי.
- **סרט הבדיקה:** Angie, קצב 13 (מעט מתחת למדידה, כדי שהקול לא יחרוג). האורך עלה מ-29.8 ל-31.0 שניות.
- **לא נבדק:** הקצב 13 נגזר מבדיקת הקולות. הוא עוד לא נבדק על סרט מרונדר בקול של Angie. זה ייבדק בריצה הבאה, אחרי push של דור.
- **ל-P2:** בכל קובץ תוכן בספרדית: `voiceId` של Angie, `charsPerSecond` 13, ובלוק `voice` של קריאה עניינית. הפרטים ב-`wawiwa-video/docs/code-beat.md`.
- **נשמר:** commit `ec7da36` בענף `engine/code-beat` של wawiwa-video (לא נדחף).

## Third update, 13 Nov 2026: Dor chose Angie

- **Voice for the Spanish films:** Angie, `eeTcHFmLuUzCOHvnwvdr` (Mexican Spanish). The audition measured 13.9 characters a second.
- **A speaking rate per film:** the planner now reads a `charsPerSecond` field from the content file. A film without it is planned as before, at 14. All 24 existing beat-based films were replanned with no change.
- **Test film:** Angie, rate 13 (a little under the measurement, so the voice does not overrun). Its length went from 29.8 to 31.0 seconds.
- **Not checked:** the rate of 13 is derived from the audition. It has not been checked on a film rendered in Angie's voice. The next run, after Dor's push, checks it.
- **For P2:** every Spanish content file takes Angie's `voiceId`, `charsPerSecond` 13 and the plain-read `voice` block. Details in `wawiwa-video/docs/code-beat.md`.
- **Saved:** commit `ec7da36` on branch `engine/code-beat` of wawiwa-video (not pushed).
