#!/usr/bin/env node
/**
 * 紫微 LLM 推演输入生成器 —— 把 iztro 排定的命盘渲染为 LLM 友好的结构化 markdown。
 *
 * 为什么需要它:LLM 自排紫微盘极易错(命宫定位/安星/四化是查表+历法计算,非 LLM 所长,
 * 实测会把命宫、身宫、各宫主星整盘排错)。本脚本以"已对标文墨天机"的 iztro 为真相源,
 * 输出"信息完整 · 术语语义化 · 卡片式"文本,配合 prompt 头"仅据此推演,禁止自行排盘",
 * 从根上规避 LLM 幻觉排盘。
 *
 * 三模式:
 *   benming            本命盘(十二宫,每宫含主星四化亮度+辅星+煞空耗+大限标注)
 *   dingpan            相邻两候选时辰并排对照(关键六宫),供 LLM 据事实锚点判盘
 *   liunian <年份>     指定年份流年盘(大限基调 + 流年命宫 + 流年四化 + 十维度吉凶)
 *
 * 用法:
 *   node gen_ziwei_llm_md.js <YYYY-M-D> <时辰0-12>            <男|女> benming   [输出.md]
 *   node gen_ziwei_llm_md.js <YYYY-M-D> <时辰1-时辰2>         <男|女> dingpan   [输出.md]
 *   node gen_ziwei_llm_md.js <YYYY-M-D> <时辰0-12>            <男|女> liunian <年份> [输出.md]
 *   无参数: 演示(通用示例) 2000-08-16 戌时 男 benming
 *
 * 依赖: iztro(已 vendor)、_workspace、_ziwei_common(共享逻辑层)
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { astro } = require(path.join(__dirname, 'vendor/iztro/lib/index.js'));
const { ensureWorkspace } = require('./_workspace');
const C = require('./_ziwei_common');
const { FUJI_TEXT, SHA_TEXT, DIMS, WEIGHT_LIU, judgeDim, laiyinPalace, nianSihua, fmtStar, fmtSihua } = C;

// 十二宫标准顺时针顺序(命宫起)
const PALACE_ORDER = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

// ─────────── 参数解析 ───────────
const argv = process.argv.slice(2);
let dateStr, timeArg, gender, mode, year, outPath;
if (argv.length >= 3) {
  [dateStr, timeArg, gender] = argv;
  mode = argv[3] || 'benming';
  if (mode === 'liunian') { year = Number(argv[4]) || new Date().getFullYear(); outPath = argv[5]; }
  else { outPath = argv[4]; }
} else {
  dateStr = '2000-08-16'; timeArg = '10'; gender = '男'; mode = 'benming';
  console.error('[demo] 未提供参数,用演示(通用示例) 2000-08-16 戌时 男 benming。用法见文件头。');
}

// ─────────── 单宫渲染(本命盘用) ───────────
function renderPalace(p, a) {
  const laiyin = laiyinPalace(a);
  const tags = [];
  if (p.isBodyPalace) tags.push('身');
  if (laiyin && p.name === laiyin.name) tags.push('来因');
  const tag = tags.length ? `·${tags.join('·')}` : '';
  const dy = (p.decadal && p.decadal.range) ? ` ${p.decadal.range[0]}-${p.decadal.range[1]}岁(${p.decadal.heavenlyStem}${p.decadal.earthlyBranch})` : '';
  const head = `${p.name}[${p.heavenlyStem}${p.earthlyBranch}]${tag}${dy}`;
  const maj = (p.majorStars || []).map(fmtStar).join('·') || '空宫';

  // 辅星(吉辅类) + 煞/空/耗/桃花(白名单),从 minorStars 与 adjectiveStars 合并筛
  const minNames = (p.minorStars || []).map(s => s.name);
  const adjNames = (p.adjectiveStars || []).map(s => (typeof s === 'string' ? s : s.name));
  const all = [...minNames, ...adjNames];
  const fuji = [...new Set(all.filter(n => FUJI_TEXT.has(n)))];
  const sha = [...new Set(all.filter(n => SHA_TEXT.has(n)))];
  const tail = [];
  if (fuji.length) tail.push('辅:' + fuji.join('·'));
  if (sha.length) tail.push(sha.join('·'));
  return `**${head}** ${maj}${tail.length ? ' | ' + tail.join(' | ') : ''}`;
}

// ─────────── 模式一:本命盘 ───────────
function renderBenming(a) {
  const gz = (a.chineseDate || '').split(' ');
  const sihua = nianSihua(a);
  const laiyin = laiyinPalace(a);
  const gan = C.yearGanOf(a);
  const out = [];
  out.push('# 紫微命盘 · LLM 推演输入');
  out.push('> 经 iztro 引擎排定(已逐宫对标文墨天机)。**仅据此推演,禁止自行排盘。**\n');
  out.push('## 基本信息');
  out.push(`- ${a.solarDate} · ${a.time} · ${gender}命 · ${a.fiveElementsClass}`);
  out.push(`- 四柱:${gz.join(' ')}`);
  out.push(`- 命主:${a.soul} · 身主:${a.body} · 命宫:${a.earthlyBranchOfSoulPalace} · 身宫:${a.earthlyBranchOfBodyPalace}${laiyin ? ` · 来因宫:${laiyin.name}(${laiyin.heavenlyStem}${laiyin.earthlyBranch})` : ''}`);
  out.push(`- 生年四化(${gan}):${fmtSihua(sihua)}\n`);
  out.push('## 十二宫(命宫起顺布)');
  for (const name of PALACE_ORDER) {
    const p = a.palaces.find(x => x.name === name);
    if (p) out.push(renderPalace(p, a));
  }
  out.push('\n---');
  out.push('> 亮度[陷]等标注沿用 iztro 星曜亮度表,个别宫与文墨天机存在流派级微差(如天梁在四马地的[得]/[陷]),不影响推演。');
  return out.join('\n');
}

// ─────────── 模式二:定盘对照 ───────────
function briefPalace(p) {
  const minNames = (p.minorStars || []).map(s => s.name);
  const adjNames = (p.adjectiveStars || []).map(s => (typeof s === 'string' ? s : s.name));
  const all = [...minNames, ...adjNames];
  const fuji = [...new Set(all.filter(n => FUJI_TEXT.has(n)))];
  const sha = [...new Set(all.filter(n => SHA_TEXT.has(n)))];
  return [fuji.join('·'), sha.join('·')].filter(Boolean).join(' | ') || '—';
}

function renderDingpan(a1, a2) {
  const l1 = a1.time, l2 = a2.time;
  const out = [];
  out.push('# 紫微定盘对照 · LLM 推演输入');
  out.push(`> 两候选时辰盘对比(均经 iztro 排定、对标文墨天机)。**仅据此判别,禁止自行排盘。**\n`);
  out.push('## 基本信息');
  out.push(`- ${l1}:${a1.fiveElementsClass} · 命宫${a1.earthlyBranchOfSoulPalace} · 身宫${a1.earthlyBranchOfBodyPalace}`);
  out.push(`- ${l2}:${a2.fiveElementsClass} · 命宫${a2.earthlyBranchOfSoulPalace} · 身宫${a2.earthlyBranchOfBodyPalace}\n`);
  out.push('## 关键宫对照(差异处即定盘判据)');
  const keys = ['命宫', '父母', '子女', '官禄', '财帛', '田宅', '夫妻'];
  for (const name of keys) {
    const p1 = a1.palaces.find(x => x.name === name);
    const p2 = a2.palaces.find(x => x.name === name);
    const m1 = (p1.majorStars || []).map(fmtStar).join('·') || '空宫';
    const m2 = (p2.majorStars || []).map(fmtStar).join('·') || '空宫';
    const diff = m1 !== m2 ? ' ◀' : '';
    out.push(`**${name}${diff}**`);
    out.push(`- ${l1} ${p1.heavenlyStem}${p1.earthlyBranch}: ${m1} | ${briefPalace(p1)}`);
    out.push(`- ${l2} ${p2.heavenlyStem}${p2.earthlyBranch}: ${m2} | ${briefPalace(p2)}`);
  }
  out.push('\n## 定盘锚点提示(请命主提供事实,据上对照判吻合度)');
  out.push('- 父母:父亲健康(手术/外伤)/ 财务(积蓄/负债)、母亲健康');
  out.push('- 子女:孕育史(胎停/流产)、子女性格');
  out.push('- 兄弟·合伙:合伙经历(得力/破财)、来因宫落点');
  out.push('- 夫妻·感情:婚恋年限、感情波折');
  out.push('- 田宅:房产(顺利/曲折)、迁徙');
  out.push('- 官禄:事业形态(技术/口才/管理)、升迁');
  return out.join('\n');
}

// ─────────── 模式三:流年盘 ───────────
function renderLiunian(a, year) {
  const h = a.horoscope(new Date(`${year}-06-01`));
  const dec = h.decadal, yi = h.yearly;
  const dk = dec.heavenlyStem + dec.earthlyBranch;
  const birthYear = Number((a.solarDate || '').split('-')[0]);
  const age = year - birthYear + 1;
  const dkPalace = a.palaces.find(p => p.decadal && (p.decadal.heavenlyStem + p.decadal.earthlyBranch) === dk);
  const liuMingName = (a.palaces.find(p => p.earthlyBranch === yi.earthlyBranch) || {}).name;
  const out = [];
  out.push(`# 紫微流年 · ${year}(${yi.heavenlyStem}${yi.earthlyBranch}年) · LLM 推演输入`);
  out.push('> 经 iztro 运限盘排定。**仅据此推演,禁止自行排盘。**\n');
  out.push(`命主:${a.solarDate} ${a.time} ${gender} · ${a.fiveElementsClass} · 虚岁${age}\n`);
  out.push('## 大限基调');
  out.push(`- 当前大限 **${dk}**${dkPalace ? ` · 走${dkPalace.name}[${dkPalace.heavenlyStem}${dkPalace.earthlyBranch}] · ${(dkPalace.majorStars || []).map(fmtStar).join('·') || '空宫'}` : ''}`);
  out.push(`- 大限四化(${dec.heavenlyStem}):${fmtSihua(C.sihuaOfGan(dec.heavenlyStem))}\n`);
  out.push('## 流年盘');
  out.push(`- 太岁:${yi.heavenlyStem}${yi.earthlyBranch} · 流年命宫:${yi.earthlyBranch}宫(落本命**${liuMingName}**)`);
  out.push(`- 流年四化(${yi.heavenlyStem}):${fmtSihua(C.sihuaOfGan(yi.heavenlyStem))}\n`);
  out.push('## 十维度吉凶(流年宫象 + 大限基调×0.5)');
  for (const [k, pn] of DIMS) {
    const ly = judgeDim(a, yi, pn, { weight: WEIGHT_LIU, withLiu: true });
    const dx = judgeDim(a, dec, pn, { weight: WEIGHT_LIU, withLiu: true });
    const sc = +(ly.score + dx.score * 0.5).toFixed(1);
    const verdict = sc > 0 ? '吉' : sc < 0 ? '凶' : '平';
    out.push(`- **${k}**(${pn}): 流${ly.verdict}(${ly.score}) × 限${dx.verdict}(${dx.score}) → **${verdict}**(${sc})`);
  }
  return out.join('\n');
}

// ─────────── 主入口 ───────────
const WS = ensureWorkspace();
let output, outFile;
if (mode === 'dingpan') {
  const [t1, t2] = String(timeArg).split('-').map(Number);
  if (!t2) { console.error('dingpan 模式需传双时辰,如 10-11'); process.exit(1); }
  const a1 = astro.bySolar(dateStr, t1, gender, true, 'zh-CN');
  const a2 = astro.bySolar(dateStr, t2, gender, true, 'zh-CN');
  output = renderDingpan(a1, a2);
  outFile = outPath || path.join(WS, `紫微-LLM-dingpan-${dateStr}.md`);
} else if (mode === 'liunian') {
  const a = astro.bySolar(dateStr, Number(timeArg), gender, true, 'zh-CN');
  output = renderLiunian(a, year);
  outFile = outPath || path.join(WS, `紫微-LLM-liunian-${dateStr}-${year}.md`);
} else {
  const a = astro.bySolar(dateStr, Number(timeArg), gender, true, 'zh-CN');
  output = renderBenming(a);
  outFile = outPath || path.join(WS, `紫微-LLM-benming-${dateStr}-${timeArg}.md`);
}
fs.writeFileSync(outFile, output);
console.log(output);
console.error(`\n✅ 已写入 ${outFile}`);
