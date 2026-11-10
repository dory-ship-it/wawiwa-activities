# Grounding pack: EAI M1 L4 self-study coach

Approved by Noy, 26 Oct 2026. Source: EAI-M01-L04.pptx (SME deck, 46 slides). The coach reasons only from this pack and the current screen's note. Wawiwa IP only: never add learner text here. Target size: about 850 tokens.

## The lesson in one line
Before any AI, map the process as it actually runs today (AS-IS): who does what, where responsibility passes, what controls exist, and one measurable metric. "Don't accelerate a broken process. Take it apart first."

## Why map
- Two of the four causes of AI project failure (Lesson 1) get an answer today: an unmapped process and no success metric. The others: an unclear problem, an unidentified end user.
- Hammer's principle (HBR, 1990): don't accelerate, deconstruct. AI run on an unmapped process automates the mess faster.
- Mapping is a sequential, visual description of how work actually flows. Modeling is broader: a structure you can analyze and reproduce.

## Building blocks
- Trigger: what starts it (a message, a form, a date). Steps: the path to the result, usually three to seven. Output: what comes out, and to whom.
- Boundaries are a decision: which external trigger starts it, and what output does someone else pick up afterward.
- BPMN, recognition level only: swimlane (one row per role), gateway (a decision, the path splits), event (start, end or intermediate point).
- Field template when you know the process and need a fast decision; BPMN when the map must serve several systems and a process team.

## The eight fields
1. Process name
2. Trigger
3. Steps and role owners (a role, not "the team")
4. Handoffs: from whom, to whom, what passes, what happens if the receiver is unavailable
5. Knowledge and data sources, owners, sensitivity (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)
6. Existing controls ("no formal control" is a valid answer)
7. Gaps ("unclear" is a legitimate diagnostic answer)
8. Success metric: measurable, a baseline (an estimate is fine) and a target

## AS-IS rules
Don't fix while mapping. Don't add AI while mapping. Don't map the official process; map a normal day.

## Critical eye
- Handoffs are the most dangerous moment: a hidden assumption that the receiver knows what happened before.
- Bottleneck: ask why it formed. Sometimes remove the step rather than speed it up.
- Process owner versus the owner of a knowledge source.
- AI fits: unstructured input to structured output; low-risk decision points, with oversight; handoffs with delay or loss.
- AI does not fit: irreversible consequences (money, legal, safety, rights); a process problem (disorder, not missing information); a map full of "unclear".
- Five common mapping mistakes: mapping the aspirational state; no clear goal; rushing; not updating the map; automating a broken process (the most critical).
- Cases, per public reports: a Swedish fintech put AI on all requests, quality fell on complex ones, and it moved back to a hybrid model. A US car company's accounts payable: removing a manual three-document reconciliation cut the required headcount by about 75%.

## Worked example: the HR case (fictional, about 400 employees)
Repeat employee questions to HR. Trigger: a question by WhatsApp, email or in person. Steps: receive, check the topic (HR staff), answer or escalate (manager). Handoff: HR staff to the manager when a question goes beyond policy. Sources: vacation, pension and expense policy; owner: the HR manager; sensitivity: internal / employee. Controls: no formal control. Gaps: no way to know how many wrong answers were given; no single handoff channel. Metric: baseline about 35% of HR time on repeat questions; target 20% within 3 months, accuracy at least 95% in a QA sample.
Note: the HR case is also used in practice screens. Each practice screen's note tells the coach not to reveal the answer from it.

## The learner's own case and data safety
The learner maps their own use case from Homework 1. Roles, not names. No real names, identifiers or specific internal policy; a generalized version only. Data tagged personal, employee or financial never goes to a public AI tool.

## Bridge to Lesson 5
The map becomes the basis for the Lesson 5 AI architecture diagram: process steps, data flow, a knowledge layer and a monitoring layer.

## Coaching voice
One to two sentences, at most about 35 words. Plain, warm, ends with a question when useful. No em dashes. Never gives the answer on practice screens.
