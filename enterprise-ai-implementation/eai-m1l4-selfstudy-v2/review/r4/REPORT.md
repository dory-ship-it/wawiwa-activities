# EAI L4 R4: content and UX fixes after the planning review (19 Oct 2026)

Before R4, the uncommitted window-filling work from the handoff (stage widens up to 1600 px) was committed on its own as `31debec`, as Noy asked. R4 is one local commit after it. Not pushed.

## What changed

1. **S01B Lesson goals** (new, Chapter 0, between S01 and S02). Decision template, new variant `goals`: eyebrow, instruction, deliverable line, five numbered outcome rows from deck slide 39. The deck's sub-line is each row's tooltip (and its aria-describedby). Any row is accepted: no right or wrong colours, the picked row is teal-tint with a check, and one feedback line for all. A new pick replaces the first and goes out as a retry. The pick is stored as `L4_GOAL_FOCUS` (state `f`, one letter). Tracking: `L4_S01B_1`, choice, scored false, neutral, Bloom Evaluate, correctResponse null. Chapter 0 is now 8 minutes (S01B 1 min), so it counts in the rail and the menu %.
   - S20 step 2 shows "You marked this as hardest: {goal}." above the chips when a pick exists.
   - Menu: "Lesson goals" in the footer row (opens the five outcomes with their sub-lines, read only, the pick marked "Your focus"). The chapter that builds the picked outcome carries a "Your focus" tag, and its aria-label says so.
2. **S02**: Homework 1 context line, new instruction, help line by the fields. `links.homework1` added as **null** (no URL in content), so no "Open Homework 1" button is shown; the code shows it, in a new tab, as soon as the URL is set. Case title maxLength 60 on S02 and on the S18 step-2 title field; the problem field stays at 250.
3. **No bare case numbers**: every "Case N" a learner sees now names its topic and origin (table below). The topics come from the Lesson 1 practice booklet (Case 2 customer service requests, 3 sales calls, 4 course feedback, 5 weekly management report, 6 student inquiries). Answers and option order are unchanged.
4. **S21 item 5**: the h1 already used `items[4].instruction` ("Find the two errors..."). What was wrong was the hint: the band still said "Choose one...". Item 5 now has its own hint.
5. **Sort bins** (S04, S09, S16, S17, S18A, all through `sort.js` / `frame.css`): each column is a dashed bin on light grey with its name on top and the placed cards inside it. With a card selected, every bin turns white with navy dashes; the bin under the pointer or keyboard focus turns solid teal-tint. A wrong drop shows a red border, tint and X. The whole bin takes a mouse click; the name stays the keyboard target. There is no empty gap between bins and cards (the space kept for chips sits inside the bin). Same interaction, keys and tracking.
6. **Rail tooltips**: the dots already had a tip and an aria-label ("{title}, {status}"), but the tip opened under the dot and covered the next dots. It now opens to the right of the dot, level with it, on hover and on keyboard focus (`attachTip(..., { side: 'right' })`).
7. **S19**: "Open workbook" (primary) comes first, then "I'm back", 12 px apart.
8. **Video stop view** (V1 and V2, template-wide): the logo moves off the paused still to the top of the question panel. The panel's top padding grew 64 to 72 px to make room.
9. **Rail "% done" on V1: not a bug.** The % is weighted by minutes (`screen.minutes` against the 181 chapter minutes). On the real path it reads S01 1%, S01B 2%, S02 4%, then 4% on FT1 and 5% on V1 (checked in the browser). "0% done" appears when V1 is opened with the dev jump `?reset=1&screen=V1` (or `?screen=V1` in a new browser): `reset=1` clears progress, and the jump does not mark earlier screens done. All R4 screenshots are dev jumps, so they show 0%. One thing to decide: because Chapter 5 is 82 of 181 minutes, Chapters 0 and 1 only move the bar a few percent.

## Text changes (planning syncs the storyboard from this table)

| Screen | Old | New |
|---|---|---|
| S01B eyebrow | (new screen) | Today's lesson |
| S01B instruction | (new) | Pick the outcome that looks hardest for your case. |
| S01B deliverable line | (new) | By the end you hand in an AS-IS map of your own case in eight fields, with one success metric. It is your entry ticket to Lesson 5. |
| S01B option a | (new) | Identify roles and handoff points (tip: Who is involved and where responsibility passes.) |
| S01B option b | (new) | Map knowledge sources, ownership, and sensitivity (tip: Which sources the process uses, who owns them, how sensitive they are.) |
| S01B option c | (new) | Mark existing controls and gaps (tip: Including 'unclear' as a legitimate answer.) |
| S01B option d | (new) | Define a measurable success metric (tip: With a quantitative baseline and a clear target.) |
| S01B option e | (new) | Spot decision points: where AI fits, where people decide (tip: Tell when AI fits and when human judgment is required.) |
| S01B feedback (all options) | (new) | Noted. The chapter that builds it is marked in the menu. Your self-check in Chapter 5 comes back to it. |
| S01B hint (band, before a pick) | (new, pilot copy) | Pick one. There is no right or wrong answer here. |
| S01B footer locked reason | (new, pilot copy) | Next, locked until you pick one outcome |
| Menu footer button | (new) | Lesson goals |
| Menu, Lesson goals dialog note | (new, pilot copy) | By the end of this lesson, you will be able to: |
| Menu chapter tag | (new, pilot copy) | Your focus |
| Menu chapter aria-label (focus chapter) | {title}, {status} | {title}, {status}, builds the outcome you marked hardest |
| S20 step 2 reminder | (new) | You marked this as hardest: {goal}. |
| S02 top line | This is the case you map in Chapter 5. | In Lesson 1 you chose one use case for the whole module. Today you map it. |
| S02 instruction | Bring your case from Homework 1. | Bring your use case from Homework 1. |
| S02 help line | (new) | No Homework 1 at hand? Use any process at your work that repeats and that you know well. |
| S02 button | (new, hidden while links.homework1 is null) | Open Homework 1 |
| S02 / S18 case title limit | 250 characters | 60 characters |
| S03 still caption 1 | Case 1: car company, 1980s | Video case: car company, 1980s |
| S03 still caption 2 | Case 2: fintech, 2024 | Video case: fintech, 2024 |
| FT2 memo question | Case 6: the admin team routes an inquiry to the right department. Which field records that moment? | Lesson 1 case: student inquiries. Admin routes one to a department. Which field records that moment? |
| S15 eyebrow | Case 4: course feedback | Lesson 1 case: course feedback |
| S18A header | Case 3: sales call summaries | Lesson 1 case: sales call summaries |
| S21 item 1 stem | Case 2: reps route requests to departments. Field 4 says 'Rep to department.' What is missing? | Lesson 1 case: customer service. Field 4 says 'Rep to department.' What is missing? |
| S21 item 2 stem | Case 6: student inquiries. Which step is the strongest first place for AI? | Lesson 1 case: student inquiries. Which step suits AI first? |
| S21 item 3 stem | Case 5: the weekly report takes 4 to 6 hours. Nothing is logged. Baseline? | Lesson 1 case: weekly report, 4 to 6 hours. Nothing is logged. Baseline? |
| S21 item 4 stem | Case 2: nobody knows what share of requests are simple. Where does this go? | Lesson 1 case: customer service. Share of simple requests unknown. Where does this go? |
| S21 item 5 hint | Choose one. You can retry, but only the first answer counts. (screen hint) | Select two, then press Check. Your first answer counts. |

Word counts of the stems: FT2 17 to 16, S21 item 1 16 to 14, item 2 13 to 10, item 3 14 to 13, item 4 14 to 14.

## Screenshots (`review/r4/`, 1280x720, dev jumps)

- `s01b.png`, `s01b-picked.png`: S01B before and after a pick
- `s02.png`: S02 with the Homework 1 context and the help line
- `ft2.png`, `s15.png`, `s18a.png` (one card placed): the new case labels
- `s16-start.png`, `s16-card-selected.png` (bins waiting for a drop), `s16-placed.png` (one card placed)
- `s19.png`: Open workbook first, then I'm back
- `s21-item1.png`, `s21-item5.png` (item 5 heading and hint)
- `s20-reminder.png`: the S01B pick as a reminder on S20 step 2
- `rail-tooltip.png`: keyboard focus on the Toolkit dot
- `menu-focus.png` ("Your focus" on Critical eye), `menu-goals.png` (Lesson goals dialog)
- `v1-stop.png`: V1 stop 1, logo off the still
- The R4 screenshots come from `node tools/shots-r4.mjs`. `walk -- --shots` now also takes `review/p1.5/s01b.png` and `s01b-picked.png`, but it was not re-run, so the older review folders (p1.5, r1 to r3) keep their earlier screenshots.

## Checks

All passed on 19 Oct 2026, after the last code change:
- `npm run check`: passed (warnings: the two word-count allowances above, and the 2 temp V2 video files that were there before).
- `npm run test:fit`: passed, 579 ok. New states: S01B hint and picked, S16 with a card selected, S20 step 2 with the goal reminder, and the Lesson goals dialog, each at 1280x720 and 1024x576 (no clipping, no band overlap, 14 px text, 44 px targets, contrast).
- `npm run walk`: passed, 437 ok. New checks: S01B by keyboard (pick, change pick, focus on Next, kept as L4_GOAL_FOCUS, revisit), the S02 context and help lines, title maxlength 60, the rail tip right of the dot on focus, the Lesson goals dialog, the S20 reminder, the S21 item 5 hint, the logo off the still at each V1 and V2 stop. Updated only where tests asserted old wording or counts: menu footer `goals,help,startover`, S01 Next lands on S01B, rail 8% at S03 (was 7%), S02 counter `/60`, the retry list with `L4_S01B_1=e/neutral`.
- `npm run test:scorm`: passed, 341 ok. 43 interactions on the walked route (45 in the lesson), each written once; status passed, score 80. suspend_data is 1593 chars after the whole lesson and 2402 with every free-text field at 250 (limit 4096).

## Deviations and open points

1. **45-word rule on S01B and S02: not met with the copy as specified.** S01B counts 60 on-screen words (eyebrow 2, deliverable 28, five outcome titles 30; the h1 is not counted). S02 counts 61 (the new top line and help line add 25). I kept the copy word for word and added a `wordLimit` allowance with its reason on these two screens. `check.mjs` lists them as a WARNING and fails only above the allowance. Every other screen still has to meet 45. Planning should cut, then remove `wordLimit`. Cuts that reach 45:
   - S01B (needs minus 15): deliverable line "You hand in an AS-IS map of your case: eight fields, one metric." (13 words) brings it to 45.
   - S02 (needs minus 16): top line "In Lesson 1 you chose one use case. Today you map it." (11); help line "No Homework 1? Use a repeating process you know well." (9); placeholder "e.g. Sales call summaries" (4). That makes 44.
2. **Menu "Resources"** no longer exists (it was removed in the last round), so "Lesson goals" sits in the menu footer row before Help and Start over.
3. **Outcome-to-chapter mapping** (my choice, in content `options[].chapter`): a roles and handoffs to Critical eye (S14), b sources to HR demo (S09), c controls and gaps to HR demo (V2 stop 3, S10), d metric to HR demo (S11), e decision points to Critical eye (S16). Planning to confirm.
4. **S03** "Case 1/2" captions changed to "Video case: ..." under "anywhere else": they named V1's two cases and could be read as Lesson 1 Cases 1 and 2. V1's own narration still says "Case one / Case two" (video, not touched). The S17 deck counter "Case 1 of 5" (screen-reader label of the progress dots) counts the cards on that screen and stays.
5. **links.homework1 is null**: no Homework 1 URL exists in content. Add the URL to show "Open Homework 1" on S02.
6. **New pilot copy** for review: S01B hint and locked reason, "Lesson goals", the dialog note, "Your focus" and its aria-label.
7. **S21 result card**: the h1 goes back to the screen instruction "Choose one. Your first answer counts." above the score. This was there before R4 and still reads oddly; a result-card heading would need new copy.
8. **Local preview**: an `eai-l4` entry (node `tools/serve.mjs`, port 8125) was added to `C:\Users\noyam\Desktop\Wawiwa\.claude\launch.json`, outside the repo, for the in-app browser.
9. SCORM: the lesson now has 45 interactions (44 before). The walked fast-track route writes 43 (V1's two stops are skipped).
