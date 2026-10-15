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
| `src/state.js` | P0 stub: place and done screens in localStorage (P4 adds the SCORM codec) |
| `src/demo.js`, `src/templates/placeholder.js` | dev-only stand-ins until the P1 templates exist |
| `assets/logo/wawiwa-logo.png` | decoded unchanged from `../_wawiwa-logo.b64` |
| `tools/` | `serve.mjs` (local server), `check.mjs` (build check), `test-fit.mjs` (fit, keyboard, screenshots) |
| `review/p0/` | P0 screenshots |

## Preview

```bash
npm install
npm run serve
```

Then open `http://127.0.0.1:8125/`. URL options: `?demo=1` (every feedback row state, `&fb=hint|correct|wrong|neutral|pause`), `?screen=S03` (dev jump), `?reset=1` (clear the saved place).

Checks: `npm run check` (content, dashes, icons, CTA size, contrast table, no text in `src/`) and `npm run test:fit` (three window sizes, zones, keyboard, progress bar; add `-- --shots` for `review/p0/`). Chrome is found on its own, or set `CHROME_PATH`.

## Phase status

| Phase | Status |
|---|---|
| P0 scaffold, tokens, frame, menu, feedback row, progress bar | done (15 Oct 2026) |
| P1 templates and slice screens | next |
| P2 V1 video production | not started |
| P3 video player, handoff, return checkpoint | not started |
| P4 SCORM 1.2 adapter and packaging | not started |
| P5 tests and review page | not started |
