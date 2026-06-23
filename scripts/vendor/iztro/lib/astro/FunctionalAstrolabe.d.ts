import { Astrolabe, Plugin } from '../data/types';
import { EarthlyBranchName, PalaceName, StarName } from '../i18n';
import { IFunctionalStar } from '../star/FunctionalStar';
import { IFunctionalPalace } from './FunctionalPalace';
import { IFunctionalSurpalaces } from './FunctionalSurpalaces';
import { IFunctionalHoroscope } from './FunctionalHoroscope';
/**
 * 星盘类接口定义。
 *
 * 文档地址：https://docs.iztro.com/posts/astrolabe.html#functionalastrolabe
 */
export interface IFunctionalAstrolabe extends Astrolabe {
    /**
     * 插件注入方法
     *
     * @version v2.3.0
     *
     * @param plugin 插件函数
     */
    use(plugin: Plugin): void;
    /**
     * 获取运限数据
     *
     * @version v0.2.0
     *
     * @param date 阳历日期【可选】，默认为调用时的日期
     * @param timeIndex 时辰索引【可选】，默认会自动读取当前时间的时辰
     * @returns 运限数据
     */
    horoscope: (date?: string | Date, timeIndex?: number) => IFunctionalHoroscope;
    /**
     * 通过星耀名称获取到当前星耀的对象实例
     *
     * @version v1.2.0
     *
     * @param starName 星耀名称
     * @returns 星耀实例
     */
    star: (starName: StarName) => IFunctionalStar;
    /**
     * 获取星盘的某一个宫位
     *
     * @version v1.0.0
     *
     * @param indexOrName 宫位索引或者宫位名称
     * @returns 对应的宫位数据，若没有找到则返回undefined
     */
    palace: (indexOrName: number | PalaceName) => IFunctionalPalace | undefined;
    /**
     * 获取三方四正宫位，所谓三方四正就是传入的目标宫位，以及其对宫，财帛位和官禄位，总共四个宫位
     *
     * @version v1.1.0
     *
     * @param indexOrName 宫位索引或者宫位名称
     * @returns 三方四正宫位
     */
    surroundedPalaces: (indexOrName: number | PalaceName) => IFunctionalSurpalaces;
    /**
     *
     * 判断某一个宫位三方四正是否包含目标星耀，必须要全部包含才会返回true
     *
     * @version v1.0.0
     *
     * @param indexOrName 宫位索引或者宫位名称
     * @param stars 星耀名称数组
     * @returns true | false
     */
    isSurrounded: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;
    /**
     * 判断三方四正内是否有传入星耀的其中一个，只要命中一个就会返回true
     *
     * @version v1.1.0
     * @deprecated v1.2.0
     *
     * @param indexOrName 宫位索引或者宫位名称
     * @param stars 星耀名称数组
     * @returns true | false
     */
    isSurroundedOneOf: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;
    /**
     * 判断某一个宫位三方四正是否不含目标星耀，必须要全部都不在三方四正内含才会返回true
     *
     * @version v1.1.0
     * @deprecated v1.2.0
     *
     * @param indexOrName 宫位索引或者宫位名称
     * @param stars 星耀名称数组
     * @returns true | false
     */
    notSurrounded: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;
}
/**
 * 星盘类。
 *
 * 文档地址：https://docs.iztro.com/posts/astrolabe.html#functionalastrolabe
 */
export default class FunctionalAstrolabe implements IFunctionalAstrolabe {
    gender: string;
    solarDate: string;
    lunarDate: string;
    chineseDate: string;
    rawDates: {
        lunarDate: import("lunar-lite/lib/types").LunarDate;
        chineseDate: import("lunar-lite/lib/types").HeavenlyStemAndEarthlyBranchDate;
    };
    time: string;
    timeRange: string;
    sign: string;
    zodiac: string;
    earthlyBranchOfSoulPalace: EarthlyBranchName;
    earthlyBranchOfBodyPalace: EarthlyBranchName;
    soul: StarName;
    body: StarName;
    fiveElementsClass: import("../i18n").FiveElementsClassName;
    palaces: IFunctionalPalace[];
    copyright: string;
    private plugins;
    constructor(data: Astrolabe);
    use(plugin: Plugin): void;
    star: (starName: StarName) => IFunctionalStar;
    horoscope: (targetDate?: string | Date, timeIndexOfTarget?: number) => IFunctionalHoroscope;
    palace: (indexOrName: number | PalaceName) => IFunctionalPalace | undefined;
    surroundedPalaces: (indexOrName: number | PalaceName) => IFunctionalSurpalaces;
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
    isSurrounded: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;
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
    isSurroundedOneOf: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;
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
    notSurrounded: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;
}
