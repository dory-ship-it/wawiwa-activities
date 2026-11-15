import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
const L = process.argv[2];
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = normalize(join(L, decodeURIComponent(new URL(q.url, 'http://x').pathname))); if (!existsSync(p) || !statSync(p).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': T[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--user-data-dir=' + join(process.cwd(), '.chrome-profile-ratio')] });
for (const p of ['p1-usestate', 'p2-useeffect', 'p3-limpieza', 'p4-useref', 'p5-hooks-propios', 'checkin']) for (const col of [1000, 760]) {
  const pg = await b.newPage(); await pg.setViewport({ width: col, height: 900 });
  await pg.setContent(`<!doctype html><style>body{margin:0}</style><div style="position:relative;padding:56.000% 0 0 0;"><iframe src="${base}/${p}/index.html" title="t" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy"></iframe></div>`, { waitUntil: 'networkidle0' });
  const f = pg.frames().find((x) => x !== pg.mainFrame()); await f.evaluate(() => document.fonts.ready);
  const m = await f.evaluate(() => { const c = document.querySelector('.canvas').getBoundingClientRect(); return [innerWidth, innerHeight, c.width, c.height, c.top]; });
  console.log(`${p.padEnd(17)} column ${col}: frame ${m[0]} x ${m[1]}, card ${m[2].toFixed(1)} x ${m[3].toFixed(1)}, empty space ${(m[1] - m[3]).toFixed(1)} px`);
  await pg.close();
}
await b.close(); srv.close();
