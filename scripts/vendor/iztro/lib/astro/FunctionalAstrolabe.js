"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dayjs_1 = __importDefault(require("dayjs"));
var lunar_lite_1 = require("lunar-lite");
var data_1 = require("../data");
var i18n_1 = require("../i18n");
var star_1 = require("../star");
var utils_1 = require("../utils");
var analyzer_1 = require("./analyzer");
var palace_1 = require("./palace");
var FunctionalHoroscope_1 = __importDefault(require("./FunctionalHoroscope"));
var astro_1 = require("./astro");
/**
 * 获取运限数据
 *
 * @version v0.2.1
 *
 * @private 私有方法
 *
 * @param $ 星盘对象
 * @param targetDate 阳历日期【可选】，默认为调用时日期
 * @param timeIndex 时辰序号【可选】，若不传会返回 `targetDate` 中时间所在的时辰
 * @returns 运限数据
 */
var _getHoroscopeBySolarDate = function ($, targetDate, timeIndex) {
    if (targetDate === void 0) { targetDate = new Date(); }
    var _birthday = (0, lunar_lite_1.solar2lunar)($.solarDate);
    var _date = (0, lunar_lite_1.solar2lunar)(targetDate);
    var convertTimeIndex = (0, utils_1.timeToIndex)((0, dayjs_1.default)(targetDate).hour());
    var _a = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(targetDate, timeIndex || convertTimeIndex, {
        // 允许配置运限分割点
        year: (0, astro_1.getConfig)().horoscopeDivide,
        month: (0, astro_1.getConfig)().horoscopeDivide,
    }), yearly = _a.yearly, monthly = _a.monthly, daily = _a.daily, hourly = _a.hourly;
    // 虚岁
    var nominalAge = _date.lunarYear - _birthday.lunarYear;
    // 是否童限
    var isChildhood = false;
    if ((0, astro_1.getConfig)().ageDivide === 'birthday') {
        // 假如目标日期已经过了生日，则需要加1岁
        // 比如 2022年九月初一 出生的人，在出生后虚岁为 1 岁
        // 但在 2023年九月初二 以后，虚岁则为 2 岁
        if ((_date.lunarYear === _birthday.lunarYear &&
            _date.lunarMonth === _birthday.lunarMonth &&
            _date.lunarDay > _birthday.lunarDay) ||
            _date.lunarMonth > _birthday.lunarMonth) {
            nominalAge += 1;
        }
    }
    else {
        // 以自然年为界，直接加1岁
        nominalAge += 1;
    }
    // 大限索引
    var decadalIndex = -1;
    // 大限天干
    var heavenlyStemOfDecade = 'jia';
    // 大限地支
    var earthlyBranchOfDecade = 'zi';
    // 小限索引
    var ageIndex = -1;
    // 流年索引
    var yearlyIndex = (0, utils_1.fixEarthlyBranchIndex)(yearly[1]);
    // 流月索引
    var monthlyIndex = -1;
    // 流日索引
    var dailyIndex = -1;
    // 流时索引
    var hourlyIndex = -1;
    // 小限天干
    var heavenlyStemOfAge = 'jia';
    // 小限地支
    var earthlyBranchOfAge = 'zi';
    // 查询大限索引
    $.palaces.some(function (_a, index) {
        var decadal = _a.decadal;
        if (nominalAge >= decadal.range[0] && nominalAge <= decadal.range[1]) {
            decadalIndex = index;
            heavenlyStemOfDecade = decadal.heavenlyStem;
            earthlyBranchOfDecade = decadal.earthlyBranch;
            return true;
        }
    });
    if (decadalIndex < 0) {
        // 如果大限索引小于0则证明还没有开始起运
        // 此时应该取小限运
        // 一命二财三疾厄	四岁夫妻五福德
        // 六岁事业为童限	专就宫垣视吉凶
        var palaces = ['命宫', '财帛', '疾厄', '夫妻', '福德', '官禄'];
        var targetIndex = palaces[nominalAge - 1];
        var targetPalace = $.palace(targetIndex);
        if (targetPalace) {
            isChildhood = true;
            decadalIndex = targetPalace.index;
            heavenlyStemOfDecade = targetPalace.heavenlyStem;
            earthlyBranchOfDecade = targetPalace.earthlyBranch;
        }
    }
    // 查询小限索引
    $.palaces.some(function (_a, index) {
        var ages = _a.ages, heavenlyStem = _a.heavenlyStem, earthlyBranch = _a.earthlyBranch;
        if (ages.includes(nominalAge)) {
            ageIndex = index;
            heavenlyStemOfAge = heavenlyStem;
            earthlyBranchOfAge = earthlyBranch;
            return true;
        }
    });
    // 获取流月索引, 流年地支逆数到生月所在宫位，再从该宫位顺数到生时，为正月所在宫位，之后每月一宫
    // 计算流月时需要考虑生月闰月情况，如果是后15天则计算时需要加1月
    var leapAddition = _birthday.isLeap && _birthday.lunarDay > 15 ? 1 : 0;
    // 流月当月的闰月情况也需要考虑
    var dateLeapAddition = _date.isLeap && _date.lunarDay > 15 ? 1 : 0;
    monthlyIndex = (0, utils_1.fixIndex)(yearlyIndex -
        (_birthday.lunarMonth + leapAddition) +
        data_1.EARTHLY_BRANCHES.indexOf((0, i18n_1.kot)($.rawDates.chineseDate.hourly[1])) +
        (_date.lunarMonth + dateLeapAddition));
    // 获取流日索引
    dailyIndex = (0, utils_1.fixIndex)(monthlyIndex + _date.lunarDay - 1);
    // 获取流时索引
    hourlyIndex = (0, utils_1.fixIndex)(dailyIndex + data_1.EARTHLY_BRANCHES.indexOf((0, i18n_1.kot)(hourly[1], 'Earthly')));
    var scope = {
        solarDate: (0, lunar_lite_1.normalizeDateStr)(targetDate).slice(0, 3).join('-'),
        lunarDate: _date.toString(true),
        decadal: {
            index: decadalIndex,
            name: isChildhood ? (0, i18n_1.t)('childhood') : (0, i18n_1.t)('decadal'),
            heavenlyStem: (0, i18n_1.t)((0, i18n_1.kot)(heavenlyStemOfDecade, 'Heavnly')),
            earthlyBranch: (0, i18n_1.t)((0, i18n_1.kot)(earthlyBranchOfDecade, 'Earthly')),
            palaceNames: (0, palace_1.getPalaceNames)(decadalIndex),
            mutagen: (0, utils_1.getMutagensByHeavenlyStem)(heavenlyStemOfDecade),
            stars: (0, star_1.getHoroscopeStar)(heavenlyStemOfDecade, earthlyBranchOfDecade, 'decadal'),
        },
        age: {
            index: ageIndex,
            nominalAge: nominalAge,
            name: (0, i18n_1.t)('turn'),
            heavenlyStem: heavenlyStemOfAge,
            earthlyBranch: earthlyBranchOfAge,
            palaceNames: (0, palace_1.getPalaceNames)(ageIndex),
            mutagen: (0, utils_1.getMutagensByHeavenlyStem)(heavenlyStemOfAge),
        },
        yearly: {
            index: yearlyIndex,
            name: (0, i18n_1.t)('yearly'),
            heavenlyStem: (0, i18n_1.t)((0, i18n_1.kot)(yearly[0], 'Heavenly')),
            earthlyBranch: (0, i18n_1.t)((0, i18n_1.kot)(yearly[1], 'Earthly')),
            palaceNames: (0, palace_1.getPalaceNames)(yearlyIndex),
            mutagen: (0, utils_1.getMutagensByHeavenlyStem)(yearly[0]),
            stars: (0, star_1.getHoroscopeStar)(yearly[0], yearly[1], 'yearly'),
            yearlyDecStar: (0, star_1.getYearly12)(targetDate),
        },
        monthly: {
            index: monthlyIndex,
            name: (0, i18n_1.t)('monthly'),
            heavenlyStem: (0, i18n_1.t)((0, i18n_1.kot)(monthly[0], 'Heavenly')),
            earthlyBranch: (0, i18n_1.t)((0, i18n_1.kot)(monthly[1], 'Earthly')),
            palaceNames: (0, palace_1.getPalaceNames)(monthlyIndex),
            mutagen: (0, utils_1.getMutagensByHeavenlyStem)(monthly[0]),
            stars: (0, star_1.getHoroscopeStar)(monthly[0], monthly[1], 'monthly'),
        },
        daily: {
            index: dailyIndex,
            name: (0, i18n_1.t)('daily'),
            heavenlyStem: (0, i18n_1.t)((0, i18n_1.kot)(daily[0], 'Heavenly')),
            earthlyBranch: (0, i18n_1.t)((0, i18n_1.kot)(daily[1], 'Earthly')),
            palaceNames: (0, palace_1.getPalaceNames)(dailyIndex),
            mutagen: (0, utils_1.getMutagensByHeavenlyStem)(daily[0]),
            stars: (0, star_1.getHoroscopeStar)(daily[0], daily[1], 'daily'),
        },
        hourly: {
            index: hourlyIndex,
            name: (0, i18n_1.t)('hourly'),
            heavenlyStem: (0, i18n_1.t)((0, i18n_1.kot)(hourly[0], 'Heavenly')),
            earthlyBranch: (0, i18n_1.t)((0, i18n_1.kot)(hourly[1], 'Earthly')),
            palaceNames: (0, palace_1.getPalaceNames)(hourlyIndex),
            mutagen: (0, utils_1.getMutagensByHeavenlyStem)(hourly[0]),
            stars: (0, star_1.getHoroscopeStar)(hourly[0], hourly[1], 'hourly'),
        },
    };
    return new FunctionalHoroscope_1.default(scope, $);
};
/**
 * 星盘类。
 *
 * 文档地址：https://docs.iztro.com/posts/astrolabe.html#functionalastrolabe
 */
var FunctionalAstrolabe = /** @class */ (function () {
    function FunctionalAstrolabe(data) {
        var _this = this;
        // 保存插件列表
        this.plugins = [];
        this.star = function (starName) {
            var targetStar;
            _this.palaces.some(function (p) {
                __spreadArray(__spreadArray(__spreadArray([], p.majorStars, true), p.minorStars, true), p.adjectiveStars, true).some(function (item) {
                    if ((0, i18n_1.kot)(item.name) === (0, i18n_1.kot)(starName)) {
                        targetStar = item;
                        targetStar.setPalace(p);
                        targetStar.setAstrolabe(_this);
                    }
                });
            });
            if (!targetStar) {
                throw new Error('invalid star name.');
            }
            return targetStar;
        };
        this.horoscope = function (targetDate, timeIndexOfTarget) {
            if (targetDate === void 0) { targetDate = new Date(); }
            return _getHoroscopeBySolarDate(_this, targetDate, timeIndexOfTarget);
        };
        this.palace = function (indexOrName) { return (0, analyzer_1.getPalace)(_this, indexOrName); };
        this.surroundedPalaces = function (indexOrName) {
            return (0, analyzer_1.getSurroundedPalaces)(_this, indexOrName);
        };
        /**
         * @deprecated 此方法已在`v1.2.0`废弃，请用下列方法替换
         *
         * @example
         *  // AS IS
         *  astrolabe.isSurrounded(0, ["紫微"]);
         *
         *  // TO BE
         *  astrolabe.surroundedPalaces(0).have(["紫微"]);
         */
        this.isSurrounded = function (indexOrName, stars) {
            return _this.surroundedPalaces(indexOrName).have(stars);
        };
        /**
         * @deprecated 此方法已在`v1.2.0`废弃，请用下列方法替换
         *
         * @example
         *  // AS IS
         *  astrolabe.isSurroundedOneOf(0, ["紫微"]);
         *
         *  // TO BE
         *  astrolabe.surroundedPalaces(0).haveOneOf(["紫微"]);
         */
        this.isSurroundedOneOf = function (indexOrName, stars) {
            return _this.surroundedPalaces(indexOrName).haveOneOf(stars);
        };
        /**
         * @deprecated 此方法已在`v1.2.0`废弃，请用下列方法替换
         *
         * @example
         *  // AS IS
         *  astrolabe.notSurrounded(0, ["紫微"]);
         *
         *  // TO BE
         *  astrolabe.surroundedPalaces(0).notHave(["紫微"]);
         */
        this.notSurrounded = function (indexOrName, stars) {
            return _this.surroundedPalaces(indexOrName).notHave(stars);
        };
        this.gender = data.gender;
        this.solarDate = data.solarDate;
        this.lunarDate = data.lunarDate;
        this.chineseDate = data.chineseDate;
        this.rawDates = data.rawDates;
        this.time = data.time;
        this.timeRange = data.timeRange;
        this.sign = data.sign;
        this.zodiac = data.zodiac;
        this.earthlyBranchOfBodyPalace = data.earthlyBranchOfBodyPalace;
        this.earthlyBranchOfSoulPalace = data.earthlyBranchOfSoulPalace;
        this.soul = data.soul;
        this.body = data.body;
        this.fiveElementsClass = data.fiveElementsClass;
        this.palaces = data.palaces;
        this.copyright = data.copyright;
        return this;
    }
    FunctionalAstrolabe.prototype.use = function (plugin) {
        this.plugins.push(plugin);
        plugin.apply(this);
    };
    return FunctionalAstrolabe;
}());
exports.default = FunctionalAstrolabe;
