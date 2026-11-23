# 01 Content Analyst: EAI Module 1, Lesson 4 (Process Mapping)

Sources read in full: src/L04_deck.txt (46 slides incl. trainer notes), src/HW1.txt, src/HW2.txt, src/L01_booklet.txt.
Slide references are written "s" + number (s20 = slide 20). Booklet = L01_booklet, HW1/HW2 = homework files.

---

## 1. FACT SHEET

### 1.1 Lesson framing and deliverable
| # | Fact (as the source gives it) | Source |
|---|---|---|
| F1 | Lesson title: "Process Modeling and Workflow Mapping". Subtitle: "From a personal task to a mapped organizational process". | s1 |
| F2 | Opening quote: "Don't accelerate a broken process. Take it apart first." | s1 |
| F3 | Module path: L1 case diagnosis and the five components; L2-3 language model, limits, working template; L4 a full process map; L5 integrative architecture diagram; L6 Build vs Buy and implementation canvas. | s2 |
| F4 | Central sentence (deck: "worth repeating twice"): "Process mapping is not a bureaucratic step. It is what separates a change that works from a change that has to be fixed after the fact." | s3 |
| F5 | Deliverable, also "the entry ticket to Lesson 5": (a) a full AS-IS process map, eight fields, own case, "as the process actually happens, not as it is supposed to"; (b) one success metric, measurable, with a baseline and a clear quantitative target, "not 'significant improvement'". | s4, s35 |
| F6 | Five learning outcomes: identify roles and handoff points; map knowledge sources, ownership and sensitivity; mark existing controls and gaps (incl. 'unclear'); define a measurable success metric with quantitative baseline and clear target; identify decision points and problematic handoffs and tell when AI fits vs when human judgment is required. | s39 |
| F7 | Three takeaways: (1) Mapping is a condition, not bureaucracy; (2) 'Unclear' is a legitimate answer, "not a failure of the mapper, but a diagnostic result"; (3) Not every bottleneck needs acceleration, "sometimes the right fix is to remove the step, not speed it up". | s45 |

### 1.2 Why map: failure causes, principle, research
| # | Fact | Source |
|---|---|---|
| F8 | Four causes of AI project failure (from Lesson 1): unclear problem; unmapped process; unidentified end user; no success metric. Unmapped process and no success metric are "addressed today". | s5, s40; HW1 context ("poor definition of the problem, the process, the end user, and the success metrics") |
| F9 | "Faster technology applied to a process that was never properly mapped does not just fail to solve the problem. It entrenches it, faster and at larger scale." | s6 |
| F10 | Hammer's Principle, deck label "Don't Accelerate, Deconstruct": organizations that run new technology on an existing broken process without taking it apart first "only accelerate the inefficiency they already have". | s7 |
| F11 | Source: "Reengineering Work: Don't Automate, Obliterate", Harvard Business Review, 1990. Written about ordinary computing; deck applies it to AI: "an agent run on an unmapped process does not fix the problem, it just automates the mess faster." | s7 |
| F12 | Gartner: "Process discovery is a precondition for any advanced automation." (no year given) | s8 |
| F13 | McKinsey (2025): "Redesigning workflows is the single biggest factor separating organizations that turn AI investment into value from those that do not." | s8 |
| F14 | "Leading reports repeat it: AI value depends not only on adopting the tool, but on redesigning workflows and discovering processes." | s8 |

### 1.3 Definitions and building blocks
| # | Fact | Source |
|---|---|---|
| F15 | Process Mapping: "A sequential, explicit, visual description of how work actually flows. For each step: who is responsible, what goes in and out, and what happens if something breaks." | s9 |
| F16 | Process Modeling: "The broader term. It includes mapping, plus representing the process in a structure you can analyze and reproduce." | s9 |
| F17 | Three building blocks: Trigger = what starts the process ("a message, a form, a date"); Steps = path from trigger to result, "three to seven steps are usually enough"; Output = what comes out at the end, "and to whom exactly". | s10 |
| F18 | ISO 9001:2015 process definition: "a set of related activities that use inputs to produce an intended output." Four management steps: identify processes; define inputs, activities, outputs; assign ownership; measure and improve. | s11 |
| F19 | BPMN at recognition level only ("recognize ... not draw a standard-compliant diagram"): Swimlanes = who does what, each role in its own lane; Gateways = a decision point, the path splits by condition; Events = start, end, intermediate points. | s12 |
| F20 | Field template: when the mapper knows the process and the goal is a fast decision; fits initial diagnosis and individual work. BPMN: when the map must be a shared basis across tools, systems and professional BPM teams. "In this lesson you learn to see a process, not to draw it in a standard form." | s13 |
| F21 | Eight-field template, "in the same spirit as the five-field template you already know": 1 Process name; 2 Trigger; 3 Steps and role owners; 4 Handoffs; 5 Knowledge/data sources, owners, sensitivity; 6 Existing controls; 7 Gaps; 8 Success metric: baseline and target. | s14 |
| F22 | Field 5 sensitivity tags: PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED. | s14 |

### 1.4 AS-IS rules
| # | Fact | Source |
|---|---|---|
| F23 | "Today we map AS-IS, we do not redesign." Three rules: Don't fix while mapping (record a wrong-looking step as it is, fix later); Don't add AI while mapping (map = current state, AI is a future step); Don't map the official process (if the real process differs from the written procedure, map what actually happens). | s16 |
| F24 | "AS-IS = as it happens now, in practice, on a normal day." | s16 |
| F25 | "Important: map how it actually happens, not how it is 'supposed' to work." | s17 |

### 1.5 Boundaries, owners, inputs/outputs, decisions, handoffs, bottlenecks
| # | Fact | Source |
|---|---|---|
| F26 | "Deciding where a process starts and ends is a decision, not a given." Ask: what external trigger starts this, and what output does someone else pick up afterward? | s21 |
| F27 | Without boundaries a process "'swells' until it includes almost the whole organization. Impossible to map or manage." With clear boundaries it "can be mapped, managed, and improved." | s21 |
| F28 | APQC's PCF organizes processes into 13 top categories. | s21 |
| F29 | Two kinds of ownership: of the process itself (responsible for it working and finishing successfully, start to end) and of a specific knowledge source (keeps a policy or document current and correct; note the owner next to each source on the map). Explicit requirement in ISO 9001, part of the Plan-Do-Check-Act (PDCA) cycle. | s22 |
| F30 | Most natural place for AI: an unstructured input (free text, a document, a request) needs processing to become a structured output (a classification, a summary, a draft reply). | s23; s40 links to L2 (summary, classification, extraction) |
| F31 | Simple decisions can go to an automated rule or a language model, e.g. "classifying a request as urgent or routine". High-risk decisions require clear human judgment: money, rights, safety, irreversible consequences. Mapping marks where high-risk decisions sit, the points needing extra control before AI. | s24 |
| F32 | Handoff = "the moment responsibility passes from one role to another". Hidden assumption: the receiving side knows exactly what happened before, "and that assumption is not always true". Good map marks each handoff: from whom to whom, what exactly passes, what happens if the receiving side is unavailable. Deck title: "the most dangerous moment in a process". | s27 |
| F33 | Bottleneck: "a step limited by the slowest resource." Usual instinct: "There's a bottleneck, let's throw AI at it and speed it up." Right question: why did it form? "Sometimes the right fix is to remove the step, not speed it up." | s28, s45 |

### 1.6 Where AI fits / does not fit
| # | Fact | Source |
|---|---|---|
| F34 | Three good-fit places: (1) Unstructured to structured: steps where free text, a document or a request needs classification, summary or extraction; (2) Low-risk decision points: can be accelerated, with human oversight where risk is higher; (3) Handoffs with delay or loss: AI as a translation and documentation layer between roles. | s32 |
| F35 | Three poor-fit places: (1) Irreversible consequences: financial, legal, safety, require clear human judgment; (2) A process problem: when the problem is disorder, not missing information, AI will not solve the underlying issue; (3) A map full of 'unclear': "You cannot build a solution on unknown foundations. This needs diagnosis, not more technology." | s33 |
| F36 | HW2 support: outputs that affect people, money, rights, or decisions all require a control; decisions to keep with a person include eligibility, financial refund, legal, medical, HR decision, official commitment, approval required by law, irreversible consequences. | HW2 context, section 8 |

### 1.7 Named cases (keep hedging exactly)
**Swedish fintech (company NOT named in deck; do not name it)**
| # | Fact | Source |
|---|---|---|
| F37 | "A real case: a Swedish fintech, per public reports (2024-2025)". | s25 |
| F38 | "2.3M calls a month handled by an AI agent, per reports." (FLAG: use "conversations"; see Flags) | s25 |
| F39 | "~700 service reps: the scale of the reduction in service load, per reports." | s25 |
| F40 | "Handling time dropped from ~11 minutes to under two, per reports." | s25 |
| F41 | Disclaimer: "Figures are based on the company's publications and media reports; the example is for learning, not proof that employees should be replaced." | s25 |
| F42 | "Per reports, by early 2025 the company started rehiring human service reps." Simple requests: AI performance similar to humans. Complex requests (disputes, personally difficult cases): resolution quality "dropped noticeably". | s26 |
| F43 | "Management admitted that over-focusing on efficiency hurt service quality. The fix: a hybrid model, AI for the routine, a person when empathy and judgment are needed." | s26 |

**US car company accounts payable (companies NOT named; do not name them)**
| # | Fact | Source |
|---|---|---|
| F44 | Early 1980s, accounts-payable department at a US car company: 500 employees. Equivalent department at a Japanese company: 100, "five times fewer". | s29 |
| F45 | "The gap was not closed by faster systems for the existing process. Mapping revealed the real reason." | s29 |
| F46 | Before: manual reconciliation between three documents. After: payment triggered directly from the receipt record, with no separate invoice. | s30 |
| F47 | "Most of the work went to manually reconciling three separate documents." After rewriting, "the required headcount fell by about 75%, per reports." | s30, s31 |

**Synthesis**
| F48 | "Thirty-five years apart. Completely different technology. Exactly the same lesson: mapping before a technology change separates a change that works from one that has to be fixed after the fact." Fintech: "acceleration without distinguishing decision types led back to a hybrid model, per reports." (FLAG on "35 years") | s31 |

### 1.8 Common mistakes, metrics, unclear
| # | Fact | Source |
|---|---|---|
| F49 | Five common mistakes: (1) mapping the aspirational state instead of the actual state; (2) no clear goal for the mapping; (3) rushing the mapping itself; (4) neglecting to update the map after changes; (5) automating a broken process, "the most critical". Reflection prompt: "Which of the five are you most exposed to in your case?" | s34 |
| F50 | Success metric: measurable ("not a feeling, but a number, percentage, time, or frequency"); Baseline: "The current state, even if estimated. An estimated metric beats no metric at all."; Target: "specific, realistic, checkable later." | s37 |
| F51 | Field 8 "turns the map into something you can test later: not a feeling, a number." | s19 |
| F52 | 'Unclear' is "a legitimate diagnostic answer", "not a failure of the mapper". Record it explicitly in Field 7; it tells you what to investigate before Lesson 5 "and what not to build architecture on yet". | s38, s19; booklet ("any diagnosis that surfaces 'unclear' is successful work") |
| F53 | "'No formal control' is a perfectly valid answer, it is exactly what the mapping is meant to reveal." | s18 |

### 1.9 Activity, peer review, data safety, bridge, homework
| # | Fact | Source |
|---|---|---|
| F54 | Classroom activity, 40 min: 25 individual (fill eight fields) + 10 peer review (clarifying questions only) + 5 plenary (2-3 share, focus on gaps field); plus "Define a success metric" step (no time given). | s35 |
| F55 | Peer review: "Your partner is not there to check whether you did it right. They are there to help you see what is still unclear to you." Three questions: Who exactly does each step? What happens if the information does not arrive on time? How will we know the metric improved? | s36, s43 |
| F56 | Appendices: blank eight-field worksheet with prompt line per field and a success-metric row; worked HR example "for self-review after the lesson"; peer-review card; pre-submission yes/no check: every field filled, the metric measurable, no invented answers. | s43 |
| F57 | Data safety: personal process map on paper or own computer, "not uploaded to any external AI tool". Lesson 3 rule: "if unsure it is allowed to upload, don't." If needed use a generalized, de-identified version: no names, no identifying data, no specific internal policy. Info tagged 'personal', 'employee', or 'financial' is not uploaded to a public tool. | s44 |
| F58 | Bridge to L5 architecture layers: process steps (map is the basis); data flow (information moving between steps); knowledge layer (knowledge sources and owners); monitoring layer (success metrics and baseline). In L5 "we mark on this exact map: where AI enters, what it consumes, and where a human stays in the loop." | s41, s46 |
| F59 | Homework for L5: length one to one and a half pages. (1) Complete the process map into a full, organized document; (2) Identify three AI intervention points, "based on the three good-fit kinds". "Without this full map, Lesson 5 cannot run for you." | s42 |
| F60 | Connections: L1 case is the raw material; L2 unstructured vs structured builds on LLM strengths (summary, classification, extraction); L3 "nine-field template and seven questions" asked at single-step level are answered here at whole-process level. | s40 |

### 1.10 Learner case continuity (HW1, HW2)
| # | Fact | Source |
|---|---|---|
| F61 | HW1 section 1 title: 3 to 6 words; examples incl. "Handling repeat HR questions". | HW1 |
| F62 | HW1 section 3: "Today X happens, and it hurts because Y." Describe current situation, not the solution. | HW1 |
| F63 | HW1 section 5: current process in 3 to 5 steps (who starts it, middle, how it ends); section 7 pain points; section 8 what is still unclear; section 4 specific end-user role. | HW1 |
| F64 | HW1: same use case travels through the module; "do not switch without the instructor's approval." Check item: "Did I avoid jumping straight to 'let us build a chatbot' or 'let us use AI'?" | HW1 |
| F65 | HW2: one specific step where an LLM helps, its output, required info, at least 3 errors, worst harm, minimum control, what the model cannot decide. "Do not propose a full technical architecture yet." | HW2 |

---

## 2. HR CASE CANON (single version for all writers)

### 2.1 Origin (Lesson 1 booklet, Case 1 "Repeat questions to Human Resources")
- HR department at a services company with 400 employees (deck s15: "about 400 employees").
- Receives about 90 requests a month. "Most questions repeat": vacation days, pension terms, expense submissions, overtime policy.
- HR staff say this takes 30 to 40 percent of their time and keeps them from handling more complex matters.
- Requests arrive by WhatsApp, email, and in person, "with no organized system".
- Unclear how many requests need human judgment; unclear what happens when a wrong answer is given.
- Booklet reminder: "Do not jump straight to 'let us build a chatbot.'"
- Booklet gives no company name, no person names, no HR director name.

### 2.2 The eight-field map (canonical = s20, with s17-s19 detail where s20 abbreviates)
| # | Field | Canonical content | Source / note |
|---|---|---|---|
| 1 | Process name | Answering employees' repeat questions to HR | s17, s20 |
| 2 | Trigger | An employee sends a question by WhatsApp, email, or in person | s17 (s20 short form: "A question by WhatsApp, email, or in person") |
| 3 | Steps and role owners | Receiving the request (employee) → checking the topic (HR staff) → answer or escalation (HR staff / manager) | s17 (s20: "Receiving to checking to answer / escalation"). Arrows are written "to" in the deck. See Flag FL9 on "(employee)". |
| 4 | Handoffs | From regular HR staff to the HR manager, when the question exceeds known policy | s17 (s20: "From HR staff to HR manager when policy is exceeded") |
| 5 | Knowledge/data sources, owners, sensitivity | Vacation, pension, expense, and overtime policy. Owner: HR manager. Sensitivity: internal / employee | s18 lists overtime; s20 omits overtime and adds sensitivity. Recommend including overtime (consistent with booklet). See FL6, FL7. |
| 6 | Existing controls | No formal control; it depends on the personal judgment of the HR staffer who received the request | s18 (s20: "No formal control") |
| 7 | Gaps | No way to know how many wrong answers were given before; there is no single organized handoff channel | s19 (s20: "Unclear how many wrong answers were given; no single handoff channel") |
| 8 | Success metric | Baseline: about 35% of HR team time goes to repeat questions. Target: 20% within 3 months, accuracy ≥95% in a QA sample | Baseline s19, s20; target only on s20. See FL8. |

Teaching notes attached to the demo in the deck:
- s17: "map how it actually happens, not how it is 'supposed' to work."
- s18: "'No formal control' is a perfectly valid answer."
- s19: Field 7 "is where it is allowed, even desirable, to write 'unclear'." Field 8 "turns the map into something you can test later: not a feeling, a number."
- s43: the worked example is described as "a full, correct map of the hypothetical case".

Writers must not add: an HR director name, a company name, a chatbot vendor, request counts per channel, or any number not listed above.

---

## 3. SLIDE-TO-SCREEN MAP

| Screen | Feeding slides / files | Source support |
|---|---|---|
| S01 Decision (Dana, map first) | s15, s6, s7; booklet Case 1 (90 requests, channels, chatbot warning, instructor note); HW1 check item | Partial. "Dana", "HR director", "chatbot on the HR inbox", "live next month" are not in sources (FL1). Booklet says ~90 requests a month, "most" repeat, not "90 repeat questions" (FL2). |
| S02 Input (case title + problem) | HW1 sections 1, 3; s4; s40 (L1 case is raw material); s44 data-safety line | Full. |
| V1 "Two cases, 35 years apart" | s6, s7, s25, s26, s29, s30, s31 (s8 optional) | Full for facts; "35 years" questionable (FL3); "calls" wording (FL4). |
| S03 Two of four failure causes | s5, s40 (L1 link), HW1 context | Full. |
| S04 Sort Trigger / Steps / Output | s10, s9 (tooltip), s11 (inputs/outputs) | Full for definitions. Card items must come from HR case or booklet cases (e.g. "A question by WhatsApp", "checking the topic", "answer"). Output of HR process ("answer to the employee") is implied, not stated as a field (FL13). |
| S05 Explorer BPMN | s12, s13 | Definitions only. No BPMN diagram exists in sources; any visual must be drawn from HR case fields 3-4 (lanes: employee, HR staff, HR manager; gateway: "exceeds known policy?"). No HR "events" are specified; start = trigger is derivable, end/intermediate not stated (FL14). |
| S06 Decision field template vs BPMN | s13 | Full. |
| S07 Explorer eight fields | s14, s22 (owners), s11 | Full. |
| S08 Decision AS-IS violation | s16, s17 note, s34 mistake 1 | Full for rules; scenarios need to be built on HR case. |
| V2 "Mapping the HR case" | s15, s16, s17, s18, s19, s20; booklet Case 1 | Full. |
| S09 Sort field 5 sensitivity tags | s14 (tag set), s20 ("internal / employee"), s44 ('personal', 'employee', 'financial') | WEAK. Only one HR source is tagged in the deck, and the deck uses two different tag vocabularies (FL5). No source assigns tags to sample items; any sort answer key is the writer's interpretation. SME must approve the key or the screen should be reshaped. |
| S10 Decision controls and gaps | s18, s19, s38, s33 (map full of unclear) | Full. |
| S11 Decision strongest success metric | s4 ("not 'significant improvement'"), s19, s20, s37, s36 Q3 | Full. |
| S12 Explorer full HR map | s20 (+ s17-s19), s43 item 2 | Full. Must be paired with an interactive screen on each side (rule 8). |
| S13 Decision process boundaries | s21, s10 | Full for principle; APQC number needs SME check (FL11). |
| S14 Decision handoff failure | s27, s17 field 4, s19 field 7 ("no single handoff channel"), s36 Q2 | Full. |
| S15 Decision accelerate or eliminate | s28, s29, s30, s45 #3 | Full. |
| S16 Sort AI fits / doesn't fit | s23, s24, s32, s33, s26; HW2 section 8 | Full. |
| S17 Sort five common mistakes | s34, s16 | Partial. Deck gives only the five titles, no definitions or examples; diagnosis scenarios must be constructed (FL12). |
| S18 Input data-safety gate | s44, s14 tags; HW1/HW2 no-PII practice | Full. |
| S19 Handoff to Practice Studio | s35 steps 1 and 3, s14, s37, s43 items 1 and 4, s44 | Full for content. Workbook tool name, time on task (~65 min chapter) not in sources (FL15). |
| S20 Return + self-check | s36 (3 questions), s43 item 4 check sheet, s34 reflection question, s38 | Full. |
| S21 Knowledge check | s10, s16, s21, s24, s27, s28, s32, s33, s34, s37 | Content supported. The AI-generated process map with errors has no source artifact; it must be constructed from the HR canon with errors drawn from s16 and s34 (FL16). |
| S22 Takeaways + bridge + homework | s45, s41, s46, s42; s2 (module path) | Full. "Download my lesson record" is a module feature, no source content needed. |

---

## 4. OMISSIONS (slides that will not appear as screens)

| Slide | What | Reason |
|---|---|---|
| s1 trainer notes + SME/translation notes | Opening script, Hebrew title, image spec | Belong to a different lesson (L2/L3 content), trainer-only (FL10). Title and quote on s1 can be used. |
| s2 | Module path | Navigation info; can go into menu/S22 bridge, not its own screen. |
| s3 trainer note "worth repeating twice" | Delivery instruction | Trainer guidance; the sentence itself is used (V1 close or S22). |
| s8 | Gartner / McKinsey research | Not in plan; optional V1 line or S03 feedback. Citation details incomplete (FL11). |
| s9 | Mapping vs modeling | No screen; use as tooltip definitions (S04/S07). |
| s11 | ISO 9001 process approach | No screen; tooltip on "process" and support for owners in S07. |
| s15 | "Live demo" framing | Replaced by V2. |
| s22 | Process owners | No dedicated screen; feeds S07 field 3/5 tooltips and S12. |
| s35 pair and plenary parts (10 + 5 min) | Classroom logistics | No partner or plenary in self-study; peer questions become self-questions in S20. |
| s36 "Your partner..." framing | Pair logistics | Reworded as self-check. |
| s39 | Learning outcomes | Not in screen plan. Recommend showing them briefly (e.g. menu or S02/S22), see FL17. |
| s40 | Connection to previous lessons | Partly used in S02/S03; L3 "nine-field template" reference omitted to avoid confusion (FL18). |
| s43 item 3 | Peer-review card | Pair logistics; items 1, 2, 4 map to workbook, S12, S20. |

---

## 5. FLAGS

| ID | Type | Issue | Recommendation |
|---|---|---|---|
| FL1 | Invented detail | S01 approved microcopy introduces "Dana", "HR director", "chatbot on the HR inbox", "live next month". None in sources. Booklet has no director character. | Noy/SME to approve the persona as a framing device, or rewrite without a name. Do not let other screens or videos repeat "Dana" facts as case data. |
| FL2 | Number mismatch | S01 says "90 repeat questions a month". Booklet: "about 90 requests a month. Most questions repeat." | Use "about 90 requests a month, most of them repeat questions". |
| FL3 | Unverified claim | S01 correct feedback: "Requests come in three ways with no owner." Sources say three channels "with no organized system" and "no single organized handoff channel"; the knowledge owner IS named (HR manager). "No owner" is wrong. | Use "Requests come in three ways with no organized system." |
| FL4 | Number / wording | s25 "2.3M calls a month": public reporting describes chat conversations (known brief flag). | Write "2.3M conversations a month, per reports"; SME verify. |
| FL5 | Arithmetic | s31 "Thirty-five years apart": early 1980s to 2024-2025 is about 40 to 45 years. 35 years matches Hammer's 1990 article to 2025, not the two cases. V1 title "Two cases, 35 years apart" inherits the error. | SME decide. Safe neutral title: "Two cases, four decades apart" or "Two cases, same lesson". |
| FL6 | Contradiction | Sensitivity tag vocabulary differs: s14 PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED; s20 "internal / employee"; s44 'personal', 'employee', 'financial'. "employee" is not one of the four s14 tags. | SME choose: likely four levels from s14 plus data-type labels from s44. S09 and S18 must use one consistent scheme. |
| FL7 | Inconsistency | Field 5 on s18 lists "vacation, pension, expense, and overtime policy"; s20 drops overtime. s18 gives no sensitivity tag; s20 adds it. | Canon uses s18 list + s20 tag (section 2.2). |
| FL8 | Missing / ambiguous | Target appears only on s20 and combines two measures (time share 20% within 3 months + accuracy ≥95% in a QA sample) while the lesson demands "one success metric". s19 shows baseline only. No accuracy baseline is given. | Writers present it as written. Flag for SME whether accuracy is a guardrail or a second metric; S11 must not mark "two metrics" as wrong if the canon itself has two. |
| FL9 | Ambiguity | Field 3 step 1 "Receiving the request (employee)": receiving would normally be done by HR staff; the employee sends. | Keep verbatim; SME to confirm role owner of step 1. Avoid testing this detail. |
| FL10 | Wrong-lesson content | s1 trainer notes describe the language-model lesson ("open the central tool... what we cannot trust it with") and a Hebrew title about language models and hallucinations. | Ignore; report to deck owner. |
| FL11 | Citations to verify | Gartner quote (no year, no title); McKinsey (2025) (no report title); APQC PCF "13 top categories"; ISO 9001 PDCA ownership "explicit requirement"; Hammer HBR 1990. | SME verify before using in narration or tooltips. Keep deck wording. |
| FL12 | Missing info | Five common mistakes have titles only (s34); no definitions, examples, or symptoms. Mistake 4 (not updating after changes) is hard to show in a first AS-IS map. | Writers build short scenarios on the HR case; SME approve the key. |
| FL13 | Missing info | HR case Output (building block) is not given as an explicit field; the template has no "output" field even though s10 teaches Trigger / Steps / Output. | Derive only "an answer or an escalation" from field 3; flag that the eight-field template has no output field. |
| FL14 | Missing visual | No BPMN example in sources; HR case gives no end or intermediate events. | S05 visual must be labeled as illustrative and built only from fields 2-4. |
| FL15 | Missing info | Lesson time: deck gives only 40 min for the activity; the 180 min split and Ch5 ~65 min are not sourced. Practice Studio workbook name/URL not in sources. | Planning decision, not a fact; mark as such. |
| FL16 | Constructed item | No AI-generated process map exists in sources for the A5 critical-evaluation item. | Construct from HR canon with seeded errors from s16/s34/s33 (e.g. AI step inserted, official procedure instead of actual, "significant improvement" metric, missing owner). Label as a fictional AI output. |
| FL17 | Coverage | Learning outcomes (s39) not in screen plan. | Add to menu/reference card or S02. |
| FL18 | Inconsistency | s14 "the five-field template you already know" (L1 booklet five fields) vs s40 "nine-field template and seven questions" (L3; HW1 also has 9 sections). s2 calls L2-3 "working template". | Refer only to "the five-field diagnostic template from Lesson 1"; skip the nine-field reference. |
| FL19 | Contradiction | s15 calls the HR case "a real case"; s43 calls it "the hypothetical case"; booklet presents it as a scenario. | Do not call it real. Use "the HR case" or "a typical case". |
| FL20 | Baseline nuance | Booklet: "30 to 40 percent" of time; deck: "about 35%". Consistent (midpoint) but writers may mix. | Use "about 35%" in the map; "30 to 40 percent, per the HR staff" only when quoting Lesson 1. |
| FL21 | Hedging | Fintech and car figures must keep "per reports"; fintech disclaimer (s25) "not proof that employees should be replaced" should be carried into V1. Japanese and US companies and the fintech are unnamed; do not name them. | Mandatory for V1 and any quiz item. |
| FL22 | Wording risk | s25 "~700 service reps, the scale of the reduction in service load" is easy to misread as "700 people fired". | Keep the deck phrase; do not write "replaced 700 employees". |
| FL23 | Data-safety scope | s44 restricts the personal map from "any external AI tool"; the Practice Studio workbook is a Wawiwa tool. Whether the workbook stores data or sends it to AI is not in sources. | Handoff writer to confirm workbook data handling with Noy before writing the S18/S19 safety line. |

---

## 6. GLOSSARY (first-use tooltips, definitions from the deck, max 15 words)

| Term | Tooltip (<=15 words) | Source |
|---|---|---|
| Process mapping | A sequential, explicit, visual description of how work actually flows. | s9 |
| Process modeling | Mapping, plus representing the process in a structure you can analyze and reproduce. | s9 |
| Process | A set of related activities that use inputs to produce an intended output. | s11 |
| AS-IS | As it happens now, in practice, on a normal day. | s16 |
| Trigger | What starts the process: a message, a form, a date. | s10 |
| Steps | The path from trigger to result; three to seven are usually enough. | s10 |
| Output | What comes out at the end, and to whom exactly. | s10 |
| Handoff | The moment responsibility passes from one role to another. | s27 |
| Bottleneck | A step limited by the slowest resource. | s28 |
| Process owner | Responsible for the process working and finishing successfully, start to end. | s22 |
| Knowledge source owner | Keeps a policy or document current and correct. | s22 |
| BPMN | A standard for process diagrams, used as a shared basis across tools and teams. | s12, s13 (composed from both) |
| Swimlane | Who does what. Each role in its own lane. | s12 |
| Gateway | A decision point. The path splits by condition. | s12 |
| Event | Start, end, and intermediate points in a process. | s12 |
| Sensitivity tag | Field 5 label (public, internal, confidential, restricted) deciding what may go to AI. | s14, s44 (see FL6) |
| Existing controls | Field 6: checks already in place; "no formal control" is a valid answer. | s14, s18 |
| Gaps | Field 7: what is missing or unclear; writing "unclear" is allowed. | s14, s19 |
| Baseline | The current state, even if estimated. | s37 |
| Target | What you want to achieve: specific, realistic, checkable later. | s37 |
| Success metric | Something measurable before and after: a number, percentage, time, or frequency. | s37 |
| Unstructured input | Free text, a document, or a request that needs processing. | s23 |
| Structured output | A classification, a summary, or a draft reply. | s23 |
| High-risk decision | Involves money, rights, safety, or irreversible consequences; needs human judgment. | s24 |
| Hybrid model | AI for the routine, a person when empathy and judgment are needed. | s26 |
| PDCA | Plan-Do-Check-Act cycle; ISO 9001 requires explicit process ownership within it. | s22 |
| ISO 9001 | International quality standard; manages processes by inputs, outputs, ownership, measurement. | s11 |
| APQC PCF | A framework organizing processes into 13 top categories. | s21 (FL11) |
| Process discovery | Per Gartner, a precondition for any advanced automation. | s8 (definition not given; FL11) |
