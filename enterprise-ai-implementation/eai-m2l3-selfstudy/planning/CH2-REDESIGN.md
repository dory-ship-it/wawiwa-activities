# Chapter 2 redesign ("Every pain becomes a card"), 24 Nov 2026

Noy on the first build: crowded, flat, small text, graphics that do not crack the idea. This pass redoes chapter 2 only, as the taste slice for the whole lesson. Approved content (brief, questions, feedback lines, film script) is unchanged; how each idea is shown is new.

## The idea of the chapter and its picture
The chain from slide 3: a recommendation traces to a pain, the pain to a person, the person to their words, the words to a meeting. And slide 4: every pain becomes a card, no exceptions.

| Screen | Before | Now | Ground |
|---|---|---|---|
| B1 film | blue placeholder box on flat navy | the same film slot on the blurred boardroom; the placeholder is a slow push-in on the boardroom still (assets/video/temp/B1-placeholder-v2.mp4; the old file kept) | darkblur, boardroom |
| B2 decision (scored) | a dark side card and a list of three small radio lines | Sarah's question on dark glass in the room; three big recommendation cards; after Check every card turns over "what stands behind it": four links (Pain, Person, Words, Meeting). On Robert's card they light one by one and join; on the others the line breaks with "?" (template `templates/survive.js`) | light wash, boardroom |
| B3 the card | a 10-row form with "Fills in" on every field | the learner's top ten list (their pain on line 1); "Turn each pain into a card": the lines leave, ten cards land in a fan; card 1 opens large with their pain, its four parts empty; the other nine wait "in the workbook" (template `templates/tenCards.js`) | darkblur, fanned cards |

Rhythm: dark film, light decision on the photo, dark build. Motion only where it is the idea (the chain tracing back; a pain becoming a card), once, none with reduced motion or on a revisit.

## Wording changes (small, for the new layout)
- B2 options split into a title and its line (same words). New lines: the question "Why this, and not that?" (slide 3 notes, the film), the chain label "What stands behind it", and one trace line per card.
- B3 heading is slide 4's own line: "Every pain becomes a card. No exceptions." The approved line stays under the card. New: "Your top ten pains", "Turn each pain into a card", "Cards 2 to 10 wait in the workbook."

## Photos (temp, prompt files in assets/img/prompts/)
- ch2-boardroom.jpg: FLUX.1 Krea-dev seed 35031, an empty boardroom at night, a hand with a pen (a first try at seed 35021 had faces and a fake word: dropped).
- ch2-cards.jpg: FLUX.1 Krea-dev seed 35022, ten blank cards fanned, a hand lifting one.

## Files
- Before: planning/shots/ (07, 09 to 12) and planning/backup-2026-11-24-before-ch2-redesign/ (content, lesson.css, kit.json, tests).
- After: planning/shots-ch2-v2/ (states, mid-motion frames m1 to m5, `_sheet-ch2-side-by-side.jpg` with the reference lesson).
- Code: templates/survive.js, templates/tenCards.js (in kit.json), lesson.css section "Chapter 2 redesign", tests/states.mjs and tests/walk.mjs (B2, B3).
- card.js is unchanged (the later chapters' card screens still use it); it gets the same treatment when those chapters are redone.

## Tests (24 Nov 2026, on the current files)
check: passes except the ch3 to ch7 chapter photos (open since build 1, media stage). walk, test:scorm, test:fit, test:review: pass. check:overflow on B1 to B3: no overflow.

## Round 2 (24 Nov 2026, after Noy's review; audit and sketch approved before building)
- B1: the template's film screen as EAI M1 L4 V1 (no title line, "Watch for:", an existing course photo darkblurred: assets/img/ch2-laptop-paperwork.jpg from v3). The old blue placeholder film is back; the generated boardroom photo and the v2 placeholder are deleted.
- B2: the template's decision panel itself (kit decision, variant single, one panel, as S18): context line, heading, stacked answers with the approved wording, Check, one try. templates/survive.js only adds one chain to the feedback card after Check (Behind it: Pain, Person, Words, Meeting, and Robert's line). Style option `chain-fit` widens this panel to 880 px so it fits with its feedback.
- B3: the four parts of card 1 are a quiet preview (name and two faint lines), no dashed boxes.
- Tests on the current files: check (only the old ch3 to ch7 photo fails), walk, test:scorm, test:fit, check:overflow B1 to B3, test:review: pass.

## Waiting for
Noy's taste check of this slice. Only after her OK: the same approach for chapters 1 and 3 to 7.
