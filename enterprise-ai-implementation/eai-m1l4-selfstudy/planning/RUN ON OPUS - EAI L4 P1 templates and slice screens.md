# RUN ON OPUS: EAI L4 P1 templates and slice screens from JSON

Written 15 Oct 2026 (planning side). Opus 5.5, high effort. One session. Needs P0 committed.

## סיכום בעברית (לנוי)
**מה נבנה:** התבניות Decision ו-Input, והמסכים S01, S02, FT1 ו-S03 מתוך קובץ התוכן. כולל: רמז לפני פעולה, ירוק-טורקיז לתשובה נכונה, אדום כהה על רקע ורדרד לטעות, Continue רק אחרי תשובה נכונה, מקום לתמונת האווטאר של דנה (עם תחליף זמני), מונה תווים 0/250, והניתוב של אתגר ה-fast track. הסרטון, ההעברה לחוברת והדיווח ל-LMS יגיעו בשלבים הבאים.
**מה לבדוק:** שכל מסך נראה מאוזן (לא כל הטקסט בפינה אחת), שהמשוב לא מכסה תוכן, ושאפשר לעבור הכול עם מקלדת.

## Rules for every phase (read first)
- Work only inside `enterprise-ai-implementation/eai-m1l4-selfstudy/` (plus reading the reference paths named below). Never edit GFM S1, Practice Studio or `eai-m1l4-class`.
- Read `planning/PRD.md` and `content/l4-slice.json` before you start (P0 creates `content/l4-slice.json` as a copy of `planning/content/l4-slice.json`; from then on `content/` is the live file and the planning copy stays frozen). The PRD wins over your own taste; the storyboard wording in the JSON is fixed (fidelity first). If something in the PRD is impossible, stop and say so in the report instead of improvising.
- No learner-facing text in `src/`: every string comes from the content JSON. No em dashes anywhere (code comments included). No italics.
- WCAG 2.1 AA is part of the build, not a later fix (PRD section 8).
- Run this phase only. No sub-agents. Keep the scope; list anything extra you notice under "Next" in the report.
- Commit locally at the end with the message given below, plus the attribution lines your session asks for. **Never `git push`.** Noy pushes herself. Do not commit `dist/`, `node_modules/`, `video/v1/frames/`, `video/v1/tts/` or any key.
- Then STOP and hand back the report.

## 1. Context to read first
- `planning/PRD.md` sections 5, 6, 8. `content/l4-slice.json` screens S01, S02, FT1, S03 and `characters.dana`.
- Your own P0 code: `src/engine.js`, `src/zones.js`, `src/tokens.css`, `src/tooltip.js`.

## 2. Scope
1. `src/avatar.js`: avatar slot per character. `avatar.src` null = placeholder (navy circle, white initial, "Fictional character" badge from `ui.fictionalBadge`); a real image when set (object-fit cover, alt from content). Check the slot with a temporary local test image, then revert to null.
2. `src/templates/decision.js` with variants:
   - `single` (S01): click an option = answer. Chosen option takes the state colour, the others dim; feedback in the row with "Correct." / "Not this one." prefix; wrong = retry (all options re-enabled after the learner acts again); Continue only after correct.
   - `challenge` (FT1): one attempt (`attempts: 1`). Correct on first try = feedback plus two buttons from `routing.correctFirstTry` ("Jump to the last task" goes to S03, "Watch the video" goes to V1). Wrong = feedback plus Continue to V1. "Skip challenge" link goes to V1. Store the route (`skip` / `full`) in state.
   - `multi` (S03): select exactly `select` cards (toggle, `aria-pressed`), Check enabled at 2; after Check every chosen card shows its state; feedback is paged ("1 of 2", Previous / Next) through the chosen cards; any wrong = deselect the wrong ones and try again; Continue only when both keys are chosen. The 2x2 grid is arrow-key navigable.
   - `selfcheck` is built in P3 (leave a clear stub).
3. `src/templates/input.js` (S02): labelled fields, `maxlength` 250, live counter `{n}/{max}` from `ui.counter`, privacy line with shield icon, Save always enabled. Empty field on Save = `feedback.empty` (neutral tone, not an error colour). Saved = `feedback.saved`, Saved indicator in the top bar, Continue appears. Values stored under `store` keys (for now through the P0 local stub).
4. Layout by role, exactly as the storyboard `Layout` lines: S01 avatar + label + two bubbles top, three options in a row bottom; S02 purpose line top, two stacked fields middle with counters right, privacy line left and Save right bottom; FT1 lightning line top, question middle, three options row bottom, Skip link bottom right; S03 history line top, 2x2 grid middle, Check bottom right.
5. Tooltips: underline the first occurrence of each `terms` entry on the screen (S03 "No success metric" card: the term sits inside a button, so expose the definition with `aria-describedby` on the card and a visible info dot, not a nested focusable element).
6. Chapter-end pause marker: after S03 is correct and the learner presses Continue, the feedback row shows `chapters[ch1].pauseMarker` with Continue (to the next slice screen, S19 in the slice).
7. A tracking event bus (`src/tracking/index.js` stub): every first answer emits `{trackingId, type, response (letters in on-screen order, text for fill-in), result, latencyMs, at}`; retries emit `retry` events. P4 plugs the SCORM adapter into this. Log events to the console in `?debug=1`.
8. Extend `tools/check.mjs`: on-screen word count per screen at most 45 and every feedback/hint at most 25 (storyboard counting rule: instruction line and action buttons excluded), every interaction has full tracking metadata.

## 3. Constraints
- Content distributed by role; never one text block in the middle of the card (Noy's main complaint). Use the full card height.
- Feedback row never overlays the card. Text never clipped; if a label does not fit at 20 px, fix the layout, do not shrink below 16 px.
- Hint text shows before the first action; after an action the row shows feedback only.
- Correct = teal (`--w-teal` border/fill, `--w-teal-text` text). Wrong = `--w-error` text on `--w-error-tint`. Red #EE3124 never marks an error.

## 4. Steps
1. Read section 1; write a short plan.
2. Avatar, decision (single, challenge, multi), input, pause marker, event bus.
3. Wire S01, S02, FT1, S03 from the JSON. Temporary screens for V1, S19, S20 show "Built in P2/P3" from a dev-only string (not learner-facing; keep it out of the content file and remove in P3).
4. Extend `check.mjs`; run it.
5. Walk every path with puppeteer: S01 wrong then right; S02 empty Save then Save; FT1 right (both buttons), FT1 wrong, FT1 skip; S03 one wrong + one right, then both right, paging both ways.
6. Update README phase status. Commit `EAI L4 P1: decision and input templates, slice screens S01 S02 FT1 S03`. STOP.

## 5. Definition of done (run these yourself)
- `npm run check` passes (word counts, metadata, no em dash).
- A puppeteer script (`tools/walk.mjs`, keep it for P5) completes all paths in step 5 with keyboard only (no mouse events) and asserts: Continue absent before correct, present after; feedback row text matches the JSON; focus lands on the instruction heading on each new screen; FT1 routes land on the right screen.
- No element of the stage card overlaps the feedback row on any state (bounding boxes compared in the walk script).
- Event bus logged exactly one first-attempt event per interaction id (L4_S01_1, L4_S02_1, L4_S02_2, L4_FT1_1, L4_S03_1).

## 6. Hand back to Noy
- Screenshots in `review/p1/`: `s01-hint.png`, `s01-wrong-a.png`, `s01-correct.png`, `s02-empty.png`, `s02-saved.png`, `ft1-hint.png`, `ft1-correct.png`, `ft1-wrong.png`, `s03-selected.png`, `s03-feedback-1of2.png`, `s03-pause-marker.png`, `s01-avatar-test-image.png` (taken with the temporary image).
- Report (max 15 lines): what was built, walk-script results, any layout compromise and why, new UI copy you needed (should be none beyond `ui`), "Next".


## Report file (required)
Also save the final report as `review/p1/REPORT.md` (same text you print), together with the screenshots, before you commit. The planning model reads it from there.


## P0 follow-ups (from the planning review, do these first)
1. Chapter numbering: Chapter 0 is confusing for learners. Show the entry chapter as "Start" (no number) and number the rest 1 to 6, so the readout says "Chapter 1 of 6" only inside "Why map". Update menu, progress readout and tooltips; keep internal ids unchanged.
2. Fast track: when FT1 is used to skip, mark the skipped screens' segments as done (filled) so the bar never shows holes; the chapter counts as done.
3. Replace the "→" glyph anywhere in UI with the arrow icon from icons.js (the font subset has no arrow).
4. Hide the feedback-row icon when a screen has no hint text.
5. Space distribution (most important, Noy's main design rule): in every template the stage card content must be distributed by role across the card height (top / middle / bottom or left / right). No large empty band in the card (see review/p0/demo-wrong.png: options sit mid-card with a big empty top area). Add a test-fit check that flags any vertical gap inside the stage card larger than 25% of the card height.
