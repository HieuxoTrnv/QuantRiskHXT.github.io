const $ = id => document.getElementById(id);
const money = new Intl.NumberFormat('vi-VN', {maximumFractionDigits:0});
const pct = new Intl.NumberFormat('vi-VN', {maximumFractionDigits:2});

let charts = {};
let lastResults = null;

function parseMoney(v){
  const digits = String(v).replace(/[^\d]/g,'');
  return Math.max(0, Number(digits || 0));
}
function formatMoney(v){
  return money.format(Math.round(v)) + ' đ';
}
function formatInputMoney(v){
  return money.format(Math.round(v));
}
function clamp(v,min,max){ return Math.min(max,Math.max(min,v)); }

function syncInputs(){
  const w = clamp(Number($('winrate').value)||0,0,100);
  $('winrate').value = w;
  $('lossrate').value = (100-w).toFixed(1).replace(/\.0$/,'');
  const rr = Number($('rr').value);
  const risk = Number($('riskPct').value);
  $('rrOut').value = rr.toFixed(1) + ' : 1';
  $('riskOut').value = risk.toFixed(1) + '%';
  updateExpectancy();
}
function getSettings(){
  let capital = parseMoney($('initialCapital').value);
  capital = Math.max(1, capital);
  const win = clamp(Number($('winrate').value)||0,0,100)/100;
  const loss = 1-win;
  const rr = clamp(Number($('rr').value)||1,.1,10);
  const risk = clamp(Number($('riskPct').value)||1,.1,10)/100;
  const trades = Math.round(clamp(Number($('trades').value)||1000,10,100000));
  const equities = Math.round(clamp(Number($('equities').value)||50,10,100));
  $('trades').value = trades; $('equities').value = equities;
  return {capital,win,loss,rr,risk,trades,equities};
}
function calcExpectancy(s){
  return s.win*s.rr - s.loss;
}
function calcPF(s){
  return s.loss === 0 ? Infinity : (s.win*s.rr)/s.loss;
}
function updateExpectancy(){
  const s=getSettings();
  const e=calcExpectancy(s), pf=calcPF(s);
  $('expectancy').textContent=(e>=0?'+':'')+e.toFixed(2)+'R';
  $('profitFactor').textContent=Number.isFinite(pf)?pf.toFixed(2):'∞';
  $('sumRates').textContent='100%';
  $('heroExpectancy').textContent=(e>=0?'+':'')+e.toFixed(2)+'R';
  $('heroWinrate').textContent=(s.win*100).toFixed(1)+'%';
  $('heroRR').textContent=s.rr.toFixed(1)+' : 1';
  $('heroRisk').textContent=(s.risk*100).toFixed(1)+'%';
  $('heroPF').textContent=Number.isFinite(pf)?pf.toFixed(2):'∞';
  const breakeven=100/(1+s.rr);
  $('breakevenWinrate').textContent=breakeven.toFixed(1)+'%';
  $('rrOut').value=s.rr.toFixed(1)+' : 1';
  $('riskOut').value=(s.risk*100).toFixed(1)+'%';
  updateRRChart(s.rr);
  updateRecoveryChart();
  updateRecoveryTable();
  updateStreakTable(s);
  updateStreakChart(s);
}
function randomWin(p){
  return Math.random() < p;
}
function streakProbabilityAtLeast(p, length, n){
  // Exact DP: probability of at least one run of "success" length in n Bernoulli trials.
  if(n < length) return 0;
  let dp = Array.from({length:length},()=>0);
  dp[0]=1;
  let noRun=1;
  // State holds probability of no target run and current consecutive successes.
  let states = new Array(length).fill(0);
  states[0]=1;
  for(let i=0;i<n;i++){
    const next = new Array(length).fill(0);
    for(let k=0;k<length;k++){
      const v=states[k];
      if(!v) continue;
      // failure resets run
      next[0]+=v*(1-p);
      // success extends unless it creates target
      if(k+1<length) next[k+1]+=v*p;
    }
    states=next;
  }
  const no=states.reduce((a,b)=>a+b,0);
  return 1-no;
}
function recoveryNeeded(dd){ return dd>=1 ? Infinity : dd/(1-dd); }

function simulate(s){
  const paths=[];
  const finalValues=[];
  const maxDDs=[];
  const pfs=[];
  const longestLosses=[];
  const longestWins=[];
  const avgSeries=new Float64Array(s.trades+1);
  avgSeries[0]=s.capital;
  let sumProfitable=0;

  for(let e=0;e<s.equities;e++){
    let equity=s.capital, peak=equity, maxDD=0, grossProfit=0, grossLoss=0;
    let lossStreak=0, winStreak=0, maxLossStreak=0, maxWinStreak=0;
    const path=new Float64Array(s.trades+1); path[0]=equity;
    for(let t=1;t<=s.trades;t++){
      const win=randomWin(s.win);
      const riskCash=equity*s.risk;
      if(win){
        equity += riskCash*s.rr;
        grossProfit += riskCash*s.rr;
        winStreak++; lossStreak=0;
        maxWinStreak=Math.max(maxWinStreak,winStreak);
      }else{
        equity -= riskCash;
        grossLoss += riskCash;
        lossStreak++; winStreak=0;
        maxLossStreak=Math.max(maxLossStreak,lossStreak);
      }
      if(equity<0) equity=0;
      peak=Math.max(peak,equity);
      const dd=peak>0 ? (peak-equity)/peak : 1;
      maxDD=Math.max(maxDD,dd);
      path[t]=equity;
      avgSeries[t]+=equity;
    }
    finalValues.push(equity);
    maxDDs.push(maxDD);
    pfs.push(grossLoss>0?grossProfit/grossLoss:Infinity);
    longestLosses.push(maxLossStreak);
    longestWins.push(maxWinStreak);
    if(equity>s.capital) sumProfitable++;
    paths.push(path);
  }
  for(let i=0;i<avgSeries.length;i++) avgSeries[i]/=s.equities;
  return {paths,finalValues,maxDDs,pfs,longestLosses,longestWins,avgSeries};
}

function mean(a){ return a.reduce((x,y)=>x+y,0)/a.length; }
function quantile(a,q){
  const b=[...a].sort((x,y)=>x-y); if(!b.length)return 0;
  const pos=(b.length-1)*q, lo=Math.floor(pos), hi=Math.ceil(pos);
  return b[lo]+(b[hi]-b[lo])*(pos-lo);
}
function histogram(values, bins=12, formatter=x=>x){
  if(!values.length)return {labels:[],data:[]};
  let min=Math.min(...values), max=Math.max(...values);
  if(min===max){min-=.5;max+=.5}
  const step=(max-min)/bins, counts=new Array(bins).fill(0);
  values.forEach(v=>{let i=Math.floor((v-min)/step);if(i===bins)i=bins-1;counts[i]++});
  const labels=counts.map((_,i)=>formatter(min+step*(i+.5)));
  return {labels,data:counts};
}
function compactMoney(v){
  const a=Math.abs(v);
  if(a>=1e9)return (v/1e9).toFixed(1)+' tỷ';
  if(a>=1e6)return (v/1e6).toFixed(1)+' tr';
  if(a>=1e3)return (v/1e3).toFixed(0)+'k';
  return Math.round(v).toString();
}
function compactPct(v){return (v*100).toFixed(1)+'%';}

function chartDefaults(){
  return {responsive:true,maintainAspectRatio:false,animation:false,
    plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},
    scales:{x:{grid:{display:false},ticks:{font:{size:9},maxTicksLimit:10}},
            y:{grid:{color:'#eef1f5'},ticks:{font:{size:9}}}}};
}
function destroy(name){if(charts[name]){charts[name].destroy();delete charts[name];}}

function updateRRChart(rr){
  destroy('rr');
  const xs=[]; const ys=[];
  for(let x=.5;x<=10;x+=.25){xs.push(x.toFixed(2));ys.push(100/(1+x));}
  charts.rr=new Chart($('rrChart'),{type:'line',data:{labels:xs,datasets:[{data:ys,borderWidth:2.5,pointRadius:0,tension:.25}]},
    options:{...chartDefaults(),scales:{x:{title:{display:true,text:'Risk/Reward'},grid:{display:false},ticks:{maxTicksLimit:10}},
    y:{title:{display:true,text:'Winrate hòa vốn (%)'},min:0,max:70}}}});
}
function updateStreakTable(s){
  let html='';
  for(let k=2;k<=12;k++){
    const pw=streakProbabilityAtLeast(s.win,k,s.trades);
    const pl=streakProbabilityAtLeast(s.loss,k,s.trades);
    html+=`<tr><td>${k} lệnh</td><td>${(pw*100).toFixed(1)}%</td><td>${(pl*100).toFixed(1)}%</td></tr>`;
  }
  $('streakTable').innerHTML=html;
}
function updateStreakChart(s){
  destroy('streak');
  const labels=[], win=[], loss=[];
  for(let k=2;k<=12;k++){labels.push(k);win.push(streakProbabilityAtLeast(s.win,k,s.trades)*100);loss.push(streakProbabilityAtLeast(s.loss,k,s.trades)*100)}
  charts.streak=new Chart($('streakChart'),{type:'line',data:{labels,datasets:[
    {label:'Chuỗi thắng',data:win,borderWidth:2,pointRadius:2,tension:.25},
    {label:'Chuỗi thua',data:loss,borderWidth:2,pointRadius:2,tension:.25}]},
    options:{...chartDefaults(),plugins:{legend:{display:true,position:'bottom',labels:{font:{size:9}}}},scales:{x:{title:{display:true,text:'Độ dài chuỗi'}},y:{min:0,max:100,title:{display:true,text:'Xác suất (%)'}}}}});
}
function updateRecoveryChart(){
  destroy('recovery');
  const drawdowns=[5,10,15,20,25,30,40,50,60,70,80,90];
  const needed=drawdowns.map(d=>d/(100-d)*100);
  charts.recovery=new Chart($('recoveryTableChart'),{
    type:'line',
    data:{
      labels:drawdowns.map(d=>d+'%'),
      datasets:[{
        label:'Mức tăng cần thiết',
        data:needed,
        borderWidth:2.5,
        pointRadius:3,
        tension:.2
      }]
    },
    options:{
      ...chartDefaults(),
      plugins:{
        legend:{display:false},
        tooltip:{
          callbacks:{
            label:ctx=>` Cần tăng lại: ${ctx.parsed.y.toFixed(2)}%`
          }
        }
      },
      scales:{
        x:{title:{display:true,text:'Mức sụt giảm vốn'}},
        y:{beginAtZero:true,title:{display:true,text:'Mức tăng cần thiết (%)'}}
      }
    }
  });
}

function updateRecoveryTable(){
  const drawdowns=[5,10,15,20,25,30,40,50,60,70,80,90];
  const table=document.getElementById('recoveryTable');
  if(!table)return;
  table.innerHTML=drawdowns.map(d=>{
    const needed=d/(100-d)*100;
    return `<tr><td>-${d}%</td><td>+${needed.toFixed(2)}%</td><td>${(100-d).toFixed(0)}% vốn còn lại</td></tr>`;
  }).join('');
}

function updateDistributions(s,r){
  destroy('profit');destroy('risk');
  const profits=r.finalValues.map(v=>v/s.capital-1);
  const h1=histogram(profits,12,x=>(x*100).toFixed(0)+'%');
  charts.profit=new Chart($('profitDistChart'),{type:'bar',data:{labels:h1.labels,datasets:[{data:h1.data,borderWidth:1}]},
    options:{...chartDefaults(),scales:{x:{ticks:{font:{size:8},maxRotation:45}},y:{beginAtZero:true,title:{display:true,text:'Số equity'}}}}});
  const h2=histogram(r.maxDDs,12,x=>(x*100).toFixed(0)+'%');
  charts.risk=new Chart($('riskDistChart'),{type:'bar',data:{labels:h2.labels,datasets:[{data:h2.data,borderWidth:1}]},
    options:{...chartDefaults(),scales:{x:{ticks:{font:{size:8},maxRotation:45}},y:{beginAtZero:true,title:{display:true,text:'Số equity'}}}}});
}
function updateEquityChart(s,r){
  destroy('equity');
  const datasets=[];
  r.paths.forEach((path,i)=>{
    datasets.push({label:`Equity ${i+1}`,data:Array.from(path),borderWidth:1,pointRadius:0,tension:.05,spanGaps:true});
  });
  datasets.push({label:'Trung bình',data:Array.from(r.avgSeries),borderWidth:3,pointRadius:0,tension:.05});
  charts.equity=new Chart($('equityChart'),{type:'line',data:{labels:Array.from({length:s.trades+1},(_,i)=>i),datasets},
    options:{...chartDefaults(),plugins:{legend:{display:false}},scales:{x:{title:{display:true,text:'Số lệnh'},ticks:{maxTicksLimit:12}},
    y:{title:{display:true,text:'Tài sản (đ)'},
      ticks:{callback:v=>compactMoney(v)}}}}});
}
function runSimulation(){
  const btn=$('runBtn'); btn.disabled=true; $('statusText').textContent='Đang mô phỏng...'; $('statusDot').style.background='#f0a51b';
  const s=getSettings();
  // Chunk with setTimeout so the UI can repaint before a large simulation.
  setTimeout(()=>{
    const r=simulate(s); lastResults={s,r};
    const avgFinal=mean(r.finalValues), avgDD=mean(r.maxDDs), avgPF=mean(r.pfs.filter(Number.isFinite));
    $('avgFinal').textContent=formatMoney(avgFinal);
    $('avgProfit').textContent=formatMoney(avgFinal-s.capital);
    $('avgDD').textContent=(avgDD*100).toFixed(2)+'%';
    $('avgPF').textContent=Number.isFinite(avgPF)?avgPF.toFixed(2):'∞';
    $('avgLoseStreak').textContent=mean(r.longestLosses).toFixed(1);
    $('profitablePct').textContent=(r.finalValues.filter(v=>v>s.capital).length/s.equities*100).toFixed(1)+'%';
    updateEquityChart(s,r); updateDistributions(s,r);
    $('statusText').textContent=`Hoàn tất • ${s.equities} equity × ${s.trades.toLocaleString('vi-VN')} lệnh`;
    $('statusDot').style.background='#1c9c5b'; btn.disabled=false;
    setTimeout(()=>document.getElementById('equityChartCard').scrollIntoView({behavior:'smooth',block:'center'}),80);
  },30);
}

$('initialCapital').addEventListener('input',e=>{
  const raw=e.target.value;
  const n=parseMoney(raw);
  if(raw.trim()!=='') e.target.value=formatInputMoney(n);
  updateExpectancy();
});
$('winrate').addEventListener('input',syncInputs);
$('rr').addEventListener('input',syncInputs);
$('riskPct').addEventListener('input',syncInputs);
$('trades').addEventListener('change',()=>{syncInputs()});
$('equities').addEventListener('change',()=>{syncInputs()});
$('runBtn').addEventListener('click',runSimulation);
$('resetBtn').addEventListener('click',()=>{
  $('initialCapital').value='100,000,000'; $('winrate').value=40; $('rr').value=3; $('riskPct').value=1; $('trades').value=1000; $('equities').value=50;
  syncInputs();
  $('statusText').textContent='Sẵn sàng'; $('statusDot').style.background='#1c9c5b';
});

syncInputs();
