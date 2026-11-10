// Dev helper: open one screen of the build and print the value of a JS expression (JSON), e.g.
//   node tools/probe.mjs S04 "[...document.querySelectorAll('.w-deck *')].map(e => e.className)"
// An optional third argument is run first (an async function body: the page's state for the probe).
import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { chromePath } from './lib.mjs';

const [id, expr, pre = ''] = process.argv.slice(2);
const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const p = await browser.newPage();
p.on('console', (m) => console.log('console:', m.text()));
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.setViewport({ width: 1280, height: 720 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await p.goto(`http://127.0.0.1:${server.address().port}/index.html?reset=1&screen=${id}`, { waitUntil: 'networkidle0' });
await p.waitForFunction(() => window.__l4 && document.fonts.status === 'loaded');
await p.keyboard.press('Shift');
if (pre) await p.evaluate(`(async () => { ${pre} })()`);
await new Promise((r) => setTimeout(r, 300));
console.log(JSON.stringify(await p.evaluate(expr), null, 1));
await browser.close();
server.close();
