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
(to be filled with Noy)

Weekly usage (all models) after: 6%.
