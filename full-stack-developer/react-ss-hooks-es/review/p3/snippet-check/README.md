# P3 snippet check (15 Nov 2026)

Every code card of a built practice, run exactly as the strings files hold it (the test writes each card's `lines` into a file byte for byte, Spanish and English). Built so far: P-1.

## Versions it ran on

React 19.3.1, react-dom 19.3.1, Vite 8.3.8, @vitejs/plugin-react 6.3.0 (what `npm create vite@latest -- --template react` gave on 15 Nov 2026), dev server, `<StrictMode>` on (the Vite default, so the same as a learner's project). Driven by puppeteer-core 25.17.0 with Google Chrome, headless. Lint: the template's own oxlint 1.93.0 on the six card files, exit code 0 and no findings printed.

## Rerun

Outside the repo:

```bash
npm create vite@latest hooks-lab -- --template react --no-interactive
```

In `hooks-lab/`: `npm install`, `npm install -D puppeteer-core`, copy `run-tests.mjs` from this folder into it, then `node run-tests.mjs <path to react-ss-hooks-es>`. It rewrites the lab's `src/App.jsx` and `src/p3/`. Compare with `output.txt`.

## What it measures (P-1)

- `Counter.jsx` (screen 1): 0 at mount, 3 after 3 clicks.
- The same card with `setCount((c) => c + 1)` twice (the line shown after the right answer): 6 after 3 clicks.
- `src/ShowHideMessage.jsx` (screen 4): message visible at mount, hidden after 1 and after 3 clicks, visible after 4; the button label changes.
- No console errors or warnings on any card.

When P-2 to P-5 are built, add their pages to `PAGES` and a test per card: a card with no test fails the run.
