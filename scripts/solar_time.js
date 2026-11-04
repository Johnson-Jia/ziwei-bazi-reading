/**
 * 真太阳时校正 + 中国夏令时判定（排盘引擎共享模块）
 *
 * 移植自开源项目 ziwei-doushu (MIT, https://github.com/Renhuai123/ziwei-doushu)
 *   lib/ziwei/true-solar-time.ts (NOAA 均时差近似式 + 经度修正)
 *   lib/ziwei/dst-cn.ts          (通行口径 XLS_CN 夏令时表, 逐字对齐主流排盘软件)
 *   lib/ziwei/clock-adjust.ts    (钟表读数→标准时间的平移纪律: 只提示不自动减)
 * 移植时适配本项目: CommonJS / 中文时辰名 / iztro timeIdx(0早子...11亥...12晚子) 对齐。
 *
 * 口径(与源一致):
 *   地方真太阳时 = 钟表时间 + 经度修正 + 均时差
 *   经度修正 = (出生地经度 − 时区中央经线) × 4 分钟 (国内东八区中央经线 120°)
 *   均时差 = NOAA fractional-year 近似式(1900-2026 足以稳定判时辰边界)
 * 夏令时纪律: 只判定+提示, **不自动减 1 小时**(无法得知用户报的是夏令时读数还是已换算的标准时,
 *   主流排盘软件同样只提示——见 dst-cn.ts 源注)。
 *
 * 用法:
 *   const { resolveBirthTime } = require('./solar_time');
 *   resolveBirthTime({year:1991,month:10,day:28,hour:18,minute:30,cityName:'郑州'})
 *   // → { dst, solar, branch:9, branchName:'酉', iztroTimeIndex:9, timeChanged:false, summary:'...' }
 */

'use strict';

const MINUTES_PER_DAY = 1440;
const SECONDS_PER_DAY = 86400;
const mod = (v, b) => ((v % b) + b) % b;

const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ============ 一、公历日期工具 ============

function isValidGregorianDate(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function shiftGregorianDate(date, dayOffset) {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + dayOffset));
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function dayOfYear(year, month, day) {
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000);
}

// ============ 二、均时差(NOAA 近似式) ============

/** NOAA 均时差近似值,返回分钟;正值=真太阳时快于平太阳时。 */
function equationOfTimeMinutes(year, month, day, clockHour = 12, clockMinute = 0) {
  if (!isValidGregorianDate(year, month, day)) return 0;
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const fractionalHour = clockHour + clockMinute / 60;
  const gamma = (2 * Math.PI / daysInYear)
    * (dayOfYear(year, month, day) - 1 + (fractionalHour - 12) / 24);
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  );
}

// ============ 三、时辰序号 ============

/** 归一化分钟 → 12 档时辰序号(0=子 23:00–01:00 … 11=亥 21:00–23:00) */
function branchFromSolarMinutes(normalizedMinutes) {
  if (normalizedMinutes >= 1380 || normalizedMinutes < 60) return 0;
  return Math.floor((normalizedMinutes - 60) / 120) + 1;
}

/** 归一化分钟 → iztro timeIdx(0=早子 00:00–01:00, 12=晚子 23:00–24:00, 其余同 branch) */
function toIztroTimeIndex(normalizedMinutes) {
  if (normalizedMinutes >= 1380) return 12; // 晚子
  if (normalizedMinutes < 60) return 0;     // 早子
  return branchFromSolarMinutes(normalizedMinutes);
}

// ============ 四、真太阳时计算 ============

/**
 * @param {object} input {year,month,day, clockHour,clockMinute, longitude?, utcOffsetMinutes?}
 *   longitude 未提供时不做校正; utcOffsetMinutes 不传=北京时间(480→中央经线120°)
 */
function calculateTrueSolarTime(input) {
  const dateValid = isValidGregorianDate(input.year, input.month, input.day);
  const corrected = input.longitude !== undefined && Number.isFinite(input.longitude);
  const meridian = input.utcOffsetMinutes !== undefined && Number.isFinite(input.utcOffsetMinutes)
    ? input.utcOffsetMinutes / 4 : 120;
  const longitudeCorrectionMinutes = corrected ? (input.longitude - meridian) * 4 : 0;
  const eot = corrected && dateValid
    ? equationOfTimeMinutes(input.year, input.month, input.day, input.clockHour, input.clockMinute)
    : 0;
  const totalCorrectionMinutes = longitudeCorrectionMinutes + eot;
  const rawMinutes = input.clockHour * 60 + input.clockMinute + totalCorrectionMinutes;

  // 输入精度为分钟;显示与时辰边界统一按最近一秒,避免浮点毛刺(与源一致)
  const roundedTotalSeconds = Math.round(rawMinutes * 60);
  const dayOffset = Math.floor(roundedTotalSeconds / SECONDS_PER_DAY);
  const secondOfDay = mod(roundedTotalSeconds, SECONDS_PER_DAY);
  const hour = Math.floor(secondOfDay / 3600);
  const minute = Math.floor((secondOfDay % 3600) / 60);
  const second = secondOfDay % 60;
  const normalizedMinutes = secondOfDay / 60;

  return {
    dateValid, corrected,
    longitudeCorrectionMinutes, equationOfTimeMinutes: eot, totalCorrectionMinutes,
    rawMinutes, normalizedMinutes, dayOffset,
    hour, minute, second,
    branch: branchFromSolarMinutes(normalizedMinutes),
  };
}

/** 真太阳日 + 晚子时流派规则 → 最终排盘日相对输入日的偏移(lateZishi 默认 next-day) */
function resolveZiweiDayOffset(solar, lateZishi = 'next-day') {
  const nextDayRule = lateZishi === 'next-day';
  const isLateZishi = solar.branch === 0 && solar.normalizedMinutes >= 1380;
  if (solar.dayOffset < 0 && isLateZishi) return nextDayRule ? solar.dayOffset + 1 : solar.dayOffset;
  if (solar.dayOffset !== 0) return solar.dayOffset;
  if (isLateZishi) return nextDayRule ? 1 : 0;
  return 0;
}

// ============ 五、中国夏令时(通行口径 XLS 表,逐字对齐主流排盘软件) ============
// [年, 起月, 起日, 止月, 止日], 起止日均含。1988 起始日主流口径 4/10(非 IANA 4/17)。
const XLS_CN = [
  [1935, 5, 1, 9, 30], [1936, 5, 1, 9, 30], [1937, 5, 1, 9, 30], [1938, 5, 1, 9, 30],
  [1939, 5, 1, 9, 30], [1940, 5, 1, 9, 30], [1941, 5, 1, 9, 30], [1942, 5, 1, 9, 30],
  [1943, 5, 1, 9, 30], [1944, 5, 1, 9, 30], [1945, 5, 1, 9, 30], [1946, 5, 1, 9, 30],
  [1947, 5, 1, 9, 30], [1948, 5, 1, 9, 30], [1949, 5, 1, 9, 30], [1950, 5, 1, 9, 30],
  [1951, 5, 1, 9, 30], [1952, 3, 1, 10, 31], [1953, 4, 1, 10, 31], [1954, 4, 1, 10, 31],
  [1955, 5, 1, 9, 30], [1956, 5, 1, 9, 30], [1957, 4, 1, 10, 31], [1958, 4, 1, 10, 31],
  [1959, 4, 1, 10, 31], [1960, 6, 1, 9, 30], [1961, 6, 1, 9, 30], [1974, 4, 1, 10, 31],
  [1975, 4, 1, 10, 31], [1979, 7, 1, 9, 30], [1986, 5, 4, 9, 14], [1987, 4, 12, 9, 13],
  [1988, 4, 10, 9, 11], [1989, 4, 16, 9, 17], [1990, 4, 15, 9, 16], [1991, 4, 14, 9, 15],
];

/** 纯按日期判定(不看小时);else-if 语义与通行口径一致,勿"顺手优化"。 */
function isChinaDST(year, month, day) {
  for (const [y, m1, d1, m2, d2] of XLS_CN) {
    if (year !== y) continue;
    if (month > m1 && month < m2) return true;
    if (month === m1) {
      if (day >= d1) return true;
    } else if (month === m2) {
      if (day <= d2) return true;
    }
  }
  return false;
}

const isChinaDSTYear = (year) => XLS_CN.some(([y]) => y === year);

function chinaDSTRange(year) {
  const hit = XLS_CN.find(([y]) => y === year);
  if (!hit) return null;
  const [, m1, d1, m2, d2] = hit;
  return { start: `${m1} 月 ${d1} 日`, end: `${m2} 月 ${d2} 日` };
}

// ============ 六、常用城市经度简表(东经,完整表可后续扩充自 ziwei-doushu cities.ts) ============
const CITY_LON = {
  '北京': 116.41, '上海': 121.47, '天津': 117.20, '重庆': 106.55,
  '广州': 113.26, '深圳': 114.06, '杭州': 120.16, '南京': 118.78,
  '武汉': 114.31, '长沙': 112.94, '郑州': 113.65, '西安': 108.94,
  '成都': 104.07, '贵阳': 106.63, '昆明': 102.71, '兰州': 103.83,
  '西宁': 101.78, '银川': 106.23, '太原': 112.55, '石家庄': 114.51,
  '济南': 117.00, '合肥': 117.28, '福州': 119.30, '南昌': 115.89,
  '南宁': 108.37, '海口': 110.20, '呼和浩特': 111.75, '哈尔滨': 126.53,
  '长春': 125.32, '沈阳': 123.43, '大连': 121.62, '青岛': 120.38,
  '苏州': 120.58, '宁波': 121.55, '厦门': 118.09, '东莞': 113.75,
  '洛阳': 112.45, '开封': 114.31, '南阳': 112.53, '商丘': 115.65,
  '周口': 114.70, '驻马店': 114.02, '信阳': 114.09, '新乡': 113.93,
  '安阳': 114.35, '许昌': 113.85, '平顶山': 113.19, '乌鲁木齐': 87.62,
  '拉萨': 91.11,
};

// ============ 七、高层封装(排盘脚本直接用) ============

const fmtSigned = (v) => `${Math.round(v) > 0 ? '+' : ''}${Math.round(v)}`;
const pad2 = (n) => String(n).padStart(2, '0');

/**
 * 出生时刻综合解析: 城市名/经度 → 夏令时提示 → 真太阳时 → 时辰(含 iztro 索引)
 * @param {object} p {year,month,day,hour,minute, longitude?, cityName?, utcOffsetMinutes?}
 */
function resolveBirthTime(p) {
  let lon = p.longitude;
  let city = null;
  if (p.cityName && CITY_LON[p.cityName] !== undefined) { lon = CITY_LON[p.cityName]; city = p.cityName; }

  // 1. 夏令时: 只判定+提示,不自动减(口径纪律)
  const isDST = isChinaDST(p.year, p.month, p.day);
  const range = isDST ? chinaDSTRange(p.year) : null;
  const dst = {
    isDST, range,
    note: isDST
      ? `出生日期(${p.year}-${pad2(p.month)}-${pad2(p.day)})处于中国夏令时期间(${range.start}~${range.end})。若所填为当年夏令时钟表读数,请先减 1 小时再排盘(本程序只提示、不自动减)。`
      : null,
  };

  // 2. 真太阳时
  const solar = calculateTrueSolarTime({
    year: p.year, month: p.month, day: p.day,
    clockHour: p.hour, clockMinute: p.minute,
    longitude: lon, utcOffsetMinutes: p.utcOffsetMinutes,
  });

  // 3. 时辰对比(钟表 vs 校正后)
  const clockBranch = branchFromSolarMinutes(mod(p.hour * 60 + p.minute, MINUTES_PER_DAY));
  const timeChanged = solar.corrected && solar.branch !== clockBranch;

  let summary;
  if (solar.corrected) {
    const loc = city ? `${city}(东经${lon.toFixed(2)}°)` : `东经${lon.toFixed(2)}°`;
    summary = `真太阳时校正[${loc}]: 经度修正${fmtSigned(solar.longitudeCorrectionMinutes)}分 + 均时差${fmtSigned(solar.equationOfTimeMinutes)}分 → 真太阳时 ${pad2(solar.hour)}:${pad2(solar.minute)}(${BRANCH_NAMES[solar.branch]}时)`
      + (timeChanged ? `【时辰改变:钟表${BRANCH_NAMES[clockBranch]}时→${BRANCH_NAMES[solar.branch]}时】` : `(与钟表时辰一致)`)
      + (solar.dayOffset !== 0 ? `【跨日:dayOffset=${solar.dayOffset}】` : '');
  } else {
    summary = `未提供出生地/经度,按钟表时辰${BRANCH_NAMES[solar.branch]}排盘(未做真太阳时校正)。`;
  }

  return {
    dst, solar: {
      corrected: solar.corrected,
      longitudeCorrectionMinutes: solar.longitudeCorrectionMinutes,
      equationOfTimeMinutes: solar.equationOfTimeMinutes,
      totalCorrectionMinutes: solar.totalCorrectionMinutes,
      hour: solar.hour, minute: solar.minute, dayOffset: solar.dayOffset,
    },
    branch: solar.branch,
    branchName: BRANCH_NAMES[solar.branch],
    clockBranchName: BRANCH_NAMES[clockBranch],
    iztroTimeIndex: toIztroTimeIndex(solar.normalizedMinutes),
    timeChanged,
    city, longitude: lon,
    summary,
  };
}

module.exports = {
  // 真太阳时
  isValidGregorianDate, shiftGregorianDate, equationOfTimeMinutes,
  branchFromSolarMinutes, toIztroTimeIndex, calculateTrueSolarTime, resolveZiweiDayOffset,
  // 夏令时
  isChinaDST, isChinaDSTYear, chinaDSTRange,
  // 高层
  resolveBirthTime, CITY_LON, BRANCH_NAMES,
};
