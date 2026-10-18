# 05 Video Scripts: EAI Module 1, Lesson 4 (V1 and V2)

Facts used: only those in out/01_analyst.md (fact IDs F1 to F65, HR canon section 2, flags FL1 to FL23).
Rules applied: V1 to V7 (max 2 videos, each under 4 min; a stop every 60 to 90 s, resume only after the correct answer; guiding question before play; ~150 wpm conversational; on-screen keywords and numbers only; no music; visuals build up), A1 to A6 for the stops, T3/T7 tracking.

## Production notes (both videos)

- **Style:** code-animated motion graphics only (e.g. SVG/Canvas, Remotion or GSAP). Flat shapes, numbers, arrows, simple line icons, text keywords. No stock footage, no photos, no music, no sound effects. Plain light background, one accent color for "current focus", grey for everything already shown.
- **Build-up rule (V7):** nothing swaps. Each element draws on (stroke reveal, count-up, slide-in) and stays on the canvas, greyed, until the scene is cleared by an explicit "wipe" noted in the table.
- **On-screen text (V5):** keywords and numbers only, never the narration sentence. Every number keeps "per reports" on screen where the source hedges it.
- **Narration:** one voice, conversational, second person, ~150 wpm. Timecodes below are computed from word counts at 150 wpm (2.5 words per second) and exclude pause time at stops.
- **Stops:** video freezes on the last frame; question card appears inside the player frame (same ~72% stage card), options as three buttons, feedback in the fixed feedback row below the player. Retry allowed; the video resumes only after the correct option (V2). First attempt is the one reported. Stops are practice, not scored.
- **Captions:** full narration as captions (WCAG 2.1 AA); transcript available from the player.
- **Accessibility of visuals:** no meaning carried by color alone; every highlighted element also gets an outline or label.

---

## V1 "Two cases, 35 years apart" (working title; see Flag VF1)

**Recommended title until SME decides:** "Two cases, same lesson".
**Position:** Ch1, after S02 (Input), before S03 (Decision).
**Sources:** F2, F4, F9, F10, F11, F39 to F48 (deck s6, s7, s25, s26, s29, s30, s31, s3).

### Guiding question (shown before play)
> What separates a technology change that works from one that has to be fixed later?

(Answered explicitly in the last segment, 2:15 to 2:36.)

### Length
- Narration: **390 words**.
- Estimated duration at 150 wpm: **2:36** (plus pause time at 2 stops).
- Stops at **0:56** and **2:04** (68 s apart; first stop sits 4 s before the 60 s mark, accepted to keep the stop before the case reveal).

### Timed script

| # | Timecode | Narration | On-screen visual build-up (keywords / numbers only) |
|---|---|---|---|
| 1 | 0:00 to 0:15 | A team has a slow, painful process. A faster technology arrives, and they put it on top of the process as it is. The problem doesn't go away. It gets locked in, faster and at a larger scale. | Three grey rounded boxes draw left to right, joined by wobbly arrows (a "messy" chain). A lightning-bolt icon labeled **faster tech** drops onto the chain. The chain copies itself 3 times, each copy smaller and faster (scale-out animation). Keyword fades in: **same mess, faster**. |
| 2 | 0:15 to 0:36 | In 1990, Harvard Business Review published an article called Reengineering Work: Don't Automate, Obliterate. The principle in it: if you run new technology on a broken process without taking it apart first, you only accelerate the inefficiency you already have. It was written about ordinary computing. It applies to AI just as well. | Copies collapse back to one chain (moves to top third, greyed). Label types on: **HBR, 1990**. Below it: **Don't automate, obliterate**. The chain's boxes separate and spread apart (a "take apart" exploded view). Small tag on the right: **computing 1990 → AI today**. |
| 3 | 0:36 to 0:56 | Case one. The early 1980s, the accounts payable department of a US car company. 500 people work there. A Japanese company runs the same department with 100. Five times fewer. The US company wants to close that gap. Before you see what they found, make the first call yourself. | Wipe. Year marker **early 1980s**. Two columns of simple person icons build row by row. Left column label **US: accounts payable**, counter counts up to **500**. Right column label **Japan: same dept.**, counter to **100**. A bracket between them draws: **5x**. Freeze for **STOP 1**. |
| 4 | 0:56 to 1:18 | Mapping revealed the real reason. Most of the work went into manually reconciling three separate documents. Faster systems for that check would not have closed the gap. So the process itself was rewritten: payment is now triggered directly from the receipt record, with no separate invoice. Per reports, the headcount needed fell by about 75 percent. | Person columns shrink to the top corner. Three document icons draw (**doc 1**, **doc 2**, **doc 3**), criss-cross lines connect them, label **manual reconciliation**. A lightning bolt tries to attach and bounces off (no "faster" fix). Documents rearrange: **receipt record → payment**, one document fades and is struck through: **no separate invoice**. Counter: **headcount ~ -75% (per reports)**. |
| 5 | 1:18 to 1:38 | Case two. A Swedish fintech, per public reports, from 2024 to 2025. Its customer service goes to an AI agent. About 2.3 million conversations a month. A reduction in service load on the scale of about 700 service reps. Handling time drops from about 11 minutes to under two. | Wipe. Timeline bar slides from **1980s** to **2024 to 2025**. Chat-bubble icon with counter **2.3M conversations / month**. Second counter **~700 reps: scale of load reduction**. Clock icon: **~11 min → under 2 min**. Footer tag stays on: **per reports**. |
| 6 | 1:38 to 2:04 | These figures come from company publications and media reports. They're here for learning, not as proof that people should be replaced. Then, by early 2025, the company starts rehiring human service reps. On simple requests, the AI performed about as well as people. On complex ones, like disputes or personally difficult cases, quality dropped noticeably. So what went wrong? Decide before you hear it. | Footer expands to a one-line disclaimer box: **for learning, not proof people should be replaced**. Timeline marker: **early 2025: rehiring reps**. Incoming request arrows split into two lanes: **simple: similar to people** (flat line) and **complex: disputes, difficult cases** (quality line drawn dropping). Freeze for **STOP 2**. |
| 7 | 2:04 to 2:15 | Management admitted that focusing too much on efficiency hurt service quality. The fix was a hybrid model: AI for the routine, a person when empathy and judgment are needed. | A diamond (decision point) draws at the split. Upper exit: robot-head icon + **routine → AI**. Lower exit: person icon + **empathy + judgment → person**. Bracket label: **hybrid model**. |
| 8 | 2:15 to 2:36 | Two cases, decades apart, with completely different technology. The same lesson. Process mapping is not a bureaucratic step. It's what separates a change that works from a change that has to be fixed after the fact. Lesson 1 named four reasons AI projects fail. Next, pick the two these cases point to. | Both case thumbnails (three documents; split diamond) slide side by side, labels **1980s** and **2024 to 2025**. An "=" draws between them, then a map-pin icon and **map first**. Final hold card: **change that works** vs **change fixed later**, with **mapping** as the divider line. Bridge tag at bottom: **Next: 4 failure causes, pick 2**. |

### STOP 1 (0:56) · L4_V1_Q1
- **Question:** The US company wants to close a five-times gap. What should it look at first?
- **Bloom:** Apply
- **Type:** choice (single answer) · practice · correct response: B

| Option | Correct | Feedback (<=25 words) | Distractor source |
|---|---|---|---|
| A. A faster system for its current payment checks | No | Faster checks keep every existing step in place. If the work sits in the wrong place, it only moves faster. (20) | s34 mistake 5, s7 (automating a broken process) |
| B. Where the 500 people's working time actually goes | Yes | That is the question mapping answers. Watch what it found. (10) | s29, s30 |
| C. The official payment procedure, as written | No | A written procedure shows how work should flow. The gap lives in how it really flows on a normal day. (20) | s16 rule 3, s34 mistake 1 |

### STOP 2 (2:04) · L4_V1_Q2
- **Question:** Quality dropped on complex requests. What was the root problem?
- **Bloom:** Analyze
- **Type:** choice (single answer) · practice · correct response: A

| Option | Correct | Feedback (<=25 words) | Distractor source |
|---|---|---|---|
| A. Routine and judgment cases got the same path | Yes | Speeding everything up without telling decision types apart sent complex cases where judgment was missing. (15) | s31, s24 |
| B. The AI agent answered too slowly to keep up | No | Handling time fell from about 11 minutes to under two, per reports. Speed is not where quality broke. (18) | s25 (misreading the data) |
| C. Simple requests were handled worse than by people | No | Per reports, the AI performed about as well as people on simple requests. Look at where the drop happened. (19) | s26 (misreading the data) |

### End-of-video bridge
- Narration (in segment 8): "Lesson 1 named four reasons AI projects fail. Next, pick the two these cases point to."
- On-screen end tag: **Next: 4 failure causes, pick 2**. Player shows a single "Continue" button, enabled when the video ends; leads to S03.

---

## V2 "Mapping the HR case"

**Position:** Ch3, first screen of the chapter; followed by S09 (Sort, Field 5).
**Sources:** HR canon (01_analyst section 2), F10 (AS-IS framing via s16), F17, F21, F22, F23 to F27, F32, F50 to F53, F57 (deck s10, s14 to s21, s27, s37, s38, s44; booklet Case 1).

### Guiding question (shown before play)
> How do you turn 90 messy requests a month into a map you can test later?

(Answered by the build itself and named in segment 12: "Not a feeling. A number you can test later.")

### Length
- Narration: **585 words**.
- Estimated duration at 150 wpm: **3:54** (plus pause time at 3 stops).
- Stops at **0:59**, **2:01**, **3:02** (62 s and 61 s apart; last segment 52 s).

### Canvas layout (constant through the video)
- **Left 60%: process map** that draws itself. Three horizontal swimlanes appear in segment 6: **Employee**, **HR staff**, **HR manager** (lanes illustrative, built only from Fields 2 to 4; see Flag VF6).
- **Right 40%: eight-field panel**, a vertical list of eight numbered slots (**1 Name, 2 Trigger, 3 Steps + owners, 4 Handoffs, 5 Sources, owners, sensitivity, 6 Controls, 7 Gaps, 8 Metric**). Each slot starts as an empty outline and fills with keywords when its field is covered. The active slot has the accent color and an outline; filled slots turn grey.

### Timed script

| # | Timecode | Narration | On-screen visual build-up (keywords / numbers only) |
|---|---|---|---|
| 1 | 0:00 to 0:23 | This is the HR case from Lesson 1. A services company with about 400 employees. HR receives about 90 requests a month, and most of them repeat: vacation days, pension terms, expense submissions, overtime policy. They come in by WhatsApp, by email, and in person, with no organized system. Nobody knows how many of them need human judgment. | Building icon + **~400 employees**. Counter **~90 requests / month**. Four topic chips pop in around a question-mark icon: **vacation**, **pension**, **expenses**, **overtime**. Three channel icons (chat bubble, envelope, person) send small dots that pile up chaotically on an HR box. Small grey tag: **judgment needed? unclear**. |
| 2 | 0:23 to 0:38 | The tempting first move is a chatbot. Not yet. First we map. And we map AS-IS: how it actually happens on a normal day, not how it's supposed to work. No fixing, no AI. Just what's really there. | A robot-head icon slides toward the pile, then stops and fades to outline with a **not yet** tag. Chaos scene shrinks to a thumbnail. Large label draws: **AS-IS** with tooltip-style subline **normal day, real practice**. Two crossed-out chips: **fix**, **AI**. The eight-field panel draws its eight empty slots on the right. |
| 3 | 0:38 to 0:59 | Field 1 is the process name. Keep it plain and specific: answering employees' repeat questions to HR. Field 2 is the trigger, the thing that starts the process. A good trigger is concrete: a message, a form, a date. Something you can point to. Before I fill it in, you choose. | Slot **1** fills: **Answering employees' repeat questions to HR**. Slot **2** activates (accent outline, empty). Three small example icons flash under it: **message**, **form**, **date**, then fade. Freeze for **STOP 1**. |
| 4 | 0:59 to 1:22 | An employee sends a question by WhatsApp, email, or in person. All three channels go on the map, because all three are what really happens. The trigger also sets where the process starts. Where a process starts and ends is a decision, not a given. Without clear boundaries, a process swells until it includes almost the whole organization. | Slot **2** fills: **Question by WhatsApp / email / in person**. On the left, a start circle draws with the three channel icons feeding into it. Two vertical dashed lines draw at the left and right edges of the map area: **start**, **end**. A quick ghost animation: the dashed lines are pushed outward and the map balloons, then snaps back. Keyword: **boundaries = a decision**. |
| 5 | 1:22 to 1:43 | Field 3 is the steps, each with a role owner. Three to seven steps are usually enough. This case needs three. Receiving the request. Checking the topic, done by HR staff. Then either an answer or an escalation, by HR staff or the HR manager. Owners are written as roles, not people's names. | Small range tag **3 to 7 steps**. Three step boxes draw left to right from the start circle, joined by arrows: **Receive request**, **Check topic**, **Answer / escalate**. Slot **3** fills: **Receive → Check → Answer / escalate**, owners as role chips under each step: **(employee)**, **HR staff**, **HR staff / HR manager** (verbatim from deck; see Flag VF5). Tag: **roles, not names**. |
| 6 | 1:43 to 2:01 | Look at the lanes building on screen. Each role gets its own row, so at every moment you can see who is holding the work. Notice the point where the path splits. Field 4 asks where responsibility passes from one role to another. Find it. | Three horizontal lanes draw behind the steps, labeled **Employee**, **HR staff**, **HR manager**. Step boxes slide into their lanes. After **Check topic**, a diamond (gateway) draws with the condition **beyond known policy?**: the "no" path goes to **Answer** in the HR staff lane, the "yes" path drops to **Escalate** in the HR manager lane. Slot **4** activates (empty). Freeze for **STOP 2**. |
| 7 | 2:01 to 2:30 | From HR staff to the HR manager, when a question goes beyond known policy. That's the most dangerous moment in a process. The staffer assumes the manager knows what happened before. That assumption isn't always true. A good map marks each handoff: from whom, to whom, what exactly passes, and what happens if the receiving side isn't available. Here, it happens with no single channel. Keep that in mind for Field 7. | The "yes" arrow crossing from the HR staff lane to the HR manager lane thickens and gets a handoff marker (two-arrow exchange icon). Slot **4** fills: **HR staff → HR manager, policy exceeded**. Next to the marker, a 4-row checklist draws: **from whom**, **to whom**, **what passes**, **if unavailable?**. A small amber dot appears on the marker with tag **no single channel** (it will reappear in Field 7). |
| 8 | 2:30 to 2:50 | Field 5 is knowledge sources. Here, the vacation, pension, expense, and overtime policies. Each source gets an owner, the person who keeps it current. Here that's the HR manager. And each gets a sensitivity tag: internal, employee. Tags matter later: information tagged employee is not uploaded to a public AI tool. | Four document icons stack below the map: **vacation**, **pension**, **expenses**, **overtime** (policy). A line connects them to a role chip **owner: HR manager**. A tag label attaches to the stack: **internal / employee**. Small icon pair: tag → cloud with a strike-through: **not to public AI tools**. Slot **5** fills: **4 policies · owner HR manager · internal / employee**. |
| 9 | 2:50 to 3:02 | Field 6 is existing controls. Is anything checking the answers before they go out? You've seen the steps. There's no review step anywhere. What goes in the map? | Slot **6** activates. A magnifier icon scans along the three step boxes left to right and finds nothing (each box blinks once, no check mark appears). Freeze for **STOP 3**. |
| 10 | 3:02 to 3:13 | No formal control. It depends on the personal judgment of the HR staffer who got the request. That's a valid answer. It's exactly what mapping is meant to reveal. | Slot **6** fills: **No formal control: staffer's personal judgment**. A small person-with-thought icon attaches to the **Answer** box. Tag: **valid answer**. |
| 11 | 3:13 to 3:28 | Field 7 is gaps. Here you're allowed, even encouraged, to write unclear. Nobody knows how many wrong answers were given before. There's no single organized handoff channel. That's not a failure of the mapper. It's a diagnostic result. | Slot **7** fills with two lines: **Wrong answers so far: unclear** and **No single handoff channel**. The amber dot from segment 7 pulses once and links by a dotted line to the second line. A stamp-style label draws: **unclear = diagnostic result**. |
| 12 | 3:28 to 3:54 | Field 8 is the success metric. Baseline: about 35 percent of the HR team's time goes to repeat questions. Target: 20 percent within three months, with accuracy of at least 95 percent in a QA sample. Not a feeling. A number you can test later. Eight fields, one map, built from what really happens. Next, you take the mapper's seat, starting with Field 5. | A horizontal bar draws: filled to **~35%** labeled **baseline: HR time on repeat questions**. An arrow pulls the fill down to **20%**, labeled **target: 3 months**. Beside it a small gauge: **accuracy ≥ 95% (QA sample)**. Slot **8** fills: **35% → 20% in 3 months · accuracy ≥ 95%**. All eight slots briefly highlight top to bottom; the full map and panel hold. Bridge tag: **Next: Field 5, your turn**. |

### STOP 1 (0:59) · L4_V2_Q1
- **Question:** Which line belongs in Field 2, the trigger?
- **Bloom:** Apply
- **Type:** choice (single answer) · practice · correct response: C

| Option | Correct | Feedback (<=25 words) | Distractor source |
|---|---|---|---|
| A. HR staff check the topic of each request | No | That happens after something has already started the process. It is a step, so it belongs in Field 3. (19) | s10 (trigger vs steps) |
| B. A chatbot receives every employee question | No | That describes a future tool. An AS-IS map records today, so AI has no place on it yet. (17) | s16 rule 2 (don't add AI while mapping) |
| C. An employee asks by WhatsApp, email, or in person | Yes | It names the concrete event that starts the work, across all three channels that really exist. (16) | s17 Field 2 |

### STOP 2 (2:01) · L4_V2_Q2
- **Question:** Where does responsibility pass from one role to another?
- **Bloom:** Analyze
- **Type:** choice (single answer) · practice · correct response: A

| Option | Correct | Feedback (<=25 words) | Distractor source |
|---|---|---|---|
| A. HR staff to HR manager, when policy is exceeded | Yes | From here on, the HR manager depends on what the staffer passes along. (13) | s17 Field 4, s27 |
| B. HR staff check the topic of each request | No | One role does this from start to finish. Nothing changes hands, so it stays a step in Field 3. (19) | s14 (Field 3 vs Field 4) |
| C. HR manager keeps the four policies current | No | That is ownership of a knowledge source. It goes in Field 5, next to each policy. (16) | s22, s14 Field 5 |

### STOP 3 (3:02) · L4_V2_Q3
- **Question:** No step checks the answers. What goes in Field 6?
- **Bloom:** Apply
- **Type:** choice (single answer) · practice · correct response: B

| Option | Correct | Feedback (<=25 words) | Distractor source |
|---|---|---|---|
| A. A manager review before answers go out | No | That is a fix for later. Added now, the map shows a check that does not exist today. (18) | s16 rule 1 (don't fix while mapping) |
| B. No formal control: the staffer's own judgment | Yes | It records what really happens. That missing check is exactly what the map is meant to reveal. (17) | s18 |
| C. Nothing yet: leave Field 6 empty for now | No | An empty field reads as "not checked yet". The finding itself is the content this field needs. (17) | s43 pre-submission check (every field filled) |

### End-of-video bridge
- Narration (end of segment 12): "Next, you take the mapper's seat, starting with Field 5."
- On-screen end tag: **Next: Field 5, your turn**. Single "Continue" button, enabled when the video ends; leads to S09 (Sort, Field 5).

---

## Tracking summary (SCORM 1.2, T3 / T7)

| ID | Video | Stop time | Type | Correct response | Scored / practice | Bloom |
|---|---|---|---|---|---|---|
| L4_V1_Q1 | V1 | 0:56 | choice | B | practice | Apply |
| L4_V1_Q2 | V1 | 2:04 | choice | A | practice | Analyze |
| L4_V2_Q1 | V2 | 0:59 | choice | C | practice | Apply |
| L4_V2_Q2 | V2 | 2:01 | choice | A | practice | Analyze |
| L4_V2_Q3 | V2 | 3:02 | choice | B | practice | Apply |

Report on each interaction: id, type, learner response (first attempt), result (correct / wrong), latency, attempt count. Video resumes only after the correct option.
Key positions vary across the five items (B, A, C, A, B). Option lengths within each stop are kept within a few words of each other. No all/none of the above, no always/never.

---

## Flags and decisions for Noy / SME

| ID | Issue | What this script does |
|---|---|---|
| VF1 (FL5) | "35 years apart": early 1980s to 2024-2025 is about 40 to 45 years. 35 years matches HBR 1990 to 2025, not the two cases. | Narration never says "35". It says "decades apart". Title kept as given in the brief header, with "Two cases, same lesson" recommended (matches 02_storyboard). |
| VF2 (FL4) | Deck says "2.3M calls a month". | Narration and screen say "conversations", always with "per reports". SME to verify. |
| VF3 (FL11) | HBR 1990 article title from s7; deck gives no author first name and no further citation. | Narration names the journal, year and title only; no author name. SME to verify citation before recording. |
| VF4 (FL8) | Field 8 target combines a time share and an accuracy level; "QA sample" is undefined in sources. | Read as written on s20. No stop tests Field 8. SME to define "QA sample" or drop it from narration and screen. |
| VF5 (FL9) | Field 3 step 1 owner "(employee)" is ambiguous. | Narration says "Receiving the request" without an owner. On-screen chip shows "(employee)" verbatim. No stop tests it. If SME changes the owner, update segment 5 chip and the lane placement in segment 6. |
| VF6 (FL14) | No BPMN or swimlane diagram exists in sources; no end or intermediate events for the HR case. | Swimlanes, gateway and start circle are illustrative, built only from Fields 2 to 4. No end event is drawn. Suggest a small "illustrative" caption in the player corner. |
| VF7 (FL6) | Sensitivity vocabulary: s20 "internal / employee" vs s14 four-level scale. | V2 shows "internal / employee" verbatim from s20. S09 must use the same scheme the SME picks; update segment 8 if it changes. |
| VF8 | Computed task suggested a V2 stop on "choosing the strongest metric". 03_storyboard (note 4) assigns that decision to S11, and Field 5 to S09. | V2 stop 3 tests Field 6 through the AS-IS rule "don't fix while mapping" instead. This brushes S10 (controls and gaps) and S08 (AS-IS rules); storyboard writer may want S10 to focus on Field 7 wording to avoid overlap. If Noy prefers a metric stop, move Q3 to 3:54 as a post-video question and adjust S11. |
| VF9 | Stop spacing: V1 stop 1 at 0:56, 4 s before the 60 s minimum. | Accepted so the question comes before the reveal. Can be fixed by adding ~10 words to segment 2 if strict compliance is required. |
| VF10 (FL1) | S01 uses a chatbot request framing (Dana). | V2 segment 2 mentions "the tempting first move is a chatbot", which matches the booklet warning ("Do not jump straight to 'let us build a chatbot'"). V2 never names Dana and adds no Dana facts. |
| VF11 (FL21, FL22) | Fintech figures and disclaimer. | "per reports" on screen for every fintech and car-company figure; s25 disclaimer read aloud and shown; "~700 reps" phrased as "scale of load reduction", never "replaced". No company names. |
| VF12 | Seat time. | V1 ~2:36 runtime + 2 stops; V2 ~3:54 runtime + 3 stops. Fits the 5 and 6 minute slots in 02 and 03 storyboards. |
