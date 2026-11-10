# HANDOFF 4 - EAI M4 practice pages, Guy QA (10 Nov 2026)

Written by Claude (Cowork) for Claude Code. Two text fixes from Guy's QA report on EAI Module 4.
Text-only. No layout, coach or engine change. Dor approved: "run everything that remains" (10 Nov 2026).

## 1. M4-30: eai-m4l7-home title
File: `enterprise-ai-implementation/eai-m4l7-home/index.html`
Replace all 3 occurrences (`<title>`, `<h1>`, activity JSON `"title"`):
- `Home practice 7: finish the project file and the one-page handover`
- -> `Home practice: finish the project file and the one-page handover`
Why: every other page is titled "Home practice: ...".
If `Curriculum/outputs/eai_m4/make_m4l7_pages.py` (on the drive) holds the same string, change it there too, so a rebuild does not bring it back.

## 2. M4-08: eai-m4l1-home "six items" vs four fields
File: `enterprise-ai-implementation/eai-m4l1-home/index.html`
The page asks for "One page, six items" (slide 29 lists six) but has four fields.
Replace all 3 occurrences of `One page, six items` with `One page, six items in four fields`.
(Line 262 reads "Slide 29. One page, six items, at the next session" -> "Slide 29. One page, six items in four fields, at the next session".)
Do not split fields.

## Checks
- `grep -c "Home practice 7" eai-m4l7-home/index.html` = 0
- `grep -c "six items in four fields" eai-m4l1-home/index.html` = 3
- Pages still parse: the activity JSON block loads (open both pages locally).
- Commit message: `EAI M4: Guy QA M4-08, M4-30 (practice page text)`.

Then Dor pushes in GitHub Desktop. Rise embeds do not change (same URLs).
