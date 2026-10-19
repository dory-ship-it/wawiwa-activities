# EAI L4 V3-1: Intro and Chapter 1 (storyboard v3), V2 hookup (19 Oct 2026)

Precondition met: the only changes were the Round 4 reference files, committed first as `f6ae3bf` "EAI L4: Round 4 design reference". This round is one local commit after it. Not pushed (R5 `d182b11` is not pushed either). Nothing under `video/`, `assets/video/`, `assets/img/v1/` or `assets/img/v2/` was changed; V2 only points at the films that are there.

## What changed

**Chapters.** ch0 is "Intro" (was "Entry"), ch6 is "Wrap-up" (was "Close"). Rail, menu and aria-labels read the content.

**Intro (ch0): O1, O2, O3, S01, S02.** S01B is gone, along with `L4_S01B_1`, `L4_GOAL_FOCUS`, the menu's "Your focus" tag and the S20 step 2 reminder. The menu's "Lesson goals" dialog now reads O3: each goal's label and its full text.

| Screen | Template | Build |
|---|---|---|
| O1 | `title` | No header or footer, the rail stays. Text column (logo, programme, "Module 1 · Lesson 4", h1, turquoise rule, quote, "Start the lesson") left; `assets/img/ft3.jpg` right (38% 50%). Start goes to O2. |
| O2 | `moduleMap` | Header line. Five stations on a turquoise line as ARIA tabs: arrow keys and Home / End move the focus, Enter or Space opens (manual activation, roving tabindex). L1 and L2-3 done, L4 navy with "Today", L5 and L6 not started; L4 open on arrival; panel under the line. Not tracked. No ghost hand (removed after Noy's review: it pointed at Lesson 5). |
| O3 | `goals` | Header line. "Your deliverable" box, five icon tiles appearing 150 ms apart (none with reduced motion). The full goal is each tile's tooltip on hover or keyboard focus, and its aria-describedby. Not tracked. |

**Chapter 1 "Why map": W1, V1, K1, S03.**

| Screen | Build |
|---|---|
| W1 (`warmup`, replaces FT1 and its routing) | Navy panel left (lightbulb, "Warm-up", "Not scored", line, chapter); question right as a radio group (FT1's three options, same order). A pick is a navy "Your guess" row: no right or wrong colours, and the band reads "Hold that thought. The video shows what really happened." The pick can change. Next unlocks after a pick. `L4_W1_1`: choice, not scored, neutral, response = the letter; a later pick goes out as a retry. No Skip. |
| V1 | Real film unchanged. The line above the player reads "Watch for: what separates a change that works from one you fix later?" The ghost hand plays at stop 1. |
| K1 (`concept`) | Light blue-grey stage (#F4F7F9), "Key idea · Hammer's principle", h1, the idea in one line. Two figure cards built in HTML/CSS: six tilted boxes, dashed crossing links and a navy "faster tech" chip, "Same mess, faster." in #CC0000; one dashed box with an X above four teal boxes, "Fewer steps first. Then speed up." in teal ink. The figures draw on in about 1 s (none with reduced motion). Each figure is role img with its meaning as aria-label. Evidence line with chart icon, source right. Not tracked. |
| S03 | Unchanged, except the correct band is one closing line, ending "Today you fix both: a map and a metric." (25 words). The ghost hand plays here too. |

**Presentation screens never lock Next.** O1, O2, O3 and K1 carry `presentation: true`; the engine marks them done on arrival. Practice screens keep their locks. No chapter can be skipped: FT1 is gone, while FT2 to FT4 stay until their chapters are redone.

**Ghost hand** (`src/ghost.js`). A semi-transparent white pointer with a navy outline and a teal ripple, placed from the target's live box, so it lands on target at any stage width.
- It plays once per interaction type, about 600 ms after the screen settles (in about 150 ms, a 450 ms move per target, a tap with a ripple, out by about 3 s):
 - V1 stop 1: taps the first option, selects nothing.
  - S03: taps the first two cards, then Check, selects and checks nothing.
- Any pointer or key input stops it at once.
- It never selects, checks or tracks anything; the walk verifies this.
- Once a type is seen, it plays only after 8 s without input. That applies to V2's stops, which share V1's type.
- A "Show me" button, hand icon and text, next to the instruction replays it (next to the stop question on video stops).
- With reduced motion: a static hand and arrow at the target for 3 s.
- The hand is aria-hidden; the written instruction always stays.
- Seen types are kept in state `h`, one letter each (`v` video stop, `s` pick two): at most 2 chars of suspend_data.

**V2.** Points to `assets/video/v2.mp4`, captions `v2.en.vtt`, poster `v2-poster.jpg`, duration 168.323 s (2:48), stops 46.999 / 81.366 / 131.097 from `v2.cues.json`, temp false. The stop questions still match where the film stops. Each stop sits in a caption gap right after the narration hands over the choice:
- stop 1: "Before I fill it in, you choose." (Field 2 trigger)
- stop 2: "Field 4 asks where responsibility passes from one role to another."
- stop 3: "Is anything checking the answers before they go out? What goes in the map?" (Field 6)

**Minutes.** O1 1, O2 2, O3 2, W1 1, K1 2. Chapter 0 is 12 minutes, chapter 1 is 11, the lesson is 187.

**Tokens.** `--w-key-bg` #F4F7F9 (K1 stage), `--w-guess` #EEF3F7 (W1 guess row), both added to the check's hex allowlist.

**Wide windows (6b).** Every new template fills the wider stage. Checked at 1280x720, 1536x730 and 1920x950, plus 1024x576 and 1366x650 / 2560x1080 in test:fit:
- O1: the text column keeps 568 px, the photo takes the rest to the right edge.
- O2 and O3: the line, station grid, panel, deliverable box and tile grid stretch between equal 64 px gutters. Stations stay evenly spaced, tile text keeps its size.
- W1: the navy panel keeps 392 px; the question column takes the rest, its text capped at 760 px and centred.
- K1: text capped at 820 px; the two figure cards stretch, the figures stay centred in them.
- Logo: in the header bar on O2, O3, W1 and K1 (24 px from the rail); on O1 at the text column's left edge (same x as the h1).
- test:fit checks every new screen at all six sizes: no one-sided empty strip, logo aligned, nothing clipped, band, contrast, 14 px text, 44 px targets.

## Screenshots (`review/v3-1/`, `node tools/shots-v31.mjs`)

At 1280x720:
- `o1.png`
- `o2.png` (L4 open)
- `o3.png` (focus on the last tile, its tooltip shown)
- `w1-before.png`, `w1-after.png`
- `v1.png` ("Watch for" line)
- `k1.png`
- `s03-hand.png` (mid-demo), `s03-showme.png` ("Show me" with its hand icon)
- `v2-stop1.png` (real V2 film, stop 1)

At 1920x950: `o1-1920x950.png`, `o2-1920x950.png`, `o3-1920x950.png`, `w1-1920x950.png`, `k1-1920x950.png`, `s02-1920x950.png` (plus `s02-1536x730.png`).

## Changes after Noy's first look (same day)

- O2: the ghost hand is removed. It demonstrated by opening Lesson 5, which pointed the learner at the wrong lesson. O2 has no "Show me" either.
- "Show me" now has a hand icon before the text, wherever the hand is used (S03, video stops).
- S02 widens with the stage: the form is 608 px at 1280 and grows with the extra width, up to 928 px, centred, with the logo over its left edge (783 px at 1920x950).

## Text changes (planning syncs storyboard v3 from this table)

| Screen | Old | New |
|---|---|---|
| Chapter 0 title | Entry | Intro |
| Chapter 6 title | Close | Wrap-up |
| S01B | (whole screen: eyebrow, deliverable line, five outcome rows, feedback, hint) | removed |
| ui | goalReminder "You marked this as hardest: {goal}."; menu "Your focus" and its aria-label; locked reason "Next, locked until you pick one outcome" | removed |
| Menu, Lesson goals dialog | S01B outcome titles with sub-lines | O3 goal labels with their full text |
| Round 4 header line (O2, O3, W1, K1) | (new) | Lesson 4 · Process Modeling and Workflow Mapping |
| O1 programme | (new) | Enterprise AI Implementation Specialist |
| O1 kicker | (new) | Module 1 · Lesson 4 |
| O1 h1 | (new) | Process Modeling and Workflow Mapping |
| O1 quote | (new) | “Don't accelerate a broken process. Take it apart first.” |
| O1 button | (new) | Start the lesson |
| O1 photo alt | (new) | An HR team at work, a process map on a laptop and sticky notes for each step |
| O2 eyebrow / h1 / line | (new) | Where we are / Lesson 4 of Module 1 / Open any lesson to see how it connects to today. |
| O2 L1 | (new) | Lesson 1 · Case diagnosis · "Your Lesson 1 case is the raw material for today." |
| O2 L2-3 | (new) | Lessons 2 and 3 · Language model, working template · "The nine-field template looked at one step. Today you map the whole process." |
| O2 L4 | (new) | Lesson 4 · A full process map · Today · "You map one real process as it runs today, and set one number to check it by." |
| O2 L5 | (new) | Lesson 5 · Architecture diagram · "Next lesson marks on your map where AI enters." |
| O2 L6 | (new) | Lesson 6 · Build vs Buy · "You choose how to build it, on an implementation canvas." |
| O2 station status (screen readers, pilot copy) | (new) | complete / today / not started |
| O3 eyebrow / h1 | (new) | Lesson goals / What you will be able to do |
| O3 deliverable | (new) | Your deliverable: By the end you hand in an AS-IS map of your own case in eight fields, with one success metric. It is your entry ticket to Lesson 5. |
| O3 tiles (label: tooltip) | (new) | Roles and handoffs: Identify roles and handoff points: who is involved and where responsibility passes. / Sources, owners, sensitivity: Map knowledge sources, ownership, and sensitivity. / Controls and gaps: Mark existing controls and gaps, including 'unclear' as a legitimate answer. / A measurable metric: Define a measurable success metric with a baseline and a clear target. / Where AI fits: Spot decision points: tell when AI fits and when human judgment is required. |
| FT1 | instruction "Answer one question, or skip the challenge."; memo "Optional challenge. Right on the first try? Skip to this chapter's last task." and "HBR, 1990: new technology runs on a broken process. What happens?"; hint "Answer if you already know this topic. Skipping costs nothing."; three option feedback lines; route buttons | removed (replaced by W1) |
| W1 h1 | (new) | New technology runs on a broken process. What happens? |
| W1 panel | (new) | Warm-up · Not scored · A first guess, before the video. Guessing first helps you remember. · Chapter 1 · Why map |
| W1 options | (FT1's) | unchanged: It removes the steps nobody needs / It speeds up the inefficiency already there / It shows the broken steps by itself |
| W1 tag on the picked row | (new) | Your guess |
| W1 band after a pick | (new) | Hold that thought. The video shows what really happened. |
| W1 hint before a pick | (new, pilot copy) | Pick the answer you expect. A guess cannot be wrong. |
| W1 locked reason | (new, pilot copy) | Next, locked until you make a guess |
| V1 line above the player | Guiding question: What separates a technology change that works from one that has to be fixed later? | Watch for: what separates a change that works from one you fix later? |
| K1 label | (new) | Key idea · Hammer's principle |
| K1 h1 / text | (new) | Don't accelerate. Deconstruct. / New technology on a broken process speeds up the inefficiency. Take the process apart first: that is what mapping does. |
| K1 figures | (new) | faster tech / Same mess, faster. / Fewer steps first. Then speed up. |
| K1 figure labels (screen readers) | (new) | Six step boxes at odd angles with dashed links crossing back and forth, a faster tech tag on top: the same mess, only faster. / One dashed step box crossed out, above four teal step boxes in a straight line: fewer steps first, then speed up. |
| K1 evidence / source | (new) | McKinsey, 2025: redesigning workflows is the top factor in AI value. / Hammer, Harvard Business Review, 1990 |
| S03 correct band | "Both cases changed only after someone saw how the work really flowed. Today you map it in eight fields. Both stories were judged by numbers. Today you set a baseline and a target: a number, not a feeling." (two option lines, 37 words) | Both cases changed only after someone saw how the work really flowed, and both were judged by numbers. Today you fix both: a map and a metric. (25 words) |
| Ghost hand replay (S03, video stops) | (new, pilot copy) | Show me (with a hand icon) |

## Checks

All passed on 19 Oct 2026, after the last code change.
- `npm run check`: passed. Warnings: the word allowances (O2, O3, K1, S02). The V2 temp-video warning is gone.
- `npm run test:fit`: passed, 1182 ok.
  - New states at 1280x720, 1024x576, 1366x650, 1536x730, 1920x950 and 2560x1080: O1 title, O2 with L4 and with L1 open, O3 with and without a tile tip, W1 before and after the guess, K1.
  - New checks: no one-sided side strip, logo aligned, nothing clipped, band, contrast, 14 px text, 44 px targets.
  - The shell check runs on S01, because O1 has no footer by design.
  - A first run stopped once on a 60 s wait for the V1 stop at 2560x1080 (the "wrong" state of the same stop had just passed). It ran while walk, test:scorm and the screenshot script were loading the same machine; the rerun on its own passed.
- `npm run walk`: passed, 463 ok.
  - New paths: O1 Start; O2 tabs by keyboard (arrows move, Enter or Space opens, End); O3 tile tip on focus; W1 neutral guess, changed guess as a retry, revisit keeps it; V1 watched in full; K1; S03 with its closing line.
  - O2 has no ghost hand and no "Show me".
  - The ghost hand on V1 stop 1 and S03: shown once, aria-hidden, any key removes it, nothing selected or checked or tracked; "Show me" (hand icon and text) replays it.
  - With motion: mid-demo the hand sits on the first S03 card (0 px off its centre), a pointer press stops it; a seen type waits for 8 s without input.
  - Measured separately at 1280x720, 1366x650 and 1920x950: the ripple centre matches the target's centre exactly, so the hand lands on target at any scale.
  - Rail 3% at S01 and 11% at S03; the menu's Lesson goals dialog from O3.
- `npm run test:scorm`: passed, 379 ok. 44 interactions, each once; status passed, score 80. suspend_data is 1628 chars after the whole lesson and 2188 with every free-text field at 250 (limit 4096). Resume lands on the saved screen.

## Deviations and open points

1. **45-word rule on O2, O3 and K1, board copy kept.**
   - The counts: O2 has 54 to 64 on-screen words depending on the open lesson (five station labels plus the panel), O3 has 47, K1 has 51.
   - I kept the approved board copy and gave these screens a `wordLimit` allowance with its reason, as in R4. `check.mjs` warns and fails only above the allowance.
   - Possible cuts:
     - O2: the panel shows only the lesson's line (its title already sits on the open tab), minus 4 to 7 words. "Language model, working template" becomes "Working template", minus 2.
     - O3: drop the "Your deliverable" label, which brings it to 45.
     - K1: drop "· Hammer's principle" (the source names Hammer) and shorten the evidence to "McKinsey, 2025: workflow redesign drives AI value most.", which brings it to about 45.
   - S02 keeps its R4 allowance (61).
2. **"Start the lesson" is red**, as on board R4-O1. O1 has no footer, so this button is the screen's Next. The check's "red on Next only" rule now also allows `.w-start`.
3. **Ghost hand targets are chosen by position**, not by answer:
   - V1 stop 1 taps the first option, which is a wrong one.
   - S03 taps cards 1 and 2. Card 2, "Unmapped process", is one of the two keys.
   - Planning may want neutral targets (for example the area between options). That is a one-line change per screen.
4. **The ghost hand also runs on V2** (same stop type). It plays there only after 8 s without input, per the "later screens" rule. Later practice types (S12, S21 item 5) are not wired yet (V3-2).
5. **Resume prompt.** Presentation screens complete on arrival, so the "Welcome back" prompt now appears only when the saved place is not the first screen. Before, it also appeared when anything was done.
6. **O2's L1 and L2-3 are always shown done.** It is a static map of the module, not the learner's record from other lessons.
7. **Board details not taken:**
   - the chevron after "Next" in the footer;
   - the 12 px "done" under the rail percent, which stays 14 px (rule: no text under 14 px).
8. **Unused copy left in content:**
   - S03 options b and d keep their own feedback lines, no longer shown on a right answer (the closing line replaces them).
   - `ui.buttons.watchVideo` (FT1 routing only) is unused.
9. **V2 has a poster now; V1 does not.** Only V2 was asked; `v1-poster.jpg` exists if wanted.
10. **SCORM.** The lesson has 44 interactions (45 before: minus `L4_S01B_1` and `L4_FT1_1`, plus `L4_W1_1`). With no fast track in Chapter 1, the walked route now records all 44, V1's two stops included.
