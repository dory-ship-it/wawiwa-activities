# Handoff: EAI L4 self-study, review fixes (from 19 Oct 2026)

Paste this in a new Claude Code chat, with the working folder `C:\Users\noyam\Desktop\Wawiwa`.
Talk to Noy in Hebrew; course content stays English.

## The module
- Folder: `wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy` (plain ES modules, no framework; README has the map).
- Live: https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy/ (GitHub Pages, about 3 min after a push). URL options: `?reset=1`, `?screen=S03`, `?debug=1`.
- All learner text lives in `content/l4-slice.json`. Templates in `src/templates/`, shell in `src/zones.js`, `src/menu.js`, `src/engine.js`, styles in `src/frame.css` (colours only from `src/tokens.css`).
- SCORM 1.2: `src/tracking/scorm12.js`; `npm run package` builds `dist/eai-m1l4-selfstudy-scorm12.zip` (not committed).
- git: not on PATH. Use `C:\Users\noyam\AppData\Local\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe`. Noy usually commits and pushes herself (GitHub Desktop).

## Rules
- Another session makes the videos: do not touch `video/`, `assets/img/v1/`, `review/p2/`, `assets/video/` (reading is fine).
- Commit only files you changed, by explicit path; never `git add -A`, `git add .`, `commit -a`. Do not push unless asked.
- Text 14 px or larger, targets 44 px, WCAG 2.1 AA, keyboard works, no em dashes, all text from the content JSON, generic names (no Israeli names or cities).

## Checks (run all after a change)
`npm run check` (fast), `npm run test:fit` (about 8 min), `npm run walk` (about 6 min), `npm run test:scorm`. Long runs: start them in the background.

## Done in the last round (19 Oct 2026, pushed by Noy as b3ad18c, all tests passed)
- Video: transcript closed by default (button opens it; player and heading centred while closed). No seeking ahead of the part already watched; stops still pause; Next only after the end.
- Rail "Saved" badge hidden; shows only "Not saved" when saving fails.
- Menu: no chapter times, no "time left", no Resources (Help and Start over stay).
- Chapter-end "Good place to pause" line removed (one Next moves on).
- S03: the two case stills are frames from the real V1 (`assets/img/s03-case1.jpg`, `s03-case2.jpg`), labels "Case 1: car company, 1980s" / "Case 2: fintech, 2024", no play badge.
- V1 points to the real film (`assets/video/v1.mp4`, stops 61.159 / 136.265, length 2:54).

## In progress, NOT yet committed: the lesson fills the window
- `src/engine.js` layout(): the stage stays 720 high but widens from 1280 up to 1600 (`--w-stage-w`) to fill a wide window; wider than that is letterboxed.
- `src/frame.css`: `--w-pad` on `.w-stage`; main (1216 wide) centred; footer and menu overlay full width; main clipped with `clip-path: inset(0 calc(-1 * var(--w-pad)))` so left photos reach the rail (`.w-photo-column`, `.w-photo-memo`, `.w-stop-frame`, `.w-header` line); grey memo layouts paint the side strips grey (`.w-stage:has(> .w-main[data-layout="memo"])`).
- Tests: `tools/lib.mjs` (scale from height, side margin allowed), `tools/test-fit.mjs` (sizes 1920x950 and 2560x900 added).
- Status: looked right in screenshots (S01, FT1, V1, S03, S18 at 1920x950); `check`, `test:fit` and `walk` all passed (19 Oct 2026). Ready to commit, files:
  `src/engine.js src/frame.css src/zones.js tools/lib.mjs tools/test-fit.mjs` (+ this handoff file).
- Real full screen (hiding the browser bars) needs a click by the browser's rules; offer a full-screen button in the rail only if Noy wants it.

## Open points to raise with Noy
- Fast track: FT1 right on the first try lets the learner jump past V1 (by design). Keep it?
- Stop 2 in V1: the stop view shows the centre of the frame, so the "?" at the left is cut off (a per-stop focus position would need a small change in `video.js`).
- Film mismatches for the video session: at 0:51 the screen says "~71" while the narration says "about 100"; at about 1:33 the screen says "2.1M conversations / month" while the narration says "about 2.3 million".
- Phones: the stage scales down with a "works best on a computer" note.
