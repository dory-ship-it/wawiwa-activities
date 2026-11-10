# FX4 report: fixes pass, Phases 1 to 3 (checkpoint), 5 Nov 2026

Work order: "EAI M1 L4 self-study: fixes pass (no visual redesign)" (Dor's pilot review 1-2 Nov, Noy's notes 5 Nov).
**Where:** the copy `enterprise-ai-implementation/eai-m1l4-selfstudy-fixes/` (Noy: work on a copy). The live folder `eai-m1l4-selfstudy/` is untouched. Nothing committed, nothing pushed. Preview: `npm run serve` in the copy (or the "eai-l4-fixes" preview on port 8127).
**Stopped at the Phase 3 checkpoint.** Phase 4 (Blossom report) and the final QA wait for approval.

## Done when (Phase 1): a learner-mode run O1 to END with wrong answers everywhere never gets stuck
`node tools/walk-wrong.mjs --mode=fill|wide|tall` runs the lesson in learner mode inside `tools/blossom-frame.html` (a top bar + the lesson in an iframe), answers wrong first on every screen, and checks on every screen that Previous and Next are inside the visible frame. **All three pass: END reached, no fit failure, no page error, every locked Next with a visible line.** Screens of each run: `review/fx4/walk-fill/`, `walk-wide/`, `walk-tall/`.

## What changed, per area
| Area | Change | Where |
|---|---|---|
| Locked Next | A visible line beside it says what is missing; counts where the template knows them ("Open the 5 remaining fields.", "Place 3 more cards, then Check."). Unlocked: "Up next: <step>" or the next chapter (none when the same step goes on). Video: the line sits above Next. | `zones.js`, `engine.js` (needLine, upNextLine, ctx.need), `ui.footer.need` |
| Locked Check | Its reason beside it ("Pick 2 first.", "Place every label first.", "Change the red ones first.") | `decision.js` checkButton, `zones.setTool` |
| 2 tries, then the answer | Every scored template and the video stops: "Not quite. One more try." after the first wrong answer; after the second the right option is marked (teal + check) with one sentence why, and Next (or Resume) opens. No attempt dots. | `zones.js`, `decision.js`, `explorer.js`, `video.js` |
| Hints | Behind a small "Hint" link in the band row; gone once the screen is done. No template prints a hint any more. | `zones.js`, templates |
| Show me how / ghost hand | Hidden on arrival; after 8 s idle (the demo plays) or the first wrong answer. None on choice screens and video stops. | `ghost.js`, `engine.js`, `decision.js`, `video.js`, `explorer.js` |
| S07 | Opens on click only (no flip), an opened tile keeps its check, "3 of 8 opened", the question in verb-first form. | `explorer.js`, content |
| S18A | A wrong Check empties the wrong rows (they stay red); "Change the red ones, then Check."; Check says why it is locked. | `decision.js` fields |
| Drag | Click a card, then click a column (existing, now visible: columns turn navy while a card is picked up, light up under the pointer); bigger drop zones; no "Press 1 to 4" text on screen (keys still work). | `frame.css`, content hints |
| S13 | No separate "Drop here" slots: each whole step is the drop target. **Deviation:** the order says remove the invalid slots only; that would leave two slots for two flags and give the answer away, so all slots went and the steps took their place. | `flags.js`, `frame.css` |
| S05b | The Gateway and Swimlane labels moved off "Yes" and the flow line. | content targets |
| S20B | A picked option shows a filled radio (it showed a white check on white); each line starts "In your workbook:". | `stage.js` paintAnswer, content |
| Blossom fit | The stage fits the visible part of its frame (same-origin parents: their window and any clipping box). | `engine.js` visibleBox |
| Next | Turquoise with an ink label, 6.0:1 (white on turquoise is 2.5:1, navy 3.1:1: both fail AA). One soft ring when it unlocks. | `frame.css`, design log |
| Top bar | "Chapter N of 7" and the step discs about 1.5x. | `frame.css`, `zones.js` |
| Video | Speed 1, 1.25, 1.5, 2 in the player bar, kept for the session; stops still pause. | `video.js` |
| Sorts | A tag on every checked card (why it belongs there); S04 distractor "HR staff send the answer back"; S04 / S16 cards without the words that named their columns. | `sortdeck.js`, content |
| Words | Practice screens at most 35 words (answer options not counted), presentation 45, feedback lines 20; all `wordLimit` allowances gone; 75 lines rewritten (one plain sentence why); S08 round 3 plain. All 109 screen views pass. | `words.js`, `check.mjs`, `tools/fx4-content.mjs` |
| Definitions | Tooltips on the term, no boxes (S11 Baseline / Target / Date, S14 handoff, S15 bottleneck, S05a BPMN). | content |
| Workbook thread | O2: "By the end you will have your own process map, exported as a PDF." S08B: "It goes into workbook Fields 2 and 3 in Chapter 6." S12B: "This goes into Field 8 of your workbook in Chapter 6." | content |
| S19 | Three screens: S19A brief (presentation, one workbook screenshot), S19B Open (Next after Open), S19C "Did you export your PDF?". Nothing new tracked; a saved place or flag on the old S19 carries over to S19B. | `handoff.js`, `engine.js`, content |
| S22 | Step 2 has its own heading "Bring your PDF map to Lesson 5.", Finish is the main button, the record is "(optional)" and Finish no longer asks for it. | `decision.js` close, content |

## Not done, or done differently (decide)
1. **S17B** got no "This goes into Field N" line: its notes are not a workbook field (S19 always said "Not on the map: for Lesson 5"). Its line now reads "Not on your map: Lesson 5 starts from this note." The S17B notes card also left S19B for the same reason (it is still in the downloaded record).
2. **S13**: all "Drop here" slots removed, not only the invalid ones (see above).
3. **The PP1 variants** (S09 to S17 support / stretch) were edited in the content directly by `tools/fx4-content.mjs`. Rerunning the old `tools/pp1-content.mjs` would bring the old lines back.
4. **Old test suites**: `npm run check` passes. `walk.mjs`, `test-review.mjs` and `test-scorm` still expect the old behaviour in places (attempt markers, S19, the hint lines); they were not rewritten in this pass (see the test section below for what ran).

## Files
Changed: `src/zones.js`, `src/engine.js`, `src/ghost.js`, `src/drag.js` (unchanged logic), `src/templates/{decision,explorer,sortdeck,bpmn,flags,handoff,video,input,stage}.js`, `src/review/words.js`, `src/frame.css`, `content/l4-slice.json`, `tools/check.mjs`, `planning/design-decisions-log.md`, the `?v=` stamps.
New: `tools/fx4-content.mjs` (all content edits, one run), `tools/walk-wrong.mjs`, `tools/blossom-frame.{html,css,js}`, `tools/shots-fx4.mjs`, `tools/fx4-workbook-shot.mjs`, `assets/img/l4/s19a-workbook.jpg`, `assets/img/prompts/S19A-workbook-shot.md`, this report.

## Checkpoint screenshots (learner mode, 1280 x 720): `review/fx4/`
01-04 S04 (start, a card placed, after a wrong Check, done with tags) · 05-07 S07 (start, three opened, the question after a wrong answer) · 08-11 S14 (start, hint open, one more try, revealed) · 12 S19A · 13-14 S19B (before and after Open) · 15-16 S19C (question, Not yet) · 17-19 S22 (step 1, takeaway, step 2).
