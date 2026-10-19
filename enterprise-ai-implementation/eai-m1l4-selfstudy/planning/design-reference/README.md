# Design reference: approved look (Claude Design, Rounds 2 and 3)

Source canvas: "EAI M1L4 Process Mapping: 4 directions" https://claude.ai/artifact/W8D9MwN44UDo2dZQZZXRrX
Decision log: Cowork Project doc `claude/design-decisions-log.md` (Approved look, 2026-10-18).

These are the exported artboard sources (1280x720, inline styles). Read them for layout, sizes, colors, type and states. They are design files, not module code: they use absolute positioning and a design runtime (`support.js`, `<x-dc>`), so rebuild them in the module's own templates; do not copy the markup as is.

| File | Use as reference for |
|---|---|
| R2A-decision-editorial.html | Decision / story screens (default): photo column left, large quote, numbered hairline answer rows |
| R2B-decision-desk-memo.html | Alternative Decision layout: photo + memo card, three tall answer cards |
| R2D-work-select-two.html | Work screens; **the feedback band pattern for every screen** |
| R2-menu-open.html | Chapters menu (opens from the rail) |
| R3-video-play.html | Video screen: guiding question, player with stop markers, CC, volume, transcript |
| R3-video-stop.html | In-video question stop: paused frame left, question and feedback right |

Images: `/_blob/...` URLs in the files do not resolve here. `ref-team-meeting.jpg` and `ref-video-case-1.jpg` are the board's images, **style references only**. Every screen gets its own new image (see `planning/IMAGE STYLE.md`). The logo is in `assets/logo/`.

## Round 4 (approved by Noy, 2026-10-19): Intro and Chapter 1, storyboard v3

| File | Use as reference for |
|---|---|
| R4-O1-title.html | O1 lesson title screen (template "title"): text column left, full-height photo right, no header or footer |
| R4-O2-module.html | O2 "Where we are" (template "moduleMap"): five stations on a line, L4 open; the ghost hand drawn on L5 |
| R4-O3-goals.html | O3 lesson goals (template "goals"): deliverable box, five icon tiles, tooltip on goal 5 |
| R4-W1-warmup.html | W1 warm-up (template "warmup"): navy side panel, neutral "Your guess" state, no right/wrong colours |
| R4-K1-key-idea.html | K1 key idea (template "concept"): light blue-grey stage, two figure cards built in HTML/CSS |

Round 4 images: `/_blob/646f9fd3edb9fe9fcb18c6472fe519ab` is `assets/img/ft3.jpg` (O1 photo); `/_blob/b16ce2f524cebca874501d9731444899` is the Wawiwa logo.
