#!/usr/bin/env node
/**
 * 八字命理排盘脚本 —— 三层架构（参照 paipan_ziwei.js）
 *
 *   主力  tyme4ts v1.5.2 (6tail官方,lunar升级版) — 四柱/十神/藏干/地势/胎元命宫身宫/起运/大运
 *   自研1 bazi_relations.js (← china-testing/bazi/ganzhi.py) — 三合/三会/半三合/六合/六冲/三刑/六害/相破/天干合冲
 *   自研2 shensha.js        (← china-testing/bazi/datas.py)  — 15命局神煞(孤辰寡宿/天月德/将星华盖驿马/天乙文昌羊刃红艳…)
 *
 * 用法:
 *   node bazi.js <YYYY> <M> <D> <H> <MIN> <男|女>
 *   无参数: 演示(通用示例) 2000-08-16 14:30 男
 *   (tyme4ts 用精确时分自动定子时早晚，无需手填时辰序号)
 *
 * 依赖: 三层均已 vendor 内置于 ./vendor/{tyme4ts,bazi}（离线可用）
 *   - vendor/tyme4ts/dist/lib/index.cjs  (unbuild单文件bundle,无外部依赖)
 *   - vendor/bazi/bazi_relations.js, shensha.js  (纯数据+函数,无依赖)
 *   换环境可设 TYME4TS_LIB 指向其他 tyme4ts/dist/lib/index.cjs
 *
 * 已验证: 2000-08-16 14:30 男 → 四柱 癸酉壬戌甲戌甲戌（=文墨天机/问真八字）
 *         起运4年22天(=虚岁5),大运 辛酉5-14/庚申15-24/己未25-34/戊午35-44…
 *         酉戌六害×3、华盖入月支戌 —— 与命理判断一致
 */

const path = require('path');
const TYME = process.env.TYME4TS_LIB || path.join(__dirname, 'vendor/tyme4ts/dist/lib/index.cjs');
const { SolarTime, ChildLimit, Gender } = require(TYME);
const { analyzeZhiRelations, analyzeGanRelations } = require(path.join(__dirname, 'vendor/bazi/bazi_relations.js'));
const { analyzeShensha } = require(path.join(__dirname, 'vendor/bazi/shensha.js'));
const { kongWang } = require('./bazi_core');   // 旬空(空亡)算法

// ===== 解析命令行 =====
const argv = process.argv.slice(2);
let Y, Mo, D, H, MIN, gender;
if (argv.length >= 6) {
  [Y, Mo, D, H, MIN, gender] = argv.map((x, i) => (i < 5 ? Number(x) : x));
} else {
  Y = 2000; Mo = 8; D = 16; H = 14; MIN = 30; gender = '男';
  console.error('[demo] 未提供参数，使用演示(通用示例) 2000-08-16 14:30 男。用法见文件头注释。');
}
const G = (gender === '男' || gender === 'man' || gender === 'M') ? Gender.MAN : Gender.WOMAN;

// ===== 排盘 =====
const st = SolarTime.fromYmdHms(Y, Mo, D, H, MIN, 0);
const ec = st.getLunarHour().getEightChar();
const me = ec.getDay().getHeavenStem();
const cyc = [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getHour()];
const nm = ['年', '月', '日', '时'];

const hideOf = z => [z.getHideHeavenStemMain(), z.getHideHeavenStemMiddle(), z.getHideHeavenStemResidual()]
  .filter(Boolean).map(h => h.getName());

const pillars = cyc.map((c, i) => {
  const z = c.getEarthBranch(), g = c.getHeavenStem();
  const hideStars = [z.getHideHeavenStemMain(),z.getHideHeavenStemMiddle(),z.getHideHeavenStemResidual()].filter(Boolean);
  return {
    pos: nm[i],
    ganzhi: c.getName(),
    gan: g.getName(),
    ganRole: i === 2 ? '日主' : me.getTenStar(g).getName(),   // 十神
    zhi: z.getName(),
    nayin: c.getSound().getName(),                            // 纳音
    hide: hideStars.map(h => h.getName()),                    // 藏干(本/中/余气)
    hideTenGod: hideStars.map(h => me.getTenStar(h).getName()), // 藏干十神
    terrain: me.getTerrain(z).getName(),                      // 地势(十二长生)
  };
});

// 起运 + 八步大运
const cl = ChildLimit.fromSolarTime(st, G);
const df0 = cl.getStartDecadeFortune();
const daYun = Array.from({ length: 8 }, (_, n) => {
  const d = df0.next(n);
  return { ganzhi: d.getName(), startAge: d.getStartAge(), endAge: d.getEndAge() };
});

const result = {
  engine: 'tyme4ts+relations+shensha',
  input: { solar: `${Y}-${String(Mo).padStart(2,'0')}-${String(D).padStart(2,'0')} ${H}:${String(MIN).padStart(2,'0')}`, gender },
  info: {
    fourPillars: cyc.map(c => c.getName()),
    nayin: cyc.map(c => c.getSound().getName()),            // 每柱纳音
    dayMaster: me.getName(),
    lunarHour: st.getLunarHour().getName(),
    fetalOrigin: ec.getFetalOrigin().getName(),   // 胎元
    ownSign: ec.getOwnSign().getName(),           // 命宫
    bodySign: ec.getBodySign().getName(),         // 身宫
    kongWang: kongWang(me.getName(), ec.getDay().getEarthBranch().getName()),  // 日柱旬空
  },
  pillars,
  childLimit: {
    years: cl.getYearCount(), months: cl.getMonthCount(), days: cl.getDayCount(),  // 起运实年(出生后N年交运)
    endTime: cl.getEndTime().toString(),
    _note: '起运岁按虚岁记 = 实年换算(出生虚岁1,每过农历年+1);见 data/jieqi.json 的换算案例',
  },
  daYun,                                          // startAge/endAge 为虚岁
  relations: {
    zhi: analyzeZhiRelations(cyc.map((c, i) => [nm[i], c.getEarthBranch().getName()])),
    gan: analyzeGanRelations(cyc.map((c, i) => [nm[i], c.getHeavenStem().getName()])),
  },
  shensha: analyzeShensha(cyc.map((c, i) => ({ pos: nm[i], gan: c.getHeavenStem().getName(), zhi: c.getEarthBranch().getName() })), gender, cyc[0].getSound().getName()),
};

console.log(JSON.stringify(result, null, 2));
