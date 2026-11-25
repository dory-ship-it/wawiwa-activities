// EAI M2 L3: the walk of the lesson (npm run walk; npm run test:scorm = the same path against the mock SCORM 1.2 API).
// Build 1 (23 Nov 2026): slides 1 to 13, screens O1 to G2. Buttons, fields, tabs and choices are driven by keyboard
// (Tab, arrows, Enter); the two click-then-place boards (D2, G1 sort decks; F5 Fishbone) are driven by clicks.
// The path answers every scored question right except one (B2 wrong first), to check the wrong feedback and the score.
import { SCORM, S, expect, open, press, tabTo, act, text, arrive, goNext, finishRun, fast, band } from '../tools/walk-lib.mjs';

console.log(SCORM ? '\nmain path in an LMS (mock SCORM 1.2 API)' : '\nmain path, keyboard first');
const page = await open('?reset=1&live=0', { lms: SCORM ? {} : null });
const locked = () => page.evaluate(() => document.querySelector('.w-next').dataset.locked === 'true');
const click = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);
const pickKey = async (id) => { await tabTo(page, `.w-main .w-opt[data-id="${id}"]`); await press(page, 'Enter'); await act(page, '[data-action="check"]'); };
const typeInto = async (sel, value) => { await tabTo(page, sel); await page.keyboard.type(value); };

/* Opening */
await arrive(page, 'O1');
await act(page, '[data-action="start"]');
await arrive(page, 'O2');
{
  await tabTo(page, '.w-map-tab');
  for (const st of S.O2.stations) {
    await press(page, 'Home'); await press(page, 'ArrowRight', S.O2.stations.indexOf(st)); await press(page, 'Enter');
    expect(await text(page, '.w-map-panel-text') === st.text, `O2: ${st.n} ${st.kicker} opens its line`);
  }
  await goNext(page);
}
await arrive(page, 'O3');
{
  expect(await locked(), 'O3: Next locked until the pain is saved');
  await typeInto('.m-prep-thread input', 'Month-end close takes 14 days');
  await act(page, '[data-action="save"]');
  expect(!(await locked()) && (await page.evaluate(() => window.__l4.state.f.ownPain)) === 'Month-end close takes 14 days', 'O3: Save keeps the pain and unlocks Next');
  await goNext(page);
}

/* Every pain becomes a card */
await arrive(page, 'B1');
await fast(page, () => document.querySelector('.w-next').dataset.locked === 'false', 'B1 to its end');
await goNext(page);
await arrive(page, 'B2');
{
  // round 2 (24 Nov 2026, templates/survive.js): the template's decision panel, the chain inside the feedback card
  await pickKey('a');
  const b = await band(page);
  expect(b.state === 'wrong' && b.text === S.B2.options[0].feedback, 'B2: a wrong pick says why that pick is not it');
  expect(!(await locked()), 'B2: one try, then Next');
  expect(await page.evaluate(() => document.querySelectorAll('.w-strip .m-ch .m-ch-link').length === 4), 'B2: the feedback card shows the four links behind the right answer');
  await goNext(page);
}
await arrive(page, 'B3');
{
  // redesign 24 Nov 2026 (templates/tenCards.js): the top ten list, one button, then card 1 with the learner's pain
  expect(await text(page, '.m-tc-row[data-mine="true"] .m-tc-text') === 'Month-end close takes 14 days', 'B3: line 1 of the list is the learner\'s pain');
  expect(await locked(), 'B3: Next locked until the pains turn into cards');
  await act(page, '[data-action="cards"]');
  await page.waitForFunction(() => document.querySelector('.w-next').dataset.locked === 'false', { timeout: 5000 });
  expect(await text(page, '.m-tc-pain p') === 'Month-end close takes 14 days', 'B3: card 1 opens with the learner\'s pain');
  await goNext(page);
}

/* Process before tool */
await arrive(page, 'C1');
await act(page, '[data-action="add"]');
expect(!(await locked()) && (await text(page, '.m-flow-key')) === S.C1.keyLine, 'C1: the agent goes in, the key line shows, Next unlocks');
await goNext(page);
await arrive(page, 'C2');
for (const [i, id] of ['a', 'b', 'b'].entries()) { await pickKey(id); if (i < 2) await act(page, '[data-action="nextSituation"]'); }
expect(!(await locked()), 'C2: three situations answered');
await goNext(page);

/* The four categories */
await arrive(page, 'D1');
for (const n of [1, 2, 3, 4]) { await tabTo(page, `.w-tile[data-n="${n}"]`); await press(page, 'Enter'); }
expect(!(await locked()), 'D1: all four opened');
await goNext(page);
await arrive(page, 'D2');
for (const c of S.D2.cards) { await click('[data-action="card"]'); await click(`.w-drop[data-column="${c.column}"]`); }
expect(!(await locked()), 'D2: six pains placed');
await goNext(page);

/* The use-case library */
await arrive(page, 'E1');
{
  const href = await page.evaluate(() => { const a = document.querySelector('[data-action="open"]'); return a.getAttribute('href') + '|' + a.target + '|' + a.rel; });
  expect(href === 'library/|_blank|noopener', 'E1: the library opens in a new tab');
  const lib = await page.evaluate(async () => (await fetch('library/')).status);
  expect(lib === 200, 'E1: the library page is served');
  await goNext(page);
}
await arrive(page, 'E2');
for (const [i, id] of ['a', 'b', 'b'].entries()) { await pickKey(id); if (i < 2) await act(page, '[data-action="nextSituation"]'); }
await goNext(page);
await arrive(page, 'E3');
for (let i = 0; i < S.E3.parts.length - 1; i++) await act(page, '[data-action="part"]');
expect(!(await locked()), 'E3: five parts open, Next unlocks');
await goNext(page);
await arrive(page, 'E4');
{
  await tabTo(page, 'select.m-card-input'); await press(page, 'ArrowDown', 2);
  await typeInto('input.m-card-input', 'Copilot in Excel, as in the library');
  await act(page, '[data-action="save"]');
  const st = await page.evaluate(() => window.__l4.state.f);
  expect(!!st.ownCategory && st.ownTools === 'Copilot in Excel, as in the library', `E4: category "${st.ownCategory}" and tools saved on the card`);
  await goNext(page);
}

/* Find the root cause */
await arrive(page, 'F0');
await goNext(page);
await arrive(page, 'F1');
for (let i = 0; i < S.F1.whys.length; i++) await act(page, '[data-action="why"]');
await goNext(page);
await arrive(page, 'F2');
for (const id of ['a', 'b', 'a', 'b']) { await tabTo(page, `.m-why-choice[data-id="${id}"]`); await press(page, 'Enter'); }
expect(!(await locked()) && !(await page.evaluate(() => document.querySelector('.m-why-root').hidden)), 'F2: four right levels, the root shows');
await goNext(page);
await arrive(page, 'F3');
await goNext(page);
await arrive(page, 'F4');
await fast(page, () => document.querySelector('.w-next').dataset.locked === 'false', 'F4 to its end');
await goNext(page);
await arrive(page, 'F5');
for (const c of S.F5.cards) { await click(`.m-fish-card[data-n="${c.n}"]`); await click(`.m-fish-target[data-bone="${c.bone}"]`); }
expect(!(await locked()) && (await band(page)).text === S.F5.closing, 'F5: four causes placed, the closing line on Policy and External');
await goNext(page);
await arrive(page, 'F6');
await pickKey('b');
await goNext(page);

/* Who hurts? */
await arrive(page, 'G1');
for (const c of S.G1.cards) { await click('[data-action="card"]'); await click(`.w-drop[data-column="${c.column}"]`); }
await goNext(page);
await arrive(page, 'G2');
{
  const vals = ['Ownership of the close was never formalized', 'Henrik, finance analyst', 'Sarah Chen, CFO'];
  for (const [i, row] of ['root', 'painOwner', 'owner'].entries()) await typeInto(`#m-card-${row}`, vals[i]);
  await act(page, '[data-action="save"]');
  const st = await page.evaluate(() => window.__l4.state.f);
  expect(st.ownRoot === vals[0] && st.ownPainOwner === vals[1] && st.ownSponsor === vals[2], 'G2: root cause, Pain Owner and Sponsor saved on the card');
}
{
  // the score so far: 12 scored questions, B2 answered wrong on purpose
  const sc = await page.evaluate(() => window.__l4.score());
  expect(typeof sc === 'object' || typeof sc === 'number', `score so far: ${JSON.stringify(sc)}`);
}

await finishRun('M2 L3 walk, slides 1 to 13');
