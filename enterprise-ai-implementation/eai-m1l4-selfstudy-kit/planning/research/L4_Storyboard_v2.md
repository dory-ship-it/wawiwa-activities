# L4 Storyboard v2: EAI Module 1, Lesson 4 "Process Modeling and Workflow Mapping" (self-study)

## 1. Header

**PILOT.** This lesson is the pilot of the new self-study format, run through the Enterprise AI Implementation Specialist program. Everything here (screens, templates, videos, SCORM tracking, the planning process) is a pilot to evaluate before the format is applied to other lessons and programs.

**Lesson:** EAI Module 1, Lesson 4 "Process Modeling and Workflow Mapping", self-study · **Version:** v2 · **Date:** 2026-10-15 · Replaces 02 to 05 v1 plus review fixes (07 Part D, 08, 09 video rows, 10). Workbook spec 06 dropped.

**Decisions applied**
1. S19 hands off to existing `eai-m1l4-class` ("AS-IS Process Mapping for Your Own Use Case", eight fields, live coach on, approved for EAI); S22 links `eai-m1l4-home`. S18: remove names and identifying details before writing anything (s44).
2. Sensitivity: only PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED (s14). Personal, employee, financial (s44) only as examples of CONFIDENTIAL data kept out of public AI tools.
3. HR metric: share of HR time on repeat questions, ~35% to 20% within 3 months (s20). Accuracy ≥95% in a QA sample = guardrail tooltip, SME flag.
4. Knowledge check pass mark 80% (4 of 5); first attempt counts.
5. Dana, HR director, declared fictional; booklet numbers; never "no owner".
6. V1 "Two cases, same lesson"; no "35 years".
7. Desktop only, fixed 1280x720, no scroll.
8. Fast track: Ch1 to Ch4 open with an optional one-question challenge; correct on first try jumps to the chapter's last practice screen; reported to SCORM.

**Conventions**
- **Word count:** every visible word in the fullest state, except the instruction line and action buttons (Check, Save, Continue, Open, Download, Finish, Skip). Max 45 on screen; 25 per feedback or hint.
- **Options:** letters follow the on-screen order; KEY marks the correct one, all others are wrong. Sort cards are numbered in on-screen order.
- **Zones:** instruction (top) · stage card (~72% width) · fixed feedback row (bottom, aria-live). Hint before action; Continue only after correct.
- **SCORM 1.2:** id, type, correct response, scored/practice, Bloom on every interaction; written once on first attempt, retries to suspend_data; unscored result "neutral"; clicks to suspend_data. Free text: 250 max, counter, no-PII line.
- **Constructed devices** (never in the reference card): Dana, S05 end event, S08 lines, S14 "away", S17 cases.

**Tooltips** (dotted underline on first use; same text everywhere)

| Term | Tooltip | Source |
|---|---|---|
| Process mapping | A sequential, explicit, visual description of how work actually flows. | s9 |
| Success metric | Something measurable before and after: a number, percentage, time, or frequency. | s37 |
| Trigger / Steps / Output | What starts the process: a message, a form, a date. / The path from trigger to result; three to seven are usually enough. / What comes out at the end, and to whom. | s10 |
| Process | A set of related activities that use inputs to produce an intended output. | s11 |
| BPMN; Swimlane / Gateway / Event | A standard for process diagrams, shared across tools and teams. Who does what, one lane per role. / A decision point; the path splits. / Start, end, and intermediate points. | s12, s13 |
| Field template | A fixed set of fields; fits when you know the process and need a fast decision. | s13 (SME) |
| Eight fields (S07 title) | Same spirit as the five-field template from Lesson 1, now for a whole process. | s14 |
| Handoff | The moment responsibility passes from one role to another. | s27 |
| Process owner / Source owner | Responsible for the process working, start to end. / Keeps a policy or document current. | s22 |
| Sensitivity tag | One of four levels: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED. It decides what may go to an AI tool. | s14, s44 |
| CONFIDENTIAL | Includes personal, employee and financial data. It does not go into a public AI tool. | s44 (SME) |
| Existing controls / Gaps | Checks in place today; "no formal control" is valid. / What is missing or unclear; "unclear" is allowed. | s18, s19 |
| Baseline / Target | The current state, even if estimated. / Specific, realistic, checkable later. | s37 |
| AS-IS | As it happens now, in practice, on a normal day. | s16 |
| Guardrail (S11) | Answer accuracy stays at or above 95% in a QA sample. | s20 (SME) |
| Bottleneck | A step limited by the slowest resource. | s28 |
| Three good-fit kinds | Unstructured to structured · Low-risk decision points · Handoffs with delay or loss. | s32 |
| High-risk decision / Hybrid model | Money, rights, safety, irreversible; needs human judgment. / AI for routine, a person for empathy and judgment. | s24, s26 |
| Ideal, not actual | Mapping how the process should work instead of how it works. | s34, s16 |
| Case 2 to 6 | First sentence of that Lesson 1 booklet scenario. | L1 booklet |

---

## 2. Lesson map

| Ch | Screens (min) | Min | Pause marker (feedback row after the last screen) |
|---|---|---|---|
| 0 Entry | S01 (2), S02 (5) | 7 | none |
| 1 Why map | FT1 (1), V1 (5), S03 (3) | 9 | "Good place to pause. Your place is saved." |
| 2 Toolkit | FT2 (1), S04 (4), S05 (4), S06 (3), S07 (6), S08 (4) | 22 | "Good place to pause. Your place is saved." |
| 3 HR demo | FT3 (1), V2 (6), S09 (4), S10 (2), S11 (3), S12 (3) | 19 | "Good place to pause. Your place is saved." |
| 4 Critical eye | FT4 (1), S13 (4), S14 (4), S15 (4), S16 (6), S17 (7) | 26 | "Good place to pause. Chapter 5 takes about 80 minutes. Start it fresh." |
| 5 Build yours | S18A (6), S18 (4), S19 (64, workbook), S20 (8) | 82 | "Good place to pause. Your map and place are saved." |
| 6 Close | S21 (12), S22 (3) | 15 | none |
| **Total** | 23 screens, 2 videos, 4 fast-track cards | **180** | Planning estimate (FL15); pilot timing needed |

Fast-track landings: FT1 to S03 · FT2 to S08 · FT3 to S12 · FT4 to S17. Wrong or skipped: the full chapter runs.

---

## 3. Screens

### S01 · Decision · 2 min
- **Instruction:** Choose your first move.
- **On-screen (42 words):** "Dana, HR director (fictional)" · "We get about 90 requests a month, most of them repeat questions." · "Put a chatbot on the HR inbox. Live next month?" · "Shortlist three chatbot vendors" · "Map how a request flows today" · "Survey employees on what they want"
- **Options:**
  - a · FB: "Vendors will ask who answers what, through which channel, and what counts as a wrong answer. Today nobody can tell them."
  - b · KEY · FB: "Requests arrive by WhatsApp, email and in person, with no organized system. A chatbot would only speed up that disorder."
  - c · FB: "Employees can tell you what they want. A wish list is not a description of today's work."
- **Hint:** "Pick one. You can change your mind."
- **Tracking:** L4_S01_1 · choice · b · practice · Evaluate
- **Sources:** s6, s7, s15; L1 booklet Case 1 and its chatbot reminder; HW1 check item.
- **Layout:** top: person icon + label and two speech bubbles; bottom: three option buttons in a row (icons list, route, forms).

### S02 · Input · 5 min
- **Instruction:** Bring your case from Homework 1.
- **On-screen (38 words):** "This is the case you map in Chapter 5." · "Case title" · "3 to 6 words, e.g. Sales call summaries" · "The problem today" · "Today X happens, and it hurts because Y." · "0/250" · "0/250" · "Leave out names and identifying details."
- **Elements:** two free-text fields (250 max). Save always enabled.
  - Saved · FB: "Saved. Your case comes back in Chapter 5, where you map it in eight fields."
  - Empty field · FB: "Add a few words to both fields. A rough version is enough; you can edit it later."
- **Hint:** "Describe what happens today, not the solution you want."
- **Tracking:** L4_S02_1 · fill-in · none · practice · Remember · result neutral. L4_S02_2 · fill-in · none · practice · Understand · result neutral. Stored once as L4_CASE_TITLE (edited again in S18).
- **Sources:** HW1 sections 1, 3; s40; s44.
- **Layout:** top: purpose line with folder icon; middle: two stacked fields with counters right; bottom: shield icon + no-PII line, Save right.

### FT1 · Fast track · Ch1 · 1 min
- **Instruction:** Answer one question, or skip the challenge.
- **On-screen (44 words):** "Optional challenge. Right on the first try? Skip to this chapter's last task." · "HBR, 1990: new technology runs on a broken process. What happens?" · "It removes the steps nobody needs" · "It speeds up the inefficiency already there" · "It shows the broken steps by itself"
- **Options:**
  - a · FB: "Technology runs the steps it is given. Nothing gets removed unless someone takes the process apart first."
  - b · KEY · FB: "Right on the first try: you can jump to the last task of this chapter, or watch the video."
  - c · FB: "The broken steps stay hidden and now run faster. Only mapping shows them. The full chapter starts now."
- **Hint:** "Answer if you already know this topic. Skipping costs nothing."
- **Tracking:** L4_FT1_1 · choice · b · practice · Understand. Route (skip / full) to suspend_data.
- **Sources:** s7.
- **Layout:** top: lightning icon + challenge line; middle: question; bottom: three options in a row; "Skip challenge" link bottom right.

### V1 · Video "Two cases, same lesson" · 5 min
See section 4. Guiding question shown before play; 2 stops.

### S03 · Decision (select two) · 3 min
- **Instruction:** Select the two causes both cases point to.
- **On-screen (27 words):** "Four causes of AI project failure, from Lesson 1. Which two do both video cases point to?" · "Unclear problem" · "Unmapped process" · "Unidentified end user" · "No success metric"
- **Options** (feedback paged "1 of 2"):
  - a · FB: "Your Homework 1 problem statement already worked on this one. Today starts after the problem is named."
  - b · KEY · FB: "Both cases changed only after someone saw how the work really flowed. Today you map it in eight fields."
  - c · FB: "Homework 1 asked you to name the specific role. That answer feeds your map; it is not built today."
  - d · KEY · FB: "Both stories were judged by numbers. Today you set a baseline and a target: a number, not a feeling."
- **Hint:** "Pick two cards, then press Check."
- **Tracking:** L4_S03_1 · choice (multiple) · b,d · practice · Understand
- **Sources:** s5, s40; V1 segment 8 (numbers); HW1 sections 3, 4.
- **Layout:** top: history icon + context line; middle: 2x2 grid of cause cards (one icon each); Check bottom right.

### FT2 · Fast track · Ch2 · 1 min
- **Instruction:** Answer one question, or skip the challenge.
- **On-screen (43 words):** "Optional challenge. Right on the first try? Skip to this chapter's last task." · "Case 6: the admin team routes an inquiry to the right department. Which field records that moment?" · "Field 3: Steps and role owners" · "Field 4: Handoffs" · "Field 6: Existing controls"
- **Options:**
  - a · FB: "Field 3 lists who does each step. The moment work moves between roles needs its own record."
  - b · KEY · FB: "Right on the first try: you can jump to the last task of this chapter, or take the full chapter."
  - c · FB: "Routing is not a check on quality. Ask what changes hands here. The full chapter starts now."
- **Hint:** "Answer if you already know the eight fields. Skipping costs nothing."
- **Tracking:** L4_FT2_1 · choice · b · practice · Apply
- **Sources:** s14, s27; L1 booklet Case 6.
- **Layout:** as FT1.

### S04 · Sort · 4 min
- **Instruction:** Sort each HR case card into its building block.
- **On-screen (36 words):** "Trigger" · "Steps" · "Output" · "An employee sends a question by email" · "HR staff check the topic of the question" · "A question arrives in person" · "HR staff answer or escalate to the manager" · "The employee receives an answer"
- **Cards** (one at a time, progress dots):
  - 1 · Trigger · wrong in Steps FB: "This is how the work reaches HR. Ask whether anything happens before it." · wrong in Output FB: "If this is the end, nothing happens to the question. Where does the work begin?"
  - 2 · Steps · wrong in Trigger FB: "Checking needs a question to check. Something must arrive before this can happen." · wrong in Output FB: "Nobody receives a topic check. The employee is still waiting at this point."
  - 3 · Trigger · wrong in Steps FB: "Requests arrive three ways. Each way is a different start, not a middle step." · wrong in Output FB: "The employee has nothing yet at this point. The work has not begun."
  - 4 · Steps · wrong in Trigger FB: "The question already arrived and was checked before this happens." · wrong in Output FB: "Escalation passes work on, it does not end it. Someone still has to reply."
  - 5 · Output · correct FB: "Placed. On the eight-field map, the output sits at the end of Field 3." · wrong FB: "If this is a middle step, the map never says what comes out, or to whom."
  - Cards 1 to 4 correct FB: "Placed."
- **Hint:** "Select a card, then choose its column."
- **Tracking:** L4_S04_1 · matching · 1.a,2.b,3.a,4.b,5.c (a Trigger, b Steps, c Output) · practice · Understand
- **Sources:** s9, s10, s11; HR canon Fields 2, 3.
- **Layout:** top: card deck; middle: three columns left to right in process order (play, stairs, flag icons); placed cards become chips.

### S05 · Explorer · 4 min
- **Instruction:** Select where the path splits. Then open the other two parts.
- **On-screen (26 words):** "Illustrative, built from the HR case" · "Employee" · "HR staff" · "HR manager" · "Question sent" · "Check the topic" · "Exceeds known policy?" · "Answer" · "Escalate" · "Answer received" · "Swimlanes" · "Gateway" · "Event"
- **Hotspots:**
  - Gateway (diamond) · KEY · FB: "The path splits here: within known policy, staff answer; beyond it, the question goes to the manager."
  - Lane band · FB: "This band shows one role and its work. The split you are after sits on the path itself."
  - Start or end event · FB: "This marks where the process begins or ends. Nothing splits here; one path passes through."
  - Step box · FB: "This is a task with one way out. Follow the path to where it divides."
  - Legend chip reveals (replace chip area): Swimlanes, Gateway, Event (glossary text). Continue after all three are open.
- **Hint:** "You only need to recognize these parts, not draw them."
- **Tracking:** L4_S05_1 · choice · gateway · practice · Remember. Chip opens to suspend_data.
- **Sources:** s12, s13; HR canon Fields 2 to 4. End event "Answer received" is illustrative (FL14).
- **Layout:** middle: three horizontal lanes drawn on, start circle left, end circle right; top right "Illustrative" tag; bottom: three legend chips.

### S06 · Decision (two situations) · 3 min
- **Instruction:** Pick the right format for each situation.
- **On-screen (31 words):** "You know your own process well and need a fast first diagnosis." · "The map must serve several systems and a professional process team." · "Field template" · "BPMN diagram" · "Field template" · "BPMN diagram"
- **Options:**
  - Situation 1 a · KEY · FB: "Fast to fill alone, enough for a first diagnosis. This is the tool you use for your own case."
  - Situation 1 b · FB: "You would spend your time on drawing rules, while the decision you need waits."
  - Situation 2 a · FB: "Your fields make sense to you. Other teams and tools need a shared standard form to read them."
  - Situation 2 b · KEY · FB: "A shared standard lets other tools, systems and process teams read the same map."
- **Hint:** "Answer the left card first."
- **Tracking:** L4_S06_1 · choice · a · practice · Apply. L4_S06_2 · choice · b · practice · Apply
- **Sources:** s13.
- **Layout:** left/right split, one situation card each (right revealed after left); two option buttons under each (form, diagram icons).

### S07 · Explorer · 6 min
- **Instruction:** Open all eight fields, then find the one you can check later.
- **On-screen, exploring, tile 7 open (41 words):** "1" · "Process name" · "2" · "Trigger" · "3" · "Steps and role owners" · "4" · "Handoffs" · "5" · "Knowledge/data sources, owners, sensitivity" · "6" · "Existing controls" · "7" · "What is missing or unclear. Writing 'unclear' here is a result, not a weakness." · "8" · "Success metric: baseline and target"
- **Answering state:** 34 words (eight tile titles plus 'Which field can you check later?'); tiles do not flip.
- **Tile backs (one open at a time):** 1 "Name one process. Where it starts and ends is a decision, not a given." · 2 "What starts the process: a message, a form, a date." · 3 "The path from trigger to result, and who exactly does each step." · 4 "Each point where responsibility passes between roles: from whom, to whom, what passes." · 5 "Policies and data the process uses, who keeps each current, and a sensitivity tag." · 6 "Checks already in place today. 'No formal control' is a valid answer." · 8 "A number with a baseline and a target, not 'significant improvement'."
- **Challenge (tiles become answer buttons, question hidden while locked):**
  - Field 8 · KEY · FB: "A baseline now and a target later make the map checkable: a number, not a feeling."
  - Field 7 · FB: "Gaps tell you what to investigate first. 'Unclear' cannot be measured before and after."
  - Field 6 · FB: "Controls describe checks that exist today. They do not state the result you will check later."
  - Fields 1 to 5 · FB: "This field describes how the process runs now. Look for the one that sets a result to measure."
- **Hint:** "Open each tile. The question unlocks after all eight."
- **Tracking:** L4_S07_1 · choice · 8 · practice · Understand
- **Sources:** s14, s10, s18, s19, s21, s22, s27, s37.
- **Layout:** middle: 2x4 grid of numbered tiles that flip in place; lock icon bottom (aria-label "Question unlocks after all eight fields").

### S08 · Decision (3 rounds) · 4 min
- **Instruction:** Find which AS-IS rule this map line breaks.
- **On-screen, round 1 (35 words):** "AS-IS: as it happens now." · "Steps and role owners" · "checking the topic (HR staff), then an AI assistant drafts the answer." · "Don't fix while mapping" · "Don't add AI while mapping" · "Don't map the official process"
- **Round 2 line** (badge "Trigger"): "questions arrive by email only, as the written HR procedure requires."
- **Round 3 line** (badge "Handoffs"): "HR staff to HR manager, through a shared channel the mapper just added."
- **Options:**
  - R1 a fix · FB: "Nothing here was repaired. Compare each step with what happens on a normal day."
  - R1 b add AI · KEY · FB: "The map now shows a tool nobody uses today. The current state is lost, and Lesson 5 has nothing to build on."
  - R1 c official · FB: "No written procedure is quoted here. The line describes a step that does not exist in practice."
  - R2 a fix · FB: "Nothing is being improved in this line. Compare it with how employees really send questions."
  - R2 b add AI · FB: "No AI appears in this line. Look at the source the mapper relied on."
  - R2 c official · KEY · FB: "WhatsApp and in-person questions vanish from the map, and so does most of the disorder you came to find."
  - R3 a fix · KEY · FB: "The real gap, no single handoff channel, disappears from Fields 4 and 7 before anyone has measured it."
  - R3 b add AI · FB: "No AI is mentioned. Ask who created this channel, and when."
  - R3 c official · FB: "No written procedure is cited. The mapper made this change during the mapping itself."
- **Hint:** "Compare the line with what really happens on a normal day."
- **Tracking:** L4_S08_1 · choice · b · practice · Analyze. L4_S08_2 · choice · c · practice · Analyze. L4_S08_3 · choice · a · practice · Analyze
- **Sources:** s16, s17, s34 #1 and #5, s19. R2 "written procedure" is constructed.
- **Layout:** top: template row (badge + field name + line), round dots; middle: three rule buttons (wrench, spark, document icons); bottom: AS-IS strip.

### FT3 · Fast track · Ch3 · 1 min
- **Instruction:** Answer one question, or skip the challenge.
- **On-screen (43 words):** "Optional challenge. Right on the first try? Skip to this chapter's last task." · "Which line breaks the AS-IS rules on the HR map?" · "Field 7: unclear how many answers were wrong" · "Field 6: no formal control" · "Field 3: a chatbot answers routine questions"
- **Options:**
  - a · FB: "'Unclear' is a valid diagnostic result. It stays. The full chapter starts now."
  - b · FB: "'No formal control' records what really happens. It stays. The full chapter starts now."
  - c · KEY · FB: "Right on the first try: you can jump to the full HR map, or watch the demo."
- **Hint:** "Answer if you can already map the HR case. Skipping costs nothing."
- **Tracking:** L4_FT3_1 · choice · c · practice · Evaluate
- **Sources:** s16, s18, s19.
- **Layout:** as FT1.

### V2 · Video "Mapping the HR case" · 6 min
See section 4. 3 stops (Field 2 channels, Field 4 handoff, Field 6 control).

### S09 · Sort (Field 5 parts) · 4 min
- **Instruction:** Sort each card into its part of Field 5.
- **On-screen (25 words):** "Field 5: sources, owners, sensitivity" · "Source" · "Owner" · "Sensitivity" · "Not Field 5" · "Vacation policy" · "Overtime policy" · "HR manager" · "INTERNAL" · "No formal control" · "Chatbot answers policy questions"
- **Cards:**
  - 1 · Source · correct FB: "Placed. The map now shows which document an HR answer depends on." · wrong FB: "A policy is not a person or a label. What role does it play in the process?"
  - 2 · Source · correct FB: "Placed. Overtime is one of the repeat topics in the Lesson 1 case." · wrong: as card 1
  - 3 · Owner · correct FB: "Placed. When a policy goes stale, the map now names who has to update it." · wrong FB: "This is a role, not a document or a label. What does this role do for the policies?"
  - 4 · Sensitivity · correct FB: "Placed. The policies stay inside the company. An employee's own details would be CONFIDENTIAL and stay out of public AI tools." · wrong FB: "This is not a document and not a person. What does it tell you about the data?"
  - 5 · Not Field 5 · correct FB: "Kept out. It describes how answers get checked. That is Field 6." · wrong FB: "This card says nothing about where knowledge comes from, who keeps it, or how sensitive it is."
  - 6 · Not Field 5 · correct FB: "Kept out. No chatbot runs today. Adding AI while mapping turns the AS-IS map into a plan." · wrong FB: "Ask whether this happens on a normal day in the HR case, as it runs now."
- **Hint:** "Select a card, then a column."
- **Tracking:** L4_S09_1 · matching · 1.a,2.a,3.b,4.c,5.d,6.d · practice · Understand
- **Sources:** s14, s18, s20, s22, s44, s16.
- **Layout:** top: Field 5 header; middle: four columns (document, person, tag, crossed box); bottom: tray of six cards.

### S10 · Decision (Field 7 only) · 2 min
- **Instruction:** Fill Field 7 for the HR case.
- **On-screen (43 words):** "HR keeps no record of answers given or corrected." · "Field 6, Existing controls: no formal control" · "Field 7, Gaps:" · "Staff think wrong answers are rare" · "AI will catch wrong answers later" · "Unclear how many answers were wrong" · "Leave it empty until data exists"
- **Options:**
  - a · FB: "No one has counted. The map now holds a guess that nobody can verify."
  - b · FB: "The map describes today. A checker that does not exist yet turns a gap into a plan."
  - c · KEY · FB: "Field 7 now tells you what to investigate before Lesson 5, and what not to build on yet."
  - d · FB: "The map now hides its biggest unknown. Lesson 5 would treat it as known and build on it."
- **Hint:** "Write what is true on a normal day, even if it looks bad."
- **Tracking:** L4_S10_1 · choice · c · practice · Apply
- **Sources:** s19, s38, s33, s43 item 4.
- **Layout:** top: situation line (speech icon); middle: Field 6 row pre-filled (grey, from V2 stop 3), Field 7 row active; bottom: 2x2 options.

### S11 · Decision · 3 min
- **Instruction:** Pick the strongest success metric.
- **On-screen (43 words):** "Field 8" · "HR time on repeats: significant improvement within 3 months" · "Employees feel HR answers repeat questions faster" · "HR time on repeats: down to 20% within 3 months" · "HR time on repeats: ~35% now, 20% in 3 months" · "Checkable later?" · "Baseline" · "Target" · "Date"
- **Options:**
  - a · FB: "No number to check. In three months, nobody can say whether it worked."
  - b · FB: "A feeling shifts with mood and memory. You cannot compare it before and after."
  - c · FB: "Twenty percent, down from what? Without today's number, nobody can show a change happened."
  - d · KEY · FB: "Checkable: a start point, a target and a date. One primary number to watch."
- **Hint:** "Ask: three months from now, could someone check it?"
- **Tooltips:** Success metric, Baseline, Target; on "Field 8": Guardrail (HR).
- **Tracking:** L4_S11_1 · choice · d · practice · Evaluate
- **Sources:** s4, s19, s20, s37.
- **Layout:** top: Field 8 row (gauge icon); middle: four stacked options; bottom: "Checkable later?" three slots light up per chosen option.

### S12 · Explorer with check · 3 min
- **Instruction:** Open any field, then answer the question.
- **On-screen, Field 3 open (45 words):** "1 Name" · "2 Trigger" · "3 Steps" · "4 Handoffs" · "5 Sources" · "6 Controls" · "7 Gaps" · "8 Metric" · "Which two fields together show the risk at the HR handoff?" · "Receiving the request (employee) to checking the topic (HR staff) to answer or escalation (HR staff / manager)"
- **Panel contents (open any tile, optional):** 1 "Answering employees' repeat questions to HR" · 2 "A question by WhatsApp, email, or in person" · 3 as above · 4 "From HR staff to HR manager when policy is exceeded" · 5 "Vacation, pension, expense, overtime policy. Owner: HR manager. Tag: INTERNAL" · 6 "No formal control: depends on the staffer's personal judgment" · 7 "Unclear how many wrong answers were given; no single handoff channel" · 8 "Baseline ~35% of HR time on repeat questions. Target 20% within 3 months"
- **Options (tiles, select two, then Check):**
  - 4 Handoffs · KEY · FB: "Field 4 shows the question moving from HR staff to the HR manager."
  - 7 Gaps · KEY · FB: "Field 7 adds the risk: no single channel for that handoff."
  - 3 Steps · FB: "Field 3 shows who does each step, not the moment between them or what can go wrong there."
  - 6 Controls · FB: "Field 6 is about how answers get checked. It says nothing about the handoff."
  - other · FB: "This field does not follow the question once it leaves the first staffer."
- **Hint:** "Open any field to read it. Then select two and press Check."
- **Tracking:** L4_S12_1 · choice (multiple) · 4,7 · practice · Analyze
- **Sources:** s20, s17 to s19, s27, s43 item 2. Same map sits in the menu reference card.
- **Layout:** left 40%: eight tiles (check mark when opened); right 60%: panel with field text, question above it.

### FT4 · Fast track · Ch4 · 1 min
- **Instruction:** Answer one question, or skip the challenge.
- **On-screen (40 words):** "Optional challenge. Right on the first try? Skip to this chapter's last task." · "Which decision needs clear human judgment, not AI?" · "Deciding whether a customer is eligible" · "Summarizing a long request in three lines" · "Tagging a request by its topic"
- **Options:**
  - a · KEY · FB: "Right on the first try: you can jump to the last task of this chapter, or take the full chapter."
  - b · FB: "Free text into a short summary is a good fit, with a person checking. The full chapter starts now."
  - c · FB: "Tagging is a low-risk classification, a good fit. Look for rights or money at stake. The full chapter starts now."
- **Hint:** "Answer if you can already judge where AI fits. Skipping costs nothing."
- **Tracking:** L4_FT4_1 · choice · a · practice · Apply
- **Sources:** s24, s32, s33; HW2 section 8 (eligibility).
- **Layout:** as FT1.

### S13 · Decision · 4 min
- **Instruction:** Set where the HR process starts and ends.
- **On-screen (41 words):** "Receiving, checking, answer or escalation" · "Start: HR staff open the inbox. End: the topic is checked." · "Start: an employee sends a question. End: the question reaches the HR manager." · "Start: an employee sends a question. End: the employee gets an answer."
- **Options:**
  - a · FB: "WhatsApp and in-person questions never reach the inbox, and nobody receives anything at the end. Most of the process sits outside."
  - b · FB: "Escalation passes the work on. The employee is still waiting, so the process has not delivered its output yet."
  - c · KEY · FB: "The map opens at the external trigger and closes when the employee gets an answer, even after an escalation."
- **Hint:** "Look for what starts it from outside, and who picks up the result."
- **Tracking:** L4_S13_1 · choice · c · practice · Apply
- **Sources:** s21, s10; HR canon Fields 2, 3.
- **Layout:** top: strip of three grey step chips with arrows; middle: three cards in a row, each split left Start (flag) / right End (finish line).

### S14 · Decision · 4 min
- **Instruction:** Choose what the map must record at this handoff.
- **On-screen (39 words):** "A question exceeds policy. It goes to the HR manager, who is away." · "A rule naming a backup manager" · "From whom, to whom, what passes, if unavailable" · "Nothing: the manager knows the history" · "An AI agent to reroute questions"
- **Options:**
  - a · FB: "Your AS-IS map now shows a rule nobody follows today. The real gap disappears before anyone has measured it."
  - b · KEY · FB: "Field 4 now shows sender, receiver, what passes, and the unavailable case. Here nothing covers it, so Field 7 records it."
  - c · FB: "The map now assumes the receiver knows what happened before. When the manager is away, the question has no path."
  - d · FB: "The map now describes a tool that does not exist. Lesson 5 would start from a plan, not from today."
- **Hint:** "Think about the moment responsibility changes hands."
- **Tracking:** L4_S14_1 · choice · b · practice · Analyze
- **Sources:** s27, s16; HR canon Fields 4, 7. "Away" is constructed.
- **Layout:** left 40%: two role icons joined by an arrow, "away" badge on the manager; right 60%: four stacked options.

### S15 · Decision · 4 min
- **Instruction:** Choose the first question to ask about this bottleneck.
- **On-screen (43 words):** "Case 4: course feedback" · "One step: the coordinator prints and reads all feedback by hand, 3 to 4 hours per course." · "Why did this step form, and is it needed?" · "Which AI tool summarizes feedback fastest?" · "How many more coordinators can we hire?"
- **Options:**
  - a · KEY · FB: "The cause decides the fix. Sometimes the right fix is to remove the step, not speed it up, as in the car-company case."
  - b · FB: "You would speed up a step without knowing why it formed. Faster technology on an unmapped process locks the problem in."
  - c · FB: "More people on the same step keep it in place. First ask whether the step should exist."
- **Hint:** "A bottleneck is a step limited by the slowest resource. Before speed, ask why."
- **Tracking:** L4_S15_1 · choice · a · practice · Apply
- **Sources:** s28 (definition, right question), s29, s30, s6; L1 booklet Case 4.
- **Layout:** top: case label + narrow-funnel icon; middle: the step line with the hours as a large number; bottom: three stacked option cards.

### S16 · Sort (three good-fit kinds) · 6 min
- **Instruction:** Sort each card: which good-fit kind, or poor fit?
- **On-screen (42 words):** "Unstructured to structured" · "Low-risk decision" · "Handoff delay or loss" · "Poor fit" · "Tag free-text questions by topic" · "Decide a financial refund" · "Label requests urgent or routine" · "Fix disorder in how requests arrive" · "Answer where the map says 'unclear'" · "Summarize a question before escalation"
- **Cards:**
  - 1 · Unstructured to structured · correct FB: "Good fit, unstructured to structured: free text in, a structured topic out." · wrong FB: "Look at what goes in and what comes out. Is a judgment call at stake here?"
  - 2 · Poor fit · correct FB: "Poor fit: irreversible, money at stake. Per reports, the fintech's quality dropped on complex cases and it moved to a hybrid model." · wrong FB: "If this decision is wrong, who carries the loss, and can it be undone?"
  - 3 · Low-risk decision · correct FB: "Good fit, low-risk decision point: it can be accelerated, with a person watching where risk rises." · wrong FB: "Ask how much damage one wrong label would cause, and how fast it would be caught."
  - 4 · Poor fit · correct FB: "Poor fit, a process problem: nothing is missing but order. AI on top keeps the disorder running faster." · wrong FB: "Is information missing here, or is the process itself disorganized?"
  - 5 · Poor fit · correct FB: "Poor fit: you cannot build on unknown foundations. This needs diagnosis, not more technology." · wrong FB: "Check what the map actually knows before anything is built on it."
  - 6 · Handoff delay or loss · correct FB: "Good fit, handoff with delay or loss: AI documents it, so the HR manager gets the history." · wrong FB: "Think about what the HR manager receives today when a question is passed on."
- **Hint:** "Select a card, then a column."
- **Tracking:** L4_S16_1 · matching · 1.a,2.d,3.b,4.d,5.d,6.c (a U-to-S, b low-risk, c handoff, d poor fit) · practice · Analyze
- **Sources:** s23, s24, s26, s32, s33; HW2 section 8.
- **Layout:** top: four columns (three good-fit kinds with check-circle icons, Poor fit with stop-hand); bottom: tray of six cards in two rows.

### S17 · Sort (one case at a time, five bins) · 7 min
- **Instruction:** Sort each case into the mistake it shows.
- **On-screen (28 words):** "Ideal, not actual" · "No clear goal" · "Rushed mapping" · "Not updated" · "Automating a broken process" · "Someone mapped every HR task 'to have it documented', with no question to answer."
- **Cases (key bin):**
  - A "Fields 6 and 7 were left blank to finish the map quickly." · Rushed · correct FB: "Controls and gaps are where the findings live. Skipping them leaves Lesson 5 nothing to protect against." · wrong FB: "The map has a goal and matches today. Look at which fields were never filled."
  - B "The map shows how HR intends requests to flow, not how they flow today." · Ideal · correct FB: "The map now describes a wish. Every gap on a normal day stays hidden." · wrong FB: "Nothing was skipped or automated. Compare the map with a normal day in HR."
  - C "A chatbot is planned for the three channels exactly as they run today." · Automating · correct FB: "The most critical mistake. Three channels with no organized system get faster, and the disorder grows with them." · wrong FB: "The map may be accurate. Look at what is about to be done with the process."
  - D "HR moved to one request form. The map still shows three channels." · Not updated · correct FB: "The map was right once. Lesson 5 would now build on a process that no longer exists." · wrong FB: "Something changed after the map was drawn. Which mistake follows a change?"
  - E (shown above) · No clear goal · correct FB: "Without a question, nobody can say which process or boundaries matter. The map grows and decides nothing." · wrong FB: "The map may be accurate and complete. Ask what it was drawn to decide."
- **Hint:** "Read the case, then choose the bin that names its mistake."
- **Tracking:** L4_S17_1 · matching · A.3,B.1,C.5,D.4,E.2 · practice · Analyze
- **Sources:** s34, s16, s17, s21, s6. Cases constructed (FL12); D is a fictional later change.
- **Layout:** top: one case card with document icon and five dots; bottom: five bins in a row (cloud, compass, hourglass, calendar, cracked gear).

### S18A · Sort (transfer warm-up, NEW) · Ch5 · 6 min
- **Instruction:** Map three fields of a case that is not HR.
- **On-screen (40 words):** "Case 3: sales call summaries" · "Field 2: Trigger" · "Field 3: Steps" · "Field 7: Gaps" · "Not AS-IS" · "A sales call ends" · "The rep updates the CRM, often late" · "Unclear whether reps see a problem" · "An AI tool drafts each call summary"
- **Cards:**
  - 1 · Field 2 · correct FB: "Placed. A concrete event starts the work, as in HR, but here it repeats 8 to 12 times a day per rep." · wrong FB: "Ask what has to happen before any summary can be written."
  - 2 · Field 3 · correct FB: "Placed. The step and its owner, written as it really runs: often late, not as the rule says." · wrong FB: "This is work a role does. Where do steps and owners go?"
  - 3 · Field 7 · correct FB: "Placed. An honest unknown. It tells you what to ask before Lesson 5." · wrong FB: "Nobody knows this yet. Which field holds what is missing or unclear?"
  - 4 · Not AS-IS · correct FB: "Kept out. Your Homework 2 AI step is a future idea too. It stays off your AS-IS map." · wrong FB: "Does this happen on a normal day today, or is it an idea for later?"
- **Hint:** "Same eight fields, different case. Select a card, then a column."
- **Tracking:** L4_S18A_1 · matching · 1.a,2.b,3.c,4.d · practice · Apply
- **Sources:** L1 booklet Case 3; s14, s16, s19; HW2 (model step).
- **Layout:** top: case label with tooltip (booklet first sentence); middle: four columns; bottom: tray of four cards.

### S18 · Decision then Input (data safety) · 4 min
- **Instruction:** Choose what you write in the workbook. Then check your case title.
- **On-screen, step 1 (35 words):** "The workbook has a live AI coach that reads what you type." · "Your real map, with names and policy titles" · "Roles instead of names, no identifying details" · "Your real map, with Field 5 left empty"
- **On-screen, step 2 (19 words):** "Case title, generalized" · "Leave out names and identifying details." · "0/250" · "I removed names and identifying details from my notes." (title field pre-filled from S02, learner text not counted)
- **Options (step 1):**
  - a · FB: "Names and internal policy now sit in an AI tool. Personal, employee or financial details are CONFIDENTIAL: keep them out."
  - b · KEY · FB: "Nothing identifying leaves your hands. If unsure whether something is allowed, the Lesson 3 rule applies: leave it out."
  - c · FB: "Names can sit in any field, not only Field 5. Steps and handoffs still identify people."
- **Step 2:** Save without the box ticked · FB: "Tick the box once your notes have no names or identifying details." · Saved · FB: "Saved. This title goes on your workbook and your lesson record."
- **Hint:** "Before you write anything, remove names and identifying details."
- **Tracking:** L4_S18_1 · choice · b · practice · Apply. L4_S18_2 · fill-in · none · practice · Apply · neutral (overwrites L4_CASE_TITLE). Checkbox to suspend_data.
- **Sources:** s44 (generalized, de-identified version; Lesson 3 rule), s14; decisions 1, 2.
- **Layout:** step 1: top situation line (lock icon), middle three stacked options; step 2: top title field with counter, bottom checkbox (shield icon) and Save right.

### S19 · Handoff to `eai-m1l4-class` · 64 min
- **Instruction:** Open the workbook and map your own case.
- **On-screen, brief (44 words):** "AS-IS Process Mapping for Your Own Use Case" · "~60 min" · "1 Open Homework 1 and 2" · "2 Fill eight fields as the process runs today" · "3 Leave your Homework 2 AI step off the map" · "4 Export your PDF" · "Coach on: roles, no names."
- **On-screen, return (24 words):** "Back from the workbook? Export your PDF, then check your map." · "Your success metric: baseline and target" · "0/250" · "Leave out names and identifying details."
- **Elements:**
  - Open workbook (new tab) · FB: "The workbook is open in a new tab. This module keeps your place."
  - I'm back · FB: "Next: three questions to check your map against."
  - Metric field (250 max) · Saved FB: "Saved to your lesson record."
- **Hint:** "Unknown? Write 'unclear'. The coach treats it as a valid answer."
- **Tracking:** L4_S19_1 · fill-in · none · practice · Create · neutral (metric). Open and return to suspend_data.
- **Sources:** s35, s14, s19, s37, s43 items 1 and 4, s44.
- **Layout:** top: activity title (workbook icon) and time chip right; middle: four numbered steps; bottom: shield icon + coach line left, Open button right. Return state same grid, metric field in the middle.
- **Activity:** existing `eai-m1l4-class` (eight fields, live coach, approved for EAI under Dor's DPA exception). No new workbook spec. Worked HR map stays in the menu reference card.
- **Suggested improvement for `eai-m1l4-class`:** Field 4 (handoffs) should prompt "What happens if the receiver is unavailable?" (s27).

### S20 · Decision (self-check, two steps) · 8 min
- **Instruction:** Check your map against three questions. Then pick your biggest risk.
- **On-screen, step 1 (36 words):** "Does every step name who exactly does it?" · "Does Field 4 say what happens if the receiver is unavailable?" · "Can a number show that the metric improved?" · "Yes" · "Not yet" · "Yes" · "Not yet" · "Yes" · "Not yet"
- **On-screen, step 2 (25 words):** "Ideal, not actual" · "No clear goal" · "Rushed mapping" · "Not updated" · "Automating a broken process" · "Before Lesson 5: every field filled, metric measurable, no invented answers."
- **Step 1 feedback:**
  - Q1 Yes FB: "Every step has an owner. Lesson 5 can place AI or a person next to each one." · Not yet FB: "A step without a role cannot be improved or monitored. Name the role, or write 'unclear' in Field 7."
  - Q2 Yes FB: "Your handoffs cover the unavailable case. Delays now show up on the map, not in daily work." · Not yet FB: "A handoff with no plan stalls. Add what happens, or record it as a gap."
  - Q3 Yes FB: "You can check your change later: baseline now, target to check against." · Not yet FB: "Without a number, nobody can tell whether anything improved. Add a baseline, even estimated, and a target."
- **Step 2 feedback (any chip):** Ideal FB: "Reread Field 3 against a normal day, not the written procedure." · No goal FB: "Write one sentence on what this map must help decide." · Rushed FB: "Reopen Fields 6 and 7. Those are the ones skipped first." · Not updated FB: "Note the date on your map and what would trigger an update." · Automating FB: "Before Lesson 5, list which steps need fixing, not speeding up."
- **Hint:** "Answer honestly. 'Not yet' sends you back with one fix."
- **Tracking:** L4_S20_1 to _3 · choice · none · practice · Evaluate · neutral. L4_S20_4 · choice · none · practice · Evaluate · neutral
- **Sources:** s36, s43 item 4, s34, s37, s38.
- **Layout:** step 1: three rows, question left (person, clock, ruler icons), Yes / Not yet toggles right; step 2: five chips top, checklist strip bottom; "Reopen workbook" link bottom right.

### S21 · Knowledge check (5 items, scored) · 12 min
- **Instruction:** Choose one. Your first answer counts. (Item 5: Find the two errors in this AI-drafted HR map.)
- **On-screen, item 1 (45 words):** "Case 2: reps route requests to departments. Field 4 says 'Rep to department.' What is missing?" · "A rule that reps must route correctly" · "The AI tool that will route requests" · "What passes, and what if nobody is available" · "Nothing more: the department sees the request"
- **On-screen, item 2 (38 words):** "Case 6: student inquiries. Which step is the strongest first place for AI?" · "Deciding on exceptional student requests" · "Tagging each inquiry by topic for routing" · "Handling sensitive cases on its own" · "Answering by category before categories are counted"
- **On-screen, item 3 (38 words):** "Case 5: the weekly report takes 4 to 6 hours. Nothing is logged. Baseline?" · "About 5 hours, marked as estimated" · "Nothing until a time log exists" · "The target time, once it is set" · "'Much faster reports' for now"
- **On-screen, item 4 (38 words):** "Case 2: nobody knows what share of requests are simple. Where does this go?" · "Field 6: reps double-check each request" · "Field 3: add a sorting step" · "Field 8: target fewer complex requests" · "Field 7: 'unclear', to investigate first"
- **On-screen, item 5 (44 words):** "1 Repeat HR questions" · "2 WhatsApp, email, in person" · "3 Receive, check, answer or escalate" · "4 Staff to HR manager" · "5 Policies, HR manager, PUBLIC" · "6 HR manager reviews each answer" · "7 Errors uncounted; no handoff channel" · "8 ~35% to 20% in 3 months"
- **Item 1** (Analyze):
  - a · FB: "That adds a rule nobody follows today. The map becomes a redesign before the gaps are known."
  - b · FB: "The map now holds a future tool, and today's handoff stays as vague as before."
  - c · KEY · FB: "From and to are there. Without what passes and the unavailable case, a request stalls between teams."
  - d · FB: "The receiver may not know what happened before. The map hides the most dangerous moment in the process."
- **Item 2** (Apply):
  - a · FB: "Exceptional requests need human judgment. An error here can touch a student's rights."
  - b · KEY · FB: "Unstructured text in, a structured label out, at low risk. Exceptions still go to a person."
  - c · FB: "Sensitive cases need judgment, and today nobody knows how they are handled. That is unclear, not ready."
  - d · FB: "There is no breakdown of categories yet. A solution here stands on unknown foundations."
- **Item 3** (Apply):
  - a · KEY · FB: "An estimated metric beats no metric. You now have a starting number to check the target against."
  - b · FB: "Field 8 stays empty. In three months, nobody can show whether anything changed."
  - c · FB: "Field 8 now shows where the team hopes to land and nothing about where it stands now."
  - d · FB: "That is a feeling, not a number. Nobody could check it later."
- **Item 4** (Analyze):
  - a · FB: "That records a control nobody reported. Lesson 5 would rely on a check that may not exist."
  - b · FB: "That adds a step while mapping. The unknown share stays off the map."
  - c · FB: "A target with no baseline, while the real problem, that nobody knows the share, stays hidden."
  - d · KEY · FB: "A diagnostic result, not a weakness. It shows what to check before Lesson 5 and what not to build on yet."
- **Item 5** (Evaluate, A5; select two, then Check):
  - Tile 5 · KEY · FB: "Tagged PUBLIC, internal HR policy could be pasted anywhere. The HR map tags it INTERNAL; employee details are CONFIDENTIAL."
  - Tile 6 · KEY · FB: "No one reviews answers today. The AI invented a control that sounds right, and Lesson 5 would rely on it."
  - Tile 1, 2, 3, 4, 7 or 8 · FB: "This line matches the HR map. Compare each line with what the map really says."
- **Hint:** "Choose one. You can retry, but only the first answer counts."
- **Tracking:** score.raw 0 to 100 (20 per item), score.min 0, score.max 100, pass mark 80 (4 of 5). L4_S21_1 · choice · c · scored · Analyze. L4_S21_2 · choice · b · scored · Apply. L4_S21_3 · choice · a · scored · Apply. L4_S21_4 · choice · d · scored · Analyze. L4_S21_5 · choice (multiple) · 5,6 · scored · Evaluate.
- **Result card:** "4 of 5 on first try. Pass mark: 4 of 5." Status set at Finish (passed / failed).
- **Sources:** s16, s18, s20, s23, s24, s27, s32, s33, s37, s38, s44; L1 booklet Cases 2, 5, 6; HW2 (fluent but wrong AI output).
- **Layout:** five dots top right; stem top (scenario icon); options 2x2 with letter badges; item 5: eight tiles in two columns of four, Check bottom right.

### S22 · Close (two steps) · 3 min
- **Instruction:** Pick the takeaway your map proves most. Then save your record.
- **On-screen, step 1 (16 words):** "Mapping is a condition, not bureaucracy" · "'Unclear' is a legitimate answer" · "Not every bottleneck needs acceleration"
- **On-screen, step 2 (32 words):** "Lesson 5 marks on this exact map where AI enters, what it consumes, and where a person stays." · "Homework: complete your map and mark three AI points, using the three good-fit kinds."
- **Step 1 feedback (any card):** condition FB: "Process mapping is a condition for change that lasts. Your map is now the raw material for Lesson 5." · unclear FB: "Not a failure of the mapper, a diagnostic result. Your Field 7 lists what to investigate first." · bottleneck FB: "Sometimes the right fix is to remove the step, not speed it up. Ask why it formed first."
- **Step 2 buttons:** Open homework (opens `eai-m1l4-home`: 8 fields + 3 AI touchpoints + open questions) · Download my lesson record · Finish lesson
  - Download FB: "Your record holds your case title, metric, self-check answers and score. Your map stays in the workbook PDF."
  - Finish without download FB: "Finish without downloading? Your workbook PDF is not affected. Press Finish again to confirm."
- **Hint:** "Without your full map, Lesson 5 cannot run for you."
- **Tracking:** L4_S22_1 · choice · none · practice · Evaluate · neutral. Homework open and download to suspend_data. Finish sets lesson_status.
- **Sources:** s45, s41, s46, s42, s32.
- **Layout:** step 1: three tall cards side by side (key, question mark, scissors); step 2: left bridge line (map icon) and homework line (calendar icon), right three stacked buttons.

---

## 4. Videos

Production (both): code-animated flat shapes, icons, counters; no music, no photos, no robot heads (plain "AI" chip, person icon for humans). Nothing swaps: elements draw on and grey out. On-screen text = keywords and numbers only; "per reports" stays on screen with every hedged figure. Captions and transcript. Stops: frozen still left 40%, question panel right 60%, feedback in the feedback row; resume only after the correct option; first attempt reported; practice. Timecodes at 150 wpm (2.5 words/s), pauses excluded.

### V1 "Two cases, same lesson"
- **Guiding question:** "What separates a technology change that works from one that has to be fixed later?"
- **Length:** 400 words · 2:40 + 2 stops (0:58, 2:06) · answered in segment 8.

| # | Time | Narration | On-screen build |
|---|---|---|---|
| 1 | 0:00 | A team has a slow, painful process. A faster technology arrives, and they put it on top of the process as it is. The problem doesn't go away. It gets locked in, faster and at a larger scale. | Messy chain; bolt **faster tech** lands: **same mess, faster** |
| 2 | 0:15 | In 1990, Harvard Business Review published an article called Reengineering Work: Don't Automate, Obliterate. Obliterate means wipe out. The principle: if you run new technology on a broken process without taking it apart first, you only speed up the inefficiency you already have. It was written about ordinary computing. It applies to AI just as well. | **HBR, 1990** · **Don't automate, obliterate** · boxes pull apart |
| 3 | 0:38 | Case one. The early 1980s, the accounts payable department of a US car company. 500 people work there. A Japanese company runs the same department with about 100. Five times fewer. The US company wants to close that gap. Before you see what they found, make the first call yourself. | **early 1980s** · **500** vs **~100** · **5x** · STOP 1 |
| 4 | 0:58 | Mapping revealed the real reason. Most of the work went into manually reconciling three separate documents. The gap was not closed by faster systems for the existing process. Instead, the process itself was rewritten: payment is now triggered directly from the receipt record, with no separate invoice. Per reports, the headcount needed fell by about 75 percent. | **3 documents, manual reconciliation** · bolt bounces off · **receipt record → payment** · **~75% fewer (per reports)** |
| 5 | 1:20 | Case two. A Swedish fintech, per public reports, 2024 to 2025. An AI agent starts handling its customer conversations: about 2.3 million a month. Per reports, the drop in service load is on the scale of about 700 service reps. Handling time falls from about 11 minutes to under two. | **2024 to 2025** · **2.3M conversations / month** · **~700 reps: load reduction** · **~11 min → under 2** · **per reports** |
| 6 | 1:40 | These figures come from company publications and media reports. They're here for learning, not as proof that people should be replaced. Then, by early 2025, the company starts rehiring human service reps. On simple requests, the AI performed about as well as people. On complex ones, like disputes or personally difficult cases, quality dropped noticeably. So what went wrong? Decide before you hear it. | **for learning, not proof people should be replaced** · **early 2025: rehiring** · **simple: similar** / **complex: quality drops** · STOP 2 |
| 7 | 2:06 | Management admitted that focusing too much on efficiency hurt service quality. The fix was a hybrid model: AI for the routine, a person when empathy and judgment are needed. | Split: "AI" chip **routine** / person icon **empathy + judgment** · **hybrid model** |
| 8 | 2:18 | Two cases, decades apart, with completely different technology. The same lesson. Process mapping is not a bureaucratic step. It's what separates a change that works from a change that has to be fixed after the fact. And notice: both stories are told in numbers. Headcount, handling time, quality. Without a number, nobody can check a change. | **1980s = 2024 to 2025** · **map first** · **headcount, time, quality** · **Next: 4 causes, pick 2** |

**Stop 1 (0:58)** "The US company wants to close a five-times gap. What should it look at first?"
- A "A faster system for its current payment checks" · FB: "Faster checks keep every existing step in place. If the work sits in the wrong place, it only moves faster."
- B "Where the 500 people's working time goes today" · KEY · FB: "That is the question mapping answers. Watch what it found."
- C "The official payment procedure, as written" · FB: "A written procedure shows how work should flow. The gap lives in how it really flows on a normal day."
- Tracking: L4_V1_1 · choice · b · practice · Apply

**Stop 2 (2:06)** "Quality dropped on complex requests. What was the root problem?"
- A "Routine and judgment cases got the same path" · KEY · FB: "Speeding everything up without telling decision types apart sent complex cases where judgment was missing."
- B "Complex cases needed a faster AI, not a different path" · FB: "Speed was already there, per reports. Look at which kinds of request lost quality."
- C "Simple requests should have stayed with people" · FB: "Per reports, simple requests went about as well as with people. Look at where quality dropped."
- Tracking: L4_V1_2 · choice · a · practice · Analyze

### V2 "Mapping the HR case"
- **Guiding question:** "How do you turn about 90 messy requests a month into a map you can check later?"
- **Length:** 548 words · 3:39 + 3 stops (0:59, 1:59, 3:02) · hard cap 4:00 on rendered audio.
- **Canvas:** left 60% process map (lanes illustrative, from Fields 2 to 4); right 40% eight empty field slots that fill with keywords.

| # | Time | Narration | On-screen build |
|---|---|---|---|
| 1 | 0:00 | This is the HR case from Lesson 1. A services company with about 400 employees. HR receives about 90 requests a month, and most of them repeat: vacation days, pension terms, expense submissions, overtime policy. They come in by WhatsApp, by email, and in person, with no organized system. Nobody knows how many of them need human judgment. | **~400 employees** · **~90 requests / month** · topic chips · three channels pile dots on an HR box |
| 2 | 0:23 | The tempting first move is a chatbot. Not yet. First we map. And we map AS-IS: how it actually happens on a normal day, not how it's supposed to work. No fixing, no AI. Just what's really there. | "AI" chip stops: **not yet** · **AS-IS** · crossed **fix**, **AI** · 8 empty slots |
| 3 | 0:38 | Field 1 is the process name. Keep it plain and specific: answering employees' repeat questions to HR. Field 2 is the trigger, the thing that starts the process. A good trigger is concrete: a message, a form, a date. Something you can point to. Before I fill it in, you choose. | Slot 1 **repeat HR questions** · slot 2 active · STOP 1 |
| 4 | 0:59 | All three channels go on the map, because all three really happen. Notice that nothing here is fixed or improved. It's simply what happens. Where a process starts and ends is a decision, not a given. Without clear boundaries, a process swells until it includes almost the whole organization. | Slot 2 **WhatsApp / email / in person** · start circle · **boundaries = a decision** |
| 5 | 1:18 | Field 3 is the steps, each with a role owner. Three to seven steps are usually enough. This case needs three. Receiving the request. Checking the topic, done by HR staff. Then an answer or an escalation, by HR staff or the HR manager. Owners are written as roles, not names, so the map stays true when people change. | Boxes **Receive → Check → Answer / escalate** · role chips **(employee)**, **HR staff**, **HR staff / HR manager** · **roles, not names** |
| 6 | 1:42 | Look at the lanes building on screen. Each role gets its own row, so at every moment you can see who is holding the work. Field 4 asks where responsibility passes from one role to another. Look at who owns each step. | Three lanes; "Answer / escalate" straddles HR staff and HR manager lanes. No gateway, no arrow yet · STOP 2 |
| 7 | 1:59 | From HR staff to the HR manager, when a question goes beyond known policy. That's the most dangerous moment in a process. The staffer assumes the manager knows what happened before, and that isn't always true. A good map marks each handoff: from whom, to whom, what exactly passes, and what happens if the receiver is unavailable. Here, there's no single channel for it. Keep that in mind for Field 7. | Gateway **beyond known policy?** and handoff arrow draw now · checklist **from, to, what passes, if unavailable?** · amber dot **no single channel** |
| 8 | 2:27 | Field 5 is knowledge sources: the vacation, pension, expense, and overtime policies. Each source gets an owner, the role that keeps it current. Here, the HR manager. And each gets a sensitivity tag on a four-level scale: public, internal, confidential, restricted. These policies are internal. An employee's own personal or financial details are confidential, and they don't go into a public AI tool. | **owner: HR manager** · scale **PUBLIC · INTERNAL · CONFIDENTIAL · RESTRICTED**, INTERNAL lit · **personal, employee, financial = CONFIDENTIAL: not to public AI** |
| 9 | 2:52 | Field 6 is existing controls. Is anything checking the answers before they go out? You've seen the steps. What goes in the map? | Slot 6 active, no result shown · STOP 3 |
| 10 | 3:02 | No formal control: it depends on the staffer's own judgment. That's a valid answer, and exactly what mapping reveals. | Slot 6: **no formal control** · **valid answer** |
| 11 | 3:09 | Field 7 is gaps. Here you're allowed, even encouraged, to write unclear. Nobody knows how many wrong answers were given before. There's no single organized handoff channel. That's a diagnostic result. | Slot 7 **wrong answers: unclear** · **no single handoff channel** |
| 12 | 3:22 | Field 8 is the success metric. Baseline: about 35 percent of the HR team's time goes to repeat questions. Target: 20 percent within three months. Not a feeling. A number you can check later. Next, you take the mapper's seat, starting with Field 5. | Bar **~35%** pulls to **20% in 3 months** · slot 8 fills · **Next: Field 5** |

**Stop 1 (0:59)** "Which line belongs in Field 2, as the process runs today?"
- A "An employee emails HR, the most formal channel" · FB: "Email is only one of three real channels. WhatsApp and in-person questions vanish from the map."
- B "An employee asks by WhatsApp, email, or in person" · KEY · FB: "It names the concrete event that starts the work, across all three channels that really exist."
- C "A chatbot receives every employee question" · FB: "That describes a future tool. An AS-IS map records today, so AI has no place on it yet."
- Tracking: L4_V2_1 · choice · b · practice · Apply

**Stop 2 (1:59)** "Where does responsibility pass from one role to another?"
- A "HR staff to HR manager, when policy is exceeded" · KEY · FB: "From here on, the HR manager depends on what the staffer passes along."
- B "HR staff check the topic of each request" · FB: "One role does this from start to finish. Nothing changes hands, so it stays a step in Field 3."
- C "HR manager keeps the four policies current" · FB: "That is ownership of a knowledge source. It goes in Field 5, next to each policy."
- Tracking: L4_V2_2 · choice · a · practice · Analyze

**Stop 3 (3:02)** "What goes in Field 6, existing controls?"
- A "A manager review before answers go out" · FB: "That is a fix for later. Added now, the map shows a check that does not exist today."
- B "No formal control: the staffer's own judgment" · KEY · FB: "It records what really happens. That missing check is exactly what the map is meant to reveal."
- C "Nothing yet: leave Field 6 empty for now" · FB: "An empty field reads as not checked yet. The finding itself is the content this field needs."
- Tracking: L4_V2_3 · choice · b · practice · Apply

---

## 5. Knowledge check answer key (S21, pass mark 80% = 4 of 5, first attempt)

| Item | Key | One-line explanation | Source |
|---|---|---|---|
| 1 Case 2 handoff | c | A good map marks from whom, to whom, what passes, and what happens if the receiver is unavailable. | s27 |
| 2 Case 6 AI fit | b | Unstructured to structured at a low-risk point is the most natural AI entry; exceptions and sensitive cases need judgment. | s23, s24, s32, s33 |
| 3 Case 5 baseline | a | The baseline is the current state, even if estimated; an estimated metric beats no metric. | s37 |
| 4 Case 2 unknown share | d | Unknowns go to Field 7 as 'unclear', a legitimate diagnostic answer. | s19, s38 |
| 5 AI-drafted HR map | 5, 6 | Tile 5 tags INTERNAL policy PUBLIC (s14, s44); tile 6 is a fluent, invented control (s18; HW2: fluent output can hide errors). All other tiles match the HR map. | s14, s18, s20, s44 |

---

## 6. Open items for SME (ready to send)

1. Sensitivity: confirm HR Field 5 policies = INTERNAL and personal, employee, financial data = CONFIDENTIAL, as our reading of s20 "internal / employee" and s44 on the s14 scale. RESTRICTED has no definition in the sources.
2. "QA sample": define it, and confirm accuracy ≥95% is a guardrail, not a second metric (s20).
3. Field 3 step 1 owner "Receiving the request (employee)": confirm the role (s17, s20).
4. Fintech: deck says "2.3M calls a month"; we say "conversations". Please verify (s25).
5. Citations to verify before recording: HBR 1990 title, Gartner quote, McKinsey 2025, APQC 13 categories, ISO 9001 ownership (s7, s8, s11, s21, s22).
6. HR handoff: the deck does not say what passes or what happens if the HR manager is unavailable. OK to treat both as 'unclear'?
7. Approve constructed teaching devices: S08 round lines, S14 "manager is away", S17 cases A to E (D is a fictional later change), S05 end event "Answer received".
8. S15: OK to frame Case 4's hand-reading step as a bottleneck (one coordinator as the slowest resource)?
9. S16: approve the six cards and their kinds, especially card 4 "Fix disorder in how requests arrive" = poor fit (process problem, s33).
10. S18A: approve Case 3 keys, especially "The rep updates the CRM, often late" as an AS-IS step.
11. S21: approve items on booklet Cases 2, 5, 6, and "about 5 hours" as the midpoint of Case 5's 4 to 6 hours.
12. `eai-m1l4-class` Field 4: add the prompt "What happens if the receiver is unavailable?" (s27).
13. Tooltips composed from the deck, please approve: "Field template", "Ideal, not actual", "CONFIDENTIAL" examples line.
14. Time: reviewers estimate realistic seat time below 180 min outside the workbook. Pilot with two learners before lock.
15. Noy: fast track is applied to Ch1 to Ch4 only (Ch0 holds the case, Ch5 the deliverable, Ch6 the scored check). Confirm.
16. Noy: what happens below 80% (retake S21, or review chapters, then retake)?

---

## 7. Change log vs v1

- Workbook spec 06 dropped; S19 hands off to `eai-m1l4-class` (brief lists Homework 1 and 2, keeps the Homework 2 AI step off, adds a metric field); S22 links `eai-m1l4-home`.
- Critical fixes: S18 rewritten (de-identify before writing; no "map stays on paper" box); S13 key ends at "the employee gets an answer", so escalation is no end point.
- One sensitivity scheme (four levels) in S07, S09, S12, S18, S21, V2. One HR metric; accuracy only as a guardrail tooltip. S11 options equalized, key d.
- S01: Dana labelled fictional, booklet numbers, no "no owner".
- Word counts recounted with one method; all screens ≤45, all feedback ≤25 (script-verified).
- Ch3 de-duplicated: V2 stops on Field 2 channels, Field 4, Field 6; S09 Field 5 parts; S10 Field 7 only; S11 Field 8; S12 links Fields 4 and 7, tile opens optional.
- S03 grounded in V1 segment 8; S15 rebuilt on Case 4 with the deck's bottleneck definition; S16 columns name the three good-fit kinds.
- S21: items 1 to 4 on booklet Cases 2, 5, 6; A5 item seeds a wrong PUBLIC tag and an invented control; pass mark 80%, score 0 to 100.
- New: S18A transfer warm-up (Case 3); FT1 to FT4 fast track; pause markers.
- S22 simplified (takeaway, bridge, homework link, download); no Lesson 5 layer terms.
- V1: new title, "Obliterate" glossed, stop 1 cue removed, stop 2 distractors fixed, "AI" chip replaces robot head, segment 8 names numbers.
- V2: 3:39 (was 3:54); gateway drawn only after stop 2; stop 3 answer not said before; four-level tag narration.
- Desktop only; ids unified (L4_V1_1); clicks to suspend_data; one stored case title.
