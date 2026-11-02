# Final project (Node backend): Day embeds for Rise 360

One embed per Day of the follow-up final project (the AI Career Assistant moves from Firebase to Node/Express + MongoDB). Source of every learner-facing sentence: `english final project nodejs.docx`, word for word.

## Layout

- `shared/` parts every Day uses: `fp.css` (look, with the Hallmark stamp), `fp.js` (navigation, Rules and Map sheets, Copy, fit to the frame), `strings.en.js` (UI labels and the Mandatory Rules), `build.mjs`, `fonts/` (Assistant, JetBrains Mono), `wawiwa-logo.png`.
- `day-N/` one folder per Day: `strings.en.js` (every string of that Day) and `index.html` (generated).

## Edit or translate

1. Change text only in a `strings.<lang>.js` file. Text between backticks is code: keep it as is.
2. Rebuild: `node shared/build.mjs day-3` (English writes `index.html`; `node shared/build.mjs day-3 es` writes `index.es.html` from `strings.es.js` files).
3. Never edit `index.html` by hand.

## Rise embed

Rise keeps the iframe's width:height ratio, so the page is one 880x640 canvas scaled as a whole to the frame (no inner scrollbars at any width).

```html
<iframe src="https://dory-ship-it.github.io/wawiwa-activities/full-stack-developer/fs-final-project/day-3/" width="1000" height="727" title="Day 3: Login, JWT, auth middleware." frameborder="0" allow="clipboard-write" allowfullscreen></iframe>
```

Measured frames: 1100 wide shows 1100x800 (scale 1.25), 680 wide shows 680x494 (scale 0.77). Below about 600px (phones) the canvas keeps scaling down and the text gets small: open decision.

The last screen's red button scrolls the Rise page so the Continue divider under the embed comes into view.

## Checks run (Day 3, 2 Nov 2026)

- Every string diffed against the docx: 0 mismatches; no text on the page outside the strings files.
- axe-core 4.10 (WCAG 2.1 A/AA + best practice): 0 violations on both screens, the Rules and Map sheets, at 680 and 1100, and with reduced motion.
- Hallmark sloplint (app scope, render tier): 0 FAIL.
