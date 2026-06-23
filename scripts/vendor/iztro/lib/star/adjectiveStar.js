"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdjectiveStar = void 0;
var lunar_lite_1 = require("lunar-lite");
var _1 = require(".");
var i18n_1 = require("../i18n");
var FunctionalStar_1 = __importDefault(require("./FunctionalStar"));
var location_1 = require("./location");
var astro_1 = require("../astro");
/**
 * 安杂耀
 *
 * @param {AstrolabeParam} param - 通用排盘参数参数
 * @returns 38杂耀
 */
var getAdjectiveStar = function (param) {
    var solarDate = param.solarDate, timeIndex = param.timeIndex, fixLeap = param.fixLeap;
    var algorithm = (0, astro_1.getConfig)().algorithm;
    var stars = (0, _1.initStars)();
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, timeIndex, {
        year: (0, astro_1.getConfig)().yearDivide,
    }).yearly;
    var yearlyIndex = (0, location_1.getYearlyStarIndex)(param);
    var monthlyIndex = (0, location_1.getMonthlyStarIndex)(solarDate, timeIndex, fixLeap);
    var dailyIndex = (0, location_1.getDailyStarIndex)(solarDate, timeIndex, fixLeap);
    var timelyIndex = (0, location_1.getTimelyStarIndex)(timeIndex);
    var _a = (0, location_1.getLuanXiIndex)(yearly[1]), hongluanIndex = _a.hongluanIndex, tianxiIndex = _a.tianxiIndex;
    var suiqian12 = (0, _1.getYearly12)(solarDate).suiqian12;
    stars[hongluanIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('hongluan'), type: 'flower', scope: 'origin' }));
    stars[tianxiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianxi'), type: 'flower', scope: 'origin' }));
    stars[monthlyIndex.tianyaoIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianyao'), type: 'flower', scope: 'origin' }));
    stars[yearlyIndex.xianchiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('xianchi'), type: 'flower', scope: 'origin' }));
    stars[monthlyIndex.yuejieIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('jieshen'), type: 'helper', scope: 'origin' }));
    stars[dailyIndex.santaiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('santai'), type: 'adjective', scope: 'origin' }));
    stars[dailyIndex.bazuoIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('bazuo'), type: 'adjective', scope: 'origin' }));
    stars[dailyIndex.enguangIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('engguang'), type: 'adjective', scope: 'origin' }));
    stars[dailyIndex.tianguiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tiangui'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.longchiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('longchi'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.fenggeIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('fengge'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tiancaiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tiancai'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tianshouIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianshou'), type: 'adjective', scope: 'origin' }));
    stars[timelyIndex.taifuIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('taifu'), type: 'adjective', scope: 'origin' }));
    stars[timelyIndex.fenggaoIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('fenggao'), type: 'adjective', scope: 'origin' }));
    stars[monthlyIndex.tianwuIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianwu'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.huagaiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('huagai'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tianguanIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianguan'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tianfuIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianfu'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tianchuIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianchu'), type: 'adjective', scope: 'origin' }));
    stars[monthlyIndex.tianyueIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianyue'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tiandeIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tiande'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.yuedeIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('yuede'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tiankongIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tiankong'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.xunkongIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('xunkong'), type: 'adjective', scope: 'origin' }));
    if (algorithm !== 'zhongzhou') {
        // 中州派没有的星耀
        stars[yearlyIndex.jieluIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('jielu'), type: 'adjective', scope: 'origin' }));
        stars[yearlyIndex.kongwangIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('kongwang'), type: 'adjective', scope: 'origin' }));
    }
    else {
        // 中州派特有的星耀
        stars[suiqian12.indexOf((0, i18n_1.t)((0, i18n_1.kot)('longde')))].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('longde'), type: 'adjective', scope: 'origin' }));
        stars[yearlyIndex.jiekongIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('jiekong'), type: 'adjective', scope: 'origin' }));
        stars[yearlyIndex.jieshaAdjIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('jieshaAdj'), type: 'adjective', scope: 'origin' }));
        stars[yearlyIndex.dahaoAdjIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('dahao'), type: 'adjective', scope: 'origin' }));
    }
    stars[yearlyIndex.guchenIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('guchen'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.guasuIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('guasu'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.feilianIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('feilian'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.posuiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('posui'), type: 'adjective', scope: 'origin' }));
    stars[monthlyIndex.tianxingIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianxing'), type: 'adjective', scope: 'origin' }));
    stars[monthlyIndex.yinshaIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('yinsha'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tiankuIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianku'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tianxuIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianxu'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tianshiIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianshi'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.tianshangIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianshang'), type: 'adjective', scope: 'origin' }));
    // 生年年解
    stars[yearlyIndex.nianjieIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('nianjie'), type: 'helper', scope: 'origin' }));
    return stars;
};
exports.getAdjectiveStar = getAdjectiveStar;
