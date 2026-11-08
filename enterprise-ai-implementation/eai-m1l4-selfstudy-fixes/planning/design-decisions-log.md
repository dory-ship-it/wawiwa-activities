# Design decisions log: EAI self-study modules (pilot)

Visual and interaction decisions with Noy's reasons. Lesson-agnostic unless marked. Newest first.
Last updated: 2026-11-05.

## FX4 fixes pass (5 Nov 2026, Dor's pilot review + Noy's notes; work order "EAI M1 L4 self-study: fixes pass")
Built in the copy `eai-m1l4-selfstudy-fixes` (the live folder untouched). Where this pass contradicts an earlier entry, this pass wins.
**Core principle: one screen, one clear task.** A first-time learner can say in 3 seconds what to do, where, and how they know they are done.

| Decision | Reason |
|---|---|
| **Next is Wawiwa turquoise (`--wl-turquoise`) with an ink label (`--wl-ink`), 6.0:1.** Replaces "red = logo and Next only": red is now the logo only. White on turquoise is 2.5:1 and fails AA, so the label is ink (the work order's "darker token or navy label" option; navy on turquoise is 3.1:1, also a fail). Locked Next stays grey with a lock. | Dor / Noy: red Next read as an alert; turquoise is the brand's action colour. |
| **A visible line beside Next.** Locked: what is still missing ("Open the 5 remaining fields.", "Place 3 more cards, then Check."). Unlocked: what comes next ("Up next: Label", or the next chapter). On the video screen it sits above Next (the player bar runs to the footer). | Dor got stuck on S19: a grey Next gave no reason. |
| **A locked Check says why beside it** ("Pick 2 first.", "Change the red ones first."). | Check never looks locked without a reason. |
| **No attempt marker.** A first wrong answer says "Not quite. One more try."; the second reveals the answer (teal + check on the option) with one plain sentence why, and Next opens. Every scored template, video stops included. | Dots and "Attempt 1 of 2" were noise; no dead ends. |
| **Hints behind a small "Hint" link**, never printed. Gone after the screen is done. | Too much text on screen. |
| **"Show me how" hidden on arrival**; it appears after 8 s idle (the demo plays) or after the first wrong answer. **None on choice screens** (single, multi, pair, rounds, cases, video stops): clicking an answer is obvious, and the hand swept over the answers. | Ghost hand only on idle, never over answers. |
| **Definitions are underlined terms with a tooltip**, not boxes (S11's three-part band, S14 "handoff", S15 "bottleneck"). | One action area; less text. |
| **Word budget: a practice screen at most 35 words, answer options not counted; presentation screens 45; feedback lines 20.** All word allowances (`wordLimit`) removed. `src/review/words.js` counts it, `npm run check` enforces it. | Dor: too much text. |
| **Right-answer feedback is one plain sentence** of at most 20 words that says why (75 lines rewritten; S08 round 3 "Don't fix" now plain). | No riddles. |
| **Drag: click a card, then click a column** works as an equal way (it existed; now the columns turn navy while a card is picked up and light up under the pointer). Drop zones larger. No "Press 1 to 4, then Enter" on screen (the keys still work). S13: no separate "Drop here" slots; each whole step is the target. | Dor could not drag reliably. Removing only the invalid S13 slots would have left two slots for two flags and given the answer away. |
| **Sorts: a tag on every checked card** saying why it belongs there; S04 has a plausible distractor ("HR staff send the answer back", a step that looks like the output); S16's cards lost the words that named their columns. | Per-card feedback; the games were too easy. |
| **Top bar**: "Chapter N of 7" and the step discs about 1.5x. | Readability. |
| **Video speed control** (1, 1.25, 1.5, 2) in the player bar, kept for the session; stops still pause at every speed. | Dor. |
| **S07 tiles open on click only** (no flip animation); an opened tile keeps its check; "3 of 8 opened". | Dor. |
| **S18A**: after a wrong Check the wrong rows are emptied (they stay red) and the strip says "Change the red ones, then Check." | Dor stuck. |
| **S19 is three screens**: S19A "What you will do now" (the workbook, why, 3 steps, one screenshot), S19B "Open the workbook" (Open, the three copy cards, the coach line; Next after Open), S19C "Did you export your PDF?" (Yes opens Next; Not yet shows the reopen link). The S17B notes card left S19B: it is not a workbook field. | 123 words, one screen, three tasks. |
| **The workbook thread from the start**: O2 says "By the end you will have your own process map, exported as a PDF."; S08B and S12B say which workbook fields they go into. S22: the PDF map is the deliverable (its own step-2 heading, Finish is the main button); the record download is "(optional)" and Finish no longer asks for it first. | Learners did not know the lesson builds toward their own map. |
| **Blossom fit**: the stage fits the part of its frame that is really visible (same-origin parents: the window and any clipping box), so Previous / Next always show. Tested in `tools/blossom-frame.html` (a top bar + iframe: normal, wider than the window, taller than the space). | Dor's S09 and S13 shots were clipped on the left. |

## Standing requirements (from Noy)
- It must look like an **e-learning module** (player, slides, characters), not "a code page an AI built".
- **Mature and innovative**, technological, not cartoonish.
- **Comfortable for ~4 hours**: light reading surfaces, no busy patterns, no ambient motion that tires the eye.
- Company colors and the **Wawiwa Design System** artifact are the source of truth.
- Text distributed by role across the stage, never one dense block. Feedback never covers content.
- Menu simple: chapters only, current one expanded.
- Images: **realistic business editorial photography** (see `planning/IMAGE STYLE.md`); people are synthetic and labelled fictional.

## Rejected (with reasons)
| Look | Where seen | Why rejected |
|---|---|---|
| P1 build as is: grey card on white, navy everywhere, letter-in-circle avatar, long menu with every screen and locked chapter | localhost after P1 | Colorless, lifeless, boring; menu overloaded; reads like a code page |
| Direction B "bright and colorful" (chapter color bands, colored tiles) | chat mockup | Less mature, less "AI" |
| Direction C "cinematic" (full-bleed office photo, glass panels) | chat mockup | Depends on photos; not chosen |
| Direction A "dark tech" full dark | chat mockup | Liked most, but a dark background for ~4 hours is tiring |
| A2 dark band + light work area with drifting grid and glow | chat mockup | Better, but the grid lines tire the eye; still "looks AI" |
| Illustrated scenes (`scene-crisis.jpg` style) | Practice Studio design samples | Noy does not want illustration |
| `hero.jpg` (people on a glowing hologram tech background) | Practice Studio design samples | Not liked; too flashy |
| Editorial v2 (white slide, photo column, lettered answer rows, quiet feedback line) | chat mockup | Direction not yet confirmed; Noy felt the chat mockups still look AI and moved design to a Design artifact |

## "Looks AI" signals to avoid
Drifting grids, glows, radial gradients, all-caps eyebrow labels with wide letter-spacing, the same radius and shadow on every block, icons in colored squares everywhere, pill chips everywhere, centered everything, emoji or unicode symbols as icons, decorative motion.

## Kept from earlier rounds (liked)
- Video in a centered player with in-video question stops marked on the timeline (V1 prototype).
- Input screen as a centered single column with labels (S02 prototype).
- Fixed feedback zone with hint before action; chosen element takes the color; Continue/Next only after a correct answer.
- Segmented progress by chapter with "Screen x of y" and minutes left.
- Storyline-like player chrome: Prev, progress, CC, volume, Next; ~~red only on Next~~ (FX4: Next is turquoise; red is the logo only).
- Wrong-answer color: #CC0000 text on a light red tint (brand rule: red #EE3124 is never an error).

## Next
Design artifact "L4 Design Board": 2 to 3 directions for S01 and S03 built from the Wawiwa Design System, a "Rejected" column with the looks above, Noy picks; then work-order P1.5 applies it.
