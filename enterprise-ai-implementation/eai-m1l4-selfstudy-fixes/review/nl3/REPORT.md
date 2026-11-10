# EAI L4 NL3: Chapters 3 "HR demo" and 4 "Critical eye" on storyboard v3 (22 Oct 2026)

**Precondition.** HEAD was `ee05139` (message ",", pushed). The working tree was clean: `planning/STORYBOARD-V3-CH5-6.md` was already committed in `ee05139`, so there was nothing to commit for "EAI L4: storyboard Ch5-6".
Two things in this checkout during the run were not mine, both left untouched:
- `c407f2b` "EAI L4 NL2: report (...)" was committed at 08:31, after this run started (the NL2 run finishing its report; it also notes my test:fit retry change below);
- an untracked file appeared: `planning/design-reference/hybrid-cinematic/theme-kit13-topbar.html`.

**First:** `npm run test:fit` failed: after a few hundred pages one load (S15 at 1024x576) waited 30 s for the fonts and crashed the run (alone it loads at once). Fix: a load that times out is tried once more in a fresh context. The rerun passed (1248 ok, no retry needed). Committed before building.

**Commits** (local, by explicit paths, not pushed; nothing under `video/` or `assets/video/` changed):

| Commit | What |
|---|---|
| `0c2add6` | EAI L4: fix UTF-8 mojibake in content (your urgent fix: 17 places, and the new check in `tools/check.mjs`) |
| `5645459` | test:fit retries a timed-out load once |
| `44e71a5` | (a) NL2 follow-ups, W3, S09, S10, S11; two new layout checks |
| `afe6bcb` | (b) S12, S12B, the S19 prefill; the explorer `pick` variant removed |
| `6d91f79` | (c) W4, S13, S14, S15; the `challenge` and `bounds` decision variants removed |
| `7e415d3` | (d) K4, S16, S17, S17B, the S19 notes; the old sort's deck mode retired |
| (last) | S18 step 2 spacing (41cqw, found by the final full fit run), this report, `review/nl3/screens/`, the V2 states in `tools/shots-nl3.mjs` |

**Chapter 3 now:** W3, V2, S09, S10, S11, S12, S12B. The bar: Guess · Watch · Sort · Decide · Decide · Label · Write. 20 minutes (was 19).
**Chapter 4 now:** W4, S13, S14, S15, K4, S16, S17, S17B. The bar: Guess · Start · Decide · Decide · Learn · Sort · Sort · Write. 25 minutes (was 26). The lesson total stays 193.

The content changes were made by `tools/nl3-content.mjs` (Node, UTF-8; it keeps the file's hand format: unchanged screens and keys keep their text). UI strings were edited in place with the editor.

## 1. Screens (`review/nl3/screens/`, 1280x720, `node tools/shots-nl3.mjs`)

| # | Screen | States |
|---|---|---|
| 01-03 | S04 (follow-up a) | [wrong, two-line card](screens/01-S04-wrong-two-line-card.png), [card 2](screens/02-S04-right-card-2.png), [done](screens/03-S04-done.png) |
| 04 | S05b (follow-up b) | [start](screens/04-S05b-start.png) (the change is in the screen-reader names) |
| 05-06 | W3 | [start](screens/05-W3-start.png), [guess](screens/06-W3-guess.png) |
| 07-08 | V2 (unchanged) | [ready](screens/07-V2-ready.png), [stop 1 wrong](screens/08-V2-stop-1-wrong.png) |
| 09-12 | S09 | [start](screens/09-S09-start.png), [wrong](screens/10-S09-wrong.png), [right](screens/11-S09-right.png), [done](screens/12-S09-done.png) |
| 13-15 | S10 | [start](screens/13-S10-start.png), [wrong](screens/14-S10-wrong.png), [right](screens/15-S10-right.png) |
| 16-18 | S11 | [start](screens/16-S11-start.png), [wrong](screens/17-S11-wrong.png), [right](screens/18-S11-right.png) |
| 19-23 | S12 | [start](screens/19-S12-start.png), [flag picked up](screens/20-S12-picked.png), [wrong](screens/21-S12-wrong.png), [one placed](screens/22-S12-one-placed.png), [done](screens/23-S12-done.png) |
| 24-26 | S12B | [start](screens/24-S12B-start.png), [empty Save](screens/25-S12B-empty.png), [saved](screens/26-S12B-saved.png) |
| 27-28 | W4 | [start](screens/27-W4-start.png), [guess](screens/28-W4-guess.png) |
| 29-33 | S13 | [start](screens/29-S13-start.png), [Start on 2](screens/30-S13-start-on-2.png), [End on 4](screens/31-S13-end-on-4.png), [Start placed](screens/32-S13-start-placed.png), [done](screens/33-S13-done.png) |
| 34-36 | S14 | [start](screens/34-S14-start.png), [wrong](screens/35-S14-wrong.png), [right](screens/36-S14-right.png) |
| 37-39 | S15 | [start](screens/37-S15-start.png), [wrong](screens/38-S15-wrong.png), [right](screens/39-S15-right.png) |
| 40 | K4 | [key idea](screens/40-K4-key-idea.png) |
| 41-43 | S16 | [start](screens/41-S16-start.png), [wrong](screens/42-S16-wrong.png), [done](screens/43-S16-done.png) |
| 44-46 | S17 | [start](screens/44-S17-start.png), [wrong](screens/45-S17-wrong.png), [done](screens/46-S17-done.png) |
| 47-49 | S17B | [start](screens/47-S17B-start.png), [empty Save](screens/48-S17B-empty.png), [saved](screens/49-S17B-saved.png) |
| 50-51 | S19 | [brief with the sketch and the notes](screens/50-S19-brief-with-notes.png), [return, metric from S12B](screens/51-S19-return-prefilled.png) |

Every state was also measured at six window sizes by test:fit (section 5).

## 2. Built by analogy (no frame), each from the existing components only

No new colours, icons or type sizes. Every value is a token or a size already in `frame.css`.

| Template | Screens | Built from | Screenshot |
|---|---|---|---|
| Sort deck, strip beside the deck | S04, S09, S16, S17 | NL2 deck, the off-panel strip moved to the deck's right | [S04](screens/01-S04-wrong-two-line-card.png) |
| Explain band beside the deck; field chip in the head | S09 | S08 band (items with a term and its definition, top down), S08 field chip | [S09](screens/10-S09-wrong.png) |
| Wide deck, five columns with definitions, placed case as "Case n" | S17 | NL2 deck, column subtitle as the definition, S07 tile title size for five columns, R2's S17 markers | [S17](screens/46-S17-done.png) |
| Explain band in a panel, chained (arrows) | S11 | S08 band, K2/S08B arrow | [S11](screens/17-S11-wrong.png) |
| Flags onto a map (new template `flags`, variant `map`) | S12 | S05b board: figure card, label cards with the flag glyph, drop targets, strip under the tray; S10 field rows; S19 step number disc | [S12](screens/23-S12-done.png) |
| Flags onto a process line (variant `line`) | S13 | the same, BPMN step boxes, the tray and strip under the line | [S13](screens/33-S13-done.png) |
| Stage with a case card (band, situation, handoff visual) | S14, S15 | S01 Stage panel, figure card, S08 band, BPMN step boxes, K1 grey | [S14](screens/36-S14-right.png), [S15](screens/38-S15-wrong.png) |
| Two-column key idea (`keyColumns`) | K4 | K1 head and its two figure cards (teal, grey), K2 type | [K4](screens/40-K4-key-idea.png) |
| Input chain with an optional field | S12B | S08B chain, single-line fields | [S12B](screens/26-S12B-saved.png) |
| Input pair with earlier text read-only, a note beside Save | S17B | S02 input, S19 sketch box, the privacy line's place | [S17B](screens/49-S17B-saved.png) |
| S19 sketch and notes, one line per part; metric prefilled | S19 | NL2 sketch box | [S19](screens/50-S19-brief-with-notes.png) |

W3 and W4 use the W2 warm-up template as it is (frame exists).

## 3. NL2 follow-ups

- **a. S04 counter.** "2 of 5" now stays visible while feedback shows, with two-line cards too (critical detail 4). How: the strip sits beside the deck on its right instead of between the deck and the columns. The deck stays at 15.6cqw and the columns at 32.2cqw, as in the frames. The walk checks that the counter and the strip never overlap. Alternative tried first: the strip under the counter. That pushed the columns 28px down and into Previous / Next (the frame itself had 3px to spare), so it was dropped. The same deck layout serves S09, S16 and S17.
- **b. S05b names** by position: "Place 1: the bottom row, HR manager", "Place 2: after Check the topic, in the HR staff row", "Place 3: the first point of the Employee row, at Question sent". The S05b diagram also got its own description without shape words (`diagramAlt`, pilot copy): the shared one says "a circle", "a diamond", which are the answers. Picking a label up now announces "Choose a place" (it said "Choose a column").

## 4. SCORM and state

- Interactions: **52** (was 47). Out: `L4_FT3_1`, `L4_FT4_1`. In: `L4_W3_1`, `L4_W4_1` (choice, neutral), `L4_S12B_1` to `_3`, `L4_S17B_1`, `_2` (fill-in, neutral).
- `L4_S13_1` is now **matching**, response **"s.1,e.5"** (each flag's one-character code and its first step; SCORM 1.2 matching takes one-character ids, as `L4_S05B_1` in NL2). The storyboard wrote "start.1,end.5".
- `L4_S12_1` unchanged (choice, multiple, "4,7"): the response is each flag's first field, in number order.
- Stored text: `L4_CASE_BASELINE` (80), `_TARGET` (80), `_DATE` (40), `L4_CASE_AIFIT` (100), `L4_CASE_HUMAN` (100).
- **suspend_data:** 2162 characters after the whole lesson; **3181 with all 11 free-text fields full** (each at its own maxlength: the test now fills every field to its own maximum, where NL2 put 250 in each); limit 4096.
- Resume (relaunch with entry=resume) lands on the saved place with the prompt, 39 screens done, the case title and metric back; lesson_status stays passed, no interaction written again.

## 5. Checks (after the last code change)

One full run after the last code change (the S18 spacing), in this order: check, walk, test:scorm, test:review, test:fit.

- `npm run check`: **passed**. New: the mojibake check (no character of U+0590 to U+05FF in content/ or src/). Allowances (warnings, each with its reason in the content): O2 55, S02 61, K2 68, S04 50, S05a 60, S08 56, and new S09 60, S11 64, S12 120, S14 54, S15 56, K4 66, S16 50, S17 72, S19 62 (the brief with the sketch and the notes).
- `npm run walk`: **passed (515 ok)**. New in the walk:
  - the bars of Chapters 3 and 4 (seven and eight steps from content);
  - W3, W4 neutral guesses; no fast-track card, routing or chapter fast track left;
  - S04: a two-line card with the wrong strip, the counter clear of the strip; S05b: the places and the diagram described by position, a key announces the place;
  - S09, S16, S17 by keyboard (1 to n, Enter): the band, the field chip, S16's hint line, a wrong drop returns the card, the counter stays visible, placed per column, Next;
  - S12 by keyboard: "Field 3, Steps chosen" announced, a wrong flag stays picked up, the right field turns teal, then the second flag;
  - S13 by keyboard: Start on 2 and End on 4 get their own lines, End on 2 the general line, both placed the closing line;
  - S12, S13 by pointer: a drop outside returns the flag (nothing tracked), the target under the flag lights up, a wrong drop slides back, a right drop places it;
  - S14, S15 on Stage: the case card from content, wrong then right;
  - K4: two columns from content, Next unlocked, nothing tracked;
  - S12B: empty Save, Save with Target empty, then all three; S17B: the Chapter 2 steps read-only, the note beside Save, empty Save, both fields;
  - S19: the sketch and the notes read-only (five parts), the metric field starts from S12B, not stored before Save; the lesson record holds the notes;
  - the bus: one first attempt per id (52), S12 "3,7"/wrong, S13 "s.2,e.4"/wrong, the fill-ins neutral.
- `npm run test:scorm`: **passed (452 ok)**: 52 interactions, each once; 12 fill-ins; S13 matching accepted by the SCORM 1.2 mock; status passed, score 80; suspend_data as in section 4; resume lands on the saved place.
- `npm run test:review`: **passed (19 ok)**: 39 of 39 thumbnails; "Over word limit" lists O2, S02, K2, S04, S05a, S08, S09, S11, S12, S14, S15, K4, S16, S17, S19.
- `npm run test:fit`: **passed (1500 ok)**: every state of every screen at six window sizes, the new Chapter 3 and 4 states included (S09 and S16 with their longest line, S17 with its longest case, S12B and S17B with every field full, S19 with a full sketch and notes, opened and back). No load needed the retry.

## 6. Deviations

1. **Strip beside the deck** on S04, S09, S16, S17 (critical detail 5 puts it between the deck and the columns; see 3a). The NL2 compare pairs 27 to 29 (S04) no longer match their frames there.
2. **S13 tracking codes** "s.1,e.5", not "start.1,end.5" (SCORM 1.2).
3. **S13 first flag placed:** the strip shows the verdict "Correct." alone (the storyboard has one closing line, shown after both). Steps with no line of their own (Start on 3 to 5, End on 1 or 2) show the general line.
4. **S12:** the first flag on Field 4 or 7 shows that field's line; both placed show the storyboard's line. The flag name "Risk flag" is pilot copy.
5. **S14 and S15 on Stage:** the band, the situation (and S15's eyebrow, S14's visual) sit on a case card on the photo, top left. The panel (right, 50% instead of S01's 46%) holds the heading, the answers, the hint and the strip. Everything in one Stage panel measured about 650px against the 524.8px maximum. S14's four answers sit 2 x 2. The screens' own images (`s14.jpg`, `s15.jpg`) are no longer shown (the chapter photo is the Stage photo, as on S01); the files stay.
6. **Tooltips removed** where a band now defines the term: S09 (Owner, Sensitivity), S11 (Baseline, Target), S14 (Handoff), S15 (Bottleneck), S16 (good-fit kind, as the storyboard says), S17 (Ideal, not actual). The definitions stay in `content.tooltips`.
7. **Hints:** the drag screens keep the hint for screen readers only, as S04 and S05b (S09, S12, S13, S17). S09's and S17's hints are pilot copy naming the keys. S16 shows its hint under the heading (it is content, not keys). S14 and S15 show theirs in the panel.
8. **S16:** the Poor fit column is 1.8 times as wide (it takes three of the six cards; each stays on one line, so the column stays above the footer).
9. **S17:** a placed case shows as "Case 1" to "Case 5" with its check (the case text for screen readers), like R2's S17 markers. Five columns use the S07 tile title size (20.48). The deck is wider (563px) for the long cases.
10. **S12B:** Date may stay empty (the storyboard's empty line names only Baseline and Target). The three fields sit on one line with arrows (S08B's chain); Baseline is wider for its placeholder.
11. **S17B:** no privacy line (the storyboard has none). The storyboard's note sits in its place beside Save. The empty-Save line is pilot copy, modelled on S08B. The Chapter 2 steps show at most two lines (the full text for screen readers).
12. **S19:** the sketch and the notes show one line per part (the sketch had two), so the brief stays within 41cqw. The metric field starts from the S12B metric ("Baseline: {baseline}. Target: {target}, {date}.", pilot copy) only while it is empty, editable, nothing stored before Save. The lesson record also lists the notes.
13. **New layout checks** (`tools/lib.mjs`, in test:fit and the walk): nothing of the screen under Previous / Next; no panel over 41cqw (critical detail 1). They found earlier states over the limit. Fixed with spacing only (no type or colour change): S06 situation card (gaps 15.36 to 10.24, padding 23.04 to 19.2; "both right" was 546px), S08 round column gap (15.36 to 12.8) and the rules band's margin (20.48 to 17.92; round 1 with "Next round" was 534px), S18 step 2 gaps (10.24 to 3.84; "saved" was 537px), S19 step rows (padding 6.4 to 3.2; "opened" was 546px). S18A's tray panel (546px) is exempt until it moves to the deck in NL4. The measure also clips a text run to a box with overflow hidden inside main (the S19 ellipsis lines), never to main itself.
18. **S11:** with the band on top, "Field 8" moves from the line above the heading to a field chip beside it (S08's chip); the slots (status, not targets) are 36px high, so the panel stays within 41cqw.
14. **endOfChapter** moved from S12 and S17 to S12B and S17B (the last screens; no chapter has a pause marker today).
15. **Minutes:** V2 6 to 5, S13 to S15 4 to 3, S16 6 to 5, S17 7 to 5 (the storyboard's).
16. **Retired:** the old sort's deck mode (S18A keeps the tray until NL4), the explorer's `pick` (old S12), the decision's `challenge` (FT) and `bounds` (old S13), with their CSS and UI strings. The engine's generic route code (fast-track skip) stays, unused.
17. Commit (a) put W3 first in the screens array (a re-run of the content step); (b) puts the array back in the slice's order. Behaviour was not affected (the slice sets the order).

## 7. Open questions

1. **Strip beside the deck** (all four deck screens, incl. S04): OK as the answer to the counter, or keep the frames' place on S04 and move the columns down?
2. **S14 / S15 case card** on the photo with a 50% panel: OK, or move S14 and S15 back to Focus?
3. **S17 placed cases as "Case n":** OK, or show the case text (the columns would need more room)?
4. **S12B Date optional:** OK?
5. **S17B privacy line:** add "Leave out names and identifying details." (the learner writes about their own case)?
6. **S19 one line per part** for the sketch and the notes: OK?
7. **Pilot copy** to review: the four sensitivity definitions (SME), "Risk flag", the S05b diagram description, the S14 visual's description, the new drag announcements (fields, steps, places), the S09 / S17 key hints, the S17B empty-Save line, the S19 metric line.
8. `planning/design-reference/hybrid-cinematic/theme-kit13-topbar.html` (untracked, not mine): yours to commit or delete.

Weekly usage (from the app, all models): before not read at the start of this run (the NL2 report recorded 7% at 08:31, about ten minutes into it), after 10%.
