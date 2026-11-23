> SUPERSEDED (2026-10-18): do not run. Direction A2 was rejected. Use "RUN ON OPUS - EAI L4 P1.5 approved look (Claude Design R2-R3).md".

# RUN ON OPUS: EAI L4 P1.5 visual direction A2 (player look, menu, image slots)

Pilot. Noy reviewed P1 on localhost: the module looks colorless and "like a code page, not an e-learning module", and the menu is overloaded. This phase restyles ONLY what exists (frame, menu, S01, S02, FT1, S03) to the approved direction A2. No new screens, no video work, no content wording changes.

## Read first
- `planning/PRD.md` (sections on tokens, zones, accessibility) and `content/l4-slice.json`.
- Current code in `src/` and the P1 report `review/p1/REPORT.md`.

## Rules
- Run this phase only, no sub-agents. Commit locally at the end, never push. Then STOP.
- Brand colors only: Navy #255777, Navy dark #1C455F, Turquoise #5AB3AA (lines, glow, grid; never text on white), Teal #3E868F (correct; teal text uses #2E6E76), Red #EE3124 (ONLY the Next button and the current-position marker), Light grey #E6E6E8, Soft #F6F8F7, white, ink #1F2937, errors #CC0000. No other hues. Font Assistant. No italics.
- WCAG 2.1 AA stays: contrast, keyboard, aria-live feedback, visible focus, prefers-reduced-motion disables all ambient motion.
- Feedback must never cover content (keep a reserved feedback zone).

## The A2 look
1. **Player chrome (like a Storyline player):**
   - Top bar on Navy dark #1C455F: menu button (left), Wawiwa logo, lesson title "Lesson 4 · Process mapping", right side: chapter name + "Screen x of y", Saved indicator. Light text.
   - Bottom bar on Navy dark: Prev button (left), the segmented chapter progress bar (center, turquoise fill for done, white 25% for future, red marker for current position), CC and volume icon buttons (disabled-looking placeholders except on video screens, with tooltip "Available on video screens"), and the primary **Next** button (right, red, white bold 20 px, pill shape). Continue/Next logic stays the same (Next appears enabled only after a correct answer).
   - The slide area between the bars is 16:9 content, full bleed (no grey card floating on white).
2. **Story vs work rule:**
   - "Story" screens (a character with a dilemma, chapter openers, the FT challenge, video): a **dark band** across the top ~50% of the slide: radial gradient from Navy #255777 to Navy dark #1C455F, an optional photo backdrop slot under a navy overlay (70%), and a subtle turquoise grid (8% opacity) drifting slowly. Character portrait + quote sit in the band (quote in white, 18 px, line-height 1.45; label line in turquoise caps, letter-spacing .12em).
   - "Work" area (answers, inputs, sorting): the lower part on a light ground (#F6F8F7 with a 6% navy grid), white option tiles with a soft navy shadow, 14 px radius, an icon tile (navy square with turquoise icon), hover lift 2 px and turquoise border; selected/correct/wrong states as today.
   - S01 and FT1 use band + work area. S02 and S03 are work screens: light slide with a slim dark header strip (instruction line in white on navy) instead of the big band.
3. **Feedback zone:** a reserved strip at the bottom of the slide (inside the slide, above the bottom bar), rounded 12 px, hint state = white with navy text; correct = light teal tint #E6F4F2 with #1F5C55 text and teal border; wrong = #FCE9E9 with #A30000 text and #CC0000 border. Slide-in 200 ms (none under reduced motion).
4. **Menu (simplified):** side panel from the left over the slide, Navy dark ground, light text. Shows ONLY chapters: name, minutes, a status icon. The current chapter is highlighted (navy #255777 pill) and is the only one expanded to its screens (completed screens clickable). Chapters not in the pilot are collapsed into ONE muted line: "Chapters 2 to 4 come after the pilot". Resources, Help and Start over move to a small footer row of three text buttons. Remove the per-chapter screen lists for non-current chapters.
5. **Image slots (assets come later, see `planning/IMAGE STYLE.md`):**
   - `avatar` per character: rounded-rectangle portrait 4:5 (not a circle), 2 px turquoise border, soft glow ring animation (off under reduced motion). Until `avatar.src` is set, show a tasteful placeholder: navy-to-teal gradient with a simple silhouette and the label "Photo coming" in small caps, plus the "Fictional character" badge.
   - `band.backdrop` per story screen: optional image under the navy overlay; until set, gradient only.
   - Add both slots to the content JSON schema (`null` by default) and document them in the PRD addendum.
6. Motion: one orchestrated entrance per screen (band fades in 250 ms, then work tiles rise 8 px with 60 ms stagger). Nothing else animates except the band grid drift and the avatar glow. All off under prefers-reduced-motion.

## Steps
1. Add/adjust tokens; implement player chrome; move progress bar to the bottom bar.
2. Implement band/work layout primitives in `templates/stage.js`; apply to S01, FT1 (band) and S02, S03 (header strip).
3. Rework the menu as specified.
4. Image slots + placeholders.
5. Update test-fit (no clipping, reserved feedback zone never overlaps, contrast of new pairs, empty-band check still passes, keyboard walk unchanged) and run `npm run check`, `npm run test:fit`, `npm run walk`.
6. Screenshots to `review/p1.5/`: `s01-hint.png`, `s01-correct.png`, `s01-wrong.png`, `ft1.png`, `s02.png`, `s03-feedback.png`, `menu.png`, `progress-bottom-bar.png`.
7. Save the report as `review/p1.5/REPORT.md` (max 15 lines: what changed, checks and results, any brand or contrast compromise, "Next").
8. Commit: `EAI L4 P1.5: visual direction A2, player chrome, simplified menu, image slots`. STOP.

## Definition of done
All checks pass; screenshots exist; no non-brand color in `src/` (add a check that greps hex values against the allowed list); menu shows chapters only with the current one expanded; Next is the only red control.
