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
