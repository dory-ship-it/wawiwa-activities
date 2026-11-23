# EAI M2 L3: lesson brief (stage 1b, for Noy to confirm)

Enterprise AI Implementation Specialist · Module 2 "AI Needs Mapping and Business Functions" · Lesson 3
"The Challenge, then Opportunity Framework". 23 Nov 2026. Details per slide: `FACTS.md`.

## What the lesson is about
Discovery has given the learner a pile of documented pains: the L1 Interview Log, the L2 process
inventory, and the "top ten pains, ranked by gut feel" that L2's last slide asks them to bring. This
lesson turns every one of those pains into one structured **Opportunity Card**, so every later
recommendation can be traced to a pain, a quote and a meeting. The gate before any tool: "is this a
process problem before it is a tool problem?" By the end the learner has **10 opportunity cards** for
the NorthRiver case (the mapping's output), and those cards feed the next lesson's prioritization.

**The opening has to make the bridge a trainer would make** (Noy): what we did until now (interviews in
L1, maps and the inventory in L2) and where today's material comes from (your own top ten pains, with
their quotes and Pain Owners). Every slide, or small group of slides, gets an answer in the lesson.

## Its goals (as the sources state them)
- Outline and trainer guide: "Translate documented pain points into structured opportunities, gating every translation through the question 'is this a process problem before it is a tool problem?' and selecting from a curated use-case library."
- Deck cover: "Process problem before tool problem."
- Topics T3.1 to T3.7: the Challenge to Opportunity frame; process redesign first; the four solution categories; use-case libraries by function; root cause before solutions (5-Whys, Fishbone, Pareto, the "who hurts" lens); AI readiness and data sensitivity; the card format.
- Trainer's anchor: "Every pain becomes a card. No exceptions."

## How the deck runs (23 slides)
1. **Opening (1 to 4)**: cover; the bookend line "AI is the tool. Value is the goal."; why every pain needs a card (traceability); the anchor "Every pain becomes a card. No exceptions."
2. **Process before tool (5, 6)**: Process Redesign First ("paving the cow path", the implicit fifth category); the four solution categories.
3. **Use-case library (7 to 11)**: Marketing and Sales; the Sales spotlight (lead-prospecting agent with ROI math); HR and Finance; HR and Finance spotlights; CS / Ops and Legal / Product.
4. **Analysis before a solution (12 to 16)**: root cause (5-Whys, Fishbone, Pareto); the Pain Owner lens; data sensitivity tiers; AI governance (four corners, light); integration feasibility.
5. **The card (17)**: the Opportunity Card format with a filled example.
6. **AI Spots (18 to 21)**: generate cards from pains; classify pains and compare with the AI; use-case lookup in NotebookLM; auto-flag sensitive data.
7. **Practice and close (22, 23)**: the hands-on (10 cards, peer review, category roundtable, boundary cases); the bridge to L4.

## What must be kept
**Frameworks**
- Process Redesign First, the gate in front of the four categories.
- The four categories: AI Agents & Copilots, Workflow Automation, Business Intelligence, Document AI / OCR. Rule: pick the dominant one; a card that spans all four is not decomposed enough.
- 5-Whys, Fishbone with its six branches (People, Process, Tools, Data, Policy, External), Pareto 80/20.
- The dominant Fishbone branch decides the category (Round 3 addition).
- The Pain Owner vs the Owner / Sponsor (V2 cross-cutting field); in the executive deck the Pain Owner sits on the same line as the action owner.
- The four sensitivity tiers with what each needs: Public (no constraints), Internal (vendor with DPA), Confidential (private cloud; HR records go here), Restricted (on-prem or compliant cloud, legal review).
- AI governance in four corners (build, tools, demand, review flow), with a pointer forward to Modules 3 and 6 only.
- Integration feasibility: four dimensions, 0 to 2 each, summed onto the card.

**The card's 11 fields**: ID, Process, Pain, Pain Owner, Root Cause, Opportunity, Solution Category, Tools, Data Sensitivity, Effort / Value, Owner / Sponsor (in the worksheet also Source Interview).

**Cases, examples and numbers**
- The deck's model card OP-014: vendor invoice processing, 3 hours per invoice, 11% error rate, Henrik (Finance), OCR not re-evaluated since 2020, Document AI, Confidential, M / High ($340k a year), sponsor Sarah Chen.
- 5-Whys: support replies take 48 h, so the root cause is an ownership gap, not a tooling gap (deck); slow invoices, so modern OCR re-evaluation, not more headcount (trainer's notes).
- The lead-prospecting agent: about $10K year one, about $16K a year back, break-even about month 8; watch-out: the ICP rubric drifts.
- The HR and Finance spotlights: tax payment workflows, bank reconciliation, HR policy RAG bot (tier the access by role).
- Lines to keep: "Automating a flawed workflow just makes the flaw run faster"; "integration is the silent killer of AI POCs"; "AI is fast at draft, slower at calibration".
- The trainer's most common stumble: pain collapsed into opportunity ("no contract metadata" > "add contract metadata").

**The NorthRiver case** (the persona cards from L1): Sarah Chen (CFO), Henrik, Marcus Holloway, Anita, Diana Vasquez, Robert Pak, Lin Zhao, and their pains (in `FACTS.md`).

**What students receive, fill in, submit or answer**
- What they bring in from L1 and L2: the Interview Log, the process inventory (their rows and the second-department rows), and their top ten pains ranked by gut feel.
- The class worksheet (booklet V4): 10 cards with the V2 template, with the aims (4 departments, 3 of the 4 categories, 2 Restricted, 1 process redesign); the Fishbone exercise; the peer review checklist (9 items).
- The workbook page `m2l3-opportunity-cards` (one model card plus the Fishbone).
- The home practice `m2l3-homework-opportunity-cards`: 5 more cards (15 in total), an AI classification check, an AI sensitivity scan, a PDF uploaded to Blossom.
- The module knowledge check: the items that depend on this lesson are Q1, Q4, Q6, Q12, Q13, Q18 and Q19.
- The capstone: the cards carry through L4 to L6.

## Its place in the course
- **The module**: one engagement, "Walk in. Listen. Map. Prioritize. Pitch." L3 is the step from Map to Prioritize. The shortlist that comes out of M2 is the learner's build target in Module 4.
- **L1, Discovery (class)**: a pair interview with a NorthRiver persona card. The learner leaves with an **Interview Log** (top three pains, each with a quote and a Pain Owner; 3 + 3 "reading between the lines") and a NotebookLM summary. L1 ends on "AI is the tool. Value is the goal", and L3 opens with the same line.
- **L2, As-Is mapping (class)**: a swimlane of a NorthRiver finance process, rows in the **process inventory** (process, owner, systems, pain, Content World tag), three pains each with a quote and a Pain Owner. Home practice: a second department, 3 to 5 more rows. The last slide: **"Bring your inventory and your top ten pains tomorrow, ranked by gut feel."** These ten pains are the raw material of L3.
- **What L1 and L2 already taught that L3 uses**: the Pain Owner field (already on the L1 and L2 worksheets), documentation hygiene (every finding maps back to a quote), the data-handling rule before you paste into AI, Critical Eye on AI drafts, the 3 Content Worlds.
- **After, L4 (class)**: scores and segments the cards (Value vs Effort, RICE / ICE / MoSCoW, Quick Wins / Strategic / Next Bets, weighted voting, the four plays). It needs every card with Effort and Value filled in, weak ones included, and asks for "your top five with full card detail" for L5.
- **Then**: L5 (self-study) ROI for the top five; L6 (class) roadmap and the 10-slide deck, with the Pain Owner named. **This is the first self-study lesson of the course** (Module 1 is all in class).

## Sources
Read (view only, in your Chrome):
- Deck EAI-M02-L03, all 23 slides with speaker notes: https://docs.google.com/presentation/d/1bjWwqjBiotMAwzul5tBeUFqotEvyGyFDXOUbW6-C-R8/edit
- Trainer Guide V3 (front matter, the Lesson 2 end, the whole Lesson 3, the Round 3 additions): https://drive.google.com/file/d/1uW9G7qQsk4tf_G-HJtrLmOjkziOlOdGz/view
- Class Practice Booklet V4 (the persona cards, the Five-Category frame, the Lesson 3 worksheet, the checklist): https://drive.google.com/file/d/11v2gwpH1m1Xfhn0WMkoDX5hD4-4BnPvu/view
- Knowledge Check V2 with its key: https://drive.google.com/file/d/1_ze-BKIJNH2vz12d9wfZxdMM-16A4G4n/view
- Detailed Outline V3 (Lessons 2 and 3 in full, the start of Lesson 4): https://drive.google.com/file/d/1T-5b0AiDH9T9mg3RzgkSvrVw3lPPKENS/view
- Deck EAI-M02-L01, 22 slides with notes: https://docs.google.com/presentation/d/1w0dbuf3Rf0tGGuabHnq_ALd-H2-8VNWXgVeNwYzqCkg/edit
- Deck EAI-M02-L02, 16 slides with notes: https://docs.google.com/presentation/d/1YZM8_PXHWsvqs1oslv24vC2Re9f6bA9wkuBsubr17t0/edit
- Deck EAI-M02-L04, 15 slides with notes: https://docs.google.com/presentation/d/1Xau_jqsb8D56B_7dz3TImXYANxX-jtzm35sDAAQdWbY/edit
- Decks EAI-M02-L05 and L06, slide titles only: https://docs.google.com/presentation/d/1oFW1pItIb2LOnnvz8RMQnoMwU_A_JvPZEcy46uN877c/edit , https://docs.google.com/presentation/d/1lkiJ4mjUudjH6jRBP4sFpzk6oWLtbzXh6X5MUq84rAA/edit
- Local: `Self- Study/EAI/EAI_self_study_mapping_M1-M7.xlsx`; the practice pages `m2l1-pair-interview`, `m2l2-as-is-mapping`, `m2l2-homework-second-department`, `m2l3-opportunity-cards`, `m2l3-homework-opportunity-cards` in `wawiwa-activities/enterprise-ai-implementation/`.

Not on Drive: the NorthRiver case pack transcripts and a Home Practice Booklet (the Module 2 folder holds neither). Not read: the Capstone Brief V4 and the full module deck V4 (the six lesson decks cover the same slides).

## Decided from the materials (no question needed)
- **The 10 pains** are the learner's own top ten from L1 and L2 (L2's last slide). A learner with fewer than ten completes the list from the NorthRiver persona cards.
- **10 cards** in the lesson (slide 22, the mapping); 15 after the home practice. Slide 23's "twenty minimum" is not repeated; its point stays: bring every card, weak ones included.
- **Governance pointer** to Modules 3 and 6, as the deck says.
- **The lesson deck is the source**; the trainer guide's slide numbers belong to the full module deck and are matched by topic.
- **The cast stays as the course built it**, "Eli Tannenbaum" included (Noy).

## Open (learning design)
**The workbook.** In class the cards went into a card register the trainer sets up in Notion or Airtable. The paper worksheet and the Rise page `m2l3-opportunity-cards` hold one card form, as the model, plus the Fishbone. At home there is no register. Recommendation: a new lesson workbook beside the old page, with room for 10 cards, the Fishbone, the self-review checklist and a PDF export. The old page stays as it is.
