#!/usr/bin/env node
/**
 * 紫微合盘 HTML —— 双方命盘契合度对照（婚姻 / 事业合作）
 *   左右双盘关键宫对照 + 夫妻/福德双宫联参 + 太阳太阴 + 四化互参 + 大限同步 + LLM 五步法注入
 * 用法: node gen_heming_ziwei_html.js <A:YYYY-M-D> <A时辰0-12> <A男|女> <B:YYYY-M-D> <B时辰0-12> <B男|女> [输出.html] [合盘解读.json]
 *   无参数: demo 双方 1990-03-15 卯时男 × 1992-08-20 酉时女
 * 依赖: iztro v2.5.8 (vendor/iztro) + 运行时依赖 (vendor/node_modules)
 */
const path = require('path'), fs = require('fs');
const { astro } = require(path.join(__dirname, 'vendor/iztro/lib/index.js'));
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const argv = process.argv.slice(2);
let dA, tA, gA, dB, tB, gB, outPath, jiePath;
if (argv.length >= 6) {
  [dA, tA, gA, dB, tB, gB] = argv; tA = Number(tA); tB = Number(tB);
  outPath = argv[6] || `紫微合盘-${dA.split('-')[0]}×${dB.split('-')[0]}.html`;
  jiePath = argv[7] || '';
} else {
  dA='1990-3-15'; tA=3; gA='男'; dB='1992-8-20'; tB=9; gB='女';
  outPath='紫微合盘-demo.html'; jiePath='';
  console.error('[demo] A=1990-03-15卯时男 × B=1992-08-20酉时女 → '+outPath);
}

const A = astro.bySolar(dA, tA, gA, true, 'zh-CN');
const B = astro.bySolar(dB, tB, gB, true, 'zh-CN');
let jie = {};
if (jiePath && fs.existsSync(jiePath)) { try { jie = JSON.parse(fs.readFileSync(jiePath,'utf8')); } catch(e){ console.error('合盘解读JSON解析失败:',e.message); } }
const jieSec = (title, arr) => (arr && arr.length) ? `<div class="jie-card"><h4>${title}</h4>${arr.map(x=>`<p>${esc(x)}</p>`).join('')}</div>` : '';

// —— 工具：取某盘某宫主星串（空宫标借对宫）——
const starsOf = (pan, name) => {
  const p = pan.palaces.find(x => x.name === name);
  if (!p) return '—';
  const ms = (p.majorStars || []).map(s => s.name + (s.mutagen ? '化' + s.mutagen : '') + (s.brightness ? '(' + s.brightness + ')' : ''));
  return ms.length ? ms.join('、') : '<span class="loan">(空宫·借对宫)</span>';
};
const mingMain = pan => { const p = pan.palaces.find(x=>x.name==='命宫'); return p ? (p.majorStars||[]).map(s=>s.name).join('、')||'空宫' : '—'; };
const bodyGong = pan => { const p = pan.palaces.find(x=>x.isBodyPalace); return p ? p.name : '—'; };
const findStar = (pan, starName) => {
  for (const p of pan.palaces) {
    const s = (p.majorStars||[]).find(x => x.name === starName);
    if (s) return { palace: p.name, brightness: s.brightness || '', mutagen: s.mutagen || '' };
  }
  return null;
};
// A 的生年四化星，在 B 盘落哪个宫
const fourHuaCross = (from, to) => {
  const out = [];
  from.palaces.forEach(p => (p.majorStars||[]).filter(s=>s.mutagen).forEach(s => {
    const t = findStar(to, s.name);
    out.push({ hua: s.name + '化' + s.mutagen, inTo: t ? t.palace : '—' });
  }));
  return out;
};
const A2B = fourHuaCross(A, B), B2A = fourHuaCross(B, A);
// 当前大限
const CUR = 2026;
const curDx = pan => {
  const by = Number((pan.solarDate || dA).split('-')[0]);
  const age = CUR - by;
  const p = pan.palaces.find(x => x.decadal && x.decadal.range && age >= x.decadal.range[0] && age <= x.decadal.range[1]);
  return p ? (p.decadal.heavenlyStem + p.decadal.earthlyBranch + '·' + p.name) : '—';
};

// —— 关键宫联参表 ——
const DUAL_PALACES = ['命宫','身宫','夫妻','福德','财帛','官禄','迁移','子女'];
const dualRows = DUAL_PALACES.map(n => {
  const a = n === '身宫' ? bodyGong(A) : starsOf(A, n);
  const b = n === '身宫' ? bodyGong(B) : starsOf(B, n);
  return `<tr><td class="pn">${esc(n)}</td><td class="pa">${a}</td><td class="pb">${b}</td></tr>`;
}).join('');

// —— 太阳太阴 ——
const sunA = findStar(A, '太阳'), moonA = findStar(A, '太阴');
const sunB = findStar(B, '太阳'), moonB = findStar(B, '太阴');
const starInfo = s => s ? `<b>${esc(s.palace)}</b>${s.brightness?' · '+esc(s.brightness):''}${s.mutagen?' · 化'+esc(s.mutagen):''}` : '—';

// —— 四化互参表 ——
const crossRow = (list, dir) => list.map(x => `<tr><td class="hua">${esc(x.hua)}</td><td>${esc(dir)}</td><td>${esc(x.inTo)}</td></tr>`).join('');

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>紫微合盘·${esc(dA)} × ${esc(dB)}</title>
<style>
:root{--paper:#f6efe1;--paper2:#efe6d2;--ink:#2a2118;--ink2:#4a3d2c;--v:#9c2b22;--gold:#9a7a2e;--jade:#3f6b4e;--line:#cdb98a;--lu:#4f8a63;--quan:#3a4a7a;--ke:#2a7b8a;--ji:#c0392b}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:"PingFang SC","Microsoft YaHei","Noto Serif SC",serif;background:var(--paper);color:var(--ink);font-size:16px;line-height:1.75;padding:14px;background-image:radial-gradient(circle at 20% 8%,rgba(154,122,46,.07),transparent 42%),radial-gradient(circle at 82% 92%,rgba(156,43,34,.05),transparent 42%)}
.wrap{max-width:1000px;margin:0 auto}
header{text-align:center;padding:12px 0;border-bottom:3px double var(--line);margin-bottom:12px}
h1{font-size:26px;color:var(--v);letter-spacing:3px}.sub{font-size:13.5px;color:var(--ink2);margin-top:5px}
section{background:rgba(255,253,247,.6);border:1px solid var(--line);border-radius:8px;padding:15px;margin-bottom:12px}
.sec-title{font-size:17.5px;color:var(--v);font-weight:700;margin-bottom:11px;border-left:4px solid var(--v);padding-left:9px}
.couple{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.person{background:rgba(255,253,247,.85);border:1.5px solid var(--line);border-radius:8px;padding:13px}
.person.a{border-color:var(--v)}.person.b{border-color:var(--jade)}
.person .tag{display:inline-block;font-size:11px;color:#fff;padding:1px 8px;border-radius:9px;font-weight:700}.person.a .tag{background:var(--v)}.person.b .tag{background:var(--jade)}
.person .info{font-size:14px;margin-top:7px;line-height:1.9}.person .info b{color:var(--gold)}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{border:1px solid var(--line);padding:7px 9px;text-align:left;vertical-align:top}
th{background:var(--paper2);color:var(--v);font-weight:700;text-align:center}
td.pn{text-align:center;font-weight:700;color:var(--gold);white-space:nowrap;width:64px}
td.pa,td.pb{width:42%}.loan{color:#a96;font-size:12px}
.note{font-size:12.5px;color:#998;margin-top:8px;line-height:1.7}
.cross td.hua{font-weight:700;color:var(--v);white-space:nowrap}
.jie-card{background:rgba(255,253,247,.7);border-left:3px solid var(--jade);border-radius:6px;padding:11px 15px;margin:8px 0}
.jie-card h4{color:var(--jade);font-size:16px;margin-bottom:6px}.jie-card p{font-size:14.5px;margin:5px 0;color:#334;line-height:1.8}
.score{font-size:15px;color:var(--gold);background:rgba(154,122,46,.1);border:1px solid var(--line);border-radius:6px;padding:9px 13px;margin:8px 0}
.disclaim{background:#3a2f22;color:#e8dcc2;padding:13px;border-radius:8px;font-size:13px;line-height:1.75;border-left:4px solid var(--v);margin-top:12px}
.disclaim b{color:#f0c674}
</style></head><body><div class="wrap">
<header><h1>紫微合盘 · 双方契合度详批</h1>
<div class="sub">${esc(dA)} ${gA} × ${esc(dB)} ${gB} · 婚姻/合作配对 · 按 <code>heming-method.md</code> 紫微合盘推演</div></header>

<section><div class="sec-title">一、双方命格基础</div>
<div class="couple">
  <div class="person a"><span class="tag">甲方</span><div class="info">${esc(dA)} ${gA}<br>五行局 <b>${esc(A.fiveElementsClass||'—')}</b> · 命主 <b>${esc(A.soul||'—')}</b><br>命宫主星 <b>${mingMain(A)}</b> · 身宫 <b>${esc(bodyGong(A))}</b><br>当前大限 <b>${esc(curDx(A))}</b></div></div>
  <div class="person b"><span class="tag">乙方</span><div class="info">${esc(dB)} ${gB}<br>五行局 <b>${esc(B.fiveElementsClass||'—')}</b> · 命主 <b>${esc(B.soul||'—')}</b><br>命宫主星 <b>${mingMain(B)}</b> · 身宫 <b>${esc(bodyGong(B))}</b><br>当前大限 <b>${esc(curDx(B))}</b></div></div>
</div>
<div class="note">婚姻须<b>夫妻宫 + 福德宫双宫联参</b>：夫妻宫看配偶星性互动，福德宫看深层感情能否长久。单看夫妻宫易误判。</div>
</section>

<section><div class="sec-title">二、关键宫位联参对照</div>
<table><thead><tr><th>宫位</th><th>甲方</th><th>乙方</th></tr></thead><tbody>${dualRows}</tbody></table>
</section>

<section><div class="sec-title">三、太阳太阴星象（女命太阳=夫，男命太阴=妻）</div>
<table><thead><tr><th></th><th>甲方 ${esc(gA)}</th><th>乙方 ${esc(gB)}</th></tr></thead><tbody>
<tr><td class="pn">太阳</td><td>${starInfo(sunA)}</td><td>${starInfo(sunB)}</td></tr>
<tr><td class="pn">太阴</td><td>${starInfo(moonA)}</td><td>${starInfo(moonB)}</td></tr>
</tbody></table>
<div class="note">太阳庙旺=旺夫/自身贵，落陷化忌=克象；太阴庙旺=妻美贤/自身秀，化忌=婆媳不和之象。</div>
</section>

<section><div class="sec-title">四、本命四化互参（A 四化落 B 盘 / B 四化落 A 盘）</div>
<table class="cross"><thead><tr><th>四化</th><th>方向</th><th>落入对方宫位</th></tr></thead><tbody>${crossRow(A2B,'A→B')}${crossRow(B2A,'B→A')}</tbody></table>
<div class="note">化禄入对方命/财=正向帮助；化忌入对方夫妻=带给对方婚姻伤害；双方互化忌=冤家型。</div>
</section>

<section><div class="sec-title">五、合盘深度分析（LLM 按 heming-method 五步法推演）</div>
${jie['契合度'] ? `<div class="score">⭐ 综合契合度：<b>${esc(jie['契合度'])}</b></div>` : '<div class="note">（未提供合盘解读 JSON，下方为结构框架；LLM 按 heming-method.md 紫微合盘五步法注入分析）</div>'}
${jieSec('第一步·命格基础般配', jie['命格基础'])}
${jieSec('第二步·夫妻宫互参', jie['夫妻互参'])}
${jieSec('第三步·太阳太阴星象', jie['日月星象'])}
${jieSec('第四步·四化互参', jie['四化互参'])}
${jieSec('第五步·大限同步', jie['大限同步'])}
${jieSec('缘分类型', jie['缘分类型'])}
${jieSec('婚期建议', jie['婚期'])}
${jieSec('综合建议', jie['建议'])}
</section>

<div class="disclaim"><b>免责声明</b>：本分析基于所提供的双方命盘数据，运用中国传统命理技法推演合盘。命理学属于传统文化，<b>并非实证科学，不具备经过科学验证的预测能力</b>。所有缘分判断、契合度与建议，<b>仅适用于文化研究、自我觉察与娱乐参考，不能替代专业心理咨询、法律意见或婚姻决策</b>。感情与婚姻由双方共同经营，理性看待、积极沟通。如有实际困扰，请咨询专业持证人士。</div>
</div></body></html>`;

fs.writeFileSync(outPath, html, 'utf-8');
console.error(`✅ ${outPath} (双方${DUAL_PALACES.length}宫联参+太阳太阴+四化互参${A2B.length+B2A.length}条+大限同步${jiePath?' +LLM合盘解读':''})`);
