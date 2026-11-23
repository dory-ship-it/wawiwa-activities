# The self-study kit

The shared code of Wawiwa's code-built self-study lessons: a fixed 16:9 stage (1280 x 720, scaled like a Storyline player), one content JSON per lesson, SCORM 1.2 for Blossom, GitHub Pages for Rise. This folder is the **only place shared code is edited**. A lesson holds its words, its pictures and films, its own look, and a copy of the kit.

Plan and rules: `Desktop\Wawiwa\Self- Study\Self-Study Standard\KIT-PLAN.md` and `STANDARD.md`. Screen types: [CATALOG.md](CATALOG.md). What changed: [CHANGELOG.md](CHANGELOG.md).

## What is in the kit

| Path | What it holds |
|---|---|
| `src/` | the engine (`engine.js`: stage, routing, Next / Previous, scoring, finish), shell (`zones.js`, `menu.js`), state and its SCORM-safe codec (`state.js`), tracking (`tracking/`, SCORM 1.2 and local), the coach (`coach/`, offline tips and the live coach frame), the ghost hand (`ghost.js`), tooltips, drag, the personal path (`adapt.js`), film and audio speeds (`speeds.js`), the lesson's settings (`config.js`, from the lesson's `kit.json`) |
| `src/templates/` | every screen type of both pilots (EAI M1 L4 and DM M2 L2): see CATALOG.md |
| `src/tokens.css`, `src/fonts.css`, `src/base.css` | tokens (the only hex values), self-hosted fonts, the layout and ground kit. **No rule names a screen id.** |
| `src/review/` | review mode (`?review=1`), the review page (`review.html`), the word counter. Never in the SCORM package |
| `profiles/` | one file per course: its tokens and look, and the options its lessons may choose. `dm.css` (Digital Marketing), `eai.css` (Implementor) |
| `shell/` | `index.html` and `review.html`, filled from the lesson's `kit.json` and content by `kit:sync` |
| `assets/` | the fonts and the Wawiwa logo |
| `tools/` | `check`, `stamp`, `serve`, `test-fit`, `check-overflow`, `walk` (+ `walk-lib`), `test-review`, `shots`, `states` (+ `state-helpers`), `package-scorm`, the SCORM mock, `sync` |
| `tools/eai/` | the EAI pilot's own tests (coach, live coach, personal path, LMS origin, wrong-answer walk), kept here until EAI moves onto the kit (step 3); not copied into lessons yet |

## A lesson on the kit

```
<lesson>/
  kit.json          which kit version and profile, and the lesson's own settings (below)
  kit.lock.json     written by kit:sync: every kit file and its hash
  content/<x>.json  every word the learner sees
  lesson.css        this lesson's own look, as named options (screen.styles), never by screen id
  templates/        only screen types this lesson invents (none in DM M2 L2)
  tests/            states.mjs (its screen states), walk.mjs (its keyboard walk), check.mjs (its own rules), review.mjs (optional)
  assets/           photos, films, audio
  src/, tools/, index.html, review.html, assets/fonts, assets/logo   the kit's copy: never edit
```

`kit.json` (the DM copy as the example):

```json
{
  "kit": "0.1.0", "profile": "dm",
  "id": "dm-m2l2-lesson", "scormId": "dm-m2l2-selfstudy", "code": "M2L2",
  "content": "content/m2l2.json",
  "storageKey": "wawiwa.dm.m2l2.lesson", "idPrefix": "M2L2_", "port": 8141,
  "hub": { "course": "dm", "lesson": "m2l2" },
  "coach": { "url": "https://dory-ship-it.github.io/wawiwa-activities/digital-marketing/dm-m2l2-coach/", "caseKeys": [] },
  "review": { "coachScreen": "S06" },
  "templates": []
}
```

| Field | What it does |
|---|---|
| `kit`, `profile` | the kit version the lesson is synced at, and its course profile (`profiles/<profile>.css`) |
| `id`, `scormId` | the SCORM zip name (`dist/<id>-scorm12.zip`) and the manifest's identifier (`wawiwa-<scormId>`) |
| `code`, `idPrefix` | the lesson code (review page title, the per-browser keys `<code>-speed`, `<code>-review-notes`) and the interaction id prefix (`M2L2_S07_1`) |
| `content`, `storageKey`, `port` | the content file, the localStorage key outside an LMS, the local server's port |
| `hub` | the lesson's page in the team hub: review.html's "Back to the hub" opens `../../self-study-hub/#/<course>/<lesson>` |
| `coach.url`, `coach.caseKeys` | the live coach page (empty: offline tips only; framed only after the live-AI gate in wawiwa-policies) and the store keys of the learner's own case fields sent to it |
| `review.coachScreen`, `review.coachNote` | the screen review.html shows the coach states on, and the line under that row |
| `templates` | the lesson's own screen-type modules (paths from the lesson root) |

### Get the kit, update the kit

```powershell
npm run kit:sync
```

It copies `src/`, the profile, `tools/`, the fonts and logo, writes `index.html` and `review.html`, stamps the lesson and writes `kit.lock.json`. It stops if a kit file was edited inside the lesson. To move a lesson to a newer kit, on purpose, then run every test:

```powershell
npm run kit:sync -- --to=0.2.0
```

A fix to shared code is made here, in `_selfstudy-kit`, the version in `package.json` goes up, and each lesson syncs when its owner chooses. A live lesson never changes by itself. `npm run check` fails if a kit file in a lesson differs from its lock, or if `src/` or `tools/` hold a file that is not the kit's.

### The tests (from the lesson's folder)

| Command | What it checks |
|---|---|
| `npm run check` | content, word budgets, dashes, icons, tokens and contrast, image slots, tracking, the score, the coach, the version stamp, no screen id in any stylesheet or kit module, the kit copy unedited, the lesson's own rules (`tests/check.mjs`) |
| `npm run test:fit` | every screen in every state at 1280 x 720 and 1024 x 576 (`-- --all`: wide windows too); the menu; the coach panel (offline, `live=0`) |
| `npm run check:overflow` | every state at three sizes: nothing out of its panel, no overlap, nothing on the nav row (long: run it in the background, or `-- --only=S05,K1`) |
| `npm run walk` | the lesson's keyboard walk (`tests/walk.mjs`) |
| `npm run test:scorm` | the same walk against a mock SCORM 1.2 API, then a relaunch |
| `npm run test:review` | review mode writes nothing; review.html shows every screen and its slim top line |
| `npm run shots` | a screenshot of every state into `planning/shots/` |
| `npm run package` | `dist/<id>-scorm12.zip` |

After a change to `content/`, `lesson.css` or `templates/`: `npm run stamp`, then `npm run check`.

## Rules the kit keeps (from STANDARD.md)

- **No styling by screen id** in shared files or in a lesson. A screen's special look is an option its content names (`"styles": ["case-heading"]`), defined in the base, the profile or the lesson's `lesson.css`.
- **The score** comes from the scored questions spread along the lesson: every graded interaction with `scored: true` (the film stops too) counts by its one answer; neutral ones never count. Pass mark 80. **One attempt, no retake** (`completion.retake: true` brings the EAI pilot's retake back, and `check` warns). A final check is optional. `lesson_status` is `incomplete` until the finish, then `passed` (sticky) or `failed` with the score (Noy, 23 Nov 2026: "Show failed"); `cmi.core.exit` is always `suspend`.
- **Film and audio speeds**: 0.5, 0.75, Normal, 1.25, 1.5, 2, kept for the session.
- **review.html** has one slim line at the top: "Back to the hub" and "Open as a learner", nothing else.
- Learner text only in the content; hex colours only in token blocks; no italics; no em or en dashes; 14 px text, 44 px targets, 4.5:1 contrast.
