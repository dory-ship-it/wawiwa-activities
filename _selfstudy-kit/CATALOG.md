# Screen types (CATALOG)

Every screen type the kit's engine knows: the `TEMPLATES` object in `src/engine.js`. Read from the template
code itself (`src/templates/*.js`), `src/review/words.js`, `src/tracking/describe.js` and `tools/check.mjs`
(23 Nov 2026). Where the code and this file disagree, the code wins.

## 1. What a screen type is

A lesson is one content JSON (`kit.json` "content"). Each screen in it is one object. Its `template` names
the screen type; the template draws the screen from the object's fields and decides what Next waits for.
A lesson may add its own types (kit.json `"templates"`: module paths); none of the two pilots does.

### Fields every screen has

`*` = required.

| Field | What it holds |
| --- | --- |
| `id`* | The screen id (`S11B`, `K1`). Used in the review URL and in interaction ids. |
| `template`* | A key of `TEMPLATES` (below). |
| `variant` | The sub-type, for the types that have variants. The engine also uses it to pick the locked Next label (`ui.footer.locked[variant]`). |
| `chapter`* | The chapter id. Gives the bar its chapter and steps, and the default photo. |
| `step` | `{ verb, icon }`: this screen's step in the top bar. `{ join: true }`: shares the step of the screen before it. |
| `instruction`* | The h1. Never counted in the word budget. Some types rewrite it (see each entry). |
| `presentation` | `true`: the screen is done on arrival and Next never locks. Types that never unlock Next themselves need it. |
| `hint` | The hint line, given to the feedback band (for screen readers: no Hint link on screen, STANDARD 1.5). Counted as a feedback line. |
| `coach` | `{ kind, tip }`. `kind` picks the AI coach panel's opening line (`practice` by default; the pilots use `hello`, `idea`, `practice`, `workbook`, `review`, `own`; `locked` locks the coach, as on the final check). `tip` answers the chip "What do I do here?". |
| `photo` | `{ src, position, mirror, place }`, or `false` for no photo at all. Without it: the chapter's photo. `place` (DM) says where the photo is calm, so the text block goes there. |
| `ground` | `{ kind, side, size, tone }`: the screen's ground (section 4). Without it the template's scene decides. |
| `scene` | `"stage"` moves a decision screen (single, close) onto the Stage scene. Only `decision` reads it. |
| `styles` | Named options for this screen's look (section 3). A string or a list. |
| `tracking` | The screen's interactions (below). `[]` when nothing is sent. |
| `sources` | Where the content came from (deck slides, research). A record for the team: no kit code reads it. |
| `words` | `{ max, why }`: this screen may go over its word budget, and why. `tools/check.mjs` lists it as a WARNING. |

The engine also reads, when present: `minutes` (weight in the progress bar), `locked`, `lockedNext` and
`needLine` (what a locked Next says), `upNext`, `endOfChapter` (shows the chapter's pause marker),
`terms` (tooltip terms), `variants` (PP1 personal path: a variant per level), and most interactive types
read `ghost: { type, target, delay, showMe }` for the "Show me how" hand.

### Tracking entries

`tracking: [{ id, type, correctResponse, scored, bloom, result }]`

- `id`: `<idPrefix><screen>_<n>`, for example `M2L2_S07_1` (a final `b` for a check item's second version).
- `type`: `choice`, `matching` or `fill-in`.
- `correctResponse`: the key in the response encoding of that type (each entry says which). `null` when
  neutral. `tools/check.mjs` (function `keyOf`) recomputes it from the content and fails on a mismatch.
- `scored`: `true` or `false`. `bloom`: `Remember`, `Understand`, `Apply`, `Analyze`, `Evaluate`, `Create`.
- `result`: `graded` (there is a right answer) or `neutral` (any answer is fine).
- `multiple: true` is required on a `choice` whose key has more than one answer (`"a,c"`).
- Screens with several questions (rounds, situations, rows, check items) declare every id here and point
  to it with `trackingId` on the round. A film's stops carry their own `tracking` object.

### The scoring rule

A tracking entry with `result: "graded"` and `scored: true`, on a screen in the lesson's slice, counts
toward the lesson score: the questions along the lesson, including film stops. Each counts by its first
and only answer (one attempt). Score = right answers out of scored questions, 0 to 100. Pass mark 80.
A `neutral` entry never counts (`tools/check.mjs` fails if one is marked scored). Every lesson needs at
least one scored question. Older options the EAI pilot still uses: `completion.scoredScreens` (count only
those screens), `completion.pointsPerItem` (points per right answer, capped at 100), `completion.retake`.

### Word budgets (`src/review/words.js`)

- Practice screen (anything answered or filled in): at most 35 words on screen, answer options not counted.
- Presentation screen (`presentation: true`, or a presenting type): at most 45 words.
- Each hint and feedback line: at most 20 words (the review page marks it; `tools/check.mjs` fails over it).
- A key line (`keyLine`): at most 15 words, at most one per screen (`keyLineWhy` explains an exception).
- The h1 and button labels are never counted. The presenting types: title, moduleMap, goals, opener,
  deliverable, concept, keyParts, keyColumns, video, result, end, closing, and bpmn `key`.

### How to look at a type ("See it")

Open a real example in review mode, from the `wawiwa-activities` root:

- DM: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=<ID>&review=1`
- EAI: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=<ID>&review=1`

The DM lesson runs on the kit. The EAI v3 lesson still runs its own copy of the engine (it has no
`kit.json` yet), so an EAI example may differ a little from the kit's current look.

Kinds used below: **Graded** (a right answer, may be scored), **Neutral** (sent, never scored), **Not
tracked** (interactive, nothing sent; state kept in the screen's flags), **Presentation** (nothing to do).

---

## 2. The types

### Frame and presentation

#### title
- For: the opening screen (O1). Dark, the photo under its veil, no footer: programme line, h1, the quote,
  and a Start button that goes to the next screen.
- Fields: `start`* (a key of `ui.buttons`), `program`, `kicker` (shown as "program · kicker"), `sub` (line
  under the h1), `quote` (its own quote marks are drawn, so typed ones are stripped).
- Kind: Presentation (set `presentation: true`). Words: 45.
- Used: DM O1 (with style `cover-fade`), EAI O1.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=O1&review=1`

#### moduleMap
- For: "Where we are" (O2). The module's lessons as stations on a line (ARIA tabs); the open one's line in a
  card under it. Today's lesson is open on arrival.
- Fields: `stations`* `[{ id, n, kicker, title, text, status, open }]` (`status`: `done`, `today`, or another
  status named in `ui.moduleMap.status`; `open: true` = open on arrival), `eyebrow`, `line` (under the h1),
  `cue` (`false` hides the "Click to open" cue), `ghost` `{ type, target, delay }`.
- Kind: Presentation (set `presentation: true`). Words: 45 (counted per open station).
- Used: DM O2, EAI O2.
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=O2&review=1`

#### goals
- For: the lesson's deliverable in a figure card and numbered goal tiles (ARIA tabs); the open goal's full
  wording in a card under the tiles.
- Fields: `deliverable`* `{ text*, label, icon }` (text: its first sentence bold), `goals`* `[{ id, label, text }]`,
  `eyebrow`.
- Kind: Presentation (set `presentation: true`). Words: 45.
- Used: neither pilot uses it now (EAI O3 moved to `deliverable`). No live example.

#### opener
- For: a chapter's first screen (W). A dark glass card over the full photo: h1, a lead line, the chapter's
  stops (icon, name, line), an end line. Builds up once.
- Fields: `lead`, `points` `[{ icon, title, text }]` (icons only when no point has a title), `end`, `number`
  (a big numbered square beside the title), `squareIcon` (an icon in that square instead), `label` (small
  line above the title, with number or squareIcon), `statement: true` (a statement opener: no stops, the
  lead large).
- Kind: Presentation (set `presentation: true`). Words: 45. Ground: `full` in both pilots.
- Used: DM W3 (number), W5 (squareIcon); EAI W1 (statement), W2 (stops).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=W3&review=1`

#### deliverable
- For: the deliverable as two big cards on the dark blur (v2 O3), with a foot line.
- Fields: `parts`* `[{ id, icon, title, text }]`, `label` (the pill), `text` (line under the h1), `foot` `{ icon, text }`.
- Kind: Presentation (set `presentation: true`). Words: 45.
- Used: EAI O3, K3.
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=O3&review=1`

#### concept
- For: a key idea (K1): the "Key idea" pill, h1, one line; two figure cards with drawn line art and an arrow
  between them; the evidence at the foot.
- Fields: `figures`* `[{ kind, label, caption, alt }]` (`kind`: `mess` or `lean`, the drawing), `evidence`*
  `{ text*, source, items }` (`items: [{ source, text }]` shows two source cards), `label`, `text`.
- Kind: Presentation (set `presentation: true`). Words: 45.
- Used: EAI K1.
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=K1&review=1`

#### keyParts
- For: a key idea in three numbered parts on a line (K2); a toggle adds each part's case line.
- Fields: `parts`* `[{ id, title, text, case }]`, `caseToggle`* (the toggle's label), `caseLabel`, `label`, `text`.
- Kind: Presentation (set `presentation: true`). Words: 45 (also counted with the case lines on).
- Used: EAI K2.
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=K2&review=1`

#### keyColumns
- For: a key idea as two columns, "good fit" and "poor fit" (K4), each a list of kinds with a check or cross.
- Fields: `columns`* `[{ id, kind, title, items*: [{ term, text, icon }] }]` (`kind`: `lean` = good, `mess` =
  poor; an item with `icon` gets an icon disc), `label`, `text`.
- Kind: Presentation (set `presentation: true`). Words: 45. EAI profile option: `rise-rows`.
- Used: EAI K4.
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=K4&review=1`

#### twoCols
- For: a slide's two columns and one key line (DM K5).
- Fields: `cols`* `[{ id, icon, title, text }]`, `keyLine`*.
- Kind: Presentation (set `presentation: true`). Words: 35, or 45 with `presentation: true`.
- Used: DM K5.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=K5&review=1`

#### stages
- For: a slide's stages shown one by one with a "more" button, beside the slide's box or the four-node
  board (DM S35, a summary).
- Fields: `stages`* (list of strings), `more`* (a key of `ui.buttons`), `box` `{ label, keyLine, lines }` or
  `board` `{ nodes, tick }` (one of the two is required), `flow: "row"` (a row of steps; the box comes after
  the last one), `eyebrow`.
- Kind: Presentation in use (S35 has `presentation: true`; the template never unlocks Next). Words: 35, or 45
  with `presentation: true`. DM profile option: `compact`. `variant: "summary"` on S35 is not read by the code.
- Used: DM S35.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S35&review=1`

#### closing
- For: a component closes (DM K2, K3, K6): its questions or its key line beside the four-node board, whose
  node gets its check; or the deck's closing quote alone.
- Variants: `questions` (the default: numbered questions, the board, a note line), `keyline` (one large key
  line, the board), `quote` (the key line alone, no board).
- Fields: `questions`* (questions), `keyLine`* (keyline, quote), `board`* (questions, keyline) `{ nodes: [{ id, n,
  title, status }], tick }` (`status`: `done`, `now`, `next`; `tick`: the node that gets its check now), `line`.
- Kind: Presentation (set `presentation: true`). Words: 45.
- Used: DM K2 (questions), K3 (keyline), K6 (quote).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=K3&review=1`

### Choice and decision

#### decision
- For: the kit's main choice type. Graded variants: select, then Check; one try, then the right answer
  and why. Neutral variants (selfcheck, risk, close): a click answers. Variants:
  - `single`: one right answer. Three layouts: a character's quote on Stage (`stage.top.kind: "character"`),
    a case card on the photo (`scene: "stage"`), or a Focus panel. `onePanel: true` puts the case and the
    question in one panel.
  - `multi`: pick N of four (2 x 2), Check locked until N are picked.
  - `pair`: one situation at a time in a raised card, two answers; "Next situation".
  - `rounds`: the rules as three icon cards (the answers); one map line per round; "Next round".
  - `fill`: a workbook page with a blank; the chosen line drops into it.
  - `metric`: four metrics; three slots (baseline, target, date) light up for the chosen one.
  - `selfcheck`: neutral; questions as a checklist with Yes / Not yet; a fix line if any is Not yet.
  - `risk`: neutral; read the options (name and line), pick any one.
  - `cases`: one case at a time, the same option cards; "Next case"; one matching interaction.
  - `fields`: workbook rows, a card chosen in each from a select; Check after all rows.
  - `close`: two steps: a neutral takeaway pick, then homework link, "Download my lesson record", "Finish lesson".
- Fields, shared: `options` `[{ id, label, correct, feedback, sub, icon, term }]`, `hint`, `stage.top`
  `{ text, eyebrow, highlight }` (the context line; `highlight` is set in bold).
  - single: `stage`*, `options`*, `onePanel`, `scene`, `band` (an explain band), `visual` `{ from, to, away, alt }`,
    `proof` `{ eyebrow, figure, text }` (a big-number card shown once solved). Character layout: `stage.top`
    `{ kind: "character", character, bubbles, label, context }` and `content.characters[character]`.
  - multi: `select`* (how many), `options`*, `stage`* (`top.text`, `bottom.action`: a `ui.buttons` key for
    Check), `feedbackCorrect`, `cases` `[{ image, label }]` (thumbnails above the cards).
  - pair: `situations`* `[{ id, text, hint, image, doneLabel, trackingId, options: [{ id, label, sub, preview,
    correct, feedback }] }]` (`preview`: `table` or `lanes` mini drawing).
  - rounds: `options`* `[{ id, label, icon, sub }]`, `rules`* `{ items }` (short names on the cards), `rounds`*
    `[{ id, badge, line, correct, feedback: { <optionId>: text }, trackingId }]`.
  - fill: `situation`* `{ text, icon }`, `fieldRows`* `[{ label, value, prefilled }]`, `options`*.
  - metric: `field`* `{ label }`, `slots`* `[{ id, label }]` (ids `baseline`, `target`, `date` get icons),
    `options`* with `checks: { <slotId>: true }`, `slotsTitle`, `slotsAfterChoice`, `context`, `band`.
  - selfcheck: `rows`* `[{ id, text, icon, feedback: { yes, notYet }, trackingId }]`, `choices`* (`["yes",
    "notYet"]`, `ui.buttons` keys), `link`* (a `ui.buttons` key; opens `@links.workbook`), `fixLine`, `stage.top.text`.
  - risk: `options`*, `strip` (the note line), `link`, `todayChip` (on options with `today: true`), `stage.top.text`.
  - cases: `cards`* `[{ id or n, text, column, feedback: { correct, wrong } }]`, `options`* (the column ids).
  - fields: `cards`* `[{ id or n, text, column, feedback: { correct } }]`, `columns`* `[{ id, label, sub, n }]`
    (the rows), `header` (a chip), `attempts` (default 2), `bank: false` (no lettered list; each row one
    question), `join` (words between item and select), `choose` (the select's empty label).
  - close: `options`*, `step2`* `{ bridge: { icon, text }, homework: { text, href }, instruction, feedback:
    { download, finishConfirm }, confirmFinish }`, `record` (which screens feed the lesson record).
- Tracking and encoding:
  - Graded `choice`, letter of the option in on-screen order (`"b"`): single, fill, metric, pair (one per
    situation), rounds (one per round). multi: letters joined (`"a,c"`), with `multiple: true`.
  - Graded `matching`, `"card.column"` pairs: cases and fields (`"1.map,2.metric"`).
  - Neutral `choice`: selfcheck (one per row), risk, close.
- Words: 35 (options not counted). Style `case-heading` fits a screen with a case line over the question.
- Used: DM S11B (single, scored), S32B (fields, scored); EAI S01, S20B (risk), S06 (pair), S08 (rounds),
  S10 (fill), S11 (metric), S14 (multi), S15, S18 (single), S17 (cases), S18A (fields), S20 (selfcheck), S22 (close).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S11B&review=1`,
  `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=S14&review=1`

#### warmup
- For: a warm-up guess (W1): the question on a glass card over the photo, "Not scored"; any pick is fine
  and can change. Next after a pick.
- Fields: `panel`* `{ title, chip }`, `options`* `[{ id, label }]`, `feedback`* `{ verdict, text }`, `tracking`* (one
  entry), `hint`.
- Kind: Neutral `choice` (letter); a changed pick goes out as a retry. Words: 35.
- Used: neither pilot now. No live example.

#### quiz
- For: a few rounds, each its own question and options; pick, Check, one try (DM S15B).
- Fields: `situations`* `[{ id, text, trackingId, options: [{ id, label, correct, feedback }] }]`, `hint`.
- Kind: Graded `choice`, one per situation (letter). Scored-capable. Set `variant: "pair"`: the template
  ignores it, but `tools/check.mjs` reads each situation's own options only for variant `pair`.
- Words: 35 (options not counted).
- Used: DM S15B (three scored rounds).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S15B&review=1`

#### client
- For: a client asks, the learner picks a reply, as a chat. A wrong reply gets the client's pushback and the
  right reply in the strip (DM S17C).
- Fields: `situations`* `[{ id, text, why, trackingId, options }]` (`why`: the client's pushback), `lead`, `hint`.
- Kind: Graded `choice`, one per situation. Scored-capable. Set `variant: "pair"` (as quiz).
- Words: 35 (options not counted).
- Used: DM S17C.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S17C&review=1`

#### caseFile
- For: the case as a file on the left, the question and answers on the right; after Check the answer slide
  takes the answers' place (the case folds to its title, a button shows it again).
- Fields: `title`*, `facts`* (list), `options`*, `answer`* `{ title, bullets, keyLine, compare: { label, items },
  small }`, `eyebrow`, `factTags` `[{ icon, label }]` (one per fact: each fact as a scannable row), `second`
  (a line under the h1), `hint`, `tracking`* (one entry).
- Kind: Graded `choice` (letter). Scored-capable. Words: 35 (options not counted).
- Used: DM S20, S22, S24.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S20&review=1`

#### dataTable
- For: a slide's report table; rounds of questions answered by clicking a row (DM S30). A cell `·` is a
  "no cost" dot that shows `dotNote`.
- Fields: `head`*, `rows`* (list of rows; first cell = the row's name), `total`*, `situations`* `[{ id, text,
  column, trackingId, options }]` (option k = row k; `column` highlights a column), `keyLine` (shown after the
  last round), `dotNote`, `eyebrow`, `hint`.
- Kind: Graded `choice`, one per situation (row letter). Scored-capable. Set `variant: "pair"` (as quiz).
- Words: 35.
- Used: DM S30.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S30&review=1`

#### poll
- For: one question with no right answer. Variants: `plain` (default, in a panel), `list` (beside the
  slide's lines), `reflect` (in a panel, as plain; the lesson's last question). `duel: true` = "this or that": two large cards.
- Fields: `options`* `[{ id, label, icon, feedback }]`, `eyebrow`, `quote`, `list`, `feedback` `{ any }`,
  `keyLine`, `after` `{ title, text, coach }` (shown after the pick), `finishes: true` (the pick finishes the
  lesson, as DM S38), `duel`, `hint`.
- Kind: Not tracked (the pick stays in the screen's flags; nothing goes to the LMS). Words: 35.
- Used: DM S26B (plain), S33 (list, duel), S38 (reflect, finishes).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S33&review=1`

### Sort and match

#### sortDeck
- For: sort cards into piles (Rise-style): one card at a time on a deck, piles below. Drag, click, or keys.
  Each drop is judged at once; a card wrong twice moves to its right pile, explained.
- Fields: `columns`* `[{ id, label, sub, icon, kind, width }]` (`kind`: `good` or `poor` tints), `cards`*
  `[{ id or n, text, column, tag, feedback: { correct, wrong, <columnId> } }]` (`tag`: why, shown on the
  placed card), `band` (a plain line under the h1), `feedbackBottom` (the feedback card between Previous and
  Next), `hint`, `ghost`, `tracking`* (one entry).
- Kind: Graded `matching`: each card's first pile, `"1.value,2.insight"`; one retry with the final piles if
  any first drop was wrong. Scored-capable. Words: 35 (cards not counted). EAI profile option: `tree-glow`.
- Used: DM S07 (scored); EAI S03, S04, S09, S16.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S07&review=1`

#### bpmn
- For: a process drawn as a BPMN diagram from `content.diagrams`. Variants:
  - `key`: the diagram with numbered markers and their key (a key idea).
  - `label`: drag labels onto "Drop here" targets on the diagram; each drop judged at once.
- Fields: `diagram`* (a key of `content.diagrams`: `{ lanes, nodes, edges, alt }`).
  - key: `key`* `[{ n, marker: [x, y], text }]` (text "Name: line"), `label`, `text`.
  - label: `targets`* `[{ id, rect: [x, y, w, h], chip: [x, y], name }]`, `labels`* `[{ id, code, text, target,
    feedback: { correct, wrong } }]` (`code`: one character), `dropLabel`*, `diagramAlt`, `hint`, `ghost`, `tracking`*.
- Kind: key = Presentation (set `presentation: true`), 45 words. label = Graded `matching`, `"s.a,g.b"`
  (label code . target), 35 words (labels not counted).
- Used: EAI S05a (key), S05b (label).
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=S05b&review=1`

#### flags
- For: place flags on a figure card by clicking a field or step (dragging still works). Variants:
  - `map`: a map of fields in two columns; flags go on the fields that show the risk (any order).
  - `line`: a process line of steps; a Start flag and an End flag, each its own step.
- Fields: `flags`* `[{ id, code, text, target, feedback: { <step>, other } }]`, `feedbackCorrect`*, `hint`,
  `flagLabel` (name when a flag has no text), `dragHelp` (a key of `ui.drag`), `ghost`, `tracking`*.
  - map: `map`* `[{ n, title, text, correct, feedback }]`, `context`.
  - line: `line`* `[{ n, text, icon }]`, `instructionEnd` (the h1 once Start is placed), `pair` `[{ label, text,
    tone }]` (two cards above the h1), `lead`.
- Kind: Graded. map = `choice`, the fields' numbers in order (`"4,7"`, needs `multiple: true`); line =
  `matching`, `"s.1,e.5"` (flag code . step). Words: 35 (targets and flags not counted). EAI option: `rise-line`.
- Used: EAI S12 (map), S13 (line).
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=S13&review=1`

### Boards and explore

#### explorer
- For: variant `tiles` only: a grid of tiles that open in place; after all are opened, an optional question
  where the tiles are the answers (one try).
- Fields: `tiles`* `[{ n, icon, title, back, correct, feedback }]`, `question` (none: opening all tiles is the
  task), `questionChip`, `questionHint`, `hint`, `ghost`, `tracking` (one entry, only with a question).
- Kind: Graded `choice` with a question (the tile's number, `"8"`); Not tracked without. Words: 35.
- Used: EAI S07.
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=S07&review=1`

#### bring
- For: a two-column table, "what you bring" and "what it becomes"; each right cell opens on click. Next after all.
- Fields: `head`* (two column names), `rows`* `[{ id, bring, becomes, keyLine }]` (a row's `keyLine` replaces
  `becomes`), `eyebrow`, `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Used: DM O3.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=O3&review=1`

#### revealTable
- For: a slide's three-column table; the middle cell of a row opens on click. Next after all rows.
- Fields: `head`* (three names), `rows`* `[{ id, channel, does, taught, icon }]`, `keyLine`, `small`, `eyebrow`,
  `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Used: DM S15.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S15&review=1`

#### goalCards
- For: coloured cards in a row; a click opens the card's line under the row. Next after all.
- Fields: `goals`* `[{ id, n, title, tone, text, keyLine }]` (`tone`: the card's colour), `eyebrow`, `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Used: DM S11.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S11&review=1`

#### dimensionMap
- For: a map of icon nodes on a line with a card under the selected one, and a detail view per node
  (question, values as chips, insight). Next after all are explored.
- Fields: `dimensions`* `[{ id, n, name, icon, question, values, insight }]`, `keyLine` (under the map),
  `showList` (the list of names in the detail view), `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Used: DM K1.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=K1&review=1`

#### questionTiles
- For: question tiles, one open at a time; each answered with Yes / No, chips, or read only; a closing line after all.
- Fields: `tiles`* `[{ n, question, kind, icon, note, image, options: [{ id, label, only }], text }]` (`kind`:
  `yesno`, `chips` or `text`; `only`: a chip that clears the others), `closing`* `{ keyLine, ifMissing: { tile,
  option, text } }`, `eyebrow`, `hint`, `ghost`.
- Kind: Not tracked. Words: 35 (chips not counted).
- Used: DM S05.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S05&review=1`

#### questionCards
- For: question cards, each marked "I can answer" or "Gap"; the card then shows where the answer lives.
  One card in focus at a time.
- Fields: `cards`* `[{ n, question, where }]`, `closing`* `{ keyLine, ifGap }`, `band`, `eyebrow`, `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Used: DM S06.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S06&review=1`

#### checklist
- For: a slide's list as toggles ("which have you seen?"), then Done and a closing line.
- Fields: `challenges`* `[{ id, text, icon }]`, `closing`* `{ keyLine, line }`, `eyebrow`, `hint`.
- Kind: Not tracked. Words: 35.
- Used: DM S14.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S14&review=1`

#### builder
- For: a table filled column by column; one button names the next column ("Add the next column: Goal").
- Fields: `columns`* `[{ id, label, chip }]` (the first column holds the row names), `rows`* (cells), `total`*
  `{ label, value }`, `cta`* (the button text, with `{name}`), `eyebrow`, `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Used: DM S17.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S17&review=1`

#### funnelCalc
- For: a funnel counted backwards from the sales the learner sets with a stepper. Next after one change.
- Fields: `stages`* `[{ n, name, sub, rate }]` (the last stage's rate is the goal rate), `stepper`* `{ label, value,
  min, max }`, `lines`*, `keyLine`, `ratesLabel`, `eyebrow`, `hint`.
- Kind: Not tracked. Words: 35.
- Used: DM S28.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S28&review=1`

#### infographic
- For: research blocks left, plan elements right, connector lines between them; clicking an element lights
  its sources. Next after `min` elements.
- Fields: `left`* `[{ id, title, sub, icon }]`, `right`* `[{ id, title, text, from }]` (`from`: left ids), `strip`*
  `{ label, items }`, `min`*, `keyLine`, `eyebrow`, `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Used: DM S32.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S32&review=1`

### Media

#### video
- For: a film on a clean dark ground, the player bar under it (play, time, track with stop markers, speed,
  CC, volume, transcript, full screen). At a stop the film pauses and a question panel opens; Resume after
  the answer. Next after the film ends and every stop is answered.
- Fields: `media`* `{ src*, duration*, captions*: [{ src }], poster, captionPlaces: [{ from, to, place }] }` (WebVTT
  captions; `place`: top, top-left, top-right, bottom-left), `title` (meta line and aria label), `showTitle:
  false`, `guidingQuestion` and `guidingLabel` (the "Watch for" line), `stops` `[{ id, t, question, options,
  tracking }]`, `ghost`.
- Kind: the film is not tracked; each stop is Graded `choice` (letter), scored-capable. Words: 45 (a stop's
  question counted with its options).
- Used: DM VK1, S16 (no stops), V1, V2 (two scored stops each); EAI V1, V2 (graded, not scored).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=V1&review=1`

#### podcast
- For: an audio player beside the script, line by line, the line being spoken marked; the slide's
  observations are the numbered lines. No seeking ahead until heard once. Next when the audio ends.
- Fields: `media`* `{ src, cues, duration }` (`cues`: a JSON file `{ items: [{ t, end }] }`, one per script line),
  `podcast`* `{ script: [{ voice, text }] }` (`voice`: `A` or `B`), `observations`*, `eyebrow`, `hint`.
- Kind: Not tracked. Words: 35.
- Used: DM S26.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S26&review=1`

#### call
- For: a phone rings; the learner answers; the client's recorded call plays and its lines appear as said.
  Next when the call ends.
- Fields: `media`* `{ src, ring, cues }`, `call`* `{ caller, image: { src }, script }` (script lines are the
  captions, not counted), `eyebrow`, `hint`, `ghost`.
- Kind: Not tracked. Words: 35.
- Sound: the ring is a sound effect (`ctx.sound`, src/sfx.js): only on this screen, started on the learner's first
  click or key when the browser refused it, silent while the bar's sound button is muted. A lesson with this type
  needs `ui.sound: { mute, unmute }` (the button's name and its "on" tooltip). The call itself is content: not muted.
- Used: DM CALL.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=CALL&review=1`

### Workbook and handoff

#### input
- For: the learner writes in labelled fields with a counter, then Save. Values are kept under store keys
  for later screens (copy cards, the lesson record).
- Fields: `stage`* `{ top: { text, show }, middle: { link, help: { text } }, bottom, privacy }` (`top.show`: a
  store key shown read-only; `help.text`: "Question? Answer" as a button with a tooltip; `bottom` and
  `privacy`: privacy or note lines), `fields`* `[{ label, store, trackingId, maxLength, placeholder, multiline,
  optional, width, demo }]`, `feedback`* `{ saved, empty, unticked }`, `arrange` (`chain`: fields on one line
  with arrows; `pair`: two side by side), `saveWhenFilled` (Save primary, enabled once filled), `headAbove`,
  `checkbox` (a line to tick before Save), `caseCard` and `caseKey` (the "Your case" card), `hint`, `ghost`.
- Kind: Neutral `fill-in`, one per field (the text, trimmed to 250 characters). Words: 35.
- Used: EAI S02, S08B (chain), S12B, S17B (pair), S18B (checkbox).
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=S02&review=1`

#### handoff
- For: sending the learner to the workbook. Variants:
  - `brief`: what the workbook is, three steps, one screenshot.
  - (none, "open"): Open workbook (new tab), copy cards of what the learner wrote earlier (Copy, or select
    and Ctrl+C when the clipboard is blocked). Next after Open.
  - `back`: "Did you export your PDF?" Yes opens Next; Not yet shows the reopen link.
- Fields:
  - brief: `steps`* `[{ n, text }]`, `image`*, `eyebrow`, `text`, `chip`.
  - open: `handoff`* `{ href, rel }`, `copyCards`* `{ label, cards: [{ id, from, label, chip, off }] }` (`from`: the
    input screen whose fields it copies), `privacy`*, `returnLine`, `openFeedback`, `eyebrow`, `chip`, `steps`,
    `preview` `{ alt, fields, fromNotes }`, `hint`, `ghost`.
  - back: `notYetLine`, `text` (links to `@links.workbook`).
- Kind: Not tracked. brief = Presentation (set `presentation: true`), 45 words; open and back 35.
- Used: EAI S19A (brief), S19B (open), S19C (back).
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=S19B&review=1`

#### workbookStop
- For: the same workbook panel each time: the workbook picture, the h1, one line, "Open the workbook" (new
  tab). First visit: Next after the button (honour system). Return visits (`presentation: true`): Next open,
  the button small with its own line.
- Fields: `image`*, `line`*, `handoff`* `{ href, rel }`, `openFeedback`, `again` (the return visit's line),
  `presentation`.
- Kind: Not tracked. Words: 35, or 45 with `presentation: true`.
- Used: DM WB0 (first), WB1 to WB4 (return).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=WB0&review=1`

#### homeStop
- For: the home practice: a picture, the slide's instructions, a key line, the link (new tab). Next after
  the link was opened.
- Fields: `image`*, `steps`*, `handoff`* `{ href, rel }`, `eyebrow`, `keyLine`, `line`, `openFeedback`.
- Kind: Not tracked. Words: 35.
- Used: DM S36.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=S36&review=1`

### Check and result

#### check
- For: the final knowledge check: items one at a time, the question as the heading, a click only selects,
  "Next question" sends it with no feedback. After the last item: the score is set and the screen turns into
  a read-only review with each answer's feedback.
- Fields: `items`* `[{ id, kind, stem, instruction, hint, options, tiles, select, trackingId, b }]`. A choice item:
  `stem` and `options: [{ id, label, correct, feedback }]`. A tiles item (`kind: "tiles"`): `instruction`,
  `tiles: [{ n, text, correct, feedback }]`, `select` (how many). `b`: a second version for a retake (own
  `trackingId`). Screen: `instruction` (the small "what to do" line above the stem; an item's `hint` replaces
  it), `reviewInstruction`*, `shuffleOnRetake`.
- Kind: Graded. Choice items send the option's `id`, so option ids must be `a`, `b`, `c`, `d` in on-screen
  order (the key is computed as letters). Tiles send numbers (`"3,6"`). Scored-capable. Words: 35 per item
  (options not counted). Set `coach.kind: "locked"` to lock the coach here.
- Used: DM CHK (five scored items); EAI S21 (six items, the only scored screen there).
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=CHK&review=1`

#### result
- For: the score after the check: a ring with the score, the pass mark as a tick, Passed / Not passed yet
  and a line; below the pass mark, the items missed with "Review Chapter N" links. "Retake now" only when
  `completion.retake` is true.
- Fields: `from`* (the check screen's id), `instruction`* (formatted with `{x}`, `{n}`, `{p}`), `passed`* and
  `notPassed`* `{ chip, text }`, `missed`* `[{ item, screen, stem, stemB, text }]`, `reviewLabel`* (with `{n}`),
  `ringAlt`* (with `{p}`), `passNote` (a small line under the h1).
- Kind: Presentation (set `presentation: true`); nothing tracked. Words: 45.
- Used: DM CHKR; EAI S21R.
- See it: `enterprise-ai-implementation/eai-m1l4-selfstudy-v3/index.html?screen=S21R&review=1`

### End

#### end
- For: the closing screen in the films' end-card style: logo, the big line, the status chip (no numbers),
  the next-step line, the homework link. Previous only, no Next.
- Fields: `instruction`* (the big line), `accent` (the word in it set in turquoise), `passed`* `{ chip }`,
  `notPassed`* `{ chip, hint }`, `sub`, `next`, `homework` `{ href }`.
- Kind: Presentation; nothing tracked (completion is set by Finish or a `finishes` poll). Words: 45.
- Used: DM END; EAI END.
- See it: `digital-marketing/dm-m2l2-lesson-kit/index.html?screen=END&review=1`

---

## 3. Options (screen.styles)

A screen's special look is a named option in its content: `"styles": ["case-heading"]`. The engine puts the
names on the stage (`data-styles`), and the CSS matches `[data-styles~="name"]`.
**No stylesheet may style a screen by its id** (`tools/check.mjs` fails on it); the engine's `data-screen`
is for tests and the review tools only.

| Option | Where it lives | Fits | What it does |
| --- | --- | --- | --- |
| `case-heading` | `src/base.css` (all profiles) | a question with a case line over it | One weight for both: the case line in ink, the question just under it in teal ink and a little smaller. |
| `compact` | `profiles/dm.css` | `stages` | Tighter stage cards, for four long sentences. |
| `rise-line` | `profiles/eai.css` | `flags`, variant `line` | The process line draws, then its steps rise one by one. |
| `rise-rows` | `profiles/eai.css` | `keyColumns` | The good-fit row, then the poor-fit row, rise in turn. |
| `opener-left` | `profiles/eai.css` | `opener` | The card on the left so the photo shows on the right; the veil darker on the card's side; photo at 5 px blur. |
| `tree-glow` | `profiles/eai.css` | `sortDeck` on the `dots` ground | A glow behind the deck, and a branching line from the card to the two piles. |
| `soft-panel` | `profiles/eai.css` | a right-hand sheet | The soft ground's centred, glowing panel without the soft tone. |
| `stack` | `profiles/eai.css` | soft tone (`ground.tone: "soft"`) | Two blocks stacked in reading order in the middle. |
| `stack-bridge` | `profiles/eai.css` | with `stack` (decision `close`) | The bridge card under the question. |
| `stack-pair` | `profiles/eai.css` | with `stack` (decision `single` with `proof`) | The proof beside the question after the right answer, as a pair. |
| `cover-fade` | the lesson's `lesson.css` (DM) | `title` | The near-square cover photo at the right, fading into the dark ground. |

A lesson's own options live in its `lesson.css`, named and described in its header, never by screen id.
In use now: DM O1 `cover-fade`, DM S11B `case-heading`, DM S35 `compact`. The EAI options carry the EAI v3
screen they came from (`[S13]` and so on in the header of `profiles/eai.css`); the EAI v3 lesson itself does
not name them yet, as it is not on the kit.

---

## 4. Grounds (screen.ground)

`ground: { kind, side, size, tone }`, read by `setScene` in `src/zones.js` and styled in `src/base.css`.
The photo is the screen's `photo` or its chapter's. The template's scene still sets text colours and panels.

| `kind` | What it is |
| --- | --- |
| `full` | The photo sharp under everything, the bar included (the bar turns translucent). Openers use it. |
| `half` | The photo on one side (`side: "left"` or `"right"`, 44% wide; `size: "narrow"` = 30%), a light ivory ground on the other, where the task sits. |
| `blur` | The light wash: the photo washed out under a light veil (the Focus look). |
| `darkblur` | The photo blurred under a dark veil. With `tone: "soft"`: a lighter veil, and the task in one centred panel lit at its edge. |
| `split` | The left 44% the photo, blurred and dark; the rest a light ivory ground. |
| `dots` | No photo: the stone ground with a dot grid. |

Without `ground`, the template's scene decides: `focus` (the default: the light wash), `stage` (the photo
sharp under the bar: decision with a character or `scene: "stage"`, warmup, opener, handoff `back`), `title` and `end` (the
photo under the dark title veil), `plain` (video: no photo). `photo: false` removes the photo on any ground.

Not ground kinds: `band` and `light` were FX5 scene looks, retired in FX8 (the engine keeps their branches,
but no template or ground asks for them). `framed` is a look of the retired FX7 composer (`.w-comp`), not a
ground.
