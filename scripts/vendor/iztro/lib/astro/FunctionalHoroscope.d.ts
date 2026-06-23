import { Horoscope, Scope } from '../data/types';
import { Mutagen, PalaceName, StarName } from '../i18n';
import { IFunctionalAstrolabe } from './FunctionalAstrolabe';
import { IFunctionalSurpalaces } from './FunctionalSurpalaces';
import { IFunctionalPalace } from './FunctionalPalace';
export interface IFunctionalHoroscope extends Horoscope {
    astrolabe: IFunctionalAstrolabe;
    /**
     * 获取小限宫位
     *
     * @version v1.3.0
     *
     * @returns {IFunctionalPalace | undefined} 小限宫位
     */
    agePalace: () => IFunctionalPalace | undefined;
    /**
     * 获取运限宫位
     *
     * @version v1.3.0
     *
     * @param palaceName 宫位名称
     * @param scope 指定获取哪个运限的宫位
     * @returns {IFunctionalPalace | undefined} 指定宫位
     */
    palace: (palaceName: PalaceName, scope: Scope) => IFunctionalPalace | undefined;
    /**
     * 获取运限指定宫位的三方四正宫位
     *
     * @version v1.3.0
     *
     * @param palaceName 宫位名称
     * @param scope 指定获取哪个运限的宫位
     * @returns {IFunctionalSurpalaces | undefined} 指定宫位的三方四正
     */
    surroundPalaces: (palaceName: PalaceName, scope: Scope) => IFunctionalSurpalaces | undefined;
    /**
     * 判断在指定运限的宫位内是否包含流耀，需要全部包含才返回true
     *
     * @version v1.3.0
     *
     * @param palaceName 宫位名称
     * @param scope 指定获取哪个运限的宫位
     * @param horoscopeStar 流耀
     * @returns {boolean} 是否包含指定流耀
     */
    hasHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => boolean;
    /**
     * 判断指定运限宫位内是否不含流耀，需要全部不包含才返回true
     *
     * @version v1.3.2
     *
     * @param palaceName 宫位名称
     * @param scope 指定获取哪个运限的宫位
     * @param horoscope 流耀
     * @returns {boolean} 是否不含指定流耀
     */
    notHaveHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscope: StarName[]) => boolean;
    /**
     * 判断指定运限宫位内是否含有指定流耀，只要包含其中一颗就返回true
     *
     * @version v1.3.3
     *
     * @param palaceName 宫位名称
     * @param scope 指定获取哪个运限的宫位
     * @param horoscope 流耀
     * @returns {boolean} 是否含有（部分）指定流耀中
     */
    hasOneOfHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => boolean;
    /**
     * 判断指定运限宫位内是否存在运限四化
     *
     * @version v1.3.4
     *
     * @param palaceName 宫位名称
     * @param scope 指定获取哪个运限的宫位
     * @param horoscopeMutagen 运限四化
     * @returns {boolean} 是否含有运限四化
     */
    hasHoroscopeMutagen: (palaceName: PalaceName, scope: Scope, horoscopeMutagen: Mutagen) => boolean;
}
export default class FunctionalHoroscope implements IFunctionalHoroscope {
    lunarDate: string;
    solarDate: string;
    decadal: import("../data/types").HoroscopeItem;
    age: import("../data/types").HoroscopeItem & {
        nominalAge: number;
    };
    yearly: import("../data/types").HoroscopeItem & {
        yearlyDecStar: {
            jiangqian12: StarName[];
            suiqian12: StarName[];
        };
    };
    monthly: import("../data/types").HoroscopeItem;
    daily: import("../data/types").HoroscopeItem;
    hourly: import("../data/types").HoroscopeItem;
    astrolabe: IFunctionalAstrolabe;
    constructor(data: Horoscope, astrolabe: IFunctionalAstrolabe);
    agePalace: () => IFunctionalPalace | undefined;
    palace: (palaceName: PalaceName, scope: Scope) => IFunctionalPalace | undefined;
    surroundPalaces: (palaceName: PalaceName, scope: Scope) => IFunctionalSurpalaces;
    hasHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => boolean;
    notHaveHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => boolean;
    hasOneOfHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => boolean;
    hasHoroscopeMutagen: (palaceName: PalaceName, scope: Scope, horoscopeMutagen: Mutagen) => boolean;
}
