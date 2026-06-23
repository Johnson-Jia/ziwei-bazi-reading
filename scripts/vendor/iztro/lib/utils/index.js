"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateChineseDate = exports.getAgeIndex = exports.timeToIndex = exports.mergeStars = exports.fixLunarDayIndex = exports.fixLunarMonthIndex = exports.fixEarthlyBranchIndex = exports.getMutagensByHeavenlyStem = exports.getMutagen = exports.getBrightness = exports.earthlyBranchIndexToPalaceIndex = exports.fixIndex = void 0;
var data_1 = require("../data");
var star_1 = require("../star");
var i18n_1 = require("../i18n");
var lunar_lite_1 = require("lunar-lite");
var astro_1 = require("../astro");
var getTargetMutagens = function (heavenlyStem) {
    var _a, _b;
    var mutagens = (0, astro_1.getConfig)().mutagens;
    var result;
    if (mutagens && mutagens[heavenlyStem]) {
        result = (_a = mutagens[heavenlyStem]) !== null && _a !== void 0 ? _a : [];
    }
    else {
        result = (_b = data_1.heavenlyStems[heavenlyStem].mutagen) !== null && _b !== void 0 ? _b : [];
    }
    return result;
};
/**
 * 用于处理索引，将索引锁定在 0~max 范围内
 *
 * @param index 当前索引
 * @param max 最大循环数，默认为12【因为12用得最多，宫位数量以及十二地支数量都为12，所以将12作为默认值】
 * @returns {number} 处理后的索引
 */
var fixIndex = function (index, max) {
    if (max === void 0) { max = 12; }
    if (index < 0) {
        return (0, exports.fixIndex)(index + max, max);
    }
    if (index > max - 1) {
        return (0, exports.fixIndex)(index - max, max);
    }
    var res = 1 / index === -Infinity ? 0 : index;
    return res;
};
exports.fixIndex = fixIndex;
/**
 * 因为宫位是从寅宫开始的排列的，所以需要将目标地支的序号减去寅的序号才能得到宫位的序号
 *
 * @param {EarthlyBranchName} earthlyBranch 地支
 * @returns {number} 该地支对应的宫位索引序号
 */
var earthlyBranchIndexToPalaceIndex = function (earthlyBranchName) {
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    var yin = (0, i18n_1.kot)('yinEarthly', 'Earthly');
    return (0, exports.fixIndex)(data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch) - data_1.EARTHLY_BRANCHES.indexOf(yin));
};
exports.earthlyBranchIndexToPalaceIndex = earthlyBranchIndexToPalaceIndex;
/**
 * 配置星耀亮度
 *
 * @param {StarName} starName 星耀名字
 * @param {number} index 所在宫位索引
 */
var getBrightness = function (starName, index) {
    var _a;
    var star = (0, i18n_1.kot)(starName);
    var brightness = (0, astro_1.getConfig)().brightness;
    var targetBrightness = brightness[star] ? brightness[star] : (_a = data_1.STARS_INFO[star]) === null || _a === void 0 ? void 0 : _a.brightness;
    if (!targetBrightness) {
        return '';
    }
    return (0, i18n_1.t)(targetBrightness[(0, exports.fixIndex)(index)]);
};
exports.getBrightness = getBrightness;
var getMutagen = function (starName, heavenlyStemName) {
    var heavenlyStem = (0, i18n_1.kot)(heavenlyStemName, 'Heavenly');
    var starKey = (0, i18n_1.kot)(starName);
    var target = getTargetMutagens(heavenlyStem);
    return (0, i18n_1.t)(data_1.MUTAGEN[target.indexOf(starKey)]);
};
exports.getMutagen = getMutagen;
var getMutagensByHeavenlyStem = function (heavenlyStemName) {
    var heavenlyStem = (0, i18n_1.kot)(heavenlyStemName, 'Heavenly');
    var target = getTargetMutagens(heavenlyStem);
    return target.map(function (star) { return (0, i18n_1.t)(star); });
};
exports.getMutagensByHeavenlyStem = getMutagensByHeavenlyStem;
/**
 * 处理地支相对于十二宫的索引，因为十二宫是以寅宫开始，所以下标需要减去地支寅的索引
 *
 * @param {EarthlyBranchName} earthlyBranch 地支
 * @returns {number} Number(0~11)
 */
var fixEarthlyBranchIndex = function (earthlyBranchName) {
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    return (0, exports.fixIndex)(data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch) - data_1.EARTHLY_BRANCHES.indexOf('yinEarthly'));
};
exports.fixEarthlyBranchIndex = fixEarthlyBranchIndex;
/**
 * 调整农历月份的索引
 *
 * 正月建寅（正月地支为寅），fixLeap为是否调整闰月情况
 * 若调整闰月，则闰月的前15天按上月算，后面天数按下月算
 * 比如 闰二月 时，fixLeap 为 true 时 闰二月十五(含)前
 * 的月份按二月算，之后的按三月算
 *
 * @param {string} solarDateStr 阳历日期
 * @param {number} timeIndex 时辰序号
 * @param {vboolean} fixLeap 是否调整闰月
 * @returns {number} 月份索引
 */
var fixLunarMonthIndex = function (solarDateStr, timeIndex, fixLeap) {
    var _a = (0, lunar_lite_1.solar2lunar)(solarDateStr), lunarMonth = _a.lunarMonth, lunarDay = _a.lunarDay, isLeap = _a.isLeap;
    // 紫微斗数以`寅`宫为第一个宫位
    var firstIndex = data_1.EARTHLY_BRANCHES.indexOf('yinEarthly');
    var needToAdd = isLeap && fixLeap && lunarDay > 15 && timeIndex !== 12;
    return (0, exports.fixIndex)(lunarMonth + 1 - firstIndex + (needToAdd ? 1 : 0));
};
exports.fixLunarMonthIndex = fixLunarMonthIndex;
/**
 * 获取农历日期【天】的索引，晚子时将加一天，所以如果是晚子时下标不需要减一
 *
 * @param lunarDay 农历日期【天】
 * @param timeIndex 时辰索引
 * @returns {number} 农历日期【天】
 */
var fixLunarDayIndex = function (lunarDay, timeIndex) { return (timeIndex >= 12 ? lunarDay : lunarDay - 1); };
exports.fixLunarDayIndex = fixLunarDayIndex;
/**
 * 将多个星耀数组合并到一起
 *
 * @param {FunctionalStar[][][]} stars 星耀数组
 * @returns {FunctionalStar[][]} 合并后的星耀
 */
var mergeStars = function () {
    var stars = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stars[_i] = arguments[_i];
    }
    var finalStars = (0, star_1.initStars)();
    stars.forEach(function (item) {
        item.forEach(function (subItem, index) {
            Array.prototype.push.apply(finalStars[index], subItem);
        });
    });
    return finalStars;
};
exports.mergeStars = mergeStars;
/**
 * 将时间的小时转化为时辰的索引
 *
 * @param {number} hour 当前时间的小时数
 * @returns {number} 时辰的索引
 */
var timeToIndex = function (hour) {
    if (hour === 0) {
        // 00:00～01:00 为早子时
        return 0;
    }
    if (hour === 23) {
        // 23:00～00:00 为晚子时
        return 12;
    }
    return Math.floor((hour + 1) / 2);
};
exports.timeToIndex = timeToIndex;
/**
 * 起小限
 *
 * - 小限一年一度逢，男顺女逆不相同，
 * - 寅午戍人辰上起，申子辰人自戍宫，
 * - 巳酉丑人未宫始，亥卯未人起丑宫。
 *
 * @param {EarthlyBranchName} earthlyBranchName 地支
 * @returns {number} 小限开始的宫位索引
 */
var getAgeIndex = function (earthlyBranchName) {
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    var ageIdx = -1;
    if (['yinEarthly', 'wuEarthly', 'xuEarthly'].includes(earthlyBranch)) {
        ageIdx = (0, exports.fixEarthlyBranchIndex)('chen');
    }
    else if (['shenEarthly', 'ziEarthly', 'chenEarthly'].includes(earthlyBranch)) {
        ageIdx = (0, exports.fixEarthlyBranchIndex)('xu');
    }
    else if (['siEarthly', 'youEarthly', 'chouEarthly'].includes(earthlyBranch)) {
        ageIdx = (0, exports.fixEarthlyBranchIndex)('wei');
    }
    else if (['haiEarthly', 'maoEarthly', 'weiEarthly'].includes(earthlyBranch)) {
        ageIdx = (0, exports.fixIndex)((0, exports.fixEarthlyBranchIndex)('chou'));
    }
    return ageIdx;
};
exports.getAgeIndex = getAgeIndex;
/**
 * 返回翻译后的干支纪年字符串
 *
 * @param chineseDate 干支纪年日期对象
 * @returns 干支纪年字符串
 */
var translateChineseDate = function (chineseDate) {
    var yearly = chineseDate.yearly, monthly = chineseDate.monthly, daily = chineseDate.daily, hourly = chineseDate.hourly;
    if (yearly.some(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)).length > 1; }) ||
        monthly.some(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)).length > 1; }) ||
        daily.some(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)).length > 1; }) ||
        hourly.some(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)).length > 1; })) {
        return "".concat(yearly.map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); }).join(' '), " - ").concat(monthly.map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); }).join(' '), " - ").concat(daily
            .map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); })
            .join(' '), " - ").concat(hourly.map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); }).join(' '));
    }
    return "".concat(yearly.map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); }).join(''), " ").concat(monthly.map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); }).join(''), " ").concat(daily
        .map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); })
        .join(''), " ").concat(hourly.map(function (item) { return (0, i18n_1.t)((0, i18n_1.kot)(item)); }).join(''));
};
exports.translateChineseDate = translateChineseDate;
