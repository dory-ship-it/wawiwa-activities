# Storyboard v3 + design addenda (EAI M1 L4) — approved by Noy, 21 Oct 2026

Source: handoff from the screens chat (Step A + Part B), with the foreman's decisions. Copy kept in the Cowork Project (`claude/L4-storyboard-v3.md`) and in the repo (`planning/STORYBOARD-V3.md`).
Intro, Ch1, Ch2: texts and screens = the approved canvas `planning/design-reference/hybrid-cinematic/screens-intro-ch2.html` + the Chapter 2 spec in PROCESS.md. Chapters 3-4: below. Chapters 5-6: not yet.

## Decisions (Noy, screens chat)
- Keep the JSON text word for word, even where it is over 45 words.
- Locked Next = grey #8A98A2 + white lock icon (footer size).
- S01 context line in the third person: "Dana gets about 90 requests a month, most of them repeat questions."
- Every panel = content height, centred vertically.

## Foreman decisions on the open points (21 Oct)
1. S17: "read, then sort" (five columns with one-line definitions). No separate K5 screen.
2. S09 sensitivity definitions: pilot copy; added to the SME list (check before the pilot).
3. S05a/S05b gateway: "Within policy?" with Yes/No (Ch2 spec). The build updates the JSON from "Exceeds known policy?".

## New templates designed (Intro-Ch2 canvas; all from reference parts)
- Warm-up W1/W2 (Stage): question on the dark-glass card (bulb, "Warm-up", turquoise "Not scored" chip); the panel holds only "Make your best guess." + the answers; navy selection; neutral strip.
- Video player V1 (Stage): the video fills the stage under the top bar.
  - Ready: glass card (play icon, "Video", length chip, title, "Watch for:" line, instruction); Play = the current-step disc at about 2.8x.
  - Player bar: quote glass; play/pause; time (Roboto 500 white); track = step-bar line weight in #8A98A2 with turquoise fill; stop markers = small discs with a turquoise ring; CC = turquoise chip; volume.
  - Captions: one bold line on glass, keyword in turquoise.
  - In-video stop = the W1 pattern: question on the glass card ("Stop 1 of 2" + time chip), answers in the panel, player bar hidden. Resume = locked button (grey + lock) until correct, then outline button with play icon. Next stays locked until the video ends.
- Key idea K2 (Focus): K1 layout with three numbered figure cards on a line (arrows between). Toggle "See it in the HR case" = outline button top right (pressed: thicker navy border + soft ring); each card then adds a divider + "HR case" line in teal ink.
- BPMN diagram S05a (Focus): white figure card with three lanes (label column 8cqw; HR manager lane tinted #E1EFEE), nodes and edges in teal ink #2F6A72 (start = thin circle, end = thick circle, gateway = diamond, steps = white boxes). Numbered navy markers + key on the right.
- Label onto diagram S05b (Focus): the same diagram with dashed "Drop here" targets (#B9B2A5) outlining each part. Labels = smaller sort-deck cards in a tray on the right. Placed: target turns solid teal + label chip with a check.
- Pick two S03 (Focus): answer cards in a 2x2 grid with rounded-square markers; Check locked until two are picked; "One of two." = neutral strip.
- One situation at a time S06 (Focus): raised figure card "Situation n of 2" with the answers inside under "Your answer" (two-line answer card); the solved situation shrinks into a small done card on the left.
- Eight tiles S07 (Focus): 4x2 grid, number disc + task icon + title. Open tile shows its back (definition) with the selected border; opened tiles get a done check; after all eight the heading becomes the question and every tile gets an answer marker.
- Rounds with explain band S08 (Focus): band on top of the panel ("Three rules while you map:" + three numbered items). Left: round counter, instruction, map line in a figure card with its field chip. Right: answers.
- Three-part input S08B (Focus): the S02 input pattern, three fields on a line with arrows (Trigger -> Steps -> Output).
- Off-panel feedback strip (S04, S05b, S07): the strip component, all corners rounded, head inline with the text, soft card shadow.

## New critical details (extend VISUAL-DIRECTION.md)
1. Panel height = its content, vertically centred between the top bar and the footer zone (top 29.1cqw, translateY(-50%), max-height 41cqw); feedback strip 1.4cqw below the content; overflow visible so tooltips can hang below. Every panel (S01, S02, W, V stops, S03, S06, S08, S08B, and Ch3-4 panels).
2. Locked Next = grey #8A98A2 + white lock icon, footer size. Presentation screens (O2, O3, K1, K2, S05a, K4) never lock Next.
3. The ghost hand rests in a gutter or below the panel, never on an answer card. Re-check its position whenever a panel moves.
4. Sort deck: the offset cards behind the deck cover the card only; the counter ("1 of 5") stays visible.
5. Sort layout: deck at 15.6cqw, strip between the deck and the columns (25.8cqw), columns fixed from the top (32.2cqw) so they can grow by two placed cards without reaching the footer. Placed card = white, 0.2cqw teal border, teal check disc, 600 1.25cqw text.
6. Multi-select = the same answer card with a rounded-square marker (radius .5cqw); single choice keeps the circle.
7. Terms with a tooltip get a dotted underline (#55626C, offset .35cqw).
8. Two player-only glyphs (pause, volume) in the task-icon style. No other new icons.
9. S07 field icons from the task set: name = pencil, trigger = flag, steps = map, handoffs = sort, sources = book, controls = magnifier, gaps = question mark, metric = target.
10. Diagram text at least 1.15cqw (~14.7px); labels beside nodes, never on an edge.

## CHAPTER 3 · HR demo (~20 min) · steps: Guess · Watch · Sort · Decide · Decide · Label · Write
| Screen | Template | Full text |
|---|---|---|
| W3 (1') | Warm-up · Stage | Card: Warm-up · Not scored. "An employee asks HR about their own salary. May that question go into a public AI tool?" Panel: "Make your best guess." a) Yes, if the name is removed b) Only with the employee's consent c) No, it holds confidential details. Neutral: "Hold that thought. This chapter tags every source by how sensitive it is." Tracking L4_W3_1, neutral (replaces FT3 and its routing). |
| V2 (5') | Video · Stage | Title "Mapping the HR case". "Watch for: How do you turn about 90 messy requests a month into a map you can check later?" "Watch the video. Answer the three questions when it stops." 3 stops, unchanged from the JSON (Field 2 trigger; handoff; Field 6 controls). |
| S09 (4') | Sort (deck) + explain band · Focus | Band: "Four sensitivity levels, from open to closed:" PUBLIC: anyone may see it · INTERNAL: staff only; approved company tools · CONFIDENTIAL: named people only, never a public AI tool · RESTRICTED: strictest access, no AI tool without approval (pilot copy, SME to confirm). Header "Field 5: sources, owners, sensitivity". Instruction "Drag each card to its part of Field 5." Columns Source / Owner / Sensitivity / Not Field 5. 6 cards and feedback as in the JSON. |
| S10 (2') | Decision · Focus | Situation "HR keeps no record of answers given or corrected." Rows: Field 6, Existing controls: no formal control (prefilled) / Field 7, Gaps: (active). Instruction "Choose what to write in Field 7." Hint "Write what is true on a normal day, even if it looks bad." 4 options and feedback as in the JSON. |
| S11 (3') | Decision + explain band · Focus | Band: "A checkable metric has three parts:" Baseline: today's number, even estimated -> Target: a specific, realistic number -> Date: when you check it. "Pick the strongest success metric." Hint "Ask: three months from now, could someone check it?" 4 options + "Checkable later?" slots (Baseline / Target / Date) as in the JSON. |
| S12 (3') | Full map + drag flags · Focus | Top "Your HR map is complete: all eight fields from this chapter." The full map with the 8 fields filled (texts from the JSON tiles). Instruction "Drag the two risk flags onto the fields that show the handoff risk." Hint "Follow the question after it leaves the first staffer." Correct (4, 7): "Field 4 shows the question moving from HR staff to the HR manager. Field 7 adds the risk: no single channel for that handoff." Wrong: per-field feedback from the JSON. Tracking L4_S12_1 unchanged ("4,7"). End of chapter. Over 45 words (document view). |
| S12B (2') NEW | Input · Focus | Top "Back to your own case." Heading "Set one success metric for your case." Hint "A rough number is fine. You refine it in Chapter 5." Fields: Baseline (max 80) "Today, e.g. about 2 days to a summary" · Target (80) "e.g. same day" · Date (40) "e.g. within 3 months". Privacy "Leave out names and identifying details." Save -> "Saved. It comes back in Chapter 5, ready to refine." Empty -> "Add a number to Baseline and Target." Store L4_CASE_BASELINE / _TARGET / _DATE; tracking L4_S12B_1-3 (fill-in, neutral); prefills S19's metric field (editable). |

## CHAPTER 4 · Critical eye (~25 min) · steps: Guess · Start · Decide · Decide · Learn · Sort · Sort · Write
| Screen | Template | Full text |
|---|---|---|
| W4 (1') | Warm-up · Stage | Card: "Which decision needs clear human judgment, not AI?" a) Deciding whether a customer is eligible b) Summarizing a long request in three lines c) Tagging a request by its topic. Neutral: "Hold that thought. This chapter shows where AI fits, and where a person must decide." Tracking L4_W4_1, neutral (replaces FT4 and its routing). |
| S13 (3') | Drag Start/End flags onto a process line · Focus | Instruction "Drag the Start flag and the End flag onto the HR process line." Hint "Look for what starts it from outside, and who picks up the result." Line: 1 Employee sends a question · 2 HR staff open the inbox · 3 HR staff check the topic · 4 Question reaches the HR manager · 5 Employee gets an answer. Correct (Start 1, End 5): "The map opens at the external trigger and closes when the employee gets an answer, even after an escalation." Start on 2: "WhatsApp and in-person questions never reach the inbox. The process starts earlier, outside HR." End on 3: "Nobody receives anything when the topic is checked. Follow the question to its result." End on 4: "Escalation passes the work on. The employee is still waiting, so the process has not delivered its output yet." Other: "Start where work enters from outside; end where someone picks up the result." SCORM: L4_S13_1 becomes matching, "start.1,end.5". |
| S14 (3') | Decision + visual + band · Stage | Band "Handoff: the moment responsibility passes from one role to another." Visual: HR staff lane -> arrow -> HR manager lane greyed out, "Away". Top "A question exceeds policy. It goes to the HR manager, who is away." Instruction "Choose what the map must record at this handoff." Hint "Think about the moment responsibility changes hands." Options a-d as in the JSON. Feedback: a "A rule nobody follows today hides the real gap. Record four things: from whom, to whom, what passes, and what if the receiver is away." · b (correct) "Field 4 now shows sender, receiver, what passes, and the unavailable case. Here nothing covers it, so Field 7 records it." · c "Never assume the receiver knows the history. Record from whom, to whom, what passes, and what if the receiver is away." · d "That tool does not exist today. Record what does: from whom, to whom, what passes, and what if the receiver is away." |
| S15 (3') | Decision + band · Stage | Eyebrow "New case: course feedback, from your Lesson 1 booklet". Band "Bottleneck: a step limited by the slowest resource." Line "One step: the coordinator prints and reads all feedback by hand, 3 to 4 hours per course." (highlight "3 to 4 hours"). Instruction "Choose the first question to ask about this bottleneck." Hint "Before speed, ask why." 3 options and feedback as in the JSON. |
| K4 (2') NEW | Key idea · Focus | Pill "Key idea · Where AI fits". Title "Three good fits, and the rest". Line "AI fits three kinds of step. Everything else stays with a person, or gets fixed first." Column "Good fit": Unstructured to structured: free text in, structured data out · Low-risk decision points: small, reversible calls a person can watch · Handoffs with delay or loss: AI documents what passes. Column "Poor fit": Rights or money at stake · A disorganized process · Steps the map marks "unclear". Not tracked; Next never locked. |
| S16 (5') | Sort (deck) · Focus | Instruction "Drag each card to a good-fit kind, or to Poor fit." Hint "What goes in, and what is at stake?" Columns Unstructured to structured / Low-risk decision / Handoff delay or loss / Poor fit. 6 cards and feedback as in the JSON (term tooltip removed; K4 teaches it). |
| S17 (5') | Sort (deck), read then sort · Focus | Instruction "Read the five mistakes, then drag each case to the one it shows." Columns with definitions: Ideal, not actual: maps how it should work, not a normal day · No clear goal: drawn with no question to answer · Rushed mapping: hard fields skipped to finish fast · Not updated: the process changed, the map did not · Automating a broken process: speeds up a process nobody fixed. 5 cases and feedback as in the JSON. End of chapter. |
| S17B (3') NEW | Input · Focus | Top "Back to your own case. Your steps from Chapter 2:" + L4_CASE_STEPS (read-only). Heading "Name one step that could fit AI, and one that stays with a person." Fields: Could fit AI (100) "e.g. Sort requests by topic" · Stays with a person (100) "e.g. Approve an exception". Note "This note stays off your AS-IS map. Lesson 5 starts from it." Save -> "Saved. It comes back in Chapter 5 and Lesson 5." Store L4_CASE_AIFIT / _HUMAN; tracking L4_S17B_1-2; shown read-only on S19 under "Your notes from Chapters 3 and 4". |

Build notes: SCORM list changes: FT3 and FT4 out; W3, W4, S12B x3, S17B x2 in; S13 becomes matching. suspend_data must stay under 4096 (new stored text adds about 400 characters).

## Templates in Ch3-4 not yet drawn (built by analogy, then reviewed on review.html)
S09/S11/S14/S15 explain band in a panel (from S08), S12 full map with drag flags, S13 flags on a process line, S14 handoff visual on Stage, K4 two-column key idea (from K1/K2), S17 sort with column definitions.
