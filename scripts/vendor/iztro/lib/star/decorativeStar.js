"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYearly12 = exports.getJiangqian12StartIndex = exports.getBoShi12 = exports.getchangsheng12 = exports.getChangesheng12StartIndex = void 0;
var lunar_lite_1 = require("lunar-lite");
var astro_1 = require("../astro");
var data_1 = require("../data");
var i18n_1 = require("../i18n");
var utils_1 = require("../utils");
var location_1 = require("./location");
/**
 * 获取长生12神开始的宫位索引
 *
 * - 水二局长生在申
 * - 木三局长生在亥
 * - 金四局长生在巳
 * - 土五局长生在申
 * - 火六局长生在寅，
 * @param fiveElementClassName 五行局
 * @returns 长生12神开始的索引
 */
var getChangesheng12StartIndex = function (fiveElementClassName) {
    var fiveElementClass = (0, i18n_1.kot)(fiveElementClassName);
    var startIdx = 0;
    switch (data_1.FiveElementsClass[fiveElementClass]) {
        case 2: {
            startIdx = (0, utils_1.fixEarthlyBranchIndex)('shen');
            break;
        }
        case 3: {
            startIdx = (0, utils_1.fixEarthlyBranchIndex)('hai');
            break;
        }
        case 4: {
            startIdx = (0, utils_1.fixEarthlyBranchIndex)('si');
            break;
        }
        case 5: {
            startIdx = (0, utils_1.fixEarthlyBranchIndex)('shen');
            break;
        }
        case 6: {
            startIdx = (0, utils_1.fixEarthlyBranchIndex)('yin');
            break;
        }
    }
    return startIdx;
};
exports.getChangesheng12StartIndex = getChangesheng12StartIndex;
/**
 * 长生12神。
 *
 * 阳男阴女顺行，阴男阳女逆行，安长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝 、胎、养。
 *
 * @param {AstrolabeParam} param 通用排盘参数
 * @returns 长生12神从寅宫开始的顺序
 */
var getchangsheng12 = function (param) {
    var solarDate = param.solarDate, gender = param.gender;
    var changsheng12 = [];
    var genderKey = (0, i18n_1.kot)(gender);
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, 0, {
        year: (0, astro_1.getConfig)().yearDivide,
    }).yearly;
    var earthlyBranchNameOfYear = yearly[1];
    var earthlyBranchOfYear = (0, i18n_1.kot)(earthlyBranchNameOfYear, 'Earthly');
    // 获取命宫干支，需要通过命宫干支计算五行局
    var _a = (0, astro_1.getSoulAndBody)(param), heavenlyStemOfSoul = _a.heavenlyStemOfSoul, earthlyBranchOfSoul = _a.earthlyBranchOfSoul;
    // 获取五行局，通过五行局获取起运年龄
    var fiveElementClass = (0, astro_1.getFiveElementsClass)(heavenlyStemOfSoul, earthlyBranchOfSoul);
    // 长生12神顺序
    var stars = [
        'changsheng',
        'muyu',
        'guandai',
        'linguan',
        'diwang',
        'shuai',
        'bing',
        'si',
        'mu',
        'jue',
        'tai',
        'yang',
    ];
    var startIdx = (0, exports.getChangesheng12StartIndex)(fiveElementClass);
    for (var i = 0; i < stars.length; i++) {
        var idx = 0;
        if (data_1.GENDER[genderKey] === data_1.earthlyBranches[earthlyBranchOfYear].yinYang) {
            idx = (0, utils_1.fixIndex)(i + startIdx);
        }
        else {
            idx = (0, utils_1.fixIndex)(startIdx - i);
        }
        changsheng12[idx] = (0, i18n_1.t)(stars[i]);
    }
    return changsheng12;
};
exports.getchangsheng12 = getchangsheng12;
/**
 * 博士12神。
 *
 * 从禄存起，阳男阴女顺行，阴男阳女逆行。安博士、力士、青龙、小耗、将军、奏书、飞廉、喜神、病符、大耗、伏兵、官府。
 *
 * @param solarDateStr 阳历日期字符串
 * @param gender 性别【男｜女】
 * @returns 博士12神从寅宫开始的顺序
 */
var getBoShi12 = function (solarDateStr, gender) {
    var genderKey = (0, i18n_1.kot)(gender);
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDateStr, 0, {
        year: (0, astro_1.getConfig)().yearDivide,
    }).yearly;
    var heavenlyStemNameOfYear = yearly[0], earthlyBranchNameOfYear = yearly[1];
    var earthlyBranchOfYear = (0, i18n_1.kot)(earthlyBranchNameOfYear, 'Earthly');
    // 博士12神的顺序
    var stars = [
        'boshi',
        'lishi',
        'qinglong',
        'xiaohao',
        'jiangjun',
        'zhoushu',
        'faylian',
        'xishen',
        'bingfu',
        'dahao',
        'fubing',
        'guanfu',
    ];
    var luIndex = (0, location_1.getLuYangTuoMaIndex)(heavenlyStemNameOfYear, earthlyBranchNameOfYear).luIndex;
    var boshi12 = [];
    for (var i = 0; i < stars.length; i++) {
        // 阳男阴女顺行，阴男阳女逆部
        var idx = (0, utils_1.fixIndex)(data_1.GENDER[genderKey] === data_1.earthlyBranches[earthlyBranchOfYear].yinYang ? luIndex + i : luIndex - i);
        boshi12[idx] = (0, i18n_1.t)(stars[i]);
    }
    return boshi12;
};
exports.getBoShi12 = getBoShi12;
/**
 * 安流年将前诸星（按流年地支起将星）
 * - 寅午戍年将星午，申子辰年子将星，
 * - 巳酉丑将酉上驻，亥卯未将卯上停。
 * - 攀鞍岁驿并息神，华盖劫煞灾煞轻，
 * - 天煞指背咸池续，月煞亡神次第行。
 *
 * @param earthlyBranchName 地支
 * @returns 将前诸星起始索引
 */
var getJiangqian12StartIndex = function (earthlyBranchName) {
    var jqStartIdx = -1;
    var earthlyBranchOfYear = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    if (['yinEarthly', 'wuEarthly', 'xuEarthly'].includes(earthlyBranchOfYear)) {
        jqStartIdx = (0, utils_1.fixEarthlyBranchIndex)('woo');
    }
    else if (['shenEarthly', 'ziEarthly', 'chenEarthly'].includes(earthlyBranchOfYear)) {
        jqStartIdx = (0, utils_1.fixEarthlyBranchIndex)('zi');
    }
    else if (['siEarthly', 'youEarthly', 'chouEarthly'].includes(earthlyBranchOfYear)) {
        jqStartIdx = (0, utils_1.fixEarthlyBranchIndex)('you');
    }
    else if (['haiEarthly', 'maoEarthly', 'weiEarthly'].includes(earthlyBranchOfYear)) {
        jqStartIdx = (0, utils_1.fixEarthlyBranchIndex)('mao');
    }
    return (0, utils_1.fixIndex)(jqStartIdx);
};
exports.getJiangqian12StartIndex = getJiangqian12StartIndex;
/**
 * 流年诸星。
 *
 * - 流年岁前诸星
 *   - 流年地支起岁建，岁前首先是晦气，
 *   - 丧门贯索及官符，小耗大耗龙德继，
 *   - 白虎天德连吊客，病符居后须当记。
 *
 * - 安流年将前诸星（按流年地支起将星）
 *   - 寅午戍年将星午，申子辰年子将星，
 *   - 巳酉丑将酉上驻，亥卯未将卯上停。
 *   - 攀鞍岁驿并息神，华盖劫煞灾煞轻，
 *   - 天煞指背咸池续，月煞亡神次第行。
 *
 * @param solarDateStr 阳历日期字符串
 * @returns 流年诸星从寅宫开始的顺序
 */
var getYearly12 = function (solarDateStr) {
    var jiangqian12 = [];
    var suiqian12 = [];
    var algorithm = (0, astro_1.getConfig)().algorithm;
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDateStr, 0, {
        // 流年神煞应该用立春为界，但为了满足不同流派的需求允许配置
        year: (0, astro_1.getConfig)().horoscopeDivide,
    }).yearly;
    // 中州派的大耗叫岁破
    var ts12shen = algorithm === 'zhongzhou'
        ? [
            'suijian',
            'huiqi',
            'sangmen',
            'guansuo',
            'gwanfu',
            'xiaohao',
            'suipo',
            'longde',
            'baihu',
            'tiande',
            'diaoke',
            'bingfu',
        ]
        : [
            'suijian',
            'huiqi',
            'sangmen',
            'guansuo',
            'gwanfu',
            'xiaohao',
            'dahao',
            'longde',
            'baihu',
            'tiande',
            'diaoke',
            'bingfu',
        ];
    for (var i = 0; i < ts12shen.length; i++) {
        var idx = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(yearly[1]) + i);
        suiqian12[idx] = (0, i18n_1.t)(ts12shen[i]);
    }
    var jq12shen = [
        'jiangxing',
        'panan',
        'suiyi',
        'xiishen',
        'huagai',
        'jiesha',
        'zhaisha',
        'tiansha',
        'zhibei',
        'xianchi',
        'yuesha',
        'wangshen',
    ];
    var jiangqian12StartIndex = (0, exports.getJiangqian12StartIndex)(yearly[1]);
    for (var i = 0; i < jq12shen.length; i++) {
        var idx = (0, utils_1.fixIndex)(jiangqian12StartIndex + i);
        jiangqian12[idx] = (0, i18n_1.t)(jq12shen[i]);
    }
    return { suiqian12: suiqian12, jiangqian12: jiangqian12 };
};
exports.getYearly12 = getYearly12;
