# EAI L4 NL4: Chapters 5-6 on storyboard v3 + FX1 follow-ups (22 Oct 2026)

**Precondition.** FX1 committed (`1b2f5be`), tree clean at the start. Two commits arrived during the run: `14e6fcb` (version stamp) and `daca5c2` "Update l4-slice.json" (my first S18A / S18 / S18B content edits, committed as they were). Built on top; nothing conflicted. Not pushed; `video/`, `assets/video/` untouched.
**Commits:** `f732dc1` B (Ch6, SCORM) · `410ac4c` stamp · `862ca90` tests + shots · `bb920ee` A, C, D, E (Ch5, anchors, copy, FX1 follow-ups; landed after B: the first try stopped on the deleted sort.js path) · last: this report and `screens/`.

## Screens ([shots](screens/), 1280x720)
| Screen | What it is now |
|---|---|
| S18A | Sort deck (as S04): header chip, hint line, four columns with subtitles, check after all, two attempts. [01](screens/01-S18A-start.png) [02](screens/02-S18A-checked.png) |
| S18 | Single on Stage: the coach line on the case card over the chapter photo, Show me how + attempts there. [03](screens/03-S18-stage.png) |
| S18B | New. Input: "Your case" card, the title pre-filled, checkbox, filled Save, "Save to continue". [04](screens/04-S18B-start.png) [05](screens/05-S18B-unticked.png) |
| S19 | Rebuilt, document view: eyebrow + "About 40 min", 3 steps, hint, workbook preview (8 rows, Fields 1/2/3/8 marked), four copy cards with Copy + field chip, bold return line, coach line, Open workbook. Next unlocks on Open. [06](screens/06-S19-start.png) [07](screens/07-S19-empty.png) [08](screens/08-S19-opened.png) |
| S20 | Context line, the three questions as a checklist figure (mark ticks on Yes), Yes / Not yet, the fix line while any is Not yet. [09](screens/09-S20-answered.png) |
| S20B | New. Five mistakes, name + one-line definition, any pick, the fix in the strip, note + Reopen workbook. [10](screens/10-S20B-picked.png) |
| S21 | Items unchanged; step "Check"; options shuffle on a retake (items 1-4; item 5's tiles keep the map order). [11](screens/11-S21-item-1.png) [15](screens/15-S21-retake-shuffled.png) |
| S21R | New. Score ring, score line, Passed / Not passed yet, missed items with "Review Chapter N", Retake now; Next open. [12](screens/12-S21R-not-passed.png) [13](screens/13-S21R-passed.png) |
| Review link | Opens the screen with "Back to the check" in the footer. [14](screens/14-S12-back-to-check.png) |
| S22 | Stage: the new bridge line on the case card, the panel right; record adds metric rows, notes, attempt. [16](screens/16-S22-step-1.png) [17](screens/17-S22-step-2.png) |
| E1, E2 | Filled Save + "Save to continue" on S08B, S12B, S17B, S18B; "Your case" card on S02, S08B, S12B, S17B, S18B; S03 case thumbnails. [18](screens/18-S02-case-card.png) [19](screens/19-S08B-case-card.png) [20](screens/20-S03-thumbs.png) |

## Built by analogy (no frame yet)
S19 copy cards + workbook preview; S21R result + ring; the "Back to the check" footer chip; S20 checklist marks; S20B definition cards (answer card + sub line); S18B checkbox in the action row; S22 on Stage (bridge on the S14 case card, 50% panel); the slim "Your case" card (S02: top right of the panel); S03 thumbnails.

## SCORM changes
- Out: L4_S19_1. Moved, same ID: L4_S18_2 to S18B, L4_S20_4 to S20B. S18A tray to deck, same matching pattern.
- S21 sends the option's id (a shuffled retake still reports "c"). A retake clears the check's first answers: each attempt appends its five interactions (tested in the mock: 5 + S22 + 5 = 11).
- New `score` event at the end of each attempt: score.raw = latest attempt; lesson_status `passed` as soon as an attempt reaches 80, sticky (finish never downgrades). Below 80, finish = failed. The adapter now takes "finished" from the state, so a pass before S22 keeps exit "suspend".
- suspend_data: `k` = { n attempt, s last score, p passed }. 2189 chars after the lesson, 3035 with every free-text field full (limit 4096).
- ui: footer.locked safety and handoff out, openWorkbook in; buttons.back out; copy, copied, retake, backToCheck, copyFallback, caseCard in. Record scoreLine adds "attempt {a}".

## Robustness (D)
- Copy: navigator.clipboard, else the card's rows are selected and the button says "Press Ctrl+C" (both paths in the walk).
- Published links: eai-m1l4-class 200 ("AS-IS Process Mapping for Your Own Use Case"), eai-m1l4-home 200 ("Completing the Process Map Toward AI Architecture").

## Checks (one full run after the last code change)
- `check`: **passed**, 0 mojibake, stamp current (?v=27c63b76 on 99 links).
- `test:fit --sizes=1280x720,1600x900`: **passed (548 ok)**, new states for S18A to S22, S21R and the review chip.
- `walk`: **passed (565 ok)**; new: S18A to S22 by keyboard, Copy and its fallback, the retake (shuffled), a review link and its chip.
- `test:scorm`: **passed (493 ok)**; new: the retake in the LMS mock (11 interactions, score.raw 100, passed after a failed finish).
- `test:review`: **passed (19 ok)**. Screenshots: 20 in `screens/` (`node tools/shots-nl4.mjs`).

## Deviations
1. Step icons must be glyphs (check.mjs): Map = `overview` (folded map), Review = `explore` (magnifier), Finish = `start` (flag), Check = the check-circle icon redrawn on the glyph grid (`check`).
2. Word allowances: S18A 60, S20B 60, S21R 120 (all five missed), S19 125 (Q6).
3. Chapter minutes = sum of the screens: Ch5 57, Ch6 15 (storyboard ~60 / ~16); the progress % moved (Ch1 10% to 12%).
4. Height fixes to stay within 41cqw: S18B checkbox in the action row; S19 steps without boxes, preview names cut on screen (full in the alt); S20B Reopen workbook in the note row; S22 heading 30.7px.
5. S21 ends with Next focused (no auto-jump to S21R); a revisit of S21 shows the old result line.
6. S20B has Show me how (choice sweep); S20 and S19 have none (S19: the hand points at Copy once).
7. The old sort tray is gone (sort.js, its CSS, the walk's tray helper).
8. Commits by file: files that carry several groups went with the first group that needs them.

## Open questions
1. S21R worst case is 120 words: cut the stems to one line, or keep?
2. "Press Ctrl+C" on a Mac reads wrong: "Press Ctrl+C (Cmd+C on Mac)"?
3. S19 card 1 has no heading (as the storyboard): add "Your case"?
4. Pilot copy: ring alt "{p} of 100", the preview alt, "Press Ctrl+C." in the strip.
5. The clipboard fallback is tested with a blocked clipboard in Chrome, not inside Blossom.

Weekly usage (all models): before 12%, after 14%.
