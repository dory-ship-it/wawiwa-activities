# EAI M1 L4 self-study: Process Modeling and Workflow Mapping (pilot slice)

The first Storyline-style self-study lesson built in code: a fixed 1280x720 stage, five templates, a narrated video with in-video questions, a handoff to the `eai-m1l4-class` workbook, and SCORM 1.2 for Blossom. Plan and work-orders: `planning/` (start with `planning/PRD.md`).

## Folders

| Path | What it holds |
|---|---|
| `index.html` | page shell: strict CSP, boot error, loads `src/` |
| `content/l4-slice.json` | ALL learner-facing text (live copy; `planning/content/` is the frozen original) |
| `src/tokens.css` | design tokens (PRD section 6), mapped to Practice Studio `--ss-*` |
| `src/fonts.css`, `assets/fonts/` | self-hosted Assistant (400, 600, 700, 800) and Roboto (400, 500), latin woff2 |
| `src/frame.css` | stage, zones, buttons, menu, dialogs, feedback row |
| `src/main.js`, `src/engine.js` | boot, stage scaling, routing, screen lifecycle, focus, progress model, resume hook |
| `src/zones.js` | top bar (logo, chapter progress bar, Saved, Menu), instruction line, stage card, feedback row |
| `src/menu.js` | menu panel (chapter map, resources, help, start over) and the in-page dialog |
| `src/tooltip.js`, `src/icons.js` | glossary terms and tips; Lucide stroke icons (ISC) |
| `src/avatar.js` | character avatar slot: placeholder initial until `avatar.src` is set, "Fictional character" badge |
| `src/templates/stage.js` | stage card parts by role (top, middle, bottom) and arrow-key option groups |
| `src/templates/decision.js` | Decision template: `single` (S01), `challenge` (FT1), `multi` (S03); `selfcheck` is a P3 stub |
| `src/templates/input.js` | Input template (S02): fields, live counters, privacy line, Save |
| `src/tracking/index.js` | tracking event bus (answer, retry, route); P4 plugs the SCORM adapter in |
| `src/state.js` | local stub: place, done screens, first answers, route, stored text, retries (P4 adds the SCORM codec) |
| `src/demo.js`, `src/templates/placeholder.js` | dev-only: feedback-row demo; placeholder for V1, S19, S20 until P2/P3 |
| `assets/logo/wawiwa-logo.png` | decoded unchanged from `../_wawiwa-logo.b64` |
| `tools/` | `serve.mjs` (local server), `check.mjs` (build check), `test-fit.mjs` (fit, keyboard, space distribution), `walk.mjs` (keyboard-only walk of every P1 path), `lib.mjs` (shared) |
| `review/p0/`, `review/p1/` | screenshots and phase reports |

## Preview

```bash
npm install
npm run serve
```

Then open `http://127.0.0.1:8125/`. URL options: `?demo=1` (every feedback row state, `&fb=hint|correct|wrong|neutral|pause`), `?screen=S03` (dev jump), `?reset=1` (clear the saved place), `?debug=1` (tracking events in the console).

Checks: `npm run check` (content, dashes, icons, CTA size, contrast table, no text in `src/`, word counts, tracking metadata), `npm run test:fit` (three window sizes, zones, keyboard, progress bar, space distribution on the slice screens; add `-- --shots` for `review/p0/`) and `npm run walk` (keyboard-only walk of S01, S02, FT1 and S03 on every path; add `-- --shots` for `review/p1/`). Chrome is found on its own, or set `CHROME_PATH`.

## Phase status

| Phase | Status |
|---|---|
| P0 scaffold, tokens, frame, menu, feedback row, progress bar | done (15 Oct 2026) |
| P1 templates and slice screens (S01, S02, FT1, S03), event bus, P0 follow-ups | done (15 Oct 2026) |
| P2 V1 video production | next |
| P3 video player, handoff, return checkpoint | not started |
| P4 SCORM 1.2 adapter and packaging | not started |
| P5 tests and review page | not started |
