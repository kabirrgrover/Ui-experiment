import { chromium } from 'playwright'; import fs from 'fs';
const F='node_modules/@fontsource/';
const ex = fs.readdirSync('xl/package/dist/dev/fonts/Excalifont').map(f=>'xl/package/dist/dev/fonts/Excalifont/'+f);
const fonts = [
 ['Coming Soon (current)', F+'coming-soon/files/coming-soon-latin-400-normal.woff2'],
 ['Excalifont', ...ex],
 ['Virgil', 'xl/package/dist/dev/fonts/Virgil/Virgil-Regular.woff2'],
 ['Architects Daughter', F+'architects-daughter/files/architects-daughter-latin-400-normal.woff2'],
 ['Kalam Light', F+'kalam/files/kalam-latin-300-normal.woff2'],
 ['Patrick Hand', F+'patrick-hand/files/patrick-hand-latin-400-normal.woff2'],
 ['Sour Gummy', F+'sour-gummy/files/sour-gummy-latin-400-normal.woff2'],
 ['Mynerve', F+'mynerve/files/mynerve-latin-400-normal.woff2'],
 ['Indie Flower', F+'indie-flower/files/indie-flower-latin-400-normal.woff2'],
 ['Gaegu', F+'gaegu/files/gaegu-latin-400-normal.woff2'],
];
let css='', rows='';
fonts.forEach(([n,...files],i)=>{ for(const f of files) css+=`@font-face{font-family:f${i};src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')})}`;
 rows+=`<div class=r><small>${i}. ${n}</small><div style="font-family:f${i}"><span class=q>what's the expected soil class?</span><span class=l>Service Req. · 12 documents · Folders</span></div></div>`;});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}); const p=await b.newPage({viewport:{width:1000,height:800}});
await p.setContent(`<style>${css}body{background:#fff;color:#111;margin:24px;font-family:sans-serif}.r{border-bottom:1px solid #e6e5e1;padding:10px 0}.q{font-size:38px;display:block}.l{font-size:22px;color:#5f5e5b}small{color:#999;font-size:12px}</style>${rows}`);
await p.waitForTimeout(600); await p.screenshot({path:'spec2.png',fullPage:true}); await b.close();
