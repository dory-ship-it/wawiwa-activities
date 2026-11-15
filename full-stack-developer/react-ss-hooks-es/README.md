# React Hooks self-study (Spanish): practices for Rise 360

Alternative to the Rise lesson "Autoaprendizaje - Hooks". Work-order and storyboard: `planning/`. Reports per phase: `review/`.

## Layout

- `shared/`: `build.mjs`, `practice.css` (the look of the Node `-es` self-study pages), `practice.js` (fit to the frame, screens, answers, Copy), `strings.es.js` and `strings.en.js` (labels every page uses), `fonts/` (Assistant, JetBrains Mono), `wawiwa-logo.png`.
- One folder per page, each with `strings.es.js`, `strings.en.js`, and the generated `index.html` (Spanish) and `index.en.html` (English):

  | Folder | Page | Screens |
  |---|---|---|
  | `p1-usestate/` | Práctica 1 · useState | 5 |
  | `p2-useeffect/` | Práctica 2 · useEffect | 8 |
  | `p3-limpieza/` | Práctica 3 · Limpieza | 8 |
  | `p4-useref/` | Práctica 4 · useRef | 7 |
  | `p5-hooks-propios/` | Práctica 5 · Hooks personalizados | 10 |
  | `checkin/` | Autoevaluación: Hooks de React | 6 |

## Edit or translate

1. Change text only in a `strings.<lang>.js` file. Text between backticks is code: keep it as is. `**text**` is bold.
2. Rebuild the page in both languages, for example `node shared/build.mjs p3-limpieza` (Spanish, writes `index.html`) and `node shared/build.mjs p3-limpieza en` (writes `index.en.html`). The build prints a line for any text over the word limits and for a code card too wide or too tall for its screen.
3. Never edit a generated HTML file by hand.
4. A code card that changed must run again: `review/p3/snippet-check/README.md`. A text that changed length must fit again: the header of `review/p3/tools/shots.mjs`.

## Screen types (the `type` of a screen in a strings file)

| Type | What the learner does |
|---|---|
| `choice` | picks one option; instant verdict; can retry; Continue opens after the right one |
| `multi` | marks every option that applies, then Check |
| `order` | clicks lines into a mock console in the order expected |
| `steps` | reads the task and its steps (and copies the code, if the screen has a card), then presses the button |
| `paste` | pastes the browser console; the page keeps the lines it knows and shows them next to the measured ones |
| `value` | types what the screen shows; compared trimmed, lower case, accents ignored |
| `solution` | the solution code with Copy; reached only through «Ver solución» |
| `takeaway` | the closing points and the line that sends the learner back to Rise |

A page with `checkin: true` has no step pills and numbers its questions; with `shuffle: true` its options are shown in a new order on every visit.

## Frame

One 1000 x 560 canvas, scaled as a whole to the frame (Rise keeps the embed's width:height ratio). No network requests outside this folder.
