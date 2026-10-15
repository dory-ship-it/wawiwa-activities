# RUN ON OPUS: EAI L4 P2 V1 video production

Written 15 Oct 2026 (planning side). Opus 5.5, high effort. **Two sessions:** Part A (setup, script, two concept stills, then STOP for Noy's pick) and Part B (build the chosen design, render, voice, VTT, cue file). Independent of P1; needs P0 committed.

## סיכום בעברית (לנוי)
**מה נבנה:** הסרטון V1 "Two cases, same lesson" (כ-2:40 קריינות): אנימציה בקוד בצבעי וואוויווה, בלי מוזיקה, רק מילות מפתח ומספרים על המסך, קול קריינות Kokoro (af_heart) כמו בסרטוני ה-self-study שלך, קובץ כתוביות VTT וקובץ נקודות עצירה לשתי השאלות.
**חלק A:** מכינים את הכלים, כותבים את התסריט לפי הסטוריבורד, ומציגים לך שתי תמונות סטילס של שני כיווני עיצוב. **את בוחרת**, ורק אז חלק B מרנדר את הסרטון.
**מה לבדוק בסוף:** להאזין להגייה (Claude לא שומע), לבדוק שהמספרים נכונים ו-"per reports" מופיע ליד כל נתון.

## Rules for every phase (read first)
- Work only inside `enterprise-ai-implementation/eai-m1l4-selfstudy/` (plus reading the reference paths named below). Never edit GFM S1, Practice Studio or `eai-m1l4-class`.
- Read `planning/PRD.md` and `content/l4-slice.json` before you start (P0 creates `content/l4-slice.json` as a copy of `planning/content/l4-slice.json`; from then on `content/` is the live file and the planning copy stays frozen). The PRD wins over your own taste; the storyboard wording in the JSON is fixed (fidelity first). If something in the PRD is impossible, stop and say so in the report instead of improvising.
- No learner-facing text in `src/`: every string comes from the content JSON. No em dashes anywhere (code comments included). No italics.
- WCAG 2.1 AA is part of the build, not a later fix (PRD section 8).
- Run this phase only. No sub-agents. Keep the scope; list anything extra you notice under "Next" in the report.
- Commit locally at the end with the message given below, plus the attribution lines your session asks for. **Never `git push`.** Noy pushes herself. Do not commit `dist/`, `node_modules/`, `video/v1/frames/`, `video/v1/tts/` or any key.
- Then STOP and hand back the report.

## 1. Context to read first
- `planning/PRD.md` sections 6 (Video style) and 5 (cue file). `content/l4-slice.json` screen V1: `production.segments` (narration verbatim, on-screen keywords, build notes, `stopAfter`), `stops`, `production.sayOverrides`.
- Wawiwa's film route (from the watch-it-happen-film skill), summarised here so you do not need the skill: an HTML scene `film.html` reads `window.FILM` (from `film.json`) and defines `window.renderAt(t)` that draws the full frame for time t, deterministic (no timers, no network, no randomness unless seeded). A renderer screenshots every frame at 25 fps; a Python step makes the voice with Kokoro-82M (`kokoro-onnx`, voice `af_heart`, speed 1.0, lang `en-us`, lead 0.15 s per caption), checks each line fits its caption slot (speech + 0.2 s at most the slot), normalises loudness (`loudnorm=I=-16:TP=-1.5:LRA=11`), muxes MP4 (libx264, yuv420p, AAC 160k, `+faststart`) and writes the VTT. Captions carry `text` (shown) and `say` (spoken). One idea per caption, no burned-in captions. Brand end card: Wawiwa logo centred, tagline "Skilling / the World / for AI", red bar 200x8 #EE3124 (scale to 1280), footer "ENTERPRISE AI IMPLEMENTATION SPECIALIST · M1 L4 · SELF-STUDY"; it starts about 0.3 s after the last spoken word and holds 4 s with a slow push-in; no narration on it.
- **Deviations from that route for this film (decided):** no music bed and no sound effects (principle V6: narration only). Render 1280x720 (the player shows it at about 920 px wide; smaller SCORM zip). Use `puppeteer-core` with the machine's Chrome (as `tools/test-fit.mjs` does) instead of Playwright, so nothing downloads a browser. Logo: `assets/logo/wawiwa-logo.png` (from P0), shown small top right (108 px wide, 30 px from top, 72 px from right) from the end of the title card.

## 2. Scope
**Part A (session 1)**
1. Preflight script `video/v1/preflight.mjs`: checks Node 18+, Chrome path, Python 3.10+, `ffmpeg -version`, `python -c "import kokoro_onnx, soundfile, numpy"`. If anything is missing, print the exact Windows install commands (for example `winget install Gyan.FFmpeg`, `py -m pip install kokoro-onnx soundfile numpy`) and STOP the phase there with the report. Do not install system software yourself without Noy's yes.
2. `video/v1/film.json`: `id: "v1"`, `fps: 25`, `size: [1280, 720]`, captions split from the 8 segments, one idea per caption (about 25 to 30 captions), `text` verbatim from the storyboard narration (only fix: none needed; keep "doesn't", "It's"), `say` with `sayOverrides` applied where needed. Timing: title card 0 to 4.0 s ("Two cases, same lesson", navy, Assistant 800); narration slots at about 2.5 words per second; after the last caption of segment 3 and of segment 6 add a 1.2 s visual hold (the frame the learner will see frozen at the stop) and record `stops: [{id:"stop1", t}, {id:"stop2", t}]` at hold start + 0.4 s; `brandEnd.at`; `duration = brandEnd.at + 4.0`.
3. Two visual directions, both in the Wawiwa brand (white ground, navy shapes and type, turquoise lines, teal for "fixed", one red number per segment; Assistant; flat shapes, icons, counters; elements draw on and grey out, nothing swaps; no photos, no robot heads, "AI" chip and person icon). Suggested, adapt freely: (1) "process as a conveyor" (boxes on a line that a "faster tech" bolt speeds up, later pulled apart and rebuilt); (2) "two timelines" (1980s lane and 2024 to 2025 lane building in parallel, meeting in segment 8). Render ONE still per direction at the busiest moment (segment 5 counters) as `review/p2/concept-1.png` and `concept-2.png`.
4. STOP. Report and ask Noy to pick 1 or 2 (or mix). Commit `EAI L4 P2A: V1 script, film.json, concept stills`.

**Part B (session 2, after Noy's pick, she pastes "Direction: <n> <notes>")**
5. `video/v1/film.html`: the chosen design, all text and timings from `film.json`. Every on-screen keyword list in `segments[].onScreen` appears in its segment; "per reports" stays on screen with every hedged figure (segments 4 and 5); "for learning, not proof people should be replaced" readable for at least 3 s. Keywords at least 32 px, numbers at least 56 px, contrast 4.5:1. Keep the top-right logo corner clear.
6. `video/v1/render.mjs` (`preview <t,t,t>` and `full`), `video/v1/make.py` (voice, timing check, loudnorm, mux, VTT; no bed, no effects). Write outputs to `assets/video/`: `v1.mp4`, `v1.en.vtt`, `v1-poster.jpg` (title card frame), and `v1.cues.json` in the PRD schema, with stop and segment times taken from the actual caption placement, never from the storyboard labels.
7. Preview 4 frames (title, busiest, stop1 hold, brand end) to `review/p2/`, fix, then render full.
8. Commit `EAI L4 P2B: V1 rendered (MP4, VTT, cues)`. STOP.

## 3. Constraints
- Narration text is the storyboard's, verbatim. Do not add claims or numbers. If a `say` change is needed for pronunciation, change `say` only.
- No music, no effects, no stock images, no drawn product UI, no real company logos or names beyond what the narration says (no company is named in the narration; do not name it on screen).
- Deterministic `renderAt(t)`. No em dashes. Wawiwa logo unchanged.
- MP4 target under 15 MB (`-crf 23`); if larger, raise crf to 25 before anything else.
- Frames and TTS models stay out of git (`video/v1/frames/`, `video/v1/tts/`).

## 4. Definition of done (run these yourself)
- Part A: preflight passes (or the phase stopped with install commands); `film.json` validates (captions contiguous, no overlap, every narration word of the 8 segments present exactly once, checked by script); two stills exist.
- Part B: `make.py` reports no timing problems; `ffprobe` shows H.264 1280x720 25 fps + AAC; duration within 2:40 to 3:05; VTT parses with the `parseVTT` you will reuse in P3; `v1.cues.json` has stop1 and stop2 with stop1 < stop2 < duration and both inside their hold; the frame at each stop time is the hold frame (screenshot both to `review/p2/stop1.png`, `stop2.png`).

## 5. Hand back to Noy
- Part A: `review/p2/concept-1.png`, `concept-2.png`; report with the caption count, planned duration, and the question "Which direction?"
- Part B: `review/p2/` previews and stop frames; the MP4 path; a report with duration, file size, stop times, and the request: **listen to the whole video for pronunciation** (Claude cannot hear it) and list any word to fix; reminder that storyboard SME items 4 (fintech "conversations") and 5 (HBR title) must be cleared before release.


## Report file (required)
Also save the final report as `review/p2/REPORT.md` (same text you print), together with the screenshots, before you commit. The planning model reads it from there.
