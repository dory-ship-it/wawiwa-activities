# EAI M2 L3: The Challenge, then Opportunity Framework (fact sheet)

Stage 1 of the `wawiwa-self-study` skill, 23 Nov 2026. Read view-only in Noy's Chrome (Wawiwa account):
the lesson deck (23 slides with speaker notes, through `htmlpresent`), the Module 2 Trainer Guide V3
(Lesson 3 block plus the front matter and the Round 3 notes), the Class Practice Booklet V4 (the
NorthRiver persona cards and the Lesson 3 worksheet), the Knowledge Check V2 (with its key) and the
Detailed Outline V3 (Lessons 2 to 4). Second pass, the same day: the decks of L1, L2 and L4 in full (with notes),
the slide titles of L5 and L6, and the booklet's L1 and L2 worksheets. Local: the self-study mapping and
the M2 practice pages (L1 pair interview, L2 As-Is, L2 home practice, L3 class page and home practice).
The Module 2 folder on Drive holds no case pack transcripts and no Home Practice Booklet; the Capstone Brief was not read.

## The lesson in one line
Turn every documented pain into a structured Opportunity Card. Ask "is this a process problem before
it is a tool problem?" before you choose a tool category.

## Goals (from the outline T3.1 to T3.7 and the trainer guide)
By the end the learner can:
1. Explain why every documented pain becomes a card (traceability: recommendation > pain > quote > meeting date).
2. Keep pain and opportunity apart (the most common stumble: "no contract metadata" > "add contract metadata").
3. Apply the Process Redesign First gate before choosing a tool category.
4. Place an opportunity in one of the four solution categories (Agents & Copilots, Workflow Automation, BI, Document AI / OCR), or in Process Redesign.
5. Find the root cause with 5-Whys and Fishbone (Pareto as the focus rule), and use the dominant Fishbone branch to choose the category.
6. Name the Pain Owner (who feels it) apart from the Owner / Sponsor (who funds it).
7. Tag data sensitivity (Public, Internal, Confidential, Restricted) and know what it means for tools and procurement.
8. Score integration feasibility (4 dimensions, 0 to 2 each).
9. Fill the full card format and review an AI-drafted card critically.
10. Produce 10 opportunity cards (the mapping: "Uses the pains documented in M2 L1-L2. Output: 10 opportunity cards.").

## Key terms
Opportunity Card · Pain · Pain Owner · Owner / Sponsor · Root Cause · 5-Whys · Fishbone (Ishikawa:
People, Process, Tools, Data, Policy, External) · Pareto (80/20) · Process Redesign ("paving the cow
path") · Solution Category · Use-case library · Data sensitivity tiers · AI governance (four corners) ·
Integration feasibility · Effort S/M/L/XL · Value Low/Medium/High.

## Every slide in one line (what it teaches, how it breaks it down)
1. Title. "Translate documented pain points into structured opportunities. Process problem before tool problem." Quote "AI is the tool. Value is the goal." (cover photo: L02_hero.png)
2. Bookend punctuation: "AI is the tool. Value is the goal. You're about to start running the math. Don't let the math forget." **One big line.**
3. Why every pain needs a card: the format keeps prioritization defensible ("why this and not that"); reports full of untraceable "recommendations" are the failure mode; the chain card > quote > meeting date. **Problem, then the chain.**
4. Anchor: "Every pain becomes a card. No exceptions." **One big line.**
5. Process Redesign First: a broken process plus a tool = the flaw runs faster; "paving the cow path"; ask "is there a process change that solves this without any tool?"; the implicit fifth category, at the front; show the trade-off to the steering committee. **Gate before the categories.**
6. The Four Solution Categories: Agents & Copilots / Workflow Automation / BI / Document AI-OCR, one line and tools each. Note: pick the dominant category; a card that spans all four is not decomposed enough. **Four cards.**
7. Use-case library, Marketing and Sales: 5 + 5 examples with category tags. **Two lists.**
8. Sales spotlight, lead-prospecting agent: problem, solution, stack, ROI math (about $10K year one, about $16K a year back, break-even month 8), watch-out (the ICP rubric drifts). **Worked example: problem > solution > stack > ROI > watch-out.**
9. Use-case library, HR and Finance: 5 + 5. Note: Finance is where Document AI shows the fastest ROI. **Two lists.**
10. HR and Finance spotlights: tax payment workflows, bank reconciliation, HR policy RAG bot (watch-out: tier access by role). **Three cases with effort / value.**
11. Use-case library, CS / Ops and Legal / Product: 5 + 5. Note: Legal is the most data-sensitive. **Two lists.**
12. Root cause before solutions: 5-Whys (support replies take 48 h > ... > ownership was never formalized: an ownership gap, not a tooling gap), Fishbone with six branches (diagram), Pareto 80/20. Notes: live invoice example (slow invoices > no OCR > 60% accuracy > old vendor not re-evaluated since 2020). **Three tools; a chain and a diagram.**
13. Who hurts? The Pain Owner lens: two reasons (cleanest value signal; change-management ally); add the field; ask "who feels this most?"; in the executive deck the Pain Owner sits on the same line as the action owner. **Two reasons, then the pitch sentence.**
14. Data sensitivity: four tiers with examples and the deployment each needs (no constraints / vendor with DPA / private cloud / on-prem or compliant cloud plus legal review). Note: opportunities die on sensitivity, not value. **Four tiers, a scale.**
15. AI governance, four corners: build authorization, tool authorization, demand centralization, review and approval flow. Light: Module 3 and Module 6 teach it. **Four corners.**
16. Integration feasibility: "the silent killer of AI POCs"; four dimensions (API, bulk data, SSO, deploy without the change board), 0 to 2 each, summed onto the card. **Four scores, one sum.**
17. The Opportunity Card format: 11 fields with a full example (OP-014, vendor invoice processing, Henrik, Document AI, Confidential, M / High $340k a year, sponsor Sarah Chen). **A filled template.**
18. AI Spot, generate cards from pains: the prompt; "AI is fast at draft, slower at calibration"; the 10% you correct is what the steering committee checks. **Prompt + review rule.**
19. AI Spot, classify pains: classify 20 yourself, ask Claude, compare, examine why you disagree (calibration, not productivity). **Three steps.**
20. AI Spot, use-case lookup in NotebookLM: 200+ cases, "find the 3 closest", adapt the closest. **Steps.**
21. AI Spot, auto-flag sensitivity: scan a transcript for PII, PHI, accounts, contract terms, trade secrets; a flag report before recommending. **Prompt + output.**
22. Hands-on, 10 opportunity cards (90 min): cards 45 min, peer review 15, category roundtable 15, boundary cases 15. **Four timed steps.**
23. Close: tomorrow you prioritize; bring the full card set, 20 cards minimum, do not delete weak ones; hold the line on the format. **Bridge to L4.**

## What the trainer does in class
Blocks A to H (240 min): open and why (15), Process Redesign First + categories (30), library walk and spotlights (35),
root cause + Pain Owner + sensitivity + governance (45), integration + card format (20), AI Spots, at least the first two live (25),
class practice: 10 cards (60), debrief and close (10). Shows a filled card live in Airtable / Notion.
Watches for: pain collapsed into opportunity (send it back); Pain Owner "TBD"; tool choice before root cause
("tool choice flows from category, which flows from root cause, which flows from documented pain").
Reminder on every AI Spot: no confidential client data in consumer AI accounts (deck slide 18 of the module).

## What students receive or answer
- **Class worksheet** (booklet V4, Lesson 3): 10 cards from the NorthRiver pains with the V2 template; aim for at least 4 departments, at least 3 of the 4 categories, at least 2 Restricted cards, at least 1 process redesign with no tool. **Fishbone exercise** (15 min): one pain, two causes per branch, rank the branches, the dominant branch names the category (People > change management, Process > redesign, Tools > automation / Document AI, Data > BI / extraction, Policy > back to the policy owner, External > a different client conversation). **Peer review checklist**, 9 items.
- **Existing workbook page** `m2l3-opportunity-cards` (Rise embed): one model card plus the Fishbone.
- **Home practice** `m2l3-homework-opportunity-cards`: 5 more cards (to 15), an AI classification check, an AI sensitivity scan; export a PDF and upload it to Blossom.
- **Knowledge check** (module, 22 items): Lesson 3 is behind Q1 (the four categories), Q4 (the tiers, HR records = Confidential), Q6 (Restricted means on-prem, legal review), Q12 (Robert's contract card with a "do not" line), Q13 (Boston double-booking: a shared vendor without central scheduling, so workflow automation plus master data; AI comes second), Q18 (paving the cow path), Q19 (Pain Owner vs Sponsor).
- **Capstone**: the cards feed L4 prioritization, L5 ROI and the L6 executive deck (Pain Owner named on the deck).

## The case: NorthRiver Holdings (real estate), from the persona cards
- **Sarah Chen, CFO**: month-end close takes 14 days; three accounting environments (Acumen 7, Acumen 9, QuickBooks); the audit flagged six vendor-master inconsistencies; paper checks to 30% of vendors. Her analyst **Henrik** already drafts variance commentary with ChatGPT.
- **Marcus Holloway, Head of Property Operations**: vendor master split across 3 systems and Excel; the **Boston heating failure** (a vendor double-booked between regions, a refund of 40 units of rent); no central asset record; regional manager **Anita** knows the whole Northeast portfolio from memory and is near retirement.
- **Diana Vasquez, Director of Leasing and Sales**: leads from 6 portals plus walk-ins; CRM used well in Pacific Heights, badly in Mid-Atlantic, not at all in the Northeast; 14-minute response vs 11 hours; 6.5% vs 2.8% conversion; listing copy for 84 properties by a 2-person team.
- **Robert Pak, General Counsel**: 800+ contracts in SharePoint with no metadata; a manual Monday scan of 2 to 3 hours; two auto-renewals missed (one cost $40k); 30 contracts waiting for review. Open to metadata extraction, closed to AI contract review.
- **Lin Zhao, Head of IT**: no SSO across 8+ systems; off-boarding is manual and leaks access; no master data; three ERPs; the AI policy is still in legal review; an audit in September she expects to fail.

## The module around it (from the decks)
- **The module's frame** (L1 slides 2 to 5): one engagement in four weeks, "Walk in. Listen. Map. Prioritize. Pitch." Five artifacts: opportunity map, prioritized shortlist, ROI hypothesis, phased roadmap, 10-slide executive deck. The M2 shortlist becomes the learner's Module 4 build target.
- **L1, Discovery (class, 22 slides)**: scoping patterns, the discovery interview, question banks, the Five-Category frame, sub-text, Critical Eye, documentation hygiene ("one row per insight: process, pain, quote, source, tag"; it pays off "in the steering committee, when someone asks where does that recommendation come from?"), AI Spots (question banks, the data-handling rule, transcription, NotebookLM synthesis). Hands-on: a pair interview with a NorthRiver persona card. **The learner leaves with an Interview Log**: top three pains with a quote and a Pain Owner each, 3 + 3 "reading between the lines", a NotebookLM findings summary. L1 closes on the bookend "AI is the tool. Value is the goal", which L3 opens with.
- **L2, As-Is mapping (class, 16 slides)**: swimlanes, Swimlane vs BPMN, the 3 Content Worlds, the technical audit, pains outside the core systems, islands of knowledge ("one person knows how every roof was last sealed"), the 360 view ("someone is the brain"), **the process inventory** (Process, Owner / Dept, Systems, Pain, Tag; examples: month-end close / Henrik, vendor onboarding / Marcus, lease processing NE / Anita), AI Spots. Hands-on: a swimlane of one NorthRiver finance process plus inventory rows, with three pains (quote and Pain Owner each). Home practice: a second department, 3 to 5 more inventory rows. **L2's last slide: "Bring your inventory and your top ten pains tomorrow, ranked by gut feel. We will challenge that ranking together."**
- **So the "10 documented pains" are the learner's own**: the top ten from their L1 log and L2 inventory, not a fixed list. The persona cards are the case they all come from.
- **L4, Prioritization (class, 15 slides)**: "Light the trade-offs. Don't pick the answer."; Value vs Effort (business owns value, technical owns effort); RICE / ICE / MoSCoW; Quick Wins / Strategic / Next Bets; the Heat Map; the four plays; AI Spots (rubric scoring, weighted voting, heat map, tie-breaker memo); hands-on: score and segment 12 opportunities; the Center of Excellence. It needs cards with Effort and Value filled in, and closes with "bring your top five with full card detail".
- **L5, ROI (self-study, 14 slides)** and **L6, roadmap and pitch (class, 21 slides)** build on the top five cards; L6 names the Pain Owner and the AIBP in the deck.
- M2 L3 is the **first self-study lesson of the course**; M1 is fully in class.

## Class vs self-study (proposal)
The mapping makes the whole lesson self-study. Proposal:
- **Into the lesson**: every concept (slides 2 to 21), the trainer's anchors and stumbles, and a guided first card.
- **Changed for learning alone**: peer review becomes a self-review against the 9-item checklist; the category roundtable and the boundary cases become a sorting task with two boundary cards; the live demo of a filled card becomes the guided card built on screen.
- **Into the workbook** (outside the lesson): the 10 cards and the Fishbone.
- **Left to the home practice, unchanged**: 5 more cards, the AI classification check, the AI sensitivity scan.
- **Light, with a pointer forward only**: AI governance (slide 15), as the deck itself says.
- The spotlights' ROI math (slide 8) only as one number to read; L5 teaches ROI.

## Decisions taken from the materials (second pass, 23 Nov 2026)
- **The 10 pains** are the learner's top ten from L1 and L2 (L2's closing slide). A learner with fewer than ten completes the list from the NorthRiver persona cards they met in L1.
- **Number of cards**: 10 in the lesson (slide 22, the mapping), 15 after the home practice. Slide 23's "twenty minimum" is not repeated; its message stays: bring every card, weak ones included.
- **Governance pointer**: Modules 3 and 6, as the deck says (the trainer guide's "Module 5" is older).
- **Slide numbers**: the trainer guide counts in the full module deck; this lesson's deck is the source, matched by topic.
- **Names**: the course's cast stays as built, "Eli Tannenbaum" included (Noy).

## Open for Noy (learning design only)
- **The workbook.** In class the 10 cards went into a card register the trainer sets up in Notion or Airtable. The paper worksheet and the Rise page `m2l3-opportunity-cards` give one card form as the model ("Fill one here as your model") plus the Fishbone. Alone at home there is no register, so the learner has nowhere to write the other nine. Recommendation: a new lesson workbook beside the old page, with 10 cards, the Fishbone, the checklist and a PDF export.
