# Design reference: L4 screens, Intro + Chapters 1-2 ("Hybrid cinematic")

Approved by Noy on 2026-10-21. This folder is the visual source of truth for the build. Copied from the Cowork Project by the foreman chat.

| File | What it is |
|---|---|
| `screens-intro-ch2.html` | The approved canvas (artifact "L4 Screens Intro–Ch2", https://claude.ai/artifact/ASeHfsjrVHjdAZhHaTf7pC). 43 frames. Intro: O1, O2 (3 incl. side menu), O3, S01 (3), S02 (4). Ch1: W1 (2), V1 (5), K1, S03 (3). Ch2: W2, K2 (2), S04 (3), S05a, S05b (3), S06 (3), S07 (4), S08 (3), S08B (2). `screens-intro-ch1.html` is superseded. Every frame is a `.scr` 16:9 stage built in `cqw` units (1 cqw = 12.8 px at 1280). |
| `img/` | Temporary stills used by the canvas (to be replaced in the media track) + the logo. |
| `page.css` | The `.scr` frame CSS and the motion keyframes (push-in, draw-on, feedback slide). |

The full spec (modes, tokens, critical details per template): Project doc `claude/L4-visual-direction.md`, copied into the work-order.

Notes
- The canvas loads Assistant/Roboto from Google Fonts. For side-by-side shots render it with the module's own self-hosted fonts (`src/fonts.css`), or the comparison is not valid.
- The canvas was generated from a small component library (`parts.py`, kept in the Cowork Project under `claude/screens-code/`): top step bar, footer, answer card states, feedback strips, quote glass, panel, side menu, Show me, ghost hand, photo wash. Every value it produces is inline in `screens-intro-ch2.html`, so the HTML alone is enough; build one engine component per repeated part.
- Values are in `cqw` on purpose: the stage scales with the window. Keep `cqw` (or the same ratio) in the engine.
- Known fix applied in the design chat: panels hug their content and are vertically centred (no large empty area at the bottom).
