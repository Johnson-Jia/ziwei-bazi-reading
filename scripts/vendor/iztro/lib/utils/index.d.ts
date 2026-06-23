import { Brightness, EarthlyBranchName, HeavenlyStemName, Mutagen, StarName } from '../i18n';
import FunctionalStar from '../star/FunctionalStar';
import { HeavenlyStemAndEarthlyBranchDate } from 'lunar-lite/lib/types';
/**
 * 用于处理索引，将索引锁定在 0~max 范围内
 *
 * @param index 当前索引
 * @param max 最大循环数，默认为12【因为12用得最多，宫位数量以及十二地支数量都为12，所以将12作为默认值】
 * @returns {number} 处理后的索引
 */
export declare const fixIndex: (index: number, max?: number) => number;
/**
 * 因为宫位是从寅宫开始的排列的，所以需要将目标地支的序号减去寅的序号才能得到宫位的序号
 *
 * @param {EarthlyBranchName} earthlyBranch 地支
 * @returns {number} 该地支对应的宫位索引序号
 */
export declare const earthlyBranchIndexToPalaceIndex: (earthlyBranchName: EarthlyBranchName) => number;
/**
 * 配置星耀亮度
 *
 * @param {StarName} starName 星耀名字
 * @param {number} index 所在宫位索引
 */
export declare const getBrightness: (starName: StarName, index: number) => Brightness;
export declare const getMutagen: (starName: StarName, heavenlyStemName: HeavenlyStemName) => Mutagen;
export declare const getMutagensByHeavenlyStem: (heavenlyStemName: HeavenlyStemName) => StarName[];
/**
 * 处理地支相对于十二宫的索引，因为十二宫是以寅宫开始，所以下标需要减去地支寅的索引
 *
 * @param {EarthlyBranchName} earthlyBranch 地支
 * @returns {number} Number(0~11)
 */
export declare const fixEarthlyBranchIndex: (earthlyBranchName: EarthlyBranchName) => number;
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
export declare const fixLunarMonthIndex: (solarDateStr: string, timeIndex: number, fixLeap?: boolean) => number;
/**
 * 获取农历日期【天】的索引，晚子时将加一天，所以如果是晚子时下标不需要减一
 *
 * @param lunarDay 农历日期【天】
 * @param timeIndex 时辰索引
 * @returns {number} 农历日期【天】
 */
export declare const fixLunarDayIndex: (lunarDay: number, timeIndex: number) => number;
/**
 * 将多个星耀数组合并到一起
 *
 * @param {FunctionalStar[][][]} stars 星耀数组
 * @returns {FunctionalStar[][]} 合并后的星耀
 */
export declare const mergeStars: (...stars: FunctionalStar[][][]) => FunctionalStar[][];
/**
 * 将时间的小时转化为时辰的索引
 *
 * @param {number} hour 当前时间的小时数
 * @returns {number} 时辰的索引
 */
export declare const timeToIndex: (hour: number) => number;
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
export declare const getAgeIndex: (earthlyBranchName: EarthlyBranchName) => number;
/**
 * 返回翻译后的干支纪年字符串
 *
 * @param chineseDate 干支纪年日期对象
 * @returns 干支纪年字符串
 */
export declare const translateChineseDate: (chineseDate: HeavenlyStemAndEarthlyBranchDate) => string;
