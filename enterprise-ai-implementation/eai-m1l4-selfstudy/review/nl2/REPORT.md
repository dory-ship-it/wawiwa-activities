# EAI L4 NL2: Chapter 2 "Toolkit" on storyboard v3 (21 to 22 Oct 2026)

**Precondition.** HEAD was `ca9211a` (NL1, pushed). The only untracked file was `planning/CH2-SPEC.md`: committed first as `aacb65f` "EAI L4: Ch2 spec". Nothing else was modified.
During the run a new untracked file appeared that this run did not create: `planning/STORYBOARD-V3-CH5-6.md`. This run left it untouched (it is now in `ee05139`, see below).

**Commits** (local, by explicit paths, not pushed; nothing under `video/` or `assets/video/` changed):

| Commit | Group |
|---|---|
| `90f9d29` | (a) W2 warm-up, K2 three-part key idea; FT2 and its routing removed |
| `d283892` | (b) S04 sort deck with drag and drop |
| `71bb138` | (c) S05a BPMN key idea, S05b labels onto the diagram |
| `5634d81` | (d) S06, S07, S08, S08B; the sketch on S19 and in the lesson record |
| `fc6ac6c` | NL1 fixes: S01 context line, O2 line |
| `ee05139` | **Not mine:** a commit made outside this run (message ","), which took my last uncommitted work (tests, tools, the SCORM 1.2 matching codes, a draft of this report, the compare pairs with their -ref / -built parts) and the untracked `planning/STORYBOARD-V3-CH5-6.md`. The branch is level with origin, so it was pushed. This run pushed nothing. |
| (last) | this report, final version |

**Another change in this checkout that is not mine:** `tools/test-fit.mjs` gained a retry for loads that time out (commented "NL3"). It was not committed by this run. The passing fit run below used it.

**Chapter 2 now:** W2, K2, S04, S05a, S05b, S06, S07, S08, S08B. The bar shows Guess · Learn · Sort · Learn · Label · Decide · Explore · Decide · Sketch. Minutes as in the spec (28 for the chapter, was 22).

## 1. Side by side (`review/nl2/compare/`)

`node tools/compare-nl2.mjs [--parts] [frame numbers]` renders each frame of `screens-intro-ch2.html` with the module's own fonts next to the build in the same state, both at 1280x720. Each pair is `NN-<screen>-<state>-pair.png` (NN = the frame's number on the canvas): frame left, build right.

| # | Pair | What differs |
|---|---|---|
| 02 | [O2 ghost hand](compare/02-O2-ghost-pair.png) | None (the line "Open any lesson…" is back) |
| 03 | [O2 Lesson 1 open](compare/03-O2-lesson1-open-pair.png) | None |
| 04 | [O2 side menu](compare/04-O2-side-menu-pair.png) | Help and Start over at the foot (kept, NL1 D7) |
| 06 | [S01 ghost hand](compare/06-S01-ghost-pair.png) | None (context line now in the third person) |
| 07 | [S01 correct](compare/07-S01-correct-pair.png) | None |
| 08 | [S01 wrong](compare/08-S01-wrong-pair.png) | None |
| 24 | [W2 guess made](compare/24-W2-guess-pair.png) | None |
| 25 | [K2 key idea](compare/25-K2-key-idea-pair.png) | Toggle 44 px high, not 42 (D10) |
| 26 | [K2 HR case on](compare/26-K2-hr-case-on-pair.png) | Same as 25 |
| 27 | [S04 ghost hand](compare/27-S04-ghost-pair.png) | The hand's teal ripple shows at the grab (D12) |
| 28 | [S04 wrong drop](compare/28-S04-wrong-drop-pair.png) | None (the strip covers the counter, as in the frame: Q1) |
| 29 | [S04 correct drop](compare/29-S04-correct-drop-pair.png) | None |
| 30 | [S05a BPMN](compare/30-S05a-bpmn-pair.png) | None |
| 31 | [S05b ghost hand](compare/31-S05b-ghost-pair.png) | Ripple (D12) |
| 32 | [S05b correct](compare/32-S05b-correct-pair.png) | None |
| 33 | [S05b wrong](compare/33-S05b-wrong-pair.png) | None |
| 34 | [S06 situation 1](compare/34-S06-situation1-pair.png) | None |
| 35 | [S06 situation 1 correct](compare/35-S06-situation1-correct-pair.png) | "Next situation" in the strip (D1); the panel 1 to 2 px taller |
| 36 | [S06 situation 2 wrong](compare/36-S06-situation2-wrong-pair.png) | None |
| 37 | [S07 ghost hand](compare/37-S07-ghost-pair.png) | Ripple (D12) |
| 38 | [S07 three opened](compare/38-S07-three-opened-pair.png) | None |
| 39 | [S07 question unlocked](compare/39-S07-question-pair.png) | Captured after Escape: the eighth tile stays open to read until then (D3) |
| 40 | [S07 correct](compare/40-S07-correct-pair.png) | None |
| 41 | [S08 round 1](compare/41-S08-round1-pair.png) | Up to 2 px (the panel) |
| 42 | [S08 round 1 correct](compare/42-S08-round1-correct-pair.png) | "Next round" in the strip (D1) |
| 43 | [S08 round 2 wrong](compare/43-S08-round2-wrong-pair.png) | Up to 2 px |
| 44 | [S08B input](compare/44-S08B-input-pair.png) | Save 44 px high, not 42 (D10) |
| 45 | [S08B saved](compare/45-S08B-saved-pair.png) | Same as 44 |

The pairs were checked by eye; S04 (frame 27) was also measured by numbers (`node tools/measure-nl1.mjs 27 "screen=S04"`, now for frames 1 to 45): every text box within 1 px. Three visible differences found on the way were fixed:
- the S04 counter sat 10 px low (an old `.w-deck` rule leaked in);
- the S07 counter line sat beside the heading instead of under it;
- the S08B arrows sat 4 px low.

**Wider windows** (`node tools/shots-nl2.mjs`, and `--ultra`): every Chapter 2 screen at 1600x900 (`review/nl2/wide/`) and 2560x1080 (`review/nl2/wide-2560/`). The off-panel layouts (S04, S05b, S07) stay at the frames' width, centred.

## 2. New templates (reusable)

| Template | Screens | File | For NL3 |
|---|---|---|---|
| Warm-up (as W1) | W2 | `intro.js` `warmup` | W3, W4: content only |
| Key idea, three parts + case toggle | K2 | `intro.js` `keyParts` | K4 by analogy |
| Sort deck, drag and drop, one card at a time | S04 | `sortdeck.js` `sortDeck` + `src/drag.js` | S09, S16, S17, S18A: set `template: "sortDeck"`, columns with `sub` |
| BPMN key idea (markers one by one) | S05a | `bpmn.js` variant `key` | |
| Label onto the diagram | S05b | `bpmn.js` variant `label` + `src/drag.js` | the diagram is `content.diagrams.hr` |
| One situation at a time | S06 | `decision.js` `pair` | |
| Eight tiles | S07 | `explorer.js` `tiles` | |
| Rounds with explain band | S08 | `decision.js` `rounds` (`screen.rules`) | S09, S11, S14, S15 bands by analogy |
| Three-part input | S08B | `input.js`, `arrange: "chain"` | S12B, S17B |
| Off-panel feedback strip | S04, S05b, S07 | `.w-float` around `zones.band` | |

**Drag and drop** (`src/drag.js`), the same on S04 and S05b:
- Pointer: the card follows the pointer, the column or target under it lights up, a drop there is judged; a drop anywhere else slides the card back, nothing is tracked.
- Click (WCAG 2.5.7): a press without dragging picks the card up; a click on a column or target drops it.
- Keyboard: Tab to the card, 1 to n chooses (announced: "Steps chosen. Press Enter to drop."), Enter drops, Escape cancels (announced).
- A wrong drop returns the card (S04: to the deck; S05b: to the tray, still picked up, the frame's selected border) with that card's feedback.
- The ghost hand grabs the card and carries it (S04: down, stopping above the columns; S05b: a little towards the diagram). Any key or pointer press stops it and the card is home. "Show me" replays it.

**Ghost hand types:** `drag` (S04), `label` (S05b), `open` (S07): each plays once on first use, then only after 8 s without input.

## 3. Fixes from NL1

- a. **S01** context line: "Dana gets about 90 requests a month, most of them repeat questions." (`stage.top.context`; Dana's bubble is now the quote only).
- b. **O2** line restored: "Open any lesson to see how it connects to today." (the station screen's `line`). **Word count: I chose an allowance**, `wordLimit` 55 with its reason: the foreman restored the frame's line (10 words); only one lesson's line shows at a time; O2 is a presentation screen. Cutting a station line instead would have changed approved copy.
- c. **Show me** on S02, S04, S05b only. None on S03, S07 or the video stops.
- d. Kept as they are: K1 source, S03 Check behaviour, Help and Start over in the side menu, the transcript button, the temporary chapter photos.

## 4. SCORM and state

- Interactions: 47 (was 44). Out: `L4_FT2_1`, `L4_S05_1` (the old S05 choice). In: `L4_W2_1` (choice, neutral), `L4_S05B_1` (matching, new id), `L4_S08B_1` to `_3` (fill-in, neutral).
- `L4_S05B_1` response: **"s.a,g.b,e.c"** (D2). SCORM 1.2 matching takes one-character ids only, so "swimlane.a,…" is rejected by the LMS; each label has a one-character `code`.
- The sketch is stored as `L4_CASE_TRIGGER`, `L4_CASE_STEPS`, `L4_CASE_OUTPUT` (120 / 250 / 120).
- **suspend_data:** 1880 characters after the whole lesson; **3065 with every free-text field at 250** (over each field's own maximum); limit 4096.
- The sketch is shown read-only on S19 under "Your sketch from Chapter 2" (beside the four steps; each part at most two lines on screen, the full text for screen readers) and in the lesson record download.

## 5. Checks (after the last code change)

- `npm run check`: passed. Allowances (warnings, each with its reason): O2 55, S02 61, K2 68 (HR case on), S04 50, S05a 58, S08 56, S19 48.
- `npm run test:fit`: passed (1248 ok). Every state at six window sizes, including the new Chapter 2 states, S08B with long text and S19 with a full sketch. A first run crashed mid-way ("Target closed", no failures before it) while the walk ran beside it; the run alone passed.
- `npm run walk`: passed (470 ok). New in the walk:
  - the bar's nine Chapter 2 steps;
  - S04 by keyboard: 2 chooses, Escape cancels, a wrong drop returns, the right drop places, the ghost hand stops on a key;
  - S04 by pointer (with motion): the hand carries the card, a press stops it and the card is home; a drag onto the wrong column returns the card, onto the right one places it; a drop outside does nothing;
  - S05b by keyboard (a wrong label stays picked up) and by click (pick up, then click the target);
  - S06 "Next situation", S07 counter, question and Escape, S08 rules band, S08B save;
  - S19 shows the sketch read-only; the record holds it.
- `npm run test:scorm`: passed (47 interactions, each once; 7 fill-ins; status passed, score 80; resume lands on the saved place).
- `npm run test:review`: passed (36 of 36 thumbnails; "Over word limit" lists O2, S02, K2, S04, S05a, S08, S19).

## 6. Deviations

1. **"Next situation" (S06) and "Next round" (S08)** sit in the strip after a right answer. The frames show the strip without a button; S08's frame notes "Next round follows in the build". A timed change would cut the feedback short.
2. **S05b tracking codes:** "s.a,g.b,e.c" instead of "swimlane.a,…" (SCORM 1.2, see 4).
3. **S07:** the eighth tile stays open after the question appears (the learner reads it); Escape closes it, and any click answers. The frame shows all tiles closed at that moment.
4. **Terms without tooltips now**, because the frames show none: S04 columns (Trigger, Steps, Output: K2 teaches them), S06 answers (Field template, BPMN), S07 ("Eight fields"). The definitions stay in `content.tooltips`.
5. **Hints:** S04, S05b and S07 keep their hint for screen readers only (no hint line in the frames). S04 and S05b hints are new pilot copy that names the keys. S06 shows each situation's hint (spec); S08 shows its hint in the left column (frame). S08B has no hint.
6. **S08B empty Save** line is new pilot copy (the spec has none), modelled on S02: "Add a few words to all three parts. A rough version is enough; you can edit it later."
7. **New UI strings** (pilot copy): `ui.drag.*` (help and announcements), `ui.progress.deck` "{i} of {n}", `ui.progress.situation`, `ui.progress.opened` "{i}/{n}" (the frame's "0/8"; `ui.counter` stays "{n} / {max}"), `ui.buttons.nextSituation`, `ui.footer.locked.sortDeck` and `.label`, `ui.record.sketch`.
8. **Diagram data** moved to `content.diagrams.hr` (shared by S05a and S05b). Gateway "Within policy?" with Yes / No; the Answer-to-end flow now goes across, then up, as drawn. The old S05 hotspots and legend are gone, with their code and CSS.
9. **S19 sketch** has no frame: styled by analogy ([screenshot](analogy/S19-sketch.png)).
10. **44 px targets:** the K2 toggle, Show me and Save are 44 px high (frames about 42).
11. The AS-IS term keeps the token underline offset (.35cqw); the S08 frame draws .4cqw.
12. The ghost hand's ripple shows at the tap (all ghost frames are static).
13. Chapter 2 minutes 22 → 28 (the spec's minutes). Progress percentages move slightly (S03: 10%, was 11%).
14. The old `sort` template (tray and the old deck) still serves S09, S16, S17, S18A until NL3. `assets/img/ft2.jpg` stays on disk, unused.
15. `tools/lib.mjs`: the deck counter and offset cards may sit under the off-panel strip (`data-under-strip`), see Q1.

## 7. Open questions

1. **S04 counter under the strip.** With a two-line card, the strip (fixed at 25.8cqw, as in the frames) covers "2 of 5" while feedback shows; the frame does the same. Keep, or move the strip down for two-line cards?
2. **S06 / S08:** keep the "Next situation" / "Next round" buttons in the strip?
3. **S07:** keep the eighth tile open when the question appears, or close it at once (as the frame)?
4. **S05b keyboard names** of the three places ("Place 2: the diamond after Check the topic"…) describe the shapes for screen-reader users. OK, or too much of a hint?
5. **Pilot copy** to review: the S04 / S05b hints, the drag announcements, the S08B empty-Save line.

Weekly usage (from the app, all models): before 4%, after 7%.
