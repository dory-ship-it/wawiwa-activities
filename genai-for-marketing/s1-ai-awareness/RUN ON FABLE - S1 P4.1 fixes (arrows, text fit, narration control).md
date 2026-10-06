# RUN ON FABLE: S1 P4.1 fixes (Dor's review, 6 Oct 2026)

One bounded fix round on the built interactive. Same rules as the main work-order: the original look is the spec, no redesign, no sub-agents. Commit and stop when done.

## סיכום בעברית (לדור)
שלושה תיקונים לפי ההערות שלך:
1. **החיצים הטורקיז יורדים.** במקומם נשארים כפתורי הניווט של הנגן, כך שתמיד אפשר להתקדם.
2. **אף טקסט לא נחתך ואף טקסט לא מוסתר מתחת לתמונה, בכל 33 המסכים.** בדיקה אוטומטית עוברת על כל מסך ומחזירה אפס בעיות.
3. **בכל מסך שיש בו קריין יופיע אייקון רמקול.** הוא מראה שיש שמע מתנגן, ואפשר ללחוץ עליו כדי לעצור ולהמשיך.

## Fix 1: remove the turquoise slide arrows
- Remove the turquoise prev/next arrow graphics that came from the Storyline slides (bottom right, e.g. screens 11 and 31).
- Navigation must still be obvious on every screen. Keep or add the player's own Prev / Next controls in the player bar (same style as the original Storyline player bar), plus keyboard arrows and swipe.
- Screens that must be completed first (e.g. the drag-drop on 28) keep their existing gating.

## Fix 2: no clipped or covered text, anywhere
Seen by Dor: screen 17 "Haiper" sits under the images; screen 31 subtitle runs off the right edge ("…choose others… Nothing is too complicated!" is cut).
- Text boxes wrap inside their box; nothing runs past the stage edge.
- If a box's text no longer fits (e.g. deck text grew via sync), shrink that box's font step by step to a floor of 14px at the 980-wide stage. If it still does not fit, move the following image down, or shrink it, so nothing overlaps. Never hide text.
- Images and media never sit on top of text.
- Build this into the engine (a fit pass on every screen render and every layer/state change), not as per-screen hand nudges. The SME sync can change text length at any time.
- **Test, part of `npm test` / the build check:** a script opens all 33 screens and every layer and state (reveals, timeline stops, carousel slides, drag-drop feedback) at 980x620 and 375-wide phone. For every text element it fails if (a) the content is clipped (scrollWidth > clientWidth or scrollHeight > clientHeight, or it extends past the stage), or (b) its box overlaps any image, video or iframe box. Must report 0 failures.
- Before/after screenshots of screens 17 and 31 in the commit message folder `review/p4.1/`.

## Fix 3: a speaker control wherever a narrator speaks
- Any screen whose original slide has narration audio, including the avatar videos' audio if they autoplay, shows a speaker button in the same place on every screen (top right of the stage, inside the frame).
- While audio plays, the icon shows it with a small animated "sound waves" state. Click → pause (icon shows paused). Click again → continue from the same point. Keyboard: Space or Enter when focused. aria-label "Pause narration" / "Play narration".
- The narration starts as it did in the original, after the START click (which counts as the user gesture browsers need).
- Leaving the screen stops its narration. Screens without narration show no speaker.
- List the screens that got the control in the commit message, read from the original slide data (`source/storyline-published/`), not guessed.

## Acceptance
1. Fix 2 test: 0 failures, desktop and phone.
2. No turquoise slide arrows on any screen; Prev/Next work on all 33.
3. Speaker control on every narrated screen; pause/continue works; nothing plays on screens without narration.
4. Existing tests and the sync build check still pass.
5. Commit "S1 P4.1: arrows removed, text fit, narration control". STOP. Tell Dor in plain words what changed and which screens have narration.
