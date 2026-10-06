# RUN ON FABLE: GenAI for Marketing, Session 1 "AI Awareness" (Storyline block to code)

Written 6 Oct 2026 (planning side). Fable builds it in Claude Code, phase by phase. Do not skip the acceptance checks.

---

## סיכום בעברית (לדור)

**מה בונים:** את בלוק ה-Storyline הראשון בקורס "Generative AI for Marketing Professionals" ב-Rise. 33 שקפים. בונים אותו מחדש כקוד (דף אינטראקטיבי), כך שייראה **אותו דבר בדיוק**: אותן תמונות, אותם סרטונים, אותם קישורים ואותו עיצוב.
**מה משתנה:**
- בתחתית כל שקף יופיע "© Oded Israeli, Wawiwa Tech", בלי שנה.
- "Confidencial" יתוקן ל-"Confidential".
**תחזוקה בלחיצה:** המומחה (SME, כלומר מומחה התוכן) ממשיך לעבוד ב-Google Slides. בתוך המצגת שלו יופיע תפריט חדש: "Wawiwa ← Send to interactive". לחיצה עליו שולחת את השינויים, ואתה מאשר בלחיצה אחת ב-GitHub. אחרי כדקה הגרסה החדשה באוויר, באותו קישור ב-Rise.
**הכלל: תמיד הגרסה החדשה יותר.** לא משנה אם היא ב-Storyline או במצגת. בבנייה הראשונה:
- מסכים 13, 22 ו-28 נלקחים מהמצגת.
- מסכים 12 ו-33 נלקחים מה-Storyline.

מכאן והלאה, הכפתור מושך רק שקפים שהמומחה שינה מאז העדכון הקודם, כי הם בהגדרה החדשים יותר. כל שינוי מוצג לך ברשימה לפני שהוא עולה לאוויר.

---

## 1. Source of truth

| What | Where |
|---|---|
| Published Storyline block (the look to match) | https://articulateusercontent.com/rise/courses/u6F2CaAVqzPA3JIrEUdVK_JMr64_Zz38/LEvy_sRc0XLCnMpP/story.html |
| Rise course | "Generative AI for Marketing Professionals: Upskilling Hands-On Workshop", lesson 1 "Introduction and Transformation of Marketing by Generative AI" (course id u6F2CaAVqzPA3JIrEUdVK_JMr64_Zz38) |
| SME deck (raw, instructor version) | https://docs.google.com/presentation/d/1pEF6x4tl2XomhR46jyQQd2Uo1PBYEQwPGDZEanZWpCc/edit ("Wawiwa AI for Marketing Training Session 1") |
| No `.story` source file exists on Dor's drives | Work from the published output only |

Original tracking: completion = slides viewed (scoring type "view"). No quiz score is sent to the LMS. Nothing is lost by moving to code.

## 2. Dor's decisions (stated 6 Oct 2026)

1. Must look the same: the real photos, links and design. Only names and years change.
2. Footer on every screen: `© Oded Israeli, Wawiwa Tech`, with no year. (It currently reads "2024 © Oded Israeli, Wawiwa Tech".)
3. Slide 1 footer: "Confidencial" becomes "Confidential".
4. Maintenance must be one click, driven by the SME's Google Slides and his examples.

## 3. Folder (in git)

`wawiwa-activities/genai-for-marketing/s1-ai-awareness/`

```
tools/fetch-assets.mjs        downloads every asset from the published block (already written)
source/storyline-published/   output of fetch-assets (original files, untouched)
content/s1.json               ALL text, image refs, links, per screen (the only file sync writes)
src/                          engine + screen components (design never read from content)
sync/apps-script/             the Google Slides menu (Code.gs + appsscript.json)
.github/workflows/            build check on the sync PR
index.html                    built page (GitHub Pages serves it)
```

## 4. Phases

Run one phase per session. Commit and stop after each. No parallel sub-agents.
- P0 (download assets): a light, normal-effort run is enough. It is one script.
- P1-P3 (engine, 33 screens, sync): Fable, high effort.
- P4-P5: Fable, normal effort. The side-by-side review in P5 goes back to the planning model (Opus).

### P0: Assets
- Run `node tools/fetch-assets.mjs` on Dor's Mac. It crawls data.js and every slide file, and pulls every `story_content/` and `mobile/` file, plus the captions and the 3 web-object HTML files.
- Accept when: the "FAILED" list is empty. Every image, video and mp3 named in section 6 is on disk. Open 5 random images and 2 videos and check they play.
- Read the stage size and colours from `data.js` (`display` and `colorGroups`) and the theme frame images (the 7 assets repeated on every slide). Do not guess them.

### P1: Engine and frame
- A fixed 16:9 stage, scaled to fit the Rise column like the Storyline player. Same frame artwork, same fonts (the original uses Open Sans and Lato, so self-host both).
- Navigation: Prev and Next, a progress bar, a slide menu, keyboard arrows, swipe on phones. Slide transitions must match the original's feel. No added flourish.
- Footer component, written once and used on every screen: `© Oded Israeli, Wawiwa Tech`.
- Learner name (used on screen 33): an optional first-name field on the start screen, kept only in the browser (localStorage, inside try/catch). If it is empty, the greeting drops the name.

### P2: Screens (match section 6 one by one)
Interaction types to build as reusable components:
- `cover-video`: animated video background with a START button.
- `media-text`: text plus a photo or video.
- `timeline-slider`: drag a slider and each year reveals its card (screens 7 and 8).
- `reveal`: click to reveal (screens 11, 29 and 30).
- `carousel`: an image carousel with arrows (screen 16).
- `audio-hotspots`: speaker icons that play mp3s (screen 21).
- `youtube`: an embedded YouTube video (screens 18, 19 and 20, using youtube-nocookie).
- `drag-drop`: drag a label onto a role, with Correct/Incorrect feedback layers and the original wording (screen 28).
- `table`: screen 31.
- `agenda`: screens 5 and 32.
- `finale`: screen 33.
- External links open in a new tab.

### P3: One-click sync from Google Slides
- `content/s1.json`: each screen has `deckSlideId` (the Google Slides objectId it comes from, or `null`), plus fields. A separate file, `content/last-sync.json`, holds the deck text seen at the last sync.
- Newer-wins rule (section 7): only slides changed in the deck since the last sync are pulled. Screens 12 and 33 are flagged in the PR as "check: replaces self-study wording".
- Apps Script bound to the SME deck adds the menu **Wawiwa → Send to interactive**. It reads the text and images of the mapped slides by objectId, exports the images, and opens a GitHub Pull Request that changes only `content/s1.json` and the new images.
- The PR description is a plain-language change list: screen number, old text, new text.
- Dor clicks **Merge**. The build check runs, Pages deploys (about 45 seconds), and the Rise embed shows the new version. Rise itself is never touched.
- New SME slides that have no mapped screen are listed in the PR as "new slide, not in interactive". They are never auto-added.
- Secret: a fine-grained GitHub token, limited to this repo and "contents + pull requests", stored in Script Properties. **Dor creates and pastes it. Claude never handles it.**

### P4: Publish into Rise
- Live URL: `https://dory-ship-it.github.io/wawiwa-activities/genai-for-marketing/s1-ai-awareness/`
- Register it in the Rise embed sheet (`npm run pages`; see the rise-embed-sheet rule). Use iframe embed code, not a URL.
- Embed it inline in the same spot as the Storyline block, at the same visual size. It needs no print or download, so the new-tab rule is not needed here.
- Keep the Storyline block hidden, not deleted, until Dor approves the side-by-side review.

### P5: Acceptance (all must pass)
1. Side-by-side screenshots of all 33 screens (original vs new) at desktop and phone widths, in one review page for Dor.
2. Every photo, video, audio clip, GIF and link from section 6 is present and works. The Perplexity link opens.
3. The drag-drop gives correct and incorrect results using the original answer logic. Read the correct pairs from slide `6loab8d8O3J.js`; do not invent them. The deck's extra labels follow the deck's pairing; if it is unclear, stop and ask Dor.
4. No year appears in any footer. "Confidential" is spelled correctly.
5. Sync test: change one unlocked word in a COPY of the SME deck, then run the menu. A PR appears with exactly that change. Merging it puts the change live.
6. Basic accessibility: keyboard-only playthrough works; alt text is carried over from the original; captions are on for the avatar videos.

## 5. What Fable must NOT do
- Must not redesign, "modernise" or restyle. The original look is the spec.
- Must not remove or alter any third-party branding in the photos or videos.
- Must not paste any NotebookLM or Gemini watermark into new images. There should be none, because all assets come from the original.
- Must not change content wording beyond the footer and the "Confidential" fix.

## 6. Screen map (33 screens, from the published block)

| # | Title | Interaction / media | Deck slide |
|---|---|---|---|
| 1 | AI awareness - Generative AI for Marketing Professionals | cover-video (animated bg mp4), START | cover |
| 2 | Nice to meet you… | photo collage (4 photos) | "Nice to meet you…" |
| 3 | Our Learning Goals | 4 goals + VEED avatar video "Learning Goals Avatar" | Learning Goals |
| 4 | Introduction and Transformation of Marketing by Generative AI | section opener "1" | section 1 |
| 5 | What we'll cover today… | agenda (staggered build) | What we'll cover today |
| 6 | What is Artificial Intelligence? | definition + 6 examples + image | What is AI |
| 7 | Evolution of AI - 1950's | timeline-slider 1950/1956/1965/1972/1979 | 1950s + 1960-70s |
| 8 | Evolution of AI - 1980's | timeline-slider 1986/1997/2005/2009/2011/2016/2022 + Neural Network panel + Google Trends image | 1980s → 2022 |
| 9 | What is Machine Learning? | text + image | ML |
| 10 | What is Generative AI? | text + image | GenAI |
| 11 | Narrow vs. General AI | reveal (Narrow / General / AGI) | Narrow vs General |
| 12 | Why are we making a drama over AI? | 3 stats + "Drama over AI" video | Drama (Storyline stats newer) |
| 13 | Evolution of GenAI Technologies | LLM list + screenshot | GenAI tech |
| 14 | A ChatGPT Poem | 2 screenshot crops, "Generate with AI" | ChatGPT poem |
| 15 | A Perplexity Market Research | clickable image → perplexity.ai + Avatar IV video | Perplexity |
| 16 | Images | carousel (5 images) | Images |
| 17 | Image to few-second Video | text + 2 GIFs | Image to video |
| 18 | Deep Fake is becoming EASY…… Viggle.ai | YouTube fyfJESrlHZE | Deep Fake |
| 19 | Video: avatars are taking front stage… | YouTube FDzMuncXeeE + caption line | Avatars |
| 20 | Video | YouTube IqxEmPBqdlo + "Kling and Seedance…" | Video |
| 21 | Audio and Songs | audio-hotspots (3 speakers) | Audio |
| 22 | Today, there's an AI Tool for Everything! | 3 tool logos | Tool for everything |
| 23 | How is GenAI transforming marketing? | section opener (photos) | section |
| 24 | What is the role of Marketing in organizations? | 8 roles | Role of Marketing |
| 25 | What is the role of AI in Marketing? | same 8 roles, AI-highlighted | Role of AI |
| 26 | Marketing tasks made easy or different | two lists + 2 images | Tasks |
| 27 | Transition of marketing roles | role lists + CMO line | Roles 1 |
| 28 | Transition of marketing roles | drag-drop (6 roles × deck's 6 labels) + "Drag and drop" VEED video + Correct/Incorrect layers | Roles 2 (deck newer) |
| 29 | Impact on Marketing Processes | reveal: Research / Social Media / Design, before vs "With AI" | Impact 1 |
| 30 | Impact on Marketing Processes (con't) | reveal: Brochures / Video / Data | Impact 2 |
| 31 | Recommended AI Stack for Marketing | table + 5 logos | AI Stack |
| 32 | 1. Intro to AI & Impact on Marketing / What's next? | agenda of 5 sessions | What's next |
| 33 | What can you do towards the next session, {name}? | finale + image | Next session (Storyline newer) |

Deck-only slides that are **not** in the interactive, and stay out (instructor-led only): Oded's bio "I'm Oded, nice to meet you!", "Share a brief intro…", "What to expect…", "Coffee break?".

## 7. Rule: the NEWER version always wins (Dor, 6 Oct 2026)

Whether the newer content is in the Storyline or in the deck, it is the one we use.

**First build: take these differences as decided:**

| Screen | Use | Why it is the newer one |
|---|---|---|
| 12 | Storyline: 78% use AI (2026); 77% reskilling (2025); 59% need training by 2030, 11% left behind | 2026 data vs the deck's 2025 WEF figures |
| 13 | Deck: keep the LLM list AND add "What can LLMs do nowadays?" (Reasoning, Multimodal, Coding, Data analysis, Agents, Browsing, Image generation) | added to the deck later; current capabilities |
| 22 | Deck: "(and Photoshop, ChatGPT, Ideogram, …)" | Dall-E is retired; the deck's line is current |
| 28 | Deck: 6 labels including "AEO + Do faster, more" (map it to SEO Specialist) | AEO was added later; the goals screen already says SEO / AEO |
| 33 | Storyline: "Set up an account on ChatGPT", "Send the list to your trainer" | rewritten for self-study after the deck |

**Sync rule from then on:** the sync stores the deck text it saw on the last sync, one value per mapped slide. On each new sync, it pulls only slides the SME changed since then, because those are newer by definition. A slide he did not touch never overwrites the interactive, even where the interactive was edited later. A changed slide that hits a field we edited on purpose for self-study (screens 12 and 33) is still pulled into the PR, but flagged "check: replaces self-study wording", so Dor sees it before merging. This replaces the "locked" idea in P3.

## 8. Still owed after the build (planning side)
- New Content OS skill: "Storyline block to code", following this route, and add it to the plugin.
- A short briefing for Noy on how the sync button works.
