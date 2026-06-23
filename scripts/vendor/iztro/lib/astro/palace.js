"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHoroscope = exports.getPalaceNames = exports.getFiveElementsClass = exports.getSoulAndBody = void 0;
var lunar_lite_1 = require("lunar-lite");
var data_1 = require("../data");
var i18n_1 = require("../i18n");
var utils_1 = require("../utils");
var astro_1 = require("./astro");
/**
 * 获取命宫以及身宫数据
 *
 * 1. 定寅首
 * - 甲己年生起丙寅，乙庚年生起戊寅，
 * - 丙辛年生起庚寅，丁壬年生起壬寅，
 * - 戊癸年生起甲寅。
 *
 * 2. 安命身宫诀
 * - 寅起正月，顺数至生月，逆数生时为命宫。
 * - 寅起正月，顺数至生月，顺数生时为身宫。
 *
 * @param {AstrolabeParam} param 通用排盘参数
 * @returns {SoulAndBody} 命宫和身宫数据
 */
var getSoulAndBody = function (param) {
    var solarDate = param.solarDate, timeIndex = param.timeIndex, fixLeap = param.fixLeap, from = param.from;
    var _a = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, timeIndex, {
        year: (0, astro_1.getConfig)().yearDivide,
        month: (0, astro_1.getConfig)().horoscopeDivide,
    }), yearly = _a.yearly, hourly = _a.hourly;
    var earthlyBranchOfTime = (0, i18n_1.kot)(hourly[1], 'Earthly');
    var heavenlyStemOfYear = (0, i18n_1.kot)(yearly[0], 'Heavenly');
    // 紫微斗数以`寅`宫为第一个宫位
    var firstIndex = data_1.EARTHLY_BRANCHES.indexOf('yinEarthly');
    var monthIndex = (0, utils_1.fixLunarMonthIndex)(solarDate, timeIndex, fixLeap);
    // 命宫索引，以寅宫为0，顺时针数到生月地支索引，再逆时针数到生时地支索引
    // 此处数到生月地支索引其实就是农历月份，所以不再计算生月地支索引
    var soulIndex = (0, utils_1.fixIndex)(monthIndex - data_1.EARTHLY_BRANCHES.indexOf(earthlyBranchOfTime));
    // 身宫索引，以寅宫为0，顺时针数到生月地支索引，再顺时针数到生时地支索引
    // 与命宫索引一样，不再赘述
    var bodyIndex = (0, utils_1.fixIndex)(monthIndex + data_1.EARTHLY_BRANCHES.indexOf(earthlyBranchOfTime));
    if ((from === null || from === void 0 ? void 0 : from.heavenlyStem) && (from === null || from === void 0 ? void 0 : from.earthlyBranch)) {
        // 以传入地支为命宫
        soulIndex = (0, utils_1.fixEarthlyBranchIndex)(from.earthlyBranch);
        var bodyOffset = [0, 2, 4, 6, 8, 10, 0, 2, 4, 6, 8, 10, 0];
        bodyIndex = (0, utils_1.fixIndex)(bodyOffset[timeIndex] + soulIndex);
    }
    // 用五虎遁取得寅宫的天干
    var startHevenlyStem = data_1.TIGER_RULE[heavenlyStemOfYear];
    // 获取命宫天干索引，起始天干索引加上命宫的索引即是
    // 天干循环数为10
    var heavenlyStemOfSoulIndex = (0, utils_1.fixIndex)(data_1.HEAVENLY_STEMS.indexOf(startHevenlyStem) + soulIndex, 10);
    // 命宫的天干
    var heavenlyStemOfSoul = (0, i18n_1.t)(data_1.HEAVENLY_STEMS[heavenlyStemOfSoulIndex]);
    // 命宫地支，命宫索引 + `寅`的索引（因为紫微斗数里寅宫是第一个宫位）
    var earthlyBranchOfSoul = (0, i18n_1.t)(data_1.EARTHLY_BRANCHES[(0, utils_1.fixIndex)(soulIndex + firstIndex)]);
    return {
        soulIndex: soulIndex,
        bodyIndex: bodyIndex,
        heavenlyStemOfSoul: heavenlyStemOfSoul,
        earthlyBranchOfSoul: earthlyBranchOfSoul,
    };
};
exports.getSoulAndBody = getSoulAndBody;
/**
 * 定五行局法（以命宫天干地支而定）
 *
 * 纳音五行计算取数巧记口诀：
 *
 * - 甲乙丙丁一到五，子丑午未一来数，
 * - 寅卯申酉二上走，辰巳戌亥三为足。
 * - 干支相加多减五，五行木金水火土。
 *
 * 注解：
 *
 * 1、五行取数：木1 金2 水3 火4 土5
 *
 *  天干取数：
 *  - 甲乙 ——> 1
 *  - 丙丁 ——> 2
 *  - 戊己 ——> 3
 *  - 庚辛 ——> 4
 *  - 壬癸 ——> 5
 *
 *  地支取数：
 *  - 子午丑未 ——> 1
 *  - 寅申卯酉 ——> 2
 *  - 辰戌巳亥 ——> 3
 *
 * 2、计算方法：
 *
 *  干支数相加，超过5者减去5，以差论之。
 *  - 若差为1则五行属木
 *  - 若差为2则五行属金
 *  - 若差为3则五行属水
 *  - 若差为4则五行属火
 *  - 若差为5则五行属土
 *
 * 3、举例：
 *  - 丙子：丙2 子1=3 ——> 水 ——> 水二局
 *  - 辛未：辛4 未1=5 ——> 土 ——> 土五局
 *  - 庚申：庚4 申2=6 ——> 6-5=1 ——> 木 ——> 木三局
 *
 * @param heavenlyStemName 天干
 * @param earthlyBranchName 地支
 * @returns 水二局 ｜ 木三局 ｜ 金四局 ｜ 土五局 ｜ 火六局
 */
var getFiveElementsClass = function (heavenlyStemName, earthlyBranchName) {
    var fiveElementsTable = ['wood3rd', 'metal4th', 'water2nd', 'fire6th', 'earth5th'];
    var heavenlyStem = (0, i18n_1.kot)(heavenlyStemName, 'Heavenly');
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    var heavenlyStemNumber = Math.floor(data_1.HEAVENLY_STEMS.indexOf(heavenlyStem) / 2) + 1;
    var earthlyBranchNumber = Math.floor((0, utils_1.fixIndex)(data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch), 6) / 2) + 1;
    var index = heavenlyStemNumber + earthlyBranchNumber;
    while (index > 5) {
        index -= 5;
    }
    return (0, i18n_1.t)(fiveElementsTable[index - 1]);
};
exports.getFiveElementsClass = getFiveElementsClass;
/**
 * 获取从寅宫开始的各个宫名
 *
 * @param fromIndex 命宫索引
 * @returns 从寅宫开始的各个宫名
 */
var getPalaceNames = function (fromIndex) {
    var names = [];
    for (var i = 0; i < data_1.PALACES.length; i++) {
        var idx = (0, utils_1.fixIndex)(i - fromIndex);
        names[i] = (0, i18n_1.t)(data_1.PALACES[idx]);
    }
    return names;
};
exports.getPalaceNames = getPalaceNames;
/**
 * 起大限
 *
 * - 大限由命宫起，阳男阴女顺行；
 * - 阴男阳女逆行，每十年过一宫限。
 *
 * @param solarDateStr 公历日期
 * @param timeIndex 出生时索引
 * @param gender 性别
 * @param fixLeap 是否修正闰月，若修正，则闰月前15天按上月算，后15天按下月算
 * @returns 从寅宫开始的大限年龄段
 */
var getHoroscope = function (param) {
    var _a, _b;
    var solarDate = param.solarDate, timeIndex = param.timeIndex, gender = param.gender, from = param.from;
    var decadals = [];
    var genderKey = (0, i18n_1.kot)(gender);
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, timeIndex, {
        // 起大限应该与配置同步
        year: (0, astro_1.getConfig)().yearDivide,
    }).yearly;
    var heavenlyStem = (0, i18n_1.kot)(yearly[0], 'Heavenly');
    var earthlyBranch = (0, i18n_1.kot)(yearly[1], 'Earthly');
    var _c = (0, exports.getSoulAndBody)(param), soulIndex = _c.soulIndex, heavenlyStemOfSoul = _c.heavenlyStemOfSoul, earthlyBranchOfSoul = _c.earthlyBranchOfSoul;
    var fiveElementsClass = (0, i18n_1.kot)((0, exports.getFiveElementsClass)((_a = from === null || from === void 0 ? void 0 : from.heavenlyStem) !== null && _a !== void 0 ? _a : heavenlyStemOfSoul, (_b = from === null || from === void 0 ? void 0 : from.earthlyBranch) !== null && _b !== void 0 ? _b : earthlyBranchOfSoul));
    // 用五虎遁获取大限起始天干
    var startHeavenlyStem = data_1.TIGER_RULE[heavenlyStem];
    for (var i = 0; i < 12; i++) {
        var idx = data_1.GENDER[genderKey] === data_1.earthlyBranches[earthlyBranch].yinYang ? (0, utils_1.fixIndex)(soulIndex + i) : (0, utils_1.fixIndex)(soulIndex - i);
        var start = data_1.FiveElementsClass[fiveElementsClass] + 10 * i;
        var heavenlyStemIndex = (0, utils_1.fixIndex)(data_1.HEAVENLY_STEMS.indexOf(startHeavenlyStem) + idx, 10);
        var earthlyBranchIndex = (0, utils_1.fixIndex)(data_1.EARTHLY_BRANCHES.indexOf('yinEarthly') + idx);
        decadals[idx] = {
            range: [start, start + 9],
            heavenlyStem: (0, i18n_1.t)(data_1.HEAVENLY_STEMS[heavenlyStemIndex]),
            earthlyBranch: (0, i18n_1.t)(data_1.EARTHLY_BRANCHES[earthlyBranchIndex]),
        };
    }
    var ageIdx = (0, utils_1.getAgeIndex)(yearly[1]);
    var ages = [];
    for (var i = 0; i < 12; i++) {
        var age = [];
        for (var j = 0; j < 10; j++) {
            age.push(12 * j + i + 1);
        }
        var idx = (0, i18n_1.kot)(gender) === 'male' ? (0, utils_1.fixIndex)(ageIdx + i) : (0, utils_1.fixIndex)(ageIdx - i);
        ages[idx] = age;
    }
    return { decadals: decadals, ages: ages };
};
exports.getHoroscope = getHoroscope;
