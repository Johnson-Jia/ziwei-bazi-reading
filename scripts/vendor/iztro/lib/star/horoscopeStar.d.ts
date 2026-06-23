import { Scope } from '../data/types';
import { HeavenlyStemName, EarthlyBranchName } from '../i18n';
import FunctionalStar from './FunctionalStar';
/**
 * 获取流耀
 *
 * 魁钺昌曲禄羊陀马鸾喜
 *
 * @param heavenlyStem 天干
 * @param earthlyBranch 地支
 */
export declare const getHoroscopeStar: (heavenlyStem: HeavenlyStemName, earthlyBranch: EarthlyBranchName, scope: Scope) => FunctionalStar[][];
