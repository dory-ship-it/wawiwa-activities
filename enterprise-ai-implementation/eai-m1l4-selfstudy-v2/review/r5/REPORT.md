# EAI L4 R5: wide-window layout, full screen, Lesson 1 links (19 Oct 2026)

Precondition: the module was clean and in step with origin/main at `8f9d76a`. One local commit, not pushed. Nothing under `video/`, `assets/video/`, `assets/img/v1/` or `assets/img/v2/` was touched.

## 1. Wide-window layout

The stage still widens from 1280 to 1600 (720 high). What changed is how the screen uses that width.

- **Main starts at the rail and takes all the width** right of it (`64` to the stage edge; 1216 at 1280, up to 1536). The old centred 1216 column, and the photo "bleed" that worked around it, are gone (`--w-pad` is replaced by `--w-x` = the extra width, 0 to 320).
- **Logo**: photo screens (editorial, FT memos) keep the 1280 inset, 24 px from the rail. Work screens (wide, work, form, video play) put it at the h1's x: 64 px on all of them, and on S02 at the left edge of the centred form. This also changes the 1280 look on work screens: the logo moves from 24 to 64 px so it lines up with the heading.
- **Split layouts share the extra width in proportion**:
  - Editorial (S01, S14, S15, S18, S19, S22): photo and panel stay at 460 : 756. The panel text is at most 720 px wide and centred in its column (the 1280 paddings, 60 and 72, are the minimum, so 1280 looks as before).
  - FT memos (FT1 to FT4): photo, memo card and the two lower columns keep their 1280 proportions; the right edge keeps the 64 px gutter.
  - Video stops (V1, V2): still and panel stay at 486 : 730. The panel text is at most 720 px and centred; the logo sits at the panel's text edge.
- **Work screens** (sorts, explorer, tiles, pick, check, S01B, S03, S20 and the rest): the content column is main minus 64 px each side, and grids and bins stretch to it. S03's two stills stay right-aligned. The S05 swimlane diagram now lays itself out to its box width and redraws when the window is resized (before, it was drawn at a fixed 1088). The video player stays 720 wide and centred; an open transcript stretches to the gutter.
- S02's form (608 wide) and the closed-transcript video player stay centred.

### Before and after (`review/r5/before/`, `review/r5/after/`)

| Screen | 1920x950 | 1536x730 |
|---|---|---|
| S01 | `s01-1920x950.png` | `s01-1536x730.png` |
| S05 | `s05-1920x950.png` | `s05-1536x730.png` |
| S16 (one card placed) | `s16-1920x950.png` | `s16-1536x730.png` |
| S19 (workbook opened) | `s19-1920x950.png` | `s19-1536x730.png` |

The same file names sit in both folders. Before: the logo is out of line with the heading or the photo, there is an empty strip on the right (about 115 screen px at 1920), and S05's diagram stops at 1088. After: the logo is aligned, the photo screens split the width, and the work screens run gutter to gutter.

The other layouts at 1920x950 and 2560x1080 (FT1 memo, S03, S02, S21, V1 play and stop) are in `review/r5/extra/`.

Script: `node tools/shots-r5.mjs before | after | extra`.

## 2. Full-screen button

A rail button above "% done" calls the Fullscreen API on the whole page (`document.documentElement`). The maximize / minimize icon, the aria-label and aria-pressed follow the real state (`fullscreenchange`), so leaving with Escape is picked up too. It is hidden when `document.fullscreenEnabled` is false, for example in an LMS iframe without `allowfullscreen`. The tooltip sits right of the button, like the chapter dots.

## 3 and 4. Lesson 1 links

- `links.homework1` is set, so S02 shows "Open Homework 1" (new tab) after its help line.
- `links.lesson1Cases` is new. The menu footer now has two rows: "Lesson goals" and "Lesson 1 cases" (new tab), then Help and Start over. One row cannot hold four items in the 380 px panel without the labels breaking. To make room for the second row, the chapter rows went from 54 to 48 px high (still above the 44 px target).

## Text changes

| Where | Old | New |
|---|---|---|
| Rail, full-screen button (aria-label and tip) | (new, pilot copy) | Full screen |
| Rail, full-screen button while on | (new, pilot copy) | Exit full screen |
| Menu footer link | (new) | Lesson 1 cases |
| S02 button (now shown) | hidden (links.homework1 was null) | Open Homework 1 |
| links.homework1 | null | https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/eai-m1l1-home/ |
| links.lesson1Cases | (new) | https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/eai-m1l1-class/ |

## Checks

All passed on 19 Oct 2026, after the last code change.

- `npm run test:fit`: passed, 1146 ok. Load and shell at 1280x720, 1920x1080, 1024x576, 1366x650, 1536x730, 1920x950, 2560x900 and 2560x1080 (main = 64 to the stage edge). Every screen state at 1280x720, 1024x576, 1366x650, 1536x730, 1920x950 and 2560x1080, with the new checks: no empty side strip on one side only, logo aligned, nothing outside main, plus the existing band, clipping, contrast, 14 px and 44 px checks. Menu and its dialogs at the same sizes.

- `npm run check`: passed (warnings unchanged: the S01B and S02 word allowances from R4, 2 temp V2 video files).
- `npm run walk`: passed, 440 ok. New: the full-screen button (shown where allowed, Enter enters, Enter leaves, label follows), the "Lesson 1 cases" link (URL, new tab), S02's "Open Homework 1" link (URL, new tab).
- `npm run test:scorm`: passed, 344 ok. suspend_data is 1593 chars after the whole lesson and 2402 with every free-text field at 250 (limit 4096).

## Deviations and open points

1. **The logo moved on work screens at 1280 too** (24 to 64 px), because the rule is "same x as the h1" at every size. Photo and memo screens keep 24 px.
2. **Menu chapter rows are 48 px** (were 54) to fit the second footer row.
3. **The video player stays 720 px wide** on wide windows (centred); it was not enlarged.
4. Neither Lesson 1 URL was opened from here. Worth a click to confirm both pages are live.
5. At 2560x1080 the stage is capped at 1600 and the rest is letterboxed white, as before.
6. The wide check lives in `tools/lib.mjs`, so `walk` runs it too. It measures the content column (the editorial text column or the video stop panel on split screens, else main). It fails when one side's empty strip is over 72 px and the two sides differ by more than 16 px, and when the logo is out of line.
