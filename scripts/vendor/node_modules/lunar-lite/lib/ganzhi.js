"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeavenlyStemAndEarthlyBranchBySolarDate = exports.getHeavenlyStemAndEarthlyBranchByLunarDate = void 0;
var constants_1 = require("./constants");
var convertor_1 = require("./convertor");
var lunar_typescript_1 = require("lunar-typescript");
var utils_1 = require("./utils");
/**
 * 通过农历获取生辰干支
 *
 * @param dateStr 农历日期 YYYY-MM-DD
 * @param timeIndex 时辰索引【0～12】
 * @param isLeap 是否为闰月
 * @returns HeavenlyStemAndEarthlyBranchResult
 */
var getHeavenlyStemAndEarthlyBranchByLunarDate = function (dateStr, timeIndex, isLeap, options) {
    if (options === void 0) { options = { year: "normal", month: "exact" }; }
    var solarDate = (0, convertor_1.lunar2solar)(dateStr, isLeap);
    return (0, exports.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate.toString(), timeIndex, options);
};
exports.getHeavenlyStemAndEarthlyBranchByLunarDate = getHeavenlyStemAndEarthlyBranchByLunarDate;
/**
 * 将阳历转化为干支纪年
 *
 * @param dateStr 公历日期 YYYY-MM-DD
 * @param timeIndex 时辰索引【0～12】
 * @returns HeavenlyStemAndEarthlyBranchResult
 */
var getHeavenlyStemAndEarthlyBranchBySolarDate = function (dateStr, timeIndex, options) {
    if (options === void 0) { options = { year: "exact" }; }
    var _a = (0, convertor_1.normalizeDateStr)(dateStr), year = _a[0], month = _a[1], date = _a[2];
    var solar = lunar_typescript_1.Solar.fromYmdHms(year, month, date, Math.max(timeIndex * 2 - 1, 0), 30, 0);
    var lunar = solar.getLunar();
    var yearlyGan = (options === null || options === void 0 ? void 0 : options.year) === "normal"
        ? lunar.getYearGan()
        : lunar.getYearGanByLiChun();
    var yearlyZhi = (options === null || options === void 0 ? void 0 : options.year) === "normal"
        ? lunar.getYearZhi()
        : lunar.getYearZhiByLiChun();
    var yearly = [
        yearlyGan,
        yearlyZhi,
    ];
    // 如果是初一换干支的话需要自己起五虎遁
    var monthly = calculateMonthlyGanZhi(yearlyGan, lunar, options === null || options === void 0 ? void 0 : options.month);
    var daily = [
        lunar.getDayGanExact(),
        lunar.getDayZhiExact(),
    ];
    var hourly = [
        lunar.getTimeGan(),
        lunar.getTimeZhi(),
    ];
    return {
        yearly: yearly,
        monthly: monthly,
        daily: daily,
        hourly: hourly,
        toString: function () {
            return "".concat(yearly.join(""), " ").concat(monthly.join(""), " ").concat(daily.join(""), " ").concat(hourly.join(""));
        },
    };
};
exports.getHeavenlyStemAndEarthlyBranchBySolarDate = getHeavenlyStemAndEarthlyBranchBySolarDate;
function calculateMonthlyGanZhi(yearlyGan, lunar, monthlyDivide) {
    if (monthlyDivide === void 0) { monthlyDivide = "exact"; }
    if (monthlyDivide === "exact") {
        // 按节气
        return [
            lunar.getMonthGanExact(),
            lunar.getMonthZhiExact(),
        ];
    }
    // 按初一
    var fixLeap = lunar.getMonth() < 0 && lunar.getDay() > 15 ? 1 : 0;
    var gan = constants_1.HEAVENLY_STEMS[(0, utils_1.fixIndex)(constants_1.HEAVENLY_STEMS.indexOf(constants_1.FIVE_TIGER[constants_1.HEAVENLY_STEMS.indexOf(yearlyGan)]) +
        Math.abs(lunar.getMonth()) -
        1 +
        fixLeap, 10)];
    var zhi = constants_1.MONTHLY_EARTHLY_BRANCHES[Math.abs(lunar.getMonth()) - 1 + fixLeap];
    return [gan, zhi];
}
