# 07 UX Layout Spec: EAI Module 1, Lesson 4 self-study (Process Mapping)

Role: UI/UX designer. Inputs: 02_storyboard_ch0-2.md, 03_storyboard_ch3.md, 04_storyboard_ch4-6.md, 05_video_scripts.md, 06_practice_studio_spec.md (Part 0 flags only), brief.md, principles.md.
This file adds no content facts. Every on-screen string is the storyboard's; where this spec cuts or reshapes a string, it says so and why. Hex values, pixel sizes, icon names and component names are design decisions, not source facts.

Reading guide:
- Part A: the reusable visual system (canvas, zones, anti-wall rules, spacing, type, color roles, radius, states, icons, components, menu, video player, Handoff pattern, keyboard, aria-live, narrow screens).
- Part B: one layout spec per screen, in module order (S01, S02, V1, S03 to S08, V2, S09 to S22).
- Part C: rule matrix (screen rules 1 to 12 plus the two gulfs) for every screen.
- Part D: cuts, splits and open decisions for Noy and the SME.

---

# Part A. Reusable visual system

## A1. Canvas and the three fixed zones

Design size: 1280 x 720 (16:9). The whole canvas scales as one unit to its container (browser window or Rise iframe), scale factor = min(container width / 1280, container height / 720). Below a scale of 0.8 the compact layout applies; below 600 px container width the stacked layout applies (A13).

| Band | y from to (px) | Height | Content |
|---|---|---|---|
| Top bar (chrome) | 0 to 44 | 44 | Menu button, Back button, chapter progress, Saved indicator |
| Instruction zone (rule 2, zone 1) | 44 to 108 | 64 | One verb-first instruction line, centered, one line only |
| Stage card (rule 2, zone 2) | 108 to 628 | 520 | The one centered stage card, x 179 to 1101 (922 px = 72% of width) |
| Gap | 628 to 640 | 12 | Empty |
| Feedback row (rule 2, zone 3) | 640 to 704 | 64 | Status icon, feedback text (max 25 words), Continue button. Same x range as the card |
| Bottom margin | 704 to 720 | 16 | Empty |

The video player uses the same card frame (rule 1: same width as the video player), so the learner's eye never relocates between template types.

### Stage card inner grid
- Padding 32 on all sides (24 in the video player). Inner content box: 858 x 456.
- Vertical three-zone layout ("T/M/B"): Top 96, gap 16, Middle 264, gap 16, Bottom 64.
- Horizontal split layouts ("L/R"): 40/60 = 336 + 24 gutter + 498; 50/50 = 417 + 24 + 417; 60/40 = 498 + 24 + 336.
- 12-column grid inside the content box, column 50, gutter 24 (for grids of 2, 3, 4 options).
- A screen may combine one L/R split inside the Middle zone with a Top and Bottom band, but never more than three bands of content.

## A2. Anti-wall rules (how this spec makes "text in one area" impossible)

These are build rules. A screen that breaks any of them is returned to the writer, not squeezed by the developer.

- Z1. Every screen uses at least two content zones of the card (two of T/M/B, or both sides of an L/R split). One zone always carries the visual element.
- Z2. No single text element exceeds 16 words. Longer content is split into separate containers (two bubbles, two rows, chips).
- Z3. No zone holds more than 25 words, except a set of four or more separate option or card containers, each in its own bordered box.
- Z4. Each zone has one role only: context (top or left), decision (middle or right), status or action (bottom).
- Z5. Theory never appears as body text. It lives in feedback, tooltips or the reference card (rule 3, rule 10).
- Z6. The visual element (diagram, big number, timeline, chip set, map, template row, field tiles) occupies at least 30% of the content box area on every screen. On Input screens the form object itself is the visual.
- Z7. Text is never longer than 2 lines at body size (about 120 characters at 18 px over 498 px). Option labels are max 2 lines.
- Z8. Minimum 16 px between zones, 12 px between sibling containers. No container touches another.
- Z9. Headers and single-line strings are centered. Multi-line strings inside stacked full-width options are left-aligned next to their icon (easier for non-native readers); multi-line strings inside grid tiles under 300 px wide are centered.

### Unified word count convention (fixes an inconsistency)
02 counted words without the instruction line; 03 and 04 counted with it; 02 S07 excluded tile numbers while 04 S21 counted them. This spec recounts every screen with one rule:
- Count: the instruction line plus every word on the stage card in its fullest state, including button labels and labels on visuals.
- Do not count: learner-typed text, number badges inside a shape (field numbers, step numbers), progress dots, character counters ("0/250"), icon-only controls (they carry an aria-label), top bar chrome, the feedback row (max 25 separately).
Recounts that change a verdict are listed per screen and in Part D.

## A3. Spacing scale (4 px base)

| Token | px | Use |
|---|---|---|
| space-1 | 4 | Icon to badge, inside chips |
| space-2 | 8 | Icon to label inside a button |
| space-3 | 12 | Between sibling containers (options, cards, chips) |
| space-4 | 16 | Between zones; option inner padding (vertical) |
| space-5 | 24 | Option inner padding (horizontal); grid gutter; video card padding |
| space-6 | 32 | Stage card padding |
| space-7 | 48 | Hero visual margins (big number, diagram) |
| space-8 | 64 | Reserved (pre-play poster, score state) |

## A4. Type scale (design size 1280; scales with canvas, clamped minimums in compact and stacked layouts)

| Role | Size / line height | Weight | Min CSS px when scaled | Notes |
|---|---|---|---|---|
| Instruction line | 24 / 32 | 600 | 20 | One line, max 12 words, sentence case, no full stop needed |
| Card header / situation | 20 / 28 | 500 | 18 | Max 16 words per element |
| Body (context lines, panel content) | 18 / 26 | 400 | 16 | Max 2 lines |
| Option label | 18 / 24 | 500 | 16 | Max 2 lines; same size in every option of a set |
| Feedback row text | 17 / 24 | 400 | 16 | Max 25 words, max 2 lines; status prefix in 600 weight |
| Chip, tag, column label, counter | 14 / 20 | 500 | 14 | Never below 14; no all caps (readability) |
| Big number (hero) | 64 / 72 | 700 | 44 | Numerals only plus one unit or symbol |
| Tooltip | 15 / 22 | 400 | 14 | Max 20 words |
| Video captions | 20 / 28 (at 832 frame) | 500 | 16 | Max 2 lines, see A10 |

Font: a sans serif with clear figures and an unambiguous I/l/1 (placeholder Inter or Open Sans). FLAG: use Wawiwa's brand font if one is defined; not in sources. No letter-spacing tricks, no all caps, no italics for emphasis (use 600 weight).

## A5. Colors as roles (placeholders validated for WCAG 2.1 AA; swap for Wawiwa brand values if defined, keep the ratios)

| Role | Token | Hex | Use | Contrast check |
|---|---|---|---|---|
| Ink | ink | #1F2433 | All primary text | about 15:1 on white |
| Ink muted | ink-muted | #535B6E | Secondary text, default icons, dimmed option text | about 6.8:1 on white, 6.2:1 on page |
| Page | surface-page | #F4F5F8 | Canvas background outside the card | n/a |
| Card | surface-card | #FFFFFF | Stage card, options default fill | n/a |
| Interactive border | border-ui | #8A92A6 | Borders of every clickable element | about 3.1:1 on white (WCAG 1.4.11) |
| Divider | border-quiet | #D5D9E2 | Non-interactive dividers only | decorative |
| Accent | accent | #3347C8 | Current focus, hover border, selected state, primary button, focus ring, "chosen, no right answer" state | about 7.3:1 white on accent |
| Accent tint | accent-tint | #EEF0FD | Hover and selected fill | n/a |
| Success | success | #1D7A45 | Correct text and icon | about 5.4:1 on white, 4.8:1 on tint |
| Success border | success-line | #2E9B5C | Correct border, solid 2 px | about 3.5:1 |
| Success tint | success-tint | #E7F5EC | Correct fill | n/a |
| Warning (amber) | warning | #8A4B00 | Wrong / needs attention text and icon | about 6.8:1 on white, 6.3:1 on tint |
| Warning border | warning-line | #B77900 | Wrong border, dashed 2 px | about 3.7:1 |
| Warning tint | warning-tint | #FFF3DC | Wrong fill | n/a |
| Neutral dim fill | dim-fill | #F2F3F6 | Unchosen options after a choice | text on it: ink-muted 5.0:1 or better |
| Disabled | disabled | #E8EBF0 fill, #6B7285 text | Disabled Continue, locked tiles | exempt, still about 4:1 |

Rules:
- No red anywhere. A wrong answer is amber (rule 3, "slips are never punished").
- Color is never the only signal: correct = solid border + circle-check badge + "Correct." prefix; wrong = dashed border + alert-triangle badge + "Not this one." prefix; selected = accent border + check-square badge.
- Dimming is done with color tokens, never with opacity (opacity drops text below 4.5:1).
- Inside videos: one accent for "current focus", grey for "already shown" (05 production notes); use the same accent hex for brand continuity between player and screens.

## A6. Shape, radius, elevation, motion

- Stage card radius 16, shadow 0 2 8 rgba(31,36,51,0.08). Option, tile, sort card radius 12. Chips and tags radius 999 (pill). Buttons radius 10. Template row radius 8.
- Touch and click targets min 44 x 44 css px at any scale.
- Motion: state changes 200 ms ease-out; card slides between steps 300 ms; sort card snap 250 ms; tile flip 300 ms. Nothing auto-advances. With prefers-reduced-motion: all slides and flips become a 100 ms crossfade, pulses become a static ring.

## A7. Interaction states (global, every interactive element)

| State | Fill | Border | Text | Icon | Badge (top-right, 20 px) | ARIA |
|---|---|---|---|---|---|---|
| Default | surface-card | 1 px border-ui | ink | ink-muted, 24 px | none | role button |
| Hover | accent-tint | 2 px accent | ink | accent | none | n/a |
| Focus-visible | unchanged | plus 3 px accent outline, 2 px offset (white inner ring on accent fills) | ink | unchanged | none | n/a |
| Selected (pending, multi-select, sort card picked up, chosen in no-right-answer items) | accent-tint | 2 px accent | ink, 600 | accent | check-square | aria-pressed="true" |
| Correct | success-tint | 2 px solid success-line | ink | success | circle-check | aria-describedby feedback row |
| Wrong | warning-tint | 2 px dashed warning-line | ink | warning | alert-triangle | aria-describedby feedback row |
| Dimmed (siblings after a choice, still available for retry) | dim-fill | 1 px border-ui | ink-muted | ink-muted | none | still focusable |
| Done-locked (siblings after the correct answer) | dim-fill | 1 px border-quiet | ink-muted | ink-muted | none | aria-disabled="true", removed from tab order |
| Disabled (Continue before action, Check before enough picks) | disabled | none | disabled text | n/a | none | aria-disabled="true", stays focusable, tooltip on focus and hover: "Answer first" or "Pick two first" |
| Locked (content not yet unlocked) | disabled | 1 px dashed border-ui | disabled text | lock | none | aria-disabled="true" plus aria-label naming the unlock condition |
| Opened / visited (Explorer) | surface-card | 1 px ink-muted | ink | ink | check (small) | aria-label adds "opened" |

Behavior rules (rule 3, rule 4):
- Single-choice Decision: one click selects and submits (no Check button). The chosen element takes green or amber, siblings go Dimmed. A wrong option stays amber so the learner does not re-pick it by accident, but remains clickable (re-click repeats its feedback). After the correct option, siblings go Done-locked and Continue enables.
- Multi-select (S03, S21 item 5): Selected state until Check; then green and amber per selected element.
- No-right-answer items (S20 step 2, S22 step 1): chosen element takes Selected (accent), never green, so the learner does not read it as "right". Feedback row uses the info style.
- Continue is the only way forward. It sits in the feedback row on every screen.

## A8. Icon system (Tabler Icons, outline, stroke 1.75)

Sizes: 24 px in options and chips, 32 px in headers and columns, 48 px in hero visuals. Icons are ink-muted by default, accent on hover or selected. Every icon on a clickable element has a text label next to it or an aria-label; icons on visuals carry an aria-label or are described by the visual's label.
Name check: verify every name against the Tabler set version used in the build; a fallback is given where a name is less common.

### Reserved status icons (never used as element icons)
circle-check (correct) · alert-triangle (wrong / needs attention) · info-circle (hint) · check-square (selected) · check (opened) · lock (locked).

### Cross-screen dictionary (one meaning, one icon; H4)

| Concept | Icon | Used on |
|---|---|---|
| Trigger / start | bell-ringing | S04 column, S07 tile 2, S12 tile 2, S13 Start half, S21 tile 2 |
| Steps | stairs | S04 column, S07/S12/S21 tile 3, S22 field card |
| Output / end | flag | S04 column, S13 End half |
| Field 1 Process name | heading | Field tiles |
| Field 4 Handoffs | arrows-exchange | Field tiles, S14 diagram, S22 field card |
| Field 5 Sources, owners, sensitivity | database | Field tiles, S09 header, S22 field card |
| Field 6 Existing controls | eye-check | Field tiles, S10 row |
| Field 7 Gaps | zoom-question | Field tiles, S10 row, S19 step 2, S22 step 1 card |
| Field 8 Success metric | gauge | Field tiles, S11 row, S19 step 3, S22 field card |
| Document / policy source | file-text | S09 Source column, S17 case card |
| Owner (a person who keeps something current) | user-check | S09 Owner column |
| Sensitivity tag | tag | S09 Sensitivity column only |
| Employee | user | S05 lane, S14, S20 row 1 |
| HR staff | id-badge-2 | S05 lane, S14 |
| HR manager | user-star | S05 lane, S14 |
| Absent receiver | user-off | S14 |
| Chat channel / email / in person | message-circle / mail / walk | S01 after-state, S04 cards |
| AI as the subject of the content | robot / robot-off | S08 option, S16 columns, S21 item 5 badge |
| Data safety | shield-lock | S02, S18, S19 |
| Automating | settings-automation | S15 option c, S17 bin 5, S20 chip 5 |
| Time | clock | S19 time chip, S20 row 2 |
| Date / 3-month check | calendar | S11 check strip, S22 homework |
| Workbook | notebook | S19, S20 link |
| External link | external-link | Open workbook button |
| Download | download | S22 |
| Saved | device-floppy | Top bar |
| Menu | menu-2 | Top bar |
| Back | arrow-left | Top bar |
| Continue | arrow-right | Feedback row |
| Video play / resume | player-play | Player, stop resume button |
| Captions / transcript | badge-cc / align-left | Player controls |

### Icon rule against cueing (A6 "no tricks", assessment validity)
- An option's icon describes the option's object, never its correctness.
- The robot icon appears only where AI is the subject (S08 rule names, S16 columns, S21 item 5 badge). Where an AI option is a distractor in a Decision (S10, S14, S21 items 1 to 4), it gets the object icon (for example route), so "robot = wrong" cannot be learned as a pattern.
- In S21 (scored), options carry letter badges A to D instead of icons; the stem keeps one scenario icon. Reason: S14 and S21 item 1 share concepts, and a shared icon on the key would let a learner answer by recognition of a picture, not of the concept. This is a deviation from "one icon per element" for scored options only; Noy to approve (Part D).
- A field icon never sits on an option that answers that field's question (example: the Field 7 icon is on the Field 7 row in S10, not on option "Unclear").

## A9. Reusable components

| Component | Anatomy | Used on |
|---|---|---|
| Option button | Icon left (24) + label (18/24), min height 56, full or grid width | Decisions |
| Speech bubble | Role icon + role label above; bubble max 16 words; a second bubble below if needed (chat thread, left aligned, 8 px stagger) | S01, S15 |
| Template row | Field number badge + field icon + field name (14) on the left 30%; value slot on the right 70% (empty slot = 1 px dashed border-ui, "drop target" look) | S08, S10, S11 |
| Field tile | Number badge, field icon (32), short field name; back face for meaning (max 16 words); opened check badge | S07, S12, S21 item 5, reference card |
| Sort board | Columns (icon 32 + label + live count) and a tray; card = icon + label; placed cards stack as chips in their column | S04, S09, S16, S17, S22 step 2 |
| Stepper | Step dots top-right of the card (filled = done, ring = current); card slides left on step change; instruction line updates | S06, S08, S10, S17, S18, S20, S21, S22 |
| Hotspot diagram | Inline SVG, every hotspot a focusable button with a visible label and a 2 px dashed accent ring on hover or focus | S05 |
| Big number | 64 px numeral, 14 px label below, optional bar | S15, S21 score state |
| Feedback row | Status icon (24) + prefix + text + Continue button (160 x 44) right-aligned | Every screen |

### Feedback row anatomy and states
- Layout: left 24 px icon, 12 px gap, text block (max width 650, 2 lines), right Continue (primary, arrow-right icon after the label).
- States: Hint (before action): info-circle, ink-muted text, prefix "Hint." · Correct: circle-check, success color for the prefix only, prefix "Correct." · Wrong: alert-triangle, warning color for the prefix only, prefix "Not this one." · Info (no right answer, saves, handoff): info-circle, ink, prefix "Noted." or "Saved." as the storyboard string already gives.
- Prefixes are status words, not praise. Feedback body text stays in ink for contrast.
- Paging: when one action produces two feedback strings (S03, S21 item 5), the row shows "1 of 2" with previous/next icon buttons (chevron-left / chevron-right) at the text block's right; each page max 25 words.
- Inline confirm: confirms ("Finish without downloading?", "Start over?") appear in the feedback row or the menu panel with two buttons, never as a modal over the stage card.
- The row never grows, never overlays the card, and is always present (rule 3).

## A10. Video player with cue markers (V1, V2)

Frame: the stage card (922 x 520), padding 24 horizontal, 2 top. Video frame 832 x 468 (16:9) centered at the top of the card; controls bar 48 px below the frame inside the card. Controls are never overlaid on the picture.

### States
1. Pre-play (guiding question, V3): Top zone: guiding question at 20/28 with bulb icon, centered. Middle: poster frame (first frame of the film, 50% tinted) at 560 x 315 with a 72 px circular play button centered on it. Bottom: meta chips "2:36", "2 questions", "Captions on" (V1) or "3:54", "3 questions", "Captions on" (V2). Instruction line: "Watch, and answer the questions on the way." (8 words). Feedback row hint: "The video stops for a question about every minute." Continue disabled ("Finish the video first").
2. Playing: frame plus controls. The instruction line stays "Watch, and answer the questions on the way."; the guiding question is shown only in the pre-play and end states, so nothing competes with the film while it plays (M-Coherence).
3. Stop (V2 rule: freeze, answer, resume only after correct): the frame shrinks to the left 40% of the card (336 x 189, the frozen still) and the question panel takes the right 60%: question text at the top (20/28, max 16 words), three option buttons stacked. The still stays visible so the learner can reason from the picture (M-SpatialContiguity). Nothing overlays the picture. Controls bar: play disabled, tooltip "Answer to continue". Instruction line changes to "Answer to continue the video." (5 words). Feedback row: hint "Choose one. The video continues after the right answer." After the correct option, the Continue button relabels to "Resume video" with player-play icon. Pressing it restores the full frame and plays.
4. End: the frame shows its last held frame; below it, the bridge tag already in the film. Guiding question returns in the top zone over the still (closing the loop V3). Controls: Replay (rotate icon). Feedback row: Continue enabled, label "Continue".

### Production request to the motion designer
- For each stop, export a "stop still" cropped to the region the question is about (V1 stop 1: the 500 / 100 columns and the 5x bracket; V1 stop 2: the two request lanes; V2 stop 1: slot 2 plus the three example icons; V2 stop 2: the gateway diamond and lanes; V2 stop 3: the three step boxes after the magnifier pass). A full-frame still at 336 px wide would make the 14 px keywords unreadable.
- Keep the bottom 15% of the frame free of keywords (caption safe area).
- Same accent hex as the module (A5).

### Controls bar (left to right)
Play/pause (player-play / player-pause) · Back 10 s (rewind-backward-10) · scrubber with cue markers · elapsed / total time · Speed (0.75, 1, 1.25; H7, non-native listeners) · Captions (badge-cc, on by default) · Transcript (align-left).

### Scrubber and cue markers
- Cue marker = 12 px diamond on the scrubber at each stop time (V1 0:56, 2:04; V2 0:59, 2:01, 3:02).
- Marker states: upcoming = outline border-ui; current (playhead within 5 s or the active stop) = accent fill; answered = success fill with a white check.
- First viewing: seeking forward is limited to the furthest point watched; a stop cannot be skipped. After the video ends once, free seeking. Seeking back is always allowed.
- Scrubber is a slider: aria-valuetext "1 minute 2 seconds of 2 minutes 36 seconds. Question 1 answered."

### Captions and transcript
- WebVTT, full narration (05), 2 lines max, 20 px at full frame, white on rgba(0,0,0,0.75) band, inside the caption safe area.
- Transcript button pauses the video and splits the card: frame shrinks to the left 60%, transcript list on the right 40% with timestamps; scrolling is allowed inside this panel only. Close returns to full frame.

### Keyboard (active only while focus is inside the player, WCAG 2.1.4)
Space or K: play/pause · Left / Right on scrubber: minus or plus 5 s (forward capped as above) · C: captions · Tab order: play, back 10, scrubber, speed, captions, transcript; in a stop: options 1 to 3, then Resume video.

## A11. Menu, top bar and resume (rule 11)

### Top bar (44 px, chrome, not counted in words)
- Left: Menu (menu-2 + "Menu"), Back (arrow-left + "Back", returns to the previous screen with its state kept; H3).
- Center: chapter progress: 7 segments (Ch0 to Ch6), current segment accent with the chapter name ("Ch3 HR demo") in 14 px; done segments ink-muted with check; future segments border only.
- Right: Saved indicator: "Saved" with device-floppy (ink-muted); "Saving" (no spinner, text only); "Not saved" in warning with alert-triangle and a "Retry" text button when the LMS commit fails. aria-live polite only for "Not saved" (avoid noise).

### Menu panel (opens from the left, 360 px, modal, focus trapped, Esc closes, focus returns to the Menu button)
1. Chapter map: 7 chapters, screens listed under the current chapter. Visited screens are links; unvisited future screens show the lock state with aria-label "Locked until you reach it".
2. Reference card: opens in the stage card area as "Reference view" (the current screen's state is kept). Tabs inside the card: Eight fields (field tiles) · AS-IS rules · Five mistakes · HR map (the S12 worked example) · Outcomes (the five learning outcomes, per 02 plan change 6). Instruction line reads "Use the reference, then go back." Feedback row Continue relabels "Back to screen".
3. Resources: V1 transcript, V2 transcript, the workbook link (same as S19), the HR worked map, a glossary of every tooltip.
4. Help: how to choose, how to sort with the keyboard, captions and speed, what Saved means. One short line per topic with its icon.
5. Start over: inline confirm inside the panel: "Erase your answers in this lesson and start again? Your workbook is not affected." Buttons "Cancel" (default focus) / "Start over".
6. Resume: on relaunch with saved progress, the first state is a resume card in the stage card: "Pick up where you stopped?" with the screen name and two buttons "Resume" (primary, default focus) / "Start from the beginning". This keeps the first decision within one click (rule 7).

## A12. Handoff screen pattern (template, used by S19)

Three states on one screen, same card layout so the learner's place is visibly kept.
1. Brief state. Top zone: tool name with notebook icon (left), time chip with clock icon (right). Middle zone L/R 40/60: left "What" (the deliverable, one line, with its icon); right the steps as a numbered list (max 4 steps, max 6 words each, one icon each). Bottom zone: data-safety line with shield-lock (left), primary button "Open workbook" with external-link icon (right).
2. Opened state (after the click): opens in a new tab (target _blank, rel noopener). The card keeps the brief, the primary button becomes secondary "Reopen workbook", and a new primary "I'm back" appears. Feedback row (info): "The workbook is open in a new tab. This module keeps your place."
3. Return checkpoint: when the learner presses "I'm back" (or returns to the tab: visibilitychange makes "I'm back" the focused default, it does not auto-advance), the middle zone swaps to the return content: a PDF export reminder and the next step; Continue enables. The next screen (S20) is the self-check.
Saved state: the Handoff state persists in suspend_data, so a relaunch lands on the Opened or Return state, never the Brief again.

## A13. Narrow screens and smaller windows (global)

| Layout | When | What changes |
|---|---|---|
| Full | scale at least 0.8 and landscape | Design as specified, scaled |
| Compact | scale below 0.8, or container 768 to 1023 px wide | Stage card 92% width; type clamps to the A4 minimums; card padding 24; L/R splits kept if card is at least 640 px wide, else they stack; rows of 4 or 5 become 2 rows |
| Stacked | container below 600 px wide or portrait phone | Top bar shrinks to Menu, progress (dots), Saved icon. Instruction line wraps to max 2 lines. Card full width minus 16 px gutters. L/R becomes top/bottom in reading order (context first). Every grid becomes one column. Feedback row is pinned to the bottom of the viewport, up to 3 lines, Continue full width below the text. |

FLAG (no-scroll rule): the brief requires no scroll on a fixed 16:9 canvas. In the stacked layout, S09, S12, S16, S17, S21 item 5 and S22 step 2 cannot fit a phone portrait viewport without vertical scrolling. Proposal: show a one-line banner "Turn your phone sideways for the best fit" (dismissible), and allow scrolling inside the stage card only, in the stacked layout only; instruction line and feedback row stay fixed. Noy to decide.

Touch: tooltips open on tap and close on tap outside; no hover-only information; drag is never required.

## A14. Global keyboard behavior and focus order (rule 12)

- On screen load, focus moves to the instruction line (h1, tabindex -1) so it is announced first.
- Tab order on every screen: Menu, Back (top bar) → stage card in reading order (top zone, then middle, then bottom; left before right) → feedback row text paging buttons (if any) → Continue. Visual order and DOM order always match (WCAG 2.4.3).
- Enter or Space activates any option, tile, chip, hotspot, column.
- Grids (2x2, 2x4, five bins, tray) also support arrow keys with a roving tabindex, so one Tab enters the group and arrows move inside it.
- After a correct answer, siblings become Done-locked and leave the tab order, so the next Tab from the chosen element lands on Continue.
- Sort (all sort boards): Tab to a tray card, Enter selects it (Selected state, card lifts 4 px) → columns' accessible names become "Place [card] in [column]" → Tab or arrows to a column, Enter places it. Esc cancels a selection. After a placement, focus moves to the next unplaced tray card. A wrong placement returns the card to the tray with its amber edge and focus on it. Mouse: click card, click column; drag and drop is an extra, never the only way.
- Tooltip terms: each dotted-underline term is a button with aria-describedby; it opens on hover and on focus, stays open while hovered or focused, closes on Esc (WCAG 1.4.13).
- Esc also closes the menu and the transcript panel.

## A15. aria-live conventions

- Feedback row: role="status", aria-live="polite", aria-atomic="true". Announced text = prefix + body, exactly as shown. The initial hint is not announced on load (it is read when the learner reaches the row); every later change is.
- Selection announcements (sort, multi-select) go to the same row region as short status strings: "[card] selected. Choose a column." / "2 of 2 selected. Press Check."
- Counters (Explorer opened count, free-text characters) announce at thresholds only: Explorer on every open ("Field 3 opened. 3 of 8."); text fields at 200, 240 and 250 characters ("50 characters left", "10 characters left", "Limit reached").
- Step changes: the new instruction line receives focus and is announced; the live row announces the new hint.
- Saved indicator: announces only "Not saved. Retry." (assertive is not used anywhere).

## A16. Tooltips (rule 10)

Dotted underline 1.5 px in ink-muted under the term, on its first occurrence per screen; the term keeps a tooltip on later occurrences without the underline. Tooltip: white card, 1 px border-ui, radius 8, max width 280, 15/22, max 20 words, arrow pointing at the term, placed above the term unless it would cover the instruction line, then below. A tooltip may sit over the card briefly (learner-invoked) but never over the feedback row or the Continue button.

---

# Part B. Screen-by-screen layout specs

Each spec lists only what is specific to the screen; everything else follows Part A. "Words" uses the unified count (A2).

## Chapter 0: Entry

### S01 · Decision · "Choose your first move."

- Words: storyboard 44 excluding instruction; unified 47. Over the 45 limit. Fix: cut the last question in the quote from "Can it be live next month?" to "Live next month?" → 44. Also split the 24-word quote into two bubbles (Z2).
- Zones (T/M/B):
  - Top (96): role row centered: user icon (32) + "Dana, HR director" (14/20, ink-muted). FL1 open: if Noy drops the persona, label becomes "HR director".
  - Middle (264): chat thread, centered column 600 px wide: bubble 1 "About 90 requests a month, most of them repeat questions." (10); bubble 2, 8 px below, "Just put a chatbot on the HR inbox. Live next month?" (11). 20/28.
  - Bottom (64 plus 40 borrowed from middle, total about 104): three option buttons in a row, 3 x 270 px, icon above label (stacked layout inside each button so labels stay one or two lines).
- Visual element: the speech-bubble thread. Why: a person asking is the real-world trigger of the lesson (H2, M-Personalization) and the first click lands in 1 action (rule 7).
- After-correct visual (no extra words): under bubble 2, three channel icons (message-circle, mail, walk) draw in and feed one tangled line into an inbox icon. aria-label: "Requests arrive by chat, email and in person, with no organized system." Echoes V2 segment 1.
- Icons: A "Shortlist three chatbot vendors" list-details · B "Map how a request flows today" map-2 · C "Survey employees on what they want" forms.
- States: global single-choice. Wrong A or C: amber, dimmed siblings, retry.
- Keyboard and focus: h1 → A → B → C → Continue (disabled until B). Arrow keys move among A to C.
- aria-live: on choice, "Correct." or "Not this one." + the option's feedback string from 02.
- Narrow: compact keeps the row; stacked puts options in one column, icon left of label.
- Rule check: R5 fixed by the cut; all others pass. Gulf of execution: three big buttons and the hint "Pick one. You can change your mind." answer "what do I do". Gulf of evaluation: color + badge + one consequence line.

### S02 · Input · "Bring your case from Homework 1."

- Words: unified 45 (instruction 6 + 38 + "Save"). At the limit; no further text may be added.
- Zones (T/M/B):
  - Top: folder icon (32) + purpose line "This is the case you will map in Chapter 5." centered.
  - Middle: the "case card" object: an index-card styled container (white, 1 px border-ui, a folder tab on its top-left edge, no tab text). Inside: field 1 "Case title" single-line input; field 2 "The problem today" 3-line textarea. Placeholders in ink-muted. Counter "0/250" right-aligned under each field (14 px).
  - Bottom: left shield-lock + "Leave out names and identifying details." Right: "Save" (primary).
- Visual element: the case card itself. Why: this exact object returns in S18 (grey reference strip) and on the lesson record, so learners recognize it later (H6, N-ConceptualModel).
- Change vs storyboard: Save is always enabled (02 had "disabled until both fields have text" plus an amber message for empty fields; both cannot happen). On Save with an empty field: amber message from 02, the empty field gets a dashed warning border and receives focus (H9, WCAG 3.3.1). A disabled Save with no reason leaves a gulf of execution.
- States: field default (1 px border-ui), focus (2 px accent), filled, error (dashed warning-line + alert-triangle at the field's right). Counter turns warning color at 230 characters; input stops at 250.
- Keyboard: h1 → Case title → The problem today → Save → Continue (enabled after a successful save).
- aria-live: "Saved. Your case comes back in Chapter 5, where you map it in eight fields." / amber string; counter thresholds per A15. Each field has aria-describedby pointing to its counter and the safety line.
- Narrow: stacked: fields full width; safety line above Save; Save full width.
- Rule check: pass. R4: Continue only after Save. Gulf of execution: two labelled fields with examples. Gulf of evaluation: Saved message plus the top-bar Saved indicator.

## Chapter 1: Why map

### V1 · Video player · "Two cases, same lesson" (title per FL5 / VF1)

- Words: pre-play state 8 (instruction) + 15 (guiding question) + 5 (meta chips) = 28. Stop 1: 5 + 15 + 22 = 42. Stop 2: 5 + 10 + 25 = 40. All pass.
- Layout: A10 player. Pre-play guiding question: "What separates a technology change that works from one that has to be fixed later?"
- Visual element: the film itself (build-up motion graphics, V7). At stops: the cropped stop still (left 40%).
- Stop 1 (0:56): still = 500 vs 100 person columns with the 5x bracket. Options stacked, object icons: A "A faster system for its current payment checks" bolt · B "Where the 500 people's working time actually goes" clock · C "The official payment procedure, as written" file-certificate.
- Stop 2 (2:04): still = the two request lanes (simple / complex). Options: A "Routine and judgment cases got the same path" arrows-split · B "The AI agent answered too slowly to keep up" clock · C "Simple requests were handled worse than by people" user. (No robot on B: object is speed, and the cue rule applies.)
- Cue markers at 0:56 and 2:04. Note VF9: stop 1 at 0:56 is 4 s before the 60 s minimum; accepted in 05.
- Keyboard: A10. aria-live on stop: "Question 1 of 2. [question]" then option feedback per A15; after the correct answer, "Correct. [feedback]. Press Resume video."
- Narrow: stacked: frame full width; at a stop, the still sits above the question and options.
- Rule check: R5 pass at stops; R8: S02 (input) then V1 (interactive stops) then S03 (decision): no two read-only screens. Gulf of execution: big play button and the guiding question. Gulf of evaluation: cue marker turns green, video resumes.

### S03 · Decision (select two) · "Select the two causes this lesson solves."

- Words: unified 34. Pass.
- Zones (T/M/B):
  - Top: history icon (Lesson 1 recall; 02 had a warning icon, which is reserved for status) + context line "Lesson 1 named four causes of AI project failure. Both video cases hit at least one." (16 words, one element at the Z2 limit; if the SME removes the second sentence per 02's note, 9 words).
  - Middle: 2 x 2 grid of cause cards (417 x 120 each), icon top-left, label 18/24.
  - Bottom: left "0 of 2" selection counter (badge style, not counted); right "Check" (secondary until 2 selected, then primary).
- Visual element: the four-cause chip grid. Why: it shows the whole Lesson 1 model at once, so the learner recognizes rather than recalls (H6).
- Icons: "Unclear problem" question-mark · "Unmapped process" map-off · "Unidentified end user" user-question · "No success metric" gauge-off (fallback gauge with a slash badge; verify name).
- States: cards are toggle buttons (Selected = accent + check-square). A third click on a new card while two are selected does nothing and announces "Two already selected. Unselect one first." (N-Constraint). After Check: each selected card green or amber; correct cards lock; amber cards unselect on next click.
- Feedback paging: two selected cards produce two strings; wrong pairs can exceed 25 words (for example A + D = 32). The row shows them as "1 of 2" pages (A9), each under 25.
- Keyboard: h1 → grid (one tab stop, arrows inside) → Check → paging buttons → Continue.
- aria-live: on select "Unmapped process selected. 1 of 2." On Check: "1 of 2. Correct. [B feedback]" etc.
- Narrow: grid becomes one column in stacked mode.
- Rule check: pass with paging. Gulf of execution: counter "0 of 2" plus disabled Check tooltip "Pick two first". Gulf of evaluation: per-card color and paged feedback.

## Chapter 2: Toolkit

### S04 · Sort · "Sort each HR case card into its building block."

- Words: unified 45 in the worst state (all chips placed). Pass at the limit. Change: drop the visible "1 of 5" counter (02) and use progress dots, otherwise 48.
- Zones (T/M/B):
  - Top: current card centered (320 x 64), with two offset card edges behind it showing the remaining deck; five progress dots under it.
  - Middle and bottom combined (344): three columns left to right, 270 px each, joined by two chevron arrows between their headers (process order). Each header: icon (32) + label + count. Placed cards collapse into 40 px chips stacked inside the column.
- Visual element: the three-column process chain (Trigger → Steps → Output). Why: the column order mirrors the process order, so position carries meaning (N-Mapping).
- Icons: columns Trigger bell-ringing, Steps stairs, Output flag. Cards: 1 "An employee sends a question by email" mail · 2 "HR staff check the topic of the question" search · 3 "A question arrives in person" walk · 4 "HR staff answer or escalate to the manager" arrows-split · 5 "The employee receives an answer" message-check.
- Interaction: only one card is shown, so it is pre-selected; the learner only picks a column (one action per card). Wrong placement: card shakes 4 px once (reduced motion: no shake), amber edge, stays on top for retry.
- Keyboard: h1 → columns (arrows inside) → Continue. The current card is announced on arrival: "Card 2 of 5: HR staff check the topic of the question. Choose a column."
- aria-live: "Placed in Steps. Correct." / "Not this one. [column-specific feedback]".
- Narrow: stacked: card on top, columns become three column buttons in one row of compact chips (icon + label + count), placed chips listed under the buttons.
- Rule check: pass. Gulf of execution: one card, three targets, nothing else to do. Gulf of evaluation: the chip lands in the column (spatial result) plus feedback.

### S05 · Explorer · "Click where the path splits." then "Open the other two parts."

- Words: unified max 38. Pass.
- Zones (T/M/B):
  - Top (folded into the diagram frame): "Illustrative, built from the HR case" tag top-right (14 px, pill, ink-muted). FL14.
  - Middle (360, borrowed from top): the swimlane diagram, full width: three lanes 100 px each with lane labels at the left edge (user, id-badge-2, user-star icons + labels); start event circle "Question sent" in Employee lane; step box "Check the topic" in HR staff; gateway diamond "Exceeds known policy?"; path to "Answer" (HR staff) and down to "Escalate" (HR manager).
  - Bottom (64): three legend chips "Swimlanes" / "Gateway" / "Event" (locked until the gateway is found, except as labels); the reveal text (5 to 9 words) appears to the right of the opened chip, in the same row.
- Visual element: the diagram. Why: recognition-level BPMN only (s12), and the shape is the content (M-SpatialContiguity: the definition opens next to its own chip and the matching shape highlights).
- Icons: chips Swimlanes layout-rows · Gateway arrows-split · Event circle-dot. The diagram uses shapes, not icons, except lane role icons.
- Hotspots: three lanes, start circle, step box, gateway. Default: shape plus a faint dashed ring; on load one 1.2 s pulse on all rings (reduced motion: static ring) to show they are clickable (N-Discoverability). Hover/focus: 2 px dashed accent ring + label tooltip. Correct (gateway): diamond fills success-tint with solid border. Wrong: that shape gets an amber dashed ring; feedback in the row.
- Phase 2: after the gateway, the two remaining chips unlock. Opening a chip highlights its shapes in the diagram (lanes or start circle) with accent outline and shows the reveal text. Continue enables when all three chips show "opened".
- Keyboard: h1 → diagram group (one tab stop, arrows move across the six hotspots in reading order: lanes top to bottom, then start, step, gateway) → chips → Continue.
- aria-live: "Correct. The path splits here..." / "Not this one. ..." / "Swimlanes opened. Who does what. Each role in its own lane."
- Narrow: diagram scales to full width (min 340 px); shape labels replaced by number badges with a numbered key below the diagram; chips stack under the key.
- Rule check: pass. Gulf of execution: pulse plus the instruction verb "Click". Gulf of evaluation: the diamond turns green; chips track progress.

### S06 · Decision (two situations) · "Pick the right format for each situation."

- Words: unified 38. Pass.
- Zones (L/R 50/50, each side T/B):
  - Left: Situation 1 card: role icon user (32) top, situation text (12 words) middle, two option buttons side by side at the bottom.
  - Right: Situation 2 card: icon users-group, text (11 words), two option buttons. Locked until the left is correct: shown at Locked state with a lock badge and aria-label "Situation 2, unlocks after Situation 1".
- Visual element: the side-by-side pair of situation cards. Why: the comparison itself is the lesson (field template vs BPMN depends on context); left-to-right order maps to the sequence (N-Mapping).
- Icons: options "Field template" list-details, "BPMN diagram" sitemap (same icons on both sides, H4).
- States: single-choice per side.
- Keyboard: h1 → left options → right options (skipped while locked; focus moves to the first right option automatically after the left is correct, with announcement) → Continue.
- aria-live: per option feedback; on unlock "Situation 2 unlocked."
- Narrow: stacked: Situation 1 above Situation 2.
- Instruction note: the hint "Answer the left card first." reads oddly in stacked mode; use "Answer the first situation first." in stacked mode only, or "Start with Situation 1." for both (writer to choose).
- Rule check: pass. Gulfs closed by the lock state and per-side feedback.

### S07 · Explorer · "Open all eight fields, then find the testable one."

- Words: storyboard 40 excluding instruction; unified 49, and 59 with one tile flipped (back text replaces a shorter title). Over the limit. Fix: cut the top line "Same spirit as the five-field template from Lesson 1, now for a whole process." (14) and move it to a tooltip on "eight fields" in the instruction line (it is context, not task). Result: max 45 (instruction 9 + titles 20 + flip delta 10 + challenge question 6).
- Second change: drop the separate challenge bar with eight number buttons; the tiles themselves become the answer buttons (as in S12), so one object is used for one concept (H4) and the bottom zone carries only the question.
- Zones (T/M/B):
  - Top: freed by the cut; holds nothing but the progress text "0 of 8 opened" in the feedback row hint (not on the card). The 2 x 4 grid starts at the top zone.
  - Middle (376, top + middle): 2 x 4 grid of field tiles, 200 x 172 each: number badge, field icon, title (14 to 18 px, max 2 lines). Click flips the tile in place to its back (meaning, max 14 words). One tile flipped at a time.
  - Bottom (64): locked strip "Which field can you test later?" with lock icon until 8 of 8; then it unlocks and the tiles switch to answer mode (accent outline pulse once).
- Visual element: the eight field tiles. Why: the same tile set returns in V2's right panel, S12, S21 item 5 and the reference card; seeing all eight at once builds the template as one object (H6, M-Segmenting by flipping one at a time).
- Icons: 1 heading · 2 bell-ringing · 3 stairs · 4 arrows-exchange · 5 database · 6 eye-check · 7 zoom-question · 8 gauge.
- States: tile default, hover, flipped (back face accent-tint), opened (check badge, stays after flipping back), answer mode (tiles become single-choice options with green/amber).
- Keyboard: h1 → grid (one tab stop, arrows) → bottom strip (not focusable while locked; its lock is announced) → Continue. Enter flips; Enter on another tile flips the previous one back.
- aria-live: "Field 3 opened. 3 of 8. The path from trigger to result, and who exactly does each step." At 8: "All eight opened. Question unlocked: Which field can you test later? Choose a tile."
- Narrow: compact: 2 x 4 stays; stacked: 2 columns x 4 rows, tiles 156 px tall.
- Rule check: R5 fixed by the cut. R1 strong (grid). Gulf of execution: tiles show a flip affordance (small rotate-clockwise corner glyph, aria-hidden) and the hint. Gulf of evaluation: check badges and the opened count.

### S08 · Decision (3 rounds) · "Find which AS-IS rule this draft line breaks."

- Words: storyboard 40 excluding instruction; unified 48 plus the visible round counter. Over. Fix: shorten the reminder strip from "AS-IS = as it happens now, in practice, on a normal day." (12) to "AS-IS: a normal day, in practice." (7), keep the full definition in the AS-IS tooltip in the instruction line; replace the "1 of 3" text with stepper dots. Result: 8 + 7 + 14 + 14 = 43.
- Zones (T/M/B):
  - Top: the draft line as a template row (field number badge + field icon + field name on the left 30%, the draft text on the right 70%, 18/26). Stepper dots top-right of the card.
  - Middle: three rule buttons in a row (3 x 270), icon above label.
  - Bottom: reminder strip, centered pill: eye icon ("what you actually see") + "AS-IS: a normal day, in practice."
- Visual element: the template row. Why: it looks like a line from the learner's own future workbook, so the critique is practiced on the real artifact (ID3, H2).
- Icons: rules A "Don't fix while mapping" tool · B "Don't add AI while mapping" robot (AI is the subject here) · C "Don't map the official process" file-certificate. Row icons per round: Field 3 stairs, Field 2 bell-ringing, Field 4 arrows-exchange.
- States: single choice per round; correct → card slides to the next round; the three rule buttons stay in place (same position every round; key varies B, C, A).
- Keyboard: h1 → rule buttons (arrows) → Continue (relabelled "Next round" in rounds 1 and 2; "Continue" after round 3).
- aria-live: per option feedback; on round change "Round 2 of 3. Field 2: questions arrive by email only, as the written HR procedure requires."
- Narrow: stacked: row on top (field name above the text), buttons in one column.
- Rule check: R5 fixed. Gulfs: the same three buttons each round lower the execution load; per-round feedback closes evaluation.

## Chapter 3: HR demo

### V2 · Video player · "Mapping the HR case"

- Words: pre-play 8 + guiding question 16 ("How do you turn 90 messy requests a month into a map you can test later?") + chips 5 = 29. Stops: 36, 38, 37. All pass.
- Layout: A10. The film's own layout (left 60% map, right 40% eight-field panel) must use the same field icons and tile look as S07/S12 (A8 dictionary) so the panel in the film and the tiles on screen are visibly the same object.
- Stop 1 (0:59) still: slot 2 plus the three example icons. Options: A "HR staff check the topic of each request" search · B "A chatbot receives every employee question" message-chatbot (object icon; the content is a chatbot) · C "An employee asks by WhatsApp, email, or in person" message-circle.
  - Cue note: B uses message-chatbot, C uses message-circle; similar shapes, neither signals correctness. Accept.
- Stop 2 (2:01) still: the gateway diamond and three lanes. Options: A "HR staff to HR manager, when policy is exceeded" user-star · B "HR staff check the topic of each request" search · C "HR manager keeps the four policies current" file-text. The Field 4 icon (arrows-exchange) is deliberately not used on the key (A8 cue rule).
- Stop 3 (3:02) still: the three step boxes after the magnifier pass. Options: A "A manager review before answers go out" user-star · B "No formal control: the staffer's own judgment" brain · C "Nothing yet: leave Field 6 empty for now" square.
- Overlap flag (VF8): Stop 3 and S10 step 1 ask the same Field 6 decision about one minute apart with near-identical options. See S10 for the layout fix.
- Cue markers 0:59, 2:01, 3:02. VF6: add a small "Illustrative" tag in the frame's top-right corner (outside the caption safe area).
- Keyboard, aria-live, narrow: as V1.
- Rule check: pass. Gulfs: as V1.

### S09 · Sort · "Sort each card into its part of Field 5."

- Words: unified 34 (header uses "Field 5" badge plus "sources, owners, sensitivity"). Pass.
- Zones (T/M/B):
  - Top (56): header template-row style: badge 5 + database icon + "Field 5: sources, owners, sensitivity".
  - Middle (200): four columns, 200 px each with 12 px gaps: Source file-text · Owner user-check · Sensitivity tag · Not Field 5 square-x. Each column holds up to two 40 px chips.
  - Bottom (168, middle and bottom joined): tray of six cards in 2 rows of 3 (270 x 64). 03 asked for one row of six; at 858 px each card would be 133 px wide and "Chatbot answers policy questions" would wrap to 3 lines (Z7). Two rows keep every label to 1 or 2 lines.
- Visual element: the four-bin board (chip set). Why: it splits one field into its three parts visually, plus a reject bin that trains the "is this Field 5 at all?" check (M-Signaling).
- Card icons (never the same as a column icon, A8 cue rule): Vacation policy beach · Overtime policy clock-plus (fallback clock) · HR manager user-star · Internal / employee building · No formal control eye-off · Chatbot answers policy questions message-chatbot.
- States: Sort board (A9, A14). Placed correct: chip in column, green edge for 2 s then neutral with circle-check. Wrong: card returns to tray with amber dashed edge.
- Keyboard and aria-live: A14 sort pattern; "Vacation policy selected. Choose a column." / "Placed in Source. Correct. The map now shows which document an HR answer depends on."
- Narrow: stacked: columns become a 2 x 2 grid of compact column buttons at the top; tray below in one column.
- Rule check: pass. Gulf of execution: hint "Select a card, then a column..." plus the lift on select. Gulf of evaluation: chips settle in columns; counts update.

### S10 · Decision · "Fill Field 7 for the HR case." (recommended single step; two-step variant below)

- Problem 1 (duplication): V2 stop 3, about one minute earlier, already asks Field 6 with nearly the same options (manager review / no formal control / leave empty). Repeating it right after the video is a read-again, not a new decision (M-Coherence, H8).
- Problem 2 (words): step 2 is at 45 words; the pinned Field 6 strip 03 asks for pushes it to about 50.
- Recommended layout (Noy to decide; Part D): S10 becomes one step on Field 7, and Field 6 appears pre-filled as context.
  - Words: instruction 7 + Field 6 value "No formal control" 3 + situation 10 + options 24 = 44 (the label "Field 7, Gaps, says:" is replaced by the template row's badge and icon).
  - Zones (T/M/B):
    - Top: two template rows stacked: row 6 filled (badge 6 + eye-check + "No formal control", ink-muted, with check badge: given), row 7 empty slot (badge 7 + zoom-question + dashed slot, accent outline = current).
    - Middle: situation line with message-circle icon: "Nobody knows how many wrong answers were given so far."; under it the 2 x 2 option grid.
    - Bottom: (merged into middle; options need 2 rows of 72).
  - On choice, the chosen label drops into row 7's slot and takes green or amber there and on the option (N-Mapping: you see your answer written into the map).
  - Icons: a "Unclear how many answers were wrong" hash · b "Leave it empty, gaps look weak" square · c "AI will catch wrong answers later" list-search (the object is a checker) · d "Wrong answers are rare, per staff" message-2. (No zoom-question on a, A8 cue rule.)
- Two-step variant (if Noy keeps 03's design): same layout; step 1 has row 6 as the empty slot and row 7 hidden; step 2 shows row 6 filled with the chosen value (3 words) and row 7 empty. Drop the visible labels "Field 6, Existing controls, says:" and "Field 7, Gaps, says:" (the template rows carry them), which keeps step 1 at 38 and step 2 at 44. Step 1 icons: a user-star · b brain · c list-search · d square.
- Visual element: the two template rows filling in. Why: the learner literally writes into the map; the row shows "unclear" as a legitimate filled value, not an empty one.
- Keyboard: h1 → option grid (arrows) → Continue. Rows are not focusable (static), but row 7 has aria-live text when filled.
- aria-live: "Correct. Field 7 now tells you what to investigate before Lesson 5, and what not to build on yet."
- Narrow: stacked: rows full width, options one column.
- Rule check: pass with either variant after the label cut. Gulfs: empty dashed slot answers "what do I fill"; the filled slot answers "did it work".
- Open term: "QA sample" (03 tooltip has no source definition): in the two-step variant option c uses it; until the SME defines it, the term carries no tooltip and stays undefined on screen, which breaks rule 10. Proposal: replace with "A sample of answers is checked" or remove (Part D).

### S11 · Decision · "Pick the strongest success metric for the HR case."

- Words: unified 45. The visual check strip needs a 2-word label. Fix: header "Field 8: Success metric" (4) becomes the template row (badge 8 + gauge + "Field 8", 2 words counted as the badge is not counted: "Field 8" label 2), freeing 2 words for the strip label "Checkable later?" → 45.
- Zones (L/R 60/40 inside the middle; template row on top):
  - Top: template row Field 8 with an empty dashed slot.
  - Middle left (498): four options stacked, 56 px each, icon left, label left-aligned.
  - Middle right (336): the "3-month check" panel: calendar icon (32) and "Checkable later?" label; three indicator slots in a column: map-pin (start point), target (target), calendar-event (date). Each slot is a hollow dashed circle by default.
  - Bottom: none (feedback row below).
- After a choice: the slots light up according to what the chosen metric contains: a none · b none · c all three (solid success) · d target and date only, start point stays hollow with amber dashed ring. The chosen text also fills the template-row slot (truncated with full text in aria-label).
- Visual element: the three-slot checkability indicator. Why: it turns "testable" into something the learner sees (baseline, target, date) and makes the gulf of evaluation explicit without extra words (N-Feedback, M-Signaling).
- Icons for options (A8 cue rule, c and d share an icon because both are numeric): a trending-up · b mood-smile · c percentage · d percentage.
- Indicator aria: each slot has aria-label "Start point: present" or "Start point: missing".
- Keyboard: h1 → options (arrows) → Continue. Indicator panel is a status region, not focusable.
- aria-live: "Correct. Testable: a start point, a target and a date..." / "Not this one. Twenty percent, down from what?..." followed by "Start point missing." for d.
- Narrow: stacked: indicator panel becomes a single row of three slots under the template row, options below.
- Rule check: pass after the header cut. Note FL8 / PS3: correct feedback mentions accuracy at or above 95% in a QA sample; "QA sample" has no tooltip source (rule 10 gap, Part D).

### S12 · Explorer (with closing check) · "Open all eight fields of the finished HR map."

- Words: unified 35 in the longest state as specified by 03 (tile numbers not counted). Pass. But the Field 8 panel string is 19 words in one element (Z2) and the Field 5 string 13 words of list text. Fix: the right panel renders each field as a small visual, not a sentence (below), which also cuts words.
- Zones (L/R 40/60):
  - Left (336): eight field tiles as a vertical list, 48 px each: number badge, field icon, short name ("Name", "Trigger", ..., "Metric"). Opened tiles get the check badge.
  - Right (498): content panel. Top: field icon (32) + field name. Middle: the field's canon content as a mini visual:
    1. Name: the canon name as one line (7 words).
    2. Trigger: three channel icons (message-circle, mail, walk) with labels "WhatsApp", "email", "in person" feeding one start circle.
    3. Steps: three step boxes joined by arrows, role chip under each, verbatim "(employee)", "HR staff", "HR staff / manager" (FL9 kept verbatim).
    4. Handoffs: id-badge-2 → user-star with the condition chip "policy exceeded".
    5. Sources: four document chips (vacation, pension, expense, overtime), one owner chip "HR manager", one tag chip "internal / employee".
    6. Controls: one line "No formal control: personal judgment of the HR staffer".
    7. Gaps: two lines as two chips: "Wrong answers given: unclear" and "No single handoff channel".
    8. Metric: a horizontal bar filled to about 35% labelled "Baseline ~35%", an arrow to a 20% mark labelled "Target 20% in 3 months", and a small chip "Accuracy at least 95% in a QA sample" (FL8 open).
  - Bottom (inside the card, under the panel): nothing until 8 of 8.
- Check state: after the eighth tile, the right panel is replaced by the question "A question exceeds known policy. Which field shows what happens next?" with a chevron-left glyph pointing to the tile list, and the tiles switch to answer mode (accent outline pulse once). Instruction line changes to "Choose the field that answers the question." (7).
- Visual element: the per-field mini visuals inside the panel (the same visual language as V2's build). Why: the worked example is seen, not read; each field shows its shape (channels, chain, handoff, stack, bar), so no panel state is a text block (rule 1, M-SpatialContiguity).
- States: tiles as Explorer then as single-choice options (green/amber); panel crossfades.
- Keyboard: h1 → tile list (one tab stop, Up/Down arrows; Enter opens) → Continue. In check state, same list acts as options.
- aria-live: "Field 4 opened. 4 of 8. From HR staff to HR manager when policy is exceeded." Panel visuals carry text alternatives equal to the 03 canon strings, so screen reader users get the canon wording verbatim.
- Narrow: stacked: tile list becomes a 4 x 2 grid of compact tiles on top, panel below.
- Rule check: pass. R8: S11 decision before, closing check here, S13 decision after. Gulf of execution: hint counter "0 of 8 opened". Gulf of evaluation: check badges, then green tile.
- Note: this map (with the same visuals) is the "HR map" tab of the reference card (A11), as 03 asks.

## Chapter 4: Critical eye

### S13 · Decision · "Set where the HR process starts and ends."

- Words: unified 44. Pass.
- Zones (T/M/B):
  - Top: process strip: three grey chips "Receiving" → "checking" → "answer or escalation" joined by arrows, centered, 640 px wide, with 40 px empty margin on both sides (room for the boundary brackets).
  - Middle: three option cards in a row (270 x 150), each split left/right: left half Start (bell-ringing) + start text; right half End (flag) + end text; a 1 px divider between halves.
  - Bottom: empty by design (the boundary result is drawn on the top strip, so the options never move).
- After a choice, two brackets (start = bell-ringing, end = flag) are drawn on the top strip: a: brackets fly out past both card edges with arrow-tails (the map "swells") · b: brackets sit exactly at the strip's two ends · c: start bracket sits after a gap where two of three channel icons are cut off, end bracket sits right after "checking". Amber or green color follows the option.
- Visual element: the process strip with drawn boundaries (a timeline). Why: boundaries are a spatial idea; the learner sees what each choice includes and excludes (N-Mapping, s21 "swells").
- Keyboard: h1 → options (arrows) → Continue. The strip is a figure with aria-label updated after the choice: "Boundaries drawn beyond both ends of the process" / "Boundaries at the trigger and the output" / "Boundaries cut off two channels and the answer".
- aria-live: per option feedback (04).
- Narrow: compact: cards stack internally (Start above End) if under 240 px wide. Stacked: strip as a vertical chain on top, options one column.
- Rule check: pass. Gulf of execution: the Start/End icons in every card make the two-part choice explicit. Gulf of evaluation: the brackets show the consequence before the text is read.

### S14 · Decision · "Choose what the map must record at this handoff."

- Words: unified 45. Pass at the limit.
- Zones (L/R 40/60):
  - Left (336): handoff diagram: HR staff (id-badge-2, 48) → arrow → HR manager (user-off, 48, dashed outline = away). Below the diagram the situation line "A question exceeds policy. It goes to the HR manager, who is away." (13).
  - Right (498): four options stacked, 64 px each.
- After the correct answer: four small icons appear along the arrow, each with a 14 px label: user ("from"), user-star ("to"), package ("what passes"), lifebuoy ("fallback") and the fallback icon sits in an amber dashed ring (missing today, so it goes to Field 7). Labels are 4 words more on the card after the action; the default state stays at 45, the post-correct state at 49. FIX: render those four as icons with aria-labels and tooltips only (no visible words) to stay inside the limit, or accept 49 in the post-answer state (Noy decides; Part D). This spec chooses icon-only plus tooltips.
- Visual element: the handoff diagram. Why: the handoff is a moment between two roles; seeing the arrow and the absent receiver makes the hidden assumption concrete (N-ConceptualModel, s27).
- Option icons (A8 cue rule, no robot): a "A rule naming a backup manager" book · b "Nothing: the manager knows the history" brain · c "Sender, receiver, what passes, fallback" list-details · d "An AI agent to reroute questions" route.
- Keyboard: h1 → options → Continue. Diagram is a figure with aria-label.
- aria-live: per option; after correct also "Diagram updated: from, to, what passes, fallback missing."
- Narrow: stacked: diagram on top (horizontal still fits at 320 px), options below.
- Rule check: pass. Tooltip "Fallback" (NF1) and "Handoff" on the situation panel.

### S15 · Decision · "Choose the first question to ask about this bottleneck."

- Words: unified 44; with the big-number restructure 43. Pass.
- Zones (T/B with an L/R top band):
  - Top band (200): left (417): big number "~35%" (64 px) with a 300 px bar filled to 35% (accent) and the label "of HR time goes to repeat questions" (14 px). Right (417): speech bubble with user icon, "A colleague:" label and the quote "'Throw AI at it.'".
  - Bottom band (240): three option cards in a row (270 x 120), icon top, question text.
- Visual element: the big number with its bar. Why: the load is the fact the decision rests on; showing it as a number turns the situation sentence into data (M-Signaling) and halves the text.
- Change: the situation sentence "Repeat questions take about 35% of HR time." becomes the big-number label; no fact changes (canon Field 8 baseline). The funnel icon from 04 is dropped (one visual is enough, rule 6).
- Icons: a "Why do these questions keep arriving at all?" search · b "Which AI tool answers questions fastest?" clock · c "Can we automate all three channels now?" settings-automation.
- Keyboard: h1 → options (arrows) → Continue.
- aria-live: big number figure aria-label "About 35% of HR time goes to repeat questions."; option feedback per 04.
- Narrow: stacked: number and bubble stack, options one column.
- Rule check: pass. Tooltip "Bottleneck" on the instruction line's term.

### S16 · Sort · "Sort each card by AI fit."

- Words: unified 45. Pass at the limit.
- Zones (T/B):
  - Top (250): two columns side by side (417 each): left "AI fits" robot, right "AI does not fit" robot-off; each column holds up to three chips.
  - Bottom (190): tray, 2 rows of 3 cards (270 x 72).
- Visual element: the two-column board. Why: a binary judgment is clearest as two places to put things (N-Mapping).
- Card icons: 1 "Tag a free-text question by topic" category · 2 "Decide a financial refund" coin · 3 "Label a request urgent or routine" urgent (fallback alarm; never alert-circle, too close to the status icons) · 4 "Bring order to three scattered channels" arrows-shuffle · 5 "Build on a mostly 'unclear' map" map-question (fallback map-2) · 6 "Summarize a question before escalation" file-description.
- States, keyboard, aria-live: A14 sort pattern.
- Narrow: stacked: the two columns become two column buttons side by side at the top (they fit at 320 px), tray in one column.
- Rule check: pass. Hint (14 words) fits the row.

### S17 · Sort (one case at a time, five bins) · "Sort each case into the mistake it shows."

- Words: unified 36. Pass.
- Zones (T/B):
  - Top (180): case card centered (560 x 100): file-text icon left, case text (max 14 words, 2 lines). Five progress dots under it.
  - Bottom (260): five bins in a row (160 x 200 each, 12 px gaps): icon (32) top, label (14 to 16 px, 2 lines) below; bins are buttons.
- Visual element: the five-bin row (chip set of the deck's five mistakes). Why: all five mistakes are visible together every round, so the learner compares mistakes, not just recognizes one (ID5); the same icons return in S20 step 2 (H4).
- Bin icons: "Aspirational, not actual" cloud · "No clear goal" compass · "Rushed mapping" hourglass · "Not updated" calendar-x · "Automating a broken process" settings-automation.
- Interaction: one case shown, pre-selected; one click on a bin. Correct: the case card shrinks into the bin (bin shows a count "1"); next case slides in from the right. Wrong: bin gets amber dashed ring; case stays.
- Keyboard: h1 → bins (arrows) → Continue. New case announced: "Case 2 of 5: The map shows how HR intends requests to flow, not how they flow today."
- aria-live: per bin feedback (04).
- Narrow: compact: bins wrap to 3 + 2. Stacked: case card on top, bins as a one-column list of 56 px rows.
- Rule check: pass.

## Chapter 5: Build yours

### S18 · Decision then Input (two steps) · step 1 "Choose what may go into a public AI tool." step 2 "Write a generalized title for your case."

- Instruction change: 04 writes "Step 1: ..." and "Step 2: ..." in the instruction line. Verb-first means the step label moves to the stepper dots on the card; the instruction starts with the verb. Counts drop by 2 each.
- Words: step 1 unified 36 + 4 visual labels = 40; step 2 25. Pass.
- Step 1 zones (L/R 40/60):
  - Left (336): boundary diagram: a rounded box "Your organization" (building icon) on the left, a cloud "Public AI tool" (cloud icon) on the right, a dashed boundary line between. A document icon sits inside the organization box.
  - Right (498): situation line with shield-lock "You want AI help with your map." on top; three options stacked below.
  - After a choice: b: a smaller, plain document icon (file-text) crosses the boundary into the cloud, green. a and c: the document moves to the boundary and stops with an amber ring and a tag icon attached (sensitive tags travel with it).
- Step 2 zones (T/M/B):
  - Top: grey reference strip with folder icon and the learner's S02 case title (not counted), label "Your case" hidden visually but in aria.
  - Middle: field "Generalized case title" with counter, the safety line "Leave out names and identifying details." under it.
  - Bottom: left checkbox (24 px box, home icon after the label) "My map stays on paper or my own computer."; right Save.
- Change: Save always enabled (same reason as S02). On Save while unchecked: amber feedback needs a new string (writer): proposal "Tick the box first: your map stays on paper or your own computer." (13). On Save with an empty field: 04's amber string.
- Visual element: the boundary diagram (step 1). Why: "what leaves your organization" is a spatial idea; the moving document shows the consequence (N-ConceptualModel, M-SpatialContiguity).
- Option icons step 1: a "Your full map, policy names included" map-2 · b "A generalized version: no names, no internal policy" file-text · c "Only Field 5, where the sources are listed" database (Field 5 icon on a distractor is fine: it names its object, and it is not the key).
- Keyboard: step 1: h1 → options → Continue ("Next step"). Step 2: h1 → title field → checkbox → Save → Continue.
- aria-live: step 1 per option feedback plus diagram aria "Document stays inside" / "Generalized document crosses to the public AI tool". Step 2: counter thresholds; Saved string.
- Narrow: step 1 stacked: diagram becomes a one-row strip (org box, line, cloud) above the options.
- FLAG (PS1 / FL23, blocker for wording): 06 proposes a live AI coach in the workbook; if adopted, the checkbox line and the S19 safety line ("Keep your map off external AI tools") contradict what the workbook does. Layout is unaffected; strings wait for Noy.
- Rule check: pass after the instruction change.

### S19 · Handoff · "Open the workbook and map your case."

- Words: brief state unified 45; return state 21 with the change below. Pass.
- Layout: A12 Handoff pattern.
  - Top: notebook + "Practice Studio workbook" (left), clock + "~50 min" chip (right; FL15 planning value).
  - Middle L/R 40/60: left: map-2 + "Your AS-IS map plus one success metric" (7), centered vertically. Right: four numbered steps, 48 px rows: 1 layout-list "Fill eight fields" · 2 zoom-question "Write 'unclear' if unknown" · 3 gauge "Set baseline and target" · 4 file-export "Export PDF".
  - Bottom: shield-lock + "Keep your map off external AI tools." (left), "Open workbook" primary with external-link (right).
- Opened state: buttons become "Reopen workbook" (secondary) and "I'm back" (primary). Brief stays visible.
- Return state: middle swaps to: left large notebook icon with check badge; right two lines: "Back from the workbook? Export your PDF, then check your map." (10; replaces 04's "Back from the workbook? Check your map next." (8) so the Handoff template's PDF export reminder is on the return checkpoint, as principles.md requires). Buttons "Reopen workbook" / "I'm back".
- Visual element: the four-step list with field icons. Why: the steps use the same icons as the fields they refer to (Field 7, Field 8), so the workbook task connects to what was practiced (H6).
- Keyboard: h1 → Open workbook → (opened) Reopen workbook → I'm back → Continue.
- aria-live: "The workbook is open in a new tab. This module keeps your place." / "Next: three questions to check your map before you submit." The button has aria-label "Open workbook, opens in a new tab".
- Narrow: stacked: what-line above steps; safety line above a full-width button.
- Rule check: pass. R4: Continue only after "I'm back". Gulf of execution: one primary button. Gulf of evaluation: the opened-state message and the Saved indicator; the module visibly keeps the brief.
- Tooltip "Practice Studio workbook" and "Export PDF" are NF6 (not sourced).

### S20 · Decision (self-check, two steps) · step 1 "Check your map against three questions." step 2 "Pick the mistake your case is most exposed to."

- Instruction change: "Step 1:" / "Step 2:" prefixes move to stepper dots (verb-first).
- Words: step 1 unified 6 + 26 + "Reopen workbook" 2 = 34 after cutting the column header "Yes / Not yet" (3), which repeats the toggle labels. Step 2: 9 + 14 + 14 + 2 = 39. Pass.
- Step 1 zones (three rows, each L/R 65/35):
  - Each row (100 px): left: icon + question (18/24); right: segmented toggle "Yes" / "Not yet" (2 x 110 px). Rows: user "Does every step name who exactly does it?" · clock "Does Field 4 say what happens if information arrives late?" · ruler "Can a number show that the metric improved?".
  - Card bottom-right: "Reopen workbook" text link with notebook icon.
- Step 2 zones (T/B):
  - Top: five mistake chips in a row (same icons as S17 bins, H4), 160 px each.
  - Bottom: pre-submission strip: checklist icon + "Before you submit: every field filled, metric measurable, no invented answers. Export your PDF." Reopen workbook link right.
- Visual element: step 1 the three-row checklist with its status column; step 2 the five-mistake chip set reused from S17. Why: the checklist turns the peer review into a visible audit; the reused chips make the reflection a recognition task, not a recall task (H6).
- States: step 1: Yes → green; Not yet → amber (needs attention, not wrong); the row gets the matching badge. Feedback row shows the most recent row's string. Step 2: chosen chip takes Selected (accent), feedback in info style (no right answer).
- Keyboard: step 1: h1 → row 1 toggle (arrows between Yes/Not yet, radiogroup semantics, Enter or Space confirms) → row 2 → row 3 → Reopen workbook → Continue (after all three answered). Step 2: h1 → chips (arrows) → Reopen workbook → Continue.
- aria-live: "Row 2: Not yet. A late handoff stalls with no plan. Add the fallback, or record it as a gap."
- Narrow: stacked: each row's toggle moves under its question; chips become one column.
- Rule check: pass.

## Chapter 6: Close

### S21 · Knowledge check (5 items, one per card) · "Choose one. First answer counts." / item 5 "Spot two errors in this AI draft."

- Words: items 1 to 4 unified 38 to 43; item 5 unified 38 (tile numerals excluded under A2; 04 counted 45). Pass.
- Items 1 to 4 zones (T/M):
  - Top: stem with one scenario icon (left), five progress dots top-right of the card.
  - Middle: 2 x 2 options (417 x 110), letter badge A to D instead of an icon (A8 deviation for scored items; Noy to approve).
  - Stem icons: item 1 arrows-exchange (handoff) · item 2 stairs (the subject is the HR steps; no robot, A8) · item 3 gauge · item 4 message-question (not zoom-question, which would mirror Field 7, the key d).
- Item 5 zones (T/M/B):
  - Top: badge with robot icon and the aria-label "AI draft" (icon only; the instruction names it).
  - Middle: the AI draft map as eight field tiles in two columns of four (417 x 52 each): number badge, field icon, content short form. Full field names in aria-label and tooltip.
  - Bottom: "0 of 2" counter left, "Check" right.
- Score state (after item 5 is solved): big number "4 of 5" style ("[n] of 5 on first try"), with five dots under it, each green (first try correct) or amber. Continue to S22. This state is part of S21 (not a read-only screen).
- Visual element: items 1 to 4 the stem icon and the option grid (thin visual: acceptable for a test, Z6 exception for scored items, noted); item 5 the field-tile map; score state the big number.
- States: first answer locked into the score (not shown as such until the end); retry allowed with green/amber per option (A4). Item 5: multi-select, feedback paged "1 of 2" per selected tile.
- Keyboard: h1 → option grid (arrows) → Continue. Item 5: h1 → tile grid (arrows; aria-pressed) → Check → paging → Continue.
- aria-live: "Item 2 of 5." on item change; per option feedback; item 5: "Tile 3 selected. 1 of 2."; score state: "4 of 5 correct on the first try."
- Narrow: stacked: option grid one column; item 5 tiles one column of eight (scroll flag A13).
- Rule check: pass. R6 deviation proposed for scored options (letters, not icons). Tracking per 04.

### S22 · Close (three steps) · step 1 "Pick the takeaway your own map proves most." step 2 "Match each field to its Lesson 5 layer." step 3 "Save your record and note your homework."

- Instruction change: drop "Step n:" prefixes (stepper dots).
- Words: step 1 24, step 2 31, step 3 39 (unified, prefixes dropped). Pass.
- Step 1 zones: header "Three takeaways" top; three tall cards (270 x 260) in a row: key "Mapping is a condition, not bureaucracy" · zoom-question "'Unclear' is a legitimate answer" · scissors "Not every bottleneck needs acceleration". Chosen card takes Selected (accent), feedback in info style.
- Step 2 zones (T/B): Top: four layer columns (200 each): Process steps route · Data flow arrow-big-right-lines · Knowledge layer books · Monitoring layer chart-line (no layer icon equals a field icon, A8 cue rule). Bottom: tray of four field cards with their field icons (stairs, database, arrows-exchange, gauge) and number badges. Sort pattern A14. Completion line (20 words) appears in the feedback row.
- Step 3 zones (L/R 55/45): Left: homework card: calendar icon + "Homework for Lesson 5, 1 to 1.5 pages", then two numbered tasks as two rows. Right: "Download my lesson record" primary (download icon) above "Finish lesson" secondary.
- Finish without download: inline confirm in the feedback row (A9): "Finish without downloading? Your record stays unsaved." buttons "Download first" / "Finish anyway". No modal.
- Visual element: step 1 the three takeaway cards; step 2 the four-layer board; step 3 the homework card. Why: every closing step has an action (rule 8) and a single object to act on.
- Keyboard: step 1 cards (arrows) → Continue ("Next step"). Step 2 sort pattern. Step 3: Download → Finish lesson. Continue is not shown on step 3; Finish lesson is the final action (it sets completion).
- aria-live: step 1 feedback; step 2 per card; step 3 "Your record holds your case title, self-check answers and score..." and the Saved indicator updates.
- Narrow: stacked: cards and columns one column; homework above buttons.
- Rule check: pass. NF8 (Field 4 to Data flow interpretation) stays open.

---

# Part C. Rule matrix (screen rules 1 to 12 and the two gulfs)

Legend: OK = passes as specified here. FIX = passes only with the change in Part B. n/a = rule does not apply.
R1 one centered card, distributed content · R2 three fixed zones · R3 feedback row, hint first, green/amber, dim siblings · R4 advance after action · R5 words (45 / 25) · R6 one meaningful icon per element · R7 first decision in 1 to 2 clicks · R8 no two read-only in a row, media mix · R9 template · R10 terms tooltipped on first use · R11 menu · R12 WCAG keyboard, live row, contrast, focus · GE gulf of execution · GV gulf of evaluation.

| Screen | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 | R12 | GE | GV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S01 | FIX (2 bubbles) | OK | OK | OK | FIX (47 to 44) | OK | OK | OK | OK | OK (no terms) | OK | OK | OK | OK |
| S02 | OK | OK | FIX (Save enabled + amber) | OK | OK (45) | OK | OK | OK | OK | OK | OK | OK | FIX | OK |
| V1 | OK | OK | OK | OK | OK | OK | OK | OK | OK | n/a | OK | OK (captions, keys) | OK | OK |
| S03 | OK | OK | FIX (paged feedback) | OK | OK | FIX (warning icon reserved) | OK | OK | OK | OK | OK | OK | OK | OK |
| S04 | OK | OK | OK | OK | FIX (dots, not "1 of 5") | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| S05 | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK (hotspots as buttons) | FIX (pulse) | OK |
| S06 | OK | OK | OK | OK | OK | OK | OK | OK | OK | FIX ("Field template" tooltip SME) | OK | OK | OK | OK |
| S07 | OK | OK | OK | OK | FIX (cut top line: 59 to 45) | OK | OK | OK | OK | OK | OK | OK | FIX (tiles as answers) | OK |
| S08 | OK | OK | OK | OK | FIX (48 to 43) | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| V2 | OK | OK | OK | OK | OK | FIX (stop 2 key icon) | OK | OK | OK | n/a | OK | OK | OK | OK |
| S09 | OK | OK | OK | OK | OK | FIX (card icons not mirroring columns) | OK | OK | OK | OK | OK | OK | OK | OK |
| S10 | OK | OK | OK | OK | FIX (labels into template rows) | OK | OK | FIX (duplicate of V2 stop 3) | OK | FIX ("QA sample" undefined) | OK | OK | OK | OK |
| S11 | OK | OK | OK | OK | FIX (header to "Field 8") | OK | OK | OK | OK | FIX ("QA sample" in feedback) | OK | OK | OK | OK |
| S12 | FIX (panel visuals, Z2) | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| S13 | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| S14 | OK | OK | OK | OK | FIX (post-answer icons only) | FIX (no robot on d) | OK | OK | OK | FIX ("Fallback" NF1) | OK | OK | OK | OK |
| S15 | FIX (big number) | OK | OK | OK | OK | FIX (one visual, drop funnel) | OK | OK | OK | OK | OK | OK | OK | OK |
| S16 | OK | OK | OK | OK | OK (45) | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| S17 | OK | OK | OK | OK | OK | OK | OK | OK | OK | FIX ("Aspirational state" NF4) | OK | OK | OK | OK |
| S18 | OK | OK | FIX (Save enabled + amber) | OK | OK | FIX (lock icon reserved) | OK | OK | OK | OK | OK | OK | FIX (verb-first) | OK |
| S19 | OK | OK | OK | OK | OK (45) | OK | OK | OK | OK | FIX (NF6 tooltips unsourced) | OK | OK | OK | FIX (PDF reminder on return) |
| S20 | OK | OK | OK | OK | FIX (cut header) | OK | OK | OK | OK | OK | OK | OK | FIX (verb-first) | OK |
| S21 | OK (Z6 exception) | OK | FIX (paged feedback item 5) | OK | OK | FIX (letters on scored options) | OK | OK | OK | OK | OK | OK | OK | OK |
| S22 | OK | OK | FIX (inline confirm) | OK | OK | FIX (layer icons distinct) | OK | OK | OK | OK | OK | OK | FIX (verb-first) | OK |

Chapter media mix (rule 8, second part):

| Chapter | Media types | Result |
|---|---|---|
| Ch0 | Persona chat bubbles, form input | OK |
| Ch1 | Video, card grid | OK |
| Ch2 | Sort board, diagram, situation cards, field tiles, template row | OK |
| Ch3 | Video, sort board, template rows, checkability indicator, field-visual explorer | OK |
| Ch4 | Boundary timeline, handoff diagram, big number, two sort boards | OK (no video, by design: max 2 videos) |
| Ch5 | Boundary diagram, form, external workbook (Handoff), checklist | OK |
| Ch6 | Quiz cards, field-tile map, big-number score, layer board | OK |

Read-only check (rule 8, first part): no screen in the plan is read-only. Each Explorer (S05, S07, S12) ends in a decision, each video has stops, the Handoff requires an action, and the S21 score state is part of the S21 interaction.

---

# Part D. Cuts, splits and decisions

## Cuts and reshapes this spec makes (writers to confirm wording)

| # | Screen | Change | Reason |
|---|---|---|---|
| D1 | All | One word-count convention (A2) | 02, 03 and 04 used three different conventions |
| D2 | S01 | "Can it be live next month?" to "Live next month?"; quote split into two bubbles | 47 words; 24-word single element |
| D3 | S02, S18 | Save always enabled; amber message plus focus on the missing field or box; S18 needs one new amber string | A disabled button gives no reason (gulf of execution, H9) |
| D4 | S03 | Context icon to history; feedback paged "1 of 2" | Warning icon reserved for status; two feedback strings can exceed 25 words |
| D5 | S04 | "1 of 5" text to progress dots | 48 words with the counter |
| D6 | S07 | Cut the Lesson 1 top line (to a tooltip); tiles become the answer buttons | 49 to 59 words; one object per concept |
| D7 | S08 | Reminder strip to "AS-IS: a normal day, in practice."; round counter to dots | 48 words |
| D8 | S10 | Recommended: one step on Field 7, Field 6 shown pre-filled from V2; or keep two steps with labels moved into template rows | Duplicates V2 stop 3; step 2 over 45 with the pinned strip |
| D9 | S11 | Header to the Field 8 template row; add the three-slot checkability indicator with "Checkable later?" | Word room for the visual that closes the gulf of evaluation |
| D10 | S12 | Panel shows a mini visual per field (channels, chain, handoff, stack, bar) with canon strings as text alternatives | Field 8 panel was a 19-word single element |
| D11 | S14 | Post-answer handoff details as icons with tooltips, no visible words | Keeps the post-answer state at 45 |
| D12 | S15 | Situation sentence becomes the big number and its label; funnel icon dropped | One visual, fewer words |
| D13 | S18, S20, S22 | "Step n:" prefixes move from the instruction line to stepper dots | Verb-first instruction rule |
| D14 | S19 | Return line to "Back from the workbook? Export your PDF, then check your map." | Handoff template requires a PDF reminder at the return checkpoint |
| D15 | S20 | Cut the "Yes / Not yet" column header | Repeats the toggle labels |
| D16 | S22 | "Finish without downloading?" as an inline confirm in the feedback row | No overlays |
| D17 | V1, V2 | Stops render as frozen still (left 40%) plus question panel (right 60%), not a card over the frame | Feedback and questions never overlay content; still keeps context |
| D18 | V1, V2 | Request cropped stop stills and a caption safe area from the motion designer | Legibility of the still at 336 px; captions vs keywords |

## Decisions for Noy

| # | Decision | Default in this spec |
|---|---|---|
| N1 | S10: single step (Field 7) or two steps (03 design) | Single step |
| N2 | S21: letter badges instead of icons on scored options (deviation from rule 6) | Letters |
| N3 | Phone portrait: allow scroll inside the stage card in the stacked layout only, with a "turn sideways" banner | Allow |
| N4 | S14: post-answer details icon-only (45 words) or with 4 visible labels (49 words) | Icon-only |
| N5 | Color tokens and font: replace the placeholders with Wawiwa brand values, keeping the contrast ratios in A5 | Placeholders |
| N6 | Menu chapter map: visited screens only, or free navigation | Visited only |
| N7 | S01 persona "Dana" (FL1) | Label kept, removable without layout change |
| N8 | Workbook data handling (PS1 / FL23): S18 checkbox and S19 safety line depend on it | Strings on hold, layout fixed |

## Open SME points that touch the layout

- "QA sample" has no source definition (S10 two-step variant option c, S11 correct feedback, S12 Field 8 chip, V2 segment 12). Rule 10 cannot be met for it until the SME defines it or it is removed.
- "Fallback" (NF1), "Aspirational state" (NF4), "Field template" (02 S06 note), "Practice Studio workbook" and "Export PDF" (NF6) are composed or unsourced tooltip texts.
- Sensitivity tag vocabulary (FL6 / PS2): S09 shows "internal / employee"; the reference card and the S07 tooltip must match whatever the SME picks.
- Field 3 step 1 owner "(employee)" (FL9): shown verbatim in the S12 Steps visual and V2 segment 5; if it changes, the S12 visual and the V2 lane placement change together.
- Tabler icon names marked with a fallback (gauge-off, map-question, clock-plus, urgent) must be checked against the icon set version in the build.
