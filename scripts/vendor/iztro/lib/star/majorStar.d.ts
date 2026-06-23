import FunctionalStar from './FunctionalStar';
import { AstrolabeParam } from '../data/types';
/**
 * 安主星，寅宫下标为0，若下标对应的数组为空数组则表示没有星耀
 *
 * 安紫微诸星诀
 * - 紫微逆去天机星，隔一太阳武曲辰，
 * - 连接天同空二宫，廉贞居处方是真。
 *
 * 安天府诸星诀
 * - 天府顺行有太阴，贪狼而后巨门临，
 * - 随来天相天梁继，七杀空三是破军。
 *
 * @param {AstrolabeParam} param 通用排盘参数
 * @returns {Array<Star[]>} 从寅宫开始每一个宫的星耀
 */
export declare const getMajorStar: (param: AstrolabeParam) => FunctionalStar[][];
