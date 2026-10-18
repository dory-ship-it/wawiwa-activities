# EAI L4 R3: Chapters 5 and 6, SCORM 1.2 package

- Built: S18A (sort, 4 cards), S18 (safety choice, case title from S02, privacy checkbox, Save), S19 (handoff to eai-m1l4-class in a new tab, return metric), S20 (self-check, neutral), S21 (5 scored items, first attempt counts, pass 4 of 5), S22 (takeaways, homework, lesson record download, Finish). All 7 chapters in rail and menu.
- SCORM 1.2: `src/tracking/scorm12.js` (parent then opener discovery, no identity fields), `local.js` fallback, suspend codec in `src/state.js`, imsmanifest.xml (one SCO, mastery 80).
- Checks: `npm run check` passed; `test:fit` 361 ok; `walk` 415 ok (keyboard, wrong then right, S21 first-attempt scoring, S19 new tab and return, download, Finish passed 80 and failed 0); `test:scorm` 326 ok (mock API).
- SCORM data on the walked route: 42 interactions, each once (V1 skipped by the fast-track route; 44 in the lesson), status passed, score 80 (0 to 100), session_time, exit "", resume lands on the saved screen without downgrading status.
- suspend_data: 1540 chars after the whole lesson, 2100 with every free-text field at 250 (limit 4096).
- Package: `dist/eai-m1l4-selfstudy-scorm12.zip`, 1.52 MB, 54 files (git-ignored, not committed). Smoke-tested from the extracted zip: no 404s, no console errors.
- Videos: packaged placeholders from `assets/video/temp/` (V1, V2) and 2 temp images; swap paths in content before release.
- No SCORM .xsd files in the repo: the manifest names them, they are not in the zip.
- Deviation: S05 and S17 responses now letters (SCORM 1.2 identifier format); S17 card ids lowercased.
- Deviation: S20 and S22 step 2 are reached with Next; S22 Next stays locked ("last screen"); Finish sets the status.
- Deviation: S21 result screen keeps the last item's feedback in the band; on revisit the band is idle.
- New pilot copy (needs review): S18 feedback lines, S22 finish confirm, footer locked reasons, lesson record labels.
- Removed unused `src/templates/placeholder.js`; dev tracking panel dropped (console log with `?debug=1`).
- Next: real V1 and V2 files, LMS test upload to Blossom.
