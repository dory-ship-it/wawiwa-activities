Weekly usage before: 23% (all models)

# EAI L4 CO1: in-lesson AI coach, offline mode

Run co1, 26 Oct 2026. First build committed by Noy as c3cb97f; Noy's follow-ups (left dock, a clean chat, a demo on O3) are run commits. Not pushed.

## What was built
- Launcher in the top bar after the chapter name on all 43 screens (O1 and END too): 56 px white disc, 3 px turquoise ring, the robot face 46 px (glyph `coach` in src/icons.js). Button, aria-label "Open the coach", aria-expanded, white focus ring on the dark bar.
- Panel (src/coach/coach.js, src/frame.css): 340 wide, 536 high, y 96 to 632, down to the foot of the page (Noy, follow-up; messages at the top, the chip at the bottom); opens on the left by the launcher (Noy: more intuitive), the learner can drag it right or use Arrow Left/Right on the grip (kept as state.g.cd = 'r'). Non-modal dialog "Wawiwa AI Coach", aria-live log, Escape closes and returns focus to the launcher, no slide or fade with reduced motion. Over main and the footer, under the menu and dialogs.
- A clean chat (Noy, follow-up): the header is the title only; the panel shows the opening line for the screen type and one chip, "What do I do here?". The chip is the learner's message; the coach answers with the screen's tip, and the chip goes. No offline notice, no disabled input, no privacy line offline (those come back with the live coach).
- Demo on O3 (Noy, follow-up), once: the launcher pulses twice, the panel opens by itself with "Hi, I'm your AI coach. Stuck on a screen? Open me here.", closes after about 2.6 s, then "Stuck? Ask me." + "Got it" stays under the launcher. Any key or click ends it at once. Reduced motion: the hint only. Recorded as letter 'a' in state.h.
- S21 locked (60%, grey ring, lock badge, only the notice); unlocked again on S21R.
- Thinking and cap (the live coach, with its input row and privacy line) are built and shown only on the review page.
- Transport: src/coach/transport.js, one function ask(), returns { offline: true }. No network code, no proxy URL, CSP unchanged. No SCORM call, no interaction, nothing typed is kept.
- Content: ui.coach (all strings, incl. tipChip, demo, demoOn "O3") and a coach { kind, tip } block on every screen; content/coach/grounding-pack.md saved unchanged (not read at runtime).
- review.html: a "Coach (CO1, offline)" row: O3 demo; S04 closed + hint, open, after the chip, thinking, cap; S21 locked. Review mode writes nothing.

## Deviations from the brief (please confirm)
1. Demo letter is 'a', not 'c': 'c' in state.h is already the choice ghost's letter, so 'c' would have hidden the S01 ghost demo.
2. Grip: the existing six-dot grip glyph instead of the ⠿ character (the lesson fonts have no braille glyph).
3. The dock and the demo letter go out with the lesson's next regular save (the next screen), never as their own SCORM write. If the learner moves the panel and closes the window on that screen, the dock is not kept.
4. Clean chat (Noy): the header's "Chapter N · verb" line, the offline notice and the disabled input row are gone offline; the hint moved from O2 to the O3 demo.
5. The chip is 14 px Roboto in a 44 px pill (spec 13 px / 32 px: under the text floor and the target size). The live privacy line keeps 12 px (exempted in tools/lib.mjs).
6. margin-left 18 is taken literally, so with the bar's flex gap the launcher sits 31 px after the chapter block (x 362 at 1280).

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
- S21: no tip.

## Tests (full end run after the follow-ups, all passed; after the full-height panel: check, test:fit section 4, walk, test:coach, test:review again, stamp 96dc38c7)
- check: passed (check 16: no network code or proxy URL, every screen's kind and tip, S21 locked, pack present).
- test:fit --sizes=1280x720,1600x900: 1084 ok, 0 fail. Launcher on all 43 screens at both sizes; Chapter 3 (9 steps) fits at 1280. Open panel at both docks on every screen: y 96 to at most 632, opaque, on top, clear of the bar and Previous / Next.
- walk: 618 ok, 0 fail. Coach on K1, W1, S04, S02, S22 by keyboard: open (line + chip), the chip by Enter (question + tip), Escape; grip arrows; resume keeps the dock.
- test:coach: 28 ok, 0 fail. No LMSSetValue/LMSCommit and no request while used; S21 locked, S21R unlocked; suspend_data 2630 of 4096 on a heavy state with cd; left on all 43 screens with no side picked; the O3 demo (opens, closes, hint stays, once, a key ends it, none with reduced motion); review mode writes nothing.
- test:scorm: 506 ok, 0 fail. test:review: 21 ok, 0 fail (the coach row's 7 states).
- A real bug found and fixed on the way: a key during the demo left the panel open.

## Screens (review/co1/screens, main state)
01 S04 closed + hint, 02 S04 open left (+1600x900), 03 S04 open right (+1600x900), 04 S02 open, 05 S19 open, 06 S21 locked, 07 END open, 08 O3 demo, 09 S04 after the chip, 10 O3 hint after the demo.

## Open for Noy
- Approve the 13 drafted tips, the demo line and deviations 1 to 6.
- Live run: swap ask() for the Practice Studio engine after Dor approves; the input row and privacy line come back there.

Weekly usage after: 25% (all models)
