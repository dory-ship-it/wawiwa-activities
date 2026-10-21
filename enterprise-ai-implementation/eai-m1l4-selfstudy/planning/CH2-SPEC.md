# Chapter 2 "Toolkit" spec (storyboard v3) — texts, interactions, tracking

Visuals: the Ch2 frames in `planning/design-reference/hybrid-cinematic/screens-intro-ch2.html` + `planning/STORYBOARD-V3.md` (new templates + critical details). This file is the source for text, interaction and tracking. Where a frame and this file differ on text, this file wins; list the difference in the report.

NEW ORDER OF CHAPTER 2: W2, K2, S04, S05a, S05b, S06, S07, S08, S08B. Remove FT2 and its routing.

1. W2 · warm-up
   "Chapter 2 · Toolkit". Question "An employee emails HR a question. In process terms, what is that email?" Options: a "The trigger", b "The first step", c "The output". Neutral feedback: "Hold that thought. This chapter names the three parts of every process." Tracking L4_W2_1, choice, scored false, neutral.

2. K2 · key idea
   "Key idea · Process mapping"; title "Every process has three parts". Line: "Process mapping shows how work really flows: who does each step, what goes in, what comes out."
   Three figure cards Trigger -> Steps -> Output:
   Trigger "What starts it: a message, a form, a date."
   Steps "The path to the result. Three to seven is usually enough."
   Output "What comes out, and to whom."
   Toggle "See it in the HR case" adds under each card: "A question arrives" / "Check, answer or escalate" / "The employee gets an answer". Not tracked. Next never locked.

3. SORT = DRAG AND DROP, one card at a time from a deck (S04 now; S09, S16, S17, S18A get the same template in NL3)
   Right drop stays in its column with a check; wrong drop returns to the deck + that card's feedback. Keyboard: Tab to the card, 1..n chooses a column, Enter drops, Esc cancels; announce each step. "Show me" replays the ghost hand (first use: hand grabs the card and drags DOWN, stopping above the columns).
   S04: instruction "Drag each HR card to its part of the process." Columns: Trigger "What starts it" / Steps "The path to the result" / Output "What comes out, and to whom". Correct-feedback lines (replace "Placed."):
   1 "Right: an email is one way the work starts."
   2 "Right: checking the topic is a step on the path to the answer."
   3 "Right: a question in person is another trigger. Requests arrive three ways."
   4 "Right: answering or escalating is still a step. The employee is waiting."
   5 "Right: this is what comes out, and to whom."
   Wrong-feedback lines and tracking: as in the JSON today.

4. S05 SPLITS INTO TWO SCREENS (replaces the old S05 explorer)
   S05a · key idea: "Key idea · BPMN"; title "How to read a BPMN diagram"; line "BPMN is a standard way to draw a process. You only need to recognize three parts." HR diagram with gateway "Within policy?" (update the JSON from "Exceeds known policy?"), branches "Yes" (to Answer) / "No" (to Escalate), HR manager lane tinted. Numbered markers + key:
   1 "Swimlane: one row per role: who does what."
   2 "Gateway: a decision. The path splits."
   3 "Event: where the process starts or ends."
   Markers appear one by one (none with reduced motion). Not tracked. Next never locked.
   S05b · practice: "Drag each label to its part of the diagram." Labels Swimlane, Gateway, Event; three "Drop here" targets.
   Right: Swimlane "Right: each row is one role. Escalations sit in the HR manager's lane." / Gateway "Right: the diamond is a decision. Within policy, staff answer; beyond it, the manager does." / Event "Right: the circle marks where the process starts."
   Wrong: Swimlane "A swimlane is a whole row, one per role." / Gateway "Look for the shape where the path splits in two." / Event "Look for the circle where the process starts."
   Tracking L4_S05_1 replaces the old S05 interaction: matching, response like "swimlane.a,gateway.b,event.c", first attempt per label counted as in the sort template.

5. S06 · one situation at a time: instruction "Pick the right format for this situation."; "Situation 1 of 2" / "2 of 2"; the answers sit inside the card under "Your answer": "Field template" / "Eight fields, filled in a table"; "BPMN diagram" / "Lanes and symbols, drawn to a standard". After a right answer situation 1 shrinks into a small done card on the left and situation 2 comes in (no motion with reduced motion). Hints: 1 "Ask how fast you need it and who will use it."; 2 "Ask who else needs to read this map." Feedback and tracking unchanged.

6. S07 · eight fields: instruction "Open all eight fields." Tiles: number + task icon + title (name = pencil, trigger = flag, steps = map, handoffs = sort, sources = book, controls = magnifier, gaps = question mark, metric = target); tile 7 title "Gaps". Back: the current short definition. After all eight are open the heading becomes the question "Which field lets you check, three months from now, whether the change worked?" Keys, feedback and tracking unchanged.

7. S08 · AS-IS rules: explain band on top of the panel: "Three rules while you map:" 1 "Don't fix", 2 "Don't add AI", 3 "Don't map the official process". Rounds unchanged.

8. S08B · your case, first sketch (input, three fields on a line with arrows): top line "A rough first try. You build the full map in Chapter 5." Heading "Sketch your own case in three parts." Fields: Trigger (max 120, placeholder "What starts it? e.g. A request form arrives"), Steps (max 250, "The main steps, and who does them"), Output (max 120, "What comes out, and to whom"). Privacy line "Leave out names and identifying details." Save -> "Saved. Your sketch comes back in Chapter 5." Store L4_CASE_TRIGGER / L4_CASE_STEPS / L4_CASE_OUTPUT; tracking fill-in, neutral; shown read-only on S19 under "Your sketch from Chapter 2" and in the lesson record download. suspend_data must stay under 4096 with every free-text field full.

MINUTES: W2 1, K2 2, S04 4, S05a 2, S05b 3, S06 3, S07 5, S08 4, S08B 4.
STEPS (top bar): W2 Guess, K2 Learn, S04 Sort, S05a Learn, S05b Label, S06 Decide, S07 Explore, S08 Decide, S08B Sketch.
