// Regenerates netlify/functions/ai-helper-data/learn-articles.json from the published Learn articles.
// Usage: node scripts/build-helper-knowledge.mjs <file with one /learn-... path per line> <output json> [base URL, default https://myprobateca.com] [source label]
// Needs puppeteer-core and Chrome. Run after any Learn article changes (W2-legal item 18).
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync } from 'fs';
const paths = readFileSync(process.argv[2], 'utf8').trim().split('\n');
const BASE = process.argv[4] || 'https://myprobateca.com';
const SOURCE = process.argv[5] || BASE;
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const out = [];
for (const p of paths) {
  const page = await b.newPage();
  await page.goto(BASE + p, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  const data = await page.evaluate(() => {
    const root = document.querySelector('article') || document.querySelector('main') || document.body;
    const clone = root.cloneNode(true);
    clone.querySelectorAll('nav, header, footer, script, style, button, form').forEach(n => n.remove());
    return { title: document.querySelector('h1')?.innerText || document.title, text: clone.innerText.replace(/\n{2,}/g, '\n').trim() };
  });
  out.push({ path: p, url: 'https://myprobateca.com' + p, title: data.title, text: data.text });
  console.log(p, data.text.length);
  await page.close();
}
await b.close();
writeFileSync(process.argv[3], JSON.stringify({ extractedAt: new Date().toISOString(), source: SOURCE, articles: out }, null, 1));
