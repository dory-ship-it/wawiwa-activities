# P4.1 review: before / after (Dor's fixes, 6 Oct 2026)

Screenshots taken by `node tools/test-fit.mjs --shots 17,31 --out review/p4.1 --tag before|after`
(desktop 980×620 and phone 375 wide, after the screen's timeline has run).

| Screen | Before | After |
|---|---|---|
| 17 Image to few-second Video | `before-screen-17-desktop.png`: the tool list wraps to a third line and "Haiper" sits under the two pictures | `after-screen-17-desktop.png`: the fit pass shrinks the box from 28px to 25px, the list fits on one line, clear of the pictures |
| 31 Recommended AI Stack | `before-screen-31-desktop.png`: the subtitle box is 1215px wide, the sentence runs off the right edge ("…Nothing is too complicated!" is cut) | `after-screen-31-desktop.png`: the box is clamped to the stage and the sentence wraps to two lines |

Phone versions: `*-phone.png` (same fixes at 375 wide).

Everything else the fit pass touches is invisible: a dozen boxes whose text was a few pixels taller than
their declared box simply grow (screens 9, 10, 22, 28, 33 and some layers), and the two role lists on
screen 25 drop from 20px to 19px to stay above the footer strip. The full list prints with
`node tools/test-fit.mjs --changes`.
