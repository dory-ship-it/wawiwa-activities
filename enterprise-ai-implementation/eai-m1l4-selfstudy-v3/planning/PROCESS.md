# PROCESS: EAI self-study pilot (Module 1, Lesson 4)

**Pilot.** The first self-study lesson of the Enterprise AI Implementation Specialist program built as a Storyline-style code module. Everything here is a pilot to evaluate before reuse in other lessons and programs.
Last updated: 2026-10-18.

## Where things live
| What | Where |
|---|---|
| Design principles (lesson-agnostic, all research) | Project doc `claude/ux-learning-design-principles.md` |
| Visual decisions, liked and rejected looks | Project doc `claude/design-decisions-log.md` |
| Lesson 4 storyboard v2 (screens, videos, answer key, SME questions) | Project doc `claude/L4-storyboard-v2.md`, copy in `planning/research/` |
| Wireframe of 8 sample screens | Artifact "Lesson 4 Wireframes" (claude.ai) |
| Design board (directions, approved, rejected) | Artifact "L4 Design Board" (Design type, claude.ai) |
| Build package (PRD, content JSON, work-orders, HOW TO RUN, IMAGE STYLE) | `wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy/planning/` |
| Wave 1 agent outputs (fact sheet, v1 storyboards, UX spec, reviews, simulated student) | `planning/research/` |
| The module code | `wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy/` |
| Phase reports and screenshots | `.../eai-m1l4-selfstudy/review/p0`, `p1`, `p2`, ... (`REPORT.md` in each) |

## Roles
- **Cowork, in this Project (planning model):** research, decisions with Noy, storyboard, work-orders, review of every phase.
- **Design artifact:** where screen designs are shown side by side, approved or rejected with reasons, and commented on.
- **Claude Code on Opus 5.5:** builds the real module from an approved design, one phase per session (`/clear` between phases), commits locally, writes `review/pN/REPORT.md`, stops.
- **Noy:** decides, runs each phase in Claude Code, does a 5-minute "taste gate" on localhost after every phase, pushes to GitHub herself.

## Phases so far
1. Discovery (Noy + planning model). Self-study replaces the frontal lesson; ~4 academic hours; English; desktop only; SCORM 1.2 for Blossom; workbook = existing Practice Studio `eai-m1l4-class`.
2. Research: UX (Mayer, Norman, Nielsen, Reeves), reference modules, video research (Guo, Szpunar, Brame), assessment and feedback (Wawiwa standard, Haladyna, Shute). Saved as the principles doc.
3. Wave 1 agents (10 agents, ~1.46M tokens): analyst, 3 writers, video, spec, UX, 2 reviewers, simulated student. Found real errors (facts, 35 years, data-safety contradiction, Chapter 3 repetition).
4. Consolidation to storyboard v2 (1 agent, ~0.27M tokens) after Noy's 8 decisions.
5. Wireframe of 8 screens (1 agent, ~0.13M tokens).
6. Build package (1 agent, ~0.22M tokens).
7. Claude Code: P0 frame and menu, P1 four screens, P2A video prep (script, timing, two concept stills). All passed review.
8. Taste gate after P1: Noy found the module colorless, "like a code page, not an e-learning module", menu overloaded. Build paused before the video.
9. Visual exploration in chat (several rounds, see the design log). Decision: move design choice to a Design artifact built on the Wawiwa Design System, then a P1.5 work-order applies the approved look.

## What we learned (apply to Lessons 5 and 6)
- Start every visual decision from the **Wawiwa Design System** artifact, not from a color list. Skipping it produced generic looks.
- Add a **taste gate** after the very first built screens, before any further phase. A clean test run does not mean the look is right.
- Wave 1 was too expensive for what it needed. Next time: the planning model writes the storyboard chapter by chapter with Noy; one agent reviews (checklist + simulated student). Expected ~250k to 400k tokens per lesson instead of ~1.5M.
- Keep the conversation short: open a new session in the Project per stage; everything durable goes into docs.
- The reviewers and the simulated student paid off; keep one adversarial review step.

## Open items
- Images: Dana portrait and office backdrop in the approved editorial photo style (`planning/IMAGE STYLE.md`).
- SME: 16 questions at the end of the storyboard (urgent before the video: "calls" vs "conversations", HBR 1990 title).
- Decisions still open: fast track only in chapters 1 to 4; what happens below 80% in the knowledge check.
- Confirm Blossom takes SCORM 1.2 (Noy believes yes).
