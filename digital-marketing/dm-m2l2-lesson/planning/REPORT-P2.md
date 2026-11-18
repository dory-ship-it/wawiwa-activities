# DM M2 L2 self-study lesson: Phase 2 report

Chapters 4 to 7 (deck slides 13 to 39) and the V1 film drop-in. 16 Nov 2026.
Nothing is committed and nothing is pushed. No other lesson folder and no workbook was touched.

Review page: http://localhost:8140/review.html (48 screens, all seven chapters).
Shots of every state of the new screens: `planning/shots-p2/` (93 shots and 16 contact sheets `_sheet-N.png`).

## 0. After the report: review rounds 4 and 5 (16 Nov 2026)

Where this section and a later section disagree, this section is the current state. Shots of every changed screen: `planning/shots-r4/` (82 shots, 14 contact sheets).

**Round 10 (Noy, 18 Nov 2026): clearer interactions, full screen on the films.** Newer than Round 9. Not committed.
- O3: the row that opens to the key line looks like the other open rows (`src/dm.css`, `.d-bring-out .d-keyline`).
- S32B: no separate lettered list. Four rows, each "item, comes from, a list of the evidence in full" (`bank: false`, `join`, `choose` in the content; `fields()` in `src/templates/decision.js`; `FI1` in `src/dm.css`). Tracking unchanged.
- Headings that now say what to do: S05, S11, K1, S17 (listed as pilotCopy where the slide title changed).
- Films: a Full screen button in the bar (`src/templates/video.js`, `FS1` in `src/dm.css`, `ui.video.fullscreen`). The player column goes full screen; a question stop leaves it. No button where the embed does not allow full screen (Rise and Blossom iframes need `allowfullscreen`: not tested there). The same change is in `enterprise-ai-implementation/eai-m1l4-selfstudy-v3` (its `frame.css`).
- Films: the big Play button is in the middle of the picture, a dark see-through disc with a white triangle (Noy: as players do; it may cover the title card). DM only.
- Tests on stamp `511dd810`: `check` passed; `check:overflow` on S05, S11, K1, S17, S32B, V1, V2: 135 states, 0 problems (before the Play button change); `walk` passed; full screen tried in a real browser on V1 (enter, play, leaves at stop 1, no errors). Not run: `test:fit`, `test:scorm`, `test:review`, full overflow.
- EAI lesson, stamp `7ebc84de`: `check` passed, full screen tried on V1 (same result); the Play button change is there too (its `frame.css`). Its `walk` fails on O1 and O2 and then stops, before any film: the committed version (HEAD 4edaea1, unpacked to a scratch folder) fails the same way, so it is not from this change. Follow-up for whoever owns the EAI lesson.
- Play button, both lessons: a thin light ring was added so the disc shows on a dark first frame. DM stamp `5e2dce79`, `check` passed; `walk` and overflow were not re-run after the Play button CSS.

**Round 9 (Noy, 18 Nov 2026): the live coach is wired.** Newer than Round 8. Nothing is committed or pushed.
- Coach page: built in Practice Studio (`drafts/dm-m2l2-coach`, published to `activities/dm-m2l2-coach`, built with `config/center.coach-live.json`) and copied to `wawiwa-activities/digital-marketing/dm-m2l2-coach/index.html`. Its texts (system prompt, 48 screen notes, grounding) are `planning/coach-pack-for-dor.md`, a draft Noy has not yet read line by line.
- Lesson: `src/coach/live.js` (COACH_URL), `src/engine.js` (live except in review mode and with `?live=0`), `index.html` (CSP `frame-src https://dory-ship-it.github.io`), `tools/check.mjs` section 16 (as the template's CO2), `tools/walk.mjs` (runs with `?live=0`).
- Tests on stamp `3549480d`: `check` passed, `walk` passed. Locally the coach falls back to the offline tips after 8 s (the page is not on GitHub Pages yet): seen on K5.
- Live, after Noy's push (commit 4edaea1, 18 Nov 2026 10:34): a real answer on K5 (key idea) and on S20 (practice; asked for the answer, the coach declined and gave a clue question); on CHK the panel shows the locked notice and no input. Three questions in all. Not run: `check:overflow`, `test:fit`, `test:scorm`, `test:review`; the coach page's axe and keyboard check; the token measurement.
- Open before real learners (Practice Studio CLAUDE.md, `wawiwa-policies` live-ai-coach-enablement): the live coach is allowed for the EAI program under Dor's DPA exception; Noy reports Dor's approval for this lesson, with no written record here. The go-live record is still to be made.

**Round 8 (Noy, 17 Nov 2026): the layout adapts to the photo, and no photo repeats.** This block is newer than everything below it in this section. Nothing is committed or pushed. Shots of every changed screen at 1920 x 1080: `planning/shots-pl1/` (31 screens).

- *Text at the side (PL1).* A photo may carry `place` in `content/m2l2.json` (`left-upper`, `left-middle`, `left-lower`, `right-upper`, `right-middle`, `right-lower`, `center`). `src/zones.js` copies it to `data-place` on the stage; the rules are the "PL1" block at the end of `src/dm.css`, by layout and ground. The text block is one column 640 px wide on the calm side (the opener card and the one-panel case keep their width and only move), the veil is a gradient dark on that side only, the blur is 2.5 px. A photo without `place` is drawn as before. Styled: the opener card, the closing key line (with or without the board), `twoCols`, the quiz panel, the neutral question (its answers stacked, four answers two by two), the one-panel case. Not styled: the client chat (S17C), the case files (S20, S22, S24), the list poll (S33), END, the video.
- *Two things that are not exactly "upper".* The one-panel case (S11B) and the quiz (S15B) move sideways only, because their feedback card needs the height. The feedback card of the quiz and the neutral question sits under the right part of the panel, clear of Previous.
- *`photo: false`* (new, `src/engine.js`): a screen with no photo at all, not even its chapter's.
- *One photo, one screen.* Each chapter photo is on its opener only. Own photos: O3 (`ch1-opening`), S11B, K3 (`ch3-measurement`), S15B, S17C, S20, S22, S24, K5, S26B, S33, K6, S38, END; the workbook stops and S36 share `workbook-stop` on purpose. No photo: K1, CHKR, V1, V2 (dark ground); K2, S05, S15, S17, S35 (dot ground, as the other screens without a photo). All files are in `assets/img/m2l2/`; nothing in `assets/img/temp/` is used any more. Seeds, crops and the recorded exceptions: `Self- Study\Digital Marketing\M2L2-images\manifest.md` and `image-map.json`.
- *Not reviewed by Noy one by one before going in* (she asked to generate and insert): `s11b`, `s20`, `s22`, `s24`, `s38`, `end`, `workbook-stop`; `k5` and `s17c` went in from the tests she had seen. `workbook-stop` replaces the gradient; she may still supply her own.
- *Tests on the final files (17 Nov 2026):* `check` passed on the final files (stamp `bdadc8c5`). `check:overflow` on the 25 changed screens: 252 states at three sizes, 0 problems; after the last CSS change (the veil and the O3 labels) it ran again on O3, K3, K5, K6 only: 21 states, 0 problems. `walk` passed, before that last CSS change. NOT run on the final files (Noy: fewer tests): the full `check:overflow` over all 48 screens, `test:fit`, `test:scorm`, `test:review`.
- *UX standard pass (Noy's `learning-ux-design-standard`, mirror-source mode, 17 Nov 2026), on the photo screens only.* Text that sits directly on a photo was measured against the real pixels behind it (photo, blur and veil; worst spot), at 1920 x 1080 and 1280 x 720. Two failures were found and fixed: the column label "What it becomes today" on O3 (1.85:1; the two labels now sit on a light surface) and the second line of K6 (3.1:1; the dark veil now stays strong to the end of the 640 px text column: K6 5.47:1 and 7.72:1). All other text on photos passes (K3 10.5:1 and up, K5 5.3:1 and up, S15B 11.7:1, S17C 12.3:1, END 3.26:1 for the large turquoise word). Not verified: an automated accessibility scan (axe-core is not installed here), keyboard-only and screen-reader passes, and the blur, corner and headings-only tests on the other screens. Left for Noy to decide: see the Hebrew summary of 17 Nov (text on photos against section 3.9, the feedback card offset, the S26B subject under the panel, turquoise as a text and button colour in the template).
- *Still open:* the S26 podcast audio is a silent placeholder; the Z-Image Turbo licence check before release.

**Noy's notes (round 4)**
- O2 and the four-node board (K2, K3, S35): a done component keeps its number; a small turquoise check on the disc says it is done.
- Workbook stops WB0 to WB4: the picture is now a real screenshot of the workbook's first page, inside a laptop frame (the template's S19A frame). S36 shows the home practice page the same way. The blurred ground behind the panel is still the placeholder.
- S20, S22, S24: calmer and centred. Before the answer the case file and the question sit side by side in the middle of the screen. After the answer the case folds to its title (a "Show the case" button opens it again, "Back to the answer" closes it), the answer card stands alone in the middle, and the lines that go beyond the answer slide (S22's "Same question, opposite answer", the small lines) sit under the card. Case bullets are 16px.
- END: the programme line and the "See you in Module 3" line are gone (the next lesson is named on S38). Left: the heading, the status chip, the retake hint when not passed, the home practice button.

**The review list (round 5)**
1. S17C: each right reply has its own affirming line; the wrong replies keep the client's pushback. New pilotCopy: "A budget priced off the bid data and competitor spend is one you can defend." / "Management, design and hosting sit outside the total, and the client hears it from you first." / "A line that cannot name its evidence comes out of the plan."
2. Root cause of the small S14 and S15 headings: `src/v2.css` (from the template) styled screens by id. Every rule keyed to the template's own ids was taken out of it (S01, S03, S13, S14, S15, S18, S19C, S22, K4, W4, W6); only O1, the title screen in both lessons, is left. `frame.css` and `fx8.css` had none. `npm run check` now fails if such a rule comes back (for example after a template sync), and if `dm.css` styles an id that is not in the content. A side effect: W6 no longer sits at the left; all six openers are centred the same way.
3. One heading: every action or question heading is 38px / 800, set by layout and not by screen id. Exceptions as listed in the review: S11B, the openers, the video screens, O1, O2, END, and the closing key-line screens (their heading is a label). One heading position: a heading without an eyebrow now starts at the same y as a heading under an eyebrow. Headings inside a centred panel (workbook stops, cases, polls, check) move with their panel.
4. S36: items 1 to 5 are one plain list. The key line is under the list: "A line with no evidence comes out." (the second sentence of the slide's fourth instruction; item 4 keeps the first).
5. Coverage: the slide 12 note is on K3, in the note's words: "The principle that costs organisations the most money: nobody sets up tracking retroactively. Next: the work plan." (it replaces "All four components are on the board."). K1 dimension 4 was checked against slide 7: the slide itself has a statement there, not a question ("Advertising budgets: we can now build initial models."), so it stays.
6. Case bullets at 16px: done.

**V2 film: the real one is in.** `assets/video/v2.mp4`, `v2.en.vtt`, `v2.cues.json`, `v2-poster.jpg` (2:02; stops from the cue file at 58.66 s and 98.76 s; identical to the files in `M2L2-V2-film`). The stop questions and feedback are the work order's. The film's README words stop 2 as "The customer is worth $120. Does the channel work?"; the lesson keeps the work order's longer wording. The same licence note as V1 applies (Z-Image Turbo, Wan 2.2), and the README asks that a person watch the whole film and check that the founder reads as the same person in both plates.

**Tests after all of this (16 Nov 2026):** `check` passed; `check:overflow` 474 states at three sizes, 0 problems (run before the laptop frame; the six screens with the frame were run again after it, 0 problems); `test:fit` passed (1456 checks); `walk` passed (382 checks); `test:scorm` passed; `test:review` passed.

**Round 7 (Noy, 16 Nov 2026: "many screens are empty and a little boring"; and: not one photo behind many screens).** The grounds are as they were. What fills a screen is its own graphics, the template's answer for its S03: an icon in a turquoise disc for each of S14's eight challenges, S15's nine channels and S32's five research blocks; the stages of S16 and S35 numbered in turquoise discs and joined by a line; S26's observations and S28's text, stepper and key line in a white panel; a faint turquoise edge on the white panels of the light screens. The icons are decoration (not content, hidden from screen readers). After it: `check` passed, `check:overflow` 474 states, 0 problems, `test:fit`, `walk`, `test:scorm` and `test:review` passed. Shots: `planning/shots-now/`.

Images: six real chapter photos are in (ch2 to ch7, wired by another session). Still plain gradients: `ch1-opening` (O2, O3), `workbook-stop` (the ground behind WB0 to WB4 and S36), `ch2-dimensions` (K1, K2), `ch3-measurement` (S11B, V1, K3). Screens that would gain from a photo of their own instead of the chapter's: S15B, S17C, K5, S26B, S33, K6, S38, END.

Still a placeholder: the S26 podcast audio.

## 1. What was built

| Chapter | Screens |
|---|---|
| 4. From analysis to a work plan | W5, S14, S15, S15B, S16, S17, S17C, WB4 |
| 5. Simulations | W6, S20, S22, S24, K5, S26, S26B |
| 6. The marketing funnel | W7, V2, S28, S30, S32, S32B, S33, K6 |
| 7. Wrap-up | W8, CHK, CHKR, S35, S36, S38, END |

30 new screens; the lesson is now 48 screens. Slide 18 (the break) is dropped. No chapter label shows a block number and no screen shows minutes.

**V1 drop-in.** The four files from `M2L2-V1-film` are in `assets/video/` (v1.mp4, v1.en.vtt, v1.cues.json, v1-poster.jpg). Captions are on by default. The two stops are read from the cue file (42.06 s and 84.16 s); `npm run check` fails if the content and the cue file disagree. The stop questions and feedback are unchanged. (The V1 section of REPORT-P1.md that speaks of draft captions and no poster is superseded by this.)

**New templates** (`src/templates/dm2.js`, styles in the "Phase 2" part of `src/dm.css`), one kind of practice each:

| Screen | Practice | The slide's structure kept |
|---|---|---|
| S14 | checklist (toggle each row, Done) | the eight challenges as one vertical list, slide order and wording |
| S15 | reveal table | the three-column table, nine rows; "Taught in" visible from the start |
| S15B | three rounds, one try each | (built from the table's middle column) |
| S16 | stages shown one by one | four stages left, the "Managing expectations" box right |
| S17 | column builder | the six-column table with its TOTAL row, values in dollars |
| S17C | client scenario (chat) | (built from the practice PDF and the s17 notes) |
| S20, S22, S24 | case file, commit, reveal | the case as the slide's bullet list, the answer slide's bullets |
| K5 | two columns (dark, no coral) | two columns |
| S26 | podcast with captions and transcript | the seven observations as a numbered list |
| S26B, S33, S38 | poll (neutral) | S33 beside the slide's lines |
| V2 | video with two stops | (placeholder film) |
| S28 | calculator | the two lines and the four-stage funnel |
| S30 | live data table, three rounds | the table exactly (8 columns, 7 sources and GRAND TOTAL) and its bottom line |
| S32 | interactive infographic | slide 32's two columns, joined to the research blocks |
| S32B | match (the template's "fields") | |
| CHK, CHKR, END | the template's scored check, result and end | |
| S35 | sentences one by one, with the four-node board all ticked | the four sentences as a numbered list |
| S36 | home practice stop | the five instructions as a numbered list |

Openers W5 to W8 use the W3/W4 opener with an icon in the weighted square (clipboard, route, funnel, flag).

## 2. Source issue for the SME (S30)

The slide 30 speaker notes and the trainer guide say: "Facebook leads produce the most leads and the cheapest cost per lead, and the most expensive cost per sale."
The table on the slide shows something else:

| | Cost / lead | Cost / sale |
|---|---|---|
| Facebook leads | $15.00 | $300 |
| Instagram | $10.90 (the cheapest) | $350 (the most expensive) |

The same notes then say "Instagram looks cheap per lead at 10.9 and is the worst channel on the sheet at 350 a sale", which agrees with the table. The screen is built from the table: round 2 and round 3 both answer Instagram. Facebook leads is right only for round 1 (most leads, 100). Someone should correct the notes or the table.

## 3. Where a screen is not exactly the work order, and why

1. **Openers W5 to W8: icons, not a word list.** The work order gives a list ("Challenges · Channels · Method · The plan"). In review round 2 Noy asked W3 and W4 to keep the icons only because the words felt unnecessary, and the uniform look wins: W5 to W8 show the icons under the line, no words. The words are one line of JSON away (`points[].title`) if Noy wants them back.
2. **S14: the feedback line sits in the closing card, not in the feedback strip.** Eight rows at the template's minimum target height (44 px) fill the screen, so after Done the key line and the "most hands" line appear together in one closing card at the bottom centre, the same way S05 and S06 close.
3. **S15: the key line and its small line sit in the strip between Previous and Next**, under the table, for the same reason (nine rows of 44 px).
4. **S16: the key line is the first half of the box's first sentence.** The slide says "Do not expect to analyse all of the data, or to understand every meaning in it." The work order asks for "Do not expect to analyse all of the data." as the key line; the second half of the sentence is not shown.
5. **S30: the key line has 16 words** (the rule is 15). It is the slide's own bottom line word for word, as ordered. `npm run check` lists it as a warning.
6. **S30: the question of round 3** starts with "And" as ordered; the "no media cost" note opens in the side panel when a "·" cell is clicked.
7. **S33: the slide has four lines; three are in the list.** The first line of the slide is the question itself and is the heading, so it is not printed twice. The heading keeps the slide's wording, "What are our goals, first and foremost?" (the work order wrote "your goals").
8. **S33 and S26B: the slide's last line** ("Take it as an open discussion. There is no clean answer and the argument is the value.") is a trainer instruction and is not shown; "The argument is the value." is in the S26B feedback as ordered.
9. **CHKR: the missed items and their "Review Chapter N" links show only when the check is not passed**, as in the template. A learner who passes with four of five sees the score and "Passed" only.
10. **S32: Component Three and Component Four have no connector**, because slide 32 traces no element to them. They are in the left column as ordered.
11. **S28: counts that are not whole numbers are rounded** (impressions up, the middle stages to the nearest): 7 sales gives 1,167, 93, 23, 7.
12. **S26 podcast, S26B, S33, S38: the pick can be changed** (neutral, nothing is scored or sent).
13. **END photo.** The deck's cover photo puts a face under the centred text, so END uses the wrap-up placeholder ground until the real image exists.

## 4. pilotCopy: every new string (for Noy)

Everything else on the new screens is the deck, the speaker notes, the trainer guide or the practice PDFs.

### Instructions, hints and framing

| Screen | What | Text |
|---|---|---|
| S14 | instruction | "Mark the challenges you have already seen in a job." |
| S14 | hint | "Mark at least one, then press Done." |
| S14 | toggle label | "I have seen this" |
| S15 | instruction | "Open each channel to see what it does for the plan." |
| S15 | hint | "Click a channel to open its line. Open all nine." |
| S15 | closed cell | "Click to see" |
| S15B | instruction | "Pick the channel." |
| S15B | hint | "Recall what each channel does for the plan." |
| S15B | the three questions | as in the work order |
| S16 | button | "Show the next stage" |
| S17 | instruction | "Fill the plan column by column." |
| S17 | hint | "Click the next column header to fill it, left to right." |
| S17 | the five source chips | as in the work order |
| S17C | framing | "You present this plan to a client. Answer three questions." |
| S17C | instruction | "Choose your reply." |
| S17C | hint | "Pick the reply you could defend." |
| S17C | labels | "Client", "You" |
| S17C | the client's questions, the replies and the pushbacks | as in the work order |
| WB4 | heading, line | "Workbook time · Part 4 of 4", "Go back to your workbook tab and fill 4. The work plan: three rows, where each budget came from, what the total leaves out, and the line with no evidence." |
| S20, S22, S24 | the three answers | "SEO", "PPC", "Social" |
| S20, S22, S24 | hint | "Commit to one answer, then press Check." |
| S20, S22, S24 | labels | "Case file", "Your answer" |
| S20 | feedback | "The demand already exists and has a long tail." |
| S22 | feedback | "The demand is focused, and the recurring revenue pays for the click many times over." |
| S22 | strip | "Same question, opposite answer": "The demand is focused, not long-tail", "The competitors are not defending with budget", "The customer lifetime value is high" (from the s23 notes) |
| S24 | feedback | "Every tool taught today measures existing demand, and here there is none." (s25 notes) |
| K5 | heading, column names | "The rule behind the three cases", "Harvest", "Create" |
| S26 | instruction | "Listen: things worth arguing about" |
| S26 | hint | "Press Play and listen to the end. The transcript is beside the player." |
| S26 | script, opening line | "A few broad observations, and things worth arguing about." (the slide's title and the chapter's line) |
| S26 | script, the question | "Is virality really not a business model?" (s26 notes) |
| S26 | script, closing line | "Next module you build that website." |
| S26 | player labels | "Play", "Pause", "Transcript", "Captions", "Voice one", "Voice two", "You can move ahead only to the part you have already heard." |
| S26B | instruction, answers | "Where do you stand?", "Agree", "Not sure", "Disagree" |
| S26B | feedback | "The author's view is on the slide. The argument is the value." |
| S26B, S33, S38 | hint | "Choose one. Nothing here is scored." |
| V2 | instruction | "Watch the video. Answer the questions when it stops." |
| V2 | the two stop questions, answers and feedback | as in the work order |
| S28 | instruction | "Set the sales you need, and read the funnel backwards." |
| S28 | hint | "Use the plus and minus buttons, or type a number from 1 to 100." |
| S28 | labels | "Sales you need", "Illustrative rates", "One sale fewer", "One sale more" |
| S30 | instruction | "Click a row of the table to answer." |
| S30 | hint | "Read the highlighted column, click a row, then press Check." |
| S30 | the three questions | as in the work order |
| S30 | feedback, round 1 | "Facebook leads: 100 leads in total, the most on the sheet." |
| S30 | feedback, round 2 | "Instagram: $10.90 a lead, the cheapest on the sheet." |
| S30 | feedback, round 3 | "Cheap per lead, the worst on the sheet per sale." |
| S32 | instruction | "Click an element of the plan to see where it comes from." |
| S32 | hint | "Open at least four elements." |
| S32 | labels | "Your research", "The work plan", "Where it comes from" |
| S32 | research blocks | "Component One: competition, market map", "Component Two: demand, keyword data", "Component Three: where we are", "Component Four: goals", "The four principles" |
| S32 | strip | "The research defines: sources, allocation, timetable, resources, result model, measurement method" |
| S32B | instruction | "Choose where each element comes from." |
| S32B | hint | "Every element of the plan goes back to your research." |
| S32B | feedback | "Placed: this is the evidence that element comes from.", "Ask which part of your research produced this evidence." |
| S33 | the two answers | "Immediate goals, simple analytics", "Long-term goals, CRM or ERP" |
| S33 | feedback, immediate | "Start here, and start collecting data today." |
| K6 | heading | "The closing thought" |
| W8 | title, line | "Wrap-up", "A short check, the summary, and your home practice." |
| S35 | heading, button | "Four sentences that carry the whole lecture" (s35 notes), "Show the next sentence" |
| S36 | heading and button | "Open the home practice" |
| S36 | line | "Upload the four files to the course." |
| S36 | after the button | "The home practice is open in a new tab. This lesson keeps your place." |
| S38 | coach line | "Still unclear? Ask the coach." |
| END | heading, chips, hint | "Lesson complete", "Passed", "Not passed yet", "You can retake the check in Wrap-up at any time." |
| END | next line | "See you in Module 3 Lesson 1, WordPress and the landing page." |
| all rounds | buttons | "Check", "Choose first", "Next round", "Next question", "Done" |

### The check (CHK) and its result (CHKR)

The five questions and their answers are the work order's. The feedback line of every answer is new, written from the sources:

| Item | Answer | Feedback |
|---|---|---|
| 1 | a | "That is a possible value: what you read off the data." |
| 1 | b (right) | "The third column is the insight: a decision you take from the data." |
| 1 | c | "That is a possible value, for digital asset scope." |
| 1 | d | "That is a possible value, for consumer demand." |
| 2 | a | "A guess is still a line with no evidence. It comes out." |
| 2 | b (right) | "A row with no evidence comes out of the plan." |
| 2 | c | "Its place in the plan does not give it evidence." |
| 2 | d | "A smaller budget is still a budget nobody can defend." |
| 3 | a | "Data you did not collect before the results cannot be analysed." |
| 3 | b | "Approval is not the moment. The tracking goes in before the campaign." |
| 3 | c (right) | "Nobody sets up tracking retroactively." |
| 3 | d | "By then the data you did not collect is gone." |
| 4 | a | "That demand exists: harvest it with SEO or PPC." |
| 4 | b (right) | "Without demand, SEO and PPC have nothing to capture." |
| 4 | c | "Long-tail demand exists: that is a case for SEO." |
| 4 | d | "Focused demand with recurring revenue is a case for PPC." |
| 5 | a | "Cheap leads are not the test. Cost per sale decides." |
| 5 | b (right) | "At $40 a lead and one in four, a sale costs $160. The customer is worth $120." |
| 5 | c | "Four leads at $40 make $160 a sale, not $120." |
| 5 | d | "You have it: $40 a lead, and one sale in four." |

CHK: "Choose one answer.", "Your answers, with feedback", "Question {i} of {n}", "Next question", "Finish the check", "Next answer".
CHKR: "{x} of {n} right ({p} of 100). Pass mark: 80.", "Passed": "You can turn research into a plan and say what a sale costs.", "Not passed yet": "Review, then retake the check.", "Review Chapter {n}", "Retake now". Missed items: "The third column / Value or insight", "A line with no evidence / Evidence for every line", "When the tracking goes in / Measure before the campaign", "Creating demand / Harvest or create", "What a sale costs / The economic principle".
Coach during the check: "No hints during the check. I'm back after you finish it."

### Coach tips (one per screen, drafted, at most 20 words)

| Screen | Tip |
|---|---|
| W5 | "Four components are researched. This is where they turn into something a client can sign." |
| S14 | "Think of a job you have had. Which of these eight did you already meet there?" |
| S15 | "Read down the table, one line each. You do not need to count the channels or memorise them." |
| S15B | "Each channel does a different job. Recall the middle column of the table." |
| S16 | "Admitting the limits of your research makes you more useful to a client, not less." |
| S17 | "Go column by column, not row by row. Each column comes from a component you already researched." |
| S17C | "Every figure in the plan has to name the evidence that produced it." |
| WB4 | "Price each row off your own data, then say out loud what the total does not include." |
| W6 | "Commit to an answer before you see it. The commitment is what makes the answer stick." |
| S20 | "Look at the demand first: does it exist, and what shape does it have?" |
| S22 | "One line in the case changes how much you can pay to win a customer. Find it." |
| S24 | "Every tool you learned so far measures demand that already exists. What if there is none?" |
| K5 | "Ask of any channel: does it harvest demand that exists, or create demand that does not?" |
| S26 | "Listen for the one you disagree with. The argument is the value." |
| S26B | "There is no clean answer here. Take a side and know why." |
| W7 | "This is what turns a work plan into something that can be optimised rather than just spent." |
| V2 | "Follow one number through the funnel, then ask what a sale costs." |
| S28 | "Change the number of sales and watch how many impressions it takes to get there." |
| S30 | "Read two rows against each other. A cheap lead is not yet a cheap sale." |
| S32 | "Every element of the plan goes back to evidence you produced. If it cannot, it comes out." |
| S32B | "For each element ask: which research produced the evidence for it?" |
| S33 | "There is no clean answer. Whichever you choose, start collecting data today." |
| K6 | "The website, the list and the brand are yours. Every channel should point at them." |
| W8 | "Five questions, pass mark 80. You can retake the check." |
| CHKR | "Missed one? Open its chapter from the link, then retake the check." |
| S35 | "Read the four sentences as they are. Each one is a block of the lecture." |
| S36 | "The fourth instruction is the standard: every line names its evidence." |
| S38 | "Name the hardest component now. It is where your home practice needs the most time." |
| END | "Keep the work plan. Module 3 builds the pages it names." |

The live coach is still not wired (offline tips only).

## 5. Tracking and completion

- 24 interactions in all (4 from Phase 1, 20 new): S15B 1 to 3, S17C 1 to 3, S20, S22, S24, V2 1 and 2, S30 1 to 3, S32B (matching), CHK 1 to 5.
- Only the five items of the check are scored (20 points each, weighting 1). Pass mark 80: four of five passes. The first answer counts; a retake reshuffles the answers; the coach is locked during the check.
- Completion by the template's rules: `lesson_status` is only ever `incomplete` or `passed`; passed is sticky; `score.raw` is the latest attempt.
- Neutral, kept in suspend data only and never sent: S14, S15, S16, S17, S26, S26B, S28, S32, S33, S35, S36, S38.
- The lesson is finished when the learner answers S38 (the last screen before END).

## 6. Placeholders still in the lesson

| What | Where | To replace |
|---|---|---|
| V2 film | `assets/video/temp/v2-placeholder.mp4` and `.en.vtt` (1:30, silent, stops at 0:45 and 1:25) | drop in `v2.mp4`, `v2.en.vtt`, `v2.cues.json`, `v2-poster.jpg` with the same contract as V1, then point `V2.media` at them (temp false, cues, duration from the cue file). The folder `M2L2-V2-film` already holds `v2.cues.json` and `v2.en.vtt` (duration 122.8 s, stops at 58.66 s and 98.76 s) but no `v2.mp4` yet, so it was not wired. |
| S26 podcast | `assets/audio/p1.mp3` (2:00, silent), `p1.en.vtt`, `p1.cues.json`, made by `tools/make-placeholder-audio.mjs` from the script in the content (`S26.podcast.script`) | replace the three files with the same names; the cue file is `{ id, duration, items: [{ t, end, voice, obs, text }] }` (the player takes the caption and the highlighted observation from it); then set `S26.media.temp` false and `duration` |
| 10 images | `assets/img/temp/*.jpg` (plain gradients) | each has its prompt in `assets/img/prompts/`. All ten prompts (the six of Phase 1 too) now describe one setting, the films': the bright studio of a small direct-to-consumer skincare brand (packing table, plain bottles, kraft parcels, laptop with a blurred store, phone on a small tripod), hands at work, no faces, names, logos or text. W7: parcels lined up from many to few. Workbook stops and the home practice: the same laptop-and-notebook frame. |

**Before students see the V1 film:** the README in `M2L2-V1-film` says a person must check the commercial licence of the image and video models it was made with (Z-Image Turbo, Wan 2.2).

## 7. Word budgets

Template budgets: practice 35 words, presentation 45, feedback 20. 14 new screens are over the budget because the work order keeps the slide's text word for word. Each states its own limit and reason in the content (`words: { max, why }`) and `npm run check` lists it as a warning. Fullest view of each:

| Screen | Words | Why |
|---|---|---|
| S14 | 119 | slide 14's eight challenges |
| S15 | 149 | slide 15's table, nine rows and three columns |
| S16 | 88 | slide 16's four stages and the box |
| S17 | 148 | slide 17's work plan table |
| S20 | 134 | slides 20 and 21, the case and its answer |
| S22 | 167 | slides 22 and 23, the case and its answer |
| S24 | 101 | slides 24 and 25, the case and its answer |
| S26 | 121 | slide 26's seven observations |
| S28 | 119 | slide 28's two lines and the funnel |
| S30 | 105 | slide 30's table |
| S32 | 104 | slide 32's seven elements and the research blocks |
| S33 | 67 | slide 33's lines |
| S35 | 95 | slide 35's four sentences |
| S36 | 121 | slide 36's five instructions |

(Phase 1's five, O3, S05, S06, K1 and K2, are unchanged.) No feedback line is over 20 words.

## 8. Tests

Last full run: 16 Nov 2026, after the last change.

| Test | Result |
|---|---|
| `npm run check` | passed. Warnings only: the 19 screens over the standard word budget (5 from Phase 1, 14 new), the S30 key line of 16 words, the 2 temp video files of V2, the temp images |
| `npm run test:fit` (1280x720 and 1024x576) | passed, 1456 checks: band, clipping, contrast, text at least 14 px, targets at least 44 px, the coach launcher and panel on every screen |
| `npm run check:overflow` (1280x720, 1024x576, 1920x950) | 474 screen states, 0 problems. Run before the last change, which only narrowed the step discs in the top bar of the eight-step chapters; not run again after it |
| `npm run walk` (keyboard only, all 48 screens) | passed, 382 checks. Walked with 9 wrong answers on purpose; the check ends on 4 of 5, score 80, passed |
| `npm run test:scorm` | passed. 24 interactions, each sent once; weighting 1 for the five items of the check and 0 for practice; `lesson_status` only ever incomplete or passed, ending passed; `score.raw` 80; suspend data 1689 characters of 4096; resume lands on END |
| `npm run test:review` | passed, 48 of 48 thumbnails |
| `npm run package` | `dist/dm-m2l2-lesson-scorm12.zip`, 14.96 MB |

Fixed on the way: the feedback card touched the content on 11 states (the screens that end in a feedback card now keep clear of a two-line card); text under 14 px and targets under 44 px on S14, S15, S16, S17, S17C, S26, S30, S32, S35 and S36; white text on the teal of the funnel's last stage (4.19:1, now on the darker teal); the coach launcher against the eight step discs of chapter 4 (the step discs of an eight-step chapter are 66 px wide instead of 76.8).

Not tested: the package in a real LMS (Blossom), a screen reader, a phone or tablet, and the real V2 film and podcast audio (they do not exist yet).

## 9. Open questions for Noy

1. WB1 to WB4 still leave Next open (honour system). A small "I filled it" gate is possible if wanted.
2. Openers W5 to W8: icons only (as W3, W4) or the work order's word list?
3. CHKR: should a learner who passed with a miss also see the missed item and its review link?
4. S30: who corrects the notes (or the table) for the Facebook leads / Instagram mismatch?
5. The V2 film and the podcast audio are placeholders; the images are placeholders.
