// Runs every snippet in the dev server (StrictMode on, as learners get it) and prints what really happens.
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const server = await createServer({ root: process.cwd(), server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-first-run'],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

async function run(name, steps, opts = {}) {
  const page = await browser.newPage();
  const logs = [];
  const reqs = [];
  page.on('console', (m) => { const t = m.text(); if (!t.startsWith('[vite]') && !t.includes('React DevTools')) logs.push(t); });
  page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message));
  if (opts.mockUsers2) {
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      if (r.url().includes('jsonplaceholder')) { reqs.push(r.url()); return r.respond({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ id: 2, name: 'Ervin Howell' }) }); }
      r.continue();
    });
  } else {
    page.on('request', (r) => { if (r.url().includes('jsonplaceholder')) reqs.push(r.url()); });
  }
  const q = opts.query ? '&' + opts.query : '';
  await page.goto(`http://localhost:5199/?c=${name}${q}`, { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  const out = async () => page.$eval('#out', (e) => e.textContent).catch(() => '(no #out)');
  const rec = { name, steps: [] };
  const snap = async (label) => rec.steps.push({ label, out: await out(), logs: logs.splice(0), reqs: reqs.length, title: await page.title() });
  await snap('mount');
  for (const s of steps) {
    if (s.click) for (let i = 0; i < (s.times || 1); i++) { await page.click(s.click); await sleep(60); }
    if (s.type) await page.type('#inp', s.type, { delay: 20 });
    if (s.wait) await sleep(s.wait);
    if (s.scroll) { for (let i = 0; i < s.scroll; i++) { await page.evaluate((y) => window.scrollTo(0, y), 300 * (i + 1)); await sleep(120); } }
    if (s.reload) { await page.reload({ waitUntil: 'networkidle0' }); }
    if (s.eval) rec.steps.push({ label: 'eval', value: await page.evaluate(s.eval) });
    await snap(s.label);
  }
  results.push(rec);
  await page.close();
}

// F1 / P-1
await run('PomodoroCounter', [{ click: '#btn', times: 3, label: '3 clicks' }]);
await run('DoneTasksToggle', [{ click: '#btn', label: '1 click' }, { click: '#btn', label: '2 clicks' }]);
await run('DoubleClickPredict', [{ click: '#btn', times: 3, label: '3 clicks' }]);
await run('DoubleClickUpdater', [{ click: '#btn', times: 3, label: '3 clicks' }]);
await run('ShowHideMessage', [{ click: '#btn', times: 3, label: '3 clicks' }]);
await run('OrigCounter', [{ click: '#btn', times: 2, label: '2 clicks' }]);
// F2 / P-2
await run('PartnerNoDeps', [{ wait: 2000, label: 'after 2 s (mocked API)' }], { mockUsers2: true });
await run('Partner', [{ wait: 1500, label: 'after 1.5 s' }]);
await run('PomodoroTitle', [{ click: '#btn', times: 2, label: '2 clicks' }]);
await run('ThreeEffects', [{ click: '#btn', label: 'click +1' }, { type: 'ab', label: 'typed 2 letters' }]);
await run('FirstUser', [{ wait: 1500, label: 'after 1.5 s' }]);
await run('OrigPost', [{ wait: 1500, label: 'after 1.5 s' }]);
// F3 / P-3
await run('TimerNoCleanup', [{ wait: 3100, label: 'after ~3 s' }, { click: '#unmount', label: 'unmount' }, { wait: 2100, label: '2 s after unmount' }]);
await run('TimerStale', [{ wait: 3100, label: 'after ~3 s' }]);
await run('Timer', [{ wait: 3100, label: 'after ~3 s' }, { click: '#unmount', label: 'unmount' }, { wait: 2100, label: '2 s after unmount' }]);
await run('ScrollNoCleanup', [{ scroll: 3, label: '3 scrolls' }, { click: '#unmount', label: 'unmount' }, { scroll: 2, label: '2 scrolls after unmount' }]);
await run('ScrollWatcher', [{ scroll: 3, label: '3 scrolls' }, { click: '#unmount', label: 'unmount' }, { scroll: 2, label: '2 scrolls after unmount' }]);
await run('OrigCleanupSlide', [{ wait: 2100, label: 'after ~2 s' }, { click: '#unmount', label: 'unmount' }]);
await run('OrigWindowScroll', [{ scroll: 3, label: '3 scroll attempts' }, { eval: () => document.documentElement.scrollHeight > innerHeight, label: 'page taller than window?' }]);
// F4 / P-4
await run('FocusTask', [{ click: '#btn', label: 'click', }, { eval: () => document.activeElement && document.activeElement.id, label: 'focused element' }]);
await run('PrevWithLet', [{ click: '#btn', times: 3, label: '3 clicks' }]);
await run('PreviousValue', [{ click: '#btn', label: '1 click' }, { click: '#btn', times: 2, label: '3 clicks' }]);
await run('OrigPrevious', [{ click: '#btn', label: '1 click' }]);
await run('RefVsState', [{ click: '#btn2', times: 3, label: 'ref +1 x3' }, { click: '#btn', label: 'state +1' }]);
// F5 / P-5
await run('TitleWithHook', [{ click: '#btn', times: 2, label: '2 clicks' }]);
await run('Greeting', [{ type: 'Vale', label: 'typed' }, { eval: () => localStorage.getItem('userName'), label: 'storage' }, { reload: true, label: 'after reload' }, { click: '#btn', label: 'clear' }, { eval: () => localStorage.getItem('userName'), label: 'storage after clear' }]);
for (const v of ['ApiOrig', 'ApiNarrated', 'ApiFixed']) {
  await run(v, [{ wait: 1500, label: 'ok url' }, { eval: () => window.__states.join(','), label: 'states' }], { query: 'url=https://jsonplaceholder.typicode.com/users/1' });
  await run(v, [{ wait: 1500, label: '404 url' }, { eval: () => window.__states.join(','), label: 'states' }], { query: 'url=https://jsonplaceholder.typicode.com/users/999' });
}

await browser.close();
await server.close();
for (const r of results) {
  console.log('\n## ' + r.name);
  for (const s of r.steps) {
    if (s.label === 'eval') { console.log('   eval =', JSON.stringify(s.value)); continue; }
    console.log(`  [${s.label}] out=${JSON.stringify(s.out)} reqs=${s.reqs} title=${JSON.stringify(s.title)}${s.logs.length ? ' logs=' + JSON.stringify(s.logs) : ''}`);
  }
}
