# wawiwa-activities (student practices embedded in Rise 360)

Self-contained practice pages, published by GitHub Pages from `main` at https://dory-ship-it.github.io/wawiwa-activities/ . Rise embeds these live URLs. Rules on where to work: /Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-content-os/docs/WHERE-TO-WORK.md

- A change is live only after: commit, Dor pushes, the Pages deploy succeeds. If the deploy failed (GitHub outage), Actions → the failed run → "Re-run all jobs".
- Every new practice is registered in `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json`, then `npm run pages` in wawiwa-video regenerates the embed-code sheet. Check the run prints `also refreshed in …` (Dor opens `~/Downloads/Wawiwa - Practice Embed Codes.html`).
- Measure `embedHeight` with the Assistant font installed, at widths 1000 and 760, take the taller +16px. Re-measure after any visual change. 1400 is a placeholder, not a value.
- Rise blocks do not update by themselves: after a height or URL change, Dor re-pastes the embed code.
- Practice films and pages teach the method; they never reveal answers.
