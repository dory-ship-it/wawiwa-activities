# React Hooks self-study (Spanish): practices for Rise 360

Alternative to the Rise lesson "Autoaprendizaje - Hooks". Work-order and storyboard: `planning/`. Reports per phase: `review/`.

## Layout

- `shared/`: `build.mjs`, `practice.css` (the look of the Node `-es` self-study pages), `practice.js` (fit to the frame, screens, answers, Copy), `strings.es.js` and `strings.en.js` (labels every page uses), `fonts/` (Assistant, JetBrains Mono), `wawiwa-logo.png`.
- `p1-usestate/` (and later `p2-…` to `p5-…`, `checkin/`): `strings.es.js`, `strings.en.js`, and the generated `index.html` (Spanish) and `index.en.html` (English).

## Edit or translate

1. Change text only in a `strings.<lang>.js` file. Text between backticks is code: keep it as is. `**text**` is bold.
2. Rebuild: `node shared/build.mjs p1-usestate` (Spanish, writes `index.html`) and `node shared/build.mjs p1-usestate en` (writes `index.en.html`). The build prints a line for any text over the word limits.
3. Never edit a generated HTML file by hand.
4. A code card that changed must run again: `review/p3/snippet-check/README.md`.

## Frame

One 1000 x 560 canvas, scaled as a whole to the frame (Rise keeps the embed's width:height ratio). No network requests outside this folder.
