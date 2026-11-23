# REPORT P1: DM M2 L2 self-study lesson, chapters Opening, Where are we?, Our goals

15 Nov 2026. Work order: "DM M2 L2 self-study lesson, Phase 1 (deck slides 1 to 12)". Owner: Noy.
Folder: `digital-marketing/dm-m2l2-lesson/`. **Nothing is committed and nothing is pushed.**

Review it here: `http://127.0.0.1:8140/review.html` (start the server with `npm run serve` in the lesson folder). The lesson itself: `http://127.0.0.1:8140/`.

## 0. Review round 2 (Noy, 15 Nov 2026): what changed after this report was first written

Where this section differs from the sections below, this section is the current state. The screenshots in `planning/shots-p1/` were retaken after it.

| Screen | Noy's note | Change |
|---|---|---|
| W3, W4 | the three names feel unnecessary, the icons do add; the "3" block should take more room | the names are gone, the three icons stay as a quiet row; the card is 900 wide, the number square 168 px, the title 68 px |
| S05 | an open tile looks empty (only tile 1 has a picture) | each tile has its own large icon beside the answers (on tile 1 the screenshot takes its place after Yes or No); the open question and chips are larger |
| S05, S06 | lock Next until the questions are answered | it already is locked in the lesson. The review page opens every screen in review mode (`?review=1`), where Next never locks. The lesson as a learner sees it: `http://127.0.0.1:8140/?reset=1` |
| S06 | not clear enough; say what we are trying to find out; one question in focus at a time | new line under the heading: "This shows where your business stands today. Take one question at a time." (replaces the slide 6 line "Six questions, from the source lecture."). One card is in focus (raised, navy edge, the only one with buttons); the cards to come are quiet; marked cards keep their result |
| WB1, WB2, WB3 | the big "Open the workbook" button is confusing, the workbook is already open | the line now says "Go back to your workbook tab and fill ..."; "Open the workbook" is a small button after "Closed the tab?"; **Next is open on these three screens** (nothing to press first). WB0 is unchanged: big button, Next waits for it |
| K1 | beautiful; after Explore keep only the right side | the detail view has no list of names: the dimension alone, centred and larger, with the dots, "Next: ..." and "All dimensions" |
| S07 | the feedback should be at the bottom of the screen | the feedback card sits at the bottom, between Previous and Next, under the columns |
| K2 | add what to do with the questions | new line under the board: "Can you answer them? Move on to the next part. If not, go back and close what is still open." |
| S11B | the question has no context after "what organisations buy" | new line above the question: "Knowing what the organisation buys is not enough. We have to state it as a goal." (from the slide 11 text: we have to clearly grasp and state the objectives of the organisation) |
| V1 | remove "Four principles, before we plan anything" and "Watch for" | both lines are off the screen. The title stays as the film's own title card in the production block and as the film's name for screen readers |

New pilot copy in this round: the S06 line, "Closed the tab?", the three "Go back to your workbook tab and fill ..." lines, the K2 line, the S11B context line.

Word counts after this round: S06 131 (was 124), K1 60 (was 79), K2 66 (was 46); the others are unchanged. Still over the standard budget: O3, S05, S06, K1, K2.

One thing to know about WB1 to WB3: with Next open, a learner can pass a workbook stop without doing the part. Before, they at least had to press the button. If you want a small gate back (for example a "I filled it" button), say so.

Tests after this round: check passed; test:fit passed (608); check-overflow 198 states, 0 problems; walk passed (181); test:scorm passed (184); test:review passed (23); package 0.76 MB.

### Review round 3 (Noy, 15 Nov 2026)

| Screen | Noy's note | Change |
|---|---|---|
| S07 | the feedback sits a little too low; it should be above the height of Next and Previous | the feedback card is above the two buttons (74 px from the foot); the deck and the columns are more compact to leave it room, every placed card still shows in full |
| S11B | the line above the question is the important part and has too little weight | the context line is now the lead: 27 px bold with the turquoise rule; the question under it is the same size, in teal ink |
| S05 | better, but the box is still very big for every question | with a tile open the grid is as high as its content: the three closed tiles are slim rows, the open tile is as high as they are together, and only tile 1 grows for its screenshot. The icon is 120 px |

Tests after round 3: check passed; walk passed (181); test:scorm passed; test:review passed; test:fit and check-overflow passed on S05, S07, S11B at every size (the other screens are unchanged since the full run of round 2).

### Template sync (15 Nov 2026): "Design changes from EAI L4 v3, to apply to the Digital Marketing lessons"

The lesson runs on the same engine and the same class names, and its copies of the template's three stylesheets (`frame.css`, `fx8.css`, `v2.css`) had never been edited. So they were replaced with the template's current files, which brings every change at once.

| Change in the template | In this lesson |
|---|---|
| 1. CR1, problem / fix colours | The three tokens are in `src/tokens.css` and the rules came with the stylesheets. Nothing uses coral yet: no Phase 1 screen contrasts a problem with a fix. The later chapters (the simulations) may. |
| 2. BL2, background photos almost sharp | Applied (dark ground 6 px, light wash 5 px, soft ground 5 px, openers 3 px). Not visible yet, because the photos are placeholder gradients. It will matter as soon as the real photos are in. |
| 3. LP1, opener card on the left | Not applied. In the template the rule is keyed to its own screens W4 and W6; this lesson's W4 shares the id by chance, so `dm.css` keeps it centred like W3. Decide per photo once the real photos exist (the card is now 900 wide, by your round 2 note). |
| 4. QH1, case line and question in one weight | Applied to S11B with the template's exact values (case line 28 px bold ink, question 26 px teal ink). It replaces the round 3 version, which had a turquoise rule beside the line. |
| 5. OV1, nothing covers anything | The play button on V1 moved below the film's title (it sat on the placeholder's title). `check-overflow` already runs at the three sizes. |
| 6. Not adopted from the pilot | Nothing to do. |

Tests after the sync: check passed; test:fit passed (608); check-overflow 198 states, 0 problems; walk passed (181); test:scorm passed; test:review passed. Screenshots retaken.

### O2, the doubled numbers (Noy, 15 Nov 2026)

The number showed twice on O2 (in the disc and again under it). Now it is in the disc only, and the name alone sits under it, in bold. A done component shows its check in the disc, so 01 and 02 carry no number; the line that opens under each one still says "Done last session...". No deck text was added. Tests: check, walk (182), test:fit and check-overflow on O2 pass.

### V1, the real film (Noy, 15 Nov 2026)

The film Noy sent (`S9-_sOsll_pp7OmzG2URsw.mp4`, 1920x1080, 1:43.5, with sound) is now V1: `assets/video/v1.mp4` (the same file, re-wrapped so it starts playing before it is fully loaded). The placeholder stays in `assets/video/temp/`, unused. This replaces section 3.2 below (the placeholder and the 2:30 question).

- **Stops: 0:42 and 1:24.** The film holds on a "?" mark twice (about 40.5 to 43.5 s and 82.5 to 85.5 s); the lesson pauses in the middle of each hold, so the frozen picture is the film's own question frame.
- **Captions are a DRAFT.** I could not listen to the film. The captions (`assets/video/v1.en.vtt`) and the transcript are the production script (slide 12 and its notes), timed to the four segments as they appear on screen. They were not checked against the narration, and the film's opening and recap have no captions. `npm run check` prints this as a WARNING. Please send the film's own captions file, or tell me to transcribe the audio (the ElevenLabs transcription costs credits, so I did not run it unasked).
- **One thing to look at in stop 2.** When the film pauses at 1:24, its own keyword "Before the campaign" is on the frozen picture, and that is the right answer to "When does the tracking go in?". In stop 1 the keyword comes after the question, so nothing is given away there.
- No poster: before Play the player shows the film's first frame. (The title-card frame as a poster put the Play button on the title's underline.)
- The SCORM package is now 14.8 MB with the film.

Tests after the film: check passed (WARNING: draft captions); walk passed (182); test:scorm passed; test:review passed; test:fit and check-overflow passed on V1 at every size.

## 1. What was built

- A fork of `enterprise-ai-implementation/eai-m1l4-selfstudy-v3` (the template, untouched) without its planning, review, node_modules, dist, EAI photos, prompts, temp images and films. Kept: fonts, logo, `src/`, `tools/`, `index.html`, `review.html`, `package.json`, `package-lock.json`.
- A new content file `content/m2l2.json` (18 screens, 3 chapters with screens and 4 later chapters listed empty so the menu and "Chapter N of 7" are ready). Every EAI screen, character, diagram, case and link is gone. Lesson id `dm-m2l2-lesson`, code `M2L2`, tracking ids `M2L2_...`, localStorage key `wawiwa.dm.m2l2.lesson`, workbook link `https://dory-ship-it.github.io/wawiwa-activities/digital-marketing/dm-m2l2-selfstudy/`.
- Seven new templates in `src/templates/dm.js` with their styles in `src/dm.css`, all in the template's look (its tokens, fonts, panels, shadows): `bring` (O3), `workbookStop` (WB0 to WB3), `questionTiles` (S05), `questionCards` (S06), `dimensionMap` (K1), `goalCards` (S11), `closing` (K2, K3). Two shared parts: the **Key line** (turquoise rule, larger type, one per screen) and the **four-node board** (O2 uses the template's module map; K2 and K3 show the board with the node that gets its check).
- Small additions to the template's own templates: the opener shows the component number in a large turquoise square (W3, W4); the sort deck takes an explain line and can put its feedback card beside the deck (S07); on a wrong choice the feedback says why the learner's own pick is wrong (S11B and the video stops).
- Template rules kept as they are: tokens only (three new accent tokens, see 5.6), shell (top bar with chapter label, step discs and the coach launcher; footer Previous / Next), feedback as its own card, Next turquoise with an ink label, locked Next grey with a lock and its reason as the aria-label, ghost hand only on non-obvious actions, review mode, `review.html`, the SCORM 1.2 adapter and codec.
- Coach: offline tips only, one tip per screen. The live coach is not wired: `src/coach/live.js` has no URL, the engine starts the coach with `live: false`, and the CSP is `frame-src 'none'`.
- Dev server on port 8140. The launch entry `dm-m2l2-lesson` was added to `C:\Users\noyam\Desktop\Wawiwa\.claude\launch.json` (where the template's `eai-l4-v3` entry lives; this file is outside the repo).

## 2. Screens

| # | Screen | Chapter | Step | Template | Source | Words (standard budget) | Tracking | Screenshots |
|---|---|---|---|---|---|---|---|---|
| 1 | O1 | Opening | Start | title | s1 | 18 (45) | none (presentation) | 01 |
| 2 | O2 | Opening | Where we are | moduleMap | s2; s2 notes | 24 (45) | none (presentation) | 02 to 04 |
| 3 | O3 | Opening | Bring | bring | s3; L1 home practice step 5, L1 s26 | 72 (35) OVER | none (state only) | 05 to 07 |
| 4 | WB0 | Opening | Workbook | workbookStop | work order (new) | 17 (35) | none (state only) | 08 to 09 |
| 5 | W3 | Where are we? | Overview | opener | s4; s4 notes | 23 (45) | none (presentation) | 10 |
| 6 | S05 | Where are we? | Assets | questionTiles | s5; s5 notes | 45 (35) OVER | none (state only) | 11 to 18 |
| 7 | S06 | Where are we? | Questions | questionCards | s6; s6 notes; L1 home practice 1, 2, 6; L1 s10, s14, s17, s23, s27 | 124 (35) OVER | none (state only) | 19 to 22 |
| 8 | WB1 | Where are we? | Workbook | workbookStop | workbook "1. Where you stand" | 15 (35) | none (state only) | 23 to 24 |
| 9 | K1 | Where are we? | Dimensions | dimensionMap | s7; s8; s9; s8 notes; trainer guide | 79 (35) OVER | none (state only) | 25 to 34 |
| 10 | S07 | Where are we? | Sort | sortDeck | s8; s9 | 14 (35) | M2L2_S07_1 (matching) | 35 to 39 |
| 11 | WB2 | Where are we? | Workbook | workbookStop | workbook "2. The insight table" | 13 (35) | none (state only) | 40 to 41 |
| 12 | K2 | Where are we? | Close | closing / questions | s9 notes | 46 (45) OVER | none (presentation) | 42 to 43 |
| 13 | W4 | Our goals | Overview | opener | s10; s10 notes | 28 (45) | none (presentation) | 44 |
| 14 | S11 | Our goals | Goals | goalCards | s11; s11 notes | 30 (35) | none (state only) | 45 to 48 |
| 15 | S11B | Our goals | Decide | decision / single | s11 notes; hands-on practice step 4 | 0 (35) | M2L2_S11B_1 (choice) | 49 to 53 |
| 16 | V1 | Our goals | Watch | video | s12; s12 notes | 23 (45) | M2L2_V1_1, M2L2_V1_2 (choice) | 54 to 62 |
| 17 | WB3 | Our goals | Workbook | workbookStop | workbook "3. Goals" | 20 (35) | none (state only) | 63 to 64 |
| 18 | K3 | Our goals | Close | closing / keyline | s12; s12 notes | 30 (45) | none (presentation) | 65 to 66 |

Step discs as ordered: Opening: Start · Where we are · Bring · Workbook. Where are we?: Overview · Assets · Questions · Workbook · Dimensions · Sort · Workbook · Close. Our goals: Overview · Goals · Decide · Watch · Workbook · Close.

Screenshots: `planning/shots-p1/` holds 66 PNGs at 1280x720, every screen in every state (arrival, opened, answered, wrong, done), numbered in lesson order, plus six contact sheets `_sheet-1.png` to `_sheet-6.png`.

## 3. Decisions for Noy (please read these first)

### 3.1 Five screens are over the word budget, because the slide text is kept word for word

The work order asks for both: every slide word kept, and at most 35 words on a practice screen (45 on a presentation screen). These five cannot do both. I kept the slide text and recorded the exception on each screen (`words: { max, why }` in the content). `npm run check` passes and prints them as a WARNING; the review page marks them red.

| Screen | Words in its fullest view | Budget | Why |
|---|---|---|---|
| O3 | 72 | 35 | slide 3's table, three rows, both columns |
| S05 | 45 | 35 | the four slide 5 questions stay visible, and the open tile adds the slide line or its own text |
| S06 | 124 | 35 | the six slide 6 questions (60 words) stay on screen, and each marked card adds where its answer lives |
| K1 | 79 | 35 | one dimension word for word (question, values, insight), the key line, and the list of the eight names |
| K2 | 46 | 45 | the five summary questions and the four board names |

Ways to bring them down, if you want to: S06 could hide the question once a card is marked (the card would then show only where the answer lives, about 70 words); K1 could show the key line once on the map instead of on every detail view (about 70); O3 could show one row at a time.

### 3.2 The V1 narration is about one minute, not 2:30

The production block is written strictly from slide 12 and its notes, as ordered. Spoken at a normal pace that text runs about one minute. The placeholder is 2:30 with the four segments spread evenly (stops at 1:14 and 2:22). A real 2:30 film needs either slow pacing with on-screen builds, or more script, which would be new text for you to approve.

### 3.3 Things I added or chose that the work order did not spell out

1. **"Component three" and "Component four"** (the deck's own words on slides 4 and 10) sit as a small label above the opener title. Without it the top bar says "Chapter 2 of 7" and the big square says "3".
2. **K1 opens with the first dimension's card already shown.** The work order says a card opens when a node is selected; with nothing selected the lower half of the screen was empty.
3. **S05 has a "Done" button in each tile.** A tile with several chips needs a moment that says "I finished". A locked Done carries its reason as its label ("Choose first").
4. **K3 has a small heading, "Component four is closed".** The shell needs an h1 on every screen (focus lands on it); the key line is the hero.
5. **Choice questions use the template's current flow: pick, then Check** (one try). The work order's "one try" is kept; the click is not the answer by itself, so a slip of the mouse does not spend the try.
6. **After a wrong pick the feedback card says why that pick is wrong** (the line you wrote for that option), under "Not quite. Here is the right answer." The template shows the right option's line there; I changed it in this lesson only, because your lines are written per wrong option.
7. **The coach's short demo** (the launcher pulses once and says "Stuck? Ask me.") plays on WB0, the first screen with no ghost hand.
8. **O1's photo sits at the right and fades into the dark ground.** The deck's cover photo is nearly square, so at full bleed the face sat under the title.
9. **The end of this phase**: Next on K3 shows "End of this part. The work plan chapter comes next." and the lesson stays on K3.

### 3.4 Places where I was unsure about the source

1. **S05 chips.** Slide 5 lists "website, social pages, mailing lists, the brand itself" and names Google Analytics. The chips "Ads" and "None yet" (tile 2) come from the work order, not from the slide.
2. **S06 "where the answer lives" lines.** I checked each against L1: the competitor table and its columns (L1 home practice step 1: page counts, update rates, traffic sources, active ads), the traffic tools (L1 slides 10 and 17), the market map with two axes and the empty space (step 6), the keyword spreadsheet and monthly searches (step 2, L2 slide 3). The wording itself is the work order's.
3. **O3 key line** "Demand a source URL for every fact." is L1 home practice step 5 ("demand a source URL for every fact"), capitalised.
4. **S11 key line** is your wording, from the slide 11 notes.
5. **S07 tags and band, the S11B instruction, the V1 stop questions** are the work order's wording, built from slides 8, 9, 11, 12 and their notes.
6. **The later chapters' names** in the menu (From analysis to a work plan, Simulations, The marketing funnel, Close) are the work order's.
7. I read the workbook's four section titles from `Practice-Studio/activities/dm-m2l2-selfstudy/activity.json`. I did not open the live page.

## 4. Pilot copy (new UI text, for your approval)

### 4.1 On the screens

| Screen | Text |
|---|---|
| O3 | heading "Click each row to see what it becomes today"; closed cell "Click to see"; hint (screen readers only) "Open your two files from Lesson 1 before you go on." |
| WB0 | "Open your workbook"; "You fill it during this lesson. Keep the tab open; the lesson sends you back to it." |
| WB1 | "Workbook time · Part 1 of 4"; "Fill 1. Where you stand: the traffic in your market, and what you already own." |
| WB2 | "Workbook time · Part 2 of 4"; "Fill 2. The insight table: three dimensions, and the insight each one requires." |
| WB3 | "Workbook time · Part 3 of 4"; "Fill 3. Goals: one goal with a number and a date, and how and from when you will measure it." |
| WB0 to WB3 | button "Open the workbook" (screen readers also hear "Opens in a new tab"); after it is pressed: "The workbook is open in a new tab. This lesson keeps your place." (the template's line) |
| W3, W4 | label "Component three", "Component four" (deck text, see 3.3) |
| S05 | heading "Answer four questions about your business"; chips Yes, No, Website, Social pages, Mailing list, Ads, None yet, The brand itself, Google Analytics; tile 4 "Answer it from your market map and keyword spreadsheet. You write it in the workbook in a moment."; buttons "Done", locked "Choose first"; summary of tile 4 "In the workbook"; hint (screen readers only) "Open a question, answer it, then press Done." |
| S06 | heading "Can you answer each question from your Lesson 1 files?"; buttons "I can answer", "Gap"; the six "where the answer lives" lines; hint (screen readers only) "Mark each question: I can answer, or Gap." |
| K1 | "Explore", "All dimensions", "Next: <dimension>"; labels "Possible values", "Required insight"; hint (screen readers only) "Pick a dimension, then press Explore. Open all eight." |
| S07 | line "Possible value: what you see. Required insight: what you decide."; the three tags; hint (screen readers only) "A value is what you see. An insight is what you decide." |
| K2 | heading "Five questions to close Where are we" |
| S11 | hint (screen readers only) "Open all five cards." |
| S11B | heading "Pick the one that is a goal."; hint (screen readers only) "A goal can be checked later." |
| V1 | heading "Watch the video. Answer the questions when it stops." (the template's); "Watch for:"; the two stop questions and their four answers |
| K3 | heading "Component four is closed"; "All four components are on the board. Next: the work plan." |
| end | "End of this part. The work plan chapter comes next." |

### 4.2 Shell

- Locked Next, read by screen readers: "Next, locked until you open all three rows", "... until you open the workbook", "... until you answer all four questions", "... until you mark all six questions", "... until you explore all eight dimensions", "... until every card is placed", "... until you open all five goal types", "... until you check your answer", "... until the video ends and every stop is answered".
- The line shown after two presses on a locked Next: "Open all three rows to continue.", "Open the workbook to continue.", "Answer all four questions to continue.", "Mark all six questions to continue.", "Explore all eight dimensions to continue.", "Place every card to continue.", "Open all five goal types to continue.", "Choose an answer, then Check.", "Watch to the end to continue.", and the counters "{n} more to go.", "One more to go.", "Place {n} more cards.", "Place the last card."
- Menu: "Module 2 · Lesson 2"; a chapter of a later phase reads "coming in a later part".
- Board and marks for screen readers: "The four components", "done", "in progress", "to come", "explored", "opened", "answered", "Where the answer lives".
- Help (five lines), reworded for this lesson: "Read the heading on each screen: it tells you what to do." "Feedback appears in a card under each task." "Use Tab and Enter or Space to work without a mouse. Escape closes the menu." "The video stops for questions. Captions and a transcript are under the video." "Your place is saved. You can leave and come back."

### 4.3 Coach tips (one per screen, each at most 20 words, drafted from the screen's hint or the trainer notes)

| Screen | Tip |
|---|---|
| O1 | Today finishes the lecture: where we are, our goals, and what the plan costs. |
| O2 | This is one lecture across two sessions. Two components are done, two are today. |
| O3 | Open your two files from Lesson 1 before you go on. |
| WB0 | Keep the workbook tab open beside this lesson. You fill it in four parts. |
| W3 | A short block, and the one learners most want to skip. Stay with it. |
| S05 | Answer for your own business. On your own website you can know almost everything. |
| S06 | A gap is not a failure. Naming what your research cannot answer yet is the point. |
| WB1 | Use your Lesson 1 files. Rough numbers are fine, as long as they come from your research. |
| K1 | Read each dimension as a question. The required insight is what turns a number into a decision. |
| S07 | Ask of each card: is it what you see in the data, or what you decide from it? |
| WB2 | An insight table with values but no insights is the usual trap. Fill the third column. |
| K2 | Say the five questions out loud for your own business before you move on. |
| W4 | Short and non-negotiable. Nothing in the work plan is legitimate until this block is done. |
| S11 | All five are legitimate goals, including collecting information. |
| S11B | A goal can be checked later. Look for a number and a date. |
| V1 | Watch for the moment measurement has to start. |
| WB3 | A goal without a date is an intention. Give yours a number and a date. |
| K3 | Set the tracking up before the campaign. That is the cheapest hour you will spend. |

Coach opening lines: "Hi, I'm here if you need me." (title), "Questions about this idea? Ask me." (presentation screens), "Stuck? Ask me." (tasks), "Fill this part in the workbook, then come back here." (workbook stops; the template's line promised a coach inside the workbook, which I did not want to promise for DM yet).

## 5. Details worth knowing

### 5.1 Tracking and SCORM

- Four interactions, all practice (weighting 0): `M2L2_S07_1` (matching), `M2L2_S11B_1` (choice), `M2L2_V1_1`, `M2L2_V1_2` (choice). First attempt only; a later attempt stays in the lesson state.
- The template's adapter sends each interaction to the LMS as readable text (its "PK1" rule): the id carries the question (`M2L2_S11B_1_Pick_the_one_that_is_a_goal`), the answer and the correct answer go out in words, and the SCORM type is `fill-in`. The matching and choice types above are the content's own. If Blossom reports should show `matching` and `choice` instead, that is an adapter change to decide with Dor.
- S05 and S06 answers, the opened rows, tiles, dimensions and goal cards and the four "workbook opened" flags are in `cmi.suspend_data` only. After the whole lesson the suspend data is 671 characters (limit 4096).
- There is no scored check in this phase, so `lesson_status` stays `incomplete` and no score is sent. The completion rule is the template's until the wrap-up chapter exists.
- A workbook stop unlocks after "Open the workbook" was pressed once on that screen, and the flag is kept. The lesson cannot see the workbook (honour system).

### 5.2 Images

- Real: O1's photo is the deck's cover (slide 1, picture "Google Shape;300;p26"); S05's screenshot is the deck's Google Analytics picture (slide 5, "Google Shape;396;p30"). Both in `assets/img/m2l2/`.
- Placeholders: six slots, each a plain gradient in `assets/img/temp/` (`temp: true`), each with a prompt file in `assets/img/prompts/`: `ch1-opening`, `workbook-stop` (one image for every stop), `ch2-where-are-we`, `ch2-dimensions`, `ch3-our-goals`, `ch3-measurement`. Every prompt ends with the same "Shared photographic language" block (a marketer's desk, dashboards, search results, a phone with a social feed; realistic editorial photography; no stock grins; no text in the image; no real brands or logos). `assets/img/prompts/README.md` lists which screens use which slot.
- V1 plays a silent placeholder (`assets/video/temp/v1-placeholder.mp4`, a navy frame with "V1 placeholder" and a clock) with captions made from the production block.

### 5.3 Grounds, so screens do not all look alike

O1 title photo · O2 dot grid · O3 light blur · workbook stops soft dark blur with one centred panel · W3, W4 full photo with the centred opener card · S05 light blur · S06 dot grid · K1 dark blur · S07 dot grid · K2 light blur · S11 dot grid · S11B soft dark blur · V1 plain dark · K3 dark blur.

### 5.4 Ghost hand

On arrival, only where the action is not obvious: O2 (a component), O3 (the first hidden cell), S05 (the first tile), S06 (in the left gutter, level with the first card's buttons), K1 (another node, then Explore), S07 (the drag), S11 (the first card). None on S11B or the video stops. I did not capture the hand in motion in the screenshots (the tests run with reduced motion).

### 5.5 What the template had and this lesson does not

- Removed tools: the EAI one-off content and screenshot scripts (`fx*-content`, `nl*-content`, `v2-*`, `pp1-*`, `md1*`, `shots-*`, `compare-*`), `test-adapt` (no personal path here), `test-coach-live` and `test-lms-origin` (they test the live coach page), `test-coach` (its checks were about the EAI knowledge check lock; the coach is covered by `walk`, `test:fit` section 4 and `test:review`), the Gemini image generator and its readme.
- Rewritten for this lesson: `walk.mjs` (the template's was 180 KB of EAI screens), `check-overflow.mjs`, the states of `test-fit.mjs`. New: `tools/states.mjs` (every screen state, shared by the tests) and `tools/shots.mjs`.
- The unused template files in `src/templates/` (bpmn, flags, explorer, input, check, result, end, handoff) are kept, as the work order says to keep `src/`.

### 5.6 New tokens

Slide 11 uses five card colours. Teal and blue map to the existing `--wl-teal` and `--wl-navy`. Three muted accents were added to `src/tokens.css` for green, amber and purple. Contrast on white, as a card's top strip (needs 3:1): `--wl-acc-green` #3F7D5C 4.88:1, `--wl-acc-amber` #B07A1E 3.72:1, `--wl-acc-purple` #6A5599 6.23:1.

## 6. Test results (15 Nov 2026, this machine)

| Command | Result |
|---|---|
| `npm run check` | passed, 86 checks. Three WARNINGS, all expected: 5 screens over the standard word budget (3.1), 2 temp video files, 10 temp images |
| `npm run test:fit` | passed, 608 checks: 66 screen states at 1280x720 and 1024x576, the menu and its dialogs, the coach panel at both docks on all 18 screens |
| `node tools/check-overflow.mjs` | no overflow: 198 screen states at 1280x720, 1024x576 and 1920x950, 0 problem states |
| `npm run walk` | passed, 170 checks, keyboard only, all 18 screens, the menu, the coach, resume |
| `npm run test:scorm` | passed, 173 checks: 270 valid SCORM 1.2 calls, 4 interactions each sent once, no identity field touched, status incomplete, exit suspend, resume lands on K3 |
| `npm run test:review` | passed, 23 checks: review mode writes nothing and makes no SCORM call; `review.html` shows all 18 screens by chapter with id, template and word count |
| `npm run package` | `dist/dm-m2l2-lesson-scorm12.zip`, 0.76 MB, 58 files |

Two things the tests caught and I fixed before this report: the word "null" printed inside an S05 tile and the S11 panel (an empty child), and the S06 closing card sitting 3 px on the cards. The walk now fails if a code value is printed on screen, and check-overflow counts any vertical overlap.

## 7. Not done, not verified

- No commit, no push.
- Not tested in Blossom or SCORM Cloud. Only the mock SCORM 1.2 API.
- Accessibility: the automated checks only (focus on the h1 of every screen, labels and live regions as the tests read them, 44 px targets, 4.5:1 text, reduced motion). No axe run and no screen reader pass.
- The live workbook page was not opened; the link is checked as the right URL opening in a new tab.
- The real photos and the real film.
- The live AI coach.
- The next chapters. I stopped after K3, as ordered.

## 8. Outside the lesson folder

- `C:\Users\noyam\Desktop\Wawiwa\.claude\launch.json`: one new entry, `dm-m2l2-lesson` (port 8140). Not in the repo.
- To read the practice PDFs I installed the Python package `pypdf` on this machine (`pip install pypdf`).
- `wawiwa-activities/.claude/launch.json` (inside the repo): I first added the launch entry there by mistake, then removed it again. Its content is back as it was, but git is not on the PATH of the shell I worked in, so I could not run `git status` to confirm the file is byte for byte unchanged (a byte-order mark or line ending may differ). If `git status` shows it as modified, `git checkout -- .claude/launch.json` restores it.
- Nothing else was touched: not the template, not `dm-m2l2-selfstudy`, not any other lesson folder.
