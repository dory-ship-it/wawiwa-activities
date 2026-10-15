# HOW TO RUN: EAI L4 self-study pilot slice

Six phases, one Claude Code session each (P2 takes two). Each phase builds, checks itself, commits locally and stops. You review, then start the next one. Nothing is pushed until you push.

## Before you start (once)
- Open Claude Code on **your local clone of `wawiwa-activities`** (the repo root, the folder that holds `enterprise-ai-implementation` and `genai-for-marketing`). Model: Opus 5.5. Effort: high (P5 can be normal).
- Have installed: Node 18 or newer, Google Chrome, Git. For P2 (video) also Python 3.10+ and ffmpeg; P2 checks this first and tells you the exact install command if something is missing.
- Run `git pull` first so you build on the latest `main`.
- Start every phase in a **new session** (`/clear` or a new window), so each phase reads its own work-order fresh.

## The prompts (paste one line per session)

| Phase | Paste this |
|---|---|
| P0 | `Read "enterprise-ai-implementation/eai-m1l4-selfstudy/planning/RUN ON OPUS - EAI L4 P0 scaffold, tokens, frame, menu.md" and run that phase exactly. Do not push.` |
| P1 | `Read "enterprise-ai-implementation/eai-m1l4-selfstudy/planning/RUN ON OPUS - EAI L4 P1 templates and slice screens.md" and run that phase exactly. Do not push.` |
| P2 part A | `Read "enterprise-ai-implementation/eai-m1l4-selfstudy/planning/RUN ON OPUS - EAI L4 P2 V1 video production.md" and run Part A only. Do not push.` |
| P2 part B | `Read "enterprise-ai-implementation/eai-m1l4-selfstudy/planning/RUN ON OPUS - EAI L4 P2 V1 video production.md" and run Part B. Direction: <1 or 2, plus your notes>. Do not push.` |
| P3 | `Read "enterprise-ai-implementation/eai-m1l4-selfstudy/planning/RUN ON OPUS - EAI L4 P3 video player, handoff, return checkpoint.md" and run that phase exactly. Do not push.` |
| P4 | `Read "enterprise-ai-implementation/eai-m1l4-selfstudy/planning/RUN ON OPUS - EAI L4 P4 SCORM 1.2 adapter and packaging.md" and run that phase exactly. Do not push.` |
| P5 | `Read "enterprise-ai-implementation/eai-m1l4-selfstudy/planning/RUN ON OPUS - EAI L4 P5 tests and review page.md" and run that phase exactly. Do not push.` |

Order: P0, then P1 and P2A (either order), P2B after you pick a direction, then P3, P4, P5.

## What to check after each phase
To look at the page yourself: in a terminal in the lesson folder run `npm run serve`, then open `http://localhost:8124/` (add `?screen=S03` to jump, `?debug=1` to see tracking).

| Phase | Look at | Check |
|---|---|---|
| P0 | `review/p0/` screenshots, `?demo=1` | Wawiwa look (navy, red only on the main button and progress line, Assistant font, real logo); menu works with the keyboard; feedback row never covers the card |
| P1 | `review/p1/` | Text spread over the card by role, not in one block; hint before action; correct teal, wrong dark red on pink; Continue only after correct; Dana placeholder labelled fictional |
| P2A | `review/p2/concept-1.png`, `concept-2.png` | Pick a direction; reply in the P2B prompt |
| P2B | `assets/video/v1.mp4` | **Listen** for pronunciation (Claude cannot hear); numbers and "per reports" on screen; no music; length about 2:45 |
| P3 | `review/p3/` and play V1 in the page | Stops at both questions; cannot skip past a question; workbook opens in a new tab; S19 return and S20 feel right |
| P4 | `review/p4/`, the zip in `dist/` | Resume prompt and debug panel; zip exists |
| P5 | `review/review.html` | Go screen by screen, write notes in the boxes, save the notes file; then follow `planning/SCORM-CLOUD-CHECKLIST.md` |

## What to bring back for review
- The phase report Claude prints at the end (copy it) and the screenshots folder for that phase.
- After P5: your saved review notes, the SCORM Cloud results (registration report), and the NVDA notes. Bring these to the planning model for the review round; fixes come back as a short "P5.1 fixes" work-order.

## When to push
- After you have looked at a phase and are happy, push it yourself (`git push`). Pushing publishes to GitHub Pages; the preview link becomes `https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy/`.
- Safe to push P0 to P3 for preview (nothing is linked from Rise or Blossom yet). Do not upload the SCORM zip to Blossom until SCORM Cloud passes.
- Never commit `dist/`, video frames or model files (the `.gitignore` from P0 covers them).

## If a phase stops early
That is by design when something is missing (for example ffmpeg for P2). Do what the report asks, then paste the same prompt again in a new session; the phase continues from its last commit.
