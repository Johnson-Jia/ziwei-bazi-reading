"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinorStar = void 0;
var lunar_lite_1 = require("lunar-lite");
var _1 = require(".");
var i18n_1 = require("../i18n");
var utils_1 = require("../utils");
var FunctionalStar_1 = __importDefault(require("./FunctionalStar"));
var location_1 = require("./location");
var astro_1 = require("../astro");
/**
 * 安14辅星，寅宫下标为0，若下标对应的数组为空数组则表示没有星耀
 *
 * @param solarDateStr 阳历日期字符串
 * @param timeIndex 时辰索引【0～12】
 * @param fixLeap 是否修复闰月，假如当月不是闰月则不生效
 * @returns 14辅星
 */
var getMinorStar = function (solarDateStr, timeIndex, fixLeap) {
    var stars = (0, _1.initStars)();
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDateStr, timeIndex, {
        year: (0, astro_1.getConfig)().yearDivide,
    }).yearly;
    var monthIndex = (0, utils_1.fixLunarMonthIndex)(solarDateStr, timeIndex, fixLeap);
    // 此处获取到的是索引，下标是从0开始的，所以需要加1
    var _a = (0, location_1.getZuoYouIndex)(monthIndex + 1), zuoIndex = _a.zuoIndex, youIndex = _a.youIndex;
    var _b = (0, location_1.getChangQuIndex)(timeIndex), changIndex = _b.changIndex, quIndex = _b.quIndex;
    var _c = (0, location_1.getKuiYueIndex)(yearly[0]), kuiIndex = _c.kuiIndex, yueIndex = _c.yueIndex;
    var _d = (0, location_1.getHuoLingIndex)(yearly[1], timeIndex), huoIndex = _d.huoIndex, lingIndex = _d.lingIndex;
    var _e = (0, location_1.getKongJieIndex)(timeIndex), kongIndex = _e.kongIndex, jieIndex = _e.jieIndex;
    var _f = (0, location_1.getLuYangTuoMaIndex)(yearly[0], yearly[1]), luIndex = _f.luIndex, yangIndex = _f.yangIndex, tuoIndex = _f.tuoIndex, maIndex = _f.maIndex;
    stars[zuoIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('zuofuMin'),
        type: 'soft',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('左辅', zuoIndex),
        mutagen: (0, utils_1.getMutagen)('左辅', yearly[0]),
    }));
    stars[youIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('youbiMin'),
        type: 'soft',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('右弼', youIndex),
        mutagen: (0, utils_1.getMutagen)('右弼', yearly[0]),
    }));
    stars[changIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('wenchangMin'),
        type: 'soft',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('文昌', changIndex),
        mutagen: (0, utils_1.getMutagen)('文昌', yearly[0]),
    }));
    stars[quIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('wenquMin'),
        type: 'soft',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('文曲', quIndex),
        mutagen: (0, utils_1.getMutagen)('文曲', yearly[0]),
    }));
    stars[kuiIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('tiankuiMin'),
        type: 'soft',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('天魁', kuiIndex),
    }));
    stars[yueIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('tianyueMin'),
        type: 'soft',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('天钺', yueIndex),
    }));
    stars[luIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('lucunMin'),
        type: 'lucun',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('禄存', luIndex),
    }));
    stars[maIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('tianmaMin'),
        type: 'tianma',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('天马', maIndex),
    }));
    stars[kongIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('dikongMin'),
        type: 'tough',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('地空', kongIndex),
    }));
    stars[jieIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('dijieMin'),
        type: 'tough',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('地劫', jieIndex),
    }));
    stars[huoIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('huoxingMin'),
        type: 'tough',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('火星', huoIndex),
    }));
    stars[lingIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('lingxingMin'),
        type: 'tough',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('铃星', lingIndex),
    }));
    stars[yangIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('qingyangMin'),
        type: 'tough',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('擎羊', yangIndex),
    }));
    stars[tuoIndex].push(new FunctionalStar_1.default({
        name: (0, i18n_1.t)('tuoluoMin'),
        type: 'tough',
        scope: 'origin',
        brightness: (0, utils_1.getBrightness)('陀罗', tuoIndex),
    }));
    return stars;
};
exports.getMinorStar = getMinorStar;
