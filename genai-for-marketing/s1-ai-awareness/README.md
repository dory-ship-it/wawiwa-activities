# GenAI for Marketing · Session 1 "AI Awareness" (Storyline block rebuilt as code)

The first Storyline block of the Rise course "Generative AI for Marketing Professionals", rebuilt
as an interactive page that looks the same (same photos, videos, links and design) and is maintained
from the SME's Google Slides with one click. Work-order: `RUN ON FABLE - GenAI for Marketing S1 AI
Awareness (Storyline to code).md` in this folder.

## Folder

| Path | What |
|---|---|
| `index.html` | the page (GitHub Pages serves it; it needs a web server, not `file://`) |
| `src/engine.js` | player: fixed 960×540 stage scaled like the Storyline player, PREV/NEXT, progress line, slide menu, keyboard arrows, swipe, entrance fades, the speaker control (narration pause/continue) and the text-fit scheduling |
| `src/fit.js` | text-fit pass (P4.1): after every render and every layer/state change, every text box must wrap inside the stage, stay above the footer and never sit under a picture; it clamps the box, shrinks the font 1px at a time to a 14px floor, then moves the picture down. Never hides text |
| `src/frame.css`, `src/fonts.css` | chrome styles and fonts (values read from the published block, never from content) |
| `src/screen.js` | generic screen renderer: objects, layers, timeline, animations, triggers, media and captions |
| `src/svg.js`, `src/text.js`, `src/anim.js`, `src/captions.js` | vector art straight from the original's path data, text flow with the original's metrics, entrance/exit animations, WebVTT captions |
| `src/slider.js`, `src/dragdrop.js` | the timeline sliders (screens 7–8) and the drag-and-drop (screen 28) |
| `src/screens/layout.json` | generated design spec of screens 2–33 (geometry, shape refs into the original `paths.js`, text styles, layers, timeline, triggers). Regenerate with `node tools/extract-screens.mjs` |
| `src/components/` | the cover component; `footer.js` is the one footer every screen uses |
| `assets/captions/` | the original's captions as .vtt (extracted by `tools/extract-captions.mjs`) |
| `content/s1.json` | ALL text, image refs and links, per screen. The only file the sync writes |
| `assets/fonts/` | self-hosted Lato and Open Sans, plus the exact Calibri/Open Sans/Arial subsets the original embeds (extracted by `tools/extract-fonts.mjs`) |
| `source/storyline-published/` | the published block's own files, untouched (P0) |
| `tools/fetch-assets.mjs` | downloads the published block (P0) |
| `tools/check.mjs` | build check: content schema, referenced files exist, no year in footers, "Confidential", no slide arrows left in the layout, narration ids have media |
| `tools/test-fit.mjs` | browser test (puppeteer-core + the machine's Google Chrome): opens all 33 screens, every layer, timeline stop and state at 980×620 and 375 wide; fails on clipped text or a picture over text. `--narration` checks the speaker control, `--nav` checks Prev/Next and the arrows, `--changes` lists what the fit pass changed, `--shots` takes screenshots |
| `package.json` | `npm test` = check + browser test; `npm run shots` = after-screenshots for `review/p4.1/`. `npm install` once (puppeteer-core only; no browser download) |
| `review/p4.1/` | before/after screenshots of screens 17 and 31 (Dor's P4.1 review) |
| `tools/extract-screens.mjs` | reads the Storyline slide data and writes `src/screens/layout.json` + the texts/images/media into `content/s1.json`; also applies the work-order's "newer wins" decisions for screens 13, 22 and 28 |
| `tools/dump-screen.mjs` | human-readable dump of one original slide (`node tools/dump-screen.mjs 7`) |
| `sync/apps-script/` | the Google Slides menu **Wawiwa → Send to interactive** (`Code.gs`, `appsscript.json`); setup and use in `sync/README.md` |
| `sync/deck-mapping.json` | which deck slide title(s) feed which screen; `selfStudy` flags screens 12 and 33 |
| `content/last-sync.json` | what the deck said at the last sync (per slide and text box), written by the sync |
| `../../.github/workflows/s1-check.yml` | on every PR and push touching this folder: `npm ci`, `npm run check`, then the browser test with `--narration --nav` on the runner's Chrome |
| `tools/storyline.mjs` | loads a Storyline `globalProvideData` file as JSON (used by the tools) |

## Preview locally

```bash
python3 -m http.server 8124 --directory genai-for-marketing/s1-ai-awareness
```

then open `http://localhost:8124/` (add `?screen=12` to jump to a screen).

## Phase status

- P0 assets: done.
- P1 engine and frame: done.
- P2 screens: done. All 33 screens are rebuilt from the original's data: same positions, shapes, fonts, photos, videos, audio, links, timed builds and interactions (sliders, reveals, carousel, audio hotspots, YouTube, drag-and-drop with the original answer logic, table, agenda, finale with the learner's name).
- P3 one-click sync: done (script, mapping, snapshot, build check, setup guide). Needs Dor to install the script in the deck and paste the GitHub token; the first run creates the baseline PR. See `sync/README.md`.
- P4 Rise: done on the repo side (6 Oct 2026). Live at `https://dory-ship-it.github.io/wawiwa-activities/genai-for-marketing/s1-ai-awareness/` (GitHub Pages, served from `main`). Registered as `s1-ai-awareness` (code `GFM-S1`, section "Generative AI for Marketing Professionals (GFM)") in `practices[]` of `wawiwa-video/deliverables.json`; `npm run pages` writes its embed code to the generated sheet. The row carries `embedRatio: "980:620"` (the player's own width:height, 960×540 stage + 10 px sides + 15 px top + 65 px bar), so the sheet emits a fixed-ratio padding box instead of a fixed height, and Rise shows it at the same visual size as the Storyline block at any column width. The paste into Rise (new Embed block in place of the Storyline block, Storyline block hidden, not deleted, until P5 passes) is Dor's click.
- P4.1 fixes (Dor's review, 6 Oct 2026): done. The turquoise slide arrows are gone (only screen 11 had them; the player bar's PREV/NEXT, keyboard arrows and swipe remain). The text-fit pass keeps every text wrapped, above the footer and clear of pictures on all 33 screens, with a browser test in `npm test`. A speaker control sits at the top right of the slide on the 14 narrated screens (3, 5, 6, 9, 10, 12, 14, 15, 24, 25, 27, 28, 29, 33): waves while the voice plays, pause/continue by click, Space or Enter; pausing also holds the slide's timeline so bullets keep step.
- P5 acceptance: not started.

## Decisions recorded while building

- Footer reads `© Oded Israeli, Wawiwa Tech` (no year) on every screen; the cover footer reads `© Wawiwa Tech | Confidential`.
- The learner's first-name box sits on screen 2, where the original has it ("Type your first name"), not on the cover, so the cover keeps the original look. It is stored only in the browser (localStorage, inside try/catch). Screen 33 greets by name; without a name the greeting drops it.
- The original cover has no PREV/NEXT (START only); the rebuild does the same. START plays the animated video layer, which auto-advances to screen 2 after 4.25 s or on click, as in the original.
- Slide fonts: the original embeds Calibri, Open Sans and Arial subsets as base64 in `html5/data/css/output.min.css`; they are extracted to real files and declared under their original family names, so slide text renders with the same glyphs.
- Vector art (buttons, cards, arrows, icons, gradients, shadows) is drawn from the original's `paths.js` at runtime, so shapes are identical. Text flows in CSS with the original's metrics (line height 1.2207 × size for Calibri, indents × 2/3, Arial bullets in their own colour, autofit sizes honoured).
- "Newer wins" (work-order §7): screen 12 and 33 keep the Storyline wording; screen 22's caption and screen 28's fourth label ("AEO + Do faster, more", mapped to SEO Specialist) take the deck's wording; screen 13 keeps the LLM list and adds the deck's "What can LLMs do nowadays?" list as a second column, with the screenshot moved under the LLM list to make room.
- Captions: on by default (the avatar videos are captioned), toggled with the CC button, which appears only on screens that have captioned media. Narration captions use the same bar.
- Screen 28 shows SUBMIT instead of PREV/NEXT until the answer is checked, as the original does; Continue on the feedback layer jumps to the next screen, as in the original's data. Labels can also be placed with the keyboard (Enter, arrows, Enter).
- Timed sequences (narration with bullets appearing, the cover video, the drag-and-drop demo) follow the original timeline. Media plays with sound after the learner's first click; browsers that refuse sound fall back to muted.
- The full-screen button hides itself when the host refuses full-screen (for example the Claude Code preview pane).
- Text fit (P4.1): a box whose text is taller than its declared height but has room below simply grows (the original never clipped text either); shrinking starts only when text would run past the stage, into the footer, or under a picture that paints over it, and stops at 14px, after which the picture moves down. Pictures in a layer are overlays and do not count against the base slide's text; the demo video on screen 28 covers the drag labels for 12 s by the original's design and is left alone while it shows. Text drawn over a photo by design (section titles, the table cells) is fine.
- Narration (P4.1) is read from the original slide data: the avatar videos that autoplay with captions, plus every voice track the timeline plays or that carries captions. Screen 14's poem is read after the "Generate with AI" click, so its speaker starts paused and, when clicked first, runs that same trigger. Screen 15's avatar clip is 1.4 s long ("Click me to find out more"), so its speaker shows waves only briefly. Screen 21's songs are not narration and have no speaker. The cover keeps START only (no PREV/NEXT), as in the original.
