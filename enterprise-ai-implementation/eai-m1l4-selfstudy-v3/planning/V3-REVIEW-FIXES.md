# v3 review fixes (Noy, 10 Nov 2026)

Copy of eai-m1l4-selfstudy-v2 (left untouched). launch.json "eai-l4-v3", port 8130.
All CSS is at the end of src/v2.css ("v3 review" block); content edits are photo/ground fields only.

| Screen | Her note | Change |
|---|---|---|
| O1 | blur the background a little | photo blur 4px |
| W1 (and all openers W2-W6, "screens of this type") | focus, more blur, contrast | photo blur 9px + darker on the card side; card 86% opaque with a turquoise edge glow |
| W2 | blur a little | same opener rule |
| S03 | ground feels empty | turquoise light on the dot grid, the card glows, a line forks from the card to the two causes, turquoise icon discs |
| S02, S15 (+ same type S08B, S20) | outdated photo, more tech | new photos in the O1 style: ch1-s02-tech-form, ch5-s15-tech-stack, ch3-s08b-tech-cards, ch6-s20-tech-check |
| S18 | blur, question at the side is odd | darkblur ground with new photo ch6-s18-tech-redact, the panel centred, turquoise edge glow |

**Round 2 (Noy, 10 Nov):** the tech-UI photos (round 1) were rejected; she liked S03 and the openers. From a board of 3 directions (planning/v3-photo-directions.jpg) she chose a mix of A (cinematic person, turquoise network lines, the O1 look) and B (bright daylight office, side view, turquoise edge glow):
- A: S02 ch1-s02-people-network, S15 ch5-s15-people-stack, S18 ch6-s18-people-shield (blurred)
- B: S08B ch3-s08b-bright-tablet, S20 ch6-s20-bright-pen
Sheet: planning/v3-review-sheet-photos2.jpg. The round-1 tech-* photos stay in the folder, unused.

**Round 3 (Noy, 10 Nov, via side chat + mid-turn notes):** apply the principles lesson-wide, keep it clean; not too many random people (they clash with the HR case and the films' characters: Dana, the HR staffer, the HR manager); each photo must fit its screen's content.
- White (dots) screens, all of them: soft turquoise light on the grid, a faint turquoise edge on the white panel, turquoise discs on the S03/S08 icons. Nothing else added.
- People only where they belong to the story: O1 and END (the deck's slide-1 photo), W3 and the HR-demo screens behind it (the film's own still v2-04, the HR staffer at the front desk, mirrored so she is clear of the card). Every other photo is an object or hands only, matched to the screen:
  - O3/S01 map wall with one red card · W1 laptop on tangled paperwork (V1, K1 keep their approved old photo) · S02 laptop side view, hands typing
  - W2 hand sketching boxes and arrows (+ K2, S04, S05a, S06, S07 blurred) · S08B stylus on tablet
  - W4 hand pointing at a highlighted handoff arrow on a printed map (+ S13, K4, S17) · S15/S16 paper stack, hand, hourglass
  - W5 hands writing beside a laptop, three-node flow (+ S18B, S19A, S19C, S20B) · S18 hands typing under a lock shield · S20 pen over a page
  - W6 finished map with a check on the last card (+ S21, S21R) · S22 the finished sketch beside a closed laptop at dusk

**Round 4 (Noy, 10 Nov, on the live Overview):** O2/S10/S12 "the glow in the middle is ugly, remove it; around is fine"; W1 "why at the side? centre it, set it off with the frame"; S10 "text ran out of the frame, check all screens"; S19C/S22 "why at the side? why is the photo sharp?"; "no object may sit on another".
- The radial glow on the dot grid is gone from every screen (S03 keeps its approved one). The turquoise edge stays on real panels only (S10's fill sheet is transparent with no padding: the edge drew a frame tight on its text).
- All opener cards (W1-W6) are centred, with a 1.5 px turquoise frame and a soft halo.
- No task at the side: S02, S08B, S15, S18, S20, S22 on the soft ground (ground.tone 'soft', zones.js: photo blurred under a lighter veil), one centred panel; S19C's panel centred. S15: after the answer the proof sits beside the question; S22: the question, then the Lesson 5 bridge under it.
- tools/check-overflow.mjs (new): every screen, arrival and after a wrong answer, at 1280x720, 1024x576, 1920x950: content out of its panel, overlapping blocks, text off the stage or on the nav row.

Not touched: V1, K1 (liked), every other screen. Old photos stay in the folder (S16 still uses the old paper stack, blurred).
Checks: check passed, test-fit passed for the 13 touched screens. Review sheet: planning/v3-review-sheet.jpg.
