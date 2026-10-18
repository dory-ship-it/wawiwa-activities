# Design decisions log: EAI self-study modules (pilot)

Visual and interaction decisions with Noy's reasons. Lesson-agnostic unless marked. Newest first.
Last updated: 2026-10-18.

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
- Storyline-like player chrome: Prev, progress, CC, volume, Next; red only on Next.
- Wrong-answer color: #CC0000 text on a light red tint (brand rule: red #EE3124 is never an error).

## Next
Design artifact "L4 Design Board": 2 to 3 directions for S01 and S03 built from the Wawiwa Design System, a "Rejected" column with the looks above, Noy picks; then work-order P1.5 applies it.
