#!/usr/bin/env node
/**
 * 八字流年逐年断（命令行 JSON 输出）—— 核心逻辑见 bazi_core.js
 *
 * 用法:
 *   node bazi_liunian.js <Y> <M> <D> <H> <MIN> <男|女> [起年] [止年]
 *   无参数: 演示(通用示例) 2000-08-16 14:30 男，流年 2012-2035
 *
 * 生成 HTML 报告请用 gen_liunian_html.js（共用 bazi_core.js）
 */
const { analyze } = require('./bazi_core');

const argv = process.argv.slice(2);
let Y, Mo, D, H, MIN, gender, startYear, endYear;
if (argv.length >= 6) {
  [Y, Mo, D, H, MIN] = argv.slice(0, 5).map(Number);
  gender = argv[5];
  startYear = argv[6] ? Number(argv[6]) : 1994;
  endYear = argv[7] ? Number(argv[7]) : 2075;
} else {
  Y=2000; Mo=8; D=16; H=14; MIN=30; gender='男'; startYear=2012; endYear=2035;
  console.error(`[demo] 未提供参数，使用演示(通用示例) 2000-08-16 14:30 男，流年 ${startYear}-${endYear}。用法见文件头。`);
}

const r = analyze(Y, Mo, D, H, MIN, gender, startYear, endYear);
r.engine = 'tyme4ts+liunian';
r.input = { solar: `${Y}-${Mo}-${D} ${H}:${MIN}`, gender, range: [startYear, endYear] };
r._model_note = '旺衰用简化三得模型；从格/调候/特殊格局须人工复核。verdict: 喜用年倾向吉、忌神年倾向凶(概率性)。';
console.log(JSON.stringify(r, null, 2));
