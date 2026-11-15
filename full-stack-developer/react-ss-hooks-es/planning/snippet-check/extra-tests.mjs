import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
const server = await createServer({ root: process.cwd(), server: { port: 5198, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open(c) { const p = await browser.newPage(); const logs = []; p.on('console', (m) => { const t = m.text(); if (!t.startsWith('[vite]') && !t.includes('DevTools')) logs.push(t); }); await p.goto('http://localhost:5198/?c=' + c, { waitUntil: 'load' }); await p.waitForSelector('#out'); return { p, logs, out: () => p.$eval('#out', (e) => e.textContent) }; }
{ const { p, out } = await open('CounterWithLet'); for (let i = 0; i < 3; i++) await p.click('#btn'); await sleep(100); console.log('CounterWithLet after 3 clicks:', await out()); await p.close(); }
for (const c of ['TimerNoCleanup', 'Timer']) { const { p, out } = await open(c); const s = [await out()]; for (let i = 0; i < 4; i++) { await sleep(1000); s.push(await out()); } console.log(c, 'per second:', s.join(' -> ')); await p.close(); }
{ const { p, logs, out } = await open('FocusRenders'); await sleep(300); const before = logs.length; await p.click('#btn'); await sleep(300); console.log('FocusRenders: render logs at mount =', before, ', after focus click =', logs.length - before, ', active =', await p.evaluate(() => document.activeElement.id)); await p.close(); }
await browser.close(); await server.close();
