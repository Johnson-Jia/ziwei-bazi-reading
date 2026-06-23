"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMajorStar = void 0;
var lunar_lite_1 = require("lunar-lite");
var _1 = require(".");
var i18n_1 = require("../i18n");
var utils_1 = require("../utils");
var FunctionalStar_1 = __importDefault(require("./FunctionalStar"));
var location_1 = require("./location");
var astro_1 = require("../astro");
/**
 * 安主星，寅宫下标为0，若下标对应的数组为空数组则表示没有星耀
 *
 * 安紫微诸星诀
 * - 紫微逆去天机星，隔一太阳武曲辰，
 * - 连接天同空二宫，廉贞居处方是真。
 *
 * 安天府诸星诀
 * - 天府顺行有太阴，贪狼而后巨门临，
 * - 随来天相天梁继，七杀空三是破军。
 *
 * @param {AstrolabeParam} param 通用排盘参数
 * @returns {Array<Star[]>} 从寅宫开始每一个宫的星耀
 */
var getMajorStar = function (param) {
    var solarDate = param.solarDate, timeIndex = param.timeIndex;
    var _a = (0, location_1.getStartIndex)(param), ziweiIndex = _a.ziweiIndex, tianfuIndex = _a.tianfuIndex;
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, timeIndex, {
        year: (0, astro_1.getConfig)().yearDivide,
    }).yearly;
    var stars = (0, _1.initStars)();
    var ziweiGroup = [
        'ziweiMaj',
        'tianjiMaj',
        '',
        'taiyangMaj',
        'wuquMaj',
        'tiantongMaj',
        '',
        '',
        'lianzhenMaj',
    ];
    var tianfuGroup = [
        'tianfuMaj',
        'taiyinMaj',
        'tanlangMaj',
        'jumenMaj',
        'tianxiangMaj',
        'tianliangMaj',
        'qishaMaj',
        '',
        '',
        '',
        'pojunMaj',
    ];
    ziweiGroup.forEach(function (s, i) {
        // 安紫微星系，起始宫逆时针安
        if (s !== '') {
            stars[(0, utils_1.fixIndex)(ziweiIndex - i)].push(new FunctionalStar_1.default({
                name: (0, i18n_1.t)(s),
                type: 'major',
                scope: 'origin',
                brightness: (0, utils_1.getBrightness)((0, i18n_1.t)(s), (0, utils_1.fixIndex)(ziweiIndex - i)),
                mutagen: (0, utils_1.getMutagen)((0, i18n_1.t)(s), yearly[0]),
            }));
        }
    });
    tianfuGroup.forEach(function (s, i) {
        if (s !== '') {
            stars[(0, utils_1.fixIndex)(tianfuIndex + i)].push(new FunctionalStar_1.default({
                name: (0, i18n_1.t)(s),
                type: 'major',
                scope: 'origin',
                brightness: (0, utils_1.getBrightness)((0, i18n_1.t)(s), (0, utils_1.fixIndex)(tianfuIndex + i)),
                mutagen: (0, utils_1.getMutagen)((0, i18n_1.t)(s), yearly[0]),
            }));
        }
    });
    return stars;
};
exports.getMajorStar = getMajorStar;
