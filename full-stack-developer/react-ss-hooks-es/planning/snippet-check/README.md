# Snippet check (P0, 12 Nov 2026)

Every code snippet in the five films and the five practices, plus the original code from the English videos where it matters, run in a real app. P4 reruns this.

## Versions it ran on
React 19.3.1, react-dom 19.3.1, Vite 8.3.6, @vitejs/plugin-react 6.1.2 (what `npm create vite@latest -- --template react` gave on 12 Nov 2026), dev server, `<StrictMode>` on (the Vite default, so the same as a learner's project). Driven by puppeteer-core 25.17 with Google Chrome, headless.

## Rerun
Outside the repo:

```bash
npm create vite@latest hooks-lab -- --template react --no-interactive
```

Then copy `src/App.jsx`, `src/snip/`, `run-tests.mjs` and `extra-tests.mjs` from this folder into `hooks-lab/`, and in `hooks-lab/` run `npm install`, `npm install -D puppeteer-core`, `node run-tests.mjs`, `node extra-tests.mjs`. Compare with `test-output.txt` and `extra-output.txt`.

- `PartnerNoDeps` (the fetch with no dependency array) runs against a mocked API on purpose, so the test does not flood JSONPlaceholder. Its request count is not a real-network number and must not be quoted.
- The other fetch tests call the real https://jsonplaceholder.typicode.com (about 20 requests in all).

## Round 2 and lint (same day, after the adversarial review)
- `round2-tests.mjs` → `round2-output.txt`: the claims the review found unmeasured, and the replacement practice questions (`src/snip/r2.jsx`). `App.jsx`'s button now toggles (hide and show again); `&tall=1` keeps the page scrollable after unmount.
- `npm run lint` (the template's oxlint) → `lint-output.txt`. eslint 9 + eslint-plugin-react-hooks 7.1.1 `recommended` with `eslint.config.mjs` → `lint-summary.txt` (one line per finding, with the component).
- `useLocalStorage` now uses `catch {` (no unused `error`). Round 1 ran it with `catch (error) { console.log(error); … }`; the behaviour tested is the same.

## Files
- `src/snip/f1.jsx` … `f5.jsx`: one component per snippet. `Orig…` components are the code as shown in the English videos; `useDataApiNarrated` is what video 16's narration describes.
- `src/App.jsx`: mounts `?c=<ComponentName>` with an `unmount` button.
- `test-output.txt`, `extra-output.txt`: the raw results quoted in `../STORYBOARD.md` section 6.
