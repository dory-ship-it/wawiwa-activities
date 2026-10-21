# EAI L4 NL1: the "Hybrid cinematic" look on the whole module (21 Oct 2026)

**Precondition.** The working tree held two untracked items:
- `planning/design-reference/hybrid-cinematic/` was committed first, as `abfa962` "EAI L4: hybrid cinematic design reference".
- `planning/STORYBOARD-V3.md` is the decisions file from the same handoff. It is not a code change, so I went on. It is still **untracked and not committed** (it is yours to commit).

This round is one local commit, made by explicit paths. Not pushed. Nothing under `video/` or `assets/video/` changed.

**Reference.** `screens-intro-ch2.html` (43 frames; `screens-intro-ch1.html` is superseded). This run matches the 23 Intro and Chapter 1 frames. The Chapter 2 frames are for NL2.

**Goal.** The built module looks like the frames. Engine logic, SCORM, tracking, state and learner text stay as they were. The only content changes are the ones the new look needs (listed in "Content changes").

## 1. Side by side: the 23 frames (`review/nl1/compare/`)

`node tools/compare-nl1.mjs` renders each frame with the module's self-hosted fonts (Google Fonts blocked), next to the built screen in the same state, both at 1280x720:
- Each pair is `NN-<screen>-<state>-pair.png`: the frame on the left, the build on the right.
- `--parts` also writes the two 1280x720 images separately.

For the numbers behind each pair, `node tools/measure-nl1.mjs <frame> "screen=ID"` lists every text run's box in both. On O1, O2, S01 and S02, every text box is within 1 px of the frame (except the known deviations below).

| # | Pair | What differs (all explained under Deviations) |
|---|---|---|
| 01 | [O1 title](compare/01-O1-title-pair.png) | Logo 120 px, not 115 (D6) |
| 02 | [O2 ghost hand](compare/02-O2-ghost-pair.png) | The frame's line "Open any lesson…" is not in the JSON (D1) |
| 03 | [O2 Lesson 1 open](compare/03-O2-lesson1-open-pair.png) | Same as 02 |
| 04 | [O2 side menu](compare/04-O2-side-menu-pair.png) | Help and Start over at the foot (D7) |
| 05 | [O3 tile 3 hovered](compare/05-O3-tile3-hover-pair.png) | None |
| 06 | [S01 ghost hand](compare/06-S01-ghost-pair.png) | Context line in the first person, from the JSON (D1, Q1), so the panel is one line shorter |
| 07 | [S01 correct](compare/07-S01-correct-pair.png) | Same as 06 |
| 08 | [S01 wrong](compare/08-S01-wrong-pair.png) | Same as 06 |
| 09 | [S02 ghost hand](compare/09-S02-ghost-pair.png) | Up to 1 px |
| 10 | [S02 help open](compare/10-S02-help-open-pair.png) | Up to 1 px |
| 11 | [S02 Save, empty](compare/11-S02-save-empty-pair.png) | Up to 1 px |
| 12 | [S02 saved](compare/12-S02-saved-pair.png) | Up to 1 px |
| 13 | [W1 idle](compare/13-W1-idle-pair.png) | None |
| 14 | [W1 guess made](compare/14-W1-guess-pair.png) | None |
| 15 | [V1 ready](compare/15-V1-ready-pair.png) | Transcript button kept in the player bar (D9) |
| 16 | [V1 playing](compare/16-V1-playing-pair.png) | The real film and its own caption cue; no turquoise keyword (D1); captured paused, so the play icon shows |
| 17 | [V1 stop 1, ghost hand](compare/17-V1-stop1-ghost-pair.png) | The paused film behind, not the still; Resume 44 px high (D5) |
| 18 | [V1 stop 1, wrong](compare/18-V1-stop1-wrong-pair.png) | Same as 17 |
| 19 | [V1 stop 1, correct](compare/19-V1-stop1-correct-pair.png) | Same as 17 |
| 20 | [K1 key idea](compare/20-K1-key-idea-pair.png) | Source "Hammer, HBR, 1990" from the JSON (D1) |
| 21 | [S03 ghost hand](compare/21-S03-ghost-pair.png) | Check 44 px high (D5) |
| 22 | [S03 one of two](compare/22-S03-one-of-two-pair.png) | Check stays locked with one card left (D11) |
| 23 | [S03 correct](compare/23-S03-correct-pair.png) | Check is gone after the right answer, as before (D11); the closing line is the JSON's 25-word version (D1) |

**1600x900 spot-check** (`node tools/shots-nl1.mjs --wide`, in `review/nl1/wide/`):
- At 16:9 the stage is 1280 scaled by 1.25: the gutters are equal and nothing is stretched.
- At 2560x1080 the stage widens to its maximum, 1600 (`--ultra`, in `review/nl1/wide-2560/`).
  - The bar, the photo and the footer span the width.
  - Focus panels and content blocks stay at the frames' widths, centred.
  - Stage panels stay anchored right.
- test:fit now asserts that every Focus panel sits centred at every size.

## 2. What was built

**Tokens.**
- `src/tokens.css` holds only the `--wl-*` tokens: the VISUAL-DIRECTION table, plus 16 more values the frames use. Examples: `--wl-line-mid #D5CFC4`, `--wl-card-line #DAD5CC`, `--wl-idle-ink #6A7680`, `--wl-fb-text #1B2B36`.
- The old `--w-*` tokens are gone.
- `check.mjs` reads the hex allowlist from `tokens.css`.

**Units.** Every value is the frame's `cqw` × 12.8, in stage px. The stage is a fixed 1280-wide box scaled as a whole, so the ratio is the frames' ratio at any window size.

**Components** (one each):

| Component | Where |
|---|---|
| Top step bar | `zones.js` `setBar` + `engine.renderBar` |
| Side menu | `menu.js` |
| Footer | `zones.js` |
| Scene: Stage photo with push-in once, Focus photo wash, O1 dark scene | `zones.setScene`, chosen per template by `tpl.scene(screen)` |
| Panel (`sheet`) | `stage.js` |
| Answer card and its states (`paintAnswer`) | `stage.js` |
| Feedback strip: correct / wrong / neutral tone, slide-up | `zones.setFeedback` |
| Hint row with the band's tool (Check, Resume, Skip) | `zones.setFeedback` |
| Dark glass card and its kicker (icon, label, chip) | `stage.js` `glassKicker` |
| Quote glass | `decision.js` `single` |
| Show me | `ghost.js` |
| Ghost hand (the frames' hand) and its gutter targets | `ghost.js` |
| Key-idea pill, glass tooltip | `intro.js`, `tooltip.js` |

**Glyphs.** The frames' own line icons are in `icons.js` `glyph()`: 24 grid, stroke 1.9, round caps. They cover the task verbs, pause, volume, lock, check, cross, arrows, quote mark and hand. They are not Lucide.

**Steps.**
- Every screen has a `"step": { "verb", "icon" }` in the JSON. A screen with `"join": true` shares the step of the screen before it; none uses it yet.
- `check.mjs` asserts that every chapter screen has a step.
- Steps before the current one show as done. Later ones show as done once all their screens are done; otherwise they show as to come.

**Photos.**
- The temporary stills are in `assets/img/l4/`.
- Each chapter has `chapter.photo { src, position, temp: true }`, and O1 has its own `screen.photo`:

| Chapter | Photo |
|---|---|
| Intro | s01-dana-phone |
| Ch1 | w1-new-computer-same-mess |
| Ch2 | s04-three-channels |
| Ch3 | s01-dana-phone |
| Ch4 | o1-lanes-office |
| Ch5 | w1-new-computer-same-mess |
| Ch6 | s04-three-channels |
| O1 | o1-lanes-office |

- `check.mjs` asserts that every photo file exists and lists them as temp.

**Motion.** Three motions only, none ambient, and none with reduced motion:
- The Stage photo pushes in once, 1.08 to 1 over 1.4 s. It does not replay between two Stage screens with the same photo (W1 to V1).
- The K1 drawings draw on over 1.2 s.
- The feedback strip slides up 8 px in 320 ms.

## 3. Styled by analogy (no frame yet)

All of these are Focus panels with the same cards, strips, buttons and type. Their interaction and text are unchanged; drag and drop and one card at a time come with the Ch2 build. The screenshots are in `review/nl1/analogy/`, at 1280x720.

| Screen | Template / variant | Screenshot |
|---|---|---|
| FT2, FT3, FT4 | decision / challenge | [idle](analogy/FT2-challenge-idle.png), [right + routes](analogy/FT2-challenge-correct-routes.png) |
| S04, S17 | sort / deck | [S04 wrong](analogy/S04-sort-deck-wrong.png), [S17](analogy/S17-sort-deck-marker-idle.png) |
| S09, S16, S18A | sort / tray | [S09 wrong](analogy/S09-sort-tray-wrong.png) |
| S05 | explorer / diagram | [gateway found](analogy/S05-explorer-diagram-gateway.png) |
| S07 | explorer / tiles | [tile open](analogy/S07-explorer-tiles-tile-open.png) |
| S12 | explorer / pick | [one of two](analogy/S12-explorer-pick-one-of-two.png) |
| S06 | decision / pair | [left right](analogy/S06-decision-pair-left-right.png) |
| S08 | decision / rounds | [round 1 right](analogy/S08-decision-rounds-round1-right.png) |
| S10 | decision / fill | [right](analogy/S10-decision-fill-right.png) |
| S11 | decision / metric | [wrong](analogy/S11-decision-metric-wrong.png) |
| S13 | decision / bounds | [right](analogy/S13-decision-bounds-right.png) |
| S14, S15 | decision / single with a statement (no character, so Focus) | [S15 wrong](analogy/S15-decision-single-statement-wrong.png) |
| S18 | decision / safety | [step 2](analogy/S18-decision-safety-step2.png) |
| S19 | handoff | [brief](analogy/S19-handoff-brief.png) |
| S20 | decision / selfcheck | [row answered](analogy/S20-decision-selfcheck-row-answered.png) |
| S21 | check | [item 1 wrong](analogy/S21-check-item1-wrong.png) |
| S22 | decision / close | [takeaway](analogy/S22-decision-close-takeaway.png) |
| V2 | video | Same template as V1 (framed) |

Notes on the analogy screens:
- The screens that had an image column (S14, S15, S18, S19, S22) or a memo photo (FT2 to FT4) now sit on the chapter wash. Their own images stay in the JSON for the media track.
- S05's diagram is more compact so the panel fits between the bar and the footer:
  - lanes are 70 px instead of 88;
  - the start's label sits beside its circle;
  - the event buttons are 44 px targets.

## 4. Content changes (the new look needs them; no learner sentence was rewritten)

- **ui:**
  - `warmup.prompt` "Make your best guess."
  - `video.kicker` "Video"
  - `video.stopKicker` "Stop {i} of {n}"
  - `video.ccChip` "CC"
  - `rail.steps` and `rail.stepStatus`, for screen readers
  - `counter` changes from "{n}/{max}" to "{n} / {max}" (the frames)
- **O2:**
  - stations carry `n` ("4", "5", "6");
  - `ghost { type: "tabs", target: "l1" }`.
- **O3:** the deliverable icon is `write` (the frame's pencil).
- **S01:** `ghost { type: "choice", target: "below-panel" }`.
- **S02:** `ghost { type: "input", target: ".w-input", showMe: true }`.
- **V1, V2:** the ghost target is `gutter-low`.
- **S03:** the ghost target is `gutter-left`.
- **K1:** the figures get `label` ("Without mapping", "With mapping"). Their **alt texts are rewritten** to describe the new drawings: a tangled line, and a straight line through two boxes. The old alts described boxes the page no longer draws.
- `step` on every screen; `photo` on every chapter and on O1.

## 5. Checks (all after the last code change)

- **`npm run check`: passed (53 ok).**
  - New checks: the scene photos exist, and every chapter screen names its step (a verb and a glyph).
  - The hex allowlist and the contrast table are now the `--wl-*` tokens.
  - Warnings, unchanged: S02 at 61 words (its allowance), and the temp images, which now include the eight scene photos.
- **`npm run test:fit`: passed (1176 ok).** Every screen state at six window sizes, plus the menu and its dialogs:
  - no overlap and no clipping;
  - the strip flush to its panel;
  - contrast and 14 px text;
  - 44 px targets;
  - Focus panels centred.

  It has 6 checks fewer than RV1 because the menu's Lesson goals dialog is gone.
- **`npm run walk`: passed (452 ok).** The keyboard walk through the whole lesson. It now also checks:
  - the top bar's chapter name and steps;
  - O2's ghost hand on Lesson 1;
  - the S01 Stage photo and the quote glass;
  - the O1 dark scene;
  - the S02 help tooltip;
  - the V1 glass card and the stop card.
- **`npm run test:scorm`: passed (370 ok).**
  - 44 interactions, each written once.
  - Status passed, score 80.
  - suspend_data is 1628 chars (2188 with every free-text field full; the limit is 4096).
  - Resume lands on the saved place.
- **`npm run test:review`: passed (19 ok).**
  - 33 of 33 thumbnails render their own screen.
  - 0 SCORM calls in review mode, and localStorage is unchanged.
  - No review files in the package.

Logs: `review/nl1/final-*.log` (not committed).

## 6. Deviations

1. **Learner text stays as in the JSON where the frames differ** (the rule for this run):
   - S01's context line is in the first person ("We get about 90 requests…"). The frame and the storyboard v3 decision use the third person (Q1).
   - O2 has no "Open any lesson…" line; it was cut in RV1.
   - O2 Lesson 4 has no "real".
   - K1's source is "Hammer, HBR, 1990".
   - S03's closing line is the 25-word version from RV1.
   - V1's caption is the film's own cue from `v1.en.vtt`. The VTT has no markup, so no turquoise keyword.
2. **Not shown, because the frames have none; kept for screen readers** (sr-only or aria):
   - the hints on S01, W1 and the V1/V2 stops (S02's hint is shown under the heading, as in the frame);
   - W1's panel text and foot, and the "Your guess" tag;
   - S01's eyebrow "A message from Dana";
   - S03's video-case stills (the frame drops them);
   - K1's "faster tech" chip and evidence icon.
3. **Hints on the analogy screens** sit in the panel's hint row, in the S03 style (small grey line, tool on the right).
4. **Next is 18.7 px bold, not 17.92.** White on #EE3124 is 4.12:1, which needs large text (18.66 px bold) for WCAG AA. The button keeps the frames' height.
5. **44 px minimum targets.** The frames' locked Check and Resume are 38 px high, and the outline Save, Check and Show me are 42 px; all are now 44 px. This moves content by 1 to 3 px on V1 stops and S03.
6. **O1 logo is 120 px wide** (VISUAL-DIRECTION: "≥ 120 px wide on O1", a MUST). The frame draws it at 115.2.
7. **Side menu: Help and Start over stay** as two small links at the foot, since they are features. Removed per "status only": the % complete, Lesson goals and Lesson 1 cases.
8. **Full-screen button removed.** The bar has no place for it and the frame has none.
9. **Video:**
   - The transcript button stays in the player bar, as the media alternative (WCAG 1.2.3). It opens a glass panel on the right.
   - The ready state shows the chapter photo; the film shows once it plays. Its poster stays as in the JSON.
   - The seek bar has no thumb (the frame has none); the turquoise fill shows the position.
10. **"Show me" only on S02** (the only frame with it). S03 and the video stops lose the replay button. Their ghost hand still plays on first use, and again after 8 s without input.
11. **S03 behaviour unchanged:**
    - After "One of two." Check stays locked (only one card is still selected). The frame draws it unlocked.
    - After the right answer, Check is removed, as before. The frame still shows it.
12. **"One of two." is the neutral strip** (new state `partial`, tracking unchanged). By analogy, S12 and S21 do the same.
13. **Strip tones:**
    - Accepted answers that are not graded use the neutral stone strip: S20, S22 and the W1 guess.
    - Saves use the teal strip, as in the frame's S02 "Saved.": S02, S18 and S19.
14. **The panel's max-height (41cqw) is dropped.** It never binds on the framed screens, and it let tall analogy panels (S14) overflow their background.
15. **Push-in plays once per photo**, not on every Stage screen.
16. **Tab order:** the bar comes before main, so keyboard order follows the screen from the top.
17. **Steps for the current Ch2 to Ch6 screens** were picked from the verb set:

    | Chapter | Steps |
    |---|---|
    | Ch2 | FT2 Decide, S04 Sort, S05 Explore, S06 Decide, S07 Explore, S08 Decide |
    | Ch3 | FT3 Decide, V2 Watch, S09 Sort, S10 Decide, S11 Decide, S12 Explore |
    | Ch4 | FT4 Decide, S13 Start, S14 Decide, S15 Decide, S16 Sort, S17 Sort |
    | Ch5 | S18A Sort, S18 Decide, S19 Write, S20 Decide |
    | Ch6 | S21 Decide, S22 Decide |

    They change with storyboard v3 in NL2 and NL3.
18. **Word counts** (`check` rule 9) still count the content fields as before. They include W1's panel text, which is no longer shown, and they do not include the new ui strings.
19. **Test changes** (the behaviour asserted is the same):
    - test-fit: the shell geometry is now the bar, main and the floating footer.
    - test-fit: the band must sit flush to its panel.
    - test-fit: inactive controls (the locked Next, Check and Resume) are exempt from contrast, under WCAG 1.4.3.
    - test-fit: a tight heading may pass its line box by 0.2em with overflow visible; this is not clipping.
    - test-fit: every Focus panel must be centred.
    - walk: reads the bar's steps instead of the rail dots.
    - walk: reads the strip's `data-text` and `data-verdict`.
    - walk: the menu is checked as status only.
    - walk: video screens wait for `load` (the film keeps a range request open).
    - walk: the old P1.5 artboard comparisons are retired.

## 7. Open questions

1. **S01 context line.** The storyboard v3 decision says third person ("Dana gets about 90 requests…"), but this work order kept the JSON text. Should NL2 apply it?
2. **The O2 line and K1's source.** The frames still show the pre-RV1 text. Does the JSON stay as it is?
3. **"Show me" on S03 and the video stops.** Keep none, as in the frames, or bring the replay button back?
4. **S03 Check:** after "One of two." it is locked, and after the right answer it is gone. Keep, or follow the frames?
5. **Side menu foot:** keep Help and Start over?
6. **Transcript button in the player bar:** keep?
7. **Chapter photos for Ch3 to Ch6:** are the temporary assignments in §2 OK until the media track?

Weekly usage (from the app, all models): before 1%, after 3%.
