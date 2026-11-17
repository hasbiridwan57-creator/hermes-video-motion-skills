import { chromium } from 'playwright-core';
import path from 'path'; import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1080,height:1920}});
await page.goto('file://'+path.join(__dirname,'index.html')+'?t=0',{waitUntil:'networkidle'});
await page.waitForTimeout(600);
const scenes=['sc1','sc2','sc3','sc4','sc5','sc6','sc7','sc8'];
const times=[1,11,17.5,21.5,26.8,30.8,37,41.8];
for(let s=0;s<scenes.length;s++){
  const sc=scenes[s], t=times[s];
  await page.evaluate((t)=>{window.__tl.time(t,false);window.__updateSub(t);},t);
  await page.waitForTimeout(150);
  const res=await page.evaluate((sc)=>{
    const W=1080, SAFE=50;
    const out=[];
    const scEl=document.getElementById(sc);
    scEl.querySelectorAll('.node,.ribbon,.pill,.proof,.code').forEach(e=>{
      const cs=getComputedStyle(e); if(parseFloat(cs.opacity)<0.05) return;
      const b=e.getBoundingClientRect(); if(b.width===0) return;
      const mL=Math.round(b.x), mR=Math.round(W-(b.x+b.width));
      if(mL<SAFE||mR<SAFE) out.push((e.id)+' L='+mL+' R='+mR+' ⚠');
    });
    const act=[...document.querySelectorAll('#sub .line')].find(l=>parseFloat(getComputedStyle(l).opacity)>0.5);
    if(act){
      // per-span overflow
      act.querySelectorAll('.w').forEach(sp=>{const b=sp.getBoundingClientRect();
        if(b.x<0||b.x+b.width>W) out.push('SUB-OUT "'+sp.textContent.trim()+'" x='+Math.round(b.x)+'..'+Math.round(b.x+b.width));
      });
      const lb=act.getBoundingClientRect();
      if(lb.y+lb.height>1560) out.push('SUB-UI kena zona UI bawah');
      out.push('SUB: "'+act.textContent.trim()+'"');
    }
    return out;
  }, sc);
  console.log('===',sc,'@'+t+'s ===');
  res.forEach(x=>console.log('  ',x));
}
await browser.close();
