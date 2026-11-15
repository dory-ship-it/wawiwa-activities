# DM M2 L2 self-study lesson: Strategy and Research, Building the Plan

A Storyline-style self-study lesson built in code for the Digital Marketing Specialist course, Module 2 Lesson 2. A fixed 1280x720 stage, driven from one content JSON, SCORM 1.2 for Blossom, a review page and offline AI coach tips.

Forked from `enterprise-ai-implementation/eai-m1l4-selfstudy-v3` (the template): the look, buttons, navigation, shell and UX rules are the template's. Each screen starts from its deck slide and only adds interaction. The class practice is done in the existing Practice Studio workbook `digital-marketing/dm-m2l2-selfstudy`; the lesson stops where the trainer would stop the room (the workbook stops), sends the learner there in a new tab and brings them back.

**Phase 1 (this build): chapters Opening, Where are we?, Our goals (deck slides 1 to 12), 18 screens.** The report, the screen list and the screenshots are in `planning/REPORT-P1.md` and `planning/shots-p1/`.

## Folders

| Path | What it holds |
|---|---|
| `index.html` | page shell: strict CSP (nothing framed, same-origin only), boot error, loads `src/` |
| `content/m2l2.json` | ALL learner-facing text. Every word comes from the deck, its speaker notes, the trainer guide or the practice PDFs; new UI copy is marked `pilotCopy` |
| `src/tokens.css` | design tokens (the template's, plus three muted accents for slide 11's goal cards); the only hex values allowed in `src/` |
| `src/frame.css`, `fx8.css`, `v2.css` | the template's styles, unchanged |
| `src/dm.css` | the styles of this lesson's own screens |
| `src/engine.js`, `zones.js`, `menu.js`, `state.js`, `ghost.js`, `tracking/`, `coach/` | the template's engine, shell, state codec, ghost hand, SCORM 1.2 adapter and coach (offline tips; the live coach is not wired) |
| `src/templates/` | the template's templates (title, moduleMap, opener, decision, sortDeck, video and the rest) |
| `src/templates/dm.js` | this lesson's templates: `bring` (O3), `workbookStop` (WB0 to WB3), `questionTiles` (S05), `questionCards` (S06), `dimensionMap` (K1), `goalCards` (S11), `closing` (K2, K3), and the shared key line and four-node board |
| `src/review/` | review mode toolbar, the review page, the word counter (never in the SCORM package) |
| `assets/img/m2l2/` | real pictures from the deck: the cover photo (slide 1) and the Google Analytics screenshot (slide 5) |
| `assets/img/temp/`, `assets/img/prompts/` | placeholder photos (plain gradients) and one prompt file per image slot, all in one photographic language |
| `assets/video/temp/` | the silent placeholder of film V1 and its captions (from `tools/make-placeholder-video.mjs`) |
| `tools/` | `serve.mjs`, `check.mjs`, `stamp.mjs`, `states.mjs` (every screen state, shared by the tests), `test-fit.mjs`, `check-overflow.mjs`, `walk.mjs`, `test-review.mjs`, `package-scorm.mjs`, `shots.mjs`, the SCORM mock |
| `planning/` | `REPORT-P1.md`, `shots-p1/` |

## Preview

```bash
npm install
```

```bash
npm run serve
```

Then open `http://127.0.0.1:8140/review.html` (the whole lesson at a glance: one row per chapter, every screen a live thumbnail with its id, template and word count) or `http://127.0.0.1:8140/` (the lesson). URL options: `?screen=S05` (jump), `?reset=1` (clear the saved place), `?review=1` (review mode: Next never locks, nothing is tracked or saved), `?debug=1` (tracking events in the console).

## Checks

| Command | What it checks |
|---|---|
| `npm run check` | content, word budget (practice 35, presentation 45, feedback 20; screens kept over it by the work order are listed as a WARNING), key lines, dashes, icons, tokens and hex allowlist, contrast table, image slots (WARNING for placeholders), tracking metadata, the coach, the lesson's own rules |
| `npm run test:fit` | every screen in every state at 1280x720 and 1024x576 (`-- --all` adds four wide windows): nothing clipped or overlapping, rendered contrast, 14 px text, 44 px targets; the menu; the coach panel |
| `npm run check:overflow` | every state at 1280x720, 1024x576 and 1920x950: content out of its panel, overlapping blocks, text off the stage or on the nav row |
| `npm run walk` | keyboard-only walk of the whole lesson: focus on the h1 of every screen, locked Next with its reason, feedback equal to the content, the workbook link in a new tab, the menu, the coach, resume |
| `npm run test:scorm` | the same walk against a mock SCORM 1.2 API: interactions, status, suspend data, session time, resume |
| `npm run test:review` | review mode writes nothing; the review page shows every screen |
| `npm run package` | `dist/dm-m2l2-lesson-scorm12.zip` (git-ignored) |
| `node tools/shots.mjs` | screenshots of every screen state into `planning/shots-p1/` |

After any change in `src/` or the two pages run `npm run stamp` (the version stamp on every link; `npm run check` fails while it is stale).

## Tracking

Interactions (all practice, weighting 0): `M2L2_S07_1` (matching), `M2L2_S11B_1` (choice), `M2L2_V1_1`, `M2L2_V1_2` (choice). The S05 and S06 answers, the opened rows, tiles, dimensions and goal cards and the "workbook opened" flags stay in the lesson state (`cmi.suspend_data`, or localStorage key `wawiwa.dm.m2l2.lesson` outside an LMS). There is no scored check in this phase, so `lesson_status` stays `incomplete`; the completion rule is the template's until the wrap-up chapter exists.

## Not done in this phase

- The later chapters (From analysis to a work plan, Simulations, The marketing funnel, Close). The chapters menu already lists them as "coming in a later part".
- Real photos (Noy chooses a direction) and the real film V1 (Dor's pipeline).
- The live AI coach (pending Dor's confirmation): `src/coach/live.js` has no URL and the engine starts the coach with `live: false`.
