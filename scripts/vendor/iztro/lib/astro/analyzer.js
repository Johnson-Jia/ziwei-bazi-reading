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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutagensToStars = exports.notSurroundedByStars = exports.isSurroundedByOneOfStars = exports.isSurroundedByStars = exports.hasOneOfStars = exports.notHaveStars = exports.notHaveMutagenInPalce = exports.hasMutagenInPlace = exports.hasStars = exports.getPalace = exports.getSurroundedPalaces = void 0;
var data_1 = require("../data");
var i18n_1 = require("../i18n");
var utils_1 = require("../utils");
var FunctionalSurpalaces_1 = require("./FunctionalSurpalaces");
var _concatStars = function () {
    var stars = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stars[_i] = arguments[_i];
    }
    return Array.from(stars)
        .reduce(function (prev, next) {
        return __spreadArray(__spreadArray([], prev, true), next, true);
    }, [])
        .map(function (item) { return (0, i18n_1.kot)(item.name); });
};
var _includeAll = function (allStarsInPalace, targetStars) {
    var starKeys = targetStars.map(function (item) { return (0, i18n_1.kot)(item); });
    return starKeys.every(function (star) { return allStarsInPalace.includes(star); });
};
var _excludeAll = function (allStarsInPalace, targetStars) {
    var starKeys = targetStars.map(function (item) { return (0, i18n_1.kot)(item); });
    return starKeys.every(function (star) { return !allStarsInPalace.includes(star); });
};
var _includeOneOf = function (allStarsInPalace, targetStars) {
    var starKeys = targetStars.map(function (item) { return (0, i18n_1.kot)(item); });
    return starKeys.some(function (star) { return allStarsInPalace.includes(star); });
};
var _includeMutagen = function (stars, mutagen) {
    var mutagenKey = (0, i18n_1.kot)(mutagen);
    return stars.some(function (star) { return star.mutagen && (0, i18n_1.kot)(star.mutagen) === mutagenKey; });
};
var _getAllStarsInSurroundedPalaces = function (_a) {
    var target = _a.target, opposite = _a.opposite, wealth = _a.wealth, career = _a.career;
    return _concatStars(target.majorStars, target.minorStars, target.adjectiveStars, opposite.majorStars, opposite.minorStars, opposite.adjectiveStars, wealth.majorStars, wealth.minorStars, wealth.adjectiveStars, career.majorStars, career.minorStars, career.adjectiveStars);
};
/**
 * 获取三方四正宫位，所谓三方四正就是传入的目标宫位，以及其对宫，财帛位和官禄位，总共四个宫位
 *
 * @version v1.1.0
 *
 * @param $ 星盘实例
 * @param indexOrName 宫位索引或者宫位名称
 * @returns 三方四正宫位
 */
var getSurroundedPalaces = function ($, indexOrName) {
    // 获取目标宫位
    var palace = (0, exports.getPalace)($, indexOrName);
    if (!palace) {
        throw new Error('indexOrName is inccorrect.');
    }
    // 获取目标宫位索引
    var palaceIndex = (0, utils_1.fixEarthlyBranchIndex)(palace.earthlyBranch);
    // 获取对宫
    var palace6 = (0, exports.getPalace)($, (0, utils_1.fixIndex)(palaceIndex + 6));
    // 官禄位
    var palace4 = (0, exports.getPalace)($, (0, utils_1.fixIndex)(palaceIndex + 4));
    // 财帛位
    var palace8 = (0, exports.getPalace)($, (0, utils_1.fixIndex)(palaceIndex + 8));
    if (!palace4 || !palace6 || !palace8) {
        throw new Error('indexOrName is inccorrect.');
    }
    return new FunctionalSurpalaces_1.FunctionalSurpalaces({
        target: palace,
        wealth: palace8,
        opposite: palace6,
        career: palace4,
    });
};
exports.getSurroundedPalaces = getSurroundedPalaces;
/**
 * 获取星盘的某一个宫位
 *
 * @version v1.0.0
 *
 * @param $ 星盘实例
 * @param indexOrName 宫位索引或者宫位名称
 * @returns 宫位实例
 */
var getPalace = function ($, indexOrName) {
    var palace;
    if (typeof indexOrName === 'number') {
        if (indexOrName < 0 || indexOrName > 11) {
            throw new Error('invalid palace index.');
        }
        palace = $.palaces[indexOrName];
    }
    else {
        palace = $.palaces.find(function (item) {
            if ((0, i18n_1.kot)(indexOrName) === 'originalPalace' && item.isOriginalPalace) {
                return item;
            }
            if ((0, i18n_1.kot)(indexOrName) === 'bodyPalace' && item.isBodyPalace) {
                return item;
            }
            if ((0, i18n_1.kot)(item.name) === (0, i18n_1.kot)(indexOrName)) {
                return item;
            }
        });
    }
    palace === null || palace === void 0 ? void 0 : palace.setAstrolabe($);
    return palace;
};
exports.getPalace = getPalace;
/**
 * 判断某个宫位内是否有传入的星耀，要所有星耀都在宫位内才会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
var hasStars = function ($, stars) {
    var allStarsInPalace = _concatStars($.majorStars, $.minorStars, $.adjectiveStars);
    return _includeAll(allStarsInPalace, stars);
};
exports.hasStars = hasStars;
/**
 * 判断指定宫位内是否有生年四化
 *
 * @version v1.2.0
 *
 * @param $ 宫位实例
 * @param mutagen 四化名称【禄｜权｜科｜忌】
 * @returns true | false
 */
var hasMutagenInPlace = function ($, mutagen) {
    var allStarsInPalace = __spreadArray(__spreadArray([], $.majorStars, true), $.minorStars, true);
    return _includeMutagen(allStarsInPalace, mutagen);
};
exports.hasMutagenInPlace = hasMutagenInPlace;
/**
 * 判断指定宫位内是否没有生年四化
 *
 * @version v1.2.0
 *
 * @param $ 宫位实例
 * @param mutagen 四化名称【禄｜权｜科｜忌】
 * @returns true | false
 */
var notHaveMutagenInPalce = function ($, mutagen) {
    return !(0, exports.hasMutagenInPlace)($, mutagen);
};
exports.notHaveMutagenInPalce = notHaveMutagenInPalce;
/**
 * 判断某个宫位内是否有传入的星耀，要所有星耀都不在宫位内才会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
var notHaveStars = function ($, stars) {
    var allStarsInPalace = _concatStars($.majorStars, $.minorStars, $.adjectiveStars);
    return _excludeAll(allStarsInPalace, stars);
};
exports.notHaveStars = notHaveStars;
/**
 * 判断某个宫位内是否有传入星耀的其中一个，只要命中一个就会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
var hasOneOfStars = function ($, stars) {
    var allStarsInPalace = _concatStars($.majorStars, $.minorStars, $.adjectiveStars);
    return _includeOneOf(allStarsInPalace, stars);
};
exports.hasOneOfStars = hasOneOfStars;
/**
 * 判断某一个宫位三方四正是否包含目标星耀，必须要全部包含才会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
var isSurroundedByStars = function ($, stars) {
    var allStarsInPalace = _getAllStarsInSurroundedPalaces($);
    return _includeAll(allStarsInPalace, stars);
};
exports.isSurroundedByStars = isSurroundedByStars;
/**
 * 判断三方四正内是否有传入星耀的其中一个，只要命中一个就会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
var isSurroundedByOneOfStars = function ($, stars) {
    var allStarsInPalace = _getAllStarsInSurroundedPalaces($);
    return _includeOneOf(allStarsInPalace, stars);
};
exports.isSurroundedByOneOfStars = isSurroundedByOneOfStars;
/**
 * 判断某一个宫位三方四正是否不含目标星耀，必须要全部都不在三方四正内含才会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
var notSurroundedByStars = function ($, stars) {
    var allStarsInPalace = _getAllStarsInSurroundedPalaces($);
    return _excludeAll(allStarsInPalace, stars);
};
exports.notSurroundedByStars = notSurroundedByStars;
var mutagensToStars = function (heavenlyStem, mutagens) {
    var muts = Array.isArray(mutagens) ? mutagens : [mutagens];
    var stars = [];
    var mutagenStars = (0, utils_1.getMutagensByHeavenlyStem)(heavenlyStem);
    muts.forEach(function (withMutagen) {
        var mutagenIndex = data_1.MUTAGEN.indexOf((0, i18n_1.kot)(withMutagen));
        if (!mutagenStars[mutagenIndex]) {
            return;
        }
        stars.push(mutagenStars[mutagenIndex]);
    });
    return stars;
};
exports.mutagensToStars = mutagensToStars;
