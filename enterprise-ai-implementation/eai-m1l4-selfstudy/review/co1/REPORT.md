Weekly usage before: 23% (all models)

# EAI L4 CO1: in-lesson AI coach, offline mode

Run co1, 26 Oct 2026. Code committed by Noy as c3cb97f (not pushed). This report is the only new file.

## What was built
- Launcher in the top bar after the chapter name on all 43 screens (O1 and END too): 56 px white disc, 3 px turquoise ring, the robot face 46 px (glyph `coach` in src/icons.js). Button, aria-label "Open the coach", aria-expanded, white focus ring on the dark bar.
- Panel (src/coach/coach.js, src/frame.css): 340 wide, to content, max 536; dock left (24, 96) or right; non-modal dialog "Wawiwa AI Coach"; messages in an aria-live log; Escape closes and returns focus to the launcher; no slide or fade with reduced motion. z-index 10: over main and the footer, under the menu (30) and dialogs (60).
- Header, bubbles, notice, chips, input pill, send disc, privacy line and disabled look as specified; colours as new `--wl-coach-*` tokens.
- Drag by the grip snaps to the nearer dock; Arrow Left/Right on the grip switch it; the dock is kept as state.g.cd = 'r'.
- Offline state on every screen: opening line by kind, then "Live coach is offline. Here is a tip:" and the tip; input disabled ("Tips only for now"), chips hidden.
- S21 locked (60%, grey ring, lock badge, only the notice); unlocked again on S21R.
- Thinking and cap states are built and shown only on the review page.
- First-use hint "Stuck? Ask me." + "Got it" under the launcher, once, on O2 (the first screen after O1).
- Transport: src/coach/transport.js, one function ask(), returns { offline: true }. No network code, no proxy URL, CSP unchanged. No SCORM call, no interaction, nothing typed is kept.
- Content: ui.coach (all strings) and a coach { kind, tip } block on every screen; content/coach/grounding-pack.md saved unchanged (not read at runtime).
- review.html: a "Coach (CO1, offline)" row: S04 closed + hint, open, thinking, cap; S21 locked. Review mode writes nothing.

## Deviations (please confirm)
1. Hint letter is 'a', not 'c': 'c' in state.h is already the choice ghost's letter (ghost.js takes the first letter of 'choice'), so 'c' would have hidden the S01 ghost demo.
2. Grip: the existing six-dot grip glyph in #8A979F instead of the ⠿ character (the subset fonts have no braille glyph, so it would fall back to a system font).
3. The dock and the hint letter go out with the lesson's next regular save (the next screen), never as their own SCORM write; this keeps "no SCORM call while the coach is used". If the learner switches dock and closes the window on that screen, the dock is not kept.
4. The two 12 px lines (header "Chapter N · verb", privacy line) are below the 14 px floor; exempted in tools/lib.mjs as the approved design.
5. margin-left 18 is taken literally, so with the bar's flex gap the launcher sits 31 px after the chapter block (x 362 at 1280).
6. Grip, close and send are 44 px targets; the send keeps its 34 px visible disc inside.

## Drafted tips for Noy's approval (13; the other 29 tips copy the screen's hint word for word)
- O1: Today you map one process as it runs now, before any AI. Take it apart first.
- O2: Open any lesson to see how it connects. Today's map is what Lesson 5 builds on.
- O3: Your goal: an AS-IS map of your own case in eight fields, with one success metric.
- V1: Watch for what separates a change that works from one you fix later.
- K1: New technology on a broken process only speeds up the mess. Map the process, cut steps, then speed up.
- K2: Every process has a trigger, steps and an output. Turn on the HR case to see each one.
- S05a: You only need three BPMN parts: swimlane for a role, gateway for a decision, event for a start or end.
- S08B: Start with what triggers it, then the main steps and who does them. A rough first try is enough.
- V2: Watch how about 90 messy requests a month become a map you can check later.
- K4: For each step, ask what goes in and what is at stake. Money or rights at stake: a person decides.
- S17B: Look at your own steps. Free text into structured data often fits AI; money or rights stay with a person.
- S21R: Missed an item? Its Review link opens the chapter that teaches it.
- END: Bring your map PDF to Lesson 5. There you mark where AI enters your process.
- S21: no tip. Watch K4 and S17B: they state the good-fit idea that S16 practises, at principle level, never per card.

## Tests (full end run, 26 Oct 2026, all passed)
- check: passed (new check 16: no network code or proxy URL, every screen's kind and tip, S21 locked, pack present; coach contrast pairs 5.2:1 to 15.7:1).
- test:fit --sizes=1280x720,1600x900: 1084 ok, 0 fail. Launcher on all 43 screens at both sizes; Chapter 3 (9 steps) fits at 1280. Open panel at both docks on every screen: y 96 to at most 632, opaque, on top, clear of the bar and Previous / Next.
- walk: 608 ok, 0 fail. Coach on K1, W1, S04, S02, S22 by keyboard; Escape; grip Arrow Right/Left; resume keeps the right dock.
- test:coach (new): 21 ok, 0 fail. No LMSSetValue/LMSCommit and no request while used; S21 locked, S21R unlocked; suspend_data 2630 of 4096 on a heavy state with cd (+15 chars); review mode writes nothing.
- test:scorm: 506 ok, 0 fail. test:review: 21 ok, 0 fail (the coach row's 5 states).

## Screens (review/co1/screens, main state)
01 S04 closed + hint, 02 S04 open left (+1600x900), 03 S04 open right (+1600x900), 04 S02 open, 05 S19 open, 06 S21 locked, 07 END open, 08 O2 first-use hint.

## Open for Noy
- Approve the 13 drafted tips and deviations 1 to 5.
- At the left dock the panel covers the start of S04's heading and its card (opaque, as specified). Should the default dock be right on drag-and-drop screens?
- Live run: swap ask() for the Practice Studio engine after Dor approves; turn on input and chips there.

Weekly usage after: 24% (all models)
