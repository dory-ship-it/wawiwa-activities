Weekly usage before: 32% (all models)

# EAI L4 CO2: the live coach page in the coach panel

Run co2, 28 Oct 2026. Not committed, not pushed.

## What was built
- CSP (index.html, so also the SCORM zip's copy, rebuilt): `frame-src 'none'` is now `frame-src https://dory-ship-it.github.io`. Nothing else changed (check 16 asserts the whole string).
- src/coach/live.js (new): the coach URL (its only home), the kind-to-type map, the context builder, and the frame with its message listener.
- Panel: the CO1 launcher and header stay. From the learner's first open, one iframe fills the body under the header: 340 wide, y 150 to 632 (482 high), border 0, title "Wawiwa AI Coach chat" (content ui.coach.frameTitle). CO1's log and footer are hidden while the page is shown.
- Loading: made on the first open, once per launch, kept mounted (closing hides the panel; it is never moved or reloaded). Never made in review mode (?review=1, thumbnails included) or with ?live=0.
- Lesson to page: after the page's ready and on every screen change (panel open or closed), `postMessage(ctx, 'https://dory-ship-it.github.io')` with exactly the 10 keys. screen = id, chapter = chapterNo(), chapterTitle, step = the screen's step verb, screenType from coach.kind (idea/hello -> present, own -> case, ...), note '', tip = coach.tip, each cut to the page's limits.
- caseNotes: only when screenType is case. "Label: text" lines for the filled L4_CASE_* fields, in lesson order, raw, cut at 6000. Labels come from the content's own field labels (Case title, The problem today, Trigger, Steps, Output, Baseline, Target, Date, Could fit AI, Stays with a person).
- Page to lesson: taken only when `e.source === iframe.contentWindow` and `e.origin === 'https://dory-ship-it.github.io'`. Ready: mark live, send the context. Close: close the panel, focus on the launcher.
- Fallback: no ready in 8 s, or a load error: the frame is removed and the panel shows CO1's offline state with the tip (the line, "What do I do here?", the tip). The rest of the launch stays offline. No error text.
- S21: launcher locked as in CO1; the panel shows CO1's notice and hides the frame; the page gets screenType 'locked'. S21R shows the frame again (same load).
- Keyboard: Tab goes from the header's close into the frame, Shift+Tab back. Escape in the lesson closes the panel; Escape inside the page arrives as the close message.
- Review page: the CO1 coach row is unchanged, plus the line "Live chat: Dor's page, framed only in the live lesson."
- No AI call, no SCORM call and nothing stored by the lesson for the coach. transport.js stays offline (it answers the fallback chip). No code was copied from the coach page (only its protocol was read).

## Decisions to confirm (Noy)
1. Header "chapter line": CO1's clean-chat follow-up already removed the "Chapter N · verb" line, so the header is grip, robot, title, close. I kept it that way and did not bring the line back.
2. Test switch `?live=0`: the CO1 tests (test:coach, walk's coach part) run offline with it. test:fit section 4 and test:coach-live use a local stub served at the real coach URL by request interception.
3. Extra hardening on the iframe: `sandbox="allow-scripts allow-same-origin allow-forms"` and `referrerpolicy="no-referrer"`. The real page works with both (live answers below).
4. The O3 demo stays CO1's one-line panel. The frame is made on the learner's own first open, not by the demo.
5. Fallback shows CO1's "after the chip" state at once, so the learner sees the tip without pressing anything. Later screens show CO1's line and chip.
6. Dor's page lets its own pack's type and note win over the lesson's for screens it lists (all 43 are listed, with the same types as the map above). So the lesson's values matter only for screens the pack does not know.

## Tests (one full run at the end, stamp 86f78ba2)
- test:coach-live (new, tools/test-coach-live.mjs + tools/coach-stub.html): 26 ok, 0 fail. iframe src exactly the coach URL; all 43 slice screens send exactly the 10 keys within the limits, each with its own chapter, step, type and tip; caseNotes non-empty only on S02, S08B, S12B, S17B, S18B, S20B ("Label: text", blank field left out, cut at 6000); ready sends the context, close closes; 6 foreign messages ignored (another source or origin); Tab in and out; no reload across close/reopen and screens; no LMSSetValue/LMSCommit (9 before, 9 after); silent and failed load fall back at 8 s; S21 hides, S21R shows; review and ?live=0 never frame it.
- check: 73 ok (16: one URL, in live.js; CSP string; every kind has a live type). test:coach: 29 ok. test:review: 30 ok (incl. the new note line). test:scorm: 508 ok. walk: 619 ok.
- test:fit --sizes=1280x720,1600x900: 1598 ok, 0 fail. Section 4: the panel with the live page (stub) at both docks on all 43 screens, both sizes (172 frame checks: 340 wide, under the header to the foot; hidden on S21).
- The first full run had three crashes from the machine, not the code: test:fit stopped on net::ERR_NETWORK_CHANGED, test:coach on "Navigating frame was detached", and walk had one fail on the S04 ghost-hand timing while other Chrome jobs ran. Each passed when rerun alone (numbers above).

## Real coach URL on localhost (headless Chrome, real network, no stub)
- S04, "How do I tell a trigger from a step?": answered live (proxy POST 200). The answer explained trigger vs step and asked which card marks the start.
- S02, with a case title and problem filled, "Is my problem statement specific enough?": answered live (proxy POST 200). The answer quoted the problem ("notes written by hand, managers reading days later"), so caseNotes reached the page.
- The proxy did not refuse the localhost run. Requests: the coach page GET 200 (once per launch), OPTIONS 204, POST 200.

## Screens (review/co2/screens)
01 S04 open with the live page and its answer, 02 S02 open with the live answer on the case, 03 S21 locked (notice, frame hidden), 04 the 8 s fallback (stub that never sends ready).

## Open
- Dor: the page lists all 43 screens already; nothing needed from the lesson side.
- Commit and push when approved (the SCORM zip in dist/ is rebuilt; dist/ is not in git).

Weekly usage after: 32% (all models; the weekly window resets 28 Oct 16:00 UTC)
