# HANDOFF — EAI Module 4, Guy's review of Lessons 6 and 7 (1 Nov 2026)

Written by Claude in Cowork (Cowork does not commit here). Open Claude Code in this folder and say: "continue from HANDOFF.md".

## Already done (outside this repo, nothing to redo)
- Live Google Slides, edited in place: L6 `1yUQTRVjeKZvsldGcnrju7N2Rkqh30ZTR7T-MkL9fSlY`, L7 `11U9Bg3JxGkreSts_tHAnJPQYWo_mW_f6jmQkSZLpU-U`. S3 viewers M4-Lesson6 and M4-Lesson7 republished.
- Local decks and both trainer guides on the drive (Module 4 — Vibe Coding). The exact slide edits: `Claude Wawiwa/Curriculum/outputs/eai_m4/guy_review_1nov_edits.json`.

## Decisions (Dor, 1 Nov 2026)
- L6: every example is the Lesson 2 request tracker (the screenshots already are). Test keys only; read every permission screen before approving.
- L7 practice order: tests 1 to 4 first; fix only a problem they found; then test 5 (re-test). Nothing found = no fix, no re-test, valid result. Never invent a problem.
- L7: no required number of roles or users. Each participant checks the permissions relevant to their own system.
- L7 submission: work in pairs; each person submits their own project file / one-page handover; the trainer sets the date.

## To do in this repo
1. `enterprise-ai-implementation/eai-m4l6-class/index.html`
   - Intro line "Dummy data only, and no real key of any kind, in any project." → "Dummy data and test keys only, never a key from a real system. Read every permission screen before you approve it."
   - Add one checklist item next to the key items: "I read the permission screen before approving it".
2. `enterprise-ai-implementation/eai-m4l7-class/index.html`
   - "Run the five tests." → "Run tests 1 to 4." Test 5 line "(finish it in Stage 3)" → "only after a fix in Stage 3".
   - Remove the requirement "Two roles, and two users in the same role" → "The permissions your system really has (no minimum number of roles or users)".
   - Stage 3 "One focused fix, then the re-test" → "Fix only if a test found a problem, then the re-test"; replace "No gap found? That is a result. Add a test instead, or choose one small improvement from your UX report." with "No problem found? That is a result. Nothing to fix and no re-test. Do not invent a problem."
   - Stage 1 "mark one high-priority gap" → "mark a high-priority gap if you know of one".
   - "Evidence: the five tests recorded" → "Evidence: the tests you ran, recorded".
   - Check the coach system prompt for "five tests", "two roles", "add a test instead", "small improvement" and align it.
3. `enterprise-ai-implementation/eai-m4l7-home/index.html`
   - "the five test scenarios" → "the test scenarios you ran".
   - Add to the intro: "The project was built in pairs; each person submits their own page, on the date the trainer sets."
4. If any page height changes, re-measure embedHeight (CLAUDE.md rule) and update deliverables.json; tell Dor which Rise blocks need the embed re-pasted.
5. Commit; Dor pushes in GitHub Desktop. Delete this HANDOFF.md in the same commit.

---

# HANDOFF 2 — EAI Modules 1 and 2, Guy's QA report (1 Nov 2026)

Written by Claude in Cowork. Source: Guy's QA report, text at `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/Slide Decks/Enterprise AI Implementation Specialist/_MAINTENANCE/QA Report - EAI Modules 1-4 (Guy, 31 Oct 2026) - text.txt` (finding codes M1-xx / M2-xx). Module 2 opens to students on 2 Nov, so do the M2 items first.

## Already done (outside this repo)
- Live Google Slides M1 L1-L6 and M2 L1/L3/L4/L6 edited in place; all 12 M1+M2 S3 viewers republished 1 Nov 15:20.
- Rise M1 and M2 text fixed (nine fields, L3 homework, ten fields, 4-level sensitivity, capstone client wording, etc.).
- Capstone client decision (Dor, 1 Nov): NorthRiver case pack is the default; a student who already has a real organization may use it instead, anonymized. Helix and Camden case packs do NOT exist; remove them everywhere.
- Sensitivity decision: 4 levels everywhere, Public / Internal / Confidential / Restricted. Data type (personal, customer, employee, financial) is a separate optional tag.

## To do in this repo (enterprise-ai-implementation/)
1. `m2l1-homework-question-bank/index.html`
   - Case dropdown options NorthRiver / Helix / Camden -> NorthRiver / My own organization (anonymized).
   - The 30-question prompt: replace the five categories "(Current State, Pain and Cost, Data and Systems, Decisions and Ownership, Appetite and Constraints)" with the lesson's five: "(Existing structure and processes, Challenges and interfaces, Systems and tools, Management and control routines, Improvements and opportunities)". (M2-02)
2. `m2l2-homework-second-department/index.html` - "Content World" dropdown options Documents / Data / Decisions / Spans two -> "World 1: Core Systems" / "World 2: Operations & Methods" / "World 3: Complementary" / "Spans two". (M2-10)
3. `m2l3-homework-opportunity-cards/index.html` - Solution category dropdown (6 rows) and the "Classify the register" prompt: Assisted / Automated / Augmented / Autonomous -> "Agent & Copilots" / "Workflow Automation" / "BI" / "Document AI-OCR" / "Process Redesign". Also 6 rows -> 5 rows for "Add 5 more opportunity cards". (M2-14, M2-45)
4. `m2l4-homework-shortlist/index.html` - Type dropdown Quick Win / Strategic / Foundational -> Quick Win / Strategic / Next Bet (keep Foundational only if you add a one-line definition: "foundation work such as master data, needed before other items"). 6 rows -> 5 for "Top 5". (M2-24, M2-45)
5. `m2l5-homework-roi/index.html` - label the savings field "Annual savings, before any buffer"; `var base=num('roi_inv')` is unused and reads the wrong field: either use the "Annual cost baseline" field to warn when savings > baseline, or remove the field. (M2-28)
6. `m2l6-homework-capstone/index.html` - "Grading: feeds the capstone (not graded alone)" -> "Grading: this is the capstone (60% of the module grade)". (M2-35)
7. `m2-mini-project/index.html` - remove Helix / Camden; allow "your own organization, anonymized"; "(Slide 18 rule.)" -> "(Lesson 1 data-handling rule.)"; where it asks for a "pattern" from eight, call it "category" (8) and keep "pattern" for the 3 qualitative patterns. (M2-32, M2-39, M2-42)
8. "mirror of slide 26" (m2l2-as-is-mapping), "mirror of slide 70" (m2l4-prioritization), "mirror of slide 83" (m2l5-roi) -> name the lesson slide instead, e.g. "mirror of the Lesson 2 swimlane slide". (M2-42)
9. `eai-m1l1-class/index.html` Case 1: "about 90 requests a month" -> "about 90 requests a week". Must match the Rise and decks (HR case: ~35% of HR time, target 20% in 3 months). (M1-02)
10. `m1l1-diagnosis-call-game/index.html` title: remove "(Scenario Game Prototype)". (M1-03)
11. Every practice page that exports a PDF: add one fixed line "Export PDF and upload it in Blossom > Module X > Lesson Y homework submission". (M1-R7) Lower priority.
12. Coach system prompts / grounding of the pages above: align the same strings.
13. If any page height changes, re-measure embedHeight and update deliverables.json; tell Dor which Rise blocks need the embed re-pasted.
14. Commit; Dor pushes in GitHub Desktop. Delete this HANDOFF.md only when HANDOFF 1 (above) is also done.
