Weekly usage (all models) before: 22%.

# QA1 report: the QA tester's findings (EAI M1 L4 self-study, 26 Oct 2026)
Commit: local only, NOT pushed. Inputs: the QA report of 25 Oct ([QA-REPORT_2026-10-25.md](QA-REPORT_2026-10-25.md), Hebrew [QA-REPORT_2026-10-25_HE.md](QA-REPORT_2026-10-25_HE.md)), every finding checked against the code, the workbook and the source deck `EAI-M01-L04.pptx`. The full finding-by-finding triage (Hebrew): [QA-TRIAGE_2026-10-26_HE.md](QA-TRIAGE_2026-10-26_HE.md).

## 1. Bugs fixed
- Bug 1, S05b Label: the "Drop here" chip sits half outside its place and had `pointer-events: none`, so a drop on it fell through to the diagram. `src/drag.js`: the chip counts as the target for drag and for click; `frame.css`: the S05b chip takes a click. Checked by hand (drag and click on the chip's top half).
- Bug 3, input screens: an edit after Save brings the hint back instead of leaving "Saved." on (`input.js`).
- Bug 5, videos: answered stops are kept in the screen flags (`stops`); a return cues the film at the last answered stop, not 0:00 (`video.js`). Checked on V2.
- Lesson record: holds the S22 takeaway, and the knowledge check item by item (S21R's short names, `stemB` on a version b retake, right or missed on first try). Checked after a version b retake: "Feedback baseline", "Sales map errors", 4 of 5 (80), attempt 2.

## 2. Content fixed (`content/l4-slice.json`)
S01 b feedback (no facts the learner has not seen) · S03 "warn against" (instruction, top line), d feedback and feedbackCorrect, case 2 "2024 to 2025" · K1 caption "Map, cut steps, then speed up." and alt · S06 sub "A fixed set of fields, in a table" · diagram: "Handle escalation" in the HR manager lane, both alts · S08 r3 "the Handoffs and Gaps fields" · tooltip "Field 8" defines the field, guardrail framed as after the change · S12 Field 3 "Receiving the request (HR staff)" · S14 wrong lines no longer give the answer · S15 hint "Recall what the car company did with its slowest step." · S16 card 6 "Pass on the case history" · S17 cases a and e without the definitions' words · S18A cards out of field order (correctResponse "3.c,1.a,4.d,2.b", walk expectations updated) · S21 i3/i3b and i4/i4b state the estimate vs "unclear" rule.

## 3. Workbook (`eai-m1l4-class`, from Practice-Studio, commit e78a850 there)
Field 5: the four levels in the help, the check message and the grounding pack (old tags still pass; confidential and restricted now pass) · Field 8 "by when" · intro without "in class" · grounding pack for self-study. A build without changes equals the published page except the post-build CLEAN SHEET / LOGO block (557 lines), which was spliced back unchanged; the published page differs only in its three data lines (ACTIVITY, CHECKS, LIVE). `eai-m1l4-class-es` unchanged.

## 4. Photos (mirror per screen: `photo.mirror`, `zones.js` + `frame.css` `scale: -1 1`)
- W4, S14, S15: ch5-critical-eye mirrored. The manager's face now shows in the gap between card and panel (unmirrored it sat behind the panel). A new image with the person in a side third would still be better.
- **W3: regenerate.** Mirrored, the man's face shows but the woman's goes under the answers card; reverted to the original.

## 5. `assets/img/_originals/`
Untracked (`git rm -r --cached`, 16 files), added to `.gitignore`, files kept locally. SOURCES.md says so; the copies committed before remain in the git history.

## 6. Second round (Noy: "everything you can, as little covered as possible")
- Bug 6, ghost hand: the "Pick one / Pick two" chip shows only once the hand has stopped (it no longer travels over the options); a single odd row sweeps through the gap after its first card; S05b's carried label stops at 30% of the way toward the diagram's lower part, clear of the end event (measured: no overlap; before, it covered the circle). The chip's opacity is set through the CSSOM (a style attribute is blocked by the page CSP).
- Bug 7, captions: `media.captionPlaces` (V1, V2): a cue that overlaps a range shows at the top, top-left, top-right or bottom-left, clear of the film's own labels (read off both films every 2 s). V2 keeps its captions in the left 60% from 0:24, beside the film's AS-IS map panel (they covered its bottom rows). Left as is: V2 1:33 to 1:42 (the from / to / what passes chips repeat the caption's words; the lane diagram fills the top).
- Bug 8, a stop or the transcript open: the h1 stays on one line (26.88 px) and "Watch for" (16.64 px) stays above the frame. The film's own AS-IS panel text cannot grow without a new film.
- Bug 9: Finish lesson opens END at once. Bug 10: a takeaway already picked shows its line again. Bug 13: the next screen's photo is preloaded.
- S07: the tiles close when the question comes (opened in order, Field 8, the answer, stayed open).
- W3: mirrored after all. The man's face now shows (before, both faces were under the cards); the woman's still sits under the answers card. **W3: regenerate** stays the full fix.
- V2 film re-rendered (`$env:FILM="v2"; node video/v1/render2.mjs full`): Steps "Receive" with the role HR staff; in the lanes, Receive in the HR staff lane and a "Question" box in the Employee lane (`film2.html` lanes: optional `trigger` and `firstLane`; V1 does not use lanes). Same length (168.323 s); VTT, cues and poster byte-identical; audio levels identical (mean -19.1 dB, max -4.0 dB). Stills: [screens/](screens/).
- Workbook coach prompts (Practice-Studio): the tag is chosen first by a stated standard; no praise words with Light or Revise; the whole-canvas review holds each criterion to the per-field standard. The field lock itself is the shared engine's (all workbooks), unchanged.

## 7. Not changed
5 items, one miss = 80 (a decision) · findings that match the source deck or earlier decisions (nine-field template, two slogans, three good fits, Save to continue, warm-ups) · bugs 4, 11, 12 (tester's environment) · the film's own small AS-IS panel text.

Note: commits 35deebf (14:50) and 77520c7 (15:26) were made and pushed from GitHub Desktop while this run was still working; 77520c7 holds the second round before its tests, with the ghost chip's style attribute (a CSP console error, fixed in the commit after it) and the old V2 film. The CO1 coach work in the same folder (src/coach/, content/coach/, the coach parts of l4-slice.json, frame.css, tokens.css, icons.js, engine.js) belongs to another session and is not in this run's commits.

## Tests (all green)
check passed · test:fit --sizes=1280x720,1600x900 passed · walk passed · test:review passed · test:scorm passed.

Weekly usage (all models) after: 22%.
