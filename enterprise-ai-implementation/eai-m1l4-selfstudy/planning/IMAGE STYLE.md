# Image style: EAI self-study modules (pilot)

Approved by Noy: **business editorial photography**. Realistic, mature, calm. Real-looking professionals in a modern office, natural light, soft depth of field, a light navy and teal color grade that sits naturally with the Wawiwa palette (Navy #255777, Turquoise #5AB3AA, Teal #3E868F). Not illustrated, no glowing holograms, no stock-photo grins, no visible logos or brand names, no text in the image.

All people are synthetic (AI-generated), never a real person's likeness, and every character is labelled "Fictional character" in the module.

## Master prompt (reuse for every image, fill the [brackets])
Editorial business photograph, [SUBJECT], in a modern open-plan office with glass partitions and soft daylight from large windows, shallow depth of field (85 mm lens, f/2), background softly blurred, subtle cool color grade with deep navy shadows and muted teal accents, natural skin tones, realistic texture, calm confident expression, professional but not formal clothing in neutral or navy tones, no logos, no text, no watermark, photorealistic, high detail, [FRAMING].

Negative: illustration, cartoon, 3D render, neon, hologram, glowing icons, exaggerated smile, thumbs up, logos, text, watermark, extra fingers, distorted hands.

## Assets for the Lesson 4 pilot
1. **Dana, HR director (fictional).** SUBJECT: "a woman in her mid 40s, HR director, holding a tablet, looking slightly off camera, thoughtful". FRAMING: "waist-up portrait, vertical 4:5, subject centered, space above the head". Size: 1200x1500 px, JPG. Optionally a second version with transparent background (PNG).
2. **Story band backdrop (no people).** SUBJECT: "an empty modern office corridor with glass meeting rooms and a soft blur". FRAMING: "wide 16:9, 2560x1440, no people, darker tones so white text stays readable under a navy overlay".
3. (Later, per chapter opener) the same master prompt with a scene that matches the chapter, for example "a whiteboard with a hand-drawn process flow, a person's hand holding a marker" for the Toolkit chapter.

## Delivery
Save to `enterprise-ai-implementation/eai-m1l4-selfstudy/assets/img/` as `dana.jpg` and `band-office.jpg`, then set `avatar.src` and `band.backdrop` in `content/l4-slice.json`. Keep the generator name and the exact prompt used in `assets/img/SOURCES.md` (for licensing and to regenerate in the same style).
