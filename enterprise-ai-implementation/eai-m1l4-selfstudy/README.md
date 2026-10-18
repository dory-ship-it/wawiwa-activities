# EAI M1 L4 self-study: Process Modeling and Workflow Mapping (pilot slice)

The first Storyline-style self-study lesson built in code: a fixed 1280x720 stage, five templates, a narrated video with in-video questions, a handoff to the `eai-m1l4-class` workbook, and SCORM 1.2 for Blossom. Plan and work-orders: `planning/` (start with `planning/PRD.md`).

## Folders

| Path | What it holds |
|---|---|
| `index.html` | page shell: strict CSP, boot error, loads `src/` |
| `content/l4-slice.json` | ALL learner-facing text (live copy; `planning/content/` is the frozen original) |
| `src/tokens.css` | design tokens of the approved look (P1.5 table, the only hex values allowed in `src/`) |
| `src/fonts.css`, `assets/fonts/` | self-hosted Assistant (400, 600, 700, 800) and Roboto (400, 500, 700), latin woff2 |
| `src/frame.css` | stage, shell (rail, footer, band), the five layouts, menu, dialogs |
| `src/main.js`, `src/engine.js` | boot, stage scaling, routing, screen lifecycle, focus, Previous / Next, rail and menu models, resume hook |
| `src/zones.js` | shell: chapter rail (menu button, dots, % done, Saved), footer (Previous, Next), logo, instruction h1, feedback band |
| `src/menu.js` | chapters menu (380 px left panel: progress, chapter list, Resources, Help, Start over) and the in-page dialog |
| `src/tooltip.js`, `src/icons.js` | glossary terms and tips; Lucide stroke icons (ISC), chapter status marks |
| `src/templates/stage.js` | layout parts: image slot, rule label, privacy line, arrow-key option groups |
| `src/templates/decision.js` | Decision template: `single`, `challenge`, `multi`, `safety` (S18), `selfcheck` (S20), `close` (S22, lesson record download, Finish) |
| `src/templates/input.js`, `sort.js`, `explorer.js`, `video.js` | Input (S02), Sort (S04, S09, S16, S17, S18A), Explorer (S05 and others), Video player with stops (V1, V2) |
| `src/templates/handoff.js`, `check.js` | S19 handoff to the class workbook (new tab) and return metric; S21 knowledge check (first attempt scored) |
| `src/tracking/index.js` | tracking event bus (answer, retry, route, finish) and adapter choice: `scorm12.js` when an API is found on the parent or opener chain, else `local.js` |
| `src/state.js` | state and its codec: localStorage locally, `cmi.suspend_data` (under 4096) in the LMS |
| `assets/logo/wawiwa-logo.png` | decoded unchanged from `../_wawiwa-logo.b64` |
| `assets/img/` | image slots: `prompts/` (one generator prompt per slot), `temp/` (board reference images until the real ones exist), `refs/` (style reference) |
| `tools/` | `serve.mjs` (local server), `check.mjs` (build check), `test-fit.mjs` (fit, band, clipping, contrast, targets per screen state), `walk.mjs` (keyboard-only walk: rail, menu, every slice path), `lib.mjs` (shared), `scorm-mock.js` / `scorm-mock.html` (mock SCORM 1.2 API, dev only), `package-scorm.mjs` (the zip) |
| `review/p0/` to `review/r3/` | screenshots and phase reports |

## Preview

```bash
npm install
npm run serve
```

Then open `http://127.0.0.1:8125/`. URL options: `?screen=S03` (dev jump), `?reset=1` (clear the saved place), `?debug=1` (tracking events in the console).

Checks: `npm run check` (content, dashes, icons, Next size and red on Next only, contrast table, hex allowlist, image slots with a WARNING for temp images, offline fonts, no text in `src/`, word counts, tracking metadata), `npm run test:fit` (three window sizes, the shell, every screen and band state at 1280x720 and 1024x576: band overlap and width, clipping, rendered contrast, 14 px text, 44 px targets) and `npm run walk` (keyboard-only walk of the rail, the menu, S01, S02, FT1 and S03 on every path; add `-- --shots` for `review/p1.5/` and the artboard comparisons). Chrome is found on its own, or set `CHROME_PATH`.

SCORM 1.2: `npm run test:scorm` walks the lesson against the mock API (interactions, status, score, session time, suspend size, resume). `npm run package` writes `dist/eai-m1l4-selfstudy-scorm12.zip` (git-ignored) with `imsmanifest.xml` and only the files the page loads. For a manual LMS-like run: `npm run serve`, then `/tools/scorm-mock.html`.

## Phase status

| Phase | Status |
|---|---|
| P0 scaffold, tokens, frame, menu, feedback row, progress bar | done (15 Oct 2026) |
| P1 templates and slice screens (S01, S02, FT1, S03), event bus, P0 follow-ups | done (15 Oct 2026) |
| P1.5 approved look (rail, footer, feedback band, S01 S02 FT1 S03), image slots | done (18 Oct 2026) |
| P2 V1 video production | in progress (separate session; the lesson plays placeholders from `assets/video/temp/`) |
| R1 to R3 Chapters 2 to 6, video player, handoff, knowledge check, close | done (18 Oct 2026) |
| P4 SCORM 1.2 adapter and packaging | done (18 Oct 2026) |
| P5 tests and review page | not started |
