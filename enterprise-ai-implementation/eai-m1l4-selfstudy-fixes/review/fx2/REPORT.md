# FX2 report: EAI M1 L4 self-study, Noy's fixes (22 Oct 2026)
Commits (local, NOT pushed): `866aad3` code, content and tests (one commit: the groups share frame.css and the content file, so per-group commits were not clean to split); report and screens in the commit after it. Screens: [screens/](screens/) (1280x720; `-1600x900` copies), main state only.

## Final run (all green)
check passed · test:fit --sizes=1280x720,1600x900 passed (556 checks, new F check included) · walk passed · test:scorm passed · test:review passed.

## A. Video player (V1, V2): [02](screens/02-V1-ready.png) [03](screens/03-V1-transcript.png) [04](screens/04-V1-stop.png) [04 at 1600](screens/04-V1-stop-1600x900.png)
- Heading block under the bar: h1 instruction, meta line "Two cases, same lesson · Video · 2:54 · 2 stops", "Watch for: ...".
- Bounded 16:9 frame: closed = centred, 60% of the stage width (capped by height: 768 px at 1280, 797 px at 1600); transcript open or a stop = left, 55% (capped), panel right (38%), same height as frame + bar, scrolling, cue marked.
- Player bar under the picture, attached, same width. Caption inside the picture, bottom centre. Stop: panel right (kicker, question, answers, Show me how, Resume, strip); transcript closes and comes back after Resume. Footer untouched.
- Deviation (Noy, mid-run): clean dark ground behind the video (no chapter photo, new scene "plain").

## B. Sort columns show the card text: [05](screens/05-S04-placed.png) [06](screens/06-S09-placed.png) [07](screens/07-S16-placed.png)
- Placed card = its own text, 15.36 px, up to 2 lines (replaces the "Card n" token). Columns start higher (222.72 vs 314.88), deck text 28 -> 23 px. A column that would reach Previous/Next turns dense (1 line per card, full text for screen readers).
- S05b/S12/S13 already show their labels (no tokens): unchanged. Text change: S16 card 6 "Summarize a question before escalation" -> "Summarize before escalating" (3 lines in its column).

## C. One bar on every screen: [01](screens/01-O1-bar.png)
- O1 was the only screen without it: now the dark Kit 13 bar (its own logo removed). Bar 97.28 -> 80.64 px (-17%): logo 84.5 -> 70.4, title 23 -> 20.5 px, step disc 41 -> 34.6 px. Panels re-centred from the bar height; all screens re-checked by test:fit.

## D. Fewer drags (8 -> 6): [08](screens/08-S17-case-1.png) [09](screens/09-S17-wrong.png) [10](screens/10-S18A-rows.png) [11](screens/11-S18A-checked.png)
- S17: one case at a time ("Case n of 5" + dots), the five mistakes as answer cards (name + definition, 3 columns), 2 tries then reveal with explanation, "Next case", Show me how = choice sweep.
- S18A: workbook rows (number, field, line) with a select of the 4 cards; Check after all, 2 attempts, then reveal. Sort-deck code for S17/S18A removed (placedLabel, deckSize, wide deck, Case/Card chips).
- SCORM S17 `L4_S17_1` (matching, correct `a.3,b.1,c.5,d.4,e.2`): before = answer at the first Check (each case's column), retry at the second. After = same id and pattern, sent when the last case is done: each case's FIRST pick (`a.5,b.1,c.5,d.4,e.2`/wrong in the walk), plus one retry with the final picks if any case took a second try.
- SCORM S18A `L4_S18A_1` (matching, correct `1.a,2.b,3.c,4.d`): before = card.column at the first Check. After = same: each card's row at the first Check (walk: `1.b,2.a,3.c,4.d`/wrong; one card per row, so two cards can no longer share a column); second Check = retry.
- Text: S17 instruction "Read the five mistakes, then drag each case to the one it shows." -> "Read each case, then pick the mistake it shows."; hint "Drag the card to a column. Or press 1 to 5 ..." -> "Two tries per case."; S18A "Drag each card to its field." -> "Choose the card for each field." New ui: "Case {i} of {n}", "Next case", "Choose a card", two locked-Next lines.

## E. S19: [14](screens/14-S19-full.png)
- Open workbook in its own row at the end of the content (no overlap in any S19 state, both sizes); card 1 heading "Your case". Panel spacing tightened to stay within 41cqw.

## F. Text over text, ch5 (S18A, S18, S18B, S19, S20, S20B) + the general check
- New in tools/lib.mjs + test-fit: fail on two visible text runs intersecting (anywhere, every state, both sizes; whitelisted: ghost hand, tooltip) and on cut-off text in any text container without a scroller (whitelisted with reasons: S17B/S19 learner text, S19 preview field names, the "Your case" title, dense sort columns). Probe: a planted overlap and a planted clipped line are both reported.
- Hits and fixes: S16 checked/shown/done, both sizes: card 6 cut at 2 lines -> text shortened. S19 copy blocked, both sizes: "Press Ctrl+C (Cmd+C on Mac)" in the button squeezed the "Fields 2 and 3" chip (cut) and the panel grew to 550 px -> the button shows the keys "Ctrl+C", the strip the full line. S18B long title: the learner's own title cut on one line by design -> whitelisted. S04/S09/S16 shown: explain chip 40 px high -> 44 px.
- ch5 itself: the new check finds NO text over text in ch5, before FX2 (run on d009e40, six sizes) or after. The ch5 overlaps I could identify: S19 Open workbook (E) and the S18A deck (now rows).

## G. END: [18](screens/18-END-passed.png) [19](screens/19-END-not-passed.png)
- Dark bar, O1-style dark chapter photo + veil, logo centred, "Lesson complete" (turquoise "complete"), "Process Modeling and Workflow Mapping · Module 1", chip "Passed" (turquoise, check) or "Not passed yet" + "You can retake the knowledge check in Wrap-up at any time.", "Next: Lesson 6, in your own time." + S22's homework link. Previous only, not tracked, no score; finish/status logic untouched (walk: no event, status stays passed).
- Added to the slice, ch6, side menu and review.html (both read the content). S22: Next locked until Finish ("Next, locked until you finish the lesson"), then opens END. ui.finished "... You can close this window." -> "Lesson finished. Your result is saved."
- Deviation: there is no white logo asset; the existing logo (red, white type) is used, it reads on the dark photo.

## H. Decided questions
- H1 S21R [17](screens/17-S21R-not-passed.png): stems -> one-line topics ("Field 4 handoff", "First AI step", "Report baseline", "Field 7 unknowns", "HR map errors"); worst case 59 words, allowance 120 -> 60 (review links count as buttons, as everywhere).
- H2 "Press Ctrl+C" -> "Press Ctrl+C (Cmd+C on Mac)" (strip); new "Ctrl+C" on the button (see F). H3 = E. H4, H5: no change.

## Open questions
1. F: where exactly did Noy see text over text in ch5 (screen, state, window size)? The new check and the screens show none now.
2. Video: OK with the plain dark ground for both V1 and V2, and the first frame of the film (no poster) in the frame before Play?
3. END: is a white logo version wanted (none exists in assets/logo)?

Weekly usage (all models): before: not read at the start of the run; after: 15%.
