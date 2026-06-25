/**
 * _ziwei_common.js —— 紫微斗数共享逻辑层(纯数据表 + 纯函数)
 *
 * 供 paipan_ziwei / gen_ziwei_*_html / gen_ziwei_llm_md / ziwei_liunian 全系列复用,
 * 消除原先散落于各脚本的星曜分类、四化表、三方四正、来因宫、十维度打分的重复定义。
 *
 * 设计原则:
 *   - 本模块只含纯逻辑:不 require iztro、不读文件、不产生副作用
 *   - 所有函数接收"已排好的 astrolabe / horoscope 对象",职责单一、可独立断言
 *   - judgeDim 以"权重预设 + 选项"参数化,显式承载各调用方有意的打分差异
 *         (完整命书用 WEIGHT_FULL,流年运势用 WEIGHT_LIU —— 不可合并为一套)
 */
'use strict';

// ═══════════════════════ 星曜分类 ═══════════════════════

/** 本命吉辅(打分基础集) */
const JI_STAR = ['左辅', '右弼', '天魁', '天钺', '文昌', '文曲', '禄存'];

/** 流年虚吉星(打分可选计入;权重低、易让盘偏吉,完整命书默认不计) */
const JI_LIU_STAR = ['流禄', '流喜', '流魁', '流钺', '年解'];

/** 煞星(打分用:六煞 + 天刑 + 阴煞,含流羊流陀) */
const SHA_STAR = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '流羊', '流陀', '天刑', '阴煞'];

/**
 * 文本呈现:吉辅白名单(含天马)。LLM 文本生成器用它筛"辅星"段。
 */
const FUJI_TEXT = new Set([...JI_STAR, '天马']);

/**
 * 文本呈现:煞/空/耗/桃花白名单(剔除流煞,流煞属运限)。
 * LLM 文本生成器用它筛"煞/空/耗"段,剔除纯装饰星(台辅三台八座恩光华盖龙凤……),
 * 在零命理信息损失的前提下压减 token。
 */
const SHA_TEXT = new Set([
  ...SHA_STAR.filter(s => !s.startsWith('流')),     // 本命六煞 + 天刑 + 阴煞
  '天空', '截路', '截空', '旬空', '空亡',            // 空亡类
  '孤辰', '寡宿',                                    // 孤寡
  '天虚', '天哭', '破碎', '蜚廉', '大耗',            // 耗
  '天姚', '红鸾', '咸池',                            // 桃花
  '天伤', '天使',                                    // 限伤
]);

/** HTML 渲染:煞星高亮集(原 gen_ziwei_full_html 用,精确复刻保渲染行为等价) */
const SHA_HTML = new Set(['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑', '阴煞', '天空', '截路', '旬空', '空亡', '天虚', '天哭', '破碎', '蜚廉', '孤辰', '寡宿', '天使', '天伤', '咸池']);

// ═══════════════════════ 天干四化 ═══════════════════════

/** 天干四化表(甲-癸 各 [星, 禄/权/科/忌]) */
const GAN_SIHUA = {
  甲: [['廉贞', '禄'], ['破军', '权'], ['武曲', '科'], ['太阳', '忌']],
  乙: [['天机', '禄'], ['天梁', '权'], ['紫微', '科'], ['太阴', '忌']],
  丙: [['天同', '禄'], ['天机', '权'], ['文昌', '科'], ['廉贞', '忌']],
  丁: [['太阴', '禄'], ['天同', '权'], ['天机', '科'], ['巨门', '忌']],
  戊: [['贪狼', '禄'], ['太阴', '权'], ['右弼', '科'], ['天机', '忌']],
  己: [['武曲', '禄'], ['贪狼', '权'], ['天梁', '科'], ['文曲', '忌']],
  庚: [['太阳', '禄'], ['武曲', '权'], ['太阴', '科'], ['天同', '忌']],
  辛: [['巨门', '禄'], ['太阳', '权'], ['文曲', '科'], ['文昌', '忌']],
  壬: [['天梁', '禄'], ['紫微', '权'], ['左辅', '科'], ['武曲', '忌']],
  癸: [['破军', '禄'], ['巨门', '权'], ['太阴', '科'], ['贪狼', '忌']],
};

/** 取年干(astrolabe.chineseDate 形如 "癸酉 壬戌 甲戌 甲戌") */
const yearGanOf = a => ((a && a.chineseDate || '').split(' ')[0] || '')[0] || '';

/** 干 → 四化四组 [星, 禄/权/科/忌] */
const sihuaOfGan = gan => GAN_SIHUA[gan] || [];

/** 生年四化(按年干) */
const nianSihua = a => sihuaOfGan(yearGanOf(a));

// ═══════════════════════ 地支 / 三方四正 ═══════════════════════

const ZHI_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 三合两支(如 申子辰) */
const sanheGroup = z => { const i = ZHI_LIST.indexOf(z); return [ZHI_LIST[(i + 4) % 12], ZHI_LIST[(i + 8) % 12]]; };

/** 对宫 */
const duigong = z => ZHI_LIST[(ZHI_LIST.indexOf(z) + 6) % 12];

/** 三方四正(本宫 + 对宫 + 两三合) */
const sanfangSizheng = z => [z, duigong(z), ...sanheGroup(z)];

/** 公历年 → 地支 */
const zhiOfYear = year => ZHI_LIST[((year - 4) % 12 + 12) % 12];

// ═══════════════════════ 来因宫(钦天门,按年干定位) ═══════════════════════

/** 来因宫:年干所落之宫(astrolabe.palaces 中 heavenlyStem===年干 者) */
const laiyinPalace = a => (a.palaces || []).find(p => p.heavenlyStem === yearGanOf(a)) || null;

// ═══════════════════════ 十维度 → 流年宫名 ═══════════════════════

const DIMS = [
  ['妻', '夫妻'], ['财', '财帛'], ['子', '子女'], ['禄', '官禄'], ['父', '父母'],
  ['身', '命宫'], ['友', '仆役'], ['考', '官禄'], ['宅', '田宅'], ['灾', '疾厄'],
];

// ═══════════════════════ 流年宫位打分 ═══════════════════════

/**
 * 打分权重预设。两套均为现有脚本有意之分,抽取后以参数显式承载、不可合并:
 *   WEIGHT_FULL —— 完整命书(gen_ziwei_full_html):四化权重高、区分度细,不计流年虚吉星
 *   WEIGHT_LIU  —— 流年运势(ziwei_liunian / gen_ziwei_liunian_html):整数计数,计流年虚吉星
 */
const WEIGHT_FULL = { mw: 0.5, xiang: 0.5, lu: 0.5, ji: 0.5, quan: 0.3, auxJi: 0.5, auxSha: 0.8, flyLu: 2, flyKe: 2, flyJi: 2, flyQuan: 1 };
const WEIGHT_LIU = { mw: 1, xiang: 1, lu: 1, ji: 1, quan: 0.5, auxJi: 1, auxSha: 1, flyLu: 1, flyKe: 1, flyJi: 1, flyQuan: 0.5 };

/**
 * 断某维度(运限宫位):原局主星庙旺/陷 + 自带生年四化 + 辅星吉煞 + 运限四化入宫 → 吉凶计数。
 * @param {object} a   本命 astrolabe
 * @param {object} y   运限对象(horoscope.yearly / .decadal),需含 palaceNames / stars / mutagen
 * @param {string} palaceName 宫名
 * @param {object} [opts] { withLiu=false, weight=WEIGHT_LIU, returnHits=false }
 * @returns {{verdict:'吉'|'凶'|'平', score:number, hits?:string}}
 */
function judgeDim(a, y, palaceName, opts = {}) {
  const { withLiu = false, weight = WEIGHT_LIU, returnHits = false } = opts;
  const pIdx = y.palaceNames.indexOf(palaceName);
  if (pIdx < 0) return { verdict: '平', score: 0, ...(returnHits ? { hits: '' } : {}) };
  const o = a.palaces.find(p => p.name === palaceName) || a.palaces[pIdx];
  const liu = y.stars[pIdx] || [];
  const jiSet = withLiu ? new Set([...JI_STAR, ...JI_LIU_STAR]) : new Set(JI_STAR);
  const shaSet = new Set(SHA_STAR);
  let ji = 0, x = 0;
  const hits = [];
  const push = h => { if (returnHits) hits.push(h); };
  // ① 原局主星:庙旺/陷 + 自带生年四化
  (o.majorStars || []).forEach(s => {
    if (s.brightness === '庙' || s.brightness === '旺') { ji += weight.mw; push(s.name + s.brightness); }
    else if (s.brightness === '陷') { x += weight.xiang; push(s.name + '陷'); }
    if (s.mutagen === '禄' || s.mutagen === '科') { ji += weight.lu; }
    else if (s.mutagen === '忌') { x += weight.ji; push(s.name + '忌'); }
    else if (s.mutagen === '权') { ji += weight.quan; }
  });
  // ② 原局辅星/小星 + 运限星:吉煞计数
  [...(o.minorStars || []), ...(o.adjectiveStars || []), ...liu].forEach(s => {
    if (jiSet.has(s.name)) { ji += weight.auxJi; push(s.name); }
    if (shaSet.has(s.name)) { x += weight.auxSha; push(s.name); }
  });
  // ③ 运限四化入该宫(四化星落该宫原局主星)
  [['禄', y.mutagen[0]], ['权', y.mutagen[1]], ['科', y.mutagen[2]], ['忌', y.mutagen[3]]].forEach(([t, st]) => {
    if (st && (o.majorStars || []).some(s => s.name === st)) {
      push('流' + t + '(' + st + ')');
      if (t === '禄') ji += weight.flyLu;
      else if (t === '科') ji += weight.flyKe;
      else if (t === '忌') x += weight.flyJi;
      else ji += weight.flyQuan;
    }
  });
  const sc = ji - x;
  return { verdict: sc > 0 ? '吉' : sc < 0 ? '凶' : '平', score: +sc.toFixed(1), ...(returnHits ? { hits: hits.join(',') || '空宫无显著星' } : {}) };
}

// ═══════════════════════ 星曜格式化(文本/HTML 通用) ═══════════════════════

/** 单星 → "天同[旺](化科)" */
const fmtStar = s => s.name + (s.brightness ? `[${s.brightness}]` : '') + (s.mutagen ? `(化${s.mutagen})` : '');

/** 四化列表 [[星,禄],…] → "破军化禄·巨门化权·太阴化科·贪狼化忌" */
const fmtSihua = sihua => sihua.map(([star, t]) => `${star}化${t}`).join('·');

module.exports = {
  JI_STAR, JI_LIU_STAR, SHA_STAR, FUJI_TEXT, SHA_TEXT, SHA_HTML,
  GAN_SIHUA, yearGanOf, sihuaOfGan, nianSihua,
  ZHI_LIST, sanheGroup, duigong, sanfangSizheng, zhiOfYear,
  laiyinPalace, DIMS,
  WEIGHT_FULL, WEIGHT_LIU, judgeDim,
  fmtStar, fmtSihua,
};
