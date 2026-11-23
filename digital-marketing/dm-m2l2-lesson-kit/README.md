# DM M2 L2 on the kit: Strategy and Research, Building the Plan

A copy of `digital-marketing/dm-m2l2-lesson` (the live lesson, unchanged) rebuilt on the shared self-study kit (`_selfstudy-kit`, kit 0.1.0, profile `dm`). KIT-PLAN.md step 2: the same lesson, the same screens, with the kit's additions. When Noy approves it, its files can replace the live folder's, so the live link (Rise, the hub) stays the same.

## What is this lesson's own

| Path | What it holds |
|---|---|
| `kit.json` | the kit version and profile, and this lesson's settings (content file, storage key, id prefix, coach page, port 8141, hub ids) |
| `content/m2l2.json` | every word the learner sees (as the live lesson, plus the changes below) |
| `lesson.css` | the option `cover-fade` (the title screen's cover photo) |
| `tests/` | `states.mjs` (every screen state), `walk.mjs` (the keyboard walk), `check.mjs` (the work order's rules and contrast pairs) |
| `assets/` | photos, films, audio (fonts and logo come from the kit) |
| `planning/` | the build's reports and the handoff, as in the live lesson |

Everything else (`src/`, `tools/`, `index.html`, `review.html`, `assets/fonts`, `assets/logo`) is the kit's copy: never edit it here; change `_selfstudy-kit`, then `npm run kit:sync`.

## What differs from the live lesson

- **No screen-id CSS**: O1 (`cover-fade`), S11B (`case-heading`) and S35 (`compact`) name their look in the content (`screen.styles`). Nothing visible changes.
- **The score** comes from all 24 graded questions along the lesson (the check's five among them), pass mark 80, **one attempt, no retake**: CHKR shows the lesson's score and no "Retake now"; its not-passed line and coach tip, and END's retake hint, no longer mention a retake.
- **Speeds** 0.5 and 0.75 in the film player's speed menu and the podcast's speed chip.
- **review.html** has the slim top line: Back to the hub, Open as a learner.

## Preview and tests

```powershell
npm run serve
```

Then `http://127.0.0.1:8141/review.html` or `http://127.0.0.1:8141/?reset=1`. Tests: see `_selfstudy-kit/README.md` (check, test:fit, check:overflow, walk, test:scorm, test:review, shots, package).
