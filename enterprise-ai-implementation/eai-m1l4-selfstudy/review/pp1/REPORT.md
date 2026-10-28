Weekly usage before: 27% (all models)

# PP1 report: Personal path (silent adaptive practice), EAI M1 L4

## What changed
- **Content** (content/l4-slice.json, written by `tools/pp1-content.mjs`, idempotent): each of S09, S10, S11, S12, S14, S15, S16 and S17 gets a `goal` (g1-g5) and `variants.support` / `variants.stretch`, which override only the changed fields. Core is the screen as it was, untouched. `lesson.adapt` holds the two checkpoints (chapter, the 9 / 4 counted items, minAnswered 6 / 3, L4_PATH_C4 / _C5).
- **S11** uses Noy's approved support and stretch text word for word.
- **Engine**: new `src/adapt.js` (pure level logic, the merge, `variantOf`). In `engine.js`: `view()`, `levelFor()`, `reachCheckpoints()`. `go()` and `trackingMeta()` use the shown variant, so feedback, checks and correct_response come from it. `state.p {c4, c5}` is frozen once set and stored in suspend_data.
- **Checkpoints** fire on entering ch3 / ch4, or any later screen (a resume or a jump), once each. Review mode sets nothing.
- **QA switches** `?level=` and `?path=1..5` work only with `?review=1` or `?debug=1`.
- **Template**: `decision.js` metric draws an optional case line (`screen.context`). `words.js` counts it. No other template change.
- **Reporting**: the 8 screens keep their interaction ids, with the shown variant's correct_response. L4_PATH_C4 and L4_PATH_C5 are written once each: neutral, weighting 0, no pattern. Nothing else in reporting changed.
- **Full hiding**: the S22 record and END are untouched. No level appears on any screen, in the markup, the record or END (tested on all 43 screens x 5 journeys).
- **Review**: a "Paths" filter on review.html, also reachable as `review.html#paths` or `#paths-3`. Three rows (Stretch / Core / Support) x 8 live thumbnails, each opening `index.html?screen=ID&level=LV&review=1`. A journey selector 1-5 marks and numbers the 8 screens in order. The toolbar shows "level · goal" on adaptive screens (review only). Existing views are unchanged.
- **Tools**: `check.mjs` section 17, plus word counts and keys for every variant. New: `test-adapt.mjs` (`npm run test:adapt`), `shots-pp1.mjs`, `pp1-variants-md.mjs`. test-fit section 2b covers 8 screens x 3 levels.
- **Tests adapted to the new interactions**: walk.mjs (pins `?level=core`, expects the two L4_PATH rows, retake count 7/13, the pointer test ignores L4_PATH), test-review (Paths view, toolbar level).

## Test results (final run, logs in review/pp1/final-*.log)
- `npm run check`: passed (72 ok). Every variant: max 25 words per hint/feedback, no em/en dash, keys match, deck sources, no always/never, no all/none of the above, no S21 case.
- `test:adapt`: passed (75 ok). The five personas give journeys 1-5. Plus 22 boundary cases (8/9 stretch, 7 core, 4 support, 5 answered = core, 6 answered with 4 right = support; CP2 stretch 3/4, support 0-1, 2 answered = core).
- **Journeys 1-5** walked O1 to END in local mode: all 8 screens show the right variant; L4_PATH_C4 / C5 once each with the right level; clicked answers carry the variant's correct_response; nothing names a level; longest suspend_data 469 to 481.
- **Edge cases**: jump to S14 with 5/9 answered = core > core, both events in order; resume at S11 = same variant, no second event; Back to ch3 plus an S08 retry = unchanged; S21R review link = same variant; switches ignored without debug/review.
- `test:fit --sizes=1280x720,1600x900`: passed (1426 ok, 342 of them PP1 states across 8 screens x 3 levels x 2 sizes: hint, wrong with the longest line, right, revealed, sort/flag/case states).
- `walk`: passed (619 ok). `test:scorm`: passed (508 ok; 53 interactions each once; suspend_data 2300 chars, 3146 with every free-text field full, limit 4096). `test:review`: passed (29). `test:coach`: passed (29).

## Where stretch kept the HR case, and other content calls
- **S12**: both levels keep the full HR map. It is the canon the chapter built, and S21R's "Revisit the full HR map" links there. Stretch is harder only through the hint (a self-question) and less directive field feedback. Its context line reads "The full HR map from this chapter's demo" because stretch learners did S09-S11 on accounts payable.
- **S09 stretch** does fit the AP case (the card deck is text only).
- **Stretch case balance** (Noy left it to me, 28 Oct): ch3 stretch stays on accounts payable (S09-S11 build one map, Fields 5, 7, 8). Ch4 stretch alternates: S14 moved to the fintech (service agent to the disputes team, contact away; constructed, see pilotCopy), S15 stays on the car company's own bottleneck, S16 fintech, S17 cases a-c AP and d-e fintech. A journey 1 learner meets AP in S09-S11, S15 and part of S17.
- **S11 stretch** has no explain band: with the approved case line and the long option d, the panel ran 22px over the 41cqw limit. The band is the three-part rule, which the stretch hint holds back on purpose. The template's no-band layout puts the Field 8 label above the heading. The approved text is unchanged.
- **Coach tip**: overridden only where the case changes (S10 stretch, S14 stretch), as screen content. The coach code is untouched.
- **pilotCopy** on S09 / S10 / S11 / S14 / S17 stretch and S17 support (constructed details, estimated minutes): see VARIANTS.md.
- **Word counts**: every variant stays within its screen's existing allowance (most bands already go over 45, e.g. S11 64, S14 54, S17 72). S10 stretch is exactly 45.

## Not done, and why
- **S09 hint**: the sort-deck layout shows no visible hint line, on core or on the variants; the hint is read by screen readers only. On S09 the level difference is in the cards and the feedback. Not changed (look and template out of scope).
- **S10 revealed state**: after two wrong tries the panel is 526px against the 524.8px limit, on core too. This already existed (the earlier walk never revealed S10). test-fit lists it as a WARNING, not my change to make.
- Screenshots: 24 main states in review/pp1/screens/ at 1280x720 only.
- Not pushed. The SCORM zip was rebuilt by test:review (dist/ is ignored).
- `.claude/launch.json` at the repo root got an "eai-l4" preview entry; left uncommitted.

## Open questions for Noy
1. **L4_PATH type**: the work-order says type choice with the response support / core / stretch. SCORM 1.2 allows only single characters for choice (the mock rejected it), so I send type fill-in with the word. Keep this, or use choice with s / c / x?
2. **S11 stretch without the explain band**: OK? The alternative is to shorten the approved answers.
3. **Stretch cases**: settled 28 Oct, see "Stretch case balance" above.
4. **S14 support**: the options use "Sender, receiver" instead of "From whom, to whom", because the 2x2 grid fits only shorter lines. OK?
5. **Walk**: the walk now pins `?level=core`, because its learner alone would land on support. Journeys are tested only in test:adapt. OK?

Weekly usage after: 27% (all models)
