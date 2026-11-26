# Kit changelog

## 0.1.0, 26 Nov 2026: sound effects and the sound button

- New `src/sfx.js`, `ctx.sound(audio) -> { play, stop }`: a template's sound effect sounds only on its own screen
  (stopped when the screen goes), starts on the learner's first click or key when the browser refused it on arrival
  (Chrome's autoplay rule; before, the CALL ring was then lost for good), and never plays in a review thumbnail.
- New: the sound button in the top bar (zones.js `.w-bar-sound`, after the coach launcher): a 44 px speaker toggle,
  `aria-pressed` (pressed = muted), its name `ui.sound.mute`, the tooltip `ui.sound.unmute` while muted. Shown only
  on a screen with a sound effect. The choice is the lesson state's `m` (suspend_data and localStorage): it holds for
  the session, after a relaunch and through Start over. Films and the podcast keep their own volume.
- The CALL template (dm2.js) uses it for its ring.

## 0.1.0 (23 Nov 2026)

First version, KIT-PLAN.md step 1. Built from DM M2 L2 (`digital-marketing/dm-m2l2-lesson`, the newer lesson), with what only EAI M1 L4 v3 had.

- Engine, shell, state, tracking, coach, ghost hand, review mode and every template of both pilots, in one place. The lesson-specific values (content file, storage key, id prefix, coach page, port, SCORM ids) moved to the lesson's `kit.json` (`src/config.js`, `tools/kit.mjs`).
- `src/base.css` = EAI v3 `frame.css` (full screen, the new Play button) + `fx8.css` + `v2.css`, with no screen-id rule: the title screen's rule keys to its template; `case-heading` (EAI QH1, DM S11B) is an option.
- `profiles/dm.css` (DM M2 L2's `dm.css` and its three accent tokens; S35's rule is the option `compact`) and `profiles/eai.css` (EAI v3's screen-id rules as options: rise-line, rise-rows, opener-left, tree-glow, soft-panel, stack, stack-bridge, stack-pair).
- New: `screen.styles` (options by name), `stage[data-template]`.
- New: the score from the scored questions along the lesson, pass mark 80, one attempt, no retake (`completion.retake` brings it back); `completion.scoredScreens` optional; the end screen passes in a lesson without a final check.
- New (Noy, 23 Nov 2026: "Show failed"): a finish under the pass mark reports `lesson_status` failed with its score; passed stays sticky; before the finish it is incomplete; `cmi.core.exit` stays suspend. (`completion.retake` true keeps the old incomplete.) `completion.statusWhenNotPassed` is no longer read.
- New: film and audio speeds 0.5, 0.75, Normal, 1.25, 1.5, 2 (`src/speeds.js`, the video player and the podcast).
- New: review.html's slim top line (Back to the hub, Open as a learner).
- New: `kit:sync` (copy, shell pages, stamp, `kit.lock.json`); `check` fails on an edited kit file, an extra file in `src/` or `tools/`, a screen id in any stylesheet or kit module, a style option no stylesheet defines, a lesson with no scored question.
- Generic: the EAI lesson record (S22's download) and the case card read their screen ids and store key from the content (`screen.record`, `screen.caseKey`); the S19 state migration is `lesson.renamedScreens`.
- EAI M1 L4 on the kit (step 3, 23 Nov 2026): `profiles/eai.css` gets A5 for the whole profile (the body 32 px under the heading block; the context line over a heading as a tag); the result screen's pass-mark line (`.d-pass-note`, A6) moves to the base; kit.json `siblings` (files of a neighbour folder, served locally), `photoManifest`, `coach.groundingPack`; the EAI tests made lesson-agnostic (`test-coach`, `test-coach-live`, `test-lms-origin`, `walk-wrong`; `test-adapt` runs the lesson's `tests/adapt.mjs`); `check`: a screenshot (an image with a `source`) needs no "no text" rule, a locked coach screen needs no opening line, the score counts version a of a check item.
- Kit fixes found on EAI: `walk-wrong` picks as many answers as a multi-select asks for; `package` warns when content files from a sibling folder cannot go into the zip; the EAI profile's coral text token `--wl-coral-text` (contrast).
- Tools split: `walk-lib.mjs` (helpers) + the lesson's `tests/walk.mjs`; `state-helpers.mjs` + the lesson's `tests/states.mjs`; the lesson's own check rules in `tests/check.mjs`.
