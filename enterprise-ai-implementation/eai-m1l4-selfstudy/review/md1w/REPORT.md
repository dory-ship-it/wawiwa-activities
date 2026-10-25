Weekly usage (all models) before: 20%.

# MD1-W report: the MD1 chapter photos (EAI M1 L4 self-study, 25 Oct 2026)
Commit: local only, NOT pushed. Screens: [screens/](screens/) at 1280x720, with `-1600x900` copies. Scripts: `tools/md1-images.py` (files, never overwrites), `tools/md1w-content.mjs` (content, idempotent), `tools/shots-md1w.mjs` (screens).

## 1. Files
- Moved (6 originals, 2752 x 1536): `assets/img/l4/md1/{o1-lanes-office, ch2-why-map, ch4-hr-demo, ch5-critical-eye, ch6-build-yours, ch7-wrap-up}.jpg` -> `assets/img/_originals/md1/`. Left uncommitted, as the order asks.
- Written in their place (same names): 1600 x 893, JPG q82, optimized, progressive, 105 to 149 KB each (originals 2.4 to 2.8 MB).
- New from reuse (copied, not moved, same processing): `ch1-intro.jpg` from `v2/v2-01-dana-phone.jpg` (119 KB), `ch3-toolkit.jpg` from `v2/v2-04-three-channels.jpg` (129 KB).
- Note: the older originals in `assets/img/_originals/` (dana, ft1-4, s14-s22) ARE tracked by git, although SOURCES.md says "not committed". I left them as they are. The new `md1/` folder stays untracked.

## 2. Content (all `temp: false`; no photo shared by two chapters)
| Where | src | Final position |
|---|---|---|
| ch0 Intro | l4/md1/ch1-intro.jpg | 22% 50% |
| ch1 Why map | l4/md1/ch2-why-map.jpg | 35% 50% |
| ch2 Toolkit | l4/md1/ch3-toolkit.jpg | 50% 50% |
| ch3 HR demo | l4/md1/ch4-hr-demo.jpg | 30% 40% |
| ch4 Critical eye | l4/md1/ch5-critical-eye.jpg | 65% 50% |
| ch5 Build yours | l4/md1/ch6-build-yours.jpg | 35% 50% |
| ch6 Wrap-up (and END) | l4/md1/ch7-wrap-up.jpg | 40% 50% |
| O1 photo | l4/md1/o1-lanes-office.jpg | 60% 50% |
| S06 situation 1 | s15.jpg, alt "A team lead going through her own stack of requests" | 50% 35% |
| S06 situation 2 | ft2.jpg, alt "A process diagram being drawn on a whiteboard" | 50% 50% |
O1's `image` (ft3.jpg) and S01's image are unchanged. No `temp: true` is left anywhere in the content, so check no longer warns about temp images.

## 3. Stage screens (main state, both sizes)
O1 [1280](screens/01-O1.png) [1600](screens/01-O1-1600x900.png) · S01 [1280](screens/02-S01.png) · W1 [1280](screens/03-W1.png) · W2 [1280](screens/04-W2.png) · W3 [1280](screens/05-W3.png) [1600](screens/05-W3-1600x900.png) · W4 [1280](screens/06-W4.png) · S14 [1280](screens/07-S14.png) · S15 [1280](screens/08-S15.png) · S18 [1280](screens/09-S18.png) · S22 [1280](screens/10-S22.png) · END [1280](screens/11-END.png). Every screen also has a `-1600x900` copy in the folder.
- Fine as given: O1, S01 (Dana's face clear of both panels), W1 (screen and paper stack), W2 (the woman with her phone; the man at the top right sits just above the panel), S18 (the laptop and notebook; the shoulder on the right, as expected), S22 and END (the woman at the process wall).
- No position changed. A 16:9 photo (1600 x 893) on the 1280 x 720 stage has only about 10 px to spare horizontally, and none vertically. At 1600 x 900 it has none horizontally and about 170 px vertically. "position" therefore barely moves anything, and no other value showed more of the subject.
- Focus: S04 [1280](screens/12-S04.png) and S16 [1280](screens/13-S16.png). The wash still reads well: the photo shows as a place, and the text and columns stay readable (test:fit contrast passes).

## 4. Not fixable by position alone
- **W3** ([1280](screens/05-W3.png), [1600](screens/05-W3-1600x900.png)): both faces in ch4-hr-demo sit at the top left, under the question card, and the man's head is cut by the bar. Moving the image cannot bring them out. Options: a new crop or image with the people on the right half, or mirror the image so the people sit in the clear middle strip.
- **W4, S14, S15** ([W4](screens/06-W4.png), [S14](screens/07-S14.png), [S15](screens/08-S15.png)): the manager's face in ch5-critical-eye falls in the narrow gap between the left card and the right panel. It shows partly (on W4 through the glass card). The hands, the printed process map and the laptop are clear. A better fit needs the person further left or right in the image.

## 5. SOURCES.md
New section "MD1 (25 Oct 2026)": generator, processing, originals folder, and a table of file | screens | processing | reuse/new. The prompts were not pasted into this run, so each new file says "prompt in MD1 handoff, 25 Oct".

## Tests (all green)
check passed (59) · test:fit --sizes=1280x720,1600x900 passed (568) · walk passed (588) · test:review passed (20).

Weekly usage (all models) after: 20%.
