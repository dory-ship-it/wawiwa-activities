# S03: video case 1 still (Lesson 4, select two)

**Current source (19 Oct 2026):** `assets/img/s03-case1.jpg` is a frame of the real V1 film at 0:56 (`ffmpeg -ss 56 -i assets/video/v1.mp4 -frames:v 1 -vf scale=800:-1`), so the still matches the case the learner just watched. No play badge: the still is a reminder, not a video. The generation prompt below is kept for reference only.

Slot: S03 `cases[0].image` (layout work, still 212 x 124 px with a play badge bottom left, caption "Video case 1"). Later a click opens V1 at segment 3. Screen moment: case 1 of V1, the early-1980s accounts payable department of a US car company: about 500 people reconciling three separate documents by hand.
No named character.
Deviation from the master prompt: the setting clause is changed from a modern open-plan office to an early-1980s office, because the case is historical. Style, grade, lens and negatives are unchanged.
Use with: --aspect 16:9 --ref assets/img/refs/style-office-team.jpg (style only)
Out: assets/img/s03-video-case-1.jpg, then set `src` to it and `temp` to false in content/l4-slice.json.
Temp until then: assets/img/temp/ref-video-case-1.jpg (board reference).

## Prompt
Editorial business photograph, an accounts clerk at a desk comparing three paper documents side by side, a purchase order, a receiving slip and an invoice, stacks of paper folders around, rows of similar desks behind, in a large early-1980s accounts office with tall windows and soft daylight, no computers, shallow depth of field (85 mm lens, f/2), background softly blurred, subtle cool color grade with deep navy shadows and muted teal accents, natural skin tones, realistic texture, calm focused expression, period office clothing in neutral or navy tones, no logos, no readable text on the papers, no watermark, photorealistic, high detail, wide 16:9 framing, the clerk and the three documents in the centre so they read at thumbnail size, the bottom-left corner kept calm (a play badge sits there). Avoid: illustration, cartoon, 3D render, neon, hologram, glowing icons, exaggerated smile, thumbs up, logos, text, watermark, extra fingers, distorted hands.
