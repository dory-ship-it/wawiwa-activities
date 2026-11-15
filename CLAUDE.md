# wawiwa-activities (student practices embedded in Rise 360)

Self-contained practice pages, published by GitHub Pages from `main` at https://dory-ship-it.github.io/wawiwa-activities/ . Rise embeds these live URLs. Rules on where to work: /Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-content-os/docs/WHERE-TO-WORK.md

- A change is live only after: commit, Dor pushes, the Pages deploy succeeds. If the deploy failed (GitHub outage), Actions → the failed run → "Re-run all jobs".
- Every new practice is registered in `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/wawiwa-video/deliverables.json`, then `npm run pages` in wawiwa-video regenerates the embed-code sheet. Check the run prints `also refreshed in …` (Dor opens `~/Downloads/Wawiwa - Practice Embed Codes.html`).
- Measure `embedHeight` with the Assistant font installed, at widths 1000 and 760, take the taller +16px. Re-measure after any visual change. 1400 is a placeholder, not a value.
- A fixed-stage page (a player, not a scrolling workbook) is designed at 16:9. Rise keeps only the `<iframe>` of an embed and shows it in its own 16:9 box (measured 889 x 500 in preview, 15 Nov 2026, React Hooks ES); a ratio-box wrapper (`embedRatio` in `deliverables.json`) had no effect. 1000:560 is close enough (2 px off); for any other ratio, say up front that Rise will not keep it.
- Rise blocks do not update by themselves: after a height or URL change, Dor re-pastes the embed code.
- Practice films and pages teach the method; they never reveal answers.
