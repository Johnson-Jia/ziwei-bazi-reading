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

// 十维度 → 紫微流年宫名(身=命宫自身,灾=疾厄,考=官禄兼学业)
const DIMS = [
  ['妻', '夫妻'], ['财', '财帛'], ['子', '子女'], ['禄', '官禄'], ['父', '父母'],
  ['身', '命宫'], ['友', '仆役'], ['考', '官禄'], ['宅', '田宅'], ['灾', '疾厄'],
];
const JI = new Set(['左辅','右弼','天魁','天钺','文昌','文曲','禄存','流禄','流喜','流魁','流钺','年解']);
const SHA = new Set(['擎羊','陀罗','火星','铃星','地空','地劫','流羊','流陀','天刑','阴煞']);

/** 断某维度(流年宫位): 原局星吉煞 + 流年星 + 流年四化入该地支 */
function judgeDim(a, y, palaceName) {
  const pIdx = y.palaceNames.indexOf(palaceName);
  if (pIdx < 0) return { verdict: '平', score: 0, stars: '宫位未定位' };
  const orig = a.palaces[pIdx];
  const liu = y.stars[pIdx] || [];
  let ji = 0, xiong = 0;
  const hits = [];
  // 原局主星: 庙旺吉/陷凶 + 生年四化
  (orig.majorStars || []).forEach(s => {
    if (['庙','旺'].includes(s.brightness)) { ji++; hits.push(s.name + s.brightness); }
    else if (s.brightness === '陷') { xiong++; hits.push(s.name + '陷'); }
    if (s.mutagen === '禄' || s.mutagen === '科') ji++;
    else if (s.mutagen === '忌') { xiong++; hits.push(s.name + '忌'); }
    else if (s.mutagen === '权') ji += 0.5;
  });
  // 原局辅星/小星 + 流年星: 吉煞计数
  [...(orig.minorStars || []), ...(orig.adjectiveStars || []), ...liu].forEach(s => {
    if (JI.has(s.name)) { ji++; hits.push(s.name); }
    if (SHA.has(s.name)) { xiong++; hits.push(s.name); }
  });
  // 流年四化入该宫地支(四化星是否落该宫原局主星)
  const mutPairs = [['禄', y.mutagen[0]], ['权', y.mutagen[1]], ['科', y.mutagen[2]], ['忌', y.mutagen[3]]];
  mutPairs.forEach(([type, star]) => {
    if (star && (orig.majorStars || []).some(s => s.name === star)) {
      hits.push('流' + type + '(' + star + ')');
      if (type === '禄' || type === '科') ji++;
      else if (type === '忌') xiong++;
      else if (type === '权') ji += 0.5;
    }
  });
  const score = ji - xiong;
  const verdict = score > 0 ? '吉' : score < 0 ? '凶' : '平';
  return { verdict, score: Number(score.toFixed(1)), stars: hits.join(',') || '空宫无显著星' };
}

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
