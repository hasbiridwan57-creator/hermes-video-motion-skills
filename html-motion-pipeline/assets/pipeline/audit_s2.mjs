import { chromium } from 'playwright-core';
import path from 'path'; import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1080,height:1920}});
await page.goto('file://'+path.join(__dirname,'index.html')+'?t=0',{waitUntil:'networkidle'});
await page.waitForTimeout(600);
for(const t of [5,6.5,7.5,9,10.5,12]){
  await page.evaluate((t)=>{window.__tl.time(t,false);window.__updateSub(t);},t);
  await page.waitForTimeout(150);
  const r=await page.evaluate(()=>{
    const W=1080, out=[];
    document.querySelectorAll('#sc2 .node,#sc2 .toolcard,#sc2 .ribbon,#sc2 .pill').forEach(e=>{
      const cs=getComputedStyle(e); if(parseFloat(cs.opacity)<0.05) return;
      const b=e.getBoundingClientRect(); if(b.width===0) return;
      const mL=Math.round(b.x),mR=Math.round(W-(b.x+b.width)),mB=Math.round(1920-(b.y+b.height));
      const flag=(mL<40||mR<40||mB<40)?' ⚠MEPET':'';
      out.push((e.id)+' L='+mL+' R='+mR+' B='+mB+flag);
    });
    // tabrakan antar toolcard / agent / ribbon
    const els=[...document.querySelectorAll('#sc2 .node,#sc2 .toolcard,#sc2 .ribbon')].filter(e=>parseFloat(getComputedStyle(e).opacity)>=0.05);
    for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){
      const a=els[i].getBoundingClientRect(),b=els[j].getBoundingClientRect();
      const ox=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);
      const oy=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
      if(ox>8&&oy>8) out.push('TABRAKAN '+els[i].id+'×'+els[j].id+' '+Math.round(ox)+'x'+Math.round(oy));
    }
    return out;
  });
  console.log('t='+t+'s:', r.length? r.join(' | '):'OK');
}
await browser.close();
