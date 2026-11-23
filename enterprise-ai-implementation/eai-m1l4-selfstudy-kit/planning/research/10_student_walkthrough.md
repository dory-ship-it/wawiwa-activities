# 10 Student Walkthrough (QA): EAI Module 1, Lesson 4 self-study (Process Mapping)

Role: simulated student, quality-assurance walkthrough.
Inputs walked, in lesson order: 02_storyboard_ch0-2.md, 05_video_scripts.md (V1, V2), 03_storyboard_ch3.md, 04_storyboard_ch4-6.md, with every screen read through its 07_ux_layout.md spec (where 07 cuts or reshapes a string, I walked the 07 version, and say so). 06_practice_studio_spec.md Part 0 was read only to judge the S19 handoff.
Facts: this file adds no content facts. Persona details (job, case topic, time of day) come from the task. Where a persona "imagines" something about her or his own case, it is labelled as a persona assumption, not a fact. Time estimates are simulated, not measured.

## The two personas

| | Persona A: Maria | Persona B: Dan |
|---|---|---|
| Role | Operations manager, non-technical | Technical |
| Language | English is her second language | Native-level |
| Situation | 9 pm after a full workday; motivated but tired | Impatient, skeptical of e-learning, looks for what he can skip |
| Homework 1 case | Purchase-order approvals | IT ticket triage |
| What she or he wants from the module | "Tell me clearly what to do, then let me do my own case." | "Show me what is new, let me prove I know the rest, get me to the deliverable." |

Rating scale: 1 = I would quit or complain, 2 = frustrating, 3 = acceptable, 4 = good, 5 = excellent, I would recommend it.

---

# Part 1. Screen by screen, two personas

Each screen has one table. Columns: what I understood I had to do (and hesitation) · what confused me · boredom or feeling patronized · words I did not understand · time · rating.

## Chapter 0: Entry

### S01 · Decision · "Choose your first move."
On screen (07 version): "Dana, HR director" · "About 90 requests a month, most of them repeat questions." · "Just put a chatbot on the HR inbox. Live next month?" · three options.

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Immediately: pick one of three buttons. The hint "Pick one. You can change your mind." removes the fear of a wrong first click at 9 pm. No hesitation. | Nothing on the card. After choosing B the feedback "Requests arrive by WhatsApp, email and in person, with no organized system" gives me facts I was never shown on the card. I accept it, but I think "how could I know that?" | No. A person asking me for something feels like my real job. | "Shortlist" (I know it, but I slowed down). | 2 min | 4 |
| Dan | Instantly. Picks B on the first try because the lesson is called Process Mapping, so the answer is obvious from the title. | Nothing. | Slightly: the "right" answer is the lesson's own name. Still, one click and done is fine. | None | 1 min | 4 |

### S02 · Input · "Bring your case from Homework 1."
On screen: "This is the case you will map in Chapter 5." · "Case title" · "The problem today" · placeholder "Today X happens, and it hurts because Y." · "Leave out names and identifying details."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | I have to type my case. Hesitation: my Homework 1 document is in my email or on another device. Nothing on screen tells me to open it before I start, so I leave the module to look for it. | "Today X happens, and it hurts because Y." Is X and Y a formula I must keep? Should I literally write "Today"? The placeholder disappears when I click, so I lose the model sentence while I type. | No. | "identifying details" (I understand, but I am not sure if the supplier name in my case counts). | 6 min (incl. finding Homework 1) | 3 |
| Dan | Clear. Pastes from Homework 1. | Why am I typing what I already submitted? (He will be asked again at S18 and a third time in the workbook, see S18 and S19.) | Mildly. | None | 2 min | 3 |

## Chapter 1: Why map

### V1 · Video "Two cases, same lesson" (2:36 + 2 stops)
Guiding question: "What separates a technology change that works from one that has to be fixed later?"

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Watch and answer. Clear from the meta chips "2:36", "2 questions", "Captions on". She switches speed to 0.75. | The guiding question is long and abstract; I forget it by second 20. Segment 5: "A reduction in service load on the scale of about 700 service reps" and the on-screen "~700 reps: scale of load reduction": I read it three times. Did they fire 700 people or not? Segment 4 "manually reconciling three separate documents": this is my world (accounts payable, approvals), but the film never says which three documents, so I guess. | No. The car company case is the best minute of the evening for me: it is my daily work. | "Obliterate" (in the article title, read aloud and on screen), "reconciling", "headcount", "entrenches" is not here but "locked in" is fine. | 6 min (slower speed, rewind once) | 4 |
| Dan | Clear. | Stop 1 arrives at 0:56 before the reveal, fine. | Yes: "First viewing: seeking forward is limited to the furthest point watched" (07 A10). He cannot skip the HBR intro he already knows. The disclaimer "for learning, not proof people should be replaced" reads to him as defensive. "Per reports" on every number makes him ask why use numbers nobody stands behind. | None | 4 min (forced) | 3 |

Stop 1 "What should it look at first?": both personas pick B ("Where the 500 people's working time actually goes"). Maria hesitates between B and A because "A faster system for its current payment checks" sounds like what her company would actually buy. Good stop.
Stop 2 "What was the root problem?": Maria hesitates. Option A "Routine and judgment cases got the same path" uses abstract words; she picks C first ("Simple requests were handled worse than by people") because she missed the line about simple requests. The feedback "Look at where the drop happened" helps her recover. Dan gets it first try.

### S03 · Decision (select two) · "Select the two causes this lesson solves."
On screen: "Lesson 1 named four causes of AI project failure. Both video cases hit at least one." · four cards.

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Pick two cards, press Check. Clear thanks to "0 of 2" and the hint. | "Both video cases hit at least one." At least one of what, the four causes? Then: the film never talked about a success metric, so why is "No success metric" correct? The feedback says "Field 8 answers it", but I have not seen any fields yet. I feel I guessed, not understood. | No. | "hit at least one" (idiom), "Unidentified end user" (heavy). | 4 min (one retry) | 2 |
| Dan | Clear. | Same logic gap: the question is not "which causes do the cases show" but "which causes does this lesson solve", which he can only answer from the course outline, not from the video. | Yes: "Unmapped process" in a process-mapping lesson is a giveaway. | None | 1 min | 2 |

## Chapter 2: Toolkit

### S04 · Sort · "Sort each HR case card into its building block."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | One card, three columns, click a column. Very clear (07 pre-selects the card, one action per card). | Card 3 "A question arrives in person" after card 1: two triggers? I thought a process has one start. The wrong-placement feedback "Requests arrive three ways. Each way is a different start" fixes it. Later doubt: "Output" is a column here, but the eight fields (S07) have no Output field. Where does my output go in my own map? | Slightly, five easy cards. | "escalate" (I know it from work), "building block". | 4 min | 4 |
| Dan | Instant. | Nothing. | Yes. Five cards that any professional sorts in 30 seconds. | None | 1.5 min | 2 |

### S05 · Explorer · "Click where the path splits." then "Open the other two parts."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | The pulse on the shapes shows me what is clickable. "Path splits" makes me look for a fork; I click a lane first, then the diamond. Hint "You only need to recognize these parts, not draw them" lowers my stress. | "Event: Start, end, and intermediate points." What is an intermediate point? The diagram shows no end and no intermediate event, so I cannot see an example. "Illustrative, built from the HR case" tag: does that mean it is not real? | No. Diagram is welcome after text. | "BPMN", "intermediate", "gateway", "swimlane" (all tooltipped; four new terms on one screen). | 5 min | 3 |
| Dan | Instant. | As a BPMN reader he notices there is no end event, which is a BPMN error in a BPMN teaching screen. | Yes: recognition-level BPMN for a technical learner. | None | 1.5 min | 2 |

### S06 · Decision (two situations) · "Pick the right format for each situation."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear, left then right. | Situation 2: "a professional BPM team". The tooltip explains BPMN, not BPM. Are they the same? | No. | "BPM", "Field template" (tooltip is "SME to approve"). | 3 min | 3 |
| Dan | Instant. | Nothing. | The answer is in the sentence ("fast first diagnosis" vs "several systems"). Easy. | None | 1 min | 3 |

### S07 · Explorer · "Open all eight fields, then find the testable one."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Flip all eight tiles, then answer. Clear because of the lock and the "0 of 8 opened" counter. | Eight new concepts in one screen at 9 pm, with eight tooltips (handoff, process owner, knowledge source owner, sensitivity tag, controls, gaps, baseline, target). Tile 5 title "Knowledge/data sources, owners, sensitivity" is a list, not a name. Question "Which field can you test later?": "test" makes me think of software testing. I pick Field 6 (controls are checks, so tests?) and get amber. | No, but overloaded. This is where I first feel tired. | "test later", "sensitivity tag", "baseline", "restricted" (in the tag tooltip). | 8 min | 3 |
| Dan | Clear. | Nothing. | Yes: forced to open eight tiles before he is allowed to answer one question he already knows. "Open each tile" is busywork for him. | None | 3 min | 2 |

### S08 · Decision (3 rounds) · "Find which AS-IS rule this draft line breaks."
Options every round: "Don't fix while mapping" / "Don't add AI while mapping" / "Don't map the official process".

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | After a pause. "draft line" is unclear: a draft of what? The template-row look helps once I see "Field 3:" in it. | Round 3 "Field 4: every escalation will be logged in one shared channel." I miss the future tense "will be", pick "Don't map the official process", and the feedback for B says "Read the verb tense: is this happening now?". Grammar is the key to this item, which is hard for a second-language reader at night. Also "Don't map the official process" makes me think I must never write down my company's official approval procedure, even when people really follow it. | No. This feels like real work. | "AS-IS" (shortened strip "AS-IS: a normal day, in practice."), "draft line". | 6 min | 3 |
| Dan | Clear. | Round 2 needs a fictional "written HR procedure" he was never told about; he accepts it. | No. First screen that makes him think. | None | 3 min | 4 |

## Chapter 3: HR demo

### V2 · Video "Mapping the HR case" (3:54 + 3 stops)
Guiding question: "How do you turn 90 messy requests a month into a map you can test later?"

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear. The map drawing itself on the left while the eight slots fill on the right is the moment the fields finally make sense to me. | Segment 5 chip "(employee)" under "Receive request": does the employee receive their own request? Segment 12 "accuracy of at least 95 percent in a QA sample": what is a QA sample? Nobody explains it. Is that a second metric? The task said one metric. | A little: trigger is "a message, a form, a date" for the third time (S04 tooltip, S07 tile, now narration). | "QA sample", "beyond known policy", "escalation". | 8 min (0.75 speed, transcript once) | 4 |
| Dan | Clear. | "Baseline: about 35 percent": he asks how it was measured. Not answered until S21 item 3 ("estimated, never logged"). | Yes. Stop 1 ("Which line belongs in Field 2, the trigger?") is the same decision as S04 card 1, twenty minutes later. Stop 3 is the same decision as S10 step 1 one minute later (07 flags this). He still cannot fast-forward. | None | 5 min | 2 |

### S09 · Sort · "Sort each card into its part of Field 5."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear (select card, then column). | Card "Internal / employee": is that one tag or two? In S07 the tooltip listed "public, internal, confidential, restricted". "Employee" is not on that list. Which list do I use for my purchase orders? "Not Field 5" column: a bin of things that are wrong is a nice idea. | No. | "Sensitivity", "internal / employee". | 4 min | 3 |
| Dan | Instant. The answers were spoken 90 seconds ago in V2 segment 8 ("vacation, pension, expense, and overtime policies... owner... HR manager... internal, employee"). | The tag inconsistency. | Yes: recall of something just heard, not a decision. | None | 1.5 min | 2 |

### S10 · Decision · "Fill Field 7 for the HR case." (07 recommended single step; Field 6 shown pre-filled)

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear: the empty dashed slot for Field 7 shows me where my answer goes. | Option d "Wrong answers are rare, per staff": I do not understand "per staff" (per person? according to staff?). If the two-step variant ships, option "A QA sample checks answers" uses the undefined term again. | No. | "per staff", "gaps". | 4 min | 4 |
| Dan | Instant. V2 segment 11 already said "Nobody knows how many wrong answers were given before". | Nothing. | Yes, mildly. If the two-step variant ships, strongly: Field 6 was just asked in V2 stop 3 with near-identical options. | None | 1.5 min | 2 (single step) / 1 (two steps) |

### S11 · Decision · "Pick the strongest success metric for the HR case."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear. The "Checkable later?" panel with three slots (start point, target, date) lighting up is the clearest feedback in the module: I see why my answer is weak. | Correct feedback: "The full HR map adds a check: accuracy ≥95% in a QA sample." So the right answer was incomplete? Is it one metric or two? | No. | "QA sample", "≥". | 4 min | 4 |
| Dan | Instant. | Nothing. | Option c "HR time on repeat questions: ~35% now, 20% in 3 months" is the longest and the only one with two numbers. Dan picks it without reading the others: the length cue gives the key away. | None | 1 min | 3 |

### S12 · Explorer (with closing check) · "Open all eight fields of the finished HR map."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear: tiles on the left, content on the right, counter "0 of 8 opened". The mini visuals (channels, chain, bar) are pleasant. I want this map next to me later when I map my own case. | Check question "A question exceeds known policy. Which field shows what happens next?" I pick Field 3 (it has "escalation" in it). Feedback: "Field 3 names an escalation step only." The difference between a step and a handoff is subtle for me; I feel tricked. | A little: this is the fourth time I see the same HR content in about 25 minutes. | "exceeds" | 6 min | 3 |
| Dan | Clear. | Nothing. | Strongly. Eight more forced clicks on a map he just watched being built and then sorted, chose and filled field by field. This is where he opens the menu to find a skip. The chapter map shows future screens as "Locked until you reach it" (07 A11). | None | 2.5 min | 1 |

## Chapter 4: Critical eye

### S13 · Decision · "Set where the HR process starts and ends."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear: each option has a Start half and an End half. The brackets drawn on the strip after my choice show me what I included and left out. | Nothing. | No. | "boundaries" (only in the feedback). | 4 min | 4 |
| Dan | Instant. | Nothing. | Option a "Start: HR writes a policy. End: everyone follows it." is not a real distractor; nobody would choose it. | None | 1.5 min | 3 |

### S14 · Decision · "Choose what the map must record at this handoff."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear. The "away" manager icon makes the situation concrete. | I pick a "A rule naming a backup manager" because that is what an operations manager does: fix it. The feedback "Your AS-IS map now shows a rule nobody follows today" is a real learning moment for me. Then the key c "Sender, receiver, what passes, fallback" is a list of nouns, not an action; I need the tooltip for "fallback". | No. | "fallback" | 6 min | 4 |
| Dan | Clear. | Nothing. | The key is the only "textbook list" option, so it stands out. | None | 2 min | 3 |

### S15 · Decision · "Choose the first question to ask about this bottleneck."
On screen (07 version): big number "~35%" · "of HR time goes to repeat questions" · "A colleague: 'Throw AI at it.'"

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear, after reading the big number. | "Throw AI at it" is an idiom; I understand it from the context, slowly. Option b feedback: "Faster technology on an unmapped process entrenches the problem." | No. The link to the car-company case in the correct feedback reminds me of my favourite part. | "bottleneck", "throw ... at it", "entrenches". | 4 min | 4 |
| Dan | Instant. | Nothing. | Key a is the only "why" question in a lesson that has said "ask why first" all evening. | None | 1 min | 3 |

### S16 · Sort · "Sort each card by AI fit."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear (same sort pattern as S09, good consistency). | Card 5 "Build on a mostly 'unclear' map" is not a task like the other five, it is an action on a map. I do not know which column it means. Card 2 "Decide a financial refund" leaves the HR case without warning. | No. | "unstructured input" and "structured output" (tooltips). | 7 min | 3 |
| Dan | Clear. | Card 4 "Bring order to three scattered channels" is keyed "AI does not fit". In his own case (IT ticket triage, persona assumption) collecting requests from several channels and classifying them is exactly where he expected AI to help. He reads the key as an opinion, and the feedback "The problem is disorder, not missing information" does not convince him. Card 1 "Tag a free-text question by topic" is the first card that maps directly onto his case: he likes it. | No. | None | 3 min | 3 |

### S17 · Sort (five bins, one case at a time) · "Sort each case into the mistake it shows."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear: one case, five bins. | Bin "Aspirational, not actual": I do not know "aspirational". Case A "Fields 6 and 7 left blank so the map was done by lunch": idiom, but clear enough. Case D "HR moved to one request form. The map still shows three channels." makes sense. | No, but five bins and a hard word at minute ~95 is tiring. | "aspirational", "rushed". | 9 min | 3 |
| Dan | Clear. | Nothing. | No. Good discrimination task. | None | 3 min | 4 |

## Chapter 5: Build yours

### S18 · Decision then Input · "Choose what may go into a public AI tool." then "Write a generalized title for your case."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Step 1 clear; the document crossing the dashed line into the cloud shows the idea. Step 2: write a title again. | My S02 title is shown in grey. What is the difference between that title and a "generalized" title? The hint example "Handling repeat HR questions" is the same example S02 used for a normal title. Then the checkbox "My map stays on paper or my own computer." The next screen opens a web workbook in my browser. Is that "my own computer"? I am not sure if I may tick the box honestly. | No. | "generalized", "de-identified" (tooltip), "public AI tool" (which tools count? my company's AI assistant? not answered). | 5 min | 2 |
| Dan | Clear. | He spots the contradiction at once: "Keep your map off external AI tools" (S19) and "stays on paper or my own computer", followed by a hosted web workbook (and, per 06 PS1, possibly a live AI coach). He ticks the box without believing it. | Mildly (title asked again). | None | 2 min | 2 |

### S19 · Handoff · "Open the workbook and map your case." (~50 min)

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear: what, tool, time, four steps, one big button. "This module keeps your place" reassures me. | The clock: I started at 9 pm and it is now about 10:40 pm (simulated). "~50 min" more is the moment I would stop for tonight, but nothing tells me this is a good place to stop. In the workbook I must type my case title a third time (06 PS6). Then the real problem: every example was HR. My purchase-order approvals have approval decisions that depend on conditions (persona assumption). The module taught the gateway diamond in S05, but the eight fields have no "decision" field. Does an approval condition go in Field 3 (steps) or Field 4 (handoffs)? The HR case answers this only for "policy exceeded". Also, my Homework 2 section 7 proposed a control. Does it go in Field 6? Nobody warns me that a proposed control is a future fix, not an existing control. | No. | "Export PDF" (fine), "AS-IS" (fine now). | 60 min (workbook) | 3 |
| Dan | Clear. | "~50 min" here, but the workbook spec plans 40 minutes (06 PS5). Which is it? His case (IT ticket triage, persona assumption) looks so similar to the HR case (requests from channels, classify topic, escalate) that he copies the HR structure field by field. Risk: his Homework 2 answer (a model classifies tickets, persona assumption) slides into Field 3 as a step. The module taught "Don't add AI while mapping" on HR lines, but never asks him to check his own Homework 2 against it. | No. | None | 30 min (workbook) | 3 |

### S20 · Decision (self-check, two steps) · "Check your map against three questions." then "Pick the mistake your case is most exposed to."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear: Yes or Not yet per row. "Not yet" never blocks, which is kind at this hour. | Row 2 "Does Field 4 say what happens if information arrives late?" S14 taught "fallback" as what happens if the receiver is unavailable, not if information is late. Are these the same? I answer "Not yet" and reopen the workbook. | No. | "fallback" (in feedback). | 8 min (incl. one fix in the workbook) | 4 |
| Dan | Clear. | Nothing. | He clicks "Yes" three times in ten seconds. Nothing checks him. The self-check is honest-system only. | None | 2 min | 2 |

## Chapter 6: Close

### S21 · Knowledge check (5 items) · "Choose one. First answer counts." / item 5 "Spot two errors in this AI draft."

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Clear: first answer counts, one per card. Item 5: select two tiles, then Check. | Item 1 option "What passes, and the fallback if unavailable": fallback again. Item 4 option c "Field 8: target zero wrong answers" sounds correct to an operations manager (zero errors is a real target). Final "[n] of 5 on first try": is 3 a pass? Nobody says. | No. Item 5 (finding the chatbot and "Significant improvement in answers" in the AI draft) is the most satisfying screen: I feel I can now judge a map. | "fallback", "AI draft". | 15 min | 4 |
| Dan | Clear. | No pass mark (04 NF7). | Items 2 to 4 repeat earlier screens almost word for word: item 2 key "Tagging each free-text question by topic" is S16 card 1; item 3 repeats S11; item 4 repeats S10. Recognition, not transfer. Every item is the HR case again. Item 5 he likes. | None | 6 min | 3 |

### S22 · Close (three steps) · takeaway, layer match, record and homework

| | Task understood | Confused by | Bored / patronized | Words | Time | Rating |
|---|---|---|---|---|---|---|
| Maria | Step 1 clear (any choice is fine). Step 2: match fields to "Process steps / Data flow / Knowledge layer / Monitoring layer". Step 3: download, then finish. | Step 2 introduces four new terms in the last five minutes of a three-hour evening. "Data flow" for handoffs (04 NF8) is not obvious. Step 3: "Complete your map into a full, organized document." I just finished my map and exported a PDF. Is it not complete? What is the difference between my PDF, my "lesson record" and this "document"? The confirm "Finish without downloading? Your record stays unsaved." scares me: did I lose my work? | No. | "layer", "intervention point" (tooltip), "Monitoring layer". | 8 min | 2 |
| Dan | Clear. | The homework task 2 "Mark three AI intervention points, using the three good-fit kinds": he wants the three kinds listed; they appeared only as tooltips and feedback in S16. | Step 1 "Pick the takeaway your own map proves most" with no right answer feels like filler. | None | 3 min | 3 |

---

# Part 2. Totals

## Simulated time

| Chapter | Plan (02/03/04) | Maria | Dan |
|---|---|---|---|
| Ch0 Entry | 6 | 8 | 3 |
| Ch1 Why map | 8 | 10 | 5 |
| Ch2 Toolkit | 22 | 26 | 10 |
| Ch3 HR demo | 25 | 26 | 11.5 |
| Ch4 Critical eye | 32 | 30 | 10.5 |
| Ch5 Build yours | 65 | 73 | 34 |
| Ch6 Close | 22 | 23 | 9 |
| **Total** | **180** | **~196** | **~83** |

Note: the plan's own chapter numbers disagree across files (02 proposed Ch3 30 and Ch6 17; 03 and 04 settled Ch3 25 and Ch6 22). The table uses 03/04.

## Average rating (simple mean of screen ratings)

| | Ch0 | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | Module |
|---|---|---|---|---|---|---|---|---|
| Maria | 3.5 | 3.0 | 3.2 | 3.6 | 3.6 | 3.0 | 3.0 | ~3.3 |
| Dan | 3.5 | 2.5 | 2.6 | 2.0 | 3.2 | 2.3 | 3.0 | ~2.7 |

Pattern: Maria's ratings fall where vocabulary and overload pile up (S03, S07, S18, S22). Dan's ratings fall where the same HR content is asked again (S09, S10, S12) and where he cannot skip (V1, V2, S07).

---

# Part 3. The 5 worst moments

1. **Chapter 3 repeats the same HR map four to five times (V2, S09, S10, S11, S12).** V2 fills all eight fields; S09 asks Field 5 that V2 said 90 seconds earlier; S10 asks Field 6 or 7 that V2 just answered (07 already flags the Field 6 duplicate with V2 stop 3); S12 then asks for eight more clicks on the same map. Dan rates S12 a 1 and looks for a skip. Maria is fine with seeing it twice, not four times, and it eats her energy right before Chapter 4 and the workbook.
2. **S19 arrives when Maria is most tired and gives no help to transfer from HR to a different kind of case.** All practice is on one HR case. Nothing on S19 says which Homework 1 and Homework 2 sections feed which field (for example HW1 section 5 "current process" and section 8 "what is still unclear"), and nothing warns that the HW2 section 7 "minimum control" is a future fix that must not go into Field 6, or that the HW2 section 2 model step must not go into Field 3. The case title is typed a third time. The time chip says "~50 min" while 06 plans 40.
3. **S18's safety promise contradicts the next click.** "My map stays on paper or my own computer." is followed by a web workbook (and possibly a live AI coach, 06 PS1). Dan does not believe it; Maria does not know if she may tick it honestly. A safety gate that learners tick without believing teaches them to ignore safety gates.
4. **S03 rewards guessing.** The context line says the video cases "hit at least one" cause, but the video never mentions a success metric, and the feedback for the correct card refers to "Field 8", a concept the learner has not met. Maria feels she guessed; Dan finds "Unmapped process" in a process-mapping lesson a giveaway.
5. **S22 opens new concepts and new confusion in the last minutes.** Four Lesson 5 layer terms appear at minute ~175, "Data flow" for handoffs is an interpretation (NF8), the homework "Complete your map into a full, organized document" blurs with the PDF just exported, and "Your record stays unsaved" sounds like lost work.

Close runners-up: S07 forces eight flips before one question (Dan); S16 card 4 "Bring order to three scattered channels" keyed as "AI does not fit" reads as opinion to a technical learner; S08 round 3 depends on reading the future tense "will be".

# Part 4. The 3 best moments

1. **S01, the first click.** A person, a request, three buttons, "You can change your mind." Zero setup, real-world tension, the lesson's whole argument in one decision.
2. **V1 stop 1 and the car-company reveal (with the echo in S15's feedback).** For Maria, "manually reconciling three separate documents" is her own job; the stop asks her to decide before the reveal; S15 later reuses it ("mapping showed a step could be removed, not sped up"). This is where both personas buy the "map first" argument.
3. **S21 item 5, the AI draft with two seeded errors.** The only moment where the learner judges a whole map, not a single field, and it is about an AI output, which is what both personas will face at work. Runner-up: S11's "Checkable later?" three-slot indicator, which makes "baseline, target, date" visible instead of explained.

# Part 5. Do the 180 minutes feel right?

- **As a total, roughly yes for Maria (~196), far too much for Dan (~83).** The plan is built for the middle learner; it has no fast lane and no slow lane.
- **As one sitting, no.** For Maria at 9 pm, 180 to 196 minutes in a row is not realistic. Her most important task (the workbook) lands at about minute 100 to 160, when she is least able. Nothing in the module marks natural stopping points, even though resume exists (07 A11).
- **The balance inside the 180 is off.** Chapters 2 and 3 together spend ~47 planned minutes, much of it re-presenting the same eight fields on the same HR case (S04, S07, V2, S09 to S12). Chapter 5, the actual deliverable, gets 65. A few minutes moved from Ch3 repetition to a transfer step before S19 would serve both personas.
- **Dan's 83 minutes are a risk, not a win.** He finishes the workbook in about 30 minutes because his case is close to the HR case and he copies its structure. The module checks completion, not quality, so a shallow map passes.

# Part 6. Would I arrive at the Practice Studio workbook ready to map my own case?

**Maria: partly.** She understands the eight fields, the AS-IS rules and why "unclear" and "no formal control" are valid answers. She is not ready on three points: (1) she has never seen the fields filled for a case that is not HR, so she does not know where an approval condition goes (Field 3 or Field 4); (2) she does not know how to use her Homework 1 and 2 documents as input; (3) the tag vocabulary is inconsistent (S07 four tags vs S09 "internal / employee"), so Field 5 will stall her. She is also simply tired.

**Dan: ready in mechanics, not in judgment.** He knows the template cold. The danger is that his case looks like the HR case, so he pattern-matches instead of mapping what really happens in his team, and that his Homework 2 AI step leaks into his AS-IS map. Nothing before S19 asks him to check his own homework against the AS-IS rules.

---

# Part 7. Concrete improvement suggestions

Ordered by impact. Each says which persona it helps and stays within the sources.

## Structure and time
1. **Cut Chapter 3 repetition.** Keep V2 and S11. Make S12 the reference card only (it already is the "HR map" tab, 07 A11) or replace its eight forced opens with the closing check alone. Keep S10 as the single Field 7 step (07 N1). Remove V2 stop 1 or change it, since S04 already tests trigger vs step. Saves ~8 to 10 minutes. (Dan, Maria)
2. **Add a transfer step before S19 using a non-HR case from the sources.** The Lesson 1 booklet already holds five other cases: Case 2 "Triaging customer service requests" (close to Dan's case), Case 5 "Preparing the weekly management report" (an operations manager, close to Maria's role). One short Decision or Sort on one of them (for example "Which field does this line belong in?") would show the template working outside HR. 04 plan change 6 already proposes a booklet-case item for S21; use it before the workbook too. (Both)
3. **Mark two stopping points.** After Ch2 (~36 min) and after Ch4 (~93 min), show a feedback-row line such as "A good place to stop. Your place is saved." (no praise, just status). Recommend starting Ch5 in a fresh session. (Maria)
4. **Give Dan a legitimate fast lane.** Allow free seeking in videos for learners who answer each stop correctly on the first try, or after the first stop; unlock the S07 question at any time instead of after eight flips; let the S12 tiles be optional. Keep scoring in S21 as the gate. (Dan)

## S19 and the workbook
5. **Add a "have these open" line to S19:** Homework 1 sections 4, 5, 7, 8 and Homework 2 sections 2 and 7. Add one warning in the workbook: "Your Homework 2 control and model step are future ideas. They do not go in Fields 3 or 6." This connects S08's AS-IS rules to the learner's own documents. (Both, especially Dan)
6. **Pass the S02 title and problem statement into the workbook** or show them on S19, so nobody types the title three times (S02, S18, workbook field 0). If the workbook cannot read them (06 PS6), show them on S19 with a copy button. (Both)
7. **Align the time:** S19 "~50 min" vs workbook 40 min (06 PS5). Pick one. (Both)
8. **Answer "where do decisions and conditions go?"** in the workbook help for Field 3 and Field 4, using the HR example "when policy is exceeded" as the pattern. (Maria)

## Wording for second-language readers
9. Replace or tooltip these: "Obliterate" (V1, keep the title but add a spoken gloss), "on the scale of about 700 service reps" (say what it means in plain words, keeping "per reports"), "hit at least one" (S03), "Throw AI at it" (S15), "entrenches" (S15 b), "done by lunch" (S17 A), "per staff" (S10 d), "Aspirational, not actual" (S17 bin, consider "How it should work, not how it works"), "draft line" (S08 instruction). (Maria)
10. **S08 round 3:** do not make the key depend on a verb tense. Make the "fix" explicit, for example by adding "(new rule)" or by stating the change as a decision someone made. (Maria)
11. **"Test later" (S07)** reads as software testing. Consider "check later" or "measure later", which S11 already uses ("Checkable later?"). (Maria)

## Item quality
12. **S03:** either key only on what the video shows, or change the context line to "Which two does this lesson work on?" and drop "Field 8" from feedback. (Both)
13. **S11:** equalize option lengths; c is the only long, two-number option. (Dan)
14. **S13 option a** is not plausible; replace with a near miss (for example a boundary that starts correctly but ends at "checking the topic" with a different start). (Dan)
15. **S16 card 4:** reword so the key is not debatable, or add to the feedback why channel disorder is a process problem first. Test with a technical learner. (Dan)
16. **S16 card 5** "Build on a mostly 'unclear' map" is an action, not a task; rephrase to match the other cards. (Maria)
17. **S20 row 2** "arrives late" vs S14 "unavailable": use the same idea in both. (Maria)
18. **S21:** make at least one item a transfer item on a non-HR booklet case, and state what the score means (04 NF7). (Both)

## Consistency and trust
19. **S18 checkbox and S19 safety line** must match what the workbook really does (07 N8, 06 PS1). Until Noy decides, do not ship a box the learner cannot tick honestly. (Both)
20. **One tag vocabulary** across S07, S09, V2, the reference card and the workbook (FL6 / PS2). (Maria)
21. **"QA sample":** define it or remove it from V2 segment 12, S11 feedback and S12. Observation for the SME: Homework 2 section 7 lists "Sample checks and quality control" as a control option, which may be the intended meaning; SME to confirm before it is used as a tooltip source. (Maria)
22. **"(employee)" as the owner of "Receive request"** (FL9) confused Maria in V2 and S12; resolve it with the SME before recording V2.
23. **S22:** move the four-layer match earlier or make it optional; rename homework task 1 so it is clearly different from the exported PDF; change "Your record stays unsaved" to say plainly that the workbook PDF is not affected. (Maria)
24. **BPMN end event (S05):** either draw an end event or remove "end" from the Event definition, so a BPMN-literate learner does not see an error in the teaching screen. (Dan)
