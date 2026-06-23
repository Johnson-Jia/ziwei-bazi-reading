#!/usr/bin/env node
/**
 * 紫微斗数排盘脚本 —— 基于 iztro (https://github.com/SylarLong/iztro)
 *
 * 用法:
 *   node paipan_ziwei.js <公历日期 YYYY-M-D> <时辰0-12> <男|女> [闰月true|false] [语言]
 *   无参数时: 演示命主 1993-10-20 戌时(10) 男
 *
 * 时辰序号 (CHINESE_TIME):
 *   0早子(00-01) 1丑(01-03) 2寅(03-05) 3卯(05-07) 4辰(07-09) 5巳(09-11)
 *   6午(11-13) 7未(13-15) 8申(15-17) 9酉(17-19) 10戌(19-21) 11亥(21-23) 12晚子(23-24)
 *
 * 依赖: iztro v2.5.8 已 vendor 内置于 ./vendor/iztro（含 lib + 运行时依赖，离线可用，~5MB）
 *   默认用内置 vendor 版本；如需指向其他 iztro，设环境变量 IZTRO_LIB
 *   重新 vendor / 升级方法见 ./vendor/README.md
 *
 * 输出: 结构化 JSON（基本信息 + 十二宫详盘），供 methods/ 推演、templates/ 渲染
 *
 * 已验证: 1993-10-20 戌时男 排盘与文墨天机 100% 一致
 *   （四柱癸酉壬戌甲戌甲戌、金四局、命主贪狼身主天同、命宫@子天同太阴、生年四化破军禄/巨门权/太阴科/贪狼忌）
 */

// ===== 配置: iztro 库路径(默认内置 vendor;可用环境变量覆盖) =====
const path = require('path');
const IZTRO_LIB = process.env.IZTRO_LIB || path.join(__dirname, 'vendor/iztro/lib/index.js');

const { astro } = require(IZTRO_LIB);

// ===== 解析命令行 =====
const argv = process.argv.slice(2);
let dateStr, timeIdx, gender, isLeap, lang;
if (argv.length >= 3) {
  [dateStr, timeIdx, gender, isLeap = 'true', lang = 'zh-CN'] = argv;
  timeIdx = Number(timeIdx);
  isLeap = String(isLeap) === 'true';
} else {
  // 默认演示: 命主 1993-10-20 戌时
  dateStr = '1993-10-20'; timeIdx = 10; gender = '男'; isLeap = true; lang = 'zh-CN';
  console.error('[demo] 未提供参数，使用演示命主 1993-10-20 戌时 男。参数用法见文件头注释。');
}

// ===== 排盘 =====
const a = astro.bySolar(dateStr, timeIdx, gender, isLeap, lang);

// 星曜提取（去掉函数字段，保留核心属性）
function pickStar(s) {
  const o = { name: s.name, type: s.type, scope: s.scope };
  if (s.brightness) o.brightness = s.brightness;     // 亮度: 庙/旺/得/利/平/陷
  if (s.mutagen) o.mutagen = s.mutagen;               // 四化: 禄/权/科/忌
  return o;
}

const palaces = a.palaces.map(p => ({
  index: p.index,
  name: p.name,
  heavenlyStem: p.heavenlyStem,                       // 宫干
  earthlyBranch: p.earthlyBranch,                     // 宫支
  isSoulPalace: p.name === '命宫',                    // 命宫
  isBodyPalace: !!p.isBodyPalace,                     // 身宫
  isOriginalPalace: !!p.isOriginalPalace,
  majorStars: (p.majorStars || []).map(pickStar),     // 主星(十四正曜)
  minorStars: (p.minorStars || []).map(pickStar),     // 辅星(左辅右弼文昌文曲禄存等)
  adjectiveStars: (p.adjectiveStars || []).map(s => ({ name: s.name, type: s.type })), // 小星(天喜/封诰/截路等)
  changsheng12: p.changsheng12,                       // 十二长生
  boshi12: p.boshi12,                                 // 博士十二神
  decadal: p.decadal                                  // 大限 {range:[起,止], heavenlyStem, earthlyBranch}
    ? { range: p.decadal.range, heavenlyStem: p.decadal.heavenlyStem, earthlyBranch: p.decadal.earthlyBranch }
    : null,
  ages: p.ages,                                       // 小限岁数
}));

const result = {
  engine: 'iztro',
  input: { solarDate: dateStr, timeIndex: timeIdx, gender, isLeapMonth: isLeap, lang },
  info: {
    solarDate: a.solarDate,
    lunarDate: a.lunarDate,
    chineseDate: a.chineseDate,                       // 四柱(年月日时)
    time: a.time,
    timeRange: a.timeRange,
    sign: a.sign,                                     // 星座
    zodiac: a.zodiac,                                 // 生肖
    fiveElementsClass: a.fiveElementsClass,           // 五行局
    soul: a.soul,                                     // 命主
    body: a.body,                                     // 身主
    soulPalace: a.earthlyBranchOfSoulPalace,          // 命宫地支
    bodyPalace: a.earthlyBranchOfBodyPalace,          // 身宫地支
  },
  palaces,
  _note: '来因宫为钦天门技法，iztro 默认不输出，推演时按年干手动定位（见 methods/ziwei-method.md）。宫干飞化/自化可用 iztro 链式 API (palace.fliesTo/selfMutaged/hasMutagen) 进一步查询，本脚本仅输出静态盘+生年四化。',
};

console.log(JSON.stringify(result, null, 2));
