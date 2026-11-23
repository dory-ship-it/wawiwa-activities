# Visual direction: "Hybrid cinematic" (approved by Noy, 2026-10-21)

Copy of the Cowork Project doc `claude/L4-visual-direction.md` (the source of truth; this copy is for Claude Code).

## Modes
- STAGE: full-bleed cinematic photo, running behind the dark translucent top bar (FX1, Kit 13), with one light ivory panel holding the work. Story/decision screens with a character, warm-ups, the video and O1. O1 is the ONLY dark screen.
- FOCUS: stone ground with a "photo wash": the chapter's photo, heavily blurred under a stone veil. Key ideas, sort/label practice, input screens and the final check.
- BAND mode: dropped for the pilot.
- Each chapter gets its identity from its own photo, not from a colour.

## Surfaces and grounds
- One lesson ground: stone #F7F5F1. Panels: ivory #FBFAF7. Cards: white. Never flat white as a screen ground.
- Focus screens: chapter photo, blur(1.4cqw ~18px) saturate(.8), under a stone veil at 70%.
- Stage panel: ivory, radius ~18px, shadow 0 26px 64px rgba(0,0,0,.28). Panels hug their content and are vertically centred.

## Typography
- Assistant only for UI (800 / 600 / 400). Roboto 500 for small labels.
- Sizes at a 1280 px stage, scaling with the 16:9 stage: screen title 56/1.0 -0.14em; instruction 33; quote 37 white; answer 20 / 600; body 22 / 1.45; feedback 18.5; labels 14. Minimum 14 px.

## Motion (purposeful only)
- Screen entry: stage photo push-in, scale 1.08 -> 1 over 1.4 s, cubic-bezier(.2,.7,.2,1), once, then still; key-idea diagrams draw on over 1.2 s ease-out.
- Feedback: the strip slides up 8 px in 320 ms; the chosen answer changes state at the same time.
- No ambient or looping motion. prefers-reduced-motion: no motion, static arrow.

## Icon set
- Custom line icons, 24 grid, 1.9 stroke, round caps. Not Lucide, not Font Awesome. Paths are in the canvas HTML.
- One icon per task verb: Guess = bulb; Watch = play (filled); Learn = open book; Sort = two boxes with arrow; Label = tag; Decide = question mark; Explore = magnifier; Sketch/Write = pencil; Start = flag; Overview = map; Goals = target.

## Images
- Cinematic editorial photo, natural colour, 16:9, shallow depth of field; cool daylight plus one warm light; no logos, text, glow, or looking at camera; negative space where the panel sits (right on Stage).
- Current images are TEMPORARY stills; final images come from the media track. Keep image paths in content JSON so they can be swapped.

## Top bar (replaces the left rail; FX1: exactly as `theme-kit13-topbar.html`, Round 5 Kit 13)
- Height ~97 px (7.6cqw) on every screen but O1; padding 0 1.8cqw, gap 1.2cqw.
- Left: logo (6.6cqw) | 1 px divider (3cqw) | menu button (three 2.1cqw lines) | "Chapter N of 7" (Roboto 500 1.1cqw) above the chapter name (800 1.8cqw), line-height 1.15, min-width 12cqw.
- Right: the chapter's steps, each 5.6cqw wide: a 3.2cqw disc, the verb under it (500 1.1cqw; current 700); connectors .25cqw high, min 1.4cqw, 1.55cqw from the top.
- FOCUS screens: the light bar, rgba(247,245,241,.97), 1 px #E2DED6 bottom line, divider #D5CFC4, ink menu and name, "Chapter N of 7" #55626C. Done: navy disc, white check, navy connector. Current: white disc, turquoise ring .3cqw plus halo .7cqw rgba(90,179,170,.25), teal-ink icon, bold ink label. Next: white disc, 1 px #CFC8BB, icon #6A7680, connector #D5CFC4.
- STAGE screens: the photo runs BEHIND the bar (it starts at the top of the stage); the bar is dark translucent over it, rgba(12,28,40,.42) with a 14 px backdrop blur, no bottom line; divider rgba(255,255,255,.25); white menu, white name, "Chapter N of 7" and labels rgba(255,255,255,.82), the current label white. Done: white disc with an ink check, white connector. Current: as on Focus. Next: translucent white disc rgba(255,255,255,.12), 1 px rgba(255,255,255,.4), icon rgba(255,255,255,.75), connector rgba(255,255,255,.3).
- No progress line. (FX1 replaces "the photo starts below the bar" and "no Chapter X of 7".)
- Steps per chapter: Intro = Start, Overview, Goals, Decide, Write. Why map = Guess, Watch, Learn, Decide. Toolkit = Guess, Learn, Sort, Learn, Label, Decide, Explore, Decide, Sketch. (Steps come from content JSON.)

## Side menu
- Scrim, then panel: logo, close, lesson title, the 7 chapters with status only (done check / current numbered ring / next numbered outline). No resources, no times, no step lists.

## Key idea (K1)
- Focus mode: pill "Key idea" with book icon (teal ink on #E1EFEE), title, one line.
- Two large figure cards on white with an arrow between them: "Without mapping" grey #7D8A94 / #4A5862; "With mapping" teal ink. Navy, teal and grey only.
- Evidence line plus source at the bottom. Next never locked.

## Warm-up (W1)
- Stage mode. The question sits on the photo: large white text on a dark glass card, bulb icon, "Warm-up", turquoise "Not scored" chip.
- The panel holds only "Make your best guess." plus three answers. Selection = navy outline and dot (no right/wrong colours). Neutral strip only after choosing.

## Critical details per template
Shell
- Previous: white, border #CFC8BB. Next: red #EE3124; locked = #8A98A2 with lock icon. Footer bottom-left and bottom-right only.
- Logo is the red tag, unchanged, >= 120 px wide on O1.
Decision (S01, Stage)
- Character quote on the photo, bottom-left: dark glass rgba(10,22,32,.62), blur 10 px, turquoise quote marks, quote 800 white, name and "Fictional character" below.
- Panel: context line, the instruction as heading, answers as white bordered cards with a number or radio.
- Feedback = a strip flush to the panel's bottom edges (negative margins), 3 px top rule and a leading icon. It must NEVER look like an answer.
- Correct: bg #DCEEEC, rule #3E868F, head #1E4E55. Wrong: bg #FBEAEA, rule and icon #CC0000, head #A30000. Neutral: bg #E7E4DD, rule #8A98A2.
- Chosen answer: correct = teal border plus filled check; wrong = #CC0000 border plus filled X.
Sort (S04, Focus, Rise-style) — used from Chapter 2 on
- Instruction = heading on the left; same row right: "Show me" (white, 2 px navy border, hand icon + label).
- ONE card at a time, centred, from a deck (two offset cards behind). Card = grip + text. "1 of 5" under the deck. Three dashed drop columns: title + subtitle only, no counters.
- Correct drop: card stays in its column with a check. Wrong drop: card returns to the deck + feedback.
- Ghost hand: first use only, 2-3 s, grabs the card and drags DOWN, stopping above the columns (never reveals an answer). Stops on any input. "Show me" replays it.
- Keyboard: Tab to card, keys 1-3 choose a column, Enter drops, Esc cancels; announce each step.
O1 opening (only dark screen)
- Photo under veil rgba(8,20,30,.58). Logo top-left. Program · Module · Lesson line #9FD3CD. Title 800 white. Quote with a turquoise quote mark. Red "Start the lesson" button with arrow.
All templates
- <= 45 words on screen, feedback <= 25. Text >= 14 px, targets >= 44 px, WCAG 2.1 AA.
- State never shown by colour alone (check, X, ring, word). All text in content JSON.

## Tokens (CSS variables; px at a 1280 stage)
```css
--wl-stone: #F7F5F1;            /* lesson ground, top bar, focus veil base */
--wl-ivory: #FBFAF7;            /* stage panels, side menu */
--wl-white: #FFFFFF;            /* cards, answer cards, idle step discs */
--wl-ink: #16293A;              /* headings, primary text */
--wl-text-2: #33414B;           /* body copy */
--wl-muted: #55626C;            /* labels, step labels, counters */
--wl-line: #E2DED6;             /* card and panel borders, bar bottom line */
--wl-line-strong: #CFC8BB;      /* idle step discs, Previous border */
--wl-dash: #B9B2A5;             /* drop-zone dashed border */
--wl-navy: #255777;             /* done steps, selection, Show me, menu */
--wl-turquoise: #5AB3AA;        /* current-step ring, quote marks, Not scored on dark */
--wl-teal: #3E868F;             /* correct border and check */
--wl-teal-ink: #2F6A72;         /* correct text, current-step icon, key-idea pill */
--wl-correct-bg: #DCEEEC;       /* correct feedback strip */
--wl-correct-head: #1E4E55;     /* correct verdict text */
--wl-error: #CC0000;            /* wrong border, icon, strip rule */
--wl-error-bg: #FBEAEA;         /* wrong strip */
--wl-error-head: #A30000;       /* wrong verdict text */
--wl-neutral-bg: #E7E4DD;       /* neutral / warm-up strip */
--wl-neutral-line: #8A98A2;     /* neutral rule, locked Next */
--wl-red: #EE3124;              /* logo and Next only */
--wl-keypill-bg: #E1EFEE;       /* Key idea pill */
--wl-chip-bg: #CFE6E4;          /* Not scored chip on light */
--wl-quote-glass: rgba(10,22,32,.62);    /* quote and warm-up question card; backdrop blur 10px */
--wl-wash-veil: rgba(247,245,241,.70);   /* focus photo wash over a blurred photo */
--wl-o1-veil: rgba(8,20,30,.58);         /* O1 only */
--wl-panel-shadow: 0 26px 64px rgba(0,0,0,.28);
--wl-card-shadow: 0 15px 31px rgba(15,42,61,.14);
--wl-radius-card: 10px; --wl-radius-panel: 18px; --wl-radius-btn: 9px;
--wl-bar-h: 97px; --wl-step-d: 44px;     /* 44px to meet the touch-target rule */
--wl-font-ui: "Assistant", Arial, sans-serif; --wl-font-label: "Roboto", Arial, sans-serif;
--wl-ease-enter: cubic-bezier(.2,.7,.2,1); --wl-dur-push: 1.4s; --wl-dur-draw: 1.2s; --wl-dur-fb: 320ms;
```
