// FX7: screenshots of the layout proposal mock-ups (planning/fx7-mockups) at the real 1280 x 720 stage.
// Usage: node tools/shots-fx7.mjs [page.html] [outdir]  -> planning/fx7-mockups/<outdir>/<frame id>.png
//   default: index.html -> shots/ (round 1); v2.html v2-shots (round 2)
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from './lib.mjs';
import { startServer, ROOT } from './serve.mjs';

const server = await startServer(0);
const port = server.address().port;
const [pageName = 'index.html', outName = 'shots'] = process.argv.slice(2);
const out = join(ROOT, 'planning', 'fx7-mockups', outName);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-first-run', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1.5 });
await page.goto(`http://127.0.0.1:${port}/planning/fx7-mockups/${pageName}`, { waitUntil: 'networkidle0' });
await page.addStyleTag({ content: '*{animation:none!important} main{max-width:2800px!important} .duo{display:block!important} .frame{width:1280px!important}' });
await page.evaluate(() => { dispatchEvent(new Event('resize')); return document.fonts.ready; });
const frames = await page.$$eval('.frame', (els) => els.map((e, i) => e.id || e.closest('.mock').id.replace('m-', '') || `f${i}`));
const handles = await page.$$('.frame');
for (let i = 0; i < handles.length; i++) {
  const name = frames[i].replace(/^f-/, '');
  await handles[i].screenshot({ path: join(out, `${name}.png`) });
  console.log('shot', name);
}
await browser.close();
server.close();
