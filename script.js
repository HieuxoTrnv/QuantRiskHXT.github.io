const $=id=>document.getElementById(id);let equityChart,histChart,ddChart,journalChart,lastData=null;
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const pct=n=>`${n.toFixed(1)}%`;
function percentile(a,p){if(!a.length)return 0;const x=(a.length-1)*p,i=Math.floor(x),f=x-i;return a[i]+(a[i+1]-a[i]||0)*f}
function fmt(n){return money(n)}
function sampleSorted(arr){return [...arr].sort((a,b)=>a-b)}
function simulate(){
 const capital=+$('capital').value, wr=Math.min(99,Math.max(1,+$('winRate').value))/100,risk=Math.max(.0001,+$('riskPct').value)/100,rr=Math.max(.01,+$('rr').value),trades=Math.max(1,Math.floor(+$('trades').value)),sims=Math.max(100,Math.floor(+$('sims').value)),compound=$('compounding').checked;
 const paths=[],ends=[],dds=[],maxStreaks=[],ruins={10:0,20:0,30:0,50:0};let medianPath=new Array(trades+1).fill(0),pathSample=[];
 const limit=Math.min(sims,50000);
 for(let s=0;s<limit;s++){
  let bal=capital,peak=capital,maxdd=0,lossStreak=0,maxLoss=0,hit={10:false,20:false,30:false,50:false},path=[capital];
  for(let t=0;t<trades;t++){
   const win=Math.random()<wr, base=compound?bal:capital, change=win?base*risk*rr:-base*risk;bal=Math.max(0,bal+change);peak=Math.max(peak,bal);const dd=peak?1-bal/peak:1;maxdd=Math.max(maxdd,dd);if(win)lossStreak=0;else{lossStreak++;maxLoss=Math.max(maxLoss,lossStreak)}
   [10,20,30,50].forEach(x=>{if(!hit[x]&&dd>=x/100){hit[x]=true;ruins[x]++}});path.push(bal);
  }
  ends.push(bal);dds.push(maxdd*100);maxStreaks.push(maxLoss);if(s<30)pathSample.push(path);
  if(s===0)medianPath=path;
 }
 const sortedEnds=sampleSorted(ends),sortedDD=sampleSorted(dds),med=percentile(sortedEnds,.5),p05=percentile(sortedEnds,.05),p95=percentile(sortedEnds,.95),medDD=percentile(sortedDD,.5),profit=ends.filter(x=>x>capital).length/limit*100,maxStreak=Math.max(...maxStreaks);
 $('mMedian').textContent=fmt(med);$('mReturn').textContent=`${med>=capital?'+':''}${pct((med/capital-1)*100)} median return`;$('mP95').textContent=fmt(p95);$('mP05').textContent=fmt(p05);$('mProfit').textContent=pct(profit);$('mLoss').textContent=pct(100-profit)+' probability of loss';$('mDD').textContent=pct(medDD);$('mStreak').textContent=maxStreak+' losses';
 $('heroWR').textContent=Math.round(wr*100)+'%';$('heroRR').textContent=rr.toFixed(1)+'R';$('heroRisk').textContent=(risk*100).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'%';
 [10,20,30,50].forEach(x=>$('ruin'+x).textContent=pct(ruins[x]/limit*100));
 [3,5,7,9,12].forEach(k=>$('s'+k).textContent=pct(maxStreaks.filter(x=>x>=k).length/limit*100));
 lastData={capital,ends,dds,pathSample,med,rr,wr,risk,trades};drawCharts(lastData);return lastData;
}
function destroy(c){if(c)c.destroy()}
function baseOptions(){return{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{labels:{color:getComputedStyle(document.body).getPropertyValue('--muted'),font:{size:10}}}},scales:{x:{ticks:{color:getComputedStyle(document.body).getPropertyValue('--muted'),font:{size:9}},grid:{color:getComputedStyle(document.body).getPropertyValue('--line')}},y:{ticks:{color:getComputedStyle(document.body).getPropertyValue('--muted'),font:{size:9}},grid:{color:getComputedStyle(document.body).getPropertyValue('--line')}}}}}
function drawCharts(d){
 destroy(equityChart);destroy(histChart);destroy(ddChart);
 const labels=Array.from({length:d.trades+1},(_,i)=>i), curves=d.pathSample.map((p,i)=>({label:i===0?'Sample paths':'',data:p,borderColor:i===0?'#c7ff3d':'rgba(141,189,23,.20)',borderWidth:i===0?2:1,pointRadius:0}));
 const medPath=[];for(let t=0;t<=d.trades;t++){const vals=d.pathSample.map(p=>p[t]);medPath.push(percentile(sampleSorted(vals),.5))}curves.push({label:'Median (sample)',data:medPath,borderColor:'#68a7ff',borderWidth:2,pointRadius:0,borderDash:[5,4]});
 equityChart=new Chart($('equityChart'),{type:'line',data:{labels,datasets:curves},options:baseOptions()});
 const bins=24, min=Math.min(...d.ends),max=Math.max(...d.ends),step=(max-min||1)/bins,h=new Array(bins).fill(0);d.ends.forEach(v=>h[Math.min(bins-1,Math.floor((v-min)/step))]++);histChart=new Chart($('histChart'),{type:'bar',data:{labels:h.map((_,i)=>fmt(min+(i+.5)*step)),datasets:[{data:h,borderWidth:0,backgroundColor:'#c7ff3d'}]},options:baseOptions()});
 const dbins=20,dh=new Array(dbins).fill(0);d.dds.forEach(v=>dh[Math.min(dbins-1,Math.floor(v/(100/dbins)))]++);ddChart=new Chart($('ddChart'),{type:'bar',data:{labels:dh.map((_,i)=>`${(i*5).toFixed(0)}-${(i+1)*5}%`),datasets:[{data:dh,borderWidth:0,backgroundColor:'#ff5f68'}]},options:baseOptions()});
}
function position(){const c=+$('psCapital').value||0,r=+$('psRisk').value/100||0,sl=+$('psSL').value||0,p=+$('psPip').value||0,amt=c*r,lots=sl*p?amt/(sl*p):0;$('riskAmount').textContent=fmt(amt);$('positionSize').textContent=lots.toFixed(2)+' lots'}
function recovery(){const d=Math.min(99,Math.max(0,+$('ddInput').value));$('ddRemain').textContent=(100-d).toFixed(0)+'%';$('ddRecover').textContent=(d>=100?'∞':(d/(100-d)*100).toFixed(2))+'%';$('ddBar').style.width=d+'%'}
function expectancy(){const w=+$('exWR').value/100,l=+$('exLR').value/100,aw=+$('exWin').value,al=+$('exLoss').value,e=w*aw-l*al;$('expectancy').textContent=(e>=0?'+':'')+e.toFixed(2)+'R'}
function journal(){const vals=$('tradeInput').value.split(/[,\s]+/).map(Number).filter(Number.isFinite);let b=100,e=[b],peak=b,maxdd=0,w=0,l=0,wl=0,ll=0;vals.forEach(r=>{b+=r;e.push(b);if(r>0){w++;wl++;ll=0}else if(r<0){l++;ll++;wl=0}peak=Math.max(peak,b);maxdd=Math.max(maxdd,(peak-b)/peak*100)});destroy(journalChart);journalChart=new Chart($('journalChart'),{type:'line',data:{labels:e.map((_,i)=>i),datasets:[{label:'Equity (R)',data:e,borderColor:'#c7ff3d',backgroundColor:'rgba(199,255,61,.08)',fill:true,pointRadius:2,tension:.25}]},options:baseOptions()});const pf=l?Math.abs(vals.filter(x=>x>0).reduce((a,b)=>a+b,0)/vals.filter(x=>x<0).reduce((a,b)=>a+b,0)):Infinity;$('journalStats').innerHTML=`<div><span>Trades</span><b>${vals.length}</b></div><div><span>Net R</span><b>${(b-100).toFixed(2)}R</b></div><div><span>Win rate</span><b>${vals.length?pct(w/vals.length*100):'—'}</b></div><div><span>Profit factor</span><b>${isFinite(pf)?pf.toFixed(2):'∞'}</b></div><div><span>Max drawdown</span><b>${pct(maxdd)}</b></div><div><span>Max losing streak</span><b>${ll}</b></div>`}
function bind(){
 $('runBtn').onclick=simulate;$('ruinRun').onclick=simulate;$('randomizeBtn').onclick=()=>{$('winRate').value=[40,45,50,55,60][Math.floor(Math.random()*5)];$('riskPct').value=[.5,1,1.5,2][Math.floor(Math.random()*4)];$('rr').value=[1,1.5,2,2.5,3][Math.floor(Math.random()*5)];simulate()};
 ['psCapital','psRisk','psSL','psPip'].forEach(x=>$(x).oninput=position);$('ddInput').oninput=recovery;['exWR','exLR','exWin','exLoss'].forEach(x=>$(x).oninput=expectancy);$('journalBtn').onclick=journal;
 $('themeBtn').onclick=()=>{document.body.classList.toggle('light');$('themeBtn').textContent=document.body.classList.contains('light')?'☀':'☾';if(lastData)drawCharts(lastData);};
}
bind();position();recovery();expectancy();simulate();journal();
