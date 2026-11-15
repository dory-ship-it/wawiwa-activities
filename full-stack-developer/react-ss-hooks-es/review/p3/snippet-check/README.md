# P3 snippet check (15 Nov 2026)

Every code card of the five practices, run exactly as the strings files hold it (the test writes each card's `lines` into a file under its own name, byte for byte, Spanish and English). The check-in has no code card.

## Versions it ran on

React 19.3.1, react-dom 19.3.1, Vite 8.3.8, @vitejs/plugin-react 6.3.0 (what `npm create vite@latest -- --template react` gave on 15 Nov 2026), dev server, `<StrictMode>` on (the Vite default, so the same as a learner's project). Driven by puppeteer-core 25.17.0 with Google Chrome, headless. Lint: the template's own oxlint 1.93.0 on the card files, output in `lint-output.txt`.

`FirstUser.jsx` and `useDataApi.js` call the real `https://jsonplaceholder.typicode.com`, so the run needs the network.

## Rerun

Outside the repo:

```bash
npm create vite@latest hooks-lab -- --template react --no-interactive
```

In `hooks-lab/`: `npm install`, `npm install -D puppeteer-core`, copy `run-tests.mjs` from this folder into it, then `node run-tests.mjs <path to react-ss-hooks-es>`. It rewrites the lab's `src/App.jsx` and `src/p3/`. Compare with `output.txt`.

## What it measures

What a test expects is read from the same strings file as the card (the paste screen's expected lines, the value screen's expected answer, the right option), so a text that promises something the code does not do fails the run.

| Page | Card | Measured |
|---|---|---|
| P-1 | `Counter.jsx` | 0 at mount, 3 after 3 clicks; with `setCount((c) => c + 1)` twice (the line shown after the right answer): 6 |
| P-1 | `ShowHideMessage.jsx` | message visible at mount, hidden after 1 and 3 clicks, visible after 4; the button label changes |
| P-2 | `ThreeEffects.jsx` (three screens) | console at mount A B C A B C, after one click A C, after two letters A A: the paste screen's expected lines, and the right options of the two predictions |
| P-2 | `FirstUser.jsx` | «Cargando...» first, then Leanne Graham; 2 requests in development |
| P-3 | `WindowSize.jsx` (two screens) | 2 resizes print 4 lines, 1 resize after hiding prints 2. With the right option's line added: 2 and 0. With "remove it right after adding it": 0 and 0. With `[handleResize]` in the array: the page stops with "handleResize is not defined" |
| P-3 | `Timer.jsx` + `App.jsx` | console on load, on hide and on show = the paste screen's expected lines; from the click on hide = the order screen's answer; the clock shows 0, 1, 2, 3 |
| P-4 | `RefVsState.jsx` | after 2 clicks on ref +1 the screen still shows 0 and 0; then 2 clicks on state +1: the right option |
| P-4 | `FocusInput.jsx`, `PreviousValue.jsx` | the click focuses the field; after 5 clicks the two numbers are 5 and 4 |
| P-5 | `useLocalStorage.js` + `Greeting.jsx` (two screens) | with the word stored by hand without quotes: greets the default name, storage becomes `""`; a typed name is stored between quotes (and passes the value screen's rule); it survives a reload; the clear button stores `""` |
| P-5 | `useDataApi.js` | through a test-only component: «loading» first; `/users` gives the list; `/users/999` gives «Error 404», then `/users/1` gives the name; network down gives «Failed to fetch»; the same hook without `setError(null)` keeps «Error 404» after the URL changes; two components with the same key: the second keeps its old value |

No console errors or warnings on any card, apart from the browser's own line for the 404 response.

Statements on screens that show no code (the four clock cases of P-3 screen 6, `focus()` causing no render in P-4 screen 1, the five check-in items) were measured in P0: `planning/snippet-check/`.

A new card needs a test in `run-tests.mjs`: a card with no test fails the run.
