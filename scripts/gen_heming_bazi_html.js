#!/usr/bin/env node
/**
 * 八字合盘 HTML —— 双方四柱合婚对照（婚姻 / 事业合作）
 *   双方四柱+纳音对照 + 日主十神关系 + 喜用对照 + 年柱纳音生克 + 命局神煞对比 + LLM 合婚注入
 * 用法: node gen_heming_bazi_html.js <A:Y M D H MIN 男|女> <B:Y M D H MIN 男|女> [输出.html] [合婚解读.json]
 *   无参数: demo A=2000-08-16 14:30 男 × B=1995-05-08 14:00 女
 * 依赖: tyme4ts (vendor/tyme4ts) + bazi_core + vendor/bazi/shensha
 */
const path = require('path'), fs = require('fs');
const { ensureWorkspace } = require('./_workspace');
const WS = ensureWorkspace();
const { analyze, tenGodClass, GAN_WX } = require('./bazi_core');
const { analyzeShensha } = require(path.join(__dirname, 'vendor/bazi/shensha.js'));
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const argv = process.argv.slice(2);
let pA, pB, outPath, jiePath;
if (argv.length >= 12) {
  pA = argv.slice(0, 6); pB = argv.slice(6, 12);
  outPath = argv[12] || path.join(WS, `八字合盘-${pA[0]}×${pB[0]}.html`);
  jiePath = argv[13] || '';
} else {
  pA = ['2000','8','16','14','30','男']; pB = ['1995','5','8','14','0','女'];
  outPath = path.join(WS, '八字合盘-demo.html'); jiePath = '';
  console.error('[demo] A=2000-08-16 14:30 男 × B=1995-05-08 14:00 女 → '+outPath);
}

const pan = p => {
  const [Y, Mo, D, H, MIN, g] = p.map((x, i) => i < 5 ? Number(x) : x);
  const r = analyze(Y, Mo, D, H, MIN, g, Y, Y);   // 合盘不用流年逐年，给窄范围省时
  const fp = r.chart.fourPillars;
  const pillar = fp.map((c, i) => ({ pos: ['年','月','日','时'][i], gan: c[0], zhi: c[1] }));
  return { ...r.chart, fourPillars: fp, pillar, gender: g, birthYear: Y };
};
const A = pan(pA), B = pan(pB);
A.shensha = analyzeShensha(A.pillar, A.gender, A.nayin[0]);
B.shensha = analyzeShensha(B.pillar, B.gender, B.nayin[0]);

let jie = {};
if (jiePath && fs.existsSync(jiePath)) { try { jie = JSON.parse(fs.readFileSync(jiePath,'utf8')); } catch(e){ console.error('合婚解读JSON解析失败:',e.message); } }
const jieSec = (title, arr) => (arr && arr.length) ? `<div class="jie-card"><h4>${title}</h4>${arr.map(x=>`<p>${esc(x)}</p>`).join('')}</div>` : '';

// —— 关系计算 ——
const POS = ['年柱','月柱','日柱','时柱'];
const pillarRow = i => `<tr><td class="pn">${esc(POS[i])}</td><td class="pa">${esc(A.fourPillars[i])}<span class="ny">${esc(A.nayin[i])}</span></td><td class="pb">${esc(B.fourPillars[i])}<span class="ny">${esc(B.nayin[i])}</span></td></tr>`;
// 日主十神关系：A 看 B 的日主是什么十神
const A_see_B = tenGodClass(A.dayMaster, B.dayMaster);
const B_see_A = tenGodClass(B.dayMaster, A.dayMaster);
// 日主五行
const wxA = GAN_WX[A.dayMaster], wxB = GAN_WX[B.dayMaster];
const WX_SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};
const wxRel = (a, b) => a === b ? '比和（同行）' : WX_SHENG[a] === b ? `${a}生${b}（A生B）` : WX_SHENG[b] === a ? `${b}生${a}（B生A）` : `${a}与${b}相克`;
// 年柱纳音五行（纳音名末字）
const nyWx = ny => { const m = /([木火土金水])$/.exec(ny); return m ? m[1] : ''; };
const nyA = nyWx(A.nayin[0]), nyB = nyWx(B.nayin[0]);
// 神煞 → 文本（兼容对象/数组）
const shenshaText = s => {
  if (!s) return '—';
  let items = [];
  if (Array.isArray(s)) items = s.map(x => typeof x === 'string' ? x : (x.name || JSON.stringify(x)));
  else if (typeof s === 'object') items = Object.entries(s).filter(([,v]) => v).map(([k,v]) => `${k}`);
  else items = [String(s)];
  return items.filter(Boolean).join('、') || '无明显神煞';
};
const TAOHUA = ['咸池','红艳','红鸾','天喜','天姚','沐浴'];
const GUXIN = ['孤辰','寡宿'];
const markTaohua = txt => TAOHUA.some(t => txt.includes(t));
const markGuxin = txt => GUXIN.some(t => txt.includes(t));

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>八字合盘·${esc(pA[0])} × ${esc(pB[0])}</title>
<style>
:root{--paper:#eef2f5;--paper2:#dde6ec;--ink:#1f2a33;--ink2:#3a4a55;--v:#2a6f8e;--gold:#7a8a2e;--jade:#3f6b4e;--line:#b8c8d2;--ji:#c0392b}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:"PingFang SC","Microsoft YaHei","Noto Serif SC",serif;background:var(--paper);color:var(--ink);font-size:16px;line-height:1.75;padding:14px;background-image:radial-gradient(circle at 20% 8%,rgba(42,111,142,.06),transparent 42%),radial-gradient(circle at 82% 92%,rgba(122,138,46,.05),transparent 42%)}
.wrap{max-width:1000px;margin:0 auto}
header{text-align:center;padding:12px 0;border-bottom:3px double var(--line);margin-bottom:12px}
h1{font-size:26px;color:var(--v);letter-spacing:3px}.sub{font-size:13.5px;color:var(--ink2);margin-top:5px}
section{background:rgba(255,255,255,.6);border:1px solid var(--line);border-radius:8px;padding:15px;margin-bottom:12px}
.sec-title{font-size:17.5px;color:var(--v);font-weight:700;margin-bottom:11px;border-left:4px solid var(--v);padding-left:9px}
.couple{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.person{background:rgba(255,255,255,.85);border:1.5px solid var(--line);border-radius:8px;padding:13px}
.person.a{border-color:var(--v)}.person.b{border-color:var(--jade)}
.person .tag{display:inline-block;font-size:11px;color:#fff;padding:1px 8px;border-radius:9px;font-weight:700}.person.a .tag{background:var(--v)}.person.b .tag{background:var(--jade)}
.person .info{font-size:14px;margin-top:7px;line-height:1.9}.person .info b{color:var(--gold)}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{border:1px solid var(--line);padding:7px 9px;text-align:left;vertical-align:top}
th{background:var(--paper2);color:var(--v);font-weight:700;text-align:center}
td.pn{text-align:center;font-weight:700;color:var(--gold);white-space:nowrap;width:64px}
td.pa,td.pb{width:42%}.ny{display:block;font-size:11.5px;color:#789;margin-top:2px}
.note{font-size:12.5px;color:#789;margin-top:8px;line-height:1.7}
.rel{font-size:15px;background:rgba(42,111,142,.08);border:1px solid var(--line);border-radius:6px;padding:9px 13px;margin:8px 0}.rel b{color:var(--v)}
.jie-card{background:rgba(255,255,255,.7);border-left:3px solid var(--jade);border-radius:6px;padding:11px 15px;margin:8px 0}
.jie-card h4{color:var(--jade);font-size:16px;margin-bottom:6px}.jie-card p{font-size:14.5px;margin:5px 0;color:#334;line-height:1.8}
.score{font-size:15px;color:var(--gold);background:rgba(122,138,46,.1);border:1px solid var(--line);border-radius:6px;padding:9px 13px;margin:8px 0}
.tag-ss{display:inline-block;font-size:10px;padding:0 5px;border-radius:6px;margin-left:3px;color:#fff;vertical-align:middle}
.tag-th{background:var(--ji)}.tag-gx{background:#8a6d3b}
.disclaim{background:#2a333b;color:#c2d0da;padding:13px;border-radius:8px;font-size:13px;line-height:1.75;border-left:4px solid var(--v);margin-top:12px}
.disclaim b{color:#7ec5e8}
</style></head><body><div class="wrap">
<header><h1>八字合盘 · 双方四柱合婚详批</h1>
<div class="sub">${esc(pA.slice(0,5).join('-'))} ${esc(pA[5])} × ${esc(pB.slice(0,5).join('-'))} ${esc(pB[5])} · 婚姻/合作配对 · 按 <code>heming-method.md</code> 八字合婚推演</div></header>

<section><div class="sec-title">一、双方命格基础</div>
<div class="couple">
  <div class="person a"><span class="tag">甲方</span><div class="info">${esc(pA.slice(0,5).join('-'))} ${esc(A.gender)}<br>日主 <b>${esc(A.dayMaster)}</b>（${esc(wxA)}）· 旺衰 <b>${esc(A.strength)}</b><br>喜用 <b>${esc((A.yongShen||[]).join('、'))}</b> · 忌神 <b>${esc((A.jiShen||[]).join('、'))}</b><br>年柱纳音 <b>${esc(A.nayin[0])}</b></div></div>
  <div class="person b"><span class="tag">乙方</span><div class="info">${esc(pB.slice(0,5).join('-'))} ${esc(B.gender)}<br>日主 <b>${esc(B.dayMaster)}</b>（${esc(wxB)}）· 旺衰 <b>${esc(B.strength)}</b><br>喜用 <b>${esc((B.yongShen||[]).join('、'))}</b> · 忌神 <b>${esc((B.jiShen||[]).join('、'))}</b><br>年柱纳音 <b>${esc(B.nayin[0])}</b></div></div>
</div>
</section>

<section><div class="sec-title">二、四柱 + 纳音对照</div>
<table><thead><tr><th>柱位</th><th>甲方</th><th>乙方</th></tr></thead><tbody>${[0,1,2,3].map(pillarRow).join('')}</tbody></table>
</section>

<section><div class="sec-title">三、日主十神关系（双方日主生克）</div>
<div class="rel">甲方日主 <b>${esc(A.dayMaster)}</b>(${esc(wxA)}) 视乙方日主 <b>${esc(B.dayMaster)}</b>(${esc(wxB)}) 为 → <b>${esc(A_see_B)}</b>；乙方视甲方为 → <b>${esc(B_see_A)}</b>。<br>日主五行：<b>${esc(wxRel(wxA, wxB))}</b>。相生相助为顺，相克为逆（需看命局能否化解）。</div>
</section>

<section><div class="sec-title">四、年柱纳音生克</div>
<div class="rel">甲方年柱纳音 <b>${esc(A.nayin[0])}</b>（${esc(nyA)}）｜ 乙方 <b>${esc(B.nayin[0])}</b>（${esc(nyB)}）→ <b>${esc(nyA && nyB ? wxRel(nyA, nyB) : '纳音五行待定')}</b>。纳音相生为顺，仅作参考不为主。</div>
</section>

<section><div class="sec-title">五、命局神煞对比（桃花 / 孤辰寡宿相配）</div>
<table><thead><tr><th></th><th>甲方</th><th>乙方</th></tr></thead><tbody>
<tr><td class="pn">神煞</td><td>${esc(shenshaText(A.shensha))}${markTaohua(shenshaText(A.shensha))?'<span class="tag-ss tag-th">桃花</span>':''}${markGuxin(shenshaText(A.shensha))?'<span class="tag-ss tag-gx">孤克</span>':''}</td><td>${esc(shenshaText(B.shensha))}${markTaohua(shenshaText(B.shensha))?'<span class="tag-ss tag-th">桃花</span>':''}${markGuxin(shenshaText(B.shensha))?'<span class="tag-ss tag-gx">孤克</span>':''}</td></tr>
</tbody></table>
<div class="note">一方桃花旺而另一方孤辰寡宿，需注意感情节奏差异；双方皆带华盖则性情相投但偏孤。神煞相配为辅，主看日主与喜用。</div>
</section>

<section><div class="sec-title">六、合婚深度分析（LLM 按 heming-method 八字合婚推演）</div>
${jie['契合度'] ? `<div class="score">⭐ 综合契合度：<b>${esc(jie['契合度'])}</b></div>` : '<div class="note">（未提供合婚解读 JSON，下方为结构框架；LLM 按 heming-method.md 八字合婚四法注入分析）</div>'}
${jieSec('神煞相配', jie['神煞相配'])}
${jieSec('年柱纳音', jie['纳音'])}
${jieSec('五行互补', jie['五行互补'])}
${jieSec('日主十神关系', jie['十神关系'])}
${jieSec('综合建议', jie['建议'])}
</section>

<div class="disclaim"><b>免责声明</b>：本分析基于所提供的双方四柱数据，运用中国传统命理技法推演合婚。命理学属于传统文化，<b>并非实证科学，不具备经过科学验证的预测能力</b>。所有缘分判断、契合度与建议，<b>仅适用于文化研究、自我觉察与娱乐参考，不能替代专业心理咨询、法律意见或婚姻决策</b>。感情与婚姻由双方共同经营，理性看待、积极沟通。如有实际困扰，请咨询专业持证人士。</div>
</div></body></html>`;

fs.writeFileSync(outPath, html, 'utf-8');
console.error(`✅ ${outPath} (双方四柱+纳音+日主十神关系${A_see_B}/${B_see_A}+纳音生克+神煞对比${jiePath?' +LLM合婚解读':''})`);
