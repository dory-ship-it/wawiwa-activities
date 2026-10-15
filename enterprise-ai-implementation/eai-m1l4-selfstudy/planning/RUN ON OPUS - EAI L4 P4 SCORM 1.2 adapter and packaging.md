# RUN ON OPUS: EAI L4 P4 SCORM 1.2 adapter, packaging, local mode

Written 15 Oct 2026 (planning side). Opus 5.5, high effort. One session. Needs P3 committed.

## סיכום בעברית (לנוי)
**מה נבנה:** הדיווח ל-LMS. חבילת SCORM 1.2 (קובץ zip) לבלוסום: סטטוס השיעור, זמן, נקודת המשך (suspend_data קומפקטי), וכל אינטראקציה בנפרד (מזהה, סוג, תשובה, תוצאה, זמן תגובה). בלי שום שדה זיהוי של הלומד. וגם מצב מקומי (בלי LMS) לתצוגה ב-GitHub Pages, עם חלון דיבאג שמראה מה היה נשלח.
**מה לבדוק:** את ה-zip מעלים ל-SCORM Cloud לפי הצ'קליסט של P5.

## Rules for every phase (read first)
- Work only inside `enterprise-ai-implementation/eai-m1l4-selfstudy/` (plus reading the reference paths named below). Never edit GFM S1, Practice Studio or `eai-m1l4-class`.
- Read `planning/PRD.md` and `content/l4-slice.json` before you start (P0 creates `content/l4-slice.json` as a copy of `planning/content/l4-slice.json`; from then on `content/` is the live file and the planning copy stays frozen). The PRD wins over your own taste; the storyboard wording in the JSON is fixed (fidelity first). If something in the PRD is impossible, stop and say so in the report instead of improvising.
- No learner-facing text in `src/`: every string comes from the content JSON. No em dashes anywhere (code comments included). No italics.
- WCAG 2.1 AA is part of the build, not a later fix (PRD section 8).
- Run this phase only. No sub-agents. Keep the scope; list anything extra you notice under "Next" in the report.
- Commit locally at the end with the message given below, plus the attribution lines your session asks for. **Never `git push`.** Noy pushes herself. Do not commit `dist/`, `node_modules/`, `video/v1/frames/`, `video/v1/tts/` or any key.
- Then STOP and hand back the report.

## 1. Context to read first
- `planning/PRD.md` section 7 (tracking) and section 4.
- Practice Studio `engine/passback.js` (whole file, 129 lines): API discovery walk (parent chain, then opener chain) and the identity guard. Copy the pattern, 1.2 only.
- Your event bus `src/tracking/index.js` and the state stub from P0.

## 2. Scope
1. `src/state.js`: one lesson state object; compact suspend codec (PRD section 7 short keys); `encode()` asserts length under 4096 and drops `x` (retry counts) first when over 3800; `decode()` tolerates missing or corrupt data (fresh start, no crash).
2. `src/tracking/scorm12.js`:
   - Discovery and guard copied from `passback.js` (regex refuses `student_id|student_name|learner_id|learner_name`; every `LMSGetValue` / `LMSSetValue` goes through the guard).
   - `LMSInitialize("")`; read `cmi.core.entry`, `cmi.suspend_data`, `cmi.core.lesson_location`; set `cmi.core.lesson_status = incomplete` on first launch only (never downgrade completed/passed).
   - Interactions on first attempt only: n from `cmi.interactions._count`; set `id`, `type`, `student_response`, `result` (`correct` | `wrong` | `neutral`), `latency` (`HHHH:MM:SS.SS`), `time` (`HH:MM:SS`), `weighting` (1 scored, 0 practice), `correct_responses.0.pattern` when the content has one. Fill-in responses trimmed, max 250 chars, commas allowed; strip control characters.
   - `lesson_location` and `suspend_data` on every screen change; `LMSCommit("")` after each interaction and screen change (throttled to at most one per 2 s, flushed on exit).
   - Completion: on `complete` event, if `lesson.completion.scoredScreens` is empty set `completed`; else compute score.raw (0 to 100, min 0, max 100) and `passed` / `failed` against `passMark`. Write `cmi.core.exit = ""` then.
   - `cmi.core.session_time` at exit (`HHHH:MM:SS.SS`); `cmi.core.exit = "suspend"` while incomplete; `LMSFinish("")` on `pagehide` and `beforeunload`, once.
   - Error handling: check `LMSGetLastError` after each set; log in `?debug=1`; never throw into the UI.
3. `src/tracking/local.js`: same interface, state in `localStorage` key `wawiwa.eai.l4.slice` (try/catch), records the would-be SCORM calls in an array; `?debug=1` panel lists them (dev only, not in the content file).
4. `src/tracking/index.js`: adapter selection (API found = scorm12, else none; `?tracking=` override); resume prompt using `ui.resumePrompt` (Resume / Start over); Start over clears suspend data and local state, shows `ui.startOverLmsNote` when scorm12. Saved indicator reflects the last successful commit.
5. `tools/scorm-mock.html` + `tools/scorm-test.mjs`: a mock SCORM 1.2 API in a parent frame that records calls and enforces 1.2 rules (vocabulary of type/result, timespan formats, 4096 suspend limit, 255 chars on fill-in student_response, refuses identity fields); the test walks the slice through the mock (reuse `walk.mjs`), then relaunches with `entry=resume` and the saved suspend data and asserts it resumes at the saved screen with stored text.
6. `tools/package-scorm.mjs`: builds `dist/eai-m1l4-selfstudy-scorm12.zip` with `imsmanifest.xml` at the root (SCORM 1.2, one SCO, `adlcp:scormtype="sco"`, href `index.html`, every file listed as a resource file), the ADL 1.2 schema files if present in `tools/scorm12-schemas/` (if absent, package without them; SCORM Cloud accepts that, note it in the report), and only runtime files (`index.html`, `src/`, `content/`, `assets/`). Uses `fflate` (devDependency). Paths use forward slashes (Windows-safe). Prints the zip size.
7. Script `npm run package` and `npm run test:scorm`.

## 3. Constraints
- Never read or write any identity field, not even to greet. No data leaves the browser except to the LMS API.
- Interactions are written once per id. Retries, routes, handoff flags, clicks go to suspend_data only.
- Local mode and SCORM mode render identically; only the adapter differs.

## 4. Steps
1. Read section 1; short plan.
2. State codec, scorm12, local, selection, resume.
3. Mock + test; package script.
4. Run `npm run test:scorm` and `npm run package`; inspect the manifest and zip listing.
5. README (tracking section, how to package); commit `EAI L4 P4: SCORM 1.2 adapter, packaging, local mode`. STOP.

## 5. Definition of done (run these yourself)
- `npm run test:scorm` passes: 12 interactions written once each with valid 1.2 vocabulary and formats; suspend_data length printed and under 1500 with all three free-text fields at 250 chars; resume lands on the saved screen; completed set at Finish; no identity element touched (mock asserts).
- `npm run package` produces the zip; listing shows `imsmanifest.xml` at the root, no `node_modules`, `video/`, `review/`, `planning/` or `tools/`; size printed.
- Local mode: reload mid-slice resumes; `?reset=1` clears; `?debug=1` panel lists calls.

## 6. Hand back to Noy
- `dist/eai-m1l4-selfstudy-scorm12.zip` path and size.
- Screenshots in `review/p4/`: `resume-prompt.png`, `debug-panel.png`, `startover-lms-note.png`.
- Report (max 15 lines): test results, max suspend length, manifest summary, whether schema files were included, and "Next: P5 and the SCORM Cloud upload".


## Report file (required)
Also save the final report as `review/p4/REPORT.md` (same text you print), together with the screenshots, before you commit. The planning model reads it from there.
