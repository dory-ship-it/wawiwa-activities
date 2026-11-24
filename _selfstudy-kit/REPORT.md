# Kit 0.1.0: report (23 Nov 2026)

KIT-PLAN.md step 1 (the kit), step 2 (DM on the kit, in a copy) and step 3 (EAI M1 L4 on the kit, in a copy, with EAI-FIX-LIST part A where it is code). Nothing committed.

- Kit: `wawiwa-activities/_selfstudy-kit/` (README.md, CATALOG.md, CHANGELOG.md)
- DM copy: `wawiwa-activities/digital-marketing/dm-m2l2-lesson-kit/` (port 8141)
- EAI copy: `wawiwa-activities/enterprise-ai-implementation/eai-m1l4-selfstudy-kit/` (port 8131)
- The live `dm-m2l2-lesson` and `eai-m1l4-selfstudy-v3` are untouched.

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
8. **EAI on the kit**: done, see the last section.
9. **review.html's coach row note** now reads "Live AI coach: framed only in the live lesson, never in review mode." (the live lesson still says "not wired in this phase", which is out of date).
10. **CATALOG.md** has a review link per type instead of a thumbnail picture.

## From the first Implementor lesson on the kit: EAI M2 L3 (23 Nov 2026)

`enterprise-ai-implementation/eai-m2l3-selfstudy`, profile `eai`, kit 0.1.0. Taste-check slice O1, O2, F1.

1. **profiles/eai.css runs on a lesson now** (it was untested, item 8 above): the title, the module map on dots and a darkblur learn screen render as expected.
2. **moduleMap holds five stations at most.** `PITCH` and `STATION_W` are fixed (intro.js), so six stations run edge to edge (the list is 1280 px wide) and the caret under station 6 leaves the stage (test:fit: "outside main: w-map-caret"). The lesson works around it with an option in its lesson.css (`six-stations`). Kit fix: compute the pitch from the number of stations so the line always fits the panel's 1075.2 px, and place the caret relative to the panel.
3. **The title's Start button is red** (`--wl-red`, "Start the lesson"), but STANDARD 1.6 says red is the logo only, never a button. Same in DM O1. Noy decides; the lesson does not override it.
4. **New screen type, a kit candidate: `whys`** (the lesson's templates/whys.js, lesson.css). The 5-Whys as a shaft going down from the pain to the root: a Why? button opens one level at a time, a depth gauge "Symptom > Root cause", the root card the only glow. Not tracked; Next after the root. Fields: label, cardField, surface, whys, root, depth, button. check.mjs counts its words as 0 (an unknown type): words.js should learn it if it moves into the kit.
5. **The coach demo panel** (`ui.coach.demoOn`) opened over O2 when set there; the lesson sets it to a screen it does not have. A lesson-level "no demo" value would be cleaner.
6. **test:review needs a screen with a graded single choice**; a slice without one stops with a TypeError (test-review.mjs line 31) instead of saying it was skipped.

## EAI M1 L4 on the kit (step 3, 23 Nov 2026)

Copy: `enterprise-ai-implementation/eai-m1l4-selfstudy-kit/` (port 8131, profile `eai`, hub `eai/m1l4`). The live `eai-m1l4-selfstudy-v3` is untouched. The films are the round-12 ones (below), copied into the copy's own `assets/video/`. Content changes: `styles` on the screens that had screen-id CSS (S01, S03, S13, S14, S15, S18, S19C, S22, K4, W4, W6), `record` on S22, `caseKey` on the input screens, `lesson.renamedScreens` (S19 to S19B), the score, S21R and END (below). The v3 lesson's 45 one-off tools (fx*-content, shots-*, compare-*) were not copied: they stay with the live folder.

**Tests on the copy (final files)**

| Test | Result |
|---|---|
| `check` | passed |
| `walk` | passed, 186 checks. Written again on the kit's walk helpers, driven by the content: the v3 walk still described the v1 screens (two tries, the old O3 and S01, no S14, S15, S19A to S19C) and failed on O1 and O2 (A10). It answers by keyboard, three wrong on purpose (S10, V1 stop 1, check item 5) to test A3, and ends passed at 27 of 30 = 90 |
| `test:scorm` | passed, 194 checks: 46 interactions, weighting 1 for the 30 scored; incomplete, then passed; a one-attempt run under 80 finishes failed and stays failed on relaunch; the adapter in 30 paths |
| `test:review` | passed (48 thumbnails, the top line) |
| `test:coach`, `test:coach-live` | passed (now kit tools, lesson-agnostic) |
| `test:adapt` | passed (the personal path; its persona now presses Check: it failed the same 11 ways in the live lesson, an older test) |
| `test:lms-origin` | passed (the zip in a mock LMS on another origin, the real coach page over the network) |
| `walk-wrong` | passed (reaches END answering wrong everywhere; its S14 picker fixed in the kit: four of six) |
| `test:fit` | passed (186 states incl. the personal path's levels, 1280 x 720 and 1024 x 576) |
| `check:overflow` | 0 problems in every chapter but two states, both the same in the live lesson: S04 "done" (the drop columns reach the Next row; pixel-identical to live) and S19B "every note full" (six notes at their maximum length run off the stage; pixel-identical to live) |
| `package` | built, 32.0 MB (33,580,332 bytes), 82 files: the round-12 films are in it |

**Which questions count (30)**: V1 x2, S03, S04, S05b, S06 x2, S08 x3, V2 x3, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18A, S18, and the check S21 x6. Neutral ones never count (the own-case fields, S01, S20, S20B, S22). On the personal path's screens the variant the learner sees counts.

**What changed visibly** (screenshots of all 186 states against the live lesson: 164 identical before A5, 61 after; every difference is one of these):
- A3: a wrong pick shows why that pick is wrong (S10, S11, S15, S18, the film stops, and their variants).
- A0 and A6: S21R shows the lesson's score, "You got x of 30 right.", the pass mark as a small line under it, no "Retake now"; END has no retake hint; finishing under 80 is failed.
- A5 (profiles/eai.css, every screen of the profile, never per screen): the body starts 32 px under the heading (it was 15 to 20; S19B's hand-off keeps 18 so its six notes fit); the context line over a heading is a tag (S08B, S12, S12B, S17B, S18B, S19C, S20 and their variants); a context line and a field label sit 8 px over their heading.
- K1 and K4: the coral "Without mapping" text is a lighter coral, #F58474 (it was 4.16:1 on its dark card, under the 4.5 rule; found by the new walk).
- Speeds 0.5 and 0.75 in the film menu.

**A7, A8 (reported, not changed)**: no photo has `place` (the panels are centred on blurred photos), so the photo-aware layout needs a calm side recorded per photo. Repeats: `ch3-w2-hand-sketch` on 6 screens (4 in a row: W2, K2, S04, S05a), `ch4-w3-film-staffer` on 5, `ch5-w4-map-handoff` and `ch6-w5-hands-notes` on 4 each.

**Open questions (EAI)**
1. Done: the films are in the lesson and in the zip (below).
2. The score: all 30 graded questions count, the check's six among them (A0). Noy confirms or names any to leave out.
3. New lines: S21R "You got {x} of {n} right." with "Your score: {p} of 100. Pass mark: 80." under it, and "Review what you missed." when not passed (all marked pilotCopy).
4. A5 is a visible change on most EAI screens (more room under the headings, the context tags). Noy looks at it in the copy.
5. S04 "done" and S19B at full length: older layout limits, the same in the live lesson.
6. Not in this pass: A2 end cards, A4 narration, A11.

7. **check's keyOf does not know a lesson's own templates.** For a graded interaction on a lesson template it computes an empty key, so `correctResponse` must be "" to pass (EAI M2 L3 keeps the real key in `tracking[].key` for F2 and F5). The kit could read `tracking[].key` or ask the template for its key.
8. **`quiz` (and the other dm/dm2 types) has no Implementor styling**: on the eai profile it renders unstyled. EAI M2 L3 uses `decision` `pair` instead. The catalog could say which types are DM-only.
9. **explorer tiles take glyph names only** (`src/icons.js` G set). A P-set icon name shows "?" with no console warning.

**The round-12 films (Noy approved, 23 Nov 2026), wired in the same day**
- Copied (not moved) from `EAI film upgrade/full/r12/lesson` (V1) and `EAI film upgrade/v2/r12/lesson` (V2) into `eai-m1l4-selfstudy-kit/assets/video/`: mp4, captions, poster, cues. The copy's .gitignore no longer ignores `assets/video/` (v3 ignored it because its films lived in v2).
- Content: src, poster and captions point at `assets/video/`; `media.cues` names each cue file, so check compares the duration and every stop with it. V1 3:47 (227.45 s), stops **86.806** (1:27) and **177.984** (2:58), before 85 and 170.4. V2 4:05 (244.86 s), stops **89.255** (1:29), **130.061** (2:10), **195.265** (3:15), before 77.754, 118.612, 171.906. V2's caption-position windows moved onto the new timeline with the film's own time map (it turns the old stops into exactly the new ones).
- Each stop's question checked against the captions: V1 stop 1 follows "the U.S. company wants to close that gap... make the first call yourself" (the question: what should it look at first), stop 2 "So, what went wrong? Decide before you hear it" (the root problem); V2 stop 1 "Field two is the trigger... you choose", stop 2 "Field four asks where responsibility passes", stop 3 "Field six is existing controls... what goes in the map?". The line after each stop confirms the right answer.
- Tests: check, walk (186), test:scorm (194), the full test:fit (186 states, two sizes) passed. Screenshots: `eai-m1l4-selfstudy-kit/planning/shots-films/` (each film's first frame, each stop at its time, the end card).

10. **test:fit and check:overflow run with reduced motion**, so a layout that only breaks while an entry animation runs passes both. EAI M2 L3's Fishbone labels (an animation whose `to` state reset their transform) passed every test and broke on the live site; a headless run with motion on found it. A short motion-on pass over the animated screens would catch this.
