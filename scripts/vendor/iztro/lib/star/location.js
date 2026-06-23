"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangQuIndexByHeavenlyStem = exports.getMonthlyStarIndex = exports.getNianjieIndex = exports.getTianshiTianshangIndex = exports.getYearlyStarIndex = exports.getDahaoIndex = exports.getJieshaAdjIndex = exports.getGuGuaIndex = exports.getHuagaiXianchiIndex = exports.getLuanXiIndex = exports.getHuoLingIndex = exports.getKongJieIndex = exports.getTimelyStarIndex = exports.getDailyStarIndex = exports.getChangQuIndex = exports.getZuoYouIndex = exports.getKuiYueIndex = exports.getLuYangTuoMaIndex = exports.getStartIndex = void 0;
var lunar_lite_1 = require("lunar-lite");
var astro_1 = require("../astro");
var data_1 = require("../data");
var i18n_1 = require("../i18n");
var utils_1 = require("../utils");
/**
 * 起紫微星诀算法
 *
 * - 六五四三二，酉午亥辰丑，
 * - 局数除日数，商数宫前走；
 * - 若见数无余，便要起虎口，
 * - 日数小於局，还直宫中守。
 *
 * 举例：
 * - 例一：27日出生木三局，以三除27，循环0次就可以整除，27➗3=9，从寅进9格，在戍安紫微。
 * - 例二：13日出生火六局，以六除13，最少需要加5才能整除， 18➗8=3，从寅进3格为辰，添加数为5（奇数），故要逆回五宫，在亥安紫微。
 * - 例三：6日出生土五局，以五除6，最少需要加4才能整除，10➗5=2，从寅进2格为卯，添加数为4（偶数），顺行4格为未，在未安紫微。
 *
 * @param solarDateStr 公历日期 YYYY-MM-DD
 * @param timeIndex 时辰索引【0～12】
 * @param fixLeap 是否调整农历闰月（若该月不是闰月则不会生效）
 * @param from 根据传入的干支起五行局来计算紫微星和天府星位置
 * @returns 紫微和天府星所在宫位索引
 */
var getStartIndex = function (param) {
    var _a, _b;
    var solarDate = param.solarDate, timeIndex = param.timeIndex, fixLeap = param.fixLeap, from = param.from;
    var _c = (0, astro_1.getSoulAndBody)({ solarDate: solarDate, timeIndex: timeIndex, fixLeap: fixLeap }), heavenlyStemOfSoul = _c.heavenlyStemOfSoul, earthlyBranchOfSoul = _c.earthlyBranchOfSoul;
    var lunarDay = (0, lunar_lite_1.solar2lunar)(solarDate).lunarDay;
    // 如果已传入干支，则用传入干支起五行局
    // 确定用于起五行局的地盘干支
    var baseHeavenlyStem = (_a = from === null || from === void 0 ? void 0 : from.heavenlyStem) !== null && _a !== void 0 ? _a : heavenlyStemOfSoul;
    var baseEarthlyBranch = (_b = from === null || from === void 0 ? void 0 : from.earthlyBranch) !== null && _b !== void 0 ? _b : earthlyBranchOfSoul;
    // 获取五行局
    var fiveElements = (0, i18n_1.kot)((0, astro_1.getFiveElementsClass)(baseHeavenlyStem, baseEarthlyBranch));
    var fiveElementsValue = data_1.FiveElementsClass[fiveElements];
    var remainder = -1; // 余数
    var quotient; // 商
    var offset = -1; // 循环次数
    // 获取当月最大天数
    var maxDays = (0, lunar_lite_1.getTotalDaysOfLunarMonth)(solarDate);
    // 如果timeIndex等于12说明是晚子时，需要加一天
    // 如果晚子时算当天则不需要加一天
    var _day = timeIndex === 12 && (0, astro_1.getConfig)().dayDivide !== 'current' ? lunarDay + 1 : lunarDay;
    if (_day > maxDays) {
        // 假如日期超过当月最大天数，说明跨月了，需要处理为合法日期
        _day -= maxDays;
    }
    do {
        // 农历出生日（初一为1，以此类推）加上偏移量作为除数，以这个数处以五行局的数向下取整
        // 需要一直运算到余数为0为止
        offset++;
        var divisor = _day + offset;
        quotient = Math.floor(divisor / fiveElementsValue);
        remainder = divisor % fiveElementsValue;
    } while (remainder !== 0);
    // 将商除以12取余数
    quotient %= 12;
    // 以商减一（因为需要从0开始）作为起始位置
    var ziweiIndex = quotient - 1;
    if (offset % 2 === 0) {
        // 若循环次数为偶数，则索引逆时针数到循环数
        ziweiIndex += offset;
    }
    else {
        // 若循环次数为偶数，则索引顺时针数到循环数
        ziweiIndex -= offset;
    }
    ziweiIndex = (0, utils_1.fixIndex)(ziweiIndex);
    // 天府星位置与紫微星相对
    var tianfuIndex = (0, utils_1.fixIndex)(12 - ziweiIndex);
    return { ziweiIndex: ziweiIndex, tianfuIndex: tianfuIndex };
};
exports.getStartIndex = getStartIndex;
/**
 * 按年干支计算禄存、擎羊，陀罗、天马的索引
 *
 * 定禄存、羊、陀诀（按年干）
 *
 * - 甲禄到寅宫，乙禄居卯府。
 * - 丙戊禄在巳，丁己禄在午。
 * - 庚禄定居申，辛禄酉上补。
 * - 壬禄亥中藏，癸禄居子户。
 * - 禄前羊刃当，禄后陀罗府。
 *
 * 安天马（按年支），天马只会出现在四马地【寅申巳亥】
 *
 * - 寅午戍流马在申，申子辰流马在寅。
 * - 巳酉丑流马在亥，亥卯未流马在巳。
 *
 * @param heavenlyStemName 天干
 * @param earthlyBranchName 地支
 * @returns 禄存、擎羊，陀罗、天马的索引
 */
var getLuYangTuoMaIndex = function (heavenlyStemName, earthlyBranchName) {
    var luIndex = -1; // 禄存索引
    var maIndex = 0; // 天马索引
    var heavenlyStem = (0, i18n_1.kot)(heavenlyStemName, 'Heavenly');
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    switch (earthlyBranch) {
        case 'yinEarthly':
        case 'wuEarthly':
        case 'xuEarthly':
            maIndex = (0, utils_1.fixEarthlyBranchIndex)('shen');
            break;
        case 'shenEarthly':
        case 'ziEarthly':
        case 'chenEarthly':
            maIndex = (0, utils_1.fixEarthlyBranchIndex)('yin');
            break;
        case 'siEarthly':
        case 'youEarthly':
        case 'chouEarthly':
            maIndex = (0, utils_1.fixEarthlyBranchIndex)('hai');
            break;
        case 'haiEarthly':
        case 'maoEarthly':
        case 'weiEarthly':
            maIndex = (0, utils_1.fixEarthlyBranchIndex)('si');
            break;
    }
    switch (heavenlyStem) {
        case 'jiaHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('yin');
            break;
        }
        case 'yiHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('mao');
            break;
        }
        case 'bingHeavenly':
        case 'wuHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('si');
            break;
        }
        case 'dingHeavenly':
        case 'jiHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('woo');
            break;
        }
        case 'gengHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('shen');
            break;
        }
        case 'xinHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('you');
            break;
        }
        case 'renHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('hai');
            break;
        }
        case 'guiHeavenly': {
            luIndex = (0, utils_1.fixEarthlyBranchIndex)('zi');
            break;
        }
    }
    return {
        luIndex: luIndex,
        maIndex: maIndex,
        yangIndex: (0, utils_1.fixIndex)(luIndex + 1),
        tuoIndex: (0, utils_1.fixIndex)(luIndex - 1),
    };
};
exports.getLuYangTuoMaIndex = getLuYangTuoMaIndex;
/**
 * 获取天魁天钺所在宫位索引（按年干）
 *
 * - 甲戊庚之年丑未
 * - 乙己之年子申
 * - 辛年午寅
 * - 壬癸之年卯巳
 * - 丙丁之年亥酉
 *
 * @param heavenlyStemName 天干
 * @returns
 */
var getKuiYueIndex = function (heavenlyStemName) {
    var kuiIndex = -1;
    var yueIndex = -1;
    var heavenlyStem = (0, i18n_1.kot)(heavenlyStemName, 'Heavenly');
    switch (heavenlyStem) {
        case 'jiaHeavenly':
        case 'wuHeavenly':
        case 'gengHeavenly':
            kuiIndex = (0, utils_1.fixEarthlyBranchIndex)('chou');
            yueIndex = (0, utils_1.fixEarthlyBranchIndex)('wei');
            break;
        case 'yiHeavenly':
        case 'jiHeavenly':
            kuiIndex = (0, utils_1.fixEarthlyBranchIndex)('zi');
            yueIndex = (0, utils_1.fixEarthlyBranchIndex)('shen');
            break;
        case 'xinHeavenly':
            kuiIndex = (0, utils_1.fixEarthlyBranchIndex)('woo');
            yueIndex = (0, utils_1.fixEarthlyBranchIndex)('yin');
            break;
        case 'bingHeavenly':
        case 'dingHeavenly':
            kuiIndex = (0, utils_1.fixEarthlyBranchIndex)('hai');
            yueIndex = (0, utils_1.fixEarthlyBranchIndex)('you');
            break;
        case 'renHeavenly':
        case 'guiHeavenly':
            kuiIndex = (0, utils_1.fixEarthlyBranchIndex)('mao');
            yueIndex = (0, utils_1.fixEarthlyBranchIndex)('si');
            break;
    }
    return { kuiIndex: kuiIndex, yueIndex: yueIndex };
};
exports.getKuiYueIndex = getKuiYueIndex;
/**
 * 获取左辅右弼的索引（按生月）
 *
 * - 辰上顺正寻左辅
 * - 戌上逆正右弼当
 *
 * 解释：
 *
 * - 从辰顺数农历月份数是左辅的索引
 * - 从戌逆数农历月份数是右弼的索引
 *
 * @param lunarMonth 农历月份
 * @returns 左辅、右弼索引
 */
var getZuoYouIndex = function (lunarMonth) {
    var zuoIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('chen') + (lunarMonth - 1));
    var youIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('xu') - (lunarMonth - 1));
    return { zuoIndex: zuoIndex, youIndex: youIndex };
};
exports.getZuoYouIndex = getZuoYouIndex;
/**
 * 获取文昌文曲的索引（按时支）
 *
 * - 辰上顺时文曲位
 * - 戌上逆时觅文昌
 *
 * 解释：
 *
 * - 从辰顺数到时辰地支索引是文曲的索引
 * - 从戌逆数到时辰地支索引是文昌的索引
 *
 * 由于时辰地支的索引即是时辰的序号，所以可以直接使用时辰的序号
 *
 * @param timeIndex 时辰索引【0～12】
 * @returns 文昌、文曲索引
 */
var getChangQuIndex = function (timeIndex) {
    var changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('xu') - (0, utils_1.fixIndex)(timeIndex));
    var quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('chen') + (0, utils_1.fixIndex)(timeIndex));
    return { changIndex: changIndex, quIndex: quIndex };
};
exports.getChangQuIndex = getChangQuIndex;
/**
 * 获取日系星索引，包括
 *
 * 三台，八座，恩光，天贵
 *
 * - 安三台八座
 *   - 由左辅之宫位起初一，顺行至生日安三台。
 *   - 由右弼之宫位起初一，逆行至生日安八座。
 *
 * - 安恩光天贵
 *   - 由文昌之宫位起初一，顺行至生日再退一步起恩光。
 *   - 由文曲之宫位起初一，顺行至生日再退一步起天贵。
 *
 * @param solarDateStr 阳历日期
 * @param timeIndex 时辰索引【0～12】
 * @returns 三台，八座索引
 */
var getDailyStarIndex = function (solarDateStr, timeIndex, fixLeap) {
    var lunarDay = (0, lunar_lite_1.solar2lunar)(solarDateStr).lunarDay;
    var monthIndex = (0, utils_1.fixLunarMonthIndex)(solarDateStr, timeIndex, fixLeap);
    // 此处获取到的是索引，下标是从0开始的，所以需要加1
    var _a = (0, exports.getZuoYouIndex)(monthIndex + 1), zuoIndex = _a.zuoIndex, youIndex = _a.youIndex;
    var _b = (0, exports.getChangQuIndex)(timeIndex), changIndex = _b.changIndex, quIndex = _b.quIndex;
    var dayIndex = (0, utils_1.fixLunarDayIndex)(lunarDay, timeIndex);
    var santaiIndex = (0, utils_1.fixIndex)((zuoIndex + dayIndex) % 12);
    var bazuoIndex = (0, utils_1.fixIndex)((youIndex - dayIndex) % 12);
    var enguangIndex = (0, utils_1.fixIndex)(((changIndex + dayIndex) % 12) - 1);
    var tianguiIndex = (0, utils_1.fixIndex)(((quIndex + dayIndex) % 12) - 1);
    return { santaiIndex: santaiIndex, bazuoIndex: bazuoIndex, enguangIndex: enguangIndex, tianguiIndex: tianguiIndex };
};
exports.getDailyStarIndex = getDailyStarIndex;
/**
 * 获取时系星耀索引，包括台辅，封诰
 *
 * @param timeIndex 时辰序号【0～12】
 * @returns 台辅，封诰索引
 */
var getTimelyStarIndex = function (timeIndex) {
    var taifuIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('woo') + (0, utils_1.fixIndex)(timeIndex));
    var fenggaoIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('yin') + (0, utils_1.fixIndex)(timeIndex));
    return { taifuIndex: taifuIndex, fenggaoIndex: fenggaoIndex };
};
exports.getTimelyStarIndex = getTimelyStarIndex;
/**
 * 获取地空地劫的索引（按时支）
 *
 * - 亥上子时顺安劫
 * - 逆回便是地空亡
 *
 * 解释：
 *
 * - 从亥顺数到时辰地支索引是地劫的索引
 * - 从亥逆数到时辰地支索引是地空的索引
 *
 * 由于时辰地支的索引即是时辰的序号，所以可以直接使用时辰的序号
 *
 * @param timeIndex 时辰索引【0～12】
 * @returns 地空、地劫索引
 */
var getKongJieIndex = function (timeIndex) {
    var fixedTimeIndex = (0, utils_1.fixIndex)(timeIndex);
    var haiIndex = (0, utils_1.fixEarthlyBranchIndex)('hai');
    var kongIndex = (0, utils_1.fixIndex)(haiIndex - fixedTimeIndex);
    var jieIndex = (0, utils_1.fixIndex)(haiIndex + fixedTimeIndex);
    return { kongIndex: kongIndex, jieIndex: jieIndex };
};
exports.getKongJieIndex = getKongJieIndex;
/**
 * 获取火星铃星索引（按年支以及时支）
 *
 * - 申子辰人寅戌扬
 * - 寅午戌人丑卯方
 * - 巳酉丑人卯戌位
 * - 亥卯未人酉戌房
 *
 * 起火铃二耀先据出生年支，依口诀定火铃起子时位。
 *
 * 例如壬辰年卯时生人，据[申子辰人寅戌扬]口诀，故火星在寅宫起子时，铃星在戌宫起子时，顺数至卯时，即火星在巳，铃星在丑。
 *
 * @param earthlyBranchName 地支
 * @param timeIndex 时辰序号
 * @returns 火星、铃星索引
 */
var getHuoLingIndex = function (earthlyBranchName, timeIndex) {
    var huoIndex = -1;
    var lingIndex = -1;
    var fixedTimeIndex = (0, utils_1.fixIndex)(timeIndex);
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    switch (earthlyBranch) {
        case 'yinEarthly':
        case 'wuEarthly':
        case 'xuEarthly': {
            huoIndex = (0, utils_1.fixEarthlyBranchIndex)('chou') + fixedTimeIndex;
            lingIndex = (0, utils_1.fixEarthlyBranchIndex)('mao') + fixedTimeIndex;
            break;
        }
        case 'shenEarthly':
        case 'ziEarthly':
        case 'chenEarthly': {
            huoIndex = (0, utils_1.fixEarthlyBranchIndex)('yin') + fixedTimeIndex;
            lingIndex = (0, utils_1.fixEarthlyBranchIndex)('xu') + fixedTimeIndex;
            break;
        }
        case 'siEarthly':
        case 'youEarthly':
        case 'chouEarthly': {
            huoIndex = (0, utils_1.fixEarthlyBranchIndex)('mao') + fixedTimeIndex;
            lingIndex = (0, utils_1.fixEarthlyBranchIndex)('xu') + fixedTimeIndex;
            break;
        }
        case 'haiEarthly':
        case 'weiEarthly':
        case 'maoEarthly': {
            huoIndex = (0, utils_1.fixEarthlyBranchIndex)('you') + fixedTimeIndex;
            lingIndex = (0, utils_1.fixEarthlyBranchIndex)('xu') + fixedTimeIndex;
            break;
        }
    }
    return {
        huoIndex: (0, utils_1.fixIndex)(huoIndex),
        lingIndex: (0, utils_1.fixIndex)(lingIndex),
    };
};
exports.getHuoLingIndex = getHuoLingIndex;
/**
 * 获取红鸾天喜所在宫位索引
 *
 * - 卯上起子逆数之
 * - 数到当生太岁支
 * - 坐守此宫红鸾位
 * - 对宫天喜不差移
 *
 * @param earthlyBranchName 年支
 * @returns 红鸾、天喜索引
 */
var getLuanXiIndex = function (earthlyBranchName) {
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    var hongluanIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('mao') - data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var tianxiIndex = (0, utils_1.fixIndex)(hongluanIndex + 6);
    return { hongluanIndex: hongluanIndex, tianxiIndex: tianxiIndex };
};
exports.getLuanXiIndex = getLuanXiIndex;
/**
 * 安华盖
 * - 子辰申年在辰，丑巳酉年在丑
 * - 寅午戍年在戍，卯未亥年在未。
 *
 * 安咸池
 * - 子辰申年在酉，丑巳酉年在午
 * - 寅午戍年在卯，卯未亥年在子。
 *
 * @param earthlyBranchName 地支
 * @returns 华盖、咸池索引
 */
var getHuagaiXianchiIndex = function (earthlyBranchName) {
    var hgIdx = -1;
    var xcIdx = -1;
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    switch (earthlyBranch) {
        case 'yinEarthly':
        case 'wuEarthly':
        case 'xuEarthly': {
            hgIdx = (0, utils_1.fixEarthlyBranchIndex)('xu');
            xcIdx = (0, utils_1.fixEarthlyBranchIndex)('mao');
            break;
        }
        case 'shenEarthly':
        case 'ziEarthly':
        case 'chenEarthly': {
            hgIdx = (0, utils_1.fixEarthlyBranchIndex)('chen');
            xcIdx = (0, utils_1.fixEarthlyBranchIndex)('you');
            break;
        }
        case 'siEarthly':
        case 'youEarthly':
        case 'chouEarthly': {
            hgIdx = (0, utils_1.fixEarthlyBranchIndex)('chou');
            xcIdx = (0, utils_1.fixEarthlyBranchIndex)('woo');
            break;
        }
        case 'haiEarthly':
        case 'weiEarthly':
        case 'maoEarthly': {
            hgIdx = (0, utils_1.fixEarthlyBranchIndex)('wei');
            xcIdx = (0, utils_1.fixEarthlyBranchIndex)('zi');
            break;
        }
    }
    return {
        huagaiIndex: (0, utils_1.fixIndex)(hgIdx),
        xianchiIndex: (0, utils_1.fixIndex)(xcIdx),
    };
};
exports.getHuagaiXianchiIndex = getHuagaiXianchiIndex;
/**
 * 安孤辰寡宿
 * - 寅卯辰年安巳丑
 * - 巳午未年安申辰
 * - 申酉戍年安亥未
 * - 亥子丑年安寅戍。
 *
 * @param earthlyBranchName 地支
 * @returns 孤辰、寡宿索引
 */
var getGuGuaIndex = function (earthlyBranchName) {
    var guIdx = -1;
    var guaIdx = -1;
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    switch (earthlyBranch) {
        case 'yinEarthly':
        case 'maoEarthly':
        case 'chenEarthly': {
            guIdx = (0, utils_1.fixEarthlyBranchIndex)('si');
            guaIdx = (0, utils_1.fixEarthlyBranchIndex)('chou');
            break;
        }
        case 'siEarthly':
        case 'wuEarthly':
        case 'weiEarthly': {
            guIdx = (0, utils_1.fixEarthlyBranchIndex)('shen');
            guaIdx = (0, utils_1.fixEarthlyBranchIndex)('chen');
            break;
        }
        case 'shenEarthly':
        case 'youEarthly':
        case 'xuEarthly': {
            guIdx = (0, utils_1.fixEarthlyBranchIndex)('hai');
            guaIdx = (0, utils_1.fixEarthlyBranchIndex)('wei');
            break;
        }
        case 'haiEarthly':
        case 'ziEarthly':
        case 'chouEarthly': {
            guIdx = (0, utils_1.fixEarthlyBranchIndex)('yin');
            guaIdx = (0, utils_1.fixEarthlyBranchIndex)('xu');
            break;
        }
    }
    return {
        guchenIndex: (0, utils_1.fixIndex)(guIdx),
        guasuIndex: (0, utils_1.fixIndex)(guaIdx),
    };
};
exports.getGuGuaIndex = getGuGuaIndex;
/**
 * 安劫杀诀（年支）
 * 申子辰人蛇开口、亥卯未人猴速走
 * 寅午戌人猪面黑、巳酉丑人虎咆哮
 *
 * @version v2.5.0
 *
 * @param earthlyBranchKey 生年地支
 * @returns {number} 劫杀索引
 */
var getJieshaAdjIndex = function (earthlyBranchKey) {
    switch (earthlyBranchKey) {
        case 'shenEarthly':
        case 'ziEarthly':
        case 'chenEarthly':
            return 3;
        case 'haiEarthly':
        case 'maoEarthly':
        case 'weiEarthly':
            return 6;
        case 'yinEarthly':
        case 'wuEarthly':
        case 'xuEarthly':
            return 9;
        case 'siEarthly':
        case 'youEarthly':
        case 'chouEarthly':
            return 0;
    }
};
exports.getJieshaAdjIndex = getJieshaAdjIndex;
/**
 * 安大耗诀（年支）
 * 但用年支去对冲、阴阳移位过一宫
 * 阳顺阴逆移其位、大耗原来不可逢
 *
 * 大耗安法，是在年支之对宫，前一位或后一位安星。阳支顺行前一位，阴支逆行后一位。
 *
 * @param earthlyBranchKey 生年地支
 * @returns {number} 大耗索引
 */
var getDahaoIndex = function (earthlyBranchKey) {
    var matched = [
        'weiEarthly',
        'wuEarthly',
        'youEarthly',
        'shenEarthly',
        'haiEarthly',
        'xuEarthly',
        'chouEarthly',
        'ziEarthly',
        'maoEarthly',
        'yinEarthly',
        'siEarthly',
        'chenEarthly',
    ][data_1.EARTHLY_BRANCHES.indexOf(earthlyBranchKey)];
    // 因为宫位是以寅宫开始排的，所以需要 -2 来对齐
    return (0, utils_1.fixIndex)(data_1.EARTHLY_BRANCHES.indexOf(matched) - 2);
};
exports.getDahaoIndex = getDahaoIndex;
/**
 * 获取年系星的索引，包括
 * 咸池，华盖，孤辰，寡宿, 天厨，破碎，天才，天寿，蜚蠊, 龙池，凤阁，天哭，天虚，
 * 天官，天福
 *
 * - 安天才天寿
 *   - 天才由命宫起子，顺行至本生年支安之。天寿由身宫起子，顺行至本生年支安之。
 *
 * - 安破碎
 *   - 子午卯酉年安巳宫，寅申巳亥年安酉宫，辰戍丑未年安丑宫。
 *
 * - 安天厨
 *   - 甲丁食蛇口，乙戊辛马方。丙从鼠口得，己食于猴房。庚食虎头上，壬鸡癸猪堂。
 *
 * - 安蜚蠊
 *   - 子丑寅年在申酉戍，卯辰巳年在巳午未，午未申年在寅卯辰，酉戍亥年在亥子丑。
 *
 * - 安龙池凤阁
 *   - 龙池从辰宫起子，顺至本生年支安之。凤阁从戍宫起子，逆行至本生年支安之。
 *
 * - 安天哭天虚
 *   - 天哭天虚起午宫，午宫起子两分踪，哭逆行兮虚顺转，数到生年便停留。
 *
 * - 安天官天福
 *   - 甲喜羊鸡乙龙猴，丙年蛇鼠一窝谋。丁虎擒猪戊玉兔，
 *   - 己鸡居然与虎俦。庚猪马辛鸡蛇走，壬犬马癸马蛇游。
 *
 * - 安截路空亡（截空）
 *   - 甲己之年申酉，乙庚之年午未，
 *   - 丙辛之年辰巳，丁壬之年寅卯，
 *   - 戊癸之年子丑。
 *
 * - 安天空
 *   - 生年支顺数的前一位就是。
 * @param solarDate 阳历日期
 * @param timeIndex 时辰序号
 * @param gender 性别
 * @param fixLeap 是否修复闰月，假如当月不是闰月则不生效
 */
var getYearlyStarIndex = function (param) {
    var solarDate = param.solarDate, timeIndex = param.timeIndex, gender = param.gender, fixLeap = param.fixLeap;
    var horoscopeDivide = (0, astro_1.getConfig)().horoscopeDivide;
    var yearly = (0, lunar_lite_1.getHeavenlyStemAndEarthlyBranchBySolarDate)(solarDate, timeIndex, {
        // 流耀应该用立春为界，但为了满足不同流派的需求允许配置
        year: horoscopeDivide,
    }).yearly;
    var _a = (0, astro_1.getSoulAndBody)({ solarDate: solarDate, timeIndex: timeIndex, fixLeap: fixLeap }), soulIndex = _a.soulIndex, bodyIndex = _a.bodyIndex;
    var heavenlyStem = (0, i18n_1.kot)(yearly[0], 'Heavenly');
    var earthlyBranch = (0, i18n_1.kot)(yearly[1], 'Earthly');
    var _b = (0, exports.getHuagaiXianchiIndex)(yearly[1]), huagaiIndex = _b.huagaiIndex, xianchiIndex = _b.xianchiIndex;
    var _c = (0, exports.getGuGuaIndex)(yearly[1]), guchenIndex = _c.guchenIndex, guasuIndex = _c.guasuIndex;
    var tiancaiIndex = (0, utils_1.fixIndex)(soulIndex + data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var tianshouIndex = (0, utils_1.fixIndex)(bodyIndex + data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var tianchuIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['si', 'woo', 'zi', 'si', 'woo', 'shen', 'yin', 'woo', 'you', 'hai'][data_1.HEAVENLY_STEMS.indexOf(heavenlyStem)]));
    var posuiIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['si', 'chou', 'you'][data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch) % 3]));
    var feilianIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['shen', 'you', 'xu', 'si', 'woo', 'wei', 'yin', 'mao', 'chen', 'hai', 'zi', 'chou'][data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch)]));
    var longchiIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('chen') + data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var fenggeIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('xu') - data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var tiankuIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('woo') - data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var tianxuIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('woo') + data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var tianguanIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['wei', 'chen', 'si', 'yin', 'mao', 'you', 'hai', 'you', 'xu', 'woo'][data_1.HEAVENLY_STEMS.indexOf(heavenlyStem)]));
    var tianfuIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['you', 'shen', 'zi', 'hai', 'mao', 'yin', 'woo', 'si', 'woo', 'si'][data_1.HEAVENLY_STEMS.indexOf(heavenlyStem)]));
    var tiandeIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('you') + data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var yuedeIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('si') + data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch));
    var tiankongIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(yearly[1]) + 1);
    var jieluIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['shen', 'woo', 'chen', 'yin', 'zi'][data_1.HEAVENLY_STEMS.indexOf(heavenlyStem) % 5]));
    var kongwangIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['you', 'wei', 'si', 'mao', 'chou'][data_1.HEAVENLY_STEMS.indexOf(heavenlyStem) % 5]));
    var xunkongIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(yearly[1]) + data_1.HEAVENLY_STEMS.indexOf('guiHeavenly') - data_1.HEAVENLY_STEMS.indexOf(heavenlyStem) + 1);
    // 判断命主出生年年支阴阳属性，如果结果为 0 则为阳，否则为阴
    var yinyang = data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch) % 2;
    if (yinyang !== xunkongIndex % 2) {
        // 若命主出生年支阴阳属性与初始旬空宫位的阴阳属性不同，则+1
        xunkongIndex = (0, utils_1.fixIndex)(xunkongIndex + 1);
    }
    // 中州派没有截路空亡，只有一颗截空星
    // 生年阳干在阳宫，阴干在阴宫
    var jiekongIndex = yinyang === 0 ? jieluIndex : kongwangIndex;
    var jieshaAdjIndex = (0, exports.getJieshaAdjIndex)(earthlyBranch);
    var nianjieIndex = (0, exports.getNianjieIndex)(yearly[1]);
    var dahaoAdjIndex = (0, exports.getDahaoIndex)(earthlyBranch);
    var _d = (0, exports.getTianshiTianshangIndex)(gender, earthlyBranch, soulIndex), tianshiIndex = _d.tianshiIndex, tianshangIndex = _d.tianshangIndex;
    return {
        xianchiIndex: xianchiIndex,
        huagaiIndex: huagaiIndex,
        guchenIndex: guchenIndex,
        guasuIndex: guasuIndex,
        tiancaiIndex: tiancaiIndex,
        tianshouIndex: tianshouIndex,
        tianchuIndex: tianchuIndex,
        posuiIndex: posuiIndex,
        feilianIndex: feilianIndex,
        longchiIndex: longchiIndex,
        fenggeIndex: fenggeIndex,
        tiankuIndex: tiankuIndex,
        tianxuIndex: tianxuIndex,
        tianguanIndex: tianguanIndex,
        tianfuIndex: tianfuIndex,
        tiandeIndex: tiandeIndex,
        yuedeIndex: yuedeIndex,
        tiankongIndex: tiankongIndex,
        jieluIndex: jieluIndex,
        kongwangIndex: kongwangIndex,
        xunkongIndex: xunkongIndex,
        tianshangIndex: tianshangIndex,
        tianshiIndex: tianshiIndex,
        jiekongIndex: jiekongIndex,
        jieshaAdjIndex: jieshaAdjIndex,
        nianjieIndex: nianjieIndex,
        dahaoAdjIndex: dahaoAdjIndex,
    };
};
exports.getYearlyStarIndex = getYearlyStarIndex;
var getTianshiTianshangIndex = function (gender, earthlyBranch, soulIndex) {
    var _a;
    // 判断命主出生年年支阴阳属性，如果结果为 0 则为阳，否则为阴
    var yinyang = data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch) % 2;
    var algorithm = (0, astro_1.getConfig)().algorithm;
    var genderYinyang = ['male', 'female'];
    var sameYinyang = yinyang === genderYinyang.indexOf((0, i18n_1.kot)(gender));
    var tianshangIndex = (0, utils_1.fixIndex)(data_1.PALACES.indexOf('friendsPalace') + soulIndex);
    var tianshiIndex = (0, utils_1.fixIndex)(data_1.PALACES.indexOf('healthPalace') + soulIndex);
    if (algorithm === 'zhongzhou' && !sameYinyang) {
        // 中州派的天使天伤与通行版本不一样
        // 天伤奴仆、天使疾厄、夹迁移宫最易寻得
        // 凡阳男阴女，皆依此诀，但若为阴男阳女，则改为天伤居疾厄、天使居奴仆。
        _a = [tianshangIndex, tianshiIndex], tianshiIndex = _a[0], tianshangIndex = _a[1];
    }
    return { tianshangIndex: tianshangIndex, tianshiIndex: tianshiIndex };
};
exports.getTianshiTianshangIndex = getTianshiTianshangIndex;
/**
 * 获取年解的索引
 *
 * - 年解（按年支）
 *   - 解神从戌上起子，逆数至当生年太岁上是也
 *
 * @param earthlyBranch 地支（年）
 * @returns 年解索引
 */
var getNianjieIndex = function (earthlyBranchName) {
    var earthlyBranch = (0, i18n_1.kot)(earthlyBranchName, 'Earthly');
    return (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['xu', 'you', 'shen', 'wei', 'woo', 'si', 'chen', 'mao', 'yin', 'chou', 'zi', 'hai'][data_1.EARTHLY_BRANCHES.indexOf(earthlyBranch)]));
};
exports.getNianjieIndex = getNianjieIndex;
/**
 * 获取以月份索引为基准的星耀索引，包括解神，天姚，天刑，阴煞，天月，天巫
 * 解神分为年解和月解，月解作用更加直接快速，年解稍迟钝，且作用力没有月解那么大
 *
 * - 月解（按生月）
 *   - 正二在申三四在戍，五六在子七八在寅，九十月坐於辰宫，十一十二在午宫。
 *
 * - 安天刑天姚（三合必见）
 *   - 天刑从酉起正月，顺至生月便安之。天姚丑宫起正月，顺到生月即停留。
 *
 * - 安阴煞
 *   - 正七月在寅，二八月在子，三九月在戍，四十月在申，五十一在午，六十二在辰。
 *
 * - 安天月
 *   - 一犬二蛇三在龙，四虎五羊六兔宫。七猪八羊九在虎，十马冬犬腊寅中。
 *
 * - 安天巫
 *   - 正五九月在巳，二六十月在申，三七十一在寅，四八十二在亥。
 *
 * @param solarDate 阳历日期
 * @param timeIndex 时辰序号
 * @param fixLeap 是否修复闰月，假如当月不是闰月则不生效
 * @returns
 */
var getMonthlyStarIndex = function (solarDate, timeIndex, fixLeap) {
    var monthIndex = (0, utils_1.fixLunarMonthIndex)(solarDate, timeIndex, fixLeap);
    var jieshenIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['shen', 'xu', 'zi', 'yin', 'chen', 'woo'][Math.floor(monthIndex / 2)]));
    var tianyaoIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('chou') + monthIndex);
    var tianxingIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('you') + monthIndex);
    var yinshaIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['yin', 'zi', 'xu', 'shen', 'woo', 'chen'][monthIndex % 6]));
    var tianyueIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['xu', 'si', 'chen', 'yin', 'wei', 'mao', 'hai', 'wei', 'yin', 'woo', 'xu', 'yin'][monthIndex]));
    var tianwuIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)(['si', 'shen', 'yin', 'hai'][monthIndex % 4]));
    return {
        yuejieIndex: jieshenIndex,
        tianyaoIndex: tianyaoIndex,
        tianxingIndex: tianxingIndex,
        yinshaIndex: yinshaIndex,
        tianyueIndex: tianyueIndex,
        tianwuIndex: tianwuIndex,
    };
};
exports.getMonthlyStarIndex = getMonthlyStarIndex;
/**
 * 通过 大限/流年 天干获取流昌流曲
 *
 * - 流昌起巳位	甲乙顺流去
 * - 不用四墓宫	日月同年岁
 * - 流曲起酉位	甲乙逆行踪
 * - 亦不用四墓	年日月相同
 *
 * @param heavenlyStemName 天干
 * @returns 文昌、文曲索引
 */
var getChangQuIndexByHeavenlyStem = function (heavenlyStemName) {
    var changIndex = -1;
    var quIndex = -1;
    var heavenlyStem = (0, i18n_1.kot)(heavenlyStemName, 'Heavenly');
    switch (heavenlyStem) {
        case 'jiaHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('si'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('you'));
            break;
        case 'yiHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('woo'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('shen'));
            break;
        case 'bingHeavenly':
        case 'wuHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('shen'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('woo'));
            break;
        case 'dingHeavenly':
        case 'jiHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('you'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('si'));
            break;
        case 'gengHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('hai'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('mao'));
            break;
        case 'xinHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('zi'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('yin'));
            break;
        case 'renHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('yin'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('zi'));
            break;
        case 'guiHeavenly':
            changIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('mao'));
            quIndex = (0, utils_1.fixIndex)((0, utils_1.fixEarthlyBranchIndex)('hai'));
            break;
    }
    return { changIndex: changIndex, quIndex: quIndex };
};
exports.getChangQuIndexByHeavenlyStem = getChangQuIndexByHeavenlyStem;
