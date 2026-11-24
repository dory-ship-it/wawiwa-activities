# EAI M1 L4 on the kit: Process Modeling and Workflow Mapping

A copy of `enterprise-ai-implementation/eai-m1l4-selfstudy-v3` (the live lesson, unchanged) rebuilt on the shared self-study kit (`_selfstudy-kit`, kit 0.1.0, profile `eai`), with the code items of `Self-Study Standard/EAI-FIX-LIST.md` part A. KIT-PLAN.md step 3. When Noy approves it, its files can replace the live folder's, so the live link (Rise, the hub) stays the same; the SCORM zip is made again from it.

## What is this lesson's own

| Path | What it holds |
|---|---|
| `kit.json` | the kit version and profile, and this lesson's settings (content file, storage key `wawiwa.eai.l4.slice`, id prefix `L4_`, the live coach page and the ten case fields, port 8131, hub ids `eai/m1l4`, the photo manifest) |
| `content/l4-slice.json` | every word the learner sees; `content/coach/grounding-pack.md` |
| `tests/` | `states.mjs` (every screen state, the personal path's levels too), `walk.mjs` (the keyboard walk), `adapt.mjs` (the personal path scenario) |
| `assets/img/` | the photos the content names and their prompt notes (`prompts/v2/PHOTO-SET.md`) |
| `assets/video/` | the round-12 films V1 and V2 (Noy approved, 23 Nov 2026; from `EAI film upgrade/full/r12/lesson` and `v2/r12/lesson`): mp4, captions, poster, cues |
| `planning/` | the v3 lesson's notes (text only) |

The films are the lesson's own (round 12, in `assets/video/`), so they are in the SCORM zip; the live v3 lesson still loads the old ones from `../eai-m1l4-selfstudy-v2/`. Screenshots of each film and stop: `planning/shots-films/`.

Everything else (`src/`, `tools/`, `index.html`, `review.html`, fonts, logo) is the kit's copy: change `_selfstudy-kit`, then `npm run kit:sync`.

## Preview and tests

```powershell
npm run serve
```

Then `http://127.0.0.1:8131/review.html` or `http://127.0.0.1:8131/?reset=1`. Tests: check, test:fit, check:overflow, walk, test:scorm, test:review, test:coach, test:coach-live, test:adapt, test:lms-origin (after `npm run package`); see `_selfstudy-kit/README.md`.
