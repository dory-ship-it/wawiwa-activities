# GenAI for Marketing · Session 1 "AI Awareness" (Storyline block rebuilt as code)

The first Storyline block of the Rise course "Generative AI for Marketing Professionals", rebuilt
as an interactive page that looks the same (same photos, videos, links and design) and is maintained
from the SME's Google Slides with one click. Work-order: `RUN ON FABLE - GenAI for Marketing S1 AI
Awareness (Storyline to code).md` in this folder.

## Folder

| Path | What |
|---|---|
| `index.html` | the page (GitHub Pages serves it; it needs a web server, not `file://`) |
| `src/engine.js` | player: fixed 960×540 stage scaled like the Storyline player, PREV/NEXT, progress line, slide menu, keyboard arrows, swipe, entrance fades |
| `src/frame.css`, `src/fonts.css` | chrome styles and fonts (values read from the published block, never from content) |
| `src/components/` | screen components; `footer.js` is the one footer every screen uses |
| `content/s1.json` | ALL text, image refs and links, per screen. The only file the sync writes |
| `assets/fonts/` | self-hosted Lato and Open Sans, plus the exact Calibri/Open Sans/Arial subsets the original embeds (extracted by `tools/extract-fonts.mjs`) |
| `source/storyline-published/` | the published block's own files, untouched (P0) |
| `tools/fetch-assets.mjs` | downloads the published block (P0) |
| `tools/check.mjs` | build check: content schema, referenced files exist, no year in footers, "Confidential" |
| `tools/storyline.mjs` | loads a Storyline `globalProvideData` file as JSON (used by the tools) |

## Preview locally

```bash
python3 -m http.server 8124 --directory genai-for-marketing/s1-ai-awareness
```

then open `http://localhost:8124/` (add `?screen=12` to jump to a screen).

## Phase status

- P0 assets: done.
- P1 engine and frame: done. Cover (screen 1) is real; screens 2–33 are placeholders carrying the shared frame (small logo, footer, title) until P2.
- P2 screens, P3 sync, P4 Rise, P5 acceptance: not started.

## Decisions recorded while building

- Footer reads `© Oded Israeli, Wawiwa Tech` (no year) on every screen; the cover footer reads `© Wawiwa Tech | Confidential`.
- The learner's first-name box sits on screen 2, where the original has it ("Type your first name"), not on the cover, so the cover keeps the original look. It is stored only in the browser (localStorage, inside try/catch). Screen 33 greets by name; without a name the greeting drops it.
- The original cover has no PREV/NEXT (START only); the rebuild does the same. START plays the animated video layer, which auto-advances to screen 2 after 4.25 s or on click, as in the original.
- Slide fonts: the original embeds Calibri, Open Sans and Arial subsets as base64 in `html5/data/css/output.min.css`; they are extracted to real files and declared under their original family names, so slide text renders with the same glyphs.
