#!/usr/bin/env node
/**
 * 紫微运势 v3 —— ①折线图Y轴自适应(不超界) ②加解读(interp) ③大限到100岁 ④流年竖向
 */
const path=require('path'),fs=require('fs');
const { ensureWorkspace } = require('./_workspace');
const WS = ensureWorkspace();
const {astro}=require(path.join(__dirname,'vendor/iztro/lib/index.js'));
// 星曜分类/打分逻辑统一至 _ziwei_common(流年运势:WEIGHT_LIU + 计入流年虚吉星)
const _Z=require('./_ziwei_common');
const { lookup: empower } = require('./_empower');
const {DIMS,WEIGHT_LIU}=_Z;
const judgeDim=(a,y,pn)=>_Z.judgeDim(a,y,pn,{weight:WEIGHT_LIU,withLiu:true});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// 🔮 解读表(同八字,基于预测指引)
const INTERP={'财凶':'破财/收入波动;父辈耗','灾凶':'健康/血光/意外','子凶':'子女事谨慎;胎停(若孕育)','禄凶':'事业压力/变动','考吉':'学业/资质/深造;贵人','身凶':'过劳/精力降','身吉':'精力充沛/安顿','禄吉':'晋升/掌权','财吉':'得财/理财机遇','考凶':'学业受阻','友吉':'合作得力/担财','友凶':'竞争/劫财/口舌','妻凶':'感情波折','宅凶':'房产波折','父凶':'父辈健康/家耗'};
const interpret=d=>DIMS.map(([k])=>{const v=d[k].verdict,key=k+v;const base=INTERP[key]||'';if(v==='凶'){const e=empower('interpret',key);return base?(base+'→'+e.transform):e.transform;}return base;}).filter(Boolean).join('；');
const argv=process.argv.slice(2);
let dateStr,timeIdx,gender,startYear,endYear,outPath;
if(argv.length>=3){[dateStr,timeIdx,gender]=argv;timeIdx=Number(timeIdx);startYear=argv[3]?Number(argv[3]):1994;endYear=argv[4]?Number(argv[4]):(Number(dateStr.split('-')[0])+99);outPath=argv[5]||path.join(WS,`紫微运势-${dateStr.split('-')[0]}.html`);}
else{dateStr='2000-08-16';timeIdx=10;gender='男';startYear=1994;endYear=2092;outPath=path.join(WS,'紫微运势-2000.html');console.error(`[demo]→${outPath}`);}
const a=astro.bySolar(dateStr,timeIdx,gender,true,'zh-CN');
const birthYear=Number(dateStr.split('-')[0]);
// ③大限到100岁(filter ages<=100)
const daXians=a.palaces.filter(p=>p.decadal&&p.decadal.range&&p.decadal.range[1]<=100).map(p=>({dk:p.decadal.heavenlyStem+p.decadal.earthlyBranch,years:(birthYear+p.decadal.range[0]-1)+'-'+(birthYear+p.decadal.range[1]-1),ages:p.decadal.range[0]+'-'+p.decadal.range[1],palace:p})).sort((x,y)=>parseInt(x.ages)-parseInt(y.ages));
const data=[],byDy={};
for(let y=startYear;y<=endYear;y++){const h=a.horoscope(new Date(`${y}-06-01`));const dec=h.decadal,yi=h.yearly;if(!dec)continue;{const _xs=y-birthYear+1,_st=daXians[0]?parseInt(daXians[0].ages):5;if(_xs<_st||_xs>100)continue;}const dk=dec.heavenlyStem+dec.earthlyBranch;const liuMing=a.palaces[yi.palaceNames.indexOf('命宫')]?a.palaces[yi.palaceNames.indexOf('命宫')].earthlyBranch:'?';const dims={};DIMS.forEach(([d,pn])=>dims[d]=judgeDim(a,yi,pn));data.push({year:y,taiSui:yi.heavenlyStem+yi.earthlyBranch,liuMing,mutagen:`${yi.mutagen[0]}禄/${yi.mutagen[1]}权/${yi.mutagen[2]}科/${yi.mutagen[3]}忌`,dims,dk});if(!byDy[dk])byDy[dk]=[];byDy[dk].push(data[data.length-1]);}
const currentDk=(data.find(l=>l.year===2026)||{dk:daXians[0]?daXians[0].dk:''}).dk;
const allData=JSON.stringify(data.map(l=>({y:l.year,ck:l.dk,d:Object.fromEntries(DIMS.map(([k])=>[k,l.dims[k].score]))})));
const dyCards=daXians.map(d=>{const isNow=d.dk===currentDk;const ms=(d.palace.majorStars||[]).map(s=>s.name).slice(0,2).join(' ');return `<div class="dy-card${isNow?' now':''}" data-dy="${esc(d.dk)}" onclick="showDy('${esc(d.dk)}')"><div class="dy-gz">${esc(d.dk)}${isNow?'<span class="now-tag">当前</span>':''}</div><div class="dy-ya">${esc(d.years)}年 · ${esc(d.ages)}岁</div><div class="dy-palace">@${esc(d.palace.earthlyBranch)} ${esc(ms)||'空'}</div></div>`;}).join('');
const dyPanels=daXians.map(d=>{const lys=byDy[d.dk]||[];const rows=lys.map(l=>`<div class="ly-row"><span class="ly-year">${l.year}</span><span class="ly-gz">${esc(l.taiSui)}</span><span class="ly-branch">流命@${esc(l.liuMing)}</span><span class="mutagen">${esc(l.mutagen)}</span><span class="dim-row">${DIMS.map(([k])=>`<span class="dim-badge d-${l.dims[k].verdict}">${k}</span>`).join('')}</span></div><div class="ly-interp">🔮 ${esc(interpret(l.dims)||'平稳年')}</div>`).join('');return `<div class="dy-panel" id="panel-${esc(d.dk)}">${rows||'<p class="empty">该大限范围外(无流年)</p>'}</div>`;}).join('');
const html=`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>紫微运势·v3</title>
<style>
:root{--paper:#f6efe1;--ink:#2a2118;--v:#9c2b22;--gold:#9a7a2e;--jade:#3f6b4e;--line:#cdb98a}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:"PingFang SC","Microsoft YaHei",serif;background:var(--paper);color:var(--ink);line-height:1.6;padding:14px}
.wrap{max-width:1100px;margin:0 auto}
header{text-align:center;padding:12px 0;border-bottom:3px double var(--line);margin-bottom:12px}
h1{font-size:24px;color:var(--v)}.sub{font-size:12px;color:#665;margin-top:3px}
.chart-section{background:#fff;border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:12px}
.chart-title{font-size:14px;color:var(--v);font-weight:700;margin-bottom:4px}
.dy-section{margin-bottom:12px}.dy-section h3{font-size:13px;color:#543;margin-bottom:6px}
.dy-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.dy-card{min-width:130px;flex-shrink:0;padding:8px;border:1.5px solid var(--line);border-radius:6px;cursor:pointer;background:rgba(255,253,247,.85);transition:.15s;text-align:center}
.dy-card:hover{border-color:var(--v);transform:translateY(-1px)}.dy-card.active{border-color:var(--v);background:rgba(156,43,34,.08)}.dy-card.now{border-color:var(--v)}
.dy-gz{font-size:16px;font-weight:800}.dy-ya{font-size:10px;color:var(--gold);margin:1px 0}.dy-palace{font-size:10px;color:#765}
.now-tag{background:var(--v);color:#fff;font-size:8px;padding:1px 4px;border-radius:6px;margin-left:2px}
.ly-section h3{font-size:13px;color:#543;margin-bottom:8px}
.dy-panel{display:none}.dy-panel.active{display:block}
.ly-row{display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(255,253,247,.7);border:1px solid var(--line);border-radius:6px;margin-bottom:2px;flex-wrap:wrap;font-size:12px}
.ly-year{font-size:14px;font-weight:800;color:var(--v);min-width:36px}.ly-gz{font-weight:700}.ly-branch{font-size:11px;color:var(--gold)}
.mutagen{font-size:10px;color:#543;background:var(--paper);padding:2px 6px;border-radius:3px}
.dim-row{display:flex;gap:2px;flex-wrap:wrap;margin-left:auto}
.dim-badge{font-size:9px;padding:1px 4px;border-radius:2px;font-weight:600}
.d-吉{background:rgba(63,107,78,.2);color:var(--jade)}.d-凶{background:rgba(156,43,34,.18);color:var(--v)}.d-平{background:var(--paper);color:#765}
.ly-interp{font-size:11px;color:var(--gold);padding:3px 10px 6px;margin-bottom:4px;line-height:1.5}
.empty{color:#a96;padding:10px;text-align:center}
.dot:hover{fill-opacity:0.6;stroke-opacity:1;cursor:pointer}
.chart-tip{position:absolute;background:#1a1a2e;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;pointer-events:none;z-index:10;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.4);line-height:1.7}
#chart-area{position:relative;min-height:100px}
.disclaim{background:#3a2f22;color:#e8dcc2;padding:10px;border-radius:8px;font-size:11px;line-height:1.6;border-left:4px solid var(--v);margin-top:12px}
.disclaim b{color:#f0c674}
</style></head><body><div class="wrap">
<header><h1>紫微运势·大限流年</h1><div class="sub">${esc(dateStr)} 戌时 ${gender} · ${esc(a.fiveElementsClass)} · 命${esc(a.palaces.find(p=>p.name==='命宫').majorStars.map(s=>s.name).join(''))}</div></header>
<div class="chart-section"><div class="chart-title">📊 运势折线图（整体/财官/印比 · 点击大限联动 · Y轴自适应不超界）</div><div id="chart-area"></div></div>
<div class="dy-section"><h3>🔄 大限（${daXians.length}个·到100岁·点击切换）</h3><div class="dy-row">${dyCards}</div></div>
<div class="ly-section"><h3>📅 流年列表（竖向·含解读）</h3>${dyPanels}</div>
<div class="disclaim"><b>⚠</b> 紫微十维度为简化规则(宫位星象+四化)，解读为规则化自动(基于预测指引表)。概率性非定论，命理非实证科学，仅供研究/娱乐，不替代专业决策。</div>
</div>
<script>
const ALL=${allData};const DN=${JSON.stringify(DIMS.map(([d])=>d))};
function drawChart(items){
  const area=document.getElementById('chart-area');
  if(!items.length){area.innerHTML='<p style="color:#888;padding:16px;text-align:center">该大限无流年数据</p>';return;}
  const W=860,H=220,pl=34,pr=14,pt=12,pb=24,N=items.length,xs=(W-pl-pr)/(N-1||1),ym=H-pb-(H-pt-pb)/2;
  const series=[['整体运势','#2c4a63',2.5,l=>DN.reduce((s,d)=>s+(l.d[d]||0),0)],['财官·忌','#b9462f',1.6,l=>['财','父','宅','子','禄','灾'].reduce((s,d)=>s+(l.d[d]||0),0)/6],['印比·喜','#4a7a4e',1.6,l=>['考','身','友'].reduce((s,d)=>s+(l.d[d]||0),0)/3]];
  // ①Y轴自适应:按数据最大绝对值缩放,线不超界
  const maxAbs=Math.max(...items.flatMap(l=>series.map(([,,,fn])=>Math.abs(fn(l)))),1);
  const yS=(H-pt-pb)/2/(maxAbs*1.15);
  const Pt=(i,s)=>(pl+i*xs).toFixed(1)+','+(ym-s*yS).toFixed(1);
  // grid动态刻度(按maxAbs)
  const ticks=[-1,-.5,0,.5,1].map(m=>Math.round(maxAbs*m*10)/10);
  const grid=ticks.map(s=>'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(ym-s*yS).toFixed(1)+'" y2="'+(ym-s*yS).toFixed(1)+'" stroke="#eee"/><text x="'+(pl-3)+'" y="'+(ym-s*yS+3).toFixed(1)+'" font-size="8" text-anchor="end" fill="#999">'+s+'</text>').join('');
  const lines=series.map(([n,c,w,fn])=>'<polyline points="'+items.map((l,i)=>Pt(i,fn(l))).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="'+w+'"/>').join('');
  const dots=series.map(([n,c,w,fn])=>items.map((l,i)=>{const x=(pl+i*xs).toFixed(1),y=(ym-fn(l)*yS).toFixed(1),v=fn(l).toFixed(1),det=DN.map(d=>d+':'+(l.d[d]>0?'+':'')+l.d[d]).join(' ');return '<circle cx="'+x+'" cy="'+y+'" r="10" fill="'+c+'" fill-opacity="0" stroke="'+c+'" stroke-opacity="0" stroke-width="2" pointer-events="all" class="dot"><title>📅 '+l.y+'年 ['+n+']: '+v+' | '+det+'</title></circle>';}).join('')).join('');
  const xLab=items.map((l,i)=>'<text x="'+(pl+i*xs).toFixed(0)+'" y="'+(H-pb+11)+'" font-size="8" text-anchor="middle" fill="#999">'+l.y+'</text>').join('');
  const lg=series.map(([n,c])=>'<span style="color:'+c+';font-size:11px;margin:0 8px;font-weight:600">■'+n+'</span>').join('');
  area.innerHTML='<div style="text-align:center;margin:3px 0">'+lg+'</div><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;background:#fafafa;border-radius:5px">'+grid+'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+ym+'" y2="'+ym+'" stroke="#bbb"/>'+lines+dots+xLab+'</svg><div class="chart-tip" id="ctip" style="display:none"></div>';
  var svg=area.querySelector('svg');var tip=document.getElementById('ctip');
  svg.addEventListener('mousemove',function(e){var r=svg.getBoundingClientRect();var sx=W/r.width;var mx=(e.clientX-r.left)*sx;var idx=Math.round((mx-pl)/xs);if(idx<0||idx>=N){tip.style.display='none';return;}var l=items[idx];var h='<b>📅 '+l.y+'年</b>';series.forEach(function(s){h+='<br><span style="color:'+s[1]+'">■</span> '+s[0]+': <b>'+s[3](l).toFixed(1)+'</b>';});var det=DN.map(function(d){return d+':'+(l.d[d]>0?'+':'')+(l.d[d]||0);}).join(' ');h+='<br><span style="font-size:10px;color:#aaa">'+det+'</span>';tip.innerHTML=h;tip.style.display='block';var px=e.clientX-r.left+12;var py=e.clientY-r.top-10;if(px>r.width-220)px=r.width-220;tip.style.left=px+'px';tip.style.top=py+'px';});
  svg.addEventListener('mouseleave',function(){tip.style.display='none';});
}
function showDy(dk){document.querySelectorAll('.dy-panel').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.dy-card').forEach(c=>c.classList.remove('active'));document.getElementById('panel-'+dk)?.classList.add('active');document.querySelector('[data-dy="'+dk+'"]')?.classList.add('active');drawChart(ALL.filter(l=>l.ck===dk));}
showDy('${esc(currentDk)}');
</script></body></html>`;
fs.writeFileSync(outPath,html);console.error(`✅ ${outPath} (${data.length}年, ${daXians.length}大限≤100岁, Y轴自适应, 含解读)`);
