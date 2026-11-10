# FX3 report: EAI M1 L4 self-study (25 Oct 2026)
Weekly usage (all models) before: 17%. Commits: local only, NOT pushed (code, content and tests; then this report and the screens). Screens: [screens/](screens/) at 1280x720, `-1600x900` copies for S04, S16, S18A, S18, S19; Focus "before" shots in [before/](before/). Content edits: `tools/fx3-content.mjs` (idempotent, UTF-8). Shots: `tools/shots-fx3.mjs`.

## S21 review (Step 0)
Checked 1b-5b against chapters 3-6 (S10, S11, S14, K4, S16, S18A, S12B, V1). No change was needed. Each item has one clear key, and each distractor fails for the reason its feedback gives. Every feedback line is 25 words or fewer (check passes). 2b's "quality dropped in the fintech case" matches V1 (complex cases, "empathy and judgment"). 5b lines 4, 6 and 7 are not in the lesson's sales case but do not contradict it, and both errors can be found by rule (an AI step on the AS-IS map; client notes are CONFIDENTIAL). 5b shows 53 words with its heading, over the 45 rule, so S21 gets a word allowance of 55 (text unchanged).

## A. Top bar: [01](screens/01-S04-placed.png) [03](screens/03-S17-case-1.png) [04](screens/04-S20-start.png)
Dark Kit 13 bar on every screen (`zones.js` sets `data-bar` dark always; the light token `--wl-bar-focus-bg` is removed). Contrast under it re-checked by test:fit (568 checks, both sizes).

## B. Step labels (same icon set; the bar now accepts any icon of `icons.js`). check fails if two steps in a chapter share a verb or icon
Intro: Start, Overview, Goals, Decide, Write · Why map: Guess, Watch, Learn, Decide · Toolkit: Guess, Learn, Sort, **Read** (S05a, lanes), Label, Decide, Explore, **Spot** (S08, eye), Sketch · HR demo: Guess, Watch, Sort, Decide, **Measure** (S11, gauge), **Flag** (S12, flag), Write · Critical eye: Guess, **Scope** (S13), **Record** (S14, document), **Ask** (S15), Learn, Sort, **Spot** (S17, eye), Write · Build yours: **Match** (S18A, arrows), Decide, Write, Map, Review · Wrap-up: Check, **Score** (S21R, gauge), **Reflect** (S22, key), **Finish** (END, finish flag). [13](screens/13-S21R-not-passed.png) [15](screens/15-END-passed.png)

## C. S18A lettered cards: [05](screens/05-S18A-rows.png) [05 1600](screens/05-S18A-rows-1600x900.png)
Cards A-D (letter badge + text) and selects "A. text". Same values, Check, attempts and SCORM (`L4_S18A_1`, same pattern). Deviation: the list sits in a column left of the rows, not above them. Above them, the panel measured 619 px against the 524.8 px panel limit (41cqw) once feedback showed. Now 511 px.

## D. V1, V2: [08](screens/08-V1-ready.png) [09](screens/09-V2-ready.png)
New heading, and the meta line shows the title only. The player bar is unchanged (time, scrubber).

## E. Chapter numbers 1-7: [16](screens/16-S02-saved.png) [10](screens/10-W2-start.png) [07](screens/07-S19-full.png) [17](screens/17-S13-menu.png)
One source: `chapterNo()` in `src/util.js` (index + 1). Text uses `{chN}`, resolved on load by the lesson, review.html and the tests. Bar, side menu, review rows, the review toolbar and S21R links (now derived from the screen they open) use it. S21R: handoff and first AI step link to Chapter 5; baseline, Field 7 and HR map to Chapter 4. No "Chapter" in `src/` text (comments only).

## F. review.html: [19](screens/19-review-header.png)
Header now shows "content FX3, 25 Oct 2026 (storyboard v3)". Rows show Chapter 1-7; test:review checks both.

## G. S22 + END: [14](screens/14-S22-downloaded.png) [15](screens/15-END-passed.png)
The homework link is kept.

## H. Focus background: before [S04](before/01-S04-placed.png) [S17](before/03-S17-case-1.png) [S20](before/04-S20-start.png) · after [S04](screens/01-S04-placed.png) [S17](screens/03-S17-case-1.png) [S20](screens/04-S20-start.png) [K1](screens/18-K1-wash.png)
Blur 17.9 → 5.1 px. The veil is now the bar's navy at .66 (was stone .70). Panels are unchanged. Text that sits directly on the wash with no panel (task heads, key-idea heads, the O2 map labels, K1 evidence, the deck counter, the attempt marker beside the deck) turns white, or white at .90 (`--wl-on-wash`). It stays AA even over a white patch of the photo. test:fit measures it against `--wl-wash-ground`.

## I. S04, S16 layout: [01](screens/01-S04-placed.png) [02](screens/02-S16-placed.png) [02 1600](screens/02-S16-placed-1600x900.png)
On screens with no explain band (S04, S16), the deck sits left under the heading and the strip gets the wide space beside it. Columns: S04 270 → 244 px, S16 322 → 244 px (top of main). S09 is unchanged (it has the band). Nothing reaches Previous/Next (test:fit).

## J. S21 version b: [11](screens/11-S21-item1b.png) [12](screens/12-S21-item5b.png)
Each item has `b` (approved text) with its own IDs `L4_S21_1b`..`5b` (5b key "3,5"). Attempt 1 shows a, a retake shows b, and later attempts alternate. Shuffle is kept, and only the first try counts. The score counts this attempt's version only (5 items). S21R stems and links work for both, plus stemB "Feedback baseline" (3b) and "Sales map errors" (5b). SCORM mock: attempt 1 sends `L4_S21_1..5`, the retake sends `L4_S21_1b..5b`, 11 interactions, passed.

## K. Readability: [01](screens/01-S04-placed.png) [07](screens/07-S19-full.png) [07 1600](screens/07-S19-full-1600x900.png)
Placed cards 15.36 → 17.28 px (dense mode still the fallback). Lines under headings on the wash are AA (see H). S19: brief + Open workbook lead the left column (the coach line beside the button, the return line under it), workbook field names in full, the copy cards secondary on the right, card names no longer cut. Learner notes stay one line: two lines took the panel to 600 px with full-length notes (limit 524.8, now 500). Copy still copies the full text. All S19 text kept.

## L. S18 one panel: [06](screens/06-S18-wrong.png) [06 1600](screens/06-S18-wrong-1600x900.png)
Situation line, heading, answers, and the band (hint, attempts, Show me how, feedback) are all in one panel on the Stage photo (`onePanel` in the content).

## Text changes (on screen, before → after)
| Where | Before | After |
|---|---|---|
| V1 / V2 h1 | The video stops 2 times to ask you. / The video stops 3 times to ask you. | Watch the video. Answer the questions when it stops. (both) |
| V1 / V2 meta | Two cases, same lesson · Video · 2:54 · 2 stops / Mapping the HR case · Video · 2:48 · 3 stops | Two cases, same lesson / Mapping the HR case |
| S02 saved, S08B top + saved, S12B hint + saved, S17B saved | ... Chapter 5 ... | ... Chapter 6 ... |
| S17B top / S19 card 2 / record "sketch" | ... Chapter 2 ... | ... Chapter 3 ... |
| S19 card 3 / record "metric" | Your metric from Chapter 3 / First metric (Chapter 3) | ... Chapter 4 ... |
| S19 card 4 / record "notes" / S20B hint / S22 bridge | ... Chapter 4 ... | ... Chapter 5 ... |
| W1-W4 kicker | Chapter 1 · Why map, 2 · Toolkit, 3 · HR demo, 4 · Critical eye | Chapter 2 · Why map, 3 · Toolkit, 4 · HR demo, 5 · Critical eye |
| S21R links | Review Chapter 4 (i1, i2) / Review Chapter 3 (i3-i5) | Review Chapter 5 / Review Chapter 4 |
| S22 download line | ...Your map stays in the workbook PDF. | ...Your map stays in your workbook PDF. Bring it to Lesson 5. |
| END next / sub | Next: Lesson 6, in your own time. / ... · Module 1 | Next: Lesson 5 in class. Bring your map PDF. / ... · Module 1 · Lesson 4 |
| S18A selects | A sales call ends (etc.) | A. A sales call ends (B., C., D.) + the lettered list |
| Bar steps | see B | see B |
| review.html | content slice-0.1 (storyboard v2); Chapter 0 · Intro ... 6 · Wrap-up; toolbar "Ch 0" | content FX3, 25 Oct 2026 (storyboard v3); Chapter 1 ... 7; "Ch 1" |
| S21 / S21R new | (none) | versions 1b-5b as approved; stemB "Feedback baseline", "Sales map errors" |

## Full run (all green)
check passed (59) · test:fit --sizes=1280x720,1600x900 passed (568) · walk passed (588) · test:scorm passed (509) · test:review passed (20). New checks cover: steps differ per chapter, version b IDs, the S18A lettered list, S18 one panel, S21 retake on version b and attempt 3 back on a, review rows 1-7 and the version label, and no truncated S19 field or card names.

## Open questions
None. Noy approved all three deviations (25 Oct 2026): the S18A list left of the rows, one-line learner notes in S19, and white text on the dark Focus wash on panel-less screens.

Weekly usage (all models) after: 19%.
