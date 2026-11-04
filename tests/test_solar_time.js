/**
 * 真太阳时 + 夏令时模块测试（TDD 先行）
 *
 * 移植自 ziwei-doushu (MIT) lib/ziwei/{true-solar-time,dst-cn,clock-adjust}.ts
 * 用例来源：NOAA 均时差已知值、ziwei-doushu README 口径、本项目命主真实案例
 * 运行: node tests/test_solar_time.js
 */
const assert = require('node:assert/strict');
const {
  equationOfTimeMinutes, calculateTrueSolarTime, branchFromSolarMinutes,
  isChinaDST, isChinaDSTYear, chinaDSTRange,
  resolveBirthTime, toIztroTimeIndex, isValidGregorianDate, shiftGregorianDate,
  resolveZiweiDayOffset, CITY_LON,
} = require('../scripts/solar_time.js');

let passed = 0, failed = 0;
function t(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.error('  ✗ ' + name + '\n    ' + e.message); }
}

console.log('== 1. 均时差 NOAA 近似值(已知天文值,容差±1.5分钟) ==');
t('2月中旬 EoT≈-14分钟(全年最低)', () => {
  const v = equationOfTimeMinutes(2026, 2, 12);
  assert.ok(Math.abs(v - (-14.2)) < 1.5, `EoT=${v.toFixed(2)} 应≈-14.2`);
});
t('11月初 EoT≈+16分钟(全年最高)', () => {
  const v = equationOfTimeMinutes(2026, 11, 3);
  assert.ok(Math.abs(v - 16.4) < 1.5, `EoT=${v.toFixed(2)} 应≈+16.4`);
});
t('10月下旬 EoT≈+15~17分钟', () => {
  const v = equationOfTimeMinutes(1991, 10, 28);
  assert.ok(v > 14 && v < 18, `EoT=${v.toFixed(2)}`);
});

console.log('== 2. 真太阳时计算(真实案例) ==');
t('韩笑笑: 郑州(113.65°) 1991-10-28 18:30 → 真太阳时≈18:21 仍酉时', () => {
  const r = calculateTrueSolarTime({ year: 1991, month: 10, day: 28, clockHour: 18, clockMinute: 30, longitude: 113.65 });
  assert.equal(r.corrected, true);
  assert.ok(Math.abs(r.longitudeCorrectionMinutes - (-25.4)) < 0.5, `lonCorr=${r.longitudeCorrectionMinutes}`);
  assert.equal(r.branch, 9, '应仍为酉(序号9)');
  assert.equal(r.hour, 18); assert.equal(r.dayOffset, 0);
});
t('命主: 西安经度(108.94°) 1993-10-20 21:30 → 真太阳时≈21:01 仍亥时(贴边)', () => {
  const r = calculateTrueSolarTime({ year: 1993, month: 10, day: 20, clockHour: 21, clockMinute: 30, longitude: 108.94 });
  assert.equal(r.branch, 11, '应仍为亥(序号11)');
  assert.equal(r.hour, 21);
});
t('命主: 更西经度105° 21:30 → 真太阳时≈20:45 变戌时(时辰改变案例)', () => {
  const r = calculateTrueSolarTime({ year: 1993, month: 10, day: 20, clockHour: 21, clockMinute: 30, longitude: 105 });
  assert.equal(r.branch, 10, '应变为戌(序号10)');
});
t('东经100° 23:30 → 真太阳时≈22:26 亥时不换日(ziwei-doushu README口径)', () => {
  const r = calculateTrueSolarTime({ year: 2026, month: 10, day: 31, clockHour: 23, clockMinute: 30, longitude: 100 });
  assert.equal(r.branch, 11);
  assert.equal(r.dayOffset, 0, '不跨日');
});
t('东经80° 00:10 → 校正为前一日约21:46(dayOffset=-1)', () => {
  const r = calculateTrueSolarTime({ year: 1990, month: 7, day: 15, clockHour: 0, clockMinute: 10, longitude: 80 });
  assert.equal(r.dayOffset, -1);
  assert.equal(r.branch, 11, '前一日亥时');
});
t('不传经度 → 不校正,时辰按钟表', () => {
  const r = calculateTrueSolarTime({ year: 1993, month: 10, day: 20, clockHour: 21, clockMinute: 30 });
  assert.equal(r.corrected, false);
  assert.equal(r.branch, 11);
  assert.equal(r.totalCorrectionMinutes, 0);
});
t('非法日期(2月30日) → dateValid=false', () => {
  const r = calculateTrueSolarTime({ year: 1993, month: 2, day: 30, clockHour: 12, clockMinute: 0, longitude: 116 });
  assert.equal(r.dateValid, false);
});

console.log('== 3. 时辰序号与iztro对齐 ==');
t('00:30 → iztro idx 0(早子) / 23:30 → idx 12(晚子) / 21:30 → idx 11(亥)', () => {
  assert.equal(toIztroTimeIndex(30), 0);
  assert.equal(toIztroTimeIndex(1410), 12);
  assert.equal(toIztroTimeIndex(1290), 11);
});
t('branchFromSolarMinutes: 23:00-01:00=子(0), 01:00-03:00=丑(1)', () => {
  assert.equal(branchFromSolarMinutes(0), 0);
  assert.equal(branchFromSolarMinutes(60), 1);
  assert.equal(branchFromSolarMinutes(1380), 0);
});

console.log('== 4. 中国夏令时(通行口径XLS表) ==');
t('1986-05-04起/1986-05-03未起', () => {
  assert.equal(isChinaDST(1986, 5, 4), true);
  assert.equal(isChinaDST(1986, 5, 3), false);
});
t('1988年真分歧口径: 4-10起(非IANA的4-17)', () => {
  assert.equal(isChinaDST(1988, 4, 10), true);
  assert.equal(isChinaDST(1988, 4, 9), false);
});
t('1991止于9-15(含) / 1992无夏令时', () => {
  assert.equal(isChinaDST(1991, 9, 15), true);
  assert.equal(isChinaDST(1991, 9, 16), false);
  assert.equal(isChinaDST(1992, 6, 1), false);
});
t('民国时期夏令时亦在表内(1935-06-01)', () => {
  assert.equal(isChinaDST(1935, 6, 1), true);
});
t('2026年非DST年', () => assert.equal(isChinaDST(2026, 7, 1), false));
t('chinaDSTRange(1987)=4月12日~9月13日', () => {
  assert.deepEqual(chinaDSTRange(1987), { start: '4 月 12 日', end: '9 月 13 日' });
});
t('isChinaDSTYear(1988)=true / (2026)=false', () => {
  assert.equal(isChinaDSTYear(1988), true);
  assert.equal(isChinaDSTYear(2026), false);
});

console.log('== 5. resolveBirthTime 高层封装 ==');
t('城市名查表: 郑州→113.65±0.01', () => {
  assert.ok(Math.abs(CITY_LON['郑州'] - 113.65) < 0.01);
});
t('cityName用法: 韩笑笑案例 → 酉时不变,summary含校正信息', () => {
  const r = resolveBirthTime({ year: 1991, month: 10, day: 28, hour: 18, minute: 30, cityName: '郑州' });
  assert.equal(r.branchName, '酉');
  assert.equal(r.timeChanged, false);
  assert.equal(r.dst.isDST, false); // 10月已出DST
  assert.ok(r.summary.includes('真太阳时'));
});
t('DST期间出生: 1988-07-01 → isDST=true且有提示', () => {
  const r = resolveBirthTime({ year: 1988, month: 7, day: 1, hour: 10, minute: 0 });
  assert.equal(r.dst.isDST, true);
  assert.ok(r.dst.note.includes('夏令时'));
});
t('时辰改变案例: 105°经度21:30 → timeChanged=true/戌', () => {
  const r = resolveBirthTime({ year: 1993, month: 10, day: 20, hour: 21, minute: 30, longitude: 105 });
  assert.equal(r.timeChanged, true);
  assert.equal(r.branchName, '戌');
});

console.log('== 6. 日期工具 ==');
t('shiftGregorianDate 跨月/跨年', () => {
  assert.deepEqual(shiftGregorianDate({ year: 2026, month: 1, day: 1 }, -1), { year: 2025, month: 12, day: 31 });
  assert.deepEqual(shiftGregorianDate({ year: 2026, month: 10, day: 31 }, 1), { year: 2026, month: 11, day: 1 });
});
t('晚子换日规则: dayOffset=-1且晚子 → next-day规则返回0', () => {
  const off = resolveZiweiDayOffset({ dayOffset: -1, normalizedMinutes: 1410, branch: 0 }, 'next-day');
  assert.equal(off, 0);
});

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
