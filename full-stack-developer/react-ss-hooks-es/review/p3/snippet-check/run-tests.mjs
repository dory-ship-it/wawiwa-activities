// P3 snippet check: runs every code card of the built practices, exactly as the strings files hold it,
// in a throwaway Vite + React app (dev server, StrictMode on, as a learner's project).
// Copy this file into the lab folder and run it there (see README.md):
//   node run-tests.mjs <path to react-ss-hooks-es>
// Each screen with code becomes a folder src/p3/<page>.<lang>.<screen id>/ holding its files under their
// own names, byte for byte. A card with no test fails the run. What the tests expect is read from the
// same strings (the paste screen's expected lines, the value screen's expected answer, the right option),
// so a text that promises something the code does not do fails here.
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import vm from 'node:vm';

const lesson = process.argv[2];
if (!lesson) { console.error('usage: node run-tests.mjs <path to react-ss-hooks-es>'); process.exit(1); }
const PAGES = ['p1-usestate', 'p2-useeffect', 'p3-limpieza', 'p4-useref', 'p5-hooks-propios', 'checkin'];
const LANGS = ['es', 'en'];
const API = 'https://jsonplaceholder.typicode.com';

// 1. Write each code card into the lab, byte for byte.
const dir = join(process.cwd(), 'src', 'p3');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const put = (name, file, lines) => { mkdirSync(join(dir, name), { recursive: true }); writeFileSync(join(dir, name, basename(file)), lines.join('\n') + '\n'); };
const cards = [];
for (const page of PAGES) for (const lang of LANGS) {
  const sb = { window: {} };
  vm.runInNewContext(readFileSync(join(lesson, page, `strings.${lang}.js`), 'utf8'), sb);
  const P = sb.window.RH_PAGE;
  for (const s of P.screens) {
    const code = s.code || s.copy;
    if (!code) continue;
    const files = Array.isArray(code) ? code : [code];
    const name = `${page}.${lang}.${s.id}`;
    files.forEach((c) => put(name, c.file, c.lines));
    cards.push({ name, page, lang, id: s.id, files, s, by: (id) => P.screens.find((x) => x.id === id) });
  }
}
// The lab app loads one card file on demand, so files written while the tests run are found too.
writeFileSync(join(process.cwd(), 'src', 'App.jsx'), [
  "import { useEffect, useState } from 'react';",
  "export default function App() {",
  "  const [C, setC] = useState(null);",
  "  const [shown, setShown] = useState(true);",
  "  useEffect(() => {",
  "    const q = new URLSearchParams(location.search);",
  "    import(/* @vite-ignore */ `/src/p3/${q.get('c')}/${q.get('f')}`).then((m) => setC(() => m.default));",
  "  }, []);",
  "  if (!C) return <p>loading the card</p>;",
  "  return <div><button id=\"unmount\" onClick={() => setShown(!shown)}>hide or show</button><div id=\"card\">{shown && <C />}</div></div>;",
  "}",
].join('\n') + '\n');

// Test-only components (never shown to a learner) for the two hooks, which render nothing by themselves.
const apiHarness = [
  "import { useState } from 'react';",
  "import { useDataApi } from './useDataApi';",
  "export default function Harness() {",
  "  const [url, setUrl] = useState(new URLSearchParams(location.search).get('url'));",
  "  const { data, isLoading, error } = useDataApi(url);",
  "  return (",
  "    <div>",
  `      <button onClick={() => setUrl('${API}/users/1')}>to user 1</button>`,
  "      <p>{isLoading ? 'loading' : error ? error.message : data ? (Array.isArray(data) ? data[0].name : data.name) : 'empty'}</p>",
  "    </div>",
  "  );",
  "}",
];
const twoHarness = (key, first, second) => [
  "import { useLocalStorage } from './useLocalStorage';",
  "function Box({ id }) {",
  `  const [value, setValue] = useLocalStorage('${key}', '${first}');`,
  `  return <div><span id={'t' + id}>{value}</span><button id={'b' + id} onClick={() => setValue('${second}')}>change</button></div>;`,
  "}",
  "export default function Two() { return <div><Box id=\"1\" /><Box id=\"2\" /></div>; }",
];

// 2. Run them.
const server = await createServer({ root: process.cwd(), server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-first-run', '--user-data-dir=' + join(process.cwd(), '.chrome-profile-tests')],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}: ${JSON.stringify(got)}${ok ? '' : '  (expected ' + JSON.stringify(want) + ')'}`);
};
const note = (label, got) => console.log(`  NOTE  ${label}: ${JSON.stringify(got)}`);
const span = (text, n = 0) => [...text.matchAll(/`([^`]+)`/g)][n][1];

async function open(name, file, { before, query = '', api = false } = {}) {
  const page = await browser.newPage();
  const logs = [], errors = [], reqs = [];
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'log') logs.push(t);
    else if ((m.type() === 'error' || m.type() === 'warning') && !(api && t.includes('Failed to load resource'))) errors.push(t);
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('request', (r) => { if (r.url().startsWith(API)) reqs.push(r.url()); });
  if (before) await before(page);
  await page.goto(`http://localhost:5199/?c=${name}&f=${file}${query}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#card', { timeout: 5000 }).catch(() => {});
  return {
    page, errors, reqs,
    take: () => logs.splice(0),
    text: (sel) => page.$eval('#card ' + sel, (e) => e.textContent).catch(() => null),
    click: async (sel, n = 1) => { for (let i = 0; i < n; i++) { await page.click('#card ' + sel); await sleep(70); } },
    done: async (label = 'console errors and warnings') => { check(label, errors, []); await page.close(); },
  };
}
// Starts each page with clean storage (the browser profile is shared by all the tests).
const cleanStorage = (seed) => async (page) => {
  await page.evaluateOnNewDocument((s) => {
    if (sessionStorage.getItem('__ready')) return;
    localStorage.clear();
    if (s) localStorage.setItem(s[0], s[1]);
    sessionStorage.setItem('__ready', '1');
  }, seed || null);
};
const delayApi = (ms) => async (page) => {
  await page.setRequestInterception(true);
  page.on('request', (r) => { if (r.url().startsWith(API)) setTimeout(() => r.continue(), ms); else r.continue(); });
};
const noNetwork = async (page) => {
  await page.setRequestInterception(true);
  page.on('request', (r) => { if (r.url().startsWith(API)) r.abort('internetdisconnected'); else r.continue(); });
};

const tests = {
  // P-1
  async 'p1-usestate/predice'(c) {
    const run = async (name, want, label) => {
      const t = await open(name, 'Counter.jsx');
      check(label + 'number at mount', await t.text('p'), '0');
      await t.click('button', 3);
      check(label + 'number after 3 clicks', await t.text('p'), want);
      await t.done();
    };
    await run(c.name, '3', '');
    // The "after" line: the same card with the updater form, to measure the number it promises.
    put(c.name + '.updater', 'Counter.jsx', c.files[0].lines.map((l) => l.replace('setCount(count + 1);', 'setCount((c) => c + 1);')));
    await run(c.name + '.updater', c.s.after.match(/(\d+)\.?$/)[1], 'updater form, the "after" line: ');
  },
  async 'p1-usestate/solucion'(c) {
    const msg = c.files[0].lines.join('\n').match(/<p>(.*?)<\/p>/)[1];
    const t = await open(c.name, 'ShowHideMessage.jsx');
    check('message at mount', await t.text('p'), msg);
    const label = await t.text('button');
    await t.click('button');
    check('message after 1 click', await t.text('p'), null);
    check('button label changed after 1 click', (await t.text('button')) !== label, true);
    await t.click('button', 2);
    check('message after 3 clicks (null = hidden, the answer the Compara screen expects)', await t.text('p'), null);
    await t.click('button');
    check('message after 4 clicks', await t.text('p'), msg);
    await t.done();
  },

  // P-2: the same card on three screens. What it prints is compared with the paste screen's expected lines.
  async 'p2-useeffect/predice-clic'(c) {
    const paste = c.by('pega'), want = (g) => paste.expected[g].lines.map((k) => paste.known[k].text);
    const t = await open(c.name, 'ThreeEffects.jsx');
    await sleep(200);
    check('console at mount', t.take(), want(0));
    await t.click('button');
    check('console after one click on +1', t.take(), want(1));
    await t.page.type('#card input', 'ab', { delay: 60 });
    await sleep(150);
    check('console after typing 2 letters', t.take(), want(2));
    const names = (s) => s.options.filter((o) => o.correct).map((o) => span(o.text));
    check('right options of the first prediction = what the click printed', names(c.by('predice-clic')), want(1));
    check('right options of the second prediction = what one letter printed', names(c.by('predice-letra')), [...new Set(want(2))]);
    await t.done();
  },
  async 'p2-useeffect/predice-letra'(c) { await tests['p2-useeffect/predice-clic'](c); },
  async 'p2-useeffect/ejecuta'(c) { await tests['p2-useeffect/predice-clic'](c); },
  async 'p2-useeffect/solucion'(c) {
    const loading = c.files[0].lines.join('\n').match(/: '([^']+)'\}/)[1];
    const t = await open(c.name, 'FirstUser.jsx', { before: delayApi(500) });
    check('first screen, while the answer is on its way', await t.text('p'), loading);
    await sleep(2500);
    check('name shown (the answer the Compara screen expects)', await t.text('p'), c.by('compara').expected[0]);
    check('requests in development (the note says 2)', t.reqs.length, 2);
    await t.done();
  },

  // P-3
  async 'p3-limpieza/predice-consola'(c) {
    const run = async (name) => {
      const t = await open(name, 'WindowSize.jsx');
      await sleep(200); t.take();
      await t.page.setViewport({ width: 900, height: 700 }); await sleep(250);
      await t.page.setViewport({ width: 800, height: 700 }); await sleep(250);
      const a = t.take().length;
      await t.page.click('#unmount').catch(() => {}); await sleep(150); t.take();
      await t.page.setViewport({ width: 700, height: 700 }); await sleep(250);
      return { t, got: [a, t.take().length] };
    };
    const base = await run(c.name);
    check('lines printed by 2 resizes, then by 1 resize after hiding', base.got, [4, 2]);
    await base.t.done();
    if (c.id !== 'predice-falta') return;
    // The three options of "what is missing", each applied to the card and run.
    const lines = c.files[0].lines, at = lines.findIndex((l) => l.includes('addEventListener'));
    const code = (o) => span(o.text), insert = (line) => [...lines.slice(0, at + 1), '    ' + line, ...lines.slice(at + 1)];
    const right = c.s.options.find((o) => o.correct);
    const now = c.s.options.find((o) => !o.correct && code(o).startsWith('window.'));
    const deps = c.s.options.find((o) => code(o).startsWith('['));
    put(c.name + '.right', 'WindowSize.jsx', insert(code(right)));
    const r = await run(c.name + '.right');
    check('with the right option: 2 resizes, then 1 resize after hiding', r.got, [2, 0]);
    await r.t.done();
    put(c.name + '.now', 'WindowSize.jsx', insert(code(now)));
    const n = await run(c.name + '.now');
    check('with "remove it right after adding it": 2 resizes, then 1 after hiding', n.got, [0, 0]);
    await n.t.done();
    put(c.name + '.deps', 'WindowSize.jsx', lines.map((l) => l.replace('}, []);', `}, ${code(deps)});`)));
    const d = await run(c.name + '.deps');
    note('with "' + code(deps) + ' in the array": lines printed', d.got);
    note('with "' + code(deps) + ' in the array": errors', d.t.errors.map((e) => e.split('\n')[0].slice(0, 120)));
    await d.t.page.close();
  },
  async 'p3-limpieza/predice-falta'(c) { await tests['p3-limpieza/predice-consola'](c); },
  async 'p3-limpieza/solucion'(c) {
    const paste = c.by('pega'), want = (g) => paste.expected[g].lines.map((k) => paste.known[k].text);
    const t = await open(c.name, 'App.jsx');
    await sleep(500);
    check('console on load', t.take(), want(0));
    const clock = [await t.text('p')];
    for (let i = 0; i < 3; i++) { await sleep(1000); clock.push(await t.text('p')); }
    check('the clock, once a second (the "by 1" option)', clock, ['0', '1', '2', '3']);
    await t.click('button'); await sleep(150);
    const hide = t.take();
    check('console on hide', hide, want(1));
    check('the timer is hidden', await t.text('p'), null);
    await t.click('button'); await sleep(150);
    const show = t.take();
    check('console on show', show, want(2));
    check('from the click on hide = the order screen\'s answer', [...hide, ...show], c.by('predice-orden').answer);
    await t.done();
  },

  // P-4
  async 'p4-useref/predice-clics'(c) {
    const right = span(c.s.options.find((o) => o.correct).text);
    const t = await open(c.name, 'RefVsState.jsx');
    const [stateBtn, refBtn] = await t.page.$$('#card button');
    for (let i = 0; i < 2; i++) { await refBtn.click(); await sleep(70); }
    check('after 2 clicks on ref +1', await t.text('p'), right.replace(/\d/g, '0'));
    for (let i = 0; i < 2; i++) { await stateBtn.click(); await sleep(70); }
    check('then 2 clicks on state +1 (the right option)', await t.text('p'), right);
    await t.done();
  },
  async 'p4-useref/solucion'(c) {
    const f = await open(c.name, 'FocusInput.jsx');
    check('focused element before the click', await f.page.evaluate(() => document.activeElement.tagName), 'BODY');
    await f.click('button');
    check('focused element after the click', await f.page.evaluate(() => document.activeElement.tagName), 'INPUT');
    await f.done();
    const p = await open(c.name, 'PreviousValue.jsx');
    await p.click('button', 5);
    const shown = await p.text('p');
    check('after 5 clicks, the two numbers shown (' + shown + '); the second is what the Compara screen expects', shown.match(/\d+/g), ['5', c.by('compara').expected[0]]);
    await p.done();
  },

  // P-5
  async 'p5-hooks-propios/predice-storage'(c) {
    const card = c.files.find((x) => x.file.endsWith('Greeting.jsx')).lines.join('\n');
    const greet = card.match(/<h1>(.*?)\{/)[1] + card.match(/\|\| '([^']+)'/)[1];
    const key = span(c.s.question, 1), word = span(c.s.question, 0);
    const t = await open(c.name, 'Greeting.jsx', { before: cleanStorage([key, word]) });
    await sleep(200);
    check(`with ${word} (no quotes) stored by hand, the screen`, await t.text('h1'), greet);
    check('and the storage now holds', await t.page.evaluate((k) => localStorage.getItem(k), key), '""');
    await t.done();
  },
  async 'p5-hooks-propios/solucion'(c) {
    const card = c.files.find((x) => x.file.endsWith('Greeting.jsx')).lines.join('\n');
    const hello = card.match(/<h1>(.*?)\{/)[1], key = card.match(/useLocalStorage\('([^']+)'/)[1];
    const stored = (t) => t.page.evaluate((k) => localStorage.getItem(k), key);
    const g = await open(c.name, 'Greeting.jsx', { before: cleanStorage() });
    await g.page.type('#card input', 'Vale', { delay: 40 }); await sleep(150);
    const value = await stored(g);
    check('typed Vale, the storage holds', value, '"Vale"');
    check('that text passes the rule of the Compara screen', new RegExp(c.by('compara-storage').pattern).test(value), true);
    check('the same text with no quotes does not', new RegExp(c.by('compara-storage').pattern).test('Vale'), false);
    await g.page.reload({ waitUntil: 'load' }); await sleep(250);
    check('after a reload, the screen', await g.text('h1'), hello + 'Vale');
    await g.click('button'); await sleep(150);
    check('after the clear button, the storage holds', await stored(g), '""');
    await g.done();

    // useDataApi, through a test-only component
    put(c.name, '__api.jsx', apiHarness);
    const q = (path) => '&url=' + encodeURIComponent(API + path);
    const ok = await open(c.name, '__api.jsx', { query: q('/users'), before: delayApi(400), api: true });
    check('useDataApi with /users, first screen', await ok.text('p'), 'loading');
    await sleep(2500);
    check('useDataApi with /users, then (first name of the list)', await ok.text('p'), 'Leanne Graham');
    await ok.done();
    const bad = await open(c.name, '__api.jsx', { query: q('/users/999'), api: true });
    await sleep(2500);
    check('useDataApi with /users/999 (the Compara screen expects an error)', await bad.text('p'), 'Error 404');
    await bad.click('button'); await sleep(2500);
    check('then the URL changes to /users/1', await bad.text('p'), 'Leanne Graham');
    await bad.done();
    const off = await open(c.name, '__api.jsx', { query: q('/users/1'), before: noNetwork, api: true });
    await sleep(1200);
    check('useDataApi with the network down', await off.text('p'), 'Failed to fetch');
    await off.done();
    // The prediction about setError(null): the same hook without that line.
    const hook = c.files.find((x) => x.file.endsWith('useDataApi.js'));
    put(c.name + '.noreset', 'useDataApi.js', hook.lines.filter((l) => l.trim() !== 'setError(null);'));
    put(c.name + '.noreset', '__api.jsx', apiHarness);
    const nr = await open(c.name + '.noreset', '__api.jsx', { query: q('/users/999'), api: true });
    await sleep(2500); await nr.click('button'); await sleep(2500);
    check('without setError(null): /users/999, then /users/1 (the right option says the 404 stays)', await nr.text('p'), 'Error 404');
    await nr.done();
    // The prediction about two components with the same key.
    const two = c.by('predice-dos'), call = span(two.question, 0).match(/'([^']+)', '([^']+)'/), next = span(two.question, 1);
    put(c.name, '__two.jsx', twoHarness(call[1], call[2], next));
    const tw = await open(c.name, '__two.jsx', { before: cleanStorage() });
    await tw.page.click('#b1'); await sleep(200);
    check('two components, same key, the first changes: [first, second, storage]',
      [await tw.text('#t1'), await tw.text('#t2'), await tw.page.evaluate((k) => localStorage.getItem(k), call[1])],
      [next, span(two.options.find((o) => o.correct).text), JSON.stringify(next)]);
    await tw.done();
  },
};

for (const c of cards) {
  console.log(`\n## ${c.page} · ${c.lang} · ${c.id} · ${c.files.map((f) => f.file).join(' + ')}`);
  const test = tests[`${c.page}/${c.id}`];
  if (!test) { failed++; console.log('  FAIL  no test written for this card'); continue; }
  try { await test(c); } catch (e) { failed++; console.log('  FAIL  the test stopped: ' + e.message); }
}

await browser.close();
await server.close();
console.log(`\n${cards.length} cards, ${failed} failed checks`);
process.exit(failed ? 1 : 0);
