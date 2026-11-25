# Round 3 (25 Nov 2026): Noy's notes on every built screen

Plan, sketches and prototypes approved in chat before building (planning/prototypes/round3.html: the card, G1 in the room).
Backup of everything before the round: planning/backup-2026-11-25-before-round3/. Screens after: planning/shots-r3/ (+ fix, fix2).

| Screen | Change |
|---|---|
| O3 | "Who you met" as a contacts list (initials circle, name, role); the building is gone |
| B1 + B2 | B2's question is now B1's film stop at 0:27 (before the film shows the card); B2 removed; tracking M2L3_B1_1 (scored) |
| B3 | Line: "This is your card. You build it step by step through the lesson." No OP-01 / Card 1 of 10. Card 1 is the new card (cardDoc) |
| C0 (new) | templates/gate.js: the question to ask before any tool, then slide 5's three ideas one by one, each a drawing and one line (flaw runs faster; Process Redesign first; in doubt show both paths) |
| C1 | New example: vendor payments on a vendor list with 6 known errors (persona A); add Auto-pay and the payments (dots) run faster with the wrong ones in them. The wrong payment is an illustration, not a fact of the case |
| C2 | Three answers (process, tool, both paths); Lin's off-boarding is the both-paths case; templates/pairPlus.js (last situation becomes a done box) + a three-way fork (style three-way) |
| D1 | templates/categories.js: all cards open and centred; Process Redesign first ("Before any tool"), an arrow, the four tool categories with Z-Image photos (DM look, planning/d1-photos/v2/PROMPTS.md). The "spans all four" rule left out (too abstract) |
| E1 | templates/guide.js: three points build in, a silent screen recording of the library (assets/video/e1-library-demo.mp4, made by planning/prototypes/_record-library.mjs), a big "Open the library" button |
| library/ | Bug fixed: the spotlights showed "[object HTMLElement]" (flatMap) |
| E2 | "Open the library and find the closest case for each pain"; longer branches; done boxes identical, the third too (pairPlus) |
| E3 | Label "Worked example", context line; a guess before the ROI part ("when does it pay back?", not scored). "Calibrate to your client's numbers" NOT added: not verified in the deck (Chrome was offline) |
| E4, G2 | templates/card.js rewritten: the card slides out of a folder to the centre; a stepper in the lesson's order (your pain, category and tools, root cause and people, data sensitivity, the opportunity); only the current step's fields; content.card holds the shared parts; ground: the fanned-cards photo |
| F2 | Context on the chips' row: "Practice on an example from class: Finance's slow invoices." |
| F3, F5 | The fish has a head and a tail (outlines), a colour per bone label; F5 is a real drag (kit dragDrop, click and keys too) with the hand; Tools and Data causes reworded so each fits one bone; F4's script line 3 updated |
| ch6 bar | Three tools, 5-Whys, Try it, Fishbone, The Boston case, Place, Focus |
| G1 | templates/meeting.js: the meeting photo (Z-Image, cast faces); the speaker's bubble lights with a ring; "Feels the pain" / "Funds the fix" by what is said (Sarah speaks twice, once each way); then the executive sentence with two blanks. Lines written for the lesson; audio to come (ElevenLabs, a voice per speaker) |

Not done yet: tests/walk.mjs is not updated to the new screens, and no test has run on this round (Noy: tests once a chapter is settled). check will also flag the old ch3 to ch7 chapter photos.
