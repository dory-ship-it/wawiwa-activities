# HANDOFF from Cowork (23 Nov 2026): EAI M2 es-MX homework wording fix

Four Spanish homework pages said "bring to tomorrow's class" ("Trae a clase mañana"). IBERO meets Tue/Thu, so the wording now says "next class" ("Trae a la próxima clase"). Text change only, nothing else.

1. Copy these 4 files from the drive into the repo (overwrite):
   - `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Localization/EAI-M02-ES-MX/practices/m2l1-homework-question-bank-es/index.html` -> `enterprise-ai-implementation-es/m2l1-homework-question-bank-es/index.html`
   - `.../practices/m2l2-homework-second-department-es/index.html` -> `enterprise-ai-implementation-es/m2l2-homework-second-department-es/index.html`
   - `.../practices/m2l3-homework-opportunity-cards-es/index.html` -> `enterprise-ai-implementation-es/m2l3-homework-opportunity-cards-es/index.html`
   - `.../practices/m2l4-homework-shortlist-es/index.html` -> `enterprise-ai-implementation-es/m2l4-homework-shortlist-es/index.html`
2. Check: `git diff --stat` shows only these 4 files; `grep -c "mañana"` is 0 in each; the English folder `enterprise-ai-implementation/` is untouched.
3. Commit with `git commit --only` on those 4 paths: "EAI M2 es-MX: homework checklists say 'próxima clase' instead of 'mañana'". Push.
4. Rename this file to HANDOFF-done-2026-11-23b.md.
