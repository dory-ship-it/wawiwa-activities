# RUN ON OPUS: EAI L4 P3 video player with cue stops, Handoff, return checkpoint

Written 15 Oct 2026 (planning side). Opus 5.5, high effort. One session. Needs P1 and P2B committed (`assets/video/v1.*` present).

## סיכום בעברית (לנוי)
**מה נבנה:** נגן הסרטון בתוך כרטיס הבמה: שאלת הכוונה לפני הניגון, כתוביות מתחת לסרטון (לא עליו), תמליל, ועצירה בשתי השאלות: הפריים קפוא משמאל, השאלה מימין, והסרטון ממשיך רק אחרי תשובה נכונה. וגם S19 (פתיחת החוברת eai-m1l4-class בלשונית חדשה, וחזרה עם שדה המדד) ו-S20 (בדיקה עצמית בשני שלבים) עם סימן ההפסקה בסוף הפרק וסוף ה-slice.
**מה לבדוק:** שהסרטון נעצר בדיוק בשאלות, שאי אפשר לדלג קדימה מעבר לשאלה שלא נענתה, ושהחוברת נפתחת בלשונית חדשה והשיעור שומר את המקום.

## Rules for every phase (read first)
- Work only inside `enterprise-ai-implementation/eai-m1l4-selfstudy/` (plus reading the reference paths named below). Never edit GFM S1, Practice Studio or `eai-m1l4-class`.
- Read `planning/PRD.md` and `content/l4-slice.json` before you start (P0 creates `content/l4-slice.json` as a copy of `planning/content/l4-slice.json`; from then on `content/` is the live file and the planning copy stays frozen). The PRD wins over your own taste; the storyboard wording in the JSON is fixed (fidelity first). If something in the PRD is impossible, stop and say so in the report instead of improvising.
- No learner-facing text in `src/`: every string comes from the content JSON. No em dashes anywhere (code comments included). No italics.
- WCAG 2.1 AA is part of the build, not a later fix (PRD section 8).
- Run this phase only. No sub-agents. Keep the scope; list anything extra you notice under "Next" in the report.
- Commit locally at the end with the message given below, plus the attribution lines your session asks for. **Never `git push`.** Noy pushes herself. Do not commit `dist/`, `node_modules/`, `video/v1/frames/`, `video/v1/tts/` or any key.
- Then STOP and hand back the report.

## 1. Context to read first
- `planning/PRD.md` sections 5 (video, handoff, selfcheck), 6 (video player, toggle row, chip), 8.
- `content/l4-slice.json` screens V1, S19, S20 and `chapters[ch5]`.
- `genai-for-marketing/s1-ai-awareness/src/captions.js` (lift `parseVTT` and the strip-under-media idea).
- Your P1 code: `templates/decision.js`, the event bus, `tools/walk.mjs`. P2 outputs in `assets/video/`.

## 2. Scope
1. `src/templates/video.js` (V1):
   - Before play: title, "Watch for this" label (`ui.videoGuidingLabel`) + `guidingQuestion`, poster, Play button (red CTA). No autoplay.
   - Player: native `<video>` without native controls; custom controls (play/pause, time, seek bar, captions toggle, Transcript); captions on by default, shown in a strip under the video inside the card (lift `parseVTT`); transcript = a dialog listing the VTT cues.
   - Stops from `v1.cues.json`: on `timeupdate` (and a `requestAnimationFrame` guard for accuracy) pause at `stop.t`; the frozen video shrinks to the left 40% of the card, the question panel takes the right 60% (`ui.videoStopLabel` "Question 1 of 2", question, three options using the `single` decision behaviour); feedback in the feedback row; resume only after the correct option (button "Continue" resumes playback). First attempt emits the tracking event (L4_V1_1, L4_V1_2).
   - Seeking: allowed backwards and up to the next unanswered stop; never past it. After both stops are answered, free seeking.
   - Video end: feedback row shows Continue (advance `after-video-end`). Replay allowed.
   - Keyboard: Space/K play-pause when the player has focus, arrows seek 5 s within the allowed range, C toggles captions. Announce stops through the feedback row.
   - Reduced motion: no zoom animation into the stop layout (instant switch).
2. `src/templates/handoff.js` (S19):
   - Brief state: title with workbook icon and time chip right, four numbered steps middle, privacy/coach line left and "Open workbook" right bottom. Open = `window.open(href, '_blank', 'noopener')` from the click, plus a visible fallback link if the open is blocked; feedback `openFeedback`; "I'm back" appears after Open (and on resume when `opened` is set).
   - Return state: same grid; metric field (250, counter, privacy line), Save, `savedFeedback`; Continue after Save. `backFeedback` shows when the learner presses "I'm back".
   - Store `opened` / `returned` flags and the metric text (`L4_METRIC`); emit L4_S19_1 (fill-in, neutral) on first Save.
   - The hint shows in the brief state before Open.
3. `selfcheck` variant in `templates/decision.js` (S20):
   - Step 1: three rows, question left with icon, Yes / Not yet segmented control right (`aria-pressed`); each answer shows its per-choice feedback in the row (neutral style); the row's first answer emits L4_S20_1 to _3 (letters a = Yes, b = Not yet; result neutral); learners can change answers (changes to suspend data); Continue to step 2 when all three are answered. "Reopen workbook" link bottom right.
   - Step 2: five chips top (single select), checklist strip bottom (`strip`); any chip shows its feedback; first pick emits L4_S20_4 (letters a to e); Continue.
   - Then the chapter pause marker `chapters[ch5].pauseMarker`, then the slice end (`ui.sliceEnd`) with Finish. Finish calls the tracking bus `complete` event (P4 maps it to lesson_status).
4. Remove the P1 temporary placeholders for V1, S19, S20.
5. Extend `tools/walk.mjs`: V1 full path (use `playbackRate` 4 and seek to just before each stop to save time; assert pause within 0.25 s of `t`, seek past a stop is refused, wrong answer does not resume, right answer resumes); S19 open (intercept the new tab, assert URL equals `links.workbook`), I'm back, empty and filled Save; S20 all rows, change one answer, chip, pause marker, Finish.

## 3. Constraints
- Video box keeps 16:9 inside the 922 px card; caption strip and controls fit inside the card; nothing overlays the feedback row.
- The workbook URL comes only from `links.workbook`. Never embed the workbook in an iframe here (it has its own live coach and PDF export).
- Neutral results never use teal or error colours.

## 4. Steps
1. Read section 1; short plan.
2. Video template, then handoff, then selfcheck, then slice end.
3. Extend and run `tools/walk.mjs` for the whole slice S01 to S20 by keyboard.
4. Screenshots; README phase status; commit `EAI L4 P3: video player with cue stops, handoff, self-check`. STOP.

## 5. Definition of done (run these yourself)
- `npm run check` passes; `node tools/walk.mjs` passes the full slice end to end (both FT1 routes).
- Stops fire within 0.25 s of their cue; seek-past refused; resume only after correct.
- The tracking bus logged exactly these first-attempt ids, once each: L4_S01_1, L4_S02_1, L4_S02_2, L4_FT1_1, L4_V1_1, L4_V1_2, L4_S03_1, L4_S19_1, L4_S20_1, L4_S20_2, L4_S20_3, L4_S20_4 (12), plus one `complete`.
- No zone overlap on any state (walk script bounding boxes).

## 6. Hand back to Noy
- Screenshots in `review/p3/`: `v1-before-play.png`, `v1-playing-captions.png`, `v1-stop1.png`, `v1-stop1-wrong.png`, `v1-stop2-correct.png`, `v1-transcript.png`, `s19-brief.png`, `s19-opened.png`, `s19-return.png`, `s19-saved.png`, `s20-step1.png`, `s20-step1-notyet.png`, `s20-step2.png`, `s20-pause-marker.png`, `slice-end.png`.
- Report (max 15 lines): results, stop accuracy measured, anything that behaves differently in Chrome's popup blocker, "Next".


## Report file (required)
Also save the final report as `review/p3/REPORT.md` (same text you print), together with the screenshots, before you commit. The planning model reads it from there.
