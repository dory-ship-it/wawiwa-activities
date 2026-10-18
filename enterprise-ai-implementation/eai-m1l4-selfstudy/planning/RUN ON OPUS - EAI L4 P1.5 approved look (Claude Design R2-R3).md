# RUN ON OPUS: EAI L4 P1.5 approved look (Claude Design Rounds 2 and 3)

Pilot. Replaces the old work-order "P1.5 visual direction A2" (rejected look, never run). Noy approved a new look in Claude Design. This phase restyles ONLY what exists (frame, menu, S01, S02, FT1, S03) to that look. No new screens, no video work, no wording changes except where this file says so.

## Read first
- `planning/design-reference/README.md` and the six artboard files next to it. **These are the visual source of truth.** They are design exports (absolute positions, a design runtime): rebuild them in the module's own templates and CSS, do not paste the markup.
- `planning/PRD.md`, `content/l4-slice.json`, current `src/`, `review/p1/REPORT.md`.
- `planning/IMAGE STYLE.md` and `tools/README-images.md`.

## Rules
- Run this phase only, no sub-agents. Commit locally at the end, never push. Then STOP.
- WCAG 2.1 AA stays: keyboard, aria-live feedback, visible focus, contrast ≥ 4.5:1 (text ≥ 14px everywhere, targets ≥ 44px), prefers-reduced-motion.
- Feedback never covers content. No text outside the content JSON except `ui` strings.
- Fonts must load offline (SCORM): self-host Assistant and Roboto from `assets/fonts/` (add Roboto 400/500/700 if missing). No Google Fonts link.

## Tokens (replace the P0 palette)
| Token | Value | Use |
|---|---|---|
| navy | #255777 | headings, big statements, links, menu icon |
| teal | #3E868F | correct fill/border, rail done/current, progress fill |
| teal-ink | #2F6A72 | teal text (labels, correct verdict, numerals) |
| teal-tint | #E7F2F3 | correct band, current chapter in menu, active toggles |
| turquoise | #5AB3AA | short accent rules only (28 to 40 x 3 to 4 px), process line; never text |
| red | #EE3124 | ONLY the unlocked Next button |
| error | #CC0000 on #FBEAEA | wrong verdict, wrong option |
| ink | #000000 / #3F3F3F | body / secondary text |
| grey | #F2F2F2 (hint band), #E6E6E8 (locked Next, rail line), #D8D8D8 (hairlines), #BFBFBF (not-started rings, idle borders) | |
| white | #FFFFFF | ground |
Type: Assistant for headings, statements, answers (800 for big statements 28 to 36 px; answers 18 to 21 px, 600 to 700); Roboto for labels and meta (14 to 15 px). Radius 8 px on buttons and cards only; hairline lists have no radius. No shadows except the memo card and the open menu.

## The shell (all screens; see every artboard)
1. **Chapter rail**, left, 64 px, white, right hairline: menu button (44 px) on top; one 28 px dot per chapter in `chapters` (done = teal fill + white check, current = teal ring 3 px, not started = grey ring) joined by a 2 px line (teal up to the current chapter, grey after); `% done` at the bottom (Assistant 800 16 px navy + "done" Roboto 14 px). Each dot is a button with an aria-label "<title>, <status>"; completed chapters navigate, future ones are disabled (announced).
2. **Footer**, 64 px, white, top hairline: `Previous` (text button, navy, chevron) left; `Next` right: locked = #E6E6E8 with a lock icon and an aria-label saying why; unlocked = red #EE3124, white bold. Nothing else in the footer.
3. **Remove** from the player: "Screen x of y", minutes left, the segmented progress bar, CC and volume (they belong only to the video player, P3). Keep the "Saved" indicator, small, in the rail or the open menu.
4. **Logo** top left of the content area (as in the artboards), lesson title only inside the open menu.
5. **Menu** (`R2-menu-open.html`): panel 380 px from the left over a grey scrim, close button, "Module 1 · Lesson 4", lesson title, "% complete" with a thin teal bar and time left, chapter list (status icon, title, Done / minutes; current chapter on teal-tint). Resources, Help, Start over: a small footer row of text buttons in the panel. Focus trap, Esc closes, focus returns to the menu button.

## Feedback band (all interactive screens; pattern = `R2D-work-select-two.html`)
- A band directly under the interaction, the **width of that screen's interaction area** (full content width on work screens, the right column on split screens). Never overlays content; space is reserved so nothing jumps.
- States: hint = #F2F2F2, info icon, Roboto 15 px; wrong = #FBEAEA, verdict Assistant 800 22 to 24 px #CC0000 ("Not quite.", "One of two.") + task line 16 to 17 px black; correct = teal-tint, verdict teal-ink. The Check button (when the template has one) sits inside the band, right.
- **Multi-select (S03): no paging.** One band: the verdict for the attempt, then the feedback line of the first wrong option chosen (or the correct feedback). Wrong options marked red, right ones teal. Add `ui.feedback.oneOfTwo` = "One of two." if needed.
- aria-live polite on the band; focus moves to Next when it unlocks (as in P1).

## Screens
- **S01** = `R2A-decision-editorial.html`: image column 460 px left, right column: small teal-ink label "A message from Dana", quote 1 large (33 px 800 navy), quote 2 (23 px 700), turquoise rule + "Dana, HR director · Fictional character", instruction h1, three numbered hairline rows (numeral teal-ink 22 px 800, chevron right), feedback band under the rows in the right column.
- **FT1** = `R2B-decision-desk-memo.html` variant (`layout: "memo"` in content): image top left, memo card overlapping it (From / To line, the challenge text), instruction + hint left, option cards right (numeral 40 px teal, radio ring). Keep the P1 route buttons (Jump / Watch / Skip) inside the band after an answer.
- **S02** (input): the kept centered single column inside the shell; labels, 250 counter, privacy line, Save; feedback band under the form.
- **S03** = `R2D-work-select-two.html`: label + big question top left, the two video-case stills top right (play badge, captions "Video case 1/2"; clicking a still opens V1 at that case later, a no-op now), the turquoise process line with one marker per option (state colors), four option cards in a row under it, the band under the cards with Check inside.

## Images (slots now, real images later)
1. Add an `image` object to screens that need one: `{ "src": null, "alt": "...", "prompt": "assets/img/prompts/<ID>.md", "temp": false }` (S01, FT1, S03 case stills x2). Document it in the PRD addendum.
2. For each slot write the prompt file `assets/img/prompts/<ID>.md` from the master prompt in `IMAGE STYLE.md`, a SUBJECT that fits that screen's moment, and the FRAMING/aspect the layout needs. Dana appears in S01 and FT1: same character description; note that `assets/img/dana.jpg` will be the face reference once approved.
3. Until real images exist, use `planning/design-reference/ref-team-meeting.jpg` and `ref-video-case-1.jpg` copied to `assets/img/temp/`, with `"temp": true`. `npm run check` must print a WARNING listing every temp image (not a failure). Never a dashed placeholder or a grey box.
4. Do not call the image generator in this phase (billing is not set up yet).

## Checks and output
1. Update `tools/check.mjs`: hex allowlist = the tokens above (fail on any other hex in `src/`); temp-image warning; existing word limits stay.
2. Update `tools/test-fit.mjs`: band never overlaps content in any state; band width equals its interaction area; no clipping at 1280x720 and 1024x576; contrast of every new text/background pair; targets ≥ 44 px.
3. Update `tools/walk.mjs`: keyboard walk through rail, menu (open, navigate, Esc), S01, S02, FT1 routes, S03 (wrong then right).
4. Run `npm run check`, `npm run test:fit`, `npm run walk`; all pass.
5. Screenshots to `review/p1.5/`: `s01-hint.png`, `s01-wrong.png`, `s01-correct.png`, `ft1-memo.png`, `ft1-routes.png`, `s02.png`, `s03-one-of-two.png`, `s03-correct.png`, `menu-open.png`, `rail-ch1.png`. Also a side-by-side `compare-s01.png` and `compare-s03.png` (left: the reference artboard rendered from `planning/design-reference`, if it renders without the design runtime; otherwise skip and say so).
6. `review/p1.5/REPORT.md`, max 15 lines: what changed, checks and results, any deviation from the artboards and why, temp images in use, "Next".
7. Commit: `EAI L4 P1.5: approved look (rail, footer, feedback band, S01 S02 FT1 S03), image slots`. STOP.

## Definition of done
All checks pass; screenshots exist; the screens read as the artboards (rail, footer, editorial S01, memo FT1, process-line S03, band under each interaction); only Next is red; no "Screen x of y" or segmented bar anywhere; every image slot has a prompt file.
