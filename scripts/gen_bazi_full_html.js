#!/usr/bin/env node
/**
 * 八字完整命书 HTML v4 —— 优化: ①字体再放大 ②神煞按地支归柱(日时柱同支也得神煞)
 *   ③五行进度条上色 ④解读区加置信度图例(🟢高/🟡中/🔴低)
 *   行表头命盘(日期/主星/天干/地支/藏干/副星/星运/自坐/空亡/纳音/神煞)+五行+刑冲+神煞+LLM解读+运势
 * 用法: node gen_bazi_full_html.js <Y> <M> <D> <H> <MIN> <男|女> [起年] [止年] [输出.html] [解读.json]
 */
const path = require('path'), fs = require('fs');
const { ensureWorkspace } = require('./_workspace');
const WS = ensureWorkspace();
const T = require(path.join(__dirname, 'vendor/tyme4ts/dist/lib/index.cjs'));
const { SolarTime, Gender } = T;
const { analyzeZhiRelations, analyzeGanRelations } = require(path.join(__dirname, 'vendor/bazi/bazi_relations.js'));
const { analyzeShensha } = require(path.join(__dirname, 'vendor/bazi/shensha.js'));
const { analyze, kongWang, ZHI_MAIN, GAN_WX } = require('./bazi_core');   // GAN_WX 复用 bazi_core(消除本地重复)
const { lookup: empower } = require('./_empower');

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const DIMS = ['妻','财','子','禄','父','身','友','考','宅','灾','艺'];
const INTERP = {'财凶':'破财/收入波动/投资损;父辈耗;感情波折','灾凶':'健康/血光/意外;官非压力','子凶':'子女事谨慎/胎停(若孕育);健康克身','禄凶':'事业压力/受克/变动','考吉':'学业/资质/深造/文凭;长辈贵人','身凶':'健康透支/过劳/精力降','身吉':'精力充沛/安顿','禄吉':'晋升/掌权/地位','财吉':'得财/理财机遇/置业','考凶':'学业受阻/文书不利','友吉':'合作得力/人际助/担财','友凶':'竞争/劫财/口舌','妻凶':'感情波折/妻事不顺','宅凶':'房产波折/家宅耗','父凶':'父辈健康/家耗','艺吉':'技艺施展/创新突破/才华得利','艺凶':'才华受抑/技艺瓶颈/劳神'};
const interpret = d => DIMS.map(k => INTERP[k+d[k].verdict]).filter(Boolean).join('；');
// 流年LLM解读: 大运基调(十年环境) × 流年应事(逐年触发) + 叠加提示(动态)
const interpretLN = l => {
  const dy = l.dayunDims || {};
  const dx = DIMS.filter(k=>dy[k]&&dy[k].verdict==='凶').slice(0,3);
  const dj = DIMS.filter(k=>dy[k]&&dy[k].verdict==='吉').slice(0,3);
  const lx = DIMS.filter(k=>l.baziDims[k].verdict==='凶');
  const lj = DIMS.filter(k=>l.baziDims[k].verdict==='吉');
  const p=[];
  if(dx.length) p.push(`〔${l.dayun}运·忌神基调:${dx.join('/')}〕`);
  if(dj.length) p.push(`〔${l.dayun}运·喜用基调:${dj.join('/')}〕`);
  if(lx.length) p.push('流年应凶:'+lx.map(k=>{const e=empower('interpret',k+'凶');return k+'→'+e.transform;}).join('；'));
  if(lj.length) p.push('流年应吉:'+lj.join('/'));
  if(dx.length&&lj.length) p.push('忌神运逢喜用流年·吉气打折');
  if(dj.length&&lx.length) p.push('喜用运逢忌神流年·凶势减轻');
  if(dx.length&&lx.length) p.push('忌运+忌年·凶叠加需防');
  if(dj.length&&lj.length) p.push('喜运+喜年·吉上添吉');
  return p.join('；')||'平稳';
};
const isMan = g => g==='男'||g==='man'||g==='M';
// GAN_WX 已从 bazi_core 复用(上方 require),原本地重复定义已清除

function paipan(Y, Mo, D, H, MIN, gender) {
  const G = isMan(gender) ? Gender.MAN : Gender.WOMAN;
  const st = SolarTime.fromYmdHms(Y, Mo, D, H, MIN, 0);
  const ec = st.getLunarHour().getEightChar();
  const me = ec.getDay().getHeavenStem();
  const cyc = [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getHour()];
  const nm = ['年','月','日','时'];
  const pillars = cyc.map((c,i) => {
    const z = c.getEarthBranch(), g = c.getHeavenStem();
    const hs = [z.getHideHeavenStemMain(),z.getHideHeavenStemMiddle(),z.getHideHeavenStemResidual()].filter(Boolean);
    return {
      pos: nm[i], ganzhi: c.getName(), gan: g.getName(), zhi: z.getName(), nayin: c.getSound().getName(),
      zhuXing: i===2 ? (isMan(gender) ? '元男' : '元女') : me.getTenStar(g).getName(),
      hide: hs.map(h=>h.getName()), hideTenGod: hs.map(h=>me.getTenStar(h).getName()),
      xingyun: me.getTerrain(z).getName(),
      zijuo: g.getTerrain(z).getName(),
      kongWang: kongWang(g.getName(), z.getName()),
    };
  });
  const wx = {木:0,火:0,土:0,金:0,水:0};
  pillars.forEach(pl => { wx[GAN_WX[pl.gan]]++; pl.hide.forEach(h => wx[GAN_WX[h]]++); });
  return {
    info: { fourPillars:cyc.map(c=>c.getName()), dayMaster:me.getName(),
      fetalOrigin:ec.getFetalOrigin().getName(), ownSign:ec.getOwnSign().getName(), bodySign:ec.getBodySign().getName(),
      dayKong:kongWang(me.getName(), ec.getDay().getEarthBranch().getName()) },
    pillars, wx,
    relations: { zhi:analyzeZhiRelations(cyc.map((c,i)=>[nm[i],c.getEarthBranch().getName()])),
                 gan:analyzeGanRelations(cyc.map((c,i)=>[nm[i],c.getHeavenStem().getName()])) },
    shensha: analyzeShensha(cyc.map((c,i)=>({pos:nm[i],gan:c.getHeavenStem().getName(),zhi:c.getEarthBranch().getName()})), gender, cyc[0].getSound().getName())
  };
}

const argv = process.argv.slice(2);
let Y,Mo,D,H,MIN,gender,startYear,endYear,outPath,interpPath,liunianJiePath;
if (argv.length >= 6) {
  [Y,Mo,D,H,MIN] = argv.slice(0,5).map(Number); gender = argv[5];
  startYear = argv[6] ? Number(argv[6]) : 1994;
  endYear   = argv[7] ? Number(argv[7]) : (Y+99);
  outPath   = argv[8] || path.join(WS, `八字命书-${Y}.html`);
  interpPath = argv[9] || '';
  liunianJiePath = argv[10] || '';
} else {
  Y=2000;Mo=8;D=16;H=14;MIN=30;gender='男';startYear=1994;endYear=Y+99;outPath=path.join(WS,'八字命书-2000.html');interpPath='';liunianJiePath='';
  console.error('[demo]→'+outPath);
}

const p = paipan(Y,Mo,D,H,MIN,gender);
const r = analyze(Y,Mo,D,H,MIN,gender,startYear,endYear);
const c = r.chart;
let interp = {};
if (interpPath && fs.existsSync(interpPath)) { try { interp = JSON.parse(fs.readFileSync(interpPath,'utf8')); } catch(e){ console.error('解读JSON解析失败:',e.message); } }
let liunianJie = {};
if (liunianJiePath && fs.existsSync(liunianJiePath)) { try { liunianJie = JSON.parse(fs.readFileSync(liunianJiePath,'utf8')); } catch(e){ console.error('流年解读JSON解析失败:',e.message); } }
const dyJie = gz => (liunianJie['大运解读']||{})[gz] || '';
const lyJie = yr => (liunianJie['流年解读']||{})[String(yr)] || '';

// 神煞按地支归柱: position地支=戌的神煞, 分到所有地支=戌的柱(月/日/时同戌都得)
const ssByPos = {年:[],月:[],日:[],时:[]};
const zhiOf = {年:p.pillars[0].zhi, 月:p.pillars[1].zhi, 日:p.pillars[2].zhi, 时:p.pillars[3].zhi};
p.shensha.forEach(s => {
  const pos = String(s.position);
  const mz = pos.match(/支([子丑寅卯辰巳午未申酉戌亥])/);
  const mg = pos.match(/^([年月日时])干/);
  if (mz) {
    const zhi = mz[1];
    ['年','月','日','时'].forEach(k => { if (zhiOf[k] === zhi && !ssByPos[k].includes(s.name)) ssByPos[k].push(s.name); });
  } else if (mg && ssByPos[mg[1]]) {
    if (!ssByPos[mg[1]].includes(s.name)) ssByPos[mg[1]].push(s.name);
  }
});

const dayKong = p.info.dayKong;
const dc = i => i===2 ? ' day-col' : '';
const zhuXingRow = p.pillars.map((pl,i)=>`<td class="${dc(i)}">${pl.zhuXing}</td>`).join('');
const ganRow = p.pillars.map((pl,i)=>`<td class="gz-big wx-${GAN_WX[pl.gan]}${dc(i)}">${pl.gan}</td>`).join('');
const zhiRow = p.pillars.map((pl,i)=>`<td class="gz-big wx-${GAN_WX[ZHI_MAIN[pl.zhi]]}${dc(i)}">${pl.zhi}</td>`).join('');
const hideRow = p.pillars.map((pl,i)=>`<td class="${dc(i)}">${pl.hide.map(h=>`<span class="hide-g wx-${GAN_WX[h]}">${h}<small>${GAN_WX[h]}</small></span>`).join(' ')}</td>`).join('');
const fuRow = p.pillars.map((pl,i)=>`<td class="${dc(i)}">${pl.hideTenGod.map(t=>`<span class="fu-g">${t}</span>`).join(' ')}</td>`).join('');
const xyRow = p.pillars.map((pl,i)=>`<td class="${dc(i)}">${pl.xingyun}</td>`).join('');
const zjRow = p.pillars.map((pl,i)=>`<td class="${dc(i)}">${pl.zijuo}</td>`).join('');
const kwRow = p.pillars.map((pl,i)=>`<td class="${dc(i)}">${pl.kongWang.join('')}</td>`).join('');
const nyRow = p.pillars.map((pl,i)=>`<td class="${dc(i)}">${pl.nayin}</td>`).join('');
const ssRow = p.pillars.map((pl,i)=>{
  const list = (ssByPos[pl.pos]||[]).slice();
  if (dayKong.includes(pl.zhi)) list.push('<span class="ss-kw">空亡</span>');
  return `<td class="ss-cell${dc(i)}">${list.length ? list.map(x=>`<span class="ss-g">${x}</span>`).join('') : '—'}</td>`;
}).join('');

const wxMax = Math.max(...Object.values(p.wx), 1);
const wxBar = Object.entries(p.wx).map(([k,v]) => `<div class="wx-row"><span class="wx-name wx-${k}">${k}</span><div class="wx-bar"><div class="wx-fill wx-${k}" style="width:${(v/wxMax*100).toFixed(0)}%"></div></div><span class="wx-cnt">${v}</span></div>`).join('');
const relList = [...p.relations.zhi, ...p.relations.gan].map(rr => `<span class="rel-tag">${rr.type}：${rr.detail}（${rr.positions.join('↔')}）</span>`).join('') || '<span class="rel-none">天干地支无明显刑冲合害（关系平淡）</span>';
const shenshaList = p.shensha.map(s => `<div class="ss-item"><b>${s.name}</b><span class="ss-pos">@${s.position}（${s.source}）</span><span class="ss-info">${s.info}</span></div>`).join('') || '<span class="rel-none">本命无明显神煞</span>';

const interpSec = (title, arr) => (arr && arr.length) ? `<div class="ip-card"><h4>${title}</h4>${arr.map(x=>`<p>${esc(x)}</p>`).join('')}</div>` : '';
const zhuSec = interp['柱解'] ? Object.entries(interp['柱解']).map(([k,arr]) => interpSec(k, arr)).join('') : '';
const legendCard = `<div class="ip-card legend"><h4>解读置信度图例</h4><p><span class="conf high">🟢高</span> 依据充分、较确定 ｜ <span class="conf mid">🟡中</span> 有依据、中等把握 ｜ <span class="conf low">🔴低</span> 弱关联/单一依据、仅供参考</p></div>`;
const interpBlock = [
  legendCard,
  interpSec('日主旺衰', interp['日主旺衰']),
  interpSec('喜用神', interp['喜用神']),
  `<div class="ip-card"><h4>五行分布（含藏干）</h4>${wxBar}${(interp['五行分布']||[]).map(x=>`<p>${esc(x)}</p>`).join('')}</div>`,
  interpSec('格局', interp['格局']),
  zhuSec ? `<div class="ip-card"><h4>四柱解析</h4>${zhuSec}</div>` : '',
  interpSec('六亲对应', interp['六亲']),
  interpSec('刑冲克害', interp['刑冲克害']),
  interpSec('神煞解析', interp['神煞']),
  interpSec('命主总论', interp['命主总论']),
].join('');

const byDy = {}; r.liunian.forEach(l => { (byDy[l.dayun]=byDy[l.dayun]||[]).push(l); });
const currentDy = (r.liunian.find(l=>l.year===2026) || {dayun:c.daYun[0]&&c.daYun[0].ganzhi}).dayun;
const allData = JSON.stringify(r.liunian.map(l => ({y:l.year, dy:l.dayun, d:Object.fromEntries(DIMS.map(k=>[k, (l.baziDims[k].score||0) + ((l.dayunDims&&l.dayunDims[k])?l.dayunDims[k].score:0)*0.5]))})));  // 热力图: 流年维度 + 大运基调×0.5 (大运定十年环境×流年定逐年应事)
const advice = d => { const x=DIMS.filter(k=>d[k].verdict==='凶'), j=DIMS.filter(k=>d[k].verdict==='吉'), a=[]; if(x.length)a.push('⚠'+x.join('/')); if(j.length)a.push('✓'+j.join('/')); return a.join(' ')||'平稳'; };
const dyCards = c.daYun.filter(d=>Number(d.ages.split('-')[1])<=100).map(d => {
  const isNow = d.ganzhi===currentDy;
  const dm = DIMS.filter(k=>d.dims[k].verdict!=='平').map(k=>`<span class="mini ${d.dims[k].verdict}">${k}</span>`).join('');
  const jie = dyJie(d.ganzhi);
  return `<div class="dy-card${isNow?' now':''}${jie?' has-jie':''}" data-dy="${esc(d.ganzhi)}" onclick="showDy('${esc(d.ganzhi)}')" title="${esc(jie)}"><div class="dy-gz">${esc(d.ganzhi)}${isNow?'<span class="now-tag">当前</span>':''}${jie?'<span class="jie-tag">📖</span>':''}</div><div class="dy-ya">${esc(d.years)}年 · ${esc(d.ages)}岁</div><div class="dy-mini">${dm||'<span class="mini 平">平</span>'}</div></div>`;
}).join('');
const dyPanels = c.daYun.filter(d=>Number(d.ages.split('-')[1])<=100).map(d => {
  const lys = byDy[d.ganzhi] || [];
  const rows = lys.map(l => {
    const badges = DIMS.map(k => {
      const b = l.dayunDims && l.dayunDims[k] ? l.dayunDims[k].verdict : '平';
      const c2 = l.baziDims[k].verdict;
      const a = (b==='凶'&&c2==='凶')?'大凶':(b==='吉'&&c2==='吉')?'大吉':c2;
      const note = l.baziDims[k]._ ? '·'+l.baziDims[k]._ : '';
      return `<span class="dim-badge d-${a==='大凶'?'凶':a==='大吉'?'吉':a}" title="大运${b}·流年${c2}${note}">${k}</span>`;
    }).join('');
    const lText = lyJie(l.year) ? `🔮 ${esc(lyJie(l.year))}` : `🔮 ${esc(interpretLN(l))}`;
    return `<div class="ly-row"><span class="ly-year">${l.year}</span><span class="ly-gz">${esc(l.taiSui)}</span><span class="ly-age">${l.age}岁</span><span class="ly-vd v-${l.verdict}">${l.verdict}</span><span class="dim-row">${badges}</span><span class="ly-adv">${esc(advice(l.baziDims))}</span></div><div class="ly-interp">${lText}</div>`;
  }).join('');
  return `<div class="dy-panel" id="panel-${esc(d.ganzhi)}">${rows||'<p class="empty">该大运范围外(无流年数据)</p>'}</div>`;
}).join('');

function renderEmpowerBazi(chart) {
  const yong = chart.yongShen || [];
  const isWeak = chart.strength === '弱';
  const trait = isWeak ? empower('bazi_trait','身弱财多') : null;
  const chouShen = chart.jiShen || [];
  const bingFu = yong.includes('印') ? '专业学习·资质深耕'
               : yong.includes('食伤') ? '技艺创造·才华输出'
               : '务实经营·稳健积累';
  const zhiJi = `日主${chart.dayMaster}${isWeak?'身弱':'身旺'},喜${yong.join('·')}忌${chouShen.join('·')}——禀赋在${bingFu},扬长而行。`;
  const shunShi = isWeak
    ? `身弱喜印比,逢印比大运流年发力(深耕/合作),逢财官食伤运守成蓄力(忌冒进/透支)。`
    : `身旺喜财官食伤,逢财官食伤大运流年顺势拓展,逢印比运守成分流。`;
  return `<div class="empower"><div class="sec-title">🌞 积极引导 · 顺势而为</div>
    <div class="empower-card"><h4>知己 · 禀赋扬长</h4><p>${esc(zhiJi)}</p></div>
    <div class="empower-card"><h4>顺势 · 节奏功课</h4><p>${esc(shunShi)}</p></div>
    <div class="empower-card"><h4>行动 · 避坑指南</h4>${trait?`<p>${esc(trait.transform)}</p><p>宜:${esc(trait.action.join('、'))}</p><p class="mindset">${esc(trait.mindset)}</p>`:'<p>扬长避短,稳健前行。</p>'}</div>
  </div>`;
}
const empowerSection = renderEmpowerBazi(c);

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>八字命书·${esc(c.fourPillars.join(''))}</title>
<style>
:root{--paper:#f4f6f3;--paper2:#e7ece4;--ink:#23302a;--wood:#3c8c4f;--fire:#c0392b;--earth:#9a7a2e;--gold:#b8860b;--water:#2c5f8a;--line:#bcc8b8}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:"PingFang SC","Microsoft YaHei",serif;background:var(--paper);color:var(--ink);font-size:17px;line-height:1.75;padding:14px}
.wrap{max-width:1100px;margin:0 auto}
header{text-align:center;padding:12px 0;border-bottom:3px double var(--line);margin-bottom:12px}
h1{font-size:29px;color:var(--water);letter-spacing:2px}.sub{font-size:14.5px;color:#666;margin-top:5px}.sub b{color:var(--fire)}
section{background:#fff;border:1px solid var(--line);border-radius:8px;padding:15px;margin-bottom:12px}
.sec-title{font-size:18.5px;color:var(--water);font-weight:700;margin-bottom:11px;border-left:4px solid var(--water);padding-left:9px}
/* 行表头命盘 */
.base-pan{width:100%;border-collapse:collapse;background:#fffcf3;border:2px solid var(--earth);border-radius:8px;overflow:hidden;font-size:16px;table-layout:fixed}
.base-pan th,.base-pan td{border:1px solid var(--line);padding:10px 5px;text-align:center;vertical-align:middle}
.base-pan thead th{background:rgba(176,138,62,.22);color:var(--fire);font-size:16.5px;font-weight:700;height:42px}
.base-pan .rh{background:rgba(44,95,138,.1);color:var(--water);font-weight:700;font-size:15px;width:70px}
.base-pan .corner{background:rgba(176,138,62,.32);color:var(--earth)}
.base-pan .day-col{background:rgba(185,70,47,.07)}
.gz-big{font-size:32px;font-weight:800;line-height:1.1}
.wx-木{color:var(--wood)}.wx-火{color:var(--fire)}.wx-土{color:var(--earth)}.wx-金{color:var(--gold)}.wx-水{color:var(--water)}
.hide-g{display:inline-block;margin:0 2px;font-size:15px}.hide-g small{font-size:10.5px;opacity:.7}
.fu-g{display:inline-block;margin:0 3px;font-size:14.5px}
.ss-cell{line-height:1.7}.ss-g{display:inline-block;margin:2px 3px;font-size:13.5px;color:#445}.ss-kw{color:var(--fire);font-weight:700}
.aux-info{display:flex;flex-wrap:wrap;gap:8px 24px;margin-top:13px;font-size:15.5px;color:#555;justify-content:center}.aux-info span{white-space:nowrap}
.aux-info b{color:var(--fire)}
/* 五行/关系/神煞 */
.wx-row{display:flex;align-items:center;gap:9px;margin:7px 0}.wx-name{width:24px;font-weight:700;text-align:center;font-size:16.5px}
.wx-bar{flex:1;height:24px;background:var(--paper2);border-radius:12px;overflow:hidden;border:1px solid var(--line)}.wx-fill{height:100%;border-radius:12px;opacity:.85}
.wx-fill.wx-木{background:var(--wood)}.wx-fill.wx-火{background:var(--fire)}.wx-fill.wx-土{background:var(--earth)}.wx-fill.wx-金{background:var(--gold)}.wx-fill.wx-水{background:var(--water)}
.wx-cnt{width:28px;text-align:right;font-size:15px;color:#665;font-weight:600}
.rel-list{display:flex;flex-wrap:wrap;gap:7px}.rel-tag{background:rgba(185,70,47,.1);color:var(--fire);font-size:14px;padding:4px 10px;border-radius:4px}
.rel-none{color:#999;font-size:14px}
.ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(245px,1fr));gap:9px}
.ss-item{background:var(--paper2);padding:8px 12px;border-radius:6px;font-size:14px}.ss-item b{color:var(--wood)}.ss-pos{color:var(--earth);margin:0 5px}.ss-info{color:#665;display:block;font-size:12.5px;margin-top:2px}
/* 解读 */
.ip-card{background:var(--paper2);border-left:3px solid var(--wood);border-radius:6px;padding:12px 16px;margin:9px 0}
.ip-card h4{color:var(--wood);font-size:16px;margin-bottom:7px}.ip-card .ip-card{background:#fff;border-left-color:var(--earth)}
.ip-card .ip-card h4{color:var(--earth);font-size:14.5px}
.ip-card p{font-size:15px;margin:6px 0;color:#334;line-height:1.85}
.ip-card.legend{border-left-color:var(--gold);background:rgba(184,134,11,.08)}.ip-card.legend h4{color:var(--gold)}
.conf{font-weight:700}.conf.high{color:var(--wood)}.conf.mid{color:var(--gold)}.conf.low{color:var(--fire)}
/* 运势 */
.chart-title{font-size:17px;color:var(--water);font-weight:700;margin-bottom:5px}
.dy-row{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px}
.dy-card{min-width:132px;flex-shrink:0;padding:10px;border:1.5px solid var(--line);border-radius:6px;cursor:pointer;background:rgba(252,253,251,.8);transition:.15s;text-align:center}
.dy-card:hover{border-color:var(--water);transform:translateY(-1px)}.dy-card.active{border-color:var(--water);background:rgba(44,74,99,.1)}.dy-card.now{border-color:var(--fire)}
.dy-gz{font-size:18.5px;font-weight:800}.dy-ya{font-size:11.5px;color:var(--earth);margin:2px 0}.dy-mini{display:flex;gap:2px;justify-content:center;flex-wrap:wrap}
.mini{font-size:10px;padding:1px 3px;border-radius:2px}.mini.吉{background:rgba(74,122,78,.2);color:var(--wood)}.mini.凶{background:rgba(185,70,47,.18);color:var(--fire)}.mini.平{background:var(--paper2);color:#888}
.now-tag{background:var(--fire);color:#fff;font-size:9px;padding:1px 5px;border-radius:6px;margin-left:2px}
.jie-tag{display:inline-block;font-size:8px;background:var(--wood);color:#fff;padding:0 4px;border-radius:6px;margin-left:3px;vertical-align:middle}
.dy-card.has-jie{border-style:dashed}
.dy-panel{display:none}.dy-panel.active{display:block}
.ly-row{display:flex;align-items:center;gap:7px;padding:8px 11px;background:rgba(252,253,251,.7);border:1px solid var(--line);border-radius:6px;margin-bottom:2px;flex-wrap:wrap;font-size:14.5px}
.ly-year{font-size:16.5px;font-weight:800;color:var(--fire);min-width:42px}.ly-gz{font-weight:700}.ly-age{color:#888;font-size:12.5px}
.ly-vd{font-size:11.5px;font-weight:700;padding:2px 9px;border-radius:8px}
.v-吉{background:rgba(74,122,78,.2);color:var(--wood)}.v-凶{background:rgba(185,70,47,.18);color:var(--fire)}.v-平{background:var(--paper2);color:#888}
.dim-row{display:flex;gap:2px;flex-wrap:wrap}.dim-badge{font-size:11px;padding:1px 6px;border-radius:2px;font-weight:600;cursor:help}
.d-吉{background:rgba(74,122,78,.2);color:var(--wood)}.d-凶{background:rgba(185,70,47,.18);color:var(--fire)}.d-平{background:var(--paper2);color:#888}
.ly-adv{font-size:12.5px;color:var(--earth);margin-left:auto}
.ly-interp{font-size:12.5px;color:#334;padding:5px 12px 8px;margin-bottom:5px;line-height:1.7;background:rgba(74,122,78,.06);border-left:3px solid var(--wood)}
.empty{color:#888;padding:10px;text-align:center}
.chart-tip{position:absolute;background:#1a1a2e;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;pointer-events:none;z-index:10;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.4);line-height:1.7}
#chart-area{position:relative;min-height:100px}
.disclaim{background:#26323a;color:#dce6df;padding:13px;border-radius:8px;font-size:13.5px;line-height:1.75;border-left:4px solid var(--fire);margin-top:12px}
.disclaim b{color:#9bc69e}
.empower{background:linear-gradient(135deg,rgba(60,140,79,.06),rgba(154,122,46,.06));border:1px solid var(--wood);border-radius:8px;padding:14px;margin-bottom:12px}
.empower .sec-title{color:var(--wood);border-left:4px solid var(--wood)}
.empower-card{background:rgba(255,253,247,.7);border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin-top:8px}
.empower-card h4{color:var(--wood);font-size:15px;margin-bottom:4px}
.empower-card p{font-size:13.5px;color:#334;line-height:1.7;margin:2px 0}
.empower-card .mindset{color:var(--gold);font-style:italic;font-size:12.5px}
</style></head><body><div class="wrap">
<header><h1>八字命书 · 完整命理详批</h1>
<div class="sub">${Y}-${Mo}-${D} ${H}:${String(MIN).padStart(2,'0')} ${gender} · 四柱 <b>${esc(c.fourPillars.join(' '))}</b> · ${c.strength==='弱'?'身弱':'身旺'}喜${esc(c.yongShen.join('/'))}</div></header>

<section><div class="sec-title">一、八字基本命盘</div>
<table class="base-pan">
<thead><tr><th class="rh corner">日期</th><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th></tr></thead>
<tbody>
<tr><th class="rh">主星</th>${zhuXingRow}</tr>
<tr><th class="rh">天干</th>${ganRow}</tr>
<tr><th class="rh">地支</th>${zhiRow}</tr>
<tr><th class="rh">藏干</th>${hideRow}</tr>
<tr><th class="rh">副星</th>${fuRow}</tr>
<tr><th class="rh">星运</th>${xyRow}</tr>
<tr><th class="rh">自坐</th>${zjRow}</tr>
<tr><th class="rh">空亡</th>${kwRow}</tr>
<tr><th class="rh">纳音</th>${nyRow}</tr>
<tr><th class="rh">神煞</th>${ssRow}</tr>
</tbody>
</table>
<div class="aux-info">
  <span>日主 <b>${p.info.dayMaster}（${c.strength==='弱'?'身弱':'身旺'}）</b></span>
  <span>胎元 <b>${p.info.fetalOrigin}</b></span>
  <span>命宫 <b>${p.info.ownSign}</b></span>
  <span>身宫 <b>${p.info.bodySign}</b></span>
  <span>空亡 <b>${p.info.dayKong.join('')}</b></span>
</div>
<div style="font-size:12.5px;color:#998;margin-top:10px;line-height:1.7">主星=天干十神（日柱元男=日元男命）；副星=藏干十神；星运=日干在各支地势、自坐=本柱天干在本支地势；空亡=各柱旬空；神煞标<b style="color:var(--fire)">空亡</b>者=该柱地支落日柱旬空。神煞按地支归柱（月/日/时同戌者同得戌之神煞）。天干地支按五行着色。</div>
</section>

<section><div class="sec-title">二、五行能量 · 刑冲克害 · 神煞</div>
<div class="ss-grid" style="margin-bottom:11px">${wxBar}</div>
<div style="margin:11px 0"><b style="font-size:14.5px;color:var(--fire)">⚡ 刑冲克害关系：</b><div class="rel-list" style="margin-top:6px">${relList}</div></div>
<div><b style="font-size:14.5px;color:var(--wood)">✦ 命局神煞：</b><div class="ss-grid" style="margin-top:7px">${shenshaList}</div></div>
</section>

<section><div class="sec-title">三、命主深度解析（LLM 解读）</div>
${interpBlock || '<p class="empty">（未提供解读.json，解析区为空。命盘与运势已自动生成。）</p>'}
${empowerSection}
</section>

<section><div class="chart-title">📊 逐年运势（主线默认展开 · 维度明细可折叠）</div><div id="chart-area"></div></section>

<div class="dy-section" style="margin-bottom:12px"><h3 style="font-size:15px;color:#555;margin-bottom:7px">🔄 大运（${c.daYun.filter(d=>Number(d.ages.split('-')[1])<=100).length}步·到100虚岁·点击切换）</h3><div class="dy-row">${dyCards}</div></div>
<div class="ly-section" style="margin-bottom:12px"><h3 style="font-size:15px;color:#555;margin-bottom:9px">📅 流年列表（竖向·十一维度·含食伤(艺)+大运基调叠加+解读）</h3>${dyPanels}</div>

<div class="disclaim"><b>⚠ 免责声明</b>：本命盘数据由 tyme4ts+关系层+神煞层 算法自动推算；解析部分为基于命理技法的大语言模型解读，标注依据与置信度。命理学属传统文化，<b>并非实证科学，不具备经科学验证的预测能力</b>。所有吉凶判断、时间范围与建议，<b>仅适用于文化研究、自我觉察与娱乐参考，不替代专业医疗/心理/法律/投资/婚姻决策</b>。理性看待、积极生活。</div>
</div>
<script>
const ALL=${allData};const DN=${JSON.stringify(DIMS)};
function drawTrend(items){
  var area=document.getElementById('chart-area');
  if(!items.length){area.innerHTML='<p style="color:#888;padding:16px;text-align:center">该大运无流年数据</p>';return;}
  var dims=DN.map(function(d){return Array.isArray(d)?d[0]:d;});
  // 1. 逐年总运势曲线(默认展开): 每年各维度总分→SVG折线
  var pts=items.map(function(l){var sum=dims.reduce(function(s,d){return s+(l.d[d]||0);},0);return {y:l.y,sum:sum};});  // 总分(起伏明显, Y轴各自自适应, 看各自趋势不跨体系比绝对值)
  var W=860,H=210,pl=38,pr=14,pt=14,pb=26,N=pts.length;
  var maxAbs=Math.max.apply(null,pts.map(function(p){return Math.abs(p.sum);}).concat([2]));
  var xs=N>1?(W-pl-pr)/(N-1):0;
  var ym=H-pb-(H-pt-pb)/2;
  var ys=(H-pt-pb)/2/(maxAbs*1.15);
  var line=pts.map(function(p,i){return (pl+i*xs).toFixed(1)+','+(ym-p.sum*ys).toFixed(1);}).join(' ');
  var dots=pts.map(function(p,i){var x=pl+i*xs,y=ym-p.sum*ys;return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.5" fill="'+(p.sum>0?'#2e7d32':p.sum<0?'#c62828':'#999')+'"><title>📅 '+p.y+'年 总运势:'+(p.sum>0?'+':'')+p.sum+'</title></circle>';}).join('');
  var xLab=pts.map(function(p,i){if(N>12&&i%2!==0)return '';return '<text x="'+(pl+i*xs).toFixed(0)+'" y="'+(H-pb+13)+'" font-size="9" text-anchor="middle" fill="#888">'+p.y+'</text>';}).join('');
  var ticks=[-1,-0.5,0,0.5,1].map(function(m){return Math.round(maxAbs*m*10)/10;});
  var grid=ticks.map(function(s){return '<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(ym-s*ys).toFixed(1)+'" y2="'+(ym-s*ys).toFixed(1)+'" stroke="#eee"/><text x="'+(pl-4)+'" y="'+(ym-s*ys+3).toFixed(1)+'" font-size="8" text-anchor="end" fill="#aaa">'+s+'</text>';}).join('');
  var curve='<div style="margin-bottom:10px"><div style="font-size:14px;font-weight:700;color:#543;margin-bottom:4px">📈 逐年总运势主线 <span style="font-size:11px;color:#999;font-weight:400">(越高越吉·越低越凶·0线为平·含大运基调叠加)</span></div><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;background:#fafafa;border-radius:5px">'+grid+'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+ym+'" y2="'+ym+'" stroke="#bbb"/><polyline points="'+line+'" fill="none" stroke="#4a7a8e" stroke-width="2"/>'+dots+xLab+'</svg></div>';
  // 2. 维度明细热力图(默认折叠) + 分数图例
  function cell(v){var v2=v>0?'吉':v<0?'凶':'平';var bg2=v2==='吉'?'#e3f2e3':v2==='凶'?'#fbe5e3':'#f0f0f0';var col2=v2==='吉'?'#2e7d32':v2==='凶'?'#c62828':'#999';var sym2=v>0?'▲':v<0?'▼':'·';return '<td style="background:'+bg2+';color:'+col2+';padding:5px 4px;font-weight:700" title="'+(v>0?'+':'')+v+'">'+sym2+'</td>';}
  var hm='<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;text-align:center;width:100%;font-family:monospace"><thead><tr style="background:#f8f4ec;color:#543"><th style="padding:5px 6px">流年</th>'+dims.map(function(d){return '<th style="padding:5px 4px;font-weight:700">'+d+'</th>';}).join('')+'</tr></thead><tbody>';
  items.forEach(function(l){hm+='<tr><td style="padding:5px 6px;font-weight:700;color:#543">'+l.y+'</td>'+dims.map(function(d){return cell(l.d[d]||0);}).join('')+'</tr>';});
  hm+='</tbody></table></div>';
  var legend='<div style="margin-top:8px;padding:8px 10px;background:#f8f4ec;border-radius:4px;font-size:11px;color:#543;line-height:1.7"><b>分数 → 吉凶程度</b>（悬停格看具体分，含流年+大运基调×0.5叠加）：<br><b style="color:#1b5e20">+2 及以上 = 大吉</b>（强喜用，顺势发力）｜ <b style="color:#2e7d32">+1 = 吉</b>（喜用）｜ <b>0 = 平</b>（无星或喜忌抵消）｜ <b style="color:#c62828">-1 = 凶</b>（忌神，需防）｜ <b style="color:#8b1a1a">-2 及以下 = 大凶</b>（强忌神，重点防范）</div>';
  hm='<details style="margin-top:6px"><summary style="cursor:pointer;font-size:13px;color:#4a6a8e;font-weight:600;padding:6px 0">🔍 展开维度明细热力图（每年各维度吉凶 · 悬停看分数）</summary>'+hm+legend+'</details>';
  area.innerHTML=curve+hm;
}
function showDy(gz){
  document.querySelectorAll('.dy-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.dy-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('panel-'+gz)?.classList.add('active');
  document.querySelector('[data-dy="'+gz+'"]')?.classList.add('active');
  drawTrend(ALL.filter(l=>l.dy===gz));
}
showDy('${esc(currentDy)}');
</script></body></html>`;
fs.writeFileSync(outPath, html);
console.error(`✅ ${outPath} (行表头命盘+${r.liunian.length}年运势, ${c.daYun.filter(d=>Number(d.ages.split('-')[1])<=100).length}大运${interpPath?' +LLM解读':''})`);
