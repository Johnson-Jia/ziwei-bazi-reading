import { HeavenlyStemName, Mutagen, PalaceName, StarName } from '../i18n';
import { IFunctionalAstrolabe } from './FunctionalAstrolabe';
import { IFunctionalPalace } from './FunctionalPalace';
import { IFunctionalSurpalaces } from './FunctionalSurpalaces';
/**
 * 获取三方四正宫位，所谓三方四正就是传入的目标宫位，以及其对宫，财帛位和官禄位，总共四个宫位
 *
 * @version v1.1.0
 *
 * @param $ 星盘实例
 * @param indexOrName 宫位索引或者宫位名称
 * @returns 三方四正宫位
 */
export declare const getSurroundedPalaces: ($: IFunctionalAstrolabe, indexOrName: number | PalaceName) => IFunctionalSurpalaces;
/**
 * 获取星盘的某一个宫位
 *
 * @version v1.0.0
 *
 * @param $ 星盘实例
 * @param indexOrName 宫位索引或者宫位名称
 * @returns 宫位实例
 */
export declare const getPalace: ($: IFunctionalAstrolabe, indexOrName: number | PalaceName) => IFunctionalPalace | undefined;
/**
 * 判断某个宫位内是否有传入的星耀，要所有星耀都在宫位内才会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
export declare const hasStars: ($: IFunctionalPalace, stars: StarName[]) => boolean;
/**
 * 判断指定宫位内是否有生年四化
 *
 * @version v1.2.0
 *
 * @param $ 宫位实例
 * @param mutagen 四化名称【禄｜权｜科｜忌】
 * @returns true | false
 */
export declare const hasMutagenInPlace: ($: IFunctionalPalace, mutagen: Mutagen) => boolean;
/**
 * 判断指定宫位内是否没有生年四化
 *
 * @version v1.2.0
 *
 * @param $ 宫位实例
 * @param mutagen 四化名称【禄｜权｜科｜忌】
 * @returns true | false
 */
export declare const notHaveMutagenInPalce: ($: IFunctionalPalace, mutagen: Mutagen) => boolean;
/**
 * 判断某个宫位内是否有传入的星耀，要所有星耀都不在宫位内才会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
export declare const notHaveStars: ($: IFunctionalPalace, stars: StarName[]) => boolean;
/**
 * 判断某个宫位内是否有传入星耀的其中一个，只要命中一个就会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
export declare const hasOneOfStars: ($: IFunctionalPalace, stars: StarName[]) => boolean;
/**
 * 判断某一个宫位三方四正是否包含目标星耀，必须要全部包含才会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
export declare const isSurroundedByStars: ($: IFunctionalSurpalaces, stars: StarName[]) => boolean;
/**
 * 判断三方四正内是否有传入星耀的其中一个，只要命中一个就会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
export declare const isSurroundedByOneOfStars: ($: IFunctionalSurpalaces, stars: StarName[]) => boolean;
/**
 * 判断某一个宫位三方四正是否不含目标星耀，必须要全部都不在三方四正内含才会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
export declare const notSurroundedByStars: ($: IFunctionalSurpalaces, stars: StarName[]) => boolean;
export declare const mutagensToStars: (heavenlyStem: HeavenlyStemName, mutagens: Mutagen | Mutagen[]) => StarName[];
