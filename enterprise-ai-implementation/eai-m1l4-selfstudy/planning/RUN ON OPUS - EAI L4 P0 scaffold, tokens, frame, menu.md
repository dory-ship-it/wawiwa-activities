# RUN ON OPUS: EAI L4 P0 scaffold, design tokens, frame, menu, feedback row

Written 15 Oct 2026 (planning side). Opus 5.5 builds it in Claude Code, high effort. One session.

## סיכום בעברית (לנוי)
**מה נבנה:** השלד של השיעור: עמוד 1280x720 שמתכווץ לחלון, שלושת האזורים (שורת הוראה, כרטיס במה, שורת משוב קבועה), הלוגו, פס ההתקדמות, התפריט (מפת פרקים, משאבים, עזרה, התחלה מחדש עם אישור בתוך העמוד, המשך מאיפה שעצרת) וקובץ צבעים וגופנים אחד. עדיין בלי מסכי תוכן אמיתיים: מסך דוגמה אחד בלבד.
**מה לבדוק:** שהעמוד נפתח, שהמקלדת עובדת בתפריט, ושהצבעים והגופן נראים וואוויוואיים.

## Rules for every phase (read first)
- Work only inside `enterprise-ai-implementation/eai-m1l4-selfstudy/` (plus reading the reference paths named below). Never edit GFM S1, Practice Studio or `eai-m1l4-class`.
- Read `planning/PRD.md` and `content/l4-slice.json` before you start (P0 creates `content/l4-slice.json` as a copy of `planning/content/l4-slice.json`; from then on `content/` is the live file and the planning copy stays frozen). The PRD wins over your own taste; the storyboard wording in the JSON is fixed (fidelity first). If something in the PRD is impossible, stop and say so in the report instead of improvising.
- No learner-facing text in `src/`: every string comes from the content JSON. No em dashes anywhere (code comments included). No italics.
- WCAG 2.1 AA is part of the build, not a later fix (PRD section 8).
- Run this phase only. No sub-agents. Keep the scope; list anything extra you notice under "Next" in the report.
- Commit locally at the end with the message given below, plus the attribution lines your session asks for. **Never `git push`.** Noy pushes herself. Do not commit `dist/`, `node_modules/`, `video/v1/frames/`, `video/v1/tts/` or any key.
- Then STOP and hand back the report.

## 1. Context to read first (skim)
- `planning/PRD.md` (all), `planning/content/l4-slice.json` (structure: `lesson`, `ui`, `chapters`).
- Reference build `genai-for-marketing/s1-ai-awareness/`: `index.html` (CSP, boot error), `src/main.js`, `src/store.js`, `src/engine.js` lines 1 to 60 and 180 to 230 (stage scaling), `package.json`.
- Practice Studio `engine/skins/selfstudy.css` lines 1 to 40 (token values and the contrast notes).
- Logo: `enterprise-ai-implementation/_wawiwa-logo.b64` (PNG 271x102, base64). Its history: `_apply_logo.py` header.

## 2. Scope
1. Copy `planning/content/l4-slice.json` to `content/l4-slice.json` unchanged. Folder skeleton exactly as PRD section 4 (empty template files may wait for P1 to P4; create what this phase uses).
2. `package.json` (type module; scripts `serve`, `check`, `test:fit`; devDeps `puppeteer-core`), `.gitignore` (`node_modules/`, `dist/`, `video/v1/frames/`, `video/v1/tts/`).
3. `src/tokens.css`: every token in PRD section 6, with a header comment naming the matching Practice Studio `--ss-*` variable where one exists.
4. Fonts: self-host Assistant (400, 600, 700, 800) and Roboto (400, 500) as woff2 in `assets/fonts/` from `@fontsource/assistant` and `@fontsource/roboto` (npm, then copy the latin files), declared in `src/fonts.css`. No Google Fonts link (CSP and LMS offline).
5. `assets/logo/wawiwa-logo.png`: decode the base64 unchanged. Never redraw or recolour it.
6. `index.html` + `src/main.js`: CSP like GFM S1 (`default-src 'self'`, `media-src 'self'`, no frames needed), `lang`/`dir` set from content at boot, boot error screen with the `ui.boot` strings.
7. `src/engine.js`: fixed 1280x720 stage scaled to fit (lift the GFM math), letterbox white; routing by screen id from `lesson.slice`; `?screen=` dev jump; screen lifecycle (mount, unmount); focus to the instruction heading on every screen change; resume prompt hook (state comes in P4, use a stub that reads `localStorage` in try/catch now).
8. `src/zones.js`: top bar (logo left, chapter label centre, Saved indicator and Menu button right, 4 px red progress line), instruction line (`h1`, tabindex -1), stage card (922 wide, 72%, with `top` / `middle` / `bottom` role slots), feedback row (`aria-live="polite"`, states hint / correct / wrong / neutral / pause, optional paging "1 of 2", Continue slot right). Geometry per PRD section 6.
9. `src/menu.js`: modal side panel (role dialog, aria-modal, focus trap, Escape, focus returns to Menu button): chapter map from `chapters` (done / current / "Not in this pilot" disabled), Resources (from `ui.resources`, `@links.*` resolved, new-tab note), Help (`ui.help`), Start over with an in-page confirm dialog (never `window.confirm`), using `ui.startOverConfirm` and `ui.startOverLmsNote`.
10. `src/icons.js`: inline stroke icons for every icon name used in the content JSON (list, route, forms, folder, shield, lightning, scissors, gauge, eye, history, help-circle, user-question, ruler, workbook, clock, person, check, x, info, pause, play, menu, captions, transcript). Use Lucide paths (ISC licence; note it in a comment). `aria-hidden` by default.
11. `src/tooltip.js`: dotted-underline term, focusable, hover and focus show, Escape hides, `aria-describedby`.
12. A dev-only demo screen (`?demo=1`) that shows each feedback row state and the menu, so P0 can be checked without templates. Remove nothing else later; P1 replaces the demo.
13. `tools/check.mjs` (first version): content JSON parses; every `screens[].id` in `lesson.slice` exists; no em dash (U+2014) or en dash (U+2013) in content or src; every icon name used in content exists in `icons.js`; `--w-red` CTA font-size token is at least 18.66 px bold.

## 3. Constraints
- No framework, no bundler, no CDN. ES modules only. Must run from a static server and later inside an LMS iframe.
- Red appears only on the primary CTA and the progress line. Turquoise never as text. Errors use #CC0000, never red #EE3124.
- `prefers-reduced-motion` respected from the start.

## 4. Steps
1. Read section 1. Write a 10-line plan in the chat before coding.
2. Scaffold, tokens, fonts, logo.
3. Engine, zones, menu, tooltip, icons, demo screen.
4. `tools/check.mjs`; run `npm run check`.
5. Serve (`npm run serve`), open `index.html?demo=1` with puppeteer-core and the local Chrome, take the screenshots below.
6. Update `README.md` in the lesson folder (folder table, how to preview, phase status: P0 done).
7. Commit: `EAI L4 P0: scaffold, design tokens, frame, menu, feedback row`. STOP.

## 5. Definition of done (run these yourself)
- `npm run check` passes.
- Page loads without console errors at 1280x720, 1920x1080 and 1024x640 (scaled, no scrollbars).
- Keyboard: Tab reaches Menu; menu opens, traps focus, Escape closes and returns focus; Start over opens the in-page confirm and Cancel works.
- Feedback row demo states each show icon + word + colour; contrast of every text/background pair in the token table measured by script and at least 4.5:1 (CTA label: large-text 3:1).
- No text in `src/` other than CSS/JS identifiers (grep for quoted English sentences).

## 6. Hand back to Noy
- Screenshots in `review/p0/`: `demo-hint.png`, `demo-correct.png`, `demo-wrong.png`, `demo-neutral.png`, `demo-pause.png`, `menu-open.png`, `menu-startover-confirm.png`, `scaled-1024.png`.
- A short report (max 15 lines): what was built, checks run and their results, anything in the PRD you could not follow, the contrast table, "Next" list.


## ADDENDUM (Noy, pilot requirement): progress bar and lesson navigation
This replaces the plain 4 px progress line in step 8 and extends the menu in step 9.
1. Progress bar in the top bar, visible on every screen: one segment per chapter (width proportional to the chapter's screen count), each segment filling as its screens are completed; current chapter highlighted (navy outline), completed chapters filled, future chapters empty. Next to it a text readout: "Chapter 1 of 6 · Screen 3 of 7" and "About 25 min left" (from the minutes in the content JSON). Red #EE3124 only for the fill of the current position marker; completed fill uses navy #255777.
2. Each segment is a button: hover/focus shows a tooltip with the chapter name and status; click jumps to that chapter's first screen if the chapter is completed or current. Future chapters are not clickable (aria-disabled, tooltip "Finish the current chapter first"). Fully keyboard operable, announced to screen readers ("Chapter 2, Toolkit, completed").
3. Menu panel chapter map lists every chapter with status (done / current / locked / not in this pilot), minutes, and its screens as a sub-list with a check for completed screens; completed screens are clickable to revisit.
4. Revisiting a completed screen shows the learner's earlier answer and feedback (read-only for scored items); it never re-reports to SCORM.
5. Progress and position survive reload (local mode) and LMS resume (suspend_data), within the 4,096-character limit.
Add to Definition of done: screenshots `progress-ch0.png`, `progress-ch1-mid.png`, `menu-chapter-map.png`; keyboard check of the segment buttons.
