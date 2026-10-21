import { chromium } from 'playwright'; import fs from 'fs';
let html='<body style="margin:0;padding:20px;background:#fff;display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end">';
for (const f of fs.readdirSync('street').sort()) html+=`<img style="height:${f.startsWith('bldg')?260:120}px" src="data:image/svg+xml;base64,${fs.readFileSync('street/'+f).toString('base64')}">`;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1400,height:800}});
await p.setContent(html);await p.waitForTimeout(300);await p.screenshot({path:'street.png',fullPage:true});await b.close();
