# S03: video case 2 still (Lesson 4, select two)

**Current source (19 Oct 2026):** `assets/img/s03-case2.jpg` is a frame of the real V1 film at 1:52 (`ffmpeg -ss 112 -i assets/video/v1.mp4 -frames:v 1 -vf scale=800:-1`), so the still matches the case the learner just watched. No play badge: the still is a reminder, not a video. The generation prompt below is kept for reference only.

Slot: S03 `cases[1].image` (layout work, still 212 x 124 px with a play badge bottom left, caption "Video case 2"). Later a click opens V1 at segment 5. Screen moment: case 2 of V1, a fintech customer service team (per public reports, 2024 to 2025): an AI agent handles routine conversations, people take the complex ones.
No named character.
Use with: --aspect 16:9 --ref assets/img/refs/style-office-team.jpg (style only)
Out: assets/img/s03-video-case-2.jpg, then set `src` to it and `temp` to false in content/l4-slice.json.
Temp until then: assets/img/temp/ref-team-meeting.jpg (board reference).

## Prompt
Editorial business photograph, a customer service representative with a light headset at a desk, listening carefully to a customer on a call, a monitor showing an abstract chat layout with no readable text, two colleagues at their desks behind, in a modern open-plan office with glass partitions and soft daylight from large windows, shallow depth of field (85 mm lens, f/2), background softly blurred, subtle cool color grade with deep navy shadows and muted teal accents, natural skin tones, realistic texture, calm confident expression, professional but not formal clothing in neutral or navy tones, no logos, no text, no watermark, photorealistic, high detail, wide 16:9 framing, the representative in the centre so the scene reads at thumbnail size, the bottom-left corner kept calm (a play badge sits there). Avoid: illustration, cartoon, 3D render, neon, hologram, glowing icons, exaggerated smile, thumbs up, logos, text, watermark, extra fingers, distorted hands.
