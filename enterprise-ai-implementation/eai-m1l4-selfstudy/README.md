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
| `src/templates/decision.js` | Decision template: `single` (S01, editorial), `challenge` (FT1, memo), `multi` (S03, work); `selfcheck` is a P3 stub |
| `src/templates/input.js` | Input template (S02, form): fields, live counters, privacy line, Save |
| `src/tracking/index.js` | tracking event bus (answer, retry, route); P4 plugs the SCORM adapter in |
| `src/state.js` | local stub: place, done screens, first answers, route, stored text, retries (P4 adds the SCORM codec) |
| `src/templates/placeholder.js` | dev-only: placeholder for V1, S19, S20 until P2/P3 |
| `assets/logo/wawiwa-logo.png` | decoded unchanged from `../_wawiwa-logo.b64` |
| `assets/img/` | image slots: `prompts/` (one generator prompt per slot), `temp/` (board reference images until the real ones exist), `refs/` (style reference) |
| `tools/` | `serve.mjs` (local server), `check.mjs` (build check), `test-fit.mjs` (fit, band, clipping, contrast, targets per screen state), `walk.mjs` (keyboard-only walk: rail, menu, every slice path), `lib.mjs` (shared) |
| `review/p0/`, `review/p1/`, `review/p1.5/` | screenshots and phase reports |

## Preview

```bash
npm install
npm run serve
```

Then open `http://127.0.0.1:8125/`. URL options: `?screen=S03` (dev jump), `?reset=1` (clear the saved place), `?debug=1` (tracking events in the console).

Checks: `npm run check` (content, dashes, icons, Next size and red on Next only, contrast table, hex allowlist, image slots with a WARNING for temp images, offline fonts, no text in `src/`, word counts, tracking metadata), `npm run test:fit` (three window sizes, the shell, every screen and band state at 1280x720 and 1024x576: band overlap and width, clipping, rendered contrast, 14 px text, 44 px targets) and `npm run walk` (keyboard-only walk of the rail, the menu, S01, S02, FT1 and S03 on every path; add `-- --shots` for `review/p1.5/` and the artboard comparisons). Chrome is found on its own, or set `CHROME_PATH`.

## Phase status

| Phase | Status |
|---|---|
| P0 scaffold, tokens, frame, menu, feedback row, progress bar | done (15 Oct 2026) |
| P1 templates and slice screens (S01, S02, FT1, S03), event bus, P0 follow-ups | done (15 Oct 2026) |
| P1.5 approved look (rail, footer, feedback band, S01 S02 FT1 S03), image slots | done (18 Oct 2026) |
| P2 V1 video production | next |
| P3 video player, handoff, return checkpoint | not started |
| P4 SCORM 1.2 adapter and packaging | not started |
| P5 tests and review page | not started |
