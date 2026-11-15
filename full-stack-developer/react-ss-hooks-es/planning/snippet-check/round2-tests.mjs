// Round 2 (after the adversarial review): claims that were stated but not measured, and the replacement practice questions.
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
const server = await createServer({ root: process.cwd(), server: { port: 5197, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open(c, q = '', setup) {
  const p = await browser.newPage(); const logs = [];
  p.on('console', (m) => { const t = m.text(); if (!t.startsWith('[vite]') && !t.includes('DevTools') && !t.includes('Failed to load resource')) logs.push(t); });
  if (setup) await setup(p);
  await p.goto('http://localhost:5197/?c=' + c + q, { waitUntil: 'load' }); await p.waitForSelector('#out', { timeout: 10000 });
  return { p, logs, out: () => p.$eval('#out', (e) => e.textContent) };
}
const line = (...a) => console.log(...a);
for (const c of ['TimerStale', 'TimerClearNow', 'TimerDepsNoCleanup']) { const { p, out } = await open(c); const s = [await out()]; for (let i = 0; i < 4; i++) { await sleep(1000); s.push(await out()); } line(c, 'per second:', s.join(' -> ')); await p.close(); }
{ // F2 beat 7: is "Cargando..." on screen before the response? Delay the API by 800 ms.
  const { p, out } = await open('Partner', '', async (pg) => { await pg.setRequestInterception(true); pg.on('request', (r) => { if (r.url().includes('jsonplaceholder')) setTimeout(() => r.respond({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"id":2,"name":"Ervin Howell"}' }), 800); else r.continue(); }); });
  const a = await out(); await sleep(1200); line('Partner with 800 ms API: first =', JSON.stringify(a), ', after =', JSON.stringify(await out())); await p.close(); }
{ // F3 beat 9: scroll after unmount on a page that can still scroll
  for (const c of ['ScrollNoCleanup', 'ScrollWatcher']) { const { p, logs } = await open(c, '&tall=1'); await p.click('#unmount'); await sleep(200); logs.splice(0); for (let i = 1; i <= 3; i++) { await p.evaluate((y) => window.scrollTo(0, y), 300 * i); await sleep(150); } line(c, 'logs from 3 scrolls after unmount:', logs.length); await p.close(); } }
{ // P-3: timer hidden then shown again
  const { p, logs } = await open('Timer'); await sleep(300); logs.splice(0); await p.click('#unmount'); await sleep(200); const hide = logs.splice(0); await p.click('#unmount'); await sleep(200); line('Timer hide:', JSON.stringify(hide), 'show again:', JSON.stringify(logs.splice(0))); await p.close(); }
{ // P-3 new predict: resize listener, 2 resizes, then unmount and 1 resize
  for (const c of ['ResizeNoCleanup', 'ResizeWithCleanup']) { const { p, logs } = await open(c); await sleep(200); logs.splice(0); await p.setViewport({ width: 900, height: 700 }); await sleep(200); await p.setViewport({ width: 800, height: 700 }); await sleep(200); const a = logs.splice(0).length; await p.click('#unmount'); await sleep(100); logs.splice(0); await p.setViewport({ width: 700, height: 700 }); await sleep(200); line(c, 'logs for 2 resizes:', a, ', for 1 resize after unmount:', logs.length); await p.close(); } }
{ // P-4: 2 x ref, 2 x state
  const { p, out } = await open('RefVsState'); for (let i = 0; i < 2; i++) { await p.click('#btn2'); await sleep(50); } const a = await out(); for (let i = 0; i < 2; i++) { await p.click('#btn'); await sleep(50); } line('RefVsState 2 ref:', JSON.stringify(a), ', then 2 state:', JSON.stringify(await out())); await p.close(); }
for (const c of ['PreviousValue', 'PrevInRender']) { const { p, out } = await open(c); for (let i = 0; i < 5; i++) { await p.click('#btn'); await sleep(50); } line(c, 'after 5 clicks:', JSON.stringify(await out())); await p.close(); }
{ // P-5: invalid JSON in storage
  const { p, out } = await open('Greeting', '', async (pg) => { await pg.evaluateOnNewDocument(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('userName', 'hola'); sessionStorage.setItem('seeded', '1'); } }); });
  await sleep(200); line('Greeting with "hola" (no quotes) stored: screen =', JSON.stringify(await out()), ', storage now =', JSON.stringify(await p.evaluate(() => localStorage.getItem('userName')))); await p.close(); }
{ // P-5: two components, same key
  const { p } = await open('TwoThemes'); await p.click('#b1'); await sleep(200); line('TwoThemes after clicking oscuro in box 1: box1 =', await p.$eval('#t1', (e) => e.textContent), ', box2 =', await p.$eval('#t2', (e) => e.textContent), ', storage =', await p.evaluate(() => localStorage.getItem('tema'))); await p.close(); }
for (const c of ['SwitchReset', 'SwitchNoReset']) { const { p, out } = await open(c); await sleep(1500); const a = await out(); await p.click('#btn'); await sleep(1500); line(c, '404 =', JSON.stringify(a), ', then /users/1 =', JSON.stringify(await out())); await p.close(); }
{ // P-5: no network
  const { p, out } = await open('ApiFixed', '&url=https://jsonplaceholder.typicode.com/users/1', async (pg) => { await pg.setRequestInterception(true); pg.on('request', (r) => new URL(r.url()).hostname.includes('jsonplaceholder') ? r.abort('internetdisconnected') : r.continue()); });
  await sleep(800); line('ApiFixed with the network down:', JSON.stringify(await out())); await p.close(); }
await browser.close(); await server.close();
