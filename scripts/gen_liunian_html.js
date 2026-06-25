#!/usr/bin/env node
/**
 * 八字运势·上下布局 v2 —— 修复: ①大运显示「年份年·岁数岁」②范围扩大覆盖全部大运 ③折线图3条(整体/财官/印比) ④流年竖向list
 */
const { analyze } = require('./bazi_core');
const fs = require('fs');
const path = require('path');
const { ensureWorkspace } = require('./_workspace');
const WS = ensureWorkspace();
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
const DIMS = ['妻','财','子','禄','父','身','友','考','宅','灾'];
const X = {财:'慎投资',父:'关注父辈',宅:'房产谨慎',妻:'感情维系',灾:'注意健康',身:'勿过劳',子:'子女留意',禄:'事业稳重',考:'学业努力',友:'人际谨慎'};
const J = {财:'理财机遇',父:'父辈康',禄:'晋升',考:'深造',子:'子女喜',妻:'感情顺',友:'人际',身:'精力',宅:'置业',灾:'平安'};
function advice(d){const x=DIMS.filter(k=>d[k].verdict==='凶'),j=DIMS.filter(k=>d[k].verdict==='吉'),p=[];if(x.length)p.push('⚠'+x.map(k=>k).join('/'));if(j.length)p.push('✓'+j.map(k=>k).join('/'));return p.join(' ')||'平稳';}
// 🔮 预测解读(基于bazi-method第十三节预测指引表,规则化自动解读)
const INTERP={'财凶':'破财/收入波动/投资损;父辈耗;感情波折','灾凶':'健康/血光/意外;官非压力','子凶':'子女事谨慎/胎停(若孕育);健康克身','禄凶':'事业压力/受克/变动','考吉':'学业/资质/深造/文凭;长辈贵人','身凶':'健康透支/过劳/精力降','身吉':'精力充沛/安顿','禄吉':'晋升/掌权/地位','财吉':'得财/理财机遇/置业','考凶':'学业受阻/文书不利','友吉':'合作得力/人际助/担财','友凶':'竞争/劫财/口舌','妻凶':'感情波折/妻事不顺','宅凶':'房产波折/家宅耗','父凶':'父辈健康/家耗'};
function interpret(d){return DIMS.map(k=>INTERP[k+d[k].verdict]).filter(Boolean).join('；');}
const argv = process.argv.slice(2);
let Y,Mo,D,H,MIN,gender,startYear,endYear,outPath;
if(argv.length>=6){[Y,Mo,D,H,MIN]=argv.slice(0,5).map(Number);gender=argv[5];startYear=argv[6]?Number(argv[6]):1994;endYear=argv[7]?Number(argv[7]):(Y+99);outPath=argv[8]||path.join(WS,`八字运势-${Y}.html`);}
else{Y=2000;Mo=8;D=16;H=14;MIN=30;gender='男';startYear=1994;endYear=Y+99;outPath=path.join(WS,'八字运势-2000.html');console.error(`[demo]→${outPath}`);}
const r=analyze(Y,Mo,D,H,MIN,gender,startYear,endYear);
const c=r.chart;
const byDy={};r.liunian.forEach(l=>{(byDy[l.dayun]=byDy[l.dayun]||[]).push(l);});
const currentDy=(r.liunian.find(l=>l.year===2026)||{dayun:c.daYun[0]&&c.daYun[0].ganzhi}).dayun;
const allData=JSON.stringify(r.liunian.map(l=>({y:l.year,dy:l.dayun,d:Object.fromEntries(DIMS.map(k=>[k,l.baziDims[k].score]))})));
// ①大运卡: 年份年·岁数岁
const dyCards=c.daYun.filter(d=>Number(d.ages.split('-')[1])<=100).map(d=>{const isNow=d.ganzhi===currentDy;const dm=DIMS.filter(k=>d.dims[k].verdict!=='平').map(k=>`<span class="mini ${d.dims[k].verdict}">${k}</span>`).join('');return `<div class="dy-card${isNow?' now':''}" data-dy="${esc(d.ganzhi)}" onclick="showDy('${esc(d.ganzhi)}')"><div class="dy-gz">${esc(d.ganzhi)}${isNow?'<span class="now-tag">当前</span>':''}</div><div class="dy-ya">${esc(d.years)}年 · ${esc(d.ages)}岁</div><div class="dy-mini">${dm||'<span class="mini 平">平</span>'}</div></div>`;}).join('');
// ④流年竖向list(每流年一行)
const dyPanels=c.daYun.filter(d=>Number(d.ages.split('-')[1])<=100).map(d=>{const lys=byDy[d.ganzhi]||[];const rows=lys.map(l=>{const badges=DIMS.map(k=>{const b=l.dayunDims&&l.dayunDims[k]?l.dayunDims[k].verdict:'平';const c2=l.baziDims[k].verdict;const a=(b==='凶'&&c2==='凶')?'大凶':(b==='吉'&&c2==='吉')?'大吉':c2;return `<span class="dim-badge d-${a==='大凶'?'凶':a==='大吉'?'吉':a}" title="大运${b}·流年${c2}">${k}</span>`;}).join('');return `<div class="ly-row"><span class="ly-year">${l.year}</span><span class="ly-gz">${esc(l.taiSui)}</span><span class="ly-age">${l.age}岁</span><span class="ly-vd v-${l.verdict}">${l.verdict}</span><span class="dim-row">${badges}</span><span class="ly-adv">${esc(advice(l.baziDims))}</span></div><div class="ly-interp">🔮 ${esc(interpret(l.baziDims)||'平稳年')}</div>`;}).join('');return `<div class="dy-panel" id="panel-${esc(d.ganzhi)}">${rows||'<p class="empty">该大运范围外(无流年数据)</p>'}</div>`;}).join('');
const html=`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>八字运势·${esc(c.fourPillars.join(''))}</title>
<style>
:root{--paper:#f4f6f3;--paper2:#e7ece4;--ink:#23302a;--wood:#4a7a4e;--fire:#b9462f;--earth:#b08a3e;--indigo:#2c4a63;--line:#bcc8b8}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:"PingFang SC","Microsoft YaHei",serif;background:var(--paper);color:var(--ink);line-height:1.6;padding:14px}
.wrap{max-width:1100px;margin:0 auto}
header{text-align:center;padding:12px 0;border-bottom:3px double var(--line);margin-bottom:12px}
h1{font-size:24px;color:var(--indigo)}.sub{font-size:12px;color:#666;margin-top:3px}
.chart-section{background:#fff;border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:12px}
.chart-title{font-size:14px;color:var(--indigo);font-weight:700;margin-bottom:4px}
.dy-section{margin-bottom:12px}.dy-section h3{font-size:13px;color:#555;margin-bottom:6px}
.dy-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.dy-card{min-width:120px;flex-shrink:0;padding:8px;border:1.5px solid var(--line);border-radius:6px;cursor:pointer;background:rgba(252,253,251,.8);transition:.15s;text-align:center}
.dy-card:hover{border-color:var(--indigo);transform:translateY(-1px)}
.dy-card.active{border-color:var(--indigo);background:rgba(44,74,99,.1);box-shadow:0 2px 8px rgba(44,74,99,.1)}
.dy-card.now{border-color:var(--fire)}
.dy-gz{font-size:16px;font-weight:800}.dy-ya{font-size:10px;color:var(--earth);margin:1px 0}.dy-mini{display:flex;gap:2px;justify-content:center;flex-wrap:wrap}
.mini{font-size:8px;padding:1px 3px;border-radius:2px}.mini.吉{background:rgba(74,122,78,.2);color:var(--wood)}.mini.凶{background:rgba(185,70,47,.18);color:var(--fire)}.mini.平{background:var(--paper2);color:#888}
.now-tag{background:var(--fire);color:#fff;font-size:8px;padding:1px 4px;border-radius:6px;margin-left:2px}
.ly-section h3{font-size:13px;color:#555;margin-bottom:8px}
.dy-panel{display:none}.dy-panel.active{display:block}
.ly-row{display:flex;align-items:center;gap:6px;padding:7px 10px;background:rgba(252,253,251,.7);border:1px solid var(--line);border-radius:6px;margin-bottom:5px;flex-wrap:wrap;font-size:12px}
.ly-year{font-size:15px;font-weight:800;color:var(--fire);min-width:38px}.ly-gz{font-weight:700}.ly-age{color:#888;font-size:11px}
.ly-vd{font-size:10px;font-weight:700;padding:1px 7px;border-radius:8px}
.v-吉{background:rgba(74,122,78,.2);color:var(--wood)}.v-凶{background:rgba(185,70,47,.18);color:var(--fire)}.v-平{background:var(--paper2);color:#888}
.dim-row{display:flex;gap:2px;flex-wrap:wrap}
.dim-badge{font-size:9px;padding:1px 4px;border-radius:2px;font-weight:600;cursor:help}
.d-吉{background:rgba(74,122,78,.2);color:var(--wood)}.d-凶{background:rgba(185,70,47,.18);color:var(--fire)}.d-平{background:var(--paper2);color:#888}
.ly-adv{font-size:11px;color:var(--earth);margin-left:auto}
.empty{color:#888;padding:10px;text-align:center}
.dot:hover{fill-opacity:0.6;stroke-opacity:1;cursor:pointer}
.chart-tip{position:absolute;background:#1a1a2e;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;pointer-events:none;z-index:10;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.4);line-height:1.7}
#chart-area{position:relative;min-height:100px}
.disclaim{background:#26323a;color:#dce6df;padding:10px;border-radius:8px;font-size:11px;line-height:1.6;border-left:4px solid var(--fire);margin-top:12px}
.disclaim b{color:#9bc69e}
</style></head><body><div class="wrap">
<header><h1>八字运势·大运流年</h1><div class="sub">${Y}-${Mo}-${D} ${gender} · ${esc(c.fourPillars.join(' '))} · ${esc(c.strength==='弱'?'身弱':'身旺')}喜${esc(c.yongShen.join('/'))}</div></header>
<div class="chart-section"><div class="chart-title">📊 运势折线图（整体/财官/印比 · 点击大运联动）</div><div id="chart-area"></div></div>
<div class="dy-section"><h3>🔄 大运（点击切换）</h3><div class="dy-row">${dyCards}</div></div>
<div class="ly-section"><h3>📅 流年列表</h3>${dyPanels}</div>
<div class="disclaim"><b>⚠</b> 十神喜忌简化规则，概率性非定论。命理非实证科学，仅供研究/娱乐，不替代专业决策。</div>
</div>
<script>
const ALL=${allData};const DN=${JSON.stringify(DIMS)};
function drawChart(items){
  const area=document.getElementById('chart-area');
  if(!items.length){area.innerHTML='<p style="color:#888;padding:16px;text-align:center">该大运无流年数据</p>';return;}
  const W=860,H=220,pl=34,pr=14,pt=12,pb=24,N=items.length,xs=(W-pl-pr)/(N-1||1),ym=H-pb-(H-pt-pb)/2;
  const series=[
    ['整体运势','#2c4a63',2.5,l=>DN.reduce((s,d)=>s+(l.d[d]||0),0)],
    ['财官·忌','#b9462f',1.6,l=>['财','父','宅','子','禄','灾'].reduce((s,d)=>s+(l.d[d]||0),0)/6],
    ['印比·喜','#4a7a4e',1.6,l=>['考','身','友'].reduce((s,d)=>s+(l.d[d]||0),0)/3],
  ];
  const maxAbs=Math.max(...items.flatMap(l=>series.map(([,,,fn])=>Math.abs(fn(l)))),1);
  const ys=(H-pt-pb)/2/(maxAbs*1.15);
  const P=(i,s)=>(pl+i*xs).toFixed(1)+','+(ym-s*ys).toFixed(1);
  const ticks=[-1,-.5,0,.5,1].map(m=>Math.round(maxAbs*m*10)/10);
  const grid=ticks.map(s=>'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(ym-s*ys).toFixed(1)+'" y2="'+(ym-s*ys).toFixed(1)+'" stroke="#eee"/><text x="'+(pl-3)+'" y="'+(ym-s*ys+3).toFixed(1)+'" font-size="8" text-anchor="end" fill="#999">'+s+'</text>').join('');
  const lines=series.map(([n,c,w,fn])=>'<polyline points="'+items.map((l,i)=>P(i,fn(l))).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="'+w+'"/>').join('');
  const dots=series.map(([n,c,w,fn])=>items.map((l,i)=>{const x=(pl+i*xs).toFixed(1),y=(ym-fn(l)*ys).toFixed(1),v=fn(l).toFixed(1),det=DN.map(d=>d+':'+(l.d[d]>0?'+':'')+l.d[d]).join(' ');return '<circle cx="'+x+'" cy="'+y+'" r="10" fill="'+c+'" fill-opacity="0" stroke="'+c+'" stroke-opacity="0" stroke-width="2" pointer-events="all" class="dot"><title>📅 '+l.y+'年 ['+n+']: '+v+' | '+det+'</title></circle>';}).join('')).join('');
  const xLab=items.map((l,i)=>'<text x="'+(pl+i*xs).toFixed(0)+'" y="'+(H-pb+11)+'" font-size="8" text-anchor="middle" fill="#999">'+l.y+'</text>').join('');
  const lg=series.map(([n,c])=>'<span style="color:'+c+';font-size:11px;margin:0 8px;font-weight:600">■'+n+'</span>').join('');
  area.innerHTML='<div style="text-align:center;margin:3px 0">'+lg+'</div><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;background:#fafafa;border-radius:5px">'+grid+'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+ym+'" y2="'+ym+'" stroke="#bbb"/>'+lines+dots+xLab+'</svg><div class="chart-tip" id="ctip" style="display:none"></div>';
  var svg=area.querySelector('svg');var tip=document.getElementById('ctip');
  svg.addEventListener('mousemove',function(e){var r=svg.getBoundingClientRect();var sx=W/r.width;var mx=(e.clientX-r.left)*sx;var idx=Math.round((mx-pl)/xs);if(idx<0||idx>=N){tip.style.display='none';return;}var l=items[idx];var h='<b>📅 '+l.y+'年</b>';series.forEach(function(s){h+='<br><span style="color:'+s[1]+'">■</span> '+s[0]+': <b>'+s[3](l).toFixed(1)+'</b>';});var det=DN.map(function(d){return d+':'+(l.d[d]>0?'+':'')+(l.d[d]||0);}).join(' ');h+='<br><span style="font-size:10px;color:#aaa">'+det+'</span>';tip.innerHTML=h;tip.style.display='block';var px=e.clientX-r.left+12;var py=e.clientY-r.top-10;if(px>r.width-220)px=r.width-220;tip.style.left=px+'px';tip.style.top=py+'px';});
  svg.addEventListener('mouseleave',function(){tip.style.display='none';});
}
function showDy(gz){
  document.querySelectorAll('.dy-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.dy-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('panel-'+gz)?.classList.add('active');
  document.querySelector('[data-dy="'+gz+'"]')?.classList.add('active');
  drawChart(ALL.filter(l=>l.dy===gz));
}
showDy('${esc(currentDy)}');
</script></body></html>`;
fs.writeFileSync(outPath,html);console.error(`✅ ${outPath} (${r.liunian.length}年, ${c.daYun.length}大运)`);
