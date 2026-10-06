# RUN ON FABLE: S1 P5.1 fixes (Opus side-by-side review, 6 Oct 2026)

Review of the live page (commit 73b3d48) against the original Storyline block, screen by screen. Most screens match the original pixel for pixel (timelines, carousel, reveals, drag-drop, Perplexity link and layer, all video durations identical, YouTube embeds load). Six things to fix. Same rules: original look is the spec, no sub-agents, commit and stop.

## סיכום בעברית (לדור)
רוב המסכים זהים למקור. שישה תיקונים:
1. **כתוביות.** הן מופיעות כברירת מחדל ומכסות תוכן (מסכים 28 ו-29). במקור הן כבויות כברירת מחדל. מתקנים: כבויות בהתחלה, וכשמדליקים אותן הן לא מסתירות כפתורים או טקסט.
2. **רמקול על טקסט.** במסך 28 הרמקול מכסה את תיבת ההוראות הירוקה.
3. **מסך 33 בלי שם.** כשהתלמיד לא הקליד שם מופיע "next session, ?". צריך להיות "next session?".
4. **מסך 8.** חסרים החץ וההוראה "*Drag the slider to learn more".
5. **קווים מפרידים.** הקו הלבן האנכי במסכים 2 ו-4 (ואולי במסכים נוספים) לא מצויר.
6. **הבדיקה האוטומטית.** מרחיבים אותה כך שתתפוס גם רמקול וכתוביות שמכסים תוכן.

## Fixes
1. **Captions default OFF** (original playervar displayCaptions = false). The CC button turns them on. When on, the caption box must not cover interactive objects or body text: place it in a reserved strip at the bottom of the stage above the footer, or below the stage. Seen covering content: screen 28 (covers the Copywriter row and the drop boxes) and screen 29 (covers the Design process row).
2. **Speaker button must not cover content.** Screen 28: it sits on the green "*Drag a colored label…" instruction box. Give the speaker a reserved spot that the fit pass treats as an obstacle, like an image, so text and objects move or shrink away from it. Check every narrated screen (3, 5, 6, 9, 10, 12, 14, 15, 24, 25, 27, 28, 29, 33).
3. **Screen 33 with no name:** the title reads "What can you do towards the next session, ?". With an empty name, drop the comma as well: "What can you do towards the next session?".
4. **Screen 8:** the green arrow and the "*Drag the slider to learn more" hint are hidden from the start. In the original they show at start, exactly as on screen 7. Match the original timeline.
5. **Missing line shapes:** the thin white vertical divider on screen 2 (left of "Type your first name / Nice to meet you…") and on screen 4 (between "1" and the section title) is not drawn. Find why line objects from the slide data do not render, fix it in the engine, and list every screen where a line now appears.
6. **Extend `tools/test-fit.mjs`** so the speaker button and the caption box, when CC is on, count as covering objects. Add a check that no title contains ", ?" or a doubled space when the name is empty.

## Acceptance
- `npm test` passes, including the extended checks, desktop and phone.
- Before/after screenshots of screens 2, 4, 8, 28 (CC off, and CC on) and 33 in `review/p5.1/`.
- Commit "S1 P5.1: review fixes". STOP. Tell Dor in plain words what changed.
