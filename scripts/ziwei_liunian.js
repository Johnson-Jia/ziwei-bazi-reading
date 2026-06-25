#!/usr/bin/env node
/**
 * 紫微流年十维度断 —— 基于 iztro horoscope 运限盘
 * 每个流年输出: 妻/财/子/禄/父/身/友/考/宅/灾 十领域吉凶(紫微流年宫位+原局星+流年星+流年四化)
 *
 * 用法: node ziwei_liunian.js <YYYY-M-D> <时辰0-12> <男|女> [起年] [止年]
 *   无参数: 演示(通用示例) 2000-08-16 戌时(10) 男 2012-2035
 */
const path = require('path');
const { astro } = require(path.join(__dirname, 'vendor/iztro/lib/index.js'));
// 星曜分类/打分逻辑统一至 _ziwei_common(流年运势:WEIGHT_LIU + 计入流年虚吉星)
const _Z = require('./_ziwei_common');
const { DIMS, WEIGHT_LIU } = _Z;
// 本地 wrapper:沿用原 stars 输出字段名(=hits),调用处零改动
const judgeDim = (a, y, pn) => {
  const r = _Z.judgeDim(a, y, pn, { weight: WEIGHT_LIU, withLiu: true, returnHits: true });
  return { verdict: r.verdict, score: r.score, stars: r.hits };
};

const argv = process.argv.slice(2);
let dateStr, timeIdx, gender, startYear, endYear;
if (argv.length >= 3) {
  [dateStr, timeIdx, gender] = argv; timeIdx = Number(timeIdx);
  startYear = argv[3] ? Number(argv[3]) : 1994; endYear = argv[4] ? Number(argv[4]) : 2075;
} else {
  dateStr = '2000-08-16'; timeIdx = 10; gender = '男'; startYear = 2012; endYear = 2035;
  console.error(`[demo] 演示(通用示例) ${dateStr} 戌时 男, 流年 ${startYear}-${endYear}`);
}

const a = astro.bySolar(dateStr, timeIdx, gender, true, 'zh-CN');
const yearly = [];
for (let y = startYear; y <= endYear; y++) {
  const h = a.horoscope(new Date(`${y}-06-01`));
  const yi = h.yearly;
  const dims = {};
  DIMS.forEach(([d, p]) => dims[d] = judgeDim(a, yi, p));
  // 大限(该流年所在)
  const dec = h.decadal;
  yearly.push({
    year: y, liuGanzhi: yi.heavenlyStem + yi.earthlyBranch, liuPalace: yi.palaceNames[y.palaceNames ? 0 : 0],
    dashi: dec ? (dec.heavenlyStem + dec.earthlyBranch) : '-',
    mutagen: y ? `${yi.mutagen[0]}禄/${yi.mutagen[1]}权/${yi.mutagen[2]}科/${yi.mutagen[3]}忌` : '',
    dims,
  });
}

const result = {
  engine: 'iztro-horoscope',
  input: { solar: dateStr, timeIndex: timeIdx, gender, range: [startYear, endYear] },
  info: {
    命局: a.palaces.find(p => p.name === '命宫').majorStars.map(s => s.name).join(),
    五行局: a.fiveElementsClass,
  },
  _dims: '妻/财/子/禄/父/身/友/考/宅/灾 (身=命宫自身,灾=疾厄,考=官禄兼学业)',
  _method: '每维度看流年宫位(原局星吉煞庙旺+流年星+流年四化入宫),吉煞计数定吉凶(简化规则,辅助参考)',
  yearly,
};
console.log(JSON.stringify(result, null, 2));
