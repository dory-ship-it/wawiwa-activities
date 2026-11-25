// One-off: reference screens from EAI M1 L4 v3 (running on localhost:8130) for the chapter 2 side-by-side sheet.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { chromePath } from '../../tools/lib.mjs';
import { ROOT } from '../../tools/serve.mjs';

const out = join(ROOT, 'planning/reference');
const browser = await puppeteer.launch({ executablePath: chromePath() });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const id of ['V1', 'S15', 'W5', 'S16', 'W1']) {
  await page.goto(`http://localhost:8130/?review=1&live=0&screen=${id}`); await sleep(1500);
  await page.screenshot({ path: join(out, `ref-${id}.png`) });
}
await browser.close();
console.log('ok');
