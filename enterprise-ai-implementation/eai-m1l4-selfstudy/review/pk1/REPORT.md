Weekly usage (all models) before: 6%.
# PK1: SCORM 1.2 package for Blossom (1 Nov 2026)
Local commit only, NOT pushed. Opus 5.5. Only `eai-m1l4-selfstudy/` touched (coach page and workbook: read only).

## Changes
- **A1 status.** `lesson_status` is only `incomplete` or `passed`. A guard in `src/tracking/scorm12.js` refuses any other value. Any S21 attempt >= 80 sets `passed` (sticky). Finishing S22 below 80 keeps `incomplete`, sends `score.raw`, and keeps `exit "suspend"`. `exit ""` is sent only once the lesson is finished AND passed, including a retake that passes after the finish. "Finished" comes from `state.fin` in suspend_data, never from the status.
- **Resume after a finish below 80** lands on S21R (Retake now) instead of S22/END, with the resume prompt and every earlier input intact (`src/engine.js` start). No learner text changed.
- `lesson.completion`: `statusWhenNoScoredItems` is replaced by `statusWhenNotPassed: "incomplete"`, and the rule is in a `$comment`. `local.js` logs the same status and exit.
- **suspend_data never dropped (Noy's follow-up).** Over 4096, `encode` first drops the retry counts, then trims the saved copy of the longest free text from its end (deterministic) until it fits. Place, answers, attempt and levels are always written. The text in memory stays whole.
- **A2.** `adlcp:masteryscore` removed from the manifest; one SCO, `href="index.html"`.
- **A3.** contentVersion "PK1, 1 Nov 2026 (storyboard v3 + QZ1)".
- **Tests.** `walk.mjs`/`test:scorm` now expect `incomplete`, never `failed`. New checks:
  - quit after a finish below 80 -> relaunch -> S21R -> retake -> `passed`, `exit ""`;
  - 30 adapter paths: never `failed`/`completed`;
  - B2 worst case, plus all fields full of quotes, in Node and through the mock LMS;
  - B3 interactions.
  New `tools/test-lms-origin.mjs` (`npm run test:lms-origin [-- --ask]`). The mock records statuses and exits, and keeps the interaction count on relaunch.

## Test results (final run, stamp 4fdd25d6)
check, test:fit (six sizes, 4854 checks), walk, test:scorm, test:review, test:adapt, test:coach, test:coach-live, test:lms-origin --ask: all passed.

## suspend_data (limit 4096)
- Whole lesson: 2304 chars. All 10 fields at maxlength ("x"): 3150.
- Worst realistic case: check retaken (both versions' answers), levels set, a retry count on all 58 ids, every field full of quotes, apostrophes, commas and new lines: **3707 (margin 389)**.
- Pathological case (every character a `"`): 5135 before shrinking -> saved at 4003. Retry counts were dropped and Problem trimmed from 250 to 158; nothing else was lost. In the page through the mock LMS: 4087, accepted, the new place saved, no "Not saved" badge.

## Interactions (full walk: 54, plus the retake path)
- S21 version a items 1-6 have weighting 1. The retake path adds items 1b-6b, also weighting 1 (15 interactions in that path).
- Everything else has weighting 0: practice items record correct/wrong, free text and W/S20/S22 record neutral, L4_PATH_C4/C5 record neutral.
- student_response: max 250 enforced, longest in the walk 93, no control characters.

## Package (`npm run package`)
- Path: `C:\Users\noyam\Desktop\Wawiwa\wawiwa-activities\enterprise-ai-implementation\eai-m1l4-selfstudy\dist\eai-m1l4-selfstudy-scorm12.zip`.
- Size and count: 25.74 MB (26,994,037 bytes), 63 files (manifest + 62: 33 src, 27 assets, content, index.html).
- Videos: 2 mp4. v1 15.39 MB (2:55, 572 kbps video + 160 kbps audio); v2 9.01 MB (2:48, 283 + 160). Plus 3 caption/poster files.
- Not inside: review.html, src/review/, planning/, review/, tools/, _originals.
- Manifest: SCORM 1.2, one organization, one item, one SCO, href index.html, no masteryscore. The .xsd files are named but not packaged; SCORM Cloud accepts this.
- **Over 25 MB.** The two videos are 24.4 MB of it. Proposal (NOT done): re-encode the audio at 96 kbps mono, about -2.6 MB, which brings it to about 23 MB with no visible change. Alternative: v1 at CRF+3. Check Blossom's upload limit first.

## Coach inside an LMS (A4)
- **Parent origin.** The coach page has NO parent-origin allowlist. It takes context only from `window.parent` (source check) and the exact 10-key shape, and it answers the parent with `postMessage(..., '*')`. So it works from any lesson origin; nothing needs adding today.
- **Framing.** The coach page sets no frame-ancestors. The lesson's own CSP allows `frame-src https://dory-ship-it.github.io`. The LMS page's CSP does not apply inside the lesson's frame.
- **Proxy.** The call to the proxy is made by the coach page itself, so it sends `Origin: https://dory-ship-it.github.io` whatever the LMS is (measured: 200 from `http://lms.test`). A planned `ALLOWED_ORIGIN = https://dory-ship-it.github.io` lock keeps working from Blossom and SCORM Cloud. Allowing the LMS origins there would be wrong.
- **Tested from a second origin** (package unzipped, `lms.test`, mock LMS, real coach page):
  - the frame is ready and takes the context;
  - a live answer comes back;
  - on S21 the frame is hidden ("No hints during the check...");
  - with the coach blocked, the frame goes after 8 s and the offline tips show;
  - the SCORM log is clean.

### Message to Dor
```
Hi Dor, the L4 self-study now ships as SCORM for Blossom (tested in a mock LMS on another origin).
Your coach page works from there as is: it trusts window.parent (not an origin list) and the proxy
call comes from your page, so the proxy sees Origin https://dory-ship-it.github.io whatever the LMS.
So for ALLOWED_ORIGIN please allow exactly: https://dory-ship-it.github.io (not the LMS domains).
Please keep: no X-Frame-Options / frame-ancestors on the coach page, and the ready/context messages
unchanged. If you ever add a parent-origin check, it would need SCORM Cloud's content origin and our
Blossom domain (Noy will send both after the uploads).
```

## SCORM Cloud
(to be filled with Noy, scenarios 1-6)

## Blossom
Noy uploaded the 25.74 MB zip as is: it was accepted, no size problem. Test course "Unit test", assignment 93112, group 557, launched as Noy (manager). Checked from the browser console, 1 Nov:
- The package is served from `platform.blossom-kc.com/wawiwa_tech/scorm_auth/<token>/index.html` (same origin as the launcher); `window.API` is on the launcher window. Blossom's API also has 2004 names and `BlossomReportingAvailable`.
- The lesson runs in scorm12 mode, contentVersion PK1.
- Resume works across sessions: `entry=resume`, status incomplete, suspend_data and location O2 from Noy's first launch.
- Every set and commit returned true. An S01 answer wrote `cmi.interactions.0` (id, type, response, result, latency, time, weighting, pattern); `_count` is 1 and LMSGetLastError is 0.
- The live coach frame loaded and was ready inside Blossom (S04).
- Noy's test record now has place S04 and one S01 interaction.
- **Scenario 2 (fail then pass), as a test student (impersonation), driven by Claude in the page; all PASS:**
  - First launch: `ab-initio`, not attempted -> incomplete.
  - S21 with every item wrong: score.raw 0, incomplete, 8 interactions.
  - S22 Finish: lesson_status incomplete (never failed), score.raw 0, exit suspend.
  - Quit and relaunch: `entry=resume`. Lands on S21R with the resume prompt and Retake now. The case title and problem (quotes, commas, an apostrophe) are intact, the attempt kept.
  - Retake (version b, 6 of 6): passed, score.raw 100, exit "", 15 interactions, LMSGetLastError 0 throughout.
  - The course page then shows Assignments 1/1.
- **Gradebook (Reports > User performances, Demo Student):**
  - One "Completed performance": score 100, Execution time 00:53. Nothing under "Uncompleted/failed".
  - 00:53 looks like the last session only, not the total; this needs checking against a longer run.
  - Details (chart icon) lists every interaction: result, id, type, user answer, correct answer, weight, response time (latency). All 15 are there.
  - **Issue:** neutral unscored items (L4_PATH_C4/C5, L4_S22_1, weight 0) show a ✗ like a wrong answer. The question column shows only ids (SCORM 1.2 has no question text).
- **Noy's own record** (manager, not assigned): Uncompleted, Status "Suspended", score N/A, Execution time 03:56. That looks like the sum of her sessions, so Execution time is probably the total.
  - Blossom shows NO per-question details for an uncompleted record, only "Not completed" and score 0. A teacher therefore cannot see the answers of a learner who finished below 80 until they pass. Question for Blossom support: is it in Export?
- **Noy's decision after the report (1 Nov):** do not send L4_PATH_C4/C5 and L4_S22_1 (`lesson.lmsReport.skip`). Send every interaction readable: fill-in, id = interaction id + the question in words (`src/tracking/describe.js`), and the answer and correct answer as text (PP1 variant aware).
  - Blossom accepted a 57-character id with the question and text answers with spaces, quotes and an apostrophe (4 PK1TEST rows written to Noy's record, all `true`, error 0).
- **New package (readable report) uploaded with Edit content:**
  - Replacing the package cleared Noy's uncompleted (Suspended) record. **Never replace the package mid-pilot** without asking Blossom what happens to learners in progress.
  - The demo student got a new attempt; the run (S01, S02 x2, W1, S04, S20, S21 fail, finish, resume, retake) showed status passed, 100, Execution time 01:16 (the sum of the attempt's sessions).
  - The details now read well: question in words, user answer and correct answer as text, matching as "card -> column".
  - Neutral rows (free text, W1, S20) still show ✗: Blossom marks anything not "correct" with ✗.
- **After a passed attempt (exit "")**, every launch starts a NEW attempt (`ab-initio`, empty suspend_data): a learner who passed and comes back sees a fresh lesson without their notes.
  - A third attempt by the demo student (5 TEST_ rows with other result values, then passed) was NOT recorded as a performance. Blossom's attempt setting must be checked.
- **v3 package (exit always "suspend"; neutral items sent without a result), demo student, new attempt:**
  - S01, S02 x2, W1, S04, S20, S21 fail, finish: incomplete, 0. Neutral rows have no result (accepted, error 0).
  - Quit and relaunch: resume, S21R, the case title intact. Retake: passed, 100, 18 interactions, exit suspend.
  - Relaunch after passing: Blossom STILL starts a new empty attempt (`ab-initio`) even with exit suspend. So it is Blossom's rule (a completed attempt is closed), not the module's exit.
  - Earlier evidence: a later attempt after a completed one is not recorded, so the passed result stays.
  - Open: whether an Advanced setting changes this.
- **v3 report:** questions and answers read well. Neutral rows still show ✗ even with no result: Blossom shows ✗ for anything not "correct". Kept as is (honest data); teachers are told that ✗ with weight 0 and no correct answer = an open question.
- **Assignment settings (Edit > General > Scorm):**
  - Completion requirement stays "Strict - results processed on LMSFinish/Terminate". "Flexible" would process at S21's passed, mid-lesson.
  - "Don't show report after finishing": on.
  - "This content support reviewing": turned on by Noy. It did not change the relaunch: it resumed the empty "Suspended" attempt left by an earlier revisit.
  - Upload limit 512 MB.
- **For Blossom support:**
  1. Can a learner who completed reopen their completed attempt (review) instead of starting a new one?
  2. Can rows with no result show something other than ✗?
  3. Are the per-question answers of uncompleted attempts available (Export)?
  4. What happens to learners in progress when the package is replaced (Edit content)?

- **Images missing in Blossom (found by Noy):** Blossom answers images with a redirect to signed Oracle object storage, another host. The page's CSP `img-src 'self' data:` blocked them (58 console errors). Video and fonts fall under the same rule.
  - Fix in the package only (`tools/package-scorm.mjs`): img-src, media-src and font-src also allow `https:`; scripts, styles and fetches stay 'self'. Checked by `test:lms-origin`.
  - v4 in Blossom: logo and scene photos load, Assistant fonts load, V1 plays (175 s), captions show.
  - My earlier Blossom checks read the data only and never looked at the screen; the local tests have no redirect.

## Summary for the foreman chat
PK1 is done and tested in Blossom (test course "Unit test", demo student). The SCORM 1.2 package (25.75 MB, limit 512 MB) reports correctly:
- passed / incomplete only, never failed; score 0-100;
- total time; progress saved across sessions, and a learner below 80 comes back to "Retake now" with their work intact;
- every answer per question in words in the teacher report;
- the live coach works inside Blossom; Dor needs to allow only https://dory-ship-it.github.io.
Known Blossom limits (questions sent to support):
- a learner who passed and reopens gets a new empty attempt (the passed result stays);
- open questions show ✗;
- answers of uncompleted learners are not shown;
- do not replace the package mid-pilot.
Not yet done by hand: quit mid-video, the coach answering a student, S19 workbook tab and Copy.
Ready for the 2-3 learner pilot once the pilot course is set up (assignment required, score from SCORM, Strict, no Blossom pass mark).
- Still to do by hand: scenario 3 (quit mid-video and on S19), 5 (the coach answering a student), 6 (the S19 workbook tab, Copy). The report is over 80 lines, because of the Blossom rounds.
SCORM Cloud was not run first: Noy chose to try Blossom directly.

Weekly usage (all models) after: 6%.
