# P5.1 review: before / after (side-by-side review against the Storyline block, 6 Oct 2026)

Before: the page at commit 73b3d48. After: `npm run shots` (desktop 980×620 and phone 375 wide, retina).
Screen 8 is shot with its timeline run to 1.5 s (`--at 1500`); screen 28 twice, captions off and on with
one of its real cues showing (`--cc on`, file name `-cc`).

| Screen | Before | After |
|---|---|---|
| 2 Nice to meet you… | `before-screen-2-*.png`: no divider left of the name field | `after-screen-2-*.png`: the thin white vertical line is drawn (also on 4, 23, 32) |
| 4 Section 1 | `before-screen-4-*.png`: no divider between the "1" and the title | `after-screen-4-*.png`: the line is drawn |
| 8 Evolution of AI (1980s) | `before-screen-8-*.png`: the green arrow shows from 0 s | `after-screen-8-*.png`: at 1.5 s the hint and the arrow show, as the original's timeline has it (hint at 0 s, arrow at 1 s, both gone at 3 s) |
| 28 Transition of roles, captions off | `before-screen-28-*.png`: the speaker sits on the green hint box; captions were on by default | `after-screen-28-*.png`: captions off at load; the hint and its frame sit 10 px further left, clear of the speaker |
| 28 Transition of roles, captions on | `before-screen-28-cc-*.png`: the caption bar covers the Copywriter row and the drop boxes | `after-screen-28-cc-*.png`: the cue shows in a strip under the slide; nothing on the slide is covered |
| 33 Next session | `before-screen-33-*.png`: "What can you do towards the next session, ?" | `after-screen-33-*.png`: "What can you do towards the next session?" (with a name: "…session, Dana?") |

Phone versions: `*-phone.png` (same fixes at 375 wide; the speaker's footprint is bigger there, so on 28
the hint moves 65 px left and on 29 the "*Click the buttons" hint moves 52 px left, both at full size).
The full list of what the fit pass changes prints with `node tools/test-fit.mjs --changes`.
