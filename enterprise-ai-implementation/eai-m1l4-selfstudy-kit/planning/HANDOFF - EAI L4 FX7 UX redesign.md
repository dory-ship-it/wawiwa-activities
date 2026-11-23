# Handoff prompt: EAI M1 L4 self-study, FX7 — screen layout and user experience, done better

Paste this whole file into a new Claude Code session opened on `C:\Users\noyam\Desktop\Wawiwa`.
Talk to Noy in Hebrew. All course content stays in English.

---

## 1. What we are working on

**EAI Module 1, Lesson 4 self-study: "Process Modeling and Workflow Mapping".** It is a Storyline-style e-learning lesson built in code (plain ES modules, no framework). It runs on a fixed 1280×720 stage that widens to 1600 and scales to the window. It is packaged as SCORM 1.2 for the Blossom LMS.

The lesson has 7 chapters and about 45 screens:
- Videos with question stops.
- Choice questions.
- Drag sorts.
- Inputs where the learner writes about their own case.
- A handoff to a separate workbook, the Practice Studio `eai-m1l4-class`, where the learner builds an 8-field process map and exports it as a PDF.
- A 6-item knowledge check.

The learner is an adult professional, working in English. The lesson must be **interesting, clear and clean enough to stay in for several hours without frustration**.

### The original lesson (untouched, live)
- **Folder:** `wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy/`
- **Live:** https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy/
- **Code map:** the README in that folder.
  - `content/l4-slice.json` holds ALL learner text.
  - `src/engine.js` and `src/zones.js` hold the shell (top bar, footer with Previous/Next, feedback band).
  - `src/templates/*.js` are the screen templates (decision, input, sortdeck, bpmn, flags, explorer, video, handoff, check, intro).
  - `src/frame.css` holds every style. Colours come only from tokens in `src/tokens.css`.
- **Look:** "Hybrid cinematic". A dark translucent top bar, and a chapter photo as the background, either full-bleed (Stage) or blurred (Focus). Panels are ivory cards centred on the photo, and the feedback strip is flush to the panel's bottom.

### The copy you work in (the only folder you edit)
- **Folder:** `wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy-fixes/`
- **Live:** https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy-fixes/
  - Add `?reset=1` to start as a learner.
  - `review.html` shows every screen.
- **Local preview:** run `npm run serve` in the copy, which serves on port 8127, then open `http://localhost:8127/?reset=1`. Or start the preview server "eai-l4-fixes" (it is in `Desktop\Wawiwa\.claude\launch.json`).
- **Side by side:** `http://localhost:8127/tools/compare-fx4.html`. This needs the original's server on port 8125 too ("eai-l4").

---

## 2. What was asked

### A. The work order (5 Nov 2026, from Dor's pilot review and Noy's notes)
**Core principle: one screen, one clear task.** A first-time learner must be able to say, within 3 seconds, what to do, where, and how they know they are done.
- **One instruction:** starts with a verb, at most 12 words, the largest text.
- **One action area.**
- **Hints and "Show me how":** not shown by default.
- **No attempt dots.**
- **Definitions:** as tooltips, not boxes.
- **Word budget:** at most 35 words per practice screen.
- **Done state:** when the task is done, Next turns on clearly.
- **Feedback:** the right answer is marked on the option itself, plus one plain "why" sentence of at most 20 words.
- **Phase 1, blockers:**
  - A locked Next has a reason.
  - S07 tiles open on click only.
  - S18A: after a wrong Check, reset the wrong rows.
  - After 2 wrong attempts, show the answer.
  - Drag also works as click-to-place.
  - S13: no invalid drop zones.
  - S05b: placed labels must not cover the diagram.
  - S20B: the selected option shows a filled radio.
  - Fits Blossom's frame.
- **Phase 2, UI:**
  - Next button in turquoise.
  - Top bar about 1.5× larger.
  - Video speed control.
  - Sorts get a distractor card and per-card feedback.
- **Phase 3:**
  - The workbook thread is visible from the start.
  - S19 is split into 3 screens.
  - In chapter 7, the PDF is the main deliverable.
- **Phase 4:** the Blossom report: interaction types, neutral items, short IDs, and a "how to read the report" note for Dor.

### B. Dor's pilot notes (the original problems)
1. The questions are crowded. It is hard to see which answer is right, and what the explanation is.
2. Learners get stuck after a wrong answer. It is unclear where to drag, or where to click on the flipping cards.
3. The drag games sometimes fail technically, and they are too easy.
4. He got stuck in chapter 6.
5. The word "Chapter" and the step check marks are too small.
6. A focus group of testers is needed.
7. Video speed control (1, 1.25, 1.5, 2).
8. After chapter 6 everything becomes unclear, and the link to the workbook is unclear.

### C. Noy's own notes (5 Nov)
- Many screens are wrong for the user experience. **The focus is unclear and the background photo steals the show.**
- Next in turquoise instead of red.
- The background behind the videos looks odd.

### D. Noy's review of the first fixed copy (8 Nov)
- **The text beside Next is unnecessary.** Show it only if the learner presses a locked Next twice.
- **S02:** is the "No Homework 1 at hand?" hint needed? It looks clickable and confuses. Make it accessible or visual, without adding text.
- **Video speed:** a gear icon, as on YouTube.
- **Kept on purpose:** she liked Next pulsing when the screen is done.
- **O2:** the hand is missing. It should show where to click.
- **"Pick 2 first" on S03 is good,** but the text is crammed into the small box.
- **Use the photo in a different way each time:** at the side, at the top, as a background, framed. Every screen looking the same is boring.
- **Separate the feedback from the question box.**
- **One try only** on S03, S06, S08, the video stops, S10, S11 and the other choice questions.
- **S04 sort:**
  - The cards to sort should be in the centre, and the categories lower, with space between them.
  - It isn't clear that it is a sort; look at Rise's sorting.
  - The hint is unnecessary.
  - Maybe a hand that shows what to press after sorting.
  - The feedback is messy and crowded.
  - After checking, show right and wrong (green/red).
- **S05a:** the BPMN key does not stand out.
- **S05b:**
  - The hand should play on arrival.
  - Check doesn't stand out; it would be better bottom-centre.
  - After a drop, the placed box should change colour.
- **S07:**
  - The hint is unnecessary.
  - When the question comes it is not clear there is a new instruction; it should look different from the tiles.
- **S08:** one try, and the instruction in a bold, different colour.
- **S10:** crowded and wrongly divided. Rethink it: sentence completion, interaction, visuals, icons.
- **S11:** something special with Baseline, Target and Date.
- **S12:** the hand is missing, and the interaction (pick, then drag) is unclear.
- **S13:** not intuitive; maybe order the events?
- **S14:** the case box before the question box is confusing. Is it to be filled in? Rebuild it.
- **Generally:**
  - The lesson must be interesting, clear and clean.
  - Read left to right: what pops out, and where is the focus?
  - Clear instructions without lots of text.
  - **Learn from the comments and fix across the board, in every chapter.**

### E. Noy, later on 8 Nov (after the next round)
- "You centre the content wrongly. Spread it smartly and correctly on the screen. Objects must not sit on the photos. Accessible colours. Design for a technology lesson. Free hand."
- Replace V1 with `C:\Users\noyam\Desktop\Wawiwa\EAI film upgrade\full\V1 - Two cases, same lesson (upgraded).mp4`. **This is done.**
- Her verdict on the result: **"I don't think you did a good enough job."**

---

## 3. What was done in the copy (FX4 to FX6), and what was not

### Done and working (the full learner run with wrong answers reaches END; `npm run check` passes)
- **Locked Next:**
  - The reason line now shows only after the learner presses a locked Next twice.
  - Next is turquoise with an ink label, and pulses once when it unlocks.
- **Hints and the hand:**
  - No Hint links at all.
  - "Show me how" and the hand play on arrival on the non-choice screens.
  - O2 got its hand back (FX6), after the stations appear.
- **Choice questions:** one try, then the right answer is marked with a why. A wrong answer gets a red card with a cross, a right one a teal card with a check.
- **Feedback:** its own card under the task card.
- **Check:** a locked Check carries its reason as its own label ("Pick 2 first"); once it can be pressed it is centred and filled, and the hand points at it.
- **Drags, Rise-style** (S04, S09, S16, S05b, S12, S13):
  - Each drop is judged at once: a right drop gets a teal check plus a short tag; a wrong one flashes red and goes back; two misses move the card to its place.
  - No Check button.
  - In S12 and S13, a click on the target places the next flag.
- **Small UI fixes:**
  - S07 tiles open on click only; the question gets a "Question" tag and a different colour.
  - S18A resets the wrong rows.
  - S20B shows a filled radio.
  - S05b's labels moved off the diagram text.
- **Video:**
  - A gear speed menu.
  - Choice stops: one try, then the answer.
  - V1 replaced by the upgraded film (3:41, stops 85.0 and 170.4, new captions and poster).
- **Text:**
  - Word budget enforced (35 on practice, 45 on presentation, 20 on feedback), and 75 feedback lines rewritten.
  - Definitions are tooltips (S11, S14, S15).
  - The workbook thread: O2's PDF line, S08B and S12B say which workbook field they fill, S19 is split into S19A/B/C, and S22 makes the PDF the deliverable.
- **Screens rebuilt:**
  - S02: a homework button; the line names the fallback.
  - S05a: the key in white cards.
  - S10: a workbook page with a blank.
  - S11: a "Checkable later?" gauge with 3 icons.
  - S14/S15: the situation inside the question panel.
- **Blossom fit:** the stage fits the visible part of its frame. Tested in `tools/blossom-frame.html` in three shapes.
- **FX6 composer** (`src/compose.js`, per-screen `look` in the content):
  - Every question screen is laid out left to right on a light ground: a head column (the instruction first, then the context) and a white task card with its feedback card under it.
  - The photo is either framed under the head, or a full column on the left or right.
  - Key-idea screens, O2 and O3 are on the light ground.

### NOT done, or not good enough
- **Noy's verdict:** the layout and the UX are still not good enough. The FX6 composer is one generic two-column pattern applied to every screen. It is consistent, but generic. Screens still feel like "a heading on the left, a card on the right". There was no per-screen design thinking, no visual hierarchy beyond font size, and the light ground may now feel flat.
- **Not composed:** S18A, S19A and S19B keep their old layouts, only on the light ground.
- **Untouched:** the sort, tiles, flags and labels screens, the video screen, the knowledge check's review state, S21R and END.
- **Tests:** the old suites `tools/walk.mjs`, `tools/test-review.mjs` and `npm run test:scorm` were NOT updated to the new behaviour, so they will fail on old expectations.
- **`npm run test:fit` on FX6:** 516 FAIL lines, then it crashed at a state that still clicks the removed Check (S08 or later). The log is in `%TEMP%\fx6-testfit.log`.
  - **Many failures are obsolete test assumptions:** "band text overflows the band", "band ... vs its panel" and "focus panel not centred" all expect the old flush band and the centred panel. Fix the test to the new layout.
  - **Real problems still open:**
    - **S02:** the "Your case" chip overlaps the "The problem today" label.
    - **S06:** answer cards are clipped (situation 2).
    - Go through the rest of the log the same way.
  - **Fixed after the run:**
    - S07's question heading was aqua on the light ground (1.5:1); it is now teal ink.
    - S05b's placed chips were white on teal (4.2:1); they are now on teal ink (6.1:1).
- **Phase 4** (the Blossom report) was not done.
- **The final QA pass** was not done.
- **Dor's #6** (a focus group) is outside the code.

---

## 4. What I want from you (FX7)

**Do a much better job on screen division and user experience. Re-solve Noy's requests (sections 2-D and 2-E) your own way — not the way FX4–FX6 tried.** What was already tried, and should NOT simply be repeated:
1. One ivory panel centred on a full or blurred photo, with the feedback flush inside it. This was the original.
2. The same panel with the photo as a top band, a 36% side column, or no photo (FX5 "band / split / light").
3. A generic two-column composer: instruction column left, white task card right, feedback card hanging under it, the photo framed or as a full column (FX6 `src/compose.js`). Applied by machine to every template.

Directions you may consider (your call):
- Design **per screen type, by hand**: choice, multi, sort, label, flag, fill-the-blank, metric, input, self-check, handoff, video, knowledge check. The arrangement should come from the task's own logic, not from one template.
- A real grid with a fixed action zone.
- The feedback placed where the eye already is, for example right under the chosen answer, or as a side panel that slides in.
- Stronger hierarchy and contrast between "what to do", "where" and "result".
- Motion that guides, not decoration.
- Photos as meaning (the character, the case), not wallpaper.
- Fewer cards inside cards.
- The quality bar: a modern, technology-company e-learning product.

**Process (Noy wants to see before you build everything):**
1. Read the copy's code and `planning/design-decisions-log.md` (the FX4, FX5 and FX6 sections).
2. Open both live links, and walk 10 to 15 screens as a learner.
3. Propose the new layout system first:
   - 4 to 6 representative screens as **mock-ups**: a Design or HTML artifact, or real screenshots from a branch of the copy.
   - With a short reason for each choice.
   - **Wait for Noy's approval.**
4. Then apply it to every screen in every chapter.
5. Then verify:
   - A learner-mode run with wrong answers everywhere never gets stuck: `node tools/walk-wrong.mjs --mode=fill|wide|tall`.
   - `npm run check`.
   - `npm run test:fit` (update its states where the behaviour changed).
   - Screenshots of every changed screen at 1280×720 and 1600×900.
   - Contrast AA.
   - No object on top of a photo.

## 5. Rules
- **Edit only the copy folder.** Never the live `eai-m1l4-selfstudy/`, never the Practice Studio workbook, never the Wawiwa Design System.
- **Git:** do not push. Commit only the copy folder, by path, and only when Noy asks; Noy pushes from GitHub Desktop. Git is not on PATH: use `C:\Users\noyam\AppData\Local\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`.
- **Content:** all learner text stays in `content/l4-slice.json`.
  - Content edits so far went through `tools/fx4-content.mjs`, `fx5-content.mjs` and `fx6-content.mjs`. fx4 and fx5 have already run and cannot run again.
  - **Never re-run `tools/pp1-content.mjs`**: it would bring back the pre-FX4 text of the adaptive variants.
- **Stamp:** after any change to `src/`, run `npm run stamp`; `npm run check` fails while the stamp is stale.
- **Encoding:** do not rewrite source files with PowerShell `Set-Content` or `Get-Content -Raw`. It mangles non-ASCII characters (·, curly quotes). Use Node, or the edit tool.
- **Style and accessibility:**
  - Colours only through `src/tokens.css`. Turquoise is not allowed as a text colour (the check fails); use `--wl-aqua-text` on dark.
  - Text at least 14px, targets at least 44px, WCAG 2.1 AA, keyboard works.
  - No em dashes; generic names.
- **Settled decisions (keep them unless Noy says otherwise):**
  - One try on choice questions.
  - No hints.
  - No text beside Next unless it is pressed twice.
  - The Next pulse.
  - Rise-style drags.
  - The gear speed menu.
  - The hand on arrival.
  - SCORM tracking and suspend_data unchanged.
