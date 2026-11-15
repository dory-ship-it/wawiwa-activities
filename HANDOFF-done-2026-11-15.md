# HANDOFF 5 - EAI Module 5 practice pages, 14 new (15 Nov 2026)

Written by Claude (Cowork) for Claude Code. Dor asked (15 Nov 2026): build the M5 coached practice pages, put them in Rise, publish.
Cowork built and tested all 14 pages outside git. Your job is only to copy, register, commit. No content or engine change.

## 1. Copy 14 folders
From: `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/outputs/eai_m5/practice_pages/`
To:   `enterprise-ai-implementation/` in this repo (same folder names).

```bash
SRC="/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/outputs/eai_m5/practice_pages"
for n in 1 2 3 4 5 6 7; do for k in class home; do
  mkdir -p enterprise-ai-implementation/eai-m5l$n-$k
  cp "$SRC/eai-m5l$n-$k/index.html" enterprise-ai-implementation/eai-m5l$n-$k/index.html
done; done
```

md5 (first 12) to check after copying:
eai-m5l1-class 80bb4fa4aa0a, eai-m5l1-home 363c6a12060d, eai-m5l2-class 0898d4821628, eai-m5l2-home db730925cc46,
eai-m5l3-class 01b275f36c9c, eai-m5l3-home 0ce5bfce0e4a, eai-m5l4-class dec10c341eae, eai-m5l4-home b2c725ef0060,
eai-m5l5-class 7833c69c3ecb, eai-m5l5-home 1e5d72e497ec, eai-m5l6-class eca93f1d5631, eai-m5l6-home c295614fc6cc,
eai-m5l7-class f4d1ed4909e5, eai-m5l7-home 2fbe2e9e5bbe.

## 2. Register in deliverables.json
File: `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json`, array `practices`,
right after the `eai-m4l7-home` entry. Same shape as the M4 entries:
`{"folder", "title", "code": null, "section": "Enterprise AI Implementation Specialist (EAI)", "url", "embedHeight", "superseded": false}`.
url = `https://dory-ship-it.github.io/wawiwa-activities/enterprise-ai-implementation/<folder>/`

embedHeight was measured by Cowork with Assistant loaded, at widths 1000 and 760, taller + 16
(`Curriculum/outputs/eai_m5/practice_pages/_qa_15nov.json`):

| folder | title | embedHeight |
|---|---|---|
| eai-m5l1-class | The Agent World: Class Practice | 3950 |
| eai-m5l1-home | The Agent World: Home Practice | 2081 |
| eai-m5l2-class | Connecting Agents to Work: Class Practice | 4170 |
| eai-m5l2-home | Connecting Agents to Work: Home Practice | 2008 |
| eai-m5l3-class | Configure an Agent for a Business Need: Class Practice | 3820 |
| eai-m5l3-home | Configure an Agent for a Business Need: Home Practice | 2396 |
| eai-m5l4-class | Prove the Improvement: Class Practice | 4157 |
| eai-m5l4-home | Prove the Improvement: Home Practice | 1843 |
| eai-m5l5-class | Choosing a Solution for a Real Organization: Class Practice | 2980 |
| eai-m5l5-home | Choosing a Solution for a Real Organization: Home Practice | 2116 |
| eai-m5l6-class | Build a Custom Agent When It's Justified: Class Practice | 3844 |
| eai-m5l6-home | Build a Custom Agent When It's Justified: Home Practice | 2463 |
| eai-m5l7-class | From Pilot to Organization: Class Practice | 4314 |
| eai-m5l7-home | From Pilot to Organization: Home Practice | 2591 |

Then in wawiwa-video: `npm run pages`, and check it prints `also refreshed in ...`.

## 3. Checks
- `grep -c "eai-m4\|Vibe Coding\|Module 4" enterprise-ai-implementation/eai-m5l*/index.html` = 0 for every file.
- `grep -c "function tickCount(task)"` = 1 in every file.
- Open two pages locally: the activity JSON loads, "Check with AI Coach" answers.
- Cowork already ran: 14 pages x every coach button (empty, weak answer, good answer), personal path, Save as PDF; 0 JS errors
  (`Curriculum/outputs/eai_m5/practice_qa.js`).

## 4. Commit (two repos)
- wawiwa-activities: `EAI M5: 14 practice pages (class + home, L1-L7)`
- wawiwa-video: `EAI M5: register 14 practice pages`
Then Dor pushes both in GitHub Desktop. Rise already embeds these exact URLs (course xS_2kEIbNP9l0KQ5lBI5PBF5cRhlUW07);
the frames show "not found" until the push and the Pages deploy finish. Rename this file to HANDOFF-done-<date>.md when done.

## Source
Generator: `Curriculum/outputs/eai_m5/make_m5_pages.py` (spliced on the live eai-m4l7-class page: same CSS, coach engine,
proxy, PII redactor). Content = Guy's M5 decks only (v3.2.1 re-themed V1, slide numbers unchanged). Ledger CL-027.
