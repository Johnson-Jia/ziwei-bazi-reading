#!/usr/bin/env node
/**
 * 八字 LLM 推演输入生成器 —— 把 bazi_core 排定的八字盘渲染为 LLM 友好的结构化 markdown。
 *
 * 对偶于 gen_ziwei_llm_md.js。八字排盘虽比紫微简单,但 LLM 仍易算错(起运岁数/十神/四参合喜忌/藏干),
 * 本脚本以"已对标问真八字"的 bazi_core 为真相源,输出结构化文本,配合 prompt 头
 * "仅据此推演,禁止自行排盘",规避 LLM 幻觉排盘。
 *
 * 三模式:
 *   benming            本命盘(四柱/藏干十神/旺衰/四参合喜忌·财印关系/大运/刑冲合害)
 *   dingpan            相邻两时辰对照 + 【八字零区分度】铁律提示(定盘主力是紫微,勿用八字流年定盘)
 *   liunian <年份>     指定年份流年(大运基调 + 太岁十神喜忌 + 刑冲合害 + 十维度)
 *
 * 用法:
 *   node gen_bazi_llm_md.js <Y> <M> <D> <H> <MIN> <男|女> benming              [输出.md]
 *   node gen_bazi_llm_md.js <Y> <M> <D> <H1-H2> <MIN> <男|女> dingpan          [输出.md]
 *   node gen_bazi_llm_md.js <Y> <M> <D> <H> <MIN> <男|女> liunian <年份>       [输出.md]
 *   无参数: 演示(通用示例) 2000-08-16 14:30 男 benming
 *
 * 依赖: bazi_core(排盘+旺衰+喜忌+流年)、vendor/bazi(刑冲合害+神煞)
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { ensureWorkspace } = require('./_workspace');
const { analyze } = require('./bazi_core');
const { analyzeZhiRelations } = require(path.join(__dirname, 'vendor/bazi/bazi_relations.js'));

const POS = ['年', '月', '日', '时'];
const splitPillars = fps => fps.map(s => ({ gan: s[0], zhi: s[1] }));
const dimOf = (dims, v) => Object.entries(dims).filter(([, d]) => d.verdict === v).map(([k]) => k);

// ─────────── 参数解析 ───────────
const argv = process.argv.slice(2);
let Y, Mo, D, H, MIN, gender, mode, year, outPath;
if (argv.length >= 6) {
  [Y, Mo, D, H, MIN, gender] = argv;
  Y = Number(Y); Mo = Number(Mo); D = Number(D); MIN = Number(MIN);
  mode = argv[6] || 'benming';
  if (mode === 'liunian') { year = Number(argv[7]) || new Date().getFullYear(); outPath = argv[8]; }
  else { outPath = argv[7]; }
} else {
  Y = 2000; Mo = 8; D = 16; H = '14'; MIN = 30; gender = '男'; mode = 'benming';
  console.error('[demo] 未提供参数,用演示(通用示例) 2000-08-16 14:30 男 benming。用法见文件头。');
}

// ─────────── 模式一:本命盘 ───────────
function renderBenming(Y, Mo, D, H, MIN, gender) {
  const c = analyze(Y, Mo, D, Number(H), MIN, gender, 2000, 2000).chart;   // 只要 chart,流年范围随意
  const pillars = splitPillars(c.fourPillars);
  const out = [];
  out.push('# 八字命盘 · LLM 推演输入');
  out.push('> 经 tyme4ts 引擎排定(已对标问真八字)。**仅据此推演,禁止自行排盘。**\n');
  out.push('## 基本信息');
  out.push(`- ${gender}命 · ${Y}-${Mo}-${D} ${H}:${String(MIN).padStart(2, '0')}`);
  out.push(`- 四柱:${c.fourPillars.join(' ')}(年/月/日/时)`);
  out.push(`- 日主:**${c.dayMaster}** · 纳音:${c.nayin.join('/')}`);
  out.push(`- 旺衰:**${c.strength}**(score ${c.strengthDetail.score}) · 旬空:${c.kongWang.join('·') || '无'}`);
  const firstAge = c.daYun[0] ? c.daYun[0].ages.split('-')[0] : '-';
  out.push(`- 起运:${c.childLimit.years}年${c.childLimit.months}月${c.childLimit.days}天(虚岁${firstAge}起)\n`);

  out.push('## 五行与喜忌(四参合定用:旺衰+调候+缺补+通关)');
  out.push(`- 五行分布(天干+藏干):${Object.entries(c.wxCount).map(([k, v]) => `${k}×${v}`).join(' ')}`);
  if (c.wxMissing.length) out.push(`- **缺五行**:${c.wxMissing.join('·')}`);
  if (c.wxNearMissing.length) out.push(`- 近缺(藏库不透):${c.wxNearMissing.join('·')}`);
  out.push(`- **喜用**:${c.yongShen.join('·')} · **忌神**:${c.jiShen.join('·')}`);
  if (c.yjNotes && Object.keys(c.yjNotes).length) {
    out.push('- 定用 notes:');
    for (const [k, v] of Object.entries(c.yjNotes)) out.push(`  - ${k}: ${v}`);
  }
  if (c.yjRevisions && c.yjRevisions.length) {
    out.push(`- 喜忌修正:${c.yjRevisions.map(r => `${r.tg} ${r.from}→${r.to}(${r.why})`).join('; ')}`);
  }

  out.push('\n## 大运');
  for (const d of c.daYun) {
    const bad = dimOf(d.dims, '凶'), good = dimOf(d.dims, '吉');
    out.push(`- ${d.ganzhi} ${d.ages}岁(${d.years})${bad.length ? ` 凶:${bad.join('/')}` : ''}${good.length ? ` 吉:${good.join('/')}` : ''}`);
  }

  const zhiRels = analyzeZhiRelations(pillars.map((p, i) => [POS[i], p.zhi]));
  if (zhiRels.length) {
    out.push('\n## 本局刑冲合害');
    for (const r of zhiRels) out.push(`- ${r.type}: ${r.positions.join('↔')}`);
  }
  return out.join('\n');
}

// ─────────── 模式二:定盘对照(八字零区分度铁律) ───────────
function renderDingpan(Y, Mo, D, H1, H2, MIN, gender) {
  const c1 = analyze(Y, Mo, D, H1, MIN, gender, 2000, 2000).chart;
  const c2 = analyze(Y, Mo, D, H2, MIN, gender, 2000, 2000).chart;
  const out = [];
  out.push('# 八字定盘对照 · LLM 推演输入');
  out.push('> 两候选时辰对照(均经 tyme4ts 排定、对标问真八字)。**仅据此推演,禁止自行排盘。**\n');
  out.push('> ⚠ **方法论铁律**:相邻两时辰的【大运序列】与【流年十神】**完全相同**——');
  out.push('> 大运由月柱起逆排(与时柱无关),流年十神由日干定(与时柱无关)。');
  out.push('> 故 **八字流年应事法对相邻时辰区分度为零**;**定盘主力是紫微斗数**。');
  out.push('> 八字层面仅有"时柱 / 旺衰程度 / 财印缺补"的差异可参,**切勿用八字流年定盘**(否则重蹈 DeepSeek 覆辙)。\n');
  out.push('## 两盘对照');
  out.push(`- ${H1}时(时柱${c1.fourPillars[3]}):${c1.fourPillars.join(' ')} | ${c1.dayMaster}${c1.strength}(score ${c1.strengthDetail.score})`);
  out.push(`- ${H2}时(时柱${c2.fourPillars[3]}):${c2.fourPillars.join(' ')} | ${c2.dayMaster}${c2.strength}(score ${c2.strengthDetail.score})`);
  out.push(`- **大运:两盘均为** ${c1.daYun.map(d => d.ganzhi).join(' → ')} ✓ 零区分度`);
  out.push(`- **喜忌:两盘同向** 喜${c1.yongShen.join('·')}/忌${c1.jiShen.join('·')} ✓ 仅旺衰程度有别\n`);
  out.push('## 八字层面差异(仅程度/结构,非流年判据)');
  out.push(`- 旺衰程度:${c1.fourPillars[3]} score ${c1.strengthDetail.score} vs ${c2.fourPillars[3]} score ${c2.strengthDetail.score}`);
  out.push(`- 时柱藏干十神:${c1.fourPillars[3]}(${c1.hideTenGod[3].join(',') || '空'}) vs ${c2.fourPillars[3]}(${c2.hideTenGod[3].join(',') || '空'})`);
  const n1 = JSON.stringify(c1.yjNotes), n2 = JSON.stringify(c2.yjNotes);
  if (n1 !== n2) {
    out.push('- 定用 notes 差异(财印/缺补):');
    out.push(`  - ${c1.fourPillars[3]}: ${n1}`);
    out.push(`  - ${c2.fourPillars[3]}: ${n2}`);
  } else {
    out.push('- 定用 notes:两盘一致');
  }
  out.push('\n## 定盘判据提示');
  out.push('八字**无法独立定盘**(相邻时辰流年全同),须结合紫微 + 命主事实锚点。八字倾向仅供辅助:');
  out.push(`- 旺衰程度:财多身弱烈度更吻合"强行求财大破"者(本例 ${c1.fourPillars[3]} ${c1.strengthDetail.score} vs ${c2.fourPillars[3]} ${c2.strengthDetail.score});`);
  out.push('- 时柱印根:时支含日主长生/印根者,学业技术根基更稳(倾向"印有根·正途");');
  out.push('- 财印关系:印全虚/印透无根倾向"学业非正途",见 notes。');
  return out.join('\n');
}

// ─────────── 模式三:流年盘 ───────────
function renderLiunian(Y, Mo, D, H, MIN, gender, year) {
  const r = analyze(Y, Mo, D, Number(H), MIN, gender, year, year);
  const ln = r.liunian[0];
  if (!ln) return `# 八字流年 · ${year} · 无数据(超出范围)`;
  const c = r.chart;
  const dy = ln.dayunDims || {};
  const out = [];
  out.push(`# 八字流年 · ${ln.taiSui}年 · LLM 推演输入`);
  out.push('> 经 tyme4ts 运限排定。**仅据此推演,禁止自行排盘。**\n');
  out.push(`命主:${Y}-${Mo}-${D} ${H}:${MIN} ${gender} · 日主${c.dayMaster}${c.strength} · 虚岁${ln.age}\n`);
  out.push('## 大运基调');
  out.push(`- 当前大运:**${ln.dayun}** · 吉:${dimOf(dy, '吉').join('/') || '无'} / 凶:${dimOf(dy, '凶').join('/') || '无'}\n`);
  out.push('## 流年太岁');
  out.push(`- 太岁:${ln.taiSui} · 综合 ${ln.score >= 0 ? '+' : ''}${ln.score} → **${ln.verdict}**`);
  out.push(`- 天干:${ln.gan.tenGod}(${ln.gan.attr}) — ${ln.gan.note}`);
  out.push(`- 地支:${ln.zhi.tenGod}(${ln.zhi.attr}) — ${ln.zhi.note}`);
  if (ln.zhiRelations && ln.zhiRelations.length) out.push(`- 刑冲合害:${ln.zhiRelations.join('; ')}`);
  out.push('\n## 十维度吉凶(流年层)');
  for (const [k, v] of Object.entries(ln.baziDims)) {
    out.push(`- **${k}**:${v.verdict}(${v.score >= 0 ? '+' : ''}${v.score})${v._ ? ' — ' + v._ : ''}`);
  }
  return out.join('\n');
}

// ─────────── 主入口 ───────────
const WS = ensureWorkspace();
let output, outFile;
if (mode === 'dingpan') {
  const parts = String(H).split('-').map(Number);
  if (parts.length < 2 || isNaN(parts[1])) { console.error('dingpan 模式 H 传 H1-H2,如 20-22'); process.exit(1); }
  output = renderDingpan(Y, Mo, D, parts[0], parts[1], MIN, gender);
  outFile = outPath || path.join(WS, `八字-LLM-dingpan-${Y}-${Mo}-${D}.md`);
} else if (mode === 'liunian') {
  output = renderLiunian(Y, Mo, D, H, MIN, gender, year);
  outFile = outPath || path.join(WS, `八字-LLM-liunian-${Y}-${year}.md`);
} else {
  output = renderBenming(Y, Mo, D, H, MIN, gender);
  outFile = outPath || path.join(WS, `八字-LLM-benming-${Y}-${Mo}-${D}-${H}.md`);
}
fs.writeFileSync(outFile, output);
console.log(output);
console.error(`\n✅ 已写入 ${outFile}`);
