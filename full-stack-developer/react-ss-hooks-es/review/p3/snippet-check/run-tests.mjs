// P3 snippet check: runs every code card of a built practice, exactly as the strings files hold it,
// in a throwaway Vite + React app (dev server, StrictMode on, as a learner's project).
// Copy this file into the lab folder and run it there (see README.md):
//   node run-tests.mjs <path to react-ss-hooks-es>
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const lesson = process.argv[2];
if (!lesson) { console.error('usage: node run-tests.mjs <path to react-ss-hooks-es>'); process.exit(1); }
const PAGES = ['p1-usestate'];
const LANGS = ['es', 'en'];

// 1. Write each code card into the lab, byte for byte.
const dir = join(process.cwd(), 'src', 'p3');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const cards = [];
for (const page of PAGES) for (const lang of LANGS) {
  const sb = { window: {} };
  vm.runInNewContext(readFileSync(join(lesson, page, `strings.${lang}.js`), 'utf8'), sb);
  for (const s of sb.window.RH_PAGE.screens) {
    const code = s.code || s.copy;
    if (!code) continue;
    const name = `${page}.${lang}.${s.id}`;
    writeFileSync(join(dir, name + '.jsx'), code.lines.join('\n') + '\n');
    cards.push({ name, page, lang, id: s.id, file: code.file, lines: code.lines, screen: s });
    // P-1 "after" line: the same card with the updater form, to measure the number it promises.
    if (page === 'p1-usestate' && s.id === 'predice') {
      const upd = code.lines.map((l) => l.replace('setCount(count + 1);', 'setCount((c) => c + 1);'));
      writeFileSync(join(dir, name + '.updater.jsx'), upd.join('\n') + '\n');
      cards.push({ name: name + '.updater', page, lang, id: s.id + ' (updater form, the "after" line)', file: code.file, lines: upd, screen: s, variant: true });
    }
  }
}
writeFileSync(join(process.cwd(), 'src', 'App.jsx'),
  "const all = import.meta.glob('./p3/*.jsx', { eager: true });\n" +
  "export default function App() {\n" +
  "  const name = new URLSearchParams(location.search).get('c');\n" +
  "  const mod = all[`./p3/${name}.jsx`];\n" +
  "  if (!mod) return <p>unknown: {name}</p>;\n" +
  "  const C = mod.default;\n" +
  "  return <div id=\"card\"><C /></div>;\n" +
  "}\n");

// 2. Run them.
const server = await createServer({ root: process.cwd(), server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-first-run'],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (label, got, want) => {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}: ${JSON.stringify(got)}${ok ? '' : '  (expected ' + JSON.stringify(want) + ')'}`);
};

for (const c of cards) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto(`http://localhost:5199/?c=${c.name}`, { waitUntil: 'networkidle0', timeout: 20000 });
  const text = (sel) => page.$eval('#card ' + sel, (e) => e.textContent).catch(() => null);
  const click = async (n) => { for (let i = 0; i < n; i++) { await page.click('#card button'); await sleep(60); } };
  console.log(`\n## ${c.page} · ${c.lang} · ${c.id} · ${c.file}`);

  if (c.page === 'p1-usestate' && c.id.startsWith('predice')) {
    check('number at mount', await text('p'), '0');
    await click(3);
    check('number after 3 clicks', await text('p'), c.variant ? '6' : '3');
  } else if (c.page === 'p1-usestate' && c.id === 'solucion') {
    const msg = c.lines.join('\n').match(/<p>(.*?)<\/p>/)[1];
    check('message at mount', await text('p'), msg);
    const labelShown = await text('button');
    await click(1);
    check('message after 1 click', await text('p'), null);
    check('button label changed after 1 click', (await text('button')) !== labelShown, true);
    await click(2);
    check('message after 3 clicks (null = hidden, the answer the Compara screen expects)', await text('p'), null);
    await click(1);
    check('message after 4 clicks', await text('p'), msg);
  } else {
    failed++;
    console.log('  FAIL  no test written for this card');
  }
  check('console errors and warnings', errors.length, 0);
  errors.forEach((e) => console.log('    ' + e));
  await page.close();
}

await browser.close();
await server.close();
console.log(`\n${cards.length} cards, ${failed} failed checks`);
process.exit(failed ? 1 : 0);
