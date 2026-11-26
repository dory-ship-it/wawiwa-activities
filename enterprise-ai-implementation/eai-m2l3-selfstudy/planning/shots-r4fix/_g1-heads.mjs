// One-off: G1 with a ring on every person's head at once (the content's head points), to check them against the faces.
import puppeteer from 'puppeteer-core';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { chromePath } from '../../tools/lib.mjs';
import { startServer, ROOT } from '../../tools/serve.mjs';

const C = JSON.parse(readFileSync(join(ROOT, 'content/m2l3.json'), 'utf8'));
const people = C.screens.find((s) => s.id === 'G1').people;
const server = await startServer(0);
const browser = await puppeteer.launch({ executablePath: chromePath() });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?reset=1&live=0&screen=G1`);
await new Promise((r) => setTimeout(r, 1500));
await page.evaluate((people) => {
  document.querySelectorAll('.m-mt-bubble, .m-mt-panel, .w-ghost, .w-ghost-hand').forEach((e) => { e.style.setProperty('display', 'none'); });
  const ring = document.querySelector('.m-mt-ring');
  people.forEach((p) => { const r = ring.cloneNode(); r.style.left = p.head[0] + 'px'; r.style.top = (p.head[1] - 80.64) + 'px'; ring.parentNode.append(r);
    const d = document.createElement('i'); d.className = 'dbg'; d.style.setProperty('position', 'absolute'); d.style.setProperty('width', '8px'); d.style.setProperty('height', '8px'); d.style.setProperty('background', 'red'); d.style.setProperty('border-radius', '50%');
    d.style.left = (p.head[0] - 4) + 'px'; d.style.top = (p.head[1] - 80.64 - 4) + 'px'; ring.parentNode.append(d); });
}, people);
await page.screenshot({ path: join(ROOT, 'planning/shots-r4fix/g1-heads.png') });
await browser.close(); server.close();
console.log('ok');
