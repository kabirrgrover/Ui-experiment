import { chromium } from 'playwright';
import fs from 'fs';
const fams = ['coming-soon','gaegu','schoolbell','gochi-hand','shantell-sans','patrick-hand','caveat','kalam','delicious-handrawn','nanum-pen-script'];
let css='', rows='';
for (const f of fams){
  const dir=`node_modules/@fontsource/${f}/files/`;
  const file=fs.readdirSync(dir).find(x=>/latin-(400|500)-normal\.woff2$/.test(x));
  css+=`@font-face{font-family:"${f}";src:url(data:font/woff2;base64,${fs.readFileSync(dir+file).toString('base64')})}`;
  rows+=`<div class=r><small>${f}</small><div style="font-family:'${f}'"><span class=big>service requisition</span> <span class=mid>What's the soil class at the site? Let's draft your SR.</span></div></div>`;
}
const b=await chromium.launch({executablePath: process.env.CHROME}); const p=await b.newPage({viewport:{width:1200,height:1400}});
await p.setContent(`<style>${css} body{background:#f6f2ea;color:#1f1c19;margin:20px;font-family:sans-serif} .r{border-bottom:1px solid #cfc6b8;padding:8px 0} .big{font-size:44px} .mid{font-size:22px;display:block} small{color:#888}</style>${rows}`);
await p.waitForTimeout(500); await p.screenshot({path:'spec.png',fullPage:true}); await b.close();
