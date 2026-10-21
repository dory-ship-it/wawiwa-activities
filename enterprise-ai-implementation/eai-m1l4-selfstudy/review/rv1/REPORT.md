# EAI L4 RV1: review page, ?review=1 mode, V3-1 follow-ups (21 Oct 2026)

Precondition met: the working tree was clean (V3-1 committed as `eb2697a`). This round is one local commit, made by explicit paths. Not pushed. Nothing under `video/`, `assets/video/` or `assets/img/` changed; V1 only points at the poster that was already in `assets/video/`.

## 1. ?review=1 mode (engine)

- **Next never locks.** Previous / Next walk every screen of every chapter in order (33 today, `O1` to `S22`), whatever the screen's state or route. A fast-track card no longer routes: FT2's Next goes to S04, the next screen in the chapter. Templates that unlock Next with their own action (FT routes) or lock it again are overridden in this mode only. O1 has no footer by design; its "Start the lesson" walks on in the same order.
- **Rail and menu:** every chapter opens, at its first screen.
- **No tracking, no writes.**
  - The tracking bus runs without an adapter: no SCORM API lookup, no `LMSInitialize`, no calls at all. Events still reach the bus in memory.
  - `persist()` writes nothing, Start over clears memory only, and `?reset=1` is ignored.
  - The state lives in memory and starts empty, so each screen shows as on a first visit (see deviation 3).
- **Toolbar** (`src/review/toolbar.js`, `src/review/review.css`): a slim dark strip fixed at the window's top-right, outside the 1280x720 stage. It holds:
  - a "REVIEW" tag
  - the screen ID and its place (`11/33`)
  - the template (and variant)
  - the chapter (`Ch 2 · Toolkit`)
  - the word count: white chip, red over 45
  - "Overview", a link to `review.html#ID`

  Hover, focus or click on the word chip opens a panel:
  - every view the screen has (each open O2 station, each video stop, each S07 tile...) with its count;
  - every hint and feedback line with its count, red over 25;
  - the screen's allowance and its reason, if it has one (S02).
- **With `?screen=ID`:** `?screen=S04&review=1` opens any screen by ID, inside or outside the slice route.
- **Counting:** the counts come from `src/review/words.js`, which `npm run check` now uses too. The toolbar, the review page and the check always agree.
- **In the SCORM package:** the toolbar is a dynamic import. In the package, `?review=1` still works, without the toolbar.

## 2. Review page: `review.html`

- **Built at runtime** from `content/l4-slice.json` (`src/review/page.js`, no generated file). There is one row per chapter in order, plus a "Not in a chapter" row if a screen ever has no chapter.
- **Each screen is a live thumbnail:** an iframe of `index.html?screen=ID&review=1` at 1280x720, scaled to 25% (320x180).
  - Lazy-loaded: an IntersectionObserver sets the iframe's `src` when the card comes within 400 px of the viewport, so 15 of 33 load on arrival at 1600x900.
  - Inside a thumbnail the toolbar is hidden, and the lesson never takes the keyboard focus from the page.
- **Under each thumbnail:** ID, template, word count (red over 45). Hovering the card lists every view's count.
- **Click a card:** opens that screen full size in review mode in a new tab.
- **Filters:** All / one per chapter / "Over word limit (n)". Over = above 45 words, or with a hint or feedback line above 25.
- **CSP:** index.html's, except `frame-src 'self'`, which the iframes need (index.html has `frame-src 'none'`). Same-origin scripts only, no inline code or style.
- **Kept out of the SCORM package:** `package-scorm.mjs` skips `review.html` and `src/review/`. `npm run test:review` builds the package and checks that neither is in the manifest or the zip (50 files).

## 3. V3-1 follow-ups

### a. Text cuts

All three screens are now at most 45 words. Their `wordLimit` allowances are removed.

- **O2 (45 at most, Lesson 4 open):**
  - The panel shows only the lesson's own line. The panel's kicker, title and "Lesson 4 · Today" are gone, since the open tab shows them.
  - The panel line is now set like O3's deliverable line (600, 21 px), because it stands alone.
  - "Language model, working template" is now "Working template".
  - Two further cuts were needed to reach 45 (deviation 1).
- **O3 (45):** the "Your deliverable" label is removed. The template and the check accept a deliverable without a label.
- **K1 (44):**
  - "· Hammer's principle" is removed.
  - The evidence line is now "McKinsey, 2025: workflow redesign drives AI value most."
  - One further cut (deviation 1).

### b. Ghost hand: target set in the content

`src/ghost.js` `targetSteps()` reads `screen.ghost.target`, either one name or a list:

| Target | Where the hand points |
|---|---|
| `options-gap` | The gap between the first two options. Stacked options: the gap's right end, so the hand's body covers no option text. Side by side: the middle of the gap. |
| `options-centre` | The centre of all the options: between the cards. |
| `check` | The Check button. |
| anything else | A CSS selector inside the screen. |

| Screen | Target | What the hand does |
|---|---|---|
| S03 | `["options-centre", "check"]` | Taps between "Unmapped process" and "Unidentified end user" (on no card), then Check |
| V1 (both stops) | `options-gap` | Taps between options 1 and 2, on neither |
| V2 (all three stops) | `options-gap` | Same as V1 |

**Position fallback:** it stays in the code for a screen without a target, and **no screen uses it now.** O2 has no ghost hand, as decided in V3-1.

Before this change, V1 stop 2's first option was the correct answer. After 8 s idle, the old fallback would have pointed at it.

The walk measures the fingertip, with motion and with reduced motion. It is 0 px from the named point and inside no option, on S03 and on V1 stop 1.

### c. V1 poster

`media.poster` is now `assets/video/v1-poster.jpg`, as V2 has. That is the file's current path; nothing exists in `assets/img/`. The walk asserts the poster on both videos.

### d. SCORM

No interaction changed. test:scorm's list is unchanged: 44 interactions, each sent once.

## Screenshots (`review/rv1/`, `node tools/shots-rv1.mjs`)

| File | What it shows |
|---|---|
| `review-top.png` | review.html at 1600x900, top |
| `review-scrolled.png` | Scrolled to Chapter 3 |
| `review-over.png` | The "Over word limit" filter: S02 only |
| `s04-review.png` | S04 in `?review=1` with the toolbar |
| `s04-review-words.png` | S04 with the word panel open |
| `o2.png`, `o3.png`, `k1.png` | The three screens after the cuts, 1280x720 |
| `s03-hand.png` | S03 ghost hand on its first target, between the cards (motion, mid-demo) |
| `s03-hand-check.png` | S03 ghost hand on Check |
| `v1-poster.png` | V1 with its poster before play |
| `v1-stop1-hand.png` | V1 stop 1, the hand at the right end of the gap between options 1 and 2 |

## Word count of every screen

The count is the largest view, and the views are listed where a screen has several. The rule: 45 per view, 25 per hint or feedback line. The instruction h1 and buttons are not counted.

| Screen | Chapter | Template | On-screen words (max view) | Views | Longest hint / feedback line |
|---|---|---|---|---|---|
| O1 | 0 Intro | title | 17 |  |  |
| O2 | 0 Intro | moduleMap | 45 | l1 open 39, l23 open 42, l4 open 45, l5 open 38, l6 open 39 |  |
| O3 | 0 Intro | goals | 45 |  |  |
| S01 | 0 Intro | decision / single | 45 |  | 21 |
| S02 | 0 Intro | input | **61** (allowance 61) |  | 17 |
| W1 | 1 Why map | warmup | 38 |  | 10 |
| V1 | 1 Why map | video | 37 | V1 15, stop1 37, stop2 35 | 20 |
| K1 | 1 Why map | concept | 44 |  |  |
| S03 | 1 Why map | decision / multi | 36 |  | 25 |
| FT2 | 2 Toolkit | decision / challenge | 42 |  | 20 |
| S04 | 2 Toolkit | sort | 36 |  | 16 |
| S05 | 2 Toolkit | explorer / diagram | 26 |  | 18 |
| S06 | 2 Toolkit | decision / pair | 31 |  | 19 |
| S07 | 2 Toolkit | explorer / tiles | 41 | tile 1 open 40, tile 2 open 37, tile 3 open 36, tile 4 open 40, tile 5 open 38, tile 6 open 38, tile 7 open 41, tile 8 open 34, answering 34 | 18 |
| S08 | 2 Toolkit | decision / rounds | 35 | r1 35, r2 31, r3 33 | 22 |
| FT3 | 3 HR demo | decision / challenge | 43 |  | 17 |
| V2 | 3 HR demo | video | 34 | V2 21, stop1 34, stop2 33, stop3 29 | 19 |
| S09 | 3 HR demo | sort | 25 |  | 21 |
| S10 | 3 HR demo | decision / fill | 43 |  | 18 |
| S11 | 3 HR demo | decision / metric | 43 |  | 14 |
| S12 | 3 HR demo | explorer / pick | 44 | tile 1 open 33, tile 2 open 35, tile 3 open 44, tile 4 open 37, tile 5 open 37, tile 6 open 36, tile 7 open 38, tile 8 open 40 | 18 |
| FT4 | 4 Critical eye | decision / challenge | 40 |  | 20 |
| S13 | 4 Critical eye | decision / bounds | 41 |  | 21 |
| S14 | 4 Critical eye | decision / single | 39 |  | 21 |
| S15 | 4 Critical eye | decision / single | 44 |  | 23 |
| S16 | 4 Critical eye | sort | 42 |  | 22 |
| S17 | 4 Critical eye | sort | 28 |  | 18 |
| S18A | 5 Build yours | sort | 41 |  | 22 |
| S18 | 5 Build yours | decision / safety | 35 | step1 35, step2 30 | 20 |
| S19 | 5 Build yours | handoff | 40 | brief 40, return 23 | 13 |
| S20 | 5 Build yours | decision / selfcheck | 27 | step1 27, step2 25 | 19 |
| S21 | 6 Wrap-up | check | 44 | i1 43, i2 35, i3 37, i4 38, i5 44 | 21 |
| S22 | 6 Wrap-up | decision / close | 32 | step1 16, step2 32 | 19 |

Only S02 is over (61, its R4 allowance, unchanged). It is the one card under "Over word limit".

## Text changes (planning syncs the storyboard from this table)

| Screen | Old | New |
|---|---|---|
| O2 line under h1 | Open any lesson to see how it connects to today. | removed (deviation 1) |
| O2 L2-3 title | Language model, working template | Working template |
| O2 L4 panel line | You map one real process as it runs today, and set one number to check it by. | You map one process as it runs today, and set one number to check it by. (deviation 1) |
| O2 panel | kicker (with "· Today"), title, line | the line only |
| O3 deliverable label | Your deliverable | removed |
| K1 label | Key idea · Hammer's principle | Key idea |
| K1 evidence | McKinsey, 2025: redesigning workflows is the top factor in AI value. | McKinsey, 2025: workflow redesign drives AI value most. |
| K1 source | Hammer, Harvard Business Review, 1990 | Hammer, HBR, 1990 (deviation 1) |
| S03 correct band | Both cases changed only after someone saw how the work really flowed, and both were judged by numbers. Today you fix both: a map and a metric. (27 words) | Both cases changed once someone saw how the work really flowed; both were judged by numbers. Today you fix both: a map and a metric. (25 words, deviation 2) |

## Checks

All runs below are after the last code change (the ghost hand's stacked-gap point).

- **`npm run check`: passed (42 ok).**
  - One warning remains: S02 at 61, its R4 allowance. The O2, O3 and K1 allowances are gone.
  - 223 hints and feedback lines are at most 25 words.
- **`npm run test:fit`: passed, 1182 ok.**
  - The O2, O3 and K1 states at all six sizes: no clipping, band, contrast, 14 px text, 44 px targets.
- **`npm run walk`: passed, 465 ok** (463 in V3-1, plus 2 ghost-target checks). New or changed checks:
  - The O2 panel holds the line only.
  - O3 has no deliverable label.
  - The K1 label and evidence come from content.
  - V1 and V2 show their poster.
  - The ghost hand is 0 px from its named point and on no option: at V1 stop 1 and on S03 with reduced motion, and on S03 mid-demo with motion.
- **`npm run test:scorm`: passed, 381 ok.**
  - 44 interactions, each written once; status passed, score 80.
  - suspend_data is 1627 chars after the whole lesson, 2187 with every free-text field at 250 (limit 4096). Resume lands on the saved place.
- **`npm run test:review` (new): passed, 19 ok.** Results:
  - Review walk: 33 screens in order, Next never locked, Previous walks back, the toolbar is right on every screen.
  - **localStorage is byte-for-byte the same after the walk.**
  - **0 SCORM calls** with a mock API present.
  - review.html: **33 of 33 thumbnails render their own screen**, lazily, at 25%. The filters work.
  - The SCORM package has no review file.
- **A normal run behaves as before:** walk, test:fit and test:scorm all passed on the unchanged paths. Review mode only branches on `?review=1`.

## Deviations

1. **Two extra cuts on O2 and one on K1.**
   - The cause: the cuts decided on 21 Oct were based on my V3-1 estimate, and that estimate was off. After them, O2 still came to 48 to 56 words, depending on the open lesson, and K1 to 46.
   - I asked; Noy said to do what is needed and keep it tidy. I picked the smallest cuts that keep the meaning:
     - O2: drop the line "Open any lesson to see how it connects to today." (10 words) and "real" in the Lesson 4 line. The tabs read as buttons, and the h1 stays.
     - K1: "Harvard Business Review" becomes "HBR", as in the V1 film.
   - All three cuts are in the text table above, to approve in the review page.
2. **S03's closing line was 27 words, not 25.** V3-1 reported 25 by mistake. The old check never counted `feedbackCorrect`, and the shared counter now does. Trimmed to 25: "only after" became "once", and ", and both" became "; both".
3. **Review mode starts from an empty state in memory.** It does not read the saved run.
   - Why: every screen and thumbnail shows as a first-time learner sees it, the same for everyone. A screen completed in a real run would otherwise open read-only, with its answer shown.
   - Templates still read and write their state in memory, so screens render and react.
   - The saved run is neither read nor written. `test:review` compares localStorage before and after: identical, 154 chars.
4. **review.html's CSP differs from index.html's in one place:** `frame-src 'self'` (thumbnails are iframes).
5. **check rule 7** (no English sentences in `src/*.js`) **skips `src/review/`.** That folder is review-only UI for the team and is never packaged. Its strings are not in the content file.
6. **New script `npm run test:review`** (`tools/test-review.mjs`) covers:
   - the review walk: all 33 screens, Next never locked, Previous back;
   - the toolbar on every screen;
   - no SCORM calls with a mock API present;
   - localStorage unchanged;
   - `?screen=ID&review=1`;
   - review.html: 33 cards in order, all 33 thumbnails render their own screen at 25%, lazy loading, both filters;
   - the package without review files.
7. **"Over word limit"** also catches a screen with a hint or feedback line over 25. None has one today.
8. **The O2 panel line got the deliverable's type** (600, 21 px instead of 400, 18 px), as it now stands alone in the box.
9. **`npm run check` counted `feedbackCorrect` for the first time** (deviation 2). The total of hints and feedback lines is now 223.

Token use of this session (/cost is not available in the desktop app; read from the app's usage): context 347,751 tokens (35% of 1M) at report time; plan: 16% of the 5-hour limit, 25% of the weekly limit.
