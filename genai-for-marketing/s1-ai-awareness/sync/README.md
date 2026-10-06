# One-click sync: Google Slides → interactive

The SME keeps working in his deck. A menu in the deck, **Wawiwa → Send to interactive**, reads the
slides he changed and opens a Pull Request on GitHub that changes only `content/s1.json` (and any new
images under `assets/deck/`). Dor reads the plain-language change list and presses **Merge**. GitHub
Pages deploys in about a minute and the Rise embed shows the new version. Rise is never touched.

## Setting it up (once, about 10 minutes)

1. Open the SME deck in Google Slides (the master, not a copy): *Wawiwa AI for Marketing Training Session 1*.
2. **Extensions → Apps Script.** Delete the sample code. Create two files with exactly these names and paste:
   - `Code.gs` ← `sync/apps-script/Code.gs`
   - `appsscript.json` ← `sync/apps-script/appsscript.json` (first turn on *Project Settings → Show "appsscript.json" manifest file*).
3. Create the GitHub token (Dor only): GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate.
   Resource owner: `dory-ship-it`. Repository access: *Only select repositories* → `wawiwa-activities`.
   Permissions: **Contents: Read and write**, **Pull requests: Read and write**. Expiry: one year.
4. In the Apps Script editor: **Project Settings → Script Properties → Add property**: name `GITHUB_TOKEN`, value = the token. Save.
   The token lives only there. Do not paste it anywhere else (not in the deck, not in chat).
5. Reload the deck. The **Wawiwa** menu appears. Run **Wawiwa → Check connection** once and approve the permissions Google asks for (read this presentation, connect to an external service). It reports the repo, the slide count and how many slide titles match a screen (expect 40 slides, 33 matches).
6. Run **Wawiwa → Send to interactive** once. The first run is the **baseline**: it records which deck slide feeds which screen and what the deck says today. It changes no screen text. Merge that PR.

## Everyday use

The SME edits the deck. Someone (the SME or Dor) runs **Wawiwa → Send to interactive**. A PR appears
listing, per screen: old text → new text, replaced images, slides that are new in the deck (not added),
and changed text that has no place in the interactive (not applied). Dor merges. Done.

Nothing is pulled from slides that did not change since the last sync, even if the interactive was
edited later. That is the "newer wins" rule.

## Flags Dor will see in a PR

- **⚠ check: replaces self-study wording** — screens 12 and 33 carry wording rewritten for self-study
  (the 2026 statistics, "Send the list to your trainer"). A deck change on those slides is still pulled,
  so Dor sees it before merging and can edit the PR or close it.
- **New slides in the deck, not in the interactive** — listed, never added automatically.
- **Changed text that has no place in the interactive** — the deck has instructor-only text
  (for example "Share a brief intro…"); changes there are listed but not applied.

## How the mapping works

- `sync/deck-mapping.json` names, per screen, the deck slide title(s) that feed it. Screen 7 is fed by
  two deck slides and screen 8 by four (the timeline years were spread over several slides in the deck).
  The first run resolves titles to Google Slides objectIds and writes them into `content/s1.json`
  as `deckSlideId` (a list when a screen is fed by several slides). Titles may change afterwards.
- Within a slide, each text box is matched to the screen's text by its words (exact match first, then
  a similarity score). The match is stored in `content/last-sync.json` next to the text seen, so later
  runs know what changed and where it goes. Images are matched by order and stored with a fingerprint;
  a changed image is uploaded to `assets/deck/` and the screen's image reference is updated.
- The build check (`.github/workflows/s1-check.yml`, running `tools/check.mjs`) must be green on the PR:
  33 screens, every referenced file present, no year in a footer, "Confidential" spelled right.

## If something goes wrong

- *"GITHUB_TOKEN is not set"* → step 4.
- *GitHub … 401/403* → the token expired or lacks Contents/Pull requests write on this repo.
- *A slide's title changed before the first run* → fix the title in `sync/deck-mapping.json`, merge, run again.
- *A text change went to the wrong place* → edit `content/s1.json` in the PR before merging, or close the
  PR, fix the key in `content/last-sync.json`, and run again.
