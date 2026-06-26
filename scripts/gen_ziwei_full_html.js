#!/usr/bin/env node
/**
 * 紫微完整命书 HTML v4 —— 优化: ①盘面中央加命主八字 ②整体字体放大
 *   ③点击宫格→高亮三方四正+显示宫干飞化四化; 📖按钮→弹LLM宫象解析
 *   环形十二宫(天干地支+地势+将星+小限+流年+身宫来因) + 大限 + 流年 + 折线图
 * 用法: node gen_ziwei_full_html.js <YYYY-M-D> <时辰0-12> <男|女> [起年] [止年] [输出.html] [解读.json]
 */
const path = require('path'), fs = require('fs');
const { ensureWorkspace } = require('./_workspace');
const { lookup: empower } = require('./_empower');
const WS = ensureWorkspace();
const { astro } = require(path.join(__dirname, 'vendor/iztro/lib/index.js'));
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const DIMS = [['妻','夫妻'],['财','财帛'],['子','子女'],['禄','官禄'],['父','父母'],['身','命宫'],['友','仆役'],['考','福德'],['宅','田宅'],['灾','疾厄']];
// 星曜分类/四化表/三方四正/打分 统一至 _ziwei_common(完整命书:WEIGHT_FULL + 不计流年虚吉星)
// 注:DIMS 本地保留——"考"→福德(非官禄),完整命书有意以福德看学业;与流年系列(考→官禄)的有意差异
const _Z = require('./_ziwei_common');
const { GAN_SIHUA, ZHI_LIST, sanheGroup, duigong, sanfangSizheng, SHA_HTML:SHA_SET, WEIGHT_FULL } = _Z;
const JI = new Set(_Z.JI_STAR);
const SHA = new Set(_Z.SHA_STAR);
const judgeDim = (a, y, pn) => _Z.judgeDim(a, y, pn, { weight: WEIGHT_FULL });
const INTERP = {'财凶':'破财/收入波动;父辈耗','灾凶':'健康/血光/意外','子凶':'子女事谨慎;胎停(若孕育)','禄凶':'事业压力/变动','考吉':'学业/资质/深造;贵人','身凶':'过劳/精力降','身吉':'精力充沛/安顿','禄吉':'晋升/掌权','财吉':'得财/理财机遇','考凶':'学业受阻','友吉':'合作得力/担财','友凶':'竞争/劫财/口舌','妻凶':'感情波折','宅凶':'房产波折','父凶':'父辈健康/家耗'};
const interpret = d => DIMS.map(([k]) => {
  const v = d[k].verdict, key = k + v;
  const base = INTERP[key] || '';
  if (v === '凶') {
    const e = empower('interpret', key);
    return [base, e.transform, e.action.join('/')].filter(Boolean).join('｜');
  }
  return base;
}).filter(Boolean).join('；');
// 流年LLM解读: 大限基调(十年环境) × 流年宫象(逐年) + 叠加提示(动态)
const interpretLN=l=>{
  const dx=l.dxDims||{};
  const dxF=DIMS.filter(([k])=>dx[k]&&dx[k].verdict==='凶').map(([k])=>k).slice(0,3);
  const dxJ=DIMS.filter(([k])=>dx[k]&&dx[k].verdict==='吉').map(([k])=>k).slice(0,3);
  const lf=DIMS.filter(([k])=>l.dims[k]&&l.dims[k].verdict==='凶').map(([k])=>k);
  const lj=DIMS.filter(([k])=>l.dims[k]&&l.dims[k].verdict==='吉').map(([k])=>k);
  const p=[];
  if(dxF.length)p.push(`〔${l.dk}大限·忌神基调:${dxF.join('/')}〕`);
  if(dxJ.length)p.push(`〔${l.dk}大限·喜用基调:${dxJ.join('/')}〕`);
  if(lf.length)p.push('流年应凶:'+lf.map(k=>{const e=empower('interpret',k+'凶');return k+'→'+e.transform;}).join('；'));
  if(lj.length)p.push('流年应吉:'+lj.join('/'));
  if(dxF.length&&lj.length)p.push('忌限逢喜年·吉气打折');
  if(dxJ.length&&lf.length)p.push('喜限逢忌年·凶势减轻');
  return p.join('；')||'平稳';
};

const ZHI_PIN = {子:'zi',丑:'chou',寅:'yin',卯:'mao',辰:'chen',巳:'si',午:'wu',未:'wei',申:'shen',酉:'you',戌:'xu',亥:'hai'};

const argv = process.argv.slice(2);
let dateStr,timeIdx,gender,startYear,endYear,outPath,interpPath,liunianJiePath;
if (argv.length >= 3) {
  [dateStr,timeIdx,gender] = argv; timeIdx = Number(timeIdx);
  startYear = argv[3] ? Number(argv[3]) : 1994;
  endYear   = argv[4] ? Number(argv[4]) : (Number(dateStr.split('-')[0])+99);
  outPath   = argv[5] || path.join(WS, `紫微命书-${dateStr.split('-')[0]}.html`);
  interpPath = argv[6] || '';
  liunianJiePath = argv[7] || '';
} else {
  dateStr='2000-08-16';timeIdx=10;gender='男';startYear=1994;endYear=2092;outPath=path.join(WS,'紫微命书-2000.html');interpPath='';liunianJiePath='';
  console.error('[demo]→'+outPath);
}

const a = astro.bySolar(dateStr, timeIdx, gender, true, 'zh-CN');
const birthYear = Number(dateStr.split('-')[0]);
let interp = {};
if (interpPath && fs.existsSync(interpPath)) { try { interp = JSON.parse(fs.readFileSync(interpPath,'utf8')); } catch(e){ console.error('解读JSON解析失败:',e.message); } }
let liunianJie = {};
if (liunianJiePath && fs.existsSync(liunianJiePath)) { try { liunianJie = JSON.parse(fs.readFileSync(liunianJiePath,'utf8')); } catch(e){ console.error('流年解读JSON解析失败:',e.message); } }
const dxJie = dk => (liunianJie['大限解读']||{})[dk] || '';
const lyJie = yr => (liunianJie['流年解读']||{})[String(yr)] || '';

// 来因宫/身宫/小限/流年
const yearGan = (a.chineseDate||'').split(' ')[0][0] || '';
const birthZhi = ZHI_LIST[((birthYear-4)%12+12)%12];
const laiYinPalace = a.palaces.find(p => p.heavenlyStem === yearGan) || null;
const CUR_YEAR = 2026;
const curLnZhi = ZHI_LIST[((CUR_YEAR-4)%12+12)%12];
const curAge = CUR_YEAR - birthYear + 1;
const curXiaoxianGong = (a.palaces.find(p => (p.ages||[]).includes(curAge)) || {}).name || '';
const curLiunianGong = (a.palaces.find(p => p.earthlyBranch === curLnZhi) || {}).name || '';
const curBodyGong = (a.palaces.find(p => p.isBodyPalace) || {}).name || '';

// 三方四正 + 宫干飞化(每宫预计算)
const findStarPalace = starName => a.palaces.find(p => (p.majorStars||[]).some(s=>s.name===starName) || (p.minorStars||[]).some(s=>s.name===starName));
const SANFANG = {}, FLIES = {};
a.palaces.forEach(p => {
  SANFANG[p.name] = sanfangSizheng(p.earthlyBranch).map(z => (a.palaces.find(x=>x.earthlyBranch===z)||{}).name).filter(Boolean);
  const sihua = GAN_SIHUA[p.heavenlyStem] || [];
  FLIES[p.name] = sihua.map(([star,type]) => ({ star, type, to: (findStarPalace(star)||{}).name || '—' }));
});
const PALACE_ZHI_MAP = Object.fromEntries(a.palaces.map(p=>[p.name,p.earthlyBranch]));   // 宫名→地支
const ZHI_PALACE_MAP = Object.fromEntries(a.palaces.map(p=>[p.earthlyBranch,p.name]));   // 地支→宫名

// 环形十二宫盘面
const palHtml = a.palaces.map(p => {
  const py = ZHI_PIN[p.earthlyBranch] || 'zi';
  const gz = (p.heavenlyStem||'') + p.earthlyBranch;
  const cls = ['palace', py];
  if (p.name === '命宫') cls.push('is-life');
  if (p.isBodyPalace) cls.push('is-body');
  if (p.heavenlyStem === yearGan) cls.push('is-laiyin');
  const hasIp = interp['宫象'] && interp['宫象'][p.name];
  if (hasIp) cls.push('has-ip');
  const badges = [];
  if (p.isBodyPalace) badges.push('<span class="p-badge body">身</span>');
  if (p.heavenlyStem === yearGan) badges.push('<span class="p-badge laiyin">来因</span>');
  const maj = (p.majorStars || []).map(s => {
    let b = ''; if (s.mutagen==='禄') b=' b-lu'; else if (s.mutagen==='权') b=' b-quan'; else if (s.mutagen==='科') b=' b-ke'; else if (s.mutagen==='忌') b=' b-ji';
    return `<span class="star${b}" data-star="${s.name}">${s.name}${s.brightness?'<i>'+s.brightness+'</i>':''}${s.mutagen?'<em>·'+s.mutagen+'</em>':''}</span>`;
  }).join('');
  const min = (p.minorStars || []).map(s => `<span class="aux" data-star="${s.name}">${s.name}</span>`).join('');
  const adj = (p.adjectiveStars || []).map(s => { const n = typeof s==='string'?s:s.name; return `<span class="${SHA_SET.has(n)?'sha':'adj'}">${n}</span>`; }).join('');
  const dyAge = (p.decadal && p.decadal.range) ? '<span class="dy-age">'+p.decadal.range[0]+'-'+p.decadal.range[1]+'</span>' : '';
  const cs = p.changsheng12 || '';
  const ages = (p.ages||[]).filter(x => x <= 100);
  const zIdx = ZHI_LIST.indexOf(p.earthlyBranch), bIdx = ZHI_LIST.indexOf(birthZhi);
  const lnAges = []; for (let aa = ((zIdx-bIdx+12)%12)+1; aa <= 100; aa += 12) lnAges.push(aa);
  const jq = p.jiangqian12 || '';
  const extra = `<div class="p-extra"><span class="ex-cs">地势·${cs}</span><span class="ex-jq">将星·${jq}</span><span class="ex-age">小限·${ages.join('/')}</span><span class="ex-ln2">流年·${lnAges.join('/')}</span></div>`;
  const ipBtn = hasIp ? `<span class="ip-btn" onclick="event.stopPropagation();showGong('${esc(p.name)}')">📖解析</span>` : '';
  return `<div class="${cls.join(' ')}" data-name="${esc(p.name)}" onclick="showSanfang('${esc(p.name)}')"><span class="dx-label"></span><div class="phead"><span class="pname">${esc(p.name)}${badges.join('')}</span><span class="pgz">${gz}${dyAge}${ipBtn}</span></div><div class="pstars">${maj||'<span class="empty-p">(空宫)</span>'}</div><div class="paux">${min}</div><div class="psha">${adj}</div>${extra}</div>`;
}).join('');
const sihua = a.palaces.flatMap(p => (p.majorStars||[]).filter(s => s.mutagen).map(s => `${s.name}${s.mutagen}(${p.name})`));
const mingGong = a.palaces.find(p => p.name === '命宫');
const baziArr = (a.chineseDate||'').split(' ');
const centerHtml = `<div class="center">
  <div class="c-title">${esc(a.fiveElementsClass||'—')}</div>
  <div class="c-sub">命主<b>${esc(a.soul||'—')}</b> 身主<b>${esc(a.body||'—')}</b></div>
  <div class="c-bazi"><span class="cb-l">八字</span>${baziArr.map(x=>`<b>${esc(x)}</b>`).join('')}</div>
  <div class="c-sihua"><span class="ct">生年四化</span>${sihua.map(s=>`<span class="sk">${esc(s)}</span>`).join('')}</div>
</div>`;

const interpSec = (title, arr) => (arr && arr.length) ? `<div class="ip-card"><h4>${title}</h4>${arr.map(x=>`<p>${esc(x)}</p>`).join('')}</div>` : '';
// ① 格局结构化：interp['格局'] 支持字符串(向后兼容)或 {name,type:'good'|'caution',desc}
const interpGeju = (arr) => {
  if (!arr || !arr.length) return '';
  const objs = arr.map(x => typeof x === 'string' ? {name:x, type:'good', desc:''} : x);
  const good = objs.filter(o => o.type !== 'caution' && o.type !== 'bad');
  const bad = objs.filter(o => o.type === 'caution' || o.type === 'bad');
  const grp = (list, cls, icon, title) => list.length ? `<div class="geju-group ${cls}"><div class="geju-head">${icon} ${title}</div>${list.map(o => {
    const e = (cls === 'gg-bad') ? empower('geju', o.name) : null;
    const tail = e ? `<span class="geju-trans">→ ${e.transform}；宜:${e.action.join('/')}</span>` : '';
    return `<div class="geju-item"><b>${esc(o.name)}</b>${o.desc?`：<span>${esc(o.desc)}</span>`:''}${tail}</div>`;
  }).join('')}</div>` : '';
  return `<div class="ip-card geju"><h4>核心格局</h4>${grp(good,'gg-good','⭐','成格')}${grp(bad,'gg-bad','⚠','凶格警示')}</div>`;
};
// ② 疾厄脏腑定位（子午流注：地支宫→脏腑，脚本固定映射，不依赖 LLM）
const ZANGFU = {子:'膀胱/泌尿',丑:'肝',寅:'胆/呼吸道',卯:'肝胆',辰:'脾胃',巳:'心/小肠',午:'心、头脑',未:'脾胃',申:'肺/大肠',酉:'肾',戌:'脾胃/大肠',亥:'肾/膀胱/生殖'};
const jieGong = a.palaces.find(p => p.name === '疾厄');
const jieZhi = jieGong ? jieGong.earthlyBranch : '';
const jieAdj = jieGong ? (jieGong.adjectiveStars||[]).map(s=>typeof s==='string'?{name:s}:s) : [];
const jieAllStars = jieGong ? [...(jieGong.majorStars||[]),...(jieGong.minorStars||[]),...jieAdj] : [];
const jieRisk = [...jieAllStars.filter(s=>SHA_SET.has(s.name)).map(s=>s.name), ...(jieGong?(jieGong.majorStars||[]):[]).filter(s=>s.mutagen==='忌').map(s=>s.name+'化忌')];
const zangfuCard = jieZhi ? `<div class="ip-card zangfu"><h4>疾厄·脏腑定位（子午流注）</h4><p>疾厄宫@<b>${esc(jieZhi)}</b>宫 → 主看 <b>${esc(ZANGFU[jieZhi]||'—')}</b>${jieRisk.length?`；该宫见 ${esc(jieRisk.join('、'))}，风险加重（防手术血光/慢性疾患）`:'；该宫无明显煞忌，风险较平'}。</p><p class="zangfu-tip">倪师正统以宫位地支定脏腑主轴，煞星/化忌加重风险，大限·流年飞到该宫为发病时间窗。</p></div>` : '';
const legendCard = `<div class="ip-card legend"><h4>解读置信度图例</h4><p><span class="conf high">🟢高</span> 依据充分、较确定 ｜ <span class="conf mid">🟡中</span> 有依据、中等把握 ｜ <span class="conf low">🔴低</span> 弱关联/单一依据、仅供参考</p></div>`;

const daXians = a.palaces.filter(p => p.decadal && p.decadal.range && p.decadal.range[1] <= 100).map(p => ({dk:p.decadal.heavenlyStem+p.decadal.earthlyBranch, years:(birthYear+p.decadal.range[0]-1)+'-'+(birthYear+p.decadal.range[1]-1), ages:p.decadal.range[0]+'-'+p.decadal.range[1], palace:p})).sort((x,y)=>parseInt(x.ages)-parseInt(y.ages));
const data = [], byDy = {};
for (let y=startYear; y<=endYear; y++) {
  const h = a.horoscope(new Date(`${y}-06-01`));
  const dec = h.decadal, yi = h.yearly;
  if (!dec) continue;
  const _xs = y - birthYear + 1, _start = daXians[0] ? parseInt(daXians[0].ages) : 5;
  if (_xs < _start || _xs > 100) continue;   // 起运前/超100岁:iztro horoscope 返回错大限(1994虚岁2误归庚申),按虚岁过滤
  const dk = dec.heavenlyStem + dec.earthlyBranch;
  const liuMing = a.palaces[yi.palaceNames.indexOf('命宫')] ? a.palaces[yi.palaceNames.indexOf('命宫')].earthlyBranch : '?';
  const dims = {}; const dxDims={}; DIMS.forEach(([d,pn]) => { const ly=judgeDim(a,yi,pn), dx=judgeDim(a,dec,pn); const sc=ly.score+dx.score*0.5; dims[d]={verdict:sc>0?'吉':sc<0?'凶':'平', score:+sc.toFixed(1)}; dxDims[d]=dx; });  // 流年宫象 + 大限基调×0.5
  data.push({year:y, taiSui:yi.heavenlyStem+yi.earthlyBranch, liuMing, mutagen:`${yi.mutagen[0]}禄/${yi.mutagen[1]}权/${yi.mutagen[2]}科/${yi.mutagen[3]}忌`, dims, dxDims, dk});
  if (!byDy[dk]) byDy[dk] = []; byDy[dk].push(data[data.length-1]);
}
const currentDk = (data.find(l => l.year===2026) || {dk: daXians[0]?daXians[0].dk:''}).dk;
const allData = JSON.stringify(data.map(l => {
  const badDims = DIMS.filter(([k]) => l.dims[k] && l.dims[k].verdict === '凶').map(([k]) => k);
  const em = badDims.length ? badDims.map(k => k + '→' + empower('interpret', k + '凶').transform).join('；') : '';
  return {y:l.year, ck:l.dk, d:Object.fromEntries(DIMS.map(([k])=>[k,l.dims[k].score])), em};
}));
const dyCards = daXians.map(d => { const isNow = d.dk===currentDk; const ms = (d.palace.majorStars||[]).map(s=>s.name).slice(0,2).join(' '); const pn = d.palace.name.endsWith('宫') ? d.palace.name : d.palace.name+'宫'; const jie = dxJie(d.dk); return `<div class="dy-card${isNow?' now':''}${jie?' has-jie':''}" data-dy="${esc(d.dk)}" onclick="showDy('${esc(d.dk)}')" title="${esc(jie)}"><div class="dy-gz">${esc(d.dk)}${isNow?'<span class="now-tag">当前</span>':''}${jie?'<span class="jie-tag">📖</span>':''}</div><div class="dy-ya">${esc(d.years)}年 · ${esc(d.ages)}岁</div><div class="dy-palace">${esc(pn)}@${esc(d.palace.earthlyBranch)} ${esc(ms)||'空'}</div></div>`; }).join('');
const dyPanels = daXians.map(d => { const lys = byDy[d.dk]||[]; const rows = lys.map(l => { const lText = lyJie(l.year) ? `🔮 ${esc(lyJie(l.year))}` : `🔮 ${esc(interpretLN(l))}`; return `<div class="ly-row"><span class="ly-year">${l.year}</span><span class="ly-gz">${esc(l.taiSui)}</span><span class="ly-branch">流命@${esc(l.liuMing)}</span><span class="mutagen">${esc(l.mutagen)}</span><span class="dim-row">${DIMS.map(([k])=>`<span class="dim-badge d-${l.dims[k].verdict}">${k}</span>`).join('')}</span></div><div class="ly-interp">${lText}</div>`; }).join(''); return `<div class="dy-panel" id="panel-${esc(d.dk)}">${rows||'<p class="empty">该大限范围外(无流年数据)</p>'}</div>`; }).join('');

// ③ 积极引导专区(知己禀赋 + 顺势功课 + 行动指南)——赋能层产出表达,推演层零改动
function renderEmpower() {
  const mingGong = a.palaces.find(p => p.name === '命宫');
  const guanGong = a.palaces.find(p => p.name === '官禄');
  const mingStars = (mingGong.majorStars || []).map(s => s.name).join('·') || '空宫';
  const guanStars = (guanGong.majorStars || []).map(s => s.name).join('·') || '空宫';
  const zhiJi = `命宫${mingStars}、官禄${guanStars}——禀赋在技术/专业,适合深耕立身。`;
  const curDy = daXians.find(d => d.dk === currentDk);
  // 当前大限凶象统计:取该 dk 流年的 dxDims(大限基调)中"凶"的维度数(daXians 项无 dims,从 data 流年聚合)
  const curDyLys = data.filter(l => l.dk === currentDk);
  const dyBadCnt = curDyLys.length ? DIMS.filter(([k]) => curDyLys.some(l => l.dxDims[k] && l.dxDims[k].verdict === '凶')).length : 0;
  const dyKey = dyBadCnt > 3 ? '财官忌运' : '食伤喜运';
  const shunShi = empower('dayun', dyKey);
  const xingDong = empower('bazi_trait', '身弱财多');
  return `<section class="empower">
    <div class="sec-title">🌞 积极引导 · 顺势而为</div>
    <div class="empower-card"><h4>知己 · 禀赋扬长</h4><p>${esc(zhiJi)}</p></div>
    <div class="empower-card"><h4>顺势 · 节奏功课</h4><p><b>${esc(currentDk)}大限</b>:${esc(shunShi.judgment)}</p><p>转化:${esc(shunShi.transform)}</p><p>宜:${esc(shunShi.action.join('、'))}</p></div>
    <div class="empower-card"><h4>行动 · 避坑指南</h4><p>${esc(xingDong.transform)}</p><p>宜:${esc(xingDong.action.join('、'))}</p><p class="mindset">${esc(xingDong.mindset)}</p></div>
  </section>`;
}

const interpBlock = [
  legendCard,
  interpSec('命主身主 · 命宫格局', interp['命主身主']),
  interpGeju(interp['格局']),
  interpSec('五行局', interp['五行局']),
  interpSec('生年四化', interp['生年四化']),
  interpSec('命主总论', interp['命主总论']),
  zangfuCard,
  renderEmpower(),
].join('');
const gongData = JSON.stringify(interp['宫象'] || {});

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>紫微命书·${esc(dateStr)}</title>
<style>
:root{--paper:#f6efe1;--paper2:#efe6d2;--ink:#2a2118;--ink2:#4a3d2c;--v:#9c2b22;--gold:#9a7a2e;--jade:#3f6b4e;--line:#cdb98a;--lu:#4f8a63;--quan:#3a4a7a;--ke:#2a7b8a;--ji:#c0392b}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:"PingFang SC","Microsoft YaHei","Noto Serif SC",serif;background:var(--paper);color:var(--ink);font-size:17px;line-height:1.75;padding:14px;background-image:radial-gradient(circle at 20% 8%,rgba(154,122,46,.07),transparent 42%),radial-gradient(circle at 82% 92%,rgba(156,43,34,.05),transparent 42%)}
.wrap{max-width:1100px;margin:0 auto}
header{text-align:center;padding:12px 0;border-bottom:3px double var(--line);margin-bottom:12px}
h1{font-size:28px;color:var(--v);letter-spacing:3px}.sub{font-size:14px;color:var(--ink2);margin-top:5px}.sub b{color:var(--v)}
section{background:rgba(255,253,247,.6);border:1px solid var(--line);border-radius:8px;padding:15px;margin-bottom:12px}
.sec-title{font-size:18.5px;color:var(--v);font-weight:700;margin-bottom:11px;border-left:4px solid var(--v);padding-left:9px}
.board{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;background:rgba(205,185,138,.35);padding:8px;border-radius:10px;border:2px solid var(--line);box-shadow:0 4px 18px rgba(74,61,44,.1);position:relative}
.palace{background:rgba(255,253,247,.92);border:1.5px solid var(--line);border-radius:6px;padding:8px 9px;font-size:14px;line-height:1.6;min-height:188px;display:flex;flex-direction:column;transition:.12s;cursor:pointer;position:relative}
.si{grid-area:1/1}.wu{grid-area:1/2}.wei{grid-area:1/3}.shen{grid-area:1/4}
.chen{grid-area:2/1}.you{grid-area:2/4}.mao{grid-area:3/1}.xu{grid-area:3/4}
.yin{grid-area:4/1}.chou{grid-area:4/2}.zi{grid-area:4/3}.hai{grid-area:4/4}
.center{grid-area:2/2/4/4;background:linear-gradient(135deg,rgba(156,43,34,.08),rgba(154,122,46,.1));border:1.5px solid var(--gold);border-radius:8px;padding:14px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.is-life{border:1.5px dashed rgba(156,43,34,.45)}.is-body{border:2px solid var(--gold)}.is-laiyin{box-shadow:inset 0 0 0 2px rgba(63,107,78,.5)}
.palace.sf-active{border:2px solid var(--v);background:rgba(156,43,34,.14);box-shadow:0 0 0 2px rgba(156,43,34,.3)}
.palace.sf-oppose{border:2px dashed var(--gold);background:rgba(154,122,46,.1)}
.palace:hover{border-color:var(--v)}
.phead{display:flex;justify-content:space-between;align-items:center;border-bottom:1px dashed var(--line);padding-bottom:3px;margin-bottom:4px;gap:4px}
.pname{font-weight:700;color:var(--v);font-size:15.5px}.pgz{font-size:12.5px;color:var(--gold);display:flex;align-items:center;gap:3px}
.dy-age{font-size:10px;color:#999;background:var(--paper2);padding:1px 4px;border-radius:2px}
.ip-btn{font-size:11.5px;color:var(--jade);background:rgba(63,107,78,.13);padding:2px 7px;border-radius:3px;font-weight:600;margin-left:3px}.ip-btn:hover{background:rgba(63,107,78,.28)}
.pstars{display:flex;flex-direction:column;gap:1px}.star{font-weight:700;font-size:15px;color:var(--ink)}.star i{font-style:normal;font-size:11px;color:var(--gold);font-weight:400;margin-left:2px}
.star em{font-style:normal;font-size:11px;font-weight:700;margin-left:2px}
.b-lu{color:var(--lu)}.b-lu em{background:var(--lu);color:#fff;padding:0 3px;border-radius:2px}
.b-quan{color:var(--quan)}.b-quan em{background:var(--quan);color:#fff;padding:0 3px;border-radius:2px}
.b-ke{color:var(--ke)}.b-ke em{background:var(--ke);color:#fff;padding:0 3px;border-radius:2px}
.b-ji{color:var(--ji)}.b-ji em{background:var(--ji);color:#fff;padding:0 3px;border-radius:2px}
.paux{font-size:12px;color:var(--jade);margin-top:3px}.paux .aux{margin-right:4px}
.psha{font-size:11.5px;margin-top:2px}.psha .sha{color:var(--ji);margin-right:3px}.psha .adj{color:#998;margin-right:3px}
.p-extra{display:flex;flex-direction:column;gap:2px;margin-top:auto;padding-top:4px;border-top:1px dashed var(--line)}
.p-extra span{font-size:10px;padding:1px 4px;border-radius:2px;background:var(--paper2);line-height:1.4}
.ex-cs{color:var(--gold)}.ex-jq{color:var(--jade)}.ex-age{color:#665}.ex-ln2{color:var(--v)}
.empty-p{color:#bbb;font-size:12px}
.fly-mark{display:inline-block;font-size:10px;padding:0 5px;border-radius:9px;margin-left:4px;font-weight:700;color:#fff;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.25);vertical-align:middle}
.fm-禄{background:var(--lu)}.fm-权{background:var(--quan)}.fm-科{background:var(--ke)}.fm-忌{background:var(--ji)}
.dx-label{position:absolute;top:5px;right:6px;font-size:10px;font-weight:700;color:#fff;background:var(--v);padding:1px 7px;border-radius:9px;z-index:4;box-shadow:0 1px 3px rgba(0,0,0,.25);display:none}
.dx-label:not(:empty){display:inline-block}
.c-title{font-size:26px;font-weight:800;color:var(--v);letter-spacing:2px}.c-sub{font-size:14px;color:var(--ink2);margin:6px 0}.c-sub b{color:var(--v);margin:0 2px}
.c-bazi{font-size:14px;color:var(--ink);margin:6px 0}.c-bazi .cb-l{font-size:11px;color:var(--gold);margin-right:4px}.c-bazi b{color:var(--v);margin:0 2px;font-size:15px}
.c-sihua{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:6px 0}.ct{width:100%;font-size:11.5px;color:var(--gold)}.sk{font-size:11.5px;background:rgba(255,255,255,.75);border:1px solid var(--line);padding:2px 6px;border-radius:3px;color:var(--ink2)}
/* 三方四正信息栏 */
.sf-info{background:var(--paper2);border:1px solid var(--line);border-radius:8px;padding:10px 14px;margin-bottom:11px;font-size:14px;line-height:1.9}
.sf-info .sf-cur{font-size:15px;font-weight:700;color:var(--v);margin-right:10px}
.sf-info .sf-row{display:block;margin:3px 0}.sf-info b{color:var(--gold)}
.sf-fly{display:inline-block;margin:2px 4px;padding:2px 8px;border-radius:3px;font-size:12.5px;color:#fff;font-weight:600}
.fy-禄{background:var(--lu)}.fy-权{background:var(--quan)}.fy-科{background:var(--ke)}.fy-忌{background:var(--ji)}
.sf-tip{font-size:12px;color:#998;margin-top:6px}
.sf-svg{position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible}
/* 解析modal */
.gmodal{display:none;position:fixed;inset:0;background:rgba(30,20,10,.55);z-index:100;justify-content:center;align-items:center;padding:20px}
.gcard{background:#fffcf7;border:2px solid var(--gold);border-radius:12px;max-width:580px;width:100%;max-height:80vh;overflow:auto;box-shadow:0 14px 44px rgba(0,0,0,.32)}
.ghead{display:flex;justify-content:space-between;align-items:center;padding:13px 18px;border-bottom:1px solid var(--line);background:rgba(156,43,34,.07);position:sticky;top:0}
.ghead b{color:var(--v);font-size:18px;letter-spacing:1px}
.gclose{cursor:pointer;color:#999;font-size:20px;padding:2px 10px;line-height:1}.gclose:hover{color:var(--v)}
.gbody{padding:15px 20px;font-size:15px;line-height:1.95;color:#334;white-space:pre-wrap}
.ip-card{background:rgba(255,253,247,.7);border-left:3px solid var(--jade);border-radius:6px;padding:11px 15px;margin:8px 0}
.ip-card h4{color:var(--jade);font-size:16px;margin-bottom:6px}.ip-card p{font-size:15px;margin:5px 0;color:#334;line-height:1.8}
.ip-card.legend{border-left-color:var(--gold);background:rgba(154,122,46,.1)}.ip-card.legend h4{color:var(--gold)}
.ip-card.geju{border-left-color:var(--gold)}.ip-card.geju h4{color:var(--gold)}
.geju-group{margin:6px 0;padding:8px 11px;border-radius:6px}
.gg-good{background:rgba(63,107,78,.1);border:1px solid rgba(63,107,78,.3)}.gg-bad{background:rgba(156,43,34,.08);border:1px solid rgba(156,43,34,.3)}
.geju-head{font-weight:700;font-size:14px;margin-bottom:5px}.gg-good .geju-head{color:var(--jade)}.gg-bad .geju-head{color:var(--v)}
.geju-item{font-size:14px;margin:3px 0;line-height:1.7}.geju-item b{color:var(--ink)}.geju-item span{color:#565}
.ip-card.zangfu{border-left-color:var(--ji)}.ip-card.zangfu h4{color:var(--ji)}
.zangfu-tip{font-size:12.5px;color:#998;margin-top:5px;line-height:1.6}
.conf{font-weight:700}.conf.high{color:var(--jade)}.conf.mid{color:var(--gold)}.conf.low{color:var(--v)}
.chart-title{font-size:17px;color:var(--v);font-weight:700;margin-bottom:5px}
.dy-row{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px}
.dy-card{min-width:140px;flex-shrink:0;padding:10px;border:1.5px solid var(--line);border-radius:6px;cursor:pointer;background:rgba(255,253,247,.85);transition:.15s;text-align:center}
.dy-card:hover{border-color:var(--v);transform:translateY(-1px)}.dy-card.active{border-color:var(--v);background:rgba(156,43,34,.08)}.dy-card.now{border-color:var(--v)}
.dy-gz{font-size:18px;font-weight:800}.dy-ya{font-size:11.5px;color:var(--gold);margin:2px 0}.dy-palace{font-size:11.5px;color:#765}
.now-tag{background:var(--v);color:#fff;font-size:9px;padding:1px 5px;border-radius:6px;margin-left:2px}
.jie-tag{display:inline-block;font-size:8px;background:var(--jade);color:#fff;padding:0 4px;border-radius:6px;margin-left:3px;vertical-align:middle}
.dy-card.has-jie{border-style:dashed}
.ly-interp{font-size:12.5px;color:var(--gold);padding:4px 12px 8px;margin-bottom:5px;line-height:1.7;background:rgba(63,107,78,.06);border-left:2px solid var(--jade)}
.dy-panel{display:none}.dy-panel.active{display:block}
.ly-row{display:flex;align-items:center;gap:7px;padding:7px 11px;background:rgba(255,253,247,.7);border:1px solid var(--line);border-radius:6px;margin-bottom:2px;flex-wrap:wrap;font-size:14.5px}
.ly-year{font-size:16px;font-weight:800;color:var(--v);min-width:40px}.ly-gz{font-weight:700}.ly-branch{font-size:12px;color:var(--gold)}
.mutagen{font-size:11.5px;color:var(--ink2);background:var(--paper);padding:2px 7px;border-radius:3px}
.dim-row{display:flex;gap:2px;flex-wrap:wrap;margin-left:auto}.dim-badge{font-size:11px;padding:1px 5px;border-radius:2px;font-weight:600}
.d-吉{background:rgba(63,107,78,.2);color:var(--jade)}.d-凶{background:rgba(156,43,34,.18);color:var(--v)}.d-平{background:var(--paper);color:#765}
.ly-interp{font-size:12.5px;color:var(--gold);padding:3px 11px 7px;margin-bottom:5px;line-height:1.5}
.empty{color:#a96;padding:10px;text-align:center}
.chart-tip{position:absolute;background:#1a1a2e;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;pointer-events:none;z-index:10;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.4);line-height:1.7}
#chart-area{position:relative;min-height:100px}
.disclaim{background:#3a2f22;color:#e8dcc2;padding:13px;border-radius:8px;font-size:13px;line-height:1.75;border-left:4px solid var(--v);margin-top:12px}
.disclaim b{color:#f0c674}
.empower{background:linear-gradient(135deg,rgba(63,107,78,.06),rgba(154,122,46,.06));border:1px solid var(--jade);border-radius:8px;padding:14px;margin-bottom:12px}
.empower .sec-title{color:var(--jade);border-left:4px solid var(--jade)}
.empower-card{background:rgba(255,253,247,.7);border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin-top:8px}
.empower-card h4{color:var(--jade);font-size:15px;margin-bottom:4px}
.empower-card p{font-size:13.5px;color:var(--ink2);line-height:1.7;margin:2px 0}
.empower-card .mindset{color:var(--gold);font-style:italic;font-size:12.5px}
.geju-trans{color:var(--jade);font-size:12.5px;margin-left:4px}
</style></head><body><div class="wrap">
<header><h1>紫微斗数命书 · 完整命盘详批</h1>
<div class="sub">${esc(dateStr)} 戌时 ${gender} · ${esc(a.fiveElementsClass||'')} · 命宫@${mingGong?mingGong.earthlyBranch:'?'} <b>${mingGong?(mingGong.majorStars||[]).map(s=>s.name).join(''):''}</b></div></header>

<section><div class="sec-title">一、紫微命盘（环形十二宫 · 点击宫位看三方四正 · 📖看解析）</div>
<div class="sf-info" id="sf-info"><span class="sf-cur">交互说明</span><span class="sf-row"><b>点击任一宫位</b>→ 高亮其<b>三方四正</b>（本宫+对宫+三合两宫）并显示<b>宫干飞化</b>（该宫天干化禄权科忌入哪些宫）。</span><span class="sf-row"><b>点「📖解析」按钮</b>→ 弹出该宫 LLM 深度解析。</span></div>
<div class="board">${palHtml}${centerHtml}<svg class="sf-svg" id="sf-svg" xmlns="http://www.w3.org/2000/svg"></svg></div>
<div style="font-size:12px;color:#998;margin-top:9px;line-height:1.7">宫头为<b>天干+地支</b>；<span class="ip-btn" style="display:inline">身</span>=身宫（${curBodyGong}宫）、<span class="ip-btn" style="background:rgba(63,107,78,.4)">来因</span>=来因宫（生年干「${yearGan}」所在：${laiYinPalace?laiYinPalace.name:'—'}宫）。每宫底部：地势/将星/小限虚岁/流年虚岁。${curAge}岁小限在${curXiaoxianGong}宫、${CUR_YEAR}流年命宫在${curLiunianGong}宫。</div>
</section>

<section><div class="sec-title">二、命主解析（LLM 解读）</div>
${interpBlock || '<p class="empty">（未提供解读.json，解析区为空。命盘与运势已自动生成。）</p>'}
</section>

<section><div class="chart-title">📊 逐年运势（主线默认展开 · 维度明细可折叠）</div><div id="chart-area"></div></section>

<div class="dy-section" style="margin-bottom:12px"><h3 style="font-size:15px;color:#543;margin-bottom:7px">🔄 大限（${daXians.length}个·到100虚岁·点击切换）</h3><div class="dy-row">${dyCards}</div></div>
<div class="ly-section" style="margin-bottom:12px"><h3 style="font-size:15px;color:#543;margin-bottom:9px">📅 流年列表（竖向·十维度+解读）</h3>${dyPanels}</div>

<div class="disclaim"><b>⚠ 免责声明</b>：本命盘星曜由 iztro 算法自动排布；三方四正与宫干飞化为标准命理算法推算；解析为基于紫微技法的大语言模型解读，标注依据与置信度。命理学属传统文化，<b>并非实证科学，不具备经科学验证的预测能力</b>。所有吉凶判断、时间范围与建议，<b>仅适用于文化研究、自我觉察与娱乐参考，不替代专业医疗/心理/法律/投资/婚姻决策</b>。理性看待、积极生活。</div>
</div>

<div class="gmodal" id="gmodal" onclick="if(event.target===this)closeGong()"><div class="gcard"><div class="ghead"><b id="gt"></b><span class="gclose" onclick="closeGong()">✕</span></div><div class="gbody" id="gb"></div></div></div>
<script>
const ALL=${allData};const DN=${JSON.stringify(DIMS.map(([d])=>d))};const GONG=${gongData};
const SANFANG=${JSON.stringify(SANFANG)};const FLIES=${JSON.stringify(FLIES)};const PALACE_ZHI=${JSON.stringify(PALACE_ZHI_MAP)};const ZHI_PALACE=${JSON.stringify(ZHI_PALACE_MAP)};
var SF_CUR=null;
var GONG_ORDER=['命','兄','夫','子','财','疾','迁','奴','官','田','福','父'];
var ZHI_CCW=['子','亥','戌','酉','申','未','午','巳','辰','卯','寅','丑'];
function daxianLabel(name){var z=PALACE_ZHI[name],si=ZHI_CCW.indexOf(z),map={};for(var i=0;i<12;i++){map[ZHI_CCW[(si+i)%12]]='大'+GONG_ORDER[i];}return map;}
function resetSanfang(){
  SF_CUR=null;
  document.querySelectorAll('.palace').forEach(p=>p.classList.remove('sf-active','sf-oppose'));
  document.querySelectorAll('.fly-mark').forEach(e=>e.remove());
  document.querySelectorAll('.dx-label').forEach(e=>{e.textContent='';});
  var svg=document.getElementById('sf-svg');if(svg)svg.innerHTML='';
  document.getElementById('sf-info').innerHTML='<span class="sf-cur">交互说明</span><span class="sf-row"><b>点击任一宫位</b>→ 高亮<b>三方四正</b>、显示<b>宫干飞化</b>、画<b>红色虚线</b>，并以该宫为<b>大限命宫</b>排大限十二宫（各宫右上角显示「大X」）。</span><span class="sf-row"><b>点「📖解析」</b>→ LLM 深度解析；<b>再次点击当前宫</b>→ 恢复初始。</span>';
}
function showSanfang(name){
  if(SF_CUR===name){resetSanfang();return;}
  SF_CUR=name;
  document.querySelectorAll('.palace').forEach(p=>p.classList.remove('sf-active','sf-oppose'));
  document.querySelectorAll('.fly-mark').forEach(e=>e.remove());
  var dxMap=daxianLabel(name);
  document.querySelectorAll('.palace').forEach(function(pal){var pn=pal.getAttribute('data-name');var lab=pal.querySelector('.dx-label');if(lab){lab.textContent=dxMap[PALACE_ZHI[pn]]||'';}});
  var arr=SANFANG[name]||[];
  arr.forEach(function(n){var el=document.querySelector('.palace[data-name="'+n+'"]');if(el){if(n===name){el.classList.add('sf-active');}else if(n===arr[1]){el.classList.add('sf-oppose');}else{el.classList.add('sf-active');}}});
  var f=FLIES[name]||[];
  f.forEach(function(x){
    var pal=document.querySelector('.palace[data-name="'+x.to+'"]');
    if(pal){var star=pal.querySelector('[data-star="'+x.star+'"]');if(star){var m=document.createElement('span');m.className='fly-mark fm-'+x.type;m.textContent='化'+x.type;star.appendChild(m);}}
  });
  var dxName=dxMap[PALACE_ZHI[name]];
  var html='<span class="sf-cur">当前：'+name+'宫 → '+dxName+'（大限命宫）</span>';
  html+='<span class="sf-row"><b>三方四正</b>：'+(arr.length?arr.map(function(n,i){return i===1?'<span style="color:var(--gold)">『对宫·'+n+'』</span>':n;}).join('、'):'—')+'</span>';
  html+='<span class="sf-row"><b>大限十二宫</b>（以'+name+'宫为'+dxName+'，按命兄夫子财疾迁奴官田福父逆时针排）：'+GONG_ORDER.map(function(g,i){var z=ZHI_CCW[(ZHI_CCW.indexOf(PALACE_ZHI[name])+i)%12];var pn=ZHI_PALACE[z]||z;var hl=(g==='命'||g==='迁')?' style="color:var(--v);font-weight:700"':'';return '<span'+hl+'>大'+g+'@'+pn+'</span>';}).join(' ')+'</span>';
  html+='<span class="sf-row"><b>宫干飞化</b>（已标在对应星上）：'+(f.length?f.map(function(x){return '<span class="sf-fly fy-'+x.type+'">化'+x.type+'·'+x.star+'→'+x.to+'宫</span>';}).join(''):'—')+'</span>';
  html+='<div class="sf-tip">对宫=大迁（六冲）；三合=本宫+另两支；宫干飞化=该宫天干所化禄/权/科/忌；<b style="color:var(--v)">红色虚线</b>=三方四正连线；<b>再次点击当前宫</b>恢复初始。</div>';
  document.getElementById('sf-info').innerHTML=html;
  drawSanfangLines(name);
}
function drawSanfangLines(name){
  var board=document.querySelector('.board'),svg=document.getElementById('sf-svg');
  if(!board||!svg)return;
  var bR=board.getBoundingClientRect();
  svg.setAttribute('viewBox','0 0 '+bR.width+' '+bR.height);
  svg.style.width=bR.width+'px';svg.style.height=bR.height+'px';
  var cen=function(el){var r=el.getBoundingClientRect();return [r.left-bR.left+r.width/2, r.top-bR.top+r.height/2];};
  var src=document.querySelector('.palace[data-name="'+name+'"]');
  if(!src){svg.innerHTML='';return;}
  var c=cen(src), arr=SANFANG[name]||[], lines='';
  arr.forEach(function(n){
    if(n===name)return;
    var t=document.querySelector('.palace[data-name="'+n+'"]');
    if(t){var tc=cen(t); lines+='<line x1="'+c[0].toFixed(1)+'" y1="'+c[1].toFixed(1)+'" x2="'+tc[0].toFixed(1)+'" y2="'+tc[1].toFixed(1)+'" stroke="#9c2b22" stroke-width="2" stroke-dasharray="7 5" opacity="0.6"/>';}
  });
  svg.innerHTML=lines;
}
function showGong(name){var t=GONG[name];if(!t){return;}document.getElementById('gt').textContent=name+' · 宫象深度解析';var e=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};document.getElementById('gb').innerHTML=e(t);document.getElementById('gmodal').style.display='flex';}
function closeGong(){document.getElementById('gmodal').style.display='none';}
function drawTrend(items){
  var area=document.getElementById('chart-area');
  if(!items.length){area.innerHTML='<p style="color:#888;padding:16px;text-align:center">该大限无流年数据</p>';return;}
  var dims=DN.map(function(d){return Array.isArray(d)?d[0]:d;});
  var pts=items.map(function(l){var sum=dims.reduce(function(s,d){return s+(l.d[d]||0);},0);return {y:l.y,sum:sum,em:l.em||''};});  // 总分(起伏明显, Y轴各自自适应, 看各自趋势不跨体系比绝对值)
  var W=860,H=210,pl=38,pr=14,pt=14,pb=26,N=pts.length;
  var maxAbs=Math.max.apply(null,pts.map(function(p){return Math.abs(p.sum);}).concat([2]));
  var xs=N>1?(W-pl-pr)/(N-1):0;
  var ym=H-pb-(H-pt-pb)/2;
  var ys=(H-pt-pb)/2/(maxAbs*1.15);
  var line=pts.map(function(p,i){return (pl+i*xs).toFixed(1)+','+(ym-p.sum*ys).toFixed(1);}).join(' ');
  var dots=pts.map(function(p,i){var x=pl+i*xs,y=ym-p.sum*ys;return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.5" fill="'+(p.sum>0?'#2e7d32':p.sum<0?'#c62828':'#999')+'"><title>📅 '+p.y+'年 总运势:'+(p.sum>0?'+':'')+p.sum+(p.em?'\\n💡 '+p.em:'')+'</title></circle>';}).join('');
  var xLab=pts.map(function(p,i){if(N>12&&i%2!==0)return '';return '<text x="'+(pl+i*xs).toFixed(0)+'" y="'+(H-pb+13)+'" font-size="9" text-anchor="middle" fill="#888">'+p.y+'</text>';}).join('');
  var ticks=[-1,-0.5,0,0.5,1].map(function(m){return Math.round(maxAbs*m*10)/10;});
  var grid=ticks.map(function(s){return '<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(ym-s*ys).toFixed(1)+'" y2="'+(ym-s*ys).toFixed(1)+'" stroke="#eee"/><text x="'+(pl-4)+'" y="'+(ym-s*ys+3).toFixed(1)+'" font-size="8" text-anchor="end" fill="#aaa">'+s+'</text>';}).join('');
  var curve='<div style="margin-bottom:10px"><div style="font-size:14px;font-weight:700;color:#543;margin-bottom:4px">📈 逐年总运势主线 <span style="font-size:11px;color:#999;font-weight:400">(越高越吉·越低越凶·0线为平·含大限基调叠加)</span></div><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;background:#fafafa;border-radius:5px">'+grid+'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+ym+'" y2="'+ym+'" stroke="#bbb"/><polyline points="'+line+'" fill="none" stroke="#4a7a8e" stroke-width="2"/>'+dots+xLab+'</svg></div>';
  function cell(v){var v2=v>0?'吉':v<0?'凶':'平';var bg2=v2==='吉'?'#e3f2e3':v2==='凶'?'#fbe5e3':'#f0f0f0';var col2=v2==='吉'?'#2e7d32':v2==='凶'?'#c62828':'#999';var sym2=v>0?'▲':v<0?'▼':'·';return '<td style="background:'+bg2+';color:'+col2+';padding:5px 4px;font-weight:700" title="'+(v>0?'+':'')+v+'">'+sym2+'</td>';}
  var hm='<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;text-align:center;width:100%;font-family:monospace"><thead><tr style="background:#f8f4ec;color:#543"><th style="padding:5px 6px">流年</th>'+dims.map(function(d){return '<th style="padding:5px 4px;font-weight:700">'+d+'</th>';}).join('')+'</tr></thead><tbody>';
  items.forEach(function(l){hm+='<tr><td style="padding:5px 6px;font-weight:700;color:#543">'+l.y+'</td>'+dims.map(function(d){return cell(l.d[d]||0);}).join('')+'</tr>';});
  hm+='</tbody></table></div>';
  var legend='<div style="margin-top:8px;padding:8px 10px;background:#f8f4ec;border-radius:4px;font-size:11px;color:#543;line-height:1.7"><b>分数 → 吉凶程度</b>（悬停格看具体分，含流年+大限基调×0.5叠加）：<br><b style="color:#1b5e20">+2 及以上 = 大吉</b>（强喜用，顺势发力）｜ <b style="color:#2e7d32">+1 = 吉</b>（喜用）｜ <b>0 = 平</b>（无星或喜忌抵消）｜ <b style="color:#c62828">-1 = 凶</b>（忌神，需防）｜ <b style="color:#8b1a1a">-2 及以下 = 大凶</b>（强忌神，重点防范）</div>';
  hm='<details style="margin-top:6px"><summary style="cursor:pointer;font-size:13px;color:#4a6a8e;font-weight:600;padding:6px 0">🔍 展开维度明细热力图（每年各维度吉凶 · 悬停看分数）</summary>'+hm+legend+'</details>';
  area.innerHTML=curve+hm;
}
function showDy(dk){document.querySelectorAll('.dy-panel').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.dy-card').forEach(c=>c.classList.remove('active'));document.getElementById('panel-'+dk)?.classList.add('active');document.querySelector('[data-dy="'+dk+'"]')?.classList.add('active');drawTrend(ALL.filter(l=>l.ck===dk));}
showDy('${esc(currentDk)}');
</script></body></html>`;
fs.writeFileSync(outPath, html);
console.error(`✅ ${outPath} (盘面+八字+三方四正+宫干飞化+${data.length}年运势, ${daXians.length}大限${interpPath?' +LLM解读':''})`);
