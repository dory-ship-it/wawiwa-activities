# Kit 0.1.0: report (23 Nov 2026)

KIT-PLAN.md step 1 (the kit) and step 2 (DM on the kit, in a copy). EAI (step 3) not started. Nothing committed.

- Kit: `wawiwa-activities/_selfstudy-kit/` (README.md, CATALOG.md, CHANGELOG.md)
- DM copy: `wawiwa-activities/digital-marketing/dm-m2l2-lesson-kit/` (port 8141). The live `dm-m2l2-lesson` and `eai-m1l4-selfstudy-v3` are untouched.

## Tests on the DM copy (final files)

| Test | Result |
|---|---|
| `check` | passed (warnings as in the live lesson: 18 screens over the word budget by the work order, S30's 16-word key line) |
| `walk` | passed (402 checks, keyboard only, whole lesson) |
| `test:scorm` | passed (24 scored interactions, weighting 1; lesson_status incomplete until the finish, then failed with score 63 on the walk's path; the relaunch keeps it failed) |
| `test:review` | passed (incl. the new top line) |
| `check:overflow` | passed: 498 states at 1280 x 720, 1024 x 576, 1920 x 950, 0 problems (run chapter by chapter) |
| `test:fit` | **2 failures, both S33 "long-term goals"** (the feedback card over the panel's box, at both sizes). The live lesson fails the same way (checked): not from the kit. Open question 5 |
| `package` | built: dist/dm-m2l2-lesson-scorm12.zip, 101 files, 53 MB (not uploaded to Blossom) |

**Screenshots**: every state of the copy against the live lesson, pixel by pixel at 1280 x 720: 157 of 163 identical. The 6 that differ: CHKR (3 states) and END "not passed", by design (the lesson score and no retake); K1 "map" (3 px, a ring caught mid-frame: identical on a second run) and S15 "all open" (a test helper I had not exported: fixed, identical on a second run, where S15 "three open" showed 2 px of the same frame noise). Three new states (the speed menu, speed 0.5 on V1 and on the podcast) have no live counterpart. Not run: `test:fit -- --all` (the wide windows) and the EAI pilot's own tests (EAI is not on the kit yet).

## What moved into the kit

- **Engine and shell**: `engine.js`, `zones.js`, `menu.js`, `state.js`, `ghost.js`, `tooltip.js`, `drag.js`, `adapt.js` (personal path), `compose.js`, `icons.js` (DM's superset), `util.js`, `main.js`, `tracking/` (SCORM 1.2, local), `coach/` (offline tips, the live frame), `review/` (review mode, review.html, word counter). DM's copy of each was the base (it is the newer); EAI had nothing DM lacked in these files.
- **Every template of both lessons**: EAI's 20 (title ... end) and DM's 22 (`dm.js`, `dm2.js`). CATALOG.md lists them with their fields.
- **CSS**: `base.css` = EAI v3 `frame.css` (it has the full-screen film and the new Play button, which DM only had as overrides) + `fx8.css` + DM's `v2.css`; `tokens.css`; `fonts.css`. No screen-id rule anywhere: the title screen's rule keys to the title template; EAI QH1 / DM S11B is the option `case-heading`.
- **Profiles**: `profiles/dm.css` (DM's `dm.css` + its three accent tokens; S35's rule is the option `compact`), `profiles/eai.css` (EAI's eleven screen-id rules as eight named options, each marked with the EAI screen it came from).
- **Tools**: check, stamp, serve, test-fit, check-overflow, walk (+ walk-lib), test-review, shots, states (+ state-helpers), package-scorm, SCORM mock, Blossom frame, placeholder makers, and the new `sync`. EAI's own tests (coach, live coach, personal path, LMS origin, wrong-answer walk) are in `tools/eai/`, not yet made lesson-agnostic.
- **Lesson-specific values moved to `kit.json`**: content file, storage key, interaction id prefix, coach page and case keys, port, SCORM ids, hub ids, the coach row of review.html. The EAI-only code that named screen ids (the S22 lesson record, the S19 state migration, the case card's store key) now reads them from the content (`screen.record`, `lesson.renamedScreens`, `screen.caseKey`).

## What stays in the lesson

`kit.json`, `content/m2l2.json`, `lesson.css` (the option `cover-fade` for the title photo), `assets/` (photos, films, audio), `tests/` (`states.mjs`: the 166 screen states; `walk.mjs`: the keyboard path; `check.mjs`: the work order's rules and contrast pairs), `planning/`. The rest (`src/`, `tools/`, the two pages, fonts, logo) is the kit's copy, locked by `kit.lock.json`.

## New in the kit (Noy, 23 Nov 2026)

- **Speeds** 0.5, 0.75, Normal, 1.25, 1.5, 2 in the film player's menu and the podcast's chip (`src/speeds.js`), kept for the session.
- **Score** from the scored questions along the lesson, pass mark 80, one attempt, no retake, a final check optional. In the DM copy all 24 graded questions now count (the check's five among them); CHKR shows the lesson's score and no "Retake now".
- **review.html** slim top line: "Back to the hub" (`../../self-study-hub/#/dm/m2l2`) and "Open as a learner".

## Open questions

1. **Which DM questions count.** The copy counts all 24 graded questions (S07, S11B, V1 x2, S15B x3, S17C x3, S20, S22, S24, V2 x2, S30 x3, S32B, CHK x5). The drag (S07) counts by its first drop. Noy confirms, or names the ones to leave out (`scored: false`).
2. **Decided (Noy, 23 Nov 2026: "Show failed").** A finish under 80 reports `lesson_status` failed with its score; passed stays sticky; incomplete until the finish; `cmi.core.exit` stays suspend. Done in the kit (`src/tracking/scorm12.js`, `src/engine.js`); in the DM copy test:scorm and walk pass with it (the walk ends failed at 63). CHKR and END look the same.
3. **New pilot copy in the DM copy** (no retake any more): CHKR's not-passed line "Review what you missed." and its coach tip "Missed one? Open its chapter from the link and read why."; END's retake hint removed. Noy reads them.
4. **The keyboard walk now ends under the pass mark** (it answers 9 of 24 wrong on purpose, to test the wrong-answer feedback): 63, failed, as it should. The passed look of CHKR and END is covered by the screenshots, not by the walk.
5. **S33's feedback card** sits about 16 px into the panel's box in the "long-term goals" state (test:fit fails there). The live lesson fails the same way: not from the kit. Fixing it changes the look, so it waits for Noy.
6. **Pushing the copy** adds about 54 MB (the films and audio are copied, as in every earlier copy folder). When Noy approves, its files replace the live folder's and the copy folder can go.
7. **The same browser storage key** as the live lesson (`wawiwa.dm.m2l2.lesson`), so on GitHub Pages the copy and the live lesson share a learner's place in that browser. Kept on purpose (the copy will replace the live files); change `storageKey` in kit.json if the two must stay apart while both are online.
8. **EAI on the kit (step 3) will need:** kit.json; `styles` on the screens that had screen-id CSS (profiles/eai.css names each); `record` on S22 and `caseKey` on its input screens; `lesson.renamedScreens: { "S19": "S19B" }`; its own tests/ (states, walk); the `tools/eai/` tests made lesson-agnostic; and Noy's decision on the score (A0 in EAI-FIX-LIST.md). profiles/eai.css is written but not yet run on a lesson.
9. **review.html's coach row note** now reads "Live AI coach: framed only in the live lesson, never in review mode." (the live lesson still says "not wired in this phase", which is out of date).
10. **CATALOG.md** has a review link per type instead of a thumbnail picture.
