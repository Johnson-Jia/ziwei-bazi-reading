import { SoulAndBody, Decadal, AstrolabeParam } from '../data/types';
import { EarthlyBranchName, FiveElementsClassName, HeavenlyStemName, PalaceName } from '../i18n';
/**
 * 获取命宫以及身宫数据
 *
 * 1. 定寅首
 * - 甲己年生起丙寅，乙庚年生起戊寅，
 * - 丙辛年生起庚寅，丁壬年生起壬寅，
 * - 戊癸年生起甲寅。
 *
 * 2. 安命身宫诀
 * - 寅起正月，顺数至生月，逆数生时为命宫。
 * - 寅起正月，顺数至生月，顺数生时为身宫。
 *
 * @param {AstrolabeParam} param 通用排盘参数
 * @returns {SoulAndBody} 命宫和身宫数据
 */
export declare const getSoulAndBody: (param: AstrolabeParam) => SoulAndBody;
/**
 * 定五行局法（以命宫天干地支而定）
 *
 * 纳音五行计算取数巧记口诀：
 *
 * - 甲乙丙丁一到五，子丑午未一来数，
 * - 寅卯申酉二上走，辰巳戌亥三为足。
 * - 干支相加多减五，五行木金水火土。
 *
 * 注解：
 *
 * 1、五行取数：木1 金2 水3 火4 土5
 *
 *  天干取数：
 *  - 甲乙 ——> 1
 *  - 丙丁 ——> 2
 *  - 戊己 ——> 3
 *  - 庚辛 ——> 4
 *  - 壬癸 ——> 5
 *
 *  地支取数：
 *  - 子午丑未 ——> 1
 *  - 寅申卯酉 ——> 2
 *  - 辰戌巳亥 ——> 3
 *
 * 2、计算方法：
 *
 *  干支数相加，超过5者减去5，以差论之。
 *  - 若差为1则五行属木
 *  - 若差为2则五行属金
 *  - 若差为3则五行属水
 *  - 若差为4则五行属火
 *  - 若差为5则五行属土
 *
 * 3、举例：
 *  - 丙子：丙2 子1=3 ——> 水 ——> 水二局
 *  - 辛未：辛4 未1=5 ——> 土 ——> 土五局
 *  - 庚申：庚4 申2=6 ——> 6-5=1 ——> 木 ——> 木三局
 *
 * @param heavenlyStemName 天干
 * @param earthlyBranchName 地支
 * @returns 水二局 ｜ 木三局 ｜ 金四局 ｜ 土五局 ｜ 火六局
 */
export declare const getFiveElementsClass: (heavenlyStemName: HeavenlyStemName, earthlyBranchName: EarthlyBranchName) => FiveElementsClassName;
/**
 * 获取从寅宫开始的各个宫名
 *
 * @param fromIndex 命宫索引
 * @returns 从寅宫开始的各个宫名
 */
export declare const getPalaceNames: (fromIndex: number) => PalaceName[];
/**
 * 起大限
 *
 * - 大限由命宫起，阳男阴女顺行；
 * - 阴男阳女逆行，每十年过一宫限。
 *
 * @param solarDateStr 公历日期
 * @param timeIndex 出生时索引
 * @param gender 性别
 * @param fixLeap 是否修正闰月，若修正，则闰月前15天按上月算，后15天按下月算
 * @returns 从寅宫开始的大限年龄段
 */
export declare const getHoroscope: (param: AstrolabeParam) => {
    decadals: Decadal[];
    ages: number[][];
};
