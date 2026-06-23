"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMajorStarByLunarDate = exports.getMajorStarBySolarDate = exports.getSignByLunarDate = exports.getSignBySolarDate = exports.getZodiacBySolarDate = exports.getConfig = exports.config = exports.loadPlugin = exports.loadPlugins = void 0;
exports.astrolabeBySolarDate = astrolabeBySolarDate;
exports.bySolar = bySolar;
exports.astrolabeByLunarDate = astrolabeByLunarDate;
exports.byLunar = byLunar;
exports.rearrangeAstrolable = rearrangeAstrolable;
exports.withOptions = withOptions;
var lunar_lite_1 = require("lunar-lite");
var data_1 = require("../data");
var i18n_1 = require("../i18n");
var star_1 = require("../star");
var utils_1 = require("../utils");
var FunctionalAstrolabe_1 = __importDefault(require("./FunctionalAstrolabe"));
var FunctionalPalace_1 = __importDefault(require("./FunctionalPalace"));
var palace_1 = require("./palace");
var FunctionalStar_1 = __importDefault(require("../star/FunctionalStar"));
var _plugins = [];
var _mutagens = {};
var _brightness = {};
/**
 * 年分界点参数，默认为立春分界。
 *
 * @version v2.4.0
 *
 * normal：正月初一分界
 * exact：立春分界
 */
var _yearDivide = 'normal';
var _horoscopeDivide = 'normal';
/**
 * 小限分割点，默认为生日。
 *
 * @version v2.4.5
 * @default 'normal'
 *
 * normal: 只考虑年份，不考虑生日
 * birthday: 以生日为分界点
 */
var _ageDivide = 'normal';
var _dayDivide = 'forward';
/**
 * 排盘派别设置。
 *
 * @version v2.5.0
 * @default 'default'
 *
 * default: 以《紫微斗数全书》为基础安星
 * zhongzhou: 以中州派安星法为基础安星
 */
var _algorithm = 'default';
/**
 * 批量加载插件
 *
 * @version v2.3.0
 *
 * @param plugins 插件方法数组
 */
var loadPlugins = function (plugins) {
    Array.prototype.push.apply(_plugins, plugins);
};
exports.loadPlugins = loadPlugins;
/**
 * 加载单个插件
 *
 * @version v2.3.0
 *
 * @param plugin 插件方法
 */
var loadPlugin = function (plugin) {
    _plugins.push(plugin);
};
exports.loadPlugin = loadPlugin;
/**
 * 全局配置四化和亮度
 *
 * 由于key和value都有可能是不同语言传进来的，
 * 所以需会将key和value转化为对应的i18n key。
 *
 * @version 2.3.0
 *
 * @param {Config} param0 自定义配置
 */
var config = function (_a) {
    var mutagens = _a.mutagens, brightness = _a.brightness, _b = _a.yearDivide, yearDivide = _b === void 0 ? _yearDivide : _b, _c = _a.ageDivide, ageDivide = _c === void 0 ? _ageDivide : _c, _d = _a.horoscopeDivide, horoscopeDivide = _d === void 0 ? _horoscopeDivide : _d, _e = _a.dayDivide, dayDivide = _e === void 0 ? _dayDivide : _e, _f = _a.algorithm, algorithm = _f === void 0 ? _algorithm : _f;
    if (mutagens) {
        Object.entries(mutagens).forEach(function (_a) {
            var _b;
            var key = _a[0], value = _a[1];
            _mutagens[(0, i18n_1.kot)(key)] = (_b = value.map(function (item) { return (0, i18n_1.kot)(item); })) !== null && _b !== void 0 ? _b : [];
        });
    }
    if (brightness) {
        Object.entries(brightness).forEach(function (_a) {
            var _b;
            var key = _a[0], value = _a[1];
            _brightness[(0, i18n_1.kot)(key)] = (_b = value.map(function (item) { return (0, i18n_1.kot)(item); })) !== null && _b !== void 0 ? _b : [];
        });
    }
    _yearDivide = yearDivide;
    _horoscopeDivide = horoscopeDivide;
    _ageDivide = ageDivide;
    _algorithm = algorithm;
    _dayDivide = dayDivide;
};
exports.config = config;
var getConfig = function () { return ({
    mutagens: _mutagens,
    brightness: _brightness,
    yearDivide: _yearDivide,
    ageDivide: _ageDivide,
    dayDivide: _dayDivide,
    horoscopeDivide: _horoscopeDivide,
    algorithm: _algorithm,
}); };
exports.getConfig = getConfig;
/**
 * 通过阳历获取星盘信息
 *
 * @deprecated 此方法已在`v2.0.5`废弃，请用 `bySolar` 方法替换，参数不变
 *
 * @param solarDateStr 阳历日期【YYYY-M-D】
 * @param timeIndex 出生时辰序号【0~12】
 * @param gender 性别【男|女】
 * @param fixLeap 是否调整闰月情况【默认 true】，假入调整闰月，则闰月的前半个月算上个月，后半个月算下个月
 * @param language 输出语言
 * @returns 星盘信息
 */
function astrolabeBySolarDate(solarDateStr, timeIndex, gender, fixLeap, language) {
    if (fixLeap === void 0) { fixLeap = true; }
    return bySolar(solarDateStr, timeIndex, gender, fixLeap, language);
}
/**
 * 通过阳历获取星盘信息
 *
 * @param solarDate 阳历日期【YYYY-M-D】
 * @param timeIndex 出生时辰序号【0~12】
 * @param gender 性别【男|女】
 * @param fixLeap 是否调整闰月情况【默认 true】，假入调整闰月，则闰月的前半个月算上个月，后半个月算下个月
 * @param language 输出语言
 * @returns 星盘信息
 */
function bySolar(solarDate, timeIndex, gender, fixLeap, language) {
    if (fixLeap === void 0) { fixLeap = true; }
    language && (0, i18n_1.setLanguage)(language);
    var palaces = [];
    var dayDivide = (0, exports.getConfig)().dayDivide;
    var tIndex = timeIndex;
    if (dayDivide === 'current' && tIndex >= 12) {
        // 如果当前时辰为晚子时并且晚子时算当天时，将时辰调整为当日早子时
        tIndex = 0;
    }
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, tIndex, {
        year: (0, exports.getConfig)().yearDivide,
        month: (0, exports.getConfig)().horoscopeDivide,
    }).yearly;
    var earthlyBranchOfYear = (0, i18n_1.kot)(yearly[1], 'Earthly');
    var heavenlyStemOfYear = (0, i18n_1.kot)(yearly[0], 'Heavenly');
    var _a = (0, palace_1.getSoulAndBody)({
        solarDate: solarDate,
        timeIndex: tIndex,
        fixLeap: fixLeap,
    }), bodyIndex = _a.bodyIndex, soulIndex = _a.soulIndex, heavenlyStemOfSoul = _a.heavenlyStemOfSoul, earthlyBranchOfSoul = _a.earthlyBranchOfSoul;
    var palaceNames = (0, palace_1.getPalaceNames)(soulIndex);
    var majorStars = (0, star_1.getMajorStar)({ solarDate: solarDate, timeIndex: tIndex, fixLeap: fixLeap });
    var minorStars = (0, star_1.getMinorStar)(solarDate, tIndex, fixLeap);
    var adjectiveStars = (0, star_1.getAdjectiveStar)({
        solarDate: solarDate,
        timeIndex: tIndex,
        gender: gender,
        fixLeap: fixLeap,
    });
    var changsheng12 = (0, star_1.getchangsheng12)({
        solarDate: solarDate,
        timeIndex: tIndex,
        gender: gender,
        fixLeap: fixLeap,
    });
    var boshi12 = (0, star_1.getBoShi12)(solarDate, gender);
    var _b = (0, star_1.getYearly12)(solarDate), jiangqian12 = _b.jiangqian12, suiqian12 = _b.suiqian12;
    var _c = (0, palace_1.getHoroscope)({ solarDate: solarDate, timeIndex: tIndex, gender: gender, fixLeap: fixLeap }), decadals = _c.decadals, ages = _c.ages;
    for (var i = 0; i < 12; i++) {
        var heavenlyStemOfPalace = data_1.HEAVENLY_STEMS[(0, utils_1.fixIndex)(data_1.HEAVENLY_STEMS.indexOf((0, i18n_1.kot)(heavenlyStemOfSoul, 'Heavenly')) - soulIndex + i, 10)];
        var earthlyBranchOfPalace = data_1.EARTHLY_BRANCHES[(0, utils_1.fixIndex)(2 + i)];
        palaces.push(new FunctionalPalace_1.default({
            index: i,
            name: palaceNames[i],
            isBodyPalace: bodyIndex === i,
            isOriginalPalace: !['ziEarthly', 'chouEarthly'].includes(earthlyBranchOfPalace) && heavenlyStemOfPalace === heavenlyStemOfYear,
            heavenlyStem: (0, i18n_1.t)(heavenlyStemOfPalace),
            earthlyBranch: (0, i18n_1.t)(earthlyBranchOfPalace),
            majorStars: majorStars[i],
            minorStars: minorStars[i],
            adjectiveStars: adjectiveStars[i],
            changsheng12: changsheng12[i],
            boshi12: boshi12[i],
            jiangqian12: jiangqian12[i],
            suiqian12: suiqian12[i],
            decadal: decadals[i],
            ages: ages[i],
        }));
    }
    // 宫位是从寅宫开始，而寅的索引是2，所以需要+2
    var earthlyBranchOfSoulPalace = data_1.EARTHLY_BRANCHES[(0, utils_1.fixIndex)(soulIndex + 2)];
    var earthlyBranchOfBodyPalace = (0, i18n_1.t)(data_1.EARTHLY_BRANCHES[(0, utils_1.fixIndex)(bodyIndex + 2)]);
    var chineseDate = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, tIndex, {
        year: (0, exports.getConfig)().yearDivide,
        month: (0, exports.getConfig)().horoscopeDivide,
    });
    var lunarDate = (0, lunar_lite_1.solar2lunar)(solarDate);
    // 中州派地支以年支找命主
    // 通用派别以命宫地支找命主
    var soul = (0, i18n_1.t)(data_1.earthlyBranches[(0, exports.getConfig)().algorithm === 'zhongzhou' ? earthlyBranchOfYear : earthlyBranchOfSoulPalace].soul);
    var result = new FunctionalAstrolabe_1.default({
        gender: (0, i18n_1.t)((0, i18n_1.kot)(gender)),
        solarDate: solarDate,
        lunarDate: lunarDate.toString(true),
        chineseDate: (0, utils_1.translateChineseDate)(chineseDate),
        rawDates: { lunarDate: lunarDate, chineseDate: chineseDate },
        time: (0, i18n_1.t)(data_1.CHINESE_TIME[timeIndex]),
        timeRange: data_1.TIME_RANGE[timeIndex],
        sign: (0, exports.getSignBySolarDate)(solarDate, language),
        zodiac: (0, exports.getZodiacBySolarDate)(solarDate, language),
        earthlyBranchOfSoulPalace: (0, i18n_1.t)(earthlyBranchOfSoulPalace),
        earthlyBranchOfBodyPalace: earthlyBranchOfBodyPalace,
        soul: soul,
        body: (0, i18n_1.t)(data_1.earthlyBranches[earthlyBranchOfYear].body),
        fiveElementsClass: (0, palace_1.getFiveElementsClass)(heavenlyStemOfSoul, earthlyBranchOfSoul),
        palaces: palaces,
        copyright: "copyright \u00A9 2023-".concat(new Date().getFullYear(), " iztro (https://github.com/SylarLong/iztro)"),
    });
    _plugins.map(function (plugin) { return result.use(plugin); });
    return result;
}
/**
 * 通过农历获取星盘信息
 *
 * @deprecated 此方法已在`v2.0.5`废弃，请用 `byLunar` 方法替换，参数不变
 *
 * @param lunarDateStr 农历日期【YYYY-M-D】，例如2000年七月十七则传入 2000-7-17
 * @param timeIndex 出生时辰序号【0~12】
 * @param gender 性别【男|女】
 * @param isLeapMonth 是否闰月【默认 false】，当实际月份没有闰月时该参数不生效
 * @param fixLeap 是否调整闰月情况【默认 true】，假入调整闰月，则闰月的前半个月算上个月，后半个月算下个月
 * @param language 输出语言
 * @returns 星盘数据
 */
function astrolabeByLunarDate(lunarDateStr, timeIndex, gender, isLeapMonth, fixLeap, language) {
    if (isLeapMonth === void 0) { isLeapMonth = false; }
    if (fixLeap === void 0) { fixLeap = true; }
    return byLunar(lunarDateStr, timeIndex, gender, isLeapMonth, fixLeap, language);
}
/**
 * 通过农历获取星盘信息
 *
 * @param lunarDateStr 农历日期【YYYY-M-D】，例如2000年七月十七则传入 2000-7-17
 * @param timeIndex 出生时辰序号【0~12】
 * @param gender 性别【男|女】
 * @param isLeapMonth 是否闰月【默认 false】，当实际月份没有闰月时该参数不生效
 * @param fixLeap 是否调整闰月情况【默认 true】，假入调整闰月，则闰月的前半个月算上个月，后半个月算下个月
 * @param language 输出语言
 * @returns 星盘数据
 */
function byLunar(lunarDateStr, timeIndex, gender, isLeapMonth, fixLeap, language) {
    if (isLeapMonth === void 0) { isLeapMonth = false; }
    if (fixLeap === void 0) { fixLeap = true; }
    var solarDate = (0, lunar_lite_1.lunar2solar)(lunarDateStr, isLeapMonth);
    return bySolar(solarDate.toString(), timeIndex, gender, fixLeap, language);
}
function rearrangeAstrolable(_a) {
    var from = _a.from, astrolable = _a.astrolable, option = _a.option;
    var timeIndex = option.timeIndex, fixLeap = option.fixLeap;
    var dayDivide = (0, exports.getConfig)().dayDivide;
    var tIndex = timeIndex;
    if (dayDivide === 'current' && tIndex >= 12) {
        // 如果当前时辰为晚子时并且晚子时算当天时，将时辰调整为当日早子时
        tIndex = 0;
    }
    // 以传入地支为命宫
    var _b = (0, palace_1.getSoulAndBody)({
        solarDate: astrolable.solarDate,
        timeIndex: tIndex,
        fixLeap: fixLeap,
        from: from,
    }), soulIndex = _b.soulIndex, bodyIndex = _b.bodyIndex;
    var fiveElementsClass = (0, palace_1.getFiveElementsClass)(from.heavenlyStem, from.earthlyBranch);
    var palaceNames = (0, palace_1.getPalaceNames)(soulIndex);
    var majorStars = (0, star_1.getMajorStar)({ solarDate: astrolable.solarDate, timeIndex: tIndex, fixLeap: fixLeap, from: from });
    var changsheng12 = (0, star_1.getchangsheng12)({
        solarDate: astrolable.solarDate,
        gender: astrolable.gender,
        timeIndex: tIndex,
        fixLeap: fixLeap,
        from: from,
    });
    var _c = (0, palace_1.getHoroscope)({
        solarDate: astrolable.solarDate,
        timeIndex: tIndex,
        gender: astrolable.gender,
        fixLeap: fixLeap,
        from: from,
    }), decadals = _c.decadals, ages = _c.ages;
    astrolable.fiveElementsClass = fiveElementsClass;
    // 重新获取天使、天伤的索引
    var _d = (0, star_1.getTianshiTianshangIndex)(astrolable.gender, (0, i18n_1.kot)(astrolable.rawDates.chineseDate.yearly[1]), soulIndex), tianshiIndex = _d.tianshiIndex, tianshangIndex = _d.tianshangIndex;
    // 重新获取天才星的位置
    var tiancaiIndex = (0, utils_1.fixIndex)(soulIndex + data_1.EARTHLY_BRANCHES.indexOf((0, i18n_1.kot)(astrolable.rawDates.chineseDate.yearly[1])));
    astrolable.palaces.forEach(function (palace, i) {
        var _tianshangIdx = palace.adjectiveStars.findIndex(function (item) { return (0, i18n_1.kot)(item.name) === 'tianshang'; });
        if (_tianshangIdx !== -1 && tianshangIndex !== i) {
            // 当天伤不应该在该宫位时，删之
            palace.adjectiveStars.splice(_tianshangIdx, 1);
        }
        if (_tianshangIdx === -1 && tianshangIndex === i) {
            // 当天伤应该在该宫位却不在，加之
            palace.adjectiveStars.push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianshang'), type: 'adjective', scope: 'origin' }));
        }
        var _tianshiIdx = palace.adjectiveStars.findIndex(function (item) { return (0, i18n_1.kot)(item.name) === 'tianshi'; });
        if (_tianshiIdx !== -1 && tianshiIndex !== i) {
            // 当天使不应该在该宫位时，删之
            palace.adjectiveStars.splice(_tianshiIdx, 1);
        }
        if (_tianshiIdx === -1 && tianshiIndex === i) {
            // 当天使应该在该宫位却不在，加之
            palace.adjectiveStars.push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tianshi'), type: 'adjective', scope: 'origin' }));
        }
        var _tiancaiIndex = palace.adjectiveStars.findIndex(function (item) { return (0, i18n_1.kot)(item.name) === 'tiancai'; });
        if (_tiancaiIndex !== -1 && tiancaiIndex !== i) {
            // 当天才不应该在该宫位时，删之
            palace.adjectiveStars.splice(_tiancaiIndex, 1);
        }
        if (_tiancaiIndex === -1 && tiancaiIndex === i) {
            // 当天才应该在该宫位却不在，加之
            palace.adjectiveStars.push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('tiancai'), type: 'adjective', scope: 'origin' }));
        }
        palace.name = palaceNames[i];
        palace.majorStars = majorStars[i];
        palace.changsheng12 = changsheng12[i];
        palace.decadal = decadals[i];
        palace.ages = ages[i];
        palace.isBodyPalace = bodyIndex === i;
    });
    astrolable.earthlyBranchOfSoulPalace = (0, i18n_1.t)(astrolable.palace('命宫').earthlyBranch);
    return astrolable;
}
/**
 * 获取排盘信息。
 *
 * @param param0 排盘参数
 * @returns 星盘信息
 */
function withOptions(option) {
    var _a = option.type, type = _a === void 0 ? 'solar' : _a, dateStr = option.dateStr, timeIndex = option.timeIndex, gender = option.gender, isLeapMonth = option.isLeapMonth, fixLeap = option.fixLeap, language = option.language, astroType = option.astroType, cfg = option.config;
    if (cfg) {
        (0, exports.config)(cfg);
    }
    var result;
    if (type === 'solar') {
        result = bySolar(dateStr, timeIndex, gender, fixLeap, language);
    }
    else {
        result = byLunar(dateStr, timeIndex, gender, isLeapMonth, fixLeap, language);
    }
    switch (astroType) {
        case 'earth': {
            // 以身宫干支起五行局重排，身宫为命宫
            var bodyPalace = result.palace('身宫');
            var _b = bodyPalace, heavenlyStem = _b.heavenlyStem, earthlyBranch = _b.earthlyBranch;
            return rearrangeAstrolable({ from: { heavenlyStem: heavenlyStem, earthlyBranch: earthlyBranch }, astrolable: result, option: option });
        }
        case 'human': {
            // 以福德宫干支起五行局重排，福德宫为命宫
            var bodyPalace = result.palace('福德');
            var _c = bodyPalace, heavenlyStem = _c.heavenlyStem, earthlyBranch = _c.earthlyBranch;
            return rearrangeAstrolable({ from: { heavenlyStem: heavenlyStem, earthlyBranch: earthlyBranch }, astrolable: result, option: option });
        }
        default: {
            // 直接返回天盘
            return result;
        }
    }
}
/**
 * 通过公历获取十二生肖
 *
 * @version v1.2.1
 *
 * @param solarDateStr 阳历日期【YYYY-M-D】
 * @param language 输出语言，默认为中文
 * @returns 十二生肖
 */
var getZodiacBySolarDate = function (solarDateStr, language) {
    language && (0, i18n_1.setLanguage)(language);
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDateStr, 0, {
        year: (0, exports.getConfig)().yearDivide,
    }).yearly;
    return (0, i18n_1.t)((0, i18n_1.kot)((0, lunar_lite_1.getZodiac)(yearly[1])));
};
exports.getZodiacBySolarDate = getZodiacBySolarDate;
/**
 * 通过阳历获取星座
 *
 * @version v1.2.1
 *
 * @param solarDateStr 阳历日期【YYYY-M-D】
 * @param language 输出语言，默认为中文
 * @returns 星座
 */
var getSignBySolarDate = function (solarDateStr, language) {
    language && (0, i18n_1.setLanguage)(language);
    return (0, i18n_1.t)((0, i18n_1.kot)((0, lunar_lite_1.getSign)(solarDateStr)));
};
exports.getSignBySolarDate = getSignBySolarDate;
/**
 * 通过农历获取星座
 *
 * @version v1.2.1
 *
 * @param lunarDateStr 农历日期【YYYY-M-D】
 * @param isLeapMonth 是否闰月，如果该月没有闰月则此字段不生效
 * @param language 输出语言，默认为中文
 * @returns 星座
 */
var getSignByLunarDate = function (lunarDateStr, isLeapMonth, language) {
    language && (0, i18n_1.setLanguage)(language);
    var solarDate = (0, lunar_lite_1.lunar2solar)(lunarDateStr, isLeapMonth);
    return (0, exports.getSignBySolarDate)(solarDate.toString(), language);
};
exports.getSignByLunarDate = getSignByLunarDate;
/**
 * 通过阳历获取命宫主星
 *
 * @version v1.2.1
 *
 * @param solarDateStr 阳历日期【YYYY-M-D】
 * @param timeIndex 出生时辰序号【0~12】
 * @param fixLeap 是否调整闰月情况【默认 true】，假入调整闰月，则闰月的前半个月算上个月，后半个月算下个月
 * @param language 输出语言，默认为中文
 * @returns 命宫主星
 */
var getMajorStarBySolarDate = function (solarDateStr, timeIndex, fixLeap, language) {
    if (fixLeap === void 0) { fixLeap = true; }
    language && (0, i18n_1.setLanguage)(language);
    var soulIndex = (0, palace_1.getSoulAndBody)({ solarDate: solarDateStr, timeIndex: timeIndex, fixLeap: fixLeap }).soulIndex;
    var majorStars = (0, star_1.getMajorStar)({ solarDate: solarDateStr, timeIndex: timeIndex, fixLeap: fixLeap });
    var stars = majorStars[soulIndex].filter(function (star) { return star.type === 'major'; });
    if (stars.length) {
        return stars.map(function (star) { return (0, i18n_1.t)(star.name); }).join(',');
    }
    // 如果命宫为空宫，则借对宫主星
    return majorStars[(0, utils_1.fixIndex)(soulIndex + 6)]
        .filter(function (star) { return star.type === 'major'; })
        .map(function (star) { return (0, i18n_1.t)(star.name); })
        .join(',');
};
exports.getMajorStarBySolarDate = getMajorStarBySolarDate;
/**
 * 通过农历获取命宫主星
 *
 * @version v1.2.1
 *
 * @param lunarDateStr 农历日期【YYYY-M-D】，例如2000年七月十七则传入 2000-7-17
 * @param timeIndex 出生时辰序号【0~12】
 * @param isLeapMonth 是否闰月，如果该月没有闰月则此字段不生效
 * @param fixLeap 是否调整闰月情况【默认 true】，假入调整闰月，则闰月的前半个月算上个月，后半个月算下个月
 * @param language 输出语言，默认为中文
 * @returns 命宫主星
 */
var getMajorStarByLunarDate = function (lunarDateStr, timeIndex, isLeapMonth, fixLeap, language) {
    if (isLeapMonth === void 0) { isLeapMonth = false; }
    if (fixLeap === void 0) { fixLeap = true; }
    var solarDate = (0, lunar_lite_1.lunar2solar)(lunarDateStr, isLeapMonth);
    return (0, exports.getMajorStarBySolarDate)(solarDate.toString(), timeIndex, fixLeap, language);
};
exports.getMajorStarByLunarDate = getMajorStarByLunarDate;
