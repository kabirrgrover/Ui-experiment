import { chromium } from 'playwright'; import fs from 'fs'; import path from 'path';
const groups = (process.argv[4]||'').split(',').filter(Boolean);
let html = `<body style="margin:0;padding:20px;background:${process.argv[2]||'#f6f2ea'};font:12px sans-serif;color:#888">`;
for (const g of groups) { html += `<h3>${g}</h3><div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center">`;
  for (const f of fs.readdirSync('project/assets/'+g).filter(f=>f.endsWith('.svg'))) {
    const d = fs.readFileSync(`project/assets/${g}/${f}`,'utf8');
    html += `<figure style="margin:0;text-align:center"><img style="max-height:${g==='Doodles'?90:190}px" src="data:image/svg+xml;base64,${Buffer.from(d).toString('base64')}"><figcaption>${f}</figcaption></figure>`; }
  html += '</div>'; }
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p = await b.newPage({viewport:{width:1400,height:900}}); await p.setContent(html); await p.waitForTimeout(400);
await p.screenshot({path: process.argv[3]||'sheet.png', fullPage:true}); await b.close();
