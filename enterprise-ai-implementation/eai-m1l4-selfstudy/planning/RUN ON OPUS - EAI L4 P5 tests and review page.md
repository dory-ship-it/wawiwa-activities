# RUN ON OPUS: EAI L4 P5 tests, accessibility checks, review page

Written 15 Oct 2026 (planning side). Opus 5.5, normal effort. One session. Needs P4 committed.

## סיכום בעברית (לנוי)
**מה נבנה:** בדיקות אוטומטיות לכל ה-slice: שום טקסט לא חתוך ושום אזור לא מכסה אזור אחר, בדיקת נגישות עם axe, מעבר מלא עם מקלדת, ודף סקירה אחד שמציג את כל המסכים והמצבים כדי שתעברי עליהם. וגם צ'קליסט קצר בשבילך להעלאה ל-SCORM Cloud ולבדיקה עם קורא מסך.
**מה להביא חזרה:** את הערות הסקירה שלך ואת תוצאות SCORM Cloud. הסקירה עוברת למודל התכנון.

## Rules for every phase (read first)
- Work only inside `enterprise-ai-implementation/eai-m1l4-selfstudy/` (plus reading the reference paths named below). Never edit GFM S1, Practice Studio or `eai-m1l4-class`.
- Read `planning/PRD.md` and `content/l4-slice.json` before you start (P0 creates `content/l4-slice.json` as a copy of `planning/content/l4-slice.json`; from then on `content/` is the live file and the planning copy stays frozen). The PRD wins over your own taste; the storyboard wording in the JSON is fixed (fidelity first). If something in the PRD is impossible, stop and say so in the report instead of improvising.
- No learner-facing text in `src/`: every string comes from the content JSON. No em dashes anywhere (code comments included). No italics.
- WCAG 2.1 AA is part of the build, not a later fix (PRD section 8).
- Run this phase only. No sub-agents. Keep the scope; list anything extra you notice under "Next" in the report.
- Commit locally at the end with the message given below, plus the attribution lines your session asks for. **Never `git push`.** Noy pushes herself. Do not commit `dist/`, `node_modules/`, `video/v1/frames/`, `video/v1/tts/` or any key.
- Then STOP and hand back the report.

## 1. Context to read first
- `planning/PRD.md` sections 8 and 9 (definition of done).
- `genai-for-marketing/s1-ai-awareness/tools/test-fit.mjs` (lines 1 to 120: server, Chrome lookup, clipped-text checks, `--shots`).
- Your `tools/walk.mjs`, `tools/scorm-test.mjs`, `tools/check.mjs`.

## 2. Scope
1. `tools/test-fit.mjs` (adapted from GFM S1): for every slice screen and every state the walk reaches (hint, each feedback state, paged feedback, video before play / playing / each stop / end, handoff brief / opened / return / saved, self-check steps, pause markers, menu open, dialogs) at 1280x720 and scaled at 1024x576 and 1920x1080, fail when: any text element is clipped (scroll size > client size) or leaves its zone; the stage card and feedback row boxes overlap; any text is under 16 stage px; any element sits outside the 1280x720 stage; a scrollbar appears.
2. `tools/a11y.mjs`: inject `axe-core` (devDependency) into every state above; fail on serious or critical; also assert `lang` set, every input labelled, the feedback row has `aria-live`, every `svg` is `aria-hidden` or named, focus visible (computed outline on focused elements), `prefers-reduced-motion` emulated run has no CSS transitions over 0 s.
3. Contrast script: compute every token text/background pair actually used (read computed styles) and fail under 4.5:1 (3:1 for 18.66 px bold and up, and for UI borders).
4. `npm test` = check + walk + test-fit + a11y + test:scorm.
5. `review/review.html`: one static page (no build), all screenshots grouped by screen, each with its state name, the storyboard wording beside it (read from the content JSON at build time by `tools/build-review.mjs`), and a notes box per screen that Noy can fill and save as a text file (Blob download; no server). Includes the list of `pilotCopy` strings for approval and the tracking table (id, type, response format, result).
6. `planning/SCORM-CLOUD-CHECKLIST.md`: Noy's steps (upload zip to SCORM Cloud, launch, play the slice, exit mid-way and relaunch to check resume, finish, then open the registration report and check: status completed, 12 interactions with ids and results, session time, suspend data present, no learner name or id in anything the package sent) plus a 10-minute NVDA screen reader pass (what to listen for on S01, S03, V1 stop, S19).
7. `planning/DIY-WCAG-RESULTS.md`: the honest result table of the automated checks (pass / fail / not tested), ready to feed the VPAT; the manual NVDA rows left as "pending Noy".

## 3. Constraints
- Fix real defects found by the tests in the smallest way; if a fix needs a design change, do not make it: list it for Noy.
- Never weaken a check to make it pass.

## 4. Steps
1. Read section 1; short plan.
2. Write test-fit, a11y, contrast; run; fix small defects; rerun until green or blocked.
3. Screenshots of every state to `review/p5/` (the same run), build `review/review.html`.
4. Checklists. README: phase status and how to run `npm test`.
5. Commit `EAI L4 P5: tests, a11y checks, review page`. STOP.

## 5. Definition of done (run these yourself)
- `npm test` green, or every remaining failure listed with the reason and the proposed fix.
- `review/review.html` opens from a local server and shows every state.
- `npm run package` rebuilt after fixes; zip size reported.

## 6. Hand back to Noy
- `review/review.html` (open it with `npm run serve`, then `http://localhost:8124/review/review.html`).
- `dist/eai-m1l4-selfstudy-scorm12.zip`, `planning/SCORM-CLOUD-CHECKLIST.md`, `planning/DIY-WCAG-RESULTS.md`.
- Report (max 20 lines): test totals, defects fixed, defects open, pilotCopy strings to approve, and the push reminder (Noy pushes after her review).
