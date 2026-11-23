# Handoff: DM M2 L2 self-study lesson (22 Nov 2026, end of day)

For the next session that works on this lesson with Noy. Read this first, then "Round 12" at the top of section 0 of `planning/REPORT-P2.md` (everything done on 22 Nov, with its tests).

## What this is
- Lesson: "Strategy and Research: Building the Plan", Digital Marketing Specialist, Module 2, Lesson 2, self-study. 50 screens, 7 chapters, about 3 hours with the workbook stops.
- Folder: `C:\Users\noyam\Desktop\Wawiwa\wawiwa-activities\digital-marketing\dm-m2l2-lesson`
- Live (GitHub Pages, from `main`): `https://dory-ship-it.github.io/wawiwa-activities/digital-marketing/dm-m2l2-lesson/` and `.../review.html`
- Local: `node tools\serve.mjs` in the background, then `http://localhost:8140/review.html` (all screens) or `http://localhost:8140/index.html?reset=1&screen=K1` (one screen). The server dies when a session ends: start it again. It serves `.mp3` as a download when opened directly: to let Noy hear audio, give her a page with an `<audio>` player, or the screen itself.
- Content is one file, `content\m2l2.json`; the look is `src\dm.css`; the DM screen templates are `src\templates\dm.js` and `dm2.js`.

## How to work with Noy
- Talk to her in Hebrew, short and plain, one question at a time. Lesson content, file names, code comments and docs stay in English.
- She wants to see and hear results, not test logs. Name the tests plainly: what passed, what failed, what was not run. Never say done before the tests ran on the current files.
- She commits and pushes herself (GitHub Desktop). Never commit, never push.
- Her principles: the context of a screen is always clear, space under headings, one focus at a time, visual before text, varied interactions, headings that say what to do.
- You cannot hear. Say so. Check audio by machine (whisper for the words, silence measurement for the pauses) and give her the audio to judge.

## Rules of the code
- Shell: Windows PowerShell 5.1. `git` is not on PATH; a read-only git is at `C:\Users\noyam\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe` (`status`, `log`, `diff` only).
- After any change under `src\` or `content\`: `node tools\stamp.mjs`, then `node tools\check.mjs`.
- Never edit `src\frame.css`, `fx8.css`, `v2.css`: override in `src\dm.css`, by layout or ground, never by screen id.
- No patching with PowerShell string tricks. Use the Edit tool, or a small node script that replaces exact strings and fails unless each matches once.
- `check.mjs` rules: hex colours only in `tokens.css`, no italics, no em or en dashes, no English sentences in `src\*.js` strings (text comes from the content), text at least 14 px, targets at least 44 px, contrast 4.5:1 (the checker reads `background-color`, not a gradient: give a dark panel a solid colour under its gradient), one key line per screen, a word budget per screen (`words.max`).
- Do not touch the workbooks `dm-m2l2-selfstudy` and `dm-m2l2-home`.
- Tests: `node tools\walk.mjs` (the whole lesson as a learner, about 4 minutes), `node tools\check-overflow.mjs [--only=S15,S17]` (over 10 minutes in full: background), `tools\test-review.mjs`, `node tools\walk.mjs --scorm` (= `test:scorm`). Do not run two of them at once, and do not change lesson files while one runs.
- `tools\test-fit.mjs` cannot pass on a computer since the live coach was wired (Round 9): every screen fails with "offline tips only (no live coach frame)", because the coach answers only from GitHub Pages. Open decision: run it with `?live=0`, or accept the offline coach locally.

## The films and the audio (the voice rule of 22 Nov)
- Rule, taken from Dor's EAI Module 5 story films: every spoken line is a full sentence a person would say (no colon lists, no clipped fragments); a calm explaining voice (ElevenLabs "Laura" `GZ4PpFJV8ikEGUtBrjK7`, `eleven_multilingual_v2`, stability 0.50, similarity 0.80, style 0.15); one take per block, no `<break>` tags, no stretched silences. On-screen text stays the slide's words; the narration may add joining words.
- Noy does not want sentence-by-sentence recording as a method. One exception she accepted: V3's four stages are one take cut at its three sentence pauses and laid 1.8 s apart.
- Film sources and READMEs (outside the repo): `Desktop\Wawiwa\Self- Study\Digital Marketing\M2L2-V1-film`, `-V2-film`, `-V3-film`, `-V4-film`. Each has `work\film` (`build_timeline.py`, `film.html`, `content.js`, `render.js`, `sound.py`). Rebuild: timeline, render three frame ranges in parallel, sound, concat and encode (see the READMEs). A long slow zoom on a still with fine lines shimmers: keep shots under about 10 s.
- End card of all four films (Noy's reference, a frame of an EAI Module 5 film): the logo in the middle, "Skilling / the World / for AI" under it, and "DIGITAL MARKETING SPECIALIST · MODULE 2 · LESSON 2" small at the bottom.
- The same small studio and founder in every film (coral t-shirt, denim apron, hair tied back; never a face to the camera). Noy: no second business, it confuses.

## State at the end of 22 Nov 2026
Last pushed commit: ac2bc43 (21 Nov). Everything below is on the computer only, not committed, about 60 changed files:
- V1 and V2: narration reworded and recorded again, new end card (1:40.5 and 1:58.6; stops moved, content updated).
- S16 is now a film, V3 (1:10.9, no stops). Noy watched round 2 and said it is good.
- New screen VK1 before K1: the V4 film (1:00.2, no stops), one dimension through the three columns. Round 2 (values joined with "or", "the first of the eight dimensions" at the start) is in; Noy has not watched round 2.
- New screen CALL before S05: a phone rings, the learner answers, the client's recorded call plays (template `call` in `dm2.js`, style `CALL1`). Voice "Eric". S05 and S06 carry the tag "From the client's call". Noy approved the look; she has not confirmed the sound.
- Podcast (S26): recorded again in the calm settings; opening and closing lines reworded. Noy has not heard it.
- Tests on the final files: `check` passed, `walk` passed, `test:scorm` passed; full `check:overflow` 489 states at three sizes, 0 problems (23 Nov, run chapter by chapter: two whole runs were cut by the machine, so prefer `--only=` batches); `test:review` passed.

## Open items
1. Noy: watch V1, V2 and V4 round 2 with sound, hear the podcast and the call; then she commits and pushes.
2. The live coach page (built in `Desktop\Wawiwa\Practice-Studio`, texts in `planning\coach-pack-for-dor.md`): no note for the new screens CALL and VK1, and its note for S16 describes the old screen. Noy has not read the coach's texts line by line.
3. Before real learners: a person verifies the commercial licence of Z-Image Turbo and Wan 2.2 (four films and the phone picture); the written record of Dor's approval for the live coach; an accessibility pass (axe, keyboard only, screen reader).
4. SCORM: `test:scorm` passed; the zip in `dist\` is from 16 Nov: `npm run package` after the push.
5. Ideas Noy liked or has open: natural stopping points for a three-hour lesson (no chapter has a `pauseMarker`), the text-heavy screens (S22 answer 169 words, S15, S17, S20, S06), a third option on the two-option questions, S38 (is it needed?), S11B heading sizes. Personal path: checked and not recommended for this lesson (too few graded answers before its middle, and no room for variants in the SME's cases).
6. Outside this lesson: the slide's speaker notes for slides 7 and 16 were not on this computer; the films use the slide text as it stands in the content.
