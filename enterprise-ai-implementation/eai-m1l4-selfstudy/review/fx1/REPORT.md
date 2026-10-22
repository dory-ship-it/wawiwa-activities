# EAI L4 FX1: Noy's review fixes (Intro to Ch2) + shared rules (22 Oct 2026)

**Precondition.** NL3 was committed. `theme-kit13-topbar.html` was already committed by you (`54cd711`, message "."), so there was nothing to commit first; the tree was clean. Commits are local, not pushed; nothing under `video/` or `assets/video/` changed.
**Commits:** `c660121` F · `626dc58` B (plus D4 S02 and G1, in input.js) · `edc5f18` E2, E3 · `3908f09` C · `1109435` D · `05ec911` E1, E4-E6 · last: fit fixes, tests, this report, `review/fx1/`.

## Items
| Item | What changed |
|---|---|
| A1 | check: 0 mojibake (33 files). Proof: [O1](screens/01-O1-title.png) ("Module 1 · Lesson 4", the quote mark). |
| F1 | Bar copied from Kit 13 (values from the file). Stage: photo behind a dark translucent bar (rgba(12,28,40,.42), blur 14px), white text, translucent step discs. Focus: the light bar. "Chapter N of 7" (Roboto 500 1.1cqw) above the name. Steps done / current / next as the kit. Side by side: [Stage](compare/stage-W1-pair.png), [Focus](compare/focus-K1-pair.png). |
| F2 | VISUAL-DIRECTION.md: the top bar section rewritten (both modes, every value); Stage = photo behind the bar. |
| B1 | "Show me how" on every practice screen. Choice: the hand sweeps down over all options with a "Pick one" chip ("Pick two" on S03), taps nothing ([S01](screens/04-S01-show-me-how.png)). Input: types a demo line into each field, stops on Save, then puts the text back. Drags: carries a card / label / flag toward the targets and stops before them. S07: opens a non-answer tile; in the question phase it sweeps the tiles. |
| B2 | Two attempts with a marker (two discs, "Attempt 1 of 2") on S01, S03, S06, S07, S08, S10, S11, S14, S15 and the sort / label / flag screens. After the 2nd wrong one: the right answer marked, "Here is the right answer." + its explanation in the neutral strip, Next unlocks ([S01](screens/18-S01-revealed.png)). The first attempt is still the tracked one (later ones go out as retries). Warm-ups unchanged. |
| B3 | Build-up (items 180-200 ms apart, once, none with reduced motion) on O2, O3, K2, S06. Still text-only (no photo / diagram / figure): **S02, S03, S08B, S12B, S17B** (forms and answer cards); S10 has only its field rows. |
| C1 | The film letterboxed (contain) on the Stage ground, Play centred ([V1](screens/06-V1-ready.png)). |
| C2 | Stop: question on the glass card, answers in the panel, both above the player bar, which stays (inert). Resume and "Show me how" moved onto the glass card ([V2](screens/07-V2-stop-1.png)). |
| C3 | Transcript: the film shrinks to the left 60%, a light readable panel on the right ([V2](screens/08-V2-transcript-open.png)). |
| C4 | "Watch for: …" + "The video stops 2 / 3 times to ask you." The duplicate line removed. |
| D1 | O2: no ghost; the line draws, stations come in one by one, "Today" pulses once; "Click to open" on Lesson 1 until a station is opened ([O2](screens/02-O2-start.png)). |
| D2 | O3: tiles are tabs; the goal's full wording in a detail card under them (O2's card), tile 1 open; no tooltip ([O3](screens/03-O3-goal-1-open.png)). |
| D3 | S01: the sweep ends on the "Pick one" chip (as B1). |
| D4 | S02: context and heading above the panel; filled navy Save, locked until both fields have text; the locked Next reads "Save to continue"; the two help links as a small row; the typing demo ([S02](screens/05-S02-start.png)). |
| E1 | K2: card, arrow, card… one by one; the toggle under the cards at full width, a turquoise ring pulsing twice, once ([K2](screens/09-K2-start.png), [HR case](screens/10-K2-hr-case.png)). Next unlocked. |
| E2 | Check after all on S04, S09, S16, S17, S12, S13 (and S05b, see deviations): place everything, then Check; wrong ones return with their line; attempt 2 the same; then the rest move to their right place with a check, explanation in the strip (a shown card also explains itself on click) ([checked](screens/11-S04-checked.png), [shown](screens/12-S04-revealed.png), [S12](screens/22-S12-checked.png)). Counter visible, strip beside the deck. |
| E3 | S05b: diagram zoomed 1.15 (same proportions); turquoise dashed targets with "Drop here", a gentle pulse while a label is picked up; the hand drags a label toward the diagram and stops before it ([S05b](screens/13-S05b-show-me-how.png)). |
| E4 | S06: situation on top with a temp still (content `image` slot, prompt files added), a path splitting into the two answers, mini previews (8-row table / three lanes with a diamond) in HTML/CSS, build-up ([S06](screens/14-S06-situation-1.png)). |
| E5 | S07: no numbers, bigger icons in soft round tiles, a flip to the back, two attempts then reveal ([tiles](screens/15-S07-tiles.png), [question](screens/16-S07-question-wrong.png)). |
| E6 | S08: three icon rule cards in a row (they are the answers), the map line in a map strip under them, the broken rule lights up (teal ring), one line in the strip; the rules band is gone ([S08](screens/19-S08-round-1.png), [right](screens/20-S08-round-1-right.png)). |
| G1 | S17B: "Leave out names and identifying details." beside the note ([S17B](screens/24-S17B-start.png)). |
| G2 | Kept as is. |

## Checks (one full run after the last code change)
- `check`: **passed**, 0 mojibake.
- `test:fit --sizes=1280x720,1600x900` (new option): **passed (520 ok)**; states rewritten for check-after-all, Save locked, O3 tabs, shown-after-attempt-2.
- `walk`: **passed (532 ok)**; updated for the new bar, O2/O3, S02, the stops, check-after-all; new: the S01 and S04 reveal after two attempts.
- `test:scorm`: **passed (467 ok)**; suspend_data 2232 / 3251 with every field full (limit 4096).
- `test:review`: **passed (19 ok)**.
- Screenshots: 24 in `screens/` (`node tools/shots-fx1.mjs`); bar pairs in `compare/` (`node tools/compare-fx1.mjs`).

## Deviations
1. **Stage screens (S01, S14, S15):** "Show me how" and the attempt marker sit on the card over the photo (quote glass / case card), not beside the heading: the panels were at their 41cqw limit. Same pattern at video stops (with Resume).
2. **S11:** the heading row keeps NL3's tighter margins, so the panel stays within 41cqw.
3. **Decks:** while sorting, a placed card shows as a "Card n" token (S17's "Case n"); the full text comes back when the screen is done. Otherwise any number of cards in one column ran under Previous / Next.
4. **S05b** uses check-after-all too (B2 "sort" screens); its first-attempt response is now "s.b,g.c,e.a" in the walk.
5. **S06** has only two answers, so the second attempt is always right (no reveal is possible there).
6. **S08** rule cards show the short rule names; the option's full label is for screen readers.
7. **Video stops** keep unlimited attempts (Resume locked until right); B2 names screens, not in-film stops.
8. **Warm-ups** have no "Show me how" (the Kit's W1 frame has none).
9. D4's filled Save and "Save to continue" are on S02 only (as written); S08B, S12B, S17B keep the outline Save.
10. Spacing-only fixes to keep panels within 41cqw: S06 still 74x42, fork 14px; S07 tile padding 14; S01 revealed cards' padding gives back the thicker border; S07's strip lower (476px).
11. One `bpmn.js` edit was done with .NET's UTF-8 file write (no BOM) instead of Node or Edit; check found no mojibake.

## Open questions
1. K2: lock Next until the HR case toggle is opened? (now unlocked, presentation screen)
2. Stage tools on the photo card (deviation 1): OK, or shorten the panels instead?
3. Deck tokens "Card n" while sorting: OK?
4. Filled Save and "Save to continue" on S08B, S12B, S17B too?
5. Attempts at video stops, and "Show me how" on the warm-ups?
6. Pilot copy: "Here is the right answer.", "Here are the right places.", "Every card is in its place.", "Click to open", "Pick one / Pick two", the demo lines, the S06 still alts.
7. The text-only screens of B3 (S02, S03, S08B, S12B, S17B): add an anchor in NL4?

Weekly usage (all models): before not read at the start (NL3's report ended at 10%), after 12%.
