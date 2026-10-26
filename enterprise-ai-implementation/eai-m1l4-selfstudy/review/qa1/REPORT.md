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

## 6. Not changed (see the triage)
V2 film still shows "Receive (employee)" (re-render) · V1 captions over the year labels · Practice Studio engine: a field loses its lock after a live "Light" (all workbooks) · 5 items, one miss = 80 · findings that match the source deck or earlier decisions (nine-field template, two slogans, three good fits, Save to continue, Next after Finish, warm-ups) · bugs 4, 11, 12 (tester's environment).

## Tests (all green)
check passed · test:fit --sizes=1280x720,1600x900 passed · walk passed · test:review passed · test:scorm passed.

Weekly usage (all models) after: 22%.
