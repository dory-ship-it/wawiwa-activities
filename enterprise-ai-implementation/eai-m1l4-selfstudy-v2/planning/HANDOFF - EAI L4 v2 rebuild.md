# HANDOFF: EAI L4 v2 rebuild (state on 9 Nov 2026)

Talk to Noy in Hebrew. Every line, including progress lines and wrap-up boxes, is in Hebrew; course content stays in English.

## What this is
The full rebuild of the Lesson 4 self-study (EAI Module 1) happens in this copy, `eai-m1l4-selfstudy-v2`. Run it with launch.json "eai-l4-v2" (port 8129); the address is http://localhost:8129/index.html?screen=W4.
- The live lesson and `eai-m1l4-selfstudy-fixes` are not touched.
- Nothing is published until Noy approves and Dor pushes.

## Process (Noy, 9 Nov: "how do we avoid a hundred rounds of fixes")
1. **Plan the chapter from the deck first.** The deck is `Self- Study\EAI\EAI-M01-L04.pptx`; the slides are exported to PNG in the session scratchpad, so re-export them through PowerPoint COM if needed. For each screen write one line: which slide it teaches, how that slide breaks the idea down (pair, numbered list, 3 cards, big number, before/after), one interaction, one ground. Send this short plan in chat (not a table) and wait for her OK.
2. **Build** in the copy.
3. **Self-check** every screen against the checklist below, in screenshots and with test-fit.
4. **Review:** send the built chapter once.

## Checklist (all of these are notes Noy has already given)
- **What to do:** the first line says what to do, with an exact action verb. The learner always knows what to do.
- **One button:** Check, then Next.
- **No duplicated chrome:** nothing the bar already shows (chapter name), no counters ("4 of 4"), no time.
- **The interaction needs a real decision:** nothing gives the answer away. S13's numbered steps did.
- **No repeated interaction type:** never two multiple-choice screens in a row.
- **Photos:** only when the photo shows the situation literally. No caption to explain a photo; if a photo needs explaining, drop it.
- **Colour has a meaning:** dark = learn (key idea, opener); light = do.
- **Feedback** sits next to the action.
- **Motion** only where it shows something: once, short, never on buttons, none with reduced motion.
- **Words** within the limits (check.mjs), with small text kept to the minimum.
- **The story:** take the HR case from the deck ("the HR case from Lesson 1"). Do not invent; Dana is to be removed (not yet done).

## What is built (Chapter 5, Critical eye: W4, S13, S14, S15, K4, S16, S17, S17B)
**Engine changes**
- `screen.ground` = { kind, side }, read by zones.setScene. The kinds are full, half, blur, darkblur, split, dots.
- A new `opener` template in intro.js. Its list field is `points`, because `stops` belongs to video.
- flags.js:
  - `screen.pair` shows a pair of cards above the heading;
  - the feedback sits under the clicked step;
  - the span between the Start and End flags is coloured;
  - the step numbers are hidden.
- decision.js: `screen.proof` is a big-number card shown after the right answer (S15).
- words.js covers the opener, the pair and the proof. The line steps of flags are no longer counted (they are click targets, like the map fields).
- `src/v2.css` is loaded after fx8.css and holds the grounds, the per-screen layouts and the motion.

**Content**
- `tools/v2-ch5-content.mjs` and `tools/v2-ch5-r3.mjs` (both re-runnable).
- W4 is now the opener.
- S13 has 7 steps (one before and one after the HR process), with flags Start = 2 and End = 6. The boundary pair was removed (Noy: "looks unrelated there"); slide 21's idea now sits in the lead and the closing feedback, and flags.js still supports `pair`.
- S14 is multi, 4 of 6, the four items of slide 27; its variants were rewritten.
- S15 has the proof card (−75%, the car company).
- S16 has two columns.
- S17 is light, with step 1 on the case and step 2 on the question.

**Photos**
- Files are in `assets/img/l4/v2/`.
- The set's style and prompts are in `assets/img/prompts/v2/PHOTO-SET.md`.
- FLUX writes fake words on paper, so shoot paper from the side.

**Tests**
- check is green except the 5 O2 failures, which predate v2 (Chapter 1).
- test-fit passes for ch4 at 4 sizes, adaptive variants included.
- walk.mjs, test-review and test:scorm are stale and not updated.
- After any `src/` change, run `npm run stamp`.
- For the screen shots, run `node tools/shots-fx7-screens.mjs --only=...` (output goes to review/fx7/).

## Status
Chapter 5 was **approved by Noy on 9 Nov 2026** (round 3). It is the model for every other chapter.

## Intro + Why map (approved by Noy on 9 Nov 2026, after review 1)
Plan: `planning/V2-CH1-2-PLAN.md` (Noy said "I trust you, keep the same way"). Content: `tools/v2-ch12-content.mjs` (re-runnable, writes whole screens; run it from the pre-change file only if a screen must be rebuilt from its old version).
- O1 title + s1 subtitle, new photo. O2 h1 "Click a lesson to see where today fits.", top line cut (the 5 O2 word failures are gone), dots ground, no "Click to open" cue (`screen.cue: false`).
- O3 is a new `deliverable` template (intro.js): pair of cards (map / metric) + foot line naming "the HR case from Lesson 1". Darkblur. The five learning outcomes are parked in O3 `outcomesParked` for the Wrap-up chapter (deck s39).
- S01 = the four causes (s5), decision `risk` variant extended: `stage.top` context, link/strip optional, `todayChip` on `o.today` options after the pick. Neutral, L4_S01_1 neutral. Dana is gone (the `characters.dana` entry and assets/img/dana.jpg are now unused).
- Personal path c4: L4_S01_1 replaced by L4_V1_1 (keeps nine items and the bands).
- S02 on a half photo (left); CSS in v2.css; lib.mjs measures a half-ground panel against the light half.
- W1 = opener with `statement: true` (no points). V1 `showTitle: false`. S03 = sortDeck, 6 facts into Unmapped process / No success metric (L4_S03_1 matching). K1 dark (darkblur), `evidence.items` source pair. Ch1 order W1, V1, S03, K1 (K1 endOfChapter).
- New photos: ch1-o1-mapping-wall, ch1-s02-typing-case, ch2-w1-laptop-paperwork (add to PHOTO-SET.md seeds: 2113593534, 456428189, 210100097).
- Self-check: check green; test-fit passes at 4 sizes for the 9 screens and Ch5; `tools/shots-v2-states.mjs` shoots after-action states; review sheets in review/v2-ch12/.
- test:adapt has 11 failures that predate this work (from Ch5's S14-S17), same as before the change.
- No italics in src/*.css (check.mjs rule): the deck's italic statements are set upright.
- Review 1 (Noy, 9 Nov): O1 less text (no subtitle, no programme line) and the deck's slide-1 photo (ch1-o1-deck-slide1.jpg, from ppt/media/image6.png); S02 photo narrower (ground size 'narrow' = 30%, zones.js stage[data-size]) and a line beside Open Homework 1 ('No case yet, or starting over? Do Homework 1.'); V1 on the darkblur ground (W1's photo). Approved.

## Toolkit + HR demo (built 9 Nov 2026, sent to Noy, waiting for her verdict)
Plans: planning/V2-CH3-PLAN.md, planning/V2-CH4-PLAN.md (Noy: continue without a plan round). Content: tools/v2-ch3-content.mjs, tools/v2-ch4-content.mjs.
- W2 and W3 are openers (warm-up guesses retired). K2, S05a, S07 dark. S07 has no question any more (explorer: screen.question absent = open all eight, then Next). S08 rule cards carry the slide 16 reasons (o.sub). S06 thumbnails removed.
- NEW screen K3 (s38, 'Unclear' is a legitimate answer, deliverable template) after S10: parts S10 and S11. V2 on darkblur, showTitle false.
- Committed locally (b2df4af) for Noy to push. check green, test-fit passes, test:adapt same 11 pre-existing failures.

## Build yours + Wrap-up (built 9 Nov 2026, sent to Noy, waiting for her verdict)
Content: tools/v2-ch56-content.mjs. Noy (mid-build): no runs of screens that look the same; checked across the lesson.
- NEW W5 (Build yours opener, s35) and W6 (Wrap-up opener: the five outcomes, s39; O3's parked copy removed).
- S18 half right (redaction photo), S20 half left (tick photo), S08B narrow half left (sticky notes) so S08/S08B differ. v2.css moves .w-sheet-focus into the light half on half grounds.
- S19A dark, its time chip removed (handoff brief renders no chip without content), its bar icon 'map'. S21R dark. S22 new photo. END uses the deck's slide-1 photo (bookend with O1).
- The chapter screen lists are one line each in the JSON: the scripts now keep that format.

## Next
Noy's verdicts on Toolkit, HR demo, Build yours, Wrap-up. Then: walk.mjs, test-review and test:scorm are stale; test:adapt has 11 failures from Ch5's S14-S17 (pre-existing).
